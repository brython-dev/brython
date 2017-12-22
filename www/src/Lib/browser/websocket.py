from browser import window

if hasattr(window, 'WebSocket'):
    supported = True
    WebSocket = window.WebSocket.new
else:
    supported = False

    class WebSocket:
        def __init__(self, *args):
            raise NotImplementedError
