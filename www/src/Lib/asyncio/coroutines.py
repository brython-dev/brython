from .futures import Future, CancelledError
from ._utils import decorator


def get_continuation(generator, final_result):
    def _cb(previous_result):
        if final_result.cancelled():
            return
        try:
            if previous_result.cancelled():
                next_result = generator.throw(CancelledError())
            elif previous_result.exception() is not None:
                next_result = generator.throw(previous_result.exception())
            else:
                next_result = generator.send(previous_result.result())
            cb = get_continuation(generator, final_result)
            next_result.add_done_callback(cb)
        except StopIteration as ex:
            if hasattr(ex, 'value'):
                final_result.set_result(ex.value)
            else:
                final_result.set_result(None)
        except Exception as ex:
            final_result.set_exception(ex)
    return _cb


@decorator
def coroutine(func):
    """
        A coroutine decorator which allows a function to call asynchronous operations
        (using "yield") and use their results as if they were synchronous operations,
        e.g.

        @coroutine
        def print_google()
            html = yield wget("www.google.com")
            print(html)

        would download the www.google.com website and then print its html. The magic
        is that the ``wget`` function returns a Future, but the yield
        converts this promise into an actual value which is sent back to the function
        so that when ``print`` is called it has the results ready.
    """

    if not func.__code__.co_flags & 0x20:
        # The function is not a generator
        def run(*args, **kwargs):
            final_result = Future()
            try:
                final_result.set_result(func(*args, **kwargs))
            except Exception as ex:
                final_result.set_exception(ex)
            return final_result
    else:
        def run(*args, **kwargs):
            generator = func(*args, **kwargs)
            final_result = Future()
            try:
                first_result = next(generator)
                _cb = get_continuation(generator, final_result)
                first_result.add_done_callback(_cb)
            except StopIteration as ex:
                if hasattr(ex, 'value'):
                    final_result.set_result(ex.value)
                else:
                    final_result.set_result(None)
            except Exception as ex:
                final_result.set_exception(ex)
            return final_result
    run.__coroutine = True
    run.__name__ = func.__name__
    return run


def iscoroutine(obj):
    return hasattr(obj, '__coroutine')
