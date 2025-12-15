import types
import builtins

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

types_module = {}
for t in dir(types):
    value = getattr(types, t)
    if type(value) is type:
        types_module[value.__name__] = value

def make_builtins_init(bltins):
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

    init = ''
    for _set in sets:
        for cls in _set:
            init += get_slots_by_type(cls)

    return init

def make_methods(cls):
    methods = {}
    for attr in cls.__dict__:
        value = cls.__dict__[attr]
        value_type = type(value).__name__
        if value_type not in methods:
            methods[value_type] = [attr]
        else:
            methods[value_type].append(attr)
    js = f'var {cls.__name__}_methods = {{\n'
    lines = []
    for _type in methods:
        lines.append(f'    {_type}: {methods[_type]}')
    js += ',\n'.join(lines)
    return js + '\n}'

def get_slots_by_type(cls):
    slots = {
        'tp_name': "__name__",
        'tp_basicsize': "__basicsize__",
        'tp_itersize': "__itemsize__",
        'tp_flags': "__flags__",
        'tp_weakrefoffset': "__weakrefoffset__",
        'tp_base': "__base__",
        'tp_dictoffset': "__dictoffset__",
        'tp_doc': '__doc__',
        'tp_bases': '__bases__'
    }
    head = '_b_' if cls.__name__ in dir(builtins) else '$B'
    name = cls.__name__.replace('-', '_').replace(' ', '_')
    res = f'init_type({head}, "{name}", {{\n'

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

        if value is not None:
            res += f'    {slot}: {value},\n'
    return res + '})\n\n'

def get_slots(cls_name):
    try:
        cls = eval(cls_name)
        return get_slots_by_type(cls)
    except:
        if cls_name in types_module:
            return get_slots_by_type(types_module[cls_name])
        return ''


if __name__ == '__main__':
    print(make_builtins_init(__builtins__))

    print(make_methods(type))
    print(get_slots(object))
    wd = type(int.__init__)

    all_wrappers = set()
    classes = []

    methods = set()

    import builtins
    for obj in dir(builtins):
        value = getattr(builtins, obj)
        if isinstance(value, type):
            classes.append(value)
            wds = []
            for attr in value.__dict__:
                klass = type(value.__dict__[attr])
                if klass is wd:
                    all_wrappers.add(attr)
                methods.add(klass.__name__)
    print('wrapper_descriptors', sorted(all_wrappers))

    for cls in classes:
        for attr in value.__dict__:
            if attr in all_wrappers:
                if type(value.__dict__[attr]) is not wd:
                    print('anomalie')
    print('methods in built-in classes', methods)
    #print(make_methods(GenericAlias))