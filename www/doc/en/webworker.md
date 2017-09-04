module **browser.webworker**
----------------------------

The webworker module provides a basic integration between Brython and [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API).
It allows one to run a python script in a web worker with relative ease. Currently there are two classes which can be used.
A basic Worker class and a RPCWorker class.


## Basic Worker class

This class allows one to run a script in the webworker communicating with it by sending messages.

We start the web worker by creating a new instance of the `WorkerParent` class. The constructor takes an
url of the script to run (either absolute or relative to the brython source directory), arguments to the 
script (available via `sys.argv` in the script) and the contents of `os.environ` for the script

```python
from browser import webworker as ww
w = ww.WorkerParent('web_workers/test_worker.py',[1,2,3],{"test":"Ahoj"})
```

Communicating with the worker is done by sending messages, represented by the `Message` class. Note
that while it will take some time before the worker is up and running (the worker is ready when
its status `w.status` is `S_RUNNING`), we can start sending messages right away (they will be queued
and sent when the worker is ready)

```python
m = ww.Message('ping',"hi")
r = w.post_message(m,want_reply=True)
```

Posting the message is done using the `WorkerCommon.post_message` method. It takes the message
(an instance of the `Message` class) as the first parameter. The second parameter (`want_reply`)
indicates that we want to wait for a reply to the message. The result will be a `asyncio.Future`
instance which will be resolved with the reply once it arrives. Optionally, one can provide
a timeout (the `timeout`) in seconds after which the future will be resolved with a timeout exception.

If we don't care about the reply (or if we don't expect a reply), we can omit the two parameters
and just do

```python
w.post_message(ww.Message('quit',None))
```

Implementing the worker is straightforward. We first define methods which will handle the different
messages:
    
```python
from browser.webworker import current_worker, Message
from browser import console

from sys import argv
from os import environ

def pong(self, message, **_):
    print('Web worker received message (',message.id,')', message.name, message.data)
    current_worker.post_reply(message, Message('pong', message.data))
        
def quit(self, *args, **kwargs):
    current_worker.terminate()
    
```

Notice how we used `current_worker.post_reply` instead of `current_worker.post_message`
to indicate, that the message is a reply to a received message.

Then we need to tie these methods to the relevant messages. This is done through the
`WorkerCommon.bind_message` method. Its first argument is the name of the message and
the second argument is the method which will be called when a message arrives.

```
current_worker.bind_message('ping', pong)
current_worker.bind_message('quit', quit)
```

Finally, we should let the parent know, that we are ready to start accepting messages.
This is done by the `current_worker.exec` method.

```python
print("Starting test worker with args:", argv, "and environment", environ)
current_worker.exec()
```

The `current_worker` is an instance of the `WorkerChild` class and is only available in
the worker (in the main thread it is always).


## RPC Worker class

The `WorkerParent` and `WorkerChild` classes (representing the two sides of the connection)
are very simple and can be used to build up more useful workers. An example of this is the
`RPCWorkerParent` and `RPCWorkerChild` classes which are useful in a scenario, where we'd
like to run python methods in a webworker as though they were running in the main thread.
A typical program could look like this:

```python
from browser import webworker as ww
from asyncio import coroutine

@coroutine
def main(w):
    # Wait for the worker to start
    yield w.wait_for_status(ww.S_RUNNING)
    
    # Call the remote add method
    a = yield w.add(10,20)
    assert a == 30
    
    # Call the remote log method
    yield w.log("Test output")
    
    # Destroy the worker
    w.terminate()

# Create a new instance of the worker
w = ww.RPCWorkerParent('web_workers/test_rpc.py',[1,2,3],{"USER":"nobody"})

# Run the main method
main(w)
```
 
The difference from the simple `WorkerParent` example is that we now need to really wait
for the worker to start up (until then we don't know what methods it provides). So we
wrap everything in a `main` coroutine (async def in recent Python), where we can wait for the worker to be ready
by yielding from (awaiting in recent Python) the `WorkerCommon.wait_for_status` method.
 
Then we call the `add` method, which needs to be defined in the worker, where it gets executed. The
method returns an `asyncio.Future` instance representing the return value of the method call. Yielding
it in our coroutine pauses its run until it is available. Then we call the `log` method and finally
we terminate the worker using the `WorkerCommon.terminate` method.

Implementing the worker part is very similar to the previous case. The main difference is that
instead of using the method `WorkerCommon.bind_message` we use the method `RPCWorkerChild.register_method`:

```python
from browser.webworker import current_worker, Message
from browser import console 

from sys import argv
from os import environ

def add(x, y):
    """Adds two numbers"""
    return x+y

def log(*args):
    print(*args)

# Register the `add` and `log` methods.
current_worker.register_method(add)
current_worker.register_method(log)```python


# Tell the parent we are ready
print("Starting test RPC worker with args:", argv, "and environment", environ)
current_worker.exec()import asyncio
```


## Creating new Worker classes

Each new worker-type needs two classes --- the Parent and the Child class --- representing the worker in
the main thread and in the worker thread, respectively. They are bound together using the `CHILD_CLASS`
attribute of the Parent Worker class. This should be a string which can be used to import the Child
class in the webworker (e.g. the `RPCWorkerParent` class has the attribute set to `"browser.webworker.RPCWorkerChild"`).
Then the module takes care of instantiating the Child class in the web worker and storing it in
`webworker.current_worker`. 
