import json
import os
import sys


class BenchmarkWebServer:

    def quit(self):
        sys.stdout.flush()
        os._exit(0)

    def process_event(self, event):
        print(json.dumps())
        if self.event['event_name'] == 'finished':
            self.quit()

    def __init__(self):
        super().__init__()
        self._config = json.loads(str(os.environ['CONFIG'], encoding='utf-8'))
        self._bench_to_path = {}
        for bench_name, bench_cfg in self._config['benchmarks'].items():
            self._bench_to_path[bench_name] = bench_cfg['path']
            bench_cfg['path'] = '/code/'+bench_name

    def run(self):
        from ..utils.bottle import Bottle, static_file, request
        self._brython_app = Bottle()

        @brython_app.route('/code/<benchmark>')
        def static(benchmark):
            return open(self._bench_to_path[benchmark], 'r').read()

        @brython_app.route('/config', method='GET')
        def config():
            return json.dumps(self._config)

        @brython_app.route('/event', method='POST')
        def event():
            ev = json.loads(request.forms.get('event'))
            self.process_event(ev)

        @octane_app.route('/static/suite_runner.py')
        def suite():
            return open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'suite_runner.py', 'r')).read()

        @octane_app.route('/static/lib/cperf/<filepath:path>')
        def static(filepath):
            return static_file(filepath, root=os.path.dirname(os.path.dirname(__file__)))

        @octane_app.route('/static/<filepath:path>')
        def static(filepath):
            return static_file(filepath, root=os.path.join(os.path.dirname(__file__), 'html'))

        environ = os.environ.copy()
        environ['ACTION'] = 'run browser'
        environ['BROWSER'] = 'chrome'
        self._browser = subprocess.Popen(__file__, env=environ)

        self._brython_app.run(host='localhost', port=8730)

    def quit(self):
        self._brython_app.close()
        try:
            self._browser.kill()
        except:
            pass
        sys.stdout.flush()
        os._exit(0)

if __name__ == "__main__":
    action = os.environ.get('ACTION', 'run server')
    if action == 'run server':
        server = BenchmarkWebServer()
        server.run()
    else:
        from selenium import webdriver
        browser_name = os.environ.get('BROWSER', 'chrome')
        if browser_name == 'chrome':
            browser = webdriver.Chrome()
            browser.get('http://localhost:8730/static/brython_benchmarks.html')
        elif browser_name == 'firefox':
            browser = webdriver.Firefox()
            browser.get('http://localhost:8730/static/brython_benchmarks.html')
        elif browser_name == 'opera':
            browser = webdriver.Opera()
            browser.get('http://localhost:8730/static/brython_benchmarks.html')
