"use strict";
(function($B){

var _b_ = $B.builtins

var int = _b_.int
var NULL = $B.NULL

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        " : 'int' and '" + $B.class_name(other) + "'"
    $B.RAISE(_b_.TypeError, msg)
}

function toBigInt(x){
    if(typeof x == 'number'){
        return BigInt(x)
    }else if(typeof x == 'bigint'){
        return x
    }else if(typeof x == 'boolean'){
        return x ? 1n : 0n
    }else if($B.$isinstance(x, _b_.int)){
        return toBigInt(x.value)
    }else{
        return $B.NULL
    }
}

var int_value = $B.int_value = function(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute value set
    var res = obj.value ?? obj
    if(typeof res == "boolean"){
        return res ? 1 : 0
    }
    return res
}

var bigint_value = $B.to_bigint = function(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute value set
    var res = obj = obj.value ?? obj
    switch(typeof res){
        case "boolean":
            return res ? 1n : 0n
        case "number":
            return BigInt(res)
        case "bigint":
            return res
        default:
            $B.RAISE(_b_.TypeError,
                `cannot convert ${$B.class_name(obj)} to BigInt`)
    }
}

var int_or_long = int.$int_or_long = function(bigint){
    var res = Number(bigint)
    return Number.isSafeInteger(res) ? res : bigint
}

int.$to_js_number = function(obj){
    // convert booleans, long ints, subclasses of int to a Javascript number
    if(typeof obj == "number"){
        return obj
    }else if($B.is_long_int(obj)){
        return Number(obj.value)
    }else if($B.$isinstance(obj, _b_.int)){
        return int.$to_js_value(obj.value)
    }
    return null
}

int.$to_bigint = bigint_value

function preformat(self, fmt){
    if(fmt.empty){
        return _b_.str.$factory(self)
    }
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
            res = (fmt.alternate ? "0b" : "") + self.toString(2)
            break
        case "c":
            res = _b_.chr(self)
            break
        case "o":
            res = (fmt.alternate ? "0o" : "") + self.toString(8)
            break
        case "x":
            res = (fmt.alternate ? "0x" : "") + self.toString(16)
            break
        case "X":
            res = (fmt.alternate ? "0X" : "") + self.toString(16).toUpperCase()
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



function extended_euclidean(a, b){
    // arguments are big ints
    var d, u, v
    if(b == 0){
      return [a, 1n, 0n]
    }else{
      [d, u, v] = extended_euclidean(b, a % b)
      return [d, v, u - (a / b) * v]
    }
}

var $valid_digits = function(base) {
    var digits = ""
    if(base === 0){return "0"}
    if(base < 10){
       for(let i = 0; i < base; i++){
           digits += String.fromCharCode(i + 48)
       }
       return digits
    }

    digits = "0123456789"
    // A = 65 (10 + 55)
    for(let i = 10; i < base; i++){
        digits += String.fromCharCode(i + 55)
    }
    return digits
}

function int_hash(x){
    var modulus = 2305843009213693951n,
        sign = x >= 0 ? 1n : -1n,
        self_pos = x * sign
    var _hash = sign * (self_pos % modulus)
    return int_or_long(_hash)
}

int.$factory = function(value, base){
    /*
    var missing = {},
        $ = $B.args("int", 2, {x: null, base: null}, ["x", "base"],
            arguments, {x: missing, base: _b_.None}, null, null, 1),
            value = $.x,
            base = $.base === undefined ? missing : $.base,
            initial_value = value,
            explicit_base = base !== _b_.None
    */
    // int() with no argument returns 0
    /*
    if(value === missing || value === undefined){
        if(base !== missing){
            $B.RAISE(_b_.TypeError, "int() missing string argument")
        }
        return 0
    }
    */
    var initial_value = value

    if($B.$isinstance(value, [_b_.bytes, _b_.bytearray])){
        // transform to string
        value = $B.$getattr(value, 'decode')('latin-1')
    }else if($B.$isinstance(value, _b_.memoryview)){
        value = $B.$getattr(_b_.memoryview.tobytes(value), 'decode')('latin-1')
    }

    if(! $B.$isinstance(value, _b_.str)){
        if(base !== _b_.None){
            console.log('value', value)
            console.log(Error('trace').stack)
            $B.RAISE(_b_.TypeError,
                "int() can't convert non-string with explicit base")
        }else{
            // booleans, bigints, objects with method __index__
            for(let special_method of ['__int__', '__index__', '__trunc__']){
                let num_value = $B.$getattr($B.get_class(value),
                                            special_method, _b_.None)
                if(num_value !== _b_.None){
                    let res = $B.$call(num_value, value)
                    if(special_method == '__trunc__'){
                        $B.warn(_b_.DeprecationWarning,
                        'The delegation of int() to __trunc__ is deprecated.')
                        let index_method = $B.$getattr($B.get_class(res), '__index__', null)
                        if(index_method === null){
                            $B.RAISE(_b_.TypeError, '__trunc__ returned' +
                                ` non-Integral (type ${$B.class_name(res)})`)
                        }
                        res = $B.$call(index_method, res)
                    }
                    if($B.$isinstance(res, _b_.int)){
                        if(typeof res !== "number" && typeof res != 'bigint'){
                            $B.warn(_b_.DeprecationWarning, special_method +
                            ' returned non-int (type ' + $B.class_name(res) +
                            ').  The ability to return an instance of a ' +
                            'strict subclass of int is deprecated, and may ' +
                            'be removed in a future version of Python.')
                        }
                        return int_value(res)
                    }else{
                        let klass = $B.get_class(res),
                            index_method = $B.$getattr(klass, '__index__', null)
                        if(index_method === null){
                            $B.RAISE(_b_.TypeError, special_method +
                                `returned non-int (type ${$B.class_name(res)})`)
                        }
                        return int_value(res)
                    }
                }
            }
            $B.RAISE(_b_.TypeError,
                "int() argument must be a string, a bytes-like object " +
                `or a real number, not '${$B.class_name(value)}'`)
        }
    }

    if(value.length == 0){
        $B.RAISE(_b_.ValueError,
            `invalid literal for int() with base 10: ${_b_.repr(value)}`)
    }
    base = base === _b_.None ? 10: $B.PyNumber_Index(base)

    if(! (base >=2 && base <= 36)){
        // throw error (base must be 0, or 2-36)
        if(base != 0){
            $B.RAISE(_b_.ValueError, "invalid base")
        }
    }

    function invalid(base){
        $B.RAISE(_b_.ValueError, "invalid literal for int() with base " +
            base + ": " + _b_.repr(initial_value))
    }

    if(typeof value != "string"){ // string subclass
        value = _b_.str.$to_string(value)
    }

    var _value = value.trim(),    // remove leading/trailing whitespace
        sign = ''

    if(_value.startsWith('+') || _value.startsWith('-')){
        sign = _value[0]
        _value = _value.substr(1)
        if(_value.length == 0 || '+-'.includes(_value[0])){
            $B.RAISE(_b_.ValueError,
                ` invalid literal for int() with base 10: '${value}'`
            )
        }
    }

    if(_value.length == 2 && base == 0 &&
            (_value == "0b" || _value == "0o" || _value == "0x")){
       $B.RAISE(_b_.ValueError, "invalid value")
    }

    if(_value.endsWith('_')){
        invalid(base)
    }
    if(value.indexOf('__') > -1){ // consecutive underscores
        invalid(base)
    }


    if(_value.length > 2){
        let _pre = _value.substr(0, 2).toUpperCase()
        if(base == 0){
            if(_pre == "0B"){
                base = 2
            }else if(_pre == "0O"){
                base = 8
           }else if(_pre == "0X"){
                base = 16
            }else if(_value.startsWith('0')){
                _value = _value.replace(/_/g, '')
                if(_value.match(/^0+$/)){
                    return 0
                }
                invalid(base)
            }
        }else if(_pre == "0X" && base != 16){
            invalid(base)
        }else if(_pre == "0O" && base != 8){
            invalid(base)
        }
        if((_pre == "0B" && base == 2) || _pre == "0O" || _pre == "0X"){
            _value = _value.substr(2)
            if(_value.startsWith('_')){ // case "0b_0"
                _value = _value.substr(1)
            }
        }
    }

    if(base == 0){
        // _value doesn't start with 0b, 0o, 0x
        base = 10
    }
    var _digits = $valid_digits(base),
        _re = new RegExp("^[+-]?[" + _digits + "]" +
        "[" + _digits + "_]*$", "i"),
        match = _re.exec(_value),
        res
    if(match === null){
        // try with number in non-latin alphabets
        res = 0
        var digit
        for(var char of _value){
            if(/\p{Nd}/u.test(char)){
                // get value from table $B.digit_starts in unicode_data.js
                let cp = char.codePointAt(0)
                for(let start of $B.digits_starts){
                    if(cp - start < 10){
                        digit = cp - start
                        break
                    }
                }
            }else{
                if(base > 10 && _digits.indexOf(char.toUpperCase()) > -1){
                    digit = char.toUpperCase().charCodeAt(0) - 55
                }else{
                    invalid(base)
                }
            }
            if(digit < base){
                res = $B.rich_op('__mul__', res, base)
                res = $B.rich_op('__add__', res, digit)
            }else{
                invalid(base)
            }
        }
        return res
    }else{
        _value = _value.replace(/_/g, "")
    }

    if(base == 2){
        res = BigInt('0b' + _value)
    }else if(base == 8){
        res = BigInt('0o' + _value)
    }else if(base == 16){
        res = BigInt('0x' + _value)
    }else{
        if($B.int_max_str_digits != 0 &&
                _value.length > $B.int_max_str_digits){
            $B.RAISE(_b_.ValueError, "Exceeds the limit " +
                `(${$B.int_max_str_digits}) for integer string conversion: ` +
                `value has ${value.length} digits; use ` +
                "sys.set_int_max_str_digits() to increase the limit.")
        }
        if(base == 10){
            res = BigInt(_value)
        }else {
            base = BigInt(base)
            res = 0n
            let coef = 1n,
                char
            for(let i = _value.length - 1; i >= 0; i--){
                char = _value[i].toUpperCase()
                res += coef * BigInt(_digits.indexOf(char))
                coef *= base
            }
        }
    }
    if(sign == '-'){
        res = -res
    }
    return int_or_long(res)
}

$B.set_func_names(int, "builtins")

/* int start */
_b_.int.tp_richcompare = function(a, b, op){
    /* if a < b, return a negative number
       if a == b, return 0
       if a > b, return a positive number */
    if(! $B.$isinstance(b, _b_.int)){
        return _b_.NotImplemented
    }
    var res
    a = int_value(a)
    b = int_value(b)

    switch(op){
        case '__eq__':
            res = a == b
            break
        case '__ne__':
            res = a != b
            break
        case '__lt__':
            res = a < b
            break
        case '__le__':
            res = a <= b
            break
        case '__ge__':
            res = a >= b
            break
        case '__gt__':
            res = a > b
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

_b_.int.nb_add = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x + y)
}

_b_.int.nb_subtract = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x - y)
}

_b_.int.nb_multiply = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x * y)
}

_b_.int.nb_remainder = function(self, other){
    // can't use Javascript % because it works differently for negative numbers
    if($B.$isinstance(other,_b_.tuple) && other.length == 1){
        other = other[0]
    }
    var y = toBigInt(other)
    if(y === $B.NULL){
        return _b_.NotImplemented
    }
    if(y == 0n){
        $B.RAISE(_b_.ZeroDivisionError,
            "integer division or modulo by zero")
    }
    var x = toBigInt(self)
    return int_or_long((x % y + y) % y)
}

_b_.int.nb_divmod = function(self, other){
    if(toBigInt(other) === $B.NULL){
        return _b_.NotImplemented
    }
    return $B.fast_tuple([int.nb_floor_divide(self, other),
        int.nb_remainder(self, other)])
}

_b_.int.nb_power = function(self, other, z){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    if(typeof other == "number"  || $B.$isinstance(other, int)){
        if(z !== undefined && z !== _b_.None){
            // If z is provided, the algorithm is faster than computing
            // self ** other then applying the modulo z
            z = toBigInt(z)
            if(z == 1n){
                return 0
            }
            var result = 1n,
                exponent = y,
                base = x % z
            if(base < 0n){
                base += z
            }
            if(exponent < 0n){
                var gcd, inv, _
                [gcd, inv, _] = extended_euclidean(x, z)
                if(gcd != 1n){
                    $B.RAISE(_b_.ValueError, "not relative primes: " +
                        self + ' and ' + z)
                }
                return int.nb_power(int_or_long(inv),
                                   int_or_long(-exponent),
                                   int_or_long(z))
            }
            while(exponent > 0n){
                if(exponent % 2n == 1n){
                    result = (result * base) % z
                }
                exponent = exponent >> 1n
                base = (base * base) % z
            }
            return int_or_long(result)
        }else{
            if(y < 0n){
                // raising a BigInt to a negative values raises a JS error
                return $B.fast_float(Number(x) ** Number(y))
            }
            return int_or_long(x ** y)
        }
    }
}

_b_.int.nb_lshift = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x << y)
}

_b_.int.nb_rshift = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x >> y)
}

_b_.int.nb_and = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x & y)
}

_b_.int.nb_xor = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x ^ y)
}

_b_.int.nb_or = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    return int_or_long(x | y)
}

_b_.int.tp_repr = function(self){
    $B.builtins_repr_check(int, arguments) // in brython_builtins.js
    var value = int_value(self),
        x = $B.is_long_int(value) ? value.value : value
    if($B.int_max_str_digits != 0 &&
            x >= 10n ** BigInt($B.int_max_str_digits)){
        $B.RAISE(_b_.ValueError, `Exceeds the limit ` +
            `(${$B.int_max_str_digits}) for integer string conversion`)
    }
    return x.toString()
}

_b_.int.tp_hash = function(self){
    // int subclass
    if(self.__hashvalue__ !== undefined){
        return self.__hashvalue__
    }
    return int_or_long(int_hash(toBigInt(self)))
}

_b_.int.nb_negative = function(self){
    return - int_value(self)
}

_b_.int.nb_positive = function(self){
    return int_value(self)
}

_b_.int.nb_absolute = function(self){
    var res = int_value(self)
    return res >= 0 ? res : -res
}

_b_.int.nb_bool = function(self){
    return int_value(self) == 0 ? false : true
}

_b_.int.nb_invert = function(self){
    var x = toBigInt(self)
    return int_or_long(~x)
}

_b_.int.nb_int = function(self){
    return int_value(self)
}

_b_.int.nb_float = function(self){
    return $B.fast_float(Number(int_value(self)))
}

_b_.int.nb_floor_divide = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    if(y === 0n){
        $B.RAISE(_b_.ZeroDivisionError, 'division by zero')
    }
    var quot = x / y // bigint
    var rest = x - y * quot
    if(rest == 0){
        return int_or_long(quot)
    }
    var same_sign = (x >= 0 && y > 0) || (x <= 0 & y < 0)
    if(same_sign){
        return int_or_long(quot)
    }else{
        if(typeof quot == 'bigint'){
            return int_or_long(quot - 1n)
        }else{
            return int_or_long(quot - 1)
        }
    }
}

_b_.int.nb_true_divide = function(self, other){
    var [x, y] = [self, other].map(toBigInt)
    if(x === $B.NULL || y === $B.NULL){
        return _b_.NotImplemented
    }
    if(y === 0n){
        $B.RAISE(_b_.ZeroDivisionError, 'division by zero')
    }
    return $B.fast_float(Number(x) / Number(y))
}

_b_.int.nb_index = function(self){
    return int_value(self)
}

_b_.int.tp_new = function(){
    var $ = $B.args('int', 3, {cls: null, value: null, base: null},
                ['cls', 'value', 'base'], arguments, {value: 0, base: _b_.None},
                null, null)
    var cls = $.cls,
        value = $.value,
        base = $.base
    if(! $B.$isinstance(cls, _b_.type)){
        $B.RAISE(_b_.TypeError, "int.__new__(X): X is not a type object")
    }
    if(cls === bool) {
        $B.RAISE(_b_.TypeError, "int.__new__(bool) is not safe, use bool.__new__()")
    }
    if(cls === int){
        return int.$factory(value, base)
    }
    return {
        ob_type: cls,
        dict: $B.empty_dict(),
        value
    }
}

var int_funcs = _b_.int.tp_funcs = {}

int_funcs.__ceil__ = function(self){
    return int_value(self)
}

int_funcs.__floor__ = function(self){
    return int_value(self)
}

int_funcs.__format__ = function(self, format_spec){
    var fmt = new $B.parse_format_spec(format_spec, self)
    if(fmt.type && 'eEfFgG%'.indexOf(fmt.type) != -1){
        // Call __format__ on float(self)
        return _b_.float.__format__($B.fast_float(self), format_spec)
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

int_funcs.__getnewargs__ = function(self){
    var self = $B.single_arg('__getnewargs__', 'self', arguments)
    return $B.fast_tuple([int_value(self)])
}

int_funcs.__round__ = function(self){
    return int_value(self) // XXX
}

int_funcs.__sizeof__ = function(self){

}

int_funcs.__trunc__ = function(self){
    return int_value(self)
}

int_funcs.as_integer_ratio = function(self){
    var self = $B.single_arg('as_integer_ratio', 'self', arguments)
    return $B.fast_tuple([self, 1])
}

int_funcs.bit_count = function(self){
    var s = _b_.bin(_b_.abs(self)),
        nb = 0
    for(var x of s){
        if(x == '1'){
            nb++
        }
    }
    return nb
}

int_funcs.bit_length = function(self){
    var s = _b_.bin(self)
    s = $B.$getattr(s, "lstrip")("-0b") // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

int_funcs.conjugate = function(self){

}

int_funcs.denominator_get = function(self){
    return 1
}

int_funcs.denominator_set = _b_.None

int_funcs.from_bytes = function(self){
    var $ = $B.args("from_bytes", 4,
                {cls: null, bytes:null, byteorder:null, signed:null},
                ["cls", "bytes", "byteorder", "signed"], arguments,
                {byteorder: 'big', signed: false}, null, null)

    var x = $.bytes,
        byteorder = $.byteorder,
        signed = $.signed,
        _bytes,
        _len
    if($B.$isinstance(x, [_b_.bytes, _b_.bytearray])){
        _bytes = x.source
        _len = x.source.length
    }else{
        _bytes = _b_.list.$factory(x)
        _len = _bytes.length
        for(let i = 0; i < _len; i++){
            _b_.bytes.$factory([_bytes[i]])
        }
    }
    if(byteorder == "big"){
        _bytes.reverse()
    }else if(byteorder != "little"){
        $B.RAISE(_b_.ValueError,
            "byteorder must be either 'little' or 'big'")
    }
    var num = _bytes[0]
    if(signed && num >= 128){
        num = num - 256
    }
    num = BigInt(num)
    var _mult = 256n
    for(let i = 1;  i < _len; i++){
        num += _mult * BigInt(_bytes[i])
        _mult *= 256n
    }
    if(! signed){
        return int_or_long(num)
    }
    if(_bytes[_len - 1] < 128){
        return int_or_long(num)
    }
    return int_or_long(num - _mult)
}

int_funcs.imag_get = function(self){
    return 0
}

int_funcs.imag_set = _b_.None

int_funcs.is_integer = function(self){
    return true
}

int_funcs.numerator_get = function(self){
    return int_value(self)
}

int_funcs.numerator_set = _b_.None

int_funcs.real_get = function(self){
    return int_value(self)
}

int_funcs.real_set = _b_.None

int_funcs.to_bytes = function(self){
    var $ = $B.args("to_bytes", 3,
        {self: null, len: null, byteorder: null, signed: null},
        ["self", "len", "byteorder", "signed"],
        arguments, {len: 1, byteorder: 'big', signed: false}, null, null),
        self = $.self,
        len = $.len,
        byteorder = $.byteorder,
        signed = $.signed
    if(! $B.$isinstance(len, _b_.int)){
        $B.RAISE(_b_.TypeError, "integer argument expected, got " +
            $B.class_name(len))
    }
    if(["little", "big"].indexOf(byteorder) == -1){
        $B.RAISE(_b_.ValueError,
            "byteorder must be either 'little' or 'big'")
    }
    var x = toBigInt(self)
    if(x < 0n){
        if(! signed){
            $B.RAISE(_b_.OverflowError,
                "can't convert negative int to unsigned")
        }
        x = BigInt(Math.pow(256, len)) + x
    }

    var res = [],
        value = x

    while(value > 0n){
        var quotient = value / 256n,
            rest = value - 256n * quotient
        res.push(int_or_long(rest))
        if(res.length > len){
            $B.RAISE(_b_.OverflowError, "int too big to convert")
        }
        value = quotient
    }
    while(res.length < len){
        res.push(0n)
    }
    if(byteorder == "big"){
        res.reverse()
    }
    return {
        ob_type: _b_.bytes,
        source: res
    }
}

_b_.int.functions_or_methods = ["__new__"]

_b_.int.tp_methods = [
    "conjugate", "bit_length", "bit_count", "to_bytes", "as_integer_ratio",
    "__trunc__", "__floor__", "__ceil__", "__round__", "__getnewargs__",
    "__format__", "__sizeof__", "is_integer"]

_b_.int.classmethods = ["from_bytes"]

_b_.int.tp_getset = ["real", "imag", "numerator", "denominator"]

/* int end */

// Boolean type
$B.$bool = function(obj, bool_class){ // return true or false
    // bool_class is set if called by built-in bool()
    // In this case, if __bool__ is called, it is on obj.__class__
    if(obj === null || obj === undefined ){
        return false
    }
    switch(typeof obj){
        case "boolean":
            return obj
        case "number":
        case "string":
            if(obj){return true}
            return false
        default:
            if($B.is_type(obj)){
                return true
            }
            var klass = $B.get_class(obj),
                missing = {},
                bool_method = $B.search_in_mro(klass, '__bool__', $B.NULL)
            if(bool_method === $B.NULL){
                var len_method = $B.search_in_mro(klass, '__len__', $B.NULL)
                if(len_method === $B.NULL){
                    return true
                }
                // Call _b_.len here instead of len_method directly to use
                // len's handling of non-integer and negative values
                return _b_.len(obj) > 0
            }else{
                var res = $B.$call($B.search_in_mro(klass, '__bool__'), obj)
                if(res !== true && res !== false){
                    $B.RAISE(_b_.TypeError, "__bool__ should return " +
                        "bool, returned " + $B.class_name(res))
                }
                return res
            }
    }
}

var bool = _b_.bool

bool.$factory = function(){
    // Calls $B.$bool, which is used inside the generated JS code and skips
    // arguments control.
    var $ = $B.args("bool", 1, {x: null}, ["x"],
        arguments, {x: false}, null, null, 1)
    return $B.$bool($.x, true)
}

/* bool start */
_b_.bool.nb_and = function(self, other){
    if($B.$isinstance(other, bool)){
        return self && other
    }else if($B.$isinstance(other, int)){
        return int.nb_and(int_value(self), other)
    }
    return _b_.NotImplemented
}

_b_.bool.nb_xor = function(self, other) {
    if($B.$isinstance(other, bool)){
        return self ^ other ? true : false
    }else if($B.$isinstance(other, int)){
        return int.nb_xor(int_value(self), other)
    }
    return _b_.NotImplemented
}

_b_.bool.nb_or = function(self, other){
    if($B.$isinstance(other, bool)){
        return self || other
    }else if($B.$isinstance(other, int)){
        return int.nb_or(int_value(self), other)
    }
    return _b_.NotImplemented
}

_b_.bool.tp_repr = function(self){
    $B.builtins_repr_check(bool, arguments) // in brython_builtins.js
    return self ? "True" : "False"
}

_b_.bool.tp_new = function(cls, value){
    var $ = $B.args('__new__', 2, {cls: null, value: null}, ['cls', 'value'],
                arguments, {}, null, null)
    var cls = $.cls,
        value = $.value
    if(!$B.$isinstance(cls, _b_.type)) {
        $B.RAISE(_b_.TypeError, `bool.__new__(X): X is not a type object (${$B.class_name(cls) })`)
    }else if(!_b_.issubclass(cls, bool)) {
        let class_name = $B.class_name(cls)
        $B.RAISE(_b_.TypeError, `bool.__new__(${class_name}): ${class_name} is not a subtype of bool`)
    }
    return bool.$factory(value)
}

_b_.bool.nb_invert = function(self){
    $B.warn(_b_.DeprecationWarning, `Bitwise inversion '~' on bool is deprecated.This returns the bitwise inversion of the underlying int object and is usually not what you expect from negating a bool.Use the 'not' operator for boolean negation or ~int(x) if you really want the bitwise inversion of the underlying int.`)
    return int_funcs.__invert__(self)
}

var bool_funcs = _b_.bool.tp_funcs = {}

_b_.bool.functions_or_methods = ["__new__"]


/* bool end */

$B.set_func_names(bool, "builtins")

})(__BRYTHON__);
