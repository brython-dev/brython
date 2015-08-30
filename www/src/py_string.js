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

function preformat(self, fmt){
    if(fmt.empty){return _b_.str(self)}
    if(fmt.type && fmt.type!='s'){
        throw _b_.ValueError("Unknown format code '"+fmt.type+
            "' for object of type 'str'")
    }    
    return self
}

$StringDict.__format__ = function(self, format_spec) {
    var fmt = new $B.parse_format_spec(format_spec)
    // For strings, alignment default to left
    fmt.align = fmt.align || '<'
    return $B.format_width(preformat(self, fmt), fmt)
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
    throw _b_.TypeError('string indices must be integers')
}

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
    return _b_.None
}

var $str_iterator = $B.$iterator_class('str_iterator')
$StringDict.__iter__ = function(self){
    var items = self.split('') // list of all characters in string
    return $B.$iterator(items,$str_iterator)
}

$StringDict.__len__ = function(self){return self.length}

// Start of section for legacy formatting (with %)

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
    var s
    if (val.__class__ === $B.LongInt.$dict) {
       s=$B.LongInt.$dict.to_base(val, 10)
    } else {
       s=val.toString()
    }
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
    if (val.__class__ === $B.LongInt.$dict) {
      val = $B.LongInt.$dict.to_base(val, 10)
    } else {
      val = parseInt(val)
    }

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
    var ret
    number_check(val)

    if (val.__class__ === $B.LongInt.$dict) {
       ret=$B.LongInt.$dict.to_base(val, 16)
    } else {
       ret = parseInt(val)
       ret = ret.toString(16)
    }
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
    var ret 

    if (val.__class__ === $B.LongInt.$dict) {
      ret = $B.LongInt.$dict.to_base(8)
    } else {
      ret = parseInt(val)
      ret = ret.toString(8)
    }

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

var char_mapping = {
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

$StringDict.__mod__ = function(self, args) {

    var length = self.length
    var pos = 0 |0
    var argpos = null
    if (args && _b_.isinstance(args, _b_.tuple)) {
        argpos = 0 |0
    }
    var ret = ''
    var $get_kwarg_string = function(s) {
        // returns [self, newpos]
        ++pos
        var rslt = kwarg_key.exec(s.substring(newpos))
        if (!rslt) {
            throw _b_.ValueError("incomplete format key")
        }
        var key = rslt[1]
        newpos += rslt[0].length
        try {
            var self = _b_.getattr(args.__class__,'__getitem__')(args, key)
        } catch(err) {
            if (err.name === "KeyError") {
                throw err
            }
            throw _b_.TypeError("format requires a mapping")
        }
        return get_string_value(s, self)
    }

    var $get_arg_string = function(s) {
        // returns [self, newpos]
        var self
        
        // non-tuple args
        if (argpos === null) {
            // args is the value
            self = args
        } else {
            try {
                self = args[argpos++]
            }
            catch(err) {
                if (err.name === "IndexError") {
                    throw _b_.TypeError("not enough arguments for format string")
                } else {
                    throw err
                }
            }
        }
        return get_string_value(s, self)
    }
    var get_string_value = function(s, self) {
        // todo: get flags, type
        // todo: string value based on flags, type, value
        var flags = {'pad_char': ' '}
        do {
            var func = char_mapping[s[newpos]]
            try {
                if (func === undefined) {
                    throw new UnsupportedChar()
                } else {
                    var ret = func(self, flags)
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
                    var cls = self.__class__
                    if (!cls) {
                        if (typeof(self) === 'string') {
                            cls = 'str'
                        } else {
                            cls = typeof(self)
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
        var newpos = self.indexOf('%', pos)
        if (newpos < 0) {
            ret += self.substring(pos)
            break
        }
        ret += self.substring(pos, newpos)
        ++newpos
        if (newpos < length) {
            if (self[newpos] === '%') {
                ret += '%'
            } else {
                var tmp
                if (self[newpos] === '(') {
                    ++newpos
                    ret += $get_kwarg_string(self)
                } else {
                    ret += $get_arg_string(self)
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
    var res = self.replace(/\n/g,'\\\\n')
    // escape the escape char
    res = res.replace(/\\/g, '\\\\')
    if(res.search('"')==-1 && res.search("'")==-1){
        return "'"+res+"'"
    }else if(self.search('"')==-1){
        return '"'+res+'"'
    }
    var qesc = new RegExp("'","g") // to escape single quote
    res = "'"+res.replace(qesc,"\\'")+"'"    
    return res
}

$StringDict.__setattr__ = function(self,attr,value){return setattr(self,attr,value)}

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
    var $ns=$B.$MakeArgs1("$StringDict.endswith",4,
        {self:null, suffix:null, start:null, end:null}, 
        ['self', 'suffix', 'start', 'end'],
        arguments,{start:0, end:self.length-1},null,null)
    var suffixes = $ns['suffix']
    if(!isinstance(suffixes,_b_.tuple)){suffixes=[suffixes]}
    var start = $ns['start'],
        end = $ns['end']
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
    var $ns=$B.$MakeArgs1("$StringDict.find",4,
        {self:null, sub:null, start:null, end:null}, 
        ['self', 'sub', 'start','end'],
        arguments,{start:0, end:self.length},null,null)
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

// Next function used by method .format()

function parse_format(fmt_string){

    // Parse a "format string", as described in the Python documentation
    // Return a format object. For the format string 
    //     a.x[z]!r:...
    // the object has attributes :
    // - name : "a"
    // - name_ext : [".x", "[z]"]
    // - conv : r
    // - spec : rest of string after :

    var elts = fmt_string.split(':'), name, conv, spec, name_ext=[]
    if(elts.length==1){
        // No : in the string : it only contains a name
        name = fmt_string
    }else{
        // name is before the first ":"
        // spec (the format specification) is after
        name = elts[0]
        spec = elts.splice(1).join(':')
    }

    var elts = name.split('!')
    if(elts.length>1){
        name=elts[0]
        conv=elts[1] // conversion flag
        if(conv.length!==1 || 'ras'.search(conv)==-1){
            throw _b_.ValueError('wrong conversion flag '+conv)
        }
    }

    if(name!==undefined){
        // "name' may be a subscription or attribute
        // Put these "extensions" in the list "name_ext"
        function name_repl(match){
            name_ext.push(match)
            return ''
        }
        var name_ext_re = /\.[_a-zA-Z][_a-zA-Z0-9]*|\[[_a-zA-Z][_a-zA-Z0-9]*\]|\[[0-9]+\]/g
        name = name.replace(name_ext_re, name_repl)
    }

    return {name: name, name_ext: name_ext, 
        conv: conv, spec: spec||''}
}

$StringDict.format = function(self) {

    var $ = $B.$MakeArgs1('format', 1, {self:null}, ['self'],
        arguments, {}, 'args', 'kw')

    // Parse self to detect formatting instructions
    // Create a list "parts" made of sections of the string :
    // - elements of even rank are literal text
    // - elements of odd rank are "format objects", built from the
    //   format strings in self (of the form {...})
    var pos=0, _len=self.length, car, text='', parts=[], rank=0, defaults={}

    while(pos<_len){
        car = self.charAt(pos)
        if(car=='{' && self.charAt(pos+1)=='{'){
            // replace {{ by literal {
            text += '{'
            pos+=2
        }else if(car=='}' && self.charAt(pos+1)=='}'){
            // replace }} by literal }
            text += '}'
            pos+=2
        }else if(car=='{'){
            // Start of a format string
            
            // Store current literal text
            parts.push(text)

            // Search the end of the format string, ie the } closing the
            // opening {. Since the string can contain other pairs {} for
            // nested formatting, an integer nb is incremented for each { and
            // decremented for each } ; the end of the format string is
            // reached when nb==0
            var end = pos+1, nb=1
            while(end<_len){
                if(self.charAt(end)=='{'){nb++;end++}
                else if(self.charAt(end)=='}'){
                    nb--;end++
                    if(nb==0){
                        // End of format string
                        var fmt_string = self.substring(pos+1, end-1)

                        // Create a format object, by function parse_format
                        var fmt_obj = parse_format(fmt_string)

                        // If no name is explicitely provided, use the rank
                        if(!fmt_obj.name){
                            fmt_obj.name=rank+''
                            rank++
                        }

                        if(fmt_obj.spec!==undefined){
                            // "spec" may contain "nested replacement fields"
                            // In this case, evaluate them using the keyword
                            // arguments passed to format()
                            function replace_nested(name, key){
                                var x = _b_.dict.$dict.__getitem__($.kw, key)
                                return x
                            }
                            fmt_obj.spec = fmt_obj.spec.replace(/\{(.+?)\}/g, 
                                replace_nested)
                        }
                        
                        // Store format object in list "parts"
                        parts.push(fmt_obj)
                        text = ''
                        break
                    }
                }else{end++}
            }
            if(nb>0){throw ValueError("wrong format "+self)}
            pos = end
        }else{text += car;pos++}
    }
    if(text){parts.push(text)}
    
    // Apply formatting to the values passed to format()
    var res = '', fmt
    for(var i=0;i<parts.length;i++){
        // Literal text is added unchanged
        if(typeof parts[i]=='string'){res += parts[i];continue}
        
        // Format objects
        fmt = parts[i]
        if(fmt.name.charAt(0).search(/\d/)>-1){
            // Numerical reference : use positional arguments
            var pos = parseInt(fmt.name),
                value = _b_.tuple.$dict.__getitem__($.args, pos)
        }else{
            // Use keyword arguments
            var value = _b_.dict.$dict.__getitem__($.kw, fmt.name)
        }
        // If name has extensions (attributes or subscriptions)
        for(var j=0;j<fmt.name_ext.length;j++){
            var ext = fmt.name_ext[j]
            if(ext.charAt(0)=='.'){
                // Attribute
                value = _b_.getattr(value, ext.substr(1))
            }else{
                // Subscription
                var key = ext.substr(1, ext.length-2)
                // An index made of digits is transformed into an integer
                if(key.charAt(0).search(/\d/)>-1){key = parseInt(key)}
                value = _b_.getattr(value, '__getitem__')(key)
            }
        }
        // If the conversion flag is set, first call a function to convert
        // the value
        if(fmt.conv=='a'){value = _b_.ascii(value)}
        else if(fmt.conv=='r'){value = _b_.repr(value)}
        else if(fmt.conv=='s'){value = _b_.str(value)}
        
        // Call attribute __format__ to perform the actual formatting
        res += _b_.getattr(value, '__format__')(fmt.spec)
    }
    return res
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
            if(err.__name__==='StopIteration'){break}
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
    var $ns=$B.$MakeArgs1("$StringDict.find",4,
        {self:null, sub:null, start:null, end:null},
        ['self', 'sub', 'start', 'end'],
        arguments,{start:0, end:self.length},null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    if(!isinstance(sub,str)){throw _b_.TypeError(
        "Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
    if(!isinstance(start,_b_.int)||!isinstance(end,_b_.int)){throw _b_.TypeError(
        "slice indices must be integers or None or have an __index__ method")}

    var s = self.substring(start,end)

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
    var $ns=$B.$MakeArgs1("$StringDict.rjust",3,
        {self:null, width:null, fillchar:null},
        ['self', 'width', 'fillchar'],
        arguments,{fillchar:' '},null,null)
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
    var $ns=$B.$MakeArgs1("$StringDict.rsplit",0,{},[],args,{},'args','kw')
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
    var $ns=$B.$MakeArgs1("$StringDict.split",0,{},[],args,{},'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = _b_.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)
    if(sep=='') throw _b_.ValueError('empty separator')
    if(sep===None){
        var res = []
        var pos = 0
        while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
        if(pos===self.length-1){return [self]}
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
    var $ns=$B.$MakeArgs1("$StringDict.startswith",4,
        {self:null, prefix:null, start:null, end:null}, 
        ['self', 'prefix', 'start', 'end'],
        arguments,{start:0, end:self.length-1},null,null)
    var prefixes = $ns['prefix']
    if(!isinstance(prefixes,_b_.tuple)){prefixes=[prefixes]}
    var start = $ns['start']
    var end = $ns['end']
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
        try{ // try __repr__
             var f = getattr(arg,'__repr__')
             return getattr(f,'__call__')()
        }catch(err){
             if($B.debug>1){console.log(err)}
             console.log('Warning - no method __str__ or __repr__, default to toString', arg)
             return arg.toString()
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

// Function to parse the 2nd argument of format()
$B.parse_format_spec = function(spec){

    if(spec==''){this.empty=true}
    else{
        var pos=0,
            aligns = '<>=^',
            digits = '0123456789',
            types = 'bcdeEfFgGnosxX%',
            align_pos = aligns.indexOf(spec.charAt(0))
        if(align_pos!=-1){
            if(spec.charAt(1) && aligns.indexOf(spec.charAt(1))!=-1){
                // If the second char is also an alignment specifier, the
                // first char is the fill value
                this.fill = spec.charAt(0)
                this.align = spec.charAt(1)
                pos = 2
            }else{
                // The first character defines alignment : fill defaults to ' '
                this.align=aligns[align_pos];
                this.fill=' ';
                pos++
            }
        }else{
            align_pos = aligns.indexOf(spec.charAt(1))
            if(spec.charAt(1) && align_pos!=-1){
                // The second character defines alignment : fill is the first one
                this.align=aligns[align_pos]
                this.fill=spec.charAt(0)
                pos = 2
            }
        }
        var car = spec.charAt(pos)
        if(car=='+'||car=='-'||car==' '){
            this.sign=car;
            pos++;
            car=spec.charAt(pos);
        }
        if(car=='#'){this.alternate=true;pos++;car=spec.charAt(pos)}
        if(car=='0'){
            // sign-aware : equivalent to fill=0 and align=='='
            this.fill='0'
            this.align = '='
            pos++;car=spec.charAt(pos)
        }
        while(car && digits.indexOf(car)>-1){
            if(this.width===undefined){this.width=car}
            else{this.width+=car}
            pos++;car=spec.charAt(pos)
        }
        if(this.width!==undefined){this.width=parseInt(this.width)}
        if(car==','){this.comma=true;pos++;car=spec.charAt(pos)}
        if(car=='.'){
            if(digits.indexOf(spec.charAt(pos+1))==-1){
                throw _b_.ValueError("Missing precision in format spec")
            }
            this.precision = spec.charAt(pos+1)
            pos+=2;car=spec.charAt(pos)
            while(car && digits.indexOf(car)>-1){
                this.precision+=car;pos++;car=spec.charAt(pos)
            }
            this.precision = parseInt(this.precision)
        }
        if(car && types.indexOf(car)>-1){this.type=car;pos++;car=spec.charAt(pos)}
        if(pos!==spec.length){
            console.log('error', spec, this, pos, spec.charAt(pos))
            throw _b_.ValueError("Invalid format specifier")
        }
    }    
    this.toString = function(){
        return (this.fill===undefined ? '' : _b_.str(this.fill))+
            (this.align||'')+
            (this.sign||'')+
            (this.alternate ? '#' : '')+
            (this.sign_aware ? '0' : '')+
            (this.width || '')+
            (this.comma ? ',' : '')+
            (this.precision ? '.'+this.precision : '')+
            (this.type || '')
    }
}

$B.format_width = function(s, fmt){
    if(fmt.width && s.length<fmt.width){
        var fill=fmt.fill || ' ', align = fmt.align || '<',
            missing = fmt.width-s.length
        switch(align){
            case '<':
                return s+fill.repeat(missing)
            case '>':
                return fill.repeat(missing)+s
            case '=':
                if('+-'.indexOf(s.charAt(0))>-1){
                    return s.charAt(0)+fill.repeat(missing)+s.substr(1)
                }else{
                    return fill.repeat(missing)+s            
                }
            case '^':
                left = parseInt(missing/2)
                return fill.repeat(left)+s+fill.repeat(missing-left)
        }
    }
    return s
}

})(__BRYTHON__)
