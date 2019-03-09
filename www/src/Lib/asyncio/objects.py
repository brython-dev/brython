from .coroutines import coroutine, ensure_future
from .futures import Future, gather
from ._utils import decorator

import logging
logger = logging.getLogger(__package__)

class AsyncObjectInitCanceledError(Exception):
    def __str__(self):
        return "Async object initialization canceled"

class AsyncObjectInitExceptionError(Exception):
    def __init__(self, ex):
        super().__init__("Init threw an exception:"+str(ex))
        self._init_ex = ex

class AsyncObjectUninitializedError(Exception):
    def __str__(self):
        return "Async object not initialized"

@decorator
def async_init(init):
    """
        A decorator for asynchronous constructors.
    """
    def new_init(self, *args, **kwargs):
        logger.debug("Calling decorated init for %s", self.__class__.__name__)
        cls = str(self.__class__)
        def _init_cb(fut):
            if fut.cancelled():
                logger.error("Constructor for %s canceled.", cls)
            elif fut.exception() is not None:
                print(fut.exception())
                logger.error("Constructor for %s raised an exception: %s", cls, str(fut.exception()))
        self._init_future = coroutine(init)(self, *args, **kwargs)
        self._init_future.add_done_callback(_init_cb)

    return new_init



def defer(future, func, *args, **kwargs):
    ret = Future()
    def cb(fut):
        if fut.canceled():
            logger.error("Unable to call deferred method %s object init canceled.", str(func.__decorated))
            ret.set_exception(AsyncObjectInitCanceledError())
        if fut.exception() is not None:
            logger.error("Unable to call deferred method %s object init raised an exception:", str(fut.exception))
            ret.set_exception(AsyncObjectInitExceptionError(fut.exception()))
        else:
            try:
                ret.set_result(func(*args, **kwargs))
            except Exception as ex:
                ret.set_exception(ex)
    future.add_done_callback(cb)
    return ret

@decorator
def _generate_guard(func):
    def guard(self, *args, **kwargs):
        if self._init_future.cancelled():
            logger.error("Unable to call deferred method %s object init canceled.", str(func))
            raise AsyncObjectInitCanceledError()
        elif self._init_future.exception() is not None:
            raise AsyncObjectInitExceptionError(self._init_future.exception())
        elif self._init_future.done():
            return func(self, *args, **kwargs)
        else:
            if hasattr(func, '__async_task__'):
                logger.info("Defering method %s until object is initialized.", str(func))
                return defer(self._init_future, func, self, *args, **kwargs)
            else:
                logger.error("Calling method on Uninitialized object")
                raise AsyncObjectUninitializedError()
    return guard


def async_class(cls):
    """
        A decorator for classes having an asynchronous constructor.
        Care must be given that all method invocations must be deferred until
        the constructor has finished. This is done by the :function:`_generate_guard`
        function which is called on each nonprivate class method.
    """
    for member in dir(cls):
        if not member[0:2] == '__':
            meth = getattr(cls, member)
            if hasattr(meth, '__call__'):
                setattr(cls, member, _generate_guard(meth))
    return cls


class FutureCall(Future):
    """
        A future representing the result of a method applied to a
        future result.
    """

    def __init__(self, fn, fut, loop=None):
        super().__init__(loop=loop)
        self._fn = fn
        ensure_future(fut, loop=loop).add_done_callback(self._done)

    def _done(self, fut):
        ex = fut.exception()
        if ex is None:
            res = self._fn(fut.result())
            if isinstance(res, Future):
                res.add_done_callback(self._done)
            else:
                self.set_result(res)
        else:
            self.set_exception(fut.exception())


def val(fut_or_val):
    """
        Utility function for handling finished Futures as values.
        If :param:`fut_or_val` is a Future, returns the future's
        result otherwise returns :param:`fut_or_val`.
    """
    if isinstance(fut_or_val, Future):
        return fut_or_val.result()
    return fut_or_val


def wrap_in_future(res, loop=None):
    """
        Unconditionally wraps a value in a future. It does this
        by calling asyncio.ensure_future and, if that fails,
        creating a dummy future and setting its result to
        :param:`res`.
    """
    try:
        return ensure_future(res, loop=loop)
    except TypeError:
        pass
    fut = Future()
    fut.set_result(res)
    return fut


def wait_for(*args, loop=None):
    """
        Returns a future waiting for all its arguments to recursively resolve
        to a non-future result.
    """
    return gather(*[FullyResolved(wrap_in_future(a, loop=loop)) for a in args])


class FullyResolved(Future):
    """
        Wraps a future into one which returns a recursively resolved result, i.e.
        if the future finishes and its result is another future, this class waits
        until the other future is also done, and so on.
    """
    def __init__(self, fut, loop=None):
        super().__init__(loop=loop)
        self._fut = wrap_in_future(fut, loop=loop)
        self._fut.add_done_callback(self._done)

    def _done(self, fut):
        if fut.exception() is not None:
            self.set_exception(fut.exception())
        else:
            try:
                self._fut = ensure_future(fut.result())
                self._fut.add_done_callback(self._done)
            except TypeError:
                self.set_result(fut.result())


class FutureObject(Future):
    """
        A future simulating a future object. I.e. one can do attribute access and method calls
        on the future objects with the result being a future which is resolved once the
        future object is resolved. Typical use is in functions which are not coroutines
        (or async) and so can't use yield from or await, but still want to deal with asynchronous
        calls in a reasonable way. E.g. assume we have a method to asynchronously open a file.
        In a normal async function we could write

        .. code-block:: python

            async def test():
                f = await async_open('/tmp/test.txt')
                f.write('test')
                f.close()

        The :class:`FutureObject` class allows writing similar code even in functions
        which are not async:

        .. code-block:: python

            def test():
                f = FutureObject(async_open('/tmp/test.txt'))
                f.write('test') # returns a future which we ignore it
                f.write(f.name) # also works (!)
                f.close()       # returns a future which we ignore

        Note: that the arguments of all "future" function calls are first resolved. This is
        for convenience's sake. However it means that methods which expect Futures as arguments
        wont work!
    """
    FORBIDDEN = [name for name in dir(Future) if not name.startswith('__')] + \
                ['_loop', '_callbacks'] +\
                ['__getattr__', '__setattr__', '__call__'] + \
                ['_fut', '_done']

    @classmethod
    def future_or_val(cls, x, loop=None):
        """
            If :param:`x` is a :class:`asyncio.Future` wraps it in a :class:`FutureObject`, otherwise
            returns :param:`x` unchanged.
        """
        try:
            return FutureObject(ensure_future(x, loop=loop))
        except TypeError:
            return x
        return x

    def __init__(self, fut, loop=None):
        super().__init__(loop=loop)
        self._fut = ensure_future(fut, loop=loop)
        self._fut.add_done_callback(self._done)

    def _done(self, fut):
        if fut.exception() is None:
            self.set_result(fut.result())
        else:
            self.set_exception(fut.exception())

    def __getattr__(self, name):
        if name in FutureObject.FORBIDDEN:
            return super().__getattribute__(name)

        if self.done():
            return self.future_or_val(getattr(self.result(), name), loop=self._loop)

        ret = Future()

        def resolve(fut):
            ex = fut.exception()
            if ex is None:
                ret.set_result(self.future_or_val(getattr(fut.result(), name), loop=self._loop))
            else:
                ret.set_exception(fut.exception())

        self._fut.add_done_callback(resolve)

        return FutureObject(ret)

    def __setattr__(self, name, value):
        if name in FutureObject.FORBIDDEN:
            return super().__setattr__(name, value)

        ready_fut = wait_for(self, value, loop=self._loop)

        if ready_fut.done():
            return self.future_or_val(setattr(self.result(), name, val(value)), loop=self._loop)

        ret = Future()

        def resolve(fut):
            ex = fut.exception()
            if ex is None:
                ret.set_result(self.future_or_val(setattr(self.result(), name, val(value)), loop=self._loop))
            else:
                ret.set_exception(fut.exception())

        self._fut.add_done_callback(resolve)

        return FutureObject(ret)

    def __call__(self, *args, **kwargs):

        ready_fut = wait_for(self, *args, *kwargs.values(), loop=self._loop)

        if ready_fut.done():
            return self.future_or_val(self.result()(*[val(a) for a in args], **{k: val(v) for k, v in kwargs.items()}), loop=self._loop)

        ret = Future()

        def resolve(fut):
            ex = fut.exception()
            if ex is None:
                ret.set_result(self.future_or_val(self.result()(*[val(a) for a in args], **{k: val(v) for k, v in kwargs.items()}), loop=self._loop))
            else:
                ret.set_exception(fut.exception())

        ready_fut.add_done_callback(resolve)

        return FutureObject(ret)



