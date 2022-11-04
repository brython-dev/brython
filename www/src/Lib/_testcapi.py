CHAR_MAX = 127

CHAR_MIN = -128

DBL_MAX = 1.7976931348623157e+308

DBL_MIN = 2.2250738585072014e-308

FLT_MAX = 3.4028234663852886e+38

FLT_MIN = 1.1754943508222875e-38

INT_MAX = 2147483647

INT_MIN = -2147483648

LLONG_MAX = 9223372036854775807

LLONG_MIN = -9223372036854775808

LONG_MAX = 2147483647

LONG_MIN = -2147483648

PY_SSIZE_T_MAX = 2147483647

PY_SSIZE_T_MIN = -2147483648

SHRT_MAX = 32767

SHRT_MIN = -32768

SIZEOF_PYGC_HEAD = 16

UCHAR_MAX = 255

UINT_MAX = 4294967295

ULLONG_MAX = 18446744073709551615

ULONG_MAX = 4294967295

USHRT_MAX = 65535

__loader__ = "<_frozen_importlib.ExtensionFileLoader object at 0x00C98DD0>"

def _pending_threadfunc(*args,**kw):
    pass

class _test_structmembersType(object):
    pass

def _test_thread_state(*args,**kw):
    pass

def argparsing(*args,**kw):
    pass

def code_newempty(*args,**kw):
    pass

def codec_incrementaldecoder(*args,**kw):
    pass

def codec_incrementalencoder(*args,**kw):
    pass

def crash_no_current_thread(*args,**kw):
    pass

class error(Exception):
    pass

def exception_print(*args,**kw):
    pass

def getargs_B(*args,**kw):
    pass

def getargs_H(*args,**kw):
    pass

def getargs_I(*args,**kw):
    pass

def getargs_K(*args,**kw):
    pass

def getargs_L(*args,**kw):
    pass

def getargs_Z(*args,**kw):
    pass

def getargs_Z_hash(*args,**kw):
    pass

def getargs_b(*args,**kw):
    pass

def getargs_c(*args,**kw):
    pass

def getargs_h(*args,**kw):
    pass

def getargs_i(*args,**kw):
    pass

def getargs_k(*args,**kw):
    pass

def getargs_keyword_only(*args,**kw):
    pass

def getargs_keywords(*args,**kw):
    pass

def getargs_l(*args,**kw):
    pass

def getargs_n(*args,**kw):
    pass

def getargs_p(*args,**kw):
    pass

def getargs_s(*args,**kw):
    pass

def getargs_s_hash(*args,**kw):
    pass

def getargs_s_star(*args,**kw):
    pass

def getargs_tuple(*args,**kw):
    pass

def getargs_u(*args,**kw):
    pass

def getargs_u_hash(*args,**kw):
    pass

def getargs_w_star(*args,**kw):
    pass

def getargs_y(*args,**kw):
    pass

def getargs_y_hash(*args,**kw):
    pass

def getargs_y_star(*args,**kw):
    pass

def getargs_z(*args,**kw):
    pass

def getargs_z_hash(*args,**kw):
    pass

def getargs_z_star(*args,**kw):
    pass

class instancemethod(object):
    pass

def make_exception_with_doc(*args,**kw):
    pass

def make_memoryview_from_NULL_pointer(*args,**kw):
    pass

def parse_tuple_and_keywords(*args,**kw):
    pass

def pytime_object_to_time_t(*args,**kw):
    pass

def pytime_object_to_timespec(*args,**kw):
    pass

def pytime_object_to_timeval(*args,**kw):
    pass

def raise_exception(*args,**kw):
    pass

def raise_memoryerror(*args,**kw):
    pass

def run_in_subinterp(*args,**kw):
    pass

def set_exc_info(*args,**kw):
    pass

def test_L_code(*args,**kw):
    pass

def test_Z_code(*args,**kw):
    pass

def test_capsule(*args,**kw):
    pass

def test_config(*args,**kw):
    pass

def test_datetime_capi(*args,**kw):
    pass

def test_dict_iteration(*args,**kw):
    pass

def test_empty_argparse(*args,**kw):
    pass

def test_k_code(*args,**kw):
    pass

def test_lazy_hash_inheritance(*args,**kw):
    pass

def test_list_api(*args,**kw):
    pass

def test_long_and_overflow(*args,**kw):
    pass

def test_long_api(*args,**kw):
    pass

def test_long_as_double(*args,**kw):
    pass

def test_long_as_size_t(*args,**kw):
    pass

def test_long_long_and_overflow(*args,**kw):
    pass

def test_long_numbits(*args,**kw):
    pass

def test_longlong_api(*args,**kw):
    pass

def test_null_strings(*args,**kw):
    pass

def test_s_code(*args,**kw):
    pass

def test_string_from_format(*args,**kw):
    pass

def test_string_to_double(*args,**kw):
    pass

def test_u_code(*args,**kw):
    pass

def test_unicode_compare_with_ascii(*args,**kw):
    pass

def test_widechar(*args,**kw):
    pass

def test_with_docstring(*args,**kw):
    """This is a pretty normal docstring."""
    pass

def traceback_print(*args,**kw):
    pass

def unicode_aswidechar(*args,**kw):
    pass

def unicode_aswidecharstring(*args,**kw):
    pass

def unicode_encodedecimal(*args,**kw):
    pass

def unicode_transformdecimaltoascii(*args,**kw):
    pass

import math

def float_pack2(x, le):
    """Adapted from Objects/floatobject.c PyFloat_Pack2"""

    def overflow():
        raise OverflowError("float too large to pack with e format")

    if x == 0.0:
        sign = (math.copysign(1.0, x) == -1.0)
        e = 0
        bits = 0
    elif math.isinf(x):
        sign = (x < 0.0)
        e = 0x1f
        bits = 0
    elif math.isnan(x):
        sign = (math.copysign(1.0, x) == -1.0);
        e = 0x1f
        bits = 512
    else:
        sign = (x < 0.0)
        if sign:
            x = -x

        f, e = math.frexp(x);
        if f < 0.5 or f >= 1.0:
            raise SystemError("frexp() result out of range")

        # Normalize f to be in the range [1.0, 2.0)
        f *= 2.0
        e -= 1

        if e >= 16:
            overflow()
        elif e < -25:
            # |x| < 2**-25. Underflow to zero.
            f = 0.0
            e = 0
        elif e < -14:
            # |x| < 2**-14. Gradual underflow
            f = math.ldexp(f, 14 + e)
            e = 0
        else:
            e += 15
            f -= 1.0 # Get rid of leading 1

        f *= 1024.0; # 2**10
        # Round to even
        bits = int(f) & 0xFFFF # Note the truncation
        assert bits < 1024
        assert e < 31
        if (f - bits > 0.5) or ((f - bits == 0.5) and (bits % 2 == 1)):
            bits += 1
            if bits == 1024:
                # The carry propagated out of a string of 10 1 bits.
                bits = 0
                e += 1
                if e == 31:
                    overflow()

    bits |= (e << 10) | (sign << 15)

    # Write out result.
    p = 0
    incr = 1
    if le:
        p += 1
        incr = -1

    t = [None, None]
    # First byte
    t[p] = (bits >> 8) & 0xFF
    p += incr

    # Second byte
    t[p] = bits & 0xFF

    return t

unknown_format = 0
ieee_big_endian_format = 1
ieee_little_endian_format = 2

float_format = unknown_format

def float_pack4(x, le):
    """Adapted from Objects/floatobject.c PyFloat_Pack4"""

    def overflow():
        raise OverflowError("float too large to pack with f format")

    t = [None] * 4

    p = 0
    incr = 1

    if le:
        p += 3
        incr = -1

    if x < 0:
        sign = 1
        x = -x
    else:
        sign = 0

    f, e = math.frexp(x);

    # Normalize f to be in the range [1.0, 2.0)
    if 0.5 <= f and f < 1.0:
        f *= 2.0
        e -= 1
    elif f == 0.0:
        e = 0
    else:
        raise SystemError("frexp() result out of range")

    if e >= 128:
        overflow()
    elif e < -126:
        # Gradual underflow */
        f = math.ldexp(f, 126 + e)
        e = 0
    elif not (e == 0 and f == 0.0):
        e += 127
        f -= 1.0 # Get rid of leading 1

    f *= 8388608.0 # 2**23
    fbits = int(f + 0.5) # Round
    assert fbits <= 8388608
    if fbits >> 23:
        # The carry propagated out of a string of 23 1 bits.
        fbits = 0
        e += 1
        if e >= 255:
            overflow()

    # First byte
    t[p] = (sign << 7) | (e >> 1)
    p += incr

    # Second byte
    t[p] = ((e & 1) << 7) | (fbits >> 16)
    p += incr

    # Third byte
    t[p] = (fbits >> 8) & 0xFF
    p += incr

    # Fourth byte
    t[p] = fbits & 0xFF

    return t

def float_pack8(x, le):
    """Adapted from Objects/floatobject.c PyFloat_Pack8"""
    def overflow():
        raise OverflowError("float too large to pack with d format")

    p = 0
    incr = 1

    if le:
        p += 7
        incr = -1

    if x < 0:
        sign = 1
        x = -x
    else:
        sign = 0

    f, e = math.frexp(x)

    # Normalize f to be in the range [1.0, 2.0)
    if 0.5 <= f and f < 1.0:
        f *= 2.0
        e -= 1
    elif f == 0.0:
        e = 0
    else:
        raise SystemError("frexp() result out of range")

    if e >= 1024:
        overflow()
    elif e < -1022:
        # Gradual underflow
        f = math.ldexp(f, 1022 + e)
        e = 0
    elif not (e == 0 and f == 0.0):
        e += 1023
        f -= 1.0 # Get rid of leading 1 */

    # fhi receives the high 28 bits; flo the low 24 bits (== 52 bits)
    f *= 268435456.0 # 2**28
    fhi = int(f) & 0xFFFFFFFF # Truncate
    assert fhi < 268435456

    f -= fhi
    f *= 16777216.0; # 2**24
    flo = int(f + 0.5) & 0xFFFFFFFF # Round
    assert flo <= 16777216
    if flo >> 24:
        # The carry propagated out of a string of 24 1 bits.
        flo = 0;
        fhi += 1
        if fhi >> 28:
            # And it also propagated out of the next 28 bits.
            fhi = 0
            e += 1
            if e >= 2047:
                overflow()

    t = [None] * 8

    # First byte
    t[p] = (sign << 7) | (e >> 4)
    p += incr

    # Second byte
    t[p] = ((e & 0xF) << 4) | (fhi >> 24)
    p += incr;

    # Third byte
    t[p] = (fhi >> 16) & 0xFF
    p += incr;

    # Fourth byte
    t[p] = (fhi >> 8) & 0xFF
    p += incr;

    # Fifth byte
    t[p] = fhi & 0xFF
    p += incr;

    # Sixth byte
    t[p] = (flo >> 16) & 0xFF
    p += incr;

    # Seventh byte
    t[p] = (flo >> 8) & 0xFF
    p += incr;

    # Eighth byte
    t[p] = flo & 0xFF

    return t


def float_pack(size, d, le):
    """Adapted from Modules/_testcapimodule.c test_float_pack"""
    if size == 2:
        data = float_pack2(d, le)
        print(data)
        return bytes(data)
    elif size == 4:
        data = float_pack4(d, le)
        return bytes(data)
    elif size == 8:
        data = float_pack8(d, le)
        return bytes(data)
    raise ValueError("size must 2, 4 or 8")

_PY_SHORT_FLOAT_REPR = 1

def float_unpack2(data, le):
    p = 0
    incr = 1

    if le:
        p += 1
        incr = -1

    # First byte
    sign = (data[p] >> 7) & 1
    e = (data[p] & 0x7C) >> 2
    f = (data[p] & 0x03) << 8
    p += incr

    # Second byte
    f |= data[p]

    if e == 0x1f:
        if _PY_SHORT_FLOAT_REPR == 0:
            if f == 0:
                # Infinity
                return -Py_HUGE_VAL if sign else Py_HUGE_VAL
            else:
                # NaN
                return -Py_NAN if sign else Py_NAN
        else:  # _PY_SHORT_FLOAT_REPR == 1
            if f == 0:
                # Infinity
                return -float('inf') if sign else float('inf')
            else:
                return -float('nan') if sign else float('nan')

    x = f / 1024.0

    if e == 0:
        e = -14
    else:
        x += 1.0
        e -= 15
    x = math.ldexp(x, e)

    if sign:
        x = -x

    return x

def float_unpack4(data, le):
    p = 0
    incr = 1

    if le:
        p += 3
        incr = -1

    # First byte
    sign = (data[p] >> 7) & 1
    e = (data[p] & 0x7F) << 1
    p += incr

    # Second byte */
    e |= (data[p] >> 7) & 1
    f = (data[p] & 0x7F) << 16
    p += incr

    if e == 255:
        raise ValueError(
            "can't unpack IEEE 754 special value "
            "on non-IEEE platform")

    # Third byte */
    f |= data[p] << 8
    p += incr

    # Fourth byte */
    f |= data[p]

    x = f / 8388608.0

    # This sadly ignores Inf/NaN issues
    if e == 0:
        e = -126
    else:
        x += 1.0
        e -= 127

    x = math.ldexp(x, e)

    if sign:
        x = -x

    return x

def float_unpack8(data, le):
    p = 0
    incr = 1

    if le:
        p += 7
        incr = -1

    # First byte
    sign = (data[p] >> 7) & 1
    e = (data[p] & 0x7F) << 4

    p += incr

    # Second byte
    e |= (data[p] >> 4) & 0xF
    fhi = (data[p] & 0xF) << 24
    p += incr

    if e == 2047:
        raise ValueError(
            "can't unpack IEEE 754 special value "
            "on non-IEEE platform")

    # Third byte
    fhi |= data[p] << 16
    p += incr

    # Fourth byte
    fhi |= data[p]  << 8
    p += incr

    # Fifth byte
    fhi |= data[p]
    p += incr

    # Sixth byte
    flo = data[p] << 16
    p += incr

    # Seventh byte
    flo |= data[p] << 8
    p += incr

    # Eighth byte
    flo |= data[p]

    x = fhi + flo / 16777216.0  # 2**24
    x /= 268435456.0  # 2**28

    if e == 0:
        e = -1022
    else:
        x += 1.0
        e -= 1023

    x = math.ldexp(x, e)

    if sign:
        x = -x

    return x
    
def float_unpack(data, le):
    """Adapted from Modules/_testcapimodule.c test_float_unpack"""
    size = len(data)
    if size == 2:
        d = float_unpack2(data, le)
    elif size == 4:
        d = float_unpack4(data, le)
    elif size == 8:
        d = float_unpack8(data, le)
    else:
        raise ValueError("data length must 2, 4 or 8 bytes")

    return float(d)
