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
$B.$class_constructor = function(class_name, class_obj_proxy, metaclass,
                                 resolved_bases, bases,
                                 kwargs, static_attributes,
                                 firstlineno){
    var dict
    if(class_obj_proxy instanceof $B.str_dict){
        dict = $B.empty_dict()
        dict.$strings = class_obj_proxy
    }else{
        dict = class_obj_proxy.$target
    }
    var module = class_obj_proxy.__module__

    // bool is not a valid base
    for(var base of bases){
        if(base.__flags__ !== undefined &&
                 ! (base.__flags__ & TPFLAGS.BASETYPE)){
            throw _b_.TypeError.$factory(
                "type 'bool' is not an acceptable base type")
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
    if(class_obj_proxy.__eq__ !== undefined &&
            class_obj_proxy.__hash__ === undefined){
        $B.$setitem(dict, '__hash__', _b_.None)
    }

    // Check if class has __slots__
    var slots = class_obj_proxy.__slots__
    if(slots !== undefined){
        if(typeof slots == "string"){
            slots = [slots]
        }else{
            for(let item of $B.make_js_iterator(slots)){
                if(typeof item != 'string'){
                    throw _b_.TypeError.$factory('__slots__ items must be ' +
                        `strings, not '${$B.class_name(item)}'`)
                }
            }
        }
        $B.$setitem(dict, '__slots__', slots)
    }

    // Apply method __new__ of metaclass to create the class object
    var meta_new = _b_.type.__getattribute__(metaclass, "__new__")
    var kls = meta_new(metaclass, class_name, resolved_bases, dict,
                       {$kw: [extra_kwargs]})
    kls.__module__ = module
    kls.$subclasses = []
    kls.$is_class = true

    kls.__static_attributes__ = $B.fast_tuple(static_attributes)
    kls.__firstlineno__ = firstlineno

    if(kls.__class__ === metaclass){
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.__getattribute__(metaclass, "__init__")
        meta_init(kls, class_name, resolved_bases, dict,
                  {$kw: [extra_kwargs]})
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
        if(bases[0].__class__ === undefined){
            // Might inherit a Javascript constructor
            if(typeof bases[0] == "function"){
                if(bases.length != 1){
                    throw _b_.TypeError.$factory("A Brython class " +
                        "can inherit at most 1 Javascript constructor")
                }
                $B.set_func_names(bases[0], module)
                return $B.JSMeta
            }else{
                throw _b_.TypeError.$factory("Argument of " + class_name +
                    " is not a class (type '" + $B.class_name(bases[0]) +
                    "')")
            }
        }
        for(var base of bases){
            var mc = base.__class__
            if(metaclass === undefined){
                metaclass = mc
            }else if(mc === metaclass || _b_.issubclass(metaclass, mc)){
                // same metaclass or a subclass, do nothing
            }else if(_b_.issubclass(mc, metaclass)){
                metaclass = mc
            }else if(metaclass.__bases__ &&
                    metaclass.__bases__.indexOf(mc) == -1){
                throw _b_.TypeError.$factory("metaclass conflict: the " +
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
    var class_dict = _b_.dict.$literal([
                         ['__module__', module],
                         ['__qualname__', qualname]
                         ])
    if(metaclass !== _b_.type){
        var prepare = $B.$getattr(metaclass, "__prepare__", _b_.None)
        if(prepare !== _b_.None){
            class_dict = $B.$call(prepare)(class_name, bases) // dict or dict-like
            set_attr_if_absent(class_dict, '__module__', module)
            set_attr_if_absent(class_dict, '__qualname__', qualname)
        }
    }
    if(orig_bases !== bases){
        $B.$setitem(class_dict, '__orig_bases__', orig_bases)
    }
    if(class_dict.__class__ === _b_.dict){
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
        var setitem = $B.$getattr(class_dict, "__setitem__"),
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
                setitem(prop, value)
                return _b_.None
            }
        })
    }
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

$B.make_class = function(qualname, factory){
    // Builds a basic class object

    var A = {
        __class__: type,
        __bases__: [_b_.object],
        __mro__: [_b_.object],
        __name__: qualname,
        __qualname__: qualname,
        $is_class: true
    }

    A.$factory = factory

    return A
}

var type = $B.make_class("type",
    function(){
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
                throw _b_.TypeError.$factory('type() takes 1 or 3 arguments')
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
)

type.__class__ = type


//classmethod() (built in class)
var classmethod = _b_.classmethod = $B.make_class("classmethod",
    function(func) {
        $B.check_nb_args_no_kw('classmethod', 1, arguments)
        return {
            __class__: classmethod,
            __func__: func
        }
    }
)

classmethod.__get__ = function(){
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

$B.set_func_names(classmethod, "builtins")


// staticmethod() built in function
var staticmethod = _b_.staticmethod = $B.make_class("staticmethod",
    function(func){
        return {
            __class__: staticmethod,
            __func__: func
        }
    }
)

staticmethod.__call__ = function(self){
    return $B.$call(self.__func__)
}

staticmethod.__get__ = function(self){
    return self.__func__
}


$B.set_func_names(staticmethod, "builtins")

$B.getset_descriptor = $B.make_class("getset_descriptor",
    function(klass, attr, getter, setter){
        var res = {
            __class__: $B.getset_descriptor,
            __doc__: _b_.None,
            cls: klass,
            attr,
            getter,
            setter
        }
        return res
    }
)

$B.getset_descriptor.__get__ = function(self, obj, klass){
    if(obj === _b_.None){
        return self
    }
    return self.getter(self, obj, klass)
}

$B.getset_descriptor.__set__ = function(self, klass, value){
    return self.setter(self, klass, value)
}

$B.getset_descriptor.__repr__ = function(self){
    return `<attribute '${self.attr}' of '${self.cls.__name__}' objects>`
}

$B.set_func_names($B.getset_descriptor, "builtins")

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

type.__call__ = function(){
    var extra_args = [],
        klass = arguments[0]
    for(var i = 1, len = arguments.length; i < len; i++){
        extra_args.push(arguments[i])
    }
    var new_func = _b_.type.__getattribute__(klass, "__new__")

    // create an instance with __new__
    var instance = new_func.apply(null, arguments),
        instance_class = instance.__class__ || $B.get_class(instance)
    if(instance_class === klass){
        // call __init__ with the same parameters
        var init_func = _b_.type.__getattribute__(klass, "__init__")
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
    bases = klass.__bases__
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

type.__getattribute__ = function(klass, attr){
    switch(attr) {
        case "__annotations__":
            var ann = klass.__annotations__
            return ann === undefined ? $B.empty_dict() : ann
        case "__bases__":
            if(klass.__bases__ !== undefined){
                return $B.fast_tuple($B.resolve_mro_entries(klass.__bases__))
            }
            throw $B.attr_error(attr, klass)
        case "__class__":
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
                    if(klass.__dict__){
                        _b_.dict.__delitem__(klass.__dict__, key)
                    }
                    delete klass[key]
                })
    }

    var res = klass.hasOwnProperty(attr) ? klass[attr] : undefined
    var $test = false // attr == "extendModule" // && klass.__name__ == 'Pattern'

    if($test){
        console.log("attr", attr, "of", klass, '\n  ', res, res + "")
    }


    if(klass.__class__ &&
            klass.__class__[attr] &&
            klass.__class__[attr].__get__ &&
            klass.__class__[attr].__set__){
        // data descriptor
        if($test){console.log("data descriptor")}
        return klass.__class__[attr].__get__(klass)
    }

    if(res === undefined){
        // search in classes hierarchy, following method resolution order
        var v = klass.hasOwnProperty(attr) ? klass[attr] : undefined
        if(v === undefined){
            if($test){
                console.log(attr, 'not in klass[attr], search in __dict__',
                    klass.__dict__)
            }
            if(klass.__dict__ && klass.__dict__.__class__ === _b_.dict &&
                    _b_.dict.$contains_string(klass.__dict__, attr)){
                res = klass[attr] = _b_.dict.$getitem_string(klass.__dict__, attr)
                if($test){
                    console.log('found in __dict__', v)
                }
            }else{
                var mro = klass.__mro__
                if(mro === undefined){
                    console.log("no mro for", klass, 'attr', attr)
                }
                for(let i = 0; i < mro.length; i++){
                    if(mro[i].hasOwnProperty(attr)){
                        res = mro[i][attr]
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
            var meta = klass.__class__ || $B.get_class(klass)
            res = meta.hasOwnProperty(attr) ? meta[attr] : undefined
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
                if(res.__class__ === _b_.property){
                    return res.fget(klass)
                }
                if(typeof res == "function"){
                    // insert klass as first argument
                    if(attr == '__new__'){ // static
                        return res
                    }

                    var meta_method = res.bind(null, klass)
                    meta_method.__class__ = $B.method
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
        if($test){console.log("res", res)}
        // If the attribute is a property, return it
        if(res.__class__ === _b_.property){
            return res
        }else if(res.__class__ === _b_.classmethod){
            return _b_.classmethod.__get__(res, _b_.None, klass)
        }
        if(res.__get__){
            if(res.__class__ === method){
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
        }else if(res.__class__ && res.__class__.__get__){
            // issue #1391
            if(!(attr.startsWith("__") && attr.endsWith("__"))){
                return res.__class__.__get__(res, _b_.None, klass)
            }
        }
        if(typeof res == "function"){
            // method
            if(res.$infos === undefined && res.$function_infos === undefined
                    && $B.get_option('debug') > 1){
                console.log("warning: no attribute $infos for", res,
                    "klass", klass, "attr", attr)
            }
            if($test){console.log("res is function", res)}

            if(attr == "__new__" ||
                    res.__class__ === $B.builtin_function_or_method){
                res.$type = "staticmethod"
            }
            if((attr == "__class_getitem__"  || attr == "__init_subclass__")
                    && res.__class__ !== _b_.classmethod){
                res = _b_.classmethod.$factory(res)
                return _b_.classmethod.__get__(res, _b_.None, klass)
            }
            if(res.__class__ === $B.method){
                return res.__get__(null, klass)
            }else{
                if($test){console.log("return res", res)}
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

type.__init__ = function(){
    if(arguments.length == 0){
        throw _b_.TypeError.$factory("descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
}

type.__init_subclass__ = function(){
    // Default implementation only checks that no keyword arguments were passed
    // Defined as classmethod after set_func_names is called
    var $ = $B.args("__init_subclass__", 1, {cls: null}, ['cls'],
            arguments, {}, "args", "kwargs")
    if($.args.length > 0){
        throw _b_.TypeError.$factory(
            `${$.cls.__qualname__}.__init_subclass__ takes no arguments ` +
            `(${$.args.length} given)`)
    }
    if(_b_.dict.__len__($.kwargs) > 0){
        throw _b_.TypeError.$factory(
            `${$.cls.__qualname__}.__init_subclass__() ` +
            `takes no keyword arguments`)
    }
    return _b_.None
}

_b_.object.__init_subclass__ = type.__init_subclass__

type.__instancecheck__ = function(cls, instance){
    var kl = instance.__class__ || $B.get_class(instance)
    if(kl === cls){
        return true
    }else{
        for(var i = 0; i < kl.__mro__.length; i++){
            if(kl.__mro__[i] === cls){return true}
        }
    }
    return false
}

type.__instancecheck__.$type = "staticmethod"

// __name__ is a data descriptor
type.__name__ = 'type'

type.__new__ = function(meta, name, bases, cl_dict, extra_kwargs){
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
    var module = _b_.dict.$get_string(cl_dict, '__module__',
                                      $B.frame_obj.frame[2])
    var qualname = _b_.dict.$get_string(cl_dict, '__qualname__', name)

    var class_dict = {
        __class__ : meta,
        __bases__ : bases.length == 0 ? [_b_.object] : bases,
        __dict__ : cl_dict,
        __qualname__: qualname,
        __module__: module,
        __name__: name,
        $is_class: true
    }

    let slots = _b_.dict.$get_string(cl_dict, '__slots__', null)
    if(slots !== null){
        for(let key of $B.make_js_iterator(slots)){
            class_dict[key] = member_descriptor.$factory(key, class_dict)
        }
    }

    class_dict.__mro__ = type.mro(class_dict).slice(1)

    // set class attributes for faster lookups
    for(var entry of _b_.dict.$iter_items(cl_dict)){
        var key = entry.key,
            v = entry.value
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
        if(v.__class__){
            // cf PEP 487 and issue #1178
            var set_name = $B.$getattr(v.__class__, "__set_name__", _b_.None)
            if(set_name !== _b_.None){
                set_name(v, class_dict, key)
            }
        }
        if(typeof v == "function"){
            if(v.$function_infos === undefined){
                // internal functions have $infos
                if(v.$infos){
                    v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                }
            }else{
                v.$function_infos[$B.func_attrs.method_class] = class_dict
                v.$function_infos[$B.func_attrs.qualname] = name + '.' +
                    v.$function_infos[$B.func_attrs.name]
            }
        }
    }

    // set $tp_setattr
    class_dict.$tp_setattr = $B.search_in_mro(class_dict, '__setattr__')

    var sup = _b_.super.$factory(class_dict, class_dict)
    var init_subclass = _b_.super.__getattribute__(sup, "__init_subclass__")
    init_subclass(extra_kwargs)
    return class_dict
}

type.__or__ = function(){
    var $ = $B.args('__or__', 2, {cls: null, other: null},  ['cls', 'other'],
                arguments, {}, null, null),
        cls = $.cls,
        other = $.other
    if(other !== _b_.None && ! $B.$isinstance(other, [type, $B.GenericAlias])){
        return _b_.NotImplemented
    }
    return $B.UnionType.$factory([cls, other])
}

type.__prepare__ = function(){
    return $B.empty_dict()
}

type.__qualname__ = 'type'

type.__repr__ = function(kls){
    $B.builtins_repr_check(type, arguments) // in brython_builtins.js
    var qualname = kls.__qualname__
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
        throw _b_.TypeError.$factory(`expected 1 argument, got ${len}`)
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

type.__setattr__ = function(kls, attr, value){
    var $test = false
    if($test){console.log("kls is class", type)}
    if(type[attr] && type[attr].__get__ &&
            type[attr].__set__){
        type[attr].__set__(kls, value)
        return _b_.None
    }
    if(kls.__module__ == "builtins"){
        throw _b_.TypeError.$factory(
            `cannot set '${attr}' attribute of immutable type '` +
                kls.__qualname__ + "'")
    }
    kls[attr] = value

    var mp = kls.__dict__ || $B.$getattr(kls, '__dict__')
    // mapping proxy is read-only, set key/value without using __setitem__
    _b_.dict.$setitem(mp, attr, value)

    switch(attr){
        case '__init__':
        case '__new__':
            // redefine the function that creates instances of the class
            kls.$factory = $B.$instance_creator(kls)
            break
        case "__bases__":
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

type.$mro = function(cls){
    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    if(cls === undefined){
        throw _b_.TypeError.$factory(
            'unbound method type.mro() needs an argument')
    }
    var bases = cls.__bases__,
        seqs = [],
        pos1 = 0
    for(var base of bases){
        // We can't simply push bases[i].__mro__
        // because it would be modified in the algorithm
        let bmro = [],
            pos = 0
        if(base === undefined ||
                base.__mro__ === undefined){
            if(base.__class__ === undefined){
                // Brython class inherits a Javascript constructor. The
                // constructor is the attribute js_func
                return [_b_.object]
            }else{
                console.log('error for base', base)
                console.log('cls', cls)
            }
        }
        bmro[pos++] = base
        var _tmp = base.__mro__
        if(_tmp){
            if(_tmp[0] === base){
                _tmp.splice(0, 1)
            }
            for(var k = 0; k < _tmp.length; k++){
                bmro[pos++] = _tmp[k]
            }
        }
        seqs[pos1++] = bmro
    }

    seqs[pos1++] = bases.slice()

    var mro = [cls],
        mpos = 1
    while(1){
        let non_empty = [],
            pos = 0
        for(let i = 0; i < seqs.length; i++){
            if(seqs[i].length > 0){non_empty[pos++] = seqs[i]}
        }
        if(non_empty.length == 0){
            break
        }
        let candidate
        for(let i = 0; i < non_empty.length; i++){
            let seq = non_empty[i]
            candidate = seq[0]
            let not_head = [],
                pos = 0
            for(let j = 0; j < non_empty.length; j++){
                let s = non_empty[j]
                if(s.slice(1).indexOf(candidate) > -1){
                    not_head[pos++] = s
                }
            }
            if(not_head.length > 0){
                candidate = null
            }else{
                break
            }
        }
        if(candidate === null){
            throw _b_.TypeError.$factory(
                "inconsistent hierarchy, no C3 MRO is possible")
        }
        mro[mpos++] = candidate
        for(let i = 0; i < seqs.length;  i++){
            let seq = seqs[i]
            if(seq[0] === candidate){ // remove candidate
                seqs[i].shift()
            }
        }
    }
    if(mro[mro.length - 1] !== _b_.object){
        mro[mpos++] = _b_.object
    }
    return mro
}

type.mro = function(cls){
    return $B.$list(type.$mro(cls))
}

type.__subclasscheck__ = function(self, subclass){
    // Is subclass a subclass of self ?
    var klass = self
    if(subclass.__bases__ === undefined){
        return self === _b_.object
    }
    return subclass.__bases__.indexOf(klass) > -1
}

$B.set_func_names(type, "builtins")

// Must do it after set_func_names to have $infos set
type.__init_subclass__ = _b_.classmethod.$factory(type.__init_subclass__)

_b_.type = type

// property (built in function)
var property = _b_.property = $B.make_class("property",
    function(fget, fset, fdel, doc){
        var res = {
            __class__: property
        }
        property.__init__(res, fget, fset, fdel, doc)
        return res
    }
)

property.__init__ = function(){
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

property.__get__ = function(self, kls) {
    if(self.fget === undefined){
        throw _b_.AttributeError.$factory("unreadable attribute")
    }
    return $B.$call(self.fget)(kls)
}

property.__new__ = function(cls){
    return {
        __class__: cls
    }
}

property.__set__ = function(self, obj, value){
    if(self.fset === undefined){
        var name = self.fget.$infos.__name__
        var msg = `property '${name}' of '${$B.class_name(obj)}' object ` +
                  'has no setter'
        throw _b_.AttributeError.$factory(msg)
    }
    $B.$getattr(self.fset, '__call__')(obj, value)
}

$B.set_func_names(property, "builtins")

var wrapper_descriptor = $B.wrapper_descriptor =
    $B.make_class("wrapper_descriptor")

wrapper_descriptor.__text_signature__ = {
    __get__: function(){
        return '(self, /, *args, **kwargs)'
    }
}

$B.set_func_names(wrapper_descriptor, "builtins")

type.__call__.__class__ = wrapper_descriptor

$B.$instance_creator = function(klass){
    var test = false // klass.__name__ == 'version_info'
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
            var msg = (ams.length > 1 ? 's ' : ' ') + ams.join(', ')
            throw _b_.TypeError.$factory(
                "Can't instantiate abstract class interface " +
                "with abstract method" + msg)
        }
    }
    var metaclass = klass.__class__ || $B.get_class(klass),
        call_func,
        factory
    if(metaclass === _b_.type){
        var new_func = type.__getattribute__(klass, '__new__'),
            init_func = type.__getattribute__(klass, '__init__')
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
    }else{
        call_func = _b_.type.__getattribute__(metaclass, "__call__")
        if(call_func.$is_class){
            factory = $B.$call(call_func)
        }else{
            factory = call_func.bind(null, klass)
        }
    }
    factory.__class__ = $B.function
    factory.$infos = {
        __name__: klass.__name__,
        __module__: klass.__module__
    }
    return factory
}

var method_wrapper = $B.method_wrapper = $B.make_class("method_wrapper",
    function(attr, klass, method){
        var f = function(){
            return method.apply(null, arguments)
        }
        f.$infos = {
            __name__: attr,
            __module__: klass.__module__
        }
        return f
    }
)
method_wrapper.__str__ = method_wrapper.__repr__ = function(self){
    return "<method '" + self.$infos.__name__ + "' of function object>"
}

// Used for class members, defined in __slots__
var member_descriptor = $B.member_descriptor = $B.make_class("member_descriptor",
    function(attr, cls){
        return{
            __class__: member_descriptor,
            cls: cls,
            attr: attr
        }
    }
)

member_descriptor.__delete__ = function(self, kls){
    if(kls.$slot_values === undefined ||
            ! kls.$slot_values.hasOwnProperty(self.attr)){
        throw _b_.AttributeError.$factory(self.attr)
    }
    kls.$slot_values.delete(self.attr)
}

member_descriptor.__get__ = function(self, kls){
    if(kls === _b_.None){
        return self
    }
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

member_descriptor.__str__ = member_descriptor.__repr__ = function(self){
    return "<member '" + self.attr + "' of '" + self.cls.__name__ +
        "' objects>"
}

$B.set_func_names(member_descriptor, "builtins")

// used as the factory for method objects

var method = $B.method = $B.make_class("method",
    function(func, cls){
        var f = function(){
            return $B.$call(func).bind(null, cls).apply(null, arguments)
        }
        f.__class__ = method
        if(typeof func !== 'function'){
            console.log('method from func w-o $infos', func, 'all', $B.$call(func))
        }
        f.$infos = func.$infos || {}
        f.$infos.__func__ = func
        f.$infos.__self__ = cls
        f.$infos.__dict__ = $B.empty_dict()
        return f
    }
)

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
    f.__class__ = $B.method_wrapper
    f.$infos = method.$infos
    return f
}

method.__getattribute__ = function(self, attr){
    // Internal attributes __name__, __func__, __self__ etc.
    // are stored in self.$infos
    var infos = self.$infos
    if(infos && infos[attr]){
        if(attr == "__code__"){
            var res = {__class__: $B.Code}
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
        return $B.function.__getattribute__(self.$infos.__func__, attr)
    }
}

method.__repr__ = method.__str__ = function(self){
    return "<bound method " + self.$infos.__qualname__ +
       " of " + _b_.str.$factory(self.$infos.__self__) + ">"
}

method.__setattr__ = function(self, key){
    // Attempting to set an attribute on a method results in an AttributeError
    // being raised.
    if(key == "__class__"){
        throw _b_.TypeError.$factory("__class__ assignment only supported " +
            "for heap types or ModuleType subclasses")
    }
    throw $B.attr_error(key, self)
}

$B.set_func_names(method, "builtins")

$B.method_descriptor = $B.make_class("method_descriptor")

$B.classmethod_descriptor = $B.make_class("classmethod_descriptor")

// this could not be done before $type and $factory are defined
_b_.object.__class__ = type

$B.make_iterator_class = function(name, reverse){
    // Builds a class to iterate over items

    var klass = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        __name__: name,
        __qualname__: name,

        $factory: function(items){
            return {
                __class__: klass,
                __dict__: $B.empty_dict(),
                counter: reverse ? items.length : -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
        },
        $is_class: true,
        $iterator_class: true,

        __iter__: function(self){
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

        __next__: function(self){
            if(typeof self.test_change == "function"){
                var message = self.test_change()
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                if(message){
                    throw _b_.RuntimeError.$factory(message)
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
            throw _b_.StopIteration.$factory("StopIteration")
        },

        __reduce_ex__: function(self){
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}


// PEP 585
$B.GenericAlias = $B.make_class("GenericAlias",
    function(origin_class, items){
        var res = {
            __class__: $B.GenericAlias,
            __mro__: [origin_class],
            origin_class,
            items
        }
        return res
    }
)

$B.GenericAlias.__args__ = _b_.property.$factory(
    self => $B.fast_tuple(self.items)
)

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
    throw _b_.TypeError.$factory("descriptor '__getitem__' for '" +
        self.origin_class.__name__ +"' objects doesn't apply to a '" +
        $B.class_name(item) +"' object")
}

$B.GenericAlias.__mro_entries__ = function(self){
    return $B.fast_tuple([self.origin_class])
}

$B.GenericAlias.__new__ = function(origin_class, items){
    var res = {
        __class__: $B.GenericAlias,
        __mro__: [origin_class],
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

$B.GenericAlias.__origin__ = _b_.property.$factory(
    self => self.origin_class
)

$B.GenericAlias.__parameters__ = _b_.property.$factory(
    // In PEP 585 : "a lazily computed tuple (possibly empty) of unique
    // type variables found in __args__", but what are "unique type
    // variables" ?
    function(){
        return $B.fast_tuple([])
    }
)

$B.GenericAlias.__repr__ = function(self){
    var items = Array.isArray(self.items) ? self.items : [self.items]

    var reprs = []
    for(var item of items){
        if(item === _b_.Ellipsis){
            reprs.push('...')
        }else{
            if(item.$is_class){
                reprs.push(item.__name__)
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

$B.GenericAlias.__type_params__ = _b_.property.$factory(
    function(self){
        return $B.$getattr(self.origin_class, '__type_params__')
    }
)

$B.set_func_names($B.GenericAlias, "types")

$B.UnionType = $B.make_class("UnionType",
    function(items){
        return {
            __class__: $B.UnionType,
            items
        }
    }
)

$B.UnionType.__args__ = _b_.property.$factory(
    self => $B.fast_tuple(self.items)
)

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

$B.UnionType.__repr__ = function(self){
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

})(__BRYTHON__)
