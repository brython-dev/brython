from browser import ajax
from . import error

class FileIO:
  def __init__(self, data):
      self._data=data

  def read(self):
      return self._data

def urlopen(url, data=None, timeout=None):
    global result
    result=None

    def on_complete(req):
        global result
        if req.status == 200:
            result=req

    _ajax=ajax.ajax()
    _ajax.bind('complete', on_complete)
    if timeout is not None:
       _ajax.set_timeout(timeout)

    if data is None:
       _ajax.open('GET', url, False)
       _ajax.send()
    else:
       _ajax.open('POST', url, False)
       _ajax.send(data)

    if result is not None:
        if isinstance(result.text, str):
           return FileIO(result.text) #, url, {'status': result.status}
    
        return FileIO(result.text()) #, url, {'status': result.status}
    raise error.HTTPError('file not found')