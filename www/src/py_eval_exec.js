(function($B){

var _b_ = $B.builtins

// eval() and exec() built-in functions
var $$eval = _b_.eval = function(){
    var $ = $B.args("eval", 4,
            {src: null, globals: null, locals: null, mode: null} ,
            ['src', 'globals', 'locals', 'mode'],
            arguments, {globals: _b_.None, locals: _b_.None, mode: 'eval'},
            null, null, 4),
        src = $.src,
        _globals = $.globals,
        _locals = $.locals,
        mode = $.mode

    if($.src.mode && $.src.mode == "single" &&
            ["<console>", "<stdin>"].indexOf($.src.filename) > -1){
        // echo input in interactive mode
        _b_.print(">", $.src.source.trim())
    }

    var filename = '<string>'

    if($B.exact_type(src, $B.code)){
        filename = src.filename
        // result of compile()
    }else if((! src.valueOf) || typeof src.valueOf() !== 'string'){
        $B.RAISE(_b_.TypeError, `${mode}() arg 1 must be a string,` +
            " bytes or code object")
    }else{
        // src might be an instance of JS String if source has surrogate pairs
        // cf. issue #1772
        src = src.valueOf()
        // nomalize line ends
        src = src.replace(/\r\n/g, '\n').
                  replace(/\r/g, '\n')
    }

    var __name__ = 'exec'
    if(_globals === _b_.None){
        if($B.frame_obj !== null){
            __name__ = $B.frame_obj.frame[2]
        }
    }
    if(_globals !== _b_.None && $B.get_class(_globals) == _b_.dict &&
            _b_.dict.$contains_string(_globals, '__name__')){
        __name__ = _b_.dict.$getitem_string(_globals, '__name__')
    }
    $B.url2name[filename] = __name__

    var frame = $B.frame_obj.frame

    $B.exec_scope = $B.exec_scope || {}

    if(typeof src == 'string' && src.endsWith('\\\n')){
        var exc = $B.EXC(_b_.SyntaxError, 'unexpected EOF while parsing')
        var lines = src.split('\n'),
            line = lines[lines.length - 2]
        exc.args = ['unexpected EOF while parsing',
            [filename, lines.length - 1, 1, line]]
        exc.filename = filename
        exc.text = line
        throw exc
    }

    var local_name = ('locals_' + __name__).replace(/\./g, '_'),
        global_name = ('globals_' + __name__).replace(/\./g, '_'),
        exec_locals = {},
        exec_globals = {}

    if(_globals === _b_.None){
        // if the optional parts are omitted, the code is executed in the
        // current scope
        // filename = '<string>'
        if(frame[1] === frame[3]){
            // module level
            global_name += '_globals'
            exec_locals = exec_globals = frame[3]
        }else{
            if(mode == "exec"){
                // for exec() : if the optional parts are omitted, the code is
                // executed in the current scope
                // modifications to the default locals dictionary should not
                // be attempted: this is why exec_locals is a clone of current
                // locals
                exec_locals = $B.clone(frame[1])
                for(var attr in frame[3]){
                    exec_locals[attr] = frame[3][attr]
                }
                exec_globals = exec_locals
            }else{
                // for eval() : If both dictionaries are omitted, the
                // expression is executed with the globals and locals in the
                // environment where eval() is called
                exec_locals = frame[1]
                exec_globals = frame[3]
            }
        }
    }else{
        if($B.get_class(_globals) !== _b_.dict){
            $B.RAISE(_b_.TypeError, `${mode}() globals must be ` +
                "a dict, not " + $B.class_name(_globals))
        }
        // _globals is used for both globals and locals
        exec_globals = {}
        if(_globals.$strings){ // eg globals()
            exec_globals = _globals.$strings
        }else{
            // The globals object must be the same across calls to exec()
            // with the same dictionary (cf. issue 690)
            exec_globals = _globals.$strings = {}
            for(var entry of _b_.dict.$iter_items(_globals)){
                var key = entry.key
                _globals.$strings[key] = $B.str_dict_get(_globals, key)
                if(key == '__name__'){
                    __name__ = _globals.$strings[key]
                }
            }
            _globals.$all_str = false
        }

        if(exec_globals.__builtins__ === undefined){
            exec_globals.__builtins__ = _b_.__builtins__
        }
        if(_locals === _b_.None){
            exec_locals = exec_globals
        }else{
            if(_locals === _globals){
                // running exec at module level
                global_name += '_globals'
                exec_locals = exec_globals
            }else if($B.exact_type(_locals, _b_.dict)){
                exec_locals = _locals.$strings
            }else{
                var klass = $B.get_class(_locals),
                    getitem = $B.$getattr(klass, '__getitem__'),
                    setitem = $B.$getattr(klass, '__setitem__')
                exec_locals = new Proxy(_locals, {
                    get(target, prop){
                        if(prop == '$target'){
                            return target
                        }else if(prop == $B.LOCALS_PROXY){
                            return true
                        }
                        try{
                            return $B.$call(getitem, target, prop)
                        }catch(err){
                            return undefined
                        }
                    },
                    set(target, prop, value){
                        return $B.$call(setitem, target, prop, value)
                    }
                })
            }
        }
    }

    var save_frame_obj = $B.frame_obj

    var _ast

    frame = [__name__, exec_locals, __name__, exec_globals]
    frame.is_exec_top = true
    $B.enter_frame(frame, filename, 1)
    var _frame_obj = $B.frame_obj

    if($B.exact_type(src, $B.code)){
        if(src.mode == 'exec' && mode == 'eval'){
            return _b_.None
        }
        _ast = src._ast
        if(_ast.$js_ast){
            _ast = _ast.$js_ast
        }else{
            _ast = $B.ast_py_to_js(_ast)
        }
        if(_ast instanceof $B.ast.Expression){
            // transform `expr` into `varname = expr` so that the exec_func
            // can return varname
            var expr_name = '_' + $B.UUID()
            var name = new $B.ast.Name(expr_name, new $B.ast.Store())
            $B.copy_position(name, _ast.body)
            var assign = new $B.ast.Assign([name], _ast.body)
            $B.copy_position(assign, _ast.body)
            _ast = new $B.ast.Module([assign])
        }
    }

    try{
        if(! _ast){
            var _mode = mode == 'eval' ? 'eval' : 'file'
            var parser = new $B.Parser(src, filename, _mode)
            _ast = $B._PyPegen.run_parser(parser)
        }
        var future = $B.future_features(_ast, filename),
            symtable = $B._PySymtable_Build(_ast, filename, future),
            js_obj = $B.js_from_root({ast: _ast,
                                      symtable,
                                      filename,
                                      src,
                                      namespaces: {local_name,
                                                   exec_locals,
                                                   global_name,
                                                   exec_globals}
                                      }),
            js = js_obj.js
    }catch(err){
        if(err.args){
            if(err.args[1]){
                exec_locals.$lineno = err.args[1][1]
            }
        }else{
            console.log('JS Error', err.message)
            console.log(err)
        }
        $B.frame_obj = save_frame_obj
        throw err
    }

    if(mode == 'eval'){
        // must set locals, might be used if expression is like
        // "True and True"
        if($B.get_class(src) === $B.code){
            js += `\nreturn locals.${expr_name}`
        }else{
            js = `var __file__ = '${filename}'\n` +
                 `var locals = ${local_name};\n` +
                 'return ' + js
        }
    }else if(src.single_expression){
        if($B.get_class(src) === $B.code){
            js += `var result = locals.${expr_name}\n` +
                 `if(result !== _b_.None){\n` +
                     `_b_.print(result)\n` +
                 `}`

        }else{
            js = `var __file__ = '${filename}'\n` +
                 `var result = ${js}\n` +
                 `if(result !== _b_.None){\n` +
                     `_b_.print(result)\n` +
                 `}`
        }
    }

    try{
        var exec_func = new Function('$B', '_b_', 'locals',
                                     local_name, global_name,
                                     'frame', '_frame_obj', js)
    }catch(err){
        if(true){ //$B.get_option('debug') > 1){
            console.log('eval() error\n', js)
            //console.log('-- python source\n', src)
        }
        $B.frame_obj = save_frame_obj
        throw err
    }

    try{
        var res = exec_func($B, _b_, exec_locals,
                            exec_locals, exec_globals, frame, _frame_obj)
    }catch(err){
        if(err.ob_type === undefined || err.ob_type == _b_.JavascriptError){
            console.log('JS error')
            console.log(err)
            console.log('frame obj', $B.frame_obj)
            console.log('filename', filename)
        }
        if($B.get_option('debug') > 2){
            console.log(
                'Python code\n', src,
                '\nexec func', $B.format_indent(exec_func + '', 0),
                '\n    filename', filename,
                '\n    name from filename', $B.url2name[filename],
                '\n    local_name', local_name,
                '\n    exec_locals', exec_locals,
                '\n    global_name', global_name,
                '\n    exec_globals', exec_globals,
                '\n    frame', frame,
                '\n    _ast', _ast,
                '\n    js', js,
                '\n    err', $B.get_class(err), err.args, err.$frame_obj)
        }
        $B.set_exc(err, frame)
        $B.frame_obj = save_frame_obj
        throw err
    }
    if(_globals !== _b_.None && ! _globals.$strings){
        for(var _key in exec_globals){
            if(! _key.startsWith('$')){
                _b_.dict.$setitem(_globals, _key, exec_globals[_key])
            }
        }
    }
    $B.frame_obj = save_frame_obj
    return res
}

$$eval.$is_func = true

var exec = _b_.exec = function(){
    var $ = $B.args("exec", 3, {src: null, globals: null, locals: null},
        ["src", "globals", "locals"], arguments,
        {globals: _b_.None, locals: _b_.None}, null, null, 1),
        src = $.src,
        globals = $.globals,
        locals = $.locals
    $$eval(src, globals, locals, "exec")
    return _b_.None
}

})(__BRYTHON__)