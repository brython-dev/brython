import _ajax

from browser import window, timer
from javascript import JSConstructor

readyStates = {
    0: "uninitialized", # The initial value.
    1: "open", # The open() method has been successfully called.
    2: "sent", # The UA successfully completed the request, but no data has 
               # yet been received.
    3: "receiving", # Immediately before receiving the message body (if any).
                    # All HTTP headers have been received. 
    4: "loaded" # The data transfer has been completed.
}

class ajax:

    def __init__(self):
        self.xmlhttp = JSConstructor(window.XMLHttpRequest)()
        self.xmlhttp.onreadystatechange = self.state_change
        self.bindings = {}
        self.timer = None

    def state_change(self, req):
        # called every time the Ajax object state changes

        # get event : uninitialized, open, sent, receiving or loaded
        event = readyStates[self.xmlhttp.readyState]

        # if a binding is registered for the event, call the callback
        if event in self.bindings:
            self.bindings[event](self.xmlhttp)
            
    def open(self, method, url, async=True):
        self.xmlhttp.open(method, url, async)
    
    def bind(self, event, callback):

        if event=='complete':
            event = 'loaded'

        if not event in readyStates.values():
            raise ValueError('event must be one of %s' 
                %str(list(readyStates.values())))
        
        def func(obj):
            if event=="loaded" and self.timer is not None:
                timer.clear_timeout(self.timer)
                self.timer = None
            obj.text = obj.responseText
            obj.xml = obj.responseXML
            try:
                return callback(obj)
            except Exception as exc:
                import sys
                msg = exc.__name__
                if exc.args:
                    msg += ': %s' %exc.args[0]
                msg += '\n'+exc.info
                sys.stderr.write(msg)

        self.bindings[event] = func
    
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
            timer.clear_timeout(self.timer)
            self.timer = None
            func()
        self.timer = timer.set_timeout(callback, seconds*1000)