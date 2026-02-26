(function($B){

var _b_ = $B.builtins

var typecodes = {
    'b': Int8Array,    // signed char, 1 byte
    'B': Uint8Array,   // unsigned char, 1
    'u': Uint32Array,  // Py_UNICODE Unicode character, 2 (deprecated)
    'h': Int16Array,   // signed short, 2
    'H': Uint16Array,  // unsigned short, 2
    'i': Int16Array,   //  signed int, 2
    'I': Uint16Array,  // unsigned int, 2
    'l': Int32Array,   // signed long, 4
    'L': Uint32Array,  // unsigned long, 4
    'q': null,         // signed long, 8 (not implemented)
    'Q': null,         // unsigned long, 8 (not implemented)
    'f': Float32Array, // float, 4
    'd': Float64Array  // double float, 8
}


function normalize_index(self, i){
    // return an index i between 0 and self.obj.length - 1
    if(i < 0){
        i = self.obj.length + i
    }
    if(i < 0){i = 0}
    else if(i > self.obj.length - 1){
        i = self.obj.length
    }
    return i
}

function make_array(args, kw){
    $B.check_kw_empty(kw)
    var [typecode, initializer] = $B.unpack_args('array', args,
        ['typecode', 'initializer'], {initializer: $B.NULL})
    if(! typecodes.hasOwnProperty(typecode)){
        $B.RAISE(_b_.ValueError, "bad typecode (must be b, " +
            "B, u, h, H, i, I, l, L, q, Q, f or d)")
    }
    if(typecodes[typecode] === null){
        $B.RAISE(_b_.NotImplementedError, "type code " +
            typecode + " is not implemented")
    }
    var res = {
        ob_type: array,
        typecode: typecode,
        obj: null
    }
    if(initializer !== $B.NULL){
        if(Array.isArray(initializer)){
            array_funcs.fromlist(res, initializer)
        }else if($B.$isinstance(initializer, _b_.bytes)){
            array_funcs.frombytes(res, initializer)
        }else{
            array_funcs.extend(res, initializer)
        }
    }
    return res
}

var array = $B.make_type("array")

array.$buffer_protocol = true
array.$match_sequence_pattern = true // for Pattern Matching (PEP 634)

array.bf_getbuffer = function(_self, flag){
    return $B.$call(_b_.memoryview, _self)
}

array.mp_subscript = function(_self, key){
    if(_self.obj){
        if(_self.obj[key] !== undefined){
            return _self.obj[key]
        }else if($B.$isinstance(key, _b_.slice)){
            var t = _self.obj.slice(key.start, key.stop)
            return {
                ob_type: array,
                typecode: _self.typecode,
                obj: t
            }
        }
    }
    $B.RAISE(_b_.IndexError, "array index out of range")
}

array.tp_iter = function(self){
    var obj = self.obj ?? []
    return {
        ob_type: array_iterator,
        it: obj[Symbol.iterator](),
        obj
    }
}

array.sq_length = function(self){
    return self.obj === null ? 0 : self.obj.length
}

array.sq_repeat = function(self, nb){
    if(typeof nb == "number" || $B.$isinstance(nb, _b_.int)){
        var t = [],
            copy = self.obj.slice()
        for(var i = 0; i < nb; i++){
            t = t.concat(copy)
        }
        return {
            ob_type: array,
            typecode: self.typecode,
            obj: t
        }
    }
    $B.RAISE(_b_.ValueError, "cannot multiply array by " +
        $B.class_name(nb))
}

array.bf_release_buffer = function(_self, buffer){
    _b_.memoryview.tp_funcs.release(buffer)
}

array.mp_ass_subscript = function(_self, index, value){
    if($B.$isinstance(index, _b_.int)){
        if(_self.obj[index] === undefined){
            $B.RAISE(_b_.IndexError, "array index out of range")
        }
        _self.obj[index] = value
    }else if($B.$isinstance(index, _b_.slice)){
        if(! $B.$isinstance(value, array)){
            $B.RAISE(_b_.TypeError, 'can only assign array ' +
                `(not "${$B.class_name(value)}") to array slice`)
        }else if(value.typecode !== _self.typecode){
            $B.RAISE(_b_.TypeError, 'can only assign array of the same typecode')
        }

        var itemsize = array.itemsize(_self)
        var slice = _b_.slice.$conv_for_seq(index, _self.obj.length / itemsize)
        if(slice.start * itemsize + value.obj.length > _self.obj.length){
            if(_self.exports > 0){
                $B.RAISE(_b_.BufferError,
                    'cannot resize an array that is exporting buffers')
            }
        }
        _self.obj.splice(slice.start * itemsize,
            (slice.stop - slice.start) *itemsize,
            ...value.obj)
    }else{
        $B.RAISE(_b_.TypeError, 'array indices must be integers')
    }
}

array.tp_new = function(cls, args, kw){
    var [cls, ...args] = arguments
    var obj = make_array(args, kw)
    obj.cls = cls
    return obj
}

array.tp_repr = function(self){
    $B.args("__repr__", 1, {self: null},
        ["self"], arguments, {}, null, null)
    var res = "array('" + self.typecode + "'"
    if(self.obj !== null){
        res += ", [" + self.obj.join(', ') + "]"
    }
    return res + ")"
}

var array_funcs = array.tp_funcs = {}

array_funcs.__class_getitem__ = function(){
    return $B.$class_getitem.apply(null, arguments)
}

array_funcs.__copy__ = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.__deepcopy__ = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.__reduce_ex__ = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.__sizeof__ = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.append = function(self, value){
    $B.args("append", 2, {self: null, value: null},
        ["self", "value"], arguments, {}, null, null)
    var pos = self.obj === null ? 0 : self.obj.length
    return array.insert(self, pos, value)
}

array_funcs.buffer_info = function(){
    return _b_.NotImplemented
}

array_funcs.byteswap = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.clear = function(self){
    if(self.obj){
        self.obj.length = 0
    }
}

array_funcs.count = function(self, x){
    $B.args("count", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    if(self.obj === null){
        return 0
    }
    return self.obj.filter(function(item){return item == x}).length
}

array_funcs.extend = function(self, iterable){
    $B.args("extend", 2, {self: null, iterable: null},
        ["self", "iterable"], arguments, {}, null, null)
    if($B.exact_type(iterable, array)){
        if(iterable.typecode !== self.typecode){
            $B.RAISE(_b_.TypeError, "can only extend with array " +
                "of same kind")
        }
        if(iterable.obj === null){return _b_.None}
        // create new object with length = sum of lengths
        var newobj = new typecodes[self.typecode](self.obj.length +
            iterable.obj.length)
        // copy self.obj
        newobj.set(self.obj)
        // copy iterable.obj
        newobj.set(iterable.obj, self.obj.length)
        self.obj = newobj
    }else{
        var it = _b_.iter(iterable)
        while(true){
            try{
                var item = _b_.next(it)
                array.append(self, item)
            }catch(err){
                $B.RAISE_IF_NOT(err, _b_.StopIteration)
                break
            }
        }
    }
    return _b_.None
}

array_funcs.frombytes = function(self, s){
    $B.args("frombytes", 2, {self: null, s: null},
        ["self", "s"], arguments, {}, null, null)
    if(! $B.$isinstance(s, _b_.bytes)){
        $B.RAISE(_b_.TypeError, "a bytes-like object is required, " +
            "not '" + $B.class_name(s) + "'")
    }
    self.obj = new typecodes[self.typecode](s.source)
    return _b_.None
}

array_funcs.fromfile = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.fromlist = function(self, list){
    $B.args("fromlist", 2, {self: null, list: null},
        ["self", "list"], arguments, {}, null, null)
    var it = _b_.iter(list)
    while(true){
        try{
            var item = _b_.next(it)
            try{
                array.append(self, item)
            }catch(err){
                console.log(err)
                return _b_.None
            }
        }catch(err){
            if($B.is_exc(err, _b_.StopIteration)){
                return _b_.None
            }
            throw err
        }
    }
}

array_funcs.fromunicode = array_funcs.frombytes

array_funcs.index = function(self, x){
    $B.args("index", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    var res = self.obj.findIndex(function(item){return x == item})
    if(res == -1){
        $B.RAISE(_b_.ValueError, "array.index(x): x not in array")
    }
    return res
}

array_funcs.insert = function(self, i, value){
    $B.args("insert", 3, {self: null, i: null, value: null},
        ["self", "i", "value"], arguments, {}, null, null)
    if(self.obj === null){
        self.obj = [value]
    }else{
        self.obj.splice(i, 0, value)
    }
    return _b_.None
}

array_funcs.itemsize_get = function(self){
    return typecodes[self.typecode].BYTES_PER_ELEMENT
}

array_funcs.itemsize_set = _b_.None

array_funcs.pop = function(self, i){
    var $ = $B.args("count", 2, {self: null, i: null},
        ["self", "i"], arguments, {i: -1}, null, null)
    i = $.i
    if(self.obj === null){
        $B.RAISE(_b_.IndexError, "pop from empty array")
    }else if(self.obj.length == 1){
        var res = self.obj[0]
        self.obj = null
        return res
    }
    i = normalize_index(self, i)
    // store value to return
    var res = self.obj[i]
    // create new array, size = previous size - 1
    var newobj = new typecodes[self.typecode](self.obj.length - 1)
    // fill new array with values until i excluded
    newobj.set(self.obj.slice(0, i))
    // fill with values after i
    newobj.set(self.obj.slice(i + 1), i)
    // set self.obj to new array
    self.obj = newobj
    // return stored value
    return res
}

array_funcs.remove = function(self, x){
    $B.args("remove", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    var res = self.obj.findIndex(function(item){return x == item})
    if(res == -1){
        $B.RAISE(_b_.ValueError, "array.remove(x): x not in array")
    }
    array.pop(self, res)
    return _b_.None
}

array_funcs.reverse = function(self){
    $B.args("reverse", 1, {self: null},
        ["self"], arguments, {}, null, null)
    if(self.obj === null){return _b_.None}
    self.obj.reverse()
    return _b_.None
}

array_funcs.tobytes = function(self){
    $B.args("tobytes", 1, {self: null},
        ["self"], arguments, {}, null, null)
    var items = Array.prototype.slice.call(self.obj),
        res = []
    items.forEach(function(item){
        while(item > 256){
            res.push(item % 256)
            item = Math.floor(item / 256)
        }
        res.push(item)
    })
    return _b_.bytes.$factory(res)
}

array_funcs.tofile = function(){
    $B.RAISE(_b_.NotImplementedError)
}

array_funcs.tolist = function(self){
    $B.args("tolist", 1, {self: null},
        ["self"], arguments, {}, null, null)
    if(self.obj === null){
        return $B.$list([])
    }
    return $B.$list(Array.prototype.slice.call(self.obj))
}

array_funcs.tounicode = array_funcs.tobytes

array_funcs.typecode_get = function(self){
    return self.typecode
}

array_funcs.typecode_set = _b_.None

array.tp_methods = [
    "append", "buffer_info", "byteswap", "clear", "__copy__", "count",
    "__deepcopy__", "extend", "fromfile", "fromlist", "frombytes",
    "fromunicode", "index", "insert", "pop", "__reduce_ex__", "remove",
    "reverse", "tofile", "tolist", "tobytes", "tounicode", "__sizeof__",
    "__class_getitem__"
]

array.tp_getset = ["typecode", "itemsize"]

$B.set_func_names(array, "array")
$B.finalize_type(array)


var array_iterator = $B.make_type("array_iterator")

array_iterator.tp_iter = function(self){
    return self
}

array_iterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield item
    }
}

$B.set_func_names(array_iterator, "array")
$B.finalize_type(array_iterator)

var module = {
    array: array,
    typecodes: Object.keys(typecodes).join('')
}

$B.addToImported('array', module)

})(__BRYTHON__)
