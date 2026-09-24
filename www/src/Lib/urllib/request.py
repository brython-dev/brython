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

class Request:

    def __init__(self, url, data=None, headers={}, origin_req_host=None,
                 unverifiable=False, method=None):
        self.full_url = url
        self.data = data
        self.headers = {}
        for key, value in headers.items():
            self.add_header(key, value)
        self.origin_req_host = origin_req_host
        self.unverifiable = unverifiable
        self.method = method

    def get_full_url(self):
        return self.full_url

    def get_method(self):
        if self.method is not None:
            return self.method
        return 'POST' if self.data is not None else 'GET'

    def add_header(self, key, val):
        self.headers[key.capitalize()] = val

    def has_header(self, header_name):
        return header_name in self.headers

    def get_header(self, header_name, default=None):
        return self.headers.get(header_name, default)

    def header_items(self):
        return list(self.headers.items())


def urlopen(url, data=None, timeout=None):
    global result
    result = None
    method = None
    headers = {}
    if isinstance(url, Request):
        data = url.data if data is None else data
        headers = url.headers
        method = url.get_method()
        url = url.full_url

    def on_complete(req):
        global result
        if req.status == 200:
            result = req

    _ajax = ajax.ajax()
    _ajax.bind('complete', on_complete)
    if timeout is not None:
       _ajax.set_timeout(timeout)

    _ajax.open(method or ('GET' if data is None else 'POST'), url, False)
    for key, value in headers.items():
        _ajax.set_header(key, value)
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
