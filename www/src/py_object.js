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

$B.nb_from_dict = 0

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



object.__ne__ = function(self, other){
    if(self === other){
        return false
    }
    var eq = $B.$getattr($B.get_class(self), "__eq__", null)
    if(eq !== null){
        var res = $B.$call(eq, self, other)
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


function object_subclasshook(klass){
    return _b_.NotImplemented
}



/* object start */
_b_.object.tp_richcompare = function(self, other, op){
    var res

    switch(op){
        case '__eq__':
            /* Return NotImplemented instead of False, so if two
               objects are compared, both get a chance at the
               comparison.  See issue #1393. */
            res = $B.$is(self, other) ? true : _b_.NotImplemented
            break
        case '__ne__':
            /* By default, __ne__() delegates to __eq__() and inverts the result,
               unless the latter returns NotImplemented. */
            var self_richcomp = $B.search_slot($B.get_class(self), 'tp_richcompare', $B.NULL)
            if(self_richcomp === $B.NULL){
                res = _b_.NotImplemented
            }else{
                res = $B.$call(self_richcomp, self, other, '__eq__')
                if(res !== _b_.NotImplemented){
                    return ! $B.$bool(res)
                }
            }
            break
        default:
            res = _b_.NotImplemented
            break
    }

    return res
}

_b_.object.tp_setattro = function(self, attr, value){
    var test = false // attr == 'text'
    var klass = $B.get_class(self)
    var in_mro = $B.search_in_mro(klass, attr, $B.NULL)
    if(test){
        console.log('object.tp_setattro', self, attr, value)
    }
    if(value === $B.NULL){
        // First check for data descriptor with __delete__ in class
        if(in_mro !== $B.NULL && _b_.hasattr(in_mro, '__delete__')){
            return $B.$getattr(in_mro, '__delete__')(self)
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
    if(value === undefined){
        // setting an attribute to 'object' type is not allowed
        console.log('value is undefined', self, attr)
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
    if(in_mro !== $B.NULL){
        if(test){
            console.log(attr, 'in class mro', in_mro)
        }
        var setter = $B.search_slot($B.get_class(in_mro), 'tp_descr_set', $B.NULL)
        if(setter !== $B.NULL){
            if(test){
                console.log('setter', setter)
            }
            return setter(in_mro, self, value)
        }
    }
    var dict = self.dict
    if(dict){
        _b_.dict.$setitem(dict, attr, value)
    }else{
        self[attr] = value
    }
    return _b_.None
}

_b_.object.tp_repr = function(self){
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

_b_.object.tp_hash = function(self){
    var hash = self.__hashvalue__
    if(hash !== undefined){return hash}
    return self.__hashvalue__ = $B.$py_next_hash--
}

_b_.object.tp_str = function(self){
    if(self === undefined || self.$kw){
        $B.RAISE(_b_.TypeError, "descriptor '__str__' of 'object' " +
            "object needs an argument")
    }
    // Default to __repr__
    var klass = $B.get_class(self)
    var repr_func = $B.$getattr(klass, "__repr__", $B.NULL)
    return $B.$call(repr_func, self)
}

_b_.object.tp_getattro = function(self, attr){
    var test = false // attr == '__doc__' // $B.get_class(self) === _b_.TypeError
    var klass = $B.get_class(self)
    if(test){
        console.log('getattr', attr, 'of self', self, klass)
    }
    var in_mro = $B.search_in_mro(klass, attr, $B.NULL)
    if(test){
        console.log('in mro', in_mro)
        if(in_mro !== $B.NULL){
            console.log('class of in_mro', $B.get_class(in_mro))
        }
    }
    var getter = $B.NULL
    if(in_mro !== $B.NULL){
        var in_mro_class = $B.get_class(in_mro)
        var getter = $B.search_slot(in_mro_class, 'tp_descr_get', $B.NULL)
        if(test){
            console.log('getter', getter)
        }
        if(getter !== $B.NULL){
            var is_data_descr = $B.search_slot(in_mro_class, 'tp_descr_set', $B.NULL) !== $B.NULL
            if(is_data_descr){
                if(test){
                    console.log('data descriptor')
                    console.log('call getter with', in_mro, self, klass)
                }
                return getter(in_mro, self, klass)
            }
        }
    }
    // search in self dict
    var in_dict = $B.search_in_dict(self, attr, $B.NULL)
    if(test){
        console.log('in object dict', in_dict)
    }
    if(in_dict !== $B.NULL){
        return in_dict
    }else if(getter !== $B.NULL){
        // non-data descriptor
        if(typeof getter !== 'function'){
            console.log('not a function', getter)
            console.log('class of in_mro', in_mro_class)
        }
        if(test){
            console.log('call getter of non-data descr', in_mro, self, klass)
        }
        return getter(in_mro, self, klass)
    }else if(in_mro !== $B.NULL){
        if(test){
            console.log('return in_mro', in_mro)
        }
        return in_mro
    }
    if(test){
        console.log('attr', attr, 'not found on self', self)
        console.log('self[attr]', self[attr])
    }
    return $B.NULL
}

_b_.object.tp_init = function(){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'object' " +
            "object needs an argument")
    }
    return _b_.None
}

_b_.object.tp_new = function(){
    var $ = $B.args('__new__', 1, {cls: null}, ['cls'], arguments, {}, 'args',
                'kw')
    var cls = $.cls,
        args = $.args,
        kw = $.kw
    if(args.length > 0 || _b_.len(kw)){
        if($B.search_slot(cls, 'tp_new', $B.NULL) !== _b_.object.tp_new){
            $B.RAISE(_b_.TypeError,
                "object.__new__() takes exactly one argument "  +
                "(the type to instantiate)"
            )
        }
        if($B.search_slot(cls, 'tp_init', $B.NULL) === _b_.object.tp_init){
            $B.RAISE(_b_.TypeError, `${$B.get_name(cls)} takes no arguments`)
        }
    }
    var res = {
        ob_type: cls
    }
    if(cls !== object){
        res.dict = $B.empty_dict()
    }
    return res
}

var object_funcs = _b_.object.tp_funcs = {}

object_funcs.__class___get = function(self){
    return $B.get_class(self)
}

object_funcs.__class___set = function(cls, new_cls){
    if(new_cls == $B.NULL){
        $B.RAISE(_b_.TypeError,
            "can't delete __class__ attribute")
    }
    var old_cls = $B.get_class(cls)
    if(!(_b_.issubclass(new_cls, $B.module) &&
          _b_.issubclass(old_cls, $B.module)) &&
        ($B._PyType_HasFeature(new_cls, $B.TPFLAGS.IMMUTABLETYPE) ||
         $B._PyType_HasFeature(old_cls, $B.TPFLAGS.IMMUTABLETYPE))){
            $B.RAISE(_b_.TypeError,
                     "__class__ assignment only supported for mutable types " +
                     "or ModuleType subclasses")
    }
    if(! $B.is_type(new_cls)) {
        $B.$RAISE(_b_.TypeError, "__class__ must be set to a class," +
            ` not '${$B.class_name(new_cls)}' object"`)
    }
    // XXX skip code in CPython Objects/typeobject/object_set_class_world_stopped
    cls.ob_type = new_cls
}

object_funcs.__dir__ = function(self){
    var result
    var dict
    var itsclass

    /* Get __dict__ (which may or may not be a real dict...) */
    dict = self.dict
    if(dict == undefined){
        dict = $B.empty_dict()
    }else if(! $B.$isinstance(dict, _b_.dict)){
        dict = $B.empty_dict()
    }else{
        /* Copy __dict__ to avoid mutating it. */
        var temp = _b_.dict.tp_funcs.copy(dict)
    }

    if(dict == undefined){
        $B.RAISE(_b_.ValueError, 'no __dir__')
    }

    /* Merge in attrs reachable from its class. */
    itsclass = $B.get_class(self)
    if(itsclass != NULL){
        $B.merge_class_dict(dict, itsclass)
    }
    result = $B.$list(Array.from($B.make_js_iterator(dict)))
    return result
}

object_funcs.__format__ = function(){
    var $ = $B.args("__format__", 2, {self: null, spec: null},
        ["self", "spec"], arguments, {}, null, null)
    if($.spec !== ""){
        $B.RAISE(_b_.TypeError,
            "non-empty format string passed to object.__format__")}
    return _b_.getattr($.self, "__str__")()
}

object_funcs.__getstate__ = function(self){

}

object_funcs.__init_subclass__ = function(self){
    // Default implementation only checks that no keyword arguments were passed
    // Defined as classmethod after set_func_names is called
    var $ = $B.args("__init_subclass__", 1, {cls: null}, ['cls'],
            arguments, {}, "args", "kwargs")
    if($.args.length > 0){
        console.log('init subclass, args', $.args)
        var qualname = $B.$getattr($.cls, '__qualname__', '<type>')
        $B.RAISE(_b_.TypeError,
            `${qualname}.__init_subclass__ takes no arguments ` +
            `(${$.args.length} given)`)
    }
    if(_b_.len($.kwargs) > 0){
        var qualname = $B.$getattr($.cls, '__qualname__', '<type>')
        $B.RAISE(_b_.TypeError,
            `${qualname}.__init_subclass__() ` +
            `takes no keyword arguments`)
    }
    return _b_.None
}

object_funcs.__reduce__ = function(cls){
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
        args.push($B.$call(B, cls))
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

object_funcs.__reduce_ex__ = function(cls){
    var klass = $B.get_class(cls)
    if($B.imported.copyreg === undefined){
        $B.$import('copyreg')
    }
    if(protocol < 2){
        return $B.$call($B.imported.copyreg._reduce_ex, cls, protocol)
    }

    var reduce = $B.$getattr(klass, '__reduce__')

    if(reduce !== object.__reduce__){
        return $B.$call(reduce, cls)
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
        var d = $B.$call(getstate, cls)
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

object_funcs.__sizeof__ = function(self){

}

_b_.object.functions_or_methods = ["__new__"]

_b_.object.tp_methods = ["__reduce_ex__", "__reduce__", "__getstate__", "__format__", "__sizeof__", "__dir__"]

_b_.object.classmethods = ["__init_subclass__"]

_b_.object.tp_getset = ["__class__"]


/* object end */

})(__BRYTHON__);

