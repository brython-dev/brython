"""Event loop."""

from browser import ajax
from browser import timer

import asyncio
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


class PausableTimerHandle(TimerHandle):
    def __init__(self, callback, when, schedule_immediately=True):
        super().__init__(None, when)
        self._finished = False
        def _cb():
            self._finished = True
            callback()
        self._cb = _cb
        self._cb.__name__ = callback.__name__
        if schedule_immediately:
            self.resume()

    def resume(self):
        if not self._finished and not self._timeout:
            tm = time.time()
            if tm >= self._when:
                delay = 0
            else:
                delay = (self._when-tm)*1000
            self._timeout = timer.set_timeout(self._cb, delay)

    def pause(self):
        if not self._finished and self._timeout:
            timer.clear_timeout(self._timeout)

    def cancel(self):
        if not self._cancelled and not self._finished:
            if self._timeout:
                timer.clear_timeout(self._timeout)
            self._cancelled = True
            self._finished = True

    def finished(self):
        return self._finished


class BrowserEventLoop:
    def __init__(self):
        self._debug = False
        self._pending =[]
        self._running=True
        self._scheduled = []
        self._cleanup_timer = timer.set_interval(self._clean_schedule, 1000)

    def _clean_schedule(self):
        updated = []
        for handle in self._scheduled:
            if not handle.finished():
                updated.append(handle)
        self._scheduled = updated

    def _register_future(self, fut):
        self._pending.append(fut)
        fut.add_done_callback(self._future_done)

    def _future_done(self, fut):
        self._pending.remove(fut)

    def pending_futures(self):
        return self._pending

    def send_exception_to_pending_futures(self, ex):
        for fut in self._pending:
            try:
                if not fut.done():
                    fut.set_exception(ex)
            except BaseException as exc:
                console.log("Error sending exception", ex, "to", fut, ":", exc)

    def close(self):
        self.stop()
        if self._debug:
            self._clean_schedule()
            if len(self._scheduled) > 0:
                print("Warning, pending callbacks", self._scheduled)
            if len(self._pending) > 0:
                print("Warning, pending futures", self._pending)

    def stop(self, *args):
        if self._running:
            for handle in self._scheduled:
                handle.pause()
            self._clean_schedule()
            timer.clear_interval(self._cleanup_timer)
            self._cleanup_timer = None
            self._running = False

    def run_forever(self):
        if not self._running:
            for handle in self._scheduled:
                handle.resume()
            self._clean_schedule()
            self._cleanup_timer = timer.set_interval(self._clean_schedule, 1000)
            self._running = True

    def run_until_complete(self, coro_or_fut):
        if not self._running:
            self.run_forever()
        fut = asyncio.ensure_future(coro_or_fut, loop=self)
        fut.add_done_callback(self.stop)
        return fut

    def is_running(self):
        return self._running

    def call_soon(self, callback, *args):
        return self.call_at(self.time(), callback, *args)

    def call_later(self, delay, callback, *args):
        return self.call_at(self.time()+delay, callback, *args)

    def call_at(self, when, callback, *args):
        def _callback():
            callback(*args)
        _callback.__name__ = callback.__name__
        handle = PausableTimerHandle(_callback, when, schedule_immediately = self._running)
        self._scheduled.append(handle)
        return handle

    def time(self):
        return time.time()

    def get_debug(self):
        return self._debug

    def set_debug(self, enabled):
        self._debug = enabled


class AbstractEventLoopPolicy:
    def __init__(self):
        loop = self.new_event_loop()
        self.set_event_loop(loop)

    def get_event_loop(self):
        return self._loop

    def set_event_loop(self, loop):
        self._loop = loop

    def new_event_loop(self):
        return BrowserEventLoop()


_default_policy = AbstractEventLoopPolicy()
_current_policy = _default_policy


def get_event_loop_policy():
    return _current_policy


def set_event_loop_policy(policy):
    global current_policy
    _current_policy = policy or _default_policy


def get_event_loop():
    return _current_policy.get_event_loop()


def set_event_loop(loop):
    _current_policy.set_event_loop(loop)


def new_event_loop():
    return _current_policy.new_event_loop()




