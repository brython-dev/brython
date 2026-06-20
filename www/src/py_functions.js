"use strict";
(function($B) {

var _b_ = $B.builtins

//classmethod() (built in class)
var classmethod = _b_.classmethod

classmethod.$factory = function(func) {
    $B.check_nb_args_no_kw('classmethod', 1, arguments)
    var res = {
        ob_type: classmethod,
        cm_callable: func
    }
    $B.init_dict(res)
    return res
}

/* classmethod start */
_b_.classmethod.tp_repr = function(self) {
    return `<classmethod(${_b_.repr(self.cm_callable)})>`
}

_b_.classmethod.tp_descr_get = function(self, obj, type) {
    if (! self.hasOwnProperty("cm_callable")) {
        $B.RAISE(_b_.RuntimeError, "uninitialized classmethod object")
    }
    if (type === undefined) {
        type = $B.get_class(obj)
    }
    return $B.$call($B.method, self.cm_callable, type)
}

_b_.classmethod.tp_init = function(self, func) {
    self.cm_callable = func
}

_b_.classmethod.tp_new = function(cls, args, kw) {
    var res = {
        ob_type: cls
    }
    $B.init_dict(res)
    return res
}

var classmethod_funcs = _b_.classmethod.tp_funcs = {}

classmethod_funcs.__annotate___get = function(self) {

}

classmethod_funcs.__annotate___set = function(self) {

}

classmethod_funcs.__annotations___get = function(self) {

}

classmethod_funcs.__annotations___set = function(self) {

}

classmethod_funcs.__class_getitem__ = $B.$class_getitem

classmethod_funcs.__isabstractmethod___get = function(self) {
    var res = $B.get_from_dict(self.cm_callable, '__isabstractmethod__', $B.NULL)
    if (res === $B.NULL) {
        return false
    }
    return res
}

classmethod_funcs.__isabstractmethod___set = _b_.None

_b_.classmethod.classmethods = ["__class_getitem__"]

_b_.classmethod.tp_members = [
    ["__func__", $B.TYPES.OBJECT, "cm_callable", 1],
    ["__wrapped__", $B.TYPES.OBJECT, "cm_callable", 1]
]

_b_.classmethod.tp_getset = ["__isabstractmethod__", "__annotations__", "__annotate__"]

/* classmethod end */

$B.set_func_names(classmethod, "builtins")

// staticmethod() built in function
var staticmethod = _b_.staticmethod
staticmethod.$factory = function(func) {
    return {
        ob_type: staticmethod,
        sm_callable: func
    }
}

/* staticmethod start */
_b_.staticmethod.tp_repr = function(self) {
    return `<staticmethod(${_b_.repr(self.sm_callable)})>`
}

_b_.staticmethod.tp_call = function(self, ...args) {
    return self.sm_callable(...args)
}

_b_.staticmethod.tp_descr_get = function(self) {
    return self.sm_callable
}

_b_.staticmethod.tp_init = function(self, func) {
    self.sm_callable = func
}

_b_.staticmethod.tp_new = function(cls, args, kw) {
    return {
        ob_type: cls,
        sm_callable: _b_.None
    }
}

var staticmethod_funcs = _b_.staticmethod.tp_funcs = {}

staticmethod_funcs.__annotate___get = function(self) {

}

staticmethod_funcs.__annotate___set = function(self) {

}

staticmethod_funcs.__annotations___get = function(self) {

}

staticmethod_funcs.__annotations___set = function(self) {

}

staticmethod_funcs.__class_getitem__ = function(self) {

}

staticmethod_funcs.__dict___get = function(self) {

}

staticmethod_funcs.__dict___set = function(self) {

}

staticmethod_funcs.__isabstractmethod___get = function(self) {

}

staticmethod_funcs.__isabstractmethod___set = function(self) {

}

_b_.staticmethod.classmethods = ["__class_getitem__"]

_b_.staticmethod.tp_members = [
    ["__func__", $B.TYPES.OBJECT, "sm_callable", 1],
    ["__wrapped__", $B.TYPES.OBJECT, "sm_callable", 1]
]

_b_.staticmethod.tp_getset = ["__isabstractmethod__", "__dict__", "__annotations__", "__annotate__"]

/* staticmethod end */

$B.set_func_names(staticmethod, "builtins")


/* builtin_function_or_method start */
$B.builtin_function_or_method.tp_richcompare = function(self, other, op) {
    if((op != '__eq__' && op != '__ne__') ||
        ! $B.$isinstance(self, $B.builtin_function_or_method) ||
        ! $B.$isinstance(other, $B.builtin_function_or_method)){
        return _b_.NotImplemented
    }
    var res
    var eq = self === other
    if (op == '__eq__') {
        res = eq
    } else {
        res = ! eq
    }
    return res
}

$B.builtin_function_or_method.tp_repr = function(self) {
    if (self.m_self) {
        return `<built-in method ${self.ml.ml_name} ` +
            `of ${$B.class_name(self.m_self)} object>`
    } else {
        var name = self.$function_infos[$B.func_attrs.__name__]
        return `<built-in function ${name}>`
    }
}

$B.builtin_function_or_method.tp_hash = function(self) {
    return _b_.object.tp_hash(self)
}

$B.builtin_function_or_method.tp_call = function(self, ...args) {
    return self(...args)
}

var builtin_function_or_method_funcs = $B.builtin_function_or_method.tp_funcs = {}

builtin_function_or_method_funcs.__name___get = function(self) {
    if (self.$function_infos === undefined) {
        console.log('no function infos', self)
    }
    return self.$function_infos[$B.func_attrs.__name__]
}

builtin_function_or_method_funcs.__name___set = _b_.None

builtin_function_or_method_funcs.__qualname___get = function(self) {
    return self.$function_infos[$B.func_attrs.__qualname__]

}

builtin_function_or_method_funcs.__qualname___set = _b_.None

builtin_function_or_method_funcs.__reduce__ = function(self) {
    var name = self.ml ? self.ml.ml_name :
        self.$function_infos[$B.func_attrs.__name__]
    if(self.m_self !== undefined && self.m_self !== null &&
            ! $B.$isinstance(self.m_self, $B.module)){
        return $B.fast_tuple([_b_.getattr,
            $B.fast_tuple([self.m_self, name])])
    }
    return name
}

builtin_function_or_method_funcs.__self___get = function(self) {
    return $B.imported.builtins
}

builtin_function_or_method_funcs.__self___set = _b_.None

builtin_function_or_method_funcs.__text_signature___get = function(self) {

}

builtin_function_or_method_funcs.__text_signature___set = function(self) {

}

$B.builtin_function_or_method.tp_methods = ["__reduce__"]

$B.builtin_function_or_method.tp_members = [
    ["__module__", $B.TYPES.OBJECT, "m_module", 0]
]

$B.builtin_function_or_method.tp_getset = [
    "__name__", "__qualname__", "__self__", "__text_signature__"
]

/* builtin_function_or_method end */

$B.set_func_names($B.builtin_function_or_method, "builtins")

// add attributes to native Function

function doc_set(f, value) {
    $B.check_infos(f)
    f.$infos.__doc__ = value
}

function module_get(f) {
    $B.check_infos(f)
    return f.$infos.__module__
}

function module_set(f, value) {
    $B.check_infos(f)
    f.$infos.__module__ = value
}

function name_get(f) {
    $B.check_infos(f)
    return f.$infos.__name__
}

function name_set(f, value) {
    $B.check_infos(f)
    if (! $B.is_str(value)) {
        $B.RAISE(_b_.TypeError,
            '__name__ must be set to a string object')
    }
    f.$infos.__name__ = value
}

function qualname_get(f) {
    $B.check_infos(f)
    return f.$infos.__qualname__
}

function qualname_set(f, value) {
    $B.check_infos(f)
    if (! $B.is_str(value)) {
        $B.RAISE(_b_.TypeError,
            '__qualname__ must be set to a string object')
    }
    f.$infos.__qualname__ = value
}

function type_params_get(f) {
    $B.check_infos(f)
    return f.$infos.__type_params__
}
function type_params_set(f, value) {
    $B.check_infos(f)
    if (! $B.is_tuple(value)) {
        $B.RAISE(_b_.TypeError,
            'TypeError: __type_params__ must be set to a tuple')
    }
    f.$infos.__type_params__ = value
}

function globals_get(f) {
    $B.check_infos(f)
    return $B.obj_dict($B.imported[f.$infos.__module__])
}

$B.function.$factory = function() {
    var $ = $B.args('FunctionType', 2, {code: null, globals: null},
                arguments, null, null, 'kw')
    var code = $.code
    var __name__ = $B.str_dict_get($.kw, 'name', code.co_name) // function name
    var frame = $B.frame_obj.frame
    var globals_name = 'locals_' + __name__
    var __file__ = frame.__file__
    var func = new Function('_b_', '__file__', globals_name, 'return ' + code.co_code)
    var f = func(_b_, __file__, $.globals)
    $B.set_function_infos(f,
        {
            __name__,
            __qualname__: frame[2] + '.' + __name__
        }
    )
    var kwargs = $.kw
    if (kwargs.hasOwnProperty('argdefs')) {
        $B.set_function_attr(f, '__defaults__', kwargs.argdefs)
    }
    if (kwargs.hasOwnProperty('kwdefaults')) {
        $B.set_function_attr(f, '__kwdefaults__', kwargs.kwdefaults)
    }
    return f
}

/* function start */
$B.function.tp_repr = function(self) {
    if (self.$function_infos) {
        return `<function ${self.$function_infos[$B.func_attrs.__qualname__]}>`
    } else if (self.$infos === undefined) {
        return '<function ' + self.name + '>'
    } else {
        return '<function ' + self.$infos.__qualname__ + '>'
    }
}

$B.function.tp_call = function(self, ...args) {
    return self(...args)
}

$B.function.tp_descr_get = function(self, obj) {
    if (obj === $B.NULL) {
        return self
    }
    return $B.$call($B.method, self, obj)
}

$B.function.tp_new = function(cls, args, kw) {
    var f = $B.function.$factory(...args)
    f.cls = cls
    return f
}

var function_funcs = $B.function.tp_funcs = {}

function_funcs.__annotate___get = function(self) {
    return self.__annotate__ ?? _b_.None
}

function_funcs.__annotate___set = function(self, value) {
    self.__annotate__ = value
}

function_funcs.__annotations___get = function(self) {
    $B.check_infos(self)
    if (self.__annotations__ !== undefined) {
        return self.__annotations__
    } else {
        if (self.__annotate__ === _b_.None) {
            return self.__annotations__ = $B.empty_dict()
        } else {
            return self.__annotations__ = self.__annotate__(1)
        }
    }
}

function_funcs.__annotations___set = function(self, value) {
    $B.check_infos(self)
    if (! $B.is_dict(value)) {
        $B.RAISE(_b_.TypeError,
            '__annotations__ must be set to a dict object')
    }
    self.__annotations__ = value
}

function_funcs.__builtins___get = function(self) {
    $B.check_infos(self)
    if (self.$infos && self.$infos.__globals__) {
        return _b_.dict.$getitem(self.$infos.__globals__, '__builtins__')
    }
    return $B.obj_dict(_b_)
}

function_funcs.__builtins___set = _b_.None

function_funcs.__closure___get = function(self) {
    if (self.$closure) {
        return self.$closure
    }
    var free_vars = self.$function_infos[$B.func_attrs.free_vars]
    if (free_vars === undefined || free_vars.length == 0) {
        return _b_.None
    }
    var cells = []
    for (var i = 0; i < free_vars.length; i++) {
        try {
            cells.push($B.cell.$factory($B.$check_def_free(free_vars[i])))
        } catch (err) {
            // empty cell
            cells.push($B.cell.$factory(_b_.None))
        }
    }
    return $B.fast_tuple(cells)
}

function_funcs.__closure___set = _b_.None

function_funcs.__code___get = function(self) {
    $B.check_infos(self)
    var res = {
        ob_type: $B.code
    }
    $B.init_dict(res)
    for (var attr in self.$infos.__code__) {
        res[attr] = self.$infos.__code__[attr]
    }
    res.co_name = self.$infos.__name__
    res.co_filename = self.$infos.__code__.co_filename
    res.co_code = self + "" // Javascript source code
    return res
}

function_funcs.__code___set = function(self, value) {
    $B.check_infos(self)
    if (! $B.$isinstance(value, $B.code)) {
        $B.RAISE(_b_.TypeError,
            '__code__ must be set to a code object')
    }
    self.$infos.__code__ = value
}

function_funcs.__defaults___get = function(self) {
    $B.check_infos(self)
    return self.$infos.__defaults__
}

function_funcs.__defaults___set = function(self, value) {
    $B.check_infos(self)
    if (value === _b_.None) {
        value = []
    } else if (! $B.is_tuple(value)) {
        $B.RAISE(_b_.TypeError,
            "__defaults__ must be set to a tuple object")
    }
    self.$infos.__defaults__ = value
    self.$function_infos[$B.func_attrs.__defaults__] = value
    // Make a new version of arguments parser
    reset_args_parser(self)
}

function_funcs.__dict___get = function(self) {
    return $B.get_dict(self)
}

function_funcs.__dict___set = function(self, value) {
    if (value === $B.NULL) {
        $B.RAISE(_b_.TypeError, "cannot delete __dict__")
    }
    if (! $B.is_dict(value)) {
        $B.RAISE(_b_.TypeError,
            `__dict__ must be set to a dictionary, not a ` +
            `'${$B.class_name(value)}'`
        )
    }
    $B.set_dict(self, value)
}

function_funcs.__doc___get = function(self) {
    return self.$function_infos[$B.func_attrs.__doc__]
}

function_funcs.__doc___set = function(self, value) {
    self.$function_infos[$B.func_attrs.__doc__] = value
}

function_funcs.__globals___get = function(self) {
    var frame = self.$function_infos[$B.func_attrs.__globals__]
    return $B.obj_dict(frame[3])
}

function_funcs.__globals___set = _b_.None

function_funcs.__kwdefaults___get = function(self) {
    $B.check_infos(self)
    return self.$infos.__kwdefaults__
}

function_funcs.__kwdefaults___set = function(self, value) {
    $B.check_infos(self)
    if (value == _b_.None) {
        value = $B.empty_dict()
    } else if (! $B.is_dict(value)) {
        $B.RAISE(_b_.TypeError,
            '__kwdefaults__ must be set to a dict object')
    }
    self.$infos.__kwdefaults__ = value
    var kwd = {}
    for (var item of _b_.dict.$iter_items(value)) {
        kwd[item.key] = item.value
    }
    self.$function_infos[$B.func_attrs.__kwdefaults__] = kwd
    // Make a new version of arguments parser
    reset_args_parser(self)
}

function_funcs.__module___get = function(self) {
    return self.$function_infos[$B.func_attrs.__module__]
}

function_funcs.__module___set = function(self, value) {
    self.$function_infos[$B.func_attrs.__module__] = value
}

function_funcs.__name___get = function(self) {
    return self.$function_infos[$B.func_attrs.__name__]
}

function_funcs.__name___set = function(self, value) {
    self.$function_infos[$B.func_attrs.__name__] = value
}

function_funcs.__qualname___get = function(self) {
    return self.$function_infos[$B.func_attrs.__qualname__]
}

function_funcs.__qualname___set = function(self, value) {
    self.$function_infos[$B.func_attrs.__qualname__] = value
}

function_funcs.__type_params___get = function(self) {
    var res = self.$function_infos[$B.func_attrs.__type_params__]
    return $B.fast_tuple(res)
}

function_funcs.__type_params___set = function(self, value) {
    self.$function_infos[$B.func_attrs.__type_params__] = value
}

$B.function.tp_getset = [
    "__code__", "__defaults__", "__kwdefaults__", "__annotations__",
    "__annotate__", "__dict__", "__name__", "__qualname__", "__type_params__",
    // the following are members in CPython
    "__builtins__", "__closure__", "__doc__", "__globals__", "__module__"
]


/* function end */

$B.set_func_names($B.function, "builtins")

$B.check_infos = function(f) {
    if (! f.$infos) {
        if (f.$function_infos) {
            $B.make_function_infos(f, ...f.$function_infos)
        } else {
            console.log('no $infos, no $function_infos')
        }
    }
}

$B.make_function_infos = function(f, __module__, co_name, co_qualname,
        co_filename, __defaults__, __kwdefaults__, __doc__, arg_names,
        vararg, kwarg,
        co_argcount, co_firstlineno,
        co_flags, co_freevars, co_kwonlyargcount,
        co_posonlyargcount, co_varnames,
        annotations, type_params
        ){
    f.$is_func = true
    f.$args_parser = $B.make_args_parser_and_parse
    if (co_flags & $B.COMPILER_FLAGS.COROUTINE) {
        f.$is_async = true
    }
    __defaults__ = __defaults__ === _b_.None ? [] : __defaults__
    __defaults__.ob_type = _b_.tuple
    __kwdefaults__ = __kwdefaults__ === _b_.None ? _b_.None :
        _b_.dict.$from_js(__kwdefaults__)
    f.$infos = {__module__,
        __defaults__, __kwdefaults__, __doc__, arg_names,
        vararg, kwarg}
    f.$infos.__name__ = co_name
    f.$infos.__qualname__ = co_qualname
    type_params = type_params ?? []
    type_params.ob_type = _b_.tuple
    f.$infos.__type_params__ = type_params
    co_freevars = co_freevars ?? []
    co_freevars.ob_type = _b_.tuple
    co_varnames = co_varnames ?? []
    co_varnames.ob_type = _b_.tuple
    if (annotations) {
        // passed with 'from __future__ import annotations'
        f.__annotations__ = _b_.dict.$literal(annotations)
    }
    f.$infos.__code__ = {co_argcount, co_filename, co_firstlineno,
        co_flags, co_freevars, co_kwonlyargcount, co_name,
        co_nlocals: co_varnames.length,
        co_posonlyargcount, co_qualname, co_varnames
        }
    f.$infos.__code__.co_positions = () => $B.$list([])
    f.$infos.__code__.co_positions.ob_type = $B.function
    $B.init_dict(f.$infos)
}

function missing_names(missing) {
    var len = missing.length
    var plural = len == 1 ? '' : 's'
    var report
    switch (len) {
        case 1:
            report = `${missing[0]}`
            break
        case 2:
            report = `${missing[0]} and ${missing[1]}`
            break
        default:
            report = `${missing.slice(0, len - 1).join(', ')}, and ` +
                `${missing[len - 1]}`
            break
    }
    return report
}

function add_to_kwargs(kw_dict, key, value) {
    $B.str_dict_set(kw_dict, key, value)
}

function reset_args_parser(self) {
    self.$arguments_parser = make_arguments_parser(self)
}

$B.args_parser = function(f, args) {
    if (! f.$arguments_parser) {
        f.$arguments_parser = make_arguments_parser(f)
    }
    return f.$arguments_parser(f, args)
}

function make_arguments_parser(f) {
    /*
    var parse_debug = 0
    if (parse_debug) {
        for (var attr in $B.func_attrs) {
            console.log(attr, f.$function_infos[$B.func_attrs[attr]])
        }
    }
    */

    var infos = f.$function_infos
    var name = infos[$B.func_attrs.__name__]
    var arg_names = infos[$B.func_attrs.arg_names]
    var positional_length = infos[$B.func_attrs.positional_length]
    var kwonly_length = infos[$B.func_attrs.kwonlyargs_length]
    var vararg = infos[$B.func_attrs.args_vararg]
    var kwarg = infos[$B.func_attrs.args_kwarg]
    var defaults = infos[$B.func_attrs.__defaults__]
    var posonly_length = infos[$B.func_attrs.posonlyargs_length]
    var kwonly_defs = infos[$B.func_attrs.__kwdefaults__]
    var nb_formal = positional_length + kwonly_length

    var parser = function(f, args) {

        var def_obj
        if (defaults !== _b_.None) {
            def_obj = {}
            var start_defs = positional_length - defaults.length
            for (var i = start_defs; i < positional_length; i++) {
                def_obj[arg_names[i]] = defaults[i - start_defs]
            }
        }
        if (kwonly_defs !== _b_.None) {
            def_obj = def_obj ?? {}
            for (var key in kwonly_defs) {
                def_obj[key] = kwonly_defs[key]
            }
        }

        var too_many_pos = 0
        var posonly_as_keywords

        const locals = $B.empty_dict()
        var filled_pos = 0
        var vargs

        if (kwarg !== null) {
            locals[kwarg] = $B.empty_dict()
        }

        const args_length = args.length
        const last_arg = args[args_length - 1]
        const has_kw = last_arg?.$kw

        const nb_pos = has_kw ? args_length - 1 : args_length

        if (vararg !== null) {
            locals[vararg] = vargs = $B.fast_tuple()
        }

        if (nb_pos <= positional_length) {
            for (let iarg = 0; iarg < nb_pos; iarg++) {
                locals[arg_names[iarg]] = args[iarg]
            }
            filled_pos = nb_pos
        } else {
            for (let iarg = 0; iarg < positional_length; iarg++) {
                locals[arg_names[iarg]] = args[iarg]
            }
            filled_pos = positional_length
            if (vararg !== null) {
                for (let j = positional_length; j < nb_pos; j++) {
                    vargs.push(args[j])
                }
            } else {
                too_many_pos = nb_pos - positional_length
            }
        }

        if (has_kw) {

            function add_key(key, value) {
                var index = arg_names.indexOf(key)
                if (index == -1) {
                    if (kwarg) {
                        add_to_kwargs(locals[kwarg], key, value)
                        return
                    } else {
                        $B.RAISE(_b_.TypeError, name +
                            `() got an unexpected keyword argument '${key}'`)
                    }
                }
                if (locals.hasOwnProperty(key)) {
                    if (kwarg && index < posonly_length) {
                        $B.str_dict_set(locals[kwarg], key, value)
                        return
                    }
                    $B.RAISE(_b_.TypeError, name +
                        `() got multiple values for argument '${key}'`)
                }
                if (index < posonly_length) {
                    if(defaults === _b_.None ||
                            index <= positional_length - defaults.length){
                        // no default value for key as positional
                        if (kwarg) {
                            $B.str_dict_set(locals[kwarg], key, value)
                        } else {
                            posonly_as_keywords = posonly_as_keywords ?? []
                            posonly_as_keywords.push(key)
                        }
                    }
                } else {
                    locals[key] = value
                    filled_pos++
                }
            }

            var elt = last_arg
            for (let key in elt.$kw[0]) {
                add_key(key, elt.$kw[0][key])
            }
            for (let i = 1; i< elt.$kw.length; i++) {
                if ($B.get_class(elt.$kw[i]) === _b_.dict) {
                    for (let item of _b_.dict.$iter_items(elt.$kw[i])) {
                        add_key(item.key, item.value)
                    }
                } else {
                    let klass = $B.get_class(elt.$kw[i])
                    let keys_method = $B.$getattr(klass, 'keys', null)
                    let getitem = $B.$getattr(klass, '__getitem__', null)
                    if (keys_method === null || getitem === null) {
                        $B.RAISE(_b_.TypeError,
                            `${name} argument after ** must be a mapping, ` +
                            `not ${$B.class_name(elt.$kw[i])}`)
                    }
                    for (let key of $B.make_js_iterator(keys_method(elt.$kw[i]))) {
                        add_key(key, getitem(elt.$kw[i], key))
                    }
                }
            }
        }

        if (too_many_pos > 0) {
            var plural = positional_length == 1 ? '' : 's'
            var nb = positional_length + too_many_pos
            var report = positional_length
            if (defaults.length) {
                var nb_min = positional_length - defaults.length
                report = `from ${nb_min} to ${positional_length}`
                plural = 's'
            }
            $B.RAISE(_b_.TypeError,
                `${name}() takes ${report} positional argument` +
                `${plural} but ${nb} ${nb == 1 ? 'was' : 'were'} given`)
        }

        if (posonly_as_keywords) {
            $B.RAISE(_b_.TypeError,
                `${name}() got some positional-only arguments passed as keyword ` +
                `arguments: '${posonly_as_keywords.join(', ')}'`)
        }

        if (nb_formal == 0) {
            // form f(*args, **kw): ...
            return locals
        }

        // use default values
        if (filled_pos < nb_formal) {
            for (let key in def_obj) {
                if (! locals.hasOwnProperty(key)) {
                    locals[key] = def_obj[key]
                    filled_pos++
                }
            }

            if (filled_pos < nb_formal) {
                // Report error
                var missing_positional = []
                var missing_kwonly = []
                for (let i = 0; i < nb_formal; i++) {
                    let arg_name = arg_names[i]
                    if (! locals.hasOwnProperty(arg_name)) {
                        if (i < positional_length) {
                            missing_positional.push(`'${arg_name}'`)
                        } else {
                            missing_kwonly.push(`'${arg_name}'`)
                        }
                    }
                }
                var missing
                var missing_type
                var report
                if (missing_positional.length) {
                    missing = missing_positional
                    missing_type = 'positional'
                } else {
                    missing = missing_kwonly
                    missing_type = 'keyword-only'
                }
                var report = missing_names(missing)
                var nb_missing = missing.length
                var plural = nb_missing == 1 ? '' : 's'
                $B.RAISE(_b_.TypeError, name +
                    `() missing ${nb_missing} required ${missing_type} ` +
                    `argument${plural}: ${report}`)
            }
        }

        return locals
    }

    return parser
}


})(__BRYTHON__);