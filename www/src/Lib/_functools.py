def partial(func, *args, **keywords):
    def newfunc(*fargs, **fkeywords):
        newkeywords = keywords.copy()
        newkeywords.update(fkeywords)
        return func(*(args + fargs), **newkeywords)
    newfunc.func = func
    newfunc.args = args
    newfunc.keywords = keywords
    return newfunc

def reduce(func,iterable,initializer=None):
    args = iter(iterable)
    if initializer is not None:
        res = initializer
    else:
        res = next(args)
    while True:
        try:
            res = func(res,next(args))
        except StopIteration:
            return res
