import sys
def print_exc(file=sys.stderr):
    exc = __BRYTHON__.current_exception
    file.write(exc.info)
    if isinstance(exc, SyntaxError):
        offset = exc.args[1][2]
        file.write('\n  '+offset*' '+'^')
    file.write('\n'+exc.__name__)
    if exc.args:
        file.write(': %s' %exc.args[0])
    file.write('\n')

def format_exc(limit=None,chain=True):
    exc = __BRYTHON__.current_exception
    res = exc.info+'\n'+exc.__name__
    if exc.args:
        res += ': '+exc.args[0]
    return res+'\n'

def format_exception(_type, value, tb, limit=None, chain=True):
    return ['%s\n' %_type,'%s\n' %value]    
