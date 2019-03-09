// built-in functions
;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

_b_.__debug__ = false

var object = _b_.object,
    odga = object.__getattribute__

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
$B.$inv_comps = {'>': 'lt', '>=': 'le', '<': 'gt', '<=': 'ge'}

function check_nb_args(name, expected, args){
    // Check the number of arguments
    var len = args.length,
        last = args[len - 1]
    if(last && last.$nat == "kw"){
        var kw = last.kw
        if(Array.isArray(kw) && kw[1] && kw[1].__class__ === _b_.dict){
            if(Object.keys(kw[1].$string_dict).length == 0){
                len--
            }
        }
    }
    if(len != expected){
        if(expected == 0){
            throw _b_.TypeError.$factory(name + "() takes no argument" +
                " (" + got + " given)")
        }else{
            throw _b_.TypeError.$factory(name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + len + " given)")
        }
    }
}

function check_no_kw(name, x, y){
    // Throw error if one of x, y is a keyword argument
    if(x.$nat || (y !== undefined && y.$nat)){
        throw _b_.TypeError.$factory(name + "() takes no keyword arguments")}
}

var NoneType = {
    __class__: _b_.type,
    $infos:{
        __name__: "NoneType",
        __module__: "builtins"
    },
    __mro__: [object],
    $is_class: true
}

NoneType.__setattr__ = function(self, attr){
    return no_set_attr(NoneType, attr)
}

var None = {
    __bool__: function(){return False},
    __class__: NoneType,
    __hash__: function(){return 0},
    __repr__: function(){return 'None'},
    __str__: function(){return 'None'},
    toString: function(){return 'None'}
}

NoneType.$factory = function(){return None}


for(var $op in $B.$comps){ // None is not orderable with any type
    var key = $B.$comps[$op]
    switch(key){
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        NoneType['__' + key + '__'] = (function(op){
            return function(other){return _b_.NotImplemented}
        })($op)
    }
}
for(var $func in None){
    if(typeof None[$func] == 'function'){
        None[$func].__str__ = (function(f){
            return function(){return "<method-wrapper " + f +
                " of NoneType object>"
            }
        })($func)
    }
}

$B.set_func_names(NoneType, "builtins")

function abs(obj){
    check_nb_args('abs', 1, arguments)
    check_no_kw('abs', obj)

    if(isinstance(obj, _b_.int)){
        if(obj.__class__ === $B.long_int){
            return {
                __class__: $B.long_int,
                value: obj.value,
                pos: true
            }
        }else{
            return _b_.int.$factory(Math.abs(obj))
        }
    }
    if(isinstance(obj, _b_.float)){return _b_.float.$factory(Math.abs(obj))}
    if(hasattr(obj, '__abs__')){return $B.$getattr(obj, '__abs__')()}

    throw _b_.TypeError.$factory("Bad operand type for abs(): '" +
        $B.get_class(obj) + "'")
}

function all(obj){
    check_nb_args('all', 1, arguments)
    check_no_kw('all', obj)
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(!$B.$bool(elt)){return false}
        }catch(err){return true}
    }
}

function any(obj){
    check_nb_args('any', 1, arguments)
    check_no_kw('any', obj)
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if($B.$bool(elt)){return true}
        }catch(err){return false}
    }
}

function ascii(obj) {
    check_nb_args('ascii', 1, arguments)
    check_no_kw('ascii', obj)
    var res = repr(obj), res1 = '', cp
    for(var i = 0; i < res.length; i++){
        cp = res.charCodeAt(i)
        if(cp < 128){res1 += res.charAt(i)}
        else if(cp < 256){res1 += '\\x' + cp.toString(16)}
        else{
            var s = cp.toString(16)
            if(s.length % 2 == 1){s = "0" + s}
            res1 += '\\u' + s
        }
    }
    return res1
}

// used by bin, hex and oct functions
function $builtin_base_convert_helper(obj, base) {
  var prefix = "";
  switch(base){
     case 2:
       prefix = '0b'; break
     case 8:
       prefix = '0o'; break
     case 16:
       prefix = '0x'; break
     default:
         console.log('invalid base:' + base)
  }

  if(obj.__class__ === $B.long_int){
     if(obj.pos){return prefix + $B.long_int.to_base(obj, base)}
     return '-' + prefix + $B.long_int.to_base(-obj, base)
  }

  var value = $B.$GetInt(obj)

  if(value === undefined){
     // need to raise an error
     throw _b_.TypeError.$factory('Error, argument must be an integer or' +
         ' contains an __index__ function')
  }

  if(value >= 0){return prefix + value.toString(base)}
  return '-' + prefix + (-value).toString(base)
}


// bin() (built in function)
function bin(obj) {
    check_nb_args('bin', 1, arguments)
    check_no_kw('bin', obj)
    if(isinstance(obj, _b_.int)){
        return $builtin_base_convert_helper(obj, 2)
    }
    return $B.$getattr(obj, '__index__')()
}

function callable(obj) {
    check_nb_args('callable', 1, arguments)
    check_no_kw('callable', obj)

    return hasattr(obj, '__call__')
}

function chr(i) {
    check_nb_args('chr', 1, arguments)
    check_no_kw('chr', i)

    if(i < 0 || i > 1114111){
        throw _b_.ValueError.$factory('Outside valid range')
    }
    return String.fromCharCode(i)
}

//classmethod() (built in class)
var classmethod = $B.make_class("classmethod",
    function(func) {
        check_nb_args('classmethod', 1, arguments)
        check_no_kw('classmethod', func)
        var f = function(){
                    return func.apply(null, arguments)
                }
        f.__class__ = $B.method
        // Set same attributes as those set to func by setattr
        // Used for instance by @abc.abstractclassmethod
        if(func.$attrs){
            for(var key in func.$attrs){
                f[key] = func.$attrs[key]
            }
        }
        f.$infos = {
            __func__: func,
            __name__: func.$infos.__name__
        }
        f.__get__ = function(obj, cls){
            var method = function(){
                return f(cls, ...arguments)
            }
            method.__class__ = $B.method
            method.$infos = {
                __self__: cls,
                __func__: f,
                __name__: func.$infos.__name__,
                __qualname__: cls.$infos.__name__ + "." + func.$infos.__name__
            }
            return method
        }
        f.__get__.__class__ = $B.method_wrapper
        f.__get__.$infos = func.$infos
        return f
    }
)

$B.set_func_names(classmethod, "builtins")

//compile() (built in function)
var code = $B.code = $B.make_class("code")

code.__repr__ = code.__str__ = function(self){
    return '<code object ' + self.name + ', file ' + self.filename + '>'
}

code.__getattr__ = function(self, attr){
    if(attr == "co_code"){return 'co_code'}
    return self[attr]
}

function compile() {
    var $ = $B.args('compile', 6,
        {source:null, filename:null, mode:null, flags:null, dont_inherit:null,
         optimize:null},
         ['source', 'filename', 'mode', 'flags', 'dont_inherit', 'optimize'],
         arguments, {flags: 0, dont_inherit: false, optimize: -1}, null, null)

    var module_name = '$exec_' + $B.UUID()
    $B.clear_ns(module_name)
    $.__class__ = code
    $.co_flags = $.flags
    // Run py2js to detect potential syntax errors
    $B.py2js($.source, module_name, module_name)
    return $
}


//function complex is located in py_complex.js

// built-in variable __debug__
var __debug__ = $B.debug > 0

function delattr(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has
    // a method __delete__(), use it
    check_no_kw('delattr', obj, attr)
    check_nb_args('delattr', 2, arguments)
    if(typeof attr != 'string'){
        throw _b_.TypeError.$factory("attribute name must be string, not '" +
            $B.class_name(attr) + "'")
    }
    return $B.$getattr(obj, '__delattr__')(attr)
}

function dir(obj){
    if(obj === undefined){
        // if dir is called without arguments, use globals
        var frame = $B.last($B.frames_stack),
            globals_obj = frame[3],
            res = _b_.list.$factory(),
            pos = 0
        for(var attr in globals_obj){
            if(attr.charAt(0) == '$' && attr.charAt(1) != '$') {
                // exclude internal attributes set by Brython
                continue
            }
            res[pos++] = attr
        }
        _b_.list.sort(res)
        return res
    }

    check_nb_args('dir', 1, arguments)
    check_no_kw('dir', obj)

    var klass = obj.__class__ || $B.get_class(obj)

    if(obj.$is_class){
        // Use metaclass __dir__
        var dir_func = $B.$getattr(obj.__class__, "__dir__")
        return $B.$call(dir_func)(obj)
    }
    try{
        var res = $B.$call($B.$getattr(obj, '__dir__'))()

        res = _b_.list.$factory(res)
        res.sort()
        return res
    }catch (err){
        // ignore, default
        console.log(err)
    }

    var res = [], pos = 0
    for(var attr in obj){
        if(attr.charAt(0) !== '$' && attr !== '__class__' &&
                obj[attr] !== undefined){
            res[pos++] = attr
        }
    }
    res.sort()
    return res
}

//divmod() (built in function)
function divmod(x,y) {
   check_no_kw('divmod', x, y)
   check_nb_args('divmod', 2, arguments)

   var klass = x.__class__ || $B.get_class(x)
   return _b_.tuple.$factory([$B.$getattr(klass, '__floordiv__')(x, y),
       $B.$getattr(klass, '__mod__')(x, y)])
}

var enumerate = $B.make_class("enumerate",
    function(){
        var $ns = $B.args("enumerate", 2, {iterable: null,start: null},
            ['iterable', 'start'], arguments, {start: 0}, null, null)
        var _iter = iter($ns["iterable"])
        var _start = $ns["start"]
        var res = {
            __class__: enumerate,
            __getattr__: function(attr){return res[attr]},
            __iter__: function(){return res},
            __name__: 'enumerate iterator',
            __next__: function(){
                res.counter++
                return _b_.tuple.$factory([res.counter, next(_iter)])
            },
            __repr__: function(){return "<enumerate object>"},
            __str__: function(){return "<enumerate object>"},
            counter: _start - 1
        }
        for(var attr in res){
            if(typeof res[attr] === 'function' && attr !== "__class__"){
                res[attr].__str__ = (function(x){
                    return function(){
                        return "<method wrapper '" + x + "' of enumerate object>"
                    }
                })(attr)
            }
        }
        return res
    }
)

$B.set_func_names(enumerate, "builtins")

$B.from_alias = function(attr){
    if(attr.substr(0, 2) == '$$' && $B.aliased_names[attr.substr(2)]){
        return attr.substr(2)
    }
    return attr
}
$B.to_alias = function(attr){
    if($B.aliased_names[attr]){return '$$' + attr}
    return attr
}

//eval() (built in function)
function $$eval(src, _globals, _locals){

    if(_globals === undefined){_globals = _b_.None}
    if(_locals === undefined){_locals = _b_.None}

    var current_frame = $B.frames_stack[$B.frames_stack.length - 1]

    if(current_frame !== undefined){
        var current_locals_id = current_frame[0].replace(/\./, '_'),
            current_globals_id = current_frame[2].replace(/\./, '_')
    }

    var stack_len = $B.frames_stack.length

    var is_exec = arguments[3] == 'exec', leave = false

    if(src.__class__ === code){
        is_exec = src.mode == "exec"
        src = src.source
    }else if(typeof src !== 'string'){
        throw _b_.TypeError.$factory("eval() arg 1 must be a string, bytes "+
            "or code object")
    }

    // code will be run in a specific block
    var globals_id = '$exec_' + $B.UUID(),
        locals_id = '$exec_' + $B.UUID(),
        parent_scope

    if(_globals === _b_.None){
        if(current_locals_id == current_globals_id){
            locals_id = globals_id
        }

        var local_scope = {
            module: locals_id,
            id: locals_id,
            binding: {},
            bindings: {}
        }
        for(var attr in current_frame[1]){
            local_scope.binding[attr] = true
            local_scope.bindings[attr] = true
        }
        var global_scope = {
            module: globals_id,
            id: globals_id,
            binding: {},
            bindings: {}
        }
        for(var attr in current_frame[3]){
            global_scope.binding[attr] = true
            global_scope.bindings[attr] = true
        }
        local_scope.parent_block = global_scope
        global_scope.parent_block = $B.builtins_scope

        parent_scope = local_scope

        // restore parent scope object
        eval("$locals_" + parent_scope.id + " = current_frame[1]")

    }else{
        // If a _globals dictionary is provided, set or reuse its attribute
        // globals_id
        if(_globals.__class__ != _b_.dict){
            throw _b_.TypeError.$factory("exec() globals must be a dict, not "+
                _globals.__class__.$infos.__name__)
        }
        _globals.globals_id = _globals.globals_id || globals_id
        globals_id = _globals.globals_id

        if(_locals === _globals || _locals === _b_.None){
            locals_id = globals_id
            parent_scope = $B.builtins_scope
        }else{
            // The parent block of locals must be set to globals
            var grandparent_scope = {
                id: globals_id,
                parent_block: $B.builtins_scope,
                binding: {}
            }
            parent_scope = {
                id: locals_id,
                parent_block: grandparent_scope,
                binding: {}
            }
            for(var attr in _globals.$string_dict){
                grandparent_scope.binding[attr] = true
            }
            for(var attr in _locals.$string_dict){
                parent_scope.binding[attr] = true
            }
        }
    }

    // set module path
    $B.$py_module_path[globals_id] = $B.$py_module_path[current_globals_id]
    // Initialise the object for block namespaces
    eval('var $locals_' + globals_id + ' = {}\nvar $locals_' +
        locals_id + ' = {}')

    // Initialise block globals
    if(_globals === _b_.None){
        var gobj = current_frame[3],
            ex = 'var $locals_' + current_globals_id + ' = gobj;'
        eval(ex) // needed for generators
        for(var attr in gobj){
            if((! attr.startsWith("$")) || attr.startsWith('$$')){
                eval("$locals_" + globals_id +"[attr] = gobj[attr]")
            }
        }
    }else{
        if(_globals.$jsobj){var items = _globals.$jsobj}
        else{var items = _globals.$string_dict}
        eval("$locals_" + globals_id + " = _globals.$string_dict")
        for(var item in items){
            var item1 = $B.to_alias(item)
            try{
                eval('$locals_' + globals_id + '["' + item1 +
                    '"] = items[item]')
            }catch(err){
                console.log(err)
                console.log('error setting', item)
                break
            }
        }
    }

    // Initialise block locals

    if(_locals === _b_.None){
        if(_globals !== _b_.None){
            eval('var $locals_' + locals_id + ' = $locals_' + globals_id)
        }else{
            var lobj = current_frame[1],
                ex = ''
            for(var attr in current_frame[1]){
                if(attr.startsWith("$") && !attr.startsWith("$$")){continue}
                ex += '$locals_' + locals_id + '["' + attr +
                    '"] = current_frame[1]["' + attr + '"];'
                eval(ex)
            }
        }
    }else{
        if(_locals.$jsobj){var items = _locals.$jsobj}
        else{var items = _locals.$string_dict}
        for(var item in items){
            var item1 = $B.to_alias(item)
            try{
                eval('$locals_' + locals_id + '["' + item + '"] = items.' + item)
            }catch(err){
                console.log(err)
                console.log('error setting', item)
                break
            }
        }
    }
    eval("$locals_" + locals_id + ".$src = src")

    var root = $B.py2js(src, globals_id, locals_id, parent_scope),
        js, gns, lns

    if(_globals !== _b_.None && _locals == _b_.None){
        for(var attr in _globals.$string_dict){
            root.binding[attr] = true
        }
    }

    try{
        // The result of py2js ends with
        // try{
        //     (block code)
        //     $B.leave_frame($local_name)
        // }catch(err){
        //     $B.leave_frame($local_name)
        //     throw err
        // }
        var try_node = root.children[root.children.length - 2],
            instr = try_node.children[try_node.children.length - 2]
        // type of the last instruction in (block code)
        var type = instr.context.tree[0].type

        // If the Python function is eval(), not exec(), check that the source
        // is an expression

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
                root.children.splice(root.children.length - 2, 2)
                for(var i = 0; i < children.length - 1; i++){
                    root.add(children[i])
                }
                break
            default:
                if(!is_exec){
                    throw _b_.SyntaxError.$factory(
                        "eval() argument must be an expression",
                        '<string>', 1, 1, src)
                }
        }

        js = root.to_js()

        if(is_exec){
            var locals_obj = eval("$locals_" + locals_id),
                globals_obj = eval("$locals_" + globals_id)
            if(_globals === _b_.None){
                var res = new Function("$locals_" + globals_id,
                    "$locals_" + locals_id, js)(globals_obj, locals_obj)

            }else{
                current_globals_obj = current_frame[3]
                current_locals_obj = current_frame[1]
                var res = new Function("$locals_" + globals_id,
                    "$locals_" + locals_id,
                    "$locals_" + current_globals_id,
                    "$locals_" + current_locals_id,
                    js)(globals_obj, locals_obj,
                        current_globals_obj, current_locals_obj)
            }
        }else{
            var res = eval(js)
        }

        gns = eval("$locals_" + globals_id)
        if($B.frames_stack[$B.frames_stack.length - 1][2] == globals_id){
            gns = $B.frames_stack[$B.frames_stack.length - 1][3]
        }

        // Update _locals with the namespace after execution
        if(_locals !== _b_.None){
            lns = eval("$locals_" + locals_id)
            for(var attr in lns){
                var attr1 = $B.from_alias(attr)
                if(attr1.charAt(0) != '$'){
                    if(_locals.$jsobj){_locals.$jsobj[attr] = lns[attr]}
                    else{_locals.$string_dict[attr1] = lns[attr]}
                }
            }
        }else{
            for(var attr in lns){
                if(attr !== "$src"){
                    current_frame[1][attr] = lns[attr]
                }
            }
        }

        if(_globals !== _b_.None){
            // Update _globals with the namespace after execution
            for(var attr in gns){
                attr1 = $B.from_alias(attr)
                if(attr1.charAt(0) != '$'){
                    if(_globals.$jsobj){_globals.$jsobj[attr] = gns[attr]}
                    else{_globals.$string_dict[attr1] = gns[attr]}
                }
            }
        }else{
            for(var attr in gns){
                if(attr !== "$src"){
                    current_frame[3][attr] = gns[attr]
                }
            }
        }

        // fixme: some extra variables are bleeding into locals...
        /*  This also causes issues for unittests */
        if(res === undefined){return _b_.None}
        return res
    }catch(err){
        err.src = src
        err.module = globals_id
        if(err.$py_error === undefined){throw $B.exception(err)}
        throw err
    }finally{
        // "leave_frame" was removed so we must execute it here
        if($B.frames_stack.length == stack_len + 1){
            $B.frames_stack.pop()
        }

        root = null
        js = null
        gns = null
        lns = null

        $B.clear_ns(globals_id)
        $B.clear_ns(locals_id)
    }
}
$$eval.$is_func = true

function exec(src, globals, locals){
    var missing = {}
    var $ = $B.args("exec", 3, {src: null, globals: null, locals: null},
        ["src", "globals", "locals"], arguments,
        {globals: _b_.None, locals: _b_.None}, null, null),
        src = $.src,
        globals = $.globals,
        locals = $.locals
    return $$eval(src, globals, locals, 'exec') || _b_.None
}

exec.$is_func = true

function exit(){
    throw _b_.SystemExit
}

exit.__repr__ = exit.__str__ = function(){
    return "Use exit() or Ctrl-Z plus Return to exit"
}

var filter = $B.make_class("filter",
    function(func, iterable){
        check_no_kw('filter', func, iterable)
        check_nb_args('filter', 2, arguments)

        iterable = iter(iterable)
        if(func === _b_.None){func = $B.$bool}

        return {
            __class__: filter,
            func: func,
            iterable: iterable
        }
    }
)

filter.__iter__ = function(self){return self}

filter.__next__ = function(self) {
    while(true){
        var _item = next(self.iterable)
        if(self.func(_item)){return _item}
    }
}

$B.set_func_names(filter, "builtins")

function format(value, format_spec) {
  var args = $B.args("format", 2, {value: null, format_spec: null},
      ["value", "format_spec"], arguments, {format_spec: ''}, null, null)
  var fmt = $B.$getattr(args.value, '__format__', null)
  if(fmt !== null){return fmt(args.format_spec)}
  throw _b_.NotImplementedError("__format__ is not implemented for object '" +
      _b_.str.$factory(args.value) + "'")
}

function attr_error(attr, cname){
    var msg = "bad operand type for unary #: '" + cname + "'"
    switch(attr){
        case '__neg__':
            throw _b_.TypeError.$factory(msg.replace('#', '-'))
        case '__pos__':
            throw _b_.TypeError.$factory(msg.replace('#', '+'))
        case '__invert__':
            throw _b_.TypeError.$factory(msg.replace('#', '~'))
        case '__call__':
            throw _b_.TypeError.$factory("'" + cname + "'" +
                ' object is not callable')
        default:
            while(attr.charAt(0) == '$'){attr = attr.substr(1)}
            throw _b_.AttributeError.$factory("'" + cname +
                "' object has no attribute '" + attr + "'")
    }
}

function getattr(){
    var missing = {}
    var $ = $B.args("getattr", 3, {obj: null, attr: null, _default: null},
        ["obj", "attr", "_default"], arguments, {_default: missing},
        null, null)
    return $B.$getattr($.obj, $.attr,
        $._default === missing ? undefined : $._default)
}

function in_mro(klass, attr){
    if(klass === undefined){return false}
    if(klass.hasOwnProperty(attr)){return klass[attr]}
    var mro = klass.__mro__
    for(var i = 0, len = mro.length; i < len; i++){
        if(mro[i].hasOwnProperty(attr)){
            return mro[i][attr]
        }
    }
    return false
}

$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments
    var rawname = attr
    attr = $B.to_alias(attr)

    var is_class = obj.$is_class || obj.$factory

    var klass = obj.__class__

    var $test = false //attr == "sort" // && obj === $B // "Point"
    if($test){console.log("$getattr", attr, obj, klass)}

    // Shortcut for classes without parents
    if(klass !== undefined && klass.__bases__ &&
            (klass.__bases__.length == 0 ||
                (klass.__bases__.length == 1 &&
                 klass.__bases__[0] === _b_.object))){
        if(obj.hasOwnProperty(attr)){
            return obj[attr]
        }else if(obj.__dict__ &&
                obj.__dict__.$string_dict.hasOwnProperty(attr) &&
                ! (klass.hasOwnProperty(attr) &&
                   klass[attr].__get__)){
            return obj.__dict__.$string_dict[attr]
        }else if(klass.hasOwnProperty(attr)){
            if(typeof klass[attr] != "function" &&
                    attr != "__dict__" &&
                    klass[attr].__get__ === undefined){
                var kl = klass[attr].__class__
                if(! in_mro(kl, "__get__")){
                    return klass[attr]
                }
            }
        }
    }

    if($test){console.log("attr", attr, "of", obj, "class", klass, "isclass", is_class)}
    if(klass === undefined){
        // avoid calling $B.get_class in simple cases for performance
        if(typeof obj == 'string'){klass = _b_.str}
        else if(typeof obj == 'number'){
            klass = obj % 1 == 0 ? _b_.int : _b_.float
        }else if(obj instanceof Number){
            klass = _b_.float
        }else{
            klass = $B.get_class(obj)
            if(klass === undefined){
                // for native JS objects used in Python code
                if($test){console.log("no class", attr, obj.hasOwnProperty(attr), obj[attr])}
                var res = obj[attr]
                if(res !== undefined){
                    if(typeof res == "function"){
                        var f = function(){
                            // In function, "this" is set to the object
                            return res.apply(obj, arguments)
                        }
                        f.$infos = {
                            __name__: attr,
                            __qualname__: attr
                        }
                        return f
                    }else{
                        return $B.$JS2Py(res)
                    }
                }
                if(_default !== undefined){return _default}
                throw _b_.AttributeError.$factory('object has no attribute ' + rawname)
            }
        }
    }

    switch(attr) {
      case '__call__':
          if(typeof obj == 'function'){
              var res = function(){return obj.apply(null, arguments)}
              res.__class__ = method_wrapper
              res.$infos = {__name__: "__call__"}
              return res
          }
          break
      case '__class__':
          // attribute __class__ is set for all Python objects
          return klass
      case '__dict__':
          if(is_class){
              return $B.mappingproxy.$factory(obj) // defined in py_dict.js
          }else{
              if(obj.hasOwnProperty(attr)){
                  return obj[attr]
              }else if(obj.$infos){
                  if(obj.$infos.hasOwnProperty("__dict__")){
                      return obj.$infos.__dict__
                  }else if(obj.$infos.hasOwnProperty("__func__")){
                      return obj.$infos.__func__.$infos.__dict__
                  }
              }
              return $B.obj_dict(obj)
          }
      case '__doc__':
          // for builtins objects, use $B.builtins_doc
          for(var i = 0; i < builtin_names.length; i++){
              if(obj === _b_[builtin_names[i]]){
                  _get_builtins_doc()
                  return $B.builtins_doc[builtin_names[i]]
              }
          }
          break
      case '__mro__':
          if(obj.$is_class){
              // The attribute __mro__ of class objects doesn't include the
              // class itself
              return _b_.tuple.$factory([obj].concat(obj.__mro__))
          }
          break
      case '__subclasses__':
          if(klass.$factory || klass.$is_class){
              var subclasses = obj.$subclasses || []
              return function(){return subclasses}
          }
          break
      case '$$new':
          if(klass === $B.JSObject && obj.js_func !== undefined){
              return $B.JSConstructor.$factory(obj)
          }
          break
    }

    if(typeof obj == 'function') {
        var value = obj[attr]
        if(value !== undefined){
            if(attr == '__module__'){
                return value
            }
        }
    }

    if(klass.$native){
        if($test){console.log("native class", klass, klass[attr])}
        if(klass[attr] === undefined){
            var object_attr = _b_.object[attr]
            if($test){console.log("object attr", object_attr)}
            if(object_attr !== undefined){klass[attr] = object_attr}
            else{
                if($test){console.log("obj[attr]", obj[attr])}
                var attrs = obj.__dict__
                if(attrs &&
                        (object_attr = attrs.$string_dict[attr]) !== undefined){
                    return object_attr
                }
                if(_default === undefined){
                    attr_error(attr, klass.$infos.__name__)
                }
                return _default
            }
        }
        if(klass.$descriptors && klass.$descriptors[attr] !== undefined){
            return klass[attr](obj)
        }
        if(typeof klass[attr] == 'function'){
            var func = klass[attr]
            // new is a static method
            if(attr == '__new__'){func.$type = "staticmethod"}

            if(func.$type == "staticmethod"){return func}

            var self = klass[attr].__class__ == $B.method ? klass : obj
            function method(){
                var args = [self]
                for(var i = 0, len = arguments.length; i < len; i++){
                    args.push(arguments[i])
                }
                return klass[attr].apply(null, args)
            }
            method.__class__ = $B.method
            method.$infos = {
                __func__: func,
                __name__: attr,
                __self__: self,
                __qualname__: klass.$infos.__name__ + "." + attr
            }
            return method
        }
        attr_error(rawname, klass.$infos.__name__)
        return klass[attr]
    }

    var mro, attr_func

    if(is_class){
        attr_func = _b_.type.__getattribute__ // XXX metaclass
    }else{
        attr_func = klass.__getattribute__
        if(attr_func === undefined){
            var mro = klass.__mro__
            if(mro === undefined){
                console.log(obj, attr, "no mro, klass", klass)
            }
            for(var i = 0, len = mro.length; i < len; i++){
                attr_func = mro[i]['__getattribute__']
                if(attr_func !== undefined){break}
            }
        }
    }
    if(typeof attr_func !== 'function'){
        console.log(attr + ' is not a function ' + attr_func, klass)
    }
    if($test){console.log("attr_func is odga", attr_func === odga, obj[attr])}
    if(attr_func === odga){
        var res = obj[attr]
        if(res === null){return null}
        else if(res === undefined && obj.hasOwnProperty(attr)){
            return res
        }else if(res !== undefined){
            if(res.__set__ === undefined || res.$is_class){
                if($test){console.log("return", res, res+'',
                    res.__set__, res.$is_class)}
                return res
            }
        }
    }

    try{
        var res = attr_func(obj, attr)
        if($test){console.log("result of attr_func", res)}
    }catch(err){
        if(_default !== undefined){
            return _default
        }
        throw err
    }

    if(res !== undefined){return res}
    if(_default !== undefined){return _default}

    var cname = klass.$infos.__name__
    if(is_class){cname = obj.$infos.__name__}

    attr_error(rawname, cname)
}

//globals() (built in function)

function globals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('globals', 0, arguments)
    return $B.obj_dict($B.last($B.frames_stack)[3])
}

function hasattr(obj,attr){
    check_no_kw('hasattr', obj, attr)
    check_nb_args('hasattr', 2, arguments)
    try{$B.$getattr(obj,attr); return true}
    catch(err){return false}
}

var hash_cache = {}
function hash(obj){
    check_no_kw('hash', obj)
    check_nb_args('hash', 1, arguments)

    if(obj.__hashvalue__ !== undefined){return obj.__hashvalue__}
    if(isinstance(obj, _b_.bool)){return _b_.int.$factory(obj)}
    if(isinstance(obj, _b_.int)){return obj.valueOf()}
    if(obj.$is_class ||
            obj.__class__ === _b_.type ||
            obj.__class__ === $B.Function){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    /*
    if(obj.__hash__ !== undefined) {
       return obj.__hashvalue__ = obj.__hash__()
    }
    */
    if(typeof obj == "string"){
        var cached = hash_cache[obj]
        if(cached !== undefined){return cached}
        else{
            return hash_cache[obj] = _b_.str.__hash__(obj)
        }
    }

    var hashfunc = $B.$getattr(obj, '__hash__', _b_.None)

    if(hashfunc == _b_.None){
        throw _b_.TypeError.$factory("unhashable type: '" +
                $B.class_name(obj) + "'", 'hash')
    }

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

    if(hashfunc.$infos.__func__ === _b_.object.__hash__){
        if($B.$getattr(obj,'__eq__').$infos.__func__ !== _b_.object.__eq__){
            throw _b_.TypeError.$factory("unhashable type: '" +
                $B.class_name(obj) + "'", 'hash')
        }else{
            return _b_.object.__hash__(obj)
        }
    }else{
        return hashfunc()
    }
}

function _get_builtins_doc(){
    if($B.builtins_doc === undefined){
        // Load builtins docstrings from file builtins_doctring.js
        var url = $B.brython_path
        if(url.charAt(url.length - 1) == '/'){
            url = url.substr(0, url.length - 1)
        }
        url += '/builtins_docstrings.js'
        var f = _b_.open(url)
        eval(f.$content)
        $B.builtins_doc = docs
    }
}

function help(obj){
    if(obj === undefined){obj = 'help'}

    // if obj is a builtin, lets take a shortcut, and output doc string
    if(typeof obj == 'string' && _b_[obj] !== undefined) {
        _get_builtins_doc()
        var _doc = $B.builtins_doc[obj]
        if(_doc !== undefined && _doc != ''){
             _b_.print(_doc)
             return
        }
    }
    // If obj is a built-in object, also use builtins_doc
    for(var i = 0; i < builtin_names.length; i++){
        if(obj === _b_[builtin_names[i]]){
            _get_builtins_doc()
            _b_.print(_doc = $B.builtins_doc[builtin_names[i]])
        }
    }
    if(typeof obj == 'string'){
        $B.$import("pydoc");
        var pydoc = $B.imported["pydoc"]
        $B.$getattr($B.$getattr(pydoc, "help"), "__call__")(obj)
        return
    }
    try{return $B.$getattr(obj, '__doc__')}
    catch(err){return ''}
}

help.__repr__ = help.__str__ = function(){
    return "Type help() for interactive help, or help(object) " +
        "for help about object."
}

function hex(x) {
    check_no_kw('hex', x)
    check_nb_args('hex', 1, arguments)
    return $builtin_base_convert_helper(x, 16)
}

function id(obj) {
   check_no_kw('id', obj)
   check_nb_args('id', 1, arguments)
   if(isinstance(obj, [_b_.str, _b_.int, _b_.float]) &&
           !isinstance(obj, $B.long_int)){
       return $B.$getattr(_b_.str.$factory(obj), '__hash__')()
   }else if(obj.$id !== undefined){return obj.$id}
   else{return obj.$id = $B.UUID()}
}

// The default __import__ function is a builtin
function __import__(mod_name, globals, locals, fromlist, level) {
    // TODO : Install $B.$__import__ in builtins module to avoid nested call
    var $ = $B.args('__import__', 5,
        {name: null, globals: null, locals: null, fromlist: null, level: null},
        ['name', 'globals', 'locals', 'fromlist', 'level'],
        arguments,
        {globals:None, locals:None, fromlist:_b_.tuple.$factory(), level:0},
        null, null)
    return $B.$__import__($.name, $.globals, $.locals, $.fromlist)
}

//not a direct alias of prompt: input has no default value
function input(msg) {
    var stdin = ($B.imported.sys && $B.imported.sys.stdin || $B.stdin);
    if(stdin.__original__){return prompt(msg || '') || ''}
    msg = msg || ""
    if(msg){
        $B.stdout.write(msg)
    }
    stdin.msg = msg
    var val = $B.$getattr(stdin, 'readline')()
    val = val.split('\n')[0]
    if(stdin.len === stdin.pos){
        $B.$getattr(stdin, 'close')()
    }
    // $B.stdout.write(val+'\n'); // uncomment if we are to mimic the behavior in the console
    return val
}

function isinstance(obj, cls){
    check_no_kw('isinstance', obj, cls)
    check_nb_args('isinstance', 2, arguments)

    if(obj === null){return cls === None}
    if(obj === undefined){return false}
    if(cls.constructor === Array){
        for(var i = 0; i < cls.length; i++){
            if(isinstance(obj, cls[i])){return true}
        }
        return false
    }
    if(cls === _b_.int && (obj === True || obj === False)){return True}

    if(cls === _b_.bool){
        switch(typeof obj){
            case "string":
                return false
            case "number":
                return false
            case "boolean":
                return true
        }
    }
    var klass = obj.__class__

    if(klass == undefined){
        if(typeof obj == 'string'){
            if(cls == _b_.str){return true}
            else if($B.builtin_classes.indexOf(cls) > -1){
                return false
            }
        }else if(obj.contructor === Number && Number.isFinite(obj)){
            if(cls == _b_.float){return true}
            else if($B.builtin_classes.indexOf(cls) > -1){
                return false
            }
        }else if(typeof obj == 'number' && Number.isFinite(obj)){
            if(Number.isFinite(obj) && cls == _b_.int){return true}
            else if($B.builtin_classes.indexOf(cls) > -1){
                return false
            }
        }
        klass = $B.get_class(obj)
    }

    if(klass === undefined){return false}

    // Return true if one of the parents of obj class is cls
    // If one of the parents is the class used to inherit from str, obj is an
    // instance of str ; same for list

    function check(kl, cls){
        if(kl === cls){return true}
        else if(cls === _b_.str && kl === $B.StringSubclass){return true}
        else if(cls === _b_.float && kl === $B.FloatSubclass){return true}
        else if(cls === _b_.int && kl === $B.IntSubclass){return true}
    }
    if(check(klass, cls)){return true}
    var mro = klass.__mro__
    for(var i = 0; i < mro.length; i++){
       if(check(mro[i], cls)){return true}
    }

    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = $B.$getattr(cls.__class__ || $B.get_class(cls),
        '__instancecheck__', _b_.None)
    if(instancecheck !== _b_.None){
        return instancecheck(cls, obj)
    }
    return false
}

function issubclass(klass,classinfo){
    check_no_kw('issubclass', klass, classinfo)
    check_nb_args('issubclass', 2, arguments)

    if(!klass.__class__ ||
            !(klass.$factory !== undefined || klass.$is_class !== undefined)){
        throw _b_.TypeError.$factory("issubclass() arg 1 must be a class")
    }
    if(isinstance(classinfo, _b_.tuple)){
        for(var i = 0; i < classinfo.length; i++){
           if(issubclass(klass, classinfo[i])){return true}
        }
        return false
    }

    if(classinfo.$factory || classinfo.$is_class){
        if(klass === classinfo ||
            klass.__mro__.indexOf(classinfo) > -1){return true}
    }

    // Search __subclasscheck__ on classinfo
    var sch = $B.$getattr(classinfo, '__subclasscheck__', _b_.None)

    if(sch == _b_.None){
        return false
    }
    if(classinfo === _b_.type ||
            (classinfo.__bases__ &&
             classinfo.__bases__.indexOf(_b_.type) > -1)){
        return sch(classinfo, klass)
    }
    return sch(klass)
}

// Utility class for iterators built from objects that have a __getitem__ and
// __len__ method
var iterator_class = $B.make_class("iterator",
    function(getitem, len){
        return {
            __class__: iterator_class,
            getitem: getitem,
            len: len,
            counter: -1
        }
    }
)

iterator_class.__next__ = function(self){
    self.counter++
    if(self.len !== null && self.counter == self.len){
        throw _b_.StopIteration.$factory('')
    }
    try{return self.getitem(self.counter)}
    catch(err){throw _b_.StopIteration.$factory('')}
}

callable_iterator = $B.make_class("callable_iterator",
    function(func, sentinel){
        return {
            __class__: callable_iterator,
            func: func,
            sentinel: sentinel
        }
    }
)

callable_iterator.__iter__ = function(self){
    return self
}

callable_iterator.__next__ = function(self){
    var res = self.func()
    if($B.rich_comp("__eq__", res, self.sentinel)){
        throw _b_.StopIteration.$factory()
    }
    return res
}

$B.$iter = function(obj, sentinel){
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    if(sentinel === undefined){
        try{
            var _iter = $B.$getattr(obj, '__iter__')
            _iter = $B.$call(_iter)
        }catch(err){
            var gi = $B.$getattr(obj, '__getitem__', -1),
                ln = $B.$getattr(obj, '__len__', -1)
            if(gi !== -1){
                if(ln !== -1){
                    var len = $B.$getattr(ln, '__call__')()
                    return iterator_class.$factory(gi, len)
                }else{
                    return iterator_class.$factory(gi, null)
                }
          }
          throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
              "' object is not iterable")
        }
        var res = $B.$call(_iter)()
        try{$B.$getattr(res, '__next__')}
        catch(err){
            if(isinstance(err, _b_.AttributeError)){throw _b_.TypeError.$factory(
                "iter() returned non-iterator of type '" +
                 $B.class_name(res) + "'")}
        }
        return res
    }else{
        console.log("iter with sentinel")
        return callable_iterator.$factory(obj, sentinel)
    }
}

function iter(){
    // Function exposed to Brython programs, with arguments control
    var $ = $B.args('iter', 1, {obj: null}, ['obj'], arguments,
        {}, 'args', 'kw'),
        sentinel
    if($.args.length > 0){
        var sentinel = $.args[0]
    }
    return $B.$iter($.obj, sentinel)
}

function len(obj){
    check_no_kw('len', obj)
    check_nb_args('len', 1, arguments)

    try{return $B.$getattr(obj, '__len__')()}
    catch(err){
        throw _b_.TypeError.$factory("object of type '" +
            $B.class_name(obj) + "' has no len()")
    }
}

function locals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('locals', 0, arguments)
    return $B.obj_dict($B.last($B.frames_stack)[1])
}


var map = $B.make_class("map",
    function(){
        var $ = $B.args('map', 2, {func: null, it1:null}, ['func', 'it1'],
            arguments, {}, 'args', null),
            func = $B.$call($.func)
        var iter_args = [$B.$iter($.it1)]
        $.args.forEach(function(item){
            iter_args.push($B.$iter(item))
        })
        var obj = {
            __class__: map,
            args: iter_args,
            func: func
        }
        return obj
    }
)

map.__iter__ = function (self){return self}
map.__next__ = function(self){
    var args = []
    for(var i = 0; i < self.args.length; i++){
        args.push(next(self.args[i]))
    }
    return self.func.apply(null, args)
}

$B.set_func_names(map, "builtins")


function $extreme(args, op){ // used by min() and max()
    var $op_name = 'min'
    if(op === '__gt__'){$op_name = "max"}

    if(args.length == 0){
        throw _b_.TypeError.$factory($op_name +
            " expected 1 arguments, got 0")
    }
    var last_arg = args[args.length - 1],
        nb_args = args.length,
        has_default = false,
        func = false
    if(last_arg.$nat == 'kw'){
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
                    throw _b_.TypeError.$factory("'" + attr +
                        "' is an invalid keyword argument for this function")
            }
        }
    }
    if(!func){func = function(x){return x}}
    if(nb_args == 0){
        throw _b_.TypeError.$factory($op_name + " expected 1 argument, got 0")
    }else if(nb_args == 1){
        // Only one positional argument : it must be an iterable
        var $iter = iter(args[0]),
            res = null
        while(true){
            try{
                var x = next($iter)
                if(res === null || $B.$bool($B.$getattr(func(x), op)(func(res)))){
                    res = x
                }
            }catch(err){
                if(err.__class__ == _b_.StopIteration){
                    if(res === null){
                        if(has_default){return default_value}
                        else{throw _b_.ValueError.$factory($op_name +
                            "() arg is an empty sequence")
                        }
                    }else{return res}
                }
                throw err
            }
        }
    }else{
        if(has_default){
           throw _b_.TypeError.$factory("Cannot specify a default for " +
               $op_name + "() with multiple positional arguments")
        }
        var res = null
        for(var i = 0; i < nb_args; i++){
            var x = args[i]
            if(res === null || $B.$bool($B.$getattr(func(x), op)(func(res)))){
                res = x
            }
        }
        return res
    }
}

function max(){
    return $extreme(arguments, '__gt__')
}

var memoryview = $B.make_class('memoryview',
    function(obj){
        check_no_kw('memoryview', obj)
        check_nb_args('memoryview', 1, arguments)
        if(obj.__class__ === memoryview){return obj}
        if($B.get_class(obj).$buffer_protocol){
            return {
                __class__: memoryview,
                obj: obj,
                // XXX fix me : next values are only for bytes and bytearray
                format: 'B',
                itemsize: 1,
                ndim: 1,
                shape: _b_.tuple.$factory([_b_.len(obj)]),
                strides: _b_.tuple.$factory([1]),
                suboffsets: _b_.tuple.$factory([]),
                c_contiguous: true,
                f_contiguous: true,
                contiguous: true
            }
        }else{
            throw _b_.TypeError.$factory("memoryview: a bytes-like object " +
                "is required, not '" + $B.class_name(obj) + "'")
        }
    }
)
memoryview.__eq__ = function(self, other){
    if(other.__class__ !== memoryview){return false}
    return $B.$getattr(self.obj, '__eq__')(other.obj)
}

memoryview.__getitem__ = function(self, key){
    if(isinstance(key, _b_.int)){
        var start = key * self.itemsize
        if(self.format == "I"){
            var res = self.obj.source[start],
                coef = 256
            for(var i = 1; i < 4; i++){
                res += self.obj.source[start + i] * coef
                coef *= 256
            }
            return res
        }else if("B".indexOf(self.format) > -1){
            return self.obj.source[key]
        }else{
            // fix me
            return self.obj.source[key]
        }
    }
    // fix me : add slice support for other formats than B
    var res = self.obj.__class__.__getitem__(self.obj, key)
    if(key.__class__ === _b_.slice){return memoryview.$factory(res)}
}

memoryview.__len__ = function(self){
    return len(self.obj) / self.itemsize
}

memoryview.cast = function(self, format){
    switch(format){
        case "B":
            return memoryview.$factory(self.obj)
        case "I":
            var res = memoryview.$factory(self.obj),
                objlen = len(self.obj)
            res.itemsize = 4
            res.format = "I"
            if(objlen % 4 != 0){
                throw _b_.TypeError.$factory("memoryview: length is not " +
                    "a multiple of itemsize")
            }
            return res
    }
}
memoryview.hex = function(self){
    var res = '',
        bytes = _b_.bytes.$factory(self)
    bytes.source.forEach(function(item){
        res += item.toString(16)
    })
    return res
}
memoryview.tobytes = function(self){
    return _b_.bytes.$factory(self.obj)
}
memoryview.tolist = function(self){
    if(self.itemsize == 1){
        return _b_.list.$factory(_b_.bytes.$factory(self.obj))
    }else if(self.itemsize == 4){
        if(self.format == "I"){
            var res = []
            for(var i = 0; i < self.obj.source.length; i += 4){
                var item = self.obj.source[i],
                    coef = 256
                for(var j = 1; j < 4; j++){
                    item += coef * self.obj.source[i + j]
                    coef *= 256
                }
                res.push(item)
            }
            return res
        }
    }
}

$B.set_func_names(memoryview, "builtins")

function min(){
    return $extreme(arguments, '__lt__')
}

function next(obj){
    check_no_kw('next', obj)
    var missing = {},
        $ = $B.args("next", 2, {obj: null, def: null}, ['obj', 'def'],
            arguments, {def: missing}, null, null)
    var ga = $B.$getattr(obj, '__next__')
    if(ga !== undefined){
        try{
            return $B.$call(ga)()
        }catch(err){
            if(err.__class__ === _b_.StopIteration &&
                    $.def !== missing){
                return $.def
            }
            throw err
        }
    }
    throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
        "' object is not an iterator")
}

var NotImplementedType = $B.make_class("NotImplementedType",
    function(){return NotImplemented}
)
NotImplementedType.__repr__ = NotImplementedType.__str__ = function(self){
    return "NotImplemented"
}
var NotImplemented = {
    __class__: NotImplementedType
}

function $not(obj){return !$B.$bool(obj)}

function oct(x) {return $builtin_base_convert_helper(x, 8)}

function ord(c) {
    check_no_kw('ord', c)
    check_nb_args('ord', 1, arguments)
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    if(typeof c == 'string'){
        if(c.length == 1){return c.charCodeAt(0)} // <= strobj.charCodeAt(index)
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
    }
    switch($B.get_class(c)){
      case _b_.str:
        if(c.length == 1){return c.charCodeAt(0)} // <= strobj.charCodeAt(index)
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
      case _b_.bytes:
      case _b_.bytearray:
        if(c.source.length == 1){return c.source[0]} // <= strobj.charCodeAt(index)
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.source.length + ' found')
      default:
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            $B.class_name(c) + ' was found')
    }
}

function pow() {
    var $ns = $B.args('pow', 3, {x: null, y: null, z: null},['x', 'y', 'z'],
        arguments, {z: null}, null, null)
    var x = $ns['x'], y = $ns['y'], z = $ns['z']
    var res = $B.$getattr(x, '__pow__')(y, z)
    if(z === null){return res}
    else{
        if(x != _b_.int.$factory(x) || y != _b_.int.$factory(y)){
            throw _b_.TypeError.$factory("pow() 3rd argument not allowed " +
                "unless all arguments are integers")
        }
        return $B.$getattr(res, '__mod__')(z)
    }
}

function $print(){
    var $ns = $B.args('print', 0, {}, [], arguments,
        {}, 'args', 'kw')
    var ks = $ns['kw'].$string_dict
    var end = (ks['end'] === undefined || ks['end'] === None) ? '\n' : ks['end'],
        sep = (ks['sep'] === undefined || ks['sep'] === None) ? ' ' : ks['sep'],
        file = ks['file'] === undefined ? $B.stdout : ks['file'],
        args = $ns['args']
    var items = []
    args.forEach(function(arg){
        items.push(_b_.str.$factory(arg))
    })
    // Special handling of \a and \b
    var res = items.join(sep) + end
    res = res.replace(new RegExp("\u0007", "g"), "").
              replace(new RegExp("(.)\b", "g"), "")
    $B.$getattr(file, 'write')(res)
    var flush = $B.$getattr(file, 'flush', None)
    if(flush !== None){
        flush()
    }
    return None
}
$print.__name__ = 'print'
$print.is_func = true

// property (built in function)
var property = $B.make_class("property")

property.__init__ = function(self, fget, fset, fdel, doc) {

    self.__doc__ = doc || ""
    self.$type = fget.$type
    self.fget = fget
    self.fset = fset
    self.fdel = fdel

    if(fget && fget.$attrs){
        for(var key in fget.$attrs){
            self[key] = fget.$attrs[key]
        }
    }

    self.__get__ = function(self, obj, objtype) {
        if(obj === undefined){return self}
        if(self.fget === undefined){
            throw _b_.AttributeError.$factory("unreadable attribute")
        }
        return $B.$call(self.fget)(obj)
    }
    if(fset !== undefined){
        self.__set__ = function(self, obj, value){
            if(self.fset === undefined){
                throw _b_.AttributeError.$factory("can't set attribute")
            }
            $B.$getattr(self.fset, '__call__')(obj, value)
        }
    }
    self.__delete__ = fdel;

    self.getter = function(fget){
        return property.$factory(fget, self.fset, self.fdel, self.__doc__)
    }
    self.setter = function(fset){
        return property.$factory(self.fget, fset, self.fdel, self.__doc__)
    }
    self.deleter = function(fdel){
        return property.$factory(self.fget, self.fset, fdel, self.__doc__)
    }

}
$B.set_func_names(property, "builtins")

function quit(){
    throw _b_.SystemExit
}
quit.__repr__ = quit.__str__ = function(){
    return "Use quit() or Ctrl-Z plus Return to exit"
}

function repr(obj){
    check_no_kw('repr', obj)
    check_nb_args('repr', 1, arguments)

    if(obj.$is_class || obj.$factory){
        // obj is a class
        // In this case, repr() doesn't use the attribute __repr__ of the
        // class or its subclasses, but the attribute __repr__ of the
        // class metaclass (usually "type")
        // The metaclass is the attribute __class__ of the class
        var func = _b_.type.__getattribute__(obj.__class__, '__repr__')
        return func(obj)
    }
    var func = $B.$getattr(obj, '__repr__')
    if(func !== undefined){
        return $B.$call(func)()
    }
    throw _b_.AttributeError.$factory("object has no attribute __repr__")
}

var reversed = $B.make_class("reversed",
    function(seq){
        // Return a reverse iterator. seq must be an object which has a
        // __reversed__() method or supports the sequence protocol (the __len__()
        // method and the __getitem__() method with integer arguments starting at
        // 0).

        check_no_kw('reversed', seq)
        check_nb_args('reversed', 1, arguments)

        var rev_method = $B.$getattr(seq, '__reversed__', null)
        if(rev_method !== null){
            //console.log("rev method", rev_method)
            return rev_method()
        }

        try{
            var res = {
                __class__: reversed,
                $counter : $B.$getattr(seq, '__len__')(),
                getter: $B.$getattr(seq, '__getitem__')
            }
            return res
        }catch(err){
            throw _b_.TypeError.$factory("argument to reversed() must be a sequence")
        }
    }
)

reversed.__iter__ = function(self){return self}
reversed.__next__ = function(self){
    self.$counter--
    if(self.$counter < 0){throw _b_.StopIteration.$factory('')}
    return self.getter(self.$counter)
}

$B.set_func_names(reversed, "builtins")

function round(arg,n){
    var $ = $B.args('round', 2, {number: null, ndigits: null},
        ['number', 'ndigits'], arguments, {ndigits: None}, null, null),
        arg = $.number, n = $.ndigits

    if(!isinstance(arg,[_b_.int, _b_.float])){
        if(!hasattr(arg, '__round__'))
            throw _b_.TypeError.$factory("type " + arg.__class__ +
                " doesn't define __round__ method")
        if(n === undefined){return $B.$getattr(arg, '__round__')()}
        else{return $B.$getattr(arg, '__round__')(n)}
    }

    if(isinstance(arg, _b_.float) &&
            (arg.value === Infinity || arg.value === -Infinity)) {
        throw _b_.OverflowError.$factory("cannot convert float infinity to integer")
    }

    if(n === None){
        var floor = Math.floor(arg)
        var diff = Math.abs(arg - floor)
        if(diff == 0.5){
            if(floor % 2){return Math.round(arg)}else{return Math.floor(arg)}
        }else{
            return _b_.int.$factory(Math.round(arg))
        }
    }
    if(!isinstance(n, _b_.int)){throw _b_.TypeError.$factory(
        "'" + n.__class__ + "' object cannot be interpreted as an integer")}
    var mult = Math.pow(10, n)
    if(isinstance(arg, _b_.float)) {
        return _b_.float.$factory(_b_.int.__truediv__(
            Number(Math.round(arg.valueOf() * mult)), mult))
    }else{
        return _b_.int.$factory(_b_.int.__truediv__(
            Number(Math.round(arg.valueOf() * mult)), mult))
    }
}

function setattr(){

    var $ = $B.args('setattr', 3, {obj: null, attr: null, value: null},
        ['obj', 'attr', 'value'], arguments, {}, null, null),
        obj = $.obj, attr = $.attr, value = $.value
    if(!(typeof attr == 'string')){
        throw _b_.TypeError.$factory("setattr(): attribute name must be string")
    }
    return $B.$setattr(obj, attr, value)
}

$B.$setattr = function(obj, attr, value){

    // Used in the code generated by py2js. Avoids having to parse the
    // since we know we will get the 3 values
    var $test = false //attr === "foo"

    if($B.aliased_names[attr]){
        attr = '$$' + attr
    }else if(attr == '__dict__'){
        // set attribute __dict__
        // remove previous attributes
        if(! isinstance(value, _b_.dict)){
            throw _b_.TypeError.$factory("__dict__ must be set to a dictionary, " +
                "not a '" + $B.class_name(value) + "'")
        }
        if(obj.$infos){
            obj.$infos.__dict__ = value
            return None
        }
        obj.__dict__ = value
        return None
    }else if(attr == "__class__"){
        // __class__ assignment only supported for heap types or ModuleType
        // subclasses
        function error(msg){
            throw _b_.TypeError.$factory(msg)
        }
        if(value.__class__){
            if(value.__module__ == "builtins"){
                error("__class__ assignement only " +
                "supported for heap types or ModuleType subclasses")
            }else if(Array.isArray(value.__bases__)){
                for(var i = 0; i < value.__bases__.length; i++){
                    if(value.__bases__[i].__module__ == "builtins"){
                        error("__class__ assignment: '" +
                            obj.__class__.$infos.__name__ + "' object layout " +
                            "differs from '" + value.__class__.$infos.__name__ +
                            "'")
                    }
                }
            }
        }
        obj.__class__ = value
        return None
    }
    if($test){console.log("set attr", attr, "to", obj)}
    if(obj.$factory || obj.$is_class){
        var metaclass = obj.__class__
        if($test){console.log("obj is class", metaclass, metaclass[attr])}
        if(metaclass && metaclass[attr] && metaclass[attr].__get__ &&
                metaclass[attr].__set__){
            metaclass[attr].__set__(obj, value)
            return None
        }
        obj[attr] = value
        if(attr == "__init__" || attr == "__new__"){
            // redefine the function that creates instances of the class
            obj.$factory = $B.$instance_creator(obj)
        }
        return None
    }

    var res = obj[attr],
        klass = obj.__class__ || $B.get_class(obj)

    if($test){
        console.log('set attr', attr, 'to', obj, obj[attr], 'class', klass)
    }

    if(res === undefined && klass){
        res = klass[attr]
        if(res === undefined){
            var mro = klass.__mro__,
                _len = mro.length
            for(var i = 0; i < _len; i++){
                res = mro[i][attr]
                if(res !== undefined){break}
            }
        }
    }

    if($test){
        console.log('set attr', attr, 'found in class', res)
    }

    if(res !== undefined){
        // descriptor protocol : if obj has attribute attr and this attribute
        // has a method __set__(), use it
        if(res.__set__ !== undefined){
            res.__set__(res, obj, value); return None
        }
        var rcls = res.__class__, __set1__
        if(rcls !== undefined){
            var __set1__ = rcls.__set__
            if(__set1__ === undefined){
                var mro = rcls.__mro__
                for(var i = 0, _len = mro.length; i < _len; i++){
                    __set1__ = mro[i].__set__
                    if(__set1__){
                        break
                    }
                }
            }
        }
        if(__set1__ !== undefined){
            var __set__ = $B.$getattr(res, '__set__', null)
            if(__set__ && (typeof __set__ == 'function')) {
                __set__.apply(res, [obj, value])
                return None
            }
        }else if(klass && klass.$descriptors !== undefined &&
                klass[attr] !== undefined){
            var setter = klass[attr].setter
            if(typeof setter == 'function'){
                setter(obj, value)
                return None
            }else{
                throw _b_.AttributeError.$factory('readonly attribute')
            }
        }
    }

    // Search the __setattr__ method
    var _setattr = false
    if(klass !== undefined){
        _setattr = klass.__setattr__
        if(_setattr === undefined){
            var mro = klass.__mro__
            for(var i = 0, _len = mro.length - 1; i < _len; i++){
                _setattr = mro[i].__setattr__
                if(_setattr){break}
            }
        }
    }

    // Use __slots__ if defined
    var special_attrs = ["__module__"]
    if(klass && klass.__slots__ && special_attrs.indexOf(attr) == -1 &&
            ! _setattr){
        var has_slot = false
        if(klass.__slots__.indexOf(attr) > -1){
            has_slot = true
        }else{
            for(var i = 0; i < klass.__mro__.length; i++){
                var kl = klass.__mro__[i]
                if(kl.__slots__ && kl.__slots__.indexOf(attr) > - 1){
                    has_slot = true
                    break
                }
            }
        }
        if(! has_slot){
            throw _b_.AttributeError.$factory("'"  + klass.$infos.__name__ +
            "' object has no attribute '" + attr + "'")
        }
    }
    if($test){console.log("attr", attr, "use _setattr", _setattr)}
    if(!_setattr){
        if(obj.__dict__ === undefined){
            obj[attr] = value
        }else{
            obj.__dict__.$string_dict[attr] = value
        }
    }else{
        _setattr(obj, attr, value)
    }

    return None
}

function sorted () {
    var $ = $B.args('sorted', 1, {iterable: null}, ['iterable'],
        arguments, {}, null, 'kw')
    var _list = _b_.list.$factory(iter($.iterable)),
        args = [_list]
    for(var i = 1; i < arguments.length; i++){args.push(arguments[i])}
    _b_.list.sort.apply(null, args)
    return _list
}

// staticmethod() built in function
var staticmethod = $B.make_class("staticmethod",
    function(func) {
        var f = {
            $infos: func.$infos,
            __get__: function(){
                return func
            }
        }
        f.__get__.__class__ = $B.method_wrapper
        f.__get__.$infos = func.$infos
        return f
    }
)


$B.set_func_names(staticmethod, "builtins")

// str() defined in py_string.js

function sum(iterable,start){
    var $ = $B.args('sum', 2, {iterable: null, start: null},
        ['iterable', 'start'], arguments, {start: 0}, null, null),
        iterable = $.iterable,
        start = $.start
    if(start === undefined){
        start = 0
    }else{
        if(typeof start === 'str'){
            throw _b_.TypeError.$factory("TypeError: sum() can't sum strings" +
                " [use ''.join(seq) instead]")
        }

        if(_b_.isinstance(start, _b_.bytes)){
            throw _b_.TypeError.$factory("TypeError: sum() can't sum bytes" +
                " [use b''.join(seq) instead]")
        }
    }

    var res = start,
        iterable = iter(iterable)
    while(1){
        try{
            var _item = next(iterable)
            res = $B.$getattr(res, '__add__')(_item)
        }catch(err){
           if(err.__class__ === _b_.StopIteration){
               break
           }else{throw err}
        }
    }
    return res
}

// super() built in function
$B.missing_super2 = function(obj){
    obj.$missing = true
    return obj
}

var $$super = $B.make_class("super",
    function (_type1, _type2){
        var missing2 = false
        if(Array.isArray(_type2)){
            _type2 = _type2[0]
            missing2 = true
        }

        return {__class__: $$super,
            __thisclass__: _type1,
            __self_class__: _type2,
            $missing2: missing2
        }
    }
)

$$super.__getattribute__ = function(self, attr){

    var mro = self.__thisclass__.__mro__,
        res

    var sc = self.__self_class__
    if(sc !== undefined){
        if(!sc.$is_class){
            sc = sc.__class__
        }
        // Go up its parent classes until self.__thisclass__ and use
        // the classes of its __mro__ above self.__thisclass__.
        // Is this documented anywhere ?
        var sc_mro = [sc].concat(sc.__mro__)
        for(var i = 0; i < sc_mro.length; i++){
            if(sc_mro[i] === self.__thisclass__){
                mro = sc_mro.slice(i + 1)
                break
            }
        }
    }

    if(attr == "__repr__" || attr == "__str__"){
        // Special cases
        return function(){return $$super.__repr__(self)}
    }
    var f = _b_.type.__getattribute__(mro[0], attr)

    var $test = false //attr == "__setattr__"
    if($test){console.log("super", attr, self, f)}
    if(f.$type == "staticmethod"){return f}
    else{
        if(f.__class__ === $B.method){
            // If the function is a bound method, use the underlying function
            f = f.$infos.__func__
        }
        var callable = $B.$call(f) // f might be a class object
        var method = function(){
            var res = callable(self.__self_class__, ...arguments)
            if($test){console.log("calling super", self.__self_class__, attr, f, "res", res)}
            return res
        }
        method.__class__ = $B.method
        var module
        if(f.$infos !== undefined){
            module = f.$infos.__module__
        }else if(f.__class__ === property){
            module = f.fget.$infos.__module
        }else if(f.$is_class){
            module = f.__module__
        }
        method.$infos = {
            __self__: self.__self_class__,
            __func__: f,
            __name__: attr,
            __module__: module,
            __qualname__: self.__thisclass__.$infos.__name__ + "." + attr
        }
        return method
    }

    throw _b_.AttributeError.$factory("object 'super' has no attribute '" +
        attr + "'")
}

$$super.__repr__ = $$super.__str__ = function(self){
    var res = "<super: <class '" + self.__thisclass__.$infos.__name__ + "'>"
    if(self.__self_class__ !== undefined){
        res += ', <' + self.__self_class__.__class__.$infos.__name__ + ' object>'
    }else{
        res += ', NULL'
    }
    return res + '>'
}

$B.set_func_names($$super, "builtins")

function vars(){
    var def = {},
        $ = $B.args('vars', 1, {obj: null}, ['obj'], arguments, {obj: def},
        null, null)
    if($.obj === def){
        return _b_.locals()
    }else{
        try{return $B.$getattr($.obj, '__dict__')}
        catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("vars() argument must have __dict__ attribute")
            }
            throw err
        }
    }
}

var $Reader = {
    __class__: _b_.type,
    $infos: {
        __name__: 'reader'
    }
}

$Reader.__enter__ = function(self){return self}

$Reader.__exit__ = function(self){return false}

$Reader.__iter__ = function(self){return iter(self.$lines)}

$Reader.__len__ = function(self){return self.lines.length}

$Reader.__mro__ = [object]

$Reader.close = function(self){self.closed = true}

$Reader.flush = function(self){
    return None
}

$Reader.read = function(self, nb){
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    if(nb === undefined){return self.$content}

    if(self.$content.__class__ === _b_.bytes){
        res = _b_.bytes.$factory(self.$content.source.slice(self.$counter,
            self.$counter + nb))
    }else{
        res = self.$content.substr(self.$counter - nb, nb)
    }
    self.$counter += nb
    return res
}

$Reader.readable = function(self){return true}

$Reader.readline = function(self, limit){
    // set line counter
    self.$lc = self.$lc === undefined ? -1 : self.$lc

    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }

    if(self.$lc == self.$lines.length - 1){
        return self.$bin ? _b_.bytes.$factory() : ''
    }
    self.$lc++
    var res = self.$lines[self.$lc]
    self.$counter += (self.$bin ? res.source.length : res.length)
    return res
}

$Reader.readlines = function(self, hint){
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    self.$lc = self.$lc === undefined ? -1 : self.$lc
    return self.$lines.slice(self.$lc + 1)
}

$Reader.seek = function(self, offset, whence){
    if(self.closed === True){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    if(whence === undefined){whence = 0}
    if(whence === 0){self.$counter = offset}
    else if(whence === 1){self.$counter += offset}
    else if(whence === 2){self.$counter = self.$content.length + offset}
}

$Reader.seekable = function(self){return true}

$Reader.tell = function(self){return self.$counter}

$Reader.writable = function(self){return false}

var $BufferedReader = $B.make_class('_io.BuffredReader')

$BufferedReader.__mro__ = [$Reader, object]

var $TextIOWrapper = $B.make_class('_io.TextIOWrapper')

$TextIOWrapper.__mro__ = [$Reader, object]

$B.set_func_names($TextIOWrapper, "builtins")

$B.TextIOWrapper = $TextIOWrapper

function $url_open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    var $ns = $B.args('open', 3, {file: null, mode: null, encoding: null},
        ['file', 'mode', 'encoding'], arguments,
        {mode: 'r', encoding: 'utf-8'}, 'args', 'kw'),
        $res
    for(var attr in $ns){eval('var ' + attr + '=$ns["' + attr + '"]')}
    if(args.length > 0){var mode = args[0]}
    if(args.length > 1){var encoding = args[1]}
    if(isinstance(file, $B.JSObject)){
        return $B.OpenFile.$factory(file.js, mode, encoding) // defined in py_dom.js
    }
    if(isinstance(file, _b_.str)){
        // read the file content and return an object with file object methods
        var is_binary = mode.search('b') > -1
        if($ns.file == "<string>"){console.log($ns.file, $B.file_cache[$ns.file])}
        if($B.file_cache.hasOwnProperty($ns.file)){
            var str_content = $B.file_cache[$ns.file]
            if(is_binary){
                $res =  _b_.str.encode(str_content, "utf-8")
            }else{
                $res = str_content
            }
        }else{
            if(is_binary){
                throw _b_.IOError.$factory("open() in binary mode is not supported")
            }

            var req = new XMLHttpRequest();
            req.onreadystatechange = function(){
                try{
                    var status = this.status
                    if(status == 404){
                        $res = _b_.IOError.$factory('File ' + file + ' not found')
                    }else if(status != 200){
                        $res = _b_.IOError.$factory('Could not open file ' +
                            file + ' : status ' + status)
                    }else{
                        $res = this.responseText
                    }
                }catch (err){
                    $res = _b_.IOError.$factory('Could not open file ' + file +
                        ' : error ' + err)
                }
            }
            // add fake query string to avoid caching
            var fake_qs = '?foo=' + (new Date().getTime())
            req.open('GET', file + fake_qs, false)
            req.overrideMimeType('text/plain; charset=utf-8')
            req.send()

            if($res.constructor === Error){throw $res}
        }

        if(typeof $res == "string"){
            var lines = $res.split('\n')
            for(var i = 0; i < lines.length - 1; i++){lines[i] += '\n'}
        }else{
            var lines = _b_.bytes.split($res, _b_.bytes.$factory([10]))
        }
        // return the file-like object
        var res = {
            $content: $res,
            $counter: 0,
            $lines: lines,
            closed: False,
            encoding: encoding,
            mode: mode,
            name: file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper

        return res
    }
}

var zip = $B.make_class("zip",
    function(){
        var res = {
            __class__:zip,
            items:[]
        }
        if(arguments.length == 0) return res
        var $ns = $B.args('zip', 0, {}, [], arguments, {}, 'args', 'kw')
        var _args = $ns['args']
        var args = []
        for(var i = 0; i < _args.length; i++){args.push(iter(_args[i]))}
        var rank = 0,
            items = []
        while(1){
            var line = [], flag = true
            for(var i = 0; i < args.length; i++){
                try{
                    line.push(next(args[i]))
                }catch(err){
                    if(err.__class__ == _b_.StopIteration){
                        flag = false
                        break
                    }else{throw err}
                }
            }
            if(!flag){break}
            items[rank++] = _b_.tuple.$factory(line)
        }
        res.items = items
        return res
    }
)

var $zip_iterator = $B.$iterator_class('zip_iterator')
zip.__iter__ = function(self){
    // issue #317 : iterator is not reset at each call to zip()
    return self.$iterator = self.$iterator ||
        $B.$iterator(self.items,$zip_iterator)
}

$B.set_func_names(zip, "builtins")

// built-in constants : True, False, None

function no_set_attr(klass, attr){
    if(klass[attr] !== undefined){
        throw _b_.AttributeError.$factory("'" + klass.$infos.__name__ +
            "' object attribute '" + attr + "' is read-only")
    }else{
        throw _b_.AttributeError.$factory("'" + klass.$infos.__name__ +
            "' object has no attribute '" + attr + "'")
    }
}

// True and False are the same as Javascript true and false

var True = true
var False = false

var ellipsis = $B.make_class("ellipsis",
    function(){return Ellipsis}
)
var Ellipsis = {
    __class__:ellipsis,
    __bool__: function(){return True},
}

for(var $key in $B.$comps){ // Ellipsis is not orderable with any type
    switch($B.$comps[$key]) {
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        ellipsis['__' + $B.$comps[$key] + '__'] = (function(k){
            return function(other){
                throw _b_.TypeError.$factory("unorderable types: ellipsis() " +
                    k + " " + $B.class_name(other))
            }
        })($key)
    }
}

for(var $func in Ellipsis){
    if(typeof Ellipsis[$func] == 'function'){
        Ellipsis[$func].__str__ = (function(f){
            return function(){return "<method-wrapper " + f +
                " of Ellipsis object>"
            }
        })($func)
    }
}

$B.set_func_names(ellipsis)

// add attributes to native Function
var FunctionCode = $B.make_class("function code")

var FunctionGlobals = $B.make_class("function globals")

$B.Function = {
    __class__: _b_.type,
    __code__: {__class__: FunctionCode, __name__: 'function code'},
    __globals__: {__class__: FunctionGlobals, __name__: 'function globals'},
    __mro__: [object],
    $infos: {
        __name__: 'function',
        __module__: "builtins"
    },
    $is_class: true
}

$B.Function.__delattr__ = function(self, attr){
    if(attr == "__dict__"){
        throw _b_.TypeError.$factory("can't deleted function __dict__")
    }
}

$B.Function.__dir__ = function(self){
    var infos = self.$infos || {},
        attrs = self.$attrs || {}

    return Object.keys(infos).concat(Object.keys(attrs))
}

$B.Function.__eq__ = function(self, other){
    return self === other
}

$B.Function.__get__ = function(self, obj){
    if(obj === _b_.None){
        return self
    }
    var method = function(){return self(obj, ...arguments)}
    method.__class__ = $B.method
    if(self.$infos === undefined){
        console.log("no $infos", self)
        console.log($B.last($B.frames_stack))
    }
    method.$infos = {
        __name__: self.$infos.__name__,
        __qualname__: obj.__class__.$infos.__name__ + "." + self.$infos.__name__,
        __self__: obj,
        __func__: self
    }
    return method
}

$B.Function.__getattribute__ = function(self, attr){
    // Internal attributes __name__, __module__, __doc__ etc.
    // are stored in self.$infos
    if(attr == "known_attr"){console.log("get function attr", attr, self)}
    if(!self.$infos){console.log("get attr", attr, "from function", self,
        "no $infos")}
    if(self.$infos && self.$infos[attr] !== undefined){
        if(attr == '__code__'){
            var res = {__class__: code}
            for(var attr in self.$infos.__code__){
                res[attr] = self.$infos.__code__[attr]
            }
            res.name = self.$infos.__name__
            res.filename = self.$infos.__code__.co_filename
            res.co_code = self + "" // Javascript source code
            return res
        }else if(attr == '__annotations__'){
            // annotations is stored as a Javascript object
            return $B.obj_dict(self.$infos[attr])
        }else if(self.$infos.hasOwnProperty(attr)){
            return self.$infos[attr]
        }
    }else if(self.$infos.__dict__ &&
                self.$infos.__dict__.$string_dict[attr] !== undefined){
            return self.$infos.__dict__.$string_dict[attr]
    }else if(attr == "__closure__"){
        var free_vars = self.$infos.__code__.co_freevars
        if(free_vars.length == 0){return None}
        var cells = []
        for(var i = 0; i < free_vars.length; i++){
            try{
                cells.push($B.cell.$factory($B.$check_def_free(free_vars[i])))
            }catch(err){
                // empty cell
                cells.push($B.cell.$factory(null))
            }
        }
        return _b_.tuple.$factory(cells)
    }else if(self.$attrs && self.$attrs[attr] !== undefined){
        return self.$attrs[attr]
    }else{
        return _b_.object.__getattribute__(self, attr)
    }
}

$B.Function.__repr__ = $B.Function.__str__ = function(self){
    if(self.$infos === undefined){
        return '<function ' + self.name + '>'
    }else{
        return '<function ' + self.$infos.__qualname__ + '>'
    }
}

$B.Function.__mro__ = [object]
$B.Function.__setattr__ = function(self, attr, value){
    if(attr == "__closure__"){
        throw _b_.AttributeError.$factory("readonly attribute")
    }
    if(self.$infos[attr] !== undefined){self.$infos[attr] = value}
    else{self.$attrs = self.$attrs || {}; self.$attrs[attr] = value}
}

$B.Function.$factory = function(){}

$B.set_func_names($B.Function, "builtins")

_b_.__BRYTHON__ = __BRYTHON__

$B.builtin_funcs = [
    "abs", "all", "any", "ascii", "bin", "callable", "chr", "compile",
    "delattr", "dir", "divmod", "eval", "exec", "exit", "format", "getattr",
    "globals", "hasattr", "hash", "help", "hex", "id", "input", "isinstance",
    "issubclass", "iter", "len", "locals", "max", "min", "next", "oct",
    "open", "ord", "pow", "print", "quit", "repr", "round", "setattr",
    "sorted", "sum", "vars"
]

var builtin_function = $B.builtin_function = $B.make_class("builtin_function_or_method")

builtin_function.__getattribute__ = $B.Function.__getattribute__
builtin_function.__reduce_ex__ = builtin_function.__reduce__ = function(self){
    return self.$infos.__name__
}
builtin_function.__repr__ = builtin_function.__str__ = function(self){
    return '<built-in function ' + self.$infos.__name__ + '>'
}
$B.set_func_names(builtin_function, "builtins")

var method_wrapper = $B.make_class("method_wrapper")

method_wrapper.__repr__ = method_wrapper.__str__ = function(self){
    return "<method wrapper '" + self.$infos.__name__ + "' of function object>"
}
$B.set_func_names(method_wrapper, "builtins")

var wrapper_descriptor = $B.wrapper_descriptor =
    $B.make_class("wrapper_descriptor")

wrapper_descriptor.__getattribute__ = $B.Function.__getattribute__
wrapper_descriptor.__repr__ = wrapper_descriptor.__str__ = function(self){
    return "<slot wrapper '" + self.$infos.__name__ + "' of '" +
        self.__objclass__.$infos.__name__ +"' object>"
}
$B.set_func_names(wrapper_descriptor, "builtins")

$B.builtin_classes = [
    "bool", "bytearray", "bytes", "classmethod", "complex", "dict", "enumerate",
    "filter", "float", "frozenset", "int", "list", "map", "memoryview",
    "object", "property", "range", "reversed", "set", "slice", "staticmethod",
    "str", "super", "tuple", "type", "zip"
]

var other_builtins = [
    'Ellipsis', 'False',  'None', 'True', '__debug__', '__import__',
    'copyright', 'credits', 'license', 'NotImplemented'
]

var builtin_names = $B.builtin_funcs.
    concat($B.builtin_classes).
    concat(other_builtins)

for(var i = 0; i < builtin_names.length; i++){
    var name = builtin_names[i],
        orig_name = name,
        name1 = name
    if(name == 'open'){name1 = '$url_open'}
    if(name == 'super'){name = name1 = '$$super'}
    if(name == 'eval'){name = name1 = '$$eval'}
    if(name == 'print'){name1 = '$print'}
    try{
        _b_[name] = eval(name1)
        if($B.builtin_funcs.indexOf(orig_name) > -1){
            _b_[name].__class__ = builtin_function
            // used by inspect module
            _b_[name].$infos = {
                __module__: 'builtins',
                __name__: orig_name,
                __qualname__: orig_name
            }
        }

    }
    catch(err){
        // Error for the built-in names that are not defined in this script,
        // eg int, str, float, etc.
    }
}

_b_['open'] = $url_open
_b_['print'] = $print
_b_['$$super'] = $$super

_b_.object.__init__.__class__ = wrapper_descriptor
_b_.object.__new__.__class__ = builtin_function


})(__BRYTHON__)
