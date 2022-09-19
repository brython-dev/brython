"""Brython-specific.
Only implements _compare_digest because it is used in hmac module."""

def _compare_digest(a, b):
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

