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

var NoneType = $B.NoneType = {
    $factory: function(){
        return None
    },
    __bool__: function(){return False},
    __class__: _b_.type,
    __hash__: function(){return 0},
    __module__: 'builtins',
    __mro__: [_b_.object],
    __name__: 'NoneType',
    __qualname__: 'NoneType',
    __repr__: function(){return 'None'},
    __str__: function(){return 'None'},
    $is_class: true
}

NoneType.__setattr__ = function(self, attr){
    return no_set_attr(NoneType, attr)
}

var None = _b_.None = {
    __class__: NoneType
}

None.__doc__ = None
NoneType.__doc__ = None

for(var $op in $B.$comps){ // None is not orderable with any type
    var key = $B.$comps[$op]
    switch(key){
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        NoneType['__' + key + '__'] = (function(){
            return function(){return _b_.NotImplemented}
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

_b_.__build_class__ = function(){
    throw _b_.NotImplementedError.$factory('__build_class__')
}

_b_.abs = function(obj){
    check_nb_args_no_kw('abs', 1, arguments)

    var klass = obj.__class__ || $B.get_class(obj)
    try{
        var method = $B.$getattr(klass, "__abs__")
    }catch(err){
        if(err.__class__ === _b_.AttributeError){
            throw _b_.TypeError.$factory("Bad operand type for abs(): '" +
                $B.class_name(obj) + "'")
        }
        throw err
    }
    return $B.$call(method)(obj)
}

_b_.aiter = function(async_iterable){
    return $B.$call($B.$getattr(async_iterable, '__aiter__'))()
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
    var awaitable = $B.$call($B.$getattr($.async_iterator, '__anext__'))()
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

  if(obj.__class__ === $B.long_int){
      var res = prefix + obj.value.toString(base)
      return res
  }

  var value = $B.PyNumber_Index(obj)

  if(value === undefined){
     // need to raise an error
     throw _b_.TypeError.$factory('Error, argument must be an integer or' +
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
            var klass = obj.__class__ || $B.get_class(obj),
                method = $B.$getattr(klass, '__index__')
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
                    "' object cannot be interpreted as an integer")
            }
            throw err
        }
        var res = $B.$call(method)(obj)
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
        throw _b_.RuntimeError.$factory('lost sys.breakpointhook')
    }
    return $B.$call(hook).apply(null, arguments)
}

_b_.callable = function(obj) {
    check_nb_args_no_kw('callable', 1, arguments)

    return _b_.hasattr(obj, '__call__')
}

_b_.chr = function(i){
    check_nb_args_no_kw('chr', 1, arguments)

    i = $B.PyNumber_Index(i)

    if(i < 0 || i > 1114111){
        throw _b_.ValueError.$factory('Outside valid range')
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

var code = _b_.code = $B.make_class("code")

code.__repr__ = code.__str__ = function(_self){
    return `<code object ${_self.co_name}, file '${_self.co_filename}', ` +
        `line ${_self.co_firstlineno || 1}>`
}

code.__getattribute__ = function(self, attr){
    if(attr == 'co_positions'){
        // fake value
        var positions = [[0, 0, 0, 0]]
        if(self.co_positions){
            positions = self.co_positions
        }
        var f = () => $B.$list(positions)
        f.__class__ = $B.function
        return f
    }
    return self[attr]
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
    $.__class__ = code
    $.co_flags = $.flags
    $.co_name = "<module>"
    var filename = $.co_filename = $.filename
    var interactive = $.mode == "single" && ($.flags & 0x200)
    $B.file_cache[filename] = $.source
    $B.url2name[filename] = module_name

    if ($.flags & $B.PyCF_TYPE_COMMENTS) {
        // throw _b_.NotImplementedError.$factory('Brython does not currently support parsing of type comments')
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
                exc = _b_.SyntaxError.$factory()
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

    if($.source.__class__ && $.source.__class__.__module__ == 'ast'){
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
                err.__class__ = _b_._IncompleteInputError
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
        throw _b_.TypeError.$factory("attribute name must be string, not '" +
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
        if(obj.__class__ === $B.generator){
            // Force generator return (useful if yield was in a context manager)
            obj.js_gen.return()
        }
    }
    var found = false
    if(locals_id == 'local'){
        var frame = $B.frame_obj.frame
        if(frame[1].hasOwnProperty(name)){
            found = true
            del(frame[1][name])
            delete frame[1][name]
        }
    }else if(locals_id == 'global'){
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
            throw _b_.UnboundLocalError.$factory(
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

    var klass = obj.__class__ || $B.get_class(obj)

    if(obj.$is_class){
        // Use metaclass __dir__
        var dir_func = $B.$getattr(obj.__class__, "__dir__")
        return $B.$call(dir_func)(obj)
    }
    try{
        let res = $B.$call($B.$getattr(klass, '__dir__'))(obj)
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

var enumerate = _b_.enumerate = $B.make_class("enumerate",
    function(){
        var $ns = $B.args("enumerate", 2, {iterable: null, start: null},
            ['iterable', 'start'], arguments, {start: 0}, null, null),
            _iter = iter($ns["iterable"]),
            start = $ns["start"]
        return {
            __class__: enumerate,
            __name__: 'enumerate iterator',
            counter: start - 1,
            iter: _iter,
            start: start
        }
    }
)

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

    if(src.__class__ === code){
        filename = src.filename
        // result of compile()
    }else if((! src.valueOf) || typeof src.valueOf() !== 'string'){
        throw _b_.TypeError.$factory(`${mode}() arg 1 must be a string,` +
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
    if(_globals !== _b_.None && _globals.__class__ == _b_.dict &&
            _b_.dict.$contains_string(_globals, '__name__')){
        __name__ = _b_.dict.$getitem_string(_globals, '__name__')
    }
    $B.url2name[filename] = __name__

    var frame = $B.frame_obj.frame

    $B.exec_scope = $B.exec_scope || {}

    if(typeof src == 'string' && src.endsWith('\\\n')){
        var exc = _b_.SyntaxError.$factory('unexpected EOF while parsing')
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
        if(_globals.__class__ !== _b_.dict){
            throw _b_.TypeError.$factory(`${mode}() globals must be ` +
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
                        getitem = $B.$call($B.$getattr(klass, '__getitem__')),
                        setitem = $B.$call($B.$getattr(klass, '__setitem__'))
                    exec_locals = new Proxy(_locals, {
                        get(target, prop){
                            if(prop == '$target'){
                                return target
                            }else if(prop == $B.LOCALS_PROXY){
                                return true
                            }
                            try{
                                return getitem(target, prop)
                            }catch(err){
                                return undefined
                            }
                        },
                        set(target, prop, value){
                            return setitem(target, prop, value)
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

    if(src.__class__ === code){
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
        if(src.__class__ === _b_.code){
            js += `\nreturn locals.${expr_name}`
        }else{
            js = `var __file__ = '${filename}'\n` +
                 `var locals = ${local_name};\n` +
                 'return ' + js
        }
    }else if(src.single_expression){
        if(src.__class__ === _b_.code){
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
                '\n    err', err.__class__, err.args, err.$frame_obj)
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

var filter = _b_.filter = $B.make_class("filter",
    function(func, iterable){
        check_nb_args_no_kw('filter', 2, arguments)

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

_b_.format = function() {
    var $ = $B.args("format", 2, {value: null, format_spec: null},
            ["value", "format_spec"], arguments, {format_spec: ''}, null, null),
            value = $.value
    var klass = value.__class__ || $B.get_class(value)
    try{
        var method = $B.$getattr(klass, '__format__')
    }catch(err){
        if(err.__class__ === _b_.AttributeError){
            throw _b_.NotImplementedError("__format__ is not implemented " +
                "for object '" + _b_.str.$factory(value) + "'")
        }
        throw err
    }
    return $B.$call(method)(value, $.format_spec)
}

function attr_error(attr, obj){
    var cname = $B.get_class(obj)
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
            throw $B.attr_error(attr, obj)
    }
}

_b_.getattr = function(){
    var missing = {}
    var $ = $B.args("getattr", 3, {obj: null, attr: null, _default: null},
        ["obj", "attr", "_default"], arguments, {_default: missing},
        null, null)
    if(! $B.$isinstance($.attr, _b_.str)){
        throw _b_.TypeError.$factory("attribute name must be string, " +
            `not '${$B.class_name($.attr)}'`)
    }

    return $B.$getattr($.obj, _b_.str.$to_string($.attr),
        $._default === missing ? undefined : $._default)
}

$B.search_in_mro = function(klass, attr){
    var test = false // attr == '__setattr__'
    if(klass.hasOwnProperty(attr)){
        return klass[attr]
    }else if(klass.__dict__){
        var v = _b_.dict.$get_string(klass.__dict__, attr, false)
        if(v !== false){
            if(test){
                console.log('found in klass dict', klass.__dict__, v)
            }
            return v
        }
    }
    var mro = klass.__mro__
    for(var i = 0, len = mro.length; i < len; i++){
        if(mro[i].hasOwnProperty(attr)){
            return mro[i][attr]
        }else if(mro[i].__dict__){
            var v = _b_.dict.$get_string(mro[i].__dict__, attr, false)
            if(v !== false){
                if(test){
                    console.log('found in dict of mro', i, v)
                }
                return v
            }
        }
    }
}

$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments
    var res
    if(obj === undefined || obj === null){
        throw _b_.AttributeError.$factory("Javascript object '" + obj +
            "' has no attribute")
    }
    if(obj.$method_cache &&
            obj.$method_cache[attr] &&
            obj.__class__ &&
            obj.__class__[attr] == obj.$method_cache[attr][1]){
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

    var is_class = obj.$is_class || obj.$factory

    var klass = obj.__class__

    var $test = false // attr == "__annotations__" // && obj.__name__ === "MagicMock"

    if($test){
        console.log("attr", attr, "of", obj, "class", klass ?? $B.get_class(obj),
        "isclass", is_class)
    }

    if(klass === undefined){
        klass = $B.get_class(obj)
        if(klass === undefined){
            // for native JS objects used in Python code
            if($test){console.log("no class", attr, obj.hasOwnProperty(attr), obj[attr])}
            res = obj[attr]
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
                    $B.set_function_infos(f,
                        {
                            name: attr,
                            qualname: attr
                        }
                    )
                    return f
                }else{
                    return $B.jsobj2pyobj(res)
                }
            }
            if(_default !== undefined){
                return _default
            }
            throw $B.attr_error(rawname, obj)
        }
    }

    switch(attr) {
      case '__call__':
          if(typeof obj == 'function'){
              res = function(){return obj.apply(null, arguments)}
              res.__class__ = method_wrapper
              res.$infos = {__name__: "__call__"}
              return res
          }
          break
      case '__class__':
          // attribute __class__ is set for all Python objects
          if(klass.__dict__){
              var klass_from_dict = _b_.None
              if($B.$isinstance(klass.__dict__, _b_.dict)){
                  klass_from_dict = $B.$call($B.$getattr(klass.__dict__, 'get'))('__class__')
              }
              if(klass_from_dict !== _b_.None){
                  if(klass_from_dict.$is_property){
                      return klass_from_dict.fget(obj)
                  }
                  return klass_from_dict
              }
          }
          return klass
      case '__dict__':
          if(is_class){
              var dict = {},
                  key
              if(obj.__dict__){
                  for(key of _b_.dict.$keys_string(obj.__dict__)){
                      dict[key] = _b_.dict.$getitem_string(obj.__dict__, key)
                      if(key == '__new__' && dict[key].__class__ !== _b_.staticmethod){
                          dict[key] = _b_.staticmethod.$factory(dict[key])
                      }
                  }
              }else{
                  for(key in obj){
                      if(! key.startsWith("$")){
                          dict[key] = obj[key]
                          if(key == '__new__' && dict[key].__class__ !== _b_.staticmethod){
                              dict[key] = _b_.staticmethod.$factory(dict[key])
                          }
                      }
                  }
              }
              dict.__dict__ = $B.getset_descriptor.$factory(obj, '__dict__',
                  function(){
                      // here for compliance, what should it do ?
                  }
              )
              return {
                  __class__: $B.mappingproxy, // in py_dict.js
                  $jsobj: dict,
                  $version: 0
              }
          }else if(! klass.$native){
              if(obj[attr] !== undefined){
                  return obj[attr]
              }else if(obj.__dict__){
                  return obj.__dict__
              }else if(obj.$function_infos || obj.$infos){
                  if(! obj.$infos){
                      $B.make_function_infos(obj, ...obj.$function_infos)
                  }
                  if(obj.hasOwnProperty("__dict__")){
                      return obj.__dict__
                  }else if(obj.$infos.hasOwnProperty("__func__") &&
                          obj.$infos.__func__){
                      obj.$infos.__func__.__dict__ = obj.$infos.__func__.__dict__ ??
                          $B.empty_dict()
                  }
              }else if(obj.__class__ && obj.__class__.__dict__){
                  // console.log('class has __dict__', obj.__class__.__dict__)
              }else if(! obj.__class__){
                  // console.log('no class', obj)
              }
              return $B.obj_dict(obj,
                  function(attr){
                      return attr.startsWith('$') || ['__class__'].indexOf(attr) > -1
                  }
              )
          }
          break
      case '__mro__':
          // The attribute __mro__ of class objects doesn't include the
          // class itself
          if(obj.__mro__){
              return _b_.tuple.$factory([obj].concat(obj.__mro__))
          }else if(obj.__dict__ &&
                  _b_.dict.$contains_string(obj.__dict__, '__mro__')){
              return _b_.dict.$getitem_string(obj.__dict__, '__mro__')
          }
          // stop search here, looking in the objects's class would return
          // the class's __mro__
          throw $B.attr_error(attr, obj)
      case '__subclasses__':
          if(klass.$factory || klass.$is_class){
              var subclasses = obj.$subclasses || []
              return function(){
                  return $B.$list(subclasses)
              }
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

    if((! is_class) && klass.$native){

        if(obj.$method_cache && obj.$method_cache[attr]){
            return obj.$method_cache[attr]
        }

        if($test){
            console.log("native class", klass, klass[attr])
        }
        if(klass[attr] === undefined){
            var parent_attr
            for(var parent_class of klass.__mro__){
                if(parent_class[attr] !== undefined){
                    parent_attr = parent_class[attr]
                    break
                }
            }
            if($test){
                console.log("parent class attr", parent_attr)
            }
            if(parent_attr !== undefined){
                klass[attr] = parent_attr
            }else{
                if($test){
                    console.log("obj[attr]", obj[attr])
                }
                var attrs = obj.__dict__
                if(attrs && _b_.dict.$contains_string(attrs, attr)){
                    return _b_.dict.$getitem_string(attrs, attr)
                }
                if(_default === undefined){
                    throw $B.attr_error(attr, obj)
                }
                return _default
            }
        }else if(['__name__', '__qualname__'].includes(attr)){
            attr_error(attr, obj)
        }
        if(klass.$descriptors && klass.$descriptors[attr] !== undefined){
            return klass[attr](obj)
        }
        if(typeof klass[attr] == 'function'){
            var func = klass[attr]
            // new is a static method
            if(attr == '__new__'){
                func.$type = "staticmethod"
            }

            if(func.$type == "staticmethod"){
                return func
            }

            var self = klass[attr].__class__ == $B.method ? klass : obj,
                method = klass[attr].bind(null, self)
            method.__class__ = $B.method
            method.$infos = {
                __func__: func,
                __name__: attr,
                __self__: self,
                __qualname__: klass.__qualname__ + "." + attr
            }
            if(typeof obj == "object"){
                // Optimization : set attribute __class__ and store method
                // as attribute of obj.$method_cache
                obj.__class__ = klass
                obj.$method_cache = obj.$method_cache || {}
                if(obj.$method_cache){
                    // might not be set, eg for Javascript list proxy
                    // in js_objects.js
                    obj.$method_cache[attr] = method
                }
            }
            return method
        }else if(klass[attr].__class__ === _b_.classmethod){
            return _b_.classmethod.__get__(klass[attr], obj, klass)
        }else if(klass[attr] !== undefined){
            return klass[attr]
        }
        attr_error(rawname, klass)
    }

    var attr_func

    if(is_class){
        if($test){
            console.log('obj is class', obj)
            console.log('is a type ?', _b_.isinstance(klass, _b_.type))
            console.log('is type', klass === _b_.type)
        }
        if(klass === _b_.type){
            attr_func = _b_.type.__getattribute__
        }else{
            attr_func = $B.$call($B.$getattr(klass, '__getattribute__'))
        }
        if($test){
            console.log('attr func', attr_func)
        }
    }else{
        attr_func = klass.__getattribute__
        if(attr_func === undefined){
            for(var cls of klass.__mro__){
                attr_func = cls['__getattribute__']
                if(attr_func !== undefined){
                    break
                }
            }
        }
        if($test){
            console.log('attr func', attr_func)
        }
    }
    if(typeof attr_func !== 'function'){
        console.log(attr + ' is not a function ' + attr_func, klass)
    }

    var odga = _b_.object.__getattribute__
    if($test){
        console.log("attr_func is odga ?", attr_func,
            attr_func === odga, '\n',
            '\nobj[attr]', obj[attr])
    }
    if(attr_func === odga){
        res = obj[attr]
        if(Array.isArray(obj) && Array.prototype[attr] !== undefined){
            // Special case for list subclasses. Cf issue 1081.
            res = undefined
        }else if(res === null){
            return null
        }else if(res !== undefined){
            if($test){console.log(obj, attr, obj[attr],
                res.__set__ || res.$is_class)}
            if(res.$is_property){
                return _b_.property.__get__(res)
            }
            // Cf. issue 1081
            if(res.__set__ === undefined || res.$is_class){
                if($test){console.log("return", res, res+'',
                    res.__set__, res.$is_class)}
                return res
            }
        }
    }
    var getattr
    try{
        res = attr_func(obj, attr)
        if($test){console.log("result of attr_func", res)}
    }catch(err){
        if($test){
            console.log('attr_func raised error', err.__class__, err.args, err.name)
            console.log(err)
        }
        if(klass === $B.module){
            // try __getattr__ at module level (PEP 562)
            getattr = obj.__getattr__
            if($test){
                console.log('use module getattr', getattr)
                console.log(getattr + '')
            }
            if(getattr){
                try{
                    return getattr(attr)
                }catch(err){
                    if($test){
                        console.log('encore erreur', err)
                    }
                    if(_default !== undefined){
                        return _default
                    }
                    throw err
                }
            }
        }
        getattr = $B.search_in_mro(klass, '__getattr__')
        if($test){
            console.log('try getattr', getattr)
        }
        if(getattr){
            if($test){
                console.log('try with getattr', getattr)
            }
            try{
                return getattr(obj, attr)
            }catch(err){
                if($B.is_exc(err, [_b_.AttributeError])){
                    if(_default !== undefined){
                        return _default
                    }
                }
                throw err
            }
        }
        if(_default !== undefined){
            return _default
        }

        throw err
    }

    if(res !== undefined){
        return res
    }
    if(_default !== undefined){
        return _default
    }

    attr_error(rawname, is_class ? obj : klass)
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

    if(obj.$is_class ||
            obj.__class__ === _b_.type ||
            obj.__class__ === $B.function){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    if(typeof obj == "string"){
        return _b_.str.__hash__(obj)
    }else if(typeof obj == "number"){
        return obj
    }else if(typeof obj == "boolean"){
        return obj ? 1 : 0
    }else if(obj.__class__ === _b_.float){
        return _b_.float.$hash_func(obj)
    }
    // Implicit invocation of special methods uses object class, even if
    // obj has an attribute __hash__
    var klass = obj.__class__ || $B.get_class(obj)
    if(klass === undefined){
        throw _b_.TypeError.$factory("unhashable type: '" +
                _b_.str.$factory($B.jsobj2pyobj(obj)) + "'")
    }

    var hash_method = _b_.type.__getattribute__(klass, '__hash__', _b_.None)

    if(hash_method === _b_.None){
        throw _b_.TypeError.$factory("unhashable type: '" +
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
            throw _b_.TypeError.$factory(
                '__hash__ method should return an integer')
        }
        return v
    }
    var res
    if(hash_method === _b_.object.__hash__){
        if(_b_.type.__getattribute__(klass, '__eq__') !== _b_.object.__eq__){
            throw _b_.TypeError.$factory("unhashable type: '" +
                $B.class_name(obj) + "'", 'hash')
        }else{
            return obj.__hashvalue__ = check_int(_b_.object.__hash__(obj))
        }
    }else{
        return check_int($B.$call(hash_method)(obj))
    }
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
                    _b_[obj].__bases__.indexOf(_b_.Exception) > -1){
                url = lib_url + `/exceptions.html#${obj}`
            }
            if(url){
                window.open(url)
                return
            }
        }
        // use pydoc
        $B.$import('pydoc')
        return $B.$call($B.$getattr($B.imported.pydoc, 'help'))(obj)
    }
    if(obj.__class__ === $B.module){
        return help(obj.__name__)
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
    if(cls.__class__ === $B.UnionType){
        for(kls of cls.items){
            if($B.$isinstance(obj, kls)){
                return true
            }
        }
        return false
    }

    if(cls.__class__ === $B.GenericAlias){
        // PEP 585
        throw _b_.TypeError.$factory(
            'isinstance() arg 2 cannot be a parameterized generic')
    }
    if((!cls.__class__) && (! cls.$is_class)){
        if(! $B.$getattr(cls, '__instancecheck__', false)){
            throw _b_.TypeError.$factory("isinstance() arg 2 must be a type " +
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
    var klass = obj.__class__

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
        klass = $B.get_class(obj)
    }
    if(klass === undefined){
        return false
    }

    if(klass ===  cls){
        return true
    }
    var mro = klass.__mro__
    for(var i = 0; i < mro.length; i++){
       if(mro[i] === cls){
           return true
       }
    }

    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = $B.$getattr(cls.__class__ || $B.get_class(cls),
        '__instancecheck__', _b_.None)
    if(cls.__name__ == 'DemoComponent2169'){
        console.log('use instance check', obj, cls, instancecheck)
        console.log('class of obj', $B.get_class(obj))
        console.log('same as cls ?', $B.get_class(obj) === cls)
        console.log('result', instancecheck(cls, obj))
    }
    if(instancecheck !== _b_.None){
        return instancecheck(cls, obj)
    }
    return false
}

var issubclass = _b_.issubclass = function(klass, classinfo){
    check_nb_args_no_kw('issubclass', 2, arguments)
    var mro
    if(!klass.__class__ ||
            !(klass.$factory !== undefined || klass.$is_class !== undefined)){

        var meta = $B.$getattr(klass, '__class__', null) // found in unittest.mock
        if(meta === null){
            console.log('no class for', klass)
            throw _b_.TypeError.$factory("issubclass() arg 1 must be a class")
        }else{
            mro = [_b_.object]
        }
    }else{
        mro = klass.__mro__
    }
    if($B.$isinstance(classinfo, _b_.tuple)){
        for(var i = 0; i < classinfo.length; i++){
           if(issubclass(klass, classinfo[i])){return true}
        }
        return false
    }
    if(classinfo.__class__ === $B.GenericAlias){
        throw _b_.TypeError.$factory(
            'issubclass() arg 2 cannot be a parameterized generic')
    }

    if(klass === classinfo || mro.indexOf(classinfo) > -1){
        return true
    }

    // Search __subclasscheck__ on classinfo
    var sch = $B.$getattr(classinfo.__class__ || $B.get_class(classinfo),
        '__subclasscheck__', _b_.None)

    if(sch == _b_.None){
        return false
    }
    return sch(classinfo, klass)
}

// Utility class for iterators built from objects that have a __getitem__ and
// __len__ method
var iterator_class = $B.make_class("iterator",
    function(getitem){
        return {
            __class__: iterator_class,
            getitem: getitem,
            counter: -1
        }
    }
)

iterator_class.__next__ = function(self){
    self.counter++
    try{
        return self.getitem(self.counter)
    }catch(err){
        throw _b_.StopIteration.$factory('')
    }
}

$B.set_func_names(iterator_class, "builtins")

const callable_iterator = $B.make_class("callable_iterator",
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

$B.set_func_names(callable_iterator, "builtins")

$B.$iter = function(obj, sentinel){
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    if(sentinel === undefined){
        var klass = obj.__class__ || $B.get_class(obj)
        try{
            var _iter = $B.$call($B.$getattr(klass, '__iter__'))
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                try{
                    var gi_method = $B.$call($B.$getattr(klass, '__getitem__')),
                        gi = function(i){return gi_method(obj, i)},
                        len
                    return iterator_class.$factory(gi)
                }catch(err){
                    throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
                        "' object is not iterable")
                }
            }
            throw err
        }
        var res = $B.$call(_iter)(obj)
        try{
            $B.$getattr(res, '__next__')
        }catch(err){
            if($B.$isinstance(err, _b_.AttributeError)){
                throw _b_.TypeError.$factory(
                    "iter() returned non-iterator of type '" +
                     $B.class_name(res) + "'")
            }
        }
        return res
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

    var klass = obj.__class__ || $B.get_class(obj)
    try{
        var method = $B.$getattr(klass, '__len__')
    }catch(err){
        throw _b_.TypeError.$factory("object of type '" +
            $B.class_name(obj) + "' has no len()")
    }

    let res = $B.$call(method)(obj)

    if (!$B.$isinstance(res, _b_.int)) {
        throw _b_.TypeError.$factory(`'${$B.class_name(res)}' object cannot be interpreted as an integer`)
    }

    if(!$B.rich_comp('__ge__', res, 0)) {
        throw _b_.ValueError.$factory('ValueError: __len__() should return >= 0')
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


var map = _b_.map = $B.make_class("map",
    function(){
        var $ = $B.args('map', 2, {func: null, it1:null}, ['func', 'it1'],
                arguments, {}, 'args', null),
            func = $B.$call($.func)
        var iter_args = [$B.make_js_iterator($.it1)]
        for(var arg of $.args){
            iter_args.push($B.make_js_iterator(arg))
        }
        return {
            __class__: map,
            args: iter_args,
            func: func
        }
    }
)

map.__iter__ = function (self){
    return self
}

map.__next__ = function(self){
    var args = []
    for(var iter of self.args){
        var arg = iter.next()
        if(arg.done){
            throw _b_.StopIteration.$factory('')
        }
        args.push(arg.value)
    }
    return self.func.apply(null, args)
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
                func = func === _b_.None ? func : $B.$call(func)
                break
            case 'default':
                var default_value = item.value
                has_default = true
                break
            default:
                throw _b_.TypeError.$factory("'" + item.key +
                    "' is an invalid keyword argument for this function")
        }
    }

    if((! func) || func === _b_.None){
        func = x => x
    }

    if($.args.length == 0){
        throw _b_.TypeError.$factory($op_name +
            " expected 1 arguments, got 0")
    }else if($.args.length == 1){
        // Only one positional argument : it must be an iterable
        var $iter = $B.make_js_iterator($.args[0]),
            res = null,
            x_value,
            extr_value
        for(var x of $iter){
            if(res === null){
                extr_value = func(x)
                res = x
            }else{
                x_value = func(x)
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
                throw _b_.ValueError.$factory($op_name +
                    "() arg is an empty sequence")
            }
        }else{
            return res
        }
    }else{
        if(has_default){
           throw _b_.TypeError.$factory("Cannot specify a default for " +
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

var memoryview = _b_.memoryview = $B.make_class('memoryview',
    function(obj){
        check_nb_args_no_kw('memoryview', 1, arguments)
        if(obj.__class__ === memoryview){
            return obj
        }
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

memoryview.$match_sequence_pattern = true, // for Pattern Matching (PEP 634)
memoryview.$buffer_protocol = true
memoryview.$not_basetype = true // cannot be a base class
memoryview.$is_sequence = true

memoryview.__eq__ = function(self, other){
    if(other.__class__ !== memoryview){return false}
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
                throw _b_.KeyError.$factory(key)
            }
            return self.obj.source[key]
        }else{
            // fix me
            return self.obj.source[key]
        }
    }
    // fix me : add slice support for other formats than B
    res = self.obj.__class__.__getitem__(self.obj, key)
    if(key.__class__ === _b_.slice){
        return memoryview.$factory(res)
    }
}

memoryview.__len__ = function(self){
    return len(self.obj) / self.itemsize
}

memoryview.__setitem__ = function(self, key, value){
    try{
        $B.$setitem(self.obj, key, value)
    }catch(err){
        throw _b_.TypeError.$factory("cannot modify read-only memory")
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
        throw _b_.ValueError.$factory(`unknown format: '${format}'`)
    }
    var new_itemsize = struct_format[format].size
    if(shape === undefined){
        shape = _b_.len(self) // new_itemsize
    }else{
        if(! $B.$isinstance(shape, [_b_.list, _b_.tuple])){
            throw _b_.TypeError.$factory('shape must be a list or a tuple')
        }
        var nb = 1
        for(var item of shape){
            if(! $B.$isinstance(item, _b_.int)){
                throw _b_.TypeError.$factory(
                    'memoryview.cast(): elements of shape must be integers')
            }
            nb *= item
        }
        if(nb * new_itemsize != _b_.len(self)){
            throw _b_.TypeError.$factory(
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
    return {
        __class__: _b_.bytes,
        source: self.obj.source
    }
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
    var klass = obj.__class__ || $B.get_class(obj),
        ga = $B.$call($B.$getattr(klass, "__next__"))
    if(ga !== undefined){
        try{
            return $B.$call(ga)(obj)
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

var NotImplementedType = $B.NotImplementedType =
    $B.make_class("NotImplementedType",
        function(){return NotImplemented}
    )

NotImplementedType.__repr__ = NotImplementedType.__str__ = function(){
    return "NotImplemented"
}
$B.set_func_names(NotImplementedType, "builtins")

var NotImplemented = _b_.NotImplemented = {
    __class__: NotImplementedType
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
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
    }
    switch($B.get_class(c)){
      case _b_.str:
        if(c.length == 1){
            return c.charCodeAt(0)
        }
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
      case _b_.bytes:
      case _b_.bytearray:
        if(c.source.length == 1){
            return c.source[0]
        }
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            'string of length ' + c.source.length + ' found')
      default:
        throw _b_.TypeError.$factory('ord() expected a character, but ' +
            $B.class_name(c) + ' was found')
    }
}

var complex_modulo = () => _b_.ValueError.$factory('complex modulo')
var all_ints = () => _b_.TypeError.$factory('pow() 3rd argument not ' +
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
        end = _b_.dict.get(kw, 'end', '\n'),
        sep = _b_.dict.get(kw, 'sep', ' '),
        file = _b_.dict.get(kw, 'file', $B.get_stdout())
    var args = $ns['args'],
        writer = $B.$getattr(file, 'write')
    for(var i = 0, len = args.length; i < len; i++){
        var arg = _b_.str.$factory(args[i])
        writer(arg)
        if(i < len - 1){
            writer(sep)
        }
    }
    writer(end)
    var flush = $B.$getattr(file, 'flush', None)
    if(flush !== None){
        $B.$call(flush)()
    }
    return None
}

$print.__name__ = 'print'
$print.is_func = true

var quit = _b_.quit = function(){
    throw _b_.SystemExit
}

quit.__repr__ = quit.__str__ = function(){
    return "Use quit() or Ctrl-Z plus Return to exit"
}

var repr = _b_.repr = function(obj){
    check_nb_args_no_kw('repr', 1, arguments)

    var klass = $B.get_class(obj)
    return $B.$call($B.$getattr(klass, "__repr__"))(obj)
}

var reversed = _b_.reversed = $B.make_class("reversed",
    function(seq){
        // Return a reverse iterator. seq must be an object which has a
        // __reversed__() method or supports the sequence protocol (the
        // __len__() method and the __getitem__() method with integer
        // arguments starting at 0).

        check_nb_args_no_kw('reversed', 1, arguments)

        var klass = seq.__class__ || $B.get_class(seq),
            rev_method = $B.$getattr(klass, '__reversed__', null)
        if(rev_method !== null){
            return $B.$call(rev_method)(seq)
        }
        try{
            var method = $B.$getattr(klass, '__getitem__')
        }catch(err){
            throw _b_.TypeError.$factory("argument to reversed() must be a sequence")
        }

        var res = {
            __class__: reversed,
            $counter : _b_.len(seq),
            getter: function(i){
                return $B.$call(method)(seq, i)
            }
        }
        return res
    }
)

reversed.__iter__ = function(self){
    return self
}

reversed.__next__ = function(self){
    self.$counter--
    if(self.$counter < 0){
        throw _b_.StopIteration.$factory('')
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
        klass = arg.__class__ || $B.get_class(arg)
        try{
            return $B.$call($B.$getattr(klass, "__round__")).apply(null, arguments)
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("type " + $B.class_name(arg) +
                    " doesn't define __round__ method")
            }else{
                throw err
            }
        }
    }

    if(! $B.$isinstance(n, _b_.int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(n) +
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
        throw _b_.OverflowError.$factory(
            "rounded value too large to represent")
    }
    if($.ndigits === None){
        // Always return an integer
        return Math.floor(res.value)
    }else{
        // Return the same type as argument
        return $B.$call(klass)(res)
    }
}

_b_.setattr = function(){

    var $ = $B.args('setattr', 3, {obj: null, attr: null, value: null},
        ['obj', 'attr', 'value'], arguments, {}, null, null),
        obj = $.obj, attr = $.attr, value = $.value
    if(!(typeof attr == 'string')){
        throw _b_.TypeError.$factory("setattr(): attribute name must be string")
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
    var $test = false // attr === "area" // && value == "my doc."
    switch(attr){
        case '__dict__':
            // set attribute __dict__
            // remove previous attributes
            if(! $B.$isinstance(value, _b_.dict)){
                throw _b_.TypeError.$factory("__dict__ must be set to a dictionary, " +
                    "not a '" + $B.class_name(value) + "'")
            }
            if(obj.$function_infos && ! obj.$infos){
                $B.make_function_infos(obj, ...obj.$function_infos)
            }
            if(obj.$infos){
                obj.$infos.__dict__ = value
                return None
            }
            obj.__dict__ = value
            return None
        case '__class__':
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
                        if(value.__bases__[i] !== _b_.object &&
                                value.__bases__[i].__module__ == "builtins"){
                            error("__class__ assignment: '" + $B.class_name(obj) +
                                "' object layout differs from '" +
                                $B.class_name(value) + "'")
                        }
                    }
                }
            }
            obj.__class__ = value
            return None
        case '__doc__':
            if(obj.__class__ === _b_.property){
                obj[attr] = value
            }
            break
    }
    if($test){console.log("set attr", attr, "of", obj, "to", value)}
    if(obj.$factory || obj.$is_class){
        var metaclass = obj.__class__
        if(metaclass === _b_.type){
            return _b_.type.__setattr__(obj, attr, value)
        }
        return $B.$call($B.$getattr(metaclass, '__setattr__'))(obj, attr, value)
    }

    var res = obj[attr],
        klass = obj.__class__ || $B.get_class(obj)

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
        if(res.__set__ !== undefined){
            res.__set__(res, obj, value)
            return None
        }
        var rcls = res.__class__,
            __set1__
        if(rcls !== undefined){
            __set1__ = $B.search_in_mro(rcls, '__set__')
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
    klass.$tp_setattr = klass.$tp_setattr ?? $B.search_in_mro(klass, '__setattr__')
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
        }else if(obj.__dict__ === undefined){
            throw _b_.AttributeError.$factory(`'${$B.class_name(obj)}' ` +
                `object has no attribute '${attr}' and no __dict__ for ` +
                `setting new attributes`)
        }else{
            _b_.dict.$setitem(obj.__dict__, attr, value)
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
}

_b_.sorted = function(){
    var $ = $B.args('sorted', 1, {iterable: null}, ['iterable'],
        arguments, {}, null, 'kw')
    var _list = _b_.list.$factory($.iterable),
        args = [_list].concat(Array.from(arguments).slice(1))
    _b_.list.sort.apply(null, args)
    return _list
}


// str() defined in py_string.js

_b_.sum = function(){
    var $ = $B.args('sum', 2, {iterable: null, start: null},
        ['iterable', 'start'], arguments, {start: 0}, null, null),
        iterable = $.iterable,
        start = $.start

    if($B.$isinstance(start, [_b_.str, _b_.bytes])){
        throw _b_.TypeError.$factory("sum() can't sum bytes" +
            " [use b''.join(seq) instead]")
    }

    var res = start
    iterable = iter(iterable)
    while(true){
        try{
            var _item = next(iterable)
            res = $B.rich_op('__add__', res, _item)
        }catch(err){
           if(err.__class__ === _b_.StopIteration){
               break
           }else{
               throw err
           }
        }
    }
    return res
}

var $$super = _b_.super = $B.make_class("super",
    function (_type, object_or_type){
        var no_object_or_type = object_or_type === undefined
        if(_type === undefined && object_or_type === undefined){
            var frame = $B.frame_obj.frame,
                pyframe = $B.imported["_sys"]._getframe(),
                code = $B.frame.f_code.__get__(pyframe),
                co_varnames = code.co_varnames
            if(co_varnames.length > 0){
                _type = frame[1].__class__
                if(_type === undefined){
                    throw _b_.RuntimeError.$factory("super(): no arguments")
                }
                object_or_type = frame[1][code.co_varnames[0]]
            }else{
                throw _b_.RuntimeError.$factory("super(): no arguments")
            }
        }
        if((! no_object_or_type) && Array.isArray(object_or_type)){
            object_or_type = object_or_type[0]
        }
        var $arg2

        if(object_or_type !== undefined){
            if(object_or_type === _type ||
                    (object_or_type.$is_class &&
                    _b_.issubclass(object_or_type, _type))){
                $arg2 = 'type'
            }else if($B.$isinstance(object_or_type, _type)){
                $arg2 = 'object'
            }else{
                throw _b_.TypeError.$factory(
                    'super(type, obj): obj must be an instance ' +
                    'or subtype of type')
            }
        }
        return {
            __class__: $$super,
            __thisclass__: _type,
            __self_class__: object_or_type,
            $arg2
        }
    }
)

$$super.__get__ = function(self, instance){
    // https://www.artima.com/weblogs/viewpost.jsp?thread=236278
    return $$super.$factory(self.__thisclass__, instance)
}

$$super.__getattribute__ = function(self, attr){

    if(self.__thisclass__.$is_js_class){
        if(attr == "__init__"){
            // use call on parent
            return function(){
                mro[0].$js_func.call(self.__self_class__, ...arguments)
            }
        }
    }
    // Determine method resolution order from object_or_type
    var object_or_type = self.__self_class__,
        mro = self.$arg2 == 'type' ? object_or_type.__mro__ :
                                     $B.get_class(object_or_type).__mro__

    // Search of method attr starts in mro after self.__thisclass__
    var search_start = mro.indexOf(self.__thisclass__) + 1,
        search_classes = mro.slice(search_start)

    var $test = false // attr == "new" // && self.__self_class__.$infos.__name__ == 'EnumCheck'
    if($test){
        console.log('super.__ga__, self', self, 'search classes', search_classes)
    }

    var f
    for(var klass of search_classes){
        if(klass === undefined){
            console.log('klass undef in super', self)
            console.log('mro', mro)
        }
        if(klass[attr] !== undefined){
            f = klass[attr]
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
        throw $B.attr_error(attr, self)
    }

    if($test){console.log("super", attr, self, "mro", mro,
        "found in mro[0]", mro[0],
        f, f + '')}
    if(f.$type == "staticmethod" || attr == "__new__"){
        return f
    }else if(f.__class__ === _b_.classmethod){
        return f.__func__.bind(null, object_or_type)
    }else if(f.$is_property){
        return f.fget(object_or_type)
    }else if(typeof f != "function"){
        return f
    }else{
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
        }else if(f.__class__ === _b_.property){
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
}

$$super.__init__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory("descriptor '__init__' of 'super' " +
            "object needs an argument")
    }
    if(cls.__class__ !== $$super){
        throw _b_.TypeError.$factory("descriptor '__init__' requires a" +
            " 'super' object but received a '" + $B.class_name(cls) + "'")
    }
}

$$super.__repr__ = function(self){
    $B.builtins_repr_check($$super, arguments) // in brython_builtins.js
    var res = "<super: <class '" + self.__thisclass__.__name__ + "'>"
    if(self.__self_class__ !== undefined){
        res += ', <' + self.__self_class__.__class__.__name__ + ' object>'
    }else{
        res += ', NULL'
    }
    return res + '>'
}

$B.set_func_names($$super, "builtins")

_b_.vars = function(){
    var def = {},
        $ = $B.args('vars', 1, {obj: null}, ['obj'], arguments, {obj: def},
        null, null)
    if($.obj === def){
        return _b_.locals()
    }else{
        try{
            return $B.$getattr($.obj, '__dict__')
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("vars() argument must have __dict__ attribute")
            }
            throw err
        }
    }
}

var $Reader = $B.make_class("Reader")

$Reader.__bool__ = function(){
    return true
}

$Reader.__enter__ = function(self){
    return self
}

$Reader.__exit__ = function(self){
    $Reader.close(self)
}

$Reader.__init__ = function(_self, initial_value=''){
    _self.$content = initial_value
    _self.$counter = 0
}

$Reader.__iter__ = function(self){
    self.$lc = -1
    delete self.$lines
    make_lines(self)
    return self
}

$Reader.__len__ = function(self){
    return self.lines.length
}

$Reader.__next__ = function(self){
    self.$lc++
    if(self.$lc >= self.$lines.length){
        throw _b_.StopIteration.$factory()
    }
    return self.$lines[self.$lc]
}

$Reader.__new__ = function(cls){
    return {
        __class__: cls
    }
}

$Reader.close = function(self){
    self.closed = true
}

$Reader.flush = function(){
    return None
}

$Reader.read = function(){
    var $ = $B.args("read", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            self = $.self,
            size = $B.PyNumber_Index($.size)
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    var len = _b_.len(self.$content)
    if(size < 0){
        size = len - self.$counter
    }
    var res
    if(self.$binary){
        res = _b_.bytes.$factory(self.$content.source.slice(self.$counter,
            self.$counter + size))
    }else{
        res = self.$content.substr(self.$counter, size)
    }
    self.$counter += size
    return res
}

$Reader.readable = function(){
    return true
}

function make_lines(self){
    // If the stream "self" has no attribute $lines, build it as a list of
    // strings if the stream is opened on text mode, of bytes otherwise
    if(self.$lines === undefined){
        if(! self.$binary){
            self.$lines = self.$content.split("\n")
            if($B.last(self.$lines) == ''){
                self.$lines.pop()
            }
            self.$lines = self.$lines.map(x => x + '\n')
        }else{
            var lines = [],
                pos = 0,
                source = self.$content.source,
                len = source.length
            while(pos < len){
                var ix = source.indexOf(10, pos)
                if(ix == -1){
                    lines.push({__class__: _b_.bytes, source: source.slice(pos)})
                    break
                }else{
                    lines.push({
                        __class__: _b_.bytes,
                        source: source.slice(pos, ix + 1)
                    })
                    pos = ix + 1
                }
            }
            self.$lines = lines
        }
    }
}

$Reader.readline = function(){
    var $ = $B.args("readline", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            self = $.self,
            size = $.size,
            result,
            rest,
            ix

    if(size === _b_.None){
        size = -1
    }else if(! _b_.isinstance(size, _b_.int)){
        throw _b_.TypeError.$factory('argument should be integer or None, ' +
            `not '${$B.class_name(size)}'`)
    }else{
        size = _b_.int.$int_value(size)
    }
    // set line counter
    self.$lc = self.$lc === undefined ? -1 : self.$lc

    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }

    if(self.$binary){
        // search next \n
        ix = self.$content.source.indexOf(10, self.$counter)
        if(ix == -1){
            rest = self.$content.source.slice(self.$counter)
            if(size > -1){
                rest = rest.slice(0, size)
            }
            self.$counter = self.$content.source.length
            return _b_.bytes.$factory(rest)
        }else{
            var line_source = self.$content.source.slice(self.$counter,
                    ix + 1)
            if(size > -1){
                line_source = line_source.slice(0, size)
            }
            result = {
                __class__: _b_.bytes,
                source : line_source
            }
            self.$counter = ix + 1
            return result
        }
    }else{
        if(self.$counter == self.$content.length){
            return ''
        }
        ix = self.$content.indexOf("\n", self.$counter)
        if(ix == -1){
            rest = self.$content.substr(self.$counter)
            if(size > -1){
                rest = rest.substr(0, size)
            }
            self.$counter = self.$content.length
            return rest
        }else{
            result = self.$content.substring(self.$counter, ix + 1)
            if(size > -1){
                result = result.substr(0, size)
            }
            self.$counter = ix + 1
            self.$lc += 1
            return result
        }
    }
}

$Reader.readlines = function(){
    var $ = $B.args("readlines", 2, {self: null, hint: null},
            ["self", "hint"], arguments, {hint: -1}, null, null),
            self = $.self,
            hint = $B.PyNumber_Index($.hint)
    var nb_read = 0
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    self.$lc = self.$lc === undefined ? -1 : self.$lc
    make_lines(self)

    var lines
    if(hint < 0){
        lines = self.$lines.slice(self.$lc + 1)
    }else{
        lines = []
        while(self.$lc < self.$lines.length &&
                nb_read < hint){
            self.$lc++
            lines.push(self.$lines[self.$lc])
        }
    }
    return $B.$list(lines)
}

$Reader.seek = function(self, offset, whence){
    if(self.closed === True){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    if(whence === undefined){
        whence = 0
    }
    if(whence === 0){
        self.$counter = offset
    }else if(whence === 1){
        self.$counter += offset
    }else if(whence === 2){
        self.$counter = _b_.len(self.$content) + offset
    }
    return None
}

$Reader.seekable = function(){
    return true
}

$Reader.tell = function(self){
    return self.$counter
}

$Reader.write = function(_self, data){
    if(_self.mode.indexOf('w') == -1){
        if($B.$io.UnsupportedOperation === undefined){
            $B.$io.UnsupportedOperation = $B.$class_constructor(
                "UnsupportedOperation", {}, [_b_.Exception],
                ["Exception"])
        }
        throw $B.$call($B.$io.UnsupportedOperation)('not writable')
    }
    // write to file cache
    if(_self.mode.indexOf('b') == -1){
        // text mode
        if(typeof data != "string"){
            throw _b_.TypeError.$factory('write() argument must be str,' +
                ` not ${$B.class_name(data)}`)
        }
        _self.$content += data
    }else{
        if(! $B.$isinstance(data, [_b_.bytes, _b_.bytearray])){
            throw _b_.TypeError.$factory('write() argument must be bytes,' +
                ` not ${$B.class_name(data)}`)
        }
        _self.$content.source = _self.$content.source.concat(data.source)
    }
    $B.file_cache[_self.name] = _self.$content
}

$Reader.writable = function(){
    return false
}

$B.set_func_names($Reader, "builtins")

var $BufferedReader = $B.make_class('_io.BufferedReader',
    function(content){
        return {
            __class__: $BufferedReader,
            $binary: true,
            $content: content,
            $read_func: $B.$getattr(content, 'read')
        }
    }
)

$BufferedReader.__mro__ = [$Reader, _b_.object]

$BufferedReader.read = function(self, size){
    if(self.$read_func === undefined){
        return $Reader.read(self, size === undefined ? -1 : size)
    }
    return self.$read_func(size || -1)
}

var $TextIOWrapper = $B.make_class('_io.TextIOWrapper',
    function(){
        var $ = $B.args("TextIOWrapper", 6,
            {buffer: null, encoding: null, errors: null,
             newline: null, line_buffering: null, write_through:null},
            ["buffer", "encoding", "errors", "newline",
             "line_buffering", "write_through"],
             arguments,
             {encoding: "utf-8", errors: _b_.None, newline: _b_.None,
              line_buffering: _b_.False, write_through: _b_.False},
              null, null)
        return {
            __class__: $TextIOWrapper,
            __dict__: $B.empty_dict(),
            $content: _b_.bytes.decode($.buffer.$content, $.encoding),
            encoding: $.encoding,
            errors: $.errors,
            newline: $.newline
        }
    }
)

$TextIOWrapper.__bases__ = [$Reader]
$TextIOWrapper.__mro__ = [$Reader, _b_.object]

$B.set_func_names($TextIOWrapper, "builtins")

$B.Reader = $Reader
$B.TextIOWrapper = $TextIOWrapper
$B.BufferedReader = $BufferedReader

_b_.open = function(){
    // first argument is file : can be a string, or an instance of a DOM File object
    var $ = $B.args('open', 3, {file: null, mode: null, encoding: null},
        ['file', 'mode', 'encoding'], arguments,
        {mode: 'r', encoding: 'utf-8'}, 'args', 'kw'),
        file = $.file,
        mode = $.mode,
        encoding = $.encoding,
        result = {}
    if(encoding == 'locale'){
        // cf. PEP 597
        encoding = 'utf-8'
    }
    var is_binary = mode.search('b') > -1

    if(mode.search('w') > -1){
        // return the file-like object
        result = {
            $binary: is_binary,
            $content: is_binary ? _b_.bytes.$factory() : '',
            $encoding: encoding,
            closed: False,
            mode,
            name: file
        }
        result.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        $B.file_cache[file] = result.$content
        return result
    }else if(['r', 'rb'].indexOf(mode) == -1){
        throw _b_.ValueError.$factory("Invalid mode '" + mode + "'")
    }
    if($B.$isinstance(file, _b_.str)){
        // read the file content and return an object with file object methods
        if($B.file_cache.hasOwnProperty($.file)){
            var f = $B.file_cache[$.file] // string
            result.content = f
            if(is_binary && typeof f == 'string'){
                result.content = _b_.str.encode(f, 'utf-8')
            }else if(f.__class__ === _b_.bytes && ! is_binary){
                result.content = _b_.bytes.decode(f, encoding)
            }
        }else if($B.files && $B.files.hasOwnProperty($.file)){
            // Virtual file system created by
            // python -m brython --make_file_system
            var $res = atob($B.files[$.file].content)
            var source = []
            for(const char of $res){
                source.push(char.charCodeAt(0))
            }
            result.content = _b_.bytes.$factory(source)
            if(!is_binary){
                // use encoding to restore text
                try{
                    result.content = _b_.bytes.decode(result.content, encoding)
                } catch(error) {
                    result.error = error
                }
            }
        }else if($B.protocol != "file"){
            // Try to load file by synchronous Ajax call
            var req = new XMLHttpRequest()
            // Set mimetype so that bytes are not modified
            req.overrideMimeType('text/plain;charset=x-user-defined')
            req.onreadystatechange = function(){
                if(this.readyState != 4){
                    return
                }
                var status = this.status
                if(status == 404){
                    result.error = _b_.FileNotFoundError.$factory(file)
                }else if(status != 200){
                    result.error = _b_.IOError.$factory('Could not open file ' +
                        file + ' : status ' + status)
                }else{
                    var bytes = []
                    for(var codePoint of this.response){
                        var cp = codePoint.codePointAt(0)
                        if(cp > 0xf700){
                            cp -= 0xf700

                        }
                        bytes[bytes.length] = cp
                    }
                    result.content = _b_.bytes.$factory(bytes)
                    if(! is_binary){
                        // use encoding to restore text
                        try{
                            result.content = _b_.bytes.decode(result.content,
                                encoding)
                        }catch(error){
                            result.error = error
                        }
                    }
                }
            }
            // add fake query string to avoid caching
            var cache = $B.get_option('cache'),
                fake_qs = cache ? '' : '?foo=' + (new Date().getTime())
            req.open('GET', encodeURI(file + fake_qs), false)
            req.send()
        }else{
            throw _b_.FileNotFoundError.$factory(
                "cannot use 'open()' with protocol 'file'")
        }

        if(result.error !== undefined){
            throw result.error
        }

        // return the file-like object
        var res = {
            $binary: is_binary,
            $content: result.content,
            $counter: 0,
            $encoding: encoding,
            $length: is_binary ? result.content.source.length :
                result.content.length,
            closed: False,
            mode,
            name: file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        return res
    }else{
        throw _b_.TypeError.$factory("invalid argument for open(): " +
            _b_.str.$factory(file))
    }
}

var zip = _b_.zip = $B.make_class("zip",
    function(){
        var res = {
            __class__: zip,
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
            __class__: zip,
            iters,
            strict
        }
    }
)

zip.__iter__ = function(self){
    return self
}

zip.__next__ = function(self){
    var res = [],
        len = self.iters.length
    for(var i = 0; i < len; i++){
        var v = self.iters[i].next()
        if(v.done){
            if(self.strict){
                if(i > 0){
                    throw _b_.ValueError.$factory(
                        `zip() argument ${i + 1} is longer than argument ${i}`)
                }else{
                    for(var j = 1; j < len; j++){
                        var v1 = self.iters[j].next()
                        if(! v1.done){
                            throw _b_.ValueError.$factory(
                                `zip() argument ${j + 1} is longer than argument ${i + 1}`)
                        }
                    }
                }
            }
            throw _b_.StopIteration.$factory('')
        }
        res.push(v.value)
    }
    return $B.fast_tuple(res)
}

$B.set_func_names(zip, "builtins")

// built-in constants : True, False, None

function no_set_attr(klass, attr){
    if(klass[attr] !== undefined){
        throw _b_.AttributeError.$factory("'" + klass.__name__ +
            "' object attribute '" + attr + "' is read-only")
    }else{
        throw $B.attr_error(attr, klass)
    }
}

// True and False are the same as Javascript true and false

var True = _b_.True = true
var False = _b_.False = false

var ellipsis = $B.ellipsis = $B.make_class("ellipsis",
    function(){return Ellipsis}
)

ellipsis.__repr__ = function(){
    return 'Ellipsis'
}

var Ellipsis = _b_.Ellipsis = {__class__: ellipsis}

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

$B.builtin_funcs = [
    "__build_class__",
    "abs", "aiter", "all", "anext", "any", "ascii", "bin", "breakpoint",
    "callable", "chr",
    "compile", "delattr", "dir", "divmod", "eval", "exec", "exit", "format",
    "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input",
    "isinstance", "issubclass", "iter", "len", "locals", "max", "min", "next",
    "oct", "open", "ord", "pow", "print", "quit", "repr", "round", "setattr",
    "sorted", "sum", "vars"
]

var builtin_function = $B.builtin_function_or_method = $B.make_class(
    "builtin_function_or_method", function(f){
        f.__class__ = builtin_function
        return f
    })

builtin_function.__getattribute__ = $B.function.__getattribute__
builtin_function.__reduce_ex__ = builtin_function.__reduce__ = function(self){
    return self.$function_infos[$B.func_attrs.__name__]
}
builtin_function.__repr__ = builtin_function.__str__ = function(self){
    return '<built-in function ' + self.$function_infos[$B.func_attrs.__name__] + '>'
}
$B.set_func_names(builtin_function, "builtins")

var method_wrapper = $B.make_class("method_wrapper")

method_wrapper.__repr__ = method_wrapper.__str__ = function(self){
    return "<method wrapper '" + self.$function_infos[$B.func_attrs.__name__] + "' of function object>"
}
$B.set_func_names(method_wrapper, "builtins")

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

for(var name of builtin_names){
    try{
        if($B.builtin_funcs.indexOf(name) > -1){
            _b_[name].__class__ = builtin_function
            // used by inspect module
            _b_[name].$infos = {
                __module__: 'builtins',
                __name__: name,
                __qualname__: name
            }
            $B.set_function_infos(_b_[name],
                {
                    __module__: 'builtins',
                    __name__: name,
                    __qualname__: name
                }
            )
        }
    }catch(err){
        // Error for the built-in names that are not defined in this script,
        // eg int, str, float, etc.
    }
}

_b_.object.__init__.__class__ = $B.wrapper_descriptor // in py_type.js
_b_.object.__new__.__class__ = builtin_function


})(__BRYTHON__);


