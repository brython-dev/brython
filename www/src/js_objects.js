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
            for(var key of $B.make_js_iterator(_b_.dict.keys(obj))){
                if(typeof key !== 'string'){
                    throw _b_.TypeError.$factory("a dictionary with non-string " +
                        "keys does not support structured clone")
                }
            }
        }
        var res = {}
        for(var entry of $B.make_js_iterator(_b_.dict.items(obj))){
            res[to_simple(entry[0])] = $B.pyobj2structuredclone(entry[1])
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

var JSConstructor = $B.make_class('JSConstructor')

JSConstructor.__module__ = "<javascript>"

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



var jsobj2pyobj = $B.jsobj2pyobj = function(jsobj, _this){
    // If _this is passed and jsobj is a function, the function is called
    // with built-in value `this` set to _this
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
        return $B.$list(jsobj.map(jsobj2pyobj))
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
        _this = _this === undefined ? null : _this
        return function(){
            var args = []
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(pyobj2jsobj(arguments[i]))
            }
            return jsobj2pyobj(jsobj.apply(_this, args))
        }
    }

    if(jsobj.$kw) {
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
        // Only dictionaries with string keys are allowed to avoid confusing
        // bugs with Python dicts such as {"1": 'a', 1: "b"}
        var jsobj = {}
        for(var entry of _b_.dict.$iter_items_with_hash(pyobj)){
            var key = entry.key
            if(typeof key != "string"){
                key = _b_.str.$factory(key)
            }
            if(typeof entry.value == 'function'){
                // set "this" to jsobj
                entry.value.bind(jsobj)
            }
            jsobj[key] = pyobj2jsobj(entry.value)
        }
        return jsobj

    }else if(klass === _b_.str){

        // Python strings are converted to the underlying value
        return pyobj.valueOf()

    }else if(klass === _b_.float){

        return pyobj.value

    }else if(klass === $B.function || klass === $B.method){
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
                $B.handle_error(err)
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
                arg.$kw !== undefined){
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

var js_list_meta = $B.make_class('js_list_meta')
js_list_meta.__mro__ = [_b_.type, _b_.object]

js_list_meta.__getattribute__ = function(_self, attr){
    if(_b_.list[attr] === undefined){
        throw _b_.AttributeError.$factory(attr)
    }
    if(['__delitem__', '__setitem__'].indexOf(attr) > -1){
        // Transform Python values to Javascript values before setting item
        return function(){
            var args = [arguments[0]]
            for(var i = 1, len = arguments.length; i < len; i++){
                args.push(pyobj2jsobj(arguments[i]))
            }
            if(attr == '__contains__'){
                console.log(attr, args)
            }
            return _b_.list[attr].apply(null, args)
        }
    }else if(['__add__', '__contains__', '__eq__', '__getitem__', '__mul__',
              '__ge__', '__gt__', '__le__', '__lt__'].indexOf(attr) > -1){
        // Apply to a Python copy of the JS list
        return function(){
            return jsobj2pyobj(_b_.list[attr].call(null,
                jsobj2pyobj(arguments[0]),
                ...Array.from(arguments).slice(1)))
        }
    }
    return function(){
        var js_list = arguments[0],
            t = jsobj2pyobj(js_list),
            args = [t]
        return _b_.list[attr].apply(null, args)
    }
}

$B.set_func_names(js_list_meta, 'builtins')


var js_list = $B.make_class('jslist')
js_list.__class__ = js_list_meta

js_list.__getattribute__ = function(_self, attr){
    if(_b_.list[attr] === undefined){
        // Methods of Python lists take precedence, but if they fail, try
        // attributes of _self Javascript prototype
        var proto = Object.getPrototypeOf(_self),
            res = proto[attr]
        if(res !== undefined){
            // pass _self as `this` if res is a function
            return jsobj2pyobj(res, _self)
        }
        if(_self.hasOwnProperty(attr)){ // issue 2172
            return $B.JSObj.$factory(_self[attr])
        }
        throw $B.attr_error(attr, _self)
    }
    return function(){
        var args = pyobj2jsobj(Array.from(arguments))
        return _b_.list[attr].call(null, _self, ...args)
    }
}

$B.set_func_names(js_list, 'builtins')

$B.JSObj = $B.make_class("JSObject",
    function(jsobj){
        if(Array.isArray(jsobj)){
            // Return a Python object that wraps the Javascript list
            jsobj.__class__ = js_list
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
function check_big_int(x, y){
    if(typeof x != "bigint" || typeof y != "bigint"){
        throw _b_.TypeError.$factory("unsupported operand type(s) for - : '" +
            $B.class_name(x) + "' and '" + $B.class_name(y) + "'")
    }
}

var js_ops = {
    __add__: function(_self, other){
        check_big_int(_self, other)
        return _self + other
    },
    __mod__: function(_self, other){
        check_big_int(_self, other)
        return _self % other
    },
    __mul__: function(_self, other){
        check_big_int(_self, other)
        return _self * other
    },
    __pow__: function(_self, other){
        check_big_int(_self, other)
        return _self ** other
    },
    __sub__: function(_self, other){
        check_big_int(_self, other)
        return _self - other
    }
}

for(var js_op in js_ops){
    $B.JSObj[js_op] = js_ops[js_op]
}

$B.JSObj.__bool__ = function(_self){
    if(typeof _self == 'object'){
        for(var key in _self){
            return true
        }
        return false
    }
    return !! _self
}

$B.JSObj.__dir__ = function(_self){
    return Object.keys(_self)
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

function jsclass2pyclass(js_class){
    // Create a Python class based on a Javascript class
    var proto = js_class.prototype,
        klass = $B.make_class(js_class.name)
    klass.__init__ = function(self){
        var args = pyargs2jsargs(Array.from(arguments).slice(1))
        var js_obj = new proto.constructor(...args)
        for(var attr in js_obj){
            _b_.dict.$setitem(self.__dict__, attr, $B.jsobj2pyobj(js_obj[attr]))
        }
        return _b_.None
    }
    klass.new = function(){
        var args = pyargs2jsargs(arguments)
        return $B.JSObj.$factory(new proto.constructor(...args))
    }
    var key, value
    for([key, value] of Object.entries(Object.getOwnPropertyDescriptors(proto))){
        if(key == 'constructor'){
            continue
        }
        if(value.get){
            var getter = (function(v){
                    return function(self){
                        return v.get.call(self.__dict__.$jsobj)
                    }
                })(value),
                setter = (function(v){
                    return function(self, x){
                        v.set.call(self.__dict__.$jsobj, x)
                    }
                })(value)
            klass[key] = _b_.property.$factory(getter, setter)
        }else{
            klass[key] = (function(m){
                return function(self){
                    var args = Array.from(arguments).slice(1)
                    return proto[m].apply(self.__dict__.$jsobj, args)
                }
            })(key)
        }
    }
    var js_parent = Object.getPrototypeOf(proto).constructor
    if(js_parent.toString().startsWith('class ')){
        var py_parent = jsclass2pyclass(js_parent)
        klass.__mro__ = [py_parent].concat(klass.__mro__)
    }
    var frame = $B.last($B.frames_stack)
    if(frame){
        $B.set_func_names(klass, frame[2])
    }
    return klass
}

$B.JSObj.__getattribute__ = function(_self, attr){
    var test = false // attr == "Rectangle"
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
    if(test){
        console.log('js_attr', js_attr, typeof js_attr,
            '\n is JS class ?', js_attr.toString().startsWith('class '))
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
    if(js_attr && js_attr.toString().startsWith('class ')){
        // Javascript class
        return jsclass2pyclass(js_attr)
    }else if(typeof js_attr === 'function'){
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
    var js_repr = Object.prototype.toString.call(_self)
    return `<Javascript object: ${js_repr}>`
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
    var body = `
    var _b_ = __BRYTHON__.builtins
    return function(){
        if(_b_.dict.$contains_string(cl_dict, '__init__')){
            var args = [this]
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(arguments[i])
            }
            _b_.dict.$getitem_string(cl_dict, '__init__').apply(this, args)
        }else{
            return new bases[0].$js_func(...arguments)
        }
    }`
    var new_js_class = Function('cl_dict', 'bases', body)(cl_dict, bases)
    new_js_class.prototype = Object.create(bases[0].$js_func.prototype)
    new_js_class.prototype.constructor = new_js_class
    new_js_class.__mro__ = [bases[0], _b_.type]
    new_js_class.__qualname__ = class_name
    new_js_class.$is_js_class = true
    return new_js_class
}

$B.set_func_names($B.JSMeta, "builtins")


})(__BRYTHON__)


