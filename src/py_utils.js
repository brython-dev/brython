;(function($B){

var _b_=$B.builtins

$B.$MakeArgs = function($fname,$args,$required,$defaults,$other_args,$other_kw,$after_star){
    // builds a namespace from the arguments provided in $args
    // in a function defined like foo(x,y,z=1,*args,u,v,**kw) the parameters are
    // $required : ['x','y']
    // $defaults : {'z':1}
    // $other_args = 'args'
    // $other_kw = 'kw'
    // $after_star = ['u','v']

    var $ns = {},$arg

    var $robj = {}
    for(var i=0;i<$required.length;i++){$robj[$required[i]]=null}

    var $dobj = {}
    for(var i=0;i<$defaults.length;i++){$dobj[$defaults[i]]=null}

    if($other_args != null){$ns[$other_args]=[]}
    if($other_kw != null){var $dict_keys=[], $dict_values=[]}
    // create new list of arguments in case some are packed
    var upargs = []
    for(var i=0, _len_i = $args.length; i < _len_i;i++){
        $arg = $args[i]
        if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
        else if($arg===null){upargs.push(null)}
        else {
           switch($arg.$nat) {
             case 'ptuple':
               var _arg=$arg.arg
               for(var j=0, _len_j = _arg.length; j < _len_j;j++) upargs.push(_arg[j])
               break
             case 'pdict':
               var _arg=$arg.arg, items=_b_.list(_b_.dict.$dict.items(_arg))
               for(var j=0, _len_j = items.length; j < _len_j;j++){
                  upargs.push({$nat:"kw",name:items[j][0],value:items[j][1]})
               }
               break
             default:
               upargs.push($arg)
           }//switch
        }//else
    }
    var nbreqset = 0 // number of required arguments set
    for(var $i=0, _len_$i = upargs.length; $i < _len_$i;$i++){
        var $arg=upargs[$i]
        var $PyVar=$B.$JS2Py($arg)
        if($arg && $arg.$nat=='kw'){ // keyword argument
            $PyVar = $arg.value
            if($ns[$arg.name]!==undefined){
                throw _b_.TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
            }else if($robj[$arg.name]===null){
                $ns[$arg.name]=$PyVar
                nbreqset++
            }else if($other_args!==null && $after_star!==undefined &&
                $after_star.indexOf($arg.name)>-1){
                    var ix = $after_star.indexOf($arg.name)
                    $ns[$after_star[ix]]=$PyVar
            } else if($dobj[$arg.name]===null){
                $ns[$arg.name]=$PyVar
                var pos_def = $defaults.indexOf($arg.name)
                $defaults.splice(pos_def,1)
                delete $dobj[$arg.name]
            } else if($other_kw!=null){
                $dict_keys.push($arg.name)
                $dict_values.push($PyVar)
            } else {
                throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
            }
        }else{ // positional argument
            if($i<$required.length){
                $ns[$required[$i]]=$PyVar
                nbreqset++
            } else if($other_args!==null){
                $ns[$other_args].push($PyVar)
            } else if($i<$required.length+$defaults.length) {
                $ns[$defaults[$i-$required.length]]=$PyVar
            } else {
                console.log(''+$B.line_info)
                msg = $fname+"() takes "+$required.length+' positional argument'
                msg += $required.length == 1 ? '' : 's'
                msg += ' but more were given'
                throw _b_.TypeError(msg)
            }
        }
    }
    if(nbreqset!==$required.length){
        // throw error if not all required positional arguments have been set
        var missing = []
        for(var i=0, _len_i = $required.length; i < _len_i;i++){
            if($ns[$required[i]]===undefined){missing.push($required[i])}
        }
        if(missing.length==1){
            throw _b_.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
        }else if(missing.length>1){
            var msg = $fname+" missing "+missing.length+" positional arguments: "
            for(var i=0, _len_i = missing.length-1; i < _len_i;i++){msg += "'"+missing[i]+"', "}
            msg += "and '"+missing.pop()+"'"
            throw _b_.TypeError(msg)
        }
    }
    if($other_kw!=null){
        $ns[$other_kw]=_b_.dict()
        for(var i=0;i<$dict_keys.length;i++){
            _b_.dict.$dict.__setitem__($ns[$other_kw], $dict_keys[i],
                $dict_values[i])
        }
    }
    if($other_args!=null){$ns[$other_args]=_b_.tuple($ns[$other_args])}
    return $ns
}

$B.$MakeArgs1 = function($fname,$args,$robj,$required,$dobj,$defaults,
    $other_args,$other_kw,$after_star){
    // builds a namespace from the arguments provided in $args
    // in a function defined like foo(x,y,z=1,*args,u,v,**kw) the parameters are
    // $required : ['x','y']
    // $defaults : {'z':1}
    // $other_args = 'args'
    // $other_kw = 'kw'
    // $after_star = ['u','v']

    var $ns = {},$arg

    if($other_args != null){$ns[$other_args]=[]}
    if($other_kw != null){var $dict_keys=[], $dict_values=[]}
    // create new list of arguments in case some are packed
    var upargs = []
    for(var i=0, _len_i = $args.length; i < _len_i;i++){
        $arg = $args[i]
        if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
        else if($arg===null){upargs.push(null)}
        else {
           switch($arg.$nat) {
             case 'ptuple':
               var _arg=$arg.arg
               for(var j=0, _len_j = _arg.length; j < _len_j;j++) upargs.push(_arg[j])
               break
             case 'pdict':
               var _arg=$arg.arg, items=_b_.list(_b_.dict.$dict.items(_arg))
               for(var j=0, _len_j = items.length; j < _len_j;j++){
                  upargs.push({$nat:"kw",name:items[j][0],value:items[j][1]})
               }
               break
             default:
               upargs.push($arg)
           }//switch
        }//else
    }
    var nbreqset = 0 // number of required arguments set
    for(var $i=0, _len_$i = upargs.length; $i < _len_$i;$i++){
        var $arg=upargs[$i]
        var $PyVar=$B.$JS2Py($arg)
        if($arg && $arg.$nat=='kw'){ // keyword argument
            $PyVar = $arg.value
            if($ns[$arg.name]!==undefined){
                throw _b_.TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
            }else if($robj[$arg.name]===null){
                $ns[$arg.name]=$PyVar
                nbreqset++
            }else if($other_args!==null && $after_star!==undefined &&
                $after_star.indexOf($arg.name)>-1){
                    var ix = $after_star.indexOf($arg.name)
                    $ns[$after_star[ix]]=$PyVar
            } else if($dobj[$arg.name]===null){
                $ns[$arg.name]=$PyVar
                var pos_def = $defaults.indexOf($arg.name)
                $defaults.splice(pos_def,1)
                delete $dobj[$arg.name]
            } else if($other_kw!=null){
                $dict_keys.push($arg.name)
                $dict_values.push($PyVar)
            } else {
                throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
            }
        }else{ // positional argument
            if($i<$required.length){
                $ns[$required[$i]]=$PyVar
                nbreqset++
            } else if($other_args!==null){
                $ns[$other_args].push($PyVar)
            } else if($i<$required.length+$defaults.length) {
                $ns[$defaults[$i-$required.length]]=$PyVar
            } else {
                console.log(''+$B.line_info)
                msg = $fname+"() takes "+$required.length+' positional argument'
                msg += $required.length == 1 ? '' : 's'
                msg += ' but more were given'
                throw _b_.TypeError(msg)
            }
        }
    }
    if(nbreqset!==$required.length){
        // throw error if not all required positional arguments have been set
        var missing = []
        for(var i=0, _len_i = $required.length; i < _len_i;i++){
            if($ns[$required[i]]===undefined){missing.push($required[i])}
        }
        if(missing.length==1){
            throw _b_.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
        }else if(missing.length>1){
            var msg = $fname+" missing "+missing.length+" positional arguments: "
            for(var i=0, _len_i = missing.length-1; i < _len_i;i++){msg += "'"+missing[i]+"', "}
            msg += "and '"+missing.pop()+"'"
            throw _b_.TypeError(msg)
        }
    }
    if($other_kw!=null){
        $ns[$other_kw]=_b_.dict()
        for(var i=0;i<$dict_keys.length;i++){
            _b_.dict.$dict.__setitem__($ns[$other_kw], $dict_keys[i],
                $dict_values[i])
        }
    }
    if($other_args!=null){$ns[$other_args]=_b_.tuple($ns[$other_args])}
    return $ns
}


$B.get_class = function(obj){
    // generally we get the attribute __class__ of an object by obj.__class__
    // but Javascript builtins used by Brython (functions, numbers, strings...)
    // don't have this attribute so we must return it
    if(obj===null){return $B.$NoneDict}
    var klass = obj.__class__
    if(klass===undefined){
        switch(typeof obj) {
          case 'number':
            obj.__class__=_b_.int.$dict
            return _b_.int.$dict
          case 'string':
            obj.__class__=_b_.str.$dict
            return _b_.str.$dict
          case 'boolean':
            obj.__class__=$B.$BoolDict
            return $B.$BoolDict
          case 'function':
            obj.__class__=$B.$FunctionDict
            return $B.$FunctionDict
          case 'object':
            if(obj.constructor===Array) {
              obj.__class__=_b_.list.$dict
              return _b_.list.$dict
            }
        }
    }
    return klass
}

$B.$mkdict = function(glob,loc){
    var res = {}
    for(var arg in glob) res[arg]=glob[arg]
    for(var arg in loc) res[arg]=loc[arg]
    return res
}

function clear(ns){
    // delete temporary structures
    delete $B.vars[ns], $B.bound[ns], $B.modules[ns], $B.imported[ns]
    
}

$B.$list_comp = function(module_name, parent_block_id){
    var $ix = $B.UUID()
    var $py = 'def func'+$ix+"():\n"
    $py += "    x"+$ix+"=[]\n"
    var indent=4
    for(var $i=3, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py += ' '.repeat(indent)
        $py += arguments[$i]+':\n'
        indent += 4
    }
    $py += ' '.repeat(indent)
    $py += 'x'+$ix+'.append('+arguments[2].join('\n')+')\n'
    $py += "    return x"+$ix+"\n"
    $py += "res"+$ix+"=func"+$ix+"()"
    var $mod_name = 'lc'+$ix

    var $root = $B.py2js($py,module_name,$mod_name,parent_block_id,
        $B.line_info)
    
    $root.caller = $B.line_info

    var $js = $root.to_js()
    
    try{
        eval($js)
        var res = $B.vars['lc'+$ix]['res'+$ix]
    }
    catch(err){throw $B.exception(err)}
    finally{clear($mod_name)}

    return res
}

$B.$gen_expr = function(){ // generator expresssion
    var module_name = arguments[0]
    var parent_block_id = arguments[1]
    var $ix = $B.UUID()
    var $res = 'res'+$ix
    var $py = $res+"=[]\n"
    var indent=0
    for(var $i=3, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py+=' '.repeat(indent)
        $py += arguments[$i].join(' ')+':\n'
        indent += 4
    }
    $py+=' '.repeat(indent)
    $py += $res+'.append('+arguments[2].join('\n')+')'
    
    var $mod_name = 'ge'+$ix
    $B.vars[$mod_name] = {}

    var $root = $B.py2js($py,module_name,$mod_name,parent_block_id,
        $B.line_info)
    var $js = $root.to_js()
  
    eval($js)
    
    var $res1 = $B.vars["ge"+$ix]["res"+$ix]

    var $GenExprDict = {
        __class__:$B.$type,
        __name__:'generator',
        toString:function(){return '(generator)'}
    }
    $GenExprDict.__mro__ = [$GenExprDict,_b_.object.$dict]
    $GenExprDict.__iter__ = function(self){return self}
    $GenExprDict.__next__ = function(self){
        self.$counter += 1
        if(self.$counter==self.value.length){
            throw _b_.StopIteration('')
        }
        return self.value[self.$counter]
    }
    $GenExprDict.__str__ = function(self){
        if(self===undefined) return "<class 'generator'>"
        return '<generator object <genexpr>>'
    }
    $GenExprDict.$factory = $GenExprDict
    var $res2 = {value:$res1,__class__:$GenExprDict,$counter:-1}
    $res2.toString = function(){return 'ge object'}
    clear($mod_name)
    return $res2
}

$B.$dict_comp = function(module_name,parent_block_id){ // dictionary comprehension

    var $ix = $B.UUID()
    var $res = 'res'+$ix
    var $py = $res+"={}\n"
    var indent=0
    for(var $i=3, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py+=' '.repeat(indent)
        $py += arguments[$i]+':\n'
        indent += 4
    }
    $py+=' '.repeat(indent)
    $py += $res+'.update({'+arguments[2].join('\n')+'})'
    var locals_id = 'dc'+$ix
    var $root = $B.py2js($py,module_name,locals_id,parent_block_id)
    $root.caller = $B.line_info
    var $js = $root.to_js()
    eval($js)
    var res = $B.vars[locals_id][$res]
    clear(locals_id)
    return res
}

$B.$lambda = function(locals,$mod,parent_block_id,$args,$body){

    var rand = $B.UUID()
    var $res = 'lambda_'+$B.lambda_magic+'_'+rand
    var local_id = 'lambda'+rand
    var $py = 'def '+$res+'('+$args+'):\n'
    $py += '    return '+$body
    
    $B.vars[local_id] = $B.vars[local_id] || {}
    for(var $attr in locals){
        $B.vars[local_id][$attr] = locals[$attr]
    }

    var $js = $B.py2js($py,$mod,local_id,parent_block_id).to_js()
    eval($js)

    var $res = $B.vars[local_id][$res]
    $res.__module__ = $mod
    $res.__name__ = '<lambda>'
    return $res
}

// Function used to resolve names not defined in Python source
// but introduced by "from A import *" or by exec

$B.$search = function(name, globals_id){
    var res = $B.vars[globals_id][name]
    return res !== undefined ? res : $B.$NameError(name)
}

// transform native JS types into Brython types
$B.$JS2Py = function(src){
    if(typeof src==='number'){
        if(src%1===0) return src
        return _b_.float(src)
    }
    if(src===null||src===undefined) return _b_.None
    var klass = $B.get_class(src)
    if(klass!==undefined){
        if(klass===_b_.list.$dict){
            for(var i=0, _len_i = src.length; i< _len_i;i++) src[i] = $B.$JS2Py(src[i])
        }
        return src
    }
    if(typeof src=="object"){
        if($B.$isNode(src)) return $B.$DOMNode(src)
        if($B.$isEvent(src)) return $B.DOMEvent(src)
        if(src.constructor===Array||$B.$isNodeList(src)){
            var res = []
            for(var i=0, _len_i = src.length; i < _len_i;i++) res.push($B.$JS2Py(src[i]))
            return res
        }
    }
    return $B.JSObject(src)
}


// get item
$B.$getitem = function(obj, item){
    if(Array.isArray(obj) && typeof item=='number' && obj[item]!==undefined){
        return item >=0 ? obj[item] : obj[obj.length+item]
    }
    return _b_.getattr(obj,'__getitem__')(item)
}
$B.$setitem = function(obj,item,value){
    if(Array.isArray(obj) && typeof item=='number'){
        if(item<0){item+=obj.length}
        if(obj[item]===undefined){throw _b_.IndexError("list assignment index out of range")}
        obj[item]=value
        return
    }
    _b_.getattr(obj,'__setitem__')(item,value)
}
// augmented item
$B.augm_item_add = function(obj,item,incr){
    if(Array.isArray(obj) && typeof item=="number" &&
        obj[item]!==undefined){
        obj[item]+=incr
        return
    }
    var ga = _b_.getattr
    try{
        var augm_func = ga(ga(obj,'__getitem__')(item),'__iadd__')
        console.log('has augmfunc')
    }catch(err){
        ga(obj,'__setitem__')(item,
            ga(ga(obj,'__getitem__')(item),'__add__')(incr))
        return
    }
    augm_func(value)
}
var augm_item_src = ''+$B.augm_item_add
var augm_ops = [['-=','sub'],['*=','mul']]
for(var i=0, _len_i = augm_ops.length; i < _len_i;i++){
    var augm_code = augm_item_src.replace(/add/g,augm_ops[i][1])
    augm_code = augm_code.replace(/\+=/g,augm_ops[i][0])
    eval('$B.augm_item_'+augm_ops[i][1]+'='+augm_code)
}

// exceptions
$B.$raise= function(){
    // Used for "raise" without specifying an exception
    // If there is an exception in the stack, use it, else throw a simple Exception
    var es = $B.exception_stack
    if(es.length>0) throw es[es.length-1]
    throw Error('Exception')
}

$B.$syntax_err_line = function(module,pos) {
    // map position to line number
    var pos2line = {}
    var lnum=1
    var src = $B.$py_src[module]
    var line_pos = {1:0}
    for(var i=0, _len_i = src.length; i < _len_i;i++){
        pos2line[i]=lnum
        if(src.charAt(i)=='\n'){lnum+=1;line_pos[lnum]=i}
    }
    var line_num = pos2line[pos]
    var lines = src.split('\n')

    var lib_module = module
    if(lib_module.substr(0,13)==='__main__,exec') lib_module='__main__'

    var line = lines[line_num-1]
    var lpos = pos-line_pos[line_num]
    while(line && line.charAt(0)==' '){
      line=line.substr(1)
      lpos--
    }
    info = '\n    ' //+line+'\n    '
    for(var i=0;i<lpos;i++) info+=' '
    info += '^'
    return info
}

$B.$SyntaxError = function(module,msg,pos) {
    var exc = _b_.SyntaxError(msg)
    exc.info += $B.$syntax_err_line(module,pos)
    throw exc
}

$B.$IndentationError = function(module,msg,pos) {
    var exc = _b_.IndentationError(msg)
    exc.info += $B.$syntax_err_line(module,pos)
    throw exc
}

// function to remove internal exceptions from stack exposed to programs
$B.$pop_exc=function(){$B.exception_stack.pop()}

$B.$test_item = function(expr){
    // used to evaluate expressions with "and" or "or"
    // returns a Javascript boolean (true or false) and stores
    // the evaluation in a global variable $test_result
    $B.$test_result = expr
    return _b_.bool(expr)
}

$B.$test_expr = function(){
    // returns the last evaluated item
    return $B.$test_result
}

$B.$is_member = function(item,_set){
    // used for "item in _set"
    var f,_iter

    // use __contains__ if defined
    try{f = _b_.getattr(_set,"__contains__")}
    catch(err){$B.$pop_exc()}

    if(f) return f(item)

    // use __iter__ if defined
    try{_iter = _b_.iter(_set)}
    catch(err){$B.$pop_exc()}
    if(_iter){
        while(1){
            try{
                var elt = _b_.next(_iter)
                if(_b_.getattr(elt,"__eq__")(item)) return true
            }catch(err){
                if(err.__name__=="StopIteration"){
                    $B.$pop_exc()
                    return false
                }
                throw err
            }
        }
    }

    // use __getitem__ if defined
    try{f = _b_.getattr(_set,"__getitem__")}
    catch(err){
        $B.$pop_exc()
        throw _b_.TypeError("'"+$B.get_class(_set).__name__+"' object is not iterable")
    }
    if(f){
        var i = -1
        while(1){
            i++
            try{
                var elt = f(i)
                if(_b_.getattr(elt,"__eq__")(item)) return true
            }catch(err){
                if(err.__name__=='IndexError') return false
                throw err
            }
        }
    }
}

// default standard output and error
// can be reset by sys.stdout or sys.stderr
var $io = {__class__:$B.$type,__name__:'io'}
$io.__mro__ = [$io,_b_.object.$dict]

$B.stderr = {
    __class__:$io,
    write:function(data){console.log(data)},
    flush:function(){}
}
$B.stderr_buff = '' // buffer for standard output

$B.stdout = {
    __class__:$io,
    write: function(data){console.log(data)},
    flush:function(){}
}

$B.stdin = {
    __class__:$io,
    //fix me
    read: function(size){return ''}
}

function pyobject2jsobject(obj) {
    if(_b_.isinstance(obj,_b_.dict)){
        var temp = {__class__ :'dict'}
        var items = _b_.list(_b_.dict.$dict.items(obj))
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            temp[items[i][0]]=items[i][1]
        }
        return temp
    }

    // giving up, just return original object
    return obj
}

function jsobject2pyobject(obj) {
    if(obj === undefined) return _b_.None
    if(obj.__class__ === 'dict'){
       var d = _b_.dict()
       for(var attr in obj){
          if (attr !== '__class__') d.__setitem__(attr, obj[attr])
       }
       return d
    }

    // giving up, just return original object
    return obj
}

// override IDBObjectStore's add, put, etc functions since we need
// to convert python style objects to a js object type

if (window.IDBObjectStore !== undefined) {
    window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
    window.IDBObjectStore.prototype.put=function(obj, key) {
       var myobj = pyobject2jsobject(obj)
       return window.IDBObjectStore.prototype._put.apply(this, [myobj, key]);
    }
    
    window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
    window.IDBObjectStore.prototype.add=function(obj, key) {
       var myobj= pyobject2jsobject(obj);
       return window.IDBObjectStore.prototype._add.apply(this, [myobj, key]);
    }
}

if (window.IDBRequest !== undefined) {
    window.IDBRequest.prototype.pyresult=function() {
       return jsobject2pyobject(this.result);
    }
}

$B.set_line = function(line_num,module_name){
    $B.line_info = [line_num, module_name]
    return _b_.None
}

// functions to define iterators
$B.$iterator = function(items,klass){
    var res = {
        __class__:klass,
        __iter__:function(){return res},
        __len__:function(){return items.length},
        __next__:function(){
            res.counter++
            if(res.counter<items.length) return items[res.counter]
            throw _b_.StopIteration("StopIteration")
        },
        __repr__:function(){return "<"+klass.__name__+" object>"},
        counter:-1
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

$B.$iterator_class = function(name){
    var res = {
        __class__:$B.$type,
        __name__:name
    }
    res.__str__ = res.toString = res.__repr__
    res.__mro__ = [res,_b_.object.$dict]

    function as_set(s) {
       var _a=[]
       while (1) {
         try {
              _a.push(_b_.next(s))
         } catch (err) {
              console.log(err)
              if (err.__name__ == 'StopIteration') break
         }
       }
          
       return _b_.set(_a)
    }

    res.__sub__=function(self,other){
       if (_b_.isinstance(other, [_b_.tuple, _b_.set, _b_.list])) {
          return _b_.getattr(as_set(self), '__sub__')(other)
       }

       if (_b_.hasattr(other, '__iter__')) {
          return _b_.getattr(as_set(self), '__sub__')(as_set(other))
       }
       console.log("__sub__ not implemented yet for set and " + _b_.type(other))
       _b_.NotImplementedError("__sub__ not implemented yet for set and " + _b_.type(other))
    }

    var _ops=['and', 'or', 'ge', 'le', 'xor'];
    var _f = res.__sub__+''
    for (var i=0; i < _ops.length; i++) {
        var _op='__'+_ops[i]+'__'
        eval('res.'+_op+'='+_f.replace('__sub__', _op))
    }

    res.$factory = {__class__:$B.$factory,$dict:res}
    return res
}

// class dict of functions attribute __code__
$B.$CodeDict = {__class__:$B.$type,__name__:'code'}
$B.$CodeDict.__mro__ = [$B.$CodeDict,_b_.object.$dict]

function $err(op,klass,other){
    var msg = "unsupported operand type(s) for "+op
    msg += ": '"+klass.__name__+"' and '"+$B.get_class(other).__name__+"'"
    throw _b_.TypeError(msg)
}

// Code to add support of "reflected" methods to built-in types
// If a type doesn't support __add__, try method __radd__ of operand

var ropnames = ['add','sub','mul','truediv','floordiv','mod','pow',
                'lshift','rshift','and','xor','or']
var ropsigns = ['+','-','*','/','//','%','**','<<','>>','&','^', '|']

$B.make_rmethods = function(klass){
    for(var j=0, _len_j = ropnames.length; j < _len_j;j++){
        if(klass['__'+ropnames[j]+'__']===undefined){
            //console.log('set '+ropnames[j]+' of '+klass.__name__)
            klass['__'+ropnames[j]+'__']=(function(name,sign){
                return function(self,other){
                    try{return _b_.getattr(other,'__r'+name+'__')(self)}
                    catch(err){$err(sign,klass,other)}
                }
            })(ropnames[j],ropsigns[j])
        }
    }
}

// Set __name__ attribute of klass methods
$B.set_func_names = function(klass){
    var name = klass.__name__
    for(var attr in klass){
        if(typeof klass[attr] == 'function'){
            klass[attr].__name__ = name+'.'+attr
        }
    }
}

// UUID is a function to produce a unique id.
// the variable $B.py_UUID is defined in py2js.js (in the brython function) 
$B.UUID=function() {return $B.$py_UUID++}

$B.InjectBuiltins=function() {
   var _str=["var _b_=$B.builtins"]
   for(var $b in $B.builtins) _str.push('var ' + $b +'=_b_["'+$b+'"]')
   return _str.join(';')
}

})(__BRYTHON__)

// IE doesn't implement indexOf on Arrays
if(!Array.indexOf){  
  Array.prototype.indexOf = function(obj){  
    for(var i=0, _len_i = this.length; i < _len_i;i++) if(this[i]==obj) return i
    return -1
  }
}


// http://stackoverflow.com/questions/202605/repeat-string-javascript
// allows for efficient indention..
if (!String.prototype.repeat) {
  String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 1) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    }
    return result + pattern;
  };
}
