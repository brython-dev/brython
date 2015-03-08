
def ascii_decode(*args,**kw):
    pass

def ascii_encode(*args,**kw):
    pass

def charbuffer_encode(*args,**kw):
    pass

def charmap_build(*args,**kw):
    pass

def charmap_decode(*args,**kw):
    pass

def charmap_encode(*args,**kw):
    pass

def decode(*args,**kw):
    """decode(obj, [encoding[,errors]]) -> object    
    Decodes obj using the codec registered for encoding. encoding defaults
    to the default encoding. errors may be given to set a different error
    handling scheme. Default is 'strict' meaning that encoding errors raise
    a ValueError. Other possible values are 'ignore' and 'replace'
    as well as any other name registered with codecs.register_error that is
    able to handle ValueErrors."""
    pass

def encode(*args,**kw):
    """encode(obj, [encoding[,errors]]) -> object    
    Encodes obj using the codec registered for encoding. encoding defaults
    to the default encoding. errors may be given to set a different error
    handling scheme. Default is 'strict' meaning that encoding errors raise
    a ValueError. Other possible values are 'ignore', 'replace' and
    'xmlcharrefreplace' as well as any other name registered with
    codecs.register_error that can handle ValueErrors."""
    pass

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
       from javascript import console
       console.log('encoding', encoding)
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

def utf_16_be_decode(*args,**kw):
    pass

def utf_16_be_encode(*args,**kw):
    pass

def utf_16_decode(*args,**kw):
    pass

def utf_16_encode(*args,**kw):
    pass

def utf_16_ex_decode(*args,**kw):
    pass

def utf_16_le_decode(*args,**kw):
    pass

def utf_16_le_encode(*args,**kw):
    pass

def utf_32_be_decode(*args,**kw):
    pass

def utf_32_be_encode(*args,**kw):
    pass

def utf_32_decode(*args,**kw):
    pass

def utf_32_encode(*args,**kw):
    pass

def utf_32_ex_decode(*args,**kw):
    pass

def utf_32_le_decode(*args,**kw):
    pass

def utf_32_le_encode(*args,**kw):
    pass

def utf_7_decode(*args,**kw):
    pass

def utf_7_encode(*args,**kw):
    pass

def utf_8_decode(*args,**kw):
    pass

def utf_8_encode(*args,**kw):
    input=args[0]
    if len(args) == 2:
       errors = args[1]
    else:
       errors=kw.get('errors', 'strict')

    #todo need to deal with errors, but for now assume all is well.

    return (bytes([_f for _f in input], 'utf-8'), len(input))
