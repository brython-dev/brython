import sys
def print_exc(file=sys.stderr):
    exc = __BRYTHON__.exception_stack[-1]
    file.write(exc.info)
    file.write('\n'+exc.__name__)
    if exc.message:
        file.write(': '+exc.message)
    file.write('\n')

def format_exc(limit=None,chain=True):
    exc = __BRYTHON__.exception_stack[-1]
    res = exc.info+'\n'+exc.__name__
    if exc.message:
        res += ': '+exc.message
    return res+'\n'

def format_exception(_type, value, tb, limit=None, chain=True):
    return ['%s\n' %_type,'%s\n' %value]    
