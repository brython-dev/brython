from browser import ajax
from . import error

class FileIO:

    def __init__(self, data):
        self._data=data
  
    def __enter__(self):
        return self
  
    def __exit__(self, *args):
        pass
  
    def read(self):
        return self._data

def urlopen(url, data=None, timeout=None):
    global result
    result = None

    def on_complete(req):
        global result
        if req.status == 200:
            result = req

    _ajax = ajax.ajax()
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


def getproxies():
    return {}


def url2pathname(pathname):
    from urllib.parse import unquote
    return unquote(pathname)


def pathname2url(pathname):
    from urllib.parse import quote
    return quote(pathname)


_url_tempfiles = []


def urlcleanup():
    import os
    for _t in _url_tempfiles:
        try:
            os.unlink(_t)
        except OSError:
            pass
    del _url_tempfiles[:]


def urlretrieve(url, filename=None, reporthook=None, data=None):
    import tempfile
    with urlopen(url, data) as fp:
        content = fp.read()
    if filename is None:
        filename = tempfile.mktemp()
        _url_tempfiles.append(filename)
    with open(filename, 'wb') as f:
        f.write(content if isinstance(content, bytes) else content.encode())
    return filename, {}
