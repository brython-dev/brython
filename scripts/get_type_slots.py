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

def get_slots(cls_name):
    try:
        cls = eval(cls_name)
    except:
        return ''
    slots = {
        'tp_basicsize': "__basicsize__",
        'tp_itersize': "__itemsize__",
        'tp_flags': "__flags__",
        'tp_weakrefoffset': "__weakrefoffset__",
        'tp_base': "__base__",
        'tp_dictoffset': "__dictoffset__",
        'tp_doc': '__doc__',
        'tp_bases': '__bases__'
    }
    res = 'Object.assign(' + cls_name + ',\n{\n'
    for slot in slots:
        if slot == 'tp_doc':
            value = '`' + getattr(cls, slots[slot]) + '`'
        elif slot == 'tp_base':
            attr_value = getattr(cls, slots[slot])
            if attr_value is None:
                value = '_b_.None'
            else:
                value = '_b_.' + attr_value.__name__
        elif slot == 'tp_bases':
            bases = cls.__bases__
            value = '[' + ', '.join(f'_b_.{x.__name__}' for x in bases) + ']'
        else:
            value = getattr(cls, slots[slot])
        res += f'    {slot}: {value},\n'
    return res + '})\n\n'

if __name__ == '__main__':
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