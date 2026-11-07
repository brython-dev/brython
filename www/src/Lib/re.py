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

class PatternError(Exception):
    """Exception raised for invalid regular expressions.

    Attributes:

        msg: The unformatted error message
        pattern: The regular expression pattern
        pos: The index in the pattern where compilation failed (may be None)
        lineno: The line corresponding to pos (may be None)
        colno: The column corresponding to pos (may be None)
    """

    __module__ = 're'

    def __init__(self, msg, pattern=None, pos=None):
        self.msg = msg
        self.pattern = pattern
        self.pos = pos
        if pattern is not None and pos is not None:
            msg = '%s at position %d' % (msg, pos)
            if isinstance(pattern, str):
                newline = '\n'
            else:
                newline = b'\n'
            self.lineno = pattern.count(newline, 0, pos) + 1
            self.colno = pos - pattern.rfind(newline, 0, pos)
            if newline in pattern:
                msg = '%s (line %d, column %d)' % (msg, self.lineno, self.colno)
        else:
            self.lineno = self.colno = None
        super().__init__(msg)


# Backward compatibility after renaming in 3.13
error = PatternError


from python_re import *
import python_re
_reconstructor = python_re._reconstructor
python_re._reconstructor.__module__ = 're'