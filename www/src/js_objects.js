;(function($B){

var _b_ = $B.builtins

var object = _b_.object

var _window = self;

function to_simple(value){
    switch(typeof value){
        case 'string':
        case 'number':
            return value
        case 'boolean':
            return value ? "true" : "false"
        case 'object':
            if(value === _b_.None){
                return 'null'
            }else if(value instanceof Number){
                return value.valueOf()
            }else if(value instanceof String){
                return value.valueOf()
            }
        default:
        console.log("erreur", value)
            throw _b_.TypeError.$factory("keys must be str, int, " +
                "float, bool or None, not " + $B.class_name(value))
    }
}

$B.pyobj2structuredclone = function(obj, strict){
    // If the Python object supports the structured clone algorithm, return
    // the result, else raise an exception
    // If "strict" is false, dictionaries with non-string keys are supported
    strict = strict === undefined ? true : strict
    if(typeof obj == "boolean" || typeof obj == "number" ||
            typeof obj == "string" || obj instanceof String){
        return obj
    }else if(obj.__class__ === _b_.float){
        return obj.value
    }else if(obj === _b_.None){
        return null // _b_.None
    }else if(Array.isArray(obj) || obj.__class__ === _b_.list ||
            obj.__class__ === _b_.tuple){
        var res = []
        for(var i = 0, len = obj.length; i < len; i++){
            res.push($B.pyobj2structuredclone(obj[i]))
        }
        return res
    }else if(_b_.isinstance(obj, _b_.dict)){
        if(strict){
            if(Object.keys(obj.$numeric_dict).length > 0 ||
                    Object.keys(obj.$object_dict).length > 0){
                throw _b_.TypeError.$factory("a dictionary with non-string " +
                    "keys does not support structured clone")
            }
        }
        var items = $B.dict_to_list(obj),
            res = {}
        for(var i = 0, len = items.length; i < len; i++){
            res[to_simple(items[i][0])] = $B.pyobj2structuredclone(items[i][1])
        }
        return res
    }else{
        return obj
    }
}

$B.structuredclone2pyobj = function(obj){
    if(obj === null){
        return _b_.None
    }else if(obj === undefined){
        return $B.Undefined
    }else if(typeof obj == "boolean" ||
            typeof obj == "string"){
        return obj
    }else if(typeof obj == "number"){
        return Number.isInteger(obj) ?
                   obj :
                   {__class__: _b_.float, value: obj}
    }else if(obj instanceof Number || obj instanceof String){
        return obj.valueOf()
    }else if(Array.isArray(obj) || obj.__class__ === _b_.list ||
            obj.__class__ === _b_.tuple){
        var res = _b_.list.$factory()
        for(var i = 0, len = obj.length; i < len; i++){
            res.push($B.structuredclone2pyobj(obj[i]))
        }
        return res
    }else if(typeof obj == "object"){
        var res = $B.empty_dict()
        for(var key in obj){
            _b_.dict.$setitem(res, key, $B.structuredclone2pyobj(obj[key]))
        }
        return res
    }else{
        console.log(obj, Array.isArray(obj),
            obj.__class__, _b_.list, obj.__class__ === _b_.list)
        throw _b_.TypeError.$factory(_b_.str.$factory(obj) +
            " does not support the structured clone algorithm")
    }

}

// Transforms a Javascript constructor into a Python function
// that returns instances of the constructor, converted to Python objects

var JSConstructor = {
    __class__: _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "<javascript>",
        __name__: 'JSConstructor'
    },
    $is_class: true
}

JSConstructor.__call__ = function(_self){
    // _self.func is a constructor
    // It takes Javascript arguments so we must convert
    // those passed to the Python function
    return function(){
        var args = [null]
        for(var i = 0, len = arguments.length; i < len; i++){
            args.push(pyobj2jsobj(arguments[i]))
        }
        var factory = _self.func.bind.apply(_self.func, args)
        var res = new factory()
        // res is a Javascript object
        return $B.$JS2Py(res)
    }
}

JSConstructor.__getattribute__ = function(_self, attr){
    // Attributes of a constructor are taken from the original JS object
    if(attr == "__call__"){
        return function(){
            var args = [null]
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(pyobj2jsobj(arguments[i]))
            }
            var factory = _self.func.bind.apply(_self.func, args)
            var res = new factory()
            // res is a Javascript object
            return $B.$JS2Py(res)
        }
    }
    return JSObject.__getattribute__(_self, attr)
}

JSConstructor.$factory = function(obj){
    return {
        __class__: JSConstructor,
        js: obj,
        func: obj.js_func
    }
}



var jsobj2pyobj = $B.jsobj2pyobj = function(jsobj) {
    switch(jsobj) {
      case true:
      case false:
        return jsobj
    }

    if(jsobj === undefined){
        return $B.Undefined
    }else if(jsobj === null){
        return _b_.None
    }

    if(Array.isArray(jsobj)){
        return _b_.list.$factory(jsobj.map(jsobj2pyobj))
    }else if(typeof jsobj === 'number'){
       if(jsobj.toString().indexOf('.') == -1){
           return _b_.int.$factory(jsobj)
       }
       // for now, lets assume a float
       return _b_.float.$factory(jsobj)
    }else if(typeof jsobj == "string"){
        return $B.String(jsobj)
    }else if(typeof jsobj == "function"){
        // transform Python arguments to equivalent JS arguments
        return function(){
            var args = []
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(pyobj2jsobj(arguments[i]))
            }
            return jsobj2pyobj(jsobj.apply(null, args))
        }
    }

    if(jsobj.$nat === 'kw') {
        return jsobj
    }

    if($B.$isNode(jsobj)){
        return $B.DOMNode.$factory(jsobj)
    }

    return $B.JSObj.$factory(jsobj)
}

var pyobj2jsobj = $B.pyobj2jsobj = function(pyobj){
    // conversion of a Python object into a Javascript object
    if(pyobj === true || pyobj === false){return pyobj}
    if(pyobj === _b_.None){return null}
    if(pyobj === $B.Undefined){return undefined}

    var klass = $B.get_class(pyobj)
    if(klass === undefined){
        // not a Python object , consider arg as Javascript object instead
        return pyobj;
    }
    if(klass === JSConstructor){
        // Instances of JSConstructor are transformed into the
        // underlying Javascript object

        if(pyobj.js_func !== undefined){return pyobj.js_func}
        return pyobj.js

    }else if(klass === $B.DOMNode ||
            klass.__mro__.indexOf($B.DOMNode) > -1){

        // instances of DOMNode or its subclasses are transformed into the
        // underlying DOM element
        return pyobj

    }else if([_b_.list, _b_.tuple].indexOf(klass) > -1){

        // Python list : transform its elements
        var res = []
        pyobj.forEach(function(item){
            res.push(pyobj2jsobj(item))
        })
        return res

    }else if(klass === _b_.dict || _b_.issubclass(klass, _b_.dict)){

        // Python dictionaries are transformed into a Javascript object
        // whose attributes are the dictionary keys
        var jsobj = {}
        var items = _b_.list.$factory(_b_.dict.items(pyobj))
        items.forEach(function(item){
            if(typeof item[1] == 'function'){
                // set "this" to jsobj
                item[1].bind(jsobj)
            }
            jsobj[item[0]] = pyobj2jsobj(item[1])
        })
        return jsobj

    }else if(klass === _b_.str){

        // Python strings are converted to the underlying value
        return pyobj.valueOf()

    }else if(klass === _b_.float){

        return pyobj.value

    }else if(klass === $B.Function || klass === $B.method){
        // Transform arguments
        if(pyobj.prototype &&
                pyobj.prototype.constructor === pyobj &&
                ! pyobj.$is_func){
            // pyobj is a Javascript constructor - this happens with
            // javascript.extends
            return pyobj
        }
        return function(){
            try{
                var args = []
                for(var i = 0; i < arguments.length; i++){
                    if(arguments[i] === undefined){args.push(_b_.None)}
                    else{args.push(jsobj2pyobj(arguments[i]))}
                }
                if(pyobj.prototype.constructor === pyobj && ! pyobj.$is_func){
                    var res = new pyobj(...args)
                }else{
                    var res = pyobj.apply(this, args)
                }
                return pyobj2jsobj(res)
            }catch(err){
                if($B.debug > 1){
                    console.log($B.class_name(err) + ':',
                        err.args ? err.args[0] : '' )
                }
                throw err
            }
        }
    }else{
        // other types are left unchanged
        return pyobj
    }
}

$B.JSConstructor = JSConstructor

function pyargs2jsargs(pyargs){
    var args = []
    for(var i = 0, len = pyargs.length; i < len; i++){
        var arg = pyargs[i]
        if(arg !== undefined && arg !== null &&
                arg.$nat !== undefined){
            // Passing keyword arguments to a Javascript function
            // raises a TypeError : since we don't know the
            // signature of the function, the result of Brython
            // code like foo(y=1, x=2) applied to a JS function
            // defined by function foo(x, y) can't be determined.
            //
            throw _b_.TypeError.$factory(
                "A Javascript function can't take " +
                    "keyword arguments")
        }else{
            args.push($B.pyobj2jsobj(arg))
        }
    }
    return args
}

$B.JSObj = $B.make_class("JSObject",
    function(jsobj){
        if(Array.isArray(jsobj)){
            //jsobj.__class__ = _b_.list
        }else if(typeof jsobj == "function"){
            jsobj.$is_js_func = true
            jsobj.__new__ = function(){
                return new jsobj.$js_func(...arguments)
            }
        }else if(typeof jsobj == "number" && ! Number.isInteger(jsobj)){
            return {__class__: _b_.float, value: jsobj}
        }
        return jsobj
    }
)

// Operations are implemented only for BigInt objects (cf. issue 1417)
$B.JSObj.__sub__ = function(_self, other){
    // If self - other means anything, return it
    if(typeof _self == "bigint" && typeof other == "bigint"){
        return _self - other
    }
    throw _b_.TypeError.$factory("unsupported operand type(s) for - : '" +
        $B.class_name(_self) + "' and '" + $B.class_name(other) + "'")
}

var ops = {'+': '__add__',
           '*': '__mul__',
           '**': '__pow__',
           '%' : '__mod__'
          }

for(var op in ops){
    eval('$B.JSObj.' + ops[op] + ' = ' +
        ($B.JSObj.__sub__ + '').replace(/-/g, op))
}

$B.JSObj.__eq__ = function(_self, other){
    switch(typeof _self){
        case "object":
            if(_self.__eq__ !== undefined){
                return _self.__eq__(other)
            }
            if(Object.keys(_self).length !== Object.keys(other).length){
                return false
            }
            if(_self === other){
                return true
            }
            for(var key in _self){
                if(! $B.JSObj.__eq__(_self[key], other[key])){
                    return false
                }
            }
        default:
            return _self === other
    }
}

$B.JSObj.__ne__ = function(_self, other){
    return ! $B.JSObj.__eq__(_self, other)
}

$B.JSObj.__getattribute__ = function(_self, attr){
    var test = false // attr == "get_float"
    if(test){
        console.log("__ga__", _self, attr)
    }
    if(attr == "new" && typeof _self == "function"){
        // constructor
        if(_self.$js_func){
            return function(){
                var args = pyargs2jsargs(arguments)
                return $B.JSObj.$factory(new _self.$js_func(...args))
            }
        }else{
            return function(){
                var args = pyargs2jsargs(arguments)
                return $B.JSObj.$factory(new _self(...args))
            }
        }
    }
    var js_attr = _self[attr]
    if(js_attr == undefined && typeof _self == "function" && _self.$js_func){
        js_attr = _self.$js_func[attr]
    }
    if(js_attr === undefined){
        if(typeof _self.getNamedItem == 'function'){
            var res = _self.getNamedItem(attr)
            if(res !== undefined){
                return $B.JSObj.$factory(res)
            }
        }
        var klass = $B.get_class(_self)
        if(klass && klass[attr]){
            var class_attr = klass[attr]
            if(typeof class_attr == "function"){
                return function(){
                    var args = [_self]
                    for(var i = 0, len = arguments.length; i < len; i++){
                        args.push(arguments[i])
                    }
                    return $B.JSObj.$factory(class_attr.apply(null, args))
                }
            }else{
                return class_attr
            }
        }
        if(attr == "bind" && typeof _self.addEventListener == "function"){
            return function(event, callback){
                return _self.addEventListener(event, callback)
            }
        }
        throw $B.attr_error(attr, _self)
    }
    if(typeof js_attr === 'function'){
        var res = function(){
            var args = pyargs2jsargs(arguments),
                target = _self.$js_func || _self
            try{
                var result = js_attr.apply(target, args)
            }catch(err){
                console.log("error", err)
                console.log("attribute", attr, "of _self", _self,
                    js_attr, args, arguments)
                throw err
            }
            if(result === undefined){
                return $B.Undefined
            }else if(result === null){
                return _b_.None
            }
            return $B.JSObj.$factory(result)
        }
        // this is very important for class-emulating functions
        res.prototype = js_attr.prototype
        res.$js_func = js_attr
        res.__mro__ = [_b_.object]
        res.$infos = {
            __name__: js_attr.name,
            __qualname__: js_attr.name
        }
        if($B.frames_stack.length > 0){
            res.$infos.__module__ = $B.last($B.frames_stack)[3].__name__
        }
        return $B.JSObj.$factory(res)
    }else{
        return $B.JSObj.$factory(js_attr)
    }
}

$B.JSObj.__setattr__ = function(_self, attr, value){
    _self[attr] = $B.pyobj2structuredclone(value)
    return _b_.None
}

$B.JSObj.__getitem__ = function(_self, key){
    if(typeof key == "string"){
        return $B.JSObj.__getattribute__(_self, key)
    }else if(typeof key == "number"){
        if(_self[key] !== undefined){
            return $B.JSObj.$factory(_self[key])
        }
        if(typeof _self.length == 'number'){
            if((typeof key == "number" || typeof key == "boolean") &&
                    typeof _self.item == 'function'){
                var rank = _b_.int.$factory(key)
                if(rank < 0){rank += _self.length}
                var res = _self.item(rank)
                if(res === null){throw _b_.IndexError.$factory(rank)}
                return $B.JSObj.$factory(res)
            }
        }
    }else if(key.__class__ === _b_.slice &&
            typeof _self.item == 'function'){
        var _slice = _b_.slice.$conv_for_seq(key, _self.length)
        var res = []
        for(var i = _slice.start; i < _slice.stop; i += _slice.step){
            res.push(_self.item(i))
        }
        return res
    }
    throw _b_.KeyError.$factory(rank)
}

$B.JSObj.__setitem__ = $B.JSObj.__setattr__

var JSObj_iterator = $B.make_iterator_class('JS object iterator')

$B.JSObj.__iter__ = function(_self){
    var items = []
    if(_window.Symbol && _self[Symbol.iterator] !== undefined){
        // Javascript objects that support the iterable protocol, such as Map,
        // views on ArrayBuffer, etc.
        return JSObj_iterator.$factory(Array.from(_self))
    }else if(_self.length !== undefined && _self.item !== undefined){
        // collection
        for(var i = 0; i < _self.length; i++){
            items.push($B.JSObj.$factory(_self.js.item(i)))
        }
        return JSObj_iterator.$factory(items)
    }
    // Else iterate on the dictionary built from the JS object
    return JSObj_iterator.$factory(Object.keys(_self))
}

$B.JSObj.__len__ = function(_self){
    if(typeof _self.length == 'number'){
        return _self.length
    }
    throw $B.attr_error('__len__', _self)
}

$B.JSObj.__repr__ = $B.JSObj.__str__ = function(_self){
    return '<Javascript ' + _self.constructor.name + ' object: ' +
        _self.toString() + '>'
}

$B.JSObj.bind = function(_self, evt, func){
    // "bind" is an alias for "addEventListener"
    var js_func = function(ev) {
        return func(jsobj2pyobj(ev))
    }
    _self.addEventListener(evt, js_func)
    return _b_.None
}

$B.JSObj.to_dict = function(_self){
    // Returns a Python dictionary based on the underlying Javascript object
    return $B.structuredclone2pyobj(_self)
}

$B.set_func_names($B.JSObj, "builtins")

// Class used as a metaclass for Brython classes that inherit a Javascript
// constructor
$B.JSMeta = $B.make_class("JSMeta")

$B.JSMeta.__call__ = function(cls){
    // Create an instance of a class that inherits a Javascript contructor
    var extra_args = [],
        klass = arguments[0]
    for(var i = 1, len = arguments.length; i < len; i++){
        extra_args.push(arguments[i])
    }
    var new_func = _b_.type.__getattribute__(klass, "__new__")
    // create an instance with __new__
    var instance = new_func.apply(null, arguments)
    if(instance instanceof cls.__mro__[0].$js_func){
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

$B.JSMeta.__mro__ = [_b_.type, _b_.object]

$B.JSMeta.__getattribute__ = function(cls, attr){
    if(cls[attr] !== undefined){
        return cls[attr]
    }else if($B.JSMeta[attr] !== undefined){
        return $B.JSMeta[attr]
    }else{
        // Search in type
        return _b_.type.__getattribute__(cls, attr)
    }
}

$B.JSMeta.__init_subclass__ = function(){
    // do nothing
}

$B.JSMeta.__new__ = function(metaclass, class_name, bases, cl_dict){
    // Creating a class that inherits a Javascript class A must return
    // another Javascript class B that extends A
    eval("var " + class_name + ` = function(){
        if(cl_dict.$string_dict.__init__){
            var args = [this]
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(arguments[i])
            }
            cl_dict.$string_dict.__init__[0].apply(this, args)
        }else{
            return new bases[0].$js_func(...arguments)
        }
    }`)
    var new_js_class = eval(class_name)
    new_js_class.prototype = Object.create(bases[0].$js_func.prototype)
    new_js_class.prototype.constructor = new_js_class
    new_js_class.__mro__ = [bases[0], _b_.type]
    new_js_class.$is_js_class = true
    return new_js_class
}

$B.set_func_names($B.JSMeta, "builtins")


})(__BRYTHON__)


