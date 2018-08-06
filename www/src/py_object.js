__BRYTHON__.builtins.object = (function($B){

var _b_ = $B.builtins

// class object for the built-in class 'object'
var object = {
    //__class__:$type, : not here, added in py_type.js after $type is defined
    // __bases__ : set to an empty tuple in py_list.js after tuple is defined
    __name__: "object",
    $is_class: true,
    $native: true
}

// Name of special methods : if they are not found as attributes, try
// the "reflected" attribute on the argument
// For instance, for "getattr(x,'__mul__')", if object x has no attribute
// "__mul__", try a function using the attribute "__rmul__" of its
// first argument

var opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]
var opsigns = ["+", "-", "*", "/", "//", "%", "**", "<<", ">>", "&", "^", "|"]

object.__delattr__ = function(self, attr){
    _b_.getattr(self, attr) // raises AttributeError if necessary
    delete self[attr]
    return _b_.None
}

object.__dir__ = function(self) {
    var objects
    if(self.$is_class){
        objects = [self].concat(self.__mro__)
    }else{
        var klass = self.__class__ || $B.get_class(self)
        objects = [self, klass].concat(klass.__mro__)
    }

    var res = []
    for(var i = 0, len = objects.length; i < len; i++){
        for(var attr in objects[i]){
            if(attr == "toString"){console.log(attr, objects[i][attr])}
            if(attr.charAt(0) == "$") {
                // exclude internal attributes set by Brython
                continue
            }
            if(! isNaN(parseInt(attr.charAt(0)))){
                // Exclude numerical attributes
                // '0', '1' are in attributes of string 'ab'
                continue
            }
            if(attr == "__mro__"){continue}
            res.push(attr)
        }
    }

    // add object's own attributes
    for(var attr in self){
        if(attr.substr(0, 2) == "$$"){res.push(attr.substr(2))}
        else if(attr.charAt(0) != "$"){res.push(attr)}
    }
    res = _b_.list.$factory(_b_.set.$factory(res))
    _b_.list.sort(res)
    return res
}

object.__eq__ = function(self, other){
    // equality test defaults to identity of objects
    //test_issue_1393
    var _class = $B.get_class(self)
    if(_class.$native || _class.__name__ == "function"){
       var _class1 = $B.get_class(other)
       if(!_class1.$native && _class1.__name__ != "function"){
           return $B.rich_comp("__eq__", other, self)
       }
    }
    return self === other
}

object.__format__ = function(){
    var $ = $B.args("__format__", 2, {self: null, spec: null},
        ["self", "spec"], arguments, {}, null, null)
    if($.spec !== ""){
        throw _b_.TypeError.$factory(
            "non-empty format string passed to object.__format__")}
    return _b_.getattr($.self, "__str__")()
}

object.__ge__ = function(){return _b_.NotImplemented}

object.__getattribute__ = function(obj, attr){

    var klass = obj.__class__ || $B.get_class(obj)

    var $test = false //attr == "mytest"
    if($test){console.log("attr", attr, "de", obj, "klass", klass)}
    if(attr === "__class__"){
        return klass
    }
    var res = obj[attr]

    if(res === undefined){
        // search in classes hierarchy, following method resolution order
        function check(obj, kl, attr){
            var v = kl[attr]
            if(v !== undefined){
                return v
            }
        }

        res = check(obj, klass, attr)
        if(res === undefined){
            var mro = klass.__mro__
            for(var i = 0, len = mro.length; i < len; i++){
                res = check(obj, mro[i], attr)
                if(res !== undefined){break}
            }
        }

    }else{
        if(res.__set__ === undefined){
            // For non-data descriptors, the attribute found in object
            // dictionary takes precedence
            return res
        }
    }

    if(res !== undefined){
        if($test){console.log(res)}
        if(res.__class__ === _b_.property){
            return res.__get__(res, obj, klass)
        }
        if(res.__class__ === $B.method){
            if($test){console.log("res is method")}
            if(res.__get__ === undefined){console.log("bizarre", obj, attr, res)}
            return res.__get__(obj, klass)
        }

        var get = res.__get__
        if(get === undefined && res.__class__){
            var get = res.__class__.__get__
            for(var i = 0; i < res.__class__.__mro__.length &&
                    get === undefined; i++){
                get = res.__class__.__mro__[i].__get__
            }
        }
        if($test){console.log("get", get)}
        var __get__ = get === undefined ? null :
            _b_.getattr(res, "__get__", null)

        // For descriptors, attribute resolution is done by applying __get__
        if(__get__ !== null){
            try{return __get__.apply(null, [obj, klass])}
            catch(err){
                console.log('error in get.apply', err)
                console.log("get attr", attr, "of", obj)
                console.log(__get__ + '')
                throw err
            }
        }

        if(typeof res == "object"){
            if(__get__ && (typeof __get__ == "function")){
                get_func = function(x, y){
                    return __get__.apply(x, [y, klass.$factory])
                }
            }
        }

        if(__get__ === null && (typeof res == "function")){
            __get__ = function(x){return x}
        }
        if(__get__ !== null){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            if(attr == "__new__"){res.$type = "staticmethod"}
            var res1 = __get__.apply(null, [res, obj, klass])
            if($test){console.log("res", res, "res1", res1)}

            if(typeof res1 == "function"){
                // If attribute is a class then return it unchanged
                //
                // Example :
                // ===============
                // class A:
                //    def __init__(self,x):
                //        self.x = x
                //
                // class B:
                //    foo = A
                //    def __init__(self):
                //        self.info = self.foo(18)
                //
                // B()
                // ===============
                // In class B, when we call self.foo(18), self.foo is the
                // class A, its method __init__ must be called without B's
                // self as first argument

                // Same thing if the attribute is a method of an instance
                // =================
                // class myRepr:
                //     def repr(self, a):
                //         return a
                //
                // class myclass:
                //     _repr = myRepr()
                //     repr = _repr.repr
                //
                //     def myfunc(self):
                //         return self.repr('test')
                // =================
                // In function myfunc, self.repr is an instance of MyRepr,
                // it must be used as is, not transformed into a method

                if(res1.__class__ === $B.method){
                    return res
                }

                // instance method object
                if(res.$type == "staticmethod"){return res}
                else{
                    var self = res.__class__ === $B.method ? klass : obj
                    function method(){
                        var args = [self]
                        for(var i = 0; i < arguments.length; i++){
                            args.push(arguments[i])
                        }
                        if($test){console.log("inside method", res, args)}
                        var result = res.apply(null, args)
                        if($test){console.log("result", result)}
                        return result
                    }
                    method.__class__ = $B.method
                    method.__get__ = function(obj, cls){
                        var clmethod = function(){
                            return res(cls, ...arguments)
                        }
                        clmethod.__class__ = $B.method
                        clmethod.$infos = {
                            __self__: cls,
                            __func__: res,
                            __name__: res.$infos.__name__,
                            __qualname__: cls.__name__ + "." + res.$infos.__name__
                        }
                        return clmethod
                    }
                    method.__get__.__class__ = $B.method_wrapper
                    method.__get__.$infos = res.$infos
                    method.$infos = {
                        __self__: self,
                        __func__: res,
                        __name__: attr,
                        __qualname__: klass.__name__ + "." + attr
                    }
                    if($test){console.log("return method", method)}
                    return method
                }
            }else{
                // result of __get__ is not a function
                return res1
            }
        }
        // attribute is not a descriptor : return it unchanged
        return res
    }else{
        // search __getattr__
        var _ga = obj["__getattr__"]
        if(_ga === undefined){
            _ga = klass["__getattr__"]
            if(_ga === undefined){
                var mro = klass.__mro__
                for(var i = 0, len = mro.length; i < len; i++){
                    _ga = mro[i]["__getattr__"]
                    if(_ga !== undefined){
                        break
                    }
                }
            }
        }
        if(_ga !== undefined){
            try{return _ga(obj, attr)}
            catch(err){}
        }
        // for special methods such as __mul__, look for __rmul__ on operand
        if(attr.substr(0,2) == "__" && attr.substr(attr.length - 2) == "__"){
            var attr1 = attr.substr(2, attr.length - 4) // stripped of __
            var rank = opnames.indexOf(attr1)
            if(rank > -1){
                var rop = "__r" + opnames[rank] + "__" // name of reflected operator
                var func = function(){
                    try{
                        // Operands must be of different types
                        if($B.get_class(arguments[0]) === klass){
                            throw Error('')
                        }
                        return _b_.getattr(arguments[0], rop)(obj)
                    }catch(err){
                        var msg = "unsupported operand types for " +
                            opsigns[rank] + ": '" + klass.__name__ +
                            "' and '" + $B.get_class(arguments[0]).__name__ +
                            "'"
                        throw _b_.TypeError.$factory(msg)
                    }
                }
                func.$infos = {__name__ : klass.__name__ + "." + attr}
                return func
            }
        }
    }
}

object.__gt__ = function(){return _b_.NotImplemented}

object.__hash__ = function (self) {
    var hash = self.__hashvalue__
    if(hash !== undefined){return hash}
    return self.__hashvalue__ = $B.$py_next_hash--
}

object.__init__ = function(){
    if(arguments.length == 0){
        throw _b_.TypeError.$factory("descriptor '__init__' of 'object' " +
            "object needs an argument")
    }
    // object.__init__ does nothing else
    return _b_.None
}

object.__le__ = function(){return _b_.NotImplemented}

object.__lt__ = function(){return _b_.NotImplemented}

object.__mro__ = []

object.__new__ = function(cls, ...args){
    if(cls === undefined){
        throw _b_.TypeError.$factory("object.__new__(): not enough arguments")
    }
    var init_func = $B.$getattr(cls, "__init__")
    if(init_func === object.__init__){
        if(args.length > 0){
            throw _b_.TypeError.$factory("object() takes no parameters")
        }
    }
    return {__class__ : cls}
}

object.__ne__ = function(self, other){
    return ! $B.rich_comp("__eq__", self, other)
}

object.__reduce__ = function(self){
    function _reconstructor(){
        console.log("reconstructor args", arguments)
        args = []
        var cls = arguments[0],
            obj = $B.$call(cls).apply(null, args)

        return obj
    }
    var res = [_reconstructor]
    res.push(_b_.tuple.$factory([self.__class__].
        concat(self.__class__.__mro__)))
    var d = _b_.dict.$factory()
    for(var attr in self){
        d.$string_dict[attr] = self[attr]
    }
    res.push(d)
    console.log('reduce', res)
    return _b_.tuple.$factory(res)
}

object.__repr__ = function(self){
    if(self === object) {return "<class 'object'>"}
    if(self.__class__ === _b_.type) {
        return "<class '" + self.__name__ + "'>"
    }
    if(self.__class__.__module__ !== undefined &&
            self.__class__.__module__ !== "builtins"){
        return "<" + self.__class__.__module__ + "." +
            self.__class__.__name__ + " object>"
    }else{
        return "<" + self.__class__.__name__ + " object>"
    }
}

object.__setattr__ = function(self, attr, val){
    if(val === undefined){
        // setting an attribute to 'object' type is not allowed
        throw _b_.TypeError.$factory(
            "can't set attributes of built-in/extension type 'object'")
    }else if(self.__class__ === object){
        // setting an attribute to object() is not allowed
        if(object[attr] === undefined){
            throw _b_.AttributeError.$factory(
                "'object' object has no attribute '" + attr + "'")
        }else{
            throw _b_.AttributeError.$factory(
                "'object' object attribute '" + attr + "' is read-only")
        }
    }
    if($B.aliased_names[attr]){attr = "$$"+attr}
    self[attr] = val
    return _b_.None
}
object.__setattr__.__get__ = function(obj){
    return function(attr, val){
        object.__setattr__(obj, attr, val)
    }
}

object.__setattr__.__str__ = function(){return "method object.setattr"}

object.__str__ = function(self){
    var repr_func = $B.$getattr(self, "__repr__")
    return $B.$call(repr_func)()
}

object.__subclasshook__ = function(){return _b_.NotImplemented}

// constructor of the built-in class 'object'
object.$factory = function(){
    var res = {__class__:object},
        args = [res].concat(Array.prototype.slice.call(arguments))
    object.__init__.apply(null, args)
    return res
}

$B.set_func_names(object, "builtins")

$B.make_class = function(name, factory){
    // Buils a basic class object

    var A = {
        __class__: _b_.type,
        __mro__: [object],
        __name__: name,
        $is_class: true
    }

    A.$factory = factory

    return A
}

return object

})(__BRYTHON__)
