(function($B){

var _b_ = $B.builtins

var method_wrapper = $B.method_wrapper

/* method_wrapper start */
$B.method_wrapper.tp_richcompare = function(self){

}

$B.method_wrapper.tp_repr = function(self){
    var name = self.d_name
    var class_name = self.self.ob_type.tp_name
    return `<method-wrapper '${name}' of ${class_name} object>`
}

$B.method_wrapper.tp_hash = function(self){

}

$B.method_wrapper.tp_call = function(self, ...args){
    return self.wrapped(self.self, ...args)
}

var method_wrapper_funcs = $B.method_wrapper.tp_funcs = {}

method_wrapper_funcs.__name___get = function(self){
    return self.self.__name__
}

method_wrapper_funcs.__name___set = function(self){

}

method_wrapper_funcs.__objclass___get = function(self){
    return self.self.__objclass__
}

method_wrapper_funcs.__objclass___set = function(self){

}

method_wrapper_funcs.__qualname___get = function(self){

}

method_wrapper_funcs.__qualname___set = function(self){

}

method_wrapper_funcs.__reduce__ = function(self){

}

method_wrapper_funcs.__text_signature___get = function(self){

}

method_wrapper_funcs.__text_signature___set = function(self){

}

$B.method_wrapper.tp_methods = ["__reduce__"]

$B.method_wrapper.tp_members = [
    ["__self__", $B.TYPES.OBJECT, "self", 1]
]

$B.method_wrapper.tp_getset = ["__objclass__", "__name__", "__qualname__", "__text_signature__"]

$B.set_func_names($B.method_wrapper, 'builtins')
/* method_wrapper end */


/* member_descriptor start */

$B.member_descriptor.tp_descr_set = function(self, obj, value){
    if(self.d_member.flags != 0){
        $B.RAISE(_b_.AttributeError, "readonly attribute")
    }
    var attr = self.d_member.attr
    if(value === $B.NULL){
        delete obj[attr]
        return
    }
    obj[attr] = value
}

$B.member_descriptor.tp_repr = function(self){
    return "<member '" + self.d_name + "' of '" +
        self.d_type.tp_name + "' objects>"
}

$B.member_descriptor.tp_descr_get = function(self, obj, kls){
    if(obj === $B.NULL){
        return self
    }
    var attr = self.d_member.attr
    if(! obj.hasOwnProperty(attr)){
        throw $B.attr_error(self.d_member.name, obj)
    }
    return obj[attr]
}

var member_descriptor_funcs = $B.member_descriptor.tp_funcs = {}

member_descriptor_funcs.__qualname___get = function(self){
    return self.name
}

member_descriptor_funcs.__qualname___set = _b_.None

member_descriptor_funcs.__reduce__ = function(self){

}

$B.member_descriptor.tp_methods = ["__reduce__"]

$B.member_descriptor.tp_members = [
    ["__objclass__", $B.TYPES.OBJECT, "d_type", 1],
    ["__name__", $B.TYPES.OBJECT, "d_name", 1]
]

$B.member_descriptor.tp_getset = ["__qualname__"]

/* member_descriptor end */

$B.set_func_names($B.member_descriptor, "builtins")


var method = $B.method
method.$factory = function(func, obj){
    return {
        ob_type: $B.method,
        im_func: func,
        im_self: obj,
        dict: $B.empty_dict()
    }
}

method.tp_setattro = function(self, key){
    // Attempting to set an attribute on a method results in an AttributeError
    // being raised.
    if(key == "__class__"){
        $B.RAISE(_b_.TypeError, "__class__ assignment only supported " +
            "for heap types or ModuleType subclasses")
    }
    throw $B.attr_error(key, self)
}

/* method */
$B.method.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, method)){
        return _b_.NotImplemented
    }
    var res
    switch(op){
        case '__eq__':
            res = (self.im_self === other.im_self &&
                self.im_func === other.im_func)
            break
        case '__ne__':
            res = (self.im_self !== other.im_self ||
                self.im_func !== other.im_func)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

$B.method.tp_repr = function(self){
    var name = $B.$getattr(self.im_func, '__qualname__')
    return "<bound method " + name +
       " of " + _b_.str.$factory(self.im_self) + ">"
}

$B.method.tp_hash = function(self){

}

$B.method.tp_call = function(self, ...args){
    return $B.$call(self.im_func, self.im_self, ...args)
}

$B.method.tp_getattro = function(self, attr){
    var tp = $B.get_class(self)
    var descr = $B.search_in_mro(tp, attr, $B.NULL)
    if(descr !== $B.NULL){
        var getter = $B.search_slot($B.get_class(descr), 'tp_descr_get', $B.NULL)
        if(getter !== $B.NULL){
            return getter(descr, self, tp)
        }else{
            return descr
        }
    }
    return $B.object_getattribute(self.im_func, attr)
}

$B.method.tp_descr_get = function(self){
    return self
}

$B.method.tp_new = function(cls, args, kw){
    var [func, obj] = args
    return {
        ob_type: cls,
        im_func: func,
        im_self: obj,
        dict: $B.empty_dict()
    }
}

var method_funcs = $B.method.tp_funcs = {}

method_funcs.__reduce__ = function(self){

}

$B.method.functions_or_methods = ["__new__"]

$B.method.tp_methods = ["__reduce__"]

$B.method.tp_members = [
    ["__func__", $B.TYPES.OBJECT, "im_func", 1],
    ["__self__", $B.TYPES.OBJECT, "im_self", 1]
]

$B.set_func_names(method, "builtins")


/* method_descriptor start */
$B.method_descriptor.tp_repr = function(self){
    var name = self.d_name
    var class_name = self.d_type.tp_name
    return `<method '${name}' of '${class_name}' objects>`
}

$B.method_descriptor.tp_call = function(self, ...args){
    if(args.length == 0){
        var name = self.d_name
        var class_name = self.d_type.tp_name
        $B.RAISE(_b_.TypeError,
            `unbound method ${class_name}.${name} needs an argument`
        )
    }
    try{
        var res = self.method(...args)
        return res
    }catch(err){
        throw err
    }
}

$B.method_descriptor.tp_descr_get = function(self, obj, klass){
    if(obj === $B.NULL){
        return self
    }
    var f = self.method.bind(null, obj)
    f.ob_type = $B.builtin_method
    f.$infos = self.$infos
    f.ml = {ml_name: self.d_name}
    f.m_self = obj
    return f
}

var method_descriptor_funcs = $B.method_descriptor.tp_funcs = {}

method_descriptor_funcs.__qualname___get = function(self){
    return self.d_name
}

method_descriptor_funcs.__qualname___set = function(self, value){
    self.name = value
}

method_descriptor_funcs.__reduce__ = function(self){

}

method_descriptor_funcs.__text_signature___get = function(self){

}

method_descriptor_funcs.__text_signature___set = function(self){

}

$B.method_descriptor.tp_methods = ["__reduce__"]

$B.method_descriptor.tp_members = [
    ["__objclass__", $B.TYPES.OBJECT, "d_type", 1],
    ["__name__", $B.TYPES.OBJECT, "d_name", 1]
]

$B.method_descriptor.tp_getset = ["__qualname__", "__text_signature__"]

/* method_descriptor end */

$B.set_func_names($B.method_descriptor, 'builtins')


/* classmethod_descriptor start */
$B.classmethod_descriptor.tp_repr = function(self){
    return `<method '${self.d_name}' of '${$B.get_name(self.d_type)}' objects>`
}

$B.classmethod_descriptor.tp_call = function(self, ...args){
    return self.d_method(self.d_type, ...args)
}

$B.classmethod_descriptor.tp_descr_get = function(self, obj, type){
    if(type === undefined){
        type = $B.get_class(obj)
    }
    if(! $B.is_type(type)){
        $B.RAISE(_b_.TypeError,
            `descriptor '${self.d_name}' for type '${$B.get_name(self.d_type)}' ` +
             `needs a type, not a '${$B.class_name(type)}' as arg 2`)
    }
    if(! _b_.issubclass(type, self.d_type)) {
        $B.RAISE(_b_.TypeError,
                     "descriptor '%V' requires a subtype of '%.100s' " +
                     "but received '%.100s'",
                     descr_name(descr),
                     PyDescr_TYPE(descr).tp_name,
                     type.tp_name)
    }
    var cls = $B.NULL
    if (self.d_method.ml_flags & $B.METH_METHOD) {
        cls = descr.d_common.d_type;
    }
    var f = function(...args){
        return self.d_method.call(null, self.d_type, ...args)
    }
    Object.assign(f,
        {
            ob_type: $B.builtin_function_or_method,
            ml: {ml_name: self.d_name},
            m_self: self.d_type
        }
    )
    return f
}

var classmethod_descriptor_funcs = $B.classmethod_descriptor.tp_funcs = {}

classmethod_descriptor_funcs.__doc___get = function(self){

}

classmethod_descriptor_funcs.__doc___set = function(self){

}

classmethod_descriptor_funcs.__qualname___get = function(self){

}

classmethod_descriptor_funcs.__qualname___set = function(self){

}

classmethod_descriptor_funcs.__text_signature___get = function(self){

}

classmethod_descriptor_funcs.__text_signature___set = function(self){

}

$B.classmethod_descriptor.tp_members = [
    ["__objclass__", $B.TYPES.OBJECT, "d_type", 1],
    ["__name__", $B.TYPES.OBJECT, "d_name", 1]
]

$B.classmethod_descriptor.tp_getset = ["__doc__", "__qualname__", "__text_signature__"]

/* classmethod_descriptor end */


$B.set_func_names($B.classmethod_descriptor, 'builtins')

$B.getset_descriptor.$factory = function(klass, attr, getset){
    var [getter, setter] = getset
    var res = {
        ob_type: $B.getset_descriptor,
        __doc__: _b_.None,
        d_type: klass,
        d_name: attr,
        getter,
        setter
    }
    return res
}

/* getset_descriptor start */
$B.getset_descriptor.tp_descr_set = function(self, obj, value){
    if(self.setter === _b_.None){
        $B.RAISE_ATTRIBUTE_ERROR(
            `attribute '${self.d_name}' of '${self.d_type.tp_name}' objects is not writable`,
            self,
            self.d_name)
    }
    return self.setter(obj, value)
}

$B.getset_descriptor.tp_repr = function(self){
    return `<attribute '${self.d_name}' of '${$B.get_name(self.d_type)}' objects>`
}

$B.getset_descriptor.tp_descr_get = function(self, obj){
    if(obj === $B.NULL){
        return self
    }
    if(! $B.get_mro($B.get_class(obj)).includes(self.d_type)){
        $B.RAISE(_b_.TypeError, `descriptor '${self.d_name}' for ` +
            `'${$B.get_name(self.d_type)}' objects doesn't apply to a ` +
            `'${$B.class_name(obj)}' object`)
    }
    return self.getter(obj)
}

var getset_descriptor_funcs = $B.getset_descriptor.tp_funcs = {}

getset_descriptor_funcs.__qualname___get = function(self){
    return self.d_name
}

getset_descriptor_funcs.__qualname___set = function(self, value){
    self.d_name = value
}

$B.getset_descriptor.tp_members = [
    ["__objclass__", $B.TYPES.OBJECT, "d_type", 1],
    ["__name__", $B.TYPES.OBJECT, "d_name", 1]
]

$B.getset_descriptor.tp_getset = ["__qualname__"]

/* getset_descriptor end */


$B.set_func_names($B.getset_descriptor, "builtins")




var wrapper_descriptor = $B.wrapper_descriptor

wrapper_descriptor.$factory = function(cls, attr, f){
    /*
    if(f === undefined){
        console.log('wrapper descriptor')
        console.log(Error().stack)
    }
    f.ml = {
        ml_name: attr
    }
    f.ob_type = wrapper_descriptor
    f.__objclass__ = cls
    */
    return {
        ob_type: wrapper_descriptor,
        d_type: cls,
        d_name: attr,
        wrapped: f
    }
}

/* wrapper_descriptor */
$B.wrapper_descriptor.tp_repr = function(self){
    var name = self.d_name
    var class_name = self.d_type.tp_name
    return `<slot wrapper '${name}' of '${class_name}' objects>`
}

$B.wrapper_descriptor.tp_call = function(descr, ...args){
    var no_args = args.length == 0 || (args.length == 1 && args[0].$kw)

    if(no_args){
        $B.RAISE(_b_.TypeError,
            `descriptor '${descr.d_name}' of '${descr.d_type.tp_name}' ` +
            `object needs an argument`
        )
    }
    var self = args[0]
    if(! _b_.issubclass($B.get_class(self), descr.d_type)){
        $B.RAISE(_b_.TypeError,
            `descriptor '${descr.d_name}' requires a ` +
            `'${descr.d_type.tp_name}' object ` +
            `but received a '${$B.class_name(self)}'`
        )
    }
    return descr.wrapped(...args)
}

$B.wrapper_descriptor.tp_descr_get = function(self, obj, type){
    if(obj === $B.NULL){
        return self
    }
    var res = {
        ob_type: $B.method_wrapper,
        d_name: self.d_name,
        self: obj,
        wrapped: self.wrapped
    }
    return res
}

var wrapper_descriptor_funcs = $B.wrapper_descriptor.tp_funcs = {}

wrapper_descriptor_funcs.__qualname___get = function(self){
    return self.d_name
}

wrapper_descriptor_funcs.__qualname___set = function(self, value){
    self.d_name = value
}

wrapper_descriptor_funcs.__reduce__ = function(self){

}

wrapper_descriptor_funcs.__text_signature___get = function(self){
    return '(self, /, *args, **kwargs)'
}

wrapper_descriptor_funcs.__text_signature___set = function(self){

}

$B.wrapper_descriptor.tp_methods = ["__reduce__"]

$B.wrapper_descriptor.tp_members = [
    ["__objclass__", $B.TYPES.OBJECT, "d_type", 1],
    ["__name__", $B.TYPES.OBJECT, "d_name", 1]
]

$B.wrapper_descriptor.tp_getset = ["__qualname__", "__text_signature__"]

$B.set_func_names(wrapper_descriptor, "builtins")

/* wrapper_descriptor end */



})(__BRYTHON__)