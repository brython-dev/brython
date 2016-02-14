;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

var $LocationDict = {__class__:$B.$type,__name__:'Location'}

$LocationDict.__mro__ = [$LocationDict,$ObjectDict]

function $Location(){ // used because of Firefox bug #814622
    var obj = {}
    for(var x in window.location){
        if(typeof window.location[x]==='function'){
            obj[x] = (function(f){
                return function(){
                    return f.apply(window.location,arguments)
                }
              })(window.location[x])
        }else{
            obj[x]=window.location[x]
        }
    }
    if(obj['replace']===undefined){ // IE
        obj['replace'] = function(url){window.location = url}
    }
    obj.__class__ = $LocationDict
    obj.toString = function(){return window.location.toString()}
    obj.__repr__ = obj.__str__ = obj.toString
    return obj
}

$LocationDict.$factory = $Location
$Location.$dict = $LocationDict

// Transforms a Javascript constructor into a Python function
// that returns instances of the constructor, converted to Python objects

var $JSConstructorDict = {__class__:$B.$type,__name__:'JSConstructor'}

$JSConstructorDict.__call__ = function(self){
    // self.js is a constructor
    // It takes Javascript arguments so we must convert
    // those passed to the Python function
    var args = [null]
    for(var i=1, _len_i = arguments.length; i < _len_i;i++){
        args.push(pyobj2jsobj(arguments[i]))
    }
    var factory = self.func.bind.apply(self.func, args)
    var res = new factory()
    // res is a Javascript object
    return $B.$JS2Py(res)
}

$JSConstructorDict.__mro__ = [$JSConstructorDict,$ObjectDict]

function JSConstructor(obj){
    return {
        __class__:$JSConstructorDict,
        func:obj.js_func
    }
}
JSConstructor.__class__ = $B.$factory
JSConstructor.$dict = $JSConstructorDict
$JSConstructorDict.$factory = JSConstructor

// JSObject : wrapper around a native Javascript object

var jsobj2pyobj=$B.jsobj2pyobj=function(jsobj) {
    switch(jsobj) {
      case true:
      case false:
        return jsobj
    }

    if (Array.isArray(jsobj)) return _b_.list(jsobj)

    if (typeof jsobj === 'number') {
       if (jsobj.toString().indexOf('.') == -1) return _b_.int(jsobj)
       // for now, lets assume a float
       return _b_.float(jsobj)
    }

    return $B.JSObject(jsobj)
}

var pyobj2jsobj=$B.pyobj2jsobj=function(pyobj){
    // conversion of a Python object into a Javascript object
    if(pyobj===true || pyobj===false) return pyobj
    if(pyobj===_b_.None) return null

    var klass = $B.get_class(pyobj)
    if (klass === undefined) {
        // not a Python object , consider arg as Javascript object instead
        return pyobj;
    }
    if(klass===$JSObjectDict || klass===$JSConstructorDict){
        // Instances of JSObject and JSConstructor are transformed into the
        // underlying Javascript object
        
        // If the object is a function, the JSObject has a js_func attribute,
        // which is the original Javascript function
        if(pyobj.js_func!==undefined){return pyobj.js_func}
        return pyobj.js

    }else if(klass.__mro__.indexOf($B.DOMNodeDict)>-1){

        // instances of DOMNode or its subclasses are transformed into the 
        // underlying DOM element
        return pyobj.elt

    }else if([_b_.list.$dict,_b_.tuple.$dict].indexOf(klass)>-1){

        // Python list : transform its elements
        var res = []
        for(var i=0, _len_i = pyobj.length; i < _len_i;i++){res.push(pyobj2jsobj(pyobj[i]))}
        return res

    }else if(klass===_b_.dict.$dict){

        // Python dictionaries are transformed into a Javascript object
        // whose attributes are the dictionary keys
        var jsobj = {}
        var items = _b_.list(_b_.dict.$dict.items(pyobj))
        for(var j=0, _len_j = items.length; j < _len_j;j++){
            jsobj[items[j][0]] = pyobj2jsobj(items[j][1])
        }
        return jsobj

    }else if(klass===$B.builtins.float.$dict){

        // Python floats are converted to the underlying value
        return pyobj.valueOf()

    }else if(klass===$B.$FunctionDict){
        // Transform arguments
        return function(){
            try{
                var args = []
                for(var i=0;i<arguments.length;i++){
                    if(arguments[i]===undefined){args.push(_b_.None)}
                    else{args.push(jsobj2pyobj(arguments[i]))}
                }
                return pyobj.apply(null, args)
            }catch(err){
                console.log(err)
                console.log(_b_.getattr(err,'info'))
                console.log(err.__name__+':', err.args[0])
                throw err
            }
        }

    }else{
        // other types are left unchanged

        return pyobj

    }
}

var $JSObjectDict = {
    __class__:$B.$type,
    __name__:'JSObject',
    toString:function(){return '(JSObject)'}
}

$JSObjectDict.__bool__ = function(self){
    return (new Boolean(self.js)).valueOf()
}

$JSObjectDict.__delattr__ = function(self, attr){
    _b_.getattr(self, attr) // raises AttributeError if necessary
    delete self.js[attr]
    return _b_.None
}

$JSObjectDict.__dir__ = function(self){
    return Object.keys(self.js)
}

$JSObjectDict.__getattribute__ = function(self,attr){
    if(attr.substr(0,2)=='$$') attr=attr.substr(2)
    if(self.js===null) return $ObjectDict.__getattribute__(None,attr)
    if(attr==='__class__') return $JSObjectDict
    if(self.__class__===$JSObjectDict && attr=="$bind" && 
        self.js[attr]===undefined &&
        self.js['addEventListener']!==undefined){attr='addEventListener'}
    var js_attr = self.js[attr]
    if(self.js_func && self.js_func[attr]!==undefined){
        js_attr = self.js_func[attr]
    }

    if(js_attr !== undefined){
        if(typeof js_attr=='function'){
            // If the attribute of a JSObject is a function F, it is converted to a function G
            // where the arguments passed to the Python function G are converted to Javascript
            // objects usable by the underlying function F
            var res = function(){
                var args = [],arg
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    if(arguments[i].$nat!=undefined){
                        //
                        // Passing keyword arguments to a Javascript function
                        // raises a TypeError : since we don't know the 
                        // signature of the function, the result of Brython 
                        // code like foo(y=1, x=2) applied to a JS function 
                        // defined by function foo(x, y) can't be determined.
                        //
                        throw TypeError("A Javascript function can't "+
                            "take keyword arguments")
                    }else{
                        args.push(pyobj2jsobj(arguments[i]))
                    }
                }
                // IE workaround
                if(attr === 'replace' && self.js === location) {
                    location.replace(args[0])
                    return
                }
                return $B.$JS2Py(js_attr.apply(self.js,args))
            }
            res.__repr__ = function(){return '<function '+attr+'>'}
            res.__str__ = function(){return '<function '+attr+'>'}
            return {__class__:$JSObjectDict,js:res,js_func:js_attr}
        }else{
            if(Array.isArray(self.js[attr])){return self.js[attr]}
            return $B.$JS2Py(self.js[attr])
        }
    }else if(self.js===window && attr==='$$location'){
        // special lookup because of Firefox bug 
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        return $Location()
    }
    
    var res
    // search in classes hierarchy, following method resolution order
    var mro = self.__class__.__mro__
    for(var i=0, _len_i = mro.length; i < _len_i;i++){
        var v=mro[i][attr]
        if(v!==undefined){
            res = v
            break
        }
    }
    if(res!==undefined){
        if(typeof res==='function'){
            // res is the function in one of parent classes
            // return a function that takes self as first argument
            return function(){
                var args = [self],arg
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    arg = arguments[i]
                    if(arg && (arg.__class__===$JSObjectDict || arg.__class__===$JSConstructorDict)){
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
        throw _b_.AttributeError("no attribute "+attr+' for '+self.js)
    }
}

$JSObjectDict.__getitem__ = function(self,rank){
    if(typeof self.js.length=='number' &&
        typeof self.js.item=='function'){
            var rank_to_int = _b_.int(rank)
            if(rank_to_int<0){rank_to_int+=self.js.length}
            var res = self.js.item(rank_to_int)
            if(res===undefined){throw _b_.KeyError(rank)}
            return res
    }
    try{return getattr(self.js,'__getitem__')(rank)}
    catch(err){
        if(self.js[rank]!==undefined){return JSObject(self.js[rank])}
        throw _b_.KeyError(rank)
    }
}

var $JSObject_iterator = $B.$iterator_class('JS object iterator')
$JSObjectDict.__iter__ = function(self){
    var items = []
    if(window.Symbol && self.js[Symbol.iterator]!==undefined){
        // Javascript objects that support the iterable protocol, such as Map
        // For the moment don't use "for(var item of self.js)" for 
        // compatibility with uglifyjs
        // If object has length and item(), it's a collection : iterate on 
        // its items
        if(self.js.length!==undefined && self.js.item!==undefined){
            for(var i=0; i<self.js.length ; i++){items.push(self.js[i])}
        }else{
            for(var item in self.js){ 
                if( self.js.hasOwnProperty( item ) ) {
                    items.push(jsobj2pyobj(item))
                } 
            }
        }
        return $B.$iterator(items, $JSObject_iterator)
    }else if(self.js.length!==undefined && self.js.item !== undefined){
        // collection
        for(var i=0; i<self.js.length ; i++){items.push(self.js[i])}
        return $B.$iterator(items, $JSObject_iterator)
    }
    // Else iterate on the dictionary built from the JS object
    var _dict = $JSObjectDict.to_dict(self)
    return _b_.dict.$dict.__iter__(_dict)
}

$JSObjectDict.__len__ = function(self){
    if(typeof self.js.length=='number'){return self.js.length}
    try{return getattr(self.js,'__len__')()}
    catch(err){
        throw _b_.AttributeError(self.js+' has no attribute __len__')
    }
}

$JSObjectDict.__mro__ = [$JSObjectDict,$ObjectDict]

$JSObjectDict.__repr__ = function(self){return "<JSObject wraps "+self.js+">"}

$JSObjectDict.__setattr__ = function(self,attr,value){
    if(isinstance(value,JSObject)){self.js[attr]=value.js}
    else{
        self.js[attr]=value
        if(typeof value=='function'){
            self.js[attr] = function(){
                var args = []
                for(var i=0, len=arguments.length;i<len;i++){
                    args.push($B.$JS2Py(arguments[i]))
                }
                try{return value.apply(null, args)}
                catch(err){
                    err = $B.exception(err)
                    var info = _b_.getattr(err,'info')
                    err.toString = function(){
                        return info+'\n'+err.__class__.__name__+
                        ': '+_b_.repr(err.args[0])
                    }
                    console.log(err+'')
                    throw err
                }
            }
        }
    }
}

$JSObjectDict.__setitem__ = $JSObjectDict.__setattr__

$JSObjectDict.__str__ = $JSObjectDict.__repr__

var no_dict = {'string':true,'function':true,'number':true,'boolean':true}

$JSObjectDict.bind = function(self, evt, func){
    var f = function(){
        try{
            func.apply(null, arguments)
        }catch(err){
            throw $B.exception(err)
        }
    }
    return $JSObjectDict.__getattribute__(self, 'addEventListener').js(evt, f)
}

$JSObjectDict.to_dict = function(self){
    // Returns a Python dictionary based on the underlying Javascript object
    var res = _b_.dict()
    for(var key in self.js){
        var value = self.js[key]
        if(typeof value=='object' && !Array.isArray(value)){
            _b_.dict.$dict.__setitem__(res, key, $JSObjectDict.to_dict(JSObject(value)))
        }else{
            _b_.dict.$dict.__setitem__(res, key, value)
        }
    }
    return res
}

function JSObject(obj){
    if (obj === null) {return _b_.None}
    // If obj is a function, calling it with JSObject implies that it is
    // a function defined in Javascript. It must be wrapped in a JSObject
    // so that when called, the arguments are transformed into JS values
    if(typeof obj=='function'){return {__class__:$JSObjectDict,js:obj}}

    var klass = $B.get_class(obj)
    // we need to do this or nan is returned, when doing json.loads(...)
    if (klass === _b_.float.$dict) return _b_.float(obj)

    // If obj is a Python object, return it unchanged
    if(klass!==undefined) return obj
    return {__class__:$JSObjectDict,js:obj}  // wrap it
}
JSObject.__class__ = $B.$factory
JSObject.$dict = $JSObjectDict
$JSObjectDict.$factory = JSObject

$B.JSObject = JSObject
$B.JSConstructor = JSConstructor

})(__BRYTHON__)

