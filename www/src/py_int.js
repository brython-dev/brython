;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict, $N = _b_.None

function $err(op,other){
    var msg = "unsupported operand type(s) for "+op
    msg += ": 'int' and '"+$B.get_class(other).__name__+"'"
    throw _b_.TypeError(msg)
}

// dictionary for built-in class 'int'
var $IntDict = {__class__:$B.$type,
    __name__:'int',
    __dir__:$ObjectDict.__dir__,
    toString:function(){return '$IntDict'},
    $native:true,
    descriptors:{'numerator':true,
                 'denominator':true,
                 'imag':true,
                 'real':true}
}

$IntDict.from_bytes = function() {
  var $=$B.args("from_bytes", 3, 
      {bytes:null, byteorder:null, signed:null}, ['bytes', 'byteorder', 'signed'],
      arguments, {signed:False}, null, null)

  var x = $.bytes,
      byteorder = $.byteorder,
      signed = $.signed
  var _bytes, _len
  if (isinstance(x, [_b_.list, _b_.tuple])) {
     _bytes=x
     _len=len(x)
  } else if (isinstance(x, [_b_.bytes, _b_.bytearray])) {
    _bytes=x.source
    _len=x.source.length
  } else {
    _b_.TypeError("Error! " + _b_.type(x) + " is not supported in int.from_bytes. fix me!")
  }

  switch(byteorder) {
    case 'big':
      var num = _bytes[_len - 1];
      var _mult=256
      for (var i = (_len - 2); i >= 0; i--) {
          // For operations, use the functions that can take or return
          // big integers
          num = $B.add($B.mul(_mult, _bytes[i]), num)
          _mult = $B.mul(_mult,256)
      }
      if (!signed) return num
      if (_bytes[0] < 128) return num
      return $B.sub(num, _mult)
    case 'little':
      var num = _bytes[0]
      if (num >= 128) num = num - 256
      var _mult=256
      for (var i = 1;  i < _len; i++) {
          num = $B.add($B.mul(_mult, _bytes[i]), num)
          _mult = $B.mul(_mult,256)
      }
      if (!signed) return num
      if (_bytes[_len - 1] < 128) return num
      return $B.sub(num, _mult)
  }

  throw _b_.ValueError("byteorder must be either 'little' or 'big'");
}

$IntDict.to_bytes = function(length, byteorder, star) {
  //var len = x.length
  throw _b_.NotImplementedError("int.to_bytes is not implemented yet")
}


//$IntDict.__and__ = function(self,other){return self & other} // bitwise AND

$IntDict.__abs__ = function(self){return abs(self)}

$IntDict.__bool__ = function(self){return new Boolean(self.valueOf())}

$IntDict.__ceil__ = function(self){return Math.ceil(self)}

//is this a duplicate?
$IntDict.__class__ = $B.$type

$IntDict.__divmod__ = function(self, other){return divmod(self, other)}

$IntDict.__eq__ = function(self,other){
    // compare object "self" to class "int"
    if(other===undefined) return self===int
    if(isinstance(other,int)) return self.valueOf()==other.valueOf()
    if(isinstance(other,_b_.float)) return self.valueOf()==other.valueOf()
    if(isinstance(other,_b_.complex)){
      if (other.imag != 0) return False
      return self.valueOf() == other.real
    }

    if (hasattr(other, '__eq__')) return getattr(other, '__eq__')(self)

    return self.valueOf()===other
}

function preformat(self, fmt){
    if(fmt.empty){return _b_.str(self)}
    if(fmt.type && 'bcdoxXn'.indexOf(fmt.type)==-1){
        throw _b_.ValueError("Unknown format code '"+fmt.type+
            "' for object of type 'int'")
    }
    
    switch(fmt.type){
        case undefined:
        case 'd':
            return self.toString()
        case 'b':
            return (fmt.alternate ? '0b' : '') + self.toString(2)
        case 'c':
            return _b_.chr(self)
        case 'o':
            return (fmt.alternate ? '0o' : '') + self.toString(8)
        case 'x':
            return (fmt.alternate ? '0x' : '') + self.toString(16)
        case 'X':
            return (fmt.alternate ? '0X' : '') + self.toString(16).toUpperCase()
        case 'n':
            return self // fix me
    }
        
    return res
}


$IntDict.__format__ = function(self,format_spec){
    var fmt = new $B.parse_format_spec(format_spec)
    if(fmt.type && 'eEfFgG%'.indexOf(fmt.type)!=-1){
        // Call __format__ on float(self)
        return _b_.float.$dict.__format__(self, format_spec)        
    }
    fmt.align = fmt.align || '>'
    var res = preformat(self, fmt)
    if(fmt.comma){
        var len = res.length, nb = Math.ceil(res.length/3), chunks = []
        for(var i=0;i<nb;i++){
            chunks.push(res.substring(len-3*i-3, len-3*i))
        }
        chunks.reverse()
        res = chunks.join(',')
    }
    return $B.format_width(res, fmt)
}

//$IntDict.__float__ = function(self){return float(self)}

$IntDict.__floordiv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0) throw ZeroDivisionError('division by zero')
        return Math.floor(self/other)
    }
    if(isinstance(other,_b_.float)){
        if(!other.valueOf()) throw ZeroDivisionError('division by zero')
        return Math.floor(self/other)
    }
    if(hasattr(other,'__rfloordiv__')){
        return getattr(other,'__rfloordiv__')(self)
    }
    $err("//",other)
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
    return $N
}

$IntDict.__int__ = function(self){return self}

$IntDict.__invert__ = function(self){return ~self}

// bitwise left shift
$IntDict.__lshift__ = function(self,other){
    if(isinstance(other, int)){
        return int($B.LongInt.$dict.__lshift__($B.LongInt(self), $B.LongInt(other)))
    }
    var rlshift = getattr(other, '__rlshift__', null)
    if(rlshift!==null){return rlshift(self)}
    $err('<<', other)
}

$IntDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(isinstance(other,_b_.tuple) && other.length==1) other=other[0]
    if(isinstance(other,[int, _b_.float, bool])){
        if(other===false){other=0}else if(other===true){other=1}
        if(other==0){throw _b_.ZeroDivisionError(
            "integer division or modulo by zero")}
        return (self%other+other)%other
    }
    if(hasattr(other,'__rmod__')) return getattr(other,'__rmod__')(self)
    $err('%',other)
}

$IntDict.__mro__ = [$IntDict,$ObjectDict]

$IntDict.__mul__ = function(self,other){

    var val = self.valueOf()

    // this will be quick check, so lets do it early.
    if(typeof other==="string") {
        return other.repeat(val)
    }

    if(isinstance(other,int)){
        var res = self*other
        if(res>$B.min_int && res<$B.max_int){return res}
        else{return int($B.LongInt.$dict.__mul__($B.LongInt(self),
                $B.LongInt(other)))}
    }
    if(isinstance(other,_b_.float)){
        return new Number(self*other)
    }
    if(isinstance(other,_b_.bool)){
         if (other.valueOf()) return self
         return int(0)
    }
    if(isinstance(other,_b_.complex)){
        return _b_.complex($IntDict.__mul__(self, other.real), 
            $IntDict.__mul__(self, other.imag))
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

$IntDict.__neg__ = function(self){return -self}

$IntDict.__new__ = function(cls){
    if(cls===undefined){throw _b_.TypeError('int.__new__(): not enough arguments')}
    return {__class__:cls.$dict}
}

$IntDict.__pos__ = function(self){return self}

$IntDict.__pow__ = function(self,other){
    if(isinstance(other, int)) {
      switch(other.valueOf()) {
        case 0:
          return int(1)
        case 1:
          return int(self.valueOf())
      }
      var res = Math.pow(self.valueOf(),other.valueOf()) 
      if(!isFinite(res)){return res}
      if(res>$B.min_int && res<$B.max_int){return res}
      else{
          return int($B.LongInt.$dict.__pow__($B.LongInt(self),
             $B.LongInt(other)))}
    }
    if(isinstance(other, _b_.float)) { 
        if(self>=0){return new Number(Math.pow(self, other.valueOf()))}
        else{
            // use complex power
            return _b_.complex.$dict.__pow__(_b_.complex(self, 0), other)
        }
    }
    if(hasattr(other,'__rpow__')) return getattr(other,'__rpow__')(self)
    $err("**",other)
}

$IntDict.__repr__ = function(self){
    if(self===int) return "<class 'int'>"
    return self.toString()
}

// bitwise right shift
$IntDict.__rshift__ = function(self,other){
    if(isinstance(other, int)){
        return int($B.LongInt.$dict.__rshift__($B.LongInt(self), $B.LongInt(other)))
    }
    var rrshift = getattr(other, '__rrshift__', null)
    if(rrshift!==null){return rrshift(self)}
    $err('>>', other)
}

$IntDict.__setattr__ = function(self,attr,value){
    if(typeof self=="number"){
        if($IntDict[attr]===undefined){
            throw _b_.AttributeError("'int' object has no attribute '"+attr+"'")
        }else{
            throw _b_.AttributeError("'int' object attribute '"+attr+"' is read-only")
        }
    }
    // subclasses of int can have attributes set
    self[attr] = value
    return $N
}

$IntDict.__str__ = $IntDict.__repr__

$IntDict.__truediv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0) throw ZeroDivisionError('division by zero')
        if(other.__class__==$B.LongInt.$dict){return new Number(self/parseInt(other.value))}
        return new Number(self/other)
    }
    if(isinstance(other,_b_.float)){
        if(!other.valueOf()) throw ZeroDivisionError('division by zero')
        return new Number(self/other)
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

// descriptors
$IntDict.numerator = function(self){return self}
$IntDict.denominator = function(self){return int(1)}
$IntDict.imag = function(self){return int(0)}
$IntDict.real = function(self){return self}


$B.max_int32= (1<<30) * 2 - 1
$B.min_int32= - $B.max_int32

// code for operands & | ^
var $op_func = function(self,other){
    if(isinstance(other,int)) {
        if(other.__class__===$B.LongInt.$dict){
            return $B.LongInt.$dict.__sub__($B.LongInt(self), $B.LongInt(other))
        }
        if (self > $B.max_int32 || self < $B.min_int32 || 
            other > $B.max_int32 || other < $B.min_int32) {
            return $B.LongInt.$dict.__sub__($B.LongInt(self), $B.LongInt(other))
        }
        return self-other
    }
    if(isinstance(other,_b_.bool)) return self-other
    if(hasattr(other,'__rsub__')) return getattr(other,'__rsub__')(self)
    $err("-",other)
}

$op_func += '' // source code
var $ops = {'&':'and','|':'or','^':'xor'}
for(var $op in $ops){
    var opf = $op_func.replace(/-/gm,$op)
    opf = opf.replace(new RegExp('sub','gm'),$ops[$op])
    eval('$IntDict.__'+$ops[$op]+'__ = '+opf)
}

// code for + and -
var $op_func = function(self,other){

    if(isinstance(other,int)){
        if(typeof other=='number'){
            var res = self.valueOf()-other.valueOf()
            if(res>=$B.min_int && res<=$B.max_int){return res}
            else{return $B.LongInt.$dict.__sub__($B.LongInt(self), 
                $B.LongInt(other))}
        }else{
            return $B.LongInt.$dict.__sub__($B.LongInt(self), 
                $B.LongInt(other))        
        }
    }
    if(isinstance(other,_b_.float)){
        return new Number(self-other)
    }
    if(isinstance(other,_b_.complex)){
        return _b_.complex(self-other.real,-other.imag)
    }
    if(isinstance(other,_b_.bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return self-bool_value
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
    if (other.__class__ === $B.LongInt.$dict) return $B.LongInt.$dict.__gt__($B.LongInt(self), other)
    if(isinstance(other,int)) return self.valueOf() > other.valueOf()
    if(isinstance(other,_b_.float)) return self.valueOf() > other.valueOf()
    if(isinstance(other,_b_.bool)) {
      return self.valueOf() > _b_.bool.$dict.__hash__(other)
    }
    if (hasattr(other, '__int__') || hasattr(other, '__index__')) {
       return $IntDict.__gt__(self, $B.$GetInt(other))
    }

    // See if other has the opposite operator, eg <= for >
    var inv_op = getattr(other, '__le__', null)
    if(inv_op !== null){return inv_op(self)}

    throw _b_.TypeError(
        "unorderable types: int() > "+$B.get_class(other).__name__+"()")
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}

for(var $op in $B.$comps){
    eval("$IntDict.__"+$B.$comps[$op]+'__ = '+
          $comp_func.replace(/>/gm,$op).
              replace(/__gt__/gm,'__'+$B.$comps[$op]+'__').
              replace(/__le__/, '__'+$B.$inv_comps[$op]+'__'))
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
    // int() with no argument returns 0
    if(value===undefined){return 0}
    
    // int() of an integer returns the integer if base is undefined
    if(typeof value=='number' && 
        (base===undefined || base==10)){return parseInt(value)}
    
    if(base!==undefined){
        if(!isinstance(value,[_b_.str,_b_.bytes,_b_.bytearray])){
            throw TypeError("int() can't convert non-string with explicit base")
        }
    }

    if(isinstance(value,_b_.complex)){
        throw TypeError("can't convert complex to int")
    }

    var $ns=$B.args('int',2,{x:null,base:null},['x','base'],arguments,
        {'base':10},'null','null')
    var value = $ns['x']
    var base = $ns['base']
    
    if(isinstance(value, _b_.float) && base===10){
        if(value<$B.min_int || value>$B.max_int){
            return $B.LongInt.$dict.$from_float(value)
        }
        else{return value>0 ? Math.floor(value) : Math.ceil(value)}
    }

    if (!(base >=2 && base <= 36)) {
        // throw error (base must be 0, or 2-36)
        if (base != 0) throw _b_.ValueError("invalid base")
    }

    if (typeof value == 'number'){

        if(base==10){
           if(value < $B.min_int || value > $B.max_int) return $B.LongInt(value)
           return value
        }else if(value.toString().search('e')>-1){
            // can't convert to another base if value is too big
            throw _b_.OverflowError("can't convert to base "+base)
        }else{
            var res=parseInt(value, base)
            if(res < $B.min_int || res > $B.max_int) return $B.LongInt(value,base)
            return res
        }
    }

    if(value===true) return Number(1)
    if(value===false) return Number(0)
    if(value.__class__===$B.LongInt.$dict){
        var z = parseInt(value.value)
        if(z>$B.min_int && z<$B.max_int){return z}
        else{return value}
    }

    base=$B.$GetInt(base)

    if(isinstance(value, _b_.str)) value=value.valueOf()
    if(typeof value=="string") {
      var _value=value.trim()    // remove leading/trailing whitespace
      if (_value.length == 2 && base==0 && (_value=='0b' || _value=='0o' || _value=='0x')) {
         throw _b_.ValueError('invalid value')
      }
      if (_value.length >2) {
         var _pre=_value.substr(0,2).toUpperCase()
         if (base == 0) {
            if (_pre == '0B') base=2
            if (_pre == '0O') base=8
            if (_pre == '0X') base=16
         }
         if (_pre=='0B' || _pre=='0O' || _pre=='0X') {
            _value=_value.substr(2)
         }
      }
      var _digits=$valid_digits(base)
      var _re=new RegExp('^[+-]?['+_digits+']+$', 'i')
      if(!_re.test(_value)) {
         throw _b_.ValueError(
             "invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
      }
      if(base <= 10 && !isFinite(value)) {
         throw _b_.ValueError(
             "invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
      } 
      var res=parseInt(_value, base)
      if(res < $B.min_int || res > $B.max_int) return $B.LongInt(_value, base)
      return res
    }
    
    if(isinstance(value,[_b_.bytes,_b_.bytearray])){
        var _digits = $valid_digits(base)
        for(var i=0;i<value.source.length;i++){
            if(_digits.indexOf(String.fromCharCode(value.source[i]))==-1){
                throw _b_.ValueError("invalid literal for int() with base "+
                    base +": "+_b_.repr(value))
            }
        }
        return Number(parseInt(getattr(value,'decode')('latin-1'), base))
    }

    if(hasattr(value, '__int__')) return getattr(value,'__int__')()
    if(hasattr(value, '__index__')) return getattr(value,'__index__')()
    if(hasattr(value, '__trunc__')) {
        var res = getattr(value,'__trunc__')(),
            int_func = _b_.getattr(res, '__int__', null)
        if(int_func===null){
            throw TypeError('__trunc__ returned non-Integral (type '+
                $B.get_class(res).__name__+')')
        }
        var res=int_func()
        if(isinstance(res, int)){return res}
        throw TypeError('__trunc__ returned non-Integral (type '+
                $B.get_class(res).__name__+')')
    }

    throw _b_.ValueError(
        "invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
}
int.$dict = $IntDict
int.__class__ = $B.$factory
$IntDict.$factory = int

_b_.int = int


})(__BRYTHON__)
