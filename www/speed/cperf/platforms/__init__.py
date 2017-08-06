_ASYNC = False


class Reporter:
    pass


class Config:
    pass


class ImmediateFuture:
    pass


class asyncio:
    pass


class AsyncioStub:

    @classmethod
    def coroutine(cls, f):
        return f


def get_current_platform():
    import platform
    return platform.python_implementation()


def get_supported_platforms():
    import os
    platforms = []
    for f in os.listdir(os.path.dirname(__file__)):
        if os.path.isdir(f):
            platforms.append(f)
    return platforms


def load_platform():
    global Reporter, Config, _ASYNC, asyncio, ImmediateFuture
    platform = get_current_platform()
    _platform_module = __import__('cperf.platforms.'+platform, ['PlatformReporter', 'PlatformConfig', '_ASYNC', 'ImmediateFuture'])
    Reporter = _platform_module.PlatformReporter
    Config = _platform_module.Config
    _ASYNC = _platform_module._ASYNC
    if _ASYNC:
        import asyncio as async
        asyncio = async
        # Python standard lib only has ensure_future
        # starting from version 3.4
        if not hasattr(asyncio, 'ensure_future'):
            asyncio.ensure_future = asyncio.async

        try:
            from asyncio import ImmediateFuture as IF
            ImmediateFuture = IF
        except:
            class ImmediateFutureStub(asyncio.Future):
                """
                    Stub for CPython use, wraps a regular function in a Future
                """
                def __init__(self, func, *args, **kwargs):
                    super().__init__()
                    self._func = func
                    self._args = args
                    self._kwargs = kwargs
                    self._loop = asyncio.get_event_loop()
                    self._loop.call_soon(self.do)

                def do(self):
                    try:
                        res = self._func(*self._args, **self._kwargs)
                        self.set_result(res)
                    except Exception as ex:
                        self.set_exception(ex)
            ImmediateFuture = ImmediateFutureStub
    else:
        asyncio = AsyncioStub


load_platform()
