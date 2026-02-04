"use strict";
(function($B){
/*
Module to manipulate long integers
*/

var _b_ = $B.builtins

var long_int = $B.long_int = $B.make_builtin_class('long_int')

var int_or_long = _b_.int.$int_or_long

function toBigInt(obj){
    if($B.$isinstance(obj, $B.long_int)){
        return obj.value
    }else if($B.$isinstance(obj, _b_.int)){
        return BigInt(_b_.int.$int_value(obj))
    }else{
        return $B.NULL
    }
}

function preformat(self, fmt){
    if(fmt.empty){return _b_.str.$factory(self)}
    if(fmt.type && 'bcdoxXn'.indexOf(fmt.type) == -1){
        $B.RAISE(_b_.ValueError, "Unknown format code '" + fmt.type +
            "' for object of type 'int'")
    }
    var res
    switch(fmt.type){
        case undefined:
        case "d":
            res = self.toString()
            break
        case "b":
            res = (fmt.alternate ? "0b" : "") + BigInt(self.value).toString(2)
            break
        case "c":
            res = _b_.chr(self)
            break
        case "o":
            res = (fmt.alternate ? "0o" : "") + BigInt(self.value).toString(8)
            break
        case "x":
            res = (fmt.alternate ? "0x" : "") + BigInt(self.value).toString(16)
            break
        case "X":
            res = (fmt.alternate ? "0X" : "") + BigInt(self.value).toString(16).toUpperCase()
            break
        case "n":
            return self // fix me
    }

    if(fmt.sign !== undefined){
        if((fmt.sign == " " || fmt.sign == "+" ) && self >= 0){
            res = fmt.sign + res
        }
    }
    return res
}

long_int.$to_js_number = function(self){
    return Number(self.value)
}

long_int.__format__ = function(self, format_spec){
    var fmt = new $B.parse_format_spec(format_spec, self)
    if(fmt.type && 'eEfFgG%'.indexOf(fmt.type) != -1){
        // Call __format__ on float(self)
        return _b_.float.__format__(self, format_spec)
    }
    fmt.align = fmt.align || ">"
    var res = preformat(self, fmt)
    if(fmt.comma){
        var sign = res[0] == "-" ? "-" : "",
            rest = res.substr(sign.length),
            len = rest.length,
            nb = Math.ceil(rest.length/3),
            chunks = []
        for(var i = 0; i < nb; i++){
            chunks.push(rest.substring(len - 3 * i - 3, len - 3 * i))
        }
        chunks.reverse()
        res = sign + chunks.join(",")
    }
    return $B.format_width(res, fmt)
}




long_int.__index__ = function(self){
    return self
}

long_int.__pow__ = function(self, power, z){
    if(z !== undefined){
        return _b_.int.__pow__(self, power, z)
    }
    if(typeof power == "number"){
        return int_or_long(self.value ** BigInt(power))
    }else if(typeof power == "boolean"){
        return int_or_long(self.value ** power ? 1n : 0n)
    }else if($B.is_long_int(power)){
        return int_or_long(self.value ** power.value)
    }else if($B.$isinstance(power, _b_.int)){
        // int subclass
        return long_int.__pow__(self, power.$brython_value)
    }
    return _b_.NotImplemented
}


long_int.__truediv__ = function(self, other){
    if(typeof other == "number"){
        return $B.fast_float(Number(self.value) / other)
    }else if(typeof other == "boolean"){
        return $B.fast_float(Number(self.value) * (other ? 1 : 0))
    }else if($B.is_long_int(other)){
        return $B.fast_float(Number(self.value) / Number(other.value))
    }else if($B.$isinstance(other, _b_.int)){
        // int subclass
        return long_int.__truediv__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.bit_count = function(self){
    var s = self.value.toString(2),
        nb = 0
    for(var x of s){
        if(x == '1'){
            nb++
        }
    }
    return nb
}

long_int.bit_length = function(self){
    return self.value.toString(2).length
}

function _infos(self){
    // return a JS object with bit length, power of 2 below self,
    // rest = self - pow2, relative_rest = rst / pow2
    var nbits = $B.long_int.bit_length(self),
        pow2 = 2n ** BigInt(nbits - 1),
        rest = BigInt(self.value) - pow2,
        relative_rest = new Number(rest / pow2)
    return {nbits, pow2, rest, relative_rest}
}

long_int.$log2 = function(x){
    if(x.value < 0){
        $B.RAISE(_b_.ValueError, 'math domain error')
    }
    // x = 2 ** (infos.nbits - 1) * ( 1 + infos.relative_rest)
    var infos = _infos(x)
    return _b_.float.$factory(infos.nbits - 1 +
        Math.log(1 + infos.relative_rest / Math.LN2))
}

long_int.$log10 = function(x){
    if(x.value < 0){
        $B.RAISE(_b_.ValueError, 'math domain error')
    }
    // x = mant * 10 ** exp
    var x_string = x.value.toString(),
        exp = x_string.length - 1,
        mant = parseFloat(x_string[0] + '.' + x_string.substr(1))
    return _b_.float.$factory(exp + Math.log10(mant))
}

// descriptors
long_int.numerator = (self) => self
long_int.denominator = () => 1
long_int.imag = () => 0
long_int.real = (self) => self

// code for & | ^
var body =
`var $B = __BRYTHON__,
    _b_ = $B.builtins
if(typeof other == "number"){
    return _b_.int.$int_or_long(self.value & BigInt(other))
}else if(typeof other == "boolean"){
    return _b_.int.$int_or_long(self.value & (other ? 1n : 0n))
}else if($B.is_long_int(other)){
    return _b_.int.$int_or_long(self.value & other.value)
}else if($B.$isinstance(other, _b_.int)){
    // int subclass
    return $B.long_int.__and__(self, other.$brython_value)
}
return _b_.NotImplemented`

long_int.__and__ = Function('self', 'other', body)

long_int.__or__ = Function('self', 'other',
     body.replace(/&/g, '|').replace(/__and__/g, '__or__'))
long_int.__xor__ = Function('self', 'other',
     body.replace(/&/g, '^').replace(/__and__/g, '__xor__'))

long_int.to_bytes = function(self, len, byteorder, signed){
    // The integer is represented using len bytes. An OverflowError is raised
    // if the integer is not representable with the given number of bytes.
    var res = [],
        v = self.value
    if(! $B.$bool(signed) && v < 0){
        $B.RAISE(_b_.OverflowError, "can't convert negative int to unsigned")
    }
    while(v > 0){
        var quot = v / 256n,
            rest = v - quot * 256n
        v = quot
        res.push(Number(rest))
        if(res.length > len){
            $B.RAISE(_b_.OverflowError, "int too big to convert")
        }
    }
    while(res.length < len){
        res.push(0)
    }
    if(byteorder == 'big'){
        res.reverse()
    }
    return _b_.bytes.$factory(res)
}


function digits(base){
    // Return an object where keys are all the digits valid in specified base
    // and value is "true"
    // Used to test if the string passed as first argument to long_int is valid
    var is_digits = {}
    // Number from 0 to base, or from 0 to 9 if base > 10
    for(let i = 0; i < base; i++){
        if(i == 10){break}
        is_digits[i] = i
    }
    if(base > 10){
        // Additional letters
        // For instance in base 16, add "abcdefABCDEF" as keys
        for(let i = 0; i < base - 10; i++){
            is_digits[String.fromCharCode(65 + i)] = 10 + i
            is_digits[String.fromCharCode(97 + i)] = 10 + i
        }
    }
    return is_digits
}

long_int.$from_int = function(value){
    return {
        ob_type: long_int,
        value: value.toString(),
        pos: value > 0
    }
}

long_int.$factory = function(value, base){
    // Check if all characters in value are valid in the base
    var is_digits = digits(base)
    for(let i = 0; i < value.length; i++){
        if(is_digits[value.charAt(i)] === undefined){
            $B.RAISE(_b_.ValueError,
                'int argument is not a valid number: "' + value + '"')
        }
    }
    var res
    if(base == 10){
        res = BigInt(value)
    }else if(base == 16){
        res = BigInt('0x' + value)
    }else if(base == 8){
        res = BigInt('0o' + value)
    }else{
        base = BigInt(base)
        res = 0n
        let coef = 1n,
            char
        for(let i = value.length - 1; i >= 0; i--){
            char = value[i].toUpperCase()
            res += coef * BigInt(is_digits[char])
            coef *= base
        }
    }
    return res
    /*
    return {
        ob_type: $B.long_int,
        value: res
    }
    */
}

function extended_euclidean_algorithm(a, b){
    /*
    Returns a three-tuple (gcd, x, y) such that
    a * x + b * y == gcd, where gcd is the greatest
    common divisor of a and b.

    This function implements the extended Euclidean
    algorithm and runs in O(log b) in the worst case.
    */
    var s = 0,
        old_s = 1,
        t = 1,
        old_t = 0,
        r = b,
        old_r = a,
        quotient,
        tmp

    while($B.rich_comp('__ne__', r, 0)){
        quotient = $B.rich_op('__floordiv__', old_r, r)
        tmp = $B.rich_op('__sub__', old_r, $B.rich_op('__mul__', quotient, r))
        old_r = r
        r = tmp
        tmp = $B.rich_op('__sub__', old_s, $B.rich_op('__mul__', quotient, s))
        old_s = s
        s = tmp
        tmp = $B.rich_op('__sub__', old_t, $B.rich_op('__mul__', quotient, t))
        old_t = t
        t = tmp
   }
    return [old_r, old_s, old_t]
}

function inverse_of(n, p){
    /*
    Returns the multiplicative inverse of
    n modulo p.

    This function returns an integer m such that
    (n * m) % p == 1.
    */
    var gcd, x, y
    [gcd, x, y] = extended_euclidean_algorithm(n, p)

    if($B.rich_comp('__ne__', gcd, 1)){
        // Either n is 0, or p is not a prime number.
        throw Error(
            `${n} has no multiplicative inverse '
            'modulo ${p}`)
    }else{
        return $B.rich_op('__mod__', x, p)
    }
}

$B.inverse_of = inverse_of

/* long_int start */
$B.long_int.tp_richcompare = function(self, other, op){
    console.log('long int richcomp')
    if(! $B.$isinstance(other, _b_.int)){
        return _b_.NotImplemented
    }
    var self_bigint = toBigInt(self)
    var other_bigint = toBigInt(other)
    switch(op){
        case '__eq__':
            return self_bigint == other_bigint
        case '__ne__':
            return self_bigint != other_bigint
        case '__le__':
            return self_bigint <= other_bigint
        case '__lt__':
            return self_bigint < other_bigint
        case '__ge__':
            return self_bigint >= other_bigint
        case '__gt__':
            return self_bigint > other_bigint
        default:
            return _b_.NotImplemented
    }
}

$B.long_int.nb_add = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a + b)
}

$B.long_int.nb_subtract = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a - b)
}

$B.long_int.nb_multiply = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a * b)
}

$B.long_int.nb_remainder = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(((a % b) + b) % b)
}

$B.long_int.nb_divmod = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    var quotient
    if((a >= 0 && b > 0) || (a <= 0 && b < 0)){
        quotient = a / b
    }else{
        quotient = a / b - 1n
    }
    var rest = a - quotient * b
    return $B.fast_tuple([int_or_long(quotient), int_or_long(rest)])
}

$B.long_int.nb_power = function(self, power, z){
    if(z !== undefined){
        return _b_.int.nb_power(self, power, z)
    }
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a ** b)
}

$B.long_int.nb_lshift = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a << b)
}

$B.long_int.nb_rshift = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a >> b)
}

$B.long_int.nb_and = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a & b)
}

$B.long_int.nb_xor = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a ^ b)
}

$B.long_int.nb_or = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a | b)
}

$B.long_int.tp_repr = function(self){
    $B.builtins_repr_check($B.long_int, arguments) // in brython_builtins.js
    if($B.int_max_str_digits != 0 &&
            self.value >= 10n ** BigInt($B.int_max_str_digits)){
        $B.RAISE(_b_.ValueError, `Exceeds the limit ` +
            `(${$B.int_max_str_digits}) for integer string conversion`)
    }
    return self.value.toString()
}

$B.long_int.tp_hash = function(self){
    var modulus = 2305843009213693951n,
        sign = self.value >= 0 ? 1n : -1n,
        self_pos = self.value * sign
    var _hash = sign * (self_pos % modulus)
    return self.__hashvalue__ = int_or_long(_hash)
}

$B.long_int.tp_new = function(){
    var $ = $B.args('__new__', 3, {cls: null, value: null, base: null},
                ['cls', 'value', 'base'], arguments, {value: 0, base: 10},
                null, null)
    var cls = $.cls,
        value = $.value,
        base = $.base
    if(! $B.is_type(cls)){
        $B.RAISE(_b_.TypeError, "int.__new__(X): X is not a type object")
    }
    if(cls === _b_.bool) {
        $B.RAISE(_b_.TypeError, "int.__new__(bool) is not safe, use bool.__new__()")
    }
    // set method .toString so that BigInt(instance) returns a bingint
    return {
        ob_type: cls,
        dict: $B.empty_dict(),
        value: int.$factory(value, base)
    }
}

$B.long_int.nb_negative = function(self){
    return $B.fast_long_int(-self.value)
}

$B.long_int.nb_positive = function(self){
    return self
}

$B.long_int.nb_absolute = function(self){
    var value = self.value < 0 ? -self.value : self.value
    return $B.fast_long_int(value)
}

$B.long_int.nb_bool = function(self){
    return true
}

$B.long_int.nb_invert = function(self){
    return $B.fast_long_int(~self.value)
}

$B.long_int.nb_int = function(self){
    return self
}

$B.long_int.nb_float = function(self){
    return $B.fast_float(Number(self.value))
}

$B.long_int.nb_floor_divide = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(a / b)
}

$B.long_int.nb_true_divide = function(self, other){
    var a = toBigInt(self)
    var b = toBigInt(other)
    if(b === $B.NULL){
        return _b_.NotImplemented
    }
    return $B.fast_float(Number(a) / Number(b))
}

$B.long_int.nb_index = function(self){
    return self
}

var long_int_funcs = $B.long_int.tp_funcs = {}

long_int_funcs.__ceil__ = function(self){
    return self
}

long_int_funcs.__floor__ = function(self){
    return self
}

long_int_funcs.__format__ = function(self){

}

long_int_funcs.__getnewargs__ = function(self){

}

long_int_funcs.__round__ = function(self){
    return self
}

long_int_funcs.__sizeof__ = function(self){

}

long_int_funcs.__trunc__ = function(self){
    return self
}

long_int_funcs.as_integer_ratio = function(self){

}

long_int_funcs.bit_count = function(self){

}

long_int_funcs.bit_length = function(self){

}

long_int_funcs.conjugate = function(self){

}

long_int_funcs.denominator_get = function(self){
    return 1
}

long_int_funcs.denominator_set = _b_.None

long_int_funcs.from_bytes = function(self){

}

long_int_funcs.imag_get = function(self){
    return 0
}

long_int_funcs.imag_set = _b_.None

long_int_funcs.is_integer = function(self){
    return true
}

long_int_funcs.numerator_get = function(self){
    return self
}

long_int_funcs.numerator_set = _b_.None

long_int_funcs.real_get = function(self){
    return self
}

long_int_funcs.real_set = _b_.None

long_int_funcs.to_bytes = function(self){

}

$B.long_int.tp_methods = [
    "conjugate", "bit_length", "bit_count", "to_bytes", "as_integer_ratio",
    "__trunc__", "__floor__", "__ceil__", "__round__", "__getnewargs__",
    "__format__", "__sizeof__", "is_integer"]

$B.long_int.classmethods = ["from_bytes"]

$B.long_int.tp_getset = ["real", "imag", "numerator", "denominator"]

/* long_int end */

$B.set_func_names(long_int, "builtins")

$B.long_int = long_int

$B.fast_long_int = function(value){
    return value
    /*
    if(typeof value !== 'bigint'){
        console.log('expected bigint, got', value)
        throw Error('not a big int')
    }
    return {
        ob_type: $B.long_int,
        value: value
    }
    */
}
})(__BRYTHON__);
