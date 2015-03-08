"""allow programmer to define multiple exit functions to be executedupon normal program termination.

Two public functions, register and unregister, are defined.
"""


class __loader__(object):
    pass

def _clear(*args,**kw):
    """_clear() -> None    
    Clear the list of previously registered exit functions."""
    pass

def _run_exitfuncs(*args,**kw):
    """_run_exitfuncs() -> None    
    Run all registered exit functions."""
    pass

def register(*args,**kw):
    """register(func, *args, **kwargs) -> func    
    Register a function to be executed upon normal program termination
    
        func - function to be called at exit
        args - optional arguments to pass to func
        kwargs - optional keyword arguments to pass to func
    
        func is returned to facilitate usage as a decorator."""
    pass

def unregister(*args,**kw):
    """unregister(func) -> None    
    Unregister a exit function which was previously registered using
    atexit.register
    
        func - function to be unregistered"""
    pass
