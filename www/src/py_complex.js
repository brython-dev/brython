;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

function $UnsupportedOpType(op,class1,class2){
    throw _b_.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}

var $ComplexDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'complex',
    $native:true,
    descriptors:{real:true, imag:true}
}

$ComplexDict.__abs__ = function(self){
    var _rf = isFinite(self.$real), _if=isFinite(self.$imag);
    if ((_rf && isNaN(self.$imag)) || (_if && isNaN(self.$real)) || (isNaN(self.$imag) && isNaN(self.$real)) ) return NaN
    if (! _rf || ! _if ) return Infinity;
    var mag = Math.sqrt(Math.pow(self.$real,2)+Math.pow(self.$imag,2));
    if (!isFinite(mag) && _rf && _if) {
        // In these circumstances Math.hypot quietly returns inf, but Python should raise.
        // See https://hg.python.org/jython/rev/69826acfb4a9
        throw _b_.OverflowError("absolute value too large");
    }
    return mag;    
}

$ComplexDict.__bool__ = function(self){if (self.$real == 0 && self.$imag == 0) return false; else return true;}

$ComplexDict.__class__ = $B.$type

$ComplexDict.__eq__ = function(self,other){
    if(isinstance(other,complex)) return self.$real.valueOf()==other.$real.valueOf() && self.$imag.valueOf()==other.$imag.valueOf()
    if(isinstance(other,_b_.int)){
      if (self.$imag != 0) return False
      return self.$real == other.valueOf()
    }
    if(isinstance(other,_b_.float)){
      if (self.$imag != 0) return False
      return self.$real == other.valueOf()
    }
    $UnsupportedOpType("==","complex",$B.get_class(other))
}

$ComplexDict.__floordiv__ = function(self,other){
    $UnsupportedOpType("//","complex",$B.get_class(other))
}

$ComplexDict.__hash__ = function(self){
    // this is a quick fix for something like 'hash(complex)', where
    // complex is not an instance but a type
    if (self === undefined) {
       return $ComplexDict.__hashvalue__ || $B.$py_next_hash--
    }

    return self.$imag*1000003+self.$real
}

$ComplexDict.__init__ = function() {
    var args = [].slice.call(arguments,1)
    var c = complex.apply(null, args)
    var self=arguments[0];
    self.$real=c.$real
    self.$imag=c.$imag
    self.toString = function(){return '('+self.$real+'+'+self.$imag+'j)'}
}

$ComplexDict.__invert__ = function(self){return ~self}

$ComplexDict.__mod__ = function(self,other) {
    throw _b_.TypeError("TypeError: can't mod complex numbers.")
}

$ComplexDict.__mro__ = [$ObjectDict]

$ComplexDict.__mul__ = function(self,other){
    if(isinstance(other,complex))
      return complex(self.$real*other.$real-self.$imag*other.$imag,
          self.$imag*other.$real + self.$real*other.$imag)

    if(isinstance(other,_b_.int))
      return complex(self.$real*other.valueOf(), self.$imag*other.valueOf())

    if(isinstance(other,_b_.float))
      return complex(self.$real*other, self.$imag*other)

    if(isinstance(other,_b_.bool)){
      if (other.valueOf()) return self
      return complex(0)
    }
    $UnsupportedOpType("*",complex,other)
}

$ComplexDict.__name__ = 'complex'

$ComplexDict.__ne__ = function(self,other){return !$ComplexDict.__eq__(self,other)}

$ComplexDict.__neg__ = function(self){return complex(-self.$real,-self.$imag)}

$ComplexDict.__new__ = function(cls){
    if(cls===undefined) throw _b_.TypeError('complex.__new__(): not enough arguments')
    return {__class__:cls.$dict}
}

$ComplexDict.__pos__ = function(self){return self}

function complex2expo(cx){
    var norm = Math.sqrt((cx.$real*cx.$real)+(cx.$imag*cx.$imag)),
        sin = cx.$imag/norm,
        cos = cx.$real/norm,
        angle

    if(cos==0){angle = sin==1 ? Math.PI/2 : 3*Math.PI/2}
    else if(sin==0){angle = cos==1 ? 0 : Math.PI}
    else{angle = Math.atan(sin/cos)}
    return {norm: norm, angle: angle}
}

$ComplexDict.__pow__ = function(self,other){
    // complex power : use Moivre formula (cos(x) + i sin(x))**y = cos(xy)+i sin(xy)
    var exp = complex2expo(self),
        angle = exp.angle,
        res = Math.pow(exp.norm, other)

    if(_b_.isinstance(other, [_b_.int, _b_.float])){
        return complex(res*Math.cos(angle*other), res*Math.sin(angle*other))
    }else if(_b_.isinstance(other, complex)){
        // (r*e**Ai)**(x+iy) = (e**iAx)*(e**-Ay)
        var x = other.$real,
            y = other.$imag
        var pw = Math.pow(exp.norm, x)*Math.pow(Math.E, -y*angle),
            theta = y*Math.log(exp.norm)-x*angle
        return complex(pw*Math.cos(theta), pw*Math.sin(theta))
    }else{
        throw _b_.TypeError("unsupported operand type(s) for ** or pow(): "+
            "'complex' and '"+$B.get_class(other).__name__+"'")
    }
}

$ComplexDict.__str__ = $ComplexDict.__repr__ = function(self){
    if (self.$real == 0) {
        if (1/self.$real < 0) {
            if (self.$imag < 0) {
                return "(-0"+self.$imag+"j)"
            } else if  (self.$imag == 0 && 1/self.$imag < 0) {
                return "(-0-"+self.$imag+"j)"
            } else return "(-0+"+self.$imag+"j)"
        } else {
            if  (self.$imag == 0 && 1/self.$imag < 0) return "-"+self.$imag+'j'
            else return self.$imag+'j'
        }
    }
    if(self.$imag>0) return '('+self.$real+'+'+self.$imag+'j)';
    if(self.$imag == 0) {
        if (1/self.$imag < 0) return '('+self.$real+'-'+self.$imag+'j)';
        return '('+self.$real+'+'+self.$imag+'j)';
    }
    return '('+self.$real+'-'+(-self.$imag)+'j)'
}

$ComplexDict.__sqrt__= function(self) {
  if (self.$imag == 0) return complex(Math.sqrt(self.$real))

  var r=self.$real,
      i=self.$imag,
      _a = Math.sqrt((r + sqrt)/2),
      _b = Number.sign(i) * Math.sqrt((-r + sqrt)/2)

  return complex(_a, _b)
}

$ComplexDict.__truediv__ = function(self,other){
    if(isinstance(other,complex)){
      if (other.$real == 0 && other.$imag == 0) {
         throw ZeroDivisionError('division by zero')
      }
      var _num=self.$real*other.$real + self.$imag*other.$imag
      var _div=other.$real*other.$real + other.$imag*other.$imag

      var _num2=self.$imag*other.$real - self.$real*other.$imag

      return complex(_num/_div, _num2/_div)
    }
    if(isinstance(other,_b_.int)){
        if(!other.valueOf()) throw ZeroDivisionError('division by zero')
        return $ComplexDict.__truediv__(self, complex(other.valueOf()))
    }
    if(isinstance(other,_b_.float)){
        if(!other.value) throw ZeroDivisionError('division by zero')
        return $ComplexDict.__truediv__(self, complex(other.value))
    }
    $UnsupportedOpType("//","complex",other.__class__)
}

$ComplexDict.conjugate = function(self) {
    return complex(self.$real,-self.$imag);
}

// operators
var $op_func = function(self,other){
    throw _b_.TypeError("TypeError: unsupported operand type(s) for -: 'complex' and '" +
        $B.get_class(other).__name__+"'")
}
$op_func += '' // source code
var $ops = {'&':'and','|':'ior','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){
    eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

$ComplexDict.__ior__=$ComplexDict.__or__

// operations
var $op_func = function(self,other){
    if(isinstance(other,complex)) return complex(self.$real-other.$real,self.$imag-other.$imag)
    if (isinstance(other,_b_.int)) return complex($B.sub(self.$real,other.valueOf()),self.$imag)
    if(isinstance(other,_b_.float)) return complex(self.$real - other.valueOf(), self.$imag)
    if(isinstance(other,_b_.bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return complex(self.$real - bool_value, self.$imag)
    }
    throw _b_.TypeError("unsupported operand type(s) for -: "+self.__repr__()+
             " and '"+$B.get_class(other).__name__+"'")
}
$ComplexDict.__sub__ = $op_func

$op_func += '' // source code
$op_func = $op_func.replace(/-/gm, '+').replace(/sub/gm, 'add')
eval('$ComplexDict.__add__ = '+$op_func)

// comparison methods
var $comp_func = function(self,other){
    if (other===undefined || other == _b_.None) {
        throw _b_.NotImplemented("");
    }
    throw _b_.TypeError("TypeError: no ordering relation is defined for complex numbers")
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $B.$comps){
    eval("$ComplexDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// add "reflected" methods
$B.make_rmethods($ComplexDict)

// Descriptors to return real and imag
$ComplexDict.real = function(self){return new Number(self.$real)}
$ComplexDict.real.setter = function(){throw _b_.AttributeError("readonly attribute")}
$ComplexDict.imag = function(self){return new Number(self.$imag)}
$ComplexDict.imag.setter = function(){throw _b_.AttributeError("readonly attribute")}

var complex_re = /^\s*([\+\-]*\d*\.?\d*(e[\+\-]*\d*)?)([\+\-]?)(\d*\.?\d*(e[\+\-]*\d*)?)(j?)\s*$/i
var _real=1,_real_mantissa=2,_sign=3,_imag=4,_imag_mantissa=5,_j=6;
var type_conversions = ['__complex__','__float__','__int__'];
var _convert = function(num) {
    for(i=0;i<type_conversions.length;i++) {
        if(hasattr(num, type_conversions[i])) {
            return getattr(num, type_conversions[i])()
        }
    }
    return num
}
var complex=function(){
    var res;
    var args = $B.args("complex",2,{real:null,imag:null},["real","imag"],arguments,{real:0,imag:0},null,null)
    var $real=args.real, $imag=args.imag;
    if(typeof $real=='string'){
        if (arguments.length > 1 || arguments[0].$nat !== undefined){
            throw _b_.TypeError("complex() can't take second arg if first is a string")
        }
        $real = $real.trim()
        if ($real.startsWith('(') && $real.endsWith(')')) {
            $real = $real.substr(1)
            $real = $real.substr(0,$real.length-1)
        }
        var parts = complex_re.exec($real)
        if(parts===null){
            throw _b_.ValueError("complex() arg is a malformed string")
        }else if(parts[_real]=='.' || parts[_imag]=='.' || parts[_real]=='.e' || parts[_imag]=='.e' || parts[_real]=='e' || parts[_imag]=='e'){
            throw _b_.ValueError("complex() arg is a malformed string")
        }else if(parts[_j] != ''){
            if(parts[_sign]==''){
                $real = 0; 
                if (parts[_real] == '+' || parts[_real] == '') {
                    $imag = 1
                } else if (parts[_real] == '-') {
                    $imag = -1
                } else $imag = parseFloat(parts[_real])
            }else{
                $real = parseFloat(parts[_real])
                $imag = parts[_imag]=='' ? 1 : parseFloat(parts[_imag])
                $imag = parts[_sign]=='-' ? -$imag : $imag
            }
        }else{
            $real = parseFloat(parts[_real])
            $imag = 0
        }
        res = {
            __class__:$ComplexDict,
            $real:$real || 0,
            $imag:$imag || 0
        }
        res.__repr__ = res.__str__ = function() {
            if (res.$real == 0) return res.$imag + 'j'
            return '('+res.$real+'+'+res.$imag+'j)'
        }
        return res
    }
    if (arguments.length == 1 && $real.__class__ === $ComplexDict && $imag == 0) {
        return $real;
    }
    if ((isinstance($real, _b_.float) || isinstance($real, _b_.int)) && (isinstance($imag, _b_.float) || isinstance($imag, _b_.int))) {
        res = {
            __class__:$ComplexDict,
            $real:$real,
            $imag:$imag
        }
        res.__repr__ = res.__str__ = function() {
            if (res.$real == 0) return res.$imag + 'j'
            return '('+res.$real+'+'+res.$imag+'j)'
        }
        return res;
    }
    for(i=0;i<type_conversions.length;i++) {
        if(hasattr($real, type_conversions[i])) {
            
        }
    }
    $real = _convert($real)
    $imag = _convert($imag)
    if(!isinstance($real, _b_.float) && !isinstance($real, _b_.int) && !isinstance($real, _b_.complex)) {
        throw _b_.TypeError("complex() argument must be a string or a number")
    }
    if(typeof $imag=='string') {
        throw _b_.TypeError("complex() second arg can't be a string")
    }
    if(!isinstance($imag, _b_.float) && !isinstance($imag, _b_.int) && !isinstance($imag, _b_.complex) && $imag!==undefined) {
        throw _b_.TypeError("complex() argument must be a string or a number")
    }
    $imag = $ComplexDict.__mul__(complex("1j"), $imag)
    return $ComplexDict.__add__($imag, $real);
}

complex.$dict = $ComplexDict
complex.__class__ = $B.$factory
$ComplexDict.$factory = complex

$B.set_func_names($ComplexDict)

_b_.complex = complex

})(__BRYTHON__)
