;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

var object = _b_.object

function $err(op, other){
    var msg = "unsupported operand type(s) for " + op +
        ": 'float' and '" + $B.get_class(other).__name__ + "'"
    throw _b_.TypeError.$factory(msg)
}

// dictionary for built-in class 'float'
var float = {
    __class__: _b_.type,
    __dir__: object.__dir__,
    __name__: "float",
    $is_class: true,
    $native: true,
    $descriptors: {
        "numerator": true,
        "denominator": true,
        "imag": true,
        "real": true
    }
}

float.numerator = function(self){return self}
float.denominator = function(self){return _b_.int.$factory(1)}
float.imag = function(self){return _b_.int.$factory(0)}
float.real = function(self){return self}
float.__float__ = function(self){return self}

float.as_integer_ratio = function(self) {
    if(self.valueOf() == Number.POSITIVE_INFINITY ||
            self.valueOf() == Number.NEGATIVE_INFINITY){
        throw _b_.OverflowError.$factory("Cannot pass infinity to " +
            "float.as_integer_ratio.")
    }
    if(! Number.isFinite(self.valueOf())){
        throw _b_.ValueError.$factory("Cannot pass NaN to " +
            "float.as_integer_ratio.")
    }

    var tmp = _b_.$frexp(self.valueOf()),
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

    numerator = float.$factory(fp)
    py_exponent = abs(exponent)
    denominator = 1

    py_exponent = _b_.getattr(_b_.int.$factory(denominator),
        "__lshift__")(py_exponent)
    if(exponent > 0){
        numerator = numerator * py_exponent
    }else{
        denominator = py_exponent
    }

    return _b_.tuple.$factory([_b_.int.$factory(numerator),
        _b_.int.$factory(denominator)])
}

float.__bool__ = function(self){return _b_.bool.$factory(self.valueOf())}

float.__eq__ = function(self, other){
    if(isNaN(self) && isNaN(other)){return false}
    if(isinstance(other, _b_.int)){return self == other}
    if(isinstance(other, float)) {
      // new Number(1.2) == new Number(1.2) returns false !!!
      return self.valueOf() == other.valueOf()
    }
    if(isinstance(other, _b_.complex)){
      if (other.$imag != 0){return false}
      return self == other.$real
    }

    if(_b_.hasattr(other, "__eq__")){
       return _b_.getattr(other, "__eq__")(self.value)
    }

    return self.value === other
}

float.__floordiv__ = function(self, other){
    if(isinstance(other,[_b_.int, float])){
      if(other.valueOf() == 0){
          throw ZeroDivisionError.$factory('division by zero')
      }
      return float.$factory(Math.floor(self / other))
    }
    if(hasattr(other, "__rfloordiv__")) {
      return getattr(other, "__rfloordiv__")(self)
    }
    $err("//", other)
}

float.fromhex = function(arg){
   // [sign] ['0x'] integer ['.' fraction] ['p' exponent]

   if(! isinstance(arg, _b_.str)){
      throw _b_.ValueError.$factory("argument must be a string")
   }

   var value = arg.trim()   // remove leading and trailing whitespace
   switch(value.toLowerCase()) {
      case "+inf":
      case "inf":
      case "+infinity":
      case "infinity":
          return $FloatClass(Infinity)
      case "-inf":
      case "-infinity":
          return $FloatClass(-Infinity)
      case "+nan":
      case "nan":
          return $FloatClass(Number.NaN)
      case "-nan":
          return $FloatClass(-Number.NaN)
      case "":
          throw _b_.ValueError.$factory("could not convert string to float")
   }

   var _m = /^(\d*\.?\d*)$/.exec(value)

   if(_m !== null){return $FloatClass(parseFloat(_m[1]))}

   // lets see if this is a hex string.
   var _m = /^(\+|-)?(0x)?([0-9A-F]+\.?)?(\.[0-9A-F]+)?(p(\+|-)?\d+)?$/i.exec(value)

   if(_m == null){
       throw _b_.ValueError.$factory("invalid hexadecimal floating-point string")
   }

   var _sign = _m[1],
       _int = parseInt(_m[3] || '0', 16),
       _fraction = _m[4] || '.0',
       _exponent = _m[5] || 'p0'

   if(_sign == "-"){_sign = -1}else{_sign = 1}

   var _sum = _int

   for(var i = 1, len = _fraction.length; i < len; i++){
       _sum += parseInt(_fraction.charAt(i), 16) / Math.pow(16, i)
   }
   return new Number(_sign * _sum * Math.pow(2,
       parseInt(_exponent.substring(1))))
}

float.__getformat__ = function(arg){
    if(arg == "double" || arg == "float"){return "IEEE, little-endian"}
    throw _b_.ValueError.$factory("__getformat__() argument 1 must be " +
        "'double' or 'float'")
}

function preformat(self, fmt){
    if(fmt.empty){return _b_.str.$factory(self)}
    if(fmt.type && 'eEfFgGn%'.indexOf(fmt.type) == -1){
        throw _b_.ValueError.$factory("Unknown format code '" + fmt.type +
            "' for object of type 'float'")
    }
    if(isNaN(self)){
        if(fmt.type == "f" || fmt.type == "g"){return "nan"}
        else{return "NAN"}
    }
    if(self == Number.POSITIVE_INFINITY){
        if(fmt.type == "f" || fmt.type == "g"){return "inf"}
        else{return "INF"}
    }
    if(fmt.precision === undefined && fmt.type !== undefined){
        fmt.precision = 6
    }
    if(fmt.type == "%"){self *= 100}

    if(fmt.type == "e"){
        var res = self.toExponential(fmt.precision),
            exp = parseInt(res.substr(res.search("e") + 1))
            if(Math.abs(exp) < 10){
                res = res.substr(0, res.length - 1) + "0" +
                    res.charAt(res.length - 1)
            }
        return res
    }

    if(fmt.precision !== undefined){
        // Use Javascript toFixed to get the correct result
        // The argument of toFixed is the number of digits after .
        var prec = fmt.precision
        if(prec == 0){return Math.round(self) + ""}
        var res = self.toFixed(prec),
            pt_pos = res.indexOf(".")
        if(fmt.type !== undefined &&
                (fmt.type == "%" || fmt.type.toLowerCase() == "f")){
            if(pt_pos == -1){res += "." + "0".repeat(fmt.precision)}
            else{
                var missing = fmt.precision - res.length + pt_pos + 1
                if(missing > 0){res += "0".repeat(missing)}
            }
        }else{
            var res1 = self.toExponential(fmt.precision - 1),
                exp = parseInt(res1.substr(res1.search("e") + 1))
            if(exp < -4 || exp >= fmt.precision - 1){
                res = res1
                if(Math.abs(exp) < 10){
                    res = res.substr(0, res.length - 1) + "0" +
                        res.charAt(res.length - 1)
                }
            }
        }
    }else{var res = _b_.str.$factory(self)}

    if(fmt.type === undefined|| "gGn".indexOf(fmt.type) != -1){
        // remove trailing 0
        while(res.charAt(res.length - 1) == "0"){
            res = res.substr(0, res.length - 1)
        }
        if(res.charAt(res.length - 1) == "."){
            if(fmt.type === undefined){res += "0"}
            else{res = res.substr(0, res.length - 1)}
        }
    }
    if(fmt.sign !== undefined){
        if((fmt.sign == " " || fmt.sign == "+" ) && self > 0){
            res = fmt.sign + res
        }
    }
    if(fmt.type == "%"){res += "%"}

    return res
}

float.__format__ = function(self, format_spec) {
    var fmt = new $B.parse_format_spec(format_spec)
    fmt.align = fmt.align || ">"
    var raw = preformat(self, fmt).split('.'),
        _int = raw[0]
    if(fmt.comma){
        var len = _int.length, nb = Math.ceil(_int.length / 3), chunks = []
        for(var i = 0; i < nb; i++){
            chunks.push(_int.substring(len - 3 * i - 3, len - 3 * i))
        }
        chunks.reverse()
        raw[0] = chunks.join(",")
    }
    return $B.format_width(raw.join("."), fmt)
}

float.__hash__ = function(self) {
    if(self === undefined){
       return float.__hashvalue__ || $B.$py_next_hash--  // for hash of float type (not instance of int)
    }

    var _v = self.valueOf()
    if(_v === Infinity){return 314159}
    if(_v === -Infinity){return -271828}
    if(isNaN(_v)){return 0}
    // for integers, return the value
    if(_v == Math.round(_v)){return Math.round(_v)}

    var r = _b_.$frexp(_v)
    r[0] *= Math.pow(2, 31)
    var hipart = _b_.int.$factory(r[0])
    r[0] = (r[0] - hipart) * Math.pow(2, 31)
    var x = hipart + _b_.int.$factory(r[0]) + (r[1] << 15)
    return x & 0xFFFFFFFF
}

_b_.$isninf = function(x) {
    var x1 = x
    if(isinstance(x, float)){x1 = x.valueOf()}
    return x1 == -Infinity || x1 == Number.NEGATIVE_INFINITY
}

_b_.$isinf = function(x) {
    var x1 = x
    if(isinstance(x, float)){x1 = x.valueOf()}
    return x1 == Infinity || x1 == -Infinity ||
        x1 == Number.POSITIVE_INFINITY || x1 == Number.NEGATIVE_INFINITY
}


_b_.$fabs = function(x){return x > 0 ? float.$factory(x) : float.$factory(-x)}

_b_.$frexp = function(x){
    var x1 = x
    if(isinstance(x, float)){x1 = x.valueOf()}

    if(isNaN(x1) || _b_.$isinf(x1)){return [x1, -1]}
    if (x1 == 0){return [0, 0]}

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

_b_.$ldexp = function(x, i) {
    if(_b_.$isninf(x)){return float.$factory('-inf')}
    if(_b_.$isinf(x)){return float.$factory('inf')}

    var y = x
    if(isinstance(x, float)){y = x.valueOf()}
    if(y == 0){return y}

    var j = i
    if(isinstance(i, float)){j = i.valueOf()}
    return y * Math.pow(2, j)
}

float.hex = function(self) {
    // http://hg.python.org/cpython/file/d422062d7d36/Objects/floatobject.c
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

    var _a = _b_.$frexp(_b_.$fabs(self.valueOf())),
        _m = _a[0],
        _e = _a[1],
        _shift = 1 - Math.max(-1021 - _e, 0)

    _m = _b_.$ldexp(_m, _shift)
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
    self.valueOf = function(){return value.valueOf()}
    self.toString = function(){return value + ""}
    return _b_.None
}

float.__int__ = function(self){return parseInt(self)}

float.is_integer = function(self) {return _b_.int.$factory(self) == self}

float.__mod__ = function(self, other) {
    // can't use Javascript % because it works differently for negative numbers
    if(other == 0){throw ZeroDivisionError.$factory("float modulo")}
    if(isinstance(other, _b_.int)){
        return new Number((self % other + other) % other)
    }

    if(isinstance(other, float)){
        // use truncated division
        // cf https://en.wikipedia.org/wiki/Modulo_operation
        var q = Math.floor(self / other),
            r = self - other * q
        return new Number(r)
    }
    if(isinstance(other, bool)){
        var bool_value = 0
        if(other.valueOf()){bool_value = 1}
        return new Number((self % bool_value + bool_value) % bool_value)
    }
    if(hasattr(other, "__rmod__")){return getattr(other, "__rmod__")(self)}
    $err("%", other)
}

float.__mro__ = [object]

float.__mul__ = function(self, other){
    if(isinstance(other, _b_.int)){
        if(other.__class__ == $B.long_int){
            return new Number(self * parseFloat(other.value))
        }
        return new Number(self * other)
    }
    if(isinstance(other,float)){return new Number(self * other)}
    if(isinstance(other, bool)){
      var bool_value = 0
      if(other.valueOf()){bool_value = 1}
      return new Number(self * bool_value)
    }
    if(isinstance(other, _b_.complex)){
      return $B.make_complex(float.$factory(self * other.$real),
          float.$factory(self * other.$imag))
    }
    if(hasattr(other, "__rmul__")){return getattr(other,"__rmul__")(self)}
    $err("*", other)
}

float.__ne__ = function(self, other){return ! float.__eq__(self, other)}

float.__neg__ = function(self, other){return float.$factory(-self)}

float.__pos__ = function(self){return self}

float.__pow__ = function(self, other){
    var other_int = isinstance(other, _b_.int)
    if(other_int || isinstance(other, float)){
        if(self == 1){return self} // even for Infinity or NaN
        if(other == 0){return new Number(1)}

        if(self == -1 &&
                (! isFinite(other) || other.__class__ === $B.long_int ||
                     ! $B.is_safe_int(other)) &&
                ! isNaN(other)){
            return new Number(1)
        }else if(self == 0 && isFinite(other) && other < 0){
            throw _b_.ZeroDivisionError.$factory("0.0 cannot be raised " +
              "to a negative power")
        }else if(self == Number.NEGATIVE_INFINITY && ! isNaN(other)){
            if(other < 0 && other % 2 == 1){
                return new Number(-0.0)
            }else if(other < 0){return new Number(0)}
            else if(other > 0 && other % 2 == 1){
                return Number.NEGATIVE_INFINITY
            }else{return Number.POSITIVE_INFINITY}
        }else if(self == Number.POSITIVE_INFINITY && ! isNaN(other)){
            return other > 0 ? self : new Number(0)
        }
        if(other == Number.NEGATIVE_INFINITY && ! isNaN(self)){
            return Math.abs(self) < 1 ? Number.POSITIVE_INFINITY :
                new Number(0)
        }else if(other == Number.POSITIVE_INFINITY  && ! isNaN(self)){
            return Math.abs(self) < 1 ? new Number(0) :
                Number.POSITIVE_INFINITY
        }
        if(self < 0 &&
                ! _b_.getattr(other, "__eq__")(_b_.int.$factory(other))){
            // use complex power
            return _b_.complex.__pow__($B.make_complex(self, 0), other)
        }
        return float.$factory(Math.pow(self, other))
    }else if(isinstance(other, _b_.complex)){
        var preal = Math.pow(self, other.$real),
            ln = Math.log(self)
        return $B.make_complex(preal * Math.cos(ln), preal * Math.sin(ln))
    }
    if(hasattr(other, "__rpow__")){return getattr(other, "__rpow__")(self)}
    $err("** or pow()", other)
}

float.__repr__ = float.__str__ = function(self){
    if(self === float){return "<class 'float'>"}
    if(self.valueOf() == Infinity){return 'inf'}
    if(self.valueOf() == -Infinity){return '-inf'}
    if(isNaN(self.valueOf())){return 'nan'}

    var res = self.valueOf() + "" // coerce to string
    if(res.indexOf(".") == -1){res += ".0"}
    return _b_.str.$factory(res)
}

float.__setattr__ = function(self, attr, value){
    if(self.constructor === Number){
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
    return $N
}

float.__truediv__ = function(self, other){
    if(isinstance(other, [_b_.int, float])){
        if(other.valueOf() == 0){
            throw ZeroDivisionError.$factory("division by zero")
        }
        return float.$factory(self/other)
    }
    if(isinstance(other, _b_.complex)){
        var cmod = other.$real * other.$real + other.$imag * other.$imag
        if(cmod == 0){throw ZeroDivisionError.$factory("division by zero")}

        return $B.make_complex(float.$factory(self * other.$real / cmod),
                           float.$factory(-self * other.$imag / cmod))
    }
    if(hasattr(other, "__rtruediv__")){
        return getattr(other, "__rtruediv__")(self)
    }
    $err("/",other)
}

// operations
var $op_func = function(self, other){
    if(isinstance(other, _b_.int)){
        if(typeof other == "boolean"){
            return other ? self - 1 : self
        }else if(other.__class__ === $B.long_int){
            return float.$factory(self - parseInt(other.value))
        }else{return float.$factory(self - other)}
    }
    if(isinstance(other, float)){return float.$factory(self - other)}
    if(isinstance(other, bool)){
        var bool_value = 0
        if(other.valueOf()){bool_value = 1}
        return float.$factory(self - bool_value)
    }
    if(isinstance(other, _b_.complex)){
        return $B.make_complex(self - other.$real, -other.$imag)
    }
    if(hasattr(other, "__rsub__")){return getattr(other, "__rsub__")(self)}
    $err("-", other)
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
    if(isinstance(other, _b_.int)){
        if(other.__class__ === $B.long_int){
            return self > parseInt(other.value)
        }
        return self > other.valueOf()
    }
    if(isinstance(other,float)){return self > other}

    if(isinstance(other, bool)) {
      return self.valueOf() > bool.__hash__(other)
    }
    if(hasattr(other, "__int__") || hasattr(other, "__index__")) {
       return _b_.int.__gt__(self, $B.$GetInt(other))
    }

    // See if other has the opposite operator, eg <= for >
    var inv_op = getattr(other, "__le__", None)
    if(inv_op !== None){return inv_op(self)}

    // See if other has the opposite operator, eg <= for >
    var inv_op = getattr(other, "__le__", None)
    if(inv_op !== None){return inv_op(self)}

    throw _b_.TypeError.$factory(
        "unorderable types: float() > " + $B.get_class(other).__name__ + "()")
}

$comp_func += "" // source code
for(var $op in $B.$comps){
    eval("float.__" + $B.$comps[$op] + "__ = "+
          $comp_func.replace(/>/gm, $op).
              replace(/__gt__/gm, "__" + $B.$comps[$op] + "__").
              replace(/__le__/, "__" + $B.$inv_comps[$op] + "__"))
}

// add "reflected" methods
$B.make_rmethods(float)

// unsupported operations
var $notimplemented = function(self, other){
    throw _b_.TypeError.$factory(
        "unsupported operand types for OPERATOR: 'float' and '" +
            $B.get_class(other).__name__ + "'")
}
$notimplemented += "" // coerce to string
for(var $op in $B.$operators){
    // use __add__ for __iadd__ etc, so don't define __iadd__ below
    if($B.augmented_assigns[$op] === undefined){
        var $opfunc = "__" + $B.$operators[$op] + "__"
        if(float[$opfunc] === undefined){
            eval("float." + $opfunc + "=" +
                $notimplemented.replace(/OPERATOR/gm, $op))
        }
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

// constructor for built-in class 'float'
float.$factory = function (value){
    switch(value) {
        case undefined:
            return $FloatClass(0.0)
        case Number.MAX_VALUE:
            //take care of 'inf not identical to 1.797...e+308' error
            return $FloatClass(Infinity)
        case -Number.MAX_VALUE:
            return $FloatClass(-Infinity)
        case true:
            return new Number(1)
        case false:
            return new Number(0)
    }

    if(typeof value == "number"){return new Number(value)}
    if(isinstance(value, float)){return value}
    if(isinstance(value, bytes)){
      var s = getattr(value, "decode")("latin-1")
      return float.$factory(getattr(value, "decode")("latin-1"))
    }
    if(hasattr(value, "__float__")){
      return $FloatClass(getattr(value, "__float__")())
    }
    if(typeof value == "string"){
       value = value.trim()   // remove leading and trailing whitespace
       switch(value.toLowerCase()) {
           case "+inf":
           case "inf":
           case "+infinity":
           case "infinity":
               return Number.POSITIVE_INFINITY
           case "-inf":
           case "-infinity":
               return Number.NEGATIVE_INFINITY
           case "+nan":
           case "nan":
               return Number.NaN
           case "-nan":
               return -Number.NaN
           case "":
               throw _b_.ValueError.$factory("count not convert string to float")
           default:
               value = value.charAt(0) + value.substr(1).replace(/_/g, "") // PEP 515
               value = to_digits(value) // convert arabic-indic digits to latin
               if (isFinite(value)) return $FloatClass(eval(value))
               else {
                   _b_.str.encode(value, "latin-1") // raises UnicodeEncodeError if not valid
                   throw _b_.ValueError.$factory(
                       "Could not convert to float(): '" +
                       _b_.str.$factory(value) + "'")
               }
         }
    }
    throw _b_.TypeError.$factory("float() argument must be a string or a " +
        "number, not '" + $B.get_class(value).__name__ + "'")
}

float.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory("float.__new__(): not enough arguments")
    }
    return {__class__: cls}
}

$B.$FloatClass = $FloatClass

$B.set_func_names(float, "builtins")

// Dictionary and factory for subclasses of float
var FloatSubclass = $B.FloatSubclass  = {
    __class__: _b_.type,
    __mro__: [object],
    __name__: "float",
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
})(__BRYTHON__)
