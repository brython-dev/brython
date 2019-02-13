from browser import html, aio

results = []

async def f(url):
    req = await aio.get(url)
    if req.status == 200:
        txt = await req.text()
        return (url, len(txt))
    else:
        return (url, None)

async def g(urls):
    print("wait 2 seconds...")
    await aio.sleep(2)
    for url in urls:
        r = await f(url)
        results.append(r)
    report()
    await test_async_for()
    await test_async_with()
    await bar()

def report(*args):
    for url, size in results:
        if size is not None:
            print(f"file at {url}: {size} bytes")
        else:
            print(f"file at {url}: not found")


class Done(Exception):
    pass


class AIter:
    def __init__(self):
        self.count = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        self.count += 1
        if self.count > 3:
            raise StopAsyncIteration
        return (0, self.count)


async def test_async_for():
    data = []
    async for i, j in AIter():
        data.append([i, j])
    assert data == [[0, 1], [0, 2], [0, 3]]
    print("'async for' test ok")

async def bar():
    raise Done

class manager:

    async def __aenter__(self):
        return (1, 2)

    async def __aexit__(self, *exc):
        return False


async def test_async_with():

    async with manager():
        pass

    r1 = []
    async with manager() as xwq:
        r1.append(xwq)
    assert r1 == [(1, 2)]

    r2 = []
    async with manager() as (x, y):
        r2.append(x)
    assert r2 == [1]

    async with manager(), manager():
        pass

    r3 = []
    async with manager() as x, manager() as y:
        r3.append((x, y))
    assert r3 == [((1, 2), (1, 2))]

    r4 = []
    async with manager() as x, manager():
        r4.append(x)
    assert r4 == [(1, 2)]

    print("'async with' test ok")
    
def handle(err):
    assert isinstance(err, Done)
    print("handle error ok")

print("Start...")
aio.run(g(["test_suite.py", "index.html", "unknown.txt"]),
        onerror=handle)