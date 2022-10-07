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

float.$float_value = float_value

float.$to_js_number = function(self){
    if(self.__class__ === float){
        return self.value
    }else{
        return float.$to_js_number(self.value)
    }
}

float.numerator = function(self){return self}
float.denominator = function(self){return 1}
float.imag = function(self){return 0}
float.real = function(self){return self}

float.__float__ = function(self){
    return self
}

// cache lshifts of 1
$B.shift1_cache = {}

float.as_integer_ratio = function(self){
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

const DBL_MANT_DIG = 53,
      LONG_MAX = __BRYTHON__.MAX_VALUE,
      DBL_MAX_EXP = 2 ** 10,
      LONG_MIN = __BRYTHON__.MIN_VALUE,
      DBL_MIN_EXP = -1021

float.fromhex = function(klass, s){
    function hex_from_char(char){
        return parseInt(char, 16)
    }
    function finished(){
      /* optional trailing whitespace leading to the end of the string */
      while (s[pos] && s[pos].match(/\s/)){
          pos++;
      }
      if (pos != s.length){
          throw parse_error()
      }
      if(negate){
          x = float.__neg__(x)
      }
      return klass === _b_.float ? x : $B.$call(klass)(x)
    }
    function overflow_error(){
        throw _b_.OverflowError.$factory(
                      "hexadecimal value too large to represent as a float");
    }
    function parse_error(){
        throw _b_.ValueError.$factory(
                      "invalid hexadecimal floating-point string");
    }

    function insane_length_error(){
        throw _b_.ValueError.$factory(
                      "hexadecimal string too long to convert");
    }

    // remove leading and trailing spaces
    s = s.trim()

    var re_parts = [/^(?<sign>[+-])?(0x)?/,
                    /(?<integer>[0-9a-fA-F]+)?/,
                    /(?<fraction>\.(?<fvalue>[0-9a-fA-F]+))?/,
                    /(?<exponent>p(?<esign>[+-])?(?<evalue>\d+))?$/]
    var re = new RegExp(re_parts.map(r => r.source).join(''))
    var mo = re.exec(s)
    /* inf and nan */
    if(s.match(/^\+?inf(inity)?$/i)){
        return INF
    }else if(s.match(/^-inf(inity)?$/i)){
        return NINF
    }else if(s.match(/^[+-]?nan$/i)){
        return NAN
    }
    /* optional sign */
    var pos = 0,
        negate,
        ldexp = _b_.float.$funcs.ldexp

    if(s[pos] == '-'){
        pos++;
        negate = 1;
    }else if(s[pos] == '+'){
        pos++
    }

    /* [0x] */
    if(s.substr(pos, 2).toLowerCase() == '0x'){
        pos += 2
    }

    /* coefficient: <integer> [. <fraction>] */
    var coeff_start = pos,
        coeff_end
    while (hex_from_char(s[pos]) >= 0){
        pos++;
    }
    save_pos = pos;
    if (s[pos] == '.') {
        pos++;
        while (hex_from_char(s[pos]) >= 0){
            pos++;
        }
        coeff_end = pos - 1;
    }else{
        coeff_end = pos;
    }

    /* ndigits = total # of hex digits; fdigits = # after point */
    ndigits = coeff_end - coeff_start;
    fdigits = coeff_end - save_pos;
    if (ndigits == 0){
        throw parse_error()
    }
    if (ndigits > Math.min(DBL_MIN_EXP - DBL_MANT_DIG - LONG_MIN/2,
                         LONG_MAX/2 + 1 - DBL_MAX_EXP)/4){
        throw insane_length_error()
    }
    /* [p <exponent>] */
    var exp
    if (s[pos] == 'p' || s[pos] == 'P') {
        pos++;
        var exp_start = pos;
        if (s[pos] == '-' || s[pos ]== '+'){
            pos++;
        }
        if (!('0' <= s[pos] && s[pos] <= '9')){
            throw parse_error()
        }
        pos++;
        while ('0' <= s[pos] && s[pos] <= '9'){
            pos++;
        }
        exp = parseInt(s.substr(exp_start));
    }else{
        exp = 0;
    }

    /* for 0 <= j < ndigits, HEX_DIGIT(j) gives the jth most significant digit */
    function HEX_DIGIT(j){
        if(! Number.isInteger(j)){
            throw Error('j pas entier')
        }
        var pos = j < fdigits ? coeff_end - j : coeff_end - 1 - j

        return  hex_from_char(s[j < fdigits ?
                         coeff_end - j :
                         coeff_end - 1 - j])
    }
    /*******************************************
     * Compute rounded value of the hex string *
     *******************************************/

    /* Discard leading zeros, and catch extreme overflow and underflow */
    while (ndigits > 0 && HEX_DIGIT(ndigits-1) == 0){
        ndigits--;
    }
    if (ndigits == 0 || exp < LONG_MIN/2) {
        x = ZERO;
        return finished()
    }
    if (exp > LONG_MAX/2){
        throw overflow_error;
    }
    /* Adjust exponent for fractional part. */
    exp = exp - 4 * fdigits;

    /* top_exp = 1 more than exponent of most sig. bit of coefficient */
    var top_exp = exp + 4 * (ndigits - 1);
    for (var digit = BigInt(HEX_DIGIT(ndigits - 1)); digit != 0; digit /= 2n){
        top_exp++;
    }
    /* catch almost all nonextreme cases of overflow and underflow here */
    if (top_exp < DBL_MIN_EXP - DBL_MANT_DIG) {
        x = ZERO;
        return finished()
    }
    if (top_exp > DBL_MAX_EXP){
        throw overflow_error()
    }
    /* lsb = exponent of least significant bit of the *rounded* value.
       This is top_exp - DBL_MANT_DIG unless result is subnormal. */
    var lsb = Math.max(top_exp, DBL_MIN_EXP) - DBL_MANT_DIG;

    var x = 0.0;
    if (exp >= lsb) {
        /* no rounding required */
        for (var i = ndigits - 1; i >= 0; i--){
            x = 16.0 * x + HEX_DIGIT(i);
        }
        x = ldexp($B.fast_float(x), exp);
        return finished()
    }
    /* rounding required.  key_digit is the index of the hex digit
       containing the first bit to be rounded away. */
    var half_eps = 1 << ((lsb - exp - 1) % 4),
        key_digit = parseInt((lsb - exp - 1) / 4);
    for (var i = ndigits - 1; i > key_digit; i--){
        x = 16.0 * x + HEX_DIGIT(i);
    }
    var digit = HEX_DIGIT(key_digit);
    x = 16.0 * x + (digit & (16 - 2 * half_eps));

    /* round-half-even: round up if bit lsb-1 is 1 and at least one of
       bits lsb, lsb-2, lsb-3, lsb-4, ... is 1. */
    if ((digit & half_eps) != 0) {
        var round_up = 0;
        if ((digit & (3 * half_eps - 1)) != 0 || (half_eps == 8 &&
                key_digit + 1 < ndigits && (HEX_DIGIT(key_digit+1) & 1) != 0)){
            round_up = 1;
        }else{
            for (var i = key_digit-1; i >= 0; i--){
                if (HEX_DIGIT(i) != 0) {
                    round_up = 1;
                    break;
                }
            }
        }
        if (round_up) {
            x += 2 * half_eps;
            if (top_exp == DBL_MAX_EXP &&
                x == ldexp(2 * half_eps, DBL_MANT_DIG).value)
                /* overflow corner case: pre-rounded value <
                   2**DBL_MAX_EXP; rounded=2**DBL_MAX_EXP. */
                throw overflow_error()
        }
    }
    x = ldexp(x, (exp + 4 * key_digit));
    return finished()

}

float.__getformat__ = function(arg){
    if(arg == "double" || arg == "float"){
        return "IEEE, little-endian"
    }
    throw _b_.ValueError.$factory("__getformat__() argument 1 must be " +
        "'double' or 'float'")
}

var format_sign = function(val, flags){
    switch(flags.sign){
        case '+':
            // indicates that a sign should be used for both positive as well
            // as negative numbers
            return (val >= 0 || isNaN(val)) ? '+' : ''
        case '-':
            // indicates that a sign should be used only for negative numbers
            // (this is the default behavior)
            return ''
        case ' ':
            // indicates that a leading space should be used on positive
            // numbers, and a minus sign on negative numbers
            return (val >= 0 || isNaN(val)) ? ' ' : ''
    }
    if(flags.space){
        if(val >= 0){
            return " "
        }
    }
    return ''
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
    var special
    if(isNaN(value)){
        special = "efg".indexOf(fmt.type) > -1 ? "nan" : "NAN"
    }else if(value == Number.POSITIVE_INFINITY){
        special = "efg".indexOf(fmt.type) > -1 ? "inf" : "INF"
    }else if(value == Number.NEGATIVE_INFINITY){
        special = "efg".indexOf(fmt.type) > -1 ? "-inf" : "-INF"
    }
    if(special){
        return format_sign(value, fmt) + special
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
        return -314159
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
    var hipart = parseInt(r[0])
    r[0] = (r[0] - hipart) * Math.pow(2, 31)
    var x = hipart + _b_.int.$factory(r[0]) + (r[1] << 15)
    return x & 0xFFFFFFFF
}

function isninf(x) {
    var x1 = float_value(x).value
    return x1 == -Infinity || x1 == Number.NEGATIVE_INFINITY
}

function isinf(x) {
    var x1 = float_value(x).value
    return x1 == Infinity || x1 == -Infinity ||
        x1 == Number.POSITIVE_INFINITY || x1 == Number.NEGATIVE_INFINITY
}

function isnan(x){
    var x1 = float_value(x).value
    return isNaN(x1)
}

function fabs(x){
    if(x == 0){
        return fast_float(0)
    }
    return x > 0 ? float.$factory(x) : float.$factory(-x)
}

function frexp(x){
    // x is Python int or float
    var x1 = x
    if(_b_.isinstance(x, float)){
        // special case
        if(isnan(x) || isinf(x)){
            return [x, 0]
        }
        x1 = float_value(x).value
    }
    if(x1 == 0){
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

// copied from
// https://blog.codefrau.net/2014/08/deconstructing-floats-frexp-and-ldexp.html
function ldexp(mantissa, exponent) {
    if(isninf(mantissa)){
        return NINF
    }else if(isinf(mantissa)){
        return INF
    }
    if(_b_.isinstance(mantissa, _b_.float)){
        mantissa = mantissa.value
    }
    if(mantissa == 0){
        return ZERO
    }
    var steps = Math.min(3, Math.ceil(Math.abs(exponent) / 1023));
    var result = mantissa;
    for (var i = 0; i < steps; i++){
        result *= Math.pow(2, Math.floor((exponent + i) / steps));
    }
    return fast_float(result);
}

float.$funcs = {isinf, isninf, isnan, fabs, frexp, ldexp}

float.hex = function(self) {
    // http://hg.python.org/cpython/file/d422062d7d36/Objects/floatobject.c
    self = float_value(self)
    var TOHEX_NBITS = DBL_MANT_DIG + 3 - (DBL_MANT_DIG + 2) % 4
    if(isNaN(self.value) || ! isFinite(self.value)){
        return _b_.repr(self)
    }
    if(self.value == 0){
        return Object.is(self.value, 0) ? "0x0.0p0" : "-0x0.0p0"
    }

    var _a = frexp(fabs(self.value)),
        _m = _a[0],
        _e = _a[1],
        _shift = 1 - Math.max(-1021 - _e, 0)

    _m = ldexp(fast_float(_m), _shift).value
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

    if(self.value < 0){
        return "-0x" + _s + "p" + _esign + _e
    }
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
        $B.fast_tuple([self.__class__ || _b_.float, _b_.repr(self)]),
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

float.__round__ = function(){
    var $ = $B.args('__round__', 2, {self: null, ndigits: null},
            ['self', 'ndigits'], arguments, {ndigits: _b_.None}, null, null),
        x = $.self,
        ndigits = $.ndigits === _b_.None ? 0 : $.ndigits
    return float.$round(x, ndigits)
}

float.$round = function(x, ndigits){
    x = float_value(x)
    if(ndigits == 0){
        var res = Math.round(x.value)
        if(Math.abs(x.value - res) == 0.5){
           // rounding is done towards the even choice
           if(res % 2){
               return res - 1
           }
       }
       return res
    }
    if(ndigits.__class__ === $B.long_int){
        ndigits = Number(ndigits.value)
    }
    // avoids parsing arguments
    var pow1,
        pow2,
        y,
        z;
    if(ndigits >= 0){
        if(ndigits > 22){
            /* pow1 and pow2 are each safe from overflow, but
               pow1*pow2 ~= pow(10.0, ndigits) might overflow */
            pow1 = 10 ** (ndigits - 22)
            pow2 = 1e22;
        }else{
            pow1 = 10 ** ndigits
            pow2 = 1.0;
        }
        y = (x.value * pow1) * pow2;
        /* if y overflows, then rounded value is exactly x */
        if(!isFinite(y)){
            return x
        }
    }else{
        pow1 = 10 ** -ndigits;
        pow2 = 1.0; /* unused; silences a gcc compiler warning */
        if(isFinite(pow1)){
            y = x.value / pow1
        }else{
            return ZERO
        }
    }

    z = Math.round(y);
    if (fabs(y - z).value == 0.5){
        /* halfway between two integers; use round-half-even */
        z = 2.0 * Math.round(y / 2);
    }
    if(ndigits >= 0){
        z = (z / pow2) / pow1;
    }else{
        z *= pow1;
    }
    /* if computation resulted in overflow, raise OverflowError */
    if (! isFinite(z)) {
        throw _b_.OverflowError.$factory(
                        "overflow occurred during round");
    }

    return fast_float(z);
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

var fast_float_with_hash = function(value, hash_value){
    return {
               __class__: _b_.float,
               __hashvalue__: hash_value,
               value}
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
               var parts = value.split('e')
               if(parts[1]){
                   if(parts[1].startsWith('+') || parts[1].startsWith('-')){
                       parts[1] = parts[1].substr(1)
                   }
               }
               parts = parts[0].split('.').concat(parts.splice(1))
               for(var part of parts){
                   if(part.startsWith('_') || part.endsWith('_')){
                       throw _b_.ValueError.$factory('invalid float literal ' +
                           value)
                   }
               }
               if(value.indexOf('__') > -1){
                       throw _b_.ValueError.$factory('invalid float literal ' +
                           value)
               }
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

float.fromhex = _b_.classmethod.$factory(float.fromhex)

_b_.float = float

$B.MAX_VALUE = fast_float(Number.MAX_VALUE)
$B.MIN_VALUE = fast_float(2.2250738585072014e-308) // != Number.MIN_VALUE
const NINF = fast_float(Number.NEGATIVE_INFINITY),
      INF = fast_float(Number.POSITIVE_INFINITY),
      NAN = fast_float(Number.NaN),
      ZERO = fast_float(0),
      NZERO = fast_float(-0)

})(__BRYTHON__)
