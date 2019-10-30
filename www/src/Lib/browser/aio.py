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
  