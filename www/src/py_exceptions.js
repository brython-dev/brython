;(function($B){

eval($B.InjectBuiltins())

// class of traceback objects
var $TracebackDict = {__class__:$B.$type,
    __name__:'traceback'
}
$TracebackDict.__getattribute__ = function(self, attr){
    if(self.stack.length==0){alert('no stack', attr)}
    var last_frame = $B.last(self.stack)
    if(last_frame==undefined){alert('last frame undef ');console.log(self.stack, Object.keys(self.stack))}
    var line_info = last_frame[1].$line_info

    switch(attr){
        case 'tb_frame':
            return frame(self.stack)
        case 'tb_lineno':
            if(line_info===undefined){return -1}
            else{return parseInt(line_info.split(',')[0])}
        case 'tb_lasti':
            if(line_info===undefined){return '<unknown>'}
            else{
                var info = line_info.split(',')
                var src = $B.$py_src[info[1]]
                if(src!==undefined){
                    return src.split('\n')[parseInt(info[0]-1)].trim()
                }else{return '<unknown>'}
            }
        case 'tb_next':
            if(self.stack.length==1){return None}
            else{return traceback(self.stack.slice(0, self.stack.length-1))}
        default:
            return $TracebackDict[attr]
    }
}

$TracebackDict.__mro__ = [$TracebackDict, _b_.object.$dict]

$TracebackDict.__str__ = function(self){return '<traceback object>'}

function traceback(stack) {
  return {__class__ : $TracebackDict,
      stack : stack
  }
}

traceback.__class__ = $B.$factory
traceback.$dict = $TracebackDict
$TracebackDict.$factory = traceback

// class of frame objects
var $FrameDict = {__class__:$B.$type,
    __name__:'frame'
}

$FrameDict.__getattr__ = function(self, attr){
    // Used for f_back to avoid computing it when the frame object
    // is initialised
    if(attr=='f_back'){
        if(self.$pos>0){
            return frame(self.$stack, self.$pos-1)
        }
    }
}

$FrameDict.__mro__ = [$FrameDict, _b_.object.$dict]

function to_dict(obj){
    var res = _b_.dict()
    var setitem=_b_.dict.$dict.__setitem__
    for(var attr in obj){
        if(attr.charAt(0)=='$'){continue}
        setitem(res, attr, obj[attr])
    }
    return res
}

function frame(stack, pos){
    var mod_name = stack[2]
    var fs = stack
    var res = {__class__:$FrameDict,
        f_builtins : {}, // XXX fix me
        $stack: stack,
    }
    if(pos===undefined){pos = fs.length-1}
    res.$pos = pos
    if(fs.length){
        var _frame = fs[pos]
        var locals_id = _frame[0]
        try{
            res.f_locals = $B.obj_dict(_frame[1])
        }catch(err){
            console.log('err '+err)
            throw err
        }
        res.f_globals = $B.obj_dict(_frame[3])
        if($B.debug>0){
            if(_frame[1].$line_info === undefined){res.f_lineno=-1}
            else{res.f_lineno = parseInt(_frame[1].$line_info.split(',')[0])}
        }else{
            res.f_lineno = -1
        }
        //if(pos!==undefined && pos>1){res.f_back = frame(stack, pos-1)}
        //else{res.f_back = None}
        res.f_code = {__class__:$B.$CodeDict,
            co_code:None, // XXX fix me
            co_name: locals_id, // idem
            co_filename: _frame[3].__name__ // idem
        }
        if(res.f_code.co_filename===undefined){console.log(_frame[0],_frame[1],_frame[2],_frame[3]);alert('no cofilename')}
    }
    return res
}

frame.__class__ = $B.$factory
frame.$dict = $FrameDict
$FrameDict.$factory = frame
$B._frame=frame

// built-in exceptions

var $BaseExceptionDict = {__class__:$B.$type,
    __bases__ : [_b_.object],
    __module__:'builtins',
    __name__:'BaseException'
}

$BaseExceptionDict.__init__ = function(self){
    self.args = _b_.tuple([arguments[1]])
}

$BaseExceptionDict.__repr__ = function(self){
    return self.__class__.__name__+repr(self.args)
}

$BaseExceptionDict.__str__ = function(self){
    return _b_.str(self.args[0])
}

$BaseExceptionDict.__mro__ = [$BaseExceptionDict,_b_.object.$dict]

$BaseExceptionDict.__new__ = function(cls){
    var err = _b_.BaseException()
    err.__name__ = cls.$dict.__name__
    err.__class__ = cls.$dict
    return err
}

$BaseExceptionDict.__getattr__ = function(self, attr){
    if(attr=='info'){
        var name = self.__class__.__name__
        if(name=='SyntaxError' || name=='IndentationError'){
            return 'File "'+self.args[1]+'", line '+self.args[2]+'\n    '+
                self.args[4]
            
        }

        var info = 'Traceback (most recent call last):'

        if(self.$js_exc!==undefined){
            for(var attr in self.$js_exc){
                if(attr==='message') continue
                try{info += '\n    '+attr+' : '+self.$js_exc[attr]}
                catch(_err){}
            }
            info+='\n'
        }
        for(var i=0;i<self.$stack.length;i++){
            var frame = self.$stack[i]
            if(frame[1].$line_info===undefined){continue}
            var line_info = frame[1].$line_info.split(',')
            var lines = $B.$py_src[line_info[1]].split('\n')
            info += '\n  module '+line_info[1]+' line '+line_info[0]
            var line = lines[parseInt(line_info[0])-1]
            if(line) line=line.replace(/^[ ]+/g, '')
            if(line===undefined){console.log('line undef...',line_info,$B.$py_src[line_info[1]])}
            info += '\n    '+line
        }
        return info

    }else if(attr=='traceback'){
        // Return traceback object
        return traceback(self.$stack)
    }else{
        throw AttributeError(self.__class__.__name__+
            "has no attribute '"+attr+"'")
    }
}

$BaseExceptionDict.with_traceback = function(self, tb){
    self.traceback = tb
    return self
}

$B.set_func_names($BaseExceptionDict)

var BaseException = function (){
    var err = Error()
    err.__name__ = 'BaseException'
    //err.$js_exc = js_exc
   
    err.args = _b_.tuple(Array.prototype.slice.call(arguments))
    err.$message = arguments[0]
    err.__class__ = $BaseExceptionDict
    err.$py_error = true
    err.$stack = $B.frames_stack.slice()
    $B.current_exception = err
    return err
}

BaseException.__class__ = $B.$factory
BaseException.$dict = $BaseExceptionDict
$BaseExceptionDict.$factory = BaseException

_b_.BaseException = BaseException

$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute $py_error set -
    // or by the Javascript interpreter (ReferenceError for instance)
    
    if(!js_exc.$py_error){
        // Print complete Javascript traceback in console
        //console.log(js_exc)
        
        if($B.debug>0 && js_exc.info===undefined){
            var _frame = $B.last($B.frames_stack)
            if(_frame===undefined){_frame=$B.pmframe} // use post-mortem frame
            if(_frame && _frame[1].$line_info!==undefined){
                var line_info = _frame[1].$line_info.split(',')
                var mod_name = line_info[1]
                var module = $B.modules[mod_name]
                if(module){
                    if(module.caller!==undefined){
                        // for list comprehension and the likes, replace
                        // by the line in the enclosing module
                        var mod_name = line_info[1]
                    }
                    var lib_module = mod_name
                    var line_num = parseInt(line_info[0])
                    if($B.$py_src[mod_name]===undefined){
                        console.log('pas de py_src pour '+mod_name)
                    }
                    var lines = $B.$py_src[mod_name].split('\n'),
                        msg = js_exc.message.toString()
                    // For some weird reason, nothing can be added to js_exc.message
                    // so we have to create another attribute with the complete
                    // error message including line in source code
                    msg += "\n  module '"+lib_module+"' line "+line_num
                    msg += '\n'+lines[line_num-1]
                    js_exc.msg = msg
                    js_exc.info_in_msg = true
                }
            }else{
                console.log('error ', js_exc)
            }
        }
        var exc = Error()
        exc.__name__ = 'Internal Javascript error: '+(js_exc.__name__ || js_exc.name)
        exc.__class__ = _b_.Exception.$dict
        exc.$js_exc = js_exc
        if(js_exc.name=='ReferenceError'){
            exc.__name__='NameError'
            exc.__class__=_b_.NameError.$dict
            js_exc.message = js_exc.message.replace('$$','')
        }else if(js_exc.name=="InternalError"){
            exc.__name__='RuntimeError'
            exc.__class__=_b_.RuntimeError.$dict
        }
        exc.$message = js_exc.msg || '<'+js_exc+'>'
        exc.args = _b_.tuple([exc.$message])
        exc.info = ''
        exc.$py_error = true
        exc.$stack = $B.frames_stack.slice()
    }else{
        var exc = js_exc
    }
    $B.current_exception = exc
    return exc
}

$B.is_exc=function(exc,exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__===undefined) exc = $B.exception(exc)
    
    var exc_class = exc.__class__.$factory
    for(var i=0;i<exc_list.length;i++){
        if(issubclass(exc_class,exc_list[i])) return true
    }
    return false
}

$B.clear_exc = function(){
    $B.current_exception = null
}

function $make_exc(names,parent){
    // create a class for exception called "name"
    var _str=[], pos=0
    for(var i=0;i<names.length;i++){
        var name = names[i]
        $B.bound['__builtins__'][name] = true
        var $exc = (BaseException+'').replace(/BaseException/g,name)
        // class dictionary
        _str[pos++]='var $'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}'
        _str[pos++]='$'+name+'Dict.__bases__ = [parent]'
        _str[pos++]='$'+name+'Dict.__module__ = "builtins"'
        _str[pos++]='$'+name+'Dict.__mro__=[$'+name+'Dict].concat(parent.$dict.__mro__)'
        // class constructor
        _str[pos++]='_b_.'+name+'='+$exc
        _str[pos++]='_b_.'+name+'.__class__=$B.$factory'
        _str[pos++]='$'+name+'Dict.$factory=_b_.'+name
        _str[pos++]='_b_.'+name+'.$dict=$'+name+'Dict'
    }
    eval(_str.join(';'))
}

$make_exc(['SystemExit','KeyboardInterrupt','GeneratorExit','Exception'],BaseException)
$make_exc(['StopIteration','ArithmeticError','AssertionError','AttributeError',
    'BufferError','EOFError','ImportError','LookupError','MemoryError',
    'NameError','OSError','ReferenceError','RuntimeError','SyntaxError',
    'SystemError','TypeError','ValueError','Warning'],_b_.Exception)
$make_exc(['FloatingPointError','OverflowError','ZeroDivisionError'],
    _b_.ArithmeticError)
$make_exc(['IndexError','KeyError'],_b_.LookupError)
$make_exc(['UnboundLocalError'],_b_.NameError)
$make_exc(['BlockingIOError','ChildProcessError','ConnectionError',
    'FileExistsError','FileNotFoundError','InterruptedError',
    'IsADirectoryError','NotADirectoryError','PermissionError',
    'ProcessLookupError','TimeoutError'],_b_.OSError)
$make_exc(['BrokenPipeError','ConnectionAbortedError','ConnectionRefusedError',
    'ConnectionResetError'],_b_.ConnectionError)
$make_exc(['NotImplementedError'],_b_.RuntimeError)
$make_exc(['IndentationError'],_b_.SyntaxError)
$make_exc(['TabError'],_b_.IndentationError)
$make_exc(['UnicodeError'],_b_.ValueError)
$make_exc(['UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError'],
    _b_.UnicodeError)
$make_exc(['DeprecationWarning','PendingDeprecationWarning','RuntimeWarning',
    'SyntaxWarning','UserWarning','FutureWarning','ImportWarning',
    'UnicodeWarning','BytesWarning','ResourceWarning'],_b_.Warning)

$make_exc(['EnvironmentError','IOError','VMSError','WindowsError'],_b_.OSError)

$B.$NameError = function(name){
    // Used if a name is not found in the bound names
    // It is converted into 
    // $globals[name] !== undefined ? $globals[name] : __BRYTHON__.$NameError(name)
    throw _b_.NameError(name)
}
$B.$TypeError = function(msg){
    throw _b_.TypeError(msg)
}

})(__BRYTHON__)