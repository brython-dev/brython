from browser import aio, timer

results = []

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


async def raise_error():
    raise Done

async def ajax_call(url):
    req = await aio.get(url)
    if req.status == 200:
        return (url, len(req.data))
    else:
        return (url, None)

class Lock:
  def __init__(self):
    self._locked = False

  async def acquire(self):
    while self._locked:
      await aio.sleep(0)
    self._locked = True

  def release(self):
    if not self._locked:
      raise RuntimeError('Lock is already released')
    self._locked = False

  def locked(self):
    return self._locked

  async def __aenter__(self):
    await self.acquire()
    return self

  async def __aexit__(self, *l):
    self.release()

aio.Lock = Lock

async def test_lock(): # issue 1205
    # "async with" with alias
    async with aio.Lock() as l:
        pass

    # "async with" without alias
    l = aio.Lock()
    async with l:
      pass

# async comprehensions
async def test_async_comp():
  for url, req in await async_comp():
    print(url, len(req.data))
  print("test async comp ok")

async def async_comp():
  return [(url, await aio.get(url)) for url in ["console.html", "index.html"]]

async def async_gen():
  count = 0
  while count < 5:
    count += 1
    yield count
    await aio.sleep(0.1)

async def test_async_gen(throw, close, expected):
  result = []
  a = async_gen()
  result.append(await a.__anext__())

  a.__aiter__()

  result.append(await a.asend(None))

  if throw:
    try:
      await a.athrow(ZeroDivisionError)
    except Exception as e:
      result.append(type(e))

  if close:
    await a.aclose()

  async for i in a:
    result.append(i)

  assert result == expected,(close, result, expected)
  print(throw, close, "async generator ok")

async def test_async_future():
    """Future is returning value from set_result"""
    fut = aio.Future()
    timer.set_timeout(lambda: fut.set_result("OK"), 10)
    result = await fut
    assert result == "OK", "Result has not the expected value"

async def test_async_future_exc():
    """Future is raising exception from set_exception"""
    fut = aio.Future()
    timer.set_timeout(lambda: fut.set_exception(ValueError("EXPECTED_ERROR")), 10)
    try:
        await fut
    except ValueError as e:
        assert str(e) == "EXPECTED_ERROR"
        return
    assert False, "Error has not been raised"

n1571 = 0
t1571 = []

async def test_fstring_with_global():
    global n1571
    async def g():
        global n1571
        n1571 += 1
        t1571.append(f'{n1571}')
    for p in range(3):
        await g()
    assert t1571 == ['1', '2', '3']
    print('fstring with global ok')

answers = {
    ((1,), (1,), "a1"): -1,
    ((2,), (2,), "a1"): 1,
    ((1,), (2,), "a1"): -1,
    ((2,), (1,), "a1"): 0,
    ((0,), (0,), "a2"): -1,
    ((2,), (2,), "a2"): 1,
    ((0,), (2,), "a2"): -1,
    ((2,), (0,), "a2"): 0}

class Jump(Exception): pass


async def test_issue_1906():

    t = []
    for a, cs in [("a1", {1, 2}), ("a2", {0, 2})]:
        t.append(f'Iteration {a}')
        try:
            t.append(f'cs in the try is {cs}')
            async def f(rel, cs1, cs2):
                if not cs1:
                    raise Jump(rel)
                for c1 in [(c,) for c in sorted(cs1)]:
                    for c2 in [(c,) for c in sorted(cs2)]:
                        p = answers[(c1, c2, a)]
                        if rel == 0 or p in (0, rel):
                             await f(rel or p, cs1.difference(c1), cs2.difference(c2))
            #cs
            t.append(f'cs before calling f is {cs}')
            await f(0, cs, cs)
        except Jump:
            pass
        t.append(f'cs after try is {cs}')

    assert t == ['Iteration a1',
                 'cs in the try is {1, 2}',
                 'cs before calling f is {1, 2}',
                 'cs after try is {1, 2}',
                 'Iteration a2',
                 'cs in the try is {0, 2}',
                 'cs before calling f is {0, 2}',
                 'cs after try is {0, 2}']
    print('issue 1906 ok')

async def main(secs, urls):
    print(f"wait {secs} seconds...")
    await aio.sleep(secs)
    for url in urls:
        r = await ajax_call(url)
        results.append(r)
    report()
    await test_async_for()
    await test_async_with()
    await test_lock()
    await test_async_comp()

    for throw, close, expected in [
            [False, False, [1, 2, 3, 4, 5]],
            [True, False, [1, 2, ZeroDivisionError]],
            [False, True, [1, 2]],
            [True, True, [1, 2, ZeroDivisionError]]]:
        await test_async_gen(throw, close, expected)

    await test_async_future()
    await test_async_future_exc()

    await test_fstring_with_global()

    await test_issue_1906()

    await raise_error()


print("Start...")
aio.run(main(1, ["test_suite.py", "index.html", "unknown.txt"]),
        onerror=handle)
