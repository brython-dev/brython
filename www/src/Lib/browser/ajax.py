from _ajax import *

class _Ajax:
    """Instances of this class modelized an Ajax call.
    Usage :
    
    req = Ajax("/path/to/url", method="POST", async=True)
    
    @req.complete
    def complete():
        print(req.text)
    
    req.set_header("content-type", "application/x-www-form-urlencoded")
    req.send({'x': 0})
    """    
    def __init__(self, url, method="GET", async=True):
        """Initialize an Ajax call."""
        self.req = ajax1()
        self.req.open(method, url, async)

    def send(self, data=None):
        if data is not None:
            self.req.send(data)
        else:
            self.req.send()

    def set_header(self, key, value):
        self.req.set_header(key, value)
        
    def set_timeout(self, seconds, func):
        self.req.set_timeout(seconds, func)

    # decorators for the functions that handle the different states
    def uninitialized(self, f):
        self.req.bind("uninitialized", f)
        return f

    def loading(self, f):
        self.req.bind("loading", f)
        return f

    def loaded(self, f):
        self.req.bind("loaded", f)
        return f

    def interactive(self, f):
        self.req.bind("interactive", f)
        return f

    def complete(self, f):
        self.req.bind("complete", f)
        return f
    
    @property
    def status(self):
        return self.req.status

    @property
    def text(self):
        return self.req.responseText

class Ajax:
    
    def __init__(self, url, method="GET", headers={},
            data=None, async=True, timeout=None):
        self.req = ajax1()
        self.req.open(method, url, async)
        self.method = method
        self.headers = headers
        self.req.timeout_secs = timeout
        if timeout is not None:
            if not isinstance(timeout, [int, float]):
                raise ValueError('timeout is not a number')
            self._timeout()
        self.req.bind("complete", self._success)
        self.req.bind("error", self._error)

    def _error(self, ev):
        error = getattr(self, "error", None)
        if error is not None:
            self.req.text = self.req.responseText
            self.__class__.error(self.req)

    def _success(self):
        success = getattr(self, "success", None)
        if success is not None:
            self.req.text = self.req.responseText
            self.__class__.success(self.req)
    
    def send(self, data=None):
        self.ct_set = False
        for key, value in self.headers.items():
            self.req.set_header(key, value)
            if key.lower() == 'content-type':
                self.ct_set = True
        if not self.ct_set:
            if self.method == "POST":
                self.req.set_header("Content-Type",
                    "application/x-www-form-urlencoded")
        if data is None:
            self.req.send()
        else:
            self.req.send(data)

    def _timeout(self):
        timeout_func = getattr(self, "timeout", None)
        if timeout_func is not None:
            def func(*args):
                print('timeout callback', self.req)
                return self.__class__.timeout(self.req)
            self.req.set_timeout(self.req.timeout_secs, func)

    def set_type(self, _type):
        self.headers['Content-Type'] = _type

        