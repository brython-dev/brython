"use strict";

(function($B){

var _b_ = $B.builtins

var from_unicode = {},
    to_unicode = {}

function bytes_value(obj){
    return $B.get_class(obj) === bytes ? obj : fast_bytes(obj.source)
}

// Conversion of byte-like objects (bytes, bytearray, memoryview, array.array...)
// into a list of bytes
// Make the function an attribute of $B, it is used in libs/_binascii.js
$B.to_bytes = function(obj){
    var res
    if($B.$isinstance(obj, [bytes, bytearray])){
        res = obj.source
    }else{
        var ga = $B.$getattr(obj, "tobytes", null)
        if(ga !== null){
            res = $B.$call(ga).source
        }else{
            $B.RAISE(_b_.TypeError, "object doesn't support the buffer protocol")
        }
    }
    return res
}

function _strip(self, cars, lr){
    if(cars === undefined){
        cars = []
        var ws = '\r\n \t'
        for(let i = 0, len = ws.length; i < len; i++){
            cars.push(ws.charCodeAt(i))
        }
    }else if($B.$isinstance(cars, bytes)){
        cars = cars.source
    }else{
        $B.RAISE(_b_.TypeError, "Type str doesn't support the buffer API")
    }
    if(lr == 'l'){
        let i,
            len
        for(i = 0, len = self.source.length; i < len; i++){
            if(cars.indexOf(self.source[i]) == -1){break}
        }
        return bytes.$factory(self.source.slice(i))
    }
    let i
    for(i = self.source.length - 1; i >= 0; i--){
       if(cars.indexOf(self.source[i]) == -1){break}
    }
    return bytes.$factory(self.source.slice(0, i + 1))
}

function invalid(other){
    return ! $B.$isinstance(other, [bytes, bytearray])
}

function is_bytes_like(obj){
    return $B.$getattr(obj, '__buffer__', $B.NULL) !== $B.NULL
}

function get_list_from_bytes_like(obj){
    var buf = $B.$call($B.$getattr(obj, '__buffer__'), 0)
    if(! $B.exact_type(buf, _b_.memoryview)){
        $B.RAISE(_b_.TypeError,
            `__buffer__ should return memoryview, not ${$B.class_name(buf)}`
        )
    }
    return _b_.memoryview.tp_funcs.tolist(buf)
}

function check_buffer(arg){
    if(! is_bytes_like(arg)){
        $B.RAISE(_b_.TypeError, "a bytes-like object is required, " +
                "not '" + $B.class_name(arg) + "'")
    }
}

function check_buffer_or_int(arg){
    if(! $B.$isinstance(arg, _b_.int) && ! is_bytes_like(arg)){
        $B.RAISE(_b_.TypeError,
            `argument should be integer or bytes-like object, ` +
            `not '${$B.class_name(sub)}'`
        )
    }
}

/* bytearray_iterator start */
$B.bytearray_iterator.tp_iter = function(self){
    return self
}

$B.bytearray_iterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield item
    }
}

var bytearray_iterator_funcs = $B.bytearray_iterator.tp_funcs = {}

bytearray_iterator_funcs.__length_hint__ = function(self){

}

bytearray_iterator_funcs.__reduce__ = function(self){

}

bytearray_iterator_funcs.__setstate__ = function(self){

}

$B.bytearray_iterator.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* bytearray_iterator end */

//bytearray() (built in class)
var bytearray = _b_.bytearray

function no_resizing(){
    $B.RAISE(_b_.BufferError,
        "Existing exports of data: object cannot be re-sized")
}

function self_arg(func_name, args){
    var $ = $B.args(func_name, 1, {self: null}, ['self'], args, {}, null, null)
    return $.self
}

function self_other_args(func_name, args){
    var $ = $B.args(func_name, 2, {self: null, other: null}, ['self', 'other'],
                args, {}, null, null)
    return [$.self, $.other]
}

function main_type(obj){
    // used in methods to get the result type
    // the type of obj.upper() is bytearray if obj type is a subclass of
    // bytearray
    return $B.$isinstance(obj, _b_.bytearray) ? _b_.bytearray : _b_.bytes
}

function bytearray_delitem(self, arg){
    if(self.exports){
        if($B.$isinstance(arg, _b_.slice)){
            var slice = _b_.slice.$conv_for_seq(arg, self.source.length)
            if(slice.stop - slice.start > 0){
                no_resizing()
            }
        }else{
            no_resizing()
        }
    }
    return $B.list_delitem(self.source, arg)
}

function capitalize(){
    var self = self_arg('capitalize', arguments)
    var src = self.source,
        len = src.length,
        buffer = src.slice()

    if(buffer[0] > 96 && buffer[0] < 123){buffer[0] -= 32}

    for(var i = 1; i < len; ++i){
        if(buffer[i] > 64 && buffer[i] < 91){
            buffer[i] += 32
        }
    }
    return main_type(self).$factory(buffer)
}

function center(){
    var $ = $B.args('center', 3, {self: null, width: null, fillbyte: null},
            ['self', 'width', 'fillbyte'], arguments,
            {fillbyte: bytes.$factory([32])}, null, null)

    var diff = $.width - $.self.source.length
    if(diff <= 0){
        return bytes.$factory($.self.source)
    }
    var type = main_type(self)
    var ljust = type.tp_funcs.ljust($.self, $.self.source.length + Math.floor(diff / 2),
        $.fillbyte)
    return type.tp_funcs.rjust(ljust, $.width, $.fillbyte)
}

function count(self){
    var $ = $B.args('count', 4,
                {self: null, sub: null, start: null, end: null},
                ['self', 'sub', 'start', 'end'], arguments,
                {start: 0, end: -1}, null, null)
    var self = $.self,
        sub = $.sub,
        start = $.start,
        end = $.end

    var nb = 0,
        len = self.source.length

    if(typeof sub == "number"){
        if(sub < 0 || sub > 255){
            $B.RAISE(_b_.ValueError, "byte must be in range(0, 256)")
        }
        for(var b of self.source){
            if(b == sub){
                nb++
            }
        }
        return nb
    }
    check_buffer(sub)
    var seq = get_list_from_bytes_like(sub)
    var seq_len = seq.length
    var le
    for(var i = 0; i < len; i++){
        var found = 1
        for(var j = 0; j < seq_len; j++){
            if(self.source[i + j] != seq[j]){
                found = 0
                break
            }
        }
        nb += found
    }
    return nb
}

function decode(self){
    var $ = $B.args("decode", 3, {self: null, encoding: null, errors: null},
            ["self", "encoding", "errors"], arguments,
            {encoding: "utf-8", errors: "strict"}, null, null)
    switch ($.errors) {
      case 'strict':
      case 'ignore':
      case 'replace':
      case 'surrogateescape':
      case 'surrogatepass':
      case 'xmlcharrefreplace':
      case 'backslashreplace':
        return decode($.self, $.encoding, $.errors)
      default:
        // raise error since errors variable is not valid
    }
}

function endswith(){
    var $ = $B.args('endswith', 4,
            {self: null, suffix: null, start: null, end: null},
            ['self', 'suffix', 'start', 'end'], arguments,
            {start: -1, end: -1}, null, null)
    var self = $.self,
        suffix = $.suffix,
        start = $.start,
        end = $.end
    if(is_bytes_like(suffix)){
        var seq = get_list_from_bytes_like(suffix)
        start = start == -1 ? 0 : start
        end = end == -1 ? self.source.length : end
        var res = true
        var seq_len = seq.length
        if(seq_len > end - start){
            return false
        }
        for(let i = 0; i < seq_len && res; i++){
            res = self.source[end - seq_len + i] == seq[i]
        }
        return res
    }else if($B.$isinstance(suffix, _b_.tuple)){
        for(let sub of suffix){
            if(endswith(self, sub, start, end)){
                return true
            }
        }
        return false
    }else{
        $B.RAISE(_b_.TypeError, "endswith first arg must be bytes-like " +
            "or a tuple of bytes-like, not " + $B.class_name($.suffix))
    }
}

function expandtabs(){
    var $ = $B.args('expandtabs', 2, {self: null, tabsize: null},
                ['self', 'tabsize'], arguments, {tabsize: 8}, null, null)
    var self = $.self,
        tabsize = $.tabsize
    var tab_spaces = []
    for(let i = 0; i < tabsize; ++i){
        tab_spaces.push(32)
    }

    var buffer = self.source.slice()
    for(let i = 0; i < buffer.length; ++i){
        if(buffer[i] === 9){
            var nb_spaces = tabsize - i % tabsize
            var tabs = new Array(nb_spaces)
            tabs.fill(32)
            buffer.splice.apply(buffer, [i, 1].concat(tabs))
        }
    }
    return main_type(self).$factory(buffer)
}

function find(){
    var func = this // 'find' or 'rfind'
    var $ = $B.args(func, 4, {self: null, sub: null, start: null, end: null},
                ['self', 'sub', 'start', 'end'], arguments,
                {start: _b_.None, end: _b_.None}, null, null)
    var self = $.self,
        sub = $.sub,
        start = $.start,
        end = $.end
    check_buffer_or_int(sub)
    var seq
    if($B.$isinstance(sub, _b_.int)){
        seq = [$B.PyNumber_Index(sub)]
    }else{
        seq = get_list_from_bytes_like(sub)
    }
    var boundaries = _b_.slice.$conv_for_seq({start, stop: end, step: 1},
            self.source.length)
    start = boundaries.start
    end = boundaries.stop
    var seq_len = seq.length
    if(func == 'find'){
        for(var i = start; i < end - seq_len + 1; i++){
            var found = true
            for(var j = 0; j < seq_len; j++){
                if(self.source[i + j] != seq[j]){
                    found = false
                    break
                }
            }
            if(found){
                return i
            }
        }
    }else{ // rfind
        for(var i = end - 1; i > start - seq_len; i--){
            var found = true
            for(var j = 0; j < seq_len; j++){
                if(self.source[i + j] != seq[j]){
                    found = false
                    break
                }
            }
            if(found){
                return i
            }
        }
    }
    return -1
}

function fromhex(){
    var $ = $B.args('fromhex', 2, {cls: null, string: null},
                ['cls', 'string'], arguments, {}, null, null)
    var cls = $.cls,
        string = $.string
    string = string.replace(/\s/g, '')
    var source = []
    for(var i = 0; i < string.length; i += 2){
        if(i + 2 > string.length){
            $B.RAISE(_b_.ValueError, "non-hexadecimal number found " +
                "in fromhex() arg")
        }
        source.push(_b_.int.$factory(string.substr(i, 2), 16))
    }
    return $B.$call(cls, source)
}

function hex(){
    // Return a string which is hex representation of the instance
    // The hexstring can include a separator every specified number of bytes
    var $ = $B.args('hex', 3, {self:null, sep:null, bytes_per_sep:null},
                ['self','sep','bytes_per_sep'], arguments,
                {sep: "", bytes_per_sep: 1}, null, null)
    var self = $.self,
        sep = $.sep,
        bytes_per_sep = $.bytes_per_sep,
        res = "",
        digits = "0123456789abcdef",
        bps = bytes_per_sep,
        jstart = bps,
        len = self.source.length;
    if(bytes_per_sep < 0){
        bps = -bytes_per_sep;
        jstart = bps
    }else if(bytes_per_sep == 0){
        sep = ''
    }else{
        jstart = len % bps
        if(jstart == 0){
           jstart = bps
       }
    }
    for(var i = 0, j = jstart; i < len; i++){
        var c = self.source[i]
        if (j == 0) {
            res += sep
            j = bps
        }
        j--
        res += digits[c >> 4]
        res += digits[c & 0x0f]
    }
    return res
}

function isalnum(){
    var self = self_arg('isalnum', arguments)
    var src = self.source,
        len = src.length,
        res = len > 0

    for(var i = 0; i < len && res; ++i){
        res = (src[i] > 96 && src[i] < 123) || // Lowercase
              (src[i] > 64 && src[i] < 91) ||  // Uppercase
              (src[i] > 47 && src[i] < 58)     // Digit
    }
    return res
}

function isalpha(){
    var self = self_arg('isalpha', arguments)
    var src = self.source,
        len = src.length,
        res = len > 0

    for(var i = 0; i < len && res; ++i){
        res = (src[i] > 96 && src[i] < 123) || (src[i] > 64 && src[i] < 91)
    }
    return res
}

function isascii(){
    var self = self_arg('isascii', arguments)
    for(var byte of self.source){
        if(byte > 0x7F){
            return false
        }
    }
    return true
}

function isdigit(){
    var self = self_arg('isdigit', arguments)
    var src = self.source,
        len = src.length,
        res = len > 0

    for(let i = 0; i < len && res; ++i){
        res = src[i] > 47 && src[i] < 58
    }
    return res
}

function islower(){
    var self = self_arg('islower', arguments)
    var src = self.source,
        len = src.length,
        res = false

    for(let i = 0; i < len; ++i){
        // Check for at least 1 lowercase ascii character
        res = res || (src[i] > 96 && src[i] < 123)

        // Don't allow any uppercase ascii characters
        if(src[i] > 64 && src[i] < 91){return false}
    }

    return res
}

function isspace(){
    var self = self_arg('isspace', arguments)

    var src = self.source,
        len = src.length

    for(let i = 0; i < len; ++i){
        switch(src[i]){
            case 9:  // Horizontal tab
            case 10: // Line feed
            case 11: // Vertical tab
            case 12: // Form feed
            case 13: // Carriage return
            case 32: // Space
                break

            default:
                return false
        }
    }

    return true
}

function istitle(){
    var self = self_arg('istitle', arguments)
    var src = self.source,
        len = src.length,
        current_char_is_letter = false,
        prev_char_was_letter = false,
        is_uppercase = false,
        is_lowercase = false

    for(var i = 0; i < len; ++i){
        is_lowercase = src[i] > 96 && src[i] < 123
        is_uppercase = src[i] > 64 && src[i] < 91
        current_char_is_letter = is_lowercase || is_uppercase

        if(current_char_is_letter &&
                (prev_char_was_letter && is_uppercase) ||
                (! prev_char_was_letter && is_lowercase)){
            return false
        }
        prev_char_was_letter = current_char_is_letter
    }

    return true
}

function isupper(){
    var self = self_arg('isupper', arguments)
    var src = self.source,
        len = src.length,
        res = false

    for(let i = 0; i < len; ++i){
        // Check for at least 1 uppercase ascii character
        res = res || (src[i] > 64 && src[i] < 91)

        // Don't allow any lowercase ascii characters
        if(src[i] > 96 && src[i] < 123){return false}
    }

    return res
}
function nb_multiply(){
    var $ = $B.args('__mul__', 2, {self: null, value: null}, ['self', 'value'],
                arguments, {}, null, null)

    var self = $.self,
        value = $.value
    var v = $B.PyNumber_Index(value)
    var source = self.source.slice()
    for(var i = 0; i < v; i++){
        for(var item of self.source){
            source[source.length] = item
        }
    }
    var cls = $B.$isinstance(self, _b_.bytes) ? _b_.bytes : _b_.bytearray
    return {
        ob_type: cls,
        source
    }
}

function nb_remainder(){
    // PEP 461
    var $ = $B.args('__mod__', 2, {self: null, args: null}, ['self', 'args'],
                arguments, {}, null, null)
    var self = $.self,
        args = $.args
    var s = decode(self, "latin-1", "strict"),
        res = $B.printf_format(s, 'bytes', args)
    return _b_.str.tp_funcs.encode(res, "ascii")
}

function removeprefix(self, prefix){
    var $ = $B.args('removeprefix', 2, {self:null, prefix: null},
                ['self', 'prefix'], arguments, {}, null, null)
    var self = $.self,
        prefix = $.prefix
    check_buffer(prefix)
    var seq = get_list_from_bytes_like(prefix)
    var found = true
    for(var i = 0, seq_len = seq.length; i < seq_len; i++){
        if(self.source[i] != seq[i]){
            found = false
            break
        }
    }
    if(found){
        return {
            ob_type: $B.get_class(self),
            source: self.source.slice(seq_len)
        }
    }
    return self
}

function removesuffix(self, prefix){
    var $ = $B.args('removesuffix', 2, {self:null, prefix: null},
                ['self', 'prefix'], arguments, {}, null, null)
    var self = $.self,
        prefix = $.prefix
    check_buffer(prefix)
    var seq = get_list_from_bytes_like(prefix)
    var found = true
    var len = self.source.length,
        seq_len = seq.length
    for(var i = 0; i < seq_len; i++){
        if(self.source[len - seq_len + i] != seq[i]){
            found = false
            break
        }
    }
    if(found){
        return {
            ob_type: $B.get_class(self),
            source: self.source.slice(0, len - seq_len)
        }
    }
    return self
}

function sq_contains(self, other){
    var [self, other] = self_other_args('__contains__', arguments)
    if(typeof other == "number"){
        return self.source.indexOf(other) > -1
    }
    if(! is_bytes_like(other)){
        return false
    }
    var seq = get_list_from_bytes_like(other)
    if(self.source.length < seq.length){
        return false
    }
    var len = self.source.length
    var seq_len = seq.length
    for(var i = 0; i < len - seq_len + 1; i++){
        var flag = true
        for(var j = 0; j < seq_len; j++){
            if(self.source[i + j] != seq[j]){
                flag = false
                break
            }
        }
        if(flag){
            return true
        }
    }
    return false
}

function upper(){
    var self = self_arg('upper', arguments)
    var _res = [],
        pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _upper(self.source[i])}
    }
    return main_type(self).$factory(_res)
}

function check_exports(self){
    if(self.exports == 0){
        return
    }
    /* Check if there is a reference to a memoryview on self

    Since there is no explicit garbage collection, the bytearray might have
    been created but not referenced
    For instance with:

         b = bytearray(b'abc')
         memoryview(b)
         b.extend(b'd')

    the memoryview created in the second line is not referenced, so is
    implicitely garbage-collected, and the 3rd line doesn't raise BufferError

    On the contrary, in the code below where the memoryview is referenced,
    the 3rd line raises BufferError:

        b = bytearray(b'abc')
        x = memoryview(b)
        b.extend(b'd')

    To detect a reference, we scan the current execution frames
    */

    var frame_obj = $B.frame_obj
    var has_exports = false
    while(frame_obj !== null){
        var locals = frame_obj.frame[1]
        for(var key in locals){
            try{
                var value = locals[key]
                if($B.get_class(value) === _b_.memoryview && value.obj === self){
                    has_exports = true
                    break
                }
            }catch(err){
                // ignore
            }
        }
        frame_obj = frame_obj.prev
    }
    if(has_exports){
        if(self.exports){
            no_resizing()
        }
    }else{
        // would have been set before if there was a garbage collector
        self.exports = 0
    }
}

bytearray.$factory = function(){
    var args = [bytearray]
    for(var i = 0, len = arguments.length; i < len; i++){
        args.push(arguments[i])
    }
    var res = bytearray.tp_new.apply(null, args)
    res.exports = 0
    return res
}

/* bytearray start */
_b_.bytearray.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, [_b_.bytearray, _b_.bytes])){
        return _b_.NotImplemented
    }
    return _b_.list.tp_richcompare(
        $B.$list(self.source), $B.$list(other.source), op)
}

_b_.bytearray.nb_multiply = function(){
    return nb_multiply.apply(null, arguments)
}

_b_.bytearray.nb_remainder = function(){
    var res = nb_remainder.apply(null, arguments)
    res.ob_type = $B.get_class(self)
    return res
}

_b_.bytearray.sq_ass_item = function(self, arg, value){
    if(value === $B.NULL){
        return bytearray_delitem(self, arg)
    }
    if($B.$isinstance(arg, _b_.int)){
        if(! $B.$isinstance(value, _b_.int)){
            $B.RAISE(_b_.TypeError, 'an integer is required')
        }else if(value > 255){
            $B.RAISE(_b_.ValueError, "byte must be in range(0, 256)")
        }
        var pos = arg
        if(arg < 0){
            pos = self.source.length + pos
        }
        if(pos >= 0 && pos < self.source.length){
            self.source[pos] = value
        }else{
            $B.RAISE(_b_.IndexError, 'list index out of range')
        }
    }else if($B.$isinstance(arg, _b_.slice)){
        var start = arg.start === _b_.None ? 0 : arg.start
        var stop = arg.stop === _b_.None ? self.source.length : arg.stop

        if(start < 0){
            start = self.source.length + start
        }
        if(stop < 0){
            stop = self.source.length + stop
        }
        if(stop > self.source.length){
            check_exports(self)
        }

        self.source.splice(start, stop - start)

        // copy items in a temporary JS array
        // otherwise, a[:0] = a fails
        try{
            var $temp = _b_.list.$factory(value)
        }catch(err){
            $B.RAISE(_b_.TypeError, "can only assign an iterable")
        }
        if($temp.length != stop - start){
            check_exports(self)
        }
        for(var i = $temp.length - 1; i >= 0; i--){
            if(! $B.$isinstance($temp[i], _b_.int)){
                $B.RAISE(_b_.TypeError, 'an integer is required')
            }else if($temp[i] > 255){
                $B.RAISE(_b_.ValueError, "byte must be in range(0, 256)")
            }
            self.source.splice(start, 0, $temp[i])
        }
    }else{
        $B.RAISE(_b_.TypeError, 'list indices must be integer, not ' +
            $B.class_name(arg))
    }
}

_b_.bytearray.tp_repr = function(self){
    var b = _b_.bytes.tp_repr(self)
    return `bytearray(${b})`
}

_b_.bytearray.tp_hash = _b_.None

_b_.bytearray.tp_str = function(self){
    return _b_.bytearray.tp_repr(self)
}

_b_.bytearray.tp_iter = function(self){
    return {
        ob_type: $B.bytearray_iterator,
        it: self.source[Symbol.iterator]()
    }
}

_b_.bytearray.tp_init = function(self){

}

_b_.bytearray.tp_new = function(cls){
    var b = _b_.bytes.tp_new.apply(null, arguments)
    b.ob_type = cls
    return b
}

_b_.bytearray.nb_inplace_add = function(self, other){
    if(! $B.$isinstance(other, [_b_.bytearray, _b_.bytes])){
        $B.RAISE(_b_.TypeError,
            `can't concat ${$B.class_name(other)} to bytearray`
        )
    }
    self.source = self.source.concat(other.source)
    return self
}

_b_.bytearray.nb_inplace_multiply = function(self, value){
    var v = $B.PyNumber_Index(value)
    var source = self.source.slice()
    for(var i = 1; i < v; i++){
        for(var item of self.source){
            source[source.length] = item
        }
    }
    self.source = source
    return self
}

_b_.bytearray.mp_length = function(self){
    return _b_.bytes.mp_length(self)
}

_b_.bytearray.mp_subscript = function(self, arg){
    return _b_.bytes.mp_subscript(self, arg)
}

_b_.bytearray.sq_concat = function(self, other){
    try{
        var other_bytes = $B.to_bytes(other)
    }catch(err){
        $B.RAISE(_b_.TypeError, `can't concat ${$B.class_name(other)} to bytes`)
    }
    if(other_bytes.length > 0){
        check_exports(self)
    }
    return {
        ob_type: $B.get_class(self),
        source: self.source.concat(other_bytes)
    }
}

_b_.bytearray.sq_contains = function(){
    return sq_contains.apply(null, arguments)
}

_b_.bytearray.bf_getbuffer = function(self){
    return $B.$call(_b_.memoryview, self)
}

_b_.bytearray.bf_releasebuffer = function(self){

}

var bytearray_funcs = _b_.bytearray.tp_funcs = {}

bytearray_funcs.__alloc__ = function(self){

}

bytearray_funcs.__reduce__ = function(self){

}

bytearray_funcs.__reduce_ex__ = function(self){

}

bytearray_funcs.__sizeof__ = function(self){

}

bytearray_funcs.append = function(self, b){
    check_exports(self)
    if(arguments.length != 2){$B.RAISE(_b_.TypeError,
        "append takes exactly one argument (" + (arguments.length - 1) +
        " given)")
    }
    if(! $B.$isinstance(b, _b_.int)){
        $B.RAISE(_b_.TypeError, "an integer is required")
    }
    if(b > 255){
        $B.RAISE(_b_.ValueError, "byte must be in range(0, 256)")
    }
    self.source[self.source.length] = b
}

bytearray_funcs.capitalize = function(){
    return capitalize.apply(null, arguments)
}

bytearray_funcs.center = function(self){
    return center.apply(null, arguments)
}

bytearray_funcs.clear = function(self){
    check_exports(self)
    self.source = []
}

bytearray_funcs.copy = function(self){

}

bytearray_funcs.count = function(self){
    return count.apply(null, arguments)
}

bytearray_funcs.decode = function(self){
    return decode.apply(null, arguments)
}

bytearray_funcs.endswith = function(self){
    return endswith.apply(null, arguments)
}

bytearray_funcs.expandtabs = function(self){
    return expandtabs.apply(null, arguments)
}

bytearray_funcs.extend = function(self, b){
    check_exports(self)
    if(self.in_iteration){
        // happens in re.finditer()
        no_resizing()
    }
    if([bytearray, bytes].includes($B.get_class(b))){
        self.source = self.source.concat(b.source)
        return _b_.None
    }
    for(var item of $B.make_js_iterator(b)){
        bytearray.append(self, $B.PyNumber_Index(item))
    }
    return _b_.None
}

bytearray_funcs.find = function(self){
    return find.apply('find', arguments)
}

bytearray_funcs.fromhex = function(self){
    return fromhex.apply(null, arguments)
}

bytearray_funcs.hex = function(self){
    return hex.apply(null, arguments)
}

bytearray_funcs.index = function(self){
    var res = find.apply('find', arguments)
    if(res == -1){
        $B.RAISE(_b_.ValueError, 'subsection not found')
    }
    return res
}

bytearray_funcs.insert = function(self, pos, b){
    check_exports(self)
    if(arguments.length != 3){
        $B.RAISE(_b_.TypeError,
            "insert takes exactly 2 arguments (" + (arguments.length - 1) +
            " given)")
    }
    if(! $B.$isinstance(b, _b_.int)){
        $B.RAISE(_b_.TypeError, "an integer is required")
    }
    if(b > 255){
        $B.RAISE(_b_.ValueError, "byte must be in range(0, 256)")
    }
    _b_.list.tp_funcs.insert(self.source, pos, b)
}

bytearray_funcs.isalnum = function(self){
    return isalnum.apply(null, arguments)
}

bytearray_funcs.isalpha = function(self){
    return isalpha.apply(null, arguments)
}

bytearray_funcs.isascii = function(self){
    return isascii.apply(null, arguments)
}

bytearray_funcs.isdigit = function(self){
    return isdigit.apply(null, arguments)
}

bytearray_funcs.islower = function(self){
    return islower.apply(null, arguments)
}

bytearray_funcs.isspace = function(self){
    return isspace.apply(null, arguments)
}

bytearray_funcs.istitle = function(self){
    return istitle.apply(null, arguments)
}

bytearray_funcs.isupper = function(self){
    return isupper.apply(null, arguments)
}

bytearray_funcs.join = function(self){

}

bytearray_funcs.ljust = function(self){

}

bytearray_funcs.lower = function(self){

}

bytearray_funcs.lstrip = function(self){

}

bytearray_funcs.maketrans = function(self){

}

bytearray_funcs.partition = function(self){

}

bytearray_funcs.pop = function(self){
    var $ = $B.args('pop', 2, {self:null, index:null}, ['self', 'index'],
                arguments, {index: -1}, null, null)
    var self = $.self,
        index = $.index
    check_exports(self)
    return _b_.list.tp_funcs.pop(self.source, index)
}

bytearray_funcs.remove = function(self){
    var $ = $B.args('remove', 2, {self: null, value: null}, ['self', 'value'],
                arguments, {}, null, null)
    var self = $.self,
        value = $.value
    value = $B.PyNumber_Index(value)
    if(value > 255){
        return
    }
    var ix = self.source.indexOf(value)
    if(ix != -1){
        self.source.splice(ix, 1)
    }
}

bytearray_funcs.removeprefix = function(self, prefix){
    return removeprefix.apply(null, arguments)
}

bytearray_funcs.removesuffix = function(self){
    return removesuffix.apply(null, arguments)
}

bytearray_funcs.replace = function(self){

}

bytearray_funcs.resize = function(self, size){
    check_exports(self)
    size = $B.PyNumber_Index(size)
    if(size < 0){
        $B.RAISE(_b_.ValueError,
            `Can only resize to positive sizes, got -${size}`)
    }
    if(size > self.source.length){
        for(var i = 0, len = size - self.source.length; i < len; i++){
            self.source.push(0)
        }
    }else{
        self.source = self.source.slice(0, size)
    }
    return _b_.None
}

bytearray_funcs.reverse = function(self){
    self.source.reverse()
}

bytearray_funcs.rfind = function(){
    return find.apply('rfind', arguments)
}

bytearray_funcs.rindex = function(self){
    var res = find.apply('rfind', arguments)
    if(res == -1){
        $B.RAISE(_b_.ValueError, 'subsection not found')
    }
    return res
}

bytearray_funcs.rjust = function(self){

}

bytearray_funcs.rpartition = function(self){

}

bytearray_funcs.rsplit = function(self){

}

bytearray_funcs.rstrip = function(self){

}

bytearray_funcs.split = function(self){

}

bytearray_funcs.splitlines = function(self){

}

bytearray_funcs.startswith = function(self){

}

bytearray_funcs.strip = function(self){

}

bytearray_funcs.swapcase = function(self){

}

bytearray_funcs.title = function(self){

}

bytearray_funcs.translate = function(self){

}

bytearray_funcs.upper = function(self){
    return upper.apply(null, arguments)
}

bytearray_funcs.zfill = function(self){

}

_b_.bytearray.tp_methods = ["__alloc__", "__reduce__", "__reduce_ex__", "__sizeof__", "append", "capitalize", "center", "clear", "copy", "count", "decode", "endswith", "expandtabs", "extend", "find", "hex", "index", "insert", "isalnum", "isalpha", "isascii", "isdigit", "islower", "isspace", "istitle", "isupper", "join", "ljust", "lower", "lstrip", "partition", "pop", "remove", "replace", "removeprefix", "removesuffix", "resize", "reverse", "rfind", "rindex", "rjust", "rpartition", "rsplit", "rstrip", "split", "splitlines", "startswith", "strip", "swapcase", "title", "translate", "upper", "zfill"]

_b_.bytearray.classmethods = ["fromhex"]

_b_.bytearray.staticmethods = ["maketrans"]

/* bytearray end */
/*
// add methods of bytes to bytearray
for(var attr in bytes){
    if(bytearray[attr] === undefined && typeof bytes[attr] == "function"){
        bytearray[attr] = (function(_attr){
            return function(){
                return bytes[_attr].apply(null, arguments)
            }
        })(attr)
    }
}
*/

$B.set_func_names(bytearray, "builtins")


//bytes() (built in function)
var bytes = _b_.bytes
bytes.$buffer_protocol = true
bytes.$is_sequence = true

function bytes_split_with_sep(self, seps, maxsplit){
    var parts = [],
        pos = 0,
        source = self.source,
        len = source.length

    var sep_len = seps.length
    if(sep_len == 0){
        $B.RAISE(_b_.ValueError, 'empty separator')
    }
    if(self.source.length == 0){
        return $B.$list([$B.fast_bytes()])
    }
    var acc = []
    var done = false
    while(pos < len){
        var i = 0,
            found = false
        while(source[pos + i] == seps[i]){
            i += 1
            if(i == sep_len){
                found = true
                break
            }
        }
        if(found){
            parts.push(acc)
            if(maxsplit > 0 && parts.length == maxsplit){
                parts.push(source.slice(pos + sep_len))
                done = true
                break
            }
            acc = []
            pos += sep_len
        }else{
            acc.push(source[pos])
            pos += 1
        }
    }
    if(! done){
        parts.push(acc)
    }

    parts = parts.map(t => $B.fast_bytes(t))
    return $B.$list(parts)
}

function bytes_split_with_whitespace(self, maxsplit){
    var parts = [],
        pos = 0,
        seps,
        source = self.source,
        len = source.length

    maxsplit = _b_.int.$int_value(maxsplit)
    var ws = [9, 10, 11, 12, 13, 32]
    // strip leading and trailing whitespaces
    while(pos < len && ws.includes(source[pos])){
        pos++
    }
    if(pos == len){
        return $B.$list([])
    }
    var start = pos
    pos = source.length - 1
    while(pos > 0 && ws.includes(source[pos])){
        pos--
    }
    source = source.slice(start, pos - start + 1)
    len = source.length
    // split by consecutive whitespace bytes
    var acc = []
    pos = 0
    while(pos < len){
        var i = 0,
            found = false
        while(ws.includes(source[pos + i])){
            i++
        }
        if(i > 0){
            parts.push(acc)
            acc = []
            pos += i
        }else{
            acc.push(source[pos])
            pos++
        }
    }
    if(acc.length > 0){
        parts.push(acc)
    }
    parts = parts.map(t => $B.fast_bytes(t))
    return $B.$list(parts)
}

var bytes_iterator = $B.bytes_iterator

/* bytes_iterator start */
$B.bytes_iterator.tp_iter = function(self){
    return self
}

$B.bytes_iterator.tp_iternext = function*(self){
    for(var value of self.it){
        yield value
    }
}

var bytes_iterator_funcs = $B.bytes_iterator.tp_funcs = {}

bytes_iterator_funcs.__length_hint__ = function(self){

}

bytes_iterator_funcs.__reduce__ = function(self){

}

bytes_iterator_funcs.__setstate__ = function(self){

}

$B.bytes_iterator.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* bytes_iterator end */

$B.set_func_names(bytes_iterator, 'builtins')


bytes.$getnewargs = function(self){
    return $B.fast_tuple([bytes_value(self)])
}

bytes.$new = function(cls, source, encoding, errors){
    // Create an instance of bytes. Called by methods that have already parsed
    // the arguments.
    var self = {ob_type: cls},
        int_list = [],
        pos = 0
    if(source === undefined){
        // empty list
    }else if(typeof source == "number" || $B.$isinstance(source, _b_.int)){
        let i = source
        while(i--){
            int_list[pos++] = 0
        }
    }else{
        if(typeof source == "string" || $B.$isinstance(source, _b_.str)){
            if(encoding === undefined){
                $B.RAISE(_b_.TypeError, "string argument without an encoding")
            }
            int_list = encode(source, encoding || "utf-8", errors || "strict")
        }else{
            if(encoding !== undefined){
                console.log('encoding', encoding)
                $B.RAISE(_b_.TypeError, "encoding without a string argument")
            }
            // tranform iterable "source" into a list
            if(Array.isArray(source)){
                int_list = source
            }else{
                try{
                    int_list = _b_.list.$factory(source)
                }catch(err){
                    var bytes_method = $B.$getattr(source, '__bytes__', _b_.None)
                    if(bytes_method === _b_.None){
                        $B.RAISE(_b_.TypeError, "cannot convert " +
                            `'${$B.class_name(source)}' object to bytes`)
                    }
                    var res = $B.$call(bytes_method)
                    if(! $B.$isinstance(res, _b_.bytes)){
                        $B.RAISE(_b_.TypeError, `__bytes__ returned ` +
                            `non-bytes (type ${$B.class_name(res)})`)
                    }
                    return res
                }
                for(let i = 0; i < int_list.length; i++){
                    try{
                        var item = _b_.int.$factory(int_list[i])
                    }catch(err){
                        $B.RAISE(_b_.TypeError, "'" +
                            $B.class_name(int_list[i]) + "' object " +
                            "cannot be interpreted as an integer 8")
                    }
                    if(item < 0 || item > 255){
                        $B.RAISE(_b_.ValueError, "bytes must be in range" +
                            "(0, 256)")
                    }
                }
            }
        }
    }
    self.source = int_list
    self.encoding = encoding
    self.errors = errors
    return self
}

bytes.__release_buffer__ = function(_self, buffer){
    _b_.memoryview.tp_funcs.release(buffer)
}

var _lower = function(char_code) {
    if(char_code >= 65 && char_code <= 90){
        return char_code + 32
    }else{
        return char_code
    }
}

var _upper = function(char_code){
    if(char_code >= 97 && char_code <= 122){
        return char_code - 32
    }else{
        return char_code
    }
}

function $UnicodeEncodeError(encoding, code_point, position){
    $B.RAISE(_b_.UnicodeEncodeError, "'" + encoding +
        "' codec can't encode character " + _b_.hex(code_point) +
        " in position " + position)
}

function _hex(_int){
    var h = _int.toString(16)
    return '0x' + '0'.repeat(2 - h.length) + h
}

var aliases = {
    ascii: ['646', 'us-ascii'],
    big5: ['big5-tw', 'csbig5'],
    big5hkscs: ['big5-hkscs', 'hkscs'],
    cp037: ['IBM037', 'IBM039'],
    cp273: ['273', 'IBM273', 'csIBM273'],
    cp424: ['EBCDIC-CP-HE', 'IBM424'],
    cp437: ['437', 'IBM437'],
    cp500: ['EBCDIC-CP-BE', 'EBCDIC-CP-CH', 'IBM500'],
    cp775: ['IBM775'],
    cp850: ['850', 'IBM850'],
    cp852: ['852', 'IBM852'],
    cp855: ['855', 'IBM855'],
    cp857: ['857', 'IBM857'],
    cp858: ['858', 'IBM858'],
    cp860: ['860', 'IBM860'],
    cp861: ['861', 'CP-IS', 'IBM861'],
    cp862: ['862', 'IBM862'],
    cp863: ['863', 'IBM863'],
    cp864: ['IBM864'],
    cp865: ['865', 'IBM865'],
    cp866: ['866', 'IBM866'],
    cp869: ['869', 'CP-GR', 'IBM869'],
    cp932: ['932', 'ms932', 'mskanji', 'ms-kanji'],
    cp949: ['949', 'ms949', 'uhc'],
    cp950: ['950', 'ms950'],
    cp1026: ['ibm1026'],
    cp1125: ['1125', 'ibm1125', 'cp866u', 'ruscii'],
    cp1140: ['ibm1140'],
    cp1250: ['windows-1250'],
    cp1251: ['windows-1251'],
    cp1252: ['windows-1252'],
    cp1253: ['windows-1253'],
    cp1254: ['windows-1254'],
    cp1255: ['windows-1255'],
    cp1256: ['windows-1256'],
    cp1257: ['windows-1257'],
    cp1258: ['windows-1258'],
    euc_jp: ['eucjp', 'ujis', 'u-jis'],
    euc_jis_2004: ['jisx0213', 'eucjis2004'],
    euc_jisx0213: ['eucjisx0213'],
    euc_kr: ['euckr', 'korean', 'ksc5601', 'ks_c-5601', 'ks_c-5601-1987', 'ksx1001', 'ks_x-1001'],
    gb2312: ['chinese', 'csiso58gb231280', 'euc-cn', 'euccn', 'eucgb2312-cn', 'gb2312-1980', 'gb2312-80', 'iso-ir-58'],
    gbk: ['936', 'cp936', 'ms936'],
    gb18030: ['gb18030-2000'],
    hz: ['hzgb', 'hz-gb', 'hz-gb-2312'],
    iso2022_jp: ['csiso2022jp', 'iso2022jp', 'iso-2022-jp'],
    iso2022_jp_1: ['iso2022jp-1', 'iso-2022-jp-1'],
    iso2022_jp_2: ['iso2022jp-2', 'iso-2022-jp-2'],
    iso2022_jp_2004: ['iso2022jp-2004', 'iso-2022-jp-2004'],
    iso2022_jp_3: ['iso2022jp-3', 'iso-2022-jp-3'],
    iso2022_jp_ext: ['iso2022jp-ext', 'iso-2022-jp-ext'],
    iso2022_kr: ['csiso2022kr', 'iso2022kr', 'iso-2022-kr'],
    latin_1: ['iso-8859-1', 'iso8859-1', '8859', 'cp819', 'latin', 'latin1', 'L1'],
    iso8859_2: ['iso-8859-2', 'latin2', 'L2'],
    iso8859_3: ['iso-8859-3', 'latin3', 'L3'],
    iso8859_4: ['iso-8859-4', 'latin4', 'L4'],
    iso8859_5: ['iso-8859-5', 'cyrillic'],
    iso8859_6: ['iso-8859-6', 'arabic'],
    iso8859_7: ['iso-8859-7', 'greek', 'greek8'],
    iso8859_8: ['iso-8859-8', 'hebrew'],
    iso8859_9: ['iso-8859-9', 'latin5', 'L5'],
    iso8859_10: ['iso-8859-10', 'latin6', 'L6'],
    iso8859_11: ['iso-8859-11', 'thai'],
    iso8859_13: ['iso-8859-13', 'latin7', 'L7'],
    iso8859_14: ['iso-8859-14', 'latin8', 'L8'],
    iso8859_15: ['iso-8859-15', 'latin9', 'L9'],
    iso8859_16: ['iso-8859-16', 'latin10', 'L10'],
    johab: ['cp1361', 'ms1361'],
    kz1048: ['kz_1048', 'strk1048_2002', 'rk1048'],
    mac_cyrillic: ['maccyrillic'],
    mac_greek: ['macgreek'],
    mac_iceland: ['maciceland'],
    mac_latin2: ['maclatin2', 'maccentraleurope', 'mac_centeuro'],
    mac_roman: ['macroman', 'macintosh'],
    mac_turkish: ['macturkish'],
    ptcp154: ['csptcp154', 'pt154', 'cp154', 'cyrillic-asian'],
    shift_jis: ['csshiftjis', 'shiftjis', 'sjis', 's_jis'],
    shift_jis_2004: ['shiftjis2004', 'sjis_2004', 'sjis2004'],
    shift_jisx0213: ['shiftjisx0213', 'sjisx0213', 's_jisx0213'],
    utf_32: ['U32', 'utf32'],
    utf_32_be: ['UTF-32BE'],
    utf_32_le: ['UTF-32LE'],
    utf_16: ['U16', 'utf16'],
    utf_16_be: ['UTF-16BE'],
    utf_16_le: ['UTF-16LE'],
    utf_7: ['U7', 'unicode-1-1-utf-7'],
    utf_8: ['U8', 'UTF', 'utf8', 'cp65001'],
    mbcs: ['ansi', 'dbcs'],
    bz2_codec: ['bz2'],
    hex_codec: ['hex'],
    quopri_codec: ['quopri', 'quotedprintable', 'quoted_printable'],
    uu_codec: ['uu'],
    zlib_codec: ['zip', 'zlib'],
    rot_13: ['rot13']
}

var codecs_aliases = {}
for(var name in aliases){
    for(var alias of aliases[name]){
        codecs_aliases[alias.toLowerCase().replace(/-/g, '_')] = name
    }
}

function normalise(encoding){
    // lowercase, replace " " and "-" by "-"
    var enc = encoding.toLowerCase()
                      .replace(/ /g, '_')
                      .replace(/-/g, '_')
    // replace aliases by name, eg 'rot13' by 'rot_13'
    if(codecs_aliases[enc] !== undefined){
        enc = codecs_aliases[enc]
    }
    return enc
}

function load_decoder(enc){
    // load table from Lib/encodings/<enc>.py
    if(to_unicode[enc] === undefined){
        var mod = _b_.__import__("encodings." + enc)
        if(mod[enc].getregentry){
            to_unicode[enc] = $B.$getattr(mod[enc].getregentry(),
                "decode")
        }
    }
}

function load_encoder(enc){
    // load table from encodings/<enc>.py
    if(from_unicode[enc] === undefined){
        var mod = _b_.__import__("encodings." + enc)
        if(mod[enc].getregentry){
            from_unicode[enc] = $B.$getattr(mod[enc].getregentry(),
                "encode")
        }
    }
}

var decode = $B.decode = function(obj, encoding, errors){
    var s = "",
        b = obj.source,
        enc = normalise(encoding)
    switch(enc) {
      case "utf_8":
      case "utf-8":
      case "utf8":
      case "U8":
      case "UTF":
          if(globalThis.TextDecoder){
              var decoder = new TextDecoder('utf-8', {fatal: true}),
                  array = new Uint8Array(b)
              try{
                  return decoder.decode(array)
              }catch(err){
                  // handled below; TextDecoder doesn't provide the same
                  // information as Python
              }
          }
          var pos = 0,
              err_info
          while(pos < b.length){
              let byte = b[pos]
              err_info = null
              if(!(byte & 0x80)){
                  // Most significant bit = 0
                  s += String.fromCodePoint(byte)
                  pos++
              }else if((byte >> 5) == 6){
                  // Expect 2 bytes with the 2nd of the form 10xxxxxx
                  if(b[pos + 1] === undefined){
                      err_info = [byte, pos, "end"]
                  }else if((b[pos + 1] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation"]
                  }
                  if(err_info !== null){
                      if(errors == "ignore"){
                          pos++
                      }else{
                          $B.RAISE(_b_.UnicodeDecodeError,
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      let cp = byte & 0x1f
                      cp <<= 6
                      cp += b[pos + 1] & 0x3f
                      s += String.fromCodePoint(cp)
                      pos += 2
                  }
              }else if((byte >> 4) == 14){
                  // 3 bytes with the 2nd and 3d of the form 10xxxxxx
                  if(b[pos + 1] === undefined){
                      err_info = [byte, pos, "end", pos + 1]
                  }else if((b[pos + 1] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation", pos + 2]
                  }else if(b[pos + 2] === undefined){
                      err_info = [byte, pos + '-' + (pos + 1), "end", pos + 2]
                  }else if((b[pos + 2] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation", pos + 3]
                  }
                  if(err_info !== null){
                      if(errors == "ignore"){
                          pos = err_info[3]
                      }else if(errors == "surrogateescape"){
                          for(let i = pos; i < err_info[3]; i++){
                              s += String.fromCodePoint(0xdc80 + b[i] - 0x80)
                          }
                          pos = err_info[3]
                      }else{
                          $B.RAISE(_b_.UnicodeDecodeError,
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      let cp = byte & 0xf
                      cp = cp << 12
                      cp += (b[pos + 1] & 0x3f) << 6
                      cp += b[pos + 2] & 0x3f
                      s += String.fromCodePoint(cp)
                      pos += 3
                  }
              }else if((byte >> 3) == 30){
                  // 4 bytes, 1st of the form 11110xxx and 3 next 10xxxxxx
                  if(b[pos + 1] === undefined){
                      err_info = [byte, pos, "end", pos + 1]
                  }else if((b[pos + 1] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation", pos + 2]
                  }else if(b[pos + 2] === undefined){
                      err_info = [byte, pos + '-' + (pos + 1), "end", pos + 2]
                  }else if((b[pos + 2] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation", pos + 3]
                  }else if(b[pos + 3] === undefined){
                      err_info = [byte,
                                  pos + '-' + (pos + 1) + '-' + (pos + 2),
                                  "end", pos + 3]
                  }
                  if(err_info !== null){
                      if(errors == "ignore"){
                          pos = err_info[3]
                      }else if(errors == "surrogateescape"){
                          for(let i = pos; i < err_info[3]; i++){
                              s += String.fromCodePoint(0xdc80 + b[i] - 0x80)
                          }
                          pos = err_info[3]
                      }else{
                          $B.RAISE(_b_.UnicodeDecodeError,
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      let cp = byte & 0xf
                      cp = cp << 18
                      cp += (b[pos + 1] & 0x3f) << 12
                      cp += (b[pos + 2] & 0x3f) << 6
                      cp += (b[pos + 3] & 0x3f)
                      s += String.fromCodePoint(cp)
                      pos += 4
                  }

              }else{
                  if(errors == "ignore"){
                      pos++
                  }else if(errors == "surrogateescape"){
                      s += String.fromCodePoint(0xdc80 + b[pos] - 0x80)
                      pos++
                  }else{
                      $B.RAISE(_b_.UnicodeDecodeError,
                          "'utf-8' codec can't decode byte 0x" +
                          byte.toString(16) + " in position " + pos +
                          ": invalid start byte")
                  }
              }
          }
          return s
      case "latin_1":
      case "windows1252":
      case "iso-8859-1":
      case "iso8859-1":
      case "8859":
      case "cp819":
      case "latin":
      case "latin1":
      case "L1":
          b.forEach(function(item){
              s += String.fromCharCode(item)
          })
          break
      case "unicode_escape":
          // obj is str or bytes
          if([bytes, bytearray].includes($B.get_class(obj))){
              obj = decode(obj, "latin-1", "strict")
          }
          return obj.replace(/\\n/g, "\n").
                   replace(/\\a/g, "\u0007").
                   replace(/\\b/g, "\b").
                   replace(/\\f/g, "\f").
                   replace(/\\t/g, "\t").
                   replace(/\\'/g, "'").
                   replace(/\\"/g, '"')
      case "raw_unicode_escape":
          if([bytes, bytearray].includes($B.get_class(obj))){
              obj = decode(obj, "latin-1", "strict")
          }
          return obj.replace(/\\u([a-fA-F0-9]{4})/g, function(mo){
              let cp = parseInt(mo.substr(2), 16)
              return String.fromCharCode(cp)
          })
      case "ascii":
          for(let i = 0, len = b.length; i < len; i++){
              let cp = b[i]
              if(cp <= 127){
                  s += String.fromCharCode(cp)
              }else{
                  if(errors == "ignore"){
                      // ignore
                  }else if(errors == "backslashreplace"){
                      s += '\\x' + cp.toString(16)
                  }else{
                      let msg = "'ascii' codec can't decode byte 0x" +
                        cp.toString(16) + " in position " + i +
                        ": ordinal not in range(128)"
                      $B.RAISE(_b_.UnicodeDecodeError, msg)
                  }
              }
          }
          break
      default:
          try{
              load_decoder(enc)
          }catch(err){
              $B.RAISE(_b_.LookupError, "unknown encoding: " + enc)
          }
          var decoded = to_unicode[enc](obj)[0]
          for(let i = 0, len = decoded.length; i < len; i++){
              if(decoded.codePointAt(i) == 0xfffe){
                  $B.RAISE(_b_.UnicodeDecodeError, "'charmap' codec " +
                      `can't decode byte ${_hex(b[i])} in position ${i}: ` +
                      "character maps to <undefined>")
              }
          }
          return decoded
    }
    return s
}

var encode = $B.encode = function(){
    var $ = $B.args("encode", 3, {s: null, encoding: null, errors: null},
        ["s", "encoding", "errors"],
        arguments, {encoding: "utf-8", errors:"strict"}, null, null),
        s = $.s,
        encoding = $.encoding,
        errors = $.errors
    var t = [],
        pos = 0,
        enc = normalise(encoding)

    switch(enc) {
        case "utf-8":
        case "utf_8":
        case "utf8":
            if(globalThis.TextEncoder){
                var encoder = new TextEncoder('utf-8', {fatal: true})
                try{
                    var array = encoder.encode(s)
                    return fast_bytes(Array.from(array))
                }catch(err){
                    // handled below; TextDecoder doesn't provide the same
                    // information as Python
                }
            }
            for(let i = 0, len = s.length; i < len; i++){
                let cp = s.charCodeAt(i)
                if(cp <= 0x7f){
                    t.push(cp)
                }else if(cp <= 0x7ff){
                    t.push(0xc0 + (cp >> 6),
                             0x80 + (cp & 0x3f))
                }else if(cp <= 0xffff){
                    t.push(0xe0 + (cp >> 12),
                             0x80 + ((cp & 0xfff) >> 6),
                             0x80 + (cp & 0x3f))
                }else{
                    console.log("4 bytes")
                }
            }
            break
        case "latin":
        case "latin1":
        case "latin-1":
        case "latin_1":
        case "L1":
        case "iso8859_1":
        case "iso_8859_1":
        case "8859":
        case "cp819":
        case "windows1252":
            for(let i = 0, len = s.length; i < len; i++){
                let cp = s.charCodeAt(i) // code point
                if(cp <= 255){
                    t[pos++] = cp
                }else if(errors != "ignore"){
                    $UnicodeEncodeError(encoding, i)
                }
            }
            break
        case "ascii":
          for(let i = 0, len = _b_.str.mp_length(s); i < len; i++){
              let cp = s.charCodeAt(i), // code point
                  char = _b_.str.mp_subscript(s, i)
              if(cp <= 127){
                  t[pos++] = cp
              }else if(errors == "backslashreplace"){
                  let hex = _b_.hex(_b_.ord(char))
                  if(hex.length < 5){
                      hex = '\\x' + '0'.repeat(4 - hex.length) + hex.substr(2)
                  }else if(hex.length < 7){
                      hex = '\\u' + '0'.repeat(6 - hex.length) + hex.substr(2)
                  }else{
                      hex = '\\U' + '0'.repeat(10 - hex.length) + hex.substr(2)
                  }
                  for(let char of hex){
                      t[pos++] = char.charCodeAt(0)
                  }
              }else if(errors !== 'ignore'){
                  $UnicodeEncodeError(encoding, i)
              }
          }
          break
        case "raw_unicode_escape":
          for(let i = 0, len = s.length; i < len; i++){
              let cp = s.charCodeAt(i) // code point
              if(cp < 256){
                  t[pos++] = cp
              }else{
                  let us = cp.toString(16)
                  if(us.length % 2){
                      us = "0" + us
                  }
                  us = "\\u" + us
                  for(let j = 0; j < us.length; j++){
                      t[pos++] = us.charCodeAt(j)
                  }
              }
          }
          break
        default:
            try{
                load_encoder(enc)
            }catch(err){
                $B.RAISE(_b_.LookupError, "unknown encoding: " + encoding)
            }
            return from_unicode[enc](s)[0]
    }
    return fast_bytes(t)
}

function fast_bytes(t){
    return {
        ob_type: _b_.bytes,
        source: t ?? []
    }
}

$B.fast_bytes = fast_bytes

bytes.$factory = function(){
    return bytes.tp_new.bind(null, bytes).apply(null, arguments)
}

/* bytes start */
_b_.bytes.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, _b_.bytes)){
        return _b_.NotImplemented
    }
    return _b_.list.tp_richcompare(
        $B.$list(self.source), $B.$list(other.source), op)
}

_b_.bytes.nb_multiply = function(){
    var $ = $B.args('__mul__', 2, {self: null, other: null}, ['self', 'other'],
        arguments, {}, null, null),
        other = $B.PyNumber_Index($.other)
    var t = [],
        source = $.self.source,
        slen = source.length
    for(var i = 0; i < other; i++){
        for(var j = 0; j < slen; j++){
            t.push(source[j])
        }
    }
    var res = bytes.$factory()
    res.source = t
    return res
}

_b_.bytes.nb_remainder = function(){
    return nb_remainder.apply(null, arguments)
}

_b_.bytes.tp_repr = function(self){
    var t = $B.special_string_repr, // in brython_builtins.js
        res = ""
    for(var i = 0, len = self.source.length; i < len; i++){
        var s = self.source[i]
        if(t[s] !== undefined){
            res += t[s]
        }else if(s < 32 || s >= 128){
            var hx = s.toString(16)
            hx = (hx.length == 1 ? '0' : '') + hx
            res += '\\x' + hx
        }else if(s == "\\".charCodeAt(0)){
            res += "\\\\"
        }else{
            res += String.fromCharCode(s)
        }
    }
    if(res.indexOf("'") > -1 && res.indexOf('"') == -1){
        return 'b"' + res + '"'
    }else{
        return "b'" + res.replace(new RegExp("'", "g"), "\\'")  + "'"
    }
}

_b_.bytes.tp_hash = function(self){
    if(self === undefined){
        return bytes.__hashvalue__ || $B.$py_next_hash--  // for hash of str$
    }

    //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-$
    // this implementation for strings maybe good enough for us..
    var hash = 1
    for(var i = 0, len = self.source.length; i < len; i++){
        hash = (101 * hash + self.source[i]) & 0xFFFFFFFF
    }

    return hash
}

_b_.bytes.tp_str = function(self){
    return _b_.bytes.tp_repr(self)
}

_b_.bytes.tp_iter = function(self){
    return {
        ob_type: bytes_iterator,
        it: self.source[Symbol.iterator]()
    }
}

_b_.bytes.tp_new = function(){
    var missing = {},
        $ = $B.args("__new__", 4,
            {cls: null, source: null, encoding: null, errors: null},
            ["cls", "source", "encoding", "errors"], arguments,
            {source: missing, encoding: missing, errors: missing}, null, null),
        source = $.source
    if($.source === missing){
        return {
            ob_type: $.cls,
            source: []
        }
    }else if(typeof $.source == "string" || $B.$isinstance($.source, _b_.str)){
        if($.encoding === missing){
            $B.RAISE(_b_.TypeError, 'string argument without an encoding')
        }
        $.errors = $.errors === missing ? 'strict' : $.errors
        let res = encode($.source, $.encoding, $.errors)
        if(! $B.$isinstance(res, bytes)){
            $B.RAISE(_b_.TypeError, `'${$.encoding}' codec returns ` +
                `${$B.class_name(res)}, not bytes`)
        }
        // encode returns bytes
        res.ob_type = $.cls
        return res
    }
    if($.encoding !== missing){
        $B.RAISE(_b_.TypeError, "encoding without a string argument")
    }
    if(typeof $.source == "number" || $B.$isinstance($.source, _b_.int)){
        var size = $B.PyNumber_Index($.source)
        source = []
        for(var i = 0; i < size; i++){
            source[i] = 0
        }
    }else if($B.$isinstance($.source, [_b_.bytes, _b_.bytearray])){
        source = $.source.source
    }else if($B.$isinstance($.source, _b_.memoryview)){
        source = $.source.obj.source
    }else if($B.imported.array && $B.$isinstance($.source, $B.imported.array.array)){
        source = $B.imported.array.array.tobytes($.source).source
    }else{
        var int_list
        if(Array.isArray($.source)){
            int_list = $.source
        }else{
            try{
                int_list = _b_.list.$factory($.source)
            }catch(err){
                var bytes_method = $B.$getattr(source, '__bytes__', _b_.None)
                if(bytes_method === _b_.None){
                    $B.RAISE(_b_.TypeError, "cannot convert " +
                        `'${$B.class_name(source)}' object to bytes`)
                }
                let res = $B.$call(bytes_method)
                if(! $B.$isinstance(res, _b_.bytes)){
                    $B.RAISE(_b_.TypeError, `__bytes__ returned ` +
                        `non-bytes (type ${$B.class_name(res)})`)
                }
                if(res.source === undefined){
                    console.log('!!!!!!!', $.source)
                }
                return res
            }
        }
        source = []
        for(var item of int_list){
            item = $B.PyNumber_Index(item)
            if(item >= 0 && item < 256){
                source.push(item)
            }else{
                $B.RAISE(_b_.ValueError,
                    "bytes must be in range (0, 256)")
            }
        }
    }
    if(source === undefined){
        console.log('bytes.__new__, no source', $.source)
    }
    return {
        ob_type: $.cls,
        source
    }
}

_b_.bytes.mp_length = function(self){
    return self.source.length
}

_b_.bytes.mp_subscript = function(self, arg){
    if($B.$isinstance(arg, _b_.int)){
        arg = _b_.int.$int_value(arg)
        let pos = arg
        if(arg < 0){
            pos = self.source.length + pos
        }
        if(pos >= 0 && pos < self.source.length){
            return self.source[pos]
        }
        $B.RAISE(_b_.IndexError, "index out of range")
    }else if($B.$isinstance(arg, _b_.slice)){
        let s = _b_.slice.$conv_for_seq(arg, self.source.length),
            start = s.start,
            stop = s.stop,
            step = s.step
        let res = [],
            pos = 0
        if(step > 0){
            stop = Math.min(stop, self.source.length)
            if(stop <= start){
                return bytes.$factory([])
            }
            for(let i = start; i < stop; i += step){
                res[pos++] = self.source[i]
            }
        }else{
            if(stop >= start){
                return bytes.$factory([])
            }
            stop = Math.max(0, stop)
            for(let i = start; i >= stop; i += step){
                res[pos++] = self.source[i]
            }
        }
        return bytes.$factory(res)
    }
    $B.RAISE(_b_.TypeError,
        `byte indices must be integers or slices, not ${$B.class_name(arg)}`
    )
}

_b_.bytes.sq_concat = function(self, other){
    var $ = $B.args('__add__', 2, {self: null, other: null}, ['self', 'other'],
                arguments, {}, null, null)
    var self = $.self,
        other = $.other
    if(! is_bytes_like(other)){
        $B.RAISE(_b_.TypeError, `can't concat ${$B.class_name(other)} to bytes`)
    }
    return {
        ob_type: $B.get_class(self),
        source: self.source.concat(get_list_from_bytes_like(other))
    }
}

_b_.bytes.sq_contains = function(self, other){
    if(typeof other == "number"){
        return self.source.indexOf(other) > -1
    }
    if(self.source.length < other.source.length){
        return false
    }
    var len = other.source.length
    for(var i = 0; i < self.source.length - other.source.length + 1; i++){
        var flag = true
        for(var j = 0; j < len; j++){
            if(other.source[i + j] != self.source[j]){
                flag = false
                break
            }
        }
        if(flag){
            return true
        }
    }
    return false
}

_b_.bytes.bf_getbuffer = function(self, flags){
    return $B.$call(_b_.memoryview, self)
}

var bytes_funcs = _b_.bytes.tp_funcs = {}

bytes_funcs.__bytes__ = function(self){
    if($B.exact_type(self, _b_.bytes)){
        return self
    }
    return {
        ob_type: _b_.bytes,
        source: self.source.slice()
    }
}

bytes_funcs.__getnewargs__ = function(self){
    return bytes.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

bytes_funcs.capitalize = function(self){
    return capitalize.apply(null, arguments)
}

bytes_funcs.center = function(self){
    return center.apply(null, arguments)
}

bytes_funcs.count = function(self){
    return count.apply(null, arguments)
}

bytes_funcs.decode = function(self){
    return decode.apply(null, arguments)
}

bytes_funcs.endswith = function(self){
    return endswith.apply(null, arguments)
}

bytes_funcs.expandtabs = function(self){
    return expandtabs.apply(null, arguments)
}

bytes_funcs.find = function(self, sub){
    return find.apply('find', arguments)
}

bytes_funcs.fromhex = function(self){
    return fromhex.apply(null, arguments)
}

bytes_funcs.hex = function(){
    return hex.apply(null, arguments)
}

bytes_funcs.index = function(){
    var $ = $B.args('index', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)
    var index = bytes_funcs.find($.self, $.sub, $.start, $.end)
    if(index == -1){
        $B.RAISE(_b_.ValueError, "subsection not found")
    }
    return index
}

bytes_funcs.isalnum = function(){
    return isalnum.apply(null, arguments)
}

bytes_funcs.isalpha = function(){
    return isalpha.apply(null, arguments)
}

bytes_funcs.isascii = function(){
    return isascii.apply(null, arguments)
}

bytes_funcs.isdigit = function(){
    return isdigit.apply(null, arguments)
}

bytes_funcs.islower = function(){
    return islower.apply(null, arguments)
}

bytes_funcs.isspace = function(){
    return isspace.apply(null, arguments)
}

bytes_funcs.istitle = function(){
    return istitle.apply(null, arguments)
}

bytes_funcs.isupper = function(){
    return isupper.apply(null, arguments)
}

bytes_funcs.join = function(){
    var $ns = $B.args('join', 2, {self: null, iterable: null},
            ['self', 'iterable'], arguments, {}),
        self = $ns['self'],
        iterable = $ns['iterable']

    var res = $B.get_class(self).$factory(),
        empty = true
    for(var item of $B.make_js_iterator(iterable)){
        if(empty){
            empty = false
        }else{
            res = bytes.sq_concat(res, self)
        }
        res = bytes.sq_concat(res, item)
    }
    return res
}

bytes_funcs.ljust = function(){
    var $ = $B.args('ljust', 3, {self: null, width: null, fillbyte: null},
        ['self', 'width', 'fillbyte'], arguments,
        {fillbyte: bytes.$factory([32])}, null, null)

    check_buffer($.fillbyte)

    var padding = [],
        count = $.width - $.self.source.length
    for(var i = 0; i < count; ++i){
        padding.push($.fillbyte.source[0])
    }
    return bytes.$factory($.self.source.concat(padding))
}

bytes_funcs.lower = function(self){
    var _res = [],
        pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _lower(self.source[i])}
    }
    return bytes.$factory(_res)

}

bytes_funcs.lstrip = function(self, cars){
    return _strip(self, cars, 'l')
}

bytes_funcs.maketrans = function(from, to) {
    var _t = []
    to = $B.to_bytes(to)
    // make 'default' translate table
    for(let i = 0; i < 256; i++){
        _t[i] = i
    }

    // make substitution in the translation table
    for(let i = 0, len = from.source.length; i < len; i++){
       var _ndx = from.source[i]     //retrieve ascii code of char
       _t[_ndx] = to[i]
    }

    // return the bytes object associated to the 256-elt list
    return bytes.$factory(_t)
}

bytes_funcs.partition = function(){
    var $ = $B.args('partition', 2, {self:null, sep:null}, ['self', 'sep'],
            arguments, {}, null, null)

    check_buffer($.sep)

    var len = $.sep.source.length,
        src = $.self.source,
        i = bytes_funcs.find($.self, $.sep)

    return _b_.tuple.$factory([
        bytes.$factory(src.slice(0, i)),
        bytes.$factory(src.slice(i, i + len)),
        bytes.$factory(src.slice(i + len))
    ])
}

bytes_funcs.removeprefix = function(){
    return removeprefix.apply(null, arguments)
}

bytes_funcs.removesuffix = function(){
    return removesuffix.apply(null, arguments)
}

bytes_funcs.replace = function(){
    var $ = $B.args('replace', 4,
        {self: null, old: null, new: null, count: null},
        ['self', 'old', 'new', 'count'],
        arguments, {count: -1}, null, null),
        res = []
    var self = $.self,
        src = self.source,
        len = src.length,
        old = $.old,
        $new = $.new
    var count = $.count >= 0 ? $.count : src.length

    check_buffer($.old)
    check_buffer($.new)

    for(var i = 0; i < len; i++){
        if(bytes_funcs.startswith(self, old, i) && count){
            for(var j = 0; j < $new.source.length; j++){
                res.push($new.source[j])
            }
            i += (old.source.length - 1)
            count--
        }else{
            res.push(src[i])
        }
    }
    return bytes.$factory(res)
}

bytes_funcs.rfind = function(){
    return find.apply('rfind', arguments)
}

bytes_funcs.rindex = function() {
    var $ = $B.args('rfind', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)

    var index = bytes_funcs.rfind($.self, $.sub, $.start, $.end)
    if(index == -1){
        $B.RAISE(_b_.ValueError, "subsection not found")
    }
    return index
}

bytes_funcs.rjust = function() {
    var $ = $B.args('rjust', 3, {self: null, width: null, fillbyte: null},
        ['self', 'width', 'fillbyte'], arguments,
        {fillbyte: bytes.$factory([32])}, null, null)

    check_buffer($.fillbyte)

    var padding = [],
        count = $.width - $.self.source.length
    for(var i = 0; i < count; ++i){
        padding.push($.fillbyte.source[0])
    }
    return bytes.$factory(padding.concat($.self.source))
}

bytes_funcs.rpartition = function() {
    var $ = $B.args('rpartition', 2, {self:null, sep:null}, ['self', 'sep'],
            arguments, {}, null, null)

    check_buffer($.sep)

    var len = $.sep.source.length,
        src = $.self.source,
        i = bytes_funcs.rfind($.self, $.sep)

    return _b_.tuple.$factory([
        bytes.$factory(src.slice(0, i)),
        bytes.$factory(src.slice(i, i + len)),
        bytes.$factory(src.slice(i + len))
    ])
}

bytes_funcs.rsplit = function(self){
    var $ = $B.args('rsplit', 3, {self:null, sep:null, maxsplit: null},
                ['self', 'sep', 'maxsplit'], arguments,
                {sep: _b_.None, maxsplit: -1}, null, null)
    var self = $.self,
        sep = $.sep,
        maxsplit = $.maxsplit
    var reversed_self = $B.fast_bytes(self.source.toReversed())
    if(! $B.$isinstance(maxsplit, _b_.int)){
        $B.RAISE(_b_.ValueError,
            `maxsplit should be int, not ${$B.class_name(maxsplit)}`
        )
    }
    var parts = [] // array of arrays of bytes
    if(sep === _b_.None){
        parts = bytes_split_with_whitespace(self, maxsplit)
    }else{
        if($B.$getattr(sep, '__buffer__', $B.NULL) === $B.NULL){
            $B.RAISE(_b_.TypeError,
                `a bytes-like object is required, not '${$B.class_name(sep)}'`
            )
        }
        var reversed_seps = Array.from($B.make_js_iterator(sep)).reverse()
        parts = bytes_split_with_sep(reversed_self, reversed_seps, maxsplit)
    }
    // restore order
    parts.reverse()
    for(part of parts){
        part.reverse()
    }
    parts = parts.map(t => $B.fast_bytes(t))
    return $B.$list(parts)
}

bytes_funcs.rstrip = function(self, cars){
    return _strip(self, cars, 'r')
}

bytes_funcs.split = function(self){
    var $ = $B.args('split', 3, {self:null, sep:null, maxsplit: null},
                ['self', 'sep', 'maxsplit'], arguments,
                {sep: _b_.None, maxsplit: -1}, null, null)
    var self = $.self,
        sep = $.sep,
        maxsplit = $.maxsplit
    if(! $B.$isinstance(maxsplit, _b_.int)){
        $B.RAISE(_b_.ValueError,
            `maxsplit should be int, not ${$B.class_name(maxsplit)}`
        )
    }
    var parts = [] // array of arrays of bytes
    if(sep === _b_.None){
        parts = bytes_split_with_whitespace(self, maxsplit)
    }else{
        if($B.$getattr(sep, '__buffer__', $B.NULL) === $B.NULL){
            $B.RAISE(_b_.TypeError,
                `a bytes-like object is required, not '${$B.class_name(sep)}'`
            )
        }
        var seps = Array.from($B.make_js_iterator(sep))
        parts = bytes_split_with_sep($.self, seps, maxsplit)
    }
    parts = parts.map(t => $B.fast_bytes(t))
    return $B.$list(parts)
}

bytes_funcs.splitlines = function(self){
    var $ = $B.args('splitlines', 2, {self: null, keepends: null},
                    ['self', 'keepends'], arguments, {keepends: false},
                    null, null)
    if(!$B.$isinstance($.keepends,[_b_.bool, _b_.int])){
        throw _b_.TypeError('integer argument expected, got '+
            $B.get_class($.keepends).__name)
    }
    var keepends = _b_.int.$factory($.keepends),
        res = $B.$list([]),
        source = $.self.source,
        start = 0,
        pos = 0
    if(! source.length){
        return res
    }
    while(pos < source.length){
        if (pos < source.length - 1 && source[pos] == 0x0d &&
                source[pos + 1] == 0x0a){
            res.push(bytes.$factory(source.slice(start, keepends ? pos + 2 : pos)))
            start = pos = pos + 2
        }else if(source[pos] == 0x0d || source[pos] == 0x0a){
            res.push(bytes.$factory(source.slice(start, keepends ? pos + 1 : pos)))
            start = pos = pos + 1
        }else{
            pos++
        }
    }
    if(start < source.length){
        res.push(bytes.$factory(source.slice(start)))
    }
    return $B.$list(res)
}

bytes_funcs.startswith = function(self){
    var $ = $B.args('startswith', 3, {self: null, prefix: null, start:null},
        ['self', 'prefix', 'start'], arguments, {start:0}, null, null),
        start = $.start
    if($B.$isinstance($.prefix, bytes)){
        let res = true
        for(let i = 0; i < $.prefix.source.length && res; i++){
            res = $.self.source[start + i] == $.prefix.source[i]
        }
        return res
    }else if($B.$isinstance($.prefix, _b_.tuple)){
        let items = []
        for(let i = 0; i < $.prefix.length; i++){
            if($B.$isinstance($.prefix[i], bytes)){
                items = items.concat($.prefix[i].source)
            }else{
                $B.RAISE(_b_.TypeError, "startswith first arg must be " +
                    "bytes or a tuple of bytes, not " +
                    $B.class_name($.prefix))
            }
        }
        let prefix = bytes.$factory(items)
        return bytes_funcs.startswith($.self, prefix, start)
    }else{
        $B.RAISE(_b_.TypeError, "startswith first arg must be bytes " +
            "or a tuple of bytes, not " + $B.class_name($.prefix))
    }
}

bytes_funcs.strip = function(self, cars){
    var res = bytes_funcs.lstrip(self, cars)
    return bytes_funcs.rstrip(res, cars)
}

bytes_funcs.swapcase = function(self){
    var src = self.source,
        len = src.length,
        buffer = src.slice()

    for(var i = 0; i < len; ++i){
        if(buffer[i] > 96 && buffer[i] < 123){
            buffer[i] -= 32
        }else if (buffer[i] > 64 && buffer[i] < 91){
            buffer[i] += 32
        }
    }

    return bytes.$factory(buffer)
}

bytes_funcs.title = function(self){
    var src = self.source,
        len = src.length,
        buffer = src.slice(),
        current_char_is_letter = false,
        prev_char_was_letter = false,
        is_uppercase = false,
        is_lowercase = false

    for(var i = 0; i < len; ++i){
        is_lowercase = buffer[i] > 96 && buffer[i] < 123
        is_uppercase = buffer[i] > 64 && buffer[i] < 91
        current_char_is_letter = is_lowercase || is_uppercase

        if(current_char_is_letter){
            if(prev_char_was_letter && is_uppercase){
                buffer[i] += 32
            }else if(! prev_char_was_letter && is_lowercase){
                buffer[i] -= 32
            }
        }
        prev_char_was_letter = current_char_is_letter
    }

    return bytes.$factory(buffer)
}

bytes_funcs.translate = function(self, table, _delete) {
    if(_delete === undefined){
        _delete = []
    }else if($B.$isinstance(_delete, bytes)){
        _delete = _delete.source
    }else{
        $B.RAISE(_b_.TypeError, "Type " +
            $B.get_class(_delete).__name + " doesn't support the buffer API")
    }
    var res = [],
        pos = 0
    if($B.$isinstance(table, bytes) && table.source.length == 256){
       for(var i = 0, len = self.source.length; i < len; i++){
           if(_delete.indexOf(self.source[i]) > -1){continue}
           res[pos++] = table.source[self.source[i]]
       }
    }
    return bytes.$factory(res)
}

bytes_funcs.upper = function(self){
    return upper.apply(null, arguments)
}

bytes_funcs.zfill = function(self, width) {
    var buffer = self.source.slice(),
        prefix_offset = (buffer[0] == 43 || buffer[0] == 45) ? 1 : 0

    var count = width - self.source.length
    var padding = []
    for(var i = 0; i < count; ++i){
        padding.push(48)
    }
    buffer.splice.apply(buffer, [prefix_offset, 0].concat(padding))

    return bytes.$factory(buffer)
}

_b_.bytes.tp_methods = ["__getnewargs__", "__bytes__", "capitalize", "center", "count", "decode", "endswith", "expandtabs", "find", "hex", "index", "isalnum", "isalpha", "isascii", "isdigit", "islower", "isspace", "istitle", "isupper", "join", "ljust", "lower", "lstrip", "partition", "replace", "removeprefix", "removesuffix", "rfind", "rindex", "rjust", "rpartition", "rsplit", "rstrip", "split", "splitlines", "startswith", "strip", "swapcase", "title", "translate", "upper", "zfill"]

_b_.bytes.classmethods = ["fromhex"]

_b_.bytes.staticmethods = ["maketrans"]

/* bytes end */


$B.set_func_names(bytes, "builtins")

$B.bytes_decode = _b_.bytes.tp_funcs.decode // used in py_string.js

})(__BRYTHON__);
