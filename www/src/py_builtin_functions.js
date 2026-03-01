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

  var value = $B.PyNumber_Index(obj)

  if(value === undefined){
     // need to raise an error
     $B.RAISE(_b_.TypeError, 'Error, argument must be an integer or' +
         ' contains an __index__ function')
  }

  if(value >= 0){
      return prefix + value.toString(base)
  }
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
    $.ob_type = $B.code
    $.dict = $B.empty_dict()
    var infos = {
        co_flags: $.flags,
        co_name: "<module>",
        co_filename: $.filename
    }
    for(var key in infos){
        $[key] = infos[key]
    }
    var filename = $.filename
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
        first_line = $B.bytes_decode(first_line, 'latin-1')
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
            second_line = $B.bytes_decode(second_line, 'latin-1')
            mo = second_line.match(encoding_re)
            if(mo){
                encoding = mo[1]
            }
        }
        $.source = $B.bytes_decode($.source, encoding)
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

    if($B.$getattr($B.get_class($.source), '__module__') == 'ast'){
        // compile an ast instance
        var _validate = $B.module_getattr($B.imported._ast, '_validate')
        $B.$call(_validate, $.source)
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
        return $B.$call(deleter, obj, attr)
    }
    return _b_.object.tp_setattro(obj, attr, $B.NULL)
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

    if($B.is_type(obj)){
        // Use metaclass __dir__
        var dir_func = $B.$getattr($B.get_class(obj), "__dir__", $B.NULL)
        return $B.$call(dir_func, obj)
    }
    try{
        var dir_func = $B.$getattr(klass, '__dir__', $B.NULL)
        if(dir_func !== $B.NULL){
            let res = $B.$call($B.$getattr(klass, '__dir__'), obj)
            res = _b_.list.$factory(res)
            return res
        }
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

/* enumerate start */
_b_.enumerate.tp_iter = function(self){
    return self
}

_b_.enumerate.tp_iternext = function*(self){
    for(var item of self.it){
        var res = $B.fast_tuple([self.counter, item])
        self.counter++
        yield res
    }
}

_b_.enumerate.tp_new = function(cls, args, kw){
    var nb_kwargs = $B.str_dict_length(kw)
    var nb_args = args.length + nb_kwargs
    if(nb_args > 2){
        $B.RAISE(_b_.TypeError,
            `enumerate() takes at most 2 arguments (${nb_args} given)`
        )
    }
    var [iterable, start] = args
    $B.check_expected_keywords('enumerate', kw, ['iterable', 'start'])
    for(var entry of _b_.dict.$iter_items(kw)){
        switch(entry.key){
            case 'iterable':
                if(iterable !== undefined){
                    $B.RAISE(_b_.TypeError,
                        "enumerate() receives argument 'iterable' twice"
                    )
                }
                iterable = entry.value
                break
            case 'start':
                if(start !== undefined){
                    $B.RAISE(_b_.TypeError,
                        "enumerate() receives argument 'start' twice"
                    )
                }
                start = entry.value
                break
        }
    }
    return {
        ob_type: _b_.enumerate,
        dict: $B.empty_dict(),
        it: $B.make_js_iterator(iterable),
        counter: start ?? 0
    }
}

var enumerate_funcs = _b_.enumerate.tp_funcs = {}

enumerate_funcs.__class_getitem__ = $B.$class_getitem

enumerate_funcs.__reduce__ = function(self){

}

_b_.enumerate.tp_methods = ["__reduce__"]

_b_.enumerate.classmethods = ["__class_getitem__"]

/* enumerate end */

$B.set_func_names(enumerate, "builtins")

$B.LOCALS_PROXY = Symbol('locals_proxy')



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


/* filter start */
filter.tp_iter = function(self){
    return self
}

filter.tp_iternext = function*(self){
    for(var item of self.it){
        if($B.$bool($B.$call(self.func, item))){
            yield item
        }
    }
}

filter.tp_new = function(cls, args, kw){
    var [func, iterable] = $B.unpack_args('filter', args,
        ['func', 'iterable'], {})
    $B.check_kw_empty('filter', kw)
    var func = func === _b_.None ? (x) => x : func
    return {
        ob_type: _b_.filter,
        func,
        it: $B.make_js_iterator(iterable)
    }
}

var filter_funcs = _b_.filter.tp_funcs = {}

filter_funcs.__reduce__ = function(self){

}

filter.tp_methods = ["__reduce__"]

/* filter end */
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
    var test = false // attr == '__class_getitem__' // && klass.__qualname__ == 'MagicMock'
    if(test){
        console.log('search', attr, 'in mro of', klass)
        console.log(Error('trace').stack)
        console.log('default', _default)
    }
    var mro = $B.get_mro(klass)
    if(mro === undefined){
        console.log('no mro in class', klass, klass.tp_mro, klass.__mro__)
        //console.log(Error().stack)
        mro = klass.tp_mro = $B.make_mro(klass)
    }
    for(var i = 0, len = mro.length; i < len; i++){
        if(test){
            console.log('search', attr, 'in', mro[i])
        }
        if(mro[i].hasOwnProperty && mro[i].hasOwnProperty(attr)){
            if(test){
                console.log('found attr', attr, 'in mro', i, mro[i])
                console.log(mro[i][attr])
            }
            var dunder = $B.slot2dunder.hasOwnProperty(attr) ?
                $B.slot2dunder[attr] : attr
            if(! mro[i].dict ||
                    $B.str_dict_get(mro[i].dict, dunder, $B.NULL) === $B.NULL){
                console.log('attr', attr, 'found in mro[i]', mro[i],
                    'but absent in dict')
                console.log($B.frame_obj.frame.$lineno)
                console.log(Error('trace').stack)
            }
            //return mro[i][attr]
        }
        if(mro[i].dict){
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

$B.search_in_dict = function(obj, attr, _default){
    if(obj.dict){
        var v = $B.str_dict_get(obj.dict, attr, $B.NULL)
        if(v !== $B.NULL){
            return v
        }
    }
    return _default
}


$B.$getattr = function(obj, attr, _default){
    // Used internally to avoid having to parse the arguments
    var test = false // attr == 'KW_ONLY'
    if(test){
        console.log('$getattr', obj, attr)
    }
    var res
    if(obj === undefined || obj === null){
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
    res.$strings.__BRYTHON__ = $B.jsobj2pyobj($B) // issue 1181
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
    if(hash_func !== $B.NULL && hash_func !== _b_.None){
        var res = hash_func(obj)
        if(! $B.$isinstance(res, _b_.int)){
            $B.RAISE(_b_.TypeError, '__hash__ method should return an integer')
        }
        return res
    }
    $B.RAISE(_b_.TypeError, "unhashable type: '" +
            _b_.str.$factory($B.jsobj2pyobj(obj)) + "'"
    )
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
            }else if($B.is_type(_b_[obj]) &&
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
   }else if($B.$isinstance(obj, [_b_.str, _b_.int, _b_.float])){
       return $B.$call($B.$getattr(_b_.str.$factory(obj), '__hash__'))
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
        for(kls of cls.args){
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
    if(! cls.tp_bases){
        $B.RAISE(_b_.TypeError, "isinstance() arg 2 must be a type, " +
            "a tuple of types, or a union"
        )
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
    var sch = $B.type_getattribute($B.get_class(classinfo), '__subclasscheck__', $B.NULL)
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

const callable_iterator = $B.callable_iterator

callable_iterator.$factory = function(func, sentinel){
    return {
        ob_type: callable_iterator,
        func: func,
        sentinel: sentinel
    }
}

callable_iterator.tp_iter = function(self){
    return self
}

callable_iterator.tp_iternext = function(self){
    var res = $B.$call(self.func)
    if($B.rich_comp("__eq__", res, self.sentinel)){
        $B.RAISE(_b_.StopIteration)
    }
    return res
}

$B.set_func_names(callable_iterator, "builtins")

$B.$iter = function(obj, sentinel){
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    var test = false // $B.get_class(obj).tp_name == 'MagicMock'
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
            var getter = $B.search_in_mro($B.get_class(iter_func), '__get__', $B.NULL)
            if(getter === $B.NULL){
                var in_dict = $B.search_in_dict(obj, '__iter__', $B.NULL)
                if(in_dict === iter_func){
                    var res = $B.$call(in_dict)
                }
            }else{
                var res = $B.$call(iter_func, obj)
            }
            if($B.search_slot($B.get_class(res), 'tp_iternext', $B.NULL) === $B.NULL){
                console.log('iter, obj', obj, 'result of iter func', res)
                console.log('no tp_iternext in', $B.get_class(res))
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

/* map start */
_b_.map.tp_iter = function(self){
    return self
}

_b_.map.tp_iternext = function*(self){
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

_b_.map.tp_new = function(cls, args, kw){
    $B.check_kw_empty('map', kw)
    if(args.length < 2){
        $B.RAISE(_b_.TypeError, 'map() must have at least two arguments.')
    }
    var [func, it1, ...extra_args] = args
    var iter_args = [$B.make_js_iterator(it1)]
    for(var arg of extra_args){
        iter_args.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: cls,
        args: iter_args,
        func: func
    }
}

var map_funcs = _b_.map.tp_funcs = {}

map_funcs.__reduce__ = function(self){

}

map_funcs.__setstate__ = function(self){

}

_b_.map.tp_methods = ["__reduce__", "__setstate__"]

/* map end */

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
            return _b_.int.nb_power(x, y, z)
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
        end = $B.str_dict_get(kw, 'end', '\n'),
        sep = $B.str_dict_get(kw, 'sep', ' '),
        file = $B.str_dict_get(kw, 'file', $B.get_stdout())
    var args = $ns['args']
    var writer = $B.$getattr(file, 'write')
    for(var i = 0, len = args.length; i < len; i++){
        var arg = $B.make_str(args[i])
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

$print.ob_type = $B.builtin_function_or_method

var quit = _b_.quit = function(){
    throw _b_.SystemExit
}

quit.__repr__ = function(){
    return "Use quit() or Ctrl-Z plus Return to exit"
}

var repr = _b_.repr = function(obj){
    check_nb_args_no_kw('repr', 1, arguments)
    var klass = $B.get_class(obj)
    var tp_repr = $B.search_slot(klass, 'tp_repr')
    return tp_repr(obj)
}

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


/* reversed start */
_b_.reversed.tp_iter = function(self){
    self.counter = self.len
    return self
}

_b_.reversed.tp_iternext = function*(self){
    self.counter--
    if(self.counter < 0){
        return
    }
    yield $B.$call(self.getitem, self.seq, self.counter)
}

_b_.reversed.tp_new = function(cls, args, kw){
    var [seq] = $B.unpack_args('reversed', args, [], {})
    $B.check_kw_empty('reversed', kw)

    var rev_method = $B.$getattr($B.get_class(seq), '__reversed__', $B.NULL)
    if(rev_method !== $B.NULL){
        return $B.$call(rev_method, seq)
    }
    try{
        var method = $B.$getattr($B.get_class(seq), '__getitem__')
    }catch(err){
        $B.RAISE(_b_.TypeError, "argument to reversed() must be a sequence")
    }

    var res = {
        ob_type: cls,
        seq,
        len: _b_.len(seq),
        getitem: method
    }
    return res
}

var reversed_funcs = _b_.reversed.tp_funcs = {}

reversed_funcs.__length_hint__ = function(self){

}

reversed_funcs.__reduce__ = function(self){

}

reversed_funcs.__setstate__ = function(self){

}

_b_.reversed.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* reversed end */

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
        return _b_.float.tp_funcs.__round__(arg, $.ndigits)
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
        res = _b_.int.nb_true_divide(floor, mult)
    }else{
        res = _b_.int.nb_true_divide(Math.round(x), mult)
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
    // Used in the code generated by py2js. Avoids having to parse the
    // since we know we will get the 3 values
    var test = false // attr === "__doc__" // && value == "my doc."
    if(test){
        console.log("set attr", attr, "of", obj, "to", value)
    }
    var klass = $B.get_class(obj)
    var setattr = $B.search_slot(klass, 'tp_setattro', $B.NULL)
    if(test){
        console.log('seattr', obj, attr, value, 'setattr func', setattr)
    }
    if(setattr === $B.NULL){
        $B.RAISE(_b_.AttributeError, 'no setattr')
    }
    setattr(obj, attr, value)
    return _b_.None
}

_b_.sorted = function(){
    var $ = $B.args('sorted', 1, {iterable: null}, ['iterable'],
        arguments, {}, null, 'kw')
    var _list = _b_.list.$factory($.iterable)
    _b_.list.tp_funcs.sort(_list, {$kw:[$.kw.$strings]})
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


function supercheck(type, obj){
    /* obj can be a class, or an instance of one:

       - If it is a class, it must be a subclass of 'type'.      This case is
         used for class methods; the return value is obj.

       - If it is an instance, it must be an instance of 'type'.  This is
         the normal case; the return value is obj.__class__.

       But... when obj is an instance, we want to allow for the case where
       Py_TYPE(obj) is not a subclass of type, but obj.__class__ is!
       This will allow using super() with a proxy for obj.
    */

    /* Check for first bullet above (special case) */
    if($B.is_type(obj) && _b_.issubclass(obj, type)){
        return obj
    }

    /* Normal case */
    if(_b_.issubclass($B.get_class(obj), type)){
        return $B.get_class(obj)
    }else{
        var class_attr = $B.$getattr(obj, '__class__', $B.NULL)
        if(class_attr !== $B.NULL && $B.is_type(class_attr) &&
                class_attr !== $B.get_class(obj)){
            if(_b_.issubclass(class_attr, type)){
                return class_attr
            }
        }
    }

    var type_or_instance, obj_str;

    if($B.is_type(obj)){
        type_or_instance = "type";
        obj_str = obj.tp_name
    }else{
        type_or_instance = "instance of";
        obj_str = $B.class_name(obj)
    }
    $B.RAISE(_b_.TypeError,
        `super(type, obj): obj (${type_or_instance} ${obj_str}) is not ` +
        `an instance or subtype of type (${type.tp_name}).`
    )
}

/* super start */
_b_.super.tp_repr = function(self){
    $B.builtins_repr_check($$super, arguments) // in brython_builtins.js
    var res = "<super: <class '" + $B.get_name(self.type) + "'>"
    if(self.obj_type !== undefined){
        res += ', <' + $B.get_name($B.get_class(self.obj_type)) + ' object>'
    }else{
        res += ', NULL'
    }
    return res + '>'
}

_b_.super.tp_getattro = function(self, attr){
    /* We want __class__ to return the class of the super object
       (i.e. super, or a subclass), not the class of su->obj. */
    var $test = false // attr == "__new__" //&& self.type.tp_name == 'Z'
    if(attr == "__class__"){
        return _b_.object.tp_getattro(self, attr)
    }
    if(self.type.$is_js_class){
        if(attr == "__init__"){
            // use call on parent
            return function(){
                mro[0].$js_func.call(self.obj_type, ...arguments)
            }
        }
    }
    if(self.obj === _b_.None){
        return _b_.object.tp_getattro(self, attr)
    }
    // Determine method resolution order from object_or_type
    var object_or_type = self.obj,
        mro = $B.get_mro(self.obj_type)
    // Search of method attr starts in mro after self.__thisclass__
    var search_start = mro.indexOf(self.type) + 1,
        search_classes = mro.slice(search_start)

    if($test){
        console.log('super.tp_getattro, self', self, 'attr', attr)
        console.log('search classes', search_classes)
        console.log('frame obj', $B.frame_obj)
    }

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
        return _b_.object.tp_getattro(self, attr)
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
        if($test){
            console.log('call getter', getter)
            console.log('args', self.obj, self.obj_type)
        }
        res = getter(f, self.obj, self.obj_type)
    }else{
        res = f
    }
    if($test){
        console.log('result of super.tp_getattro', attr, res)
    }
    if(res === $B.NULL){
        return _b_.object.tp_getattro(self, attr)
    }
    return res
}

_b_.super.tp_descr_get = function(self, instance){
    // https://www.artima.com/weblogs/viewpost.jsp?thread=236278
    if(instance === $B.NULL){
        return self
    }
    return $B.$call($$super, self.type, instance)
}

_b_.super.tp_init = function(self, _type, object_or_type){
    var $ = $B.args('__init__', 3,
                {self: null, type: null, object_or_type: null},
                ['self', 'type', 'object_or_type'], arguments,
                {type: _b_.None, object_or_type: _b_.None}, null, null)
    var self = $.self,
        type = $.type,
        object_or_type = $.object_or_type
    if(object_or_type === _b_.None){
        if(type === _b_.None){
            var frame = $B.frame_obj.frame,
                pyframe = $B.imported["_sys"]._getframe(),
                code = $B.$getattr(pyframe, 'f_code'),
                co_varnames = $B.$getattr(code, 'co_varnames')
            if(co_varnames.length > 0){
                type = $B.get_class(frame[1])
                if(type === undefined){
                    $B.RAISE(_b_.RuntimeError, "super(): no arguments")
                }
                object_or_type = frame[1][co_varnames[0]]
            }else{
                $B.RAISE(_b_.RuntimeError, "super(): no arguments")
            }
            self.type = type
            self.obj = object_or_type
            self.obj_type = supercheck(type, object_or_type)
            return
        }else{
            self.type = type
            self.obj = _b_.None
            self.obj_type = _b_.None
            return
        }
    }
    if(Array.isArray(object_or_type)){
        object_or_type = object_or_type[0]
    }
    self.type = type
    self.obj = object_or_type
    self.obj_type = supercheck(type, object_or_type)
}

_b_.super.tp_new = function(cls){
    return {
        ob_type: cls,
        dict: $B.empty_dict()
    }
}

var super_funcs = _b_.super.tp_funcs = {}

_b_.super.tp_members =  [
    ["__thisclass__", $B.TYPES.OBJECT, "type", 1],
    ["__self__",  $B.TYPES.OBJECT, "obj", 1],
    ["__self_class__", $B.TYPES.OBJECT, "obj_type", 1]
]

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

/* zip start */
_b_.zip.tp_iter = function(self){
    return self
}

_b_.zip.tp_iternext = function*(self){
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
            return
        }
        res.push(v.value)
    }
    yield $B.fast_tuple(res)
}

_b_.zip.tp_new = function(cls, args, kw){
    var res = {
        ob_type: cls,
        items: []
    }
    var strict = $B.$bool($B.str_dict_get(kw, 'strict', false))
    var iters = []
    for(var arg of args){
        iters.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: cls,
        iters,
        strict
    }
}

var zip_funcs = _b_.zip.tp_funcs = {}

zip_funcs.__reduce__ = function(self){

}

zip_funcs.__setstate__ = function(self){

}

_b_.zip.tp_methods = ["__reduce__", "__setstate__"]

/* zip end */

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

ellipsis.tp_new = function(){
    return Ellipsis
}

var Ellipsis = _b_.Ellipsis = {
    ob_type: ellipsis
}


$B.set_func_names(ellipsis)

_b_.__BRYTHON__ = __BRYTHON__


})(__BRYTHON__);


