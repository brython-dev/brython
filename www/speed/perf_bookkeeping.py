import sys
import json
from browser import window, ajax, html, alert, document as doc
import time
import traceback
import highlight

class bookkeeping:
  def __init__(self):
      self._timings={}
      self._filename=None

  def set_performance_test(self, filename):
      self._filename=filename

  def run_performance_test(self, src):
      #execute code
      t0 = time.perf_counter()
      try:
        exec(src)
        state = 1
      except Exception as exc:
        traceback.print_exc(file=sys.stderr)

      self.add_brython_result(int((time.perf_counter() - t0) * 1000.0))
      src = src.replace('\r\n','\n')

      self._timings[self._filename]['code'] = src

      def err_msg(*args):
          from browser import console
          console.log(args)

      #also run this for cpython via cgi-bin
      # run with CPython
      req = ajax.ajax()
      req.bind('complete',self.on_cpython_complete)
      req.set_timeout(4,err_msg)
      req.open('POST','/cgi-bin/script_timer.py',False)
      req.set_header('content-type','application/x-www-form-urlencoded')
      req.send({'filename': self._filename})

      return state

  def on_cpython_complete(self, e):
      _dict=json.loads(e.text)
      filename=_dict['filename']
      self._timings[filename]['cpython']=_dict['timing']
      self.cpython_version = _dict['version']

  def add_brython_result(self, timing):
      if self._filename not in self._timings:
         self._timings[self._filename]={}

      self._timings[self._filename]['brython']=timing

  def upload_results(self, on_complete=None, on_error=None):
      """ upload timing results to 'speed' server"""

      def on_complete1(*args):
          print('upload successful')

      def on_error1(*args):
          print('upload not successful')
          print(args)

      if on_complete is None:
         on_complete=on_complete1

      if on_error is None:
         on_error=on_error1
      #make sure that cpython has returned for all benchmarks..
      while 1:
        _flag=True
        for _filename in self._timings.keys():
            if not 'cpython' in self._timings[_filename]:
               _flag=False

        if _flag:
           break

      #if we got here, cpython has returned results for all benchmarks.

      _data={'timings': self._timings}
      _data['userAgent'] = window.navigator.userAgent
      _v=sys.implementation.version
      _data['brython_version']= '%s.%s.%s' % (_v.major, _v.minor, _v.micro)

      def on_complete(*args):
          doc['container'] <= html.PRE('Results are in milliseconds (ms)')
          doc['container'] <= html.PRE('Browser Version:%s' % window.navigator.userAgent)
          _v=sys.implementation.version
          doc['container'] <= html.PRE('Brython Version:%s.%s.%s' % (_v.major, _v.minor, _v.micro))

          _table=html.TABLE()
          _tr=html.TR()
          _tr <= html.TH('Benchmark')
          _tr <= html.TH('Brython')
          _tr <= html.TH('CPython')
          _tr <= html.TH('Difference')
          _tr <= html.TH('X Faster')
          _table <= _tr
          for _filename in self._timings.keys():
              _tr=html.TR()
              _tr <= html.TD(_filename)
              for _platform in ('brython', 'cpython'):
                  _tr <= html.TD('%5.0f' % self._timings[_filename][_platform],
                                 style={'text-align':'right'})

              _diff=self._timings[_filename]['cpython'] - self._timings[_filename]['brython']
              _x=self._timings[_filename]['cpython']/self._timings[_filename]['brython']

              if _x > 1:
                 _bg="green"
              elif _x < 0.5:
                 _bg="red"
              else:
                 _bg="yellow"
              _tr <= html.TD('%5.0f' % _diff,
                             style={'text-align':'right'})
              _tr <= html.TD('%4.2f' % _x, 
                             style={'background': _bg,
                                    'text-align':'right'})
              _table <= _tr

          doc['container'] <= _table

          doc['container'] <= html.PRE("results uploaded...")


      # upload results
      req = ajax.ajax()
      req.bind('complete', on_complete)
      req.set_timeout(4, on_error)
      req.open('POST','//coherent-coder-88201.appspot.com/ReportData',True)
      #req.open('POST','//localhost:8080/ReportData',True)
      req.set_header('content-type','application/x-www-form-urlencoded')
      req.send({'data': json.dumps(_data)})

  def show_results(self):
      """ show table of results"""

      doc['container'].clear()

      doc['container'] <= html.DIV('Browser Version: %s' % window.navigator.userAgent)
      _v=sys.implementation.version
      doc['container'] <= html.DIV('Brython Version: %s.%s.%s' % (_v.major, _v.minor, _v.micro))
      doc['container'] <= html.DIV('Brython debug mode: %s' % sys.brython_debug_mode)
      doc['container'] <= html.DIV('CPython Version: %s' % self.cpython_version)

      doc['container'] <= html.P(html.I('Results are in milliseconds (ms)'))

      _table=html.TABLE()
      _tr=html.TR()
      _tr <= html.TH('Benchmark')
      _tr <= html.TH('Code')
      _tr <= html.TH('Brython')
      _tr <= html.TH('CPython')
      _tr <= html.TH('Difference')
      _tr <= html.TH('X Faster')
      _table <= _tr
      for _filename in self._timings.keys():
          _tr=html.TR()
          _tr <= html.TD(_filename)
          _tr <= html.TD(highlight.highlight(self._timings[_filename]['code']))
          for _platform in ('brython', 'cpython'):
              _tr <= html.TD('%5.0f' % self._timings[_filename][_platform],
                             style={'text-align':'right'})

          _diff=self._timings[_filename]['cpython'] - self._timings[_filename]['brython']
          _x=self._timings[_filename]['cpython']/self._timings[_filename]['brython']

          if _x > 1:
             _color="green"
          elif _x < 0.5:
             _color="red"
          else:
             _color="black"
          _tr <= html.TD('%5.0f' % _diff,
                         style={'text-align':'right'})
          _tr <= html.TD('%4.2f' % _x, 
                         style={'color': _color, 
                                'text-align':'right'})
          _table <= _tr

      doc['container'] <= _table

