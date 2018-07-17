import sys
from browser import console

def print_exc(file=None):
    """Print the last exception."""
    if file is None:
        file = sys.stderr
    file.write(format_exc())

def format_exc(limit=None, chain=True, includeInternal=False):
    exc = sys.exc_info()[1]
    return format_exception(exc.__class__, exc, exc.traceback,
                            limit=limit, chain=chain,
                            includeInternal=includeInternal)

def format_exception(_type, exc, tb, limit=None, chain=True, 
        includeInternal=False):
    """
    Pass includeInternal=True to include frames in the stack trace
    even if they lack source code and are internal to Brython.
    """
    res = '';
    if isinstance(exc, SyntaxError):
        res += '\n module %s line %s' %(exc.args[1], exc.args[2])
        offset = exc.args[3]
        res += '\n  '+exc.args[4]
        res += '\n  '+offset*' '+'^'
    else:
        if includeInternal:
            res += exc.infoWithInternal
        else:
            res += exc.info
    msg = exc.__class__.__name__ + ': '
    try:
        msg += str(exc)
    except:
        msg += '<unprintable {} object>'.format(exc.__class__.__name__)
    res = '\n' + msg + '\n' + res
    if not res.endswith('\n'):
        res += '\n'
    return res

def extract_tb(tb, limit=None):
    return tb
