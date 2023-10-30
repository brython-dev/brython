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
        var res = new Array(obj.length);
        for(var i = 0, len = obj.length; i < len; ++i){
            res[i] = $B.pyobj2structuredclone(obj[i]);
        }
        return res
    }else if($B.$isinstance(obj, _b_.dict)){
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
        var args = new Array(arguments.length+1)
        args[0] = null
        for(var i = 0, len = arguments.length; i < len; i++){
            args[i+1] = pyobj2jsobj(arguments[i])
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
            var args = new Array(arguments.length+1)
            args[0] = null
            for(var i = 0, len = arguments.length; i < len; i++){
                args[i+1] = pyobj2jsobj(arguments[i])
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

const JSOBJ = $B.SYMBOL_JSOBJ;
const PYOBJ = $B.SYMBOL_PYOBJ;

const JSOBJ_FCT = $B.SYMBOL_PY2JS_WRAPPER;
const PYOBJ_FCT = $B.SYMBOL_JS2PY_WRAPPER;

const PYOBJFCT = Symbol()
const PYOBJFCTS = Symbol()

//TODO: optimize unwrap...
$B.addJS2PyWrapper(Boolean, function(jsobj){
	return jsobj;
});
$B.addJS2PyWrapper(Number, function(jsobj){
	if(jsobj % 1 === 0){ //TODO: DANGEROUS! It can also be a float with no decimals.
           return _b_.int.$factory(jsobj)
       }
       // for now, lets assume a float
       return _b_.float.$factory(jsobj)
});



$B.addPy2JSWrapper(_b_.float, function(pyobj) {

        // floats are implemented as
        // {__class__: _b_.float, value: <JS number>}
        return pyobj.value // dangerous => can be later converted as int when browser fetch it back.
});

$B.addJS2PyWrapper(String, function(jsobj){ //TODO: move 2 py_str ?
	return $B.String(jsobj);
});
$B.addJS2PyWrapper(Function, function(jsobj, _this) {
	
        // transform Python arguments to equivalent JS arguments
        _this = _this === undefined ? null : _this
        
        if(_this === null){
            const pyobj = jsobj[PYOBJFCT];
            if(pyobj !== undefined){
                return pyobj
            }
        }else{
            const pyobjfcts = _this[PYOBJFCTS]
            if(pyobjfcts !== undefined) {
                const pyobj = pyobjfcts.get(jsobj)
                if(pyobj !== undefined){
                    return pyobj
                }
            }else{
                _this[PYOBJFCTS] = new Map()
            }
        }
        
        var res = function(){
            var args = new Array(arguments.length)
            for(var i = 0, len = arguments.length; i < len; ++i){
                args[i] = pyobj2jsobj(arguments[i])
            }
            try{
                return jsobj2pyobj(jsobj.apply(_this, args))
            }catch(err){
                throw $B.exception(err)
            }
        }
        
        if(_this === null){
            jsobj[PYOBJFCT] = res;
        }else{
            _this[PYOBJFCTS].set(jsobj, res)
        }
        
        res[JSOBJ] = jsobj
        res.$js_func = jsobj
        res.$is_js_func = true
        res.$infos = {
            __name__: jsobj.name,
            __qualname__: jsobj.name
        }
        return res
});

$B.addPy2JSWrapper(JSConstructor, function(pyobj) {
	// Instances of JSConstructor are transformed into the
        // underlying Javascript object

        if(pyobj.js_func !== undefined){
            return pyobj.js_func
        }
        return pyobj.js
});

function convertMethodsOrFunctions(pyobj, _this) {
        if(pyobj.prototype &&
                pyobj.prototype.constructor === pyobj &&
                ! pyobj.$is_func){
            // pyobj is a Javascript constructor - this happens with
            // javascript.extends. Cf. issue #1439
            return pyobj
        }
        if(pyobj.$is_async){
            // issue 2251 : calling the Python async function in Javascript
            // returns a Promise
            const jsobj = function(){
                var res = pyobj.apply(null, arguments)
                return $B.coroutine.send(res)
            }
            
            pyobj[JSOBJ] = jsobj
            jsobj[PYOBJ] = pyobj
            
            return jsobj
        }
        // Transform into a Javascript function
        const jsobj = function(){
            try{
                // transform JS arguments to Python arguments
                var args = new Array(arguments.length)
                for(var i = 0; i < arguments.length; ++i){
                    args[i] = jsobj2pyobj(arguments[i])
                }
                // Apply Python arguments to Python function
                if(pyobj.prototype.constructor === pyobj && ! pyobj.$is_func){
                    var res = new pyobj(...args)
                }else{
                    var res = pyobj.apply(this, args)
                }
                // Return a Javascript result
                return pyobj2jsobj(res)
            }catch(err){
                $B.handle_error(err)
            }
        }
        
        pyobj[JSOBJ] = jsobj
        jsobj[PYOBJ] = pyobj
        
        return jsobj
}

$B.addPy2JSWrapper($B.function, convertMethodsOrFunctions);
$B.addPy2JSWrapper($B.method  , convertMethodsOrFunctions);

$B.addJS2PyWrapper(Object, function(jsobj, _this) { //TODO: exclude isNode...

    if(jsobj.$kw){ // we really shouldn't be doing that...
        return jsobj
    }

    const _res = $B.JSObj.$factory(jsobj)
    jsobj[PYOBJ] = _res
    _res[JSOBJ] = jsobj
    
    return _res;
});

var jsobj2pyobj = $B.jsobj2pyobj = function(jsobj, _this){	
    // If _this is passed and jsobj is a function, the function is called
    // with built-in value `this` set to _this
    
    // handle undefined and null first => cause issues...
    if(jsobj === undefined)
        return $B.Undefined;
    if(jsobj === null)
        return null;
    
    const pyobj = jsobj[PYOBJ];
    if(pyobj !== undefined)
    	return pyobj;
    
    return jsobj[PYOBJ_FCT](jsobj, _this);
}

var pyobj2jsobj = $B.pyobj2jsobj = function(pyobj){
    // conversion of a Python object into a Javascript object
    
    // handle undefined and null first => cause issues...
    if(pyobj === $B.Undefined)
        return undefined
    
    if( ! (pyobj instanceof Object) ) // not a python type (not even an object)...
    	return pyobj;
    
    const klass = $B.get_class(pyobj)
    if(klass === undefined){
        // not a Python object, consider arg as Javascript object instead
        return pyobj
    }
    
    let jsobj = pyobj[JSOBJ]
    if(jsobj !== undefined)
        return jsobj

    const mro = klass.__mro__;
    let jsobj_fct = klass[JSOBJ_FCT];
    let offset = 0;
    while ( jsobj_fct === undefined && offset < mro.length ) {
    	jsobj_fct = mro[offset++][JSOBJ_FCT];
    } 
    
    if(jsobj_fct !== undefined)
    	return jsobj_fct(pyobj);
    
    return pyobj // no convertion known...
}

$B.JSConstructor = JSConstructor

function pyargs2jsargs(pyargs){
    var args = new Array(pyargs.length);
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
        }
        
        args[i] = $B.pyobj2jsobj(arg)

    }
    return args
}

$B.JSObj = $B.make_class("JSObject",
    function(jsobj){
        if(Array.isArray(jsobj)){
            // Set a Brython-specific attribute to identify JS Arrays that
            // come from JS code. Cf. discussion #2226
            jsobj.$is_js_array = true
        }else if(typeof jsobj == "function"){
            return jsobj2pyobj(jsobj)
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

$B.JSObj.__contains__ = function(_self, key){
    return key in _self
}

$B.JSObj.__dir__ = function(_self){
    var attrs = Object.keys(_self);
    attrs = attrs.sort()
    return attrs
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
        case 'function':
            if(_self.$is_js_func && other.$is_js_func){
                return _self.$js_func === other.$js_func
            }
            return _self === other
        default:
            return _self === other
    }
}

var iterator = $B.make_class('js_iterator',
    function(obj){
        return {
            __class__: iterator,
            keys: Object.keys(obj),
            values: Object.values(obj),
            length: Object.keys(obj).length,
            counter: -1
        }
    }
)

iterator.__next__ = function(_self){
    _self.counter++
    if(_self.counter == _self.length){
        throw _b_.StopIteration.$factory('')
    }
    return _self.keys[_self.counter]
}

$B.set_func_names(iterator, 'builtins')

$B.JSObj.__iter__ = function(_self){
    return iterator.$factory(_self)
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
    var frame = $B.frame_obj.frame
    if(frame){
        $B.set_func_names(klass, frame[2])
    }
    return klass
}

$B.JSObj.__getattribute__ = function(_self, attr){
    var test = false // attr == "Date"
    if(test){
        console.log("__ga__", _self, attr)
    }
    if(attr == "new" && typeof _self == "function"){
        // constructor
        var new_func
        if(_self.$js_func){
            new_func = function(){
                var args = pyargs2jsargs(arguments)
                return $B.JSObj.$factory(new _self.$js_func(...args))
            }
        }else{
            new_func = function(){
                var args = pyargs2jsargs(arguments)
                return $B.JSObj.$factory(new _self(...args))
            }
        }
        new_func.$infos = {
            __name__: attr,
            __qualname__: attr
        }
        return new_func
    }
    var js_attr = _self[attr]
    if(js_attr == undefined && typeof _self == "function" && _self.$js_func){
        js_attr = _self.$js_func[attr]
    }
    if(test){
        console.log('js_attr', js_attr, typeof js_attr,
            '\n is JS class ?', js_attr === undefined ? false :
            js_attr.toString().startsWith('class '))
    }
    if(js_attr === undefined){
        if(typeof _self == 'object' && attr in _self){
            // attr is in _self properties (possibly inherited) and the value
            // is `undefined`
            return $B.Undefined
        }
        if(typeof _self.getNamedItem == 'function'){
            var res = _self.getNamedItem(attr)
            if(res !== undefined){
                return $B.JSObj.$factory(res)
            }
        }
        var klass = $B.get_class(_self),
            class_attr = $B.$getattr(klass, attr, null)
        if(class_attr !== null){
            if(typeof class_attr == "function"){
                return function(){
                    var args = new Array(arguments.length+1);
                    args[0] = _self;
                    for(var i = 0, len = arguments.length; i < len; i++){
                        args[i+1] = arguments[i];
                    }
                    return $B.JSObj.$factory(class_attr.apply(null, args))
                }
            }else{
                return class_attr
            }
        }
        throw $B.attr_error(attr, _self)
    }
    if(js_attr !== null &&
            js_attr.toString &&
            typeof js_attr.toString == 'function' &&
            js_attr.toString().startsWith('class ')){
        // Javascript class
        return jsclass2pyclass(js_attr)
    }else if(typeof js_attr === 'function'){
        // The second argument is the value passed as "this" when the JS
        // function is executed. If _self is a wrapper around a JS function,
        // pass the JS function, not the wrapper
        return jsobj2pyobj(js_attr, _self.$js_func || _self)
    }else{
        if(test){
            console.log('use JSObj.$factory on', js_attr)
        }
        return $B.JSObj.$factory(js_attr)
    }
}

$B.JSObj.__setattr__ = function(_self, attr, value){
    _self[attr] = $B.pyobj2jsobj(value)
    return _b_.None
}

$B.JSObj.__getitem__ = function(_self, key){
    if(typeof key == "string"){
        try{
            return $B.JSObj.__getattribute__(_self, key)
        }catch(err){
            if($B.is_exc(err, [_b_.AttributeError])){
                throw _b_.KeyError.$factory(err.name)
            }
            throw err
        }
    }else if(typeof key == "number"){
        if(_self[key] !== undefined){
            return $B.JSObj.$factory(_self[key])
        }
        if(typeof _self.length == 'number'){
            if((typeof key == "number" || typeof key == "boolean") &&
                    typeof _self.item == 'function'){
                var rank = _b_.int.$factory(key)
                if(rank < 0){
                    rank += _self.length
                }
                var res = _self.item(rank)
                if(res === null){
                    throw _b_.IndexError.$factory(rank)
                }
                return $B.JSObj.$factory(res)
            }
        }
    }else if(key.__class__ === _b_.slice &&
            typeof _self.item == 'function'){
        var _slice = _b_.slice.$conv_for_seq(key, _self.length)
        var res = new Array( Math.floor( (_slice.stop - _slice.start) / _slice.step) );
        let offset = 0;
        for(var i = _slice.start; i < _slice.stop; i += _slice.step){
            res[offset++] = _self.item(i);
        }
        return res
    }
    throw _b_.KeyError.$factory(key)
}

$B.JSObj.__setitem__ = $B.JSObj.__setattr__

$B.JSObj.__repr__ = $B.JSObj.__str__ = function(_self){
    if(typeof _self == 'number'){
        return _self + ''
    }
    var js_repr = Object.prototype.toString.call(_self)
    return `<Javascript object: ${js_repr}>`
}

$B.JSObj.bind = function(_self, evt, func){
    // "bind" is an alias for "addEventListener"
    var js_func = function(ev) {
        try{
            return func(jsobj2pyobj(ev))
        }catch(err){
            if(err.__class__ !== undefined){
                $B.handle_error(err)
            }else{
                try{
                    $B.$getattr($B.get_stderr(), "write")(err)
                }catch(err1){
                    console.log(err)
                }
            }
        }
    }
    _self.$brython_events = _self.$brython_events || {}
    if(_self.$brython_events){
        _self.$brython_events[evt] = _self.$brython_events[evt] || []
        _self.$brython_events[evt].push([func, js_func])
    }
    _self.addEventListener(evt, js_func)
    return _b_.None
}

$B.JSObj.bindings = function(_self){
    var res = $B.empty_dict()
    if(_self.$brython_events){
        for(var key in _self.$brython_events){
            _b_.dict.$setitem(res, key,
                $B.fast_tuple(_self.$brython_events[key].map(x => x[0])))
        }
    }
    return res
}

$B.JSObj.unbind = function(_self, evt, func){
    if(! _self.$brython_events){
        return _b_.None
    }
    if(! _self.$brython_events[evt]){
        return _b_.None
    }
    var events = _self.$brython_events[evt]
    if(func === undefined){
        // remove all event listeners for the event
        for(var item of events){
            _self.removeEventListener(evt, item[1])
        }
        delete _self.$brython_events[evt]
    }else{
        for(var i = 0, len = events.length; i < len; i++){
            if(events[i][0] === func){
                events.splice(i, 1)
            }
        }
        if(events.length == 0){
            delete _self.$brython_events[evt]
        }
    }
}

$B.JSObj.to_dict = function(_self){
    // Returns a Python dictionary based on the underlying Javascript object
    return $B.structuredclone2pyobj(_self)
}

$B.set_func_names($B.JSObj, "builtins")

var js_list_meta = $B.make_class('js_list_meta')
js_list_meta.__mro__ = [_b_.type, _b_.object]

js_list_meta.__getattribute__ = function(_self, attr){
    if(_b_.list[attr] === undefined){
        throw _b_.AttributeError.$factory(attr)
    }
    if(js_array[attr]){
        return js_array[attr]
    }
    if(['__delitem__', '__setitem__'].indexOf(attr) > -1){
        // Transform Python values to Javascript values before setting item
        return function(){
            var args = new Array(arguments.length)
            args[0] = arguments[0]
            for(var i = 1, len = arguments.length; i < len; i++){
                args[i] = pyobj2jsobj(arguments[i])
            }
            return _b_.list[attr].apply(null, args)
        }
    }else if(['__add__', '__contains__', '__eq__', '__getitem__', '__mul__',
              '__ge__', '__gt__', '__le__', '__lt__'].indexOf(attr) > -1){
        // Apply to a Python copy of the JS list
        return function(){
            var pylist = $B.$list(arguments[0].map(jsobj2pyobj))
            return jsobj2pyobj(_b_.list[attr].call(null,
                pylist,
                ...Array.from(arguments).slice(1)))
        }
    }
    return function(){
        var js_array = arguments[0],
            t = jsobj2pyobj(js_array),
            args = [t]
        return _b_.list[attr].apply(null, args)
    }
}

$B.set_func_names(js_list_meta, 'builtins')

var js_array = $B.js_array = $B.make_class('Array')
js_array.__class__ = js_list_meta
js_array.__mro__ = [$B.JSObj, _b_.object]


js_array.__getattribute__ = function(_self, attr){
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

js_array.__getitem__ = function(_self, i){
    i = $B.PyNumber_Index(i)
    return $B.jsobj2pyobj(_self[i])
}

js_array.__repr__ = function(_self){
    if($B.repr.enter(_self)){ // in py_utils.js
        return '[...]'
    }
    var _r = new Array(_self.length),
        res

    for(var i = 0; i < _self.length; ++i){
        _r[i] = _b_.str.$factory(_self[i])
    }

    res = "[" + _r.join(", ") + "]"
    $B.repr.leave(_self)
    return res
}

$B.set_func_names(js_array, 'javascript')

$B.SizedJSObj = $B.make_class('SizedJavascriptObject')
$B.SizedJSObj.__bases__ = [$B.JSObj]
$B.SizedJSObj.__mro__ = [$B.JSObj, _b_.object]

$B.SizedJSObj.__len__ = function(_self){
    return _self.length
}

$B.set_func_names($B.SizedJSObj, 'builtins')

$B.IterableJSObj = $B.make_class('IterableJavascriptObject')
$B.IterableJSObj.__bases__ = [$B.JSObj]
$B.IterableJSObj.__mro__ = [$B.JSObj, _b_.object]

$B.IterableJSObj.__iter__ = function(_self){
    return {
        __class__: $B.IterableJSObj,
        it: obj[Symbol.iterator]()
    }
}

$B.IterableJSObj.__len__ = function(_self){
    return _self.length
}

$B.IterableJSObj.__next__ = function(_self){
    var value = _self.it.next()
    if(! value.done){
        return jsobj2pyobj(value.value)
    }
    throw _b_.StopIteration.$factory('')
}

$B.set_func_names($B.IterableJSObj, 'builtins')

$B.get_jsobj_class = function(obj){
    var proto = Object.getPrototypeOf(obj)
    if(proto === null){
        return $B.JSObj
    }
    if(proto[Symbol.iterator] !== undefined){
        return $B.IterableJSObj
    }else if(Object.getOwnPropertyNames(proto).indexOf('length') > -1){
        return $B.SizedJSObj
    }
    return $B.JSObj
}
// Class used as a metaclass for Brython classes that inherit a Javascript
// constructor
$B.JSMeta = $B.make_class("JSMeta")

$B.JSMeta.__call__ = function(cls){
    // Create an instance of a class that inherits a Javascript contructor
    var extra_args = new Array(arguments.length-1),
        klass = arguments[0]
    for(var i = 1, len = arguments.length; i < len; i++){
        extra_args[i-1] = arguments[i]
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
    new_js_class.$js_func = bases[0].$js_func
    new_js_class.__class__ = $B.JSMeta
    new_js_class.__bases__ = [bases[0]]
    new_js_class.__mro__ = [bases[0], _b_.type]
    new_js_class.__qualname__ = new_js_class.__name__ = class_name
    new_js_class.$is_js_class = true
    return new_js_class
}

$B.set_func_names($B.JSMeta, "builtins")


})(__BRYTHON__)


