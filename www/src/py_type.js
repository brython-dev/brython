;(function($B){

var _b_=$B.builtins

// generic code for class constructor
$B.$class_constructor = function(class_name,class_obj,parents,parents_names,kwargs){
    var metaclass = _b_.type  // DRo put here, because is used inside if and later

    // DRo - Begin
    // if kwargs is not undefined, we have the standard behavior
    // but if "undefined, then the call is from type and class_obj is already a dict
    // and no need to check for parents is needed, because a runtime error will
    // have been generated before getting here (or will be generated if it's not
    // a valid parent
    if(kwargs !== undefined) {
        var cl_dict=_b_.dict(), bases=null
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
    for(var i=0;i<kwargs.length;i++){
            var key=kwargs[i][0],val=kwargs[i][1]
            if(key=='metaclass'){metaclass=val}
            else{
        throw _b_.TypeError("type() takes 1 or 3 arguments")
            }
    }
    var mro0 = class_obj
    } else {
    var cl_dict = class_obj  // already a dict
    bases = parents
    var mro0 = cl_dict.$string_dict  // to replace class_obj in method creation
    }

    // DRo - Begin

    /* see if __init_subclass__ is defined in any of the parents
     * We can't use __getattribute__ since it must be defined directly on a parent,
     * not further up the mro.
     */
    var init_subclass = function init_subclass(){};
    for (var i=0;i<bases.length;i++) {
        if (bases[i].$dict.$methods) {
            var __init_subclass__ = bases[i].$dict.$methods.__init_subclass__;
            if (__init_subclass__) {
                init_subclass = function init_subclass(cls) {
                    var kw = {
                        $nat:true,
                        kw:{}
                    }
                    for (var kwidx=0;kwidx<kwargs.length;kwidx++){
                        kw.kw[kwargs[kwidx][0]] = kwargs[kwidx][1];
                    }
                    /* We can't simply __init_subclass__()(kw);
                     * because __init_subclass__ is bound to the parent.
                     * We can't look up __init_subclass__ on factory directly,
                     * since it might be overridden.  This also sidesteps
                     * needing to mark __init_subclass__ as implicitly a @classmethod
                     * */
                    __init_subclass__().$infos.__func__.apply(null, [cls, kw]);
                }
                break;
            }
        }
    }

    // Create the class dictionary
    var class_dict = {
        __name__ : class_name.replace('$$',''),
        __bases__ : bases,
        __dict__ : cl_dict
    }

    // DRo - slots will have been defined in class dict during type
    // or in class definition in class_obj. mro0 simplifies the choosing
    class_dict.__slots__ = mro0.__slots__

    class_dict.__mro__ = make_mro(bases, cl_dict)

    // Check if at least one method is abstract (cf PEP 3119)
    // If this is the case, the class cannot be instanciated
    var is_instanciable = true,
        non_abstract_methods = {},
        abstract_methods = {},
        mro = [class_dict].concat(class_dict.__mro__)


    for(var i=0;i<mro.length;i++){
        var kdict = i == 0 ? mro0 : mro[i]  // DRo mr0 set above to choose rightly
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
    for(var i=0;i<mro.length;i++){
        var _slots = mro[i].__slots__
        if(_slots!==undefined){
            if(typeof _slots == 'string'){_slots = [_slots]}
            else{_slots = _b_.list(_slots)}
            for(var j=0;j<_slots.length;j++){
                cl_dict.$slots = cl_dict.$slots || {}
                cl_dict.$slots[_slots[j]]=class_dict.__mro__[i]
            }
        }
    }

    // If no metaclass is specified for the class, see if one of the parents
    // has a metaclass set
    // DRo. The initial comparison for the current metaclass is against
    // _b_.type which is the default value.
    // The comparison inside the loop is kept against $B.$type, because
    // as done below, the actual value in __class__ is metaclass.$dict
    // and the actual value in _b_.type.__class__ = $B.type (further below)
    if(metaclass === _b_.type) {
        for(var i=1;i<mro.length;i++){
            if(mro[i].__class__ !== $B.$type){
                metaclass = mro[i].__class__.$factory
        break
            }
        }
    }

    class_dict.__class__ = metaclass.$dict

    // Get method __new__ of metaclass
    var meta_new = $B.$type.__getattribute__(metaclass.$dict,'__new__')

    // DRo - BEGIN
    // __new__ doesn't return a factory but the created "class". This gives
    // __init__ chance to perform further initialization
    // Create the factory function of the class
    if(meta_new.__func__===$B.$type.__new__){
        var kls = _b_.type.$dict.__new__(_b_.type, class_name, bases, cl_dict)
    }else{
        var kls = meta_new(metaclass, class_name, bases, cl_dict)
    }
    // DRo - END

    // DRo - BEGIN
    // create the factory function, extracted from type.__new__
    var meta_call = $B.$type.__getattribute__(metaclass.$dict,'__call__', kls)

    if(meta_call.__func__===$B.$type.__call__){
        var factory = $instance_creator(kls)  // same behavior as before
    }else{
        // Implement custom factory function
        var factory = function() {
            // The class may not be instanciable if it has at least one abstract method
            if(kls.$instanciable!==undefined){
                return function(){throw _b_.TypeError(
                    "Can't instantiate abstract "+
                    "class interface with abstract methods")}
            }
            var args = [kls.$factory]
            for(var i=0; i < arguments.length; i++){
                args.push(arguments[i])
            }
            return meta_call.apply(null, args)
        }
        // keep a reference to the default "type" factory for super calls
        factory.$dfactory = $instance_creator(kls)
    }

    factory.__class__ = $B.$factory
    factory.$dict = kls
    factory.$is_func = true // to speed up calls

    // factory compares equal to class_dict
    // so that instance.__class__ compares equal to factory
    factory.__eq__ = function(other){return other===factory.__class__}
    kls.$factory = factory
    // DRo - END

    // DRo - BEGIN
    // With the factory created (class in brython), the call to __init__ can be done
    var meta_init = $B.$type.__getattribute__(metaclass.$dict,'__init__', kls)
    if(meta_init.__func__===$B.$type.__init__){
        _b_.type.$dict.__init__(kls.$factory, class_name, bases, cl_dict)
    }else{
        meta_init(class_name, bases, cl_dict)  // classmethod already
    }
    // DRo - END

    class_dict.$factory = factory

    // Set new class as subclass of its parents
    for(var i=0;i<parents.length;i++){
        parents[i].$dict.$subclasses  = parents[i].$dict.$subclasses || []
        parents[i].$dict.$subclasses.push(factory)
    }

    if(metaclass===_b_.type) {
        init_subclass(factory);
        return factory
    }

    for(var attr in class_dict){
        factory.$dict[attr] = class_dict[attr]
    }

    // DRo ... above extracted from __new__
    factory.$dict.$factory = factory

    // set functions defined in metaclass dictionary as class methods, except __new__
    for(var member in metaclass.$dict){
       if(typeof metaclass.$dict[member]=='function' && member != '__new__'){
          metaclass.$dict[member].$type='classmethod'
       }
    }

    // DRo ... above extracted from __new__
    // factory.$is_func = true

    if(!is_instanciable){
        function nofactory(){
            throw _b_.TypeError("Can't instantiate abstract class interface"+
                " with abstract methods "+Object.keys(abstract_methods).join(', '))}
        for(var attr in factory){nofactory[attr] = factory[attr]}
        init_subclass(nofactory);
        return nofactory
    }

    init_subclass(factory);
    return factory
}

$B.make_method = function(attr, klass, func){
    // Return a method, based on a function defined in a class
    var method
    switch(func.$type) {
      case undefined:
      case 'function':
        // the attribute is a function : return an instance method,
        // called with the instance as first argument
        method = function(instance){
            var instance_method = function(){
                var local_args = [instance]
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    local_args.push(arguments[i])
                }
                return func.apply(instance, local_args)
            }
            instance_method.__class__ = $B.$MethodDict
            instance_method.$infos = {
                __class__:klass.$factory,
                __func__:func,
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
        method = function(obj){
            var class_method = function(){
                var local_args=0;
                if (obj !== undefined) {
                    local_args = [obj.__class__.$factory]
                } else {
                    local_args = [klass.$factory]
                }
                var pos=local_args.length
                for(var i=0, _len_i = arguments.length; i < _len_i;i++){
                    local_args[pos++]=arguments[i]
                }
                return func.apply(null, local_args)
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

_b_.type = function(obj, bases, cl_dict){
    if(arguments.length==1){
        if(obj.__class__===$B.$factory){
            // Get type of a class
            return obj.$dict.__class__.$factory
        }
        return $B.get_class(obj).$factory
    }

    // DRo - Begin
    // Instead of calling type.__new__ which now returns a class and not
    // a factory, the existing $class_constructor is reused. The arguments
    // are slightly different and in different order
    // 1. name: in this case "obj"
    // 2. class_obj which is an object containing the definitions in the class
    // 3. parents: in this case the bases
    // 4. parents_names: which is not needed, because invoking this function
    //    should fail if something wrong is given dynamically to "type"
    // 5. kwargs: no such thing in type ... pass as undefined as a flag for
    //    $class_constructor to know it's coming from type
    return $B.$class_constructor(obj, cl_dict, bases, undefined, undefined)
    // DRo - End
}

_b_.type.__class__ = $B.$factory

$B.$type = {$factory: _b_.type, __name__:'type'}
$B.$type.__class__ = $B.$type
$B.$type.__mro__ = [_b_.object.$dict]
_b_.type.$dict = $B.$type

$B.$type.__new__ = function(meta, name, bases, cl_dict){
    // DRo - cls changed to meta to reflect that the class (cls) hasn't
    // yet been created. It's about to be created by "meta"

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
    // DRo this is also done before entering __new__ in the generic
    // class constructor
    class_dict.__mro__ = make_mro(bases, cl_dict)

    // Reset the attribute __class__
    class_dict.__class__ = class_dict.__mro__[0].__class__

    // DRo this no longer returns a factory but just the class_dict which is
    // basically the class itself
    // type() returns the class (it's dict)
    return class_dict
}


// DRo - BEGIN
$B.$type.__init__ = function(cls, name, bases, cl_dict){
    // Returns nothing
    // Performs initialization of cls which is the class created by the
    // metaclass __new__ (either from type or custom
}
// DRo - END

// DRo - BEGIN
$B.$type.__call__ = function(){
    // invoked via super ... there is a specific metaclass.__call__
    // during class construction the default factory was stored under
    // $dfactory for the klass which is the 1st argument because
    // this is a classmethod
    $f = arguments[0].$dfactory
    args = []
    for(var i=1; i < arguments.length; i++){
        args.push(arguments[i])
    }
    return $f.apply(null, args)
}
// DRo - END

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

// DRo Begin/End - Added metaclassed as flag during class construction
$B.$type.__getattribute__=function(klass, attr, metaclassed){

    switch(attr) {
      // DRo BEGIN -- there is now a specific type.__call__
      // case '__call__':
      //  return $instance_creator(klass)
      // DRo END
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
    var res = klass[attr]

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
    // DRo Begin -- these 2 are classmethods
        if(metaclassed !== undefined) {
            if(attr=='__init__'){
                res.$type='classmethod'
            } else if(attr=='__call__') {
                res.$type='classmethod'
            }
        }
    // DRo End
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
                            if(klass.$native){
                                return "<method '"+attr+"' of '"+
                                    klass.__name__+"' objects>"
                            }
                            return '<function '+klass.__name__+'.'+attr+'>'
                        }
                    }(attr)
                    break;
                case 'classmethod':
                    // class method : called with the class as first argument
                    // DRo Begin - metaclassed indicates the classmethod is
                    // being requested during class construction
                    if(metaclassed === undefined) {
                        args = [klass.$factory]
                    } else {
                        // $factory is used as a flag for the __call__ conumdrum
                        // __call__ is the factory but can only be so after
                        // checking itself against the default. Hence the need
                        // to manually control at first the class parameter
                        // passing to __call__
                        if(metaclassed.$factory === undefined) {
                            // too early in class construction
                            args = []
                        } else {
                            args = [metaclassed.$factory]
                        }
                    }
                    // DRo End
                    __self__ = klass
                    __repr__ = __str__ = function(){
                        var x = '<built-in method '+klass.__name__+'.'+attr
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
            var method = (function(initial_args, attr){
                    return function(){
                        // class method
                        // make a local copy of initial args
                        var local_args = initial_args.slice(),
                            pos=local_args.length
                        for(var i=0;i < arguments.length;i++){
                            local_args[pos++]=arguments[i]
                        }
                        return res.apply(null, local_args)
                    }})(args, attr)
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
    // return the function to initalise a class instance

    // The class may not be instanciable if it has at least one abstract method
    if(klass.$instanciable!==undefined){
        return function(){throw _b_.TypeError("Can't instantiate abstract "+
            "class interface with abstract methods")}
    }

    var new_func = klass.__new__
    for(var i=0;i<klass.__mro__.length && new_func===undefined;i++){
        new_func = klass.__mro__[i].__new__
    }

    // Get __init__ method. Ignore object.__init__
    var init_func = klass.__init__
    for(var i=0;i<klass.__mro__.length - 1 && init_func===undefined;i++){
        init_func = klass.__mro__[i].__init__
    }

    if(init_func===undefined && new_func===_b_.object.$dict.__new__){
        // most simple case : no specific __init__ or __new__
        return function(){
            if(arguments.length>0){
               throw _b_.TypeError("object() takes no parameters")
            }
            return {__class__: klass}
        }
    }else if(new_func===_b_.object.$dict.__new__ ||
            new_func===$B.$type.__new__){
        // default __new__ method, specific __init__
        return function(){
            var obj = {__class__:klass}
            var args = [obj]
            for(var i=0, len=arguments.length; i<len; i++){
                args.push(arguments[i])
            }
            if(init_func!==undefined){init_func.apply(null, args)}
            return obj
        }
    }else{
        // specific __new__ and __init__
        return function(){
            var args = [klass.$factory]
            for(var i=0, len=arguments.length; i<len; i++){
                args.push(arguments[i])
            }
            var obj = new_func.apply(null, args),
                args = [obj]
            for(var i=0, len=arguments.length; i<len; i++){
                args.push(arguments[i])
            }
            // __initialized__ is set in object.__new__ if klass
            // has a method __init__
            if(!obj.__initialized__ && init_func!==undefined){
                init_func.apply(null, args)
            }
            return obj
        }
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
    // Internal attributes __name__, __func__, __self__ etc.
    // are stored in self.$infos
    var infos = self.$infos
    switch(attr){
        case "__func__":
        case "__self__":
            return infos[attr]
    }
    infos = infos.__func__.$infos
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
    return '<bound method '+self.$infos.__class__.$dict.__name__+'.'+
        self.$infos.__name__+' of '+_b_.str(self.$infos.__self__)+'>'
}
$MethodFactory.$dict = $B.$MethodDict

$B.$InstanceMethodDict = {__class__:$B.$type,
    __name__:'instancemethod',
    __mro__:[_b_.object.$dict],
    $factory:$MethodFactory
}

})(__BRYTHON__)
