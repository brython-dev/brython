;(function($B){

var _b_ = $B.builtins

var object = _b_.object

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        ": 'float' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
}

function float_value(obj){
    // Instances of float subclasses that call float.__new__(cls, value)
    // have an attribute $brython_value set
    return obj.$brython_value !== undefined ? obj.$brython_value : obj
}

// dictionary for built-in class 'float'
var float = {
    __class__: _b_.type,
    __dir__: object.__dir__,
    $infos: {
        __module__: "builtins",
        __name__: "float"
    },
    $is_class: true,
    $native: true,
    $descriptors: {
        "numerator": true,
        "denominator": true,
        "imag": true,
        "real": true
    }
}

float.$to_js_number = function(self){
    if(self.__class__ === float){
        return self.value
    }else{
        return float.$to_js_number(self.value)
    }
}

float.numerator = function(self){return self.value}
float.denominator = function(self){return 1}
float.imag = function(self){return 0}
float.real = function(self){return self.value}

float.__float__ = function(self){
    return self
}

// cache lshifts of 1
$B.shift1_cache = {}

float.as_integer_ratio = function(self){
    //self = self.value

    if(isinf(self)){
        throw _b_.OverflowError.$factory("Cannot pass infinity to " +
            "float.as_integer_ratio.")
    }
    if(isnan(self)){
        throw _b_.ValueError.$factory("Cannot pass NaN to " +
            "float.as_integer_ratio.")
    }

    var tmp = frexp(self),
        fp = tmp[0],
        exponent = tmp[1]

    for (var i = 0; i < 300; i++){
        if(fp == Math.floor(fp)){
            break
        }else{
            fp *= 2
            exponent--
        }
    }
    numerator = _b_.int.$factory(fp)
    py_exponent = _b_.abs(exponent)
    denominator = 1
    var x
    if($B.shift1_cache[py_exponent] !== undefined){
        x = $B.shift1_cache[py_exponent]
    }else{
        x = $B.$getattr(1, "__lshift__")(py_exponent)
        $B.shift1_cache[py_exponent] = x
    }
    py_exponent = x
    if(exponent > 0){
        numerator = $B.rich_op("__mul__", numerator, py_exponent)
    }else{
        denominator = py_exponent
    }

    return $B.fast_tuple([_b_.int.$factory(numerator),
        _b_.int.$factory(denominator)])
}

function check_self_is_float(x, method){
    if(x.__class__ === _b_.float || _b_.isinstance(x, _b_.float)){
        return true
    }
    throw _b_.TypeError.$factory(`descriptor '${method}' requires a ` +
        `'float' object but received a '${$B.class_name(x)}'`)
}

float.__abs__ = function(self){
    check_self_is_float(self, '__abs__')
    return fast_float(Math.abs(self.value))
}

float.__bool__ = function(self){
    check_self_is_float(self, '__bool__')
    return _b_.bool.$factory(self.value)
}

float.__ceil__ = function(self){
    check_self_is_float(self, '__ceil__')
    if(isnan(self)){
        throw _b_.ValueError.$factory('cannot convert float NaN to integer')
    }else if(isinf(self)){
        throw _b_.OverflowError.$factory('cannot convert float infinity to integer')
    }
    return Math.ceil(self.value)
}

float.__divmod__ = function(self, other){
    check_self_is_float(self, '__divmod__')
    if(! _b_.isinstance(other, [_b_.int, float])){
        return _b_.NotImplemented
    }
    return $B.fast_tuple([float.__floordiv__(self, other),
        float.__mod__(self, other)])
}

float.__eq__ = function(self, other){
    check_self_is_float(self, '__eq__')
    if(isNaN(self.value) && isNaN(other)){
        return false
    }
    if(_b_.isinstance(other, _b_.int)){
        return self.value == other
    }
    if(_b_.isinstance(other, float)) {
        return self.value == other.value
    }
    if(_b_.isinstance(other, _b_.complex)){
        if(other.$imag != 0){
            return false
        }
        return self.value == other.$real
    }
    return _b_.NotImplemented
}

float.__floor__ = function(self){
    check_self_is_float(self, '__floor__')
    if(isnan(self)){
        throw _b_.ValueError.$factory('cannot convert float NaN to integer')
    }else if(isinf(self)){
        throw _b_.OverflowError.$factory('cannot convert float infinity to integer')
    }
    return Math.floor(self.value)
}

float.__floordiv__ = function(self, other){
    check_self_is_float(self, '__floordiv__')
    if(_b_.isinstance(other, float)){
        if(other.value == 0){
            throw _b_.ZeroDivisionError.$factory('division by zero')
        }
        return fast_float(Math.floor(self.value / other.value))
    }
    if(_b_.isinstance(other, _b_.int)){
        if(other.valueOf() == 0){
            throw _b_.ZeroDivisionError.$factory('division by zero')
        }
        return fast_float(Math.floor(self.value / other))
    }
    return _b_.NotImplemented
}

float.fromhex = function(arg){
   // [sign] ['0x'] integer ['.' fraction] ['p' exponent]

   if(! _b_.isinstance(arg, _b_.str)){
      throw _b_.ValueError.$factory("argument must be a string")
   }

   var value = arg.trim()   // remove leading and trailing whitespace
   switch(value.toLowerCase()) {
      case "+inf":
      case "inf":
      case "+infinity":
      case "infinity":
          return fast_float(Infinity)
      case "-inf":
      case "-infinity":
          return fast_float(-Infinity)
      case "+nan":
      case "nan":
          return fast_float(Number.NaN)
      case "-nan":
          return fast_float(-Number.NaN)
      case "":
          throw _b_.ValueError.$factory("could not convert string to float")
   }

   var mo = /^(\d*)(\.?)(\d*)$/.exec(value)

   if(mo !== null){
       var res = parseFloat(mo[1]),
           coef = 16
       if(mo[2]){
           for(var digit of mo[3]){
               res += parseInt(digit, 16) / coef
               coef *= 16
           }
       }
       return fast_float(res)
   }

   // lets see if this is a hex string.
   var _m = /^(\+|-)?(0x)?([0-9A-F]+\.?)?(\.[0-9A-F]+)?(p(\+|-)?\d+)?$/i.exec(value)

   if(_m == null){
       throw _b_.ValueError.$factory("invalid hexadecimal floating-point string")
   }

   var _sign = _m[1],
       _int = parseInt(_m[3] || '0', 16),
       _fraction = _m[4] || '.0',
       _exponent = _m[5] || 'p0'

   _sign = _sign == "-" ? -1 : 1

   var _sum = _int

   for(var i = 1, len = _fraction.length; i < len; i++){
       _sum += parseInt(_fraction.charAt(i), 16) / Math.pow(16, i)
   }
   return fast_float(_sign * _sum * Math.pow(2,
       parseInt(_exponent.substring(1))))
}

float.__getformat__ = function(arg){
    if(arg == "double" || arg == "float"){
        return "IEEE, little-endian"
    }
    throw _b_.ValueError.$factory("__getformat__() argument 1 must be " +
        "'double' or 'float'")
}

function preformat(self, fmt){
    var value = self.value
    if(fmt.empty){
        return _b_.str.$factory(self)
    }
    if(fmt.type && 'eEfFgGn%'.indexOf(fmt.type) == -1){
        throw _b_.ValueError.$factory("Unknown format code '" + fmt.type +
            "' for object of type 'float'")
    }
    if(isNaN(value)){
        return (fmt.type == "f" || fmt.type == "g") ? "nan" : "NAN"
    }
    if(value == Number.POSITIVE_INFINITY){
        return (fmt.type == "f" || fmt.type == "g") ? "inf" : "INF"
    }
    if(fmt.precision === undefined && fmt.type !== undefined){
        fmt.precision = 6
    }
    if(fmt.type == "%"){
        value *= 100
    }
    if(fmt.type == "e"){
        var res = value.toExponential(fmt.precision),
            exp = parseInt(res.substr(res.search("e") + 1))
            if(Math.abs(exp) < 10){
                res = res.substr(0, res.length - 1) + "0" +
                    res.charAt(res.length - 1)
            }
        return res
    }

    if(fmt.precision !== undefined){
        // Use Javascript toFixed to get the correct result
        // The argument of toFixed is the number of digits after "."
        var prec = fmt.precision
        if(prec == 0){
            return Math.round(value) + ""
        }
        var res = $B.roundDownToFixed(value, prec), // in py_string.js
            pt_pos = res.indexOf(".")
        if(fmt.type !== undefined &&
                (fmt.type == "%" || fmt.type.toLowerCase() == "f")){
            if(pt_pos == -1){
                res += "." + "0".repeat(fmt.precision)
            }else{
                var missing = fmt.precision - res.length + pt_pos + 1
                if(missing > 0){
                    res += "0".repeat(missing)
                }
            }
        }else if(fmt.type && fmt.type.toLowerCase() == "g"){
            var exp_fmt = preformat(self, {type: "e"}).split("e"),
                exp = parseInt(exp_fmt[1])
            if(-4 <= exp && exp < fmt.precision){
                res = preformat(self,
                        {type: "f", precision: fmt.precision - 1 - exp})
            }else{
                res = preformat(self,
                    {type: "e", precision: fmt.precision - 1})
            }
            var parts = res.split("e")
            if(fmt.alternate){
                if(parts[0].search(/\./) == -1){
                    parts[0] += '.'
                }
            }else{
                var signif = parts[0]
                if(signif.indexOf('.') > 0){
                    while(signif.endsWith("0")){
                        signif = signif.substr(0, signif.length - 1)
                    }
                }
                if(signif.endsWith(".")){
                    signif = signif.substr(0, signif.length - 1)
                }
                parts[0] = signif
            }
            res = parts.join("e")
            if(fmt.type == "G"){
                res = res.toUpperCase()
            }
            return res
        }else if(fmt.type === undefined){
            /*
            For float this is the same as 'g', except that when fixed-point
            notation is used to format the result, it always includes at least
            one digit past the decimal point.
            */
            fmt.type = "g"
            res = preformat(self, fmt)
            if(res.indexOf('.') == -1){
                var exp = res.length - 1,
                    exp = exp < 10 ? '0' + exp : exp,
                    is_neg = res.startsWith('-'),
                    point_pos = is_neg ? 2 : 1,
                    mant = res.substr(0, point_pos) + '.' +
                        res.substr(point_pos)
                return `${mant}e+${exp}`
            }
            fmt.type = undefined
        }else{
            var res1 = value.toExponential(fmt.precision - 1),
                exp = parseInt(res1.substr(res1.search("e") + 1))
            if(exp < -4 || exp >= fmt.precision - 1){
                var elts = res1.split("e")
                // Remove trailing 0 from mantissa
                while(elts[0].endsWith("0")){
                    elts[0] = elts[0].substr(0, elts[0].length - 1)
                }
                res = elts.join("e")
            }
        }
    }else{
        var res = _b_.str.$factory(self)
    }

    if(fmt.type === undefined || "gGn".indexOf(fmt.type) != -1){
        // remove trailing 0 for non-exponential formats
        if(res.search("e") == -1){
            while(res.charAt(res.length - 1) == "0"){
                res = res.substr(0, res.length - 1)
            }
        }
        if(res.charAt(res.length - 1) == "."){
            if(fmt.type === undefined){
                res += "0"
            }else{
                res = res.substr(0, res.length - 1)
            }
        }
    }
    if(fmt.sign !== undefined){
        if((fmt.sign == " " || fmt.sign == "+" ) && value > 0){
            res = fmt.sign + res
        }
    }
    if(fmt.type == "%"){
        res += "%"
    }
    return res
}

float.__format__ = function(self, format_spec){
    check_self_is_float(self, '__format__')
    var fmt = new $B.parse_format_spec(format_spec)
    fmt.align = fmt.align || ">"
    var pf = preformat(self, fmt)
    var raw = pf.split('.'),
        _int = raw[0]
    if(fmt.comma){
        var len = _int.length, nb = Math.ceil(_int.length / 3), chunks = []
        for(var i = 0; i < nb; i++){
            chunks.push(_int.substring(len - 3 * i - 3, len - 3 * i))
        }
        chunks.reverse()
        raw[0] = chunks.join(",")
    }
    return $B.format_width(raw.join("."), fmt) // in py_string.js
}

var nan_hash = $B.$py_next_hash--

float.__hash__ = function(self) {
    check_self_is_float(self, '__hash__')
    if(self.__hashvalue__ !== undefined){
        return self.__hashvalue__
    }
    var _v = self.value
    if(_v === Infinity){
        return 314159
    }else if(_v === -Infinity){
        return -271828
    }else if(isNaN(_v)){
        return self.__hashvalue__ = nan_hash
    }else if(_v === Number.MAX_VALUE){
        return self.__hashvalue__ = $B.fast_long_int(2234066890152476671n)
    }
    // for integers, return the value
    if(Number.isInteger(_v)){
        return _b_.int.__hash__(_v)
    }

    var r = frexp(self)
    r[0] *= Math.pow(2, 31)
    var hipart = _b_.int.$factory(r[0])
    r[0] = (r[0] - hipart) * Math.pow(2, 31)
    var x = hipart + _b_.int.$factory(r[0]) + (r[1] << 15)
    return x & 0xFFFFFFFF
}

function isninf(x) {
    var x1 = x
    if(_b_.isinstance(x, float)){
        x1 = float.numerator(x)
    }
    return x1 == -Infinity || x1 == Number.NEGATIVE_INFINITY
}

function isinf(x) {
    var x1 = x
    if(_b_.isinstance(x, float)){
        x1 = float.numerator(x)
    }
    return x1 == Infinity || x1 == -Infinity ||
        x1 == Number.POSITIVE_INFINITY || x1 == Number.NEGATIVE_INFINITY
}

function isnan(x) {
    var x1 = x
    if(_b_.isinstance(x, float)){
        x1 = float.numerator(x)
    }
    return isNaN(x1)
}

function fabs(x){
    if(x == 0){
        return fast_float(0)
    }
    return x > 0 ? float.$factory(x) : float.$factory(-x)
}

function frexp(x){
    var x1 = x
    if(_b_.isinstance(x, float)){
        x1 = x.value
    }

    if(isNaN(x1) || isinf(x1)){
        return [x1, -1]
    }else if (x1 == 0){
        return [0, 0]
    }

    var sign = 1,
        ex = 0,
        man = x1

    if(man < 0.){
       sign = -sign
       man = -man
    }

    while(man < 0.5){
       man *= 2.0
       ex--
    }

    while(man >= 1.0){
       man *= 0.5
       ex++
    }

    man *= sign

    return [man, ex]
}

function ldexp(x, i) {
    if(isninf(x)){
        return float.$factory('-inf')
    }else if(isinf(x)){
        return float.$factory('inf')
    }

    var y = x
    if(_b_.isinstance(x, float)){
        y = x.value
    }
    if(y == 0){
        return y
    }

    var j = i
    if(_b_.isinstance(i, float)){
        j = i.value
    }
    return $B.fast_float(y * Math.pow(2, j))
}

float.$funcs = {isinf, isninf, isnan, fabs, frexp, ldexp}

float.hex = function(self) {
    // http://hg.python.org/cpython/file/d422062d7d36/Objects/floatobject.c
    self = float_value(self)
    var DBL_MANT_DIG = 53,   // 53 bits?
        TOHEX_NBITS = DBL_MANT_DIG + 3 - (DBL_MANT_DIG + 2) % 4

    switch(self.valueOf()) {
        case Infinity:
        case -Infinity:
        case Number.NaN:
        case -Number.NaN:
            return self
        case -0:
            return "-0x0.0p0"
        case 0:
            return "0x0.0p0"
    }

    var _a = frexp(fabs(self.valueOf())),
        _m = _a[0],
        _e = _a[1],
        _shift = 1 - Math.max(-1021 - _e, 0)

    _m = ldexp(_m, _shift)
    _e -= _shift

    var _int2hex = "0123456789ABCDEF".split(""),
        _s = _int2hex[Math.floor(_m)]
    _s += '.'
    _m -= Math.floor(_m)

    for(var i = 0; i < (TOHEX_NBITS - 1) / 4; i++){
        _m *= 16.0
        _s += _int2hex[Math.floor(_m)]
        _m -= Math.floor(_m)
    }

    var _esign = "+"
    if(_e < 0){
       _esign = "-"
       _e = -_e
    }

    if(self.value < 0){return "-0x" + _s + "p" + _esign + _e}
    return "0x" + _s + "p" + _esign + _e
}

float.__init__ = function(self, value){
    return _b_.None
}

float.__int__ = function(self){
    check_self_is_float(self, '__int__')
    if(Number.isInteger(self.value)){
        var res = BigInt(self.value),
            res_num = Number(res)
        return Number.isSafeInteger(res_num) ?
                   res_num :
                   $B.fast_long_int(res)
    }
    return parseInt(self.value)
}

float.is_integer = function(self){
    return Number.isInteger(self.value)
}

float.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    check_self_is_float(self, '__mod__')
    if(other == 0){
        throw _b_.ZeroDivisionError.$factory("float modulo")
    }
    if(_b_.isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        return fast_float((self.value % other + other) % other)
    }

    if(_b_.isinstance(other, float)){
        // use truncated division
        // cf https://en.wikipedia.org/wiki/Modulo_operation
        var q = Math.floor(self.value / other.value),
            r = self.value - other.value * q
        if(r == 0 && other.value < 0){
            return fast_float(-0)
        }
        return fast_float(r)
    }
    return _b_.NotImplemented
}

float.__mro__ = [object]

float.__mul__ = function(self, other){
    if(_b_.isinstance(other, _b_.int)){
        if(other.__class__ == $B.long_int){
            return fast_float(self.value * parseFloat(other.value))
        }
        other = _b_.int.numerator(other)
        return fast_float(self.value * other)
    }
    if(_b_.isinstance(other, float)){
        return fast_float(self.value * other.value)
    }
    return _b_.NotImplemented
}

float.__ne__ = function(self, other){
    var res = float.__eq__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

float.__neg__ = function(self){
    return fast_float(-self.value)
}

float.__new__ = function(cls, value){
    if(cls === undefined){
        throw _b_.TypeError.$factory("float.__new__(): not enough arguments")
    }else if(! _b_.isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("float.__new__(X): X is not a type object")
    }
    return {
        __class__: cls,
        value: float.$factory(value).value
    }
}

float.__pos__ = function(self){
    return fast_float(+self.value)
}

float.__pow__ = function(self, other){
    var other_int = _b_.isinstance(other, _b_.int)
    if(other_int || _b_.isinstance(other, float)){
        if(! other_int){
            other = other.value
        }
        if(self.value == 1){
            return fast_float(1) // even for Infinity or NaN
        }else if(other == 0){
            return fast_float(1)
        }

        if(isNaN(other)){
            return fast_float(Number.NaN)
        }
        if(isNaN(self.value)){
            return fast_float(Number.NaN)
        }

        if(self.value == -1 && ! isFinite(other)){
            // (-1)**+-inf is 1
            return fast_float(1)
        }else if(self.value == 0 && isFinite(other) && other < 0){
            throw _b_.ZeroDivisionError.$factory("0.0 cannot be raised " +
                "to a negative power")
        }else if(self.value == 0 && isFinite(other) && other >= 0){
            /* # (+-0)**y is +-0 for y a positive odd integer */
            if(Number.isInteger(other) && other % 2 == 1){
                return self
            }
            /* (+-0)**y is 0 for y finite and positive but not an odd integer */
            return fast_float(0)
        }else if(self.value == Number.NEGATIVE_INFINITY && ! isNaN(other)){
            /*
            (-INF)**y is
                -0.0 for y a negative odd integer
                0.0 for y negative but not an odd integer
                -INF for y a positive odd integer
                INF for y positive but not an odd integer
            */
            if(other % 2 == -1){
                return fast_float(-0.0)
            }else if(other < 0){
                return fast_float(0)
            }else if(other % 2 == 1){
                return fast_float(Number.NEGATIVE_INFINITY)
            }else{
                return fast_float(Number.POSITIVE_INFINITY)
            }
        }else if(self.value == Number.POSITIVE_INFINITY && ! isNaN(other)){
            return other > 0 ? self : fast_float(0)
        }
        if(other == Number.NEGATIVE_INFINITY && ! isNaN(self.value)){
            // x**-INF is INF for abs(x) < 1 and 0 for abs(x) > 1
            return Math.abs(self.value) < 1 ?
                       fast_float(Number.POSITIVE_INFINITY) :
                       fast_float(0)
        }else if(other == Number.POSITIVE_INFINITY  && ! isNaN(self.value)){
            // x**INF is 0 for abs(x) < 1 and INF for abs(x) > 1
            return Math.abs(self.value) < 1 ?
                       fast_float(0) :
                       fast_float(Number.POSITIVE_INFINITY)
        }
        /*
        x**y defers to complex pow for finite negative x and
        non-integral y.
        */
        if(self.value < 0 && ! Number.isInteger(other)){
            return _b_.complex.__pow__($B.make_complex(self.value, 0),
                                       fast_float(other))
        }
        return fast_float(Math.pow(self.value, other))
    }
    return _b_.NotImplemented
}

function __newobj__(){
    // __newobj__ is called with a generator as only argument
    var $ = $B.args('__newobj__', 0, {}, [], arguments, {}, 'args', null),
        args = $.args
    return {
        __class__: args[0],
        value: args[1]
    }
}

float.__reduce_ex__ = function(self){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__ || _b_.int, self.value]),
        _b_.None,
        _b_.None,
        _b_.None])
}

float.__repr__ = function(self){
    $B.builtins_repr_check(float, arguments) // in brython_builtins.js
    self = self.value
    if(self == Infinity){
        return 'inf'
    }else if(self == -Infinity){
        return '-inf'
    }else if(isNaN(self)){
        return 'nan'
    }else if(self === 0){
        if(1 / self === -Infinity){
            return '-0.0'
        }
        return '0.0'
    }

    var res = self + "" // coerce to string

    if(res.search(/[.eE]/) == -1){
        res += ".0"
    }
    var split_e = res.split(/e/i)
    if(split_e.length == 2){
        var mant = split_e[0],
            exp = split_e[1]
        if(exp.startsWith('-')){
            exp_str = parseInt(exp.substr(1)) + ''
            if(exp_str.length < 2){
                exp_str = '0' + exp_str
            }
            return mant + 'e-' + exp_str
        }
    }
    var x, y
    [x, y] = res.split('.')
    var sign = ''
    if(x[0] == '-'){
        x = x.substr(1)
        sign = '-'
    }
    if(x.length > 16){
        var exp = x.length - 1,
            int_part = x[0],
            dec_part = x.substr(1) + y
        while(dec_part.endsWith("0")){
            dec_part = dec_part.substr(0, dec_part.length - 1)
        }
        var mant = int_part
        if(dec_part.length > 0){
            mant += '.' + dec_part
        }
        return sign + mant + 'e+' + exp
    }else if(x == "0"){
        var exp = 0
        while(exp < y.length && y.charAt(exp) == "0"){
            exp++
        }
        if(exp > 3){
            // form 0.0000xyz
            var rest = y.substr(exp),
                exp = (exp + 1).toString()
            while(rest.endsWith("0")){
                rest = rest.substr(0, res.length - 1)
            }
            var mant = rest[0]
            if(rest.length > 1){
                mant += '.' + rest.substr(1)
            }
            if(exp.length == 1){
                exp = '0' + exp
            }
            return sign + mant + 'e-' + exp
        }
    }
    return _b_.str.$factory(res)
}

float.__setattr__ = function(self, attr, value){
    if(self.__class__ === float){
        if(float[attr] === undefined){
            throw _b_.AttributeError.$factory("'float' object has no attribute '" +
                attr + "'")
        }else{
            throw _b_.AttributeError.$factory("'float' object attribute '" +
                attr + "' is read-only")
        }
    }
    // subclasses of float can have attributes set
    self[attr] = value
    return _b_.None
}

float.__truediv__ = function(self, other){
    if(_b_.isinstance(other, _b_.int)){
        if(other.valueOf() == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }else if(_b_.isinstance(other, $B.long_int)){
            return float.$factory(self.value / Number(other.value))
        }
        return float.$factory(self.value / other)
    }else if(_b_.isinstance(other, float)){
        if(other.value == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return float.$factory(self.value / other.value)
    }
    return _b_.NotImplemented
}

// operations
var $op_func = function(self, other){
    if(_b_.isinstance(other, _b_.int)){
        if(typeof other == "boolean"){
            return other ? $B.fast_float(self.value - 1) : self
        }else if(other.__class__ === $B.long_int){
            return float.$factory(self.value - parseInt(other.value))
        }else{
            return fast_float(self.value - other)
        }
    }
    if(_b_.isinstance(other, float)){
        return fast_float(self.value - other.value)
    }
    return _b_.NotImplemented
}
$op_func += "" // source code
var $ops = {"+": "add", "-": "sub"}
for(var $op in $ops){
    var $opf = $op_func.replace(/-/gm, $op)
    $opf = $opf.replace(/__rsub__/gm, "__r" + $ops[$op] + "__")
    eval("float.__" + $ops[$op] + "__ = " + $opf)
}

// comparison methods
var $comp_func = function(self, other){

    if(_b_.isinstance(other, _b_.int)){
        if(other.__class__ === $B.long_int){
            return self.value > parseInt(other.value)
        }
        return self.value > other.valueOf()
    }
    if(_b_.isinstance(other, float)){
        return self.value > other.value
    }

    if(_b_.isinstance(other, _b_.bool)) {
        return self.value > _b_.bool.__hash__(other)
    }
    if(_b_.hasattr(other, "__int__") || _b_.hasattr(other, "__index__")) {
       return _b_.int.__gt__(self.value, $B.$GetInt(other))
    }

    // See if other has the opposite operator, eg <= for >
    var inv_op = $B.$getattr(other, "__le__", _b_.None)
    if(inv_op !== _b_.None){
        return inv_op(self)
    }

    throw _b_.TypeError.$factory(
        "unorderable types: float() > " + $B.class_name(other) + "()")
}

$comp_func += "" // source code
for(var $op in $B.$comps){
    eval("float.__" + $B.$comps[$op] + "__ = "+
          $comp_func.replace(/>/gm, $op).
              replace(/__gt__/gm, "__" + $B.$comps[$op] + "__").
              replace(/__le__/, "__" + $B.$inv_comps[$op] + "__"))
}

// add "reflected" methods
var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or", "divmod"]

for(var r_opname of r_opnames){
    if(float["__r" + r_opname + "__"] === undefined &&
            float['__' + r_opname + '__']){
        float["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                var other_as_num = _b_.int.$to_js_number(other)
                if(other_as_num !== null){
                    var other_as_float = $B.fast_float(other_as_num)
                    return float["__" + name + "__"](other_as_float, self)
                }
                return _b_.NotImplemented
            }
        })(r_opname)
    }
}

function $FloatClass(value){
    return new Number(value)
}

function to_digits(s){
    // Transform a string to another string where all arabic-indic digits
    // are converted to latin digits
    var arabic_digits = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669",
        res = ""
    for(var i = 0; i < s.length; i++){
        var x = arabic_digits.indexOf(s[i])
        if(x > -1){res += x}
        else{res += s[i]}
    }
    return res
}

$B.fast_float = fast_float = function(value){
    return {__class__: _b_.float, value}
}

// constructor for built-in class 'float'
float.$factory = function(value){
    if(value === undefined){
        return fast_float(0)
    }
    $B.check_nb_args_no_kw('float', 1, arguments)
    switch(value) {
        case true:
            return fast_float(1)
        case false:
            return fast_float(0)
    }

    var original_value = value

    if(typeof value == "number"){
        return fast_float(value)
    }
    if(value.__class__ === float){
        return value
    }

    if(_b_.isinstance(value, _b_.memoryview)){
        value = _b_.memoryview.tobytes(value)
    }

    if(_b_.isinstance(value, _b_.bytes)){
        try{
            value = $B.$getattr(value, "decode")("utf-8")
        }catch(err){
            throw _b_.ValueError.$factory(
                "could not convert string to float: " +
                _b_.repr(original_value))
        }
    }

    if(typeof value == "string"){
       value = value.trim()   // remove leading and trailing whitespace
       switch(value.toLowerCase()) {
           case "+inf":
           case "inf":
           case "+infinity":
           case "infinity":
               return fast_float(Number.POSITIVE_INFINITY)
           case "-inf":
           case "-infinity":
               return fast_float(Number.NEGATIVE_INFINITY)
           case "+nan":
           case "nan":
               return fast_float(Number.NaN)
           case "-nan":
               return fast_float(-Number.NaN)
           case "":
               throw _b_.ValueError.$factory("count not convert string to float")
           default:
               value = value.charAt(0) + value.substr(1).replace(/_/g, "") // PEP 515
               value = to_digits(value) // convert arabic-indic digits to latin
               if(isFinite(value)){
                   return fast_float(eval(value))
               }else{
                   throw _b_.ValueError.$factory(
                       "could not convert string to float: " +
                       _b_.repr(original_value))
               }
         }
    }

    var klass = value.__class__,
        float_method = $B.$getattr(klass, '__float__', null)

    if(float_method === null){
        var index_method = $B.$getattr(klass, '__index__', null)

        if(index_method === null){
            throw _b_.TypeError.$factory("float() argument must be a string or a " +
                "number, not '" + $B.class_name(value) + "'")
        }
        var res = $B.$call(index_method)(value),
            klass = $B.get_class(res)

        if(klass === _b_.int){
            return fast_float(res)
        }else if(klass === $B.long_int){
            return $B.long_int.__float__(res)
        }else if(klass.__mro__.indexOf(_b_.int) > -1){
            var msg =  `${$B.class_name(value)}.__index__ returned ` +
                `non-int (type ${$B.class_name(res)}).  The ` +
                'ability to return an instance of a strict subclass' +
                ' of int is deprecated, and may be removed in a ' +
                'future version of Python.'
            $B.warn(_b_.DeprecationWarning, msg)
            return fast_float(res)
        }
        throw _b_.TypeError.$factory('__index__ returned non-int' +
            ` (type ${$B.class_name(res)})`)
    }
    var res = $B.$call(float_method)(value),
        klass = $B.get_class(res)

    if(klass !== _b_.float){
        if(klass.__mro__.indexOf(_b_.float) > -1){
            var msg =  `${$B.class_name(value)}.__float__ returned ` +
                `non-float (type ${$B.class_name(res)}).  The ` +
                'ability to return an instance of a strict subclass' +
                ' of float is deprecated, and may be removed in a ' +
                'future version of Python.'
            $B.warn(_b_.DeprecationWarning, msg)
            return float.$factory(res.value)
        }
        throw _b_.TypeError.$factory('__float__ returned non-float' +
            ` (type ${$B.class_name(res)})`)
    }

    return res
    /*
    var num_value = $B.to_num(value, ["__float__", "__index__"])

    if(num_value !== null){
        if(! isFinite(num_value.value)){
            throw _b_.OverflowError.$factory('int too large to convert to float')
        }
        return num_value
    }
    */
}

$B.$FloatClass = $FloatClass

$B.set_func_names(float, "builtins")

// Dictionary and factory for subclasses of float
var FloatSubclass = $B.FloatSubclass  = {
    __class__: _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "builtins",
        __name__: "float"
    },
    $is_class: true
}

for(var $attr in float){
    if(typeof float[$attr] == "function"){
        FloatSubclass[$attr] = (function(attr){
            return function(){
                var args = [], pos = 0
                if(arguments.length > 0){
                    var args = [arguments[0].valueOf()], pos = 1
                    for(var i = 1, len = arguments.length; i < len; i++){
                        args[pos++] = arguments[i]
                    }
                }
                return float[attr].apply(null, args)
            }
        })($attr)
    }
}

$B.set_func_names(FloatSubclass, "builtins")

_b_.float = float

$B.MAX_VALUE = fast_float(Number.MAX_VALUE)
$B.MIN_VALUE = fast_float(Number.MIN_VALUE)


})(__BRYTHON__)
