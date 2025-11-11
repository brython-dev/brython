var _b_ = __BRYTHON__.builtins

function get_self(name, args){
    return $B.args(name, 1, {self: null}, ["self"], args, {}, null, null).self
}

var _IOBase = $B._IOBase //$B.make_class("_IOBase")
_IOBase.__mro__ = [_b_.object]

_IOBase.close = function(){
    get_self("close", arguments).__closed = true
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

/*
// Base class for raw binary I/O.
var _RawIOBase = $B.make_class("_RawIOBase")

_RawIOBase.__mro__ = [_IOBase, _b_.object]

_RawIOBase.read = function(){
    var $ = $B.args("read", 2, {self: null, size: null}, ["self", "size"],
                    arguments, {size: -1}, null, null),
        self = $.self,
        size = $.size,
        res
    self.$pos = self.$pos || 0
    if(size == -1){
        if(self.$pos == 0){
            res = self.$content
        }else{
            res = _b_.bytes.$factory(self.$content.source.slice(self.$pos))
        }
        self.$pos = self.$content.source.length - 1
    }else{
        res = _b_.bytes.$factory(self.$content.source.slice(self.$pos, size))
        self.$pos += size
    }
    return res
}

_RawIOBase.readall = function(){
    return _RawIOBase.read(get_self("readall", arguments))
}

$B.set_func_names(_RawIOBase, '_io')
*/
_RawIOBase = $B._RawIOBase

// Base class for text streams.
_TextIOBase = $B.make_class("_TextIOBase")
_TextIOBase.__mro__ = [_IOBase, _b_.object]

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
    $.self.newlines = $.newline
    $.self.$text = value
    $.self.$text_pos = 0
    $.self.$text_iterator = $.self.$text[Symbol.iterator]()
}

StringIO.__mro__ = [$B._TextIOBase, $B._IOBase, _b_.object]

StringIO.__getstate__ = function(_self){
    var initvalue = StringIO.getvalue(_self)

    var dict = _self.__dict__ ? _b_.dict.copy(_self.__dict__) : _b_.None

    var state = $B.fast_tuple([initvalue,
                          _self.newlines ? _self.newlines : _b_.None,
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

StringIO.getvalue = function(){
    var $ = $B.args("getvalue", 1, {self: null},
            ["self"], arguments, {}, null, null)
    return $.self.$text.substr(0) // copy
}

StringIO.read = function(){
    var $ = $B.args('read', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null),
        _self = $.self,
        size = $.size

    var res = ''
    var nb = 0
    if(_self.$text_iterator === undefined){
        console.log('undef 114', _self)
    }
    while(true){
        var char = _self.$text_iterator.next()
        if(char.done){
            return res
        }
        res += char.value
        nb += 1
        _self.$text_pos += 1
        if(size > 0 && nb > size){
            return res
        }
    }
    return nb
}

StringIO.readline = function(){
    var $ = $B.args('readline', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: -1}, null, null),
        _self = $.self,
        size = $.size

    var res = ''
    var nb = 0
    while(true){
        var char = _self.$text_iterator.next()
        if(char.done){
            return res
        }
        res += char.value
        nb += 1
        self.$text_pos += 1
        if(size > 0 && nb > size){
            return res
        }else if(char.value == '\n'){
            return res
        }
    }
}

StringIO.truncate = function(self, size){
    var $ = $B.args('truncate', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: _b_.None}, null, null),
        self = $.self,
        size = $.size
    if(size === _b_.None){
        size = self.$text_pos
    }
    self.$text = self.$text.substr(0, size)
    self.$text_pos = self.$text.length
    return self.$text_pos
}

StringIO.seek = function(self, pos, whence){
    var $ = $B.args('seek', 3, {self: null, pos: null, whence: null},
                ['self', 'pos', 'whence'], arguments, {whence: 0}, null, null),
        _self = $.self,
        pos = $.pos
        whence = $.whence

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
        pos = _self.$text_length
    }

    _self.$text_pos = pos
    // reset iterator
    _self.$text_iterator = _self.$text[Symbol.iterator]()
    for(var i = 0; i < pos; i++){
        _self.$text_iterator.next()
    }
    return _self.$text_pos
}

StringIO.write = function(){
    var $ = $B.args("write", 2, {self: null, data: null},
            ["self", "data"], arguments, {}, null, null)
    if(! $B.$isinstance($.data, _b_.str)){
        $B.RAISE(_b_.TypeError, 'string argument expected, got ' +
            `'${$B.class_name($.data)}'`)
    }
    var text = $.self.$text,
        position = $.self.$text_pos
    if(position > text.length){
        text += String.fromCodePoint(0).repeat(position - text.length)
    }
    text = text.substr(0, position) + $.data +
        text.substr(position + $.data.length)
    $.self.$text = text
    $.self.$text_pos = position + $.data.length
    return $.data.length
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
}

BytesIO.__getstate__ = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "__getstate__ on closed file")
    }
    return $B.$call($B.$getattr($B.$getattr(_self, '__dict__'), 'copy'))()
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

BytesIO.write = function(_self, b){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, "write to closed file")
    }
    if($B.$isinstance(b, _b_.str)){
        $B.RAISE(_b_.TypeError, "can't write str to binary stream")
    }
    if(_self._buffer.$exports){
        $B.RAISE(_b_.BufferError,
            'Existing exports of data: object cannot be re-sized')
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