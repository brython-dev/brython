"use strict";
(function($B){

/*
Implementation of Python dictionaries

We can't use Javascript's Map here, because the behaviour is not exactly the
same (eg with keys that are instances of classes with a __hash__ method...)
and because Map is much slower than regular Javascript objects.

A Python dictionary is implemented as a Javascript objects with these
attributes:
. $all_str: indicates if all the keys are strings. Common use case, optimized
. $strings: a JS object mapping string keys to values, used only if $all_str
  is true
. $version: an integer with an initial value of 0, incremented at each
  insertion
. _keys: list of the keys
. _values: list of the values
. _hashes: list of the key hashes
. table: a JS object with keys = hash of entries, value = list of indices in
  _keys and _values

Lookup by keys:
- if all keys are strings, use $strings[key]
- otherwise:
    - compute hash(key)
    - if dict.table[hash] exists, it is a list of indices
    - for each index, if dict._keys[index] == key, return dict._values[index]

*/

var _b_ = $B.builtins

var set_ops = ["eq", "le", "lt", "ge", "gt",
    "sub", "rsub", "and", "rand", "or", "ror", "xor", "rxor"]

// methods to compare non set-like views
function is_sublist(t1, t2){
    // Return true if all elements of t1 are in t2
    for(var i = 0, ilen = t1.length; i < ilen; i++){
        var x = t1[i],
            flag = false
        for(var j = 0, jlen = t2.length; j < jlen; j++){
            if($B.rich_comp("__eq__", x, t2[j])){
                t2.splice(j, 1)
                flag = true
                break
            }
        }
        if(! flag){
            return false
        }
    }
    return true
}

const dict_view_op = {
    __eq__: function(t1, t2){
        return t1.length == t2.length && is_sublist(t1, t2)
    },
    __ne__: function(t1, t2){
        return ! dict_view_op.__eq__(t1, t2)
    },
    __lt__: function(t1, t2){
        return t1.length < t2.length && is_sublist(t1, t2)
    },
    __gt__: function(t1, t2){
        return dict_view_op.__lt__(t2, t1)
    },
    __le__: function(t1, t2){
        return t1.length <= t2.length && is_sublist(t1, t2)
    },
    __ge__: function(t1, t2){
        return dict_view_op.__le__(t2, t1)
    },
    __and__: function(t1, t2){
        var items = []
        for(var i = 0, ilen = t1.length; i < ilen; i++){
            var x = t1[i]
            for(var j = 0, jlen = t2.length; j < jlen; j++){
                if($B.rich_comp("__eq__", x, t2[j])){
                    t2.splice(j, 1)
                    items.push(x)
                    break
                }
            }
        }
        return $B.$list(items)
    },
    __or__: function(t1, t2){
        var items = t1
        for(var j = 0, jlen = t2.length; j < jlen; j++){
            var y = t2[j],
                flag = false
            for(var i = 0, ilen = t1.length; i < ilen; i++){
                if($B.rich_comp("__eq__", y, t1[i])){
                    t2.splice(j, 1)
                    flag = true
                    break
                }
            }
            if(! flag){
                items.push(y)
            }
        }
        return items
    }

}

function make_view_comparison_methods(klass){
    for(var i = 0, len = set_ops.length; i < len; i++){
        var op = "__" + set_ops[i] + "__"
        klass[op] = (function(op){
            return function(self, other){
                // compare set of items to other
                if($B.exact_type(self, _dict_keys) ||
                        ($B.exact_type(self, _dict_items)
                         && dict.$set_like(self.dict))){
                    return _b_.set[op](_b_.set.$factory(self),
                        _b_.set.$factory(other))
                }else{
                    // Non-set like views can only be compared to
                    // instances of the same class
                    if(! $B.exact_type(other, klass)){
                        return false
                    }
                    var other_items = _b_.list.$factory(other)
                    return dict_view_op[op](self.items, other_items)
                }
            }
        })(op)
    }
}

$B.str_dict = function(){}

var dict = _b_.dict
dict.$match_mapping_pattern = true // for pattern matching (PEP 634)

function dict___contains__(){
    var $ = $B.args("__contains__", 2, {self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key
    return _b_.dict.$contains(self, key)
}

function dict_subscript(){

}

function dict___sizeof__(){

}

function dict_get(){
    var $ = $B.args("get", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: _b_.None}, null, null)
    try{
        // call $getitem with ignore_missign set to true
        return dict.$getitem($.self, $.key, true)
    }catch(err){
        if($B.$isinstance(err, _b_.KeyError)){
            return $._default
        }else{
            throw err
        }
    }
}

dict.get = dict_get // used internally

function dict_setdefault(){
    var $ = $B.args("setdefault", 3, {self: null, key: null, _default: null},
            ["self", "key", "_default"], arguments, {_default: _b_.None}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default
    _default = _default === undefined ? _b_.None : _default

    if(self.$all_str){
        if(typeof key === 'string'){
            if(! self.$strings.hasOwnProperty(key)){
                self.$strings[key] = _default
            }
            return self.$strings[key]
        }else{
            // Non-string key, convert to regular dict
            convert_all_str(self)
        }
    }

    if(self.$jsobj){
        if(! self.$jsobj.hasOwnProperty(key)){
            self.$jsobj[key] = _default
        }
        return self.$jsobj[key]
    }

    var lookup = dict.$lookup_by_key(self, key)
    if(lookup.found){
        return lookup.value
    }
    var hash = lookup.hash
    dict.$setitem(self, key, _default, hash, true)
    return _default
}

function dict_pop(){
    var missing = {},
        $ = $B.args("pop", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: $B.NULL}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default

    try{
        var res = dict.__getitem__(self, key)
        dict.__delitem__(self, key)
        return res
    }catch(err){
        if($B.is_exc(err, _b_.KeyError)){
            if(_default !== $B.NULL){
                return _default
            }
            throw err
        }
        throw err
    }
}

function dict_popitem(){
    $B.check_nb_args_no_kw('popitem', 1, arguments)
    if(dict.mp_length(self) == 0){
        $B.RAISE(_b_.KeyError, "'popitem(): dictionary is empty'")
    }
    if(self.$all_str){
        for(var key in self.$strings){
            // go to last key
        }
        let res = $B.fast_tuple([key, self.$strings[key]])
        delete self.$strings[key]
        self.$version++
        return res
    }
    var index = self._keys.length - 1
    while(index >= 0){
        if(self._keys[index] !== undefined){
            let res = $B.fast_tuple([self._keys[index], self._values[index]])
            delete self._keys[index]
            delete self._values[index]
            self.$version++
            return res
        }
        index--
    }
}

function dict_keys(){
    $B.args('keys', 1, {self: null}, ['self'], arguments, {}, null, null)
    return {
        ob_type: _dict_keys,
        dict: $.self
    }
}

function dict_items(self){
    $B.args('items', 1, {self: null}, ['self'], arguments, {}, null, null)
    return {
        ob_type: _dict_items,
        it: dict.$iter_items(self)
    }
}

function dict_values(){
    $B.args('values', 1, {self: null}, ['self'], arguments, {}, null, null)
    return dict_values.$factory(self)
}

function dict_update(){
    var $ = $B.args("update", 1, {"self": null}, ["self"], arguments,
            {}, "args", "kw"),
        self = $.self,
        args = $.args,
        kw = $.kw
    if(args.length > 0){
        var o = args[0]
        if($B.$isinstance(o, dict)){
            if(o.$jsobj){
                o = jsobj2dict(o.$jsobj)
            }
            $copy_dict(self, o)
        }else if(_b_.hasattr(o, "keys")){
            var _keys = _b_.list.$factory($B.$call($B.$getattr(o, "keys"))())
            for(let i = 0, len = _keys.length; i < len; i++){
                var _value = $B.$getattr(o, "__getitem__")(_keys[i])
                dict.$setitem(self, _keys[i], _value)
            }
        }else{
            let it = _b_.iter(o),
                i = 0,
                key_value
            while(true){
                try{
                    var item = _b_.next(it)
                }catch(err){
                    if($B.is_exc(err, _b_.StopIteration)){
                        break
                    }
                    throw err
                }
                try{
                    key_value = _b_.list.$factory(item)
                }catch(err){
                    $B.RAISE(_b_.TypeError, "cannot convert dictionary" +
                        " update sequence element #" + i + " to a sequence")
                }
                if(key_value.length !== 2){
                    $B.RAISE(_b_.ValueError, "dictionary update " +
                        "sequence element #" + i + " has length " +
                        key_value.length + "; 2 is required")
                }
                dict.$setitem(self, key_value[0], key_value[1])
                i++
            }
        }
    }
    $copy_dict(self, kw)
    return _b_.None
}

function dict_fromkeys(){
    var $ = $B.args("fromkeys", 3, {cls: null, keys: null, value: null},
        ["cls", "keys", "value"], arguments, {value: _b_.None}, null, null),
        keys = $.keys,
        value = $.value

    // class method
    var cls = $.cls,
        res = $B.$call(cls)(),
        klass = $B.get_class(res), // might not be cls
        keys_iter = $B.$iter(keys),
        setitem = klass === dict ? dict.$setitem : $B.$getattr(klass, '__setitem__')

    while(1){
        try{
            var key = _b_.next(keys_iter)
            setitem(res, key, value)
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration])){
                return res
            }
            throw err
        }
    }
}

function dict_clear(){
    // Remove all items from the dictionary.
    var $ = $B.args("clear", 1, {self: null}, ["self"], arguments, {},
        null, null),
        self = $.self

    self.table = Object.create(null)

    self._keys = []
    self._values = []
    self.$all_str = true
    self.$strings = new $B.str_dict()

    if(self.$jsobj){
        for(var attr in self.$jsobj){
            if(attr.charAt(0) !== "$" && attr !== "__class__"){
                delete self.$jsobj[attr]
            }
        }
    }
    self.$version++
    return _b_.None
}

function dict_copy(){
    // Return a shallow copy of the dictionary
    var $ = $B.args("copy", 1, {self: null},["self"], arguments,{},
        null, null),
        self = $.self,
        res = $B.empty_dict()

    if($B.exact_type(self, _b_.dict)){
        $copy_dict(res, self)
        return res
    }
    return res
}

function dict___reversed__(){
    return dict_reversekeyiterator.$factory(self)
}

/* dict.tp_methods start */
dict.tp_methods = [
    ["__contains__", dict___contains__, $B.METH_O | $B.METH_COEXIST],
    ["__getitem__", dict_subscript, $B.METH_O | $B.METH_COEXIST],
    ["__sizeof__", dict___sizeof__, $B.METH_NOARGS],
    ["get", dict_get, $B.METH_FASTCALL],
    ["setdefault", dict_setdefault, $B.METH_FASTCALL],
    ["pop", dict_pop, $B.METH_FASTCALL],
    ["popitem", dict_popitem, $B.METH_NOARGS],
    ["keys", dict_keys, $B.METH_NOARGS],
    ["items", dict_items, $B.METH_NOARGS],
    ["values", dict_values, $B.METH_NOARGS],
    ["update", dict_update, $B.METH_VARARGS | $B.METH_KEYWORDS],
    ["fromkeys", dict_fromkeys, $B.METH_FASTCALL | $B.METH_CLASS],
    ["clear", dict_clear, $B.METH_NOARGS],
    ["copy", dict_copy, $B.METH_NOARGS],
    ["__reversed__", dict___reversed__, $B.METH_NOARGS],
    ["__class_getitem__", $B.$class_getitem, $B.METH_O | $B.METH_CLASS]
]
/* dict.tp_methods end */

dict.$to_obj = function(d){
    // Function applied to dictionary that only has string keys,
    // return a Javascript objects with the keys mapped to the value,
    // excluding the insertion rank
    var res = {}
    for(var entry of dict.$iter_items(d)){
        res[entry.key] = entry.value
    }
    return res
}

dict.$iter_keys_check = function*(d){
    for(var entry of dict.$iter_items(d)){
        yield entry.key
    }
}

dict.$iter_values_check = function*(d){
    for(var entry of dict.$iter_items(d)){
        yield entry.value
    }
}

dict.$set_like = function(self){
    // return true if all values are hashable
    for(var v of self._values){
        if(v === undefined){
            continue
        }else if(typeof v == 'string' ||
                typeof v == 'number' ||
                typeof v == 'boolean'){
            continue
        }else if([_b_.tuple, _b_.float, _b_.complex].includes($B.get_class(v))){
            continue
        }else if(! _b_.hasattr($B.get_class(v), '__hash__')){
            return false
        }
    }
    return true
}

dict.$iter_items = function*(d){
    if(d.$all_str){
        for(let key in d.$strings){
            if(key != '$dict_strings'){
                yield {key, value: d.$strings[key]}
            }
        }
    }
    if(d.$jsobj){
        for(let key in d.$jsobj){
            if(!d.$exclude || ! d.$exclude(key)){
                yield {key, value: d.$jsobj[key]}
            }
        }
    }else{
        var version = d.$version
        for(var i = 0, len = d._keys.length; i < len; i++){
            if(d._keys[i] !== undefined){
                yield {key: d._keys[i], value: d._values[i], hash: d._hashes[i]}
                if(d.$version !== version){
                    $B.RAISE(_b_.RuntimeError, 'changed in iteration')
                }
            }
        }
        if(d.$version !== version){
            $B.RAISE(_b_.RuntimeError, 'changed in iteration')
        }
    }
}

var dict_keyiterator = $B.make_builtin_class('dict_keyiterator')

dict_keyiterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield item.key
    }
}

dict_keyiterator.tp_iter = function(self){
    return self
}

dict_keyiterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([$B.$list(Array.from(dict_keyiterator.tp_iternext(self)))])])
}

$B.set_func_names(dict_keyiterator, 'builtins')

var dict_valueiterator = $B.make_builtin_class('dict_valueiterator')
dict_valueiterator.$factory = function(d){

}

dict_valueiterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield item.value
    }
}

dict_valueiterator.tp_iter = function(self){
    return self
}

dict_valueiterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([$B.$list(Array.from(dict_valueiterator.tp_iternext(self)))])])
}

$B.set_func_names(dict_valueiterator, 'builtins')

var dict_itemiterator = $B.make_builtin_class('dict_itemiterator')
dict_itemiterator.$factory = function(d){
    return {
        ob_type: dict_itemiterator,
        it: dict.$iter_items(d)
    }
}

dict_itemiterator.tp_iternext = function*(self){
    for(var item of self.it){
        yield $B.fast_tuple([item.key, item.value])
    }
}

dict_itemiterator.tp_iter = function(self){
    return self
}

dict_itemiterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([$B.$list(Array.from(dict_itemiterator.tp_iternext(self)))])])
}

$B.set_func_names(dict_itemiterator, 'builtins')

dict.tp_iter = function(self){
    return {
        ob_type: dict_keyiterator,
        it: dict.$iter_items(self)
    }
}

var $copy_dict = function(left, right){
    // left and right are dicts
    right.$version = right.$version || 0
    var right_version = right.$version
    if(right.$all_str){
        if(left.$all_str){
            for(let key in right.$strings){
                left.$strings[key] = right.$strings[key]
            }
        }else{
            for(let key in right.$strings){
                dict.$setitem(left, key, right.$strings[key])
            }
        }
    }else{
        for(var entry of dict.$iter_items(right)){
            dict.$setitem(left, entry.key, entry.value, entry.hash)
            if(right.$version != right_version){
                $B.RAISE(_b_.RuntimeError, "dict mutated during update")
            }
        }
    }
}

dict.__bool__ = function () {
    var $ = $B.args("__bool__", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    return dict.mp_length($.self) > 0
}

dict.__class_getitem__ = $B.$class_getitem

dict.$lookup_by_key = function(d, key, hash){
    hash = hash === undefined ? _b_.hash(key) : hash
    var indices = d.table[hash],
        index
    if(indices !== undefined){
        for(var i = 0, len = indices.length; i < len; i++){
            index = indices[i]
            if(d._keys[index] === undefined){
                d.table[hash].splice(i, 1)
                if(d.table[hash].length == 0){
                    delete d.table[hash]
                    return {found: false, hash}
                }
                continue
            }
            if($B.is_or_equals(d._keys[index], key)){
                return {found: true,
                        key: d._keys[index], value: d._values[index],
                        hash, rank: i, index}
            }
        }
    }
    return {found: false, hash}
}

dict.$contains = function(self, key){
    if(self.$all_str){
        if(typeof key == 'string'){
            return self.$strings.hasOwnProperty(key)
        }
        var hash = $B.$getattr($B.get_class(key), '__hash__')
        if(hash === _b_.object.__hash__){
            return false
        }
        convert_all_str(self)
    }

    if(self.$jsobj){
        return self.$jsobj[key] !== undefined
    }

    return dict.$lookup_by_key(self, key).found
}

dict.__delitem__ = function(){
    var $ = $B.args("__eq__", 2, {self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key
    if(self[$B.JSOBJ]){
        delete self[$B.JSOBJ][key]
    }
    if(self.$all_str){
        if(typeof key == 'string'){
            if(self.$strings.hasOwnProperty(key)){
                dict.$delete_string(self, key)
                return _b_.None
            }else{
                $B.RAISE(_b_.KeyError, key)
            }
        }
        if(! dict.__contains__(self, key)){
            $B.RAISE(_b_.KeyError, _b_.str.$factory(key))
        }
    }
    if(self.$jsobj){
        if(self.$jsobj[key] === undefined){
            $B.RAISE(_b_.KeyError, key)
        }
        delete self.$jsobj[key]
        return _b_.None
    }

    var lookup = dict.$lookup_by_key(self, key)
    if(lookup.found){
        self.table[lookup.hash].splice(lookup.rank, 1)
        if(self.table[lookup.hash].length == 0){
            delete self.table[lookup.hash]
        }
        delete self._values[lookup.index]
        delete self._keys[lookup.index]
        delete self._hashes[lookup.index]
        self.$version++
        return _b_.None
    }
    $B.RAISE(_b_.KeyError, _b_.str.$factory(key))
}

dict.__eq__ = function(){
    var $ = $B.args("__eq__", 2, {self: null, other: null},
        ["self", "other"], arguments, {}, null, null),
        self = $.self,
        other = $.other
    return dict.$eq(self, other)
}

dict.$eq = function(self, other){
    if(! $B.$isinstance(other, dict)){
        return _b_.NotImplemented
    }

    if(self.$all_str && other.$all_str){
        if(dict.mp_length(self) !== dict.mp_length(other)){
            return false
        }
        for(let k in self.$strings){
            if(! other.$strings.hasOwnProperty(k)){
                return false
            }
            if(! $B.is_or_equals(self.$strings[k], other.$strings[k])){
                return false
            }
        }
        return true
    }

    if(self.$jsobj && other.$jsobj){
        if(dict.mp_length(self) !== dict.mp_length(other)){
            return false
        }
        for(var k in self.$jsobj){
            if(! other.$jsobj.hasOwnProperty(k)){
                return false
            }
            if(! $B.is_or_equals(self.$jsobj[k], other.$jsobj[k])){
                return false
            }
        }
        return true
    }

    if(self.$all_str){
        let d = dict.copy(self)
        convert_all_str(d)
        return dict.$eq(d, other)
    }
    if(other.$all_str){
        let d = dict.copy(other)
        convert_all_str(d)
        return dict.$eq(self, d)
    }

    if(self.$jsobj){
        return dict.$eq(jsobj2dict(self.$jsobj), other)
    }
    if(other.$jsobj){
        return dict.$eq(self, jsobj2dict(other.$jsobj))
    }

    if(dict.mp_length(self) != dict.mp_length(other)){
        return false
    }

    for(var hash in self.table){
        var self_pairs = []
        for(let index of self.table[hash]){
            self_pairs.push([self._keys[index], self._values[index]])
        }
        // Get all (key, value) pairs in other that have the same hash
        var other_pairs = []
        if(other.table[hash] !== undefined){
            for(let index of other.table[hash]){
                other_pairs.push([other._keys[index], other._values[index]])
            }
        }

        for(let self_pair of self_pairs){
            let flag = false,
                key = self_pair[0],
                value = self_pair[1]
            for(let other_pair of other_pairs){
                if($B.is_or_equals(key, other_pair[0]) &&
                        $B.is_or_equals(value, other_pair[1])){
                    flag = true
                    break
                }
            }
            if(! flag){
                return false
            }
        }
    }
    return true
}

dict.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, arg: null},
        ["self", "arg"], arguments, {}, null, null),
        self = $.self,
        arg = $.arg
    return dict.$getitem(self, arg)
}

dict.$contains_string = function(self, key){
    // Test if string "key" is in a dict where all keys are string
    if(self.$all_str){
        return self.$strings.hasOwnProperty(key)
    }
    if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){
        return true
    }
    if(self.table && self.table[_b_.hash(key)] !== undefined){
        return true
    }
    return false
}

dict.$delete_string = function(self, key){
    // Used for dicts where all keys are strings
    if(self.$all_str){
        var ix = self.$strings[key]
        if(ix !== undefined){
            delete self.$strings[key]
        }
    }
    if(self.$jsobj){
        delete self.$jsobj[key]
    }
    if(self.table){
        delete self.table[_b_.hash(key)]
    }
}

dict.$missing = {}

dict.$get_string = function(self, key, _default){
    // Used for dicts where all keys are strings
    if(self.$all_str && self.$strings.hasOwnProperty(key)){
        return self.$strings[key]
    }
    if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){
        return self.$jsobj[key]
    }
    if(self.table && dict.mp_length(self)){
        var indices = self.table[_b_.hash(key)]
        if(indices !== undefined){
            return self._values[indices[0]]
        }
    }
    return _default ?? _b_.dict.$missing
}

dict.$getitem_string = function(self, key){
    // Used for dicts where all keys are strings
    if(self.$all_str && self.$strings.hasOwnProperty(key)){
        return self.$strings[key]
    }
    if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){
        return self.$jsobj[key]
    }
    if(self.table){
        var indices = self.table[_b_.hash(key)]
        if(indices !== undefined){
            return self._values[indices[0]]
        }
    }
    $B.RAISE(_b_.KeyError, key)
}

dict.$keys_string = function(self){
    // return the list of keys in a dict where are keys are strings
    var res = []
    if(self.$all_str){
        return Object.keys(self.$strings)
    }
    if(self.$jsobj){
        res = res.concat(Object.keys(self.$jsobj))
    }
    if(self.table){
        res = res.concat(self._keys.filter((x) => x !== undefined))
    }
    return res
}

dict.$setitem_string = function(self, key, value){
    // Used for dicts where all keys are strings
    if(self.$all_str){
        self.$strings[key] = value
        return _b_.None
    }else{
        var h = _b_.hash(key),
            indices = self.table[h]
        if(indices !== undefined){
            self._values[indices[0]] = value
            return _b_.None
        }
    }
    var index = self._keys.length
    self.$strings[key] = index
    self._keys.push(key)
    self._values.push(value)
    self.$version++
    return _b_.None
}

dict.$getitem = function(self, key, ignore_missing){
    // ignore_missing is set in dict.get and dict.setdefault
    if(self.$all_str){
        if(typeof key == 'string'){
            if(self.$strings.hasOwnProperty(key)){
                return self.$strings[key]
            }
        }else{
            var hash_method = $B.$getattr($B.get_class(key), '__hash__')
            if(hash_method !== _b_.object.__hash__){
                convert_all_str(self)
                let lookup = dict.$lookup_by_key(self, key)
                if(lookup.found){
                    return lookup.value
                }
            }
        }
    }else if(self.$jsobj){
        if(self.$exclude && self.$exclude(key)){
            $B.RAISE(_b_.KeyError, key)
        }
        if(self.$jsobj.hasOwnProperty(key)){
            return self.$jsobj[key]
        }
        if(! self.table){
            $B.RAISE(_b_.KeyError, key)
        }
    }else{
        let lookup = dict.$lookup_by_key(self, key)
        if(lookup.found){
            return lookup.value
        }
    }
    if(! ignore_missing){
        var klass = $B.get_class(self)
        if(klass !== dict && ! ignore_missing){
            try{
                var missing_method = $B.$getattr(klass,
                    "__missing__", _b_.None)
            }catch(err){
                console.log(err)

            }
            if(missing_method !== _b_.None){
                return missing_method(self, key)
            }
        }
    }
    $B.RAISE(_b_.KeyError, key)
}

dict.__hash__ = _b_.None

function init_from_list(self, args){
    var i = 0
    for(var item of args){
        if(item.length != 2){
            $B.RAISE(_b_.ValueError, "dictionary " +
                `update sequence element #${i} has length ${item.length}; 2 is required`)
        }
        dict.$setitem(self, item[0], item[1])
        i++
    }
}

dict.$set_string_no_duplicate = function(d, keys, string, value){
    if(typeof string !== 'string'){
        $B.RAISE(_b_.TypeError,
            'keywords must be strings')
    }
    if(keys.has(string)){
        $B.RAISE(_b_.TypeError, 'dict() got multiple values for keyword ' +
            `argument '${string}'`)
    }
    d.$strings[string] = value
    keys.add(string)
}

function add_mapping(d, obj){
    for(var entry of _b_.dict.$iter_items(obj)){
        dict.$setitem(d, entry.key, entry.value, entry.hash)
    }
}

function add_iterable(d, js_iterable){
    var i = 0
    for(var entry of js_iterable){
        var items = Array.from($B.make_js_iterator(entry))
        if(items.length !== 2){
            $B.RAISE(_b_.ValueError, "dictionary " +
                `update sequence element #${i} has length ${items.length}; 2 is required`)
        }
        dict.$setitem(d, items[0], items[1])
        i++
    }
}

dict.tp_init = function(self, first, second){
    if(first === undefined){
        return _b_.None
    }
    if(second === undefined){
        // single argument
        if((! first.$kw) && $B.$isinstance(first, $B.JSObj)){
            for(let key in first){
                dict.$setitem(self, key, first[key])
            }
            return _b_.None
        }else if(first.$kw){
            var keys = new Set()
            for(let item of first.$kw){
                if($B.$isinstance(item, dict)){
                    for(let subitem of dict.$iter_items(item)){
                        dict.$set_string_no_duplicate(self, keys, subitem.key,
                            subitem.value)
                    }
                }else{
                    for(let key in item){
                        dict.$set_string_no_duplicate(self, keys, key, item[key])
                    }
                }
            }
            return _b_.None
        }else if(first[Symbol.iterator]){
            init_from_list(self, first)
            return _b_.None
        }else if($B.exact_type(first, $B.generator)){
            init_from_list(self, first.js_gen)
            return _b_.None
        }
    }

    var $ = $B.args("dict", 1, {self:null}, ["self"],
        arguments, {}, "first", "second")

    var args = $.first
    if(args.length > 1){
        if($B._experimental_dict){
            console.log('try dict(*args)')
            for(var arg of args){
                if(_b_.isinstance(arg, _b_.dict)){
                    add_mapping(self, arg)
                }else{
                    try{
                        var js_iterable = $B.make_js_iterator(arg)
                    }catch(err){
                        console.log(arg)
                        console.log(err)
                        $B.RAISE(_b_.TypeError, 'expected mapping or ' +
                            `iterable, got ${$B.class_name(arg)}`)
                    }
                    add_iterable(self, js_iterable)
                }
            }
        }else{
            $B.RAISE(_b_.TypeError, "dict expected at most 1 argument" +
                `, got ${args.length}`)
        }
    }else if(args.length == 1){
        args = args[0]
        if($B.exact_type(args, dict)){
            for(let entry of dict.$iter_items(args)){
                dict.$setitem(self, entry.key, entry.value, entry.hash)
            }
        }else{
            var keys = $B.$getattr(args, "keys", null)
            if(keys !== null){
                var gi = $B.$getattr(args, "__getitem__", null)
                if(gi !== null){
                    // has keys and __getitem__ : it's a mapping, iterate on
                    // keys and values
                    gi = $B.$call(gi)
                    let kiter = _b_.iter($B.$call(keys)())
                    while(true){
                        try{
                            let key = _b_.next(kiter),
                                value = gi(key)
                            dict.__setitem__(self, key, value)
                        }catch(err){
                            if($B.is_exc(err, _b_.StopIteration)){
                                break
                            }
                            throw err
                        }
                    }
                }
            }else{
                if(! Array.isArray(args)){
                    args = _b_.list.$factory(args)
                }
                init_from_list(self, args)
            }
        }
    }

    for(let item of _b_.dict.$iter_items($.second)){
        dict.$setitem(self, item.key, item.value)
    }
    return _b_.None
}

dict.__ior__ = function(self, other){
    // PEP 584
    dict.update(self, other)
    return self
}

dict.mp_length = function(self) {
    var _count = 0

    if(self.$all_str){
        return Object.keys(self.$strings).length
    }
    if(self.$jsobj){
        for(var attr in self.$jsobj){
            if(attr.charAt(0) != "$" &&
                    ((! self.$exclude) || ! self.$exclude(attr))){
                _count++
            }
        }
        return _count
    }

    for(var d of self._keys){
        if(d !== undefined){
            _count++
        }
    }

    return _count
}

dict.__ne__ = function(self, other){
    var res = dict.__eq__(self, other)
    return res === _b_.NotImplemented ? res : ! res
}

dict.tp_new = function(cls){
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "int.__new__(): not enough arguments")
    }
    var instance = $B.empty_dict()
    instance.ob_type = cls
    if(cls !== dict){
        instance.dict = $B.empty_dict()
    }
    return instance
}

dict.__or__ = function(self, other){
    // PEP 584
    if(! $B.$isinstance(other, dict)){
        return _b_.NotImplemented
    }
    var res = dict.copy(self)
    dict.update(res, other)
    return res
}

dict.tp_repr = function(self){
    $B.builtins_repr_check(dict, arguments) // in brython_builtins.js
    if(self.$jsobj){ // wrapper around Javascript object
        return dict.tp_repr(jsobj2dict(self.$jsobj, self.$exclude))
    }
    if($B.repr.enter(self)){
        return "{...}"
    }
    let res = []
    for(let entry of dict.$iter_items(self)){
        res.push(_b_.repr(entry.key) + ": " + _b_.repr(entry.value))
    }
    $B.repr.leave(self)
    return "{" + res.join(", ") + "}"
}

dict.$iter_items_reversed = function*(d){
    var version = d.$version
    if(d.$all_str){
        for(var item of Object.entries(d.$strings).reverse()){
            yield $B.fast_tuple(item)
            if(d.$version !== version){
                $B.RAISE(_b_.RuntimeError, 'changed in iteration')
            }
        }
    }else{
        for(var i = d._keys.length - 1; i >= 0; i--){
            var key = d._keys[i]
            if(key !== undefined){
                yield $B.fast_tuple([key, d._values[i]])
                if(d.$version !== version){
                    $B.RAISE(_b_.RuntimeError, 'changed in iteration')
                }
            }
        }
    }
    if(d.$version !== version){
        $B.RAISE(_b_.RuntimeError, 'changed in iteration')
    }
}

dict.$iter_keys_reversed = function*(d){
    for(var entry of dict.$iter_items_reversed(d)){
        yield entry[0]
    }
}

dict.$iter_values_reversed = function*(d){
    for(var entry of dict.$iter_items_reversed(d)){
        yield entry[1]
    }
}

function make_reverse_iterator(name, iter_func){
    // Create the classes to iterate on dictionary keys / values / items
    // in reverse order
    // iter_func is the Javascript function that returns the generator for
    // each specific iteration
    var klass = $B.make_class(name,
        function(d){
            return {
                ob_type: klass,
                d,
                iter: iter_func(d),
                make_iter:function(){
                    return iter_func(d)
                }
            }
        }
    )

    klass.__iter__ = function(self){
        self[Symbol.iterator] = self.make_iter
        return self
    }

    klass.__next__ = function(self){
        var res = self.iter.next()
        if(res.done){
            $B.RAISE(_b_.StopIteration, '')
        }
        return res.value
    }

    klass.__reduce_ex__ = function(self){
        return $B.fast_tuple([_b_.iter,
            $B.fast_tuple([$B.$list(Array.from(self.make_iter()))])])
    }

    $B.set_func_names(klass, 'builtins')

    return klass
}

const dict_reversekeyiterator = make_reverse_iterator(
    'dict_reversekeyiterator',
    dict.$iter_keys_reversed)


dict.__ror__ = function(self, other){
    // PEP 584
    if(! $B.$isinstance(other, dict)){
        return _b_.NotImplemented
    }
    var res = dict.copy(other)
    dict.update(res, self)
    return res
}

dict.__setitem__ = function(){
    var $ = $B.args("__setitem__", 3, {self: null, key: null, value: null},
        ["self", "key", "value"], arguments, {}, null, null)
    return dict.$setitem($.self, $.key, $.value)
}

function convert_all_str(d){
    // convert dict with only str keys to regular dict
    d.$all_str = false
    for(var key in d.$strings){
        dict.$setitem(d, key, d.$strings[key])
    }
}

dict.$setitem = function(self, key, value, $hash, from_setdefault){
    // Set a dictionary item mapping key and value.
    if(self[$B.JSOBJ]){
        // Python dictionary is used in a Javascript object
        value = $B.pyobj2jsobj(value)
        self[$B.JSOBJ][key] = value
    }
    if(self.$all_str){
        if(typeof key == 'string'){
            var int = parseInt(key)
            if(isNaN(int) || int >= 0){
                self.$strings[key] = value
                return _b_.None
            }else{
                // string parsed as negative integer: insertion order
                // not preserved (issue 2256)
                convert_all_str(self)
            }
        }else{
            convert_all_str(self)
        }
    }
    if(self.$jsobj){
        if(self.$from_js){
            // dictionary created by method to_dict of JSObj instances
            value = $B.pyobj2jsobj(value)
        }
        if($B.exact_type(self.$jsobj, _b_.type)){
            self.$jsobj[key] = value
            if(key == "__init__" || key == "__new__"){
                // If class attribute __init__ or __new__ are reset,
                // the factory function has to change
                self.$jsobj.$factory = $B.$instance_creator(self.$jsobj)
            }
        }else{
            self.$jsobj[key] = value
        }
        return _b_.None
    }
    if(key instanceof String){
        key = key.valueOf()
    }

    var hash = $hash !== undefined ? $hash : $B.$hash(key)
    var index

    if(self.table[hash] === undefined){
        index = self._keys.length
        self.table[hash] = [index]
    }else{
        if(! from_setdefault){
            // If $setitem was called from setdefault, it's no use trying
            // another lookup
            var lookup = dict.$lookup_by_key(self, key, hash)
            if(lookup.found){
                self._values[lookup.index] = value
                return _b_.None
            }
        }
        index = self._keys.length
        if(self.table[hash] === undefined){
            // dict.$lookup_by_key might have removed self.table[hash]
            self.table[hash] = [index]
        }else{
            self.table[hash].push(index)
        }
    }
    self._keys.push(key)
    self._values.push(value)
    self._hashes.push(hash)
    self.$version++
    return _b_.None
}

// add "reflected" methods
$B.make_rmethods(dict)

var _dict_items = $B.make_builtin_class("dict_items")

_dict_items.tp_iter = function(self){
    return self
}

_dict_items.tp_iternext = function*(self){
    for(var item of self.it){
        yield $B.fast_tuple([item.key, item.value])
    }
}

_dict_items.sq_length = function(self){
    return dict.mp_length(self.dict)
}

_dict_items.__reduce__ = function(self){
    var items = $B.$list(Array.from(dict_items.tp_iter(self.dict)))
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

_dict_items.tp_repr = function(self){
    var items = Array.from(dict_items.tp_iter(self.dict))
    items = items.map($B.fast_tuple)
    return 'dict_items(' + _b_.repr(items) + ')'
}

const dict_reverseitemiterator = make_reverse_iterator(
    'dict_reverseitemiterator',
    dict.$iter_items_reversed)

_dict_items.__reversed__ = function(self){
    return dict_reverseitemiterator.$factory(self.dict)
}

make_view_comparison_methods(_dict_items)

$B.set_func_names(_dict_items, 'builtins')

var _dict_keys = $B.make_builtin_class("dict_keys")

_dict_keys.tp_iter = function(self){
    return dict_keyiterator.$factory(self.dict)
}

_dict_keys.sq_length = function(self){
    return dict.mp_length(self.dict)
}

_dict_keys.__reduce__ = function(self){
    var items = $B.$list(Array.from(_dict_keys.tp_iter(self)))
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

_dict_keys.tp_repr = function(self){
    var items = Array.from(_dict_keys.tp_iter(self.dict))
    return 'dict_keys(' + _b_.repr(items) + ')'
}

_dict_keys.__reversed__ = function(self){
    return dict_reversekeyiterator.$factory(self.dict)
}

make_view_comparison_methods(_dict_keys)

$B.set_func_names(_dict_keys, 'builtins')

var dict_values = $B.make_builtin_class("dict_values")

dict_values.tp_iter = function(self){
    return {
        ob_type: dict_valueiterator,
        it: dict.$iter_items(self)
    }
}

dict_values.sq_length = function(self){
    return dict.mp_length(self.dict)
}

dict_values.__reduce__ = function(self){
    var items = $B.$list(Array.from(dict_values.tp_iter(self)))
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

dict_values.tp_repr = function(self){
    var items = Array.from(dict_values.tp_iter(self))
    return 'dict_values(' + _b_.repr(items) + ')'
}

const dict_reversevalueiterator = make_reverse_iterator(
    'dict_reversevalueiterator',
    dict.$iter_values_reversed)

dict_values.__reversed__ = function(self){
    return dict_reversevalueiterator.$factory(self.dict)
}

make_view_comparison_methods(dict_values)

$B.set_func_names(dict_values, 'builtins')


dict.$literal = function(items){
    var res = $B.empty_dict()
    for(var item of items){
        dict.$setitem(res, item[0], item[1], item[2])
    }
    return res
}

dict.$factory = function(){
    var res = $B.empty_dict()
    var args = [res]
    for(var arg of arguments){
        args.push(arg)
    }
    dict.tp_init.apply(null, args)
    return res
}

dict.$from_array = function(arrays){
    // used internally for annotations
    var res = $B.empty_dict()
    for(var item of arrays){
        dict.$setitem(res, item[0], item[1])
    }
    return res
}

$B.set_func_names(dict, "builtins")

$B.empty_dict = function(){
    return {
        ob_type: dict,
        table: Object.create(null),
        _keys: [],
        _values: [],
        _hashes: [],
        $strings: new $B.str_dict(),
        $version: 0,
        $all_str: true
    }
}

dict.$from_js = function(jsobj){
    var res = $B.empty_dict()
    for(var key in jsobj){
        dict.$setitem(res, key, jsobj[key])
    }
    return res
}

// This must be done after set_func_names, otherwise dict.fromkeys doesn't
// have the attribute $infos
dict.fromkeys = _b_.classmethod.$factory(dict.fromkeys)

// Class for attribute __dict__ of classes
var mappingproxy = $B.mappingproxy = $B.make_class("mappingproxy",
    function(obj){
        var res
        if($B.$isinstance(obj, dict)){
            res = $B.obj_dict(dict.$to_obj(obj))
        }else{
            res = $B.obj_dict(obj)
        }
        res.ob_type = mappingproxy
        res.$version = 0
        return res
    }
)

mappingproxy.$match_mapping_pattern = true // for pattern matching (PEP 634)

Object.assign(mappingproxy,
    {
        tp_name: 'mappingproxy',
        tp_bases: [_b_.object],
        tp_mro: [mappingproxy, _b_.object],
        dict: $B.obj_dict({})
    }
)

mappingproxy.__hash__ = function(self){
    $B.RAISE(_b_.TypeError, `unhashable type: '${$B.class_name(self)}'`)
}

mappingproxy.tp_repr = function(self){
    var d = $B.empty_dict()
    for(var key in self.$jsobj){
        dict.$setitem(d, key, self.$jsobj[key])
    }
    return dict.tp_repr(d)
}

mappingproxy.__setitem__ = function(){
    $B.RAISE(_b_.TypeError, "'mappingproxy' object does not support " +
        "item assignment")
}

for(var attr in dict){
    if(mappingproxy[attr] !== undefined ||
            ["__class__", "__mro__", "__new__", "__init__", "__delitem__",
             "clear", "fromkeys", "pop", "popitem", "setdefault",
             "update"].indexOf(attr) > -1){
        continue
    }
    if(typeof dict[attr] == "function"){
        mappingproxy[attr] = (function(key){
            return function(){
                return dict[key].apply(null, arguments)
            }
        })(attr)
    }else{
        mappingproxy[attr] = dict[attr]
    }
}

for(var attr in $B.dunder_methods){
    if(mappingproxy.hasOwnProperty($B.dunder_methods[attr])){
        // will created in set_func_names
        delete mappingproxy[$B.dunder_methods[attr]]
    }
}
$B.set_func_names(mappingproxy, "builtins")

function jsobj2dict(x, exclude){
    exclude = exclude || function(){return false}
    var d = $B.empty_dict()
    for(var attr in x){
        if(attr.charAt(0) != "$" && ! exclude(attr)){
            if(x[attr] === null){
                dict.$setitem(d, attr, _b_.None)
            }else if(x[attr] === undefined){
                continue
            }else if(x[attr].$jsobj === x){
                dict.$setitem(d, attr, d)
            }else{
                dict.$setitem(d, attr, $B.jsobj2pyobj(x[attr]))
            }
        }
    }
    return d
}


})(__BRYTHON__);

