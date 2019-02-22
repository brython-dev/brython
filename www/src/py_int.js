;(function($B){

var _b_ = $B.builtins

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        ": 'int' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
}

function int_value(obj){
    // Instances of int subclasses that call int.__new__(cls, value)
    // have an attribute $value set
    return obj.$value !== undefined ? obj.$value : obj
}

// dictionary for built-in class 'int'
var int = {__class__: _b_.type,
    __dir__: _b_.object.__dir__,
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
  switch(byteorder) {
      case "big":
          var num = _bytes[_len - 1]
          var _mult = 256
          for(var i = _len - 2; i >= 0; i--){
              // For operations, use the functions that can take or return
              // big integers
              num = $B.add($B.mul(_mult, _bytes[i]), num)
              _mult = $B.mul(_mult,256)
          }
          if(! signed){return num}
          if(_bytes[0] < 128){return num}
          return $B.sub(num, _mult)
      case "little":
          var num = _bytes[0]
          if(num >= 128){num = num - 256}
          var _mult = 256
          for(var i = 1;  i < _len; i++){
              num = $B.add($B.mul(_mult, _bytes[i]), num)
              _mult = $B.mul(_mult, 256)
          }
          if(! signed){return num}
          if(_bytes[_len - 1] < 128){return num}
          return $B.sub(num, _mult)
  }

  throw _b_.ValueError.$factory("byteorder must be either 'little' or 'big'")
}

int.to_bytes = function(){
    var $ = $B.args("to_bytes", 3,
        {self: null, len: null, byteorder: null},
        ["self", "len", "byteorder"],
        arguments, {}, "args", "kw"),
        self = $.self,
        len = $.len,
        byteorder = $.byteorder,
        kwargs = $.kw
    if(! _b_.isinstance(len, _b_.int)){
        throw _b_.TypeError.$factory("integer argument expected, got " +
            $B.class_name(len))
    }
    if(["little", "big"].indexOf(byteorder) == -1){
        throw _b_.ValueError.$factory("byteorder must be either 'little' or 'big'")
    }
    var signed = kwargs.$string_dict["signed"] || false,
        res = []

    if(self < 0){
        if(! signed){
            throw _b_.OverflowError.$factory("can't convert negative int to unsigned")
        }
        self = Math.pow(256, len) + self
    }
    var value = self
    while(true){
        var quotient = Math.floor(value / 256),
            rest = value - 256 * quotient
        res.push(rest)
        if(quotient == 0){
            break
        }
        value = quotient
    }
    if(res.length > len){
        throw _b_.OverflowError.$factory("int too big to convert")
    }
    if(byteorder == "big"){res = res.reverse()}
    return {
        __class__: _b_.bytes,
        source: res
    }
}

int.__abs__ = function(self){return _b_.abs(self)}

int.__bool__ = function(self){
    return int_value(self).valueOf() == 0 ? false : true
}

int.__ceil__ = function(self){return Math.ceil(int_value(self))}

int.__divmod__ = function(self, other){return _b_.divmod(self, other)}

int.__eq__ = function(self, other){
    // compare object "self" to class "int"
    if(other === undefined){return self === int}
    if(_b_.isinstance(other, int)){
        return self.valueOf() == int_value(other).valueOf()
    }
    if(_b_.isinstance(other, _b_.float)){return self.valueOf() == other.valueOf()}
    if(_b_.isinstance(other, _b_.complex)){
        if(other.$imag != 0){return False}
        return self.valueOf() == other.$real
    }
    return _b_.NotImplemented
}

int.__float__ = function(self){
    return new Number(self)
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
    if(other.__class__ === $B.long_int){
        return $B.long_int.__floordiv__($B.long_int.$factory(self), other)
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other == 0){throw _b_.ZeroDivisionError.$factory("division by zero")}
        return Math.floor(self / other)
    }
    if(_b_.isinstance(other, _b_.float)){
        if(!other.valueOf()){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return Math.floor(self / other)
    }
    if(hasattr(other, "__rfloordiv__")){
        return $B.$getattr(other, "__rfloordiv__")(self)
    }
    $err("//", other)
}

int.__hash__ = function(self){
   if(self === undefined){
      return int.__hashvalue__ || $B.$py_next_hash--  // for hash of int type (not instance of int)
   }
   return self.valueOf()
}

//int.__ior__ = function(self,other){return self | other} // bitwise OR

int.__index__ = function(self){
    return int_value(self)
}

int.__init__ = function(self, value){
    if(value === undefined){value = 0}
    self.toString = function(){return value}
    return _b_.None
}

int.__int__ = function(self){return self}

int.__invert__ = function(self){return ~self}

// bitwise left shift
int.__lshift__ = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        return int.$factory($B.long_int.__lshift__($B.long_int.$factory(self),
            $B.long_int.$factory(other)))
    }
    var rlshift = $B.$getattr(other, "__rlshift__", _b_.None)
    if(rlshift !== _b_.None){return rlshift(self)}
    $err("<<", other)
}

int.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    if(_b_.isinstance(other,_b_.tuple) && other.length == 1){other = other[0]}
    if(other.__class__ === $B.long_int){
        return $B.long_int.__mod__($B.long_int.$factory(self), other)
    }
    if(_b_.isinstance(other, [int, _b_.float, bool])){
        other = int_value(other)
        if(other === false){other = 0}
        else if(other === true){other = 1}
        if(other == 0){throw _b_.ZeroDivisionError.$factory(
            "integer division or modulo by zero")}
        return (self % other + other) % other
    }
    if(hasattr(other, "__rmod__")){return $B.$getattr(other, "__rmod__")(self)}
    $err("%", other)
}

int.__mro__ = [_b_.object]

int.__mul__ = function(self, other){

    var val = self.valueOf()

    // this will be quick check, so lets do it early.
    if(typeof other === "string") {
        return other.repeat(val)
    }

    if(_b_.isinstance(other, int)){
        other = int_value(other)
        var res = self * other
        if(res > $B.min_int && res < $B.max_int){return res}
        else{
            return int.$factory($B.long_int.__mul__($B.long_int.$factory(self),
                $B.long_int.$factory(other)))
        }
    }
    if(_b_.isinstance(other, _b_.float)){
        return new Number(self * other)
    }
    if(_b_.isinstance(other, _b_.bool)){
         if(other.valueOf()){return self}
         return int.$factory(0)
    }
    if(_b_.isinstance(other, _b_.complex)){
        return $B.make_complex(int.__mul__(self, other.$real),
            int.__mul__(self, other.$imag))
    }
    if(_b_.isinstance(other, [_b_.list, _b_.tuple])){
        var res = []
        // make temporary copy of list
        var $temp = other.slice(0, other.length)
        for(var i = 0; i < val; i++){res = res.concat($temp)}
        if(_b_.isinstance(other, _b_.tuple)){res = _b_.tuple.$factory(res)}
        return res
    }
    if(_b_.hasattr(other, "__rmul__")){
        return $B.$getattr(other, "__rmul__")(self)
    }
    $err("*", other)
}

int.__ne__ = function(self, other){
    var res = int.__eq__(self, other)
    return (res  === _b_.NotImplemented) ? res : !res
}

int.__neg__ = function(self){return -self}

int.__new__ = function(cls, value){
    if(cls === undefined){
        throw _b_.TypeError.$factory("int.__new__(): not enough arguments")
    }else if(! _b_.isinstance(cls, _b_.type)){
        throw _b_.TypeError.$factory("int.__new__(X): X is not a type object")
    }
    if(cls === int){return int.$factory(value)}
    return {
        __class__: cls,
        __dict__: _b_.dict.$factory(),
        $value: value || 0
    }
}

int.__pos__ = function(self){return self}

int.__pow__ = function(self, other, z){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        switch(other.valueOf()) {
            case 0:
                return int.$factory(1)
            case 1:
                return int.$factory(self.valueOf())
      }
      if(z !== undefined && z !== null){
          // If z is provided, the algorithm is faster than computing
          // self ** other then applying the modulo z
          if(z == 1){return 0}
          var result = 1,
              base = self % z,
              exponent = other,
              long_int = $B.long_int
          while(exponent > 0){
              if(exponent % 2 == 1){
                  if(result * base > $B.max_int){
                      result = long_int.__mul__(
                          long_int.$factory(result),
                          long_int.$factory(base))
                      result = long_int.__mod__(result, z)
                  }else{
                     result = (result * base) % z
                  }
              }
              exponent = exponent >> 1
              if(base * base > $B.max_int){
                  base = long_int.__mul__(long_int.$factory(base),
                      long_int.$factory(base))
                  base = long_int.__mod__(base, z)
              }else{
                  base = (base * base) % z
              }
          }
          return result
      }
      var res = Math.pow(self.valueOf(), other.valueOf())
      if(res > $B.min_int && res < $B.max_int){return res}
      else if(res !== Infinity && !isFinite(res)){return res}
      else{
          return int.$factory($B.long_int.__pow__($B.long_int.$factory(self),
             $B.long_int.$factory(other)))
      }
    }
    if(_b_.isinstance(other, _b_.float)) {
        if(self >= 0){return new Number(Math.pow(self, other.valueOf()))}
        else{
            // use complex power
            return _b_.complex.__pow__($B.make_complex(self, 0), other)
        }
    }else if(_b_.isinstance(other, _b_.complex)){
        var preal = Math.pow(self, other.$real),
            ln = Math.log(self)
        return $B.make_complex(preal * Math.cos(ln), preal * Math.sin(ln))
    }
    if(hasattr(other, "__rpow__")){return $B.$getattr(other, "__rpow__")(self)}
    $err("**", other)
}

int.__repr__ = function(self){
    if(self === int){return "<class 'int'>"}
    return self.toString()
}

// bitwise right shift
int.__rshift__ = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        return int.$factory($B.long_int.__rshift__($B.long_int.$factory(self),
            $B.long_int.$factory(other)))
    }
    var rrshift = $B.$getattr(other, "__rrshift__", _b_.None)
    if(rrshift !== _b_.None){return rrshift(self)}
    $err('>>', other)
}

int.__setattr__ = function(self, attr, value){
    if(typeof self == "number"){
        if(int.$factory[attr] === undefined){
            throw _b_.AttributeError.$factory(
                "'int' object has no attribute '" + attr + "'")
        }else{
            throw _b_.AttributeError.$factory(
                "'int' object attribute '" + attr + "' is read-only")
        }
    }
    // subclasses of int can have attributes set
    self[attr] = value
    return _b_.None
}

int.__str__ = int.__repr__

int.__truediv__ = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(other == 0){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        if(other.__class__ === $B.long_int){
            return new Number(self / parseInt(other.value))
        }
        return new Number(self / other)
    }
    if(_b_.isinstance(other, _b_.float)){
        if(!other.valueOf()){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return new Number(self / other)
    }
    if(_b_.isinstance(other, _b_.complex)){
        var cmod = other.$real * other.$real + other.$imag * other.$imag
        if(cmod == 0){throw _b_.ZeroDivisionError.$factory("division by zero")}
        return $B.make_complex(self * other.$real / cmod,
            -self * other.$imag / cmod)
    }
    if(_b_.hasattr(other, "__rtruediv__")){
        return $B.$getattr(other, "__rtruediv__")(self)
    }
    $err("/", other)
}

int.bit_length = function(self){
    s = _b_.bin(self)
    s = $B.$getattr(s, "lstrip")("-0b") // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

// descriptors
int.numerator = function(self){return self}
int.denominator = function(self){return int.$factory(1)}
int.imag = function(self){return int.$factory(0)}
int.real = function(self){return self}

$B.max_int32 = (1 << 30) * 2 - 1
$B.min_int32 = - $B.max_int32

// code for operands & | ^
var $op_func = function(self, other){
    if(_b_.isinstance(other, int)) {
        if(other.__class__ === $B.long_int){
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        other = int_value(other)
        if(self > $B.max_int32 || self < $B.min_int32 ||
                other > $B.max_int32 || other < $B.min_int32){
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
        return self - other
    }
    if(_b_.isinstance(other, _b_.bool)){return self - other}
    var rsub = $B.$getattr(other, "__rsub__", _b_.None)
    if(rsub !== _b_.None){return rsub(self)}
    $err("-", other)
}

$op_func += "" // source code
var $ops = {"&": "and", "|": "or", "^": "xor"}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm, $op)
    opf = opf.replace(new RegExp("sub", "gm"), $ops[$op])
    eval("int.__" + $ops[$op] + "__ = " + opf)
}

// code for + and -
var $op_func = function(self, other){
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        if(typeof other == "number"){
            var res = self.valueOf() - other.valueOf()
            if(res > $B.min_int && res < $B.max_int){return res}
            else{return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))}
        }else if(typeof other == "boolean"){
            return other ? self - 1 : self
        }else{
            return $B.long_int.__sub__($B.long_int.$factory(self),
                $B.long_int.$factory(other))
        }
    }
    if(_b_.isinstance(other, _b_.float)){
        return new Number(self - other)
    }
    if(_b_.isinstance(other, _b_.complex)){
        return $B.make_complex(self - other.$real, -other.$imag)
    }
    if(_b_.isinstance(other, _b_.bool)){
         var bool_value = 0;
         if(other.valueOf()){bool_value = 1}
         return self - bool_value
    }
    if(_b_.isinstance(other, _b_.complex)){
        return $B.make_complex(self.valueOf() - other.$real, other.$imag)
    }
    var rsub = $B.$getattr(other, "__rsub__", _b_.None)
    if(rsub !== _b_.None){return rsub(self)}
    throw $err("-", other)
}
$op_func += "" // source code
var $ops = {"+": "add", "-": "sub"}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm, $op)
    opf = opf.replace(new RegExp("sub", "gm"), $ops[$op])
    eval("int.__" + $ops[$op] + "__ = " + opf)
}

// comparison methods
var $comp_func = function(self, other){
    if(other.__class__ === $B.long_int){
        return $B.long_int.__lt__(other, $B.long_int.$factory(self))
    }
    if(_b_.isinstance(other, int)){
        other = int_value(other)
        return self.valueOf() > other.valueOf()
    }else if(_b_.isinstance(other, _b_.float)){
        return self.valueOf() > other.valueOf()
    }else if(_b_.isinstance(other, _b_.bool)) {
      return self.valueOf() > _b_.bool.__hash__(other)
    }
    if(_b_.hasattr(other, "__int__") || _b_.hasattr(other, "__index__")){
       return int.__gt__(self, $B.$GetInt(other))
    }

    return _b_.NotImplemented
}
$comp_func += "" // source code

for(var $op in $B.$comps){
    eval("int.__"+$B.$comps[$op] + "__ = " +
          $comp_func.replace(/>/gm, $op).
              replace(/__gt__/gm,"__" + $B.$comps[$op] + "__").
              replace(/__lt__/, "__" + $B.$inv_comps[$op] + "__"))
}

// add "reflected" methods
$B.make_rmethods(int)

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
    // int() with no argument returns 0
    if(value === undefined){return 0}

    // int() of an integer returns the integer if base is undefined
    if(typeof value == "number" &&
        (base === undefined || base == 10)){return parseInt(value)}

    if(base !== undefined){
        if(! _b_.isinstance(value, [_b_.str, _b_.bytes, _b_.bytearray])){
            throw TypeError.$factory(
                "int() can't convert non-string with explicit base")
        }
    }

    if(_b_.isinstance(value, _b_.complex)){
        throw TypeError.$factory("can't convert complex to int")
    }
    var $ns = $B.args("int", 2, {x:null, base:null}, ["x", "base"], arguments,
        {"base": 10}, null, null),
        value = $ns["x"],
        base = $ns["base"]

    if(_b_.isinstance(value, _b_.float) && base == 10){
        if(value < $B.min_int || value > $B.max_int){
            return $B.long_int.$from_float(value)
        }
        else{return value > 0 ? Math.floor(value) : Math.ceil(value)}
    }

    if(! (base >=2 && base <= 36)){
        // throw error (base must be 0, or 2-36)
        if(base != 0){throw _b_.ValueError.$factory("invalid base")}
    }

    if(typeof value == "number"){

        if(base == 10){
           if(value < $B.min_int || value > $B.max_int){
               return $B.long_int.$factory(value)
           }
           return value
        }else if(value.toString().search("e") > -1){
            // can't convert to another base if value is too big
            throw _b_.OverflowError.$factory("can't convert to base " + base)
        }else{
            var res = parseInt(value, base)
            if(value < $B.min_int || value > $B.max_int){
                return $B.long_int.$factory(value, base)
            }
            return res
        }
    }

    if(value === true){return Number(1)}
    if(value === false){return Number(0)}
    if(value.__class__ === $B.long_int){
        var z = parseInt(value.value)
        if(z > $B.min_int && z < $B.max_int){return z}
        else{return value}
    }

    base = $B.$GetInt(base)
    function invalid(value, base){
        throw _b_.ValueError.$factory("invalid literal for int() with base " +
            base + ": '" + _b_.str.$factory(value) + "'")
    }

    if(_b_.isinstance(value, _b_.str)){value = value.valueOf()}
    if(typeof value == "string") {
        var _value = value.trim()    // remove leading/trailing whitespace
        if(_value.length == 2 && base == 0 &&
                (_value == "0b" || _value == "0o" || _value == "0x")){
           throw _b_.ValueError.$factory("invalid value")
        }
        if(_value.length >2) {
            var _pre = _value.substr(0, 2).toUpperCase()
            if(base == 0){
                if(_pre == "0B"){base = 2}
                if(_pre == "0O"){base = 8}
                if(_pre == "0X"){base = 16}
            }else if(_pre == "0X" && base != 16){invalid(_value, base)}
            else if(_pre == "0O" && base != 8){invalid(_value, base)}
            else if(_pre == "0B" && base != 2){invalid(_value, base)
            }
            if(_pre == "0B" || _pre == "0O" || _pre == "0X"){
                _value = _value.substr(2)
                while(_value.startsWith("_")){
                    _value = _value.substr(1)
                }
            }
        }else if(base == 0){
            // eg int("1\n", 0)
            base = 10
        }
        var _digits = $valid_digits(base),
            _re = new RegExp("^[+-]?[" + _digits + "]" +
            "[" + _digits + "_]*$", "i"),
            match = _re.exec(_value)
        if(match === null){
            invalid(value, base)
        }else{
            value = _value.replace(/_/g, "")
        }
        if(base <= 10 && ! isFinite(value)){invalid(_value, base)}
        var res = parseInt(value, base)
        if(res < $B.min_int || res > $B.max_int){
            return $B.long_int.$factory(value, base)
        }
        return res
    }

    if(_b_.isinstance(value, [_b_.bytes, _b_.bytearray])){
        return int.$factory($B.$getattr(value, "decode")("latin-1"), base)
    }
    var $int = $B.$getattr(value, "__int__", _b_.None)
    if($int !== _b_.None){return $int()}

    var $index = $B.$getattr(value, "__index__", _b_.None)
    if($index !== _b_.None){return $index()}

    var $trunc = $B.$getattr(value, "__trunc__", _b_.None)
    if($trunc !== _b_.None){
        var res = $truc(),
            int_func = $int
        if(int_func === _b_.None){
            throw _b_.TypeError.$factory("__trunc__ returned non-Integral (type "+
                $B.class_name(res) + ")")
        }
        var res = int_func()
        if(_b_.isinstance(res, int)){return int_value(res)}
        throw _b_.TypeError.$factory("__trunc__ returned non-Integral (type "+
                $B.class_name(res) + ")")
    }
    throw _b_.TypeError.$factory(
        "int() argument must be a string, a bytes-like " +
        "object or a number, not '" + $B.class_name(value) + "'")
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
            var missing = {},
                bool_func = $B.$getattr(obj, "__bool__", missing)
            if(bool_func === missing){
                try{return $B.$getattr(obj, "__len__")() > 0}
                catch(err){return true}
            }else{
                return bool_func()
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
    $native: true
}

var methods = $B.op2method.subset("operations", "binary", "comparisons",
        "boolean")
for(var op in methods){
    var method = "__" + methods[op] + "__"
    bool[method] = (function(op){
        return function(self, other){
            var value = self ? 1 : 0
            if(int[op] !== undefined){
                return int[op](value, other)
            }
        }
    })(method)
}

bool.__and__ = function(self, other){
    return $B.$bool(int.__and__(self, other))
}

bool.__hash__ = bool.__index__ = bool.__int__ = function(self){
   if(self.valueOf()) return 1
   return 0
}

bool.__neg__ = function(self){return -$B.int_or_bool(self)}

bool.__or__ = function(self, other){
    return $B.$bool(int.__or__(self, other))
}

bool.__pos__ = $B.int_or_bool

bool.__repr__ = bool.__str__ = function(self){
    return self ? "True" : "False"
}

bool.__setattr__ = function(self, attr){
    if(_b_.dir(self).indexOf(attr) > -1){
        var msg = "attribute '" + attr + "' of 'int' objects is not writable"
    }else{
        var msg = "'bool' object has no attribute '" + attr + "'"
    }
    throw _b_.AttributeError.$factory(msg)
}

bool.__xor__ = function(self, other) {
    return self.valueOf() != other.valueOf()
}

bool.$factory = function(){
    // Calls $B.$bool, which is used inside the generated JS code and skips
    // arguments control.
    var $ = $B.args("bool", 1, {x: null}, ["x"],
        arguments,{x: false}, null, null)
    return $B.$bool($.x)
}

_b_.bool = bool

$B.set_func_names(bool, "builtins")

})(__BRYTHON__)
