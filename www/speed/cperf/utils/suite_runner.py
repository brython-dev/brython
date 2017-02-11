#!/usr/bin/env python3

from time import time
setup_time = 0
start_setup = time()

import io
import math
import sys


from cperf.platforms import Reporter, Config, _ASYNC, asyncio, ImmediateFuture
from cperf.utils.pystone import pystones


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


class Suite:
    def __init__(self):
        self._reporter = Reporter()
        self._reporter.set_env_info('setup_time', setup_time)
        self._reporter.set_env_info('pystones', pystones.pystones())

    @asyncio.coroutine
    def run_benchmark(self, benchmark):
        max_time = 0
        min_time = float("inf")
        sum = 0
        squared_sum = 0
        code = benchmark['code']
        n_runs = benchmark.get('n_runs', self._config['default_n_runs'])
        for i in range(n_runs):
            if _ASYNC:
                run_time = yield from ImmediateFuture(single_run, code)
            else:
                run_time = single_run(code)
            sum += run_time
            squared_sum += run_time**2
            if run_time < min_time:
                min_time = run_time
            if run_time > max_time:
                max_time = run_time
            self._reporter.set_progress((i+1)/n_runs)
        avg = sum/n_runs
        corr_std_dev = math.sqrt((squared_sum - 2*avg*sum + n_runs*(avg**2))/(n_runs-1))
        std_dev = math.sqrt((squared_sum - 2*avg*sum + n_runs*(avg**2))/n_runs)
        return {
            'avg': round(avg, 4),
            'dev': round(std_dev, 4),
            'corr_dev': round(corr_std_dev, 4),
            'min': round(min, 4),
            'max': round(max, 4),
        }

    @asyncio.coroutine
    def run(self):
        if _ASYNC:
            self._config = yield from Config()
        else:
            self._config = Config()
        self._reporter.set_benchmarks_todo(self._config['benchmarks'].keys())
        self._reporter.start()
        for bench_name, bench_config in self._config['benchmarks']:
            self._reporter.log("Downloading", bench_name)
            try:
                if _ASYNC:
                    benchmark = yield from self._config.get_benchmark(bench_name)
                else:
                    benchmark = self._config.get_benchmark(bench_name)
                self._reporter.start_benchmark(bench_name)
                if _ASYNC:
                    b_res = yield from self.run_benchmark(benchmark)
                else:
                    b_res = self.run_benchmark(benchmark)
                self._reporter.finish_benchmark(b_res)
            except Exception as ex:
                self._reporter.error_benchmark(bench_name, "Error loading/runnning:"+str(ex))


def run_suite():
    suite = Suite()
    if _ASYNC:
        event_loop = asyncio.get_event_loop()
        asyncio.ensure_future(suite.run())
        event_loop.run_forever()
    else:
        suite.run()


stop_setup = time()
setup_time = stop_setup-start_setup

run_suite()
