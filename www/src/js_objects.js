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
            for(var entry of _b_.dict.$iter_items(obj)){
                if(typeof entry.key !== 'string'){
                    $B.RAISE(_b_.TypeError, "a dictionary with non-string " +
                        "keys does not support structured clone")
                }
            }
        }
        let res = {}
        for(var entry of _b_.dict.$iter_items(obj)){
            res[to_simple(entry.key)] = $B.pyobj2structuredclone(entry.value)
        }
        return res
    }else if($B.is_big_int(obj)){
        return $B.int_value(obj)
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

function* f(){}

var Generator = Object.getPrototypeOf(f())

var JSGenerator = $B.make_builtin_class('JavascriptGenerator')

JSGenerator.$factory = function(js_gen){
    return {
        ob_type: JSGenerator,
        dict: $B.empty_dict,
        js_gen
    }
}

JSGenerator.tp_iter = function(self){
    return self
}

JSGenerator.tp_iternext = function*(self){
    for(var item of self.js_gen){
        yield jsobj2pyobj(item)
    }
}

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
                 return jsobj
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

    if(jsobj.constructor === Generator.constructor){
        return JSGenerator.$factory(jsobj)
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

    if($B.is_big_int(pyobj)){
        return $B.int_value(pyobj)
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
                return $B.coroutine.tp_funcs.send(res)
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
                    if(klass === $B.function){
                        res = pyobj.apply(this, args)
                    }else{
                        // method
                        res = pyobj.im_func.call(this, pyobj.im_self, ...args)
                    }
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
    return pyobj
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

function pyargs2jsargs(pyargs){
    var args = new Array(pyargs.length);
    for(var i = 0, len = pyargs.length; i < len; i++){
        var arg = pyargs[i]
        if(arg !== undefined && arg !== null &&
                arg.$kw !== undefined &&
                ! $B.keyword_is_empty(arg.$kw)){
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

$B.JSClass = $B.make_builtin_class('JSClass', [_b_.type])

$B.JSClass.tp_getattro = function(self, attr){
    if(attr == 'new'){
        return function(){
            var args = Array.from(arguments).map(pyobj2jsobj)
            return jsobj2pyobj(new self.js_class(...args))
        }
    }
    if(! self.js_class.hasOwnProperty(attr)){
        return $B.NULL
    }
    return jsobj2pyobj(self.jsobj[attr], self.jsobj)
}

$B.JSClass.tp_new = function(cls, args, kw){
    var [name, bases, dict] = args
    var cls = {
        ob_type: cls,
        tp_name: name,
        tp_bases: bases,
        dict
    }
    cls.tp_mro = $B.make_mro(cls)
    cls.js_class = cls.tp_bases[0].js_class
    return cls
}

function jsclass2pyclass(js_class){
    // Create a Python class based on a Javascript class
    var cls = {
        ob_type: $B.JSClass,
        dict: $B.empty_dict(),
        tp_bases: [],
        tp_name: js_class.name,
        js_class
    }
    cls.tp_mro = $B.make_mro(cls)
    $B.str_dict_set(cls.dict, '__new__',
        function(klass, ...args){
            return {
                ob_type: klass,
                dict: $B.empty_dict()
            }
        }
    )
    $B.str_dict_set(cls.dict, '__init__',
        function(self, ...args){
            self.jsobj = new cls.js_class(...args)
        }
    )
    $B.str_dict_set(cls.dict, '__getattr__',
        function(self, attr){
            return jsobj2pyobj(self.jsobj[attr], self.jsobj)
        }
    )
    $B.str_dict_set(cls.dict, '__setattr__',
        function(self, attr, value){
            self.jsobj[attr] = pyobj2jsobj(value)
        }
    )
    return cls
}


var js_iterator = $B.make_builtin_class('js_iterator')

js_iterator.tp_iternext = function*(self){
    for(var key of self.it){
        yield key
    }
}

$B.set_func_names(js_iterator, 'builtins')

function JSObj_eq(self, other){
    switch(typeof self){
        case "string":
            return self == other
        case "object":
            if(self.__eq__ !== undefined){
                return self.__eq__(other)
            }
            if(Object.keys(self).length !== Object.keys(other).length){
                return false
            }
            if(self === other){
                return true
            }
            for(var key in self){
                if(! $B.rich_comp('__eq__', self[key], other[key])){
                    return false
                }
            }
            return true
        case 'function':
            if(self.$js_func && other.$js_func){
                return self.$js_func === other.$js_func
            }
            return self === other
        default:
            return self === other
    }
}


$B.JSObj = $B.make_builtin_class("JSObject")

$B.JSObj.$factory = jsobj2pyobj


$B.JSObj.nb_bool = function(self){
    if(typeof self == 'object'){
        for(var key in self){
            return true
        }
        return false
    }
    return !! self
}

$B.JSObj.sq_contains = function(self, key){
    return key in self
}


$B.JSObj.tp_richcompare = function(self, other, op){
    switch(op){
        case '__eq__':
            return JSObj_eq(self, other)
        case '__ne__':
            var res = JSObj_eq(self, other)
            return res === _b_.NotImplemented ? res : ! res
        default:
            return _b_.NotImplemented
    }
}

$B.JSObj.tp_hash = function(self){
    // must not be the same object as object.__hash__ because, since
    // JSObj.__eq__ is not the same as object.__eq__, JSObj instances
    // would be unhashable
    return _b_.object.tp_hash(self)
}

$B.JSObj.tp_iter = function(self){
    return {
        ob_type: js_iterator,
        obj: self,
        it: Object.keys(self)[Symbol.iterator](),
        length: Object.keys(self).length
    }
}

$B.JSObj.tp_getattro = function(_self, attr){
    var test = false //attr == "performance"
    if(test){
        console.log("__ga__", _self, attr)
    }
    var res = _b_.object.tp_getattro(_self, attr, $B.NULL)
    if(test){
        console.log(res)
    }
    if(res !== $B.NULL){
        return res
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
            class_attr = $B.search_in_mro(klass, attr, $B.NULL)
        if(class_attr !== $B.NULL){
            if(test){
                console.log('found in klass', class_attr)
            }
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
                if(test){
                    console.log('return class_attr', class_attr)
                }
                return class_attr
            }
        }
        return $B.NULL
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

$B.JSObj.tp_setattro = function(self, attr, value){
    if(value === $B.NULL){
        delete self[attr]
        return
    }
    self[attr] = $B.pyobj2jsobj(value)
    return _b_.None
}

$B.JSObj.mp_subscript = function(_self, key){
    if(typeof key == "string"){
        try{
            return $B.$getattr(_self, key)
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
                var rank = $B.int_value(key)
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

$B.JSObj.mp_ass_subscript = function(){
    return $B.JSObj.tp_setattro.apply(null, arguments)
}

$B.JSObj.tp_repr = function(self){
    if(typeof self == 'number'){
        return self + ''
    }
    if(typeof self == 'function' && self.$js_func.name &&
            globalThis[self.$js_func.name] === self.$js_func){
        return `<function window.${self.$js_func.name}>`
    }
    var js_repr = Object.prototype.toString.call(self)
    return `<Javascript object: ${js_repr}>`
}

var JSObj_funcs = $B.JSObj.tp_funcs = {}


JSObj_funcs.__dir__ = function(self){
    var attrs = Object.keys(self)
    attrs = attrs.sort()
    return attrs
}

JSObj_funcs.__getattr__ = function(self, attr){
    var test = false // attr == 'test'
    var js_attr = self[attr]
    if(js_attr == undefined && typeof self == "function"){
        js_attr = self.$js_func[attr]
    }
    if(test){
        console.log('js_attr', js_attr, typeof js_attr,
            '\n is JS class ?', js_attr === undefined ? false :
            js_attr.toString().startsWith('class '))
    }
    if(js_attr === undefined){
        if(typeof self == 'object' && attr in self){
            // attr is in self properties (possibly inherited) and the value
            // is `undefined`
            return $B.Undefined
        }
        if(typeof self.getNamedItem == 'function'){
            var res = self.getNamedItem(attr)
            if(res !== undefined){
                return jsobj2pyobj(res)
            }
        }
    }
    if(js_attr !== null && js_attr !== undefined &&
            js_attr.toString &&
            typeof js_attr == 'function' &&
            js_attr.toString().startsWith('class ')){
        // Javascript class
        return jsclass2pyclass(js_attr)
    }else if(typeof js_attr === 'function'){
        // The second argument is the value passed as "this" when the JS
        // function is executed. If self is a wrapper around a JS function,
        // pass the JS function, not the wrapper
        if(! js_attr.$infos && ! js_attr.$function_infos){
            js_attr.$js_func = js_attr
        }
        return jsobj2pyobj(js_attr, self.$js_func || self)
    }else{
        if(test){
            console.log('jsobj2pyobj on', js_attr)
        }
        if(js_attr === undefined && ! Object.hasOwn(attr)){
            return $B.NULL
        }
        var res = jsobj2pyobj(js_attr)
        if(test){
            console.log('    res', res)
        }
        return res
    }
}

JSObj_funcs.bind = function(_self, evt, func){
    // "bind" is an alias for "addEventListener"
    var js_func = function(ev) {
        try{
            return $B.$call(func, jsobj2pyobj(ev))
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

JSObj_funcs.bindings = function(_self){
    var res = $B.empty_dict()
    if(_self.$brython_events){
        for(var key in _self.$brython_events){
            _b_.dict.$setitem(res, key,
                $B.fast_tuple(_self.$brython_events[key].map(x => x[0])))
        }
    }
    return res
}

JSObj_funcs.unbind = function(_self, evt, func){
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

JSObj_funcs.to_dict = function(_self){
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

$B.JSObj.tp_methods = ["__getattr__", "bind", "bindings", "unbind", "to_dict"]

$B.set_func_names($B.JSObj, "builtins")

$B.SizedJSObj = $B.make_builtin_class('SizedJavascriptObject', [$B.JSObj])

$B.SizedJSObj.sq_length = function(_self){
    return _self.length
}

$B.set_func_names($B.SizedJSObj, 'builtins')

$B.IterableJSObj = $B.make_builtin_class('IterableJavascriptObject', [$B.JSObj])

$B.IterableJSObj.sq_contains = function(self, key){
    if(self.contains !== undefined && typeof self.contains == 'function'){
        return self.contains(key)
    }else{
        for(var item of $B.IterableJSObj.tp_iter(self).it){
            if($B.is_or_equals(item, key)){
                return true
            }
        }
        return false
    }
}

$B.IterableJSObj.tp_iter = function(self){
    self.it = self[Symbol.iterator]()
    return self
}

$B.IterableJSObj.sq_length = function(self){
    return self.length
}

$B.IterableJSObj.tp_iternext = function*(self){
    for(var value of self.it){
        yield value
    }
}

$B.set_func_names($B.IterableJSObj, 'builtins')

/* js_array_iterator */

var js_array_iterator = $B.make_builtin_class('JSArray_iterator')

js_array_iterator.$factory = function(obj){
    return {
        ob_type: js_array_iterator,
        it: obj[Symbol.iterator]()
    }
}

js_array_iterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield jsobj2pyobj(item)
    }
}

$B.set_func_names(js_array_iterator, 'builtins')


function make_conv(array){
    if($B.$isinstance(array, [_b_.list, _b_.tuple])){
        return x => x
    }else{
        return x => jsobj2pyobj(x)
    }
}

function js_array_eq(self, other){
    var conv_x = make_conv(self),
        conv_y = make_conv(other)
    if(self.length != other.length){
        return false
    }
    for(var i = 0, len = self.length; i <len; i++){
        if(! $B.is_or_equals(conv_x(self[i]), conv_y(other[i]))){
            return false
        }
    }
    return true
}

function js_array_le(self, other){
    var conv_x = make_conv(self),
        conv_y = make_conv(other)
    var i = 0
    // skip all items that compare equal
    while(i < self.length && i < other.length &&
            $B.is_or_equals(conv_x(self[i]), conv_y(other[i]))){
        i++
    }
    if(i == self.length){
        // [1] <= [1, 2] is True
        return self.length <= other.length
    }
    if(i == other.length){
        // [1, 2] <= [1] is false
        return false
    }
    // First different item: [1, x] <= [1, y] is x <= y
    return $B.rich_comp('__le__', conv_x(self[i]), conv_y(other[i]))
}

function js_array_lt(self, other){
    var conv_x = make_conv(self),
        conv_y = make_conv(other)
    var i = 0
    // skip all items that compare equal
    while(i < self.length && i < other.length &&
            $B.is_or_equals(conv_x(self[i]), conv_y(other[i]))){
        i++
    }
    if(i == self.length){
        // [1] < [1, 2] is True
        return self.length < other.length
    }
    if(i == other.length){
        // [1, 2] < [1] is false
        return false
    }
    // First different item: [1, x] < [1, y] is x < y
    return $B.rich_comp('__lt__', conv_x(self[i]), conv_y(other[i]))
}


/* js_array : type of Javascript arrays */

var js_array = $B.js_array = $B.make_builtin_class('JavascriptArray',
    [$B.JSObj])

// js_array.ob_type = js_list_meta

js_array.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, [_b_.list, _b_.tuple, js_array])){
        return _b_.NotImplemented
    }
    switch(op){
        case '__eq__':
            return js_array_eq(self, other)
        case '__ne__':
            return ! js_array_eq(self, other)
        case '__lt__':
            return js_array_lt(self, other)
        case '__le__':
            return js_array_le(self, other)
        case '__ge__':
            return js_array_le(other, self)
        case '__gt__':
            return js_array_lt(other, self)
        default:
            return _b_.NotImplemented
    }
}

js_array.sq_concat = function(_self, other){ // __add__
    var res = _self.slice()
    if($B.$isinstance(other, js_array)){
        return _self.slice().concat(other)
    }
    for(var item of $B.make_js_iterator(other)){
        res.push(pyobj2jsobj(item))
    }
    return res
}

js_array.mp_ass_subscript = function(self, key, value){
    if(value === $B.NULL){
        self.splice(key, 1)
    }else{
        self[key] = pyobj2jsobj(value)
    }
}

js_array.mp_length = function(self){
    return self.length
}

js_array.mp_subscript = function(self, i){
    i = $B.PyNumber_Index(i)
    return jsobj2pyobj(self[i])
}

js_array.sq_contains = function(self, item){
    item = pyobj2jsobj(item)
    for(var x of self){
        if($B.is_or_equals(x, item)){
            return true
        }
    }
    return false
}

js_array.nb_inplace_add = function(self, other){
    if($B.$isinstance(other, js_array)){
        for(var item of other){
            self.push(item)
        }
    }else{
        for(var item of $B.make_js_iterator(other)){
            self.push($B.pyobj2jsobj(item))
        }
    }
    return self
}

js_array.tp_iter = function(self){
    return js_array_iterator.$factory(self)
}

js_array.nb_multiply = function(self, nb){
    var res = self.slice()
    for(var i = 1; i < nb; i++){
        res = res.concat(self)
    }
    return res
}

js_array.tp_repr = function(self){
    if($B.repr.enter(self)){ // in py_utils.js
        return '[...]'
    }
    var _r = new Array(self.length),
        res

    for(var i = 0; i < self.length; ++i){
        _r[i] = $B.make_str(self[i])
    }

    res = "[" + _r.join(", ") + "]"
    $B.repr.leave(self)
    return res
}

var js_array_funcs = js_array.tp_funcs = {}

js_array_funcs.append = function(self, x){
    self.push(pyobj2jsobj(x))
    if(self[PYOBJ]){
        self[PYOBJ].push(x)
    }
    return _b_.None
}

js_array_funcs.extend = function(self){
    var $ = $B.args("extend", 2, {self: null, t: null}, ["self", "t"],
        arguments, {}, null, null)
    var self = $.self,
        t = $.t
    for(var item of $B.make_js_iterator(t)){
        self[self.length] = $B.pyobj2jsobj(item)
    }
    return _b_.None
}

js_array.tp_methods = ["append", "extend"]

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
    var new_func = _b_.type.tp_getattro(klass, "__new__")
    // create an instance with __new__
    var instance = new_func.apply(null, arguments)
    if(instance instanceof cls.__mro__[0].$js_func){
        // call __init__ with the same parameters
        var init_func = _b_.type.tp_getattro(klass, "__init__")
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
        return _b_.type.tp_getattro(cls, attr)
    }
}

$B.JSMeta.__init_subclass__ = function(){
    // do nothing
}

$B.JSMeta.tp_new = function(cls, args, kw){
    // Creating a class that inherits a Javascript class A must return
    // another Javascript class B that extends A
    var metaclass = cls
    var [class_name, bases, cl_dict] = args
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

$B.JSConstructor = $B.make_builtin_class('JavascriptConstructor', [_b_.type])

$B.JSConstructor.tp_call = function(self, ...args){
    var js_constr = self.tp_bases[0][$B.JSOBJ]
    return jsobj2pyobj(new js_constr(...args))
}


$B.JSFunction = $B.make_builtin_class('JavascriptFunction')

$B.JSFunction.tp_getattro = function(self, attr){
    if(self[JSOBJ] && self[JSOBJ][attr] !== undefined){
        return jsobj2pyobj(self[JSOBJ][attr], self[JSOBJ])
    }
    return _b_.object.tp_getattro(self, attr)
}

$B.JSFunction.tp_descr_get = function(self, obj){
    if(obj === $B.NULL){
        return self
    }
    return $B.$call($B.method, self, obj)
}


$B.JSFunction.tp_call = function(self, ...args){
    return self(...args)
}

$B.JSFunction.tp_new = function(cls, args, kw){
    var [name, bases, dict] = args
    var cls = {
        ob_type: $B.JSConstructor,
        tp_name: name,
        tp_bases: bases,
        dict
    }
    cls.tp_mro = [cls, _b_.object]
    return cls
}

var JSFunction_funcs = $B.JSFunction.tp_funcs = {}

JSFunction_funcs.__getattr__ = function(self, attr){
    return self[attr] ?? $B.NULL
}

JSFunction_funcs.new = function(self, ...args){
    var new_func
    var attr = 'new'
    args = pyargs2jsargs(args)
    if(self.$js_func){
        return new self.$js_func(...args)
    }else{
        return new self(...args)
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
    new_func.ob_type = $B.builtin_function_or_method
    new_func.__name__ = 'new'
    return new_func
}

$B.JSFunction.tp_methods = ["__getattr__", "new"]

})(__BRYTHON__);


