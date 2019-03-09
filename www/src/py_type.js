;(function($B){

var _b_ = $B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name, class_obj, bases,
        parents_names, kwargs){

    var $test = false //class_name == "SRE_Pattern"
    if($test){console.log("create class", class_name, "class_obj", class_obj)}
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

    // Replace non-class bases that have a __mro_entries__ (PEP 560)
    var orig_bases = bases.slice(),
        use_mro_entries = false
    for(var i = 0; i < bases.length; i++){
        if(bases[i] === undefined ||
                (bases[i].__mro__ === undefined &&
                bases[i].__class__ !== $B.JSObject)){
            var mro_entries = $B.$getattr(bases[i], "__mro_entries__",
                _b_.None)
            if(mro_entries !== _b_.None){
                var entries = _b_.list.$factory(mro_entries(bases))
                bases.splice(i, 1, ...entries)
                use_mro_entries = true
                i--
                continue
            }
        }
    }

    // If the metaclass is not explicitely set by passing the keyword
    // argument "metaclass" in the class definition:
    // - if the class has parents, inherit the class of the first parent
    // - otherwise default to type
    if(metaclass === undefined){
        if(bases && bases.length > 0 && bases[0].__class__ !== $B.JSObject){
            metaclass = bases[0].__class__
            for(var i = 1; i < bases.length; i++){
                var mc = bases[i].__class__
                if(mc === metaclass){
                    // same metaclass, do nothing
                }else if(mc.__bases__ &&
                        mc.__bases__.indexOf(metaclass) > -1){
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
    }
    // Use __prepare__ (PEP 3115)
    var prepare = $B.$getattr(metaclass, "__prepare__", _b_.None),
        cl_dict = prepare(class_name, bases) // dict or dict-like

    if(cl_dict.__class__ !== _b_.dict){
        set_class_item = $B.$getattr(cl_dict, "__setitem__")
    }else{
        set_class_item = function(attr, value){
            cl_dict.$string_dict[attr] = value
        }
    }

    // Transform class object into a dictionary
    for(var attr in class_obj){
        if(attr.charAt(0) != "$" || attr.substr(0,2) == "$$"){
            set_class_item(attr, class_obj[attr])
        }
    }

    if(use_mro_entries){
        set_class_item("__orig_bases__", _b_.tuple.$factory(orig_bases))
    }

    // Create the class dictionary
    var class_dict = {
        __bases__: bases,
        __class__: metaclass,
        __dict__: cl_dict
    }
    if(cl_dict.__class__ === _b_.dict){
        for(var key in cl_dict.$string_dict){
            class_dict[key] = cl_dict.$string_dict[key]
        }
    }else{
        var get_class_item = $B.$getattr(cl_dict, "__getitem__")
        var it = _b_.iter(cl_dict)
        while(true){
            try{
                var key = _b_.next(it)
                class_dict[key] = get_class_item(key)
            }catch(err){
                break
            }
        }
    }
    class_dict.__mro__ = _b_.type.mro(class_dict)

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
    var _slots = class_obj.__slots__
    if(_slots !== undefined){
        if(typeof _slots == "string"){
            _slots = [_slots]
        }else{
            _slots = _b_.list.$factory(_slots)
        }
        cl_dict.__slots__ = _slots
    }

    // Check if class has __setattr__ or descriptors
    for(var i = 0; i < mro.length - 1; i++){
        for(var attr in mro[i]){
            if(attr == "__setattr__"){
                cl_dict.$has_setattr = true
                break
            }else if(mro[i][attr] && mro[i][attr].__get__){
                cl_dict.$has_setattr = true
                break
            }
        }
    }

    // Apply method __new__ of metaclass to create the class object
    var meta_new = _b_.type.__getattribute__(metaclass, "__new__")
    var kls = meta_new(metaclass, class_name, bases, cl_dict)
    kls.__module__ = module
    kls.$infos = {
        __module__: module,
        __name__: class_name,
        __qualname__: class_name
    }
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
        // call __init_subclass__ with the extra keyword arguments
        if(i == 0){
            init_subclass = _b_.type.__getattribute__(bases[i],
                "__init_subclass__")
            if(init_subclass.$infos.__func__ !== undefined){
                init_subclass.$infos.__func__(kls, {$nat: "kw", kw: extra_kwargs})
            }else{
                init_subclass(kls, {$nat: "kw", kw: extra_kwargs})
            }
        }
    }
    if(bases.length == 0){
        $B.$getattr(metaclass, "__init_subclass__")(kls,
            {$nat: "kw", kw:extra_kwargs})
    }
    if(!is_instanciable){
        function nofactory(){
            throw _b_.TypeError.$factory("Can't instantiate abstract class " +
                "interface with abstract methods " +
                Object.keys(abstract_methods).join(", "))}
        kls.$factory = nofactory
    }

    kls.__qualname__ = class_name.replace("$$", "")

    return kls
}

var type = $B.make_class("type",
    function(obj, bases, cl_dict){
        if(arguments.length == 1){
            return obj.__class__ || $B.get_class(obj)
        }
        return type.__new__(type, obj, bases, cl_dict)
    }
)

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

type.__class__ = type

type.__format__ = function(klass, fmt_spec){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}

type.__getattribute__ = function(klass, attr){

    switch(attr) {
        case "__annotations__":
            var mro = [klass].concat(klass.__mro__)
            var res = _b_.dict.$factory()
            for(var i = mro.length - 1; i >= 0; i--){
                var ann = mro[i].__annotations__
                if(ann){
                    for(var key in ann.$string_dict){
                        res.$string_dict[key] = ann.$string_dict[key]
                    }
                }
            }
            return res
        case "__bases__":
            var res = klass.__bases__ || _b_.tuple.$factory()
            res.__class__ = _b_.tuple
            if(res.length == 0){
                res.push(_b_.object)
            }
            return res
        case "__class__":
            return klass.__class__
        case "__doc__":
            return klass.__doc__ || _b_.None
        case "__setattr__":
            if(klass["__setattr__"] !== undefined){
                var func = klass["__setattr__"]
            }else{
                var func = function(obj, key, value){
                    obj[key] = value
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
    var $test = false //attr=="__name__" //&& klass.__name__ == "Point"
    if($test){
        console.log("attr", attr, "of", klass, res)
    }
    if(res === undefined && klass.__slots__ &&
            klass.__slots__.indexOf(attr) > -1){
        return member_descriptor.$factory(attr, klass)
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
            var meta = klass.__class__,
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
                    var meta_method = function(){
                        return res(klass, ...arguments)
                    }
                    meta_method.__class__ = $B.method
                    meta_method.$infos = {
                        __self__: klass,
                        __func__: res,
                        __name__: attr,
                        __qualname__: klass.$infos.__name__ + "." + attr,
                        __module__: res.$infos ? res.$infos.__module__ : ""
                    }
                    return meta_method
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
    }

    if(res !== undefined){
        if($test){console.log("res", res)}
        // If the attribute is a property, return the result of fget()
        if(res.__class__ === _b_.property){
            return res //.fget(klass)
        }
        if(res.__get__){
            if(res.__class__ === method){
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
        }
        if(typeof res == "function"){
            // method
            if(res.$infos === undefined){
                console.log("warning: no attribute $infos for", res)
            }
            if($test){console.log("res is function", res)}

            if(attr == "__new__"){res.$type = "staticmethod"}
            if(attr == "__class_getitem__" && res.__class__ !== $B.method){
                res = _b_.classmethod.$factory(res)
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

type.__init__ = function(){
    // Returns nothing
}

type.__init_subclass__ = function(cls, kwargs){
    // Default implementation only checks that no keyword arguments were passed
    var $ = $B.args("__init_subclass__", 1, {cls: null}, ["cls"],
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
    }
}


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
        __bases__ : bases,
        __dict__ : cl_dict,
        $infos:{
            __name__: name.replace("$$", "")
        },
        $is_class: true,
        $has_setattr: cl_dict.$has_setattr
    }

    // set class attributes for faster lookups
    var items = $B.$dict_items(cl_dict)
    for(var i = 0; i < items.length; i++){
        var key = $B.to_alias(items[i][0]),
            v = items[i][1]
        class_dict[key] = v
    }

    class_dict.__mro__ = type.mro(class_dict)
    return class_dict
}

type.__repr__ = type.__str__ = function(kls){
    if(kls.$infos === undefined){
        console.log("no $infos", kls)
    }
    var qualname = kls.$infos.__name__
    if(kls.$infos.__module__ != "builtins"){
        qualname = kls.$infos.__module__ + "." + qualname
    }
    return "<class '" + qualname + "'>"
}

type.__prepare__ = function(){
    return _b_.dict.$factory()
}

type.__qualname__ = {
    __get__: function(self){
        return self.$infos.__qualname__ || self.$infos.__name__
    },
    __set__: function(self, value){
        self.$infos.__qualname__ = value
    }
}

type.mro = function(cls){
    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    var bases = cls.__bases__,
        seqs = [],
        pos1 = 0
    for(var i = 0; i < bases.length; i++){
        // we can't simply push bases[i].__mro__
        // because it would be modified in the algorithm
        if(bases[i] === _b_.str){bases[i] = $B.StringSubclass}
        else if(bases[i] === _b_.float){bases[i] = $B.FloatSubclass}
        else if(bases[i] === _b_.list){
            for(var attr in _b_.list){
                if(attr == "$factory"){continue}
                if(cls[attr] === undefined){
                    cls[attr] = _b_.list[attr]
                }
            }
            cls.$native = true
        }
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
                    __name__: bases[i].$infos.__name__
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

var wrapper_descriptor = $B.make_class("wrapper_descriptor")

$B.set_func_names(wrapper_descriptor, "builtins")

type.__call__.__class__ = wrapper_descriptor

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
        call_func,
        factory
    if(metaclass === _b_.type && (!klass.__bases__ || klass.__bases__.length == 0)){
        if(klass.hasOwnProperty("__new__")){
            if(klass.hasOwnProperty("__init__")){
                factory = function(){
                    var args = []
                    for(var i = 0; i < arguments.length; i++){args.push(arguments[i])}
                    var obj = klass.__new__.apply(null, [klass].concat(args))
                    klass.__init__.apply(null, [obj].concat(args))
                    return obj
                }
            }else{
                factory = function(){
                    var args = [klass]
                    for(var i = 0; i < arguments.length; i++){args.push(arguments[i])}
                    return klass.__new__.apply(null, args)
                }
            }
        }else if(klass.hasOwnProperty("__init__")){
            factory = function(){
                var obj = {
                    __class__: klass,
                    __dict__: _b_.dict.$factory()
                }
                var args = [obj]
                for(var i = 0; i < arguments.length; i++){args.push(arguments[i])}
                klass.__init__.apply(null, args)
                return obj
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
                return {__class__: klass, __dict__:_b_.dict.$factory()}
            }
        }
    }else{
        call_func = _b_.type.__getattribute__(metaclass, "__call__")
        var factory = function(){
            var args = [klass]
            for(var i = 0; i < arguments.length; i++){args.push(arguments[i])}
            return call_func.apply(null, args)
        }
    }
    factory.__class__ = $B.Function
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

member_descriptor.__str__ = member_descriptor.__repr__ = function(self){
    return "<member '" + self.attr + "' of '" + self.cls.$infos.__name__ +
        "' objects>"
}

$B.set_func_names(member_descriptor, "builtins")

// used as the factory for method objects

var method = $B.method = $B.make_class("method")

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
    throw _b_.AttributeError.$factory("'method' object has no attribute '" +
        key + "'")
}

$B.set_func_names(method, "builtins")

method_descriptor = $B.method_descriptor =
    $B.make_class("method_descriptor")

classmethod_descriptor = $B.classmethod_descriptor =
    $B.make_class("classmethod_descriptor")

// this could not be done before $type and $factory are defined
_b_.object.__class__ = type

})(__BRYTHON__)
