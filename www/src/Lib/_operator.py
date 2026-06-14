"""Brython-specific.
Only implements _compare_digest because it is used in hmac module."""

@staticmethod
def _compare_digest(a, b):
    """Return 'a == b'.
    This function uses an approach designed to prevent
    timing analysis, making it appropriate for cryptography.

    a and b must both be of the same type: either str (ASCII only),
    or any bytes-like object.

    Note: If a and b are of different lengths, or if an error occurs,
    a timing attack could theoretically reveal information about the
    types and lengths of a and b--but not their values."""
    if isinstance(a, str) and isinstance(b, str):
        if not (a.isascii() and b.isascii()):
            raise TypeError("unsupported operand types")
        # a[:] forces a primitive str (a str subclass is not directly iterable)
        va = [ord(c) for c in a[:]]
        vb = [ord(c) for c in b[:]]
    elif isinstance(a, (bytes, bytearray)) and isinstance(b, (bytes, bytearray)):
        va = list(a)
        vb = list(b)
    else:
        raise TypeError("unsupported operand types")
    # constant-time: never use == (a bytes/str subclass may override __eq__)
    result = len(va) ^ len(vb)
    if len(va) != len(vb):
        vb = va
    for x, y in zip(va, vb):
        result |= x ^ y
    return result == 0

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
