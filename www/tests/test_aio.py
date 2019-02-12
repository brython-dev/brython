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
    print("wait 3 seconds...")
    await aio.sleep(3)
    for url in urls:
        r = await f(url)
        results.append(r)
    report()
    await foo()
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


async def foo():
    data = []
    async for i, j in AIter():
        data.append([i, j])
    assert data == [[0, 1], [0, 2], [0, 3]]
    print("async for test ok")

async def bar():
    raise Done

def handle(err):
    assert isinstance(err, Done)
    print("handle error ok")

print("Start...")
aio.run(g(["ajax.html", "clock.html", "unknown.txt"]),
        onerror=handle)