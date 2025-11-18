# hack to return special attributes
from _sys import *
import _sys

from browser import scope

_getframe = _sys._getframe

class _dataclass(tuple):

    def __init__(self, **kwargs):
        self.keys = list(kwargs)
        self.__dict__.update(kwargs)

    def __getitem__(self, key):
        if isinstance(key, int) and 0 <= key <= len(self.keys):
            return self.__dict__[self.keys[key]]
        elif isinstance(key, slice):
            return [self.__dict__[k] for k in self.keys[key]]
        raise KeyError(key)

    def __iter__(self):
        return (self.__dict__[key] for key in self.keys)

    def __len__(self):
        return len(self.keys)

    def __repr__(self):
        s = ', '.join(f'{k}={self.__dict__[k]!r}' for k in self.keys)
        return f'sys.{self.__class__.__name__}({s})'


def make_dataclass(name, bases=None):
    bases = [_dataclass] if bases is None else [*bases, _dataclass]
    cls = type(name, bases, {})
    return cls


__breakpointhook__ = breakpointhook

abiflags = 0 # required in sysconfig

def audit(event, *args):
    """For the moment, only here for compliance with Python."""
    pass

brython_debug_mode = __BRYTHON__.get_option('debug')

base_exec_prefix = __BRYTHON__.brython_path

base_prefix = __BRYTHON__.brython_path

builtin_module_names = __BRYTHON__.builtin_module_names

byteorder = 'little'

copyright = """Copyright (c) 2001-2023 Python Software Foundation.
All Rights Reserved.

Copyright (c) 2000 BeOpen.com.
All Rights Reserved.

Copyright (c) 1995-2001 Corporation for National Research Initiatives.
All Rights Reserved.

Copyright (c) 1991-1995 Stichting Mathematisch Centrum, Amsterdam.
All Rights Reserved."""

dont_write_bytecode = True

exec_prefix = __BRYTHON__.brython_path

argv = orig_argv = [__BRYTHON__.script_path] + list(__BRYTHON__.get_option('args'))

def displayhook(value):
    if value is not None:
        stdout.write(repr(value))

__displayhook__ = displayhook

def exit(i=None):
    raise SystemExit('')

flags = make_dataclass('flags')(
      debug = 0,
      inspect = 0,
      interactive = 0,
      optimize = 0,
      dont_write_bytecode = 0,
      no_user_site = 0,
      no_site = 0,
      ignore_environment = 0,
      verbose = 0,
      bytes_warning = 0,
      quiet = 0,
      hash_randomization = 1,
      isolated = 0,
      dev_mode = False,
      utf8_mode = 0,
      warn_default_encoding = 0,
      context_aware_warnings = 0,
      thread_inherit_context = True
      )

def getfilesystemencoding(*args, **kw):
    """getfilesystemencoding() -> string
    Return the encoding used to convert Unicode filenames in
    operating system filenames."""
    return 'utf-8'

def getfilesystemencodeerrors():
    return "utf-8"

def intern(string):
    return string

int_info = make_dataclass('int_info')(
    bits_per_digit = 30,
    sizeof_digit = 4,
    default_max_str_digits = __BRYTHON__.int_max_str_digits,
    str_digits_check_threshold = __BRYTHON__.str_digits_check_threshold)

def get_int_max_str_digits():
    return __BRYTHON__.int_max_str_digits

def set_int_max_str_digits(value):
    try:
        value = int(value)
    except:
        raise ValueError(f"'{value.__class__.__name__}' object "
            "cannot be interpreted as an integer")
    if value != 0 and value < int_info.str_digits_check_threshold:
        raise ValueError('maxdigits must be 0 or larger than 640')
    __BRYTHON__.int_max_str_digits = value

# maximum array size
maxsize = __BRYTHON__.max_array_size

maxunicode = 1114111

# a unique name accross all OS is required. Stdlib module sysconfig imports
# _sysconfigdata_{sys.abiflags}_{sys.platform}_{multiarch}
platform = 'brython'

platlibdir = __BRYTHON__.brython_path + 'Lib'

prefix = __BRYTHON__.brython_path

pycache_prefix = None

stdlib_module_names = frozenset(__BRYTHON__.stdlib_module_names)

def unraisablehook(unraisable, /):
    pass # not applicable to Brython, here for compliance

__unraisablehook__ = unraisablehook

version = '.'.join(str(x) for x in __BRYTHON__.version_info[:3])
version += " (default, %s) \n[Javascript 1.5] on Brython" \
    % __BRYTHON__.compiled_date

class _comparable:

    def __eq__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) == other

        return NotImplemented

    def __ge__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) >= other

        return NotImplemented

    def __gt__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) > other

        return NotImplemented

    def __le__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) <= other

        return NotImplemented

    def __lt__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) < other

        return NotImplemented

    def __ne__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) != other

        return NotImplemented

#eventually this needs to be the real python version such as 3.0, 3.1, etc
version_info = make_dataclass('version_info', [_comparable])(
    major = __BRYTHON__.version_info[0],
    minor = __BRYTHON__.version_info[1],
    micro = __BRYTHON__.version_info[2],
    releaselevel = __BRYTHON__.version_info[3],
    serial = __BRYTHON__.version_info[4])


class SimpleNamespace:

    def __init__(self, /, **kwargs):
        self.keys = list(kwargs)
        self.__dict__.update(kwargs)

    def __getitem__(self, key):
        if isinstance(key, int) and 0 <= key <= len(self.keys):
            return getattr(self, self.keys[key])
        raise KeyError(key)

    def __iter__(self):
        return iter(self.__dict__.values())

    def __repr__(self):
        items = (f"{k}={v!r}" for k, v in self.__dict__.items()
            if k in self.keys)
        return f"namespace({', '.join(items)})"

    def __eq__(self, other):
        if isinstance(self, SimpleNamespace) and isinstance(other, SimpleNamespace):
           return self.__dict__ == other.__dict__
        return NotImplemented


SimpleNamespace.__module__ = "types"

hexversion = ((__BRYTHON__.version_info[0] << 24) +
                  ( __BRYTHON__.version_info[1] << 16) +
                  ( __BRYTHON__.version_info[2] << 8))

_implementation_info = make_dataclass('version_info', [_comparable])(
    major = __BRYTHON__.implementation[0],
    minor = __BRYTHON__.implementation[1],
    micro = __BRYTHON__.implementation[2],
    releaselevel = __BRYTHON__.implementation[3],
    serial = __BRYTHON__.implementation[4])

implementation = SimpleNamespace(
    name = 'Brython',
    cache_tag = None,
    version = _implementation_info,
    hexversion = hexversion
    )

hash_info = make_dataclass('hash_info')(
      width = 32,
      modulus = 2147483647,
      inf = 314159,
      nan = 0,
      imag = 1000003,
      algorithm = 'siphash24',
      hash_bits = 64,
      seed_bits = 128,
      cutoff=0
    )

float_info = make_dataclass('float_info')(
        dig = 15,
        epsilon = 2 ** -52,
        mant_dig = 53,
        max = __BRYTHON__.MAX_VALUE,
        max_exp = 2 ** 10,
        max_10_exp = 308,
        min = __BRYTHON__.MIN_VALUE,
        min_exp = -1021,
        min_10_exp = -307,
        radix = 2,
        rounds = 1
    )

warnoptions = []

def getfilesystemencoding():
    return 'utf-8'

_events = SimpleNamespace(
    NO_EVENTS=0,
    PY_START=1,
    PY_RESUME=2,
    PY_RETURN=4,
    PY_YIELD=8,
    CALL=16,
    LINE=32,
    INSTRUCTION=64,
    JUMP=128,
    BRANCH_LEFT=256,
    BRANCH_RIGHT=512,
    STOP_ITERATION=1024,
    RAISE=2048,
    EXCEPTION_HANDLED=4096,
    PY_UNWIND=8192,
    PY_THROW=16384,
    RERAISE=32768,
    C_RETURN=65536,
    C_RAISE=131072,
    BRANCH=262144
    )

class _monitoring:

    events = _events

_ModuleType = type(_sys)
monitoring = _ModuleType('monitoring', None)
monitoring.events = _events
monitoring.DEBUGGER_ID = 0
monitoring.COVERAGE_ID = 1
monitoring.PROFILER_ID = 2
monitoring.DISABLE = None #<object object at 0x00007FFC95225080>
monitoring.MISSING = None #<object object at 0x00007FFC95225090>
monitoring.OPTIMIZER_ID = 5

class _JIT:

    def is_available(self):
        return False

    def is_enabled(self):
        return False

    def is_active(self):
        return False

_jit = _JIT()

## __stdxxx__ contains the original values of sys.stdxxx
__stdout__ = stdout
__stderr__ = stderr
__stdin__ = stdin

__excepthook__ = excepthook # from _sys
