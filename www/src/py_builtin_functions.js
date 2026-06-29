// built-in functions
(function($B) {
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
$B.NoneType.tp_richcompare = function(self, other, op) {
    return _b_.object.tp_richcompare(self, other, op)
}

$B.NoneType.tp_repr = function(self) {
    return 'None'
}

$B.NoneType.tp_hash = function(self) {
    return 0xFCA86420
}

$B.NoneType.tp_new = function(cls) {
    return None
}

$B.NoneType.nb_bool = function(self) {
    return false
}

var NoneType_funcs = $B.NoneType.tp_funcs = {}

/* NoneType end */

var None = _b_.None = {
    ob_type: NoneType
}

None.__doc__ = None

_b_.__build_class__ = function() {
    $B.RAISE(_b_.NotImplementedError, '__build_class__')
}

_b_.abs = function(obj) {
    check_nb_args_no_kw('abs', 1, arguments)

    var klass = $B.get_class(obj)
    try {
        var method = $B.$getattr(klass, "__abs__")
    } catch (err) {
        if ($B.is_exc(err, [_b_.AttributeError])) {
            $B.RAISE(_b_.TypeError, "Bad operand type for abs(): '" +
                $B.class_name(obj) + "'")
        }
        throw err
    }
    return $B.$call(method, obj)
}

_b_.aiter = function(async_iterable) {
    return $B.$call($B.$getattr(async_iterable, '__aiter__'))
}

_b_.all = function(obj) {
    check_nb_args_no_kw('all', 1, arguments)
    var iterable = iter(obj)
    while (1) {
        try {
            var elt = next(iterable)
            if (!$B.$bool(elt)) {
                return false
            }
        } catch (err) {
            return true
        }
    }
}

_b_.anext = function() {
    var $ = $B.args('anext', 2, {async_iterator: null, _default: null},
                arguments, {_default: $B.NULL}, null, null)
    var awaitable = $B.$call($B.$getattr($.async_iterator, '__anext__'))
    return $B.promise(awaitable).catch(
        function(err) {
            if ($B.is_exc(err, [_b_.StopAsyncIteration])) {
                if ($._default !== $B.NULL) {
                    return $._default
                }
            }
            throw err
        }
    )
}

_b_.any = function(obj) {
    check_nb_args_no_kw('any', 1, arguments)
    for (var elt of $B.make_js_iterator(obj)) {
        if ($B.$bool(elt)) {
            return true
        }
    }
    return false
}

_b_.ascii = function(obj) {
    check_nb_args_no_kw('ascii', 1, arguments)
    var res = repr(obj), res1 = '', cp
    for (var i = 0; i < res.length; i++) {
        cp = res.charCodeAt(i)
        if (cp < 128) {res1 += res.charAt(i)} else if (cp < 256) {res1 += '\\x' + cp.toString(16)} else {
            var s = cp.toString(16)
            if (s.length % 2 == 1) {s = "0" + s}
            res1 += '\\u' + s
        }
    }
    return res1
}

// used by bin, hex and oct functions
function $builtin_base_convert_helper(obj, base) {
  var prefix = ""
  switch (base) {
     case 2:
       prefix = '0b'
       break
     case 8:
       prefix = '0o'
       break
     case 16:
       prefix = '0x'
       break
     default:
         console.log('invalid base:' + base)
  }

  var value = $B.PyNumber_Index(obj)

  if (value === undefined) {
     // need to raise an error
     $B.RAISE(_b_.TypeError, 'Error, argument must be an integer or' +
         ' contains an __index__ function')
  }

  if (value >= 0) {
      return prefix + value.toString(base)
  }
  return '-' + prefix + (-value).toString(base)
}

function bin_hex_oct(base, obj) {
    // Used by built-in function bin, hex and oct
    // base is respectively 2, 16 and 8
    if ($B.is_int(obj)) {
        return $builtin_base_convert_helper(obj, base)
    } else {
        try {
            var klass = $B.get_class(obj),
                method = $B.$getattr(klass, '__index__')
        } catch (err) {
            if ($B.is_exc(err, [_b_.AttributeError])) {
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

_b_.breakpoint = function() {
    // PEP 553
    $B.$import('sys', [])
    var missing = {},
        hook = $B.$getattr($B.imported.sys, 'breakpointhook', missing)
    if (hook === missing) {
        $B.RAISE(_b_.RuntimeError, 'lost sys.breakpointhook')
    }
    return $B.$call(hook, ...arguments)
}

_b_.callable = function(obj) {
    check_nb_args_no_kw('callable', 1, arguments)

    return _b_.hasattr(obj, '__call__')
}

_b_.chr = function(i) {
    check_nb_args_no_kw('chr', 1, arguments)

    i = $B.PyNumber_Index(i)

    if (i < 0 || i > 1114111) {
        $B.RAISE(_b_.ValueError, 'Outside valid range')
    } else if (i >= 0x10000 && i <= 0x10FFFF) {
        var code = (i - 0x10000),
            s =  String.fromCodePoint(0xD800 | (code >> 10)) +
                 String.fromCodePoint(0xDC00 | (code & 0x3FF))
        return $B.make_String(s, [0])
    } else {
        return String.fromCodePoint(i)
    }
}

// classmethod is in py_type.js


//compile() (built in function)
_b_.compile = function() {
    var $ = $B.args('compile', 7,
        {source:null, filename:null, mode:null, flags:null, dont_inherit:null,
         optimize:null, _feature_version:null, module: null},
         arguments,
         {flags: 0, dont_inherit: false, optimize: -1, _feature_version: 0,
         module: _b_.None},
         null, null)

    var module_name = '$exec_' + $B.UUID()
    $.ob_type = $B.code
    $B.init_dict($)
    var infos = {
        co_flags: $.flags,
        co_name: "<module>",
        co_filename: $.filename
    }
    for (var key in infos) {
        $[key] = infos[key]
    }
    var filename = $.filename
    var interactive = $.mode == "single" && ($.flags & 0x200)
    $B.file_cache[filename] = $.source
    $B.url2name[filename] = module_name

    if ($.flags & $B.PyCF_TYPE_COMMENTS) {
        // $B.RAISE(_b_.NotImplementedError, 'Brython does not currently support parsing of type comments')
    }

    if ($B.is_bytes($.source)) {
        var encoding = 'utf-8',
            lfpos = $.source.source.indexOf(10),
            first_line,
            second_line
        if (lfpos == -1) {
            first_line = $.source
        } else {
            first_line = _b_.bytes.$factory($.source.source.slice(0, lfpos))
        }
        // decode with a safe decoder
        first_line = $B.bytes_decode(first_line, 'latin-1')
        // search encoding (PEP263)
        var encoding_re = /^[ \t\f]*#.*?coding[:=][ \t]*([-_.a-zA-Z0-9]+)/
        var mo = first_line.match(encoding_re)
        if (mo) {
            encoding = mo[1]
        } else if (lfpos > -1) {
            // try second line
            var rest = $.source.source.slice(lfpos + 1)
            lfpos = rest.indexOf(10)
            if (lfpos > -1) {
                second_line = _b_.bytes.$factory(rest.slice(0, lfpos))
            } else {
                second_line = _b_.bytes.$factory(rest)
            }
            second_line = $B.bytes_decode(second_line, 'latin-1')
            mo = second_line.match(encoding_re)
            if (mo) {
                encoding = mo[1]
            }
        }
        $.source = $B.bytes_decode($.source, encoding)
    }

    if (! $B.$isinstance(filename, [_b_.bytes, _b_.str])) {
        // module _warning is in builtin_modules.js
        $B.warn(_b_.DeprecationWarning,
            `path should be string, bytes, or os.PathLike, ` +
            `not ${$B.class_name(filename)}`)
    }
    if (interactive && ! $.source.endsWith("\n")) {
        // This is used in codeop.py to raise SyntaxError until a block in the
        // interactive interpreter ends with "\n"
        // Cf. issue #853
        var lines = $.source.split("\n"),
            last_line = $B.last(lines)
        if (last_line.startsWith(" ")) {
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

    if ($B.$getattr($B.get_class($.source), '__module__') == 'ast') {
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
    try {
        var parser_mode = $.mode == 'eval' ? 'eval' : 'file'
        parser = new $B.Parser($.source, filename, parser_mode)
        parser.flags = $.flags
        _ast = $B._PyPegen.run_parser(parser)
    } catch (err) {
        if ($.mode == 'single') {
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

    if ($.flags == $B.PyCF_ONLY_AST) {
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
    if (typeof attr != 'string') {
        $B.RAISE(_b_.TypeError, "attribute name must be string, not '" +
            $B.class_name(attr) + "'")
    }
    // If the object's class has a __delattr__ method, use it
    var deleter = $B.search_in_mro($B.get_class(obj), '__delattr__')
    if (deleter) {
        return $B.$call(deleter, obj, attr)
    }
    return _b_.object.tp_setattro(obj, attr, $B.NULL)
}

$B.$delattr = function(obj, attr, inum) {
    try {
        _b_.delattr(obj, attr)
    } catch (err) {
        $B.set_inum(inum)
        throw err
    }
}

$B.$delete = function(name, locals_id, inum) {
    // Code for "del x" (remove name from namespace)
    function del(obj) {
        if ($B.get_class(obj) === $B.generator) {
            // Force generator return (useful if yield was in a context manager)
            obj.js_gen.return()
        }
        var del_method = $B.search_in_mro($B.get_class(obj), '__del__')
        if (del_method) {
            $B.$call(del_method, obj)
        }
    }
    var found = false
    if (locals_id === 'local') {
        var frame = $B.frame_obj.frame
        if (frame[1].hasOwnProperty(name)) {
            found = true
            del(frame[1][name])
            delete frame[1][name]
        }
    } else if (locals_id === 'global') {
        var frame = $B.frame_obj.frame
        if (frame[3].hasOwnProperty(name)) {
            found = true
            del(frame[3][name])
            delete frame[3][name]
        }
    } else if (locals_id !== null && locals_id[name] !== undefined) {
        found = true
        del(locals_id[name])
        delete locals_id[name]
    }
    if (! found) {
        $B.set_inum(inum)
        if (locals_id == 'local') {
            $B.RAISE(_b_.UnboundLocalError,
                `cannot access local variable '${name}' ` +
                'where it is not associated with a value')
        } else {
            throw $B.name_error(name)
        }
    }
}

_b_.dir = function(obj) {
    if (obj === undefined) {
        // if dir is called without arguments, use locals
        var locals = _b_.locals()
        return _b_.sorted(locals)
    }

    check_nb_args_no_kw('dir', 1, arguments)

    var klass = $B.get_class(obj)

    if ($B.is_type(obj)) {
        // Use metaclass __dir__
        var dir_func = $B.$getattr($B.get_class(obj), "__dir__", $B.NULL)
        return $B.$call(dir_func, obj)
    }
    try {
        var dir_func = $B.$getattr(klass, '__dir__', $B.NULL)
        if (dir_func !== $B.NULL) {
            let res = $B.$call($B.$getattr(klass, '__dir__'), obj)
            res = _b_.list.$factory(res)
            return res
        }
    } catch (err) {
        // ignore, default
        if ($B.get_option('debug') > 2) {
            console.log('error in dir, obj', obj, 'klass', klass,
                $B.$getattr(klass, '__dir__'), err.message)
        }
        throw err
    }
}

//divmod() (built in function)
_b_.divmod = function(x,y) {
    check_nb_args_no_kw('divmod', 2, arguments)

    try {
        return $B.rich_op('__divmod__', x, y)
    } catch (err) {
        if ($B.is_exc(err, [_b_.TypeError])) {
            return _b_.tuple.$factory([$B.rich_op('__floordiv__', x, y),
                                       $B.rich_op('__mod__', x, y)])
        }
        throw err
    }
}

var enumerate = _b_.enumerate
enumerate.__mro__ = [_b_.object]

enumerate.$factory = function() {
    var $ns = $B.args("enumerate", 2, {iterable: null, start: null},
                  arguments, {start: 0}, null, null)
    var iterable = $ns["iterable"],
        start = $ns["start"]
    return {
        ob_type: enumerate,
        __name__: 'enumerate iterator',
        counter: start - 1,
        it: $B.make_js_iterator(iterable),
        counter: start
    }
}

/* enumerate start */
_b_.enumerate.tp_iter = function(self) {
    return self
}

_b_.enumerate.tp_iternext = function*(self){
    for (var item of self.it) {
        var res = $B.fast_tuple([self.counter, item])
        self.counter++
        yield res
    }
}

_b_.enumerate.tp_new = function(cls, args, kw) {
    var nb_kwargs = $B.str_dict_length(kw)
    var nb_args = args.length + nb_kwargs
    if (nb_args > 2) {
        $B.RAISE(_b_.TypeError,
            `enumerate() takes at most 2 arguments (${nb_args} given)`
        )
    }
    var [iterable, start] = args
    $B.check_expected_keywords('enumerate', kw, ['iterable', 'start'])
    for (var entry of _b_.dict.$iter_items(kw)) {
        switch (entry.key) {
            case 'iterable':
                if (iterable !== undefined) {
                    $B.RAISE(_b_.TypeError,
                        "enumerate() receives argument 'iterable' twice"
                    )
                }
                iterable = entry.value
                break
            case 'start':
                if (start !== undefined) {
                    $B.RAISE(_b_.TypeError,
                        "enumerate() receives argument 'start' twice"
                    )
                }
                start = entry.value
                break
        }
    }
    var res = {
        ob_type: _b_.enumerate,
        it: $B.make_js_iterator(iterable),
        counter: start ?? 0
    }
    $B.init_dict(res)
    return res
}

var enumerate_funcs = _b_.enumerate.tp_funcs = {}

enumerate_funcs.__class_getitem__ = $B.$class_getitem

enumerate_funcs.__reduce__ = function(self) {

}

_b_.enumerate.tp_methods = ["__reduce__"]

_b_.enumerate.classmethods = ["__class_getitem__"]

/* enumerate end */

$B.set_func_names(enumerate, "builtins")

$B.LOCALS_PROXY = Symbol('locals_proxy')



var exit = _b_.exit = function() {
    throw _b_.SystemExit
}

exit.__repr__ = exit.__str__ = function() {
    return "Use exit() or Ctrl-Z plus Return to exit"
}

var filter = _b_.filter
filter.$factory = function(func, iterable) {
    check_nb_args_no_kw('filter', 2, arguments)

    if (func === _b_.None) {
        func = $B.$bool
    }

    return {
        ob_type: filter,
        func: func,
        it: $B.make_js_iterator(iterable)
    }
}


/* filter start */
filter.tp_iter = function(self) {
    return self
}

filter.tp_iternext = function*(self){
    for (var item of self.it) {
        if ($B.$bool($B.$call(self.func, item))) {
            yield item
        }
    }
}

filter.tp_new = function(cls, args, kw) {
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

filter_funcs.__reduce__ = function(self) {

}

filter.tp_methods = ["__reduce__"]

/* filter end */
$B.set_func_names(filter, "builtins")

_b_.format = function() {
    var $ = $B.args("format", 2, {value: null, format_spec: null},
                arguments, {format_spec: ''}, null, null)
    var value = $.value
    var klass = $B.get_class(value)
    try {
        var method = $B.$getattr(klass, '__format__')
    } catch (err) {
        if ($B.is_exc(err, [_b_.AttributeError])) {
            $B.RAISE(_b_.NotImplementedError, "__format__ is not implemented " +
                "for object '" + _b_.str.$factory(value) + "'")
        }
        throw err
    }
    return $B.$call(method, value, $.format_spec)
}

function attr_error(attr, obj) {
    var cname = $B.get_class(obj)
    var msg = "bad operand type for unary #: '" + cname + "'"
    switch (attr) {
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

_b_.getattr = function() {
    var missing = {}
    var $ = $B.args("getattr", 3, {obj: null, attr: null, _default: null},
                arguments, {_default: missing}, null, null)
    if (! $B.is_str($.attr)) {
        $B.RAISE(_b_.TypeError, "attribute name must be string, " +
            `not '${$B.class_name($.attr)}'`)
    }

    return $B.$getattr($.obj, _b_.str.$to_string($.attr),
        $._default === missing ? undefined : $._default)
}

$B.search_in_mro = function(klass, attr, _default) {
    var mro = $B.get_mro(klass)
    for (var i = 0, len = mro.length; i < len; i++) {
        if ($B.get_dict(mro[i])) {
            var v = $B.get_from_dict(mro[i], attr, $B.NULL)
            if (v !== $B.NULL) {
                return v
            }
        }
    }
    return _default
}

$B.search_in_dict = function(obj, attr, _default) {
    if ($B.get_dict(obj)) {
        try {
            var v = $B.get_from_dict(obj, attr, $B.NULL)
        } catch (err) {
            console.log('error', obj, attr)
            throw err
        }
        if (v !== $B.NULL) {
            return v
        }
    }
    return _default
}


$B.$getattr_pep657 = function(obj, attr, inum) {
    try {
        return $B.$getattr(obj, attr)
    } catch (err) {
        $B.set_inum(inum)
        throw err
    }
}

$B.time_getattr = 0
$B.time_obj_getattr = 0
$B.time_builtin_getattr = 0

$B.$getattr = function(obj, attr, _default) {
    // Used internally to avoid having to parse the arguments
    var test = false // attr == '__qualname__'
    if (test) {
        console.log('$getattr', obj, attr)
    }
    var res
    if (obj === undefined || obj === null) {
        console.log('getting attribute', attr)
        $B.RAISE_ATTRIBUTE_ERROR("Javascript object '" + obj +
            "' has no attribute", obj, attr)
    }
    /*
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
    */

    var rawname = attr

    if (obj === undefined) {
        console.log("get attr", attr, "of undefined")
    }

    var is_class = Object.hasOwn(obj, 'tp_name') //klass.tp_mro.includes(_b_.type)

    if (test) {
        console.log("attr", attr, "of", obj, "class", $B.get_class(obj),
        "isclass", is_class)
    }

    if (! is_class) {
        var klass = $B.get_class(obj)
        if (test) {
            console.log('klass', klass)
        }
        if (klass.tp_funcs && klass.$getattribute === _b_.object.tp_getattro) {
            // built-in type
            if (test) {
                console.log('builtin type')
            }
            var func = $B.get_from_dict(klass, attr, $B.NULL)
            if (func !== $B.NULL) {
                var res = $B.NULL
                switch (func.ob_type) {
                    case $B.builtin_method:
                        res = function() {
                            return func(obj, ...arguments)
                        }
                        res.ob_type = func.ob_type
                        return res
                    case $B.getset_descriptor:
                        return func.getter(obj)
                    case $B.member_descriptor:
                        return obj[func.d_member.attr]
                    case $B.method_descriptor:
                    case $B.wrapper_descriptor:
                        return func.ob_type.tp_descr_get(func, obj, klass)
                    case $B.builtin_function_or_method:
                    case _b_.staticmethod:
                        return func
                    default:
                        // console.log('builtin type', func, func.ob_type)
                        break
                }
            }
        }
        try {
            var in_klass_dict = $B.get_dict(klass)[attr]
            var own_dict = $B.get_dict(obj)
            var in_own_dict = own_dict
                ? own_dict.hasOwnProperty(attr)
                    ? own_dict[attr]
                    : $B.NULL
                : $B.NULL
            if (test) {
                console.log('in klass dict', in_klass_dict)
                console.log('in own dict', in_own_dict)
            }
            if (in_klass_dict) {
                switch (in_klass_dict.ob_type) {
                    case $B.function:
                        if (in_own_dict === $B.NULL) {
                            return $B.method.$factory(in_klass_dict, obj)
                        }
                        break
                    case _b_.staticmethod:
                        if (in_own_dict === $B.NULL) {
                            return in_klass_dict
                        }
                        break
                }
            }
        } catch (err) {
            console.log('error', err)
            console.log('obj', obj, 'klass', klass)
            throw err
        }
        var res = $B.object_getattribute(obj, klass, attr)
    } else {
        if (attr === '__class__') {
            return $B.get_class(obj)
        }
        var in_dict = $B.get_dict(obj)[attr]
        if (test) {
            console.log('in dict of class', in_dict)
        }
        if (in_dict && $B.get_class(obj) === _b_.type) {
            var res = $B.NULL
            // A data descriptor on the metatype wins over the type's own
            // same-named attribute: type's __name__/__qualname__/... are data
            // getsets, so e.g. method_descriptor.__name__ is 'method_descriptor'
            // (the metatype getset), not the member it defines for instances.
            var tset = _b_.type.tp_funcs[attr + '_set']
            if (_b_.type.tp_funcs.hasOwnProperty(attr + '_get') &&
                    tset !== undefined && tset !== _b_.None) {
                return _b_.type.tp_funcs[attr + '_get'](obj)
            }
            switch ($B.get_class(in_dict)) {
                case $B.function:
                case $B.wrapper_descriptor:
                case $B.method_descriptor:
                case $B.builtin_function_or_method:
                case $B.member_descriptor:
                    res = in_dict
                    break
                case $B.getset_descriptor:
                    if (_b_.type.tp_funcs.hasOwnProperty(attr + '_get')) {
                        res = _b_.type.tp_funcs[attr + '_get'](obj)
                    } else {
                        res = in_dict
                    }
                    break
                case $B.classmethod_descriptor:
                    res = $B.classmethod_descriptor.tp_descr_get(in_dict, $B.NULL, obj)
                    break
                case _b_.classmethod:
                    res = $B.$call($B.method, in_dict.cm_callable, obj)
                    break
                case _b_.staticmethod:
                    res = in_dict.sm_callable
                    break
                case undefined:
                    res = in_dict
                default:
                    //console.log('attr', attr, 'ob type', in_dict.ob_type)
                    break
            }
            if (res !== $B.NULL) {
                return res
            }
        }
        var res = $B.type_getattribute(obj, attr)
    }
    if (res === $B.NULL) {
        if (_default !== undefined) {
            return _default
        }
        throw $B.attr_error(attr, obj)
    }
   return res
}

// globals() (built in function)
_b_.globals = function() {
    // $B.frame_obj.frame is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args_no_kw('globals', 0, arguments)
    return $B.frame_obj.frame[3]
}

_b_.hasattr = function(obj,attr) {
    check_nb_args_no_kw('hasattr', 2, arguments)
    try {
        $B.$getattr(obj, attr)
        return true
    } catch (err) {
        return false
    }
}

_b_.hash = function(obj) {
    check_nb_args_no_kw('hash', 1, arguments)
    return $B.$hash(obj)
}

$B.$hash = function(obj) {
    if (obj.__hashvalue__ !== undefined) {
        return obj.__hashvalue__
    }
    var res
    if (typeof obj === "boolean") {
        return obj ? 1 : 0
    } else if (typeof obj === "number") {
        res = obj
    } else {
        var klass = $B.get_class(obj)
        var hash_func = $B.search_slot(klass, 'tp_hash', $B.NULL)
        if (hash_func !== $B.NULL && hash_func !== _b_.None) {
            res = hash_func(obj)
            if (! $B.is_int(res)) {
                $B.RAISE(_b_.TypeError, '__hash__ method should return an integer')
            }
        } else {
            $B.RAISE(_b_.TypeError, "unhashable type: '" +
                    _b_.str.$factory($B.jsobj2pyobj(obj)) + "'"
            )
        }
    }
    // CPython reserves -1 as the "hash failed" sentinel, so any value that
    // would hash to -1 is remapped to -2 (hash(-1) == -2, and likewise
    // hash(Decimal('-1')) etc.).
    if (res === -1) { res = -2 }
    return res
}

var help = _b_.help = function(obj) {
    if (obj === undefined) {obj = 'help'}

    if (typeof obj == 'string') {
        var lib_url = 'https://docs.python.org/3/library'
        // search in standard lib
        var parts = obj.split('.'),
            head = [],
            url
        while (parts.length > 0) {
            head.push(parts.shift())
            if ($B.stdlib[head.join('.')]) {
                url = head.join('.')
            } else {
                break
            }
        }
        if (url) {
            var doc_url
            if(['browser', 'javascript', 'interpreter'].
                    indexOf(obj.split('.')[0]) > -1){
                doc_url = '/static_doc/' + ($B.language == 'fr' ? 'fr' : 'en')
            } else {
                doc_url = lib_url
            }
            globalThis.open(`${doc_url}/${url}.html#` + obj)
            return
        }
        // built-in functions or classes
        if (_b_[obj]) {
            if (obj == obj.toLowerCase()) {
                url = lib_url + `/functions.html#${obj}`
            }else if(['False', 'True', 'None', 'NotImplemented', 'Ellipsis', '__debug__'].
                    indexOf(obj) > -1){
                url = lib_url + `/constants.html#${obj}`
            }else if($B.is_type(_b_[obj]) &&
                    _b_[obj].tp_bases.indexOf(_b_.Exception) > -1){
                url = lib_url + `/exceptions.html#${obj}`
            }
            if (url) {
                globalThis.open(url)
                return
            }
        }
        // use pydoc
        $B.$import('pydoc')
        return $B.$call($B.$getattr($B.imported.pydoc, 'help'), obj)
    }
    if ($B.get_class(obj) === $B.module) {
        return help($B.get_name(obj))
    }
    try {
        _b_.print($B.$getattr(obj, '__doc__'))
    } catch (err) {
        return ''
    }
}

help.__repr__ = help.__str__ = function() {
    return "Type help() for interactive help, or help(object) " +
        "for help about object."
}

_b_.hex = function(obj) {
    check_nb_args_no_kw('hex', 1, arguments)
    return bin_hex_oct(16, obj)
}

_b_.id = function(obj) {
   check_nb_args_no_kw('id', 1, arguments)
   if (obj[$B.ID] !== undefined) {
       return obj[$B.ID]
   } else if ($B.$isinstance(obj, [_b_.str, _b_.int, _b_.float])) {
       return $B.$call($B.$getattr(_b_.str.$factory(obj), '__hash__'))
   } else {
       return obj[$B.ID] = $B.UUID()
   }
}

// The default __import__ function is a builtin
_b_.__import__ = function() {
    // TODO : Install $B.$__import__ in builtins module to avoid nested call
    var $ = $B.args('__import__', 5,
        {name: null, globals: null, locals: null, fromlist: null, level: null},
        arguments,
        {globals:None, locals:None, fromlist:_b_.tuple.$factory(), level:0},
        null, null)
    return $B.$__import__($.name, $.globals, $.locals, $.fromlist)
}

// not a direct alias of prompt: input has no default value
_b_.input = function(msg) {
    var res = prompt(msg || '') || ''
    if($B.imported["sys"] &&
            $B.module_getattr($B.imported["sys"], 'ps1') !== $B.NULL){
        // Interactive mode : echo the prompt + input
        // cf. issue #853
        var ps1 = $B.module_getattr($B.imported["sys"], 'ps1'),
            ps2 = $B.module_getattr($B.imported["sys"], 'ps2')
        if (msg == ps1 || msg == ps2) {
            console.log(msg, res)
        }
    }
    return res
}

_b_.isinstance = function(obj, cls) {
    check_nb_args_no_kw('isinstance', 2, arguments)
    return $B.$isinstance(obj, cls)
}

$B.$isinstance = function(obj, cls) {
    var kls
    if (Array.isArray(cls)) {
        for (kls of cls) {
            if ($B.$isinstance(obj, kls)) {
                return true
            }
        }
        return false
    }
    var klass = $B.get_class(cls)
    if (klass === $B.UnionType) {
        for (kls of cls.args) {
            if ($B.$isinstance(obj, kls)) {
                return true
            }
        }
        return false
    }

    if (klass === $B.GenericAlias) {
        // PEP 585
        $B.RAISE(_b_.TypeError,
            'isinstance() arg 2 cannot be a parameterized generic')
    }
    if (! cls.tp_bases) {
        $B.RAISE(_b_.TypeError, "isinstance() arg 2 must be a type, " +
            "a tuple of types, or a union"
        )
    }

    var obj_class = $B.get_class(obj)

    if (obj_class ===  cls) {
        return true
    }
    var mro = $B.get_mro(obj_class)
    if (mro) {
        for (var i = 0; i < mro.length; i++) {
           if (mro[i] === cls) {
               return true
           }
        }
    }
    // Search __instancecheck__ on cls's class (ie its metaclass)
    var instancecheck = $B.type_getattribute($B.get_class(cls),
        '__instancecheck__', $B.NULL)
    if (instancecheck !== $B.NULL) {
        if (instancecheck.method !== _b_.type.tp_funcs.__instancecheck__) {
            return $B.$call(instancecheck, cls, obj)
        }
    }
    return false
}

var issubclass = _b_.issubclass = function(klass, classinfo) {
    check_nb_args_no_kw('issubclass', 2, arguments)
    if ($B.is_tuple(classinfo)) {
        for (var i = 0; i < classinfo.length; i++) {
           if (issubclass(klass, classinfo[i])) {return true}
        }
        return false
    }
    if ($B.get_class(classinfo) === $B.GenericAlias) {
        $B.RAISE(_b_.TypeError,
            'issubclass() arg 2 cannot be a parameterized generic')
    }
    var mro = $B.get_mro(klass)

    if (klass === classinfo || mro.indexOf(classinfo) > -1) {
        return true
    }

    // Search __subclasscheck__ on classinfo
    var sch = $B.type_getattribute($B.get_class(classinfo), '__subclasscheck__', $B.NULL)
    if (sch === $B.NULL) {
        return false
    }
    return $B.$call(sch, classinfo, klass)
}

// Utility class for iterators built from objects that have a __getitem__ and
// __len__ method

/* iterator start */
$B.iterator.tp_iter = function(self) {
    var ob_type = $B.get_class(self.it_seq)
    self.len = $B.search_in_mro(ob_type, '__len__')(self.it_seq)
    self.getitem = $B.search_in_mro(ob_type, '__getitem__')
    self.it_index = 0
    return self
}

$B.iterator.tp_iternext = function*(self){
    if (self.it_index < self.len) {
        var res = self.getitem(self.it_seq, self.it_index)
        self.it_index++
        yield res
    }
}

var iterator_funcs = $B.iterator.tp_funcs = {}

iterator_funcs.__length_hint__ = function(self) {

}

iterator_funcs.__reduce__ = function(self) {
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([self.it_seq]), self.it_index])
}

iterator_funcs.__setstate__ = function(self, state) {
    self.it_index = state < 0 ? 0 : state
}

$B.iterator.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* iterator end */

const callable_iterator = $B.callable_iterator

callable_iterator.$factory = function(func, sentinel) {
    return {
        ob_type: callable_iterator,
        func: func,
        sentinel: sentinel
    }
}

callable_iterator.tp_iter = function(self) {
    return self
}

callable_iterator.tp_iternext = function(self) {
    var res = $B.$call(self.func)
    if ($B.rich_comp("__eq__", res, self.sentinel)) {
        $B.RAISE(_b_.StopIteration)
    }
    return res
}

$B.set_func_names(callable_iterator, "builtins")

$B.$iter = function(obj, sentinel) {
    // Function used internally by core Brython modules, to avoid the cost
    // of arguments control
    var test = false // $B.get_class(obj).tp_name == 'MagicMock'
    if (test) {
        console.log('iter', obj)
    }
    if (sentinel === undefined) {
        var klass = $B.get_class(obj)
        var iter_func = klass.tp_iter ?? $B.make_iter(klass)
        if (test) {
            console.log('iter func', iter_func)
        }
        if (iter_func !== $B.NULL) {
            var getter = $B.get_class(iter_func).tp_descr_get
            if (getter === $B.NULL) {
                var in_dict = $B.search_in_dict(obj, '__iter__', $B.NULL)
                if (in_dict === iter_func) {
                    var res = $B.$call(in_dict)
                }
            } else {
                var res = $B.$call(iter_func, obj)
            }
            if ($B.search_slot($B.get_class(res), 'tp_iternext', $B.NULL) === $B.NULL) {
                console.log('iter, obj', obj,
                    '\nklass', klass,
                    '\n  getter', getter,
                    '\n iter func', iter_func,
                    '\nresult of iter func', res)
                console.log('no tp_iternext in', $B.get_class(res))
                $B.RAISE(_b_.TypeError,
                    `iter() returned non-iterable of type '${$B.class_name(res)}'`)
            }
            return res
        }
        var getitem_func = $B.search_in_mro(klass, '__getitem__', $B.NULL)
        var len_func = $B.search_in_mro(klass, '__len__', $B.NULL)
        if (test) {
            console.log('getitem_func', getitem_func)
            console.log('len_func', len_func)
        }
        if (getitem_func !== $B.NULL && len_func !== $B.NULL) {
            var it = {
                ob_type: $B.iterator,
                it_seq: obj
            }
            return $B.iterator.tp_iter(it)

        }
        $B.RAISE(_b_.TypeError,
            `'${$B.class_name(obj)}' object is not iterable`
        )
    } else {
        return callable_iterator.$factory(obj, sentinel)
    }
}

var iter = _b_.iter = function() {
    // Function exposed to Brython programs, with arguments control
    var $ = $B.args('iter', 1, {obj: null}, arguments, null, 'args', 'kw'),
        sentinel
    if ($.args.length > 0) {
        sentinel = $.args[0]
    }
    return $B.$iter($.obj, sentinel)
}

var len = _b_.len = function(obj) {
    check_nb_args_no_kw('len', 1, arguments)

    var klass = $B.get_class(obj)
    var method = $B.search_in_mro(klass, '__len__', null)
    if (method === null) {
        $B.RAISE(_b_.TypeError, "object of type '" +
            $B.class_name(obj) + "' has no len() VVV")
    }

    let res = $B.$call(method, obj)

    if (res === undefined) {
        console.log('call', method, 'with obj', obj, 'returns undef')
    }

    if (!$B.is_int(res)) {
        $B.RAISE(_b_.TypeError,
            `'${$B.class_name(res)}' object cannot be interpreted as an integer`
        )
    }

    if (!$B.rich_comp('__ge__', res, 0)) {
        $B.RAISE(_b_.ValueError, 'ValueError: __len__() should return >= 0')
    }

    return res
}

_b_.locals = function() {
    // $B.frame_obj.frame is
    // [locals_name, locals_obj, globals_name, globals_obj]
    check_nb_args('locals', 0, arguments)
    var locals_obj = $B.frame_obj.frame[1]
    // In a class body, locals() is a proxy around a dict(-like) object
    var class_locals = locals_obj.$target
    if (class_locals && $B.get_class(class_locals) === _b_.dict) {
        return class_locals
    }
    // CPython's locals() returns a dict snapshot; the raw frame object is
    // not a Python mapping ('x' in locals() raised "argument of type ...
    // is not a container or iterable"). Skip frame infrastructure keys.
    var d = $B.empty_dict()
    for (var key in locals_obj) {
        if (key.startsWith('$') || key == '__class__' || key == 'ob_type') {
            continue
        }
        _b_.dict.$setitem(d, key, locals_obj[key])
    }
    return d
}


var map = _b_.map

map.$factory = function() {
    var $ = $B.args('map', 2, {func: null, it1:null}, arguments, null,
                'args', null),
        func = $.func
    var iter_args = [$B.make_js_iterator($.it1)]
    for (var arg of $.args) {
        iter_args.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: map,
        args: iter_args,
        func: func
    }
}

/* map start */
_b_.map.tp_iter = function(self) {
    return self
}

_b_.map.tp_iternext = function*(self){
    var args = []
    for (var iter of self.args) {
        var arg = iter.next()
        if (arg.done) {
            $B.RAISE(_b_.StopIteration, '')
        }
        args.push(arg.value)
    }
    yield $B.$call(self.func, ...args)
}

_b_.map.tp_new = function(cls, args, kw) {
    $B.check_kw_empty('map', kw)
    if (args.length < 2) {
        $B.RAISE(_b_.TypeError, 'map() must have at least two arguments.')
    }
    var [func, it1, ...extra_args] = args
    var iter_args = [$B.make_js_iterator(it1)]
    for (var arg of extra_args) {
        iter_args.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: cls,
        args: iter_args,
        func: func,
        iterables: [it1, ...extra_args]
    }
}

var map_funcs = _b_.map.tp_funcs = {}

map_funcs.__reduce__ = function(self) {
    return $B.fast_tuple([$B.get_class(self),
        $B.fast_tuple([self.func, ...(self.iterables || [])])])
}

map_funcs.__setstate__ = function(self) {

}

_b_.map.tp_methods = ["__reduce__", "__setstate__"]

/* map end */

$B.set_func_names(map, "builtins")

$B.nb_min = 0

function $extreme(args, op) { // used by min() and max()
    var $op_name = op == '__lt__' ? 'min' : 'max'
    var last = args[args.length - 1]
    var nb_args = args.length
    var kw
    if (last.$kw) {
        nb_args--
        kw = $B.parse_kwargs(last.$kw)
    }

    var has_default = false,
        func = false
    if (kw) {
        for (var key in kw) {
            switch (key) {
                case 'key':
                    func = kw.key
                    break
                case 'default':
                    var default_value = kw.default
                    has_default = true
                    break
                default:
                    $B.RAISE(_b_.TypeError, "'" + item.key +
                        "' is an invalid keyword argument for this function")
            }
        }
    }

    if ((! func) || func === _b_.None) {
        func = null
    }

    if (nb_args == 0) {
        $B.RAISE(_b_.TypeError, $op_name + " expected 1 arguments, got 0")
    } else if (nb_args == 1) {
        // Only one positional argument : it must be an iterable
        var $iter = $B.make_js_iterator_no_trace(args[0]),
            res = null,
            x_value,
            extr_value
        for (var x of $iter) {
            if (res === null) {
                extr_value = func === null ? x : $B.$call(func, x)
                res = x
            } else {
                x_value = func === null ? x : $B.$call(func, x)
                if ($B.rich_comp(op, x_value, extr_value)) {
                    res = x
                    extr_value = x_value
                }
            }
        }
        if (res === null) {
            if (has_default) {
        $B.nb_min++
                return default_value
            } else {
                $B.RAISE(_b_.ValueError, $op_name +
                    "() arg is an empty sequence")
            }
        } else {
            return res
        }
    } else {
        if (has_default) {
           $B.RAISE(_b_.TypeError, "Cannot specify a default for " +
               $op_name + "() with multiple positional arguments")
        }
        var res = null,
            x,
            x_value,
            extr_value
        for (var i = 0; i < nb_args; i++) {
            x = args[i]
            if (res === null) {
                extr_value = func === null ? x : $B.$call(func, x)
                res = x
            } else {
                x_value = func === null ? x : $B.$call(func, x)
                if ($B.rich_comp(op, x_value, extr_value)) {
                    res = x
                    extr_value = x_value
                }
            }
        }
        if (res === null) {
            $B.RAISE(_b_.ValueError, $op_name +
                "() arg is an empty sequence")
        } else {
            return res
        }
    }
}

_b_.max = function() {
    return $extreme(arguments, '__gt__')
}


_b_.min = function() {
    return $extreme(arguments, '__lt__')
}

var next = _b_.next = function(obj) {
    check_no_kw('next', obj)
    var missing = {},
        $ = $B.args("next", 2, {obj: null, def: null}, arguments,
                {def: missing}, null, null)
    var klass = $B.get_class(obj),
        ga = $B.$getattr(klass, "__next__", $B.NULL)
    if (ga !== $B.NULL) {
        try {
            return $B.$call(ga, obj)
        } catch (err) {
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

NotImplementedType.$factory = function() {
    return NotImplemented
}

NotImplementedType.tp_repr = function() {
    return "NotImplemented"
}

// pickled as a global reference, like CPython (notimplemented_reduce)
NotImplementedType.tp_funcs = {
    __reduce__: function() {
        return 'NotImplemented'
    }
}
NotImplementedType.tp_methods = ['__reduce__']

$B.set_func_names(NotImplementedType, "builtins")

var NotImplemented = _b_.NotImplemented = {
    ob_type: NotImplementedType
}

_b_.oct = function(obj) {
    check_nb_args_no_kw('oct', 1, arguments)
    return bin_hex_oct(8, obj)
}

_b_.ord = function(c) {
    check_nb_args_no_kw('ord', 1, arguments)
    //return String.charCodeAt(c)  <= this returns an undefined function error
    // see http://msdn.microsoft.com/en-us/library/ie/hza4d04f(v=vs.94).aspx
    if (typeof c.valueOf() == 'string') {
        if (c.length == 1) {
            return c.charCodeAt(0)
        } else if (c.length == 2) {
            var code = c.codePointAt(0)
            if (code >= 0x10000 && code <= 0x10FFFF) {
                return code
            }
        }
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
    }
    switch ($B.get_class(c)) {
      case _b_.str:
        if (c.length == 1) {
            return c.charCodeAt(0)
        }
        $B.RAISE(_b_.TypeError, 'ord() expected a character, but ' +
            'string of length ' + c.length + ' found')
      case _b_.bytes:
      case _b_.bytearray:
        if (c.source.length == 1) {
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
    var $ = $B.args('pow', 3, {x: null, y: null, mod: null},
                arguments, {mod: None}, null, null)
    var x = $.x,
        y = $.y,
        z = $.mod
    if (z === _b_.None) {
        return $B.rich_op('__pow__', x, y)
    } else {
        if ($B.is_int(x)) {
            if ($B.$isinstance(y, _b_.float)) {
                throw all_ints()
            } else if ($B.$isinstance(y, _b_.complex)) {
                throw complex_modulo()
            } else if ($B.is_int(y)) {
                if ($B.$isinstance(z, _b_.complex)) {
                    throw complex_modulo()
                } else if (! $B.is_int(z)) {
                    // CPython dispatches three-arg power on the modulus's type
                    // too (pow(10, 2, Decimal(7)) -> Decimal); a float modulus
                    // has no three-arg power and still raises.
                    var zpow = $B.$isinstance(z, _b_.float) ? null :
                        $B.$getattr($B.get_class(z), '__pow__', null)
                    if (zpow) {
                        try {
                            var zr = $B.$call(zpow, x, y, z)
                            if (zr !== _b_.NotImplemented) { return zr }
                        } catch (_err) {}
                    }
                    throw all_ints()
                }
                return _b_.int.nb_power(x, y, z)
            }
        } else if ($B.$isinstance(x, _b_.float)) {
            throw all_ints()
        } else if ($B.$isinstance(x, _b_.complex)) {
            throw complex_modulo()
        }
    }
    var res = $B.$call($B.$getattr(x, '__pow__'), y, z)
    if (res !== _b_.NotImplemented) {
        return res
    }
    var rres = $B.$call($B.$getattr(y, '__rpow__'), x, z)
    if (rres !== _b_.NotImplemented) {
        return rres
    }
    throw $B.EXC(_b_.TypeError,
        "unsupported operand type(s) for pow(): '" + $B.class_name(x) +
        "', '" + $B.class_name(y) + "', '" + $B.class_name(z) + "'")
}

var $print = _b_.print = function() {
    var arg = arguments[0]
    var [args, kw] = $B.parse_args_kw('print', arguments)
    var end = $B.str_dict_get(kw, 'end', '\n'),
        sep = $B.str_dict_get(kw, 'sep', ' '),
        file = $B.str_dict_get(kw, 'file', $B.get_stdout())
    var writer = $B.$getattr(file, 'write')
    for (var i = 0, len = args.length; i < len; i++) {
        var arg = $B.make_str(args[i])
        $B.$call(writer, arg)
        if (i < len - 1) {
            $B.$call(writer, sep)
        }
    }
    $B.$call(writer, end)
    var flush = $B.$getattr(file, 'flush', None)
    if (flush !== None) {
        $B.$call(flush)
    }
    return None
}

$print.ob_type = $B.builtin_function_or_method

var quit = _b_.quit = function() {
    throw _b_.SystemExit
}

quit.__repr__ = function() {
    return "Use quit() or Ctrl-Z plus Return to exit"
}

var repr = _b_.repr = function(obj) {
    check_nb_args_no_kw('repr', 1, arguments)
    var klass = $B.get_class(obj)
    var tp_repr = $B.search_slot(klass, 'tp_repr')
    return tp_repr(obj)
}

var reversed = _b_.reversed

reversed.$factory = function(seq) {
    // Return a reverse iterator. seq must be an object which has a
    // __reversed__() method or supports the sequence protocol (the
    // __len__() method and the __getitem__() method with integer
    // arguments starting at 0).

    check_nb_args_no_kw('reversed', 1, arguments)

    var klass = $B.get_class(seq),
        rev_method = $B.$getattr(klass, '__reversed__', null)
    if (rev_method !== null) {
        return $B.$call(rev_method, seq)
    }
    try {
        var method = $B.$getattr(klass, '__getitem__')
    } catch (err) {
        $B.RAISE(_b_.TypeError, "argument to reversed() must be a sequence")
    }

    var seqlen = _b_.len(seq)
    // Coerce to a JS primitive number — `_b_.len` may return a Brython
    // wrapper for some types; `--` on an object yields NaN.
    if (typeof seqlen !== 'number') {
        if (typeof seqlen === 'bigint') seqlen = Number(seqlen)
        else seqlen = Number(seqlen) | 0
    }
    var res = {
        ob_type: reversed,
        seq,
        len : seqlen,
        // Initialize `counter` here too — CPython's reverseiterator
        // sets index in tp_new. Without this, `next(reversed(seq))`
        // *without* a prior `iter(r)` finds `counter=undefined`,
        // `undefined-- = NaN`, and getitem receives NaN → TypeError
        // "array indices must be integers" from C-typed sequences.
        // (Brython's `for x in r:` does call `iter(r)` which used to
        // mask this, but `next(r)` direct, `assertRaises(StopIteration,
        // next, r)`, and similar patterns triggered it.)
        counter: seqlen,
        getitem: method
    }
    return res
}


/* reversed start */
_b_.reversed.tp_iter = function(self) {
    // CPython semantics: `iter(iterator)` returns the iterator as-is
    // without resetting state. Used to be `self.counter = self.len` to
    // lazy-init the counter on first iteration, but $factory above now
    // seeds it eagerly — re-setting it here re-armed exhausted iterators
    // and `list(exhausted)` returned the whole sequence instead of [].
    return self
}

_b_.reversed.tp_iternext = function*(self){
    self.counter--
    if (self.counter < 0) {
        return
    }
    yield $B.$call(self.getitem, self.seq, self.counter)
}

_b_.reversed.tp_new = function(cls, args, kw) {
    var [seq] = $B.unpack_args('reversed', args, [], {})
    $B.check_kw_empty('reversed', kw)

    var rev_method = $B.$getattr($B.get_class(seq), '__reversed__', $B.NULL)
    if (rev_method !== $B.NULL) {
        return $B.$call(rev_method, seq)
    }
    try {
        var method = $B.$getattr($B.get_class(seq), '__getitem__')
    } catch (err) {
        $B.RAISE(_b_.TypeError, "argument to reversed() must be a sequence")
    }

    var seqlen = _b_.len(seq)
    // Coerce to a JS primitive — `_b_.len` returns a Brython int for some
    // types (which is an object wrapping the value). `self.counter--` on an
    // object is NaN (not a numeric decrement). Make sure `counter` is a JS
    // number primitive.
    if (typeof seqlen !== 'number') {
        if (typeof seqlen === 'bigint') seqlen = Number(seqlen)
        else if (seqlen && seqlen.value !== undefined) seqlen = Number(seqlen.value)
        else seqlen = Number(seqlen)
    }
    var res = {
        ob_type: cls,
        seq,
        len: seqlen,
        // `counter` was missing — `tp_iternext` does `self.counter--`
        // first, so `undefined--` was NaN forever, and getitem received
        // NaN ("array indices must be integers" from wasthon array et al.).
        // Start at `seqlen` so the first post-decrement is the last valid
        // index.
        counter: seqlen,
        getitem: method
    }
    return res
}

var reversed_funcs = _b_.reversed.tp_funcs = {}

reversed_funcs.__length_hint__ = function(self) {
    var n = self.counter
    return n < 0 ? 0 : n
}

reversed_funcs.__reduce__ = function(self) {
    check_nb_args_no_kw('__reduce__', 1, arguments)
    var cls = self.ob_type
    if (self.seq === undefined) {
        return $B.fast_tuple([cls, $B.fast_tuple([$B.fast_tuple([])])])
    }
    return $B.fast_tuple([cls, $B.fast_tuple([self.seq]), self.counter])
}

reversed_funcs.__setstate__ = function(self, state) {
    var n = typeof state === 'bigint' ? Number(state) : state
    if (typeof n !== 'number') { n = Number(n) }
    if (n < -1) { n = -1 }
    if (n > self.len) { n = self.len }
    self.counter = n
    // Must return None: pickle's load_build treats a NULL/undefined result
    // from __setstate__ as a raised exception and corrupts the unpickle stack.
    return _b_.None
}

_b_.reversed.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* reversed end */

$B.set_func_names(reversed, "builtins")

_b_.round = function() {
    var $ = $B.args('round', 2, {number: null, ndigits: null},
                arguments, {ndigits: None}, null, null)
    var arg = $.number,
        n = $.ndigits === None ? 0 : $.ndigits

    var klass

    if (! $B.$isinstance(arg,[_b_.int, _b_.float])) {
        klass = $B.get_class(arg)
        try {
            return $B.$call($B.$getattr(klass, "__round__"), ...arguments)
        } catch (err) {
            if ($B.is_exc(err, [_b_.AttributeError])) {
                $B.RAISE(_b_.TypeError, "type " + $B.class_name(arg) +
                    " doesn't define __round__ method")
            } else {
                throw err
            }
        }
    }

    if (! $B.is_int(n)) {
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(n) +
            "' object cannot be interpreted as an integer")
    }

    klass = $B.get_class(arg)

    if ($B.$isinstance(arg, _b_.float)) {
        return _b_.float.tp_funcs.__round__(arg, $.ndigits)
    }

    var mult = Math.pow(10, n),
        x = arg * mult,
        floor = Math.floor(x),
        diff = Math.abs(x - floor),
        res
    if (diff == 0.5) {
        if (floor % 2) {
            floor += 1
        }
        res = _b_.int.nb_true_divide(floor, mult)
    } else {
        res = _b_.int.nb_true_divide(Math.round(x), mult)
    }
    if (res.value === Infinity || res.value === -Infinity) {
        $B.RAISE(_b_.OverflowError,
            "rounded value too large to represent")
    }
    if ($.ndigits === None) {
        // Always return an integer
        return Math.floor(res.value)
    } else {
        // Return the same type as argument
        return $B.$call(klass, res)
    }
}

_b_.setattr = function() {
    var $ = $B.args('setattr', 3, {obj: null, attr: null, value: null},
                arguments, null, null, null)
    var obj = $.obj,
        attr = $.attr,
        value = $.value
    if (!(typeof attr == 'string')) {
        $B.RAISE(_b_.TypeError, "setattr(): attribute name must be string")
    }
    return $B.$setattr(obj, attr, value)
}

$B.$setattr1 = function(obj, attr, value, inum) {
    try {
        $B.$setattr(obj, attr, value)
    } catch (err) {
        $B.set_inum(inum)
        throw err
    }
}

$B.$setattr = function(obj, attr, value) {
    // Used in the generated code, avoids having to parse the arguments
    // since we know we will get the 3 values
    var test = false // attr === "className" // && value == "my doc."
    if (test) {
        console.log("set attr", attr, "of", obj, "klass", $B.get_class(obj), "to", value)
    }
    var klass = $B.get_class(obj)
    var setattr = klass.tp_setattro
    if (test) {
        console.log('seattr', obj, attr, value, 'setattr func', setattr)
    }
    if (setattr === $B.NULL) {
        $B.RAISE(_b_.AttributeError, 'no setattr')
    }
    setattr(obj, attr, value)
    return _b_.None
}

_b_.sorted = function() {
    var $ = $B.args('sorted', 1, {iterable: null}, arguments, null, null,
                'kw')
    var _list = _b_.list.$factory($.iterable)
    _b_.list.tp_funcs.sort(_list, $B.dict2kwarg($.kw))
    return _list
}


// str() defined in py_string.js

_b_.sum = function() {
    var $ = $B.args('sum', 2, {iterable: null, start: null},
                arguments, {start: 0}, null, null)
    var iterable = $.iterable,
        start = $.start

    if ($B.$isinstance(start, [_b_.str, _b_.bytes])) {
        $B.RAISE(_b_.TypeError, "sum() can't sum bytes" +
            " [use b''.join(seq) instead]")
    }

    var res = start
    iterable = iter(iterable)
    while (true) {
        try {
            var _item = next(iterable)
            res = $B.rich_op('__add__', res, _item)
        } catch (err) {
           if ($B.is_exc(err, [_b_.StopIteration])) {
               break
           } else {
               throw err
           }
        }
    }
    return res
}

var $$super = _b_.super


function supercheck(type, obj) {
    /* obj can be a class, or an instance of one:

       - If it is a class, it must be a subclass of 'type'. This case is
         used for class methods; the return value is obj.

       - If it is an instance, it must be an instance of 'type'. This is
         the normal case; the return value is obj.__class__.

       But... when obj is an instance, we want to allow for the case where
       Py_TYPE(obj) is not a subclass of type, but obj.__class__ is!
       This will allow using super() with a proxy for obj.
    */

    /* Check for first bullet above (special case) */
    if ($B.is_type(obj) && _b_.issubclass(obj, type)) {
        return obj
    }

    /* Normal case */
    if (_b_.issubclass($B.get_class(obj), type)) {
        return $B.get_class(obj)
    } else {
        var class_attr = $B.$getattr(obj, '__class__', $B.NULL)
        if(class_attr !== $B.NULL && $B.is_type(class_attr) &&
                class_attr !== $B.get_class(obj)){
            if (_b_.issubclass(class_attr, type)) {
                return class_attr
            }
        }
    }

    var type_or_instance, obj_str

    if ($B.is_type(obj)) {
        type_or_instance = "type"
        obj_str = obj.tp_name
    } else {
        type_or_instance = "instance of"
        obj_str = $B.class_name(obj)
    }
    $B.RAISE(_b_.TypeError,
        `super(type, obj): obj (${type_or_instance} ${obj_str}) is not ` +
        `an instance or subtype of type (${type.tp_name}).`
    )
}

/* super start */
_b_.super.tp_repr = function(self) {
    $B.builtins_repr_check($$super, arguments) // in brython_builtins.js
    var res = "<super: <class '" + $B.get_name(self.type) + "'>"
    if (self.obj_type !== undefined) {
        res += ', <' + $B.get_name($B.get_class(self.obj_type)) + ' object>'
    } else {
        res += ', NULL'
    }
    return res + '>'
}

_b_.super.tp_getattro = function(self, attr) {
    /* We want __class__ to return the class of the super object
       (i.e. super, or a subclass), not the class of su->obj. */
    var $test = false // attr == "__new__" //&& self.type.tp_name == 'Z'
    if (attr == "__class__") {
        return _b_.object.tp_getattro(self, attr)
    }
    if (self.type.$is_js_class) {
        if (attr == "__init__") {
            // use call on parent
            return function() {
                mro[0].$js_func.call(self.obj_type, ...arguments)
            }
        }
    }
    if (self.obj === _b_.None) {
        return _b_.object.tp_getattro(self, attr)
    }
    // Determine method resolution order from object_or_type
    var object_or_type = self.obj,
        mro = $B.get_mro(self.obj_type)
    // Search of method attr starts in mro after self.__thisclass__
    var search_start = mro.indexOf(self.type) + 1,
        search_classes = mro.slice(search_start)

    if ($test) {
        console.log('super.tp_getattro, self', self, 'attr', attr)
        console.log('search classes', search_classes)
        console.log('frame obj', $B.frame_obj)
    }

    if ($test) {
        console.log('super.__ga__, self', self, 'search classes', search_classes)
        console.log('frame obj', $B.frame_obj)
    }

    var f
    for (var klass of search_classes) {
        if ($test) {
            console.log('search', attr, 'in dict of', klass)
        }
        var in_dict = $B.search_in_dict(klass, attr, $B.NULL)
        if (in_dict !== $B.NULL) {
            if ($test) {
                console.log('found in dict of', klass)
            }
            f = in_dict
            break
        }
    }

    if (f === undefined) {
        if ($$super[attr] !== undefined) {
            return (function(x) {
                return function() {
                    var args = [x]
                    for (var i = 0, len = arguments.length; i < len; i++) {
                        args.push(arguments[i])
                    }
                    return $$super[attr].apply(null, args)
                }
            })(self)
        }
        if ($test) {
            console.log("no attr", attr, self, "mro", mro)
        }
        return _b_.object.tp_getattro(self, attr)
    }

    if ($test) {
        console.log("super", attr, self, "mro", mro,
            "found in mro[0]", mro[0], '\nf',
            f, 'type(f)', $B.get_class(f))
    }
    var f_cls = $B.get_class(f)
    var getter = f_cls.tp_descr_get
    var res
    if (getter !== $B.NULL) {
        if ($test) {
            console.log('call getter', getter)
            console.log('args', self.obj, self.obj_type)
        }
        res = getter(f, self.obj, self.obj_type)
    } else {
        res = f
    }
    if ($test) {
        console.log('result of super.tp_getattro', attr, res)
    }
    if (res === $B.NULL) {
        return _b_.object.tp_getattro(self, attr)
    }
    return res
}

_b_.super.tp_descr_get = function(self, instance) {
    // https://www.artima.com/weblogs/viewpost.jsp?thread=236278
    if (instance === $B.NULL) {
        return self
    }
    return $B.$call($$super, self.type, instance)
}

_b_.super.tp_init = function(self, _type, object_or_type) {
    var $ = $B.args('__init__', 3,
                {self: null, type: null, object_or_type: null},
                arguments,
                {type: _b_.None, object_or_type: _b_.None})
    var self = $.self,
        type = $.type,
        object_or_type = $.object_or_type
    if (object_or_type === _b_.None) {
        if (type === _b_.None) {
            var frame = $B.frame_obj.frame,
                pyframe = $B.module_getattr($B.imported["_sys"], '_getframe')(),
                code = $B.$getattr(pyframe, 'f_code'),
                co_varnames = $B.$getattr(code, 'co_varnames')
            if (co_varnames.length > 0) {
                type = $B.get_class(frame[1])
                if (type === undefined) {
                    $B.RAISE(_b_.RuntimeError, "super(): no arguments")
                }
                object_or_type = frame[1][co_varnames[0]]
            } else {
                $B.RAISE(_b_.RuntimeError, "super(): no arguments")
            }
            self.type = type
            self.obj = object_or_type
            self.obj_type = supercheck(type, object_or_type)
            return
        } else {
            self.type = type
            self.obj = _b_.None
            self.obj_type = _b_.None
            return
        }
    }
    if (Array.isArray(object_or_type)) {
        object_or_type = object_or_type[0]
    }
    self.type = type
    self.obj = object_or_type
    self.obj_type = supercheck(type, object_or_type)
}

_b_.super.tp_new = function(cls) {
    var res = {
        ob_type: cls
    }
    $B.init_dict(res)
    return res
}

var super_funcs = _b_.super.tp_funcs = {}

_b_.super.tp_members =  [
    ["__thisclass__", $B.TYPES.OBJECT, "type", 1],
    ["__self__",  $B.TYPES.OBJECT, "obj", 1],
    ["__self_class__", $B.TYPES.OBJECT, "obj_type", 1]
]

/* super end */

$B.set_func_names($$super, "builtins")

_b_.vars = function() {
    var $ = $B.args('vars', 1, {obj: null}, arguments, {obj: $B.NULL}, null, null)
    var obj = $.obj
    if (obj === $B.NULL) {
        return _b_.locals()
    } else {
        if ($B.get_dict(obj)) {
            return $B.get_dict(obj)
        } else {
            $B.RAISE(_b_.TypeError, "vars() argument must have __dict__ attribute")
        }
    }
}

var zip = _b_.zip

zip.$factory = function() {
    var res = {
        ob_type: zip,
        items: []
    }
    if (arguments.length == 0) {
        return res
    }
    var [args, kw] = $B.parse_args_kw('zip', arguments)
    var strict = $B.$bool($B.str_dict_get(kw, 'strict', false))
    var iters = []
    for (var arg of args) {
        iters.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: zip,
        iters,
        strict
    }
}

/* zip start */
_b_.zip.tp_iter = function(self) {
    return self
}

_b_.zip.tp_iternext = function*(self){
    var res = [],
        len = self.iters.length
    for (var i = 0; i < len; i++) {
        var v = self.iters[i].next()
        if (v.done) {
            if (self.strict) {
                if (i > 0) {
                    $B.RAISE(_b_.ValueError,
                        `zip() argument ${i + 1} is longer than argument ${i}`)
                } else {
                    for (var j = 1; j < len; j++) {
                        var v1 = self.iters[j].next()
                        if (! v1.done) {
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

_b_.zip.tp_new = function(cls, args, kw) {
    var res = {
        ob_type: cls,
        items: []
    }
    var strict = $B.$bool($B.str_dict_get(kw, 'strict', false))
    var iters = []
    for (var arg of args) {
        iters.push($B.make_js_iterator(arg))
    }
    return {
        ob_type: cls,
        iters,
        strict
    }
}

var zip_funcs = _b_.zip.tp_funcs = {}

zip_funcs.__reduce__ = function(self) {

}

zip_funcs.__setstate__ = function(self) {

}

_b_.zip.tp_methods = ["__reduce__", "__setstate__"]

/* zip end */

$B.set_func_names(zip, "builtins")

// built-in constants : True, False, None

function no_set_attr(klass, attr) {
    if (klass[attr] !== undefined) {
        $B.RAISE_ATTRIBUTE_ERROR("'" + klass.__name__ +
            "' object attribute '" + attr + "' is read-only", klass, attr)
    } else {
        throw $B.attr_error(attr, klass)
    }
}

// True and False are the same as Javascript true and false

var True = _b_.True = true
var False = _b_.False = false

var ellipsis = $B.ellipsis

ellipsis.$factory = function() {
    return Ellipsis
}

ellipsis.tp_repr = function() {
    return 'Ellipsis'
}

ellipsis.tp_new = function() {
    return Ellipsis
}

var Ellipsis = _b_.Ellipsis = {
    ob_type: ellipsis
}

// pickled as a global reference, like CPython (ellipsis_reduce)
ellipsis.tp_funcs = {
    __reduce__: function() {
        return 'Ellipsis'
    }
}
ellipsis.tp_methods = ['__reduce__']

$B.set_func_names(ellipsis)

_b_.__BRYTHON__ = __BRYTHON__


})(__BRYTHON__);


