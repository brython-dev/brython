"""faulthandler module."""


_EXCEPTION_ACCESS_VIOLATION = -1073741819

_EXCEPTION_INT_DIVIDE_BY_ZERO = -1073741676

_EXCEPTION_NONCONTINUABLE = 1

_EXCEPTION_NONCONTINUABLE_EXCEPTION = -1073741787

_EXCEPTION_STACK_OVERFLOW = -1073741571

class __loader__(object):
    """Meta path import for built-in modules.
    
        All methods are either class or static methods to avoid the need to
        instantiate the class.
    
        """
    
    
    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"
    
    __dict__ = "{'__module__': '_frozen_importlib', '__doc__': 'Meta path import for built-in modules.\n\n    All methods are either class or static methods to avoid the need to\n    instantiate the class.\n\n    ', 'module_repr': <staticmethod object at 0x000001F9B17F15F8>, 'find_spec': <classmethod object at 0x000001F9B17F1630>, 'find_module': <classmethod object at 0x000001F9B17F1668>, 'create_module': <classmethod object at 0x000001F9B17F16A0>, 'exec_module': <classmethod object at 0x000001F9B17F16D8>, 'get_code': <classmethod object at 0x000001F9B17F1748>, 'get_source': <classmethod object at 0x000001F9B17F17B8>, 'is_package': <classmethod object at 0x000001F9B17F1828>, 'load_module': <classmethod object at 0x000001F9B17F1860>, '__dict__': <attribute '__dict__' of 'BuiltinImporter' objects>, '__weakref__': <attribute '__weakref__' of 'BuiltinImporter' objects>}"
    
    __dir__ = "<method '__dir__' of 'object' objects>"
    
    __eq__ = "<slot wrapper '__eq__' of 'object' objects>"
    
    __format__ = "<method '__format__' of 'object' objects>"
    
    __ge__ = "<slot wrapper '__ge__' of 'object' objects>"
    
    __getattribute__ = "<slot wrapper '__getattribute__' of 'object' objects>"
    
    __gt__ = "<slot wrapper '__gt__' of 'object' objects>"
    
    __hash__ = "<slot wrapper '__hash__' of 'object' objects>"
    
    __init__ = "<slot wrapper '__init__' of 'object' objects>"
    
    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.    
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass
    
    __le__ = "<slot wrapper '__le__' of 'object' objects>"
    
    __lt__ = "<slot wrapper '__lt__' of 'object' objects>"
    
    __module__ = """_frozen_importlib"""
    
    __ne__ = "<slot wrapper '__ne__' of 'object' objects>"
    
    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass
    
    __reduce__ = "<method '__reduce__' of 'object' objects>"
    
    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"
    
    __repr__ = "<slot wrapper '__repr__' of 'object' objects>"
    
    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"
    
    __sizeof__ = "<method '__sizeof__' of 'object' objects>"
    
    __str__ = "<slot wrapper '__str__' of 'object' objects>"
    
    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().    
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass
    
    __weakref__ = "<attribute '__weakref__' of 'BuiltinImporter' objects>"
    
    create_module = "<bound method BuiltinImporter.create_module of <class '_frozen_importlib.BuiltinImporter'>>"
    
    exec_module = "<bound method BuiltinImporter.exec_module of <class '_frozen_importlib.BuiltinImporter'>>"
    
    find_module = "<bound method BuiltinImporter.find_module of <class '_frozen_importlib.BuiltinImporter'>>"
    
    find_spec = "<bound method BuiltinImporter.find_spec of <class '_frozen_importlib.BuiltinImporter'>>"
    
    get_code = "<bound method BuiltinImporter.get_code of <class '_frozen_importlib.BuiltinImporter'>>"
    
    get_source = "<bound method BuiltinImporter.get_source of <class '_frozen_importlib.BuiltinImporter'>>"
    
    is_package = "<bound method BuiltinImporter.is_package of <class '_frozen_importlib.BuiltinImporter'>>"
    
    load_module = "<bound method _load_module_shim of <class '_frozen_importlib.BuiltinImporter'>>"
    
    def module_repr(*args,**kw):
        """Return repr for the module.    
                The method is deprecated.  The import machinery does the job itself.
        
                """
        pass
__spec__ = "ModuleSpec(name='faulthandler', loader=<class '_frozen_importlib.BuiltinImporter'>, origin='built-in')"

def _fatal_error(*args,**kw):
    """_fatal_error(message): call Py_FatalError(message)"""
    pass

def _fatal_error_c_thread(*args,**kw):
    """fatal_error_c_thread(): call Py_FatalError() in a new C thread."""
    pass

def _raise_exception(*args,**kw):
    """raise_exception(code, flags=0): Call RaiseException(code, flags)."""
    pass

def _read_null(*args,**kw):
    """_read_null(): read from NULL, raise a SIGSEGV or SIGBUS signal depending on the platform"""
    pass

def _sigabrt(*args,**kw):
    """_sigabrt(): raise a SIGABRT signal"""
    pass

def _sigfpe(*args,**kw):
    """_sigfpe(): raise a SIGFPE signal"""
    pass

def _sigsegv(*args,**kw):
    """_sigsegv(release_gil=False): raise a SIGSEGV signal"""
    pass

def cancel_dump_traceback_later(*args,**kw):
    """cancel_dump_traceback_later():    cancel the previous call to dump_traceback_later()."""
    pass

def disable(*args,**kw):
    """disable(): disable the fault handler"""
    pass

def dump_traceback(*args,**kw):
    """dump_traceback(file=sys.stderr, all_threads=True): dump the traceback of the current thread, or of all threads if all_threads is True, into file"""
    pass

def dump_traceback_later(*args,**kw):
    """dump_traceback_later(timeout, repeat=False, file=sys.stderrn, exit=False):    dump the traceback of all threads in timeout seconds,
    or each timeout seconds if repeat is True. If exit is True, call _exit(1) which is not safe."""
    pass

def enable(*args,**kw):
    """enable(file=sys.stderr, all_threads=True): enable the fault handler"""
    pass

def is_enabled(*args,**kw):
    """is_enabled()->bool: check if the handler is enabled"""
    pass
