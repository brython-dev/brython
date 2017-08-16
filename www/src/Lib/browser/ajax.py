from _ajax import *

class Request:
    
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
    
    def _timeout(self):
        timeout_func = getattr(self, "timeout", None)
        if timeout_func is not None:
            def func(*args):
                return self.__class__.timeout(self.req)
            self.req.set_timeout(self.req.timeout_secs, func)
        