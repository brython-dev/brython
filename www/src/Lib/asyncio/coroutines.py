from browser import console

from .futures import Future, CancelledError
from ._utils import decorator, _isgenerator


@decorator
def coroutine(func):
    """
        Implementation adapted from https://www.pythonsheets.com/notes/python-asyncio.html
    """
    func.__coroutinefunction__ = True
    return func

    def coro(*a, **k):
        console.log("Calling coroutine", func.__name__)
        res = func(*a, **k)
        console.log("Got result", res)
        if isinstance(res, Future) or _isgenerator(res):
            yield from res
        else:
            return res
    coro.__coroutinefunction__ = True
    return coro


def run_async(loop=None):
    @decorator
    def _decorator(func):
        def task(*a, **k):
            console.log("Calling task with args", a, k)
            coro = coroutine(func)
            console.log("Decorated func into", coro, coro.__name__)
            return Task(coro(*a, **k), loop=loop, task_name=func.__name__)
        task.__async_task__ = True
        return task
    return _decorator


def iscoroutinefunction(fun):
    return hasattr(fun, '__coroutinefunction__')


def iscoroutine(obj):
    return _isgenerator(obj)


class Task(Future):
    """
        Implementation adapted from https://www.pythonsheets.com/notes/python-asyncio.html
    """
    def __init__(self, coro_object, *, loop=None, task_name=None):
        console.log("Initializing task from", coro_object)
        super().__init__(loop)
        self._coro_obj = coro_object
        self._loop.call_soon(self._step)
        self._name = task_name

    def _step(self, val=None, exc=None):
        console.log(str(self), "stepping", val, exc)
        if self.done():
            return
        try:
            if exc:
                f = self._coro_obj.throw(exc)
            else:
                f = self._coro_obj.send(val)
            console.log("Task stepped, got:", f)
        except StopIteration as e:
            console.log("Stop iteration", e.value)
            self.set_result(e.value)
        except Exception as e:
            self.set_exception(e)
        else:
            f.add_done_callback(self._wakeup)
            console.log("Waiting for Future", f)

    def _wakeup(self, fut):
        console.log(str(self), "waking up due to", fut)
        try:
            res = fut.result()
            console.log("Result of woken future:", res)
        except Exception as e:
            self._step(None, e)
        else:
            console.log("Sending result to step:", res)
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
        return Task(fut_or_coroutine_obj, loop=loop, task_name=fut_or_coroutine_obj.__name__)
    else:
        raise TypeError('Expecting coroutine object or Future got '+str(fut_or_coroutine_obj)+' instead.')

