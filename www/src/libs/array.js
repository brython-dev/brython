var $module = (function($B){

var _b_ = $B.builtins,
    $s = [],
    i
for(var $b in _b_){$s.push('var ' + $b +' = _b_["'+$b+'"]')}
eval($s.join(';'))

var typecodes = {
    'b': Int8Array,    // signed char, 1 byte
    'B': Uint8Array,   // unsigned char, 1
    'u': null,         // Py_UNICODE Unicode character, 2 (deprecated)
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

var array = $B.make_class("array",
    function(){
        var missing = {},
            $ = $B.args("array", 2, {typecode: null, initializer: null},
                ["typecode", "initializer"], arguments, {initializer: missing},
                null, null),
            typecode = $.typecode,
            initializer = $.initializer
        if(! typecodes.hasOwnProperty(typecode)){
            throw _b_.ValueError.$factory("bad typecode (must be b, " +
                "B, u, h, H, i, I, l, L, q, Q, f or d)")
        }
        if(typecodes[typecode] === null){
            throw _b_.NotImplementedError.$factory("type code " +
                typecode + "is not implemented")
        }
        var res = {
            __class__: array,
            typecode: typecode,
            obj: null
        }
        if(initializer !== missing){
            if(Array.isArray(initializer)){
                array.fromlist(res, initializer)
            }else if(_b_.isinstance(initializer, _b_.bytes)){
                array.frombytes(res, initializer)
            }else{
                array.extend(res, initializer)
            }
        }
        return res
    }
)

array.$buffer_protocol = true

var array_iterator = $B.$iterator_class("array_iterator")

array.__getitem__ = function(self, key){
    if(self.obj && self.obj[key] !== undefined){
        return self.obj[key]
    }
    throw _b_.IndexError("array index out of range")
}

array.__iter__ = function(self){
    return $B.$iterator(self.obj, array_iterator)
}

array.__len__ = function(self){
    return self.obj.length
}

array.__str__ = function(self){
    $B.args("__str__", 1, {self: null},
        ["self"], arguments, {}, null, null)
    var res = "array('" + self.typecode + "'"
    if(self.obj !== null){
        res += ", [" + self.obj + "]"
    }
    return res + ")"
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

array.append = function(self, value){
    $B.args("append", 2, {self: null, value: null},
        ["self", "value"], arguments, {}, null, null)
    var pos = self.obj === null ? 0 : self.obj.length
    return array.insert(self, pos, value)
}

array.count = function(self, x){
    $B.args("count", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    if(self.obj === null){return 0}
    return self.obj.filter(function(item){return item == x}).length
}

array.extend = function(self, iterable){
    $B.args("extend", 2, {self: null, iterable: null},
        ["self", "iterable"], arguments, {}, null, null)
    if(iterable.__class__ === array){
        if(iterable.typecode !== self.typecode){
            throw _b_.TypeError.$factory("can only extend with array " +
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
                if(err.__class__ !== _b_.StopIteration){
                    throw err
                }
                break
            }
        }
    }
    return _b_.None
}

array.frombytes = function(self, s){
    $B.args("frombytes", 2, {self: null, s: null},
        ["self", "s"], arguments, {}, null, null)
    if(! _b_.isinstance(s, _b_.bytes)){
        throw _b_.TypeError.$factory("a bytes-like object is required, " +
            "not '" + $B.class_name(s) + "'")
    }
    self.obj = new typecodes[self.typecode](s.source)
    return None
}

array.fromlist = function(self, list){
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
            if(err.__class__ === _b_.StopIteration){
                return _b_.None
            }
            throw err
        }
    }
}

array.fromstring = array.frombytes

array.index = function(self, x){
    $B.args("index", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    var res = self.obj.findIndex(function(item){return x == item})
    if(res == -1){
        throw _b_.ValueError.$factory("array.index(x): x not in array")
    }
    return res
}

array.insert = function(self, i, value){
    $B.args("insert", 3, {self: null, i: null, value: null},
        ["self", "i", "value"], arguments, {}, null, null)
    if(self.obj === null){
        self.obj = [value]
    }else{
        self.obj.splice(i, 0, value)
    }
    return _b_.None
}

array.itemsize = function(self){
    return typecodes[self.typecode].BYTES_PER_ELEMENT
}

array.pop = function(self, i){
    var $ = $B.args("count", 2, {self: null, i: null},
        ["self", "i"], arguments, {i: -1}, null, null)
    i = $.i
    if(self.obj === null){
        throw _b_.IndexError.$factory("pop from empty array")
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

array.remove = function(self, x){
    $B.args("remove", 2, {self: null, x: null},
        ["self", "x"], arguments, {}, null, null)
    var res = self.obj.findIndex(function(item){return x == item})
    if(res == -1){
        throw _b_.ValueError.$factory("array.remove(x): x not in array")
    }
    array.pop(self, res)
    return _b_.None
}

array.reverse = function(self){
    $B.args("reverse", 1, {self: null},
        ["self"], arguments, {}, null, null)
    if(self.obj === null){return _b_.None}
    self.obj.reverse()
    return _b_.None
}

array.tobytes = function(self){
    $B.args("tobytes", 1, {self: null},
        ["self"], arguments, {}, null, null)
    var items = Array.slice.call(null, self.obj),
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

array.tolist = function(self){
    $B.args("tolist", 1, {self: null},
        ["self"], arguments, {}, null, null)
    return Array.slice.call(null, self.obj)
}

array.tostring = array.tobytes

array.typecode = function(self){
    return self.typecode
}

$B.set_func_names(array, "array")

return {
    array: array,
    typecodes: Object.keys(typecodes).join('')
}

})(__BRYTHON__)
