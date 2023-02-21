var _b_ = __BRYTHON__.builtins

function get_self(name, args){
    return $B.args(name, 1, {self: null}, ["self"], args, {}, null, null).self
}

var _IOBase = $B.make_class("_IOBase")
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

// Base class for text streams.
_TextIOBase = $B.make_class("_TextIOBase")
_TextIOBase.__mro__ = [_IOBase, _b_.object]

var StringIO = $B.make_class("StringIO",
    function(){
        var $ = $B.args("StringIO", 2, {value: null, newline: null},
                ["value", "newline"], arguments, {value: '', newline: "\n"},
                null, null)
        return {
            __class__: StringIO,
            $counter: 0,
            $content: $.value
        }
    }
)

StringIO.__mro__ = [$B.Reader, _b_.object]

StringIO.getvalue = function(){
    var $ = $B.args("getvalue", 1, {self: null},
            ["self"], arguments, {}, null, null)
    return $.self.$content.substr(0) // copy
}

StringIO.truncate = function(self, size){
    var $ = $B.args('truncate', 2, {self: null, size: null}, ['self', 'size'],
            arguments, {size: _b_.None}, null, null),
        self = $.self,
        size = $.size
    if(size === _b_.None){
        size = self.$counter
    }
    self.$content = self.$content.substr(0, size)
    self.$counter = self.$content.length
    return self.$counter
}

StringIO.write = function(){
    var $ = $B.args("write", 2, {self: null, data: null},
            ["self", "data"], arguments, {}, null, null)
    if(! _b_.isinstance($.data, _b_.str)){
        throw _b_.TypeError.$factory('string argument expected, got ' +
            `'${$B.class_name($.data)}'`)
    }
    var text = $.self.$content,
        position = $.self.$counter
    text = text.substr(0, position) + $.data +
        text.substr(position + $.data.length)
    $.self.$content = text
    $.self.$counter = position + $.data.length
    return $.data.length
}

$B.set_func_names(StringIO, "_io")

var BytesIO = $B.make_class("BytesIO",
    function(){
        var $ = $B.args("BytesIO", 1, {value: null},
                ["value"], arguments, {value: _b_.bytes.$factory()},
                null, null)
        return {
            __class__: BytesIO,
            $binary: true,
            $content: $.value,
            $length: $.value.source.length,
            $counter: 0
        }
    }
)
BytesIO.__mro__ = [$B.Reader, _b_.object]

BytesIO.getbuffer = function(){
    var self = get_self("getbuffer", arguments)
    return self.$content
}

BytesIO.getvalue = function(){
    var self = get_self("getvalue", arguments)
    return self.$content
}

BytesIO.write = function(){
    var $ = $B.args("write", 2, {self: null, data: null},
            ["self", "data"], arguments, {}, null, null)
    $.self.$content.source = $.self.$content.source.concat(
        $.data.source)
    $.self.$counter += $.data.source.length
    return _b_.None
}

$B.set_func_names(BytesIO, "_io")

var BlockingIOError = $B.make_class('BlockingIOError')
BlockingIOError.__bases__ = [_b_.OSError]

$B.set_func_names(BlockingIOError, '_io')

var $module = (function($B){
    return {
        _BufferedIOBase,
        _IOBase,
        _RawIOBase,
        _TextIOBase: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        BlockingIOError,
        BytesIO: BytesIO,
        FileIO: $B.make_class("_TextIOBase",
            function(){
                return "fileio"
            }
        ),
        StringIO: StringIO,
        BufferedReader: $B.BufferedReader,
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
        TextIOWrapper: $B.TextIOWrapper
    }
})(__BRYTHON__)
$module._IOBase.__doc__ = "_IOBase"