from _ajax import *

class Ajax:
    
    def __init__(self, url, **kw):
        self.req = ajax1()
        method = kw.get('method', 'GET')
        self.req.open(method, url, kw.get('async', True))

    def send(self, data=None):
        if data is not None:
            self.req.send(data)
        else:
            self.req.send()

    def set_header(self, key, value):
        self.req.set_header(key, value)
        
    def set_timeout(self, seconds, func):
        self.req.set_timeout(seconds, func)

    @property
    def status(self):
        return self.req.status

    def complete(self, f):
        """Decorator"""
        self.req.bind("complete", f)
        return f
    
    @property
    def text(self):
        return self.req.responseText