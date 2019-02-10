from browser import console, aio

async def wait_secs(s, result):
    await aio.sleep(s)
    console.log("Returning result", result)
    return result

async def test_simple_coroutine():
    console.log("coro_wait_secs")
    coro_wait_secs = wait_secs(0.1, 10)
    console.log("ensuring future")
    fut = await coro_wait_secs

    console.log("asserting")
    assert aio.iscoroutine(coro_wait_secs), "Result of running a coroutine function should be a coroutine object"
    assert aio.iscoroutinefunction(wait_secs), "asyncio.coroutine decorator should return a coroutine function"
    console.log("asserts ok")
    assert fut == 10, "Future result different from expected"

aio.run(test_simple_coroutine())