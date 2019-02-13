;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    isinstance = _b_.isinstance,
    getattr = _b_.getattr,
    None = _b_.None

var from_unicode = {},
    to_unicode = {}

// Conversion of byte-like objects (bytes, bytearray, memoryview, array.array...)
// into a list of bytes
// Make the function an attribute of $B, it is used in libs/_binascii.js
$B.to_bytes = function(obj){
    var res
    if(_b_.isinstance(obj, [bytes, bytearray])){
        res = obj.source
    }else{
        var ga = $B.$getattr(obj, "tobytes", null)
        if(ga !== null){res = $B.$call(ga)().source}
        else{
            throw _b_.TypeError.$factory("object doesn't support the buffer protocol")
        }
    }
    return res
}

function invalid(other){
    return ! _b_.isinstance(other, [bytes, bytearray])
}

//bytearray() (built in class)
var bytearray = {
    __class__: _b_.type,
    __mro__: [object],
    $buffer_protocol: true,
    $infos: {
        __module__: "builtins",
        __name__: "bytearray"
    },
    $is_class: true
}

var mutable_methods = ["__delitem__", "clear", "copy", "count", "index",
    "pop", "remove", "reverse", "sort"]

mutable_methods.forEach(function(method){
    bytearray[method] = (function(m){
        return function(self){
            var args = [self.source], pos = 1
            for(var i = 1, len = arguments.length; i < len; i++){
                args[pos++] = arguments[i]
            }
            return _b_.list[m].apply(null, args)
        }
    })(method)
})

var $bytearray_iterator = $B.$iterator_class('bytearray_iterator')
bytearray.__iter__ = function(self){
    return $B.$iterator(self.source, $bytearray_iterator)
}
bytearray.__mro__ = [object]

bytearray.__repr__ = bytearray.__str__ = function(self){
    return 'bytearray(' + bytes.__repr__(self) + ")"
}

bytearray.__setitem__ = function(self, arg, value){
    if(isinstance(arg, _b_.int)){
        if(! isinstance(value, _b_.int)){
            throw _b_.TypeError.$factory('an integer is required')
        }else if(value > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        var pos = arg
        if(arg < 0){pos = self.source.length + pos}
        if(pos >= 0 && pos < self.source.length){self.source[pos] = value}
        else{throw _b_.IndexError.$factory('list index out of range')}
    }else if(isinstance(arg, _b_.slice)){
        var start = arg.start === None ? 0 : arg.start
        var stop = arg.stop === None ? self.source.length : arg.stop

        if(start < 0){start = self.source.length + start}
        if(stop < 0){stop = self.source.length + stop}

        self.source.splice(start, stop - start)

        // copy items in a temporary JS array
        // otherwise, a[:0] = a fails
        try{
            var $temp = _b_.list.$factory(value)
            for(var i = $temp.length - 1; i >= 0; i--){
                if(! isinstance($temp[i], _b_.int)){
                    throw _b_.TypeError.$factory('an integer is required')
                }else if($temp[i] > 255){
                    throw ValueError.$factory("byte must be in range(0, 256)")
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
    if(! isinstance(b, _b_.int)){
        throw _b_.TypeError.$factory("an integer is required")
    }
    if(b > 255){throw ValueError.$factory("byte must be in range(0, 256)")}
    self.source[self.source.length] = b
}

bytearray.insert = function(self, pos, b){
    if(arguments.length != 3){throw _b_.TypeError.$factory(
        "insert takes exactly 2 arguments (" + (arguments.length - 1) +
        " given)")
    }
    if(!isinstance(b, _b_.int)){
        throw _b_.TypeError.$factory("an integer is required")
    }
    if(b > 255){throw ValueError.$factory("byte must be in range(0, 256)")}
    _b_.list.insert(self.source, pos, b)
}

bytearray.$factory = function(source, encoding, errors) {
    return bytearray.__new__(bytearray, source, encoding, errors)
}

//bytes() (built in function)
var bytes = {
    __class__ : _b_.type,
    __mro__: [object],
    $buffer_protocol: true,
    $infos: {
        __module__: "builtins",
        __name__: "bytes"
    },
    $is_class: true
}

bytes.__add__ = function(self, other){
    if(isinstance(other, bytes)){
        return self.__class__.$factory(self.source.concat(other.source))
    }else if(isinstance(other, bytearray)){
        return self.__class__.$factory(bytes.__add__(self, bytes.$factory(other)))
    }else if(isinstance(other, _b_.memoryview)){
        return self.__class__.$factory(bytes.__add__(self, _b_.memoryview.tobytes(other)))
    }
    throw _b_.TypeError.$factory("can't concat bytes to " +
        _b_.str.$factory(other))
}

bytes.__contains__ = function(self, other){
    if(typeof other == "number"){
        return self.source.indexOf(other) > -1
    }
    if(self.source.length > other.source.length){return false}
    var len = self.source.length
    for(var i = 0; i < other.source.length - self.source.length + 1; i++){
        var flag = true
        for(var j = 0; j < len; j++){
            if(other.source[i + j] != self.source[j]){
                flag = false
                break
            }
        }
        if(flag){return true}
    }
    return false
}

var $bytes_iterator = $B.$iterator_class("bytes_iterator")
bytes.__iter__ = function(self){
    return $B.$iterator(self.source, $bytes_iterator)
}

bytes.__eq__ = function(self, other){
    if(invalid(other)){return false}
    return getattr(self.source, '__eq__')(other.source)
}

bytes.__ge__ = function(self, other){
    if(invalid(other)){return _b_.NotImplemented}
    return _b_.list.__ge__(self.source, other.source)
}

// borrowed from py_string.js.
bytes.__getitem__ = function(self, arg){
    var i
    if(isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0){pos = self.source.length + pos}

        if(pos >= 0 && pos < self.source.length){return self.source[pos]}
        throw _b_.IndexError.$factory("index out of range")
    }else if(isinstance(arg, _b_.slice)){
        var step = arg.step === None ? 1 : arg.step
        if(step > 0){
            var start = arg.start === None ? 0 : arg.start
            var stop = arg.stop === None ?
                getattr(self.source, '__len__')() : arg.stop
        }else{
            var start = arg.start === None ?
                getattr(self.source,'__len__')() - 1 : arg.start
            var stop = arg.stop === None ? 0 : arg.stop
        }
        if(start < 0){start = self.source.length + start}
        if(stop < 0){stop = self.source.length + stop}
        var res = [],
            i = null,
            pos = 0
        if(step > 0){
          stop = Math.min(stop, self.source.length)
          if(stop <= start){return bytes.$factory([])}
          for(var i = start; i < stop; i += step){res[pos++] = self.source[i]}
        }else{
            if(stop >= start){return bytes.$factory([])}
            stop = Math.max(0, stop)
            for(var i = start; i >= stop; i += step){res[pos++] = self.source[i]}
        }
        return bytes.$factory(res)
    }else if(isinstance(arg, _b_.bool)){
        return self.source.__getitem__(_b_.int.$factory(arg))
    }
}


bytes.__gt__ = function(self, other){
    if(invalid(other)){return _b_.NotImplemented}
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
    if(invalid(other)){return _b_.NotImplemented}
    return _b_.list.__le__(self.source, other.source)
}

bytes.__len__ = function(self){return self.source.length}

bytes.__lt__ = function(self, other){
    if(invalid(other)){return _b_.NotImplemented}
    return _b_.list.__lt__(self.source, other.source)
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

bytes.__ne__ = function(self,other){return ! bytes.__eq__(self, other)}

bytes.__new__ = function(cls, source, encoding, errors){
    // Create an instance of bytes
    var self = {__class__: cls},
        int_list = [],
        pos = 0
    if(source === undefined){
        // empty list
    }else if(isinstance(source, _b_.int)){
        var i = source
        while(i--){int_list[pos++] = 0}
    }else{
        if(isinstance(source, _b_.str)){
            if(encoding === undefined){
                throw _b_.TypeError.$factory("string argument without an encoding")
            }
            int_list = encode(source, encoding)
        }else{
            // tranform iterable "source" into a list
            int_list = _b_.list.$factory(source)
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
    self.source = int_list
    self.encoding = encoding
    self.errors = errors
    return self
}

bytes.__repr__ = bytes.__str__ = function(self){
    var res = "b'"
    for(var i = 0, len = self.source.length; i < len; i++){
        var s = self.source[i]
        if(s == 10){
            res += '\\n'
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
    return res + "'"
}

bytes.__reduce_ex__ = function(self){return bytes.__repr__(self)}

bytes.decode = function(self, encoding,errors){
    if(encoding === undefined){encoding = 'utf-8'}
    if(errors === undefined){errors = 'strict'}

    switch (errors) {
      case 'strict':
      case 'ignore':
      case 'replace':
      case 'surrogateescape':
      case 'surrogatepass':
      case 'xmlcharrefreplace':
      case 'backslashreplace':
        return decode(self.source, encoding, errors)
      default:
        // raise error since errors variable is not valid
    }
}

bytes.join = function(){
    var $ns = $B.args('join', 2, {self: null, iterable: null},
        ['self', 'iterable'], arguments, {}),
        self = $ns['self'],
        iterable = $ns['iterable']
    var next_func = _b_.getattr(_b_.iter(iterable), '__next__'),
        res = self.__class__.$factory(),
        empty = true
    while(true){
        try{
            var item = next_func()
            if(empty){empty = false}
            else{res = bytes.__add__(res, self)}
            res = bytes.__add__(res, item)
        }catch(err){
            if(isinstance(err, _b_.StopIteration)){
                break
            }
            throw err
        }
    }
    return res
}

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

bytes.find = function() {
    var $ = $B.args('find', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null),
        sub = $.sub,
        start = $.start
    if(typeof sub == "number"){
        if(sub < 0 || sub > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        return $.self.source.slice(0, $.end == -1 ? undefined : $.end).indexOf(sub, start)
    }else if(! sub.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name(sub) + "'")
    }else if(! sub.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.class_name(sub) + "'")
    }
    var end = $.end == -1 ? $.self.source.length - sub.source.length :
        Math.min($.self.source.length - sub.source.length, $.end)

    for(var i = start; i <= end; i++){
        if(bytes.startswith($.self, sub, i)){return i}
    }
    return -1
}

bytes.rfind = function() {
    var $ = $B.args('rfind', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null),
        sub = $.sub,
        start = $.start

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
    var end = $.end == -1 ? $.self.source.length - sub.source.length :
        Math.min($.self.source.length - sub.source.length, $.end)

    for(var i = end - 1; i >= start; --i){
        if(bytes.startswith($.self, sub, i)){
            return i
        }
    }
    return -1
}

bytes.index = function() {
    var $ = $B.args('rfind', 4,
        {self: null, sub: null, start: null, end: null},
        ['self', 'sub', 'start', 'end'],
        arguments, {start: 0, end: -1}, null, null)

    var index = bytes.find($.self, $.sub, $.start, $.end)
    if(index == -1){
        throw _b_.ValueError.$factory("subsection not found")
    }
    return index
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

bytes.split = function(){
    var $ = $B.args('split', 2, {self:null, sep:null}, ['self', 'sep'],
        arguments, {}, null, null),
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

bytes.splitlines = function() {
    var $ = $B.args('splitlines', 2, {self: null, keepends: null},
        ['self', 'keepends'], arguments, {keepends:false}, null, null),
        lines = [],
        src = $.self.source,
        start = 0,
        end = -1,
        newline_end = -1

    for(var i = 0; i < src.length; ++i){
        var newline_end = -1
        if(src[i] === 13){
            end = i
            newline_end = ++i
        }
        if(src[i] === 10){
            end = newline_end == -1 ? i : i - 1
            newline_end = ++i
        }
        if(newline_end != -1){
            lines.push(bytes.$factory(src.slice(start, $.keepends ?
                newline_end : end)))
            start = i
        }
    }
    if(src.length > 0){
        lines.push(bytes.$factory(src.slice(start)))
    }
    return lines
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

bytes.islower = function(self) {
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

bytes.isupper = function(self) {
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

bytes.isspace = function(self) {
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

bytes.isdigit = function(self) {
    var src = self.source,
        len = src.length,
        res = len > 0

    for(let i = 0; i < len && res; ++i){
        res = src[i] > 47 && src[i] < 58
    }
    return res
}

bytes.title = function(self) {
    var src = self.source,
        len = src.length
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

bytes.isalpha = function(self) {
    var src = self.source,
        len = src.length,
        res = len > 0

    for(var i = 0; i < len && res; ++i){
        res = (src[i] > 96 && src[i] < 123) || (src[i] > 64 && src[i] < 91)
    }
    return res
}

bytes.isalnum = function(self) {
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

bytes.istitle = function(self) {
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

function _strip(self, cars, lr){
    if(cars === undefined){
        cars = []
        var ws = '\r\n \t'
        for(var i = 0, len = ws.length; i < len; i++){
            cars.push(ws.charCodeAt(i))
        }
    }else if(isinstance(cars, bytes)){
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

bytes.lstrip = function(self, cars){return _strip(self, cars, 'l')}
bytes.rstrip = function(self, cars){return _strip(self, cars, 'r')}

bytes.startswith = function(){
    var $ = $B.args('startswith', 3, {self: null, prefix: null, start:null},
        ['self', 'prefix', 'start'], arguments, {start:0}, null, null),
        start = $.start
    if(_b_.isinstance($.prefix, bytes)){
        var res = true
        for(var i = 0; i < $.prefix.source.length && res; i++){
            res = $.self.source[start + i] == $.prefix.source[i]
        }
        return res
    }else if(_b_.isinstance($.prefix, _b_.tuple)){
        var items = []
        for(var i = 0; i < $.prefix.length; i++){
            if(_b_.isinstance($.prefix[i], bytes)){
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

bytes.endswith = function() {
    var $ = $B.args('endswith', 4, {self: null, suffix: null, start: null, end: null},
        ['self', 'suffix', 'start', 'end'], arguments, {start: -1, end: -1}, null, null)
    if(_b_.isinstance($.suffix, bytes)){
        var start = $.start == -1 ?
            $.self.source.length - $.suffix.source.length :
            Math.min($.self.source.length - $.suffix.source.length, $.start)
        var end = $.end == -1 ?
            ($.start == -1 ? $.self.source.length : start + $.suffix.source.length) :
            Math.min($.self.source.length - 1, $.end)
        var res = true
        for (var i = $.suffix.source.length - 1, len = $.suffix.source.length;
                i >= 0 && res; --i){
            res = $.self.source[end - len + i] == $.suffix.source[i]
        }
        return res
    }else if (_b_.isinstance($.suffix, _b_.tuple)){
        for(var i = 0; i < $.suffix.length; ++i){
            if(_b_.isinstance($.suffix[i], bytes)){
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
            buffer.splice.apply(buffer, [i, 1].concat(tab_spaces))
        }
    }
    return _b_.bytes.$factory(buffer)
}

bytes.strip = function(self, cars){
    var res = bytes.lstrip(self, cars)
    return bytes.rstrip(res, cars)
}

bytes.translate = function(self, table, _delete) {
    if(_delete === undefined){
        _delete = []
    }else if(isinstance(_delete, bytes)){
        _delete = _delete.source
    }else{
        throw _b_.TypeError.$factory("Type " +
            $B.get_class(_delete).__name + " doesn't support the buffer API")
    }
    var res = [],
        pos = 0
    if(isinstance(table, bytes) && table.source.length == 256){
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

var _lower = function(char_code) {
    if(char_code >= 65 && char_code <= 90){
        return char_code + 32
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

bytes.lower = function(self) {
    var _res = [],
        pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _lower(self.source[i])}
    }
    return bytes.$factory(_res)
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

function _hex(_int){return _int.toString(16)}
function _int(hex){return parseInt(hex, 16)}

function normalise(encoding){
    var enc = encoding.toLowerCase()
    if(enc.substr(0, 7) == "windows"){enc = "cp" + enc.substr(7)}
    if(enc.startsWith("cp") || enc.startsWith("iso")){
        enc = enc.replace("-", "") // first hyphen, like in cp-1250
    }
    enc = enc.replace(/-/g, "_") // second, like in iso-8859-1
    return enc
}

function load_decoder(enc){
    // load table from Lib/encodings/<enc>.py
    if(to_unicode[enc] === undefined){
        load_encoder(enc)
        to_unicode[enc] = {}
        for(var attr in from_unicode[enc]){
            to_unicode[enc][from_unicode[enc][attr]] = attr
        }
    }
}

function load_encoder(enc){
    // load table from encodings/<enc>.py
    if(from_unicode[enc] === undefined){
        var mod = _b_.__import__("encodings." + enc)
        table = mod[enc].decoding_table
        from_unicode[enc] = {}
        for(var i = 0; i < table.length; i++){
            from_unicode[enc][table.charCodeAt(i)] = i
        }
    }
}

var decode = $B.decode = function(b, encoding, errors){
    var s = "",
        enc = normalise(encoding)

    switch(enc) {
      case "utf_8":
      case "utf-8":
      case "utf8":
      case "U8":
      case "UTF":
        var i = 0,
            cp,
            _int_800 = _int("800"),
            _int_c2 = _int("c2"),
            _int_1000 = _int("1000"),
            _int_e0 = _int("e0"),
            _int_e1 = _int("e1"),
            _int_e3 = _int("e3"),
            _int_a0 = _int("a0"),
            _int_80 = _int("80"),
            _int_2000 = _int("2000")

        while(i < b.length){
            if(b[i] <= 127){
                s += String.fromCharCode(b[i])
                i += 1
            }else if(b[i] < _int_e0){
                if(i < b.length - 1){
                    cp = b[i + 1] + 64 * (b[i] - _int_c2)
                    s += String.fromCharCode(cp)
                    i += 2
                }else{
                    $UnicodeDecodeError(encoding, i)
                }
            }else if(b[i] == _int_e0){
                if(i < b.length - 2){
                    var zone = b[i + 1] - _int_a0
                    cp = b[i + 2] - _int_80 + _int_800 + 64 * zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{
                    $UnicodeDecodeError(encoding, i)
                }
            }else if(b[i] < _int_e3){
                if(i < b.length - 2){
                    var zone = b[i + 1] - _int_80
                    cp = b[i + 2] - _int_80 + _int_1000 + 64 * zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{
                    $UnicodeDecodeError(encoding, i)
                }
            }else{
                if(i < b.length - 2){
                    var zone1 = b[i] - _int_e1 - 1
                    var zone = b[i + 1] - _int_80 + 64 * zone1
                    cp = b[i + 2] - _int_80 + _int_2000 + 64 * zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{
                    if(errors == "surrogateescape"){
                       s += "\\udc" + _hex(b[i])
                       i += 1
                    }else{
                       $UnicodeDecodeError(encoding, i)
                    }
                }
            }
        }
        break
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
          if(Array.isArray(b)){
              b = decode(b, "latin-1", "strict")
          }
          return b.replace(/\\n/g, "\n").
                   replace(/\\a/g, "\u0007").
                   replace(/\\b/g, "\b").
                   replace(/\\f/g, "\f").
                   replace(/\\t/g, "\t").
                   replace(/\\'/g, "'").
                   replace(/\\"/g, '"')
      case "raw_unicode_escape":
          if(Array.isArray(b)){
              b = decode(b, "latin-1", "strict")
          }
          b = b.replace(/\\u([a-fA-F0-9]{4})/g, function(mo){
              var cp = parseInt(mo.substr(2), 16)
              return String.fromCharCode(cp)
          })
          return b
      case "ascii":
          for(var i = 0, len = b.length; i < len; i++){
              var cp = b[i]
              if(cp <= 127){
                  s += String.fromCharCode(cp)
              }else{
                  var msg = "'ascii' codec can't decode byte 0x" +
                    cp.toString(16) + " in position " + i +
                    ": ordinal not in range(128)"
                  throw _b_.UnicodeDecodeError.$factory(msg)
              }
          }
          break
      default:
          try{
              load_decoder(enc)
          }catch(err){
              console.log(b, encoding, "error load_decoder", err)
              throw _b_.LookupError.$factory("unknown encoding: " + enc)
          }
          b.forEach(function(item){
              var u = to_unicode[enc][item]
              if(u !== undefined){s += String.fromCharCode(u)}
              else{s += String.fromCharCode(item)}
          })
          break
    }
    return s
}

var encode = $B.encode = function(s, encoding){
    var $ = $B.args("encode", 2, {s:null, encoding:null}, ["s", "encoding"],
        arguments, {}, null, null),
        s = $.s,
        encoding = $.encoding
    var t = [],
        pos = 0,
        enc = normalise(encoding)

    switch(enc) {
        case "utf-8":
        case "utf_8":
        case "utf8":
            //optimize by creating constants..
            var _int_800 = _int("800"),
                _int_c2 = _int("c2"),
                _int_1000 = _int("1000"),
                _int_e0 = _int("e0"),
                _int_e1 = _int("e1"),
                _int_a0 = _int("a0"),
                _int_80 = _int("80"),
                _int_2000 = _int("2000"),
                _int_D000 = _int("D000")

            for(var i = 0, len = s.length; i < len; i++){
                var cp = s.charCodeAt(i) // code point
                if(cp <= 127){
                    t[pos++] = cp
                }else if(cp < _int_800){
                    var zone = Math.floor((cp - 128) / 64)
                    t[pos++] = _int_c2 + zone
                    t[pos++] = cp - 64 * zone
                }else if(cp < _int_1000){
                    var zone = Math.floor((cp - _int_800) / 64)
                    t[pos++] = _int_e0
                    t[pos++] = _int_a0 + zone
                    t[pos++] = _int_80 + cp - _int_800 - 64 * zone
                }else if(cp < _int_2000){
                    var zone = Math.floor((cp - _int_1000) / 64)
                    t[pos++] = _int_e1 + Math.floor((cp - _int_1000) /
                        _int_1000)
                    t[pos++] = _int_80 + zone
                    t[pos++] = _int_80 + cp - _int_1000 - 64 * zone
                }else if(cp < _int_D000){
                    var zone = Math.floor((cp - _int_2000) / 64)
                    var zone1 = Math.floor((cp - _int_2000) / _int_1000)
                    t[pos++] = _int_e1 + Math.floor((cp - _int_1000) /
                        _int_1000)
                    t[pos++] = _int_80 + zone - zone1 * 64
                    t[pos++] = _int_80 + cp - _int_2000 - 64 * zone
                }
            }
            break
        case "latin1":
        case "iso8859_1":
        case "windows1252":
            for(var i = 0, len = s.length; i < len; i++){
                var cp = s.charCodeAt(i) // code point
                if(cp <= 255){t[pos++] = cp}
                else{$UnicodeEncodeError(encoding, i)}
            }
            break
        case "ascii":
          for(var i = 0, len = s.length; i < len; i++){
              var cp = s.charCodeAt(i) // code point
              if(cp <= 127){t[pos++] = cp}
              else{$UnicodeEncodeError(encoding, i)}
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

            for(var i = 0, len = s.length; i < len; i++){
                var cp = s.charCodeAt(i) // code point
                if(from_unicode[enc][cp] === undefined){
                    $UnicodeEncodeError(encoding, cp, i)
                }
                t[pos++] = from_unicode[enc][cp]
            }
            break
    }
    return t
}


bytes.$factory = function (source, encoding, errors) {
    return bytes.__new__(bytes, source, encoding, errors)
}

bytes.__class__ = _b_.type
bytes.$is_class = true

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

$B.set_func_names(bytes, "builtins")
$B.set_func_names(bytearray, "builtins")

_b_.bytes = bytes
_b_.bytearray = bytearray

})(__BRYTHON__)
