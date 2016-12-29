#!/usr/bin/env python3
import argparse
import datetime
import json
import logging
import os
import random
import sys
import subprocess
import string
import time

import cperf.ply

from cperf.bottle import Bottle, static_file, request

# List of files in benchmarks directory which are not benchmarks
IGNORE_LIST = ['header.py', 'bm_ai.py', 'pystone.py', 'pystone_proc8.py', 'util.py']

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
    if 'TRAVIS_COMMIT' in os.environ['TRAVIS_COMMIT']:
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
    def benchmark_list():
        base_path = '/'.join(['/static', BASE_DIR.split('/')[-2:], 'benchmarks'])
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
    logger.critical("Benchmark server quitting")


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
            data = json.loads(str(out, encoding='utf-8'))
        except:
            data = None
    except subprocess.TimeoutExpired:
        process.kill()
        data = None
    return data


def run_benchmarks(restrict_to='', skip='', n_runs=5):
    """
        Runs benchmarks in the browser and using cpython.
        Returns a triple consisting of browser & cpython results
        and the total run time.

        The benchmarks to run are optionally restricted
        to the ones in the `restrict_to` comma-separated list
        and any in the `skip` comma-separated list are skipped.
    """

    # Generate metadata
    githash = get_git_hash()
    rundate = str(datetime.datetime.now())
    start = time.time()
    runid = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(10))

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
        browser.get('http://localhost:8730/static/www/speed/cperf/static/brython_benchmarks.html')
    except Exception as ex:
        logger.critical("Encountered exception running chromium: "+str(ex))
        p.kill()
        return None

    # Get the results from the server output
    brython_results = load_json_from_pipe(p)

    # Run the benchmark on CPython
    args = [os.path.join(BASE_DIR, "cperf/benchmark.py")]
    environ['CONFIG'] = json.dumps({
        'benchmarks': find_benchmarks(restrict_to, skip),
        'n_runs': n_runs,
        'base_benchmark_path': os.path.join(BASE_DIR, 'benchmarks'),
    })

    p = subprocess.Popen(args, env=environ, stdout=subprocess.PIPE)
    cpython_results = load_json_from_pipe(p)
    cpython_results['info'].update({
        'runid': runid,
        'githash': get_git_hash()
    })
    stop = time.time()

    return (brython_results, cpython_results, stop-start)


INFO_COLS = ['runid', 'githash', 'rundate', 'platform', 'version', 'pystones', 'octane']
DATA_COLS = ['avg', 'dev', 'corr_dev', 'min', 'max', 'runs', 'messages']


def res_to_row(grids, info, result):
    name = result['name']
    row = {info[c] for c in INFO_COLS}.update({result[c] for c in DATA_COLS})
    if name not in grids:
        grids[name] = []
    grids[name].append(row)


def post_2_plotly(brython_results, cpython_results):
    grids = {}
    for bres in brython_results['results']:
        res_to_row(grids, brython_results['info'], bres)
    for bres in cpython_results['results']:
        res_to_row(grids, cpython_results['info'], bres)
    client = ply.Client(PLOTLY_USERNAME, PLOTLY_API_KEY)
    for grid, rows in grids.items():
        client.create_or_append(grid, INFO_COLS+DATA_COLS, rows)


def parse_args():
    parser = argparse.ArgumentParser(description='Run performance benchmarks')
    parser.add_argument('command', choices=['run_benchmark_server', 'run', 'list_benchmarks'],  default='run')

    parser.add_argument('--benchmarks',         help='run only given benchmarks (comma-separated list)', default='')
    parser.add_argument('--skip',               help='skip given benchmarks (comma-separated list)', default='')
    parser.add_argument('--post2plotly',        help='post results to plot.ly',                 default=False)
    parser.add_argument('--plotly_username',    help='plot.ly username',                        default=PLOTLY_USERNAME)
    parser.add_argument('--plotly_api_key',     help='plot.ly api_key',                         default=PLOTLY_API_KEY)

    parser.add_argument('--save2sqlite',        help='save results to a sqlite database',       default=False)
    parser.add_argument('--dbfile',             help='the sqlite database file to use',         default='benchmark_results.db')
    parser.add_argument('--format',             help='output format', choices=['json', 'txt'],  default='json')
    parser.add_argument('--output',     '-o',   help='save output to file',                     default=None)

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
        br, cp, runtime = run_benchmarks(args.benchmarks, args.skip)
        if args.post2plotly:
            PLOTLY_USERNAME = args.plotly_username
            PLOTLY_API_KEY = args.plotly_api_key
            post_2_plotly(br, cp)
        if args.save2sqlite:
            save2sqlite(args.dbfile, br, cp)
        if args.output is None:
            print(convert(br, cp, runtime, args.format))
        else:
            open(args.output, 'w').write(convert(br, cp, runtime, args.format))
    elif args.command == 'list_benchmarks':
        if args.format == 'json':
            print(json.dumps(find_benchmarks()))
        else:
            print('\n'.join(find_benchmarks()))

if __name__ == "__main__":
    main()
