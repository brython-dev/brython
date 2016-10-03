;(function($B){

var _b_=$B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name,class_obj,parents,parents_names,kwargs){
    var cl_dict=_b_.dict(),bases=null
    // transform class object into a dictionary
    for(var attr in class_obj){
        cl_dict.$string_dict[attr] = class_obj[attr]
    }
    // check if parents are defined
    if(parents!==undefined){
        for(var i=0;i<parents.length;i++){
            if(parents[i]===undefined){
                // restore the line of class definition
                $B.line_info = class_obj.$def_line
                throw _b_.NameError("name '"+parents_names[i]+"' is not defined")
            }
        }
    }
    bases = parents

    // see if there is 'metaclass' in kwargs
    var metaclass = _b_.type
    for(var i=0;i<kwargs.length;i++){
        var key=kwargs[i][0],val=kwargs[i][1]
        if(key=='metaclass'){metaclass=val}
    }

    // Create the class dictionary    
    var class_dict = {
        __name__ : class_name.replace('$$',''),
        __bases__ : bases,
        __dict__ : cl_dict
    }

    // set class attributes for faster lookups
    var items = $B.$dict_items(cl_dict);
    for(var i=0;i<items.length;i++){
        class_dict[items[i][0]] = items[i][1]
    }

    //class_dict.__mro__ = [class_dict].concat(make_mro(bases, cl_dict))
    class_dict.__mro__ = make_mro(bases, cl_dict)
    
    // Check if at least one method is abstract (cf PEP 3119)
    // If this is the case, the class cannot be instanciated
    var is_instanciable = true, 
        non_abstract_methods = {}, 
        abstract_methods = {},
        mro = [class_dict].concat(class_dict.__mro__)

    for(var i=0;i<mro.length;i++){
        var kdict = mro[i]
        for(var attr in kdict){
            if(non_abstract_methods[attr]){continue}
            var v = kdict[attr]
            if(typeof v=='function' && v.__class__!==$B.$factory){
                if(v.__isabstractmethod__===true){
                    is_instanciable = false
                    abstract_methods[attr]=true
                }else{
                    non_abstract_methods[attr]=true
                }
            }
        }
    }
    
    // Check if class has __slots__
    var slots = []
    for(var i=0;i<mro.length;i++){
        var _slots = mro[i].__slots__
        if(_slots!==undefined){
            _slots = _b_.list(_slots)
            for(var j=0;j<_slots.length;j++){
                cl_dict.$slots = cl_dict.$slots || {}
                cl_dict.$slots[_slots[j]]=class_dict.__mro__[i]
            }
        }
    }

    // If no metaclass is specified for the class, see if one of the parents 
    // has a metaclass set
    for(var i=1;i<mro.length;i++){
        if(mro[i].__class__ !== $B.$type){
            metaclass = mro[i].__class__.$factory
        }
    }
    
    class_dict.__class__ = metaclass.$dict
    
    // Get method __new__ of metaclass
    var meta_new = $B.$type.__getattribute__(metaclass.$dict,'__new__')
    
    // Create the factory function of the class
    if(meta_new.__func__===$B.$type.__new__){
        var factory = _b_.type.$dict.__new__(_b_.type, class_name, bases, cl_dict)
    }else{
        var factory = meta_new(metaclass, class_name, bases, cl_dict)
    }
    
    class_dict.$factory = factory
        
    // Set new class as subclass of its parents
    for(var i=0;i<parents.length;i++){
        parents[i].$dict.$subclasses  = parents[i].$dict.$subclasses || []
        parents[i].$dict.$subclasses.push(factory)
    }

    if(metaclass===_b_.type) return factory
    
    for(var attr in class_dict){
        factory.$dict[attr] = class_dict[attr]
    }

    factory.$dict.$factory = factory

    // set functions defined in metaclass dictionary as class methods, except __new__
    for(var member in metaclass.$dict){
       if(typeof metaclass.$dict[member]=='function' && member != '__new__'){
          metaclass.$dict[member].$type='classmethod'
       }
    }
        
    factory.$is_func = true
    
    if(!is_instanciable){
        function nofactory(){
            throw _b_.TypeError("Can't instantiate abstract class interface"+
                " with abstract methods "+Object.keys(abstract_methods).join(', '))}
        for(var attr in factory){nofactory[attr] = factory[attr]}
        return nofactory
    }

    return factory
}

$B.$class_constructor1 = function(class_name,class_obj){
    if(class_obj.__init__===undefined){
        var creator = function(){
            this.__class__ = class_obj
        }
    }else{
        var creator = function(args){
            this.__class__ = class_obj
            class_obj.__init__.apply(null,[this].concat(Array.prototype.slice.call(args)))
        }
    }
    var factory = function(){return new creator(arguments)}
    factory.__class__ = $B.$factory
    factory.__name__ = class_name
    factory.$dict = class_obj
    class_obj.__class__ = $B.$type
    class_obj.__name__ = class_name
    class_obj.__mro__ = [_b_.object.$dict]
    for(var attr in class_obj){
        factory.prototype[attr] = class_obj[attr]
    }
    class_obj.$factory = factory
    return factory
}

$B.make_method = function(attr, klass, func){
    // Return a method, based on a function defined in a class
    var __self__,__func__= func,__repr__,__str__, method
    switch(func.$type) {
      case undefined:
      case 'function':
        // the attribute is a function : return an instance method,
        // called with the instance as first argument
        var f = _b_.getattr(func, '__get__', func)
        method = function(instance){
            var instance_method = function(){
                var local_args = [instance]
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    local_args.push(arguments[i])
                }
                return f.apply(instance, local_args)
            }
            instance_method.__class__ = $B.$MethodDict
            instance_method.$infos = {
                __class__:klass.$factory,
                __func__:f,
                __name__:attr,
                __self__:instance
            }

            return instance_method
        }
        break
      case 'instancemethod':
        // The attribute is a method of an instance of another class
        // Return it unchanged
        return func
      case 'classmethod':
        // class method : called with the class as first argument
        method = function(){
            var class_method = function(){                
                var local_args = [klass.$factory]
                var pos=local_args.length
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    local_args[pos++]=arguments[i]
                }
                return func.apply(null,local_args)
            }
            class_method.__class__ = $B.$MethodDict
            class_method.$infos = {
                __class__:klass.$factory,
                __func__:func,
                __name__:attr
            }

            return class_method
        }
        break
      case 'staticmethod':
        // static methods have no __self__ or __func__
        method = function(){return func}
        break
    }

    return method

}

function make_mro(bases, cl_dict){
    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    var seqs = [], pos1=0
    for(var i=0;i<bases.length;i++){
        // we can't simply push bases[i].__mro__ 
        // because it would be modified in the algorithm
        if(bases[i]===_b_.str) bases[i] = $B.$StringSubclassFactory
        else if(bases[i]===_b_.list) bases[i] = $B.$ListSubclassFactory
        var bmro = [], pos=0
        if(bases[i].$dict===undefined ||
            bases[i].$dict.__mro__===undefined){
            throw _b_.TypeError('Object passed as base class is not a class')
        }
        bmro[pos++] = bases[i].$dict
        var _tmp = bases[i].$dict.__mro__
        if(_tmp[0]===bases[i].$dict){
            console.log('bizarre', bases[i].$dict)
            _tmp.splice(0, 1)
        }
        for(var k=0;k<_tmp.length;k++){
            bmro[pos++]=_tmp[k]
        }
        seqs[pos1++]=bmro
    }

    if(bases.indexOf(_b_.object)==-1){
        bases=bases.concat(_b_.tuple([_b_.object]))
    }

    for(var i=0;i<bases.length;i++) seqs[pos1++]=bases[i].$dict

    var mro = [], mpos=0
    while(1){
        var non_empty = [], pos=0
        for(var i=0;i<seqs.length;i++){
            if(seqs[i].length>0) non_empty[pos++]=seqs[i]
        }
        if (non_empty.length==0) break
        for(var i=0;i<non_empty.length;i++){
            var seq = non_empty[i],candidate = seq[0],not_head = [],pos=0
            for(var j=0;j<non_empty.length;j++){
                var s = non_empty[j]
                if(s.slice(1).indexOf(candidate)>-1){not_head[pos++]=s}
            }
            if(not_head.length>0){candidate=null}
            else{break}
        }
        if(candidate===null){
            throw _b_.TypeError("inconsistent hierarchy, no C3 MRO is possible")
        }
        mro[mpos++]=candidate
        for(var i=0;i<seqs.length;i++){
            var seq = seqs[i]
            if(seq[0]===candidate){ // remove candidate
                seqs[i].shift()
            }
        }
    }
    if(mro[mro.length-1]!==_b_.object.$dict){
        mro[mpos++]=_b_.object.$dict
    }

    return mro

}

// class of classes
_b_.type = function(obj, bases, cl_dict){
    if(arguments.length==1){
        if(obj.__class__===$B.$factory){
            // Get type of a class
            return obj.$dict.__class__.$factory
        }
        return $B.get_class(obj).$factory
    }
        
    return $B.$type.__new__(_b_.type, obj, bases, cl_dict)
}

_b_.type.__class__ = $B.$factory

$B.$type = {$factory: _b_.type, __name__:'type'}
$B.$type.__class__ = $B.$type
$B.$type.__mro__ = [_b_.object.$dict]
_b_.type.$dict = $B.$type

$B.$type.__new__ = function(cls, name, bases, cl_dict){

    // Return a new type object. This is essentially a dynamic form of the 
    // class statement. The name string is the class name and becomes the 
    // __name__ attribute; the bases tuple itemizes the base classes and 
    // becomes the __bases__ attribute; and the dict dictionary is the 
    // namespace containing definitions for class body and becomes the 
    // __dict__ attribute
    
    // A Python class is implemented as 2 Javascript objects :
    // - a dictionary that holds the class attributes and the method resolution 
    //   order, computed from the bases with the C3 algorithm
    // - a factory function that creates instances of the class
    // The dictionary is the attribute "$dict" of the factory function
    // type() returns the factory function
    
    // Create the class dictionary
    var class_dict = {__class__ : $B.$type,
        __name__ : name.replace('$$',''),
        __bases__ : bases,
        __dict__ : cl_dict,
        $methods : {},
        $slots: cl_dict.$slots
    }

    // set class attributes for faster lookups
    var items = $B.$dict_items(cl_dict);
    for(var i=0;i<items.length;i++){
        var name=items[i][0], v=items[i][1]
        class_dict[name] = v
        if(typeof v=='function' 
          && v.__class__!==$B.$factory
          && v.__class__!==$B.$MethodDict){
            class_dict.$methods[name] = $B.make_method(name, class_dict, v, v)
        }
    }
    
    //class_dict.__mro__ = [class_dict].concat(make_mro(bases, cl_dict))
    class_dict.__mro__ = make_mro(bases, cl_dict)
    if(class_dict.__mro__[0]===class_dict){
        console.log('first is class', class_dict)
    }
    
    // Reset the attribute __class__
    class_dict.__class__ = class_dict.__mro__[0].__class__

    if(class_dict.__mro__[0]===class_dict){
        console.log('358 first is class', class_dict)
    }
    
    // create the factory function
    var factory = $instance_creator(class_dict)

    if(class_dict.__mro__[0]===class_dict){
        console.log('365 first is class', class_dict)
    }

    factory.__class__ = $B.$factory
    factory.$dict = class_dict
    factory.$is_func = true // to speed up calls
    
    // factory compares equal to class_dict
    // so that instance.__class__ compares equal to factory
    factory.__eq__ = function(other){return other===factory.__class__}
    class_dict.$factory = factory

        
    // type() returns the factory function
    return factory
}

// class of constructors
$B.$factory = {
    __class__:$B.$type,
    $factory:_b_.type,
    is_class:true
}
$B.$factory.__mro__ = [$B.$type, _b_.object.$dict]

_b_.type.__class__ = $B.$factory

// this could not be done before $type and $factory are defined
_b_.object.$dict.__class__ = $B.$type
_b_.object.__class__ = $B.$factory

$B.$type.__getattribute__=function(klass, attr){
    
    switch(attr) {
      case '__call__':
        return $instance_creator(klass)
      case '__eq__':
        return function(other){return klass.$factory===other}
      case '__ne__':
        return function(other){return klass.$factory!==other}
      case '__class__':
        return klass.__class__.$factory
      case '__doc__':
        return klass.__doc__ || _b_.None
      case '__setattr__':
        if(klass['__setattr__']!==undefined) return klass['__setattr__']
        return function(key,value){klass[key]=value}
      case '__delattr__':
        if(klass['__delattr__']!==undefined) return klass['__delattr__']
        return function(key){delete klass[key]}
    }//switch
    //console.log('get attr '+attr+' of klass '+klass)
    var res = klass[attr], is_class=true

    if(res===undefined){
        // search in classes hierarchy, following method resolution order

        var v = klass[attr]
        if(v===undefined){
            var mro = klass.__mro__
            for(var i=0;i<mro.length;i++){
                var v=mro[i][attr]
                if(v!==undefined){
                    res = v
                    break
                }
            }
        }else{res=v}

        if(res===undefined){
            // try in klass class
            var v = klass.__class__[attr]
            if(v===undefined){
                var cl_mro = klass.__class__.__mro__
                if(cl_mro!==undefined){
                    for(var i=0;i<cl_mro.length;i++){
                        var v=cl_mro[i][attr]
                        if(v!==undefined){
                            res = v
                            break
                        }
                    }
                }
            }else{
                res = v
            }
        }
        
        if(res===undefined){
            // search a method __getattr__
            var getattr=null,
                v = klass.__class__.__getattr__
            if(v===undefined){
                for(var i=0;i<cl_mro.length;i++){
                    if(cl_mro[i].__getattr__!==undefined){
                        getattr = cl_mro[i].__getattr__
                        break
                    }
                }
            }else{
                getattr = v
            }
            if(getattr!==null){
                if(getattr.$type=='classmethod'){
                    return getattr(klass.$factory, attr)
                }
                return getattr(attr)
            }
        }
    }
        
    if(res===undefined && klass.$slots && klass.$slots[attr]!==undefined){
        return member_descriptor(klass.$slots[attr], attr)
    }
    
    if(res!==undefined){

        // If the attribute is a property, return it
        if(res.__class__===$B.$PropertyDict) return res
        
        var get_func = res.__get__
        if(get_func===undefined && (typeof res=='function')){
            get_func = function(x){return x}
        }

        if(get_func === undefined) return res
        
        // __new__ is a static method
        if(attr=='__new__'){res.$type='staticmethod'}
        var res1 = get_func.apply(null,[res,$B.builtins.None,klass])

        if(res1.__class__===$B.$factory){
            // attribute is a class
            return res1        
        }

        if(typeof res1=='function'){
            res.__name__ = attr
            // method
            var __self__,__func__=res1,__repr__,__str__, args
            switch (res.$type) {
                case undefined:
                case 'function':
                case 'instancemethod':
                    // function called from a class
                    args = []
                    __repr__ = __str__ = function(attr){
                        return function(){
                            return '<function '+klass.__name__+'.'+attr+'>'            
                        }
                    }(attr)
                    break;
                case 'classmethod':
                    // class method : called with the class as first argument
                    args = [klass.$factory]
                    __self__ = klass
                    __repr__ = __str__ = function(){
                        var x = '<bound method '+klass.__name__+'.'+attr
                        x += ' of '+klass.__name__+'>'
                        return x
                    }
                    break;
                case 'staticmethod':
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(attr){
                        return function(){
                            return '<function '+klass.__name__+'.'+attr+'>'
                        }
                    }(attr)
                    break;
            } // switch

            // return a method that adds initial args to the function
            // arguments
            var method = (function(initial_args){
                    return function(){
                        // class method
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        var pos=local_args.length
                        for(var i=0;i < arguments.length;i++){
                            local_args[pos++]=arguments[i]
                        }
                        return res.apply(null,local_args)
                    }})(args)
                method.__class__ = $B.$FunctionDict
                method.__eq__ = function(other){
                    return other.__func__ === __func__
                }
                for(var attr in res){method[attr]=res[attr]}
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                method.__code__ = {'__class__': $B.CodeDict}
                method.__doc__ = res.__doc__ || ''
                method.im_class = klass
                return method
        }
    }
}


function $instance_creator(klass){

    if(klass.__mro__[0]===klass){
        console.log('559 first is class', klass)
    }

    // The class may not be instanciable if it has at least one abstract method
    if(klass.$instanciable!==undefined){
        console.log('klass', klass.__name__,'not instanciable')
        return function(){throw _b_.TypeError("Can't instantiate abstract "+
            "class interface with abstract methods")}
    }
    // return the function to initalise a class instance
    var new_func = null
    try{new_func = _b_.getattr(klass,'__new__')}
    catch(err){}
    
    var init_func = null
    try{init_func = _b_.getattr(klass,'__init__')}
    catch(err){}

    if(klass.__mro__[0]===klass){
        console.log('578 first is class', klass)
    }
    
    // Variable "simple" is set if class only has one parent and this
    // parent is "object" or "type"
    var simple=false
    if(klass.__bases__.length==0){simple=true}
    else if(klass.__bases__.length==1){
        switch(klass.__bases__[0]){
            case _b_.object:
            case _b_.type:
                simple=true
                break
            default:
                simple=false
                break
        }
    }
        
    if(simple && klass.__new__==undefined && init_func!==null){
        // most usual case
        
        return function(){
            var obj = {__class__:klass}
            init_func.apply(null,[obj].concat(Array.prototype.slice.call(arguments)))
            return obj
        }

    }

    return function(){
        var obj
        var _args = Array.prototype.slice.call(arguments)
        
        // apply __new__ to initialize the instance
        if(simple && klass.__new__==undefined){
            obj = {__class__:klass}
        }else{
            if(new_func!==null){
                obj = new_func.apply(null,[klass.$factory].concat(_args))
            }
        }
        // __initialized__ is set in object.__new__ if klass has a method __init__
        if(!obj.__initialized__){
            if(init_func!==null){
                init_func.apply(null,[obj].concat(_args))
            }
        }
        return obj
    }
}

// Used for class members, defined in __slots__
function member_descriptor(klass, attr){
    return {__class__:member_descriptor.$dict, klass: klass, attr: attr}
}
member_descriptor.__class__ = $B.$factory
member_descriptor.$dict = {
    __class__: $B.$type,
    __name__: 'member_descriptor',
    $factory: member_descriptor,
    
    __str__: function(self){
        return "<member '"+self.attr+"' of '"+self.klass.__name__+
        "' objects>"}
}
member_descriptor.$dict.__mro__ = [_b_.object.$dict]

// used as the factory for method objects
function $MethodFactory(){}
$MethodFactory.__class__ = $B.$factory

$B.$MethodDict = {__class__:$B.$type,
    __name__:'method',
    $factory:$MethodFactory
}

$B.$MethodDict.__eq__ = function(self, other){
    return self.$infos !== undefined &&
           other.$infos !== undefined &&
           self.$infos.__func__===other.$infos.__func__ && 
           self.$infos.__self__===other.$infos.__self__
}

$B.$MethodDict.__ne__ = function(self, other){
    return !$B.$MethodDict.__eq__(self,other)
}

$B.$MethodDict.__getattribute__ = function(self, attr){
    // Internal attributes __name__, __module__, __doc__ etc. 
    // are stored in self.$infos.__func__.$infos
    var infos = self.$infos.__func__.$infos
    if(infos && infos[attr]){
        if(attr=='__code__'){
            var res = {__class__:$B.$CodeDict}
            for(var attr in infos.__code__){
                res[attr]=infos.__code__[attr]
            }
            return res
        }else{
            return infos[attr]
        }
    }else{
        return _b_.object.$dict.__getattribute__(self, attr)
    }
}
$B.$MethodDict.__mro__=[_b_.object.$dict]
$B.$MethodDict.__repr__ = $B.$MethodDict.__str__ = function(self){
    var res = '<bound method '+self.$infos.__class__.$dict.__name__+'.' 
    res += self.$infos.__name__+' of '
    return res+_b_.str(self.$infos.__self__)+'>'
}
$MethodFactory.$dict = $B.$MethodDict

$B.$InstanceMethodDict = {__class__:$B.$type,
    __name__:'instancemethod',
    __mro__:[_b_.object.$dict],
    $factory:$MethodFactory
}

})(__BRYTHON__)
