var _b_ = __BRYTHON__.builtins

function get_self(name, args){
    return $B.args(name, 1, {self: null}, ["self"], args, {}, null, null).self
}

var _IOBase = $B._IOBase //$B.make_class("_IOBase")
_IOBase.__mro__ = [_b_.object]

_IOBase.close = function(){
    get_self("close", arguments).closed = true
}

_IOBase.flush = function(){
    get_self("flush", arguments)
    return _b_.None
}

$B.set_func_names(_IOBase, '_io')

// Base class for binary streams that support some kind of buffering.
var _BufferedIOBase = $B.make_class("_BufferedIOBase")
_BufferedIOBase.__mro__ = [_IOBase, _b_.object]

_BufferedIOBase.__enter__ = function(self){
    return self
}
_BufferedIOBase.__exit__ = function(self, type, value, traceback){
    try{
        $B.$call($B.$getattr(self, 'close'))()
        self.__closed = true
        return true
    }catch(err){
        return false
    }
}

$B.set_func_names(_BufferedIOBase, '_io')

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

var StringIO = $B.make_class("StringIO")

StringIO.__init__ = function(){
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

StringIO.__mro__ = [$B._TextIOBase, $B._IOBase, _b_.object]

StringIO.__getstate__ = function(_self){
    check_closed(_self)

    var initvalue = StringIO.getvalue(_self)

    var dict = _self.__dict__ ? _b_.dict.copy(_self.__dict__) : _b_.None

    var state = $B.fast_tuple([initvalue,
                          _self.$newline,
                          _self.$text_pos, dict])
    return state
}

StringIO.__setstate__ = function(_self, state){
    var [initvalue, readnl, pos, dict] = state
    _self.$text = initvalue
    _self.newlines = readnl
    if(dict !== _b_.None){
        _self.__dict__ = dict
    }
    _self.$text_pos = pos
    _self.$text_iterator = _self.$text[Symbol.iterator]()
    for(var i = 0; i < pos; i++){
        _self.$text_iterator.next()
    }
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

StringIO.getvalue = function(){
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

StringIO.line_buffering = $B.getset_descriptor.$factory(
    StringIO,
    'line_buffering',
    function(){
        return false
    }
)

StringIO.newlines = $B.getset_descriptor.$factory(
    StringIO,
    'newlines',
    function(self){
        return self.$newlines
    }
)

StringIO.read = function(){
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

StringIO.readline = function(){
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

StringIO.truncate = function(self, size){
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

StringIO.seek = function(self, pos, whence){
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

StringIO.write = function(){
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

$B.set_func_names(StringIO, "_io")

var BytesIO = $B.make_class('BytesIO')

BytesIO.__bases__ = [$B._BufferedIOBase]
BytesIO.__mro__ = _b_.type.$mro(BytesIO)

// Initialize _buffer as soon as possible since it's used by __del__()
// which calls close()
BytesIO._buffer = _b_.None

BytesIO.__init__ = function(){
    var $ = $B.args('__init__', 2, {self: null, initial_bytes: null},
            ['self', 'initial_bytes'], arguments, {initial_bytes: _b_.None},
            null, null)
    var _self = $.self,
        initial_bytes = $.initial_bytes
    var buf = _b_.bytearray.$factory()
    if(initial_bytes !== _b_.None){
        buf = _b_.bytearray.__add__(buf, initial_bytes)
    }
    _self._buffer = buf
    _self._pos = 0
    _self.closed = false
    _self.$exports = 0
}

BytesIO.__getstate__ = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "__getstate__ on closed file")
    }

    var initvalue = BytesIO.getvalue(_self)
    var dict = _self.dict ?? $B.empty_dict()

    return $B.fast_tuple([initvalue, _self._pos, dict])
}

BytesIO.__setstate__ = function(_self, state){
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
    var obj = $B.$call(BytesIO)(initvalue)

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
        if(_self.__dict__){
            _b_.dict.update(_self.__dict__, dict)
        }else{
            _self.__dict__ = dict
        }
    }

    return _b_.None
}

BytesIO.getvalue = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "getvalue on closed file")
    }
    return _b_.bytes.$factory(_self._buffer)
}

BytesIO.getbuffer = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "getbuffer on closed file")
    }
    _self.$exports++
    return _b_.memoryview.$factory(_self._buffer)
}

BytesIO.isatty = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "isatty on closed file")
    }
    return false
}

BytesIO.close = function(_self){
    if(_self._buffer !== _b_.None){
        $B.$call($B.$getattr(_self._buffer, 'clear'))()
    }
    _self.$exports = 0
    $B._BufferedIOBase.close(_self)
}

BytesIO.read = function(){
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
            size = $B.$call(size_index)()
        }
    }
    if(size < 0){
        size = _b_.len(_self._buffer)
    }
    if(_b_.len(_self._buffer) <= _self._pos){
        return _b_.bytes.$factory()
    }
    var newpos = Math.min(_b_.len(_self._buffer), _self._pos + size)
    var b = _b_.bytes.__getitem__(_self._buffer,
        _b_.slice.$factory(_self._pos, newpos))
    _self._pos = newpos
    return b
}

BytesIO.read1 = function(_self, size=-1){
    return BytesIO.read(_self, size)
}

BytesIO.readinto = function(_self, buffer){
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


BytesIO.write = function(_self, b){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "write to closed file")
    }
    if($B.$isinstance(b, _b_.str)){
        $B.RAISE(_b_.TypeError, "can't write str to binary stream")
    }

    var view = _b_.memoryview.$factory(b)
    var n = _b_.memoryview.nbytes.getter(view)  // Size of any bytes-like object
    if(n == 0){
        return 0
    }
    var pos = _self._pos
    if(pos > _b_.len(_self._buffer)){
        // Pad buffer to pos with null bytes.
        $B.$call($B.$getattr(_self._buffer, 'resize'))(pos)
    }
    _b_.bytearray.__setitem__(_self._buffer, _b_.slice.$factory(pos, pos + n), b)
    _self._pos += n
    return n
}

BytesIO.seek = function(_self, pos, whence=0){
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
        pos = $B.$call(pos_index)()
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

BytesIO.tell = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "tell on closed file")
    }
    return _self._pos
}

BytesIO.truncate = function(_self, pos=_b_.None){
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
            pos = $B.$call(pos_index)()
        }
        if(pos < 0){
            $B.RAISE(_b_.ValueError, `negative truncate position ${pos}`)
        }
    }
    _b_.bytearray.resize(_self._buffer, pos)
    return pos
}

BytesIO.readable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

BytesIO.writable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

BytesIO.seekable = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return true
}

$B.set_func_names(BytesIO, '_io')

var BlockingIOError = $B.make_class('BlockingIOError')
BlockingIOError.__bases__ = [_b_.OSError]

$B.set_func_names(BlockingIOError, '_io')

// generate $B._IOUnsupported if not defined yet
$B.make_IOUnsupported()

var $module = (function($B){
    return {
        _BufferedIOBase,
        _IOBase,
        _RawIOBase,
        _TextIOBase: $B._TextIOBase,
        BlockingIOError,
        BytesIO: BytesIO,
        FileIO: $B._FileIO,
        StringIO: StringIO,
        BufferedReader: $B._BufferedReader,
        BufferedWriter: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        BufferedRWPair: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        BufferedRandom: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        IncrementalNewlineDecoder: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        UnsupportedOperation: $B._IOUnsupported,
        TextIOWrapper: $B._TextIOWrapper
    }
})(__BRYTHON__)
$module._IOBase.__doc__ = "_IOBase"

__BRYTHON__.imported._io_classes = $module