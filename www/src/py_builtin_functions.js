// built-in functions
;(function($B){

eval($B.InjectBuiltins())

_b_.__debug__ = false

var $ObjectDict = _b_.object.$dict,
    odga = $ObjectDict.__getattribute__

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
// maps comparison operator to name of inverse operator (eg <= for >)
$B.$inv_comps = {'>': 'le', '>=': 'lt', '<': 'ge', '<=': 'gt'}

function abs(obj){
    if(isinstance(obj,_b_.int)) return _b_.int(Math.abs(obj));
    if(isinstance(obj,_b_.float)) return _b_.float(Math.abs(obj));
    if(hasattr(obj,'__abs__')){return getattr(obj,'__abs__')()};

    throw _b_.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")
}

function all(obj){
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(!bool(elt)) return false
        }catch(err){return true}
    }
}

function any(obj){
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(bool(elt)) return true
        }catch(err){return false}
    }
}

function ascii(obj) {
    var res = repr(obj), res1='', cp
    for(var i=0;i<res.length;i++){
        cp = res.charCodeAt(i)
        if(cp<128){res1 += res.charAt(i)}
        else if(cp<256){res1 += '\\x'+cp.toString(16)}
        else{res1 += '\\u'+cp.toString(16)}
    }
    return res1
}

// used by bin, hex and oct functions
function $builtin_base_convert_helper(obj, base) {
  var prefix = "";
  switch (base) {
     case 2:
       prefix='0b'; break;
     case 8:
       prefix='0o'; break;
     case 16:
       prefix='0x'; break;
     default:
         console.log('invalid base:' + base)
  }

  if (obj.__class__ === $B.LongInt.$dict) {
     if (obj.pos) return prefix + $B.LongInt.$dict.to_base(obj, base)
     return '-' + prefix + $B.LongInt.$dict.to_base(-obj, base)
  }

  var value=$B.$GetInt(obj)

  if (value === undefined) {
     // need to raise an error
     throw _b_.TypeError('Error, argument must be an integer or contains an __index__ function')
  }

  if (value >=0) return prefix + value.toString(base);
  return '-' + prefix + (-value).toString(base);
}


// bin() (built in function)
function bin(obj) {
    if(isinstance(obj, _b_.int)){
        return $builtin_base_convert_helper(obj, 2)
    }
    return getattr(obj, '__index__')()
}

function bool(obj){ // return true or false
    if(obj===null || obj === undefined ) return false
    switch(typeof obj) {
      case 'boolean':
        return obj
      case 'number':
      case 'string':
        if(obj) return true
        return false
      default:
        try{return getattr(obj,'__bool__')()}
        catch(err){
            try{return getattr(obj,'__len__')()>0}
            catch(err){return true}
        }
    }// switch
}

function callable(obj) {return hasattr(obj,'__call__')}

function chr(i) {
  if (i < 0 || i > 1114111) _b_.ValueError('Outside valid range')

  return String.fromCharCode(i)
}

//classmethod() (built in function)
function classmethod(func) {
    func.$type = 'classmethod'
    return func
}
classmethod.__class__=$B.$factory
classmethod.$dict = {__class__:$B.$type,
    __name__:'classmethod',
    $factory: classmethod
}    
classmethod.$dict.__mro__ = [$ObjectDict]

//compile() (built in function)
$B.$CodeObjectDict = {
    __class__:$B.$type,
    __name__:'code',
    __repr__:function(self){return '<code object '+self.name+', file '+self.filename+'>'},
}
$B.$CodeObjectDict.__str__ = $B.$CodeObjectDict.__repr__
$B.$CodeObjectDict.__mro__ = [$ObjectDict]

function compile(source, filename, mode) {
    var $=$B.args('compile', 6,
        {source:null, filename:null, mode:null, flags:null, dont_inherit:null,
         optimize:null},
         ['source', 'filename', 'mode', 'flags', 'dont_inherit','optimize'],
         arguments,{flags:0, dont_inherit:false, optimize:-1},null,null)
    
    var module_name = '$exec_' + $B.UUID()
    var local_name = module_name; //'' + $B.UUID()

    var root = $B.py2js(source,module_name,[module_name],local_name)
    $B.clear_ns(module_name)
    $.__class__ = $B.$CodeObjectDict
    $.co_flags = $.flags
    return $
}

compile.__class__ = $B.factory
$B.$CodeObjectDict.$factory = compile
compile.$dict = $B.$CodeObjectDict

//function complex is located in py_complex.js

// built-in variable __debug__
var __debug__ = $B.debug>0

function delattr(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has 
    // a method __delete__(), use it
    var klass = $B.get_class(obj)
    var res = obj[attr]
    if(res===undefined){
        res = klass[attr]
        if(res===undefined){
            var mro = klass.__mro__
            for(var i=0;i<mro.length;i++){
                var res = mro[i][attr]
                if(res!==undefined){break}
            }
        }
    }
    if(res!==undefined && res.__delete__!==undefined){
        res.__delete__(res,obj,attr)
    }else{
        getattr(obj,'__delattr__')(attr)
    }
    return None
}

function dir(obj){
    
    if(obj===undefined){
        // if dir is called without arguments, use globals
        var frame = $B.last($B.frames_stack),
            globals_obj = frame[3],
            res = _b_.list(), pos=0
        for(var attr in globals_obj){
            if(attr.charAt(0)=='$' && attr.charAt(1) != '$') {
                // exclude internal attributes set by Brython
                continue
            }
            res[pos++]=attr
        }
        _b_.list.$dict.sort(res)
        return res
    }
    
    var klass = obj.__class__ || $B.get_class(obj)
    
    if(klass && klass.is_class){obj=obj.$dict}
    else {
        // We first look if the object has the __dir__ method
        try {
            var res = getattr(obj, '__dir__')()
            res = _b_.list(res)
            res.sort()
            return res
        } catch (err){}
    }
    var res = [], pos=0
    for(var attr in obj){
        if(attr.charAt(0)!=='$' && attr!=='__class__'){
            res[pos++]=attr
        }
    }
    res.sort()
    return res
}

//divmod() (built in function)
function divmod(x,y) {
   var klass = x.__class__ || $B.get_class(x)
   return _b_.tuple([getattr(klass, '__floordiv__')(x,y), 
       getattr(klass, '__mod__')(x,y)])
}

var $EnumerateDict = {__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__ = [$ObjectDict]

function enumerate(){
    var $ns = $B.args("enumerate",2,{iterable:null,start:null},
        ['iterable', 'start'],arguments,{start:0}, null, null)
    var _iter = iter($ns["iterable"])
    var _start = $ns["start"]
    var res = {
        __class__:$EnumerateDict,
        __getattr__:function(attr){return res[attr]},
        __iter__:function(){return res},
        __name__:'enumerate iterator',
        __next__:function(){
            res.counter++
            return _b_.tuple([res.counter,next(_iter)])
        },
        __repr__:function(){return "<enumerate object>"},
        __str__:function(){return "<enumerate object>"},
        counter:_start-1
    }
    for(var attr in res){
        if(typeof res[attr]==='function' && attr!=="__class__"){
            res[attr].__str__=(function(x){
                return function(){return "<method wrapper '"+x+"' of enumerate object>"}
            })(attr)
        }
    }
    return res
}
enumerate.__class__ = $B.$factory
enumerate.$dict = $EnumerateDict
$EnumerateDict.$factory = enumerate

//eval() (built in function)
function $eval(src, _globals, _locals){

    var current_frame = $B.frames_stack[$B.frames_stack.length-1]
    if(current_frame!==undefined){
        var current_locals_id = current_frame[0].replace(/\./,'_'),
            current_globals_id = current_frame[2].replace(/\./,'_')
    }

    var is_exec = arguments[3]=='exec',leave = false

    if(src.__class__===$B.$CodeObjectDict){
        src = src.source
    }
    
    // code will be run in a specific block
    var globals_id = '$exec_'+$B.UUID(),
        locals_id,
        parent_block_id
    if(_locals===_globals || _locals===undefined){
        locals_id = globals_id
    }else{
        locals_id = '$exec_'+$B.UUID()
    }
    // Initialise the object for block namespaces
    eval('var $locals_'+globals_id+' = {}\nvar $locals_'+locals_id+' = {}')
    
    // Initialise block globals
    if(_globals===undefined){
        var gobj = current_frame[3],
            ex = ''
        for(var attr in current_frame[3]){
            ex == '$locals_'+globals_id+'["'+attr+
                '"] = gobj["'+attr+'"]';
        }
        parent_block_id = current_globals_id
        ex += 'var $locals_'+current_globals_id+'=gobj;'
        eval(ex)
    }else{
        $B.bound[globals_id] = {}
        var items = _b_.dict.$dict.items(_globals), item
        while(1){
            try{
                var item = next(items)
                eval('$locals_'+globals_id+'["'+item[0]+'"] = item[1]')
                $B.bound[globals_id][item[0]]=true
            }catch(err){
                break
            }
        }
        parent_block_id = '__builtins__'
    }

    // Initialise block locals
    if(_locals===undefined){
        if(_globals!==undefined){
            eval('var $locals_'+locals_id+' = $locals_'+globals_id)        
        }else{
            var lobj = current_frame[1],
                ex = ''
            for(var attr in current_frame[1]){
                ex += '$locals_'+locals_id+'["'+attr+
                    '"] = current_frame[1]["'+attr+'"];'
            }
            eval(ex)
        }
    }else{
        var items = _b_.dict.$dict.items(_locals), item
        while(1){
            try{
                var item = next(items)
                eval('$locals_'+locals_id+'["'+item[0]+'"] = item[1]')
            }catch(err){
                break
            }
        }
    }
    //var nb_modules = Object.keys(__BRYTHON__.modules).length
    //console.log('before exec', nb_modules)

    var root = $B.py2js(src, globals_id, locals_id, parent_block_id),
        leave_frame = true

    try{
        // If the Python function is eval(), not exec(), check that the source
        // is an expression
        if(!is_exec){
            var try_node = root.children[root.children.length-2],
                instr = $B.last(try_node.children)
            var type = instr.context.tree[0].type
            switch(type){
            
                case 'expr':
                case 'list_or_tuple':
                case 'op':
                case 'ternary':
                    // If the source is an expression, what we must execute is the
                    // block inside the "try" clause : if we run root, since it's
                    // wrapped in try / finally, the value produced by 
                    // eval(root.to_js()) will be None
                    var children = try_node.children
                    root.children.splice(root.children.length-2, 2)
                    for(var i=0;i<children.length;i++){
                        root.add(children[i])
                    }
                    break
                default:
                    leave_frame = false
                    throw _b_.SyntaxError("eval() argument must be an expression",
                        '<string>', 1, 1, src)
            }
        }

        var js = root.to_js()
        
        var res = eval(js)
        var gns = eval('$locals_'+globals_id)

        // Update _locals with the namespace after execution
        if(_locals!==undefined){
            var lns = eval('$locals_'+locals_id)
            var setitem = getattr(_locals,'__setitem__')
            for(var attr in lns){
                if(attr.charAt(0)=='$'){continue}
                setitem(attr, lns[attr])
            }
        }else{
            for(var attr in lns){current_frame[1][attr] = lns[attr]}
        }
        
        if(_globals!==undefined){
            // Update _globals with the namespace after execution
            var setitem = getattr(_globals,'__setitem__')
            for(var attr in gns){
                if(attr.charAt(0)=='$'){continue}
                setitem(attr, gns[attr])
            }
        }else{
            for(var attr in gns){
                current_frame[3][attr] = gns[attr]
            }
        }
        
        // fixme: some extra variables are bleeding into locals...
        /*  This also causes issues for unittests */
        if(res===undefined) return _b_.None
        return res
    }catch(err){
        if(err.$py_error===undefined){throw $B.exception(err)}
        throw err
    }finally{
        
        $B.clear_ns(globals_id)
        $B.clear_ns(locals_id)

        if(!is_exec && leave_frame){
            // For eval(), the finally clause with "leave_frame" was removed
            // so we must execute it here
            $B.frames_stack.pop()
        }
    }
}
$eval.$is_func = true

function exec(src, globals, locals){
    return $eval(src, globals, locals,'exec') || _b_.None
}

exec.$is_func = true

var $FilterDict = {__class__:$B.$type,__name__:'filter'}
$FilterDict.__iter__ = function(self){return self}
$FilterDict.__repr__ = $FilterDict.__str__ = function(){return "<filter object>"},
$FilterDict.__mro__ = [$ObjectDict]

function filter(){
    if(arguments.length!=2){throw _b_.TypeError(
            "filter expected 2 arguments, got "+arguments.length)}
    var func=arguments[0],iterable=iter(arguments[1])
    if(func === _b_.None) func = bool

    var __next__ = function() {
        while(true){
            var _item = next(iterable)
            if (func(_item)){return _item}
        }
    }
    return {
        __class__: $FilterDict,
        __next__: __next__
    }
}

function format(value, format_spec) {
  if(hasattr(value, '__format__')) return getattr(value,'__format__')(format_spec)
  
  throw _b_.NotImplementedError("__format__ is not implemented for object '" + _b_.str(value) + "'")
}

function attr_error(attr, cname){
    var msg = "bad operand type for unary #: '"+cname+"'"
    switch(attr){
        case '__neg__':
            throw _b_.TypeError(msg.replace('#','-'))
        case '__pos__':
            throw _b_.TypeError(msg.replace('#','+'))
        case '__invert__':
            throw _b_.TypeError(msg.replace('#','~'))   
        case '__call__':
            throw _b_.TypeError("'"+cname+"'"+' object is not callable')     
        default:
            throw _b_.AttributeError("'"+cname+"' object has no attribute '"+attr+"'")
    }
}

$B.show_getattr = function(){
    var items = []
    for(var attr in $B.counter){items.push([$B.counter[attr], attr])}
    items.sort(function(x,y){
        return x[0]>y[0] ? 1 : x[0]==y[0] ? 0 : -1
    })
    items.reverse()
    for(var i=0;i<10;i++){console.log(items[i])}
}

function getattr(obj,attr,_default){

    if(obj===undefined){console.log('get attr', attr, 'of undefined')}
    var klass = obj.__class__
    
    if(klass===undefined){
        // avoid calling $B.get_class in simple cases for performance
        if(typeof obj=='string'){klass = _b_.str.$dict}
        else if(typeof obj=='number'){
            klass = obj % 1 == 0 ? _b_.int.$dict : _b_.float.$dict
        }
        else{klass = $B.get_class(obj)}
    }

    if(klass===undefined){
        // for native JS objects used in Python code
        if(obj[attr]!==undefined) return $B.$JS2Py(obj[attr])
        if(_default!==undefined) return _default
        throw _b_.AttributeError('object has no attribute '+attr)
    }
    
    switch(attr) {
      case '__call__':
        if (typeof obj=='function'){
           return obj
        } else if (klass===$B.JSObject.$dict && typeof obj.js=='function'){
          return function(){
              var res = obj.js.apply(null, arguments)
              if(res===undefined){return None} // JSObject would throw an exception
              return $B.JSObject(res)
          }
        }
        break
      case '__class__':
        // attribute __class__ is set for all Python objects
        // return the factory function
        return klass.$factory
      case '__dict__':
        // attribute __dict__ returns a dictionary wrapping obj
        return $B.obj_dict(obj) // defined in py_dict.js
      case '__doc__':
        // for builtins objects, use $B.builtins_doc
        for(var i=0;i<builtin_names.length;i++){
            if(obj===_b_[builtin_names[i]]){
                  _get_builtins_doc()
                return $B.builtins_doc[builtin_names[i]]
            }
        }
        break
      case '__mro__':
        if(klass===$B.$factory){
            // The attribute __mro__ of classes is a list of class
            // dictionaries ; it must be returned as a list of class
            // factory functions
            var res = [obj.$dict], 
                pos = 0, 
                mro = obj.$dict.__mro__
            for(var i=0;i<mro.length;i++){
                res[pos++]=mro[i].$factory
            }
            return res
        }
        break
      case '__subclasses__':
          if(klass===$B.$factory){
              var subclasses = obj.$dict.$subclasses || []
              return function(){return subclasses}
          }
        break
    }//switch

    if(typeof obj == 'function') {
      var value = obj.__class__ === $B.$factory ? obj.$dict[attr] : obj[attr]
      if(value !== undefined) {
        if (attr == '__module__' || attr =='__hash__') { // put other attrs here too..
          return value
        } 
      }
    }
    if(klass.$native){
        if(klass[attr]===undefined){
            var object_attr = _b_.object.$dict[attr]
            if(object_attr!==undefined){klass[attr]=object_attr}
            else{
                if(_default===undefined){attr_error(attr, klass.__name__)}
                return _default
            }
        }
        if(klass.descriptors && klass.descriptors[attr]!==undefined){
            return klass[attr](obj)
        }
        if(typeof klass[attr]=='function'){
            // new is a static method
            if(attr=='__new__') return klass[attr].apply(null,arguments)
            
            var method = function(){
                var args = [obj], pos=1
                for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
                return klass[attr].apply(null,args)
            }
            method.__class__ = $B.$MethodDict
            method.$infos = {
                __class__: klass.$factory,
                __func__ : klass[attr],
                __name__ : attr,
                __self__ : obj
            }
            method.__str__ = method.__repr__ = function(){
                return '<built-in method '+attr+' of '+klass.__name__+' object>'
            }
            return method
        }
        return klass[attr]
    }

    var is_class = klass.is_class, mro, attr_func

    if(is_class){
        attr_func=$B.$type.__getattribute__
        if(obj.$dict===undefined){console.log('obj '+obj+' $dict undefined')}
        obj=obj.$dict
    }else{
        attr_func = klass.__getattribute__
        if(attr_func===undefined){
            var mro = klass.__mro__
            for(var i=0, len=mro.length;i<len;i++){
                attr_func = mro[i]['__getattribute__']
                if(attr_func!==undefined){break}
            }
        }
    }
    if(typeof attr_func!=='function'){
        console.log(attr+' is not a function '+attr_func)
    }
    
    if(attr_func===odga){
        var res = obj[attr]
        if(res!==undefined && res.__set__===undefined){
            return obj[attr]
        }
    }

    try{var res = attr_func(obj, attr)}
    catch(err){
        if(_default!==undefined) return _default
        throw err
    }

    if(res!==undefined){return res}
    if(_default !==undefined){return _default}
    
    var cname = klass.__name__
    if(is_class){cname=obj.__name__}
    
    attr_error(attr, cname)
}

//globals() (built in function)

function globals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    return $B.obj_dict($B.last($B.frames_stack)[3])
}

function hasattr(obj,attr){
    try{getattr(obj,attr);return true}
    catch(err){return false}
}

function hash(obj){
    if(arguments.length!=1){
        throw _b_.TypeError("hash() takes exactly one argument ("+
            arguments.length+" given)")
    }
    if (obj === undefined) console.log('hash:obj is undefined', obj)
    if (obj.__hashvalue__ !== undefined) return obj.__hashvalue__
    if (isinstance(obj, _b_.int)) return obj.valueOf()
    if (isinstance(obj, bool)) return _b_.int(obj)
    if (obj.__hash__ !== undefined) {
       return obj.__hashvalue__=obj.__hash__()
    }
    if(obj.__class__===$B.$factory){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    var hashfunc = getattr(obj, '__hash__', _b_.None)
    
    if (hashfunc == _b_.None) return obj.__hashvalue__=$B.$py_next_hash--

    if(hashfunc.$infos === undefined){
        return obj.__hashvalue__ = hashfunc()
    }

    // If no specific __hash__ method is supplied for the instance but
    // a __eq__ method is defined, the object is not hashable
    //
    // class A:
    //     def __eq__(self, other):
    //         return False
    //
    // d = {A():1}
    //
    // throws an exception : unhashable type: 'A'

    if(hashfunc.$infos.__func__===_b_.object.$dict.__hash__){
        if(getattr(obj,'__eq__').$infos.__func__!==_b_.object.$dict.__eq__){
            throw _b_.TypeError("unhashable type: '"+
                $B.get_class(obj).__name__+"'", 'hash')
        }else{
            return _b_.object.$dict.__hash__(obj)
        }
    }else{
        return obj.__hashvalue__= hashfunc()
    }
}

function _get_builtins_doc(){
    if($B.builtins_doc===undefined){
        // Load builtins docstrings from file builtins_doctring.js
        var url = $B.brython_path
        if(url.charAt(url.length-1)=='/'){url=url.substr(0,url.length-1)}
        url += '/builtins_docstrings.js'
        var f = _b_.open(url)
        eval(f.$content)          
        $B.builtins_doc = docs
    }
}

function help(obj){
    if (obj === undefined) obj='help'
    
    // if obj is a builtin, lets take a shortcut, and output doc string
    if(typeof obj=='string' && _b_[obj] !== undefined) {
        _get_builtins_doc()
        var _doc=$B.builtins_doc[obj]
        if (_doc !== undefined && _doc != '') {
             _b_.print(_doc)
             return
        }
    }
    // If obj is a built-in object, also use builtins_doc
    for(var i=0;i<builtin_names.length;i++){
        if(obj===_b_[builtin_names[i]]){
              _get_builtins_doc()
            _b_.print(_doc = $B.builtins_doc[builtin_names[i]])
        }
    }
    if(typeof obj=='string'){
        $B.$import("pydoc");
        var pydoc=$B.imported["pydoc"]
        getattr(getattr(pydoc,"help"),"__call__")(obj)
        return
    }
    try{return getattr(obj,'__doc__')}
    catch(err){console.log('help err '+err);return ''}
}

function hex(x) { return $builtin_base_convert_helper(x, 16)}

function id(obj) {
   if (isinstance(obj, [_b_.str, _b_.int, _b_.float])){
       return getattr(_b_.str(obj), '__hash__')()
   }else if(obj.$id!==undefined){return obj.$id}
   else{return obj.$id = $B.UUID()}
}

// The default __import__ function is a builtin
function __import__(mod_name, globals, locals, fromlist, level) {
    // TODO : Install $B.$__import__ in builtins module to avoid nested call
    var $ = $B.args('__import__',5,
        {name:null,globals:null,locals:null,fromlist:null,level:null},
        ['name', 'globals', 'locals', 'fromlist', 'level'],
        arguments, {globals:None, locals:None, fromlist:_b_.tuple(), level:0},
        null, null)
    return $B.$__import__($.name, $.globals, $.locals, $.fromlist);
}

//not a direct alias of prompt: input has no default value
function input(src) {
    var stdin = ($B.imported.sys && $B.imported.sys.stdin || $B.stdin);
    // $B.stdout.write(src); // uncomment if we are to mimic the behavior in the console
    if (stdin.__original__) { return prompt(src); }
    var val = _b_.getattr(stdin, 'readline')();
    val = val.split('\n')[0];
    if (stdin.len === stdin.pos){
        _b_.getattr(stdin, 'close')();
    }
    // $B.stdout.write(val+'\n'); // uncomment if we are to mimic the behavior in the console
    return val;
}

function isinstance(obj,arg){
    if(obj===null) return arg===None
    if(obj===undefined) return false
    if(arg.constructor===Array){
        for(var i=0;i<arg.length;i++){
            if(isinstance(obj,arg[i])) return true
        }
        return false
    }
    if(arg===_b_.int &&(obj===True || obj===False)){return True}

    var klass = obj.__class__
    
    if(klass==undefined){
        if(typeof obj=='string' && arg==_b_.str){return true}
        if(obj.contructor==Number && arg==_b_.float){return true}
        if(typeof obj=='number' && arg==_b_.int){return true}
        klass = $B.get_class(obj)
    }

    if (klass === undefined) { return false }

   // arg is the class constructor ; the attribute __class__ is the 
   // class dictionary, ie arg.$dict

   if(arg.$dict===undefined){return false}

   if(klass==$B.$factory){klass = obj.$dict.__class__}

   // Return true if one of the parents of obj class is arg
   // If one of the parents is the class used to inherit from str, obj is an
   // instance of str ; same for list

   function check(kl, arg){
      if(kl === arg.$dict){return true}
      else if(arg===_b_.str && 
          kl===$B.$StringSubclassFactory.$dict){return true}
      else if(arg===_b_.list && 
          kl===$B.$ListSubclassFactory.$dict){return true}
   }
   if(check(klass, arg)){return true}
   var mro = klass.__mro__
   for(var i=0;i<mro.length;i++){
      if(check(mro[i], arg)){return true}
   }

    // Search __instancecheck__ on arg
    var hook = getattr(arg,'__instancecheck__',null)
    if(hook!==null){return hook(obj)}

   return false
}

function issubclass(klass,classinfo){
    if(arguments.length!==2){
      throw _b_.TypeError("issubclass expected 2 arguments, got "+arguments.length)
    }
    if(!klass.__class__ || klass.__class__!==$B.$factory){
      throw _b_.TypeError("issubclass() arg 1 must be a class")
    }
    if(isinstance(classinfo,_b_.tuple)){
      for(var i=0;i<classinfo.length;i++){
         if(issubclass(klass,classinfo[i])) return true
      }
      return false
    }
    if(classinfo.__class__.is_class){
        if(klass.$dict===classinfo.$dict ||
            klass.$dict.__mro__.indexOf(classinfo.$dict)>-1){return true}
    }
    
    // Search __subclasscheck__ on classinfo
    var hook = getattr(classinfo,'__subclasscheck__',null)
    if(hook!==null){return hook(klass)}
    
    return false

}

// Utility class for iterators built from objects that have a __getitem__ and
// __len__ method
var iterator_class = $B.make_class({name:'iterator',
    init:function(self,getitem,len){
        self.getitem = getitem
        self.len = len
        self.counter = -1
    }
})
iterator_class.$dict.__next__ = function(self){
    self.counter++
    if(self.len!==null && self.counter==self.len){throw _b_.StopIteration('')}
    try{return self.getitem(self.counter)}
    catch(err){throw _b_.StopIteration('')}
}

function iter(obj){
    try{var _iter = getattr(obj,'__iter__')}
    catch(err){
        var gi = getattr(obj,'__getitem__',null),
            ln = getattr(obj,'__len__',null)
        if(gi!==null){
            if(ln!==null){
                var len = getattr(ln,'__call__')()
                return iterator_class(gi,len)
            }else{
                return iterator_class(gi,null)
            }
      }
      throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")
    }
    var res = _iter()
    try{getattr(res,'__next__')}
    catch(err){
        if(isinstance(err,_b_.AttributeError)){throw _b_.TypeError(
            "iter() returned non-iterator of type '"+
             $B.get_class(res).__name__+"'")}
    }
    return res
}

function len(obj){
    try{return getattr(obj,'__len__')()}
    catch(err){
        throw _b_.TypeError("object of type '"+$B.get_class(obj).__name__+
            "' has no len()")
    }
}

function locals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    var locals_obj = $B.last($B.frames_stack)[1]
    return $B.obj_dict(locals_obj)
}


var $MapDict = {__class__:$B.$type,__name__:'map'}
$MapDict.__mro__ = [$ObjectDict]
$MapDict.__iter__ = function (self){return self}

function map(){
    var func = getattr(arguments[0],'__call__')
    var iter_args = [], pos=0
    for(var i=1;i<arguments.length;i++){iter_args[pos++]=iter(arguments[i])}
    var __next__ = function(){
        var args = [], pos=0
        for(var i=0;i<iter_args.length;i++){
            args[pos++]=next(iter_args[i])
        }
        return func.apply(null,args)
    }
    var obj = {
        __class__:$MapDict,
        __repr__:function(){return "<map object>"},
        __str__:function(){return "<map object>"},
        __next__: __next__
    }
    return obj
}


function $extreme(args,op){ // used by min() and max()
    var $op_name='min'
    if(op==='__gt__') $op_name = "max"

    if(args.length==0){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
    var last_arg = args[args.length-1],
        nb_args = args.length,
        has_kw_args = false,
        has_default = false,
        func = false
    if(last_arg.$nat=='kw'){
        nb_args--
        last_arg = last_arg.kw
        for(var attr in last_arg){
            switch(attr){
                case 'key':
                    func = last_arg[attr]
                    break
                case '$$default': // Brython changes "default" to "$$default"
                    var default_value = last_arg[attr]
                    has_default = true
                    break
                default:
                    throw _b_.TypeError("'"+attr+"' is an invalid keyword argument for this function")
                    break
            }
        }
    }
    if(!func){func = function(x){return x}}
    if(nb_args==0){
        throw _b_.TypeError($op_name+" expected 1 arguments, got 0")
    }else if(nb_args==1){
        // Only one positional argument : it must be an iterable
        var $iter = iter(args[0]),
            res = null
        while(true){
            try{
                var x = next($iter)
                if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
            }catch(err){
                if(err.__name__=="StopIteration"){
                    if(res===null){
                        if(has_default){return default_value}
                        else{throw _b_.ValueError($op_name+"() arg is an empty sequence")}
                    }else{return res}
                }
                throw err
            }
        }
    }else{
        if(has_default){
           throw _b_.TypeError("Cannot specify a default for "+$op_name+"() with multiple positional arguments")
        }
        var res = null
        for(var i=0;i<nb_args;i++){
            var x = args[i]
            if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
        }
        return res
    }
}

function max(){
    var args = [], pos=0
    for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
    return $extreme(args,'__gt__')
}


function memoryview(obj) {
  throw NotImplementedError('memoryview is not implemented')
}

function min(){
    var args = [], pos=0
    for(var i=0;i<arguments.length;i++){args[pos++]=arguments[i]}
    return $extreme(args,'__lt__')
}

function next(obj){
    var ga = getattr(obj,'__next__')
    if(ga!==undefined) return ga()
    throw _b_.TypeError("'"+$B.get_class(obj).__name__+
        "' object is not an iterator")
}


function _NotImplemented(){return {__class__:_NotImplemented.$dict}}
_NotImplemented.__class__ = $B.$factory

_NotImplemented.$dict = {
    $factory: _NotImplemented,
    __class__: $B.$type,
    __name__: 'NotImplementedType'
}
_NotImplemented.$dict.__mro__ = [$ObjectDict]

var NotImplemented = {__class__ : _NotImplemented.$dict, 
    __str__: function(){return 'NotImplemented'}
}

function $not(obj){return !bool(obj)}

function oct(x) {return $builtin_base_convert_helper(x, 8)}

function ord(c) {
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    if(typeof c=='string'){
        if (c.length == 1) return c.charCodeAt(0)     // <= strobj.charCodeAt(index)
        throw _b_.TypeError('ord() expected a character, but string of length ' + 
            c.length + ' found')
    }
    switch($B.get_class(c)) {
      case _b_.str.$dict:
        if (c.length == 1) return c.charCodeAt(0)     // <= strobj.charCodeAt(index)
        throw _b_.TypeError('ord() expected a character, but string of length ' + 
            c.length + ' found') 
      case _b_.bytes.$dict:
      case _b_.bytearray.$dict:
        if (c.source.length == 1) return c.source[0]     // <= strobj.charCodeAt(index)
        throw _b_.TypeError('ord() expected a character, but string of length ' + 
            c.source.length + ' found')       
      default:
        throw _b_.TypeError('ord() expected a character, but ' + 
            $B.get_class(c).__name__ + ' was found') 
    }
}

function pow() {
    var $ns=$B.args('pow',3,{x:null,y:null,z:null},['x','y','z'],
        arguments,{z:null},null,null)
    var x=$ns['x'],y=$ns['y'],z=$ns['z']
    var res = getattr(x,'__pow__')(y)
    if(z === null){return res}
    else{
        if(!isinstance(x, _b_.int) || !isinstance(y, _b_.int)){
            throw _b_.TypeError("pow() 3rd argument not allowed unless "+
                "all arguments are integers")
        }
        return getattr(res,'__mod__')(z)
    }
}

function $print(){
    var $ns=$B.args('print',0,{},[],arguments,
        {},'args', 'kw')
    var ks = $ns['kw'].$string_dict
    var end = ks['end'] === undefined ? '\n' : ks['end'],
        sep = ks['sep'] === undefined ? ' ' : ks['sep'],
        file = ks['file'] === undefined ? $B.stdout : ks['file'],
        args = $ns['args']

    getattr(file,'write')(args.map(_b_.str).join(sep)+end)
    return None
}
$print.__name__ = 'print'
$print.is_func = true

// property (built in function)
var $PropertyDict = {
    __class__ : $B.$type,
    __name__ : 'property',
}
$PropertyDict.__mro__ = [$ObjectDict]
$B.$PropertyDict = $PropertyDict

function property(fget, fset, fdel, doc) {
    var p = {
        __class__ : $PropertyDict,
        __doc__ : doc || "",
        $type:fget.$type,
        fget:fget,
        fset:fset,
        fdel:fdel,
        toString:function(){return '<property>'}
    }
    p.__get__ = function(self,obj,objtype) {
        if(obj===undefined) return self
        if(self.fget===undefined) throw _b_.AttributeError("unreadable attribute")
        return getattr(self.fget,'__call__')(obj)
    }
    if(fset!==undefined){
        p.__set__ = function(self,obj,value){
            if(self.fset===undefined) throw _b_.AttributeError("can't set attribute")
            getattr(self.fset,'__call__')(obj,value)
        }
    }
    p.__delete__ = fdel;

    p.getter = function(fget){return property(fget, p.fset, p.fdel, p.__doc__)}
    p.setter = function(fset){return property(p.fget, fset, p.fdel, p.__doc__)}
    p.deleter = function(fdel){return property(p.fget, p.fset, fdel, p.__doc__)}
    return p
}

property.__class__ = $B.$factory
property.$dict = $PropertyDict
$PropertyDict.$factory = property

function repr(obj){
    if(obj.__class__===$B.$factory){
        // obj is a class (the factory function)
        // In this case, repr() doesn't use the attribute __repr__ of the
        // class or its subclasses, but the attribute __repr__ of the
        // class metaclass (usually "type") or its subclasses (usually
        // "object")
        // The metaclass is the attribute __class__ of the class dictionary
        var func = $B.$type.__getattribute__(obj.$dict.__class__,'__repr__')
        return func(obj)
    }
    var func = getattr(obj,'__repr__')
    if(func!==undefined){return func()}
    throw _b_.AttributeError("object has no attribute __repr__")
}

var $ReversedDict = {__class__:$B.$type,__name__:'reversed'}
$ReversedDict.__mro__ = [$ObjectDict]
$ReversedDict.__iter__ = function(self){return self}
$ReversedDict.__next__ = function(self){
    self.$counter--
    if(self.$counter<0) throw _b_.StopIteration('')
    return self.getter(self.$counter)
}

function reversed(seq){
    // Return a reverse iterator. seq must be an object which has a 
    // __reversed__() method or supports the sequence protocol (the __len__() 
    // method and the __getitem__() method with integer arguments starting at 
    // 0).

    try{return getattr(seq,'__reversed__')()}
    catch(err){
        if(err.__name__!='AttributeError'){throw err}
    }

    try{
        var res = {
            __class__:$ReversedDict,
            $counter : getattr(seq,'__len__')(),
            getter:getattr(seq,'__getitem__')
        }
        return res
    }catch(err){
        throw _b_.TypeError("argument to reversed() must be a sequence")
    }
}
reversed.__class__=$B.$factory
reversed.$dict = $ReversedDict
$ReversedDict.$factory = reversed

function round(arg,n){
    if(!isinstance(arg,[_b_.int,_b_.float])){
        if (! hasattr(arg,'__round__'))
            throw _b_.TypeError("type "+arg.__class__+" doesn't define __round__ method")
        if(n===undefined) return getattr(arg,'__round__')()
        else return getattr(arg,'__round__')(n)
    }
    
    if(isinstance(arg, _b_.float) && (arg.value === Infinity || arg.value === -Infinity)) {
      throw _b_.OverflowError("cannot convert float infinity to integer")
    }

    if(n===undefined) return _b_.int(Math.round(arg))
    
    if(!isinstance(n,_b_.int)){throw _b_.TypeError(
        "'"+n.__class__+"' object cannot be interpreted as an integer")}
    var mult = Math.pow(10,n)
    if(isinstance(arg, _b_.float)) {
        return _b_.float(_b_.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult))
    } else {
        return _b_.int(_b_.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult))
    }
}

function setattr(obj,attr,value){

    if(!(typeof attr=='string')){
        throw _b_.TypeError("setattr(): attribute name must be string")
    }

    switch(attr) {
      case 'alert':
      case 'case':
      case 'catch':
      case 'constructor':
      case 'Date':
      case 'delete':
      case 'default':
      case 'document':
      case 'Error':
      case 'history':
      case 'function':
      case 'location':
      case 'Math':
      case 'new':
      case 'Number':
      case 'RegExp':
      case 'this':
      case 'throw':
      case 'var':
      case 'super':
      case 'window':
        attr='$$'+attr
        break
      case '__class__':
        // Setting the attribute __class__ : value is the factory function,
        // we must set __class__ to the class dictionary
        obj.__class__ = value.$dict;return None
        break
    }
    
    if(obj.__class__===$B.$factory){ 
        // Setting attribute of a class means updating the class
        // dictionary, not the class factory function
        if(obj.$dict.$methods && typeof value=='function' 
            && value.__class__!==$B.$factory){
            // update attribute $methods
            obj.$dict.$methods[attr] = $B.make_method(attr, obj.$dict, value, value)
            return None
        }else{obj.$dict[attr]=value;return None}
    }
    
    var res = obj[attr], 
        klass = obj.__class__ || $B.get_class(obj)
    if(res===undefined && klass){
        res = klass[attr]
        if(res===undefined){
            var mro = klass.__mro__,
                _len = mro.length
            for(var i=0;i<_len;i++){
                res = mro[i][attr]
                if(res!==undefined) break
            }
        }
    }
    
    if(res!==undefined){
        // descriptor protocol : if obj has attribute attr and this attribute 
        // has a method __set__(), use it
        if(res.__set__!==undefined){
            res.__set__(res, obj, value); return None
        }
        var rcls = res.__class__, __set1__
        if(rcls!==undefined){
            var __set1__ = rcls.__set__
            if(__set1__===undefined){
                var mro = rcls.__mro__
                for(var i=0, _len=mro.length;i<_len;i++){
                    __set1__ = mro[i].__set__
                    if(__set1__){
                        break
                    }
                }
            }
        }
        if(__set1__!==undefined){
            var __set__ = getattr(res,'__set__',null)
            if(__set__ && (typeof __set__=='function')) {
                __set__.apply(res,[obj,value]);return None
            }
        }
    }

    // Use __slots__ if defined
    if(klass && klass.$slots && klass.$slots[attr]===undefined){
        throw _b_.AttributeError("'"+klass.__name__+"' object has no attribute'"+
            attr+"'")
    }
    
    // Search the __setattr__ method
    var _setattr=false
    if(klass!==undefined){
        _setattr = klass.__setattr__
        if(_setattr===undefined){
            var mro = klass.__mro__
            for(var i=0, _len=mro.length;i<_len;i++){
                _setattr = mro[i].__setattr__
                if(_setattr){break}
            }
        }
    }
    
    if(!_setattr){obj[attr]=value}else{_setattr(obj,attr,value)}
    return None
}

function sorted () {
    var $=$B.args('sorted',1,{iterable:null},['iterable'],
        arguments,{},null,'kw')
    var _list = _b_.list(iter($.iterable)),
        args = [_list]
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    _b_.list.$dict.sort.apply(null,args)
    return _list
}

// staticmethod() built in function
var $StaticmethodDict = {__class__:$B.$type,__name__:'staticmethod'}
$StaticmethodDict.__mro__ = [$ObjectDict]

function staticmethod(func) {
    func.$type = 'staticmethod'
    return func
}
staticmethod.__class__=$B.$factory
staticmethod.$dict = $StaticmethodDict
$StaticmethodDict.$factory = staticmethod

// str() defined in py_string.js

function sum(iterable,start){
    if(start===undefined) {
      start=0
    } else {
      if(typeof start === 'str') {
        throw _b_.TypeError("TypeError: sum() can't sum strings [use ''.join(seq) instead]")
      }
      
      if (_b_.isinstance(start, _b_.bytes)) {
         throw _b_.TypeError("TypeError: sum() can't sum bytes [use b''.join(seq) instead]")
      }
    }

    var res = start
    var iterable = iter(iterable)
    while(1){
        try{
            var _item = next(iterable)
            res = getattr(res,'__add__')(_item)
        }catch(err){
           if(err.__name__==='StopIteration'){break}
           else{throw err}
        }
    }
    return res
}

// super() built in function
var $SuperDict = {__class__:$B.$type,__name__:'super'}

$SuperDict.__getattribute__ = function(self,attr){
    if($SuperDict[attr]!==undefined){ // for __repr__ and __str__
        return function(){return $SuperDict[attr](self)}
    }
    
    var mro = self.__thisclass__.$dict.__mro__, 
        res
    for(var i=0;i<mro.length;i++){ // ignore the class where super() is defined
        res = mro[i][attr]
        if(res!==undefined){
            // if super() is called with a second argument, the result is bound
            if(res.__class__===$PropertyDict){
                return res.__get__(res, self.__self_class__)
            }
            if(self.__self_class__!==None){
                if(mro[i]===_b_.object.$dict){
                    var klass = self.__self_class__.__class__
                    if(klass!==$B.$type){
                        if(klass.__mro__[0]===klass){console.log('anomalie', klass)}
                        var start = -1,
                            mro2 = [klass].concat(klass.__mro__)
                        for(var j=0;j<mro2.length;j++){
                            if(mro2[j]===self.__thisclass__.$dict){
                                start=j+1
                                break
                            }
                        }
                        if(start>-1){
                            for(var j=start;j<mro2.length;j++){
                                var res1 = mro2[j][attr]
                                if(res1!==undefined){ res = res1; break}
                            }
                        }
                    }
                }
                var _args = [self.__self_class__]
                if(attr=='__new__'){_args=[]}
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        var pos=initial_args.length
                        for(var i=0;i<arguments.length;i++){
                            local_args[pos++]=arguments[i]
                        }
                        var x = res.apply(null,local_args)
                        if(x===undefined) return None
                        return x
                    }})(_args)
                method.__class__ = {
                    __class__:$B.$type,
                    __name__:'method',
                    __mro__:[$ObjectDict]
                }
                method.__func__ = res
                method.__self__ = self
                return method
            }
            return res
        }
    }
    throw _b_.AttributeError("object 'super' has no attribute '"+attr+"'")
}

$SuperDict.__mro__ = [$ObjectDict]

$SuperDict.__repr__=$SuperDict.__str__=function(self){
    var res = "<super: <class '"+self.__thisclass__.$dict.__name__+"'"
    if(self.__self_class__!==undefined){
        res += ', <'+self.__self_class__.__class__.__name__+' object>'
    }
    return res+'>'
}

function $$super(_type1,_type2){
    return {__class__:$SuperDict,
        __thisclass__:_type1,
        __self_class__:(_type2 || None)
    }
}
$$super.$dict = $SuperDict
$$super.__class__ = $B.$factory
$SuperDict.$factory = $$super
$$super.$is_func = true

var $Reader = {__class__:$B.$type,__name__:'reader'}

$Reader.__enter__ = function(self){return self}

$Reader.__exit__ = function(self){return false}
        
$Reader.__iter__ = function(self){return iter(self.$lines)}

$Reader.__len__ = function(self){return self.lines.length}

$Reader.__mro__ = [$ObjectDict]

$Reader.close = function(self){self.closed = true}

$Reader.read = function(self,nb){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    if(nb===undefined) return self.$content
   
    self.$counter+=nb
    if(self.$bin){
        var res = self.$content.source.slice(self.$counter-nb, self.$counter)
        return _b_.bytes(res)
    }
    return self.$content.substr(self.$counter-nb,nb)
}

$Reader.readable = function(self){return true}

$Reader.readline = function(self,limit){
    // set line counter
    self.$lc = self.$lc === undefined ? -1 : self.$lc

    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    
    if(self.$lc==self.$lines.length-1){
        return self.$bin ? _b_.bytes() : ''
    }
    self.$lc++
    var res = self.$lines[self.$lc]
    self.$counter += (self.$bin ? res.source.length : res.length)
    return res
}

$Reader.readlines = function(self,hint){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    self.$lc = self.$lc === undefined ? -1 : self.$lc
    return self.$lines.slice(self.$lc+1)
}

$Reader.seek = function(self,offset,whence){
    if(self.closed===True) throw _b_.ValueError('I/O operation on closed file')
    if(whence===undefined) whence=0
    if(whence===0){self.$counter = offset}
    else if(whence===1){self.$counter += offset}
    else if(whence===2){self.$counter = self.$content.length+offset}
}

$Reader.seekable = function(self){return true}

$Reader.tell = function(self){return self.$counter}

$Reader.writable = function(self){return false}

var $BufferedReader = {__class__:$B.$type,__name__:'_io.BufferedReader'}

$BufferedReader.__mro__ = [$Reader,$ObjectDict]

var $TextIOWrapper = {__class__:$B.$type,__name__:'_io.TextIOWrapper'}

$TextIOWrapper.__mro__ = [$Reader,$ObjectDict]

function $url_open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    // other arguments : 
    // - mode can be 'r' (text, default) or 'rb' (binary)
    // - encoding if mode is 'rb'
    //var mode = 'r',encoding='utf-8'
    var $ns=$B.args('open',3,{file:null,mode:null,encoding:null},
        ['file','mode','encoding'],arguments,{mode:'r',encoding:'utf-8'},
        'args','kw'),
        $res
    for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
    if(args.length>0) var mode=args[0]
    if(args.length>1) var encoding=args[1]
    var is_binary = mode.search('b')>-1
    if(isinstance(file,$B.JSObject)) return new $OpenFile(file.js,mode,encoding)
    if(isinstance(file,_b_.str)){
        // read the file content and return an object with file object methods
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var req=new XMLHttpRequest();
        }else{// code for IE6, IE5
            var req=new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = function(){
            try {
                var status = this.status
                if(status===404){
                    $res = _b_.IOError('File '+file+' not found')
                }else if(status!==200){
                    $res = _b_.IOError('Could not open file '+file+' : status '+status)
                }else{
                    $res = this.responseText
                    if(is_binary){
                        $res=_b_.str.$dict.encode($res, 'utf-8')
                    }
                }
            } catch (err) {
                $res = _b_.IOError('Could not open file '+file+' : error '+err)
            }
        }
        // add fake query string to avoid caching
        var fake_qs = '?foo='+$B.UUID()
        req.open('GET',file+fake_qs,false)
        if(is_binary){
            req.overrideMimeType('text/plain; charset=utf-8');
        }
        req.send()
        if($res.constructor===Error) throw $res

        if(is_binary){
            var lf = _b_.bytes('\n', 'ascii'),
                lines = _b_.bytes.$dict.split($res, lf)
            for(var i=0;i<lines.length-1;i++){lines[i].source.push(10)}
        }else{
            var lines = $res.split('\n')
            for(var i=0;i<lines.length-1;i++){lines[i]+='\n'}
        }

        // return the file-like object
        var res = {$content:$res,$counter:0,$lines:lines,$bin:is_binary,
            closed:False,encoding:encoding,mode:mode,name:file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        
        return res
    }
}

var $ZipDict = {__class__:$B.$type,__name__:'zip'}

var $zip_iterator = $B.$iterator_class('zip_iterator')
$ZipDict.__iter__ = function(self){
    // issue #317 : iterator is not reset at each call to zip()
    return self.$iterator = self.$iterator || 
        $B.$iterator(self.items,$zip_iterator)
}

$ZipDict.__mro__ = [$ObjectDict]

function zip(){
    var res = {__class__:$ZipDict,items:[]}
    if(arguments.length==0) return res
    var $ns=$B.args('zip',0,{},[],arguments,{},'args','kw')
    var _args = $ns['args']
    var args = [], pos=0
    for(var i=0;i<_args.length;i++){args[pos++]=iter(_args[i])}
    var kw = $ns['kw']
    var rank=0,items=[]
    while(1){
        var line=[],flag=true, pos=0
        for(var i=0;i<args.length;i++){
            try{
                line[pos++]=next(args[i])
            }catch(err){
                if(err.__name__==='StopIteration'){flag=false;break}
                else{throw err}
            }
        }
        if(!flag) break
        items[rank++]=_b_.tuple(line)
    }
    res.items = items
    return res
}
zip.__class__=$B.$factory
zip.$dict = $ZipDict
$ZipDict.$factory = zip

// built-in constants : True, False, None

function no_set_attr(klass, attr){
    if(klass[attr]!==undefined){
        throw _b_.AttributeError("'"+klass.__name__+"' object attribute '"+
            attr+"' is read-only")
    }else{
        throw _b_.AttributeError("'"+klass.__name__+
            "' object has no attribute '"+attr+"'")
    }
}

var $BoolDict = $B.$BoolDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'bool',
    $native:true
}
$BoolDict.__mro__ = [$ObjectDict]
bool.__class__ = $B.$factory
bool.$dict = $BoolDict
$BoolDict.$factory = bool

$BoolDict.__add__ = function(self,other){
    if(self.valueOf()) return other + 1;
    return other;
}

// True and False are the same as Javascript true and false

var True = true
var False = false

$BoolDict.__eq__ = function(self,other){
    return self.valueOf() ? bool(other) : !bool(other)
}

$BoolDict.__ne__ = function(self,other){
    return self.valueOf() ? !bool(other) : bool(other)
}

$BoolDict.__ge__ = function(self,other){
    return _b_.int.$dict.__ge__($BoolDict.__hash__(self),other)
}

$BoolDict.__gt__ = function(self,other){
    return _b_.int.$dict.__gt__($BoolDict.__hash__(self),other)
}

$BoolDict.__hash__ = $BoolDict.__index__= $BoolDict.__int__=function(self) {
   if(self.valueOf()) return 1
   return 0
}

$BoolDict.__le__ = function(self,other){return !$BoolDict.__gt__(self,other)}

$BoolDict.__lshift__ = function(self,other){return self.valueOf() << other}

$BoolDict.__lt__ = function(self,other){return !$BoolDict.__ge__(self,other)}

$BoolDict.__mul__ = function(self,other){
    if(self.valueOf()) return other
    return 0;
}

$BoolDict.__neg__ = function(self){return -$B.int_or_bool(self)}

$BoolDict.__pos__ = $B.int_or_bool

$BoolDict.__repr__ = $BoolDict.__str__ = function(self){
    if(self.valueOf()) return "True"
    return "False"
}

$BoolDict.__setattr__ = function(self, attr){
    return no_set_attr($BoolDict, attr)
}

$BoolDict.__sub__ = function(self,other){
    if(self.valueOf()) return 1-other;
    return -other;
}

$BoolDict.__xor__ = function(self, other) {
    return self.valueOf() != other.valueOf()
}

var $EllipsisDict = {__class__:$B.$type,
    __name__:'ellipsis'
}
$EllipsisDict.__mro__ = [$ObjectDict]

var Ellipsis = {
    $dict: $EllipsisDict,
    __bool__ : function(){return True},
    __class__ : $EllipsisDict
}
$EllipsisDict.$factory = Ellipsis

for(var $key in $B.$comps){ // Ellipsis is not orderable with any type
    switch($B.$comps[$key]) {
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        Ellipsis['__'+$B.$comps[$key]+'__']=(function(k){
            return function(other){
            throw _b_.TypeError("unorderable types: ellipsis() "+k+" "+
                $B.get_class(other).__name__)}
        })($key)
    }
}

for(var $func in Ellipsis){
    if(typeof Ellipsis[$func]==='function'){
        Ellipsis[$func].__str__ = (function(f){
            return function(){return "<method-wrapper "+f+" of Ellipsis object>"}
        })($func)
    }
}

var $NoneDict = {__class__:$B.$type,__name__:'NoneType'}

$NoneDict.__mro__ = [$ObjectDict]

$NoneDict.__setattr__ = function(self, attr){
    return no_set_attr($NoneDict, attr)
}

var None = {
    __bool__ : function(){return False},
    __class__ : $NoneDict,
    __hash__ : function(){return 0},
    __repr__ : function(){return 'None'},
    __str__ : function(){return 'None'},
    toString : function(){return 'None'}
}

$NoneDict.$factory = function(){return None}
$NoneDict.$factory.__class__=$B.$factory
$NoneDict.$factory.$dict=$NoneDict

for(var $op in $B.$comps){ // None is not orderable with any type
    var key = $B.$comps[$op]
    switch(key){
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        $NoneDict['__'+key+'__']=(function(op){
            return function(other){
            throw _b_.TypeError("unorderable types: NoneType() "+op+" "+
                $B.get_class(other).__name__+"()")}
        })($op)
    }
}
for(var $func in None){
    if(typeof None[$func]==='function'){
        None[$func].__str__ = (function(f){
            return function(){return "<method-wrapper "+f+" of NoneType object>"}
        })($func)
    }
}

// add attributes to native Function
var $FunctionCodeDict = {__class__:$B.$type,__name__:'function code'}
$FunctionCodeDict.__mro__ = [$ObjectDict]
$FunctionCodeDict.$factory = {__class__:$B.$factory, $dict:$FunctionCodeDict}

var $FunctionGlobalsDict = {__class:$B.$type,__name__:'function globals'}
$FunctionGlobalsDict.__mro__ = [$ObjectDict]
$FunctionGlobalsDict.$factory = {__class__:$B.$factory, $dict:$FunctionGlobalsDict}

var $FunctionDict = $B.$FunctionDict = {
    __class__:$B.$type,
    __code__:{__class__:$FunctionCodeDict,__name__:'function code'},
    __globals__:{__class__:$FunctionGlobalsDict,__name__:'function globals'},
    __name__:'function'
}

$FunctionDict.__getattribute__ = function(self, attr){
    // Internal attributes __name__, __module__, __doc__ etc. 
    // are stored in self.$infos
    if(self.$infos && self.$infos[attr]!==undefined){
        if(attr=='__code__'){
            var res = {__class__:$B.$CodeDict}
            for(var attr in self.$infos.__code__){
                res[attr]=self.$infos.__code__[attr]
            }
            return res
        }else if(attr=='__annotations__'){
            // annotations is stored as a Javascript object
            return $B.obj_dict(self.$infos[attr])
        }else{
            return self.$infos[attr]
        }
    }else{
        return _b_.object.$dict.__getattribute__(self, attr)
    }
}

$FunctionDict.__repr__=$FunctionDict.__str__ = function(self){
    return '<function '+self.$infos.__name__+'>'
}

$FunctionDict.__mro__ = [$ObjectDict]

$FunctionDict.__setattr__ = function(self, attr, value){
    if(self.$infos[attr]!==undefined){self.$infos[attr] = value}
    else{self[attr] = value}
}

var $Function = function(){}
$Function.__class__ = $B.$factory
$FunctionDict.$factory = $Function
$Function.$dict = $FunctionDict


_b_.__BRYTHON__ = __BRYTHON__

var builtin_funcs = ['abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray',
'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'delattr', 
'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'exit', 
'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 
'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 
'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 
'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 
'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 
'sum','$$super', 'tuple', 'type', 'vars', 'zip']

for(var i=0;i<builtin_funcs.length;i++){
    var name = builtin_funcs[i]
    if(name=='open'){name1 = '$url_open'}
    if(name=='super'){name = '$$super'}
    if(name=='eval'){name = '$eval'}    
    $B.builtin_funcs[name]=true
}
$B.builtin_funcs['$eval'] = true

var other_builtins = [ 'Ellipsis', 'False',  'None', 'True', 
'__debug__', '__import__', 
'copyright', 'credits', 'license', 'NotImplemented', 'type']

var builtin_names = builtin_funcs.concat(other_builtins)

for(var i=0;i<builtin_names.length;i++){
    var name = builtin_names[i]
    var orig_name = name
    var name1 = name
    if(name=='open'){name1 = '$url_open'}
    if(name=='super'){name = '$$super'}
    if(name=='eval'){name = name1 = '$eval'}
    if(name=='print'){name1 = '$print'}
    $B.bound['__builtins__'][name] = true
    try{
        _b_[name] = eval(name1)
        if($B.builtin_funcs[name]!==undefined){
            //console.log(name+' is builtin func')
            if(_b_[name].__repr__===undefined){
                //console.log('set repr for '+name)
                _b_[name].__repr__ = _b_[name].__str__ = (function(x){
                    return function(){return '<built-in function '+x+'>'}
                })(orig_name)
            }
            // used by inspect module
            _b_[name].__module__ = 'builtins'
            _b_[name].__name__ = name
            _b_[name].__defaults__= _b_[name].__defaults__ || []
            _b_[name].__kwdefaults__= _b_[name].__kwdefaults__ || {}
            _b_[name].__annotations__= _b_[name].__annotations__ || {}
        }
        _b_[name].__doc__=_b_[name].__doc__ || ''

    }
    catch(err){}
}

_b_['$$eval']=$eval

_b_['open']=$url_open
_b_['print']=$print
_b_['$$super']=$$super
    

})(__BRYTHON__)
