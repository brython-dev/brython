// built-in io classes and open()
(function($B){
"use strict";

var _b_ = $B.builtins
var IOUnsupported

const DEFAULT_BUFFER_SIZE = (128 * 1024)  /* bytes */

$B.make_IOUnsupported = function(){
    if($B._IOUnsupported === undefined){
        $B._IOUnsupported = $B.make_class('UnsupportedOperation')
        $B._IOUnsupported.__bases__ = [_b_.OSError, _b_.ValueError]
        $B._IOUnsupported.__mro__ = _b_.type.$mro($B._IOUnsupported)
        $B._IOUnsupported.__module__ = '_io'
    }
}

function _io_unsupported(value){
    $B.make_IOUnsupported()
    throw $B.$call($B._IOUnsupported)(value)
}

var _IOBase = $B.make_class("_IOBase")

_IOBase.__del__ = function(_self){
    // Destructor.  Calls close()
    console.log('del', _self)
    try{
        var closed = $B.$getattr(_self, 'closed')
    }catch(err){
        if($B.is_exc(err, _b_.AttributeError)){
            // If getting closed fails, then the object is probably
            // in an unusable state, so ignore.
            return
        }
    }
    if(closed){
        return
    }

    $B$call($B.$getattr(_self, 'close'))()
}

_IOBase.__enter__ = function(self){
    return self
}

_IOBase.__exit__ = function(self){
    _IOBase.close(self)
}

_IOBase.__iter__ = function(_self){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, 'closed')
    }
    return _self
}

_IOBase.__next__ = function(_self){
    var readline = $B.search_in_mro($B.get_class(_self), 'readline')
    var line = readline(_self)

    if(line == undefined || _b_.len(line) === 0){
        $B.RAISE(_b_.StopIteration, '')
    }
    return line;
}

_IOBase.__del__ = function(_self){
    return _IOBase.close(_self)
}

_IOBase.close = function(_self){
    _self._closed = true
}

_IOBase.fileno = function(_self){
    _io_unsupported('fileno')
    // return _self._fileno ?? (_self._fileno = $B.UUID(), _self._fileno)
}

_IOBase.flush = function(_self){
    if(_self._closed){
        $B.RAISE(_b_.ValueError, "I/O operation on closed file.")
    }
    return _b_.None
}

_IOBase.isatty = function(){
    return false
}

_IOBase.readable = function(){
    return false
}

function make_lines(self){
    // If the stream "self" has no attribute $lines, build it as a list of
    // strings if the stream is opened on text mode, of bytes otherwise
    if(self.$lines === undefined){
        if(! self.$binary){
            self.$lines = self.$content.split("\n")
            if($B.last(self.$lines) == ''){
                self.$lines.pop()
            }
            self.$lines = self.$lines.map(x => x + '\n')
        }else{
            var lines = [],
                pos = 0,
                source = self.$content.source,
                len = source.length
            while(pos < len){
                var ix = source.indexOf(10, pos)
                if(ix == -1){
                    lines.push({__class__: _b_.bytes, source: source.slice(pos)})
                    break
                }else{
                    lines.push({
                        __class__: _b_.bytes,
                        source: source.slice(pos, ix + 1)
                    })
                    pos = ix + 1
                }
            }
            self.$lines = lines
        }
    }
}

_IOBase.readline = function(_self, limit=-1){
    var $ = $B.args('readline', 2, {self: null, limit: null},
                ['self', 'limit'], arguments, {limit: -1}, null, null),
        _self = $.self,
        limit = $.limit
    var old_size = -1

    var peek = $B.$getattr(_self, "peek", null)

    var buffer = _b_.bytearray.$factory()

    limit = $B.PyNumber_Index(limit)

    while (limit < 0 || _b_.len(buffer) < limit) {
        var nreadahead = 1
        var b

        if(peek != null){
            var readahead = peek(1)
            if (! $B.$isinstance(readahead, _b_.bytes)) {
                $B.RAISE(_b_.OSError,
                     "peek() should have returned a bytes object, " +
                     `not '${$B.class_name(readahead)}'`)
            }
            if(readahead.length > 0){
                var n = 0
                var buf = _b_.bytes.$decode(readahead, 'latin-1')
                if(limit >= 0){
                    while(true) {
                        if(n >= readahead.length || n >= limit){
                            break
                        }
                        if(buf[n++] == '\n'){
                            break
                        }
                    }
                }else{
                    while(true){
                        if(n >= readahead.length){
                            break
                        }
                        if($B.$getitem(buffer, n++) == '\n'){
                            break
                        }
                    }
                }
                nreadahead = n
            }
        }

        var read = $B.search_in_mro($B.get_class(_self), "read")
        b = $B.$call(read)(_self, nreadahead)
        if(! $B.$isinstance(b, _b_.bytes)) {
            $B.RAISE(_b_.OSError,
                "read() should have returned a bytes object, " +
                `not '${$B.class_name(b)}'`)
        }
        if(_b_.len(b) == 0){
            break;
        }

        _b_.bytearray.extend(buffer, b)

        if($B.last(_b_.list.$factory(buffer)) == 10){ // ends with '\n')
            break
        }
    }
    return $B.$call(_b_.bytes)(buffer)
}

_IOBase.readlines = function(_self, hint){
    var $ = $B.args('readlines', 2, {self: null, hint: null}, ['self', 'hint'],
            arguments, {hint: -1}, null, null)
    var _self=  $.self,
        hint = $.hint
    var length = 0;
    var result, it

    if(hint === _b_.None){
        hint = -1
    }else{
        hint = $B.PyNumber_Index(hint)
    }
    result = $B.$list([])

    if(hint <= 0){
        return _b_.list.$factory(_self)
    }

    var readline = $B.search_in_mro($B.get_class(_self), 'readline')

    var nb = 0

    while(true){
        nb++
        if(nb > 5000){
            console.log('overflow', result)
            break
        }
        var line = readline(_self)
        var line_length = _b_.len(line)

        if(line_length == 0){
            break
        }else{
            result[result.length] = line
        }
        if(line_length > hint - length){
            break
        }
        length += line_length
    }
    return result
}

_IOBase.seek = function(_self){
    _io_unsupported('seek')
}

_IOBase.seekable = function(){
    return false
}

_IOBase.tell = function(self){
    return $B.$getattr(self, 'seek')(0, 1)
}

/*
_IOBase.write = function(_self, data){
    if(_self.mode.indexOf('w') == -1){
        if($B.$io.UnsupportedOperation === undefined){
            $B.$io.UnsupportedOperation = $B.$class_constructor(
                "UnsupportedOperation", {}, [_b_.Exception],
                ["Exception"])
        }
        throw $B.$call($B.$io.UnsupportedOperation)('not writable')
    }
    // write to file cache
    if(_self.mode.indexOf('b') == -1){
        // text mode
        if(typeof data != "string"){
            $B.RAISE(_b_.TypeError, 'write() argument must be str,' +
                ` not ${$B.class_name(data)}`)
        }
        _self.$content += data
    }else{
        if(! $B.$isinstance(data, [_b_.bytes, _b_.bytearray])){
            $B.RAISE(_b_.TypeError, 'write() argument must be bytes,' +
                ` not ${$B.class_name(data)}`)
        }
        _self.$content.source = _self.$content.source.concat(data.source)
    }
    $B.file_cache[_self.name] = _self.$content
}
*/

_IOBase.truncate = function(){
    _io_unsupported('truncate')
}

_IOBase.writable = function(){
    return false
}

_IOBase.writelines = function(_self, lines){
    if(_self.closed){
        return _b_.None
    }
    var iter = $B.make_js_iterator(lines)
    var writer = $B.search_in_mro($B.get_class(_self), 'write')
    if(writer === undefined){
        $B.RAISE_ATTRIBUTE_ERROR(
            `'${$B.class_name(_self)}' object has no attribute 'write'`,
            _self, 'write')
    }

    for(var line of iter){
        writer(_self, line)
    }
    return _b_.None
}

_IOBase.writelines = function(_self, lines){
    var iter, res;

    if(_self.closed){
        $B.RAISE(_b_.OSError, 'closed')
    }
    var writer = $B.$call($B.$getattr(_self, 'write'))
    for(var line of $B.make_js_iterator(lines)){
        writer(line)
    }
    return _b_.None
}

$B.set_func_names(_IOBase, "builtins")

$B._RawIOBase = $B.make_class('_io._RawIOBase') // Base class for raw binary streams.

$B._RawIOBase.__bases__ = [_IOBase]
$B._RawIOBase.__mro__ = [_IOBase, _b_.object]

$B._RawIOBase.read = function(_self, n){
    var b, res

    if(n < 0){
        return $B.$call($B.$getattr(_self, "readall"))
    }

    b = _b_.bytearray.$factory()

    $B.$call($B.$getattr(_self, "readinto"))(b)

    return b
}

$B._RawIOBase.readall = function(_self){
    var r
    var chunks = []
    var result

    while (1) {
        var data = $B.$call($B.$getattr(_self, "read"))(DEFAULT_BUFFER_SIZE)
        if(data === _b_.None){
            if (chunks.length == 0) {
                return data
            }
            break
        }
        if(! $B.$isinstance(data, _b_.bytes)){
            $B.RAISE(_b_.TypeError, "read() should return bytes")
        }
        if(_b_.len(data) == 0){
            break
        }
        chunks.push(data)
    }
    result = _b_.bytes.join(_b_.bytes.$fast_bytes([]), chunks)
    return result
}

$B._RawIOBase.readinto = function(_self, b){
    throw _b_.NotImplementedError('readinto')
}

$B._RawIOBase.write = function(){
    throw _b_.NotImplementedError('readinto')
}

$B.set_func_names($B._RawIOBase, "_io")

$B._BufferedIOBase = $B.make_class('_BufferedIOBase')
$B._BufferedIOBase.__bases__ = [_IOBase]
$B._BufferedIOBase.__mro__ = [_IOBase, _b_.object]

$B.is_buffer = function(obj){
    if($B.get_class(obj).$buffer_protocol){
        return true
    }
    for(var klass of $B.get_class(obj).__mro__){
        if(klass.$buffer_protocol){
            return true
        }
    }
    return false
}

function _bufferediobase_readinto_generic(_self, buffer, readinto1){
    var len, data

    if(! $B.is_buffer(buffer)){
        $B.RAISE(_b_.TypeError, " readinto() argument must be " +
            `read-write bytes-like object, not ${$B.class_name(buffer)}`)
    }

    var attr = readinto1 ? "read1" : "read"
    data = $B.$call($B.$getattr(_self, attr))(_b_.len(buffer))

    if(! $B.$isinstance(data, _b_.bytes)) {
        $B.RAISE(_b_.TypeError, "read() should return bytes")
    }

    len = _b_.bytes.__len__(data)
    if(len > _b_.len(buffer)) {
        $B.RAISE(_b_.ValueError,
            "read() returned too much data: "
            `${_b_.len(buffer)} bytes requested, ${len} returned`)
    }
    var setitem = $B.search_in_mro($B.get_class(buffer), '__setitem__')
    $B.$call(setitem)(buffer, _b_.slice.$factory(0, len), data)

    return len
}

$B._BufferedIOBase.readinto = function(_self, buffer){
    return _bufferediobase_readinto_generic(_self, buffer, 0);
}

$B._BufferedIOBase.readinto1 = function(_self, buffer){
    return _bufferediobase_readinto_generic(_self, buffer, 1);
}

$B._BufferedIOBase.close = function(_self){
    _self.closed = true
}

$B._BufferedIOBase.detach = function(){
    _io_unsupported("detach")
}

$B._BufferedIOBase.read = function(){
    _io_unsupported("read")
}

$B._BufferedIOBase.read1 = function(){
    _io_unsupported("read1")
}

$B._BufferedIOBase.write = function(){
    _io_unsupported("write")
}

$B.set_func_names($B._BufferedIOBase, '_io')

function _bufferedreader_read_all(_self){
    return $B.$call($B.$getattr(_self.raw, 'readall'))()
}

function _bufferedreader_read_fast(_self, n){
    var raw = _self.raw
    if(raw.$byte_pos >= raw.$bytes.length){
        return _b_.None
    }
    var b = raw.$bytes.slice(raw.$byte_pos, raw.$byte_pos + n)
    raw.$byte_pos += n
    raw.$byte_pos = Math.min(raw.$byte_pos, raw.$bytes.length)
    return $B.fast_bytes(b)
}

function _bufferedreader_readline(_self){
    var raw = _self.raw
    if(raw.$byte_pos >= raw.$bytes.length){
        return $B.fast_bytes()
    }
    var eof = raw.$byte_pos
    while(eof < raw.$bytes.length){
        if(raw.$bytes[eof] == 10){
            break
        }
        eof++
    }
    var b = raw.$bytes.slice(raw.$byte_pos, eof + 1)
    raw.$byte_pos = eof + 1
    raw.$byte_pos = Math.min(raw.$byte_pos, raw.$bytes.length)
    return $B.fast_bytes(b)
}

$B._BufferedReader = $B.make_class('_BufferedReader')
$B._BufferedReader.__bases__ = [$B._BufferedIOBase]
$B._BufferedReader.__mro__ = _b_.type.$mro($B._BufferedReader)

$B._BufferedReader.__init__ = function(_self, raw, buffer_size=DEFAULT_BUFFER_SIZE){
    _self.raw = raw
    _self.buffer_size = buffer_size
}

$B._BufferedReader.peek = function(_self, size){
    var $ = $B.args('peek', 2, {self: null, size: null}, ['self', 'size'],
                arguments, {size: 0}, null, null),
        _self = $.self,
        size = $.size
    var raw = _self.raw
    return $B.fast_bytes(raw.$bytes.slice(raw.$byte_pos, raw.$byte_pos + size))
}

$B._BufferedReader.seek = function(_self, offset, whence){
    var $ = $B.args('seek', 2, {self: null, offset: null, whence: null},
                ['self', 'offset', 'whence'],
                arguments, {whence: 0}, null, null),
        _self = $.self,
        offset = $.offset,
        whence = $.whence
    if(_self.closed){
        $B.RAISE(_b_.ValueError, 'I/O operation on closed file')
    }
    if(whence === undefined){
        whence = 0
    }
    if(whence === 0){
        _self.$byte_pos = offset
    }else if(whence === 1){
        _self.$byte_pos += offset
    }else if(whence === 2){
        _self.$byte_pos = self.$bytes.length + offset
    }
    return _b_.None
}

function CHECK_CLOSED(fileobj, msg){
    if(fileobj.closed){
        $B.RAISE(_b_.ValueError, msg)
    }
}

$B._BufferedReader.read = function(_self, n=-1){
    var res

    if(n < -1){
        $B.RAISE(_b_.ValueError, "read length must be non-negative or -1")
    }

    CHECK_CLOSED(self, "read of closed file")

    if(n == -1){
        /* The number of bytes is unspecified, read until the end of stream */
        res = _bufferedreader_read_all(_self)
    }else{
        res = _bufferedreader_read_fast(_self, n)
        if (res != _b_.None){
            return res
        }
        return $B.fast_bytes()
    }
    return res
}

$B._BufferedReader.readline = function(_self, size=-1){
    return _bufferedreader_readline(_self)
}

$B.set_func_names($B._BufferedReader, '_io')

$B._FileIO = $B.make_class('_FileIO')
$B._FileIO.__bases__ = [$B._RawIOBase]
$B._FileIO.__mro__ = _b_.type.$mro($B._FileIO)

function bad_mode(){
    $B.RAISE(_b_.ValueError,
        "Must have exactly one of create/read/write/append " +
        "mode and at most one plus")
}

function err_closed(){
    $B.RAISE(_b_.ValueError, "I/O operation on closed file")
}

const O_RDONLY = 0,
      O_WRONLY = 1,
      O_RDWR = 2,
      O_EXCL = 1024,
      O_CREAT = 256,
      O_TRUNC = 512,
      O_APPEND = 8

$B._FileIO.__new__ = function(cls){
    return {
        __class__: cls,
        fd: -1,
        created: 0,
        readable: 0,
        writable: 0,
        appending: 0,
        seekable: -1,
        closefd: 1
    }
}

$B._FileIO.__init__ = function(){
    var $ = $B.args('__init__', 5,
                {self: null, name: null, mode: null, closefd: null, opener: null},
                ['self', 'name', 'mode', 'closefd', 'opener'],
                arguments,
                {mode: 'r', closefd: true, opener: _b_.None},
                null, null),
        _self = $.self,
        name = $.name,
        mode = $.mode,
        closefd = $.closefd,
        opener = $.opener

    var flags = 0
    var ret = 0
    var rwa = 0, plus = 0
    var s = mode
    var pos = 0
    while(pos < s.length){
        switch(s[pos]){
            case 'x':
                if(rwa){
                    bad_mode()
                }
                rwa = 1
                _self.created = 1
                _self.writable = 1
                flags |= O_EXCL | O_CREAT
                break
            case 'r':
                if(rwa){
                    bad_mode()
                }
                rwa = 1
                _self.readable = 1
                break
            case 'w':
                if(rwa){
                    bad_mode()
                }
                rwa = 1
                _self.writable = 1
                flags |= O_CREAT | O_TRUNC
                break
            case 'a':
                if(rwa){
                    bad_mode()
                }
                rwa = 1;
                _self.writable = 1
                _self.appending = 1
                flags |= O_APPEND | O_CREAT
                break
            case 'b':
                break
            case '+':
                if(plus){
                    bad_mode()
                }
                _self.readable = _self.writable = 1
                plus = 1
                break
            default:
                $B.RAISE(_b_.ValueError, `invalid mode: ${mode}`);
        }
        pos++
    }
    if(!rwa){
        bad_mode()
    }
    if(_self.readable && _self.writable){
        flags |= O_RDWR;
    }else if(_self.readable){
        flags |= O_RDONLY
    }else{
        flags |= O_WRONLY
    }

    if($B.file_cache.hasOwnProperty(name)){
        _self.$bytes = $B.to_bytes($B.encode($B.file_cache[name], 'utf-8'))
        _self.$byte_pos = 0
        _self.$line_pos = 0
        _self.$text = $B.file_cache[name]
        _self.$text_iterator = _self.$text[Symbol.iterator]()
        _self.$text_length = _b_.len(_self.$text)
        return
    }else if($B.files && $B.files.hasOwnProperty(name)){
        // Virtual file system created by
        // python -m brython --make_file_system
        var $res = atob($B.files[name].content)
        var bytes = []
        for(const char of $res){
            bytes.push(char.charCodeAt(0))
        }
        _self.$bytes = bytes
        _self.$byte_pos = _self.$line_pos = 0
        return
        /*
        if(! binary){
            // use encoding to restore text
            try{
                _self.$text = _b_.bytes.decode(result.content, encoding)
            } catch(error) {
                result.error = error
            }
        }
        */
    }
    _self.fd = new XMLHttpRequest()
    // Set mimetype so that bytes are not modified
    // Cannot set responseType on a synchronous request
    _self.fd.overrideMimeType('text/plain;charset=x-user-defined')
    _self.fd.onreadystatechange = function(){
        if(this.readyState != 4){
            return
        }
        var status = this.status
        if(status == 404){
            this.error = $B.EXC(_b_.FileNotFoundError, name)
        }else if(status != 200){
            this.error = $B.EXC(_b_.IOError, 'Could not open file ' +
                name + ' : status ' + status)
        }else{
            var bytes = []
            for(var codePoint of this.response){
                var cp = codePoint.codePointAt(0)
                if(cp > 0xf700){
                    cp -= 0xf700
                }
                bytes[bytes.length] = cp
            }
            _self.$bytes = bytes
            _self.$byte_pos = 0
            _self.$line_pos = 0
        }
    }
    // add fake query string to avoid caching
    var cache = $B.get_option('cache'),
        fake_qs = cache ? '' : '?foo=' + (new Date().getTime())
    _self.fd.open('GET', encodeURI(name + fake_qs), false)
    _self.fd.send()
    if(_self.fd.error){
        throw _self.fd.error
    }
}

$B._FileIO.readable = function(_self){
    if(_self.fd < 0){
        err_closed()
    }
    return $B.$bool(_self.readable)
}

$B._FileIO.readall = function(_self){
    var buffer = _b_.bytearray.$factory()
    $B._FileIO.readinto(_self, buffer)
    buffer.__class__ = _b_.bytes
    return buffer
}

$B._FileIO.readinto = function(_self, buffer){
    if(_self.fd < 0){
        err_closed()
    }
    if(! _self.readable) {
        return err_mode(state, "reading")
    }
    _b_.bytearray.extend(buffer, $B.fast_bytes(_self.$bytes))
    var n = _b_.len(buffer)

    return n
}

$B._FileIO.readinto1 = $B._FileIO.readinto

$B._FileIO.seekable = function(_self){
    if(_self.fd < 0){
        err_closed()
    }
    return $B.$bool(_self.seekable)
}

$B._FileIO.writable = function(_self){
    if(_self.fd < 0){
        err_closed()
    }
    return $B.$bool(_self.writable)
}

$B.set_func_names($B._FileIO, '_io')

$B._TextIOBase = $B.make_class('_io._TextIOBase')

$B._TextIOBase.__bases__ = [_IOBase]
$B._TextIOBase.__mro__ = [_IOBase, _b_.object]

$B._TextIOBase.encoding = $B.getset_descriptor.$factory(
    $B._TextIOBase,
    'encoding',
    function(_self){
        return _self._encoding ?? _b_.None
    },
    function(_self, value){
        _self._encoding = value
    }
)

$B._TextIOBase.errors = $B.getset_descriptor.$factory(
    $B._TextIOBase,
    'errors',
    function(_self){
        return _self.errors ?? _b_.None
    },
    function(_self, value){
        _self._errors = value
    }
)


$B._TextIOBase.read = function(){
    _io_unsupported('read')
}

var $BufferedReader = $B.make_class('_io.BufferedReader',
    function(content){
        return {
            __class__: $BufferedReader,
            $binary: true,
            $content: content,
            $read_func: $B.$getattr(content, 'read')
        }
    }
)

$BufferedReader.__mro__ = [_IOBase, _b_.object]

$BufferedReader.read = function(self, size){
    if(self.$read_func === undefined){
        return _IOBase.read(self, size === undefined ? -1 : size)
    }
    return self.$read_func(size || -1)
}

$B._TextIOWrapper = $B.make_class('_io._TextIOWrapper',
    function(){
        var $ = $B.args("TextIOWrapper", 6,
            {buffer: null, encoding: null, errors: null,
             newline: null, line_buffering: null, write_through:null},
            ["buffer", "encoding", "errors", "newline",
             "line_buffering", "write_through"],
             arguments,
             {encoding: "utf-8", errors: _b_.None, newline: _b_.None,
              line_buffering: _b_.False, write_through: _b_.False},
              null, null)
        if($.encoding === _b_.None){
            $.encoding = 'utf-8'
        }
        var bytes = $B.fast_bytes($.buffer.raw.$bytes)
        var res = {
            __class__: $B._TextIOWrapper,
            $buffer: $.buffer,
            $bytes: bytes,
            $encoding: $.encoding,
            $errors: $.errors,
            $newline: $.newline,
            __dict__: $B.empty_dict()
        }
        return res
    }
)

$B._TextIOWrapper.$tp_dict = {}
$B._TextIOWrapper.__bases__ = [$B._TextIOBase]
$B._TextIOWrapper.__mro__ = [$B._TextIOBase, _IOBase, _b_.object]

$B._TextIOWrapper.$tp_dict.buffer = $B.getset_descriptor.$factory(
    $B._TextIOWrapper,
    'buffer',
    function(_self){
        return _self.$buffer
    }
)

$B._TextIOWrapper.fileno = function(_self){
    return -1
}

$B._TextIOWrapper.read = function(){
    var $ = $B.args("read", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            _self = $.self,
            size = $B.PyNumber_Index($.size)
    if(_self.closed === true){
        $B.RAISE(_b_.ValueError, 'I/O operation on closed file')
    }
    if(_self.$text === undefined){
        _self.$text = $B.decode(_self.$bytes, _self.$encoding, _self.$errors)
        _self.$text_pos = 0
    }
    var len = _b_.len(_self.$text)
    if(size < 0){
        size = len - _self.$text_pos
    }
    var res = _b_.str.__getitem__(_self.$text,
        _b_.slice.$fast_slice(_self.$text_pos, _self.$text_pos + size, 1))

    _self.$text_pos += size
    _self.$text_pos = Math.min(_self.$text_pos, _self.$text.length)
    return res
}

$B._TextIOWrapper.readline = function(){
    var $ = $B.args("read", 2, {self: null, size: null},
            ["self", "size"], arguments, {size: -1}, null, null),
            _self = $.self,
            size = $B.PyNumber_Index($.size)
    if(_self.closed === true){
        $B.RAISE(_b_.ValueError, 'I/O operation on closed file')
    }
    if(_self.$text === undefined){
        _self.$text = $B.decode(_self.$bytes, _self.$encoding, _self.$errors)
        _self.$text_iterator = _self.$text[Symbol.iterator]()
        _self.$text_pos = 0
        _self.$text_length = _b_.len(_self.$text)
    }
    var res = ''
    var nb = 0
    if(size < 0){
        size = _self.$text_length
    }
    while(1){
        var char = _self.$text_iterator.next()
        if(char.done){
            break
        }else if(char.value == '\n'){
            res += char.value
            break
        }else{
            res += char.value
            nb++
            if(nb > size){
                break
            }
        }
    }
    return $B.String(res)
}

$B._TextIOWrapper.seek = function(_self, offset, whence){
    if(_self.closed){
        $B.RAISE(_b_.ValueError, 'I/O operation on closed file')
    }
    if(whence === undefined){
        whence = 0
    }
    if(whence === 0){
        self.$text_pos = offset
    }else if(whence === 1){
        self.$text_pos += offset
    }else if(whence === 2){
        self.$text_pos = self.$text_length + offset
    }
    return _b_.None
}

$B.set_func_names($B._TextIOWrapper, "builtins")

$B._IOBase = _IOBase
//$B.BufferedReader = $BufferedReader

function invalid_mode(mode){
    $B.RAISE(_b_.ValueError, `invalid mode: '${mode}'`)
}

function _io_open_impl(file, mode, buffering, encoding, errors, newline,
                       closefd, opener){
    var i;
    var creating = 0, reading = 0, writing = 0, appending = 0, updating = 0;
    var text = 0, binary = 0;

    var rawmode = '', m;
    var line_buffering, is_number, isatty = 0;

    var raw, modeobj, buffer, wrapper, result, path_or_fd = NULL;

    path_or_fd = file

    if (! $B.$isinstance(path_or_fd, _b_.str)){
        $B.RAISE(_b_.TypeError, `invalid file: ${file}`)
    }

    if(encoding == 'locale'){
        // cf. PEP 597
        encoding = 'utf-8'
    }

    /* Decode mode */
    for(var i = 0, len = mode.length; i < len; i++){
        var c = mode[i]
        switch (c) {
        case 'x':
            creating = 1
            break
        case 'r':
            reading = 1
            break
        case 'w':
            writing = 1
            break
        case 'a':
            appending = 1
            break
        case '+':
            updating = 1
            break
        case 't':
            text = 1
            break
        case 'b':
            binary = 1
            break
        default:
            invalid_mode(mode)
        }

        /* c must not be duplicated */
        if(mode[i + 1] == c){
            invalid_mode(mode)
        }
    }


    m = ''
    if (creating)  m += 'x';
    if (reading)   m += 'r';
    if (writing)   m += 'w';
    if (appending) m += 'a';
    if (updating)  m += '+';
    rawmode = m

    /* Parameters validation */
    if(text && binary){
        $B.RAISE(_b_.ValueError,
            "can't have text and binary mode at once")
    }

    if(creating + reading + writing + appending > 1){
        $B.RAISE(_b_.ValueError,
            "must have exactly one of create/read/write/append mode")
    }

    if(binary && encoding !== _b_.None){
        $B.RAISE(_b_.ValueError,
            "binary mode doesn't take an encoding argument")
    }

    if(binary && errors != _b_.None) {
        $B.RAISE(_b_.ValueError,
            "binary mode doesn't take an errors argument");
    }

    if(binary && newline !== _b_.None){
        $B.RAISE(_b_.ValueError,
            "binary mode doesn't take a newline argument");
    }

    if(binary && buffering == 1){
        $B.RAISE(_b_.RuntimeWarning,
            "line buffering (buffering=1) isn't supported in " +
            "binary mode, the default buffer size will be used")
    }

    /* Create the Raw file stream */
    var RawIO_class = $B._FileIO
    raw = $B.$call(RawIO_class)(path_or_fd, rawmode,
                                closefd ? true : false,
                                opener)
    result = raw

    modeobj = mode

    /* buffering */
    if (buffering < 0) {
        isatty = false
    }

    if(buffering == 1 || isatty){
        buffering = -1
        line_buffering = 1
    }else{
        line_buffering = 0
    }
    if(buffering < 0){
        buffering = DEFAULT_BUFFER_SIZE
    }

    /* if not buffering, returns the raw file object */
    if(buffering == 0){
        if(! binary){
            $B.RAISE(_b_.ValueError,
                "can't have unbuffered text I/O")
        }
        return result
    }

    /* wraps into a buffered file */
    var Buffered_class

    if(updating){
        Buffered_class = $B._BufferedRandom
    }else if(creating || writing || appending){
        Buffered_class = $B._BufferedWriter
    }else if(reading){
        Buffered_class = $B._BufferedReader
    }else{
        $B.RAISE(_b_.ValueError, `unknown mode: '${mode}'`)
    }

    result = $B.$call(Buffered_class)(raw, buffering)

    /* if binary, returns the buffered file */
    if(binary){
        return result
    }

    /* wraps into a TextIOWrapper */
    var wrapper = $B.$call($B._TextIOWrapper)(result, encoding, errors, newline,
        line_buffering ? true : false)
    $B.$setattr(wrapper, 'mode', modeobj)
    return wrapper
}

_b_.open = function(){
    // first argument is file : can be a string, or an instance of a DOM File object
    var $ = $B.args('open', 3, {file: null, mode: null, encoding: null},
        ['file', 'mode', 'encoding'], arguments,
        {mode: 'r', encoding: 'utf-8'}, 'args', 'kw'),
        file = $.file,
        mode = $.mode,
        encoding = $.encoding,
        result = {}
    if(encoding == 'locale'){
        // cf. PEP 597
        encoding = 'utf-8'
    }
    var is_binary = mode.search('b') > -1

    if(mode.search('w') > -1){
        // return the file-like object
        result = {
            $binary: is_binary,
            $content: is_binary ? _b_.bytes.$factory() : '',
            $encoding: encoding,
            closed: False,
            mode,
            name: file
        }
        result.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        $B.file_cache[file] = result.$content
        return result
    }else if(['r', 'rb'].indexOf(mode) == -1){
        $B.RAISE(_b_.ValueError, "Invalid mode '" + mode + "'")
    }
    if($B.$isinstance(file, _b_.str)){
        // read the file content and return an object with file object methods
        if($B.file_cache.hasOwnProperty($.file)){
            var f = $B.file_cache[$.file] // string
            result.content = f
            if(is_binary && typeof f == 'string'){
                result.content = _b_.str.encode(f, 'utf-8')
            }else if(f.__class__ === _b_.bytes && ! is_binary){
                result.content = _b_.bytes.decode(f, encoding)
            }
        }else if($B.files && $B.files.hasOwnProperty($.file)){
            // Virtual file system created by
            // python -m brython --make_file_system
            var $res = atob($B.files[$.file].content)
            var source = []
            for(const char of $res){
                source.push(char.charCodeAt(0))
            }
            result.content = _b_.bytes.$factory(source)
            if(!is_binary){
                // use encoding to restore text
                try{
                    result.content = _b_.bytes.decode(result.content, encoding)
                } catch(error) {
                    result.error = error
                }
            }
        }else if($B.protocol != "file"){
            // Try to load file by synchronous Ajax call
            var req = new XMLHttpRequest()
            // Set mimetype so that bytes are not modified
            // Cannot set responseType on a synchronous request
            req.overrideMimeType('text/plain;charset=x-user-defined')
            req.onreadystatechange = function(){
                if(this.readyState != 4){
                    return
                }
                var status = this.status
                if(status == 404){
                    result.error = $B.EXC(_b_.FileNotFoundError, file)
                }else if(status != 200){
                    result.error = $B.EXC(_b_.IOError, 'Could not open file ' +
                        file + ' : status ' + status)
                }else{
                    var bytes = []
                    for(var codePoint of this.response){
                        var cp = codePoint.codePointAt(0)
                        if(cp > 0xf700){
                            cp -= 0xf700
                        }
                        bytes[bytes.length] = cp
                    }
                    result.content = _b_.bytes.$factory(bytes)
                    if(! is_binary){
                        // use encoding to restore text
                        try{
                            result.content = _b_.bytes.decode(result.content,
                                encoding)
                        }catch(error){
                            result.error = error
                        }
                    }
                }
            }
            // add fake query string to avoid caching
            var cache = $B.get_option('cache'),
                fake_qs = cache ? '' : '?foo=' + (new Date().getTime())
            req.open('GET', encodeURI(file + fake_qs), false)
            req.send()
        }else{
            $B.RAISE(_b_.FileNotFoundError,
                "cannot use 'open()' with protocol 'file'")
        }

        if(result.error !== undefined){
            throw result.error
        }

        // return the file-like object
        if(! is_binary){
            return $B.TextIOWrapper.$factory()
        }
        var res = {
            $binary: is_binary,
            $content: result.content,
            $counter: 0,
            $encoding: encoding,
            $length: is_binary ? result.content.source.length :
                result.content.length,
            closed: False,
            mode,
            name: file
        }
        res.__class__ = is_binary ? $BufferedReader : $TextIOWrapper
        return res
    }else{
        $B.RAISE(_b_.TypeError, "invalid argument for open(): " +
            _b_.str.$factory(file))
    }
}

_b_.open = function(){
    var $ = $B.args('open', 3,
        {file: null, mode: null, buffering: null, encoding: null,
         errors: null, newline: null, closefd: null, opener: null},
        ['file', 'mode', 'buffering', 'encoding','errors', 'newline',
        'closefd', 'opener'], arguments,
        {mode: 'r', buffering: -1, encoding: _b_.None, errors: _b_.None,
        newline: _b_.None, closefd: true, opener: _b_.None}),
        file = $.file,
        mode = $.mode,
        encoding = $.encoding,
        result = {}
    return _io_open_impl($.file, $.mode, $.buffering, $.encoding,
        $.errors, $.newline, $.closefd, $.opener)
}

})(__BRYTHON__)