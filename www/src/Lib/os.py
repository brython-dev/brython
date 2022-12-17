"""Limited version of os module: only keep what is more or less relevant in a
browser context
"""

import abc
import sys

error = OSError
name = 'posix'
linesep = '\n'

from posix import *
import posixpath as path

sys.modules['os.path'] = path
from os.path import (curdir, pardir, sep, pathsep, defpath, extsep, altsep,
    devnull)

environ = {'HOME': __BRYTHON__.curdir,
    'PYTHONPATH': __BRYTHON__.brython_path
}

SEEK_SET = 0
SEEK_CUR = 1
SEEK_END = 2

# fake implementation of terminal size
class terminal_size:

    def __init__(self, fileno):
        self.columns = 120
        self.lines = 30

def get_terminal_size(*args):
    return terminal_size(None)

def _get_exports_list(module):
    try:
        return list(module.__all__)
    except AttributeError:
        return [n for n in dir(module) if n[0] != '_']

def getenv(key, default=None):
    """Get an environment variable, return None if it doesn't exist.
    The optional second argument can specify an alternate default.
    key, default and the result are str."""
    return environ.get(key, default)

supports_bytes_environ = True

def chdir(path):
    __BRYTHON__.curdir = path

def fsencode(filename):
    """
    Encode filename to the filesystem encoding with 'surrogateescape' error
    handler, return bytes unchanged. On Windows, use 'strict' error handler if
    the file system encoding is 'mbcs' (which is the default encoding).
    """
    encoding = sys.getfilesystemencoding()
    errors = 'surrogateescape'
    if isinstance(filename, bytes):
        return filename
    elif isinstance(filename, str):
        return filename.encode(encoding, errors)
    else:
        raise TypeError("expect bytes or str, not %s" % type(filename).__name__)

def fsdecode(filename):
    """
    Decode filename from the filesystem encoding with 'surrogateescape' error
    handler, return str unchanged. On Windows, use 'strict' error handler if
    the file system encoding is 'mbcs' (which is the default encoding).
    """
    encoding = sys.getfilesystemencoding()
    errors = 'surrogateescape'
    if isinstance(filename, str):
        return filename
    elif isinstance(filename, bytes):
        return filename.decode(encoding, errors)
    else:
        raise TypeError("expect bytes or str, not %s" % type(filename).__name__)

def fspath(path):
    return path

def getcwd():
    return __BRYTHON__.curdir

class PathLike(abc.ABC):

    """Abstract base class for implementing the file system path protocol."""

    @abc.abstractmethod
    def __fspath__(self):
        """Return the file system path representation of the object."""
        raise NotImplementedError

    @classmethod
    def __subclasshook__(cls, subclass):
        return hasattr(subclass, '__fspath__')


if name == 'nt':
    class _AddedDllDirectory:
        def __init__(self, path, cookie, remove_dll_directory):
            self.path = path
            self._cookie = cookie
            self._remove_dll_directory = remove_dll_directory
        def close(self):
            self._remove_dll_directory(self._cookie)
            self.path = None
        def __enter__(self):
            return self
        def __exit__(self, *args):
            self.close()
        def __repr__(self):
            if self.path:
                return "<AddedDllDirectory({!r})>".format(self.path)
            return "<AddedDllDirectory()>"

    def add_dll_directory(path):
        """Add a path to the DLL search path.

        This search path is used when resolving dependencies for imported
        extension modules (the module itself is resolved through sys.path),
        and also by ctypes.

        Remove the directory by calling close() on the returned object or
        using it in a with statement.
        """
        import nt
        cookie = nt._add_dll_directory(path)
        return _AddedDllDirectory(
            path,
            cookie,
            nt._remove_dll_directory
        )


def scandir(*args, **kw):
    raise NotImplementedError('browsers cannot read a directory content')

def waitstatus_to_exitcode(status):
    return status >> 8

_set = set()

supports_dir_fd = _set

supports_effective_ids = _set

supports_fd = _set

supports_follow_symlinks = _set

