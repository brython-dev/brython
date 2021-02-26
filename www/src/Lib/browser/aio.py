from _aio import * # in libs/_aio.js
from browser import window


def _task(coro, Id, block):
    async def _task():
        block[Id] = None
        try:
            block[Id] = await coro
        except Exception as e:
            block[Id] = e

        if not block[Id]:
          del block[Id]
    return _task()


async def gather(*coros, rate=0):
    dones = {}
    counts = 0
    for c in coros:
        run(_task(c, f'task{counts}', dones))
        counts += 1
    while not all(dones.values()):
        await sleep(rate)
    return dones


class Future:
    """Help manage callback based APIs with async

    This class tries to match asyncio.Future
    """

    def __new__(cls, *args, **kwargs):
        methods = {}
        def executor(resolve_cb, reject_cb):
            methods["resolve"] = resolve_cb
            methods["reject"] = reject_cb
        promise = window.Promise.new(executor)
        promise._methods = methods
        promise.set_result = cls.set_result.__get__(promise)
        promise.set_exception = cls.set_exception.__get__(promise)
        return promise

    def set_result(self, value):
        self._methods["resolve"](value)

    def set_exception(self, exc):
        self._methods["reject"](exc)
