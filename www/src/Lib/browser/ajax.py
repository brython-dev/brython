from _ajax import *

class Ajax:
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