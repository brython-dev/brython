# -*- coding: utf-8 -*-


"""Generates a skeleton for non-pure Python modules of the CPython distribution
The resulting script has the same names as the original module, with same values
if they are a built-in type (integer, string etc) and a value of the same type
(function, class etc) if possible, else a string with information on the missing
value."""


import inspect
import types


stdlib_name = 'asyncio'

include_doc = False
include_base_classes = False

ns = {}
exec('import %s;print(dir(%s))' % (stdlib_name, stdlib_name), ns)

if('.') in stdlib_name:
    package, *names = stdlib_name.split('.')

    infos = ns[package]
    while names:
        name = names.pop(0)
        infos = getattr(infos, name)
else:
    infos = ns[stdlib_name]


def skeleton(infos):
    res = ''

    if infos.__doc__ and include_doc:
        res += '"""%s"""\n\n' % infos.__doc__
    for key in dir(infos):
        if key.startswith('__') and key.endswith('__') and \
                key not in ['__module__', '__match_args__']:
            continue
        try:
            val = getattr(infos, key)
        except AttributeError:
            continue

        if isinstance(val, (int, float, dict)):
            res += f'\n{key} = {val!r}\n'
        elif val in [True, False, None]:
            res += '\n%s = %s\n' % (key, val)
        elif isinstance(val, str):
            res += '\n%s = """%s"""\n' % (key, val)
        elif type(val) in [types.BuiltinFunctionType,
                          types.BuiltinMethodType, types.FunctionType]:
            res += '\ndef %s(*args,**kw):\n' % key
            if val.__doc__ and include_doc:
                lines = val.__doc__.split('\n')
                res += '    """'
                if len(lines) == 1:
                    res += lines[0]+'"""\n'
                else:
                    res += lines[0]
                    for line in lines[1:-1]:
                        res += '    %s\n' % line
                    res += '    %s"""\n' % lines[-1]
            res += '    pass\n'
        elif inspect.isclass(val):
            res += '\n\nclass %s' % key
            if val.__bases__ and include_base_classes:
                res += '('+','.join(x.__name__ for x in val.__bases__)+')'
            res += ':\n'
            res += '\n'.join('    %s' % line
                             for line in skeleton(val).splitlines())
        else:
            res += '\n{} = "{}"\n'.format(key, repr(val).replace('"', '\\"'))
    return res


with open('%s_skeleton.py' % stdlib_name, 'w') as new_skeleton_file_output:
    new_skeleton_file_output.write(skeleton(infos))
