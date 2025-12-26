"use strict";
(function($B){

var _b_ = $B.builtins

const TPFLAGS = {
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
$B.$class_constructor = function(class_name, frame, metaclass,
                                 resolved_bases, bases,
                                 kwargs, static_attributes, annotate,
                                 firstlineno){
    var dict = frame[1] // locals
    var module = dict.__module__
    if(metaclass.__mro__ === undefined){
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

    // Keyword arguments passed to the class
    var extra_kwargs = {}
    if(kwargs){
        for(let  i = 0; i < kwargs.length; i++){
            var key = kwargs[i][0],
                val = kwargs[i][1]
            if(key != "metaclass"){
                // other keyword arguments will be passed to __init_subclass__
                extra_kwargs[key] = val
            }
        }
    }

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

    $B.make_annotate_func(dict, annotate, frame)

    // Apply method __new__ of metaclass to create the class object
    var meta_new = metaclass.tp_new
    var kls = meta_new(metaclass, class_name, resolved_bases, dict,
                       {$kw: [extra_kwargs]})
    kls.__module__ = module
    kls.$subclasses = []
    kls.$is_class = true

    kls.__static_attributes__ = $B.fast_tuple(static_attributes)
    kls.__firstlineno__ = firstlineno

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


$B.get_metaclass = function(class_name, module, bases, kw_meta){
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
                $B.set_func_names(bases[0], module)
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

function set_attr_if_absent(dict, attr, value){
    try{
        $B.$getitem(dict, attr)
    }catch(err){
        $B.$setitem(dict, attr, value)
    }
}


$B.make_class_namespace = function(metaclass, class_name, module, qualname,
                                   orig_bases, bases){
    // Use __prepare__ (PEP 3115)
    var class_dict = {
        __module__: module
    }
    if(metaclass !== _b_.type){
        var prepare = $B.$getattr(metaclass, "__prepare__", _b_.None)
        if(prepare !== _b_.None){
            var prepared = $B.$call(prepare, class_name, bases) // dict or dict-like
            for(var item of _b_.dict.$iter_items(prepared)){
                class_dict[item.key] = item.value
            }
        }
    }
    if(orig_bases !== bases){
        class_dict.__orig_bases__ = orig_bases
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



var type = _b_.type // defined in py_object.js
Object.assign(type,
{
    tp_basicsize: 936,
    tp_itersize: 40,
    tp_flags: 2155896066,
    tp_weakrefoffset: 368,
    tp_base: _b_.object,
    tp_dictoffset: 264,
    tp_doc: `type(object) -> the object's type
type(name, bases, dict, **kwds) -> a new type`,
    tp_bases: [_b_.object],
})
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
    console.log('>>>>>>>>>>>>>>  staticmethod factory', func)
    return {
        ob_type: staticmethod,
        __func__: func
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



type.__format__ = function(klass){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}

var NULL = {NULL:true}

var counter = 0

$B.search_slot = function(cls, slot, _default){
    for(var klass of cls.tp_mro){
        if(klass[slot] !== undefined){
            return klass[slot]
        }
    }
    return _default
}

$B.type_getattribute = function(klass, attr, _default){
    var test = false // attr == '__str__'
    if(test){
        console.log('type getattribute', attr, klass)

    }
    var meta = $B.get_class(klass)
    var getattro = $B.search_slot(meta, 'tp_getattro', $B.NULL)
    if(getattro === $B.NULL){
        $B.RAISE(_b_.TypeError, `type ${$B.get_name(klass)} has no __getattribute__`)
    }
    return getattro(klass, attr)
}

type.__hash__ = function(cls){
    return _b_.hash(cls)
}



type.__init_subclass__ = function(){
    // Default implementation only checks that no keyword arguments were passed
    // Defined as classmethod after set_func_names is called
    var $ = $B.args("__init_subclass__", 1, {cls: null}, ['cls'],
            arguments, {}, "args", "kwargs")
    if($.args.length > 0){
        $B.RAISE(_b_.TypeError,
            `${$.cls.__qualname__}.__init_subclass__ takes no arguments ` +
            `(${$.args.length} given)`)
    }
    if(_b_.dict.__len__($.kwargs) > 0){
        $B.RAISE(_b_.TypeError,
            `${$.cls.__qualname__}.__init_subclass__() ` +
            `takes no keyword arguments`)
    }
    return _b_.None
}

_b_.object.__init_subclass__ = type.__init_subclass__


// __name__ is a data descriptor
type.tp_name = 'type'




type.__qualname__ = 'type'



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

type.__mro__ = type.$mro(type)

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
    var $test = false // attr == '__name__'
    if($test){
        console.log('set attr', attr, 'of class', kls, 'to', value)
    }
    if(type.dict[attr] !== undefined){
        if($test){
            console.log('use type.dict', type.dict[attr])
        }
        var v = type.dict[attr]
        var vtype = $B.get_class(v)
        var setter = $B.search_slot(vtype, 'tp_descr_set', $B.NULL)
        if(setter !== $B.NULL){
            return setter(v, kls, value)
        }
    }
    if(kls.__flags__ && TPFLAGS.IMMUTABLETYPE){
        $B.RAISE(_b_.TypeError,
            `cannot set '${attr}' attribute of immutable type '` +
                kls.tp_name + "'")
    }
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
    $B.builtins_repr_check(type, arguments) // in brython_builtins.js
    var qualname = $B.get_name(kls)
    if(kls.__module__    &&
            kls.__module__ != "builtins" &&
            !kls.__module__.startsWith("$")){
        qualname = kls.__module__ + "." + qualname
    }
    return "<class '" + qualname + "'>"
}

_b_.type.tp_call = function(klass, ...args){
    if(klass === _b_.type){
        if(args.length == 1){
            return $B.get_class(args[0])
        }
        if(args.length !== 1 && args.length !== 3){
            console.log(Error().stack)
            console.log('args', args)
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
    }
    var new_func = $B.search_slot(klass, "tp_new")
    // create an instance with __new__
    var instance = new_func.apply(null, arguments),
        instance_class = $B.get_class(instance)
    if(instance_class === klass){
        // call __init__ with the same parameters
        var init_func = $B.search_slot(klass, 'tp_init', $B.NULL)
        if(init_func !== $B.NULL && init_func !== _b_.object.tp_init){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            init_func.call(null, instance, ...args)
        }
    }
    return instance
}

_b_.type.tp_getattro = function(obj, name){
    counter++
    if(counter > 50){
        console.log('overflow')
        throw Error()
    }
    var test = false // name == '__self__'
    if(test){
        console.log('class_getattr', obj, name)
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
                counter--
                var res = getter(in_mro, obj)     // data descriptor
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
            var res = local_get(attribute, _b_.None, obj)
            if(test){
                console.log('result of local_get', res)
            }
            counter--
            return res
        }
        counter--
        return attribute
    }
    if(getter !== NULL){
        if(typeof getter !== 'function'){
            console.log('getter', getter)
            console.log(Error().stack)
        }
        counter--
        return getter(in_mro, obj)  // non-data descriptor
    }
    if(in_mro !== NULL){
        counter--
        return in_mro
    }
    throw $B.attr_error(name, obj)
}

_b_.type.tp_init = function(self){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
}

_b_.type.tp_new = function(meta, name, bases, cl_dict, extra_kwargs){
    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute
    // arguments passed as keywords in class definition
    extra_kwargs = extra_kwargs === undefined ? {$kw: [{}]} :
        extra_kwargs

    // Create the class dictionary
    var module = cl_dict.__module__ ?? $B.frame_obj.frame[2]
    var qualname = cl_dict.__qualname__ ?? name

    var class_dict = Object.create(null)
    // XXX cl_dict should also be created with Object.create(null)
    var dict = Object.create(null)
    Object.assign(dict, cl_dict)

    Object.assign(class_dict,
    {
        ob_type: meta,
        tp_bases : bases.length == 0 ? [_b_.object] : bases,
        __module__: module,
        tp_name: name,
        dict,
        $is_class: true
    })

    let slots = cl_dict.__slots__
    if(slots !== undefined){
        for(let key of $B.make_js_iterator(slots)){
            class_dict[key] = member_descriptor.$factory(key, class_dict)
        }
    }

    class_dict.tp_mro = type_mro(class_dict)

    // set class attributes for faster lookups
    for(var key in cl_dict){
        var v = cl_dict[key]
        if(['__module__', '__class__', '__name__', '__qualname__'].includes(key)){
            continue
        }
        if(key.startsWith('$')){
            continue
        }
        if(v === undefined){
            continue
        }
        class_dict[key] = v

        // cf PEP 487 and issue #1178
        try{
            var set_name = $B.type_getattribute($B.get_class(v), "__set_name__")
            set_name(v, class_dict, key)
        }catch(err){
            $B.RAISE_IF_NOT(err, _b_.AttributeError)
        }
        if(typeof v == "function"){
            if(v.$function_infos === undefined){
                // internal functions have $infos
                if(v.$infos){
                    v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                }
            }else{
                v.$function_infos[$B.func_attrs.method_class] = class_dict
                v.$function_infos[$B.func_attrs.__qualname__] = name + '.' +
                    v.$function_infos[$B.func_attrs.__name__]
            }
        }
    }

    // set $tp_setattr
    class_dict.$tp_setattr = $B.search_in_mro(class_dict, '__setattr__')

    var sup = _b_.super.$factory(class_dict, class_dict)
    var init_subclass = _b_.super.tp_getattro(sup, "__init_subclass__")
    init_subclass(extra_kwargs)
    return class_dict
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
    var res = {
        ob_type: $B.mappingproxy,
        mapping: cls.dict
    }
    return res
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
    console.log('get doc')
    return cls.__doc__
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

}

type_funcs.__module___set = function(self){

}

type_funcs.__mro___get = function(self){
    return $B.get_mro(klass)
}

type_funcs.__mro___set = function(self){

}

type_funcs.__name___get = function(cls){
    console.log('name get', cls)
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

// Must do it after set_func_names to have $infos set
type.__init_subclass__ = _b_.classmethod.$factory(type.__init_subclass__)

// property (built in function)
var property = _b_.property
property.$factory = function(fget, fset, fdel, doc){
    var res = {
        ob_type: property
    }
    property.tp_init(res, fget, fset, fdel, doc)
    return res
}

property.tp_init = function(){
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

property.__get__ = function(self, kls){
    if(self.fget === undefined){
        $B.RAISE_ATTRIBUTE_ERROR("unreadable attribute", self, '__get__')
    }
    return $B.$call(self.fget, kls)
}

property.tp_new = function(cls){
    return {
        ob_type: cls
    }
}

property.__set__ = function(self, obj, value){
    if(self.fset === undefined){
        var name = self.fget.$function_infos[$B.func_attrs.__name__]
        var msg = `property '${name}' of '${$B.class_name(obj)}' object ` +
                  'has no setter'
        $B.RAISE_ATTRIBUTE_ERROR(msg, self, '__set__')
    }
    $B.$call(self.fset, obj, value)
}

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
        call_func = _b_.type.__getattribute__(metaclass, "__call__")
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
$B.GenericAlias = $B.make_builtin_class("GenericAlias")

$B.GenericAlias.$factory = function(origin_class, items){
    var res = {
        ob_type: $B.GenericAlias,
        origin_class,
        items
    }
    return res
}

$B.GenericAlias.__args__ = self => $B.fast_tuple(self.items)

$B.GenericAlias.__call__ = function(self, ...args){
    return self.origin_class.$factory.apply(null, args)
}

$B.GenericAlias.__eq__ = function(self, other){
    if(! $B.$isinstance(other, $B.GenericAlias)){
        return false
    }
    return $B.rich_comp("__eq__", self.origin_class, other.origin_class) &&
        $B.rich_comp("__eq__", self.items, other.items)
}

$B.GenericAlias.__getitem__ = function(self, item){
    $B.RAISE(_b_.TypeError, "descriptor '__getitem__' for '" +
        self.origin_class.__name__ +"' objects doesn't apply to a '" +
        $B.class_name(item) +"' object")
}

$B.GenericAlias.__mro_entries__ = function(self){
    return $B.fast_tuple([self.origin_class])
}

$B.GenericAlias.tp_new = function(origin_class, items){
    var res = {
        ob_type: $B.GenericAlias,
        origin_class,
        items,
        $is_class: true
    }
    return res
}

$B.GenericAlias.__or__ = function(){
    var $ = $B.args('__or__', 2, {self: null, other: null}, ['self', 'other'],
                    arguments, {}, null, null)
    return $B.UnionType.$factory([$.self, $.other])
}

$B.GenericAlias.__origin__ = self => self.origin_class

// In PEP 585 : "a lazily computed tuple (possibly empty) of unique
// type variables found in __args__", but what are "unique type
// variables" ?
$B.GenericAlias.__parameters__ = self => $B.fast_tuple([])

$B.GenericAlias.tp_repr = function(self){
    var items = Array.isArray(self.items) ? self.items : [self.items]
    var reprs = []
    for(var item of items){
        if(item === _b_.Ellipsis){
            reprs.push('...')
        }else{
            if(item.$is_class){
                reprs.push($B.get_name(item))
            }else{
                reprs.push(_b_.repr(item))
            }
        }
    }
    var iv = $B.$getattr(self.origin_class, '__infer_variance__', true)
    var prefix = iv ? '' : '~'
    return prefix + $B.$getattr(self.origin_class, '__qualname__') + '[' +
        reprs.join(", ") + ']'
}

$B.GenericAlias.__type_params__ = self => $B.$getattr(self.origin_class, '__type_params__')

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

console.log('member descriptor name', $B.member_descriptor.tp_name)

})(__BRYTHON__);
