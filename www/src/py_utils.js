;(function($B){

var _b_ = $B.builtins,
    _window = self,
    isWebWorker = ('undefined' !== typeof WorkerGlobalScope) &&
            ("function" === typeof importScripts) &&
            (navigator instanceof WorkerNavigator)

$B.args = function($fname, argcount, slots, var_names, $args, $dobj,
    extra_pos_args, extra_kw_args){
    // builds a namespace from the arguments provided in $args
    // in a function defined like foo(x,y,z=1,*args,u,v,**kw) the parameters are
    // $fname = "f"
    // argcount = 3 (for x, y , z)
    // slots = {x:null, y:null, z:null, u:null, v:null}
    // var_names = ['x', 'y', 'z', 'u', 'v']
    // $dobj = {'z':1}
    // extra_pos_args = 'args'
    // extra_kw_args = 'kw'

    var has_kw_args = false,
        nb_pos = $args.length

    // If the function call had keywords arguments, they are in the last
    // element of $args
    if(nb_pos > 0 && $args[nb_pos - 1] && $args[nb_pos - 1].$nat){
        nb_pos--
        if(Object.keys($args[nb_pos].kw).length > 0){
            has_kw_args = true
            var kw_args = $args[nb_pos].kw
        }
    }

    if(extra_pos_args){
        slots[extra_pos_args] = []
        slots[extra_pos_args].__class__ = _b_.tuple
    }
    if(extra_kw_args){
        // Build a dict object faster than with _b_.dict()
        slots[extra_kw_args] = {
            __class__: _b_.dict,
            $numeric_dict : {},
            $object_dict : {},
            $string_dict : {},
            $str_hash: {},
            length: 0
        }
    }

    if(nb_pos > argcount){
        // More positional arguments than formal parameters
        if(extra_pos_args === null){
            // No parameter to store extra positional arguments :
            // thow an exception
            msg = $fname + "() takes " + argcount + " positional argument" +
                (argcount> 1 ? "" : "s") + " but more were given"
            throw _b_.TypeError.$factory(msg)
        }else{
            // Store extra positional arguments
            for(var i = argcount; i < nb_pos; i++){
                slots[extra_pos_args].push($args[i])
            }
            // For the next step of the algorithm, only use the arguments
            // before these extra arguments
            nb_pos = argcount
        }
    }

    // Fill slots with positional (non-extra) arguments
    for(var i = 0; i < nb_pos; i++){slots[var_names[i]] = $args[i]}

    // Then fill slots with keyword arguments, if any
    if(has_kw_args){
        for(var key in kw_args){
            var value = kw_args[key]
            if(slots[key] === undefined){
                // The name of the keyword argument doesn't match any of the
                // formal parameters
                if(extra_kw_args){
                    // If there is a place to store extra keyword arguments
                    if(key.substr(0, 2) == "$$"){key = key.substr(2)}
                    slots[extra_kw_args].$string_dict[key] = value
                }else{
                    throw _b_.TypeError.$factory($fname +
                        "() got an unexpected keyword argument '" + key + "'")
                }
            }else if(slots[key] !== null){
                // The slot is already filled
                throw _b_.TypeError.$factory($fname +
                    "() got multiple values for argument '" + key + "'")
            }else{
                // Fill the slot with the key/value pair
                slots[key] = value
            }
        }
    }

    // If there are unfilled slots, see if there are default values
    var missing = []
    for(var attr in slots){
        if(slots[attr] === null){
            if($dobj[attr] !== undefined){slots[attr] = $dobj[attr]}
            else{missing.push("'" + attr + "'")}
        }
    }

    if(missing.length > 0){

        if(missing.length == 1){
            throw _b_.TypeError.$factory($fname +
                " missing 1 positional argument: " + missing[0])
        }else{
            var msg = $fname + " missing " + missing.length +
                " positional arguments: "
            msg += missing.join(" and ")
            throw _b_.TypeError.$factory(msg)
        }

    }
    return slots

}

$B.wrong_nb_args = function(name, received, expected, positional){
    if(received < expected){
        var missing = expected - received
        throw _b_.TypeError.$factory(name + "() missing " + missing +
            " positional argument" + (missing > 1 ? "s" : "") + ": " +
            positional.slice(received))
    }else{
        throw _b_.TypeError.$factory(name + "() takes " + expected +
            " positional argument" + (expected > 1 ? "s" : "") +
            " but more were given")
    }
}


$B.get_class = function(obj){
    // generally we get the attribute __class__ of an object by obj.__class__
    // but Javascript builtins used by Brython (functions, numbers, strings...)
    // don't have this attribute so we must return it

    if(obj === null){return $B.$NoneDict}
    var klass = obj.__class__
    if(klass === undefined){
        switch(typeof obj) {
            case "number":
                if(obj % 1 === 0){ // this is an int
                   obj.__class__ = _b_.int
                   return _b_.int
                }
                // this is a float
                obj.__class__ = _b_.float
                return _b_.float
            case "string":
                obj.__class__ = _b_.str
                return _b_.str
            case "boolean":
                obj.__class__ = _b_.bool
                return _b_.bool
            case "function":
                obj.__class__ = $B.Function
                return $B.Function
            case "object":
                if(Array.isArray(obj)){
                    if(Object.getPrototypeOf(obj) === Array.prototype){
                      obj.__class__ = _b_.list
                      return _b_.list
                    }
                }else if(obj.constructor === Number){return _b_.float}
                break
        }
    }
    return klass
}

$B.$mkdict = function(glob, loc){
    var res = {}
    for(var arg in glob){res[arg] = glob[arg]}
    for(var arg in loc){res[arg] = loc[arg]}
    return res
}

$B.$list_comp = function(items){
    // Called for list comprehensions
    // items[0] is the Python code for the comprehension expression
    // items[1:] is the loops and conditions in the comprehension
    // For instance in [ x*2 for x in A if x>2 ],
    // items is ["x*2", "for x in A", "if x>2"]
    var ix = $B.UUID(),
        py = "x" + ix + "=[]\n",
        indent = 0
    for(var i = 1, len = items.length; i < len; i++){
        var item = items[i].replace(/\s+$/, "").replace(/\n/g, "")
        py += " ".repeat(indent) + item + ":\n"
        indent += 4
    }
    py += " ".repeat(indent)
    py += "x" + ix + ".append(" + items[0] + ")\n"

    return [py, ix]
}

$B.$dict_comp = function(module_name, parent_scope, items, line_num){
    // Called for dict comprehensions
    // items[0] is the Python code for the comprehension expression
    // items[1:] is the loops and conditions in the comprehension
    // For instance in { x:x*2 for x in A if x>2 },
    // items is ["x:x*2", "for x in A", "if x>2"]

    var ix = $B.UUID(),
        res = "res" + ix,
        py = res + "={}\n", // Python code
        indent = 0
    for(var i = 1, len = items.length; i < len; i++){
        var item = items[i].replace(/\s+$/,"").replace(/\n/g, "")
        py += "    ".repeat(indent) + item + ":\n"
        indent++
    }
    py += "    ".repeat(indent) + res + ".update({" + items[0] + "})"

    var dictcomp_name = "dc" + ix,
        root = $B.py2js({src:py, is_comp:true}, module_name, dictcomp_name,
            parent_scope, line_num),
        js = root.to_js()
    js += '\nreturn $locals["' + res + '"]\n'

    js = "(function(){" + js + "})()"
    $B.clear_ns(dictcomp_name)
    delete $B.$py_src[dictcomp_name]

    return js
}

$B.$gen_expr = function(module_name, parent_scope, items, line_num){
    // Called for generator expressions
    var $ix = $B.UUID(),
        py = "def __ge" + $ix + "():\n", // use a special name (cf $global_search)
        indent = 1
    for(var i = 1, len = items.length; i < len; i++){
        var item = items[i].replace(/\s+$/, "").replace(/\n/g, "")
        py += " ".repeat(indent) + item + ":\n"
        indent += 4
    }
    py += " ".repeat(indent)
    py += "yield (" + items[0] + ")"

    var genexpr_name = "__ge" + $ix,
        root = $B.py2js({src: py, is_comp: true}, genexpr_name, genexpr_name,
            parent_scope, line_num),
        js = root.to_js(),
        lines = js.split("\n")

    js = lines.join("\n")
    js += "\nvar $res = $locals_" + genexpr_name + '["' + genexpr_name +
        '"]();\n$res.is_gen_expr = true;\nreturn $res\n'
    js = "(function(){" + js + "})()\n"

    //$B.clear_ns(genexpr_name)
    delete $B.$py_src[genexpr_name]

    return js
}

$B.clear_ns = function(name){
    // Remove name from __BRYTHON__.modules, and all the keys that start with name
    if(name.startsWith("__ge")){console.log("clear ns", name)}
    var len = name.length
    for(var key in $B.$py_module_path){
        if(key.substr(0, len) == name){
            $B.$py_module_path[key] = null
            delete $B.$py_module_path[key]
        }
    }
    $B.$py_src[name] = null
    delete $B.$py_src[name]

    var alt_name = name.replace(/\./g, "_")
    if(alt_name != name){$B.clear_ns(alt_name)}
}

$B.from_alias = function(attr){
    if(attr.substr(0, 2) == "$$" && $B.aliased_names[attr.substr(2)]){
        return attr.substr(2)
    }
    return attr
}

// Function used to resolve names not defined in Python source
// but introduced by "from A import *" or by exec

$B.$search = function(name, global_ns){
    // search in local and global namespaces
    var frame = $B.last($B.frames_stack)
    if(frame[1][name] !== undefined){return frame[1][name]}
    else if(frame[3][name] !== undefined){return frame[3][name]}
    else if(_b_[name] !== undefined){return _b_[name]}
    else{
        if(frame[0] == frame[2] || frame[1].$type == "class"){
            throw _b_.NameError.$factory(
                "name '" + name + "' is not defined")}
        else{
            throw _b_.UnboundLocalError.$factory("local variable '" +
                name + "' referenced before assignment")}
    }
}

$B.$global_search = function(name, search_ids){
    // search in all namespaces above current stack frame
    var ns = {}

    for(var i = 0; i< $B.frames_stack.length; i++){
        var frame = $B.frames_stack[i]
        if(search_ids.indexOf(frame[0]) > -1 &&
                frame[1][name] !== undefined){
            return frame[1][name]
        }
        if(search_ids.indexOf(frame[2]) > -1 &&
                frame[3][name] !== undefined){
            return frame[3][name]
        }
    }
    for(var i = 0; i < search_ids.length; i++){
        var search_id = search_ids[i]
        if($B.imported[search_id] && $B.imported[search_id][name]){
            return $B.imported[search_id][name]
        }
    }
    throw _b_.NameError.$factory("name '" + $B.from_alias(name) +
        "' is not defined")
}

$B.$local_search = function(name){
    // search in local namespace
    var frame = $B.last($B.frames_stack)
    if(frame[1][name] !== undefined){return frame[1][name]}
    else{
        throw _b_.UnboundLocalError.$factory("local variable '" + name +
                "' referenced before assignment")
    }
}

$B.$check_def = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){return value}
    throw _b_.NameError.$factory("name '" + name + "' is not defined")
}

$B.$check_def_local = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){return value}
    throw _b_.UnboundLocalError.$factory("local variable '" + name +
        "' referenced before assignment")
}

$B.$check_def_free = function(name, value){
    // Check if value is not undefined
    if(value !== undefined){return value}
    var res
    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        res = $B.frames_stack[i][1][name]
        if(res !== undefined){return res}
        res = $B.frames_stack[i][3][name]
        if(res !== undefined){return res}
    }
    throw _b_.NameError.$factory("free variable '" + name +
        "' referenced before assignment in enclosing scope")
}

$B.$check_def_free1 = function(name, scope_id){
    // Check if value is not undefined
    var res
    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        var frame = $B.frames_stack[i]
        res = frame[1][name]
        if(res !== undefined){return res}
        if(frame[1].$parent){
            res = frame[1].$parent[name]
            if(res !== undefined){return res}
        }
        if(frame[2] == scope_id){
            res = frame[3][name]
            if(res !== undefined){return res}
        }
    }
    throw _b_.NameError.$factory("free variable '" + name +
        "' referenced before assignment in enclosing scope")
}


// transform native JS types into Brython types
$B.$JS2Py = function(src){
    if(typeof src === "number"){
        if(src % 1 === 0){return src}
        return _b_.float.$factory(src)
    }
    if(src === null || src === undefined){return _b_.None}
    var klass = $B.get_class(src)
    if(klass !== undefined){
        if(klass === _b_.list){
            for(var i = 0, len = src.length; i< len;i++){
                src[i] = $B.$JS2Py(src[i])
            }
        }else if(klass === $B.JSObject){
            src = src.js
        }else{
            return src
        }
    }
    if(typeof src == "object"){
        if($B.$isNode(src)){return $B.DOMNode.$factory(src)}
        if($B.$isEvent(src)){return $B.$DOMEvent(src)}
        if($B.$isNodeList(src)){return $B.DOMNode.$factory(src)}
        if(Array.isArray(src) &&
                Object.getPrototypeOf(src) === Array.prototype){
            var res = []
            for(var i = 0, len = src.length; i< len; i++){
                res.push($B.$JS2Py(src[i]))
            }
            return res
        }
    }
    return $B.JSObject.$factory(src)
}

// Functions used if we can guess the type from lexical analysis
$B.list_key = function(obj, key){
    key = $B.$GetInt(key)
    if(key < 0){key += obj.length}
    var res = obj[key]
    if(res === undefined){
        throw _b_.IndexError.$factory("list index out of range")
    }
    return res
}

$B.list_slice = function(obj, start, stop){
    if(start === null){start = 0}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.max(0, start + obj.length)}
    }
    if(stop === null){return obj.slice(start)}
    stop = $B.$GetInt(stop)
    if(stop < 0){stop = Math.max(0, stop + obj.length)}
    return obj.slice(start, stop)
}

$B.list_slice_step = function(obj, start, stop, step){
    if(step === null || step == 1){return $B.list_slice(obj, start, stop)}

    if(step == 0){throw _b_.ValueError.$factory("slice step cannot be zero")}
    step = $B.$GetInt(step)

    if(start === null){start = step >= 0 ? 0 : obj.length - 1}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.min(0, start + obj.length)}
    }
    if(stop === null){stop = step >= 0 ? obj.length : -1}
    else{
        stop = $B.$GetInt(stop)
        if(stop < 0){stop = Math.max(0, stop + obj.length)}
    }

    var res = []
    if(step > 0){
        for(var i = start; i < stop; i += step){res.push(obj[i])}
    }else{
        for(var i = start; i > stop; i += step){res.push(obj[i])}
    }
    return res
}

// get item
function index_error(obj){
    var type = typeof obj == "string" ? "string" : "list"
    throw _b_.IndexError.$factory(type + " index out of range")
}

$B.$getitem = function(obj, item){
    if(typeof item == "number"){
        if(Array.isArray(obj) || typeof obj == "string"){
            item = item >=0 ? item : obj.length + item
            if(obj[item] !== undefined){return obj[item]}
            else{index_error(obj)}
        }
    }

    var ce = $B.current_exception
    try{item = $B.$GetInt(item)}catch(err){$B.current_exception = ce}
    if((Array.isArray(obj) || typeof obj == "string")
        && typeof item == "number"){
        item = item >=0 ? item : obj.length + item
        if(obj[item] !== undefined){return obj[item]}
        else{index_error(obj)}
    }

    // PEP 560
    if(obj.$is_class){
        var class_gi = $B.$getattr(obj, "__class_getitem__", _b_.None)
        if(class_gi !== _b_.None){
            return class_gi(item)
        }else if(obj.__class__){
            class_gi = $B.$getattr(obj.__class__, "__getitem__", _b_.None)
            if(class_gi !== _b_.None){
                return class_gi(obj, item)
            }
        }
    }

    var gi = $B.$getattr(obj, "__getitem__", _b_.None)
    if(gi !== _b_.None){return gi(item)}

    throw _b_.TypeError.$factory("'" + $B.get_class(obj).__name__ +
        "' object is not subscriptable")
}

// Set list key or slice
$B.set_list_key = function(obj, key, value){
    try{key = $B.$GetInt(key)}
    catch(err){
        if(_b_.isinstance(key, _b_.slice)){
            var s = _b_.slice.$conv_for_seq(key, obj.length)
            return $B.set_list_slice_step(obj, s.start,
                s.stop, s.step, value)
        }
    }
    if(key < 0){key += obj.length}
    if(obj[key] === undefined){
        console.log(obj, key)
        throw _b_.IndexError.$factory("list assignment index out of range")
    }
    obj[key] = value
}

$B.set_list_slice = function(obj, start, stop, value){
    if(start === null){start = 0}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.max(0, start + obj.length)}
    }
    if(stop === null){stop = obj.length}
    stop = $B.$GetInt(stop)
    if(stop < 0){stop = Math.max(0, stop + obj.length)}
    var res = _b_.list.$factory(value)
    obj.splice.apply(obj,[start, stop - start].concat(res))
}

$B.set_list_slice_step = function(obj, start, stop, step, value){
    if(step === null || step == 1){
        return $B.set_list_slice(obj, start, stop, value)
    }

    if(step == 0){throw _b_.ValueError.$factory("slice step cannot be zero")}
    step = $B.$GetInt(step)

    if(start === null){start = step > 0 ? 0 : obj.length - 1}
    else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.min(0, start + obj.length)}
    }

    if(stop === null){stop = step > 0 ? obj.length : -1}
    else{
        stop = $B.$GetInt(stop)
        if(stop < 0){stop = Math.max(0, stop + obj.length)}
    }

    var repl = _b_.list.$factory(value),
        j = 0,
        test,
        nb = 0
    if(step > 0){test = function(i){return i < stop}}
    else{test = function(i){return i > stop}}

    // Test if number of values in the specified slice is equal to the
    // length of the replacement sequence
    for(var i = start; test(i); i += step){nb++}
    if(nb != repl.length){
            throw _b_.ValueError.$factory(
                "attempt to assign sequence of size " + repl.length +
                " to extended slice of size " + nb)
    }

    for(var i = start; test(i); i += step){
        obj[i] = repl[j]
        j++
    }
}


$B.$setitem = function(obj, item, value){
    if(Array.isArray(obj) && typeof item == "number" &&
            !_b_.isinstance(obj, _b_.tuple)){
        if(item < 0){item += obj.length}
        if(obj[item] === undefined){
            throw _b_.IndexError.$factory("list assignment index out of range")
        }
        obj[item] = value
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.$setitem(obj, item, value)
        return
    }
    _b_.getattr(obj, "__setitem__")(item, value)
}
// augmented item
$B.augm_item_add = function(obj, item, incr){
    if(Array.isArray(obj) && typeof item == "number" &&
            obj[item] !== undefined){
        if(Array.isArray(obj[item]) && Array.isArray(incr)){
            for(var i  =0, len = incr.length; i < len; i++){
                obj[item].push(incr[i])
            }
            return
        }else if(typeof obj[item] == "string" && typeof incr == "string"){
            obj[item] += incr
            return
        }
    }
    var ga = _b_.getattr
    try{
        var augm_func = ga(ga(obj, "__getitem__")(item), "__iadd__")
    }catch(err){
        ga(obj, "__setitem__")(item,
            ga(ga(obj, "__getitem__")(item), "__add__")(incr))
        return
    }
    augm_func(incr)
}
var augm_item_src = "" + $B.augm_item_add
var augm_ops = [["-=", "sub"], ["*=", "mul"]]
for(var i  =0, len = augm_ops.length; i < len; i++){
    var augm_code = augm_item_src.replace(/add/g, augm_ops[i][1])
    augm_code = augm_code.replace(/\+=/g, augm_ops[i][0])
    eval("$B.augm_item_" + augm_ops[i][1] + "=" + augm_code)
}

$B.extend = function(fname, arg){
    // Called if a function call has **kw arguments
    // arg is a dictionary with the keyword arguments entered with the
    // syntax key = value
    // The next arguments of $B.extend are the mappings to unpack
    for(var i = 2; i < arguments.length; i++){
        var mapping = arguments[i]
        var it = _b_.iter(mapping),
            getter = _b_.getattr(mapping, "__getitem__"),
            ce = $B.current_exception
        while (true){
            try{
                var key = _b_.next(it)
                if(typeof key !== "string"){
                    throw _b_.TypeError.$factory(fname +
                        "() keywords must be strings")
                }
                if(arg[key] !== undefined){
                    throw _b_.TypeError.$factory(fname +
                        "() got multiple values for argument '" + key + "'")
                }
                arg[key] = getter(key)
            }catch(err){
                if(_b_.isinstance(err, [_b_.StopIteration])){
                    $B.current_exception = ce
                    break
                }
                throw err
            }
        }
    }
    return arg
}

// function used if a function call has an argument *args
$B.extend_list = function(){
    // The last argument is the iterable to unpack
    var res = Array.prototype.slice.call(arguments, 0, arguments.length - 1),
        last = $B.last(arguments)
    var it = _b_.iter(last),
        ce = $B.current_exception
    while (true){
        try{
            res.push(_b_.next(it))
        }catch(err){
            if(_b_.isinstance(err, [_b_.StopIteration])){
                $B.current_exception = ce
                break
            }
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
    return _b_.bool.$factory(expr)
}

$B.$test_expr = function(){
    // returns the last evaluated item
    return $B.$test_result
}

$B.$is = function(a, b){
    // Used for Python "is". In most cases it's the same as Javascript ===,
    // but new Number(1) === new Number(1) is false, and so is
    // new Number(1) == new Number(1) !!!
    // Cf. issue 669
    if(a instanceof Number && b instanceof Number){
        return a.valueOf() == b.valueOf()
    }
    return a === b
}

$B.$is_member = function(item, _set){
    // used for "item in _set"
    var f, _iter

    // use __contains__ if defined
    var ce = $B.current_exception
    try{f = _b_.getattr(_set, "__contains__")}
    catch(err){$B.current_exception = ce}

    if(f){return f(item)}

    // use __iter__ if defined
    try{_iter = _b_.iter(_set)}
    catch(err){$B.current_exception = ce}
    if(_iter){
        while(1){
            try{
                var elt = _b_.next(_iter)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    $B.current_exception = ce
                    return false
                }
                throw err
            }
        }
    }

    // use __getitem__ if defined
    try{f = _b_.getattr(_set, "__getitem__")}
    catch(err){
        throw _b_.TypeError.$factory("'" + $B.get_class(_set).__name__ +
            "' object is not iterable")
    }
    if(f){
        var i = -1
        while(1){
            i++
            try{
                var elt = f(i)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                if(err.__class__ === _b_.IndexError){return false}
                throw err
            }
        }
    }
}

$B.$call = function(callable){

    if(callable.__class__ === $B.method){
        return callable
    }
    else if(callable.$is_func || typeof callable == "function"){
        return callable
    }else if(callable.$factory){
        return callable.$factory
    }
    else if(callable.$is_class){
        // Use metaclass __call__, cache result in callable.$factory
        return callable.$factory = $B.$instance_creator(callable)
    }
    try{
        return $B.$getattr(callable, "__call__")
    }catch(err){
        throw _b_.TypeError.$factory("'" + $B.get_class(callable).__name__ +
            "' object is not callable")
    }
}

// default standard output and error
// can be reset by sys.stdout or sys.stderr
var $io = {__class__: _b_.type, __name__: "io"}
$io.__mro__ = [_b_.object]

$B.stderr = {
    __class__: $io,
    write: function(data){console.log(data)},
    flush: function(){}
}
$B.stderr_buff = "" // buffer for standard output

$B.stdout = {
    __class__: $io,
    write: function(data){console.log(data)},
    flush: function(){}
}

$B.stdin = {
    __class__: $io,
    __original__: true,
    closed: false,
    len: 1,
    pos: 0,
    read: function (){
        return ""
    },
    readline: function(){
        return ""
    }
}

$B.jsobject2pyobject = function(obj){
    switch(obj) {
        case null:
            return _b_.None
        case true:
            return _b_.True
        case false:
            return _b_.False
    }

    if(typeof obj === "object" && ! Array.isArray(obj) &&
            obj.__class__ === undefined){
        // transform JS object into a Python dict
        var res = _b_.dict.$factory()
        for(var attr in obj){
           res.$string_dict[attr] = $B.jsobject2pyobject(obj[attr])
        }
        return res
    }

    if(_b_.isinstance(obj, _b_.list)){
        var res = [],
            pos = 0
        for(var i = 0, len = obj.length; i < len; i++){
            res[pos++] = $B.jsobject2pyobject(obj[i])
        }
        return res
    }

    if(obj.__class__ !== undefined){
        if(obj.__class__ === _b_.list){
          for(var i = 0, len = obj.length; i < len; i++){
              obj[i] = $B.jsobject2pyobject(obj[i])
          }
          return obj
        }
        return obj
    }

    if(obj._type_ === "iter") { // this is an iterator
       return _b_.iter(obj.data)
    }

    return $B.JSObject.$factory(obj)
}

$B.pyobject2jsobject = function(obj){
    // obj is a Python object
    switch(obj) {
        case _b_.None:
            return null
        case _b_.True:
            return true
        case _b_.False:
            return false
    }

    if(_b_.isinstance(obj, [_b_.int, _b_.float, _b_.str])){return obj}
    if(_b_.isinstance(obj, [_b_.list, _b_.tuple])){
        var res = [],
            pos = 0
        for(var i = 0, len = obj.length; i < len; i++){
           res[pos++] = $B.pyobject2jsobject(obj[i])
        }
        return res
    }
    if(_b_.isinstance(obj, _b_.dict)){
        var res = {},
            items = _b_.list.$factory(_b_.dict.items(obj))
        for(var i = 0, len = items.length; i < len; i++){
            res[$B.pyobject2jsobject(items[i][0])] =
                $B.pyobject2jsobject(items[i][1])
        }
        return res
    }

    if(_b_.hasattr(obj, "__iter__")){
       // this is an iterator..
       var _a = [],
           pos = 0,
           ce = $B.current_exception
       while(1) {
          try{
           _a[pos++] = $B.pyobject2jsobject(_b_.next(obj))
          }catch(err){
            if(err.__class__ !== _b_.StopIteration){throw err}
            $B.current_exception = ce
            break
          }
       }
       return {"_type_": "iter", data: _a}
    }

    if(_b_.hasattr(obj, "__getstate__")){
       return _b_.getattr(obj, "__getstate__")()
    }
    if(_b_.hasattr(obj, "__dict__")){
       return $B.pyobject2jsobject(_b_.getattr(obj, "__dict__"))
    }
    throw _b_.TypeError.$factory(_b_.str.$factory(obj) +
        " is not JSON serializable")
}

$B.set_line = function(line_num, module_name){
    $B.line_info = line_num + "," + module_name
    return _b_.None
}

// functions to define iterators
$B.$iterator = function(items, klass){
    var res = {
        __class__: klass,
        __iter__: function(){return res},
        __len__: function(){return items.length},
        __next__: function(){
            res.counter++
            if(res.counter < items.length){return items[res.counter]}
            throw _b_.StopIteration.$factory("StopIteration")
        },
        __repr__: function(){return "<" + klass.__name__ + " object>"},
        counter: -1
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

$B.$iterator_class = function(name){

    var res = {
        __class__: _b_.type,
        __name__: name,
        __module__: "builtins",
        __mro__: [_b_.object],
        $is_class: true
    }

    function as_array(s) {
       var _a = [],
           pos = 0,
           _it = _b_.iter(s),
           ce = $B.current_exception
       while (1) {
         try{
              _a[pos++] = _b_.next(_it)
         }catch(err){
              if(err.__class__ === _b_.StopIteration){
                  $B.current_exception = ce
                  break
              }
         }
       }
       return _a
    }

    function as_list(s){return _b_.list.$factory(as_array(s))}
    function as_set(s){return _b_.set.$factory(as_array(s))}

    res.__eq__ = function(self,other){
       if(_b_.isinstance(other, [_b_.tuple, _b_.set, _b_.list])){
          return _b_.getattr(as_list(self), "__eq__")(other)
       }

       if(_b_.hasattr(other, "__iter__")){
          return _b_.getattr(as_list(self), "__eq__")(as_list(other))
       }

       _b_.NotImplementedError.$factory(
           "__eq__ not implemented yet for list and " + _b_.type(other))
    }

    var _ops = ["eq", "ne"],
        _f = res.__eq__ + ""

    for (var i = 0; i < _ops.length; i++) {
        var _op = "__" + _ops[i] + "__"
        eval("res." + _op + "=" + _f.replace(new RegExp("__eq__", "g"), _op))
    }

    res.__or__ = function(self, other){
       if(_b_.isinstance(other, [_b_.tuple, _b_.set, _b_.list])){
          return _b_.getattr(as_set(self), "__or__")(other)
       }

       if(_b_.hasattr(other, "__iter__")){
          return _b_.getattr(as_set(self), "__or__")(as_set(other))
       }

       _b_.NotImplementedError.$factory(
           "__or__ not implemented yet for set and " + _b_.type(other))
    }

    var _ops = ["sub", "and", "xor", "gt", "ge", "lt", "le"],
        _f = res.__or__ + ""

    for(var i = 0; i < _ops.length; i++){
        var _op = "__" + _ops[i] + "__"
        eval("res." + _op + "=" + _f.replace(new RegExp("__or__", "g"), _op))
    }

    return res
}

function $err(op, klass, other){
    var msg = "unsupported operand type(s) for " + op + ": '" +
        klass.__name__ + "' and '" + $B.get_class(other).__name__ + "'"
    throw _b_.TypeError.$factory(msg)
}

// Code to add support of "reflected" methods to built-in types
// If a type doesn't support __add__, try method __radd__ of operand

var ropnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]
var ropsigns = ["+", "-", "*", "/", "//", "%", "**", "<<", ">>", "&", "^",
     "|"]

$B.make_rmethods = function(klass){
    for(var j = 0, _len_j = ropnames.length; j < _len_j; j++){
        if(klass["__" + ropnames[j] + "__"] === undefined){
            klass["__" + ropnames[j] + "__"] = (function(name, sign){
                return function(self, other){
                    try{return _b_.getattr(other, "__r" + name + "__")(self)}
                    catch(err){$err(sign, klass, other)}
                }
            })(ropnames[j], ropsigns[j])
        }
    }
}

// UUID is a function to produce a unique id.
// the variable $B.py_UUID is defined in py2js.js (in the brython function)
$B.UUID = function() {return $B.$py_UUID++}

$B.nb_inject = 0
$B.InjectBuiltins = function() {
    $B.nb_inject++
   var _str = ["var _b_ = $B.builtins"],
       pos = 1
   for(var $b in $B.builtins){
       _str[pos++] = "var " + $b + '=_b_["' + $b + '"]'
   }
   return _str.join(";")
}

$B.$GetInt = function(value) {
  // convert value to an integer
  if(typeof value == "number" || value.constructor === Number){return value}
  else if(typeof value === "boolean"){return value ? 1 : 0}
  else if(_b_.isinstance(value, _b_.int)){return value}
  else if(_b_.isinstance(value, _b_.float)){return value.valueOf()}
  if(! value.$is_class){
      try{var v = _b_.getattr(value, "__int__")(); return v}catch(e){}
      try{var v = _b_.getattr(value, "__index__")(); return v}catch(e){}
  }
  throw _b_.TypeError.$factory("'" + $B.get_class(value).__name__ +
      "' object cannot be interpreted as an integer")
}

$B.PyNumber_Index = function(item){
    switch(typeof item){
        case "boolean":
            return item ? 1 : 0
        case "number":
            return item
        case "object":
            if(item.__class__ === $B.long_int){return item}
            var method = _b_.getattr(item, "__index__", null)
            if(method !== null){
                method = typeof method == "function" ?
                            method : _b_.getattr(method, "__call__")
                return $B.int_or_bool(method)
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.get_class(item).__name__ +
                "' object cannot be interpreted as an integer")
    }
}

$B.int_or_bool = function(v){
    switch(typeof v){
        case "boolean":
            return v ? 1 : 0
        case "number":
            return v
        case "object":
            if(v.__class__ === $B.long_int){return v}
            else{
                throw _b_.TypeError.$factory("'" + $B.get_class(v).__name__ +
                "' object cannot be interpreted as an integer")
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.get_class(v).__name__ +
                "' object cannot be interpreted as an integer")
    }
}

$B.int_value = function(v){
    // If v is an integer, return v
    // If it's a boolean, return 0 or 1
    // If it's a complex with v.imag = 0, return int_value(v.real)
    // If it's a float that equals an integer, return it
    // Else throw ValueError
    try{return $B.int_or_bool(v)}
    catch(err){
        if(_b_.isinstance(v, _b_.complex) && v.$imag == 0){
            return $B.int_or_bool(v.$real)
        }else if(isinstance(v, _b_.float) && v == Math.floor(v)){
            return Math.floor(v)
        }else{
            throw _b_.TypeError.$factory("'" + $B.get_class(v).__name__ +
                "' object cannot be interpreted as an integer")
        }
    }
}

$B.enter_frame = function(frame){
    // Enter execution frame : save on top of frames stack
    $B.frames_stack.push(frame)
}

$B.leave_frame = function(arg){
    // Leave execution frame
    if($B.profile > 0){$B.$profile.return()}
    if($B.frames_stack.length == 0){console.log("empty stack"); return}
    $B.frames_stack.pop()
}

$B.leave_frame_exec = function(arg){
    // Leave execution frame in an "exec" or "eval" : may have side effects
    // on the englobing namespace
    if($B.profile > 0){$B.$profile.return()}
    if($B.frames_stack.length == 0){console.log("empty stack"); return}
    var frame = $B.frames_stack.pop()
    for(var i = $B.frames_stack.length - 1; i >= 0; i--){
        if($B.frames_stack[i][2] == frame[2]){
            $B.frames_stack[i][3] = frame[3]
        }
    }
}

$B.memory = function(){
    var info = []
    for(var attr in __BRYTHON__){
       var obj = __BRYTHON__[attr]
       if(obj === null){continue}
       if(Array.isArray(obj)){info.push([obj.length, attr])}
       else if(typeof obj == "object"){
           info.push([Object.keys(obj).length, attr])
       }
   }
   info.sort(function(x, y){return x[0] - y[0]})
   for(var i = 0, len = info.length; i < len; i++){
       console.log(info[i][0], info[i][1], __BRYTHON__[info[i][1]])
   }
}

var Profile = $B.make_class("profile",
    function(){return {__class__: Profile}}
)
Profile.__dir__ = function(self){
    return Object.keys(self)
}
Profile.__getattribute__ = function(self, attr){
    if(attr == "__str__"){
        return function(){
            var res = "<profile object"
            for(var attr in self){
                if(attr.startsWith("__")){continue}
                res += " " + attr + ": "
                if(typeof self[attr] == "object"){
                    res += _b_.dict.__str__($B.obj_dict(self[attr]))
                }else{
                    res += _b_.str.$factory(self[attr])
                }
            }
            return res + ">"
        }
    }
    return $B.jsobj2pyobj(self[attr])
}

$B.$profile_data = Profile.$factory()

$B.$profile = (function(profile) {
    var call_times = {},    // indexed by function-hash,
                            //   - given a function it contains a stack with an element for
                            //     each currently running call of the function
                            //     the element is a quadruple:
                            //         start of the function call
                            //         hash of the caller (from where the function was invoked)
                            //         cumulated time spent in function not-including subcalls up to last subcall
                            //         time when the function was last resumed after a subcall (or the time when
                            //         started runnig if there were no subcalls)
        _START = 0,         //  used as indices to access elements of call_times
        _CALLER = 1,
        _CUMULATED = 2,
        _LAST_RESUMED =3,
        call_stack = [],      // contains hashes of the currently running functions (in call-order)
        profile_start = null, // Time when profiling started (or restarted after being paused)
        active = false,       // true when collecting data
        paused = false,       // true when paused
        cumulated = 0         // cumulated time of data collection from first start until last restart after a pause.

    var _fhash = function(module, fname, line){
        return module + "." + fname + ":" + line
    }
    var _hash = function(module, line){return module + ":" + line}
    var _is_recursive = function(h) {
        for(var i = 0; i < call_stack.length; i++)
            if(call_stack[i] == h){return true}
        return false
    }

    var $profile = {
        "call": function(module, fname, line, caller){
            if($B.profile > 1 && active){
                var ctime = new Date()
                var h = _fhash(module, fname, line)
                if(!(h in call_times)){call_times[h] = []}
                if(call_stack.length > 0){
                    in_func = call_stack[call_stack.length - 1]
                    func_stack = call_times[in_func]
                    inner_most_call = func_stack[func_stack.length - 1]
                    inner_most_call[_CUMULATED] += ctime -
                        inner_most_call[_LAST_RESUMED]
                    caller = caller + ":" + in_func
                }
                call_times[h].push([ctime, caller, 0, ctime]) // start time, caller hash, duration without subcalls, start_of_last_subcall
                call_stack.push(h)
            }
        },
        "return": function(){
            if($B.profile > 1 && active){
                var h = call_stack.pop()
                if(h in call_times){
                    var t_end = new Date(),
                        data = call_times[h].pop()
                    t_start = data[_START]
                    caller = data[_CALLER]
                    t_duration = t_end - t_start
                    t_in_func = data[_CUMULATED] + t_end -
                        data[_LAST_RESUMED]
                    if(!(h in profile.call_times)){
                        profile.call_times[h] = 0
                        profile.call_times_proper[h] = 0
                        profile.call_counts[h] = 0
                        profile.call_counts_norec[h] = 0
                        profile.callers[h] = {}
                    }
                    profile.call_times[h] += t_duration
                    profile.call_times_proper[h] += t_in_func
                    profile.call_counts[h] += 1
                    if(!(caller in profile.callers[h])){
                        profile.callers[h][caller] = [0, 0, 0, 0]
                    }
                    if(! _is_recursive(h)){
                        profile.call_counts_norec[h] += 1
                        profile.callers[h][caller][3]++       // Nuber norec calls (for given caller)
                    }
                    profile.callers[h][caller][0] += t_duration // Total time including subcalls (for given caller)
                    profile.callers[h][caller][1] += t_in_func  // Total time excluding subcalls (for given caller)
                    profile.callers[h][caller][2]++           // Nuber of calls (for given caller)

                    if(call_stack.length > 0){              // We are returning into a function call, need to update
                                                            // its last resume time
                        in_func = call_stack[call_stack.length - 1]
                        func_stack = call_times[in_func]
                        inner_most_call = func_stack[func_stack.length - 1]
                        inner_most_call[_LAST_RESUMED] = new Date()
                    }
                }
            }
        },
        "count": function(module,line){
            if(active){
                var h = _hash(module, line)
                if(!(h in profile.line_counts)){ profile.line_counts[h] = 0}
                profile.line_counts[h]++
            }
        },
        "pause": function() {
            if(active){
                elapsed = (new Date()) - profile_start
                cumulated += elapsed
                active = false
                paused = true
            }
        },
        "start": function() {
            if($B.profile > 0){
                if(! paused){$B.$profile.clear()}
                else{paused = false}
                active = true
                profile_start = new Date()
            }
        },
        "elapsed": function() {
            if(active){return cumulated + (new Date()) - profile_start}
            else{return cumulated}
        },
        "stop": function() {
            if(active || paused){
                profile.profile_duration = ((new Date()) - profile_start) +
                    cumulated
                active = false
                paused = false
            }
        },
        "clear":function(){
            cumulated = 0;
            profile.line_counts = {}
            profile.call_times = {}
            profile.call_times_proper = {}
            profile.call_counts = {}
            profile.call_counts_norec = {}
            profile.callers = {}
            active = false
            paused = false
        },
        "status":function() {
            if($B.profile <= 0){return "Disabled"}
            if(active){return "Collecting data: active"}
            else if(paused){return "Collecting data: paused"}
            else{return "Stopped"}
        },
    }
    return $profile
})($B.$profile_data)

var min_int = Math.pow(-2, 53), max_int = Math.pow(2, 53) - 1

$B.is_safe_int = function(){
    for(var i = 0; i < arguments.length; i++){
        var arg = arguments[i]
        if(arg < min_int || arg > max_int){return false}
    }
    return true
}

$B.add = function(x, y){
    var z = (typeof x != "number" || typeof y != "number") ?
                new Number(x + y) : x + y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else if((typeof x == "number" || x.__class__ === $B.long_int)
            && (typeof y == "number" || y.__class__ === $B.long_int)){
        if((typeof x == "number" && isNaN(x)) ||
                (typeof y == "number" && isNaN(y))){
            return _b_.float.$factory("nan")
        }
        var res = $B.long_int.__add__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
        return res
    }else{return z}
}

$B.div = function(x, y){
    var z = x / y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else{
        return $B.long_int.__truediv__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }
}

$B.eq = function(x, y){
    if(x > min_int && x < max_int && y > min_int && y < max_int){return x == y}
    return $B.long_int.__eq__($B.long_int.$factory(x), $B.long_int.$factory(y))
}

$B.floordiv = function(x, y){
    var z = x / y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return Math.floor(z)}
    else{
        return $B.long_int.__floordiv__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }
}

$B.mul = function(x,y){
    var z = (typeof x != "number" || typeof y != "number") ?
            new Number(x * y) : x * y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else if((typeof x == "number" || x.__class__ === $B.long_int)
            && (typeof y == "number" || y.__class__ === $B.long_int)){
        if((typeof x == "number" && isNaN(x)) ||
                (typeof y == "number" && isNaN(y))){
            return _b_.float.$factory("nan")
        }
        return $B.long_int.__mul__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }else{return z}
}
$B.sub = function(x, y){
    var z = (typeof x != "number" || typeof y != "number") ?
                new Number(x - y) : x - y
    if(x > min_int && x < max_int && y > min_int && y < max_int
        && z > min_int && z < max_int){return z}
    else if((typeof x == "number" || x.__class__  === $B.long_int)
        && (typeof y == "number" || y.__class__ === $B.long_int)){
        if((typeof x == "number" && isNaN(x)) ||
                (typeof y == "number" && isNaN(y))){
            return _b_.float.$factory("nan")
        }
        return $B.long_int.__sub__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }else{return z}
}
// greater or equal
$B.ge = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x >= y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__ge__(x, y)}
}
$B.gt = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x > y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__gt__(x, y)}
}

var reversed_op = {"__lt__": "__gt__", "__le__":"__ge__",
    "__gt__": "__lt__", "__ge__": "__le__"}
var method2comp = {"__lt__": "<", "__le__": "<=", "__gt__": ">",
    "__ge__": ">="}

$B.rich_comp = function(op, x, y){
    var x1 = x.valueOf(),
        y1 = y.valueOf()
    if(typeof x1 == "number" && typeof y1 == "number" &&
            x.__class__ === undefined && y.__class__ === undefined){
        switch(op){
            case "__eq__":
                return x1 == y1
            case "__ne__":
                return x1 != y1
            case "__le__":
                return x1 <= y1
            case "__lt__":
                return x1 < y1
            case "__ge__":
                return x1 >= y1
            case "__gt__":
                return x1 > y1
        }
    }
    var res,
        rev_op,
        compared = false

    if(x.$is_class || x.$factory) {
        if(op == "__eq__"){
            return (x === y)
        }else if ( op == "__ne__"){
            return !(x === y)
        }else{
            throw _b_.TypeError.$factory("'" + op +
                "' not supported between types")
        }
    }

    if(x.__class__ && y.__class__){
        // cf issue #600 and
        // https://docs.python.org/3/reference/datamodel.html :
        // "If the operands are of different types, and right operand’s type
        // is a direct or indirect subclass of the left operand’s type, the
        // reflected method of the right operand has priority, otherwise the
        // left operand’s method has priority."
        if(y.__class__.__mro__.indexOf(x.__class__) > -1){
            rev_op = reversed_op[op] || op
            res = _b_.getattr(y, rev_op)(x)
            if(res !== _b_.NotImplemented){return res}
            compared = true
        }
    }
    res = $B.$call(_b_.getattr(x, op))(y)

    if(res !== _b_.NotImplemented){return res}
    if(compared){return false}
    rev_op = reversed_op[op] || op
    res = _b_.getattr(y, rev_op)(x)
    if(res !== _b_.NotImplemented ){return res}
    // If both operands return NotImplemented, return False if the operand is
    // __eq__, True if it is __ne__, raise TypeError otherwise
    if(op == "__eq__"){return _b_.False}
    else if(op == "__ne__"){return _b_.True}

    throw _b_.TypeError.$factory("'" + method2comp[op] +
        "' not supported between instances of '" + $B.get_class(x).__name__ +
        "' and '" + $B.get_class(y).__name__ + "'")
}

$B.is_none = function(o){
    return o === undefined || o === null || o == _b_.None
}

})(__BRYTHON__)

// IE doesn't implement indexOf on Arrays
if(!Array.indexOf){
  Array.prototype.indexOf = function(obj){
    for(var i = 0, len = this.length; i < len; i++){
        if(this[i] == obj){return i}
    }
    return -1
  }
}


// http://stackoverflow.com/questions/202605/repeat-string-javascript
// allows for efficient indention..
if(!String.prototype.repeat){
  String.prototype.repeat = function(count) {
    if(count < 1){return ''}
    var result = '', pattern = this.valueOf()
    while(count > 1){
        if(count & 1){result += pattern}
        count >>= 1, pattern += pattern
    }
    return result + pattern
  }
}
