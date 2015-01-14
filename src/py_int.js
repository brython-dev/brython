;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

function $err(op,other){
    var msg = "unsupported operand type(s) for "+op
    msg += ": 'int' and '"+$B.get_class(other).__name__+"'"
    throw _b_.TypeError(msg)
}

var $IntDict = {__class__:$B.$type,
    __name__:'int',
    toString:function(){return '$IntDict'},
    $native:true
}
// Pierre, this probably isn't correct, but may work for now.
// do we need to create a $IntDict, like what we did for Float?
$IntDict.from_bytes = function(x, byteorder) {
  var len = x.source.length

  if (byteorder == 'little') {
     var num = x.source[len - 1];

     if (num >= 128) num = num - 256;

     for (var i = (len - 2); i >= 0; i--) {
         num = 256 * num + x.source[i];
     }
     return num;
  }

  if (byteorder === 'big') {
     var num = x.source[0];

     if (num >= 128) num = num - 256;

     for (var i = 1;  i < len; i++) {
         num = 256 * num + x.source[i];
     }
     if (num < 0) return -num    // fixme.. alg above shouldn't return a negative
     return num;
  }

  throw _b_.ValueError("byteorder must be either 'little' or 'big'");
}

$IntDict.to_bytes = function(length, byteorder, star) {
  //var len = x.length
  throw _b_.NotImplementedError("int.to_bytes is not implemented yet")
}


//$IntDict.__and__ = function(self,other){return self & other} // bitwise AND

$IntDict.__bool__ = function(self){return new Boolean(self.valueOf())}

//is this a duplicate?
$IntDict.__class__ = $B.$type

$IntDict.__eq__ = function(self,other){
    // compare object "self" to class "int"
    if(other===undefined) return self===int
    if(isinstance(other,int)) return self.valueOf()==other.valueOf()
    if(isinstance(other,_b_.float)) return self.valueOf()==other.value
    if(isinstance(other,_b_.complex)){
      if (other.imag != 0) return False
      return self.valueOf() == other.real
    }
    return self.valueOf()===other
}

$IntDict.__format__ = function(self,format_spec){
    if (format_spec == '') format_spec='d'
    return _b_.str.$dict.__mod__('%'+format_spec, self)
}

$IntDict.__floordiv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0) throw ZeroDivisionError('division by zero')
        return Math.floor(self/other)
    }
    if(isinstance(other,_b_.float)){
        if(!other.value) throw ZeroDivisionError('division by zero')
        return _b_.float(Math.floor(self/other.value))
    }
    if(hasattr(other,'__rfloordiv__')){
        return getattr(other,'__rfloordiv__')(self)
    }
    $err("//",other)
}

$IntDict.__getitem__ = function(){
    throw _b_.TypeError("'int' object is not subscriptable")
}

$IntDict.__hash__ = function(self){
   if (self === undefined) {
      return $IntDict.__hashvalue__ || $B.$py_next_hash--  // for hash of int type (not instance of int)
   }

   return self.valueOf()
}

//$IntDict.__ior__ = function(self,other){return self | other} // bitwise OR

$IntDict.__index__ = function(self){return self}

$IntDict.__init__ = function(self,value){
    if(value===undefined){value=0}
    self.toString = function(){return value}
    //self.valueOf = function(){return value}
}

$IntDict.__int__ = function(self){return self}

$IntDict.__invert__ = function(self){return ~self}

$IntDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(isinstance(other,_b_.tuple) && other.length==1) other=other[0]
    if(isinstance(other,int)) return (self%other+other)%other
    if(isinstance(other,_b_.float)) return ((self%other)+other)%other
    if(isinstance(other,bool)){ 
         var bool_value=0; 
         if (other.valueOf()) bool_value=1;
         return (self%bool_value+bool_value)%bool_value
    }
    if(hasattr(other,'__rmod__')) return getattr(other,'__rmod__')(self)
    $err('%',other)
}

$IntDict.__mro__ = [$IntDict,$ObjectDict]

$IntDict.__mul__ = function(self,other){
    var val = self.valueOf()
    if(isinstance(other,int)) return self*other
    if(isinstance(other,_b_.float)) return _b_.float(self*other.value)
    if(isinstance(other,_b_.bool)){
         var bool_value=0
         if (other.valueOf()) bool_value=1
         return self*bool_value
    }
    if(isinstance(other,_b_.complex)){
        return _b_.complex(self.valueOf()*other.real, self.valueOf()*other.imag)
    }
    if(typeof other==="string") {
        var res = ''
        for(var i=0;i<val;i++) res+=other
        return res
    }
    if(isinstance(other,[_b_.list,_b_.tuple])){
        var res = []
        // make temporary copy of list
        var $temp = other.slice(0,other.length)
        for(var i=0;i<val;i++) res=res.concat($temp)
        if(isinstance(other,_b_.tuple)) res=_b_.tuple(res)
        return res
    }
    if(hasattr(other,'__rmul__')) return getattr(other,'__rmul__')(self)
    $err("*",other)
}

$IntDict.__name__ = 'int'

$IntDict.__ne__ = function(self,other){return !$IntDict.__eq__(self,other)}

$IntDict.__neg__ = function(self){return -self}

$IntDict.__new__ = function(cls){
    if(cls===undefined){throw _b_.TypeError('int.__new__(): not enough arguments')}
    return {__class__:cls.$dict}
}

//$IntDict.__or__ = function(self,other){return self | other} // bitwise OR

$IntDict.__pow__ = function(self,other){
    if(isinstance(other, int)) {
      if (other.valueOf() >= 0) return int(Math.pow(self.valueOf(),other.valueOf()))
      return Math.pow(self.valueOf(),other.valueOf()) 
    }
    if(isinstance(other, _b_.float)) { 
      return _b_.float(Math.pow(self.valueOf(), other.valueOf()))
    }
    if(hasattr(other,'__rpow__')) return getattr(other,'__rpow__')(self)
    $err("**",other)
}

$IntDict.__repr__ = function(self){
    if(self===int) return "<class 'int'>"
    return self.toString()
}

//$IntDict.__rshift__ = function(self,other){return self >> other} // bitwise right shift

$IntDict.__setattr__ = function(self,attr,value){
    if(self.__class__===$IntDict){
        throw _b_.AttributeError("'int' object has no attribute "+attr+"'")
    }
    // subclasses of int can have attributes set
    self[attr] = value
}

$IntDict.__str__ = $IntDict.__repr__

$IntDict.__truediv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0) throw ZeroDivisionError('division by zero')
        return _b_.float(self/other)
    }
    if(isinstance(other,_b_.float)){
        if(!other.value) throw ZeroDivisionError('division by zero')
        return _b_.float(self/other.value)
    }
    if(isinstance(other,_b_.complex)){
        var cmod = other.real*other.real+other.imag*other.imag
        if(cmod==0) throw ZeroDivisionError('division by zero')
        return _b_.complex(self*other.real/cmod,-self*other.imag/cmod)
    }
    if(hasattr(other,'__rtruediv__')) return getattr(other,'__rtruediv__')(self)
    $err("/",other)
}

//$IntDict.__xor__ = function(self,other){return self ^ other} // bitwise XOR

$IntDict.bit_length = function(self){
    s = bin(self)
    s = getattr(s,'lstrip')('-0b') // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

// code for operands & | ^ << >>
var $op_func = function(self,other){
    if(isinstance(other,int)) return self-other
    if(isinstance(other,_b_.bool)) return self-other
    if(hasattr(other,'__rsub__')) return getattr(other,'__rsub__')(self)
    $err("-",other)
}

$op_func += '' // source code
var $ops = {'&':'and','|':'or','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm,$op)
    opf = opf.replace(new RegExp('sub','gm'),$ops[$op])
    eval('$IntDict.__'+$ops[$op]+'__ = '+opf)
}

// code for + and -
var $op_func = function(self,other){
    if(isinstance(other,int)){
        var res = self.valueOf()-other.valueOf()
        if(isinstance(res,int)) return res
        return _b_.float(res)
    }
    if(isinstance(other,_b_.float)){
        return _b_.float(self.valueOf()-other.value)
    }
    if(isinstance(other,_b_.complex)){
        return _b_.complex(self-other.real,-other.imag)
    }
    if(isinstance(other,_b_.bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return self.valueOf()-bool_value
    }
    if(isinstance(other,_b_.complex)){
        return _b_.complex(self.valueOf() - other.real, other.imag)
    }
    if(hasattr(other,'__rsub__')) return getattr(other,'__rsub__')(self)
    throw $err('-',other)
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm,$op)
    opf = opf.replace(new RegExp('sub','gm'),$ops[$op])
    eval('$IntDict.__'+$ops[$op]+'__ = '+opf)
}

// comparison methods
var $comp_func = function(self,other){
    if(isinstance(other,int)) return self.valueOf() > other.valueOf()
    if(isinstance(other,_b_.float)) return self.valueOf() > other.value
    if(isinstance(other,_b_.bool)) {
      return self.valueOf() > _b_.bool.$dict.__hash__(other)
    }
    throw _b_.TypeError(
        "unorderable types: int() > "+$B.get_class(other).__name__+"()")
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $B.$comps){
    eval("$IntDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// add "reflected" methods
$B.make_rmethods($IntDict)

var $valid_digits=function(base) {
    var digits=''
    if (base === 0) return '0'
    if (base < 10) {
       for (var i=0; i < base; i++) digits+=String.fromCharCode(i+48)
       return digits
    }

    var digits='0123456789'
    // A = 65 (10 + 55)
    for (var i=10; i < base; i++) digits+=String.fromCharCode(i+55)
    return digits
}

var int = function(value, base){
    // most simple case
    if(typeof value=='number' && base===undefined){return value}

    if(base!==undefined){
        if(!isinstance(value,[_b_.str,_b_.bytes,_b_.bytearray])){
            throw TypeError("int() can't convert non-string with explicit base")
        }
    }

    if(isinstance(value,_b_.float)){
        var v = value.value
        return v >= 0 ? Math.floor(v) : Math.ceil(v)
    }
    if(isinstance(value,_b_.complex)){
        throw TypeError("can't convert complex to int")
    }

    var $ns=$B.$MakeArgs('int',arguments,[],[],'args','kw')
    var value = $ns['args'][0]
    var base = $ns['args'][1]

    if (value === undefined) value = _b_.dict.$dict.get($ns['kw'],'x', 0)
    if (base === undefined) base = _b_.dict.$dict.get($ns['kw'],'base',10)

    if (!(base >=2 && base <= 36)) {
        // throw error (base must be 0, or 2-36)
        if (base != 0) throw _b_.ValueError("invalid base")
    }

    if (typeof value == 'number'){
        if(base==10){return value}
        else if(value.toString().search('e')>-1){
            // can't convert to another base if value is too big
            throw _b_.OverflowError("can't convert to base "+base)
        }else{
            return parseInt(value, base)
        }
    }

    if(value===true) return Number(1)
    if(value===false) return Number(0)

    if(!isinstance(base, _b_.int)) {
      if (hasattr(base, '__int__')) {base = Number(getattr(base,'__int__')())
      }else if (hasattr(base, '__index__')) {base = Number(getattr(base,'__index__')())}
    }

    if(isinstance(value, _b_.str)) value=value.valueOf()

    if(typeof value=="string") {
      value=value.trim()    // remove leading/trailing whitespace
      if (value.length == 2 && base==0 && (value=='0b' || value=='0o' || value=='0x')) {
         throw _b_.ValueError('invalid value')
      }
      if (value.length >2) {
         var _pre=value.substr(0,2).toUpperCase()
         if (base == 0) {
            if (_pre == '0B') base=2
            if (_pre == '0O') base=8
            if (_pre == '0X') base=16
         }
         if (_pre=='0B' || _pre=='0O' || _pre=='0X') {
            value=value.substr(2)
         }
      }
      var _digits=$valid_digits(base)
      var _re=new RegExp('^[+-]?['+_digits+']+$', 'i')
      if(!_re.test(value)) {
         throw _b_.ValueError(
             "Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
      }
      if(base <= 10 && !isFinite(value)) {
         throw _b_.ValueError(
             "Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
      } 
      return Number(parseInt(value, base))
    }

    
    if(isinstance(value,[_b_.bytes,_b_.bytearray])) return Number(parseInt(getattr(value,'decode')('latin-1'), base))

    if(hasattr(value, '__int__')) return Number(getattr(value,'__int__')())
    if(hasattr(value, '__trunc__')) return Number(getattr(value,'__trunc__')())

    throw _b_.ValueError(
        "Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
}
int.$dict = $IntDict
int.__class__ = $B.$factory
$IntDict.$factory = int

_b_.int = int

})(__BRYTHON__)
