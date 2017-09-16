module **asyncio**
-----------------------

The module asyncio provides a basic [asyncio](https://docs.python.org/3.4/library/asyncio-dev.html)-style
eventloop to support writing asynchronous code without being forced to "loopback hell".

Basic `asyncio` style programming using `Future`'s and `coroutine` is
supported. E.g. you can write

```python
import asyncio

@asyncio.coroutine
def test_wget(urls):
    results = []
    for u in urls:
        req = yield asyncio.HTTPRequest(u)
        results.append(req.response)
    return results

t = asyncio.ensure_future(test_wget(['http://google.com','http://wikipedia.org']))

```

and, eventually, `t.result()` will return a list containing the html code
for the requested pages. The code uses the `HTTPRequest` future provided
by Brython's asyncio implementation (it takes a mandatory url argument and
optional keyword arguments `method` ('GET' or 'POST') and `data` for POST-requests).

However, some more advanced `asyncio`'s functionality is not implemented. Either
it does not make sense in the browser (TCP Servers, ...), or it might make sense
but is currently unsupported (e.g. Threading/Multiprocess could, in theory, be implemented using
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)).

For more information on `asyncio` and `Futures`, see
[PEP 3156](https://www.python.org/dev/peps/pep-3156/) and
[PEP 3148](https://www.python.org/dev/peps/pep-3148/) or
[AsyncIO Documentation](https://docs.python.org/3.4/library/asyncio-dev.html).
