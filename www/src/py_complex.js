;(function($B){

var _b_ = $B.builtins

function $UnsupportedOpType(op, class1, class2){
    throw _b_.TypeError.$factory("unsupported operand type(s) for " +
        op + ": '" + class1 + "' and '" + class2 + "'")
}

var complex = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    $infos: {
        __module__: "builtins",
        __name__: "complex"
    },
    $is_class: true,
    $native: true,
    $descriptors: {real: true, imag: true}
}

complex.__abs__ = function(self){
    var _rf = isFinite(self.$real),
        _if = isFinite(self.$imag)
    if((_rf && isNaN(self.$imag)) || (_if && isNaN(self.$real)) ||
        (isNaN(self.$imag) && isNaN(self.$real))){return NaN}
    if(! _rf || ! _if){return Infinity}
    var mag = Math.sqrt(Math.pow(self.$real,2) + Math.pow(self.$imag,2))
    if(!isFinite(mag) && _rf && _if){
        // In these circumstances Math.hypot quietly returns inf, but Python
        // should raise.
        // See https://hg.python.org/jython/rev/69826acfb4a9
        throw _b_.OverflowError.$factory("absolute value too large")
    }
    return mag
}

complex.__bool__ = function(self){
    return (self.$real != 0 || self.$imag != 0)
}

complex.__eq__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        return self.$real.valueOf() == other.$real.valueOf() &&
            self.$imag.valueOf() == other.$imag.valueOf()
    }
    if(_b_.isinstance(other, _b_.int)){
        if(self.$imag != 0){return false}
        return self.$real == other.valueOf()
    }
    if(_b_.isinstance(other, _b_.float)){
      if(self.$imag != 0){return false}
      return self.$real == other.valueOf()
    }
    return _b_.NotImplemented
}

complex.__floordiv__ = function(self,other){
    $UnsupportedOpType("//", "complex", $B.get_class(other))
}

complex.__hash__ = function(self){
    // this is a quick fix for something like 'hash(complex)', where
    // complex is not an instance but a type
    return self.$imag * 1000003 + self.$real
}

complex.__init__ = function() {
    return _b_.None
}

complex.__invert__ = function(self){return ~self}

complex.__mod__ = function(self, other) {
    throw _b_.TypeError.$factory("TypeError: can't mod complex numbers.")
}

complex.__mro__ = [_b_.object]

complex.__mul__ = function(self, other){
    if(_b_.isinstance(other, complex)){
      return make_complex(self.$real * other.$real - self.$imag * other.$imag,
          self.$imag * other.$real + self.$real * other.$imag)
    }else if(_b_.isinstance(other, _b_.int)){
      return make_complex(self.$real * other.valueOf(),
          self.$imag * other.valueOf())
    }else if(_b_.isinstance(other, _b_.float)){
      return make_complex(self.$real * other, self.$imag * other)
    }else if(_b_.isinstance(other, _b_.bool)){
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
    return make_complex(-self.$real, -self.$imag)
}

complex.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory('complex.__new__(): not enough arguments')
    }
    var res,
        missing = {},
        args = $B.args("complex", 3, {cls: null, real: null, imag: null},
            ["cls", "real", "imag"], arguments, {real: 0, imag: missing},
            null, null),
        $real = args.real,
        $imag = args.imag

    if(typeof $real == "string"){
        if($imag !== missing){
            throw _b_.TypeError.$factory("complex() can't take second arg " +
                "if first is a string")
        }else{
            var arg = $real
            $real = $real.trim()
            if($real.startsWith("(") && $real.endsWith(")")){
                $real = $real.substr(1)
                $real = $real.substr(0, $real.length - 1)
            }
            // Regular expression for literal complex string. Includes underscores
            // for PEP 515
            var complex_re = /^\s*([\+\-]*[0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)([\+\-]?)([0-9_]*\.?[0-9_]*(e[\+\-]*[0-9_]*)?)(j?)\s*$/i

            var parts = complex_re.exec($real)

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
            }else if(parts[_real] == "." || parts[_imag] == "." ||
                    parts[_real] == ".e" || parts[_imag] == ".e" ||
                    parts[_real] == "e" || parts[_imag] == "e"){
                throw _b_.ValueError.$factory("complex() arg is a malformed string")
            }else if(parts[_j] != ""){
                if(parts[_sign] == ""){
                    $real = 0
                    if(parts[_real] == "+" || parts[_real] == ""){
                        $imag = 1
                    }else if (parts[_real] == '-'){
                        $imag = -1
                    }else{$imag = to_num(parts[_real])}
                }else{
                    $real = to_num(parts[_real])
                    $imag = parts[_imag] == "" ? 1 : to_num(parts[_imag])
                    $imag = parts[_sign] == "-" ? -$imag : $imag
                }
            }else{
                $real = to_num(parts[_real])
                $imag = 0
            }
            res = {
                __class__: complex,
                $real: $real || 0,
                $imag: $imag || 0
            }
            return res
        }
    }

    // If first argument is not a string, the second argument defaults to 0
    $imag = $imag === missing ? 0 : $imag

    if(arguments.length == 1 && $real.__class__ === complex && $imag == 0){
        return $real
    }
    if((_b_.isinstance($real, _b_.float) || _b_.isinstance($real, _b_.int)) &&
            (_b_.isinstance($imag, _b_.float) || _b_.isinstance($imag, _b_.int))){
        res = {
            __class__: complex,
            $real: $real,
            $imag: $imag
        }
        return res
    }

    $real = _convert($real)
    $imag = _convert($imag)
    if(! _b_.isinstance($real, _b_.float) && ! _b_.isinstance($real, _b_.int) &&
            ! _b_.isinstance($real, _b_.complex)){
        throw _b_.TypeError.$factory("complex() argument must be a string " +
            "or a number")
    }
    if(typeof $imag == "string"){
        throw _b_.TypeError.$factory("complex() second arg can't be a string")
    }
    if(! _b_.isinstance($imag, _b_.float) && ! _b_.isinstance($imag, _b_.int) &&
            ! _b_.isinstance($imag, _b_.complex) && $imag !== missing){
        throw _b_.TypeError.$factory("complex() argument must be a string " +
            "or a number")
    }
    $imag = complex.__mul__(complex.$factory("1j"), $imag)
    return complex.__add__($imag, $real)
}

complex.__pos__ = function(self){return self}

function complex2expo(cx){
    var norm = Math.sqrt((cx.$real * cx.$real) + (cx.$imag * cx.$imag)),
        sin = cx.$imag / norm,
        cos = cx.$real / norm,
        angle

    if(cos == 0){angle = sin == 1 ? Math.PI / 2 : 3 * Math.PI / 2}
    else if(sin == 0){angle = cos == 1 ? 0 : Math.PI}
    else{angle = Math.atan(sin / cos)}
    return {norm: norm, angle: angle}
}

complex.__pow__ = function(self, other){
    // complex power : use Moivre formula
    // (cos(x) + i sin(x))**y = cos(xy)+ i sin(xy)
    var exp = complex2expo(self),
        angle = exp.angle,
        res = Math.pow(exp.norm, other)

    if(_b_.isinstance(other, [_b_.int, _b_.float])){
        return make_complex(res * Math.cos(angle * other),
            res * Math.sin(angle * other))
    }else if(_b_.isinstance(other, complex)){
        // (r*e**Ai)**(x+iy) = (e**iAx)*(e**-Ay)
        var x = other.$real,
            y = other.$imag
        var pw = Math.pow(exp.norm, x) * Math.pow(Math.E, -y * angle),
            theta = y * Math.log(exp.norm) - x * angle
        return make_complex(pw * Math.cos(theta), pw * Math.sin(theta))
    }else{
        throw _b_.TypeError.$factory("unsupported operand type(s) " +
            "for ** or pow(): 'complex' and '" +
            $B.class_name(other) + "'")
    }
}

complex.__str__ = complex.__repr__ = function(self){
    if(self.$real == 0){
        if(1 / self.$real < 0){
            if(self.$imag < 0){
                return "(-0" + self.$imag + "j)"
            }else if(self.$imag == 0 && 1 / self.$imag < 0){
                return "(-0-" + self.$imag + "j)"
            }else return "(-0+" + self.$imag + "j)"
        }else{
            if(self.$imag == 0 && 1 / self.$imag < 0){
                return "-" + self.$imag + "j"
            }else{return self.$imag + "j"}
        }
    }
    if(self.$imag > 0){return "(" + self.$real + "+" + self.$imag + "j)"}
    if(self.$imag == 0){
        if(1 / self.$imag < 0){
            return "(" + self.$real + "-" + self.$imag + "j)"
        }
        return "(" + self.$real + "+" + self.$imag + "j)"
    }
    return "(" + self.$real + "-" + (-self.$imag) + "j)"
}

complex.__sqrt__ = function(self) {
  if(self.$imag == 0){return complex(Math.sqrt(self.$real))}

  var r = self.$real,
      i = self.$imag,
      _a = Math.sqrt((r + sqrt) / 2),
      _b = Number.sign(i) * Math.sqrt((-r + sqrt) / 2)

  return make_complex(_a, _b)
}

complex.__truediv__ = function(self, other){
    if(_b_.isinstance(other, complex)){
        if(other.$real == 0 && other.$imag == 0){
           throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        var _num = self.$real * other.$real + self.$imag * other.$imag,
            _div = other.$real * other.$real + other.$imag * other.$imag

        var _num2 = self.$imag * other.$real - self.$real * other.$imag

        return make_complex(_num / _div, _num2 / _div)
    }
    if(_b_.isinstance(other, _b_.int)){
        if(! other.valueOf()){
            throw _b_.ZeroDivisionError.$factory('division by zero')
        }
        return complex.__truediv__(self, complex.$factory(other.valueOf()))
    }
    if(_b_.isinstance(other, _b_.float)){
        if(! other.valueOf()){
            throw _b_.ZeroDivisionError.$factory("division by zero")
        }
        return complex.__truediv__(self, complex.$factory(other.valueOf()))
    }
    $UnsupportedOpType("//", "complex", other.__class__)
}

complex.conjugate = function(self) {
    return make_complex(self.$real, -self.$imag)
}

// operators
var $op_func = function(self, other){
    throw _b_.TypeError.$factory("TypeError: unsupported operand type(s) " +
        "for -: 'complex' and '" + $B.class_name(other) + "'")
}
$op_func += "" // source code
var $ops = {"&": "and", "|": "ior", "<<": "lshift", ">>": "rshift",
    "^": "xor"}
for(var $op in $ops){
    eval("complex.__" + $ops[$op] + "__ = " + $op_func.replace(/-/gm, $op))
}

complex.__ior__ = complex.__or__

// operations
var $op_func = function(self, other){
    if(_b_.isinstance(other, complex)){
        return make_complex(self.$real - other.$real, self.$imag - other.$imag)
    }
    if(_b_.isinstance(other, _b_.int)){
        return make_complex($B.sub(self.$real,other.valueOf()), self.$imag)
    }
    if(_b_.isinstance(other, _b_.float)){
        return make_complex(self.$real - other.valueOf(), self.$imag)
    }
    if(_b_.isinstance(other, _b_.bool)){
         var bool_value = 0
         if(other.valueOf()){bool_value = 1}
         return make_complex(self.$real - bool_value, self.$imag)
    }
    throw _b_.TypeError.$factory("unsupported operand type(s) for -: " +
        self.__repr__() + " and '" + $B.class_name(other) + "'")
}
complex.__sub__ = $op_func

$op_func += '' // source code
$op_func = $op_func.replace(/-/gm, "+").replace(/sub/gm, "add")
eval("complex.__add__ = " + $op_func)

// comparison methods
var $comp_func = function(self, other){
    if(other === undefined || other == _b_.None){
        return _b_.NotImplemented
    }
    throw _b_.TypeError.$factory("TypeError: no ordering relation " +
        "is defined for complex numbers")
}
$comp_func += '' // source code
for(var $op in $B.$comps){
    eval("complex.__" + $B.$comps[$op] + "__ = " +
        $comp_func.replace(/>/gm, $op))
}

// add "reflected" methods
$B.make_rmethods(complex)

// Descriptors to return real and imag
complex.real = function(self){return new Number(self.$real)}
complex.real.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
}
complex.imag = function(self){return new Number(self.$imag)}
complex.imag.setter = function(){
    throw _b_.AttributeError.$factory("readonly attribute")
}

var _real = 1,
    _real_mantissa = 2,
    _sign = 3,
    _imag = 4,
    _imag_mantissa = 5,
    _j = 6
var type_conversions = ["__complex__", "__float__", "__int__"]
var _convert = function(num){
    for(var i = 0; i < type_conversions.length; i++) {
        var missing = {},
            tc = getattr(num, type_conversions[i], missing)
        if(tc !== missing){
            return tc()
        }
    }
    return num
}

var make_complex = $B.make_complex = function(real, imag){
    return {
        __class__: complex,
        $real: real,
        $imag: imag
    }
}

complex.$factory = function(){
    return complex.__new__(complex, ...arguments)
}

$B.set_func_names(complex, "builtins")

_b_.complex = complex

})(__BRYTHON__)
