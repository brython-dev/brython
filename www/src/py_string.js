"use strict";
;(function($B){

var _b_ = $B.builtins

// build tables from data in unicode_data.js
var unicode_tables = $B.unicode_tables

$B.has_surrogate = function(s){
    // Check if there are "surrogate pairs" characters in string s
    for(var i = 0; i < s.length; i++){
        var code = s.charCodeAt(i)
        if(code >= 0xD800 && code <= 0xDBFF){
            return true
        }
    }
    return false
}

var escape2cp = {b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', v: '\v'}

$B.surrogates = function(s){
    var s1 = '',
        escaped = false
    for(var char of s){
        if(escaped){
            var echar = escape2cp[char]
            if(echar !== undefined){
                s1 += echar
            }else{
                s1 += '\\' + char
            }
            escaped = false
        }else if(char == '\\'){
            escaped = true
        }else{
            s1 += char
        }
    }

    var codepoints = [],
        surrogates = [],
        j = 0

    for(var i = 0, len = s1.length; i < len; i++){
        var cp = s1.codePointAt(i)
        if(cp >= 0x10000){
            surrogates.push(j)
            i++
        }
        j++
    }
    return surrogates
}

$B.String = function(s){
    var srg = $B.surrogates(s)
    return srg.length == 0 ? s : $B.make_String(s, srg)
}

$B.make_String = function(s, surrogates){
    if(! Array.isArray(surrogates)){
        throw Error('not list')
    }
    var res = new String(s)
    res.__class__ = str
    res.surrogates = surrogates
    return res
}


function pypos2jspos(s, pypos){
    // convert Python position to JS position
    if(s.surrogates === undefined){
        return pypos
    }
    var nb = 0
    while(s.surrogates[nb] < pypos){
        nb++
    }
    return pypos + nb
}

function jspos2pypos(s, jspos){
    // convert JS position to Python position
    if(s.surrogates === undefined){
        return jspos
    }
    var nb = 0
    while(s.surrogates[nb] + nb < jspos){
        nb++
    }
    return jspos - nb
}

function to_string(args){
    if(typeof args == 'string'){
        return args
    }
    if(Array.isArray(args)){
        for(var i = 0, len = args.length; i < len; i++){
            args[i] = to_string(args[i])
        }
        return args
    }else{
        if(args.__class__ && ! (args instanceof String)){
            return args.$brython_value
        }else{
            return args
        }
    }
}

var str = {
    __class__: _b_.type,
    __dir__: _b_.object.__dir__,
    __qualname__: 'str',
    $is_class: true,
    $native: true
}

str.$to_string = to_string

function normalize_start_end($){
    var len
    if(typeof $.self == "string"){
        len = $.self.length
    }else{
        len = str.__len__($.self)
    }
    if($.start === null || $.start === _b_.None){
        $.start = 0
    }else if($.start < 0){
        $.start += len
        $.start = Math.max(0, $.start)
    }
    if($.end === null || $.end === _b_.None){
        $.end = len
    }else if($.end < 0){
        $.end += len
        $.end = Math.max(0, $.end)
    }

    if(! $B.$isinstance($.start, _b_.int) || ! $B.$isinstance($.end, _b_.int)){
        throw _b_.TypeError.$factory("slice indices must be integers " +
            "or None or have an __index__ method")
    }
    if($.self.surrogates){
        $.js_start = pypos2jspos($.self, $.start)
        $.js_end = pypos2jspos($.self, $.end)
    }
}

function reverse(s){
    // Reverse a string
    return s.split("").reverse().join("")
}

function check_str(obj, prefix){
    if(obj instanceof String || typeof obj == "string"){
        return
    }
    if(! $B.$isinstance(obj, str)){
        throw _b_.TypeError.$factory((prefix || '') +
            "must be str, not " + $B.class_name(obj))
    }
}

function to_chars(s){
    // Transform Javascript string s into a list of Python characters
    // (2 JS chars if surrogate, 1 otherwise)
    s = to_string(s)
    return Array.from(s)
}

function to_codepoints(s){
    // Transform Javascript string s into a list of codepoints
    if(s.codepoints){
        return s.codepoints
    }
    var cps = []
    for(var i = 0, len = s.length; i < len; i++){
        var code = s.charCodeAt(i)
        if(code >= 0xD800 && code <= 0xDBFF){
            var v = 0x10000
            v += (code & 0x03FF) << 10
            v += (s.charCodeAt(i + 1) & 0x03FF)
            cps.push(v)
            i++
        }else{
            cps.push(code)
        }
    }
    return s.codepoints = cps
}

str.__add__ = function(_self, other){
    if(! $B.$isinstance(other, str)){
        try{
            return $B.$getattr(other, "__radd__")(_self)
        }catch(err){
            throw _b_.TypeError.$factory("Can't convert " +
                $B.class_name(other) + " to str implicitly")}
    }
    [_self, other] = to_string([_self, other])
    var res = $B.String(_self + other)
    return res
}

str.__contains__ = function(_self, item){
    if(! $B.$isinstance(item, str)){
        throw _b_.TypeError.$factory("'in <string>' requires " +
            "string as left operand, not " + $B.class_name(item))
    }
    [_self, item] = to_string([_self, item])

    if(item.__class__ === str || $B.$isinstance(item, str)){
        var nbcar = item.length
    }else{
        var nbcar = _b_.len(item)
    }
    if(nbcar == 0){
         // a string contains the empty string
        return true
    }
    var len = _self.length
    if(len == 0){
        return nbcar == 0
    }
    for(var i = 0, len = _self.length; i < len; i++){
        if(_self.substr(i, nbcar) == item){
            return true
        }
    }
    return false
}

str.__delitem__ = function(){
    throw _b_.TypeError.$factory("'str' object doesn't support item deletion")
}

// __dir__must be assigned explicitely because attribute resolution for
// builtin classes doesn't use __mro__
str.__dir__ = _b_.object.__dir__

str.__eq__ = function(_self, other){
    if($B.$isinstance(other, str)){
        [_self, other] = to_string([_self, other])
        if(typeof _self == 'string' && typeof other == 'string'){
            return _self == other
        }
        if(_self.length != other.length){
            return false
        }
        for(var i = 0, len = _self.length; i < len; i++){
            if(_self[i] != other[i]){
                return false
            }
        }
        return true
    }
    return _b_.NotImplemented
}

function preformat(_self, fmt){
    if(fmt.empty){
        return _b_.str.$factory(_self)
    }
    if(fmt.type && fmt.type != "s"){
        throw _b_.ValueError.$factory("Unknown format code '" + fmt.type +
            "' for object of type 'str'")
    }
    return _self
}

str.__format__ = function(_self, format_spec) {
    [_self, format_spec] = to_string([_self, format_spec])
    var fmt = new $B.parse_format_spec(format_spec, _self)

    if(fmt.sign !== undefined){
        throw _b_.ValueError.$factory(
            "Sign not allowed in string format specifier")
    }
    if(fmt.precision){
        _self = _self.substr(0, fmt.precision)
    }
    // For strings, alignment default to left
    fmt.align = fmt.align || "<"
    return $B.format_width(preformat(_self, fmt), fmt)
}

str.__getitem__ = function(_self, arg){
    _self = to_string(_self)
    if($B.$isinstance(arg, _b_.int)){
        var len = str.__len__(_self)
        var pos = arg
        if(arg < 0){
            pos += len
        }
        if(pos >= 0 && pos < len){
            var jspos = pypos2jspos(_self, pos)
            if(_self.codePointAt(jspos) >= 0x10000){
                return $B.String(_self.substr(jspos, 2))
            }else{
                return _self[jspos]
            }
        }
        throw _b_.IndexError.$factory("string index out of range")
    }
    if($B.$isinstance(arg, _b_.slice)){
        return _b_.str.$getitem_slice(_self, arg)
    }
    if($B.$isinstance(arg, _b_.bool)){
        return _self.__getitem__(_b_.int.$factory(arg))
    }
    throw _b_.TypeError.$factory("string indices must be integers")
}

str.$getitem_slice = function(_self, slice){
    var len = str.__len__(_self),
        s = _b_.slice.$conv_for_seq(slice, len),
        start = pypos2jspos(_self, s.start),
        stop = pypos2jspos(_self, s.stop),
        step = s.step
    var res = "",
        i = null
    if(step > 0){
        if(stop <= start){
            return ""
        }
        for(var i = start; i < stop; i += step){
            res += _self[i]
        }
    }else{
        if(stop >= start){
            return ''
        }
        for(var i = start; i > stop; i += step){
            res += _self[i]
        }
    }
    return $B.String(res)
}

var prefix = 2,
    suffix = 3,
    mask = (2 ** 32 - 1)

str.$nb_str_hash_cache = 0

function fnv(p){
    if(p.length == 0){
        return 0
    }

    var x = prefix
    x = (x ^ (p[0] << 7)) & mask
    for(var i = 0, len = p.length; i < len; i++){
        x = ((1000003 * x) ^ p[i]) & mask
    }
    x = (x ^ p.length) & mask
    x = (x ^ suffix) & mask

    if(x == -1){
        x = -2
    }
    return x
}

str.$getnewargs = function(self){
    return $B.fast_tuple([to_string(self)])
}

str.__getnewargs__ = function(){
    return str.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

str.__hash__ = function(_self){
    // copied from
    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    var s = to_string(_self)
    for(var i = 0, h = 0, len = s.length; i < len; i++){
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
}

str.__init__ = function(self, arg){
    // no-op
    return _b_.None
}

var str_iterator = $B.make_class("str_iterator",
    function(s){
        return {
            __class__: str_iterator,
            it: s[Symbol.iterator]()
        }
    }
)

str_iterator.__iter__ = function(_self){
    return _self
}

str_iterator.__next__ = function(_self){
    var res = _self.it.next()
    if(res.done){
        throw _b_.StopIteration.$factory('')
    }
    return res.value
}

$B.set_func_names(str_iterator, 'builtins')

str.__iter__ = function(_self){
    return str_iterator.$factory(_self)
}

str.__len__ = function(_self){
    _self = to_string(_self)
    if(_self.surrogates === undefined){
        return _self.length
    }
    if(_self.len !== undefined){
        return _self.len
    }
    var len = _self.len = _self.length - _self.surrogates.length
    return len
}

// Start of section for legacy formatting (with %)

var kwarg_key = new RegExp("([^\\)]*)\\)")

var NotANumber = function() {
    this.name = "NotANumber"
}

var number_check = function(s, flags){
    if(! $B.$isinstance(s, [_b_.int, _b_.float])){
        var type = flags.conversion_type
        throw _b_.TypeError.$factory(`%${type} format: a real number ` +
            `is required, not ${$B.class_name(s)}`)
    }
}

var get_char_array = function(size, char){
    if(size <= 0){
        return ""
    }
    return new Array(size + 1).join(char)
}

var format_padding = function(s, flags, minus_one){
    var padding = flags.padding
    if(! padding){  // undefined
        return s
    }
    s = s.toString()
    padding = parseInt(padding, 10)
    if(minus_one){  // numeric formatting where sign goes in front of padding
        padding -= 1
    }
    if(! flags.left){
        return get_char_array(padding - s.length, flags.pad_char) + s
    }else{
        // left adjusted
        return s + get_char_array(padding - s.length, flags.pad_char)
    }
}

const max_precision = 2 ** 31 - 4,
      max_repeat = 2 ** 30 - 1

var format_int_precision = function(val, flags){
    var precision = flags.precision
    if(! precision){
        return _b_.str.$factory(val)
    }
    precision = parseInt(precision, 10)
    if(precision > max_precision){
        throw _b_.OverflowError.$factory('precision too large')
    }
    var s
    if(val.__class__ === $B.long_int){
       s = $B.long_int.to_base(val, 10)
    }else{
       s = val.toString()
    }
    if(precision - s.length > max_repeat){
        throw _b_.OverflowError.$factory('precision too large')
    }
    if(s[0] === "-"){
        return "-" + "0".repeat(Math.max(0, precision - s.length + 1)) +
            s.slice(1)
    }
    return "0".repeat(Math.max(0, precision - s.length)) + s
}

var format_float_precision = function(val, upper, flags, modifier){
    var precision = flags.precision
    if(isFinite(val)){
        return modifier(val, precision, flags, upper)
    }
    if(val === Infinity){
        val = "inf"
    }else if(val === -Infinity){
        val = "-inf"
    }else{
        val = "nan"
    }
    if(upper){
        return val.toUpperCase()
    }
    return val

}

var format_sign = function(val, flags){
    if(flags.sign){
        if(val >= 0 || isNaN(val) || val === Number.POSITIVE_INFINITY){
            return "+"
        }
    }else if(flags.space){
        if(val >= 0 || isNaN(val)){
            return " "
        }
    }
    return ''
}

var str_format = function(val, flags) {
    // string format supports left and right padding
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    return format_padding(str.$factory(val), flags)
}

var num_format = function(val, flags) {
    number_check(val, flags)
    if($B.$isinstance(val, _b_.float)){
        val = parseInt(val.value)
    }else if(! $B.$isinstance(val, _b_.int)){
        val = parseInt(val)
    }

    var s = format_int_precision(val, flags)
    if(flags.pad_char === "0"){
        if(val < 0){
            s = s.substring(1)
            return "-" + format_padding(s, flags, true)
        }
        var sign = format_sign(val, flags)
        if(sign !== ""){
            return sign + format_padding(s, flags, true)
        }
    }

    return format_padding(format_sign(val, flags) + s, flags)
}

var repr_format = function(val, flags) {
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    return format_padding(_b_.repr(val), flags)
}

var ascii_format = function(val, flags, type) {
    flags.pad_char = " "  // even if 0 padding is defined, don't use it
    var ascii
    if(type == 'bytes'){
        var repr = _b_.repr(val)
        ascii = _b_.str.encode(repr, 'ascii', 'backslashreplace')
        ascii = _b_.bytes.decode(ascii, 'ascii')
    }else{
        ascii = _b_.ascii(val)
    }
    return format_padding(ascii, flags)
}

// converts val to float and sets precision if missing
var _float_helper = function(val, flags){
    number_check(val, flags)
    if(flags.precision === undefined){
        if(! flags.decimal_point){
            flags.precision = 6
        }else{
            flags.precision = 0
        }
    }else{
        flags.precision = parseInt(flags.precision, 10)
        validate_precision(flags.precision)
    }
    return $B.$isinstance(val, _b_.int) ? val : val.value
}

// used to capture and remove trailing zeroes
var trailing_zeros = /(.*?)(0+)([eE].*)/,
    leading_zeros = /\.(0*)/,
    trailing_dot = /\.$/

var validate_precision = function(precision) {
    // force precision to limits of javascript
    if(precision > 20){precision = 20}
}

function handle_special_values(value, upper){
    var special
    if(isNaN(value)){
        special = upper ? "NAN" : "nan"
    }else if(value == Number.POSITIVE_INFINITY){
        special = upper ? "INF" : "inf"
    }else if(value == Number.NEGATIVE_INFINITY){
        special = upper ? "-INF" : "-inf"
    }
    return special
}

// gG
var floating_point_format = function(val, upper, flags){
    val = _float_helper(val, flags)

    var special = handle_special_values(val, upper)
    if(special){
        return format_padding(format_sign(val, flags) + special, flags)
    }
    var p = flags.precision
    if(p == 0){
        p = 1
    }
    var exp_format = val.toExponential(p - 1),
        e_index = exp_format.indexOf('e'),
        exp = parseInt(exp_format.substr(e_index + 1)),
        res

    function remove_zeros(v){
        if(flags.alternate){
            return v
        }
        if(v.indexOf('.') > -1){
            while(v.endsWith('0')){
                v = v.substr(0, v.length - 1)
            }
            if(v.endsWith('.')){
                v = v.substr(0, v.length - 1)
            }
        }
        return v
    }

    if(-4 <= exp && exp < p){
        /*
        If m <= exp < p, where m is -4 for floats and -6 for Decimals, the
        number is formatted with presentation type 'f' and precision p-1-exp
        */
        flags.precision = Math.max(0, p - 1 - exp)
        res = floating_point_decimal_format(val, upper, flags)
        res = remove_zeros(res)
    }else{
        /*
        Otherwise, the number is formatted with presentation type 'e' and
        precision p-1
        */
        flags.precision = Math.max(0, p - 1)
        var delim = upper ? 'E' : 'e',
            exp_fmt = floating_point_exponential_format(val, upper, flags),
            parts = exp_fmt.split(delim)
        parts[0] = remove_zeros(parts[0])
        res = parts.join(delim)
    }
    return format_padding(format_sign(val, flags) + res, flags)
}

var roundDownToFixed = $B.roundDownToFixed = function(v, d){
    if(d == 0 && v.toString().indexOf('e') > -1){
        // with precision 0, never include "e"
        return BigInt(v).toString()
    }
    const mul = Math.pow(10, d);
    var is_neg = v < 0
    if(is_neg){
        v = -v
    }
    var res_floor = (Math.floor(v * mul) / mul).toFixed(d),
        res_ceil = (Math.ceil(v * mul) / mul).toFixed(d),
        res
    if(v - res_floor == res_ceil - v){
        // if two multiples are equally close, rounding is done toward
        // the even choice
        var last = res_floor[res_floor.length - 1]
        res = last.match(/[02468]/) ? res_floor : res_ceil
    }else{
        res = v - res_floor < res_ceil - v ? res_floor : res_ceil
    }
    return is_neg ? '-' + res : res
}

// fF
var floating_point_decimal_format = function(val, upper, flags){
    val = _float_helper(val, flags)
    var unpadded = format_float_precision(val, upper, flags,
        function(val, precision, flags) {
            // can't use val.toFixed(precision) because
            // (2.5).toFixed(0) returns "3", not "2"...
            var res = roundDownToFixed(val, precision)
            if(precision === 0 && flags.alternate){
                res += '.'
            }
            if(Object.is(val, -0)){
                res = '-' + res
            }
            return res
        })
    return format_padding(format_sign(val, flags) + unpadded,
        flags)
}

var _floating_exp_helper = function(val, precision, flags, upper){
    var is_neg = false,
        val_pos = val.toString()
    if(val < 0){
        is_neg = true
        val_pos = val_pos.substr(1)
    }else if(Object.is(val, -0)){
        is_neg = true
    }

    var parts = val_pos.split('.'),
        exp = 0,
        exp_sign = '+',
        mant
    if(parts[0] == '0'){
        if(parts[1]){
            exp_sign = '-'
            exp++
            var i = 0
            while(parts[1][i] == '0'){
                i++
            }
            exp += i
            mant = parts[1][i]
            if(parts[1][i + 1]){
                mant += '.' + parts[1].substr(i + 1)
            }
        }else{
            mant = '0'
        }
    }else{
        exp = parts[0].length - 1
        mant = parts[0][0]
        if(parts[0].length > 1){
            mant += '.' + parts[0].substr(1) + (parts[1] || '')
        }else if(parts[1]){
            mant += '.' + parts[1]
        }
    }
    mant = parseFloat(mant)
    // round mantissa to precision
    mant = roundDownToFixed(parseFloat(mant), precision)
    if(parseFloat(mant) == 10){
        // 9.5 is rounded to 10 !
        parts = mant.split('.')
        parts[0] = '1'
        mant = parts.join('.')
        exp = parseInt(exp) + 1
    }
    if(flags.alternate && mant.indexOf('.') == -1){
        mant += '.'
    }

    if(exp.toString().length == 1){
        // exponent has at least 2 digits
        exp = '0' + exp
    }
    return `${is_neg ? '-' : ''}${mant}${upper ? 'E' : 'e'}${exp_sign}${exp}`
}

// eE
var floating_point_exponential_format = function(val, upper, flags){

    val = _float_helper(val, flags)
    return format_padding(format_sign(val, flags) +
        format_float_precision(val, upper, flags, _floating_exp_helper), flags)
}

$B.formatters = {
    floating_point_format,
    floating_point_decimal_format,
    floating_point_exponential_format
    }
var signed_hex_format = function(val, upper, flags){
    var ret
    if(! $B.$isinstance(val, _b_.int)){
        throw _b_.TypeError.$factory(
            `%X format: an integer is required, not ${$B.class_name(val)}`)
    }

    if(val.__class__ === $B.long_int){
       ret = val.value.toString(16)
    }else{
       ret = parseInt(val)
       ret = ret.toString(16)
    }
    ret = format_int_precision(ret, flags)
    if(upper){ret = ret.toUpperCase()}
    if(flags.pad_char === "0"){
        if(val < 0){
            ret = ret.substring(1)
            ret = "-" + format_padding(ret, flags, true)
        }
        var sign = format_sign(val, flags)
        if(sign !== ""){
            ret = sign + format_padding(ret, flags, true)
        }
    }

    if(flags.alternate){
        if(ret.charAt(0) === "-"){
            if(upper){ret = "-0X" + ret.slice(1)}
            else{ret = "-0x" + ret.slice(1)}
        }else{
            if(upper){ret = "0X" + ret}
            else{ret = "0x" + ret}
        }
    }
    return format_padding(format_sign(val, flags) + ret, flags)
}

var octal_format = function(val, flags) {
    number_check(val, flags)
    var ret

    if(val.__class__ === $B.long_int){
        ret = $B.long_int.to_base(8)
    }else{
        ret = parseInt(val)
        ret = ret.toString(8)
    }

    ret = format_int_precision(ret, flags)

    if(flags.pad_char === "0"){
        if(val < 0){
            ret = ret.substring(1)
            ret = "-" + format_padding(ret, flags, true)
        }
        var sign = format_sign(val, flags)
        if(sign !== ""){
            ret = sign + format_padding(ret, flags, true)
        }
    }

    if(flags.alternate){
        if(ret.charAt(0) === "-"){ret = "-0o" + ret.slice(1)}
        else{ret = "0o" + ret}
    }
    return format_padding(ret, flags)
}

function series_of_bytes(val, flags){
    if(val.__class__ && val.__class__.$buffer_protocol){
        var it = _b_.iter(val),
            ints = []
        while(true){
            try{
                ints.push(_b_.next(it))
            }catch(err){
                if(err.__class__ === _b_.StopIteration){
                    var b = _b_.bytes.$factory(ints)
                    return format_padding(_b_.bytes.decode(b, "ascii"), flags)
                }
                throw err
            }
        }
    }else{
        try{
            var bytes_obj = $B.$getattr(val, "__bytes__")()
            return format_padding(_b_.bytes.decode(bytes_obj), flags)
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                throw _b_.TypeError.$factory("%b does not accept '" +
                    $B.class_name(val) + "'")
            }
            throw err
        }
    }
}

var single_char_format = function(val, flags, type){
    if(type == 'bytes'){
        if($B.$isinstance(val, _b_.int)){
            if(val.__class__ === $B.long_int || val < 0 || val > 255){
                throw _b_.OverflowError.$factory("%c arg not in range(256)")
            }
        }else if($B.$isinstance(val, [_b_.bytes, _b_.bytearray])){
            if(val.source.length > 1){
                throw _b_.TypeError.$factory(
                    "%c requires an integer in range(256) or a single byte")
            }
            val = val.source[0]
        }
    }else{
        if($B.$isinstance(val, _b_.str)){
            if(_b_.str.__len__(val) == 1){
                return val
            }
            throw _b_.TypeError.$factory("%c requires int or char")
        }else if(! $B.$isinstance(val, _b_.int)){
            throw _b_.TypeError.$factory("%c requires int or char")
        }
        if((val.__class__ === $B.long_int &&
                (val.value < 0 || val.value >= 0x110000)) ||
                (val < 0 || val >= 0x110000)){
            throw _b_.OverflowError.$factory('%c arg not in range(0x110000)')
        }
    }
    return format_padding(_b_.chr(val), flags)
}

var num_flag = function(c, flags){
    if(c === "0" && ! flags.padding && ! flags.decimal_point && ! flags.left){
        flags.pad_char = "0"
        return
    }
    if(!flags.decimal_point){
        flags.padding = (flags.padding || "") + c
    }else{
        flags.precision = (flags.precision || "") + c
    }
}

var decimal_point_flag = function(val, flags) {
    if(flags.decimal_point){
        // can only have one decimal point
        throw new UnsupportedChar()
    }
    flags.decimal_point = true
}

var neg_flag = function(val, flags){
    flags.pad_char = " "  // overrides '0' flag
    flags.left = true
}

var space_flag = function(val, flags){
    flags.space = true
}

var sign_flag = function(val, flags){
    flags.sign = true
}

var alternate_flag = function(val, flags){
    flags.alternate = true
}

var char_mapping = {
    "b": series_of_bytes,
    "s": str_format,
    "d": num_format,
    "i": num_format,
    "u": num_format,
    "o": octal_format,
    "r": repr_format,
    "a": ascii_format,
    "g": function(val, flags){
        return floating_point_format(val, false, flags)
    },
    "G": function(val, flags){return floating_point_format(val, true, flags)},
    "f": function(val, flags){
        return floating_point_decimal_format(val, false, flags)
    },
    "F": function(val, flags){
        return floating_point_decimal_format(val, true, flags)
    },
    "e": function(val, flags){
        return floating_point_exponential_format(val, false, flags)
    },
    "E": function(val, flags){
        return floating_point_exponential_format(val, true, flags)
    },
    "x": function(val, flags){return signed_hex_format(val, false, flags)},
    "X": function(val, flags){return signed_hex_format(val, true, flags)},
    "c": single_char_format,
    "0": function(val, flags){return num_flag("0", flags)},
    "1": function(val, flags){return num_flag("1", flags)},
    "2": function(val, flags){return num_flag("2", flags)},
    "3": function(val, flags){return num_flag("3", flags)},
    "4": function(val, flags){return num_flag("4", flags)},
    "5": function(val, flags){return num_flag("5", flags)},
    "6": function(val, flags){return num_flag("6", flags)},
    "7": function(val, flags){return num_flag("7", flags)},
    "8": function(val, flags){return num_flag("8", flags)},
    "9": function(val, flags){return num_flag("9", flags)},
    "-": neg_flag,
    " ": space_flag,
    "+": sign_flag,
    ".": decimal_point_flag,
    "#": alternate_flag
}

// exception thrown when an unsupported char is encountered in legacy format
var UnsupportedChar = function(){
    this.name = "UnsupportedChar"
}

const conversion_flags = '#0- +',
      length_modifiers = 'hlL',
      conversion_types = 'diouxXeEfFgGcrsa'

function parse_mod_format(s, type, pos){
    var flags = {pad_char: ' '},
        len = s.length,
        start_pos = pos,
        mo
    pos++
    while(pos < len){
        var char = s[pos]
        if(char == '('){
            var end = s.substr(pos).indexOf(')')
            if(end == -1){
                throw _b_.ValueError.$factory('incomplete format key')
            }else{
                flags.mapping_key = s.substr(pos + 1, end - 1)
                pos += end + 1
            }
        }else if(conversion_flags.indexOf(char) > -1){
            flags.conversion_flag = char
            if(char == '#'){
                flags.alternate = true
            }else if(char == '-'){
                flags.left = true
            }else if(char == '+'){
                flags.sign = '+'
            }else if(char == '0'){
                flags.pad_char = '0'
            }else if(char == ' '){
                flags.space = true
            }
            pos++
        }else if(char == '*'){
            flags.padding = '*'
            pos++
        }else if(mo = /^\d+/.exec(s.substr(pos))){
            flags.padding = mo[0]
            pos += mo[0].length
        }else if(char == '.'){
            pos++
            if(s[pos] == '*'){
                flags.precision = '*'
                pos++
            }else if(mo = /^\d+/.exec(s.substr(pos))){
                flags.precision = mo[0]
                pos += mo[0].length
            }else{
                flags.precision = "0"
            }
        }else if(length_modifiers.indexOf(char) > -1){
            flags.length_modifier = char
            pos++
        }else if((conversion_types.indexOf(char) > -1) ||
                (char == 'b' && type == 'bytes')){
            if(type == 'bytes'){
                if(char == 's'){
                    // for bytes, 's' is an alias for 'b'
                    char = 'b'
                }else if(char == 'r'){
                    char = 'a'
                }
            }
            flags.conversion_type = char
            flags.end = pos
            flags.string = s.substring(start_pos, pos + 1)
            if(flags.left && flags.pad_char == '0'){
                // conversion flag "-" overrides "0" if both are given
                flags.pad_char = ' '
            }
            return flags
        }else{
            throw _b_.ValueError.$factory(`invalid character in format: ${char}`)
        }
    }
    throw _b_.ValueError.$factory('invalid format')
}

function is_mapping(obj){
    return _b_.hasattr(obj, 'keys') && _b_.hasattr(obj, '__getitem__')
}

$B.printf_format = function(s, type, args){
    // printf-style bytes or string formatting
    // s is a string
    // type is 'str' or 'bytes', the class of the original formatted object
    // args are the arguments passed to %
    var length = s.length,
        pos = 0,
        argpos = null,
        getitem
    if($B.$isinstance(args, _b_.tuple)){
        argpos = 0
    }else{
        getitem = $B.$getattr(args, "__getitem__", _b_.None)
    }
    var ret = '', // return value
        nbph = 0, // number of placeholders
        pos = 0,  // position in s
        len = s.length
    while(pos < len){
        var fmtpos = s.indexOf("%", pos)
        if(fmtpos < 0){
            ret += s.substring(pos)
            break
        }
        ret += s.substring(pos, fmtpos)
        pos = fmtpos
        if(s[pos + 1] == '%'){
            ret += '%'
            pos += 2
        }else{
            nbph++
            if(nbph > 1){
                // issue 2184
                if((! $B.$isinstance(args, _b_.tuple)) &&
                        ! is_mapping(args)){
                    throw _b_.TypeError.$factory(
                        "not enough arguments for format string")
                }
            }
            var fmt = parse_mod_format(s, type, pos)
            pos = fmt.end + 1
            if(fmt.padding == '*'){
                // read value in arguments
                if(args[argpos] === undefined){
                    throw _b_.ValueError.$factory('no value for field width *')
                }
                fmt.padding = args[argpos]
                argpos++
            }
            if(fmt.precision == '*'){
                // read value in arguments
                if(args[argpos] === undefined){
                    throw _b_.ValueError.$factory('no value for precision *')
                }
                fmt.precision = args[argpos]
                argpos++
            }
            var func = char_mapping[fmt.conversion_type],
                value
            if(fmt.mapping_key !== undefined){
                value = getitem(fmt.mapping_key)
            }else{
                if(argpos === null){
                    value = args
                }else{
                    value = args[argpos]
                    if(value === undefined){
                        throw _b_.TypeError.$factory(
                            "not enough arguments for format string")
                    }
                    argpos++
                }
            }
            ret += func(value, fmt, type)
        }
    }

    if(argpos !== null){
        if(args.length > argpos){
            throw _b_.TypeError.$factory(
                "not enough arguments for format string")
        }else if(args.length < argpos){
            throw _b_.TypeError.$factory(
                "not all arguments converted during string formatting")
        }
    }else if(nbph == 0){
        throw _b_.TypeError.$factory(
            "not all arguments converted during string formatting")
    }
    return ret
}

str.__mod__ = function(_self, args){
    _self = to_string(_self)
    var res = $B.printf_format(_self, 'str', args)
    return $B.String(res)
}

str.__mro__ = [_b_.object]

str.__mul__ = function(){
    var $ = $B.args("__mul__", 2, {self: null, other: null},
            ["self", "other"], arguments, {}, null, null),
        _self = to_string($.self)
    if(! $B.$isinstance($.other, _b_.int)){
        throw _b_.TypeError.$factory(
        "Can't multiply sequence by non-int of type '" +
            $B.class_name($.other) + "'")
    }
    return _self.repeat($.other < 0 ? 0 : $.other)
}

str.__ne__ = function(_self, other){
    var eq = str.__eq__(_self, other)
    return eq === _b_.NotImplemented ? eq : ! eq
}

str.__new__ = function(cls, value){
    if(cls === undefined){
        throw _b_.TypeError.$factory("str.__new__(): not enough arguments")
    }else if(cls === _b_.str){
        return value
    }else{
        return {
            __class__: cls,
            $brython_value: str.$factory(value),
            __dict__: $B.empty_dict()
            }
    }
}

str.__repr__ = function(_self){
    // special cases
    _self = to_string(_self)
    var t = $B.special_string_repr, // in brython_builtins.js
        repl = '',
        chars = to_chars(_self)
    for(var i = 0; i < chars.length; i++){
        var cp = _b_.ord(chars[i])
        if(t[cp] !== undefined){
            repl += t[cp]
        }else if(/\p{Cn}/u.test(chars[i])){
            var s = cp.toString(16)
            while(s.length < 4){
                s = '0' + s
            }
            repl += '\\u' + s
        }else if(cp < 0x20 || (cp >= 0x7f && cp < 0xa0)){
            cp = cp.toString(16)
            if(cp.length < 2){
                cp = '0' + cp
            }
            repl += '\\x' + cp
        }else if(cp >= 0x300 && cp <= 0x36F){
            repl += "\u200B" + chars[i] + ' '
        }else if(cp.toString(16) == 'feff'){
            repl += '\\ufeff'
        }else{
            repl += chars[i]
        }
    }
    var res = repl
    if(res.search('"') == -1 && res.search("'") == -1){
        return "'" + res + "'"
    }else if(_self.search('"') == -1){
        return '"' + res + '"'
    }
    var qesc = new RegExp("'", "g") // to escape single quote
    res = "'" + res.replace(qesc, "\\'") + "'"
    return res
}

str.__rmod__ = function(){
    var $ = $B.args('__rmod__', 2, {self: null, other: null},
                    ['self', 'other'], arguments, {}, null, null)
    if(! $B.$isinstance($.other, str)){
        return _b_.NotImplemented
    }
    return str.__mod__($.other, $.self)
}

str.__rmul__ = function(_self, other){
    _self = to_string(_self)
    if($B.$isinstance(other, _b_.int)){
        other = _b_.int.numerator(other)
        var res = ''
        while(other > 0){
            res += _self
            other--
        }
        return res
    }
    return _b_.NotImplemented
}

str.__setattr__ = function(_self, attr, value){
    if(typeof _self === "string"){
        if(str.hasOwnProperty(attr)){
            throw _b_.AttributeError.$factory("'str' object attribute '" +
                attr + "' is read-only")
        }else{
            throw _b_.AttributeError.$factory(
                "'str' object has no attribute '" + attr + "'")
        }
    }
    // str subclass : use __dict__
    _b_.dict.$setitem(_self.__dict__, attr, value)
    return _b_.None
}

str.__setitem__ = function(self, attr, value){
    throw _b_.TypeError.$factory(
        "'str' object does not support item assignment")
}

var combining = []
for(var cp = 0x300; cp <= 0x36F; cp++){
    combining.push(String.fromCharCode(cp))
}
var combining_re = new RegExp("(" + combining.join("|") + ")", "g")

str.__str__ = function(_self){
    _self = to_string(_self)
    var repl = '',
        chars = to_chars(_self)
    if(chars.length == _self.length){
        return _self.replace(combining_re, "\u200B$1")
    }
    for(var i = 0; i < chars.length; i++){
        var cp = _b_.ord(chars[i])
        if(cp >= 0x300 && cp <= 0x36F){
            repl += "\u200B" + chars[i]
        }else{
            repl += chars[i]
        }
    }
    return repl
}

var body = `var _b_ = __BRYTHON__.builtins
if(typeof other !== typeof _self){
    return _b_.NotImplemented
}else if(typeof _self == "string"){
    return _self > other
}else{
    return _self.$brython_value > other.$brython_value
}`

var comps = {">": "gt", ">=": "ge", "<": "lt", "<=": "le"}
for(var op in comps){
    str[`__${comps[op]}__`] = Function('_self', 'other',
        body.replace(/>/gm, op))
}

str.capitalize = function(){
    var $ = $B.args("capitalize", 1, {self}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    if(_self.length == 0){
        return ""
    }
    return _self.charAt(0).toUpperCase() + _self.substr(1).toLowerCase()
}

str.casefold = function(){
    var $ = $B.args("casefold", 1, {self}, ["self"],
            arguments, {}, null, null),
        res = "",
        char,
        cf,
        _self = to_string($.self),
        chars = to_chars(_self)
    for(var i = 0, len = chars.length; i < len; i++){
        char = chars[i]
        cf = $B.unicode_casefold[char]
        if(cf){
            cf.forEach(function(cp){
                res += String.fromCharCode(cp)
            })
        }else{
            res += char.toLowerCase()
        }
    }
    return res
}

str.center = function(){
    var $ = $B.args("center", 3, {self: null, width: null, fillchar: null},
            ["self", "width", "fillchar"],
            arguments, {fillchar:" "}, null, null),
        _self = to_string($.self)

    if($.width <= _self.length){
        return _self
    }

    var pad = parseInt(($.width - _self.length) / 2),
        res = $.fillchar.repeat(pad)
    res += _self + res
    if(res.length < $.width){
        res += $.fillchar
    }
    return res
}

str.count = function(){
    var $ = $B.args("count", 4, {self:null, sub:null, start:null, stop:null},
            ["self", "sub", "start", "stop"], arguments, {start:null, stop:null},
            null, null),
        _self,
        sub

    if(! $B.$isinstance($.sub, str)){
        throw _b_.TypeError.$factory("Can't convert '" + $B.class_name($.sub) +
            "' object to str implicitly")
    }
    [_self, sub] = to_string([$.self, $.sub])
    var substr = _self
    if($.start !== null){
        var _slice
        if($.stop !== null){
            _slice = _b_.slice.$factory($.start, $.stop)
        }else{
            _slice = _b_.slice.$factory($.start, _self.length)
        }
        substr = str.__getitem__.apply(null, [_self].concat(_slice))
    }else{
        if(_self.length + sub.length == 0){
            return 1
        }
    }
    if(sub.length == 0){
        if($.start == _self.length){
            return 1
        }else if(substr.length == 0){
            return 0
        }
        return substr.length + 1
    }
    var n = 0,
        pos = 0
    while(pos < substr.length){
        pos = substr.indexOf(sub, pos)
        if(pos >= 0){
            n++
            pos += sub.length
        }else{
            break
        }
    }
    return n
}

str.encode = function(){
    var $ = $B.args("encode", 3, {self: null, encoding: null, errors: null},
            ["self", "encoding", "errors"], arguments,
            {encoding: "utf-8", errors: "strict"}, null, null),
        _self = to_string($.self)
    if($.encoding == "rot13" || $.encoding == "rot_13"){
        // Special case : returns a string
        var res = ""
        for(var i = 0, len = _self.length; i < len ; i++){
            var char = _self.charAt(i)
            console.log('char', char)
            if(("a" <= char && char <= "m") || ("A" <= char && char <= "M")){
                res += String.fromCharCode(char.charCodeAt(0) + 13)
            }else if(("m" < char && char <= "z") ||
                    ("M" < char && char <= "Z")){
                res += String.fromCharCode(char.charCodeAt(0) - 13)
            }else{res += char}
        }
        return res
    }
    return _b_.bytes.__new__(_b_.bytes, $.self, $.encoding, $.errors)
}

str.endswith = function(){
    // Return True if the string ends with the specified suffix, otherwise
    // return False. suffix can also be a tuple of suffixes to look for.
    // With optional start, test beginning at that position. With optional
    // end, stop comparing at that position.
    var $ = $B.args("endswith", 4,
            {self:null, suffix:null, start:null, end:null},
            ["self", "suffix", "start", "end"],
            arguments, {start: 0, end: null}, null, null),
        _self

    normalize_start_end($);

    _self = to_string($.self)

    var suffixes = $.suffix
    if(! $B.$isinstance(suffixes, _b_.tuple)){
        suffixes = [suffixes]
    }

    var chars = to_chars(_self),
        s = chars.slice($.start, $.end)
    for(var i = 0, len = suffixes.length; i < len; i++){
        var suffix = suffixes[i]
        if(! $B.$isinstance(suffix, str)){
            throw _b_.TypeError.$factory(
                "endswith first arg must be str or a tuple of str, not int")
        }
        suffix = suffix.__class__ ? suffix.$brython_value : suffix
        if(suffix.length <= s.length &&
                s.slice(s.length - suffix.length).join('') == suffix){
            return true
        }
    }
    return false
}

str.expandtabs = function() {
    var $ = $B.args("expandtabs", 2, {self: null, tabsize: null},
            ["self", "tabsize"], arguments, {tabsize: 8}, null, null),
        _self = to_string($.self)
    var s = $B.$GetInt($.tabsize),
        col = 0,
        pos = 0,
        res = "",
        chars = to_chars(_self)
    if(s == 1){
        return _self.replace(/\t/g," ")
    }
    while(pos < chars.length){
        var car = chars[pos]
        switch(car){
            case "\t":
                while(col % s > 0){
                    res += " ";
                    col++
                }
                break
            case "\r":
            case "\n":
                res += car
                col = 0
                break
            default:
                res += car
                col++
                break
        }
        pos++
    }
    return res
}

str.find = function(){
    // Return the lowest index in the string where substring sub is found,
    // such that sub is contained in the slice s[start:end]. Optional
    // arguments start and end are interpreted as in slice notation.
    // Return -1 if sub is not found.
    var $ = $B.args("str.find", 4,
            {self: null, sub: null, start: null, end: null},
            ["self", "sub", "start", "end"],
            arguments, {start: 0, end: null}, null, null),
        _self,
        sub
    check_str($.sub)
    normalize_start_end($);

    [_self, sub] = to_string([$.self, $.sub]);

    var len = str.__len__(_self),
        sub_len = str.__len__(sub)

    if(sub_len == 0 && $.start == len){
        return len
    }
    if(len + sub_len == 0){
        return -1
    }
    // Use .indexOf(), not .search(), to avoid conversion to reg exp
    // Also use .slice() instead of .substring() because substring swaps
    // arguments if start > end...
    var js_start = pypos2jspos(_self, $.start),
        js_end = pypos2jspos(_self, $.end),
        ix = _self.slice(js_start, js_end).indexOf(sub)
    if(ix == -1){
        return -1
    }
    return jspos2pypos(_self, js_start + ix)
}

// Next function used by method .format()

$B.parse_format = function(fmt_string){

    // Parse a "format string", as described in the Python documentation
    // Return a format object. For the format string
    //     a.x[z]!r:...
    // the object has attributes :
    // - name : "a"
    // - name_ext : [".x", "[z]"]
    // - conv : r
    // - spec : rest of string after :

    var elts = fmt_string.split(":"),
        name,
        conv,
        spec,
        name_ext = []
    if(elts.length == 1){
        // No : in the string : it only contains a name
        name = fmt_string
    }else{
        // name is before the first ":"
        // spec (the format specification) is after
        name = elts[0]
        spec = elts.splice(1).join(":")
    }

    var elts = name.split("!")
    if(elts.length > 1){
        name = elts[0]
        conv = elts[1] // conversion flag
    }

    if(name !== undefined){
        // "name' may be a subscription or attribute
        // Put these "extensions" in the list "name_ext"
        function name_repl(match){
            name_ext.push(match)
            return ""
        }
        var name_ext_re = /\.[_a-zA-Z][_a-zA-Z0-9]*|\[[_a-zA-Z][_a-zA-Z0-9]*\]|\[[0-9]+\]/g
        name = name.replace(name_ext_re, name_repl)
    }

    return {name: name, name_ext: name_ext,
        conv: conv, spec: spec || "", string: fmt_string}
}

$B.split_format = function(s){
    // Parse self to detect formatting instructions
    // Create a list "parts" made of sections of the string :
    // - elements of even rank are literal text
    // - elements of odd rank are "format objects", built from the
    //   format strings in self (of the form {...})
    var pos = 0,
        _len = s.length,
        car,
        text = "",
        parts = [],
        rank = 0
    while(pos < _len){
        car = s.charAt(pos)
        if(car == "{" && s.charAt(pos + 1) == "{"){
            // replace {{ by literal {
            text += "{"
            pos += 2
        }else if(car == "}" && s.charAt(pos + 1) == "}"){
            // replace }} by literal }
            text += "}"
            pos += 2
        }else if(car == "{"){
            // Start of a format string

            // Store current literal text
            parts.push(text)

            // Search the end of the format string, ie the } closing the
            // opening {. Since the string can contain other pairs {} for
            // nested formatting, an integer nb is incremented for each { and
            // decremented for each } ; the end of the format string is
            // reached when nb == 0
            var end = pos + 1,
                nb = 1
            while(end < _len){
                if(s.charAt(end) == "{"){nb++; end++}
                else if(s.charAt(end) == "}"){
                    nb--; end++
                    if(nb == 0){
                        // End of format string
                        var fmt_string = s.substring(pos + 1, end - 1)

                        // Create a format object, by function parse_format
                        var fmt_obj = $B.parse_format(fmt_string)
                        fmt_obj.raw_name = fmt_obj.name
                        fmt_obj.raw_spec = fmt_obj.spec

                        // If no name is explicitely provided, use the rank
                        if(!fmt_obj.name){
                            fmt_obj.name = rank + ""
                            rank++
                        }

                        if(fmt_obj.spec !== undefined){
                            // "spec" may contain "nested replacement fields"
                            // Replace empty fields by the rank in positional
                            // arguments
                            function replace_nested(name, key){
                                if(key == ""){
                                    // Use implicit rank
                                    return "{" + rank++ + "}"
                                }
                                return "{" + key + "}"
                            }
                            fmt_obj.spec = fmt_obj.spec.replace(/\{(.*?)\}/g,
                                replace_nested)
                        }

                        // Store format object in list "parts"
                        parts.push(fmt_obj)
                        text = ""
                        break
                    }
                }else{end++}
            }
            if(nb > 0){
                throw _b_.ValueError.$factory("wrong format " + s)
            }
            pos = end
        }else{
            text += car
            pos++
        }
    }
    if(text){
        parts.push(text)
    }
    return parts
}

str.format = function(_self) {
    // Special management of keyword arguments if str.format is called by
    // str.format_map(mapping) : the argument "mapping" might not be a
    // dictionary
    var last_arg = $B.last(arguments)
    if(last_arg.$nat == "mapping"){
        var mapping = last_arg.mapping,
            getitem = $B.$getattr(mapping, "__getitem__")
        // Get the rest of the arguments
        var args = []
        for(var i = 0, len = arguments.length - 1; i < len; i++){
            args.push(arguments[i])
        }
        var $ = $B.args("format", 1, {self: null}, ["self"],
                args, {}, "$args", null)
    }else{
        var $ = $B.args("format", 1, {self: null}, ["self"],
                arguments, {}, "$args", "$kw"),
            mapping = $.$kw, // dictionary
            getitem = function(key){
                return _b_.dict.$getitem(mapping, key)
            }
    }
    var _self = to_string($.self),
        parts = $B.split_format(_self)

    // Apply formatting to the values passed to format()
    var res = "",
        fmt

    for(var i = 0; i < parts.length; i++){
        // Literal text is added unchanged
        if(typeof parts[i] == "string"){
            res += parts[i];
            continue
        }

        // Format objects
        fmt = parts[i]

        if(fmt.spec !== undefined){
            // "spec" may contain "nested replacement fields"
            // In this case, evaluate them using the positional
            // or keyword arguments passed to format()
            function replace_nested(name, key){
                if(/\d+/.exec(key)){
                    // If key is numeric, search in positional
                    // arguments
                    return _b_.tuple.__getitem__($.$args,
                        parseInt(key))
                }else{
                    // Else try in keyword arguments
                    return _b_.dict.__getitem__($.$kw, key)
                }
            }
            fmt.spec = fmt.spec.replace(/\{(.*?)\}/g,
                replace_nested)
        }
        if(fmt.name.charAt(0).search(/\d/) > -1){
            // Numerical reference : use positional arguments
            var pos = parseInt(fmt.name),
                value = _b_.tuple.__getitem__($.$args, pos)
        }else{
            // Use keyword arguments
            var value = getitem(fmt.name)
        }
        // If name has extensions (attributes or subscriptions)
        for(var j = 0; j < fmt.name_ext.length; j++){
            var ext = fmt.name_ext[j]
            if(ext.charAt(0) == "."){
                // Attribute
                value = $B.$getattr(value, ext.substr(1))
            }else{
                // Subscription
                var key = ext.substr(1, ext.length - 2)
                // An index made of digits is transformed into an integer
                if(key.charAt(0).search(/\d/) > -1){key = parseInt(key)}
                value = $B.$getattr(value, "__getitem__")(key)
            }
        }

        // If the conversion flag is set, first call a function to convert
        // the value
        if(fmt.conv == "a"){value = _b_.ascii(value)}
        else if(fmt.conv == "r"){value = _b_.repr(value)}
        else if(fmt.conv == "s"){value = _b_.str.$factory(value)}

        // Call attribute __format__ to perform the actual formatting
        if(value.$is_class || value.$factory){
            // For classes, don't use the class __format__ method
            res += value.__class__.__format__(value, fmt.spec)
        }else{
            res += $B.$getattr(value, "__format__")(fmt.spec)
        }
    }
    return res
}

str.format_map = function(){
    var $ = $B.args("format_map", 2, {self: null, mapping: null},
            ['self', 'mapping'], arguments, {}, null, null),
        _self = to_string($.self)
    return str.format(_self, {$nat: 'mapping', mapping: $.mapping})
}

str.index = function(self){
    // Like find(), but raise ValueError when the substring is not found.
    var res = str.find.apply(null, arguments)
    if(res === -1){
        throw _b_.ValueError.$factory("substring not found")
    }
    return res
}

str.isascii = function(){
    /* Return true if the string is empty or all characters in the string are
    ASCII, false otherwise. ASCII characters have code points in the range
    U+0000-U+007F. */
    var $ = $B.args("isascii", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    for(var i = 0, len = _self.length; i < len; i++){
        if(_self.charCodeAt(i) > 127){
            return false
        }
    }
    return true
}

str.isalnum = function(){
    /* Return true if all characters in the string are alphanumeric and there
    is at least one character, false otherwise. A character c is alphanumeric
    if one of the following returns True: c.isalpha(), c.isdecimal(),
    c.isdigit(), or c.isnumeric(). */
    var $ = $B.args("isalnum", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        for(var cat of ['Ll', 'Lu', 'Lm', 'Lt', 'Lo', 'Nd', 'digits', 'numeric']){
            if(! $B.in_unicode_category(cat, cp)){
                return false
            }
        }
    }
    return true
}

str.isalpha = function(){
    /* Return true if all characters in the string are alphabetic and there is
    at least one character, false otherwise. Alphabetic characters are those
    characters defined in the Unicode character database as "Letter", i.e.,
    those with general category property being one of "Lm", "Lt", "Lu", "Ll",
    or "Lo". */
    var $ = $B.args("isalpha", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        for(var cat of ['Ll', 'Lu', 'Lm', 'Lt', 'Lo']){
            if(! $B.in_unicode_category(cat, cp)){
                return false
            }
        }
    }
    return true
}

str.isdecimal = function(){
    /* Return true if all characters in the string are decimal characters and
    there is at least one character, false otherwise. Decimal characters are
    those that can be used to form numbers in base 10, e.g. U+0660,
    ARABIC-INDIC DIGIT ZERO. Formally a decimal character is a character in
    the Unicode General Category "Nd". */
    var $ = $B.args("isdecimal", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        if(! $B.in_unicode_category('Nd', cp)){
            return false
        }
    }
    return _self.length > 0
}

str.isdigit = function(){
    /* Return true if all characters in the string are digits and there is at
    least one character, false otherwise. */
    var $ = $B.args("isdigit", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        if(/\p{Nd}/u.test(char)){
            continue
        }
        // might be in unicode category 'No'
        cp = _b_.ord(char)
        if(! $B.in_unicode_category('No_digits', cp)){
            return false
        }
    }
    return _self.length > 0
}

str.isidentifier = function(){
    /* Return true if the string is a valid identifier according to the
    language definition. */
    var $ = $B.args("isidentifier", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    if(_self.length == 0){
        return false
    }
    var chars = to_chars(_self)
    if(! $B.is_XID_Start(_b_.ord(chars[0]))){
        return false
    }else{
        for(var char of chars){
            var cp = _b_.ord(char)
            if(! $B.is_XID_Continue(cp)){
                return false
            }
        }
    }
    return true
}

str.islower = function(){
    /* Return true if all cased characters 4 in the string are lowercase and
    there is at least one cased character, false otherwise. */
    var $ = $B.args("islower", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        has_cased = false,
        cp,
        _self = to_string($.self)

    for(var char of _self){
        cp = _b_.ord(char)
        if($B.in_unicode_category('Ll', cp)){
            has_cased = true
            continue
        }else if($B.in_unicode_category('Lu', cp) ||
                 $B.in_unicode_category('Lt', cp)){
            return false
        }
    }
    return has_cased
}

const numeric_re = /\p{Nd}|\p{Nl}|\p{No}/u

str.isnumeric = function(){
    /* Return true if all characters in the string are numeric characters, and
    there is at least one character, false otherwise. Numeric characters
    include digit characters, and all characters that have the Unicode numeric
    value property, e.g. U+2155, VULGAR FRACTION ONE FIFTH. Formally, numeric
    characters are those with the property value Numeric_Type=Digit,
    Numeric_Type=Decimal or Numeric_Type=Numeric.*/
    var $ = $B.args("isnumeric", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    for(var char of _self){
        if((! numeric_re.test(char)) &&
               ! $B.in_unicode_category('Lo_numeric', _b_.ord(char))){
            return false
        }
    }
    return _self.length > 0
}

var unprintable_re = /\p{Cc}|\p{Cf}|\p{Co}|\p{Cs}|\p{Zl}|\p{Zp}|\p{Zs}/u

str.isprintable = function(){
    /* Return true if all characters in the string are printable or the string
    is empty, false otherwise. Nonprintable characters are those characters
    defined in the Unicode character database as "Other" or "Separator",
    excepting the ASCII space (0x20) which is considered printable. */

    var $ = $B.args("isprintable", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    for(var char of _self){
        if(char == ' '){
            continue
        }
        if(unprintable_re.test(char)){
            return false
        }
    }
    return true
}

str.isspace = function(self){
    /* Return true if there are only whitespace characters in the string and
    there is at least one character, false otherwise.

    A character is whitespace if in the Unicode character database, either its
    general category is Zs ("Separator, space"), or its bidirectional class is
    one of WS, B, or S.*/
    var $ = $B.args("isspace", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        if(! $B.in_unicode_category('Zs', cp) &&
                $B.unicode_bidi_whitespace.indexOf(cp) == -1){
            return false
        }
    }
    return _self.length > 0
}

str.istitle = function(self){
    /* Return true if the string is a titlecased string and there is at least
    one character, for example uppercase characters may only follow uncased
    characters and lowercase characters only cased ones. Return false
    otherwise. */
    var $ = $B.args("istitle", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    return _self.length > 0 && str.title(_self) == _self
}

str.isupper = function(self){
    /* Return true if all cased characters 4 in the string are lowercase and
    there is at least one cased character, false otherwise. */
    var $ = $B.args("islower", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        is_upper = false,
        cp,
        _self = to_string(self)

    for(var char of _self){
        cp = _b_.ord(char)
        if($B.in_unicode_category('Lu', cp)){
            is_upper = true
            continue
        }else if($B.in_unicode_category('Ll', cp) ||
                 $B.in_unicode_category('Lt', cp)){
            return false
        }
    }
    return is_upper
}


str.join = function(){
    var $ = $B.args("join", 2, {self: null, iterable: null},
            ["self", "iterable"], arguments, {}, null, null),
        _self = to_string($.self)

    var iterable = _b_.iter($.iterable),
        res = [],
        count = 0
    while(1){
        try{
            var obj2 = _b_.next(iterable)
            if(! $B.$isinstance(obj2, str)){
                throw _b_.TypeError.$factory("sequence item " + count +
                    ": expected str instance, " + $B.class_name(obj2) +
                    " found")
            }
            res.push(obj2)
        }catch(err){
            if($B.$isinstance(err, _b_.StopIteration)){
                break
            }
            else{throw err}
        }
    }
    return res.join(_self)
}

str.ljust = function(self) {
    var $ = $B.args("ljust", 3, {self: null, width: null, fillchar:null},
            ["self", "width", "fillchar"],
            arguments, {fillchar: " "}, null, null),
        _self = to_string($.self),
        len = str.__len__(_self);

    if($.width <= len){
        return _self
    }
    return _self + $.fillchar.repeat($.width - len)
}

str.lower = function(self){
    var $ = $B.args("lower", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    return _self.toLowerCase()
}

str.lstrip = function(self, x){
    var $ = $B.args("lstrip", 2, {self: null, chars: null}, ["self", "chars"],
            arguments, {chars:_b_.None}, null, null),
        _self = $.self,
        chars = $.chars
    if(chars === _b_.None){
        return self.trimStart()
    }
    [_self, chars] = to_string([_self, chars])
    while(_self.length > 0){
        var flag = false
        for(var char of chars){
            if(_self.startsWith(char)){
                _self = _self.substr(char.length)
                flag = true
                break
            }
        }
        if(! flag){
            return $.self.surrogates ? $B.String(_self) : _self
        }
    }
    return ''
}

// note, maketrans should be a static function.
str.maketrans = function() {
    var $ = $B.args("maketrans", 3, {x: null, y: null, z: null},
            ["x", "y", "z"], arguments, {y: null, z: null}, null, null)

    var _t = $B.empty_dict()

    if($.y === null && $.z === null){
        // If there is only one argument, it must be a dictionary mapping
        // Unicode ordinals (integers) or characters (strings of length 1) to
        // Unicode ordinals, strings (of arbitrary lengths) or None. Character
        // keys will then be converted to ordinals.
        if(! $B.$isinstance($.x, _b_.dict)){
            throw _b_.TypeError.$factory(
                "maketrans only argument must be a dict")
        }
        var items = _b_.list.$factory(_b_.dict.items($.x))
        for(var i = 0, len = items.length; i < len; i++){
            var k = items[i][0],
                v = items[i][1]
            if(! $B.$isinstance(k, _b_.int)){
                if($B.$isinstance(k, _b_.str) && k.length == 1){
                    k = _b_.ord(k)
                }else{throw _b_.TypeError.$factory("dictionary key " + k +
                    " is not int or 1-char string")}
            }
            if(v !== _b_.None && ! $B.$isinstance(v, [_b_.int, _b_.str])){
                throw _b_.TypeError.$factory("dictionary value " + v +
                    " is not None, integer or string")
            }
            _b_.dict.$setitem(_t, k, v)
        }
        return _t
    }else{
        // If there are two arguments, they must be strings of equal length,
        // and in the resulting dictionary, each character in x will be mapped
        // to the character at the same position in y
        if(! ($B.$isinstance($.x, _b_.str) && $B.$isinstance($.y, _b_.str))){
            throw _b_.TypeError.$factory("maketrans arguments must be strings")
        }else if($.x.length !== $.y.length){
            throw _b_.TypeError.$factory(
                "maketrans arguments must be strings or same length")
        }else{
            var toNone = {}
            if($.z !== null){
                // If there is a third argument, it must be a string, whose
                // characters will be mapped to None in the result
                if(! $B.$isinstance($.z, _b_.str)){
                    throw _b_.TypeError.$factory(
                        "maketrans third argument must be a string")
                }
                for(var i = 0, len = $.z.length; i < len; i++){
                    toNone[_b_.ord($.z.charAt(i))] = true
                }
            }
            for(var i = 0, len = $.x.length; i < len; i++){
                var key = _b_.ord($.x.charAt(i)),
                    value = $.y.charCodeAt(i)
                _b_.dict.$setitem(_t, key, value)
            }
            for(var k in toNone){
                _b_.dict.$setitem(_t, parseInt(k), _b_.None)
            }
            return _t
        }
    }
}

str.maketrans.$type = "staticmethod"

str.partition = function() {
    var $ = $B.args("partition", 2, {self: null, sep: null}, ["self", "sep"],
            arguments, {}, null, null),
        _self,
        sep
    if($.sep == ""){
        throw _b_.ValueError.$factory("empty separator")
    }
    check_str($.sep);
    [_self, sep] = to_string([$.self, $.sep])
    var chars = to_chars(_self),
        i = _self.indexOf(sep)
    if(i == -1){
        return _b_.tuple.$factory([_self, "", ""])
    }
    return _b_.tuple.$factory([chars.slice(0, i).join(''), sep,
        chars.slice(i + sep.length).join('')])
}

str.removeprefix = function(){
    var $ = $B.args("removeprefix", 2, {self: null, prefix: null},
            ["self", "prefix"], arguments, {}, null, null),
        _self
    if(!$B.$isinstance($.prefix, str)){
        throw _b_.ValueError.$factory("prefix should be str, not " +
            `'${$B.class_name($.prefix)}'`)
    }
    [_self, prefix] = to_string([$.self, $.prefix])
    if(str.startswith(_self, prefix)){
        return _self.substr(prefix.length)
    }
    return _self.substr(0)
}

str.removesuffix = function(){
    var $ = $B.args("removesuffix", 2, {self: null, suffix: null},
                ["self", "suffix"], arguments, {}, null, null),
        _self
    if(!$B.$isinstance($.suffix, str)){
        throw _b_.ValueError.$factory("suffix should be str, not " +
            `'${$B.class_name($.prefix)}'`)
    }
    [_self, suffix] = to_string([$.self, $.suffix])
    if(suffix.length > 0 && str.endswith(_self, suffix)){
        return _self.substr(0, _self.length - suffix.length)
    }
    return _self.substr(0)
}

function $re_escape(str){
    var specials = "[.*+?|()$^"
    for(var i = 0, len = specials.length; i < len; i++){
        var re = new RegExp("\\" + specials.charAt(i), "g")
        str = str.replace(re, "\\" + specials.charAt(i))
    }
    return str
}

str.replace = function(self, old, _new, count) {
    // Replaces occurrences of 'old' by '_new'. Count references
    // the number of times to replace. In CPython, negative or undefined
    // values of count means replace all.
    var $ = $B.args("replace", 4,
            {self: null, old: null, new: null, count: null},
            ["self", "old", "new", "count"],
            arguments, {count: -1}, null, null),
        count = $.count,
        _self = $.self,
        old = $.old,
        _new = $.new
    // Validate type of old
    check_str(old, "replace() argument 1 ")
    check_str(_new, "replace() argument 2 ")
    // Validate instance type of 'count'
    if(! $B.$isinstance(count, [_b_.int, _b_.float])){
        throw _b_.TypeError.$factory("'" + $B.class_name(count) +
            "' object cannot be interpreted as an integer")
    }else if($B.$isinstance(count, _b_.float)){
        throw _b_.TypeError.$factory("integer argument expected, got float")
    }
    if(count == 0){
        return self
    }
    if(count.__class__ == $B.long_int){
        count = parseInt(count.value)
    }
    [old, _new] = to_string([old, _new])
    if(old == ""){
        if(_new == ""){
            return _self
        }
        if(_self == ""){
            return _new
        }
        var elts = _self.split("")
        if(count > -1 && elts.length >= count){
            var rest = elts.slice(count).join("")
            return _new + elts.slice(0, count).join(_new) + rest
        }else{
            return _new + elts.join(_new) + _new
        }
    }else{
        var elts = str.split(_self, old, count)
    }

    var res = _self,
        pos = -1
    if(old.length == 0){
        var res = _new
        for(var i = 0; i < elts.length; i++){
            res += elts[i] + _new
        }
        return res + rest
    }

    if(count < 0){
        count = res.length
    }
    while(count > 0){
        pos = res.indexOf(old, pos)
        if(pos < 0){
            break
        }
        res = res.substr(0, pos) + _new + res.substr(pos + old.length)
        pos = pos + _new.length
        count--
    }
    return res
}

str.rfind = function(self, substr){
    // Return the highest index in the string where substring sub is found,
    // such that sub is contained within s[start:end]. Optional arguments
    // start and end are interpreted as in slice notation. Return -1 on failure.
    var $ = $B.args("rfind", 4,
            {self: null, sub: null, start: null, end: null},
            ["self", "sub", "start", "end"],
            arguments, {start: 0, end: null}, null, null),
        _self,
        sub

    normalize_start_end($)
    check_str($.sub);

    [_self, sub] = to_string([$.self, $.sub])

    var len = str.__len__(_self),
        sub_len = str.__len__(sub)

    if(sub_len == 0){
        if($.js_start > len){
            return -1
        }else{
            return str.__len__(_self)
        }
    }

    // Use .indexOf(), not .search(), to avoid conversion to reg exp
    var js_start = pypos2jspos(_self, $.start),
        js_end = pypos2jspos(_self, $.end),
        ix = _self.substring(js_start, js_end).lastIndexOf(sub)
    if(ix == -1){
        return -1
    }
    return jspos2pypos(_self, js_start + ix) - $.start
}

str.rindex = function(){
    // Like rfind() but raises ValueError when the substring sub is not found
    var res = str.rfind.apply(null, arguments)
    if(res == -1){
        throw _b_.ValueError.$factory("substring not found")
    }
    return res
}

str.rjust = function(self) {
    var $ = $B.args("rjust",3,
            {self: null, width: null, fillchar: null},
            ["self", "width", "fillchar"],
            arguments, {fillchar: " "}, null, null),
        _self = to_string($.self)
    var len = str.__len__(_self)
    if($.width <= len){
        return _self
    }
    return $B.String($.fillchar.repeat($.width - len) + _self)
}

str.rpartition = function(self,sep) {
    var $ = $B.args("rpartition", 2, {self: null, sep: null}, ["self", "sep"],
            arguments, {}, null, null),
        _self
    check_str($.sep);
    [_self, sep] = [$.self, $.sep]
    _self = reverse(_self),
    sep = reverse(sep)
    var items = str.partition(_self, sep).reverse()
    for(var i = 0; i < items.length; i++){
        items[i] = items[i].split("").reverse().join("")
    }
    return items
}

str.rsplit = function(self) {
    var $ = $B.args("rsplit", 3, {self: null, sep: null, maxsplit: null},
        ["self", "sep", "maxsplit"], arguments,
        {sep: _b_.None, maxsplit: -1}, null, null),
        sep = $.sep,
        _self;

    [_self, sep] = to_string([$.self, $.sep])

    // Use split on the reverse of the string and of separator
    var rev_str = reverse(_self),
        rev_sep = sep === _b_.None ? sep : reverse(sep),
        rev_res = str.split(rev_str, rev_sep, $.maxsplit)

    // Reverse the list, then each string inside the list
    rev_res.reverse()
    for(var i = 0; i < rev_res.length; i++){
        rev_res[i] = reverse(rev_res[i])
    }
    return rev_res
}

str.rstrip = function(){
    var $ = $B.args("rstrip", 2, {self: null, chars: null}, ["self", "chars"],
            arguments, {chars: _b_.None}, null, null),
        chars = $.chars,
        _self = to_string($.self)
    if(chars === _b_.None){
        return _self.trimEnd()
    }
    chars = to_string(chars)
    while(_self.length > 0){
        var flag = false
        for(var char of chars){
            if(_self.endsWith(char)){
                _self = _self.substr(0, _self.length - char.length)
                flag = true
                break
            }
        }
        if(! flag){
            return _self.surrogates ? $B.String(_self) : _self
        }
    }
    return ''
}

str.split = function(){
    var $ = $B.args("split", 3, {self: null, sep: null, maxsplit: null},
        ["self", "sep", "maxsplit"], arguments,
        {sep: _b_.None, maxsplit: -1}, null, null),
        maxsplit = $.maxsplit,
        sep = $.sep,
        pos = 0,
        _self = to_string($.self)
    if(maxsplit.__class__ === $B.long_int){
        maxsplit = parseInt(maxsplit.value)
    }
    if(sep == ""){
        throw _b_.ValueError.$factory("empty separator")
    }

    if(sep === _b_.None){
        var res = []
        while(pos < _self.length && _self.charAt(pos).search(/\s/) > -1){
            pos++
        }
        if(pos === _self.length - 1){
            return [_self]
        }
        var name = ""
        while(1){
            if(_self.charAt(pos).search(/\s/) == -1){
                if(name == ""){
                    name = _self.charAt(pos)
                }else{
                    name += _self.charAt(pos)
                }
            }else{
                if(name !== ""){
                    res.push(name)
                    if(maxsplit !== -1 && res.length == maxsplit + 1){
                        res.pop()
                        res.push(name + _self.substr(pos))
                        return res
                    }
                    name = ""
                }
            }
            pos++
            if(pos > _self.length - 1){
                if(name){
                    res.push(name)
                }
                break
            }
        }
        return res.map($B.String)
    }else{
        sep = to_string(sep)
        var res = [],
            s = "",
            seplen = sep.length
        if(maxsplit == 0){
            return [$.self]
        }
        while(pos < _self.length){
            if(_self.substr(pos, seplen) == sep){
                res.push(s)
                pos += seplen
                if(maxsplit > -1 && res.length >= maxsplit){
                    res.push(_self.substr(pos))
                    return res.map($B.String)
                }
                s = ""
            }else{
                s += _self.charAt(pos)
                pos++
            }
        }
        res.push(s)
        return res.map($B.String)
    }
}

str.splitlines = function(self) {
    var $ = $B.args('splitlines', 2, {self: null, keepends: null},
                    ['self','keepends'], arguments, {keepends: false},
                    null, null)
    if(!$B.$isinstance($.keepends, [_b_.bool, _b_.int])){
        throw _b_.TypeError('integer argument expected, got '+
            $B.get_class($.keepends).__name)
    }
    var keepends = _b_.int.$factory($.keepends),
        res = [],
        start = 0,
        pos = 0,
        _self = to_string($.self)
    if(! _self.length){
        return res
    }
    while(pos < _self.length){
        if(_self.substr(pos, 2) == '\r\n'){
            res.push(_self.slice(start, keepends ? pos + 2 : pos))
            start = pos = pos+2
        }else if(_self[pos] == '\r' || _self[pos] == '\n'){
            res.push(_self.slice(start, keepends ? pos+1 : pos))
            start = pos = pos+1
        }else{
            pos++
        }
    }
    if(start < _self.length){
        res.push(_self.slice(start))
    }
    return res.map($B.String)
}

str.startswith = function(){
    // Return True if string starts with the prefix, otherwise return False.
    // prefix can also be a tuple of prefixes to look for. With optional
    // start, test string beginning at that position. With optional end,
    // stop comparing string at that position.
    var $ = $B.args("startswith", 4,
            {self: null, prefix: null, start: null, end: null},
            ["self", "prefix", "start", "end"],
            arguments, {start: 0, end: null}, null, null),
        _self

    normalize_start_end($)

    var prefixes = $.prefix
    if(! $B.$isinstance(prefixes, _b_.tuple)){
        prefixes = [prefixes]
    }
    _self = to_string($.self)
    prefixes = to_string(prefixes)
    var s = _self.substring($.start, $.end)
    for(var prefix of prefixes){
        if(! $B.$isinstance(prefix, str)){
            throw _b_.TypeError.$factory("endswith first arg must be str " +
                "or a tuple of str, not int")
        }
        if(s.substr(0, prefix.length) == prefix){
            return true
        }
    }
    return false
}

str.strip = function(){
    var $ = $B.args("strip", 2, {self: null, chars: null}, ["self", "chars"],
            arguments, {chars: _b_.None}, null, null)
    if($.chars === _b_.None){
        return $.self.trim()
    }
    return str.rstrip(str.lstrip($.self, $.chars), $.chars)
}

str.swapcase = function(self){
    var $ = $B.args("swapcase", 1, {self}, ["self"],
            arguments, {}, null, null),
        res = "",
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        if($B.in_unicode_category('Ll', cp)){
            res += char.toUpperCase()
        }else if($B.in_unicode_category('Lu', cp)){
            res += char.toLowerCase()
        }else{
            res += char
        }
    }
    return res
}

str.title = function(self){
    var $ = $B.args("title", 1, {self}, ["self"],
            arguments, {}, null, null),
        state,
        cp,
        res = "",
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        if($B.in_unicode_category('Ll', cp)){
            if(! state){
                res += char.toUpperCase()
                state = "word"
            }else{
                res += char
            }
        }else if($B.in_unicode_category('Lu', cp) ||
                 $B.in_unicode_category('Lt', cp)){
            res += state ? char.toLowerCase() : char
            state = "word"
        }else{
            state = null
            res += char
        }
    }
    return res
}

str.translate = function(){
    var $ = $B.args('translate', 2, {self: null, table: null},
                ['self', 'table'], arguments, {}, null, null),
        table = $.table,
        res = [],
        getitem = $B.$getattr(table, "__getitem__"),
        cp,
        _self = to_string($.self)
    for(var char of _self){
        cp = _b_.ord(char)
        try{
            var repl = getitem(cp)
            if(repl !== _b_.None){
                if(typeof repl == "string"){
                    res.push(repl)
                }else if(typeof repl == "number"){
                    res.push(String.fromCharCode(repl))
                }
            }
        }catch(err){
            res.push(char)
        }
    }
    return res.join("")
}

str.upper = function(self){
    var $ = $B.args("upper", 1, {self: null}, ["self"],
            arguments, {}, null, null),
        _self = to_string($.self)
    return _self.toUpperCase()
}

str.zfill = function(self, width){
    var $ = $B.args("zfill", 2, {self: null, width: null},
            ["self", "width"], arguments, {}, null, null),
        _self = to_string($.self)
    var len = str.__len__(_self)
    if($.width <= len){
        return _self
    }
    switch(_self.charAt(0)){
        case "+":
        case "-":
            return _self.charAt(0) +
                "0".repeat($.width - len) + _self.substr(1)
        default:
            return "0".repeat($.width - len) + _self
    }
}

str.$factory = function(arg, encoding, errors){
    if(arguments.length == 0){
        return ""
    }
    if(arg === undefined){
        return $B.UndefinedType.__str__()
    }else if(arg === null){
        return '<Javascript null>'
    }
    if(encoding !== undefined){
        // Arguments may be passed as keywords (cf. issue #1060)
        var $ = $B.args("str", 3, {arg: null, encoding: null, errors: null},
                ["arg", "encoding", "errors"], arguments,
                {encoding: "utf-8", errors: "strict"}, null, null),
            encoding = $.encoding,
            errors = $.errors
    }
    if(typeof arg == "string" || arg instanceof String){
        return arg.toString()
    }else if(typeof arg == "number" && Number.isInteger(arg)){
        return arg.toString()
    }

    try{
        if(arg.__class__ && arg.__class__ === _b_.bytes &&
                encoding !== undefined){
            // str(bytes, encoding, errors) is equal to
            // bytes.decode(encoding, errors)
            return _b_.bytes.decode(arg, $.encoding, $.errors)
        }
        // Implicit invocation of __str__ uses method __str__ on the class,
        // even if arg has an attribute __str__
        var klass = arg.__class__ || $B.get_class(arg)
        if(klass === undefined){
            return $B.JSObj.__str__($B.JSObj.$factory(arg))
        }
        var method = $B.$getattr(klass, "__str__", null)
        if(method === null){
            method = $B.$getattr(klass, '__repr__')
        }
    }catch(err){
        console.log("no __str__ for", arg)
        console.log("err ", err)
        if($B.get_option('debug') > 1){
            console.log(err)
        }
        console.log("Warning - no method __str__ or __repr__, " +
            "default to toString", arg)
        throw err
    }
    var res = $B.$call(method)(arg)
    if(typeof res == "string" || $B.$isinstance(res, str)){
        return res
    }
    throw _b_.TypeError.$factory("__str__ returned non-string " +
        `(type ${$B.class_name(res)})`)
}


$B.set_func_names(str, "builtins")

_b_.str = str

// Function to parse the 2nd argument of format()
$B.parse_format_spec = function(spec, obj){
    if(spec == ""){
        this.empty = true
    }else{
        var pos = 0,
            aligns = "<>=^",
            digits = "0123456789",
            types = "bcdeEfFgGnosxX%",
            align_pos = aligns.indexOf(spec.charAt(0))
        if(align_pos != -1){
            if(spec.charAt(1) && aligns.indexOf(spec.charAt(1)) != -1){
                // If the second char is also an alignment specifier, the
                // first char is the fill value
                this.fill = spec.charAt(0)
                this.align = spec.charAt(1)
                pos = 2
            }else{
                // The first character defines alignment : fill defaults to ' '
                this.align = aligns[align_pos]
                this.fill = " "
                pos++
            }
        }else{
            align_pos = aligns.indexOf(spec.charAt(1))
            if(spec.charAt(1) && align_pos != -1){
                // The second character defines alignment : fill is the first one
                this.align = aligns[align_pos]
                this.fill = spec.charAt(0)
                pos = 2
            }
        }
        var car = spec.charAt(pos)
        if(car == "+" || car == "-" || car == " "){
            this.sign = car
            pos++
            car = spec.charAt(pos)
        }
        if(car == "z"){
            this.z = true
            pos++
            car = spec.charAt(pos)
        }
        if(car == "#"){
            this.alternate = true;
            pos++;
            car = spec.charAt(pos)
        }
        if(car == "0"){
            // sign-aware : equivalent to fill = 0 and align == "="
            this.fill = "0"
            if(align_pos == -1){
                this.align = "="
            }
            pos++
            car = spec.charAt(pos)
        }
        while(car && digits.indexOf(car) > -1){
            if(this.width === undefined){
                this.width = car
            }else{
                this.width += car
            }
            pos++
            car = spec.charAt(pos)
        }
        if(this.width !== undefined){
            this.width = parseInt(this.width)
        }
        if(this.width === undefined && car == "{"){
            // Width is determined by a parameter
            var end_param_pos = spec.substr(pos).search("}")
            this.width = spec.substring(pos, end_param_pos)
            pos += end_param_pos + 1
        }
        if(car == "," || car == "_"){
            this.comma = true
            this.grouping_option = car
            pos++
            car = spec.charAt(pos)
            if(car == "," || car == "_"){
                if(car == this.grouping_option){
                    throw _b_.ValueError.$factory(
                        `Cannot specify '${car}' with '${car}'.`)
                }else{
                    throw _b_.ValueError.$factory(
                        "Cannot specify both ',' and '_'.")
                }
            }
        }
        if(car == "."){
            if(digits.indexOf(spec.charAt(pos + 1)) == -1){
                throw _b_.ValueError.$factory(
                    "Missing precision in format spec")
            }
            this.precision = spec.charAt(pos + 1)
            pos += 2
            car = spec.charAt(pos)
            while(car && digits.indexOf(car) > -1){
                this.precision += car
                pos++
                car = spec.charAt(pos)
            }
            this.precision = parseInt(this.precision)
        }
        if(car && types.indexOf(car) > -1){
            this.type = car
            pos++
            car = spec.charAt(pos)
        }
        if(pos !== spec.length){
            var err_msg = `Invalid format specifier '${spec}'`
            if(obj){
                err_msg += ` for object of type '${$B.class_name(obj)}'`
            }
            throw _b_.ValueError.$factory(err_msg)
        }
    }

    this.toString = function(){
        return (this.fill === undefined ? "" : _b_.str.$factory(this.fill)) +
            (this.align || "") +
            (this.sign || "") +
            (this.alternate ? "#" : "") +
            (this.sign_aware ? "0" : "") +
            (this.width || "") +
            (this.comma ? "," : "") +
            (this.precision ? "." + this.precision : "") +
            (this.type || "")
    }
}

$B.format_width = function(s, fmt){
    if(fmt.width && s.length < fmt.width){
        var fill = fmt.fill || " ",
            align = fmt.align || "<",
            missing = fmt.width - s.length
        switch(align){
            case "<":
                return s + fill.repeat(missing)
            case ">":
                return fill.repeat(missing) + s
            case "=":
                if("+-".indexOf(s.charAt(0)) > -1){
                    return s.charAt(0) + fill.repeat(missing) + s.substr(1)
                }else{
                    return fill.repeat(missing) + s
                }
            case "^":
                var left = parseInt(missing / 2)
                return fill.repeat(left) + s + fill.repeat(missing - left)
        }
    }
    return s
}

function fstring_expression(start){
    this.type = "expression"
    this.start = start
    this.expression = ""
    this.conversion = null
    this.fmt = null
}

function fstring_error(msg, pos){
    var error = Error(msg)
    error.position = pos
    throw error
}

$B.parse_fstring = function(string){
    // Parse a f-string
    var elts = [],
        pos = 0,
        current = "",
        ctype = null,
        nb_braces = 0,
        expr_start,
        car

    while(pos < string.length){
        if(ctype === null){
            car = string.charAt(pos)
            if(car == "{"){
                if(string.charAt(pos + 1) == "{"){
                    ctype = "string"
                    current = "{"
                    pos += 2
                }else{
                    ctype = "expression"
                    expr_start = pos + 1
                    nb_braces = 1
                    pos++
                }
            }else if(car == "}"){
                if(string.charAt(pos + 1) == car){
                    ctype = "string"
                    current = "}"
                    pos += 2
                }else{
                    fstring_error(" f-string: single '}' is not allowed",
                        pos)
                }
            }else{
                ctype = "string"
                current = car
                pos++
            }
        }else if(ctype == "string"){
            // end of string is the first single { or end of string
            var i = pos
            while(i < string.length){
                car = string.charAt(i)
                if(car == "{"){
                    if(string.charAt(i + 1) == "{"){
                        current += "{"
                        i += 2
                    }else{
                        elts.push(current)
                        ctype = "expression"
                        expr_start = i + 1
                        pos = i + 1
                        break
                    }
                }else if(car == "}"){
                    if(string.charAt(i + 1) == car){
                        current += car
                        i += 2
                    }else{
                        fstring_error(" f-string: single '}' is not allowed",
                            pos)
                    }
                }else{
                    current += car
                    i++
                }
            }
            pos = i + 1
        }else if(ctype == "debug"){
            // after the equal sign, whitespace are ignored and the only
            // valid characters are } and :
            while(string.charAt(i) == " "){i++}
            if(string.charAt(i) == "}"){
                // end of debug expression
                elts.push(current)
                ctype = null
                current = ""
                pos = i + 1
            }
        }else{
            // End of expression is the } matching the opening {
            // There may be nested braces
            var i = pos,
                nb_braces = 1,
                nb_paren = 0,
                current = new fstring_expression(expr_start)
            while(i < string.length){
                car = string.charAt(i)
                if(car == "{" && nb_paren == 0){
                    nb_braces++
                    current.expression += car
                    i++
                }else if(car == "}" && nb_paren == 0){
                    nb_braces -= 1
                    if(nb_braces == 0){
                        // end of expression
                        if(current.expression == ""){
                            fstring_error("f-string: empty expression not allowed",
                                pos)
                        }
                        elts.push(current)
                        ctype = null
                        current = ""
                        pos = i + 1
                        break
                    }
                    current.expression += car
                    i++
                }else if(car == "\\"){
                    // backslash is not allowed in expressions
                    throw Error("f-string expression part cannot include a" +
                        " backslash")
                }else if(nb_paren == 0 && car == "!" && current.fmt === null &&
                        ":}".indexOf(string.charAt(i + 2)) > -1){
                    if(current.expression.length == 0){
                        throw Error("f-string: empty expression not allowed")
                    }
                    if("ars".indexOf(string.charAt(i + 1)) == -1){
                        throw Error("f-string: invalid conversion character:" +
                            " expected 's', 'r', or 'a'")
                    }else{
                        current.conversion = string.charAt(i + 1)
                        i += 2
                    }
                }else if(car == "(" || car == '['){
                    nb_paren++
                    current.expression += car
                    i++
                }else if(car == ")" || car == ']'){
                    nb_paren--
                    current.expression += car
                    i++
                }else if(car == '"'){
                    // triple string ?
                    if(string.substr(i, 3) == '"""'){
                        var end = string.indexOf('"""', i + 3)
                        if(end == -1){
                            fstring_error("f-string: unterminated string", pos)
                        }else{
                            var trs = string.substring(i, end + 3)
                            trs = trs.replace("\n", "\\n\\")
                            current.expression += trs
                            i = end + 3
                        }
                    }else{
                        var end = string.indexOf('"', i + 1)
                        if(end == -1){
                            fstring_error("f-string: unterminated string", pos)
                        }else{
                            current.expression += string.substring(i, end + 1)
                            i = end + 1
                        }
                    }
                }else if(nb_paren == 0 && car == ":"){
                    // start format
                    current.fmt = true
                    var cb = 0,
                        fmt_complete = false
                    for(var j = i + 1; j < string.length; j++){
                        if(string[j] == '{'){
                            if(string[j + 1] == '{'){
                                j += 2
                            }else{
                                cb++
                            }
                        }else if(string[j] == '}'){
                            if(string[j + 1] == '}'){
                                j += 2
                            }else if(cb == 0){
                                fmt_complete = true
                                var fmt = string.substring(i + 1, j)
                                current.format = $B.parse_fstring(fmt)
                                i = j
                                break
                            }else{
                                cb--
                            }
                        }
                    }
                    if(! fmt_complete){
                        fstring_error('invalid format', pos)
                    }
                }else if(car == "="){
                    // might be a "debug expression", eg f"{x=}"
                    var ce = current.expression,
                        last_char = ce.charAt(ce.length - 1),
                        last_char_re = ('()'.indexOf(last_char) > -1 ? "\\" : "") + last_char

                    if(ce.length == 0 ||
                            nb_paren > 0 ||
                            string.charAt(i + 1) == "=" ||
                            "=!<>:".search(last_char_re) > -1){
                        // not a debug expression
                        current.expression += car
                        i += 1
                    }else{
                        // add debug string
                        var tail = car
                        while(string.charAt(i + 1).match(/\s/)){
                            tail += string.charAt(i + 1)
                            i++
                        }
                        // push simple string
                        elts.push(current.expression + tail)
                        // remove trailing whitespace from expression
                        while(ce.match(/\s$/)){
                            ce = ce.substr(0, ce.length - 1)
                        }
                        current.expression = ce
                        ctype = "debug"
                        i++
                    }
                }else{
                    current.expression += car
                    i++
                }
            }
            if(nb_braces > 0){
                fstring_error("f-string: expected '}'", pos)
            }
        }
    }
    if(current.length > 0){
        elts.push(current)
    }
    for(var elt of elts){
        if(typeof elt == "object"){
            if(elt.fmt_pos !== undefined &&
                    elt.expression.charAt(elt.fmt_pos) != ':'){
                throw Error()
            }
        }
    }
    return elts
}

var _chr = $B.codepoint2jsstring = function(i){
    if(i >= 0x10000 && i <= 0x10FFFF){
        var code = (i - 0x10000)
        return String.fromCodePoint(0xD800 | (code >> 10)) +
            String.fromCodePoint(0xDC00 | (code & 0x3FF))
    }else{
        return String.fromCodePoint(i)
    }
}

var _ord = $B.jsstring2codepoint = function(c){
    if(c.length == 1){
        return c.charCodeAt(0)
    }
    var code = 0x10000
    code += (c.charCodeAt(0) & 0x03FF) << 10
    code += (c.charCodeAt(1) & 0x03FF)
    return code
}

})(__BRYTHON__)

