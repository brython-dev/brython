"use strict";
(function($B){

var _b_ = $B.builtins

var int = _b_.int
var NULL = $B.NULL

/* int slots start */
Object.assign(int,
{
    tp_basicsize: 24,
    tp_itersize: 4,
    tp_flags: 20976898,
    tp_weakrefoffset: 0,
    tp_base: _b_.object,
    tp_dictoffset: 0,
    tp_doc: `int([x]) -> integer
int(x, base=10) -> integer

Convert a number or string to an integer, or return 0 if no arguments
are given.  If x is a number, return x.__int__().  For floating-point
numbers, this truncates towards zero.

If x is not a number or if base is given, then x must be a string,
bytes, or bytearray instance representing an integer literal in the
given base.  The literal can be preceded by '+' or '-' and be surrounded
by whitespace.  The base defaults to 10.  Valid bases are 0 and 2-36.
Base 0 means to interpret the base from the string as an integer literal.
>>> int('0b100', base=0)
4`,
    tp_bases: [_b_.object],
})
/* int slots end */

function long_long_getter(self){
    return int_value(self)
}

function long_get0(){
    return 0
}

function long_get1(){
    return 1
}

/* int.tp_getset start */
int.tp_getset = [
    ["real", long_long_getter, NULL],
    ["imag", long_get0, NULL],
    ["numerator", long_long_getter, NULL],
    ["denominator", long_get1, NULL]
]
/* int.tp_getset end */

function long_long_meth(self){
    return int_value(self)
}

function int_bit_length(self){
    var s = _b_.bin(self)
    s = $B.$getattr(s, "lstrip")("-0b") // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

function int_bit_count(self){
    var s = _b_.bin(_b_.abs(self)),
        nb = 0
    for(var x of s){
        if(x == '1'){
            nb++
        }
    }
    return nb
}

function int_to_bytes(){
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

    if($B.$isinstance(self, $B.long_int)){
        return $B.long_int.to_bytes(self, len, byteorder, signed)
    }

    if(self < 0){
        if(! signed){
            $B.RAISE(_b_.OverflowError,
                "can't convert negative int to unsigned")
        }
        self = Math.pow(256, len) + self
    }

    var res = [],
        value = self

    while(value > 0){
        var quotient = Math.floor(value / 256),
            rest = value - 256 * quotient
        res.push(rest)
        if(res.length > len){
            $B.RAISE(_b_.OverflowError, "int too big to convert")
        }
        value = quotient
    }
    while(res.length < len){
        res.push(0)
    }
    if(byteorder == "big"){
        res.reverse()
    }
    return {
        __class__: _b_.bytes,
        source: res
    }
}

function int_from_bytes(){
    var $ = $B.args("from_bytes", 3,
        {bytes:null, byteorder:null, signed:null},
        ["bytes", "byteorder", "signed"],
        arguments, {byteorder: 'big', signed: false}, null, null)

    var x = $.bytes,
        byteorder = $.byteorder,
        signed = $.signed,
        _bytes, _len
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

function int_as_integer_ratio(){
    var $ = $B.args("as_integer_ratio", 1, {self:null}, ["self"],
          arguments, {}, null, null)
    return $B.fast_tuple([$.self, 1])
}

function int___round__(){

}

function int___getnewargs__(){

}

function int___format__(){

}

function int___sizeof__(){

}

function int_is_integer(){
    return true
}

/* int.tp_methods start */
int.tp_methods = [
    ["conjugate", long_long_meth, $B.METH_NOARGS],
    ["bit_length", int_bit_length, $B.METH_NOARGS],
    ["bit_count", int_bit_count, $B.METH_NOARGS],
    ["to_bytes", int_to_bytes, $B.METH_FASTCALL|$B.METH_KEYWORDS],
    ["from_bytes", int_from_bytes, $B.METH_FASTCALL|$B.METH_KEYWORDS|$B.METH_CLASS],
    ["as_integer_ratio", int_as_integer_ratio, $B.METH_NOARGS],
    ["__trunc__", long_long_meth, $B.METH_NOARGS],
    ["__floor__", long_long_meth, $B.METH_NOARGS],
    ["__ceil__", long_long_meth, $B.METH_NOARGS],
    ["__round__", int___round__, $B.METH_FASTCALL],
    ["__getnewargs__", int___getnewargs__, $B.METH_NOARGS],
    ["__format__", int___format__, $B.METH_O],
    ["__sizeof__", int___sizeof__, $B.METH_NOARGS],
    ["is_integer", int_is_integer, $B.METH_NOARGS]
]
/* int.tp_methods end */

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        " : 'int' and '" + $B.class_name(other) + "'"
    $B.RAISE(_b_.TypeError, msg)
}


function int_value(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute $brython_value set
    if(typeof obj == "boolean"){
        return obj ? 1 : 0
    }
    return obj.$brython_value !== undefined ? obj.$brython_value : obj
}

function bigint_value(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute $brython_value set
    if(typeof obj == "boolean"){
        return obj ? 1n : 0n
    }else if(typeof obj == "number"){
        return BigInt(obj)
    }else if(obj.__class__ === $B.long_int){
        return obj.value
    }else if($B.$isinstance(obj, _b_.int)){
        return bigint_value(obj.$brython_value)
    }
}


var int_or_long = int.$int_or_long = function(bigint){
    var res = Number(bigint)
    return Number.isSafeInteger(res) ? res : $B.fast_long_int(bigint)
}

int.$to_js_number = function(obj){
    // convert booleans, long ints, subclasses of int to a Javascript number
    if(typeof obj == "number"){
        return obj
    }else if(obj.__class__ === $B.long_int){
        return Number(obj.value)
    }else if($B.$isinstance(obj, _b_.int)){
        return int.$to_js_value(obj.$brython_value)
    }
    return null
}

int.$to_bigint = bigint_value
int.$int_value = int_value






int.__abs__ = function(self){
    return Math.abs(int_value(self))
}

var op_model =
`var _b_ = __BRYTHON__.builtins
if(typeof other == "number"){
    return _b_.int.$int_or_long(BigInt(self) + BigInt(other))
}else if(other.__class__ === $B.long_int){
    return _b_.int.$int_or_long(BigInt(self) + other.value)
}else if(typeof other == "boolean"){
    return _b_.int.$int_or_long(BigInt(self) + (other ? 1n : 0n))
}else if($B.$isinstance(other, _b_.int)){
    return _b_.int.__add__(self, other.$brython_value)
}
return _b_.NotImplemented
`

int.__add__ = Function('self', 'other', op_model)

int.__bool__ = function(self){
    return int_value(self).valueOf() == 0 ? false : true
}

int.__ceil__ = function(self){
    return Math.ceil(int_value(self))
}

int.__divmod__ = function(self, other){
    if(! $B.$isinstance(other, int)){
        return _b_.NotImplemented
    }
    return $B.fast_tuple([int.__floordiv__(self, other),
        int.__mod__(self, other)])
}
/*
int.__eq__ = function(self, other){
    var self_as_int = int_value(self)
    if(self_as_int.__class__ === $B.long_int){
        return $B.long_int.__eq__(self_as_int, other)
    }
    if($B.$isinstance(other, int)){
        return int_value(self) == int_value(other)
    }
    return _b_.NotImplemented
}
*/
int.__float__ = function(self){
    return $B.fast_float(int_value(self))
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


int.__format__ = function(self, format_spec){
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

int.__floordiv__ = function(self, other){
    if(typeof other == "number"){
        if(other == 0){
            $B.RAISE(_b_.ZeroDivisionError, "division by zero")
        }
        return Math.floor(self / other)
    }else if(typeof other == "boolean"){
        if(other === false){
            $B.RAISE(_b_.ZeroDivisionError, "division by zero")
        }
        return self
    }else if(other !== null && other.__class__ === $B.long_int){
        return Math.floor(self / Number(other.value))
    }else if($B.$isinstance(other, _b_.int)){
        return int.__floordiv__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

int.$getnewargs = function(self){
    return $B.fast_tuple([int_value(self)])
}

int.__getnewargs__ = function(){
    return int.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

int.__hash__ = function(self){
    if(self.$brython_value !== undefined){
        // int subclass
        if(self.__hashvalue__ !== undefined){
            return self.__hashvalue__
        }
        if(typeof self.$brython_value == "number"){
            return self.__hashvalue__ = self.$brython_value
        }else{ // long int
            return self.__hashvalue__ = $B.long_int.__hash__(self.$brython_value)
        }
    }
    return self.valueOf()
}

int.__index__ = (self) => int_value(self)

int.__init__ = () => _b_.None

int.__int__ = (self) => self

int.__invert__ = function(self){
    if(Math.abs(self) < 2 ** 31){
        return ~self
    }
    return $B.rich_op('__sub__', $B.rich_op('__mul__', self, -1), 1)
}

int.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    if($B.$isinstance(other,_b_.tuple) && other.length == 1){
        other = other[0]
    }
    if(other.__class__ === $B.long_int){
        self = BigInt(self)
        other = other.value
        if(other == 0){
            $B.RAISE(_b_.ZeroDivisionError,
                "integer division or modulo by zero")
        }
        return int_or_long((self % other + other) % other)
    }
    if($B.$isinstance(other, int)){
        other = int_value(other)
        if(other === false){other = 0}
        else if(other === true){other = 1}
        if(other == 0){$B.RAISE(_b_.ZeroDivisionError,
            "integer division or modulo by zero")}
        return (self % other + other) % other
    }
    return _b_.NotImplemented
}

int.__mul__ = Function('self', 'other',
    op_model.replace(/\+/g, '*').replace(/add/g, "mul"))

/*
int.__ne__ = function(self, other){
    var res = int.__eq__(self, other)
    return (res  === _b_.NotImplemented) ? res : !res
}
*/

int.__neg__ = function(self){
    var self_as_int = int_value(self)
    if(self_as_int.__class__ === $B.long_int){
        return $B.long_int.__neg__(self_as_int)
    }
    return -self
}

int.__new__ = function(cls, value, base){
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "int.__new__(): not enough arguments")
    }else if(! $B.$isinstance(cls, _b_.type)){
        $B.RAISE(_b_.TypeError, "int.__new__(X): X is not a type object")
    }
    if(cls === int){
        return int.$factory(value, base)
    }
    if(cls === bool) {
        $B.RAISE(_b_.TypeError, "int.__new__(bool) is not safe, use bool.__new__()")
    }
    // set method .toString so that BigInt(instance) returns a bingint
    return {
        __class__: cls,
        __dict__: $B.empty_dict(),
        $brython_value: int.$factory(value, base),
        toString: function(){
            return value
        }
    }
}

int.__pos__ = function(self){
    return self
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

int.__pow__ = function(self, other, z){
    if(! $B.$isinstance(other, int)){
        return _b_.NotImplemented
    }
    if(typeof other == "boolean"){
        other = other ? 1 : 0
    }
    if(typeof other == "number"  || $B.$isinstance(other, int)){
        if(z !== undefined && z !== _b_.None){
            // If z is provided, the algorithm is faster than computing
            // self ** other then applying the modulo z
            self = bigint_value(self)
            other = bigint_value(other)
            z = bigint_value(z)
            if(z == 1){
                return 0
            }
            var result = 1n,
                exponent = other,
                base = self % z
            if(base < 0){
                base += z
            }
            if(exponent < 0){
                var gcd, inv, _
                [gcd, inv, _] = extended_euclidean(self, z)
                if(gcd != 1){
                    $B.RAISE(_b_.ValueError, "not relative primes: " +
                        self + ' and ' + z)
                }
                return int.__pow__(int_or_long(inv),
                                   int_or_long(-exponent),
                                   int_or_long(z))
            }
            while(exponent > 0){
                if(exponent % 2n == 1n){
                    result = (result * base) % z
                }
                exponent = exponent >> 1n
                base = (base * base) % z
            }
            return int_or_long(result)
        }else{
            if(typeof other == "number"){
                if(other >= 0){
                    return int_or_long(BigInt(self) ** BigInt(other))
                }else{
                    return $B.fast_float(Math.pow(self, other))
                }
            }else if(other.__class__ === $B.long_int){
                if(other.value >= 0){
                    return int_or_long(BigInt(self) ** other.value)
                }else{
                    return $B.fast_float(Math.pow(self, other))
                }
            }else if($B.$isinstance(other, _b_.int)){
                return int_or_long(int.__pow__(self, other.$brython_value))
            }
            return _b_.NotImplemented
        }
    }
    if($B.$isinstance(other, _b_.float)) {
        other = _b_.float.numerator(other)
        if(self >= 0){
            return $B.fast_float(Math.pow(self, other))
        }else{
            // use complex power
            return _b_.complex.__pow__($B.make_complex(self, 0), other)
        }
    }else if($B.$isinstance(other, _b_.complex)){
        var preal = Math.pow(self, other.$real),
            ln = Math.log(self)
        return $B.make_complex(preal * Math.cos(ln), preal * Math.sin(ln))
    }
    var rpow = $B.$getattr(other, "__rpow__", _b_.None)
    if(rpow !== _b_.None){
        return rpow(self)
    }
    $err("**", other)
}

int.tp_repr = function(self){
    $B.builtins_repr_check(int, arguments) // in brython_builtins.js
    var value = int_value(self),
        x = value.__class__ === $B.long_int ? value.value : value

    if($B.int_max_str_digits != 0 &&
            x >= 10n ** BigInt($B.int_max_str_digits)){
        $B.RAISE(_b_.ValueError, `Exceeds the limit ` +
            `(${$B.int_max_str_digits}) for integer string conversion`)
    }
    return x.toString()
}

int.__setattr__ = function(self, attr, value){
    if(typeof self == "number" || typeof self == "boolean"){
        var cl_name = $B.class_name(self)
        if(_b_.dir(self).indexOf(attr) > -1){
            $B.RAISE_ATTRIBUTE_ERROR("attribute '" + attr +
                `' of '${cl_name}' objects is not writable`, self, attr)
        }else{
            $B.RAISE_ATTRIBUTE_ERROR(`'${cl_name}' object` +
                ` has no attribute '${attr}'`, self, attr)
        }
    }
    // subclasses of int can have attributes set
    _b_.dict.$setitem(self.__dict__, attr, value)
    return _b_.None
}

int.__sub__ = Function('self', 'other',
     op_model.replace(/\+/g, '-').replace(/__add__/g, '__sub__'))

int.__truediv__ = function(self, other){
    if($B.$isinstance(other, int)){
        other = int_value(other)
        if(other == 0){
            $B.RAISE(_b_.ZeroDivisionError, "division by zero")
        }
        if(other.__class__ === $B.long_int){
            return $B.fast_float(self / parseInt(other.value))
        }
        return $B.fast_float(self / other)
    }
    return _b_.NotImplemented
}

/* if a < b, return a negative number
   if a == b, return 0
   if a > b, return a positive number */
function long_richcompare(a, b, op){
    var result
    if(typeof a == 'number' || $B.$isinstance(a, int)){
        a = int_value(a)
    }else if($B.get_class(other) === $B.long_int){
        other = other.value
    }else if(typeof b == 'boolean'){
        b = b ? 1 : 0
    }else{
        return _b_.NotImplemented
    }
    if(a === b){
        result = 0
    }else{
        result = a > b ? 1 : -1
    }
    return $B.RICHCOMPARE(result, 0, op)
}

// code for operands & | ^
var model =
`var _b_ = __BRYTHON__.builtins
if(typeof other == "number"){
    // transform into BigInt: JS converts numbers to 32 bits
    return _b_.int.$int_or_long(BigInt(self) & BigInt(other))
}else if(typeof other == "boolean"){
    return self & (other ? 1 : 0)
}else if(other.__class__ === $B.long_int){
    return _b_.int.$int_or_long(BigInt(self) & other.value)
}else if($B.$isinstance(other, _b_.int)){
    // int subclass
    return _b_.int.__and__(self, other.$brython_value)
}
return _b_.NotImplemented`

int.__and__ = Function('self', 'other', model)
int.__lshift__ = Function('self', 'other',
     model.replace(/&/g, '<<').replace(/__and__/g, '__lshift__'))
int.__rshift__ = Function('self', 'other',
     model.replace(/&/g, '>>').replace(/__and__/g, '__rshift__'))
int.__or__ = Function('self', 'other',
     model.replace(/&/g, '|').replace(/__and__/g, '__or__'))
int.__xor__ = Function('self', 'other',
     model.replace(/&/g, '^').replace(/__and__/g, '__xor__'))

/*
int.__ge__ = function(self, other){
    self = int_value(self)
    if(typeof other == "number"){
        return self >= other
    }else if(other !== null && other.__class__ === $B.long_int){
        return self >= other.value
    }else if(typeof other == "boolean"){
        return self >= other ? 1 : 0
    }else if($B.$isinstance(other, _b_.int)){
        return self >= other.$brython_value
    }
    return _b_.NotImplemented
}

int.__gt__ = function(self, other){
    var res = int.__le__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

int.__le__ = function(self, other){
    self = int_value(self)
    if(typeof other == "number"){
        return self <= other
    }else if(other !== null && other.__class__ === $B.long_int){
        return self <= other.value
    }else if(typeof other == "boolean"){
        return self <= other ? 1 : 0
    }else if($B.$isinstance(other, _b_.int)){
        return self <= other.$brython_value
    }
    return _b_.NotImplemented
}

int.__lt__ = function(self, other){
    var res = int.__ge__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}
*/
// add "reflected" methods
var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or", "divmod"]

for(var r_opname of r_opnames){
    if(int["__r" + r_opname + "__"] === undefined &&
            int['__' + r_opname + '__']){
        int["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                if($B.$isinstance(other, int)){
                    other = int_value(other)
                    return int["__" + name + "__"](other, self)
                }
                return _b_.NotImplemented
            }
        })(r_opname)
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

int.$factory = function(){
    var missing = {},
        $ = $B.args("int", 2, {x: null, base: null}, ["x", "base"],
            arguments, {x: missing, base: missing}, null, null, 1),
            value = $.x,
            base = $.base === undefined ? missing : $.base,
            initial_value = value,
            explicit_base = base !== missing

    // int() with no argument returns 0
    if(value === missing || value === undefined){
        if(base !== missing){
            $B.RAISE(_b_.TypeError, "int() missing string argument")
        }
        return 0
    }

    if($B.$isinstance(value, [_b_.bytes, _b_.bytearray])){
        // transform to string
        value = $B.$getattr(value, 'decode')('latin-1')
    }else if(explicit_base && ! $B.$isinstance(value, _b_.str)){
        $B.RAISE(_b_.TypeError,
            "int() can't convert non-string with explicit base")
    }else if($B.$isinstance(value, _b_.memoryview)){
        value = $B.$getattr(_b_.memoryview.tobytes(value), 'decode')('latin-1')
    }

    if(! $B.$isinstance(value, _b_.str)){
        if(base !== missing){
            $B.RAISE(_b_.TypeError,
                "int() can't convert non-string with explicit base")
        }else{
            // booleans, bigints, objects with method __index__
            for(let special_method of ['__int__', '__index__', '__trunc__']){
                let num_value = $B.$getattr($B.get_class(value),
                                            special_method, _b_.None)
                if(num_value !== _b_.None){
                    let res = $B.$call(num_value)(value)
                    if(special_method == '__trunc__'){
                        $B.warn(_b_.DeprecationWarning,
                        'The delegation of int() to __trunc__ is deprecated.')
                        let index_method = $B.$getattr(res, '__index__', null)
                        if(index_method === null){
                            $B.RAISE(_b_.TypeError, '__trunc__ returned' +
                                ` non-Integral (type ${$B.class_name(res)})`)
                        }
                        res = $B.$call(index_method)()
                    }
                    if($B.$isinstance(res, _b_.int)){
                        if(typeof res !== "number" &&
                                res.__class__ !== $B.long_int){
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
    base = base === missing ? 10: $B.PyNumber_Index(base)

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
            if(obj.$is_class){
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
                var res = $B.call_with_mro(obj, '__bool__')
                if(res !== true && res !== false){
                    $B.RAISE(_b_.TypeError, "__bool__ should return " +
                        "bool, returned " + $B.class_name(res))
                }
                return res
            }
    }
}

var bool = _b_.bool

bool.__and__ = function(self, other){
    if($B.$isinstance(other, bool)){
        return self && other
    }else if($B.$isinstance(other, int)){
        return int.__and__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__float__ = function(self){
    return self ? $B.fast_float(1) : $B.fast_float(0)
}

bool.__hash__ = bool.__index__ = bool.__int__ = function(self){
   if(self.valueOf()) return 1
   return 0
}

bool.__neg__ = function(self){return -$B.int_or_bool(self)}

bool.__or__ = function(self, other){
    if($B.$isinstance(other, bool)){
        return self || other
    }else if($B.$isinstance(other, int)){
        return int.__or__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__pos__ = $B.int_or_bool

bool.tp_repr = function(self){
    $B.builtins_repr_check(bool, arguments) // in brython_builtins.js
    return self ? "True" : "False"
}

bool.__xor__ = function(self, other) {
    if($B.$isinstance(other, bool)){
        return self ^ other ? true : false
    }else if($B.$isinstance(other, int)){
        return int.__xor__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__invert__ = function(self) {
    $B.warn(_b_.DeprecationWarning, `Bitwise inversion '~' on bool is deprecated.This returns the bitwise inversion of the underlying int object and is usually not what you expect from negating a bool.Use the 'not' operator for boolean negation or ~int(x) if you really want the bitwise inversion of the underlying int.`)
    return int.__invert__(self)
}

bool.$factory = function(){
    // Calls $B.$bool, which is used inside the generated JS code and skips
    // arguments control.
    var $ = $B.args("bool", 1, {x: null}, ["x"],
        arguments, {x: false}, null, null, 1)
    return $B.$bool($.x, true)
}

bool.tp_new = function (cls, value) {
    if (cls === undefined) {
        $B.RAISE(_b_.TypeError, "bool.__new__(): not enough arguments")
    } else if (!$B.$isinstance(cls, _b_.type)) {
        $B.RAISE(_b_.TypeError, `bool.__new__(X): X is not a type object (${$B.class_name(cls) })`)
    } else if (!_b_.issubclass(cls, bool)) {
        let class_name = $B.class_name(cls)
        $B.RAISE(_b_.TypeError, `bool.__new__(${class_name}): ${class_name} is not a subtype of bool`)
    }
    if (arguments.length > 2) {
        $B.RAISE(_b_.TypeError, `bool expected at most 1 argument, got ${arguments.length - 1}`)
    }
    return bool.$factory(value)
}

bool.from_bytes = function () {
    var $ = $B.args("from_bytes", 3,
        { bytes: null, byteorder: null, signed: null },
        ["bytes", "byteorder", "signed"],
        arguments, { byteorder: 'big', signed: false }, null, null)
    let int_result = int.from_bytes($.bytes, $.byteorder, $.signed)
    return bool.$factory(int_result)
}

bool.numerator = int.numerator
bool.denominator = int.denominator
bool.real = (self) => self ? 1 : 0
bool.imag = int.imag

for (var attr of ['real']) {
    bool[attr].setter = (function (x) {
        return function (self) {
            $B.RAISE_ATTRIBUTE_ERROR(`attribute '${x}' of ` +
                `'${$B.class_name(self)}' objects is not writable`, self, x)
        }
    })(attr)
}

$B.set_func_names(bool, "builtins")

})(__BRYTHON__);
