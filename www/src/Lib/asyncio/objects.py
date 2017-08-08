from .coroutines import coroutine
from .futures import Future
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
            if hasattr(func, '__coroutine'):
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

