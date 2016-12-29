"""Support for tasks, coroutines and the scheduler."""

__all__ = ['Task',
           'FIRST_COMPLETED', 'FIRST_EXCEPTION', 'ALL_COMPLETED',
           'wait', 'wait_for', 'as_completed', 'sleep', 'async',
           'gather', 'shield',
           ]

import concurrent.futures
import functools
import inspect
import linecache
import sys
import traceback
import weakref

from . import coroutines
from . import events
from . import futures
from .coroutines import coroutine


_PY34 = (sys.version_info >= (3, 4))


class Task(futures.Future):
    """A coroutine wrapped in a Future."""

    # An important invariant maintained while a Task not done:
    #
    # - Either _fut_waiter is None, and _step() is scheduled;
    # - or _fut_waiter is some Future, and _step() is *not* scheduled.
    #
    # The only transition from the latter to the former is through
    # _wakeup().  When _fut_waiter is not None, one of its callbacks
    # must be _wakeup().

    # Weak set containing all tasks alive.
    _all_tasks = weakref.WeakSet()

    # Dictionary containing tasks that are currently active in
    # all running event loops.  {EventLoop: Task}
    _current_tasks = {}

    # If False, don't log a message if the task is destroyed whereas its
    # status is still pending
    _log_destroy_pending = True

    @classmethod
    def current_task(cls, loop=None):
        """Return the currently running task in an event loop or None.

        By default the current task for the current event loop is returned.

        None is returned when called not in the context of a Task.
        """
        if loop is None:
            loop = events.get_event_loop()
        return cls._current_tasks.get(loop)

    @classmethod
    def all_tasks(cls, loop=None):
        """Return a set of all tasks for an event loop.

        By default all tasks for the current event loop are returned.
        """
        if loop is None:
            loop = events.get_event_loop()
        return {t for t in cls._all_tasks if t._loop is loop}

    def __init__(self, coro, *, loop=None):
        assert coroutines.iscoroutine(coro), repr(coro)
        super().__init__()
        if loop is None:
            loop = events.get_event_loop()
        self._loop = loop
        if self._source_traceback:
            del self._source_traceback[-1]
        self._coro = iter(coro)  # Use the iterator just in case.
        self._fut_waiter = None
        self._must_cancel = False
        self._loop.call_soon(self._step)
        self.__class__._all_tasks.add(self)

    # On Python 3.3 or older, objects with a destructor that are part of a
    # reference cycle are never destroyed. That's not the case any more on
    # Python 3.4 thanks to the PEP 442.
    if _PY34:
        def __del__(self):
            if self._state == futures._PENDING and self._log_destroy_pending:
                context = {
                    'task': self,
                    'message': 'Task was destroyed but it is pending!',
                }
                if self._source_traceback:
                    context['source_traceback'] = self._source_traceback
                self._loop.call_exception_handler(context)
            futures.Future.__del__(self)

    def _repr_info(self):
        info = super()._repr_info()

        if self._must_cancel:
            # replace status
            info[0] = 'cancelling'

        coro = coroutines._format_coroutine(self._coro)
        info.insert(1, 'coro=<%s>' % coro)

        if self._fut_waiter is not None:
            info.insert(2, 'wait_for=%r' % self._fut_waiter)
        return info

    def get_stack(self, *, limit=None):
        """Return the list of stack frames for this task's coroutine.

        If the coroutine is not done, this returns the stack where it is
        suspended.  If the coroutine has completed successfully or was
        cancelled, this returns an empty list.  If the coroutine was
        terminated by an exception, this returns the list of traceback
        frames.

        The frames are always ordered from oldest to newest.

        The optional limit gives the maximum number of frames to
        return; by default all available frames are returned.  Its
        meaning differs depending on whether a stack or a traceback is
        returned: the newest frames of a stack are returned, but the
        oldest frames of a traceback are returned.  (This matches the
        behavior of the traceback module.)

        For reasons beyond our control, only one stack frame is
        returned for a suspended coroutine.
        """
        frames = []
        f = self._coro.gi_frame
        if f is not None:
            while f is not None:
                if limit is not None:
                    if limit <= 0:
                        break
                    limit -= 1
                frames.append(f)
                f = f.f_back
            frames.reverse()
        elif self._exception is not None:
            #tb = self._exception.__traceback__
            #FIXME: Brython does not provide __traceback__
            tb = None
            while tb is not None:
                if limit is not None:
                    if limit <= 0:
                        break
                    limit -= 1
                frames.append(tb.tb_frame)
                tb = tb.tb_next
        return frames

    def print_stack(self, *, limit=None, file=None):
        """Print the stack or traceback for this task's coroutine.

        This produces output similar to that of the traceback module,
        for the frames retrieved by get_stack().  The limit argument
        is passed to get_stack().  The file argument is an I/O stream
        to which the output is written; by default output is written
        to sys.stderr.
        """
        extracted_list = []
        checked = set()
        for f in self.get_stack(limit=limit):
            lineno = f.f_lineno
            co = f.f_code
            filename = co.co_filename
            name = co.co_name
            if filename not in checked:
                checked.add(filename)
                linecache.checkcache(filename)
            line = linecache.getline(filename, lineno, f.f_globals)
            extracted_list.append((filename, lineno, name, line))
        exc = self._exception
        if not extracted_list:
            print('No stack for %r' % self, file=file)
        elif exc is not None:
            print('Traceback for %r (most recent call last):' % self,
                  file=file)
        else:
            print('Stack for %r (most recent call last):' % self,
                  file=file)
        traceback.print_list(extracted_list, file=file)
        if exc is not None:
            for line in traceback.format_exception_only(exc.__class__, exc):
                print(line, file=file, end='')

    def cancel(self):
        """Request that this task cancel itself.

        This arranges for a CancelledError to be thrown into the
        wrapped coroutine on the next cycle through the event loop.
        The coroutine then has a chance to clean up or even deny
        the request using try/except/finally.

        Unlike Future.cancel, this does not guarantee that the
        task will be cancelled: the exception might be caught and
        acted upon, delaying cancellation of the task or preventing
        cancellation completely.  The task may also return a value or
        raise a different exception.

        Immediately after this method is called, Task.cancelled() will
        not return True (unless the task was already cancelled).  A
        task will be marked as cancelled when the wrapped coroutine
        terminates with a CancelledError exception (even if cancel()
        was not called).
        """
        if self.done():
            return False
        if self._fut_waiter is not None:
            if self._fut_waiter.cancel():
                # Leave self._fut_waiter; it may be a Task that
                # catches and ignores the cancellation so we may have
                # to cancel it again later.
                return True
        # It must be the case that self._step is already scheduled.
        self._must_cancel = True
        return True

    def _step(self, value=None, exc=None):
        assert not self.done(), \
            '_step(): already done: {!r}, {!r}, {!r}'.format(self, value, exc)
        if self._must_cancel:
            if not isinstance(exc, futures.CancelledError):
                exc = futures.CancelledError()
            self._must_cancel = False
        coro = self._coro
        self._fut_waiter = None

        self.__class__._current_tasks[self._loop] = self
        # Call either coro.throw(exc) or coro.send(value).
        # FIXME: Brython has a bug in try: else: finally: ordering
        # so the finally part:
        #
        #    self.__class__._current_tasks.pop(self._loop)
        #    self = None  # Needed to break cycles when an exception occurs.
        #
        # is copied here to every exception. When the bug gets fixed
        # it can go back to the finally part
        try:
            if exc is not None:
                result = coro.throw(exc)
            elif value is not None:
                result = coro.send(value)
            else:
                result = next(coro)
        except StopIteration as exc:
            self.set_result(getattr(exc, 'value', None))
            self.__class__._current_tasks.pop(self._loop)
            self = None  # Needed to break cycles when an exception occurs.
        except futures.CancelledError as exc:
            super().cancel()  # I.e., Future.cancel(self).
            self.__class__._current_tasks.pop(self._loop)
            self = None  # Needed to break cycles when an exception occurs.
        except Exception as exc:
            self.set_exception(exc)
            self.__class__._current_tasks.pop(self._loop)
            self = None  # Needed to break cycles when an exception occurs.
        except BaseException as exc:
            self.set_exception(exc)
            self.__class__._current_tasks.pop(self._loop)
            self = None  # Needed to break cycles when an exception occurs.
            raise
        else:
            result = ensure_future(result, loop=self._loop)
            if isinstance(result, futures.Future):
                # Yielded Future must come from Future.__iter__().
                #
                # FIXME:
                # In the original implementation the code checked for
                # result._blocking; if that was false, the following
                # code ran:
                #
                #  self._loop.call_soon(
                #       self._step, None,
                #       RuntimeError('yield was used instead of yield from in task {!r} with {!r}'.format(self, result)))
                #
                # however, it is not clear, where the _blocking attribute
                # is supposed to be set. Either this is a bug in Brython's
                # implementation of yield from, or it is a bug in the original
                # code; either way, we have to workaround it here:
                #
                # original code:
                #
                # if result._blocking:
                #    result._blocking = False
                #    result.add_done_callback(self._wakeup)
                #    self._fut_waiter = result
                #    if self._must_cancel:
                #        if self._fut_waiter.cancel():
                #            self._must_cancel = False
                # else:
                #    self._loop.call_soon(
                #       self._step, None,
                #       RuntimeError('yield was used instead of yield from in task {!r} with {!r}'.format(self, result)))

                result._blocking = False
                result.add_done_callback(self._wakeup)
                self._fut_waiter = result
                if self._must_cancel:
                    if self._fut_waiter.cancel():
                        self._must_cancel = False
            elif result is None:
                # Bare yield relinquishes control for one event loop iteration.
                self._loop.call_soon(self._step)
            elif inspect.isgenerator(result):
                # Yielding a generator is just wrong.
                self._loop.call_soon(
                    self._step, None,
                    RuntimeError(
                        'yield was used instead of yield from for '
                        'generator in task {!r} with {}'.format(
                            self, result)))
            else:
                # Yielding something else is an error.
                self._loop.call_soon(
                    self._step, None,
                    RuntimeError(
                        'Task got bad yield: {!r}'.format(result)))
            self.__class__._current_tasks.pop(self._loop)
            self = None  # Needed to break cycles when an exception occurs.
        finally:
            pass

    def _wakeup(self, future):
        try:
            value = future.result()
        except Exception as exc:
            # This may also be a cancellation.
            self._step(None, exc)
        else:
            self._step(value, None)
        self = None  # Needed to break cycles when an exception occurs.


# wait() and as_completed() similar to those in PEP 3148.

FIRST_COMPLETED = concurrent.futures.FIRST_COMPLETED
FIRST_EXCEPTION = concurrent.futures.FIRST_EXCEPTION
ALL_COMPLETED = concurrent.futures.ALL_COMPLETED


@coroutine
def wait(fs, *, loop=None, timeout=None, return_when=ALL_COMPLETED):
    """Wait for the Futures and coroutines given by fs to complete.

    The sequence futures must not be empty.

    Coroutines will be wrapped in Tasks.

    Returns two sets of Future: (done, pending).

    Usage:

        done, pending = yield from asyncio.wait(fs)

    Note: This does not raise TimeoutError! Futures that aren't done
    when the timeout occurs are returned in the second set.
    """
    if isinstance(fs, futures.Future) or coroutines.iscoroutine(fs):
        raise TypeError("expect a list of futures, not %s" % type(fs).__name__)
    if not fs:
        raise ValueError('Set of coroutines/Futures is empty.')
    if return_when not in (FIRST_COMPLETED, FIRST_EXCEPTION, ALL_COMPLETED):
        raise ValueError('Invalid return_when value: {}'.format(return_when))

    if loop is None:
        loop = events.get_event_loop()

    fs = {async(f, loop=loop) for f in set(fs)}

    return (yield from _wait(fs, timeout, return_when, loop))


def _release_waiter(waiter, *args):
    if not waiter.done():
        waiter.set_result(None)


@coroutine
def wait_for(fut, timeout, *, loop=None):
    """Wait for the single Future or coroutine to complete, with timeout.

    Coroutine will be wrapped in Task.

    Returns result of the Future or coroutine.  When a timeout occurs,
    it cancels the task and raises TimeoutError.  To avoid the task
    cancellation, wrap it in shield().

    If the wait is cancelled, the task is also cancelled.

    This function is a coroutine.
    """
    if loop is None:
        loop = events.get_event_loop()

    if timeout is None:
        return (yield from fut)

    waiter = futures.Future(loop=loop)
    timeout_handle = loop.call_later(timeout, _release_waiter, waiter)
    cb = functools.partial(_release_waiter, waiter)

    fut = async(fut, loop=loop)
    fut.add_done_callback(cb)

    try:
        # wait until the future completes or the timeout
        try:
            yield from waiter
        except futures.CancelledError:
            fut.remove_done_callback(cb)
            fut.cancel()
            raise

        if fut.done():
            return fut.result()
        else:
            fut.remove_done_callback(cb)
            fut.cancel()
            raise futures.TimeoutError()
    finally:
        timeout_handle.cancel()


@coroutine
def _wait(fs, timeout, return_when, loop):
    """Internal helper for wait() and _wait_for().

    The fs argument must be a collection of Futures.
    """
    assert fs, 'Set of Futures is empty.'
    waiter = futures.Future(loop=loop)
    timeout_handle = None
    if timeout is not None:
        timeout_handle = loop.call_later(timeout, _release_waiter, waiter)
    counter = len(fs)

    def _on_completion(f):
        nonlocal counter
        counter -= 1
        if (counter <= 0 or
            return_when == FIRST_COMPLETED or
            return_when == FIRST_EXCEPTION and (not f.cancelled() and
                                                f.exception() is not None)):
            if timeout_handle is not None:
                timeout_handle.cancel()
            if not waiter.done():
                waiter.set_result(None)

    for f in fs:
        f.add_done_callback(_on_completion)

    try:
        yield from waiter
    finally:
        if timeout_handle is not None:
            timeout_handle.cancel()

    done, pending = set(), set()
    for f in fs:
        f.remove_done_callback(_on_completion)
        if f.done():
            done.add(f)
        else:
            pending.add(f)
    return done, pending


# This is *not* a @coroutine!  It is just an iterator (yielding Futures).
def as_completed(fs, *, loop=None, timeout=None):
    """Return an iterator whose values are coroutines.

    When waiting for the yielded coroutines you'll get the results (or
    exceptions!) of the original Futures (or coroutines), in the order
    in which and as soon as they complete.

    This differs from PEP 3148; the proper way to use this is:

        for f in as_completed(fs):
            result = yield from f  # The 'yield from' may raise.
            # Use result.

    If a timeout is specified, the 'yield from' will raise
    TimeoutError when the timeout occurs before all Futures are done.

    Note: The futures 'f' are not necessarily members of fs.
    """
    if isinstance(fs, futures.Future) or coroutines.iscoroutine(fs):
        raise TypeError("expect a list of futures, not %s" % type(fs).__name__)
    loop = loop if loop is not None else events.get_event_loop()
    todo = {async(f, loop=loop) for f in set(fs)}
    from .queues import Queue  # Import here to avoid circular import problem.
    done = Queue(loop=loop)
    timeout_handle = None

    def _on_timeout():
        for f in todo:
            f.remove_done_callback(_on_completion)
            done.put_nowait(None)  # Queue a dummy value for _wait_for_one().
        todo.clear()  # Can't do todo.remove(f) in the loop.

    def _on_completion(f):
        if not todo:
            return  # _on_timeout() was here first.
        todo.remove(f)
        done.put_nowait(f)
        if not todo and timeout_handle is not None:
            timeout_handle.cancel()

    @coroutine
    def _wait_for_one():
        f = yield from done.get()
        if f is None:
            # Dummy value from _on_timeout().
            raise futures.TimeoutError
        return f.result()  # May raise f.exception().

    for f in todo:
        f.add_done_callback(_on_completion)
    if todo and timeout is not None:
        timeout_handle = loop.call_later(timeout, _on_timeout)
    for _ in range(len(todo)):
        yield _wait_for_one()


@coroutine
def sleep(delay, result=None, *, loop=None):
    """Coroutine that completes after a given time (in seconds)."""
    future = futures.Future(loop=loop)
    h = future._loop.call_later(delay,
                                future._set_result_unless_cancelled, result)
    try:
        return (yield from future)
    finally:
        h.cancel()


def async(coro_or_future, *, loop=None):
    """
    Deprecated alias of ensure_future.
    """
    return ensure_future(coro_or_future, loop=loop)


def ensure_future(coro_or_future, *, loop=None):
    """Wrap a coroutine in a future.

    If the argument is a Future, it is returned directly.
    """
    if isinstance(coro_or_future, futures.Future):
        if loop is not None and loop is not coro_or_future._loop:
            raise ValueError('loop argument must agree with Future')
        return coro_or_future
    elif coroutines.iscoroutine(coro_or_future):
        if loop is None:
            loop = events.get_event_loop()
        task = loop.create_task(coro_or_future)
        if task._source_traceback:
            del task._source_traceback[-1]
        return task
    else:
        raise TypeError('A Future or coroutine is required')


class _GatheringFuture(futures.Future):
    """Helper for gather().

    This overrides cancel() to cancel all the children and act more
    like Task.cancel(), which doesn't immediately mark itself as
    cancelled.
    """

    def __init__(self, children, *, loop=None):
        super().__init__(loop=loop)
        self._children = children

    def cancel(self):
        if self.done():
            return False
        for child in self._children:
            child.cancel()
        return True


def gather(*coros_or_futures, loop=None, return_exceptions=False):
    """Return a future aggregating results from the given coroutines
    or futures.

    All futures must share the same event loop.  If all the tasks are
    done successfully, the returned future's result is the list of
    results (in the order of the original sequence, not necessarily
    the order of results arrival).  If *return_exceptions* is True,
    exceptions in the tasks are treated the same as successful
    results, and gathered in the result list; otherwise, the first
    raised exception will be immediately propagated to the returned
    future.

    Cancellation: if the outer Future is cancelled, all children (that
    have not completed yet) are also cancelled.  If any child is
    cancelled, this is treated as if it raised CancelledError --
    the outer Future is *not* cancelled in this case.  (This is to
    prevent the cancellation of one child to cause other children to
    be cancelled.)
    """
    if not coros_or_futures:
        outer = futures.Future(loop=loop)
        outer.set_result([])
        return outer

    arg_to_fut = {}
    for arg in set(coros_or_futures):
        if not isinstance(arg, futures.Future):
            fut = async(arg, loop=loop)
            if loop is None:
                loop = fut._loop
            # The caller cannot control this future, the "destroy pending task"
            # warning should not be emitted.
            fut._log_destroy_pending = False
        else:
            fut = arg
            if loop is None:
                loop = fut._loop
            elif fut._loop is not loop:
                raise ValueError("futures are tied to different event loops")
        arg_to_fut[arg] = fut

    children = [arg_to_fut[arg] for arg in coros_or_futures]
    nchildren = len(children)
    outer = _GatheringFuture(children, loop=loop)
    nfinished = 0
    results = [None] * nchildren

    def _done_callback(i, fut):
        nonlocal nfinished
        if outer.done():
            if not fut.cancelled():
                # Mark exception retrieved.
                fut.exception()
            return

        if fut.cancelled():
            res = futures.CancelledError()
            if not return_exceptions:
                outer.set_exception(res)
                return
        elif fut._exception is not None:
            res = fut.exception()  # Mark exception retrieved.
            if not return_exceptions:
                outer.set_exception(res)
                return
        else:
            res = fut._result
        results[i] = res
        nfinished += 1
        if nfinished == nchildren:
            outer.set_result(results)

    for i, fut in enumerate(children):
        fut.add_done_callback(functools.partial(_done_callback, i))
    return outer


def shield(arg, *, loop=None):
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
    inner = async(arg, loop=loop)
    if inner.done():
        # Shortcut.
        return inner
    loop = inner._loop
    outer = futures.Future(loop=loop)

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
