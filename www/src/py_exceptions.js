;(function($B){

var _b_ = $B.builtins

$B.del_exc = function(){
    var frame = $B.last($B.frames_stack)
    frame[1].$current_exception = undefined
}

$B.set_exc = function(exc){
    var frame = $B.last($B.frames_stack)
    if(frame === undefined){
        var msg = 'Internal error: no frame for exception ' + _b_.repr(exc)
        console.error(['Traceback (most recent call last):',
            $B.print_stack(exc.$stack),
            msg].join('\n'))
        if($B.debug > 1){
            console.log(exc.args)
            console.log(exc.stack)
        }
        throw Error(msg)
    }else{
        frame[1].$current_exception = $B.exception(exc)
    }
}

$B.get_exc = function(){
    var frame = $B.last($B.frames_stack)
    return frame[1].$current_exception
}

$B.set_exception_offsets = function(exc, position){
    // Used for PEP 657
    exc.$positions = exc.$positions || {}
    exc.$positions[$B.frames_stack.length - 1] = position
    return exc
}

$B.$raise = function(arg, cause){
    // Used for "raise" without specifying an exception.
    // If there is an exception in the stack, use it, else throw a simple
    // Exception
    var active_exc = $B.get_exc()
    if(arg === undefined){
        if(active_exc !== undefined){
            throw active_exc
        }
        throw _b_.RuntimeError.$factory("No active exception to reraise")
    }else{
        if(_b_.isinstance(arg, BaseException)){
            if(arg.__class__ === _b_.StopIteration &&
                    $B.last($B.frames_stack)[1].$is_generator){
                // PEP 479
                arg = _b_.RuntimeError.$factory("generator raised StopIteration")
            }
            arg.__context__ = active_exc === undefined ? _b_.None : active_exc
            arg.__cause__ = cause || _b_.None
            arg.__suppress_context__ = cause !== undefined
            throw arg
        }else if(arg.$is_class && _b_.issubclass(arg, BaseException)){
            if(arg === _b_.StopIteration){
                if($B.last($B.frames_stack)[1].$is_generator){
                    // PEP 479
                    throw _b_.RuntimeError.$factory("generator raised StopIteration")
                }
            }
            var exc = $B.$call(arg)()
            exc.__context__ = active_exc === undefined ? _b_.None : active_exc
            exc.__cause__ = cause || _b_.None
            exc.__suppress_context__ = cause !== undefined
            throw exc
        }else{
            throw _b_.TypeError.$factory("exceptions must derive from BaseException")
        }
    }
}

$B.print_stack = function(stack){
    // Print frames stack with traceback format
    stack = stack || $B.frames_stack
    var trace = []
    for(var frame of stack){
        var lineno = frame.$lineno,
            filename = frame.__file__
        if(lineno !== undefined){
            var local = frame[0] == frame[2] ? "<module>" : frame[0]
            trace.push(`  File "${filename}" line ${lineno}, in ${local}`)
            var src = $B.file_cache[filename]
            if(src){
                var lines = src.split("\n"),
                    line = lines[lineno - 1]
                trace.push("    " + line.trim())
            }
        }
    }
    return trace.join("\n")
}

$B.last_frame = function(){
    var frame = $B.last($B.frames_stack)
    return `file ${frame.__file__} line ${frame.$lineno}`
}

// class of traceback objects
var traceback = $B.traceback = $B.make_class("traceback",
    function(exc){
        var stack = exc.$stack || $B.frames_stack.slice()
        if(_b_.isinstance(exc, _b_.SyntaxError)){
            stack.pop()
        }
        return {
            __class__ : traceback,
            $stack: stack,
             // save line numbers when exception happened
            linenos: stack.map(x => x.$lineno),
            pos: 0
        }
    }
)

traceback.__getattribute__ = function(_self, attr){
    switch(attr){
        case "tb_frame":
            return _self.$stack[_self.pos]
        case "tb_lineno":
            return _self.linenos[_self.pos]
        case "tb_lasti":
            return -1 // not implemented (yet...)
        case "tb_next":
            if(_self.pos < _self.$stack.length - 1){
                _self.pos++
                return _self
            }else{
                return _b_.None
            }
        default:
            return _b_.object.__getattribute__(_self, attr)
    }
}

$B.set_func_names(traceback, "builtins")

// class of frame objects
var frame = $B.frame = $B.make_class("frame",
    function(frame_list){
        frame_list.__class__ = frame
        return frame_list
    }
)

frame.__delattr__ = function(_self, attr){
    if(attr == "f_trace"){
        _self[1].$f_trace = _b_.None
    }
}

frame.__dir__ = function(_self){
    return _b_.object.__dir__(frame).concat(['clear',
        'f_back', 'f_builtins', 'f_code', 'f_globals', 'f_lasti', 'f_lineno',
        'f_locals', 'f_trace', 'f_trace_lines', 'f_trace_opcodes'])
}

frame.__getattr__ = function(_self, attr){
    // Used for f_back to avoid computing it when the frame object
    // is initialised
    if(attr == "f_back"){
        var pos = $B.frames_stack.indexOf(_self)
        if(pos > 0){
            return frame.$factory($B.frames_stack[pos - 1])
        }else{
            return _b_.None
        }
    }else if(attr == "clear"){
        return function(){
            // XXX fix me
        }
    }else if(attr == "f_trace"){
        var locals = _self[1]
        if(locals.$f_trace === undefined){
            return _b_.None
        }
        return locals.$f_trace
    }
}

frame.__setattr__ = function(_self, attr, value){
    if(attr == "f_trace"){
        // used in trace functions, as defined by sys.settrace()
        _self[1].$f_trace = value
    }
}

frame.__str__ = frame.__repr__ = function(_self){
    return '<frame object, file ' + _self.__file__ +
        ', line ' + _self.$lineno + ', code ' +
        frame.f_code.__get__(_self).co_name + '>'
}

frame.f_code = {
    __get__: function(_self){
        var res
        if(_self[4]){
            res = _self[4].$infos.__code__
        }else if(_self.f_code){
            // set in comprehensions
            res = _self.f_code
        }else{
            res = {
                co_name: (_self[0] == _self[2] ? '<module>' : _self[0]),
                co_filename: _self.__file__,
                co_varnames: $B.fast_tuple([])
            }
        }
        res.__class__ = $B.code
        return res
    }
}

frame.f_globals = {
    __get__: function(_self){
        return $B.obj_dict(_self[3])
    }
}

frame.f_lineno = {
    __get__: function(_self){
        return _self.$lineno
    }
}

frame.f_locals = {
    __get__: function(_self){
        return $B.obj_dict(_self[1])
    }
}

frame.f_trace = {
    __get__: function(_self){
        return _self[1].$f_trace
    }
}

$B.set_func_names(frame, "builtins")
$B._frame = frame // used in builtin_modules.js


// built-in exceptions

var BaseException = _b_.BaseException =  {
    __class__: _b_.type,
    __bases__ : [_b_.object],
    __mro__: [_b_.object],
    args: [],
    $infos:{
        __name__: "BaseException",
        __module__: "builtins"
    },
    $is_class: true
}

BaseException.__init__ = function(self){
    var args = arguments[1] === undefined ? [] : [arguments[1]]
    self.args = _b_.tuple.$factory(args)
}

BaseException.__repr__ = function(self){
    var res =  self.__class__.$infos.__name__ + '('
    if(self.args[0] !== undefined){
        res += _b_.repr(self.args[0])
    }
    if(self.args.length > 1){
        res += ', ' + _b_.repr($B.fast_tuple(self.args.slice(1)))
    }
    return res + ')'
}

BaseException.__str__ = function(self){
    if(self.args.length > 0 && self.args[0] !== _b_.None){
        return _b_.str.$factory(self.args[0])
    }
    return ''
}

BaseException.__new__ = function(cls){
    var err = _b_.BaseException.$factory()
    err.__class__ = cls
    err.__dict__ = $B.empty_dict()
    return err
}

BaseException.__getattr__ = function(self, attr){
    if(attr == '__context__'){
        var frame = $B.last($B.frames_stack),
            ctx = frame[1].$current_exception
        return ctx || _b_.None
    }else{
        throw $B.attr_error(attr, self)
    }
}

BaseException.with_traceback = function(_self, tb){
    _self.__traceback__ = tb
    return _self
}

$B.deep_copy = function(stack){
    var res = []
    for(const s of stack){
        var item = [s[0], {}, s[2], {}]
        if(s[4] !== undefined){item.push(s[4])}
        for(const i of [1, 3]){
            for(var key in s[i]){
                item[i][key] = s[i][key]
            }
        }
        res.push(item)
    }
    return res
}

$B.save_stack = function(){
    return $B.deep_copy($B.frames_stack)
}

$B.restore_stack = function(stack, locals){
    $B.frames_stack = stack
    $B.frames_stack[$B.frames_stack.length - 1][1] = locals
}

$B.freeze = function(err){
    if(err.$stack === undefined){
        err.$stack = $B.frames_stack.slice()
        err.$linenos = $B.frames_stack.map(x => x.$lineno)
    }
    err.__traceback__ = traceback.$factory(err)
}

var show_stack = $B.show_stack = function(stack){
    stack = stack || $B.frames_stack
    for(const frame of stack){
        console.log(frame[0], frame[1].$line_info)
    }
}

// Source code for BaseException. Used in make_exc to generate all the
// exceptions.
// Must be defined as a string: if BaseException.$factory is defined as a
// function and the function code source is used to generate the other
// exceptions, this code source might be changed by a JS code minifier...
// (cf issue #1806)
// The line '// placeholder' is meant to be replaced by exception-specific
// code passed to make_exc()
var be_factory = `
function (){
    var err = Error()
    err.args = $B.fast_tuple(Array.prototype.slice.call(arguments))
    err.__class__ = _b_.BaseException
    err.__traceback__ = _b_.None
    err.$py_error = true
    err.$stack = $B.frames_stack.slice()
    err.$linenos = $B.frames_stack.map(x => x.$lineno)
    // placeholder
    err.__cause__ = _b_.None // XXX fix me
    err.__context__ = _b_.None // XXX fix me
    err.__suppress_context__ = false // XXX fix me
    return err
}`

eval('BaseException.$factory = ' + be_factory)

BaseException.$factory.$infos = {
    __name__: "BaseException",
    __qualname__: "BaseException"
}

$B.set_func_names(BaseException)

_b_.BaseException = BaseException

$B.exception = function(js_exc, in_ctx_manager){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    if(! js_exc.__class__){
        if(js_exc.$py_exc){
            // when the JS exception is handled in a frame above, return the
            // same Python exception
            return js_exc.$py_exc
        }
        console.log('Javascript error\n', js_exc)
        console.log('frames', $B.frames_stack.slice())
        var exc = _b_.Exception.$factory("Internal Javascript error: " +
            (js_exc.__name__ || js_exc.name))
        exc.__name__ = "Internal Javascript error: " +
            (js_exc.__name__ || js_exc.name)
        exc.$js_exc = js_exc
        if($B.is_recursion_error(js_exc)){
            return _b_.RecursionError.$factory("too much recursion")
        }
        exc.__cause__ = _b_.None
        exc.__context__ = _b_.None
        exc.__suppress_context__ = false
        var $message = "<Javascript " + js_exc.name + ">: " +
            (js_exc.message || "<" + js_exc + ">")
        exc.args = _b_.tuple.$factory([$message])
        exc.$py_error = true
        js_exc.$py_exc = exc
        $B.freeze(exc)
    }else{
        var exc = js_exc
        $B.freeze(exc)
        if(in_ctx_manager){
            // Is this documented anywhere ? For exceptions raised inside a
            // context manager, the frames stack starts at the current
            // local level.
            var current_locals = $B.last($B.frames_stack)[0]
            for(var i = 0, len = exc.$stack.length; i < len; i++){
                if(exc.$stack[i][0] == current_locals){
                    exc.$stack = exc.$stack.slice(i)
                    exc.$traceback = traceback.$factory(exc)
                    break
                }
            }
        }
    }
    return exc
}

$B.is_exc = function(exc, exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__ === undefined){
        exc = $B.exception(exc)
    }

    var this_exc_class = exc.$is_class ? exc : exc.__class__
    for(var i = 0; i < exc_list.length; i++){
        var exc_class = exc_list[i]
        if(this_exc_class === undefined){console.log("exc class undefined", exc)}
        if(_b_.issubclass(this_exc_class, exc_class)){return true}
    }
    return false
}

$B.is_recursion_error = function(js_exc){
    // Test if the JS exception matches Python RecursionError
    var msg = js_exc + "",
        parts = msg.split(":"),
        err_type = parts[0].trim(),
        err_msg = parts[1].trim()
    return (err_type == 'InternalError' && err_msg == 'too much recursion') ||
        (err_type == 'Error' && err_msg == 'Out of stack space') ||
        (err_type == 'RangeError' && err_msg == 'Maximum call stack size exceeded')
}

var $make_exc = $B.$make_exc = function(names, parent){
    // Creates the exception classes that inherit from parent
    // names is the list of exception names
    var _str = [],
        pos = 0
    for(var name of names){
        var code = ""
        if(Array.isArray(name)){
            // If name is an array, its first item is the exception name
            // and the second is a piece of code to replace the placeholder
            // in BaseException source code
            var code = name[1],
                name = name[0]
        }
        // create a class for exception called "name"
        $B.builtins_scope[name] = true
        var $exc = (be_factory).replace(/BaseException/g,name)
        $exc = $exc.replace("// placeholder", code)
        // class dictionary
        _str[pos++] = "_b_." + name + ' = {__class__:_b_.type, ' +
            '__bases__: [_b_.' + parent.$infos.__name__ + '], ' +
            '__mro__: [_b_.' + parent.$infos.__name__ +
            "].concat(parent.__mro__), $is_class: true," +
            "$infos: {__name__:'" + name + "'}}"
        _str[pos++] = "_b_." + name + ".$factory = " + $exc
        _str[pos++] = "_b_." + name + '.$factory.$infos = {__name__: "' +
            name + '", __qualname__: "' + name + '"}'
        _str[pos++] = "$B.set_func_names(_b_." + name + ", 'builtins')"
    }
    try{
        eval(_str.join(";"))
    }catch(err){
        console.log("--err" + err)
        console.log(_str.join(''))
        throw err
    }
}

$make_exc(["SystemExit", "KeyboardInterrupt", "GeneratorExit", "Exception"],
    BaseException)
$make_exc([["StopIteration","err.value = arguments[0] || _b_.None"],
    ["StopAsyncIteration","err.value = arguments[0]"],
    "ArithmeticError", "AssertionError", "BufferError", "EOFError",
    ["ImportError", "err.name = arguments[0]"],
    "LookupError", "MemoryError",
    "OSError", "ReferenceError", "RuntimeError",
    ["SyntaxError", "err.msg = arguments[0]"],
    "SystemError", "TypeError", "ValueError", "Warning"], _b_.Exception)
$make_exc(["FloatingPointError", "OverflowError", "ZeroDivisionError"],
    _b_.ArithmeticError)
$make_exc([["ModuleNotFoundError", "err.name = arguments[0]"]], _b_.ImportError)
$make_exc(["IndexError","KeyError"], _b_.LookupError)
$make_exc(["BlockingIOError", "ChildProcessError", "ConnectionError",
    "FileExistsError", "FileNotFoundError", "InterruptedError",
    "IsADirectoryError", "NotADirectoryError", "PermissionError",
    "ProcessLookupError", "TimeoutError"], _b_.OSError)
$make_exc(["BrokenPipeError", "ConnectionAbortedError",
    "ConnectionRefusedError", "ConnectionResetError"], _b_.ConnectionError)
$make_exc(["NotImplementedError", "RecursionError"], _b_.RuntimeError)
$make_exc([["IndentationError", "err.msg = arguments[0]"]], _b_.SyntaxError)
$make_exc(["TabError"], _b_.IndentationError)
$make_exc(["UnicodeError"], _b_.ValueError)
$make_exc(["UnicodeDecodeError", "UnicodeEncodeError",
    "UnicodeTranslateError"], _b_.UnicodeError)
$make_exc(["DeprecationWarning", "PendingDeprecationWarning",
    "RuntimeWarning", "SyntaxWarning", "UserWarning", "FutureWarning",
    "ImportWarning", "UnicodeWarning", "BytesWarning", "ResourceWarning",
    "EncodingWarning"],
    _b_.Warning)
$make_exc(["EnvironmentError", "IOError", "VMSError", "WindowsError"],
    _b_.OSError)

// AttributeError supports keyword-only "name" and "obj" parameters
var js = '\nvar $ = $B.args("AttributeError", 1, {"msg": null, "name":null, "obj":null}, ' +
    '["msg", "name", "obj"], arguments, ' +
    '{msg: _b_.None, name: _b_.None, obj: _b_.None}, "*", null);\n' +
    'err.args = $B.fast_tuple($.msg === _b_.None ? [] : [$.msg])\n;' +
    'err.name = $.name\nerr.obj = $.obj\n'

$make_exc([["AttributeError", js]], _b_.Exception)

_b_.AttributeError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.AttributeError, 'builtins')

// Shortcut to create an AttributeError
$B.attr_error = function(name, obj){
    if(obj.$is_class){
        var msg = `type object '${obj.$infos.__name__}'`
    }else{
        var msg = `'${$B.class_name(obj)}' object`
    }
    msg +=  ` has no attribute '${name}'`
    return _b_.AttributeError.$factory({$nat:"kw", kw:{name, obj, msg}})
}

// NameError supports keyword-only "name" parameter
var js = '\nvar $ = $B.args("NameError", 1, {"message":null, "name": null}, ' +
    '["message", "/", "name"], arguments, ' +
    '{message: _b_.None, name: _b_.None}, "*", null);\n' +
    'err.args = $B.fast_tuple($.message === _b_.None ? [] : [$.message])\n' +
    'err.name = $.name;\n'

$make_exc([["NameError", js]], _b_.Exception)

_b_.NameError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.NameError, 'builtins')

$make_exc(["UnboundLocalError"], _b_.NameError)

_b_.UnboundLocalError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.UnboundLocalError, 'builtins')

// Shortcut to create a NameError
$B.name_error = function(name, obj){
    var exc = _b_.NameError.$factory(`name '${name}' is not defined`)
    exc.name = name
    return exc
}

// Suggestions in case of NameError or AttributeError
var MAX_CANDIDATE_ITEMS = 750,
    MAX_STRING_SIZE = 40,
    MOVE_COST = 2,
    CASE_COST = 1,
    SIZE_MAX = 65535

function LEAST_FIVE_BITS(n){
    return ((n) & 31)
}

function levenshtein_distance(a, b, max_cost){
    // Compute Leveshtein distance between strings a and b
    if(a == b){
        return 0
    }
    if(a.length < b.length){
        [a, b] = [b, a]
    }

    while(a.length && a[0] == b[0]){
        a = a.substr(1)
        b = b.substr(1)
    }
    while(a.length && a[a.length - 1] == b[b.length - 1]){
        a = a.substr(0, a.length - 1)
        b = b.substr(0, b.length - 1)
    }
    if(b.length == 0){
        return a.length * MOVE_COST
    }
    if ((b.length - a.length) * MOVE_COST > max_cost){
        return max_cost + 1
    }
    var buffer = []
    for(var i = 0; i < a.length; i++) {
        // cost from b[:0] to a[:i+1]
        buffer[i] = (i + 1) * MOVE_COST
    }
    var result = 0
    for(var b_index = 0; b_index < b.length; b_index++) {
        var code = b[b_index]
        // cost(b[:b_index], a[:0]) == b_index * MOVE_COST
        var distance = result = b_index * MOVE_COST;
        var minimum = SIZE_MAX;
        for(var index = 0; index < a.length; index++) {
            // 1) Previous distance in this row is cost(b[:b_index], a[:index])
            var substitute = distance + substitution_cost(code, a[index])
            // 2) cost(b[:b_index], a[:index+1]) from previous row
            distance = buffer[index]
            // 3) existing result is cost(b[:b_index+1], a[index])
            var insert_delete = Math.min(result, distance) + MOVE_COST
            result = Math.min(insert_delete, substitute)

            buffer[index] = result
            if (result < minimum) {
                minimum = result
            }
        }
        if (minimum > max_cost) {
            // Everything in this row is too big, so bail early.
            return max_cost + 1
        }
    }
    return result
}

function substitution_cost(a, b){
    if(LEAST_FIVE_BITS(a) != LEAST_FIVE_BITS(b)){
        // Not the same, not a case flip.
        return MOVE_COST
    }
    if(a == b){
        return 0
    }
    if(a.toLowerCase() == b.toLowerCase()){
        return CASE_COST
    }
    return MOVE_COST
}
function calculate_suggestions(dir, name){
    if(dir.length >= MAX_CANDIDATE_ITEMS) {
        return null
    }

    var suggestion_distance = 2 ** 52,
        suggestion = null

    for(var item of dir){
        // No more than 1/3 of the involved characters should need changed.
        var max_distance = (name.length + item.length + 3) * MOVE_COST / 6
        // Don't take matches we've already beaten.
        max_distance = Math.min(max_distance, suggestion_distance - 1)
        var current_distance =
            levenshtein_distance(name, item, max_distance)
        if(current_distance > max_distance){
            continue
        }
        if(!suggestion || current_distance < suggestion_distance){
            suggestion = item
            suggestion_distance = current_distance
        }
    }
    return suggestion
}

function offer_suggestions_for_attribute_error(exc){
    var name = exc.name,
        obj = exc.obj
    var dir = _b_.dir(obj),
        suggestions = calculate_suggestions(dir, name)
    return suggestions
}

function offer_suggestions_for_name_error(exc){
    var name = exc.name,
        frame = $B.last(exc.$stack)
    if(typeof name != 'string'){
        return
    }
    var locals = Object.keys(frame[1]).filter(x => ! (x.startsWith('$')))
    var suggestion = calculate_suggestions(locals, name)
    if(suggestion){
        return suggestion
    }
    if(frame[2] != frame[0]){
        var globals = Object.keys(frame[3]).filter(x => ! (x.startsWith('$')))
        var suggestion = calculate_suggestions(globals, name)
        if(suggestion){
            return suggestion
        }
    }
}

// PEP 654
var exc_group_code =
    '\nvar missing = {},\n' +
    '    $ = $B.args("[[name]]", 2, {message: null, exceptions: null}, ' +
        "['message', 'exceptions'], arguments, {exceptions: missing}, " +
        'null, null)\n' +
    'err.message = $.message\n' +
    'err.exceptions = $.exceptions === missing ? [] : $.exceptions\n'

/*
The BaseExceptionGroup constructor inspects the nested exceptions and if they
are all Exception subclasses, it returns an ExceptionGroup rather than a
BaseExceptionGroup
*/
var js = exc_group_code.replace('[[name]]', 'BaseExceptionGroup')
js += `var exc_list = _b_.list.$factory(err.exceptions)
var all_exceptions = true
for(var exc of exc_list){
    if(! _b_.isinstance(exc, _b_.Exception)){
        all_exceptions = false
        break
    }
}
if(all_exceptions){
    err.__class__ = _b_.ExceptionGroup
}
`

$make_exc([['BaseExceptionGroup', js]], _b_.BaseException)

_b_.BaseExceptionGroup.subgroup = function(self, condition){
    // condition is a function applied to exceptions
    var filtered_excs = []
    for(var exc of self.exceptions){
        if(_b_.isinstance(exc, _b_.BaseExceptionGroup)){
            var filtered = _b_.BaseExceptionGroup.subgroup(exc, condition)
            if(filtered === _b_.None){
                // do nothing
            }else if(filtered.exceptions.length == exc.exceptions.length){
                filtered_excs.push(exc)
            }else if(filtered.exceptions.length > 0){
                filtered_excs = filtered_excs.concat(filtered)
            }
        }else if(condition(exc)){
            filtered_excs.push(exc)
        }
    }
    if(filtered_excs.length == 0){
        return _b_.None
    }
    var res = _b_.BaseExceptionGroup.$factory(self.message, filtered_excs)
    res.__cause__ = self.__cause__
    res.__context__ = self.__context__
    res.__traceback__ = self.__traceback__
    return res
}

var js = exc_group_code.replace('[[name]]', 'ExceptionGroup')

/*
The ExceptionGroup constructor raises a TypeError if any of the nested
exceptions is not an Exception instance
*/
js += `var exc_list = _b_.list.$factory(err.exceptions)
for(var exc of exc_list){
    if(! _b_.isinstance(exc, _b_.Exception)){
        throw _b_.TypeError.$factory(
            'Cannot nest BaseExceptions in an ExceptionGroup')
    }
}
`

$make_exc([['ExceptionGroup', js]], _b_.Exception)
_b_.ExceptionGroup.__bases__.splice(0, 0, _b_.BaseExceptionGroup)
_b_.ExceptionGroup.__mro__.splice(0, 0, _b_.BaseExceptionGroup)


_b_.ExceptionGroup.__str__ = function(self){
    return `${self.message} (${self.exceptions.length} sub-exception` +
        `${self.exceptions.length > 1 ? 's' : ''})`
}

$B.set_func_names(_b_.ExceptionGroup, "builtins")

function trace_from_stack(err){

    function handle_repeats(src, count_repeats){
        if(count_repeats > 0){
            var len = trace.length
            for(var i = 0; i < 2; i++){
                if(src){
                    trace.push(trace[len - 2])
                    trace.push(trace[len - 1])
                }else{
                    trace.push(trace[len - 1])
                }
                count_repeats--
                if(count_repeats == 0){
                    break
                }
            }
            if(count_repeats > 0){
                trace.push(`[Previous line repeated ${count_repeats} more` +
                    ` time${count_repeats > 1 ? 's' : ''}]`)
            }
        }
    }
    var trace = [],
        save_filename,
        save_lineno,
        save_scope,
        count_repeats = 0

    for(var frame_num = 0, len = err.$stack.length; frame_num < len; frame_num++){
        var frame = err.$stack[frame_num],
            lineno = err.$linenos[frame_num],
            filename = frame.__file__,
            scope = frame[0] == frame[2] ? '<module>' : frame[0]
        if(filename == save_filename && scope == save_scope && lineno == save_lineno){
            count_repeats++
            continue
        }
        handle_repeats(src, count_repeats)
        save_filename = filename
        save_lineno = lineno
        save_scope = scope
        count_repeats = 0
        var src = $B.file_cache[filename]
        trace.push(`  File "${filename}", line ${lineno}, in ` +
            (frame[0] == frame[2] ? '<module>' : frame[0]))
        if(src){
            var lines = src.split('\n'),
                line = lines[lineno - 1]
            if(line){
                trace.push('    ' + line.trim())
            }
            // preliminary for PEP 657
            if(err.$positions !== undefined){
                var position = err.$positions[frame_num],
                    trace_line = ''
                if(position && (
                            (position[1] != position[0] ||
                            (position[2] - position[1]) != line.trim().length ||
                            position[3]))){
                    var indent = line.length - line.trimLeft().length
                    trace_line += '    ' + ' '.repeat((position[0] - indent)) +
                        '~'.repeat(position[1] - position[0]) +
                        '^'.repeat(position[2] - position[1])
                    if(position[3] !== undefined){
                        trace_line += '~'.repeat(position[3] - position[2])
                    }
                    trace.push(trace_line)
                }
            }
        }
    }
    if(count_repeats > 0){
        var len = trace.length
        for(var i = 0; i < 2; i++){
            if(src){
                trace.push(trace[len - 2])
                trace.push(trace[len - 1])
            }else{
                trace.push(trace[len - 1])
            }
        }
        trace.push(`[Previous line repeated ${count_repeats - 2} more times]`)
    }
    return trace.join('\n') + '\n'
}

$B.show_error = function(err){
    if($B.debug > 1){
        console.log("handle error", err.__class__, err.args)
        console.log('stack', err.$stack)
        console.log(err.stack)
    }
    var trace = ''
    if(err.$stack && err.$stack.length > 0){
        trace = 'Traceback (most recent call last):\n'
    }
    if(err.__class__ === _b_.SyntaxError ||
            err.__class__ === _b_.IndentationError){
        err.$stack.pop()
        trace += trace_from_stack(err)
        var filename = err.filename,
            line = err.text,
            indent = line.length - line.trimLeft().length
        trace += `  File "${filename}", line ${err.args[1][1]}\n` +
                     `    ${line.trim()}\n`
        if(err.__class__ !== _b_.IndentationError &&
                err.text){
            // add ^ under the line
            var start = err.offset - indent - 1,
                marks = '    ' + ' '.repeat(start),
                nb_marks = 1
            if(err.end_lineno){
                if(err.end_lineno > err.lineno){
                    nb_marks = line.length - start - indent
                }else{
                    nb_marks = err.end_offset - start - indent - 1
                }
                if(nb_marks == 0 &&
                        err.end_offset == line.substr(indent).length){
                    nb_marks = 1
                }
            }
            marks += '^'.repeat(nb_marks) + '\n'
            trace += marks
        }
        trace += `${err.__class__.$infos.__name__}: ${err.args[0]}`
    }else if(err.__class__ !== undefined){
        var name = $B.class_name(err)
        trace += trace_from_stack(err)
        trace += name + ': ' + _b_.str.$factory(err)
        if(err.__class__ === _b_.NameError){
            var suggestion = offer_suggestions_for_name_error(err)
            if(suggestion){
                trace += `. Did you mean '${suggestion}'?`
            }
        }else if(err.__class__ === _b_.AttributeError){
            var suggestion = offer_suggestions_for_attribute_error(err)
            if(suggestion){
                trace += `. Did you mean: '${suggestion}'?`
            }
        }
    }else{
        console.log(err)
        trace = err + ""
    }
    try{
        $B.$getattr($B.stderr, 'write')(trace)
        var flush = $B.$getattr($B.stderr, 'flush', _b_.None)
        if(flush !== _b_.None){
            flush()
        }
    }catch(print_exc_err){
        console.debug(trace)
    }
}

$B.handle_error = function(err){
    // Print the error traceback on the standard error stream
    if(err.$handled){
        return
    }
    err.$handled = true
    $B.show_error(err)

    // Throw the error to stop execution
    throw err
}

})(__BRYTHON__)
