"use strict";
(function($B){

var _b_ = $B.builtins

$B.del_exc = function(frame){
    delete frame[1].$current_exception
}

$B.set_exc = function(exc, frame){
    exc.__traceback__ = exc.__traceback__ === _b_.None ? make_tb() : exc.__traceback__
    if(frame === undefined){
        var msg = 'Internal error: no frame for exception ' + _b_.repr(exc)
        console.error(['Traceback (most recent call last):',
            $B.print_stack(exc.$frame_obj),
            msg].join('\n'))
        if($B.get_option('debug', exc) > 1){
            console.log(exc.args)
            console.log(exc.stack)
        }
        throw Error(msg)
    }else{
        frame[1].$current_exception = $B.exception(exc)
    }
}

$B.set_exc_and_trace = function(frame, exc){
    $B.set_exc(exc, frame)
    if((! exc.$in_trace_func) && frame.$f_trace !== _b_.None){
        frame.$f_trace = $B.trace_exception()
    }
}

$B.set_exc_and_leave = function(frame, exc){
    $B.set_exc_and_trace(frame, exc)
    $B.leave_frame()
    throw exc
}

$B.get_exc = function(){
    var frame = $B.frame_obj.frame
    return frame[1].$current_exception
}

$B.set_exception_offsets = function(exc, position){
    // Used for PEP 657
    exc.$positions = exc.$positions || {}
    exc.$positions[$B.frame_obj.count - 1] = position
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
        if($B.$isinstance(arg, _b_.BaseException)){
            if(arg.__class__ === _b_.StopIteration &&
                    $B.frame_obj.frame.$is_generator){
                // PEP 479
                arg = _b_.RuntimeError.$factory("generator raised StopIteration")
            }
            arg.__context__ = active_exc === undefined ? _b_.None : active_exc
            arg.__cause__ = cause || _b_.None
            arg.__suppress_context__ = cause !== undefined
            throw arg
        }else if(arg.$is_class && _b_.issubclass(arg, _b_.BaseException)){
            if(arg === _b_.StopIteration){
                if($B.frame_obj.frame[1].$is_generator){
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

$B.print_stack = function(frame_obj){
    // Print frames stack with traceback format
    var stack = make_frames_stack(frame_obj || $B.frame_obj)
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
    var frame = $B.frame_obj.frame
    return `file ${frame.__file__} line ${frame.$lineno}`
}


$B.count_frames = function(frame_obj){
    frame_obj = frame_obj || $B.frame_obj
    return frame_obj == null ? 0 : frame_obj.count
}

$B.get_frame_at = function(pos, frame_obj){
    frame_obj = frame_obj || $B.frame_obj
    var nb = frame_obj.count - pos - 1
    for(var i = 0; i < nb; i++){
        if(frame_obj.prev === null){
            break
        }
        frame_obj = frame_obj.prev
    }
    return frame_obj.frame
}

function make_frames_list(){
    var t = []
    var frame_obj = $B.frame_obj
    while(frame_obj){
        t.push(frame_obj.frame)
        frame_obj = frame_obj.prev
    }
    return t
}

var make_tb = $B.make_tb = function(frames_list){
    frames_list = frames_list ?? make_frames_list()
    if(frames_list.length == 0){
        return _b_.None
    }
    var _frame = frames_list.pop()
    var res = {
        __class__: traceback,
        tb_frame: frame.$factory(_frame),
        tb_lineno: _frame.$lineno,
        tb_lasti: _frame.inum ?? -1,
        tb_next: make_tb(frames_list)
    }
    return res
}

// class of traceback objects
var traceback = $B.traceback = $B.make_class("traceback",
    function(exc){
        return make_tb()
    }
)

$B.set_func_names(traceback, "builtins")

// class of frame objects
var frame = $B.frame = $B.make_class("frame",
    function(frame_list){
        frame_list.__class__ = frame
        return frame_list
    }
)

frame.__bool__ = function(){
    return true
}

frame.__delattr__ = function(_self, attr){
    if(attr == "f_trace"){
        _self.$f_trace = _b_.None
    }
}

frame.__dir__ = function(){
    return _b_.object.__dir__(frame).concat(['clear',
        'f_back', 'f_builtins', 'f_code', 'f_globals', 'f_lasti', 'f_lineno',
        'f_locals', 'f_trace', 'f_trace_lines', 'f_trace_opcodes'])
}

frame.__getattr__ = function(_self, attr){
    // Used for f_back to avoid computing it when the frame object
    // is initialised
    if(attr == "f_back"){
        // search _self in $B.frame_obj
        var frame_obj = $B.frame_obj
        while(frame_obj !== null){
            if(frame_obj.frame === _self){
                break
            }
            frame_obj = frame_obj.prev
        }
        if(frame_obj.prev !== null){
            return frame.$factory(frame_obj.prev.frame)
        }
        return _b_.None
    }else if(attr == "clear"){
        return function(){
            // XXX fix me
        }
    }else if(attr == "f_trace"){
        return _self.$f_trace ?? _b_.None
    }else if(attr == "f_lasti"){
        // last instruction not relevant in Brython
        return 0
    }
    throw $B.attr_error(attr, _self)
}

frame.__setattr__ = function(_self, attr, value){
    if(attr == "f_trace"){
        // used in trace functions, as defined by sys.settrace()
        _self.$f_trace = value
    }
}

frame.__str__ = frame.__repr__ = function(_self){
    return '<frame object, file ' + _self.__file__ +
        ', line ' + _self.$lineno + ', code ' +
        frame.f_code.__get__(_self).co_name + '>'
}

frame.f_builtins = {
    __get__: function(_self){
        return $B.$getattr(_self[3].__builtins__, '__dict__')
    }
}

frame.f_code = {
    __get__: function(_self){
        var res
        if(_self[4]){
            res = $B.$getattr(_self[4], '__code__')
            res.co_positions = _self.positions ?? []
        }else if(_self.f_code){
            // set in comprehensions
            res = _self.f_code
        }else{
            res = {
                co_name: (_self[0] == _self[2] ? '<module>' : _self[0]),
                co_filename: _self.__file__,
                co_varnames: $B.fast_tuple([]),
                co_positions: _self.positions
            }
            res.co_qualname = res.co_name // XXX
        }
        res.__class__ = _b_.code
        return res
    }
}

frame.f_globals = {
    __get__: function(_self){
        if(_self.f_globals){
            return _self.f_globals
        }else if(_self.f_locals && _self[1] == _self[3]){
            return _self.f_globals = _self.f_locals
        }else{
            return _self.f_globals = $B.obj_dict(_self[3])
        }
    }
}

frame.f_lineno = {
    __get__: function(_self){
        return _self.$lineno
    }
}

frame.f_locals = {
    __get__: function(_self){
        // If locals and globals are the same, f_locals and f_globals
        // are the same object
        if(_self.f_locals){
            return _self.f_locals
        }else if(_self.f_globals && _self[1] == _self[3]){
            return _self.f_locals = _self.f_globals
        }else{
            return _self.f_locals = $B.obj_dict(_self[1])
        }
    }
}

frame.f_trace = {
    __get__: function(_self){
        return _self.$f_trace
    }
}

$B.set_func_names(frame, "builtins")
$B._frame = frame // used in builtin_modules.js

$B.make_f_code = function(frame, varnames){
    frame.f_code = {
       co_argcount: 1,
       co_firstlineno: frame.$lineno,
       co_name: "<genexpr>",
       co_filename: frame.__file__,
       co_flags: 115,
       co_freevars: $B.fast_tuple([]),
       co_kwonlyargcount: 0,
       co_posonlyargount: 0,
       co_qualname: "genexpr",
       co_varnames: $B.fast_tuple(['.0'].concat(varnames))
    }
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

$B.restore_frame_obj = function(frame_obj, locals){
    $B.frame_obj = frame_obj
    $B.frame_obj.frame[1] = locals
}

var make_frames_stack = $B.make_frames_stack = function(frame_obj){
    var stack = []
    while(frame_obj !== null){
        stack[stack.length] = frame_obj.frame
        frame_obj = frame_obj.prev
    }
    stack.reverse()
    return stack
}

$B.freeze = function(err){
    err.__traceback__ = err.__traceback__ ?? traceback.$factory(err)
}


$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    var exc
    if(! js_exc.__class__){
        if(js_exc.$py_exc){
            // when the JS exception is handled in a frame above, return the
            // same Python exception
            return js_exc.$py_exc
        }
        if($B.get_option('debug', exc) > 1){
            console.log('Javascript error', js_exc)
        }
        var msg = js_exc.name + ': ' + js_exc.message
        exc = _b_.JavascriptError.$factory(msg)
        exc.$js_exc = js_exc
        if($B.is_recursion_error(js_exc)){
            msg = "maximum recursion depth exceeded"
            exc = _b_.RecursionError.$factory(msg)
        }
        exc.__cause__ = _b_.None
        exc.__context__ = _b_.None
        exc.__suppress_context__ = false
        exc.args = _b_.tuple.$factory([msg])
        exc.$py_error = true
        js_exc.$py_exc = exc
        $B.freeze(exc)
    }else{
        exc = js_exc
        $B.freeze(exc)
    }
    exc.__traceback__ = exc.__traceback__ ?? traceback.$factory(exc)
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
        if(this_exc_class === undefined){
            console.log("exc class undefined", exc)
        }
        if(_b_.issubclass(this_exc_class, exc_class)){
            return true
        }
    }
    return false
}

$B.is_recursion_error = function(js_exc){
    // Test if the JS exception matches Python RecursionError
    var msg = js_exc + "",
        parts = msg.split(":")
    if(parts.length == 1){
        return false
    }
    var err_type = parts[0].trim(),
        err_msg = parts[1].trim()
    return (err_type == 'InternalError' && err_msg == 'too much recursion') ||
        (err_type == 'Error' && err_msg == 'Out of stack space') ||
        (err_type == 'RangeError' && err_msg == 'Maximum call stack size exceeded')
}

function freeze_frame_obj(obj){
    obj = obj ?? $B.frame_obj
    return {
        count: obj.count,
        frame: obj.frame,
        prev: obj.prev === null ? null : freeze_frame_obj(obj.prev)
    }
}

// built-in exceptions

function make_builtin_exception(exc_name, base, set_value){
    if(Array.isArray(exc_name)){
        for(var name of exc_name){
            make_builtin_exception(name, base, set_value)
        }
        return
    }
    var exc_class = $B.make_class(exc_name,
        function(){
            var err = Error()
            err.args = $B.fast_tuple(Array.from(arguments))
            err.__class__ = exc_class
            err.__traceback__ = _b_.None
            err.$py_error = true

            if(set_value){
                if(typeof set_value == 'string'){
                    err[set_value] = arguments[0] || _b_.None
                }else if(typeof set_value == 'function'){
                    set_value(err, arguments)
                }
            }
            err.__cause__ = _b_.None // XXX fix me
            err.__context__ = _b_.None // XXX fix me
            err.__suppress_context__ = false // XXX fix me
            return err
        }
    )
    exc_class.__bases__ = [base]
    exc_class.__mro__ = _b_.type.$mro(exc_class).slice(1)
    $B.set_func_names(exc_class, 'builtins')
    _b_[exc_name] = exc_class
}

make_builtin_exception("BaseException", _b_.object)

_b_.BaseException.__init__ = function(self){
    var args = arguments[1] === undefined ? [] : [arguments[1]]
    self.args = _b_.tuple.$factory(args)
}

_b_.BaseException.__repr__ = function(self){
    var res =  self.__class__.__name__ + '('
    if(self.args[0] !== undefined){
        res += _b_.repr(self.args[0])
    }
    if(self.args.length > 1){
        res += ', ' + _b_.repr($B.fast_tuple(self.args.slice(1)))
    }
    return res + ')'
}

_b_.BaseException.__str__ = function(self){
    if(self.args.length > 0 && self.args[0] !== _b_.None){
        return _b_.str.$factory(self.args[0])
    }
    return ''
}

_b_.BaseException.__new__ = function(cls){
    var err = _b_.BaseException.$factory()
    err.__class__ = cls
    err.__dict__ = $B.empty_dict()
    return err
}

_b_.BaseException.__getattr__ = function(self, attr){
    if(attr == '__context__'){
        var frame = $B.frame_obj.frame,
            ctx = frame[1].$current_exception
        return ctx || _b_.None
    }else{
        throw $B.attr_error(attr, self)
    }
}

_b_.BaseException.add_note = function(self, note){
    // PEP 678
    if(! $B.$isinstance(note, _b_.str)){
        throw _b_.TypeError.$factory('note must be a str, not ' +
            `'${$B.class_name(note)}'`)
    }
    if(self.__notes__ !== undefined){
        self.__notes__.push(note)
    }else{
        self.__notes__ = $B.$list([note])
    }
}

_b_.BaseException.with_traceback = function(_self, tb){
    _self.__traceback__ = tb
    return _self
}

$B.set_func_names(_b_.BaseException, 'builtins')

make_builtin_exception(["SystemExit", "KeyboardInterrupt", "GeneratorExit",
    "Exception"], _b_.BaseException)

// Brython-specific
make_builtin_exception("JavascriptError", _b_.Exception)


make_builtin_exception(["ArithmeticError", "AssertionError", "BufferError",
    "EOFError", "LookupError", "MemoryError", "OSError", "ReferenceError",
    "RuntimeError", "SystemError", "TypeError", "ValueError", "Warning"],
    _b_.Exception)

make_builtin_exception("StopIteration", _b_.Exception, "value")
make_builtin_exception("StopAsyncIteration", _b_.Exception, "value")
make_builtin_exception("ImportError", _b_.Exception, "name")
make_builtin_exception("SyntaxError", _b_.Exception,
    function(err, args){
        err.msg = args[0]
        err.args = $B.fast_tuple(Array.from(args))
        var details = args[1]
        if(details){
            details = _b_.tuple.$factory(details)
            if(details.length < 4){
                throw _b_.TypeError.$factory(
                    `function takes at least 4 arguments (${args.length} given)`)
            }
            if(details.length > 6){
                throw _b_.TypeError.$factory(
                    `function takes at most 6 arguments (${args.length} given)`)
            }
        }else{
            details = []
        }
        let attrs = ['filename', 'lineno', 'offset', 'text', 'end_lineno',
                     'end_offset'],
            expected_types = [_b_.str, _b_.int, _b_.int, _b_.str, _b_.int,
                     _b_.int]
        for(var i = 0; i < attrs.length; i++){
            if(details[i] !== undefined){
                if(! $B.$isinstance(details[i], expected_types[i])){
                    throw _b_.TypeError.$factory(`item #${i + 1} (${attrs[i]}) ` +
                        `of the second argument of SyntaxError should be ` +
                        `'${expected_types[i].__name__}', not ` +
                        `'${$B.class_name(details[i])}'`)
                }
                err[attrs[i]] = details[i]
            }else{
                err[attrs[i]] = _b_.None
            }
        }
    }
)

make_builtin_exception(["FloatingPointError", "OverflowError",
    "ZeroDivisionError"], _b_.ArithmeticError)

make_builtin_exception("ModuleNotFoundError", _b_.ImportError, "name")

make_builtin_exception(["IndexError","KeyError"], _b_.LookupError)

make_builtin_exception(["BlockingIOError", "ChildProcessError",
    "ConnectionError", "FileExistsError", "FileNotFoundError",
    "InterruptedError", "IsADirectoryError", "NotADirectoryError",
    "PermissionError", "ProcessLookupError", "TimeoutError"],
    _b_.OSError)

make_builtin_exception(["BrokenPipeError", "ConnectionAbortedError",
    "ConnectionRefusedError", "ConnectionResetError"],
    _b_.ConnectionError)

make_builtin_exception(["NotImplementedError", "RecursionError",
    "PythonFinalizationError"],
    _b_.RuntimeError)

make_builtin_exception(["IndentationError", "_IncompleteInputError"],
    _b_.SyntaxError, "msg")
make_builtin_exception("TabError", _b_.IndentationError)
make_builtin_exception("UnicodeError", _b_.ValueError)
make_builtin_exception(["UnicodeDecodeError", "UnicodeEncodeError",
    "UnicodeTranslateError"], _b_.UnicodeError)

make_builtin_exception(["DeprecationWarning", "PendingDeprecationWarning",
    "RuntimeWarning", "SyntaxWarning", "UserWarning", "FutureWarning",
    "ImportWarning", "UnicodeWarning", "BytesWarning", "ResourceWarning",
    "EncodingWarning"], _b_.Warning)

_b_.EnvironmentError = _b_.OSError
_b_.WindowsError = _b_.OSError
_b_.IOError = _b_.OSError

// AttributeError supports keyword-only "name" and "obj" parameters
_b_.AttributeError = $B.make_class('AttributeError',
    function(){
        var $ = $B.args("AttributeError", 3,
                {"msg": null, "name": null, "obj": null},
                ["msg", "name", "obj"], arguments,
                {msg: _b_.None, name: _b_.None, obj: _b_.None}, "*", null)
        var err = Error()
        err.__class__ = _b_.AttributeError
        err.__traceback__ = _b_.None
        err.$py_error = true
        err.args = $B.fast_tuple($.msg === _b_.None ? [] : [$.msg])
        err.name = $.name
        err.obj = $.obj
        if(err.obj === undefined){
            console.log('pas de obj', $)
        }
        err.__cause__ = _b_.None // XXX fix me
        err.__context__ = _b_.None // XXX fix me
        err.__suppress_context__ = false // XXX fix me
        return err
    }
)

_b_.AttributeError.__bases__ = [_b_.Exception]
_b_.AttributeError.__mro__ = _b_.type.$mro(_b_.AttributeError)

_b_.AttributeError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.AttributeError, 'builtins')

// Shortcut to create an AttributeError
$B.attr_error = function(name, obj){
    var msg
    if(obj.$is_class){
        msg = `type object '${obj.__name__}'`
    }else{
        msg = `'${$B.class_name(obj)}' object`
    }
    msg +=  ` has no attribute '${name}'`
    var exc = _b_.AttributeError.$factory({$kw:[{name, obj, msg}]})
    exc.__traceback__ = make_tb()
    return exc
}

// NameError supports keyword-only "name" parameter
_b_.NameError = $B.make_class('NameError',
    function(){
        var $ = $B.args("NameError", 2, {"message":null, "name": null},
                ["message", "name"], arguments,
                {message: _b_.None, name: _b_.None}, "*", null, 1)

        var err = Error()
        err.__class__ = _b_.NameError
        err.__traceback__ = _b_.None
        err.$py_error = true
        err.$frame_obj = $B.frame_obj

        err.args = $B.fast_tuple($.message === _b_.None ? [] : [$.message])
        err.name = $.name

        err.__cause__ = _b_.None // XXX fix me
        err.__context__ = _b_.None // XXX fix me
        err.__suppress_context__ = false // XXX fix me
        return err
    }
)

_b_.NameError.__bases__ = [_b_.Exception]
_b_.NameError.__mro__ = _b_.type.$mro(_b_.NameError).slice(1)

_b_.NameError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.NameError, 'builtins')

make_builtin_exception("UnboundLocalError", _b_.NameError)

_b_.UnboundLocalError.__str__ = function(self){
    return self.args[0]
}

$B.set_func_names(_b_.UnboundLocalError, 'builtins')

// Shortcut to create a NameError
$B.name_error = function(name){
    var exc = _b_.NameError.$factory(`name '${name}' is not defined`)
    exc.name = name
    exc.__traceback__ = make_tb()
    return exc
}

$B.recursion_error = function(frame){
    var exc = _b_.RecursionError.$factory("maximum recursion depth exceeded")
    $B.set_exc(exc, frame)
    $B.freeze(exc)
    return exc
}

// Suggestions in case of NameError or AttributeError
var MAX_CANDIDATE_ITEMS = 750,
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
    if(suggestion == name){
        // avoid messages such as
        // "object has no attribute 'foo'. Did you mean: 'foo'?"
        return null
    }
    return suggestion
}

$B.offer_suggestions_for_attribute_error = function(exc){
    var name = exc.name,
        obj = exc.obj
    if(name === _b_.None){
        return _b_.None
    }
    var dir = _b_.dir(obj),
        suggestions = calculate_suggestions(dir, name)
    return suggestions || _b_.None
}

$B.offer_suggestions_for_name_error = function(exc, frame){
    var name = exc.name
    if(exc.$frame_obj === null){
        return _b_.None
    }
    frame = frame || exc.$frame_obj.frame
    if(typeof name != 'string'){
        return _b_.None
    }
    var locals = Object.keys(frame[1]).filter(x => ! (x.startsWith('$')))
    var suggestion = calculate_suggestions(locals, name)
    if(suggestion){
        return suggestion
    }
    if(frame[2] != frame[0]){
        var globals = Object.keys(frame[3]).filter(x => ! (x.startsWith('$')))
        suggestion = calculate_suggestions(globals, name)
        if(suggestion){
            return suggestion
        }
    }
    if(frame[4] && frame[4].$is_method){
        // new in 3.12
        var instance_name = frame[4].$infos.__code__.co_varnames[0],
            instance = frame[1][instance_name]
        if(_b_.hasattr(instance, name)){
            return `self.${name}`
        }
    }
    return _b_.None
}

$B.offer_suggestions_for_unexpected_keyword_error = function(arg_names, key){
    if(key === _b_.None){
        return _b_.None
    }
    var suggestions = calculate_suggestions(arg_names, key)
    return suggestions || _b_.None
}

// PEP 654
_b_.BaseExceptionGroup = $B.make_class("BaseExceptionGroup",
    function(){
        var missing = {},
            $ = $B.args("BaseExceptionGroup", 2,
                        {message: null, exceptions: null},
                        ['message', 'exceptions'], arguments,
                        {exceptions: missing}, null, null)
        var err = Error()
        err.args = $B.fast_tuple(Array.from(arguments))
        err.__class__ = _b_.BaseExceptionGroup
        err.__traceback__ = _b_.None
        err.$py_error = true
        err.$frame_obj = $B.frame_obj

        err.message = $.message
        err.exceptions = $.exceptions === missing ? [] : $.exceptions
        if(err.exceptions !== _b_.None){
            var exc_list = _b_.list.$factory(err.exceptions)
            var all_exceptions = true
            for(var exc of exc_list){
                if(! $B.$isinstance(exc, _b_.Exception)){
                    all_exceptions = false
                    break
                }
            }
            if(all_exceptions){
                err.__class__ = _b_.ExceptionGroup
            }
        }

        err.__cause__ = _b_.None // XXX fix me
        err.__context__ = _b_.None // XXX fix me
        err.__suppress_context__ = false // XXX fix me
        return err
    }
)

_b_.BaseExceptionGroup.__bases__ = [_b_.BaseException]

_b_.BaseExceptionGroup.__class_getitem__ = $B.$class_getitem

_b_.BaseExceptionGroup.__mro__ = _b_.type.$mro(_b_.BaseExceptionGroup)

_b_.BaseExceptionGroup.__str__ = function(self){
    return `${self.message} (${self.exceptions.length} sub-exception` +
        `${self.exceptions.length > 1 ? 's' : ''})`
}

_b_.BaseExceptionGroup.split = function(self, condition){
    // condition is a function applied to exceptions
    // returns (matching_be, non_matching_be)
    var matching_excs = [],
        non_matching_excs = []
    for(var exc of self.exceptions){
        if($B.$isinstance(exc, _b_.BaseExceptionGroup)){
            var subsplit = _b_.BaseExceptionGroup.split(exc, condition),
                matching = subsplit[0],
                non_matching = subsplit[1]
            if(matching === _b_.None){
                non_matching_excs.push(exc)
            }else if(matching.exceptions.length == exc.exceptions.length){
                matching_excs.push(exc)
            }else{
                if(matching.exceptions.length > 0){
                    matching_excs = matching_excs.concat(matching)
                }
                if(non_matching.exceptions.length > 0){
                    non_matching_excs = non_matching_excs.concat(non_matching)
                }
            }
        }else if(condition(exc)){
            matching_excs.push(exc)
        }else{
            non_matching_excs.push(exc)
        }
    }
    if(matching_excs.length == 0){
        matching_excs = _b_.None
    }
    if(non_matching_excs.length == 0){
        non_matching_excs = _b_.None
    }
    var res = []
    for(var item of [matching_excs, non_matching_excs]){
        var eg = _b_.BaseExceptionGroup.$factory(self.message, item)
        eg.__cause__ = self.__cause__
        eg.__context__ = self.__context__
        eg.__traceback__ = self.__traceback__
        res.push(eg)
    }
    return $B.fast_tuple(res)
}

_b_.BaseExceptionGroup.subgroup = function(self, condition){
    return _b_.BaseExceptionGroup.split(self, condition)[0]
}

$B.set_func_names(_b_.BaseExceptionGroup, "builtins")

_b_.BaseExceptionGroup.__class_getitem__ =
    _b_.classmethod.$factory(_b_.BaseExceptionGroup.__class_getitem__)

_b_.ExceptionGroup = $B.make_class("ExceptionGroup",
    function(){
        var missing = {},
            $ = $B.args("ExceptionGroup", 2, {message: null, exceptions: null},
                        ['message', 'exceptions'], arguments, {exceptions: missing},
                        null, null)
        var err = Error()
        err.args = $B.fast_tuple(Array.from(arguments))
        err.__class__ = _b_.ExceptionGroup
        err.__traceback__ = _b_.None
        err.$py_error = true
        err.$frame_obj = $B.frame_obj

        err.message = $.message
        err.exceptions = $.exceptions === missing ? [] : $.exceptions
        /*
        The ExceptionGroup constructor raises a TypeError if any of the nested
        exceptions is not an Exception instance
        */
        if(err.exceptions !== _b_.None){
            var exc_list = _b_.list.$factory(err.exceptions)
            for(var exc of exc_list){
                if(! $B.$isinstance(exc, _b_.Exception)){
                    throw _b_.TypeError.$factory(
                        'Cannot nest BaseExceptions in an ExceptionGroup')
                }
            }
        }

        err.__cause__ = _b_.None // XXX fix me
        err.__context__ = _b_.None // XXX fix me
        err.__suppress_context__ = false // XXX fix me
        return err
    }
)

_b_.ExceptionGroup.__bases__ = [_b_.BaseExceptionGroup, _b_.Exception]
_b_.ExceptionGroup.__mro__ = _b_.type.$mro(_b_.ExceptionGroup)


$B.set_func_names(_b_.ExceptionGroup, "builtins")

function make_trace_lines(text, marks, sep, lines, line_start, line_end){
    // Compute minimal indent in error lines
    // The line with minimum indent will be printed with a 4 space
    // indentation
    var min_indent = 255
    for(var lnum = line_start; lnum < line_end + 1; lnum++){
        var line = lines[lnum - 1]
        var indent = line.length - line.trimLeft().length
        if(indent < min_indent){
            min_indent = indent
        }
    }

    var err_lines = []
    var start = 0
    if(! marks && line_end - line_start > 3){
        console.log('trace', line_end, line_start)
        err_lines.push('    ' + lines[line_start - 1].substring(min_indent))
        err_lines.push(`    ...<${line_end - line_start - 1} lines>...`)
        err_lines.push('    ' + lines[line_end - 1].substring(min_indent))
        return err_lines.join('\n')
    }

    for(var i = 0, len = text.length; i <= len; i++){
        if(text[i] == sep || i == len){
            var subline = text.substring(start, i)
            err_lines.push('    ' + text.substring(start, i).substring(min_indent))
            if(marks){
                // don't write '~' under leading or trailing whitespace
                var left_ws = subline.length - subline.trimLeft().length
                var right_ws = subline.length - subline.trimRight().length
                err_lines.push('    ' + ' '.repeat(left_ws - min_indent) +
                    marks.substring(start + left_ws, i - right_ws))
            }
            start = i + 1
        }
    }

    return err_lines.join('\n')
}

function get_text_pos(ast_obj, segment, elt){
    // get position (start / end) in segment for ast_obj
    // segment starts at ast_obj.lineno, ast_obj.col_offset
    var start = 2 // start after initial `(\n`
    // lines between segment start and line
    for(var lnum = ast_obj.lineno; lnum < elt.lineno; lnum++){
        while(start < segment.length && segment[start] != '\n'){
            start++
        }
        start += 1
    }
    start += elt.col_offset
    var end = start
    if(elt.end_lineno == elt.lineno){
        end += elt.end_col_offset - elt.col_offset
    }else{
        // lines between current lnum and end_line
        for(;lnum < elt.end_lineno; lnum++){
            while(end < segment.length && segment[end] != '\n'){
                end++
            }
            end++
        }
        end += elt.end_col_offset
    }
    return {start, end}
}

function handle_BinOp_error(ast_obj, trace, text, head){
    // 'positions' are the coords of the BinOp in the original source
    // The text of the expression is determined by `positions`
    // A segment is made of `(\n{text}\n)` and parsed; ast_obj is the BinOp
    // instance inside the segment
    // Positions of the BinOp are
    //                in original source     in segment
    // lineno         positions[0]           2
    // end_lineno     positions[1]           2 + positions[1] - positions[0]
    // col_offset     positions[2]           positions[2]
    // end_col_offset positions[3]           positions[3]
    var trace_lines = []
    var segment = `(\n${text}\n)`
    // Position (start;end) of left operand in text
    var left_pos = get_text_pos(ast_obj, segment, ast_obj.left)
    var right_pos = get_text_pos(ast_obj, segment, ast_obj.right)

    // position of operator: only cars between left end and right start
    // different from ' ', '(' and ')'
    var operator_start = find_char(segment, left_pos.end, ast_obj.left.end_lineno,
        char => '()'.includes(char) || char.match(/\s/))
    var operator_end = find_char(segment, operator_start.pos + 1,
        operator_start.lineno,
        char => ! char.match(/\s/))

    var operator_length = operator_end.pos - operator_start.pos

    var marks = ' '.repeat(left_pos.start) +
        '~'.repeat(operator_start.pos - left_pos.start) +
        '^'.repeat(operator_length) +
        '~'.repeat(segment.length - operator_end.pos)

    // Compute minimal indent in error lines
    // The line with minimum indent will be printed with a 4 space
    // indentation
    var min_indent = 255
    for(var line of text.split('\n')){
        var indent = line.length - line.trimLeft().length
        if(indent < min_indent){
            min_indent = indent
        }
    }

    var lines = segment.split('\n')

    // remove leading (\n and trailing \n)
    segment = segment.substring(2, segment.length - 2)
    var orig_marks = marks.substring(2, marks.length - 2)
    // restore part of first line before expression
    var orig_text = head + segment.substr(head.length)
    var elines = []
    var i = 0,
        lstart = 0
    while(i < orig_text.length + 1){
        if(orig_text[i] == '\n' || i == orig_text.length){
            var text_line = orig_text.substring(lstart, i).substr(min_indent)
            var text_indent = text_line.length - text_line.trimLeft().length
            elines.push('    ' + text_line)
            var marks_line = orig_marks.substring(lstart, i).substr(min_indent)
            marks_line = ' '.repeat(text_indent) + marks_line.substr(text_indent)
            elines.push('    ' + marks_line)
            lstart = i + 1
        }
        i++
    }
    trace.push(elines.join('\n'))
}

function make_test_func(ast_obj){
    if(ast_obj.end_lineno == ast_obj.lineno){
        return function(line, col){
            return line == ast_obj.lineno && ast_obj.col_offset <= col &&
                col < ast_obj.end_col_offset
        }
    }else{
        return function(line, col){
            return (line == ast_obj.lineno && col >= ast_obj.col_offset) ||
                   (line > ast_obj.lineno && line < ast_obj.end_lineno) ||
                   (line == ast_obj.end_lineno && col < ast_obj.end_col_offset)
       }
   }
}

function handle_Call_error(lines, positions, ast_obj, trace, text){
    // lines is the original source code lines
    // positions is [lineno, end_lineno, col_offset, end_col_offset] of
    // the Call instance in source code
    // text is the source code of the call
    // ast_obj is the ast.Call instance found in the segment '(\n{text}\n)
    // Position of the call
    //                  in source code   in segment
    // lineno           positions[0]     2
    // end_lineno       positions[1]     2 + positions[1] - positions[0]
    // col_offset       positions[2]     positions[2]
    // end_col_offset   positions[3]     positions[3]

    // Mark '~' from function name start to last char before '('
    // and '^' from the opening '(' to the closing ')'
    // f (x)
    // ~~^^^
    var trace_lines = []
    var [lineno, end_lineno, col_offset, end_col_offset] = positions
    var min_indent = get_min_indent(lines.slice(lineno - 1, end_lineno))
    var func = ast_obj.func
    // convert positions in segment to positions in source code
    var args_pos = {
        lineno: ast_obj.func.end_lineno - 2 + lineno,
        end_lineno: ast_obj.end_lineno - 2 + lineno,
        col_offset: ast_obj.func.end_col_offset,
        end_col_offset: ast_obj.end_col_offset
    }
    var func_pos = {
        lineno: func.lineno - 2 + lineno,
        end_lineno: func.end_lineno - 2 + lineno,
        col_offset: func.col_offset,
        end_col_offset: func.end_col_offset
    }
    var marks = ''
    var in_func = make_test_func(func_pos)
    var in_args = make_test_func(args_pos)

    var mark_lines = []
    var func_started = false
    var parenth_found = false
    for(var lnum = lineno; lnum <= end_lineno; lnum++){
        var line = lines[lnum - 1].trimRight()
        var indent = get_indent(line)
        var marks = ' '.repeat(indent)
        var col = indent
        for(; col < line.length; col++){
            if(in_func(lnum, col)){
                func_started = true
                marks += '~'
            }else{
                // '~' until the opening parenth. It is on the same line as
                // function end
                if(func_started && ! parenth_found){
                    if(line[col] == '('){
                        marks += '^'
                        parenth_found = true
                    }else{
                        marks += '~'
                    }
                }else if(in_args(lnum, col)){
                    marks += '^'
                }
            }
        }
        mark_lines.push(marks)
    }
    for(var i = 0; i < mark_lines.length; i++){
        trace_lines.push('    ' + lines[lineno + i - 1].trimRight().substr(min_indent))
        trace_lines.push('    ' + mark_lines[i].substr(min_indent))
    }
    trace.push(trace_lines.join('\n'))
}

function get_indent(line){
    return line.length - line.trimLeft().length
}

function get_min_indent(lines){
    var min_indent = 2 ** 16
    for(var line of lines){
        if(! line.trim()){
            continue
        }
        var indent = get_indent(line)
        if(indent < min_indent){
            min_indent = indent
        }
    }
    return min_indent
}

function handle_Expr_error(ast_obj, trace, lines){
    var trace_lines = []
    if(ast_obj.lineno == ast_obj.end_lineno){
        var err_line = lines[ast_obj.lineno - 1]
        var indent = err_line.length - err_line.trimLeft().length
        trace_lines.push('    ' + err_line.substr(indent))
        var marks_line = ' '.repeat(ast_obj.col_offset) +
            '^'.repeat(ast_obj.end_col_offset - ast_obj.col_offset)
        trace_lines.push('    ' + marks_line.substr(indent))
    }else{
        var min_indent = get_min_indent(lines)
        var err_line = lines[ast_obj.lineno - 1].trimRight()
        trace_lines.push('    ' + err_line.substr(min_indent))
        var marks_line = ' '.repeat(ast_obj.col_offset) +
            '^'.repeat(err_line.length - ast_obj.col_offset)
        trace_lines.push('    ' + marks_line.substr(min_indent))
        for(var lnum = ast_obj.lineno + 1; lnum <= ast_obj.end_lineno - 1; lnum++){
            err_line = lines[lnum - 1].trimRight()
            var indent = err_line.length - err_line.trimLeft().length
            trace_lines.push('    ' + err_line.substr(min_indent))
            marks_line = ' '.repeat(indent) + '^'.repeat(err_line.substr(indent).length)
            trace_lines.push('    ' + marks_line.substr(min_indent))
        }
        var err_line = lines[ast_obj.end_lineno - 1].trimRight()
        var indent = get_indent(err_line)
        trace_lines.push('    ' + err_line.substr(min_indent))
        var marks_line = ' '.repeat(indent) +
            '^'.repeat(ast_obj.end_col_offset - indent)
        trace_lines.push('    ' + marks_line.substr(min_indent))
    }
    trace.push(trace_lines.join('\n'))
}

function find_char(text, start_pos, line, test_func){
    // Scan the characters in text starting at start pos
    // position pos
    // return {char_position, char_lineno}
    var pos = start_pos
    var char_line = line
    while(pos < text.length){
        if(text[pos] == '#'){
            // skip comment
            pos++
            while(pos < text.length && text[pos] != '\n'){
                pos++
            }
        }else if(test_func(text[pos])){
            // skip if a test function is provided and succeeds for current
            // character
            pos++
        }else{
            return {pos, lineno: char_line}
        }
    }
    return {pos, lineno: char_line}
}

function handle_Subscript_error(lines, positions, ast_obj, trace, text){
    // lines is the original source code lines
    // positions is [lineno, end_lineno, col_offset, end_col_offset] of
    // the Call instance in source code
    // text is the source code of the call
    // ast_obj is the ast.Call instance found in the segment '(\n{text}\n)
    // Position of the call
    //                  in source code   in segment
    // lineno           positions[0]     2
    // end_lineno       positions[1]     2 + positions[1 - positions[0]
    // col_offset       positions[2]     positions[2]
    // end_col_offset   positions[3]     positions[3]

    // Mark '~' from function name start to last char before '('
    // and '^' from the opening '(' to the closing ')'
    // f (x)
    // ~~^^^
    var trace_lines = []
    var [lineno, end_lineno, col_offset, end_col_offset] = positions
    var min_indent = get_min_indent(lines.slice(lineno - 1, end_lineno))
    // subscript is value[slice]
    var value = ast_obj.value
    var value_pos = {
        lineno: value.lineno - 2 + lineno,
        end_lineno: value.end_lineno - 2 + lineno,
        col_offset: value.col_offset,
        end_col_offset: value.end_col_offset
    }
    var slice = ast_obj.slice
    var slice_pos = {
        lineno: slice.lineno - 2 + lineno,
        end_lineno: ast_obj.end_lineno - 2 + lineno,
        col_offset: ast_obj.slice.col_offset,
        end_col_offset: ast_obj.end_col_offset
    }
    var marks = ''
    var in_value = make_test_func(value_pos)
    var in_slice = make_test_func(slice_pos)

    var mark_lines = []
    var value_started = false
    var bracket_found = false
    for(var lnum = lineno; lnum <= end_lineno; lnum++){
        var line = lines[lnum - 1].trimRight()
        var indent = get_indent(line)
        var marks = ' '.repeat(indent)
        var col = indent
        for(; col < line.length; col++){
            if(in_value(lnum, col)){
                value_started = true
                marks += '~'
            }else{
                // '~' until the opening bracket. It is on the same line as
                // function end
                if(value_started && ! bracket_found){
                    if(line[col] == '['){
                        marks += '^'
                        bracket_found = true
                    }else{
                        marks += '~'
                    }
                }else if(in_slice(lnum, col)){
                    marks += '^'
                }
            }
        }
        mark_lines.push(marks)
    }
    for(var i = 0; i < mark_lines.length; i++){
        trace_lines.push('    ' + lines[lineno + i - 1].trimRight().substr(min_indent))
        trace_lines.push('    ' + mark_lines[i].substr(min_indent))
    }
    trace.push(trace_lines.join('\n'))
}


function make_report(lines, positions){
    // positions is [lineno, end_lineno, col_offset, end_col_offset]
    // Return a string with the lines between lineno and end_lineno,
    // with a 4-whitespace indentation
    // If end_lineno - lineno > 2 don't report intermediate lines
    var [lineno, end_lineno, col_offset, end_col_offset] = positions
    lines = lines.slice(lineno - 1, end_lineno)
    var min_indent = get_min_indent(lines)
    lines = lines.map(line => '    ' + line.substr(min_indent).trimRight())
    if(lines.length > 3){
        lines = [lines[0], `    ...<${lines.length - 2} lines>...`,
            lines[lines.length - 1]]
    }
    return lines.join('\n')
}

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
        count_repeats = 0,
        tb = err.__traceback__

    var is_syntax_error = $B.is_exc(err, [_b_.SyntaxError])
    while(tb !== _b_.None){
        let frame = tb.tb_frame,
            lineno = tb.tb_lineno,
            filename = frame.__file__,
            scope = frame[0] == frame[2] ? '<module>' : frame[0]
        if(filename == save_filename && scope == save_scope && lineno == save_lineno){
            count_repeats++
            tb = tb.tb_next
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
            var lines = src.split('\n')
            // PEP 657
            var positions
            if(! is_syntax_error && frame.inum && frame.positions){
                positions = frame.positions[Math.floor(frame.inum / 2)]
            }
            if(positions){
                let [lineno, end_lineno, col_offset, end_col_offset] = positions
                // part of first line before error
                var head = lines[lineno - 1].substr(0, col_offset)
                var segment = ' '.repeat(col_offset)
                if(lineno == end_lineno){
                    segment += lines[lineno - 1].substring(col_offset, end_col_offset)
                }else{
                    segment += lines[lineno - 1].substr(col_offset) + '\n'
                    for(var lnum = lineno + 1; lnum < end_lineno; lnum++){
                        segment += lines[lnum - 1] + '\n'
                    }
                    var last = lines[end_lineno - 1].substr(0, end_col_offset)
                    segment += last
                }
                try{
                    var ast = $B.pythonToAST(`(\n${segment}\n)`, 'dummy', 'file')
                }catch(err){
                    // only show report
                    trace.push(make_report(lines, positions))
                    tb = tb.tb_next
                    continue
                }
                if(! (ast instanceof $B.ast.Module)){
                    console.log('not a module', ast)
                    continue
                }
                var expr = ast.body[0]
                var proto = Object.getPrototypeOf(expr)
                var marks
                switch(expr.constructor){
                    case $B.ast.Expr:
                        switch(expr.value.constructor){
                            case $B.ast.BinOp:
                                handle_BinOp_error(expr.value, trace, segment, head)
                                break
                            case $B.ast.Call:
                                handle_Call_error(lines, positions, expr.value, trace)
                                break
                            case $B.ast.Subscript:
                                handle_Subscript_error(lines, positions, expr.value, trace, segment)
                                break
                            default:
                                var ast_obj = {lineno, end_lineno, col_offset,
                                    end_col_offset}
                                handle_Expr_error(ast_obj, trace, lines)
                                break
                        }
                        break
                    default:
                        trace.push(make_trace_lines(segment, marks, '\n',
                            segment.split('\n'), expr.lineno, expr.end_lineno))

                }
            }else{
                trace.push('    ' + lines[lineno - 1].trim())
            }
        }else{
            console.log('no src for filename', filename)
            //console.log('in file_cache', Object.keys($B.file_cache).join('\n'))
        }

        tb = tb.tb_next
    }
    if(count_repeats > 1){
        let len = trace.length
        for(let i = 0; i < 2; i++){
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

$B.error_trace = function(err){
    var trace = '',
        has_stack = err.__traceback__ !== _b_.None

    var debug = $B.get_option('debug', err)
    if(debug > 1){
        console.log("handle error", err.__class__, err.args, err.__traceback__)
    }

    if(has_stack){
        trace = 'Traceback (most recent call last):\n'
    }
    if(err.__class__ === _b_.SyntaxError ||
            err.__class__ === _b_.IndentationError){
        trace += trace_from_stack(err)
        if(err.args.length > 0){
            var filename = err.filename,
                line = err.text
            if(line !== _b_.None){
                var indent = line.length - line.trimLeft().length
                trace += `  File "${filename}", line ${err.args[1][1]}\n` +
                             `    ${line.trim()}\n`
            }
        }
        if(err.__class__ !== _b_.IndentationError &&
                err.text && err.text !== _b_.None){
            // add ^ under the line
            if($B.get_option('debug') > 2){
                console.log('debug from error', $B.get_option('debug', err))
                console.log('error args', err.args[1])
                console.log('err line', line)
                console.log('indent', indent)
            }
            var end_lineno = err.end_lineno === _b_.None ? err.lineno : err.end_lineno
            var end_offset = err.end_offset === _b_.None ? err.offset : err.end_offset
            var start = err.offset - indent - 1,
                end_offset = end_offset - 1 +
                    (end_offset == err.offset ? 1 : 0),
                marks = '    ' + ' '.repeat(Math.max(0, start)),
                nb_marks = 1
            if(end_lineno > err.lineno){
                nb_marks = line.length - start - indent
            }else{
                nb_marks = end_offset - start - indent
            }
            if(nb_marks == 0 &&
                    end_offset == line.substr(indent).length){
                nb_marks = 1
            }
            marks += '^'.repeat(nb_marks) + '\n'
            trace += marks
        }

        trace += `${err.__class__.__name__}: ${err.args[0] ?? '<no detail available>'}`
    }else if(err.__class__ !== undefined){
        var name = $B.class_name(err)
        trace += trace_from_stack(err)
        var args_str = _b_.str.$factory(err)
        trace += name + (args_str ? ': ' + args_str : '')
        var save_frame_obj = $B.frame_obj
        $B.frame_obj = err.$frame_obj
        if(err.__class__ === _b_.NameError){
            let suggestion = $B.offer_suggestions_for_name_error(err)
            if(suggestion !== _b_.None && suggestion !== err.name){
                trace += `. Did you mean: '${suggestion}'?`
            }
            if($B.stdlib_module_names.indexOf(err.name) > -1){
                // new in 3.12
                trace += `. Did you forget to import '${err.name}'?`
            }
        }else if(err.__class__ === _b_.AttributeError){
            let suggestion = $B.offer_suggestions_for_attribute_error(err)
            if(suggestion !== _b_.None){
                trace += `. Did you mean: '${suggestion}'?`
            }
        }else if(err.__class__ === _b_.ImportError){
            if(err.$suggestion !== _b_.None){
                trace += `. Did you mean: '${err.$suggestion}'?`
            }
        }
        $B.frame_obj = save_frame_obj
    }else{
        trace = err + ""
    }
    if(err.$js_exc){
        trace += '\n'
        if($B.get_option('debug', err) > 1){
            trace += err.$js_exc.stack
        }
    }
    return trace
}

$B.get_stderr = function(){
    return $B.imported.sys ? $B.imported.sys.stderr : $B.imported._sys.stderr
}

$B.get_stdout = function(){
    return $B.imported.sys ? $B.imported.sys.stdout : $B.imported._sys.stdout
}

$B.show_error = function(err){
    var trace = $B.error_trace($B.exception(err))
    try{
        var stderr = $B.get_stderr()
        $B.$getattr(stderr, 'write')(trace)
        var flush = $B.$getattr(stderr, 'flush', _b_.None)
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

