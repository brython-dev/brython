#!/usr/bin/env python3
import argparse
from collections import OrderedDict
import datetime
import json
import logging
import os
import random
import sqlite3
import string
import subprocess
import sys
import time

from cperf.bottle import Bottle, static_file, request
import cperf.ply

# List of files in benchmarks directory which are not benchmarks
IGNORE_LIST = ['header.py', 'bm_ai.py', 'pystone.py', 'pystone_proc8.py', 'util.py', 'float.py']

# Default plot.ly credentials
PLOTLY_USERNAME = ""
PLOTLY_API_KEY = ""


# Setup Logging
FORMAT = '%(asctime)-15s %(message)s'
logging.basicConfig(level=logging.INFO, format=FORMAT)
logger = logging.getLogger(__name__)


# Get base directory
def up(start_dir, n):
    for i in range(n):
        start_dir = os.path.dirname(start_dir)
    return start_dir

BASE_DIR = up(os.path.abspath(__file__), 1)


def get_git_hash():
    if 'TRAVIS_COMMIT' in os.environ:
        # If we are running in TravisCI, get the commit id from the environment
        return os.environ['TRAVIS_COMMIT']
    else:
        # Otherwise use the output of `git rev-parse`
        return subprocess.check_output(['git', 'rev-parse', 'HEAD']).strip()


def find_benchmarks(restrict_to='', skip=''):
    """
        Return a list of benchmarks in the benchmarks
        subdirectory (optionally skipping those in the
        comma-separated list `skip` and including only
        those in the comma-separated list `restrict_to`)
    """
    res = []
    for fl in os.listdir(os.path.join(BASE_DIR, 'benchmarks')):
        if fl.endswith('.py'):
            if fl not in IGNORE_LIST:
                res.append(fl)
    res = set(res)
    if restrict_to != '':
        res.intersection_update(restrict_to.split(','))
    if skip != '':
        res.difference_update(skip.split(''))

    return list(set(res))


def benchmark_server(benchmark_list, n_runs=5):
    """
        A simple http server serving the static files
        needed to run the benchmarks in a browser.
        The server also collects final results (posted to /results)
        and outputs them to stdout.
    """
    octane_app = Bottle()

    @octane_app.route('/results', method='POST')
    def result():
        logger.info("Receiving Octane Results")
        res = json.loads(request.forms.get('results'))
        print(request.forms.get('results'))
        sys.stdout.flush()
        octane_app.close()
        os._exit(0)

    @octane_app.route('/log', method='POST')
    def result():
        res = json.loads(request.forms.get('log'))
        logger.info("Log: "+str(res))

    @octane_app.route('/config', method='GET')
    def config():
        base_path = '/'.join(['/static'] + BASE_DIR.split('/')[-2:] + ['benchmarks'])
        return json.dumps({
            'benchmarks': benchmark_list,
            'n_runs': n_runs,
            'base_benchmark_path': base_path,
        })

    @octane_app.route('/static/<filepath:path>')
    def static(filepath):
        return static_file(filepath, root=up(BASE_DIR, 2))

    logger.info("Starting Benchmark Server")
    octane_app.run(host='localhost', port=8730)
    logger.info("Benchmark server quitting")


def load_json_from_pipe(process):
    """
        Parse stdout of process `process` as JSON
        and return it.
    """
    try:
        out, err = process.communicate()
        process.wait(timeout=300)
        data = None
        try:
            sys.stderr.flush()
            data = json.loads(str(out, encoding='utf-8'))
        except:
            data = None
    except subprocess.TimeoutExpired:
        process.kill()
        data = None
    return data


def run_benchmarks(restrict_to='', skip='', only=None, n_runs=5):
    """
        Runs benchmarks in the browser and using cpython.
        Returns a triple consisting of browser & cpython results
        and the total run time.

        The benchmarks to run are optionally restricted
        to the ones in the `restrict_to` comma-separated list
        and any in the `skip` comma-separated list are skipped.
    """

    # Generate metadata
    start = time.time()
    githash = get_git_hash()
    rundate = str(datetime.datetime.now())
    runid = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

    if only != 'cpython':
        # Run the Brython benchmark
        br_start = time.time()

        # Run the server serving the benchmark files & collecting the results
        args = [sys.argv[0]] + ["run_benchmark_server"]
        if restrict_to != '':
            args.append("--benchmarks")
            args.append(restrict_to)
        if skip != '':
            args.append("--skip")
            args.append(skip)

        environ = os.environ.copy()
        p = subprocess.Popen(args, env=environ, stdout=subprocess.PIPE)

        # Start the benchmark
        try:
            logger.info("Running benchmarks")
            from selenium import webdriver
            browser = webdriver.Chrome()
            browser.get('http://localhost:8730/static/www/speed/cperf/html/brython_benchmarks.html')
            ok = True
        except Exception as ex:
            ok = False
            logger.warn("Encountered exception running chromium: "+str(ex))
            p.kill()
            brython_results = None
            only = 'cpython'
            return None
        if ok:
            # Get the results from the server output
            brython_results = load_json_from_pipe(p)
            br_stop = time.time()
            brython_results['info'].update({
                'runid': runid,
                'githash': githash,
                'br_runtime': br_stop-br_start,
                'cp_runtime': -1,
            })
    else:
        brython_results = None

    if only != 'brython':
        # Run the benchmark on CPython
        cp_start = time.time()
        args = [os.path.join(BASE_DIR, "cperf/benchmark.py")]
        environ = os.environ.copy()
        environ['CONFIG'] = json.dumps({
            'benchmarks': find_benchmarks(restrict_to, skip),
            'n_runs': n_runs,
            'base_benchmark_path': os.path.join(BASE_DIR, 'benchmarks'),
        })

        try:
            out = str(subprocess.check_output(args, env=environ), encoding='utf-8')
            cpython_results = json.loads(out)
        except Exception as ex:
            logger.critical("Exception during CPython: "+str(ex)+"(output='"+out+"')")
        cp_stop = time.time()

        cpython_results['info'].update({
            'runid': runid,
            'githash': githash,
            'br_runtime': -1,
            'cp_runtime': cp_stop-cp_start,
        })
    else:
        cpython_results = None

    stop = time.time()

    if only != 'cpython':
        brython_results['info'].update({
            'runtime': stop-start,
        })
    if only != 'brython':
        cpython_results['info'].update({
            'runtime': stop-start,
        })

    return (runid, brython_results, cpython_results, stop-start)


INFO_COLS = ['runid', 'githash', 'rundate', 'runtime', 'cp_runtime', 'br_runtime',
             'setuptime', 'brython_startup', 'platform', 'version', 'pystones', 'octane']
DATA_COLS = ['avg', 'dev', 'corr_dev', 'min', 'max', 'runs', 'messages']


def res_to_row(grids, info, result):
    name = result['name']
    row = {info[c] for c in INFO_COLS}.update({result[c] for c in DATA_COLS})
    if name not in grids:
        grids[name] = []
    grids[name].append(row)


def post_2_plotly(brython_results, cpython_results):
    grids = {}
    if brython_results is not None:
        for bres in brython_results['results']:
            res_to_row(grids, brython_results['info'], bres)
    if cpython_results is not None:
        for bres in cpython_results['results']:
            res_to_row(grids, cpython_results['info'], bres)
    client = ply.Client(PLOTLY_USERNAME, PLOTLY_API_KEY)
    for grid, rows in grids.items():
        client.create_or_append(grid, INFO_COLS+DATA_COLS, rows)


DB_META_COLS = {
    'runid': 'text',
    'githash': 'text',
    'rundate': 'text',
    'runtime': 'real',
    'octane': 'real',
    'brystones': 'real',
    'cpystones': 'real',
    'brython_setup': 'real',
    'brython_startup': 'real',
    'cpython_setup': 'real',
    'score': 'real',
    'benchmarks': 'text',
    'brython_sys_version': 'text',
    'cpython_sys_version': 'text',
    'platforms': 'text',
}
DB_DATA_COLS = {
    'avg': 'real',
    'dev': 'real',
    'corr_dev': 'real',
    'min': 'real',
    'max': 'real',
    'runs': 'integer',
    'messages': 'text'
}

DB_SCHEMA_SQL = """
CREATE TABLE benchmark_runs (
    id integer primary key autoincrement,
""" + ','.join(DB_META_COLS)+"""
);

CREATE TABLE benchmarks (
    name text,
    date_added text
);

"""

BENCHMARK_TABLE_SCHEMA_SQL = """
CREATE TABLE `{benchmark_name}` (
    id integer primary key autoincrement,
    runid text,
    platform,
"""+','.join(DB_DATA_COLS)+""",
    FOREIGN KEY(runid) REFERENCES benchmark_runs(runid)
)
"""


def ensure_db(db_file):
    create_db = not os.path.isfile(db_file)
    conn = sqlite3.connect(db_file)
    if create_db:
        c = conn.cursor()
        c.executescript(DB_SCHEMA_SQL)
        conn.commit()
    return conn


def ensure_bench(conn, bench_name):
    c = conn.cursor()
    c.execute("SELECT * FROM benchmarks WHERE name = ? ", (bench_name,))
    have = False
    for row in c:
        have = True
    if not have:
        c.execute(BENCHMARK_TABLE_SCHEMA_SQL.format(benchmark_name=bench_name))
        c.execute("INSERT INTO benchmarks (name, date_added) VALUES (?, datetime())", (bench_name,))
        conn.commit()


def insert(conn, table, data):
    col_names = ','.join(data.keys())
    replace = ','.join(['?']*len(data))
    SQL = "INSERT INTO `{table}` ({col_names}) VALUES ({replace})".format(
        col_names=col_names,
        replace=replace,
        table=table)
    c = conn.cursor()
    c.execute(SQL, tuple(data.values()))
    conn.commit()


def insert_meta(conn, brython_results, cpython_results):
    platforms = []
    data = OrderedDict({})
    if brython_results is not None:
        info = brython_results['info']
        platforms.append('brython')
        data['brystones'] = info['pystones']
        data['brython_startup'] = info['brython_startup']
        data['brython_setup'] = info['setup_time']
        data['brython_sys_version'] = info['version']
        for k in DB_META_COLS.keys():
            if k in info and str(info[k]) != '-1':
                data[k] = info[k]
    if cpython_results is not None:
        info = cpython_results['info']
        platforms.append('cpython')
        data['cpystones'] = info['pystones']
        data['cpython_setup'] = info['setup_time']
        data['cpython_sys_version'] = info['version']
        for k in DB_META_COLS.keys():
            if k in info and str(info[k]) != '-1':
                data[k] = info[k]
    insert(conn, 'benchmark_runs', data)


def insert_data(conn, benchmark, platform, runid, results):
    data = OrderedDict({'runid': runid})
    for k in DB_DATA_COLS.keys():
        if k in results:
            data[k] = results[k]
    data['platform'] = platform
    ensure_bench(conn, benchmark)
    insert(conn, benchmark, data)


def save2sqlite(runid, brython_results, cpython_results, db_file):
    conn = ensure_db(db_file)
    insert_meta(conn, brython_results, cpython_results)
    if brython_results is not None:
        for bench in brython_results['results']:
            insert_data(conn, bench['name'], 'brython', runid, bench)
    if cpython_results is not None:
        for bench in cpython_results['results']:
            insert_data(conn, bench['name'], 'cpython', runid, bench)


def convert(runid, br, cp, runtime, format):
    if format == 'json':
        info = {}
        info.update(br['info'])

        return json.dumps({
            'brython': br,
            'cpython': cp,
            'info': info
        })
    else:
        if br is not None:
            githash = br['githash']
            octane = round(float(br['info']['octane'])/1000, 4)
            runtime = round(br['info']['runtime'], 4)
            runtimerel = "("+str(round(runtime/octane, 4))+" relative)"
            brsum = round(sum([float(b['avg']) for b in br['results'] if float(b['avg']) > 0]), 4)
            brtestsrel = "("+str(round(brsum/octane, 4))+" relative)"
            brsetuprel = "("+str(round(br['info']['setup_time']/octane, 4))+" relative)"
            brstartuprel = "("+str(round(br['info']['brython_startup']/octane, 4))+" relative)"
            brruntimerel = "("+str(round(br['info']['br_runtime']/octane, 4))+" relative)"
            BR = """
------------------------------------------------
                    Brython
------------------------------------------------
    Octane: {octane}
    PyStones: {brstones}
    Sum of Test Avgs: {brtests} {brtestsrel}
    Benchmark Setup: {brsetup} {brsetuprel}
    Brython Startup: {brstartup} {brstartuprel}
    Total Runtime: {brruntime} {brruntimerel}""".format(
                    octane=octane*1000,
                    brstones=int(br['info']['pystones']),
                    brtests=brsum, brtestsrel=brtestsrel,
                    brsetup=round(br['info']['setup_time'], 4), brsetuprel=brsetuprel,
                    brstartup=round(br['info']['brython_startup'], 4), brstartuprel=brstartuprel,
                    brruntime=round(br['info']['br_runtime'], 4), brruntimerel=brruntimerel
            )
        else:
            BR = ""
        if cp is not None:
            githash = br['githash']
            if br is not None:
                octane = round(float(br['info']['octane'])/1000, 4)
            else:
                octane = -1
            cpsum = round(sum([float(b['avg']) for b in cp['results'] if float(b['avg']) > 0]), 4)
            runtime = round(cp['info']['runtime'], 4)
            if octane > -1:
                runtimerel = "("+str(round(runtime/octane, 4))+" relative)"
                cptestsrel = "("+str(round(cpsum/octane, 4))+" relative)"
                cpsetuprel = "("+str(round(cp['info']['setup_time']/octane, 4))+" relative)"
                cpruntimerel = "("+str(round(cp['info']['cp_runtime']/octane, 4))+" relative)"
            else:
                runtimerel = ""
                cptestsrel = ""
                cpsetuprel = ""
                cpruntimerel = ""
            CP = """
------------------------------------------------
                    CPython
------------------------------------------------
    PyStones: {cpstones}
    Sum of Test Avgs: {cptests} {cptestsrel}
    Benchmark Setup {cpsetup} {cpsetuprel}
    Total Runtime: {cpruntime} {cpruntimerel}""".format(
                    cpstones=int(cp['info']['pystones']),
                    cptests=cpsum, cptestsrel=cptestsrel,
                    cpsetup=round(cp['info']['setup_time'], 4), cpsetuprel=cpsetuprel,
                    cpruntime=round(cp['info']['cp_runtime'], 4), cpruntimerel=cpruntimerel
            )
        else:
            CP = ""
        TOT = """
------------------------------------------------
    Commit ID: {githash}
    Run ID: {runid}
    Total Runtime: {runtime} {runtimerel}
------------------------------------------------
""".format(githash=githash, runid=runid, runtime=runtime, runtimerel=runtimerel)
        return BR+CP+TOT


def parse_args():
    parser = argparse.ArgumentParser(description='Run performance benchmarks')
    parser.add_argument('command', choices=['run_benchmark_server', 'run', 'list_benchmarks'],  default='run')

    parser.add_argument('--only',  choices=['cpython', 'brython'], help='run only the given engine', default=None)
    parser.add_argument('--benchmarks',         help='run only given benchmarks (comma-separated list)', default='')
    parser.add_argument('--skip',               help='skip given benchmarks (comma-separated list)', default='')
    parser.add_argument('--runs', type=int,     help='run each benchmark given number of times', default=5)

    parser.add_argument('--post2plotly',        help='post results to plot.ly',                 action='store_true')
    parser.add_argument('--plotly_username',    help='plot.ly username',                        default=PLOTLY_USERNAME)
    parser.add_argument('--plotly_api_key',     help='plot.ly api_key',                         default=PLOTLY_API_KEY)

    parser.add_argument('--save2sqlite',        help='save results to a sqlite database',       action='store_true')
    parser.add_argument('--dbfile',             help='the sqlite database file to use',         default='benchmark_results.db')

    parser.add_argument('--format',             help='output format', choices=['json', 'txt'],  default='json')
    parser.add_argument('--output',     '-o',   help='save output to file',                     default=None)

    parser.add_argument('--verbose',    '-v',   help='be verbose', action='count',              default=0)

    return parser.parse_args()


def main():
    args = parse_args()
    logger.setLevel(logging.ERROR-args.verbose*10)
    if args.command == 'run_benchmark_server':
        blist = find_benchmarks(args.benchmarks, args.skip)
        benchmark_server(blist)
    elif args.command == 'run':
        runid, br, cp, runtime = run_benchmarks(args.benchmarks, args.skip, args.only, args.runs)
        if args.post2plotly:
            PLOTLY_USERNAME = args.plotly_username
            PLOTLY_API_KEY = args.plotly_api_key
            post_2_plotly(br, cp)
        if args.save2sqlite:
            save2sqlite(runid, br, cp, args.dbfile)
        if args.output is None:
            print(convert(runid, br, cp, runtime, args.format))
        else:
            open(args.output, 'w').write(convert(br, cp, runtime, args.format))
    elif args.command == 'list_benchmarks':
        if args.format == 'json':
            print(json.dumps(find_benchmarks(args.benchmarks, args.skip)))
        else:
            print('\n'.join(find_benchmarks(args.benchmarks, args.skip)))

if __name__ == "__main__":
    main()
