"""Core implementation of path-based import.

This module is NOT meant to be directly imported! It has been designed such
that it can be bootstrapped into Python as the implementation of import. As
such it requires the injection of specific modules and attributes in order to
work. One should use importlib as the public-facing version of this module.

"""


BYTECODE_SUFFIXES = "['.pyc']"

DEBUG_BYTECODE_SUFFIXES = "['.pyc']"

EXTENSION_SUFFIXES = "['.cp38-win_amd64.pyd', '.pyd']"

class FileLoader(object):
    """Base file loader class which implements the loader protocol methods that
        require file system usage."""

    def contents(*args,**kw):
        pass

    def get_data(*args,**kw):
        """Return the data from path as raw bytes."""
        pass

    def get_filename(*args,**kw):
        """Return the path to the source file as found by the finder."""
        pass

    def get_resource_reader(*args,**kw):
        pass

    def is_resource(*args,**kw):
        pass

    def load_module(*args,**kw):
        """Load a module from a file.
                This method is deprecated.  Use exec_module() instead.

                """
        pass

    def open_resource(*args,**kw):
        pass

    def resource_path(*args,**kw):
        pass

class _LoaderBasics(object):
    """Base class of common code needed by both SourceLoader and
        SourcelessFileLoader."""

    def create_module(*args,**kw):
        """Use default semantics for module creation."""
        pass

    def exec_module(*args,**kw):
        """Execute the module."""
        pass

    def is_package(*args,**kw):
        """Concrete implementation of InspectLoader.is_package by checking if            the path returned by get_filename has a filename of '__init__.py'."""
        pass

    def load_module(*args,**kw):
        """This module is deprecated."""
        pass

class SourceLoader(_LoaderBasics):

    def _cache_bytecode(*args,**kw):
        """Optional method which writes data (bytes) to a file path (a str).
                Implementing this method allows for the writing of bytecode files.

                The source path is needed in order to correctly transfer permissions
                """
        pass

    def create_module(*args,**kw):
        """Use default semantics for module creation."""
        pass

    def exec_module(*args,**kw):
        """Execute the module."""
        pass

    def get_code(*args,**kw):
        """Concrete implementation of InspectLoader.get_code.
                Reading of bytecode requires path_stats to be implemented. To write
                bytecode, set_data must also be implemented.

                """
        pass

    def get_source(*args,**kw):
        """Concrete implementation of InspectLoader.get_source."""
        pass

    def is_package(*args,**kw):
        """Concrete implementation of InspectLoader.is_package by checking if            the path returned by get_filename has a filename of '__init__.py'."""
        pass

    def load_module(*args,**kw):
        """This module is deprecated."""
        pass

    def path_mtime(*args,**kw):
        """Optional method that returns the modification time (an int) for the            specified path (a str).

                Raises OSError when the path cannot be handled.
                """
        pass

    def path_stats(*args,**kw):
        """Optional method returning a metadata dict for the specified            path (a str).

                Possible keys:
                - 'mtime' (mandatory) is the numeric timestamp of last source
                  code modification;
                - 'size' (optional) is the size in bytes of the source code.

                Implementing this method allows the loader to read bytecode files.
                Raises OSError when the path cannot be handled.
                """
        pass

    def set_data(*args,**kw):
        """Optional method which writes data (bytes) to a file path (a str).
                Implementing this method allows for the writing of bytecode files.
                """
        pass

    def source_to_code(*args,**kw):
        """Return the code object compiled from source.
                The 'data' argument can be any object type that compile() supports.
                """
        pass

class ExtensionFileLoader(FileLoader,_LoaderBasics):
    """Loader for extension modules.

        The constructor is designed to work with FileFinder.

        """

    def contents(*args,**kw):
        pass

    def create_module(*args,**kw):
        """Create an unitialized extension module"""
        pass

    def exec_module(*args,**kw):
        """Initialize an extension module"""
        pass

    def get_code(*args,**kw):
        """Return None as an extension module cannot create a code object."""
        pass

    def get_data(*args,**kw):
        """Return the data from path as raw bytes."""
        pass

    def get_filename(*args,**kw):
        """Return the path to the source file as found by the finder."""
        pass

    def get_resource_reader(*args,**kw):
        pass

    def get_source(*args,**kw):
        """Return None as extension modules have no source code."""
        pass

    def is_package(*args,**kw):
        """Return True if the extension module is a package."""
        pass

    def is_resource(*args,**kw):
        pass

    def load_module(*args,**kw):
        """Load a module from a file.
                This method is deprecated.  Use exec_module() instead.

                """
        pass

    def open_resource(*args,**kw):
        pass

    def resource_path(*args,**kw):
        pass

class FileFinder(object):
    """File-based finder.

        Interactions with the file system are cached for performance, being
        refreshed when the directory the finder is handling has been modified.

        """



    def _fill_cache(*args,**kw):
        """Fill the cache of potential modules and packages for this directory."""
        pass

    def _get_spec(*args,**kw):
        pass

    def find_loader(*args,**kw):
        """Try to find a loader for the specified module, or the namespace            package portions. Returns (loader, list-of-portions).

                This method is deprecated.  Use find_spec() instead.

                """
        pass

    def find_module(*args,**kw):
        """Try to find a loader for the specified module by delegating to        self.find_loader().

            This method is deprecated in favor of finder.find_spec().

            """
        pass

    def find_spec(*args,**kw):
        """Try to find a spec for the specified module.
                Returns the matching spec, or None if not found.
                """
        pass

    def invalidate_caches(*args,**kw):
        """Invalidate the directory mtime."""
        pass

    path_hook = "<bound method FileFinder.path_hook of <class '_frozen_importlib_external.FileFinder'>>"

MAGIC_NUMBER = "b'U\r\r\n'"

OPTIMIZED_BYTECODE_SUFFIXES = "['.pyc']"

class PathFinder(object):
    """Meta path finder for sys.path and package __path__ attributes."""

    _get_spec = "<bound method PathFinder._get_spec of <class '_frozen_importlib_external.PathFinder'>>"

    _legacy_get_spec = "<bound method PathFinder._legacy_get_spec of <class '_frozen_importlib_external.PathFinder'>>"

    _path_hooks = "<bound method PathFinder._path_hooks of <class '_frozen_importlib_external.PathFinder'>>"

    _path_importer_cache = "<bound method PathFinder._path_importer_cache of <class '_frozen_importlib_external.PathFinder'>>"

    find_distributions = "<bound method PathFinder.find_distributions of <class '_frozen_importlib_external.PathFinder'>>"

    find_module = "<bound method PathFinder.find_module of <class '_frozen_importlib_external.PathFinder'>>"

    find_spec = "<bound method PathFinder.find_spec of <class '_frozen_importlib_external.PathFinder'>>"

    invalidate_caches = "<bound method PathFinder.invalidate_caches of <class '_frozen_importlib_external.PathFinder'>>"

SOURCE_SUFFIXES = "['.py', '.pyw']"

class SourceFileLoader(FileLoader,SourceLoader):
    """Concrete implementation of SourceLoader using the file system."""

    def _cache_bytecode(*args,**kw):
        pass

    def contents(*args,**kw):
        pass

    def create_module(*args,**kw):
        """Use default semantics for module creation."""
        pass

    def exec_module(*args,**kw):
        """Execute the module."""
        pass

    def get_code(*args,**kw):
        """Concrete implementation of InspectLoader.get_code.
                Reading of bytecode requires path_stats to be implemented. To write
                bytecode, set_data must also be implemented.

                """
        pass

    def get_data(*args,**kw):
        """Return the data from path as raw bytes."""
        pass

    def get_filename(*args,**kw):
        """Return the path to the source file as found by the finder."""
        pass

    def get_resource_reader(*args,**kw):
        pass

    def get_source(*args,**kw):
        """Concrete implementation of InspectLoader.get_source."""
        pass

    def is_package(*args,**kw):
        """Concrete implementation of InspectLoader.is_package by checking if            the path returned by get_filename has a filename of '__init__.py'."""
        pass

    def is_resource(*args,**kw):
        pass

    def load_module(*args,**kw):
        """Load a module from a file.
                This method is deprecated.  Use exec_module() instead.

                """
        pass

    def open_resource(*args,**kw):
        pass

    def path_mtime(*args,**kw):
        """Optional method that returns the modification time (an int) for the            specified path (a str).

                Raises OSError when the path cannot be handled.
                """
        pass

    def path_stats(*args,**kw):
        """Return the metadata for the path."""
        pass

    def resource_path(*args,**kw):
        pass

    def set_data(*args,**kw):
        """Write bytes data to a file."""
        pass

    def source_to_code(*args,**kw):
        """Return the code object compiled from source.
                The 'data' argument can be any object type that compile() supports.
                """
        pass

class SourcelessFileLoader(FileLoader,_LoaderBasics):
    """Loader which handles sourceless file imports."""

    def contents(*args,**kw):
        pass

    def create_module(*args,**kw):
        """Use default semantics for module creation."""
        pass

    def exec_module(*args,**kw):
        """Execute the module."""
        pass

    def get_code(*args,**kw):
        pass

    def get_data(*args,**kw):
        """Return the data from path as raw bytes."""
        pass

    def get_filename(*args,**kw):
        """Return the path to the source file as found by the finder."""
        pass

    def get_resource_reader(*args,**kw):
        pass

    def get_source(*args,**kw):
        """Return None as there is no source code."""
        pass

    def is_package(*args,**kw):
        """Concrete implementation of InspectLoader.is_package by checking if            the path returned by get_filename has a filename of '__init__.py'."""
        pass

    def is_resource(*args,**kw):
        pass

    def load_module(*args,**kw):
        """Load a module from a file.
                This method is deprecated.  Use exec_module() instead.

                """
        pass

    def open_resource(*args,**kw):
        pass

    def resource_path(*args,**kw):
        pass

class WindowsRegistryFinder(object):
    """Meta path finder for modules declared in the Windows registry."""


    DEBUG_BUILD = False

    REGISTRY_KEY = """Software\Python\PythonCore\{sys_version}\Modules\{fullname}"""

    REGISTRY_KEY_DEBUG = """Software\Python\PythonCore\{sys_version}\Modules\{fullname}\Debug"""


    _open_registry = "<bound method WindowsRegistryFinder._open_registry of <class '_frozen_importlib_external.WindowsRegistryFinder'>>"

    _search_registry = "<bound method WindowsRegistryFinder._search_registry of <class '_frozen_importlib_external.WindowsRegistryFinder'>>"

    find_module = "<bound method WindowsRegistryFinder.find_module of <class '_frozen_importlib_external.WindowsRegistryFinder'>>"

    find_spec = "<bound method WindowsRegistryFinder.find_spec of <class '_frozen_importlib_external.WindowsRegistryFinder'>>"

_CASE_INSENSITIVE_PLATFORMS = "('cygwin', 'darwin', 'win')"

_CASE_INSENSITIVE_PLATFORMS_BYTES_KEY = "('cygwin', 'darwin')"

_CASE_INSENSITIVE_PLATFORMS_STR_KEY = "('win',)"

class _NamespaceLoader(object):

    def create_module(*args,**kw):
        """Use default semantics for module creation."""
        pass

    def exec_module(*args,**kw):
        pass

    def get_code(*args,**kw):
        pass

    def get_source(*args,**kw):
        pass

    def is_package(*args,**kw):
        pass

    def load_module(*args,**kw):
        """Load a namespace module.
                This method is deprecated.  Use exec_module() instead.

                """
        pass

    module_repr = "<bound method _NamespaceLoader.module_repr of <class '_frozen_importlib_external._NamespaceLoader'>>"

class _NamespacePath(object):
    """Represents a namespace package's path.  It uses the module name
        to find its parent module, and from there it looks up the parent's
        __path__.  When this changes, the module's own path is recomputed,
        using path_finder.  For top-level modules, the parent module's path
        is sys.path."""


    def __contains__(*args,**kw):
        pass


    def __getitem__(*args,**kw):
        pass


    def __setitem__(*args,**kw):
        pass

    def _find_parent_path_names(*args,**kw):
        """Returns a tuple of (parent-module-name, parent-path-attr-name)"""
        pass

    def _get_parent_path(*args,**kw):
        pass

    def _recalculate(*args,**kw):
        pass

    def append(*args,**kw):
        pass

_OPT = """opt-"""

_POPULATE = "<object object at 0x000001AE5B0C40C0>"

_PYCACHE = """__pycache__"""

_RAW_MAGIC_NUMBER = 168627541


_bootstrap = "<module 'importlib._bootstrap' (frozen)>"

def _calc_mode(*args,**kw):
    """Calculate the mode permissions for a bytecode file."""
    pass

def _check_name(*args,**kw):
    """Decorator to verify that the module being requested matches the one the        loader can handle.

        The first argument (self) must define _name which the second argument is
        compared against. If the comparison fails then ImportError is raised.

        """
    pass

def _classify_pyc(*args,**kw):
    """Perform basic validity checking of a pyc header and return the flags field,        which determines how the pyc should be further validated against the source.

        *data* is the contents of the pyc file. (Only the first 16 bytes are
        required, though.)

        *name* is the name of the module being imported. It is used for logging.

        *exc_details* is a dictionary passed to ImportError if it raised for
        improved debugging.

        ImportError is raised when the magic number is incorrect or when the flags
        field is invalid. EOFError is raised when the data is found to be truncated.

        """
    pass

def _code_to_hash_pyc(*args,**kw):
    """Produce the data for a hash-based pyc."""
    pass

def _code_to_timestamp_pyc(*args,**kw):
    """Produce the data for a timestamp-based pyc."""
    pass

class _code_type(object):
    """code(argcount, posonlyargcount, kwonlyargcount, nlocals, stacksize,
          flags, codestring, constants, names, varnames, filename, name,
          firstlineno, lnotab[, freevars[, cellvars]])

    Create a code object.  Not for the faint of heart."""


    __delattr__ = "<slot wrapper '__delattr__' of 'object' objects>"

    __dir__ = "<method '__dir__' of 'object' objects>"

    __eq__ = "<slot wrapper '__eq__' of 'code' objects>"

    __format__ = "<method '__format__' of 'object' objects>"

    __ge__ = "<slot wrapper '__ge__' of 'code' objects>"

    __getattribute__ = "<slot wrapper '__getattribute__' of 'code' objects>"

    __gt__ = "<slot wrapper '__gt__' of 'code' objects>"

    __hash__ = "<slot wrapper '__hash__' of 'code' objects>"

    __init__ = "<slot wrapper '__init__' of 'object' objects>"

    def __init_subclass__(*args,**kw):
        """This method is called when a class is subclassed.
        The default implementation does nothing. It may be
        overridden to extend subclasses.
        """
        pass

    __le__ = "<slot wrapper '__le__' of 'code' objects>"

    __lt__ = "<slot wrapper '__lt__' of 'code' objects>"

    __ne__ = "<slot wrapper '__ne__' of 'code' objects>"

    def __new__(*args,**kw):
        """Create and return a new object.  See help(type) for accurate signature."""
        pass

    __reduce__ = "<method '__reduce__' of 'object' objects>"

    __reduce_ex__ = "<method '__reduce_ex__' of 'object' objects>"

    __repr__ = "<slot wrapper '__repr__' of 'code' objects>"

    __setattr__ = "<slot wrapper '__setattr__' of 'object' objects>"

    __sizeof__ = "<method '__sizeof__' of 'code' objects>"

    __str__ = "<slot wrapper '__str__' of 'object' objects>"

    def __subclasshook__(*args,**kw):
        """Abstract classes can override this to customize issubclass().
        This is invoked early on by abc.ABCMeta.__subclasscheck__().
        It should return True, False or NotImplemented.  If it returns
        NotImplemented, the normal algorithm is used.  Otherwise, it
        overrides the normal algorithm (and the outcome is cached).
        """
        pass

    co_argcount = "<member 'co_argcount' of 'code' objects>"

    co_cellvars = "<member 'co_cellvars' of 'code' objects>"

    co_code = "<member 'co_code' of 'code' objects>"

    co_consts = "<member 'co_consts' of 'code' objects>"

    co_filename = "<member 'co_filename' of 'code' objects>"

    co_firstlineno = "<member 'co_firstlineno' of 'code' objects>"

    co_flags = "<member 'co_flags' of 'code' objects>"

    co_freevars = "<member 'co_freevars' of 'code' objects>"

    co_kwonlyargcount = "<member 'co_kwonlyargcount' of 'code' objects>"

    co_lnotab = "<member 'co_lnotab' of 'code' objects>"

    co_name = "<member 'co_name' of 'code' objects>"

    co_names = "<member 'co_names' of 'code' objects>"

    co_nlocals = "<member 'co_nlocals' of 'code' objects>"

    co_posonlyargcount = "<member 'co_posonlyargcount' of 'code' objects>"

    co_stacksize = "<member 'co_stacksize' of 'code' objects>"

    co_varnames = "<member 'co_varnames' of 'code' objects>"

    replace = "<method 'replace' of 'code' objects>"
def _compile_bytecode(*args,**kw):
    """Compile bytecode as found in a pyc."""
    pass

def _find_module_shim(*args,**kw):
    """Try to find a loader for the specified module by delegating to        self.find_loader().

        This method is deprecated in favor of finder.find_spec().

        """
    pass

def _fix_up_module(*args,**kw):
    pass

def _get_cached(*args,**kw):
    pass

def _get_sourcefile(*args,**kw):
    """Convert a bytecode file path to a source path (if possible).
        This function exists purely for backwards-compatibility for
        PyImport_ExecCodeModuleWithFilenames() in the C API.

        """
    pass

def _get_supported_file_loaders(*args,**kw):
    """Returns a list of file-based module loaders.
        Each item is a tuple (loader, suffixes).
        """
    pass

_imp = "<module '_imp' (built-in)>"

def _install(*args,**kw):
    """Install the path-based import components."""
    pass

_io = "<module 'io' (built-in)>"

def _make_relax_case(*args,**kw):
    pass

_os = "<module 'nt' (built-in)>"

def _pack_uint32(*args,**kw):
    """Convert a 32-bit integer to little-endian."""
    pass

def _path_is_mode_type(*args,**kw):
    """Test whether the path is the specified mode type."""
    pass

def _path_isabs(*args,**kw):
    """Replacement for os.path.isabs.
        Considers a Windows drive-relative path (no drive, but starts with slash) to
        still be "absolute".
        """
    pass

def _path_isdir(*args,**kw):
    """Replacement for os.path.isdir."""
    pass

def _path_isfile(*args,**kw):
    """Replacement for os.path.isfile."""
    pass

def _path_join(*args,**kw):
    """Replacement for os.path.join()."""
    pass

def _path_split(*args,**kw):
    """Replacement for os.path.split()."""
    pass

def _path_stat(*args,**kw):
    """Stat the path.
        Made a separate function to make it easier to override in experiments
        (e.g. cache stat results).

        """
    pass

_pathseps_with_colon = "{':/', ':\\'}"

def _relax_case(*args,**kw):
    """True if filenames must be checked case-insensitively."""
    pass

def _setup(*args,**kw):
    """Setup the path-based importers for importlib by importing needed        built-in modules and injecting them into the global namespace.

        Other components are extracted from the core bootstrap module.

        """
    pass

_thread = "<module '_thread' (built-in)>"

def _unpack_uint16(*args,**kw):
    """Convert 2 bytes in little-endian to an integer."""
    pass

def _unpack_uint32(*args,**kw):
    """Convert 4 bytes in little-endian to an integer."""
    pass

def _validate_hash_pyc(*args,**kw):
    """Validate a hash-based pyc by checking the real source hash against the one in        the pyc header.

        *data* is the contents of the pyc file. (Only the first 16 bytes are
        required.)

        *source_hash* is the importlib.util.source_hash() of the source file.

        *name* is the name of the module being imported. It is used for logging.

        *exc_details* is a dictionary passed to ImportError if it raised for
        improved debugging.

        An ImportError is raised if the bytecode is stale.

        """
    pass

def _validate_timestamp_pyc(*args,**kw):
    """Validate a pyc against the source last-modified time.
        *data* is the contents of the pyc file. (Only the first 16 bytes are
        required.)

        *source_mtime* is the last modified timestamp of the source file.

        *source_size* is None or the size of the source file in bytes.

        *name* is the name of the module being imported. It is used for logging.

        *exc_details* is a dictionary passed to ImportError if it raised for
        improved debugging.

        An ImportError is raised if the bytecode is stale.

        """
    pass

_warnings = "<module '_warnings' (built-in)>"

_weakref = "<module '_weakref' (built-in)>"

_winreg = "<module 'winreg' (built-in)>"

def _write_atomic(*args,**kw):
    """Best-effort function to write data to a path atomically.        Be prepared to handle a FileExistsError if concurrent writing of the
        temporary file is attempted."""
    pass

builtins = "<module 'builtins' (built-in)>"

def cache_from_source(*args,**kw):
    """Given the path to a .py file, return the path to its .pyc file.
        The .py file does not need to exist; this simply returns the path to the
        .pyc file calculated as if the .py file were imported.

        The 'optimization' parameter controls the presumed optimization level of
        the bytecode file. If 'optimization' is not None, the string representation
        of the argument is taken and verified to be alphanumeric (else ValueError
        is raised).

        The debug_override parameter is deprecated. If debug_override is not None,
        a True value is the same as setting 'optimization' to the empty string
        while a False value is equivalent to setting 'optimization' to '1'.

        If sys.implementation.cache_tag is None then NotImplementedError is raised.

        """
    pass

def decode_source(*args,**kw):
    """Decode bytes representing source code and return the string.
        Universal newline support is used in the decoding.
        """
    pass

marshal = "<module 'marshal' (built-in)>"

path_sep = "/"

path_separators = "/"

def source_from_cache(*args,**kw):
    """Given the path to a .pyc. file, return the path to its .py file.
        The .pyc file does not need to exist; this simply returns the path to
        the .py file calculated to correspond to the .pyc file.  If path does
        not conform to PEP 3147/488 format, ValueError will be raised. If
        sys.implementation.cache_tag is None then NotImplementedError is raised.

        """
    pass

def spec_from_file_location(*args,**kw):
    """Return a module spec based on a file location.
        To indicate that the module is a package, set
        submodule_search_locations to a list of directory paths.  An
        empty list is sufficient, though its not otherwise useful to the
        import system.

        The loader must take a spec as its only __init__() arg.

        """
    pass

sys = "<module 'sys' (built-in)>"
