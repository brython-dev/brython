;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

$B.$raise = function(arg){
    // Used for "raise" without specifying an exception.
    // If there is an exception in the stack, use it, else throw a simple
    // Exception
    if(arg === undefined){
        var es = $B.current_exception
        if(es !== undefined){throw es}
        throw _b_.RuntimeError.$factory("No active exception to reraise")
    }else if(isinstance(arg, BaseException)){
        throw arg
    }else if(arg.$is_class && issubclass(arg, BaseException)){
        throw $B.$call(arg)()
    }else{
        throw _b_.TypeError.$factory("exceptions must derive from BaseException")
    }
}

$B.$syntax_err_line = function(exc, module, pos, line_num){
    // map position to line number
    var pos2line = {},
        lnum = 1,
        src = $B.$py_src[module],
        module = module.charAt(0) == "$" ? "<string>" : module
    if(src === undefined){
        console.log("no src for", module)
        exc.$line_info = line_num + ',' + module
        exc.args = _b_.tuple.$factory([$B.$getitem(exc.args, 0), module,
            line_num, 0, 0])
    }else{
        var line_pos = {1:0}
        for(var i = 0, len = src.length; i < len; i++){
            pos2line[i] = lnum
            if(src.charAt(i) == "\n"){line_pos[++lnum] = i}
        }
        while(line_num === undefined){
            line_num = pos2line[pos]
            pos--
        }
        exc.$line_info = line_num + "," + module

        var lines = src.split("\n"),
            line = lines[line_num - 1],
            lpos = pos - line_pos[line_num],
            len = line.length
        line = line.replace(/^\s*/,'')
        lpos -= len - line.length
        exc.args = _b_.tuple.$factory([$B.$getitem(exc.args, 0), module,
            line_num, lpos, line])
    }
}

$B.$SyntaxError = function(module, msg, pos, line_num, root) {
    if(root !== undefined && root.line_info !== undefined){
        // this may happen for syntax errors inside a lambda
        line_num = root.line_info
    }
    var exc = _b_.SyntaxError.$factory(msg)
    $B.$syntax_err_line(exc, module, pos, line_num)
    throw exc
}

$B.$IndentationError = function(module, msg, pos) {
    var exc = _b_.IndentationError.$factory(msg)
    $B.$syntax_err_line(exc, module, pos)
    throw exc
}


// class of traceback objects
var traceback = $B.make_class("traceback",
    function(exc, stack){
        if(stack===undefined)
            stack=exc.$stack
        return {
            __class__ : traceback,
            $stack: stack,
            exc: exc
        }
    }
)

traceback.__getattribute__ = function(self, attr){
    var line_info;
    if (attr === 'tb_frame' ||
        attr === 'tb_lineno' ||
        attr === 'tb_lasti' ||
        attr === 'tb_next') {
        if(self.$stack.length == 0){
            console.log("no stack", attr)
        }
        var last_frame = $B.last(self.$stack)
        if(last_frame === undefined){
            console.log("last frame undef", self.$stack, Object.keys(self.$stack))
        }
        var line_info = last_frame[1].$line_info
    }

    switch(attr){
        case "tb_frame":
            return frame.$factory(self.$stack)
        case "tb_lineno":
            if(line_info === undefined){return -1}
            else{return parseInt(line_info.split(",")[0])}
        case "tb_lasti":
            if(line_info === undefined){return "<unknown>"}
            else{
                var info = line_info.split(",")
                var src = $B.$py_src[info[1]]
                if(src !== undefined){
                    return src.split("\n")[parseInt(info[0] - 1)].trim()
                }else{return "<unknown>"}
            }
        case "tb_next":
            if(self.$stack.length <= 2){return None}
            else{
                return traceback.$factory(self.exc,
                    self.$stack.slice(0, self.$stack.length - 2))
            }
        default:
            return _b_.object.__getattribute__(traceback, attr)
    }
}

$B.set_func_names(traceback, "builtins")

// class of frame objects
var frame = $B.make_class("frame",
    function(stack, pos){
        var fs = stack
        var res = {
            __class__: frame,
            f_builtins : {}, // XXX fix me
            $stack: stack,
        }
        if(pos === undefined){pos = fs.length - 1}
        res.$pos = pos
        if(fs.length){
            var _frame = fs[pos]
            var locals_id = _frame[0]
            try{
                res.f_locals = $B.obj_dict(_frame[1])
            }catch(err){
                console.log("err " + err)
                throw err
            }
            res.f_globals = $B.obj_dict(_frame[3])

            if(_frame[1].$line_info === undefined){res.f_lineno = -1}
            else{res.f_lineno = parseInt(_frame[1].$line_info.split(',')[0])}

            res.f_code = {__class__: $B.code,
                co_code: None, // XXX fix me
                co_name: locals_id, // idem
                co_filename: _frame[3].__name__ // idem
            }
            if(res.f_code.co_filename === undefined){
                console.log(_frame[0], _frame[1], _frame[2], _frame[3])
                alert("no cofilename")
            }
        }
        return res
    }
)

frame.__getattr__ = function(self, attr){
    // Used for f_back to avoid computing it when the frame object
    // is initialised
    if(attr == "f_back"){
        if(self.$pos > 0){
            return frame.$factory(self.$stack, self.$pos - 1)
        }
    }
}

$B.set_func_names(frame, "builtins")
$B._frame = frame // used in builtin_modules.js


// built-in exceptions

var BaseException = _b_.BaseException =  {
    __class__: _b_.type,
    __bases__ : [_b_.object],
    __module__: "builtins",
    __mro__: [_b_.object],
    __name__: "BaseException",
    args: [],
    $is_class: true
}

BaseException.__init__ = function(self){
    var args = arguments[1] === undefined ? [] : [arguments[1]]
    self.args = _b_.tuple.$factory(args)
}

BaseException.__repr__ = function(self){
    return self.__class__.__name__ + repr(self.args)
}

BaseException.__str__ = function(self){
    if (self.args.length > 0)
        return _b_.str.$factory(self.args[0])
    return self.__class__.__name__
}

BaseException.__new__ = function(cls){
    var err = _b_.BaseException.$factory()
    err.__class__ = cls
    return err
}

var getExceptionTrace = function(exc, includeInternal) {
    if(exc.__class__ === undefined){
        console.log("no class", exc)
        return exc + ''
    }else{
        var name = exc.__class__.__name__
        if(name == "SyntaxError" || name == "IndentationError"){
            return 'File "' + exc.args[1] + '", line ' + exc.args[2] +
                "\n    " + exc.args[4]
        }
    }

    var info = '';
    if(exc.$js_exc !== undefined && includeInternal){
        info += "\nJS stack:\n" + exc.$js_exc.stack + "\n"
    }
    info += "Traceback (most recent call last):"
    var line_info = exc.$line_info

    for(var i = 0; i < exc.$stack.length; i++){
        var frame = exc.$stack[i]
        if(! frame[1] || ! frame[1].$line_info){
            continue
        }
        var $line_info = frame[1].$line_info
        if(i == exc.$stack.length - 1 && exc.$line_info){
            $line_info = exc.$line_info
        }
        var line_info = $line_info.split(','),
            src
        if(exc.module == line_info[1]){
            src = exc.src
        }
        if(!includeInternal){
            var src = frame[3].$src
            if(src === undefined){
                if($B.VFS && $B.VFS.hasOwnProperty(frame[2])){
                    src = $B.VFS[frame[2]][1]
                }else{
                    continue
                }
            }
        }
        var module = line_info[1]
        if(module.charAt(0) == "$"){module = "<module>"}
        info += "\n  module " + module + " line " + line_info[0]
        if (frame.length > 4 && frame[4].$infos) {
            info += ', in ' + frame[4].$infos.__name__
        }

        if (src !== undefined) {
            var lines = src.split("\n");
            var line = lines[parseInt(line_info[0]) - 1]
            if(line){line = line.replace(/^[ ]+/g, "")}
            info += "\n    " + line
        }else{    console.log("src undefined for", frame[3]) }
    }
    return info
};

BaseException.__getattr__ = function(self, attr){

    if(attr == "info"){
        return getExceptionTrace(self, false);
    } else if (attr == "infoWithInternal") {
        return getExceptionTrace(self, true);
    }else if(attr == "traceback"){
        // Return traceback object
        return traceback.$factory(self)
    }else{
        throw _b_.AttributeError.$factory(self.__class__.__name__ +
            " has no attribute '" + attr + "'")
    }
}

BaseException.with_traceback = function(self, tb){
    self.traceback = tb
    return self
}

BaseException.$factory = function (){
    var err = Error()
    err.args = _b_.tuple.$factory(Array.prototype.slice.call(arguments))
    err.__class__ = _b_.BaseException
    err.$py_error = true
    // Make a copy of the current frame stack array
    err.$stack = $B.frames_stack.slice()
    for (var i = 0; i < err.$stack.length; i++) {
        // Then copy each frame
        err.$stack[i] = err.$stack[i].slice()
        // Then create a new object that retains only
        // the $line_info from the frame's locals
        err.$stack[i][1] = {$line_info: err.$stack[i][1].$line_info}
    }
    if($B.frames_stack.length){
        err.$line_info = $B.last($B.frames_stack)[1].$line_info
    }
    $B.current_exception = err
    eval("//placeholder//")
    return err
}

BaseException.$factory.$infos = {
    __name__: "BaseException",
    __qualname__: "BaseException"
}

$B.set_func_names(BaseException)

_b_.BaseException = BaseException

$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    if(! js_exc.$py_error){
        // Print complete Javascript traceback in console
        console.log("js exc", js_exc)

        if(js_exc.info === undefined){
            js_exc.msg = BaseException.__getattr__(js_exc, "info")
        }
        var exc = Error()
        exc.__name__ = "Internal Javascript error: " +
            (js_exc.__name__ || js_exc.name)
        exc.__class__ = _b_.Exception
        exc.$js_exc = js_exc
        if(js_exc.name == "ReferenceError"){
            exc.__name__ = "NameError"
            exc.__class__ = _b_.NameError
            js_exc.message = js_exc.message.replace("$$", "")
        }else if(js_exc.name == "InternalError"){
            exc.__name__ = "RuntimeError"
            exc.__class__ = _b_.RuntimeError
        }
        var $message = js_exc.msg || "<" + js_exc + ">"
        exc.args = _b_.tuple.$factory([$message])
        exc.$py_error = true
        exc.$stack = $B.frames_stack.slice()
    }else{
        var exc = js_exc
    }
    $B.current_exception = exc
    return exc
}

$B.is_exc = function(exc, exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__ === undefined){
        exc = $B.exception(exc)
    }

    var this_exc_class = exc.__class__
    for(var i = 0; i < exc_list.length; i++){
        var exc_class = exc_list[i]
        if(this_exc_class === undefined){console.log("exc class undefined", exc)}
        if(issubclass(this_exc_class, exc_class)){return true}
    }
    return false
}

$B.clear_exc = function(){
    $B.current_exception = null
}

function $make_exc(names, parent){
    // Creates the exception classes that inherit from parent
    // names is the list of exception names
    var _str = [], pos = 0
    for(var i = 0; i < names.length; i++){
        var name = names[i],
            code = ""
        if(Array.isArray(name)){
            // If name is an array, its first item is the exception name
            // and the second is a piece of code to replace the placeholder
            // in BaseException source code
            var code = name[1],
                name = name[0]
        }
        // create a class for exception called "name"
        $B.builtins_scope[name] = true
        var $exc = (BaseException.$factory + "").replace(/BaseException/g,name)
        $exc = $exc.replace("//placeholder//", code)
        // class dictionary
        _str[pos++] = "_b_." + name + '={__class__:_b_.type,__name__:"' +
            name + '"}'
        _str[pos++] = "_b_." + name + ".__bases__ = [parent]"
        _str[pos++] = "_b_." + name + '.__module__ = "builtins"'
        _str[pos++] = '_b_.' + name + ".__mro__ = [_b_." + parent.__name__ +
            "].concat(parent.__mro__)"
        _str[pos++] = "_b_." + name + ".$factory = " + $exc
        _str[pos++] = "_b_." + name + '.$factory.$infos = {__name__: "' +
            name + '", __qualname__: "' + name + '"}'
        _str[pos++] = "_b_." + name + ".$is_class = true"
    }
    try{
        eval(_str.join(";"))
    }catch(err){
        console.log("--err" + err)
        throw err
    }
}

$make_exc(["SystemExit", "KeyboardInterrupt", "GeneratorExit", "Exception"],
    BaseException)
$make_exc([["StopIteration","err.value = arguments[0]"],
    "ArithmeticError", "AssertionError", "AttributeError",
    "BufferError", "EOFError", "ImportError", "LookupError", "MemoryError",
    "NameError", "OSError", "ReferenceError", "RuntimeError", "SyntaxError",
    "SystemError", "TypeError", "ValueError", "Warning"],_b_.Exception)
$make_exc(["FloatingPointError", "OverflowError", "ZeroDivisionError"],
    _b_.ArithmeticError)
$make_exc(["IndexError","KeyError"], _b_.LookupError)
$make_exc(["UnboundLocalError"], _b_.NameError)
$make_exc(["BlockingIOError", "ChildProcessError", "ConnectionError",
    "FileExistsError", "FileNotFoundError", "InterruptedError",
    "IsADirectoryError", "NotADirectoryError", "PermissionError",
    "ProcessLookupError", "TimeoutError"], _b_.OSError)
$make_exc(["BrokenPipeError", "ConnectionAbortedError",
    "ConnectionRefusedError", "ConnectionResetError"], _b_.ConnectionError)
$make_exc(["NotImplementedError"], _b_.RuntimeError)
$make_exc(["NotImplemented"], _b_.RuntimeError)
$make_exc(["IndentationError"], _b_.SyntaxError)
$make_exc(["TabError"], _b_.IndentationError)
$make_exc(["UnicodeError"], _b_.ValueError)
$make_exc(["UnicodeDecodeError", "UnicodeEncodeError",
    "UnicodeTranslateError"], _b_.UnicodeError)
$make_exc(["DeprecationWarning", "PendingDeprecationWarning",
    "RuntimeWarning", "SyntaxWarning", "UserWarning", "FutureWarning",
    "ImportWarning", "UnicodeWarning", "BytesWarning", "ResourceWarning"],
    _b_.Warning)

$make_exc(["EnvironmentError", "IOError", "VMSError", "WindowsError"],
    _b_.OSError)

$B.$NameError = function(name){
    // Used if a name is not found in the bound names
    // It is converted into
    // $globals[name] !== undefined ? $globals[name] :
    //    __BRYTHON__.$NameError.$factory(name)
    throw _b_.NameError.$factory("name '" + name + "' is not defined")
}
$B.$TypeError = function(msg){
    throw _b_.TypeError.$factory(msg)
}

})(__BRYTHON__)
