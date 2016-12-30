#!/usr/bin/env python3

from time import time
setup_time = 0
start_setup = time()

import asyncio
import io
import json
import logging
import math
import os
import sys

logger = logging.getLogger(__name__)

if sys.platform == 'brython':
    from asyncio.timer import ImmediateFuture
    from browser import ajax, html, window, console, document as doc
    from pystone import pystones
else:

    from benchmarks.pystone import pystones

    # Python standard lib only has ensure_future
    # starting from version 3.4
    if not hasattr(asyncio, 'ensure_future'):
        asyncio.ensure_future = asyncio.async

    class ImmediateFuture(asyncio.Future):
        """
            Stub for CPython use, wraps a regular function in a Future
        """
        def __init__(self, func, *args, **kwargs):
            super().__init__()
            self._func = func
            self._args = args
            self._kwargs = kwargs
            self._loop = asyncio.get_event_loop()
            self._loop.call_soon(self.do)

        def do(self):
            try:
                res = self._func(*self._args, **self._kwargs)
                self.set_result(res)
            except Exception as ex:
                self.set_exception(ex)

# Get the benchmark configuration
if sys.platform == 'brython':
    config = json.loads(open('/config').read())
else:
    config = json.loads(os.environ['CONFIG'])

benchmarks = config['benchmarks']
N_RUNS = config['n_runs']
base_path = config['base_benchmark_path']

# benchmarks = [
#    "assignment.py",
#    "augm_assign.py",
#    "assignment_float.py",
#    "build_dict.py",
#    "add_dict.py",
#    "set_dict_item.py",
#    "build_list.py",
#    "set_list_item.py",
#    "add_integers.py",
#    "add_strings.py",
#    "str_of_int.py",
#    "create_function_no_arg.py",
#    "create_function_single_pos_arg.py",
#    "create_function_complex_args.py",
#    "function_call.py",
#    "function_call_complex.py",
#    "create_class_simple.py",
#    "create_class_with_init.py",
#    "create_instance_simple_class.py",
#    "create_instance_with_init.py",
#    "bm_ai.py",
# ]


class Reporter:
    PROGRESS_BAR = """
    <div class="progress right">
        <div class="progress-bar" role='progressbar' style="width: 0%%;" id="%s"></div>
    </div>
    """

    @classmethod
    def get_row_start(cls, bench_name):
        return html.TR("<td>"+bench_name+"</td><td>"+cls.PROGRESS_BAR % bench_name+"</td>")

    def __init__(self):
        self.results = []
        if sys.platform == 'brython':
            doc['loading_brython'].style.display = 'none'
            doc['running_brython'].style.display = 'block'
            doc['br-version'].innerHTML = sys.version
            self.tbody = doc["results"]

    def start_benchmark(self, bench_name):
        self.log("Starting benchmark", bench_name)
        self.current_bench = bench_name
        if sys.platform == 'brython':
            self.current_row = self.get_row_start(bench_name)
            self.tbody <= self.current_row

    def finish_benchmark(self, results):
        self.results.append(results)
        if sys.platform == 'brython':
            for k in ['avg', 'dev', 'corr_dev', 'min', 'max', 'runs', 'messages']:
                self.current_row <= html.TD(results[k])
        self.log("Benchmark results:", results)

    def set_progress(self, fraction):
        percent = str(fraction*100)
        if sys.platform == 'brython':
            elt = doc[self.current_bench]
            elt.style.width = percent+"px"

    def log(self, *args):
        logger.warn(' '.join([str(a) for a in args]))
        if sys.platform == 'brython':
            req = ajax.ajax()
            req.open('POST', '/log', True)
            req.set_header('content-type', 'application/x-www-form-urlencoded')
            req.send({'log': json.dumps(args)})

    def post_results(self):
        self.log("Posting results")
        bench_time, stones = pystones()
        info = {
            'pystones': stones,
            'platform': sys.platform,
            'version': sys.version,
            'octane': -1,
            'setup_time': round(setup_time, 4),
            'brython_startup': -1,
        }
        data = {
            'info': info,
            'results': self.results
        }
        if sys.platform == 'brython':
            if window.octane_score == -1:
                window.on_octane_finished = self.post_results
                return None
            info['octane'] = window.octane_score
            info['startup'] = window.brython_startup
            req = ajax.ajax()
            req.open('POST', '/results', True)
            req.set_header('content-type', 'application/x-www-form-urlencoded')
            req.send({'results': json.dumps(data), 'format': 'json'})
        else:
            print(json.dumps(data))
            exit(0)

report = Reporter()


def single_run(code):
    try:
        old_stdout = sys.stdout
        sys.stdout = buf = io.StringIO()
        start = time()
        exec(code, {}, {})
        run_time = time()-start
        return run_time
    finally:
        sys.stdout = old_stdout


@asyncio.coroutine
def timeit(code, n_runs):
    max_time = 0
    min_time = float("inf")
    sum = 0
    squared_sum = 0
    for i in range(n_runs):
        run_time = yield from ImmediateFuture(single_run, code)
        sum += run_time
        squared_sum += run_time**2
        if run_time < min_time:
            min_time = run_time
        if run_time > max_time:
            max_time = run_time
        report.set_progress((i+1)/n_runs)
    avg = sum/n_runs
    corr_std_dev = math.sqrt((squared_sum - 2*avg*sum + n_runs*(avg**2))/(n_runs-1))
    std_dev = math.sqrt((squared_sum - 2*avg*sum + n_runs*(avg**2))/n_runs)
    return avg, std_dev, corr_std_dev, min_time, max_time, ''


@asyncio.coroutine
def run_benchmark(file_name, n_runs):
    report.log("Running benchmark", file_name)
    b_src = open(os.path.join(base_path, file_name)).read()
    try:
        a = yield from timeit(b_src, n_runs)
        avg, dev, corr, min, max, msgs = a
    except Exception as Exc:
        avg, dev, corr, min, max, msgs = -1, -1, -1, -1, -1, 'Exception during run: '+str(Exc)
    return {
        'name': file_name,
        'avg': round(avg, 4),
        'dev': round(dev, 4),
        'corr_dev': round(corr, 4),
        'min': round(min, 4),
        'max': round(max, 4),
        'runs': n_runs,
        'messages': msgs
    }


@asyncio.coroutine
def run_all(n_runs):
    try:
        for b_path in benchmarks:
            report.start_benchmark(b_path)
            try:
                b_res = yield from run_benchmark(b_path, n_runs)
            except Exception as ex:
                logging.warn(str(ex))
                b_res = {}
            report.finish_benchmark(b_res)
        report.post_results()
    except Exception as ex:
        logging.warn(str(ex))
        report.log(ex)


def run_suite():
    event_loop = asyncio.get_event_loop()
    asyncio.ensure_future(run_all(N_RUNS))
    event_loop.run_forever()

stop_setup = time()
setup_time = stop_setup-start_setup

run_suite()
