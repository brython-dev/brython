
from .events import get_event_loop


class InvalidStateError(Exception):
    pass


class CancelledError(Exception):
    pass


class TimeoutError(Exception):
    pass


class Future:
    """
        A class representing the future result of an async action.
        Implementations should override the :method:`start` method
        which should start the asynchronous operation. The class will
        typically register a handler to be run when the operation finishes.
        This handler then needs to call the base :method:`_finish` method
        providing it with the :parameter:`result` parameter and
        :parameter:`status` (which should either be ``Promise.STATUS_FINISHED``
        in case the operation finished successfully or ``Promise.STATUS_ERROR``
        if an error happened).
    """
    STATUS_STARTED = 0
    STATUS_CANCELED = 1
    STATUS_FINISHED = 2
    STATUS_ERROR = 3

    def __init__(self, loop=None):
        if loop is None:
            loop = get_event_loop()
        self._loop = loop
        self._status = Future.STATUS_STARTED
        self._result = None
        self._exception = None
        self._callbacks = []
        self._loop._register_future(self)

    def _schedule_callbacks(self):
        for cb in self._callbacks:
            self._loop.call_soon(cb, self)

    def cancel(self):
        """
        Cancel the future and schedule callbacks.

        If the future is already done or cancelled, return False. Otherwise, change the future’s state to cancelled, schedule the callbacks and return True."""
        if self._status != Future.STATUS_STARTED:
            return False
        self._status = Future.STATUS_CANCELED
        self._schedule_callbacks()
        return True

    def cancelled(self):
        """Return True if the future was cancelled."""
        return self._status == Future.STATUS_CANCELED

    def done(self):
        """
        Return True if the future is done.

        Done means either that a result / exception are available, or that the future was cancelled.
        """
        return self._status != Future.STATUS_STARTED

    def result(self):
        """
        Return the result this future represents.

        If the future has been cancelled, raises CancelledError. If the future’s result isn’t yet available, raises InvalidStateError. If the future is done and has an exception set, this exception is raised.
        """
        if self._status == Future.STATUS_STARTED:
            raise InvalidStateError()
        if self._status == Future.STATUS_CANCELED:
            raise CancelledError()
        if self._status == Future.STATUS_ERROR:
            raise self._exception
        return self._result

    def exception(self):
        """
        Return the exception that was set on this future.

        The exception (or None if no exception was set) is returned only if the future is done. If the future has been cancelled, raises CancelledError. If the future isn’t done yet, raises InvalidStateError.
        """
        if self._status == Future.STATUS_STARTED:
            raise InvalidStateError()
        if self._status == Future.STATUS_CANCELED:
            raise CancelledError()
        if self._status == Future.STATUS_ERROR:
            return self._exception

    def add_done_callback(self, fn):
        """
        Add a callback to be run when the future becomes done.

        The callback is called with a single argument - the future object. If the future is already done when this is called, the callback is scheduled with call_soon().

        Use functools.partial to pass parameters to the callback. For example, fut.add_done_callback(functools.partial(print, "Future:", flush=True)) will call print("Future:", fut, flush=True).
        """
        if self.done():
            self._loop.call_soon(fn,self)
        else:
            self._callbacks.append(fn)

    def remove_done_callback(self, fn):
        """
        Remove all instances of a callback from the “call when done” list.

        Returns the number of callbacks removed.
        """
        removed = 0
        retain = []
        for cb in self._callbacks:
            if cb == fn:
                removed += 1
            else:
                retain.append(cb)
        self._callbacks = retain
        return removed

    def set_result(self, result):
        """
        Mark the future done and set its result.

        If the future is already done when this method is called, raises InvalidStateError.
        """
        if self._status != Future.STATUS_STARTED:
            raise InvalidStateError()
        self._result = result
        self._status = Future.STATUS_FINISHED
        self._schedule_callbacks()

    def set_exception(self, exception):
        """
        Mark the future done and set an exception.

        If the future is already done when this method is called, raises InvalidStateError.
        """
        if self._status != Future.STATUS_STARTED:
            raise InvalidStateError()
        self._exception = exception
        self._status = Future.STATUS_ERROR
        self._schedule_callbacks()

    def __iter__(self):
        if not self.done():
            yield self
        return self.result()


class GatheredFuture(Future):
    def __init__(self, futures, return_exceptions=False, loop=None):
        super().__init__(loop=None)
        self._futures = futures
        self._ret_exceptions = return_exceptions
        for fut in futures:
            fut.add_done_callback(lambda : self._done(fut))

    def _done(self, fut):
        if self.done():
            return

        if fut.canceled():
            if not self._ret_exceptions:
                self.set_exception(CancelledError())
                return
        else:
            exc = fut.exception()
            if exc is not None and not self._ret_exceptions:
                self.set_exception(exc)
                return
        self._check_finished()

    def cancel(self):
        for fut in self._futures:
            if not fut.done():
                fut.cancel()
        super().cancel()

    def _check_finished(self):
        results = []
        for fut in self._futures:
            if not fut.done():
                return
            elif fut.canceled():
                results.append(CancelledError())
            exc = fut.exception()
            if exc is not None:
                results.append(exc)
            else:
                results.append(fut.result())
        self.set_result(results)


class SleepFuture(Future):
    def __init__(self, seconds, result=None, loop=None):
        super().__init__(loop)
        self._loop.call_later(seconds, self.set_result, result)

    def set_result(self, result):
        if not self.done():
            super().set_result(result)
        else:
            print("Sleep already finished with ex:", self.exception())


def gather(*coros_or_futures, return_exceptions=False, loop=None):
    fut_list = [ensure_future(c, loop=loop) for c in coros_or_futures]
    return GatheredFuture(fut_list, return_exceptions=False)
