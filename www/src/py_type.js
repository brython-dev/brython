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
            meta_init(kls, class_name, resolved_bases, dict,
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
            var prepared = $B.$call(prepare)(class_name, bases) // dict or dict-like
            for(var item of _b_.dict.$iter_items(prepared)){
                class_dict[item.key] = item.value
            }
        }
    }
    if(orig_bases !== bases){
        class_dict.__orig_bases__ = orig_bases
    }
    return class_dict
    /*
    if($B.get_class(class_dict) === _b_.dict){
        if(class_dict.$all_str){
            return class_dict.$strings
        }
        return new Proxy(class_dict, {
            get: function(target, prop){
                if(prop == '__class__'){
                    return _b_.dict
                }else if(prop == '$target'){
                    return target
                }
                if(_b_.dict.$contains_string(target, prop)){
                    return _b_.dict.$getitem_string(target, prop)
                }
                return undefined
            },
            set: function(target, prop, value){
                _b_.dict.$setitem(target, prop, value)
            }
        })
    }else{
        var setitem = $B.$call($B.$getattr(class_dict, "__setitem__")),
            getitem = $B.$getattr(class_dict, "__getitem__")
        return new Proxy(class_dict, {
            get: function(target, prop){
                if(prop == '__class__'){
                    return $B.get_class(target)
                }else if(prop == '$target'){
                    return target
                }
                try{
                    return getitem(prop)
                }catch(err){
                    return undefined
                }
            },
            set: function(target, prop, value){
                try{
                    setitem(prop, value)
                }catch(err){
                    console.log('error calling setitem', setitem)
                    console.log('class dict', class_dict)
                    console.log('prop', prop, 'value', value)
                    console.log('frame obj', $B.frame_obj)
                    throw err
                }
                return _b_.None
            }
        })
    }
    */
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
        __func__: func
    }
}

classmethod.tp_descr_get = function(){
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
    var func_class = $B.get_class(self.__func__),
        candidates = [func_class].concat(func_class.__mro__)
    for(var candidate of candidates){
        if(candidate === $B.function){
            break
        }
        if(candidate.__get__){
            return candidate.__get__(self.__func__, cls, cls)
        }
    }
    return $B.method.$factory(self.__func__, cls)
}

classmethod.tp_repr = function(self){
    return `<classmethod(${_b_.repr(self.__func__)})>`
}

$B.set_func_names(classmethod, "builtins")


// staticmethod() built in function
var staticmethod = _b_.staticmethod
staticmethod.$factory = function(func){
    return {
        ob_type: staticmethod,
        __func__: func
    }
}

staticmethod.__call__ = function(self){
    return $B.$call(self.__func__)
}

staticmethod.tp_descr_get = function(self){
    return self.__func__
}

staticmethod.tp_repr = function(self){
    return `<staticmethod(${_b_.repr(self.__func__)})>`
}

$B.set_func_names(staticmethod, "builtins")

$B.getset_descriptor = $B.make_builtin_class("getset_descriptor")
$B.getset_descriptor.$factory = function(klass, attr, getset){
    var [getter, setter] = getset
    var res = {
        ob_type: $B.getset_descriptor,
        __doc__: _b_.None,
        cls: klass,
        attr,
        getter,
        setter
    }
    return res
}

$B.getset_descriptor.__delete__ = function(self, obj){
    return self.deleter(obj)
}

$B.getset_descriptor.tp_descr_get = function(self, obj){
    if(obj === _b_.None){
        return self
    }
    if(! $B.get_mro(obj.ob_type).includes(self.cls)){
        $B.RAISE(_b_.TypeError, `descriptor '${self.attr}' for ` +
            `'${$B.get_name(self.cls)}' objects doesn't apply to a ` +
            `'${$B.class_name(obj)}' object`)
    }
    return self.getter(obj)
}

$B.getset_descriptor.__set__ = function(self, klass, value){
    if(self.setter === undefined){
        $B.RAISE_ATTRIBUTE_ERROR(
            `attribute '${self.attr}' of '${self.cls.__qualname__}' objects is not writable`,
            self,
            self.attr)
    }
    return self.setter(klass, value)
}

$B.getset_descriptor.tp_repr = function(self){
    return `<attribute '${self.attr}' of '${$B.get_name(self.cls)}' objects>`
}

$B.set_func_names($B.getset_descriptor, "builtins")


var wrapper_descriptor = $B.wrapper_descriptor = $B.make_builtin_class("wrapper_descriptor")

wrapper_descriptor.$factory = function(cls, attr, f){
    if(f === undefined){
        console.log('wrapper descriptor')
        console.log(Error().stack)
    }
    f.ml = {
        ml_name: attr
    }
    f.ob_type = wrapper_descriptor
    f.__objclass__ = cls
    return f
}

wrapper_descriptor.__get__ = function(self, obj, klass){
    if(obj === _b_.None){
        return self
    }
    // self is the dunder method, obj is an object
    var f = function(){
        return self.call(null, obj, ...arguments)
    }
    f.ob_type = $B.method_wrapper
    f.$function_infos = self.$function_infos
    f.__objclass__ = self.__objclass__
    return f
}

wrapper_descriptor.__repr__ = function(self){
    var name = self.ml.ml_name
    var class_name = self.__objclass__.tp_name
    return `<slot wrapper '${name}' of '${class_name}' objects>`
}

wrapper_descriptor.__text_signature__ = {
    __get__: function(){
        return '(self, /, *args, **kwargs)'
    }
}

$B.set_func_names(wrapper_descriptor, "builtins")

function type_get_annotations(klass){
    if(klass.__annotations__ !== undefined){
        // attribute explicitely set
        return klass.__annotations__
    }
    if(klass.__annotations_cache__ !== undefined){
        return klass.__annotations_cache__
    }
    var annotate = $B.search_in_mro(klass, '__annotate__')
    var annotate_func = klass.__annotate_func__
    if(annotate_func === undefined){
        console.log('no __annotate_func__ for klass', klass)
    }
    if(annotate_func === _b_.None){
        return $B.empty_dict()
    }
    return klass.__annotations_cache__ = $B.$call(annotate_func)(1)
}

function type_set_annotations(klass, value){
    if(value === $B.NULL){
        if(klass.__annotations_cache__ === undefined){
            $B.RAISE_ATTRIBUTE_ERROR('__annotations__', klass, '__annotations__')
        }
        klass.__annotations_cache__ = $B.empty_dict()
        klass.__annotate__ = _b_.None
    }else{
        klass.__annotations__ = value
    }
}

function type_get_annotate(klass){
    if(klass.__annotate__ !== undefined){
        // attribute explicitely set
        return klass.__annotate__
    }
    return klass.__annotate_func__ ?? _b_.None
}
function type_set_annotate(klass, value){
    if(value === $B.NULL){
        $B.RAISE(_b_.TypeError, 'cannot delete __annotate__')
    }
    try{
        $B.$call(value)
    }catch(err){
        if(value !== _b_.None){
            $B.RAISE(_b_.TypeError,
                '__annotate__ must be callable or None')
        }
        klass.__annotate__ = value
    }
}

function type_name(klass){
    return $B.get_name(klass)
}

function type_set_name(klass, value){
    klass.tp_name = value
}

function type_qualname(klass){
    return $B.get_name(klass)
}

function type_set_qualname(klass, value){
    klass.tp_name = value
}

function type_get_bases(klass){
    var bases = klass.tp_bases
    return $B.fast_tuple(bases)
}

function type_set_bases(klass, value){
    klass.tp_bases = value
    klass.__mro__ = type.$mro(klass)
    return _b_.None
}

function type_get_mro(klass){
    return $B.get_mro(klass)
}

function type_get_module(klass){
    if(klass.dict && klass.dict.__module__ !== undefined){
        return klass.dict.__module__
    }
    var parts = $B.get_name(klass).split('.')
    if(parts.length > 1){
        return parts.slice(0, parts.length - 1).join('.')
    }else{
        return 'builtins'
    }
}

function type_set_module(klass, value){
    if(klass.dict){
        klass.dict.__module__ = value
    }
    $B.RAISE(_b_.RuntimeError, 'cannot set attribute __module__')
}

function type_abstractmethods(klass){
    if(klass !== type) {
        var res = type.dict.__abstractmethods__
        if(res !== undefined){
            return res
        }
    }
    throw attr_error('__abstractmethods__', klass)
}

function type_set_abstractmethods(klass, value){
    $B.RAISE(_b_.NotImplementedError)
}

function type_dict(klass){
    return $B.mappingproxy.$factory(klass.dict)
}

function type_get_doc(klass){
    return klass.tp_doc
}

function type_set_doc(klass, value){
    klass.tp_doc = value
}

function type_get_text_signature(klass){
    $B.RAISE(_b_.NotImplementedError)
}

function type_get_annotations(klass){

}
function type_set_annotations(klass, value){

}
function type_get_annotate(klass){

}
function type_set_annotate(klass, value){

}
function type_get_type_params(klass){

}
function type_set_type_params(klass, value){

}

type.tp_getset = [
    ["__name__", type_name, type_set_name, NULL],
    ["__qualname__", type_qualname, type_set_qualname, NULL],
    ["__bases__", type_get_bases, type_set_bases, NULL],
    ["__mro__", type_get_mro, NULL, NULL],
    ["__module__", type_get_module, type_set_module, NULL],
    ["__abstractmethods__", type_abstractmethods, type_set_abstractmethods, NULL],
    ["__dict__", type_dict, NULL, NULL],
    ["__doc__", type_get_doc, type_set_doc, NULL],
    ["__text_signature__", type_get_text_signature, NULL, NULL],
    ["__annotations__", type_get_annotations, type_set_annotations, NULL],
    ["__annotate__", type_get_annotate, type_set_annotate, NULL],
    ["__type_params__", type_get_type_params, type_set_type_params, NULL]
]

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

type.tp_call = function(){
    var extra_args = [],
        klass = arguments[0]
    for(var i = 1, len = arguments.length; i < len; i++){
        extra_args.push(arguments[i])
    }
    var new_func = type.tp_getattro(klass, "__new__")

    // create an instance with __new__
    var instance = new_func.apply(null, arguments),
        instance_class = $B.get_class(instance)
    if(instance_class === klass){
        // call __init__ with the same parameters
        var init_func = type.tp_getattro(klass, "__init__")
        if(init_func !== _b_.object.__init__){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            var args = [instance].concat(extra_args)
            init_func.apply(null, args)
        }
    }
    return instance
}

$B.$class_getitem = function(kls, origin, args){
    return $B.GenericAlias.$factory(kls, origin, args)
}

function merge_class_dict(dict, klass){
    var classdict,
        bases

    /* Merge in the type's dict (if any). */
    classdict = $B.$getattr(klass, '__dict__', null)
    if(classdict !== null){
        _b_.dict.update(dict, classdict)
    }else{
        return
    }
    /* Recursively merge in the base types' (if any) dicts. */
    bases = klass.tp_bases
    if(bases === undefined){
        return
    }
    for(var base of bases){
        merge_class_dict(dict, base)
    }
}

type.__dir__ = function(klass){
    var dict = $B.empty_dict()
    merge_class_dict(dict, klass)
    return _b_.sorted(dict)
}

type.__format__ = function(klass){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}

var NULL = {NULL:true}

var counter = 0

type.tp_getattro = function(obj, name){
    counter++
    if(counter > 50){
        console.log('overflow')
        throw Error()
    }
    var test = false // name == '__str__'
    if(test){
        console.log('class_getattr', obj, name)
    }
    var klass = $B.get_class(obj)
    var in_mro = $B.search_in_mro(klass, name, NULL)
    // print('in mro', in_mro, type(in_mro), in_mro is null)
        if(test){
            console.log('attr', name, 'of class', obj)
            console.log('in mro', in_mro)
        }
    var getter = NULL
    if(in_mro !== NULL){
        var in_mro_class = $B.get_class(in_mro)
        if(test){
            console.log('in_mro class', in_mro_class)
        }
        var getter = $B.search_in_mro(in_mro_class, '__get__', NULL)
        if(test){
            console.log('getter', getter)
        }
        if(getter !== NULL){
            if($B.search_in_mro(in_mro_class, '__set__', NULL) !== NULL
                    || $B.search_in_mro(in_mro_class, '__delete__', NULL) !== NULL){
                if(test){
                    console.log('data descriptor', name)
                    console.log('__set__', $B.search_in_mro(in_mro_class, '__set__', NULL))
                }
                counter--
                return getter(in_mro, obj)     // data descriptor
            }else{
                if(test){
                    console.log('non-data descriptor', name)
                }
            }
        }
    }
    var attribute = $B.search_in_mro(obj, name, NULL)
    if(attribute !== NULL){
        if(test){
            console.log('attribute', attribute)
            console.log('class', $B.get_class(attribute))
        }
        var local_get = $B.search_in_mro($B.get_class(attribute), '__get__', NULL)
        if(local_get !== NULL){
            var res = local_get(attribute, _b_.None, obj)
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

$B.type_getattribute = function(klass, attr, _default){
    var test = false // attr == '__str__'
    if(test){
        console.log('type getattribute', attr, klass)

    }
    var meta = $B.get_class(klass)
    var ga = $B.search_in_mro(meta, '__getattribute__', $B.NULL)
    if(ga === $B.NULL){
        console.log('type_getattribute', klass, attr)
        console.log('type.dict.__ga__', type.dict.__getattribute__)
        $B.RAISE(_b_.TypeError, `type ${$B.get_name(klass)} has no __getattribute__`)
    }
    if(test){
        console.log('getattribute', ga)
    }
    return ga(klass, attr)
}

function type_getattribute(klass, attr){
    switch(attr) {
        case "__bases__XXX":
            if(klass.__bases__ !== undefined){
                return $B.fast_tuple($B.resolve_mro_entries(klass.__bases__))
            }
            throw $B.attr_error(attr, klass)
        case "__class__XXX":
            return klass.__class__
        case "__doc__":
            return klass.__doc__ || _b_.None
        case '__name__':
            return klass.__name__ || klass.__qualname__
        case "__setattr__":
            var func = klass["__setattr__"] ??
                           function(kls, key, value){
                               kls[key] = value
                           }
            return method_wrapper.$factory(attr, klass, func)
        case "__delattr__":
            if(klass["__delattr__"] !== undefined){
                return klass["__delattr__"]
            }
            return method_wrapper.$factory(attr, klass,
                function(key){
                    if(klass.__flags__ && TPFLAGS.IMMUTABLETYPE){
                        $B.RAISE(_b_.TypeError,
                            `cannot delete '${key}' attribute ` +
                            `of immutable type '${klass.__name__}'`)
                    }
                    if(klass.dict){
                        delete klass.dict[key]
                    }
                    delete klass[key]
                })
    }
    var $test = false // attr == "_member_names_" // && klass.__name__ == 'FlagBoundary'

    if($test){
        console.log("attr", attr, "of", klass, 'res', res) //, '\n  ', res, res + "")
    }

    var res = klass.hasOwnProperty(attr) ? klass[attr] : undefined
    var res_type

    var metaclass = $B.get_class(klass)
    if(metaclass[attr] &&
            metaclass[attr].__get__ &&
            metaclass[attr].__set__){
        // data descriptor
        if($test){console.log("data descriptor")}
        return metaclass[attr].__get__(klass)
    }

    if(res === undefined){
        // search in classes hierarchy, following method resolution order
        var v = klass.hasOwnProperty(attr) ? klass[attr] : undefined
        if(v === undefined){
            if($test){
                console.log(attr, 'not in klass[attr], search in __dict__',
                    klass.dict)
            }
        if(klass.dict && $B.get_class(klass.dict) === _b_.dict &&
                    klass.dict[attr] !== undefined){
                res = klass.dict[attr]
                if($test){
                    console.log('found in __dict__', res)
                }
            }else{
                var mro = $B.get_mro(klass)
                if(mro === undefined){
                    console.log("no mro for", klass, 'attr', attr)
                }
                for(let i = 0; i < mro.length; i++){
                    if(mro[i].hasOwnProperty(attr)){
                        res = mro[i][attr]
                        if($test){
                            console.log('found in class', mro[i])
                        }
                        break
                    }
                }
            }
        }else{
            res = v
        }
    }

    if(res === undefined){
        // search in metaclass
        if(res === undefined){
            var meta = $B.get_class(klass)
            if(attr == '__annotations__'){
                console.log('search', attr, 'in klass', klass, meta)
            }
            res = meta.hasOwnProperty(attr)
                ? meta[attr]
                : meta.dict && _b_.dict.$contains(meta.dict, attr)
                    ? _b_.dict.$getitem(meta.dict, attr)
                    : undefined
            if($test){console.log("search in meta", meta, res)}
            if(res === undefined){
                var meta_mro = meta.__mro__
                for(let i = 0; i < meta_mro.length; i++){
                    if(meta_mro[i].hasOwnProperty(attr)){
                        res = meta_mro[i][attr]
                        break
                    }
                }
            }

            if(res !== undefined){
                if($test){console.log("found in meta", res, typeof res)}
                res_type = $B.get_class(res)
                if(res_type === _b_.property){
                    return res.fget(klass)
                }else if(res_type === $B.getset_descriptor){
                    return res.getter(klass)
                }
                if(typeof res == "function"){
                    // insert klass as first argument
                    if(attr == '__new__'){ // static
                        return res
                    }

                    var meta_method = res.bind(null, klass)
                    meta_method.ob_type = $B.method
                    meta_method.$infos = {
                        __self__: klass,
                        __func__: res,
                        __name__: attr,
                        __qualname__: meta.__name__ + "." + attr,
                        __module__: res.$infos ? res.$infos.__module__ : ""
                    }
                    if($test){
                        console.log('return method from meta', meta_method,
                            meta_method + '')
                    }
                    return meta_method

                }
            }
        }

        if(res === undefined){
            // search a method __getattr__ in metaclass
            // (issues #126 and #949)
            var getattr = meta.__getattr__
            if(getattr === undefined){
                for(let i = 0; i < meta_mro.length; i++){
                    if(meta_mro[i].__getattr__ !== undefined){
                        getattr = meta_mro[i].__getattr__
                        break
                    }
                }
            }
            if(getattr !== undefined){
                return getattr(klass, attr)
            }
        }
    }

    if(res !== undefined){
        if($test){
            console.log("res", res, 'class', $B.get_class(res))
        }
        // If the attribute is a property, return it
        res_type = $B.get_class(res)
        if(res_type === _b_.property){
            return res
        }else if(res_type === _b_.classmethod){
            return _b_.classmethod.__get__(res, _b_.None, klass)
        }
        if(res.__get__){
            if(res_type === method){
                if($test){
                    console.log('__get__ of method', res.$infos.__self__, klass)
                }
                if(res.$infos.__self__){
                    // method is already bound
                    return res
                }
                var result = res.__get__(res.__func__, klass)
                result.$infos = {
                    __func__: res,
                    __name__: res.$infos.__name__,
                    __qualname__: klass.__name__ + "." + res.$infos.__name__,
                    __self__: klass
                }
            }else{
                result = res.__get__(klass)
            }
            return result
        }else if(res_type){
            var getter = $B.search_in_mro(res_type, '__get__')
            if(getter){
                //console.log('has getter', getter)
                var getter_res = $B.$call(getter)(res, _b_.None, klass)
                if(getter_res === undefined){
                    console.log('no result for getter', getter)
                    console.log(Error().stack)
                }
                res = getter_res
            }
        }
        if(typeof res == "function"){
            res_type = $B.get_class(res)
            // method
            if(res.$infos !== undefined && res.$function_infos === undefined){
                console.log('$infos not undef', res, res.$infos)
                throw Error()
            }
            if(res.$infos === undefined && res.$function_infos === undefined
                    && $B.get_option('debug') > 1){
                console.log("warning: no attribute $infos for", res,
                    "klass", klass, "attr", attr)
            }
            if($test){
                console.log("res is function", res, res.__class__)
            }

            if(attr == "__new__"){
                res.$type = "staticmethod"
            }
            if((attr == "__class_getitem__"  || attr == "__init_subclass__")
                    && res_type !== _b_.classmethod){
                res = _b_.classmethod.$factory(res)
                return _b_.classmethod.__get__(res, _b_.None, klass)
            }
            if(res_type === $B.method){
                return res.__get__(null, klass)
            }else{
                if($test){
                    console.log("return res", res)
                    console.log($B.get_class(res))
                }
                return res
            }
        }else{
            return res
        }
    }
}

type.__hash__ = function(cls){
    return _b_.hash(cls)
}

type.tp_init = function(){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
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

type.tp_new = function(meta, name, bases, cl_dict, extra_kwargs){
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
    Object.assign(class_dict,
    {
        ob_type: meta,
        tp_bases : bases.length == 0 ? [_b_.object] : bases,
        __module__: module,
        tp_name: name,
        dict: cl_dict,
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

    /*
    class_dict.dict.__dict__ = $B.getset_descriptor.$factory(
        class_dict,
        '__dict__',
        obj => obj.dict
    )
    */

    // set $tp_setattr
    class_dict.$tp_setattr = $B.search_in_mro(class_dict, '__setattr__')

    var sup = _b_.super.$factory(class_dict, class_dict)
    var init_subclass = _b_.super.tp_getattro(sup, "__init_subclass__")
    init_subclass(extra_kwargs)
    return class_dict
}

type.__or__ = function(){
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

type.__qualname__ = 'type'

type.tp_repr = function(kls){
    $B.builtins_repr_check(type, arguments) // in brython_builtins.js
    var qualname = $B.get_name(kls)
    if(kls.__module__    &&
            kls.__module__ != "builtins" &&
            !kls.__module__.startsWith("$")){
        qualname = kls.__module__ + "." + qualname
    }
    return "<class '" + qualname + "'>"
}

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

type.tp_setattro = function(kls, attr, value){
    var $test = false
    if($test){console.log("kls is class", type)}
    if($B.mappingproxy.$contains(type.dict, attr)){
        var v = $B.mappingproxy.$getitem(type.dict, attr)
        var vtype = $B.get_class(v)
        if(vtype.__set__){
            return vtype.__set__(v, kls, value)
        }
    }
    if(kls.__flags__ && TPFLAGS.IMMUTABLETYPE){
        $B.RAISE(_b_.TypeError,
            `cannot set '${attr}' attribute of immutable type '` +
                kls.__qualname__ + "'")
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

type.$mro = $B.make_mro

type.__mro__ = type.$mro(type)

function type_mro(cls){
    return $B.$list(type.$mro(cls))
}

type.__subclasscheck__ = function(self, subclass){
    // Is subclass a subclass of self ?
    var klass = self
    if(subclass.tp_bases === undefined){
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(klass) > -1
}

$B.set_func_names(type, "builtins")

type.tp_getset = [
    ["__name__", type_name, type_set_name, NULL],
    ["__qualname__", type_qualname, type_set_qualname, NULL],
    ["__bases__", type_get_bases, type_set_bases, NULL],
    ["__mro__", type_get_mro, NULL, NULL],
    ["__module__", type_get_module, type_set_module, NULL],
    ["__abstractmethods__", type_abstractmethods, type_set_abstractmethods, NULL],
    ["__dict__", type_dict, NULL, NULL],
    ["__doc__", type_get_doc, type_set_doc, NULL],
    ["__text_signature__", type_get_text_signature, NULL, NULL],
    ["__annotations__", type_get_annotations, type_set_annotations, NULL],
    ["__annotate__", type_get_annotate, type_set_annotate, NULL],
    ["__type_params__", type_get_type_params, type_set_type_params, NULL],
]

function type___subclasses__(klass){

}
function type_prepare(klass){
    return $B.empty_dict()
}

function type___instancecheck__(cls, instance){
    var kl = $B.get_class(instance)
    var mro = $B.get_mro(kl)
    for(var klass of mro){
        if(klass === cls){
            return true
        }
    }
    return false
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
    merge_class_dict(dict, klass)
    return _b_.sorted(dict)
}
function type___sizeof__(klass){
 $B.RAISE(_b_.NotImplementedError)
}

type.tp_methods = [
    ["mro", type_mro, $B.METH_NOARGS],
    ["__subclasses__", type___subclasses__, $B.METH_NOARGS],
    ["__prepare__", type_prepare, $B.METH_FASTCALL | $B.METH_KEYWORDS | $B.METH_CLASS],
    ["__instancecheck__", type___instancecheck__, $B.METH_O],
    ["__subclasscheck__", type___subclasscheck__, $B.METH_O],
    ["__dir__", type___dir__, $B.METH_NOARGS],
    ["__sizeof__", type___sizeof__, $B.METH_NOARGS]
]

type.tp_members = [
    ["__basicsize__", 'tp_basicsize'],
    ["__itemsize__", 'tp_itemsize'],
    ["__flags__", 'tp_flags'],
    ["__weakrefoffset__", 'tp_weaklistoffset'],
    ["__base__", 'tp_base'],
    ["__dictoffset__", 'tp_dictoffset'],
]

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
    return $B.$call(self.fget)(kls)
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
    $B.$call(self.fset)(obj, value)
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
            factory = $B.$call(call_func)
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

var method_wrapper = $B.method_wrapper
method_wrapper.$factory = function(attr, klass, method){
    var f = function(){
        return method.apply(null, arguments)
    }
    f.$infos = {
        __name__: attr,
        __module__: klass.__module__
    }
    return f
}

method_wrapper.tp_repr = function(self){
    var class_name = self.__objclass__.__name__
    return "<method-wrapper '" + self.$function_infos[$B.func_attrs.__name__] +
        `' of ${class_name} object>`
}

// Used for class members, defined in __slots__
var member_descriptor = $B.member_descriptor

member_descriptor.$factory = function(attr, cls){
    return{
        ob_type: member_descriptor,
        cls: cls,
        attr: attr
    }
}

member_descriptor.__delete__ = function(self, kls){
    if(kls.$slot_values === undefined ||
            ! kls.$slot_values.hasOwnProperty(self.attr)){
        $B.RAISE_ATTRIBUTE_ERROR('cannot delete', self, self.attr)
    }
    kls.$slot_values.delete(self.attr)
}

member_descriptor.__get__ = function(self, kls){
    console.log('member descr get', self, kls)
    if(kls === _b_.None){
        return self
    }
    console.log('call self.attr', self.attr)
    var res = self.attr(kls)
    console.log('res', res)
    return res
    if(kls.$slot_values === undefined ||
            ! kls.$slot_values.has(self.attr)){
        throw $B.attr_error(self.attr, kls)
    }
    return kls.$slot_values.get(self.attr)
}

member_descriptor.__set__ = function(self, kls, value){
    if(kls.$slot_values === undefined){
        kls.$slot_values = new Map()
    }
    kls.$slot_values.set(self.attr, value)
}

member_descriptor.tp_repr = function(self){
    return "<member '" + self.attr + "' of '" + self.cls.__name__ +
        "' objects>"
}

$B.set_func_names(member_descriptor, "builtins")

// used as the factory for method objects

$B.objs = []
var method = $B.method
method.$factory = function(func, obj){
    var f = function(){
        return $B.$call(func).bind(null, obj).apply(null, arguments)
    }
    f.ob_type = method
    if(typeof func !== 'function'){
        console.log('method from func w-o $infos', func, 'all', $B.$call(func))
    }
    if(! func.$infos && func.$function_infos){
        $B.make_function_infos(func, ...func.$function_infos)
        f.$function_infos = func.$function_infos
    }
    f.$infos = {}
    if(func.$infos){
        for(var key in func.$infos){
            f.$infos[key] = func.$infos[key]
        }
    }
    f.$infos.__func__ = func
    f.$infos.__self__ = obj
    f.$infos.dict = $B.empty_dict()

    return f
}

method.__call__ = function(f){
    return f(...Array.from(arguments).slice(1))
}

method.__eq__ = function(self, other){
    return self.$infos !== undefined &&
           other.$infos !== undefined &&
           self.$infos.__func__ === other.$infos.__func__ &&
           self.$infos.__self__ === other.$infos.__self__
}

method.__ne__ = function(self, other){
    return ! $B.method.__eq__(self, other)
}

method.__get__ = function(self){
    var f = function(){return self(...arguments)}
    f.ob_type = $B.method_wrapper
    f.$infos = self.$infos
    return f
}

method.tp_getattro = function(self, attr){
    // Internal attributes __name__, __func__, __self__ etc.
    // are stored in self.$infos
    var infos = self.$infos
    if(infos && infos[attr]){
        if(attr == "__code__"){
            var res = {ob_type: $B.Code}
            for(var key in infos.__code__){
                res[key] = infos.__code__[key]
            }
            return res
        }else{
            return infos[attr]
        }
    }else if(method.hasOwnProperty(attr)){
        return _b_.object.__getattribute__(self, attr)
    }else{ // use attributes of underlying function __func__
        return _b_.object.__getattribute__(self.$infos.__func__, attr)
    }
}

method.tp_repr = function(self){
    return "<bound method " + self.$infos.__qualname__ +
       " of " + _b_.str.$factory(self.$infos.__self__) + ">"
}

method.__setattr__ = function(self, key){
    // Attempting to set an attribute on a method results in an AttributeError
    // being raised.
    if(key == "__class__"){
        $B.RAISE(_b_.TypeError, "__class__ assignment only supported " +
            "for heap types or ModuleType subclasses")
    }
    throw $B.attr_error(key, self)
}

$B.set_func_names(method, "builtins")

$B.method_descriptor.$factory = function(cls, attr, f){
    f.ob_type = $B.method_descriptor
    f.ml = {
        ml_name: attr
    }
    f.__objclass__ = cls
    return f
}

$B.method_descriptor.dict.__get__ = function(self, obj, klass){
    if(obj === _b_.None){
        return self
    }
    var f = self.bind(null, obj)
    f.ob_type = $B.builtin_function_or_method
    f.$infos = self.$infos
    f.__self__ = obj
    return f
}

$B.method_descriptor.tp_repr = function(self){
    var name = self.ml.ml_name
    var class_name = self.__objclass__.tp_name
    return `<method '${name}' of '${class_name}' objects>`
}
$B.set_func_names($B.method_descriptor, 'builtins')

$B.classmethod_descriptor.tp_repr = function(_self){
    console.log(_self, _self.$infos, _self.$function_infos)
    var name = _self.$function_infos[$B.func_attrs.__name__]
    return `<method '${name}' of '${_self.__objclass__.__name__}' objects>`
}

$B.classmethod_descriptor.__get__ = function(_self, obj, type){
    /*
    if(type === _b_.None){
        if(obj !== _b_.None){
            type = $B.get_class(obj)
        }else{

            $B.RAISE(_b_.TypeError,
                `descriptor for type '${$B.class_name(descr)}' ` +
                "needs either an object or a type")
        }
    }
    if(type.$is_class){
        $B.RAISE(_b_.TypeError,
                     `descriptor for type '${$B.class_name(_self)}' ` +
                     `needs a type, not a '${$B.class_name(type)}' as arg 2`)
    }
    if(! _b_.issubclass(type, _self)){
        $B.RAISE(_b_.TypeError,
                     `descriptor requires a subtype of '${$B.class_name(_self)}' ` +
                     `but received '${$B.class_name(type)}'`)
    }
    */
    var f = function(obj){
        return _self(type, ...arguments)
    }
    f.ob_type = $B.builtin_function_or_method
    f.$function_infos = _self.$function_infos
    return f
}

$B.set_func_names($B.classmethod_descriptor, 'builtins')

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

$B.UnionType.__args__ = _b_.property.$factory(
    self => $B.fast_tuple(self.items)
)

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

$B.UnionType.__parameters__ = _b_.property.$factory(
    () => $B.fast_tuple([])
)

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
