// built-in functions
;(function($B){

var _b_ = $B.builtins
_b_.__debug__ = false

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
$B.$inv_comps = {'>': 'lt', '>=': 'le', '<': 'gt', '<=': 'ge'}

var check_nb_args = $B.check_nb_args = function(name, expected, args){
    // Check the number of arguments
    var len = args.length,
        last = args[len - 1]
    if(last && last.$nat == "kw"){
        var kw = last.kw
        if(Array.isArray(kw) && kw[1] && kw[1].__class__ === _b_.dict){
            if(Object.keys(kw[1].$string_dict).length == 0){
                len--
            }
        }
    }
    if(len != expected){
        if(expected == 0){
            throw _b_.TypeError.$factory(name + "() takes no argument" +
                " (" + len + " given)")
        }else{
            throw _b_.TypeError.$factory(name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + len + " given)")
        }
    }
}

var check_no_kw = $B.check_no_kw = function(name, x, y){
    // Throw error if one of x, y is a keyword argument
    if(x === undefined){
        console.log("x undef", name, x, y)
    }
    if((x.$nat && x.kw && x.kw[0] && x.kw[0].length > 0) ||
            (y !== undefined && y.$nat)){
        throw _b_.TypeError.$factory(name + "() takes no keyword arguments")}
}

var check_nb_args_no_kw = $B.check_nb_args_no_kw = function(name, expected, args){
    // Check the number of arguments and absence of keyword args
    var len = args.length,
        last = args[len - 1]
    if(last && last.$nat == "kw"){
        if(last.kw.length == 2 && Object.keys(last.kw[0]).length == 0){
            len--
        }else{
            throw _b_.TypeError.$factory(name + "() takes no keyword arguments")
        }
    }
    if(len != expected){
        if(expected == 0){
            throw _b_.TypeError.$factory(name + "() takes no argument" +
                " (" + len + " given)")
        }else{
            throw _b_.TypeError.$factory(name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + len + " given)")
        }
    }
}

var NoneType = {
    $factory: function(){
        return None
    },
    $infos:{
        __name__: "NoneType",
        __module__: "builtins"
    },
    __bool__: function(self){return False},
    __class__: _b_.type,
    __hash__: function(self){return 0},
    __mro__: [_b_.object],
    __repr__: function(self){return 'None'},
    __str__: function(self){return 'None'},
    $is_class: true
}

NoneType.__setattr__ = function(self, attr){
    return no_set_attr(NoneType, attr)
}

var None = {
    __class__: NoneType,
}

for(var $op in $B.$comps){ // None is not orderable with any type
    var key = $B.$comps[$op]
    switch(key){
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        NoneType['__' + key + '__'] = (function(op){
            return function(other){return _b_.NotImplemented}
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

function __build_class__(){
    throw _b_.NotImplementedError.$factory('__build_class__')
}

function abs(obj){
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

function aiter(async_iterable){
    return $B.$call($B.$getattr(async_iterable, '__aiter__'))()
}

function all(obj){
    check_nb_args_no_kw('all', 1, arguments)
    var iterable = iter(obj)
    while(1){
        try{
            var elt = next(iterable)
            if(!$B.$bool(elt)){return false}
        }catch(err){return true}
    }
}

function anext(async_iterator, _default){
    var missing = {},
        $ = $B.args('anext', 2, {async_iterator: null, _default: null},
                ['async_iterator', '_default'], arguments,
                {_default: missing}, null, null)
    var awaitable = $B.$call($B.$getattr(async_iterator, '__anext__'))()
    return awaitable
}

function any(obj){
    check_nb_args_no_kw('any', 1, arguments)
    var next_of = $B.next_of(obj)
    while(1){
        try{
            var elt = next_of()
            if($B.$bool(elt)){
                return true
            }
        }catch(err){
            return false
        }
    }
}

function ascii(obj) {
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

  var value = $B.$GetInt(obj)

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
    if(isinstance(obj, _b_.int)){
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
function bin(obj) {
    check_nb_args_no_kw('bin', 1, arguments)
    return bin_hex_oct(2, obj)
}

function breakpoint(){
    // PEP 553
    $B.$import('sys', [])
    var missing = {},
        hook = $B.$getattr($B.imported.sys, 'breakpointhook', missing)
    if(hook === missing){
        throw _b_.RuntimeError.$factory('lost sys.breakpointhook')
    }
    return $B.$call(hook).apply(null, arguments)
}

function callable(obj) {
    check_nb_args_no_kw('callable', 1, arguments)

    return hasattr(obj, '__call__')
}

function chr(i){
    check_nb_args_no_kw('chr', 1, arguments)

    i = $B.PyNumber_Index(i)

    if(i < 0 || i > 1114111){
        throw _b_.ValueError.$factory('Outside valid range')
    }else if(i >= 0x10000 && i <= 0x10FFFF){
        var code = (i - 0x10000)
        return String.fromCodePoint(0xD800 | (code >> 10)) +
            String.fromCodePoint(0xDC00 | (code & 0x3FF))
    }else{
        return String.fromCodePoint(i)
    }
}

//classmethod() (built in class)
var classmethod = $B.make_class("classmethod",
    function(func) {
        check_nb_args_no_kw('classmethod', 1, arguments)
        return {
            __class__: classmethod,
            __func__: func
        }
    }
)

classmethod.__get__ = function(self, obj, cls){
    // adapted from
    // https://docs.python.org/3/howto/descriptor.html#class-methods
    if(cls === _b_.None){
        cls = $B.get_class(obj)
    }
    var func_class = $B.get_class(self.__func__),
        candidates = [func_class].concat(func_class.__mro__)
    for(var candidate of candidates){
        if(candidate.__get__){
            return candidate.__get__(self.__func__, cls, cls)
        }
    }
    return $B.method.$factory(self.__func__, cls)
}

$B.set_func_names(classmethod, "builtins")

var code = $B.code = $B.make_class("code")

code.__repr__ = code.__str__ = function(_self){
    return `<code object ${_self.co_name}, file '${_self.co_filename}', ` +
        `line ${_self.co_firstlineno || 1}>`
}

code.__getattribute__ = function(self, attr){
    return self[attr]
}

$B.set_func_names(code, "builtins")

//compile() (built in function)
function compile() {
    var $ = $B.args('compile', 6,
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

    if(_b_.isinstance($.source, _b_.bytes)){
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
            var mo = second_line.match(encoding_re)
            if(mo){
                encoding = mo[1]
            }
        }
        $.source = _b_.bytes.decode($.source, encoding)
    }

    if(!_b_.isinstance(filename, [_b_.bytes, _b_.str])){
        // module _warning is in builtin_modules.js
        $B.warn(_b_.DeprecationWarning,
            `path should be string, bytes, or os.PathLike, ` +
            `not ${$B.class_name(filename)}`)
    }
    if(interactive && ! $.source.endsWith("\n")){
        // This is used in codeop.py to raise SyntaxError until a block in the
        // interactive interpreter ends with "\n"
        // Cf. issue #853
        var lines = $.source.split("\n")
        if($B.last(lines).startsWith(" ")){
            throw _b_.SyntaxError.$factory("unexpected EOF while parsing")
        }
    }

    if($.source.__class__ && $.source.__class__.__module__ == 'ast'){
        // compile an ast instance
        $B.imported._ast._validate($.source)
        $._ast = $.source
        delete $.source
        return $
    }

    if($B.parser_to_ast){
        var _ast = new $B.Parser($.source, filename).parse('file'),
            future = $B.future_features(_ast, filename),
            symtable = $B._PySymtable_Build(_ast, filename),
            js_obj = $B.js_from_root({ast:_ast, symtable, filename: $.filename})
        if($.flags == $B.PyCF_ONLY_AST){
            delete $B.url2name[filename]
            var res = $B.ast_js_to_py(_ast)
            res.$js_ast = _ast
            return res
        }
    }else{
        var root = $B.parser.$create_root_node(
                {src: $.source, filename},
                module_name, module_name)
        root.mode = $.mode
        root.parent_block = $B.builtins_scope
        $B.parser.dispatch_tokens(root, $.source)
        var _ast = root.ast()
        if($.mode == 'single' && _ast.body.length == 1 &&
                _ast.body[0] instanceof $B.ast.Expr){
            // If mode is 'single' and the source is a single expression,
            // set _ast to an Expression and set attribute .single_expression
            // to compile() result. This is used in exec() to print the
            // expression if it is not None
            root = $B.parser.$create_root_node(
                {src: $.source, filename},
                module_name, module_name)
            root.mode = 'eval'
            $.single_expression = true
            root.parent_block = $B.builtins_scope
            $B.parser.dispatch_tokens(root, $.source)
            _ast = root.ast()
        }
        var future = $B.future_features(_ast, filename),
            symtable = $B._PySymtable_Build(_ast, filename, future)
        delete $B.url2name[filename]
        var js_obj = $B.js_from_root({ast:_ast, symtable, filename})

        if($.flags == $B.PyCF_ONLY_AST){
            $B.create_python_ast_classes() // in py_ast.js
            var klass = _ast.constructor.$name
            // Transform _ast (JS version) into a Python ast instance
            var res = $B.ast_js_to_py(_ast) // in py_ast.js
            res.$js_ast = _ast
            return res
        }
    }
    delete $B.url2name[filename]
    // Set attribute ._ast to avoid compiling again if result is passed to
    // exec()
    $._ast = $B.ast_js_to_py(_ast)
    $._ast.$js_ast = _ast
    return $
}


//function complex is located in py_complex.js

// built-in variable __debug__
var __debug__ = $B.debug > 0

function delattr(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has
    // a method __delete__(), use it
    check_nb_args_no_kw('delattr', 2, arguments)
    if(typeof attr != 'string'){
        throw _b_.TypeError.$factory("attribute name must be string, not '" +
            $B.class_name(attr) + "'")
    }
    return $B.$getattr(obj, '__delattr__')(attr)
}

$B.$delete = function(name, is_global){
    // remove name from namespace
    function del(obj){
        if(obj.__class__ === $B.generator){
            // Force generator return (useful if yield was in a context manager)
            obj.js_gen.return()
        }
    }
    var found = false,
        frame = $B.last($B.frames_stack)
    if(! is_global){
        if(frame[1][name] !== undefined){
            found = true
            del(frame[1][name])
            delete frame[1][name]
        }
    }else{
        if(frame[2] != frame[0] && frame[3][name] !== undefined){
            found = true
            del(frame[3][name])
            delete frame[3][name]
        }
    }
    if(!found){
        throw $B.name_error(name)
    }
}

function dir(obj){
    if(obj === undefined){
        // if dir is called without arguments, use locals
        var frame = $B.last($B.frames_stack)
            locals_obj = frame[1],
            res = _b_.list.$factory(),
            pos = 0
        for(var attr in locals_obj){
            if(attr.charAt(0) == '$' && attr.charAt(1) != '$') {
                // exclude internal attributes set by Brython
                continue
            }
            res[pos++] = attr
        }
        _b_.list.sort(res)
        return res
    }

    check_nb_args_no_kw('dir', 1, arguments)

    var klass = obj.__class__ || $B.get_class(obj)

    if(obj.$is_class){
        // Use metaclass __dir__
        var dir_func = $B.$getattr(obj.__class__, "__dir__")
        return $B.$call(dir_func)(obj)
    }
    try{
        var res = $B.$call($B.$getattr(obj, '__dir__'))()
        res = _b_.list.$factory(res)
        return res
    }catch (err){
        // ignore, default
        //console.log(err)
        console.log('error in dir', err.message)
    }

    var res = [],
        pos = 0
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
function divmod(x,y){
   check_nb_args_no_kw('divmod', 2, arguments)

   var klass = x.__class__ || $B.get_class(x)
   var dm = $B.$getattr(klass, "__divmod__", _b_.None)
   if(dm !== _b_.None){
       return dm(x, y)
   }
   return _b_.tuple.$factory([$B.$getattr(klass, '__floordiv__')(x, y),
       $B.$getattr(klass, '__mod__')(x, y)])
}

var enumerate = $B.make_class("enumerate",
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

enumerate.__iter__ = function(self){
    self.counter = self.start - 1
    return self
}

enumerate.__next__ = function(self){
    self.counter++
    return $B.fast_tuple([self.counter, next(self.iter)])
}

$B.set_func_names(enumerate, "builtins")

//eval() (built in function)
function $$eval(src, _globals, _locals){
    var $ = $B.args("eval", 4,
            {src: null, globals: null, locals: null, mode: null} ,
            ['src', 'globals', 'locals', 'mode', '/'],
            arguments, {globals: _b_.None, locals: _b_.None, mode: 'eval'},
            null, null),
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
    }

    $B.url2name[filename] = 'exec'

    var frame = $B.last($B.frames_stack)
    var lineno = frame.$lineno

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

    var local_name = 'locals_exec',
        global_name = 'globals_exec',
        exec_locals = {},
        exec_globals = {},
        __name__ = '<module>'

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
                exec_locals = $B.clone(frames[1])
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
            if(_globals.$jsobj){
                exec_globals = _globals.$jsobj
            }else{
                exec_globals = _globals.$jsobj = {}
            }
            for(var key in _globals.$string_dict){
                _globals.$jsobj[key] = _globals.$string_dict[key][0]
                if(key == '__name__'){
                    __name__ = _globals.$jsobj[key]
                }
            }
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
                for(var key in _locals.$jsobj){
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
                            if(prop == '$proxy'){
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

    var save_frames_stack = $B.frames_stack.slice()

    var _ast

    var frame = [__name__, exec_locals, __name__, exec_globals]
    frame.is_exec_top = true
    frame.__file__ = filename
    exec_locals.$f_trace = $B.enter_frame(frame)
    var _frames = $B.frames_stack.slice()
    frame.$lineno = 1

    if(src.__class__ === code){
        _ast = src._ast
        if(_ast.$js_ast){
            _ast = _ast.$js_ast
        }else{
            _ast = $B.ast_py_to_js(_ast)
        }
    }

    try{
        if($B.parser_to_ast){
            if(! _ast){
                _ast = new $B.Parser(src, filename).parse(mode == 'eval' ? 'eval' : 'file')
            }
        }else{
            if(! _ast){
                var root = $B.parser.$create_root_node(src, '<module>', frame[0], frame[2],
                        1)
                root.mode = mode
                root.filename = filename
                $B.parser.dispatch_tokens(root)
                _ast = root.ast()
            }
        }
        var future = $B.future_features(_ast, filename),
            symtable = $B._PySymtable_Build(_ast, filename, future),
            js_obj = $B.js_from_root({ast: _ast,
                                      symtable,
                                      filename,
                                      namespaces: {local_name,
                                                   exec_locals,
                                                   global_name,
                                                   exec_globals}
                                      }),
            js = js_obj.js
    }catch(err){
        if(err.args){
            if(err.args[1]){
                var lineno = err.args[1][1]
                exec_locals.$lineno = lineno
            }
        }else{
            console.log('JS Error', err.message)
        }
        $B.frames_stack = save_frames_stack
        throw err
    }

    if(mode == 'eval'){
        js = 'return ' + js
    }else if(src.single_expression){
        js = `var result = ${js}\n` +
             `if(result !== _b_.None){\n` +
                 `_b_.print(result)\n` +
             `}`
    }

    try{
        var exec_func = new Function('$B', '_b_', 'locals',
                                     local_name, global_name,
                                     'frame', '_frames', js)
    }catch(err){
        if(true){ //$B.debug > 1){
            console.log('eval() error\n', $B.format_indent(js, 0))
            console.log('-- python source\n', src)
        }
        throw err
    }

    try{
        var res = exec_func($B, _b_, exec_locals,
                            exec_locals, exec_globals, frame, _frames)
    }catch(err){
        if($B.debug > 2){
            console.log(
                'Python code\n', src,
                '\ninitial stack before exec', save_frames_stack.slice(),
                '\nstack', $B.frames_stack.slice(),
                '\nexec func', $B.format_indent(exec_func + '', 0),
                '\n    filename', filename,
                '\n    name from filename', $B.url2name[filename],
                '\n    local_name', local_name,
                '\n    exec_locals', exec_locals,
                '\n    global_name', global_name,
                '\n    exec_globals', exec_globals,
                '\n    frame', frame,
                '\n    _ast', _ast,
                '\n    js', js)
        }
        $B.frames_stack = save_frames_stack
        throw err
    }
    if(_globals !== _b_.None){
        for(var key in exec_globals){
            if(! key.startsWith('$')){
                _b_.dict.$setitem(_globals, key, exec_globals[key])
            }
        }
    }
    $B.frames_stack = save_frames_stack
    return res
}

$$eval.$is_func = true

function exec(src, globals, locals){
    var missing = {}
    var $ = $B.args("exec", 3, {src: null, globals: null, locals: null},
        ["src", "globals", "locals", "/"], arguments,
        {globals: _b_.None, locals: _b_.None}, null, null),
        src = $.src,
        globals = $.globals,
        locals = $.locals
    return $$eval(src, globals, locals, "exec") || _b_.None
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

function format(value, format_spec) {
    var $ = $B.args("format", 2, {value: null, format_spec: null},
        ["value", "format_spec"], arguments, {format_spec: ''}, null, null)
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

function getattr(){
    var missing = {}
    var $ = $B.args("getattr", 3, {obj: null, attr: null, _default: null},
        ["obj", "attr", "_default"], arguments, {_default: missing},
        null, null)
    if(! isinstance($.attr, _b_.str)){
        throw _b_.TypeError.$factory("attribute name must be string, " +
            `not '${$B.class_name($.attr)}'`)
    }

    return $B.$getattr($.obj, _b_.str.$to_string($.attr),
        $._default === missing ? undefined : $._default)
}

function in_mro(klass, attr){
    if(klass === undefined){return false}
    if(klass.hasOwnProperty(attr)){return klass[attr]}
    var mro = klass.__mro__
    for(var i = 0, len = mro.length; i < len; i++){
        if(mro[i].hasOwnProperty(attr)){
            return mro[i][attr]
        }
    }
    return false
}

$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments
    var res
    if(obj === undefined){
        console.log('attr', attr, 'of obj undef')
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

    var $test = false // attr == "children" // && obj === _b_.list // "Point"
    if($test){
        console.log("$getattr", attr, '\nobj', obj, '\nklass', klass)
        alert()
    }

    // Shortcut for classes without parents
    if(klass !== undefined && (! klass.$native) && klass.__bases__ &&
            klass.__getattribute__ === undefined &&
            (klass.__bases__.length == 0 ||
                (klass.__bases__.length == 1 &&
                 klass.__bases__[0] === _b_.object))){
        if($test){
            console.log("class without parent", klass)
            console.log('\nobj[attr]', obj[attr])
        }
        if(obj[attr] !== undefined){
            if(attr == "__class__" && obj.__class__.__dict__ &&
                    obj.__class__.__dict__.$string_dict.__class__){
                // special case : the objects' class has an explicit attribute
                // __class__ (eg NonCallableMock in unittest.mock...)
            }else{
                return obj[attr]
            }
        }else if(obj.__dict__ &&
                obj.__dict__.$string_dict.hasOwnProperty(attr) &&
                ! (klass.hasOwnProperty(attr) &&
                   klass[attr].__get__)){
            return obj.__dict__.$string_dict[attr][0]
        }else if(klass.hasOwnProperty(attr)){
            if($test){
                console.log('class has attr', attr, klass[attr])
            }
            if(typeof klass[attr] != "function" &&
                    attr != "__dict__" &&
                    klass[attr].__get__ === undefined){
                var kl = klass[attr].__class__
                if(! in_mro(kl, "__get__")){
                    return klass[attr]
                }
            }
        }
    }

    if($test){console.log("attr", attr, "of", obj, "class", klass, "isclass", is_class)}
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
                    return f
                }else{
                    return $B.$JS2Py(res)
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
              var klass_from_dict
              if(klass.__dict__.$string_dict){
                  if(klass.__dict__.$string_dict.__class__){
                      klass_from_dict = klass.__dict__.$string_dict.__class__[0]
                  }
              }
              if(klass_from_dict !== undefined){
                  if(klass_from_dict.$is_property){
                      return klass_from_dict.fget(obj)
                  }
                  return klass_from_dict
              }
          }
          return klass
      case '__dict__':
          if(is_class){
              var dict = {}
              if(obj.__dict__){
                  for(var key in obj.__dict__.$string_dict){
                      dict[key] = obj.__dict__.$string_dict[key][0]
                  }
              }else{
                  for(var key in obj){
                      if(! key.startsWith("$")){
                          dict[key] = obj[key]
                      }
                  }
              }
              dict.__dict__ = $B.getset_descriptor.$factory(obj, '__dict__')
              return {
                  __class__: $B.mappingproxy, // in py_dict.js
                  $jsobj: dict,
                  $version: 0
                  }
          }else if(! klass.$native){
              if(obj[attr] !== undefined){
                  return obj[attr]
              }else if(obj.$infos){
                  if(obj.$infos.hasOwnProperty("__dict__")){
                      return obj.$infos.__dict__
                  }else if(obj.$infos.hasOwnProperty("__func__")){
                      return obj.$infos.__func__.$infos.__dict__
                  }
              }
              return $B.obj_dict(obj,
                  function(attr){
                      return ['__class__'].indexOf(attr) > -1
                  }
              )
          }
      case '__mro__':
          if(obj.$is_class){
              // The attribute __mro__ of class objects doesn't include the
              // class itself
              return _b_.tuple.$factory([obj].concat(obj.__mro__))
          }else if(obj.__dict__ &&
                  obj.__dict__.$string_dict.__mro__ !== undefined){
              return obj.__dict__.$string_dict.__mro__
          }
          // stop search here, looking in the objects's class would return
          // the classe's __mro__
          throw $B.attr_error(attr, obj)
      case '__subclasses__':
          if(klass.$factory || klass.$is_class){
              var subclasses = obj.$subclasses || []
              return function(){return subclasses}
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

        if($test){console.log("native class", klass, klass[attr])}
        if(attr == "__doc__" && klass[attr] === undefined && klass.$infos){
            _get_builtins_doc()
            klass[attr] = $B.builtins_doc[klass.$infos.__name__]
        }
        if(klass[attr] === undefined){
            var object_attr = _b_.object[attr]
            if($test){console.log("object attr", object_attr)}
            if(object_attr !== undefined){
                klass[attr] = object_attr
            }else{
                if($test){console.log("obj[attr]", obj[attr])}
                var attrs = obj.__dict__
                if(attrs &&
                        (object_attr = attrs.$string_dict[attr]) !== undefined){
                    return object_attr[0]
                }
                if(_default === undefined){
                    throw $B.attr_error(attr, obj)
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

            var self = klass[attr].__class__ == $B.method ? klass : obj,
                method = klass[attr].bind(null, self)
            method.__class__ = $B.method
            method.$infos = {
                __func__: func,
                __name__: attr,
                __self__: self,
                __qualname__: klass.$infos.__name__ + "." + attr
            }
            if(typeof obj == "object"){
                // Optimization : set attribute __class__ and store method
                // as attribute of obj.$method_cache
                obj.__class__ = klass
                obj.$method_cache = obj.$method_cache || {}
                obj.$method_cache[attr] = method
            }
            return method
        }else if(klass[attr].__class__ === _b_.classmethod){
            return _b_.classmethod.__get__(klass[attr], obj, klass)
        }else if(klass[attr] !== undefined){
            return klass[attr]
        }
        attr_error(rawname, klass)
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
    var odga = _b_.object.__getattribute__
    if($test){
        console.log("attr_func is odga ?", attr_func,
            attr_func === odga, '\n', attr_func + '', 
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
                return property.__get__(res)
            }
            // Cf. issue 1081
            if(res.__set__ === undefined || res.$is_class){
                if($test){console.log("return", res, res+'',
                    res.__set__, res.$is_class)}
                return res
            }
        }
    }

    try{
        res = attr_func(obj, attr)
        if($test){console.log("result of attr_func", res)}
    }catch(err){
        if($test){
            console.log('attr_func raised error', err.args)
        }
        var getattr
        if(klass === $B.module){
            // try __getattr__ at module level (PEP 562)
            getattr = obj.__getattr__
            if(getattr){
                try{
                    return getattr(attr)
                }catch(err){
                    if(_default !== undefined){
                        return _default
                    }
                    throw err
                }
            }
        }
        var getattr = in_mro(klass, '__getattr__')
        if(getattr){
            if($test){
                console.log('try with getattr', getattr)
            }
            try{
                if(false && klass === $B.module){
                    res = getattr(attr)
                }else{
                    res = getattr(obj, attr)
                }
                return res
            }catch(err){
                if(_default !== undefined){
                    return _default
                }
                throw err
            }
        }
        if(_default !== undefined){
            return _default
        }
        throw err
    }

    if(res !== undefined){return res}
    if(_default !== undefined){return _default}

    var cname = klass.$infos.__name__
    if(is_class){cname = obj.$infos.__name__}

    attr_error(rawname, is_class ? obj : klass)
}

//globals() (built in function)

function globals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args_no_kw('globals', 0, arguments)
    var res = $B.obj_dict($B.last($B.frames_stack)[3])
    res.$jsobj.__BRYTHON__ = $B.JSObj.$factory($B) // issue 1181
    res.$is_namespace = true
    return res
}

function hasattr(obj,attr){
    check_nb_args_no_kw('hasattr', 2, arguments)
    try{
        $B.$getattr(obj,attr)
        return true
    }catch(err){
        return false
    }
}

var hash_cache = {} // for strings
function hash(obj){
    check_nb_args_no_kw('hash', 1, arguments)

    if(obj.__hashvalue__ !== undefined){
        return obj.__hashvalue__
    }
    if(isinstance(obj, _b_.bool)){
        return _b_.int.$factory(obj)
    }

    if(obj.$is_class ||
            obj.__class__ === _b_.type ||
            obj.__class__ === $B.Function){
        return obj.__hashvalue__ = $B.$py_next_hash--
    }
    if(typeof obj == "string"){
        var cached = hash_cache[obj]
        if(cached !== undefined){return cached}
        else{
            return hash_cache[obj] = _b_.str.__hash__(obj)
        }
    }
    // Implicit invocation of special methods uses object class, even if
    // obj has an attribute __hash__
    var klass = obj.__class__ || $B.get_class(obj)
    if(klass === undefined){
        throw _b_.TypeError.$factory("unhashable type: '" +
                _b_.str.$factory($B.JSObj.$factory(obj)) + "'")
    }

    var hash_method = $B.$getattr(klass, '__hash__', _b_.None)

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

    if(hash_method.$infos.__func__ === _b_.object.__hash__){
        if($B.$getattr(obj, '__eq__').$infos.__func__ !== _b_.object.__eq__){
            throw _b_.TypeError.$factory("unhashable type: '" +
                $B.class_name(obj) + "'", 'hash')
        }else{
            return obj.__hashvalue__ = _b_.object.__hash__(obj)
        }
    }else{
        return $B.$call(hash_method)(obj)
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
        // builtins_docstrings defines an objet "docs"
        for(var key in docs){
            if(_b_[key]){
                _b_[key].__doc__ = docs[key]
            }
        }
        $B.builtins_doc = docs
    }
}

function help(obj){
    if(obj === undefined){obj = 'help'}

    if(typeof obj == 'string'){
        var lib_url = 'https://docs.python.org/3/library',
            ref_url = 'https://docs.python.org/3/reference'
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

function hex(obj){
    check_nb_args_no_kw('hex', 1, arguments)
    return bin_hex_oct(16, obj)
}

function id(obj){
   check_nb_args_no_kw('id', 1, arguments)
   if(isinstance(obj, [_b_.str, _b_.int, _b_.float]) &&
           !isinstance(obj, $B.long_int)){
       return $B.$getattr(_b_.str.$factory(obj), '__hash__')()
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

// not a direct alias of prompt: input has no default value
function input(msg) {
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

function isinstance(obj, cls){
    check_nb_args_no_kw('isinstance', 2, arguments)

    if(obj === null){
        return cls === None
    }
    if(obj === undefined){
        return false
    }
    if(Array.isArray(cls)){
        for(var kls of cls){
            if(isinstance(obj, kls)){
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

    if(cls === _b_.int && (obj === True || obj === False)){return True}

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
            if(cls == _b_.str){return true}
            else if($B.builtin_classes.indexOf(cls) > -1){
                return false
            }
        }else if(typeof obj == 'number' && Number.isFinite(obj)){
            if(Number.isFinite(obj) && cls == _b_.int){return true}
        }
        klass = $B.get_class(obj)
    }
    if(klass === undefined){return false}

    // Return true if one of the parents of obj class is cls
    // If one of the parents is the class used to inherit from str, obj is an
    // instance of str ; same for list

    function check(kl, cls){
        if(kl === cls){return true}
        else if(cls === _b_.str && kl === $B.StringSubclass){return true}
        else if(cls === _b_.int && kl === $B.IntSubclass){return true}
    }
    if(check(klass, cls)){return true}
    var mro = klass.__mro__
    for(var i = 0; i < mro.length; i++){
       if(check(mro[i], cls)){
           return true
       }
    }

    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = $B.$getattr(cls.__class__ || $B.get_class(cls),
        '__instancecheck__', _b_.None)
    if(instancecheck !== _b_.None){
        return instancecheck(cls, obj)
    }
    return false
}

function issubclass(klass, classinfo){
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
    if(isinstance(classinfo, _b_.tuple)){
        for(var i = 0; i < classinfo.length; i++){
           if(issubclass(klass, classinfo[i])){return true}
        }
        return false
    }
    if(classinfo.__class__ === $B.GenericAlias){
        throw _b_.TypeError.$factory(
            'issubclass() arg 2 cannot be a parameterized generic')
    }

    if(classinfo.$factory || classinfo.$is_class){
        if(klass === classinfo ||
                mro.indexOf(classinfo) > -1){
            return true
        }
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

$B.set_func_names(iterator_class, "builtins")

callable_iterator = $B.make_class("callable_iterator",
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
                        ln = len(obj)
                    return iterator_class.$factory(gi, len)
                }catch(err){
                    throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
                        "' object is not iterable")
                }
            }
            throw err
        }
        var res = $B.$call(_iter)(obj)
        try{$B.$getattr(res, '__next__')}
        catch(err){
            if(isinstance(err, _b_.AttributeError)){
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

function iter(){
    // Function exposed to Brython programs, with arguments control
    var $ = $B.args('iter', 1, {obj: null}, ['obj'], arguments,
        {}, 'args', 'kw'),
        sentinel
    if($.args.length > 0){
        var sentinel = $.args[0]
    }
    return $B.$iter($.obj, sentinel)
}

function len(obj){
    check_nb_args_no_kw('len', 1, arguments)

    var klass = obj.__class__ || $B.get_class(obj)
    try{
        var method = $B.$getattr(klass, '__len__')
    }catch(err){
        throw _b_.TypeError.$factory("object of type '" +
            $B.class_name(obj) + "' has no len()")
    }
    return $B.$call(method)(obj)
}

function locals(){
    // The last item in __BRYTHON__.frames_stack is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('locals', 0, arguments)
    var res = $B.obj_dict($B.clone($B.last($B.frames_stack)[1]))
    res.$is_namespace = true
    delete res.$jsobj.__annotations__
    return res
}


var map = $B.make_class("map",
    function(){
        var $ = $B.args('map', 2, {func: null, it1:null}, ['func', 'it1'],
                arguments, {}, 'args', null),
            func = $B.$call($.func)
        var iter_args = [$.it1].concat($.args).map($B.next_of)
        var obj = {
            __class__: map,
            args: iter_args,
            func: func
        }
        return obj
    }
)

map.__iter__ = function (self){
    return self
}

map.__next__ = function(self){
    var args = []
    for(var next_of of self.args){
        args.push(next_of())
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
    for(var attr in $.kw.$string_dict){
        switch(attr){
            case 'key':
                func = $.kw.$string_dict[attr][0]
                break
            case 'default':
                var default_value = $.kw.$string_dict[attr][0]
                has_default = true
                break
            default:
                throw _b_.TypeError.$factory("'" + attr +
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
        var $iter = iter($.args[0]),
            res = null,
            x_value,
            extr_value
        while(true){
            try{
                var x = next($iter)
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
            }catch(err){
                if(err.__class__ == _b_.StopIteration){
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
                }
                throw err
            }
        }
    }else{
        if(has_default){
           throw _b_.TypeError.$factory("Cannot specify a default for " +
               $op_name + "() with multiple positional arguments")
        }
        if($B.last(args).$nat){
            var _args = [$.args].concat($B.last(args))
        }else{
            var _args = [$.args]
        }
        return $extreme.call(null, _args, op)
    }
}

function max(){
    return $extreme(arguments, '__gt__')
}

var memoryview = $B.make_class('memoryview',
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

memoryview.__eq__ = function(self, other){
    if(other.__class__ !== memoryview){return false}
    return $B.$getattr(self.obj, '__eq__')(other.obj)
}

memoryview.__getitem__ = function(self, key){
    if(isinstance(key, _b_.int)){
        var start = key * self.itemsize
        if(self.format == "I"){
            var res = self.obj.source[start],
                coef = 256
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
    var res = self.obj.__class__.__getitem__(self.obj, key)
    if(key.__class__ === _b_.slice){return memoryview.$factory(res)}
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

memoryview.cast = function(self, format){
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

function min(){
    return $extreme(arguments, '__lt__')
}

function next(obj){
    check_no_kw('next', obj)
    var missing = {},
        $ = $B.args("next", 2, {obj: null, def: null}, ['obj', 'def'],
            arguments, {def: missing}, null, null)
    if(obj[Symbol.iterator]){
        // JS iterator, used internally for speed
        var next = obj.next()
        if(next.done){
            throw _b_.StopIteration.$factory('')
        }
        return next.value
    }
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

var NotImplementedType = $B.make_class("NotImplementedType",
    function(){return NotImplemented}
)
NotImplementedType.__repr__ = NotImplementedType.__str__ = function(self){
    return "NotImplemented"
}
$B.set_func_names(NotImplementedType, "builtins")

var NotImplemented = {
    __class__: NotImplementedType
}

function $not(obj){return !$B.$bool(obj)}

function oct(obj){
    check_nb_args_no_kw('oct', 1, arguments)
    return bin_hex_oct(8, obj)
}

function ord(c){
    check_nb_args_no_kw('ord', 1, arguments)
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    if(typeof c.valueOf() == 'string'){
        if(c.length == 1){
            return c.charCodeAt(0)
        }
        if((0xD800 <= c[0] && c[0] <= 0xDBFF) ||
                (0xDC00 <= c[1] && c[1] <= 0xDFFF)){
            throw _b_.TypeError.$factory('ord() expected a character, but ' +
                'string of length ' + c.length + ' found')
        }
        var code = 0x10000
        code += (c.charCodeAt(0) & 0x03FF) << 10
        code += (c.charCodeAt(1) & 0x03FF)
        return code
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

function pow() {
    var $ = $B.args('pow', 3, {x: null, y: null, mod: null},['x', 'y', 'mod'],
        arguments, {mod: None}, null, null),
        x = $.x,
        y = $.y,
        z = $.mod
    var klass = x.__class__ || $B.get_class(x)
    if(z === _b_.None){
        return $B.rich_op('__pow__', x, y)
    }else{
        if(x != _b_.int.$factory(x) || y != _b_.int.$factory(y)){
            throw _b_.TypeError.$factory("pow() 3rd argument not allowed " +
                "unless all arguments are integers")
        }
        return $B.$call($B.$getattr(klass, '__pow__'))(x, y, z)
    }
}

function $print(){
    var $ns = $B.args('print', 0, {}, [], arguments,
        {}, 'args', 'kw')
    var ks = $ns['kw'].$string_dict
    var end = (ks['end'] === undefined || ks['end'] === None) ? '\n' : ks['end'][0],
        sep = (ks['sep'] === undefined || ks['sep'] === None) ? ' ' : ks['sep'][0],
        file = ks['file'] === undefined ? $B.stdout : ks['file'][0],
        args = $ns['args'],
        writer = $B.$getattr(file, 'write')
    var items = []
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

// property (built in function)
var property = $B.make_class("property",
    function(fget, fset, fdel, doc){
        var res = {
            __class__: property
        }
        property.__init__(res, fget, fset, fdel, doc)
        return res
    }
)

property.__init__ = function(self, fget, fset, fdel, doc) {

    var $ = $B.args('__init__', 5,
                {self: null, fget: null, fset: null, fdel: null, doc: null},
                ['self', 'fget', 'fset', 'fdel', 'doc'], arguments,
                {fget: _b_.None, fset: _b_.None, fdel: _b_.None, doc: _b_.None},
                null, null),
        self = $.self,
        fget = $.fget,
        fset = $.fset,
        fdel = $.fdel,
        doc = $.doc
    self.__doc__ = doc || ""
    self.$type = fget.$type
    self.fget = fget
    self.fset = fset
    self.fdel = fdel
    self.$is_property = true

    if(fget && fget.$attrs){
        for(var key in fget.$attrs){
            self[key] = fget.$attrs[key]
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

property.__get__ = function(self, obj) {
    if(self.fget === undefined){
        throw _b_.AttributeError.$factory("unreadable attribute")
    }
    return $B.$call(self.fget)(obj)
}

property.__set__ = function(self, obj, value){
    if(self.fset === undefined){
        throw _b_.AttributeError.$factory("can't set attribute")
    }
    $B.$getattr(self.fset, '__call__')(obj, value)
}

$B.set_func_names(property, "builtins")

function quit(){
    throw _b_.SystemExit
}

quit.__repr__ = quit.__str__ = function(){
    return "Use quit() or Ctrl-Z plus Return to exit"
}

function repr(obj){
    check_nb_args_no_kw('repr', 1, arguments)

    var klass = obj.__class__ || $B.get_class(obj)
    return $B.$call($B.$getattr(klass, "__repr__"))(obj)
}

var reversed = $B.make_class("reversed",
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

function round(){
    var $ = $B.args('round', 2, {number: null, ndigits: null},
        ['number', 'ndigits'], arguments, {ndigits: None}, null, null),
        arg = $.number,
        n = $.ndigits === None ? 0 : $.ndigits

    if(! isinstance(arg,[_b_.int, _b_.float])){
        var klass = arg.__class__ || $B.get_class(arg)
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

    if(! isinstance(n, _b_.int)){
        throw _b_.TypeError.$factory("'" + $B.class_name(n) +
            "' object cannot be interpreted as an integer")
    }

    var klass = $B.get_class(arg)

    if(isinstance(arg, _b_.float)){
        arg = _b_.float.$float_value(arg)
        if(arg.value === Infinity || arg.value === -Infinity){
            throw _b_.OverflowError.$factory(
                "cannot convert float infinity to integer")
        }else if(isNaN(arg.value)){
            throw _b_.ValueError.$factory(
                "cannot convert float NaN to integer")
        }
        var res = _b_.float.$round(arg, n)
        return $.ndigits === None ? res : klass.$factory(res)
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
    if(obj === undefined){
        console.log('obj undef', attr, value)
    }
    // Used in the code generated by py2js. Avoids having to parse the
    // since we know we will get the 3 values
    var $test = false // attr === "x" // && value == "my doc."
    if(attr == '__dict__'){
        // set attribute __dict__
        // remove previous attributes
        if(! isinstance(value, _b_.dict)){
            throw _b_.TypeError.$factory("__dict__ must be set to a dictionary, " +
                "not a '" + $B.class_name(value) + "'")
        }
        if(obj.$infos){
            obj.$infos.__dict__ = value
            return None
        }
        obj.__dict__ = value
        return None
    }else if(attr == "__class__"){
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
    }else if(attr == "__doc__" && obj.__class__ === _b_.property){
        obj[attr] = value
    }
    if($test){console.log("set attr", attr, "to", obj)}
    if(obj.$factory || obj.$is_class){
        var metaclass = obj.__class__
        if($test){console.log("obj is class", metaclass, metaclass[attr])}
        if(metaclass && metaclass[attr] && metaclass[attr].__get__ &&
                metaclass[attr].__set__){
            metaclass[attr].__set__(obj, value)
            return None
        }
        if(attr == "__module__"){
            obj.$infos.__module__ = value
            return _b_.None
        }
        if(obj.$infos && obj.$infos.__module__ == "builtins"){
            throw _b_.TypeError.$factory(
                `cannot set '${attr}' attribute of immutable type '` +
                    obj.$infos.__name__ + "'")
        }
        obj[attr] = value
        if(attr == "__init__" || attr == "__new__"){
            // redefine the function that creates instances of the class
            obj.$factory = $B.$instance_creator(obj)
        }else if(attr == "__bases__"){
            // redefine mro
            obj.__mro__ = _b_.type.mro(obj)
        }
        if($test){console.log("after setattr", obj)}
        return None
    }

    var res = obj[attr],
        klass = obj.__class__ || $B.get_class(obj)

    if($test){
        console.log('set attr', attr, 'of obj', obj, 'class', klass,
            "obj[attr]", obj[attr])
    }

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

    if($test){
        console.log('set attr', attr, 'klass', klass, 'found in class', res)
    }

    if(res !== undefined && res !== null){
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
    var _setattr = false
    if(klass !== undefined){
        _setattr = klass.__setattr__
        if(_setattr === undefined){
            var mro = klass.__mro__
            for(var i = 0, _len = mro.length - 1; i < _len; i++){
                _setattr = mro[i].__setattr__
                if(_setattr){break}
            }
        }
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
                                return "_" + klass.$infos.__name__ + item
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
                for(var i = 0; i < klass.__mro__.length; i++){
                    var kl = klass.__mro__[i]
                    if(mangled_slots(kl).indexOf(attr) > - 1){
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
        if(obj.__dict__ === undefined){
            obj[attr] = value
        }else{
            _b_.dict.$setitem(obj.__dict__, attr, value)
        }
        if($test){
            console.log("no setattr, obj", obj)
        }
    }else{
        if($test){
            console.log('apply _setattr', obj, attr)
        }
        _setattr(obj, attr, value)
    }

    return None
}

function sorted(){
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
    function(func){
        return {
            __class__: staticmethod,
            __func__: func
        }
    }
)

staticmethod.__call__ = function(self){
    return $B.$call(self.__func__)
}

staticmethod.__get__ = function(self){
    return self.__func__
}


$B.set_func_names(staticmethod, "builtins")

// str() defined in py_string.js

function sum(iterable, start){
    var $ = $B.args('sum', 2, {iterable: null, start: null},
        ['iterable', 'start'], arguments, {start: 0}, null, null),
        iterable = $.iterable,
        start = $.start

    if(_b_.isinstance(start, [_b_.str, _b_.bytes])){
        throw _b_.TypeError.$factory("sum() can't sum bytes" +
            " [use b''.join(seq) instead]")
    }

    var res = start,
        iterable = iter(iterable)
    while(1){
        try{
            var _item = next(iterable)
            res = $B.add(res, _item)
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

// super() built in function
$B.missing_super2 = function(obj){
    obj.$missing = true
    return obj
}

var $$super = $B.make_class("super",
    function (_type, object_or_type){
        var no_object_or_type = object_or_type === undefined
        if(_type === undefined && object_or_type === undefined){
            var frame = $B.last($B.frames_stack),
                pyframe = $B.imported["_sys"].Getframe(),
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
            }else if(_b_.isinstance(object_or_type, _type)){
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

$$super.__get__ = function(self, instance, klass){
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

    var $test = false // attr == "a"

    var f
    for(var klass of search_classes){
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
        var module,
            qualname
        if(f.$infos !== undefined){
            module = f.$infos.__module__
        }else if(f.__class__ === property){
            module = f.fget.$infos.__module
        }else if(f.$is_class){
            module = f.__module__
        }
        method.$infos = {
            __self__: self.__self_class__,
            __func__: f,
            __name__: attr,
            __module__: module,
            __qualname__: klass.$infos.__name__ + "." + attr
        }
        return method
    }

    throw $B.attr_error(attr, self)
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
    var res = "<super: <class '" + self.__thisclass__.$infos.__name__ + "'>"
    if(self.__self_class__ !== undefined){
        res += ', <' + self.__self_class__.__class__.$infos.__name__ + ' object>'
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
        try{return $B.$getattr($.obj, '__dict__')}
        catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("vars() argument must have __dict__ attribute")
            }
            throw err
        }
    }
}

var $Reader = $B.make_class("Reader")

$Reader.__enter__ = function(self){
    return self
}

$Reader.__exit__ = function(self){
    return false
}

$Reader.__init__ = function(_self, initial_value='', newline='\n'){
    _self.$content = initial_value
    _self.$counter = 0
}

$Reader.__iter__ = function(self){
    // Iteration ignores last empty lines (issue #1059)
    return iter($Reader.readlines(self))
}

$Reader.__len__ = function(self){
    return self.lines.length
}

$Reader.__new__ = function(cls){
    return {
        __class__: cls
    }
}

$Reader.close = function(self){
    self.closed = true
}

$Reader.flush = function(self){
    return None
}

$Reader.read = function(){
    var $ = $B.args("read", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            self = $.self,
            size = $B.$GetInt($.size)
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    if(size < 0){
        size = self.$length - self.$counter
    }
    var content = self.$content
    if(self.$binary){
        res = _b_.bytes.$factory(self.$content.source.slice(self.$counter,
            self.$counter + size))
    }else{
        res = self.$content.substr(self.$counter, size)
    }
    self.$counter += size
    return res
}

$Reader.readable = function(self){
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
                source = self.$content.source
            while(pos < self.$length){
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

$Reader.readline = function(self, size){
    var $ = $B.args("readline", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            self = $.self,
            size = $B.$GetInt($.size)
    // set line counter
    self.$lc = self.$lc === undefined ? -1 : self.$lc

    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }

    //make_content(self)
    if(self.$binary){
        var ix = self.$content.source.indexOf(10, self.$counter)
        if(ix == -1){
            var rest = self.$content.source.slice(self.$counter)
            self.$counter = self.$content.source.length
            return _b_.bytes.$factory(rest)
        }else{
            var res = {
                __class__: _b_.bytes,
                source : self.$content.source.slice(self.$counter,
                    ix + 1)
            }
            self.$counter = ix + 1
            return res
        }
    }else{
        if(self.$counter == self.$content.length){
            return ''
        }
        var ix = self.$content.indexOf("\n", self.$counter)
        if(ix == -1){
            var rest = self.$content.substr(self.$counter)
            self.$counter = self.$content.length
            return rest
        }else{
            var res = self.$content.substring(self.$counter, ix + 1)
            self.$counter = ix + 1
            self.$lc += 1
            return res
        }
    }
}

$Reader.readlines = function(){
    var $ = $B.args("readlines", 2, {self: null, hint: null},
            ["self", "hint"], arguments, {hint: -1}, null, null),
            self = $.self,
            hint = $B.$GetInt($.hint)
    var nb_read = 0
    if(self.closed === true){
        throw _b_.ValueError.$factory('I/O operation on closed file')
    }
    self.$lc = self.$lc === undefined ? -1 : self.$lc
    make_lines(self)

    if(hint < 0){
        var lines = self.$lines.slice(self.$lc + 1)
    }else{
        var lines = []
        while(self.$lc < self.$lines.length &&
                nb_read < hint){
            self.$lc++
            lines.push(self.$lines[self.$lc])
        }
    }
    return lines
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
        self.$counter = self.$length + offset
    }
    return None
}

$Reader.seekable = function(self){
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
                ` not ${class_name(data)}`)
        }
        _self.$content += data
    }else{
        if(! _b_.isinstance(data, [_b_.bytes, _b_.bytearray])){
            throw _b_.TypeError.$factory('write() argument must be bytes,' +
                ` not ${class_name(data)}`)
        }
        _self.$content.source = _self.$content.source.concat(data.source)
    }
    $B.file_cache[_self.name] = _self.$content
}

$Reader.writable = function(self){
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
            $content: _b_.bytes.decode($.buffer.$content, $.encoding),
            encoding: $.encoding,
            errors: $.errors,
            newline: $.newline
        }
    }
)

$TextIOWrapper.__mro__ = [$Reader, _b_.object]

$B.set_func_names($TextIOWrapper, "builtins")

$B.Reader = $Reader
$B.TextIOWrapper = $TextIOWrapper
$B.BufferedReader = $BufferedReader

function $url_open(){
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
        var res = {
            $binary: is_binary,
            $content: is_binary ? _b_.bytes.$factory() : '',
            $encoding: encoding,
            closed: False,
            mode,
            name: file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        $B.file_cache[file] = res.$content
        return res
        // throw _b_.IOError.$factory("Browsers cannot write on disk")
    }else if(['r', 'rb'].indexOf(mode) == -1){
        throw _b_.ValueError.$factory("Invalid mode '" + mode + "'")
    }
    if(isinstance(file, _b_.str)){
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
                    for(var i = 0, len = this.response.length; i < len; i++){
                        var cp = this.response.codePointAt(i)
                        if(cp > 0xf700){
                            cp -= 0xf700
                        }
                        bytes.push(cp)
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
            var fake_qs = $B.$options.cache ? '' :
                              '?foo=' + (new Date().getTime())
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

var zip = $B.make_class("zip",
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
            strict = $ns.kw.$string_dict.strict &&
                $ns.kw.$string_dict.strict[0]
        var nexts = [],
            only_lists = true,
            min_len

        for(var i = 0; i < _args.length; i++){
            if(only_lists && Array.isArray(_args[i])){
                if(strict){
                    if(i == 0){
                        var len = _args[i].length
                    }else if(_args[i] != len){
                        throw _b_.ValueError.$factory(`zip() argument ${i} ` +
                            `is ${_args[i] > len ? 'longer' : 'shorter'} ` +
                            `than argument ${i - 1}`)
                    }
                }
                if(min_len === undefined || _args[i].length < min_len){
                    min_len = _args[i].length
                }
            }else{
                only_lists = false
            }
        }

        var rank = 0,
            items = []
        if(only_lists){
            for(var i = 0; i < min_len; i++){
                var line = []
                for(var _arg of _args){
                    line.push(_arg[i])
                }
                items.push($B.fast_tuple(line))
            }
            res.items = items
            var zip_it = {
                __class__: zip,
                counter: -1,
                items,
                last: items.length,
                [Symbol.iterator](){
                    return this
                },
                next(){
                    this.counter++
                    if(this.counter == this.last){
                        return {done: true, value: null}
                    }
                    var line = $B.fast_tuple(this.items[this.counter])
                    return {done: false, value: line}
                }
            }
            return zip_it

            //return zip_iterator.$factory(items)
        }
        var args = _args.map($B.next_of)
        function* iterator(args){
            while(true){
                var line = [],
                    flag = true
                for(var i = 0; i < args.length; i++){
                    try{
                        line.push(args[i]())
                    }catch(err){
                        if(err.__class__ == _b_.StopIteration){
                            if(strict){
                                if(i > 0){
                                    throw _b_.ValueError.$factory(
                                        `zip() argument ${i + 1} is shorter ` +
                                        `than argument ${i}`)
                                }else{
                                    for(var j = 1; j < args.length; j++){
                                        var exhausted = true
                                        try{
                                            args[j]()
                                            exhausted = false
                                        }catch(err){
                                        }
                                        if(! exhausted){
                                            throw _b_.ValueError.$factory(
                                                `zip() argument ${j + 1} is longer ` +
                                                `than argument ${i + 1}`)
                                        }
                                    }
                                }
                            }
                            flag = false
                            break
                        }else{
                            throw err
                        }
                    }
                }
                if(! flag){
                    return
                }
                yield $B.fast_tuple(line)
            }
        }
        return $B.generator.$factory(iterator, 'zip')(args)
    }
)

var zip_iterator = $B.make_iterator_class('zip')

zip.__iter__ = function(self){
    return zip_iterator.$factory(self.items)
}

$B.set_func_names(zip, "builtins")

// built-in constants : True, False, None

function no_set_attr(klass, attr){
    if(klass[attr] !== undefined){
        throw _b_.AttributeError.$factory("'" + klass.$infos.__name__ +
            "' object attribute '" + attr + "' is read-only")
    }else{
        throw $B.attr_error(attr, klass)
    }
}

// True and False are the same as Javascript true and false

var True = true
var False = false

var ellipsis = $B.make_class("ellipsis",
    function(){return Ellipsis}
)
ellipsis.__repr__ = function(self){
    return 'Ellipsis'
}
var Ellipsis = {__class__: ellipsis}

for(var $key in $B.$comps){ // Ellipsis is not orderable with any type
    switch($B.$comps[$key]) {
      case 'ge':
      case 'gt':
      case 'le':
      case 'lt':
        ellipsis['__' + $B.$comps[$key] + '__'] = (function(k){
            return function(other){
                throw _b_.TypeError.$factory("unorderable types: ellipsis() " +
                    k + " " + $B.class_name(other))
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
    __mro__: [_b_.object],
    $infos: {
        __name__: 'function',
        __module__: "builtins"
    },
    $is_class: true
}

$B.Function.__delattr__ = function(self, attr){
    if(attr == "__dict__"){
        throw _b_.TypeError.$factory("can't deleted function __dict__")
    }
}

$B.Function.__dir__ = function(self){
    var infos = self.$infos || {},
        attrs = self.$attrs || {}

    return Object.keys(infos).
               concat(Object.keys(attrs)).
               filter(x => !x.startsWith('$'))
}

$B.Function.__eq__ = function(self, other){
    return self === other
}

$B.Function.__get__ = function(self, obj){
    // adapated from
    // https://docs.python.org/3/howto/descriptor.html#functions-and-methods
    if(obj === _b_.None){
        return self
    }
    return $B.method.$factory(self, obj)
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
        }else if(self.$infos.hasOwnProperty(attr)){
            return self.$infos[attr]
        }
    }else if(self.$infos && self.$infos.__dict__ &&
                self.$infos.__dict__.$string_dict[attr] !== undefined){
            return self.$infos.__dict__.$string_dict[attr][0]
    }else if(attr == "__closure__"){
        var free_vars = self.$infos.__code__.co_freevars
        if(free_vars.length == 0){
            return None
        }
        var cells = []
        for(var i = 0; i < free_vars.length; i++){
            try{
                cells.push($B.cell.$factory($B.$check_def_free(free_vars[i])))
            }catch(err){
                // empty cell
                cells.push($B.cell.$factory(None))
            }
        }
        return _b_.tuple.$factory(cells)
    }else if(attr == "__globals__"){
        return $B.obj_dict($B.imported[self.$infos.__module__])
    }else if(self.$attrs && self.$attrs[attr] !== undefined){
        return self.$attrs[attr]
    }else{
        return _b_.object.__getattribute__(self, attr)
    }
}

$B.Function.__repr__ = function(self){
    if(self.$infos === undefined){
        return '<function ' + self.name + '>'
    }else{
        return '<function ' + self.$infos.__qualname__ + '>'
    }
}

$B.Function.__mro__ = [_b_.object]
$B.Function.__setattr__ = function(self, attr, value){
    if(attr == "__closure__"){
        throw _b_.AttributeError.$factory("readonly attribute")
    }else if(attr == "__defaults__"){
        // Setting attribute __defaults__ requires making a new version of the
        // function, based on its attribute $set_defaults
        if(value === _b_.None){
            value = []
        }else if(! isinstance(value, _b_.tuple)){
            throw _b_.TypeError.$factory(
                "__defaults__ must be set to a tuple object")
        }
        var set_func = self.$set_defaults
        if(set_func === undefined){
            throw _b_.AttributeError.$factory("cannot set attribute " + attr +
                " of " + _b_.str.$factory(self))
        }
        if(self.$infos && self.$infos.__code__){
            // Make the new $defaults Javascript object
            var argcount = self.$infos.__code__.co_argcount,
                varnames = self.$infos.__code__.co_varnames,
                params = varnames.slice(0, argcount),
                $defaults = {}
            for(var i = value.length - 1; i >= 0; i--){
                var pos = params.length - value.length + i
                if(pos < 0){break}
                $defaults[params[pos]] = value[i]
            }
        }else{
            throw _b_.AttributeError.$factory("cannot set attribute " + attr +
                " of " + _b_.str.$factory(self))
        }
        var klass = self.$infos.$class // Defined if function is in a class
        var new_func = set_func($defaults)
        new_func.$set_defaults = set_func
        if(klass){
            klass[self.$infos.__name__] = new_func
            new_func.$infos.$class = klass
            new_func.$infos.__defaults__ = value
        }else{
            // Set attribute $defaults. Used in py_types.js / types.__new__
            self.$infos.$defaults = value
            self.$infos.__defaults__ = value
        }
        return _b_.None
    }
    if(self.$infos[attr] !== undefined){self.$infos[attr] = value}
    else{self.$attrs = self.$attrs || {}; self.$attrs[attr] = value}
}

$B.Function.$factory = function(){}

$B.set_func_names($B.Function, "builtins")

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

var builtin_function = $B.builtin_function = $B.make_class(
    "builtin_function_or_method", function(f){
        f.__class__ = builtin_function
        return f
    })

builtin_function.__getattribute__ = $B.Function.__getattribute__
builtin_function.__reduce_ex__ = builtin_function.__reduce__ = function(self){
    return self.$infos.__name__
}
builtin_function.__repr__ = builtin_function.__str__ = function(self){
    return '<built-in function ' + self.$infos.__name__ + '>'
}
$B.set_func_names(builtin_function, "builtins")

var method_wrapper = $B.make_class("method_wrapper")

method_wrapper.__repr__ = method_wrapper.__str__ = function(self){
    return "<method wrapper '" + self.$infos.__name__ + "' of function object>"
}
$B.set_func_names(method_wrapper, "builtins")

var wrapper_descriptor = $B.wrapper_descriptor =
    $B.make_class("wrapper_descriptor")

wrapper_descriptor.__getattribute__ = $B.Function.__getattribute__
wrapper_descriptor.__repr__ = wrapper_descriptor.__str__ = function(self){
    return "<slot wrapper '" + self.$infos.__name__ + "' of '" +
        self.__objclass__.$infos.__name__ +"' object>"
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
    if(name == 'super'){name1 = '$$super'}
    if(name == 'eval'){name1 = '$$eval'}
    if(name == 'print'){name1 = '$print'}
    try{
        _b_[name] = eval(name1)
        if($B.builtin_funcs.indexOf(orig_name) > -1){
            _b_[name].__class__ = builtin_function
            // used by inspect module
            _b_[name].$infos = {
                __module__: 'builtins',
                __name__: orig_name,
                __qualname__: orig_name
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
_b_['super'] = $$super

_b_.object.__init__.__class__ = wrapper_descriptor
_b_.object.__new__.__class__ = builtin_function


})(__BRYTHON__)
