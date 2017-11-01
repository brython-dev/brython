from _ajax import *

class Request:

    def __init__(self, url, method="GET", headers={},
            data=None, sync=False, timeout=None):
        self.req = ajax1()
        self.req.open(method, url, not sync)
        self.method = method
        self.headers = headers
        self.req.timeout_secs = timeout
        if timeout is not None:
            if not isinstance(timeout, [int, float]):
                raise ValueError('timeout is not a number')
            self._timeout()
        self.req.bind("complete", self._complete)

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

    def _complete(self):
        """Called when the request readyState is 4.
        A request succeeds if it response status starts with 2
        and fails otherwise.
        """
        if hasattr(self, "timer"):
            # delete timeout
            self.req.clearTimeout(self.timer)
            del self.timer
        if 200 <= self.req.status <300:
            return self._success()
        return self._error()

    def _error(self):
        """If the subclass for a specific request defines a method "error",
        call it with the request object as argument.
        """
        error = getattr(self, "error", None)
        if error is not None:
            self.req.text = self.req.responseText
            error.__func__(self.req)

    def _success(self):
        """If the subclass for a specific request defines a method "success",
        call it with the request object as argument.
        """
        success = getattr(self, "success", None)
        if success is not None:
            self.req.text = self.req.responseText
            success.__func__(self.req)

    def _timeout(self):
        """If the subclass is called with an argument "timeout" and if it
        defines a method "timeout", call it with the request object as
        argument.
        """
        timeout_method = getattr(self, "timeout", None)
        if timeout_method is not None:
            def func(*args):
                return timeout_method.__func__(self.req)
            self.req.set_timeout(self.req.timeout_secs, func)
