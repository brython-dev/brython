;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    isinstance = _b_.isinstance,
    getattr = _b_.getattr,
    None = _b_.None

var from_unicode = {},
    to_unicode = {}

//bytearray() (built in class)
var bytearray = {
    __class__: _b_.type,
    __mro__: [object],
    __name__: 'bytearray',
    $buffer_protocol: true,
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
        if(!isinstance(value, _b_.int)){
            throw _b_.TypeError.$factory('an integer is required')
        }else if(value > 255){
            throw _b_.ValueError.$factory("byte must be in range(0, 256)")
        }
        var pos = arg
        if(arg < 0){pos = self.source.length + pos}
        if(pos >= 0 && pos < self.source.length){self.source[pos] = value}
        else{throw _b_.IndexError.$factory('list index out of range')}
    } else if(isinstance(arg, _b_.slice)){
        var start = arg.start === None ? 0 : arg.start
        var stop = arg.stop === None ? self.source.length : arg.stop

        if(start < 0){start = self.source.length + start}
        if(stop < 0){stop = self.source.length + stop}

        self.source.splice(start, stop - start)

        // copy items in a temporary JS array
        // otherwise, a[:0] = a fails
        if(_b_.hasattr(value, '__iter__')){
            var $temp = _b_.list.$factory(value)
            for(var i = $temp.length - 1; i >= 0; i--){
                if(!isinstance($temp[i], _b_.int)){
                    throw _b_.TypeError.$factory('an integer is required')
                }else if($temp[i] > 255){
                    throw ValueError.$factory("byte must be in range(0, 256)")
                }
                self.source.splice(start, 0, $temp[i])
            }
        }else{
            throw _b_.TypeError.$factory("can only assign an iterable")
        }
    }else{
        throw _b_.TypeError.$factory('list indices must be integer, not ' +
            $B.get_class(arg).__name__)
    }
}

bytearray.append = function(self, b){
    if(arguments.length != 2){throw _b_.TypeError.$factory(
        "append takes exactly one argument (" + (arguments.length - 1) +
        " given)")
    }
    if(!isinstance(b, _b_.int)){
        throw _b_.TypeError.$factory("an integer is required")
    }
    if(b > 255){throw ValueError.$factory("byte must be in range(0, 256)")}
    self.source[self.source.length] = b
}

bytearray.insert = function(self,pos,b){
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
    __name__ : 'bytes',
    $buffer_protocol: true,
    $is_class: true
}

bytes.__add__ = function(self, other){
    if(isinstance(other, bytes)){
        self.source = self.source.concat(other.source)
        return self
    }else if(isinstance(other, bytearray)){
        return self.__class__.$factory(bytes.__add__(self, bytes.$factory(other)))
    }else if(isinstance(other, _b_.memoryview)){
        return self.__class__.$factory(bytes.__add__(self, _b_.memoryview.tobytes(other)))
    }
    throw _b_.TypeError.$factory("can't concat bytes to " +
        _b_.str.$factory(other))
}

var $bytes_iterator = $B.$iterator_class('bytes_iterator')
bytes.__iter__ = function(self){
    return $B.$iterator(self.source,$bytes_iterator)
}

bytes.__eq__ = function(self,other){
    return getattr(self.source,'__eq__')(other.source)
}

bytes.__ge__ = function(self,other){
    return _b_.list.__ge__(self.source,other.source)
}

// borrowed from py_string.js.
bytes.__getitem__ = function(self, arg){
    var i
    if(isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0){pos = self.source.length + pos}

        if(pos >= 0 && pos < self.source.length){return self.source[pos]}
        throw _b_.IndexError.$factory('index out of range')
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
        var res = [], i = null, pos = 0
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
    }else if(isinstance(arg, bool)){
        return self.source.__getitem__(_b_.int.$factory(arg))
    }
}


bytes.__gt__ = function(self, other){
    return _b_.list.__gt__(self.source, other.source)
}

bytes.__hash__ = function(self) {
  if(self === undefined){
     return bytes.__hashvalue__ || $B.$py_next_hash--  // for hash of str$
  }

  //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-$
  // this implementation for strings maybe good enough for us..
  var hash = 1
  for(var i = 0, len = self.source.length; i < len; i++) {
      hash = (101 * hash + self.source[i]) & 0xFFFFFFFF
  }

  return hash
}

bytes.__init__ = function(){
    return _b_.None
}

bytes.__le__ = function(self, other){
    return _b_.list.__le__(self.source, other.source)
}

bytes.__len__ = function(self){return self.source.length}

bytes.__lt__ = function(self, other){
    return _b_.list.__lt__(self.source, other.source)
}

bytes.__mul__ = function(){
    var $ = $B.args('__mul__', 2, {self: null, other: null}, ['self', 'other'],
        arguments, {}, null, null),
        other = $B.PyNumber_Index($.other),
        res = bytes.$factory()
    for(var i = 0; i < other; i++){
        res.source = res.source.concat($.self.source)
    }
    return res
}

bytes.__ne__ = function(self,other){return ! bytes.__eq__(self, other)}

bytes.__new__ = function(cls, source, encoding, errors){
    // Create an instance of bytes
    var self = {__class__: cls}
    var int_list = [], pos = 0
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
                        $B.get_class(int_list[i]).__name__ + "' object " +
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
        if(s < 32 || s >= 128){
            var hx = s.toString(16)
            hx = (hx.length == 1 ? '0' : '') + hx
            res += '\\x' + hx
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
        empty = true,
        ce = $B.current_exception
    while(true){
        try{
            var item = next_func()
            if(empty){empty = false}
            else{res = bytes.__add__(res, self)}
            res = bytes.__add__(res, item)
        }catch(err){
            if(isinstance(err, _b_.StopIteration)){
                $B.current_exception = ce
                break
            }
            throw err
        }
    }
    return res
}

bytes.maketrans = function(from, to) {
    var _t = []
    // make 'default' translate table
    for(var i = 0; i < 256; i++){_t[i] = i}

    // make substitution in the translation table
    for(var i = 0, len = from.source.length; i < len; i++) {
       var _ndx = from.source[i]     //retrieve ascii code of char
       _t[_ndx] = to.source[i]
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
    if(! sub.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.get_class($.sub).__name__ + "'")
    }else if(! sub.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + sub.__class__.__name__ + "'")
    }
    var end = $.end == -1 ? $.self.source.length - sub.source.length :
        Math.min($.self.source.length - sub.source.length, $.end)

    for(var i = start; i <= end; i++){
        if(bytes.startswith($.self, sub, i)){return i}
    }
    return -1
}

bytes.replace = function(){
    var $ = $B.args('replace', 4,
        {self: null, old: null, new: null, count: null},
        ['self', 'old', 'new', 'count'],
        arguments, {count: -1}, null, null),
        res = [];
    var self = $.self,
        src = self.source,
        len = src.length,
        old = $.old,
        $new = $.new
    var count = $.count >= 0 ? $.count : src.length

    if(! $.old.__class__){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $B.get_class($.old).__name__ + "'")
    }else if(! $.old.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("first argument must be a bytes-like " +
            "object, not '" + $.sep.__class__.__name__ + "'")
    }

    if(! $.new.__class__){
        throw _b_.TypeError.$factory("second argument must be a bytes-like " +
            "object, not '" + $B.get_class($.old).__name__ + "'")
    }else if(! $.new.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("second argument must be a bytes-like " +
            "object, not '" + $.sep.__class__.__name__ + "'")
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

bytes.split = function(){
    var $ = $B.args('split', 2, {self:null, sep:null}, ['self', 'sep'],
        arguments, {}, null, null),
        res = [],
        start = 0,
        stop = 0
    if(! $.sep.__class__ ){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.get_class($.start).__name__ + "'")
    }else if(! $.sep.__class__.$buffer_protocol){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $.sep.__class__.__name_ + "'")
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
        for(var i  =0; i < $.prefix.length; i++){
            if(_b_.isinstance($.prefix[i], bytes)){
                items = items.concat($.prefix[i].source)
            }else{
                throw _b_.TypeError.$factory("startswith first arg must be " +
                    "bytes or a tuple of bytes, not " +
                    $B.get_class($.prefix).__name__)
            }
        }
        var prefix = bytes.$factory(items)
        return bytes.startswith($.self, prefix, start)
    }else{
        throw _b_.TypeError.$factory("startsswith first arg must be bytes " +
            "or a tuple of bytes, not " + $B.get_class($.prefix).__name__)
    }
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
    var res = [], pos = 0
    if(isinstance(table, bytes) && table.source.length == 256){
       for (var i = 0, len = self.source.length; i < len; i++) {
           if(_delete.indexOf(self.source[i]) > -1){continue}
           res[pos++] = table.source[self.source[i]]
       }
    }
    return bytes.$factory(res)
}

var _upper = function(char_code) {
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
    var _res = [], pos = 0
    for(var i = 0, len = self.source.length; i < len; i++){
        if(self.source[i]){_res[pos++] = _upper(self.source[i])}
    }
    return bytes.$factory(_res)
}

bytes.lower = function(self) {
    var _res = [], pos = 0
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
    enc = enc.replace("-", "") // first hyphen, like in cp-1250
    enc = enc.replace("-", "_") // second, like in iso-8859-1
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
        var mod = _b_.__import__("encodings." + enc),
            table = mod[enc].decoding_table
        from_unicode[enc] = {}
        for(var i = 0; i < table.length; i++){
            from_unicode[enc][table.charCodeAt(i)] = i
        }
    }
}

function decode(b, encoding, errors){
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
                }else{$UnicodeDecodeError(encoding, i)}
            }else if(b[i] == _int_e0){
                if(i < b.length - 2){
                    var zone = b[i + 1] - _int_a0
                    cp = b[i + 2] - _int_80 + _int_800 + 64 * zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{$UnicodeDecodeError(encoding, i)}
            }else if(b[i] < _int_e3){
                if(i < b.length - 2){
                    var zone = b[i + 1] - _int_80
                    cp = b[i + 2] - _int_80 + _int_1000 + 64 * zone
                    s += String.fromCharCode(cp)
                    i += 3
                }else{$UnicodeDecodeError(encoding, i)}
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
      case "ascii":
          for(var i = 0, len = b.length; i < len; i++){
              var cp = b[i]
              if(cp <= 127){s += String.fromCharCode(cp)}
              else{
                  var msg = "'ascii' codec can't decode byte 0x" +
                    cp.toString(16) + " in position " + i +
                    ": ordinal not in range(128)"
                  throw _b_.UnicodeDecodeError.$factory(msg)
              }
          }
          break
      default:
          try{load_decoder(enc)}
          catch(err){
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

function encode(s, encoding){
    var $ = $B.args("encode", 2, {s:null, encoding:null}, ["s", "encoding"],
        arguments, {}, null, null),
        s = $.s,
        encoding = $.encoding
    var t = [],
        pos = 0,
        enc = normalise(encoding)

    switch(enc) {
        case "utf-8":
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
        default:
            try{load_encoder(enc)}
            catch(err){throw _b_.LookupError.$factory("unknown encoding: " +
                enc)}

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
            return function(){return bytes[_attr].apply(null, arguments)}
        })(attr)
    }
}

$B.set_func_names(bytes, "builtins")
$B.set_func_names(bytearray, "builtins")

_b_.bytes = bytes
_b_.bytearray = bytearray

})(__BRYTHON__)
