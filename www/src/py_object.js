"use strict";
(function($B){

var _b_ = $B.builtins

// class object for the built-in class 'object'
var object = {
    //__class__:$type, : not here, added in py_type.js after $type is defined
    // __bases__ : set to an empty tuple in py_list.js after tuple is defined
    __name__: 'object',
    __qualname__: 'object',
    $is_class: true,
    $native: true
}

object.__delattr__ = function(self, attr){
    if(self.__dict__ && $B.$isinstance(self.__dict__, _b_.dict) &&
            _b_.dict.$contains_string(self.__dict__, attr)){
        _b_.dict.$delete_string(self.__dict__, attr)
        delete self[attr]
        return _b_.None
    }else if(self.__dict__ === undefined && self[attr] !== undefined){
        delete self[attr]
        return _b_.None
    }else{
        // If attr is a descriptor and has a __delete__ method, use it
        var klass = $B.get_class(self)
        var kl_attr = $B.search_in_mro(klass, attr)
        if(_b_.hasattr(kl_attr, '__get__') && _b_.hasattr(kl_attr, '__delete__')){
            return $B.$getattr(kl_attr, '__delete__')(self)
        }
    }
    throw $B.attr_error(attr, self)
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
        for(let attr in objects[i]){
            if(attr.charAt(0) == "$") {
                if(attr.charAt(1) == "$"){
                    // aliased name
                    res.push(attr.substr(2))
                }
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
    if(self.__dict__){
        for(let attr of $B.make_js_iterator(self.__dict__)){
            if(attr.charAt(0) != "$"){
                res.push(attr)
            }
        }
    }
    res = _b_.list.$factory(_b_.set.$factory(res))
    _b_.list.sort(res)
    return res
}

object.__eq__ = function(self, other){
    // equality test defaults to identity of objects
    //test_issue_1393
    return self === other ?  true : _b_.NotImplemented
}

object.__format__ = function(){
    var $ = $B.args("__format__", 2, {self: null, spec: null},
        ["self", "spec"], arguments, {}, null, null)
    if($.spec !== ""){
        throw _b_.TypeError.$factory(
            "non-empty format string passed to object.__format__")}
    return _b_.getattr($.self, "__str__")()
}

object.__ge__ = function(){
    return _b_.NotImplemented
}

$B.nb_from_dict = 0

object.__getattribute__ = function(obj, attr){

    var klass = obj.__class__ || $B.get_class(obj),
        is_own_class_instance_method = false

    var $test = false // attr == 'abc' // false // attr == "__args__"
    if($test){
        console.log("object.__getattribute__, attr", attr, "de", obj, "klass", klass)
        console.log('obj.__dict__', obj.__dict__)
    }
    if(attr === "__class__"){
        return klass
    }

    if(obj.$is_class && attr == '__bases__'){
        throw $B.attr_error(attr, obj)
    }

    var res = obj[attr]

    if($test){
        console.log('obj[attr]', obj[attr])
    }
    if(Array.isArray(obj) && Array.prototype[attr] !== undefined){
        // Special case for list subclasses. Cf. issue 1081
        res = undefined
    }

    if(res === undefined && obj.__dict__){
        var dict = obj.__dict__
        if($test){
            console.log('obj.__dict__', obj.__dict__)
        }
        if(dict.__class__ === $B.getset_descriptor){
            return dict.cls[attr]
        }
        var in_dict = _b_.dict.$get_string(dict, attr)
        if(in_dict !== _b_.dict.$missing){
            return in_dict
        }
    }

    if(res === undefined){
        // search in classes hierarchy, following method resolution order
        function check(obj, kl, attr){
            var v
            if(kl.__dict__){
                v = _b_.dict.$get_string(kl.__dict__, attr)
                if(v !== _b_.dict.$missing){
                    return v
                }
            }
            v = kl[attr]
            if(v !== undefined){
                if($test){
                    console.log('check, kl', kl, 'attr', attr, 'v', v)
                }
                return v
            }
        }

        res = check(obj, klass, attr)
        if(res === undefined){
            var mro = klass.__mro__
            for(let i = 0, len = mro.length; i < len; i++){
                res = check(obj, mro[i], attr)
                if($test){
                    console.log('in class', mro[i], 'res', res)
                }
                if(res !== undefined){
                    if($test){console.log("found in", mro[i])}
                    break
                }
            }
        }else{
            if($test){
                console.log(attr, 'found in own class')
            }
            if(res.__class__ !== $B.method && res.__get__ === undefined){
                is_own_class_instance_method = true
            }
        }

    }else{
        if(res.__set__ === undefined){
            // For non-data descriptors, the attribute found in object
            // dictionary takes precedence
            return res
        }
    }
    if($test){
        console.log('after search classes', res)
    }
    if(res !== undefined){
        if($test){
            console.log(res)
        }
        if(res.__class__ && _b_.issubclass(res.__class__, _b_.property)){
            return $B.$getattr(res, '__get__')(obj, klass)
        }else if(res.__class__ === _b_.classmethod){
            return _b_.classmethod.__get__(res, obj, klass)
        }
        if(res.__class__ === $B.method){
            if(res.$infos.__self__){
                // Bound method
                return res
            }
            return $B.method.__get__(res)
        }

        var get = res.__get__
        if(get === undefined && res.__class__){
            get = res.__class__.__get__
            for(let i = 0; i < res.__class__.__mro__.length &&
                    get === undefined; i++){
                get = res.__class__.__mro__[i].__get__
            }
        }
        if($test){console.log("get", get)}
        var __get__ = get === undefined ? null :
            $B.$getattr(res, "__get__", null)

        if($test){console.log("__get__", __get__)}
        // For descriptors, attribute resolution is done by applying __get__
        if(__get__ !== null){
            if($test){
                console.log('apply __get__', [obj, klass])
            }
            try{
                return __get__.apply(null, [obj, klass])
            }catch(err){
                if($B.get_option('debug') > 2){
                    console.log('error in get.apply', err)
                    console.log("get attr", attr, "of", obj)
                    console.log('res', res)
                    console.log('__get__', __get__)
                    console.log(__get__ + '')
                }
                throw err
            }
        }

        if(__get__ === null && (typeof res == "function")){
            __get__ = function(x){return x}
        }
        if(__get__ !== null){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            // ... and so are builtin functions (is this documented ?)
            if(attr == "__new__" ||
                    res.__class__ === $B.builtin_function_or_method){
                res.$type = "staticmethod"
            }
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
                if(res.$type == "staticmethod"){
                    return res
                }else{
                    var self = res.__class__ === $B.method ? klass : obj,
                        method = function(){
                            var args = [self] // add self as first argument
                            for(var i = 0, len = arguments.length; i < len; i++){
                                args.push(arguments[i])
                            }
                            return res.apply(this, args)
                        }
                    method.__class__ = $B.method
                    method.__get__ = function(obj, cls){
                        var clmethod = res.bind(null, cls)
                        clmethod.__class__ = $B.method
                        clmethod.$infos = {
                            __self__: cls,
                            __func__: res,
                            __name__: res.$infos.__name__,
                            __qualname__: cls.__name__ + "." +
                                res.$infos.__name__
                        }
                        return clmethod
                    }
                    method.__get__.__class__ = $B.method_wrapper
                    method.__get__.$infos = res.$infos
                    method.$infos = {
                        __self__: self,
                        __func__: res,
                        __name__: attr,
                        __qualname__: klass.__qualname__ + "." + attr
                    }
                    if($test){console.log("return method", method)}
                    if(is_own_class_instance_method){
                        obj.$method_cache = obj.$method_cache || {}
                        obj.$method_cache[attr] = [method, res]
                    }
                    return method
                }
            }else{
                // result of __get__ is not a function
                return res1
            }
        }
        // attribute is not a descriptor : return it unchanged
        return res
    }else if(obj.hasOwnProperty && obj.hasOwnProperty(attr) &&
            ! Array.isArray(obj)){
        return $B.Undefined
    }else{
        throw $B.attr_error(attr, obj)
    }
}

object.__gt__ = function(){return _b_.NotImplemented}

object.__hash__ = function(self){
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

object.$new = function(cls){
    return function(){
        var $ = $B.args('__new__', 0, [], [], arguments, {}, 'args', 'kwargs')
        if($.args.length > 0 || _b_.dict.__len__($.kwargs) > 0){
            throw _b_.TypeError.$factory("object() takes no parameters")
        }
        var res = Object.create(null)
        res.__class__ = cls
        res.__dict__ = $B.obj_dict({})
        return res
    }
}

object.$no_new_init = function(cls){
    // Used to create instances of classes with no explicit __new__ and an
    // explicit __init__
    var res = Object.create(null)
    res.__class__ = cls
    res.__dict__ = $B.obj_dict({})
    return res
}

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
    var res = Object.create(null)
    $B.update_obj(res, {
        __class__ : cls,
        __dict__: $B.obj_dict({})
        })
    return res
}

object.__ne__ = function(self, other){
    //return ! $B.rich_comp("__eq__", self, other)
    if(self === other){return false}
    var eq = $B.$getattr(self.__class__ || $B.get_class(self),
        "__eq__", null)
    if(eq !== null){
        var res = $B.$call(eq)(self, other)
        if(res === _b_.NotImplemented){return res}
        return ! $B.$bool(res)
    }
    return _b_.NotImplemented
}

object.__reduce__ = function(self){
    if(! self.__dict__){
        throw _b_.TypeError.$factory(`cannot pickle '${$B.class_name(self)}' object`)
    }
    if($B.imported.copyreg === undefined){
        $B.$import('copyreg')
    }
    var res = [$B.imported.copyreg._reconstructor]
    var D = $B.get_class(self),
        B = object
    for(var klass of D.__mro__){
        if(klass.__module__ == 'builtins'){
            B = klass
            break
        }
    }
    var args = $B.$list([D, B])
    if(B === object){
        args.push(_b_.None)
    }else{
        args.push($B.$call(B)(self))
    }

    res.push($B.fast_tuple(args))
    var d = $B.empty_dict()
    for(var attr of _b_.dict.$keys_string(self.__dict__)){
        _b_.dict.$setitem(d, attr,
            _b_.dict.$getitem_string(self.__dict__, attr))
    }
    res.push(d)
    return _b_.tuple.$factory(res)
}

function getNewArguments(self, klass){
    var newargs_ex = $B.$getattr(self, '__getnewargs_ex__', null)
    if(newargs_ex !== null){
        let newargs = newargs_ex()
        if((! newargs) || newargs.__class__ !== _b_.tuple){
            throw _b_.TypeError.$factory("__getnewargs_ex__ should " +
                `return a tuple, not '${$B.class_name(newargs)}'`)
        }
        if(newargs.length != 2){
            throw _b_.ValueError.$factory("__getnewargs_ex__ should " +
                `return a tuple of length 2, not ${newargs.length}`)
        }
        let args = newargs[0],
            kwargs = newargs[1]
        if((! args) || args.__class__ !== _b_.tuple){
            throw _b_.TypeError.$factory("first item of the tuple returned " +
                `by __getnewargs_ex__ must be a tuple, not '${$B.class_name(args)}'`)
        }
        if((! kwargs) || kwargs.__class__ !== _b_.dict){
            throw  _b_.TypeError.$factory("second item of the tuple returned " +
                `by __getnewargs_ex__ must be a dict, not '${$B.class_name(kwargs)}'`)
        }
        return {args, kwargs}
    }
    let newargs = klass.$getnewargs,
        args
    if(! newargs){
        newargs = $B.$getattr(klass, '__getnewargs__', null)
    }
    if(newargs){
        args = newargs(self)
        if((! args) || args.__class__ !== _b_.tuple){
            throw _b_.TypeError.$factory("__getnewargs__ should " +
                `return a tuple, not '${$B.class_name(args)}'`)
        }
        return {args}
    }
}


object.__reduce_ex__ = function(self, protocol){
    var klass = $B.get_class(self)
    if($B.imported.copyreg === undefined){
        $B.$import('copyreg')
    }
    if(protocol < 2){
        return $B.$call($B.imported.copyreg._reduce_ex)(self, protocol)
    }

    var reduce = $B.$getattr(klass, '__reduce__')

    if(reduce !== object.__reduce__){
        return $B.$call(reduce)(self)
    }
    var res = [$B.imported.copyreg.__newobj__]
    var arg2 = [klass]
    var newargs = getNewArguments(self, klass)
    if(newargs){
        arg2 = arg2.concat(newargs.args)
    }
    res.push($B.fast_tuple(arg2))
    var d = $B.empty_dict(),
        nb = 0
    if(self.__dict__){
        for(var item of _b_.dict.$iter_items(self.__dict__)){
            if(item.key == "__class__" || item.key.startsWith("$")){
                continue
            }
            _b_.dict.$setitem(d, item.key, item.value)
            nb++
        }
    }
    if(nb == 0){
        d = _b_.None
    }
    res.push(d)
    var list_like_iterator = _b_.None
    if($B.$getattr(klass, 'append', null) !== null &&
            $B.$getattr(klass, 'extend', null) !== null){
        list_like_iterator = _b_.iter(self)
    }
    res.push(list_like_iterator)
    var key_value_iterator = _b_.None
    if($B.$isinstance(self, _b_.dict)){
        key_value_iterator = _b_.dict.items(self)
    }
    res.push(key_value_iterator)
    return _b_.tuple.$factory(res)
}

object.__repr__ = function(self){
    if(self === object) {return "<class 'object'>"}
    if(self.__class__ === _b_.type) {
        return "<class '" + self.__name__ + "'>"
    }
    var klass = $B.get_class(self),
        module = klass.__module__
    if(module !== undefined && !module.startsWith("$") &&
            module !== "builtins"){
        return `<${module}.${$B.class_name(self)} object>`
    }else{
        return "<" + $B.class_name(self) + " object>"
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
            throw $B.attr_error(attr, self)
        }else{
            throw _b_.AttributeError.$factory(
                "'object' object attribute '" + attr + "' is read-only")
        }
    }
    if(self.__dict__){
        _b_.dict.$setitem(self.__dict__, attr, val)
    }else{
        // for
        self[attr] = val
    }
    return _b_.None
}
object.__setattr__.__get__ = function(obj){
    return function(attr, val){
        object.__setattr__(obj, attr, val)
    }
}

object.__setattr__.__str__ = function(){return "method object.setattr"}

object.__str__ = function(self){
    if(self === undefined || self.$kw){
        throw _b_.TypeError.$factory("descriptor '__str__' of 'object' " +
            "object needs an argument")
    }
    // Default to __repr__
    var klass = self.__class__ || $B.get_class(self)
    var repr_func = $B.$getattr(klass, "__repr__")
    return $B.$call(repr_func).apply(null, arguments)
}

object.__subclasshook__ = function(){return _b_.NotImplemented}

// constructor of the built-in class 'object'
object.$factory = function(){
    if(arguments.length > 0 ||
            (arguments.length == 1 && arguments[0].$kw &&
                Object.keys(arguments[0].$kw).length > 0)
            ){
        throw _b_.TypeError.$factory('object() takes no arguments')
    }
    var res = {__class__: object},
        args = [res]
    object.__init__.apply(null, args)
    return res
}

$B.set_func_names(object, "builtins")

_b_.object = object

})(__BRYTHON__);

