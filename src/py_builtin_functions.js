// built-in functions
;(function($B){

eval($B.InjectBuiltins())

_b_.__debug__ = false



var $ObjectDict = _b_.object.$dict

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}

function abs(obj){
    if(isinstance(obj,_b_.int)) return _b_.int(Math.abs(obj))
    if(isinstance(obj,_b_.float)) return _b_.float(Math.abs(obj.value))
    if(hasattr(obj,'__abs__')) return getattr(obj,'__abs__')()

    throw _b_.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")
}

abs.__doc__='abs(number) -> number\n\nReturn the absolute value of the argument.'
abs.__code__={}
abs.__code__.co_argcount=1
abs.__code__.co_consts=[]
abs.__code__.co_varnames=['number']

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

all.__doc__='all(iterable) -> bool\n\nReturn True if bool(x) is True for all values x in the iterable.\nIf the iterable is empty, return True.'
all.__code__={}
all.__code__.co_argcount=1
all.__code__.co_consts=[]
all.__code__.co_varnames=['obj']


function any(obj){
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(bool(elt)) return true
        }catch(err){return false}
    }
}

any.__doc__='any(iterable) -> bool\n\nReturn True if bool(x) is True for any x in the iterable.\nIf the iterable is empty, return False.'
any.__code__={}
any.__code__.co_argcount=1
any.__code__.co_consts=[]
any.__code__.co_varnames=['obj']


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

ascii.__doc__='ascii(object) -> string\n\nAs repr(), return a string containing a printable representation of an\nobject, but escape the non-ASCII characters in the string returned by\nrepr() using \\x, \\u or \\U escapes.  This generates a string similar\nto that returned by repr() in Python 2.'
ascii.__code__={}
ascii.__code__.co_argcount=1
ascii.__code__.co_consts=[]
ascii.__code__.co_varnames=['obj']

// used by bin, hex and oct functions
function $builtin_base_convert_helper(obj, base) {
  var value;
  if (isinstance(obj, _b_.int)) {value=obj
  } else if (obj.__index__ !== undefined) {value=obj.__index__()
  }
  if (value === undefined) {
     // need to raise an error
     throw _b_.TypeError('Error, argument must be an integer or contains an __index__ function')
     return
  }
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
  if (value >=0) return prefix + value.toString(base);
  return '-' + prefix + (-value).toString(base);
}


// bin() (built in function)
function bin(obj) {return $builtin_base_convert_helper(obj, 2)}

bin.__doc__="bin(number) -> string\n\nReturn the binary representation of an integer.\n\n   >>> bin(2796202)\n   '0b1010101010101010101010'\n"
bin.__code__={}
bin.__code__.co_argcount=1
bin.__code__.co_consts=[]
bin.__code__.co_varnames=['obj']


// blocking decorator
var blocking = _b_.blocking = function(func) {
   // func.$type='blocking'  <=  is this needed?
   $B.$blocking_functions=$B.$blocking_functions || [];
   $B.$blocking_functions.push(_b_.id(func))
   console.log('blocking funcs '+$B.$blocking_functions)
   func.$blocking = true
   return func
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
            $B.$pop_exc()
            try{return getattr(obj,'__len__')()>0}
            catch(err){$B.$pop_exc();return true}
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

bool.__doc__='bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
bool.__code__={}
bool.__code__.co_argcount=1
bool.__code__.co_consts=[]
bool.__code__.co_varnames=['x']

function callable(obj) {return hasattr(obj,'__call__')}

callable.__doc__='callable(object) -> bool\n\nReturn whether the object is callable (i.e., some kind of function).\nNote that classes are callable, as are instances of classes with a\n__call__() method.'
callable.__code__={}
callable.__code__.co_argcount=1
callable.__code__.co_consts=[]
callable.__code__.co_varnames=['obj']


function chr(i) {
  if (i < 0 || i > 1114111) Exception('ValueError', 'Outside valid range')

  return String.fromCharCode(i)
}

chr.__doc__='chr(i) -> Unicode character\n\nReturn a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.'
chr.__code__={}
chr.__code__.co_argcount=1
chr.__code__.co_consts=[]
chr.__code__.co_varnames=['i']

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
    //for now ignore mode variable, and flags, etc
    var $ns=$B.$MakeArgs('compile',arguments,['source','filename','mode'],[],'args','kw')
    return {__class__:$B.$CodeObjectDict,src:$B.py2js(source).to_js(),
        name:source.__name__ || '<module>',filename:filename}
}
compile.__class__ = $B.factory
$B.$CodeObjectDict.$factory = compile
compile.$dict = $B.$CodeObjectDict

compile.__doc__="compile(source, filename, mode[, flags[, dont_inherit]]) -> code object\n\nCompile the source (a Python module, statement or expression)\ninto a code object that can be executed by exec() or eval().\nThe filename will be used for run-time error messages.\nThe mode must be 'exec' to compile a module, 'single' to compile a\nsingle (interactive) statement, or 'eval' to compile an expression.\nThe flags argument, if present, controls which future statements influence\nthe compilation of the code.\nThe dont_inherit argument, if non-zero, stops the compilation inheriting\nthe effects of any future statements in effect in the code calling\ncompile; if absent or zero these statements do influence the compilation,\nin addition to any features explicitly specified."
compile.__code__={}
compile.__code__.co_argcount=3
compile.__code__.co_consts=[]
compile.__code__.co_varnames=['source','filename','mode']


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

delattr.__doc__="delattr(object, name)\n\nDelete a named attribute on an object; delattr(x, 'y') is equivalent to\n``del x.y''."
delattr.__code__={}
delattr.__code__.co_argcount=2
delattr.__code__.co_consts=[]
delattr.__code__.co_varnames=['object','name']


function dir(obj){
    
    if(obj===null){
        // if dir is called without arguments, the parser transforms dir() into
        // dir(null,module_name)
        var mod_name=arguments[1]
        var res = [],$globals = $B.vars[mod_name]
        for(var attr in $globals){
            if(attr.charAt(0)=='$' && attr.charAt(1) != '$') {
                // exclude internal attributes set by Brython
                continue
            }
            res.push(attr)
        }
        _b_.list.$dict.sort(res)
        return res
    }

    if(isinstance(obj,$B.JSObject)) obj=obj.js
    else if($B.get_class(obj).is_class){console.log('is class ');obj=obj.$dict}
    else {
        // We first look if the object has the __dir__ method
        try {
            var res = getattr(obj, '__dir__')()
            res = _b_.list(res)
            res.sort()
            return res
        } catch (err){console.log('no __dir__ '+err);$B.$pop_exc()}
    }
    var res = []
    for(var attr in obj){
        if(attr.charAt(0)!=='$' && attr!=='__class__'){
            res.push(attr)
        }
    }
    res.sort()
    return res
}

dir.__doc__="dir([object]) -> list of strings\n\nIf called without an argument, return the names in the current scope.\nElse, return an alphabetized list of names comprising (some of) the attributes\nof the given object, and of attributes reachable from it.\nIf the object supplies a method named __dir__, it will be used; otherwise\nthe default dir() logic is used and returns:\n  for a module object: the module's attributes.\n  for a class object:  its attributes, and recursively the attributes\n    of its bases.\n  for any other object: its attributes, its class's attributes, and\n    recursively the attributes of its class's base classes."
dir.__code__={}
dir.__code__.co_argcount=1
dir.__code__.co_consts=[]
dir.__code__.co_varnames=['obj']


//divmod() (built in function)
function divmod(x,y) {
   var klass = $B.get_class(x)
   return [klass.__floordiv__(x,y), klass.__mod__(x,y)]
}

divmod.__doc__='divmod(x, y) -> (div, mod)\n\nReturn the tuple ((x-x%y)/y, x%y).  Invariant: div*y + mod == x.'
divmod.__code__={}
divmod.__code__.co_argcount=2
divmod.__code__.co_consts=[]
divmod.__code__.co_varnames=['x','y']


var $EnumerateDict = {__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__ = [$EnumerateDict,$ObjectDict]

function enumerate(){
    var _start = 0
    var $ns = $B.$MakeArgs("enumerate",arguments,["iterable"],
                ["start"], null, null)
    var _iter = iter($ns["iterable"])
    var _start = $ns["start"] || _start
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

enumerate.__doc__='enumerate(iterable[, start]) -> iterator for index, value of iterable\n\nReturn an enumerate object.  iterable must be another object that supports\niteration.  The enumerate object yields pairs containing a count (from\nstart, which defaults to zero) and a value yielded by the iterable argument.\nenumerate is useful for obtaining an indexed list:\n    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...'
enumerate.__code__={}
enumerate.__code__.co_argcount=2
enumerate.__code__.co_consts=[]
enumerate.__code__.co_varnames=['iterable']

//eval() (built in function)
function $eval(src, _globals, locals){
    var is_exec = arguments[3]=='exec'
    if($B.exec_stack.length==0){$B.exec_stack=['__main__']}
    var env = $B.exec_stack[$B.exec_stack.length-1]

    if(is_exec && _globals===undefined){
        var mod_name = env
    }else{
        var mod_name = 'exec-'+ $B.UUID()
        $B.$py_module_path[mod_name] = $B.$py_module_path['__main__']
        $B.vars[mod_name] = {}
        $B.bound[mod_name] = {}
        if(_globals!==undefined){
            var items = _b_.list(_b_.dict.$dict.items(_globals))
            for(var i=0;i<items.length;i++){
                $B.vars[mod_name][items[i][0]] = items[i][1]
                $B.bound[mod_name][items[i][0]] = true
            }
        }else{
            for(var attr in $B.vars[env]){
                $B.vars[mod_name][attr] = $B.vars[env][attr]
                $B.bound[mod_name][attr] = true
            }
        }
    }
    $B.exec_stack.push(mod_name)
    try{
        var root = $B.py2js(src,mod_name,mod_name,'__builtins__')
        // If the Python function is eval(), not exec(), check that the source
        // is an expression
        if(!is_exec){
            var instr = root.children[root.children.length-1]
            var type = instr.context.tree[0].type
            if (!('expr' == type || 'list_or_tuple' == type)) {
                $B.line_info=[1,mod_name]
                throw _b_.SyntaxError("eval() argument must be an expression")
            }
        }
        var res = eval(root.to_js())
        if(res===undefined){res = _b_.None}
        if(_globals!==undefined){
            var set_func = getattr(_globals,'__setitem__')
            for(var attr in $B.vars[mod_name]){
               if (attr=='__name__'||attr=='__doc__'||attr == '__file__') continue
               set_func(attr, $B.vars[mod_name][attr])
            }
        }
        return res
    }finally{
        $B.exec_stack.pop()
        delete $B.bound[mod_name], $B.modules[mod_name], $B.imported[mod_name]
        if(_globals!==undefined){delete $B.vars[mod_name]}
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
$FilterDict.__mro__ = [$FilterDict,$ObjectDict]

function filter(){
    if(arguments.length!=2){throw _b_.TypeError(
            "filter expected 2 arguments, got "+arguments.length)}
    var func=arguments[0],iterable=iter(arguments[1])
    if(func === _b_.None) func = bool

    var __next__ = function() {
        while(true){
            try {
                var _item = next(iterable)
                if (func(_item)){return _item}
            }catch(err){
                if(err.__name__==='StopIteration'){$B.$pop_exc();throw _b_.StopIteration('')}
                else{throw err}
            }
        }
    }
    return {
        __class__: $FilterDict,
        __next__: __next__
    }
}

filter.__doc__='filter(function or None, iterable) --> filter object\n\nReturn an iterator yielding those items of iterable for which function(item)\nis true. If function is None, return the items that are true.'
filter.__code__={}
filter.__code__.co_argcount=2
filter.__code__.co_consts=[]
filter.__code__.co_varnames=['f', 'iterable']


function format(value, format_spec) {
  if(hasattr(value, '__format__')) return getattr(value,'__format__')(format_spec)
  
  throw _b_.NotImplementedError("__format__ is not implemented for object '" + _b_.str(value) + "'")
}

format.__doc__='format(value[, format_spec]) -> string\n\nReturns value.__format__(format_spec)\nformat_spec defaults to ""'
format.__code__={}
format.__code__.co_argcount=2
format.__code__.co_consts=[]
format.__code__.co_varnames=['f', 'iterable']

function getattr(obj,attr,_default){

    var klass = $B.get_class(obj)

    if(klass===undefined){
        // for native JS objects used in Python code
        if(obj[attr]!==undefined) return obj[attr]
        if(_default!==undefined) return _default
        throw _b_.AttributeError('object has no attribute '+attr)
    }
    
    // attribute __class__ is set for all Python objects
    // return the factory function
    if(attr=='__class__') return klass.$factory
    
    // attribute __dict__ returns an instance of a subclass of dict
    // defined in py_dict.js
    if(attr==='__dict__'){return $B.obj_dict(obj)}
    
    // __call__ on a function returns the function itself
    if(attr==='__call__' && (typeof obj=='function')){
        if(obj.$blocking){
            console.log('calling blocking function '+obj.__name__)
        }
        if($B.debug>0){
            return function(){
                $B.call_stack.push($B.line_info)
                try{
                    var res = obj.apply(null,arguments)
                    if(res===undefined) return _b_.None
                    return res
                }catch(err){throw err}
                finally{$B.call_stack.pop()}
            }
        }
        return function(){
            var res = obj.apply(null,arguments)
            if(res===undefined) return _b_.None
            return res
        }
    }else if(attr=='__call__' && klass===$B.JSObject.$dict &&
        typeof obj.js=='function'){
        return function(){
            var res = obj.js.apply(null,arguments)
            if(res===undefined) return _b_.None
            return $B.JSObject(res)
        }
    }

    if(attr=='__code__' && (typeof obj=='function')){
        var res = {__class__:$B.$CodeObjectDict,src:obj,
                   name:obj.__name__ || '<module>'
            }
        if (obj.__code__ !== undefined) {
           for (var attr in obj.__code__) res[attr]=obj.__code__[attr]
        }
        if($B.vars[obj.__module__]!==undefined){
            res.filename=$B.vars[obj.__module__].__file__
        }
        return res
    }
    
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
            
            var method = function(){
                var args = [obj]
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                return klass[attr].apply(null,args)
            }
            method.__name__ = 'method '+attr+' of built-in '+klass.__name__
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
            if(attr_func!==undefined) break
        }
    }
    if(typeof attr_func!=='function'){
        console.log(attr+' is not a function '+attr_func)
    }

    try{var res = attr_func(obj,attr)}
    catch(err){
        $B.$pop_exc()
        if(_default!==undefined) return _default
        throw err
    }
    if(res!==undefined) return res
    if(_default !==undefined) return _default
    
    var cname = klass.__name__
    if(is_class) cname=obj.__name__
    throw _b_.AttributeError("'"+cname+"' object has no attribute '"+attr+"'")
}

getattr.__doc__="getattr(object, name[, default]) -> value\n\nGet a named attribute from an object; getattr(x, 'y') is equivalent to x.y.\nWhen a default argument is given, it is returned when the attribute doesn't\nexist; without it, an exception is raised in that case."
getattr.__code__={}
getattr.__code__.co_argcount=1
getattr.__code__.co_consts=[]
getattr.__code__.co_varnames=['value']

//globals() (built in function)
function globals(module){
    // the translation engine adds the argument module
    var res = _b_.dict()
    var scope = $B.vars[module]
    for(var name in scope){_b_.dict.$dict.__setitem__(res, name, scope[name])}
    return res
}

globals.__doc__="globals() -> dictionary\n\nReturn the dictionary containing the current scope's global variables."
globals.__code__={}
globals.__code__.co_argcount=0
globals.__code__.co_consts=[]
globals.__code__.co_varnames=[]


function hasattr(obj,attr){
    try{getattr(obj,attr);return true}
    catch(err){$B.$pop_exc();return false}
}

hasattr.__doc__='hasattr(object, name) -> bool\n\nReturn whether the object has an attribute with the given name.\n(This is done by calling getattr(object, name) and catching AttributeError.)'
hasattr.__code__={}
hasattr.__code__.co_argcount=2
hasattr.__code__.co_consts=[]
hasattr.__code__.co_varnames=['object','name']


function hash(obj){
    if(arguments.length!=1){
        throw _b_.TypeError("hash() takes exactly one argument ("+
            arguments.length+" given)")
    }
    if (obj.__hashvalue__ !== undefined) return obj.__hashvalue__
    if (isinstance(obj, _b_.int)) return obj.valueOf()
    if (isinstance(obj, bool)) return _b_.int(obj)
    if (obj.__hash__ !== undefined) {
       return obj.__hashvalue__=obj.__hash__()
    }
    var hashfunc = getattr(obj, '__hash__', _b_.None)
    if(hashfunc===_b_.None){
        throw _b_.TypeError("unhashable type: '"+
            $B.get_class(obj).__name__+"'")
    }else{
        return obj.__hashvalue__= hashfunc()
    }
}

hash.__doc__='hash(object) -> integer\n\nReturn a hash value for the object.  Two objects with the same value have\nthe same hash value.  The reverse is not necessarily true, but likely.'
hash.__code__={}
hash.__code__.co_argcount=1
hash.__code__.co_consts=[]
hash.__code__.co_varnames=['object']


function help(obj){
    if (obj === undefined) obj='help'
    
    // if obj is a builtin, lets take a shortcut, and output doc string
    if(typeof obj=='string' && _b_[obj] !== undefined) {
      var _doc=_b_[obj].__doc__
      if (_doc !== undefined && _doc != '') {
         getattr($print,'__call__')(_doc)
         return
      }
    }
    if(typeof obj=='string'){
      $B.$import("pydoc");
      var pydoc=$B.vars["pydoc"]
      getattr(getattr(pydoc,"help"),"__call__")(obj)
      return
    }
    try{return getattr(obj,'__doc__')}
    catch(err){console.log('help err '+err);return ''}
}

help.__doc__="Define the builtin 'help'.\n    This is a wrapper around pydoc.help (with a twist).\n\n    "
help.__code__={}
help.__code__.co_argcount=1
help.__code__.co_consts=[]
help.__code__.co_varnames=['object']

function hex(x) { return $builtin_base_convert_helper(x, 16)}

hex.__doc__="hex(number) -> string\n\nReturn the hexadecimal representation of an integer.\n\n   >>> hex(3735928559)\n   '0xdeadbeef'\n"
hex.__code__={}
hex.__code__.co_argcount=1
hex.__code__.co_consts=[]
hex.__code__.co_varnames=['object']

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

id.__doc__="id(object) -> integer\n\nReturn the identity of an object.  This is guaranteed to be unique among\nsimultaneously existing objects.  (Hint: it's the object's memory address.)"
id.__code__={}
id.__code__.co_argcount=1
id.__code__.co_consts=[]
id.__code__.co_varnames=['object']


function __import__(mod_name){
   try {$B.$import(mod_name)}
   catch(err) {$B.imported[mod_name]=undefined}

   if ($B.imported[mod_name]===undefined) throw _b_.ImportError(mod_name) 

   return $B.imported[mod_name]
}

__import__.__doc__="__import__(name, globals=None, locals=None, fromlist=(), level=0) -> module\n\nImport a module. Because this function is meant for use by the Python\ninterpreter and not for general use it is better to use\nimportlib.import_module() to programmatically import a module.\n\nThe globals argument is only used to determine the context;\nthey are not modified.  The locals argument is unused.  The fromlist\nshould be a list of names to emulate ``from name import ...'', or an\nempty list to emulate ``import name''.\nWhen importing a module from a package, note that __import__('A.B', ...)\nreturns package A when fromlist is empty, but its submodule B when\nfromlist is not empty.  Level is used to determine whether to perform \nabsolute or relative imports. 0 is absolute while a positive number\nis the number of parent directories to search relative to the current module."
__import__.__code__={}
__import__.__code__.co_argcount=5
__import__.__code__.co_consts=[]
__import__.__code__.co_varnames=['name','globals','locals','fromlist','level']

//not a direct alias of prompt: input has no default value
function input(src) {return prompt(src)}

input.__doc__='input([prompt]) -> string\n\nRead a string from standard input.  The trailing newline is stripped.\nIf the user hits EOF (Unix: Ctl-D, Windows: Ctl-Z+Return), raise EOFError.\nOn Unix, GNU readline is used if enabled.  The prompt string, if given,\nis printed without a trailing newline before reading.'
input.__code__={}
input.__code__.co_argcount=1
input.__code__.co_consts=[]
input.__code__.co_varnames=['prompt']


function isinstance(obj,arg){

    if(obj===null) return arg===None
    if(obj===undefined) return false
    if(arg.constructor===Array){
        for(var i=0;i<arg.length;i++){
            if(isinstance(obj,arg[i])) return true
        }
        return false
    }
        
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
       }
    }

    if(klass!==undefined){
       // arg is the class constructor ; the attribute __class__ is the 
       // class dictionary, ie arg.$dict
       if(klass.__mro__===undefined){console.log('mro undef for '+klass+' '+klass.__name___+' '+dir(klass)+'\n arg '+arg)}

       if(arg.$dict===undefined){return false}
       var _name=arg.$dict.__name__
       for(var i=0;i<klass.__mro__.length;i++){
          //we need to find a better way of comparing __mro__'s and arg.$dict
          //for now, just assume that if the __name__'s match, we have a match
          if(klass.__mro__[i].__name__== _name) return true
       }

       return false
    }
    return obj.constructor===arg
}

isinstance.__doc__="isinstance(object, class-or-type-or-tuple) -> bool\n\nReturn whether an object is an instance of a class or of a subclass thereof.\nWith a type as second argument, return whether that is the object's type.\nThe form using a tuple, isinstance(x, (A, B, ...)), is a shortcut for\nisinstance(x, A) or isinstance(x, B) or ... (etc.)."
isinstance.__code__={}
isinstance.__code__.co_argcount=2
isinstance.__code__.co_consts=[]
isinstance.__code__.co_varnames=['object', 'type']


function issubclass(klass,classinfo){
    if(arguments.length!==2){
      throw _b_.TypeError("issubclass expected 2 arguments, got "+arguments.length)
    }
    if(!klass.__class__ || !klass.__class__.is_class){
      throw _b_.TypeError("issubclass() arg 1 must be a class")
    }
    if(isinstance(classinfo,_b_.tuple)){
      for(var i=0;i<classinfo.length;i++){
         if(issubclass(klass,classinfo[i])) return true
      }
      return false
    }
    if(classinfo.__class__.is_class){
      return klass.$dict.__mro__.indexOf(classinfo.$dict)>-1    
    }

    throw _b_.TypeError("issubclass() arg 2 must be a class or tuple of classes")
}

issubclass.__doc__='issubclass(C, B) -> bool\n\nReturn whether class C is a subclass (i.e., a derived class) of class B.\nWhen using a tuple as the second argument issubclass(X, (A, B, ...)),\nis a shortcut for issubclass(X, A) or issubclass(X, B) or ... (etc.).'
issubclass.__code__={}
issubclass.__code__.co_argcount=2
issubclass.__code__.co_consts=[]
issubclass.__code__.co_varnames=['C','D']


function iter(obj){
    try{return getattr(obj,'__iter__')()}
    catch(err){
      $B.$pop_exc()
      throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")
    }
}

iter.__doc__='iter(iterable) -> iterator\niter(callable, sentinel) -> iterator\n\nGet an iterator from an object.  In the first form, the argument must\nsupply its own iterator, or be a sequence.\nIn the second form, the callable is called until it returns the sentinel.'
iter.__code__={}
iter.__code__.co_argcount=1
iter.__code__.co_consts=[]
iter.__code__.co_varnames=['i']


function len(obj){
    try{return getattr(obj,'__len__')()}
    catch(err){
     throw _b_.TypeError("object of type '"+$B.get_class(obj).__name__+"' has no len()")
    }
}

len.__doc__='len(module, object)\n\nReturn the number of items of a sequence or mapping.'
len.__code__={}
len.__code__.co_argcount=2
len.__code__.co_consts=[]
len.__code__.co_varnames=['module', 'object']


// list built in function is defined in py_list

function locals(obj_id,module){
    // used for locals() ; the translation engine adds the argument obj,
    // a dictionary mapping local variable names to their values, and the
    // module name
    if($B.vars[obj_id]===undefined) return globals(module)

    var res = _b_.dict()
    var scope = $B.vars[obj_id]
    for(var name in scope){
       _b_.dict.$dict.__setitem__(res,name,scope[name])
    }
    return res
}

locals.__doc__="locals() -> dictionary\n\nUpdate and return a dictionary containing the current scope's local variables."
locals.__code__={}
locals.__code__.co_argcount=0
locals.__code__.co_consts=[]
locals.__code__.co_varnames=[]


var $MapDict = {__class__:$B.$type,__name__:'map'}
$MapDict.__mro__ = [$MapDict,$ObjectDict]
$MapDict.__iter__ = function (self){return self}

function map(){
    var func = getattr(arguments[0],'__call__')
    var iter_args = []
    for(var i=1;i<arguments.length;i++){iter_args.push(iter(arguments[i]))}
    var __next__ = function(){
        var args = []
        for(var i=0;i<iter_args.length;i++){
            try{
                var x = next(iter_args[i])
                args.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){
                    $B.$pop_exc();throw _b_.StopIteration('')
                }else{throw err}
            }
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

map.__doc__='map(func, *iterables) --> map object\n\nMake an iterator that computes the function using arguments from\neach of the iterables.  Stops when the shortest iterable is exhausted.'
map.__code__={}
map.__code__.co_argcount=1
map.__code__.co_consts=[]
map.__code__.co_varnames=['func']


function $extreme(args,op){ // used by min() and max()
    var $op_name='min'
    if(op==='__gt__') $op_name = "max"

    if(args.length==0){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
    var last_arg = args[args.length-1]
    var second_to_last_arg = args[args.length-2]
    var last_i = args.length-1
    var has_key = false
    var has_default = false
    var func = false
    if(last_arg.$nat=='kw'){
        if(last_arg.name === 'key'){
            var func = last_arg.value
            has_key = true
            last_i--
        }else if (last_arg.name === 'default'){
            var default_value = last_arg.value
            has_default = true
            last_i--
        }else{throw _b_.TypeError("'"+last_arg.name+"' is an invalid keyword argument for this function")}
    }else{var func = function(x){return x}}
    if(second_to_last_arg && second_to_last_arg.$nat=='kw'){
        if(second_to_last_arg.name === 'key'){
            if (has_key){throw _b_.SyntaxError("Keyword argument repeated")}
            var func = second_to_last_arg.value
            has_key = true
            last_i--
        }else if (second_to_last_arg.name === 'default'){
            if (has_default){throw _b_.SyntaxError("Keyword argument repeated")}
            var default_value = second_to_last_arg.value
            has_default = true
            last_i--
        }else{throw _b_.TypeError("'"+second_to_last_arg.name+"' is an invalid keyword argument for this function")}
    }else{if(!func){var func = function(x){return x}}}
    if((has_key && has_default && args.length==3) ||
       (!has_key && has_default && args.length==2) ||
       (has_key && !has_default && args.length==2) ||
       (!has_key && !has_default && args.length==1)){
        var arg = args[0]
        if (arg.length < 1 && has_default){
            return default_value
        }
        if (arg.length < 1 && !has_default){
            throw _b_.ValueError($op_name+"() arg is an empty sequence")
        }
        var $iter = iter(arg)
        var res = null
        while(true){
            try{
                var x = next($iter)
                if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
            }catch(err){
                if(err.__name__=="StopIteration"){return res}
                throw err
            }
        }
    } else if ((has_key && has_default && args.length>3) ||
               (!has_key && has_default && args.length>2)){
           throw _b_.TypeError("Cannot specify a default for "+$op_name+"() with multiple positional arguments")
    } else {
        if (last_i < 1){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
        var res = null
        for(var i=0;i<=last_i;i++){
            var x = args[i]
            if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
        }
        return res
    }
}

function max(){
    var args = []
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return $extreme(args,'__gt__')
}

max.__doc__='max(iterable[, key=func]) -> value\nmax(a, b, c, ...[, key=func]) -> value\n\nWith a single iterable argument, return its largest item.\nWith two or more arguments, return the largest argument.'
max.__code__={}
max.__code__.co_argcount=1
max.__code__.co_consts=[]
max.__code__.co_varnames=['iterable']


function memoryview(obj) {
  throw NotImplementedError('memoryview is not implemented')
}

function min(){
    var args = []
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return $extreme(args,'__lt__')
}

min.__doc__='min(iterable[, key=func]) -> value\nmin(a, b, c, ...[, key=func]) -> value\n\nWith a single iterable argument, return its smallest item.\nWith two or more arguments, return the smallest argument.'
min.__code__={}
min.__code__.co_argcount=1
min.__code__.co_consts=[]
min.__code__.co_varnames=['iterable']


function next(obj){
    var ga = getattr(obj,'__next__')
    if(ga!==undefined) return ga()
    throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not an iterator")
}

next.__doc__='next(iterator[, default])\n\nReturn the next item from the iterator. If default is given and the iterator\nis exhausted, it is returned instead of raising StopIteration.'
next.__code__={}
next.__code__.co_argcount=1
next.__code__.co_consts=[]
next.__code__.co_varnames=['iterable']


var $NotImplementedDict = {__class__:$B.$type,__name__:'NotImplementedType'}
$NotImplementedDict.__mro__ = [$NotImplementedDict,$ObjectDict]
$NotImplementedDict.__repr__ = $NotImplementedDict.__str__ = function(){return 'NotImplemented'}

var NotImplemented = {__class__ : $NotImplementedDict,}

function $not(obj){return !bool(obj)}

function oct(x) {return $builtin_base_convert_helper(x, 8)}

oct.__doc__="oct(number) -> string\n\nReturn the octal representation of an integer.\n\n   >>> oct(342391)\n   '0o1234567'\n"
oct.__code__={}
oct.__code__.co_argcount=1
oct.__code__.co_consts=[]
oct.__code__.co_varnames=['number']


function ord(c) {
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    return c.charCodeAt(0)     // <= strobj.charCodeAt(index)
}

ord.__doc__='ord(c) -> integer\n\nReturn the integer ordinal of a one-character string.'
ord.__code__={}
ord.__code__.co_argcount=1
ord.__code__.co_consts=[]
ord.__code__.co_varnames=['number']

function pow() {
    var $ns=$B.$MakeArgs('pow',arguments,[],[],'args','kw')
    var args = $ns['args']
    if(args.length<2){throw _b_.TypeError(
        "pow expected at least 2 arguments, got "+args.length)
    }
    if(args.length>3){throw _b_.TypeError(
        "pow expected at most 3 arguments, got "+args.length)
    }
    if(args.length === 2){
        var x = args[0]
        var y = args[1]
        var a,b
        if(isinstance(x, _b_.float)){a=x.value
        } else if(isinstance(x, _b_.int)){a=x
        } else {throw _b_.TypeError("unsupported operand type(s) for ** or pow()")
        }

        if (isinstance(y, _b_.float)){b=y.value
        } else if (isinstance(y, _b_.int)){b=y
        } else {
          throw _b_.TypeError("unsupported operand type(s) for ** or pow()")
        }
        return Math.pow(a,b)
    }

    if(args.length === 3){
        var x = args[0]
        var y = args[1]
        var z = args[2]
        var _err="pow() 3rd argument not allowed unless all arguments are integers"

        if (!isinstance(x, _b_.int)) throw _b_.TypeError(_err)
        if (!isinstance(y, _b_.int)) throw _b_.TypeError(_err)
        if (!isinstance(z, _b_.int)) throw _b_.TypeError(_err)

        return Math.pow(x,y)%z
    }
}

pow.__doc__='pow(x, y[, z]) -> number\n\nWith two arguments, equivalent to x**y.  With three arguments,\nequivalent to (x**y) % z, but may be more efficient (e.g. for ints).'
pow.__code__={}
pow.__code__.co_argcount=2
pow.__code__.co_consts=[]
pow.__code__.co_varnames=['x','y']


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

property.__doc__='property(fget=None, fset=None, fdel=None, doc=None) -> property attribute\n\nfget is a function to be used for getting an attribute value, and likewise\nfset is a function for setting, and fdel a function for del\'ing, an\nattribute.  Typical use is to define a managed attribute x:\n\nclass C(object):\n    def getx(self): return self._x\n    def setx(self, value): self._x = value\n    def delx(self): del self._x\n    x = property(getx, setx, delx, "I\'m the \'x\' property.")\n\nDecorators make defining new properties or modifying existing ones easy:\n\nclass C(object):\n    @property\n    def x(self):\n        "I am the \'x\' property."\n        return self._x\n    @x.setter\n    def x(self, value):\n        self._x = value\n    @x.deleter\n    def x(self):\n        del self._x\n'
property.__code__={}
property.__code__.co_argcount=4
property.__code__.co_consts=[]
property.__code__.co_varnames=['fget','fset','fdel', 'doc']


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
    var t0 = new Date().getTime()
    var res = self.start + rank*self.step
    if((self.step>0 && res >= self.stop) ||
        (self.step<0 && res < self.stop)){
            throw _b_.IndexError('range object index out of range')
    }
    return res   
}

// special method to speed up "for" loops
$RangeDict.__getitems__ = function(self){
    var t=[],rank=0
    while(1){
        var res = self.start + rank*self.step
        if((self.step>0 && res >= self.stop) ||
            (self.step<0 && res < self.stop)){
                break
        }
        t.push(res)
        rank++
    }
    return t
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
    self.$counter += self.step
    if((self.step>0 && self.$counter >= self.stop)
        || (self.step<0 && self.$counter <= self.stop)){
            throw _b_.StopIteration('')
    }
    return self.$counter
}

$RangeDict.__mro__ = [$RangeDict,$ObjectDict]

$RangeDict.__reversed__ = function(self){
    return range(self.stop-1,self.start-1,-self.step)
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
    var start=0
    var stop=0
    var step=1
    if(args.length==1){stop = args[0]}
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
    res.__repr__ = res.__str__ = function(){
            return 'range('+start+','+stop+(args.length>=3 ? ','+step : '')+')'
        }
    return res
}
range.__class__ = $B.$factory
range.$dict = $RangeDict
$RangeDict.$factory = range

range.__doc__='range(stop) -> range object\nrange(start, stop[, step]) -> range object\n\nReturn a virtual sequence of numbers from start to stop by step.'
range.__code__={}
range.__code__.co_argcount=1
range.__code__.co_consts=[]
range.__code__.co_varnames=['stop']


function repr(obj){
    var func = getattr(obj,'__repr__')
    if(func!==undefined) return func()
    throw _b_.AttributeError("object has no attribute __repr__")
}

repr.__doc__='repr(object) -> string\n\nReturn the canonical string representation of the object.\nFor most object types, eval(repr(object)) == object.'
repr.__code__={}
repr.__code__.co_argcount=1
repr.__code__.co_consts=[]
repr.__code__.co_varnames=['object']


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
        if(err.__name__=='AttributeError'){$B.$pop_exc()}
        else{throw err}
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

reversed.__doc__='reversed(sequence) -> reverse iterator over values of the sequence\n\nReturn a reverse iterator'
reversed.__code__={}
reversed.__code__.co_argcount=1
reversed.__code__.co_consts=[]
reversed.__code__.co_varnames=['sequence']


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

round.__doc__='round(number[, ndigits]) -> number\n\nRound a number to a given precision in decimal digits (default 0 digits).\nThis returns an int when called with one argument, otherwise the\nsame type as the number. ndigits may be negative.'
round.__code__={}
round.__code__.co_argcount=1
round.__code__.co_consts=[]
round.__code__.co_varnames=['number']


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
    }
    
    var res = obj[attr]
    if(res===undefined){
        var mro = $B.get_class(obj).__mro__
        for(var i=0;i<mro.length;i++){
            res = mro[i][attr]
            if(res!==undefined) break
        }
    }
    if(res!==undefined){
        // descriptor protocol : if obj has attribute attr and this attribute 
        // has a method __set__(), use it
        if(res.__set__!==undefined) return res.__set__(res,obj,value)
        var __set__ = getattr(res,'__set__',null)
        if(__set__ && (typeof __set__=='function')) {return __set__.apply(res,[obj,value])}
    }
    
    // For instances of simple classes (no inheritance) there is no need to
    // search __setattr__
    if(obj.$simple_setattr){obj[attr]=value;return}
    
    try{var f = getattr(obj,'__setattr__')}
    catch(err){
        $B.$pop_exc()
        obj[attr]=value
        return
    }
    f(attr,value)
}

setattr.__doc__="setattr(object, name, value)\n\nSet a named attribute on an object; setattr(x, 'y', v) is equivalent to\n``x.y = v''."
setattr.__code__={}
setattr.__code__.co_argcount=3
setattr.__code__.co_consts=[]
setattr.__code__.co_varnames=['object','name','value']


// slice
var $SliceDict = {__class__:$B.$type, __name__:'slice'}

$SliceDict.__mro__ = [$SliceDict,$ObjectDict]

function slice(){
    var $ns=$B.$MakeArgs('slice',arguments,[],[],'args',null)
    var args = $ns['args']
    if(args.length>3){throw _b_.TypeError(
        "slice expected at most 3 arguments, got "+args.length)
    }else if(args.length==0){
        throw _b_.TypeError('slice expected at least 1 arguments, got 0')
    }

    var start=0, stop=0, step=1
    if(args.length==1){start=None;stop = args[0];step=None}
    else if(args.length>=2){
        start = args[0]
        stop = args[1]
    }
    if(args.length>=3) step=args[2]
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

slice.__doc__='slice(stop)\nslice(start, stop[, step])\n\nCreate a slice object.  This is used for extended slicing (e.g. a[0:10:2]).'
slice.__code__={}
slice.__code__.co_argcount=3
slice.__code__.co_consts=[]
slice.__code__.co_varnames=['start','stop','step']

function sorted () {
    var $ns=$B.$MakeArgs('sorted',arguments,['iterable'],[],null,'kw')
    if($ns['iterable']===undefined) throw _b_.TypeError("sorted expected 1 positional argument, got 0")
    var iterable=$ns['iterable']
    var key = _b_.dict.$dict.get($ns['kw'],'key',None)
    var reverse = _b_.dict.$dict.get($ns['kw'],'reverse',false)

    var obj = _b_.list(iterable)
    // pass arguments to list.sort()
    var args = [obj]
    if (key !== None) args.push({$nat:'kw',name:'key',value:key})
    if(reverse) args.push({$nat:'kw',name:'reverse',value:true})
    _b_.list.$dict.sort.apply(null,args)
    return obj
}

sorted.__doc__='sorted(iterable, key=None, reverse=False) --> new sorted list'
sorted.__code__={}
sorted.__code__.co_argcount=3
sorted.__code__.co_consts=[]
sorted.__code__.co_varnames=['iterable', 'key', 'reverse']


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

staticmethod.__doc__='staticmethod(function) -> method\n\nConvert a function to be a static method.\n\nA static method does not receive an implicit first argument.\nTo declare a static method, use this idiom:\n\n     class C:\n     def f(arg1, arg2, ...): ...\n     f = staticmethod(f)\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()).  The instance is ignored except for its class.\n\nStatic methods in Python are similar to those found in Java or C++.\nFor a more advanced concept, see the classmethod builtin.'
staticmethod.__code__={}
staticmethod.__code__.co_argcount=1
staticmethod.__code__.co_consts=[]
staticmethod.__code__.co_varnames=['function']


// str() defined in py_string.js

function sum(iterable,start){
    if(start===undefined) start=0
    var res = start
    var iterable = iter(iterable)
    while(1){
        try{
            var _item = next(iterable)
            res = getattr(res,'__add__')(_item)
        }catch(err){
           if(err.__name__==='StopIteration'){$B.$pop_exc();break}
           else{throw err}
        }
    }
    return res
}

sum.__doc__="sum(iterable[, start]) -> value\n\nReturn the sum of an iterable of numbers (NOT strings) plus the value\nof parameter 'start' (which defaults to 0).  When the iterable is\nempty, return start."
sum.__code__={}
sum.__code__.co_argcount=2
sum.__code__.co_consts=[]
sum.__code__.co_varnames=['iterable', 'start']


// super() built in function
var $SuperDict = {__class__:$B.$type,__name__:'super'}

$SuperDict.__getattribute__ = function(self,attr){
    var mro = self.__thisclass__.$dict.__mro__,res
    for(var i=1;i<mro.length;i++){ // start with 1 = ignores the class where super() is defined
        res = mro[i][attr]
        if(res!==undefined){
            // if super() is called with a second argument, the result is bound
            if(self.__self_class__!==None){
                var _args = [self.__self_class__]
                if(attr=='__new__'){_args=[]}
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0;i<arguments.length;i++){
                            local_args.push(arguments[i])
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

$SuperDict.__repr__=$SuperDict.__str__=function(self){return "<object 'super'>"}

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
    if(res.closed===true) throw _b_.ValueError('I/O operation on closed file')

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
}

$Reader.readlines = function(self,hint){
    if(self.closed===true) throw _b_.ValueError('I/O operation on closed file')
    var x = self.$content.substr(self.$counter).split('\n')
    if(hint && hint!==-1){
        var y=[],size=0
        while(1){
            var z = x.shift()
            y.push(z)
            size += z.length
            if(size>hint || x.length==0) return y
        }
    }else{return x}
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
                $res = _b_.IOError('File not found')
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
    var args = []
    for(var i=0;i<_args.length;i++){args.push(iter(_args[i]))}
    var kw = $ns['kw']
    var rank=0,items=[]
    while(1){
        var line=[],flag=true
        for(var i=0;i<args.length;i++){
            try{
                var x=next(args[i])
                line.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){$B.$pop_exc();flag=false;break}
                else{throw err}
            }
        }
        if(!flag) break
        items.push(_b_.tuple(line))
        rank++
    }
    res.items = items
    return res
}
zip.__class__=$B.$factory
zip.$dict = $ZipDict
$ZipDict.$factory = zip

zip.__doc__='zip(iter1 [,iter2 [...]]) --> zip object\n\nReturn a zip object whose .__next__() method returns a tuple where\nthe i-th element comes from the i-th iterable argument.  The .__next__()\nmethod continues until the shortest iterable in the argument sequence\nis exhausted and then it raises StopIteration.'
zip.__code__={}
zip.__code__.co_argcount=1
zip.__code__.co_consts=[]
zip.__code__.co_varnames=['iter1']


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

bool.__doc__='bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
bool.__code__={}
bool.__code__.co_argcount=1
bool.__code__.co_consts=[]
bool.__code__.co_varnames=['x']

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

$BoolDict.__hash__ = function(self) {
   if(self.valueOf()) return 1
   return 0
}

$BoolDict.__le__ = function(self,other){return !$BoolDict.__gt__(self,other)}

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

var $NoneDict = {__class__:$B.$type,__name__:'NoneType',}

$NoneDict.__mro__ = [$NoneDict,$ObjectDict]

$NoneDict.__setattr__ = function(self, attr){
    return no_set_attr($NoneDict, attr)
}

$NoneDict.$factory = $NoneDict

var None = {
    __bool__ : function(){return False},
    __class__ : $NoneDict,
    __hash__ : function(){return 0},
    __repr__ : function(){return 'None'},
    __str__ : function(){return 'None'},
    toString : function(){return 'None'}
}

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
var $FunctionGlobalsDict = {__class:$B.$type,__name__:'function globals'}
$FunctionGlobalsDict.__mro__ = [$FunctionGlobalsDict,$ObjectDict]

var $FunctionDict = $B.$FunctionDict = {
    __class__:$B.$type,
    __code__:{__class__:$FunctionCodeDict,__name__:'function code'},
    __globals__:{__class__:$FunctionGlobalsDict,__name__:'function globals'},
    __name__:'function'
}

$FunctionDict.__repr__=$FunctionDict.__str__ = function(self){return '<function '+self.__name__+'>'}

$FunctionDict.__mro__ = [$FunctionDict,$ObjectDict]
var $Function = function(){}
$FunctionDict.$factory = $Function
$Function.$dict = $FunctionDict

// built-in exceptions

var $BaseExceptionDict = {__class__:$B.$type,__name__:'BaseException'}

$BaseExceptionDict.__init__ = function(self){
    self.args = [arguments[1]]
}

$BaseExceptionDict.__repr__ = function(self){
    if(self.message===None){return $B.get_class(self).__name__+'()'}
    return self.message
}

$BaseExceptionDict.__str__ = $BaseExceptionDict.__repr__

$BaseExceptionDict.__mro__ = [$BaseExceptionDict,$ObjectDict]

$BaseExceptionDict.__new__ = function(cls){
    var err = _b_.BaseException()
    err.__name__ = cls.$dict.__name__
    err.__class__ = cls.$dict
    return err
}

// class of traceback objects
var $TracebackDict = {__class__:$B.$type,
    __name__:'traceback',
    __mro__:[$ObjectDict]
}

// class of frame objects
var $FrameDict = {__class__:$B.$type,
    __name__:'frame',
    __mro__:[$ObjectDict]
}

var BaseException = function (msg,js_exc){
    var err = Error()
    err.info = 'Traceback (most recent call last):'
    if(msg===undefined) msg='BaseException'
    var tb = null
    
    if($B.debug && !msg.info){
        if(js_exc!==undefined){
            for(var attr in js_exc){
                if(attr==='message') continue
                try{err.info += '\n    '+attr+' : '+js_exc[attr]}
                catch(_err){void(0)}
            }
            err.info+='\n'        
        }
        // call stack
        var last_info, tb=null
        for(var i=0;i<$B.call_stack.length;i++){
            var call_info = $B.call_stack[i]
            var lib_module = call_info[1]
            var caller = $B.modules[lib_module].line_info
            if(caller!==undefined){
                call_info = caller
                lib_module = caller[1]
            }
            if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
            var lines = $B.$py_src[call_info[1]].split('\n')
            err.info += '\n  module '+lib_module+' line '+call_info[0]
            var line = lines[call_info[0]-1]
            while(line && line.charAt(0)==' '){line=line.substr(1)}
            err.info += '\n    '+line
            last_info = call_info
            // create traceback object
            if(i==0){
                tb = {__class__:$TracebackDict,
                    tb_frame:{__class__:$FrameDict},
                    tb_lineno:call_info[0],
                    tb_lasti:line,
                    tb_next: None // fix me
                    }
            }
        }
        // error line
        var err_info = $B.line_info
        if(err_info!==undefined){
            while(1){
                var mod = $B.modules[err_info[1]]
                if(mod===undefined) break
                var caller = mod.line_info
                if(caller===undefined) break
                err_info = caller
            }
        }
        if(err_info!==undefined && err_info!==last_info){
            var module = err_info[1]
            var line_num = err_info[0]
            try{
            var lines = $B.$py_src[module].split('\n')
            }catch(err){console.log('--module '+module);throw err}
            var lib_module = module
            if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
            err.info += "\n  module "+lib_module+" line "+line_num
            var line = lines[line_num-1]
            while(line && line.charAt(0)==' '){line = line.substr(1)}
            err.info += '\n    '+line
            // create traceback object
            tb = {__class__:$TracebackDict,
                tb_frame:{__class__:$FrameDict},
                tb_lineno:line_num,
                tb_lasti:line,
                tb_next: None   // fix me
            }
        }
    }else{
        // minimal traceback object if debug mode is not set
        tb = {__class__:$TracebackDict,
            tb_frame:{__class__:$FrameDict},
            tb_lineno:-1,
            tb_lasti:'',
            tb_next: None   // fix me
        }
    }
    err.message = msg
    err.args = msg
    err.__name__ = 'BaseException'
    err.__class__ = $BaseExceptionDict
    err.py_error = true
    err.type = 'BaseException'
    err.value = msg
    err.traceback = tb
    $B.exception_stack.push(err)
    return err
}

BaseException.__name__ = 'BaseException'
BaseException.__class__ = $B.$factory
BaseException.$dict = $BaseExceptionDict

_b_.BaseException = BaseException

$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute py_error set 
    // or by the Javascript interpreter (ReferenceError for instance)

    if($B.debug>0 && js_exc.caught===undefined){
        console.log('$B.exception ', js_exc)
        for(var attr in js_exc){console.log(attr,js_exc[attr])}
        console.log('line info '+ $B.line_info)
        console.log(js_exc.info)
    }

    if(!js_exc.py_error){
        if($B.debug>0 && js_exc.info===undefined){
            //console.log('erreur '+js_exc+' dans module '+$B.line_info)
            if($B.line_info!==undefined){
                var mod_name = $B.line_info[1]
                var module = $B.modules[mod_name]
                if(module){
                    if(module.caller!==undefined){
                        // for list comprehension and the likes, replace
                        // by the line in the enclosing module
                        $B.line_info = module.caller
                        var mod_name = $B.line_info[1]
                    }
                    var lib_module = mod_name
                    if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
                    var line_num = $B.line_info[0]
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
        exc.__name__ = js_exc.__name__ || js_exc.name
        exc.__class__ = _b_.Exception.$dict
        if(js_exc.name=='ReferenceError'){
            exc.__name__='NameError'
            exc.__class__=_b_.NameError.$dict
            js_exc.message = js_exc.message.replace('$$','')
            console.log('name error '+js_exc)
        }
        exc.message = js_exc.message || '<'+js_exc+'>'
        exc.info = ''
        exc.traceback = {__class__:$TracebackDict,
            tb_frame:{__class__:$FrameDict},
            tb_lineno:-1,
            tb_lasti:'',
            tb_next: None   // fix me
        }
    }else{
        var exc = js_exc
    }
    $B.exception_stack.push(exc)
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

$B.vars['__builtins__'] = {}

_b_.__BRYTHON__ = __BRYTHON__

function $make_exc(names,parent){
    // create a class for exception called "name"
    var _str=[]
    for(var i=0;i<names.length;i++){
        var name = names[i]
        $B.bound['__builtins__'][name] = true
        var $exc = (BaseException+'').replace(/BaseException/g,name)
        // class dictionary
        _str.push('var $'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}')
        _str.push('$'+name+'Dict.__mro__=[$'+name+'Dict].concat(parent.$dict.__mro__)')
        // class constructor
        _str.push('_b_.'+name+'='+$exc)
        _str.push('_b_.'+name+'.__repr__ = function(){return "<class '+"'"+name+"'"+'>"}')
        _str.push('_b_.'+name+'.__str__ = function(){return "<class '+"'"+name+"'"+'>"}')
        _str.push('_b_.'+name+'.__class__=$B.$factory')
        _str.push('$'+name+'Dict.$factory=_b_.'+name)
        _str.push('_b_.'+name+'.$dict=$'+name+'Dict')
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
'dict', 'dir', 'divmod', 'enumerate', 'exec', 'exit', 
'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 
'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 
'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 
'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 
'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 
'sum','super', 'tuple', 'type', 'vars', 'zip']

for(var i=0;i<builtin_funcs.length;i++){
    $B.builtin_funcs[builtin_funcs[i]]=true
}

var other_builtins = [ 'Ellipsis', 'False',  'None', 'True', 
'__build_class__', '__debug__', '__doc__', '__import__', '__name__', 
'__package__', 'copyright', 'credits', 'license', 'NotImplemented']

var builtin_names = builtin_funcs.concat(other_builtins)

for(var i=0;i<builtin_names.length;i++){
    var name = builtin_names[i]
    var name1 = name
    if(name=='open'){name1 = '$url_open'}
    if(name=='super'){name = '$$super'}
    $B.bound['__builtins__'][name] = true
    try{
        _b_[name] = eval(name1)
        $B.vars['__builtins__'][name] = _b_[name]
        if(typeof _b_[name]=='function'){
            if(_b_[name].__repr__===undefined){
                _b_[name].__repr__ = _b_[name].__str__ = (function(x){
                    return function(){return '<built-in function '+x+'>'}
                })(name)
            }
            // used by inspect module
            _b_[name].__module__ = 'builtins'
            _b_[name].__name__ = name

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
