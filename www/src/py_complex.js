"use strict";
;(function($B){

var _b_ = $B.builtins

function $UnsupportedOpType(op, class1, class2){
    throw _b_.TypeError.$factory("unsupported operand type(s) for " +
        op + ": '" + class1 + "' and '" + class2 + "'")
}

var complex = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    __qualname__: 'complex',
    $is_class: true,
    $native: true,
    $descriptors: {real: true, imag: true}
}

complex.__abs__ = function(self){
    var _rf = isFinite(self.$real.value),
        _if = isFinite(self.$imag.value)
    if((_rf && isNaN(self.$imag.value)) || (_if && isNaN(self.$real.value)) ||
            (isNaN(self.$imag.value) && isNaN(self.$real.value))){
        return $B.fast_float(NaN)
    }
    if(! _rf || ! _if){
        return $B.fast_float(Infinity)
    }
    var mag = Math.sqrt(Math.pow(self.$real.value, 2) +
                        Math.pow(self.$imag.value, 2))
    if(!isFinite(mag) && _rf && _if){
        // In these circumstances Math.hypot quietly returns inf, but Python
        // should raise.
        // See https://hg.python.org/jython/rev/69826acfb4a9
        throw _b_.OverflowError.$factory("absolute value too large")
    }
    return $B.fast_float(mag)
}

complex.__add__ = function(self, other){
    if($B.$isinstance(other, complex)){
        return make_complex(self.$real.value + other.$real.value,
                            self.$imag.value + other.$imag.value)
    }
    if($B.$isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        return make_complex(
            $B.rich_op('__add__', self.$real.value, other.valueOf()),
            self.$imag.value)
    }
    if($B.$isinstance(other, _b_.float)){
        return make_complex(self.$real.value + other.value, self.$imag.value)
    }
    return _b_.NotImplemented
}

complex.__bool__ = function(self){
    return (! $B.rich_comp('__eq__', self.$real, 0)) ||
            ! $B.rich_comp('__eq__', self.$imag, 0)
}

complex.__complex__ = function(self){
    // returns an instance of complex (not a subclass)
    if(self.__class__ === complex){
        return self
    }
    return $B.make_complex(self.$real, self.$imag)
}

complex.__eq__ = function(self, other){
    if($B.$isinstance(other, complex)){
        return self.$real.value == other.$real.value &&
            self.$imag.value == other.$imag.value
    }
    if($B.$isinstance(other, _b_.int)){
        if(self.$imag.value != 0){return false}
        return self.$real.value == other.valueOf()
    }
    if($B.$isinstance(other, _b_.float)){
        if(! $B.rich_comp('__eq__', 0, self.$imag)){
            return false
        }
        return self.$real.value == other.value
    }
    return _b_.NotImplemented
}

const max_precision = 2 ** 31 - 4,
      max_repeat = 2 ** 30 - 1

complex.__format__ = function(self, format_spec){
    if(format_spec.length == 0){
        return _b_.str.$factory(self)
    }
    var fmt = new $B.parse_format_spec(format_spec, self),
        type = fmt.conversion_type

    var default_precision = 6,
        skip_re,
        add_parens

    if(type === undefined || 'eEfFgGn'.indexOf(type) > -1){
        if(fmt.precision > max_precision){
            throw _b_.ValueError.$factory('precision too big')
        }
        if(fmt.fill_char == '0'){
            throw _b_.ValueError.$factory(
                "Zero padding is not allowed in complex format specifier")
        }
        if(fmt.align == '='){
            throw _b_.ValueError.$factory(
                 "'=' alignment flag is not allowed in complex format " +
                 "specifier")
        }
        var re = self.$real.value,
            im = self.$imag.value,
            precision = parseInt(fmt.precision, 10)

        if(type === undefined){
            type = 'r'
            default_precision = 0
            if(re == 0 && Object.is(re, 0)){
                skip_re = 1
            }else{
                add_parens = 1
            }
        }else if(type == 'n'){
            type = 'g'
        }
        if(precision < 0){
            precision = 6
        }else if(type == 'r'){
            type = 'g'
        }
        var format = $B.clone(fmt)
        format.conversion_type = type
        format.precision = precision

        var res = ''
        if(! skip_re){
            res += _b_.float.$format(self.$real, format)
            if(self.$imag.value >= 0){
                res += '+'
            }
        }
        var formatted_im = _b_.float.$format(self.$imag, format)
        var pos = -1,
            last_num
        for(var char of formatted_im){
            pos++
            if(char.match(/\d/)){
                last_num = pos
            }
        }
        formatted_im = formatted_im.substr(0, last_num + 1) + 'j' +
            formatted_im.substr(last_num + 1)
        res += formatted_im

        if(add_parens){
            res = '(' + res + ')'
        }

        return res
    }
    throw _b_.ValueError.$factory(`invalid type for complex: ${type}`)
}

complex.$getnewargs = function(self){
    return $B.fast_tuple([self.$real, self.$imag])
}

complex.__getnewargs__ = function(){
    return complex.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

complex.__hash__ = function(self){
    // this is a quick fix for something like 'hash(complex)', where
    // complex is not an instance but a type
    return $B.$hash(self.$real) + $B.$hash(self.$imag) * 1000003
}

complex.__init__ = function() {
    return _b_.None
}

complex.__invert__ = function(self){return ~self}

complex.__mro__ = [_b_.object]

complex.__mul__ = function(self, other){
    if($B.$isinstance(other, complex)){
        return make_complex(self.$real.value * other.$real.value -
                            self.$imag.value * other.$imag.value,
                            self.$imag.value * other.$real.value +
                            self.$real.value * other.$imag.value)
    }else if($B.$isinstance(other, _b_.int)){
        return make_complex(self.$real.value * other.valueOf(),
                            self.$imag.value * other.valueOf())
    }else if($B.$isinstance(other, _b_.float)){
        return make_complex(self.$real.value * other.value,
                            self.$imag.value * other.value)
    }else if($B.$isinstance(other, _b_.bool)){
        if(other.valueOf()){return self}
        return make_complex(0, 0)
    }
    $UnsupportedOpType("*", complex, other)
}

complex.__ne__ = function(self, other){
    var res = complex.__eq__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

complex.__neg__ = function(self){
    return make_complex(-self.$real.value, -self.$imag.value)
}

complex.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory('complex.__new__(): not enough arguments')
    }
    var res,
        missing = {},
        $ = $B.args("complex", 3, {cls: null, real: null, imag: null},
            ["cls", "real", "imag"], arguments, {real: 0, imag: missing},
            null, null),
        cls = $.cls,
        first = $.real,
        second = $.imag

    if(typeof first == "string"){
        if(second !== missing){
            throw _b_.TypeError.$factory("complex() can't take second arg " +
                "if first is a string")
        }else{
            var arg = first
            first = first.trim()
            if(first.startsWith("(") && first.endsWith(")")){
                first = first.substr(1)
                first = first.substr(0, first.length - 1)
            }
            // Regular expression for literal complex string. Includes underscores
            // for PEP 515
            var complex_re = /^\s*([\+\-]*[0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)([\+\-]?)([0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)(j?)\s*$/i

            var parts = complex_re.exec(first)

            function to_num(s){
                var res = parseFloat(s.charAt(0) + s.substr(1).replace(/_/g, ""))
                if(isNaN(res)){
                    throw _b_.ValueError.$factory("could not convert string " +
                        "to complex: '" + arg +"'")
                }
                return res
            }
            if(parts === null){
                throw _b_.ValueError.$factory("complex() arg is a malformed string")
            }
            if(parts[_real] && parts[_imag].startsWith('.') &&
                    parts[_sign] == ''){
                throw _b_.ValueError.$factory('complex() arg is a malformed string')
            }else if(parts[_real] == "." || parts[_imag] == "." ||
                    parts[_real] == ".e" || parts[_imag] == ".e" ||
                    parts[_real] == "e" || parts[_imag] == "e"){
                throw _b_.ValueError.$factory("complex() arg is a malformed string")
            }else if(parts[_j] != ""){
                if(parts[_sign] == ""){
                    first = 0
                    if(parts[_real] == "+" || parts[_real] == ""){
                        second = 1
                    }else if (parts[_real] == '-'){
                        second = -1
                    }else{second = to_num(parts[_real])}
                }else{
                    first = to_num(parts[_real])
                    second = parts[_imag] == "" ? 1 : to_num(parts[_imag])
                    second = parts[_sign] == "-" ? -second : second
                }
            }else{
                if(parts[_sign] && parts[_imag] == ''){
                    throw _b_.ValueError.$factory('complex() arg is a malformed string')
                }
                first = to_num(parts[_real])
                second = 0
            }
            res = make_complex(first, second)
            res.__class__ = cls
            res.__dict__ = $B.empty_dict()
            return res
        }
    }

    if(first.__class__ === complex && cls === complex && second === missing){
        return first
    }
    var arg1 = _convert(first),
        r,
        i
    if(arg1 === null){
        throw _b_.TypeError.$factory("complex() first argument must be a " +
            `string or a number, not '${$B.class_name(first)}'`)
    }

    if(typeof second == "string"){
        throw _b_.TypeError.$factory("complex() second arg can't be a string")
    }

    var arg2 = _convert(second === missing ? 0 : second)

    if(arg2 === null){
        throw _b_.TypeError.$factory("complex() second argument must be a " +
            `number, not '${$B.class_name(second)}'`)
    }

    if(arg1.method == '__complex__'){
        if(arg2.method == '__complex__'){
            r = $B.rich_op('__sub__', arg1.result.$real, arg2.result.$imag)
            i = $B.rich_op('__add__', arg1.result.$imag, arg2.result.$real)
        }else{
            r = arg1.result.$real
            i = $B.rich_op('__add__', arg1.result.$imag, arg2.result)
        }
    }else{
        if(arg2.method == '__complex__'){
            r = $B.rich_op('__sub__', arg1.result, arg2.result.$imag)
            i = arg2.result.$real
        }else{
            r = arg1.result
            i = arg2.result
        }
    }

    var res = make_complex(r, i)
    res.__class__ = cls
    res.__dict__ = $B.empty_dict()
    return res
}

complex.__pos__ = function(self){return self}

function complex2expo(cx){
    var norm = Math.sqrt((cx.$real.value * cx.$real.value) +
                         (cx.$imag.value * cx.$imag.value)),
        sin = cx.$imag.value / norm,
        cos = cx.$real.value / norm,
        angle
    if(cos == 0){
        angle = sin == 1 ? Math.PI / 2 : 3 * Math.PI / 2
    }else if(sin == 0){
        angle = cos == 1 ? 0 : Math.PI
    }else{
        angle = Math.atan(sin / cos)
    }
    return {norm: norm, angle: angle}
}

function hypot(){
    var $ = $B.args("hypot", 0, {}, [],
                arguments, {}, "args", null)
    return _b_.float.$factory(Math.hypot(...$.args))
}

// functions copied from CPython Objects/complexobject.c
function c_powi(x, n){
    if (n > 0){
        return c_powu(x, n)
    }else{
        return c_quot(c_1, c_powu(x, -n))
    }
}

function c_powu(x, n){
    var r,
        p,
        mask = 1,
        r = c_1,
        p = x
    while (mask > 0 && n >= mask) {
        if (n & mask){
            r = c_prod(r, p);
        }
        mask <<= 1;
        p = c_prod(p, p)
    }
    return r;
}

function c_prod(a, b){
    return make_complex(
        a.$real.value * b.$real.value - a.$imag.value * b.$imag.value,
        a.$real.value * b.$imag.value + a.$imag.value * b.$real.value)
}

function c_quot(a, b){
     var r,      /* the result */
         abs_breal = Math.abs(b.$real.value),
         abs_bimag = Math.abs(b.$imag.value)

    if ($B.rich_comp('__ge__', abs_breal, abs_bimag)){
        /* divide tops and bottom by b.real */
        if (abs_breal == 0.0) {
            throw _b_.ZeroDivisionError.$factory()
        }else{
            var ratio = b.$imag.value / b.$real.value,
                denom = b.$real.value + b.$imag.value * ratio
            return make_complex((a.$real.value + a.$imag.value * ratio) / denom,
                (a.$imag.value - a.$real.value * ratio) / denom)
        }
    }else if (abs_bimag >= abs_breal) {
        /* divide tops and bottom by b.imag */
        var ratio = b.$real.value / b.$imag.value,
            denom = b.$real.value * ratio + b.$imag.value;
        if(b.$imag.value == 0.0){
            throw _b_.ZeroDivisionError.$factory()
        }
        return make_complex(
            (a.$real.value * ratio + a.$imag.value) / denom,
            (a.$imag.value * ratio - a.$real.value) / denom)
    }else{
        /* At least one of b.real or b.imag is a NaN */
        return $B.make_complex('nan', 'nan')
    }
}

complex.__pow__ = function(self, other, mod){
    // complex power : use Moivre formula
    // (cos(x) + i sin(x))**y = cos(xy)+ i sin(xy)

    if(mod !== undefined && mod !== _b_.None){
        throw _b_.ValueError.$factory('complex modulo')
    }
    if($B.rich_comp('__eq__', other, 1)){
        var funcs = _b_.float.$funcs
        if(funcs.isinf(self.$real) || funcs.isninf(self.$real) ||
                funcs.isinf(self.$imag) || funcs.isninf(self.$imag)){
            throw _b_.OverflowError.$factory('complex exponentiation')
        }
        return self
    }

    // Check whether the exponent has a small integer value, and if so use
    // a faster and more accurate algorithm.
    var small_int = null
    if ($B.$isinstance(other, _b_.int) && _b_.abs(other) < 100){
        small_int = other
    }else if($B.$isinstance(other, _b_.float) &&
            Number.isInteger(other.value) && Math.abs(other.value < 100)){
        small_int = other.value
    }else if($B.$isinstance(other, complex) && other.$imag.value == 0 &&
            Number.isInteger(other.$real.value) &&
            Math.abs(other.$real.value) < 100){
        small_int = other.$real.value
    }
    if(small_int !== null){
        return c_powi(self, small_int)
    }
    if($B.$isinstance(other, _b_.float)){
        other = _b_.float.$to_js_number(other)
    }
    if(self.$real.value == 0 && self.$imag.value == 0){
        if($B.$isinstance(other, complex) &&
                (other.$imag.value != 0 || other.$real.value < 0)){
            throw _b_.ZeroDivisionError.$factory(
                '0.0 to a negative or complex power')
        }
        return $B.make_complex(0, 0)
    }
    var exp = complex2expo(self),
        angle = exp.angle,
        res = Math.pow(exp.norm, other)

    if($B.$isinstance(other, _b_.int)){
        return make_complex(res * Math.cos(angle * other),
            res * Math.sin(angle * other))
    }else if($B.$isinstance(other, _b_.float)){
        return make_complex(res * Math.cos(angle * other.value),
            res * Math.sin(angle * other.value))
    }else if($B.$isinstance(other, complex)){
        // (r*e**Ai)**(x+iy) = (e**iAx)*(e**-Ay)
        var x = other.$real.value,
            y = other.$imag.value
        var pw = Math.pow(exp.norm, x) * Math.pow(Math.E, -y * angle),
            theta = y * Math.log(exp.norm) - x * angle
        if(pw == Number.POSITIVE_INFINITY || pw === Number.NEGATIVE_INFINITY){
            throw _b_.OverflowError.$factory('complex exponentiation')
        }
        return make_complex(pw * Math.cos(theta), pw * Math.sin(theta))
    }else{
        throw _b_.TypeError.$factory("unsupported operand type(s) " +
            "for ** or pow(): 'complex' and '" +
            $B.class_name(other) + "'")
    }
}

complex.__radd__ = function(self, other){
    if($B.$isinstance(other, _b_.bool)){
        other = other ? 1 : 0
    }
    if($B.$isinstance(other, _b_.int)){
        return make_complex(other + self.$real.value, self.$imag.value)
    }else if($B.$isinstance(other, _b_.float)){
        return make_complex(other.value + self.$real.value, self.$imag.value)
    }
    return _b_.NotImplemented
}

complex.__repr__ = function(self){
    $B.builtins_repr_check(complex, arguments) // in brython_builtins.js
    var real = Number.isInteger(self.$real.value) ?
                   self.$real.value + '' :
                   _b_.str.$factory(self.$real),
        imag = Number.isInteger(self.$imag.value) ?
                   self.$imag.value + '' :
                   _b_.str.$factory(self.$imag)
    if(imag.endsWith('.0')){
        imag = imag.substr(0, imag.length - 2)
    }
    if(Object.is(self.$imag.value, -0)){
        imag = "-0"
    }
    var sign = imag.startsWith('-') ? '' : '+'
    if(self.$real.value == 0){
        if(Object.is(self.$real.value, -0)){
            return "(-0" + sign + imag + "j)"
        }else{
            return imag + "j"
        }
    }
    if(self.$imag.value > 0 || isNaN(self.$imag.value)){
        return "(" + real + "+" + imag + "j)"
    }
    if(self.$imag.value == 0){
        if(1 / self.$imag.value < 0){
            return "(" + real + "-0j)"
        }
        return "(" + real + "+0j)"
    }

    return "(" + real + sign + imag + "j)"
}

complex.__rmul__ = function(self, other){
    if($B.$isinstance(other, _b_.bool)){
        other = other ? 1 : 0
    }
    if($B.$isinstance(other, _b_.int)){
        return make_complex(other * self.$real.value, other * self.$imag.value)
    }else if($B.$isinstance(other, _b_.float)){
        return make_complex(other.value * self.$real.value,
                            other.value * self.$imag.value)
    }
    return _b_.NotImplemented
}

complex.__sqrt__ = function(self) {
    if(self.$imag == 0){
        return complex(Math.sqrt(self.$real.value))
    }
    var r = self.$real.value,
        i = self.$imag.value,
        _a = Math.sqrt((r + sqrt) / 2),
        _b = Number.sign(i) * Math.sqrt((-r + sqrt) / 2)

    return make_complex(_a, _b)
}

complex.__sub__ = function(self, other){
    if($B.$isinstance(other, complex)){
        return make_complex(self.$real.value - other.$real.value,
                            self.$imag.value - other.$imag.value)
    }
    if($B.$isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        return make_complex(self.$real.value - other.valueOf(),
                            self.$imag.value)
    }
    if($B.$isinstance(other, _b_.float)){
        return make_complex(self.$real.value - other.value, self.$imag.value)
    }
    return _b_.NotImplemented
}

complex.__truediv__ = function(self, other){
    if($B.$isinstance(other, complex)){
        if(other.$real.value == 0 && other.$imag.value == 0){
           throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        var _num = self.$real.value * other.$real.value +
                       self.$imag.value * other.$imag.value,
            _div = other.$real.value * other.$real.value +
                       other.$imag.value * other.$imag.value

        var _num2 = self.$imag.value * other.$real.value -
                        self.$real.value * other.$imag.value

        return make_complex(_num / _div, _num2 / _div)
    }
    if($B.$isinstance(other, _b_.int)){
        if(! other.valueOf()){
            throw _b_.ZeroDivisionError.$factory('division by zero')
        }
        return complex.__truediv__(self, complex.$factory(other.valueOf()))
    }
    if($B.$isinstance(other, _b_.float)){
        if(! other.value){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return complex.__truediv__(self, complex.$factory(other.value))
    }
    $UnsupportedOpType("//", "complex", other.__class__)
}

complex.conjugate = function(self) {
    return make_complex(self.$real.value, -self.$imag.value)
}

complex.__ior__ = complex.__or__

var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]


for(var r_opname of r_opnames){
    if(complex["__r" + r_opname + "__"] === undefined &&
            complex['__' + r_opname + '__']){
        complex["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                if($B.$isinstance(other, _b_.int)){
                    other = make_complex(other, 0)
                    return complex["__" + name + "__"](other, self)
                }else if($B.$isinstance(other, _b_.float)){
                    other = make_complex(other.value, 0)
                    return complex["__" + name + "__"](other, self)
                }else if($B.$isinstance(other, complex)){
                    return complex["__" + name + "__"](other, self)
                }
                return _b_.NotImplemented
            }
        })(r_opname)
    }
}

// comparison methods
var comp_func_body = `
    var _b_ = __BRYTHON__.builtins
    if(other === undefined || other == _b_.None){
        return _b_.NotImplemented
    }
    throw _b_.TypeError.$factory("no ordering relation " +
        "is defined for complex numbers")`

for(var $op in $B.$comps){
    complex['__' + $B.$comps[$op] + '__'] = Function('self', 'other',
        comp_func_body.replace(/>/gm, $op))
}

// Descriptors to return real and imag
complex.real = function(self){
    return self.$real
}
complex.real.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
}
complex.imag = function(self){
    return self.$imag
}
complex.imag.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
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

function _convert(obj){
    // If object's class defines one of the methods, return the result
    // of method(obj), else return null
    var klass = obj.__class__ || $B.get_class(obj)
    for(var method_name in expected_class) {
        var missing = {},
            method = $B.$getattr(klass, method_name, missing)
        if(method !== missing){
            var res = method(obj)
            if(!$B.$isinstance(res, expected_class[method_name])){
                throw _b_.TypeError.$factory(method_name + "returned non-" +
                    expected_class[method_name].__name__ +
                    "(type " + $B.get_class(res) +")")
            }
            if(method_name == '__index__' &&
                    $B.rich_comp('__gt__', res, __BRYTHON__.MAX_VALUE)){
                throw _b_.OverflowError.$factory('int too large to convert to float')
            }
            if(method_name == '__complex__' && res.__class__ !== complex){
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

var make_complex = $B.make_complex = function(real, imag){
    return {
        __class__: complex,
        $real: _b_.float.$factory(real),
        $imag: _b_.float.$factory(imag)
    }
}

var c_1 = make_complex(1, 0)

complex.$factory = function(){
    return complex.__new__(complex, ...arguments)
}

$B.set_func_names(complex, "builtins")

_b_.complex = complex

})(__BRYTHON__)
