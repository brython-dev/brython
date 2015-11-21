import sys
from browser import console

def print_exc(file=sys.stderr):
    exc = __BRYTHON__.current_exception
    if isinstance(exc, SyntaxError):
        file.write('\n module %s line %s' %(exc.args[1], exc.args[2]))
        offset = exc.args[3]
        file.write('\n  '+exc.args[4])
        file.write('\n  '+offset*' '+'^')
    else:
        file.write(exc.info)
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

def extract_tb(tb, limit=None):
    return tb