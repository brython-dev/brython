;(function($B){

var _b_ = $B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name, class_ns, bases,
        parents_names, kwargs){
    // class obj is a JS object with attributes
    var class_obj_proxy = class_ns.locals,
        metaclass = class_ns.metaclass,
        bases = $B.resolve_mro_entries(bases)

    // class_obj is a proxy around a Python dict(-like) object
    // Transform it into a JS object
    var class_obj = Object.create(null),
        dict = class_obj_proxy.$target,
        frame = $B.last($B.frames_stack),
        iter = $B.next_of1(dict, frame, frame.$lineno)
    for(var key of iter){
        class_obj[key] = $B.$getitem(dict, key)
    }

    var module = class_obj.__module__
    if(module === undefined){
        // Get module of current frame
        module = class_obj.__module__ = $B.last($B.frames_stack)[2]
    }

    // bool is not a valide base
    for(var base of bases){
        if(bases[i] === _b_.bool){
            throw _b_.TypeError.$factory(
                "type 'bool' is not an acceptable base type")
        }
    }

    // Keyword arguments passed to the class
    var extra_kwargs = {},
        prepare_kwargs = {} // used by __prepare__, includes the metaclass
    if(kwargs){
        for(var  i = 0; i < kwargs.length; i++){
            var key = kwargs[i][0],
                val = kwargs[i][1]
            if(key == "metaclass"){
                // special case for metaclass
                metaclass = val
            }else{
                // other keyword arguments will be passed to __init_subclass__
                extra_kwargs[key] = val
            }
            prepare_kwargs[key] = val
        }
    }

    var mro0 = class_obj

    // A class that overrides __eq__() and does not define __hash__()
    // will have its __hash__() implicitly set to None
    if(class_obj.__eq__ !== undefined && class_obj.__hash__ === undefined){
        class_obj.__hash__ = _b_.None
    }

    // Create the class dictionary
    var class_dict = {
        __bases__: bases,
        __class__: metaclass,
        __dict__: dict // class namespace as a Python dict
    }

    for(var key in class_obj){
        class_dict[key] = class_obj[key]
    }

    if(_b_.issubclass(metaclass, type)){
        class_dict.__mro__ = _b_.type.mro(class_dict).slice(1)
    }

    // Check if at least one method is abstract (cf PEP 3119)
    // If this is the case, the class cannot be instanciated
    var is_instanciable = true,
        non_abstract_methods = {},
        abstract_methods = {},
        mro = [class_dict].concat(class_dict.__mro__)

    for(var i = 0; i < mro.length; i++){
        var kdict = i == 0 ? mro0 : mro[i]
        for(var attr in kdict){
            if(non_abstract_methods[attr]){continue}
            var v = kdict[attr]
            if(typeof v == "function"){
                if(v.__isabstractmethod__ === true ||
                        (v.$attrs && v.$attrs.__isabstractmethod__)){
                    is_instanciable = false
                    abstract_methods[attr] = true
                }else{
                    non_abstract_methods[attr] = true
                }
            }else{
                non_abstract_methods[attr] = true
            }
        }
    }

    // Check if class has __slots__
    var slots = class_obj.__slots__
    if(slots !== undefined){
        if(typeof slots == "string"){
            slots = [slots]
        }else{
            for(var item of $B.next_of1(slots)){
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
    if(metaclass.__qualname__ == '_TypedDictMeta'){
        bases = $B.resolve_mro_entries(bases)
    }
    var kls = meta_new(metaclass, class_name, bases, dict,
                       {$nat: 'kw', kw: extra_kwargs})
    kls.__module__ = module
    kls.$infos = {
        __module__: module,
        __name__: class_name,
        __qualname__: class_obj.$qualname
    }
    kls.$subclasses = []

    if(kls.__bases__ === undefined || kls.__bases__.length == 0){
        kls.__bases__ = $B.fast_tuple([_b_.object])
    }

    kls.__orig_bases__ = bases

    // Set attribute "$class" of functions defined in the class. Used in
    // py_builtin_functions / Function.__setattr__ to reset the function
    // if the attribute __defaults__ is reset.
    for(var attr in class_obj){
        if(attr.charAt(0) != "$"){
            if(typeof class_obj[attr] == "function"){
                class_obj[attr].$infos.$class = kls
            }
        }
    }
    if(kls.__class__ === metaclass){
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.__getattribute__(metaclass, "__init__")
        meta_init(kls, class_name, bases, dict)
    }

    // Set new class as subclass of its parents
    for(var i = 0; i < bases.length; i++){
        bases[i].$subclasses  = bases[i].$subclasses || []
        bases[i].$subclasses.push(kls)
    }

    if(!is_instanciable){
        function nofactory(){
            throw _b_.TypeError.$factory("Can't instantiate abstract class " +
                "interface with abstract methods " +
                Object.keys(abstract_methods).join(", "))}
        kls.$factory = nofactory
    }

    return kls
}

function meta_from_bases(class_name, module, bases){
    var metaclass
    if(bases && bases.length > 0){
        metaclass = bases[0].__class__
        if(metaclass === undefined){
            // Might inherit a Javascript constructor
            if(typeof bases[0] == "function"){
                if(bases.length != 1){
                    throw _b_.TypeError.$factory("A Brython class " +
                        "can inherit at most 1 Javascript constructor")
                }
                metaclass = bases[0].__class__ = $B.JSMeta
                $B.set_func_names(bases[0], module)
            }else{
                console.log('meta from bases', class_name, module, bases)
                throw _b_.TypeError.$factory("Argument of " + class_name +
                    " is not a class (type '" + $B.class_name(bases[0]) +
                    "')")
            }
        }
        for(var i = 1; i < bases.length; i++){
            var mc = bases[i].__class__
            if(mc === metaclass || _b_.issubclass(metaclass, mc)){
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
        metaclass = _b_.type
    }
    return metaclass
}

$B.get_metaclass = function(class_name, module, bases, kw_meta){
    // If a keyword argument "metaclass=kw_meta" is passed, kw_meta is set
    var metaclass
    if(kw_meta === undefined && bases.length == 0){
        return _b_.type
    }else if(kw_meta){
        if(! _b_.isinstance(kw_meta, _b_.type)){
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
                metaclass = bases[0].__class__ = $B.JSMeta
                $B.set_func_names(bases[0], module)
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

$B.make_class_namespace = function(metaclass, class_name, module, qualname,
                                   bases, orig_bases){
    // Use __prepare__ (PEP 3115)
    var class_dict = _b_.dict.$factory([
                         ['__module__', module],
                         ['__qualname__', qualname],
                         ['__orig_bases__', orig_bases]
                         ])
    if(metaclass !== _b_.type){
        var prepare = $B.$getattr(metaclass, "__prepare__", _b_.None)
        if(prepare !== _b_.None){
            class_dict = $B.$call(prepare)(class_name, bases) // dict or dict-like
            function set_attr_if_absent(attr, value){
                try{
                    $B.$getitem(class_dict, attr)
                }catch(err){
                    $B.$setitem(class_dict, attr, value)
                }
            }
            set_attr_if_absent('__module__', module)
            set_attr_if_absent('__qualname__', qualname)
            if(orig_bases !== bases){
                set_attr_if_absent('__orig_bases__', orig_bases)
            }
        }
    }

    if(class_dict.__class__ === _b_.dict){
        return new Proxy(class_dict, {
            get: function(target, prop){
                if(prop == '__class__'){
                    return _b_.dict
                }else if(prop == '$target'){
                    return target
                }
                if(target.$string_dict.hasOwnProperty(prop)){
                    return target.$string_dict[prop][0]
                }
                return undefined
            },
            set: function(target, prop, value){
                if(target.$string_dict.hasOwnProperty(prop)){
                    target.$string_dict[prop][0] = value
                }
                target.$string_dict[prop] = [value, target.$order++]
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
        if(! _b_.isinstance(base, _b_.type)){
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
        __class__: _b_.type,
        __mro__: [_b_.object],
        __qualname__: qualname,
        $infos:{
            __qualname__: qualname,
            __name__: $B.last(qualname.split('.'))
        },
        $is_class: true
    }

    A.$factory = factory

    return A
}

var type = $B.make_class("type",
    function(kls, bases, cl_dict){
        var missing = {},
            $ = $B.args('type', 3, {kls: null, bases: null, cl_dict: null},
                ['kls', 'bases', 'cl_dict'], arguments,
                {bases: missing, cl_dict: missing}, null, 'kw'),
            kls = $.kls,
            bases = $.bases,
            cl_dict = $.cl_dict,
            kw = $.kw

        var kwargs = {'$nat': 'kw', kw: {}}
        for(var key in kw.$string_dict){
            kwargs.kw[key] = kw.$string_dict[key][0]
        }
        if(cl_dict === missing){
            if(bases !== missing){
                throw _b_.TypeError.$factory('type() takes 1 or 3 arguments')
            }
            return kls.__class__ || $B.get_class(kls)
        }else{
            var module = $B.last($B.frames_stack)[2],
                meta = meta_from_bases(kls, module, bases),
                meta_new = $B.$call($B.$getattr(meta, '__new__'))
            return meta_new(meta, kls, bases, cl_dict, kwargs)
        }
    }
)

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

type.__class__ = type

type.__format__ = function(klass, fmt_spec){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}

type.__getattribute__ = function(klass, attr){
    switch(attr) {
        case "__bases__":
            return $B.fast_tuple($B.resolve_mro_entries(klass.__bases__) || [_b_.object])
        case "__class__":
            return klass.__class__
        case "__doc__":
            return klass.__doc__ || _b_.None
        case "__setattr__":
            if(klass["__setattr__"] !== undefined){
                var func = klass["__setattr__"]
            }else{
                var func = function(kls, key, value){
                    kls[key] = value
                }
            }
            return method_wrapper.$factory(attr, klass, func)
        case "__delattr__":
            if(klass["__delattr__"] !== undefined){
                return klass["__delattr__"]
            }
            return method_wrapper.$factory(attr, klass,
                function(key){delete klass[key]})
    }
    var res = klass[attr]
    var $test = false // attr == "__qualname__" // && klass.$infos.__name__ == 'StrEnum'

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
        var v = klass[attr]
        if(v === undefined){
            if($test){
                console.log(attr, 'not in klass[attr], search in __dict__',
                    klass.__dict__.$string_dict)
            }
            if(klass.__dict__ && klass.__dict__.$string_dict
                    && klass.__dict__.$string_dict[attr]){
                res = klass[attr] = klass.__dict__.$string_dict[attr][0]
                if($test){
                    console.log('found in __dict__', v)
                }
            }else{
                var mro = klass.__mro__
                if(mro === undefined){
                    console.log("no mro for", klass)
                }
                for(var i = 0; i < mro.length; i++){
                    var v = mro[i][attr]
                    if(v !== undefined){
                        res = v
                        break
                    }
                }
            }
        }else{
            res = v
        }
        if($test){
            console.log('search in class mro', res)
            if(res !== undefined){
                if(klass[attr]){
                    console.log('found in klass', klass)
                }else{
                    console.log('found in', mro[i])
                }
            }
        }
    }

    if(res === undefined){
        // search in metaclass
        if(res === undefined){
            var meta = klass.__class__ || $B.get_class(klass),
                res = meta[attr]
            if($test){console.log("search in meta", meta, res)}
            if(res === undefined){
                var meta_mro = meta.__mro__
                for(var i = 0; i < meta_mro.length; i++){
                    var res = meta_mro[i][attr]
                    if(res !== undefined){break}
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
                        __qualname__: meta.$infos.__name__ + "." + attr,
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
                for(var i = 0; i < meta_mro.length; i++){
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
                    __qualname__: klass.$infos.__name__ + "." + res.$infos.__name__,
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
            if(res.$infos === undefined && $B.debug > 1){
                console.log("warning: no attribute $infos for", res,
                    "klass", klass, "attr", attr)
            }
            if($test){console.log("res is function", res)}

            if(attr == "__new__" ||
                    res.__class__ === $B.builtin_function){
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
    var $ = $B.args("__init_subclass__", 1, {}, [],
        arguments, {}, "args", "kwargs")
    if($.kwargs !== undefined){
        if($.kwargs.__class__ !== _b_.dict ||
                Object.keys($.kwargs.$string_dict).length > 0){
            throw _b_.TypeError.$factory(
                "__init_subclass__() takes no keyword arguments")
        }
    }
    return _b_.None
}

type.__instancecheck__ = function(cls, instance){
    var kl = instance.__class__ || $B.get_class(instance)
    if(kl === cls){return true}
    else{
        for(var i = 0; i < kl.__mro__.length; i++){
            if(kl.__mro__[i] === cls){return true}
        }
    }
    return false
}

type.__instancecheck__.$type = "staticmethod"

// __name__ is a data descriptor
type.__name__ = {
    __get__: function(self){
        return self.$infos.__name__
    },
    __set__: function(self, value){
        self.$infos.__name__ = value
    },
    __str__: function(self){
        return "type"
    },
    __eq__: function(self, other){
        return self.$infos.__name__ == other
    }
}


type.__new__ = function(meta, name, bases, cl_dict, extra_kwargs){
    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute
    var test = false // name == '_GenericAlias'

    // arguments passed as keywords in class defintion
    extra_kwargs = extra_kwargs === undefined ? {$nat: 'kw', kw: {}} :
        extra_kwargs

    // Create the class dictionary
    if(cl_dict.$string_dict === undefined){
        console.log('bizarre', meta, name, bases, cl_dict)
        alert()
    }
    var module = cl_dict.$string_dict.__module__
    if(module){
        module = module[0]
    }else{
        module = $B.last($B.frames_stack)[2]
    }
    var class_dict = {
        __class__ : meta,
        __bases__ : bases,
        __dict__ : cl_dict,
        __qualname__: name,
        __module__: module,
        $infos:{
            __name__: name,
            __module__: module,
            __qualname__: name
        },
        $is_class: true,
        $has_setattr: cl_dict.$has_setattr
    }

    try{
        var slots = $B.$getitem(cl_dict, '__slots__')
        for(var name of $B.next_of1(slots)){
            class_dict[name] = member_descriptor.$factory(name, class_dict)
        }
    }catch(err){
    }

    class_dict.__mro__ = type.mro(class_dict).slice(1)

    // set class attributes for faster lookups
    var items = $B.dict_to_list(cl_dict) // defined in py_dict.js
    for(var i = 0; i < items.length; i++){
        var key = items[i][0],
            v = items[i][1]
        if(key === "__module__"){continue} // already set
        if(key === "__class__"){continue} // already set
        if(key.startsWith('$')){continue}

        if(v === undefined){continue}
        class_dict[key] = v
        if(v.__class__){
            // cf PEP 487 and issue #1178
            var set_name = $B.$getattr(v.__class__, "__set_name__", _b_.None)
            if(set_name !== _b_.None){
                set_name(v, class_dict, key)
            }
        }
        if(typeof v == "function"){
            if(v.$infos === undefined){
                console.log("type new", v, v + "")
                console.log($B.frames_stack.slice())
            }else{
                v.$infos.$class = class_dict
                v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                if(v.$infos.$defaults){
                    // If the function was set an attribute __defaults__, it is
                    // stored in v.$infos.$defaults (cf. Function.__setattr__ in
                    // py_builtin_functions.js)
                    var $defaults = v.$infos.$defaults
                    $B.Function.__setattr__(v, "__defaults__",
                        $defaults)
                }
            }
        }
    }

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
    if(other !== _b_.None && ! _b_.isinstance(other, type)){
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
    if(kls.$infos === undefined){
        console.log("no $infos", kls)
    }
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

type.__setattr__ = function(kls, attr, value){
    var $test = false
    if($test){console.log("kls is class", type, types[attr])}
    if(type[attr] && type[attr].__get__ &&
            type[attr].__set__){
        type[attr].__set__(kls, value)
        return _b_.None
    }
    if(kls.$infos && kls.$infos.__module__ == "builtins"){
        throw _b_.TypeError.$factory(
            `cannot set '${attr}' attribute of immutable type '` +
                kls.$infos.__name__ + "'")
    }
    kls[attr] = value
    if(attr == "__init__" || attr == "__new__"){
        // redefine the function that creates instances of the class
        kls.$factory = $B.$instance_creator(kls)
    }else if(attr == "__bases__"){
        // redefine mro
        kls.__mro__ = _b_.type.mro(kls)
    }
    if($test){console.log("after setattr", kls)}
    return _b_.None
}

type.mro = function(cls){
    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    if(cls === undefined){
        throw _b_.TypeError.$factory(
            'unbound method type.mro() needs an argument')
    }
    var bases = $B.resolve_mro_entries(cls.__bases__),
        seqs = [],
        pos1 = 0
    for(var i = 0; i < bases.length; i++){
        // We can't simply push bases[i].__mro__
        // because it would be modified in the algorithm
        var bmro = [],
            pos = 0
        if(bases[i] === undefined ||
                bases[i].__mro__ === undefined){
            if(bases[i].__class__ === undefined){
                // Brython class inherits a Javascript constructor. The
                // constructor is the attribute js_func
                return [_b_.object]
            }else{
                console.log('erreur pour base', bases[i])
                console.log('cls', cls)
                //throw _b_.TypeError.$factory(
                //    "Object passed as base class is not a class")
            }
        }
        bmro[pos++] = bases[i]
        var _tmp = bases[i].__mro__
        if(_tmp[0] === bases[i]){
            _tmp.splice(0, 1)
        }
        for(var k = 0; k < _tmp.length; k++){
            bmro[pos++] = _tmp[k]
        }
        seqs[pos1++] = bmro
    }

    seqs[pos1++] = bases.slice()

    var mro = [cls],
        mpos = 1
    while(1){
        var non_empty = [],
            pos = 0
        for(var i = 0; i < seqs.length; i++){
            if(seqs[i].length > 0){non_empty[pos++] = seqs[i]}
        }
        if(non_empty.length == 0){break}
        for(var i = 0; i < non_empty.length; i++){
            var seq = non_empty[i],
                candidate = seq[0],
                not_head = [],
                pos = 0
            for(var j = 0; j < non_empty.length; j++){
                var s = non_empty[j]
                if(s.slice(1).indexOf(candidate) > -1){not_head[pos++] = s}
            }
            if(not_head.length > 0){candidate = null}
            else{break}
        }
        if(candidate === null){
            throw _b_.TypeError.$factory(
                "inconsistent hierarchy, no C3 MRO is possible")
        }
        mro[mpos++] = candidate
        for(var i = 0; i < seqs.length;  i++){
            var seq = seqs[i]
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

type.__subclasscheck__ = function(self, subclass){
    // Is subclass a subclass of self ?
    var klass = self
    if(klass === _b_.str){
        klass = $B.StringSubclass
    }else if(klass === _b_.float){
        klass = $B.FloatSubclass
    }
    if(subclass.__bases__ === undefined){
        return self === _b_.object
    }
    return subclass.__bases__.indexOf(klass) > -1
}

$B.set_func_names(type, "builtins")

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

property.__init__ = function(self, fget, fset, fdel, doc) {
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
    self.__doc__ = doc || ""
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

property.__set__ = function(self, kls, value){
    if(self.fset === undefined){
        throw _b_.AttributeError.$factory("can't set attribute")
    }
    $B.$getattr(self.fset, '__call__')(kls, value)
}

$B.set_func_names(property, "builtins")

var wrapper_descriptor = $B.wrapper_descriptor =
    $B.make_class("wrapper_descriptor")

$B.set_func_names(wrapper_descriptor, "builtins")

type.__call__.__class__ = wrapper_descriptor

var $instance_creator = $B.$instance_creator = function(klass){
    var test = false // klass.$infos && klass.$infos.__name__ == 'auto'
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
    if(klass.$instanciable !== undefined){
        return function(){throw _b_.TypeError.$factory(
            "Can't instantiate abstract class interface " +
                "with abstract methods")}
    }
    var metaclass = klass.__class__ || $B.get_class(klass),
        call_func,
        factory
    if(metaclass === _b_.type && (!klass.__bases__ || klass.__bases__.length == 0)){
        if(klass.hasOwnProperty("__new__")){
            if(klass.hasOwnProperty("__init__")){
                factory = function(){
                    // Call __new__ with klass as first argument
                    var kls = klass.__new__.bind(null, klass).
                                            apply(null, arguments)
                    klass.__init__.bind(null, kls).apply(null, arguments)
                    return kls
                }
            }else{
                factory = function(){
                    return klass.__new__.bind(null, klass).
                                         apply(null, arguments)
                }
            }
        }else if(klass.hasOwnProperty("__init__")){
            factory = function(){
                var kls = {
                    __class__: klass,
                    __dict__: $B.empty_dict()
                }
                klass.__init__.bind(null, kls).apply(null, arguments)
                return kls
            }
        }else{
            factory = function(){
                if(arguments.length > 0){
                    if(arguments.length == 1 && arguments[0].$nat &&
                        Object.keys(arguments[0].kw).length == 0){
                    }else{
                        throw _b_.TypeError.$factory("object() takes no parameters")
                    }
                }
                var res = Object.create(null)
                $B.update_obj(res, {__class__: klass,
                                    __dict__: $B.empty_dict()})
                return res
            }
        }
    }else{
        call_func = _b_.type.__getattribute__(metaclass, "__call__")
        var factory = function(){
            if(call_func.$is_class){
                return $B.$call(call_func)(...arguments)
            }
            return call_func.bind(null, klass).apply(null, arguments)
        }
    }
    factory.__class__ = $B.Function
    if(klass.$infos === undefined){
        console.log('no klass $infos', klass)
        console.log($B.frames_stack.slice())
    }
    factory.$infos = {
        __name__: klass.$infos.__name__,
        __module__: klass.$infos.__module__
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
var member_descriptor = $B.make_class("member_descriptor",
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

member_descriptor.__get__ = function(self, kls, obj_type){
    if(kls === _b_.None){
        return self
    }
    if(kls.$slot_values === undefined ||
            ! kls.$slot_values.has(self.attr)){
        throw _b_.AttributeError.$factory(self.attr)
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
    return "<member '" + self.attr + "' of '" + self.cls.$infos.__name__ +
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
        f.$infos = func.$infos
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
    var f = function(){return self(arguments)}
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
            for(var attr in infos.__code__){
                res[attr] = infos.__code__[attr]
            }
            return res
        }else{
            return infos[attr]
        }
    }else if(method.hasOwnProperty(attr)){
        return _b_.object.__getattribute__(self, attr)
    }else{ // use attributes of underlying function __func__
        return $B.Function.__getattribute__(self.$infos.__func__, attr)
    }
}

method.__repr__ = method.__str__ = function(self){
    return "<bound method " + self.$infos.__qualname__ +
       " of " + _b_.str.$factory(self.$infos.__self__) + ">"
}

method.__setattr__ = function(self, key, value){
    // Attempting to set an attribute on a method results in an AttributeError
    // being raised.
    if(key == "__class__"){
        throw _b_.TypeError.$factory("__class__ assignment only supported " +
            "for heap types or ModuleType subclasses")
    }
    throw $B.attr_error(attr, self)
}

$B.set_func_names(method, "builtins")

$B.method_descriptor = $B.make_class("method_descriptor")

$B.classmethod_descriptor = $B.make_class("classmethod_descriptor")

// this could not be done before $type and $factory are defined
_b_.object.__class__ = type

$B.make_iterator_class = function(name){
    // Builds a class to iterate over items

    var klass = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        $factory: function(items){
            return {
                __class__: klass,
                __dict__: $B.empty_dict(),
                counter: -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
        },
        $infos:{
            __name__: name
        },
        $is_class: true,
        $iterator_class: true,

        __iter__: function(self){
            self.counter = self.counter === undefined ? -1 : self.counter
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

            self.counter++
            if(self.counter < self.items.length){
                var item = self.items[self.counter]
                if(self.items.$brython_class == "js"){
                    // iteration on Javascript lists produces Python objects
                    // cf. issue #1388
                    item = $B.$JS2Py(item)
                }
                return item
            }
            delete self.items.$next_func // set by $B.next_of()
            throw _b_.StopIteration.$factory("StopIteration")
        },

        __qualname__: name,

        __reduce_ex__: function(self, protocol){
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
    if(! _b_.isinstance(other, $B.GenericAlias)){
        return false
    }
    return $B.rich_comp("__eq__", self.origin_class, other.origin_class) &&
        $B.rich_comp("__eq__", self.items, other.items)
}

$B.GenericAlias.__getitem__ = function(self, item){
    throw _b_.TypeError.$factory("descriptor '__getitem__' for '" +
        self.origin_class.$infos.__name__ +"' objects doesn't apply to a '" +
        $B.class_name(item) +"' object")
}

$B.GenericAlias.__new__ = function(origin_class, items, kwds){
    var res = {
        __class__: $B.GenericAlias,
        __mro__: [origin_class],
        origin_class,
        items,
        $is_class: true
    }
    return res
}

$B.GenericAlias.__or__ = function(self, other){
    var $ = $B.args('__or__', 2, {self: null, other: null}, ['self', 'other'],
                    arguments, {}, null, null)
    return $B.UnionType.$factory([self, other])
}

$B.GenericAlias.__origin__ = _b_.property.$factory(
    self => self.origin_class
)

$B.GenericAlias.__parameters__ = _b_.property.$factory(
    // In PEP 585 : "a lazily computed tuple (possibly empty) of unique
    // type variables found in __args__", but what are "unique type
    // variables" ?
    self => $B.fast_tuple([])
)

$B.GenericAlias.__repr__ = function(self){
    var items = []
    for(var i = 0, len = self.items.length; i < len; i++){
        if(self.items[i] === _b_.Ellipsis){
            items.push('...')
        }else{
            if(self.items[i].$is_class){
                items.push(self.items[i].$infos.__name__)
            }else{
                items.push(_b_.repr(self.items[i]))
            }
        }
    }
    return self.origin_class.$infos.__qualname__ + '[' +
        items.join(", ") + ']'
}

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
    if(! _b_.isinstance(other, $B.UnionType)){
        return _b_.NotImplemented
    }
    return _b_.list.__eq__(self.items, other.items)
}

$B.UnionType.__parameters__ = _b_.property.$factory(
    () => $B.fast_tuple([])
)

$B.UnionType.__repr__ = function(self){
    var t = []
    for(var item of self.items){
        if(item.$is_class){
            var s = item.$infos.__name__
            if(item.$infos.__module__ !== "builtins"){
                s = item.$infos.__module__ + '.' + s
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
