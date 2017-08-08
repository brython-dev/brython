"""Event loop."""

from browser import ajax
from browser import timer

import time

class Handle:
    def __init__(self):
        self._cancelled = False

    def cancel(self):
        self._cancelled = True

    def cancelled(self):
        return self._cancelled

class TimerHandle(Handle):
    """Object returned by timed callback registration methods."""

    def __init__(self, timeout, when):
        self._cancelled = False
        self._timeout = timeout
        self._when = when


    def __hash__(self):
        return hash(self._when)

    def __lt__(self, other):
        return self._when < other._when

    def __le__(self, other):
        if self._when < other._when:
            return True
        return self.__eq__(other)

    def __gt__(self, other):
        return self._when > other._when

    def __ge__(self, other):
        if self._when > other._when:
            return True
        return self.__eq__(other)

    def __eq__(self, other):
        if isinstance(other, TimerHandle):
            return self._timeout == other._timeout
        return NotImplemented

    def __ne__(self, other):
        equal = self.__eq__(other)
        return NotImplemented if equal is NotImplemented else not equal

    def cancel(self):
        if not self._cancelled:
            timer.clear_timeout(self._timeout)
            self._cancelled = True


class BrowserEventLoop:
    def __init__(self):
        self._debug = False

    def is_running(self):
        return True

    def call_soon(self, callback, *args):
        def _callback():
            callback(*args)
        return TimerHandle(timer.set_timeout(_callback,0), self.time())

    def call_later(self, delay, callback, *args):
        def _callback():
            callback(*args)
        return TimerHandle(timer.set_timeout(_callback,delay*1000), self.time()+delay*1000)

    def call_at(self, when, callback, *args):
        def _callback():
            callback(*args)
        return TimerHandle(timer.set_timeout(_callback,when-self.time()), when)

    def time(self):
        return time.time()

    def get_debug(self):
        return self._debug

    def set_debug(self, enabled):
        self._debug = enabled

def get_event_loop():
    from . import default_event_loop
    return default_event_loop
