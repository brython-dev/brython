from browser import window

if hasattr(window, 'WebSocket'):
    supported = True
    WebSocket = window.WebSocket.new
else:
    supported = False
    def WebSocket(*args,**kw):
        raise NotImplementedError