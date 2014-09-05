"""string helper module"""

import pyre as re

class __loader__(object):
    pass

def formatter_field_name_split(*args,**kw):
    """split the argument as a field name"""
    pass

def formatter_parser(*args,**kw):
    """parse the argument as a format string"""

    assert len(args)==1
    assert isinstance(args[0], str)

    _result=[]
    for _match in re.finditer("([^{]*)?(\{[^}]*\})?", args[0]):
        _pre, _fmt = _match.groups()
        if _fmt is None:
           _result.append((_pre, None, None, None))
        elif _fmt == '{}':
           _result.append((_pre, '', '', None))
        else:
           _m=re.match("\{([^!]*)!?(.*)?\}", _fmt)
           _name=_m.groups(0)
           _flags=_m.groups(1)

           _result.append((_pre, _name, _flags, None))

    return _result
