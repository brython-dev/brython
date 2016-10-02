// A function that builds the __new__ method for the factory function
__BRYTHON__.$__new__ = function(factory){
    return function(cls){
        /*
        if(cls===undefined){
            throw __BRYTHON__.builtins.TypeError(factory.$dict.__name__+'.__new__(): not enough arguments')
        }
        */
        var res = factory.apply(null,[])
        res.__class__ = cls.$dict
        var init_func = null
        try{init_func = __BRYTHON__.builtins.getattr(res,'__init__')}
        catch(err){}
        if(init_func!==null){
            var args = [], pos=0
            for(var i=1, _len_i = arguments.length; i < _len_i;i++){args[pos++]=arguments[i]}
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
    // __bases__ : set to an empty tuple in py_list.js after tuple is defined
    __name__:'object',
    $native:true
}

// Function for comparison operators
// In a<b, if b defines __gt__, use b.__gt__(a)
var reverse_func = {'__lt__':'__gt__',
    '__gt__':'__lt__',
    '__le__': '__ge__',
    '__ge__': '__le__'
}
var $ObjectNI = function(name,op){
    return function(self, other){
        var klass = $B.get_class(other), 
            other_comp = _b_.getattr(klass, reverse_func[name])
        if(other_comp.__func__===$ObjectDict[reverse_func[name]]){
            throw _b_.TypeError('unorderable types: object() '+op+
                ' '+ _b_.str($B.get_class(other).__name__)+'()')
        }else{
            return other_comp(other, self)
        }
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

$ObjectDict.__delattr__ = function(self,attr){
    _b_.getattr(self, attr) // raises AttributeError if necessary
    delete self[attr]; 
    return _b_.None
}

$ObjectDict.__dir__ = function(self) {
    var objects = [self], 
        pos=1,
        klass = self.__class__ || $B.get_class(self)
    objects[pos++] = klass
    var mro = klass.__mro__
    for (var i=0, _len_i = mro.length; i < _len_i; i++) {
        objects[pos++]=mro[i]
    }

    var res = [], pos=0
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
            if(attr=='__mro__'){continue}
            res[pos++]=attr
        }
    }
    res = _b_.list(_b_.set(res))
    _b_.list.$dict.sort(res)
    return res
}

$ObjectDict.__eq__ = function(self,other){
    // equality test defaults to identity of objects
    //test_issue_1393
    var _class=$B.get_class(self)
    if (_class.$native || _class.__name__ == 'function') {
       var _class1=$B.get_class(other)
       if (!_class1.$native && _class1.__name__ != 'function') {
          return _b_.getattr(other, '__eq__')(self)
       }
    }
    return self===other
}

$ObjectDict.__format__ = function(){
    var $ = $B.args('__format__', 2, {self:null, spec:null},
        ['self', 'spec'], arguments, {}, null, null)
    if($.spec!==''){throw _b_.TypeError("non-empty format string passed to object.__format__")}
    return _b_.getattr($.self, '__repr__')()
}

$ObjectDict.__ge__ = $ObjectNI('__ge__','>=')

$ObjectDict.__getattribute__ = function(obj,attr){
    
    var klass = obj.__class__ || $B.get_class(obj)
    if(attr==='__class__'){
        return klass.$factory
    }
    var res = obj[attr],args=[]
    
    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        function check(obj, kl, attr){
            if(kl.$methods){
                var method = kl.$methods[attr]
                if(method!==undefined){
                    return method(obj)
                }
            }
            var v=kl[attr]
            if(v!==undefined){
                return v
            }else if(attr=='__str__' && kl['__repr__']!==undefined){
                // If the class doesn't define __str__ but defines __repr__,
                // use __repr__
                return kl['__repr__']
            }
        }
        res = check(obj, klass, attr)
        if(res===undefined){
            var mro = klass.__mro__
            for(var i=0, _len_i = mro.length; i < _len_i;i++){
                res = check(obj, mro[i], attr)
                if(res!==undefined){break}
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

        if(res.__class__===_b_.property.$dict){
            return res.__get__(res, obj, klass)
        }

        var __get__ = _b_.getattr(res,'__get__',null)

        // For descriptors, attribute resolution is done by applying __get__
        if(__get__!==null){
            try{return __get__.apply(null,[obj, klass])}
            catch(err){
                console.log('error in get.apply', err)
                console.log(__get__+'')
                throw err
            }
        }
        
        if(typeof res=='object'){
            if(__get__ && (typeof __get__=='function')){
                get_func = function(x,y){return __get__.apply(x,[y,klass])}
            }
        }
        
        if(__get__===null && (typeof res=='function')){
            __get__ = function(x){return x}
        }
        if(__get__!==null){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            var res1 = __get__.apply(null,[res,obj,klass])
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
                
                // Same thing if the attribute is a method of an instance
                // =================
                // class myRepr:
                //     def repr(self, a):
                //         return a
                //    
                // class myclass:
                //     _repr=myRepr()
                //     repr= _repr.repr
                //
                //     def myfunc(self):
                //         return self.repr('test')
                // =================
                // In function myfunc, self.repr is an instance of MyRepr,
                // it must be used as is, not transformed into a method

                else if(res1.__class__===$B.$MethodDict){
                    return res
                }

                // instance method object
                return $B.make_method(attr, klass, res)(obj)
                
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
            _ga = klass['__getattr__']
            if(_ga===undefined){
                var mro = klass.__mro__
                for(var i=0, len=mro.length; i < len;i++){
                    _ga = mro[i]['__getattr__']
                    if(_ga!==undefined){
                        break
                    }
                }
            }
        }
        if(_ga!==undefined){
            try{return _ga(obj,attr)}
            catch(err){}
        }
        // for special methods such as __mul__, look for __rmul__ on operand
        if(attr.substr(0,2)=='__' && attr.substr(attr.length-2)=='__'){
            var attr1 = attr.substr(2,attr.length-4) // stripped of __
            var rank = opnames.indexOf(attr1)
            if(rank > -1){
                var rop = '__r'+opnames[rank]+'__' // name of reflected operator
                var func = function(){
                    try{
                        // Operands must be of different types
                        if($B.get_class(arguments[0])===klass){throw Error('')}
                        return _b_.getattr(arguments[0],rop)(obj)
                    }catch(err){
                        var msg = "unsupported operand types for "+
                            opsigns[rank]+": '"+ klass.__name__+"' and '"+
                            $B.get_class(arguments[0]).__name__+"'"
                        throw _b_.TypeError(msg)
                    }
                }
                func.$infos = {__name__ : klass.__name__+'.'+attr}
                return func
            }
        }
        //throw AttributeError('object '+obj.__class__.__name__+" has no attribute '"+attr+"'")
    }
}

$ObjectDict.__gt__ = $ObjectNI('__gt__','>')

$ObjectDict.__hash__ = function (self) { 
    var hash = self.__hashvalue__
    if(hash!==undefined){return hash}
    return self.__hashvalue__=$B.$py_next_hash--;
}

$ObjectDict.__init__ = function(){return _b_.None}

$ObjectDict.__le__ = $ObjectNI('__le__','<=')

$ObjectDict.__lt__ = $ObjectNI('__lt__','<')

$ObjectDict.__mro__ = []

$ObjectDict.__new__ = function(cls){
    if(cls===undefined){throw _b_.TypeError('object.__new__(): not enough arguments')}
    return {__class__ : cls.$dict}
}

$ObjectDict.__ne__ = function(self,other){
    return !_b_.getattr(self, '__eq__')(other)
}

$ObjectDict.__repr__ = function(self){
    if(self===object) return "<class 'object'>"
    if(self.__class__===$B.$factory) return "<class '"+self.$dict.__name__+"'>"
    if(self.__class__.__module__!==undefined){
        return "<"+self.__class__.__module__+"."+self.__class__.__name__+" object>"
    }else{
        return "<"+self.__class__.__name__+" object>"
    }
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
    return _b_.None
}
$ObjectDict.__setattr__.__str__ = function(){return 'method object.setattr'}

$ObjectDict.__str__ = $ObjectDict.__repr__

$ObjectDict.__subclasshook__ = function(){return _b_.NotImplemented}

// constructor of the built-in class 'object'
function object(){return {__class__:$ObjectDict}}

object.$dict = $ObjectDict
// object.__class__ = $factory : this is done in py_types
$ObjectDict.$factory = object
object.__repr__ = object.__str__ = function(){return "<class 'object'>"}

$B.make_class = function(class_obj){
    // class_obj has at least an attribute "name", and possibly an attribute
    // init

    function A(){
        var res = {__class__:A.$dict}
        if(class_obj.init){
            class_obj.init.apply(null, 
                [res].concat(Array.prototype.slice.call(arguments)))
        }
        return res
    }

    A.__class__ = $B.$factory

    A.$dict = {
        __class__: $B.type,
        __name__: class_obj.name
    }
    A.$dict.__mro__ = [object.$dict]

    return A
}

return object

})(__BRYTHON__)
