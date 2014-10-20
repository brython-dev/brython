;(function($B){

var _b_=$B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name,class_obj,parents,parents_names,kwargs){
    var cl_dict=_b_.dict(),bases=null
    // transform class object into a dictionary
    for(var attr in class_obj){
        _b_.dict.$dict.__setitem__(cl_dict,attr,class_obj[attr])
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
    if(bases.indexOf(_b_.object)==-1){
        bases=bases.concat(_b_.tuple([_b_.object]))
    }
    // see if there is 'metaclass' in kwargs
    var metaclass = _b_.type
    for(var i=0;i<kwargs.length;i++){
        var key=kwargs[i][0],val=kwargs[i][1]
        if(key=='metaclass'){metaclass=val}
    }
    if(metaclass===_b_.type){
        // see if one of the subclasses uses a metaclass
        for(var i=0;i<parents.length;i++){
            if(parents[i].$dict.__class__!==$B.$type){
                metaclass = parents[i].__class__.$factory
                break
            }
        }
    }
    if(metaclass===_b_.type) return _b_.type(class_name,bases,cl_dict)
    
    // create the factory function
    var factory = (function(_class){
                return function(){
                    return $instance_creator(_class).apply(null,arguments)
                }
          })($B.class_dict)
    var new_func = _b_.getattr(metaclass,'__new__')
    var factory = _b_.getattr(metaclass,'__new__').apply(null,[factory,class_name,bases,cl_dict])
    _b_.getattr(metaclass,'__init__').apply(null,[factory,class_name,bases,cl_dict])
    // set functions defined in metaclass dictionary as class methods, except __new__
    for(var member in metaclass.$dict){
       if(typeof metaclass.$dict[member]=='function' && member != '__new__'){
          metaclass.$dict[member].$type='classmethod'
       }
    }
    factory.__class__ = {
            __class__:$B.$type,
            $factory:metaclass,
            is_class:true,
            __code__: {'__class__': $B.CodeDict},
            __mro__:metaclass.$dict.__mro__
    }
    factory.$dict.__class__ = metaclass.$dict
    factory.$is_func = true
    return factory
}

_b_.type = function(name,bases,cl_dict){
    // if called with a single argument, returns the class of the first argument
    if(arguments.length==1){return $B.get_class(name).$factory}

    // Else return a new type object. This is essentially a dynamic form of the 
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
    var class_dict = $B.class_dict = new Object()
        
    // class attributes
    class_dict.__class__ = $B.$type
    class_dict.__name__ = name.replace('$$','')
    class_dict.__bases__ = bases
    class_dict.__dict__ = cl_dict
    
    // set class attributes for faster lookups
    try {
        itr = $B.$dict_iterator(cl_dict)
        while (true) {
            itm = itr.next()
            class_dict[itm[0]] = itm[1]
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err } else { $B.$pop_exc() }
    }

    //class_dict.__setattr__ = function(attr,value){class_dict[attr]=value}

    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    var seqs = []
    for(var i=0;i<bases.length;i++){
        // we can't simply push bases[i].__mro__ 
        // because it would be modified in the algorithm
        if(bases[i]===_b_.str) bases[i] = $B.$StringSubclassFactory
        var bmro = []
        var _tmp=bases[i].$dict.__mro__
        for(var k=0;k<_tmp.length;k++){
            bmro.push(_tmp[k])
        }
        seqs.push(bmro)
    }

    for(var i=0;i<bases.length;i++) seqs.push(bases[i].$dict)

    var mro = []
    while(1){
        var non_empty = []
        for(var i=0;i<seqs.length;i++){
            if(seqs[i].length>0) non_empty.push(seqs[i])
        }
        if (non_empty.length==0) break
        for(var i=0;i<non_empty.length;i++){
            var seq = non_empty[i],candidate = seq[0],not_head = []
            for(var j=0;j<non_empty.length;j++){
                var s = non_empty[j]
                if(s.slice(1).indexOf(candidate)>-1){not_head.push(s)}
            }
            if(not_head.length>0){candidate=null}
            else{break}
        }
        if(candidate===null){
            throw _b_.TypeError("inconsistent hierarchy, no C3 MRO is possible")
        }
        mro.push(candidate)
        for(var i=0;i<seqs.length;i++){
            var seq = seqs[i]
            if(seq[0]===candidate){ // remove candidate
                seqs[i].shift()
            }
        }
    }
    class_dict.__mro__ = [class_dict].concat(mro)
    
    // create the factory function
    var factory = (function(_class){
            return function(){
                return $instance_creator(_class).apply(null,arguments)
            }
        })(class_dict)
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

// class of classes
$B.$type = {
    $factory: _b_.type,
    __init__ : function(self,name,bases,dct){},
    __name__:'type',
    __new__ : function(self,name,bases,dct){
        return _b_.type(name,bases,dct)
    },
    __str__ : function(){return "<class 'type'>"}
}
$B.$type.__class__ = $B.$type
$B.$type.__mro__ = [$B.$type,_b_.object.$dict]

_b_.type.$dict = $B.$type

// class of constructors
$B.$factory = {
    __class__:$B.$type,
    $factory:_b_.type,
    is_class:true
}
$B.$factory.__mro__ = [$B.$factory,$B.$type]

// this could not be done before $type and $factory are defined
_b_.object.$dict.__class__ = $B.$type
_b_.object.__class__ = $B.$factory

$B.$type.__getattribute__=function(klass,attr){
    // klass is a class dictionary : in getattr(obj,attr), if obj is a factory,
    // we call $type.__getattribute__(obj.$dict,attr)
    switch(attr) {
      case '__call__':
        //if(attr==='__call__') 
        return $instance_creator(klass)
      case '__eq__':
        //if(attr==='__eq__'){
        return function(other){return klass.$factory===other}
      case '__ne__':
        //if(attr==='__ne__'){
        return function(other){return klass.$factory!==other}
      case '__repr__':
        //if(attr==='__repr__'){
        return function(){return "<class '"+klass.__name__+"'>"}
      case '__str__':
        //if(attr==='__str__'){
        return function(){return "<class '"+klass.__name__+"'>"}
      case '__class__':
        //if(attr==='__class__')
        return klass.__class__.$factory
      case '__doc__':
        //if(attr==='__doc__') 
        return klass.__doc__
      case '__setattr__':
        //if(attr==='__setattr__'){
        if(klass['__setattr__']!==undefined) return klass['__setattr__']
        return function(key,value){
            if(typeof value=='function'){
                klass[key]=value //function(){return value.apply(null,arguments)}
                //klass[key].$type = 'instancemethod' // for attribute resolution
            }else{
                klass[key]=value
            }
        }
      case '__delattr__':
        //if(attr==='__delattr__'){
        if(klass['__delattr__']!==undefined) return klass['__delattr__']
        return function(key){delete klass[key]}
    }//switch

    var res = klass[attr],is_class=true
    //if(attr=='__init__'){console.log(klass.__name__+' direct attr '+attr+' '+res)}
    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        var mro = klass.__mro__
        if(mro===undefined){console.log('mro undefined for class '+klass+' name '+klass.__name__)}
        //if(attr=='register'){console.log('mro '+mro+' is class '+klass.is_class)}
        for(var i=0;i<mro.length;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
        if(res===undefined){
            // try in klass class
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
        }
    }
    //if(attr=='__init__'){console.log(klass.__name__+' attr '+attr+' step 2 '+res)}
    if(res!==undefined){

        // If the attribute is a property, return it
        if(res.__class__===$B.$PropertyDict) return res

        var get_func = res.__get__
        if(get_func===undefined && (typeof res=='function')){
            get_func = function(x){return x}
        }

        if(get_func === undefined) return res
        
        //if(get_func!==undefined){ // descriptor
            // __new__ is a static method
        if(attr=='__new__'){res.$type='staticmethod'}
        var res1 = get_func.apply(null,[res,$B.builtins.None,klass])
        var args
        if(typeof res1=='function'){
            res.__name__ = attr
            // method
            var __self__,__func__=res1,__repr__,__str__
            switch (res.$type) {
                case undefined:
                case 'function':
                case 'instancemethod':
                    //if(res.$type===undefined || res.$type==='function' || res.$type==='instancemethod'){
                    // function called from a class
                    args = []
                    __repr__ = __str__ = function(){
                        return '<unbound method '+klass.__name__+'.'+attr+'>'
                    }
                    break;
                case 'classmethod':
                    //}else if(res.$type==='classmethod'){
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
                    //}else if(res.$type==='staticmethod'){
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+klass.__name__+'.'+attr+'>'
                    }
                    break;
            } // switch

            // return a method that adds initial args to the function
            // arguments
            var method = (function(initial_args){
                    return function(){
                        // class method
                        // make a local copy of initial args
                        //console.log('function '+attr+' of '+klass.__name__+' '+res)
                        var local_args = initial_args.slice()
                        for(var i=0;i < arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        return res.apply(null,local_args)
                    }})(args)
                method.__class__ = {
                    __class__:$B.$type,
                    __name__:'method',
                    __mro__:[$B.builtins.object.$dict]
                }
                method.__eq__ = function(other){
                    return other.__func__ === __func__
                }
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                method.__code__ = {'__class__': $B.CodeDict}
                method.__doc__ = res.__doc__ || ''
                method.im_class = klass
                return method
        }
        //}else{
        //    return res
        //}
    }else{
        // search __getattr__
        //throw AttributeError("type object '"+klass.__name__+"' has no attribute '"+attr+"'")
    }
}

function $instance_creator(klass){
    // return the function to initalise a class instance
    return function(){
        var new_func=null,init_func=null,obj
        // apply __new__ to initialize the instance
        if(klass.__bases__.length==1 && klass.__new__==undefined){
            obj = {__class__:klass}
        }else{
            
            try{
                new_func = _b_.getattr(klass,'__new__')
            }catch(err){$B.$pop_exc()}
            if(new_func!==null){
                var args = [klass.$factory]
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                obj = new_func.apply(null,args)
            }
        }
        // __initialized__ is set in object.__new__ if klass has a method __init__
        if(!obj.__initialized__){
            try{init_func = _b_.getattr(klass,'__init__')}
            catch(err){$B.$pop_exc()}
            if(init_func!==null){
                var args = [obj]
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                init_func.apply(null,args)
            }
        }
        return obj
    }
}

// used as the factory for method objects
function $MethodFactory(){}
$MethodFactory.__name__ = 'method'
$MethodFactory.__class__ = $B.$factory
$MethodFactory.__repr__ = $MethodFactory.__str__ = function(){return 'method'}

$B.$MethodDict = {__class__:$B.$type,
    __name__:'method',
    __mro__:[_b_.object.$dict],
    $factory:$MethodFactory
}
$MethodFactory.$dict = $B.$MethodDict

$B.$InstanceMethodDict = {__class__:$B.$type,
    __name__:'instancemethod',
    __mro__:[_b_.object.$dict],
    $factory:$MethodFactory
}

})(__BRYTHON__)
