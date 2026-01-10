(function($B){

var _b_ = $B.builtins

var method_wrapper = $B.method_wrapper

/*
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
*/


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
    console.log('method wrapper __objclass__')
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

method_wrapper_funcs.__self__ = function(self){
    console.log('attribute self', self)
    return self.self
}

method_wrapper_funcs.__text_signature___get = function(self){

}

method_wrapper_funcs.__text_signature___set = function(self){

}

$B.method_wrapper.tp_methods = ["__reduce__"]

$B.method_wrapper.tp_members = ["__self__"]

$B.method_wrapper.tp_getset = ["__objclass__", "__name__", "__qualname__", "__text_signature__"]

$B.set_func_names($B.method_wrapper, 'builtins')
/* method_wrapper end */

$B.member_descriptor.$factory = function(name, cls){
    return {
        ob_type: $B.member_descriptor,
        d_member: {
            ml: {ml_name: name},
            cls
        }
    }
}

/* member_descriptor start */
$B.member_descriptor.tp_descr_set = function(self, kls, value){
    if(value === $B.NULL){
            if(kls.$slot_values === undefined ||
                ! kls.$slot_values.hasOwnProperty(self.attr)){
            $B.RAISE_ATTRIBUTE_ERROR('cannot delete', self, self.attr)
        }
        kls.$slot_values.delete(self.attr)
        return
    }
    if(kls.$slot_values === undefined){
        kls.$slot_values = new Map()
    }
    kls.$slot_values.set(self.attr, value)
}

$B.member_descriptor.tp_repr = function(self){
    return "<member '" + self.d_member.ml.ml_name + "' of '" +
        self.d_member.cls.tp_name + "' objects>"
}

$B.member_descriptor.tp_descr_get = function(self, obj, kls){
    if(obj === _b_.None){
        return self
    }
    return self.d_member.method(obj)
}

var member_descriptor_funcs = $B.member_descriptor.tp_funcs = {}

member_descriptor_funcs.__name__ = function(self){
    return self.attr
}

member_descriptor_funcs.__objclass__ = function(self){

}

member_descriptor_funcs.__qualname___get = function(self){

}

member_descriptor_funcs.__qualname___set = function(self){

}

member_descriptor_funcs.__reduce__ = function(self){

}

$B.member_descriptor.tp_methods = ["__reduce__"]

$B.member_descriptor.tp_members = ["__objclass__", "__name__"]

$B.member_descriptor.tp_getset = ["__qualname__"]

/* member_descriptor end */

$B.set_func_names($B.member_descriptor, "builtins")

// Used for class members, defined in __slots__
var member_descriptor = $B.member_descriptor

/*
member_descriptor.$factory = function(attr, cls){
    return{
        ob_type: member_descriptor,
        cls: cls,
        attr: attr
    }
}
*/


// used as the factory for method objects

$B.objs = []
var method = $B.method
method.$factory = function(func, obj){
    return {
        ob_type: $B.method,
        func,
        obj
    }
    /*
    var f = function(){
        return $B.$call(func, obj, ...arguments)
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
    */
}

/*
method.__eq__ = function(self, other){
    console.log('émthod eq', self, other)
    return self.$infos !== undefined &&
           other.$infos !== undefined &&
           self.$infos.__func__ === other.$infos.__func__ &&
           self.$infos.__self__ === other.$infos.__self__
}

method.__ne__ = function(self, other){
    return ! $B.method.__eq__(self, other)
}
*/

method.__setattr__ = function(self, key){
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
            console.log('eq', self, other)
            res = (self.obj === other.obj && self.func === other.func)
            console.log('res', res)
            break
        case '__ne__':
            res = (self.obj !== other.obj || self.func !== other.func)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

$B.method.tp_repr = function(self){
    console.log('method repr', self, self.func, self.obj)
    console.log('func.$function infos', self.func.$function_infos)
    var name = self.func.$function_infos[$B.func_attrs.__qualname__]
    return "<bound method " + name +
       " of " + _b_.str.$factory(self.obj) + ">"
}

$B.method.tp_hash = function(self){

}

$B.method.tp_call = function(self, ...args){
    if(typeof self.func !== 'function'){
        console.log('not a function', self, self.func)
    }
    return self.func(self.obj, ...args)
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
    return $B.object_getattribute(self.func, attr);
}

$B.method.tp_descr_get = function(self){
    return self
}

$B.method.tp_new = function(cls, func, obj){
    return {
        ob_type: cls,
        func,
        obj
    }
}

var method_funcs = $B.method.tp_funcs = {}

method_funcs.__func__ = function(self){
    return self.func
}

method_funcs.__reduce__ = function(self){

}

method_funcs.__self__ = function(self){
    return self.obj
}

$B.method.functions_or_methods = ["__new__"]

$B.method.tp_methods = ["__reduce__"]

$B.method.tp_members = ["__func__", "__self__"]

$B.set_func_names(method, "builtins")


// method descriptor has attrs method (a function), cls, name
/*
$B.method_descriptor.$factory = function(cls, attr, f){
    f.ob_type = $B.method_descriptor
    f.ml = {
        ml_name: attr
    }
    f.__objclass__ = cls
    return f
}
*/

/* method_descriptor start */
$B.method_descriptor.tp_repr = function(self){
    var name = self.ml.ml_name
    var class_name = self.cls.tp_name
    return `<method '${name}' of '${class_name}' objects>`
}

$B.method_descriptor.tp_call = function(self, ...args){
    try{
        var res = self.method(...args)
        return res
    }catch(err){
        console.log('error in method_descriptor call')
        console.log(err)
        throw err
    }
}

$B.method_descriptor.tp_descr_get = function(self, obj, klass){
    if(obj === _b_.None){
        return self
    }
    var f = self.method.bind(null, obj)
    f.ob_type = $B.builtin_method
    f.$infos = self.$infos
    f.ml = {ml_name: self.ml.ml_name}
    f.m_self = self
    return f
}

var method_descriptor_funcs = $B.method_descriptor.tp_funcs = {}

method_descriptor_funcs.__name__ = function(self){
    return self.name
}

method_descriptor_funcs.__objclass__ = function(self){
    return self.cls
}

method_descriptor_funcs.__qualname___get = function(self){
    return self.name
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

$B.method_descriptor.tp_members = ["__objclass__", "__name__"]

$B.method_descriptor.tp_getset = ["__qualname__", "__text_signature__"]

/* method_descriptor end */

$B.set_func_names($B.method_descriptor, 'builtins')


/* classmethod_descriptor start */
$B.classmethod_descriptor.tp_repr = function(self){
    console.log(self)
    //var name = self.$function_infos[$B.func_attrs.__name__]
    return `<method '${self.d_name}' of '${$B.get_name(self.d_type)}' objects>`
}

$B.classmethod_descriptor.tp_call = function(self, ...args){
    return self.d_method(self.d_type, ...args)
}

$B.classmethod_descriptor.tp_descr_get = function(self, obj, type){
    if(type === _b_.None){
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
    /*
    var f = function(obj){
        return self(type, ...arguments)
    }
    f.ob_type = $B.builtin_function_or_method
    f.$function_infos = _self.$function_infos
    return f
    */
}

var classmethod_descriptor_funcs = $B.classmethod_descriptor.tp_funcs = {}

classmethod_descriptor_funcs.__doc___get = function(self){

}

classmethod_descriptor_funcs.__doc___set = function(self){

}

classmethod_descriptor_funcs.__name__ = function(self){
    return self.d_name
}

classmethod_descriptor_funcs.__objclass__ = function(self){
    return self.d_type
}

classmethod_descriptor_funcs.__qualname___get = function(self){

}

classmethod_descriptor_funcs.__qualname___set = function(self){

}

classmethod_descriptor_funcs.__text_signature___get = function(self){

}

classmethod_descriptor_funcs.__text_signature___set = function(self){

}

$B.classmethod_descriptor.tp_members = ["__objclass__", "__name__"]

$B.classmethod_descriptor.tp_getset = ["__doc__", "__qualname__", "__text_signature__"]

/* classmethod_descriptor end */


$B.set_func_names($B.classmethod_descriptor, 'builtins')

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

/* getset_descriptor start */
$B.getset_descriptor.tp_descr_set = function(self, obj, value){
    if(self.setter === undefined){
        $B.RAISE_ATTRIBUTE_ERROR(
            `attribute '${self.attr}' of '${self.cls.__qualname__}' objects is not writable`,
            self,
            self.attr)
    }
    return self.setter(obj, value)
}

$B.getset_descriptor.tp_repr = function(self){
    return `<attribute '${self.attr}' of '${$B.get_name(self.cls)}' objects>`
}

$B.getset_descriptor.tp_descr_get = function(self, obj){
    if(obj === _b_.None){
        return self
    }
    if(! $B.get_mro($B.get_class(obj)).includes(self.cls)){
        $B.RAISE(_b_.TypeError, `descriptor '${self.attr}' for ` +
            `'${$B.get_name(self.cls)}' objects doesn't apply to a ` +
            `'${$B.class_name(obj)}' object`)
    }
    return self.getter(obj)
}

var getset_descriptor_funcs = $B.getset_descriptor.tp_funcs = {}

getset_descriptor_funcs.__name__ = function(self){
    return self.attr
}

getset_descriptor_funcs.__objclass__ = function(self){
    return self.cls
}

getset_descriptor_funcs.__qualname___get = function(self){
    return self.attr
}

getset_descriptor_funcs.__qualname___set = function(self, value){
    self.attr = value
}

$B.getset_descriptor.tp_members = ["__objclass__", "__name__"]

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
        d_base: cls,
        d_name: attr,
        wrapped: f
    }
}


/* wrapper_descriptor */
$B.wrapper_descriptor.tp_repr = function(self){
    var name = self.d_name
    var class_name = self.d_base.tp_name
    return `<slot wrapper '${name}' of '${class_name}' objects>`
}

$B.wrapper_descriptor.tp_call = function(self, ...args){
    if(typeof self.wrapped !== 'function'){
        console.log('self.wrapped not a function', self)
    }
    return self.wrapped(...args)
}

$B.wrapper_descriptor.tp_descr_get = function(self, obj, type){
    if(obj === _b_.None){
        return self
    }
    var res = {
        ob_type: $B.method_wrapper,
        d_name: self.d_name,
        self: obj,
        wrapped: self.wrapped
    }
    return res
    /*
    // self is the dunder method, obj is an object
    var f = function(){
        return self.call(null, obj, ...arguments)
    }
    f.ob_type = $B.method_wrapper
    f.$function_infos = self.$function_infos
    f.__objclass__ = self.__objclass__
    console.log('wrapper_descr __get__', self, obj, type)
    console.log('     returns', f)
    return f
    */
}

var wrapper_descriptor_funcs = $B.wrapper_descriptor.tp_funcs = {}

wrapper_descriptor_funcs.__name__ = function(self){
    return self.d_name
}

wrapper_descriptor_funcs.__objclass__ = function(self){
    return self.d_base
}

wrapper_descriptor_funcs.__qualname___get = function(self){
    return self.d_name
}

wrapper_descriptor_funcs.__qualname___set = function(self, value){

}

wrapper_descriptor_funcs.__reduce__ = function(self){

}

wrapper_descriptor_funcs.__text_signature___get = function(self){
    return '(self, /, *args, **kwargs)'
}

wrapper_descriptor_funcs.__text_signature___set = function(self){

}

$B.wrapper_descriptor.tp_methods = ["__reduce__"]

$B.wrapper_descriptor.tp_members = ["__objclass__", "__name__"]

$B.wrapper_descriptor.tp_getset = ["__qualname__", "__text_signature__"]

$B.set_func_names(wrapper_descriptor, "builtins")

/* wrapper_descriptor end */

/* builtin_function_or_method start */
$B.builtin_function_or_method.tp_richcompare = function(self){

}

$B.builtin_function_or_method.tp_repr = function(self){
    if(self.m_self){
        return `<built_in method '${self.ml.ml_name}' ` +
            `of ${$B.class_name(self.m_self)} object>`
    }else{
        return `<built_in function >`
    }
}

$B.builtin_function_or_method.tp_hash = function(self){

}

$B.builtin_function_or_method.tp_call = function(self, ...args){
    return self(...args)
}

var builtin_function_or_method_funcs = $B.builtin_function_or_method.tp_funcs = {}

builtin_function_or_method_funcs.__module__ = function(self){

}

builtin_function_or_method_funcs.__name___get = function(self){

}

builtin_function_or_method_funcs.__name___set = function(self){

}

builtin_function_or_method_funcs.__qualname___get = function(self){

}

builtin_function_or_method_funcs.__qualname___set = function(self){

}

builtin_function_or_method_funcs.__reduce__ = function(self){

}

builtin_function_or_method_funcs.__self___get = function(self){

}

builtin_function_or_method_funcs.__self___set = function(self){

}

builtin_function_or_method_funcs.__text_signature___get = function(self){

}

builtin_function_or_method_funcs.__text_signature___set = function(self){

}

$B.builtin_function_or_method.tp_methods = ["__reduce__"]

$B.builtin_function_or_method.tp_members = ["__module__"]

$B.builtin_function_or_method.tp_getset = ["__name__", "__qualname__", "__self__", "__text_signature__"]

/* builtin_function_or_method end */

$B.set_func_names($B.builtin_function_or_method, "builtins")

})(__BRYTHON__)