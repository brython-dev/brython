""" Minimalist version for Brython. Not much can be known about the platform
with window.navigator.
"""

from browser import window

def architecture(*args, **kw):
    return "<unknown>", window.navigator.platform

def machine(*args, **kw):
    return ''

def node(*args, **kw):
    return ''

def platform(*args, **kw):
    return window.navigator.platform

def processor(*args, **kw):
    return ''

def python_build():
    return ('.'.join(map(str, __BRYTHON__.implementation[:-1])), 
        __BRYTHON__.compiled_date)

def python_compiler():
    return ''

def python_branch():
    return ''

def python_implementation():
    return 'Brython'

def python_revision():
    return ''

def python_version():
    return '.'.join(map(str, __BRYTHON__.version_info[:3]))

def python_version_tuple():
    return __BRYTHON__.version_info[:3]

def release():
    return ''

def system():
    return window.navigator.platform

def system_alias(*args, **kw):
    return window.navigator.platform

def uname():
    from collections import namedtuple
    klass = namedtuple('uname_result', 
        'system node release version machine processor')
    return klass(window.navigator.platform, '', '', '', '', '')