;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = object.$dict

var $StringDict = {__class__:$B.$type,
    __dir__:$ObjectDict.__dir__,
    __name__:'str',
    $native:true
}

$StringDict.__add__ = function(self,other){
    if(!(typeof other==="string")){
        try{return getattr(other,'__radd__')(self)}
        catch(err){throw _b_.TypeError(
            "Can't convert "+$B.get_class(other).__name__+" to str implicitely")}
    }
    return self+other
}

$StringDict.__contains__ = function(self,item){
    if(!(typeof item==="string")){throw _b_.TypeError(
         "'in <string>' requires string as left operand, not "+item.__class__)}
    var nbcar = item.length
    if(nbcar==0) return true // a string contains the empty string
    if(self.length==0) return nbcar==0
    for(var i=0, _len_i = self.length; i < _len_i;i++){
        if(self.substr(i,nbcar)==item) return true
    }
    return false
}

$StringDict.__delitem__ = function(){
    throw _b_.TypeError("'str' object doesn't support item deletion")
}

// __dir__must be assigned explicitely because attribute resolution for builtin
// classes doesn't use __mro__
$StringDict.__dir__ = $ObjectDict.__dir__ 

$StringDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "str"
        return self===str
    }
    if (_b_.isinstance(other, _b_.str)) {
       return other.valueOf() == self.valueOf()
    }
    return other===self.valueOf()
}

$StringDict.__format__ = function(self,arg){
    var _fs = $FormattableString(self.valueOf())
    var args=[], pos=0
    // we don't need the first item (ie, self)
    for (var i=1,_len_i=arguments.length;i<_len_i;i++){args[pos++]=arguments[i]}
    return _fs.strformat(arg)
}

$StringDict.__getitem__ = function(self,arg){
    if(isinstance(arg,_b_.int)){
        var pos = arg
        if(arg<0) pos+=self.length
        if(pos>=0 && pos<self.length) return self.charAt(pos)
        throw _b_.IndexError('string index out of range')
    }
    if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? getattr(self,'__len__')() : arg.stop
        }else{
            var start = arg.start===None ? getattr(self,'__len__')()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0) start+=self.length
        if(stop<0) stop+=self.length
        var res = '',i=null
        if(step>0){
            if(stop<=start) return ''
            for(var i=start;i<stop;i+=step) res += self.charAt(i)
        } else {
            if(stop>=start) return ''
            for(var i=start;i>=stop;i+=step) res += self.charAt(i)
        } 
        return res
    }
    if(isinstance(arg,bool)) return self.__getitem__(_b_.int(arg))
}

// special method to speed up "for" loops
$StringDict.__getitems__ = function(self){return self.split('')}

$StringDict.__hash__ = function(self) {
  if (self === undefined) {
     return $StringDict.__hashvalue__ || $B.$py_next_hash--  // for hash of string type (not instance of string)
  }

  //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-way-to-implement-hash
  // this implementation for strings maybe good enough for us..

  var hash=1;
  for(var i=0, _len_i = self.length; i < _len_i; i++) {
      hash=(101*hash + self.charCodeAt(i)) & 0xFFFFFFFF
  }

  return hash
}

$StringDict.__init__ = function(self,arg){
    self.valueOf = function(){return arg}
    self.toString = function(){return arg}
}

var $str_iterator = $B.$iterator_class('str_iterator')
$StringDict.__iter__ = function(self){
    var items = self.split('') // list of all characters in string
    return $B.$iterator(items,$str_iterator)
}

$StringDict.__len__ = function(self){return self.length}

var kwarg_key = new RegExp('([^\\)]*)\\)')

var NotANumber = function() {
    this.name = 'NotANumber'
}

var number_check=function(s) {
    if(!isinstance(s,[_b_.int,_b_.float])){
        throw new NotANumber()
    }
}

var get_char_array = function(size, char) {
    if (size <= 0)
        return ''
    return new Array(size + 1).join(char)
}

var format_padding = function(s, flags, minus_one) {
    var padding = flags.padding
    if (!padding) {  // undefined
        return s
    }
    s = s.toString()
    padding = parseInt(padding, 10)
    if (minus_one) {  // numeric formatting where sign goes in front of padding
        padding -= 1
    }
    if (!flags.left) {
        return get_char_array(padding - s.length, flags.pad_char) + s
    } else {
        // left adjusted
        return s + get_char_array(padding - s.length, flags.pad_char)
    }
}

var format_int_precision = function(val, flags) {
    var precision = flags.precision
    if (!precision) {
        return val.toString()
    }
    precision = parseInt(precision, 10)
    var s = val.toString()
    var sign = s[0]
    if (s[0] === '-') {
        return '-' + get_char_array(precision - s.length + 1, '0') + s.slice(1)
    }
    return get_char_array(precision - s.length, '0') + s
}

var format_float_precision = function(val, upper, flags, modifier) {
    var precision = flags.precision
    // val is a float
    if (isFinite(val)) {
        val = modifier(val, precision, flags, upper)
        return val
    }
    if (val === Infinity) {
        val = 'inf'
    } else if (val === -Infinity) {
        val = '-inf'
    } else {
        val = 'nan'
    }
    if (upper) {
        return val.toUpperCase()
    }
    return val
    
}

var format_sign = function(val, flags) {
    if (flags.sign) {
        if (val >= 0) {
            return "+"
        }
    } else if (flags.space) {
        if (val >= 0) {
            return " "
        }
    }
    return ""
}

var str_format = function(val, flags) {
    // string format supports left and right padding
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    return format_padding(str(val), flags)
}

var num_format = function(val, flags) {
    number_check(val)
    val = parseInt(val)
    var s = format_int_precision(val, flags)
    if (flags.pad_char === '0') {
        if (val < 0) {
            s = s.substring(1)
            return '-' + format_padding(s, flags, true)
        }
        var sign = format_sign(val, flags)
        if (sign !== '') {
            return sign + format_padding(s, flags, true)
        }
    }
    
    return format_padding(format_sign(val, flags) + s, flags)
}

var repr_format = function(val, flags) {
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    return format_padding(repr(val), flags)
}

var ascii_format = function(val, flags) {
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    return format_padding(ascii(val), flags)
}

// converts to val to float and sets precision if missing
var _float_helper = function(val, flags) {
    number_check(val)
    if (!flags.precision) {
        if (!flags.decimal_point) {
            flags.precision = 6
        } else {
            flags.precision = 0
        }
    } else {
        flags.precision = parseInt(flags.precision, 10)
        validate_precision(flags.precision)
    }
    return parseFloat(val)
}

// used to capture and remove trailing zeroes
var trailing_zeros = /(.*?)(0+)([eE].*)/
var leading_zeros = /\.(0*)/
var trailing_dot = /\.$/

var validate_precision = function(precision) {
    // force precision to limits of javascript
    if (precision > 20) {
        throw _b_.ValueError("precision too big")
    }
}

// gG
var floating_point_format = function(val, upper, flags) {
    val = _float_helper(val, flags)
    var v = val.toString()
    var v_len = v.length
    var dot_idx = v.indexOf('.')
    if (dot_idx < 0) {
        dot_idx = v_len
    }
    if (val < 1 && val > -1) {
        var zeros = leading_zeros.exec(v)
        var numzeros
        if (zeros) {
            numzeros = zeros[1].length
        } else {
            numzeros = 0
        }
        if (numzeros >= 4) {
            val = format_sign(val, flags) + format_float_precision(val, upper, flags, _floating_g_exp_helper)
            if (!flags.alternate) {
                var trl = trailing_zeros.exec(val)
                if (trl) {
                    val = trl[1].replace(trailing_dot, '') + trl[3]  // remove trailing
                }
            } else {
                if (flags.precision <= 1) {
                    val = val[0] + '.' + val.substring(1)
                }
            }
            return format_padding(val, flags)
        }
        flags.precision += numzeros
        return format_padding(format_sign(val, flags) + format_float_precision(val, upper, flags, 
            function(val, precision) {
                val = val.toFixed(min(precision, v_len - dot_idx) + numzeros)
            }), flags)
    }
    
    if (dot_idx > flags.precision) {
        val = format_sign(val, flags) + format_float_precision(val, upper, flags, _floating_g_exp_helper)
        if (!flags.alternate) {
            var trl = trailing_zeros.exec(val)
            if (trl) {
                val = trl[1].replace(trailing_dot, '') + trl[3]  // remove trailing
            }
        } else {
            if (flags.precision <= 1) {
                val = val[0] + '.' + val.substring(1)
            }
        }
        return format_padding(val, flags)
    }
    return format_padding(format_sign(val, flags) + format_float_precision(val, upper, flags, 
        function(val, precision) {
            if (!flags.decimal_point) {
                precision = min(v_len - 1, 6)
            } else if (precision > v_len) {
                if (!flags.alternate) {
                    precision = v_len
                }
            }
            if (precision < dot_idx) {
                precision = dot_idx
            }
            return val.toFixed(precision - dot_idx)
        }), flags)
}

var _floating_g_exp_helper = function(val, precision, flags, upper) {
    if (precision) {
        --precision
    }
    val = val.toExponential(precision)
    // pad exponent to two digits
    var e_idx = val.lastIndexOf('e')
    if (e_idx > val.length - 4) {
        val = val.substring(0, e_idx + 2) + '0' + val.substring(e_idx + 2) 
    }
    if (upper) {
        return val.toUpperCase()
    }
    return val
}

// fF
var floating_point_decimal_format = function(val, upper, flags) {
    val = _float_helper(val, flags)
    return format_padding(format_sign(val, flags) + format_float_precision(val, upper, flags, 
        function(val, precision, flags) {
            val = val.toFixed(precision)
            if (precision === 0 && flags.alternate) {
                val += '.'
            }
            return val
        }), flags)
}

var _floating_exp_helper = function(val, precision, flags, upper) {
    val = val.toExponential(precision)
    // pad exponent to two digits
    var e_idx = val.lastIndexOf('e')
    if (e_idx > val.length - 4) {
        val = val.substring(0, e_idx + 2) + '0' + val.substring(e_idx + 2) 
    }
    if (upper) {
        return val.toUpperCase()
    }
    return val
}

// eE
var floating_point_exponential_format = function(val, upper, flags) {
    val = _float_helper(val, flags)
    
    return format_padding(format_sign(val, flags) + format_float_precision(val, upper, flags, _floating_exp_helper), flags)
}

var signed_hex_format = function(val, upper, flags) {
    number_check(val)
    var ret = parseInt(val)
    ret = ret.toString(16)
    ret = format_int_precision(ret, flags)
    if (upper) {
        ret = ret.toUpperCase()
    }
    if (flags.pad_char === '0') {
        if (val < 0) {
            ret = ret.substring(1)
            ret = '-' + format_padding(ret, flags, true)
        }
        var sign = format_sign(val, flags)
        if (sign !== '') {
            ret = sign + format_padding(ret, flags, true)
        }
    }
    
    if (flags.alternate) {
        if (ret.charAt(0) === '-') {
            if (upper) {
                ret = "-0X" + ret.slice(1)
            } else {
                ret = "-0x" + ret.slice(1)
            }
        } else {
            if (upper) {
                ret = "0X" + ret
            } else {
                ret = "0x" + ret
            }
        }
    }
    return format_padding(format_sign(val, flags) + ret, flags)
}

var octal_format = function(val, flags) {
    number_check(val)
    var ret = parseInt(val)
    ret = ret.toString(8)
    ret = format_int_precision(ret, flags)
    
    if (flags.pad_char === '0') {
        if (val < 0) {
            ret = ret.substring(1)
            ret = '-' + format_padding(ret, flags, true)
        }
        var sign = format_sign(val, flags)
        if (sign !== '') {
            ret = sign + format_padding(ret, flags, true)
        }
    }
    
    if (flags.alternate) {
        if (ret.charAt(0) === '-') {
            ret = "-0o" + ret.slice(1)
        } else {
            ret = "0o" + ret
        }
    }
    return format_padding(ret, flags)
}

var single_char_format = function(val, flags) {
    if(isinstance(val,str) && val.length==1) return val
    try {
        val = _b_.int(val)  // yes, floats are valid (they are cast to int)
    } catch (err) {
        throw _b_.TypeError('%c requires int or char')
    }
    return format_padding(chr(val), flags)
}

var num_flag = function(c, flags) {
    if (c === '0' && !flags.padding && !flags.decimal_point && !flags.left) {
        flags.pad_char = '0'
        return
    }
    if (!flags.decimal_point) {
        flags.padding = (flags.padding || "") + c
    } else {
        flags.precision = (flags.precision || "") + c
    }
}

var decimal_point_flag = function(val, flags) {
    if (flags.decimal_point) {
        // can only have one decimal point
        throw new UnsupportedChar()
    }
    flags.decimal_point = true
}

var neg_flag = function(val, flags) {
    flags.pad_char = ' '  // overrides '0' flag
    flags.left = true
}

var space_flag = function(val, flags) {
    flags.space = true
}

var sign_flag = function(val, flags) {
    flags.sign = true
}

var alternate_flag = function(val, flags) {
    flags.alternate = true
}

var char_to_func_mapping = {
    's': str_format,
    'd': num_format,
    'i': num_format,
    'u': num_format,
    'o': octal_format,
    'r': repr_format,
    'a': ascii_format,
    'g': function(val, flags) {return floating_point_format(val, false, flags)},
    'G': function(val, flags) {return floating_point_format(val, true, flags)},
    'f': function(val, flags) {return floating_point_decimal_format(val, false, flags)},
    'F': function(val, flags) {return floating_point_decimal_format(val, true, flags)},
    'e': function(val, flags) {return floating_point_exponential_format(val, false, flags)},
    'E': function(val, flags) {return floating_point_exponential_format(val, true, flags)},
    'x': function(val, flags) {return signed_hex_format(val, false, flags)},
    'X': function(val, flags) {return signed_hex_format(val, true, flags)},
    'c': single_char_format,
    '0': function(val, flags) {return num_flag('0', flags)},
    '1': function(val, flags) {return num_flag('1', flags)},
    '2': function(val, flags) {return num_flag('2', flags)},
    '3': function(val, flags) {return num_flag('3', flags)},
    '4': function(val, flags) {return num_flag('4', flags)},
    '5': function(val, flags) {return num_flag('5', flags)},
    '6': function(val, flags) {return num_flag('6', flags)},
    '7': function(val, flags) {return num_flag('7', flags)},
    '8': function(val, flags) {return num_flag('8', flags)},
    '9': function(val, flags) {return num_flag('9', flags)},
    '-': neg_flag,
    ' ': space_flag,
    '+': sign_flag,
    '.': decimal_point_flag,
    '#': alternate_flag
}

// exception thrown when an unsupported char is encountered in legacy format
var UnsupportedChar = function() {
    this.name = "UnsupportedChar"
}

$StringDict.__mod__ = function(val, args) {
    return $legacy_format(val, args, char_to_func_mapping)
}

var $legacy_format = function(val, args, char_mapping) {
    var length = val.length
    var pos = 0 |0
    var argpos = null
    if (args && _b_.isinstance(args, _b_.tuple)) {
        argpos = 0 |0
    }
    var ret = ''
    var $get_kwarg_string = function(s) {
        // returns [val, newpos]
        ++pos
        var rslt = kwarg_key.exec(s.substring(newpos))
        if (!rslt) {
            throw _b_.ValueError("incomplete format key")
        }
        var key = rslt[1]
        newpos += rslt[0].length
        try {
            var val = _b_.getattr(args.__class__,'__getitem__')(args, key)
        } catch(err) {
            if (err.name === "KeyError") {
                throw err
            }
            throw _b_.TypeError("format requires a mapping")
        }
        return get_string_value(s, val)
    }

    var $get_arg_string = function(s) {
        // returns [val, newpos]
        var val
        
        // non-tuple args
        if (argpos === null) {
            // args is the value
            val = args
        } else {
            try {
                val = args[argpos++]
            }
            catch(err) {
                if (err.name === "IndexError") {
                    throw _b_.TypeError("not enough arguments for format string")
                } else {
                    throw err
                }
            }
        }
        return get_string_value(s, val)
    }
    var get_string_value = function(s, val) {
        // todo: get flags, type
        // todo: string value based on flags, type, value
        var flags = {'pad_char': ' '}
        do {
            var func = char_mapping[s[newpos]]
            try {
                if (func === undefined) {
                    throw new UnsupportedChar()
                } else {
                    var ret = func(val, flags)
                    if (ret !== undefined) {
                        return ret
                    }
                    ++newpos
                }
            } catch (err) {
                if (err.name === "UnsupportedChar") {
                    invalid_char = s[newpos]
                    if (invalid_char === undefined) {
                        throw _b_.ValueError("incomplete format")
                    }
                    throw _b_.ValueError("unsupported format character '" + invalid_char + 
                        "' (0x" + invalid_char.charCodeAt(0).toString(16) + ") at index " + newpos)
                } else if (err.name === "NotANumber") {
                    var try_char = s[newpos]
                    var cls = val.__class__
                    if (!cls) {
                        if (typeof(val) === 'string') {
                            cls = 'str'
                        } else {
                            cls = typeof(val)
                        }
                    } else {
                        cls = cls.__name__
                    }
                    throw _b_.TypeError("%" + try_char + " format: a number is required, not " + cls)
                } else {
                    throw err
                }
            }
        } while (true)
    }
    do {
        var newpos = val.indexOf('%', pos)
        if (newpos < 0) {
            ret += val.substring(pos)
            break
        }
        ret += val.substring(pos, newpos)
        ++newpos
        if (newpos < length) {
            if (val[newpos] === '%') {
                ret += '%'
            } else {
                var tmp
                if (val[newpos] === '(') {
                    ++newpos
                    ret += $get_kwarg_string(val)
                } else {
                    ret += $get_arg_string(val)
                }
            }
        } else {
            // % at end of string
            throw _b_.ValueError("incomplete format")
        }
        pos = newpos + 1
    } while (pos < length)
    return ret
}

var char_to_new_format_mapping = {
    'b': function(val, flags) {
        number_check(val)
        val = val.toString(2)
        if (flags.alternate) {
            val = "0b" + val
        }
        return val
    },
    'n': function(val, flags) {return floating_point_format(val, false, flags)},
    'N': function(val, flags) {return floating_point_format(val, true, flags)}
}

for (k in char_to_func_mapping) {
    char_to_new_format_mapping[k] = char_to_func_mapping[k]
}

$format_to_legacy = function(val, args) {
    return $legacy_format(val, args, char_to_new_format_mapping)
}

$StringDict.__mro__ = [$StringDict,$ObjectDict]

$StringDict.__mul__ = function(self,other){
    if(!isinstance(other,_b_.int)){throw _b_.TypeError(
        "Can't multiply sequence by non-int of type '"+
            $B.get_class(other).__name__+"'")}
    $res = ''
    for(var i=0;i<other;i++){$res+=self.valueOf()}
    return $res
}

$StringDict.__ne__ = function(self,other){return other!==self.valueOf()}

$StringDict.__repr__ = function(self){
    if(self===undefined){return "<class 'str'>"}
    var qesc = new RegExp("'","g") // to escape single quote
    var res = self.replace(/\n/g,'\\\\n')
    res = "'"+res.replace(qesc,"\\'")+"'"
    return res
}

$StringDict.__setattr__ = function(self,attr,value){setattr(self,attr,value)}

$StringDict.__setitem__ = function(self,attr,value){
    throw _b_.TypeError("'str' object does not support item assignment")
}
$StringDict.__str__ = function(self){
    if(self===undefined) return "<class 'str'>"
    return self.toString()
}
$StringDict.toString = function(){return 'string!'}

// generate comparison methods
var $comp_func = function(self,other){
    if(typeof other !=="string"){throw _b_.TypeError(
        "unorderable types: 'str' > "+$B.get_class(other).__name__+"()")}
    return self > other
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){
    eval("$StringDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// add "reflected" methods
$B.make_rmethods($StringDict)

// unsupported operations
var $notimplemented = function(self,other){
    throw NotImplementedError("OPERATOR not implemented for class str")
}

$StringDict.capitalize = function(self){
    if(self.length==0) return ''
    return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()
}

$StringDict.casefold = function(self) {
    throw _b_.NotImplementedError("function casefold not implemented yet");
}

$StringDict.center = function(self,width,fillchar){
    if(fillchar===undefined){fillchar=' '}else{fillchar=fillchar}
    if(width<=self.length) return self
    
    var pad = parseInt((width-self.length)/2)
    var res = Array(pad+1).join(fillchar) // is this statement faster than the for loop below?
    res += self + res
    if(res.length<width){res += fillchar}
    return res
}

$StringDict.count = function(self,elt){
    if(!(typeof elt==="string")){throw _b_.TypeError(
        "Can't convert '"+elt.__class__.__name__+"' object to str implicitly")}
    //needs to be non overlapping occurrences of substring in string.
    var n=0, pos=0
    while(1){
        pos=self.indexOf(elt,pos)
        if(pos>=0){ n++; pos+=elt.length} else break;
    }
    return n
}

$StringDict.encode = function(self, encoding) {
    if (encoding === undefined) encoding='utf-8'
    if(encoding=='rot13' || encoding=='rot_13'){
        // Special case : returns a string
        var res = ''
        for(var i=0, _len = self.length; i<_len ; i++){
            var char = self.charAt(i)
            if(('a'<=char && char<='m') || ('A'<=char && char<='M')){
                res += String.fromCharCode(String.charCodeAt(char)+13)
            }else if(('m'<char && char<='z') || ('M'<char && char<='Z')){
                res += String.fromCharCode(String.charCodeAt(char)-13)
            }else{res += char}
        }
        return res
    }
    return _b_.bytes(self, encoding)
}

$StringDict.endswith = function(self){
    // Return True if the string ends with the specified suffix, otherwise 
    // return False. suffix can also be a tuple of suffixes to look for. 
    // With optional start, test beginning at that position. With optional 
    // end, stop comparing at that position.
    var args = [], pos=0
    for(var i=1, _len_i=arguments.length; i<_len_i;i++){args[pos++]=arguments[i]}
    var start=null,end=null
    var $ns=$B.$MakeArgs("$StringDict.endswith",args,['suffix'],
        ['start','end'],null,null)
    var suffixes = $ns['suffix']
    if(!isinstance(suffixes,_b_.tuple)){suffixes=[suffixes]}
    start = $ns['start'] || start
    end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)
    for(var i=0, _len_i = suffixes.length; i < _len_i;i++){
        suffix = suffixes[i]
        if(suffix.length<=s.length &&
            s.substr(s.length-suffix.length)==suffix) return true
    }
    return false
}

$StringDict.expandtabs = function(self, tabsize) {
    tabsize=tabsize || 8
    var _str=''
    for (var i=0; i < tabsize; i++) _str+=' ' 
    return self.valueOf().replace(/\t/g, _str)
}

$StringDict.find = function(self){
    // Return the lowest index in the string where substring sub is found, 
    // such that sub is contained in the slice s[start:end]. Optional 
    // arguments start and end are interpreted as in slice notation. 
    // Return -1 if sub is not found.
    var start=0,end=self.length
    var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],
        ['start','end'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    if(!isinstance(sub,str)){throw _b_.TypeError(
        "Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
    if(!isinstance(start,_b_.int)||!isinstance(end,_b_.int)){
        throw _b_.TypeError(
        "slice indices must be integers or None or have an __index__ method")}
    var s = self.substring(start,end)
    var esc_sub = ''
    for(var i=0, _len_i = sub.length; i < _len_i;i++){
        switch(sub.charAt(i)) {
          case '[':
          case '.':
          case '*':
          case '+':
          case '?':
          case '|':
          case '(':
          case ')':
          case '$':
          case '^':
            esc_sub += '\\'
        }
        esc_sub += sub.charAt(i)
    }
    var res = s.search(esc_sub)
    if(res==-1) return -1
    return start+res
}

var $FormattableString=function(format_string) {
    // inspired from 
    // https://raw.github.com/florentx/stringformat/master/stringformat.py
    this.format_string=format_string

    this._prepare = function() {
       //console.log('prepare')
       var match = arguments[0]
       //console.log('match1', match)

       var p1 = '' + arguments[2]

       if (match == '%') return '%%'
       if (match.substring(0,1) == match.substring(match.length-1)) {
          // '{{' or '}}'
          return match.substring(0, Math.floor(match.length/2))
       }

       if (p1.charAt(0) == '{' && p1.charAt(match.length-1) == '}') {
          p1=match.substring(1, p1.length-1)
       }

       var _repl
       if (match.length >= 2) {
          _repl=''
       } else {
         _repl = match.substring(1)
       }

       var _i = p1.indexOf(':')
       var _out
       if (_i > -1) {
         _out = [p1.slice(0,_i), p1.slice(_i+1)]
       } else { _out=[p1]}
  
       var _field=_out[0] || ''
       var _format_spec=_out[1] || ''

       _out= _field.split('!')
       var _literal=_out[0] || ''
       var _sep=_field.indexOf('!') > -1?'!': undefined // _out[1]
       var _conv=_out[1]  //conversion

       if (_sep && _conv === undefined) {
          throw _b_.ValueError("end of format while looking for conversion specifier")
       }

       if (_conv !== undefined && _conv.length > 1) {
          throw _b_.ValueError("expected ':' after format specifier")
       }

       if (_conv !== undefined && 'rsa'.indexOf(_conv) == -1) {
          throw _b_.ValueError("Unknown conversion specifier " + _conv)
       }

       _name_parts=this.field_part.apply(null, [_literal])

       var _start=_literal.charAt(0)
       var _name=''
       if (_start=='' || _start=='.' || _start == '[') {
          // auto-numbering
          if (this._index === undefined) {
             throw _b_.ValueError("cannot switch from manual field specification to automatic field numbering")
          }

          _name = self._index.toString()
          this._index+=1

          if (! _literal ) {
             _name_parts.shift()
          }
       } else {
         _name = _name_parts.shift()[1]
         if (this._index !== undefined && !isNaN(_name)) {
            // manual specification
            if (this._index) {
               throw _b_.ValueError("cannot switch from automatic field " +
                                "numbering to manual field specification")
               this._index=undefined
            }
         }
       }

       var _empty_attribute=false

       var _k
       for (var i=0, _len_i = _name_parts.length; i < _len_i; i++) {
           _k = _name_parts[i][0]
           var _v = _name_parts[i][1]
           var _tail = _name_parts[i][2]
           if (_v === '') {_empty_attribute = true}
           if (_tail !== '') {
              throw _b_.ValueError("Only '.' or '[' may follow ']' " +
                               "in format field specifier")
           }
       }

       if (_name_parts && _k == '[' && ! 
          _literal.charAt(_literal.length) == ']') {
          throw _b_.ValueError("Missing ']' in format string")
       }

       if (_empty_attribute) {
          throw _b_.ValueError("Empty attribute in format string")
       }

       var _rv=''
       if (_format_spec.indexOf('{') != -1) {
          _format_spec = _format_spec.replace(this.format_sub_re, this._prepare)
          _rv = [_name_parts, _conv, _format_spec]
          if (this._nested[_name] === undefined) {
             this._nested[_name]=[]
             this._nested_array.push(_name)
          }
          this._nested[_name].push(_rv) 
       } else {
          _rv = [_name_parts, _conv, _format_spec]
          if (this._kwords[_name] === undefined) {
             this._kwords[_name]=[]
             this._kwords_array.push(_name)
          }
          this._kwords[_name].push(_rv)
       }

       return '%(' + id(_rv) + ')s'
    }  // this._prepare

    this.format=function() {
       // same as str.format() and unicode.format in Python 2.6+

       var $ns=$B.$MakeArgs('format',arguments,[],[],'args','kwargs')
       var args=$ns['args']
       var kwargs=$ns['kwargs']
       
       if (args.length>0) {
          for (var i=0, _len_i = args.length; i < _len_i; i++) {
              //kwargs[str(i)]=args.$dict[i]
              getattr(kwargs, '__setitem__')(str(i), args[i])
          }
       }

       //encode arguments to ASCII, if format string is bytes
       var _want_bytes = isinstance(this._string, str)
       var _params=_b_.dict()

       for (var i=0, _len_i = this._kwords_array.length; i < _len_i; i++) {
           var _name = this._kwords_array[i]
           var _items = this._kwords[_name]
           var _var = getattr(kwargs, '__getitem__')(_name)
           var _value;
           if (hasattr(_var, 'value')) {
              _value = getattr(_var, 'value')
           } else {
             _value=_var
           }

           for (var j=0, _len_j = _items.length; j < _len_j; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               var _f=this.format_field.apply(null, [_value, _parts,_conv,_spec,_want_bytes])
               getattr(_params,'__setitem__')(id(_items[j]).toString(), _f)
           }
       }

       for (var i=0, _len_i = this._nested_array.length; i < _len_i; i++) {
           var _name = this._nested_array[i]
           var _items = this._nested[i]

           var _var = getattr(kwargs, '__getitem__')(_name)
           var _value;
           if (hasattr(_var, 'value')) {
              _value = getattr(getattr(kwargs, '__getitem__')(_name), 'value')
           } else {
             _value=_var
           }

           for (var j=0, _len_j = _items.length; j < _len_j; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               _spec=$format_to_legacy(_spec, _params)

               var _f=this.format_field.apply(null, [_value, _parts,_conv,_spec,_want_bytes])
               getattr(_params,'__setitem__')(id(_items[j]).toString(), _f)
           }
       }
       return $format_to_legacy(this._string, _params)
    }  // this.format

    this.format_field=function(value,parts,conv,spec,want_bytes) {

       if (want_bytes === undefined) want_bytes = false

       for (var i=0, _len_i = parts.length; i < _len_i; i++) {
           var _k = parts[i][0]
           var _part = parts[i][1]

           if (_k) {
              if (!isNaN(_part)) {
                 value = value[parseInt(_part)]
              } else {
                 value = getattr(value, _part)
              }
           } else {
              value = value[_part]
           }
       }

       if (conv) {
          // fix me
          value = $format_to_legacy((conv == 'r') && '%r' || '%s', value)
       }

       value = this.strformat(value, spec)

       if (want_bytes) { return value.toString()}

       return value
    }

    this.strformat=function(value, format_spec) {
       if (format_spec === undefined) format_spec = ''
       if (!isinstance(value,[str,_b_.int]) && hasattr(value, '__format__')) {
          return getattr(value, '__format__')(format_spec)
       }
       var _m = this.format_spec_re.test(format_spec)

       if (!_m) throw _b_.ValueError('Invalid conversion specification') 

       var _match=this.format_spec_re.exec(format_spec)
       var _align=_match[1]
       var _sign=_match[2]
       var _prefix=_match[3]
       var _width=_match[4]
       var _comma=_match[5]
       var _precision=_match[6]
       var _conversion=_match[7]

       var _is_float = isinstance(value, _b_.float)
       var _is_integer = isinstance(value, _b_.int)
       var _is_numeric = _is_float || _is_integer

       if (_prefix != '' && ! _is_numeric) {
          if (_is_numeric) {
             throw _b_.ValueError('Alternate form (#) not allowed in float format specifier')
          } else {
             throw _b_.ValueError('Alternate form (#) not allowed in string format specification')
          } 
       }

       if (_is_numeric && _conversion == 'n') {
          _conversion = _is_integer && 'd' || 'g'
       } else {
          if (_sign) {
             if (! _is_numeric) {
                throw _b_.ValueError('Sign not allowed in string format specification');
             }
             if (_conversion == 'c') {
                throw("Sign not allowed with integer format specifier 'c'")
             }
          }
       }

       if (_comma !== '') {
          value += ''
          var x = value.split('.')
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
    
          while (rgx.test(x1)) {
                 x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }
          value=x1+x2   
       }

       var _rv
       if (_conversion != '' && ((_is_numeric && _conversion == 's') || 
          (! _is_integer && 'coxX'.indexOf(_conversion) != -1))) {
          console.log(_conversion)
          throw _b_.ValueError('Fix me')
       }

       if (_conversion == 'c') _conversion = 's'
    
       // fix me
       _rv='%' + _prefix + _precision + (_conversion || 's')

       _rv = $format_to_legacy(_rv, value)

       if (_sign != '-' && value >= 0) _rv = _sign + _rv

       var _zero = false
       if (_width) {
          _zero = _width.charAt(0) == '0'
          _width = parseInt(_width)
       } else {
          _width = 0
       }

       // Fastpath when alignment is not required

       if (_width <= _rv.length) {
          if (! _is_float && (_align == '=' || (_zero && ! _align))) {
             throw _b_.ValueError("'=' alignment not allowed in string format specifier")
          }
          return _rv
       }

       _fill = _align.substr(0,_align.length-1)
       _align= _align.substr(_align.length-1)

       if (! _fill) {_fill = _zero && '0' || ' '}

       if (_align == '^') {
          _rv = getattr(_rv, 'center')(_width, _fill)
       } else if (_align == '=' || (_zero && ! _align)) {
          if (! _is_numeric) {
             throw _b_.ValueError("'=' alignment not allowed in string format specifier")
          }
          if (_value < 0 || _sign != '-') {
             _rv = _rv.substring(0,1) + getattr(_rv.substring(1),'rjust')(_width - 1, _fill)
          } else {
             _rv = getattr(_rv, 'rjust')(_width, _fill)
          }
       } else if ((_align == '>' || _align == '=') || (_is_numeric && ! _aligned)) {
         _rv = getattr(_rv, 'rjust')(_width, _fill)
       } else if (_align == '<') {
         _rv = getattr(_rv, 'ljust')(_width, _fill)
       } else {
         throw _b_.ValueError("'" + _align + "' alignment not valid")
       }

       return _rv
    }

    this.field_part=function(literal) {
       if (literal.length == 0) return [['','','']]

       var _matches=[]
       var _pos=0

       var _start='', _middle='', _end=''
       var arg_name=''

       // arg_name
       if (literal === undefined) console.log(literal)
       var _lit=literal.charAt(_pos)
       while (_pos < literal.length &&
              _lit !== '[' && _lit !== '.') {
              arg_name += _lit
              _pos++
              _lit=literal.charAt(_pos)
       }

       // todo.. need to work on code below, but this takes cares of most
       // common cases.
       if (arg_name != '') _matches.push(['', arg_name, ''])

       //return _matches

       var attribute_name=''
       var element_index=''

       //look for attribute_name and element_index
       while (_pos < literal.length) {
          var car = literal.charAt(_pos)

          if (car == '[') { // element_index
             _start=_middle=_end=''
             _pos++

             car = literal.charAt(_pos)
             while (_pos < literal.length && car !== ']') {
                _middle += car
                _pos++
                car = literal.charAt(_pos)
             }

             _pos++
             if (car == ']') {
                while (_pos < literal.length) {
                  _end+=literal.charAt(_pos)
                  _pos++
                }
             }

             _matches.push([_start, _middle, _end])
          
          } else if (car == '.') { // attribute_name
                  _middle=''
                  _pos++
                  car = literal.charAt(_pos)
                  while (_pos < literal.length &&
                         car !== '[' && 
                         car !== '.') {
                      //console.log(car)
                      _middle += car
                      _pos++
                      car = literal.charAt(_pos)
                  }

                  _matches.push(['.', _middle, ''])
          }
       }
       return _matches
    }

    this.format_str_re = new RegExp(
      '(%)' +
      '|((?!{)(?:{{)+' +
      '|(?:}})+(?!})' +
      '|{(?:[^{}](?:[^{}]+|{[^{}]*})*)?})', 'g'
    )

    this.format_sub_re = new RegExp('({[^{}]*})')  // nested replacement field

    this.format_spec_re = new RegExp(
      '((?:[^{}]?[<>=^])?)' +      // alignment
      '([\\-\\+ ]?)' +                // sign
      '(#?)' + '(\\d*)' + '(,?)' +    // base prefix, minimal width, thousands sep
      '((?:\.\\d+)?)' +             // precision
      '(.?)$'                      // type
    )

    this._index = 0
    this._kwords = {}
    this._kwords_array=[]
    this._nested = {}
    this._nested_array=[]

    this._string=format_string.replace(this.format_str_re, this._prepare)

    return this
}


$StringDict.format = function(self) {

    var _fs = $FormattableString(self.valueOf())
    var args=[], pos=0
    // we don't need the first item (ie, self)
    for (var i=1,_len_i=arguments.length;i<_len_i;i++){args[pos++]=arguments[i]}
    return _fs.format.apply(null, args)
}

$StringDict.format_map = function(self) {
  throw NotImplementedError("function format_map not implemented yet");
}

$StringDict.index = function(self){
    // Like find(), but raise ValueError when the substring is not found.
    var res = $StringDict.find.apply(self,arguments)
    if(res===-1) throw _b_.ValueError("substring not found")
    return res
}

$StringDict.isalnum = function(self) {return /^[a-z0-9]+$/i.test(self)}

$StringDict.isalpha = function(self) {return /^[a-z]+$/i.test(self)}

$StringDict.isdecimal = function(self) {
  // this is not 100% correct
  return /^[0-9]+$/.test(self)
}

$StringDict.isdigit = function(self) { return /^[0-9]+$/.test(self)}

$StringDict.isidentifier = function(self) {

  switch(self) {
    case 'False':
    case 'None':
    case 'True':
    case 'and':
    case 'as':
    case 'assert':
    case 'break':
    case 'class':
    case 'continue':
    case 'def':
    case 'del':
    case 'elif':
    case 'else':
    case 'except':
    case 'finally':
    case 'for':
    case 'from':
    case 'global':
    case 'if':
    case 'import':
    case 'in':
    case 'is':
    case 'lambda':
    case 'nonlocal':
    case 'not':
    case 'or':
    case 'pass':
    case 'raise':
    case 'return':
    case 'try':
    case 'while':
    case 'with':
    case 'yield':
      return true
  }

  // fixme..  this isn't complete but should be a good start
  return /^[a-z][0-9a-z_]+$/i.test(self)
}

$StringDict.islower = function(self) {return /^[a-z]+$/.test(self)}

// not sure how to handle unicode variables
$StringDict.isnumeric = function(self) {return /^[0-9]+$/.test(self)}

// inspired by http://www.codingforums.com/archive/index.php/t-17925.html
$StringDict.isprintable = function(self) {return !/[^ -~]/.test(self)}

$StringDict.isspace = function(self) {return /^\s+$/i.test(self)}

$StringDict.istitle = function(self) {return /^([A-Z][a-z]+)(\s[A-Z][a-z]+)$/i.test(self)}

$StringDict.isupper = function(self) {return /^[A-Z]+$/.test(self)}

$StringDict.join = function(self,obj){
    var iterable=iter(obj)
    var res = '',count=0
    while(1){
        try{
            var obj2 = next(iterable)
            if(!isinstance(obj2,str)){throw _b_.TypeError(
                "sequence item "+count+": expected str instance, "+$B.get_class(obj2).__name__+" found")}
            res += obj2+self
            count++
        }catch(err){
            if(err.__name__==='StopIteration'){$B.$pop_exc();break}
            else{throw err}
        }
    }
    if(count==0) return ''
    return res.substr(0,res.length-self.length)
}

$StringDict.ljust = function(self, width, fillchar) {
  if (width <= self.length) return self
  if (fillchar === undefined) fillchar=' '
  return self + Array(width - self.length + 1).join(fillchar)
}

$StringDict.lower = function(self){return self.toLowerCase()}

$StringDict.lstrip = function(self,x){
    var pattern = null
    if(x==undefined){pattern="\\s*"}
    else{pattern = "["+x+"]*"}
    var sp = new RegExp("^"+pattern)
    return self.replace(sp,"")
}

// note, maketrans should be a static function.
$StringDict.maketrans = function(from, to) {
   var _t=[]
   // make 'default' translate table
   for(var i=0; i < 256; i++) _t[i]=String.fromCharCode(i)

   // make substitution in the translation table
   for(var i=0, _len_i = from.source.length; i < _len_i; i++) {
      var _ndx=from.source[i].charCodeAt(0)     //retrieve ascii code of char
      _t[_ndx]=to.source[i]
   }

   // create a data structure that string.translate understands
   var _d=dict()
   for(var i=0; i < 256; i++) {
      _b_.dict.$dict.__setitem__(_d, i, _t[i])
   }
   return _d
}

$StringDict.partition = function(self,sep) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var i=self.indexOf(sep)
  if (i== -1) return _b_.tuple([self, '', ''])
  return _b_.tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}

function $re_escape(str)
{
  var specials = "[.*+?|()$^"
  for(var i=0, _len_i = specials.length; i < _len_i;i++){
      var re = new RegExp('\\'+specials.charAt(i),'g')
      str = str.replace(re, "\\"+specials.charAt(i))
  }
  return str
}

$StringDict.replace = function(self, old, _new, count) {
    // Replaces occurrences of 'old' by '_new'. Count references
    // the number of times to replace. In CPython, negative or undefined 
    // values of count means replace all.
    if (count === undefined) {
        count = -1;
    } else {
        // Validate instance type of 'count'
        if (!isinstance(count,[_b_.int,_b_.float])) {
            throw _b_.TypeError("'" + str(count.__class__) + "' object cannot be interpreted as an integer");
        } else if (isinstance(count, _b_.float)) {
            throw _b_.TypeError("integer argument expected, got float");
        }
    }

    var res = self.valueOf();
    var pos = -1;
    if (count < 0) count = res.length;
    while (count > 0) {
        pos = res.indexOf(old, pos);
        if (pos < 0)
            break;
        res = res.substr(0, pos) + _new + res.substr(pos + old.length);
        pos = pos + _new.length;
        count--;
    }
    return res;
}

$StringDict.rfind = function(self){
    // Return the highest index in the string where substring sub is found, 
    // such that sub is contained within s[start:end]. Optional arguments 
    // start and end are interpreted as in slice notation. Return -1 on failure.
    var start=0,end=self.length
    var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],
        ['start','end'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    if(!isinstance(sub,str)){throw _b_.TypeError(
        "Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
    if(!isinstance(start,_b_.int)||!isinstance(end,_b_.int)){throw _b_.TypeError(
        "slice indices must be integers or None or have an __index__ method")}

    var s = self.substring(start,end)
    //var reversed = '',rsub=''
    //for(var i=s.length-1;i>=0;i--){reversed += s.charAt(i)}
    //for(var i=sub.length-1;i>=0;i--){rsub += sub.charAt(i)}
    //var res = reversed.search($re_escape(rsub))
    //if(res==-1) return -1
    //return start+s.length-1-res-sub.length+1

    // why not use lastIndexOf, which passes all brython tests..?
    return self.lastIndexOf(sub)
}

$StringDict.rindex = function(){
    // Like rfind() but raises ValueError when the substring sub is not found
    var res = $StringDict.rfind.apply(this,arguments)
    if(res==-1){throw _b_.ValueError("substring not found")}
    return res
}

$StringDict.rjust = function(self) {
    var fillchar = ' '
    var $ns=$B.$MakeArgs("$StringDict.rjust",arguments,['self','width'],
                      ['fillchar'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}

    if (width <= self.length) return self

    return Array(width - self.length + 1).join(fillchar) + self
}

$StringDict.rpartition = function(self,sep) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var pos=self.length-sep.length
  while(1){
      if(self.substr(pos,sep.length)==sep){
          return _b_.tuple([self.substr(0,pos),sep,self.substr(pos+sep.length)])
      }else{
          pos--
          if(pos<0){return _b_.tuple(['','',self])}
      }
  }
}

$StringDict.rsplit = function(self) {
    var args = [], pos=0
    for(var i=1,_len_i=arguments.length;i<_len_i;i++){args[pos++]=arguments[i]}
    var $ns=$B.$MakeArgs("$StringDict.rsplit",args,[],[],'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = _b_.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)

    //var array=$StringDict.split(self) 

    var array=$StringDict.split(self, sep) 

    if (array.length <= maxsplit || maxsplit == -1) return array

    var s=[]
    
    s = array.splice(array.length - maxsplit, array.length)
    s.splice(0, 0, array.join(sep))
    
    return s
}

$StringDict.rstrip = function(self,x){
    if(x==undefined){var pattern="\\s*"}
    else{var pattern = "["+x+"]*"}
    sp = new RegExp(pattern+'$')
    return str(self.replace(sp,""))
}

$StringDict.split = function(self){
    var args = [], pos=0
    for(var i=1,_len_i=arguments.length;i<_len_i;i++){args[pos++]=arguments[i]}
    var $ns=$B.$MakeArgs("$StringDict.split",args,[],[],'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = _b_.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)
    if(sep=='') throw _b_.ValueError('empty separator')
    if(sep===None){
        var res = []
        var pos = 0
        while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
        if(pos===self.length-1){return []}
        var name = ''
        while(1){
            if(self.charAt(pos).search(/\s/)===-1){
                if(name===''){name=self.charAt(pos)}
                else{name+=self.charAt(pos)}
            }else{
                if(name!==''){
                    res.push(name)
                    if(maxsplit!==-1&&res.length===maxsplit+1){
                        res.pop()
                        res.push(name+self.substr(pos))
                        return res
                    }
                    name=''
                }
            }
            pos++
            if(pos>self.length-1){
                if(name){res.push(name)}
                break
            }
        }
        return res
    }else{
        var esc_sep = ''
        for(var i=0, _len_i = sep.length; i < _len_i;i++){
            switch(sep.charAt(i)) {
              case '*':
              case '+':
              case '.':
              case '[':
              case ']':
              case '(':
              case ')':
              case '|':
              case '$':
              case '^':
                esc_sep += '\\'
            }
            esc_sep += sep.charAt(i)
        }
        var re = new RegExp(esc_sep)
        if (maxsplit==-1){
            // use native Javascript split on self
            return self.valueOf().split(re,maxsplit)
        }

        // javascript split behavior is different from python when
        // a maxsplit argument is supplied. (see javascript string split
        // function docs for details)
        var l=self.valueOf().split(re,-1)
        var a=l.slice(0, maxsplit)
        var b=l.slice(maxsplit, l.length)
        if (b.length > 0) a.push(b.join(sep))

        return a
    }
}

$StringDict.splitlines = function(self){return $StringDict.split(self,'\n')}

$StringDict.startswith = function(self){
    // Return True if string starts with the prefix, otherwise return False. 
    // prefix can also be a tuple of prefixes to look for. With optional 
    // start, test string beginning at that position. With optional end, 
    // stop comparing string at that position.
    var $ns=$B.$MakeArgs("$StringDict.startswith",arguments,['self','prefix'],
        ['start','end'],null,null)
    var prefixes = $ns['prefix']
    if(!isinstance(prefixes,_b_.tuple)){prefixes=[prefixes]}
    var start = $ns['start'] || 0
    var end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)

    for (var i=0, _len_i = prefixes.length; i < _len_i; i++) {
        if (s.indexOf(prefixes[i]) == 0) return true
    }
    return false
}

$StringDict.strip = function(self,x){
    if(x==undefined){x = "\\s"}
    return $StringDict.rstrip($StringDict.lstrip(self,x),x)
}

$StringDict.swapcase = function(self) {
    //inspired by http://www.geekpedia.com/code69_Swap-string-case-using-JavaScript.html
    return self.replace(/([a-z])|([A-Z])/g, function($0,$1,$2)
        { return ($1) ? $0.toUpperCase() : $0.toLowerCase()
    })
}

$StringDict.title = function(self) {
    //inspired from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return self.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$StringDict.translate = function(self,table) {
    var res = [], pos=0
    if (isinstance(table, _b_.dict)) {
       for (var i=0, _len_i = self.length; i < _len_i; i++) {
           var repl = _b_.dict.$dict.get(table,self.charCodeAt(i),-1)
           if(repl==-1){res[pos++]=self.charAt(i)}
           else if(repl!==None){res[pos++]=repl}
       }
    }
    return res.join('')
}

$StringDict.upper = function(self){return self.toUpperCase()}

$StringDict.zfill = function(self, width) {
  if (width === undefined || width <= self.length || !self.isnumeric()) {
     return self
  }

  return Array(width - self.length +1).join('0');
}

function str(arg){
    if(arg===undefined) return ''
    switch(typeof arg) {
      case 'string': return arg
      case 'number': return arg.toString()
    }
    
    try{
        if(arg.__class__===$B.$factory){
            // arg is a class (the factory function)
            // In this case, str() doesn't use the attribute __str__ of the
            // class or its subclasses, but the attribute __str__ of the
            // class metaclass (usually "type") or its subclasses (usually
            // "object")
            // The metaclass is the attribute __class__ of the class dictionary
            var func = $B.$type.__getattribute__(arg.$dict.__class__,'__str__')
            if(func.__func__===_b_.object.$dict.__str__){return func(arg)}
            return func()
        }

        var f = getattr(arg,'__str__')
        // XXX fix : if not better than object.__str__, try __repr__
        return f()
    }
    catch(err){
        //console.log('err '+err)
        $B.$pop_exc()
        try{ // try __repr__
             var f = getattr(arg,'__repr__')
             return getattr(f,'__call__')()
        }catch(err){
             $B.$pop_exc()
             console.log(err+'\ndefault to toString '+arg);return arg.toString()
        }
    }
}
str.__class__ = $B.$factory
str.$dict = $StringDict
$StringDict.$factory = str
$StringDict.__new__ = function(cls){
    if(cls===undefined){
        throw _b_.TypeError('str.__new__(): not enough arguments')
    }
    return {__class__:cls.$dict}
}

$B.set_func_names($StringDict)

// dictionary and factory for subclasses of string
var $StringSubclassDict = {
    __class__:$B.$type,
    __name__:'str'
}

// the methods in subclass apply the methods in $StringDict to the
// result of instance.valueOf(), which is a Javascript string
for(var $attr in $StringDict){
    if(typeof $StringDict[$attr]=='function'){
        $StringSubclassDict[$attr]=(function(attr){
            return function(){
                var args = [], pos=0
                if(arguments.length>0){
                    var args = [arguments[0].valueOf()], pos=1
                    for(var i=1, _len_i = arguments.length; i < _len_i;i++){
                        args[pos++]=arguments[i]
                    }
                }
                return $StringDict[attr].apply(null,args)
            }
        })($attr)
    }
}
$StringSubclassDict.__mro__ = [$StringSubclassDict,$ObjectDict]

// factory for str subclasses
$B.$StringSubclassFactory = {
    __class__:$B.$factory,
    $dict:$StringSubclassDict
}

_b_.str = str

})(__BRYTHON__)
