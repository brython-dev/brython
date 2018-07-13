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

function check_nb_args(name, expected, got){
    // Check the number of arguments
    if(got != expected){
        if(expected == 0){
            throw _b_.TypeError.$factory(name + "() takes no argument" +
                " (" + got + " given)")
        }else{
            throw _b_.TypeError.$factory(name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + got + " given)")
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
    __name__: "NoneType",
    __module__: "builtins",
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

$B.set_func_names(NoneType, "builtins")

for(var $op in $B.$comps){ // None is not orderable with any type
    var key = $B.$comps[$op]
    switch(key){
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        NoneType['__' + key + '__'] = (function(op){
            return function(other){
            throw _b_.TypeError.$factory("unorderable types: NoneType() " +
                op + " " + $B.get_class(other).__name__ + "()")}
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

function abs(obj){
    check_nb_args('abs', 1, arguments.length)
    check_no_kw('abs', obj)
    if(isinstance(obj, _b_.int)){return _b_.int.$factory(Math.abs(obj))}
    if(isinstance(obj, _b_.float)){return _b_.float.$factory(Math.abs(obj))}
    if(hasattr(obj, '__abs__')){return getattr(obj, '__abs__')()}

    throw _b_.TypeError.$factory("Bad operand type for abs(): '" +
        $B.get_class(obj) + "'")
}

function all(obj){
    check_nb_args('all', 1, arguments.length)
    check_no_kw('all', obj)
    var iterable = iter(obj),
        ce = $B.current_exception
    while(1){
        try{
            var elt = next(iterable)
            if(!$B.$bool(elt)){return false}
        }catch(err){$B.current_exception = ce; return true}
    }
}

function any(obj){
    check_nb_args('any', 1, arguments.length)
    check_no_kw('any', obj)
    var iterable = iter(obj),
        ce = $B.current_exception
    while(1){
        try{
            var elt = next(iterable)
            if($B.$bool(elt)){return true}
        }catch(err){$B.current_exception = ce; return false}
    }
}

function ascii(obj) {
    check_nb_args('ascii', 1, arguments.length)
    check_no_kw('ascii', obj)
    var res = repr(obj), res1 = '', cp
    for(var i = 0; i < res.length; i++){
        cp = res.charCodeAt(i)
        if(cp < 128){res1 += res.charAt(i)}
        else if(cp < 256){res1 += '\\x' + cp.toString(16)}
        else{res1 += '\\u' + cp.toString(16)}
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
    check_nb_args('bin', 1, arguments.length)
    check_no_kw('bin', obj)
    if(isinstance(obj, _b_.int)){
        return $builtin_base_convert_helper(obj, 2)
    }
    return getattr(obj, '__index__')()
}

function callable(obj) {
    check_nb_args('callable', 1, arguments.length)
    check_no_kw('callable', obj)

    return hasattr(obj, '__call__')
}

function chr(i) {
    check_nb_args('chr', 1, arguments.length)
    check_no_kw('chr', i)

    if(i < 0 || i > 1114111){
        throw _b_.ValueError.$factory('Outside valid range')
    }
    return String.fromCharCode(i)
}

//classmethod() (built in class)
var classmethod = $B.make_class("classmethod",
    function(func) {
        check_nb_args('classmethod', 1, arguments.length)
        check_no_kw('classmethod', func)
        var f = function(){
                    return func.apply(null, arguments)
                }
        f.__class__ = $B.method
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
                __qualname__: cls.__name__ + "." + func.$infos.__name__
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
    return $
}


//function complex is located in py_complex.js

// built-in variable __debug__
var __debug__ = $B.debug > 0

function delattr(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has
    // a method __delete__(), use it
    check_no_kw('delattr', obj, attr)
    check_nb_args('delattr', 2, arguments.length)
    if(typeof attr != 'string'){
        throw _b_.TypeError.$factory("attribute name must be string, not '" +
            $B.get_class(attr).__name__ + "'")
    }
    var klass = $B.get_class(obj)
    var res = obj[attr]
    if(res === undefined){
        res = klass[attr]
        if(res === undefined){
            var mro = klass.__mro__
            for(var i = 0; i < mro.length; i++){
                var res = mro[i][attr]
                if(res !== undefined){break}
            }
        }
    }
    if(res !== undefined && res.__delete__ !== undefined){
        res.__delete__(res, obj, attr)
    }else{
        getattr(obj, '__delattr__')(attr)
    }
    return None
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

    check_nb_args('dir', 1, arguments.length)
    check_no_kw('dir', obj)

    var klass = obj.__class__ || $B.get_class(obj),
        ce = $B.current_exception

    if(obj.$is_class){
        // Use metaclass __dir__
        var dir_func = $B.$getattr(obj.__class__, "__dir__")
        return $B.$call(dir_func)(obj)
    }
    try{
        var res = $B.$call(getattr(obj, '__dir__'))()

        res = _b_.list.$factory(res)
        res.sort()
        return res
    }catch (err){
        // ignore, default
        console.log(err)
    }

    $B.current_exception = ce
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
   check_nb_args('divmod', 2, arguments.length)

   var klass = x.__class__ || $B.get_class(x)
   return _b_.tuple.$factory([getattr(klass, '__floordiv__')(x, y),
       getattr(klass, '__mod__')(x, y)])
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
        parent_scope,
        ce = $B.current_exception

    if(_globals === _b_.None){
        if(current_locals_id == current_globals_id){
            locals_id = globals_id
        }

        var local_scope = {
            module: globals_id,
            id: current_locals_id,
            binding: {},
            bindings: {}
        }
        for(var attr in current_frame[1]){
            local_scope.binding[attr] = true
            local_scope.bindings[attr] = true
        }
        var global_scope = {
            module: globals_id,
            id: current_globals_id,
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
                _globals.__class__.__name__)
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
            ex = ''
        ex += 'var $locals_' + current_globals_id + '=gobj;' // needed for generators
        ex += 'var $locals_' + globals_id + '=gobj;'
        eval(ex)
    }else{
        if(_globals.$jsobj){var items = _globals.$jsobj}
        else{var items = _globals.$string_dict}
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
                ex += '$locals_' + locals_id + '["' + attr +
                    '"] = current_frame[1]["' + attr + '"];'
            }
            eval(ex)
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

    $B.current_exception = ce

    var root = $B.py2js(src, globals_id, locals_id, parent_scope),
        js, gns, lns

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
                current_frame[1][attr] = lns[attr]
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
                current_frame[3][attr] = gns[attr]
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
        check_nb_args('filter', 2, arguments.length)

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
  var fmt = getattr(args.value, '__format__', null)
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

$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments

    var rawname = attr
    if($B.aliased_names[attr]){attr = '$$' + attr}
    if(obj===undefined){
        console.log("attr", attr, "of obj undefined", $B.last($B.frames_stack))
    }
    var is_class = obj.$is_class || obj.$factory

    var klass = obj.__class__

    var $test = false //attr == "append"
    // Shortcut for classes without parents
    if(klass !== undefined && klass.__bases__ && klass.__bases__.length == 0){
        if(obj.hasOwnProperty(attr)){
            return obj[attr]
        }else if(klass.hasOwnProperty(attr)){
            if(typeof klass[attr] != "function" && attr != "__dict__" &&
                    klass[attr].__get__ === undefined){
                return klass[attr]
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
            if($test){console.log("from getclass", klass)}
        }
    }

    if(klass === undefined){
        // for native JS objects used in Python code
        if(obj.hasOwnProperty(attr)){
            if(typeof obj[attr] == "function"){
                return function(){
                    // In function, "this" is set to the object
                    return obj[attr].apply(obj, arguments)
                }
            }else{
                return $B.$JS2Py(obj[attr])
            }
        }
        if(_default !== undefined){return _default}
        throw _b_.AttributeError.$factory('object has no attribute ' + rawname)
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
        // attribute __dict__ returns a dictionary wrapping obj
        return $B.obj_dict(obj) // defined in py_dict.js
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
        if(klass[attr] === undefined){
            var object_attr = _b_.object[attr]
            if(object_attr !== undefined){klass[attr] = object_attr}
            else{
                if(_default === undefined){
                    attr_error(attr, klass.__name__)
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
                return klass[attr](self, ...arguments)
            }
            method.__class__ = $B.method
            method.$infos = {
                __func__: func,
                __name__: attr,
                __self__: self,
                __qualname__: klass.__name__ + "." + attr
            }
            return method
        }
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
            if(res.__set__ === undefined || res.$is_class)
            return res
        }
    }else if($test){
        console.log("use attr_func", attr_func)
    }

    try{
        var ce = $B.current_exception
        var res = attr_func(obj, attr)
    }
    catch(err){
        if(_default !== undefined){
            $B.current_exception = ce
            return _default
        }
        throw err
    }

    if(res !== undefined){return res}
    if(_default !== undefined){return _default}

    var cname = klass.__name__
    if(is_class){cname = obj.__name__}

    attr_error(rawname, cname)
}

//globals() (built in function)

function globals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('globals', 0, arguments.length)
    return $B.obj_dict($B.last($B.frames_stack)[3])
}

function hasattr(obj,attr){
    check_no_kw('hasattr', obj, attr)
    check_nb_args('hasattr', 2, arguments.length)
    var ce = $B.current_exception
    try{getattr(obj,attr);return true}
    catch(err){$B.current_exception = ce;return false}
}

function hash(obj){
    check_no_kw('hash', obj)
    check_nb_args('hash', 1, arguments.length)

    if(obj.__hashvalue__ !== undefined){return obj.__hashvalue__}
    if(isinstance(obj, _b_.int)){return obj.valueOf()}
    if(isinstance(obj, _b_.bool)){return _b_.int.$factory(obj)}
    if(obj.$is_class ||
            obj.__class__ === _b_.type ||
            obj.__class__ === $B.Function){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    if(obj.__hash__ !== undefined) {
       return obj.__hashvalue__ = obj.__hash__()
    }
    var hashfunc = getattr(obj, '__hash__', _b_.None)

    if(hashfunc == _b_.None){
        throw _b_.TypeError.$factory("unhashable type: '" +
                $B.get_class(obj).__name__ + "'", 'hash')
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
        if(getattr(obj,'__eq__').$infos.__func__ !== _b_.object.__eq__){
            throw _b_.TypeError.$factory("unhashable type: '" +
                $B.get_class(obj).__name__ + "'", 'hash')
        }else{
            return _b_.object.__hash__(obj)
        }
    }else{
        return obj.__hashvalue__ = hashfunc()
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
        getattr(getattr(pydoc, "help"), "__call__")(obj)
        return
    }
    var ce = $B.current_exception
    try{return getattr(obj, '__doc__')}
    catch(err){$B.current_exception = ce;return ''}
}

help.__repr__ = help.__str__ = function(){
    return "Type help() for interactive help, or help(object) " +
        "for help about object."
}

function hex(x) {
    check_no_kw('hex', x)
    check_nb_args('hex', 1, arguments.length)
    return $builtin_base_convert_helper(x, 16)
}

function id(obj) {
   check_no_kw('id', obj)
   check_nb_args('id', 1, arguments.length)
   if(isinstance(obj, [_b_.str, _b_.int, _b_.float]) &&
           !isinstance(obj, $B.long_int)){
       return getattr(_b_.str.$factory(obj), '__hash__')()
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
    var val = _b_.getattr(stdin, 'readline')()
    val = val.split('\n')[0]
    if(stdin.len === stdin.pos){
        _b_.getattr(stdin, 'close')()
    }
    // $B.stdout.write(val+'\n'); // uncomment if we are to mimic the behavior in the console
    return val
}

function isinstance(obj, cls){
    check_no_kw('isinstance', obj, cls)
    check_nb_args('isinstance', 2, arguments.length)

    if(obj === null){return cls === None}
    if(obj === undefined){return false}
    if(cls.constructor === Array){
        for(var i = 0; i < cls.length; i++){
            if(isinstance(obj, cls[i])){return true}
        }
        return false
    }
    if(cls === _b_.int && (obj === True || obj === False)){return True}

    var klass = obj.__class__

    if(klass == undefined){
        if(typeof obj == 'string' && cls == _b_.str){return true}
        if(obj.contructor == Number && cls == _b_.float){return true}
        if(typeof obj == 'number' && cls == _b_.int){return true}
        klass = $B.get_class(obj)
    }

    if(klass === undefined){return false}

    // Return true if one of the parents of obj class is cls
    // If one of the parents is the class used to inherit from str, obj is an
    // instance of str ; same for list

    function check(kl, cls){
        if(kl === cls){return true}
        else if(cls === _b_.str &&
            kl === $B.StringSubclass){return true}
        else if(cls === _b_.float &&
            kl === $B.FloatSubclass){return true}
    }
    if(check(klass, cls)){return true}
    var mro = klass.__mro__
    for(var i = 0; i < mro.length; i++){
       if(check(mro[i], cls)){return true}
    }

    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = getattr(cls.__class__ || $B.get_class(cls),
        '__instancecheck__', _b_.None)
    if(instancecheck !== _b_.None){
        return instancecheck(cls, obj)
    }
    return false
}

function issubclass(klass,classinfo){
    check_no_kw('issubclass', klass, classinfo)
    check_nb_args('issubclass', 2, arguments.length)

    if(!klass.__class__ ||
            !(klass.$factory !== undefined || klass.$is_class !== undefined)){
                console.log('not a class', klass,"\n", klass + "")
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
    var sch = getattr(classinfo, '__subclasscheck__', _b_.None)
    if(sch == _b_.None){
        return false
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

$B.$iter = function(obj){
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    try{
        var _iter = getattr(obj, '__iter__')
        _iter = $B.$call(_iter)
        }
    catch(err){
        var gi = getattr(obj, '__getitem__', -1),
            ln = getattr(obj, '__len__', -1)
        if(gi !== -1){
            if(ln !== -1){
                var len = getattr(ln, '__call__')()
                return iterator_class.$factory(gi, len)
            }else{
                return iterator_class.$factory(gi, null)
            }
      }
      throw _b_.TypeError.$factory("'" + $B.get_class(obj).__name__ +
          "' object is not iterable")
    }
    var res = $B.$call(_iter)(),
        ce = $B.current_exception
    try{getattr(res, '__next__')}
    catch(err){
        if(isinstance(err, _b_.AttributeError)){throw _b_.TypeError.$factory(
            "iter() returned non-iterator of type '" +
             $B.get_class(res).__name__ + "'")}
    }
    $B.current_exception = ce
    return res
}

function iter(){
    // Function exposed to Brython programs, with arguments control
    var $ = $B.args('iter', 1, {obj: null}, ['obj'], arguments,
        null, 'kw')
    return $B.$iter($.obj)
}

function len(obj){
    check_no_kw('len', obj)
    check_nb_args('len', 1, arguments.length)

    try{return getattr(obj, '__len__')()}
    catch(err){
        throw _b_.TypeError.$factory("object of type '" +
            $B.get_class(obj).__name__ + "' has no len()")
    }
}

function locals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('locals', 0, arguments.length)
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
            res = null,
            ce = $B.current_exception
        while(true){
            try{
                var x = next($iter)
                if(res === null || $B.$bool(getattr(func(x), op)(func(res)))){
                    res = x
                }
            }catch(err){
                if(err.__class__ == _b_.StopIteration){
                    $B.current_exception = ce
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
            if(res === null || $B.$bool(getattr(func(x), op)(func(res)))){
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
        check_nb_args('memoryview', 1, arguments.length)
        if($B.get_class(obj).$buffer_protocol){
            return {
                __class__: memoryview,
                obj: obj,
                // XXX fix me : next values are only for bytes and bytearray
                format: 'B',
                itemsize: 1,
                ndim: 1,
                shape: _b_.tuple.$factory([obj.source.length]),
                strides: _b_.tuple.$factory([1]),
                suboffsets: _b_.tuple.$factory([]),
                c_contiguous: true,
                f_contiguous: true,
                contiguous: true
            }
        }else{
            throw _b_.TypeError.$factory("memoryview: a bytes-like object " +
                "is required, not '" + $B.get_class(obj).__name__ + "'")
        }
    }
)
memoryview.__eq__ = function(self, other){
    if(other.__class__ !== memoryview){return false}
    return getattr(self.obj, '__eq__')(other.obj)
}

memoryview.__getitem__ = function(self, key){
    var res = self.obj.__class__.__getitem__(self.obj, key)
    if(key.__class__ === _b_.slice){return memoryview.$factory(res)}
    return res
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
    return _b_.list.$factory(_b_.bytes.$factory(self.obj))
}

$B.set_func_names(memoryview, "builtins")

function min(){
    return $extreme(arguments, '__lt__')
}

function next(obj){
    check_no_kw('next', obj)
    check_nb_args('next', 1, arguments.length)
    var ga = getattr(obj, '__next__')
    if(ga !== undefined){
        return $B.$call(ga)()
    }
    throw _b_.TypeError.$factory("'" + $B.get_class(obj).__name__ +
        "' object is not an iterator")
}

var NotImplementedType = $B.make_class("NotImplementedType",
    function(){return NotImplemented}
)
NotImplementedType.__repr__ = NotImplementedType.__str__ = function(){
    return "NotImplemented"
}
var NotImplemented = {
    __class__: NotImplementedType,
}

function $not(obj){return !$B.$bool(obj)}

function oct(x) {return $builtin_base_convert_helper(x, 8)}

function ord(c) {
    check_no_kw('ord', c)
    check_nb_args('ord', 1, arguments.length)
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
            $B.get_class(c).__name__ + ' was found')
    }
}

function pow() {
    var $ns = $B.args('pow', 3, {x: null, y: null, z: null},['x', 'y', 'z'],
        arguments, {z: null}, null, null)
    var x = $ns['x'], y = $ns['y'], z = $ns['z']
    var res = getattr(x, '__pow__')(y, z)
    if(z === null){return res}
    else{
        if(x != _b_.int.$factory(x) || y != _b_.int.$factory(y)){
            throw _b_.TypeError.$factory("pow() 3rd argument not allowed " +
                "unless all arguments are integers")
        }
        return getattr(res, '__mod__')(z)
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

    getattr(file, 'write')(args.map(_b_.str.$factory).join(sep) + end)
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
            getattr(self.fset, '__call__')(obj, value)
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
    check_nb_args('repr', 1, arguments.length)

    if(obj.$is_class || obj.$factory){
        // obj is a class
        // In this case, repr() doesn't use the attribute __repr__ of the
        // class or its subclasses, but the attribute __repr__ of the
        // class metaclass (usually "type")
        // The metaclass is the attribute __class__ of the class
        var func = _b_.type.__getattribute__(obj.__class__, '__repr__')
        return func(obj)
    }
    var func = getattr(obj, '__repr__')
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
        check_nb_args('reversed', 1, arguments.length)

        var ce = $B.current_exception

        try{return getattr(seq, '__reversed__')()}
        catch(err){
            if(err.__class__ != _b_.AttributeError){throw err}
        }
        $B.current_exception = ce

        try{
            var res = {
                __class__: reversed,
                $counter : getattr(seq, '__len__')(),
                getter: getattr(seq, '__getitem__')
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
        if(n === undefined){return getattr(arg, '__round__')()}
        else{return getattr(arg, '__round__')(n)}
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
    if($B.aliased_names[attr]){
        attr = '$$' + attr
    }else if(attr == '__dict__'){
        // set attribute __dict__
        // remove previous attributes
        if(!value.__class__ === _b_.dict){
            throw _b_.TypeError.$factory("__dict__ must be set to a dictionary, " +
                "not a '" + value.__class__.__name + "'")
        }
        for(var attr in obj){
            if(attr !== "__class__"){delete obj[attr]}
        }
        // set them
        for(var attr in value.$string_dict){
            obj[attr] = value.$string_dict[attr]
        }
        return None
    }

    if(obj.$factory || obj.$is_class){
        obj[attr] = value
        if(attr == "__init__" || attr == "__new__"){
            // redefine the function that creates instances of the class
            obj.$factory = $B.$instance_creator(obj)
        }
        return None
    }

    var res = obj[attr],
        klass = obj.__class__ || $B.get_class(obj)
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
            var __set__ = getattr(res, '__set__', null)
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

    // Use __slots__ if defined
    var special_attrs = ["__module__"]
    if(klass && klass.__slots__ && klass.__slots__.indexOf(attr) == -1 &&
            special_attrs.indexOf(attr) == -1){
        throw _b_.AttributeError.$factory("'"  + klass.__name__ +
            "' object has no attribute '" + attr + "'")
    }

    // Search the __setattr__ method
    var _setattr = false
    if(klass !== undefined){
        _setattr = klass.__setattr__
        if(_setattr === undefined){
            var mro = klass.__mro__
            for(var i = 0, _len = mro.length; i < _len; i++){
                _setattr = mro[i].__setattr__
                if(_setattr){break}
            }
        }
    }
    if(!_setattr){
        obj[attr] = value
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
        iterable = iter(iterable),
        ce = $B.current_exception
    while(1){
        try{
            var _item = next(iterable)
            res = getattr(res, '__add__')(_item)
        }catch(err){
           if(err.__class__ === _b_.StopIteration){
               $B.current_exception = ce
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
        var method = function(){
            var res = f(self.__self_class__, ...arguments)
            if($test){console.log("calling super", self.__self_class__, attr, f, "res", res)}
            return res
        }
        method.__class__ = $B.method
        method.$infos = {
            __self__: self.__self_class__,
            __func__: f,
            __name__: attr,
            __module__: f.$infos.__module__,
            __qualname__: self.__thisclass__.__name__ + "." + attr
        }
        return method
    }

    throw _b_.AttributeError.$factory("object 'super' has no attribute '" +
        attr + "'")
}

$$super.__repr__ = $$super.__str__ = function(self){
    var res = "<super: <class '" + self.__thisclass__.__name__ + "'>"
    if(self.__self_class__ !== undefined){
        res += ', <' + self.__self_class__.__class__.__name__ + ' object>'
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
        try{return getattr($.obj, '__dict__')}
        catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("vars() argument must have __dict__ attribute")
            }
            throw err
        }
    }
}

var $Reader = {__class__: _b_.type, __name__: 'reader'}

$Reader.__enter__ = function(self){return self}

$Reader.__exit__ = function(self){return false}

$Reader.__iter__ = function(self){return iter(self.$lines)}

$Reader.__len__ = function(self){return self.lines.length}

$Reader.__mro__ = [object]

$Reader.close = function(self){self.closed = true}

$Reader.read = function(self, nb){
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    if(nb === undefined){return self.$content}

    self.$counter += nb
    return self.$content.substr(self.$counter - nb, nb)
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

var $BufferedReader = {__class__: _b_.type, __name__: '_io.BufferedReader'}

$BufferedReader.__mro__ = [$Reader, object]

var $TextIOWrapper = {__class__: _b_.type, __name__: '_io.TextIOWrapper'}

$TextIOWrapper.__mro__ = [$Reader, object]

function $url_open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    var $ns = $B.args('open', 3, {file: null, mode: null, encoding: null},
        ['file', 'mode', 'encoding'], arguments,
        {mode: 'r', encoding: 'utf-8'}, 'args', 'kw'),
        $res
    for(var attr in $ns){eval('var ' + attr + '=$ns["' + attr + '"]')}
    if(args.length > 0){var mode = args[0]}
    if(args.length > 1){var encoding = args[1]}
    var is_binary = mode.search('b') > -1
    if(is_binary){
        throw _b_.IOError.$factory("open() in binary mode is not supported")
    }
    if(isinstance(file, $B.JSObject)){
        return $B.OpenFile.$factory(file.js, mode, encoding) // defined in py_dom.js
    }
    if(isinstance(file, _b_.str)){
        // read the file content and return an object with file object methods
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

        var lines = $res.split('\n')
        for(var i = 0; i < lines.length - 1; i++){lines[i] += '\n'}

        // return the file-like object
        var res = {
            $content:$res,
            $counter:0,
            $lines:lines,
            closed:False,
            encoding:encoding,
            mode:mode,
            name:file
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
            items = [],
            ce = $B.current_exception
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
        $B.current_exception = ce
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
        throw _b_.AttributeError.$factory("'" + klass.__name__ +
            "' object attribute '" + attr + "' is read-only")
    }else{
        throw _b_.AttributeError.$factory("'" + klass.__name__ +
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
                    k + " " + $B.get_class(other).__name__)
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
    __module__: "builtins",
    __mro__: [object],
    __name__: 'function',
    $is_class: true
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
    method.$infos = {
        __name__: self.$infos.__name__,
        __qualname__: obj.__class__.__name__ + "." + self.$infos.__name__,
        __self__: obj,
        __func__: self
    }
    return method
}

$B.Function.__getattribute__ = function(self, attr){
    // Internal attributes __name__, __module__, __doc__ etc.
    // are stored in self.$infos
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
        }else{
            return self.$infos[attr]
        }
    }else if(self.$attrs && self.$attrs[attr] !== undefined){
        return self.$attrs[attr]
    }else{
        return _b_.object.__getattribute__(self, attr)
    }
}

$B.Function.__repr__ = $B.Function.__str__ = function(self){
    //if(self.$infos === undefined){console.log(self)}
    return '<function ' + self.$infos.__qualname__ + '>'
}

$B.Function.__mro__ = [object]
$B.Function.__setattr__ = function(self, attr, value){
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

builtin_function.__repr__ = builtin_function.__str__ = function(self){
    return '<built-in function ' + self.$infos.__name__ + '>'
}
$B.set_func_names(builtin_function, "builtins")

var method_wrapper = $B.make_class("method_wrapper")

method_wrapper.__repr__ = method_wrapper.__str__ = function(self){
    return "<method wrapper '" + self.$infos.__name__ + "' of function object>"
}
$B.set_func_names(method_wrapper, "builtins")

var wrapper_descriptor = $B.make_class("wrapper_descriptor")

wrapper_descriptor.__repr__ = wrapper_descriptor.__str__ = function(self){
    return "<slot wrapper '" + self.$infos.__name__ + "' of function object>"
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
                __name__: orig_name
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
