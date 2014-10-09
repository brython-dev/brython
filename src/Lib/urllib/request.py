from browser import ajax

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
        result=req

    _ajax=ajax.ajax()
    _ajax.bind('complete', on_complete)
    if timeout is not None:
       _ajax.set_timeout(timeout)

    _ajax.open('GET', url, False)
    if data is None:
       _ajax.send()
    else:
       _ajax.send(data)

    if isinstance(result.text, str):
       return FileIO(result.text), url, result.headers

    return FileIO(result.text()), url, result.headers
