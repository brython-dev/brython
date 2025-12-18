"use strict";
(function($B){

var _b_ = $B.builtins
var object = _b_.object

$B.make_class = function(qualname, factory){
    // Builds a basic class object
    console.log('old school make class', qualname)
    var stack = Error().stack.split('\n')
    console.log(stack[2])

    var A = {
        ob_type: _b_.type,
        tp_bases: [object],
        __mro__: [object],
        __name__: qualname,
        __qualname__: qualname,
        $is_class: true
    }

    A.$factory = factory
    return A
}

object.__delattr__ = function(self, attr){
    // First check for data descriptor with __delete__ in class
    var klass = $B.get_class(self)
    var kl_attr = $B.search_in_mro(klass, attr)
    if(kl_attr !== undefined && _b_.hasattr(kl_attr, '__delete__')){
        return $B.$getattr(kl_attr, '__delete__')(self)
    }
    // No data descriptor, delete from instance __dict__
    if(self.dict && $B.$isinstance(self.dict, _b_.dict) &&
            _b_.dict.$contains_string(self.dict, attr)){
        _b_.dict.$delete_string(self.dict, attr)
        delete self[attr]
        return _b_.None
    }else if(self.__dict__ === undefined && self[attr] !== undefined){
        console.log('suspect')
        delete self[attr]
        return _b_.None
    }
    throw $B.attr_error(attr, self)
}

object.__dir__ = function(self) {
    var objects
    if(self.$is_class){
        objects = [self].concat(self.__mro__)
    }else{
        var klass = $B.get_class(self)
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
    if(self.dict){
        for(let attr of $B.make_js_iterator(self.dict)){
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
        $B.RAISE(_b_.TypeError,
            "non-empty format string passed to object.__format__")}
    return _b_.getattr($.self, "__str__")()
}

object.__ge__ = function(){
    return _b_.NotImplemented
}

$B.nb_from_dict = 0

object.tp_getattro = function(obj, attr){
    var test = false // attr == 'write'
    var klass = $B.get_class(obj)
    if(test){
        console.log('getattr', attr, 'of obj', obj, klass)
    }
    var in_mro = $B.search_in_mro(klass, attr, NULL)
    if(test){
        console.log('in mro', in_mro)
        if(in_mro !== NULL){
            console.log('class of in_mro', $B.get_class(in_mro))
        }
    }
    var getter = NULL
    if(in_mro !== NULL){
        var in_mro_class = $B.get_class(in_mro)
        var getter = $B.search_in_mro(in_mro_class, '__get__', NULL)
        if(test){
            console.log('getter', getter)
        }
        if(getter !== NULL){
            var is_data_descr = $B.search_in_mro(in_mro_class, '__set__', NULL) !== NULL ||
                                $B.search_in_mro(in_mro_class, '__del__', NULL) !== NULL
            if(is_data_descr){
                if(test){
                    console.log('data descriptor')
                }
                return getter(in_mro, obj, klass)
            }
        }
    }
    // search in obj dict
    var in_dict = $B.search_in_dict(obj, attr, NULL)
    if(in_dict !== NULL){
        return in_dict
    }else if(getter !== NULL){
        // non-data descriptor
        if(typeof getter !== 'function'){
            console.log('not a function', getter)
            console.log('class of in_mro', in_mro_class)
        }
        return getter(in_mro, obj, klass)
    }else if(in_mro !== NULL){
        return in_mro
    }
    if(test){
        console.log('attr', attr, 'not found on obj', obj)
    }
    throw $B.attr_error(attr, obj)
}


object.__gt__ = function(){return _b_.NotImplemented}

object.__hash__ = function(self){
    var hash = self.__hashvalue__
    if(hash !== undefined){return hash}
    return self.__hashvalue__ = $B.$py_next_hash--
}

object.tp_init = function(){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'object' " +
            "object needs an argument")
    }
    /*
    var $ = $B.args('__init__', 1, {self: null}, ['self'], arguments, {},
            'args', 'kw'),
        self = $.self
    if($.args.length > 0 || _b_.dict.__len__($.kw) > 0){
        var type = $B.get_class(self)
        var tp_init = $B.search_in_mro(type, '__init__')
        if(tp_init !== object.dict.tp_init){
            $B.RAISE(_b_.TypeError,
                "object.__init__() takes exactly one argument (the instance to initialize)")
        }
        var tp_new = $B.search_in_mro(type, '__new__')
        if(tp_new == object.dict.__new__){
            $B.RAISE(_b_.TypeError,
                `${$B.class_name(self)}.__init__() takes exactly` +
                ` one argument (the instance to initialize)`)
        }
    }
    */
    return _b_.None
}

object.__le__ = function(){return _b_.NotImplemented}

object.__lt__ = function(){return _b_.NotImplemented}

object.__mro__ = []

object.$new = function(cls){
    return function(){
        var $ = $B.args('__new__', 0, [], [], arguments, {}, 'args', 'kwargs')
        if($.args.length > 0 || _b_.dict.__len__($.kwargs) > 0){
            $B.RAISE(_b_.TypeError, "object() takes no parameters")
        }
        var res = Object.create(null)
        res.ob_type = cls
        if(cls !== object){
            res.dict = $B.obj_dict({})
        }
        return res
    }
}

object.$no_new_init = function(cls){
    // Used to create instances of classes with no explicit __new__ and an
    // explicit __init__
    var res = Object.create(null)
    res.ob_type = cls
    if(cls !== object){
        res.dict = $B.obj_dict({})
    }
    return res
}

object.tp_new = function(cls, ...args){
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "object.__new__(): not enough arguments")
    }
    var init_func = $B.$getattr(cls, "__init__")
    if(init_func === object.tp_init){
        if(args.length > 0){
            $B.RAISE(_b_.TypeError, "object() takes no parameters")
        }
    }
    var res = Object.create(null)
    $B.update_obj(res, {
        ob_type: cls,
        })
    if(cls !== object){
        res.dict = $B.obj_dict({})
    }
    return res
}

object.__ne__ = function(self, other){
    if(self === other){
        return false
    }
    var eq = $B.$getattr($B.get_class(self), "__eq__", null)
    if(eq !== null){
        var res = $B.$call(eq)(self, other)
        if(res === _b_.NotImplemented){return res}
        return ! $B.$bool(res)
    }
    return _b_.NotImplemented
}

function getNewArguments(self, klass){
    var newargs_ex = $B.$getattr(self, '__getnewargs_ex__', null)
    if(newargs_ex !== null){
        let newargs = newargs_ex()
        if((! newargs) || $B.get_class(newargs) !== _b_.tuple){
            $B.RAISE(_b_.TypeError, "__getnewargs_ex__ should " +
                `return a tuple, not '${$B.class_name(newargs)}'`)
        }
        if(newargs.length != 2){
            $B.RAISE(_b_.ValueError, "__getnewargs_ex__ should " +
                `return a tuple of length 2, not ${newargs.length}`)
        }
        let args = newargs[0],
            kwargs = newargs[1]
        if((! args) || $B.get_class(args) !== _b_.tuple){
            $B.RAISE(_b_.TypeError, "first item of the tuple returned " +
                `by __getnewargs_ex__ must be a tuple, not '${$B.class_name(args)}'`)
        }
        if((! kwargs) || $B.get_class(kwargs) !== _b_.dict){
            $B.RAISE(_b_.TypeError, "second item of the tuple returned " +
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
        if((! args) || $B.get_class(args) !== _b_.tuple){
            $B.RAISE(_b_.TypeError, "__getnewargs__ should " +
                `return a tuple, not '${$B.class_name(args)}'`)
        }
        return {args}
    }
}

object.tp_repr = function(self){
    var klass = $B.get_class(self)
    if(klass === _b_.type) {
        return "<class '" + $B.get_name(self) + "'>"
    }
    var module = klass.__module__
    if(module !== undefined && !module.startsWith("$") &&
            module !== "builtins"){
        return `<${module}.${$B.class_name(self)} object>`
    }else{
        return "<" + $B.class_name(self) + " object>"
    }
}

object.tp_setattro = function(self, attr, val){
    if(val === undefined){
        // setting an attribute to 'object' type is not allowed
        $B.RAISE(_b_.TypeError,
            "can't set attributes of built-in/extension type 'object'")
    }else if($B.get_class(self) === object){
        // setting an attribute to object() is not allowed
        if(object[attr] === undefined){
            throw $B.attr_error(attr, self)
        }else{
            $B.RAISE_ATTRIBUTE_ERROR(
                "'object' object attribute '" + attr + "' is read-only",
                self, attr)
        }
    }
    var dict = self.dict
    if(dict){
        _b_.dict.$setitem(dict, attr, val)
    }else{
        console.log('no dict for', self)
        self[attr] = val
    }
    return _b_.None
}

object.tp_str = function(self){
    if(self === undefined || self.$kw){
        $B.RAISE(_b_.TypeError, "descriptor '__str__' of 'object' " +
            "object needs an argument")
    }
    // Default to __repr__
    var klass = $B.get_class(self)
    var repr_func = $B.type_getattribute(klass, "__repr__")
    return $B.$call(repr_func)(...arguments)
}

object.__subclasshook__ = function(){
    return _b_.NotImplemented
}

// constructor of the built-in class 'object'
object.$factory = function(){
    if(arguments.length > 0 ||
            (arguments.length == 1 && arguments[0].$kw &&
                Object.keys(arguments[0].$kw).length > 0)
            ){
        $B.RAISE(_b_.TypeError, 'object() takes no arguments')
    }
    var res = {
            ob_type: object
        },
        args = [res]
    object.__init__.apply(null, args)
    return res
}

$B.set_func_names(object, "builtins")

function object_get_class(cls){
    return cls.ob_type
}

function object_set_class(cls, new_cls){
    if(value == $B.NULL){
        $B.RAISE(_b_.TypeError,
            "can't delete __class__ attribute")
    }
    var old_cls = $B.get_class(cls)
    if(!($B.issubclass(new_cls, $B.module) &&
          $B.issubclass(oldto, $B.module)) &&
        ($B._PyType_HasFeature(newto, $B.TPFLAGS.IMMUTABLETYPE) ||
         $B._PyType_HasFeature(oldto, $B.TPFLAGS.IMMUTABLETYPE))){
            $B.RAISE(_b_.TypeError,
                     "__class__ assignment only supported for mutable types " +
                     "or ModuleType subclasses")
    }
    if(! $B.is_type(value)) {
        $B.$RAISE(_b_.TypeError, "__class__ must be set to a class," +
            ` not '${$B.class_name(value)}' object"`)
    }
    // XXX skip code in CPython Objects/typeobject/object_set_class_world_stopped
    cls.ob_type = new_cls
    return res;
}

object.tp_getset = [
    ["__class__", object_get_class, object_set_class]
]

function object___reduce_ex__(cls){
    var klass = $B.get_class(cls)
    if($B.imported.copyreg === undefined){
        $B.$import('copyreg')
    }
    if(protocol < 2){
        return $B.$call($B.imported.copyreg._reduce_ex)(cls, protocol)
    }

    var reduce = $B.$getattr(klass, '__reduce__')

    if(reduce !== object.__reduce__){
        return $B.$call(reduce)(cls)
    }
    var res = [$B.imported.copyreg.__newobj__]
    var arg2 = [klass]
    var newargs = getNewArguments(cls, klass)
    if(newargs){
        arg2 = arg2.concat(newargs.args)
    }
    res.push($B.fast_tuple(arg2))
    var getstate = $B.search_in_mro(klass, '__getstate__')
    if(getstate){
        var d = $B.$call(getstate)(cls)
    }else{
        var d = $B.empty_dict(),
            nb = 0
        if(cls.dict){
            for(var item of _b_.dict.$iter_items(cls.dict)){
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
    }
    res.push(d)
    var list_like_iterator = _b_.None
    if($B.$getattr(klass, 'append', null) !== null &&
            $B.$getattr(klass, 'extend', null) !== null){
        list_like_iterator = _b_.iter(cls)
    }
    res.push(list_like_iterator)
    var key_value_iterator = _b_.None
    if($B.$isinstance(cls, _b_.dict)){
        key_value_iterator = _b_.dict.items(cls)
    }
    res.push(key_value_iterator)
    return _b_.tuple.$factory(res)
}

function object___reduce__(cls){
    if(! cls.dict){
        $B.RAISE(_b_.TypeError, `cannot pickle '${$B.class_name(cls)}' object`)
    }
    if($B.imported.copyreg === undefined){
        $B.$import('copyreg')
    }
    var res = [$B.imported.copyreg._reconstructor]
    var D = $B.get_class(cls),
        B = object
    for(var klass of $B.get_mro(D)){
        if(klass.__module__ == 'builtins'){
            B = klass
            break
        }
    }
    var args = $B.$list([D, B])
    if(B === object){
        args.push(_b_.None)
    }else{
        args.push($B.$call(B)(cls))
    }

    res.push($B.fast_tuple(args))
    var d = $B.empty_dict()
    for(var attr of _b_.dict.$keys_string(cls.dict)){
        _b_.dict.$setitem(d, attr,
            _b_.dict.$getitem_string(cls.dict, attr))
    }
    res.push(d)
    return _b_.tuple.$factory(res)
}
function object___getstate__(klass){

}
function object_subclasshook(klass){
    return _b_.NotImplemented
}
function object_init_subclass(klass){
    return _b_.None
}
function object___format__(klass){

}
function object___sizeof__(klass){

}
function object___dir__(self){
{
    var result
    var dict
    var itsclass

    /* Get __dict__ (which may or may not be a real dict...) */
    dict = self.dict
    if (dict == undefined) {
        dict = $B.empty_dict()
    }else if(! $B.$isinstance(dict, _b_.dict)){
        dict = $B.empty_dict()
    }else{
        /* Copy __dict__ to avoid mutating it. */
        var temp = _b_.dict.copy(dict)
    }

    if(dict == undefined)
        $B.RAISE(_b_.ValueError, 'no __dir__')
    }

    /* Merge in attrs reachable from its class. */
    itsclass = $B.get_class(self)
    /* XXX(tomer): Perhaps fall back to Py_TYPE(obj) if no
                   __class__ exists? */
    if (itsclass != NULL){
        merge_class_dict(dict, itsclass)
    }
    result = PyDict_Keys(dict);
}

object.tp_methods = [
    ["__reduce_ex__", object___reduce_ex__, $B.METH_O],
    ["__reduce__", object___reduce__, $B.METH_NOARGS],
    ["__getstate__", object___getstate__, $B.METH_NOARGS],
    ["__subclasshook__", object_subclasshook, $B.METH_CLASS | $B.METH_O],
    ["__init_subclass__", object_init_subclass, $B.METH_CLASS | $B.METH_NOARGS],
    ["__format__", object___format__, $B.METH_O],
    ["__sizeof__", object___sizeof__, $B.METH_NOARGS],
    ["__dir__", object___dir__, $B.METH_NOARGS]
]

_b_.object = object

})(__BRYTHON__);

