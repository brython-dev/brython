import types

def decorator(dec):
    def new_dec(fn):
        ret = dec(fn)
        ret.__decorated = fn
        ret.__name__ = fn.__name__
        return ret
    return new_dec

def _isgenerator_function(val):
    return hasattr(val,'__code__') and val.__code__.co_flags & 0x20

def _isgenerator(val):
    return isinstance(val, types.GeneratorType)


