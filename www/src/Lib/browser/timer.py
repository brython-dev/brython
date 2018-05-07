from browser import window
from browser import console
def wrap(func):
    # Transforms a function f into another function that prints a
    # traceback in case of exception
    def f(*args, **kw):
        try:
            return func(*args, **kw)
        except Exception as exc:
            msg = ''
            try:
                if exc.args:
                    msg = '{0.info}\n{0.__name__}: {0.args[0]}'.format(exc)
                else:
                    msg = str(exc)
                import sys
                sys.stderr.write(msg)
            except Exception as exc2:
                console.log("Error printing exception traceback", exc2, func, args, kw)
    return f

clear_interval = window.clearInterval
    
clear_timeout = window.clearTimeout

def set_interval(func,interval):
    return window.setInterval(wrap(func),interval)

def set_timeout(func,interval):
    return int(window.setTimeout(wrap(func),interval))

def request_animation_frame(func):
    return int(window.requestAnimationFrame(func))

def cancel_animation_frame(int_id):
    window.cancelAnimationFrame(int_id)

def set_loop_timeout(x):
    # set a variable used to stop loops that last more than x seconds
    assert isinstance(x, int)
    __BRYTHON__.loop_timeout = x