;(function($B){
/*
Module to manipulate long integers
*/

var bltns = $B.InjectBuiltins()
eval(bltns)

try{
    eval("window")
}catch(err){
    window = self
}

var long_int = {
    __class__: _b_.type,
    __mro__: [int, object],
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

var max_safe_divider = $B.max_int / 9

function add_pos(v1, v2){
    // Add two positive numbers
    // v1, v2 : strings
    // Return an instance of long_int
    if(window.BigInt){
        return {
            __class__: long_int,
            value: (BigInt(v1) + BigInt(v2)).toString(),
            pos: true
        }
    }

    var res = "",
        carry = 0,
        iself = v1.length,
        sv = 0,
        x
    for(var i = v2.length - 1; i >=0 ; i--){
        iself--
        if(iself < 0){sv = 0}else{sv = parseInt(v1.charAt(iself))}
        x = (carry + sv + parseInt(v2.charAt(i))).toString()
        if(x.length == 2){
            res = x.charAt(1) + res
            carry = parseInt(x.charAt(0))
        }
        else{res = x + res; carry = 0}
    }
    while(iself > 0){
        iself--
        x = (carry + parseInt(v1.charAt(iself))).toString()
        if(x.length == 2){
            res = x.charAt(1) + res
            carry = parseInt(x.charAt(0))
        }
        else{res = x + res; carry = 0}
    }
    if(carry){res = carry + res}
    return {__class__: long_int, value: res, pos: true}
}

var len = ((Math.pow(2, 53) - 1) + '').length - 1

function binary_pos(t){
    var nb_chunks = Math.ceil(t.length / len),
        chunks = [],
        pos,
        start,
        nb,
        bin = []
    for(var i = 0; i < nb_chunks; i++){
        pos = t.length - (i + 1) * len
        start = Math.max(0, pos)
        nb = pos - start
        chunks.push(t.substr(start, len + nb))
    }
    chunks = chunks.reverse()
    chunks.forEach(function(chunk, i){
        chunks[i] = parseInt(chunk)
    })

    var rest
    var carry = Math.pow(10, 15)

    while(chunks[chunks.length - 1] > 0){
        chunks.forEach(function(chunk, i){
            rest = chunk % 2
            chunks[i] = Math.floor(chunk / 2)
            if(rest && i < chunks.length - 1){
                chunks[i + 1] += carry
            }
        })
        bin.push(rest)
        if(chunks[0] == 0){
            chunks.shift()
        }
    }
    bin = bin.reverse().join('')
    return bin
}

function binary(obj){
    var bpos = binary_pos(obj.value)
    if(obj.pos){
        return bpos
    }
    // If obj is < 0, use 2's complement
    // Invert bits
    var res = ''
    for(var i = 0, len = bpos.length; i < len; i++){
        res += bpos.charAt(i) == "0" ? "1": "0"
    }
    // Add 1
    var add1 = add_pos(res, "1").value
    // Restore leading "0" in res if any
    add1 = res.substr(0, res.length - add1.length) + add1
    return add1
}

function check_shift(shift){
    // Check the argument of >> and <<
    if(! isinstance(shift, long_int)){
        throw TypeError.$factory("shift must be int, not '" +
            $B.class_name(shift) + "'")
    }
    if(! shift.pos){throw ValueError.$factory("negative shift count")}
}

function clone(obj){
    // Used for traces
    var obj1 = {}
    for(var attr in obj){obj1[attr] = obj[attr]}
    return obj1
}

function comp_pos(v1, v2){
    // Compare two positive numbers
    if(v1.length > v2.length){return 1}
    else if(v1.length < v2.length){return -1}
    else{
        if(v1 > v2){return 1}
        else if(v1 < v2){return -1}
    }
    return 0
}

function divmod_by_safe_int(t, n){
    // Division of the string t holding a long integer in base 10 by the
    // "safe" positive integer n

    if(n == 1){return [t, 0]}

    // Manual division algorithm for Q = A / B
    // L is the length of B
    // First take the L first digits in A : gives number A0
    // First quotient digit Q0 = A0 // B
    // Rest R0 = A0 - B * Q0
    // A1 is R0 + the next digit in A
    // Continue until all digits in A are read

    var T = t.toString(),
        L = n.toString().length,
        a = parseInt(T.substr(0, L)),
        next_pos = L - 1,
        quotient = '',
        q,
        rest

    while(true){
        q = Math.floor(a / n)
        rest = a - q * n
        quotient += q
        next_pos++
        if(next_pos >= T.length){
            return [quotient, rest]
        }
        a = 10 * rest + parseInt(T[next_pos])
    }
}

function divmod_pos(v1, v2){
    // v1, v2 : strings, represent 2 positive integers A and B
    // Return [a, b] where a and b are instances of long_int
    // a = A // B, b = A % B
    if($B.BigInt){
        var a = {
            __class__: long_int,
            value: (BigInt(v1) / BigInt(v2)).toString(),
            pos: true
        },
        b = {
            __class__: long_int,
            value: (BigInt(v1) % BigInt(v2)).toString(),
            pos: true
        }
        return [a, b]
    }

    var iv1 = parseInt(v1),
        iv2 = parseInt(v2),
        res1
    if(iv1 < $B.max_int && iv2 < $B.max_int){
        var rest = iv1 % iv2,
            quot = Math.floor(iv1 / iv2).toString()
        var res1 = [
            {__class__:long_int, value: quot.toString(), pos: true},
            {__class__:long_int, value: rest.toString(), pos: true}
        ]
        return res1
    }else if(iv2 < max_safe_divider){
        var res_safe = divmod_by_safe_int(v1, iv2)
        return [long_int.$factory(res_safe[0]), long_int.$factory(res_safe[1])]
    }
    var quotient, mod
    if(comp_pos(v1, v2) == -1){ // a < b
        quotient = "0"
        mod = long_int.$factory(v1)
    }else if(v2 == v1){ // a = b
        quotient = "1"
        mod = long_int.$factory("0")
    }else{
        var quotient = "",
            left = v1.substr(0, v2.length)
        if(v1 < v2){left = v1.substr(0, v2.length + 1)}
        var right = v1.substr(left.length)
        // mv2 maps integers i from 2 to 9 to i*v2, used as a cache to avoid
        // having to compute i*v2 each time
        var mv2 = {}

        // Division algorithm
        // At each step in the division, v1 is split into substrings
        // "left" is the left part, with the same length as v2
        // "rest" is the rest of v1 after "left"
        // The algorithm finds the one-digit integer "candidate" such
        // that 0 <= left - candidate*v2 < v2
        // It stops when right is empty
        while(true){
            // Uses JS division to test an approximate result
            var candidate = Math.floor(parseInt(left) / parseInt(v2)) + ""
            if(candidate == "10"){
                // Might happen for big numbers with v2 slightly bigger
                // than left, eg with left = 1000000000000000000000000000000
                // and v2 = 100000000000000000000005772299
                candidate = "9"
            }

            // Check that candidate is the correct result
            // Start by computing candidate * v2 : for this, use the table
            // mv2, which stores the multiples of v2 already calculated
            if(mv2[candidate] === undefined){
                mv2[candidate] = mul_pos(v2, candidate).value
            }
            if(comp_pos(left, mv2[candidate]) == -1){
                // If left < candidate * v2, use candidate-1
                candidate--
                if(mv2[candidate] === undefined){
                    mv2[candidate] = mul_pos(v2, candidate).value
                }
            }

            // Add candidate to the quotient
            quotient += candidate

            // New value for left : left - v2 * candidate
            left = sub_pos(left, mv2[candidate]).value

            // Stop if all digits in v1 have been used
            if(right.length == 0){break}

            // Else, add next digit to left and remove it from right
            left += right.charAt(0)
            right = right.substr(1)
        }
        // Modulo is A - (A//B) * B
        mod = sub_pos(v1, mul_pos(quotient, v2).value)
    }
    return [long_int.$factory(quotient), mod]
}

function split_chunks(s, size){
    var nb = Math.ceil(s.length / size),
        chunks = [],
        len = s.length
    for(var i = 0; i < nb; i++){
        var pos = len - size * (i + 1)
        if(pos < 0){size += pos; pos = 0}
        chunks.push(parseInt(s.substr(pos, size)))
    }
    return chunks
}

function mul_pos(x, y){
    if($B.BigInt){
        // always return a long int
        return long_int.$factory(from_BigInt(BigInt(x) * BigInt(y)))
    }
    var ix = parseInt(x),
        iy = parseInt(y),
        z = ix * iy
    if(z < $B.max_int){
        return {
            __class__: long_int,
            value: z.toString(),
            pos: true
        }
    }
    // To multiply long integers in strings x and y, split the strings in
    // chunks of chunk_size digits to get integers than can be safely
    // multiplied by Javascript
    var chunk_size = 6,
        cx = split_chunks(x, chunk_size),
        cy = split_chunks(y, chunk_size)

    // Multiply chunk i of x by chunk j of y and store the result in an
    // object "products" at index i+j
    // The value of products[pos] is the sum of x[i]*y[j] for i+j = pos
    var products = {},
        len = cx.length + cy.length
    for(var i = 0; i < len - 1; i++){products[i] = 0}
    for(var i = 0; i < cx.length; i++){
        for(var j = 0; j < cy.length; j++){
            products[i + j] += cx[i] * cy[j]
        }
    }

    // If products[pos] has more digits than chunk_size, report the carry
    // at position pos+1
    var nb = len - 1, pos
    for(var i = 0; i < len - 1; i++){
        var chunks = split_chunks(products[i].toString(), chunk_size)
        for(var j = 1; j < chunks.length; j++){
            pos = i + j
            if(products[pos] === undefined){
                products[pos] = parseInt(chunks[j])
                nb = pos
            }
            else{products[pos] += parseInt(chunks[j])}
        }
        products[i] = chunks[0]
    }

    // Build the result as the concatenation of strings, padded with 0 if
    // necessary
    var result = "", i = 0, s
    while(products[i] !== undefined){
        s = products[i].toString()
        if(products[i + 1] !== undefined){
            s = "0".repeat(chunk_size - s.length) + s
        }
        result = s + result
        i++
    }
    try{
        return long_int.$factory(result)
    }catch(err){
        console.log(x, y, products, result)
        throw err
    }
}

function sub_pos(v1, v2){
    // Substraction of positive numbers with v1>=v2
    if(window.BigInt){
        return {
            __class__: long_int,
            value: (BigInt(v1) - BigInt(v2)).toString(),
            pos: true
        }
    }

    var res = "",
        carry = 0,
        i1 = v1.length,
        sv = 0,
        x

    // For all digits in v2, starting by the rightmost, substract it from
    // the matching digit in v1
    // This is the equivalent of the manual operation :
    //    12345678
    //   -   98765
    //
    // We begin by the rightmost operation : 8-5 (3, no carry),
    // then 7-6 (1, no carry)
    // then 6-7 (9, carry 1) and so on
    for(var i = v2.length - 1; i >= 0; i--){
        i1--
        sv = parseInt(v1.charAt(i1))
        x = (sv - carry - parseInt(v2.charAt(i)))
        if(isNaN(x)){console.log("x is NaN", v1.length, v2.length, i, i1, sv, carry, i, v2.charAt(i))}
        if(x < 0){res = (10 + x) + res; carry = 1}
        else{res = x + res; carry = 0}
    }


    if(res.startsWith("NaN")){alert(res)}
    // If there are remaining digits in v1, substract the carry, if any
    while(i1 > 0){
        i1--
        x = (parseInt(v1.charAt(i1)) - carry)
        if(x < 0){res = (10 + x) + res; carry = 1}
        else{res = x + res; carry = 0}
    }

    // Remove leading zeros and return the result
    while(res.charAt(0) == "0" && res.length > 1){res = res.substr(1)}
    if(res.startsWith("NaN")){
        console.log("hoho !!", v1, v2, v1 >= v2, res)
    }
    return {__class__: long_int, value: res, pos: true}
}

function to_BigInt(x){
    var res = $B.BigInt(x.value)
    if(x.pos){
        return res
    }
    return -res
}

function to_int(long_int){
    return long_int.pos ? parseInt(long_int.value) : -parseInt(long_int.value)
}

function from_BigInt(y){
    var pos = y >= 0
    y = y.toString()
    y = y.endsWith("n") ? y.substr(0, y.length - 1) : y
    y = y.startsWith('-') ? y.substr(1) : y
    return intOrLong({
        __class__: long_int,
        value: y,
        pos: pos
    })
}

// Special methods to implement operations on instances of long_int
long_int.$from_float = function(value){
    var s = Math.abs(value).toString(),
        v = s
    if(s.search("e") > -1){
        var t = /-?(\d)(\.\d+)?e([+-])(\d*)/.exec(s),
            n1 = t[1],
            n2 = t[2],
            pos = t[3],
            exp = t[4]
        if(pos == "+"){
            if(n2 === undefined){
                v = n1 + "0".repeat(exp - 1)
            }else{
                v = n1 + n2 + "0".repeat(exp - 1 - n2.length)
            }
        }
    }
    return {__class__: long_int, value: v, pos: value >= 0}
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
            res = (fmt.alternate ? "0b" : "") + BigInt(self.value).toString(2)
            break
        case "c":
            res = _b_.chr(self)
            break
        case "o":
            res = (fmt.alternate ? "0o" : "") + BigInt(self.value).toString(8)
            break
        case "x":
            res = (fmt.alternate ? "0x" : "") + BigInt(self.value).toString(16)
            break
        case "X":
            res = (fmt.alternate ? "0X" : "") + BigInt(self.value).toString(16).toUpperCase()
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


long_int.__format__ = function(self, format_spec){
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

long_int.__abs__ = function(self){
    return {__class__: long_int, value: self.value, pos: true}
}

long_int.__add__ = function(self, other){
    if(isinstance(other, _b_.float)){
        return _b_.float.$factory(to_int(self) + other)
    }
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }else if(other.__class__ !== long_int){
        if(isinstance(other, _b_.bool)){
            other = long_int.$factory(other ? 1 : 0)
        }else if(isinstance(other, int)){
            // int subclass
            other = long_int.$factory(_b_.str.$factory(_b_.int.__index__(other)))
        }else{
            return _b_.NotImplemented
        }
    }
    if($B.BigInt){
        return from_BigInt(to_BigInt(self) + to_BigInt(other))
    }

    // Addition of "self" and "other"
    // If both have the same sign (+ or -) we add their absolute values
    // If they have different sign we use the substraction of their
    // absolute values
    var res
    if(self.pos && other.pos){  // self > 0, other > 0
        return add_pos(self.value, other.value)
    }else if(! self.pos && ! other.pos){ // self < 0, other < 0
        res = add_pos(self.value, other.value)
        res.pos = false
        return intOrLong(res)
    }else if(self.pos && ! other.pos){ // self > 0, other < 0
        switch (comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                break
            case 0:
                res = {__class__: long_int, value:0, pos: true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                res.pos = false
                break
        }
        return intOrLong(res)
    }else{ // self < 0, other > 0
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                res.pos = false
                break
            case 0:
                res = {__class__: long_int, value: 0, pos: true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                break
        }
        return intOrLong(res)
    }
}

long_int.__and__ = function(self, other){
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }
    if($B.BigInt){
        return from_BigInt(to_BigInt(self) & to_BigInt(other))
    }
    var v1 = self.value,
        v2 = other.value,
        temp1,
        temp2,
        res = ""
    var neg = (! self.pos) && (! other.pos)
    if(neg){
        self = long_int.__neg__(self)
        other = long_int.__neg__(other)
    }
    var b1 = binary(self),
        len1 = b1.length,
        b2 = binary(other),
        len2 = b2.length,
        i = 1,
        res = '',
        x1,
        x2
    while(true){
        if(i > len1 && i > len2){
            break
        }
        if(i > len1){
            x1 = self.pos ? "0" : "1"
        }else{
            x1 = b1.charAt(len1 - i)
        }
        if(i > len2){
            x2 = other.pos ? "0" : "1"
        }else{
            x2 = b2.charAt(len2 - i)
        }
        if(x1 == "1" && x2 == "1"){
            res = "1" + res
        }else{
            res = "0" + res
        }
        i++
    }
    while(res.charAt(0) == "0"){
        res = res.substr(1)
    }
    res = $B.long_int.$factory(res, 2)
    if(neg){
        res.pos = false
    }
    return intOrLong(res)
}

long_int.__divmod__ = function(self, other){
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }

    var dm = divmod_pos(self.value, other.value)
    if(self.pos !== other.pos){
        if(dm[0].value != "0"){
            dm[0].pos = false
        }
        if(dm[1].value != "0"){
            // If self and other have different signs and self is not a
            // multiple of other, round to the previous integer
            dm[0] = long_int.__sub__(dm[0], long_int.$factory("1"))
            // Modulo is A - (A//B) * B
            dm[1] = long_int.__sub__(self,
                long_int.__mul__(other, long_int.$factory(dm[0])))
        }
    }
    return $B.fast_tuple([intOrLong(dm[0]), intOrLong(dm[1])])
}

long_int.__eq__ = function(self, other){
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }
    return self.value == other.value && self.pos == other.pos
}

long_int.__float__ = function(self){
    if(! isFinite(parseFloat(self.value))){
        throw _b_.OverflowError.$factory("int too big to convert to float")
    }
    return new Number(parseFloat(self.value))
}

long_int.__floordiv__ = function(self, other){
    if(isinstance(other, _b_.float)){
        return _b_.float.$factory(to_int(self) / other)
    }
    if(typeof other == "number" && Math.abs(other) < $B.max_safe_divider){
        var t = self.value,
            res = divmod_by_safe_int(t, other),
            pos = other > 0 ? self.pos : !self.pos
        return {__class__: long_int,
                value: res[0],
                pos: pos}
    }
    var res = intOrLong(long_int.__divmod__(self, other)[0])
    return res
}

long_int.__ge__ = function(self, other){
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }
    if(self.pos != other.pos){return ! other.pos}
    if(self.value.length > other.value.length){return self.pos}
    else if(self.value.length < other.value.length){return ! self.pos}
    else{return self.pos ? self.value >= other.value :
        self.value <= other.value}
}

long_int.__gt__ = function(self, other){
    return ! long_int.__le__(self, other)
}

long_int.__index__ = function(self){
    // Used by bin()
    // returns a string with the binary value of self
    // The algorithm computes the result of the floor division of self by 2
    var res = '',
        temp = self.value,
        d
    while(true){
        d = divmod_pos(temp, "2")
        res = d[1].value + res
        temp = d[0].value
        if(temp == "0"){break}
    }
    if(! self.pos){
        // Negative number : take two's complement
        var nres = "",
            flag = false
        for(var len = res.length - 1, i = len; i >= 0 ; i--){
            var bit = res.charAt(i)
            if(bit == "0"){
                if(flag){nres = "1" + nres}else{nres = "0" + nres}
            }else{
                if(flag){nres = "0" + nres}
                else{flag = true; nres = "1" + nres}
            }
        }
        nres = "1" + nres
        res = nres
    }else{
        res = "0" + res
    }
    return intOrLong(res)
}

long_int.__invert__ = function(self){
    return long_int.__sub__(long_int.$factory("-1"), self)
}

long_int.__le__ = function(self, other){
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }
    if(self.pos !== other.pos){return ! self.pos}
    if(self.value.length > other.value.length){return ! self.pos}
    else if(self.value.length < other.value.length){return self.pos}
    else{return self.pos ? self.value <= other.value :
        self.value >= other.value}
}

long_int.__lt__ = function(self, other){
    return !long_int.__ge__(self, other)
}

long_int.__lshift__ = function(self, shift){
    if(window.BigInt){
        if(shift.__class__ == long_int){
            shift = shift.value
        }
        return intOrLong({
            __class__: long_int,
            value: (BigInt(self.value) << BigInt(shift)).toString(),
            pos: self.pos
        })
    }
    var is_long = shift.__class__ === long_int,
        shift_safe
    if(is_long){
        var shift_value = parseInt(shift.value)
        if(shift_value < 0){
            throw _b_.ValueError.$factory('negative shift count')
        }
        if(shift_value < $B.max_int){
            shift_safe = true
            shift = shift_value
        }
    }
    if(shift_safe){
        if(shift_value == 0){return self}
    }else{
        shift = long_int.$factory(shift)
        if(shift.value == "0"){return self}
    }
    var res = self.value
    while(true){
        var x,
            carry = 0,
            res1 = ""
        for(var i = res.length - 1; i >= 0; i--){
            x = (carry + parseInt(res.charAt(i)) * 2).toString()
            if(x.length == 2){
                res1 = x.charAt(1) + res1
                carry = parseInt(x.charAt(0))
            }else{
                res1 = x + res1
                carry = 0
            }
        }
        if(carry){res1 = carry + res1}
        res = res1
        if(shift_safe){
            shift--
            if(shift == 0){break}
        }else{
            shift = sub_pos(shift.value, "1")
            if(shift.value == "0"){break}
        }
    }
    return intOrLong({__class__: long_int, value: res, pos: self.pos})
}

long_int.__mod__ = function(self, other){
    return intOrLong(long_int.__divmod__(self, other)[1])
}

long_int.__mro__ = [_b_.int, _b_.object]

long_int.__mul__ = function(self, other){
    switch(self){
        case Number.NEGATIVE_INFINITY:
        case Number.POSITIVE_INFINITY:
            if($B.rich_comp("__eq__", other, 0)){return NaN} // infinity * 0 = NaN
            else if(_b_.getattr(other, "__gt__")(0)){return self}
            else{return -self}
    }
    if(isinstance(other, _b_.float)){
        return _b_.float.$factory(to_int(self) * other)
    }
    if(typeof other == "number"){
        other = long_int.$factory(other)
    }
    other_value = other.value
    other_pos = other.pos
    if(other.__class__ !== long_int && isinstance(other, int)){
        // int subclass
        var value = int.__index__(other)
        other_value = _b_.str.$factory(value)
        other_pos = value > 0
    }
    if($B.BigInt){
        return from_BigInt(to_BigInt(self) * to_BigInt(other))
    }
    var res = mul_pos(self.value, other_value)
    if(self.pos == other_pos){return intOrLong(res)}
    res.pos = false
    return intOrLong(res)
}

long_int.__neg__ = function(obj){
    return {__class__: long_int, value: obj.value, pos: ! obj.pos}
}

long_int.__or__ = function(self, other){
    other = long_int.$factory(other)
    var v1 = long_int.__index__(self)
    var v2 = long_int.__index__(other)
    if(v1.length < v2.length){var temp = v2; v2 = v1; v1 = temp}
    var start = v1.length - v2.length
    var res = v1.substr(0, start)
    for(var i = 0; i < v2.length; i++){
        if(v1.charAt(start+i) == "1" || v2.charAt(i) == "1"){res += "1"}
        else{res += "0"}
    }
    return intOrLong(long_int.$factory(res, 2))
}

long_int.__pos__ = function(self){return self}

long_int.__pow__ = function(self, power, z){
    if(typeof power == "number"){
        power = long_int.$from_int(power)
    }else if(isinstance(power, int)){
        // int subclass
        power = long_int.$factory(_b_.str.$factory(_b_.int.__index__(power)))
    }else if(! isinstance(power, long_int)){
        var msg = "power must be an integer, not '"
        throw TypeError.$factory(msg + $B.class_name(power) + "'")
    }
    if(! power.pos){
        if(self.value == "1"){return self}
        // For all other integers, x ** -n is 0
        return long_int.$factory("0")
    }else if(power.value == "0"){
        return long_int.$factory("1")
    }
    /*
    Algorithm in https://www.hindawi.com/journals/jam/2014/107109/
    def exp(a, x):
          b = 1
          s = a
          while x:
              if x % 2:
                  b = b * s
              x = x // 2
              if x:
                  s = s * s
          return b
    */
    if($B.BigInt){
        var s = $B.BigInt(self.value),
            b = $B.BigInt(1),
            x = $B.BigInt(power.value),
            z = z === undefined ? z : typeof z == "number" ? $B.BigInt(z) :
                $B.BigInt(z.value)
        if(z === undefined){
            return {
                __class__: long_int,
                value: (s ** x).toString(),
                pos: true
            }
        }
        while(x > 0){
            if(x % $B.BigInt(2) == 1){
                b = b * s
            }
            x = x / $B.BigInt(2)
            if(x > 0){
                s = s * s
            }
            if(z !== undefined){
                b = b % z
            }
        }
        return {__class__: long_int, value: b.toString(), pos: true}
    }

    var b = {__class__: long_int, value: "1", pos: true},
        s = self,
        pow = power.value,
        temp
    while(true){
        if(typeof pow == "string" && parseInt(pow) < $B.max_int){
            pow = parseInt(pow)
        }
        if(pow == 0){
            break
        }else if(typeof pow == "string"){
            if(parseInt(pow.charAt(pow.length - 1)) % 2 == 1){
                b = long_int.__mul__(b, s)
            }
            pow = long_int.__floordiv__(pow, 2)
        }else{
            if(pow % 2 == 1){
                if(typeof b == "number" && typeof s == "number" &&
                        (temp = b * s) < $B.max_int){
                    b = temp
                }else{
                    b = long_int.__mul__(long_int.$factory(b),
                        long_int.$factory(s))
                }
            }
            pow = Math.floor(pow / 2)
        }
        if(pow > 0){
            if(typeof s == "number" && (temp = s * s) < $B.max_int){
                s = temp
            }else{
                s = long_int.$factory(s)
                s = long_int.__mul__(s, s)
            }
        }
        if(z !== undefined){
            b = long_int.__mod__(b, z)
        }
    }
    return intOrLong(b)
}

long_int.__rshift__ = function(self, shift){
    if(window.BigInt){
        if(shift.__class__ === long_int){
            shift = shift.value
        }
        return intOrLong(
            {
                __class__: long_int,
                value: (BigInt(self.value) >> BigInt(shift)).toString(),
                pos: self.pos
            }
        )
    }
    if(typeof shift == "number"){
        var pow2 = Math.pow(2, shift)
        if(pow2 < $B.max_int){
            var res = divmod_by_safe_int(self.value, pow2)
            return intOrLong({
                __class__: long_int,
                value: res[0],
                pos: self.pos
            })
        }
    }
    shift = long_int.$factory(shift)
    if(shift.value == "0"){return self}
    var res = self.value
    while(true){
        res = divmod_pos(res, "2")[0].value
        if(res.value == "0"){break}
        shift = sub_pos(shift.value, "1")
        if(shift.value == "0"){break}
    }
    return intOrLong({__class__: long_int, value: res, pos: self.pos})
}

long_int.__str__ = long_int.__repr__ = function(self){
    var res = ""
    if(! self.pos){res += '-'}
    return res + self.value
}

long_int.__sub__ = function(self, other){
    if(isinstance(other, _b_.float)){
        other = other instanceof Number ? other : other.$brython_value
        return _b_.float.$factory(to_int(self) - other)
    }
    if(typeof other == "number"){
        other = long_int.$factory(_b_.str.$factory(other))
    }
    if($B.BigInt){
        //return from_BigInt(to_BigInt(self) - to_BigInt(other))
    }
    var res
    if(self.pos && other.pos){
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                break
            case 0:
                res = {__class__: long_int, value: "0", pos: true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                res.pos = false
                break
        }
        return intOrLong(res)
    }else if(! self.pos && ! other.pos){
        switch(comp_pos(self.value, other.value)){
            case 1:
                res = sub_pos(self.value, other.value)
                res.pos = false
                break
            case 0:
                res = {__class__: long_int, value: "0", pos: true}
                break
            case -1:
                res = sub_pos(other.value, self.value)
                break
        }
        return intOrLong(res)
    }else if(self.pos && ! other.pos){
        return intOrLong(add_pos(self.value, other.value))
    }else{
        res = add_pos(self.value, other.value)
        res.pos = false
        return intOrLong(res)
    }
}

long_int.__truediv__ = function(self, other){
    if(isinstance(other, long_int)){
        return _b_.float.$factory(to_int(self) / to_int(other))
    }else if(isinstance(other,_b_.int)){
        return _b_.float.$factory(to_int(self) / other)
    }else if(isinstance(other,_b_.float)){
        return _b_.float.$factory(to_int(self) / other)
    }else{throw TypeError.$factory(
        "unsupported operand type(s) for /: 'int' and '" +
        $B.class_name(other) + "'")}
}

long_int.__xor__ = function(self, other){
    other = long_int.$factory(other)
    var v1 = long_int.__index__(self),
        v2 = long_int.__index__(other)
    if(v1.length < v2.length){var temp  =v2; v2 = v1; v1 = temp}
    var start = v1.length - v2.length
    var res = v1.substr(0, start)
    for(var i = 0; i < v2.length; i++){
        if(v1.charAt(start + i) == "1" && v2.charAt(i) == "0"){res += "1"}
        else if(v1.charAt(start + i) == "0" && v2.charAt(i) == "1"){res += "1"}
        else{res += "0"}
    }
    return intOrLong(long_int.$factory(res, 2))
}

long_int.bit_length = function(self){
    return binary(self).length
}
// descriptors
long_int.numerator = function(self){return self}
long_int.denominator = function(self){return _b_.int.$factory(1)}
long_int.imag = function(self){return _b_.int.$factory(0)}
long_int.real = function(self){return self}

long_int.to_base = function(self, base){
    // Returns the string representation of self in specified base
    if(base == 2){
        return binary_pos(self.value)
    }
    var res = "",
        v = self.value
    while(v > 0){
        var dm = divmod_pos(v, base.toString())
        res = parseInt(dm[1].value).toString(base) + res
        v = dm[0].value
        if(v == 0){break}
    }
    return res
}

long_int.to_bytes = function(self, len, byteorder, signed){
    // The integer is represented using len bytes. An OverflowError is raised
    // if the integer is not representable with the given number of bytes.
    var res = [],
        v = self.value
    if(! $B.$bool(signed) && ! self.pos){
        throw _b_.OverflowError.$factory("can't convert negative int to unsigned")
    }
    while(v > 0){
        var dm = divmod_pos(v, 256)
        v = parseInt(dm[0].value)
        res.push(parseInt(dm[1].value))
        if(res.length > len){
            throw _b_.OverflowError.$factory("int too big to convert")
        }
    }
    while(res.length < len){
        res.push(0)
    }
    if(byteorder == 'big'){
        res.reverse()
    }
    return _b_.bytes.$factory(res)
}


function digits(base){
    // Return an object where keys are all the digits valid in specified base
    // and value is "true"
    // Used to test if the string passed as first argument to long_int is valid
    var is_digits = {}
    // Number from 0 to base, or from 0 to 9 if base > 10
    for(var i = 0; i < base; i++){
        if(i == 10){break}
        is_digits[i] = true
    }
    if(base > 10){
        // Additional letters
        // For instance in base 16, add "abcdefABCDEF" as keys
        for(var i = 0; i < base - 10; i++){
            is_digits[String.fromCharCode(65 + i)] = true
            is_digits[String.fromCharCode(97 + i)] = true
        }
    }
    return is_digits
}

var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1
var MIN_SAFE_INTEGER = -MAX_SAFE_INTEGER

function isSafeInteger(n) {
    return (typeof n === "number" &&
        Math.round(n) === n &&
        MIN_SAFE_INTEGER <= n &&
        n <= MAX_SAFE_INTEGER)
}

function intOrLong(long){
    // If the result of an operation on long_int instances is a safe
    // integer, convert it to a Javascript number
    var v = parseInt(long.value) * (long.pos ? 1 : -1)
    if(v > MIN_SAFE_INTEGER && v < MAX_SAFE_INTEGER){return v}
    return long
}

long_int.$from_int = function(value){
    return {__class__: long_int, value: value.toString(), pos: value > 0}
}

long_int.$factory = function(value, base){
    if(arguments.length > 2){
        throw _b_.TypeError.$factory("long_int takes at most 2 arguments (" +
            arguments.length + " given)")
    }
    //    console.log("long int", value, typeof value, base)
    // base defaults to 10
    if(base === undefined){base = 10}
    else if(!isinstance(base, int)){
        throw TypeError.$factory("'" + $B.class_name(base) +
            "' object cannot be interpreted as an integer")
    }
    if(base < 0 || base == 1 || base > 36){
        throw ValueError.$factory(
            "long_int.$factory() base must be >= 2 and <= 36")
    }
    if(typeof value == "number"){
        var pos = value >= 0,
            value = Math.abs(value),
            res
        if(isSafeInteger(value)){
            res = long_int.$from_int(value)
        }
        else if(value.constructor == Number){
            var s = value.toString(),
                pos_exp = s.search("e")
            if(pos_exp > -1){
                var mant = s.substr(0, pos_exp),
                    exp = parseInt(s.substr(pos_exp + 1)),
                    point = mant.search(/\./)
                if(point > -1){
                    var nb_dec = mant.substr(point + 1).length
                    if(nb_dec > exp){
                        var res = mant.substr(0, point) +
                            mant.substr(point + 1).substr(0, exp)
                        res = long_int.$from_int(res)
                    }else{
                        var res = mant.substr(0, point) +
                            mant.substr(point + 1) + '0'.repeat(exp - nb_dec)
                        res = long_int.$from_int(res)
                    }
                }else{
                    res = long_int.$from_int(mant + '0'.repeat(exp))
                }
            }else{
                var point = s.search(/\./)
                if(point > -1){
                    res = long_int.$from_int(s.substr(0, point))
                }else{
                    res = long_int.$from_int(s)
                }
            }
        }
        else{
            throw ValueError.$factory(
                "argument of long_int is not a safe integer")
        }
        res.pos = pos
        return res
    }else if(isinstance(value, _b_.float)){
        if(value === Number.POSITIVE_INFINITY ||
                value === Number.NEGATIVE_INFINITY){
            return value
        }
        if(value >= 0){value = new Number(Math.round(value.value))}
        else{value = new Number(Math.ceil(value.value))}
    }else if(isinstance(value, _b_.bool)){
        if(value.valueOf()){return int.$factory(1)}
        return int.$factory(0)
    }else if(value.__class__ === long_int){
        return value
    }else if(isinstance(value, int)){
        // int subclass
        value = value.$brython_value + ""
    }else if(isinstance(value, _b_.bool)){
        value = _b_.bool.__int__(value) + ""
    }else if(typeof value != "string"){
        throw ValueError.$factory(
            "argument of long_int must be a string, not " +
            $B.class_name(value))
    }
    var has_prefix = false,
        pos = true,
        start = 0
    // Strip leading and trailing whitespaces
    while(value.charAt(0) == " " && value.length){value = value.substr(1)}
    while(value.charAt(value.length - 1) == " " && value.length){
        value = value.substr(0, value.length - 1)
    }
    // Check if string starts with + or -
    if(value.charAt(0) == "+"){has_prefix = true}
    else if(value.charAt(0) == "-"){has_prefix = true; pos = false}
    if(has_prefix){
        // Remove prefix
        if(value.length == 1){
            // "+" or "-" alone are not valid arguments
            throw ValueError.$factory(
                'long_int argument is not a valid number: "' + value + '"')
        }else{value = value.substr(1)}
    }
    // Ignore leading zeros
    while(start < value.length - 1 && value.charAt(start) == "0"){start++}
    value = value.substr(start)

    // Check if all characters in value are valid in the base
    var is_digits = digits(base),
        point = -1
    for(var i = 0; i < value.length; i++){
        if(value.charAt(i) == "." && point == -1){
            point = i
        }else if(false){ //value.charAt(i) == "e"){
            // Form 123e56 or 12.3e45
            var mant = value.substr(0, i)
            if(/^[+-]?\d+$/.exec(value.substr(i + 1))){
                exp = parseInt(value.substr(i + 1))
            }else{
                throw Error("wrong exp " + value.substr(i + 1))
            }
            if(point != -1){
                mant = mant.substr(0, point) + mant.substr(point + 1)
                exp = exp + point - 1
            }
            point = -1
            value = mant + "0".repeat(exp - mant.length)
            break
        }

        else if(! is_digits[value.charAt(i)]){
            throw ValueError.$factory(
                'long_int argument is not a valid number: "' + value + '"')
        }
    }
    if(point != -1){value = value.substr(0, point)}
    if(base != 10){
        // Conversion to base 10
        var coef = "1",
            v10 = long_int.$factory(0),
            ix = value.length
        while(ix--){
            var digit_base10 = parseInt(value.charAt(ix), base).toString(),
                digit_by_coef = mul_pos(coef, digit_base10).value
            v10 = add_pos(v10.value, digit_by_coef)
            coef = mul_pos(coef, base.toString()).value
        }
        return v10
    }
    return {__class__: long_int, value: value, pos: pos}
}

$B.set_func_names(long_int, "builtins")

$B.long_int = long_int

$B.fast_long_int = function(value, pos){
    return {__class__: $B.long_int,
            value: value,
            pos: pos
           }
}
})(__BRYTHON__)
