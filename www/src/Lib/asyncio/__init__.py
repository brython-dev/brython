""" The asyncio package, tracking PEP 3156.
    A module providing the :class:`Future` and :function:`coroutine` decorator
    which can be make async operations look like sync. Typical usecase is
    as follows. Assume we have a method ``query_server`` which asynchronously
    queries a server. So, instead of returning the results, it returns an
    instance of the :class:`Future` class. Normally one would call
    the :method:`then` method of this instance providing it with a call back
    to be called when the promise is "resolved", i.e. when the query has
    finished and results are ready. This, however, typically leads to something
    called the "callback" hell. The :function:`coroutine` decorator can get
    around this by a clever use of the ``yield`` statement. So, instead of
    writing:

    ```
        def process_results(results):
            do_some_stuff(results)

        def send_query():
            promise = query_server()
            promise.then(process_results)
    ```

    one can write it in a more straightforward way:

    ```
        @coroutine
        def process_query():
            results = yield from query_server()
            do_some_stuff(results)
    ```

    eliminating the need to introduce the ``process_results`` callback.
"""

from .coroutines import *
from .events import *
from .futures import *
from .locks import *
from .queues import *

from .http import *
from .objects import *


FIRST_COMPLETED = 0
FIRST_EXCEPTION = 0
ALL_COMPLETED = 0



def wait_for(coro_or_future, timeout, *args, loop=None):
    if loop is None:
        loop = get_event_loop()
    fut = ensure_future(coro_or_future(*args), loop=loop)
    if timeout:
        def timeout_handler():
            if fut.done():
                pass
            else:
                fut.set_exception(TimeoutError())
        loop.call_later(timeout, timeout_handler)
    return fut

def shield(arg, loop=None):
    """Wait for a future, shielding it from cancellation.

    The statement

        res = yield from shield(something())

    is exactly equivalent to the statement

        res = yield from something()

    *except* that if the coroutine containing it is cancelled, the
    task running in something() is not cancelled.  From the POV of
    something(), the cancellation did not happen.  But its caller is
    still cancelled, so the yield-from expression still raises
    CancelledError.  Note: If something() is cancelled by other means
    this will still cancel shield().

    If you want to completely ignore cancellation (not recommended)
    you can combine shield() with a try/except clause, as follows:

        try:
            res = yield from shield(something())
        except CancelledError:
            res = None
    """
    inner = ensure_future(arg)
    if inner.done():
        # Shortcut.
        return inner
    if loop is None:
        loop = get_event_loop()
    outer = Future()

    def _done_callback(inner):
        if outer.cancelled():
            if not inner.cancelled():
                # Mark inner's result as retrieved.
                inner.exception()
            return

        if inner.cancelled():
            outer.cancel()
        else:
            exc = inner.exception()
            if exc is not None:
                outer.set_exception(exc)
            else:
                outer.set_result(inner.result())

    inner.add_done_callback(_done_callback)
    return outer

def sleep(seconds, result=None, loop=None):
    return futures.SleepFuture(seconds, result, loop=loop)
