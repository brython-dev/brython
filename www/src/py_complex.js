"use strict";
(function($B) {

var _b_ = $B.builtins

function conv_complex(...objs) {
    var res = []
    for (var obj of objs) {
        if ($B.$isinstance(obj, _b_.float)) {
            res.push($B.make_complex(obj))
        } else if ($B.is_int(obj)) {
            res.push($B.make_complex(obj))
        } else {
            var complex_method = $B.$getattr($B.get_class(obj), '__complex__',
                $B.NULL)
            if (complex_method !== $B.NULL) {
                res.push($B.$call(complex_method, obj))
            } else {
                res.push($B.NULL)
            }
        }
    }
    return res
}

function is_real(obj) {
    return $B.$isinstance(obj, _b_.float) || $B.is_int(obj)
}

var complex = _b_.complex

function complex_eq(self, other) {
    if ($B.$isinstance(other, complex)) {
        return self.real.value == other.real.value &&
            self.imag.value == other.imag.value
    }
    if ($B.is_int(other)) {
        if (self.imag.value != 0) {return false}
        return self.real.value == other.valueOf()
    }
    if ($B.$isinstance(other, _b_.float)) {
        if (! $B.rich_comp('__eq__', 0, self.imag)) {
            return false
        }
        return self.real.value == other.value
    }
    return _b_.NotImplemented
}

function complex_new(cls, args, kw) {
    var nb_args = args.length + $B.str_dict_length(kw)
    if (nb_args > 2) {
        $B.RAISE(_b_.TypeError,
            `complex() takes at most 2 arguments (${nb_args} given)`
        )
    }

    var [r, i] = $B.unpack_args('complex', args, ['first', 'second'],
                              {first: $B.NULL, second: $B.NULL})
    $B.check_expected_keywords('complex', kw, ['real', 'imag'])
    for (var [k, v] of $B.dict_key_values(kw)) {
        if (k == 'real') {
            if (r !== $B.NULL) {
                $B.RAISE(_b_.TypeError,
                    `argument for complex() given by name ('real') ` +
                    `and position (1)`
                )
            } else {
                r = v
            }
        } else if (k == 'imag') {
            i = v
        }
    }

    if (r === $B.NULL) {
        r = $B.fast_float(0)
    }

    let orig_r = r

    let own_r = 0
    let cr_is_complex = 0
    let ci_is_complex = 0

    let cr = make_complex(0, 0)
    let ci = make_complex(0, 0)

    /* DEPRECATED: The call of try_complex_special_method() for the "real"
     * part will be dropped after the end of the deprecation period. */
    let tmp = try_complex_special_method(r)
    if (tmp !== $B.NULL) {
        r = tmp
        own_r = 1
    }

    let r_type = $B.get_class(r)
    if ($B.$getattr(r_type, '__float__', $B.NULL) === $B.NULL &&
            $B.$getattr(r_type, '__index__', $B.NULL) === $B.NULL &&
            ! $B.$isinstance(r, complex)) {
        $B.RAISE(_b_.TypeError,
            "complex() argument 'real' must be a real number, not " +
            $B.class_name(r)
        )
    }
    if (i != $B.NULL) {
        let i_type = $B.get_class(i)
        if ($B.$getattr(i_type, '__float__', $B.NULL) === $B.NULL &&
                $B.$getattr(i_type, '__index__', $B.NULL) === $B.NULL &&
                ! $B.$isinstance(i, complex)) {
            $B.RAISE(_b_.TypeError,
                "complex() argument 'imag' must be a real number, not " +
                $B.class_name(i)
            )
        }
    }

    /* If we get this far, then the "real" and "imag" parts should
       both be treated as numbers, and the constructor should return a
       complex number equal to (real + imag*1j).

       The following is DEPRECATED:
       Note that we do NOT assume the input to already be in canonical
       form; the "real" and "imag" parts might themselves be complex
       numbers, which slightly complicates the code below. */
    if ($B.$isinstance(r, complex)) {
        /* Note that if r is of a complex subtype, we're only
           retaining its real & imag parts here, and the return
           value is (properly) of the builtin complex type. */
        cr = r
        cr_is_complex = 1
        let orig_r_type = $B.get_class(orig_r)
        if ($B.$getattr(orig_r_type, '__float__', $B.NULL) === $B.NULL &&
                $B.$getattr(orig_r_type, '__index__', $B.NULL) === $B.NULL) {
            $B.warn(_b_.DeprecationWarning,
                "complex() argument 'real' must be a real number, not " +
                $B.class_name(orig_r)
            )
        }
    } else {
        /* The "real" part really is entirely real, and contributes
           nothing in the imaginary direction.
           Just treat it as a double. */
        cr.real = _b_.float.$factory(r)
        cr.imag = $B.fast_float(0)
    }
    if (i == $B.NULL) {
        ci.real = cr.imag
    } else if ($B.$isinstance(i, complex)) {
        $B.warn(_b_.DeprecationWarning,
            "complex() argument 'imag' must be a real number, not " +
            $B.class_name(i)
        )
        ci = i
        ci_is_complex = 1
    } else {
        /* The "imag" part really is entirely imaginary, and
           contributes nothing in the real direction.
           Just treat it as a double. */
        ci.real = _b_.float.$factory(i)
    }
    /*  If the input was in canonical form, then the "real" and "imag"
        parts are real numbers, so that ci.imag and cr.imag are zero.
        We need this correction in case they were not real numbers. */
    if (ci_is_complex) {
        cr.real = _b_.float.nb_subtract(cr.real, ci.imag)
    }

    if (cr_is_complex && i != $B.NULL) {
        ci.real = _b_.float.nb_add(ci.real, cr.imag)
    }
    let res = {
        ob_type: cls,
        real: cr.real,
        imag: ci.real
    }
    if (cls !== complex) {
        $B.init_dict(res)
    }
    return res
}

const max_precision = 2 ** 31 - 4

complex.$getnewargs = function(self) {
    return $B.fast_tuple([self.real, self.imag])
}

function complex2expo(cx) {
    return {
        norm: Math.hypot(cx.real.value, cx.imag.value),
        angle: Math.atan2(cx.imag.value, cx.real.value)
    }
}

// functions copied from CPython Objects/complexobject.c
function c_powi(x, n) {
    if (n > 0) {
        return c_powu(x, n)
    } else {
        return c_quot(c_1, c_powu(x, -n))
    }
}

function c_powu(x, n) {
    var mask = 1,
        r = c_1,
        p = x
    while (mask > 0 && n >= mask) {
        if (n & mask) {
            r = c_prod(r, p)
        }
        mask <<= 1
        p = c_prod(p, p)
    }
    return r
}

function c_prod(a, b) {
    return make_complex(
        a.real.value * b.real.value - a.imag.value * b.imag.value,
        a.real.value * b.imag.value + a.imag.value * b.real.value)
}

function c_quot(a, b) {
     var abs_breal = Math.abs(b.real.value),
         abs_bimag = Math.abs(b.imag.value)

    if ($B.rich_comp('__ge__', abs_breal, abs_bimag)) {
        /* divide tops and bottom by b.real */
        if (abs_breal == 0.0) {
            $B.RAISE(_b_.ZeroDivisionError, )
        } else {
            let ratio = b.imag.value / b.real.value,
                denom = b.real.value + b.imag.value * ratio
            return make_complex((a.real.value + a.imag.value * ratio) / denom,
                (a.imag.value - a.real.value * ratio) / denom)
        }
    } else if (abs_bimag >= abs_breal) {
        /* divide tops and bottom by b.imag */
        let ratio = b.real.value / b.imag.value,
            denom = b.real.value * ratio + b.imag.value
        if (b.imag.value == 0.0) {
            $B.RAISE(_b_.ZeroDivisionError, )
        }
        return make_complex(
            (a.real.value * ratio + a.imag.value) / denom,
            (a.imag.value * ratio - a.real.value) / denom)
    } else {
        /* At least one of b.real or b.imag is a NaN */
        return $B.make_complex('nan', 'nan')
    }
}

var _real = 1,
    _real_mantissa = 2,
    _sign = 3,
    _imag = 4,
    _imag_mantissa = 5,
    _j = 6

var expected_class = {
    "__complex__": complex,
    "__float__": _b_.float,
    "__index__": _b_.int
}

function _convert(obj) {
    // If object's class defines one of the methods, return the result
    // of method(obj), else return null
    if ($B.$isinstance(obj, _b_.float)) {
        return {method: '__float__', result: $B.float_value(obj)}
    }
    var klass = $B.get_class(obj)
    for (var method_name in expected_class) {
        var method = $B.$getattr(klass, method_name, $B.NULL)
        if (method !== $B.NULL) {
            var res = $B.$call(method, obj)
            if (!$B.$isinstance(res, expected_class[method_name])) {
                $B.RAISE(_b_.TypeError, method_name + "returned non-" +
                    expected_class[method_name].__name__ +
                    "(type " + $B.get_class(res) +")")
            }
            if(method_name == '__index__' &&
                    $B.rich_comp('__gt__', res, __BRYTHON__.MAX_VALUE)){
                $B.RAISE(_b_.OverflowError, 'int too large to convert to float')
            }
            if (method_name == '__complex__' && ! $B.exact_type(res, complex)) {
                $B.warn(_b_.DeprecationWarning, "__complex__ returned " +
                `non-complex (type ${$B.class_name(res)}). ` +
                "The ability to return an instance of a strict subclass " +
                "of complex is deprecated, and may be removed in a future " +
                "version of Python.")
            }
            return {result: res, method: method_name}
        }
    }
    return null
}

function try_complex_special_method(op) {
    let klass = $B.get_class(op)
    let f = $B.$getattr(klass, '__complex__', $B.NULL)
    let class_name = klass.tp_name
    if (f !== $B.NULL) {
        let res = $B.$call(f, op)
        if (! res || $B.exact_type(res, complex)) {
            return res
        }
        if (! $B.$isinstance(res, complex)) {
            $B.RAISE(_b_.TypeError,
                `${class_name}.__complex__() must return a complex, not ` +
                $B.class_name(res)
            )
        }
        /* Issue #29894: warn if 'res' not of exact type complex. */
        $B.warn(_b_.DeprecationWarning,
            `${class_name}.__complex__() must return a complex, not ` +
            `${_b_.repr(res)}.  ` +
            "The ability to return an instance of a strict subclass of " +
            " complex is deprecated, and may be removed in a future " +
            "version of Python."
        )
        return res
    }
    return $B.NULL
}

var make_complex = $B.make_complex = function(real, imag) {
    return {
        ob_type: complex,
        real: _b_.float.$factory(real),
        imag: _b_.float.$factory(imag)
    }
}

var c_1 = make_complex(1, 0)

/* complex start */

_b_.complex.nb_absolute = function(self) {
    var _rf = isFinite(self.real.value),
        _if = isFinite(self.imag.value)
    if((_rf && isNaN(self.imag.value)) || (_if && isNaN(self.real.value)) ||
            (isNaN(self.imag.value) && isNaN(self.real.value))){
        return $B.fast_float(NaN)
    }
    if (! _rf || ! _if) {
        return $B.fast_float(Infinity)
    }
    var mag = Math.sqrt(Math.pow(self.real.value, 2) +
                        Math.pow(self.imag.value, 2))
    if (!isFinite(mag) && _rf && _if) {
        // In these circumstances Math.hypot quietly returns inf, but Python
        // should raise.
        // See https://hg.python.org/jython/rev/69826acfb4a9
        $B.RAISE(_b_.OverflowError, "absolute value too large")
    }
    return $B.fast_float(mag)
}

_b_.complex.nb_add = function(self, other) {
    var [x, y] = conv_complex(self, other)
    if (x === $B.NULL || y === $B.NULL) {
        return _b_.NotImplemented
    }
    return make_complex(x.real.value + y.real.value,
                        is_real(self) ? y.imag.value :
                        is_real(other) ? x.imag.value :
                        x.imag.value + y.imag.value)
}

_b_.complex.nb_bool = function(self) {
    return (! $B.rich_comp('__eq__', self.real, 0)) ||
            ! $B.rich_comp('__eq__', self.imag, 0)
}

_b_.complex.nb_subtract = function(self, other) {
    var [x, y] = conv_complex(self, other)
    if (x === $B.NULL || y === $B.NULL) {
        return _b_.NotImplemented
    }
    return make_complex(x.real.value - y.real.value,
                        is_real(self) ? -y.imag.value :
                        x.imag.value - y.imag.value)
}

_b_.complex.nb_multiply = function(self, other) {
    var [x, y] = conv_complex(self, other)
    if (x === $B.NULL || y === $B.NULL) {
        return _b_.NotImplemented
    }
    if (is_real(self) || is_real(other)) {
        var [c, r] = is_real(self) ? [y, x.real.value] : [x, y.real.value]
        return make_complex(c.real.value * r, c.imag.value * r)
    }
    return make_complex(x.real.value * y.real.value -
                        x.imag.value * y.imag.value,
                        x.imag.value * y.real.value +
                        x.real.value * y.imag.value)
}


_b_.complex.nb_negative = function(self) {
    return make_complex(-self.real.value, -self.imag.value)
}

_b_.complex.nb_positive = function(self) {
    return self
}

_b_.complex.nb_power = function(self, other, mod) {
    // complex power : use Moivre formula
    // (cos(x) + i sin(x))**y = cos(xy)+ i sin(xy)
    var [x, y] = conv_complex(self, other)
    if (x === $B.NULL || y === $B.NULL) {
        return _b_.NotImplemented
    }
    if (mod !== undefined && mod !== _b_.None) {
        $B.RAISE(_b_.ValueError, 'complex modulo')
    }
    if ($B.rich_comp('__eq__', other, 1)) {
        var funcs = _b_.float.$funcs
        if(funcs.isinf(x.real) || funcs.isninf(x.real) ||
                funcs.isinf(x.imag) || funcs.isninf(x.imag)){
            $B.RAISE(_b_.OverflowError, 'complex exponentiation')
        }
        return self
    }

    // Check whether the exponent has a small integer value, and if so use
    // a faster and more accurate algorithm.
    var small_int = null
    if(y.imag.value == 0 &&
            Number.isInteger(y.real.value) &&
            Math.abs(y.real.value) < 100){
        small_int = y.real.value
    }
    if (small_int !== null) {
        return c_powi(self, small_int)
    }
    if ($B.$isinstance(other, _b_.float)) {
        other = _b_.float.$to_js_number(other)
    }
    if (x.real.value == 0 && x.imag.value == 0) {
        if (y.imag.value != 0 || y.real.value < 0) {
            $B.RAISE(_b_.ZeroDivisionError,
                '0.0 to a negative or complex power')
        }
        return $B.make_complex(0, 0)
    }
    var exp = complex2expo(x),
        angle = exp.angle
    if ($B.is_int(other)) {
        var res = Math.pow(exp.norm, other)
        return make_complex(res * Math.cos(angle * other),
            res * Math.sin(angle * other))
    } else if ($B.$isinstance(other, _b_.float)) {
        var res = Math.pow(exp.norm, other)
        return make_complex(res * Math.cos(angle * other.value),
            res * Math.sin(angle * other.value))
    } else if ($B.$isinstance(other, complex)) {
        // (r*e**Ai)**(x+iy) = (e**iAx)*(e**-Ay)
        var x = other.real.value,
            y = other.imag.value
        var pw = Math.pow(exp.norm, x) * Math.pow(Math.E, -y * angle),
            theta = y * Math.log(exp.norm) + x * angle
        if (pw == Number.POSITIVE_INFINITY || pw === Number.NEGATIVE_INFINITY) {
            $B.RAISE(_b_.OverflowError, 'complex exponentiation')
        }
        return make_complex(pw * Math.cos(theta), pw * Math.sin(theta))
    } else {
        $B.RAISE(_b_.TypeError, "unsupported operand type(s) " +
            "for ** or pow(): 'complex' and '" +
            $B.class_name(other) + "'")
    }
}

_b_.complex.nb_true_divide = function(self, other) {
    var [x, y] = conv_complex(self, other)
    if (x === $B.NULL || y === $B.NULL) {
        return _b_.NotImplemented
    }
    if (y.real.value == 0 && y.imag.value == 0) {
       $B.RAISE(_b_.ZeroDivisionError, "division by zero")
    }
    if (y.imag.value == 0) {
        // divide by real only
        return make_complex($B.fast_float(x.real.value / y.real.value),
            $B.fast_float(x.imag.value / y.real.value))
    } else if (y.real.value == 0) {
        // divide by imag only
        return make_complex($B.fast_float(x.imag.value / y.imag.value),
            $B.fast_float(- x.real.value / y.imag.value))
    }
    var _num = x.real.value * y.real.value +
                   x.imag.value * y.imag.value,
        _div = y.real.value * y.real.value +
                   y.imag.value * y.imag.value

    var _num2 = x.imag.value * y.real.value -
                    x.real.value * y.imag.value
    return make_complex($B.fast_float(_num / _div),
        $B.fast_float(_num2 / _div))
}

_b_.complex.tp_hash = function(self) {
    // this is a quick fix for something like 'hash(complex)', where
    // complex is not an instance but a type
    // Use int methods in case the hashes are BigInt
    return _b_.int.nb_add(
        $B.$hash(self.real),
        _b_.int.nb_multiply($B.$hash(self.imag), 1000003)
    )
}

_b_.complex.tp_new = function(cls, args, kw) {
    if (args.length > 1 || _b_.dict.mp_length(kw) > 0) {
        return complex_new(cls, args, kw)
    }

    if (args.length == 0) {
        let res = make_complex(0, 0)
        res.ob_type = cls
        return res
    }

    var nb_args = args.length + $B.str_dict_length(kw)
    if (nb_args > 2) {
        $B.RAISE(_b_.TypeError,
            `complex() takes at most 2 arguments (${nb_args} given)`
        )
    } else if (nb_args == 0) {
        res = make_complex(0, 0)
        res.ob_type = cls
        $B.init_dict(res)
        return res
    }

    let arg = args[0]
    let arg_class = $B.get_class(arg)
    let res

    if ($B.exact_type(arg, complex) && cls === complex) {
        return arg
    }

    if (typeof arg == "string") {
        let first = arg
        let second
        first = first.trim()
        if (first.startsWith("(") && first.endsWith(")")) {
            first = first.substr(1)
            first = first.substr(0, first.length - 1)
        }
        // Regular expression for literal complex string. Includes underscores
        // for PEP 515
        var complex_re = /^\s*([+-]*(?:nan|inf(?:inity)?|[0-9_]*\.?[0-9_]*(e[+-]*[0-9_]*)?))([+-]?)((?:nan|inf(?:inity)?|[0-9_]*\.?[0-9_]*(e[+-]*[0-9_]*)?))(j?)\s*$/i

        var parts = complex_re.exec(first)

        function to_num(s) {
            // float() parses the same syntax, including nan and inf
            try {
                return _b_.float.$factory(s.charAt(0) +
                    s.substr(1).replace(/_/g, "")).value
            } catch (err) {
                $B.RAISE(_b_.ValueError, "could not convert string " +
                    "to complex: '" + arg +"'")
            }
        }
        if (parts === null) {
            $B.RAISE(_b_.ValueError, "complex() arg is a malformed string")
        }
        if(parts[_real] && parts[_imag].startsWith('.') &&
                parts[_sign] == ''){
            $B.RAISE(_b_.ValueError, 'complex() arg is a malformed string')
        }else if(parts[_real] == "." || parts[_imag] == "." ||
                parts[_real] == ".e" || parts[_imag] == ".e" ||
                parts[_real] == "e" || parts[_imag] == "e"){
            $B.RAISE(_b_.ValueError, "complex() arg is a malformed string")
        } else if (parts[_j] != "") {
            if (parts[_sign] == "") {
                first = 0
                if (parts[_real] == "+" || parts[_real] == "") {
                    second = 1
                } else if (parts[_real] == '-') {
                    second = -1
                } else {second = to_num(parts[_real])}
            } else {
                first = to_num(parts[_real])
                second = parts[_imag] == "" ? 1 : to_num(parts[_imag])
                second = parts[_sign] == "-" ? -second : second
            }
        } else {
            if (parts[_sign] || parts[_imag]) {
                $B.RAISE(_b_.ValueError, 'complex() arg is a malformed string')
            }
            first = to_num(parts[_real])
            second = 0
        }
        res = make_complex(first, second)
        res.ob_type = cls
        if (cls !== complex) {
            $B.init_dict(res)
        }
        return res
    }

    let tmp = try_complex_special_method(arg)

    if (tmp !== $B.NULL) {
        res = {
            ob_type: cls,
            real: tmp.real,
            imag: tmp.imag
        }
        if (cls !== complex) {
            $B.init_dict(res)
        }
    } else if ($B.$isinstance(arg, complex)) {
        res = {
            ob_type: complex,
            real: arg.real,
            imag: arg.imag
        }
    } else if ($B.$getattr(arg_class, '__float__', $B.NULL) !== $B.NULL ||
            $B.$getattr(arg_class, '__index__', $B.NULL) !== $B.NULL) {
        let num = $B.to_num(arg, ['__float__', '__index__'])
        let real = _b_.float.$factory(num.result)
        res = {
            ob_type: cls,
            real,
            imag: $B.fast_float(0)
        }
        $B.init_dict(res)
    } else {
        $B.RAISE(_b_.TypeError,
            "complex() argument must be a string or a number, " +
            `not ${$B.get_name(arg_class)}"`
        )
    }
    return res
}

_b_.complex.tp_repr = function(self) {
    $B.builtins_repr_check(complex, arguments) // in brython_builtins.js
    var real = _b_.str.$factory(self.real),
        imag = _b_.str.$factory(self.imag)
    if (real.endsWith('.0')) {
        real = real.substr(0, real.length - 2)
    }
    if (imag.endsWith('.0')) {
        imag = imag.substr(0, imag.length - 2)
    }
    if (Object.is(self.imag.value, -0)) {
        imag = "-0"
    }
    var sign = imag.startsWith('-') ? '' : '+'
    if (self.real.value == 0) {
        if (Object.is(self.real.value, -0)) {
            return "(-0" + sign + imag + "j)"
        } else {
            return imag + "j"
        }
    }
    if (self.imag.value > 0 || isNaN(self.imag.value)) {
        return "(" + real + "+" + imag + "j)"
    }
    if (self.imag.value == 0) {
        if (1 / self.imag.value < 0) {
            return "(" + real + "-0j)"
        }
        return "(" + real + "+0j)"
    }

    return "(" + real + sign + imag + "j)"
}

_b_.complex.tp_richcompare = function(self, other, op) {
    var complex_func = $B.$getattr($B.get_class(other), '__complex__', $B.NULL)
    if (complex_func !== $B.NULL) {
        other = $B.$call(complex_func, other)
    }
    switch (op) {
        case '__eq__':
            return complex_eq(self, other)
        case '__ne__':
            var res = complex_eq(self, other)
            return res === _b_.NotImplemented ? res : ! res
        default:
            return _b_.NotImplemented
    }
}


var complex_funcs = _b_.complex.tp_funcs = {}

complex_funcs.__complex__ = function(self) {
    // returns an instance of complex (not a subclass)
    $B.meth_noargs('complex.__complex__', arguments)
    if ($B.exact_type(self, complex)) {
        return self
    }
    return $B.make_complex(self.real, self.imag)
}

complex_funcs.__format__ = function(self, format_spec) {
    if (format_spec.length == 0) {
        return _b_.str.$factory(self)
    }
    var fmt = new $B.parse_format_spec(format_spec, self),
        type = fmt.conversion_type

    var skip_re,
        add_parens

    if (type === undefined || 'eEfFgGn'.indexOf(type) > -1) {
        if (fmt.precision > max_precision) {
            $B.RAISE(_b_.ValueError, 'precision too big')
        }
        if (fmt.fill_char == '0') {
            $B.RAISE(_b_.ValueError,
                "Zero padding is not allowed in complex format specifier")
        }
        if (fmt.align == '=') {
            $B.RAISE(_b_.ValueError,
                 "'=' alignment flag is not allowed in complex format " +
                 "specifier")
        }
        var re = self.real.value,
            precision = parseInt(fmt.precision, 10)

        if (type === undefined) {
            type = 'r'
            if (re == 0 && Object.is(re, 0)) {
                skip_re = 1
            } else {
                add_parens = 1
            }
        } else if (type == 'n') {
            type = 'g'
        }
        if (precision < 0) {
            precision = 6
        } else if (type == 'r') {
            type = 'g'
        }
        var format = $B.clone(fmt)
        format.conversion_type = type
        format.precision = precision

        var res = ''
        if (! skip_re) {
            res += _b_.float.$format(self.real, format)
            if (self.imag.value >= 0) {
                res += '+'
            }
        }
        var formatted_im = _b_.float.$format(self.imag, format)
        var pos = -1,
            last_num
        for (var char of formatted_im) {
            pos++
            if (char.match(/\d/)) {
                last_num = pos
            }
        }
        formatted_im = formatted_im.substr(0, last_num + 1) + 'j' +
            formatted_im.substr(last_num + 1)
        res += formatted_im

        if (add_parens) {
            res = '(' + res + ')'
        }

        return res
    }
    $B.RAISE(_b_.ValueError, `invalid type for complex: ${type}`)
}

complex_funcs.__getnewargs__ = function(self) {
    $B.meth_noargs('complex.__getnewargs__', arguments)
    return complex.$getnewargs(self)
}

complex_funcs.conjugate = function(self) {
    $B.meth_noargs('complex.conjugate', arguments)
    return make_complex(self.real.value, -self.imag.value)
}

complex_funcs.from_number = function(cls, obj) {
    var complex_func = $B.$getattr(obj, '__complex__', $B.NULL)
    if (complex_func !== _b_.NULL) {
        return $B.$call(complex_func)
    }
    var float_func = $B.$getattr(obj, '__float__', $B.NULL)
    if (float_func !== $B.NULL) {
        return $B.make_complex($B.$call(float_func), 0)
    }
    var index_func = $B.$getattr(obj, '__index__', $B.NULL)
    if (index_func !== $B.NULL) {
        return $B.make_complex($B.$call(index_func), 0)
    }
    $R.RAISE(_b_.TypeError, `must be real number, not ${$B.class_name(obj)}`)
}

_b_.complex.classmethods = ["from_number"]

_b_.complex.tp_methods = ["conjugate", "__complex__", "__getnewargs__", "__format__"]

_b_.complex.tp_members = [
    ["real", $B.TYPES.DOUBLE, "real", 1],
    ["imag", $B.TYPES.DOUBLE, "imag", 1]
]

/* complex end */

$B.set_func_names(complex, "builtins")


})(__BRYTHON__);
