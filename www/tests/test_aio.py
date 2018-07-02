from browser import console
import asyncio

async def wait_secs(s, result):
    await asyncio.sleep(s)
    console.log("Returning result", result)
    return result


@aio.async_test(0.5)
def test_simple_coroutine():
    console.log("coro_wait_secs")
    coro_wait_secs = wait_secs(0.1, 10)
    console.log("ensuring future")
    fut = asyncio.ensure_future(coro_wait_secs)

    console.log("asserting")
    assert asyncio.iscoroutine(coro_wait_secs), "Result of running a coroutine function should be a coroutine object"
    assert asyncio.iscoroutinefunction(wait_secs), "asyncio.coroutine decorator should return a coroutine function"
    assert isinstance(fut, asyncio.Future), "ensure_future should return a future"

    console.log("yielding")
    result = yield from fut

    console.log("asserting")
    assert fut.result() == result, "yield from future should return its result"
    assert result == 10, "Future result different from expected"
