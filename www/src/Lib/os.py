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

# unicode environ
environ = {'HOME': __BRYTHON__.curdir}

def getenv(key, default=None):
    """Get an environment variable, return None if it doesn't exist.
    The optional second argument can specify an alternate default.
    key, default and the result are str."""
    return environ.get(key, default)

supports_bytes_environ = True

def chdir(path):
    __BRYTHON__.curdir = path

def getcwd():
    return __BRYTHON__.curdir
    