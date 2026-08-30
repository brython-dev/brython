"""Minimal pure-Python subset of ctypes for Brython.

Brython runs in a JavaScript engine and cannot load native libraries, so
this module only provides what pure-Python packages commonly use to probe
the platform: the fundamental C type classes, sizeof()/alignment(), and
byref/pointer stubs.  Loading shared libraries raises OSError.

Sizes follow a 32-bit (wasm32-like) data model, matching what CPython
reports on WebAssembly platforms.
"""

class _SimpleCData:
    _size_ = 4
    _align_ = 4

    def __init__(self, value=None):
        self.value = value

    def __repr__(self):
        return f"{type(self).__name__}({self.value!r})"


class c_bool(_SimpleCData):
    _type_ = "?"
    _size_ = 1
    _align_ = 1

class c_char(_SimpleCData):
    _type_ = "c"
    _size_ = 1
    _align_ = 1

class c_byte(_SimpleCData):
    _type_ = "b"
    _size_ = 1
    _align_ = 1

class c_ubyte(_SimpleCData):
    _type_ = "B"
    _size_ = 1
    _align_ = 1

class c_short(_SimpleCData):
    _type_ = "h"
    _size_ = 2
    _align_ = 2

class c_ushort(_SimpleCData):
    _type_ = "H"
    _size_ = 2
    _align_ = 2

class c_int(_SimpleCData):
    _type_ = "i"

class c_uint(_SimpleCData):
    _type_ = "I"

class c_long(_SimpleCData):
    _type_ = "l"

class c_ulong(_SimpleCData):
    _type_ = "L"

class c_longlong(_SimpleCData):
    _type_ = "q"
    _size_ = 8
    _align_ = 8

class c_ulonglong(_SimpleCData):
    _type_ = "Q"
    _size_ = 8
    _align_ = 8

class c_size_t(_SimpleCData):
    _type_ = "N"

class c_ssize_t(_SimpleCData):
    _type_ = "n"

class c_float(_SimpleCData):
    _type_ = "f"

class c_double(_SimpleCData):
    _type_ = "d"
    _size_ = 8
    _align_ = 8

class c_char_p(_SimpleCData):
    _type_ = "z"

class c_wchar_p(_SimpleCData):
    _type_ = "Z"

class c_wchar(_SimpleCData):
    _type_ = "u"

class c_void_p(_SimpleCData):
    _type_ = "P"

c_int8 = c_byte
c_uint8 = c_ubyte
c_int16 = c_short
c_uint16 = c_ushort
c_int32 = c_int
c_uint32 = c_uint
c_int64 = c_longlong
c_uint64 = c_ulonglong


def sizeof(obj_or_type):
    if isinstance(obj_or_type, type):
        return getattr(obj_or_type, "_size_", 4)
    return getattr(type(obj_or_type), "_size_", 4)

def alignment(obj_or_type):
    if isinstance(obj_or_type, type):
        return getattr(obj_or_type, "_align_", 4)
    return getattr(type(obj_or_type), "_align_", 4)

def byref(obj, offset=0):
    raise NotImplementedError("ctypes.byref is not supported in Brython")

def pointer(obj):
    raise NotImplementedError("ctypes.pointer is not supported in Brython")

def POINTER(cls):
    raise NotImplementedError("ctypes.POINTER is not supported in Brython")

def cast(obj, typ):
    raise NotImplementedError("ctypes.cast is not supported in Brython")

def create_string_buffer(init, size=None):
    raise NotImplementedError(
        "ctypes.create_string_buffer is not supported in Brython")


class ArgumentError(Exception):
    pass


class CDLL:
    def __init__(self, name, *args, **kw):
        raise OSError(
            "ctypes cannot load shared libraries in Brython: %r" % (name,))

PyDLL = CDLL
OleDLL = CDLL
WinDLL = CDLL


class LibraryLoader:
    def __init__(self, dlltype):
        self._dlltype = dlltype

    def LoadLibrary(self, name):
        return self._dlltype(name)

    __getattr__ = LoadLibrary

cdll = LibraryLoader(CDLL)
pydll = LibraryLoader(PyDLL)
