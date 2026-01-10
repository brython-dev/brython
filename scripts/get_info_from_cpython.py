"""Scan CPython files in /Objects to get the information on type
getset, methods and members"""

import os
import builtins
import re
import io


from directories import src_dir
from get_cpython_objects_defines import defines
import get_type_slots

fields = """tp_name
tp_basicsize
tp_itemsize
tp_dealloc
tp_vectorcall_offset
tp_getattr
tp_setattr
tp_as_async
tp_repr
tp_as_number
tp_as_sequence
tp_as_mapping
tp_hash
tp_call
tp_str
tp_getattro
tp_setattro
tp_as_buffer
tp_flags
tp_doc
tp_traverse
tp_clear
tp_richcompare
tp_weaklistoffset
tp_iter
tp_iternext
tp_methods
tp_members
tp_getset
tp_base
tp_dict
tp_descr_get
tp_descr_set
tp_dictoffset
tp_init
tp_alloc
tp_new
tp_free
tp_is_gc
tp_bases
tp_mro
tp_cache
tp_subclasses
tp_weaklist
tp_del
tp_version_tag
tp_finalize
tp_vectorcall
tp_watched
tp_versions_used""".split()

wrapper_doc = """
tp_repr __repr__
tp_hash __hash__
tp_call __call__
tp_str __str__
tp_getattro __getattribute__
tp_setattro __setattr__ __delattr__
tp_richcompare __lt__ __le__ __eq__ __ne__ __gt__ __ge__
tp_iter __iter__
tp_iternext __next__
tp_descr_get __get__
tp_descr_set __set__ __delete__
tp_init __init__
tp_new __new__
tp_finalize __del__

am_await __await__
am_aiter __aiter__
am_anext __anext__

nb_add __add__ __radd__
nb_inplace_add __iadd__
nb_subtract __sub__ __rsub__
nb_inplace_subtract __isub__
nb_multiply __mul__ __rmul__
nb_inplace_multiply __imul__
nb_remainder __mod__ __rmod__
nb_inplace_remainder __imod__
nb_divmod __divmod__ __rdivmod__
nb_power __pow__ __rpow__
nb_inplace_power __ipow__
nb_negative __neg__
nb_positive __pos__
nb_absolute __abs__
nb_bool __bool__
nb_invert __invert__
nb_lshift __lshift__ __rlshift__
nb_inplace_lshift __ilshift__
nb_rshift __rshift__ __rrshift__
nb_inplace_rshift __irshift__
nb_and __and__ __rand__
nb_inplace_and __iand__
nb_xor __xor__ __rxor__
nb_inplace_xor __ixor__
nb_or __or__ __ror__
nb_inplace_or __ior__
nb_int __int__
nb_float __float__
nb_floor_divide __floordiv__
nb_inplace_floor_divide __ifloordiv__
nb_true_divide __truediv__
nb_inplace_true_divide __itruediv__
nb_index __index__
nb_matrix_multiply __matmul__ __rmatmul__
nb_inplace_matrix_multiply __imatmul__
mp_length __len__
mp_subscript __getitem__
mp_ass_subscript __setitem__, __delitem__
sq_length __len__
sq_concat __add__
sq_repeat __mul__
sq_item __getitem__
sq_ass_item __setitem__ __delitem__
sq_contains __contains__
sq_inplace_concat __iadd__
sq_inplace_repeat __imul__
bf_getbuffer __buffer__
bf_releasebuffer __release_buffer__
"""

mappings = []
for line in wrapper_doc.split('\n'):
    if not line.strip():
        continue
    wd, *methods = line.split()
    mappings.append([wd, methods])
mappings.sort(key=lambda item: 10 - len(item[1]))

wrapper_descriptor = type(int.__repr__)

slots = {
    'tp_name': "__name__",
    'tp_basicsize': "__basicsize__",
    'tp_itemsize': "__itemsize__",
    'tp_flags': "__flags__",
    'tp_weakrefoffset': "__weakrefoffset__",
    'tp_base': "__base__",
    'tp_dictoffset': "__dictoffset__",
    'tp_doc': '__doc__',
    'tp_bases': '__bases__'
}


func_slots = {
    'getset_descriptor': 'tp_getset',
    'method_descriptor': 'tp_methods',
    'member_descriptor': 'tp_members',
    'classmethod_descriptor': 'classmethods',
    'staticmethod': 'staticmethods',
    'builtin_function_or_method': 'functions_or_methods'
}

init_type = """
$B.builtin_types = {}

function init_type(ns, name, data){
    var cls = ns[name] = {}
    for(var i = 0, len = slots.length; i < len; i++){
        cls[slots[i]] = data[i]
    }
    $B.builtin_types[name] = cls
}

"""

set_additional_data = """

for(var name in $B.builtin_types){
    var cls = $B.builtin_types[name]
    cls.ob_type = _b_.type
    cls.tp_mro = $B.make_mro(cls)
}

"""


builtin_function = type(open)
builtin_funcs = [attr for attr in dir(builtins)
    if type(getattr(builtins, attr)) is builtin_function]


set_builtin_funcs_type = f"""
$B.builtin_funcs = {[f"{name}" for name in builtin_funcs]}\n
"""

def get_slots_by_type(cls):
    head = '_b_' if cls.__name__ in dir(builtins) else '$B'
    name = cls.__name__.replace('-', '_').replace(' ', '_')
    res = f'init_type({head}, "{name}", [\n'

    for slot in slots:
        value = None
        if slot == 'tp_doc':
            v = getattr(cls, slots[slot])
            if isinstance(v, str):
                value = '`' + v + '`'
        elif slot == 'tp_base':
            attr_value = getattr(cls, slots[slot], None)
            if attr_value is not None:
                value = '_b_.' + attr_value.__name__
        elif slot == 'tp_bases':
            if hasattr(cls, '__bases__'):
                bases = []
                for base in cls.__bases__:
                    head = '_b_' if base.__name__ in dir(builtins) else '$B'
                    bases.append(f'{head}.{base.__name__}')
                value = '[' + ', '.join(bases) + ']'
        elif slot == 'tp_name':
            value = f'"{cls.__name__}"'
        else:
            value = getattr(cls, slots[slot], None)

        if value is None:
            value = '$B.NULL'
        res += f'    {value},\n'

    return res + '])\n\n'

def make_builtins_init(bltins):
    sets = make_sets()
    init = 'var slots = [\n' + \
        ',\n'.join(f'    "{slot}"' for slot in slots) + '\n]\n\n'
    for _set in sets:
        for cls in _set:
            init += get_slots_by_type(cls)

    return init

# build a set of all the types with __module__ set to "builtins" by
# recursively adding all the subclasses of such types, starting with
# the type "object"
def get_builtins(head, classes=None):
    if classes is None:
        classes = set([head])
    for cls in type.__subclasses__(head):
        if cls.__module__ == 'builtins':
            classes.add(cls)
            classes |= get_builtins(cls, classes)
    return classes

all_builtins = get_builtins(object)

def make_sets():
    builtin_names = dir(builtins)
    builtins_and_types = all_builtins.copy()
    types_module = {}

    def get_children(parent_bases):
        # get classes whoses bases are in parent_bases
        res = set()
        for b in builtins_and_types:
            if hasattr(b, '__bases__'):
                bases = b.__bases__
                for base in bases:
                    if base in parent_bases:
                        res.add(b)
            elif hasattr(b, '__base__'):
                if b.__base__ in parent_bases:
                    res.add(b)
        return res

    # top of types hierarchy
    parent_bases = {object}

    # Get a list of sets of types
    # Each type in a set has all its bases in the previous sets
    sets = [list(parent_bases)]
    builtins_and_types -= parent_bases

    def sort_key(cls):
        return (cls.__name__ not in builtin_names, cls.__name__)

    n = 0
    while builtins_and_types:
        children = get_children(parent_bases)
        sets.append(sorted(list(children), key=sort_key))
        parent_bases |= children
        builtins_and_types -= children
        n += 1
        if n > 20:
            print(builtins)
            raise Exception('infinite loop')

    return sets


init_path = os.path.join(src_dir, 'init_builtin_types.js')

with open(init_path, 'w', encoding='utf-8') as out:
    out.write(f'/* generated by {__file__} */\n')
    out.write('(function($B){\n')
    out.write('var _b_ = $B.builtins\n')
    out.write(init_type)
    out.write(make_builtins_init(__builtins__))
    out.write(set_additional_data)
    out.write(set_builtin_funcs_type)
    out.write('})(__BRYTHON__)\n')

props = {
    'tp_getset': 'PyGetSetDef',
    'tp_methods': 'PyMethodDef',
    'tp_members': 'PyMemberDef'
}


#format1 = r'(?P<name>.*),\s*/\*\s*tp_getset\s*\*/'
#format2 = r'\.tp_getset\s*=\s*(?P<name>.*),\s*'

defline_re = r'^(.*)\s*=\s*{'

def scan(lines, prop):
    format1 = rf'(?P<name>.*),\s*/\*\s*{prop}\s*\*/'
    format2 = rf'\.{prop}\s*=\s*(?P<name>.*),\s*'
    infos = {}
    for i, line in enumerate(lines):
        if mo := re.search(format1, line) or re.search(format2, line):
            name = mo.group('name').strip()
            if name == '0':
                continue
            type_name = get_pytype_name(lines, i)
            defs, functions = get_list(prop, lines, name)
            defs = ',\n'.join(defs)
            funcs = ''
            for gs, name in functions:
                if name == '$B.NULL':
                    continue
                if gs == 'get':
                    funcs += 'function ' + name + '(){\n\n}\n\n'
                else:
                    funcs += 'function ' + name + '(self, value){\n\n}\n\n'
            funclist = f'{types.get(type_name, type_name)}.{prop} = [\n'
            funclist += defs + '\n]\n'
            infos[type_name] = (funcs, funclist)
    return infos

def get_pytype_name(lines, i):
    j = i - 1
    while j > 0:
        defline = lines[j]
        if mo1 := re.match(defline_re, defline):
            info = mo1.groups()[0]
            type_name = info.split()[-1]
            return type_name
        j -= 1

def get_list(prop, lines, name):
    getset_re = rf'{name}\[\] = \{{'
    found = False
    k = 0
    while k < len(lines):
        line = lines[k]
        if not found:
            if re.search(getset_re, line):
                start = k
                found = True
        elif line.startswith('}'):
            deflines = lines[start + 1:k - 1]
            return scan_deflines(prop, deflines)
        k += 1
    print('prop', getset_re, 'not found')

definitions = []
prefix = '    '

def transform_data(data, prop):
    i = 0
    data = data.strip()
    seps = '{,}()'
    delims = []
    parts = []
    item = ''
    s = None
    while i < len(data):
        if data[i] == '"':
            if item:
                parts.append(item)
                item = ''
            j = i + 1
            esc = False
            s = None
            while j < len(data):
                if data[j] == '\\':
                    esc = True
                elif data[j] == '"' and not esc:
                    s = data[i:j+1]
                    delims.append([i, j + 1])
                    parts.append(s)
                    i = j + 1
                    break
                elif esc:
                    esc = False
                j += 1
            if s is None:
                raise SyntaxError(f'unterminated string in {data}')
        else:
            if data[i] in seps:
                if item:
                    parts.append(item.strip())
                delims.append(i)
                parts.append(data[i])
                item = ''
            else:
                item += data[i]
            i += 1
    if item:
        parts.append(item)
    parts0 = parts[:]

    if parts.pop(0) != '{':
        raise SyntaxError('first item is not }')
    while parts:
        if parts.pop() == '}':
            break
    if not parts:
        print(data)
        print(parts0)
        raise SyntaxError('terminal } not found')
    elts = []
    elt = parts.pop(0)
    while parts:
        if (x := parts.pop(0)) != ',':
            elt += x
        else:
            if elt.startswith('('):
                elt = elt[elt.find(')') + 1:]
            elif elt.startswith('_PyCFunction_CAST('):
                elt = elt[len('_PyCFunction_CAST('):-1]
            elts.append(elt)
            elt = ''
    if elt:
        elts.append(elt)
    if prop == 'tp_members':
        if len(elts) > 4:
            elts = elts[:4] # remove doc
    if prop in ['tp_methods', 'tp_getset']:
        if len(elts) > 3:
            elts = elts[:3] # remove doc
    if prop == 'tp_methods':
        if len(elts) == 3:
            elts[2] = elts[2].replace('METH_', '$B.METH_')
    elts = ['$B.NULL' if elt == 'NULL' else elt for elt in elts]
    return elts

def funcrefs(prop, data):
    # return the list of functions to define
    res = [('get', data[1])]
    if prop == 'tp_getset' and len(data) > 2 and data[2] != 'NULL':
        res.append(('set', data[2]))
    return res

def tokenize(s):
    i = 0
    while i < len(s) and s[i] != '{':
        i += 1
    yield s[:i]
    if i == len(s):
        raise Exception('opening { not found')
    braces = '{'
    yield s[i]
    i += 1
    while i < len(s):
        if s[i].isalnum() or s[i] == '_':
            j = i + 1
            while j < len(s) and (s[j].isalnum() or s[j] == '_'):
                j += 1
            yield s[i:j]
            i = j
        elif s[i] == '"':
            j = i + 1
            esc = False
            found = False
            while j < len(s):
                if s[j] == '\\':
                    esc = True
                elif s[j] == '"' and not esc:
                    found = True
                    yield s[i:j+1]
                    i = j + 1
                    break
                elif esc:
                    esc = False
                j += 1
            if not found:
                raise SyntaxError(f'unterminated string in {data}')
        elif s[i:i + 2] == '/*':
            j = i + 2
            while j < len(s) and s[j:j + 2] != '*/':
                j += 1
            if j == len(s):
                raise Exception('unterminated comment')
            yield s[i:j + 3]
            i = j + 2
        elif s[i] in '.,=|\n':
            yield s[i]
            i += 1
        elif s[i] == '(':
            yield s[i]
            braces += '('
            i += 1
        elif s[i] == ')':
            if not braces or braces[-1] != '(':
                raise Exception('unexpected )')
            braces = braces[:-1]
            yield s[i]
            i += 1
        elif s[i] == '{':
            yield s[i]
            braces += '{'
            i += 1
        elif s[i] == '}':
            if not braces or braces[-1] != '{':
                print(s)
                raise Exception('unexpected }')
            yield s[i]
            i += 1
        else:
            i += 1

def scan_typedef(s):
    slots = {}
    it = tokenize(s)
    field_num = 0
    head = next(it)
    if not '=' in head:
        # case for memoryobject.c / _PyMemoryIter_Type
        return slots
    # ignore first line
    while True:
        try:
            token = next(it)
        except StopIteration:
            print(s)
            raise
        if token == ')':
            break
    while (token := next(it)) != '\n':
        continue
    token = next(it)
    # read defs
    while True:
        try:
            if token == '.': # format .tp_name = "type"
                slot = next(it)
                while (token := next(it)) != '=':
                    continue
                v = next(it)
                while (token := next(it)) != ',':
                    v += token
                slots[slot] = v
            else: # format "value,  /* tp_name */"
                v = token
                braces = ''
                while True:
                    token = next(it)
                    if token == ',' and not braces:
                        break
                    elif token == '(':
                        braces += '('
                    elif token == ')':
                        braces = braces[:-1]
                    v += token
                slots[fields[field_num]] = v
            field_num += 1
            while True:
                token = next(it)
                if not token.startswith('/*') and token != '\n':
                    break
        except StopIteration:
            return slots

def scan_deflines(prop, lines):
    # deflines are either an idenfier on a single line,
    # or start with '{' and end with '},'
    defs = []
    functions = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.strip().startswith('{'):
            j = i
            while j < len(lines) and '}' not in lines[j]:
                j += 1
            data = ''.join(x.strip() for x in lines[i:j+1])
            data = transform_data(data, prop)
            functions += funcrefs(prop, data)
            defs.append(prefix + '[' + ', '.join(data) + ']')
            i = j + 1
        elif line.strip().startswith('/*'):
            j = i
            while j < len(lines) and '*/' not in lines[j]:
                j += 1
            i = j + 1
        else:
            definition = line.strip()
            if definition in defines:
                data = defines[definition]
                data = transform_data(data, prop)
                functions += funcrefs(prop, data)
                defs.append(prefix + '[' + ', '.join(data) + ']')
            else:
                defs.append(prefix + definition.strip() + ',')
            definitions.append(definition)
            i += 1
    return defs, functions



path = os.path.join(src_dir, 'builtin_types_infos.js')
with open(path, 'w', encoding='utf-8') as out:
    sets = make_sets()
    while sets:
        types = sets.pop()

        exclude = ("__subclasshook__")

        for cls in types:
            diffs = {}

            for attr in cls.__dict__:
                if attr in exclude:
                    continue
                try:
                    value = cls.__dict__[attr]
                except AttributeError:
                    print('getattr fails for', attr)
                    continue
                value_type = type(value)
                for parent in cls.__mro__[1:]:
                    if attr in parent.__dict__:
                        if parent.__dict__[attr] is not value:
                            diffs[attr] = value
                        break
                else:
                    diffs[attr] = value

            keys = set(diffs)
            define_wds = []
            for wd, methods in mappings:
                if all(m in keys for m in methods):
                    define_wds.append(wd)
                    for m in methods:
                        keys.remove(m)
                        del diffs[m]
            specific = {}
            for attr, value in diffs.items():
                vtype = type(value)
                if vtype not in specific:
                    specific[vtype] = []
                specific[vtype].append(attr)

            name = cls.__name__.replace('-', '_').replace(' ', '_')

            prefix = '_b_' if cls.__name__ in dir(builtins) else '$B'
            if specific or define_wds:
                out.write(f'/* {name} start */\n')

            for wd in define_wds:
                out.write(f'{prefix}.{name}.{wd} = function(self){{\n\n}}\n\n')
            funcs = []
            defs = io.StringIO()

            if specific:
                member_name = f'{name}_funcs'
                out.write(f'var {member_name} = {prefix}.{name}.tp_funcs = {{}}\n\n')
            for vtype in specific:
                tname = vtype.__name__
                if tname in func_slots:
                    defs.write(f'{prefix}.{name}.{func_slots[tname]} = [')
                    defs.write(', '.join(f'"{attr}"'
                        for attr in specific[vtype]))
                    defs.write(']\n')
                    for attr in specific[vtype]:
                        if tname == 'getset_descriptor':
                            funcs += [f'{attr}_get', f'{attr}_set']
                        else:
                            funcs.append(f'{attr}')
                    defs.write('\n')

            for func in sorted(funcs):
                out.write(f'{member_name}.{func} = function(self){{\n\n}}\n\n')
            out.write(defs.getvalue())
            out.write(f'/* {name} end */\n\n')

