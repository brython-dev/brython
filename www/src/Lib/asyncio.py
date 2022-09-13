"""The asyncio package, tracking PEP 3156."""

print('Brython implementation of asyncio is present to avoid ImportError ' +
      'in some modules, but does not implement the asyncio features ' +
      'because of browser limitations. For asynchronous programming, use ' +
      'browser.aio instead')

ALL_COMPLETED = """ALL_COMPLETED"""


class AbstractEventLoop(object):
    """Abstract event loop."""


    __module__ = """asyncio.events"""

    def _timer_handle_cancelled(*args,**kw):
        """Notification that a TimerHandle has been cancelled."""
        pass

    def add_reader(*args,**kw):
        pass

    def add_signal_handler(*args,**kw):
        pass

    def add_writer(*args,**kw):
        pass

    def call_at(*args,**kw):
        pass

    def call_exception_handler(*args,**kw):
        pass

    def call_later(*args,**kw):
        pass

    def call_soon(*args,**kw):
        pass

    def call_soon_threadsafe(*args,**kw):
        pass

    def close(*args,**kw):
        """Close the loop.
                The loop should not be running.

                This is idempotent and irreversible.

                No other methods should be called after this one.
                """
        pass

    def connect_accepted_socket(*args,**kw):
        """Handle an accepted connection.
                This is used by servers that accept connections outside of
                asyncio, but use asyncio to handle connections.

                This method is a coroutine.  When completed, the coroutine
                returns a (transport, protocol) pair.
                """
        pass

    def connect_read_pipe(*args,**kw):
        """Register read pipe in event loop. Set the pipe to non-blocking mode.
                protocol_factory should instantiate object with Protocol interface.
                pipe is a file-like object.
                Return pair (transport, protocol), where transport supports the
                ReadTransport interface."""
        pass

    def connect_write_pipe(*args,**kw):
        """Register write pipe in event loop.
                protocol_factory should instantiate object with BaseProtocol interface.
                Pipe is file-like object already switched to nonblocking.
                Return pair (transport, protocol), where transport support
                WriteTransport interface."""
        pass

    def create_connection(*args,**kw):
        pass

    def create_datagram_endpoint(*args,**kw):
        """A coroutine which creates a datagram endpoint.
                This method will try to establish the endpoint in the background.
                When successful, the coroutine returns a (transport, protocol) pair.

                protocol_factory must be a callable returning a protocol instance.

                socket family AF_INET, socket.AF_INET6 or socket.AF_UNIX depending on
                host (or family if specified), socket type SOCK_DGRAM.

                reuse_address tells the kernel to reuse a local socket in
                TIME_WAIT state, without waiting for its natural timeout to
                expire. If not specified it will automatically be set to True on
                UNIX.

                reuse_port tells the kernel to allow this endpoint to be bound to
                the same port as other existing endpoints are bound to, so long as
                they all set this flag when being created. This option is not
                supported on Windows and some UNIX's. If the
                :py:data:`~socket.SO_REUSEPORT` constant is not defined then this
                capability is unsupported.

                allow_broadcast tells the kernel to allow this endpoint to send
                messages to the broadcast address.

                sock can optionally be specified in order to use a preexisting
                socket object.
                """
        pass

    def create_future(*args,**kw):
        pass

    def create_server(*args,**kw):
        """A coroutine which creates a TCP server bound to host and port.
                The return value is a Server object which can be used to stop
                the service.

                If host is an empty string or None all interfaces are assumed
                and a list of multiple sockets will be returned (most likely
                one for IPv4 and another one for IPv6). The host parameter can also be
                a sequence (e.g. list) of hosts to bind to.

                family can be set to either AF_INET or AF_INET6 to force the
                socket to use IPv4 or IPv6. If not set it will be determined
                from host (defaults to AF_UNSPEC).

                flags is a bitmask for getaddrinfo().

                sock can optionally be specified in order to use a preexisting
                socket object.

                backlog is the maximum number of queued connections passed to
                listen() (defaults to 100).

                ssl can be set to an SSLContext to enable SSL over the
                accepted connections.

                reuse_address tells the kernel to reuse a local socket in
                TIME_WAIT state, without waiting for its natural timeout to
                expire. If not specified will automatically be set to True on
                UNIX.

                reuse_port tells the kernel to allow this endpoint to be bound to
                the same port as other existing endpoints are bound to, so long as
                they all set this flag when being created. This option is not
                supported on Windows.

                ssl_handshake_timeout is the time in seconds that an SSL server
                will wait for completion of the SSL handshake before aborting the
                connection. Default is 60s.

                ssl_shutdown_timeout is the time in seconds that an SSL server
                will wait for completion of the SSL shutdown procedure
                before aborting the connection. Default is 30s.

                start_serving set to True (default) causes the created server
                to start accepting connections immediately.  When set to False,
                the user should await Server.start_serving() or Server.serve_forever()
                to make the server to start accepting connections.
                """
        pass

    def create_task(*args,**kw):
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
        """A coroutine which creates a UNIX Domain Socket server.
                The return value is a Server object, which can be used to stop
                the service.

                path is a str, representing a file system path to bind the
                server socket to.

                sock can optionally be specified in order to use a preexisting
                socket object.

                backlog is the maximum number of queued connections passed to
                listen() (defaults to 100).

                ssl can be set to an SSLContext to enable SSL over the
                accepted connections.

                ssl_handshake_timeout is the time in seconds that an SSL server
                will wait for the SSL handshake to complete (defaults to 60s).

                ssl_shutdown_timeout is the time in seconds that an SSL server
                will wait for the SSL shutdown to finish (defaults to 30s).

                start_serving set to True (default) causes the created server
                to start accepting connections immediately.  When set to False,
                the user should await Server.start_serving() or Server.serve_forever()
                to make the server to start accepting connections.
                """
        pass

    def default_exception_handler(*args,**kw):
        pass

    def get_debug(*args,**kw):
        pass

    def get_exception_handler(*args,**kw):
        pass

    def get_task_factory(*args,**kw):
        pass

    def getaddrinfo(*args,**kw):
        pass

    def getnameinfo(*args,**kw):
        pass

    def is_closed(*args,**kw):
        """Returns True if the event loop was closed."""
        pass

    def is_running(*args,**kw):
        """Return whether the event loop is currently running."""
        pass

    def remove_reader(*args,**kw):
        pass

    def remove_signal_handler(*args,**kw):
        pass

    def remove_writer(*args,**kw):
        pass

    def run_forever(*args,**kw):
        """Run the event loop until stop() is called."""
        pass

    def run_in_executor(*args,**kw):
        pass

    def run_until_complete(*args,**kw):
        """Run the event loop until a Future is done.
                Return the Future's result, or raise its exception.
                """
        pass

    def sendfile(*args,**kw):
        """Send a file through a transport.
                Return an amount of sent bytes.
                """
        pass

    def set_debug(*args,**kw):
        pass

    def set_default_executor(*args,**kw):
        pass

    def set_exception_handler(*args,**kw):
        pass

    def set_task_factory(*args,**kw):
        pass

    def shutdown_asyncgens(*args,**kw):
        """Shutdown all active asynchronous generators."""
        pass

    def shutdown_default_executor(*args,**kw):
        """Schedule the shutdown of the default executor."""
        pass

    def sock_accept(*args,**kw):
        pass

    def sock_connect(*args,**kw):
        pass

    def sock_recv(*args,**kw):
        pass

    def sock_recv_into(*args,**kw):
        pass

    def sock_recvfrom(*args,**kw):
        pass

    def sock_recvfrom_into(*args,**kw):
        pass

    def sock_sendall(*args,**kw):
        pass

    def sock_sendfile(*args,**kw):
        pass

    def sock_sendto(*args,**kw):
        pass

    def start_tls(*args,**kw):
        """Upgrade a transport to TLS.
                Return a new transport that *protocol* should start using
                immediately.
                """
        pass

    def stop(*args,**kw):
        """Stop the event loop as soon as reasonable.
                Exactly how soon that is may depend on the implementation, but
                no more I/O callbacks should be scheduled.
                """
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        pass

class AbstractEventLoopPolicy(object):
    """Abstract policy for accessing the event loop."""


    __module__ = """asyncio.events"""

    def get_child_watcher(*args,**kw):
        """Get the watcher for child processes."""
        pass

    def get_event_loop(*args,**kw):
        """Get the event loop for the current context.
                Returns an event loop object implementing the BaseEventLoop interface,
                or raises an exception in case no event loop has been set for the
                current context and the current policy does not specify to create one.

                It should never return None."""
        pass

    def new_event_loop(*args,**kw):
        """Create and return a new event loop object according to this            policy's rules. If there's need to set this loop as the event loop for
                the current context, set_event_loop must be called explicitly."""
        pass

    def set_child_watcher(*args,**kw):
        """Set the watcher for child processes."""
        pass

    def set_event_loop(*args,**kw):
        """Set the event loop for the current context to loop."""
        pass

class AbstractServer(object):
    """Abstract server returned by create_server()."""


    __module__ = """asyncio.events"""

    def close(*args,**kw):
        """Stop serving.  This leaves existing connections open."""
        pass

    def get_loop(*args,**kw):
        """Get the event loop the Server object is attached to."""
        pass

    def is_serving(*args,**kw):
        """Return True if the server is accepting connections."""
        pass

    def serve_forever(*args,**kw):
        """Start accepting connections until the coroutine is cancelled.
                The server is closed when the coroutine is cancelled.
                """
        pass

    def start_serving(*args,**kw):
        """Start accepting connections.
                This method is idempotent, so it can be called when
                the server is already being serving.
                """
        pass

    def wait_closed(*args,**kw):
        """Coroutine to wait until service is closed."""
        pass

class Barrier(_LoopBoundMixin):
    """Asyncio equivalent to threading.Barrier

        Implements a Barrier primitive.
        Useful for synchronizing a fixed number of tasks at known synchronization
        points. Tasks block on 'wait()' and are simultaneously awoken once they
        have all made their call.
        """


    __module__ = """asyncio.locks"""

    def _block(*args,**kw):
        pass

    def _exit(*args,**kw):
        pass

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _release(*args,**kw):
        pass

    def _wait(*args,**kw):
        pass

    def abort(*args,**kw):
        """Place the barrier into a 'broken' state.
                Useful in case of error.  Any currently waiting tasks and tasks
                attempting to 'wait()' will have BrokenBarrierError raised.
                """
        pass

    broken = "<property object at 0x000001EF7C86AB10>"

    n_waiting = "<property object at 0x000001EF7C86AAC0>"

    parties = "<property object at 0x000001EF7C86AA70>"

    def reset(*args,**kw):
        """Reset the barrier to the initial state.
                Any tasks currently waiting will get the BrokenBarrier exception
                raised.
                """
        pass

    def wait(*args,**kw):
        """Wait for the barrier.
                When the specified number of tasks have started waiting, they are all
                simultaneously awoken.
                Returns an unique and individual index number from 0 to 'parties-1'.
                """
        pass

class BaseEventLoop(AbstractEventLoop):

    __module__ = """asyncio.base_events"""

    def _add_callback(*args,**kw):
        """Add a Handle to _scheduled (TimerHandle) or _ready."""
        pass

    def _add_callback_signalsafe(*args,**kw):
        """Like _add_callback() but called from a signal handler."""
        pass

    def _asyncgen_finalizer_hook(*args,**kw):
        pass

    def _asyncgen_firstiter_hook(*args,**kw):
        pass

    def _call_soon(*args,**kw):
        pass

    def _check_callback(*args,**kw):
        pass

    def _check_closed(*args,**kw):
        pass

    def _check_default_executor(*args,**kw):
        pass

    def _check_running(*args,**kw):
        pass

    def _check_sendfile_params(*args,**kw):
        pass

    def _check_thread(*args,**kw):
        """Check that the current thread is the thread running the event loop.
                Non-thread-safe methods of this class make this assumption and will
                likely behave incorrectly when the assumption is violated.

                Should only be called when (self._debug == True).  The caller is
                responsible for checking this condition for performance reasons.
                """
        pass

    def _connect_sock(*args,**kw):
        """Create, bind and connect one socket."""
        pass

    def _create_connection_transport(*args,**kw):
        pass

    def _create_server_getaddrinfo(*args,**kw):
        pass

    def _do_shutdown(*args,**kw):
        pass

    def _ensure_resolved(*args,**kw):
        pass

    def _getaddrinfo_debug(*args,**kw):
        pass

    def _log_subprocess(*args,**kw):
        pass

    def _make_datagram_transport(*args,**kw):
        """Create datagram transport."""
        pass

    def _make_read_pipe_transport(*args,**kw):
        """Create read pipe transport."""
        pass

    def _make_socket_transport(*args,**kw):
        """Create socket transport."""
        pass

    def _make_ssl_transport(*args,**kw):
        """Create SSL transport."""
        pass

    def _make_subprocess_transport(*args,**kw):
        """Create subprocess transport."""
        pass

    def _make_write_pipe_transport(*args,**kw):
        """Create write pipe transport."""
        pass

    def _process_events(*args,**kw):
        """Process selector events."""
        pass

    def _run_once(*args,**kw):
        """Run one full iteration of the event loop.
                This calls all currently ready callbacks, polls for I/O,
                schedules the resulting callbacks, and finally schedules
                'call_later' callbacks.
                """
        pass

    def _sendfile_fallback(*args,**kw):
        pass

    def _sendfile_native(*args,**kw):
        pass

    def _set_coroutine_origin_tracking(*args,**kw):
        pass

    def _sock_sendfile_fallback(*args,**kw):
        pass

    def _sock_sendfile_native(*args,**kw):
        pass

    def _timer_handle_cancelled(*args,**kw):
        """Notification that a TimerHandle has been cancelled."""
        pass

    def _write_to_self(*args,**kw):
        """Write a byte to self-pipe, to wake up the event loop.
                This may be called from a different thread.

                The subclass is responsible for implementing the self-pipe.
                """
        pass

    def add_reader(*args,**kw):
        pass

    def add_signal_handler(*args,**kw):
        pass

    def add_writer(*args,**kw):
        pass

    def call_at(*args,**kw):
        """Like call_later(), but uses an absolute time.
                Absolute time corresponds to the event loop's time() method.
                """
        pass

    def call_exception_handler(*args,**kw):
        """Call the current event loop's exception handler.
                The context argument is a dict containing the following keys:

                - 'message': Error message;
                - 'exception' (optional): Exception object;
                - 'future' (optional): Future instance;
                - 'task' (optional): Task instance;
                - 'handle' (optional): Handle instance;
                - 'protocol' (optional): Protocol instance;
                - 'transport' (optional): Transport instance;
                - 'socket' (optional): Socket instance;
                - 'asyncgen' (optional): Asynchronous generator that caused
                                         the exception.

                New keys maybe introduced in the future.

                Note: do not overload this method in an event loop subclass.
                For custom exception handling, use the
                `set_exception_handler()` method.
                """
        pass

    def call_later(*args,**kw):
        """Arrange for a callback to be called at a given time.
                Return a Handle: an opaque object with a cancel() method that
                can be used to cancel the call.

                The delay can be an int or float, expressed in seconds.  It is
                always relative to the current time.

                Each callback will be called exactly once.  If two callbacks
                are scheduled for exactly the same time, it undefined which
                will be called first.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon(*args,**kw):
        """Arrange for a callback to be called as soon as possible.
                This operates as a FIFO queue: callbacks are called in the
                order in which they are registered.  Each callback will be
                called exactly once.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon_threadsafe(*args,**kw):
        """Like call_soon(), but thread-safe."""
        pass

    def close(*args,**kw):
        """Close the event loop.
                This clears the queues and shuts down the executor,
                but does not wait for the executor to finish.

                The event loop must not be running.
                """
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        """Connect to a TCP server.
                Create a streaming transport connection to a given internet host and
                port: socket family AF_INET or socket.AF_INET6 depending on host (or
                family if specified), socket type SOCK_STREAM. protocol_factory must be
                a callable returning a protocol instance.

                This method is a coroutine which will try to establish the connection
                in the background.  When successful, the coroutine returns a
                (transport, protocol) pair.
                """
        pass

    def create_datagram_endpoint(*args,**kw):
        """Create datagram connection."""
        pass

    def create_future(*args,**kw):
        """Create a Future object attached to the loop."""
        pass

    def create_server(*args,**kw):
        """Create a TCP server.
                The host parameter can be a string, in that case the TCP server is
                bound to host and port.

                The host parameter can also be a sequence of strings and in that case
                the TCP server is bound to all hosts of the sequence. If a host
                appears multiple times (possibly indirectly e.g. when hostnames
                resolve to the same IP address), the server is only bound once to that
                host.

                Return a Server object which can be used to stop the service.

                This method is a coroutine.
                """
        pass

    def create_task(*args,**kw):
        """Schedule a coroutine object.
                Return a task object.
                """
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
        """A coroutine which creates a UNIX Domain Socket server.
                The return value is a Server object, which can be used to stop
                the service.

                path is a str, representing a file system path to bind the
                server socket to.

                sock can optionally be specified in order to use a preexisting
                socket object.

                backlog is the maximum number of queued connections passed to
                listen() (defaults to 100).

                ssl can be set to an SSLContext to enable SSL over the
                accepted connections.

                ssl_handshake_timeout is the time in seconds that an SSL server
                will wait for the SSL handshake to complete (defaults to 60s).

                ssl_shutdown_timeout is the time in seconds that an SSL server
                will wait for the SSL shutdown to finish (defaults to 30s).

                start_serving set to True (default) causes the created server
                to start accepting connections immediately.  When set to False,
                the user should await Server.start_serving() or Server.serve_forever()
                to make the server to start accepting connections.
                """
        pass

    def default_exception_handler(*args,**kw):
        """Default exception handler.
                This is called when an exception occurs and no exception
                handler is set, and can be called by a custom exception
                handler that wants to defer to the default behavior.

                This default handler logs the error message and other
                context-dependent information.  In debug mode, a truncated
                stack trace is also appended showing where the given object
                (e.g. a handle or future or task) was created, if any.

                The context parameter has the same meaning as in
                `call_exception_handler()`.
                """
        pass

    def get_debug(*args,**kw):
        pass

    def get_exception_handler(*args,**kw):
        """Return an exception handler, or None if the default one is in use.            """
        pass

    def get_task_factory(*args,**kw):
        """Return a task factory, or None if the default one is in use."""
        pass

    def getaddrinfo(*args,**kw):
        pass

    def getnameinfo(*args,**kw):
        pass

    def is_closed(*args,**kw):
        """Returns True if the event loop was closed."""
        pass

    def is_running(*args,**kw):
        """Returns True if the event loop is running."""
        pass

    def remove_reader(*args,**kw):
        pass

    def remove_signal_handler(*args,**kw):
        pass

    def remove_writer(*args,**kw):
        pass

    def run_forever(*args,**kw):
        """Run until stop() is called."""
        pass

    def run_in_executor(*args,**kw):
        pass

    def run_until_complete(*args,**kw):
        """Run until the Future is done.
                If the argument is a coroutine, it is wrapped in a Task.

                WARNING: It would be disastrous to call run_until_complete()
                with the same coroutine twice -- it would wrap it in two
                different Tasks and that can't be good.

                Return the Future's result, or raise its exception.
                """
        pass

    def sendfile(*args,**kw):
        """Send a file to transport.
                Return the total number of bytes which were sent.

                The method uses high-performance os.sendfile if available.

                file must be a regular file object opened in binary mode.

                offset tells from where to start reading the file. If specified,
                count is the total number of bytes to transmit as opposed to
                sending the file until EOF is reached. File position is updated on
                return or also in case of error in which case file.tell()
                can be used to figure out the number of bytes
                which were sent.

                fallback set to True makes asyncio to manually read and send
                the file when the platform does not support the sendfile syscall
                (e.g. Windows or SSL socket on Unix).

                Raise SendfileNotAvailableError if the system does not support
                sendfile syscall and fallback is False.
                """
        pass

    def set_debug(*args,**kw):
        pass

    def set_default_executor(*args,**kw):
        pass

    def set_exception_handler(*args,**kw):
        """Set handler as the new event loop exception handler.
                If handler is None, the default exception handler will
                be set.

                If handler is a callable object, it should have a
                signature matching '(loop, context)', where 'loop'
                will be a reference to the active event loop, 'context'
                will be a dict object (see `call_exception_handler()`
                documentation for details about context).
                """
        pass

    def set_task_factory(*args,**kw):
        """Set a task factory that will be used by loop.create_task().
                If factory is None the default task factory will be set.

                If factory is a callable, it should have a signature matching
                '(loop, coro)', where 'loop' will be a reference to the active
                event loop, 'coro' will be a coroutine object.  The callable
                must return a Future.
                """
        pass

    def shutdown_asyncgens(*args,**kw):
        """Shutdown all active asynchronous generators."""
        pass

    def shutdown_default_executor(*args,**kw):
        """Schedule the shutdown of the default executor."""
        pass

    def sock_accept(*args,**kw):
        pass

    def sock_connect(*args,**kw):
        pass

    def sock_recv(*args,**kw):
        pass

    def sock_recv_into(*args,**kw):
        pass

    def sock_recvfrom(*args,**kw):
        pass

    def sock_recvfrom_into(*args,**kw):
        pass

    def sock_sendall(*args,**kw):
        pass

    def sock_sendfile(*args,**kw):
        pass

    def sock_sendto(*args,**kw):
        pass

    def start_tls(*args,**kw):
        """Upgrade transport to TLS.
                Return a new transport that *protocol* should start using
                immediately.
                """
        pass

    def stop(*args,**kw):
        """Stop running the event loop.
                Every callback already scheduled will still run.  This simply informs
                run_forever to stop looping after a complete iteration.
                """
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        """Return the time according to the event loop's clock.
                This is a float expressed in seconds since an epoch, but the
                epoch, precision, accuracy and drift are unspecified and may
                differ per event loop.
                """
        pass

class BaseProtocol(object):
    """Common base class for protocol interfaces.

        Usually user implements protocols that derived from BaseProtocol
        like Protocol or ProcessProtocol.

        The only case when BaseProtocol should be implemented directly is
        write-only transport like write pipe
        """


    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        """Called when the connection is lost or closed.
                The argument is an exception object or None (the latter
                meaning a regular EOF is received or the connection was
                aborted or closed).
                """
        pass

    def connection_made(*args,**kw):
        """Called when a connection is made.
                The argument is the transport representing the pipe connection.
                To receive data, wait for data_received() calls.
                When the connection is closed, connection_lost() is called.
                """
        pass

    def pause_writing(*args,**kw):
        """Called when the transport's buffer goes over the high-water mark.
                Pause and resume calls are paired -- pause_writing() is called
                once when the buffer goes strictly over the high-water mark
                (even if subsequent writes increases the buffer size even
                more), and eventually resume_writing() is called once when the
                buffer size reaches the low-water mark.

                Note that if the buffer size equals the high-water mark,
                pause_writing() is not called -- it must go strictly over.
                Conversely, resume_writing() is called when the buffer size is
                equal or lower than the low-water mark.  These end conditions
                are important to ensure that things go as expected when either
                mark is zero.

                NOTE: This is the only Protocol callback that is not called
                through EventLoop.call_soon() -- if it were, it would have no
                effect when it's most needed (when the app keeps writing
                without yielding until pause_writing() is called).
                """
        pass

    def resume_writing(*args,**kw):
        """Called when the transport's buffer drains below the low-water mark.
                See pause_writing() for details.
                """
        pass

class BaseTransport(object):
    """Base class for transports."""


    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

class BoundedSemaphore(Semaphore):
    """A bounded semaphore implementation.

        This raises ValueError in release() if it would increase the value
        above the initial value.
        """


    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_next(*args,**kw):
        pass

    def acquire(*args,**kw):
        """Acquire a semaphore.
                If the internal counter is larger than zero on entry,
                decrement it by one and return True immediately.  If it is
                zero on entry, block, waiting until some other coroutine has
                called release() to make it larger than 0, and then return
                True.
                """
        pass

    def locked(*args,**kw):
        """Returns True if semaphore can not be acquired immediately."""
        pass

    def release(*args,**kw):
        pass

class BrokenBarrierError(RuntimeError):
    """Barrier is broken by barrier.abort() call."""


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class BufferedProtocol(BaseProtocol):
    """Interface for stream protocol with manual buffer control.

        Event methods, such as `create_server` and `create_connection`,
        accept factories that return protocols that implement this interface.

        The idea of BufferedProtocol is that it allows to manually allocate
        and control the receive buffer.  Event loops can then use the buffer
        provided by the protocol to avoid unnecessary data copies.  This
        can result in noticeable performance improvement for protocols that
        receive big amounts of data.  Sophisticated protocols can allocate
        the buffer only once at creation time.

        State machine of calls:

          start -> CM [-> GB [-> BU?]]* [-> ER?] -> CL -> end

        * CM: connection_made()
        * GB: get_buffer()
        * BU: buffer_updated()
        * ER: eof_received()
        * CL: connection_lost()
        """


    __module__ = """asyncio.protocols"""

    def buffer_updated(*args,**kw):
        """Called when the buffer was updated with the received data.
                *nbytes* is the total number of bytes that were written to
                the buffer.
                """
        pass

    def connection_lost(*args,**kw):
        """Called when the connection is lost or closed.
                The argument is an exception object or None (the latter
                meaning a regular EOF is received or the connection was
                aborted or closed).
                """
        pass

    def connection_made(*args,**kw):
        """Called when a connection is made.
                The argument is the transport representing the pipe connection.
                To receive data, wait for data_received() calls.
                When the connection is closed, connection_lost() is called.
                """
        pass

    def eof_received(*args,**kw):
        """Called when the other end calls write_eof() or equivalent.
                If this returns a false value (including None), the transport
                will close itself.  If it returns a true value, closing the
                transport is up to the protocol.
                """
        pass

    def get_buffer(*args,**kw):
        """Called to allocate a new receive buffer.
                *sizehint* is a recommended minimal size for the returned
                buffer.  When set to -1, the buffer size can be arbitrary.

                Must return an object that implements the
                :ref:`buffer protocol <bufferobjects>`.
                It is an error to return a zero-sized buffer.
                """
        pass

    def pause_writing(*args,**kw):
        """Called when the transport's buffer goes over the high-water mark.
                Pause and resume calls are paired -- pause_writing() is called
                once when the buffer goes strictly over the high-water mark
                (even if subsequent writes increases the buffer size even
                more), and eventually resume_writing() is called once when the
                buffer size reaches the low-water mark.

                Note that if the buffer size equals the high-water mark,
                pause_writing() is not called -- it must go strictly over.
                Conversely, resume_writing() is called when the buffer size is
                equal or lower than the low-water mark.  These end conditions
                are important to ensure that things go as expected when either
                mark is zero.

                NOTE: This is the only Protocol callback that is not called
                through EventLoop.call_soon() -- if it were, it would have no
                effect when it's most needed (when the app keeps writing
                without yielding until pause_writing() is called).
                """
        pass

    def resume_writing(*args,**kw):
        """Called when the transport's buffer drains below the low-water mark.
                See pause_writing() for details.
                """
        pass

class CancelledError(BaseException):
    """The Future or Task was cancelled."""


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Condition(_ContextManagerMixin,_LoopBoundMixin):
    """Asynchronous equivalent to threading.Condition.

        This class implements condition variable objects. A condition variable
        allows one or more coroutines to wait until they are notified by another
        coroutine.

        A new Lock object is created and used as the underlying lock.
        """


    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def notify(*args,**kw):
        """By default, wake up one coroutine waiting on this condition, if any.            If the calling coroutine has not acquired the lock when this method
                is called, a RuntimeError is raised.

                This method wakes up at most n of the coroutines waiting for the
                condition variable; it is a no-op if no coroutines are waiting.

                Note: an awakened coroutine does not actually return from its
                wait() call until it can reacquire the lock. Since notify() does
                not release the lock, its caller should.
                """
        pass

    def notify_all(*args,**kw):
        """Wake up all threads waiting on this condition. This method acts            like notify(), but wakes up all waiting threads instead of one. If the
                calling thread has not acquired the lock when this method is called,
                a RuntimeError is raised.
                """
        pass

    def wait(*args,**kw):
        """Wait until notified.
                If the calling coroutine has not acquired the lock when this
                method is called, a RuntimeError is raised.

                This method releases the underlying lock, and then blocks
                until it is awakened by a notify() or notify_all() call for
                the same condition variable in another coroutine.  Once
                awakened, it re-acquires the lock and returns True.
                """
        pass

    def wait_for(*args,**kw):
        """Wait until a predicate becomes true.
                The predicate should be a callable which result will be
                interpreted as a boolean value.  The final predicate value is
                the return value.
                """
        pass

class DatagramProtocol(BaseProtocol):
    """Interface for datagram protocol."""


    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        """Called when the connection is lost or closed.
                The argument is an exception object or None (the latter
                meaning a regular EOF is received or the connection was
                aborted or closed).
                """
        pass

    def connection_made(*args,**kw):
        """Called when a connection is made.
                The argument is the transport representing the pipe connection.
                To receive data, wait for data_received() calls.
                When the connection is closed, connection_lost() is called.
                """
        pass

    def datagram_received(*args,**kw):
        """Called when some datagram is received."""
        pass

    def error_received(*args,**kw):
        """Called when a send or receive operation raises an OSError.
                (Other than BlockingIOError or InterruptedError.)
                """
        pass

    def pause_writing(*args,**kw):
        """Called when the transport's buffer goes over the high-water mark.
                Pause and resume calls are paired -- pause_writing() is called
                once when the buffer goes strictly over the high-water mark
                (even if subsequent writes increases the buffer size even
                more), and eventually resume_writing() is called once when the
                buffer size reaches the low-water mark.

                Note that if the buffer size equals the high-water mark,
                pause_writing() is not called -- it must go strictly over.
                Conversely, resume_writing() is called when the buffer size is
                equal or lower than the low-water mark.  These end conditions
                are important to ensure that things go as expected when either
                mark is zero.

                NOTE: This is the only Protocol callback that is not called
                through EventLoop.call_soon() -- if it were, it would have no
                effect when it's most needed (when the app keeps writing
                without yielding until pause_writing() is called).
                """
        pass

    def resume_writing(*args,**kw):
        """Called when the transport's buffer drains below the low-water mark.
                See pause_writing() for details.
                """
        pass

class DatagramTransport(BaseTransport):
    """Interface for datagram (UDP) transports."""


    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        """Close the transport immediately.
                Buffered data will be lost.  No more data will be received.
                The protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def sendto(*args,**kw):
        """Send data to the transport.
                This does not block; it buffers the data and arranges for it
                to be sent out asynchronously.
                addr is target socket address.
                If addr is None use target address pointed on transport creation.
                """
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

class DefaultEventLoopPolicy(BaseDefaultEventLoopPolicy):


    class _Local(_local):

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory(BaseProactorEventLoop):
        """Windows version of proactor event loop using IOCP."""


        __module__ = """asyncio.windows_events"""

        def _add_callback(*args,**kw):
            """Add a Handle to _scheduled (TimerHandle) or _ready."""
            pass

        def _add_callback_signalsafe(*args,**kw):
            """Like _add_callback() but called from a signal handler."""
            pass

        def _asyncgen_finalizer_hook(*args,**kw):
            pass

        def _asyncgen_firstiter_hook(*args,**kw):
            pass

        def _call_soon(*args,**kw):
            pass

        def _check_callback(*args,**kw):
            pass

        def _check_closed(*args,**kw):
            pass

        def _check_default_executor(*args,**kw):
            pass

        def _check_running(*args,**kw):
            pass

        def _check_sendfile_params(*args,**kw):
            pass

        def _check_thread(*args,**kw):
            """Check that the current thread is the thread running the event loop.
                    Non-thread-safe methods of this class make this assumption and will
                    likely behave incorrectly when the assumption is violated.

                    Should only be called when (self._debug == True).  The caller is
                    responsible for checking this condition for performance reasons.
                    """
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
            """Create, bind and connect one socket."""
            pass

        def _create_connection_transport(*args,**kw):
            pass

        def _create_server_getaddrinfo(*args,**kw):
            pass

        def _do_shutdown(*args,**kw):
            pass

        def _ensure_resolved(*args,**kw):
            pass

        def _getaddrinfo_debug(*args,**kw):
            pass

        def _log_subprocess(*args,**kw):
            pass

        def _loop_self_reading(*args,**kw):
            pass

        def _make_datagram_transport(*args,**kw):
            pass

        def _make_duplex_pipe_transport(*args,**kw):
            pass

        def _make_read_pipe_transport(*args,**kw):
            pass

        def _make_self_pipe(*args,**kw):
            pass

        def _make_socket_transport(*args,**kw):
            pass

        def _make_ssl_transport(*args,**kw):
            pass

        def _make_subprocess_transport(*args,**kw):
            pass

        def _make_write_pipe_transport(*args,**kw):
            pass

        def _process_events(*args,**kw):
            pass

        def _run_once(*args,**kw):
            """Run one full iteration of the event loop.
                    This calls all currently ready callbacks, polls for I/O,
                    schedules the resulting callbacks, and finally schedules
                    'call_later' callbacks.
                    """
            pass

        def _sendfile_fallback(*args,**kw):
            pass

        def _sendfile_native(*args,**kw):
            pass

        def _set_coroutine_origin_tracking(*args,**kw):
            pass

        def _sock_sendfile_fallback(*args,**kw):
            pass

        def _sock_sendfile_native(*args,**kw):
            pass

        def _start_serving(*args,**kw):
            pass

        def _stop_accept_futures(*args,**kw):
            pass

        def _stop_serving(*args,**kw):
            pass

        def _timer_handle_cancelled(*args,**kw):
            """Notification that a TimerHandle has been cancelled."""
            pass

        def _write_to_self(*args,**kw):
            pass

        def add_reader(*args,**kw):
            pass

        def add_signal_handler(*args,**kw):
            pass

        def add_writer(*args,**kw):
            pass

        def call_at(*args,**kw):
            """Like call_later(), but uses an absolute time.
                    Absolute time corresponds to the event loop's time() method.
                    """
            pass

        def call_exception_handler(*args,**kw):
            """Call the current event loop's exception handler.
                    The context argument is a dict containing the following keys:

                    - 'message': Error message;
                    - 'exception' (optional): Exception object;
                    - 'future' (optional): Future instance;
                    - 'task' (optional): Task instance;
                    - 'handle' (optional): Handle instance;
                    - 'protocol' (optional): Protocol instance;
                    - 'transport' (optional): Transport instance;
                    - 'socket' (optional): Socket instance;
                    - 'asyncgen' (optional): Asynchronous generator that caused
                                             the exception.

                    New keys maybe introduced in the future.

                    Note: do not overload this method in an event loop subclass.
                    For custom exception handling, use the
                    `set_exception_handler()` method.
                    """
            pass

        def call_later(*args,**kw):
            """Arrange for a callback to be called at a given time.
                    Return a Handle: an opaque object with a cancel() method that
                    can be used to cancel the call.

                    The delay can be an int or float, expressed in seconds.  It is
                    always relative to the current time.

                    Each callback will be called exactly once.  If two callbacks
                    are scheduled for exactly the same time, it undefined which
                    will be called first.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon(*args,**kw):
            """Arrange for a callback to be called as soon as possible.
                    This operates as a FIFO queue: callbacks are called in the
                    order in which they are registered.  Each callback will be
                    called exactly once.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon_threadsafe(*args,**kw):
            """Like call_soon(), but thread-safe."""
            pass

        def close(*args,**kw):
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            """Connect to a TCP server.
                    Create a streaming transport connection to a given internet host and
                    port: socket family AF_INET or socket.AF_INET6 depending on host (or
                    family if specified), socket type SOCK_STREAM. protocol_factory must be
                    a callable returning a protocol instance.

                    This method is a coroutine which will try to establish the connection
                    in the background.  When successful, the coroutine returns a
                    (transport, protocol) pair.
                    """
            pass

        def create_datagram_endpoint(*args,**kw):
            """Create datagram connection."""
            pass

        def create_future(*args,**kw):
            """Create a Future object attached to the loop."""
            pass

        def create_pipe_connection(*args,**kw):
            pass

        def create_server(*args,**kw):
            """Create a TCP server.
                    The host parameter can be a string, in that case the TCP server is
                    bound to host and port.

                    The host parameter can also be a sequence of strings and in that case
                    the TCP server is bound to all hosts of the sequence. If a host
                    appears multiple times (possibly indirectly e.g. when hostnames
                    resolve to the same IP address), the server is only bound once to that
                    host.

                    Return a Server object which can be used to stop the service.

                    This method is a coroutine.
                    """
            pass

        def create_task(*args,**kw):
            """Schedule a coroutine object.
                    Return a task object.
                    """
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
            """A coroutine which creates a UNIX Domain Socket server.
                    The return value is a Server object, which can be used to stop
                    the service.

                    path is a str, representing a file system path to bind the
                    server socket to.

                    sock can optionally be specified in order to use a preexisting
                    socket object.

                    backlog is the maximum number of queued connections passed to
                    listen() (defaults to 100).

                    ssl can be set to an SSLContext to enable SSL over the
                    accepted connections.

                    ssl_handshake_timeout is the time in seconds that an SSL server
                    will wait for the SSL handshake to complete (defaults to 60s).

                    ssl_shutdown_timeout is the time in seconds that an SSL server
                    will wait for the SSL shutdown to finish (defaults to 30s).

                    start_serving set to True (default) causes the created server
                    to start accepting connections immediately.  When set to False,
                    the user should await Server.start_serving() or Server.serve_forever()
                    to make the server to start accepting connections.
                    """
            pass

        def default_exception_handler(*args,**kw):
            """Default exception handler.
                    This is called when an exception occurs and no exception
                    handler is set, and can be called by a custom exception
                    handler that wants to defer to the default behavior.

                    This default handler logs the error message and other
                    context-dependent information.  In debug mode, a truncated
                    stack trace is also appended showing where the given object
                    (e.g. a handle or future or task) was created, if any.

                    The context parameter has the same meaning as in
                    `call_exception_handler()`.
                    """
            pass

        def get_debug(*args,**kw):
            pass

        def get_exception_handler(*args,**kw):
            """Return an exception handler, or None if the default one is in use.            """
            pass

        def get_task_factory(*args,**kw):
            """Return a task factory, or None if the default one is in use."""
            pass

        def getaddrinfo(*args,**kw):
            pass

        def getnameinfo(*args,**kw):
            pass

        def is_closed(*args,**kw):
            """Returns True if the event loop was closed."""
            pass

        def is_running(*args,**kw):
            """Returns True if the event loop is running."""
            pass

        def remove_reader(*args,**kw):
            pass

        def remove_signal_handler(*args,**kw):
            pass

        def remove_writer(*args,**kw):
            pass

        def run_forever(*args,**kw):
            pass

        def run_in_executor(*args,**kw):
            pass

        def run_until_complete(*args,**kw):
            """Run until the Future is done.
                    If the argument is a coroutine, it is wrapped in a Task.

                    WARNING: It would be disastrous to call run_until_complete()
                    with the same coroutine twice -- it would wrap it in two
                    different Tasks and that can't be good.

                    Return the Future's result, or raise its exception.
                    """
            pass

        def sendfile(*args,**kw):
            """Send a file to transport.
                    Return the total number of bytes which were sent.

                    The method uses high-performance os.sendfile if available.

                    file must be a regular file object opened in binary mode.

                    offset tells from where to start reading the file. If specified,
                    count is the total number of bytes to transmit as opposed to
                    sending the file until EOF is reached. File position is updated on
                    return or also in case of error in which case file.tell()
                    can be used to figure out the number of bytes
                    which were sent.

                    fallback set to True makes asyncio to manually read and send
                    the file when the platform does not support the sendfile syscall
                    (e.g. Windows or SSL socket on Unix).

                    Raise SendfileNotAvailableError if the system does not support
                    sendfile syscall and fallback is False.
                    """
            pass

        def set_debug(*args,**kw):
            pass

        def set_default_executor(*args,**kw):
            pass

        def set_exception_handler(*args,**kw):
            """Set handler as the new event loop exception handler.
                    If handler is None, the default exception handler will
                    be set.

                    If handler is a callable object, it should have a
                    signature matching '(loop, context)', where 'loop'
                    will be a reference to the active event loop, 'context'
                    will be a dict object (see `call_exception_handler()`
                    documentation for details about context).
                    """
            pass

        def set_task_factory(*args,**kw):
            """Set a task factory that will be used by loop.create_task().
                    If factory is None the default task factory will be set.

                    If factory is a callable, it should have a signature matching
                    '(loop, coro)', where 'loop' will be a reference to the active
                    event loop, 'coro' will be a coroutine object.  The callable
                    must return a Future.
                    """
            pass

        def shutdown_asyncgens(*args,**kw):
            """Shutdown all active asynchronous generators."""
            pass

        def shutdown_default_executor(*args,**kw):
            """Schedule the shutdown of the default executor."""
            pass

        def sock_accept(*args,**kw):
            pass

        def sock_connect(*args,**kw):
            pass

        def sock_recv(*args,**kw):
            pass

        def sock_recv_into(*args,**kw):
            pass

        def sock_recvfrom(*args,**kw):
            pass

        def sock_recvfrom_into(*args,**kw):
            pass

        def sock_sendall(*args,**kw):
            pass

        def sock_sendfile(*args,**kw):
            pass

        def sock_sendto(*args,**kw):
            pass

        def start_serving_pipe(*args,**kw):
            pass

        def start_tls(*args,**kw):
            """Upgrade transport to TLS.
                    Return a new transport that *protocol* should start using
                    immediately.
                    """
            pass

        def stop(*args,**kw):
            """Stop running the event loop.
                    Every callback already scheduled will still run.  This simply informs
                    run_forever to stop looping after a complete iteration.
                    """
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            """Return the time according to the event loop's clock.
                    This is a float expressed in seconds since an epoch, but the
                    epoch, precision, accuracy and drift are unspecified and may
                    differ per event loop.
                    """
            pass
    def get_child_watcher(*args,**kw):
        """Get the watcher for child processes."""
        pass

    def get_event_loop(*args,**kw):
        """Get the event loop for the current context.
                Returns an instance of EventLoop or raises an exception.
                """
        pass

    def new_event_loop(*args,**kw):
        """Create a new event loop.
                You must call set_event_loop() to make this the current event
                loop.
                """
        pass

    def set_child_watcher(*args,**kw):
        """Set the watcher for child processes."""
        pass

    def set_event_loop(*args,**kw):
        """Set the event loop."""
        pass

class Event(_LoopBoundMixin):
    """Asynchronous equivalent to threading.Event.

        Class implementing event objects. An event manages a flag that can be set
        to true with the set() method and reset to false with the clear() method.
        The wait() method blocks until the flag is true. The flag is initially
        false.
        """


    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def clear(*args,**kw):
        """Reset the internal flag to false. Subsequently, coroutines calling            wait() will block until set() is called to set the internal flag
                to true again."""
        pass

    def is_set(*args,**kw):
        """Return True if and only if the internal flag is true."""
        pass

    def set(*args,**kw):
        """Set the internal flag to true. All coroutines waiting for it to            become true are awakened. Coroutine that call wait() once the flag is
                true will not block at all.
                """
        pass

    def wait(*args,**kw):
        """Block until the internal flag is true.
                If the internal flag is true on entry, return True
                immediately.  Otherwise, block until another coroutine calls
                set() to set the flag to true, then return True.
                """
        pass
FIRST_COMPLETED = """FIRST_COMPLETED"""

FIRST_EXCEPTION = """FIRST_EXCEPTION"""


class Future(object):
    """This class is *almost* compatible with concurrent.futures.Future.

        Differences:

        - result() and exception() do not take a timeout argument and
          raise an exception when the future isn't done yet.

        - Callbacks registered with add_done_callback() are always called
          via the event loop's call_soon_threadsafe().

        - This class is not compatible with the wait() and as_completed()
          methods in the concurrent.futures package."""


    _asyncio_future_blocking = "<attribute '_asyncio_future_blocking' of '_asyncio.Future' objects>"

    _callbacks = "<attribute '_callbacks' of '_asyncio.Future' objects>"

    _cancel_message = "<attribute '_cancel_message' of '_asyncio.Future' objects>"

    _exception = "<attribute '_exception' of '_asyncio.Future' objects>"

    _log_traceback = "<attribute '_log_traceback' of '_asyncio.Future' objects>"

    _loop = "<attribute '_loop' of '_asyncio.Future' objects>"

    _make_cancelled_error = "<method '_make_cancelled_error' of '_asyncio.Future' objects>"

    _result = "<attribute '_result' of '_asyncio.Future' objects>"

    _source_traceback = "<attribute '_source_traceback' of '_asyncio.Future' objects>"

    _state = "<attribute '_state' of '_asyncio.Future' objects>"

    add_done_callback = "<method 'add_done_callback' of '_asyncio.Future' objects>"

    cancel = "<method 'cancel' of '_asyncio.Future' objects>"

    cancelled = "<method 'cancelled' of '_asyncio.Future' objects>"

    done = "<method 'done' of '_asyncio.Future' objects>"

    exception = "<method 'exception' of '_asyncio.Future' objects>"

    get_loop = "<method 'get_loop' of '_asyncio.Future' objects>"

    remove_done_callback = "<method 'remove_done_callback' of '_asyncio.Future' objects>"

    result = "<method 'result' of '_asyncio.Future' objects>"

    set_exception = "<method 'set_exception' of '_asyncio.Future' objects>"

    set_result = "<method 'set_result' of '_asyncio.Future' objects>"

class Handle(object):
    """Object returned by callback registration methods."""


    __module__ = """asyncio.events"""

    _args = "<member '_args' of 'Handle' objects>"

    _callback = "<member '_callback' of 'Handle' objects>"

    _cancelled = "<member '_cancelled' of 'Handle' objects>"

    _context = "<member '_context' of 'Handle' objects>"

    _loop = "<member '_loop' of 'Handle' objects>"

    _repr = "<member '_repr' of 'Handle' objects>"

    def _repr_info(*args,**kw):
        pass

    def _run(*args,**kw):
        pass

    _source_traceback = "<member '_source_traceback' of 'Handle' objects>"

    def cancel(*args,**kw):
        pass

    def cancelled(*args,**kw):
        pass

class IncompleteReadError(EOFError):
    """
        Incomplete read error. Attributes:

        - partial: read bytes string before the end of stream was reached
        - expected: total number of expected bytes (or None if unknown)
        """


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class InvalidStateError(Exception):
    """The operation is not allowed in this state."""


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class IocpProactor(object):
    """Proactor implementation using IOCP."""


    __module__ = """asyncio.windows_events"""

    def _check_closed(*args,**kw):
        pass

    def _get_accept_socket(*args,**kw):
        pass

    def _poll(*args,**kw):
        pass

    def _register(*args,**kw):
        pass

    def _register_with_iocp(*args,**kw):
        pass

    def _result(*args,**kw):
        pass

    def _stop_serving(*args,**kw):
        pass

    def _unregister(*args,**kw):
        """Unregister an overlapped object.
                Call this method when its future has been cancelled. The event can
                already be signalled (pending in the proactor event queue). It is also
                safe if the event is never signalled (because it was cancelled).
                """
        pass

    def _wait_cancel(*args,**kw):
        pass

    def _wait_for_handle(*args,**kw):
        pass

    def accept(*args,**kw):
        pass

    def accept_pipe(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def connect(*args,**kw):
        pass

    def connect_pipe(*args,**kw):
        pass

    def recv(*args,**kw):
        pass

    def recv_into(*args,**kw):
        pass

    def recvfrom(*args,**kw):
        pass

    def recvfrom_into(*args,**kw):
        pass

    def select(*args,**kw):
        pass

    def send(*args,**kw):
        pass

    def sendfile(*args,**kw):
        pass

    def sendto(*args,**kw):
        pass

    def set_loop(*args,**kw):
        pass

    def wait_for_handle(*args,**kw):
        """Wait for a handle.
                Return a Future object. The result of the future is True if the wait
                completed, or False if the wait did not complete (on timeout).
                """
        pass

class LifoQueue(Queue):
    """A subclass of Queue that retrieves most recently added entries first."""


    __module__ = """asyncio.queues"""

    def _format(*args,**kw):
        pass

    def _get(*args,**kw):
        pass

    def _get_loop(*args,**kw):
        pass

    def _init(*args,**kw):
        pass

    _loop = None

    def _put(*args,**kw):
        pass

    def _wakeup_next(*args,**kw):
        pass

    def empty(*args,**kw):
        """Return True if the queue is empty, False otherwise."""
        pass

    def full(*args,**kw):
        """Return True if there are maxsize items in the queue.
                Note: if the Queue was initialized with maxsize=0 (the default),
                then full() is never True.
                """
        pass

    def get(*args,**kw):
        """Remove and return an item from the queue.
                If queue is empty, wait until an item is available.
                """
        pass

    def get_nowait(*args,**kw):
        """Remove and return an item from the queue.
                Return an item if one is immediately available, else raise QueueEmpty.
                """
        pass

    def join(*args,**kw):
        """Block until all items in the queue have been gotten and processed.
                The count of unfinished tasks goes up whenever an item is added to the
                queue. The count goes down whenever a consumer calls task_done() to
                indicate that the item was retrieved and all work on it is complete.
                When the count of unfinished tasks drops to zero, join() unblocks.
                """
        pass

    maxsize = "<property object at 0x000001EF7C888220>"

    def put(*args,**kw):
        """Put an item into the queue.
                Put an item into the queue. If the queue is full, wait until a free
                slot is available before adding item.
                """
        pass

    def put_nowait(*args,**kw):
        """Put an item into the queue without blocking.
                If no free slot is immediately available, raise QueueFull.
                """
        pass

    def qsize(*args,**kw):
        """Number of items in the queue."""
        pass

    def task_done(*args,**kw):
        """Indicate that a formerly enqueued task is complete.
                Used by queue consumers. For each get() used to fetch a task,
                a subsequent call to task_done() tells the queue that the processing
                on the task is complete.

                If a join() is currently blocking, it will resume when all items have
                been processed (meaning that a task_done() call was received for every
                item that had been put() into the queue).

                Raises ValueError if called more times than there were items placed in
                the queue.
                """
        pass

class LimitOverrunError(Exception):
    """Reached the buffer limit while looking for a separator.

        Attributes:
        - consumed: total number of to be consumed bytes.
        """


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Lock(_ContextManagerMixin,_LoopBoundMixin):
    """Primitive lock objects.

        A primitive lock is a synchronization primitive that is not owned
        by a particular coroutine when locked.  A primitive lock is in one
        of two states, 'locked' or 'unlocked'.

        It is created in the unlocked state.  It has two basic methods,
        acquire() and release().  When the state is unlocked, acquire()
        changes the state to locked and returns immediately.  When the
        state is locked, acquire() blocks until a call to release() in
        another coroutine changes it to unlocked, then the acquire() call
        resets it to locked and returns.  The release() method should only
        be called in the locked state; it changes the state to unlocked
        and returns immediately.  If an attempt is made to release an
        unlocked lock, a RuntimeError will be raised.

        When more than one coroutine is blocked in acquire() waiting for
        the state to turn to unlocked, only one coroutine proceeds when a
        release() call resets the state to unlocked; first coroutine which
        is blocked in acquire() is being processed.

        acquire() is a coroutine and should be called with 'await'.

        Locks also support the asynchronous context management protocol.
        'async with lock' statement should be used.

        Usage:

            lock = Lock()
            ...
            await lock.acquire()
            try:
                ...
            finally:
                lock.release()

        Context manager usage:

            lock = Lock()
            ...
            async with lock:
                 ...

        Lock objects can be tested for locking state:

            if not lock.locked():
               await lock.acquire()
            else:
               # lock is acquired
               ...

        """


    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_first(*args,**kw):
        """Wake up the first waiter if it isn't done."""
        pass

    def acquire(*args,**kw):
        """Acquire a lock.
                This method blocks until the lock is unlocked, then sets it to
                locked and returns True.
                """
        pass

    def locked(*args,**kw):
        """Return True if lock is acquired."""
        pass

    def release(*args,**kw):
        """Release a lock.
                When the lock is locked, reset it to unlocked, and return.
                If any other coroutines are blocked waiting for the lock to become
                unlocked, allow exactly one of them to proceed.

                When invoked on an unlocked lock, a RuntimeError is raised.

                There is no return value.
                """
        pass

class PriorityQueue(Queue):
    """A subclass of Queue; retrieves entries in priority order (lowest first).

        Entries are typically tuples of the form: (priority number, data).
        """


    __module__ = """asyncio.queues"""

    def _format(*args,**kw):
        pass

    def _get(*args,**kw):
        pass

    def _get_loop(*args,**kw):
        pass

    def _init(*args,**kw):
        pass

    _loop = None

    def _put(*args,**kw):
        pass

    def _wakeup_next(*args,**kw):
        pass

    def empty(*args,**kw):
        """Return True if the queue is empty, False otherwise."""
        pass

    def full(*args,**kw):
        """Return True if there are maxsize items in the queue.
                Note: if the Queue was initialized with maxsize=0 (the default),
                then full() is never True.
                """
        pass

    def get(*args,**kw):
        """Remove and return an item from the queue.
                If queue is empty, wait until an item is available.
                """
        pass

    def get_nowait(*args,**kw):
        """Remove and return an item from the queue.
                Return an item if one is immediately available, else raise QueueEmpty.
                """
        pass

    def join(*args,**kw):
        """Block until all items in the queue have been gotten and processed.
                The count of unfinished tasks goes up whenever an item is added to the
                queue. The count goes down whenever a consumer calls task_done() to
                indicate that the item was retrieved and all work on it is complete.
                When the count of unfinished tasks drops to zero, join() unblocks.
                """
        pass

    maxsize = "<property object at 0x000001EF7C888220>"

    def put(*args,**kw):
        """Put an item into the queue.
                Put an item into the queue. If the queue is full, wait until a free
                slot is available before adding item.
                """
        pass

    def put_nowait(*args,**kw):
        """Put an item into the queue without blocking.
                If no free slot is immediately available, raise QueueFull.
                """
        pass

    def qsize(*args,**kw):
        """Number of items in the queue."""
        pass

    def task_done(*args,**kw):
        """Indicate that a formerly enqueued task is complete.
                Used by queue consumers. For each get() used to fetch a task,
                a subsequent call to task_done() tells the queue that the processing
                on the task is complete.

                If a join() is currently blocking, it will resume when all items have
                been processed (meaning that a task_done() call was received for every
                item that had been put() into the queue).

                Raises ValueError if called more times than there were items placed in
                the queue.
                """
        pass

class ProactorEventLoop(BaseProactorEventLoop):
    """Windows version of proactor event loop using IOCP."""


    __module__ = """asyncio.windows_events"""

    def _add_callback(*args,**kw):
        """Add a Handle to _scheduled (TimerHandle) or _ready."""
        pass

    def _add_callback_signalsafe(*args,**kw):
        """Like _add_callback() but called from a signal handler."""
        pass

    def _asyncgen_finalizer_hook(*args,**kw):
        pass

    def _asyncgen_firstiter_hook(*args,**kw):
        pass

    def _call_soon(*args,**kw):
        pass

    def _check_callback(*args,**kw):
        pass

    def _check_closed(*args,**kw):
        pass

    def _check_default_executor(*args,**kw):
        pass

    def _check_running(*args,**kw):
        pass

    def _check_sendfile_params(*args,**kw):
        pass

    def _check_thread(*args,**kw):
        """Check that the current thread is the thread running the event loop.
                Non-thread-safe methods of this class make this assumption and will
                likely behave incorrectly when the assumption is violated.

                Should only be called when (self._debug == True).  The caller is
                responsible for checking this condition for performance reasons.
                """
        pass

    def _close_self_pipe(*args,**kw):
        pass

    def _connect_sock(*args,**kw):
        """Create, bind and connect one socket."""
        pass

    def _create_connection_transport(*args,**kw):
        pass

    def _create_server_getaddrinfo(*args,**kw):
        pass

    def _do_shutdown(*args,**kw):
        pass

    def _ensure_resolved(*args,**kw):
        pass

    def _getaddrinfo_debug(*args,**kw):
        pass

    def _log_subprocess(*args,**kw):
        pass

    def _loop_self_reading(*args,**kw):
        pass

    def _make_datagram_transport(*args,**kw):
        pass

    def _make_duplex_pipe_transport(*args,**kw):
        pass

    def _make_read_pipe_transport(*args,**kw):
        pass

    def _make_self_pipe(*args,**kw):
        pass

    def _make_socket_transport(*args,**kw):
        pass

    def _make_ssl_transport(*args,**kw):
        pass

    def _make_subprocess_transport(*args,**kw):
        pass

    def _make_write_pipe_transport(*args,**kw):
        pass

    def _process_events(*args,**kw):
        pass

    def _run_once(*args,**kw):
        """Run one full iteration of the event loop.
                This calls all currently ready callbacks, polls for I/O,
                schedules the resulting callbacks, and finally schedules
                'call_later' callbacks.
                """
        pass

    def _sendfile_fallback(*args,**kw):
        pass

    def _sendfile_native(*args,**kw):
        pass

    def _set_coroutine_origin_tracking(*args,**kw):
        pass

    def _sock_sendfile_fallback(*args,**kw):
        pass

    def _sock_sendfile_native(*args,**kw):
        pass

    def _start_serving(*args,**kw):
        pass

    def _stop_accept_futures(*args,**kw):
        pass

    def _stop_serving(*args,**kw):
        pass

    def _timer_handle_cancelled(*args,**kw):
        """Notification that a TimerHandle has been cancelled."""
        pass

    def _write_to_self(*args,**kw):
        pass

    def add_reader(*args,**kw):
        pass

    def add_signal_handler(*args,**kw):
        pass

    def add_writer(*args,**kw):
        pass

    def call_at(*args,**kw):
        """Like call_later(), but uses an absolute time.
                Absolute time corresponds to the event loop's time() method.
                """
        pass

    def call_exception_handler(*args,**kw):
        """Call the current event loop's exception handler.
                The context argument is a dict containing the following keys:

                - 'message': Error message;
                - 'exception' (optional): Exception object;
                - 'future' (optional): Future instance;
                - 'task' (optional): Task instance;
                - 'handle' (optional): Handle instance;
                - 'protocol' (optional): Protocol instance;
                - 'transport' (optional): Transport instance;
                - 'socket' (optional): Socket instance;
                - 'asyncgen' (optional): Asynchronous generator that caused
                                         the exception.

                New keys maybe introduced in the future.

                Note: do not overload this method in an event loop subclass.
                For custom exception handling, use the
                `set_exception_handler()` method.
                """
        pass

    def call_later(*args,**kw):
        """Arrange for a callback to be called at a given time.
                Return a Handle: an opaque object with a cancel() method that
                can be used to cancel the call.

                The delay can be an int or float, expressed in seconds.  It is
                always relative to the current time.

                Each callback will be called exactly once.  If two callbacks
                are scheduled for exactly the same time, it undefined which
                will be called first.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon(*args,**kw):
        """Arrange for a callback to be called as soon as possible.
                This operates as a FIFO queue: callbacks are called in the
                order in which they are registered.  Each callback will be
                called exactly once.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon_threadsafe(*args,**kw):
        """Like call_soon(), but thread-safe."""
        pass

    def close(*args,**kw):
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        """Connect to a TCP server.
                Create a streaming transport connection to a given internet host and
                port: socket family AF_INET or socket.AF_INET6 depending on host (or
                family if specified), socket type SOCK_STREAM. protocol_factory must be
                a callable returning a protocol instance.

                This method is a coroutine which will try to establish the connection
                in the background.  When successful, the coroutine returns a
                (transport, protocol) pair.
                """
        pass

    def create_datagram_endpoint(*args,**kw):
        """Create datagram connection."""
        pass

    def create_future(*args,**kw):
        """Create a Future object attached to the loop."""
        pass

    def create_pipe_connection(*args,**kw):
        pass

    def create_server(*args,**kw):
        """Create a TCP server.
                The host parameter can be a string, in that case the TCP server is
                bound to host and port.

                The host parameter can also be a sequence of strings and in that case
                the TCP server is bound to all hosts of the sequence. If a host
                appears multiple times (possibly indirectly e.g. when hostnames
                resolve to the same IP address), the server is only bound once to that
                host.

                Return a Server object which can be used to stop the service.

                This method is a coroutine.
                """
        pass

    def create_task(*args,**kw):
        """Schedule a coroutine object.
                Return a task object.
                """
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
        """A coroutine which creates a UNIX Domain Socket server.
                The return value is a Server object, which can be used to stop
                the service.

                path is a str, representing a file system path to bind the
                server socket to.

                sock can optionally be specified in order to use a preexisting
                socket object.

                backlog is the maximum number of queued connections passed to
                listen() (defaults to 100).

                ssl can be set to an SSLContext to enable SSL over the
                accepted connections.

                ssl_handshake_timeout is the time in seconds that an SSL server
                will wait for the SSL handshake to complete (defaults to 60s).

                ssl_shutdown_timeout is the time in seconds that an SSL server
                will wait for the SSL shutdown to finish (defaults to 30s).

                start_serving set to True (default) causes the created server
                to start accepting connections immediately.  When set to False,
                the user should await Server.start_serving() or Server.serve_forever()
                to make the server to start accepting connections.
                """
        pass

    def default_exception_handler(*args,**kw):
        """Default exception handler.
                This is called when an exception occurs and no exception
                handler is set, and can be called by a custom exception
                handler that wants to defer to the default behavior.

                This default handler logs the error message and other
                context-dependent information.  In debug mode, a truncated
                stack trace is also appended showing where the given object
                (e.g. a handle or future or task) was created, if any.

                The context parameter has the same meaning as in
                `call_exception_handler()`.
                """
        pass

    def get_debug(*args,**kw):
        pass

    def get_exception_handler(*args,**kw):
        """Return an exception handler, or None if the default one is in use.            """
        pass

    def get_task_factory(*args,**kw):
        """Return a task factory, or None if the default one is in use."""
        pass

    def getaddrinfo(*args,**kw):
        pass

    def getnameinfo(*args,**kw):
        pass

    def is_closed(*args,**kw):
        """Returns True if the event loop was closed."""
        pass

    def is_running(*args,**kw):
        """Returns True if the event loop is running."""
        pass

    def remove_reader(*args,**kw):
        pass

    def remove_signal_handler(*args,**kw):
        pass

    def remove_writer(*args,**kw):
        pass

    def run_forever(*args,**kw):
        pass

    def run_in_executor(*args,**kw):
        pass

    def run_until_complete(*args,**kw):
        """Run until the Future is done.
                If the argument is a coroutine, it is wrapped in a Task.

                WARNING: It would be disastrous to call run_until_complete()
                with the same coroutine twice -- it would wrap it in two
                different Tasks and that can't be good.

                Return the Future's result, or raise its exception.
                """
        pass

    def sendfile(*args,**kw):
        """Send a file to transport.
                Return the total number of bytes which were sent.

                The method uses high-performance os.sendfile if available.

                file must be a regular file object opened in binary mode.

                offset tells from where to start reading the file. If specified,
                count is the total number of bytes to transmit as opposed to
                sending the file until EOF is reached. File position is updated on
                return or also in case of error in which case file.tell()
                can be used to figure out the number of bytes
                which were sent.

                fallback set to True makes asyncio to manually read and send
                the file when the platform does not support the sendfile syscall
                (e.g. Windows or SSL socket on Unix).

                Raise SendfileNotAvailableError if the system does not support
                sendfile syscall and fallback is False.
                """
        pass

    def set_debug(*args,**kw):
        pass

    def set_default_executor(*args,**kw):
        pass

    def set_exception_handler(*args,**kw):
        """Set handler as the new event loop exception handler.
                If handler is None, the default exception handler will
                be set.

                If handler is a callable object, it should have a
                signature matching '(loop, context)', where 'loop'
                will be a reference to the active event loop, 'context'
                will be a dict object (see `call_exception_handler()`
                documentation for details about context).
                """
        pass

    def set_task_factory(*args,**kw):
        """Set a task factory that will be used by loop.create_task().
                If factory is None the default task factory will be set.

                If factory is a callable, it should have a signature matching
                '(loop, coro)', where 'loop' will be a reference to the active
                event loop, 'coro' will be a coroutine object.  The callable
                must return a Future.
                """
        pass

    def shutdown_asyncgens(*args,**kw):
        """Shutdown all active asynchronous generators."""
        pass

    def shutdown_default_executor(*args,**kw):
        """Schedule the shutdown of the default executor."""
        pass

    def sock_accept(*args,**kw):
        pass

    def sock_connect(*args,**kw):
        pass

    def sock_recv(*args,**kw):
        pass

    def sock_recv_into(*args,**kw):
        pass

    def sock_recvfrom(*args,**kw):
        pass

    def sock_recvfrom_into(*args,**kw):
        pass

    def sock_sendall(*args,**kw):
        pass

    def sock_sendfile(*args,**kw):
        pass

    def sock_sendto(*args,**kw):
        pass

    def start_serving_pipe(*args,**kw):
        pass

    def start_tls(*args,**kw):
        """Upgrade transport to TLS.
                Return a new transport that *protocol* should start using
                immediately.
                """
        pass

    def stop(*args,**kw):
        """Stop running the event loop.
                Every callback already scheduled will still run.  This simply informs
                run_forever to stop looping after a complete iteration.
                """
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        """Return the time according to the event loop's clock.
                This is a float expressed in seconds since an epoch, but the
                epoch, precision, accuracy and drift are unspecified and may
                differ per event loop.
                """
        pass

class Protocol(BaseProtocol):
    """Interface for stream protocol.

        The user should implement this interface.  They can inherit from
        this class but don't need to.  The implementations here do
        nothing (they don't raise exceptions).

        When the user wants to requests a transport, they pass a protocol
        factory to a utility function (e.g., EventLoop.create_connection()).

        When the connection is made successfully, connection_made() is
        called with a suitable transport object.  Then data_received()
        will be called 0 or more times with data (bytes) received from the
        transport; finally, connection_lost() will be called exactly once
        with either an exception object or None as an argument.

        State machine of calls:

          start -> CM [-> DR*] [-> ER?] -> CL -> end

        * CM: connection_made()
        * DR: data_received()
        * ER: eof_received()
        * CL: connection_lost()
        """


    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        """Called when the connection is lost or closed.
                The argument is an exception object or None (the latter
                meaning a regular EOF is received or the connection was
                aborted or closed).
                """
        pass

    def connection_made(*args,**kw):
        """Called when a connection is made.
                The argument is the transport representing the pipe connection.
                To receive data, wait for data_received() calls.
                When the connection is closed, connection_lost() is called.
                """
        pass

    def data_received(*args,**kw):
        """Called when some data is received.
                The argument is a bytes object.
                """
        pass

    def eof_received(*args,**kw):
        """Called when the other end calls write_eof() or equivalent.
                If this returns a false value (including None), the transport
                will close itself.  If it returns a true value, closing the
                transport is up to the protocol.
                """
        pass

    def pause_writing(*args,**kw):
        """Called when the transport's buffer goes over the high-water mark.
                Pause and resume calls are paired -- pause_writing() is called
                once when the buffer goes strictly over the high-water mark
                (even if subsequent writes increases the buffer size even
                more), and eventually resume_writing() is called once when the
                buffer size reaches the low-water mark.

                Note that if the buffer size equals the high-water mark,
                pause_writing() is not called -- it must go strictly over.
                Conversely, resume_writing() is called when the buffer size is
                equal or lower than the low-water mark.  These end conditions
                are important to ensure that things go as expected when either
                mark is zero.

                NOTE: This is the only Protocol callback that is not called
                through EventLoop.call_soon() -- if it were, it would have no
                effect when it's most needed (when the app keeps writing
                without yielding until pause_writing() is called).
                """
        pass

    def resume_writing(*args,**kw):
        """Called when the transport's buffer drains below the low-water mark.
                See pause_writing() for details.
                """
        pass

class Queue(_LoopBoundMixin):
    """A queue, useful for coordinating producer and consumer coroutines.

        If maxsize is less than or equal to zero, the queue size is infinite. If it
        is an integer greater than 0, then "await put()" will block when the
        queue reaches maxsize, until an item is removed by get().

        Unlike the standard library Queue, you can reliably know this Queue's size
        with qsize(), since your single-threaded asyncio application won't be
        interrupted between calling qsize() and doing an operation on the Queue.
        """


    __module__ = """asyncio.queues"""

    def _format(*args,**kw):
        pass

    def _get(*args,**kw):
        pass

    def _get_loop(*args,**kw):
        pass

    def _init(*args,**kw):
        pass

    _loop = None

    def _put(*args,**kw):
        pass

    def _wakeup_next(*args,**kw):
        pass

    def empty(*args,**kw):
        """Return True if the queue is empty, False otherwise."""
        pass

    def full(*args,**kw):
        """Return True if there are maxsize items in the queue.
                Note: if the Queue was initialized with maxsize=0 (the default),
                then full() is never True.
                """
        pass

    def get(*args,**kw):
        """Remove and return an item from the queue.
                If queue is empty, wait until an item is available.
                """
        pass

    def get_nowait(*args,**kw):
        """Remove and return an item from the queue.
                Return an item if one is immediately available, else raise QueueEmpty.
                """
        pass

    def join(*args,**kw):
        """Block until all items in the queue have been gotten and processed.
                The count of unfinished tasks goes up whenever an item is added to the
                queue. The count goes down whenever a consumer calls task_done() to
                indicate that the item was retrieved and all work on it is complete.
                When the count of unfinished tasks drops to zero, join() unblocks.
                """
        pass

    maxsize = "<property object at 0x000001EF7C888220>"

    def put(*args,**kw):
        """Put an item into the queue.
                Put an item into the queue. If the queue is full, wait until a free
                slot is available before adding item.
                """
        pass

    def put_nowait(*args,**kw):
        """Put an item into the queue without blocking.
                If no free slot is immediately available, raise QueueFull.
                """
        pass

    def qsize(*args,**kw):
        """Number of items in the queue."""
        pass

    def task_done(*args,**kw):
        """Indicate that a formerly enqueued task is complete.
                Used by queue consumers. For each get() used to fetch a task,
                a subsequent call to task_done() tells the queue that the processing
                on the task is complete.

                If a join() is currently blocking, it will resume when all items have
                been processed (meaning that a task_done() call was received for every
                item that had been put() into the queue).

                Raises ValueError if called more times than there were items placed in
                the queue.
                """
        pass

class QueueEmpty(Exception):
    """Raised when Queue.get_nowait() is called on an empty Queue."""


    __module__ = """asyncio.queues"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class QueueFull(Exception):
    """Raised when the Queue.put_nowait() method is called on a full Queue."""


    __module__ = """asyncio.queues"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class ReadTransport(BaseTransport):
    """Interface for read-only transports."""


    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def is_reading(*args,**kw):
        """Return True if the transport is receiving."""
        pass

    def pause_reading(*args,**kw):
        """Pause the receiving end.
                No data will be passed to the protocol's data_received()
                method until resume_reading() is called.
                """
        pass

    def resume_reading(*args,**kw):
        """Resume the receiving end.
                Data received will once again be passed to the protocol's
                data_received() method.
                """
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

class Runner(object):
    """A context manager that controls event loop life cycle.

        The context manager always creates a new event loop,
        allows to run async functions inside it,
        and properly finalizes the loop at the context manager exit.

        If debug is True, the event loop will be run in debug mode.
        If loop_factory is passed, it is used for new event loop creation.

        asyncio.run(main(), debug=True)

        is a shortcut for

        with asyncio.Runner(debug=True) as runner:
            runner.run(main())

        The run() method can be called multiple times within the runner's context.

        This can be useful for interactive console (e.g. IPython),
        unittest runners, console tools, -- everywhere when async code
        is called from existing sync framework and where the preferred single
        asyncio.run() call doesn't work.

        """


    __module__ = """asyncio.runners"""

    def _lazy_init(*args,**kw):
        pass

    def _on_sigint(*args,**kw):
        pass

    def close(*args,**kw):
        """Shutdown and close event loop."""
        pass

    def get_loop(*args,**kw):
        """Return embedded event loop."""
        pass

    def run(*args,**kw):
        """Run a coroutine inside the embedded event loop."""
        pass

class SelectorEventLoop(BaseSelectorEventLoop):
    """Windows version of selector event loop."""


    __module__ = """asyncio.windows_events"""

    def _accept_connection(*args,**kw):
        pass

    def _accept_connection2(*args,**kw):
        pass

    def _add_callback(*args,**kw):
        """Add a Handle to _scheduled (TimerHandle) or _ready."""
        pass

    def _add_callback_signalsafe(*args,**kw):
        """Like _add_callback() but called from a signal handler."""
        pass

    def _add_reader(*args,**kw):
        pass

    def _add_writer(*args,**kw):
        pass

    def _asyncgen_finalizer_hook(*args,**kw):
        pass

    def _asyncgen_firstiter_hook(*args,**kw):
        pass

    def _call_soon(*args,**kw):
        pass

    def _check_callback(*args,**kw):
        pass

    def _check_closed(*args,**kw):
        pass

    def _check_default_executor(*args,**kw):
        pass

    def _check_running(*args,**kw):
        pass

    def _check_sendfile_params(*args,**kw):
        pass

    def _check_thread(*args,**kw):
        """Check that the current thread is the thread running the event loop.
                Non-thread-safe methods of this class make this assumption and will
                likely behave incorrectly when the assumption is violated.

                Should only be called when (self._debug == True).  The caller is
                responsible for checking this condition for performance reasons.
                """
        pass

    def _close_self_pipe(*args,**kw):
        pass

    def _connect_sock(*args,**kw):
        """Create, bind and connect one socket."""
        pass

    def _create_connection_transport(*args,**kw):
        pass

    def _create_server_getaddrinfo(*args,**kw):
        pass

    def _do_shutdown(*args,**kw):
        pass

    def _ensure_fd_no_transport(*args,**kw):
        pass

    def _ensure_resolved(*args,**kw):
        pass

    def _getaddrinfo_debug(*args,**kw):
        pass

    def _log_subprocess(*args,**kw):
        pass

    def _make_datagram_transport(*args,**kw):
        pass

    def _make_read_pipe_transport(*args,**kw):
        """Create read pipe transport."""
        pass

    def _make_self_pipe(*args,**kw):
        pass

    def _make_socket_transport(*args,**kw):
        pass

    def _make_ssl_transport(*args,**kw):
        pass

    def _make_subprocess_transport(*args,**kw):
        """Create subprocess transport."""
        pass

    def _make_write_pipe_transport(*args,**kw):
        """Create write pipe transport."""
        pass

    def _process_events(*args,**kw):
        pass

    def _process_self_data(*args,**kw):
        pass

    def _read_from_self(*args,**kw):
        pass

    def _remove_reader(*args,**kw):
        pass

    def _remove_writer(*args,**kw):
        """Remove a writer callback."""
        pass

    def _run_once(*args,**kw):
        """Run one full iteration of the event loop.
                This calls all currently ready callbacks, polls for I/O,
                schedules the resulting callbacks, and finally schedules
                'call_later' callbacks.
                """
        pass

    def _sendfile_fallback(*args,**kw):
        pass

    def _sendfile_native(*args,**kw):
        pass

    def _set_coroutine_origin_tracking(*args,**kw):
        pass

    def _sock_accept(*args,**kw):
        pass

    def _sock_connect(*args,**kw):
        pass

    def _sock_connect_cb(*args,**kw):
        pass

    def _sock_read_done(*args,**kw):
        pass

    def _sock_recv(*args,**kw):
        pass

    def _sock_recv_into(*args,**kw):
        pass

    def _sock_recvfrom(*args,**kw):
        pass

    def _sock_recvfrom_into(*args,**kw):
        pass

    def _sock_sendall(*args,**kw):
        pass

    def _sock_sendfile_fallback(*args,**kw):
        pass

    def _sock_sendfile_native(*args,**kw):
        pass

    def _sock_sendto(*args,**kw):
        pass

    def _sock_write_done(*args,**kw):
        pass

    def _start_serving(*args,**kw):
        pass

    def _stop_serving(*args,**kw):
        pass

    def _timer_handle_cancelled(*args,**kw):
        """Notification that a TimerHandle has been cancelled."""
        pass

    def _write_to_self(*args,**kw):
        pass

    def add_reader(*args,**kw):
        """Add a reader callback."""
        pass

    def add_signal_handler(*args,**kw):
        pass

    def add_writer(*args,**kw):
        """Add a writer callback.."""
        pass

    def call_at(*args,**kw):
        """Like call_later(), but uses an absolute time.
                Absolute time corresponds to the event loop's time() method.
                """
        pass

    def call_exception_handler(*args,**kw):
        """Call the current event loop's exception handler.
                The context argument is a dict containing the following keys:

                - 'message': Error message;
                - 'exception' (optional): Exception object;
                - 'future' (optional): Future instance;
                - 'task' (optional): Task instance;
                - 'handle' (optional): Handle instance;
                - 'protocol' (optional): Protocol instance;
                - 'transport' (optional): Transport instance;
                - 'socket' (optional): Socket instance;
                - 'asyncgen' (optional): Asynchronous generator that caused
                                         the exception.

                New keys maybe introduced in the future.

                Note: do not overload this method in an event loop subclass.
                For custom exception handling, use the
                `set_exception_handler()` method.
                """
        pass

    def call_later(*args,**kw):
        """Arrange for a callback to be called at a given time.
                Return a Handle: an opaque object with a cancel() method that
                can be used to cancel the call.

                The delay can be an int or float, expressed in seconds.  It is
                always relative to the current time.

                Each callback will be called exactly once.  If two callbacks
                are scheduled for exactly the same time, it undefined which
                will be called first.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon(*args,**kw):
        """Arrange for a callback to be called as soon as possible.
                This operates as a FIFO queue: callbacks are called in the
                order in which they are registered.  Each callback will be
                called exactly once.

                Any positional arguments after the callback will be passed to
                the callback when it is called.
                """
        pass

    def call_soon_threadsafe(*args,**kw):
        """Like call_soon(), but thread-safe."""
        pass

    def close(*args,**kw):
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        """Connect to a TCP server.
                Create a streaming transport connection to a given internet host and
                port: socket family AF_INET or socket.AF_INET6 depending on host (or
                family if specified), socket type SOCK_STREAM. protocol_factory must be
                a callable returning a protocol instance.

                This method is a coroutine which will try to establish the connection
                in the background.  When successful, the coroutine returns a
                (transport, protocol) pair.
                """
        pass

    def create_datagram_endpoint(*args,**kw):
        """Create datagram connection."""
        pass

    def create_future(*args,**kw):
        """Create a Future object attached to the loop."""
        pass

    def create_server(*args,**kw):
        """Create a TCP server.
                The host parameter can be a string, in that case the TCP server is
                bound to host and port.

                The host parameter can also be a sequence of strings and in that case
                the TCP server is bound to all hosts of the sequence. If a host
                appears multiple times (possibly indirectly e.g. when hostnames
                resolve to the same IP address), the server is only bound once to that
                host.

                Return a Server object which can be used to stop the service.

                This method is a coroutine.
                """
        pass

    def create_task(*args,**kw):
        """Schedule a coroutine object.
                Return a task object.
                """
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
        """A coroutine which creates a UNIX Domain Socket server.
                The return value is a Server object, which can be used to stop
                the service.

                path is a str, representing a file system path to bind the
                server socket to.

                sock can optionally be specified in order to use a preexisting
                socket object.

                backlog is the maximum number of queued connections passed to
                listen() (defaults to 100).

                ssl can be set to an SSLContext to enable SSL over the
                accepted connections.

                ssl_handshake_timeout is the time in seconds that an SSL server
                will wait for the SSL handshake to complete (defaults to 60s).

                ssl_shutdown_timeout is the time in seconds that an SSL server
                will wait for the SSL shutdown to finish (defaults to 30s).

                start_serving set to True (default) causes the created server
                to start accepting connections immediately.  When set to False,
                the user should await Server.start_serving() or Server.serve_forever()
                to make the server to start accepting connections.
                """
        pass

    def default_exception_handler(*args,**kw):
        """Default exception handler.
                This is called when an exception occurs and no exception
                handler is set, and can be called by a custom exception
                handler that wants to defer to the default behavior.

                This default handler logs the error message and other
                context-dependent information.  In debug mode, a truncated
                stack trace is also appended showing where the given object
                (e.g. a handle or future or task) was created, if any.

                The context parameter has the same meaning as in
                `call_exception_handler()`.
                """
        pass

    def get_debug(*args,**kw):
        pass

    def get_exception_handler(*args,**kw):
        """Return an exception handler, or None if the default one is in use.            """
        pass

    def get_task_factory(*args,**kw):
        """Return a task factory, or None if the default one is in use."""
        pass

    def getaddrinfo(*args,**kw):
        pass

    def getnameinfo(*args,**kw):
        pass

    def is_closed(*args,**kw):
        """Returns True if the event loop was closed."""
        pass

    def is_running(*args,**kw):
        """Returns True if the event loop is running."""
        pass

    def remove_reader(*args,**kw):
        """Remove a reader callback."""
        pass

    def remove_signal_handler(*args,**kw):
        pass

    def remove_writer(*args,**kw):
        """Remove a writer callback."""
        pass

    def run_forever(*args,**kw):
        """Run until stop() is called."""
        pass

    def run_in_executor(*args,**kw):
        pass

    def run_until_complete(*args,**kw):
        """Run until the Future is done.
                If the argument is a coroutine, it is wrapped in a Task.

                WARNING: It would be disastrous to call run_until_complete()
                with the same coroutine twice -- it would wrap it in two
                different Tasks and that can't be good.

                Return the Future's result, or raise its exception.
                """
        pass

    def sendfile(*args,**kw):
        """Send a file to transport.
                Return the total number of bytes which were sent.

                The method uses high-performance os.sendfile if available.

                file must be a regular file object opened in binary mode.

                offset tells from where to start reading the file. If specified,
                count is the total number of bytes to transmit as opposed to
                sending the file until EOF is reached. File position is updated on
                return or also in case of error in which case file.tell()
                can be used to figure out the number of bytes
                which were sent.

                fallback set to True makes asyncio to manually read and send
                the file when the platform does not support the sendfile syscall
                (e.g. Windows or SSL socket on Unix).

                Raise SendfileNotAvailableError if the system does not support
                sendfile syscall and fallback is False.
                """
        pass

    def set_debug(*args,**kw):
        pass

    def set_default_executor(*args,**kw):
        pass

    def set_exception_handler(*args,**kw):
        """Set handler as the new event loop exception handler.
                If handler is None, the default exception handler will
                be set.

                If handler is a callable object, it should have a
                signature matching '(loop, context)', where 'loop'
                will be a reference to the active event loop, 'context'
                will be a dict object (see `call_exception_handler()`
                documentation for details about context).
                """
        pass

    def set_task_factory(*args,**kw):
        """Set a task factory that will be used by loop.create_task().
                If factory is None the default task factory will be set.

                If factory is a callable, it should have a signature matching
                '(loop, coro)', where 'loop' will be a reference to the active
                event loop, 'coro' will be a coroutine object.  The callable
                must return a Future.
                """
        pass

    def shutdown_asyncgens(*args,**kw):
        """Shutdown all active asynchronous generators."""
        pass

    def shutdown_default_executor(*args,**kw):
        """Schedule the shutdown of the default executor."""
        pass

    def sock_accept(*args,**kw):
        """Accept a connection.
                The socket must be bound to an address and listening for connections.
                The return value is a pair (conn, address) where conn is a new socket
                object usable to send and receive data on the connection, and address
                is the address bound to the socket on the other end of the connection.
                """
        pass

    def sock_connect(*args,**kw):
        """Connect to a remote socket at address.
                This method is a coroutine.
                """
        pass

    def sock_recv(*args,**kw):
        """Receive data from the socket.
                The return value is a bytes object representing the data received.
                The maximum amount of data to be received at once is specified by
                nbytes.
                """
        pass

    def sock_recv_into(*args,**kw):
        """Receive data from the socket.
                The received data is written into *buf* (a writable buffer).
                The return value is the number of bytes written.
                """
        pass

    def sock_recvfrom(*args,**kw):
        """Receive a datagram from a datagram socket.
                The return value is a tuple of (bytes, address) representing the
                datagram received and the address it came from.
                The maximum amount of data to be received at once is specified by
                nbytes.
                """
        pass

    def sock_recvfrom_into(*args,**kw):
        """Receive data from the socket.
                The received data is written into *buf* (a writable buffer).
                The return value is a tuple of (number of bytes written, address).
                """
        pass

    def sock_sendall(*args,**kw):
        """Send data to the socket.
                The socket must be connected to a remote socket. This method continues
                to send data from data until either all data has been sent or an
                error occurs. None is returned on success. On error, an exception is
                raised, and there is no way to determine how much data, if any, was
                successfully processed by the receiving end of the connection.
                """
        pass

    def sock_sendfile(*args,**kw):
        pass

    def sock_sendto(*args,**kw):
        """Send data to the socket.
                The socket must be connected to a remote socket. This method continues
                to send data from data until either all data has been sent or an
                error occurs. None is returned on success. On error, an exception is
                raised, and there is no way to determine how much data, if any, was
                successfully processed by the receiving end of the connection.
                """
        pass

    def start_tls(*args,**kw):
        """Upgrade transport to TLS.
                Return a new transport that *protocol* should start using
                immediately.
                """
        pass

    def stop(*args,**kw):
        """Stop running the event loop.
                Every callback already scheduled will still run.  This simply informs
                run_forever to stop looping after a complete iteration.
                """
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        """Return the time according to the event loop's clock.
                This is a float expressed in seconds since an epoch, but the
                epoch, precision, accuracy and drift are unspecified and may
                differ per event loop.
                """
        pass

class Semaphore(_ContextManagerMixin,_LoopBoundMixin):
    """A Semaphore implementation.

        A semaphore manages an internal counter which is decremented by each
        acquire() call and incremented by each release() call. The counter
        can never go below zero; when acquire() finds that it is zero, it blocks,
        waiting until some other thread calls release().

        Semaphores also support the context management protocol.

        The optional argument gives the initial value for the internal
        counter; it defaults to 1. If the value given is less than 0,
        ValueError is raised.
        """


    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_next(*args,**kw):
        pass

    def acquire(*args,**kw):
        """Acquire a semaphore.
                If the internal counter is larger than zero on entry,
                decrement it by one and return True immediately.  If it is
                zero on entry, block, waiting until some other coroutine has
                called release() to make it larger than 0, and then return
                True.
                """
        pass

    def locked(*args,**kw):
        """Returns True if semaphore can not be acquired immediately."""
        pass

    def release(*args,**kw):
        """Release a semaphore, incrementing the internal counter by one.            When it was zero on entry and another coroutine is waiting for it to
                become larger than zero again, wake up that coroutine.
                """
        pass

class SendfileNotAvailableError(RuntimeError):
    """Sendfile syscall is not available.

        Raised if OS does not support sendfile syscall for given socket or
        file type.
        """


    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Server(AbstractServer):

    __module__ = """asyncio.base_events"""

    def _attach(*args,**kw):
        pass

    def _detach(*args,**kw):
        pass

    def _start_serving(*args,**kw):
        pass

    def _wakeup(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def get_loop(*args,**kw):
        pass

    def is_serving(*args,**kw):
        pass

    def serve_forever(*args,**kw):
        pass

    sockets = "<property object at 0x000001EF7C7E2E80>"

    def start_serving(*args,**kw):
        pass

    def wait_closed(*args,**kw):
        pass

class StreamReader(object):

    __module__ = """asyncio.streams"""

    def _maybe_resume_transport(*args,**kw):
        pass

    _source_traceback = None

    def _wait_for_data(*args,**kw):
        """Wait until feed_data() or feed_eof() is called.
                If stream was paused, automatically resume it.
                """
        pass

    def _wakeup_waiter(*args,**kw):
        """Wakeup read*() functions waiting for data or EOF."""
        pass

    def at_eof(*args,**kw):
        """Return True if the buffer is empty and 'feed_eof' was called."""
        pass

    def exception(*args,**kw):
        pass

    def feed_data(*args,**kw):
        pass

    def feed_eof(*args,**kw):
        pass

    def read(*args,**kw):
        """Read up to `n` bytes from the stream.
                If n is not provided, or set to -1, read until EOF and return all read
                bytes. If the EOF was received and the internal buffer is empty, return
                an empty bytes object.

                If n is zero, return empty bytes object immediately.

                If n is positive, this function try to read `n` bytes, and may return
                less or equal bytes than requested, but at least one byte. If EOF was
                received before any byte is read, this function returns empty byte
                object.

                Returned value is not limited with limit, configured at stream
                creation.

                If stream was paused, this function will automatically resume it if
                needed.
                """
        pass

    def readexactly(*args,**kw):
        """Read exactly `n` bytes.
                Raise an IncompleteReadError if EOF is reached before `n` bytes can be
                read. The IncompleteReadError.partial attribute of the exception will
                contain the partial read bytes.

                if n is zero, return empty bytes object.

                Returned value is not limited with limit, configured at stream
                creation.

                If stream was paused, this function will automatically resume it if
                needed.
                """
        pass

    def readline(*args,**kw):
        """Read chunk of data from the stream until newline (b'    ') is found.

                On success, return chunk that ends with newline. If only partial
                line can be read due to EOF, return incomplete line without
                terminating newline. When EOF was reached while no bytes read, empty
                bytes object is returned.

                If limit is reached, ValueError will be raised. In that case, if
                newline was found, complete line including newline will be removed
                from internal buffer. Else, internal buffer will be cleared. Limit is
                compared against part of the line without newline.

                If stream was paused, this function will automatically resume it if
                needed.
                """
        pass

    def readuntil(*args,**kw):
        """Read data from the stream until ``separator`` is found.
                On success, the data and separator will be removed from the
                internal buffer (consumed). Returned data will include the
                separator at the end.

                Configured stream limit is used to check result. Limit sets the
                maximal length of data that can be returned, not counting the
                separator.

                If an EOF occurs and the complete separator is still not found,
                an IncompleteReadError exception will be raised, and the internal
                buffer will be reset.  The IncompleteReadError.partial attribute
                may contain the separator partially.

                If the data cannot be read because of over limit, a
                LimitOverrunError exception  will be raised, and the data
                will be left in the internal buffer, so it can be read again.
                """
        pass

    def set_exception(*args,**kw):
        pass

    def set_transport(*args,**kw):
        pass

class StreamReaderProtocol(FlowControlMixin,Protocol):
    """Helper class to adapt between Protocol and StreamReader.

        (This is a helper class instead of making StreamReader itself a
        Protocol subclass, because the StreamReader has other potential
        uses, and to prevent the user of the StreamReader to accidentally
        call inappropriate methods of the protocol.)
        """


    __module__ = """asyncio.streams"""

    def _drain_helper(*args,**kw):
        pass

    def _get_close_waiter(*args,**kw):
        pass

    def _replace_writer(*args,**kw):
        pass

    _source_traceback = None

    _stream_reader = "<property object at 0x000001EF7C889DF0>"

    def connection_lost(*args,**kw):
        pass

    def connection_made(*args,**kw):
        pass

    def data_received(*args,**kw):
        pass

    def eof_received(*args,**kw):
        pass

    def pause_writing(*args,**kw):
        pass

    def resume_writing(*args,**kw):
        pass

class StreamWriter(object):
    """Wraps a Transport.

        This exposes write(), writelines(), [can_]write_eof(),
        get_extra_info() and close().  It adds drain() which returns an
        optional Future on which you can wait for flow control.  It also
        adds a transport property which references the Transport
        directly.
        """


    __module__ = """asyncio.streams"""

    def can_write_eof(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def drain(*args,**kw):
        """Flush the write buffer.
                The intended use is to write

                  w.write(data)
                  await w.drain()
                """
        pass

    def get_extra_info(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def start_tls(*args,**kw):
        """Upgrade an existing stream-based connection to TLS."""
        pass

    transport = "<property object at 0x000001EF7C889EE0>"

    def wait_closed(*args,**kw):
        pass

    def write(*args,**kw):
        pass

    def write_eof(*args,**kw):
        pass

    def writelines(*args,**kw):
        pass

class SubprocessProtocol(BaseProtocol):
    """Interface for protocol for subprocess calls."""


    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        """Called when the connection is lost or closed.
                The argument is an exception object or None (the latter
                meaning a regular EOF is received or the connection was
                aborted or closed).
                """
        pass

    def connection_made(*args,**kw):
        """Called when a connection is made.
                The argument is the transport representing the pipe connection.
                To receive data, wait for data_received() calls.
                When the connection is closed, connection_lost() is called.
                """
        pass

    def pause_writing(*args,**kw):
        """Called when the transport's buffer goes over the high-water mark.
                Pause and resume calls are paired -- pause_writing() is called
                once when the buffer goes strictly over the high-water mark
                (even if subsequent writes increases the buffer size even
                more), and eventually resume_writing() is called once when the
                buffer size reaches the low-water mark.

                Note that if the buffer size equals the high-water mark,
                pause_writing() is not called -- it must go strictly over.
                Conversely, resume_writing() is called when the buffer size is
                equal or lower than the low-water mark.  These end conditions
                are important to ensure that things go as expected when either
                mark is zero.

                NOTE: This is the only Protocol callback that is not called
                through EventLoop.call_soon() -- if it were, it would have no
                effect when it's most needed (when the app keeps writing
                without yielding until pause_writing() is called).
                """
        pass

    def pipe_connection_lost(*args,**kw):
        """Called when a file descriptor associated with the child process is            closed.

                fd is the int file descriptor that was closed.
                """
        pass

    def pipe_data_received(*args,**kw):
        """Called when the subprocess writes data into stdout/stderr pipe.
                fd is int file descriptor.
                data is bytes object.
                """
        pass

    def process_exited(*args,**kw):
        """Called when subprocess has exited."""
        pass

    def resume_writing(*args,**kw):
        """Called when the transport's buffer drains below the low-water mark.
                See pause_writing() for details.
                """
        pass

class SubprocessTransport(BaseTransport):

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_pid(*args,**kw):
        """Get subprocess id."""
        pass

    def get_pipe_transport(*args,**kw):
        """Get transport for pipe with number fd."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def get_returncode(*args,**kw):
        """Get subprocess returncode.
                See also
                http://docs.python.org/3/library/subprocess#subprocess.Popen.returncode
                """
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def kill(*args,**kw):
        """Kill the subprocess.
                On Posix OSs the function sends SIGKILL to the subprocess.
                On Windows kill() is an alias for terminate().

                See also:
                http://docs.python.org/3/library/subprocess#subprocess.Popen.kill
                """
        pass

    def send_signal(*args,**kw):
        """Send signal to subprocess.
                See also:
                docs.python.org/3/library/subprocess#subprocess.Popen.send_signal
                """
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

    def terminate(*args,**kw):
        """Stop the subprocess.
                Alias for close() method.

                On Posix OSs the method sends SIGTERM to the subprocess.
                On Windows the Win32 API function TerminateProcess()
                 is called to stop the subprocess.

                See also:
                http://docs.python.org/3/library/subprocess#subprocess.Popen.terminate
                """
        pass

class Task(Future):
    """A coroutine wrapped in a Future."""


    _asyncio_future_blocking = "<attribute '_asyncio_future_blocking' of '_asyncio.Task' objects>"

    _callbacks = "<attribute '_callbacks' of '_asyncio.Task' objects>"

    _cancel_message = "<attribute '_cancel_message' of '_asyncio.Task' objects>"

    _check_future = "<method '_check_future' of '_asyncio.Task' objects>"

    _coro = "<attribute '_coro' of '_asyncio.Task' objects>"

    _exception = "<attribute '_exception' of '_asyncio.Task' objects>"

    _fut_waiter = "<attribute '_fut_waiter' of '_asyncio.Task' objects>"

    _log_destroy_pending = "<attribute '_log_destroy_pending' of '_asyncio.Task' objects>"

    _log_traceback = "<attribute '_log_traceback' of '_asyncio.Task' objects>"

    _loop = "<attribute '_loop' of '_asyncio.Task' objects>"

    _make_cancelled_error = "<method '_make_cancelled_error' of '_asyncio.Task' objects>"

    _must_cancel = "<attribute '_must_cancel' of '_asyncio.Task' objects>"

    _result = "<attribute '_result' of '_asyncio.Task' objects>"

    _source_traceback = "<attribute '_source_traceback' of '_asyncio.Task' objects>"

    _state = "<attribute '_state' of '_asyncio.Task' objects>"

    add_done_callback = "<method 'add_done_callback' of '_asyncio.Task' objects>"

    cancel = "<method 'cancel' of '_asyncio.Task' objects>"

    cancelled = "<method 'cancelled' of '_asyncio.Task' objects>"

    cancelling = "<method 'cancelling' of '_asyncio.Task' objects>"

    done = "<method 'done' of '_asyncio.Task' objects>"

    exception = "<method 'exception' of '_asyncio.Task' objects>"

    get_coro = "<method 'get_coro' of '_asyncio.Task' objects>"

    get_loop = "<method 'get_loop' of '_asyncio.Future' objects>"

    get_name = "<method 'get_name' of '_asyncio.Task' objects>"

    get_stack = "<method 'get_stack' of '_asyncio.Task' objects>"

    print_stack = "<method 'print_stack' of '_asyncio.Task' objects>"

    remove_done_callback = "<method 'remove_done_callback' of '_asyncio.Task' objects>"

    result = "<method 'result' of '_asyncio.Task' objects>"

    set_exception = "<method 'set_exception' of '_asyncio.Task' objects>"

    set_name = "<method 'set_name' of '_asyncio.Task' objects>"

    set_result = "<method 'set_result' of '_asyncio.Task' objects>"

    uncancel = "<method 'uncancel' of '_asyncio.Task' objects>"

class TaskGroup(object):

    __module__ = """asyncio.taskgroups"""

    def _abort(*args,**kw):
        pass

    def _is_base_error(*args,**kw):
        pass

    def _on_task_done(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

class Timeout(object):

    __module__ = """asyncio.timeouts"""

    def _on_timeout(*args,**kw):
        pass

    def expired(*args,**kw):
        """Is timeout expired during execution?"""
        pass

    def reschedule(*args,**kw):
        pass

    def when(*args,**kw):
        pass

class TimeoutError(OSError):
    """Timeout expired."""


    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    characters_written = "<attribute 'characters_written' of 'OSError' objects>"

    errno = "<member 'errno' of 'OSError' objects>"

    filename = "<member 'filename' of 'OSError' objects>"

    filename2 = "<member 'filename2' of 'OSError' objects>"

    strerror = "<member 'strerror' of 'OSError' objects>"

    winerror = "<member 'winerror' of 'OSError' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class TimerHandle(Handle):
    """Object returned by timed callback registration methods."""


    __module__ = """asyncio.events"""

    _args = "<member '_args' of 'Handle' objects>"

    _callback = "<member '_callback' of 'Handle' objects>"

    _cancelled = "<member '_cancelled' of 'Handle' objects>"

    _context = "<member '_context' of 'Handle' objects>"

    _loop = "<member '_loop' of 'Handle' objects>"

    _repr = "<member '_repr' of 'Handle' objects>"

    def _repr_info(*args,**kw):
        pass

    def _run(*args,**kw):
        pass

    _scheduled = "<member '_scheduled' of 'TimerHandle' objects>"

    _source_traceback = "<member '_source_traceback' of 'Handle' objects>"

    _when = "<member '_when' of 'TimerHandle' objects>"

    def cancel(*args,**kw):
        pass

    def cancelled(*args,**kw):
        pass

    def when(*args,**kw):
        """Return a scheduled callback time.
                The time is an absolute timestamp, using the same time
                reference as loop.time().
                """
        pass

class Transport(ReadTransport,WriteTransport):
    """Interface representing a bidirectional transport.

        There may be several implementations, but typically, the user does
        not implement new transports; rather, the platform provides some
        useful transports that are implemented using the platform's best
        practices.

        The user never instantiates a transport directly; they call a
        utility function, passing it a protocol factory and other
        information necessary to create the transport and protocol.  (E.g.
        EventLoop.create_connection() or EventLoop.create_server().)

        The utility function will asynchronously create a transport and a
        protocol and hook them up by calling the protocol's
        connection_made() method, passing it the transport.

        The implementation here raises NotImplemented for every method
        except writelines(), which calls write() in a loop.
        """


    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        """Close the transport immediately.
                Buffered data will be lost.  No more data will be received.
                The protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def can_write_eof(*args,**kw):
        """Return True if this transport supports write_eof(), False if not."""
        pass

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def get_write_buffer_limits(*args,**kw):
        """Get the high and low watermarks for write flow control.            Return a tuple (low, high) where low and high are
                positive number of bytes."""
        pass

    def get_write_buffer_size(*args,**kw):
        """Return the current size of the write buffer."""
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def is_reading(*args,**kw):
        """Return True if the transport is receiving."""
        pass

    def pause_reading(*args,**kw):
        """Pause the receiving end.
                No data will be passed to the protocol's data_received()
                method until resume_reading() is called.
                """
        pass

    def resume_reading(*args,**kw):
        """Resume the receiving end.
                Data received will once again be passed to the protocol's
                data_received() method.
                """
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

    def set_write_buffer_limits(*args,**kw):
        """Set the high- and low-water limits for write flow control.
                These two values control when to call the protocol's
                pause_writing() and resume_writing() methods.  If specified,
                the low-water limit must be less than or equal to the
                high-water limit.  Neither value can be negative.

                The defaults are implementation-specific.  If only the
                high-water limit is given, the low-water limit defaults to an
                implementation-specific value less than or equal to the
                high-water limit.  Setting high to zero forces low to zero as
                well, and causes pause_writing() to be called whenever the
                buffer becomes non-empty.  Setting low to zero causes
                resume_writing() to be called only once the buffer is empty.
                Use of zero for either limit is generally sub-optimal as it
                reduces opportunities for doing I/O and computation
                concurrently.
                """
        pass

    def write(*args,**kw):
        """Write some data bytes to the transport.
                This does not block; it buffers the data and arranges for it
                to be sent out asynchronously.
                """
        pass

    def write_eof(*args,**kw):
        """Close the write end after flushing buffered data.
                (This is like typing ^D into a UNIX program reading from stdin.)

                Data may still be received.
                """
        pass

    def writelines(*args,**kw):
        """Write a list (or any iterable) of data bytes to the transport.
                The default implementation concatenates the arguments and
                calls write() on the result.
                """
        pass

class WindowsProactorEventLoopPolicy(BaseDefaultEventLoopPolicy):


    class _Local(_local):

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory(BaseProactorEventLoop):
        """Windows version of proactor event loop using IOCP."""


        __module__ = """asyncio.windows_events"""

        def _add_callback(*args,**kw):
            """Add a Handle to _scheduled (TimerHandle) or _ready."""
            pass

        def _add_callback_signalsafe(*args,**kw):
            """Like _add_callback() but called from a signal handler."""
            pass

        def _asyncgen_finalizer_hook(*args,**kw):
            pass

        def _asyncgen_firstiter_hook(*args,**kw):
            pass

        def _call_soon(*args,**kw):
            pass

        def _check_callback(*args,**kw):
            pass

        def _check_closed(*args,**kw):
            pass

        def _check_default_executor(*args,**kw):
            pass

        def _check_running(*args,**kw):
            pass

        def _check_sendfile_params(*args,**kw):
            pass

        def _check_thread(*args,**kw):
            """Check that the current thread is the thread running the event loop.
                    Non-thread-safe methods of this class make this assumption and will
                    likely behave incorrectly when the assumption is violated.

                    Should only be called when (self._debug == True).  The caller is
                    responsible for checking this condition for performance reasons.
                    """
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
            """Create, bind and connect one socket."""
            pass

        def _create_connection_transport(*args,**kw):
            pass

        def _create_server_getaddrinfo(*args,**kw):
            pass

        def _do_shutdown(*args,**kw):
            pass

        def _ensure_resolved(*args,**kw):
            pass

        def _getaddrinfo_debug(*args,**kw):
            pass

        def _log_subprocess(*args,**kw):
            pass

        def _loop_self_reading(*args,**kw):
            pass

        def _make_datagram_transport(*args,**kw):
            pass

        def _make_duplex_pipe_transport(*args,**kw):
            pass

        def _make_read_pipe_transport(*args,**kw):
            pass

        def _make_self_pipe(*args,**kw):
            pass

        def _make_socket_transport(*args,**kw):
            pass

        def _make_ssl_transport(*args,**kw):
            pass

        def _make_subprocess_transport(*args,**kw):
            pass

        def _make_write_pipe_transport(*args,**kw):
            pass

        def _process_events(*args,**kw):
            pass

        def _run_once(*args,**kw):
            """Run one full iteration of the event loop.
                    This calls all currently ready callbacks, polls for I/O,
                    schedules the resulting callbacks, and finally schedules
                    'call_later' callbacks.
                    """
            pass

        def _sendfile_fallback(*args,**kw):
            pass

        def _sendfile_native(*args,**kw):
            pass

        def _set_coroutine_origin_tracking(*args,**kw):
            pass

        def _sock_sendfile_fallback(*args,**kw):
            pass

        def _sock_sendfile_native(*args,**kw):
            pass

        def _start_serving(*args,**kw):
            pass

        def _stop_accept_futures(*args,**kw):
            pass

        def _stop_serving(*args,**kw):
            pass

        def _timer_handle_cancelled(*args,**kw):
            """Notification that a TimerHandle has been cancelled."""
            pass

        def _write_to_self(*args,**kw):
            pass

        def add_reader(*args,**kw):
            pass

        def add_signal_handler(*args,**kw):
            pass

        def add_writer(*args,**kw):
            pass

        def call_at(*args,**kw):
            """Like call_later(), but uses an absolute time.
                    Absolute time corresponds to the event loop's time() method.
                    """
            pass

        def call_exception_handler(*args,**kw):
            """Call the current event loop's exception handler.
                    The context argument is a dict containing the following keys:

                    - 'message': Error message;
                    - 'exception' (optional): Exception object;
                    - 'future' (optional): Future instance;
                    - 'task' (optional): Task instance;
                    - 'handle' (optional): Handle instance;
                    - 'protocol' (optional): Protocol instance;
                    - 'transport' (optional): Transport instance;
                    - 'socket' (optional): Socket instance;
                    - 'asyncgen' (optional): Asynchronous generator that caused
                                             the exception.

                    New keys maybe introduced in the future.

                    Note: do not overload this method in an event loop subclass.
                    For custom exception handling, use the
                    `set_exception_handler()` method.
                    """
            pass

        def call_later(*args,**kw):
            """Arrange for a callback to be called at a given time.
                    Return a Handle: an opaque object with a cancel() method that
                    can be used to cancel the call.

                    The delay can be an int or float, expressed in seconds.  It is
                    always relative to the current time.

                    Each callback will be called exactly once.  If two callbacks
                    are scheduled for exactly the same time, it undefined which
                    will be called first.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon(*args,**kw):
            """Arrange for a callback to be called as soon as possible.
                    This operates as a FIFO queue: callbacks are called in the
                    order in which they are registered.  Each callback will be
                    called exactly once.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon_threadsafe(*args,**kw):
            """Like call_soon(), but thread-safe."""
            pass

        def close(*args,**kw):
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            """Connect to a TCP server.
                    Create a streaming transport connection to a given internet host and
                    port: socket family AF_INET or socket.AF_INET6 depending on host (or
                    family if specified), socket type SOCK_STREAM. protocol_factory must be
                    a callable returning a protocol instance.

                    This method is a coroutine which will try to establish the connection
                    in the background.  When successful, the coroutine returns a
                    (transport, protocol) pair.
                    """
            pass

        def create_datagram_endpoint(*args,**kw):
            """Create datagram connection."""
            pass

        def create_future(*args,**kw):
            """Create a Future object attached to the loop."""
            pass

        def create_pipe_connection(*args,**kw):
            pass

        def create_server(*args,**kw):
            """Create a TCP server.
                    The host parameter can be a string, in that case the TCP server is
                    bound to host and port.

                    The host parameter can also be a sequence of strings and in that case
                    the TCP server is bound to all hosts of the sequence. If a host
                    appears multiple times (possibly indirectly e.g. when hostnames
                    resolve to the same IP address), the server is only bound once to that
                    host.

                    Return a Server object which can be used to stop the service.

                    This method is a coroutine.
                    """
            pass

        def create_task(*args,**kw):
            """Schedule a coroutine object.
                    Return a task object.
                    """
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
            """A coroutine which creates a UNIX Domain Socket server.
                    The return value is a Server object, which can be used to stop
                    the service.

                    path is a str, representing a file system path to bind the
                    server socket to.

                    sock can optionally be specified in order to use a preexisting
                    socket object.

                    backlog is the maximum number of queued connections passed to
                    listen() (defaults to 100).

                    ssl can be set to an SSLContext to enable SSL over the
                    accepted connections.

                    ssl_handshake_timeout is the time in seconds that an SSL server
                    will wait for the SSL handshake to complete (defaults to 60s).

                    ssl_shutdown_timeout is the time in seconds that an SSL server
                    will wait for the SSL shutdown to finish (defaults to 30s).

                    start_serving set to True (default) causes the created server
                    to start accepting connections immediately.  When set to False,
                    the user should await Server.start_serving() or Server.serve_forever()
                    to make the server to start accepting connections.
                    """
            pass

        def default_exception_handler(*args,**kw):
            """Default exception handler.
                    This is called when an exception occurs and no exception
                    handler is set, and can be called by a custom exception
                    handler that wants to defer to the default behavior.

                    This default handler logs the error message and other
                    context-dependent information.  In debug mode, a truncated
                    stack trace is also appended showing where the given object
                    (e.g. a handle or future or task) was created, if any.

                    The context parameter has the same meaning as in
                    `call_exception_handler()`.
                    """
            pass

        def get_debug(*args,**kw):
            pass

        def get_exception_handler(*args,**kw):
            """Return an exception handler, or None if the default one is in use.            """
            pass

        def get_task_factory(*args,**kw):
            """Return a task factory, or None if the default one is in use."""
            pass

        def getaddrinfo(*args,**kw):
            pass

        def getnameinfo(*args,**kw):
            pass

        def is_closed(*args,**kw):
            """Returns True if the event loop was closed."""
            pass

        def is_running(*args,**kw):
            """Returns True if the event loop is running."""
            pass

        def remove_reader(*args,**kw):
            pass

        def remove_signal_handler(*args,**kw):
            pass

        def remove_writer(*args,**kw):
            pass

        def run_forever(*args,**kw):
            pass

        def run_in_executor(*args,**kw):
            pass

        def run_until_complete(*args,**kw):
            """Run until the Future is done.
                    If the argument is a coroutine, it is wrapped in a Task.

                    WARNING: It would be disastrous to call run_until_complete()
                    with the same coroutine twice -- it would wrap it in two
                    different Tasks and that can't be good.

                    Return the Future's result, or raise its exception.
                    """
            pass

        def sendfile(*args,**kw):
            """Send a file to transport.
                    Return the total number of bytes which were sent.

                    The method uses high-performance os.sendfile if available.

                    file must be a regular file object opened in binary mode.

                    offset tells from where to start reading the file. If specified,
                    count is the total number of bytes to transmit as opposed to
                    sending the file until EOF is reached. File position is updated on
                    return or also in case of error in which case file.tell()
                    can be used to figure out the number of bytes
                    which were sent.

                    fallback set to True makes asyncio to manually read and send
                    the file when the platform does not support the sendfile syscall
                    (e.g. Windows or SSL socket on Unix).

                    Raise SendfileNotAvailableError if the system does not support
                    sendfile syscall and fallback is False.
                    """
            pass

        def set_debug(*args,**kw):
            pass

        def set_default_executor(*args,**kw):
            pass

        def set_exception_handler(*args,**kw):
            """Set handler as the new event loop exception handler.
                    If handler is None, the default exception handler will
                    be set.

                    If handler is a callable object, it should have a
                    signature matching '(loop, context)', where 'loop'
                    will be a reference to the active event loop, 'context'
                    will be a dict object (see `call_exception_handler()`
                    documentation for details about context).
                    """
            pass

        def set_task_factory(*args,**kw):
            """Set a task factory that will be used by loop.create_task().
                    If factory is None the default task factory will be set.

                    If factory is a callable, it should have a signature matching
                    '(loop, coro)', where 'loop' will be a reference to the active
                    event loop, 'coro' will be a coroutine object.  The callable
                    must return a Future.
                    """
            pass

        def shutdown_asyncgens(*args,**kw):
            """Shutdown all active asynchronous generators."""
            pass

        def shutdown_default_executor(*args,**kw):
            """Schedule the shutdown of the default executor."""
            pass

        def sock_accept(*args,**kw):
            pass

        def sock_connect(*args,**kw):
            pass

        def sock_recv(*args,**kw):
            pass

        def sock_recv_into(*args,**kw):
            pass

        def sock_recvfrom(*args,**kw):
            pass

        def sock_recvfrom_into(*args,**kw):
            pass

        def sock_sendall(*args,**kw):
            pass

        def sock_sendfile(*args,**kw):
            pass

        def sock_sendto(*args,**kw):
            pass

        def start_serving_pipe(*args,**kw):
            pass

        def start_tls(*args,**kw):
            """Upgrade transport to TLS.
                    Return a new transport that *protocol* should start using
                    immediately.
                    """
            pass

        def stop(*args,**kw):
            """Stop running the event loop.
                    Every callback already scheduled will still run.  This simply informs
                    run_forever to stop looping after a complete iteration.
                    """
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            """Return the time according to the event loop's clock.
                    This is a float expressed in seconds since an epoch, but the
                    epoch, precision, accuracy and drift are unspecified and may
                    differ per event loop.
                    """
            pass
    def get_child_watcher(*args,**kw):
        """Get the watcher for child processes."""
        pass

    def get_event_loop(*args,**kw):
        """Get the event loop for the current context.
                Returns an instance of EventLoop or raises an exception.
                """
        pass

    def new_event_loop(*args,**kw):
        """Create a new event loop.
                You must call set_event_loop() to make this the current event
                loop.
                """
        pass

    def set_child_watcher(*args,**kw):
        """Set the watcher for child processes."""
        pass

    def set_event_loop(*args,**kw):
        """Set the event loop."""
        pass

class WindowsSelectorEventLoopPolicy(BaseDefaultEventLoopPolicy):


    class _Local(_local):

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory(BaseSelectorEventLoop):
        """Windows version of selector event loop."""


        __module__ = """asyncio.windows_events"""

        def _accept_connection(*args,**kw):
            pass

        def _accept_connection2(*args,**kw):
            pass

        def _add_callback(*args,**kw):
            """Add a Handle to _scheduled (TimerHandle) or _ready."""
            pass

        def _add_callback_signalsafe(*args,**kw):
            """Like _add_callback() but called from a signal handler."""
            pass

        def _add_reader(*args,**kw):
            pass

        def _add_writer(*args,**kw):
            pass

        def _asyncgen_finalizer_hook(*args,**kw):
            pass

        def _asyncgen_firstiter_hook(*args,**kw):
            pass

        def _call_soon(*args,**kw):
            pass

        def _check_callback(*args,**kw):
            pass

        def _check_closed(*args,**kw):
            pass

        def _check_default_executor(*args,**kw):
            pass

        def _check_running(*args,**kw):
            pass

        def _check_sendfile_params(*args,**kw):
            pass

        def _check_thread(*args,**kw):
            """Check that the current thread is the thread running the event loop.
                    Non-thread-safe methods of this class make this assumption and will
                    likely behave incorrectly when the assumption is violated.

                    Should only be called when (self._debug == True).  The caller is
                    responsible for checking this condition for performance reasons.
                    """
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
            """Create, bind and connect one socket."""
            pass

        def _create_connection_transport(*args,**kw):
            pass

        def _create_server_getaddrinfo(*args,**kw):
            pass

        def _do_shutdown(*args,**kw):
            pass

        def _ensure_fd_no_transport(*args,**kw):
            pass

        def _ensure_resolved(*args,**kw):
            pass

        def _getaddrinfo_debug(*args,**kw):
            pass

        def _log_subprocess(*args,**kw):
            pass

        def _make_datagram_transport(*args,**kw):
            pass

        def _make_read_pipe_transport(*args,**kw):
            """Create read pipe transport."""
            pass

        def _make_self_pipe(*args,**kw):
            pass

        def _make_socket_transport(*args,**kw):
            pass

        def _make_ssl_transport(*args,**kw):
            pass

        def _make_subprocess_transport(*args,**kw):
            """Create subprocess transport."""
            pass

        def _make_write_pipe_transport(*args,**kw):
            """Create write pipe transport."""
            pass

        def _process_events(*args,**kw):
            pass

        def _process_self_data(*args,**kw):
            pass

        def _read_from_self(*args,**kw):
            pass

        def _remove_reader(*args,**kw):
            pass

        def _remove_writer(*args,**kw):
            """Remove a writer callback."""
            pass

        def _run_once(*args,**kw):
            """Run one full iteration of the event loop.
                    This calls all currently ready callbacks, polls for I/O,
                    schedules the resulting callbacks, and finally schedules
                    'call_later' callbacks.
                    """
            pass

        def _sendfile_fallback(*args,**kw):
            pass

        def _sendfile_native(*args,**kw):
            pass

        def _set_coroutine_origin_tracking(*args,**kw):
            pass

        def _sock_accept(*args,**kw):
            pass

        def _sock_connect(*args,**kw):
            pass

        def _sock_connect_cb(*args,**kw):
            pass

        def _sock_read_done(*args,**kw):
            pass

        def _sock_recv(*args,**kw):
            pass

        def _sock_recv_into(*args,**kw):
            pass

        def _sock_recvfrom(*args,**kw):
            pass

        def _sock_recvfrom_into(*args,**kw):
            pass

        def _sock_sendall(*args,**kw):
            pass

        def _sock_sendfile_fallback(*args,**kw):
            pass

        def _sock_sendfile_native(*args,**kw):
            pass

        def _sock_sendto(*args,**kw):
            pass

        def _sock_write_done(*args,**kw):
            pass

        def _start_serving(*args,**kw):
            pass

        def _stop_serving(*args,**kw):
            pass

        def _timer_handle_cancelled(*args,**kw):
            """Notification that a TimerHandle has been cancelled."""
            pass

        def _write_to_self(*args,**kw):
            pass

        def add_reader(*args,**kw):
            """Add a reader callback."""
            pass

        def add_signal_handler(*args,**kw):
            pass

        def add_writer(*args,**kw):
            """Add a writer callback.."""
            pass

        def call_at(*args,**kw):
            """Like call_later(), but uses an absolute time.
                    Absolute time corresponds to the event loop's time() method.
                    """
            pass

        def call_exception_handler(*args,**kw):
            """Call the current event loop's exception handler.
                    The context argument is a dict containing the following keys:

                    - 'message': Error message;
                    - 'exception' (optional): Exception object;
                    - 'future' (optional): Future instance;
                    - 'task' (optional): Task instance;
                    - 'handle' (optional): Handle instance;
                    - 'protocol' (optional): Protocol instance;
                    - 'transport' (optional): Transport instance;
                    - 'socket' (optional): Socket instance;
                    - 'asyncgen' (optional): Asynchronous generator that caused
                                             the exception.

                    New keys maybe introduced in the future.

                    Note: do not overload this method in an event loop subclass.
                    For custom exception handling, use the
                    `set_exception_handler()` method.
                    """
            pass

        def call_later(*args,**kw):
            """Arrange for a callback to be called at a given time.
                    Return a Handle: an opaque object with a cancel() method that
                    can be used to cancel the call.

                    The delay can be an int or float, expressed in seconds.  It is
                    always relative to the current time.

                    Each callback will be called exactly once.  If two callbacks
                    are scheduled for exactly the same time, it undefined which
                    will be called first.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon(*args,**kw):
            """Arrange for a callback to be called as soon as possible.
                    This operates as a FIFO queue: callbacks are called in the
                    order in which they are registered.  Each callback will be
                    called exactly once.

                    Any positional arguments after the callback will be passed to
                    the callback when it is called.
                    """
            pass

        def call_soon_threadsafe(*args,**kw):
            """Like call_soon(), but thread-safe."""
            pass

        def close(*args,**kw):
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            """Connect to a TCP server.
                    Create a streaming transport connection to a given internet host and
                    port: socket family AF_INET or socket.AF_INET6 depending on host (or
                    family if specified), socket type SOCK_STREAM. protocol_factory must be
                    a callable returning a protocol instance.

                    This method is a coroutine which will try to establish the connection
                    in the background.  When successful, the coroutine returns a
                    (transport, protocol) pair.
                    """
            pass

        def create_datagram_endpoint(*args,**kw):
            """Create datagram connection."""
            pass

        def create_future(*args,**kw):
            """Create a Future object attached to the loop."""
            pass

        def create_server(*args,**kw):
            """Create a TCP server.
                    The host parameter can be a string, in that case the TCP server is
                    bound to host and port.

                    The host parameter can also be a sequence of strings and in that case
                    the TCP server is bound to all hosts of the sequence. If a host
                    appears multiple times (possibly indirectly e.g. when hostnames
                    resolve to the same IP address), the server is only bound once to that
                    host.

                    Return a Server object which can be used to stop the service.

                    This method is a coroutine.
                    """
            pass

        def create_task(*args,**kw):
            """Schedule a coroutine object.
                    Return a task object.
                    """
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
            """A coroutine which creates a UNIX Domain Socket server.
                    The return value is a Server object, which can be used to stop
                    the service.

                    path is a str, representing a file system path to bind the
                    server socket to.

                    sock can optionally be specified in order to use a preexisting
                    socket object.

                    backlog is the maximum number of queued connections passed to
                    listen() (defaults to 100).

                    ssl can be set to an SSLContext to enable SSL over the
                    accepted connections.

                    ssl_handshake_timeout is the time in seconds that an SSL server
                    will wait for the SSL handshake to complete (defaults to 60s).

                    ssl_shutdown_timeout is the time in seconds that an SSL server
                    will wait for the SSL shutdown to finish (defaults to 30s).

                    start_serving set to True (default) causes the created server
                    to start accepting connections immediately.  When set to False,
                    the user should await Server.start_serving() or Server.serve_forever()
                    to make the server to start accepting connections.
                    """
            pass

        def default_exception_handler(*args,**kw):
            """Default exception handler.
                    This is called when an exception occurs and no exception
                    handler is set, and can be called by a custom exception
                    handler that wants to defer to the default behavior.

                    This default handler logs the error message and other
                    context-dependent information.  In debug mode, a truncated
                    stack trace is also appended showing where the given object
                    (e.g. a handle or future or task) was created, if any.

                    The context parameter has the same meaning as in
                    `call_exception_handler()`.
                    """
            pass

        def get_debug(*args,**kw):
            pass

        def get_exception_handler(*args,**kw):
            """Return an exception handler, or None if the default one is in use.            """
            pass

        def get_task_factory(*args,**kw):
            """Return a task factory, or None if the default one is in use."""
            pass

        def getaddrinfo(*args,**kw):
            pass

        def getnameinfo(*args,**kw):
            pass

        def is_closed(*args,**kw):
            """Returns True if the event loop was closed."""
            pass

        def is_running(*args,**kw):
            """Returns True if the event loop is running."""
            pass

        def remove_reader(*args,**kw):
            """Remove a reader callback."""
            pass

        def remove_signal_handler(*args,**kw):
            pass

        def remove_writer(*args,**kw):
            """Remove a writer callback."""
            pass

        def run_forever(*args,**kw):
            """Run until stop() is called."""
            pass

        def run_in_executor(*args,**kw):
            pass

        def run_until_complete(*args,**kw):
            """Run until the Future is done.
                    If the argument is a coroutine, it is wrapped in a Task.

                    WARNING: It would be disastrous to call run_until_complete()
                    with the same coroutine twice -- it would wrap it in two
                    different Tasks and that can't be good.

                    Return the Future's result, or raise its exception.
                    """
            pass

        def sendfile(*args,**kw):
            """Send a file to transport.
                    Return the total number of bytes which were sent.

                    The method uses high-performance os.sendfile if available.

                    file must be a regular file object opened in binary mode.

                    offset tells from where to start reading the file. If specified,
                    count is the total number of bytes to transmit as opposed to
                    sending the file until EOF is reached. File position is updated on
                    return or also in case of error in which case file.tell()
                    can be used to figure out the number of bytes
                    which were sent.

                    fallback set to True makes asyncio to manually read and send
                    the file when the platform does not support the sendfile syscall
                    (e.g. Windows or SSL socket on Unix).

                    Raise SendfileNotAvailableError if the system does not support
                    sendfile syscall and fallback is False.
                    """
            pass

        def set_debug(*args,**kw):
            pass

        def set_default_executor(*args,**kw):
            pass

        def set_exception_handler(*args,**kw):
            """Set handler as the new event loop exception handler.
                    If handler is None, the default exception handler will
                    be set.

                    If handler is a callable object, it should have a
                    signature matching '(loop, context)', where 'loop'
                    will be a reference to the active event loop, 'context'
                    will be a dict object (see `call_exception_handler()`
                    documentation for details about context).
                    """
            pass

        def set_task_factory(*args,**kw):
            """Set a task factory that will be used by loop.create_task().
                    If factory is None the default task factory will be set.

                    If factory is a callable, it should have a signature matching
                    '(loop, coro)', where 'loop' will be a reference to the active
                    event loop, 'coro' will be a coroutine object.  The callable
                    must return a Future.
                    """
            pass

        def shutdown_asyncgens(*args,**kw):
            """Shutdown all active asynchronous generators."""
            pass

        def shutdown_default_executor(*args,**kw):
            """Schedule the shutdown of the default executor."""
            pass

        def sock_accept(*args,**kw):
            """Accept a connection.
                    The socket must be bound to an address and listening for connections.
                    The return value is a pair (conn, address) where conn is a new socket
                    object usable to send and receive data on the connection, and address
                    is the address bound to the socket on the other end of the connection.
                    """
            pass

        def sock_connect(*args,**kw):
            """Connect to a remote socket at address.
                    This method is a coroutine.
                    """
            pass

        def sock_recv(*args,**kw):
            """Receive data from the socket.
                    The return value is a bytes object representing the data received.
                    The maximum amount of data to be received at once is specified by
                    nbytes.
                    """
            pass

        def sock_recv_into(*args,**kw):
            """Receive data from the socket.
                    The received data is written into *buf* (a writable buffer).
                    The return value is the number of bytes written.
                    """
            pass

        def sock_recvfrom(*args,**kw):
            """Receive a datagram from a datagram socket.
                    The return value is a tuple of (bytes, address) representing the
                    datagram received and the address it came from.
                    The maximum amount of data to be received at once is specified by
                    nbytes.
                    """
            pass

        def sock_recvfrom_into(*args,**kw):
            """Receive data from the socket.
                    The received data is written into *buf* (a writable buffer).
                    The return value is a tuple of (number of bytes written, address).
                    """
            pass

        def sock_sendall(*args,**kw):
            """Send data to the socket.
                    The socket must be connected to a remote socket. This method continues
                    to send data from data until either all data has been sent or an
                    error occurs. None is returned on success. On error, an exception is
                    raised, and there is no way to determine how much data, if any, was
                    successfully processed by the receiving end of the connection.
                    """
            pass

        def sock_sendfile(*args,**kw):
            pass

        def sock_sendto(*args,**kw):
            """Send data to the socket.
                    The socket must be connected to a remote socket. This method continues
                    to send data from data until either all data has been sent or an
                    error occurs. None is returned on success. On error, an exception is
                    raised, and there is no way to determine how much data, if any, was
                    successfully processed by the receiving end of the connection.
                    """
            pass

        def start_tls(*args,**kw):
            """Upgrade transport to TLS.
                    Return a new transport that *protocol* should start using
                    immediately.
                    """
            pass

        def stop(*args,**kw):
            """Stop running the event loop.
                    Every callback already scheduled will still run.  This simply informs
                    run_forever to stop looping after a complete iteration.
                    """
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            """Return the time according to the event loop's clock.
                    This is a float expressed in seconds since an epoch, but the
                    epoch, precision, accuracy and drift are unspecified and may
                    differ per event loop.
                    """
            pass
    def get_child_watcher(*args,**kw):
        """Get the watcher for child processes."""
        pass

    def get_event_loop(*args,**kw):
        """Get the event loop for the current context.
                Returns an instance of EventLoop or raises an exception.
                """
        pass

    def new_event_loop(*args,**kw):
        """Create a new event loop.
                You must call set_event_loop() to make this the current event
                loop.
                """
        pass

    def set_child_watcher(*args,**kw):
        """Set the watcher for child processes."""
        pass

    def set_event_loop(*args,**kw):
        """Set the event loop."""
        pass

class WriteTransport(BaseTransport):
    """Interface for write-only transports."""


    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        """Close the transport immediately.
                Buffered data will be lost.  No more data will be received.
                The protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def can_write_eof(*args,**kw):
        """Return True if this transport supports write_eof(), False if not."""
        pass

    def close(*args,**kw):
        """Close the transport.
                Buffered data will be flushed asynchronously.  No more data
                will be received.  After all buffered data is flushed, the
                protocol's connection_lost() method will (eventually) be
                called with None as its argument.
                """
        pass

    def get_extra_info(*args,**kw):
        """Get optional transport information."""
        pass

    def get_protocol(*args,**kw):
        """Return the current protocol."""
        pass

    def get_write_buffer_limits(*args,**kw):
        """Get the high and low watermarks for write flow control.            Return a tuple (low, high) where low and high are
                positive number of bytes."""
        pass

    def get_write_buffer_size(*args,**kw):
        """Return the current size of the write buffer."""
        pass

    def is_closing(*args,**kw):
        """Return True if the transport is closing or closed."""
        pass

    def set_protocol(*args,**kw):
        """Set a new protocol."""
        pass

    def set_write_buffer_limits(*args,**kw):
        """Set the high- and low-water limits for write flow control.
                These two values control when to call the protocol's
                pause_writing() and resume_writing() methods.  If specified,
                the low-water limit must be less than or equal to the
                high-water limit.  Neither value can be negative.

                The defaults are implementation-specific.  If only the
                high-water limit is given, the low-water limit defaults to an
                implementation-specific value less than or equal to the
                high-water limit.  Setting high to zero forces low to zero as
                well, and causes pause_writing() to be called whenever the
                buffer becomes non-empty.  Setting low to zero causes
                resume_writing() to be called only once the buffer is empty.
                Use of zero for either limit is generally sub-optimal as it
                reduces opportunities for doing I/O and computation
                concurrently.
                """
        pass

    def write(*args,**kw):
        """Write some data bytes to the transport.
                This does not block; it buffers the data and arranges for it
                to be sent out asynchronously.
                """
        pass

    def write_eof(*args,**kw):
        """Close the write end after flushing buffered data.
                (This is like typing ^D into a UNIX program reading from stdin.)

                Data may still be received.
                """
        pass

    def writelines(*args,**kw):
        """Write a list (or any iterable) of data bytes to the transport.
                The default implementation concatenates the arguments and
                calls write() on the result.
                """
        pass
def _enter_task(*args,**kw):
    """Enter into task execution or resume suspended task.
    Task belongs to loop.

    Returns None."""
    pass

def _get_running_loop(*args,**kw):
    """Return the running event loop or None.
    This is a low-level function intended to be used by event loops.
    This function is thread-specific."""
    pass

def _leave_task(*args,**kw):
    """Leave task execution or suspend a task.
    Task belongs to loop.

    Returns None."""
    pass

def _register_task(*args,**kw):
    """Register a new task in asyncio as executed by loop.
    Returns None."""
    pass

def _set_running_loop(*args,**kw):
    """Set the running event loop.
    This is a low-level function intended to be used by event loops.
    This function is thread-specific."""
    pass

def _unregister_task(*args,**kw):
    """Unregister a task.
    Returns None."""
    pass

def all_tasks(*args,**kw):
    """Return a set of all tasks for the loop."""
    pass

def as_completed(*args,**kw):
    """Return an iterator whose values are coroutines.
        When waiting for the yielded coroutines you'll get the results (or
        exceptions!) of the original Futures (or coroutines), in the order
        in which and as soon as they complete.

        This differs from PEP 3148; the proper way to use this is:

            for f in as_completed(fs):
                result = await f  # The 'await' may raise.
                # Use result.

        If a timeout is specified, the 'await' will raise
        TimeoutError when the timeout occurs before all Futures are done.

        Note: The futures 'f' are not necessarily members of fs.
        """
    pass

base_events = "<module 'asyncio.base_events' from 'C:\\Python311\\Lib\\asyncio\\base_events.py'>"

base_futures = "<module 'asyncio.base_futures' from 'C:\\Python311\\Lib\\asyncio\\base_futures.py'>"

base_subprocess = "<module 'asyncio.base_subprocess' from 'C:\\Python311\\Lib\\asyncio\\base_subprocess.py'>"

base_tasks = "<module 'asyncio.base_tasks' from 'C:\\Python311\\Lib\\asyncio\\base_tasks.py'>"

constants = "<module 'asyncio.constants' from 'C:\\Python311\\Lib\\asyncio\\constants.py'>"

coroutines = "<module 'asyncio.coroutines' from 'C:\\Python311\\Lib\\asyncio\\coroutines.py'>"

def create_subprocess_exec(*args,**kw):
    pass

def create_subprocess_shell(*args,**kw):
    pass

def create_task(*args,**kw):
    """Schedule the execution of a coroutine object in a spawn task.
        Return a Task object.
        """
    pass

def current_task(*args,**kw):
    """Return a currently executed task."""
    pass

def ensure_future(*args,**kw):
    """Wrap a coroutine or an awaitable in a future.
        If the argument is a Future, it is returned directly.
        """
    pass

events = "<module 'asyncio.events' from 'C:\\Python311\\Lib\\asyncio\\events.py'>"

exceptions = "<module 'asyncio.exceptions' from 'C:\\Python311\\Lib\\asyncio\\exceptions.py'>"

format_helpers = "<module 'asyncio.format_helpers' from 'C:\\Python311\\Lib\\asyncio\\format_helpers.py'>"

futures = "<module 'asyncio.futures' from 'C:\\Python311\\Lib\\asyncio\\futures.py'>"

def gather(*args,**kw):
    """Return a future aggregating results from the given coroutines/futures.
        Coroutines will be wrapped in a future and scheduled in the event
        loop. They will not necessarily be scheduled in the same order as
        passed in.

        All futures must share the same event loop.  If all the tasks are
        done successfully, the returned future's result is the list of
        results (in the order of the original sequence, not necessarily
        the order of results arrival).  If *return_exceptions* is True,
        exceptions in the tasks are treated the same as successful
        results, and gathered in the result list; otherwise, the first
        raised exception will be immediately propagated to the returned
        future.

        Cancellation: if the outer Future is cancelled, all children (that
        have not completed yet) are also cancelled.  If any child is
        cancelled, this is treated as if it raised CancelledError --
        the outer Future is *not* cancelled in this case.  (This is to
        prevent the cancellation of one child to cause other children to
        be cancelled.)

        If *return_exceptions* is False, cancelling gather() after it
        has been marked done won't cancel any submitted awaitables.
        For instance, gather can be marked done after propagating an
        exception to the caller, therefore, calling ``gather.cancel()``
        after catching an exception (raised by one of the awaitables) from
        gather won't cancel any other awaitables.
        """
    pass

def get_child_watcher(*args,**kw):
    """Equivalent to calling get_event_loop_policy().get_child_watcher()."""
    pass

def get_event_loop(*args,**kw):
    """Return an asyncio event loop.
    When called from a coroutine or a callback (e.g. scheduled with
    call_soon or similar API), this function will always return the
    running event loop.

    If there is no running event loop set, the function will return
    the result of `get_event_loop_policy().get_event_loop()` call."""
    pass

def get_event_loop_policy(*args,**kw):
    """Get the current event loop policy."""
    pass

def get_running_loop(*args,**kw):
    """Return the running event loop.  Raise a RuntimeError if there is none.
    This function is thread-specific."""
    pass

def iscoroutine(*args,**kw):
    """Return True if obj is a coroutine object."""
    pass

def iscoroutinefunction(*args,**kw):
    """Return True if func is a decorated coroutine function."""
    pass

def isfuture(*args,**kw):
    """Check for a Future.
        This returns True when obj is a Future instance or is advertising
        itself as duck-type compatible by setting _asyncio_future_blocking.
        See comment in Future for more details.
        """
    pass

locks = "<module 'asyncio.locks' from 'C:\\Python311\\Lib\\asyncio\\locks.py'>"

log = "<module 'asyncio.log' from 'C:\\Python311\\Lib\\asyncio\\log.py'>"

mixins = "<module 'asyncio.mixins' from 'C:\\Python311\\Lib\\asyncio\\mixins.py'>"

def new_event_loop(*args,**kw):
    """Equivalent to calling get_event_loop_policy().new_event_loop()."""
    pass

def open_connection(*args,**kw):
    """A wrapper for create_connection() returning a (reader, writer) pair.
        The reader returned is a StreamReader instance; the writer is a
        StreamWriter instance.

        The arguments are all the usual arguments to create_connection()
        except protocol_factory; most common are positional host and port,
        with various optional keyword arguments following.

        Additional optional keyword arguments are loop (to set the event loop
        instance to use) and limit (to set the buffer limit passed to the
        StreamReader).

        (If you want to customize the StreamReader and/or
        StreamReaderProtocol classes, just copy the code -- there's
        really nothing special here except some convenience.)
        """
    pass

proactor_events = "<module 'asyncio.proactor_events' from 'C:\\Python311\\Lib\\asyncio\\proactor_events.py'>"

protocols = "<module 'asyncio.protocols' from 'C:\\Python311\\Lib\\asyncio\\protocols.py'>"

queues = "<module 'asyncio.queues' from 'C:\\Python311\\Lib\\asyncio\\queues.py'>"

def run(*args,**kw):
    """Execute the coroutine and return the result.
        This function runs the passed coroutine, taking care of
        managing the asyncio event loop and finalizing asynchronous
        generators.

        This function cannot be called when another asyncio event loop is
        running in the same thread.

        If debug is True, the event loop will be run in debug mode.

        This function always creates a new event loop and closes it at the end.
        It should be used as a main entry point for asyncio programs, and should
        ideally only be called once.

        Example:

            async def main():
                await asyncio.sleep(1)
                print('hello')

            asyncio.run(main())
        """
    pass

def run_coroutine_threadsafe(*args,**kw):
    """Submit a coroutine object to a given event loop.
        Return a concurrent.futures.Future to access the result.
        """
    pass

runners = "<module 'asyncio.runners' from 'C:\\Python311\\Lib\\asyncio\\runners.py'>"

selector_events = "<module 'asyncio.selector_events' from 'C:\\Python311\\Lib\\asyncio\\selector_events.py'>"

def set_child_watcher(*args,**kw):
    """Equivalent to calling        get_event_loop_policy().set_child_watcher(watcher)."""
    pass

def set_event_loop(*args,**kw):
    """Equivalent to calling get_event_loop_policy().set_event_loop(loop)."""
    pass

def set_event_loop_policy(*args,**kw):
    """Set the current event loop policy.
        If policy is None, the default policy is restored."""
    pass

def shield(*args,**kw):
    """Wait for a future, shielding it from cancellation.
        The statement

            res = await shield(something())

        is exactly equivalent to the statement

            res = await something()

        *except* that if the coroutine containing it is cancelled, the
        task running in something() is not cancelled.  From the POV of
        something(), the cancellation did not happen.  But its caller is
        still cancelled, so the yield-from expression still raises
        CancelledError.  Note: If something() is cancelled by other means
        this will still cancel shield().

        If you want to completely ignore cancellation (not recommended)
        you can combine shield() with a try/except clause, as follows:

            try:
                res = await shield(something())
            except CancelledError:
                res = None
        """
    pass

def sleep(*args,**kw):
    """Coroutine that completes after a given time (in seconds)."""
    pass

sslproto = "<module 'asyncio.sslproto' from 'C:\\Python311\\Lib\\asyncio\\sslproto.py'>"

staggered = "<module 'asyncio.staggered' from 'C:\\Python311\\Lib\\asyncio\\staggered.py'>"

def start_server(*args,**kw):
    """Start a socket server, call back for each client connected.
        The first parameter, `client_connected_cb`, takes two parameters:
        client_reader, client_writer.  client_reader is a StreamReader
        object, while client_writer is a StreamWriter object.  This
        parameter can either be a plain callback function or a coroutine;
        if it is a coroutine, it will be automatically converted into a
        Task.

        The rest of the arguments are all the usual arguments to
        loop.create_server() except protocol_factory; most common are
        positional host and port, with various optional keyword arguments
        following.  The return value is the same as loop.create_server().

        Additional optional keyword arguments are loop (to set the event loop
        instance to use) and limit (to set the buffer limit passed to the
        StreamReader).

        The return value is the same as loop.create_server(), i.e. a
        Server object which can be used to stop the service.
        """
    pass

streams = "<module 'asyncio.streams' from 'C:\\Python311\\Lib\\asyncio\\streams.py'>"

subprocess = "<module 'asyncio.subprocess' from 'C:\\Python311\\Lib\\asyncio\\subprocess.py'>"

sys = "<module 'sys' (built-in)>"

taskgroups = "<module 'asyncio.taskgroups' from 'C:\\Python311\\Lib\\asyncio\\taskgroups.py'>"

tasks = "<module 'asyncio.tasks' from 'C:\\Python311\\Lib\\asyncio\\tasks.py'>"

threads = "<module 'asyncio.threads' from 'C:\\Python311\\Lib\\asyncio\\threads.py'>"

def timeout(*args,**kw):
    """Timeout async context manager.
        Useful in cases when you want to apply timeout logic around block
        of code or in cases when asyncio.wait_for is not suitable. For example:

        >>> async with asyncio.timeout(10):  # 10 seconds timeout
        ...     await long_running_task()


        delay - value in seconds or None to disable timeout logic

        long_running_task() is interrupted by raising asyncio.CancelledError,
        the top-most affected timeout() context manager converts CancelledError
        into TimeoutError.
        """
    pass

def timeout_at(*args,**kw):
    """Schedule the timeout at absolute time.
        Like timeout() but argument gives absolute time in the same clock system
        as loop.time().

        Please note: it is not POSIX time but a time with
        undefined starting base, e.g. the time of the system power on.

        >>> async with asyncio.timeout_at(loop.time() + 10):
        ...     await long_running_task()


        when - a deadline when timeout occurs or None to disable timeout logic

        long_running_task() is interrupted by raising asyncio.CancelledError,
        the top-most affected timeout() context manager converts CancelledError
        into TimeoutError.
        """
    pass

timeouts = "<module 'asyncio.timeouts' from 'C:\\Python311\\Lib\\asyncio\\timeouts.py'>"

def to_thread(*args,**kw):
    """Asynchronously run function *func* in a separate thread.
        Any *args and **kwargs supplied for this function are directly passed
        to *func*. Also, the current :class:`contextvars.Context` is propagated,
        allowing context variables from the main thread to be accessed in the
        separate thread.

        Return a coroutine that can be awaited to get the eventual result of *func*.
        """
    pass

transports = "<module 'asyncio.transports' from 'C:\\Python311\\Lib\\asyncio\\transports.py'>"

trsock = "<module 'asyncio.trsock' from 'C:\\Python311\\Lib\\asyncio\\trsock.py'>"

def wait(*args,**kw):
    """Wait for the Futures or Tasks given by fs to complete.
        The fs iterable must not be empty.

        Coroutines will be wrapped in Tasks.

        Returns two sets of Future: (done, pending).

        Usage:

            done, pending = await asyncio.wait(fs)

        Note: This does not raise TimeoutError! Futures that aren't done
        when the timeout occurs are returned in the second set.
        """
    pass

def wait_for(*args,**kw):
    """Wait for the single Future or coroutine to complete, with timeout.
        Coroutine will be wrapped in Task.

        Returns result of the Future or coroutine.  When a timeout occurs,
        it cancels the task and raises TimeoutError.  To avoid the task
        cancellation, wrap it in shield().

        If the wait is cancelled, the task is also cancelled.

        This function is a coroutine.
        """
    pass

windows_events = "<module 'asyncio.windows_events' from 'C:\\Python311\\Lib\\asyncio\\windows_events.py'>"

windows_utils = "<module 'asyncio.windows_utils' from 'C:\\Python311\\Lib\\asyncio\\windows_utils.py'>"

def wrap_future(*args,**kw):
    """Wrap concurrent.futures.Future object."""
    pass
