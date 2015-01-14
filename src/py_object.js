// A function that builds the __new__ method for the factory function
__BRYTHON__.$__new__ = function(factory){
    return function(cls){
        if(cls===undefined){
            throw __BRYTHON__.builtins.TypeError(factory.$dict.__name__+'.__new__(): not enough arguments')
        }
        var res = factory.apply(null,[])
        res.__class__ = cls.$dict
        var init_func = null
        try{init_func = __BRYTHON__.builtins.getattr(res,'__init__')}
        catch(err){__BRYTHON__.$pop_exc()}
        if(init_func!==null){
            var args = []
            for(var i=1, _len_i = arguments.length; i < _len_i;i++){args.push(arguments[i])}
            init_func.apply(null,args)
            res.__initialized__ = true
        }
        return res
    }
}

__BRYTHON__.builtins.object = (function($B){

var _b_=$B.builtins

// class object for the built-in class 'object'
var $ObjectDict = {
    //__class__:$type, : not here, added in py_type.js after $type is defined
    __name__:'object',
    $native:true
}

// function used to generate the methods that return 'unorderable types'
var $ObjectNI = function(name,op){
    return function(other){
        throw _b_.TypeError('unorderable types: object() '+op+
            ' '+ _b_.str($B.get_class(other).__name__)+'()')
    }
}

// Name of special methods : if they are not found as attributes, try
// the "reflected" attribute on the argument
// For instance, for "getattr(x,'__mul__')", if object x has no attribute
// "__mul__", try a function using the attribute "__rmul__" of its
// first argument

var opnames = ['add','sub','mul','truediv','floordiv','mod','pow',
    'lshift','rshift','and','xor','or']
var opsigns = ['+','-','*','/','//','%','**','<<','>>','&','^', '|']

$ObjectDict.__delattr__ = function(self,attr){delete self[attr]}

$ObjectDict.__dir__ = function(self) {
    var res = []

    var objects = [self]
    var mro = $B.get_class(self).__mro__
    for (var i=0, _len_i = mro.length; i < _len_i; i++) {
        objects.push(mro[i])
    }
    for (var i=0, _len_i = objects.length; i < _len_i; i++) {
        for(var attr in objects[i]){
            //if(attr.charAt(0)=='$' && attr.substr(0,2)!=='$$'){
            if(attr.charAt(0)=='$' && attr.charAt(1) != '$') {
                // exclude internal attributes set by Brython
                continue
            }
            if(!isNaN(parseInt(attr.charAt(0)))){
                // Exclude numerical attributes
                // '0', '1' are in attributes of string 'ab'
                continue
            }
            res.push(attr)
        }
    }
    res = _b_.list(_b_.set(res))
    _b_.list.$dict.sort(res)
    return res
}

$ObjectDict.__eq__ = function(self,other){
    // equality test defaults to identity of objects
    return self===other
}

$ObjectDict.__ge__ = $ObjectNI('__ge__','>=')

$ObjectDict.__getattribute__ = function(obj,attr){
    var klass = $B.get_class(obj)
    if(attr==='__class__'){
        return klass.$factory
    }
    var res = obj[attr],args=[]

    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        //if(attr=='show'){console.log('object getattr '+attr+' of obj '+obj)}
        var mro = klass.__mro__
        for(var i=0, _len_i = mro.length; i < _len_i;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
    }else{
        if(res.__set__===undefined){
            // For non-data descriptors, the attribute found in object 
            // dictionary takes precedence
            return res
        }
    }

    if(res!==undefined){
        var get_func = res.__get__
        
        if(get_func===undefined && (typeof res=='object')){
            var __get__ = _b_.getattr(res,'__get__',null);
            if(__get__ && (typeof __get__=='function')){
                get_func = function(x,y){return __get__.apply(x,[y,klass])}
            }
        }
        
        if(get_func===undefined && (typeof res=='function')){
            get_func = function(x){return x}
        }
        if(get_func!==undefined){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            var res1 = get_func.apply(null,[res,obj,klass])
            if(typeof res1=='function'){
                // If attribute is a class then return it unchanged
                //
                // Example :
                // ===============
                // class A:
                //    def __init__(self,x):
                //        self.x = x
                //
                // class B:
                //    foo = A
                //    def __init__(self):
                //        self.info = self.foo(18)
                //
                // B()
                // ===============
                // In class B, when we call self.foo(18), self.foo is the
                // class A, its method __init__ must be called without B's
                // self as first argument
    
                if(res1.__class__===$B.$factory) return res

                // instance method object
                var __self__,__func__=res,__repr__,__str__
                switch(res.$type) {
                  case undefined:
                  case 'function':
                    //if(res.$type===undefined || res.$type=='function'){
                    // the attribute is a function : return an instance method,
                    // called with the instance as first argument
                    args = [obj]
                    __self__ = obj
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method '+attr
                        x += " of '"+klass.__name__+"' object>"
                        return x
                    }
                    break
                  case 'instancemethod':
                    //}else if(res.$type==='instancemethod'){
                    // The attribute is a method of an instance of another class
                    // Return it unchanged
                    return res
                  case 'classmethod':
                    //}else if(res.$type==='classmethod'){
                    // class method : called with the class as first argument
                    args = [klass]
                    __self__ = klass
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method type'+'.'+attr
                        x += ' of '+klass.__name__+'>'
                        return x
                    }
                    break
                  case 'staticmethod':
                    //}else if(res.$type==='staticmethod'){
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+klass.__name__+'.'+attr+'>'
                    }
                }

                // build the instance method, called with a list of arguments
                // depending on the method type
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                            local_args.push(arguments[i])
                        }
                        var x = res.apply(obj,local_args)
                        if(x===undefined) return _b_.None
                        return x
                    }})(args)
                method.__class__ = $B.$InstanceMethodDict
                method.__eq__ = function(other){
                    return other.$res === res
                }
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                method.__code__ = {'__class__' : $B.CodeDict}
                method.__doc__ = res.__doc__ || ''
                method.$type = 'instancemethod'
                method.$res = res
                return method
            }else{
                // result of __get__ is not a function
                return res1
            }
        }
        // attribute is not a descriptor : return it unchanged
        return res
    }else{
        // search __getattr__
        var _ga = obj['__getattr__']
        if(_ga===undefined){
            var mro = klass.__mro__
            if(mro===undefined){console.log('in getattr mro undefined for '+obj)}
            for(var i=0, _len_i = mro.length; i < _len_i;i++){
                var v=mro[i]['__getattr__']
                if(v!==undefined){
                    _ga = v
                    break
                }
            }
        }
        if(_ga!==undefined){
            try{return _ga(obj,attr)}
            catch(err){void(0)}
        }
        // for special methods such as __mul__, look for __rmul__ on operand
        if(attr.substr(0,2)=='__' && attr.substr(attr.length-2)=='__'){
            var attr1 = attr.substr(2,attr.length-4) // stripped of __
            var rank = opnames.indexOf(attr1)
            if(rank > -1){
                var rop = '__r'+opnames[rank]+'__' // name of reflected operator
                return function(){
                    try{
                        // Operands must be of different types
                        if($B.$get_class(arguments[0])===klass){throw Error('')}
                        return _b_.getattr(arguments[0],rop)(obj)
                    }catch(err){
                        var msg = "unsupported operand types for "+opsigns[rank]+": '"
                        msg += klass.__name__+"' and '"+arguments[0].__class__.__name__+"'"
                        throw _b_.TypeError(msg)
                    }
                }
            }
        }
        //throw AttributeError('object '+obj.__class__.__name__+" has no attribute '"+attr+"'")
    }
}

$ObjectDict.__gt__ = $ObjectNI('__gt__','>')

$ObjectDict.__hash__ = function (self) { 
    $B.$py_next_hash+=1; 
    return $B.$py_next_hash;
}

$ObjectDict.__init__ = function(){}

$ObjectDict.__le__ = $ObjectNI('__le__','<=')

$ObjectDict.__lt__ = $ObjectNI('__lt__','<')

$ObjectDict.__mro__ = [$ObjectDict]

$ObjectDict.__new__ = function(cls){
    if(cls===undefined){throw _b_.TypeError('object.__new__(): not enough arguments')}
    var obj = {}
    obj.__class__ = cls.$dict
    return obj
}

$ObjectDict.__ne__ = function(self,other){return self!==other}

$ObjectDict.__or__ = function(self,other){
    if(_b_.bool(self)) return self
    return other
}

$ObjectDict.__repr__ = function(self){
    if(self===object || self === undefined) return "<class 'object'>"
    if(self.__class__===$B.$type) return "<class '"+self.__class__.__name__+"'>"
    return "<"+self.__class__.__name__+" object>"
}

$ObjectDict.__setattr__ = function(self,attr,val){
    if(val===undefined){ // setting an attribute to 'object' type is not allowed
        throw _b_.TypeError("can't set attributes of built-in/extension type 'object'")
    }else if(self.__class__===$ObjectDict){
        // setting an attribute to object() is not allowed
        if($ObjectDict[attr]===undefined){
            throw _b_.AttributeError("'object' object has no attribute '"+attr+"'")
        }else{
            throw _b_.AttributeError("'object' object attribute '"+attr+"' is read-only")
        }
    }
    self[attr] = val
}
$ObjectDict.__setattr__.__str__ = function(){return 'method object.setattr'}

$ObjectDict.__str__ = $ObjectDict.__repr__

//$ObjectDict.toString = $ObjectDict.__repr__ //function(){return '$ObjectDict'}

// constructor of the built-in class 'object'
function object(){return {__class__:$ObjectDict}}

object.$dict = $ObjectDict
// object.__class__ = $factory : this is done in py_types
$ObjectDict.$factory = object
object.__repr__ = object.__str__ = function(){return "<class 'object'>"}

return object

})(__BRYTHON__)
