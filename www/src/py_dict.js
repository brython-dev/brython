;(function($B){

/*
Implementation of Python dictionaries

We can't use Javascript's Map here, because the behaviour is not exactly the
same (eg with keys that are instances of classes with a __hash__ method...)
and because Map is much slower than regular Javascript objects.

A Python dictionary is implemented as a Javascript objects with these
attributes:
. $version: an integer with an initial value of 0, incremented at each
  insertion
. _keys: list of the keys
. _values: list of the values
. table: a JS object with keys = hash of entries, value = list of indices in
  _keys and _values

Lookup by keys:
- compute hash(key)
- if dict.table[hash] exists, it is a list of indices
- for each index, if dict._keys[index] == key, return dict._values[index]

*/

var _b_ = $B.builtins

var str_hash = _b_.str.__hash__,
    $N = _b_.None

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

dict_view_op = {
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
                flag = false
            for(var j = 0, jlen = t2.length; j < jlen; j++){
                if($B.rich_comp("__eq__", x, t2[j])){
                    t2.splice(j, 1)
                    items.push(x)
                    break
                }
            }
        }
        return items
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
                if(self.__class__.__name__ == 'dict_keys' ||
                        (self.__class__.__name__ == 'dict_items'
                         && dict.$set_like(self.dict))){
                    return _b_.set[op](_b_.set.$factory(self),
                        _b_.set.$factory(other))
                }else{
                    // Non-set like views can only be compared to
                    // instances of the same class
                    if(other.__class__ !== klass){
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

var mappingproxy = $B.make_class("mappingproxy")

var mappingproxy_handler = {
    get(target, prop){
        if(prop == '__class__'){
            return mappingproxy
        }
        return target[prop]
    }
}

var dict = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __qualname__: 'dict',
    $is_class: true,
    $native: true,
    $match_mapping_pattern: true // for pattern matching (PEP 634)
}

dict.$to_obj = function(d){
    // Function applied to dictionary that only has string keys,
    // return a Javascript objects with the keys mapped to the value,
    // excluding the insertion rank
    var res = {}
    for(var entry of dict.$iter_items_with_hash(d)){
        res[entry.key] = entry.value
    }
    return res
}

dict.$iter_keys_check = function*(d){
    for(var entry of dict.$iter_items_with_hash(d)){
        yield entry.key
    }
}

dict.$iter_values_check = function*(d){
    for(var entry of dict.$iter_items_with_hash(d)){
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
        }else if([_b_.tuple, _b_.float, _b_.complex].indexOf(v.__class__) > -1){
            continue
        }else if(! _b_.hasattr(v.__class__, '__hash__')){
            return false
        }
    }
    return true
}

dict.$iter_items_with_hash = function*(d){
    if(d.$all_str){
        for(var key in d.$strings){
            if(key != '$dict_strings'){
                yield {key, value: d.$strings[key]}
            }
        }
    }
    if(d.$jsobj){
        for(var key in d.$jsobj){
            yield {key, value: d.$jsobj[key]}
        }
    }else if(d.__class__ === $B.jsobj_as_pydict){
        for(var key in d.obj){
            yield {key, value: d.obj[key]}
        }
    }else{
        var version = d.$version
        for(var i = 0, len = d._keys.length; i < len; i++){
            if(d._keys[i] !== undefined){
                yield {key: d._keys[i], value: d._values[i], hash: d._hashes[i]}
                if(d.$version !== version){
                    throw _b_.RuntimeError.$factory('changed in iteration')
                }
            }
        }
        if(d.$version !== version){
            throw _b_.RuntimeError.$factory('changed in iteration')
        }
    }
}

dict.$iter_items_check = function*(d){
    if(d.$jsobj){
        for(var key in d.$jsobj){
            yield [key, d.$jsobj[key]]
        }
    }else{
        var version = d.$version
        for(var i = 0, len = d._keys.length; i < len; i++){
            if(d._keys[i] !== undefined){
                yield [d._keys[i], d._values[i]]
                if(d.$version !== version){
                    throw _b_.RuntimeError.$factory('changed in iteration')
                }
            }
        }
        if(d.$version !== version){
            throw _b_.RuntimeError.$factory('changed in iteration')
        }
    }
}

var $copy_dict = function(left, right){
    // left and right are dicts
    right.$version = right.$version || 0
    var right_version = right.$version
    for(var entry of dict.$iter_items_with_hash(right)){
        dict.$setitem(left, entry.key, entry.value, entry.hash)
        if(right.$version != right_version){
            throw _b_.RuntimeError.$factory("dict mutated during update")
        }
    }
}

dict.__bool__ = function () {
    var $ = $B.args("__bool__", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    return dict.__len__($.self) > 0
}

dict.__class_getitem__ = function(cls, item){
    // PEP 585
    // Set as a classmethod at the end of this script, after $B.set_func_names()
    if(! Array.isArray(item)){
        item = [item]
    }
    return $B.GenericAlias.$factory(cls, item)
}

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

dict.__contains__ = function(){
    var $ = $B.args("__contains__", 2, {self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key

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

    if(self.$all_str){
        if(typeof key == 'string'){
            if(self.$strings.hasOwnProperty(key)){
                dict.$delete_string(self, key)
                return _b_.None
            }else{
                throw _b_.KeyError.$factory(key)
            }
        }
        if(! dict.__contains__(self, key)){
            throw _b_.KeyError.$factory(_b_.str.$factory(key))
        }
    }
    if(self.$jsobj){
        if(self.$jsobj[key] === undefined){
            throw _b_.KeyError.$factory(key)
        }
        delete self.$jsobj[key]
        return $N
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
    throw _b_.KeyError.$factory(_b_.str.$factory(key))
}

dict.__eq__ = function(){
    var $ = $B.args("__eq__", 2, {self: null, other: null},
        ["self", "other"], arguments, {}, null, null),
        self = $.self,
        other = $.other
    return dict.$eq(self, other)
}

dict.$eq = function(self, other){
    if(! _b_.isinstance(other, dict)){
        return _b_.NotImplemented
    }

    if(self.$all_str && other.$all_str){
        if(dict.__len__(self) !== dict.__len__(other)){
            return false
        }
        for(var k in self.$strings){
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
        if(dict.__len__(self) !== dict.__len__(other)){
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
        var d = dict.copy(self)
        convert_all_str(d)
        return dict.$eq(d, other)
    }
    if(other.$all_str){
        var d = dict.copy(other)
        convert_all_str(d)
        return dict.$eq(self, d)
    }

    if(self.$jsobj){
        return dict.$eq(jsobj2dict(self.$jsobj), other)
    }
    if(other.$jsobj){
        return dict.$eq(self, jsobj2dict(other.$jsobj))
    }

    if(dict.__len__(self) != dict.__len__(other)){
        return false
    }

    for(var hash in self.table){
        var self_pairs = []
        for(var index of self.table[hash]){
            self_pairs.push([self._keys[index], self._values[index]])
        }
        // Get all (key, value) pairs in other that have the same hash
        var other_pairs = []
        if(other.table[hash] !== undefined){
            for(var index of other.table[hash]){
                other_pairs.push([other._keys[index], other._values[index]])
            }
        }

        for(var self_pair of self_pairs){
            var flag = false
            var key = self_pair[0],
                value = self_pair[1]
            for(var other_pair of other_pairs){
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

dict.$get_string = function(self, key){
    // Used for dicts where all keys are strings
    if(self.$all_str && self.$strings.hasOwnProperty(key)){
        return self.$strings[key]
    }
    if(self.$jsobj && self.$jsobj.hasOwnProperty(key)){
        return self.$jsobj[key]
    }
    if(self.table && dict.__len__(self)){
        var indices = self.table[_b_.hash(key)]
        if(indices !== undefined){
            return self._values[indices[0]]
        }
    }
    return _b_.dict.$missing
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
    throw _b_.KeyError.$factory(key)
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
                var lookup = dict.$lookup_by_key(self, key)
                if(lookup.found){
                    return lookup.value
                }
            }
        }
    }else if(self.$jsobj){
        if(self.$exclude && self.$exclude(key)){
            throw _b_.KeyError.$factory(key)
        }
        if(self.$jsobj.hasOwnProperty(key)){
            return self.$jsobj[key]
        }
        if(! self.table){
            throw _b_.KeyError.$factory(key)
        }
    }else{
        var lookup = dict.$lookup_by_key(self, key)
        if(lookup.found){
            return lookup.value
        }
    }
    if(! ignore_missing){
        if(self.__class__ !== dict && ! ignore_missing){
            try{
                var missing_method = $B.$getattr(self.__class__,
                    "__missing__", _b_.None)
            }catch(err){
                console.log(err)

            }
            if(missing_method !== _b_.None){
                return missing_method(self, key)
            }
        }
    }
    throw _b_.KeyError.$factory(key)
}

dict.__hash__ = _b_.None

function init_from_list(self, args){
    var i = -1,
        stop = args.length - 1,
        si = dict.$setitem
    while(i++ < stop){
        var item = args[i]
        if(item.length != 2){
            throw _b_.ValueError.$factory("dictionary " +
                `update sequence element #${i} has length ${item.length}; 2 is required`)
        }
        dict.$setitem(self, item[0], item[1])
    }
}

dict.__init__ = function(self, first, second){
    if(first === undefined){
        return _b_.None
    }
    if(second === undefined){
        if((! first.$kw) && $B.get_class(first) === $B.JSObj){
            for(var key in first){
                dict.$setitem(self, key, first[key])
            }
            return _b_.None
        }else if(first.$jsobj){
            self.$jsobj = {}
            for(var attr in first.$jsobj){
                self.$jsobj[attr] = first.$jsobj[attr]
            }
            self.$all_str = false
            return $N
        }else if(Array.isArray(first)){
            init_from_list(self, first)
            return $N
        }else if(first[Symbol.iterator]){
            init_from_list(self, Array.from(first))
            return $N
        }
    }

    var $ = $B.args("dict", 1, {self:null}, ["self"],
        arguments, {}, "first", "second")
    var args = $.first
    if(args.length > 1){
        throw _b_.TypeError.$factory("dict expected at most 1 argument" +
            ", got 2")
    }else if(args.length == 1){
        args = args[0]
        if(args.__class__ === dict){
            for(var entry of dict.$iter_items_with_hash(args)){
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
                    var kiter = _b_.iter($B.$call(keys)())
                    while(true){
                        try{
                            var key = _b_.next(kiter),
                                value = gi(key)
                                dict.__setitem__(self, key, value)
                        }catch(err){
                            if(err.__class__ === _b_.StopIteration){
                                break
                            }
                            throw err
                        }
                    }
                    return $N
                }
            }
            if(! Array.isArray(args)){
                args = _b_.list.$factory(args)
            }
            init_from_list(self, args)
        }
    }

    for(var key in $.second.$jsobj){
        dict.$setitem(self, key, $.second.$jsobj[key])
    }
    return _b_.None
}

dict.__iter__ = function(self){
    return _b_.iter(dict.keys(self))
}

dict.__ior__ = function(self, other){
    // PEP 584
    dict.update(self, other)
    return self
}

dict.__len__ = function(self) {
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

dict.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory("int.__new__(): not enough arguments")
    }
    var instance = $B.empty_dict()
    instance.__class__ = cls
    if(cls !== dict){
        instance.__dict__ = $B.empty_dict()
    }
    return instance
}

dict.__or__ = function(self, other){
    // PEP 584
    if(! _b_.isinstance(other, dict)){
        return _b_.NotImplemented
    }
    var res = dict.copy(self)
    dict.update(res, other)
    return res
}

function __newobj__(){
    // __newobj__ is called with a generator as only argument
    var $ = $B.args('__newobj__', 0, {}, [], arguments, {}, 'args', null),
        args = $.args
    var res = $B.empty_dict()
    res.__class__ = args[0]
    return res
}

dict.__reduce_ex__ = function(self, protocol){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__]),
        _b_.None,
        _b_.None,
        dict.items(self)])
}

dict.__repr__ = function(self){
    $B.builtins_repr_check(dict, arguments) // in brython_builtins.js
    if(self.$jsobj){ // wrapper around Javascript object
        return dict.__repr__(jsobj2dict(self.$jsobj, self.$exclude))
    }
    if($B.repr.enter(self)){
        return "{...}"
    }
    var res = [],
        key,
        value
    for(var entry of dict.$iter_items_with_hash(self)){
        res.push(_b_.repr(entry.key) + ": " + _b_.repr(entry.value))
    }
    $B.repr.leave(self)
    return "{" + res.join(", ") + "}"
}

dict.$iter_items_reversed = function*(d){
    var version = d.$version
    for(var i = d._keys.length - 1; i >= 0; i--){
        var key = d._keys[i]
        if(key !== undefined){
            yield $B.fast_tuple([key, d._values[i]])
            if(d.$version !== version){
                throw _b_.RuntimeError.$factory('changed in iteration')
            }
        }
    }
    if(d.$version !== version){
        throw _b_.RuntimeError.$factory('changed in iteration')
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
                __class__: klass,
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
            throw _b_.StopIteration.$factory('')
        }
        return res.value
    }

    klass.__reduce_ex__ = function(self, protocol){
        return $B.fast_tuple([_b_.iter,
            $B.fast_tuple([Array.from(self.make_iter())])])
    }

    $B.set_func_names(klass, 'builtins')

    return klass
}

dict_reversekeyiterator = make_reverse_iterator(
    'dict_reversekeyiterator',
    dict.$iter_keys_reversed)

dict.__reversed__ = function(self){
    return dict_reversekeyiterator.$factory(self)
}

dict.__ror__ = function(self, other){
    // PEP 584
    if(! _b_.isinstance(other, dict)){
        return _b_.NotImplemented
    }
    var res = dict.copy(other)
    dict.update(res, self)
    return res
}

dict.__setitem__ = function(self, key, value){
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
    if(self.$all_str){
        if(typeof key == 'string'){
            self.$strings[key] = value
            return _b_.None
        }else{
            convert_all_str(self)
        }
    }
    if(self.$jsobj){
        if(self.$from_js){
            // dictionary created by method to_dict of JSObj instances
            value = $B.pyobj2jsobj(value)
        }
        if(self.$jsobj.__class__ === _b_.type){
            self.$jsobj[key] = value
            if(key == "__init__" || key == "__new__"){
                // If class attribute __init__ or __new__ are reset,
                // the factory function has to change
                self.$jsobj.$factory = $B.$instance_creator(self.$jsobj)
            }
        }else{
            self.$jsobj[key] = value
        }
        return $N
    }else if(self.__class__ === $B.jsobj_as_pydict){
        return $B.jsobj_as_pydict.__setitem__(self, key, value)
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

dict.clear = function(){
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
    return $N
}

dict.copy = function(self){
    // Return a shallow copy of the dictionary
    var $ = $B.args("copy", 1, {self: null},["self"], arguments,{},
        null, null),
        self = $.self,
        res = $B.empty_dict()

    if(self.__class__ === _b_.dict){
        $copy_dict(res, self)
        return res
    }
    var it = $B.make_js_iterator(self)
    for(var k of it){
        console.log('iteration yields key', k)
    }
    return res
}

dict.fromkeys = function(){

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

dict.get = function(){
    var $ = $B.args("get", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: $N}, null, null)
    try{
        // call $getitem with ignore_missign set to true
        return dict.$getitem($.self, $.key, true)
    }catch(err){
        if(_b_.isinstance(err, _b_.KeyError)){
            return $._default
        }else{
            throw err
        }
    }
}

var dict_items = $B.make_class("dict_items",
    function(d){
        return {
            __class__: dict_items,
            dict: d,
            make_iter: function*(){
                for(var entry of dict.$iter_items_with_hash(d)){
                    yield $B.fast_tuple([entry.key, entry.value])
                }
            }
        }
    }
)

dict_items.__iter__ = function(self){
    return dict_itemiterator.$factory(self.make_iter)
}

dict_items.__len__ = function(self){
    return dict.__len__(self.dict)
}

dict_items.__reduce__ = function(self){
    var items = Array.from(self.make_iter())
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

dict_items.__repr__ = function(self){
    var items = Array.from(self.make_iter())
    items = items.map($B.fast_tuple)
    return 'dict_items(' + _b_.repr(items) + ')'
}

dict_reverseitemiterator = make_reverse_iterator(
    'dict_reverseitemiterator',
    dict.$iter_items_reversed)

dict_items.__reversed__ = function(self){
    return dict_reverseitemiterator.$factory(self.dict)
}

make_view_comparison_methods(dict_items)

$B.set_func_names(dict_items, 'builtins')

var dict_itemiterator = $B.make_class('dict_itemiterator',
    function(make_iter){
        return {
            __class__: dict_itemiterator,
            iter: make_iter(),
            make_iter
        }
    }
)

dict_itemiterator.__iter__ = function(self){
    self[Symbol.iterator] = function(){return self.iter}
    return self
}

dict_itemiterator.__next__ = function(self){
    var res = self.iter.next()
    if(res.done){
        throw _b_.StopIteration.$factory('')
    }
    return $B.fast_tuple(res.value)
}

dict_itemiterator.__reduce_ex__ = function(self, protocol){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([Array.from(self.make_iter())])])
}

$B.set_func_names(dict_itemiterator, 'builtins')

dict.items = function(self){
    var $ = $B.args('items', 1, {self: null}, ['self'], arguments,
                    {}, null, null)
    return dict_items.$factory(self)
}

var dict_keys = $B.make_class("dict_keys",
    function(d){
        return {
            __class__: dict_keys,
            dict: d,
            make_iter: function(){return dict.$iter_keys_check(d)}
        }
    }
)

dict_keys.__iter__ = function(self){
    return dict_keyiterator.$factory(self.make_iter)
}

dict_keys.__len__ = function(self){
    return dict.__len__(self.dict)
}

dict_keys.__reduce__ = function(self){
    var items = Array.from(self.make_iter())
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

dict_keys.__repr__ = function(self){
    var items = Array.from(self.make_iter())
    return 'dict_keys(' + _b_.repr(items) + ')'
}

dict_keys.__reversed__ = function(self){
    return dict_reversekeyiterator.$factory(self.dict)
}

make_view_comparison_methods(dict_keys)

$B.set_func_names(dict_keys, 'builtins')

var dict_keyiterator = $B.make_class('dict_keyiterator',
    function(make_iter){
        return {
            __class__: dict_keyiterator,
            iter: make_iter(),
            make_iter
        }
    }
)

dict_keyiterator.__iter__ = function(self){
    self[Symbol.iterator] = function(){return self.iter}
    return self
}

dict_keyiterator.__next__ = function(self){
    var res = self.iter.next()
    if(res.done){
        throw _b_.StopIteration.$factory('')
    }
    return res.value
}

dict_keyiterator.__reduce_ex__ = function(self, protocol){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([Array.from(self.make_iter())])])
}

$B.set_func_names(dict_keyiterator, 'builtins')

dict.keys = function(self){
    var $ = $B.args('keys', 1, {self: null}, ['self'], arguments,
                    {}, null, null)
    return dict_keys.$factory(self)
}

dict.pop = function(){

    var missing = {},
        $ = $B.args("pop", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: missing}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default

    try{
        var res = dict.__getitem__(self, key)
        dict.__delitem__(self, key)
        return res
    }catch(err){
        if(err.__class__ === _b_.KeyError){
            if(_default !== missing){return _default}
            throw err
        }
        throw err
    }
}

dict.popitem = function(self){
    $B.check_nb_args_no_kw('popitem', 1, arguments)
    var index = self._keys.length - 1
    while(index >= 0){
        if(self._keys[index] !== undefined){
            var res = $B.fast_tuple([self._keys[index], self._values[index]])
            delete self._keys[index]
            delete self._values[index]
            self.$version++
            return res
        }
        index--
    }
    throw _b_.KeyError.$factory("'popitem(): dictionary is empty'")
}

dict.setdefault = function(){
    var $ = $B.args("setdefault", 3, {self: null, key: null, _default: null},
            ["self", "key", "_default"], arguments, {_default: $N}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default
    _default = _default === undefined ? _b_.None : _default
    if(self.$all_str){
        if(! self.$strings.hasOwnProperty(key)){
            self.$strings[key] = _default
        }
        return self.$strings[key]
    }

    var lookup = dict.$lookup_by_key(self, key)
    if(lookup.found){
        return lookup.value
    }
    var hash = lookup.hash
    dict.$setitem(self, key, _default, hash, true)
    return _default
}

$B.nb_updates = 0
dict.update = function(self){
    $B.nb_updates++
    var $ = $B.args("update", 1, {"self": null}, ["self"], arguments,
            {}, "args", "kw"),
        self = $.self,
        args = $.args,
        kw = $.kw
    if(args.length > 0){
        var o = args[0]
        if(_b_.isinstance(o, dict)){
            if(o.$jsobj){
                o = jsobj2dict(o.$jsobj)
            }
            $copy_dict(self, o)
        }else if(_b_.hasattr(o, "keys")){
            var _keys = _b_.list.$factory($B.$call($B.$getattr(o, "keys"))())
            for(var i = 0, len = _keys.length; i < len; i++){
                var _value = $B.$getattr(o, "__getitem__")(_keys[i])
                dict.$setitem(self, _keys[i], _value)
            }
        }else{
            var it = _b_.iter(o),
                i = 0
            while(true){
                try{
                    var item = _b_.next(it)
                }catch(err){
                    if(err.__class__ === _b_.StopIteration){break}
                    throw err
                }
                try{
                    key_value = _b_.list.$factory(item)
                }catch(err){
                    throw _b_.TypeError.$factory("cannot convert dictionary" +
                        " update sequence element #" + i + " to a sequence")
                }
                if(key_value.length !== 2){
                    throw _b_.ValueError.$factory("dictionary update " +
                        "sequence element #" + i + " has length " +
                        key_value.length + "; 2 is required")
                }
                dict.$setitem(self, key_value[0], key_value[1])
                i++
            }
        }
    }
    $copy_dict(self, kw)
    return $N
}

var dict_values = $B.make_class("dict_values",
    function(d){
        return {
            __class__: dict_values,
            dict: d,
            make_iter: function(){return dict.$iter_values_check(d)}
        }
    }
)

dict_values.__iter__ = function(self){
    return dict_valueiterator.$factory(self.make_iter)
}

dict_values.__len__ = function(self){
    return dict.__len__(self.dict)
}

dict_values.__reduce__ = function(self){
    var items = Array.from(self.make_iter())
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
}

dict_values.__repr__ = function(self){
    var items = Array.from(self.make_iter())
    return 'dict_values(' + _b_.repr(items) + ')'
}

dict_reversevalueiterator = make_reverse_iterator(
    'dict_reversevalueiterator',
    dict.$iter_values_reversed)

dict_values.__reversed__ = function(self){
    return dict_reversevalueiterator.$factory(self.dict)
}

make_view_comparison_methods(dict_values)

$B.set_func_names(dict_values, 'builtins')

var dict_valueiterator = $B.make_class('dict_valueiterator',
    function(make_iter){
        return {
            __class__: dict_valueiterator,
            iter: make_iter(),
            make_iter
        }
    }
)

dict_valueiterator.__iter__ = function(self){
    self[Symbol.iterator] = function(){return self.iter}
    return self
}

dict_valueiterator.__next__ = function(self){
    var res = self.iter.next()
    if(res.done){
        throw _b_.StopIteration.$factory('')
    }
    return res.value
}

dict_valueiterator.__reduce_ex__ = function(self, protocol){
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([Array.from(self.make_iter())])])
}

$B.set_func_names(dict_valueiterator, 'builtins')


dict.values = function(self){
    var $ = $B.args('values', 1, {self: null}, ['self'], arguments,
                    {}, null, null)
    return dict_values.$factory(self)
}

dict.$literal = function(items){
    var res = $B.empty_dict()
    for(var item of items){
        dict.$setitem(res, item[0], item[1], item[2])
    }
    return res
}

dict.$factory = function(){
    var res = dict.__new__(dict)
    var args = [res]
    for(var arg of arguments){
        args.push(arg)
    }
    dict.__init__.apply(null, args)
    return res
}

_b_.dict = dict

$B.set_func_names(dict, "builtins")

dict.__class_getitem__ = _b_.classmethod.$factory(dict.__class_getitem__)

$B.empty_dict = function(){
    return {
        __class__: dict,
        table: Object.create(null),
        _keys: [],
        _values: [],
        _hashes: [],
        $strings: new $B.str_dict(),
        $version: 0,
        $order: 0,
        $all_str: true
    }
}

// This must be done after set_func_names, otherwise dict.fromkeys doesn't
// have the attribute $infos
dict.fromkeys = _b_.classmethod.$factory(dict.fromkeys)

// Class for attribute __dict__ of classes
var mappingproxy = $B.mappingproxy = $B.make_class("mappingproxy",
    function(obj){
        if(_b_.isinstance(obj, dict)){
            // obj is a dictionary, with string_dict table such that
            // obj.string_dict[key] = [value, rank]
            // Transform it into an object with attribute $jsobj such that
            // res.$jsobj[key] = value
            var res = $B.obj_dict(dict.$to_obj(obj))
        }else{
            var res = $B.obj_dict(obj)
        }
        res.__class__ = mappingproxy
        res.$version = 0
        return res
    }
)

mappingproxy.$match_mapping_pattern = true // for pattern matching (PEP 634)

mappingproxy.__repr__ = function(self){
    var d = $B.empty_dict()
    for(var key in self.$jsobj){
        dict.$setitem(d, key, self.$jsobj[key])
    }
    return dict.__repr__(d)
}

mappingproxy.__setitem__ = function(){
    throw _b_.TypeError.$factory("'mappingproxy' object does not support " +
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
                dict.$setitem(d, attr, $B.$JS2Py(x[attr]))
            }
        }
    }
    return d
}

$B.obj_dict = function(obj, exclude){
    var klass = obj.__class__ || $B.get_class(obj)
    if(klass !== undefined && klass.$native){
        throw $B.attr_error("__dict__", obj)
    }
    var res = {
        __class__: dict,
        $jsobj: obj,
        $exclude: exclude || function(){return false}
    }
    return res
}

// Wrapper around a JS object to handle it as a Python dictionary.
// Some keys of the original object can be ignored by passing
// the filtering function exclude().
// Supports adding new keys.

var jsobj_as_pydict = $B.jsobj_as_pydict = $B.make_class('jsobj_as_pydict',
    function(jsobj){
        return {
            __class__: jsobj_as_pydict,
            obj: jsobj || {},
            new_keys: [],
            $version: 0
        }
    }
)

jsobj_as_pydict.__contains__ = function(self, key){
    if(self.new_keys.indexOf(key) > -1){
        return true
    }
    return self.obj[key] !== undefined
}

jsobj_as_pydict.__delitem__ = function(self, key){
    jsobj_as_pydict.__getitem__(self, key) // raises KeyError if not present
    delete self.obj[key]
    var ix = self.new_keys.indexOf(key)
    if(ix > -1){
        self.new_keys.splice(ix, 1)
    }
}

jsobj_as_pydict.__eq__ = function(self, other){
    if(other.__class__ !== jsobj_as_pydict &&
            ! $B.$isinstance(other, _b_.dict)){
        return _b_.NotImplemented
    }

    // create true Python dicts with the items in self and other
    var self1 = $B.empty_dict()
        other1 = $B.empty_dict()

    dict.__init__(self1, jsobj_as_pydict.items(self))
    dict.__init__(other1, $B.get_class(other).items(other))

    // Compare true Python dicts
    return dict.__eq__(self1, other1)
}

jsobj_as_pydict.__ne__ = function(self, other){
    var eq = jsobj_as_pydict.__eq__(self, other)
    return eq === _b_.NotImplemented ? eq : ! eq
}

jsobj_as_pydict.__getitem__ = function(self, key){
    if(self.obj.hasOwnProperty(key)){
        return self.obj[key]
    }
    throw _b_.KeyError.$factory(key)
}

jsobj_as_pydict.__iter__ = function(self){
    return _b_.iter(jsobj_as_pydict.keys(self))
}

jsobj_as_pydict.__len__ = function(self){
    var len = 0
    for(var key in self.obj){
        len++
    }
    return len + self.new_keys.length
}

jsobj_as_pydict.__or__ = function(self, other){
    // PEP 584
    if(! _b_.isinstance(other, [dict, jsobj_as_pydict])){
        return _b_.NotImplemented
    }
    var res = jsobj_as_pydict.copy(self)
    jsobj_as_pydict.update(res, other)
    return res
}

jsobj_as_pydict.__repr__ = function(self){
    if($B.repr.enter(self)){
        return "{...}"
    }
    var res = [],
        items = _b_.list.$factory(jsobj_as_pydict.items(self))
    for(var item of items){
        res.push(_b_.repr(item[0]) + ": " + _b_.repr(item[1]))
    }
    $B.repr.leave(self)
    return "{" + res.join(", ") + "}"
}

jsobj_as_pydict.__setitem__ = function(self, key, value){
    self.obj[key] = value
}

jsobj_as_pydict.clear = function(self){
    self.obj = {}
    return _b_.None
}

jsobj_as_pydict.copy = function(self){
    var copy = jsobj_as_pydict.$factory()
    for(var key in self.obj){
        copy.obj[key] = self.obj[key]
    }
    return copy
}

jsobj_as_pydict.get = function(self, key, _default){
    _default = _default === undefined ? _b_.None : _default
    if(! self.obj.hasOwnProperty(key)){
        return _default
    }
    return self.obj[key]
}

jsobj_as_pydict.$iter_items = function*(self){
    for(var key in self.obj){
        yield $B.fast_tuple([key, self.obj[key]])
    }
}

jsobj_as_pydict.items = function(self){
    var items = Array.from(jsobj_as_pydict.$iter_items(self))
    return _b_.iter(items)
}

jsobj_as_pydict.keys = function(self){
    var items = Array.from(jsobj_as_pydict.$iter_items(self)),
        keys = items.map(x => x[0])
    return _b_.iter(keys)
}

jsobj_as_pydict.pop = function(){
    var missing = {},
        $ = $B.args("pop", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: missing}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default

    if(self.obj.hasOwnProperty(key)){
        var res = self.obj[key]
        delete self.obj[key]
        return res
    }else{
        if(_default !== missing){
            return _default
        }
        throw _b_.KeyError.$factory(key)
    }
}

jsobj_as_pydict.popitem = function(self){
    $B.check_nb_args_no_kw('popitem', 1, arguments)
    for(var key in self.obj){
        var res = $B.fast_tuple([key, self.obj[key]])
        delete self.obj[key]
        return res
    }
    throw _b_.KeyError.$factory("'popitem(): dictionary is empty'")
}


jsobj_as_pydict.update = function(self, other){
    var klass = $B.get_class(other),
        keys = $B.$call($B.$getattr(klass, 'keys')),
        getitem
    for(var key of $B.make_js_iterator(keys(other))){
        if(! getitem){
            getitem = $B.$call($B.$getattr(klass, '__getitem__'))
        }
        self.obj[key] = getitem(other, key)
    }
    return _b_.None
}

jsobj_as_pydict.values = function(self){
    var items = Array.from(jsobj_as_pydict.$iter_items(self)),
        values = items.map(x => x[1])
    return _b_.iter(values)
}

$B.set_func_names(jsobj_as_pydict, 'builtins')

})(__BRYTHON__)


