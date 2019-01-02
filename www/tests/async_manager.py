import asyncio

from browser import console

class AsyncTestManager:
    R_OK = 1
    R_TIMEOUT_FAILURE = 2
    R_ASSERTION_FAILURE = 3
    R_OTHER_FAILURE = 4
    MASTER_LOOP = asyncio.new_event_loop()

    def __init__(self):
        self._tests = []
        self._loop = asyncio.new_event_loop()
        self._global_timeout_at = self._loop.time()
        asyncio.set_event_loop(self._loop)

    def async_test(self, timeout_sec=None):
        def _decorator(coro_func):
            fut = asyncio.ensure_future(coro_func())
            self._tests.append((coro_func.__name__, fut))
            if timeout_sec is not None:
                timeout_at = self._loop.time()+timeout_sec
                handle = self.MASTER_LOOP.call_at(timeout_at, 
                    self._set_exception_if_not_done, fut, asyncio.TimeoutError())
                fut.add_done_callback(lambda *args: handle.cancel())
                if timeout_at > self._global_timeout_at:
                    self._global_timeout_at = timeout_at
            return coro_func
        return _decorator

    def _set_exception_if_not_done(self, fut, ex):
        if not fut.done():
            fut.set_exception(ex)

    @property
    def failed(self):
        for _, fut in self._tests:
            if fut.done() and fut.exception() is not None:
                return True
        return False

    def print_results(self):
        if not self._tests:
            print("<no async tests>")
            return
        failed_count = 0
        for test_name, fut in self._tests:
            ex = fut.exception()
            if ex is None:
                print(test_name, "passed.")
                continue
            elif isinstance(ex, asyncio.TimeoutError):
                print(test_name, "timed out.")
            elif isinstance(ex, AssertionError):
                print(test_name, "failed with assertion error:", ex.args)
            else:
                print(test_name, "failed with exception", ex)
            failed_count += 1
        if failed_count > 0:
            print("<async tests failed {fail} out of {total}>".format(
                fail=failed_count,
                total=len(self._tests)
            ))
        else:
            print("<async tests passed>")


    def count_tests(self, pending_only=False):
        if pending_only:
            count = 0
            for _, fut in self._tests:
                if not fut.done():
                    count += 1
            return count
        return len(self._tests)


    @asyncio.run_async(loop=MASTER_LOOP)
    def finish(self, wait_secs=0.1):
        if self._loop.pending_futures():
            if self._global_timeout_at > self._loop.time():
                yield from asyncio.sleep((self._global_timeout_at - self._loop.time()), loop=AsyncTestManager.MASTER_LOOP)
            self._loop.send_exception_to_pending_futures(asyncio.TimeoutError())
            yield from asyncio.sleep(wait_secs, loop=AsyncTestManager.MASTER_LOOP)
        self._loop.close()
        return self
