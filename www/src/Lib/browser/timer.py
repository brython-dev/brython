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
    # set a variable used to stop loops that last more than x seconds
    assert isinstance(x, int)
    __BRYTHON__.loop_timeout = x