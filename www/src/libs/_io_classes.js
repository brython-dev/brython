(function($B){

var _b_ = $B.builtins

function get_self(name, args){
    return $B.args(name, 1, {self: null}, ["self"], args, {}, null, null).self
}

var _IOBase = $B._IOBase

/*
// Base class for binary streams that support some kind of buffering.
var _BufferedIOBase = $B.make_type("_BufferedIOBase", [_IOBase])

var _BufferedIOBase_funcs = _BufferedIOBase.tp_funcs = {}

_BufferedIOBase_funcs.__enter__ = function(self){
    return self
}
_BufferedIOBase_funcs.__exit__ = function(self, type, value, traceback){
    try{
        $B.$call($B.$getattr(self, 'close'))
        self.__closed = true
        return true
    }catch(err){
        return false
    }
}

_BufferedIOBase.tp_methods = ["__enter__", "__exit__"]

$B.set_func_names(_BufferedIOBase, '_io')
$B.finalize_type(_BufferedIOBase)
*/

_RawIOBase = $B._RawIOBase

function check_closed(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, 'I/O operation on closed file')
    }
}

function get_newlines(text, newline){
    // return all the newline sequences (\r, \n, \r\n) in text
    var newlines = new Set()
    var trailing_cr = false
    for(var char of text){
        if(char == '\n'){
            if(trailing_cr){
                newlines.add('\r\n')
                trailing_cr = false
            }else{
                newlines.add(char)
            }
            if(newlines.size == 3){
                break
            }
        }else if(char == '\r'){
            trailing_cr = true
        }else if(trailing_cr){
            newlines.add('\r')
            if(newlines.size == 3){
                break
            }
            trailing_cr = false
        }
    }
    if(trailing_cr){ // text ends with \r
        newlines.add('\r')
    }
    return newlines
}

function transform_newline(s, newline){
    switch(newline){
        case _b_.None:
            s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            break
        case '\r':
            s = s.replace(/\n/g, '\r')
            break
        case '\r\n':
            s = s.replace(/\n/g, '\r\n')
            break
    }
    return s
}

var StringIO = $B.make_type("StringIO", [$B._TextIOBase])

StringIO.tp_init = function(){
    var $ = $B.args("StringIO", 3, {self: null, value: null, newline: null},
            ["self", "value", "newline"], arguments, {value: '', newline: "\n"},
            null, null),
        value = $.value
    if(value === _b_.None){
        value = ''
    }else if(! $B.$isinstance(value, _b_.str)){
        $B.RAISE(_b_.TypeError,
            `initial_value must be str or None, not ${$B.class_name(value)}`)
    }
    var newline = $.newline
    if(newline !== _b_.None){
        if(! $B.$isinstance(newline, _b_.str)){
            $B.RAISE(_b_.TypeError,
                `newline must be str or None, not ${$B.class_name(newline)}`)
        }
    }
    if(! [_b_.None, '', '\n', '\r', '\r\n'].includes(newline)){
        $B.RAISE(_b_.ValueError, `illegal newline value: ${_b_.repr(newline)}`)
    }
    $.self.$newlines = _b_.None
    if(newline === _b_.None || newline == ''){
        // get all the newline sequences from value
        var newlines = get_newlines(value)
        if(newlines.size == 1){
            $.self.$newlines = Array.from(newlines)[0]
        }else if(newlines.size > 1){
            $.self.$newlines = $B.$list(Array.from(newlines))
        }
    }
    $.self.$newline = newline
    $.self.$text = value
    $.self.$text_pos = 0
    $.self.$text_iterator = $.self.$text[Symbol.iterator]()
    $.self.closed = false
}

var StringIO_funcs = StringIO.tp_funcs = {}

StringIO_funcs.__getstate__ = function(_self){
    check_closed(_self)

    var initvalue = StringIO.getvalue(_self)

    var dict = _self.dict ? _b_.dict.copy(_self.dict) : _b_.None

    var state = $B.fast_tuple([initvalue,
                          _self.$newline,
                          _self.$text_pos, dict])
    return state
}

StringIO_funcs.__setstate__ = function(_self, state){
    var [initvalue, readnl, pos, dict] = state
    _self.$text = initvalue
    _self.newlines = readnl
    if(dict !== _b_.None){
        _self.dict = dict
    }
    _self.$text_pos = pos
    _self.$text_iterator = _self.$text[Symbol.iterator]()
    for(var i = 0; i < pos; i++){
        _self.$text_iterator.next()
    }
}

StringIO_funcs.close = function(self){
    self.closed = true
}

StringIO_funcs.closed = $B.getset_descriptor.$factory(
    StringIO,
    'closed',
    [self => self.closed]
)

StringIO_funcs.getvalue = function(){
    var $ = $B.args("getvalue", 1, {self: null},
            ["self"], arguments, {}, null, null)
    var _self = $.self
    check_closed(_self)
    var res = _self.$text.substr(0) // copy
    if(_self.newlines == '\r'){
        res = res.replace(/\n/g, '\r')
    }
    return transform_newline(res, _self.$newline)
}

StringIO_funcs.line_buffering = $B.getset_descriptor.$factory(
    StringIO,
    'line_buffering',
    [() => false]
)

StringIO_funcs.newlines = $B.getset_descriptor.$factory(
    StringIO,
    'newlines',
    [self => self.$newlines]
)

StringIO_funcs.read = function(){
    var $ = $B.args('read', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null),
        _self = $.self,
        size = $.size

    check_closed(_self)
    var res = ''
    var nb = 0
    var last_is_cr = false
    if(size === _b_.None){
        size = -1
    }else{
        size = $B.PyNumber_Index($.size)
    }
    if(size < 0){
        size = _b_.len(_self.$text)
    }
    if(size == 0){
        return ''
    }
    if(_self.trailing_cr){
        res = _self.next_char
        delete _self.trailing_cr
        nb += 1
    }
    while(nb < size){
        var char = _self.$text_iterator.next()
        if(char.done){
            break
        }
        if(char.value == '\r' && _self.$newline == _b_.None){
            // wait in case next char is '\n'
            res += char.value
            _self.trailing_cr = true
        }else if(char.value == '\n' && _self.trailing_cr){
            // sequence \r\n
            res += char.value
            delete _self.trailing_cr
            nb += 1
        }else{
            if(_self.trailing_cr){
                // newlines is None and previous char was \r
                res += '\n'
                nb += 1
                delete _self.trailing_cr
                if(nb >= size){
                    _self.next_char = char.value
                    break
                }
            }
            res += char.value
            nb += 1
        }
        _self.$text_pos += 1
    }
    return transform_newline(res, _self.$newline)
}

StringIO_funcs.readable = function(self){
    return ! self.closed
}

StringIO_funcs.readline = function(){
    var $ = $B.args('readline', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null),
        _self = $.self,
        size = $.size
    if(size === _b_.None){
        size = -1
    }else{
        size = $B.PyNumber_Index(size)
    }
    if(size < 0){
        size = _b_.len(_self.$text)
    }
    check_closed(_self)
    var universal = [_b_.None, ''].includes(_self.$newline)
    var res = ''
    var nb = 0
    if(_self.trailing_cr){
        // we are in universal mode; in previous readline, we stopped at a
        // character after a \r, emitted the line ending at \r and saved this
        // character in _self.next_char
        res = _self.next_char
        nb = 1
        delete _self.trailing_cr
        delete _self.next_char
    }
    while(nb < size){
        var char = _self.$text_iterator.next()
        if(char.done){
            return res
        }
        nb++
        self.$text_pos++
        if(char.value == '\n'){
            if(_self.$newline == '\r'){
                res += '\r'
            }else if(_self.$newline == '\r\n'){
                res += '\r\n'
            }else{
                res += char.value
                if(_self.$newline === _b_.None){
                    res = res.replace('\r\n', '\n').replace('\r', '\n')
                }
                if(universal){
                    delete _self.trailing_cr
                }
            }
            break
        }else if(char.value == '\r'){
            if(_self.$newline == '\r'){
                res += char.value
                break
            }else{
                // wait in case next char is \n
                res += char.value
                if(universal){
                    _self.trailing_cr = true
                }
            }
        }else if(_self.trailing_cr){
            // we are in universal mode and previous char was \r
            if(_self.$newline === _b_.None){
                res = res.replace('\r', '\n')
            }
            // save current char for next iteration
            _self.next_char = char.value
            break
        }else{
            res += char.value
        }
    }
    if(_self.$newline === _b_.None){
        res = res.replace('\r\n', '\n')
    }
    return $B.String(res)
}

StringIO_funcs.seekable = function(self){
    return ! self.closed
}

StringIO_funcs.tell = function(self){
    return self.$text_pos
}

StringIO_funcs.truncate = function(self, size){
    var $ = $B.args('truncate', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: _b_.None}, null, null),
        _self = $.self,
        size = $.size
    check_closed(_self)
    if(size === _b_.None){
        size = _self.$text_pos
    }
    _self.$text_iterator = _self.$text[Symbol.iterator]()
    var res = ''
    var nb = 0
    while(true){
        var char = _self.$text_iterator.next()
        if(char.done){
            break
        }
        res += char.value
        nb += 1
        if(nb >= size){
            break
        }
    }
    _self.$text = res
    _self.$text_pos = size
    for(var _ of _self.$text_iterator){
        // exhaust so that next read() returns ''
    }
    return _self.$text_pos
}

StringIO_funcs.seek = function(self, pos, whence){
    var $ = $B.args('seek', 3, {self: null, pos: null, whence: null},
                ['self', 'pos', 'whence'], arguments, {whence: 0}, null, null),
        _self = $.self,
        pos = $.pos
        whence = $.whence

    check_closed(_self)
    pos = $B.PyNumber_Index(pos)
    if(whence != 0 && whence != 1 && whence != 2){
        $B.RAISE(_b_.ValueError,
            `Invalid whence (${whence}, should be 0, 1 or 2)`)
    }else if(pos < 0 && whence == 0){
        $B.RAISE(_b_.ValueError, `Negative seek position ${pos}`)
    }else if(whence != 0 && pos != 0){
        $B.RAISE(_b_.OSError, "Can't do nonzero cur-relative seeks")
    }

    /* whence = 0: offset relative to beginning of the string.
       whence = 1: no change to current position.
       whence = 2: change position to end of file. */
    if(whence == 1){
        pos = _self.$text_pos
    }else if(whence == 2){
        pos = _b_.len(_self.$text)
        for(var item of _self.$text_iterator){
            // exhaust iterator
        }
        _self.$text_pos = pos
    }else{
        _self.$text_pos = pos
        // reset iterator at specified position
        _self.$text_iterator = _self.$text[Symbol.iterator]()
        for(var i = 0; i < pos; i++){
            _self.$text_iterator.next()
        }
    }
    return _self.$text_pos
}

StringIO_funcs.writable = function(self){
    return ! self.closed
}

StringIO_funcs.write = function(){
    var $ = $B.args("write", 2, {self: null, data: null},
            ["self", "data"], arguments, {}, null, null)
            var _self = $.self,
                data = $.data
    if(! $B.$isinstance(data, _b_.str)){
        $B.RAISE(_b_.TypeError, 'string argument expected, got ' +
            `'${$B.class_name(data)}'`)
    }
    check_closed(_self)
    var text = _self.$text,
        position = _self.$text_pos
    if(position > text.length){
        text += String.fromCodePoint(0).repeat(position - text.length)
    }
    text = text.substr(0, position) + data +
        text.substr(position + data.length)
    _self.$text = text
    _self.$text_pos = position + data.length
    return data.length
}

StringIO.tp_methods = [
    "close", "getvalue", "read", "readline", "tell", "truncate", "seek",
    "write", "seekable", "readable", "writable", "__getstate__",
    "__setstate__"
]

StringIO.tp_getset = [
    "closed", "newlines", "line_buffering"
]

$B.set_func_names(StringIO, "_io")
$B.finalize_type(StringIO)

var BytesIO = $B.make_type('BytesIO', [$B._BufferedIOBase])

// Initialize _buffer as soon as possible since it's used by __del__()
// which calls close()
BytesIO._buffer = _b_.None

BytesIO.tp_init = function(){
    var $ = $B.args('__init__', 2, {self: null, initial_bytes: null},
            ['self', 'initial_bytes'], arguments, {initial_bytes: _b_.None},
            null, null)
    var _self = $.self,
        initial_bytes = $.initial_bytes
    var buf = _b_.bytearray.$factory()
    if(initial_bytes !== _b_.None){
        buf = _b_.bytearray.sq_concat(buf, initial_bytes)
    }
    _self._buffer = buf
    _self._pos = 0
    _self.closed = false
    _self.exports = 0
}

var BytesIO_funcs = BytesIO.tp_funcs = {}

BytesIO_funcs.__getstate__ = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "__getstate__ on closed file")
    }

    var initvalue = BytesIO.getvalue(_self)
    var dict = _self.dict ?? $B.empty_dict()

    return $B.fast_tuple([initvalue, _self._pos, dict])
}

BytesIO_funcs.__setstate__ = function(_self, state){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "__setstate__ on closed file")
    }
    if(! $B.$isinstance(state, _b_.tuple)){
        $B.RAISE(_b_.TypeError,
            `${$B.class_name(_self)}.__setstate__ argument ` +
            `should be 3-tuple, got ${$B.class_name(state)}`)
    }
    if(state.length < 3){
        $B.RAISE(_b_.TypeError,
            `${$B.class_name(_self)}.__setstate__ argument ` +
            `should be 3-tuple, got tuple of size ${state.length}`)
    }
    var [initvalue, position, dict] = state
    var obj = $B.$call(BytesIO, initvalue)

    if(! $B.$isinstance(position, _b_.int)){
        $B.RAISE(_b_.TypeError, "second item of state must be an integer, " +
            `not ${$B.class_name(position)}`)
    }
    if(position < 0){
        $B.RAISE(_b_.ValueError, "position value cannot be negative")
    }
    obj._pos = position

    if(dict != _b_.None){
        if(! $B.$isinstance(dict, _b_.dict)){
            $B.RAISE(_b_.TypeError, "third item of state should be a dict, " +
                `got a ${$B.class_name(dict)}`)
        }
        _self.dict = dict
    }

    return _b_.None
}

BytesIO_funcs.getvalue = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "getvalue on closed file")
    }
    return _b_.bytes.$factory(_self._buffer)
}

BytesIO_funcs.getbuffer = function(self){
    if(self.closed){
        $B.RAISE(_b_.ValueError, "getbuffer on closed file")
    }
    self.exports++
    return _b_.memoryview.$factory(self._buffer)
}

BytesIO_funcs.isatty = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "isatty on closed file")
    }
    return false
}

BytesIO_funcs.close = function(_self){
    if(_self._buffer !== _b_.None){
        $B.$call($B.$getattr(_self._buffer, 'clear'))
    }
    _self.exports = 0
    $B._BufferedIOBase.close(_self)
}

BytesIO_funcs.read = function(){
    var $ = $B.args('read', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null)
    var _self = $.self,
        size = $.size

    if(_self.closed){
        $B.RAISE(_b_.ValueError, "read from closed file")
    }
    if(size === _b_.None){
        size = -1
    }else{
        var failed = false
        try{
            var size_index = $B.$getattr(size, '__index__')
        }catch(err){
            failed = true
            if($B.is_exc(err, [_b_.AttributeError])){
                $B.RAISE(_b_.TypeError, `${size} is not an integer`)
            }
        }
        if(! failed){
            size = $B.$call(size_index)
        }
    }
    if(size < 0){
        size = _b_.len(_self._buffer)
    }
    if(_b_.len(_self._buffer) <= _self._pos){
        return _b_.bytes.$factory()
    }
    var newpos = Math.min(_b_.len(_self._buffer), _self._pos + size)
    var b = _b_.bytes.mp_subscript(_self._buffer,
        _b_.slice.$factory(_self._pos, newpos))
    _self._pos = newpos
    return b
}

BytesIO_funcs.read1 = function(_self, size=-1){
    return BytesIO.tp_funcs.read(_self, size)
}

BytesIO_funcs.readinto = function(_self, buffer){
    check_closed(_self)

    if(! $B.is_buffer(buffer)){
        $B.RAISE(_b_.TypeError, " readinto() argument must be " +
            `read-write bytes-like object, not ${$B.class_name(buffer)}`)
    }

    /* adjust invalid sizes */
    var len = _b_.len(buffer)
    var n = _self._buffer.source.length - _self._pos
    if(len > n){
        len = n
        if(len < 0){
            len = 0
        }
    }
    var buf = $B.$isinstance(buffer, _b_.bytearray) ? buffer.source : buffer.obj
    for(var i = 0; i < len; i++){
        buf[i] = _self._buffer.source[_self._pos + i]
    }
    _self._pos += len

    return len
}

BytesIO_funcs.readline = function(){
    var $ = $B.args('readline', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null),
        self = $.self,
        size = $.size
    var bytes = self._buffer.source
    var len = bytes.length
    if(size === _b_.None){
        size = -1
    }else{
        size = $B.PyNumber_Index(size)
    }
    if(size < 0){
        size = len
    }
    check_closed(self)
    var nb = 0
    var pos = self._pos
    const EOL = '\n'.charCodeAt(0)
    while(nb < size && pos + nb < len && bytes[pos + nb] !== EOL){
        nb++
    }
    var res = $B.fast_bytes(bytes.slice(pos, pos + nb + 1))
    self._pos += nb + 1
    return res
}

BytesIO_funcs.readlines = function(){
    var $ = $B.args('readlines', 2, {self: null, hint: null},
                ['self', 'hint'], arguments, {hint: -1}, null, null)
    var self = $.self,
        hint = $B.PyNumber_Index($.hint)
    var lines = []
    var size = 0
    while(true){
        var line = BytesIO.tp_funcs.readline(self)
        if(line.source.length === 0){
            break
        }
        lines.push(line)
        size += line.source.length
        if(hint > 0 && size > hint){
            break
        }
    }
    return lines
}

BytesIO_funcs.write = function(_self, b){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "write to closed file")
    }
    if($B.$isinstance(b, _b_.str)){
        $B.RAISE(_b_.TypeError, "can't write str to binary stream")
    }

    var view = _b_.memoryview.$factory(b)
    var n = _b_.memoryview.tp_funcs.nbytes_get(view)  // Size of any bytes-like object
    if(n == 0){
        return 0
    }
    var pos = _self._pos
    if(pos > _b_.len(_self._buffer)){
        // Pad buffer to pos with null bytes.
        $B.$call($B.$getattr(_self._buffer, 'resize'), pos)
    }
    _b_.bytearray.sq_ass_item(_self._buffer, _b_.slice.$factory(pos, pos + n), b)
    _self._pos += n
    return n
}

BytesIO_funcs.seek = function(_self, pos, whence=0){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "seek on closed file")
    }
    var failed = false
    try{
        var pos_index = $B.$getattr(pos, '__index__')
    }catch(err){
        failed = true
        if($B.is_exc(err, [_b_.AttributeError])){
            $B.RAISE(_b_.TypeError, `${pos} is not an integer`)
        }
    }
    if(! failed){
        pos = $B.$call(pos_index)
    }
    if(whence == 0){
        if(pos < 0){
            $B.RAISE(_b_.ValueError, `negative seek position ${pos}`)
        }
        _self._pos = pos
    }else if(whence == 1){
        _self._pos = Math.max(0, _self._pos + pos)
    }else if(whence == 2){
        _self._pos = Math.max(0, _b_.len(_self._buffer) + pos)
    }else{
        $B.RAISE(_b_.ValueError, "unsupported whence value")
    }
    return _self._pos
}

BytesIO_funcs.tell = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "tell on closed file")
    }
    return _self._pos
}

BytesIO_funcs.truncate = function(_self, pos=_b_.None){
    var $ = $B.args('truncate', 2, {self: null, pos: null}, ['self', 'pos'],
                arguments, {pos: _b_.None}, null, null)
    var _self = $.self,
        pos = $.pos
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "truncate on closed file")
    }
    if(pos === _b_.None){
        pos = _self._pos
    }else{
        failed = false
        try{
            var pos_index = $B.$getattr(pos, '__index__')
        }catch(err){
            failed = true
            if($B.is_exc(err, [_b_.AttributeError])){
                $B.RAISE(_b_.TypeError, `${pos} is not an integer`)
            }
        }
        if(! failed){
            pos = $B.$call(pos_index)
        }
        if(pos < 0){
            $B.RAISE(_b_.ValueError, `negative truncate position ${pos}`)
        }
    }
    _b_.bytearray.tp_funcs.resize(_self._buffer, pos)
    return pos
}

BytesIO_funcs.readable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

BytesIO_funcs.writable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

BytesIO_funcs.seekable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

BytesIO.tp_methods = [
    "__getstate__", "__setstate__", "getvalue", "getbuffer", "isatty", "close",
    "read", "read1", "readinto", "readline", "readlines", "write", "seek",
    "tell", "truncate", "readable"
]

$B.set_func_names(BytesIO, '_io')
$B.finalize_type(BytesIO)

var BlockingIOError = $B.make_type('BlockingIOError', [_b_.OSError])

$B.set_func_names(BlockingIOError, '_io')
$B.finalize_type(BlockingIOError)

// generate $B._IOUnsupported if not defined yet
$B.make_IOUnsupported()

var BufferedWriter = $B.make_type("BufferedWriter", [$B._TextIOBase])

BufferedWriter.$factory = function(){
    return "fileio"
}

$B.finalize_type(BufferedWriter)

var BufferedRWPair = $B.make_type("BufferedRWPair", [$B._TextIOBase])

BufferedRWPair.$factory = function(){
    return "fileio"
}

$B.finalize_type(BufferedRWPair)

var BufferedRandom = $B.make_type("BufferedRandom", [$B._TextIOBase])

BufferedRandom.$factory = function(){
    return "fileio"
}

$B.finalize_type(BufferedRandom)

var IncrementalNewlineDecoder = $B.make_type("IncrementalNewlineDecoder", [$B._TextIOBase])

IncrementalNewlineDecoder.$factory = function(){
    return "fileio"
}

$B.finalize_type(IncrementalNewlineDecoder)

var module = {
    _BufferedIOBase: $B._BufferedIOBase,
    _IOBase,
    _RawIOBase,
    _TextIOBase: $B._TextIOBase,
    BlockingIOError,
    BytesIO: BytesIO,
    FileIO: $B._FileIO,
    StringIO: StringIO,
    BufferedReader: $B._BufferedReader,
    BufferedWriter,
    BufferedRWPair,
    BufferedRandom,
    IncrementalNewlineDecoder,
    UnsupportedOperation: $B._IOUnsupported,
    TextIOWrapper: $B._TextIOWrapper
}

$B.addToImported('_io_classes', module)


})(__BRYTHON__)
