import _ajax

from browser import window, timer
from javascript import JSConstructor

class ajax:

    def __init__(self):
        self.xmlhttp = JSConstructor(window.XMLHttpRequest)()
    
    def open(self, method, url, async=True):
        self.xmlhttp.open(method, url, async)
    
    def bind(self, event, callback):
        if event=='complete':
            event = 'load'
        
        def func(req):
            if hasattr(req, 'timer'):
                timer.clear_timeout(req.timer)
                del req.timer
            req.text = req.responseText
            return callback(req)

        setattr(self.xmlhttp, 'on%s' %event, 
            lambda *x, self=self: func(self.xmlhttp))
    
    def send(self, data=None):
        if data is None:
            self.xmlhttp.send()
        elif isinstance(data, str):
            self.xmlhttp.send(data)
        elif isinstance(data, dict):
            self.xmlhttp.send(_ajax.urlencode(data))
        else:
            raise TypeError('send argument must be str or dict')

    def set_header(self, key, value):
        self.xmlhttp.setRequestHeader(key, value)

    def set_timeout(self, seconds, func):
        def callback():
            self.xmlhttp.abort()
            del self.xmlhttp.timer
            func()
        self.xmlhttp.timer = timer.set_timeout(callback, seconds*1000)