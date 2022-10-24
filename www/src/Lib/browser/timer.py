from browser import console, self as window

def wrap(func, *args):
    # Transforms a function f into another function that prints a
    # traceback in case of exception
    def f():
        try:
            return func(*args)
        except Exception as exc:
            msg = ''
            try:
                if exc.args:
                    msg = '{0.info}\n{0.__class__.__name__}: {0.args[0]}'.format(exc)
                else:
                    msg = str(exc)
                import sys
                sys.stderr.write(msg)
            except Exception as exc2:
                console.log("Error printing exception traceback", exc2, func,
                    args, kw)
    return f

clear_interval = window.clearInterval

clear_timeout = window.clearTimeout

def set_interval(func, interval, *args):
    return window.setInterval(wrap(func, *args), interval)

def set_timeout(func, interval, *args):
    return int(window.setTimeout(wrap(func, *args), interval))

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