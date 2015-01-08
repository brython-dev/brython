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
    //if(obj.__class__===$JSObjectDict){obj = obj.js}
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
      case null:
        return _b_.None
    }

    if (typeof jsobj === 'object') {
       if ('length' in jsobj) return _b_.list(jsobj)

       var d=_b_.dict()
       for (var $a in jsobj) _b_.dict.$dict.__setitem__(d,$a, jsobj[$a])
       return d
    }

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
    if(klass===$JSObjectDict || klass===$JSConstructorDict){
        // instances of JSObject and JSConstructor are transformed into the
        // underlying Javascript object
        return pyobj.js
    }else if(klass.__mro__.indexOf($B.DOMNode)>-1){
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
        return pyobj.value
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

$JSObjectDict.__getattribute__ = function(obj,attr){
    if(attr.substr(0,2)=='$$') attr=attr.substr(2)
    if(obj.js===null) return $ObjectDict.__getattribute__(None,attr)
    if(attr==='__class__') return $JSObjectDict
    if(attr=="bind" && obj.js[attr]===undefined &&
        obj.js['addEventListener']!==undefined){attr='addEventListener'}
    var js_attr = obj.js[attr]
    if(obj.js_func && obj.js_func[attr]!==undefined){
        js_attr = obj.js_func[attr]
    }
    if(js_attr !== undefined){
        if(typeof js_attr=='function'){
            // If the attribute of a JSObject is a function F, it is converted to a function G
            // where the arguments passed to the Python function G are converted to Javascript
            // objects usable by the underlying function F
            var res = function(){
                var args = [],arg
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    args.push(pyobj2jsobj(arguments[i]))
                }
                // IE workaround
                if(attr === 'replace' && obj.js === location) {
                    location.replace(args[0])
                    return
                }
                var res = js_attr.apply(obj.js,args)
                if(typeof res == 'object') return JSObject(res)
                if(res===undefined) return None
                return $B.$JS2Py(res)
            }
            res.__repr__ = function(){return '<function '+attr+'>'}
            res.__str__ = function(){return '<function '+attr+'>'}
            return {__class__:$JSObjectDict,js:res,js_func:js_attr}
        }else{
            return $B.$JS2Py(obj.js[attr])
        }
    }else if(obj.js===window && attr==='$$location'){
        // special lookup because of Firefox bug 
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        return $Location()
    }
    
    var res
    // search in classes hierarchy, following method resolution order
    var mro = [$JSObjectDict,$ObjectDict]
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
            // return a function that takes obj as first argument
            return function(){
                var args = [obj],arg
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    arg = arguments[i]
                    if(arg && (arg.__class__===$JSObjectDict || arg.__class__===$JSConstructorDict)){
                        args.push(arg.js)
                    }else{
                        args.push(arg)
                    }
                }
                return res.apply(obj,args)
            }
        }
        return $B.$JS2Py(res)
    }else{
        // XXX search __getattr__
        throw _b_.AttributeError("no attribute "+attr+' for '+this)
    }

}

$JSObjectDict.__getitem__ = function(self,rank){
    try{return getattr(self.js,'__getitem__')(rank)}
    catch(err){
        if(self.js[rank]!==undefined) return JSObject(self.js[rank])
        throw _b_.AttributeError(self+' has no attribute __getitem__')
    }
}

var $JSObject_iterator = $B.$iterator_class('JS object iterator')
$JSObjectDict.__iter__ = function(self){
    return $B.$iterator(self.js,$JSObject_iterator)
}

$JSObjectDict.__len__ = function(self){
    try{return getattr(self.js,'__len__')()}
    catch(err){
        console.log('err in JSObject.__len__ : '+err)
        throw _b_.AttributeError(this+' has no attribute __len__')
    }
}

$JSObjectDict.__mro__ = [$JSObjectDict,$ObjectDict]

$JSObjectDict.__repr__ = function(self){return "<JSObject wraps "+self.js.toString()+">"}

$JSObjectDict.__setattr__ = function(self,attr,value){
    if(isinstance(value,JSObject)){self.js[attr]=value.js
    }else{self.js[attr]=value
    }
}

$JSObjectDict.__setitem__ = $JSObjectDict.__setattr__

$JSObjectDict.__str__ = $JSObjectDict.__repr__

function JSObject(obj){
    // If obj is a function, calling it with JSObject implies that it is
    // a function defined in Javascript. It must be wrapped in a JSObject
    // so that when called, the arguments are transformed into JS values
    if (obj === null) {return _b_.None}
    if(typeof obj=='function'){return {__class__:$JSObjectDict,js:obj}}
    var klass = $B.get_class(obj)
    if(klass===_b_.list.$dict){
        // JS arrays not created by list() must be wrapped
        if(obj.__brython__) return obj
        return {__class__:$JSObjectDict,js:obj}
    }
    // If obj is a Python object, return it unchanged
    if(klass!==undefined) return obj
    // If obj is already a JSObject, return it unchanged
    if(klass==$JSObjectDict) return obj
    return {__class__:$JSObjectDict,js:obj}  // wrap it
}
JSObject.__class__ = $B.$factory
JSObject.$dict = $JSObjectDict
$JSObjectDict.$factory = JSObject

$B.JSObject = JSObject
$B.JSConstructor = JSConstructor


})(__BRYTHON__)
