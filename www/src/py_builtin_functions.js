// built-in functions
;(function($B){

eval($B.InjectBuiltins())

_b_.__debug__ = false

var $ObjectDict = _b_.object.$dict

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}

function abs(obj){
    if(isinstance(obj,_b_.int)) return _b_.int(Math.abs(obj))
    if(isinstance(obj,_b_.float)) return _b_.float(Math.abs(obj))
    if(hasattr(obj,'__abs__')) return getattr(obj,'__abs__')()

    throw _b_.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")
}

function _alert(src){alert(_b_.str(src))}

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
   // adapted from 
   // http://stackoverflow.com/questions/7499473/need-to-ecape-non-ascii-characters-in-javascript
    function padWithLeadingZeros(string,pad) {
        return new Array(pad+1-string.length).join("0") + string;
    }
    
    function charEscape(charCode) {
      if(charCode>255) return "\\u"+padWithLeadingZeros(charCode.toString(16),4)
      return "\\x" + padWithLeadingZeros(charCode.toString(16),2)
    }
    
    return obj.split("").map(function (char) {
             var charCode = char.charCodeAt(0);
             return charCode > 127 ? charEscape(charCode) : char;
         })
         .join("");
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
     return
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

bool.__class__ = $B.$type
bool.__mro__ = [bool,object]
bool.__name__ = 'bool'
bool.__repr__ = bool.__str__ = function(){return "<class 'bool'>"}
bool.toString = bool.__str__
bool.__hash__ = function() {
    if(this.valueOf()) return 1
    return 0
}

function callable(obj) {return hasattr(obj,'__call__')}

function chr(i) {
  if (i < 0 || i > 1114111) _b_.ValueError('Outside valid range')

  return String.fromCharCode(i)
}

//classmethod() (built in function)
var $ClassmethodDict = {__class__:$B.$type,__name__:'classmethod'}
$ClassmethodDict.__mro__=[$ClassmethodDict,$ObjectDict]
function classmethod(func) {
    func.$type = 'classmethod'
    return func
}
classmethod.__class__=$B.$factory
classmethod.$dict = $ClassmethodDict
$ClassmethodDict.$factory = classmethod
function $class(obj,info){
    this.obj = obj
    this.__name__ = info
    this.__class__ = $B.$type
    this.__mro__ = [this,$ObjectDict]
}

//compile() (built in function)
$B.$CodeObjectDict = {
    __class__:$B.$type,
    __name__:'code',
    __repr__:function(self){return '<code object '+self.name+', file '+self.filename+'>'},
}
$B.$CodeObjectDict.__str__ = $B.$CodeObjectDict.__repr__
$B.$CodeObjectDict.__mro__ = [$B.$CodeObjectDict,$ObjectDict]

function compile(source, filename, mode) {
    
    var module_name = 'exec_' + $B.UUID()
    var local_name = module_name; //'' + $B.UUID()

    var root = $B.py2js(source,module_name,[module_name],local_name)
    
    return {__class__:$B.$CodeObjectDict,src:source,
        name:source.__name__ || '<module>',
        filename:filename, 
        mode:mode
    }
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
        var mro = klass.__mro__
        for(var i=0;i<mro.length;i++){
            var res = mro[i][attr]
            if(res!==undefined){break}
        }
    }
    if(res!==undefined && res.__delete__!==undefined){
        return res.__delete__(res,obj,attr)
    }
    getattr(obj,'__delattr__')(attr)
}

function dir(obj){
    
    if(obj===undefined){
        // if dir is called without arguments, use globals
        var frame = $B.last($B.frames_stack),
            globals_obj = frame[1][1],
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
    
    var klass = $B.get_class(obj)
    
    if(isinstance(obj,$B.JSObject)) obj=obj.js
    else if(klass && klass.is_class){obj=obj.$dict}
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
   var klass = $B.get_class(x)
   return [klass.__floordiv__(x,y), klass.__mod__(x,y)]
}

var $EnumerateDict = {__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__ = [$EnumerateDict,$ObjectDict]

function enumerate(){
    var $ns = $B.$MakeArgs1("enumerate",2,{iterable:null,start:null},
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
    if(current_frame===undefined){alert('current frame undef pour '+src.substr(0,30))}
    var current_locals_id = current_frame[0]
    var current_locals_name = current_locals_id.replace(/\./,'_')
    var current_globals_id = current_frame[2]
    var current_globals_name = current_globals_id.replace(/\./,'_')

    var is_exec = arguments[3]=='exec', module_name, leave = false

    if(src.__class__===$B.$CodeObjectDict){src = src.src}

    if(_globals===undefined){
        module_name = 'exec_'+$B.UUID()
        $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id]
        eval('var $locals_'+module_name+'=current_frame[3]')        
    }else{
        if(_globals.id === undefined){_globals.id = 'exec_'+$B.UUID()}
        module_name = _globals.id
        $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id]

        // Initialise locals object
        if (!$B.async_enabled) eval('var $locals_'+module_name+'={}')

        // Add names/values defined in _globals
        var items = _b_.dict.$dict.items(_globals), item
        while(1){
            try{
                var item = next(items)
                eval('$locals_'+module_name+'["'+item[0]+'"] = item[1]')
            }catch(err){
                break
            }
        }
    }
    if(_locals===undefined){
        local_name = module_name
    }else{
        if(_locals.id === undefined){_locals.id = 'exec_'+$B.UUID()}
        local_name = _locals.id
    }
 
    
    try{
        var root = $B.py2js(src,module_name,[module_name],local_name)
        // If the Python function is eval(), not exec(), check that the source
        // is an expression_
        if(!is_exec){
            // last instruction is 'leave frame' ; we must remove it, 
            // otherwise eval() would return None
            root.children.pop()
            leave = true
            var instr = root.children[root.children.length-1]
            var type = instr.context.tree[0].type
            if (!('expr' == type || 'list_or_tuple' == type)) {
                //console.log('not expression '+instr.context.tree[0])
                //$B.line_info="1,"+module_name
                throw _b_.SyntaxError("eval() argument must be an expression")
            }
        }

        var js = root.to_js()
        if ($B.async_enabled) js=$B.execution_object.source_conversion(js) 
        //js=js.replace("@@", "\'", 'g')
 
        var res = eval(js)

        if(_globals!==undefined){
            // Update _globals with the namespace after execution
            var ns = eval('$locals_'+module_name)
            var setitem = getattr(_globals,'__setitem__')
            for(var attr in ns){
                setitem(attr, ns[attr])
            }
        }

        // fixme: some extra variables are bleeding into locals...
        /*  This also causes issues for unittests */
        if(_locals!==undefined){
            // Update _globals with the namespace after execution
            var ns = eval('$locals_'+local_name)
            var setitem = getattr(_locals,'__setitem__')
            for(var attr in ns){
                setitem(attr, ns[attr])
            }
        }
        
        if(res===undefined) return _b_.None
        return res
    }catch(err){
        if(err.$py_error===undefined){throw $B.exception(err)}
        throw err
    }finally{
        if(leave){$B.leave_frame()}
    }
}
$eval.$is_func = true

function show_frames(){
    //console.log($B.frames_stack)
    var ch = ''
    for(var i=0;i<$B.frames_stack.length;i++){
        var frame = $B.frames_stack[i]
        ch += '['+frame[0][0]
        if($B.debug>0){ch += ' line '+frame[0][2]}
        ch += ', '+frame[1][0]+'] '
    }
    return ch
}

function exec(src, globals, locals){
    return $eval(src, globals, locals,'exec') || _b_.None
}

exec.$is_func = true

var $FilterDict = {__class__:$B.$type,__name__:'filter'}
$FilterDict.__iter__ = function(self){return self}
$FilterDict.__repr__ = $FilterDict.__str__ = function(){return "<filter object>"},
$FilterDict.__mro__ = [$FilterDict,$ObjectDict]

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


function getattr(obj,attr,_default){

    var klass = $B.get_class(obj)
    
    if(klass===undefined){
        // for native JS objects used in Python code
        if(obj[attr]!==undefined) return $B.$JS2Py(obj[attr])
        if(_default!==undefined) return _default
        throw _b_.AttributeError('object has no attribute '+attr)
    }

    switch(attr) {
      case '__call__':
        if (typeof obj=='function'){
           if(obj.$blocking){
             console.log('calling blocking function '+obj.__name__)
           }
           return obj
        } else if (klass===$B.JSObject.$dict && typeof obj.js=='function'){
          return function(){
            var res = obj.js.apply(null,arguments)
            if(res===undefined) return _b_.None
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
            var res = [], pos=0
            for(var i=0;i<obj.$dict.__mro__.length;i++){
                res[pos++]=obj.$dict.__mro__[i].$factory
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
      if(attr !== undefined && obj[attr] !== undefined) {
        if (attr == '__module__') { // put other attrs here too..
          return obj[attr]
        } 
      }
    }

    if(klass.$native){
        if(klass[attr]===undefined){
            if(_default===undefined) throw _b_.AttributeError(klass.__name__+" object has no attribute '"+attr+"'")
            return _default
        }
        if(typeof klass[attr]=='function'){
            // new is a static method
            if(attr=='__new__') return klass[attr].apply(null,arguments)
            
            if(klass.descriptors && klass.descriptors[attr]!==undefined){
                return klass[attr].apply(null, [obj])
            }
            
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
        var mro = klass.__mro__
        if(mro===undefined){
            console.log('in getattr '+attr+' mro undefined for '+obj+' dir '+dir(obj)+' class '+obj.__class__)
            for(var _attr in obj){
                console.log('obj attr '+_attr+' : '+obj[_attr])
            }
            console.log('obj class '+dir(klass)+' str '+klass)
        }
        for(var i=0;i<mro.length;i++){
            attr_func = mro[i]['__getattribute__']
            if(attr_func!==undefined){break}
        }
    }
    if(typeof attr_func!=='function'){
        console.log(attr+' is not a function '+attr_func)
    }

    try{var res = attr_func(obj,attr)}
    catch(err){
        if(_default!==undefined) return _default
        throw err
    }
    
    if(res!==undefined) {
        return res
    }
    if(_default !==undefined) return _default
    
    var cname = klass.__name__
    if(is_class) cname=obj.__name__
    throw _b_.AttributeError("'"+cname+"' object has no attribute '"+attr+"'")
}

//globals() (built in function)
function globals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    var globals_obj = $B.last($B.frames_stack)[3]
    //return $B.obj_dict(globals_obj)
    var _a=[]
    for (var key in globals_obj) _a.push([key, globals_obj[key]])
    return _b_.dict(_a)
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
    var hashfunc = getattr(obj, '__hash__', _b_.None)
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
    
    if (hashfunc == _b_.None) return $B.$py_next_hash++

    if(hashfunc.__func__===_b_.object.$dict.__hash__ &&
        getattr(obj,'__eq__').__func__!==_b_.object.$dict.__eq__){
            throw _b_.TypeError("unhashable type: '"+
                $B.get_class(obj).__name__+"'")
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
   if (obj.__hashvalue__ !== undefined) return obj.__hashvalue__

   // this calculates a hash from the string contents
   // should be deterministic based on string contents
   if (typeof obj == 'string') return getattr(_b_.str(obj), '__hash__')() 

   if (obj.__hash__ === undefined || isinstance(obj, [_b_.set,_b_.list,_b_.dict])) {
      return obj.__hashvalue__=$B.$py_next_hash++
   }

   if (obj.__hash__ !== undefined) return obj.__hash__()

   return null
}

// The default __import__ function is a builtin
__import__ = function (mod_name, globals, locals, fromlist, level) {
    // TODO : Install $B.$__import__ in builtins module to avoid nested call
    return $B.$__import__(mod_name, globals, locals, fromList, level);
}

//not a direct alias of prompt: input has no default value
function input(src) {return prompt(src)}

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
        
    var klass = $B.get_class(obj)
    if (klass === undefined) {
       switch(arg) {
         case _b_.int:
           return ((typeof obj)=="number"||obj.constructor===Number)&&(obj.valueOf()%1===0)
         case _b_.float:
           return ((typeof obj=="number" && obj.valueOf()%1!==0))||
                   (klass===_b_.float.$dict)
         case _b_.str:
           return (typeof obj=="string"||klass===_b_.str.$dict)
         case _b_.list:
           return (obj.constructor===Array)
         default:
           return false
       }
    }

   // arg is the class constructor ; the attribute __class__ is the 
   // class dictionary, ie arg.$dict

   if(arg.$dict===undefined){return false}

   if(klass==$B.$factory){klass = obj.$dict.__class__}

   // Return true if one of the parents of obj class is arg
   // If one of the parents is the class used to inherit from str, obj is an
   // instance of str ; same for list
   for(var i=0;i<klass.__mro__.length;i++){
      var kl = klass.__mro__[i]
      if(kl === arg.$dict){return true}
      else if(arg===_b_.str && 
          kl===$B.$StringSubclassFactory.$dict){return true}
      else if(arg===_b_.list && 
          kl===$B.$ListSubclassFactory.$dict){return true}
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
      if(klass.$dict.__mro__.indexOf(classinfo.$dict)>-1){return true}
    }
    
    // Search __subclasscheck__ on classinfo
    var hook = getattr(classinfo,'__subclasscheck__',null)
    if(hook!==null){return hook(klass)}
    
    return false

    //throw _b_.TypeError("issubclass() arg 2 must be a class or tuple of classes")
}

function iter(obj){
    try{return getattr(obj,'__iter__')()}
    catch(err){
      throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")
    }
}


function len(obj){
    try{return getattr(obj,'__len__')()}
    catch(err){
     throw _b_.TypeError("object of type '"+$B.get_class(obj).__name__+"' has no len()")
    }
}


function locals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    var locals_obj = $B.last($B.frames_stack)[1]
    return $B.obj_dict(locals_obj)
}


var $MapDict = {__class__:$B.$type,__name__:'map'}
$MapDict.__mro__ = [$MapDict,$ObjectDict]
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
    var last_arg = args[args.length-1]
    var nb_args = args.length
    var has_kw_args = false
    var has_default = false
    var func = false
    if(last_arg.$nat=='kw'){
        nb_args--
        last_arg = last_arg.kw
        for(var attr in last_arg){
            switch(attr){
                case 'key':
                    var func = last_arg[attr]
                    has_key = true
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
    throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not an iterator")
}

var $NotImplementedDict = {__class__:$B.$type,__name__:'NotImplementedType'}
$NotImplementedDict.__mro__ = [$NotImplementedDict,$ObjectDict]
$NotImplementedDict.__repr__ = $NotImplementedDict.__str__ = function(){return 'NotImplemented'}

var NotImplemented = {__class__ : $NotImplementedDict,}

function $not(obj){return !bool(obj)}

function oct(x) {return $builtin_base_convert_helper(x, 8)}

function ord(c) {
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    switch(typeof c) {
      case 'string':
        if (c.length == 1) return c.charCodeAt(0)     // <= strobj.charCodeAt(index)
        _b_.TypeError('ord() expected a character, but string of length ' + c.length + ' found') 
      default:
        _b_.TypeError('ord() expected a character, but ' + typeof(c) + ' was found') 
    }
}

function pow() {
    var $ns=$B.$MakeArgs1('pow',3,{x:null,y:null,z:null},['x','y','z'],
        arguments,{z:null},null,null)
    var x=$ns['x'],y=$ns['y'],z=$ns['z']
    if(z === null){
        var a,b
        if(isinstance(x, _b_.float)){a=x.valueOf()}
        else if(isinstance(x, _b_.int)){a=x}
        else {throw _b_.TypeError("unsupported operand type(s) for ** or pow()")}
        
        if (isinstance(y, _b_.float)){b=y.valueOf()}
        else if (isinstance(y, _b_.int)){b=y}
        else {throw _b_.TypeError("unsupported operand type(s) for ** or pow()")}
        var res = Math.pow(a,b)
    }else{
        var _err="pow() 3rd argument not allowed unless all arguments are integers"

        if (!isinstance(x, _b_.int)) throw _b_.TypeError(_err)
        if (!isinstance(y, _b_.int)) throw _b_.TypeError(_err)
        if (!isinstance(z, _b_.int)) throw _b_.TypeError(_err)

        var res = Math.pow(x,y)%z
    }
    // return result with correct type, int or float
    return $B.get_class(res).$factory(res)
}

function $print(){
    var end='\n',sep=' ',file=$B.stdout
    var $ns=$B.$MakeArgs('print',arguments,[],['end','sep','file'],'args', null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}

    getattr(file,'write')(args.map(_b_.str).join(sep)+end)
}
$print.__name__ = 'print'

function $prompt(text,fill){return prompt(text,fill || '')}

// property (built in function)
var $PropertyDict = {
    __class__ : $B.$type,
    __name__ : 'property',
    __repr__ : function(){return "<property object>"},
    __str__ : function(){return "<property object>"},
    toString : function(){return "property"}
}
$PropertyDict.__mro__ = [$PropertyDict,$ObjectDict]
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

// range
var $RangeDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'range',
    $native:true
}

$RangeDict.__contains__ = function(self,other){
    var x = iter(self)
    while(1){
        try{
            var y = $RangeDict.__next__(x)
            if(getattr(y,'__eq__')(other)){return true}
        }catch(err){return false}
    }
    return false
}

$RangeDict.__getitem__ = function(self,rank){
    if(typeof rank != "number") {
      rank=$B.$GetInt(rank)
    }
    var res = self.start + rank*self.step
    if((self.step>0 && res >= self.stop) ||
        (self.step<0 && res < self.stop)){
            throw _b_.IndexError('range object index out of range')
    }
    return res   
}

$RangeDict.__iter__ = function(self){
    return {
        __class__ : $RangeDict,
        start:self.start,
        stop:self.stop,
        step:self.step,
        $counter:self.start-self.step
    }
}

$RangeDict.__len__ = function(self){
    if(self.step>0) return 1+_b_.int((self.stop-1-self.start)/self.step)

    return 1+_b_.int((self.start-1-self.stop)/-self.step)
}

$RangeDict.__next__ = function(self){
    if(self.$safe){
        self.$counter += self.step
        if((self.step>0 && self.$counter >= self.stop)
            || (self.step<0 && self.$counter <= self.stop)){
                throw _b_.StopIteration('')
        }
    }else{
        self.$counter = $B.add(self.$counter, self.step)
        if(($B.gt(self.step,0) && $B.ge(self.$counter, self.stop))
            || ($B.gt(0, self.step) && $B.ge(self.stop, self.$counter))){
                throw _b_.StopIteration('')
        }
    }
    return self.$counter
}

$RangeDict.__mro__ = [$RangeDict,$ObjectDict]

$RangeDict.__reversed__ = function(self){
    return range($B.sub(self.stop,1),$B.sub(self.start,1),
        $B.sub(0,self.step))
}

$RangeDict.__repr__ = $RangeDict.__str__ = function(self){
    var res = 'range('+self.start+', '+self.stop
    if(self.step!=1) res += ', '+self.step
    return res+')'
}

function range(){
    var $ns=$B.$MakeArgs('range',arguments,[],[],'args',null)
    var args = $ns['args']
    if(args.length>3){throw _b_.TypeError(
        "range expected at most 3 arguments, got "+args.length)
    }
    for(var i=0;i<args.length;i++){
        if(typeof args[i]!='number'&&!isinstance(args[i],[_b_.int])||
            !hasattr(args[i],'__index__')){
            throw _b_.TypeError("'"+args[i]+"' object cannot be interpreted as an integer")
        }
    }
    var start=0
    var stop=0
    var step=1
    if(args.length==1){stop = $B.$GetInt(args[0])}
    else if(args.length>=2){
        start = args[0]
        stop = args[1]
    }
    if(args.length>=3) step=args[2]
    if(step==0){throw ValueError("range() arg 3 must not be zero")}
    var res = {
        __class__ : $RangeDict,
        start:start,
        stop:stop,
        step:step,
        $is_range:true
    }
    res.$safe = (typeof start=='number' && typeof stop=='number' &&
        typeof step=='number')
    res.__repr__ = res.__str__ = function(){
            return 'range('+start+','+stop+(args.length>=3 ? ','+step : '')+')'
        }
    return res
}
range.__class__ = $B.$factory
range.$dict = $RangeDict
$RangeDict.$factory = range

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
    if(func!==undefined) return func.apply(obj)
    throw _b_.AttributeError("object has no attribute __repr__")
}

var $ReversedDict = {__class__:$B.$type,__name__:'reversed'}
$ReversedDict.__mro__ = [$ReversedDict,$ObjectDict]
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
        throw _b_.TypeError("type "+arg.__class__+" doesn't define __round__ method")
    }
    
    if(isinstance(arg, _b_.float) && (arg.value === Infinity || arg.value === -Infinity)) {
      throw _b_.OverflowError("cannot convert float infinity to integer")
    }

    if(n===undefined) return _b_.int(Math.round(arg))
    
    if(!isinstance(n,_b_.int)){throw _b_.TypeError(
        "'"+n.__class__+"' object cannot be interpreted as an integer")}
    var mult = Math.pow(10,n)
    return _b_.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult)
}

function setattr(obj,attr,value){
    if(!isinstance(attr,_b_.str)){
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
        obj.__class__ = value.$dict;return
        break
    }
    
    if(obj.__class__===$B.$factory){ 
        // Setting attribute of a class means updating the class
        // dictionary, not the class factory function
        if(obj.$dict.$methods && typeof value=='function'){
            // update attribute $methods
            obj.$dict.$methods[attr] = $B.make_method(attr, obj.$dict, value, value)
            return
        }else{obj.$dict[attr]=value;return}
    }
    
    var res = obj[attr], klass=$B.get_class(obj)
    if(res===undefined){
        var mro = klass.__mro__, _len = mro.length
        for(var i=0;i<_len;i++){
            res = mro[i][attr]
            if(res!==undefined) break
        }
    }

    if(res!==undefined){
        // descriptor protocol : if obj has attribute attr and this attribute 
        // has a method __set__(), use it
        if(res.__set__!==undefined) return res.__set__(res,obj,value)
        var __set__ = getattr(res,'__set__',null)
        if(__set__ && (typeof __set__=='function')) {
            return __set__.apply(res,[obj,value])
        }
    }
    
    // Search the __setattr__ method
    var setattr=false
    if(klass!==undefined){
        for(var i=0, _len=klass.__mro__.length;i<_len;i++){
            setattr = klass.__mro__[i].__setattr__
            if(setattr){break}
        }
    }
    if(!setattr){obj[attr]=value;return}
    setattr(obj,attr,value)
}

// slice
var $SliceDict = {__class__:$B.$type, __name__:'slice'}

$SliceDict.__mro__ = [$SliceDict,$ObjectDict]

$SliceDict.indices = function (self, length) {
  var len=$B.$GetInt(length)
  if (len < 0) _b_.ValueError('length should not be negative')
  if (self.step > 0) {
     var _len = min(len, self.stop)
     return _b_.tuple([self.start, _len, self.step])
  } else if (self.step == _b_.None) {
     var _len = min(len, self.stop)
     var _start = self.start
     if (_start == _b_.None) _start = 0
     return _b_.tuple([_start, _len, 1])
  }
  _b_.NotImplementedError("Error! negative step indices not implemented yet")
}

function slice(){
    var $ns=$B.$MakeArgs('slice',arguments,[],[],'args',null)
    var args = $ns['args']
    if(args.length>3){throw _b_.TypeError(
        "slice expected at most 3 arguments, got "+args.length)
    }else if(args.length==0){
        throw _b_.TypeError('slice expected at least 1 argument, got 0')
    }

    var start=0, stop=0, step=1
    // If some arguments can be interpreted as integers, do the conversion
    for(var i=0;i<args.length;i++){
        try{args[i]=$B.$GetInt(args[i])}
        catch(err){}
    }
    switch(args.length) {
      case 1:
        step = start = None
        stop = args[0]
        break
      case 2:
        start = args[0]
        stop = args[1]
        break
      case 3:
        start = args[0]
        stop = args[1]
        step = args[2]
    } //switch

    if(step==0) throw ValueError("slice step must not be zero")
    var res = {
        __class__ : $SliceDict,
        start:start,
        stop:stop,
        step:step
    }
    res.__repr__ = res.__str__ = function(){
        return 'slice('+start+','+stop+','+step+')'
    }
    return res
}
slice.__class__ = $B.$factory
slice.$dict = $SliceDict
$SliceDict.$factory = slice

function sorted () {
    var $ns=$B.$MakeArgs('sorted',arguments,['iterable'],[],null,'kw')
    if($ns['iterable']===undefined) throw _b_.TypeError("sorted expected 1 positional argument, got 0")
    var iterable=$ns['iterable']
    var key = _b_.dict.$dict.get($ns['kw'],'key',None)
    var reverse = _b_.dict.$dict.get($ns['kw'],'reverse',false)

    var obj = _b_.list(iterable)
    // pass arguments to list.sort()
    var args = [obj], pos=1
    if (key !== None) args[pos++]={$nat:'kw',kw:{key:key}}
    if(reverse) args[pos++]={$nat:'kw',kw:{reverse:true}}
    _b_.list.$dict.sort.apply(null,args)
    return obj
}

// staticmethod() built in function
var $StaticmethodDict = {__class__:$B.$type,__name__:'staticmethod'}
$StaticmethodDict.__mro__ = [$StaticmethodDict,$ObjectDict]

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
    var mro = self.__thisclass__.$dict.__mro__,res
    for(var i=1;i<mro.length;i++){ // start with 1 = ignores the class where super() is defined
        res = mro[i][attr]
        if(res!==undefined){
            // if super() is called with a second argument, the result is bound
            if(res.__class__===$PropertyDict){
                return res.__get__(res, self.__self_class__)
            }
            if(self.__self_class__!==None){
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

$SuperDict.__mro__ = [$SuperDict,$ObjectDict]

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

$Reader.__mro__ = [$Reader,$ObjectDict]

$Reader.close = function(self){self.closed = true}

$Reader.read = function(self,nb){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    if(nb===undefined) return self.$content
   
    self.$counter+=nb
    return self.$content.substr(self.$counter-nb,nb)
}

$Reader.readable = function(self){return true}

$Reader.readline = function(self,limit){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')

    var line = ''
    if(limit===undefined||limit===-1) limit=null

    while(1){
        if(self.$counter>=self.$content.length-1) break
        
        var car = self.$content.charAt(self.$counter)
        if(car=='\n'){self.$counter++;return line}

        line += car
        if(limit!==null && line.length>=limit) return line
        self.$counter++
    }
    return '0'   // return empty string when EOF has been reached.
}

$Reader.readlines = function(self,hint){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    var x = self.$content.substr(self.$counter).split('\n')
    if(hint && hint!==-1){
        var y=[],size=0, pos=0
        while(1){
            var z = x.shift()
            size += z.length
            y[pos++]=z
            if(size>hint || x.length==0) return y
        }
    }
    return x
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

$BufferedReader.__mro__ = [$BufferedReader,$Reader,$ObjectDict]

var $TextIOWrapper = {__class__:$B.$type,__name__:'_io.TextIOWrapper'}

$TextIOWrapper.__mro__ = [$TextIOWrapper,$Reader,$ObjectDict]

function $url_open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    // other arguments : 
    // - mode can be 'r' (text, default) or 'rb' (binary)
    // - encoding if mode is 'rb'
    var mode = 'r',encoding='utf-8'
    var $ns=$B.$MakeArgs('open',arguments,['file'],['mode','encoding'],'args','kw')
    for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
    if(args.length>0) var mode=args[0]
    if(args.length>1) var encoding=args[1]
    if(isinstance(file,$B.JSObject)) return new $OpenFile(file.js,mode,encoding)
    if(isinstance(file,_b_.str)){
        // read the file content and return an object with file object methods
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var req=new XMLHttpRequest();
        }else{// code for IE6, IE5
            var req=new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = function(){
            var status = req.status
            if(status===404){
                $res = _b_.IOError('File '+file+' not found')
            }else if(status!==200){
                $res = _b_.IOError('Could not open file '+file+' : status '+status) 
            }else{
                $res = req.responseText
            }
        }
        // add fake query string to avoid caching
        var fake_qs = '?foo='+$B.UUID()
        req.open('GET',file+fake_qs,false)
        var is_binary = mode.search('b')>-1
        if(is_binary){
            req.overrideMimeType('text/plain; charset=iso-8859-1');
        }
        req.send()
        if($res.constructor===Error) throw $res

        // return the file-like object
        var lines = $res.split('\n')
        var res = {$content:$res,$counter:0,$lines:lines,
            closed:False,encoding:encoding,mode:mode,name:file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper

        return res
    }
}


var $ZipDict = {__class__:$B.$type,__name__:'zip'}

var $zip_iterator = $B.$iterator_class('zip_iterator')
$ZipDict.__iter__ = function(self){
    return $B.$iterator(self.items,$zip_iterator)
}

$ZipDict.__mro__ = [$ZipDict,$ObjectDict]

function zip(){
    var res = {__class__:$ZipDict,items:[]}
    if(arguments.length==0) return res
    var $ns=$B.$MakeArgs('zip',arguments,[],[],'args','kw')
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
$BoolDict.__mro__ = [$BoolDict,$ObjectDict]
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
    if(self.valueOf()) return !!other
    return !other
}

$BoolDict.__ne__ = function(self,other){
    if(self.valueOf()) return !other
    return !!other
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
    __name__:'Ellipsis',
}
$EllipsisDict.__mro__ = [$ObjectDict]
$EllipsisDict.$factory = $EllipsisDict

var Ellipsis = {
    __bool__ : function(){return True},
    __class__ : $EllipsisDict,
    __repr__ : function(){return 'Ellipsis'},
    __str__ : function(){return 'Ellipsis'},
    toString : function(){return 'Ellipsis'}
}

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

$NoneDict.__mro__ = [$NoneDict,$ObjectDict]

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
$FunctionCodeDict.__mro__ = [$FunctionCodeDict,$ObjectDict]
$FunctionCodeDict.$factory = {__class__:$B.$factory, $dict:$FunctionCodeDict}

var $FunctionGlobalsDict = {__class:$B.$type,__name__:'function globals'}
$FunctionGlobalsDict.__mro__ = [$FunctionGlobalsDict,$ObjectDict]
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

$FunctionDict.__mro__ = [$FunctionDict,$ObjectDict]
var $Function = function(){}
$Function.__class__=$B.$factory
$FunctionDict.$factory = $Function
$Function.$dict = $FunctionDict

// class of traceback objects
var $TracebackDict = {__class__:$B.$type,
    __name__:'traceback'
}
$TracebackDict.__getattribute__ = function(self, attr){

    var last_frame = $B.last(self.stack),
        line_info = last_frame.$line_info

    switch(attr){
        case 'tb_frame':
            return frame(self.stack)
        case 'tb_lineno':
            if(line_info===undefined){return -1}
            else{return parseInt(line_info.split(',')[0])}
        case 'tb_lasti':
            if(line_info===undefined){return '<unknown>'}
            else{
                var info = line_info.split(',')
                var src = $B.$py_src[line_info[1]]
                return src.split('\n')[parseInt(info[0]-1)]
            }
        case 'tb_next':
            if(self.stack.length==1){return None}
            else{return traceback(self.stack.slice(0, self.stack.length-1))}
    }
}

$TracebackDict.__mro__ = [$TracebackDict, $ObjectDict]

function traceback(stack) {
  return {__class__ : $TracebackDict,
      stack : stack
  }
}

traceback.__class__ = $B.$factory
traceback.$dict = $TracebackDict
$TracebackDict.$factory = traceback

// class of frame objects
var $FrameDict = {__class__:$B.$type,
    __name__:'frame'
}
$FrameDict.__mro__ = [$FrameDict, $ObjectDict]

function to_dict(obj){
    var res = _b_.dict()
    var setitem=_b_.dict.$dict.__setitem__
    for(var attr in obj){
        if(attr.charAt(0)=='$'){continue}
        setitem(res, attr, obj[attr])
    }
    return res
}

function frame(stack, pos){
    var mod_name = stack[2]
    var fs = stack
    var res = {__class__:$FrameDict,
        f_builtins : {} // XXX fix me
    }
    if(pos===undefined){pos = fs.length-1}
    if(fs.length){
        var _frame = fs[pos]
        if(_frame[1]===undefined){alert('frame undef '+stack+' '+Array.isArray(stack)+' is frames stack '+(stack===$B.frames_stack))}
        var locals_id = _frame[0]
        try{
            res.f_locals = $B.obj_dict(_frame[1])
        }catch(err){
            console.log('err '+err)
            throw err
        }
        res.f_globals = $B.obj_dict(_frame[3])
        if($B.debug>0){
            if(_frame[1].$line_info === undefined){return 1}
            res.f_lineno = parseInt(_frame[1].$line_info.split(',')[0])
        }else{
            res.f_lineno = -1
        }
        if(pos>0){res.f_back = frame(stack, pos-1)}
        else{res.f_back = None}
        //res.f_code = {__class__:$B.$CodeObjectDict,
        res.f_code = {__class__:$B.$CodeDict,
            co_code:None, // XXX fix me
            co_name: locals_id, // idem
            co_filename: "<unknown>" // idem
        }
    }
    return res
}

frame.__class__ = $B.$factory
frame.$dict = $FrameDict
$FrameDict.$factory = frame
$B._frame=frame

// built-in exceptions

var $BaseExceptionDict = {__class__:$B.$type,
    __bases__ : [_b_.object],
    __module__:'builtins',
    __name__:'BaseException'
}

$BaseExceptionDict.__init__ = function(self){
    self.args = _b_.tuple([arguments[1]])
}

$BaseExceptionDict.__repr__ = function(self){
    return self.__class__.__name__+repr(self.args)
}

$BaseExceptionDict.__str__ = function(self){
    return self.args[0]
}

$BaseExceptionDict.__mro__ = [$BaseExceptionDict,$ObjectDict]

$BaseExceptionDict.__new__ = function(cls){
    var err = _b_.BaseException()
    err.__name__ = cls.$dict.__name__
    err.__class__ = cls.$dict
    return err
}

$BaseExceptionDict.__getattr__ = function(self, attr){
    if(attr=='info'){
        var info = 'Traceback (most recent call last):'

        if(self.$js_exc!==undefined){
            for(var attr in self.$js_exc){
                if(attr==='message') continue
                try{info += '\n    '+attr+' : '+self.$js_exc[attr]}
                catch(_err){}
            }
            info+='\n'
        }
        for(var i=0;i<self.$stack.length;i++){
            var frame = self.$stack[i]
            if(frame[1].$line_info===undefined){continue}
            var line_info = frame[1].$line_info.split(',')
            var lines = $B.$py_src[line_info[1]].split('\n')
            info += '\n  module '+line_info[1]+' line '+line_info[0]
            var line = lines[parseInt(line_info[0])-1]
            if(line) line=line.replace(/^[ ]+/g, '')
            info += '\n    '+line
        }
        return info

    }else if(attr=='traceback'){
        // Get attribute 'info' to initialise attributes last_info and line
        
        if(false){ //$B.debug==0){
            // Minimal traceback to avoid attribute error
            return traceback({
                tb_frame:frame(self.$stack),
                tb_lineno:0,
                tb_lasti:-1,
                tb_next: None // fix me
            })
        }
        // Return traceback object
        return traceback(self.$stack)
    }else{
        throw AttributeError(self.__class__.__name__+
            "has no attribute '"+attr+"'")
    }
}

$BaseExceptionDict.with_traceback = function(self, tb){
    self.traceback = tb
    return self
}

var BaseException = function (msg,js_exc){
    var err = Error()
    err.__name__ = 'BaseException'
    err.$js_exc = js_exc
    
    if(msg===undefined) msg='BaseException'
   
    err.args = _b_.tuple([msg])
    err.$message = msg
    err.__class__ = $BaseExceptionDict
    err.$py_error = true
    err.$stack = $B.frames_stack.slice()
    $B.current_exception = err
    return err
}

BaseException.__class__ = $B.$factory
BaseException.$dict = $BaseExceptionDict
$BaseExceptionDict.$factory = BaseException

_b_.BaseException = BaseException

$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    
    if(!js_exc.$py_error){
        // Print complete Javascript traceback in console
        console.log(js_exc)
        
        if($B.debug>0 && js_exc.info===undefined){
            var _frame = $B.last($B.frames_stack)
            if(_frame[1].$line_info!==undefined){
                var line_info = _frame[1].$line_info.split(',')
                var mod_name = line_info[1]
                var module = $B.modules[mod_name]
                if(module){
                    if(module.caller!==undefined){
                        // for list comprehension and the likes, replace
                        // by the line in the enclosing module
                        var mod_name = line_info[1]
                    }
                    var lib_module = mod_name
                    var line_num = parseInt(line_info[0])
                    if($B.$py_src[mod_name]===undefined){
                        console.log('pas de py_src pour '+mod_name)
                    }
                    var lines = $B.$py_src[mod_name].split('\n')
                    js_exc.message += "\n  module '"+lib_module+"' line "+line_num
                    js_exc.message += '\n'+lines[line_num-1]
                    js_exc.info_in_msg = true
                }
            }else{
                console.log('error '+js_exc)
            }
        }
        var exc = Error()
        exc.__name__ = 'Internal Javascript error: '+(js_exc.__name__ || js_exc.name)
        exc.__class__ = _b_.Exception.$dict
        if(js_exc.name=='ReferenceError'){
            exc.__name__='NameError'
            exc.__class__=_b_.NameError.$dict
            js_exc.message = js_exc.message.replace('$$','')
        }
        exc.$message = js_exc.message || '<'+js_exc+'>'
        exc.args = _b_.tuple([exc.$message])
        exc.info = ''
        exc.$py_error = true
        exc.traceback = traceback({
            tb_frame:frame($B.frames_stack),
            tb_lineno:-1,
            tb_lasti:'',
            tb_next: None   // fix me
        })
    }else{
        var exc = js_exc
    }
    exc.$stack = $B.frames_stack.slice()
    $B.current_exception = exc
    return exc
}

$B.is_exc=function(exc,exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__===undefined) exc = $B.exception(exc)
    
    var exc_class = exc.__class__.$factory
    for(var i=0;i<exc_list.length;i++){
        if(issubclass(exc_class,exc_list[i])) return true
    }
    return false
}

$B.builtins_block = {id:'__builtins__',module:'__builtins__'}
$B.modules['__builtins__'] = $B.builtins_block
$B.bound['__builtins__'] = {'__BRYTHON__':true, '$eval':true, '$open': true}
$B.bound['__builtins__']['BaseException'] = true

_b_.__BRYTHON__ = __BRYTHON__

function $make_exc(names,parent){
    // create a class for exception called "name"
    var _str=[], pos=0
    for(var i=0;i<names.length;i++){
        var name = names[i]
        $B.bound['__builtins__'][name] = true
        var $exc = (BaseException+'').replace(/BaseException/g,name)
        // class dictionary
        _str[pos++]='var $'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}'
        _str[pos++]='$'+name+'Dict.__bases__ = [parent]'
        _str[pos++]='$'+name+'Dict.__module__ = "builtins"'
        _str[pos++]='$'+name+'Dict.__mro__=[$'+name+'Dict].concat(parent.$dict.__mro__)'
        // class constructor
        _str[pos++]='_b_.'+name+'='+$exc
        _str[pos++]='_b_.'+name+'.__class__=$B.$factory'
        _str[pos++]='$'+name+'Dict.$factory=_b_.'+name
        _str[pos++]='_b_.'+name+'.$dict=$'+name+'Dict'
    }
    eval(_str.join(';'))
}

$make_exc(['SystemExit','KeyboardInterrupt','GeneratorExit','Exception'],BaseException)
$make_exc(['StopIteration','ArithmeticError','AssertionError','AttributeError',
    'BufferError','EOFError','ImportError','LookupError','MemoryError',
    'NameError','OSError','ReferenceError','RuntimeError','SyntaxError',
    'SystemError','TypeError','ValueError','Warning'],_b_.Exception)
$make_exc(['FloatingPointError','OverflowError','ZeroDivisionError'],
    _b_.ArithmeticError)
$make_exc(['IndexError','KeyError'],_b_.LookupError)
$make_exc(['UnboundLocalError'],_b_.NameError)
$make_exc(['BlockingIOError','ChildProcessError','ConnectionError',
    'FileExistsError','FileNotFoundError','InterruptedError',
    'IsADirectoryError','NotADirectoryError','PermissionError',
    'ProcessLookupError','TimeoutError'],_b_.OSError)
$make_exc(['BrokenPipeError','ConnectionAbortedError','ConnectionRefusedError',
    'ConnectionResetError'],_b_.ConnectionError)
$make_exc(['NotImplementedError'],_b_.RuntimeError)
$make_exc(['IndentationError'],_b_.SyntaxError)
$make_exc(['TabError'],_b_.IndentationError)
$make_exc(['UnicodeError'],_b_.ValueError)
$make_exc(['UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError'],
    _b_.UnicodeError)
$make_exc(['DeprecationWarning','PendingDeprecationWarning','RuntimeWarning',
    'SyntaxWarning','UserWarning','FutureWarning','ImportWarning',
    'UnicodeWarning','BytesWarning','ResourceWarning'],_b_.Warning)

$make_exc(['EnvironmentError','IOError','VMSError','WindowsError'],_b_.OSError)

$B.$NameError = function(name){
    // Used if a name is not found in the bound names
    // It is converted into 
    // $globals[name] !== undefined ? $globals[name] : __BRYTHON__.$NameError(name)
    throw _b_.NameError(name)
}
$B.$TypeError = function(msg){
    throw _b_.TypeError(msg)
}

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
'__build_class__', '__debug__', '__doc__', '__import__', '__name__', 
'__package__', 'copyright', 'credits', 'license', 'NotImplemented', 'type']

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

/*
            //define some default values for __code__
            var _c=_b_[name].__code__

            _c=_c || {}
            _c.co_filename='builtins'
            _c.co_code='' + _b_[name]
            _c.co_flags=0
            _c.co_name=name
            _c.co_names=_c.co_names || []
            _c.co_nlocals=_c.co_nlocals || 0
            _c.co_comments=_c.co_comments || ''

            _c.co_kwonlyargcount=_c.co_kwonlyargcount || 0

            _b_[name].__code__=_c
*/
            _b_[name].__defaults__= _b_[name].__defaults__ || []
            _b_[name].__kwdefaults__= _b_[name].__kwdefaults__ || {}
            _b_[name].__annotations__= _b_[name].__annotations__ || {}
        }
        _b_[name].__doc__=_b_[name].__doc__ || ''

    }
    catch(err){}
}

$B._alert = _alert
_b_['$eval']=$eval

_b_['open']=$url_open
_b_['print']=$print
_b_['$$super']=$$super

})(__BRYTHON__)
