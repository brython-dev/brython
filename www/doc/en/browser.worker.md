module **browser.worker**
-------------------------

The module **worker** is an implementation of
[WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
for Brython.

A "worker" is a Python script that receives messages from the main script, and
sends back messages in reply. The worker is executed in a different thread
from the main script; even if it takes a long time to complete, the main
script remains responsive and the browser doesn't freeze.

The main script and the worker communicate by _messages_. A _message_ must be
a "simple" Python object (string, number, list with "simple" items, dictionary
with "simple" keys and values).

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

The main script creates a worker object with the function `create_worker`:

`create_worker(`_worker_id, onready=None, onmessage=None, onerror=None_`)`

> triggers the creation of a _worker object_, based on the script referenced
> by the identifier _worker_id_ (the attribute `id` of the worker script 
> tag). The process is asynchronous
>
> _onready_ is the function called when the worker creation is completed. It
> takes a single argument, the _worker object_ (see below)
>
> _onmessage_ is the function called when the main script receives a message
> from the worker. It takes a single argument, an event object, which has 2
> main attributes : `data` (the message sent by the worker) and `target` (the
> _worker object_)
>
> _onerror_ is the function called if there is an error in the worker. It
> takes a single argument, the error message (a string)

The _worker object_ has a method

`send(`_message_`)`

> sends a message to the worker

### How a worker works

In a worker, the **browser** module doesn't have all the usual attributes, for
instance not those that allow access to the document: for instance the
`document` attribute or the **html** module are not available.

The `window` attribute itself is not defined; instead, an attribute `self`
represents the worker and manages the relationship with the main script it is
associated with.

This object `browser.self` has 2 methods:

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

> sends a message to the main script

### Example

The gallery provides an [example](/gallery/webworker_mdn.html) of a Web
Worker written with Brython.

Code of the main script:

```python
"""Main script."""

from browser import bind, document, worker

result = document.select_one('.result')
inputs = document.select("input")

def onmessage(e):
    """Handles the messages sent by the worker."""
    result.text = e.data

def onready(myWorker):

    @bind(inputs, "change")
    def change(evt):
        """Called when the value in one of the input fields changes."""
        # Send a message (here a list of values) to the worker
        myWorker.send([x.value for x in inputs])

# Create a web worker, identified by a script id in this page.
worker.create_worker("worker", onready, onmessage)
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
        # In the main script, it will be handled by the function passed as the
        # argument "onmessage" of create_worker().
        self.send(workerResult)
    except ValueError:
        self.send('Please write two numbers')
```

### The Worker class (deprecated in version 3.12)

For backwards compatibility, the module exposes a deprecated class to create a
worker in the main script

`Worker(`_worker_id_`)`

> creates a worker object, based on the script referenced by the identifier
> _worker_id_ (the attribute `id` of the worker script tag).

This version is not asynchronous.

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

> sends a message to the worker
