;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

$B.del_exc = function(){
    var frame = $B.last($B.frames_stack)
    frame[1].$current_exception = undefined
}

$B.set_exc = function(exc){
    var frame = $B.last($B.frames_stack)
    frame[1].$current_exception = $B.exception(exc)
}

$B.get_exc = function(){
    var frame = $B.last($B.frames_stack)
    return frame[1].$current_exception
}

$B.$raise = function(arg){
    // Used for "raise" without specifying an exception.
    // If there is an exception in the stack, use it, else throw a simple
    // Exception
    if(arg === undefined){
        var es = $B.get_exc()
        if(es !== undefined){throw es}
        throw _b_.RuntimeError.$factory("No active exception to reraise")
    }else if(isinstance(arg, BaseException)){
        if(arg.__class__ === _b_.StopIteration &&
                $B.last($B.frames_stack)[1].$is_generator){
            // PEP 479
            arg = _b_.RuntimeError.$factory("generator raised StopIteration")
        }
        throw arg
    }else if(arg.$is_class && issubclass(arg, BaseException)){
        if(arg === _b_.StopIteration &&
                $B.last($B.frames_stack)[1].$is_generator){
            // PEP 479
            throw _b_.RuntimeError.$factory("generator raised StopIteration")
        }
        throw $B.$call(arg)()
    }else{
        throw _b_.TypeError.$factory("exceptions must derive from BaseException")
    }
}

$B.$syntax_err_line = function(exc, module, src, pos, line_num){
    // map position to line number
    var pos2line = {},
        lnum = 1,
        module = module.charAt(0) == "$" ? "<string>" : module
    if(src === undefined){
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
        exc.text = line
        lpos -= len - line.length
        if(lpos < 0){lpos = 0}
        while(line.charAt(0) == ' '){
            line = line.substr(1)
            if(lpos > 0){lpos--}
        }
        exc.offset = lpos
        exc.args = _b_.tuple.$factory([$B.$getitem(exc.args, 0), module,
            line_num, lpos, line])
    }
    exc.lineno = line_num
    exc.msg = exc.args[0]
    exc.filename = module
}

$B.$SyntaxError = function(module, msg, src, pos, line_num, root) {
    if(root !== undefined && root.line_info !== undefined){
        // this may happen for syntax errors inside a lambda
        line_num = root.line_info
    }
    var exc = _b_.SyntaxError.$factory(msg)
    $B.$syntax_err_line(exc, module, src, pos, line_num)
    throw exc
}

$B.$IndentationError = function(module, msg, src, pos, line_num, root) {
    $B.frames_stack.push([module, {$line_info: line_num + "," + module},
        module, {$src: src}])
    if(root !== undefined && root.line_info !== undefined){
        // this may happen for syntax errors inside a lambda
        line_num = root.line_info
    }
    var exc = _b_.IndentationError.$factory(msg)
    $B.$syntax_err_line(exc, module, src, pos, line_num)
    throw exc
}

$B.print_stack = function(stack){
    stack = stack || $B.frames_stack
    var trace = []
    stack.forEach(function(frame){
        var line_info = frame[1].$line_info
        if(line_info !== undefined){
            var info = line_info.split(",")
            if(info[1].startsWith("$exec")){
                info[1] = "<module>"
            }
            trace.push(info[1] + " line " + info[0])
            var src = $B.file_cache[frame[3].__file__]
            if(src){
                var lines = src.split("\n"),
                    line = lines[parseInt(info[0]) - 1]
                trace.push("  " + line.trim())
            }
        }
    })
    console.log("print stack ok", trace)
    return trace.join("\n")
}

// class of traceback objects
var traceback = $B.traceback = $B.make_class("traceback",
    function(exc, stack){
        var frame = $B.last($B.frames_stack)
        if(stack === undefined){
            stack = exc.$stack
        }
        return {
            __class__ : traceback,
            $stack: stack,
            exc: exc
        }
    }
)

traceback.__getattribute__ = function(self, attr){
    var line_info
    if(attr === 'tb_frame' ||
            attr === 'tb_lineno' ||
            attr === 'tb_lasti' ||
            attr === 'tb_next'){
        if(self.$stack.length == 0){
            console.log("no stack", attr)
        }
        var first_frame = self.$stack[0]
        if(first_frame === undefined){
            console.log("last frame undef", self.$stack, Object.keys(self.$stack))
        }
        var line_info = first_frame[1].$line_info
        if(first_frame[1].$frozen_line_info != undefined){
            line_info = first_frame[1].$frozen_line_info
        }
    }

    switch(attr){
        case "tb_frame":
            return frame.$factory(self.$stack)
        case "tb_lineno":
            var lineno
            if(line_info === undefined ||
                    first_frame[0].startsWith($B.lambda_magic)){
                if(first_frame[4] && first_frame[4].$infos &&
                        first_frame[4].$infos.__code__){
                    lineno = first_frame[4].$infos.__code__.co_firstlineno
                }else{
                    lineno = -1
                }
            }else{
                lineno = parseInt(line_info.split(",")[0])
            }
            return lineno
        case "tb_lasti":
            if(line_info === undefined){
                return "<unknown>"
            }else{
                var info = line_info.split(","),
                    src
                for(var i = self.$stack.length - 1; i >= 0; i--){
                    var fr = self.$stack[i]
                    if(fr[2] == info[1]){
                        file = fr[3].__file__
                        break
                    }
                }
                if(src === undefined){
                    if($B.file_cache.hasOwnProperty(file)){
                        src = $B.file_cache[file]
                    }else if($B.imported[info[1]] && $B.imported[info[1]].__file__ ){
                        src = $B.file_cache[$B.imported[info[1]].__file__]
                        console.log("from filecache", line_info, $B.imported[info[1]].__file__)
                    }
                }
                if(src !== undefined){
                    return src.split("\n")[parseInt(info[0] - 1)].trim()
                }else{
                    console.log(file)
                    console.log("no src for", info)
                    return "<unknown>"
                }
            }
        case "tb_next":
            if(self.$stack.length <= 1){return None}
            else{
                return traceback.$factory(self.exc,
                    self.$stack.slice(1))
            }
        default:
            return _b_.object.__getattribute__(self, attr)
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
            $stack: stack.slice()
        }
        if(pos === undefined){
            pos = 0
        }
        res.$pos = pos
        if(fs.length){
            var _frame = fs[pos],
                locals_id = _frame[0],
                filename
            try{
                res.f_locals = $B.obj_dict(_frame[1])
            }catch(err){
                console.log("err " + err)
                throw err
            }
            res.f_globals = $B.obj_dict(_frame[3])

            if(_frame[3].__file__ !== undefined){
                filename = _frame[3].__file__
            }else if(locals_id.startsWith("$exec")){
                filename = "<string>"
            }
            if(_frame[1].$line_info === undefined){
                res.f_lineno = -1
            }else{
                var line_info = _frame[1].$line_info.split(",")
                res.f_lineno = parseInt(line_info[0])
                var module_name = line_info[1]
                if($B.imported.hasOwnProperty(module_name)){
                    filename = $B.imported[module_name].__file__
                }
                res.f_lineno = parseInt(_frame[1].$line_info.split(',')[0])
            }

            var co_name = locals_id.startsWith("$exec") ? "<string>" :
                          locals_id
            if(locals_id == _frame[2]){
                co_name = "<module>"
            }else{
                if(_frame[1].$name){
                    co_name = _frame[1].$name
                }else if(_frame[1].$dict_comp){
                    co_name = '<dictcomp>'
                }else if(_frame[1].$list_comp){
                    co_name = '<listcomp>'
                }else if(_frame.length > 4){
                    if(_frame[4].$infos){
                        co_name = _frame[4].$infos.__name__
                    }else{
                        co_name = _frame[4].name
                    }
                    if(_frame[4].$infos === undefined){
                        // issue 1286
                        if(_frame[4].name.startsWith("__ge")){
                            co_name = "<genexpr>"
                        }else if(_frame[4].name.startsWith("set_comp" +
                                $B.lambda_magic)){
                            co_name = "<setcomp>"
                        }
                    }else if(filename === undefined && _frame[4].$infos.__code__){
                        filename = _frame[4].$infos.__code__.co_filename
                        if(filename === undefined){
                            filename = _frame[4].$infos.__module__
                        }
                        res.f_lineno = _frame[4].$infos.__code__.co_firstlineno
                    }
                }
            }
            res.f_code = {__class__: $B.code,
                co_code: None, // XXX fix me
                co_name: co_name,
                co_filename: filename
            }
            if(filename === undefined){
                res.f_code.co_filename = "<string>"
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
            return frame.$factory(self.$stack.slice(0, self.$stack.length - 1))
        }else{
            return _b_.None
        }
    }else if(attr == "clear"){
        return function(){
            // XXX fix me
        }
    }
}

frame.__setattr__ = function(self, attr, value){
    if(attr == "f_trace"){
        // used in trace functions, as defined by sys.settrace()
        $B.last(self.$stack)[1].$f_trace = value
    }
}

frame.__str__ = frame.__repr__ = function(self){
    return '<frame object, file ' + self.f_code.co_filename +
        ', line ' + self.f_lineno + ', code ' + self.f_code.co_name + '>'
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
    var res =  self.__class__.$infos.__name__
    if(self.args[0]){
        res += '(' + repr(self.args[0])
    }
    if(self.args.length > 1){
        res += ', ' + repr($B.fast_tuple(self.args.slice(1)))
    }
    return res + ')'
}

BaseException.__str__ = function(self){
    if(self.args.length > 0){
        return _b_.str.$factory(self.args[0])
    }
    return self.__class__.$infos.__name__
}

BaseException.__new__ = function(cls){
    var err = _b_.BaseException.$factory()
    err.__class__ = cls
    err.__dict__ = _b_.dict.$factory()
    return err
}

var getExceptionTrace = function(exc, includeInternal) {
    if(exc.__class__ === undefined){
        if($B.debug > 1){console.log("no class", exc)}
        return exc + ''
    }

    var info = ''
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
                }else if(src = $B.file_cache[frame[3].__file__]){
                    // For imported modules, cf. issue 981
                }else{
                    continue
                }
            }
        }
        var module = line_info[1]
        if(module.charAt(0) == "$"){module = "<module>"}
        info += "\n  module " + module + " line " + line_info[0]
        if(frame.length > 4){
            if(frame[4].$infos){
                info += ', in ' + frame[4].$infos.__name__
            }else if(frame[4].name.startsWith("__ge")){
                info += ', in <genexpr>'
            }else if(frame[4].name.startsWith("set_comp" + $B.lambda_magic)){
                info += ', in <setcomp>'
            }else{
                console.log("frame[4]", frame[4])
            }
        }else if(frame[1].$list_comp){
            info += ', in <listcomp>'
        }else if(frame[1].$dict_comp){
            info += ', in <dictcomp>'
        }

        if(src !== undefined){
            var lines = src.split("\n"),
                line = lines[parseInt(line_info[0]) - 1]
            if(line){line = line.replace(/^[ ]+/g, "")}
            info += "\n    " + line
        }else{
            console.log("src undef", line_info)
        }
    }
    if(exc.__class__ === _b_.SyntaxError){
        info += "\n  File " + exc.args[1] + ", line " + exc.args[2] +
            "\n    " + exc.args[4]

    }
    return info
}

BaseException.__getattr__ = function(self, attr){

    if(attr == "info"){
        return getExceptionTrace(self, false);
    }else if (attr == "infoWithInternal"){
        return getExceptionTrace(self, true);
    }else if(attr == "__traceback__"){
        // Return traceback object
        if(self.$traceback !== undefined){return self.$traceback}
        return traceback.$factory(self)
    }else{
        throw _b_.AttributeError.$factory(self.__class__.$infos.__name__ +
            " has no attribute '" + attr + "'")
    }
}

BaseException.with_traceback = function(self, tb){
    self.$traceback = tb
    return self
}

function deep_copy(stack){
    var current_frame = $B.last($B.frames_stack),
        is_local = current_frame[0] != current_frame[2]
    if(is_local){
        for(var i = 0, len = $B.frames_stack.length; i < len; i++){
            if($B.frames_stack[0] == current_frame[0]){
                return stack.slice(i)
            }
        }
    }
    return stack.slice()
}

$B.freeze = function(stack){
    // Set attribute $frozen_line_info to each frame in exception stack. If we
    // only use $line_info, it might have been updated when exception handling
    // starts.
    for(var i = 0, len = stack.length; i < len; i++){
        stack[i][1].$frozen_line_info = stack[i][1].$line_info
        stack[i][3].$frozen_line_info = stack[i][3].$line_info
    }
    return stack
}

var show_stack = $B.show_stack = function(stack){
    stack = stack || $B.frames_stack
    for(const frame of stack){
        console.log(frame[0], frame[1].$line_info)
    }
}

BaseException.$factory = function (){
    var err = Error()
    err.args = $B.fast_tuple(Array.prototype.slice.call(arguments))
    err.__class__ = _b_.BaseException
    err.$py_error = true
    // Make a copy of the current frame stack array
    if(err.$stack === undefined){
        err.$stack = $B.freeze($B.frames_stack.slice())
    }
    if($B.frames_stack.length){
        err.$line_info = $B.last($B.frames_stack)[1].$line_info
    }
    //err.$traceback = traceback.$factory(err)
    eval("//placeholder//")
    err.__cause__ = _b_.None // XXX fix me
    err.__context__ = _b_.None // XXX fix me
    err.__suppress_context__ = false // XXX fix me
    return err
}

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
        console.log("Javascript exception:", js_exc)
        console.log($B.last($B.frames_stack))
        console.log("recursion error ?", $B.is_recursion_error(js_exc))
        var exc = Error()
        exc.__name__ = "Internal Javascript error: " +
            (js_exc.__name__ || js_exc.name)
        exc.__class__ = _b_.Exception
        exc.$js_exc = js_exc
        if($B.is_recursion_error(js_exc)){
            return _b_.RecursionError.$factory("too much recursion")
        }else if(js_exc.name == "ReferenceError"){
            exc.__name__ = "NameError"
            exc.__class__ = _b_.NameError
            js_exc.message = js_exc.message.replace("$$", "")
        }else if(js_exc.name == "InternalError"){
            exc.__name__ = "RuntimeError"
            exc.__class__ = _b_.RuntimeError
        }
        exc.__cause__ = _b_.None
        exc.__context__ = _b_.None
        exc.__suppress_context__ = false
        var $message = "<Javascript " + js_exc.name + ">: " +
            (js_exc.message || "<" + js_exc + ">")
        exc.args = _b_.tuple.$factory([$message])
        exc.$py_error = true
        exc.$stack = $B.freeze($B.frames_stack.slice());
    }else{
        var exc = js_exc
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
        if(issubclass(this_exc_class, exc_class)){return true}
    }
    return false
}

$B.is_recursion_error = function(js_exc){
    // Test if the JS exception matches Python RecursionError
    console.log("test is js exc is recursion error", js_exc, js_exc + "")
    var msg = js_exc + "",
        parts = msg.split(":"),
        err_type = parts[0].trim(),
        err_msg = parts[1].trim()
    return (err_type == 'InternalError' && err_msg == 'too much recursion') ||
        (err_type == 'Error' && err_msg == 'Out of stack space') ||
        (err_type == 'RangeError' && err_msg == 'Maximum call stack size exceeded')
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
        _str[pos++] = "_b_." + name + ' = {__class__:_b_.type, ' +
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
        throw err
    }
}

$make_exc(["SystemExit", "KeyboardInterrupt", "GeneratorExit", "Exception"],
    BaseException)
$make_exc([["StopIteration","err.value = arguments[0]"],
    ["StopAsyncIteration","err.value = arguments[0]"],
    "ArithmeticError", "AssertionError", "AttributeError",
    "BufferError", "EOFError",
    ["ImportError", "err.name = arguments[0]"],
    "LookupError", "MemoryError",
    "NameError", "OSError", "ReferenceError", "RuntimeError",
    ["SyntaxError", "err.msg = arguments[0]"],
    "SystemError", "TypeError", "ValueError", "Warning"],_b_.Exception)
$make_exc(["FloatingPointError", "OverflowError", "ZeroDivisionError"],
    _b_.ArithmeticError)
$make_exc([["ModuleNotFoundError", "err.name = arguments[0]"]], _b_.ImportError)
$make_exc(["IndexError","KeyError"], _b_.LookupError)
$make_exc(["UnboundLocalError"], _b_.NameError)
$make_exc(["BlockingIOError", "ChildProcessError", "ConnectionError",
    "FileExistsError", "FileNotFoundError", "InterruptedError",
    "IsADirectoryError", "NotADirectoryError", "PermissionError",
    "ProcessLookupError", "TimeoutError"], _b_.OSError)
$make_exc(["BrokenPipeError", "ConnectionAbortedError",
    "ConnectionRefusedError", "ConnectionResetError"], _b_.ConnectionError)
$make_exc(["NotImplementedError", "RecursionError"], _b_.RuntimeError)
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

$B.$TypeError = function(msg){
    throw _b_.TypeError.$factory(msg)
}

// SyntaxError instances have special attributes
var se = _b_.SyntaxError.$factory
_b_.SyntaxError.$factory = function(){
    var arg = arguments[0]
    if(arg.__class__ === _b_.SyntaxError){
        return arg
    }
    var exc = se.apply(null, arguments),
        frame = $B.last($B.frames_stack)
    if(frame){
        line_info = frame[1].$line_info
        exc.filename = frame[3].__file__
        exc.lineno = parseInt(line_info.split(",")[0])
        var src = $B.file_cache[frame[3].__file__]
        if(src){
            lines = src.split("\n")
            exc.text = lines[exc.lineno - 1]
        }
        exc.offset = arg.offset
    }
    return exc
}

_b_.SyntaxError

})(__BRYTHON__)
