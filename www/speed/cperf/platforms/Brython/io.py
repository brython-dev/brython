import json
import sys

from ajax import ajax
from browser import console
from browser import document as doc
from browser import window
from browser import html

from .abstract_io import Config, Reporter, Runner


try:
    import asyncio
    from asyncio.timer import ImmediateFuture
    _ASYNC = True

    class BrythonAsyncConfig(Config):

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            config_req = asyncio.HTTPRequest('/config')
            config_req.add_done_callback(self._load_config)

        def _load_config(self, req):
            self._config = json.loads(req.result)
            self._benchmarks_code = {}
            for bench_name, bench_cfg in self._config['benchmarks'].items():
                self._benchmarks_code[bench_name] = asyncio.HTTPRequest(bench_cfg['path'])
            self.set_result(self)

        def benchmarks(self):
            return self._config['benchmarks'].keys()

        @asyncio.coroutine
        def get_benchmark(self, benchmark):
            cfg = self._config['benchmarks'][benchmark]
            cfg['code'] = yield from self._benchmarks_code[benchmark]
            return cfg

    PlatformConfig = BrythonAsyncConfig

except:
    _ASYNC = False
    ImmediateFuture = None

    class BrythonConfig(Config):

        def __init__(self):
            self._config = json.loads(open('/config').read())

    PlatformConfig = BrythonConfig


class BrythonReporter(Reporter):
    PROGRESS_BAR = """
    <div class="progress right">
        <div class="progress-bar" role='progressbar' style="width: 0%%;" id="%s"></div>
    </div>
    """

    @classmethod
    def get_row_start(cls, bench_name):
        return html.TR("<td>"+bench_name+"</td><td>"+cls.PROGRESS_BAR % bench_name+"</td>")

    def __init__(self):
        super().__init__()
        from brython import document as doc
        from ajax import ajax
        self._tbody = doc["results"]
        self._bench_rows = {}
        doc['loading_brython'].style.display = 'none'
        doc['running_brython'].style.display = 'block'
        doc['br-version'].innerHTML = sys.version
        self.set_env_info_todo(['octane', 'brython_startup_time'])

        if window.octane_score == -1:
            window.on_octane_finished = self._set_octane()

        self.set_env_info('brython_startup_time', window.brython_startup)

    def _set_octane(self):
        console.log("Octane", octane)
        self.set_env_info('octane', window.octane_score)

    def _send(self, data):
        console.log(data)
        req = self._ajax.ajax()
        req.open('POST', '/event', True)
        req.set_header('content-type', 'application/x-www-form-urlencoded')
        req.send({'event': json.dumps(data)})

    def on_start_benchmark(self, event):
        row = self.get_row_start(event['benchmark'])
        self._tbody <= row
        self._bench_rows[event['benchmark']]

    def on_finish_benchmark(self, event):
        results = event['results']
        benchmark = event['benchmark']
        row = self._bench_rows[benchmark]
        for k in ['avg', 'dev', 'corr_dev', 'min', 'max', 'runs', 'messages']:
            row <= html.TD(results[k])

    def on_progress(self, event):
        percent = str(event['fraction']*100)
        elt = doc[self.current_bench]
        elt.style.width = percent+"px"

PlatformReporter = BrythonReporter
