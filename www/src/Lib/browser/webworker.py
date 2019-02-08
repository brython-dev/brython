"""
    The webworker module provides a basic integration between Brython and 
    [WebWorkers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)).
    It allows one to run a python script in a web worker with relative ease. Currently 
    there are two classes which can be used. A basic Worker class and a RPCWorker class.
"""
from browser import window

import asyncio
import os
import sys

DEFAULT_BRYTHON_OPTIONS = getattr(__BRYTHON__, '$options')

CHILD_WORKERS = []

# The following are possible states
# the worker can be in throughout
# its life

S_CREATED = 0       # The worker has been created (e.g. new Worker())
S_LOADING = 1       # The webworker started loading brython
S_LOADED = 2        # The webworker finished loading brython and
                    # is now starting to run the python script
S_RUNNING = 3       # The python script finished its initialization
                    # and is ready to work
S_FINISHED = 4      # The worker finished without error (exit(0))
S_TERMINATED = 5    # The worker was terminated

try:
    _Worker = window.Worker.new
    _can_launch_workers = True
except:
    _can_launch_workers = False

class WorkerError(Exception):
    pass


class Message:
    """
        A class representing a message to be sent to/from the webworker.
        It has a name (message type) and some data (message payload).
        These are mandatory arguments to be passed to the constructor.
    """
    def __init__(self, name, data, src=None, id=-1):
        self.name = name
        self.data = data
        self.id = id
        self.is_reply = False
        self.src = None
        
    def __str__(self):
        return "MSG("+str(self.name)+":"+str(self.id)+"):"+str(self.data)

class Reply(asyncio.Future):
    """
        A future representing a reply to a message. Not to be used directly
        by the user but is created, e.g., by the `post_message` method when
        called with `want_reply=True`.
    """
    _LAST_MESSAGE_ID = 0
    _WAITING_REPLIES = {}

    @classmethod
    def _next_id(cls):
        cls._LAST_MESSAGE_ID +=1
        return cls._LAST_MESSAGE_ID

    @classmethod
    def terminate(cls, worker, reason=None):
        wr = {}
        text = "Worker Terminated"
        if reason is not None:
            text += "\n" + str(reason)
        for id, reply in cls._WAITING_REPLIES.items():
            if reply._worker == worker:
                reply.set_exception(WorkerError(text))
            else:
                wr[id] = reply
        cls._WAITING_REPLIES = wr

    def __init__(self, message, timeout, worker=None):
        super().__init__()
        message.id = self._next_id()
        self._wait_id = message.id
        self._WAITING_REPLIES[message.id] = self
        self._worker = worker
        self.add_done_callback(self.finish_waiting)
        if timeout:
            self._timeout = self._loop.call_later(timeout, self.set_exception, asyncio.TimeoutError())
        else:
            self._timeout = None

    def finish_waiting(self, *args, **kwargs):
        if self._timeout:
            self._timeout.cancel()

        if self._wait_id in self._WAITING_REPLIES:
            del self._WAITING_REPLIES[self._wait_id]

    def set_result(self, result):
        super().set_result(result)

class WorkerCommon:
    """
        This class implements methods useful both in the main thread
        and in the worker thread.
    """
            
    
    @property
    def status(self):
        """
            The status of the worker:
            
               S_CREATED        - The worker has been created (e.g. new Worker())
               S_LOADING        - The webworker started loading brython
               S_LOADED         - The webworker finished loading brython and
                                  is now starting to run the python script
               S_RUNNING        - The python script finished its initialization
                                  and is ready to work
               S_FINISHED       - The worker finished without error (exit(0))
               S_TERMINATED     - The worker was terminated
            
        """
        return self._status
    
    def __init__(self, worker):
        self._status = S_CREATED
        self._event_handlers = {}
        self._message_handlers = {}
        self._worker = worker
        self._worker.addEventListener('message', self._event_handler)
        self._worker.addEventListener('error', self.__error_handler)
        self._queued_messages = []
        self.bind_event('message', self._message_handler)
        self.bind_event('ready', self._post_queued_messages)
               
    def post_message(self, message, want_reply=False, timeout=None):
        """
            Sends the message `message` (an instance of the `Message` class)
            to the other side. If `want_reply` is set to true, the method
            returns a future representing the potential reply to this message.
            The optional `timeout` parameter specifies how long in seconds the future
            should wait for a reply before resolving itself with a timeout exception,
        """
        if self.status > S_RUNNING:
            raise WorkerError("Invalid state")
        if want_reply:
            ret = Reply(message, timeout, worker=self)
        else:
            ret = None
        self._queued_messages.append({'type':'message', 'name':message.name, 'id':message.id, 'data':message.data})
        if self.status == S_RUNNING:
            self._post_queued_messages()
        return ret
    
    def post_reply(self, message, reply):
        """
            Sends the message `reply` as a reply to the message `message`.
        """
        payload = {'type':'message', 'name':reply.name, 'id':reply.id, 'data':reply.data}
        if message.id:
            payload['reply_to']=message.id
        self._queued_messages.append(payload)
        if self.status == S_RUNNING:
            self._post_queued_messages()
    
    def _post_queued_messages(self, *_, **kwargs):
        for payload in self._queued_messages:
            self._worker.postMessage(payload)
        self._queued_messages.clear()

    def bind_event(self, event, handler):
        """
            Registers `handler` to be called whenever the `event` is emitted
            by the class. Events are emitted when different things happen.
            For example when the state of the worker changes, the following
            events re emitted:
            
               exited
               loaded
               ready
        """                         
        self._bind(self._event_handlers, event, handler)
    
    def unbind_event(self, event=None, handler=None):
        self._unbind(self._event_handlers, event, handler)
        
    def bind_message(self, message, handler):
        """
            Registers the method `handler` to be called whenever a message of type `message`
            arrives.
        """
        self._bind(self._message_handlers, message, handler)
    
    def unbind_message(self, message=None, handler=None):
        self._unbind(self._message_handlers, message, handler)
    
    
    def _bind(self, handler_list, event, handler):
        handlers = handler_list.get(event, [])
        handlers.append(handler)
        handler_list[event] = handlers
        
    def _unbind(self, handler_list, event=None, handler=None):
        if event is None and handler is None:
            handler_list = {}
        elif handler is None:
            handler_list[event] = []
        elif event is None:
            for ev, handlers in handler_list.items():
                if handler in handlers:
                    handlers.remove(handler)
        else:
            handlers = handler_list.get(event, [])
            if handler in handlers:
                handlers.remove(handler)
                
    def _emit_event(self, event, data=None):
        self._emit(self._event_handlers, event, data)
        
    def _emit_message(self, message, msg):
        self._emit(self._message_handlers, message, msg)
        
    def _emit(self, handler_list, event, data=None):
        try:
            handlers = handler_list.get(event, [])
            for h in handlers:
                h(event, data, src=self)
        except Exception as ex:
            # TODO: Add error handling
            print("Exception", str(ex), "while handling", event, "data=", str(data.data))

                
    def __error_handler(self, error, *_, **kwargs):
        self._emit_event('error', error)
        
    def _event_handler(self, event, *_, **kwargs):
        try:
            event_type = event.data['type']
            self._emit_event(event_type, event.data)
        except:
            pass
        
    def _message_handler(self, event, data, *_, **kwargs):
        msg = Message(data['name'],data['data'], src=self, id=data['id'])
        if 'reply_to' in data:
            msg.is_reply = True
            reply = Reply._WAITING_REPLIES.get(data['reply_to'], None)
            if reply:
                reply.set_result(msg)
        else:
            self._emit_message(msg.name, msg)


class WorkerParent(WorkerCommon):
    """
        The class representing the worker in the main thread.
    """
    WORKER_SCRIPT = sys.base_exec_prefix+'/web_workers/worker.js'
    CHILD_CLASS = 'browser.webworker.WorkerChild'
    
    def __init__(self, url, argv=[], environ={}, brython_options=DEFAULT_BRYTHON_OPTIONS):
        """
            Creates a new Web Worker and runs the python script downloaded from `url`
            in it. The parameter `url` can be either relative to the directory where
            Brython is installed or it must be an absolute url (i.e. start with '/' or 'http:').
            
            The parameter `argv` is a list of arguments which will be available as `sys.argv` in the worker.
            The parameter `environ` is a dictionary which will be available as `os.environ` in the worker.
            The parameter `brython_options` will be passed to the `brython` function when called from
            the webworker. If it contains an `imports` key, this should be a list of javascript files
            to be loaded instead of the standard brython files. If it contains the key `import_dist`,
            it will load brython from the `brython_webworker_dist.js` script.  By default it uses the
            same options passed to the parent `brython` function.
        """
        if not _can_launch_workers:
            raise WorkerError("Cannot spawn workers (webkit based browsers don't support running webworkers inside webworkers)")
        super().__init__(_Worker(self.WORKER_SCRIPT,{"name":url}))
        self.bind_event('status', self._status_handler)
        self.bind_event('error', self._error_handler)
        self._status_waiters = []
        self._status = S_LOADING
        self._error = None
        self._worker.postMessage({
                'program':{'url':url},
                'brython_options':brython_options,
                'argv':[url]+argv,
                'env':environ,
                'worker_class':self.CHILD_CLASS
         })
        CHILD_WORKERS.append(self)
        
    def terminate(self):
        """
            Forcibly Terminates the worker.
            
            Raises an error if the worker is not running
        """
        if self.status > S_RUNNING:
            raise WorkerError("Invalid state")
        self._worker.terminate()
        self._status = S_TERMINATED
        Reply.terminate(self, self._error)
        self._emit_event('exited')
        
    def wait_for_status(self, status):
        """
            Returns a future which will be resolved when
            the worker transitions to the given status (or any later status)
        """
        fut = asyncio.Future()
        setattr(fut, 'waiting_for', status)
        if status <= self.status:
            fut.set_result(True)
        else:
            self._status_waiters.append(fut)
        return fut
        
        
    def _status_handler(self, event, data, *_, **kwargs):
        self._status = data.status
        keep = []
        for f in self._status_waiters:
            if f.waiting_for <= self._status:
                f.set_result(True)
            else:
                keep.append(f)
        self._status_waiters = keep
        if self._status >= S_FINISHED:
            self._emit_event('exited')
            if 'error' in data:
                self._error = data.error
            Reply.terminate(self, self._error)
            CHILD_WORKERS.remove(self)
        elif self._status == S_LOADED:
            self._emit_event('loaded')
        elif self._status == S_RUNNING:
            self._emit_event('ready')
            
    def _error_handler(self, error, data, *_, **kwargs):
        self._error = data
        self.terminate()
        
    
class WorkerChild(WorkerCommon):
    """
        The class representing the worker in the worker thread. Should not
        be instantiated by the user directly. Instead an instance of this
        class will be provided as `current_worker` to every worker started
        by the `WorkerParent` class.
    """
    def __init__(self):
        super().__init__(__BRYTHON__._WORKER)
        self._argv = sys.argv
        self._environ = __BRYTHON__._ENV
        self._status = S_LOADED
        
    def exec(self):
        """
            This method should be called from the worker script when it is
            ready to start receiving messages from the main thread.
        """
        self._status = S_RUNNING
        self._worker.postMessage({'type':'status', 'status':S_RUNNING})
        self._emit_event('ready')
        
    def terminate(self):
        """
            The worker script can use this method to gracefully shutdown the worker.
        """
        if self.status > S_RUNNING:
            raise WorkerError("Invalid state")
        self._status = S_FINISHED
        self._emit_event('exited')
        self._worker.postMessage({'type':'status', 'status':S_FINISHED})
        self._worker.close()
        
class RPCWorkerParent(WorkerParent):
    CHILD_CLASS = 'browser.webworker.RPCWorkerChild'
    
    def __init__(self, url, argv=[], environ={}, brython_options=DEFAULT_BRYTHON_OPTIONS):
        super().__init__(url, argv, environ, brython_options)
        self.bind_message('register', self._register)
        
    def _register(self, msg_name, message, *_, **kwargs ):
        for method, doc in message.data:
            self._generate_method(method, doc)
                
    def _generate_method(self, method, doc):
        @asyncio.coroutine
        def meth(*args, **kwargs):
            msg = Message('call', {'method':method, 'args':args, 'kwargs':kwargs})
            reply = yield self.post_message(msg, want_reply=True)
            if reply.data['status'] == 'ok':
                return reply.data['ret']
            else:
                raise WorkerError(reply.data['error'])

        meth.__doc__ = doc
        meth.__name__ = method
        setattr(self, method, meth)

class RPCWorkerChild(WorkerChild):
    def __init__(self):
        super().__init__()
        self._methods = {}
        self.bind_message('call', self._call)
        
    def register_method(self, m):
        m_name = m.__name__.split('.')[-1]
        m_doc = m.__doc__ or ''
        self._methods[m_name] = m
        msg = Message('register', [(m_name, m_doc)])
        self.post_message(msg)
        
    def _call(self, msg_name, message, *_, **kw):
        
        m_name = message.data['method']
        args = message.data['args']
        kwargs = message.data['kwargs']
        if m_name not in self._methods:
            self.post_reply(message, Message('result', {'status':'error','error':'Method not registered'}))
        m = self._methods.get(m_name)
        try:
            ret = m(*args, **kwargs)
            msg = Message('result', {'status':'ok', 'ret':ret})
            self.post_reply(message, msg)
        except Exception as e:
            msg = Message('result', {'status':'error', 'error':"Exception raised in call:"+str(e)})
            self.post_reply(message, msg)

if __BRYTHON__.isa_web_worker:
    w_cls = __BRYTHON__._WORKER_CLASS
    elements = w_cls.split('.')
    cls_name = elements[-1]
    cls_module = '.'.join(elements[:-1])
    try:
        mod = __import__(cls_module, fromlist=[cls_name])
        current_worker = getattr(mod, cls_name)()
    except Exception as ex:
        print("Error importing child worker class", ex)
        __BRYTHON__._WORKER.postMessage({'type':'status', 'status':S_TERMINATED, 'error':str(ex)})
        __BRYTHON__._WORKER.close()
    #sys.argv = current_worker._argv
    os.environ.update(dict(current_worker._environ))
else:
    current_worker = None
