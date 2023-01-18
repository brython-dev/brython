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

$B.make_view = function(name){
    var klass = $B.make_class(name,
        function(d){
            return {
                __class__: klass,
                __dict__: $B.empty_dict(),
                dict: d,
                name
            }
        }
    )

    klass.iterator = $B.make_class(`${name}iterator`,
        function(it){
            return {
                __class__: klass.iterator,
                __dict__: $B.empty_dict(),
                it
            }
        }
    )

    klass.iterator.__iter__ = function(self){
        return self
    }

    klass.iterator.__next__ = function(self){
        var res = self.it.next()
        if(res.done){
            throw _b_.StopIteration.$factory()
        }
        return res.value
    }

    klass.iterator.__reduce__ = function(self){
        var items = Array.from(self.it)
        return $B.fast_tuple([_b_.iter, $B.fast_tuple([items])])
    }

    $B.set_func_names(klass.iterator, 'builtins')

    for(var i = 0, len = set_ops.length; i < len; i++){
        var op = "__" + set_ops[i] + "__"
        klass[op] = (function(op){
            return function(self, other){
                // compare set of items to other
                if(self.name == 'dict_keys' ||
                        (self.name == 'dict_items' && dict.$set_like(self.dict))){
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

    klass.__iter__ = function(self){
        // returns an instance of dict_keyiterator for keys, etc.
        if(self.dict.$jsobj){
            var iterator = function*(self){
                for(var key in self.dict.$jsobj){
                    if(key.startsWith('$')){
                        continue
                    }
                    var value = self.dict.$jsobj[key]
                    if(self.name == 'dict_items'){
                        yield $B.fast_tuple([key, value])
                    }else if(self.name == 'dict_keys'){
                        yield key
                    }else if(self.name == 'dict_values'){
                        yield value
                    }
                }
            }
        }else{
            var iterator = function*(self){
                var version = self.dict.$version,
                    keys_length = self.dict._keys.length,
                    len = dict.__len__(self.dict)
                while(true){
                    iterator.counter++
                    if(iterator.counter >= keys_length){
                        break
                    }
                    var key = self.dict._keys[iterator.counter]
                    if(key !== undefined){
                        var value = self.dict._values[iterator.counter]
                        if(self.name == 'dict_items'){
                            yield $B.fast_tuple([key, value])
                        }else if(self.name == 'dict_keys'){
                            yield key
                        }else if(self.name == 'dict_values'){
                            yield value
                        }
                        if(self.dict.$version != version){
                            throw _b_.RuntimeError.$factory("dictionary keys changed during iteration")
                        }else if(dict.__len__(self.dict) !== len){
                            throw _b_.RuntimeError.$factory("dictionary size changed during iteration")
                        }
                    }
                }
            }
            iterator.counter = -1
        }
        var res = iterator(self)
        return klass.iterator.$factory(res)
    }

    klass.__len__ = function(self){
        return dict.__len__(self.dict)
    }

    klass.__repr__ = function(self){
        var items = Array.from(dict.$iter_items(self.dict))
        if(klass.__name__ == "dict_keys"){
            items = items.map(x => x[0])
        }else if(klass.__name__ == "dict_values"){
            items = items.map(x => x[1])
        }
        return klass.__name__ + '(' + _b_.repr(items) + ')'
    }

    klass.__reversed__ = function(self){
        var it = klass.$iterator.$factory(self.items.reverse())
        it.test_change = function(){
            if(dict.__len__(self.dict) != self.len){
                return "dictionary changed size during iteration"
            }
            return false
        }
        return it
    }

    klass.mapping = {
        __get__: function(self){
            return new Proxy(self.dict, mappingproxy_handler)
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}

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
    $is_class: true,
    $native: true,
    $match_mapping_pattern: true // for pattern matching (PEP 634)
}

dict.$to_obj = function(d){
    // Function applied to dictionary that only has string keys,
    // return a Javascript objects with the keys mapped to the value,
    // excluding the insertion rank
    var res = {}
    for(var item of dict.$iter_items(d)){
        res[item[0]] = item[1]
    }
    return res
}

dict.$fast_iter_keys = function*(d){
    for(var item of dict.$iter_items(d)){
        yield item[0]
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

dict.$iter_items = function*(d){
    for(var i = 0, len = d._keys.length; i < len; i++){
        if(d._keys[i] !== undefined){
            yield [d._keys[i], d._values[i]]
        }
    }
}

var $copy_dict = function(left, right){
    // left and right are dicts
    right.$version = right.$version || 0
    var right_version = right.$version
    for(var item of dict.$iter_items(right)){
        dict.$setitem(left, item[0], item[1])
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

dict.__contains__ = function(){
    var $ = $B.args("__contains__", 2, {self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key

    if(self.$jsobj){
        return self.$jsobj[key] !== undefined
    }

    var indices = self.table[_b_.hash(key)]
    if(indices !== undefined){
        for(var index of indices){
            if($B.is_or_equals(key, self._keys[index])){
                return true
            }
        }
    }
    return false
}

dict.__delitem__ = function(){

    var $ = $B.args("__eq__", 2, {self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key

    if(self.$jsobj){
        if(self.$jsobj[key] === undefined){
            throw _b_.KeyError.$factory(key)
        }
        delete self.$jsobj[key]
        return $N
    }

    var h = _b_.hash(key),
        indices = self.table[h]
    if(indices !== undefined){
        for(var i = 0, len = indices.length; i < len; i++){
            var index = indices[i]
            if($B.is_or_equals(key, self._keys[index])){
                self.table[h].splice(i, 1)
                if(self.table[h].length == 0){
                    delete self.table[h]
                }
                delete self._values[index]
                delete self._keys[index]
                self.$version++
                return _b_.None
            }
        }
    }

    throw _b_.KeyError.$factory(_b_.str.$factory(key))
}

dict.__eq__ = function(){
    var $ = $B.args("__eq__", 2, {self: null, other: null},
        ["self", "other"], arguments, {}, null, null),
        self = $.self,
        other = $.other

    if(! _b_.isinstance(other, dict)){
        return _b_.NotImplemented
    }

    if(self.$jsobj){
        self = jsobj2dict(self.$jsobj)
    }
    if(other.$jsobj){
        other = jsobj2dict(other.$jsobj)
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
    return self.table[_b_.hash(key)] !== undefined
}

dict.$delete_string = function(self, key){
    // Used for dicts where all keys are strings
    delete self.table[_b_.hash(key)]
}

dict.$get_string = function(self, key){
    // Used for dicts where all keys are strings
    var indices = self.table[_b_.hash(key)]
    if(indices !== undefined){
        return self._values[indices[0]]
    }
}

dict.$getitem_string = function(self, key){
    // Used for dicts where all keys are strings
    var indices = self.table[_b_.hash(key)]
    if(indices !== undefined){
        return self._values[indices[0]]
    }
    throw _b_.KeyError.$factory(key)
}

dict.$keys_string = function(self){
    // return the list of keys in a dict where are keys are strings
    return self._keys.filter((x) => x !== undefined)
}

dict.$setitem_string = function(self, key, value){
    // Used for dicts where all keys are strings
    var h = _b_.hash(key),
        indices = self.table[h]
    if(indices !== undefined){
        self._values[indices[0]] = value
    }else{
        var index = self._keys.length
        self.table[h] = [index]
        self._keys.push(key)
        self._values.push(value)
        self.$version++
    }
    return _b_.None
}

dict.$getitem = function(self, key, ignore_missing){
    // ignore_missing is set in dict.get and dict.setdefault
    if(self.$jsobj){
        if(self.$exclude && self.$exclude(key)){
            throw _b_.KeyError.$factory(key)
        }
        if(self.$jsobj[key] === undefined){
            if(self.$jsobj.hasOwnProperty &&
                    self.$jsobj.hasOwnProperty(key)){
                return $B.Undefined
            }
            throw _b_.KeyError.$factory(key)
        }
        return self.$jsobj[key]
    }

    var index,
        hash = _b_.hash(key)

    if(self.table[hash] !== undefined){
        for(var index of self.table[hash]){
            if($B.is_or_equals(key, self._keys[index])){
                return self._values[index]
            }
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
                `update sequence element #${i} has length 1; 2 is required`)
        }
        dict.$setitem(self, item[0], item[1])
    }
}

dict.__init__ = function(self, first, second){
    if(first === undefined){
        return _b_.None
    }
    if(second === undefined){
        if(first.$nat != 'kw' && $B.get_class(first) === $B.JSObj){
            for(var key in first){
                dict.$setitem(self, key, first[key])
            }
            return _b_.None
        }else if(first.$jsobj){
            self.$jsobj = {}
            for(var attr in first.$jsobj){
                self.$jsobj[attr] = first.$jsobj[attr]
            }
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
            for(var item of dict.$iter_items(args)){
                dict.$setitem(self, item[0], item[1])
            }
        }else if(_b_.isinstance(args, dict)){
            $copy_dict(self, args)
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

    for(var item of dict.$iter_items($.second)){
        dict.$setitem(self, item[0], item[1])
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
    for(var item of dict.$iter_items(self)){
        key = item[0]
        value = item[1]
        res.push(_b_.repr(key) + ": " + _b_.repr(value))
    }
    $B.repr.leave(self)
    return "{" + res.join(", ") + "}"
}

var dict_reversekeyiterator = $B.make_class("dict_reversekeyiterator",
    function(keys){
        return {
            __class__: dict_reversekeyiterator,
            keys,
            counter: -1,
            length: keys.length
        }
    }
)

dict_reversekeyiterator.__iter__ = function(self){
    return self
}

dict_reversekeyiterator.__next__ = function(self){
    self.counter++
    if(self.counter >= self.length){
        throw _b_.StopIteration.$factory('StopIteration')
    }
    return self._keys[self.counter]
}

dict_reversekeyiterator.__reduce_ex__ = function(self, protocol){
    return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self._keys])])
}
$B.set_func_names(dict_reversekeyiterator, "builtins")

dict.__reversed__ = function(self){
    var keys = _b_.list.$factory(dict._keys(self))
    keys.reverse()
    return dict_reversekeyiterator.$factory(keys)
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

function add_key_value(self, obj, key, value){
    obj[key] = self._keys.length
    self._keys.push(key)
    self._values.push(value)
}

dict.$setitem = function(self, key, value, $hash){
    // Set a dictionary item mapping key and value.
    //
    // Parameter $hash is only set if this method is called by setdefault.
    // In this case the hash of key has already been computed and we
    // know that the key is not present in the dictionary, so it's no
    // use computing hash(key) again, nor testing equality of keys
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
    }
    if(key instanceof String){
        key = key.valueOf()
    }

    var hash = $hash === undefined ? _b_.hash(key) : $hash,
        _eq = function(other){return $B.rich_comp("__eq__", key, other)},
        index

    if(self.table[hash] === undefined){
        index = self._keys.length
        self.table[hash] = [index]
        self._keys.push(key)
        self._values.push(value)
    }else{
        for(var index of self.table[hash]){
            if($B.is_or_equals(key, self._keys[index])){
                self._values[index] = value
                return _b_.None
            }
        }
        index = self._keys.length
        self.table[hash].push(index)
        self._keys.push(key)
        self._values.push(value)
        self.$version++
    }
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
    $copy_dict(res, self)
    return res
}

dict.fromkeys = function(){

    var $ = $B.args("fromkeys", 3, {cls: null, keys: null, value: null},
        ["cls", "keys", "value"], arguments, {value: _b_.None}, null, null),
        keys = $.keys,
        value = $.value

    // class method
    var klass = $.cls,
        res = $B.$call(klass)(),
        keys_iter = $B.$iter(keys),
        setitem = klass === dict ? dict.$setitem : $B.$getattr(res, '__setitem__')

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
        if(_b_.isinstance(err, _b_.KeyError)){return $._default}
        else{throw err}
    }
}

var dict_items = $B.make_view("dict_items", true)
dict_items.$iterator = $B.make_iterator_class("dict_itemiterator")

dict.items = function(self){
    var $ = $B.args('items', 1, {self: null}, ['self'], arguments,
                    {}, null, null)
    return dict_items.$factory(self)
}


var dict_keys = $B.make_view("dict_keys")
dict_keys.$iterator = $B.make_iterator_class("dict_keyiterator")

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
    if(! self.$ordered_items){
        self.$ordered_items = to_list(self)
    }
    if(self.$ordered_items.length > 0){
        var itm = self.$ordered_items.pop()
        dict.__delitem__(self, itm[0])
        return _b_.tuple.$factory(itm)
    }
    throw _b_.KeyError.$factory("'popitem(): dictionary is empty'")
}

dict.setdefault = function(){

    var $ = $B.args("setdefault", 3, {self: null, key: null, _default: null},
            ["self", "key", "_default"], arguments, {_default: $N}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default
    try{
        // Pass 3rd argument to dict.$getitem to avoid using __missing__
        // Cf. issue #1598
        return dict.$getitem(self, key, true)
    }catch(err){
        if(err.__class__ !== _b_.KeyError){
            throw err
        }
        if(_default === undefined){_default = $N}
        var hash = key.$hash
        key.$hash = undefined
        dict.$setitem(self, key, _default, hash)
        return _default
    }
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

var dict_values = $B.make_view("dict_values")

dict.values = function(self){
    var $ = $B.args('values', 1, {self: null}, ['self'], arguments,
                    {}, null, null)
    return dict_values.$factory(self)
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
        $version: 0,
        $order: 0
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
    var res = $B.empty_dict()
    res.$jsobj = obj
    res.$exclude = exclude || function(){return false}
    return res
}

// Wrapper around a JS object to handle it as a Python dictionary.
// Some keys of the original object can be ignored by passing
// the filtering function exclude().
// Supports adding new keys.

var jsobj_as_pydict = $B.jsobj_as_pydict = $B.make_class('jsobj_as_pydict',
    function(jsobj, exclude){
        return {
            __class__: jsobj_as_pydict,
            obj: jsobj,
            exclude: exclude ? exclude : function(){return false},
            new_keys: [],
            $version: 0
        }
    }
)

jsobj_as_pydict.__contains__ = function(self, key){
    if(self.new_keys.indexOf(key) > -1){
        return true
    }
    return ! (self.exclude(key) || self.obj[key] === undefined)
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
    if(other.__class__ !== jsobj_as_pydict){
        return _b_.NotImplemented
    }
    // create true Python dicts with the items in self and other
    var self1 = $B.empty_dict()
        other1 = $B.empty_dict()

    dict.__init__(self1, jsobj_as_pydict.items(self))
    dict.__init__(other1, jsobj_as_pydict.items(other))

    // Compare true Python dicts
    return dict.__eq__(self1, other1)
}

jsobj_as_pydict.__getitem__ = function(self, key){
    if(jsobj_as_pydict.__contains__(self, key)){
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
        if(! self.exclude(key)){
            len++
        }
    }
    return len + self.new_keys.length
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
    if(self.exclude(key) && self.new_keys.indexOf(key) == -1){
        self.new_keys.push(key)
    }
    self.obj[key] = value
}

jsobj_as_pydict.get = function(self, key, _default){
    _default = _default === undefined ? _b_.None : _default
    if(self.exclude(key) || self.obj[key] === undefined){
        return _default
    }
    return self.obj[key]
}

jsobj_as_pydict.$iter_items = function*(self){
    for(var key in self.obj){
        if(self.exclude(key) && self.new_keys.indexOf(key) == -1){
            continue
        }
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

jsobj_as_pydict.values = function(self){
    var items = Array.from(jsobj_as_pydict.$iter_items(self)),
        values = items.map(x => x[1])
    return _b_.iter(values)
}

$B.set_func_names(jsobj_as_pydict, 'builtins')

})(__BRYTHON__)


