import json
import os
import sys

try:
    import asyncio

    class Config(asyncio.Future):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._config = {'benchmarks': {}}

        def benchmarks(self):
            return self._config['benchmarks'].keys()

        def get_benchmark(self, benchmark):
            cfg = self._config['benchmarks'][benchmark]
            cfg['code'] = open(cfg['path']).read()
            return cfg
except:

    class Config:
        def __init__(self):
            self._config = {'benchmarks': {}}

        def benchmarks(self):
            return self._config['benchmarks'].keys()

        def get_benchmark(self, benchmark):
            cfg = self._config['benchmarks'][benchmark]
            cfg['code'] = open(cfg['path']).read()
            return cfg


class Reporter:

    def __init__(self):
        self.results = []
        self._environment = {
            'platform': sys.platform,
            'version': sys.version,
        }
        self._TODO_BENCHMARKS = []
        self._TODO_ENVIRON = []
        self._started = False

    def start(self):
        self._started = True

    def set_benchmarks_todo(self, benchmarks):
        self._TODO_BENCHMARKS = list(benchmarks)

    def set_env_info_todo(self, keys):
        self._TODO_ENVIRON = list(keys)

    def set_env_info(self, key, value):
        self._environment[key] = value
        self._process_event({
            'event_name': 'set environment key',
            'key': key,
            'value': value
        })
        if key in self._TODO_ENVIRON:
            self._TODO_ENVIRON.remove(key)
            self._conditionally_finish()

    def err_env_info(self, key, message):
        self._environment[key] = -1
        self._process_event({
            'event_name': 'error environment key',
            'key': key,
            'message': message
        })
        if key in self._TODO_ENVIRON:
            self._TODO_ENVIRON.remove(key)
            self._conditionally_finish()

    def start_benchmark(self, bench_name):
        self._process_event({
            'event_name': 'start benchmark',
            'benchmark': bench_name
        })

    def progress(self, job_name, fraction):
        self._process_event({
            'event_name': 'progress',
            'benchmark': job_name,
            'fraction': fraction
        })

    def error_benchmark(self, bench_name, message):
        self._process_event({
            'event_name': 'error benchmark',
            'benchmark': bench_name,
            'message': message
        })
        if bench_name in self._TODO_BENCHMARKS:
            self._TODO_BENCHMARKS.remove(bench_name)
            self._conditionally_finish()

    def finish_benchmark(self, bench_name, results):
        self._process_event({
            'event_name': 'finish benchmark',
            'benchmark': bench_name,
            'results': results
        })
        if bench_name in self._TODO_BENCHMARKS:
            self._TODO_BENCHMARKS.remove(bench_name)
            self._conditionally_finish()

    def finished(self):
        self._process_event({
            'event_name': 'results',
            'results': self.results
        })
        self._process_event({
            'event_name': 'environment info',
            'data': self._environment,
        })
        self._process_event({
            'event_name': 'finished'
        })

    def log(self, *args):
        self._process_event({
            'event_name': 'log',
            'args': args,
        })

    def _conditionally_finish(self):
        if len(self._TODO_BENCHMARKS) == 0 and len(self._TODO_ENVIRON) == 0 and self._started:
            self.finished()

    def _process_event(self, data):
        event_handler_name = 'on '+data['ev_name'].replace(' ', '_')
        event_handler = getattr(self, event_handler_name, None)
        if event_handler:
            event_handler(data)
        self._send(self, data)

    def _send(self, data):
        pass
