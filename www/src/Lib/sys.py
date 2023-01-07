# hack to return special attributes
from _sys import *

import browser
import javascript

class Error(Exception):
    pass

_getframe = Getframe

abiflags = 0 # required in sysconfig

def audit(event, *args):
    """For the moment, only here for compliance with Python."""
    pass

brython_debug_mode = __BRYTHON__.debug

base_exec_prefix = __BRYTHON__.brython_path

base_prefix = __BRYTHON__.brython_path

builtin_module_names = __BRYTHON__.builtin_module_names

byteorder = 'little'

dont_write_bytecode = True

exec_prefix = __BRYTHON__.brython_path

if hasattr(__BRYTHON__, 'full_url'):
    executable = __BRYTHON__.full_url.address + 'brython.js'
else:
    executable = __BRYTHON__.brython_path + 'brython.js'

argv = orig_argv = [__BRYTHON__.script_path]

def displayhook(value):
    if value is not None:
        stdout.write(repr(value))

__displayhook__ = displayhook

def exit(i=None):
    raise SystemExit('')

class flag_class:

  def __init__(self):
      self.debug = 0
      self.inspect = 0
      self.interactive = 0
      self.optimize = 0
      self.dont_write_bytecode = 0
      self.no_user_site = 0
      self.no_site = 0
      self.ignore_environment = 0
      self.verbose = 0
      self.bytes_warning = 0
      self.quiet = 0
      self.hash_randomization = 1
      self.isolated = 0
      self.dev_mode = False
      self.utf8_mode = 0
      self.warn_default_encoding = 0

flags = flag_class()

def getfilesystemencoding(*args, **kw):
    """getfilesystemencoding() -> string
    Return the encoding used to convert Unicode filenames in
    operating system filenames."""
    return 'utf-8'

def getfilesystemencodeerrors():
    return "utf-8"

def intern(string):
    return string

class int_info:
    bits_per_digit = 30
    sizeof_digit = 4
    default_max_str_digits = __BRYTHON__.int_max_str_digits
    str_digits_check_threshold = __BRYTHON__.str_digits_check_threshold

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

platform = "brython"

platlibdir = __BRYTHON__.brython_path + 'Lib'

prefix = __BRYTHON__.brython_path

stdlib_module_names = frozenset(__BRYTHON__.stdlib_module_names)

version = '.'.join(str(x) for x in __BRYTHON__.version_info[:3])
version += " (default, %s) \n[Javascript 1.5] on Brython" \
    % __BRYTHON__.compiled_date
hexversion = 0x030800f0   # python 3.8

class _version_info:

    def __init__(self, version_info):
        self.version_info = version_info
        self.major = version_info[0]
        self.minor = version_info[1]
        self.micro = version_info[2]
        self.releaselevel = version_info[3]
        self.serial = version_info[4]

    def __getitem__(self, index):
        if isinstance(self.version_info[index], list):
           return tuple(self.version_info[index])
        return self.version_info[index]

    def hexversion(self):
        try:
            return '0%d0%d0%d' % (self.major, self.minor, self.micro)
        finally:  #probably some invalid char in minor (rc, etc)
            return '0%d0000' % (self.major)

    def __str__(self):
        _s = "sys.version(major=%d, minor=%d, micro=%d, releaselevel='%s', " \
            "serial=%d)"
        return _s % (self.major, self.minor, self.micro,
                     self.releaselevel, self.serial)

    def __eq__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) == other

        raise Error("Error! I don't know how to compare!")

    def __ge__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) >= other

        raise Error("Error! I don't know how to compare!")

    def __gt__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) > other

        raise Error("Error! I don't know how to compare!")

    def __le__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) <= other

        raise Error("Error! I don't know how to compare!")

    def __lt__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) < other

        raise Error("Error! I don't know how to compare!")

    def __ne__(self, other):
        if isinstance(other, tuple):
           return (self.major, self.minor, self.micro) != other

        raise Error("Error! I don't know how to compare!")


#eventually this needs to be the real python version such as 3.0, 3.1, etc
version_info = _version_info(__BRYTHON__.version_info)

class SimpleNamespace:

    def __init__(self, /, **kwargs):
        self.__dict__.update(kwargs)

    def __repr__(self):
        items = (f"{k}={v!r}" for k, v in self.__dict__.items())
        return "{}({})".format("namespace", ", ".join(items))

    def __eq__(self, other):
        if isinstance(self, SimpleNamespace) and isinstance(other, SimpleNamespace):
           return self.__dict__ == other.__dict__
        return NotImplemented

SimpleNamespace.__module__ = "types"

vi = _version_info(__BRYTHON__.implementation)
implementation = SimpleNamespace(name = "brython",
    version=vi,
    hexversion = vi.hexversion(),
    cache_tag = None)

class _hash_info:

  def __init__(self):
      self.width = 32
      self.modulus = 2147483647
      self.inf = 314159
      self.nan = 0
      self.imag = 1000003
      self.algorithm = 'siphash24'
      self.hash_bits = 64
      self.seed_bits = 128
      cutoff=0

  def __repr__(self):
      #fix me
      return "sys.hash_info(width=32, modulus=2147483647, inf=314159, " \
          "nan=0, imag=1000003, algorithm='siphash24', hash_bits=64, " \
          "seed_bits=128, cutoff=0)"

hash_info = _hash_info()

class _float_info:
    """
 |  A structseq holding information about the float type. It contains low level
 |  information about the precision and internal representation.
 |
 |  Brython's float is based on Javascript's Number type which is a
 |  double-precision 64-bit binary format IEEE 754 value
 |  (number between -(2**53 -1) and 2**53 -1). For more information see:
 |
 |     https://developer.mozilla.org/cs/docs/Web/JavaScript/Data_structures
 |     http://en.wikipedia.org/wiki/Double_precision_floating-point_format
 |
 |  ----------------------------------------------------------------------
 |  Data descriptors defined here:
 |
 |  dig
 |      DBL_DIG -- digits
 |
 |  epsilon
 |      DBL_EPSILON -- Difference between 1 and the next representable float
 |
 |  mant_dig
 |      DBL_MANT_DIG -- mantissa digits
 |
 |  max
 |      DBL_MAX -- maximum representable finite float
 |
 |  max_10_exp
 |      DBL_MAX_10_EXP -- maximum int e such that 10**e is representable
 |
 |  max_exp
 |      DBL_MAX_EXP -- maximum int e such that radix**(e-1) is representable
 |
 |  min
 |      DBL_MIN -- Minimum positive normalized float
 |
 |  min_10_exp
 |      DBL_MIN_10_EXP -- minimum int e such that 10**e is a normalized float
 |
 |  min_exp
 |      DBL_MIN_EXP -- minimum int e such that radix**(e-1) is a normalized float
 |
 |  radix
 |      FLT_RADIX -- radix of exponent
 |
 |  rounds
 |      FLT_ROUNDS -- integer constant representing the rounding mode used for arithmetic operations. This reflects the value of the system FLT_ROUNDS macro at
 |                    interpreter startup time. See section 5.2.4.2.2 of the C99 standard for an explanation of the possible values and their meanings.
    """
    def __init__(self):
        self.dig = 15
        self.epsilon = 2 ** -52
        self.mant_dig = 53
        self.max = __BRYTHON__.MAX_VALUE
        self.max_exp = 2 ** 10
        self.max_10_exp = 308
        self.min = __BRYTHON__.MIN_VALUE
        self.min_exp = -1021
        self.min_10_exp = -307
        self.radix = 2
        self.rounds = 1
        self._tuple = (self.max, self.max_exp, self.max_10_exp, self.min,
            self.min_exp, self.min_10_exp, self.dig, self.mant_dig, self.epsilon,
            self.radix, self.rounds)

    def __getitem__(self, k):
        return self._tuple[k]

    def __iter__(self):
        return iter(self._tuple)

float_info = _float_info()

warnoptions = []

def getfilesystemencoding():
    return 'utf-8'

## __stdxxx__ contains the original values of sys.stdxxx
__stdout__ = stdout
__stderr__ = stderr
__stdin__ = stdin

__excepthook__ = excepthook # from _sys
