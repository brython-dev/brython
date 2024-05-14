
def ascii_decode(*args,**kw):
    pass

def ascii_encode(*args,**kw):
    pass

def charbuffer_encode(*args,**kw):
    pass

def charmap_build(decoding_table):
    return {car: i for (i, car) in enumerate(decoding_table)}

def charmap_decode(input, errors, decoding_table):
    res = ''
    for car in input:
        code = decoding_table[car]
        if code is None:
            raise UnicodeDecodeError(input)
        res += code
    return res, len(input)

def charmap_encode(input, errors, encoding_table):
    t = []
    for car in input:
        code = encoding_table.get(car)
        if code is None:
            raise UnicodeEncodeError(input)
        t.append(code)
    return bytes(t), len(input)

def decode(obj, encoding="utf-8", errors="strict"):
    """decode(obj, [encoding[,errors]]) -> object
    Decodes obj using the codec registered for encoding. encoding defaults
    to the default encoding. errors may be given to set a different error
    handling scheme. Default is 'strict' meaning that encoding errors raise
    a ValueError. Other possible values are 'ignore' and 'replace'
    as well as any other name registered with codecs.register_error that is
    able to handle ValueErrors."""
    return __BRYTHON__.decode(obj, encoding, errors) # in py_bytes.js

def encode(obj, encoding="utf-8", errors="strict"):
    """encode(obj, [encoding[,errors]]) -> object
    Encodes obj using the codec registered for encoding. encoding defaults
    to the default encoding. errors may be given to set a different error
    handling scheme. Default is 'strict' meaning that encoding errors raise
    a ValueError. Other possible values are 'ignore', 'replace' and
    'xmlcharrefreplace' as well as any other name registered with
    codecs.register_error that can handle ValueErrors."""
    return __BRYTHON__.encode(obj, encoding, errors)

def escape_decode(*args,**kw):
    pass

def escape_encode(*args,**kw):
    pass

def latin_1_decode(*args,**kw):
    pass

def latin_1_encode(*args,**kw):
    pass

def lookup(encoding):
    """lookup(encoding) -> CodecInfo
    Looks up a codec tuple in the Python codec registry and returns
    a CodecInfo object."""
    if encoding in ('utf-8', 'utf_8'):
       import encodings.utf_8
       return encodings.utf_8.getregentry()

    LookupError(encoding)

def lookup_error(*args,**kw):
    """lookup_error(errors) -> handler
    Return the error handler for the specified error handling name
    or raise a LookupError, if no handler exists under this name."""
    pass

def mbcs_decode(*args,**kw):
    pass

def mbcs_encode(*args,**kw):
    pass

def raw_unicode_escape_decode(*args,**kw):
    pass

def raw_unicode_escape_encode(*args,**kw):
    pass

def readbuffer_encode(*args,**kw):
    pass

def register(*args,**kw):
    """register(search_function)
    Register a codec search function. Search functions are expected to take
    one argument, the encoding name in all lower case letters, and return
    a tuple of functions (encoder, decoder, stream_reader, stream_writer)
    (or a CodecInfo object)."""
    pass

def register_error(*args,**kw):
    """register_error(errors, handler)
    Register the specified error handler under the name
    errors. handler must be a callable object, that
    will be called with an exception instance containing
    information about the location of the encoding/decoding
    error and must return a (replacement, new position) tuple."""
    pass

def unicode_escape_decode(*args,**kw):
    pass

def unicode_escape_encode(*args,**kw):
    pass

def unicode_internal_decode(*args,**kw):
    pass

def unicode_internal_encode(*args,**kw):
    pass

def _reader(b, nb, endian):
    pos = 0
    while pos < len(b):
        res = 0
        if endian == 'big':
            coef = 256 ** (nb - 1)
            for _ in range(nb):
                res += coef * b[pos]
                pos += 1
                coef //= 256
        else:
            coef = 1
            for _ in range(nb):
                res += coef * b[pos]
                pos += 1
                coef *= 256
        yield res

def _to_codepoint(lo, hi):
    cp = 0x400 * (hi - 0xd800)
    cp += lo - 0xdc00
    return cp + 0x10000

def utf_16_be_decode(b, errors, *args):
    t = []
    reader = _reader(b, 2, 'big')
    for cp in reader:
        if cp < 0xd800:
            t.append(chr(cp))
        else:
            hi = cp
            lo = next(reader)
            t.append(chr(_to_codepoint(lo, hi)))
    return ''.join(t), len(t)

def utf_16_be_encode(arg):
    t = []
    for char in arg:
        cp = ord(char)
        if cp > 2 ** 16:
            # surrogate pair
            code = cp - 2 ** 16
            hi = 0xD800 | (code >> 10)
            lo = 0xDC00 | (code & 0x3FF)
            t += divmod(hi, 256)
            t += divmod(lo, 256)
        else:
            t.append(0)
            t.append(cp)

    return bytes(t), len(arg)

def utf_16_decode(b, errors, *args):
    if b[0] == 0xfe and b[1] == 0xff:
        return utf_16_le_decode(b[2:], errors, *args)
    return utf_16_le_decode(b, errors, *args)

def utf_16_encode(arg):
    b = utf_16_le_encode(arg)[0]
    return bytes([0xfe, 0xff]) + b, len(arg)

def utf_16_ex_decode(*args,**kw):
    pass

def utf_16_le_decode(b, errors, *args):
    t = []
    reader = _reader(b, 2, 'little')
    for cp in reader:
        if cp < 0xd800:
            t.append(chr(cp))
        else:
            hi = cp
            lo = next(reader)
            t.append(chr(_to_codepoint(lo, hi)))
    return ''.join(t), len(t)

def utf_16_le_encode(arg):
    t = []
    for char in arg:
        cp = ord(char)
        if cp > 2 ** 16:
            # surrogate pair
            code = cp - 2 ** 16
            hi = 0xD800 | (code >> 10)
            lo = 0xDC00 | (code & 0x3FF)
            t += reversed(divmod(hi, 256))
            t += reversed(divmod(lo, 256))
        else:
            t.append(cp)
            t.append(0)
    return bytes(t), len(arg)

def utf_32_be_decode(b, errors, *args):
    t = []
    reader = _reader(b, 4, 'big')
    for cp in reader:
        t.append(chr(cp))
    return ''.join(t), len(t)

def utf_32_be_encode(s):
    res = []
    for char in s:
        t = []
        x = ord(char)
        for i in range(4):
            x, y = divmod(x, 256)
            t.append(y)
        res += reversed(t)
    return bytes(res), len(s)

def utf_32_decode(*args,**kw):
    pass

def utf_32_encode(*args,**kw):
    pass

def utf_32_ex_decode(*args,**kw):
    pass

def utf_32_le_decode(b, errors, *args):
    t = []
    reader = _reader(b, 4, 'little')
    for cp in reader:
        t.append(chr(cp))
    return ''.join(t), len(t)

def utf_32_le_encode(s):
    res = []
    for char in s:
        t = []
        x = ord(char)
        for i in range(4):
            x, y = divmod(x, 256)
            t.append(y)
        res += t
    return bytes(res), len(s)

def utf_7_decode(*args,**kw):
    pass

def utf_7_encode(*args,**kw):
    pass

def utf_8_decode(decoder, bytes_obj, errors, *args):
    return (bytes_obj.decode("utf-8"), len(bytes_obj))

def utf_8_encode(*args, **kw):
    input = args[0]
    if len(args) == 2:
       errors = args[1]
    else:
       errors = kw.get('errors', 'strict')

    #todo need to deal with errors, but for now assume all is well.
    return (bytes(input, 'utf-8'), len(input))
