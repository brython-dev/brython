;(function($B){
/*
Module to manipulate long integers
*/

var _b_ = $B.builtins

try{
    eval("window")
}catch(err){
    window = self
}

var long_int = {
    __class__: _b_.type,
    __mro__: [_b_.int, _b_.object],
    $infos: {
        __module__: "builtins",
        __name__: "int"
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

var max_safe_divider = $B.max_int / 9

var int_or_long = _b_.int.$int_or_long

var len = ((Math.pow(2, 53) - 1) + '').length - 1

function preformat(self, fmt){
    if(fmt.empty){return _b_.str.$factory(self)}
    if(fmt.type && 'bcdoxXn'.indexOf(fmt.type) == -1){
        throw _b_.ValueError.$factory("Unknown format code '" + fmt.type +
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
    var fmt = new $B.parse_format_spec(format_spec)
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

long_int.__abs__ = function(self){
    return $B.fast_long_int(self.value > 0 ? self.value : - self.value)
}

long_int.__add__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value + BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value + other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(self.value + (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return long_int.__add__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__divmod__ = function(self, other){
    var a = self.value,
        b = _b_.int.$to_bigint(other),
        quotient
    if((a >= 0 && b > 0) || (a <= 0 && b < 0)){
        quotient = a / b
    }else{
        quotient = a / b - 1n
    }
    var rest = a - quotient * b
    return $B.fast_tuple([int_or_long(quotient), int_or_long(rest)])
}

long_int.__eq__ = function(self, other){
    if(other.__class__ === $B.long_int){
        return self.value == other.value
    }else if(typeof other == "number" || typeof other == "boolean"){
        return false
    }else if(_b_.isinstance(other, _b_.int)){
        return long_int.__eq__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__float__ = function(self){
    if(! isFinite(Number(self.value))){
        throw _b_.OverflowError.$factory("int too large to convert to float")
    }
    return $B.fast_float(Number(self.value))
}

long_int.__floordiv__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value / BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value / other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(self.value / (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return int_or_long(self.value / other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__ge__ = function(self, other){
    if(typeof other == "number"){
        return self.value >= other
    }else if(other.__class__ === $B.long_int){
        return self.value >= other.value
    }else if(typeof other == "boolean"){
        return self.value >= (other ? 1 : 0)
    }else if(_b_.isinstance(other, _b_.int)){
        return self.value >= other.$brython_value
    }
    return _b_.NotImplemented
}

long_int.__gt__ = function(self, other){
    var res = long_int.__le__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

long_int.__hash__ = function(self){
    var modulus = 2305843009213693951n,
        sign = self.value >= 0 ? 1n : -1n
        self_pos = self.value * sign
    var _hash = sign * (self_pos % modulus)
    return self.__hashvalue__ = int_or_long(_hash)
}

long_int.__index__ = function(self){
    return self
}

long_int.__invert__ = function(self){
    return int_or_long(-1n - self.value)
}

long_int.__le__ = function(self, other){
    if(typeof other == "number"){
        return self.value <= other
    }else if(other.__class__ === $B.long_int){
        return self.value <= other.value
    }else if(typeof other == "boolean"){
        return self.value <= (other ? 1 : 0)
    }else if(_b_.isinstance(other, _b_.int)){
        return self.value <= other.$brython_value
    }
    return _b_.NotImplemented
}

long_int.__lt__ = function(self, other){
    var res = long_int.__ge__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

long_int.__lshift__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value << BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value << other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(self.value << (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return long_int.__lshift__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__mod__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value % BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value % other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(self.value % (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return long_int.__mod__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__mro__ = [_b_.int, _b_.object]

long_int.__mul__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value * BigInt(other))
    }else if(typeof other == "boolean"){
        return int_or_long(self.value * (other ? 1n : 0n))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value * other.value)
    }else if(_b_.isinstance(other, _b_.int)){
        // int subclass
        return long_int.__mul__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__ne__ = function(self, other){
    var res = long_int.__eq__(self, other)
    return res === _b_.NotImplemented ? res : !res
}

long_int.__neg__ = function(self){
    return $B.fast_long_int(-self.value)
}

long_int.__pos__ = function(self){return self}

long_int.__pow__ = function(self, power, z){
    if(typeof power == "number"){
        return int_or_long(self.value ** BigInt(power))
    }else if(typeof power == "boolean"){
        return int_or_long(self.value ** power ? 1n : 0n)
    }else if(power.__class__ === $B.long_int){
        return int_or_long(self.value ** power.value)
    }else if(_b_.isinstance(power, _b_.int)){
        // int subclass
        return long_int.__pow__(self, power.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__rshift__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value >> BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value >> other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(self.value >> (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return long_int.__rshift__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__str__ = long_int.__repr__ = function(self){
    return self.value.toString()
}

long_int.__sub__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value - BigInt(other))
    }else if(typeof other == "boolean"){
        return int_or_long(self.value - (other ? 1n : 0n))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value - other.value)
    }else if(_b_.isinstance(other, _b_.int)){
        // int subclass
        return long_int.__sub__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

long_int.__truediv__ = function(self, other){
    if(typeof other == "number"){
        return $B.fast_float(Number(self.value) / other)
    }else if(typeof other == "boolean"){
        return $B.fast_float(Number(self.value) * (other ? 1 : 0))
    }else if(other.__class__ === $B.long_int){
        return $B.fast_float(Number(self.value) / Number(other.value))
    }else if(_b_.isinstance(other, _b_.int)){
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
        relative_rest = new Number(rest) / new Number(pow2)
    return {nbits, pow2, rest, relative_rest}
}

long_int.$log2 = function(x){
    if(x.value < 0){
        throw _b_.ValueError.$factory('math domain error')
    }
    // x = 2 ** (infos.nbits - 1) * ( 1 + infos.relative_rest)
    var infos = _infos(x)
    return _b_.float.$factory(infos.nbits - 1 +
        Math.log(1 + infos.relative_rest / Math.LN2))
}

long_int.$log10 = function(x){
    if(x.value < 0){
        throw _b_.ValueError.$factory('math domain error')
    }
    // x = mant * 10 ** exp
    var x_string = x.value.toString(),
        exp = x_string.length - 1,
        mant = eval(x_string[0] + '.' + x_string.substr(1))
    return _b_.float.$factory(exp + Math.log10(mant))
}

// descriptors
long_int.numerator = function(self){return self}
long_int.denominator = function(self){return _b_.int.$factory(1)}
long_int.imag = function(self){return _b_.int.$factory(0)}
long_int.real = function(self){return self}

// code for & | ^
long_int.__and__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(self.value & BigInt(other))
    }else if(typeof other == "boolean"){
        return int_or_long(self.value & (other ? 1n : 0n))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(self.value & other.value)
    }else if(_b_.isinstance(other, _b_.int)){
        // int subclass
        return long_int.__and__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}


var model = long_int.__and__ + ''

eval("long_int.__or__ = " +
     model.replace(/&/g, '|').replace(/__and__/g, '__or__'))
eval("long_int.__xor__ = " +
     model.replace(/&/g, '^').replace(/__and__/g, '__xor__'))

long_int.to_bytes = function(self, len, byteorder, signed){
    // The integer is represented using len bytes. An OverflowError is raised
    // if the integer is not representable with the given number of bytes.
    var res = [],
        v = self.value
    if(! $B.$bool(signed) && v < 0){
        throw _b_.OverflowError.$factory("can't convert negative int to unsigned")
    }
    while(v > 0){
        var quot = v / 256n,
            rest = v - quot * 256n
        v = quot
        res.push(Number(rest))
        if(res.length > len){
            throw _b_.OverflowError.$factory("int too big to convert")
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
    for(var i = 0; i < base; i++){
        if(i == 10){break}
        is_digits[i] = true
    }
    if(base > 10){
        // Additional letters
        // For instance in base 16, add "abcdefABCDEF" as keys
        for(var i = 0; i < base - 10; i++){
            is_digits[String.fromCharCode(65 + i)] = true
            is_digits[String.fromCharCode(97 + i)] = true
        }
    }
    return is_digits
}

var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1
var MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER

function isSafeInteger(n) {
    return (typeof n === "number" &&
        Math.round(n) === n &&
        MIN_SAFE_INTEGER <= n &&
        n <= MAX_SAFE_INTEGER)
}

function intOrLong(long){
    // If the result of an operation on long_int instances is a safe
    // integer, convert it to a Javascript number
    var v = parseInt(long.value) * (long.pos ? 1 : -1)
    if(v > MIN_SAFE_INTEGER && v < MAX_SAFE_INTEGER){return v}
    return long
}

long_int.$from_int = function(value){
    return {__class__: long_int, value: value.toString(), pos: value > 0}
}

long_int.$factory = function(value, base){
    // Check if all characters in value are valid in the base
    var is_digits = digits(base)
    for(var i = 0; i < value.length; i++){
        if(! is_digits[value.charAt(i)]){
            throw _b_.ValueError.$factory(
                'int argument is not a valid number: "' + value + '"')
        }
    }
    var res
    if(base == 10){
        res = BigInt(value)
    }else{
        base = BigInt(base)
        var res = 0n,
            coef = 1n,
            char
        for(var i = value.length - 1; i >= 0; i--){
            char = value[i].toUpperCase()
            res += coef * BigInt(_digits.indexOf(char))
            coef *= base
        }
    }
    return {__class__: $B.long_int, value: res}
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

$B.set_func_names(long_int, "builtins")

$B.long_int = long_int

$B.fast_long_int = function(value){
    if(typeof value !== 'bigint'){
        console.log('expected bigint, got', value)
        throw Error('not a big int')
    }
    return {
        __class__: $B.long_int,
        value: value
    }
}
})(__BRYTHON__)
