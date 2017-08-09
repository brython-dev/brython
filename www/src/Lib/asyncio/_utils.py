def decorator(dec):
    def new_dec(fn):
        ret = dec(fn)
        ret.__decorated = fn
        return ret
    return new_dec

