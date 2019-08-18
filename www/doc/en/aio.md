module **browser.aio**
-----------------------

This module supports asynchronous programming in Brython, using the keywords
`async` and `await`.

It replaces the **asyncio** module in CPython standard library, which cannot
work in the browser context:

1. it uses blocking functions such as `run()` or `run_until_complete()`,
and the way browsers work make it impossible to define functions whose
execution is suspended until an event occurs.

2. the browser has its own implicit event loop, it is not possible to define
another one as the **asyncio** modules does with the function
`set_event_loop()`.

The module **browser.aio** defines the following asynchronous functions:

### Ajax requests

`ajax(`_method, url[, format="text", headers=None, data=None, cache=False]_`)`

> `req = await ajax("GET", url)` inside an asynchronous function gives back
> control to the main program, and resumes the function when the Ajax request
> of the type _method_ ("GET", "POST", "PUT", etc.) to the specified URL is
> completed. The return value is an instance of the class `Request` (see
> below).

> _format_ is the expected response format. It can be one of:

>> "text" : the response is a string

>> "binary" : an instance of class `bytes`

>> "dataURL" : a string formatted as
>> [dataURL](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs)

> _headers_ is a dictionary with the HTTP headers to send with the request.

> _data_ is a string or a dictionary that will be sent with the request to
> form the query string for a "GET" request, or the request body for "POST".

> _cache_ is a boolean indicating if the browser cache should be used

`get(`_url[, format="text", headers=None, data=None, cache=False]_`)`

> shortcut for `ajax("GET", url...)`

`post(`_url[, format="text", headers=None, data=None]_`)`

> shortcut for `ajax("POST", url...)`

#### `Request` instances

Instances of class `Request`, as returned by `await ajax()`, `await get()` or
`await post()`, have the following attributes:

> `data` : the response body, with the format defined by argument _format_

> `response_headers` : a dictionary matching the response headers

> `status` : HTTP response status as an integer (200, 404...)

> `statusText` : HTTP response status as a string ("200 Ok", "404 File not
> found"...)


### Other asynchronous functions

`event(`_element, name_`)`

> `evt = await aio.event(element, "click")` suspends execution of an
> asynchronous function until the user clicks on the specified element.
> The return value is an instance of the `DOMEvent` class (cf. section
> [events](../events.html))

`sleep(`_seconds_`)`

> In an asynchronous function, `await sleep(n)` gives back control to the main
> program and resumes function execution after `n` seconds.

### Running an asynchronous function

`run(`_coroutine_`)`

> Runs a coroutine, ie the result of a call to an asynchronous function
> defined by `async def`. This is a _non blocking_ function: it doesn't wait
> until the asynchronous function is completed to execute the instructions
> in the following lines. The time when the next instructions are run is
> not (easily) predictable.

### Examples

Entering text in an INPUT element (customised `input()` function)

```python
from browser import alert, document, html, aio

async def main():
    input = html.INPUT()
    document <= input
    while True:
        ev = await aio.event(input, "blur")
        try:
            v = int(ev.target.value)
            input.remove()
            alert(f"Value: {v}")
            break
        except ValueError:
            input.value = ""

aio.run(main())
```

Reading files asynchronously

```python
from browser import document, html, aio

async def main():
    # Text file
    req = await aio.ajax("GET", "test.html")
    print(len(req.data))
    # Binary file
    req = await aio.get("memo.pdf", format="binary")
    print(len(req.data))
    # Read binary file as dataURL
    req = await aio.get("eraser.png", format="dataURL")
    # display the image in an IMG tag
    document <= html.IMG(src=req.data)

aio.run(main())
```
