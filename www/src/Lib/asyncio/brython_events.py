"""Brython event loop."""

import time

from browser import timer, websocket


from . import base_events
from . import transports
from . import events


__all__ = ['BrythonEventLoop', 'DefaultEventLoopPolicy', 'WebSocketTransport']


class BrythonEventLoop(base_events.BaseEventLoop):
    """
        Brython Event Loop
    """

    class Handle:
        def __init__(self, tm):
            self.tm = tm

        def cancel(self):
            timer.clear_timeout(self.tm)

    def __init__(self):
        super().__init__()

    def call_soon(self, callback, *args):
        return BrythonEventLoop.Handle(timer.set_timeout(lambda: callback(*args), 1))

    def call_soon_threadsafe(self, callback, *args):
        return self.call_soon(callback, *args)

    def call_later(self, delay, callback, *args):
        return BrythonEventLoop.Handle(timer.set_timeout(lambda: callback(*args), delay*1000))

    def call_at(self, when, callback, *args):
        now = self.time()
        if when <= now:
            return self.call_soon(callback, *args)
        else:
            return self.call_later(when-now, callback, *args)
        pass

    def time(self):
        return time.time()

    def is_running(self):
        return True

    def run_forever(self):
        """Run until stop() is called."""
        self._check_closed()
        while True:
            try:
                self._run_once()
            except base_events._StopError:
                break

    def run_in_executor(self, executor, callback, args):
        raise NotImplementedError()

    def set_default_executor(self, executor):
        raise NotImplementedError()

    def getaddrinfo(self, host, port, family, type, proto, flags):
        raise NotImplementedError()

    def getnameinfo(self, sockaddr, flags):
        raise NotImplementedError()

    def create_connection(self, protocol_factory, host, port, path, method, **kwargs):
        pass

    def create_datagram_endpoint(self, protocol_factory, remote_addr):
        transport = SocketTransport(remote_addr)
        protocol = protocol_factory()
        protocol.connection_made(transport)


class _BrythonDefaultEventLoopPolicy(events.BaseDefaultEventLoopPolicy):
    """UNIX event loop policy with a watcher for child processes."""
    _loop_factory = BrythonEventLoop


class WebSocketTransport(transports.ReadTransport, transports.WriteTransport):
    def __init__(self, remote_addr, protocol, extra=None):
        self._proto = protocol
        self._web_sock = websocket.WebSocket(remote_addr)
        self._web_sock.bind('close', lambda evt: protocol.connection_lost())
        self._web_sock.bind('open', lambda evt: protocol.connection_made(self))
        self._web_sock.bind('message', lambda evt: protocol.datagram_received(evt.data))

    def write(self, data):
        self._web_sock.send(data)

    def can_write_eof(self):
        return True

    def write_eof(self):
        self._web_sock.close()

    def pause_reading(self):
        raise NotImplementedError()

    def resume_reading(self):
        raise NotImplementedError()

DefaultEventLoopPolicy = _BrythonDefaultEventLoopPolicy
