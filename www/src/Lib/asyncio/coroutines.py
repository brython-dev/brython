from .futures import Future, CancelledError
from ._utils import decorator, _isgenerator

import types
import dis

@decorator
def coroutine(func):
    """
        Implementation adapted from https://www.pythonsheets.com/notes/python-asyncio.html
    """
    func.__coroutinefunction__ = True
    return func

"""
    def coro(*a, **k):
        res = func(*a, **k)
        if isinstance(res, Future) or _isgenerator(res):
            yield from res
        else:
            return res
    coro.__coroutinefunction__ = True
    return coro
"""

def run_async(loop=None):
    @decorator
    def _decorator(func):
        coro = coroutine(func)
        def task(*a, **k):
            return Task(coro(*a, **k), loop=loop, task_name=func.__name__)
        task.__async_task__ = True
        return task
    return _decorator


def iscoroutinefunction(fun):
    return (hasattr(fun, '__coroutinefunction__') or
        fun.__code__.co_flags & dis.COROUTINE)

def iscoroutine(obj):
    return isinstance(obj, types.CoroutineType) or _isgenerator(obj)


class Task(Future):
    """
        Implementation adapted from https://www.pythonsheets.com/notes/python-asyncio.html
    """
    def __init__(self, coro_object, *, loop=None, task_name=None):
        super().__init__(loop)
        self._coro_obj = coro_object
        self._name = task_name
        self._loop.call_soon(self._step)

    def _step(self, val=None, exc=None):
        if self.done():
            return
        try:
            if exc:
                f = self._coro_obj.throw(exc)
            else:
                f = self._coro_obj.send(val)
        except StopIteration as e:
            self.set_result(e.value)
        except BaseException as e:
            self.set_exception(e)
        else:
            f.add_done_callback(self._wakeup)

    def _wakeup(self, fut):
        try:
            res = fut.result()
        except BaseException as e:
            self._step(None, e)
        else:
            self._step(res, None)

    def __str__(self):
        ret = "Task("+str(self._name)+"): "
        if self.done():
            if self._exception:
                ret += "finished with exception"
            else:
                ret += "finished with result:"+str(self._result)
        elif self.cancelled():
            ret += "canceled"
        else:
            ret += "pending"
        return ret


def ensure_future(fut_or_coroutine_obj, *, loop=None):
    if isinstance(fut_or_coroutine_obj, Future):
        if loop is not None and loop is not fut_or_coroutine_obj._loop:
            raise ValueError('loop argument must agree with Future')
        return fut_or_coroutine_obj
    elif iscoroutine(fut_or_coroutine_obj):
        return Task(fut_or_coroutine_obj, loop=loop,
            task_name=fut_or_coroutine_obj.__name__)
    else:
        raise TypeError('Expecting coroutine object or Future, got ' +
            str(fut_or_coroutine_obj) + ' instead.')

