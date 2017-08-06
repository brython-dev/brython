import asyncio

from browser import timer, console

__all__ = ['DelayedFuture', 'ImmediateFuture']


class DelayedFuture(asyncio.Future):
    """
        A class representing a Future Call result.
    """

    def __init__(self, func, timeout, *args, **kwargs):
        super().__init__()
        self._func = func
        self._args = args
        self._kwargs = kwargs
        self._timer = timer.set_timeout(self.handler, timeout)

    def handler(self):
        try:
            res = self._func(*self._args, **self._kwargs)
            self.set_result(res)
        except Exception as ex:
            self.set_exception(ex)

    def cancel(self):
        timer.clear_timeout(self._timer)


class ImmediateFuture(DelayedFuture):
    def __init__(self, func, *args, **kwargs):
        super().__init__(func, 1, *args, **kwargs)
