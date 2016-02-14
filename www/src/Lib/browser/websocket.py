from browser import window
import javascript

if hasattr(window, 'WebSocket'):
    supported = True
    WebSocket = javascript.JSConstructor(window.WebSocket)
else:
    supported = False
    def WebSocket(*args,**kw):
        throw NotImplementedError