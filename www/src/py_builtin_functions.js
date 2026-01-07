// built-in functions
(function($B){
"use strict";

var _b_ = $B.builtins
_b_.__debug__ = false

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
$B.$inv_comps = {'>': 'lt', '>=': 'le', '<': 'gt', '<=': 'ge'}

var check_nb_args = $B.check_nb_args,
    check_no_kw = $B.check_no_kw,
    check_nb_args_no_kw = $B.check_nb_args_no_kw

var NoneType = $B.NoneType

/* NoneType start */
$B.NoneType.tp_richcompare = function(self, other, op){
    return _b_.object.tp_richcompare(self, other, op)
}

$B.NoneType.tp_repr = function(self){
    return 'None'
}

$B.NoneType.tp_hash = function(self){
    return 0xFCA86420
}

$B.NoneType.tp_new = function(cls){
    return None
}

$B.NoneType.nb_bool = function(self){
    return false
}

var NoneType_funcs = $B.NoneType.tp_funcs = {}

/* NoneType end */

var None = _b_.None = {
    ob_type: NoneType
}

None.__doc__ = None

_b_.__build_class__ = function(){
    $B.RAISE(_b_.NotImplementedError, '__build_class__')
}

_b_.abs = function(obj){
    check_nb_args_no_kw('abs', 1, arguments)

    var klass = $B.get_class(obj)
    try{
        var method = $B.$getattr(klass, "__abs__")
    }catch(err){
        if($B.is_exc(err, [_b_.AttributeError])){
            $B.RAISE(_b_.TypeError, "Bad operand type for abs(): '" +
                $B.class_name(obj) + "'")
        }
        throw err
    }
    return $B.$call(method, obj)
}

_b_.aiter = function(async_iterable){
    return $B.$call($B.$getattr(async_iterable, '__aiter__'))
}

_b_.all = function(obj){
    check_nb_args_no_kw('all', 1, arguments)
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(!$B.$bool(elt)){
                return false
            }
        }catch(err){
            return true
        }
    }
}

_b_.anext = function(){
    var missing = {},
        $ = $B.args('anext', 2, {async_iterator: null, _default: null},
                ['async_iterator', '_default'], arguments,
                {_default: missing}, null, null)
    var awaitable = $B.$call($B.$getattr($.async_iterator, '__anext__'))
    return awaitable.catch(
        function(err){
            if($B.is_exc(err, [_b_.StopAsyncIteration])){
                if($._default !== missing){
                    return $._default
                }
            }
            throw err
        }
    )
}

_b_.any = function(obj){
    check_nb_args_no_kw('any', 1, arguments)
    for(var elt of $B.make_js_iterator(obj)){
        if($B.$bool(elt)){
            return true
        }
    }
    return false
}

_b_.ascii = function(obj) {
    check_nb_args_no_kw('ascii', 1, arguments)
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

  if($B.get_class(obj) === $B.long_int){
      var res = prefix + obj.value.toString(base)
      return res
  }

  var value = $B.PyNumber_Index(obj)

  if(value === undefined){
     // need to raise an error
     $B.RAISE(_b_.TypeError, 'Error, argument must be an integer or' +
         ' contains an __index__ function')
  }

  if(value >= 0){return prefix + value.toString(base)}
  return '-' + prefix + (-value).toString(base)
}

function bin_hex_oct(base, obj){
    // Used by built-in function bin, hex and oct
    // base is respectively 2, 16 and 8
    if($B.$isinstance(obj, _b_.int)){
        return $builtin_base_convert_helper(obj, base)
    }else{
        try{
            var klass = $B.get_class(obj),
                method = $B.$getattr(klass, '__index__')
        }catch(err){
            if($B.is_exc(err, [_b_.AttributeError])){
                $B.RAISE(_b_.TypeError, "'" + $B.class_name(obj) +
                    "' object cannot be interpreted as an integer")
            }
            throw err
        }
        var res = $B.$call(method, obj)
        return $builtin_base_convert_helper(res, base)
    }
}

// bin() (built in function)
_b_.bin = function(obj) {
    check_nb_args_no_kw('bin', 1, arguments)
    return bin_hex_oct(2, obj)
}

_b_.breakpoint = function(){
    // PEP 553
    $B.$import('sys', [])
    var missing = {},
        hook = $B.$getattr($B.imported.sys, 'breakpointhook', missing)
    if(hook === missing){
        $B.RAISE(_b_.RuntimeError, 'lost sys.breakpointhook')
    }
    return $B.$call(hook, ...arguments)
}

_b_.callable = function(obj) {
    check_nb_args_no_kw('callable', 1, arguments)

    return _b_.hasattr(obj, '__call__')
}

_b_.chr = function(i){
    check_nb_args_no_kw('chr', 1, arguments)

    i = $B.PyNumber_Index(i)

    if(i < 0 || i > 1114111){
        $B.RAISE(_b_.ValueError, 'Outside valid range')
    }else if(i >= 0x10000 && i <= 0x10FFFF){
        var code = (i - 0x10000),
            s =  String.fromCodePoint(0xD800 | (code >> 10)) +
                 String.fromCodePoint(0xDC00 | (code & 0x3FF))
        return $B.make_String(s, [0])
    }else{
        return String.fromCodePoint(i)
    }
}

// classmethod is in py_type.js

var code = $B.code

code.tp_repr = function(_self){
    return `<code object ${_self.co_name}, file '${_self.co_filename}', ` +
        `line ${_self.co_firstlineno || 1}>`
}

code.replace = function(){
    var $ = $B.args('replace', 1, {self: null}, ['self'], arguments, {}, null, 'kw')
    var _self = $.self
    var expected = ['co_argcount', 'co_branches', 'co_cellvars', 'co_code',
        'co_consts', 'co_exceptiontable', 'co_filename', 'co_firstlineno',
        'co_flags', 'co_freevars', 'co_kwonlyargcount', 'co_lines',
        'co_linetable', 'co_lnotab', 'co_name', 'co_names', 'co_nlocals',
        'co_positions', 'co_posonlyargcount', 'co_qualname', 'co_stacksize',
        'co_varnames']
    $B.set_expected_kwargs(_self, expected, $.kw)
    return _self
}

$B.set_func_names(code, "builtins")


//compile() (built in function)
_b_.compile = function() {
    var $ = $B.args('compile', 7,
        {source:null, filename:null, mode:null, flags:null, dont_inherit:null,
         optimize:null, _feature_version:null},
         ['source', 'filename', 'mode', 'flags', 'dont_inherit', 'optimize',
             '_feature_version'],
         arguments,
         {flags: 0, dont_inherit: false, optimize: -1, _feature_version: 0},
         null, null)

    var module_name = '$exec_' + $B.UUID()
    $.ob_type = code
    $.co_flags = $.flags
    $.co_name = "<module>"
    var filename = $.co_filename = $.filename
    var interactive = $.mode == "single" && ($.flags & 0x200)
    $B.file_cache[filename] = $.source
    $B.url2name[filename] = module_name

    if ($.flags & $B.PyCF_TYPE_COMMENTS) {
        // $B.RAISE(_b_.NotImplementedError, 'Brython does not currently support parsing of type comments')
    }

    if($B.$isinstance($.source, _b_.bytes)){
        var encoding = 'utf-8',
            lfpos = $.source.source.indexOf(10),
            first_line,
            second_line
        if(lfpos == -1){
            first_line = $.source
        }else{
            first_line = _b_.bytes.$factory($.source.source.slice(0, lfpos))
        }
        // decode with a safe decoder
        first_line = _b_.bytes.decode(first_line, 'latin-1')
        // search encoding (PEP263)
        var encoding_re = /^[ \t\f]*#.*?coding[:=][ \t]*([-_.a-zA-Z0-9]+)/
        var mo = first_line.match(encoding_re)
        if(mo){
            encoding = mo[1]
        }else if(lfpos > -1){
            // try second line
            var rest = $.source.source.slice(lfpos + 1)
            lfpos = rest.indexOf(10)
            if(lfpos > -1){
                second_line = _b_.bytes.$factory(rest.slice(0, lfpos))
            }else{
                second_line = _b_.bytes.$factory(rest)
            }
            second_line = _b_.bytes.decode(second_line, 'latin-1')
            mo = second_line.match(encoding_re)
            if(mo){
                encoding = mo[1]
            }
        }
        $.source = _b_.bytes.decode($.source, encoding)
    }

    if(! $B.$isinstance(filename, [_b_.bytes, _b_.str])){
        // module _warning is in builtin_modules.js
        $B.warn(_b_.DeprecationWarning,
            `path should be string, bytes, or os.PathLike, ` +
            `not ${$B.class_name(filename)}`)
    }
    if(interactive && ! $.source.endsWith("\n")){
        // This is used in codeop.py to raise SyntaxError until a block in the
        // interactive interpreter ends with "\n"
        // Cf. issue #853
        var lines = $.source.split("\n"),
            last_line = $B.last(lines)
        if(last_line.startsWith(" ")){
            var msg = "unexpected EOF while parsing",
                exc = $B.EXC(_b_.SyntaxError)
            exc.filename = filename
            exc.lineno = exc.end_lineno = lines.length - 1
            exc.offset = 0
            exc.end_offset = last_line.length - 1
            exc.text = last_line
            exc.args = [msg, $B.fast_tuple([filename, exc.lineno, exc.offset,
                        exc.text, exc.end_lineno, exc.end_offset])]
            throw exc
        }
    }

    if($B.get_class($.source).__module__ == 'ast'){
        // compile an ast instance
        $B.imported._ast._validate($.source)
        $._ast = $.source
        delete $.source
        return $
    }

    var _ast,
        parser


    // generated PEG parser
    try{
        var parser_mode = $.mode == 'eval' ? 'eval' : 'file'
        parser = new $B.Parser($.source, filename, parser_mode)
        parser.flags = $.flags
        _ast = $B._PyPegen.run_parser(parser)
    }catch(err){
        if($.mode == 'single'){
            var tester = parser.tokens[parser.tokens.length - 2]
            if(tester && (
                    (tester.type == "NEWLINE" && ($.flags & $B.PyCF_ALLOW_INCOMPLETE_INPUT)) ||
                    (tester.type == "DEDENT" && ($.flags & 0x200)))){
                err.ob_type = _b_._IncompleteInputError
                err.args[0] = 'incomplete input'
            }
        }
        throw err
    }
    if($.mode == 'single' && _ast.body.length == 1 &&
            _ast.body[0] instanceof $B.ast.Expr){
        // If mode is 'single' and the source is a single expression,
        // set _ast to an Expression and set attribute .single_expression
        // to compile() result. This is used in exec() to print the
        // expression if it is not None
        parser = new $B.Parser($.source, filename, 'eval')
        _ast = $B._PyPegen.run_parser(parser)
        $.single_expression = true
    }

    if($.flags == $B.PyCF_ONLY_AST){
        delete $B.url2name[filename]
        let res = $B.ast_js_to_py(_ast)
        res.$js_ast = _ast
        return res
    }

    delete $B.url2name[filename]
    // Set attribute ._ast to avoid compiling again if result is passed to
    // exec()
    $._ast = $B.ast_js_to_py(_ast)
    $._ast.$js_ast = _ast

    // Compile the ast to JS, as in py2js, so we emit syntax errors created
    // by the JS conversion process.
    var future = $B.future_features(_ast, filename)
    var symtable = $B._PySymtable_Build(_ast, filename, future)
    $B.js_from_root({
        ast: _ast,
        symtable,
        filename,
        src: $.source
    })

    return $
}


//function complex is located in py_complex.js

// built-in variable __debug__
_b_.debug = $B.debug > 0

_b_.delattr = function(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has
    // a method __delete__(), use it
    check_nb_args_no_kw('delattr', 2, arguments)
    if(typeof attr != 'string'){
        $B.RAISE(_b_.TypeError, "attribute name must be string, not '" +
            $B.class_name(attr) + "'")
    }
    // If the object's class has a __delattr__ method, use it
    var deleter = $B.search_in_mro($B.get_class(obj), '__delattr__')
    if(deleter){
        return deleter(obj, attr)
    }
    return _b_.object.__delattr__(obj, attr)
}

$B.$delattr = function(obj, attr, inum){
    try{
        _b_.delattr(obj, attr)
    }catch(err){
        $B.set_inum(inum)
        throw err
    }
}

$B.$delete = function(name, locals_id, inum){
    // Code for "del x" (remove name from namespace)
    function del(obj){
        if($B.get_class(obj) === $B.generator){
            // Force generator return (useful if yield was in a context manager)
            obj.js_gen.return()
        }
        var del_method = $B.search_in_mro($B.get_class(obj), '__del__')
        if(del_method){
            $B.$call(del_method, obj)
        }
    }
    var found = false
    if(locals_id === 'local'){
        var frame = $B.frame_obj.frame
        if(frame[1].hasOwnProperty(name)){
            found = true
            del(frame[1][name])
            delete frame[1][name]
        }
    }else if(locals_id === 'global'){
        var frame = $B.frame_obj.frame
        if(frame[3].hasOwnProperty(name)){
            found = true
            del(frame[3][name])
            delete frame[3][name]
        }
    }else if(locals_id !== null && locals_id[name] !== undefined){
        found = true
        del(locals_id[name])
        delete locals_id[name]
    }
    if(! found){
        $B.set_inum(inum)
        if(locals_id == 'local'){
            $B.RAISE(_b_.UnboundLocalError,
                `cannot access local variable '${name}' ` +
                'where it is not associated with a value')
        }else{
            throw $B.name_error(name)
        }
    }
}

_b_.dir = function(obj){
    if(obj === undefined){
        // if dir is called without arguments, use locals
        var locals = _b_.locals()
        return _b_.sorted(locals)
    }

    check_nb_args_no_kw('dir', 1, arguments)

    var klass = $B.get_class(obj)

    console.log('dir of obj', obj, 'is class', $B.is_type(obj))

    if($B.is_type(obj)){
        // Use metaclass __dir__
        var dir_func = $B.$getattr($B.get_class(obj), "__dir__", $B.NULL)
        console.log('use dir func', dir_func)
        return $B.$call(dir_func, obj)
    }
    try{
        let res = $B.$call($B.$getattr(klass, '__dir__'), obj)
        res = _b_.list.$factory(res)
        return res
    }catch (err){
        // ignore, default
        if($B.get_option('debug') > 2){
            console.log('error in dir, obj', obj, 'klass', klass,
                $B.$getattr(klass, '__dir__'), err.message)
        }
        throw err
    }
}

//divmod() (built in function)
_b_.divmod = function(x,y){
    check_nb_args_no_kw('divmod', 2, arguments)

    try{
        return $B.rich_op('__divmod__', x, y)
    }catch(err){
        if($B.is_exc(err, [_b_.TypeError])){
            return _b_.tuple.$factory([$B.rich_op('__floordiv__', x, y),
                                       $B.rich_op('__mod__', x, y)])
        }
        throw err
    }
}

var enumerate = _b_.enumerate
enumerate.__mro__ = [_b_.object]

enumerate.$factory = function(){
    var $ns = $B.args("enumerate", 2, {iterable: null, start: null},
        ['iterable', 'start'], arguments, {start: 0}, null, null),
        _iter = iter($ns["iterable"]),
        start = $ns["start"]
    return {
        ob_type: enumerate,
        __name__: 'enumerate iterator',
        counter: start - 1,
        iter: _iter,
        start: start
    }
}

enumerate.__class_getitem__ = $B.$class_getitem

enumerate.__iter__ = function(self){
    self.counter = self.start - 1
    return self
}

enumerate.__next__ = function(self){
    self.counter++
    return $B.fast_tuple([self.counter, next(self.iter)])
}

$B.set_func_names(enumerate, "builtins")

$B.LOCALS_PROXY = Symbol('locals_proxy')

enumerate.__class_getitem__ = _b_.classmethod.$factory(enumerate.__class_getitem__)

//eval() (built in function)
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

    if($B.get_class(src) === code){
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
        if(_globals.$jsobj){ // eg globals()
            exec_globals = _globals.$jsobj
        }else{
            // The globals object must be the same across calls to exec()
            // with the same dictionary (cf. issue 690)
            exec_globals = _globals.$jsobj = {}
            for(var key of _b_.dict.$keys_string(_globals)){
                _globals.$jsobj[key] = _b_.dict.$getitem_string(_globals, key)
                if(key == '__name__'){
                    __name__ = _globals.$jsobj[key]
                }
            }
            _globals.$all_str = false
        }

        if(exec_globals.__builtins__ === undefined){
            exec_globals.__builtins__ = _b_.__builtins__
        }
        // filename = exec_globals.__file__ || '<string>'
        if(_locals === _b_.None){
            exec_locals = exec_globals
        }else{
            if(_locals === _globals){
                // running exec at module level
                global_name += '_globals'
                exec_locals = exec_globals
            }else if(_locals.$jsobj){
                for(let key in _locals.$jsobj){
                    exec_globals[key] = _locals.$jsobj[key]
                }
            }else{
                if(_locals.$jsobj){
                    exec_locals = _locals.$jsobj
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
    }

    var save_frame_obj = $B.frame_obj

    var _ast

    frame = [__name__, exec_locals, __name__, exec_globals]
    frame.is_exec_top = true
    $B.enter_frame(frame, filename, 1)
    var _frame_obj = $B.frame_obj

    if($B.get_class(src) === code){
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
        }
        $B.frame_obj = save_frame_obj
        throw err
    }


    if(mode == 'eval'){
        // must set locals, might be used if expression is like
        // "True and True"
        if($B.get_class(src) === _b_.code){
            js += `\nreturn locals.${expr_name}`
        }else{
            js = `var __file__ = '${filename}'\n` +
                 `var locals = ${local_name};\n` +
                 'return ' + js
        }
    }else if(src.single_expression){
        if($B.get_class(src) === _b_.code){
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
        if($B.get_option('debug') > 1){
            console.log('eval() error\n', $B.format_indent(js, 0))
            console.log('-- python source\n', src)
        }
        $B.frame_obj = save_frame_obj
        throw err
    }

    try{
        var res = exec_func($B, _b_, exec_locals,
                            exec_locals, exec_globals, frame, _frame_obj)
    }catch(err){
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
    if(_globals !== _b_.None && ! _globals.$jsobj){
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

exec.$is_func = true

var exit = _b_.exit = function(){
    throw _b_.SystemExit
}

exit.__repr__ = exit.__str__ = function(){
    return "Use exit() or Ctrl-Z plus Return to exit"
}

var filter = _b_.filter
filter.$factory = function(func, iterable){
    check_nb_args_no_kw('filter', 2, arguments)

    iterable = iter(iterable)
    if(func === _b_.None){func = $B.$bool}

    return {
        ob_type: filter,
        func: func,
        iterable: iterable
    }
}

filter.tp_iter = function(self){
    return self
}

filter.tp_iternext = function(self) {
    while(true){
        var _item = next(self.iterable)
        if(self.func(_item)){return _item}
    }
}

$B.set_func_names(filter, "builtins")

_b_.format = function() {
    var $ = $B.args("format", 2, {value: null, format_spec: null},
            ["value", "format_spec"], arguments, {format_spec: ''}, null, null),
            value = $.value
    var klass = $B.get_class(value)
    try{
        var method = $B.$getattr(klass, '__format__')
    }catch(err){
        if($B.is_exc(err, [_b_.AttributeError])){
            $B.RAISE(_b_.NotImplementedError, "__format__ is not implemented " +
                "for object '" + _b_.str.$factory(value) + "'")
        }
        throw err
    }
    return $B.$call(method, value, $.format_spec)
}

function attr_error(attr, obj){
    var cname = $B.get_class(obj)
    var msg = "bad operand type for unary #: '" + cname + "'"
    switch(attr){
        case '__neg__':
            $B.RAISE(_b_.TypeError, msg.replace('#', '-'))
        case '__pos__':
            $B.RAISE(_b_.TypeError, msg.replace('#', '+'))
        case '__invert__':
            $B.RAISE(_b_.TypeError, msg.replace('#', '~'))
        case '__call__':
            $B.RAISE(_b_.TypeError, "'" + cname + "'" +
                ' object is not callable')
        default:
            throw $B.attr_error(attr, obj)
    }
}

_b_.getattr = function(){
    var missing = {}
    var $ = $B.args("getattr", 3, {obj: null, attr: null, _default: null},
        ["obj", "attr", "_default"], arguments, {_default: missing},
        null, null)
    if(! $B.$isinstance($.attr, _b_.str)){
        $B.RAISE(_b_.TypeError, "attribute name must be string, " +
            `not '${$B.class_name($.attr)}'`)
    }

    return $B.$getattr($.obj, _b_.str.$to_string($.attr),
        $._default === missing ? undefined : $._default)
}

$B.search_in_mro = function(klass, attr, _default){
    var test = false // attr == 'upper' // && klass.__qualname__ == 'MagicMock'
    if(test){
        console.log('search', attr, 'in mro of', klass)
        console.log(Error('trace').stack)
        console.log('default', _default)
    }
    /*
    if(klass.dict){
        if(! klass.dict.hasOwnProperty){
            console.log('no hasOwnProperty', klass)
        }
        var v = $B.str_dict_get(klass.dict, attr, $B.NULL)
        if(v !== $B.NULL){
            if(test){
                console.log('found in klass dict', klass.dict, v)
            }
            return v
        }
    }
    if(klass.hasOwnProperty && klass.hasOwnProperty(attr)){
        if(test){
            console.log('found in klass', klass, klass[attr])
        }
        if(attr == '__class__' && klass.ob_type){
            // ignore for the moment
        }else{
            return klass[attr]
        }
    }
    */
    var mro = $B.get_mro(klass)
    if(mro === undefined){
        console.log('no mro in class', klass, klass.tp_mro, klass.__mro__)
        console.log(Error().stack)
        mro = klass.tp_mro = _b_.type.$mro(klass)
    }
    for(var i = 0, len = mro.length; i < len; i++){
        if(test){
            console.log('search', attr, 'in', mro[i])
        }
        if(mro[i].hasOwnProperty && mro[i].hasOwnProperty(attr)){
            if(test){
                console.log('found in mro', i, mro[i])
                console.log(mro[i][attr])
            }
            if(! mro[i].dict ||
                    $B.str_dict_get(mro[i].dict, attr, $B.NULL) === $B.NULL){
                console.log('attr', attr, 'found in mro[i]', mro[i],
                    'but absent in dict')
            }
            return mro[i][attr]
        }else if(mro[i].dict){
            if(mro[i].dict.$strings === undefined){
                console.log('no $strings in dict', mro[i])
            }
            var v = $B.str_dict_get(mro[i].dict, attr, $B.NULL)
            if(v !== $B.NULL){
                if(test){
                    console.log('found in dict of mro', i, v)
                }
                return v
            }
        }else if(mro[i].__dict__){
            console.log('old school __dict__')
            var v = _b_.dict.$get_string(mro[i].__dict__, attr, false)
            if(v !== false){
                if(test){
                    console.log('found in dict of mro', i, v)
                }
                return v
            }
        }
    }
    return _default
}

var missing_attr = {'missing_attr': true}
var NULL = $B.NULL

$B.search_in_dict = function(obj, attr, _default){
    var test = false // attr == 'now'
    var is_type = $B.is_type(obj)
    if(obj.__dict__){
        console.log('old school __dict__')
        var in_dict = _b_.dict.$get_string(obj.__dict__, attr)
        if(in_dict !== _b_.dict.$missing){
            return in_dict
        }
    }
    if(obj.dict){
        var v = $B.str_dict_get(obj.dict, attr, $B.NULL)
        if(v !== $B.NULL){
            return v
        }
    }

    if(obj.hasOwnProperty){
        if(obj.hasOwnProperty(attr)){
            return obj[attr]
        }
    }
    return _default
}

$B.object_getattribute = function(obj, attr){
    var klass = $B.get_class(obj)
    var test = false // attr == 'clientHeight' // klass === _b_.TypeError
    var getattribute = $B.search_slot(klass, 'tp_getattro', $B.NULL)
    if(getattribute === $B.NULL){
        $B.RAISE(_b_.TypeError, 'no __getattribute__')
    }
    if(test){
        console.log('get attr', attr, 'of obj', obj, 'klass', klass)
        console.log(getattribute)
    }
    var res = getattribute(obj, attr)
    if(test){
        console.log('result of getattribute', res)
    }
    if(res === $B.NULL){
        var getattr = $B.search_in_mro(klass, '__getattr__')
        if(getattr){
            try{
                res = getattr(obj, attr)
            }catch(err){
                $B.RAISE_IF_NOT(err, _b_.AttributeError)
                return $B.NULL
            }
        }else{
            return $B.NULL
        }
    }
    return res
}

$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments
    var test = false // attr == '_member_names_'
    if(test){
        console.log('$getattr', obj, attr)
    }
    var res
    if(obj === undefined || obj === null){
        console.log('attr', attr)
        console.log(Error('trace 1087').stack)
        $B.RAISE_ATTRIBUTE_ERROR("Javascript object '" + obj +
            "' has no attribute", obj, attr)
    }
    if(obj.$method_cache &&
            obj.$method_cache[attr] &&
            $B.get_class(obj)[attr] == obj.$method_cache[attr][1]){
        // Optimisation : cache for instance methods
        // If the attribute is a method defined in the instance's class,
        // obj.$method_cache[attr] is a 2-element list [method, func] where
        // method is the method and func is the function obj.__class__[attr]
        // We check that the function has not changed since the method was
        // cached and if not, return the method
        return obj.$method_cache[attr][0]
    }

    var rawname = attr

    if(obj === undefined){
        console.log("get attr", attr, "of undefined")
    }

    var is_class = $B.is_type(obj) // obj.$is_class || obj.$factory

    var klass = $B.get_class(obj)

    if(test){
        console.log("attr", attr, "of", obj, "class", klass ?? $B.get_class(obj),
        "isclass", is_class)
    }

    if(! is_class){
        var res =  $B.object_getattribute(obj, attr)
    }else{
        var res = $B.type_getattribute(obj, attr)
    }
    if(res === $B.NULL){
        if(_default !== undefined){
            return _default
        }
        throw $B.attr_error(attr, obj)
    }
    return res
}

// globals() (built in function)
_b_.globals = function(){
    // $B.frame_obj.frame is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args_no_kw('globals', 0, arguments)
    var res = $B.obj_dict($B.frame_obj.frame[3])
    res.$jsobj.__BRYTHON__ = $B.jsobj2pyobj($B) // issue 1181
    res.$is_namespace = true
    return res
}

_b_.hasattr = function(obj,attr){
    check_nb_args_no_kw('hasattr', 2, arguments)
    try{
        $B.$getattr(obj, attr)
        return true
    }catch(err){
        return false
    }
}

_b_.hash = function(obj){
    check_nb_args_no_kw('hash', 1, arguments)
    return $B.$hash(obj)
}

$B.$hash = function(obj){
    if(obj.__hashvalue__ !== undefined){
        return obj.__hashvalue__
    }
    if(typeof obj === "boolean"){
        return obj ? 1 : 0
    }
    var klass = $B.get_class(obj)
    var hash_func = $B.search_slot(klass, 'tp_hash', $B.NULL)
    if(hash_func !== $B.NULL){
        return hash_func(obj)
    }
    $B.RAISE(_b_.TypeError, "unhashable type: '" +
            _b_.str.$factory($B.jsobj2pyobj(obj)) + "'")
    /*
    if(obj.$is_class ||
            klass === _b_.type ||
            klass === $B.function){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    if(typeof obj == "string"){
        return _b_.str.tp_hash(obj)
    }else if(typeof obj == "number"){
        return obj
    }else if(typeof obj == "boolean"){
        return obj ? 1 : 0
    }else if(klass === _b_.float){
        return _b_.float.$hash_func(obj)
    }
    // Implicit invocation of special methods uses object class, even if
    // obj has an attribute __hash__
    if(klass === undefined){
        $B.RAISE(_b_.TypeError, "unhashable type: '" +
                _b_.str.$factory($B.jsobj2pyobj(obj)) + "'")
    }

    var hash_method = _b_.type.__getattribute__(klass, '__hash__', _b_.None)

    if(hash_method === _b_.None){
        $B.RAISE(_b_.TypeError, "unhashable type: '" +
                $B.class_name(obj) + "'")
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
    function check_int(v){
        if((! Number.isInteger(v)) && ! $B.$isinstance(v, _b_.int)){
            $B.RAISE(_b_.TypeError,
                '__hash__ method should return an integer')
        }
        return v
    }
    var res
    if(hash_method === _b_.object.__hash__){
        if(_b_.type.__getattribute__(klass, '__eq__') !== _b_.object.__eq__){
            $B.RAISE(_b_.TypeError, "unhashable type: '" +
                $B.class_name(obj) + "'", 'hash')
        }else{
            return obj.__hashvalue__ = check_int(_b_.object.__hash__(obj))
        }
    }else{
        return check_int($B.$call(hash_method), obj)
    }
    */
}

var help = _b_.help = function(obj){
    if(obj === undefined){obj = 'help'}

    if(typeof obj == 'string'){
        var lib_url = 'https://docs.python.org/3/library'
        // search in standard lib
        var parts = obj.split('.'),
            head = [],
            url
        while(parts.length > 0){
            head.push(parts.shift())
            if($B.stdlib[head.join('.')]){
                url = head.join('.')
            }else{
                break
            }
        }
        if(url){
            var doc_url
            if(['browser', 'javascript', 'interpreter'].
                    indexOf(obj.split('.')[0]) > -1){
                doc_url = '/static_doc/' + ($B.language == 'fr' ? 'fr' : 'en')
            }else{
                doc_url = lib_url
            }
            window.open(`${doc_url}/${url}.html#` + obj)
            return
        }
        // built-in functions or classes
        if(_b_[obj]){
            if(obj == obj.toLowerCase()){
                url = lib_url + `/functions.html#${obj}`
            }else if(['False', 'True', 'None', 'NotImplemented', 'Ellipsis', '__debug__'].
                    indexOf(obj) > -1){
                url = lib_url + `/constants.html#${obj}`
            }else if(_b_[obj].$is_class &&
                    _b_[obj].tp_bases.indexOf(_b_.Exception) > -1){
                url = lib_url + `/exceptions.html#${obj}`
            }
            if(url){
                window.open(url)
                return
            }
        }
        // use pydoc
        $B.$import('pydoc')
        return $B.$call($B.$getattr($B.imported.pydoc, 'help'), obj)
    }
    if($B.get_class(obj) === $B.module){
        return help($B.get_name(obj))
    }
    try{
        _b_.print($B.$getattr(obj, '__doc__'))
    }catch(err){
        return ''
    }
}

help.__repr__ = help.__str__ = function(){
    return "Type help() for interactive help, or help(object) " +
        "for help about object."
}

_b_.hex = function(obj){
    check_nb_args_no_kw('hex', 1, arguments)
    return bin_hex_oct(16, obj)
}

_b_.id = function(obj){
   check_nb_args_no_kw('id', 1, arguments)
   if(obj.$id !== undefined){
       return obj.$id
   }else if($B.$isinstance(obj, [_b_.str, _b_.int, _b_.float]) &&
           ! $B.$isinstance(obj, $B.long_int)){
       return $B.$getattr(_b_.str.$factory(obj), '__hash__')()
   }else{
       return obj.$id = $B.UUID()
   }
}

// The default __import__ function is a builtin
_b_.__import__ = function(){
    // TODO : Install $B.$__import__ in builtins module to avoid nested call
    var $ = $B.args('__import__', 5,
        {name: null, globals: null, locals: null, fromlist: null, level: null},
        ['name', 'globals', 'locals', 'fromlist', 'level'],
        arguments,
        {globals:None, locals:None, fromlist:_b_.tuple.$factory(), level:0},
        null, null)
    return $B.$__import__($.name, $.globals, $.locals, $.fromlist)
}

// not a direct alias of prompt: input has no default value
_b_.input = function(msg) {
    var res = prompt(msg || '') || ''
    if($B.imported["sys"] && $B.imported["sys"].ps1){
        // Interactive mode : echo the prompt + input
        // cf. issue #853
        var ps1 = $B.imported["sys"].ps1,
            ps2 = $B.imported["sys"].ps2
        if(msg == ps1 || msg == ps2){
            console.log(msg, res)
        }
    }
    return res
}

_b_.isinstance = function(obj, cls){
    check_nb_args_no_kw('isinstance', 2, arguments)
    return $B.$isinstance(obj, cls)
}

$B.$isinstance = function(obj, cls){
    if(obj === null){
        return cls === $B.imported.javascript.NullType
    }
    if(obj === undefined){
        return false
    }
    var kls
    if(Array.isArray(cls)){
        for(kls of cls){
            if($B.$isinstance(obj, kls)){
                return true
            }
        }
        return false
    }
    var klass = $B.get_class(cls)
    if(klass === $B.UnionType){
        for(kls of cls.items){
            if($B.$isinstance(obj, kls)){
                return true
            }
        }
        return false
    }

    if(klass === $B.GenericAlias){
        // PEP 585
        $B.RAISE(_b_.TypeError,
            'isinstance() arg 2 cannot be a parameterized generic')
    }
    if((!klass) && (! cls.$is_class)){
        if(! $B.$getattr(cls, '__instancecheck__', false)){
            $B.RAISE(_b_.TypeError, "isinstance() arg 2 must be a type " +
                "or tuple of types")
        }
    }

    if(cls === _b_.int && (obj === True || obj === False)){
        return true
    }

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

    if(klass == undefined){
        if(typeof obj == 'string'){
            if(cls == _b_.str){
                return true
            }else if($B.builtin_classes.includes(cls)){
                return false
            }
        }else if(typeof obj == 'number' && Number.isFinite(obj)){
            if(Number.isFinite(obj) && cls == _b_.int){
                return true
            }
        }
    }

    var obj_class = $B.get_class(obj)

    if(obj_class ===  cls){
        return true
    }
    var mro = $B.get_mro(obj_class)
    if(mro){
        for(var i = 0; i < mro.length; i++){
           if(mro[i] === cls){
               return true
           }
        }
    }
    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = $B.type_getattribute($B.get_class(cls),
        '__instancecheck__', $B.NULL)
    if(instancecheck !== $B.NULL){
        return $B.$call(instancecheck, cls, obj)
    }
    return false
}

var issubclass = _b_.issubclass = function(klass, classinfo){
    check_nb_args_no_kw('issubclass', 2, arguments)
    if($B.$isinstance(classinfo, _b_.tuple)){
        for(var i = 0; i < classinfo.length; i++){
           if(issubclass(klass, classinfo[i])){return true}
        }
        return false
    }
    if($B.get_class(classinfo) === $B.GenericAlias){
        $B.RAISE(_b_.TypeError,
            'issubclass() arg 2 cannot be a parameterized generic')
    }
    var mro = $B.get_mro(klass)

    if(klass === classinfo || mro.indexOf(classinfo) > -1){
        return true
    }

    // Search __subclasscheck__ on classinfo
    var sch = $B.type_getattribute(classinfo, '__subclasscheck__', $B.NULL)

    if(sch === $B.NULL){
        return false
    }
    return $B.$call(sch, classinfo, klass)
}

// Utility class for iterators built from objects that have a __getitem__ and
// __len__ method

/* iterator start */
$B.iterator.tp_iter = function(self){
    return self
}

$B.iterator.tp_iternext = function*(self){
    var ob_type = $B.get_class(self.it_seq)
    var len = $B.search_in_mro(ob_type, '__len__')(self.it_seq)
    var getitem = $B.search_in_mro(ob_type, '__getitem__')
    if(self.it_index <= len){
        yield getitem(self.it_seq, self.it_index)
        self.it_index++
    }
}

var iterator_funcs = $B.iterator.tp_funcs = {}

iterator_funcs.__length_hint__ = function(self){

}

iterator_funcs.__reduce__ = function(self){

}

iterator_funcs.__setstate__ = function(self){

}

$B.iterator.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* iterator end */

const callable_iterator = $B.make_builtin_class("callable_iterator")

callable_iterator.$factory = function(func, sentinel){
    return {
        ob_type: callable_iterator,
        func: func,
        sentinel: sentinel
    }
}

callable_iterator.tp_iter_ = function(self){
    return self
}

callable_iterator.tp_iternext = function(self){
    var res = self.func()
    if($B.rich_comp("__eq__", res, self.sentinel)){
        $B.RAISE(_b_.StopIteration, )
    }
    return res
}

$B.set_func_names(callable_iterator, "builtins")

$B.PySequence_Check = function(s){
    if($B.$isinstance(s, _b_.dict)){
        return false
    }
    var t = $B.get_class(s)
    return t.$tp_as_sequence &&
        t.$tp_as_sequence.sq_item != undefined
}

$B.PyIter_Check = function(obj){
    var tp = $B.get_class(obj)
    return (tp.tp_iternext !== undefined &&
            tp.tp_iternext != $B._PyObject_NextNotImplemented)
}

$B.PySeqIter_New = function(seq){
    return {
        ob_type : $B.PySeqIter_Type,
        it_index: 0,
        it_seq: seq
    }
}

$B.PyObject_GetIter = function(obj){
    var t = $B.get_class(obj)
    var f = t.tp_iter;
    if(f === undefined){
        if(PySequence_Check(o)){
            return PySeqIter_New(o);
        }
        $B.RAISE(_b_.TypeError, `'${t.__name__}' object is not iterable`)
    }else{
        var res = f(o)
        if(! $B.PyIter_Check(res)){
            $B.RAISE(_b_.TypeError,
                         "iter() returned non-iterator "
                         `of type '${$B.class_name(res)}'`)
        }
        return res
    }
}

$B.$iter = function(obj, sentinel){
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    var test = false // obj.tp_name == 'FlagBoundary'
    var NULL = {}
    if(test){
        console.log('iter', obj)
    }
    if(sentinel === undefined){

        var klass = $B.get_class(obj)
        var iter_func = $B.search_slot(klass, 'tp_iter', $B.NULL)
        if(test){
            console.log('iter func', iter_func)
        }
        if(iter_func !== $B.NULL){
            var res = $B.$call(iter_func, obj)
            if($B.search_slot($B.get_class(res), 'tp_iternext', $B.NULL) === $B.NULL){
                $B.RAISE(_b_.TypeError,
                    `iter() returned non-iterable of type '${$B.class_name(res)}'`)
            }
            return res
        }
        var getitem_func = $B.search_in_mro(klass, '__getitem__', $B.NULL)
        var len_func = $B.search_in_mro(klass, '__len__', $B.NULL)
        if(test){
            console.log('getitem_func', getitem_func)
            console.log('len_func', len_func)
        }
        if(getitem_func !== $B.NULL && len_func !== $B.NULL){
            return {
                ob_type: $B.iterator,
                it_seq: obj,
                it_index: 0
            }
        }

        $B.RAISE(_b_.TypeError, "'" + $B.class_name(obj) +
            "' object is not iterable")
    }else{
        return callable_iterator.$factory(obj, sentinel)
    }
}

var iter = _b_.iter = function(){
    // Function exposed to Brython programs, with arguments control
    var $ = $B.args('iter', 1, {obj: null}, ['obj'], arguments,
        {}, 'args', 'kw'),
        sentinel
    if($.args.length > 0){
        sentinel = $.args[0]
    }
    return $B.$iter($.obj, sentinel)
}

var len = _b_.len = function(obj){
    check_nb_args_no_kw('len', 1, arguments)

    var klass = $B.get_class(obj)
    var method = $B.search_in_mro(klass, '__len__', null)
    if(method === null){
        $B.RAISE(_b_.TypeError, "object of type '" +
            $B.class_name(obj) + "' has no len()")
    }

    let res = $B.$call(method, obj)

    if(res === undefined){
        console.log('call', method, 'with obj', obj, 'returns undef')
    }

    if (!$B.$isinstance(res, _b_.int)){
        $B.RAISE(_b_.TypeError, `'${$B.class_name(res)}' object cannot be interpreted as an integer`)
    }

    if(!$B.rich_comp('__ge__', res, 0)) {
        $B.RAISE(_b_.ValueError, 'ValueError: __len__() should return >= 0')
    }

    return res
}

_b_.locals = function(){
    // $B.frame_obj.frame is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('locals', 0, arguments)
    var locals_obj = $B.frame_obj.frame[1]
    // In a class body, locals() is a proxy around a dict(-like) object
    var class_locals = locals_obj.$target
    if(class_locals){
        return class_locals
    }
    var res = $B.obj_dict($B.clone(locals_obj),
        function(key){
            return key.startsWith('$')
        }
    )
    res.$is_namespace = true
    // delete res.$jsobj.__annotations__
    return res
}


var map = _b_.map

map.$factory = function(){
    var $ = $B.args('map', 2, {func: null, it1:null}, ['func', 'it1'],
            arguments, {}, 'args', null),
        func = $.func
    var iter_args = [$B.make_js_iterator($.it1)]
    for(var arg of $.args){
        iter_args.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: map,
        args: iter_args,
        func: func
    }
}

map.tp_iter = function (self){
    return self
}

map.tp_iternext = function*(self){
    var args = []
    for(var iter of self.args){
        var arg = iter.next()
        if(arg.done){
            $B.RAISE(_b_.StopIteration, '')
        }
        args.push(arg.value)
    }
    yield $B.$call(self.func, ...args)
}

$B.set_func_names(map, "builtins")


function $extreme(args, op){ // used by min() and max()
    var $op_name = 'min'
    if(op === '__gt__'){$op_name = "max"}

    var $ = $B.args($op_name, 0, {}, [], args, {}, 'args', 'kw')

    var has_default = false,
        func = false
    for(var item of _b_.dict.$iter_items($.kw)){
        switch(item.key){
            case 'key':
                func = item.value
                //func = func === _b_.None ? func : $B.$call(func)
                break
            case 'default':
                var default_value = item.value
                has_default = true
                break
            default:
                $B.RAISE(_b_.TypeError, "'" + item.key +
                    "' is an invalid keyword argument for this function")
        }
    }

    if((! func) || func === _b_.None){
        func = x => x
    }

    if($.args.length == 0){
        $B.RAISE(_b_.TypeError, $op_name +
            " expected 1 arguments, got 0")
    }else if($.args.length == 1){
        // Only one positional argument : it must be an iterable
        var $iter = $B.make_js_iterator($.args[0]),
            res = null,
            x_value,
            extr_value
        for(var x of $iter){
            if(res === null){
                extr_value = $B.$call(func, x)
                res = x
            }else{
                x_value = $B.$call(func, x)
                if($B.rich_comp(op, x_value, extr_value)){
                    res = x
                    extr_value = x_value
                }
            }
        }
        if(res === null){
            if(has_default){
                return default_value
            }else{
                $B.RAISE(_b_.ValueError, $op_name +
                    "() arg is an empty sequence")
            }
        }else{
            return res
        }
    }else{
        if(has_default){
           $B.RAISE(_b_.TypeError, "Cannot specify a default for " +
               $op_name + "() with multiple positional arguments")
        }
        var _args
        if($B.last(args).$kw){
            _args = [$.args].concat($B.last(args))
        }else{
            _args = [$.args]
        }
        return $extreme.call(null, _args, op)
    }
}

_b_.max = function(){
    return $extreme(arguments, '__gt__')
}

var memoryview = _b_.memoryview

memoryview.$factory = function(obj){
    check_nb_args_no_kw('memoryview', 1, arguments)
    if($B.get_class(obj) === memoryview){
        return obj
    }
    if($B.get_class(obj).$buffer_protocol){
        obj.$exports = obj.$exports ?? 0
        obj.$exports++ // used to prevent resizing
        var res = {
            ob_type: memoryview,
            obj: obj,
            mbuf: null,
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
        return res
    }else{
        $B.RAISE(_b_.TypeError, "memoryview: a bytes-like object " +
            "is required, not '" + $B.class_name(obj) + "'")
    }
}

memoryview.$match_sequence_pattern = true, // for Pattern Matching (PEP 634)
memoryview.$buffer_protocol = true
memoryview.$not_basetype = true // cannot be a base class
memoryview.$is_sequence = true

memoryview.$getbuffer = function(self){
    self.$exports++
}

function memory_obj_get(){

}

function memory_nbytes_get(self){
    var product = 1
    for(var x of self.shape){
        product *= x
    }
    return x * self.itemsize
}

function memory_readonly_get(self){
    return $B.$isinstance(self.obj, _b_.bytes)
}

function memory_itemsize_get(){

}

function memory_format_get(){

}

function memory_ndim_get(){

}

function memory_shape_get(){

}

function memory_strides_get(){

}

function memory_suboffsets_get(){

}

function memory_c_contiguous(){

}

function memory_f_contiguous(){

}

function memory_contiguous(){

}

/* memoryview.tp_getset start */
memoryview.tp_getset = [
    ["obj", memory_obj_get, NULL],
    ["nbytes", memory_nbytes_get, NULL],
    ["readonly", memory_readonly_get, NULL],
    ["itemsize", memory_itemsize_get, NULL],
    ["format", memory_format_get, NULL],
    ["ndim", memory_ndim_get, NULL],
    ["shape", memory_shape_get, NULL],
    ["strides", memory_strides_get, NULL],
    ["suboffsets", memory_suboffsets_get, NULL],
    ["c_contiguous", memory_c_contiguous, NULL],
    ["f_contiguous", memory_f_contiguous, NULL],
    ["contiguous", memory_contiguous, NULL]
]
/* memoryview.tp_getset end */
memoryview.__enter__ = function(_self){
    return _self
}

memoryview.__exit__ = function(_self){
    memoryview.release(_self)
}

memoryview.__del__ = function(self){
    if(! self.$released){
        memoryview.release(self)
    }
}

memoryview.__eq__ = function(self, other){
    if($B.get_class(other) !== memoryview){
        return false
    }
    return $B.$getattr(self.obj, '__eq__')(other.obj)
}

memoryview.__getitem__ = function(self, key){
    var res
    if($B.$isinstance(key, _b_.int)){
        var start = key * self.itemsize
        if(self.format == "I"){
            res = self.obj.source[start]
            var coef = 256
            for(var i = 1; i < 4; i++){
                res += self.obj.source[start + i] * coef
                coef *= 256
            }
            return res
        }else if("B".indexOf(self.format) > -1){
            if(key > self.obj.source.length - 1){
                $B.RAISE(_b_.KeyError, key)
            }
            return self.obj.source[key]
        }else{
            // fix me
            return self.obj.source[key]
        }
    }
    // fix me : add slice support for other formats than B
    res = $B.get_class(self.obj).__getitem__(self.obj, key)
    if($B.get_class(key) === _b_.slice){
        return memoryview.$factory(res)
    }
}

memoryview.sq_length = function(self){
    return len(self.obj) / self.itemsize
}

memoryview.__setitem__ = function(self, key, value){
    try{
        $B.$setitem(self.obj, key, value)
    }catch(err){
        $B.RAISE(_b_.TypeError, "cannot modify read-only memory")
    }
}

var struct_format = {
    'x': {'size': 1},
    'b': {'size': 1},
    'B': {'size': 1},
    'c': {'size': 1},
    's': {'size': 1},
    'p': {'size': 1},
    'h': {'size': 2},
    'H': {'size': 2},
    'i': {'size': 4},
    'I': {'size': 4},
    'l': {'size': 4},
    'L': {'size': 4},
    'q': {'size': 8},
    'Q': {'size': 8},
    'f': {'size': 4},
    'd': {'size': 8},
    'P': {'size': 8}
    }

memoryview.cast = function(self, format, shape){
    if(! struct_format.hasOwnProperty(format)){
        $B.RAISE(_b_.ValueError, `unknown format: '${format}'`)
    }
    var new_itemsize = struct_format[format].size
    if(shape === undefined){
        shape = _b_.len(self) // new_itemsize
    }else{
        if(! $B.$isinstance(shape, [_b_.list, _b_.tuple])){
            $B.RAISE(_b_.TypeError, 'shape must be a list or a tuple')
        }
        var nb = 1
        for(var item of shape){
            if(! $B.$isinstance(item, _b_.int)){
                $B.RAISE(_b_.TypeError,
                    'memoryview.cast(): elements of shape must be integers')
            }
            nb *= item
        }
        if(nb * new_itemsize != _b_.len(self)){
            $B.RAISE(_b_.TypeError,
                'memoryview: product(shape) * itemsize != buffer size')
        }
    }
    switch(format){
        case "B":
            return memoryview.$factory(self.obj)
        case "I":
            var res = memoryview.$factory(self.obj),
                objlen = len(self.obj)
            res.itemsize = 4
            res.format = "I"
            if(objlen % 4 != 0){
                $B.RAISE(_b_.TypeError, "memoryview: length is not " +
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

memoryview.release = function(self){
    if(self.$released){
        return
    }
    self.$released = true
    self.obj.$exports -= 1
}

memoryview.tobytes = function(self){
    if($B.$isinstance(self.obj, [_b_.bytes, _b_.bytearray])){
        return {
            ob_type: _b_.bytes,
            source: self.obj.source
        }
    }else if($B.imported.array && $B.$isinstance(self.obj, $B.imported.array.array)){
        return $B.imported.array.array.tobytes(self.obj)
    }
    $B.RAISE(_b_.TypeError, 'cannot run tobytes with ' + $B.class_name(self.obj))
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

_b_.min = function(){
    return $extreme(arguments, '__lt__')
}

var next = _b_.next = function(obj){
    check_no_kw('next', obj)
    var missing = {},
        $ = $B.args("next", 2, {obj: null, def: null}, ['obj', 'def'],
            arguments, {def: missing}, null, null)
    var klass = $B.get_class(obj),
        ga = $B.$getattr(klass, "__next__", $B.NULL)
    if(ga !== $B.NULL){
        try{
            return $B.$call(ga, obj)
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration]) &&
                    $.def !== missing){
                return $.def
            }
            throw err
        }
    }
    $B.RAISE(_b_.TypeError, "'" + $B.class_name(obj) +
        "' object is not an iterator")
}

var NotImplementedType = $B.NotImplementedType

NotImplementedType.$factory = function(){
    return NotImplemented
}

NotImplementedType.tp_repr = function(){
    return "NotImplemented"
}

$B.set_func_names(NotImplementedType, "builtins")

var NotImplemented = _b_.NotImplemented = {
    ob_type: NotImplementedType
}

_b_.oct = function(obj){
    check_nb_args_no_kw('oct', 1, arguments)
    return bin_hex_oct(8, obj)
}

_b_.ord = function(c){
    check_nb_args_no_kw('ord', 1, arguments)
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    if(typeof c.valueOf() == 'string'){
        if(c.length == 1){
            return c.charCodeAt(0)
        }else if(c.length == 2){
            var code = c.codePointAt(0)
            if(code >= 0x10000 && code <= 0x10FFFF){
                return code
            }
        }
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
    }
    switch($B.get_class(c)){
      case _b_.str:
        if(c.length == 1){
            return c.charCodeAt(0)
        }
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
      case _b_.bytes:
      case _b_.bytearray:
        if(c.source.length == 1){
            return c.source[0]
        }
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            'string of length ' + c.source.length + ' found')
      default:
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            $B.class_name(c) + ' was found')
    }
}

var complex_modulo = () => $B.EXC(_b_.ValueError, 'complex modulo')
var all_ints = () => $B.EXC(_b_.TypeError, 'pow() 3rd argument not ' +
    'allowed unless all arguments are integers')

_b_.pow = function() {
    var $ = $B.args('pow', 3, {x: null, y: null, mod: null},['x', 'y', 'mod'],
        arguments, {mod: None}, null, null),
        x = $.x,
        y = $.y,
        z = $.mod
    if(z === _b_.None){
        return $B.rich_op('__pow__', x, y)
    }else{
        if($B.$isinstance(x, _b_.int)){
            if($B.$isinstance(y, _b_.float)){
                throw all_ints()
            }else if($B.$isinstance(y, _b_.complex)){
                throw complex_modulo()
            }else if($B.$isinstance(y, _b_.int)){
                if($B.$isinstance(z, _b_.complex)){
                    throw complex_modulo()
                }else if(! $B.$isinstance(z, _b_.int)){
                    throw all_ints()
                }
            }
            return _b_.int.__pow__(x, y, z)
        }else if($B.$isinstance(x, _b_.float)){
            throw all_ints()
        }else if($B.$isinstance(x, _b_.complex)){
            throw complex_modulo()
        }
    }
}

var $print = _b_.print = function(){
    var $ns = $B.args('print', 0, {}, [], arguments,
              {}, 'args', 'kw')
    var kw = $ns['kw'],
        end = $B.dict_get(kw, 'end', '\n'),
        sep = $B.dict_get(kw, 'sep', ' '),
        file = $B.dict_get(kw, 'file', $B.get_stdout())
    var args = $ns['args']
    var writer = $B.$getattr(file, 'write')
    for(var i = 0, len = args.length; i < len; i++){
        var arg = _b_.str.$factory(args[i])
        $B.$call(writer, arg)
        if(i < len - 1){
            $B.$call(writer, sep)
        }
    }
    $B.$call(writer, end)
    var flush = $B.$getattr(file, 'flush', None)
    if(flush !== None){
        $B.$call(flush)
    }
    return None
}

$print.__name__ = 'print'
$print.is_func = true
$print.ob_type = $B.builtin_function_or_method

var quit = _b_.quit = function(){
    throw _b_.SystemExit
}

quit.__repr__ = quit.__str__ = function(){
    return "Use quit() or Ctrl-Z plus Return to exit"
}

var repr = _b_.repr = function(obj){
    check_nb_args_no_kw('repr', 1, arguments)
    var klass = $B.get_class(obj)
    var tp_repr = $B.search_slot(klass, 'tp_repr')
    return tp_repr(obj)
}

repr.ob_type = $B.builtin_function_or_method

var reversed = _b_.reversed

reversed.$factory = function(seq){
    // Return a reverse iterator. seq must be an object which has a
    // __reversed__() method or supports the sequence protocol (the
    // __len__() method and the __getitem__() method with integer
    // arguments starting at 0).

    check_nb_args_no_kw('reversed', 1, arguments)

    var klass = $B.get_class(seq),
        rev_method = $B.$getattr(klass, '__reversed__', null)
    if(rev_method !== null){
        return $B.$call(rev_method, seq)
    }
    try{
        var method = $B.$getattr(klass, '__getitem__')
    }catch(err){
        $B.RAISE(_b_.TypeError, "argument to reversed() must be a sequence")
    }

    var res = {
        ob_type: reversed,
        $counter : _b_.len(seq),
        getter: function(i){
            return $B.$call(method, seq, i)
        }
    }
    return res
}

reversed.tp_iter = function(self){
    return self
}

reversed.tp_iternext = function(self){
    self.$counter--
    if(self.$counter < 0){
        $B.RAISE(_b_.StopIteration, '')
    }
    return self.getter(self.$counter)
}

$B.set_func_names(reversed, "builtins")

_b_.round = function(){
    var $ = $B.args('round', 2, {number: null, ndigits: null},
        ['number', 'ndigits'], arguments, {ndigits: None}, null, null),
        arg = $.number,
        n = $.ndigits === None ? 0 : $.ndigits

    var klass

    if(! $B.$isinstance(arg,[_b_.int, _b_.float])){
        klass = $B.get_class(arg)
        try{
            return $B.$call($B.$getattr(klass, "__round__"), ...arguments)
        }catch(err){
            if($B.is_exc(err, [_b_.AttributeError])){
                $B.RAISE(_b_.TypeError, "type " + $B.class_name(arg) +
                    " doesn't define __round__ method")
            }else{
                throw err
            }
        }
    }

    if(! $B.$isinstance(n, _b_.int)){
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(n) +
            "' object cannot be interpreted as an integer")
    }

    klass = $B.get_class(arg)

    if($B.$isinstance(arg, _b_.float)){
        return _b_.float.__round__(arg, $.ndigits)
    }

    var mult = Math.pow(10, n),
        x = arg * mult,
        floor = Math.floor(x),
        diff = Math.abs(x - floor),
        res
    if(diff == 0.5){
        if(floor % 2){
            floor += 1
        }
        res = _b_.int.__truediv__(floor, mult)
    }else{
        res = _b_.int.__truediv__(Math.round(x), mult)
    }
    if(res.value === Infinity || res.value === -Infinity){
        $B.RAISE(_b_.OverflowError,
            "rounded value too large to represent")
    }
    if($.ndigits === None){
        // Always return an integer
        return Math.floor(res.value)
    }else{
        // Return the same type as argument
        return $B.$call(klass, res)
    }
}

_b_.setattr = function(){

    var $ = $B.args('setattr', 3, {obj: null, attr: null, value: null},
        ['obj', 'attr', 'value'], arguments, {}, null, null),
        obj = $.obj, attr = $.attr, value = $.value
    if(!(typeof attr == 'string')){
        $B.RAISE(_b_.TypeError, "setattr(): attribute name must be string")
    }
    return $B.$setattr(obj, attr, value)
}

$B.$setattr1 = function(obj, attr, value, inum){
    try{
        $B.$setattr(obj, attr, value)
    }catch(err){
        $B.set_inum(inum)
        throw err
    }
}

$B.$setattr = function(obj, attr, value){
    if(obj === undefined){
        console.log('obj undef', attr, value)
    }
    // Used in the code generated by py2js. Avoids having to parse the
    // since we know we will get the 3 values
    var $test = false // attr === "text" // && value == "my doc."
    if($test){
        console.log("set attr", attr, "of", obj, "to", value)
    }
    /*
    if(obj.$factory || obj.$is_class){
        var metaclass = $B.get_class(obj)
        if(metaclass === _b_.type){
            return _b_.type.tp_setattro(obj, attr, value)
        }
        return $B.$call($B.$getattr(metaclass, '__setattr__'), obj, attr, value)
    }
    */

    var klass = $B.get_class(obj)
    var setattr = $B.search_slot(klass, 'tp_setattro', $B.NULL)
    if(setattr == $B.NULL){
        $B.RAISE(_b_.AttributeError, 'no setattr')
    }

    setattr(obj, attr, value)
    return _b_.None
    /*

    var res = obj[attr],
        klass = $B.get_class(obj)

    if($test){
        console.log('set attr', attr, 'of obj', obj, 'class', klass,
            "obj[attr]", obj[attr])
    }

    if(res === undefined && klass){
        res = $B.search_in_mro(klass, attr)
    }

    if($test){
        console.log('set attr', attr, 'klass', klass, 'found in class', res)
    }

    if(res !== undefined && res !== null){
        // descriptor protocol : if obj has attribute attr and this attribute
        // has a method __set__(), use it
        var setter = $B.search_slot($B.get_class(res), 'tp_descr_set', null)
        if(setter !== null){
            if($test){
                console.log('setter', setter)
            }
            if(setter === $B.NULL){
                $B.RAISE_ATTRIBUTE_ERROR('readonly attribute', obj, attr)
            }
            setter(res, obj, value)
            return _b_.None
        }
        if(res.__set__ !== undefined){
            res.__set__(res, obj, value)
            return None
        }
        var rcls = $B.get_class(res),
            __set1__
        if(rcls !== undefined){
            __set1__ = $B.search_in_mro(rcls, '__set__')
        }
        if(__set1__ !== undefined){
            if($test){
                console.log('descriptor, __set1__', __set1__)
            }
            var __set__ = $B.$getattr(res, '__set__', null)
            if($test){
                console.log('__set__', __set__, $B.get_class(__set__))
            }
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
                $B.RAISE_ATTRIBUTE_ERROR('readonly attribute', obj, attr)
            }
        }
    }

    // Search the __setattr__ method
    // klass.$tp_setattr = klass.$tp_setattr ?? $B.search_in_mro(klass, '__setattr__')
    var _setattr = klass.$tp_setattr
    if(_setattr === _b_.object.__setattr__){
        _setattr = false
    }

    // Use __slots__ if defined
    var special_attrs = ["__module__"]
    if(klass && klass.__slots__ && special_attrs.indexOf(attr) == -1 &&
            ! _setattr){
        var _slots = true
        for(var kl of klass.__mro__){
            if(kl === _b_.object || kl === _b_.type){
                break
            }
            if(! kl.__slots__){
                // If class inherits from a class without __slots__, allow
                // setattr for any attribute
                _slots = false
                break
            }
        }
        if(_slots){
            function mangled_slots(klass){
                if(klass.__slots__){
                    if(Array.isArray(klass.__slots__)){
                        return klass.__slots__.map(function(item){
                            if(item.startsWith("__") && ! item.endsWith("_")){
                                return "_" + klass.__name__ + item
                            }else{
                                return item
                            }
                        })
                    }else{
                        return klass.__slots__
                    }
                }
                return []
            }
            var has_slot = false
            if($B.$is_member(attr, mangled_slots(klass))){
                has_slot = true
            }else{
                for(var cls of klass.__mro__){
                    if(mangled_slots(cls).indexOf(attr) > - 1){
                        has_slot = true
                        break
                    }
                }
            }
            if(! has_slot){
                throw $B.attr_error(attr, klass)
            }
        }
    }
    if($test){console.log("attr", attr, "use _setattr", _setattr)}
    if(!_setattr){
        if(obj[attr] !== undefined){
            obj[attr] = value
        }else if(obj.dict === undefined){
            console.log('obj', obj)
            $B.RAISE_ATTRIBUTE_ERROR(`'${$B.class_name(obj)}' ` +
                `object has no attribute '${attr}' and no __dict__ for ` +
                `setting new attributes`, obj, attr)
        }else{
            _b_.dict.$setitem(obj.dict, attr, value)
            // remove from method cache, cf. issue #2555
            if(obj.$method_cache && obj.$method_cache[attr]){
                delete obj.$method_cache[attr]
            }
        }
        if($test){
            console.log("no setattr, obj", obj)
        }
    }else{
        if($test){
            console.log('apply _setattr', obj, attr)
        }
        if(typeof _setattr !== 'function'){
            console.log('not a function', _setattr)
            console.log('attr', attr, 'of', obj)
        }
        _setattr(obj, attr, value)
    }

    return None
    */
}

_b_.sorted = function(){
    var $ = $B.args('sorted', 1, {iterable: null}, ['iterable'],
        arguments, {}, null, 'kw')
    var _list = _b_.list.$factory($.iterable)
    _b_.list.tp_funcs.sort(_list)
    return _list
}


// str() defined in py_string.js

_b_.sum = function(){
    var $ = $B.args('sum', 2, {iterable: null, start: null},
        ['iterable', 'start'], arguments, {start: 0}, null, null),
        iterable = $.iterable,
        start = $.start

    if($B.$isinstance(start, [_b_.str, _b_.bytes])){
        $B.RAISE(_b_.TypeError, "sum() can't sum bytes" +
            " [use b''.join(seq) instead]")
    }

    var res = start
    iterable = iter(iterable)
    while(true){
        try{
            var _item = next(iterable)
            res = $B.rich_op('__add__', res, _item)
        }catch(err){
           if($B.is_exc(err, [_b_.StopIteration])){
               break
           }else{
               throw err
           }
        }
    }
    return res
}

var $$super = _b_.super


/* super start */
_b_.super.tp_repr = function(self){
    $B.builtins_repr_check($$super, arguments) // in brython_builtins.js
    var res = "<super: <class '" + self.__thisclass__.__name__ + "'>"
    if(self.__self_class__ !== undefined){
        res += ', <' + $B.get_name($B.get_class(self.__self_class__)) + ' object>'
    }else{
        res += ', NULL'
    }
    return res + '>'
}

_b_.super.tp_getattro = function(self, attr){
    if(self.type.$is_js_class){
        if(attr == "__init__"){
            // use call on parent
            return function(){
                mro[0].$js_func.call(self.__self_class__, ...arguments)
            }
        }
    }
    // Determine method resolution order from object_or_type
    var object_or_type = self.obj,
        mro = self.$arg2 == 'type' ? $B.get_mro(object_or_type) :
                                     $B.get_mro($B.get_class(object_or_type))
    // Search of method attr starts in mro after self.__thisclass__
    var search_start = mro.indexOf(self.type) + 1,
        search_classes = mro.slice(search_start)

    var $test = false // attr == "__new__" // && self.__self_class__.$infos.__name__ == 'EnumCheck'
    if($test){
        console.log('super.__ga__, self', self, 'search classes', search_classes)
        console.log('frame obj', $B.frame_obj)
    }

    var f
    for(var klass of search_classes){
        if($test){
            console.log('search', attr, 'in dict of', klass)
        }
        var in_dict = $B.search_in_dict(klass, attr, $B.NULL)
        if(in_dict !== $B.NULL){
            if($test){
                console.log('found in dict of', klass)
            }
            f = in_dict
            break
        }
    }

    if(f === undefined){
        if($$super[attr] !== undefined){
            return (function(x){
                return function(){
                    var args = [x]
                    for(var i = 0, len = arguments.length; i < len; i++){
                        args.push(arguments[i])
                    }
                    return $$super[attr].apply(null, args)
                }
            })(self)
        }
        if($test){
            console.log("no attr", attr, self, "mro", mro)
        }
        return $B.NULL
    }

    if($test){
        console.log("super", attr, self, "mro", mro,
            "found in mro[0]", mro[0], '\nf',
            f, 'type(f)', $B.get_class(f))
    }
    var f_cls = $B.get_class(f)
    var getter = $B.search_slot(f_cls, 'tp_descr_get', $B.NULL)
    var res
    if(getter !== $B.NULL){
        res = getter(f, self.obj, self.obj_type)
    }else{
        res = f
    }
    return res
    /*
    if(f.$type == "staticmethod" || attr == "__new__"){
        return f
    }else if(cls === _b_.classmethod){
        return f.func.bind(null, object_or_type)
    }else if(f.$is_property){
        return f.fget(object_or_type)
    }else if(typeof f != "function"){
        return f
    }else{
        if(cls === $B.method){
            // If the function is a bound method, use the underlying function
            f = f.$infos.__func__
        }
        var method = function(){
            var res = $B.$call(f, ...arguments)
            if($test){
                console.log("calling super", self.__self_class__, attr, f, "res", res)
            }
            return res
        }
        method.ob_type = $B.method
        var module
        if(f.$infos !== undefined){
            module = f.$infos.__module__
        }else if(cls === _b_.property){
            module = f.fget.$infos.__module
        }else if(f.$is_class){
            module = f.__module__
        }
        method.$infos = {
            __self__: self.__self_class__,
            __func__: f,
            __name__: attr,
            __module__: module,
            __qualname__: klass.__name__ + "." + attr
        }
        return method
    }
    */
}

_b_.super.tp_descr_get = function(self, instance){
    // https://www.artima.com/weblogs/viewpost.jsp?thread=236278
    return $$super.$factory(self.__thisclass__, instance)
}

_b_.super.tp_init = function(self, _type, object_or_type){
    if(self === undefined){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'super' " +
            "object needs an argument")
    }
    if($B.get_class(self) !== $$super){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' requires a" +
            " 'super' object but received a '" + $B.class_name(self) + "'")
    }
    var no_object_or_type = object_or_type === undefined
    if(_type === undefined && object_or_type === undefined){
        var frame = $B.frame_obj.frame,
            pyframe = $B.imported["_sys"]._getframe(),
            code = $B.$getattr(pyframe, 'f_code'),
            co_varnames = code.co_varnames
        if(co_varnames.length > 0){
            _type = $B.get_class(frame[1])
            if(_type === undefined){
                $B.RAISE(_b_.RuntimeError, "super(): no arguments")
            }
            object_or_type = frame[1][code.co_varnames[0]]
        }else{
            $B.RAISE(_b_.RuntimeError, "super(): no arguments")
        }
    }
    if((! no_object_or_type) && Array.isArray(object_or_type)){
        object_or_type = object_or_type[0]
    }
    var $arg2

    if(object_or_type !== undefined){
        if($B.is_type(object_or_type)){
            $arg2 = 'type'
        }else if($B.$isinstance(object_or_type, _type)){
            $arg2 = 'object'
        }else{
            $B.RAISE(_b_.TypeError,
                'super(type, obj): obj must be an instance ' +
                'or subtype of type')
        }
    }
    self.type = _type
    self.obj = object_or_type
    self.obj_type = $B.get_class(self.obj)
    self.$args2 = $arg2
}

_b_.super.tp_new = function(self){
    return {
        ob_type: _b_.super,
        dict: $B.empty_dict()
    }
}

var super_funcs = _b_.super.tp_funcs = {}

super_funcs.__self__ = function(self){
    return self.obj
}

super_funcs.__self_class__ = function(self){
    return self.obj_type
}

super_funcs.__thisclass__ = function(self){
    return self.type
}

_b_.super.tp_members = ["__thisclass__", "__self__", "__self_class__"]

/* super end */

$B.set_func_names($$super, "builtins")

_b_.vars = function(){
    var def = {},
        $ = $B.args('vars', 1, {obj: null}, ['obj'], arguments, {obj: def},
            null, null),
        obj = $.obj
    if(obj === def){
        return _b_.locals()
    }else{
        if(obj.dict){
            return obj.dict
        }else{
            $B.RAISE(_b_.TypeError, "vars() argument must have __dict__ attribute")
        }
    }
}

var zip = _b_.zip

zip.$factory = function(){
    var res = {
        ob_type: zip,
        items: []
    }
    if(arguments.length == 0){
        return res
    }
    var $ns = $B.args('zip', 0, {}, [], arguments, {}, 'args', 'kw')
    var _args = $ns['args'],
        strict = $B.$bool(_b_.dict.get($ns.kw, 'strict', false))
    var iters = []
    for(var arg of _args){
        iters.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: zip,
        iters,
        strict
    }
}

zip.tp_iter = function(self){
    return self
}

zip.tp_iternext = function(self){
    var res = [],
        len = self.iters.length
    for(var i = 0; i < len; i++){
        var v = self.iters[i].next()
        if(v.done){
            if(self.strict){
                if(i > 0){
                    $B.RAISE(_b_.ValueError,
                        `zip() argument ${i + 1} is longer than argument ${i}`)
                }else{
                    for(var j = 1; j < len; j++){
                        var v1 = self.iters[j].next()
                        if(! v1.done){
                            $B.RAISE(_b_.ValueError,
                                `zip() argument ${j + 1} is longer than argument ${i + 1}`)
                        }
                    }
                }
            }
            $B.RAISE(_b_.StopIteration, '')
        }
        res.push(v.value)
    }
    return $B.fast_tuple(res)
}

$B.set_func_names(zip, "builtins")

// built-in constants : True, False, None

function no_set_attr(klass, attr){
    if(klass[attr] !== undefined){
        $B.RAISE_ATTRIBUTE_ERROR("'" + klass.__name__ +
            "' object attribute '" + attr + "' is read-only", klass, attr)
    }else{
        throw $B.attr_error(attr, klass)
    }
}

// True and False are the same as Javascript true and false

var True = _b_.True = true
var False = _b_.False = false

var ellipsis = $B.ellipsis

ellipsis.$factory = function(){
    return Ellipsis
}

ellipsis.tp_repr = function(){
    return 'Ellipsis'
}

var Ellipsis = _b_.Ellipsis = {
    ob_type: ellipsis
}

for(var comp in $B.$comps){ // Ellipsis is not orderable with any type
    switch($B.$comps[comp]) {
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        ellipsis['__' + $B.$comps[comp] + '__'] =
            function(){
                return _b_.NotImplemented
            }
    }
}

$B.set_func_names(ellipsis)

_b_.__BRYTHON__ = __BRYTHON__


})(__BRYTHON__);


