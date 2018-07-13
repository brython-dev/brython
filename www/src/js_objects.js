;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

var object = _b_.object

var _window = self;


// Transforms a Javascript constructor into a Python function
// that returns instances of the constructor, converted to Python objects

var JSConstructor = {
    __class__: _b_.type,
    __module__: "<javascript>",
    __mro__: [object],
    __name__: 'JSConstructor',
    $is_class: true
}

JSConstructor.__call__ = function(self){
    // self.func is a constructor
    // It takes Javascript arguments so we must convert
    // those passed to the Python function
    return function(){
        var args = [null]
        for(var i = 0, len = arguments.length; i < len; i++){
            args.push(pyobj2jsobj(arguments[i]))
        }
        var factory = self.func.bind.apply(self.func, args)
        var res = new factory()
        // res is a Javascript object
        return $B.$JS2Py(res)
    }
}

JSConstructor.__getattribute__ = function(self, attr){
    // Attributes of a constructor are taken from the original JS object
    if(attr == "__call__"){
        return function(){
            var args = [null]
            for(var i = 0, len = arguments.length; i < len; i++){
                args.push(pyobj2jsobj(arguments[i]))
            }
            var factory = self.func.bind.apply(self.func, args)
            var res = new factory()
            // res is a Javascript object
            return $B.$JS2Py(res)
        }
    }
    return JSObject.__getattribute__(self.obj, attr)
}

JSConstructor.$factory = function(obj){
    return {
        __class__: JSConstructor,
        obj: obj,
        func: obj.js_func
    }
}

// JSObject : wrapper around a native Javascript object


// Object used to convert Javascript undefined value
var UndefinedClass = $B.make_class("undefined",
    function(){return Undefined}
)
UndefinedClass.__bool__ = function(){return false}
UndefinedClass.__repr__ = function(){return "undefined"}
var Undefined = {
    __class__: UndefinedClass
}

var jsobj2pyobj = $B.jsobj2pyobj = function(jsobj) {
    switch(jsobj) {
      case true:
      case false:
        return jsobj
    }

    if(jsobj === undefined){return $B.Undefined}
    else if(jsobj === null){return _b_.None}

    if(Array.isArray(jsobj)){return _b_.list.$factory(jsobj)}

    if(typeof jsobj === 'number'){
       if(jsobj.toString().indexOf('.') == -1){return _b_.int.$factory(jsobj)}
       // for now, lets assume a float
       return _b_.float.$factory(jsobj)
    }

    if(jsobj.$nat === 'kw') {
        return jsobj
    }

    return JSObject.$factory(jsobj)
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
    if(klass === JSObject || klass === JSConstructor){
        // Instances of JSObject and JSConstructor are transformed into the
        // underlying Javascript object

        // If the object is a function, the JSObject has a js_func attribute,
        // which is the original Javascript function
        if(pyobj.js_func !== undefined){return pyobj.js_func}
        return pyobj.js

    }else if(klass === $B.DOMNode ||
            klass.__mro__.indexOf($B.DOMNode) > -1){

        // instances of DOMNode or its subclasses are transformed into the
        // underlying DOM element
        return pyobj.elt

    }else if([_b_.list,_b_.tuple].indexOf(klass) > -1){

        // Python list : transform its elements
        var res = []
        pyobj.forEach(function(item){
            res.push(pyobj2jsobj(item))
        })
        return res

    }else if(klass === _b_.dict){

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

    }else if(klass === $B.builtins.float){

        // Python floats are converted to the underlying value
        return pyobj.valueOf()

    }else if(klass === $B.Function || klass === $B.method){
        // Transform arguments
        return function(){
            try{
                var args = []
                for(var i = 0; i < arguments.length; i++){
                    if(arguments[i] === undefined){args.push(_b_.None)}
                    else{args.push(jsobj2pyobj(arguments[i]))}
                }
                return pyobj2jsobj(pyobj.apply(this, args))
            }catch(err){
                console.log(err)
                console.log(_b_.getattr(err,'info'))
                console.log(err.__class__.__name__ + ':',
                    err.args.length > 0 ? err.args[0] : '' )
                throw err
            }
        }

    }else{
        // other types are left unchanged

        return pyobj

    }
}

var JSObject = {
    __class__: _b_.type,
    __module__: "<javascript>",
    __mro__: [object],
    __name__: 'JSObject'
}

JSObject.__bool__ = function(self){
    return (new Boolean(self.js)).valueOf()
}

JSObject.__delattr__ = function(self, attr){
    _b_.getattr(self, attr) // raises AttributeError if necessary
    delete self.js[attr]
    return _b_.None
}

JSObject.__dir__ = function(self){
    return Object.keys(self.js)
}

JSObject.__getattribute__ = function(self,attr){
    if(attr.substr(0,2) == '$$'){attr = attr.substr(2)}
    if(self.js === null){return object.__getattribute__(None, attr)}
    if(attr == "__class__"){return JSObject}
    if(attr == "__call__"){
        if(typeof self.js == "function"){
            return function(){
              // apply Javascript function to arguments converted from
              // Python objects to JS or DOM objects
              var args = []
              for(var i = 0; i < arguments.length; i++){
                  args.push($B.pyobj2jsobj(arguments[i]))
              }
              var res = self.js.apply(null, args)
              if(res === undefined){return None} // JSObject would throw an exception
              // transform JS / DOM result in Python object
              return JSObject.$factory(res)
            }
        }else{
            throw _b_.AttributeError.$factory("object is not callable")
        }
    }
    if(self.__class__ === JSObject && attr == "bind" &&
            self.js[attr] === undefined &&
            self.js['addEventListener'] !== undefined){
        // For JS objects, "bind" is aliased to addEventListener
        attr = 'addEventListener'
    }
    var js_attr = self.js[attr]
    if(self.js_func && self.js_func[attr] !== undefined){
        js_attr = self.js_func[attr]
    }

    if(js_attr !== undefined){
        if(typeof js_attr == 'function'){
            // If the attribute of a JSObject is a function F, it is converted to a function G
            // where the arguments passed to the Python function G are converted to Javascript
            // objects usable by the underlying function F
            var res = function(){
                var args = []
                for(var i = 0, len = arguments.length; i < len; i++){
                    if(arguments[i] !== null && arguments[i].$nat !== undefined){
                        //
                        // Passing keyword arguments to a Javascript function
                        // raises a TypeError : since we don't know the
                        // signature of the function, the result of Brython
                        // code like foo(y=1, x=2) applied to a JS function
                        // defined by function foo(x, y) can't be determined.
                        //
                        throw TypeError.$factory(
                            "A Javascript function can't take " +
                                "keyword arguments")
                    }else{
                        args.push(pyobj2jsobj(arguments[i]))
                    }
                }
                // IE workaround
                if(attr === 'replace' && self.js === location) {
                    location.replace(args[0])
                    return
                }
                // normally, we provide self.js as `this` to simulate js method call
                var new_this = self.js
                if(self.js_func){
                    // if self is a wrapped function, unwrap it back
                    new_this = self.js_func;
                }
                // but if we get explicit `this` (e.g. through apply call) we should pass it on
                if(this !== null && this !== undefined && this !== _window){
                    new_this = this
                }

                var result = js_attr.apply(new_this, args)

                // NOTE: fix for situations when wrapped function is constructor (thus it does not return and value is lost)
                // this has side effect that non-constructor functions returning nothing will return `this` instead, which can break something
                //
                if(result === undefined){
                    result = this
                }
                return $B.$JS2Py(result)
            }
            res.__repr__ = function(){return '<function ' + attr + '>'}
            res.__str__ = function(){return '<function ' + attr + '>'}
            // this is very important for class-emulating functions
            res.prototype = js_attr.prototype
            return {__class__: JSObject, js: res, js_func: js_attr}
        }else{
            return $B.$JS2Py(js_attr)
        }
    }else if(self.js === _window && attr === '$$location'){
        // special lookup because of Firefox bug
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        return $Location()
    }

    var res = self.__class__[attr]
    if(res === undefined){
        // search in classes hierarchy, following method resolution order
        var mro = self.__class__.__mro__
        for(var i = 0, len = mro.length; i < len; i++){
            var v = mro[i][attr]
            if(v !== undefined){
                res = v
                break
            }
        }
    }
    if(res !== undefined){
        if(typeof res === 'function'){
            // res is the function in one of parent classes
            // return a function that takes self as first argument
            return function(){
                var args = [self]
                for(var i = 0, len = arguments.length; i < len; i++){
                    var arg = arguments[i]
                    if(arg && (arg.__class__ === JSObject ||
                            arg.__class__ === JSConstructor)){
                        args.push(arg.js)
                    }else{
                        args.push(arg)
                    }
                }
                return res.apply(self,args)
            }
        }
        return $B.$JS2Py(res)
    }else{
        // XXX search __getattr__
        throw _b_.AttributeError.$factory("no attribute " + attr + ' for ' +
            self.js)
    }
}

JSObject.__getitem__ = function(self, rank){
    if(typeof self.js.length == 'number'){
        if((typeof rank == "number" || typeof rank == "boolean") &&
                typeof self.js.item == 'function'){
            var rank_to_int = _b_.int.$factory(rank)
            if(rank_to_int < 0){rank_to_int += self.js.length}
            var res = JSObject.$factory(self.js.item(rank_to_int))
            if(res === undefined){throw _b_.KeyError.$factory(rank)}
            return res
        }else if(typeof rank == "string" &&
                typeof self.js.getNamedItem == 'function'){
            var res = JSObject.$factory(self.js.getNamedItem(rank))
            if(res === undefined){throw _b_.KeyError.$factory(rank)}
            return res
        }
    }
    try{return getattr(self.js, '__getitem__')(rank)}
    catch(err){
        if(self.js[rank] !== undefined){return JSObject.$factory(self.js[rank])}
        throw _b_.KeyError.$factory(rank)
    }
}

var $JSObject_iterator = $B.$iterator_class('JS object iterator')
JSObject.__iter__ = function(self){
    var items = []
    if(_window.Symbol && self.js[Symbol.iterator] !== undefined){
        // Javascript objects that support the iterable protocol, such as Map
        // For the moment don't use "for(var item of self.js)" for
        // compatibility with uglifyjs
        // If object has length and item(), it's a collection : iterate on
        // its items
        if(self.js.length !== undefined && self.js.item !== undefined){
            for(var i = 0; i < self.js.length ; i++){
                items.push(JSObject.$factory(self.js[i]))
            }
        }else{
            for(var item in self.js){
                if(self.js.hasOwnProperty(item)){
                    items.push(jsobj2pyobj(item))
                }
            }
        }
        return $B.$iterator(items, $JSObject_iterator)
    }else if(self.js.length !== undefined && self.js.item !== undefined){
        // collection
        self.js.forEach(function(item){
            items.push(JSObject.$factory(item))
        })
        return $B.$iterator(items, $JSObject_iterator)
    }
    // Else iterate on the dictionary built from the JS object
    var _dict = JSObject.to_dict(self)
    return _b_.dict.__iter__(_dict)
}

JSObject.__len__ = function(self){
    if(typeof self.js.length == 'number'){return self.js.length}
    try{return getattr(self.js, '__len__')()}
    catch(err){
        throw _b_.AttributeError.$factory(self.js + ' has no attribute __len__')
    }
}

JSObject.__repr__ = function(self){
    if(self.js instanceof Date){return self.js.toString()}
    var proto = Object.getPrototypeOf(self.js)
    if(proto){
        var name = proto.constructor.name
        if(name === undefined){ // IE
            var proto_str = proto.constructor.toString()
            name = proto_str.substring(8, proto_str.length - 1)
        }
        return "<" + name + " object>"
    }
    return "<JSObject wraps " + self.js + ">"
}

JSObject.__setattr__ = function(self,attr,value){
    if(attr.substr && attr.substr(0,2) == '$$'){
        // aliased attribute names, eg "message"
        attr = attr.substr(2)
    }
    if(isinstance(value,JSObject)){self.js[attr] = value.js}
    else{
        self.js[attr] = value
        if(typeof value == 'function'){
            self.js[attr] = function(){
                var args = []
                for(var i = 0, len = arguments.length; i < len; i++){
                    args.push($B.$JS2Py(arguments[i]))
                }
                try{return value.apply(null, args)}
                catch(err){
                    err = $B.exception(err)
                    var info = _b_.getattr(err, 'info')
                    if(err.args.length > 0){
                        err.toString = function(){
                            return info + '\n' + err.__class__.__name__ +
                            ': ' + _b_.repr(err.args[0])
                        }
                    }else{
                        err.toString = function(){
                            return info + '\n' + err.__class__.__name__
                        }
                    }
                    console.log(err + '')
                    throw err
                }
            }
        }
    }
}

JSObject.__setitem__ = JSObject.__setattr__

JSObject.__str__ = JSObject.__repr__

var no_dict = {'string': true, 'function': true, 'number': true,
    'boolean': true}

JSObject.bind = function(self, evt, func){
    var js_func = function(ev) {
        return func(jsobj2pyobj(ev))
    }
    self.js.addEventListener(evt, js_func)
    return _b_.None
}

JSObject.to_dict = function(self){
    // Returns a Python dictionary based on the underlying Javascript object
    return $B.obj_dict(self.js)
}

JSObject.$factory = function(obj){
    if(obj === null){return _b_.None}
    // If obj is a function, calling it with JSObject implies that it is
    // a function defined in Javascript. It must be wrapped in a JSObject
    // so that when called, the arguments are transformed into JS values
    if(typeof obj == 'function'){
        return {__class__: JSObject, js: obj, js_func: obj}
    }

    var klass = $B.get_class(obj)
    // we need to do this or nan is returned, when doing json.loads(...)
    if(klass === _b_.float){return _b_.float.$factory(obj)}

    // If obj is a Python object, return it unchanged
    if(klass !== undefined){return obj}
    return {
        __class__: JSObject,
        js: obj
    }
}

$B.JSObject = JSObject
$B.JSConstructor = JSConstructor

})(__BRYTHON__)

