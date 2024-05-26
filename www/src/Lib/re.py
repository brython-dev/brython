import enum


class _compiler:
    SRE_FLAG_IGNORECASE = 2
    SRE_FLAG_LOCALE = 4
    SRE_FLAG_MULTILINE = 8
    SRE_FLAG_DOTALL = 16
    SRE_FLAG_UNICODE = 32
    SRE_FLAG_VERBOSE = 64
    SRE_FLAG_DEBUG = 128
    SRE_FLAG_ASCII = 256
    SRE_INFO_PREFIX = 1
    SRE_INFO_LITERAL = 2
    SRE_INFO_CHARSET = 4

@enum.global_enum
@enum._simple_enum(enum.IntFlag, boundary=enum.KEEP)
class RegexFlag:
    NOFLAG = 0
    ASCII = A = _compiler.SRE_FLAG_ASCII # assume ascii "locale"
    IGNORECASE = I = _compiler.SRE_FLAG_IGNORECASE # ignore case
    LOCALE = L = _compiler.SRE_FLAG_LOCALE # assume current 8-bit locale
    UNICODE = U = _compiler.SRE_FLAG_UNICODE # assume unicode "locale"
    MULTILINE = M = _compiler.SRE_FLAG_MULTILINE # make anchors look for newline
    DOTALL = S = _compiler.SRE_FLAG_DOTALL # make dot match newline
    VERBOSE = X = _compiler.SRE_FLAG_VERBOSE # ignore whitespace and comments
    # sre extensions (experimental, don't rely on these)
    # TEMPLATE = T = _compiler.SRE_FLAG_TEMPLATE # unknown purpose, deprecated
    DEBUG = _compiler.SRE_FLAG_DEBUG # dump pattern after compilation
    __str__ = object.__str__
    _numeric_repr_ = hex


from python_re import *
from browser import console


import python_re
_compile = python_re._compile
_reconstructor = python_re._reconstructor

python_re._reconstructor.__module__ = 're'