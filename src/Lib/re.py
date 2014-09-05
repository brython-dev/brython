#
# Copyright (c) 2014 Olemis Lang.  All rights reserved.
#
# Choose either Javascript (faster) or Python engine based on regex complexity
# with a noticeable preference for the former.
#

r"""Support for regular expressions (RE).

This module provides regular expression matching operations similar to
those found in Perl.  It supports both 8-bit and Unicode strings; both
the pattern and the strings being processed can contain null bytes and
characters outside the US ASCII range.

Regular expressions can contain both special and ordinary characters.
Most ordinary characters, like "A", "a", or "0", are the simplest
regular expressions; they simply match themselves.  You can
concatenate ordinary characters, so last matches the string 'last'.

The special characters are:
    "."      Matches any character except a newline.
    "^"      Matches the start of the string.
    "$"      Matches the end of the string or just before the newline at
             the end of the string.
    "*"      Matches 0 or more (greedy) repetitions of the preceding RE.
             Greedy means that it will match as many repetitions as possible.
    "+"      Matches 1 or more (greedy) repetitions of the preceding RE.
    "?"      Matches 0 or 1 (greedy) of the preceding RE.
    *?,+?,?? Non-greedy versions of the previous three special characters.
    {m,n}    Matches from m to n repetitions of the preceding RE.
    {m,n}?   Non-greedy version of the above.
    "\\"     Either escapes special characters or signals a special sequence.
    []       Indicates a set of characters.
             A "^" as the first character indicates a complementing set.
    "|"      A|B, creates an RE that will match either A or B.
    (...)    Matches the RE inside the parentheses.
             The contents can be retrieved or matched later in the string.
    (?aiLmsux) Set the A, I, L, M, S, U, or X flag for the RE (see below).
    (?:...)  Non-grouping version of regular parentheses.
    (?P<name>...) The substring matched by the group is accessible by name.
    (?P=name)     Matches the text matched earlier by the group named name.
    (?#...)  A comment; ignored.
    (?=...)  Matches if ... matches next, but doesn't consume the string.
    (?!...)  Matches if ... doesn't match next.
    (?<=...) Matches if preceded by ... (must be fixed length).
    (?<!...) Matches if not preceded by ... (must be fixed length).
    (?(id/name)yes|no) Matches yes pattern if the group with id/name matched,
                       the (optional) no pattern otherwise.

The special sequences consist of "\\" and a character from the list
below.  If the ordinary character is not on the list, then the
resulting RE will match the second character.
    \number  Matches the contents of the group of the same number.
    \A       Matches only at the start of the string.
    \Z       Matches only at the end of the string.
    \b       Matches the empty string, but only at the start or end of a word.
    \B       Matches the empty string, but not at the start or end of a word.
    \d       Matches any decimal digit; equivalent to the set [0-9] in
             bytes patterns or string patterns with the ASCII flag.
             In string patterns without the ASCII flag, it will match the whole
             range of Unicode digits.
    \D       Matches any non-digit character; equivalent to [^\d].
    \s       Matches any whitespace character; equivalent to [ \t\n\r\f\v] in
             bytes patterns or string patterns with the ASCII flag.
             In string patterns without the ASCII flag, it will match the whole
             range of Unicode whitespace characters.
    \S       Matches any non-whitespace character; equivalent to [^\s].
    \w       Matches any alphanumeric character; equivalent to [a-zA-Z0-9_]
             in bytes patterns or string patterns with the ASCII flag.
             In string patterns without the ASCII flag, it will match the
             range of Unicode alphanumeric characters (letters plus digits
             plus underscore).
             With LOCALE, it will match the set [0-9_] plus characters defined
             as letters for the current locale.
    \W       Matches the complement of \w.
    \\       Matches a literal backslash.

This module exports the following functions:
    match    Match a regular expression pattern to the beginning of a string.
    search   Search a string for the presence of a pattern.
    sub      Substitute occurrences of a pattern found in a string.
    subn     Same as sub, but also return the number of substitutions made.
    split    Split a string by the occurrences of a pattern.
    findall  Find all occurrences of a pattern in a string.
    finditer Return an iterator yielding a match object for each match.
    compile  Compile a pattern into a RegexObject.
    purge    Clear the regular expression cache.
    escape   Backslash all non-alphanumerics in a string.

Some of the functions in this module takes flags as optional parameters:
    A  ASCII       For string patterns, make \w, \W, \b, \B, \d, \D
                   match the corresponding ASCII character categories
                   (rather than the whole Unicode categories, which is the
                   default).
                   For bytes patterns, this flag is the only available
                   behaviour and needn't be specified.
    I  IGNORECASE  Perform case-insensitive matching.
    L  LOCALE      Make \w, \W, \b, \B, dependent on the current locale.
    M  MULTILINE   "^" matches the beginning of lines (after a newline)
                   as well as the string.
                   "$" matches the end of lines (before a newline) as well
                   as the end of the string.
    S  DOTALL      "." matches any character at all, including the newline.
    X  VERBOSE     Ignore whitespace and comments for nicer looking RE's.
    U  UNICODE     For compatibility only. Ignored for string patterns (it
                   is the default), and forbidden for bytes patterns.

This module also defines an exception 'error'.

"""
import sys
import _jsre
_pymdl = [None]

if not _jsre._is_valid():
   from pyre import *

# public symbols
__all__ = [ "match", "search", "sub", "subn", "split", "findall",
    "compile", "purge", "template", "escape", "A", "I", "L", "M", "S", "X",
    "U", "ASCII", "IGNORECASE", "LOCALE", "MULTILINE", "DOTALL", "VERBOSE",
    "UNICODE", 
    # TODO: brython - same exception class in sre_constants and _jsre
    #"error" 
    ]

__version__ = "2.2.1"

# flags
A = ASCII = _jsre.A # assume ascii "locale"
I = IGNORECASE = _jsre.I # ignore case
L = LOCALE = _jsre.L # assume current 8-bit locale
U = UNICODE = _jsre.U # assume unicode "locale"
M = MULTILINE = _jsre.M # make anchors look for newline
S = DOTALL = _jsre.S # make dot match newline
X = VERBOSE = _jsre.X # ignore whitespace and comments

# sre exception
# TODO: brython - same exception class in sre_constants and _jsre
#error = sre_compile.error

# --------------------------------------------------------------------
# public interface

def _pyre():
    mdl = _pymdl[0]
    if mdl is None:
       import pyre
       _pymdl[0] = pyre
       return pyre

    return mdl

# --------------------------------------------------------------------
# public interface

def match(pattern, string, flags=0):
    """Try to apply the pattern at the start of the string, returning
    a match object, or None if no match was found."""
    
    if not isinstance(pattern, str):
       return pattern.match(string, flags)

    if _jsre._is_valid(pattern):
       return _jsre.match(pattern, string, flags)

    return _pyre().match(pattern, string, flags)

def search(pattern, string, flags=0):
    """Scan through string looking for a match to the pattern, returning
    a match object, or None if no match was found."""

    if not isinstance(pattern, str):
       return pattern.search(string, flags)

    if _jsre._is_valid(pattern):
       return _jsre.search(pattern, string, flags)

    return _pyre().search(pattern, string, flags)


def sub(pattern, repl, string, count=0, flags=0):
    """Return the string obtained by replacing the leftmost
    non-overlapping occurrences of the pattern in string by the
    replacement repl.  repl can be either a string or a callable;
    if a string, backslash escapes in it are processed.  If it is
    a callable, it's passed the match object and must return
    a replacement string to be used."""

    if not isinstance(pattern, str):
       return pattern.sub(repl, string, count, flags)

    if _jsre._is_valid(pattern):
        return _jsre.sub(pattern, repl, string, count, flags)
    
    return _pyre().sub(pattern, repl, string, count, flags)

def subn(pattern, repl, string, count=0, flags=0):
    """Return a 2-tuple containing (new_string, number).
    new_string is the string obtained by replacing the leftmost
    non-overlapping occurrences of the pattern in the source
    string by the replacement repl.  number is the number of
    substitutions that were made. repl can be either a string or a
    callable; if a string, backslash escapes in it are processed.
    If it is a callable, it's passed the match object and must
    return a replacement string to be used."""

    if not isinstance(pattern, str):
       return pattern.subn(repl, string, count, flags)

    if _jsre._is_valid(pattern):
        return _jsre.subn(pattern, repl, string, count, flags)

    return _pyre().subn(pattern, repl, string, count, flags)

def split(pattern, string, maxsplit=0, flags=0):
    """Split the source string by the occurrences of the pattern,
    returning a list containing the resulting substrings.  If
    capturing parentheses are used in pattern, then the text of all
    groups in the pattern are also returned as part of the resulting
    list.  If maxsplit is nonzero, at most maxsplit splits occur,
    and the remainder of the string is returned as the final element
    of the list."""

    if not isinstance(pattern, str):
       return pattern.split(string, maxsplit, flags)

    if _jsre._is_valid(pattern):
        return _jsre.split(pattern, string, maxsplit, flags)

    return _pyre().split(pattern, string, maxsplit, flags)

def findall(pattern, string, flags=0):
    """Return a list of all non-overlapping matches in the string.

    If one or more capturing groups are present in the pattern, return
    a list of groups; this will be a list of tuples if the pattern
    has more than one group.

    Empty matches are included in the result."""

    if not isinstance(pattern, str):
       return pattern.findall(pattern, string, flags)

    if _jsre._is_valid(pattern):
        return _jsre.findall(pattern, string, flags)
    else:
        return _pyre().findall(pattern, string, flags)

def finditer(pattern, string, flags=0):
    """Return an iterator over all non-overlapping matches in the
       string.  For each match, the iterator returns a match object.

       Empty matches are included in the result."""

    return _pyre().finditer(pattern, string, flags)

def compile(pattern, flags=0):
    "Compile a regular expression pattern, returning a pattern object."

    if _jsre._is_valid(pattern):
       return _jsre.compile(pattern, flags)

    return _pyre().compile(pattern, flags)

def purge():
    "Clear the regular expression caches"
    if _pymdl[0] is not None:
        return _pymdl[0].purge()

def template(pattern, flags=0):
    "Compile a template pattern, returning a pattern object"
    return _pyre().template(pattern, flags)

def escape(pattern):
    """
    Escape all the characters in pattern except ASCII letters, numbers and '_'.
    """
    # FIXME: Do not load _re module
    return _pyre().escape(pattern)
