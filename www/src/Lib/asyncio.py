print('Brython implementation of asyncio is present to avoid ImportError ' +
      'in some modules, but does not implement the asyncio features ' +
      'because of browser limitations.\nFor asynchronous programming, use ' +
      'browser.aio instead')
      
ALL_COMPLETED = """ALL_COMPLETED"""


class AbstractEventLoop:

    __module__ = """asyncio.events"""

    def _timer_handle_cancelled(*args,**kw):
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
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        pass

    def create_datagram_endpoint(*args,**kw):
        pass

    def create_future(*args,**kw):
        pass

    def create_server(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
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
        pass

    def is_running(*args,**kw):
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
        pass

    def sendfile(*args,**kw):
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
        pass

    def shutdown_default_executor(*args,**kw):
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
        pass

    def stop(*args,**kw):
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        pass

class AbstractEventLoopPolicy:

    __module__ = """asyncio.events"""

    def get_child_watcher(*args,**kw):
        pass

    def get_event_loop(*args,**kw):
        pass

    def new_event_loop(*args,**kw):
        pass

    def set_child_watcher(*args,**kw):
        pass

    def set_event_loop(*args,**kw):
        pass

class AbstractServer:

    __module__ = """asyncio.events"""

    def close(*args,**kw):
        pass

    def get_loop(*args,**kw):
        pass

    def is_serving(*args,**kw):
        pass

    def serve_forever(*args,**kw):
        pass

    def start_serving(*args,**kw):
        pass

    def wait_closed(*args,**kw):
        pass

class Barrier:

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
        pass

    broken = "<property object at 0x0000026EC7736C50>"

    n_waiting = "<property object at 0x0000026EC7736C00>"

    parties = "<property object at 0x0000026EC7736BB0>"

    def reset(*args,**kw):
        pass

    def wait(*args,**kw):
        pass

class BaseEventLoop:

    __module__ = """asyncio.base_events"""

    def _add_callback(*args,**kw):
        pass

    def _add_callback_signalsafe(*args,**kw):
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
        pass

    def _connect_sock(*args,**kw):
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
        pass

    def _make_read_pipe_transport(*args,**kw):
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
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        pass

    def create_datagram_endpoint(*args,**kw):
        pass

    def create_future(*args,**kw):
        pass

    def create_server(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
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
        pass

    def is_running(*args,**kw):
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
        pass

    def sendfile(*args,**kw):
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
        pass

    def shutdown_default_executor(*args,**kw):
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
        pass

    def stop(*args,**kw):
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        pass

class BaseProtocol:

    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        pass

    def connection_made(*args,**kw):
        pass

    def pause_writing(*args,**kw):
        pass

    def resume_writing(*args,**kw):
        pass

class BaseTransport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

class BoundedSemaphore:

    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_next(*args,**kw):
        pass

    def acquire(*args,**kw):
        pass

    def locked(*args,**kw):
        pass

    def release(*args,**kw):
        pass

class BrokenBarrierError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class BufferedProtocol:

    __module__ = """asyncio.protocols"""

    def buffer_updated(*args,**kw):
        pass

    def connection_lost(*args,**kw):
        pass

    def connection_made(*args,**kw):
        pass

    def eof_received(*args,**kw):
        pass

    def get_buffer(*args,**kw):
        pass

    def pause_writing(*args,**kw):
        pass

    def resume_writing(*args,**kw):
        pass

class CancelledError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Condition:

    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def notify(*args,**kw):
        pass

    def notify_all(*args,**kw):
        pass

    def wait(*args,**kw):
        pass

    def wait_for(*args,**kw):
        pass

class DatagramProtocol:

    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        pass

    def connection_made(*args,**kw):
        pass

    def datagram_received(*args,**kw):
        pass

    def error_received(*args,**kw):
        pass

    def pause_writing(*args,**kw):
        pass

    def resume_writing(*args,**kw):
        pass

class DatagramTransport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def sendto(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

class DefaultEventLoopPolicy:


    class _Local:

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory:

        __module__ = """asyncio.windows_events"""

        def _add_callback(*args,**kw):
            pass

        def _add_callback_signalsafe(*args,**kw):
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
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
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
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            pass

        def create_datagram_endpoint(*args,**kw):
            pass

        def create_future(*args,**kw):
            pass

        def create_pipe_connection(*args,**kw):
            pass

        def create_server(*args,**kw):
            pass

        def create_task(*args,**kw):
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
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
            pass

        def is_running(*args,**kw):
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
            pass

        def sendfile(*args,**kw):
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
            pass

        def shutdown_default_executor(*args,**kw):
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
            pass

        def stop(*args,**kw):
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            pass
    def get_child_watcher(*args,**kw):
        pass

    def get_event_loop(*args,**kw):
        pass

    def new_event_loop(*args,**kw):
        pass

    def set_child_watcher(*args,**kw):
        pass

    def set_event_loop(*args,**kw):
        pass

class Event:

    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def clear(*args,**kw):
        pass

    def is_set(*args,**kw):
        pass

    def set(*args,**kw):
        pass

    def wait(*args,**kw):
        pass
FIRST_COMPLETED = """FIRST_COMPLETED"""

FIRST_EXCEPTION = """FIRST_EXCEPTION"""


class Future:

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

class Handle:

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

class IncompleteReadError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class InvalidStateError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class IocpProactor:

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
        pass

class LifoQueue:

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
        pass

    def full(*args,**kw):
        pass

    def get(*args,**kw):
        pass

    def get_nowait(*args,**kw):
        pass

    def join(*args,**kw):
        pass

    maxsize = "<property object at 0x0000026EC7758360>"

    def put(*args,**kw):
        pass

    def put_nowait(*args,**kw):
        pass

    def qsize(*args,**kw):
        pass

    def task_done(*args,**kw):
        pass

class LimitOverrunError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Lock:

    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_first(*args,**kw):
        pass

    def acquire(*args,**kw):
        pass

    def locked(*args,**kw):
        pass

    def release(*args,**kw):
        pass

class PriorityQueue:

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
        pass

    def full(*args,**kw):
        pass

    def get(*args,**kw):
        pass

    def get_nowait(*args,**kw):
        pass

    def join(*args,**kw):
        pass

    maxsize = "<property object at 0x0000026EC7758360>"

    def put(*args,**kw):
        pass

    def put_nowait(*args,**kw):
        pass

    def qsize(*args,**kw):
        pass

    def task_done(*args,**kw):
        pass

class ProactorEventLoop:

    __module__ = """asyncio.windows_events"""

    def _add_callback(*args,**kw):
        pass

    def _add_callback_signalsafe(*args,**kw):
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
        pass

    def _close_self_pipe(*args,**kw):
        pass

    def _connect_sock(*args,**kw):
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
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        pass

    def create_datagram_endpoint(*args,**kw):
        pass

    def create_future(*args,**kw):
        pass

    def create_pipe_connection(*args,**kw):
        pass

    def create_server(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
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
        pass

    def is_running(*args,**kw):
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
        pass

    def sendfile(*args,**kw):
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
        pass

    def shutdown_default_executor(*args,**kw):
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
        pass

    def stop(*args,**kw):
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        pass

class Protocol:

    __module__ = """asyncio.protocols"""

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

class Queue:

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
        pass

    def full(*args,**kw):
        pass

    def get(*args,**kw):
        pass

    def get_nowait(*args,**kw):
        pass

    def join(*args,**kw):
        pass

    maxsize = "<property object at 0x0000026EC7758360>"

    def put(*args,**kw):
        pass

    def put_nowait(*args,**kw):
        pass

    def qsize(*args,**kw):
        pass

    def task_done(*args,**kw):
        pass

class QueueEmpty:

    __module__ = """asyncio.queues"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class QueueFull:

    __module__ = """asyncio.queues"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class ReadTransport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def is_reading(*args,**kw):
        pass

    def pause_reading(*args,**kw):
        pass

    def resume_reading(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

class Runner:

    __module__ = """asyncio.runners"""

    def _lazy_init(*args,**kw):
        pass

    def _on_sigint(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def get_loop(*args,**kw):
        pass

    def run(*args,**kw):
        pass

class SelectorEventLoop:

    __module__ = """asyncio.windows_events"""

    def _accept_connection(*args,**kw):
        pass

    def _accept_connection2(*args,**kw):
        pass

    def _add_callback(*args,**kw):
        pass

    def _add_callback_signalsafe(*args,**kw):
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
        pass

    def _close_self_pipe(*args,**kw):
        pass

    def _connect_sock(*args,**kw):
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

    def _process_self_data(*args,**kw):
        pass

    def _read_from_self(*args,**kw):
        pass

    def _remove_reader(*args,**kw):
        pass

    def _remove_writer(*args,**kw):
        pass

    def _run_once(*args,**kw):
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
        pass

    def connect_accepted_socket(*args,**kw):
        pass

    def connect_read_pipe(*args,**kw):
        pass

    def connect_write_pipe(*args,**kw):
        pass

    def create_connection(*args,**kw):
        pass

    def create_datagram_endpoint(*args,**kw):
        pass

    def create_future(*args,**kw):
        pass

    def create_server(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

    def create_unix_connection(*args,**kw):
        pass

    def create_unix_server(*args,**kw):
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
        pass

    def is_running(*args,**kw):
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
        pass

    def sendfile(*args,**kw):
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
        pass

    def shutdown_default_executor(*args,**kw):
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
        pass

    def stop(*args,**kw):
        pass

    def subprocess_exec(*args,**kw):
        pass

    def subprocess_shell(*args,**kw):
        pass

    def time(*args,**kw):
        pass

class Semaphore:

    __module__ = """asyncio.locks"""

    def _get_loop(*args,**kw):
        pass

    _loop = None

    def _wake_up_next(*args,**kw):
        pass

    def acquire(*args,**kw):
        pass

    def locked(*args,**kw):
        pass

    def release(*args,**kw):
        pass

class SendfileNotAvailableError:

    __module__ = """asyncio.exceptions"""

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class Server:

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

    sockets = "<property object at 0x0000026EC76B2FC0>"

    def start_serving(*args,**kw):
        pass

    def wait_closed(*args,**kw):
        pass

class StreamReader:

    __module__ = """asyncio.streams"""

    def _maybe_resume_transport(*args,**kw):
        pass

    _source_traceback = None

    def _wait_for_data(*args,**kw):
        pass

    def _wakeup_waiter(*args,**kw):
        pass

    def at_eof(*args,**kw):
        pass

    def exception(*args,**kw):
        pass

    def feed_data(*args,**kw):
        pass

    def feed_eof(*args,**kw):
        pass

    def read(*args,**kw):
        pass

    def readexactly(*args,**kw):
        pass

    def readline(*args,**kw):
        pass

    def readuntil(*args,**kw):
        pass

    def set_exception(*args,**kw):
        pass

    def set_transport(*args,**kw):
        pass

class StreamReaderProtocol:

    __module__ = """asyncio.streams"""

    def _drain_helper(*args,**kw):
        pass

    def _get_close_waiter(*args,**kw):
        pass

    def _replace_writer(*args,**kw):
        pass

    _source_traceback = None

    _stream_reader = "<property object at 0x0000026EC7759F30>"

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

class StreamWriter:

    __module__ = """asyncio.streams"""

    def can_write_eof(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def drain(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def start_tls(*args,**kw):
        pass

    transport = "<property object at 0x0000026EC775A020>"

    def wait_closed(*args,**kw):
        pass

    def write(*args,**kw):
        pass

    def write_eof(*args,**kw):
        pass

    def writelines(*args,**kw):
        pass

class SubprocessProtocol:

    __module__ = """asyncio.protocols"""

    def connection_lost(*args,**kw):
        pass

    def connection_made(*args,**kw):
        pass

    def pause_writing(*args,**kw):
        pass

    def pipe_connection_lost(*args,**kw):
        pass

    def pipe_data_received(*args,**kw):
        pass

    def process_exited(*args,**kw):
        pass

    def resume_writing(*args,**kw):
        pass

class SubprocessTransport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_pid(*args,**kw):
        pass

    def get_pipe_transport(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def get_returncode(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def kill(*args,**kw):
        pass

    def send_signal(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

    def terminate(*args,**kw):
        pass

class Task:

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

class TaskGroup:

    __module__ = """asyncio.taskgroups"""

    def _abort(*args,**kw):
        pass

    def _is_base_error(*args,**kw):
        pass

    def _on_task_done(*args,**kw):
        pass

    def create_task(*args,**kw):
        pass

class Timeout:

    __module__ = """asyncio.timeouts"""

    def _on_timeout(*args,**kw):
        pass

    def expired(*args,**kw):
        pass

    def reschedule(*args,**kw):
        pass

    def when(*args,**kw):
        pass

class TimeoutError:

    add_note = "<method 'add_note' of 'BaseException' objects>"

    args = "<attribute 'args' of 'BaseException' objects>"

    characters_written = "<attribute 'characters_written' of 'OSError' objects>"

    errno = "<member 'errno' of 'OSError' objects>"

    filename = "<member 'filename' of 'OSError' objects>"

    filename2 = "<member 'filename2' of 'OSError' objects>"

    strerror = "<member 'strerror' of 'OSError' objects>"

    winerror = "<member 'winerror' of 'OSError' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class TimerHandle:

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
        pass

class Transport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        pass

    def can_write_eof(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def get_write_buffer_limits(*args,**kw):
        pass

    def get_write_buffer_size(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def is_reading(*args,**kw):
        pass

    def pause_reading(*args,**kw):
        pass

    def resume_reading(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

    def set_write_buffer_limits(*args,**kw):
        pass

    def write(*args,**kw):
        pass

    def write_eof(*args,**kw):
        pass

    def writelines(*args,**kw):
        pass

class WindowsProactorEventLoopPolicy:


    class _Local:

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory:

        __module__ = """asyncio.windows_events"""

        def _add_callback(*args,**kw):
            pass

        def _add_callback_signalsafe(*args,**kw):
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
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
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
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            pass

        def create_datagram_endpoint(*args,**kw):
            pass

        def create_future(*args,**kw):
            pass

        def create_pipe_connection(*args,**kw):
            pass

        def create_server(*args,**kw):
            pass

        def create_task(*args,**kw):
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
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
            pass

        def is_running(*args,**kw):
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
            pass

        def sendfile(*args,**kw):
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
            pass

        def shutdown_default_executor(*args,**kw):
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
            pass

        def stop(*args,**kw):
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            pass
    def get_child_watcher(*args,**kw):
        pass

    def get_event_loop(*args,**kw):
        pass

    def new_event_loop(*args,**kw):
        pass

    def set_child_watcher(*args,**kw):
        pass

    def set_event_loop(*args,**kw):
        pass

class WindowsSelectorEventLoopPolicy:


    class _Local:

        __module__ = """asyncio.events"""

        _loop = None

        _set_called = False
    __module__ = """asyncio.windows_events"""


    class _loop_factory:

        __module__ = """asyncio.windows_events"""

        def _accept_connection(*args,**kw):
            pass

        def _accept_connection2(*args,**kw):
            pass

        def _add_callback(*args,**kw):
            pass

        def _add_callback_signalsafe(*args,**kw):
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
            pass

        def _close_self_pipe(*args,**kw):
            pass

        def _connect_sock(*args,**kw):
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

        def _process_self_data(*args,**kw):
            pass

        def _read_from_self(*args,**kw):
            pass

        def _remove_reader(*args,**kw):
            pass

        def _remove_writer(*args,**kw):
            pass

        def _run_once(*args,**kw):
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
            pass

        def connect_accepted_socket(*args,**kw):
            pass

        def connect_read_pipe(*args,**kw):
            pass

        def connect_write_pipe(*args,**kw):
            pass

        def create_connection(*args,**kw):
            pass

        def create_datagram_endpoint(*args,**kw):
            pass

        def create_future(*args,**kw):
            pass

        def create_server(*args,**kw):
            pass

        def create_task(*args,**kw):
            pass

        def create_unix_connection(*args,**kw):
            pass

        def create_unix_server(*args,**kw):
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
            pass

        def is_running(*args,**kw):
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
            pass

        def sendfile(*args,**kw):
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
            pass

        def shutdown_default_executor(*args,**kw):
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
            pass

        def stop(*args,**kw):
            pass

        def subprocess_exec(*args,**kw):
            pass

        def subprocess_shell(*args,**kw):
            pass

        def time(*args,**kw):
            pass
    def get_child_watcher(*args,**kw):
        pass

    def get_event_loop(*args,**kw):
        pass

    def new_event_loop(*args,**kw):
        pass

    def set_child_watcher(*args,**kw):
        pass

    def set_event_loop(*args,**kw):
        pass

class WriteTransport:

    __module__ = """asyncio.transports"""

    _extra = "<member '_extra' of 'BaseTransport' objects>"

    def abort(*args,**kw):
        pass

    def can_write_eof(*args,**kw):
        pass

    def close(*args,**kw):
        pass

    def get_extra_info(*args,**kw):
        pass

    def get_protocol(*args,**kw):
        pass

    def get_write_buffer_limits(*args,**kw):
        pass

    def get_write_buffer_size(*args,**kw):
        pass

    def is_closing(*args,**kw):
        pass

    def set_protocol(*args,**kw):
        pass

    def set_write_buffer_limits(*args,**kw):
        pass

    def write(*args,**kw):
        pass

    def write_eof(*args,**kw):
        pass

    def writelines(*args,**kw):
        pass
def _enter_task(*args,**kw):
    pass

def _get_running_loop(*args,**kw):
    pass

def _leave_task(*args,**kw):
    pass

def _register_task(*args,**kw):
    pass

def _set_running_loop(*args,**kw):
    pass

def _unregister_task(*args,**kw):
    pass

def all_tasks(*args,**kw):
    pass

def as_completed(*args,**kw):
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
    pass

def current_task(*args,**kw):
    pass

def ensure_future(*args,**kw):
    pass

events = "<module 'asyncio.events' from 'C:\\Python311\\Lib\\asyncio\\events.py'>"

exceptions = "<module 'asyncio.exceptions' from 'C:\\Python311\\Lib\\asyncio\\exceptions.py'>"

format_helpers = "<module 'asyncio.format_helpers' from 'C:\\Python311\\Lib\\asyncio\\format_helpers.py'>"

futures = "<module 'asyncio.futures' from 'C:\\Python311\\Lib\\asyncio\\futures.py'>"

def gather(*args,**kw):
    pass

def get_child_watcher(*args,**kw):
    pass

def get_event_loop(*args,**kw):
    pass

def get_event_loop_policy(*args,**kw):
    pass

def get_running_loop(*args,**kw):
    pass

def iscoroutine(*args,**kw):
    pass

def iscoroutinefunction(*args,**kw):
    pass

def isfuture(*args,**kw):
    pass

locks = "<module 'asyncio.locks' from 'C:\\Python311\\Lib\\asyncio\\locks.py'>"

log = "<module 'asyncio.log' from 'C:\\Python311\\Lib\\asyncio\\log.py'>"

mixins = "<module 'asyncio.mixins' from 'C:\\Python311\\Lib\\asyncio\\mixins.py'>"

def new_event_loop(*args,**kw):
    pass

def open_connection(*args,**kw):
    pass

proactor_events = "<module 'asyncio.proactor_events' from 'C:\\Python311\\Lib\\asyncio\\proactor_events.py'>"

protocols = "<module 'asyncio.protocols' from 'C:\\Python311\\Lib\\asyncio\\protocols.py'>"

queues = "<module 'asyncio.queues' from 'C:\\Python311\\Lib\\asyncio\\queues.py'>"

def run(*args,**kw):
    pass

def run_coroutine_threadsafe(*args,**kw):
    pass

runners = "<module 'asyncio.runners' from 'C:\\Python311\\Lib\\asyncio\\runners.py'>"

selector_events = "<module 'asyncio.selector_events' from 'C:\\Python311\\Lib\\asyncio\\selector_events.py'>"

def set_child_watcher(*args,**kw):
    pass

def set_event_loop(*args,**kw):
    pass

def set_event_loop_policy(*args,**kw):
    pass

def shield(*args,**kw):
    pass

def sleep(*args,**kw):
    pass

sslproto = "<module 'asyncio.sslproto' from 'C:\\Python311\\Lib\\asyncio\\sslproto.py'>"

staggered = "<module 'asyncio.staggered' from 'C:\\Python311\\Lib\\asyncio\\staggered.py'>"

def start_server(*args,**kw):
    pass

streams = "<module 'asyncio.streams' from 'C:\\Python311\\Lib\\asyncio\\streams.py'>"

subprocess = "<module 'asyncio.subprocess' from 'C:\\Python311\\Lib\\asyncio\\subprocess.py'>"

sys = "<module 'sys' (built-in)>"

taskgroups = "<module 'asyncio.taskgroups' from 'C:\\Python311\\Lib\\asyncio\\taskgroups.py'>"

tasks = "<module 'asyncio.tasks' from 'C:\\Python311\\Lib\\asyncio\\tasks.py'>"

threads = "<module 'asyncio.threads' from 'C:\\Python311\\Lib\\asyncio\\threads.py'>"

def timeout(*args,**kw):
    pass

def timeout_at(*args,**kw):
    pass

timeouts = "<module 'asyncio.timeouts' from 'C:\\Python311\\Lib\\asyncio\\timeouts.py'>"

def to_thread(*args,**kw):
    pass

transports = "<module 'asyncio.transports' from 'C:\\Python311\\Lib\\asyncio\\transports.py'>"

trsock = "<module 'asyncio.trsock' from 'C:\\Python311\\Lib\\asyncio\\trsock.py'>"

def wait(*args,**kw):
    pass

def wait_for(*args,**kw):
    pass

windows_events = "<module 'asyncio.windows_events' from 'C:\\Python311\\Lib\\asyncio\\windows_events.py'>"

windows_utils = "<module 'asyncio.windows_utils' from 'C:\\Python311\\Lib\\asyncio\\windows_utils.py'>"

def wrap_future(*args,**kw):
    pass

