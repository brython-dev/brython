from _aio import * # in libs/_aio.js


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


class QueueEmpty (Exception) :
    pass


class QueueFull (Exception) :
    pass


class Queue(object):

    def __init__(self, maxsize=0):
        from collections import deque # lazy import
        self.maxsize = maxsize
        self.data = deque(maxlen=maxsize or None)
        self.readers = deque()
        self.writers = deque()
        self.joiners = deque()
        self.tasks = 0

    def qsize(self):
        return len(self.data)

    def empty(self):
        return self.qsize() == 0

    def full(self):
        return self.maxsize and self.qsize() == self.maxsize

    async def get(self):
        if self.empty():
            future = Future()
            def reader(val):
                future.set_result(val)
            self.readers.append(reader)
            return await future

        item = self.get_nowait()
        if self.writers:
            # unblock one writer
            writer = self.writers.popleft()
            writer()
        return item

    def get_nowait(self):
        try :
            return self.data.popleft()
        except IndexError :
            raise QueueEmpty()

    async def put(self, item):
        if self.full():
            future = Future()
            def writer():
                self.put_nowait(item)
                future.set_result(True)
            self.writers.append(writer)
            await future
            return

        if self.readers:
            # directly pass item to the reader
            self.tasks += 1
            reader = self.readers.popleft()
            reader(item)
        else :
            # self.tasks is incremented in put_nowait
            self.put_nowait(item)

    def put_nowait(self, item):
        if self.full() :
            raise QueueFull()
        self.data.append(item)
        self.tasks += 1

    async def join(self):
        if self.tasks > 0:
            future = Future()
            def setres():
                future.set_result(True)
            await future

    def task_done(self):
        if self.tasks == 0:
            raise ValueError("no tasks")
        self.tasks -= 1
        if tasks == 0:
            for joiner in self.joiners:
                joiner()