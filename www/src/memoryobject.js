(function($B){

var _b_ = $B.builtins

/* memory_iterator start */
$B.memory_iterator.tp_iter = function(self){
    return self
}

$B.memory_iterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield item
    }
}

var memory_iterator_funcs = $B.memory_iterator.tp_funcs = {}

/* memory_iterator end */

var memoryview = _b_.memoryview

memoryview.$factory = function(obj){
    $B.check_nb_args_no_kw('memoryview', 1, arguments)
    if($B.get_class(obj) === memoryview){
        return obj
    }
    var getbuffer = $B.search_slot($B.get_class(obj), 'tp_getbuffer', $B.NULL)
    if(getbuffer === $B.NULL){
        $B.RAISE(_b_.TypeError, "memoryview: a bytes-like object " +
            "is required, not '" + $B.class_name(obj) + "'"
        )
    }
    obj.exports = obj.exports ?? 0
    obj.exports++ // used to prevent resizing
    var res = {
        ob_type: memoryview,
        obj: obj,
        mbuf: null,
        format: 'B',
        itemsize: 1,
        ndim: 1,
        shape: _b_.tuple.$factory([_b_.len(obj)]),
        strides: _b_.tuple.$factory([1]),
        suboffsets: _b_.tuple.$factory([]),
        c_contiguous: true,
        f_contiguous: true,
        contiguous: true
    }
    return res
}

memoryview.$match_sequence_pattern = true, // for Pattern Matching (PEP 634)
memoryview.$buffer_protocol = true
memoryview.$not_basetype = true // cannot be a base class
memoryview.$is_sequence = true

function memoryview_eq(self, other){
    if($B.get_class(other) !== memoryview){
        return false
    }
    var eq = $B.$getattr($B.get_class(self.obj), '__eq__')
    return $B.$call(eq, self.obj, other.obj)
}

var struct_format = {
    'x': {'size': 1},
    'b': {'size': 1},
    'B': {'size': 1},
    'c': {'size': 1},
    's': {'size': 1},
    'p': {'size': 1},
    'h': {'size': 2},
    'H': {'size': 2},
    'i': {'size': 4},
    'I': {'size': 4},
    'l': {'size': 4},
    'L': {'size': 4},
    'q': {'size': 8},
    'Q': {'size': 8},
    'f': {'size': 4},
    'd': {'size': 8},
    'P': {'size': 8}
}

const MEMORYVIEW = {
    RELEASED:    0x001,  /* access to master buffer blocked */
    C:           0x002,  /* C-contiguous layout */
    FORTRAN:     0x004,  /* Fortran contiguous layout */
    SCALAR:      0x008,  /* scalar: ndim = 0 */
    PIL:         0x010,  /* PIL-style layout */
    RESTRICTED:  0x020  /* Disallow new references to the memoryview's buffer */
}

/* memoryview start */

memoryview.tp_dealloc = function(self){
    if(! self.$released){
        memoryview.tp_funcs.release(self)
    }
}

_b_.memoryview.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, _b_.memoryview)){
        return _b_.NotImplemented
    }
    var res
    switch(op){
        case '__eq__':
            res = memoryview_eq(self, other)
            break
        case '__ne__':
            res = ! memoryview_eq(self, other)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

_b_.memoryview.sq_ass_item = function(self, key, value){
    try{
        $B.$setitem(self.obj, key, value)
    }catch(err){
        $B.RAISE(_b_.TypeError, "cannot modify read-only memory")
    }
}

_b_.memoryview.tp_repr = function(self){
    if(self.flags & MEMORYVIEW.RELEASED){
        return "<released memory>"
    }else{
        return "<memory>"
    }
}

_b_.memoryview.tp_hash = function(self){
    $B.RAISE(_b_.NotImplementedError, '__hash__')
}

_b_.memoryview.tp_iter = function(self){
    return {
        ob_type: $B.memory_iterator,
        it: $B.make_js_iterator(self.obj)
    }
}

_b_.memoryview.tp_new = function(){
    var $ = $B.args('__new__', 2, {cls: null, obj: null}, ['cls', 'obj'],
                arguments, {}, null, null)
    var cls = $.cls,
        obj = $.obj
    if($B.get_class(obj) === memoryview){
        return obj
    }
    if($B.$getattr(obj, '__buffer__', $B.NULL) !== $B.NULL){
        obj.exports = obj.exports ?? 0
        obj.exports++ // used to prevent resizing
        var res = {
            ob_type: cls,
            obj: obj,
            mbuf: null,
            format: 'B',
            itemsize: 1,
            ndim: 1,
            shape: _b_.tuple.$factory([_b_.len(obj)]),
            strides: _b_.tuple.$factory([1]),
            suboffsets: _b_.tuple.$factory([]),
            c_contiguous: true,
            f_contiguous: true,
            contiguous: true
        }
        return res
    }else{
        $B.RAISE(_b_.TypeError, "memoryview: a bytes-like object " +
            "is required, not '" + $B.class_name(obj) + "'")
    }
}

_b_.memoryview.mp_length = function(self){
    return _b_.len(self.obj) / self.itemsize
}

_b_.memoryview.mp_subscript = function(self, key){
    var res
    if($B.$isinstance(key, _b_.int)){
        var start = key * self.itemsize
        if(self.format == "I"){
            res = self.obj.source[start]
            var coef = 256
            for(var i = 1; i < 4; i++){
                res += self.obj.source[start + i] * coef
                coef *= 256
            }
            return res
        }else if("B".indexOf(self.format) > -1){
            if(key > self.obj.source.length - 1){
                $B.RAISE(_b_.KeyError, key)
            }
            return self.obj.source[key]
        }else{
            // fix me
            return self.obj.source[key]
        }
    }
    // fix me : add slice support for other formats than B
    var getitem = $B.$getattr($B.get_class(self.obj), '__getitem__', $B.NULL)
    if(getitem !== $B.NULL){
        res = $B.$call(getitem, self.obj, key)
    }
    if($B.get_class(key) === _b_.slice){
        return memoryview.$factory(res)
    }
}

_b_.memoryview.bf_getbuffer = function(self){
    self.exports++
    return self
}

_b_.memoryview.bf_releasebuffer = function(self){
    self.exports--
}

var memoryview_funcs = _b_.memoryview.tp_funcs = {}

memoryview_funcs.__class_getitem__ = function(){
    return $B.$class_getitem.apply(null, arguments)
}

memoryview_funcs.__enter__ = function(self){
    return self
}

memoryview_funcs.__exit__ = function(self){
    memoryview.tp_funcs.release(self)
}

memoryview_funcs._from_flags = function(self){

}

memoryview_funcs.c_contiguous_get = function(self){
    return self.flags & (MEMORYVIEW.SCALAR | MEMORYVIEW.C)
}

memoryview_funcs.c_contiguous_set = _b_.None

memoryview_funcs.cast = function(self, format, shape){
    if(! struct_format.hasOwnProperty(format)){
        $B.RAISE(_b_.ValueError, `unknown format: '${format}'`)
    }
    var new_itemsize = struct_format[format].size
    if(shape === undefined){
        shape = _b_.len(self) // new_itemsize
    }else{
        if(! $B.$isinstance(shape, [_b_.list, _b_.tuple])){
            $B.RAISE(_b_.TypeError, 'shape must be a list or a tuple')
        }
        var nb = 1
        for(var item of shape){
            if(! $B.$isinstance(item, _b_.int)){
                $B.RAISE(_b_.TypeError,
                    'memoryview.cast(): elements of shape must be integers')
            }
            nb *= item
        }
        if(nb * new_itemsize != _b_.len(self)){
            $B.RAISE(_b_.TypeError,
                'memoryview: product(shape) * itemsize != buffer size')
        }
    }
    switch(format){
        case "B":
            return memoryview.$factory(self.obj)
        case "I":
            var res = memoryview.$factory(self.obj),
                objlen = len(self.obj)
            res.itemsize = 4
            res.format = "I"
            if(objlen % 4 != 0){
                $B.RAISE(_b_.TypeError, "memoryview: length is not " +
                    "a multiple of itemsize")
            }
            return res
    }
}

memoryview_funcs.contiguous_get = function(self){
    return self.flags & (MEMORYVIEW.SCALAR | MEMORYVIEW.C | MEMORYVIEW.FORTRAN)
}

memoryview_funcs.contiguous_set = _b_.None

memoryview_funcs.count = function(self){
    var $ = $B.args('count', 2, {self: null, value: null}, ['self', 'value'],
                arguments, {}, null, null)
    var self = $.self,
        value = $.value
    var iter = _b_.memoryview.tp_iter(self)
    var count = 0
    for(var item of $B.make_js_iterator(iter)){
        if($B.is_or_equals(item, value)){
            count++
        }
    }
    return count
}

memoryview_funcs.f_contiguous_get = function(self){
    return self.flags & (MEMORYVIEW.SCALAR | MEMORYVIEW.FORTRAN)
}

memoryview_funcs.f_contiguous_set = _b_.None

memoryview_funcs.format_get = function(self){
    return self.format
}

memoryview_funcs.format_set = _b_.None

memoryview_funcs.hex = function(self){
    var res = '',
        bytes = _b_.bytes.$factory(self)
    bytes.source.forEach(function(item){
        res += item.toString(16)
    })
    return res
}

memoryview_funcs.index = function(self){
    var $ = $B.args('index', 4,
                {self: null, value: null, start: null, stop: null},
                ['self', 'value', 'start', 'stop'], arguments,
                {start: 0, stop: $B.max_int}, null, null)
    var self = $.self,
        value = $.value,
        start = $.start,
        stop = $.stop
    if(self.ndim == 0){
        $B.RAISE(_b_.TypeError, "invalid lookup on 0-dim memory")
    }
    if(self.ndim == 1){
        var n = self.shape[0]
        if(start < 0){
            start = Math.max(start + n, 0)
        }
        if(stop < 0){
            stop = Math.max(stop + n, 0)
        }
        stop = Math.min(stop, n)
        start = Math.min(start, stop)
        for(let index = start; index < stop; index++){
            var item = _b_.memoryview.mp_subscript(self, index)
            if($B.is_or_equals(item, value)){
                return index
            }
        }
        $B.RAISE(_b_.ValueError, "memoryview.index(x): x not found");
    }
    $B.RAISE(_b_.NotImplementedError,
        "multi-dimensional lookup is not implemented"
    )
}

memoryview_funcs.itemsize_get = function(self){
    return self.itemsize
}

memoryview_funcs.itemsize_set = _b_.None

memoryview_funcs.nbytes_get = function(self){
    var product = 1
    for(var x of self.shape){
        product *= x
    }
    return x * self.itemsize
}

memoryview_funcs.nbytes_set = _b_.None

memoryview_funcs.ndim_get = function(self){
    return self.ndim
}

memoryview_funcs.ndim_set = _b_.None

memoryview_funcs.obj_get = function(self){
    return self.obj
}

memoryview_funcs.obj_set = _b_.None

memoryview_funcs.readonly_get = function(self){
    return $B.$isinstance(self.obj, _b_.bytes)
}

memoryview_funcs.readonly_set = _b_.None

memoryview_funcs.release = function(self){
    if(self.$released){
        return
    }
    self.$released = true
    self.obj.exports -= 1
}

memoryview_funcs.shape_get = function(self){
    return self.shape
}

memoryview_funcs.shape_set = _b_.None

memoryview_funcs.strides_get = function(self){
    return self.strides
}

memoryview_funcs.strides_set = _b_.None

memoryview_funcs.suboffsets_get = function(self){
    return self.suboffsets
}

memoryview_funcs.suboffsets_set = _b_.None

memoryview_funcs.tobytes = function(self){
    if($B.$isinstance(self.obj, [_b_.bytes, _b_.bytearray])){
        return {
            ob_type: _b_.bytes,
            source: self.obj.source
        }
    }else if($B.imported.array && $B.$isinstance(self.obj, $B.imported.array.array)){
        return $B.imported.array.array.tobytes(self.obj)
    }
    $B.RAISE(_b_.TypeError, 'cannot run tobytes with ' + $B.class_name(self.obj))
}

memoryview_funcs.tolist = function(self){
    if(self.itemsize == 1){
        return _b_.list.$factory(_b_.bytes.$factory(self.obj))
    }else if(self.itemsize == 4){
        if(self.format == "I"){
            var res = []
            for(var i = 0; i < self.obj.source.length; i += 4){
                var item = self.obj.source[i],
                    coef = 256
                for(var j = 1; j < 4; j++){
                    item += coef * self.obj.source[i + j]
                    coef *= 256
                }
                res.push(item)
            }
            return res
        }
    }
}

memoryview_funcs.toreadonly = function(self){
    self.readonly = 1
}

_b_.memoryview.tp_methods = ["release", "tobytes", "hex", "tolist", "cast", "toreadonly", "count", "index", "__enter__", "__exit__"]

_b_.memoryview.classmethods = ["_from_flags", "__class_getitem__"]

_b_.memoryview.tp_getset = ["obj", "nbytes", "readonly", "itemsize", "format", "ndim", "shape", "strides", "suboffsets", "c_contiguous", "f_contiguous", "contiguous"]

/* memoryview end */

$B.set_func_names(memoryview, "builtins")

})(__BRYTHON__)