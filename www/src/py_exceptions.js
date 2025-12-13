"use strict";
(function($B){

var _b_ = $B.builtins

$B.del_exc = function(frame){
    delete frame[1].$current_exception
}

$B.set_exc = function(exc, frame){
    exc.__traceback__ = exc.__traceback__ === _b_.None ? make_tb() : exc.__traceback__
    if(! exc.__class__){
        console.log('no class', exc)
    }
    exc.__class__ = exc.__class__ ?? _b_.JavascriptError
    exc.args = exc.args ?? [exc.message]
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
        $B.RAISE(_b_.RuntimeError, "No active exception to reraise")
    }else{
        if($B.$isinstance(arg, _b_.BaseException)){
            if(arg.__class__ === _b_.StopIteration &&
                    $B.frame_obj.frame.$is_generator){
                // PEP 479
                arg = $B.EXC(_b_.RuntimeError, "generator raised StopIteration")
            }
            arg.__context__ = active_exc === undefined ? _b_.None : active_exc
            arg.__cause__ = cause || _b_.None
            arg.__suppress_context__ = cause !== undefined
            throw arg
        }else if(arg.$is_class && _b_.issubclass(arg, _b_.BaseException)){
            if(arg === _b_.StopIteration){
                if($B.frame_obj.frame[1].$is_generator){
                    // PEP 479
                    $B.RAISE(_b_.RuntimeError, "generator raised StopIteration")
                }
            }
            var exc = $B.$call(arg)()
            exc.__context__ = active_exc === undefined ? _b_.None : active_exc
            exc.__cause__ = cause || _b_.None
            exc.__suppress_context__ = cause !== undefined
            throw exc
        }else{
            $B.RAISE(_b_.TypeError, "exceptions must derive from BaseException")
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

frame.f_builtins = $B.getset_descriptor.$factory(
    frame,
    'f_builtins',
    function(_self){
        return $B.$getattr(_self[3].__builtins__, '__dict__')
    }
)

frame.f_code = $B.getset_descriptor.$factory(
    frame,
    'f_code',
    function(_self){
        var res
        var positions = [[0, 0, 0, 0]] // fake value
        if(_self[4]){
            res = $B.$getattr(_self[4], '__code__')
            positions = _self.positions ?? positions
        }else if(_self.f_code){
            // set in comprehensions
            res = _self.f_code
        }else{
            res = {
                co_name: (_self[0] == _self[2] ? '<module>' : _self[0]),
                co_filename: _self.__file__,
                co_varnames: $B.fast_tuple([]),
                co_firstlineno: 1
            }
            res.co_qualname = res.co_name // XXX
            positions = _self.positions ?? positions
        }
        res.__class__ = _b_.code
        positions = positions.map($B.decode_position)
        res.co_positions = () => $B.$list(positions)
        res.co_positions.__class__ = $B.function
        return res
    }
)

frame.f_globals = $B.getset_descriptor.$factory(
    frame,
    'f_globals',
    function(_self){
        if(_self.f_globals){
            return _self.f_globals
        }else if(_self.f_locals && _self[1] == _self[3]){
            return _self.f_globals = _self.f_locals
        }else{
            return _self.f_globals = $B.obj_dict(_self[3])
        }
    }
)

frame.f_lineno = $B.getset_descriptor.$factory(
    frame,
    'f_lineno',
    function(_self){
        return _self.$lineno
    }
)

frame.f_locals = $B.getset_descriptor.$factory(
    frame,
    'f_locals',
    function(_self){
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
)

frame.f_trace =$B.getset_descriptor.$factory(
    frame,
    'f_trace',
    function(_self){
        return _self.$f_trace
    }
)

$B.set_func_names(frame, "builtins")
$B._frame = frame // used in builtin_modules.js

$B.make_f_code = function(frame, varnames){
    // create attribute f_code of generator expressions frame
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
        if(true){ // $B.get_option('debug', exc) > 1){
            console.log('Javascript error', js_exc)
            console.log(js_exc.stack)
        }
        var msg = js_exc.name + ': ' + js_exc.message
        exc = $B.EXC(_b_.JavascriptError, msg)
        exc.$js_exc = js_exc
        if($B.is_recursion_error(js_exc)){
            msg = "maximum recursion depth exceeded"
            exc = $B.EXC(_b_.RecursionError, msg)
        }
        exc.__cause__ = _b_.None
        exc.__context__ = _b_.None
        exc.__suppress_context__ = false
        exc.__traceback__ = traceback.$factory(js_exc)
        exc.args = _b_.tuple.$factory([msg])
        exc.$py_error = true
        js_exc.$py_exc = exc
    }else{
        exc = js_exc
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

$B.RAISE = function(error_type, message){
    throw $B.$call(error_type)(message)
}

$B.RAISE_IF_NOT = function(exc, exc_type){
    if(! $B.$isinstance(exc, exc_type)){
        throw exc
    }
}

$B.RAISE_ATTRIBUTE_ERROR = function(message, obj, name){
    var exc = $B.EXC(_b_.AttributeError, message)
    exc.obj = obj
    exc.name = name
    throw exc
}

$B.EXC = function(error_type, message){
    return $B.$call(error_type)(message)
}

// built-in exceptions

function make_builtin_exception(exc_name, base, set_value){
    // Create a builtin exception class
    // If set_value is provided:
    // - if it is a string, set the attribute with this name to the value
    //   passed to the constructor
    // - if it is a function, call it with the exception instance as first
    //   argument, then the arguments passed to the constructor
    if(Array.isArray(exc_name)){
        for(var name of exc_name){
            make_builtin_exception(name, base, set_value)
        }
        return
    }
    var exc_class = $B.make_class(exc_name)
    /*,
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
    */
    exc_class.tp_bases = [base]
    exc_class.__mro__ = _b_.type.$mro(exc_class).slice(1)
    $B.set_func_names(exc_class, 'builtins')
    _b_[exc_name] = exc_class
}

make_builtin_exception("BaseException", _b_.object)

function check_no_keywords(obj, kw){
    try{
        if(_b_.len(kw)){
            $B.RAISE(_b_.TypeError, `${$B.class_name(obj)}() takes no keyword arguments`)
        }
    }catch(err){
        console.log('no len for kw', kw)
        alert()
    }
}

_b_.BaseException.__init__ = function(){
    var $ = $B.args('__init__', 1, {self: null}, ['self'], arguments, {}, 'args', 'kw')
    check_no_keywords($.self, $.kw)
    $.self.args = $B.fast_tuple($.args)
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
    var $ = $B.args('__new__', 1, {cls: null}, ['cls'], arguments, {}, 'args', 'kw')
    var res = {
        __class__: $.cls,
        ob_type: $.cls,
        __dict__: $B.empty_dict(),
        args: $B.fast_tuple($.args),
        notes: _b_.None,
        __traceback__: _b_.None,
        __cause__: _b_.None,
        __context__: _b_.None,
        __suppress_context__: false
    }
    return res
}

_b_.BaseException.__getattr__ = function(self, attr){
    switch(attr){
        case '__context__':
            var frame = $B.frame_obj.frame,
                ctx = frame[1].$current_exception
            return ctx || _b_.None
        case '__cause__':
        case '__suppress_context__':
            return self[attr] ?? _b_.None
        default:
            throw $B.attr_error(attr, self)
    }
}

_b_.BaseException.add_note = function(self, note){
    // PEP 678
    if(! $B.$isinstance(note, _b_.str)){
        $B.RAISE(_b_.TypeError, 'note must be a str, not ' +
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

make_builtin_exception("StopIteration", _b_.Exception)

_b_.StopIteration.__init__ = function(){
    var $ = $B.args("StopIteration", 1, {self: null},
                ['self'], arguments, {}, 'args', 'kw')
    check_no_keywords($.self, $.kw)
    _b_.BaseException.__init__($.self, ...$.args)
    if($.args.length > 0){
        $.self.value = $.args[0]
    }
}

_b_.StopIteration.value = $B.getset_descriptor.$factory(
    _b_.StopIteration,
    'value',
    function(_self){
        return _self.value ?? _b_.None
    },
    function(_self, value){
        _self.value = value
    }
)

$B.set_func_names(_b_.StopIteration, 'builtins')

make_builtin_exception("StopAsyncIteration", _b_.Exception)
make_builtin_exception("ImportError", _b_.Exception)

_b_.ImportError.__init__ = function(){
    var $ = $B.args("ImportError", 1, {self: null},
                ['self'], arguments, {}, 'args', 'kw')
    _b_.BaseException.__init__($.self, ...$.args)
    $B.set_expected_kwargs($.self, ['name', 'path'], $.kw)
}

$B.set_func_names(_b_.ImportError, 'builtins')

make_builtin_exception("SyntaxError", _b_.Exception)

_b_.SyntaxError.__init__ = function(){
    var $ = $B.args('SyntaxError', 1, {self: null},
                ['self'], arguments, {}, 'args', 'kw')
    var _self = $.self,
        args = $.args,
        kw = $.kw
    check_no_keywords(_self, kw)

    _self.msg = args[0] ?? _b_.None
    _self.args = $B.fast_tuple(Array.from(args))
    var details = []
    if(args.length > 1){
        details = args[1]
        if(details.length > 0){
            details = _b_.tuple.$factory(details)
            if(details.length < 4){
                $B.RAISE(_b_.TypeError,
                    `function takes at least 4 arguments (${args.length} given)`)
            }
            if(details.length > 6){
                $B.RAISE(_b_.TypeError,
                    `function takes at most 6 arguments (${args.length} given)`)
            }
        }
    }
    let attrs = ['filename', 'lineno', 'offset', 'text', 'end_lineno',
                 'end_offset'],
        expected_types = [_b_.str, _b_.int, _b_.int, _b_.str, _b_.int,
                 _b_.int]
    for(var i = 0; i < attrs.length; i++){
        if(details[i] !== undefined){
            if(! $B.$isinstance(details[i], expected_types[i])){
                $B.RAISE(_b_.TypeError, `item #${i + 1} (${attrs[i]}) ` +
                    `of the second argument of SyntaxError should be ` +
                    `'${expected_types[i].__name__}', not ` +
                    `'${$B.class_name(details[i])}'`)
            }
            _self[attrs[i]] = details[i]
        }else{
            _self[attrs[i]] = _b_.None
        }
    }
}

$B.set_func_names(_b_.SyntaxError, 'builtins')

make_builtin_exception(["FloatingPointError", "OverflowError",
    "ZeroDivisionError"], _b_.ArithmeticError)

make_builtin_exception("ModuleNotFoundError", _b_.ImportError)

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

// special case for KeyError.__str__ (cf. issue #2582)
_b_.KeyError.__str__ = function(self){
    if(self.args.length == 1){
        return _b_.repr(self.args[0])
    }
    return _b_.BaseException.__str__(self)
}

$B.set_func_names(_b_.KeyError, 'builtins')

$B.set_expected_kwargs = function(obj, expected, kwargs){
    for(var item of _b_.dict.$iter_items(kwargs)){
        if(expected.includes(item.key)){
            obj[item.key] = item.value
        }else{
            var msg = `${$B.class_name(obj)}()  got an unexpected ` +
                      `keyword argument '${item.key}'`
            var suggestions = calculate_suggestions(expected, item.key)
            if(suggestions){
                msg += `. Did you mean '${suggestions}'?`
            }
            $B.RAISE(_b_.TypeError, msg)
        }
    }
}

// AttributeError supports keyword-only "name" and "obj" parameters
_b_.AttributeError = $B.make_class('AttributeError')

_b_.AttributeError.__init__ = function(){
    var $ = $B.args("AttributeError", 1, {self: null},
                ['self'], arguments, {}, 'args', 'kw')
    _b_.BaseException.__init__($.self, ...$.args)
    $B.set_expected_kwargs($.self, ['name', 'obj'], $.kw)
}

_b_.AttributeError.tp_bases = [_b_.Exception]
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
    return $B.$call(_b_.AttributeError)(msg, {$kw:[{name, obj}]})
}

// NameError supports keyword-only "name" parameter
_b_.NameError = $B.make_class('NameError')

_b_.NameError.tp_bases = [_b_.Exception]
_b_.NameError.__mro__ = _b_.type.$mro(_b_.NameError).slice(1)

_b_.NameError.__init__ = function(){
    var $ = $B.args('__init__', 1, {self: null}, ['self'], arguments, {}, 'args', 'kw')
    _b_.BaseException.__init__($.self, ...$.args)
    $B.set_expected_kwargs($.self, ['name'], $.kw)
}

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
    var exc = $B.$call(_b_.NameError)(`name '${name}' is not defined`)
    exc.name = name
    return exc
}

$B.recursion_error = function(frame){
    var exc = $B.$call(_b_.RecursionError)("maximum recursion depth exceeded")
    $B.set_exc(exc, frame)
    return exc
}

// Suggestions in case of NameError or AttributeError

function calculate_suggestions(list, name){
    return $B.imported._suggestions._generate_suggestions(list, name)
}

$B.offer_suggestions_for_attribute_error = function(exc){
    console.log('offer suggestions', exc)
    var name = exc.name,
        obj = exc.obj
    if(name === _b_.None || name === undefined ||
            obj === _b_.None || obj === undefined){
        return _b_.None
    }
    try{
        var dir = _b_.dir(obj)
    }catch(err){
        console.log('error in dir, attribute error', name, obj)
        console.log(err)
        throw err
    }
    var suggestions = calculate_suggestions(dir, name)
    return suggestions || _b_.None
}

$B.offer_suggestions_for_name_error = function(exc, frame){
    var name = exc.name
    if(typeof name != 'string'){
        return _b_.None
    }
    var tb = exc.__traceback__
    if(tb === undefined || tb === _b_.None){
        return _b_.None
    }
    while(tb.tb_next !== _b_.None){
        tb = tb.tb_next
    }
    var frame = tb.tb_frame
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
_b_.BaseExceptionGroup = $B.make_class("BaseExceptionGroup")

_b_.BaseExceptionGroup.__new__ = function(){
    var missing = {},
        $ = $B.args("BaseExceptionGroup", 3,
                    {cls: null, message: null, exceptions: null},
                    ['cls', 'message', 'exceptions'], arguments,
                    {exceptions: missing}, null, null)
    var cls = $.cls
    var exceptions = $.exceptions === missing ? [] : $.exceptions
    if(exceptions !== _b_.None){
        var exc_list = _b_.list.$factory(exceptions)
        var all_exceptions = true
        for(var exc of exc_list){
            if(! $B.$isinstance(exc, _b_.Exception)){
                all_exceptions = false
                break
            }
        }
        if(all_exceptions){
            cls = _b_.ExceptionGroup
        }
    }
    var args = Array.from(arguments).slice(1)
    var exc = _b_.BaseException.__new__(cls, ...args)
    exc.message = $.message
    exc.exceptions = exceptions
    return exc
}

_b_.BaseExceptionGroup.tp_bases = [_b_.BaseException]

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
                    $B.RAISE(_b_.TypeError,
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

_b_.ExceptionGroup.tp_bases = [_b_.BaseExceptionGroup, _b_.Exception]
_b_.ExceptionGroup.__mro__ = _b_.type.$mro(_b_.ExceptionGroup)


$B.set_func_names(_b_.ExceptionGroup, "builtins")

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

function make_trace_lines(lines, lineno, expr){
    // expr is an expression inside a code segment
    // Returns the lines of the segment, 4-space indented
    var line_start = expr.lineno + lineno - 2
    var line_end = expr.end_lineno + lineno - 2
    return make_report(lines,
        [line_start, line_end, expr.col_offset, expr.end_col_offset])
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

function fill_marks(lines, first_lineno, first_col_offset){
    // Create the marks (~ and ^) to be insered under source code lines in
    // traceback
    // lines: list of lines in original source
    // first_lineno, first_col_offset: first line number and column offset
    //     of the code where the exception was raised
    // The next arguments are of the form mark, lineno, col_offset where
    //   mark: the sign (' ', '~' or '^') to show in traceback
    //   lineno, col_offset: the position where the mark should stop

    var args = Array.from(arguments).slice(3)
    var start_lineno = first_lineno
    var start_col_offset = first_col_offset
    // first line: write spaces from line start to first col offset
    var marks = ' '.repeat(first_col_offset)
    var line
    var indent
    for(var i = 0; i < args.length; i += 3){
        var [mark, lineno, col_offset] = args.slice(i, i + 3)
        // write mark from (start_lineno, start_col_offset) to
        // (lineno, col_offset)
        if(lineno == start_lineno){
            marks += mark.repeat(col_offset - start_col_offset)
        }else{
            line = lines[start_lineno - 1]
            marks += mark.repeat(line.length - start_col_offset) + '\n'
            for(var lnum = start_lineno + 1; lnum < lineno; lnum++){
                line = lines[lnum - 1].trimRight()
                indent = get_indent(line)
                marks += ' '.repeat(indent) + mark.repeat(line.length - indent) + '\n'
            }
            line = lines[lineno - 1].trimRight()
            indent = get_indent(line)
            marks += ' '.repeat(indent) + mark.repeat(col_offset - indent)
        }
        start_lineno = lineno
        start_col_offset = col_offset
    }
    var marks_lines = marks.split('\n')
    // adapt indentation
    var min_indent = get_min_indent(lines.slice(first_lineno - 1, lineno))
    var err_lines = []
    for(var lnum = 0; lnum < marks_lines.length; lnum++){
        err_lines.push('    ' +
            lines[first_lineno + lnum - 1].trimRight().substr(min_indent))
        err_lines.push('    ' + marks_lines[lnum].substr(min_indent))
    }
    return err_lines.join('\n')
}

function make_line_setter(lineno){
    // Return the function that returns coordinates in code segment to
    // coordinates in original source code
    // lineno is the line number of the problematic code
    // The segment is `(\n{text}\n)`. The line feed explains why the lineno
    // offset is lineno - 2
    return function(coords){
        return {
            lineno: coords.lineno + lineno - 2,
            end_lineno: coords.end_lineno + lineno - 2,
            col_offset: coords.col_offset,
            end_col_offset: coords.end_col_offset
        }
    }
}

function handle_BinOp_error(lines, lineno, ast_obj, tokens){
    // lines: original source code lines
    // lineno: line number of the first line in BinOp in original source
    // ast_obj: the ast.BinOp instance found in the segment
    // tokens: list of tokens found in the segment

    var reset_lineno = make_line_setter(lineno)

    // get position of operator = the last OP token different from '(' before
    // right operand
    var operator
    for(var token of tokens){
        if(token.type == $B.py_tokens.OP){
            if(is_before(ast_obj.right, token.lineno, token.col_offset)
                    && token.string != '('){
                operator = reset_lineno(token)
            }
        }
    }

    // Get last token in BinOp
    var end_binop = reset_lineno(tokens[tokens.length - 1])

    var left = reset_lineno(ast_obj.left)

    // marks are '~' from left start to operator excluded, '^' for operator,
    // and '~' from operator end to right end
    return fill_marks(lines, lineno, left.col_offset,
               '~', operator.lineno, operator.col_offset,
               '^', operator.end_lineno, operator.end_col_offset,
               '~', end_binop.end_lineno, end_binop.end_col_offset)
}


function handle_Call_error(lines, lineno, ast_obj, tokens){
    // same argments as in handle_BinOP_error
    var reset_lineno = make_line_setter(lineno)

    // get position of
    // - opening parenthesis = the first OP token '(' after ast_obj.func end
    // - closing parenthesis = the last OP token ')'
    var opening_parenth
    var closing_parenth

    for(var token of tokens){
        if(token.type == $B.py_tokens.OP){
            if(token.string == '(' && ! opening_parenth &&
                    token.lineno == ast_obj.func.end_lineno &&
                    token.col_offset >= ast_obj.func.end_col_offset){
                opening_parenth = reset_lineno(token)
            }else if(token.string == ')'){
                closing_parenth = reset_lineno(token)
            }
        }
    }
    var func = reset_lineno(ast_obj.func)
    // marks are '~' from func start to opening parenthesis excluded
    // and '^' from opening to closing parenthesis included
    return fill_marks(lines, lineno, func.col_offset,
        '~', opening_parenth.lineno, opening_parenth.col_offset,
        '^', closing_parenth.end_lineno, closing_parenth.end_col_offset)
}


function handle_Expr_error(lines, lineno, ast_obj){
    var reset_lineno = make_line_setter(lineno)
    var expr = reset_lineno(ast_obj)
    // marks are '^' under the expression
    return fill_marks(lines, lineno, expr.col_offset,
                      '^', expr.end_lineno, expr.end_col_offset)
}

function is_before(obj, lineno, col){
    // Determines if position (lineno, col) is before the ast object ast_obj
    return lineno < obj.lineno ||
           (lineno == obj.lineno && col < obj.col_offset)
}

function handle_Subscript_error(lines, lineno, ast_obj, tokens){
    // same arguments as handle_BinOp_error

    var reset_lineno = make_line_setter(lineno)

    // get position of
    // - opening bracket = the last OP token '[' before ast_obj.slice start
    // - closing bracket = the last OP token ']'
    for(var token of tokens){
        if(token.type == $B.py_tokens.OP){
            if(token.string == '[' &&
                    is_before(ast_obj.slice, token.lineno, token.col_offset)){
                var opening_bracket = reset_lineno(token)
            }else if(token.string == ']'){
                var closing_bracket = reset_lineno(token)
            }
        }
    }
    var value = reset_lineno(ast_obj.value)

    // marks are '~' from value start to opening bracket excluded
    // and '^' from opening bracket to closing bracket included
    return fill_marks(lines, lineno, value.col_offset,
        '~', opening_bracket.lineno, opening_bracket.col_offset,
        '^', closing_bracket.end_lineno, closing_bracket.end_col_offset)
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
        trace.push(`  File "${filename}", line ${lineno}, in ` +
            (frame[0] == frame[2] ? '<module>' : frame[0]))
        var src
        if(! filename.startsWith('<')){
            src = $B.file_cache[filename]
        }
        if(src){
            var lines = src.split('\n')
            // PEP 657
            var positions = false
            if(! is_syntax_error && frame.inum && frame.positions){
                positions = $B.decode_position(
                    frame.positions[Math.floor(frame.inum / 2)])
            }
            if(positions){
                let [lineno, end_lineno, col_offset, end_col_offset] = positions
                // part of first line before error
                if(lines[lineno - 1] === undefined){
                    console.log('no line, lines\n', lines, 'lineno', lineno)
                    console.log('filename', filename, 'src', src)
                    continue
                }
                var head = lines[lineno - 1].substr(0, col_offset)
                // start with whitespaces to preserve col_offset in the ast
                var segment = ' '.repeat(col_offset)
                if(lineno == end_lineno){
                    segment += lines[lineno - 1].substring(col_offset, end_col_offset)
                }else{
                    segment += lines[lineno - 1].substr(col_offset) + '\n'
                    for(var lnum = lineno + 1; lnum < end_lineno; lnum++){
                        segment += lines[lnum - 1] + '\n'
                    }
                    segment += lines[end_lineno - 1].substr(0, end_col_offset)
                }
                // parse the source code again; wrap it inside parenthesis to
                // avoid syntax errors if it is an expression on several lines
                try{
                    let parser = new $B.Parser(`(\n${segment}\n)`,
                        'test', 'file')
                    var ast = $B._PyPegen.run_parser(parser)
                    var tokens = parser.tokens
                    // remove leading '(' and trailing ')', NEWLINE, ENDMARKER
                    tokens = tokens.slice(1, tokens.length - 3)
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
                var marks = ''
                switch(expr.constructor){
                    case $B.ast.Expr:
                        try{
                            switch(expr.value.constructor){
                                case $B.ast.BinOp:
                                    trace.push(handle_BinOp_error(
                                        lines, lineno, expr.value, tokens))
                                    break
                                case $B.ast.Call:
                                    trace.push(handle_Call_error(
                                        lines, lineno, expr.value, tokens))
                                    break
                                case $B.ast.Subscript:
                                    trace.push(handle_Subscript_error(
                                        lines, lineno, expr.value, tokens))
                                    break
                                default:
                                    trace.push(handle_Expr_error(
                                        lines, lineno, expr.value))
                                    break
                            }
                        }catch(err){
                            if($B.get_option('debug') > 1){
                                console.log('error in error handlers', err)
                            }
                            // Fallback in case of internal error
                            trace.push(make_trace_lines(lines, lineno, expr))
                        }
                        break
                    default:
                        trace.push(make_trace_lines(lines, lineno, expr))
                }
            }else{
                trace.push('    ' + lines[lineno - 1].trim())
            }
        }else{
            if($B.get_option('debug') > 1){
                console.log('no src for filename', filename)
            }
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

var python_keywords

function _find_keyword_typos(err){
    // copied from the traceback module
    if(err.msg != "invalid syntax" && ! err.msg.includes("Perhaps you forgot a comma")){
        return
    }
    let [line, offset, source] = err._metadata
    let end_line = self.lineno === _b_.None ? 0 : self.lineno
    let lines = source.split('\n')
    var error_code
    if(line > 0){
        error_code = [lines[line - 1]]
    }else{
        error_code = lines.slice(0, end_line)
    }
    var indent = Math.min(...error_code.map(x => x.length - x.trimLeft().length))
    var error_code_lines = error_code.map(x => x.substr(indent))
    error_code = error_code_lines.join('\n')
    // Do not continue if the source is too large
    if(error_code.length > 1024){
        return
    }
    if(python_keywords === undefined){
        python_keywords = Object.keys($B.python_keywords)
    }
    for(let token of $B.tokenizer(error_code, '<debug>', 'exec')){
        if(token.type == $B.py_tokens['NAME']){
            if(python_keywords.includes(token.string)){
                continue
            }
            var suggestions = calculate_suggestions(python_keywords, token.string)
            if(suggestions){
                console.log(token.lineno)
                var new_line = token.line.substr(0, token.col_offset) +
                               suggestions + token.line.substr(token.end_col_offset)
                var new_lines = error_code_lines.slice()
                new_lines.splice(token.lineno - 1,
                                    1, new_line)
                var candidate = new_lines.join('\n')
                var found = false
                try{
                    var parser = new $B.Parser(candidate, '<debug>', 'file')
                    parser.flags = $B.PyCF_ALLOW_INCOMPLETE_INPUT
                    var _ast = $B._PyPegen.run_parser(parser)
                    found = true
                }catch(err){
                    if($B.is_exc(err, [_b_._IncompleteInputError])){
                        found = true
                    }
                }
                if(found){
                    err.args[1][2] = err.offset = token.col_offset
                    err.args[1][5] = err.end_offset = token.end_col_offset
                    err.args[0] = err.msg = `invalid syntax. Did you mean '${suggestions}'?`
                    return
                }
            }

        }
    }
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
            if(err._metadata){
                _find_keyword_typos(err)
            }
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
            console.log('attriute error stack', err.__traceback__)
            let suggestion = $B.offer_suggestions_for_attribute_error(err)
            if(suggestion !== _b_.None){
                trace += `. Did you mean: '${suggestion}'?`
            }
        }else if(err.__class__ === _b_.ImportError){
            if(err.$suggestion !== _b_.None){
                trace += `. Did you mean: '${err.$suggestion}'?`
            }
        }
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
    if($B.get_option('debug', err) > 2){
        console.debug(err.stack)
    }
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
    console.log('handle error', $B.frame_obj)
    if(err.$handled){
        return
    }
    err.$handled = true
    $B.show_error(err)

    // Throw the error to stop execution
    throw err
}

})(__BRYTHON__);

