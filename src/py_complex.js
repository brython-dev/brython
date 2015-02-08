;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

function $UnsupportedOpType(op,class1,class2){
    throw _b_.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}

var $ComplexDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'complex',
    $native:true
}

$ComplexDict.__abs__ = function(self,other){return complex(abs(self.real),abs(self.imag))}

$ComplexDict.__bool__ = function(self){return new Boolean(self.real || self.imag)}

$ComplexDict.__class__ = $B.$type

$ComplexDict.__eq__ = function(self,other){
    if(isinstance(other,complex)) return self.real==other.real && self.imag==other.imag
    if(isinstance(other,_b_.int)){
      if (self.imag != 0) return False
      return self.real == other.valueOf()
    }
    if(isinstance(other,_b_.float)){
      if (self.imag != 0) return False
      return self.real == other.value
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

    return self.imag*1000003+self.real
}

$ComplexDict.__init__ = function(self,real,imag){
    self.toString = function(){return '('+real+'+'+imag+'j)'}
}

$ComplexDict.__invert__ = function(self){return ~self}

$ComplexDict.__mod__ = function(self,other) {
    throw _b_.TypeError("TypeError: can't mod complex numbers.")
}

$ComplexDict.__mro__ = [$ComplexDict,$ObjectDict]

$ComplexDict.__mul__ = function(self,other){
    if(isinstance(other,complex))
      return complex(self.real*other.real-self.imag*other.imag, 
          self.imag*other.real + self.real*other.imag)

    if(isinstance(other,_b_.int))
      return complex(self.real*other.valueOf(), self.imag*other.valueOf())

    if(isinstance(other,_b_.float))
      return complex(self.real*other.value, self.imag*other.value)

    if(isinstance(other,_b_.bool)){
      if (other.valueOf()) return self
      return complex(0)
    }
    $UnsupportedOpType("*",complex,other)
}

$ComplexDict.__name__ = 'complex'

$ComplexDict.__ne__ = function(self,other){return !$ComplexDict.__eq__(self,other)}

$ComplexDict.__neg__ = function(self){return complex(-self.real,-self.imag)}

$ComplexDict.__new__ = function(cls){
    if(cls===undefined) throw _b_.TypeError('complex.__new__(): not enough arguments')
    return {__class__:cls.$dict}
}

//$ComplexDict.__or__ = function(self,other){return self}

$ComplexDict.__pow__ = function(self,other){
    $UnsupportedOpType("**",complex,$B.get_class(other))
}

$ComplexDict.__str__ = $ComplexDict.__repr__ = function(self){
    if (self.real == 0) return self.imag+'j'
    if(self.imag>=0) return '('+self.real+'+'+self.imag+'j)'
    return '('+self.real+'-'+(-self.imag)+'j)'
}

$ComplexDict.__sqrt__= function(self) {
  if (self.imag == 0) return complex(Math.sqrt(self.real))

  var r=self.real, i=self.imag
  var _sqrt=Math.sqrt(r*r+i*i)
  var _a = Math.sqrt((r + sqrt)/2)
  var _b = Number.sign(i) * Math.sqrt((-r + sqrt)/2)

  return complex(_a, _b)
}

$ComplexDict.__truediv__ = function(self,other){
    if(isinstance(other,complex)){
      if (other.real == 0 && other.imag == 0) {
         throw ZeroDivisionError('division by zero')
      }
      var _num=self.real*other.real + self.imag*other.imag
      var _div=other.real*other.real + other.imag*other.imag

      var _num2=self.imag*other.real - self.real*other.imag

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
    if(isinstance(other,complex)) return complex(self.real-other.real,self.imag-other.imag)
    if (isinstance(other,_b_.int)) return complex(self.real-other.valueOf(),self.imag)
    if(isinstance(other,_b_.float)) return complex(self.real - other.value, self.imag)
    if(isinstance(other,_b_.bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return complex(self.real - bool_value, self.imag)
    }
    throw _b_.TypeError("unsupported operand type(s) for -: "+self.__repr__()+
             " and '"+$B.get_class(other).__name__+"'")
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for(var $op in $ops){
    eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}


// comparison methods
var $comp_func = function(self,other){
    throw _b_.TypeError("TypeError: unorderable types: complex() > " + 
        $B.get_class(other).__name__ + "()")
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $B.$comps){
    eval("$ComplexDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// add "reflected" methods
$B.make_rmethods($ComplexDict)

var complex=function(real,imag){
    var res = {
        __class__:$ComplexDict,
        real:real || 0,
        imag:imag || 0
    }

    res.__repr__ = res.__str__ = function() {
        if (real == 0) return imag + 'j'
        return '('+real+'+'+imag+'j)'
    }

    return res
}

complex.$dict = $ComplexDict
complex.__class__ = $B.$factory
$ComplexDict.$factory = complex

$B.set_func_names($ComplexDict)

_b_.complex = complex

})(__BRYTHON__)
