/*
Module to manipulate long integers
*/

var $module=(function($B){

eval($B.InjectBuiltins())

var $LongIntDict = {__class__:$B.$type,__name__:'LongInt'}

function add_pos(v1, v2){
    // Add two positive numbers

    var res = '', carry = 0, iself=v1.length, sv=0
    for(var i=v2.length-1;i>=0;i--){
        iself--
        if(iself<0){sv=0}else{sv=parseInt(v1.charAt(iself))}
        x = (carry+sv+parseInt(v2.charAt(i))).toString()
        if(x.length==2){res=x.charAt(1)+res;carry=parseInt(x.charAt(0))}
        else{res=x+res;carry=0}
    }
    while(iself>0){
        iself--
        x = (carry+parseInt(v1.charAt(iself))).toString()
        if(x.length==2){res=x.charAt(1)+res;carry=parseInt(x.charAt(0))}
        else{res=x+res;carry=0}
    }
    if(carry){res=carry+res}        
    return {__class__:$LongIntDict, value:res, pos:true}
}

function check_shift(shift){
    // Check the argument of >> and <<
    if(!isinstance(shift, LongInt)){
        throw TypeError("shift must be LongInt, not '"+
            $B.get_class(shift).__name__+"'")
    }
    if(!shift.pos){throw ValueError("negative shift count")}
}

function comp_pos(v1, v2){
    // Compare two positive numbers
    if(v1.length>v2.length){return 1}
    else if(v1.length<v2.length){return -1}
    else{
        if(v1>v2){return 1}
        else if(v1<v2){return -1}
    }
    return 0
}

function divmod_pos(v1, v2){
    var v1_init = v1, quotient, mod
    if(comp_pos(v2, v1)==1){
        quotient='0'
        mod = LongInt(v1)
    }else if(v2==v1){
        quotient = '1';
        mod = LongInt('0')
    }else{
        var quotient = '', v1_init = v1
        // mv2 maps integers i from 2 to 9 to i*v2
        var mv2 = {}
        while(comp_pos(v1,v2)>-1){
            var left = v1.substr(0, v2.length)
            if(left<v2){
                if(left.length<v2.length){
                    if(quotient==''){quotient='0'}
                    break
                }
                else{
                    left+=v1.charAt(v2.length)
                }
            }
            var rest = v1.substr(left.length)
            // use JS int division to test an approximate result
            jsleft = parseInt(left.substr(0,15))
            jsv2 = parseInt(v2.substr(0,15))
            var candidate = Math.floor(jsleft/jsv2).toString()
            if(mv2[candidate]===undefined){
                mv2[candidate] = mul_pos(v2, candidate).value
            }
            if(comp_pos(left, mv2[candidate])==-1){
                candidate--
                if(mv2[candidate]===undefined){
                    mv2[candidate] = mul_pos(v2, candidate).value
                }
            }
            quotient += candidate
            left = sub_pos(left, mv2[candidate]).value
            v1 = left+rest
        }
        mod = sub_pos(v1_init, mul_pos(quotient, v2).value)
    }
    return [LongInt(quotient), mod]
}

function mul_pos(v1, v2){
    // Multiply positive numbers v1 by v2
    // Make v2 smaller than v1
    if(v1.length<v2.length){var a=v1; v1=v2 ; v2=a}
    if(v2=='0'){return LongInt('0')}
    var cols = {}, i=v2.length, j
    while(i--){
        var car = v2.charAt(i)
        if(car=="0"){
            j = v1.length
            while(j--){
                if(cols[i+j]===undefined){cols[i+j]=0}
            }        
        }else if(car=="1"){
            j = v1.length
            while(j--){
                var z = parseInt(v1.charAt(j))
                if(cols[i+j]===undefined){cols[i+j]=z}
                else{cols[i+j] += z}
            }
        }else{
            var x = parseInt(car), j = v1.length, y, z
            while(j--){
                y = x * parseInt(v1.charAt(j))
                if(cols[i+j]===undefined){cols[i+j]=y}
                else{cols[i+j] += y}
            }
        }
    }
    
    function clone(obj){
        var obj1 = {}
        for(var attr in obj){obj1[attr]=obj[attr]}
        return obj1
    }

    i = v1.length+v2.length-1    
    while(i--){
        var col = cols[i].toString()
        if(col.length>1){
            cols[i] = parseInt(col.charAt(col.length-1))
            j = col.length
            while(j-->1){
                var report = parseInt(col.charAt(j-1))
                var pos = i-col.length+j
                if(cols[pos]===undefined){cols[pos]=report}
                else{cols[pos] += report}
            }
        }
    }

    var imin, imax
    for(var attr in cols){
        i = parseInt(attr)
        if(imin===undefined){imin=i}
        else if(i<imin){imin=i}
        if(imax===undefined){imax=i}
        else if(i>imax){imax=i}
    }

    var res = ''
    for(var i=imin;i<=imax;i++){res+=cols[i].toString()}
    return LongInt(res)
}

function sub_pos(v1, v2){
    // Substraction of positive numbers with v1>=v2

    var res = '', carry = 0, iself=v1.length, sv=0
    for(var i=v2.length-1;i>=0;i--){
        iself--
        sv=parseInt(v1.charAt(iself))
        x = (sv-carry-parseInt(v2.charAt(i)))
        if(x<0){res=(10+x)+res;carry=1}
        else{res=x+res;carry=0}
    }
    while(iself>0){
        iself--
        x = (parseInt(v1.charAt(iself))-carry)
        if(x<0){res=(10+x)+res;carry=1}
        else{res=x+res;carry=0}
    }
    while(res.charAt(0)=='0' && res.length>1){res=res.substr(1)}
    return {__class__:$LongIntDict, value:res, pos:true}
}

$LongIntDict.__abs__ = function(self){
    return {__class__:$LongIntDict, value: self.value, pos:true}
}

$LongIntDict.__add__ = function(self, other){
    var res
    if(self.pos&&other.pos){  // self > 0, other > 0
        return add_pos(self.value, other.value)
    }else if(!self.pos&&!other.pos){ // self < 0, other < 0
        res = add_pos(self.value, other.value)
        res.pos = false
        return res
    }else if(self.pos && !other.pos){ // self > 0, other < 0
        switch (comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                break
            case 0:
                res = {__class__:$LongIntDict, value:0, pos:true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                res.pos = false
                break
        }
        return res
    }else{ // self < 0, other > 0
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                res.pos = false
                break
            case 0:
                res = {__class__:$LongIntDict, value:0, pos:true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                break
        }
        return res
    }
}

$LongIntDict.__and__ = function(self, other){
    var v1 = $LongIntDict.__index__(self)
    var v2 = $LongIntDict.__index__(other)
    if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
    console.log(v1)
    console.log(v2)
    var start = v1.length-v2.length
    var res = ''
    for(var i=0;i<v2.length;i++){
        if(v1.charAt(start+i)=='1' && v2.charAt(i)=='1'){res += '1'}
        else{res += '0'}
    }
    return LongInt(res, 2)
}

$LongIntDict.__divmod__ = function(self, other){
    var dm = divmod_pos(self.value, other.value)
    if(self.pos!==other.pos){
        if(dm[0].value!='0'){dm[0].pos = false}
        if(dm[1].value!='0'){
            // If self and other have different signs and self is not a multiple
            // of other, round to previous integer
            dm[0] = $LongIntDict.__sub__(dm[0], LongInt('1'))
            dm[1] = $LongIntDict.__add__(dm[1], LongInt('1'))
        }
    }
    return dm    
}

$LongIntDict.__eq__ = function(self, other){
    return self.value==other.value
}

$LongIntDict.__floordiv__ = function(self, other){
    return $LongIntDict.__divmod__(self, other)[0]
}

$LongIntDict.__ge__ = function(self, other){
    if(self.value.length>other.value.length){return true}
    else if(self.value.length<other.value.length){return false}
    else{return self.value >= other.value}
}

$LongIntDict.__gt__ = function(self, other){
    return !$LongIntDict.__le__(self, other)
}

$LongIntDict.__index__ = function(self){
    // Used by bin()
    var res = '', pos=self.value.length,
        temp = self.value, d
    var nb = 20
    while(true){
        d = divmod_pos(temp, '2')
        res = d[1].value + res
        temp = d[0].value
        if(temp=='0'){break}
        if(!nb--){console.log('overflow');break}
    }
    return res
}

$LongIntDict.__le__ = function(self, other){
    if(self.value.length>other.value.length){return false}
    else if(self.value.length<other.value.length){return true}
    else{return self.value <= other.value}
}

$LongIntDict.__lt__ = function(self, other){
    return !$LongIntDict.__ge__(self, other)
}

$LongIntDict.__lshift__ = function(self, shift){
    check_shift(shift)
    var res = self.value
    while(true){
        var x, carry=0, res1=''
        for(var i=res.length-1;i>=0;i--){
            x = (carry+parseInt(res.charAt(i))*2).toString()
            if(x.length==2){res1=x.charAt(1)+res1;carry=parseInt(x.charAt(0))}
            else{res1=x+res1;carry=0}
        }
        if(carry){res1=carry+res1}
        res=res1
        shift = sub_pos(shift.value, '1')
        if(shift.value=='0'){break}
    }
    return {__class__:$LongIntDict, value:res, pos:self.pos}
}

$LongIntDict.__mod__ = function(self, other){
    return $LongIntDict.__divmod__(self, other)[1]
}

$LongIntDict.__mro__ = [$LongIntDict, _b_.object.$dict]

$LongIntDict.__mul__ = function(self, other){
    var res = mul_pos(self.value, other.value)
    if(self.pos==other.pos){return res}
    res.pos = false
    return res
}

$LongIntDict.__neg__ = function(obj){
    return {__class__:$LongIntDict, value:obj.value, pos:!obj.pos}
}

$LongIntDict.__or__ = function(self, other){
    var v1 = $LongIntDict.__index__(self)
    var v2 = $LongIntDict.__index__(other)
    if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
    console.log(v1)
    console.log(v2)
    var start = v1.length-v2.length
    var res = ''
    for(var i=0;i<v2.length;i++){
        if(v1.charAt(start+i)=='1' || v2.charAt(i)=='1'){res += '1'}
        else{res += '0'}
    }
    return LongInt(res, 2)
}


$LongIntDict.__pow__ = function(self, power){
    if(!isinstance(power, LongInt)){
        var msg = "power must be a LongDict, not '"
        throw TypeError(msg+$B.get_class(power).__name__+"'")
    }else if(!power.pos){
        if(self.value=='1'){return self}
        // For all other integers, x**-n is 0
        return LongInt('0')
    }else if(power.value=='0'){
        return LongInt('1')
    }
    var res = {__class__:$LongIntDict, value:self.value, pos:self.pos}
    var pow = power.value
    while(true){
        pow = sub_pos(pow, '1').value
        if(pow == '0'){break}
        res = $LongIntDict.__mul__(res, self)
    }
    return res    
}

$LongIntDict.__rshift__ = function(self, shift){
    check_shift(shift)
    var res = self.value
    while(true){
        res = divmod_pos(res, '2')[0].value
        if(res.value=='0'){break}
        shift = sub_pos(shift.value, '1')
        if(shift.value=='0'){break}
    }
    return {__class__:$LongIntDict, value:res, pos:self.pos}
}

$LongIntDict.__str__ = $LongIntDict.__repr__ = function(self){
    var res = "LongInt('"
    if(!self.pos){res += '-'}
    return res+self.value+"')"
}

$LongIntDict.__sub__ = function(self, other){
    var res
    if(self.pos && other.pos){
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                break
            case 0:
                res = {__class__:$LongIntDict, value:'0', pos:true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                res.pos = false
                break
        }
        return res
    }else if(!self.pos && !other.pos){
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                res.pos = false
                break
            case 0:
                res = {__class__:$LongIntDict, value:'0', pos:true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                break
        }
        return res
    }else if(self.pos && !other.pos){
        return add_pos(self.value, other.value)
    }else{
        res = add_pos(self.value, other.value)
        res.pos = false
        return res
    }
}

$LongIntDict.__xor__ = function(self, other){
    var v1 = $LongIntDict.__index__(self)
    var v2 = $LongIntDict.__index__(other)
    if(v1.length<v2.length){var temp=v2;v2=v1;v1=temp}
    console.log(v1)
    console.log(v2)
    var start = v1.length-v2.length
    var res = ''
    for(var i=0;i<v2.length;i++){
        if(v1.charAt(start+i)=='1' && v2.charAt(i)=='0'){res += '1'}
        else if(v1.charAt(start+i)=='0' && v2.charAt(i)=='1'){res += '1'}
        else{res += '0'}
    }
    return LongInt(res, 2)
}

function digits(base){
    // Return an object where keys are all the digits valid in specified base
    // and value is "true"
    // Used to test if the string passed as first argument to LongInt is valid
    var is_digits = {}
    // Number from 0 to base, or from 0 to 9 if base > 10
    for(var i=0;i<base;i++){
        if(i==10){break}
        is_digits[i]=true
    }
    if(base>10){
        // Additional letters
        // For instance in base 16, add "abcdefABCDEF" as keys
        for(var i=0;i<base-10;i++){
            is_digits[String.fromCharCode(65+i)]=true
            is_digits[String.fromCharCode(97+i)]=true
        }
    }
    return is_digits
}

function LongInt(value, base){
    if(arguments.length>2){
        throw _b_.TypeError("LongInt takes at most 2 arguments ("+
            arguments.length+" given)")
    }
    // base defaults to 2
    if(base===undefined){base = 10}
    else if(!isinstance(base, int)){
        throw TypeError("'"+$B.get_class(base).__name__+"' object cannot be interpreted as an integer")
    }
    if(base<0 || base==1 || base>36){
        throw ValueError("LongInt() base must be >= 2 and <= 36")
    }
    if(typeof value=='string'){
        var has_prefix = false, pos = true, start = 0
        // Strip leading and trailing whitespaces
        while(value.charAt(0)==' ' && value.length){value = value.substr(1)}
        while(value.charAt(value.length-1)==' ' && value.length){
            value = value.substr(0, value.length-1)
        }
        // Check if string starts with + or -
        if(value.charAt(0)=='+'){has_prefix=true}
        else if(value.charAt(0)=='-'){has_prefix=true;pos=false}
        if(has_prefix){
            // Remove prefix
            if(value.length==1){
                // "+" or "-" alone are not valid arguments
                throw ValueError('LongInt argument is not a valid number')            
            }else{value=value.substr(1)}
        }
        // Ignore leading "0"
        while(start<value.length-1 && value.charAt(start)=='0'){start++}
        value = value.substr(start)

        // Check if all characters in value are valid in the base
        var is_digits = digits(base)
        for(var i=0;i<value.length;i++){
            if(!is_digits[value.charAt(i)]){
                throw ValueError('LongInt argument is not a valid number')
            }
        }
        if(base!=10){
            // Conversion to base 10
            var coef = '1', v1 = LongInt('0'),
                pos = value.length, digit_base10
            while(pos--){
                digit_base10 = parseInt(value.charAt(pos), base).toString()
                try{
                    digit_by_coef = mul_pos(coef, digit_base10).value
                }catch(err){
                    console.log('error digit by coef, for pos '+pos+' coef '+coef+' digit '+digit_base10)
                    throw err
                }
                v1 = add_pos(v1.value, digit_by_coef)
                try{
                    coef = mul_pos(coef, base.toString()).value
                }catch(err){
                    console.log('error for coef '+pos)
                    throw err
                }
            }
            return v1
        }
        return {__class__:$LongIntDict, value:value, pos:pos}
    }else{
        throw ValueError("argument of long_int must be a string, not "+
            $B.get_class(value).__name__)
    }
}

LongInt.__class__ = $B.$factory
LongInt.$dict = $LongIntDict
$LongIntDict.$factory = LongInt

return {LongInt:LongInt}

})(__BRYTHON__)
