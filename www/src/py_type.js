"use strict";
(function($B){

var _b_ = $B.builtins

const TPFLAGS = {
    DEFAULT: 0,
    STATIC_BUILTIN: 1 << 1,
    MANAGED_WEAKREF: 1 << 3,
    MANAGED_DICT: 1 << 4,
    SEQUENCE: 1 << 5,
    MAPPING: 1 << 6,
    DISALLOW_INSTANTIATION: 1 << 7,
    IMMUTABLETYPE: 1 << 8,
    HEAPTYPE: 1 << 9,
    BASETYPE: 1 << 10,
    HAVE_VECTORCALL: 1 << 11,
    READY: 1 << 12,
    READYING: 1 << 13,
    HAVE_GC: 1 << 14,
    METHOD_DESCRIPTOR: 1 << 17,
    VALID_VERSION_TAG:  1 << 19,
    IS_ABSTRACT: 1 << 20,
    MATCH_SELF: 1 << 22,
    LONG_SUBCLASS: 1 << 24,
    LIST_SUBCLASS: 1 << 25,
    TUPLE_SUBCLASS: 1 << 26,
    BYTES_SUBCLASS: 1 << 27,
    UNICODE_SUBCLASS: 1 << 28,
    DICT_SUBCLASS: 1 << 29,
    BASE_EXC_SUBCLASS: 1 << 30,
    TYPE_SUBCLASS: 1 << 31,
    HAVE_FINALIZE: 1 << 0,
    HAVE_VERSION_TAG: 1 << 18
}

// generic code for class constructor
$B.$class_constructor = function(class_name, dict, metaclass, resolved_bases,
        bases, extra_kwargs){
    var test = false // class_name == 'Meta'
    if(test){
        console.log('class constructor', class_name, 'dict', dict)
        console.log('metaclass', metaclass)
    }
    if(metaclass.tp_mro === undefined){
        console.log('no mro in metaclass', metaclass)
    }

    // bool is not a valid base
    for(var base of bases){
        if(base.__flags__ !== undefined &&
                 ! (base.__flags__ & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${base.__qualname__}' is not an acceptable base type`)
        }
    }

    delete extra_kwargs.metaclass

    // A class that overrides __eq__() and does not define __hash__()
    // will have its __hash__() implicitly set to None
    if(dict.__eq__ !== undefined &&
            dict.__hash__ === undefined){
        dict.__hash__ = _b_.None
    }

    // Check if class has __slots__
    var slots = dict.__slots__
    if(slots !== undefined){
        if(typeof slots == "string"){
            slots = [slots]
        }else{
            for(let item of $B.make_js_iterator(slots)){
                if(typeof item != 'string'){
                    $B.RAISE(_b_.TypeError, '__slots__ items must be ' +
                        `strings, not '${$B.class_name(item)}'`)
                }
            }
        }
        dict.__slots__ = slots
    }

    set_type_new(dict)

    // Apply method __new__ of metaclass to create the class object
    var meta_new = $B.search_slot(metaclass, 'tp_new')
    if(test){
        console.log('metaclass', metaclass, 'meta_new', meta_new)
    }
    try{
        var kls = $B.$call(meta_new, metaclass, class_name, resolved_bases, dict,
                       {$kw:[extra_kwargs]})
    }catch(err){
        console.log('error in meta_new', meta_new, extra_kwargs)
        throw err
    }
    kls.$subclasses = []
    kls.$is_class = true

    //$B.make_annotate_class(kls, annotate, frame)

    if($B.get_class(kls) === metaclass){
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.tp_getattro(metaclass, "__init__")
        try{
            $B.$call(meta_init, kls, class_name, resolved_bases, dict,
                      {$kw: [extra_kwargs]})
        }catch(err){
            if(class_name == 'SupportsInt'){
                console.log('err for', class_name)
                console.log(err)
                console.log(err.stack)
            }
            throw err
        }
    }

    // Set new class as subclass of its parents
    for(let i = 0; i < bases.length; i++){
        bases[i].$subclasses  = bases[i].$subclasses || []
        bases[i].$subclasses.push(kls)
    }

    return kls
}

function set_type_new(dict){
    // If dict has key __new__, make sure it's a staticmethod
    var new_func = $B.str_dict_get(dict, '__new__', $B.NULL)
    if(new_func !== $B.NULL){
        if($B.get_class(new_func) === $B.function){
            $B.str_dict_set(dict, '__new__', _b_.staticmethod.$factory(new_func))
        }
    }
}

function current_module(){
    if($B.frame_obj === null){
        return '<unknown>'
    }
    return $B.frame_obj.frame[2]
}

$B.get_metaclass = function(class_name, bases, kw_meta){
    // If a keyword argument "metaclass=kw_meta" is passed, kw_meta is set
    var metaclass
    if(kw_meta === undefined && bases.length == 0){
        return _b_.type
    }else if(kw_meta){
        if(! $B.$isinstance(kw_meta, _b_.type)){
            return kw_meta
        }
        metaclass = kw_meta
    }
    if(bases && bases.length > 0){
        if($B.get_class(bases[0]) === $B.JSObj){ //undefined && bases[0].ob_type === undefined){
            // Might inherit a Javascript constructor
            if(typeof bases[0] == "function"){
                if(bases.length != 1){
                    $B.RAISE(_b_.TypeError, "A Brython class " +
                        "can inherit at most 1 Javascript constructor")
                }
                $B.set_func_names(bases[0], current_module())
                return $B.JSMeta
            }else{
                $B.RAISE(_b_.TypeError, "Argument of " + class_name +
                    " is not a class (type '" + $B.class_name(bases[0]) +
                    "')")
            }
        }
        for(var base of bases){
            var mc = $B.get_class(base)
            if(metaclass === undefined){
                metaclass = mc
            }else if(mc === metaclass || _b_.issubclass(metaclass, mc)){
                // same metaclass or a subclass, do nothing
            }else if(_b_.issubclass(mc, metaclass)){
                metaclass = mc
            }else if(metaclass.tp_bases &&
                    metaclass.tp_bases.indexOf(mc) == -1){
                $B.RAISE(_b_.TypeError, "metaclass conflict: the " +
                    "metaclass of a derived class must be a (non-" +
                    "strict) subclass of the metaclasses of all its bases")
            }
        }
    }else{
        metaclass = metaclass || _b_.type
    }

    return metaclass
}

/* Determine the most derived metatype. */
function calculate_metaclass(metatype, bases){
    /* Determine the proper metatype to deal with this,
       and check for metatype conflicts while we're at it.
       Note that if some other metatype wins to contract,
       it's possible that its instances are not types. */
    var winner = metatype
    for(let tmp of bases){
        var tmptype = $B.get_class(tmp)
        if(_b_.issubclass(winner, tmptype)){
            continue;
        }
        if(_b_.issubclass(tmptype, winner)){
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

function shape_differs(t1, t2){
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

function solid_base(type){
    if($B.search_in_dict(type, '__slots__', $B.NULL) !== $B.NULL){
        return type
    }
    var base
    if(type.tp_base){
        base = solid_base(type.tp_base)
    }else{
        base = _b_.object
    }
    return base
}

/* Calculate the best base amongst multiple base classes.
   This is the first one that's on the path to the "solid base". */
function best_base(bases){
    var n = bases.length
    var base,
        winner,
        candidate
    for(let base_i of bases) {
        if(! $B.is_type(base_i)){
            $B.RAISE(_b_.TypeError, "bases must be types")
        }

        if(base_i.__flags__ !== undefined &&
                 ! (base_i.__flags__ & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${base.__name__}' is not an acceptable base type`)
        }
        candidate = solid_base(base_i)
        if(winner == undefined){
            winner = candidate
            base = base_i
        }else if(_b_.issubclass(winner, candidate)){
            // ignore
        }else if(_b_.issubclass(candidate, winner)){
            winner = candidate
            base = base_i
        }else{
            console.log('bases', bases, '\n  winner', winner, '\n  candidate', candidate)
            $B.RAISE(_b_.TypeError,
                "multiple bases have instance lay-out conflict")
        }
    }
    return base
}

function type_new_get_bases(ctx, type){
    var nbases = ctx.bases.length
    if(nbases == 0){
        // Adjust for empty tuple bases
        ctx.base = _b_.object
        ctx.bases = $B.fast_tuple([_b_.object])
        return 0
    }
    for(let base of ctx.bases){
        if($B.is_type(base)){
            continue
        }
        var rc = $B.search_in_mro(base, '__mro_entries__', $B.NULL);
        if(rc === $B.NULL){
            return -1
        }
        if(rc){
            $B.RAISE(_b_.TypeError,
                "type() doesn't support MRO entry resolution; " +
                "use types.new_class()"
            )
        }
    }

    // Search the bases for the proper metatype to deal with this
    var winner = calculate_metaclass(ctx.metatype, ctx.bases)

    if(winner !== ctx.metatype){
        var winner_new_func = $B.search_own_slot(winner, 'tp_new', $B.NULL)
        var type_new_func = $B.search_own_slot(type, 'tp_new', $B.NULL)
        if(winner_new_func !== type_new_func){
            /* Pass it to the winner */
            type = winner_new_func(winner, ...ctx.args, $B.dict2kwarg(ctx.kwds))
            return {type}
        }
        ctx.metatype = winner
    }

    /* Calculate best base, and check that all bases are type objects */
    ctx.base = best_base(ctx.bases)
    return 0
}



$B.make_class_namespace = function(metaclass, class_name, qualname,
                                   orig_bases, bases){
    // Use __prepare__ (PEP 3115)
    var prepare = $B.$getattr(metaclass, "__prepare__", $B.NULL)
    if(prepare === $B.NULL){
        $B.RAISE(_b_.TypeError, 'metaclass has no __prepare__')
    }
    var class_dict = $B.$call(prepare, class_name, bases) // dict or dict-like
    if(! $B.$isinstance(class_dict, _b_.dict)){
        $B.RAISE(_b_.TypeError,
            `${$B.get_name(metaclass)}.__prepare__() must return a mapping, ` +
            `not ${$B.class_name(class_dict)}`)
    }
    if(orig_bases !== bases){
        class_dict.__orig_bases__ = orig_bases
    }
    if(! class_dict.$all_str){
        $B.warn(_b_.RuntimeWarning,
            `non-string key in the __dict__ of class ${class_name}`)
    }
    return class_dict
}


$B.resolve_mro_entries = function(bases){
    // Replace non-class bases that have a __mro_entries__ (PEP 560)
    var new_bases = [],
        has_mro_entries = false
    for(var base of bases){
        if(! $B.$isinstance(base, _b_.type)){
            var mro_entries = $B.$getattr(base, "__mro_entries__",
                _b_.None)
            if(mro_entries !== _b_.None){
                has_mro_entries = true
                var entries = _b_.list.$factory(mro_entries(bases))
                new_bases = new_bases.concat(entries)
            }else{
                new_bases.push(base)
            }
        }else{
            new_bases.push(base)
        }
    }
    return has_mro_entries ? new_bases : bases
}

function object_get_dict(obj){
    if($B.is_type(obj)){
        return $B.mappingproxy.tp_new($B.mappingproxy, obj.dict)
    }
    return obj.dict
}

function object_set_dict(obj, value){
    obj.dict = value
}

var type = _b_.type // defined in py_object.js

type.$factory = function(){
    var missing = {},
        $ = $B.args('type', 3, {kls: null, bases: null, cl_dict: null},
            ['kls', 'bases', 'cl_dict'], arguments,
            {bases: missing, cl_dict: missing}, null, 'kw'),
        kls = $.kls,
        bases = $.bases,
        cl_dict = $.cl_dict,
        kw = $.kw

    var kwarg = {}
    for(var item of _b_.dict.$iter_items(kw)){
        kwarg[item.key] = item.value
    }
    var kwargs = {$kw: [kwarg]}
    if(cl_dict === missing){
        if(bases !== missing){
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
        var res = $B.get_class(kls)
        if(res === $B.long_int){
            return _b_.int
        }
        return res
    }else{
        var module = $B.frame_obj.frame[2],
            resolved_bases = $B.resolve_mro_entries(bases),
            metaclass = $B.get_metaclass(kls, module, resolved_bases)
        return type.__call__(metaclass, kls, resolved_bases, cl_dict, kwargs)
    }
}

//classmethod() (built in class)
var classmethod = _b_.classmethod

classmethod.$factory = function(func){
    $B.check_nb_args_no_kw('classmethod', 1, arguments)
    return {
        ob_type: classmethod,
        func
    }
}



/* classmethod start */
_b_.classmethod.tp_repr = function(self){
    return `<classmethod(${_b_.repr(self.func)})>`
}

_b_.classmethod.tp_descr_get = function(){
    // adapted from
    // https://docs.python.org/3/howto/descriptor.html#class-methods
    var $ = $B.args('classmethod', 3, {self: null, obj: null, cls: null},
                    ['self', 'obj', 'cls'], arguments, {cls: _b_.None},
                    null, null),
        self = $.self,
        obj = $.obj,
        cls = $.cls
    if(cls === _b_.None || cls === undefined){
        cls = $B.get_class(obj)
    }
    var func_class = $B.get_class(self.func),
        candidates = [func_class].concat($B.get_mro(func_class))
    for(var candidate of candidates){
        if(candidate === $B.function){
            break
        }
        if(candidate.__get__){
            return candidate.__get__(self.func, cls, cls)
        }
    }
    try{
        return $B.method.$factory(self.func, cls)
    }catch(err){
        console.log('error, self', self, self.func, 'cls', cls)
        throw err
    }
}

_b_.classmethod.tp_init = function(self, func){
    self.func = func
}

_b_.classmethod.tp_new = function(cls){
    return {
        ob_type: cls,
        func : _b_.None
    }
}

var classmethod_funcs = _b_.classmethod.tp_funcs = {}

classmethod_funcs.__annotate___get = function(self){

}

classmethod_funcs.__annotate___set = function(self){

}

classmethod_funcs.__annotations___get = function(self){

}

classmethod_funcs.__annotations___set = function(self){

}

classmethod_funcs.__class_getitem__ = $B.$class_getitem

classmethod_funcs.__func__ = function(self){
    return self.func
}

classmethod_funcs.__isabstractmethod___get = function(self){

}

classmethod_funcs.__isabstractmethod___set = function(self){

}

classmethod_funcs.__wrapped__ = function(self){
    return self.func
}

_b_.classmethod.classmethods = ["__class_getitem__"]

_b_.classmethod.tp_members = ["__func__", "__wrapped__"]

_b_.classmethod.tp_getset = ["__isabstractmethod__", "__annotations__", "__annotate__"]

/* classmethod end */

$B.set_func_names(classmethod, "builtins")


// staticmethod() built in function
var staticmethod = _b_.staticmethod
staticmethod.$factory = function(func){
    return {
        ob_type: staticmethod,
        func
    }
}

/* staticmethod start */
_b_.staticmethod.tp_repr = function(self){
    return `<staticmethod(${_b_.repr(self.func)})>`
}

_b_.staticmethod.tp_call = function(self, ...args){
    return self.func(...args)
}

_b_.staticmethod.tp_descr_get = function(self){
    return self.func
}

_b_.staticmethod.tp_init = function(self, func){
    self.func = func
}

_b_.staticmethod.tp_new = function(self){
    return {
        ob_type: _b_.staticmethod,
        func: _b_.None
    }
}

var staticmethod_funcs = _b_.staticmethod.tp_funcs = {}

staticmethod_funcs.__annotate___get = function(self){

}

staticmethod_funcs.__annotate___set = function(self){

}

staticmethod_funcs.__annotations___get = function(self){

}

staticmethod_funcs.__annotations___set = function(self){

}

staticmethod_funcs.__class_getitem__ = function(self){

}

staticmethod_funcs.__dict___get = function(self){

}

staticmethod_funcs.__dict___set = function(self){

}

staticmethod_funcs.__func__ = function(self){
    return self.func
}

staticmethod_funcs.__isabstractmethod___get = function(self){

}

staticmethod_funcs.__isabstractmethod___set = function(self){

}

staticmethod_funcs.__wrapped__ = function(self){
    return self.func
}

_b_.staticmethod.classmethods = ["__class_getitem__"]

_b_.staticmethod.tp_members = ["__func__", "__wrapped__"]

_b_.staticmethod.tp_getset = ["__isabstractmethod__", "__dict__", "__annotations__", "__annotate__"]

/* staticmethod end */

$B.set_func_names(staticmethod, "builtins")

type.$call = function(klass, new_func, init_func){
    // return factory function for classes with __init__ method
    return function(){
        // create an instance with __new__
        var instance = new_func.bind(null, klass).apply(null, arguments)
        if($B.$isinstance(instance, klass)){
            // call __init__ with the same parameters
            init_func.bind(null, instance).apply(null, arguments)
        }
        return instance
    }
}

type.$call_no_new_init = function(klass, init_func){
    // return factory function for classes without explicit __new__ method
    // and explicit __init__
    return function(){
        var instance = _b_.object.$no_new_init(klass)
        // call __init__ with the same parameters
        init_func(instance, ...arguments)
        return instance
    }
}

type.$call_no_init = function(klass, new_func){
    // return factory function for classes without __init__
    return new_func.bind(null, klass)
}



$B.$class_getitem = function(kls, origin, args){
    return $B.GenericAlias.$factory(kls, origin, args)
}

$B.merge_class_dict = function(dict, klass){
    var classdict,
        bases

    /* Merge in the type's dict (if any). */
    classdict = $B.$getattr(klass, '__dict__', null)
    if(classdict !== null){
        $B.$call($B.type_getattribute(_b_.dict, 'update'), dict, classdict)
    }else{
        return
    }
    /* Recursively merge in the base types' (if any) dicts. */
    bases = klass.tp_bases
    if(bases === undefined){
        return
    }
    for(var base of bases){
        $B.merge_class_dict(dict, base)
    }
}

$B.set_class_attr = function(cls_dict, attr, value){
    cls_dict.$strings[attr] = value
}

/*
type.__format__ = function(klass){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}
*/

var NULL = {NULL:true}

var counter = 0

$B.slot2dunder = {
    tp_call: '__call__',
    tp_descr_get: '__get__',
    tp_init: '__init__',
    tp_iter: '__iter__',
    tp_new: '__new__',
    tp_repr: '__repr__',
    tp_setattro: '__setattr__',
    tp_str: '__str__'
}

$B.dunder2slot = {}
for(var key in $B.slot2dunder){
    $B.dunder2slot[$B.slot2dunder[key]] = key
}

$B.search_own_slot = function(cls, slot, _default){
    var dunder = $B.slot2dunder[slot]
    if(cls.hasOwnProperty(slot)){
        return cls[slot]
    }
    if(dunder){
        var v = $B.str_dict_get(cls.dict, dunder, $B.NULL)
        if(v !== $B.NULL){
            if(v.ob_type.tp_descr_get){
                v = v.ob_type.tp_descr_get(v, cls)
            }
            return v
        }
    }
    return _default
}

$B.search_slot = function(cls, slot, _default){
    var dunder = $B.slot2dunder[slot]
    for(var klass of cls.tp_mro){
        if(klass.hasOwnProperty(slot)){
            return klass[slot]
        }
        if(dunder){
            var v = $B.str_dict_get(klass.dict, dunder, $B.NULL)
            if(v !== $B.NULL){
                if(typeof v !== 'function'){
                    var v_type = $B.get_class(v)
                    var getter = $B.search_slot(v_type, 'tp_descr_get', $B.NULL)
                    if(getter){
                        v = getter(v, cls)
                    }
                }
                return v
            }
        }
    }
    return _default
}

$B.type_getattribute = function(klass, attr, _default){
    var test = false // attr == 'spam'
    if(test){
        console.log('type getattribute', attr, klass)

    }
    var meta = $B.get_class(klass)
    var getattro = $B.search_slot(meta, 'tp_getattro', $B.NULL)
    if(getattro !== $B.NULL){
        if(test){
            console.log('getattro', getattro)
        }
        var res = getattro(klass, attr, $B.NULL)
        if(test){
            console.log('result of getattro', res)
        }
        if(res !== $B.NULL){
            return res
        }
    }
    var getattr = $B.search_in_mro(meta, '__getattr__', $B.NULL)
    if(getattr === $B.NULL){
        return $B.NULL
    }
    try{
        return $B.$call(getattr, klass, attr)
    }catch(err){
        if($B.is_exc(err, _b_.AttributeError)){
            return $B.NULL
        }
        throw err
    }
}


// __name__ is a data descriptor
type.tp_name = 'type'

type.__ror__ = function(){
    var len = arguments.length
    if(len != 1){
        $B.RAISE(_b_.TypeError, `expected 1 argument, got ${len}`)
    }
    return _b_.NotImplemented
}

function update_subclasses(kls, name, alias, value){
    // recursively propagate kls[alias] = value to subclasses of kls that
    // don't define kls[name]
    // For instance, set kls.$tp_setattr for subclasses that don't define
    // __setattr__
    for(var subclass of kls.$subclasses){
        if(! subclass.hasOwnProperty(name)){
            subclass[alias] = value
            update_subclasses(subclass, name, alias, value)
        }
    }
}

type.$mro = $B.make_mro

function type_mro(cls){
    return $B.$list(type.$mro(cls))
}



$B.set_func_names(type, "builtins")

function type___subclasses__(klass){

}

function type___subclasscheck__(cls, subclass){
    // Is subclass a subclass of self ?
    if(subclass.tp_bases === undefined){
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(cls) > -1
}
function type___dir__(klass){
    var dict = $B.empty_dict()
    $B.merge_class_dict(dict, klass)
    return _b_.sorted(dict)
}
function type___sizeof__(klass){
 $B.RAISE(_b_.NotImplementedError)
}

/* type start */
_b_.type.tp_setattro = function(kls, attr, value){
    var $test = false // kls.tp_name == 'A'
    if($test){
        console.log('set attr', attr, 'of class', kls, 'to', value)
        console.log('kls.dict', Object.entries(kls.dict.$strings))
    }
    var in_mro = $B.search_in_mro($B.get_class(kls), attr, $B.NULL)
    if(in_mro !== $B.NULL){
        if($test){
            console.log('use type.dict', type.dict[attr])
        }
        var in_mro_type = $B.get_class(in_mro)
        var setter = $B.search_slot(in_mro_type, 'tp_descr_set', $B.NULL)
        if(setter !== $B.NULL){
            return setter(in_mro, kls, value)
        }
    }
    if(kls.__flags__ && TPFLAGS.IMMUTABLETYPE){
        $B.RAISE(_b_.TypeError,
            `cannot set '${attr}' attribute of immutable type '` +
                kls.tp_name + "'")
    }
    if(value === $B.NULL){
        var current = $B.str_dict_get(kls.dict, attr, $B.NULL)
        if(current === $B.NULL){
            throw $B.attr_error(attr, kls)
        }
        delete kls.dict.$strings[attr]
    }else{
        $B.str_dict_set(kls.dict, attr, value)
    }
    return _b_.None
    /*
    kls[attr] = value

    var mp = kls.dict
    // mapping proxy is read-only, set key/value without using __setitem__
    mp[attr] = value

    switch(attr){
        case '__init__':
        case '__new__':
            // redefine the function that creates instances of the class
            kls.$factory = $B.$instance_creator(kls)
            break
        case "__bases__XXX":
            // redefine mro
            kls.__mro__ = _b_.type.mro(kls)
            break
        case '__setattr__':
            var initial_value = kls.$tp_setattr
            kls.$tp_setattr = value
            update_subclasses(kls, '__setattr__', '$tp_setattr', value)
            break
    }
    if($test){console.log("after setattr", kls)}
    return _b_.None
    */
}

_b_.type.nb_or = function(){
    var $ = $B.args('__or__', 2, {cls: null, other: null},  ['cls', 'other'],
                arguments, {}, null, null),
        cls = $.cls,
        other = $.other
    if(other !== _b_.None && ! $B.$isinstance(other,
            [type, $B.GenericAlias, $B.UnionType])){
        return _b_.NotImplemented
    }
    return $B.UnionType.$factory([cls, other])
}

_b_.type.tp_repr = function(kls){
    var name = $B.get_name(kls)
    var qualname
    if(kls.hasOwnProperty('tp_flags' && (kls.tp_flags & TPFLAGS.HEAPTYPE))){
        var module = $B.$getattr(kls, '__module__', $B.NULL)
        qualname = (module === $B.NULL || module == 'builtins') ? name :
            module + "." + name
    }else{
        qualname = name
    }
    return "<class '" + qualname + "'>"
}

_b_.type.tp_call = function(){
    var $ = $B.args('__call__', 1, {cls: null}, ['cls'], arguments, {}, 'args', 'kw'),
        cls = $.cls,
        args = $.args,
        kw = $.kw,
        kw_len = _b_.dict.mp_length(kw)

    var test = false // cls.tp_name === 'SimpleNamespace' // args !== undefined && Array.isArray(args) && args[0] === 'flags'
    if(test){
        console.log('type.tp_call', cls, args)
        console.log(Error('trace').stack)
    }
    if(cls === _b_.type){
        if($.args.length == 1 && kw_len == 0){
            // one argument: return type of argument
            return $B.get_class(args[0])
        }
        if(args.length !== 1 && args.length !== 3){
            console.log(Error('trace').stack)
            console.log('args', args)
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
    }
    var new_func = $B.search_slot(cls, "tp_new")
    if(test){
        console.log('new_func', new_func)
    }

    // create an instance with __new__
    var instance = new_func(cls, ...args, $B.dict2kwarg(kw)), //arguments),
        instance_class = $B.get_class(instance)
    if(test){
        console.log('instance of type', instance)
        console.log('instance type is cls ?', instance_class === cls)
    }
    if(instance_class === cls){
        // call __init__ with the same parameters
        var init_func = $B.search_slot(cls, 'tp_init', $B.NULL)
        if(test){
            console.log('init func', init_func)
        }
        if(init_func !== $B.NULL && init_func !== _b_.object.tp_init){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            try{
                if(kw_len > 0){
                    var kwarg = $B.dict2kwarg(kw) //{$kw: [kw.$strings]} // {$kw:[{x: 1}, locals.kw]}
                    init_func.call(null, instance, ...$.args, kwarg)
                }else{
                    init_func.call(null, instance, ...$.args)
                }
            }catch(err){
                console.log('error in init of', cls)
                console.log('frame obj', $B.frame_obj)
                throw err
            }
        }
    }
    return instance
}

_b_.type.tp_getattro = function(obj, name){
    var test = false // name == 'spam'
    if(test){
        console.log('class_getattr', obj, name)
        console.log('frame obj', $B.frame_obj)
    }
    var klass = $B.get_class(obj)
    var in_mro = $B.search_in_mro(klass, name, NULL)
    // print('in mro', in_mro, type(in_mro), in_mro is null)
        if(test){
            console.log('attr', name, 'of class', klass)
            console.log('in mro', in_mro)
        }
    var getter = NULL
    if(in_mro !== NULL){
        var in_mro_class = $B.get_class(in_mro)
        if(test){
            console.log('in_mro class', in_mro_class)
        }
        var getter = $B.search_slot(in_mro_class, 'tp_descr_get', NULL)
        if(test){
            console.log('getter', getter)
        }
        if(getter !== NULL){
            if($B.search_slot(in_mro_class, 'tp_descr_set', NULL) !== NULL){
                if(test){
                    console.log('data descriptor', name)
                    console.log('__set__', $B.search_slot(in_mro_class, 'tp_descr_set', NULL))
                }
                var res = getter(in_mro, obj, klass)     // data descriptor
                if(test){
                    console.log('result of getter', res)
                }
                return res
            }else{
                if(test){
                    console.log('non-data descriptor', name)
                }
            }
        }
    }
    if(test){
        console.log('search attribute', name, 'in mro', obj)
   }
    var attribute = $B.search_in_mro(obj, name, NULL)
    if(attribute !== NULL){
        if(test){
            console.log('attribute', attribute)
            console.log('class', $B.get_class(attribute))
        }
        var local_get = $B.search_slot($B.get_class(attribute), 'tp_descr_get', NULL)
        if(test){
            console.log('local_get', local_get)
        }
        if(local_get !== NULL){
            var res = local_get(attribute, $B.NULL, obj)
            if(test){
                console.log('result of local_get', res)
            }
            return res
        }
        return attribute
    }else if(test){
        console.log('no attribute')
    }
    if(getter !== NULL){
        if(typeof getter !== 'function'){
            console.log('getter', getter)
            console.log(Error().stack)
        }
        return getter(in_mro, obj)  // non-data descriptor
    }
    if(in_mro !== NULL){
        return in_mro
    }
    return $B.NULL
}

_b_.type.tp_init = function(self){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
}

_b_.type.tp_new = function(metatype, name, bases, cl_dict, extra_kwargs){
    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute
    // arguments passed as keywords in class definition
    var $ = $B.args('__new__', 1, {metatype: null}, ['metatype'], arguments,
                {}, 'args', 'kwds')
    var args = $.args,
        kwds = $.kwds
    var test = false // name == 'EnumCheck'
    if(test){
        console.log('type.tp_new', name, 'metatype', metatype,
            'extrakw', extra_kwargs)
    }
    extra_kwargs = kwds

    // Create the class dictionary
    var module = $B.str_dict_get(cl_dict, '__module__', $B.frame_obj.frame[2])
    $B.set_class_attr(cl_dict, '__module__', module)
    var qualname = $B.str_dict_get(cl_dict, '__qualname__', name)

    var [name, bases, orig_dict] = args

    var ctx = {
        metatype,
        args,
        kwds,
        orig_dict,
        name,
        bases
    }
    // PyObject *type = NULL;
    var res = type_new_get_bases(ctx, type)
    if(test){
        console.log('result of type_new_get_bases', res)
    }
    if(res < 0){
        assert(PyErr_Occurred());
        return NULL;
    }
    if(res == 1){
        return type
    }
    if(res instanceof Object){
        if(test){
            console.log('type.tp_new returns', res.type)
        }
        return res.type
    }
    //type = type_new_impl(ctx)

    /*
    if(meta === _b_.type){
        var resolved_bases = $B.resolve_mro_entries(bases)
        meta = $B.get_metaclass(name, resolved_bases)
        if(test){
            console.log('metaclass from bases', meta)
        }
    }

    var meta_new = $B.search_slot(meta, 'tp_new', $B.NULL)
    if(meta_new === $B.NULL){
        $B.RAISE(_b_.TypeError, `no __new__ for metaclass ${name}`)
    }
    if(meta_new !== _b_.type.tp_new){
        console.log('meta_new', meta_new)
        throw Error('trace')
        return meta_new.apply(null, arguments)
    }
    */
    var class_obj = {
        ob_type: ctx.metatype,
        tp_bases : ctx.bases,
        __module__: module,
        tp_name: name,
        dict: cl_dict,
        $is_class: true
    }

    let slots = $B.str_dict_get(cl_dict, '__slots__', $B.NULL)
    if(slots !== $B.NULL){
        for(let key of $B.make_js_iterator(slots)){
            $B.str_dict_set(cl_dict, key,
                $B.member_descriptor.$factory(key, class_obj))
        }
    }

    $B.str_dict_set(class_obj.dict, '__dict__',
            $B.getset_descriptor.$factory(
            class_obj,
            '__dict__',
            [object_get_dict, object_set_dict]
        )
    )

    class_obj.tp_mro = type_mro(class_obj)

    // set class attributes
    for(var item of _b_.dict.$iter_items(cl_dict)){
        var key = item.key,
            v = item.value
        if(test){
            console.log('check __set_name__ for', key, v)
        }
        if(['__module__', '__class__', '__name__', '__qualname__'].includes(key)){
            continue
        }
        if(key.startsWith('$')){
            continue
        }
        if(v === undefined){
            continue
        }

        // cf PEP 487 and issue #1178
        var set_name = $B.type_getattribute($B.get_class(v), "__set_name__")
        if(set_name !== $B.NULL){
            $B.$call(set_name, v, class_obj, key)
        }
        if(typeof v == "function"){
            if(v.$function_infos === undefined){
                // internal functions have $infos
                if(v.$infos){
                    v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                }
            }else{
                v.$function_infos[$B.func_attrs.method_class] = class_obj
                v.$function_infos[$B.func_attrs.__qualname__] = name + '.' +
                    v.$function_infos[$B.func_attrs.__name__]
            }
        }
    }

    var sup = $B.$call(_b_.super, class_obj, class_obj)
    var init_subclass = _b_.super.tp_getattro(sup, "__init_subclass__")
    if(test){
        console.log('call init subclass with extra_kwargs', extra_kwargs)
    }
    try{
        $B.dict2kwarg(extra_kwargs)
    }catch(err){
        console.log('error for extra_kwargs', extra_kwargs)
        console.log('tp new', name)
        console.log(err)
        throw err
    }
    $B.$call(init_subclass, $B.dict2kwarg(extra_kwargs))
    return class_obj
}

var type_funcs = _b_.type.tp_funcs = {}

type_funcs.__abstractmethods___get = function(cls){
    if(cls !== type) {
        var res = type.dict.__abstractmethods__
        if(res !== undefined){
            return res
        }
    }
    throw attr_error('__abstractmethods__', cls)
}

type_funcs.__abstractmethods___set = function(cls, value){
    $B.RAISE(_b_.NotImplementedError)
}

type_funcs.__annotate___get = function(self){

}

type_funcs.__annotate___set = function(self){

}

type_funcs.__annotations___get = function(self){
    console.log('get annotations', self)
}

type_funcs.__annotations___set = function(self){

}

type_funcs.__base__ = function(self){

}

type_funcs.__bases___get = function(self){

}

type_funcs.__bases___set = function(self){

}

type_funcs.__basicsize__ = function(self){

}

type_funcs.__dict___get = function(cls){
    return {
        ob_type: $B.mappingproxy,
        mapping: cls.dict
    }
}

type_funcs.__dict___set = function(self){

}

type_funcs.__dictoffset__ = function(self){

}

type_funcs.__dir__ = function(klass){
    var dict = $B.empty_dict()
    $B.merge_class_dict(dict, klass)
    return _b_.list.$factory(dict)
}

type_funcs.__doc___get = function(cls){
    return $B.str_dict_get(cls.dict, '__doc__', _b_.None)
}

type_funcs.__doc___set = function(cls, value){
    cls.__doc__ = value
}

type_funcs.__flags__ = function(self){

}

type_funcs.__instancecheck__ = function(cls, instance){
    var kl = $B.get_class(instance)
    var mro = $B.get_mro(kl)
    for(var klass of mro){
        if(klass === cls){
            return true
        }
    }
    return false
}

type_funcs.__itemsize__ = function(self){

}

type_funcs.__module___get = function(self){
    if(self.dict){
        var module = $B.str_dict_get(self.dict, '__module__', $B.NULL)
        if(module !== $B.NULL){
            return module
        }
    }
    return 'builtins'
}

type_funcs.__module___set = function(self){

}

type_funcs.__mro___get = function(self){
    return $B.fast_tuple($B.get_mro(self))
}

type_funcs.__mro___set = function(self){

}

type_funcs.__name___get = function(cls){
    return $B.get_name(cls)
}

type_funcs.__name___set = function(cls,value){
    console.log('set name of class', cls, value)
    cls.tp_name = value
}

type_funcs.__prepare__ = function(cls){
    return $B.empty_dict()
}

type_funcs.__qualname___get = function(cls){
    return $B.get_name(cls)
}

type_funcs.__qualname___set = function(cls, value){
    cls.tp_name = value
}

type_funcs.__sizeof__ = function(self){

}

type_funcs.__subclasscheck__ = function(self, subclass){
    // Is subclass a subclass of self ?
    var klass = self
    if(subclass.tp_bases === undefined){
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(klass) > -1
}

type_funcs.__subclasses__ = function(self){

}

type_funcs.__text_signature___get = function(self){

}

type_funcs.__text_signature___set = function(self){

}

type_funcs.__type_params___get = function(self){

}

type_funcs.__type_params___set = function(self){

}

type_funcs.__weakrefoffset__ = function(self){

}

type_funcs.mro = function(self){

}

_b_.type.tp_methods = ["mro", "__subclasses__", "__instancecheck__", "__subclasscheck__", "__dir__", "__sizeof__"]

_b_.type.classmethods = ["__prepare__"]

_b_.type.tp_members = ["__basicsize__", "__itemsize__", "__flags__", "__weakrefoffset__", "__base__", "__dictoffset__"]

_b_.type.tp_getset = ["__name__", "__qualname__", "__bases__", "__mro__", "__module__", "__abstractmethods__", "__dict__", "__doc__", "__text_signature__", "__annotations__", "__annotate__", "__type_params__"]

/* type end */


// property (built in function)
var property = _b_.property
property.$factory = function(fget, fset, fdel, doc){
    var res = {
        ob_type: property
    }
    property.tp_init(res, fget, fset, fdel, doc)
    return res
}


/* property start */
_b_.property.tp_descr_set = function(self, obj, value){
    if(self.fset === undefined){
        var name = self.fget.$function_infos[$B.func_attrs.__name__]
        var msg = `property '${name}' of '${$B.class_name(obj)}' object ` +
                  'has no setter'
        $B.RAISE_ATTRIBUTE_ERROR(msg, self, '__set__')
    }
    $B.$call(self.fset, obj, value)
}

_b_.property.tp_descr_get = function(self, obj, type){
    if(obj === _b_.None){
        return self
    }
    if(self.fget === undefined){
        $B.RAISE_ATTRIBUTE_ERROR("unreadable attribute", self, '__get__')
    }
    return $B.$call(self.fget, obj)
}

_b_.property.tp_init = function(){
    var $ = $B.args('__init__', 5,
                {self: null, fget: null, fset: null, fdel: null, doc: null},
                ['self', 'fget', 'fset', 'fdel', 'doc'], arguments,
                {fget: _b_.None, fset: _b_.None, fdel: _b_.None, doc: _b_.None},
                null, null),
        self = $.self,
        fget = $.fget,
        fset = $.fset,
        fdel = $.fdel,
        doc = $.doc
    self.__doc__ = doc
    if($B.$getattr && doc === _b_.None){
        self.__doc__ = $B.$getattr(fget, '__doc__', doc)
    }
    self.$type = fget.$type
    self.fget = fget
    self.fset = fset
    self.fdel = fdel
    self.$is_property = true

    if(fget && fget.$attrs){
        for(var key in fget.$attrs){
            self[key] = fget.$attrs[key]
        }
    }

    self.__delete__ = fdel;

    self.getter = function(fget){
        return property.$factory(fget, self.fset, self.fdel, self.__doc__)
    }
    self.setter = function(fset){
        return property.$factory(self.fget, fset, self.fdel, self.__doc__)
    }
    self.deleter = function(fdel){
        return property.$factory(self.fget, self.fset, fdel, self.__doc__)
    }
}

_b_.property.tp_new = function(cls){
    return {
        ob_type: cls
    }
}

var property_funcs = _b_.property.tp_funcs = {}

property_funcs.__doc__ = function(self){

}

property_funcs.__isabstractmethod___get = function(self){

}

property_funcs.__isabstractmethod___set = function(self){

}

property_funcs.__name___get = function(self){
    console.log('property name', self)
    return $B.$getattr(self.fget, '__name__')
}

property_funcs.__name___set = function(self){

}

property_funcs.__set_name__ = function(self){

}

property_funcs.deleter = function(self){
    return self.deleter
}

property_funcs.fdel = function(self){
    return self.fdel
}

property_funcs.fget = function(self){
    return self.fget
}

property_funcs.fset = function(self){
    return self.fset
}

property_funcs.getter = function(self){
    return self.getter
}

property_funcs.setter = function(self){
    return self.setter
}

_b_.property.tp_methods = ["getter", "setter", "deleter", "__set_name__"]

_b_.property.tp_members = ["fget", "fset", "fdel", "__doc__"]

_b_.property.tp_getset = ["__name__", "__isabstractmethod__"]

/* property end */

$B.set_func_names(property, "builtins")

$B.$instance_creator = function(klass){
    var test = false // klass.__name__ == 'SimpleNamespace'
    if(test){
        console.log('instance creator of', klass)
    }
    // return the function to initalise a class instance
    if(klass.prototype && klass.prototype.constructor == klass){
        // JS constructor
        return function(){
            return new klass(...arguments)
        }
    }

    // The class may not be instanciable if it has at least one abstract method
    if(klass.__abstractmethods__ && $B.$bool(klass.__abstractmethods__)){
        return function(){
            var ams = Array.from($B.make_js_iterator(klass.__abstractmethods__))
            ams.sort()
            var quoted_methods = ams.map(m => "'" + m + "'").join(', ')
            var method_word = ams.length > 1 ? 'methods' : 'method'
            $B.RAISE(_b_.TypeError,
                "Can't instantiate abstract class " + klass.__name__ +
                " without an implementation for abstract " + method_word + " " +
                quoted_methods)
        }
    }
    var metaclass = $B.get_class(klass),
        call_func,
        factory
    if(metaclass === _b_.type){
        var new_func = type.tp_getattro(klass, '__new__'),
            init_func = type.tp_getattro(klass, '__init__')
        if(init_func === _b_.object.__init__){
            if(new_func === _b_.object.__new__){
                factory = _b_.object.$new(klass)
            }else{
                factory = new_func.bind(null, klass)
            }
        }else if(new_func === _b_.object.__new__){
            factory = type.$call_no_new_init(klass, init_func)
        }else{
            factory = type.$call(klass, new_func, init_func)
        }
        if(test){
            console.log('factory', factory)
        }
    }else{
        call_func = _b_.type.tp_getattro(metaclass, "__call__")
        if(call_func.$is_class){
            factory = call_func
        }else{
            factory = call_func.bind(null, klass)
        }
    }
    factory.ob_type = $B.function
    factory.$infos = {
        __name__: klass.__name__,
        __module__: klass.__module__
    }
    return factory
}




$B.make_iterator_class = function(name, reverse){
    // Builds a class to iterate over items

    var klass = {
        ob_type: _b_.type,
        __mro__: [_b_.object],
        __name__: name,
        __qualname__: name,

        $factory: function(items){
            return {
                ob_type: klass,
                dict: $B.empty_dict(),
                counter: reverse ? items.length : -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
        },
        $is_class: true,
        $iterator_class: true,

        tp_iter: function(self){
            self.counter =
                self.counter === undefined
                    ? reverse
                        ? self.items.length
                        : - 1
                    : self.counter
            self.len = self.items.length
            return self
        },

        __len__: function(self){
            return self.items.length
        },

        tp_iternext: function(self){
            if(typeof self.test_change == "function"){
                var message = self.test_change()
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                if(message){
                    $B.RAISE(_b_.RuntimeError, message)
                }
            }

            if(reverse){
                self.counter--
                if(self.counter >= 0){
                    var item = self.items[self.counter]
                    if(self.items.$is_js_array){
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            }else{
                self.counter++
                if(self.counter < self.items.length){
                    var item = self.items[self.counter]
                    if(self.items.$is_js_array){
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            }
            $B.RAISE(_b_.StopIteration, "StopIteration")
        },

        __reduce_ex__: function(self){
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}


// PEP 585
function _Py_make_parameters(args){
    var is_args_list = $B.$isinstance(args, _b_.list)
    var tuple_args
    if(is_args_list){
        args = tuple_args = $B.fast_tuple(args)
    }
    var nargs = args.length
    var len = nargs
    var parameters = $B.fast_tuple()
    var iparam = 0
    for(let iarg = 0; iarg < nargs; iarg++){
        let t = args[iarg]
        // We don't want __parameters__ descriptor of a bare Python class.
        if($B.is_type(t)){
            continue
        }
        var rc = $B.$getattr(t, '__typing_subst__', $B.NULL)
        if(rc !== $B.NULL){
            parameters.push(t)
            iparam++
        }else{
            var subparams = $B.$getattr(t, '__parameters__', $B.NULL)
            if(subparams === $B.NULL &&
                    $B.$isinstance(t, [_b_.tuple, _b_.list])){
                // Recursively call _Py_make_parameters for lists/tuples and
                // add the results to the current parameters.
                subparams = _Py_make_parameters(t)
            }
            if(subparams && $B.$isinstance(subparams, _b_.tuple)){
                var len2 = subparams.length
                var needed = len2 - 1 - (iarg - iparam)
                if(needed > 0){
                    len += needed;
                    _PyTuple_Resize(parameters, len)
                }
                for(let t2 of subparams){
                    parameters.push(t2)
                    iparam++
                }
            }
        }
    }
    if(iparam < len){
        _PyTuple_Resize(parameters, iparam)
    }
    return parameters
}

function _unpacked_tuple_args(arg){
    var result
    // Fast path
    if($B.exact_type(arg, $B.GenericAlias) &&
            arg.starred &&
            arg.origin == _b_.tuple){
        return arg.args
    }

    var result = $B.$getattr(arg, '__typing_unpacked_tuple_args__', $B.NULL)
    if(result !== $B.NULL) {
        if(result === _b_.None){
            return $B.NULL
        }
        return result
    }
    return $B.NULL
}

function _unpack_args(item){
    var newargs = []
    var is_tuple = $B.$isinstance(item, _b_.tuple)
    var nitems = is_tuple ? item.length : 1
    var argitems = is_tuple ? item[0] : item
    for(let item of argitems){
        if(! $B.is_type(item)){
            var subargs = _unpacked_tuple_args(item)
            if (subargs !== $B.NULL &&
                    $B.$isinstance(subargs, _b_.tuple) &&
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

function _is_unpacked_typevartuple(arg){
    var tmp
    if($B.is_type(arg)){ // TODO: Add test
        return 0
    }
    var tmp = $B.$getattr(arg, '__typing_is_unpacked_typevartuple__', $B.NULL)
    if(tmp !== $B.NULL){
        res = !!tmp
    }
    return res
}

function subs_tvars(obj, params, argitems, nargs){
    var subparams
    var subparams = $B.$getattr(obj, '__parameters__', $B.NULL)
    if(subparams !== $B.NULL &&
            $B.$isinstance(subparams, _b_.tuple) &&
            subparams.length > 0){
        var nparams = params.length
        var nsubargs = subparams.length
        var subargs = $B.fast_tuple()
        var j = 0
        for(let arg of subparams){
            var iparam = tuple_index(params, nparams, arg)
            if(iparam >= 0){
                var param = params[iparam]
                arg = argitems[iparam]
                if($B.get_class(param).tp_iter && $B.$isinstance(arg, _b_.tuple)){  // TypeVarTuple
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

function _Py_subs_parameters(self, args, parameters, item){
    var nparams = parameters.length
    if(nparams == 0){
        $B.RAISE(_b_.TypeError,
            `${_b_.repr(self)} is not a generic class`
        )
    }
    item = _unpack_args(item)
    for(let param of parameters) {
        var tmp
        var prepare = $B.$getattr(param, '__typing_prepare_subst__', $B.NULL)
        if (prepare !== $B.NULL && prepare != _b_.None){
            tmp = $B.$call(prepare, self, item)
            item = tmp
        }
    }
    var is_tuple = $B.$isinstance(item, _b_.tuple)
    var nitems = is_tuple ? item.length : 1
    var argitems = is_tuple ? item[0] : item
    if(nitems != nparams){
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
    var is_args_list = $B.$isinstance(args, _b_.list)
    var tuple_args
    if(is_args_list){
        args = tuple_args = $B.fats_tuple(args)
    }
    var nargs = args.length
    var newargs = $B.fast_tuple()
    for(let iarg = 0, jarg = 0; iarg < nargs; iarg++){
        var arg = args[iarg]
        if($B.is_type(arg)){
            newargs[jarg] = arg
            jarg++
            continue
        }
        // Recursively substitute params in lists/tuples.
        if($B.$isinstance(arg, [_b_.tuple, _b_.list])){
            var subargs = _Py_subs_parameters(self, arg, parameters, item)
            if($B.$isinstance(arg, _b_.tuple)){
                newargs[jarg] = subargs
            }else{
                // _Py_subs_parameters returns a tuple. If the original arg was a list,
                // convert subargs to a list as well.
                newargs[jarg] = $B.$list(subargs)
            }
            jarg++
            continue
        }
        var unpack = _is_unpacked_typevartuple(arg);
        var subst = $B.$getattr(arg, '__typing_subst__', $B.NULL)
        if(subst !== $B.NULL){
            var iparam = tuple_index(parameters, nparams, arg);
            arg = $B.$call(subst, argitems[iparam])
        }else{
            arg = subs_tvars(arg, parameters, argitems, nitems);
        }
        if(unpack){
            if(! $B.$isinstance(arg, _b_.tuple)){
                var original = args[iarg]
                $B.RAISE(_b_.TypeError,
                    `expected __typing_subst__ of ${_b_.repr(original)} ` +
                    `objects to return a tuple, not ${_b_.repr(arg)}`
                )
            }
            jarg = tuple_extend(newargs, jarg,
                    arg[0], arg.length)
        }else{
            newargs[jarg] = arg
            jarg++
        }
    }
    return newargs
}

$B.GenericAlias = $B.make_builtin_class("types.GenericAlias")

$B.GenericAlias.$factory = function(origin, args){
    var res = {
        ob_type: $B.GenericAlias,
        origin,
        args
    }
    return res
}

function GenericAlias_eq(self, other){
    return $B.rich_comp("__eq__", self.origin, other.origin) &&
        $B.rich_comp("__eq__", self.args, other.args)
}

$B.GenericAlias.__mro_entries__ = function(self){
    return $B.fast_tuple([self.origin])
}

$B.GenericAlias.__or__ = function(){
    var $ = $B.args('__or__', 2, {self: null, other: null}, ['self', 'other'],
                    arguments, {}, null, null)
    return $B.UnionType.$factory([$.self, $.other])
}

// In PEP 585 : "a lazily computed tuple (possibly empty) of unique
// type variables found in __args__", but what are "unique type
// variables" ?
$B.GenericAlias.__parameters__ = self => $B.fast_tuple([])

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
$B.GenericAlias.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, $B.GenericAlias)){
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

$B.GenericAlias.nb_or = function(self){

}

$B.GenericAlias.tp_repr = function(self){
    var args = Array.isArray(self.args) ? self.args : [self.args]
    var reprs = []
    for(var arg of args){
        if(arg === _b_.Ellipsis){
            reprs.push('...')
        }else{
            if($B.is_type(arg)){
                reprs.push($B.get_name(arg))
            }else{
                reprs.push(_b_.repr(arg))
            }
        }
    }
    var iv = $B.$getattr(self.origin, '__infer_variance__', true)
    var prefix = iv ? '' : '~'
    return prefix + $B.$getattr(self.origin, '__qualname__') + '[' +
        reprs.join(", ") + ']'
}

$B.GenericAlias.tp_hash = function(self){

}

$B.GenericAlias.tp_call = function(self, ...args){
    return $B.$call(self.origin, ...args)
}

$B.GenericAlias.tp_getattro = function(self, name){
    if($B.exact_type(name, _b_.str)){
        // When we check blocked attrs, we don't allow to proxy them to `__origin__`.
        // Otherwise, we can break existing code.
        if(ga_attr_blocked.includes(name)){
            return _b_.object.tp_getattro(self, name)
        }
        // When we see own attrs, it has a priority over `__origin__`'s attr.
        if(ga_attr_exceptions.includes(name)){
            return _b_.object.tp_getattro(self, name)
        }
        return _b_.object.tp_getattro(self.origin, name)
    }
}

$B.GenericAlias.tp_iter = function(self){

}

$B.GenericAlias.tp_new = function(cls, origin, args){
    return {
        ob_type: cls,
        origin,
        args
    }
}

$B.GenericAlias.mp_subscript = function(self, item){
    // Populate __parameters__ if needed.
    if (! self.hasOwnProperty('parameters')){
        self.parameters = _Py_make_parameters(self.args)
    }

    var newargs = _Py_subs_parameters(self, self.args, self.parameters, item);

    var res = $B.GenericAlias.$factory(alias.origin, newargs)
    res.starred = self.starred
    return res
}

var GenericAlias_funcs = $B.GenericAlias.tp_funcs = {}

GenericAlias_funcs.__args__ = function(self){
    return self.args
}

GenericAlias_funcs.__dir__ = function(self){

}

GenericAlias_funcs.__instancecheck__ = function(self){

}

GenericAlias_funcs.__mro_entries__ = function(self){

}

GenericAlias_funcs.__origin__ = function(self){
    return self.origin
}

GenericAlias_funcs.__parameters___get = function(self){

}

GenericAlias_funcs.__parameters___set = function(self){

}

GenericAlias_funcs.__reduce__ = function(self){

}

GenericAlias_funcs.__subclasscheck__ = function(self){

}

GenericAlias_funcs.__typing_unpacked_tuple_args___get = function(self){

}

GenericAlias_funcs.__typing_unpacked_tuple_args___set = function(self){

}

GenericAlias_funcs.__unpacked__ = function(self){

}

$B.GenericAlias.tp_methods = ["__mro_entries__", "__instancecheck__", "__subclasscheck__", "__reduce__", "__dir__"]

$B.GenericAlias.tp_members = ["__origin__", "__args__", "__unpacked__"]

$B.GenericAlias.tp_getset = ["__parameters__", "__typing_unpacked_tuple_args__"]

/* GenericAlias end */

$B.set_func_names($B.GenericAlias, "types")

$B.UnionType = $B.make_builtin_class("UnionType")

$B.UnionType.$factory = function(items){
    return {
        ob_type: $B.UnionType,
        items
    }
}

var UnionType_funcs = $B.UnionType.tp_funcs = {}

UnionType_funcs.__args__ = function(self){
    return $B.fast_tuple(self.items)
}

$B.UnionType.__class_getitem__ = function(cls, items){
    if($B.$isinstance(items, _b_.tuple)){
        return $B.UnionType.$factory(items)
    }else{
        return items
    }
}

$B.UnionType.__eq__ = function(self, other){
    if(! $B.$isinstance(other, $B.UnionType)){
        return _b_.NotImplemented
    }
    return _b_.list.__eq__(self.items, other.items)
}

$B.UnionType.__or__ = function(self, other){
    var items = self.items.slice()
    if(! items.includes(other)){
        items.push(other)
    }
    return $B.UnionType.$factory(items)
}

UnionType_funcs.__parameters___get = function(self){
    return $B.fast_tuple([]) // XXX
}

$B.UnionType.tp_repr = function(self){
    var t = []
    for(var item of self.items){
        if(item.$is_class){
            var s = item.__name__
            if(item.__module__ !== "builtins"){
                s = item.__module__ + '.' + s
            }
            t.push(s)
        }else{
            t.push(_b_.repr(item))
        }
    }
    return t.join(' | ')
}

$B.UnionType.tp_members = ['__args__']

$B.UnionType.tp_getset = ['__parameters__']

$B.set_func_names($B.UnionType, "types")


$B.make_annotate_func = function(dict, annotations, class_frame){
    if(annotations === undefined){
        dict.__annotate_func__ = _b_.None
        return
    }
    var __annotate_func__ = annotations
    dict.__annotate_func__ = __annotate_func__
    $B.set_function_infos(__annotate_func__,
        {
            __defaults__: _b_.None,
            __kwdefaults__: _b_.None,
            __name__: '__annotate__',
            __module__: class_frame[2],
            __qualname__: class_frame[0] + '.__annotate__'
        }
    )
}

$B.postpone_annotations = function(obj, file){
    // create property __annotations__ for a module with
    // "from __future__ import annotations
    var module_frame = $B.frame_obj.frame
    obj.$annotations = {}
    Object.defineProperty(obj, '__annotations__',
        {
            configurable: true,
            get(){
                if(obj.$set_annotations){
                    return obj.$set_annotations
                }
                var res = $B.empty_dict()
                for(var key in obj.$annotations){
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

$B.make_module_annotate = function(locals){
    Object.defineProperty(locals, '__annotations__',
        {
            get() {
                if(locals.$set_annotations){
                    return locals.$set_annotations
                }
                if(locals.__annotate__){
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
                if(locals.$annotate){
                    return locals.$annotate
                }
                return locals.__annotate_func__
            },
            set(value){
                locals.$annotate = value
            }
        }
    )
    locals.__annotate_func__ = function(format){
        switch(format){
            case 1:
                var ann_dict = $B.empty_dict()
                for(var key in locals.$annotations){
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


})(__BRYTHON__);
