"""(Extremely) low-level import machinery bits as used by importlib and imp."""
import sys

def _fix_co_filename(*args,**kw):
    """Changes code.co_filename to specify the passed-in file path.
      code
        Code object to change.
      path
        File path to use."""
    pass

def acquire_lock(*args,**kw):
    """Acquires the interpreter's import lock for the current thread.
    This lock should be used by import hooks to ensure thread-safety when importing
    modules. On platforms without threads, this function does nothing."""
    pass

check_hash_based_pycs = """default"""

def create_builtin(spec):
    """Create an extension module."""
    __import__(spec.name)

def create_dynamic(*args,**kw):
    """Create an extension module."""
    pass

def exec_builtin(*args,**kw):
    """Initialize a built-in module."""
    pass

def exec_dynamic(*args,**kw):
    """Initialize an extension module."""
    pass

def extension_suffixes(*args,**kw):
    """Returns the list of file suffixes used to identify extension modules."""
    return []

def get_frozen_object(*args,**kw):
    """Create a code object for a frozen module."""
    pass

def init_frozen(*args,**kw):
    """Initializes a frozen module."""
    pass

def is_builtin(module_name):

    return module_name in __BRYTHON__.builtin_module_names

def is_frozen(*args,**kw):
    """Returns True if the module name corresponds to a frozen module."""
    return False

def is_frozen_package(*args,**kw):
    """Returns True if the module name is of a frozen package."""
    pass

def lock_held(*args,**kw):
    """Return True if the import lock is currently held, else False.
    On platforms without threads, return False."""
    return False

def release_lock(*args,**kw):
    """Release the interpreter's import lock.
    On platforms without threads, this function does nothing."""
    pass

def source_hash(*args,**kw):
    pass
