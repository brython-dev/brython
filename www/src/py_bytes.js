"use strict";

;(function($B){

var _b_ = $B.builtins

var from_unicode = {},
    to_unicode = {}

function bytes_value(obj){
    return obj.__class__ === bytes ? obj : fast_bytes(obj.source)
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
            res = $B.$call(ga)().source
        }else{
            throw _b_.TypeError.$factory("object doesn't support the buffer protocol")
        }
    }
    return res
}

function _strip(self, cars, lr){
    if(cars === undefined){
        cars = []
        var ws = '\r\n \t'
        for(var i = 0, len = ws.length; i < len; i++){
            cars.push(ws.charCodeAt(i))
        }
    }else if($B.$isinstance(cars, bytes)){
        cars = cars.source
    }else{
        throw _b_.TypeError.$factory("Type str doesn't support the buffer API")
    }
    if(lr == 'l'){
        for(var i = 0, len = self.source.length; i < len; i++){
            if(cars.indexOf(self.source[i]) == -1){break}
        }
        return bytes.$factory(self.source.slice(i))
    }
    for(var i = self.source.length - 1; i >= 0; i--){
       if(cars.indexOf(self.source[i]) == -1){break}
    }
    return bytes.$factory(self.source.slice(0, i + 1))
}

function invalid(other){
    return ! $B.$isinstance(other, [bytes, bytearray])
}

//bytearray() (built in class)
var bytearray = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __qualname__: 'bytearray',
    $buffer_protocol: true,
    $is_class: true
}

var mutable_methods = ["__delitem__", "clear", "copy", "count", "index",
    "pop", "remove", "reverse"]

for(var method of mutable_methods){
    bytearray[method] = (function(m){
        return function(self){
            var args = [self.source], pos = 1
            for(var i = 1, len = arguments.length; i < len; i++){
                args[pos++] = arguments[i]
            }
            return _b_.list[m].apply(null, args)
        }
    })(method)
}

bytearray.__hash__ = _b_.None

var bytearray_iterator = $B.make_iterator_class('bytearray_iterator')
bytearray.__iter__ = function(self){
    return bytearray_iterator.$factory(self.source)
}

bytearray.__mro__ = [_b_.object]

bytearray.__repr__ = bytearray.__str__ = function(self){
    return 'bytearray(' + bytes.__repr__(self) + ")"
}

bytearray.__setitem__ = function(self, arg, value){
    if($B.$isinstance(arg, _b_.int)){
        if(! $B.$isinstance(value, _b_.int)){
            throw _b_.TypeError.$factory('an integer is required')
        }else if(value > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        var pos = arg
        if(arg < 0){
            pos = self.source.length + pos
        }
        if(pos >= 0 && pos < self.source.length){
            self.source[pos] = value
        }else{
            throw _b_.IndexError.$factory('list index out of range')
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

        self.source.splice(start, stop - start)

        // copy items in a temporary JS array
        // otherwise, a[:0] = a fails
        try{
            var $temp = _b_.list.$factory(value)
            for(var i = $temp.length - 1; i >= 0; i--){
                if(! $B.$isinstance($temp[i], _b_.int)){
                    throw _b_.TypeError.$factory('an integer is required')
                }else if($temp[i] > 255){
                    throw _b_.ValueError.$factory("byte must be in range(0, 256)")
                }
                self.source.splice(start, 0, $temp[i])
            }
        }catch(err){
            throw _b_.TypeError.$factory("can only assign an iterable")
        }
    }else{
        throw _b_.TypeError.$factory('list indices must be integer, not ' +
            $B.class_name(arg))
    }
}

bytearray.append = function(self, b){
    if(arguments.length != 2){throw _b_.TypeError.$factory(
        "append takes exactly one argument (" + (arguments.length - 1) +
        " given)")
    }
    if(! $B.$isinstance(b, _b_.int)){
        throw _b_.TypeError.$factory("an integer is required")
    }
    if(b > 255){
        throw _b_.ValueError.$factory("byte must be in range(0, 256)")
    }
    self.source[self.source.length] = b
}

bytearray.extend = function(self, b){
    if(self.in_iteration){
        // happens in re.finditer()
        throw _b_.BufferError.$factory("Existing exports of data: object " +
            "cannot be re-sized")
    }
    if(b.__class__ === bytearray || b.__class__ === bytes){
        self.source = self.source.concat(b.source)
        return _b_.None
    }
    for(var item of $B.make_js_iterator(b)){
        bytearray.append(self, $B.PyNumber_Index(item))
    }
    return _b_.None
}

bytearray.insert = function(self, pos, b){
    if(arguments.length != 3){
        throw _b_.TypeError.$factory(
            "insert takes exactly 2 arguments (" + (arguments.length - 1) +
            " given)")
    }
    if(! $B.$isinstance(b, _b_.int)){
        throw _b_.TypeError.$factory("an integer is required")
    }
    if(b > 255){
        throw _b_.ValueError.$factory("byte must be in range(0, 256)")
    }
    _b_.list.insert(self.source, pos, b)
}

bytearray.$factory = function(){
    var args = [bytearray]
    for(var i = 0, len = arguments.length; i < len; i++){
        args.push(arguments[i])
    }
    return bytearray.__new__.apply(null, args)
}

//bytes() (built in function)
var bytes = {
    __class__ : _b_.type,
    __mro__: [_b_.object],
    __qualname__: 'bytes',
    $buffer_protocol: true,
    $is_class: true
}

bytes.__add__ = function(self, other){
    var other_bytes
    if($B.$isinstance(other, [bytes, bytearray])){
        other_bytes = other.source
    }else if($B.$isinstance(other, _b_.memoryview)){
        other_bytes = _b_.memoryview.tobytes(other).source
    }
    if(other_bytes !== undefined){
        return {
            __class__: self.__class__,
            source: self.source.concat(other_bytes)
        }
    }
    throw _b_.TypeError.$factory("can't concat bytes to " +
        _b_.str.$factory(other))
}

bytes.__bytes__ = function(self){
    return self
}

bytes.__contains__ = function(self, other){
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

var bytes_iterator = $B.make_iterator_class("bytes_iterator")
bytes.__iter__ = function(self){
    return bytes_iterator.$factory(self.source)
}

bytes.__eq__ = function(self, other){
    if(invalid(other)){
        return false
    }
    return $B.$getattr(self.source, '__eq__')(other.source)
}

bytes.__ge__ = function(self, other){
    if(invalid(other)){
        return _b_.NotImplemented
    }
    return _b_.list.__ge__(self.source, other.source)
}

// borrowed from py_string.js.
bytes.__getitem__ = function(self, arg){
    var i
    if($B.$isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0){
            pos = self.source.length + pos
        }
        if(pos >= 0 && pos < self.source.length){
            return self.source[pos]
        }
        throw _b_.IndexError.$factory("index out of range")
    }else if($B.$isinstance(arg, _b_.slice)){
        var s = _b_.slice.$conv_for_seq(arg, self.source.length),
            start = s.start,
            stop = s.stop,
            step = s.step
        var res = [],
            i = null,
            pos = 0
        if(step > 0){
            stop = Math.min(stop, self.source.length)
            if(stop <= start){
                return bytes.$factory([])
            }
            for(var i = start; i < stop; i += step){
                res[pos++] = self.source[i]
            }
        }else{
            if(stop >= start){
                return bytes.$factory([])
            }
            stop = Math.max(0, stop)
            for(var i = start; i >= stop; i += step){
                res[pos++] = self.source[i]
            }
        }
        return bytes.$factory(res)
    }else if($B.$isinstance(arg, _b_.bool)){
        return self.source.__getitem__(_b_.int.$factory(arg))
    }
}

bytes.$getnewargs = function(self){
    return $B.fast_tuple([bytes_value(self)])
}

bytes.__getnewargs__ = function(){
    return bytes.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

bytes.__gt__ = function(self, other){
    if(invalid(other)){
        return _b_.NotImplemented
    }
    return _b_.list.__gt__(self.source, other.source)
}

bytes.__hash__ = function(self){
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

bytes.__init__ = function(){
    return _b_.None
}

bytes.__le__ = function(self, other){
    if(invalid(other)){
        return _b_.NotImplemented
    }
    return _b_.list.__le__(self.source, other.source)
}

bytes.__len__ = function(self){
    return self.source.length
}

bytes.__lt__ = function(self, other){
    if(invalid(other)){
        return _b_.NotImplemented
    }
    return _b_.list.__lt__(self.source, other.source)
}

bytes.__mod__ = function(self, args){
    // PEP 461
    var s = decode(self, "latin-1", "strict"),
        res = $B.printf_format(s, 'bytes', args)
    return _b_.str.encode(res, "ascii")
}

bytes.__mul__ = function(){
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

bytes.__ne__ = function(self,other){
    return ! bytes.__eq__(self, other)
}

bytes.__new__ = function(cls, source, encoding, errors){
    var missing = {},
        $ = $B.args("__new__", 4,
            {cls: null, source: null, encoding: null, errors: null},
            ["cls", "source", "encoding", "errors"], arguments,
            {source: missing, encoding: missing, errors: missing}, null, null)
    var source
    if($.source === missing){
        return {
            __class__: $.cls,
            source: []
        }
    }else if(typeof $.source == "string" || $B.$isinstance($.source, _b_.str)){
        if($.encoding === missing){
            throw _b_.TypeError.$factory('string argument without an encoding')
        }
        $.errors = $.errors === missing ? 'strict' : $.errors
        var res = encode($.source, $.encoding, $.errors)
        if(! $B.$isinstance(res, bytes)){
            throw _b_.TypeError.$factory(`'${$.encoding}' codec returns ` +
                `${$B.class_name(res)}, not bytes`)
        }
        // encode returns bytes
        res.__class__ = $.cls
        return res
    }
    if($.encoding !== missing){
        throw _b_.TypeError.$factory("encoding without a string argument")
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
    }else{
        if(Array.isArray($.source)){
            var int_list = $.source
        }else{
            try{
                var int_list = _b_.list.$factory($.source)
            }catch(err){
                var bytes_method = $B.$getattr(source, '__bytes__', _b_.None)
                if(bytes_method === _b_.None){
                    throw _b_.TypeError.$factory("cannot convert " +
                        `'${$B.class_name(source)}' object to bytes`)
                }
                var res = $B.$call(bytes_method)()
                if(! $B.$isinstance(res, _b_.bytes)){
                    throw _b_.TypeError.$factory(`__bytes__ returned ` +
                        `non-bytes (type ${$B.class_name(res)})`)
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
                throw _b_.ValueError.$factory(
                    "bytes must be in range (0, 256)")
            }
        }
    }
    return {
        __class__: $.cls,
        source
    }
}

bytes.$new = function(cls, source, encoding, errors){
    // Create an instance of bytes. Called by methods that have already parsed
    // the arguments.
    var self = {__class__: cls},
        int_list = [],
        pos = 0
    if(source === undefined){
        // empty list
    }else if(typeof source == "number" || $B.$isinstance(source, _b_.int)){
        var i = source
        while(i--){
            int_list[pos++] = 0
        }
    }else{
        if(typeof source == "string" || $B.$isinstance(source, _b_.str)){
            if(encoding === undefined){
                throw _b_.TypeError.$factory("string argument without an encoding")
            }
            int_list = encode(source, encoding || "utf-8", errors || "strict")
        }else{
            if(encoding !== undefined){
                console.log('encoding', encoding)
                throw _b_.TypeError.$factory("encoding without a string argument")
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
                        throw _b_.TypeError.$factory("cannot convert " +
                            `'${$B.class_name(source)}' object to bytes`)
                    }
                    var res = $B.$call(bytes_method)()
                    if(! $B.$isinstance(res, _b_.bytes)){
                        throw _b_.TypeError.$factory(`__bytes__ returned ` +
                            `non-bytes (type ${$B.class_name(res)})`)
                    }
                    return res
                }
                for(var i = 0; i < int_list.length; i++){
                    try{
                        var item = _b_.int.$factory(int_list[i])
                    }catch(err){
                        throw _b_.TypeError.$factory("'" +
                            $B.class_name(int_list[i]) + "' object " +
                            "cannot be interpreted as an integer")
                    }
                    if(item < 0 || item > 255){
                        throw _b_.ValueError.$factory("bytes must be in range" +
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

bytes.__repr__ = bytes.__str__ = function(self){
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

bytes.capitalize = function(self) {
    var src = self.source,
        len = src.length,
        buffer = src.slice()

    if(buffer[0] > 96 && buffer[0] < 123){buffer[0] -= 32}

    for(var i = 1; i < len; ++i){
        if(buffer[i] > 64 && buffer[i] < 91){
            buffer[i] += 32
        }
    }
    return bytes.$factory(buffer)
}

bytes.center = function() {
    var $ = $B.args('center', 3, {self: null, width: null, fillbyte: null},
            ['self', 'width', 'fillbyte'], arguments,
            {fillbyte: bytes.$factory([32])}, null, null)

    var diff = $.width - $.self.source.length
    if(diff <= 0){
        return bytes.$factory($.self.source)
    }
    var ljust = bytes.ljust($.self, $.self.source.length + Math.floor(diff / 2),
        $.fillbyte)
    return bytes.rjust(ljust, $.width, $.fillbyte)
}

bytes.count = function() {
    var $ = $B.args('count', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)

    var n = 0,
        index = -1,
        len = 0

    if(typeof $.sub == "number"){
        if ($.sub < 0 || $.sub > 255)
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        len = 1
    }else if(!$.sub.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name($.sub) + "'")
    }else if(!$.sub.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name($.sub) + "'")
    }else{
        len = $.sub.source.length
    }

    do{
        index = bytes.find($.self, $.sub, Math.max(index + len, $.start), $.end)
        if(index != -1){n++}
    }while(index != -1)

    return n
}

bytes.decode = function(self, encoding,errors){
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

bytes.endswith = function() {
    var $ = $B.args('endswith', 4,
            {self: null, suffix: null, start: null, end: null},
            ['self', 'suffix', 'start', 'end'], arguments,
            {start: -1, end: -1}, null, null)
    if($B.$isinstance($.suffix, bytes)){
        var start = $.start == -1 ?
            $.self.source.length - $.suffix.source.length :
            Math.min($.self.source.length - $.suffix.source.length, $.start)
        var end = $.end == -1 ? $.self.source.length : $.end
        var res = true
        for (var i = $.suffix.source.length - 1, len = $.suffix.source.length;
                i >= 0 && res; --i){
            res = $.self.source[end - len + i] == $.suffix.source[i]
        }
        return res
    }else if($B.$isinstance($.suffix, _b_.tuple)){
        for(var i = 0; i < $.suffix.length; ++i){
            if($B.$isinstance($.suffix[i], bytes)){
                if(bytes.endswith($.self, $.suffix[i], $.start, $.end)){
                    return true
                }
            }else{
                throw _b_.TypeError.$factory("endswith first arg must be " +
                    "bytes or a tuple of bytes, not " +
                    $B.class_name($.suffix))
            }
        }
        return false
    }else{
        throw _b_.TypeError.$factory("endswith first arg must be bytes " +
            "or a tuple of bytes, not " + $B.class_name($.suffix))
    }
}

bytes.expandtabs = function() {
    var $ = $B.args('expandtabs', 2, {self: null, tabsize: null},
        ['self', 'tabsize'], arguments, {tabsize: 8}, null, null)

    var tab_spaces = []
    for(let i = 0; i < $.tabsize; ++i){
        tab_spaces.push(32)
    }

    var buffer = $.self.source.slice()
    for(let i = 0; i < buffer.length; ++i){
        if(buffer[i] === 9){
            var nb_spaces = $.tabsize - i % $.tabsize
            var tabs = new Array(nb_spaces)
            tabs.fill(32)
            buffer.splice.apply(buffer, [i, 1].concat(tabs))
        }
    }
    return _b_.bytes.$factory(buffer)
}

bytes.find = function(self, sub){
    if(arguments.length != 2){
        var $ = $B.args('find', 4,
                {self: null, sub: null, start: null, end: null},
                ['self', 'sub', 'start', 'end'],
                arguments, {start: 0, end: -1}, null, null),
            sub = $.sub,
            start = $.start,
            end = $.end
    }else{
        var start = 0,
            end = -1
    }
    if(typeof sub == "number"){
        if(sub < 0 || sub > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        return self.source.slice(0, end == -1 ? undefined : end).indexOf(sub, start)
    }else if(! sub.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name(sub) + "'")
    }else if(! sub.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name(sub) + "'")
    }
    end = end == -1 ? self.source.length : Math.min(self.source.length, end)

    var len = sub.source.length
    for(var i = start; i <= end - len; i++){
        var chunk = self.source.slice(i, i + len),
            found = true
        for(var j = 0; j < len; j++){
            if(chunk[j] != sub.source[j]){
                found = false
                break
            }
        }
        if(found){
            return i
        }
    }
    return -1
}

// bytes.fromhex is set as a classmethod after $set_func_names is called
bytes.fromhex = function(){
    var $ = $B.args('fromhex', 2,
        {cls: null, string: null},
        ['cls', 'string'],
        arguments, {}, null, null),
        string = $.string.replace(/\s/g, ''),
        source = []
    for(var i = 0; i < string.length; i += 2){
        if(i + 2 > string.length){
            throw _b_.ValueError.$factory("non-hexadecimal number found " +
                "in fromhex() arg")
        }
        source.push(_b_.int.$factory(string.substr(i, 2), 16))
    }
    return $.cls.$factory(source)
}

bytes.hex = function(){
    // Return a string which is hex representation of the instance
    // The hexstring can include a separator every specified number of bytes
    var $ = $B.args('hex', 3, {self:null, sep:null, bytes_per_sep:null},
            ['self','sep','bytes_per_sep'], arguments,
            {sep: "", bytes_per_sep: 1}, null, null),
            self = $.self,
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

bytes.index = function() {
    var $ = $B.args('index', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)
    var index = bytes.find($.self, $.sub, $.start, $.end)
    console.log('index', index)
    if(index == -1){
        throw _b_.ValueError.$factory("subsection not found")
    }
    return index
}

bytes.isalnum = function(){
    var $ = $B.args('isalnum', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
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

bytes.isalpha = function(){
    var $ = $B.args('isalpha', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
    var src = self.source,
        len = src.length,
        res = len > 0

    for(var i = 0; i < len && res; ++i){
        res = (src[i] > 96 && src[i] < 123) || (src[i] > 64 && src[i] < 91)
    }
    return res
}

bytes.isdigit = function(){
    var $ = $B.args('isdigit', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
    var src = self.source,
        len = src.length,
        res = len > 0

    for(let i = 0; i < len && res; ++i){
        res = src[i] > 47 && src[i] < 58
    }
    return res
}

bytes.islower = function(){
    var $ = $B.args('islower', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
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

bytes.isspace = function(){
    var $ = $B.args('isspace', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self

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

bytes.isupper = function(){
    var $ = $B.args('isupper', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
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

bytes.istitle = function(){
    var $ = $B.args('istitle', 1, {self: null}, ['self'],
            arguments, {}, null, null),
        self = $.self
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

bytes.join = function(){
    var $ns = $B.args('join', 2, {self: null, iterable: null},
            ['self', 'iterable'], arguments, {}),
        self = $ns['self'],
        iterable = $ns['iterable']
    var next_func = $B.$getattr(_b_.iter(iterable), '__next__'),
        res = self.__class__.$factory(),
        empty = true
    while(true){
        try{
            var item = next_func()
            if(empty){
                empty = false
            }else{
                res = bytes.__add__(res, self)
            }
            res = bytes.__add__(res, item)
        }catch(err){
            if($B.$isinstance(err, _b_.StopIteration)){
                break
            }
            throw err
        }
    }
    return res
}

var _lower = function(char_code) {
    if(char_code >= 65 && char_code <= 90){
        return char_code + 32
    }else{
        return char_code
    }
}

bytes.lower = function(self) {
    var _res = [],
        pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _lower(self.source[i])}
    }
    return bytes.$factory(_res)
}

bytes.ljust = function() {
    var $ = $B.args('ljust', 3, {self: null, width: null, fillbyte: null},
        ['self', 'width', 'fillbyte'], arguments,
        {fillbyte: bytes.$factory([32])}, null, null)

    if(!$.fillbyte.__class__){
        throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, " +
            "not '" + $B.class_name($.fillbyte) + "'")
    }else if (!$.fillbyte.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, " +
            "not '" + $B.class_name($.fillbyte) + "'")
    }

    var padding = [],
        count = $.width - $.self.source.length
    for(var i = 0; i < count; ++i){
        padding.push($.fillbyte.source[0])
    }
    return bytes.$factory($.self.source.concat(padding))
}

bytes.lstrip = function(self, cars){return _strip(self, cars, 'l')}

bytes.maketrans = function(from, to) {
    var _t = [],
        to = $B.to_bytes(to)
    // make 'default' translate table
    for(var i = 0; i < 256; i++){_t[i] = i}

    // make substitution in the translation table
    for(var i = 0, len = from.source.length; i < len; i++){
       var _ndx = from.source[i]     //retrieve ascii code of char
       _t[_ndx] = to[i]
    }

    // return the bytes object associated to the 256-elt list
    return bytes.$factory(_t)
}

bytes.partition = function() {
    var $ = $B.args('partition', 2, {self:null, sep:null}, ['self', 'sep'],
            arguments, {}, null, null)

    if(! $.sep.__class__){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.class_name($.sep) + "'")
    }else if (! $.sep.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.class_name($.sep) + "'")
    }

    var len = $.sep.source.length,
        src = $.self.source,
        i = bytes.find($.self, $.sep)

    return _b_.tuple.$factory([
        bytes.$factory(src.slice(0, i)),
        bytes.$factory(src.slice(i, i + len)),
        bytes.$factory(src.slice(i + len))
    ])
}

bytes.removeprefix = function(){
    var $ = $B.args("removeprefix", 2, {self: null, prefix: null},
                    ["self", "prefix"], arguments, {}, null, null)
    if(!$B.$isinstance($.prefix, [bytes, bytearray])){
        throw _b_.ValueError.$factory("prefix should be bytes, not " +
            `'${$B.class_name($.prefix)}'`)
    }
    if(bytes.startswith($.self, $.prefix)){
        return bytes.__getitem__($.self,
            _b_.slice.$factory($.prefix.source.length, _b_.None))
    }
    return bytes.__getitem__($.self, _b_.slice.$factory(0, _b_.None))
}

bytes.removesuffix = function(){
    var $ = $B.args("removesuffix", 2, {self: null, suffix: null},
                    ["self", "suffix"], arguments, {}, null, null)
    if(!$B.$isinstance($.suffix, [bytes, bytearray])){
        throw _b_.ValueError.$factory("suffix should be bytes, not " +
            `'${$B.class_name($.suffix)}'`)
    }
    if(bytes.endswith($.self, $.suffix)){
        return bytes.__getitem__($.self,
            _b_.slice.$factory(0, $.suffix.source.length + 1))
    }
    return bytes.__getitem__($.self, _b_.slice.$factory(0, _b_.None))
}

bytes.replace = function(){
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

    if(! $.old.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name($.old) + "'")
    }else if(! $.old.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name($.sep) + "'")
    }

    if(! $.new.__class__){
        throw _b_.TypeError.$factory("second argument must be a bytes-like " +
            "object, not '" + $B.class_name($.old) + "'")
    }else if(! $.new.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("second argument must be a bytes-like " +
            "object, not '" + $B.class_name($.sep) + "'")
    }

    for(var i = 0; i < len; i++){
        if(bytes.startswith(self, old, i) && count){
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

bytes.rfind = function(self, subbytes){
    if(arguments.length == 2 && subbytes.__class__ === bytes){
        var sub = subbytes,
            start = 0,
            end = -1
    }else{
        var $ = $B.args('rfind', 4,
            {self: null, sub: null, start: null, end: null},
            ['self', 'sub', 'start', 'end'],
            arguments, {start: 0, end: -1}, null, null),
            self = $.self,
            sub = $.sub,
            start = $.start,
            end = $.end
    }
    if(typeof sub == "number"){
        if(sub < 0 || sub > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        return $.self.source.slice(start, $.end == -1 ? undefined : $.end).
            lastIndexOf(sub) + start
    }else if(! sub.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name($.sub) + "'")
    }else if(! sub.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name(sub) + "'")
    }
    end = end == -1 ? self.source.length : Math.min(self.source.length, end)

    var len = sub.source.length
    for(var i = end - len; i >= start; --i){
        var chunk = self.source.slice(i, i + len),
            found = true
        for(var j = 0; j < len; j++){
            if(chunk[j] != sub.source[j]){
                found = false
                break
            }
        }
        if(found){return i}
    }
    return -1
}

bytes.rindex = function() {
    var $ = $B.args('rfind', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)

    var index = bytes.rfind($.self, $.sub, $.start, $.end)
    if(index == -1){
        throw _b_.ValueError.$factory("subsection not found")
    }
    return index
}

bytes.rjust = function() {
    var $ = $B.args('rjust', 3, {self: null, width: null, fillbyte: null},
        ['self', 'width', 'fillbyte'], arguments,
        {fillbyte: bytes.$factory([32])}, null, null)

    if (!$.fillbyte.__class__){
        throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, " +
            "not '" + $B.class_name($.fillbyte) + "'")
    }else if (!$.fillbyte.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("argument 2 must be a byte string of length 1, " +
            "not '" + $B.class_name($.fillbyte) + "'")
    }

    var padding = [],
        count = $.width - $.self.source.length
    for(var i = 0; i < count; ++i){
        padding.push($.fillbyte.source[0])
    }
    return bytes.$factory(padding.concat($.self.source))
}

bytes.rpartition = function() {
    var $ = $B.args('rpartition', 2, {self:null, sep:null}, ['self', 'sep'],
            arguments, {}, null, null)

    if(!$.sep.__class__){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
                "not '" + $B.class_name($.sep) + "'")
    }else if (!$.sep.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
                "not '" + $B.class_name($.sep) + "'")
    }

    var len = $.sep.source.length,
        src = $.self.source,
        i = bytes.rfind($.self, $.sep)

    return _b_.tuple.$factory([
        bytes.$factory(src.slice(0, i)),
        bytes.$factory(src.slice(i, i + len)),
        bytes.$factory(src.slice(i + len))
    ])
}

bytes.rstrip = function(self, cars){return _strip(self, cars, 'r')}

bytes.split = function(){
    var $ = $B.args('split', 2, {self:null, sep:null}, ['self', 'sep'],
        arguments, {sep: bytes.$factory([32])}, null, null),
        res = [],
        start = 0,
        stop = 0
    if(! $.sep.__class__ ){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.class_name($.sep) + "'")
    }else if(! $.sep.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.class_name($.sep) + "'")
    }
    var seps = $.sep.source,
        len = seps.length,
        src = $.self.source,
        blen = src.length

    while(stop < blen){
        var match = true
        for(var i = 0; i < len && match; i++){
            if(src[stop + i] != seps[i]){match = false}
        }
        if(match){
            res.push(bytes.$factory(src.slice(start, stop)))
            start = stop + len
            stop = start
        }else{
            stop++
        }
    }
    if(match || (stop > start)){
        res.push(bytes.$factory(src.slice(start, stop)))
    }
    return res
}

bytes.splitlines = function(self) {
    var $ = $B.args('splitlines', 2, {self: null, keepends: null},
                    ['self', 'keepends'], arguments, {keepends: false},
                    null, null)
    if(!$B.$isinstance($.keepends,[_b_.bool, _b_.int])){
        throw _b_.TypeError('integer argument expected, got '+
            $B.get_class($.keepends).__name)
    }
    var keepends = _b_.int.$factory($.keepends),
        res = [],
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
    return res
}
bytes.startswith = function(){
    var $ = $B.args('startswith', 3, {self: null, prefix: null, start:null},
        ['self', 'prefix', 'start'], arguments, {start:0}, null, null),
        start = $.start
    if($B.$isinstance($.prefix, bytes)){
        var res = true
        for(var i = 0; i < $.prefix.source.length && res; i++){
            res = $.self.source[start + i] == $.prefix.source[i]
        }
        return res
    }else if($B.$isinstance($.prefix, _b_.tuple)){
        var items = []
        for(var i = 0; i < $.prefix.length; i++){
            if($B.$isinstance($.prefix[i], bytes)){
                items = items.concat($.prefix[i].source)
            }else{
                throw _b_.TypeError.$factory("startswith first arg must be " +
                    "bytes or a tuple of bytes, not " +
                    $B.class_name($.prefix))
            }
        }
        var prefix = bytes.$factory(items)
        return bytes.startswith($.self, prefix, start)
    }else{
        throw _b_.TypeError.$factory("startswith first arg must be bytes " +
            "or a tuple of bytes, not " + $B.class_name($.prefix))
    }
}

bytes.strip = function(self, cars){
    var res = bytes.lstrip(self, cars)
    return bytes.rstrip(res, cars)
}

bytes.swapcase = function(self) {
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

bytes.title = function(self) {
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

bytes.translate = function(self, table, _delete) {
    if(_delete === undefined){
        _delete = []
    }else if($B.$isinstance(_delete, bytes)){
        _delete = _delete.source
    }else{
        throw _b_.TypeError.$factory("Type " +
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

var _upper = function(char_code){
    if(char_code >= 97 && char_code <= 122){
        return char_code - 32
    }else{
        return char_code
    }
}

bytes.upper = function(self) {
    var _res = [],
        pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _upper(self.source[i])}
    }
    return bytes.$factory(_res)
}

bytes.zfill = function(self, width) {
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

function $UnicodeEncodeError(encoding, code_point, position){
    throw _b_.UnicodeEncodeError.$factory("'" + encoding +
        "' codec can't encode character " + _b_.hex(code_point) +
        " in position " + position)
}

function $UnicodeDecodeError(encoding, position){
    throw _b_.UnicodeDecodeError.$factory("'" + encoding +
        "' codec can't decode bytes in position " + position)
}

function _hex(_int){
    var h = _int.toString(16)
    return '0x' + '0'.repeat(2 - h.length) + h
}
function _int(hex){
    return parseInt(hex, 16)
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
          var pos = 0,
              s = "",
              err_info
          while(pos < b.length){
              var byte = b[pos]
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
                          throw _b_.UnicodeDecodeError.$factory(
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      var cp = byte & 0x1f
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
                          for(var i = pos; i < err_info[3]; i++){
                              s += String.fromCodePoint(0xdc80 + b[i] - 0x80)
                          }
                          pos = err_info[3]
                      }else{
                          throw _b_.UnicodeDecodeError.$factory(
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      var cp = byte & 0xf
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
                  }else if((b[pos + 2] & 0xc0) != 0x80){
                      err_info = [byte, pos, "continuation", pos + 3]
                  }
                  if(err_info !== null){
                      if(errors == "ignore"){
                          pos = err_info[3]
                      }else if(errors == "surrogateescape"){
                          for(var i = pos; i < err_info[3]; i++){
                              s += String.fromCodePoint(0xdc80 + b[i] - 0x80)
                          }
                          pos = err_info[3]
                      }else{
                          throw _b_.UnicodeDecodeError.$factory(
                              "'utf-8' codec can't decode byte 0x" +
                              err_info[0].toString(16) +"  in position " +
                              err_info[1] +
                              (err_info[2] == "end" ? ": unexpected end of data" :
                                  ": invalid continuation byte"))
                      }
                  }else{
                      var cp = byte & 0xf
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
                      throw _b_.UnicodeDecodeError.$factory(
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
          if(obj.__class__ === bytes || obj.__class__ === bytearray){
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
          if(obj.__class__ === bytes || obj.__class__ === bytearray){
              obj = decode(obj, "latin-1", "strict")
          }
          return obj.replace(/\\u([a-fA-F0-9]{4})/g, function(mo){
              var cp = parseInt(mo.substr(2), 16)
              return String.fromCharCode(cp)
          })
      case "ascii":
          for(var i = 0, len = b.length; i < len; i++){
              var cp = b[i]
              if(cp <= 127){
                  s += String.fromCharCode(cp)
              }else{
                  if(errors == "ignore"){
                      // ignore
                  }else if(errors == "backslashreplace"){
                      s += '\\x' + cp.toString(16)
                  }else{
                      var msg = "'ascii' codec can't decode byte 0x" +
                        cp.toString(16) + " in position " + i +
                        ": ordinal not in range(128)"
                      throw _b_.UnicodeDecodeError.$factory(msg)
                  }
              }
          }
          break
      default:
          try{
              load_decoder(enc)
          }catch(err){
              throw _b_.LookupError.$factory("unknown encoding: " + enc)
          }
          var decoded = to_unicode[enc](obj)[0]
          for(var i = 0, len = decoded.length; i < len; i++){
              if(decoded.codePointAt(i) == 0xfffe){
                  throw _b_.UnicodeDecodeError.$factory("'charmap' codec " +
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
            for(var i = 0, len = s.length; i < len; i++){
                var cp = s.charCodeAt(i)
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
            for(var i = 0, len = s.length; i < len; i++){
                var cp = s.charCodeAt(i) // code point
                if(cp <= 255){
                    t[pos++] = cp
                }else if(errors != "ignore"){
                    $UnicodeEncodeError(encoding, i)
                }
            }
            break
        case "ascii":
          for(var i = 0, len = _b_.str.__len__(s); i < len; i++){
              var cp = s.charCodeAt(i), // code point
                  char = _b_.str.__getitem__(s, i)
              if(cp <= 127){
                  t[pos++] = cp
              }else if(errors == "backslashreplace"){
                  var hex = _b_.hex(_b_.ord(char))
                  if(hex.length < 5){
                      hex = '\\x' + '0'.repeat(4 - hex.length) + hex.substr(2)
                  }else if(hex.length < 7){
                      hex = '\\u' + '0'.repeat(6 - hex.length) + hex.substr(2)
                  }else{
                      hex = '\\U' + '0'.repeat(10 - hex.length) + hex.substr(2)
                  }
                  for(var char of hex){
                      t[pos++] = char.charCodeAt(0)
                  }
              }else if(errors !== 'ignore'){
                  $UnicodeEncodeError(encoding, i)
              }
          }
          break
        case "raw_unicode_escape":
          for(var i = 0, len = s.length; i < len; i++){
              var cp = s.charCodeAt(i) // code point
              if(cp < 256){
                  t[pos++] = cp
              }else{
                  var us = cp.toString(16)
                  if(us.length % 2){us = "0" + us}
                  us = "\\u" + us
                  for(var j = 0; j < us.length; j++){
                      t[pos++] = us.charCodeAt(j)
                  }
              }
          }
          break
        default:
            try{
                load_encoder(enc)
            }catch(err){
                throw _b_.LookupError.$factory("unknown encoding: " + encoding)
            }
            return from_unicode[enc](s)[0]
    }
    return fast_bytes(t)
}

function fast_bytes(t){
    return {
        __class__: _b_.bytes,
        source: t
    }
}

bytes.$factory = function(source, encoding, errors){
    return bytes.__new__.bind(null, bytes).apply(null, arguments)
}

bytes.__class__ = _b_.type
bytes.$is_class = true


$B.set_func_names(bytes, "builtins")

// classmethod needs function attribute $info, which is set by set_func_names
bytes.fromhex = _b_.classmethod.$factory(bytes.fromhex)

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

$B.set_func_names(bytearray, "builtins")

bytearray.fromhex = bytes.fromhex

_b_.bytes = bytes
_b_.bytearray = bytearray

})(__BRYTHON__)
