;(function($B){

var _b_ = $B.builtins

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        " : 'int' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
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
    }else if(_b_.isinstance(obj, _b_.int)){
        return bigint_value(obj.$brython_value)
    }
}

// dictionary for built-in class 'int'
var int = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    __mro__: [_b_.object],
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
    }else if(_b_.isinstance(obj, _b_.int)){
        return int.$to_js_value(obj.$brython_value)
    }
    return null
}

int.$to_bigint = bigint_value

int.as_integer_ratio = function(){
  var $ = $B.args("as_integer_ratio", 1, {self:null}, ["self"],
          arguments, {}, null, null)
  return $B.fast_tuple([$.self, 1])
}

int.from_bytes = function() {
    var $ = $B.args("from_bytes", 3,
        {bytes:null, byteorder:null, signed:null},
        ["bytes", "byteorder", "signed"],
        arguments, {signed: false}, null, null)

    var x = $.bytes,
        byteorder = $.byteorder,
        signed = $.signed,
        _bytes, _len
    if(_b_.isinstance(x, [_b_.bytes, _b_.bytearray])){
        _bytes = x.source
        _len = x.source.length
    }else{
        _bytes = _b_.list.$factory(x)
        _len = _bytes.length
        for(var i = 0; i < _len; i++){
            _b_.bytes.$factory([_bytes[i]])
        }
    }
    if(byteorder == "big"){
        _bytes.reverse()
    }else if(byteorder != "little"){
        throw _b_.ValueError.$factory(
            "byteorder must be either 'little' or 'big'")
    }
    var num = _bytes[0]
    if(signed && num >= 128){
        num = num - 256
    }
    num = BigInt(num)
    var _mult = 256n
    for(var i = 1;  i < _len; i++){
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

int.to_bytes = function(){
    var $ = $B.args("to_bytes", 3,
        {self: null, len: null, byteorder: null, signed: null},
        ["self", "len", "byteorder", "*", "signed"],
        arguments, {signed: false}, null, null),
        self = $.self,
        len = $.len,
        byteorder = $.byteorder,
        signed = $.signed
    if(! _b_.isinstance(len, _b_.int)){
        throw _b_.TypeError.$factory("integer argument expected, got " +
            $B.class_name(len))
    }
    if(["little", "big"].indexOf(byteorder) == -1){
        throw _b_.ValueError.$factory(
            "byteorder must be either 'little' or 'big'")
    }

    if(_b_.isinstance(self, $B.long_int)){
        return $B.long_int.to_bytes(self, len, byteorder, signed)
    }

    if(self < 0){
        if(! signed){
            throw _b_.OverflowError.$factory(
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
            throw _b_.OverflowError.$factory("int too big to convert")
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

int.__abs__ = function(self){
    return Math.abs(int_value(self))
}

int.__add__ = function(self, other){
    if(typeof other == "number"){
        return int_or_long(BigInt(self) + BigInt(other))
    }else if(other.__class__ === $B.long_int){
        return int_or_long(BigInt(self) + other.value)
    }else if(typeof other == "boolean"){
        return int_or_long(BigInt(self) + (other ? 1n : 0n))
    }else if(_b_.isinstance(other, _b_.int)){
        return int.__add__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

var op_model = int.__add__ + ''

int.__bool__ = function(self){
    return int_value(self).valueOf() == 0 ? false : true
}

int.__ceil__ = function(self){
    return Math.ceil(int_value(self))
}

int.__divmod__ = function(self, other){
    if(! _b_.isinstance(other, int)){
        return _b_.NotImplemented
    }
    return $B.fast_tuple([int.__floordiv__(self, other),
        int.__mod__(self, other)])
}

int.__eq__ = function(self, other){
    var self_as_int = int_value(self)
    if(_b_.isinstance(other, int)){
        return int_value(self) == int_value(other)
    }
    return _b_.NotImplemented
}

int.__float__ = function(self){
    return $B.fast_float(int_value(self))
}

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

int.__floordiv__ = function(self, other){
    if(typeof other == "number"){
        if(other == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return Math.floor(self / other)
    }else if(typeof other == "boolean"){
        if(other === false){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return self
    }else if(other.__class__ === $B.long_int){
        return Math.floor(self / Number(other.value))
    }else if(_b_.isinstance(other, _b_.int)){
        return int.__floordiv__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

int.__hash__ = function(self){
    if(self.$brython_value){
        // int subclass
        var hash_method = $B.$getattr(self.__class__, '__hash__')
        if(hash_method === int.__hash__){
            if(typeof self.$brython_value == "number"){
                return self.$brython_value
            }else{ // long int
                return $B.long_int.__hash__(self.$brython_value)
            }
        }else{
            return hash_method(self)
        }
    }
    return self.valueOf()
}

int.__index__ = function(self){
    return int_value(self)
}

int.__init__ = function(self){
    return _b_.None
}

int.__int__ = function(self){
    return self
}

int.__invert__ = function(self){
    return ~self
}

int.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    if(_b_.isinstance(other,_b_.tuple) && other.length == 1){
        other = other[0]
    }
    if(other.__class__ === $B.long_int){
        self = BigInt(self)
        other = other.value
        if(other == 0){
            throw _b_.ZeroDivisionError.$factory(
                "integer division or modulo by zero")
        }
        return int_or_long((self % other + other) % other)
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other === false){other = 0}
        else if(other === true){other = 1}
        if(other == 0){throw _b_.ZeroDivisionError.$factory(
            "integer division or modulo by zero")}
        return (self % other + other) % other
    }
    return _b_.NotImplemented
}

eval('int.__mul__ = ' + op_model.replace(/\+/g, '*').replace(/add/g, "mul"))

int.__ne__ = function(self, other){
    var res = int.__eq__(self, other)
    return (res  === _b_.NotImplemented) ? res : !res
}

int.__neg__ = function(self){return -self}

int.__new__ = function(cls, value, base){
    if(cls === undefined){
        throw _b_.TypeError.$factory("int.__new__(): not enough arguments")
    }else if(! _b_.isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("int.__new__(X): X is not a type object")
    }
    if(cls === int){
        return int.$factory(value, base)
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
    if(! _b_.isinstance(other, int)){
        return _b_.NotImplemented
    }
    if(typeof other == "boolean"){
        other = other ? 1 : 0
    }
    if(typeof other == "number"  || _b_.isinstance(other, int)){
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
                base = self % z,
                exponent = other
            if(exponent < 0){
                var gcd, inv, _
                [gcd, inv, _] = extended_euclidean(self, z)
                if(gcd != 1){
                    throw _b_.ValueError.$factory("not relative primes: " +
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
            }else if(_b_.isinstance(other, _b_.int)){
                return int_or_long(int.__pow__(self, other.$brython_value))
            }
            return _b_.NotImplemented
        }
    }
    if(_b_.isinstance(other, _b_.float)) {
        other = _b_.float.numerator(other)
        if(self >= 0){
            return $B.fast_float(Math.pow(self, other))
        }else{
            // use complex power
            return _b_.complex.__pow__($B.make_complex(self, 0), other)
        }
    }else if(_b_.isinstance(other, _b_.complex)){
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

function __newobj__(){
    // __newobj__ is called with a generator as only argument
    var $ = $B.args('__newobj__', 0, {}, [], arguments, {}, 'args', null),
        args = $.args
    var res = args.slice(1)
    res.__class__ = args[0]
    return res
}

int.__reduce_ex__ = function(self){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__ || int, int_value(self)]),
        _b_.None,
        _b_.None,
        _b_.None])
}

int.__repr__ = function(self){
    $B.builtins_repr_check(int, arguments) // in brython_builtins.js
    return int_value(self).toString()
}

int.__setattr__ = function(self, attr, value){
    if(typeof self == "number" || typeof self == "boolean"){
        var cl_name = $B.class_name(self)
        if(_b_.dir(self).indexOf(attr) > -1){
            throw _b_.AttributeError.$factory("attribute '" + attr +
                `' of '${cl_name}' objects is not writable`)
        }else{
            throw _b_.AttributeError.$factory(`'${cl_name}' object` +
                ` has no attribute '${attr}'`)
        }
        throw _b_.AttributeError.$factory(msg)
    }
    // subclasses of int can have attributes set
    _b_.dict.$setitem(self.__dict__, attr, value)
    return _b_.None
}

eval('int.__sub__ = ' +
     op_model.replace(/\+/g, '-').replace(/__add__/g, '__sub__'))

int.__truediv__ = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        if(other.__class__ === $B.long_int){
            return $B.fast_float(self / parseInt(other.value))
        }
        return $B.fast_float(self / other)
    }
    return _b_.NotImplemented
}

int.bit_count = function(self){
    var s = _b_.bin(_b_.abs(self)),
        nb = 0
    for(var x of s){
        if(x == '1'){
            nb++
        }
    }
    return nb
}

int.bit_length = function(self){
    var s = _b_.bin(self)
    s = $B.$getattr(s, "lstrip")("-0b") // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

// descriptors
int.numerator = function(self){
    return int_value(self)
}
int.denominator = function(self){
    return int.$factory(1)
}
int.imag = function(self){
    return int.$factory(0)
}
int.real = function(self){
    return self
}

for(var attr of ['numerator', 'denominator', 'imag', 'real']){
    int[attr].setter = (function(x){
        return function(self, value){
            throw _b_.AttributeError.$factory(`attribute '${x}' of ` +
                `'${$B.class_name(self)}' objects is not writable`)
        }
    })(attr)
}

// code for operands & | ^
int.__and__ = function(self, other){
    if(typeof other == "number"){
        // transform into BigInt: JS converts numbers to 32 bits
        return int_or_long(BigInt(self) & BigInt(other))
    }else if(typeof other == "boolean"){
        return self & (other ? 1 : 0)
    }else if(other.__class__ === $B.long_int){
        return int_or_long(BigInt(self) & other.value)
    }else if(_b_.isinstance(other, _b_.int)){
        // int subclass
        return int.__and__(self, other.$brython_value)
    }
    return _b_.NotImplemented
}

var model = int.__and__ + ''

eval("int.__lshift__ = " +
     model.replace(/&/g, '<<').replace(/__and__/g, '__lshift__'))
eval("int.__rshift__ = " +
     model.replace(/&/g, '>>').replace(/__and__/g, '__rshift__'))
eval("int.__or__ = " +
     model.replace(/&/g, '|').replace(/__and__/g, '__or__'))
eval("int.__xor__ = " +
     model.replace(/&/g, '^').replace(/__and__/g, '__xor__'))

int.__ge__ = function(self, other){
    self = int_value(self)
    if(typeof other == "number"){
        return self >= other
    }else if(other.__class__ === $B.long_int){
        return self >= other.value
    }else if(typeof other == "boolean"){
        return self >= other ? 1 : 0
    }else if(_b_.isinstance(other, _b_.int)){
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
    }else if(other.__class__ === $B.long_int){
        return self <= other.value
    }else if(typeof other == "boolean"){
        return self <= other ? 1 : 0
    }else if(_b_.isinstance(other, _b_.int)){
        return self <= other.$brython_value
    }
    return _b_.NotImplemented
}

int.__lt__ = function(self, other){
    var res = int.__ge__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

// add "reflected" methods
var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or", "divmod"]

for(var r_opname of r_opnames){
    if(int["__r" + r_opname + "__"] === undefined &&
            int['__' + r_opname + '__']){
        int["__r" + r_opname + "__"] = (function(name){
            return function(self, other){
                if(_b_.isinstance(other, int)){
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
       for(var i = 0; i < base; i++){digits += String.fromCharCode(i + 48)}
       return digits
    }

    var digits = "0123456789"
    // A = 65 (10 + 55)
    for (var i = 10; i < base; i++) {digits += String.fromCharCode(i + 55)}
    return digits
}

int.$factory = function(value, base){
    var missing = {},
        $ = $B.args("int", 2, {x: null, base: null}, ["x", "/", "base"],
            arguments, {x: missing, base: missing}, null, null),
            value = $.x,
            base = $.base === undefined ? missing : $.base,
            initial_value = value

    // int() with no argument returns 0
    if(value === missing || value === undefined){
        if(base !== missing){
            throw _b_.TypeError.$factory("int() missing string argument")
        }
        return 0
    }

    if(_b_.isinstance(value, [_b_.bytes, _b_.bytearray])){
        // transform to string
        value = $B.$getattr(value, 'decode')('latin-1')
    }else if(_b_.isinstance(value, _b_.memoryview)){
        value = $B.$getattr(_b_.memoryview.tobytes(value), 'decode')('latin-1')
    }

    if(! _b_.isinstance(value, _b_.str)){
        if(base !== missing){
            throw _b_.TypeError.$factory(
                "int() can't convert non-string with explicit base")
        }else{
            // booleans, bigints, objects with method __index__
            for(var special_method of ['__int__', '__index__', '__trunc__']){
                var num_value = $B.$getattr($B.get_class(value),
                                            special_method, _b_.None)
                if(num_value !== _b_.None){
                    var res = $B.$call(num_value)(value)
                    if(special_method == '__trunc__'){
                        $B.warn(_b_.DeprecationWarning,
                        'The delegation of int() to __trunc__ is deprecated.')
                        var index_method = $B.$getattr(res, '__index__', null)
                        if(index_method === null){
                            throw _b_.TypeError.$factory('__trunc__ returned' +
                                ` non-Integral (type ${$B.class_name(res)})`)
                        }
                        res = $B.$call(index_method)()
                    }
                    if(_b_.isinstance(res, _b_.int)){
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
                        var klass = $B.get_class(res),
                            index_method = $B.$getattr(klass, '__index__', null)
                        if(index_method === null){
                            throw _b_.TypeError.$factory(special_method +
                                `returned non-int (type ${$B.class_name(res)})`)
                        }
                        return int_value(res)
                    }
                }
            }
            throw _b_.TypeError.$factory(
                "int() argument must be a string, a bytes-like object " +
                `or a real number, not '${$B.class_name(value)}'`)
        }
    }

    base = base === missing ? 10: $B.PyNumber_Index(base)

    if(! (base >=2 && base <= 36)){
        // throw error (base must be 0, or 2-36)
        if(base != 0){
            throw _b_.ValueError.$factory("invalid base")
        }
    }

    function invalid(base){
        throw _b_.ValueError.$factory("invalid literal for int() with base " +
            base + ": " + _b_.repr(initial_value))
    }

    if(typeof value != "string"){ // string subclass
        value = value.valueOf()
    }
    var _value = value.trim(),    // remove leading/trailing whitespace
        sign = ''

    if(_value.startsWith('+') || _value.startsWith('-')){
        var sign = _value[0]
        _value = _value.substr(1)
    }

    if(_value.length == 2 && base == 0 &&
            (_value == "0b" || _value == "0o" || _value == "0x")){
       throw _b_.ValueError.$factory("invalid value")
    }

    if(_value.endsWith('_')){
        invalid(base)
    }
    if(value.indexOf('__') > -1){ // consecutive underscores
        invalid(base)
    }


    if(_value.length > 2){
        var _pre = _value.substr(0, 2).toUpperCase()
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
            while(_value.startsWith("_")){
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
        match = _re.exec(_value)
    if(match === null){
        invalid(base)
    }else{
        _value = _value.replace(/_/g, "")
    }

    if(base == 10){
        res = BigInt(_value)
    }else{
        base = BigInt(base)
        var res = 0n,
            coef = 1n,
            char
        for(var i = _value.length - 1; i >= 0; i--){
            char = _value[i].toUpperCase()
            res += coef * BigInt(_digits.indexOf(char))
            coef *= base
        }
    }
    if(sign == '-'){
        res = -res
    }
    var num = Number(res)
    if(! Number.isSafeInteger(num)){
        return $B.fast_long_int(res)
    }else{
        return Number(res)
    }
}

$B.set_func_names(int, "builtins")

_b_.int = int

// Boolean type
$B.$bool = function(obj){ // return true or false
    if(obj === null || obj === undefined ){ return false}
    switch(typeof obj){
        case "boolean":
            return obj
        case "number":
        case "string":
            if(obj){return true}
            return false
        default:
            if(obj.$is_class){return true}
            var klass = obj.__class__ || $B.get_class(obj),
                missing = {},
                bool_method = $B.$getattr(klass, "__bool__", missing)
            if(bool_method === missing){
                try{return _b_.len(obj) > 0}
                catch(err){return true}
            }else{
                var res = $B.$call(bool_method)(obj)
                if(res !== true && res !== false){
                    throw _b_.TypeError.$factory("__bool__ should return " +
                        "bool, returned " + $B.class_name(res))
                }
                return res
            }
    }
}

var bool = {
    __bases__: [int],
    __class__: _b_.type,
    __mro__: [int, _b_.object],
    $infos:{
        __name__: "bool",
        __module__: "builtins"
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

bool.__and__ = function(self, other){
    if(_b_.isinstance(other, bool)){
        return self && other
    }else if(_b_.isinstance(other, int)){
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
    if(_b_.isinstance(other, bool)){
        return self || other
    }else if(_b_.isinstance(other, int)){
        return int.__or__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.__pos__ = $B.int_or_bool

bool.__repr__ = function(self){
    $B.builtins_repr_check(bool, arguments) // in brython_builtins.js
    return self ? "True" : "False"
}

bool.__xor__ = function(self, other) {
    if(_b_.isinstance(other, bool)){
        return self ^ other ? true : false
    }else if(_b_.isinstance(other, int)){
        return int.__xor__(bool.__index__(self), int.__index__(other))
    }
    return _b_.NotImplemented
}

bool.$factory = function(){
    // Calls $B.$bool, which is used inside the generated JS code and skips
    // arguments control.
    var $ = $B.args("bool", 1, {x: null}, ["x"],
        arguments,{x: false}, null, null)
    return $B.$bool($.x)
}

bool.numerator = int.numerator
bool.denominator = int.denominator
bool.real = int.real
bool.imag = int.imag

_b_.bool = bool

$B.set_func_names(bool, "builtins")

})(__BRYTHON__)
