from browser import window

def wrap(func):
    # Transforms a function f into another function that prints a
    # traceback in case of exception
    def f(*args, **kw):
        try:
            return func(*args, **kw)
        except Exception as exc:
            sys.stderr.write(exc)
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
