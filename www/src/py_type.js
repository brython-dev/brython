"use strict";
(function($B) {

var _b_ = $B.builtins

const TPFLAGS = $B.TPFLAGS // defined ib brython_builtins.js

// generic code for class constructor
$B.$class_constructor = function(class_name, dict, metaclass, resolved_bases,
        bases, extra_kwargs){
    var test = false // class_name == 'FlagBoundary'
    if (test) {
        console.log('class constructor', class_name, 'dict', dict)
        console.log('metaclass', metaclass)
    }
    if (metaclass.tp_mro === undefined) {
        console.log('no mro in metaclass', metaclass)
    }

    // bool is not a valid base
    for (var base of bases) {
        if(base.tp_flags !== undefined &&
                 ! (base.tp_flags & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${$B.$getattr(base, '__qualname__')}' ` +
                `is not an acceptable base type`)
        }
    }

    delete extra_kwargs.metaclass

    // set __module__ and __qualname__ before calling metaclass.__new__
    var classdef_frame = $B.frame_obj.prev.frame
    var module = classdef_frame[2]
    if (Object.hasOwn(classdef_frame[1], '__name__')) {
        module = classdef_frame[1].__name__
    }
    $B.str_dict_set(dict, '__module__', module)

    var stack = []
    var frame_obj = $B.frame_obj.prev
    while (frame_obj.prev) {
        var frame = frame_obj.frame
        if (frame[0] == frame[2]) {
            break
        }
        stack.push(frame_obj.frame[0] + '.')
        frame_obj = frame_obj.prev
    }
    var qualname = `${stack.join('')}${class_name}`
    $B.str_dict_set(dict, '__qualname__', qualname)

    // A class that overrides __eq__() and does not define __hash__()
    // will have its __hash__() implicitly set to None
    if($B.str_dict_get(dict, '__eq__', $B.NULL) !== $B.NULL &&
            $B.str_dict_get(dict, '__hash__', $B.NULL) === $B.NULL){
        $B.str_dict_set(dict, '__hash__', _b_.None)
    }

    // Check if class has __slots__
    var slots = $B.str_dict_get(dict, '__slots__', $B.NULL)
    if (slots !== $B.NULL) {
        if (typeof slots == "string") {
            slots = [slots]
        } else {
            for (let item of $B.make_js_iterator(slots)) {
                if (typeof item != 'string') {
                    $B.RAISE(_b_.TypeError, '__slots__ items must be ' +
                        `strings, not '${$B.class_name(item)}'`)
                }
            }
        }
        $B.str_dict_set(dict, '__slots__', slots)
    }

    set_type_new(dict)

    // Apply method __new__ of metaclass to create the class object
    var meta_new = metaclass.tp_new
    if (test) {
        console.log('metaclass', metaclass, 'meta_new', meta_new)
    }
    var kls
    try {
        if (meta_new.$is_slot) {
            try {
                kls = meta_new(metaclass, [class_name, resolved_bases, dict],
                    $B.obj_dict(extra_kwargs))
            } catch (err) {
                throw err
            }
        } else {
            kls = $B.$call(meta_new, metaclass, class_name, resolved_bases, dict,
                           {$kw:[extra_kwargs]})
        }
    } catch (err) {
        if (test) {
            console.log('error in meta_new', meta_new, extra_kwargs)
        }
        throw err
    }

    if (kls.$getattribute === undefined) {
        $B.make_getattr(kls)
    }

    //$B.make_annotate_class(kls, annotate, frame)

    if ($B.get_class(kls) === metaclass) {
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.tp_getattro(metaclass, "__init__")
        try {
            $B.$call(meta_init, kls, class_name, resolved_bases, dict,
                      {$kw: [extra_kwargs]})
        } catch (err) {
            if (class_name == 'SupportsInt') {
                console.log('err for', class_name)
                console.log(err)
                console.log(err.stack)
            }
            throw err
        }
    }

    // Set new class as subclass of its parents
    for (let i = 0; i < bases.length; i++) {
        bases[i].tp_subclasses  = bases[i].tp_subclasses || []
        bases[i].tp_subclasses.push(kls)
    }

    return kls
}

function set_type_new(dict) {
    // If dict has key __new__, make sure it's a staticmethod
    var new_func = $B.str_dict_get(dict, '__new__', $B.NULL)
    if (new_func !== $B.NULL) {
        if ($B.get_class(new_func) === $B.function) {
            $B.str_dict_set(dict, '__new__', _b_.staticmethod.$factory(new_func))
        }
    }
}

function set_type_getattro(cls) {
    // Set attribute tp_getattro for attribute resolution
    var getattribute = $B.get_from_dict(cls, '__getattribute__', $B.NULL)
    var getattr = $B.search_in_mro(cls, '__getattr__', $B.NULL)
    if (getattribute === $B.NULL && getattr === $B.NULL) {
        if (cls.tp_base === undefined) {
            console.log('no tp_base', cls)
        }
        cls.tp_getattro = cls.tp_base.tp_getattro ?? _b_.object.tp_getattro
        if (cls.tp_getattro === undefined) {
            console.log('no tp_getattro from base', cls)
        }
    } else if (getattr === $B.NULL) {
        cls.tp_getattro = function tp_getattro() {
            return $B.$call(getattribute, ...arguments)
        }
    } else if (getattribute === $B.NULL) {
        cls.tp_getattro = function tp_getattro() {
            var res = cls.tp_base.tp_getattro(...arguments)
            if (res === $B.NULL) {
                return $B.$call(getattr, ...arguments)
            }
        }
    } else {
        cls.tp_getattro = function tp_getattro() {
            var res
            try {
                return $B.$call(getattribute, ...arguments)
            } catch (err) {
                $B.RAISE_IF_NOT(err, _b_.AttributeError)
                return $B.$call(getattr, ...arguments)
            }
        }
    }

    //cls.tp_getattro = tp_getattro
}

function current_module() {
    if ($B.frame_obj === null) {
        return '<unknown>'
    }
    return $B.frame_obj.frame[2]
}

$B.get_metaclass = function(class_name, bases, kw_meta) {
    // If a keyword argument "metaclass=kw_meta" is passed, kw_meta is set
    var metaclass
    if (kw_meta === undefined && bases.length == 0) {
        return _b_.type
    } else if (kw_meta) {
        if (! $B.$isinstance(kw_meta, _b_.type)) {
            return kw_meta
        }
        metaclass = kw_meta
    }
    if (bases && bases.length > 0) {
        for (var base of bases) {
            var mc = $B.get_class(base)
            if (metaclass === undefined) {
                metaclass = mc
            } else if (mc === metaclass || _b_.issubclass(metaclass, mc)) {
                // same metaclass or a subclass, do nothing
            } else if (_b_.issubclass(mc, metaclass)) {
                metaclass = mc
            }else if(metaclass.tp_bases &&
                    metaclass.tp_bases.indexOf(mc) == -1){
                $B.RAISE(_b_.TypeError, "metaclass conflict: the " +
                    "metaclass of a derived class must be a (non-" +
                    "strict) subclass of the metaclasses of all its bases")
            }
        }
    } else {
        metaclass = metaclass || _b_.type
    }

    return metaclass
}

/* Determine the most derived metatype. */
function calculate_metaclass(metatype, bases) {
    /* Determine the proper metatype to deal with this,
       and check for metatype conflicts while we're at it.
       Note that if some other metatype wins to contract,
       it's possible that its instances are not types. */
    var winner = metatype
    for (let tmp of bases) {
        var tmptype = $B.get_class(tmp)
        if (_b_.issubclass(winner, tmptype)) {
            continue;
        }
        if (_b_.issubclass(tmptype, winner)) {
            winner = tmptype
            continue
        }
        $B.RAISE(_b_.TypeError,
            "metaclass conflict: the metaclass of a derived class must be " +
            "a (non-strict) subclass of the metaclasses of all its bases"
        )
    }
    return winner
}

function shape_differs(t1, t2) {
    console.log('shape differs', t1, t2)
    return (
        t1.tp_basicsize != t2.tp_basicsize ||
        t1.tp_itemsize != t2.tp_itemsize
    )
}

/*
From https://discuss.python.org/t/solid-bases-for-detecting-incompatible-base-classes/99280

Every class has a single solid base. It is determined as follows:

A class is its own solid base if it has the @solid_base decorator, or if it
has a non-empty __slots__ definition.
Otherwise, if there is a single base class, the solid base is the base’s solid
base.
Otherwise, determine the solid bases of all base classes. If there is only
one, that is the solid base. If there are multiple, but one is a subclass of
all others, the solid base is the subclass. Otherwise, the class cannot exist.
*/

function solid_base(type) {
    var base
    if (type.tp_base) {
        base = solid_base(type.tp_base)
    } else {
        base = _b_.object
    }
    try {
        var slots = $B.search_in_dict(type, '__slots__', $B.NULL)
    } catch (err) {
        console.log('error searching __slots__ in type', type)
        throw err
    }
    if (slots !== $B.NULL && slots.length > 0) {
        return type
    }
    return base
}

/* Calculate the best base amongst multiple base classes.
   This is the first one that's on the path to the "solid base". */
function best_base(bases, ctx) {
    var test = false // ctx.name == 'EnumCheck'
    var n = bases.length
    var base,
        winner,
        candidate
    for (let base_i of bases) {

        if (! $B.is_type(base_i)) {
            $B.RAISE(_b_.TypeError, "bases must be types")
        }

        if(base_i.tp_flags !== undefined &&
                 ! (base_i.tp_flags & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${base.__name__}' is not an acceptable base type`)
        }
        candidate = solid_base(base_i)
        if (test) {
            console.log('base_i', base_i, 'candidate', candidate, 'winner', winner,
                'base', base)
        }
        if (winner == undefined) {
            winner = candidate
            base = base_i
        } else if (_b_.issubclass(winner, candidate)) {
            // ignore
        } else if (_b_.issubclass(candidate, winner)) {
            winner = candidate
            base = base_i
        } else {
            $B.RAISE(_b_.TypeError,
                "multiple bases have instance lay-out conflict")
        }
    }
    if (test) {
        console.log('base', base)
    }
    return base
}

function type_new_get_bases(ctx, type) {
    var nbases = ctx.bases.length
    if (nbases == 0) {
        // Adjust for empty tuple bases
        ctx.base = _b_.object
        ctx.bases = $B.fast_tuple([_b_.object])
        return 0
    }
    for (let base of ctx.bases) {
        if ($B.is_type(base)) {
            continue
        }
        var rc = $B.search_in_mro(base, '__mro_entries__', $B.NULL)
        if (rc === $B.NULL) {
            return -1
        }
        if (rc) {
            $B.RAISE(_b_.TypeError,
                "type() doesn't support MRO entry resolution; " +
                "use types.new_class()"
            )
        }
    }

    // Search the bases for the proper metatype to deal with this
    var winner = calculate_metaclass(ctx.metatype, ctx.bases)

    if (winner !== ctx.metatype) {
        var winner_new_func = winner.tp_new
        var type_new_func = type.tp_new
        if (winner_new_func !== type_new_func) {
            /* Pass it to the winner */
            if (winner_new_func.$is_slot) {
                type = winner_new_func(winner, ctx.args, ctx.kwds)
            } else {
                type = winner_new_func(winner, ...ctx.args, $B.dict2kwarg(ctx.kwds))
            }
            return {type}
        }
        ctx.metatype = winner
    }

    /* Calculate best base, and check that all bases are type objects */
    ctx.base = best_base(ctx.bases, ctx)
    return 0
}

$B.make_class_namespace = function(metaclass, class_name, qualname,
                                   orig_bases, bases){
    // Use __prepare__ (PEP 3115)
    var prepare = $B.$getattr(metaclass, "__prepare__", $B.NULL)
    if (prepare === $B.NULL) {
        $B.RAISE(_b_.TypeError, 'metaclass has no __prepare__')
    }
    var class_dict = $B.$call(prepare, class_name, bases) // dict or dict-like
    if (! $B.is_dict(class_dict)) {
        console.log('class dict', class_dict)
        $B.RAISE(_b_.TypeError,
            `${$B.get_name(metaclass)}.__prepare__() must return a mapping, ` +
            `not ${$B.class_name(class_dict)}`)
    }
    if (orig_bases !== bases) {
        $B.str_dict_set(class_dict, '__orig_bases__', orig_bases)
    }
    if (! $B.hasOnlyStringKeys(class_dict)) {
        $B.warn(_b_.RuntimeWarning,
            `non-string key in the __dict__ of class ${class_name}`)
    }
    return class_dict
}


$B.resolve_mro_entries = function(bases) {
    // Replace non-class bases that have a __mro_entries__ (PEP 560)
    var new_bases = [],
        has_mro_entries = false
    for (var base of bases) {
        if (! $B.$isinstance(base, _b_.type)) {
            var mro_entries = $B.$getattr(base, "__mro_entries__",
                _b_.None)
            if (mro_entries !== _b_.None) {
                has_mro_entries = true
                var entries = _b_.list.$factory($B.$call(mro_entries, bases))
                new_bases = new_bases.concat(entries)
            } else {
                new_bases.push(base)
            }
        } else {
            new_bases.push(base)
        }
    }
    return has_mro_entries ? new_bases : bases
}

$B.make_annotate_func = function(dict, annotations, class_frame) {
    if (annotations === undefined) {
        $B.str_dict_set(dict, '__annotate_func__', _b_.None)
        return
    }
    var __annotate_func__ = annotations
    __annotate_func__.ob_type = $B.function
    $B.init_dict(__annotate_func__)
    $B.str_dict_set(dict, '__annotate_func__', __annotate_func__)
    $B.set_function_infos(__annotate_func__,
        {
            __defaults__: _b_.None,
            __doc__: _b_.None,
            __globals__: $B.frame_obj.frame,
            __kwdefaults__: _b_.None,
            __name__: '__annotate__',
            __module__: class_frame[2],
            __qualname__: class_frame[0] + '.__annotate__',
            __file__: class_frame.__file__
        }
    )
}

$B.check_annotate_format = function(format) {
    if (! $B.is_int(format)) {
        $B.RAISE(_b_.TypeError, '__annotate__ argument should be ' +
            `int, not ${$B.class_name(format)}`)
    }
    format = $B.int_value(format)
    if (format != 1 && format != 2) {
        $B.RAISE(_b_.NotImplementedError, '')
    }
}

$B.postpone_annotations = function(obj, file) {
    // create property __annotations__ for a module with
    // "from __future__ import annotations
    var module_frame = $B.frame_obj.frame
    obj.$annotations = {}
    Object.defineProperty(obj, '__annotations__',
        {
            configurable: true,
            get(){
                if (obj.$set_annotations) {
                    return obj.$set_annotations
                }
                var res = $B.empty_dict()
                for (var key in obj.$annotations) {
                    _b_.dict.$setitem(res, key, obj.$annotations[key][1]())
                }
                return res
            },
            set(value){
                obj.$set_annotations = value
            }
        }
    )
}

$B.make_module_annotate = function(locals) {
    Object.defineProperty(locals, '__annotations__',
        {
            get() {
                if (locals.$set_annotations) {
                    return locals.$set_annotations
                }
                if (locals.__annotate__) {
                    return locals.__annotate__(1)
                }
                return locals.__annotate_func__(1)
            },
            set(value){
                locals.$set_annotations = value
            }
        }
    )
    Object.defineProperty(locals, '__annotate__',
        {
            get() {
                if (locals.$annotate) {
                    return locals.$annotate
                }
                return locals.__annotate_func__
            },
            set(value){
                locals.$annotate = value
            }
        }
    )
    locals.__annotate_func__ = function(format) {
        switch(format){
            case 1:
                var ann_dict = $B.empty_dict()
                for (var key in locals.$annotations) {
                    var item = locals.$annotations[key]
                    //frame.$lineno = item[0]
                    $B.$setitem(ann_dict, key, item[1]())
                }
                return ann_dict
            default:
                $B.RAISE(_b_.NotImplementedError, )
        }
    }
    $B.add_function_infos(locals, '__annotate_func__')

    $B.set_function_attr(locals.__annotate_func__, '__name__', '__annotate__')
    $B.set_function_attr(locals.__annotate_func__, '__qualname__', '__annotate__')
}

function object_get_dict(obj) {
    if ($B.is_type(obj)) {
        return $B.mappingproxy.tp_new($B.mappingproxy, [$B.get_dict(obj)])
    }
    return $B.get_dict(obj)
}

function object_set_dict(obj, value) {
    $B.set_dict(obj, value)
}

var type = _b_.type // defined in py_object.js

type.$factory = function() {
    var $ = $B.args('type', 3, {first: null, bases: null, cl_dict: null},
                arguments, {bases: $B.NULL, cl_dict: $B.NULL}, null, 'kw')
    var first = $.first,
        bases = $.bases,
        cl_dict = $.cl_dict,
        kw = $.kw

    if (cl_dict === $B.NULL) {
        if (bases !== $B.NULL) {
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
        return $B.get_class(first)
    } else {
        return type.tp_call(type, ...arguments)
    }
}

type.$call = function(klass, new_func, init_func) {
    // return factory function for classes with __init__ method
    return function() {
        // create an instance with __new__
        var instance = new_func.bind(null, klass).apply(null, arguments)
        if ($B.$isinstance(instance, klass)) {
            // call __init__ with the same parameters
            init_func.bind(null, instance).apply(null, arguments)
        }
        return instance
    }
}

type.$call_no_new_init = function(klass, init_func) {
    // return factory function for classes without explicit __new__ method
    // and explicit __init__
    return function() {
        var instance = _b_.object.$no_new_init(klass)
        // call __init__ with the same parameters
        init_func(instance, ...arguments)
        return instance
    }
}

type.$call_no_init = function(klass, new_func) {
    // return factory function for classes without __init__
    return new_func.bind(null, klass)
}

$B.$class_getitem = function(kls, origin, args) {
    return $B.GenericAlias.$factory(kls, origin, args)
}

$B.merge_class_dict = function(dict, klass) {
    var classdict,
        bases

    /* Merge in the type's dict (if any). */
    classdict = $B.$getattr(klass, '__dict__', null)
    if (classdict !== null) {
        $B.$call($B.type_getattribute(_b_.dict, 'update'), dict, classdict)
    } else {
        return
    }
    /* Recursively merge in the base types' (if any) dicts. */
    bases = klass.tp_bases
    if (bases === undefined) {
        return
    }
    for (var base of bases) {
        $B.merge_class_dict(dict, base)
    }
}

var dict_name = $B.DICT = Symbol('DICT')

$B.get_dict = function(cls) {
    return cls[dict_name] ??
        (cls.ob_type === $B.function
            ? (cls[dict_name] = $B.empty_dict())
            : undefined)
}

$B.init_dict = function(cls) {
    cls[dict_name] = $B.empty_dict()
}

$B.set_dict = function(cls, value) {
    cls[dict_name] = value
}

$B.get_from_dict = function(cls, attr, _default) {
    return $B.str_dict_get($B.get_dict(cls), attr, _default)
}

$B.set_to_dict = function(cls, attr, value) {
    $B.str_dict_set($B.get_dict(cls), attr, value)
}

var NULL = {NULL:true}

var counter = 0

$B.slot2dunder = {
    tp_call: '__call__',
    tp_descr_get: '__get__',
    tp_descr_set: '__set__',
    tp_getattro: '__getattribute__',
    tp_getbuffer: '__buffer__',
    tp_hash: '__hash__',
    tp_init: '__init__',
    tp_iter: '__iter__',
    tp_iternext: '__next__',
    tp_new: '__new__',
    tp_repr: '__repr__',
    tp_setattro: '__setattr__',
    tp_str: '__str__'
}

$B.dunder2slot = {}
for (var key in $B.slot2dunder) {
    $B.dunder2slot[$B.slot2dunder[key]] = key
}

function where_is(cls, attr) {
    for (var kls of cls.tp_mro) {
        if ($B.get_from_dict(kls, attr, $B.NULL) !== $B.NULL) {
            return kls
        }
    }
}

$B.search_own_slot = function(cls, slot, _default) {
    var dunder = $B.slot2dunder[slot]
    if (cls.hasOwnProperty(slot)) {
        return cls[slot]
    }
    if (dunder) {
        var v = $B.get_from_dict(cls, dunder, $B.NULL)
        if (v !== $B.NULL) {
            if (v.ob_type.tp_descr_get) {
                v = v.ob_type.tp_descr_get(v, cls)
            }
            return v
        }
    }
    return _default
}

$B.search_slot = function(cls, slot, _default) {
    var test = false // cls.tp_name == 'MagicMock' && slot == 'tp_call'
    if (test) {
        console.log('search slot', cls, slot)
    }
    var dunder = $B.slot2dunder[slot]
    if (cls.tp_mro === undefined) {
        console.log('no mro', cls)
    }
    for (var klass of cls.tp_mro) {
        if (klass.hasOwnProperty(slot) && klass[slot] !== $B.NULL) {
            return klass[slot]
        }
        if (dunder) {
            var v = $B.get_from_dict(klass, dunder, $B.NULL)
            if (v !== $B.NULL) {
                if (test) {
                    console.log('klass has __call__', v)
                }
                if (typeof v !== 'function') {
                    var v_type = $B.get_class(v)
                    var getter = v_type.tp_descr_get
                    if (getter !== $B.NULL) {
                        v = getter(v, cls)
                    }
                }
                return v
            }
        }
    }
    return _default
}

$B.builtin_slot = function(cls, slot) {
    for (var kls of cls.tp_mro) {
        if (Object.hasOwn(kls, slot)) {
            return kls[slot]
        }
    }
    return $B.NULL
}

$B.time_type_getattribute = 0

$B.type_getattribute = function(klass, attr) {
    var test = false // attr == 'spam'
    if (test) {
        console.log('type getattribute', attr, klass)

    }
    var meta = $B.get_class(klass)
    if (meta === _b_.type) {
        var res = meta.tp_getattro(klass, attr)
        return res
    }
    var getattro = $B.search_slot(meta, 'tp_getattro', $B.NULL)
    if (getattro !== $B.NULL) {
        if (test) {
            console.log('getattro', getattro)
        }
        var res = getattro(klass, attr, $B.NULL)
        if (test) {
            console.log('result of getattro', res)
        }
        if (res !== $B.NULL) {
            return res
        }
    }
    var getattr = $B.search_in_mro(meta, '__getattr__', $B.NULL)
    if (getattr === $B.NULL) {
        return $B.NULL
    }
    try {
        return $B.$call(getattr, klass, attr)
    } catch (err) {
        if ($B.is_exc(err, _b_.AttributeError)) {
            return $B.NULL
        }
        throw err
    }
}

function update_subclasses(kls, name, alias, value) {
    // recursively propagate kls[alias] = value to subclasses of kls that
    // don't define kls[name]
    // For instance, set kls.$tp_setattr for subclasses that don't define
    // __setattr__
    for (var subclass of kls.tp_subclasses) {
        if (! subclass.hasOwnProperty(name)) {
            subclass[alias] = value
            update_subclasses(subclass, name, alias, value)
        }
    }
}

$B.type_check = function(obj, cls) {
    var obj_type = $B.get_class(obj)
    return obj_type === cls || obj_type.tp_mro.includes(cls)
}

function type_mro(cls) {
    return $B.$list($B.make_mro(cls))
}

function set_tp_slots(cls) {
    for (var [slot, dunder] of Object.entries($B.slot2dunder)) {
        var method = $B.get_from_dict(cls, dunder, $B.NULL)
        if (method !== $B.NULL) {
            cls[slot] = method
        } else {
            for (var kls of $B.get_mro(cls).slice(1)) {
                if (kls[slot]) {
                    cls[slot] = kls[slot]
                    break
                }
            }
        }
    }
}

var special_attrs = [
    "__name__", "__qualname__", "__module__", "__bases__", "__doc__",
    "__type_params__", "__annotate__", "__annotations__"
]

$B.make_getattr = function(cls) {
    if (cls.tp_mro) {
        var getattribute = $B.search_slot(cls, 'tp_getattro', $B.NULL)
        var getattr = $B.search_in_mro(cls, '__getattr__', $B.NULL)
        if (getattr === $B.NULL) {
            cls.$getattribute = getattribute
        } else {
            cls.$getattribute = function(obj, attr) {
                var res = $B.NULL
                try {
                    res = getattribute(obj, attr)
                } catch (err) {
                    $B.RAISE_IF_NOT(err, _b_.AttributeError)
                }
                if (res === $B.NULL) {
                    return $B.$call(getattr, obj, attr)
                }
                return res
            }
        }
    } else {
        cls.$getattribute = $B.NULL
    }
}

function reset_getattribute(cls) {
    // recursively reset attribute $getattribute of cls and its subclasses
    $B.make_getattr(cls)
    for (var kls of cls.tp_subclasses) {
        reset_getattribute(kls)
    }
}

$B.make_call = function(cls) {
    cls.tp_call = $B.NULL
    var call = $B.get_from_dict(cls, '__call__', $B.NULL)
    if (call !== $B.NULL) {
        cls.tp_call = call
    } else {
        for (var kls of cls.tp_mro) {
            if (kls.tp_call && kls.tp_call !== $B.NULL) {
                cls.tp_call = kls.tp_call
                return
            } else {
                call = $B.get_from_dict(kls, '__call__', $B.NULL)
                if (call !== $B.NULL) {
                    cls.tp_call = call
                    return
                }
            }
        }
    }
}

function reset_call(cls) {
    $B.make_call(cls)
    if (cls.tp_subclasses === undefined) {
        console.log('no subclasses', cls)
    }
    for (var kls of cls.tp_subclasses) {
        reset_call(kls)
    }
}

$B.make_descr_get = function(cls) {
    cls.tp_descr_get = $B.NULL
    var get = $B.get_from_dict(cls, '__get__', $B.NULL)
    if (get !== $B.NULL) {
        cls.tp_descr_get = get
    } else if (cls.tp_base) {
        cls.tp_descr_get = cls.tp_base.tp_descr_get ??
            (cls.tp_base.tp_descr_get = $B.make_descr_get(cls.tp_base))
    }
    return cls.tp_descr_get
}

function reset_descr_get(cls) {
    $B.make_descr_get(cls)
    for (var kls of cls.tp_subclasses) {
        reset_descr_get(kls)
    }
}

$B.make_descr_set = function(cls) {
    cls.tp_descr_set = $B.NULL
    var _set = $B.get_from_dict(cls, '__set__', $B.NULL)
    if (_set !== $B.NULL) {
        cls.tp_descr_set = _set
    } else if (cls.tp_base) {
        cls.tp_descr_set = cls.tp_base.tp_descr_set ??
            (cls.tp_base.tp_descr_set = $B.make_descr_set(cls.tp_base))
    }
    return cls.tp_descr_set
}

function reset_descr_set(cls) {
    $B.make_descr_set(cls)
    for (var kls of cls.tp_subclasses) {
        reset_descr_set(kls)
    }
}

function make_factory(cls) {
    var has_no_slots = $B.get_from_dict(cls, '__slots__') === $B.NULL
    if (cls.ob_type !== _b_.type) {
        return
    }
    if(cls.tp_init === _b_.object.tp_init &&
            cls.tp_new === _b_.object.tp_new &&
            has_no_slots){
        // class has no __new__ and no __init__
        cls.$factory = function() {
            if (arguments.length == 0) {
                var res = {
                    ob_type: cls
                }
                $B.init_dict(res)
                return res
            }
            var [args, kw] = $B.parse_args_kw(cls.tp_name, arguments)
            return _b_.object.tp_new(cls, args, kw)
        }
    }else if(cls.tp_new === _b_.object.tp_new &&
            has_no_slots){
        // class has no __new__ but a specific __init__
        cls.$factory = function() {
            var res = {
                ob_type: cls
            }
            $B.init_dict(res)
            cls.tp_init.call(null, res, ...arguments)
            return res
        }
    } else {
        // delete cls.$factory
    }
}

function reset_factory(cls) {
    make_factory(cls)
    for (var kls of cls.tp_subclasses) {
        reset_factory(kls)
    }
}

$B.make_iter = function(cls) {
    cls.tp_iter = $B.NULL
    var iter = $B.get_from_dict(cls, '__iter__', $B.NULL)
    if (iter !== $B.NULL) {
        cls.tp_iter = iter
    } else if (cls.tp_base) {
        cls.tp_iter = cls.tp_base.tp_iter ??
            (cls.tp_base.tp_iter = $B.make_iter(cls.tp_base))
    }
    return cls.tp_iter
}

function reset_iter(cls) {
    $B.make_iter(cls)
    if (cls.tp_subclasses === undefined) {
        console.log('no subclasses', cls)
    }
    for (var kls of cls.tp_subclasses) {
        reset_iter(kls)
    }
}

$B.make_fast_iter = function(cls) {
    if(cls.tp_base &&
            cls.tp_base[$B.FAST_ITER] &&
            $B.get_from_dict(cls, '__iter__', $B.NULL) === $B.NULL){
        cls[$B.FAST_ITER] = cls.tp_base[$B.FAST_ITER]
    }
}

$B.make_new = function(cls) {
    cls.tp_new = $B.NULL
    for (var kls of cls.tp_mro) {
        if (kls.tp_flags & $B.TPFLAGS.HEAPTYPE) {
            var _new = $B.get_from_dict(kls, '__new__', $B.NULL)
            if (_new !== $B.NULL) {
                if ($B.get_class(_new) === _b_.staticmethod) {
                    _new = _new.sm_callable
                }
                cls.tp_new = _new
                return
            }
        } else {
            cls.tp_new = kls.tp_new
            return
        }
    }
}

function reset_new(cls) {
    $B.make_new(cls)
    if (cls.tp_subclasses === undefined) {
        console.log('no subclasses', cls)
    }
    for (var kls of cls.tp_subclasses) {
        reset_new(kls)
    }
}

$B.make_init = function(cls) {
    cls.tp_init = $B.NULL
    for (var kls of cls.tp_mro) {
        if (kls.tp_flags & $B.TPFLAGS.HEAPTYPE) {
            var init = $B.get_from_dict(kls, '__init__', $B.NULL)
            if (init !== $B.NULL) {
                cls.tp_init = init
                return
            }
        } else {
            cls.tp_init = kls.tp_init
            return
        }
    }
}

function reset_init(cls) {
    $B.make_init(cls)
    if (cls.tp_subclasses === undefined) {
        console.log('no subclasses', cls)
    }
    for (var kls of cls.tp_subclasses) {
        reset_init(kls)
    }
}

$B.make_setattr = function(cls) {
    cls.tp_setattro = $B.NULL
    var setattr = $B.get_from_dict(cls, '__setattr__', $B.NULL)
    if (setattr !== $B.NULL) {
        cls.tp_setattro = setattr
    } else if (cls.tp_mro) {
        for (var kls of cls.tp_mro) {
            if(Object.hasOwn(kls, 'tp_setattro') &&
                    kls.tp_setattro !== $B.NULL &&
                    (kls === _b_.object ||
                        kls.tp_setattro !== _b_.object.tp_setattro)){
                cls.tp_setattro = kls.tp_setattro
                break
            }
        }
    }
}

function reset_setattr(cls) {
    $B.make_setattr(cls)
    if (cls.tp_subclasses === undefined) {
        console.log('no subclasses', cls)
    }
    for (var kls of cls.tp_subclasses) {
        reset_setattr(kls)
    }
}

function set_slots(cl_dict, class_obj) {
    let slots = $B.str_dict_get(cl_dict, '__slots__', $B.NULL)
    if (slots !== $B.NULL) {
        for (let key of $B.make_js_iterator(slots)) {
            // CPython: '__dict__' / '__weakref__' inside __slots__ are
            // markers, not slots — '__dict__' keeps the per-instance dict
            if (key == '__dict__' || key == '__weakref__') {
                if (key == '__dict__') {
                    class_obj.$slots_has_dict = true
                }
                continue
            }
            var member = {
                name: key,
                type: $B.TYPES.OBJECT,
                attr: 'slot_value_' + key,
                flags: 0
            }
            var md = {
                ob_type: $B.member_descriptor,
                d_type: class_obj,
                d_name: key,
                d_member: member
            }
            $B.str_dict_set(cl_dict, key, md)
        }
    }
}

/* type start */
_b_.type.tp_setattro = function(kls, attr, value) {
    var $test = false // attr == '__getattribute__' // kls.tp_name == 'A'
    if ($test) {
        console.log('set attr', attr, 'of class', kls, 'to', value)
        console.log('kls dict', $B.get_dict(kls))
    }
    if (kls.tp_flags & TPFLAGS.IMMUTABLETYPE) {
        $B.RAISE(_b_.TypeError,
            `cannot set '${attr}' attribute ` +
            `of immutable type '${$B.get_name(kls)}'`
        )
    }
    var in_mro = $B.search_in_mro($B.get_class(kls), attr, $B.NULL)
    var done = false
    if (in_mro !== $B.NULL) {
        if ($test) {
            console.log('attr', attr, 'found in mro', in_mro)
        }
        var in_mro_type = $B.get_class(in_mro)
        var setter = $B.search_slot(in_mro_type, 'tp_descr_set', $B.NULL)
        if (setter !== $B.NULL) {
            if ($test) {
                console.log('use setter', setter)
            }
            done = true
            setter(in_mro, kls, value)
        }
    }
    if ( ! done) {
        if (value === $B.NULL) {
            var current = $B.get_from_dict(kls, attr, $B.NULL)
            if (current === $B.NULL) {
                throw $B.attr_error(attr, kls)
            }
            _b_.dict.$delitem($B.get_dict(kls), attr)
        } else {
            $B.set_to_dict(kls, attr, value)
        }
    }
    switch(attr){
        case '__call__':
            reset_call(kls)
            break
        case '__getattribute__':
        case '__getattr__':
            reset_getattribute(kls)
            break
        case '__get__':
            reset_descr_get(kls)
            break
        case '__set__':
            reset_descr_set(kls)
            break
        case '__setattr__':
            reset_setattr(kls)
            break
        case '__init__':
            reset_init(kls)
            reset_factory(kls)
            break
        case '__iter__':
            reset_iter(kls)
            break
        case '__new__':
            reset_new(kls)
            reset_factory(kls)
            break
    }

    return _b_.None
}

_b_.type.nb_or = function() {
    var $ = $B.args('__or__', 2, {cls: null, other: null},  arguments)
    var cls = $.cls,
        other = $.other
    if(other !== _b_.None && ! $B.$isinstance(other,
            [type, $B.GenericAlias, $B.UnionType])){
        return _b_.NotImplemented
    }
    return $B.UnionType.$factory([cls, other])
}

_b_.type.tp_repr = function(kls) {
    var name = $B.get_name(kls)
    var qualname
    if (kls.hasOwnProperty('tp_flags') && (kls.tp_flags & TPFLAGS.HEAPTYPE)) {
        var module = $B.$getattr(kls, '__module__', $B.NULL)
        qualname = (module === $B.NULL || module == 'builtins') ? name :
            module + "." + name
    } else {
        qualname = name
    }
    return "<class '" + qualname + "'>"
}

_b_.type.tp_call = function(cls) {
    var $ = $B.args('__call__', 1, {cls: null}, arguments, null, 'args', 'kw'),
        cls = $.cls,
        args = $.args,
        kw = $.kw,
        kw_len = _b_.dict.mp_length(kw)
    var test = false // cls.tp_name === 'AIter'
    if (test) {
        console.log('type.tp_call', cls, args)
        console.log(Error('trace').stack)
    }
    if (cls === _b_.type) {
        if ($.args.length == 1 && kw_len == 0) {
            // one argument: return type of argument
            return $B.get_class(args[0])
        }
        if (args.length !== 1 && args.length !== 3) {
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
    }
    var new_func = cls.tp_new
    if (new_func === undefined) {
        console.log('no tp_new', cls, args, kw)
    }
    if (test) {
        console.log('new_func', new_func, 'is slot tp_new', new_func.$is_slot)
    }
    // create an instance with __new__
    var instance
    if (new_func.$is_slot) {
        instance = new_func(cls, args, kw)
    } else {
        instance = new_func(cls, ...args, $B.dict2kwarg(kw))
    }
    var instance_class = $B.get_class(instance)
    if (test) {
        console.log('instance of type', instance, 'cls', cls)
        console.log('instance type is cls ?', $B.type_check(instance, cls))
    }
    if ($B.type_check(instance, cls)) {
        // call __init__ with the same parameters
        var init_func = instance_class.tp_init
        if (test) {
            console.log('init func', init_func)
        }
        if(init_func !== $B.NULL && init_func !== _b_.object.tp_init &&
                typeof init_func == 'function'){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            //
            // The `typeof init_func == 'function'` guard handles types whose
            // tp_init is undefined (some heap types that never call
            // finalize_type's wrapper_methods loop). Without it,
            // `init_func.call(...)` crashes with
            // `can't access property "call", init_func is undefined`.
            try {
                if (kw_len > 0) {
                    var kwarg = $B.dict2kwarg(kw)
                    init_func.call(null, instance, ...$.args, kwarg)
                } else {
                    init_func.call(null, instance, ...$.args)
                }
            } catch (err) {
                throw err
            }
        }
    }
    if (test) {
        console.log('type.tp_call returns instance', instance)
    }
    return instance
}

_b_.type.tp_getattro = function(obj, name) {
    var test = false // name == '__getformat__' // && obj.tp_name == 'Mapping'
    if (test) {
        console.log('class_getattr', obj, name)
        console.log('frame obj', $B.frame_obj)
    }
    var klass = $B.get_class(obj)
    var in_mro = $B.search_in_mro(klass, name, $B.NULL)
    // print('in mro', in_mro, type(in_mro), in_mro is null)
        if (test) {
            console.log('attr', name, 'of class', klass)
            console.log('in mro', in_mro)
        }
    var getter = $B.NULL
    if (in_mro !== $B.NULL) {
        var in_mro_class = $B.get_class(in_mro)
        if (test) {
            console.log('in_mro class', in_mro_class)
        }
        var getter = in_mro_class.tp_descr_get
        if (test) {
            console.log('getter', getter)
        }
        if (getter !== $B.NULL) {
            if (in_mro_class.tp_descr_set !== $B.NULL) {
                if (test) {
                    console.log('data descriptor', name)
                    console.log('__set__', in_mro_class.tp_descr_set)
                }
                try {
                    var res = getter(in_mro, obj, klass)     // data descriptor
                    if (test) {
                        console.log('result of getter', res)
                    }
                    return res
                } catch (err) {
                    $B.RAISE_IF_NOT(err, _b_.AttributeError)
                }
            } else {
                if (test) {
                    console.log('non-data descriptor', name)
                }
            }
        }
    }
    if (test) {
        console.log('search attribute', name, 'in mro', obj)
   }
    var attribute = $B.search_in_mro(obj, name, $B.NULL)
    if (attribute !== $B.NULL) {
        if (test) {
            console.log('attribute', attribute)
            console.log('class', $B.get_class(attribute))
        }
        var local_get = $B.get_class(attribute).tp_descr_get
        if (test) {
            console.log('local_get', $B.get_class(local_get))
        }
        if (local_get !== $B.NULL) {
            if (typeof local_get !== 'function') {
                console.log('not a function', local_get, 'NULL', $B.NULL)
            }
            // Something special here. For built-in types, passing _b_.None
            // results in an error when the object itself is None, for
            // instance for resolving None.__bool__
            if ($B.get_class(local_get) === $B.JSFunction) {
                var res = local_get(attribute, $B.NULL, obj)
            } else {
                var res = local_get(attribute, _b_.None, obj)
            }
            if (test) {
                console.log('result of local_get', res)
            }
            return res
        }
        return attribute
    } else if (test) {
        console.log('no attribute')
    }
    if (getter !== $B.NULL) {
        if (typeof getter !== 'function') {
            console.log('getter', getter)
            console.log(Error().stack)
        }
        try {
            return getter(in_mro, obj)  // non-data descriptor
        } catch (err) {
            $B.RAISE_IF_NOT(err, _b_.AttributeError)
            return $B.NULL
        }
    }
    if (in_mro !== $B.NULL) {
        return in_mro
    }
    return $B.NULL
}

_b_.type.tp_init = function(self) {
    if (arguments.length == 0) {
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
}

_b_.type.tp_new = function(cls, args, kw) {
    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute
    // arguments passed as keywords in class definition
    var metatype = cls
    var kwds = kw
    var extra_kwargs = kwds
    var [name, bases, cl_dict] = args

    var test = false // name == 'A'
    if (test) {
        console.log('type.tp_new', name, 'metatype', metatype,
            'extrakw', kwds)
        console.log($B.frame_obj.frame.__file__, 'line', $B.frame_obj.frame.$lineno)
    }

    // Create the class dictionary
    var module = $B.str_dict_get(cl_dict, '__module__', $B.frame_obj.frame[2])
    $B.str_dict_set(cl_dict, '__module__', module)
    var qualname = $B.str_dict_get(cl_dict, '__qualname__', name)
    $B.str_dict_set(cl_dict, '__qualname__', qualname)

    var ctx = {
        metatype,
        args,
        kwds,
        cl_dict,
        name,
        bases
    }

    // PyObject *type = NULL;
    var class_obj = {
        ob_type: metatype,
        tp_bases: bases,
        tp_name: name,
        tp_flags: $B.TPFLAGS.DEFAULT | $B.TPFLAGS.HEAPTYPE |
                   $B.TPFLAGS.BASETYPE | $B.TPFLAGS.HAVE_GC
    }
    for (var base of bases) {
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.UNICODE_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.LONG_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.TUPLE_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.LIST_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.DICT_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.BYTES_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.BASE_EXC_SUBCLASS
        class_obj.tp_flags |= base.tp_flags & $B.TPFLAGS.TYPE_SUBCLASS
    }

    $B.set_dict(class_obj, cl_dict)
    class_obj.tp_mro = $B.make_mro(class_obj)
    class_obj.tp_subclasses = []

    $B.make_getattr(class_obj)

    set_type_new(cl_dict)

    var res = type_new_get_bases(ctx, class_obj)
    if (test) {
        console.log('after get bases', ctx.name, 'base', ctx.base)
    }
    class_obj.tp_base = ctx.base
    class_obj.tp_bases = ctx.bases

    $B.make_fast_iter(class_obj)

    if (test) {
        console.log('result of type_new_get_bases', res)
    }


    if (res < 0) {
        assert(PyErr_Occurred());
        return NULL;
    }
    if (res == 1) {
        return class_obj
    }
    if (res instanceof Object) {
        // res.type is the result of tp_new on the classe's metaclass
        class_obj = res.type
        $B.make_init(class_obj)
        $B.make_setattr(class_obj)
    } else {
        set_slots(cl_dict, class_obj)

        $B.set_to_dict(class_obj, '__dict__',
            $B.getset_descriptor.$factory(
                class_obj,
                '__dict__',
                [object_get_dict, $B.set_dict]
            )
        )
        $B.make_init(class_obj)
        $B.make_setattr(class_obj)
        if (test) {
            console.log('scan cl_dict')
        }
        for (var [key, v] of Object.entries(cl_dict)) {
            if (test) {
                console.log('item in cl dict', item)
            }
            if (test) {
                // console.log('check __set_name__ for', key, v)
            }
            if(['__module__', '__doc__', '__dict__', '__qualname__',
                    '__firstlineno__', '__static_attributes__',
                    '__annotate_func__'].includes(key)){
                continue
            }
            if (key == '__class_getitem__') {
                // always a classmethod
                if ($B.get_class(v) !== _b_.classmethod) {
                    var v1 = $B.$call(_b_.classmethod, v)
                    $B.str_dict_set(cl_dict, key, v1)
                }
            }

            // cf PEP 487 and issue #1178
            if (test) {
                console.log('set name', item)
            }
            var set_name = $B.type_getattribute($B.get_class(v), "__set_name__")
            if (set_name !== $B.NULL) {
                $B.$call(set_name, v, class_obj, key)
            }
            if (typeof v == "function") {
                if (v.$function_infos === undefined) {
                    // internal functions have $infos
                    if (v.$infos) {
                        v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                    }
                } else {
                    v.$function_infos[$B.func_attrs.method_class] = class_obj
                    v.$function_infos[$B.func_attrs.__qualname__] = name + '.' +
                        v.$function_infos[$B.func_attrs.__name__]
                }
            }
        }
        if (test) {
            console.log('class obj', class_obj)
        }
        if (test) {
            console.log('call init subclass', init_subclass)
            console.log('extra_kwargs', extra_kwargs)
        }
        if(where_is(class_obj, '__init_subclass__') === _b_.object &&
                _b_.dict.mp_length(extra_kwargs) == 0){
            // no use calling object.__init_subclass__
        } else {
            var sup =
                {
                    ob_type: _b_.super,
                    type: class_obj,
                    obj: class_obj,
                    obj_type: class_obj
                }

            var init_subclass = _b_.super.tp_getattro(sup, "__init_subclass__")
            $B.$call(init_subclass, $B.dict2kwarg(extra_kwargs))
        }
        class_obj.tp_flags |= $B.TPFLAGS.READY
    }
    if (test) {
        console.log('$getattribute is set for', class_obj)
    }
    $B.make_new(class_obj)
    $B.make_descr_get(class_obj)
    $B.make_descr_set(class_obj)
    //$B.make_iter(class_obj)
    $B.make_call(class_obj)
    make_factory(class_obj)
    return class_obj
}

var type_funcs = _b_.type.tp_funcs = {}

type_funcs.__abstractmethods___get = function(cls) {
    if (cls !== type) {
        var res = $B.get_from_dict(cls, '__abstractmethods__', $B.NULL)
        if (res !== $B.NULL) {
            return res
        }
    }
    throw $B.attr_error('__abstractmethods__', cls)
}

type_funcs.__abstractmethods___set = function(cls, value) {
    var abstract, res;
    var dict = $B.get_dict(cls)
    if (value != $B.NULL) {
        abstract = $B.$bool(value)
        res = $B.str_dict_set(dict, '__abstractmethods__', value)
    } else {
        abstract = 0;
        res = $B.str_dict_pop(dict, '__abstractmethods__')
        if (res === $B.NULL) {
            $B.RAISE(_b_.AttributeError, '__abstractmethods__')
        }
    }
    if (abstract) {
        cls.tp_flags |= $B.TPFLAGS.IS_ABSTRACT
    } else {
        cls.tp_flags = cls.tp_flags & ~ $B.TPFLAGS.IS_ABSTRACT
    }
}

type_funcs.__annotate___get = function(self) {
    if (! (self.tp_flags & TPFLAGS.HEAPTYPE)) {
        $B.RAISE(_b_.AttributeError,
            `type object '${$B.get_name(self)}' ` +
            `has no attribute '__annotate__'`
        )
    }
    // First try __annotate__, in case that's been set explicitly
    var annotate = $B.get_from_dict(self, '__annotate__', $B.NULL)
    if (annotate === $B.NULL) {
        annotate = $B.get_from_dict(self, '__annotate_func__', $B.NULL)
    }
    if (annotate !== $B.NULL) {
        var get = $B.get_class(annotate).tp_descr_get
        if (get !== $B.NULL) {
            annotate = get(annotate, $B.NULL, self)
        }
    } else {
        annotate = _b_.None;
        $B.set_to_dict(self, '__annotate_func__', annotate)
    }
    return annotate
}

type_funcs.__annotate___set = function(cls, value) {
    if (value === $B.NULL) {
        $B.RAISE(_b_.TypeError, 'cannot delete __annotate__ attribute')
    }
    $B.set_to_dict(cls, '__annotate__', value)
}

type_funcs.__annotations___get = function(cls) {
    var annotations = $B.get_from_dict(cls, '__annotations__', $B.NULL)
    if (annotations !== $B.NULL) {
        return annotations
    }
    var ann_func = $B.get_from_dict(cls, '__annotate_func__', $B.NULL)
    if (ann_func === $B.NULL || ann_func === _b_.None) {
        return $B.empty_dict()
    }
    return $B.$call(ann_func, 1)
}

type_funcs.__annotations___set = function(cls, value) {
    if (value === $B.NULL) {
        value = $B.empty_dict()
        type.tp_funcs.__annotate___set(cls, _b_.None)
    }
    $B.set_to_dict(cls, '__annotations__', value)
}

type_funcs.__bases___get = function(cls) {
    return $B.fast_tuple(cls.tp_bases)
}

type_funcs.__bases___set = function() {
    var $ = $B.args('__bases__', 2, {cls: null, bases: null}, arguments)
    var cls = $.cls,
        bases = $.bases
    if (! $B.exact_type(bases, _b_.tuple)) {
        $B.RAISE(_b_.TypeError,
            `can only assign tuple to ${$B.get_name(cls)}.__bases__, ` +
            `not ${$B.class_name(bases)}`
        )
    }
    cls.tp_bases = bases
    cls.tp_mro = $B.make_mro(cls)
}

type_funcs.__dict___get = function(cls) {
    return {
        ob_type: $B.mappingproxy,
        mapping: $B.get_dict(cls)
    }
}

type_funcs.__dict___set = function(self) {

}

type_funcs.__dir__ = function(klass) {
    var dict = $B.empty_dict()
    $B.merge_class_dict(dict, klass)
    return _b_.list.$factory(dict)
}

type_funcs.__doc___get = function(cls) {
    if (! (cls.tp_flags & TPFLAGS.HEAPTYPE) && cls.tp_doc) {
        return cls.tp_doc
    }
    return $B.get_from_dict(cls, '__doc__', _b_.None)
}

type_funcs.__doc___set = function(cls, value) {
    $B.set_to_dict(cls, '__doc__', value)
}

type_funcs.__instancecheck__ = function(cls, instance) {
    var kl = $B.get_class(instance)
    var mro = $B.get_mro(kl)
    for (var klass of mro) {
        if (klass === cls) {
            return true
        }
    }
    return false
}

type_funcs.__module___get = function(self) {
    if ($B.get_dict(self)) {
        var module = $B.get_from_dict(self, '__module__', $B.NULL)
        if (module !== $B.NULL) {
            return module
        }
    }
    return 'builtins'
}

type_funcs.__module___set = function(self, value) {
    $B.set_to_dict(self, '__module__', value)
}

type_funcs.__mro___get = function(self) {
    return $B.fast_tuple($B.get_mro(self))
}

type_funcs.__mro___set = function(self) {

}

type_funcs.__name___get = function(cls) {
    return $B.get_name(cls)
}

type_funcs.__name___set = function(cls,value) {
    cls.tp_name = value
}

type_funcs.__prepare__ = function(cls) {
    return $B.empty_dict()
}

type_funcs.__qualname___get = function(cls) {
    return $B.get_from_dict(cls, '__qualname__', $B.get_name(cls))
}

type_funcs.__qualname___set = function(cls, value) {
    cls.tp_name = value
}

type_funcs.__sizeof__ = function(self) {

}

type_funcs.__subclasscheck__ = function(self, subclass) {
    // Is subclass a subclass of self ?
    var klass = self
    if (subclass.tp_bases === undefined) {
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(klass) > -1
}

type_funcs.__subclasses__ = function(cls) {
    return $B.$list(cls.tp_subclasses)
}

type_funcs.__text_signature___get = function(self) {

}

type_funcs.__text_signature___set = function(self) {

}

type_funcs.__type_params___get = function(self) {

}

type_funcs.__type_params___set = function(self) {

}

type_funcs.mro = function(cls) {
    return $B.$list($B.get_mro(cls))
}

_b_.type.tp_methods = [
    "mro", "__subclasses__", "__instancecheck__", "__subclasscheck__", "__dir__",
    "__sizeof__"
]

_b_.type.classmethods = ["__prepare__"]

_b_.type.tp_members = [
    ["__basicsize__", $B.TYPES.PYSSIZET, "tp_basicsize", 1],
    ["__itemsize__", $B.TYPES.PYSSIZET, "tp_itemsize", 1],
    ["__flags__", $B.TYPES.ULONG, "tp_flags", 1],
    ["__weakrefoffset__", $B.TYPES.PYSSIZET, "tp_weaklistoffset", 1],
    ["__base__", $B.TYPES.OBJECT, "tp_base", 1],
    ["__dictoffset__", $B.TYPES.PYSSIZET, "tp_dictoffset", 1]
]

_b_.type.tp_getset = [
    "__name__", "__qualname__", "__bases__", "__mro__", "__module__",
    "__abstractmethods__", "__dict__", "__doc__", "__text_signature__",
    "__annotations__", "__annotate__", "__type_params__"
]

/* type end */

$B.set_func_names(type, "builtins")


// property (built in function)
var property = _b_.property

$B.internal_property = function(module, fget, fset) {
    // used in built-in modules
    for (var func of [fget, fset]) {
        if ($B.get_class(func) === $B.JSFunction) {
            $B.set_type(func, $B.function)
        }
    }
    return {
        ob_type: _b_.property,
        prop_get: fget,
        prop_set: fset ?? _b_.None,
        prop_del: _b_.None,
        doc: _b_.None
    }
}

property.$factory = function(fget, fset, fdel, doc) {
    var res = {
        ob_type: property
    }
    property.tp_init(res, fget, fset ?? _b_.None, fdel ?? _b_.None,
        doc ?? _b_.None)
    return res
}


/* property start */
_b_.property.tp_descr_set = function(self, obj, value) {
    if (self.prop_set === _b_.None) {
        var name = self.prop_get.$function_infos[$B.func_attrs.__name__]
        var msg = `property '${name}' of '${$B.class_name(obj)}' object ` +
                  'has no setter'
        $B.RAISE_ATTRIBUTE_ERROR(msg, self, '__set__')
    }
    if (value === $B.NULL) {
        if (self.prop_del === _b_.None) {
            $B.RAISE(_b_.AttributeError,
                `property '${self.prop_name}' of '${$B.class_name(obj)}' ` +
                `object has no deleter`
            )
        }
        $B.$call(self.prop_del, obj)
    } else {
        $B.$call(self.prop_set, obj, value)
    }
}

_b_.property.tp_descr_get = function(self, obj, type) {
    if (obj === $B.NULL) {
        return self
    }
    if (self.prop_get === _b_.None) {
        $B.RAISE_ATTRIBUTE_ERROR("unreadable attribute", self, '__get__')
    }
    return $B.$call(self.prop_get, obj)
}

_b_.property.tp_init = function() {
    var $ = $B.args('__init__', 5,
                {self: null, fget: null, fset: null, fdel: null, doc: null},
                arguments,
                {fget: _b_.None, fset: _b_.None, fdel: _b_.None, doc: _b_.None}
                )
    var self = $.self,
        fget = $.fget,
        fset = $.fset,
        fdel = $.fdel,
        doc = $.doc
    self.prop_doc = doc
    if ($B.$getattr && doc === _b_.None) {
        self.prop_doc = $B.$getattr(fget, '__doc__', doc)
    }
    self.prop_get = fget
    self.prop_set = fset
    self.prop_del = fdel
    self.$is_property = true

    if (fget && fget.$attrs) {
        for (var key in fget.$attrs) {
            self[key] = fget.$attrs[key]
        }
    }
}

_b_.property.tp_new = function(cls, args, kw) {
    return {
        ob_type: cls
    }
}

var property_funcs = _b_.property.tp_funcs = {}

property_funcs.__isabstractmethod___get = function(self) {

}

property_funcs.__isabstractmethod___set = function(self) {

}

property_funcs.__name___get = function(self) {
    return $B.$getattr(self.prop_get, '__name__')
}

property_funcs.__name___set = function(self) {

}

property_funcs.__set_name__ = function(self, cls, name) {
    self.prop_name = name
}

property_funcs.deleter = function(self, fdel) {
    self.prop_del = fdel
    return self
}

property_funcs.getter = function(self, fget) {
    self.prop_get = fget
    return self
}

property_funcs.setter = function(self, fset) {
    self.prop_set = fset
    return self
}

_b_.property.tp_methods = ["getter", "setter", "deleter", "__set_name__"]

_b_.property.tp_members = [
    ["fget", $B.TYPES.OBJECT, "prop_get", 1],
    ["fset", $B.TYPES.OBJECT, "prop_set", 1],
    ["fdel", $B.TYPES.OBJECT, "prop_del", 1],
    ["__doc__",  $B.TYPES.OBJECT, "prop_doc", 0]
]

_b_.property.tp_getset = ["__name__", "__isabstractmethod__"]

/* property end */

$B.set_func_names(property, "builtins")

$B.make_iterator_class = function(name, reverse) {
    // Builds a class to iterate over items

    var klass = {
        ob_type: _b_.type,
        __mro__: [_b_.object],
        __name__: name,
        __qualname__: name,

        $factory: function(items) {
            var res = {
                ob_type: klass,
                counter: reverse ? items.length : -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
            $B.init_dict(res)
            return res
        },
        $iterator_class: true,

        tp_iter: function(self) {
            self.counter =
                self.counter === undefined
                    ? reverse
                        ? self.items.length
                        : - 1
                    : self.counter
            self.len = self.items.length
            return self
        },

        __len__: function(self) {
            return self.items.length
        },

        tp_iternext: function(self) {
            if (typeof self.test_change == "function") {
                var message = self.test_change()
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                if (message) {
                    $B.RAISE(_b_.RuntimeError, message)
                }
            }

            if (reverse) {
                self.counter--
                if (self.counter >= 0) {
                    var item = self.items[self.counter]
                    if (self.items.$is_js_array) {
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            } else {
                self.counter++
                if (self.counter < self.items.length) {
                    var item = self.items[self.counter]
                    if (self.items.$is_js_array) {
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            }
            $B.RAISE(_b_.StopIteration, "StopIteration")
        },

        __reduce_ex__: function(self) {
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}


// PEP 585
function _Py_make_parameters(args) {
    var is_args_list = $B.is_list(args)
    var tuple_args
    if (is_args_list) {
        args = tuple_args = $B.fast_tuple(args)
    }
    var nargs = args.length
    var len = nargs
    var parameters = $B.fast_tuple()
    var iparam = 0
    for (let iarg = 0; iarg < nargs; iarg++) {
        let t = args[iarg]
        // We don't want __parameters__ descriptor of a bare Python class.
        if ($B.is_type(t)) {
            continue
        }
        var rc = $B.$getattr(t, '__typing_subst__', $B.NULL)
        if (rc !== $B.NULL) {
            parameters.push(t)
            iparam++
        } else {
            var subparams = $B.$getattr(t, '__parameters__', $B.NULL)
            if(subparams === $B.NULL &&
                    $B.$isinstance(t, [_b_.tuple, _b_.list])){
                // Recursively call _Py_make_parameters for lists/tuples and
                // add the results to the current parameters.
                subparams = _Py_make_parameters(t)
            }
            if (subparams && $B.is_tuple(subparams)) {
                var len2 = subparams.length
                var needed = len2 - 1 - (iarg - iparam)
                if (needed > 0) {
                    len += needed;
                    _PyTuple_Resize(parameters, len)
                }
                for (let t2 of subparams) {
                    parameters.push(t2)
                    iparam++
                }
            }
        }
    }
    if (iparam < len) {
        _PyTuple_Resize(parameters, iparam)
    }
    return parameters
}

function _unpacked_tuple_args(arg) {
    var result
    // Fast path
    if($B.exact_type(arg, $B.GenericAlias) &&
            arg.starred &&
            arg.origin == _b_.tuple){
        return arg.args
    }

    var result = $B.$getattr(arg, '__typing_unpacked_tuple_args__', $B.NULL)
    if (result !== $B.NULL) {
        if (result === _b_.None) {
            return $B.NULL
        }
        return result
    }
    return $B.NULL
}

function _unpack_args(item) {
    var newargs = []
    var is_tuple = $B.is_tuple(item)
    var nitems = is_tuple ? item.length : 1
    var argitems = is_tuple ? item[0] : item
    for (let item of argitems) {
        if (! $B.is_type(item)) {
            var subargs = _unpacked_tuple_args(item)
            if (subargs !== $B.NULL &&
                    $B.is_tuple(subargs) &&
                    ! (subargs.length > 0 &&
                        subargs[subargs.length - 1] === $B.ellipsis)){
                newargs = newargs.concat(subargs)
                continue
            }
        }
        newargs.push(item)
    }
    return $B.$list(newargs)
}

function _is_unpacked_typevartuple(arg) {
    var tmp
    if ($B.is_type(arg)) { // TODO: Add test
        return 0
    }
    var tmp = $B.$getattr(arg, '__typing_is_unpacked_typevartuple__', $B.NULL)
    if (tmp !== $B.NULL) {
        res = !!tmp
    }
    return res
}

function subs_tvars(obj, params, argitems, nargs) {
    var subparams
    var subparams = $B.$getattr(obj, '__parameters__', $B.NULL)
    if(subparams !== $B.NULL &&
            $B.is_tuple(subparams) &&
            subparams.length > 0){
        var nparams = params.length
        var nsubargs = subparams.length
        var subargs = $B.fast_tuple()
        var j = 0
        for (let arg of subparams) {
            var iparam = tuple_index(params, nparams, arg)
            if (iparam >= 0) {
                var param = params[iparam]
                arg = argitems[iparam]
                if ($B.get_class(param).tp_iter && $B.is_tuple(arg)) {  // TypeVarTuple
                    j = tuple_extend(subargs, j,
                                    arg[0],
                                    arg.length)
                    continue
                }
            }
            subargs[j] = arg
            j++;
        }
        obj = PyObject_GetItem(obj, subargs);
    }
    return obj
}

function _Py_subs_parameters(self, args, parameters, item) {
    var nparams = parameters.length
    if (nparams == 0) {
        $B.RAISE(_b_.TypeError,
            `${_b_.repr(self)} is not a generic class`
        )
    }
    item = _unpack_args(item)
    for (let param of parameters) {
        var tmp
        var prepare = $B.$getattr(param, '__typing_prepare_subst__', $B.NULL)
        if (prepare !== $B.NULL && prepare != _b_.None) {
            tmp = $B.$call(prepare, self, item)
            item = tmp
        }
    }
    var is_tuple = $B.is_tuple(item)
    var nitems = is_tuple ? item.length : 1
    var argitems = is_tuple ? item[0] : item
    if (nitems != nparams) {
        var qualif = nitems > nparams ? "many" : "few"
        $B.RAISE(_b_.TypeError,
            `Too ${qualif} arguments for ${_b_.repr(self)}; ` +
            `actual ${nitems}, expected ${nparams}`
        )
    }
    /* Replace all type variables (specified by parameters)
       with corresponding values specified by argitems.
        t = list[T];          t[int]      -> newargs = [int]
        t = dict[str, T];     t[int]      -> newargs = [str, int]
        t = dict[T, list[S]]; t[str, int] -> newargs = [str, list[int]]
        t = list[[T]];        t[str]      -> newargs = [[str]]
     */
    var is_args_list = $B.is_list(args)
    var tuple_args
    if (is_args_list) {
        args = tuple_args = $B.fats_tuple(args)
    }
    var nargs = args.length
    var newargs = $B.fast_tuple()
    for (let iarg = 0, jarg = 0; iarg < nargs; iarg++) {
        var arg = args[iarg]
        if ($B.is_type(arg)) {
            newargs[jarg] = arg
            jarg++
            continue
        }
        // Recursively substitute params in lists/tuples.
        if ($B.$isinstance(arg, [_b_.tuple, _b_.list])) {
            var subargs = _Py_subs_parameters(self, arg, parameters, item)
            if ($B.is_tuple(arg)) {
                newargs[jarg] = subargs
            } else {
                // _Py_subs_parameters returns a tuple. If the original arg was a list,
                // convert subargs to a list as well.
                newargs[jarg] = $B.$list(subargs)
            }
            jarg++
            continue
        }
        var unpack = _is_unpacked_typevartuple(arg);
        var subst = $B.$getattr(arg, '__typing_subst__', $B.NULL)
        if (subst !== $B.NULL) {
            var iparam = tuple_index(parameters, nparams, arg);
            arg = $B.$call(subst, argitems[iparam])
        } else {
            arg = subs_tvars(arg, parameters, argitems, nitems);
        }
        if (unpack) {
            if (! $B.is_tuple(arg)) {
                var original = args[iarg]
                $B.RAISE(_b_.TypeError,
                    `expected __typing_subst__ of ${_b_.repr(original)} ` +
                    `objects to return a tuple, not ${_b_.repr(arg)}`
                )
            }
            jarg = tuple_extend(newargs, jarg,
                    arg[0], arg.length)
        } else {
            newargs[jarg] = arg
            jarg++
        }
    }
    return newargs
}

$B.GenericAlias = $B.make_builtin_class("types.GenericAlias")

$B.GenericAlias.$factory = function(origin, args) {
    var res = {
        ob_type: $B.GenericAlias,
        origin,
        args
    }
    return res
}

function GenericAlias_eq(self, other) {
    return $B.rich_comp("__eq__", self.origin, other.origin) &&
        $B.rich_comp("__eq__", self.args, other.args)
}

var ga_attr_exceptions = [
    "__class__",
    "__origin__",
    "__args__",
    "__unpacked__",
    "__parameters__",
    "__typing_unpacked_tuple_args__",
    "__mro_entries__",
    "__reduce_ex__",  // needed so we don't look up object.__reduce_ex__
    "__reduce__"
]

var ga_attr_blocked = [
    "__bases__",
    "__copy__",
    "__deepcopy__"
]

/* GenericAlias start */
$B.GenericAlias.tp_richcompare = function(self, other, op) {
    if (! $B.$isinstance(other, $B.GenericAlias)) {
        return _b_.NotImplemented
    }
    var res
    switch(op){
        case '__eq__':
            res = GenericAlias_eq(self, other)
            break
        case '__ne__':
            res = ! GenericAlias_eq(self, other)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

$B.GenericAlias.nb_or = function() {
    var $ = $B.args('__or__', 2, {self: null, other: null}, arguments)
    return $B.UnionType.$factory([$.self, $.other])
}

$B.GenericAlias.tp_repr = function(self) {
    var args = Array.isArray(self.args) ? self.args : [self.args]
    var reprs = []
    for (var arg of args) {
        if (arg === _b_.Ellipsis) {
            reprs.push('...')
        } else {
            if ($B.is_type(arg)) {
                reprs.push($B.get_name(arg))
            } else {
                reprs.push(_b_.repr(arg))
            }
        }
    }
    var iv = $B.$getattr(self.origin, '__infer_variance__', true)
    var prefix = iv ? '' : '~'
    return prefix + $B.$getattr(self.origin, '__qualname__') + '[' +
        reprs.join(", ") + ']'
}

$B.GenericAlias.tp_hash = function(self) {

}

$B.GenericAlias.tp_call = function(self, ...args) {
    return $B.$call(self.origin, ...args)
}

$B.GenericAlias.tp_getattro = function(self, name) {
    if ($B.exact_type(name, _b_.str)) {
        // When we check blocked attrs, we don't allow to proxy them to `__origin__`.
        // Otherwise, we can break existing code.
        if (ga_attr_blocked.includes(name)) {
            return _b_.object.tp_getattro(self, name)
        }
        // When we see own attrs, it has a priority over `__origin__`'s attr.
        if (ga_attr_exceptions.includes(name)) {
            return _b_.object.tp_getattro(self, name)
        }
        return _b_.object.tp_getattro(self.origin, name)
    }
}

$B.GenericAlias.tp_iter = function(self) {

}

$B.GenericAlias.tp_new = function(cls, args, kw) {
    var [origin, args] = $B.unpack_args('GenericAlias', args,
        ['origin', 'args'], {})
    return {
        ob_type: cls,
        origin,
        args,
        starred: false // ???
    }
}

$B.GenericAlias.mp_subscript = function(self, item) {
    // Populate __parameters__ if needed.
    if (! self.hasOwnProperty('parameters')) {
        self.parameters = _Py_make_parameters(self.args)
    }

    var newargs = _Py_subs_parameters(self, self.args, self.parameters, item);

    var res = $B.GenericAlias.$factory(alias.origin, newargs)
    res.starred = self.starred
    return res
}

var GenericAlias_funcs = $B.GenericAlias.tp_funcs = {}

GenericAlias_funcs.__dir__ = function(self) {

}

GenericAlias_funcs.__instancecheck__ = function(self) {

}

GenericAlias_funcs.__mro_entries__ = function(self) {
    return $B.fast_tuple([self.origin])
}

GenericAlias_funcs.__parameters___get = function(self) {
    return $B.fast_tuple()
}

GenericAlias_funcs.__parameters___set = _b_.None

GenericAlias_funcs.__reduce__ = function(self) {

}

GenericAlias_funcs.__subclasscheck__ = function(self) {

}

GenericAlias_funcs.__typing_unpacked_tuple_args___get = function(self) {

}

GenericAlias_funcs.__typing_unpacked_tuple_args___set = function(self) {

}

$B.GenericAlias.tp_methods = ["__mro_entries__", "__instancecheck__", "__subclasscheck__", "__reduce__", "__dir__"]

$B.GenericAlias.tp_members = [
    ["__origin__", $B.TYPES.OBJECT, "origin", 1],
    ["__args__", $B.TYPES.OBJECT, "args", 1],
    ["__unpacked__", $B.TYPES.BOOL, "starred", 1]
]

$B.GenericAlias.tp_getset = ["__parameters__", "__typing_unpacked_tuple_args__"]

/* GenericAlias end */

$B.set_func_names($B.GenericAlias, "types")

/*
__repr__ <slot wrapper '__repr__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__hash__ <slot wrapper '__hash__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__getattribute__ <slot wrapper '__getattribute__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__lt__ <slot wrapper '__lt__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__le__ <slot wrapper '__le__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__eq__ <slot wrapper '__eq__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__ne__ <slot wrapper '__ne__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__gt__ <slot wrapper '__gt__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__ge__ <slot wrapper '__ge__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__or__ <slot wrapper '__or__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__ror__ <slot wrapper '__ror__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__getitem__ <slot wrapper '__getitem__' of 'typing.Union' objects> <class 'wrapper_descriptor'>
__mro_entries__ <method '__mro_entries__' of 'typing.Union' objects> <class 'method_descriptor'>
__class_getitem__ <method '__class_getitem__' of 'typing.Union' objects> <class 'classmethod_descriptor'>
__args__ <member '__args__' of 'typing.Union' objects> <class 'member_descriptor'>
__name__ <attribute '__name__' of 'typing.Union' objects> <class 'getset_descriptor'>
__qualname__ <attribute '__qualname__' of 'typing.Union' objects> <class 'getset_descriptor'>
__origin__ <attribute '__origin__' of 'typing.Union' objects> <class 'getset_descriptor'>
__parameters__ <attribute '__parameters__' of 'typing.Union' objects> <class 'getset_descriptor'>
__doc__ Represent a union type

E.g. for int | str <class 'str'>
*/

$B.UnionType = $B.make_builtin_class("UnionType")

$B.UnionType.$factory = function(items) {
    return {
        ob_type: $B.UnionType,
        args: $B.fast_tuple(items)
    }
}

$B.UnionType.tp_richcompare = function(self, other, op) {
    if (! $B.$isinstance(other, $B.UnionType)) {
        return _b_.NotImplemented
    }
    switch(op){
        case '__eq__':
            return $B.list_eq(self.args, other.args)
        case '__ne__':
            return ! $B.list_eq(self.args, other.args)
        default:
            return _b_.NotImplemented
    }
}

$B.UnionType.tp_repr = function(self) {
    var t = []
    for (var item of self.args) {
        if ($B.is_type(item)) {
            var s = $B.get_name(item)
            if ($B.get_from_dict(item, '__module__') !== "builtins") {
                s = item.__module__ + '.' + s
            }
            t.push(s)
        } else {
            t.push(_b_.repr(item))
        }
    }
    return t.join(' | ')
}

$B.UnionType.nb_or = function(self, other) {
    var items = self.args.slice()
    if (! items.includes(other)) {
        items.push(other)
    }
    return $B.UnionType.$factory(items)
}

var UnionType_funcs = $B.UnionType.tp_funcs = {}

UnionType_funcs.__class_getitem__ = function(cls, items) {
    if ($B.is_tuple(items)) {
        return $B.UnionType.$factory(items)
    } else {
        return items
    }
}

UnionType_funcs.__parameters___get = function(self) {
    return $B.fast_tuple([]) // XXX
}

UnionType_funcs.__parameters___set = _b_.None

$B.UnionType.tp_members = [
    ["__args__", $B.TYPES.OBJECT, "args", 1]
]

$B.UnionType.tp_getset = ['__parameters__']

$B.UnionType.classmethods = ["__class_getitem__"]

$B.set_func_names($B.UnionType, "types")


})(__BRYTHON__);
