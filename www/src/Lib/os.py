"""Limited version of os module: only keep what is more or less relevant in a
browser context
"""

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

_set = set()

supports_dir_fd = _set

supports_effective_ids = _set

supports_fd = _set

supports_follow_symlinks = _set

