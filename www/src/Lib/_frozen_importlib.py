"""Core implementation of import.

This module is NOT meant to be directly imported! It has been designed such
that it can be bootstrapped into Python as the implementation of import. As
such it requires the injection of specific modules and attributes in order to
work. One should use importlib as the public-facing version of this module.

"""


class BuiltinImporter(object):
    """Meta path import for built-in modules.

        All methods are either class or static methods to avoid the need to
        instantiate the class.

        """

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

class FrozenImporter(object):
    """Meta path import for frozen modules.

        All methods are either class or static methods to avoid the need to
        instantiate the class.

        """


    _ORIGIN = """frozen"""

    create_module = "<bound method FrozenImporter.create_module of <class '_frozen_importlib.FrozenImporter'>>"

    def exec_module(*args,**kw):
        pass

    find_module = "<bound method FrozenImporter.find_module of <class '_frozen_importlib.FrozenImporter'>>"

    find_spec = "<bound method FrozenImporter.find_spec of <class '_frozen_importlib.FrozenImporter'>>"

    get_code = "<bound method FrozenImporter.get_code of <class '_frozen_importlib.FrozenImporter'>>"

    get_source = "<bound method FrozenImporter.get_source of <class '_frozen_importlib.FrozenImporter'>>"

    is_package = "<bound method FrozenImporter.is_package of <class '_frozen_importlib.FrozenImporter'>>"

    load_module = "<bound method FrozenImporter.load_module of <class '_frozen_importlib.FrozenImporter'>>"

    def module_repr(*args,**kw):
        """Return repr for the module.
                The method is deprecated.  The import machinery does the job itself.

                """
        pass
class ModuleSpec(object):
    """The specification for a module, used for loading.

        A module's spec is the source for information about the module.  For
        data associated with the module, including source, use the spec's
        loader.

        `name` is the absolute name of the module.  `loader` is the loader
        to use when loading the module.  `parent` is the name of the
        package the module is in.  The parent is derived from the name.

        `is_package` determines if the module is considered a package or
        not.  On modules this is reflected by the `__path__` attribute.

        `origin` is the specific location used by the loader from which to
        load the module, if that information is available.  When filename is
        set, origin will match.

        `has_location` indicates that a spec's "origin" reflects a location.
        When this is True, `__file__` attribute of the module is set.

        `cached` is the location of the cached bytecode file, if any.  It
        corresponds to the `__cached__` attribute.

        `submodule_search_locations` is the sequence of path entries to
        search when importing submodules.  If set, is_package should be
        True--and False otherwise.

        Packages are simply modules that (may) have submodules.  If a spec
        has a non-None value in `submodule_search_locations`, the import
        system will consider modules loaded from the spec as packages.

        Only finders (see importlib.abc.MetaPathFinder and
        importlib.abc.PathEntryFinder) should modify ModuleSpec instances.

        """


    cached = "<property object at 0x000001AB260C82C0>"

    has_location = "<property object at 0x000001AB260C8360>"

    parent = "<property object at 0x000001AB260C8220>"

class _DeadlockError(RuntimeError):

    args = "<attribute 'args' of 'BaseException' objects>"

    with_traceback = "<method 'with_traceback' of 'BaseException' objects>"

class _DummyModuleLock(object):
    """A simple _ModuleLock equivalent for Python builds without
        multi-threading support."""
    def acquire(*args,**kw):
        pass

    def release(*args,**kw):
        pass

_ERR_MSG = """No module named {!r}"""

_ERR_MSG_PREFIX = """No module named """

class _ImportLockContext(object):
    """Context manager for the import lock."""


class _ModuleLock(object):
    """A recursive lock implementation which is able to detect deadlocks
        (e.g. thread 1 trying to take locks A then B, and thread 2 trying to
        take locks B then A).
        """

    def acquire(*args,**kw):
        """            Acquire the module lock.  If a potential deadlock is detected,
                a _DeadlockError is raised.
                Otherwise, the lock is always acquired and True is returned.
                """
        pass

    def has_deadlock(*args,**kw):
        pass

    def release(*args,**kw):
        pass

class _ModuleLockManager(object):
    pass

_NEEDS_LOADING = "<object object at 0x000001AB260A4060>"

def __import__(*args,**kw):
    """Import a module.
        The 'globals' argument is used to infer where the import is occurring from
        to handle relative imports. The 'locals' argument is ignored. The
        'fromlist' argument specifies what should exist as attributes on the module
        being imported (e.g. ``from module import <fromlist>``).  The 'level'
        argument represents the package location to import from in a relative
        import (e.g. ``from ..pkg import mod`` would have a 'level' of 2).

        """
    pass


_blocking_on = {}

_bootstrap_external = "<module 'importlib._bootstrap_external' (frozen)>"

def _builtin_from_name(*args,**kw):
    pass

def _calc___package__(*args,**kw):
    """Calculate what __package__ should be.
        __package__ is not guaranteed to be defined or could be set to None
        to represent that its proper value is unknown.

        """
    pass

def _call_with_frames_removed(*args,**kw):
    """remove_importlib_frames in import.c will always remove sequences        of importlib frames that end with a call to this function

        Use it instead of a normal call in places where including the importlib
        frames introduces unwanted noise into the traceback (e.g. when executing
        module code)
        """
    pass

def _exec(*args,**kw):
    """Execute the spec's specified module in an existing module's namespace."""
    pass

def _find_and_load(*args,**kw):
    """Find and load the module."""
    pass

def _find_and_load_unlocked(*args,**kw):
    pass

def _find_spec(*args,**kw):
    """Find a module's spec."""
    pass

def _find_spec_legacy(*args,**kw):
    pass

def _gcd_import(*args,**kw):
    """Import and return the module based on its name, the package the call is        being made from, and the level adjustment.

        This function represents the greatest common denominator of functionality
        between import_module and __import__. This includes setting __package__ if
        the loader did not.

        """
    pass

def _get_module_lock(*args,**kw):
    """Get or create the module lock for a given module name.
        Acquire/release internally the global import lock to protect
        _module_locks."""
    pass

def _handle_fromlist(*args,**kw):
    """Figure out what __import__ should return.
        The import_ parameter is a callable which takes the name of module to
        import. It is required to decouple the function from assuming importlib's
        import implementation is desired.

        """
    pass

_imp = "<module '_imp' (built-in)>"

def _init_module_attrs(*args,**kw):
    pass

def _install(*args,**kw):
    """Install importers for builtin and frozen modules"""
    pass

def _install_external_importers(*args,**kw):
    """Install importers that require external filesystem access"""
    pass

def _load(*args,**kw):
    """Return a new module object, loaded by the spec's loader.
        The module is not added to its parent.

        If a module is already in sys.modules, that existing module gets
        clobbered.

        """
    pass

def _load_backward_compatible(*args,**kw):
    pass

def _load_module_shim(*args,**kw):
    """Load the specified module into sys.modules and return it.
        This method is deprecated.  Use loader.exec_module instead.

        """
    pass

def _load_unlocked(*args,**kw):
    pass

def _lock_unlock_module(*args,**kw):
    """Acquires then releases the module lock for a given module name.
        This is used to ensure a module is completely initialized, in the
        event it is being imported by another thread.
        """
    pass

_module_locks = {}

def _module_repr(*args,**kw):
    pass

def _module_repr_from_spec(*args,**kw):
    """Return the repr to use for the module."""
    pass

def _new_module(*args,**kw):
    pass

def _requires_builtin(*args,**kw):
    """Decorator to verify the named module is built-in."""
    pass

def _requires_frozen(*args,**kw):
    """Decorator to verify the named module is frozen."""
    pass

def _resolve_name(*args,**kw):
    """Resolve a relative module name to an absolute one."""
    pass

def _sanity_check(*args,**kw):
    """Verify arguments are "sane"."""
    pass

def _setup(*args,**kw):
    """Setup importlib by importing needed built-in modules and injecting them        into the global namespace.

        As sys is needed for sys.modules access and _imp is needed to load built-in
        modules, those two modules must be explicitly passed in.

        """
    pass

def _spec_from_module(*args,**kw):
    pass

_thread = "<module '_thread' (built-in)>"

def _verbose_message(*args,**kw):
    """Print the message to stderr if -v/PYTHONVERBOSE is turned on."""
    pass

_warnings = "<module '_warnings' (built-in)>"

_weakref = "<module '_weakref' (built-in)>"

def _wrap(*args,**kw):
    """Simple substitute for functools.update_wrapper."""
    pass

def module_from_spec(*args,**kw):
    """Create a module based on the provided spec."""
    pass

def spec_from_loader(*args,**kw):
    """Return a module spec based on various loader methods."""
    pass


