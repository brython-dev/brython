;(function($B){

var _b_ = $B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name, class_obj, bases,
        parents_names, kwargs){

    // XXX todo : handle the __prepare__ method

    bases = bases || []
    var metaclass

    var module = class_obj.__module__
    if(module === undefined){
        // Get module of current frame
        module = $B.last($B.frames_stack)[2]
    }

    // check if parents are defined
    for(var i = 0; i < bases.length; i++){
        if(bases[i] === undefined){
            // restore the line of class definition
            $B.line_info = class_obj.$def_line
            throw _b_.NameError.$factory("name '" + parents_names[i] +
                "' is not defined")
        }
    }

    if(kwargs !== undefined){
        var cl_dict = _b_.dict.$factory()
        // transform class object into a dictionary
        for(var attr in class_obj){
            if(attr.charAt(0) != "$" || attr.substr(0,2) == "$$"){
                cl_dict.$string_dict[attr] = class_obj[attr]
            }
        }

        // get keyword arguments passed to the class
        var extra_kwargs = _b_.dict.$factory()
        for(var  i =0; i < kwargs.length; i++){
            var key = kwargs[i][0],
                val = kwargs[i][1]
            if(key == "metaclass"){
                // special case for metaclass
                metaclass = val
            }else{
                // other keyword arguments will be passed to __init_subclass__
                extra_kwargs.$string_dict[key] = val
            }
        }
        var mro0 = class_obj
    }else{
        var cl_dict = class_obj , // already a dict
            mro0 = cl_dict.$string_dict  // to replace class_obj in method creation
    }

    // If the metaclass is not explicitely set by passing the keyword
    // argument "metaclass" in the class definition:
    // - if the class has parents, inherit the class of the first parent
    // - otherwise default to type
    if(metaclass === undefined){
        if(bases && bases.length > 0 && bases[0].__class__ !== $B.JSObject){
            metaclass = bases[0].__class__
        }else{
            metaclass = _b_.type
        }
    }

    // Create the class dictionary
    var class_dict = {
        __name__: class_name.replace("$$", ""),
        __bases__: bases,
        __class__: metaclass,
        __dict__: cl_dict
    }

    for(key in cl_dict.$string_dict){
        class_dict[key] = cl_dict.$string_dict[key]
    }

    // DRo - slots will have been defined in class dict during type
    // or in class definition in class_obj. mro0 simplifies the choosing
    class_dict.__slots__ = mro0.__slots__

    class_dict.__mro__ = make_mro(bases)

    // Check if at least one method is abstract (cf PEP 3119)
    // If this is the case, the class cannot be instanciated
    var is_instanciable = true,
        non_abstract_methods = {},
        abstract_methods = {},
        mro = [class_dict].concat(class_dict.__mro__)

    for(var i = 0; i < mro.length; i++){
        var kdict = i == 0 ? mro0 : mro[i]  // DRo mr0 set above to choose rightly
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
            }
        }
    }

    // Check if class has __slots__
    for(var i = 0; i < mro.length; i++){
        var _slots = mro[i].__slots__
        if(_slots !== undefined){
            if(typeof _slots == "string"){_slots = [_slots]}
            else{_slots = _b_.list.$factory(_slots)}
            for(var j = 0; j < _slots.length; j++){
                cl_dict.$slots = cl_dict.$slots || {}
                cl_dict.$slots[_slots[j]] = class_dict.__mro__[i]
            }
        }
    }

    // Check if class has __setattr__
    for(var i = 0; i < mro.length - 1; i++){
        if(mro[i].hasOwnProperty("__setattr__")){
            cl_dict.$has_setattr = true
            break
        }
    }

    // Apply method __new__ of metaclass to create the class object
    var meta_new = _b_.type.__getattribute__(metaclass, "__new__")
    var kls = meta_new(metaclass, class_name, bases, cl_dict)
    kls.__module__ = module
    kls.$subclasses = []

    if(kls.__class__ === metaclass){
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.__getattribute__(metaclass, "__init__")
        meta_init(kls, class_name, bases, cl_dict)
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

    // call __init_subclass__ with the extra keyword arguments
    var first_parent = mro[0],
        init_subclass = _b_.type.__getattribute__(first_parent,
            "__init_subclass__")

    init_subclass(kls, extra_kwargs)

    return kls
}

function make_mro(bases){
    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    var seqs = [],
        pos1 = 0
    for(var i = 0; i < bases.length; i++){
        // we can't simply push bases[i].__mro__
        // because it would be modified in the algorithm
        if(bases[i] === _b_.str){bases[i] = $B.StringSubclass}
        else if(bases[i] === _b_.float){bases[i] = $B.FloatSubclass}
        var bmro = [],
            pos = 0
        if(bases[i] === undefined ||
                bases[i].__mro__ === undefined){
            if(bases[i].__class__ === $B.JSObject){
                // Brython class inherits a Javascript constructor. The
                // constructor is the attribute js_func
                var js_func = bases[i].js_func
                bases[i] = {
                    __class__: _b_.type,
                    __mro__: [_b_.object],
                    __name__: js_func.name,
                    __init__: function(instance, ...args){
                        args.forEach(function(arg, i){
                            args[i] = $B.pyobj2jsobj(arg)
                        })
                        js_func.apply(instance, args)
                        // Transform function attributes into methods
                        for(var attr in instance){
                            if(typeof instance[attr] == "function"){
                                instance[attr] = (function(f){
                                    return function(){
                                        var res = f.apply(instance, arguments)
                                        return $B.jsobj2pyobj(res)
                                    }
                                })(instance[attr])
                            }
                        }
                    }
                }
                bases[i].__init__.$infos = {
                    __name__: bases[i].__name__
                }
            }else{
                throw _b_.TypeError.$factory(
                    "Object passed as base class is not a class")
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

    if(bases.indexOf(_b_.object) == -1){
        bases = bases.concat(_b_.tuple.$factory([_b_.object]))
    }

    for(var i = 0; i < bases.length; i++){seqs[pos1++] = bases[i]}

    var mro = [],
        mpos = 0
    while(1){
        var non_empty = [],
            pos = 0
        for(var i = 0; i < seqs.length; i++){
            if(seqs[i].length > 0){non_empty[pos++] = seqs[i]}
        }
        if(non_empty.length == 0){break}
        for(var i  =0; i < non_empty.length; i++){
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

var type = $B.make_class("type",
    function(obj, bases, cl_dict){
        if(arguments.length == 1){
            return obj.__class__ || $B.get_class(obj)
        }
            return $B.$class_constructor(obj, cl_dict, bases)
    }
)

type.__class__ = type

type.__new__ = function(meta, name, bases, cl_dict){
    // DRo - cls changed to meta to reflect that the class (cls) hasn't
    // yet been created. It's about to be created by "meta"

    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute

    // Create the class dictionary
    var class_dict = {
        __class__ : meta,
        __name__ : name.replace("$$", ""),
        __bases__ : bases,
        __dict__ : cl_dict,
        $is_class: true,
        $slots: cl_dict.$slots,
        $has_setattr: cl_dict.$has_setattr
    }

    // set class attributes for faster lookups
    var items = $B.$dict_items(cl_dict)
    for(var i = 0; i < items.length; i++){
        var key = items[i][0],
            v = items[i][1]
        class_dict[key] = v
    }

    class_dict.__mro__ = make_mro(bases)

    return class_dict
}

type.__init__ = function(){
    // Returns nothing
}

type.__call__ = function(klass, ...extra_args){
    var new_func = _b_.type.__getattribute__(klass, "__new__")
    // create an instance with __new__
    var instance = new_func.apply(null, arguments)
    if(instance.__class__ === klass){
        // call __init__ with the same parameters
        var init_func = _b_.type.__getattribute__(klass, "__init__")
        if(init_func !== _b_.object.__init__){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            init_func(instance, ...extra_args)
        }
    }
    return instance
}

type.__format__ = function(klass, fmt_spec){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}

function method_wrapper(attr, klass, method){
    // add __str__ and __repr__ to special methods
    method.__str__ = method.__repr__ = function(self){
        return "<method '" + attr + "' of '" + klass.__name__ + "' objects>"
    }
    method.$infos = {
        __name__: attr,
        __module__: klass.__module__
    }
    return method
}

type.__repr__ = type.__str__ = function(kls){
    var qualname = kls.__name__
    if(kls.__module__ != "builtins"){
        qualname = kls.__module__ + "." + qualname
    }
    return "<class '" + qualname + "'>"
}

type.__getattribute__ = function(klass, attr){

    //console.log("attr", attr, "de la classe", klass)
    switch(attr) {
        case "__class__":
            return klass.__class__
        case "__doc__":
            return klass.__doc__ || _b_.None
        case "__setattr__":
            if(klass["__setattr__"] !== undefined){
                var func = klass["__setattr__"]
            }else{
                var func = function(key,value){klass[key] = value}
            }
            return method_wrapper(attr, klass, func)
        case "__delattr__":
            if(klass["__delattr__"] !== undefined){
                return klass["__delattr__"]
            }
            return method_wrapper(attr, klass,
                function(key){delete klass[key]})
    }
    var res = klass[attr]

    if(res === undefined){
        // search in classes hierarchy, following method resolution order

        var v = klass[attr]
        if(v === undefined){
            var mro = klass.__mro__
            for(var i = 0; i < mro.length; i++){
                var v = mro[i][attr]
                if(v !== undefined){
                    res = v
                    break
                }
            }
        }else{
            res = v
        }

        if(res === undefined){
            // search in metaclass
            var meta = klass.__class__
            if(meta[attr] !== undefined){
                res = meta[attr]
                if(typeof res == "function"){
                    var meta_method = function(){
                        return res(klass, ...arguments)
                    }
                    meta_method.__class__ = $B.method
                    meta_method.$infos = {
                        __self__: klass,
                        __func__: res,
                        __name__: attr,
                        __qualname__: klass.__name__ + "." + attr,
                        __module__: res.$infos ? res.$infos.__module__ : ""
                    }
                    return meta_method
                }
            }
        }

        if(res === undefined){
            // search a method __getattr__
            var getattr = null,
                v = klass.__getattr__
            if(v === undefined){
                if(klass.__class__.__getattr__ !== undefined){
                    getattr = klass.__class__.__getattr__
                }else{
                    for(var i = 0; i < mro.length; i++){
                        if(mro[i].__getattr__ !== undefined){
                            getattr = mro[i].__getattr__
                            break
                        }else if(mro[i].__class__.__getattr__ !== undefined){
                            getattr = mro[i].__class__.__getattr__
                            break
                        }
                    }
                }
            }else{
                getattr = v
            }
            if(getattr !== null){
                return getattr(klass, attr)
            }
        }
    }

    if(res === undefined && klass.$slots && klass.$slots[attr] !== undefined){
        return member_descriptor.$factory(klass.$slots[attr], attr)
    }

    if(res !== undefined){
        // If the attribute is a property, return it
        if(typeof res == "function"){
            // method
            if(res.$infos === undefined){
                console.log("warning: no attribute $infos for", res)
            }

            if(attr == "__new__"){res.$type = "staticmethod"}

            switch (res.$type) {
                case "staticmethod":
                    return res
                case undefined:
                case "function":
                case "instancemethod":
                    return res
                case "classmethod":
                    // class method : called with the class as first argument
                    var cl_method = function(){
                        return res(klass, ...arguments)
                    }
                    cl_method.__class__ = $B.method
                    cl_method.$infos = {
                        __self__: klass,
                        __func__: res,
                        __name__: attr,
                        __qualname__: klass.__name__ + "." + attr,
                        __module__: res.$infos ? res.$infos.__module__ : ""
                    }
                    return cl_method
            }
        }else{
            return res
        }

    }
}


$B.set_func_names(type, "builtins")

_b_.type = type

// class of constructors
$B.$factory = {
    __class__: type,
    $is_class: true
}
$B.$factory.__mro__ = [type, _b_.object]


var $instance_creator = $B.$instance_creator = function(klass){
    // return the function to initalise a class instance

    // The class may not be instanciable if it has at least one abstract method
    if(klass.$instanciable !== undefined){
        return function(){throw _b_.TypeError.$factory(
            "Can't instantiate abstract class interface " +
                "with abstract methods")}
    }
    var metaclass = klass.__class__,
        call_func = _b_.type.__getattribute__(metaclass, "__call__")

    var factory = function(){
        return call_func(klass, ...arguments)
    }
    factory.__class__ = $B.Function
    factory.$infos = {
        __name__: klass.__name__,
        __module__: klass.__module__
    }
    return factory
}

// Used for class members, defined in __slots__
var member_descriptor = $B.make_class("member_descriptor",
    function(klass, attr){
        return{
            __class__: member_descriptor,
            klass: klass,
            attr: attr
        }
    }
)

$B.set_func_names(member_descriptor, "builtins")

// used as the factory for method objects

var method = $B.make_class("method")

method.__eq__ = function(self, other){
    return self.$infos !== undefined &&
           other.$infos !== undefined &&
           self.$infos.__func__ === other.$infos.__func__ &&
           self.$infos.__self__ === other.$infos.__self__
}

method.__ne__ = function(self, other){
    return ! $B.method.__eq__(self, other)
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
    }else if(infos && infos.__func__ && infos.__func__.$infos &&
            infos.__func__.$infos[attr]){ // eg __doc__
        return infos.__func__.$infos[attr]
    }else{
        return _b_.object.__getattribute__(self, attr)
    }
}

method.__repr__ = method.__str__ = function(self){
    return "<bound method " + self.$infos.__qualname__ +
       " of " + _b_.str.$factory(self.$infos.__self__) + ">"
}

$B.method = method

$B.set_func_names(method, "builtins")

// this could not be done before $type and $factory are defined
_b_.object.__class__ = type

})(__BRYTHON__)
