import asyncio
import sys
import time
import traceback

def discover_brython_test_modules():
    # TODO : Test discovery based on file system paths
    return [
        ("Core language features", [
          ("test_suite.py", "basic test suite"),
          ("test_rmethods.py", "reflected methods"),
          ("test_bytes.py", "bytes"),
          ("test_classes.py", "classes"),
          ("test_decorators.py", "decorators"),
          ("test_descriptors.py", "descriptors"),
          ("test_dict.py", "dicts"),
          ("test_exec.py", "exec / eval"),
          ("test_import.py", "imports"),
          ("test_iterators.py", "iterators"),
          ("test_generators.py", "generators"),
          ("test_list_methods.py", "lists"),
          ("test_memoryview.py", "memoryview"),
          ("test_numbers.py", "numbers"),
          ("test_print.py", "print"),
          ("test_set.py", "sets"),
          ("test_strings.py", "strings"),
          ("test_fstrings.py", "f-strings"),
          ("test_string_format.py", "string format"),
          ("test_string_methods.py", "string methods")
        ]),
        ("DOM interface", [
            ("dom.py", "DOM")
        ]),
        ("Issues", [
          ("issues_gc.py", "issues (GC)"),
          ("issues_bb.py", "issues (BB)"),
          ("issues.py", "issues")
        ]),
        ("Modules", [
          ("test_aio.py", "asyncio"),
          ("test_bisect.py", "bisect"),
          ("test_collections.py", "collections"),
          ("test_dataclasses.py", "dataclasses"),
          ("test_datetime.py", "datetime"),
          ("test_decimals.py", "decimals"),
          ("test_functools.py", "functools"),
          ("test_hashlib.py", "hashlib"),
          ("test_itertools.py", "itertools"),
          ("test_json.py", "JSON"),
          ("test_math.py", "math"),
          ("test_random.py", "random"),
          ("test_re.py", "re"),
          ("test_storage.py", "storage"),
          ("test_struct.py", "struct"),
          ("test_types.py", "types"),
          ("test_unittest.py", "unittest"),
          ("test_urllib.py", "urllib"),
          #("test_indexedDB.py", "indexedDB"),
          #("test_time.py", "time"),
        ])
    ]

def populate_testmod_input(elem, selected=None):
    """Build a multiple selection control including test modules
    """
    from browser import html
    groups = discover_brython_test_modules()
    for label, options in groups:
        if selected and label not in selected:
            continue
        g = html.OPTGROUP(label=label)
        elem <= g
        for filenm, caption in options:
            if filenm == selected:
                o = html.OPTION(caption, value=filenm, selected='')
            else:
                o = html.OPTION(caption, value=filenm)
            g <= o

def run(src):
    t0 = time.perf_counter()
    msg = ''
    aio_manager = AsyncTestManager()
    try:
        ns = {'__name__':'__main__', 'aio':aio_manager}
        exec(src, ns)
        state = 1
    except Exception as exc:
        msg = traceback.format_exc()
        print(msg, file=sys.stderr)
        state = 0
    t1 = time.perf_counter()
    return state, t0, t1, msg, aio_manager

def run_test_module(filename, base_path=''):
    if base_path and not base_path.endswith('/'):
        base_path += '/'
    src = open(base_path + filename).read()
    return run(src)


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
            console.log("Registering test", coro_func.__name__)
            fut = asyncio.ensure_future(coro_func())
            self._tests.append((coro_func.__name__,fut))
            if timeout_sec is not None:
                timeout_at = self._loop.time()+timeout_sec
                handle = self.MASTER_LOOP.call_at(timeout_at, self._set_exception_if_not_done, fut, asyncio.TimeoutError())
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
