from browser import self as window


clear_interval = window.clearInterval

clear_timeout = window.clearTimeout

def set_interval(func, interval, *args):
    return window.setInterval(func, interval, *args)

def set_timeout(func, interval, *args):
    return int(window.setTimeout(func, interval, *args))

def request_animation_frame(func):
    if func.__code__.co_argcount == 0:
        raise TypeError(f'function {func.__code__.co_name}() ' +
            'should take a single argument')
    return int(window.requestAnimationFrame(func))

def cancel_animation_frame(int_id):
    window.cancelAnimationFrame(int_id)

def set_loop_timeout(x):
    """The loops compiled from now on raise LoopInterrupt once they have kept
    the page frozen for more than x seconds; 0 or None, they never do."""
    if x is not None and not isinstance(x, (int, float)):
        raise TypeError(f"set_loop_timeout() expects a number of seconds, "
            f"not '{type(x).__name__}'")
    __BRYTHON__.loop_timeout = x or 0

LoopInterrupt = __BRYTHON__.loop_interrupt()