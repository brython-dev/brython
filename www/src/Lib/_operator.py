"""Brython-specific.
Only implements _compare_digest because it is used in hmac module."""

def _compare_digest_impl(a, b):
    """Return 'a == b'.
    This function uses an approach designed to prevent
    timing analysis, making it appropriate for cryptography.

    a and b must both be of the same type: either str (ASCII only),
    or any bytes-like object.

    Note: If a and b are of different lengths, or if an error occurs,
    a timing attack could theoretically reveal information about the
    types and lengths of a and b--but not their values."""
    if isinstance(a, str) and isinstance(b, str) and \
            a.isascii() and b.isascii():
        return a == b
    elif isinstance(a, bytes) and isinstance(b, bytes):
        return a == b
    raise TypeError("unsupported operand types")


# CPython exposes `_compare_digest` as a C builtin — assigning it as a class
# attribute (`class T: compare_digest = hmac.compare_digest`) does NOT bind
# to the instance, because builtin functions skip the descriptor protocol.
# A plain `def` is a regular function whose `__get__` binds to the instance,
# so `self.compare_digest(a, b)` ends up calling `_compare_digest(self, a,
# b)` — one extra argument that breaks `test_hmac.HMACCompareDigestTestCase`.
# The wrapper below mimics CPython's no-bind behaviour by implementing a
# `__get__` that returns itself unbound.
class _NonBindingFunction:
    """Behave like a callable but skip method-binding when accessed via
    a class instance — mirrors a CPython builtin function's descriptor
    behaviour. Used by `_compare_digest` so that
    `class T: compare_digest = hmac.compare_digest; T().compare_digest(a, b)`
    calls the underlying function with exactly `(a, b)`, not `(self, a, b)`.
    """
    def __init__(self, f):
        self._f = f
        self.__name__ = getattr(f, '__name__', '<unbound>')
    def __call__(self, *args, **kwargs):
        return self._f(*args, **kwargs)
    def __get__(self, obj, owner=None):
        return self

_compare_digest = _NonBindingFunction(_compare_digest_impl)

def index(a):
    # See https://stackoverflow.com/questions/65551469/operator-index-with-custom-class-instance
    # for the reason this implementation is necessary.

    try:
        index_method = a.__index__
    except AttributeError as e:
        # For compatibility with CPython (and also PyPy), raise a TypeError here instead of an AttributeError.
        raise TypeError(f"'{type(a)}' object cannot be interpreted as an integer") from e
    else:
        return index_method()
