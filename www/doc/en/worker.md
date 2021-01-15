module **browser.worker**
-------------------------

The module **worker** is an implementation of
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
for Brython.

A "worker" is a Python script that receives messages from the main script, and
sends back messages in reply. The worker is executed in a different thread
from the main script; even if it takes a long time to complete, the main
script remains responsive and the browser doesn't freeze.

A worker has a restricted access to the browser features ; for instance it
can't access the document currently displayed, nor modify it.

### Inserting a worker script in an HTML page

A worker script is inserted in an HTML page with a specific form of the
`<script type="text/python">` tag:

```xml
<script type="text/python" class="webworker" id="myworker">
# instructions of the worker program
</script>
```

The attribute `src` can also be used to load the worker script:

```xml
<script type="text/python" class="webworker" id="myworker" src="myworker.py">
</script>
```

Adding the "webworker" class specifies that the script must not be executed as
an ordinary Python script, but that it is intended to be used as a worker by
a main script.

The attribute `id` is mandatory (an `AttributeError` is raised otherwise) ; it
is used by the main script as a reference to the worker script.

### Using a worker from the main script

The main script imports module **browser.worker** and creates a worker object
with the class `Worker`:

`Worker(`_worker_id_`)`

> creates a worker object, based on the script referenced by the identifier
> _worker_id_ (the attribute `id` of the worker script tag).

The instances of the `Worker` class have 2 methods:

`bind(`_evt, function_`)`

> binds the _function_ to the event _evt_. The main event is "message" : it is
> triggered when the worker sends a message to the main script.

> The _function_ takes a single parameter, an event object with the attribute
> `data` whose value is the value of the message sent by the worker.

> Also note that instead of binding the event by the syntax

<blockquote>
```python
def callback(evt):
    ...

worker.bind("message", callback)
```
</blockquote>
> you can use the function `bind()` in the module **browser** as a decorator:
<blockquote>
```python
from browser import bind

@bind(worker, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> sends a message to the worker. The message must be a "simple" Python object
> (string, number, list with "simple" items, dictionary with "simple" keys and
> values)

### How a worker works

In a worker, the **browser** module doesn't have all the usual attributes, for
instance not those that allow access to the document: for instance the
`document` attribute or the **html** module are not available.

The `window` attribute itself is not defined; instead, an attribute `self`
represents the worker and manages the relationship with the main script it is
associated with.

This object `browser.self` has attributes similar to those of the worker
object in the main script:

`bind(`_evt, function_`)`

> binds the _function_ to the event _evt_. The main event is "message" : it is
> triggered when the main script sends a message to the worker.

> The _function_ takes a single parameter, an event object with the attribute
> `data` whose value is the value of the message sent by the main script.

> Also note that instead of binding the event by the syntax

<blockquote>
```python
def callback(evt):
    ...

self.bind("message", callback)
```
</blockquote>

> you can use the function `bind()` in the module **browser** as a decorator:

<blockquote>
```python
from browser import bind, self

@bind(self, "message")
def callback(evt):
    ...
```
</blockquote>

`send(`_message_`)`

> sends a message to the main script. The message must be a "simple" Python
> object (string, number, list with "simple" items, dictionary with "simple"
> keys and values)

### Example

The gallery provides an [example](/gallery/webworker_mdn.html) of a Web
Worker written with Brython.

Code of the main script:

```python
"""Main script."""

from browser import bind, document, worker

result = document.select_one('.result')
inputs = document.select("input")

# Create a web worker, identified by a script id in this page.
myWorker = worker.Worker("worker")

@bind(inputs, "change")
def change(evt):
    """Called when the value in one of the input fields changes."""
    # Send a message (here a list of values) to the worker
    myWorker.send([x.value for x in inputs])

@bind(myWorker, "message")
def onmessage(e):
    """Handles the messages sent by the worker."""
    result.text = e.data
```

Code of the worker script:

```python
"""Web Worker script."""

# In web workers, "window" is replaced by "self".
from browser import bind, self

@bind(self, "message")
def message(evt):
    """Handle a message sent by the main script.
    evt.data is the message body.
    """
    try:
        result = int(evt.data[0]) * int(evt.data[1])
        workerResult = f'Result: {result}'
        # Send a message to the main script.
        # In the main script, it will be handled by the function bound to
        # the event "message" for the worker.
        self.send(workerResult)
    except ValueError:
        self.send('Please write two numbers')
```
