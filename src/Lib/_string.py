"""string helper module"""

import re

class __loader__(object):
    pass

def formatter_field_name_split(fieldname):
    """split the argument as a field name"""
    _list=[]
    for _name in fieldname:
        _parts = _name.split('.')
        for _item in _parts:
            is_attr=False  #fix me
            if re.match('\d+', _item):
               _list.append((int(_item), is_attr))
            else:
               _list.append((_item, is_attr))

    return _list[0][0], iter(_list[1:])

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
