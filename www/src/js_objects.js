"use strict";

(function($B){

var _b_ = $B.builtins

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
            break
        default:
            $B.RAISE(_b_.TypeError, "keys must be str, int, " +
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
    }else if($B.exact_type(obj, _b_.float)){
        return obj.value
    }else if(obj === _b_.None){
        return null // _b_.None
    }else if(Array.isArray(obj) || $B.exact_type(obj, _b_.list) ||
            $B.exact_type(obj, _b_.tuple) ||
            $B.exact_type(obj, js_array)){
        let res = new Array(obj.length);
        for(var i = 0, len = obj.length; i < len; ++i){
            res[i] = $B.pyobj2structuredclone(obj[i]);
        }
        return res
    }else if($B.$isinstance(obj, _b_.dict)){
        if(strict){
            for(var key of $B.make_js_iterator(_b_.dict.keys(obj))){
                if(typeof key !== 'string'){
                    $B.RAISE(_b_.TypeError, "a dictionary with non-string " +
                        "keys does not support structured clone")
                }
            }
        }
        let res = {}
        for(var entry of $B.make_js_iterator(_b_.dict.items(obj))){
            res[to_simple(entry[0])] = $B.pyobj2structuredclone(entry[1])
        }
        return res
    }else if($B.exact_type(obj, $B.long_int)){
        return obj.value
    }else if(Object.getPrototypeOf(obj).constructor === Object){
        var res = {}
        for(var key in obj){
            res[key] = $B.pyobj2structuredclone(obj[key])
        }
        return res
    }else{
        return obj
    }
    $B.RAISE(_b_.TypeError, `cannot send '${$B.class_name(obj)}' object`)
}

$B.structuredclone2pyobj = function(obj){
    if(obj === null){
        return _b_.None
    }else if(obj === undefined){
        return $B.Undefined
    }else if(typeof obj == "boolean"){
        return obj
    }else if(typeof obj == "string" || obj instanceof String){
        return $B.String(obj)
    }else if(typeof obj == "number" || obj instanceof Number){
        obj += 0 // convert to primitive
        return Number.isInteger(obj) ?
                   obj :
                   {
                       ob_type: _b_.float,
                       value: obj
                   }
    }else if(Array.isArray(obj) || $B.exact_type(obj, _b_.list) ||
            $B.exact_type(obj, _b_.tuple)){
        let res = _b_.list.$factory()
        for(var i = 0, len = obj.length; i < len; i++){
            res.push($B.structuredclone2pyobj(obj[i]))
        }
        return res
    }else if(typeof obj == "object"){
        if(Object.getPrototypeOf(obj) === Object.prototype){
            if(! $B.$isinstance(obj, $B.JSObj)){
                return obj
            }
            // transform to Python dict
            let res = $B.empty_dict()
            for(var key in obj){
                _b_.dict.$setitem(res, key, $B.structuredclone2pyobj(obj[key]))
            }
            return res
        }else{
            return obj
        }
    }else{
        $B.RAISE(_b_.TypeError, _b_.str.$factory(obj) +
            " does not support the structured clone algorithm")
    }
}

const JSOBJ = $B.JSOBJ = Symbol('JSOBJ')
const PYOBJ = $B.PYOBJ = Symbol('PYOBJ')
const PYOBJFCT = Symbol('PYOBJFCT')
const PYOBJFCTS = Symbol('PYOBJFCTS')

var jsobj2pyobj = $B.jsobj2pyobj = function(jsobj, _this){
    // If _this is passed and jsobj is a function, the function is called
    // with built-in value `this` set to _this

    if(jsobj === null){
        return null
    }

    // Immutable types
    switch(typeof jsobj){
        case 'boolean':
            return jsobj

        case 'undefined':
            return $B.Undefined

        case 'number':
             // convert JS numbers with no decimal to a Python int
             if(jsobj % 1 === 0){
                 return Number.isSafeInteger(jsobj) ? jsobj : $B.fast_long_int(jsobj)
             }
             // other numbers to Python floats
             return _b_.float.$factory(jsobj)

        case 'bigint':
            return jsobj

        case 'string':
            return $B.String(jsobj)
    }

    if(Array.isArray(jsobj)){
        // set it as non-enumerable, prevents issues when looping on it in JS.
        try{
            Object.defineProperty(jsobj, "$is_js_array", {value: true});
        }catch(err){
            // ignore; cf. issue #2379
        }
        return jsobj
    }

    let pyobj = jsobj[PYOBJ]
    if(pyobj !== undefined) {
        return pyobj
    }

    // check if obj is an instance of Promise
    // cf. issue #2321
    if(jsobj instanceof Promise || typeof jsobj.then == "function"){
        return jsobj
    }

    if(typeof jsobj === "function"){
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
                try{
                    _this[PYOBJFCTS] = new Map()
                }catch(err){
                    // probably read-only, ignore
                }
            }
        }

        var res = function(){
            var args = new Array(arguments.length)
            for(var i = 0, len = arguments.length; i < len; ++i){
                var arg = arguments[i]
                if(arg !== null && arg.constructor === Object && arg.$kw){
                    console.log(Error().stack)
                    $B.RAISE(_b_.TypeError,
                        'keyword arguments are not supported for ' +
                        'Javascript functions')
                }
                args[i] = pyobj2jsobj(arg)
            }
            try{
                return jsobj2pyobj(jsobj.apply(_this, args))
            }catch(err){
                throw $B.exception(err)
            }
        }

        if(_this === null){
            jsobj[PYOBJFCT] = res;
        }else if(_this[PYOBJFCTS] !== undefined){
            _this[PYOBJFCTS].set(jsobj, res)
        }

        res[JSOBJ] = jsobj
        Object.defineProperty(res, '$js_func',
            {value: jsobj})
        Object.defineProperty(res, '$infos', {
            value: {
                __name__: jsobj.name,
                __qualname__: jsobj.name
            },
            writable: true
        })
        let value = []
        value[$B.func_attrs.name] = jsobj.name
        value[$B.func_attrs.qualname] = jsobj.name
        Object.defineProperty(res, '$function_infos',
            {
                value,
                writable: true
            }
        )

        return res
    }

    if(jsobj.$kw){
        return jsobj
    }

    if($B.$isNode(jsobj)){
        const res = $B.DOMNode.$factory(jsobj)
        jsobj[PYOBJ] = res
        res[JSOBJ] = jsobj
        return res
    }

    return jsobj
}

var pyobj2jsobj = $B.pyobj2jsobj = function(pyobj){
    // conversion of a Python object into a Javascript object
    // Immutable types
    switch(pyobj){
        case true:
        case false:
            return pyobj
        case $B.Undefined:
            return undefined
        case null:
            // javascript.NULL
            return null
    }

    let _jsobj = pyobj[JSOBJ]
    if(_jsobj !== undefined){
        return _jsobj
    }

    var klass = $B.get_class(pyobj)

    function has_type(cls, base){
        return cls === base || $B.get_mro(cls).includes(base)
    }

    if(has_type(klass, $B.DOMNode)){
        return pyobj
    }

    if(has_type(klass, _b_.list) || has_type(klass, _b_.tuple)){
        // Python list : transform its elements
        var jsobj = pyobj.map(pyobj2jsobj)
        jsobj[PYOBJ] = pyobj
        //jsobj.__class__ = js_array
        return jsobj
    }

    if(has_type(klass, _b_.dict)){
        // Python dictionaries are transformed into a Javascript object
        // whose attributes are the dictionary keys
        // Non-string keys are converted to strings by str(key). This will
        // affect Python dicts such as {"1": 'a', 1: "b"}, the result will
        // be the Javascript object {1: "b"}
        let jsobj = {}
        for(var entry of _b_.dict.$iter_items(pyobj)){
            var key = entry.key
            if(typeof key !== "string"){
                key = _b_.str.$factory(key)
            }
            if(typeof entry.value === 'function'){
                // set "this" to jsobj
                entry.value.bind(jsobj)
            }
            jsobj[key] = pyobj2jsobj(entry.value)
        }
        pyobj[JSOBJ] = jsobj
        return jsobj
    }
    if(has_type(klass, _b_.str)){
        // Python strings are converted to the underlying value
        return pyobj.valueOf()
    }

    if(klass === $B.long_int){
        return pyobj.value
    }

    if(has_type(klass, _b_.float)){
        // floats are implemented as
        // {__class__: _b_.float, value: <JS number>}
        return pyobj.value
    }

    if(klass === $B.function || klass === $B.method){
        if(typeof pyobj == 'function' && pyobj.prototype &&
                pyobj.prototype.constructor === pyobj &&
                ! pyobj.$function_infos){
            // pyobj is a Javascript constructor - this happens with
            // javascript.extends. Cf. issue #1439
            return pyobj
        }
        if(pyobj.$is_async){
            // issue 2251 : calling the Python async function in Javascript
            // returns a Promise
            let jsobj = function(){
                var res = pyobj.apply(null, arguments)
                return $B.coroutine.send(res)
            }

            pyobj[JSOBJ] = jsobj
            jsobj[PYOBJ] = pyobj

            return jsobj
        }
        // Transform into a Javascript function
        let jsobj = function(){
            try{
                // transform JS arguments to Python arguments
                var args = new Array(arguments.length)
                for(var i = 0; i < arguments.length; ++i){
                    args[i] = jsobj2pyobj(arguments[i])
                }
                // Apply Python arguments to Python function
                let res
                if(pyobj.prototype && pyobj.prototype.constructor === pyobj &&
                        ! pyobj.$function_infos){
                    res = new pyobj(...args)
                }else{
                    res = pyobj.apply(this, args)
                }
                // Return a Javascript result
                console.log('make jsobj from', res, 'arguments', arguments)
                return pyobj2jsobj(res)
            }catch(err){
                $B.handle_error(err)
            }
        }

        pyobj[JSOBJ] = jsobj
        jsobj[PYOBJ] = pyobj

        return jsobj
    }
    return pyobj
}

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
            $B.RAISE(_b_.TypeError,
                "A Javascript function can't take " +
                    "keyword arguments")
        }

        args[i] = $B.pyobj2jsobj(arg)

    }
    return args
}

$B.JSObj = $B.make_builtin_class("JSObject")

$B.JSObj.$factory = jsobj2pyobj

// Operations are implemented only for BigInt objects (cf. issue 1417)
function check_big_int(x, y){
    if(typeof x != "bigint" || typeof y != "bigint"){
        $B.RAISE(_b_.TypeError, "unsupported operand type(s) for - : '" +
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

$B.JSObj.__delitem__ = function(_self, key){
    delete _self[key]
    return _b_.None
}

$B.JSObj.__dir__ = function(_self){
    var attrs = Object.keys(_self);
    attrs = attrs.sort()
    return attrs
}

$B.JSObj.__eq__ = function(_self, other){
    switch(typeof _self){
        case "string":
            return _self == other
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
                if(! $B.rich_comp('__eq__', _self[key], other[key])){
                    return false
                }
            }
            return true
        case 'function':
            if(_self.$js_func && other.$js_func){
                return _self.$js_func === other.$js_func
            }
            return _self === other
        default:
            return _self === other
    }
}

var iterator = $B.make_builtin_class('js_iterator')

iterator.tp_iternext = function(_self){
    _self.counter++
    if(_self.counter == _self.length){
        $B.RAISE(_b_.StopIteration, '')
    }
    return _self.keys[_self.counter]
}

$B.set_func_names(iterator, 'builtins')

$B.JSObj.__hash__ = function(_self){
    // must not be the same object as object.__hash__ because, since
    // JSObj.__eq__ is not the same as object.__eq__, JSObj instances
    // would be unhashable
    return _b_.object.__hash__(_self)
}

$B.JSObj.tp_iter = function(_self){
    return {
        ob_type: iterator,
        keys: Object.keys(obj),
        values: Object.values(obj),
        length: Object.keys(obj).length,
        counter: -1
    }
}

$B.JSObj.__ne__ = function(_self, other){
    return ! $B.JSObj.__eq__(_self, other)
}

function jsclass2pyclass(js_class){
    // Create a Python class based on a Javascript class
    //console.log('jsclass', js_class)
    var proto = js_class.prototype,
        klass = $B.make_builtin_class(js_class.name)
    klass.tp_init = function(self){
        var args = pyargs2jsargs(Array.from(arguments).slice(1))
        var js_obj = new proto.constructor(...args)
        for(var attr in js_obj){
            _b_.dict.$setitem(self.dict, attr, $B.jsobj2pyobj(js_obj[attr]))
        }
        return _b_.None
    }
    klass.tp_new = function(){
        var args = pyargs2jsargs(arguments)
        return jsobj2pyobj(new proto.constructor(...args))
    }
    var key, value
    for([key, value] of Object.entries(Object.getOwnPropertyDescriptors(proto))){
        if(key == 'constructor'){
            continue
        }
        if(value.get){
            var getter = (function(v){
                    return function(self){
                        return v.get.call(self.dict.$jsobj)
                    }
                })(value)
            getter.$infos = {__name__: key}
            var setter
            if(value.set){
                setter = (function(v){
                        return function(self, x){
                            v.set.call(self.dict.$jsobj, x)
                        }
                    })(value)
                klass.dict[key] = _b_.property.$factory(getter, setter)
            }else{
                klass.dict[key] = _b_.property.$factory(getter)
            }

        }else{
            klass.dict[key] = (function(m){
                return function(self){
                    var args = Array.from(arguments).slice(1)
                    return proto[m].apply(self.dict.$jsobj, args)
                }
            })(key)
        }
    }
    for(var name of Object.getOwnPropertyNames(js_class)){
        klass.dict[name] = (function(k){
            return function(self){
                var args = Array.from(arguments).map(pyobj2jsobj)
                return js_class[k].apply(self, args)
            }
        })(name)
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

    $B.finalize_type(klass)
    return klass
}

$B.JSObj.tp_getattro = function(_self, attr){
    var test = false // attr == "new"
    if(test){
        console.log("__ga__", _self, attr)
    }
    if(attr == "new" && typeof _self == "function"){
        // constructor
        var new_func
        if(_self.$js_func){
            new_func = function(){
                var args = pyargs2jsargs(arguments)
                return new _self.$js_func(...args)
            }
        }else{
            new_func = function(){
                var args = pyargs2jsargs(arguments)
                return new _self(...args)
            }
        }
        Object.defineProperty(new_func, '$infos',
            {
                value: {
                    __name__: attr,
                    __qualname__: attr
                },
                writable: true
            }
        )
        let value = []
        value[$B.func_attrs.__name__] = attr
        value[$B.func_attrs.__qualname__] = attr
        Object.defineProperty(new_func, '$function_infos',
            {
                value,
                writable: true
            }
        )
        return new_func
    }
    var js_attr = _self[attr]
    if(js_attr == undefined && typeof _self == "function"){
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
                return jsobj2pyobj(res)
            }
        }
        var klass = $B.get_class(_self),
            class_attr = $B.$getattr(klass, attr, null)
        if(class_attr !== null){
            if(typeof class_attr == "function"){
                return function(){
                    var args = new Array(arguments.length + 1)
                    args[0] = _self;
                    for(var i = 0, len = arguments.length; i < len; i++){
                        args[i + 1] = arguments[i]
                    }
                    return jsobj2pyobj(class_attr.apply(null, args))
                }
            }else{
                return class_attr
            }
        }
        throw $B.attr_error(attr, _self)
    }
    if(js_attr !== null &&
            js_attr.toString &&
            typeof js_attr == 'function' &&
            js_attr.toString().startsWith('class ')){
        // Javascript class
        return jsclass2pyclass(js_attr)
    }else if(typeof js_attr === 'function'){
        // The second argument is the value passed as "this" when the JS
        // function is executed. If _self is a wrapper around a JS function,
        // pass the JS function, not the wrapper
        if(! js_attr.$infos && ! js_attr.$function_infos){
            js_attr.$js_func = js_attr
        }
        return jsobj2pyobj(js_attr, _self.$js_func || _self)
    }else{
        if(test){
            console.log('jsobj2pyobj on', js_attr)
        }
        var res = jsobj2pyobj(js_attr)
        if(test){
            console.log('    res', res)
        }
        return res
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
                $B.RAISE(_b_.KeyError, err.name)
            }
            throw err
        }
    }else if(typeof key == "number"){
        if(_self[key] !== undefined){
            return jsobj2pyobj(_self[key])
        }
        if(typeof _self.length == 'number'){
            if((typeof key == "number" || typeof key == "boolean") &&
                    typeof _self.item == 'function'){
                var rank = _b_.int.$factory(key)
                if(rank < 0){
                    rank += _self.length
                }
                let res = _self.item(rank)
                if(res === null){
                    $B.RAISE(_b_.IndexError, rank)
                }
                return jsobj2pyobj(res)
            }
        }
    }else if($B.exact_type(key, _b_.slice) &&
            typeof _self.item == 'function'){
        var _slice = _b_.slice.$conv_for_seq(key, _self.length)
        let res = new Array(Math.floor((_slice.stop - _slice.start) / _slice.step))
        let offset = 0
        for(var i = _slice.start; i < _slice.stop; i += _slice.step){
            res[offset++] = _self.item(i)
        }
        return res
    }
    $B.RAISE(_b_.KeyError, key)
}

$B.JSObj.__setitem__ = $B.JSObj.__setattr__

$B.JSObj.tp_repr = function(_self){
    if(typeof _self == 'number'){
        return _self + ''
    }
    if(typeof _self == 'function' && _self.$js_func.name &&
            globalThis[_self.$js_func.name] === _self.$js_func){
        return `<function window.${_self.$js_func.name}>`
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
            if(err.ob_type !== undefined){
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
    Object.defineProperty(_self, '$brython_events',
        {
            value: _self.$brython_events || {},
            writable: true
        }
    )
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
                _self.removeEventListener(evt, events[i][1])
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
    if(typeof _self == 'function'){
        $B.RAISE(_b_.TypeError,
            "method 'to_dict()' not supported for functions")
    }
    var res = $B.empty_dict()
    for(var key in _self){
        _b_.dict.$setitem_string(res, key, convert_to_python(_self[key]))
    }
    return res
}

function convert_to_python(obj){
    // same as pyobj2jsobj but
    // - converts Array to list and converts its items
    // - converts "raw" Object to dict and converts its values
    if(obj === null || obj === undefined){
        return $B.jsobj2pyobj(obj)
    }
    if(obj.ob_type){
        // already a Python object
        return obj
    }
    if(Array.isArray(obj)){
        return obj.map(convert_to_python)
    }
    if($B.$isinstance(obj, $B.JSObj)){
        if(typeof obj == 'number'){
            // float
            return $B.fast_float(obj)
        }
        var res = $B.empty_dict()
        for(var key in obj){
            _b_.dict.$setitem_string(res, key, convert_to_python(obj[key]))
        }
        return res
    }
    return $B.jsobj2pyobj(obj)
}

$B.set_func_names($B.JSObj, "builtins")

var js_list_meta = $B.make_builtin_class('js_list_meta')

js_list_meta.tp_getattro = function(_self, attr){

    if(_b_.list[attr] === undefined){
        if(js_array.hasOwnProperty(attr)){
            return js_array[attr]
        }
        $B.RAISE_ATTRIBUTE_ERROR(
            `${$B.class_name(_self)} has no attribute '${attr}'`, _self, attr)
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
    }else if(['__contains__', '__eq__', '__getitem__',
              '__ge__', '__gt__', '__le__', '__lt__'].indexOf(attr) > -1){
        // Apply to a Python copy of the JS list
        return function(){
            var pylist = $B.$list(arguments[0].map(jsobj2pyobj))
            return jsobj2pyobj(_b_.list[attr].call(null,
                pylist,
                ...Array.from(arguments).slice(1)))
        }
    }else if(js_array.hasOwnProperty(attr)){
        return js_array[attr]
    }else if(['__repr__', '__str__'].includes(attr)){
        return function(js_array){
            var t = jsobj2pyobj(js_array)
            return _b_.list[attr]($B.$list(t))
        }
    }
    return function(js_array){
        var t = jsobj2pyobj(js_array)
        return _b_.list[attr](t)
    }
}

$B.set_func_names(js_list_meta, 'builtins')


$B.SizedJSObj = $B.make_builtin_class('SizedJavascriptObject', [$B.JSObj])

$B.SizedJSObj.sq_length = function(_self){
    return _self.length
}

$B.set_func_names($B.SizedJSObj, 'builtins')

$B.IterableJSObj = $B.make_builtin_class('IterableJavascriptObject', [$B.JSObj])

$B.IterableJSObj.__contains__ = function(self, key){
    if(self.contains !== undefined && typeof self.contains == 'function'){
        return self.contains(key)
    }else{
        for(var item of $B.IterableJSObj.__iter__(self).it){
            if($B.is_or_equals(item, key)){
                return true
            }
        }
        return false
    }
}

$B.IterableJSObj.tp_iter = function(_self){
    return {
        ob_type: $B.IterableJSObj,
        it: _self[Symbol.iterator]()
    }
}

$B.IterableJSObj.sq_length = function(_self){
    return _self.length
}

$B.IterableJSObj.tp_iternext = function(_self){
    var value = _self.it.next()
    if(! value.done){
        return jsobj2pyobj(value.value)
    }
    $B.RAISE(_b_.StopIteration, '')
}

$B.set_func_names($B.IterableJSObj, 'builtins')


var js_array = $B.js_array = $B.make_builtin_class('JavascriptArray',
    [$B.JSObj])
js_array.ob_type = js_list_meta

js_array.__add__ = function(_self, other){
    var res = _self.slice()
    if($B.$isinstance(other, js_array)){
        return _self.slice().concat(other)
    }
    for(var item of $B.make_js_iterator(other)){
        res.push(pyobj2jsobj(item))
    }
    return res
}

js_array.__delitem__ = function(_self, key){
    _self.splice(key, 1)
}

js_array.__eq__ = function(_self, other){
    if($B.$isinstance(other, _b_.list)){
        return _b_.list.__eq__($B.$list(_self.map(jsobj2pyobj)), other)
    }else if(other.$is_js_array){
        if(_self.length != other.length){
            return false
        }
        for(var i = 0, len = _self.length; i <len; i++){
            if(_self[i] != other[i]){
                return false
            }
        }
        return true
    }
    return _b_.NotImplemented
}

js_array.__ge__ = function(_self, other){
    return js_array.__le__(other, _self)
}

js_array.__gt__ = function(_self, other){
    return js_array.__lt__(other, _self)
}

js_array.__le__ = function(self, other){
    if($B.$isinstance(other, _b_.list)){
        return _b_.list.__le__($B.$list(_self.map(jsobj2pyobj)), other)
    }else if(other.$is_js_array){
        var i = 0
        // skip all items that compare equal
        while(i < _self.length && i < other.length &&
                _self[i] == other[i]){
            i++
        }
        if(i == _self.length){
            // [1] <= [1, 2] is True
            return _self.length <= other.length
        }
        if(i == other.length){
            // [1, 2] <= [1] is false
            return false
        }
        // First different item: [1, x] <= [1, y] is x <= y
        return _self[i] <= other[i]
    }
    return _b_.NotImplemented
}

js_array.__lt__ = function(_self, other){
    if($B.$isinstance(other, _b_.list)){
        return _b_.list.__lt__($B.$list(_self.map(jsobj2pyobj)), other)
    }else if(other.$is_js_array){
        var i = 0
        // skip all items that compare equal
        while(i < _self.length && i < other.length &&
                _self[i] == other[i]){
            i++
        }
        if(i == _self.length){
            // [1] < [1, 2] is True
            return _self.length < other.length
        }
        if(i == other.length){
            // [1, 2] < [1] is false
            return false
        }
        // First different item: [1, x] < [1, y] is x < y
        return self[i] <= other[i]
    }
    return _b_.NotImplemented
}

js_array.tp_getattro = function(_self, attr){
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
            return jsobj2pyobj(_self[attr])
        }
        if(js_array.hasOwnProperty(attr)){
            return js_array[attr]
        }
        throw $B.attr_error(attr, _self)
    }
    if(js_array.hasOwnProperty(attr)){
        return function(){
            return js_array[attr](_self, ...arguments)
        }
    }
    return function(){
        var args = pyobj2jsobj(Array.from(arguments))
        return _b_.list[attr].call(null, _self, ...args)
    }
}

js_array.__getitem__ = function(_self, i){
    i = $B.PyNumber_Index(i)
    return jsobj2pyobj(_self[i])
}

js_array.__iadd__ = function(_self, other){
    if($B.$isinstance(other, js_array)){
        for(var item of other){
            _self.push(item)
        }
    }else{
        for(var item of $B.make_js_iterator(other)){
            _self.push($B.pyobj2jsobj(item))
        }
    }
    return _self
}

js_array.tp_iter = function(_self){
    return js_array_iterator.$factory(_self)
}

js_array.__mul__ = function(_self, nb){
    var res = _self.slice()
    for(var i = 1; i < nb; i++){
        res = res.concat(_self)
    }
    return res
}

var js_array_iterator = $B.make_builtin_class('JSArray_iterator')

js_array_iterator.$factory = function(obj){
    return {
        ob_type: js_array_iterator,
        it: obj[Symbol.iterator]()
    }
}

js_array_iterator.tp_iternext = function(_self){
    var v = _self.it.next()
    if(v.done){
        $B.RAISE(_b_.StopIteration, '')
    }
    return jsobj2pyobj(v.value)
}

$B.set_func_names(js_array_iterator, 'builtins')


js_array.__iter__ = function(_self){
    return js_array_iterator.$factory(_self)
}

js_array.__radd__ = function(_self, other){
    var res = other.slice()
    if($B.$isinstance(other, js_array)){
        res = res.concat(_self)
        return res
    }
    for(var item of _self){
        res.push($B.jsobj2pyobj(item))
    }
    res.ob_type = $B.get_class(other)
    return res
}

js_array.tp_repr = function(_self){
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

js_array.append = function(_self, x){
    _self.push(pyobj2jsobj(x))
    if(_self[PYOBJ]){
        _self[PYOBJ].push(x)
    }
    return _b_.None
}

$B.set_func_names(js_array, 'javascript')

$B.get_jsobj_class = function(obj){
    if(typeof obj == 'function'){
        return $B.JSObj
    }
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
$B.JSMeta = $B.make_builtin_class("JSMeta", [_b_.type])

$B.JSMeta.tp_call = function(cls){
    // Create an instance of a class that inherits a Javascript contructor
    console.log('create', cls)
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

$B.JSMeta.tp_getattro = function(cls, attr){
    if(cls[attr] !== undefined){
        return cls[attr]
    }else if($B.JSMeta[attr] !== undefined){
        if(attr == '__new__'){
            return function(){
                var res = new cls.$js_func(...Array.from(arguments).slice(1))
                res.ob_type = cls
                return res
            }
        }
        return $B.JSMeta[attr]
    }else{
        // Search in type
        return _b_.type.__getattribute__(cls, attr)
    }
}

$B.JSMeta.__init_subclass__ = function(){
    // do nothing
}

$B.JSMeta.tp_new = function(metaclass, class_name, bases, cl_dict){
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
    var proto = bases[0].$js_func.prototype
    if(proto instanceof Node){
        $B.RAISE(_b_.TypeError, `class ${class_name} cannot inherit ` +
            `a subclass of Node`)
    }
    var new_js_class = Function('cl_dict', 'bases', body)(cl_dict, bases)
    new_js_class.prototype = Object.create(bases[0].$js_func.prototype)
    new_js_class.prototype.constructor = new_js_class
    Object.defineProperty(new_js_class, '$js_func',
                          {value: bases[0].$js_func})
    new_js_class.ob_type = $B.JSMeta
    new_js_class.tp_bases = [bases[0]]
    new_js_class.__mro__ = [bases[0], _b_.object]
    new_js_class.__qualname__ = new_js_class.__name__ = class_name
    new_js_class.$is_js_class = true
    for(var item of _b_.dict.$iter_items(cl_dict)){
        new_js_class[item.key] = item.value
    }
    return new_js_class
}

$B.set_func_names($B.JSMeta, "builtins")


})(__BRYTHON__);


