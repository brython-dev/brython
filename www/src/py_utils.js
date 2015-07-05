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

    var has_kw_args = false, nb_pos = $args.length
    if(nb_pos>0 && $args[nb_pos-1] && $args[nb_pos-1].$nat=='kw'){
        has_kw_args=true
        nb_pos--
        var kw_args=$args[nb_pos].kw
    }

    var $ns = {},$arg

    var $robj = {}
    for(var i=0;i<$required.length;i++){$robj[$required[i]]=null}

    var $dobj = {}
    for(var i=0;i<$defaults.length;i++){$dobj[$defaults[i]]=null}

    if($other_args != null){$ns[$other_args]=[]}
    if($other_kw != null){var $dict_keys=[], key_pos=0, $dict_values=[], value_pos=0}
    
    // create new list of arguments in case some are packed
    var upargs = [], pos=0
    for(var i=0, _len_i = nb_pos; i < _len_i;i++){
        $arg = $args[i]
        if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
        else if($arg===null){upargs[pos++]=null}
        else {
           switch($arg.$nat) {
             case 'ptuple':
               var _arg=$arg.arg
               for(var j=0, _len_j = _arg.length; j < _len_j;j++) upargs[pos++]=_arg[j]
               break
             default:
               upargs[pos++]=$arg
           }//switch
        }//else
    }
    var nbreqset = 0 // number of required arguments set
    for(var $i=0, _len_$i = upargs.length; $i < _len_$i;$i++){
        var $arg=upargs[$i]
        var $PyVar=$B.$JS2Py($arg)
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

    if(has_kw_args){ // keyword argument
        for(var key in kw_args){
            $PyVar = kw_args[key]
            if($ns[key]!==undefined){
                throw _b_.TypeError($fname+"() got multiple values for argument '"+key+"'")
            }else if($robj[key]===null){
                $ns[key]=$PyVar
                nbreqset++
            }else if($other_args!==null && $after_star!==undefined &&
                $after_star.indexOf(key)>-1){
                    var ix = $after_star.indexOf(key)
                    $ns[$after_star[ix]]=$PyVar
            } else if($dobj[key]===null){
                $ns[key]=$PyVar
                var pos_def = $defaults.indexOf(key)
                $defaults.splice(pos_def,1)
                delete $dobj[key]
            } else if($other_kw!=null){
                $dict_keys.push(key)
                $dict_values.push($PyVar)
            } else {
                throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+key+"'")
            }
        }
    }
    
    if(nbreqset!==$required.length){
        // throw error if not all required positional arguments have been set
        var missing = [], pos=0
        for(var i=0, _len_i = $required.length; i < _len_i;i++){
            if($ns[$required[i]]===undefined) missing[pos++]=$required[i]
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
        var si=_b_.dict.$dict.__setitem__
        var i=$dict_keys.length
        while(i--) {
        //for(var i=0;i<$dict_keys.length;i++){
           si($ns[$other_kw], $dict_keys[i],$dict_values[i])
        }
    }
    if($other_args!=null){$ns[$other_args]=_b_.tuple($ns[$other_args])}
    return $ns
}

$B.$MakeArgs1 = function($fname,argcount,slots,var_names,$args,$dobj,
    extra_pos_args,extra_kw_args){
    // builds a namespace from the arguments provided in $args
    // in a function defined like foo(x,y,z=1,*args,u,v,**kw) the parameters are
    // $fname = "f"
    // argcount = 3 (for x, y , z)
    // slots = {x:null, y:null, z:null}
    // var_names = ['x', 'y', 'z']
    // $dobj = {'z':1}
    // extra_pos_args = 'args'
    // extra_kw_args = 'kw'
        
    var has_kw_args = false, 
        nb_pos = $args.length,
        $ns
    
    // If the function call had keywords arguments, they are in the last
    // element of $args
    if(nb_pos>0 && $args[nb_pos-1].$nat=='kw'){
        has_kw_args=true
        nb_pos--
        var kw_args=$args[nb_pos].kw
    }

    if(extra_pos_args){slots[extra_pos_args]=[]}
    if(extra_kw_args){slots[extra_kw_args]=_b_.dict()}

    if(nb_pos>argcount){
        // More positional arguments than formal parameters
        if(extra_pos_args===null){
            // No parameter to store extra positional arguments :
            // thow an exception
            msg = $fname+"() takes "+argcount+' positional argument'
            msg += argcount> 1 ? '' : 's'
            msg += ' but more were given'
            throw _b_.TypeError(msg)
        }else{
            // Store extra positional arguments
            slots[extra_pos_args] = Array.prototype.slice.call($args,
                argcount,nb_pos)
            // For the next step of the algorithm, only use the arguments
            // before these extra arguments
            nb_pos = argcount
        }
    }

    // Fill slots with positional (non-extra) arguments
    for(var i=0;i<nb_pos;i++){slots[var_names[i]]=$args[i]}

    // Then fill slots with keyword arguments, if any
    if(has_kw_args){
        for(var key in kw_args){
            if(slots[key]===undefined){
                // The name of the keyword argument doesn't match any of the
                // formal parameters
                if(extra_kw_args){
                    // If there is a place to store extra keyword arguments
                    slots[extra_kw_args].$string_dict[key]=kw_args[key]
                }else{
                    throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+key+"'")
                }
            }else if(slots[key]!==null){
                // The slot is already filled
                throw _b_.TypeError($fname+"() got multiple values for argument '"+key+"'")            
            }else{    
                // Fill the slot with the key/value pair
                slots[key] = kw_args[key]
            }
        }
    }
    
    // If there are unfilled slots, see if there are default values
    var missing = [], attr
    for(var i=nb_pos,_len=var_names.length;i<_len;i++){
        attr = var_names[i]
        if(slots[attr]===null){
            if($dobj[attr]!==undefined){slots[attr]=$dobj[attr]}
            else{missing.push("'"+attr+"'")}
        }
    }
    
    if(missing.length>0){
        var msg = $fname+" missing "+missing.length+" positional arguments: "
        msg += missing.join(' and ')
        throw _b_.TypeError(msg)

        if(missing.length==1){
            throw _b_.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
        }else if(missing.length>1){
        }
    
    }
    // extra positional arguments are a tuple
    if(extra_pos_args){slots[extra_pos_args].__class__ = _b_.tuple.$dict}

    return slots
    
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
            if (obj % 1 === 0) { // this is an int
               obj.__class__=_b_.int.$dict
               return _b_.int.$dict
            }
            // this is a float
            //obj= _b_.float(obj)
            obj.__class__=_b_.float.$dict
            return _b_.float.$dict
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
            else if(obj.constructor===Number) return _b_.float.$dict
            break
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

$B.$list_comp = function(env){
    // Called for list comprehensions
    // "env" is a list of [local_name, local_ns] lists for all the enclosing
    // namespaces
    var $ix = $B.UUID()
    var $py = "x"+$ix+"=[]\n", indent = 0
    for(var $i=2, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py += ' '.repeat(indent)
        $py += arguments[$i]+':\n'
        indent += 4
    }
    $py += ' '.repeat(indent)
    $py += 'x'+$ix+'.append('+arguments[1].join('\n')+')\n'
    
    // Create the variables for enclosing namespaces, they may be referenced
    // in the comprehension
    for(var i=0;i<env.length;i++){
        var sc_id = '$locals_'+env[i][0].replace(/\./,'_')
        eval('var '+sc_id+'=env[i][1]')
    }
    var local_name = env[0][0]
    var module_env = env[env.length-1]
    var module_name = module_env[0]

    var listcomp_name = 'lc'+$ix

    var $root = $B.py2js($py,module_name,listcomp_name,local_name,
        $B.line_info)
    
    $root.caller = $B.line_info

    var $js = $root.to_js()
    try{
        eval($js)
        var res = eval('$locals_'+listcomp_name+'["x"+$ix]')
    }
    catch(err){throw $B.exception(err)}
    finally{
        clear(listcomp_name)
    }

    return res
}

$B.$list_comp1 = function(items){
    // Called for list comprehensions
    //console.log('items',items)
    var $ix = $B.UUID()
    var $py = "x"+$ix+"=[]\n", indent = 0
    for(var $i=1, _len_$i = items.length; $i < _len_$i;$i++){
        $py += ' '.repeat(indent)
        $py += items[$i]+':\n'
        indent += 4
    }
    $py += ' '.repeat(indent)
    $py += 'x'+$ix+'.append('+items[0]+')\n'
        
    return [$py,$ix]
}


$B.$dict_comp = function(env){
    // Called for dict comprehensions
    // "env" is a list of [local_name, local_ns] lists for all the enclosing
    // namespaces

    var $ix = $B.UUID()
    var $res = 'res'+$ix
    var $py = $res+"={}\n"
    var indent=0
    for(var $i=2, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py+=' '.repeat(indent)
        $py += arguments[$i]+':\n'
        indent += 4
    }
    $py+=' '.repeat(indent)
    $py += $res+'.update({'+arguments[1].join('\n')+'})'

    // Create the variables for enclosing namespaces, they may be referenced
    // in the comprehension
    for(var i=0;i<env.length;i++){
        var sc_id = '$locals_'+env[i][0].replace(/\./,'_')
        eval('var '+sc_id+'=env[i][1]')
    }
    var local_name = env[0][0]
    var module_env = env[env.length-1]
    var module_name = module_env[0]

    var dictcomp_name = 'dc'+$ix
    
    var $root = $B.py2js($py,module_name,dictcomp_name,local_name,
        $B.line_info)
    $root.caller = $B.line_info

    var $js = $root.to_js()
    eval($js)

    var res = eval('$locals_'+dictcomp_name+'["'+$res+'"]')

    return res
}

$B.$gen_expr = function(env){
    // Called for generator expressions
    // "env" is a list of [local_name, local_ns] lists for all the enclosing
    // namespaces

    var $ix = $B.UUID()
    var $res = 'res'+$ix
    var $py = $res+"=[]\n"
    var indent=0
    for(var $i=2, _len_$i = arguments.length; $i < _len_$i;$i++){
        $py+=' '.repeat(indent)
        $py += arguments[$i].join(' ')+':\n'
        indent += 4
    }
    $py+=' '.repeat(indent)
    $py += $res+'.append('+arguments[1].join('\n')+')'
    
    // Create the variables for enclosing namespaces, they may be referenced
    // in the expression
    for(var i=0;i<env.length;i++){
        var sc_id = '$locals_'+env[i][0].replace(/\./,'_')
        eval('var '+sc_id+'=env[i][1]')
    }
    var local_name = env[0][0]
    var module_env = env[env.length-1]
    var module_name = module_env[0]
    
    var genexpr_name = 'ge'+$ix

    var $root = $B.py2js($py,module_name,genexpr_name,local_name,
        $B.line_info)
    var $js = $root.to_js()

    eval($js)
    
    var $res1 = eval('$locals_ge'+$ix)["res"+$ix]

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
    $GenExprDict.$factory = {__class__:$B.$factory,$dict:$GenExprDict}
    var $res2 = {value:$res1,__class__:$GenExprDict,$counter:-1}
    $res2.toString = function(){return 'ge object'}
    return $res2
}

$B.$lambda = function(env,args,body){
    // Called for anonymous functions (lambda)
    // "env" is a list of [local_name, local_ns] lists for all the enclosing
    // namespaces
    // "args" are the arguments, "body" is the function body

    var rand = $B.UUID()
    var $res = 'lambda_'+$B.lambda_magic+'_'+rand
    var $py = 'def '+$res+'('+args+'):\n'
    $py += '    return '+body
    
    // Create the variables for enclosing namespaces, they may be referenced
    // in the function
    for(var i=0;i<env.length;i++){
        var sc_id = '$locals_'+env[i][0].replace(/\./g,'_')
        eval('var '+sc_id+'=env[i][1]')
    }
    var local_name = env[0][0]
    var module_env = env[env.length-1]
    var module_name = module_env[0]

    var lambda_name = 'lambda'+rand
    
    var $js = $B.py2js($py,module_name,lambda_name,local_name).to_js()
    
    eval($js)
    
    var $res = eval('$locals_'+lambda_name+'["'+$res+'"]')

    $res.__module__ = module_name
    $res.__name__ = '<lambda>'
    return $res
}

// Function used to resolve names not defined in Python source
// but introduced by "from A import *" or by exec

$B.$search = function(name, global_ns){
    var res = global_ns[name]
    //if(res===undefined){console.log('no '+name+' in global ns '+$B.keys(global_ns))}
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
        if($B.$isNode(src)) return $B.DOMNode(src)
        if($B.$isEvent(src)) return $B.DOMEvent(src)
        if(src.constructor===Array||$B.$isNodeList(src)){
            var res = [], pos=0
            for(var i=0,_len_i=src.length;i<_len_i;i++) res[pos++]=$B.$JS2Py(src[i])
            return res
        }
    }
    return $B.JSObject(src)
}

// get item
function index_error(obj){
    var type = typeof obj=='string' ? 'string' : 'list'
    throw _b_.IndexError(type+" index out of range")
}

$B.$getitem = function(obj, item){
    if(typeof item=='number'){
        if(Array.isArray(obj) || typeof obj=='string'){
            item = item >=0 ? item : obj.length+item
            if(obj[item]!==undefined){return $B.$JS2Py(obj[item])}
            else{index_error(obj)}
        }
    }
    try{item=$B.$GetInt(item)}catch(err){}
    if((Array.isArray(obj) || typeof obj=='string')
        && typeof item=='number'){
        item = item >=0 ? item : obj.length+item
        if(obj[item]!==undefined){return obj[item]}
        else{index_error(obj)}
    }
    return _b_.getattr(obj,'__getitem__')(item)
}

$B.$setitem = function(obj,item,value){
    if(Array.isArray(obj) && typeof item=='number'){
        if(item<0){item+=obj.length}
        if(obj[item]===undefined){throw _b_.IndexError("list assignment index out of range")}
        obj[item]=value
        return
    }else if(obj.__class__===_b_.dict.$dict){
        obj.__class__.__setitem__(obj, item, value)
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
    var es = $B.current_exception
    if(es!==undefined) throw es
    throw _b_.RuntimeError('No active exception to reraise')
}

$B.$syntax_err_line = function(exc,module,pos) {
    // map position to line number
    var pos2line = {}
    var lnum=1
    var src = $B.$py_src[module]
    var line_pos = {1:0}
    for(var i=0, _len_i = src.length; i < _len_i;i++){
        pos2line[i]=lnum
        if(src.charAt(i)=='\n'){line_pos[++lnum]=i}
    }
    var line_num = pos2line[pos]
    exc.$line_info = line_num+','+module

    var lines = src.split('\n')
    var line = lines[line_num-1]
    var lpos = pos-line_pos[line_num]
    var len=line.length
    line=line.replace(/^\s*/,'')
    lpos-=len-line.length
    //while(line && line.charAt(0)==' '){
    //  line=line.substr(1)
    //  lpos--
    //}
    exc.args = _b_.tuple([$B.$getitem(exc.args,0),_b_.tuple([module, line_num, lpos, line])])
}

$B.$SyntaxError = function(module,msg,pos) {
    var exc = _b_.SyntaxError(msg)
    $B.$syntax_err_line(exc,module,pos)
    throw exc
}

$B.$IndentationError = function(module,msg,pos) {
    var exc = _b_.IndentationError(msg)
    $B.$syntax_err_line(exc,module,pos)
    throw exc
}

// function used if a function call has an argument **kw
$B.extend = function(fname, arg, mapping){
    var it = _b_.iter(mapping), getter = _b_.getattr(mapping,'__getitem__')
    while (true){
        try{
            var key = _b_.next(it)
            if(typeof key!=='string'){
                throw _b_.TypeError(fname+"() keywords must be strings")
            }
            if(arg[key]!==undefined){
                throw _b_.TypeError(
                    fname+"() got multiple values for argument '"+key+"'")
            }
            arg[key] = getter(key)
        }catch(err){
            if(_b_.isinstance(err,[_b_.StopIteration])){break}
            throw err
        }
    }
    return arg
}

// function used if a function call has an argument *args
$B.extend_list = function(){
    // The last argument is the iterable to unpack
    var res = Array.prototype.slice.call(arguments,0,arguments.length-1),
        last = $B.last(arguments)
    var it = _b_.iter(last)
    while (true){
        try{
            res.push(_b_.next(it))
        }catch(err){
            if(_b_.isinstance(err,[_b_.StopIteration])){break}
            throw err
        }
    }
    return res
}

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
    catch(err){}

    if(f) return f(item)

    // use __iter__ if defined
    try{_iter = _b_.iter(_set)}
    catch(err){}
    if(_iter){
        while(1){
            try{
                var elt = _b_.next(_iter)
                if(_b_.getattr(elt,"__eq__")(item)) return true
            }catch(err){
                if(err.__name__=="StopIteration") return false
                throw err
            }
        }
    }

    // use __getitem__ if defined
    try{f = _b_.getattr(_set,"__getitem__")}
    catch(err){
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

$B.jsobject2pyobject=function(obj){
    switch(obj) {
      case null:
        return _b_.None
      case true:
        return _b_.True
      case false:
        return _b_.False
    }

    if(_b_.isinstance(obj,_b_.list)){
        var res = [], pos=0
        for(var i=0, _len_i = obj.length; i < _len_i;i++){
            res[pos++]=$B.jsobject2pyobject(obj[i])
        }
        return res
    }

    if(obj.__class__!==undefined){
        if(obj.__class__===_b_.list){
          for(var i=0, _len_i = obj.length; i < _len_i;i++){
              obj[i] = $B.jsobject2pyobject(obj[i])
          }
          return obj
        }
        return obj
    }

    if(obj._type_ === 'iter') { // this is an iterator
       return _b_.iter(obj.data)
    }

    if(typeof obj==='object' && obj.__class__===undefined){
        // transform JS object into a Python dict
        var res = _b_.dict()
        var si=_b_.dict.$dict.__setitem__
        for(var attr in obj){
           si(res, attr,$B.jsobject2pyobject(obj[attr]))
        }
        return res
    }

    return $B.JSObject(obj)
}

$B.pyobject2jsobject=function (obj){
    // obj is a Python object
    switch(obj) {
      case _b_.None:
        return null
      case _b_.True:
        return true
      case _b_.False:
        return false
    }

    if(_b_.isinstance(obj,[_b_.int,_b_.float, _b_.str])) return obj
    if(_b_.isinstance(obj,[_b_.list,_b_.tuple])){
        var res = [], pos=0
        for(var i=0, _len_i = obj.length; i < _len_i;i++){
           res[pos++]=$B.pyobject2jsobject(obj[i])
        }
        return res
    }
    if(_b_.isinstance(obj,_b_.dict)){
        var res = {}
        var items = _b_.list(_b_.dict.$dict.items(obj))
        for(var i=0, _len_i = items.length; i < _len_i;i++){
            res[$B.pyobject2jsobject(items[i][0])]=$B.pyobject2jsobject(items[i][1])
        }
        return res
    }

    if (_b_.hasattr(obj, '__iter__')) {
       // this is an iterator..
       var _a=[], pos=0
       while(1) {
          try {
           _a[pos++]=$B.pyobject2jsobject(_b_.next(obj))
          } catch(err) {
            if (err.__name__ !== "StopIteration") throw err
            break
          }
       }
       return {'_type_': 'iter', data: _a}
    }

    if (_b_.hasattr(obj, '__getstate__')) {
       return _b_.getattr(obj, '__getstate__')()
    }
    if (_b_.hasattr(obj, '__dict__')) {
       return $B.pyobject2jsobject(_b_.getattr(obj, '__dict__'))
    }
    throw _b_.TypeError(str(obj)+' is not JSON serializable')
}


// override IDBObjectStore's add, put, etc functions since we need
// to convert python style objects to a js object type

if (window.IDBObjectStore !== undefined) {
    window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
    window.IDBObjectStore.prototype.put=function(obj, key) {
       var myobj = $B.pyobject2jsobject(obj)
       return window.IDBObjectStore.prototype._put.apply(this, [myobj, key]);
    }
    
    window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
    window.IDBObjectStore.prototype.add=function(obj, key) {
       var myobj= $B.pyobject2jsobject(obj);
       return window.IDBObjectStore.prototype._add.apply(this, [myobj, key]);
    }
}

if (window.IDBRequest !== undefined) {
    window.IDBRequest.prototype.pyresult=function() {
       return $B.jsobject2pyobject(this.result);
    }
}

$B.set_line = function(line_num,module_name){
    $B.line_info = line_num+','+module_name
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
        __name__:name,
    }

    res.__mro__ = [res,_b_.object.$dict]

    function as_array(s) {
       var _a=[], pos=0
       var _it = _b_.iter(s)
       while (1) {
         try {
              _a[pos++]=_b_.next(_it)
         } catch (err) {
              if (err.__name__ == 'StopIteration'){break}
         }
       }
       return _a
    }

    function as_list(s) {return _b_.list(as_array(s))}
    function as_set(s) {return _b_.set(as_array(s))}

    res.__eq__=function(self,other){
       if (_b_.isinstance(other, [_b_.tuple, _b_.set, _b_.list])) {
          return _b_.getattr(as_list(self), '__eq__')(other)
       }

       if (_b_.hasattr(other, '__iter__')) {
          return _b_.getattr(as_list(self), '__eq__')(as_list(other))
       }

       _b_.NotImplementedError("__eq__ not implemented yet for list and " + _b_.type(other))
    }

    var _ops=['eq', 'ne']
    var _f = res.__eq__+''

    for (var i=0; i < _ops.length; i++) {
        var _op='__'+_ops[i]+'__'
        eval('res.'+_op+'='+_f.replace(new RegExp('__eq__', 'g'), _op))
    }

    res.__or__=function(self,other){
       if (_b_.isinstance(other, [_b_.tuple, _b_.set, _b_.list])) {
          return _b_.getattr(as_set(self), '__or__')(other)
       }

       if (_b_.hasattr(other, '__iter__')) {
          return _b_.getattr(as_set(self), '__or__')(as_set(other))
       }

       _b_.NotImplementedError("__or__ not implemented yet for set and " + _b_.type(other))
    }

    var _ops=['sub', 'and', 'xor', 'gt', 'ge', 'lt', 'le']
    var _f = res.__or__+''

    for (var i=0; i < _ops.length; i++) {
        var _op='__'+_ops[i]+'__'
        eval('res.'+_op+'='+_f.replace(new RegExp('__or__', 'g'), _op))
    }

    res.$factory = {__class__:$B.$factory,$dict:res}
    return res
}

// class dict of functions attribute __code__
$B.$CodeDict = {__class__:$B.$type,__name__:'code'}
$B.$CodeDict.__mro__ = [$B.$CodeDict,_b_.object.$dict]

function _code(){}
_code.__class__ = $B.$factory
_code.$dict = $B.$CodeDict
$B.$CodeDict.$factory = _code

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
   var _str=["var _b_=$B.builtins"], pos=1
   for(var $b in $B.builtins) _str[pos++]='var ' + $b +'=_b_["'+$b+'"]'
   return _str.join(';')
}

$B.$GetInt=function(value) {
  // convert value to an integer
  if(typeof value=="number"){return value}
  else if(typeof value==="boolean"){return value ? 1 : 0}
  else if (_b_.isinstance(value, [_b_.int, _b_.float])) {return value.valueOf()}
  try {var v=_b_.getattr(value, '__int__')(); return v}catch(e){}
  try {var v=_b_.getattr(value, '__index__')(); return v}catch(e){}
  throw _b_.TypeError("'"+$B.get_class(value).__name__+
      "' object cannot be interpreted as an integer")
}

$B.enter_frame = function(frame){
    $B.frames_stack[$B.frames_stack.length]=frame
}

$B.leave_frame = function(){
    // We must leave at least the frame for the main program
    if($B.frames_stack.length>1){
        $B.frames_stack.pop()
        //delete $B.modules[frame[0]],$B.$py_src[frame[0]]
    }
}

var min_int=Math.pow(-2, 53), max_int=Math.pow(2,53)-1
$B.add = function(x,y){
    var z = x+y
    if(x>min_int && x<max_int && y>min_int && y<max_int
        && z>min_int && z<max_int){return z}
    else if((typeof x=='number' || x.__class__===$B.LongInt.$dict)
        && (typeof y=='number' || y.__class__===$B.LongInt.$dict)){
        var res = $B.LongInt.$dict.__add__($B.LongInt(x), $B.LongInt(y))
        return res
    }else{return z}
}
$B.div = function(x,y){
    var z = x/y
    if(x>min_int && x<max_int && y>min_int && y<max_int
        && z>min_int && z<max_int){return z}
    else{return z}
}
$B.mul = function(x,y){
    var z = x*y
    if(x>min_int && x<max_int && y>min_int && y<max_int
        && z>min_int && z<max_int){return z}
    else if((typeof x=='number' || x.__class__===$B.LongInt.$dict)
        && (typeof y=='number' || y.__class__===$B.LongInt.$dict)){
        return $B.LongInt.$dict.__mul__($B.LongInt(x), $B.LongInt(y))
    }else{return z}
}
$B.sub = function(x,y){
    var z = x-y
    if(x>min_int && x<max_int && y>min_int && y<max_int
        && z>min_int && z<max_int){return z}
    else if((typeof x=='number' || x.__class__===$B.LongInt.$dict)
        && (typeof y=='number' || y.__class__===$B.LongInt.$dict)){
        return $B.LongInt.$dict.__sub__($B.LongInt(x), $B.LongInt(y))
    }else{return z}
}
// gretaer or equal
$B.ge = function(x,y){
    if(typeof x=='number' && typeof y== 'number'){return x>=y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x=='number' && typeof y!= 'number'){return !y.pos}
    else if(typeof x !='number' && typeof y=='number'){return x.pos===true}
    else{return $B.LongInt.$dict.__ge__(x, y)}
}
$B.gt = function(x,y){
    if(typeof x=='number' && typeof y== 'number'){return x>y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x=='number' && typeof y!= 'number'){return !y.pos}
    else if(typeof x !='number' && typeof y=='number'){return x.pos===true}
    else{return $B.LongInt.$dict.__gt__(x, y)}
}


    window.is_none = function (o) {
        return o === undefined || o == _b_.None;
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
    var result = '', pattern = this.valueOf()
    while (count > 1) {
        if (count & 1) result += pattern
        count >>= 1, pattern += pattern
    }
    return result + pattern;
  }
}
