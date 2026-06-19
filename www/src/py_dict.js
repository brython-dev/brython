"use strict";
(function($B) {

/*
Implementation of Python dictionaries

We can't use Javascript's Map here, because the behaviour is not exactly the
same (eg with keys that are instances of classes with a __hash__ method...)
and because Map is much slower than regular Javascript objects.

A Python dictionary is implemented as a Javascript objects with these
attributes:
. $strings: a JS object mapping string keys to values, used for string keys
. VERSION: an integer with an initial value of 0, incremented at each
  insertion
. KEYS: list of the keys
. VALUES: list of the values
. HASHES: list of the key hashes
. TABLE: a JS object with keys = hash of entries, value = list of indices in
  KEYS and VALUES

Lookup by keys:
- if the key is a string, use $strings[key]
- otherwise:
    - compute hash(key)
    - if dict[TABLE][hash] exists, it is a list of indices
    - for each index, if dict[KEYS][index] == key, return dict[VALUES][index]

*/

var _b_ = $B.builtins

const VERSION = Symbol('VERSION')
const KEYS = Symbol('KEYS')
const VALUES = Symbol('VALUES')
const HASHES = Symbol('HASHES')
const TABLE = Symbol('TABLE')
const SIZE = Symbol('SIZE')

$B.dict_proxy = function(dict) {
    // Given a dictionary dict, returns an object obj such that obj.x = y is
    // the same as dict[x] = y
    // Used for the namespace of user-defined classes
    if ($B.exact_type(dict, _b_.dict)) {
        // most usual case
        return dict
    }
    var getitem = $B.type_getattribute($B.get_class(dict), '__getitem__')
    var setitem = $B.type_getattribute($B.get_class(dict), '__setitem__')
    return new Proxy(dict,
        {
            get(target, prop){
                return $B.$call(getitem, target, prop)
            },
            set(target, prop, value){
                return $B.$call(setitem, target, prop, value)
            }
        }
    )
}

$B.assign_dict = function(pyobj, jsobj) {
    // assign the keys / values in jsobj to the pyobj dict
    if (! $B.get_dict(pyobj)) {
        $B.init_dict(pyobj)
    }
    Object.assign($B.get_dict(pyobj), jsobj)
}

function PyDictViewSet_Check(op) {
    return $B.$isinstance(op, [$B.dict_keys, $B.dict_items])
}

function _PyDictView_Intersect(self, other) {
    var dict_contains

    /* Python interpreter swaps parameters when dict view
       is on right side of & */
    if (! PyDictViewSet_Check(self)) {
        [self, other] = [other, self]
    }

    var len_self = dictview_len(self)

    /* if other is a set and self is smaller than other,
       reuse set intersection logic */
    if ($B.exact_type(other, _b_.set) && len_self <= _b_.len(other)) {
        return $B.$call($B.$getattr(other, 'intersection'), self)
    }

    /* if other is another dict view, and it is bigger than self,
       swap them */
    if (PyDictViewSet_Check(other)) {
        var len_other = dictview_len(other)
        if (len_other > len_self) {
            [self, other] = [other, self]
        }
    }

    /* at this point, two things should be true
       1. self is a dictview
       2. if other is a dictview then it is smaller than self */
    var result = _b_.set.tp_new(set, [], $B.empty_dict())
    var it = $B.make_js_iterator(other)

    if ($B.$isinstance(self, $B.dict_keys)) {
        dict_contains = $B.dict_keys.sq_contains
    } else {
        dict_contains = dictitems_contains
    }

    while (true) {
        var item = it.next()
        if (item.done) {
            break
        }
        var key = item.value
        var rv = dict_contains(self, key)
        if (rv) {
            $B.set_add(result, key)
        }
    }
    return result
}

function all_contained_in(self, other) {
    var iter = $B.make_js_iterator(self)
    var contains = $B.$getattr(other, '__contains__')
    var ok = true
    while (true) {
        var next = iter.next()
        if (next.done) {
            break
        }
        ok = $B.$call(contains, next.value)
        if (! ok) {
            break
        }
    }
    return ok
}

function dictview_len(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

function dictview_richcompare(self, other, op) {
    if (! $B.$isinstance(other, [_b_.set, _b_.frozenset, $B.dict_keys])) {
        return _b_.NotImplemented
    }
    var len_self = $B.get_class(self).mp_length(self)
    var len_other = _b_.len(other)

    var ok = false
    switch (op) {
        case '__eq__':
        case '__ne__':
            if (len_self == len_other) {
                ok = all_contained_in(self, other)
            }
            if (op == '__ne__') {
                ok = ! ok
            }
            break
        case '__lt__':
            if (len_self < len_other) {
                ok = all_contained_in(self, other)
            }
            break
        case '__le__':
            if (len_self <= len_other) {
                ok = all_contained_in(self, other)
            }
            break
        case '__gt__':
            if (len_self > len_other) {
                ok = all_contained_in(other, self)
            }
            break
        case '__ge__':
            if (len_self >= len_other) {
                ok = all_contained_in(other, self)
            }
            break
    }
    return ok
}

function dictviews_or(self, other) {
    var result = $B.$call(_b_.set, self)
    _b_.set.tp_funcs.update(result, other)
    return result
}

function dictviews_sub(self, other) {
    var result = $B.$call(_b_.set, self)
    var method = $B.$getattr(result, 'difference_update')
    $B.$call(method, other)
    return result
}

function dictviews_xor(self, other) {
    if($B.$isinstance(self, $B.dict_items) &&
            $B.$isinstance(other, $B.dict_items)){
        return dictitems_xor(self, other)
    }
    var result = $B.$call(_b_.set, self)
    $B.$call($B.$getattr(result, 'symmetric_difference_update'), other)
    return result
}

var set_ops = ["eq", "le", "lt", "ge", "gt",
    "sub", "rsub", "and", "rand", "or", "ror", "xor", "rxor"]

// methods to compare non set-like views
function is_sublist(t1, t2) {
    // Return true if all elements of t1 are in t2
    for (var i = 0, ilen = t1.length; i < ilen; i++) {
        var x = t1[i],
            flag = false
        for (var j = 0, jlen = t2.length; j < jlen; j++) {
            if ($B.rich_comp("__eq__", x, t2[j])) {
                t2.splice(j, 1)
                flag = true
                break
            }
        }
        if (! flag) {
            return false
        }
    }
    return true
}

const dict_view_op = {
    __eq__: function(t1, t2) {
        return t1.length == t2.length && is_sublist(t1, t2)
    },
    __ne__: function(t1, t2) {
        return ! dict_view_op.__eq__(t1, t2)
    },
    __lt__: function(t1, t2) {
        return t1.length < t2.length && is_sublist(t1, t2)
    },
    __gt__: function(t1, t2) {
        return dict_view_op.__lt__(t2, t1)
    },
    __le__: function(t1, t2) {
        return t1.length <= t2.length && is_sublist(t1, t2)
    },
    __ge__: function(t1, t2) {
        return dict_view_op.__le__(t2, t1)
    },
    __and__: function(t1, t2) {
        var items = []
        for (var i = 0, ilen = t1.length; i < ilen; i++) {
            var x = t1[i]
            for (var j = 0, jlen = t2.length; j < jlen; j++) {
                if ($B.rich_comp("__eq__", x, t2[j])) {
                    t2.splice(j, 1)
                    items.push(x)
                    break
                }
            }
        }
        return $B.$list(items)
    },
    __or__: function(t1, t2) {
        var items = t1
        for (var j = 0, jlen = t2.length; j < jlen; j++) {
            var y = t2[j],
                flag = false
            for (var i = 0, ilen = t1.length; i < ilen; i++) {
                if ($B.rich_comp("__eq__", y, t1[i])) {
                    t2.splice(j, 1)
                    flag = true
                    break
                }
            }
            if (! flag) {
                items.push(y)
            }
        }
        return items
    }

}

var dict = _b_.dict

dict.$match_mapping_pattern = true // for pattern matching (PEP 634)

$B.str_dict_contains = function(d, key) {
    return d.hasOwnProperty(key)
}

$B.str_dict_get = function(d, key, _default) {
    if (d.hasOwnProperty(key)) {
        return d[key]
    }
    return _default === undefined ? $B.NULL : _default
}

$B.str_dict_set = function(d, attr, value) {
    d[attr] = value
}

$B.str_dict_del = function(d, attr) {
    delete d[attr]
}

$B.str_dict_pop = function(d, attr) {
    if (! d.hasOwnProperty(attr)) {
        return $B.NULL
    }
    delete d[attr]
}

$B.str_dict_empty = function(d) {
    return Object.keys(d).length == 0
}

$B.str_dict_length = function(d) {
    return Object.keys(d).length
}

$B.items_iterator = function(d) {
    // returns a JS array of [key, value] pairs
    var res = []
    if (self[KEYS]) {
        for (var i = 0, len = self[KEYS].length; i < len; i++) {
            res.push([self[KEYS][i], self[VALUES[i]]])
        }
    }
}

$B.hasOnlyStringKeys = function(d) {
    return ! d[KEYS]
}

$B.dict2kwarg = function(d) {
    // create an internal kw argument from dictionary d
    var kw = dict.$to_obj(d)
    return {$kw: [kw]}
}

$B.dict_from_jsobj = function(obj) {
    var d = $B.empty_dict()
    for (var key in obj) {
        $B.str_dict_set(d, key, obj[key])
    }
    return d
}

$B.dict_as_jsobj = function(d) {
    return d
}

dict.$to_obj = function(d) {
    // Function applied to dictionary that only has string keys,
    // return a Javascript object with the keys mapped to the value,
    // excluding the insertion rank
    var res = {}
    for (var entry of dict.$iter_items(d)) {
        res[entry.key] = entry.value
    }
    return res
}

dict.$iter_items = function*(d){
    var version = d[VERSION]
    if (! d[KEYS]) {
        for (let key in d) {
            yield {key, value: d[key]}
            if (d[VERSION] !== version) {
                $B.RAISE(_b_.RuntimeError,
                    'dictionary changed size during iteration 1')
            }
        }
        return
    }
    for (var i = 0, len = d[KEYS].length; i < len; i++) {
        if (d[KEYS][i] !== undefined) {
            yield {key: d[KEYS][i], value: d[VALUES][i], hash: d[HASHES][i]}
            if (d[VERSION] !== version) {
                $B.RAISE(_b_.RuntimeError,
                    'dictionary changed size during iteration 2')
            }
        }
    }
}

var $copy_dict = function(left, right) {
    // left and right are dicts
    right[VERSION] = right[VERSION] || 0
    var right_version = right[VERSION]
    if (! right[KEYS]) {
        if (! left[KEYS]) {
            for (let key in right) {
                left[key] = right[key]
                if (left[$B.JSOBJ]) {
                    left[$B.JSOBJ][key] = right[key]
                }
            }
        } else {
            for (let key in right) {
                dict.$setitem(left, key, right[key])
            }
        }
    } else {
        for (var entry of dict.$iter_items(right)) {
            dict.$setitem(left, entry.key, entry.value, entry.hash)
            if (right[VERSION] != right_version) {
                $B.RAISE(_b_.RuntimeError, "dict mutated during update")
            }
        }
    }
}

function index_by_key(d, key, hash) {
    // only used for dictionaries with a TABLE
    hash = hash ?? _b_.hash(key)
    var indices = d[TABLE][hash],
        index
    if (indices !== undefined) {
        for (var index of indices) {
            var v = d[KEYS][index]
            if (v === undefined) {
                d[TABLE][hash].splice(i, 1)
                if (d[TABLE][hash].length == 0) {
                    delete d[TABLE][hash]
                    return null
                }
                continue
            }
            if (v === key || $B.is_or_equals(v, key)) {
                return index
            }
        }
    }
    return null
}

dict.$lookup_by_key = function(d, key, hash) {
    hash = hash === undefined ? _b_.hash(key) : hash
    var indices = d[TABLE][hash],
        index
    if (indices !== undefined) {
        for (var i = 0, len = indices.length; i < len; i++) {
            index = indices[i]
            if (d[KEYS][index] === undefined) {
                d[TABLE][hash].splice(i, 1)
                if (d[TABLE][hash].length == 0) {
                    delete d[TABLE][hash]
                    return {
                        found: false,
                        hash
                    }
                }
                continue
            }
            if ($B.is_or_equals(d[KEYS][index], key)) {
                return {
                    found: true,
                    key: d[KEYS][index],
                    value: d[VALUES][index],
                    hash,
                    rank: i,
                    index
                }
            }
        }
    }
    return {
        found: false,
        hash
    }
}

dict.$contains = function(self, key, hash) {
    if (! self[KEYS]) {
        if (typeof key == 'string') {
            return self.hasOwnProperty(key)
        }
        var hash_method = $B.$getattr($B.get_class(key), '__hash__')
        if (hash_method === $B.str_dict_get($B.get_dict(_b_.object), '__hash__')) {
            return false
        }
        var hash = $B.$call(hash_method, key)
        // If the object has a specific __hash__ method and a specific __eq__
        // method, `hash` could be the same as one of the string keys's hash,
        // and the __eq__ method might return true. To cover this case we have
        // to build TABLE, KEYS and VALUES and apply index_by_key to
        // determine if "key in dict" is True
        convert_all_str(self)
    }

    return index_by_key(self, key, hash) !== null
}

dict.$delitem  = function(self, key) {
    if (self[$B.JSOBJ]) {
        delete self[$B.JSOBJ][key]
    }
    if (! self[KEYS]) {
        if (typeof key == 'string') {
            if (self.hasOwnProperty(key)) {
                delete self[key]
                return _b_.None
            } else {
                $B.RAISE(_b_.KeyError, key)
            }
        }
        if (! dict.$contains(self, key)) {
            $B.RAISE(_b_.KeyError, _b_.str.$factory(key))
        }
    }

    var lookup = dict.$lookup_by_key(self, key)
    if (lookup.found) {
        self[TABLE][lookup.hash].splice(lookup.rank, 1)
        if (self[TABLE][lookup.hash].length == 0) {
            delete self[TABLE][lookup.hash]
        }
        delete self[VALUES][lookup.index]
        delete self[KEYS][lookup.index]
        delete self[HASHES][lookup.index]
        self[VERSION]++
        return _b_.None
    }
    $B.RAISE(_b_.KeyError, _b_.str.$factory(key))
}

$B.dict_delitem = dict.$delitem

function dict_eq(self, other) {
    if (! $B.$isinstance(other, dict)) {
        return _b_.NotImplemented
    }

    if (! self[KEYS] && ! other[KEYS]) {
        if (dict.mp_length(self) !== dict.mp_length(other)) {
            return false
        }
        for (let k in self) {
            if (! other.hasOwnProperty(k)) {
                return false
            }
            if (! $B.is_or_equals(self[k], other[k])) {
                return false
            }
        }
        return true
    }

    if (! self[KEYS]) {
        let d = dict.tp_funcs.copy(self)
        convert_all_str(d)
        return dict_eq(d, other)
    }
    if (! other[KEYS]) {
        let d = dict.tp_funcs.copy(other)
        convert_all_str(d)
        return dict_eq(self, d)
    }

    if (dict.mp_length(self) != dict.mp_length(other)) {
        return false
    }

    for (var hash in self[TABLE]) {
        var self_pairs = []
        for (let index of self[TABLE][hash]) {
            self_pairs.push([self[KEYS][index], self[VALUES][index]])
        }
        // Get all (key, value) pairs in other that have the same hash
        var other_pairs = []
        if (other[TABLE][hash] !== undefined) {
            for (let index of other[TABLE][hash]) {
                other_pairs.push([other[KEYS][index], other[VALUES][index]])
            }
        }

        for (let self_pair of self_pairs) {
            let flag = false,
                key = self_pair[0],
                value = self_pair[1]
            for (let other_pair of other_pairs) {
                if($B.is_or_equals(key, other_pair[0]) &&
                        $B.is_or_equals(value, other_pair[1])){
                    flag = true
                    break
                }
            }
            if (! flag) {
                return false
            }
        }
    }
    return true
}

function dict_init(self, args, kw) {
    if(args === undefined){
        console.log('args undef')
        console.log(Error('trace').stack)
    }
    if (args.length > 1) {
        $B.RAISE(_b_.TypeError, "dict expected at most 1 argument" +
            `, got ${args.length}`)
    } else if (args.length == 1) {
        args = args[0]
        if ($B.exact_type(args, dict)) {
            for (let entry of dict.$iter_items(args)) {
                dict.$setitem(self, entry.key, entry.value, entry.hash)
            }
        } else {
            var keys = $B.$getattr($B.get_class(args), "keys", $B.NULL)
            if (keys !== $B.NULL) {
                var gi = $B.$getattr($B.get_class(args), "__getitem__", $B.NULL)
                if (gi !== $B.NULL) {
                    // has keys and __getitem__ : it's a mapping, iterate on
                    // keys and values
                    for (var key of $B.make_js_iterator($B.$call(keys, args))) {
                        try {
                            let value = $B.$call(gi, args, key)
                            dict.$setitem(self, key, value)
                        } catch (err) {
                            if ($B.is_exc(err, _b_.StopIteration)) {
                                break
                            }
                            throw err
                        }
                    }
                }
            } else {
                let i = 0
                for (var item of $B.make_js_iterator(args)) {
                    if (item.length != 2) {
                        $B.RAISE(_b_.ValueError, "dictionary " +
                            `update sequence element #${i} has length ` +
                            `${item.length}; 2 is required`)
                    }
                    dict.$setitem(self, item[0], item[1])
                    i++
                }
            }
        }
    }

    for (let item of _b_.dict.$iter_items(kw)) {
        dict.$setitem(self, item.key, item.value)
    }
    return _b_.None
}

function dict_repr(self) {
    if ($B.repr.enter(self)) {
        return "{...}"
    }
    let res = []
    for (let entry of dict.$iter_items(self)) {
        res.push(_b_.repr(entry.key) + ": " + _b_.repr(entry.value))
    }
    $B.repr.leave(self)
    return "{" + res.join(", ") + "}"
}

dict.$delete_string = function(self, key) {
    // Used for dicts where all keys are strings
    if (! self[KEYS]) {
        var ix = self[key]
        if (ix !== undefined) {
            delete self[key]
        }
    }

    if (self[TABLE]) {
        delete self[TABLE][_b_.hash(key)]
    }
}

dict.$getitem = function(self, key, ignore_missing) {
    // ignore_missing is set in dict.get and dict.setdefault
    if (Object.hasOwn(self, $B.JSOBJ)) {
        if (Object.hasOwn(self[$B.JSOBJ], key)) {
            return $B.jsobj2pyobj(self[$B.JSOBJ][key])
        }
        $B.RAISE(_b_.KeyError, key)
    }
    if (typeof key == 'string') {
        if (self.hasOwnProperty(key)) {
            return self[key]
        }
    } else {
        if (! self[TABLE]) {
            var hash_method = $B.$getattr($B.get_class(key), '__hash__')
            if (hash_method !== $B.str_dict_get($B.get_dict(_b_.object), '__hash__')) {
                convert_all_str(self)
                let index = index_by_key(self, key)
                if (index !== null) {
                    return self[VALUES][index]
                }
            }
        } else {
            let index = index_by_key(self, key)
            if (index !== null) {
                return self[VALUES][index]
            }
        }
    }
    if (! ignore_missing) {
        var klass = $B.get_class(self)
        if (klass !== dict && ! ignore_missing) {
            try {
                var missing_method = $B.$getattr(klass,
                    "__missing__", _b_.None)
            } catch (err) {
                console.log(err)

            }
            if (missing_method !== _b_.None) {
                return missing_method(self, key)
            }
        }
    }
    $B.RAISE(_b_.KeyError, key)
}

dict.tp_hash = _b_.None

function init_from_list(self, args) {
    var i = 0
    for (var item of args) {
        if (item.length != 2) {
            $B.RAISE(_b_.ValueError, "dictionary " +
                `update sequence element #${i} has length ${item.length}; 2 is required`)
        }
        dict.$setitem(self, item[0], item[1])
        i++
    }
}

dict.$set_string_no_duplicate = function(d, keys, string, value) {
    if (typeof string !== 'string') {
        $B.RAISE(_b_.TypeError,
            'keywords must be strings')
    }
    if (keys.has(string)) {
        $B.RAISE(_b_.TypeError, 'dict() got multiple values for keyword ' +
            `argument '${string}'`)
    }
    d[string] = value
    keys.add(string)
}

function add_mapping(d, obj) {
    for (var entry of _b_.dict.$iter_items(obj)) {
        dict.$setitem(d, entry.key, entry.value, entry.hash)
    }
}

function add_iterable(d, js_iterable) {
    var i = 0
    for (var entry of js_iterable) {
        var items = Array.from($B.make_js_iterator(entry))
        if (items.length !== 2) {
            $B.RAISE(_b_.ValueError, "dictionary " +
                `update sequence element #${i} has length ${items.length}; 2 is required`)
        }
        dict.$setitem(d, items[0], items[1])
        i++
    }
}

dict.$iter_items_reversed = function*(d){
    var version = d[VERSION]
    if (! d[TABLE]) {
        for (var item of Object.entries(d).reverse()) {
            yield $B.fast_tuple(item)
            if (d[VERSION] !== version) {
                $B.RAISE(_b_.RuntimeError, 'changed in iteration')
            }
        }
    } else {
        for (var i = d[KEYS].length - 1; i >= 0; i--) {
            var key = d[KEYS][i]
            if (key !== undefined) {
                yield $B.fast_tuple([key, d[VALUES][i]])
                if (d[VERSION] !== version) {
                    $B.RAISE(_b_.RuntimeError, 'changed in iteration')
                }
            }
        }
    }
    if (d[VERSION] !== version) {
        $B.RAISE(_b_.RuntimeError, 'changed in iteration')
    }
}

function convert_all_str(d) {
    // convert dict with only str keys to regular dict
    // add addtional fields
    d[TABLE] = Object.create(null)
    d[KEYS] = []
    d[VALUES] = []
    d[HASHES] = []

    for (var key in d) {
        dict.$setitem(d, key, d[key])
    }
}

$B.nb_fast_setitem = 0

dict.$setitem = function(self, key, value, $hash, from_setdefault) {
    // Set a dictionary item mapping key and value.
    if (self[$B.JSOBJ]) {
        // Python dictionary is used in a Javascript object
        value = $B.pyobj2jsobj(value)
        self[$B.JSOBJ][key] = value
    }
    var new_str_key
    if (typeof key == 'string') {
        // Even if dict is not all-string keys, set self[key]
        new_str_key = ! Object.hasOwn(self, key)
        self[key] = value
    }
    if (! self[TABLE]) {
        if (typeof key == 'string') {
            var int = parseInt(key)
            if (isNaN(int) || int >= 0) {
                if (new_str_key) {
                    self[VERSION] = self[VERSION] ?? 0
                    self[VERSION]++
                }
                self[key] = value
                return _b_.None
            } else {
                // string parsed as negative integer: insertion order
                // not preserved (issue 2256)
                convert_all_str(self)
            }
        } else {
            convert_all_str(self)
        }
    }

    if (key instanceof String) {
        key = key.valueOf()
    }

    var hash = $hash !== undefined ? $hash : $B.$hash(key)

    var index

    if (self[TABLE][hash] === undefined) {
        index = self[KEYS].length
        self[TABLE][hash] = [index]
    } else {
        if (! from_setdefault) {
            // If $setitem was called from setdefault, it's no use trying
            // another lookup
            index = index_by_key(self, key, hash)
            if (index !== null) {
                self[VALUES][index] = value
                return _b_.None
            }
        }
        index = self[KEYS].length
        if (self[TABLE][hash] === undefined) {
            // dict.$lookup_by_key might have removed self[TABLE][hash]
            self[TABLE][hash] = [index]
        } else {
            self[TABLE][hash].push(index)
        }
    }
    self[KEYS].push(key)
    self[VALUES].push(value)
    self[HASHES].push(hash)
    self[VERSION]++
    return _b_.None
}


dict.$literal = function(items) {
    var res = $B.empty_dict()
    for (var item of items) {
        dict.$setitem(res, item[0], item[1], item[2])
    }
    return res
}

dict.$factory = function() {
    var res = $B.empty_dict()
    var args = [res]
    for (var arg of arguments) {
        args.push(arg)
    }
    dict.tp_init.apply(null, args)
    return res
}

dict.$from_array = function(arrays) {
    // used internally for annotations
    var res = $B.empty_dict()
    for (var item of arrays) {
        dict.$setitem(res, item[0], item[1])
    }
    return res
}

/* dict start */

_b_.dict.tp_richcompare = function(self, other, op) {
    if (! $B.is_dict(other)) {
        return _b_.NotImplemented
    }
    var res
    switch (op) {
        case '__eq__':
            res = dict_eq(self, other)
            break
        case '__ne__':
            res = ! dict_eq(self, other)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

_b_.dict.nb_or = function(self, other) {
    // PEP 584
    if (! $B.$isinstance(self, dict) || ! $B.$isinstance(other, dict)) {
        return _b_.NotImplemented
    }
    var res = dict.tp_funcs.copy(self)
    dict.tp_funcs.update(res, other)
    return res
}

_b_.dict.tp_repr = function(self) {
    $B.builtins_repr_check(dict, arguments) // in brython_builtins.js
    return dict_repr(self)
}

_b_.dict.tp_hash = _b_.None

_b_.dict.tp_iter = function(self) {
    return {
        ob_type: $B.dict_keyiterator,
        it: _b_.dict.$iter_items(self),
        dict_obj: self
    }
}

_b_.dict.tp_init = function(self) {
    let [args, kw] = $B.parse_args_kw('__init__', arguments)
    args = Array.from(args).slice(1)
    return dict_init(self, args, kw)
    /*
    if (first === undefined) {
        self[SIZE] = 0
        return _b_.None
    }
    if (second === undefined) {
        // single argument
        if ((! first.$kw) && $B.$isinstance(first, $B.JSObj)) {
            for (let key in first) {
                dict.$setitem(self, key, first[key])
            }
            return _b_.None
        } else if (first.$kw) {
            var keys = new Set()
            for (let item of first.$kw) {
                if ($B.$isinstance(item, dict)) {
                    for (let subitem of dict.$iter_items(item)) {
                        dict.$set_string_no_duplicate(self, keys, subitem.key,
                            subitem.value)
                    }
                } else {
                    for (let key in item) {
                        dict.$set_string_no_duplicate(self, keys, key, item[key])
                    }
                }
            }
            return _b_.None
        } else if (first[Symbol.iterator]) {
            init_from_list(self, first)
            return _b_.None
        } else if ($B.exact_type(first, $B.generator)) {
            init_from_list(self, first.js_gen)
            return _b_.None
        }
    }

    var $ = $B.args("dict", 1, {self:null}, arguments, null, "first",
                "second")

    var args = $.first
    if (args.length > 1) {
        if ($B._experimental_dict) {
            console.log('try dict(*args)')
            for (var arg of args) {
                if (_b_.isinstance(arg, _b_.dict)) {
                    add_mapping(self, arg)
                } else {
                    try {
                        var js_iterable = $B.make_js_iterator(arg)
                    } catch (err) {
                        console.log(arg)
                        console.log(err)
                        $B.RAISE(_b_.TypeError, 'expected mapping or ' +
                            `iterable, got ${$B.class_name(arg)}`)
                    }
                    add_iterable(self, js_iterable)
                }
            }
        } else {
            $B.RAISE(_b_.TypeError, "dict expected at most 1 argument" +
                `, got ${args.length}`)
        }
    } else if (args.length == 1) {
        args = args[0]
        if ($B.exact_type(args, dict)) {
            for (let entry of dict.$iter_items(args)) {
                dict.$setitem(self, entry.key, entry.value, entry.hash)
            }
        } else {
            var keys = $B.$getattr($B.get_class(args), "keys", $B.NULL)
            if (keys !== $B.NULL) {
                var gi = $B.$getattr($B.get_class(args), "__getitem__", $B.NULL)
                if (gi !== $B.NULL) {
                    // has keys and __getitem__ : it's a mapping, iterate on
                    // keys and values
                    for (var key of $B.make_js_iterator($B.$call(keys, args))) {
                        try {
                            let value = $B.$call(gi, args, key)
                            dict.$setitem(self, key, value)
                        } catch (err) {
                            if ($B.is_exc(err, _b_.StopIteration)) {
                                break
                            }
                            throw err
                        }
                    }
                }
            } else {
                if (! Array.isArray(args)) {
                    args = _b_.list.$factory(args)
                }
                init_from_list(self, args)
            }
        }
    }

    for (let item of _b_.dict.$iter_items($.second)) {
        dict.$setitem(self, item.key, item.value)
    }
    return _b_.None
    */
}

_b_.dict.nb_inplace_or = function(self, other) {
    // PEP 584
    dict.tp_funcs.update(self, other)
    return self
}

_b_.dict.mp_ass_subscript = function(self, key, value) {
    if (value === $B.NULL) {
        return dict.$delitem(self, key)
    }
    return dict.$setitem(self, key, value)
}

_b_.dict.mp_length = function(self) {
    var count = 0
    if (self[KEYS]) {
        for (var d of self[KEYS]) {
            if (d !== undefined) {
                count++
            }
        }
    } else {
        count = Object.keys(self).length
    }
    return count
}

_b_.dict.mp_subscript = function(self) {
    var $ = $B.args("__getitem__", 2, {self: null, arg: null}, arguments)
    var self = $.self,
        arg = $.arg
    return dict.$getitem(self, arg)
}

_b_.dict.sq_contains = function(self) {
    var $ = $B.args("__contains__", 2, {self: null, key: null}, arguments)
    var self = $.self,
        key = $.key
    return _b_.dict.$contains(self, key)
}

_b_.dict.tp_new = function(cls, args, kw) {
    if (cls === undefined) {
        $B.RAISE(_b_.TypeError, "int.__new__(): not enough arguments")
    }
    var instance = $B.empty_dict()
    instance[$B.OB_TYPE] = cls
    if (cls !== dict) {
        $B.init_dict(instance)
    }
    return instance
}

var dict_funcs = _b_.dict.tp_funcs = {}


dict_funcs.__class_getitem__ = $B.$class_getitem



dict_funcs.__reversed__ = function(self) {
    return dict_reversekeyiterator.$factory(self)
}

dict_funcs.__sizeof__ = function(self) {
    return 48
}

dict_funcs.clear = function(self) {
    // Remove all items from the dictionary.
    var $ = $B.args("clear", 1, {self: null}, arguments)
    var self = $.self

    if (self[TABLE]) {
        delete self[TABLE]
        delete self[HASHES]
        delete self[KEYS]
        delete self[VALUES]
    }
    for (var key in self) {
        delete self[key]
    }
    self[VERSION]++
    return _b_.None
}

dict_funcs.copy = function(self) {
    // Return a shallow copy of the dictionary
    var $ = $B.args("copy", 1, {self: null}, arguments)
    var self = $.self,
        res = $B.empty_dict()

    if ($B.exact_type(self, _b_.dict)) {
        $copy_dict(res, self)
        return res
    }
    return res
}

dict_funcs.fromkeys = function() {
    var $ = $B.args("fromkeys", 3, {cls: null, keys: null, value: null},
                arguments, {value: _b_.None})
    var keys = $.keys,
        value = $.value

    // class method
    var cls = $.cls
    var res = $B.$call(cls),
        klass = $B.get_class(res), // might not be cls
        keys_iter = $B.$iter(keys),
        setitem = klass === dict ? dict.$setitem : $B.$getattr(klass, '__setitem__')

    while (1) {
        try {
            var key = _b_.next(keys_iter)
            setitem(res, key, value)
        } catch (err) {
            if ($B.is_exc(err, [_b_.StopIteration])) {
                return res
            }
            throw err
        }
    }
}


dict_funcs.get = function(self) {
    var $ = $B.args("get", 3, {self: null, key: null, _default: null},
                arguments, {_default: _b_.None})
    try {
        // call $getitem with ignore_missign set to true
        return dict.$getitem($.self, $.key, true)
    } catch (err) {
        if ($B.$isinstance(err, _b_.KeyError)) {
            return $._default
        } else {
            throw err
        }
    }
}

dict_funcs.items = function(self) {
    $B.args('items', 1, {self: null}, arguments)
    return {
        ob_type: $B.dict_items,
        dict_obj: self
    }
}

dict_funcs.keys = function(self) {
    $B.args('keys', 1, {self: null}, arguments)
    return {
        ob_type: $B.dict_keys,
        dict_obj: self
    }
}

dict_funcs.pop = function(self) {
    var $ = $B.args("pop", 3, {self: null, key: null, _default: null},
                arguments, {_default: $B.NULL})
    var self = $.self,
        key = $.key,
        _default = $._default

    try {
        var res = dict.mp_subscript(self, key) // __getitem__
        dict.mp_ass_subscript(self, key, $B.NULL)
        return res
    } catch (err) {
        if ($B.is_exc(err, _b_.KeyError)) {
            if (_default !== $B.NULL) {
                return _default
            }
            throw err
        }
        throw err
    }
}

dict_funcs.popitem = function(self) {
    $B.check_nb_args_no_kw('popitem', 1, arguments)
    if (dict.mp_length(self) == 0) {
        $B.RAISE(_b_.KeyError, "'popitem(): dictionary is empty'")
    }
    if (! self[TABLE]) {
        for (var key in self) {
            // go to last key
        }
        let res = $B.fast_tuple([key, self[key]])
        delete self[key]
        self[VERSION]++
        return res
    }
    var index = self[KEYS].length - 1
    while (index >= 0) {
        if (self[KEYS][index] !== undefined) {
            let res = $B.fast_tuple([self[KEYS][index], self[VALUES][index]])
            delete self[KEYS][index]
            delete self[VALUES][index]
            self[VERSION]++
            return res
        }
        index--
    }
}

dict_funcs.setdefault = function(self) {
    var $ = $B.args("setdefault", 3, {self: null, key: null, _default: null},
                arguments, {_default: _b_.None})
    var self = $.self,
        key = $.key,
        _default = $._default
    _default = _default === undefined ? _b_.None : _default

    if (! self[TABLE]) {
        if (typeof key === 'string') {
            if (! self.hasOwnProperty(key)) {
                self[key] = _default
            }
            return self[key]
        } else {
            // Non-string key, convert to regular dict
            convert_all_str(self)
        }
    }

    var lookup = dict.$lookup_by_key(self, key)
    if (lookup.found) {
        return lookup.value
    }
    var hash = lookup.hash
    dict.$setitem(self, key, _default, hash, true)
    return _default
}

dict_funcs.update = function(self) {
    var $ = $B.args("update", 1, {"self": null}, arguments, null, "args",
                "kw")
    var self = $.self,
        args = $.args,
        kw = $.kw
    if (args.length > 0) {
        var o = args[0]
        if ($B.$isinstance(o, dict)) {
            $copy_dict(self, o)
        } else if (_b_.hasattr(o, "keys")) {
            var _keys = _b_.list.$factory($B.$call($B.$getattr(o, "keys")))
            for (let i = 0, len = _keys.length; i < len; i++) {
                var getitem = $B.$getattr(o, "__getitem__", $B.NULL)
                if (getitem !== $B.NULL) {
                    var _value = $B.$call(getitem, _keys[i])
                    dict.$setitem(self, _keys[i], _value)
                }
            }
        } else {
            let it = _b_.iter(o),
                i = 0,
                key_value
            while (true) {
                try {
                    var item = _b_.next(it)
                } catch (err) {
                    if ($B.is_exc(err, _b_.StopIteration)) {
                        break
                    }
                    throw err
                }
                try {
                    key_value = _b_.list.$factory(item)
                } catch (err) {
                    $B.RAISE(_b_.TypeError, "cannot convert dictionary" +
                        " update sequence element #" + i + " to a sequence")
                }
                if (key_value.length !== 2) {
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

dict_funcs.values = function(self) {
    $B.args('values', 1, {self: null}, arguments)
    return {
        ob_type: $B.dict_values,
        dict_obj: self
    }
}

_b_.dict.tp_methods = [
    "__sizeof__", "get", "setdefault", "pop", "popitem", "keys", "items",
    "values", "update", "clear", "copy", "__reversed__"
]

_b_.dict.classmethods = [
    "fromkeys", "__class_getitem__"
]

/* dict end */

$B.set_func_names(dict, "builtins")

$B.dict_get = dict.tp_funcs.get


/* dict_items start */
$B.dict_items.tp_richcompare = function(self, other, op) {
    return dictview_richcompare(self, other, op)
}

$B.dict_items.nb_subtract = function(self, other) {
    return dictviews_sub(self, other)
}

$B.dict_items.nb_and = function(self) {
    return _PyDictView_Intersect(self, other)
}

$B.dict_items.nb_xor = function(self) {
    return dictviews_xor(self, other)
}

$B.dict_items.nb_or = function(self) {
    return dictviews_or(self, other)
}

$B.dict_items.tp_repr = function(self) {
    var items = Array.from(dict.$iter_items(self.dict_obj)).map(
        x => $B.fast_tuple([x.key, x.value]))
    items = $B.$list(items)
    return 'dict_items(' + _b_.repr(items) + ')'
}

$B.dict_items.tp_hash = _b_.None

$B.dict_items.tp_iter = function(self) {
    return {
        ob_type: $B.dict_itemiterator,
        it: _b_.dict.$iter_items(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

$B.dict_items.mp_length = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

$B.dict_items.sq_contains = function(self, obj) {
    if (! $B.is_tuple(obj) || obj.length != 2) {
        return false
    }
    var key = obj[0]
    var value = obj[1]
    try {
        var result = _b_.dict.$getitem(self.dict_obj, key)
    } catch (err) {
        $B.RAISE_IF_NOT(err, _b_.KeyError)
        return false
    }
    return $B.is_or_equals(result, value)
}

var dict_items_funcs = $B.dict_items.tp_funcs = {}

dict_items_funcs.__reversed__ = function(self) {
    return {
        ob_type: $B.dict_reverseitemiterator,
        it: dict.$iter_items_reversed(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

dict_items_funcs.isdisjoint = function(self, other) {
    var items = Array.from(dict.$iter_items(self.dict_obj))
        .map(x => $B.fast_tuple([x.key, x.value]))
    var self_as_set = $B.$call(_b_.set, items)
    return _b_.set.tp_funcs.isdisjoint(self_as_set, other)
}

dict_items_funcs.mapping_get = function(self) {
    return $B.mappingproxy.tp_new(self.dict_obj, [], $B.empty_dict())
}

dict_items_funcs.mapping_set = _b_.None

$B.dict_items.tp_methods = ["isdisjoint", "__reversed__"]

$B.dict_items.tp_getset = ["mapping"]

/* dict_items end */


/* dict_keys start */
$B.dict_keys.tp_richcompare = function(self, other, op) {
    return dictview_richcompare(self, other, op)
}

$B.dict_keys.nb_subtract = function(self, other) {
    return dictviews_sub(self, other)
}

$B.dict_keys.nb_and = function(self, other) {
    return _PyDictView_Intersect(self, other)
}

$B.dict_keys.nb_xor = function(self, other) {
    return dictviews_xor(self, other)
}

$B.dict_keys.nb_or = function(self, other) {
    return dictviews_or(self, other)
}

$B.dict_keys.tp_repr = function(self) {
    var keys = Array.from(dict.$iter_items(self.dict_obj)).map(x => x.key)
    return `dict_keys([${keys}])`
}

$B.dict_keys.tp_hash = _b_.None

$B.dict_keys.tp_iter = function(self) {
    return {
        ob_type: $B.dict_keyiterator,
        it: dict.$iter_items(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

$B.dict_keys.mp_length = function(self) {
    return dict.mp_length(self.dict_obj)
}

$B.dict_keys.sq_contains = function(self, value) {
    for (var item of dict.$iter_items(self.dict_obj)) {
        if ($B.is_or_equals(item.key, value)) {
            return true
        }
    }
    return false
}

var dict_keys_funcs = $B.dict_keys.tp_funcs = {}

dict_keys_funcs.__reversed__ = function(self) {
    return {
        ob_type: $B.dict_reversekeyiterator,
        it: _b_.dict.$iter_items_reversed(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

dict_keys_funcs.isdisjoint = function(self, other) {
    var keys = Array.from(dict.$iter_items(self.dict_obj)).map(x => x.key)
    var self_as_set = $B.$call(_b_.set, keys)
    return _b_.set.tp_funcs.isdisjoint(self_as_set, other)
}

dict_keys_funcs.mapping_get = function(self) {
    return $B.mappingproxy.tp_new(self.dict_obj, [], $B.empty_dict())
}

dict_keys_funcs.mapping_set = _b_.None

$B.dict_keys.tp_methods = ["isdisjoint", "__reversed__"]

$B.dict_keys.tp_getset = ["mapping"]

/* dict_keys end */

/* dict_values start */
$B.dict_values.tp_repr = function(self) {
    var values = Array.from(dict.$iter_items(self.dict_obj)).map(x => x.value)
    return `dict_values({${keys}])`
}

$B.dict_values.tp_iter = function(self) {
    return {
        ob_type: $B.dict_valueiterator,
        it: _b_.dict.$iter_items(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

$B.dict_values.mp_length = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

var dict_values_funcs = $B.dict_values.tp_funcs = {}

dict_values_funcs.__reversed__ = function(self) {
    return {
        ob_type: $B.dict_reversevalueiterator,
        it: dict.$iter_items_reversed(self.dict_obj),
        dict_obj: self.dict_obj
    }
}

dict_values_funcs.mapping_get = function(self) {
    return $B.mappingproxy.tp_new(self.dict_obj, [], $B.empty_dict())
}

dict_values_funcs.mapping_set = _b_.None

$B.dict_values.tp_methods = ["__reversed__"]

$B.dict_values.tp_getset = ["mapping"]

/* dict_values end */

$B.set_func_names($B.dict_values, 'builtins')


/* dict_keyiterator start */
$B.dict_keyiterator.tp_iter = function(self) {
    return self
}

$B.dict_keyiterator.tp_iternext = function*(self){
    for (var item of self.it) {
        yield item.key
    }
}

var dict_keyiterator_funcs = $B.dict_keyiterator.tp_funcs = {}

dict_keyiterator_funcs.__length_hint__ = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

dict_keyiterator_funcs.__reduce__ = function(self) {
    var keys = $B.$list(Array.from($B.dict_keyiterator.tp_iternext(self)))
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([keys])])
}

$B.dict_keyiterator.tp_methods = ["__length_hint__", "__reduce__"]
/* dict_keyiterator end */


/* dict_reversekeyiterator start */
$B.dict_reversekeyiterator.tp_iter = function(self) {
    return self
}

$B.dict_reversekeyiterator.tp_iternext = function*(self){
    for (var entry of self.it) {
        yield entry[0]
    }
}

var dict_reversekeyiterator_funcs = $B.dict_reversekeyiterator.tp_funcs = {}

dict_reversekeyiterator_funcs.__length_hint__ = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

dict_reversekeyiterator_funcs.__reduce__ = function(self) {

}

$B.dict_reversekeyiterator.tp_methods = ["__length_hint__", "__reduce__"]

/* dict_reversekeyiterator end */

/* dict_valueiterator start */
$B.dict_valueiterator.tp_iter = function(self) {
    return self
}

$B.dict_valueiterator.tp_iternext = function*(self){
    for (var item of self.it) {
        yield item.value
    }
}

var dict_valueiterator_funcs = $B.dict_valueiterator.tp_funcs = {}

dict_valueiterator_funcs.__length_hint__ = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

dict_valueiterator_funcs.__reduce__ = function(self) {
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([$B.$list(Array.from(dict_valueiterator.tp_iternext(self)))])])
}

$B.dict_valueiterator.tp_methods = ["__length_hint__", "__reduce__"]
/* dict_valueiterator end */

/* dict_reversevalueiterator start */
$B.dict_reversevalueiterator.tp_iter = function(self) {
    return self
}

$B.dict_reversevalueiterator.tp_iternext = function*(self){
    for (var item of self.it) {
        yield item[1]
    }
}

var dict_reversevalueiterator_funcs = $B.dict_reversevalueiterator.tp_funcs = {}

dict_reversevalueiterator_funcs.__length_hint__ = function(self) {

}

dict_reversevalueiterator_funcs.__reduce__ = function(self) {

}

$B.dict_reversevalueiterator.tp_methods = ["__length_hint__", "__reduce__"]

/* dict_reversevalueiterator end */

/* dict_itemiterator start */

$B.dict_itemiterator.tp_iter = function(self) {
    return self
}

$B.dict_itemiterator.tp_iternext = function*(self){
    for (var item of self.it) {
        yield $B.fast_tuple([item.key, item.value])
    }
}

var dict_itemiterator_funcs = $B.dict_itemiterator.tp_funcs = {}

dict_itemiterator_funcs.__length_hint__ = function(self) {
    return_b_.dict.mp_length(self.obj)
}

dict_itemiterator_funcs.__reduce__ = function(self) {
    return $B.fast_tuple([_b_.iter,
        $B.fast_tuple([$B.$list(Array.from(dict_itemiterator.tp_iternext(self)))])])
}

$B.dict_itemiterator.tp_methods = ["__length_hint__", "__reduce__"]
/* dict_itemiterator start */

/* dict_reverseitemiterator start */
$B.dict_reverseitemiterator.tp_iter = function(self) {
    return self
}

$B.dict_reverseitemiterator.tp_iternext = function*(self){
    for (var item of self.it) {
        yield item
    }
}

var dict_reverseitemiterator_funcs = $B.dict_reverseitemiterator.tp_funcs = {}

dict_reverseitemiterator_funcs.__length_hint__ = function(self) {
    return _b_.dict.mp_length(self.dict_obj)
}

dict_reverseitemiterator_funcs.__reduce__ = function(self) {

}

$B.dict_reverseitemiterator.tp_methods = ["__length_hint__", "__reduce__"]

/* dict_reverseitemiterator end */

$B.empty_dict = function() {
    var res = {}
    res[$B.OB_TYPE] = dict
    res[VERSION] = 0
    return res
}

dict.$from_js = function(jsobj) {
    var res = $B.empty_dict()
    for (var key in jsobj) {
        dict.$setitem(res, key, jsobj[key])
    }
    return res
}

/* frozendict start */
_b_.frozendict.tp_richcompare = function(self) {

}

_b_.frozendict.nb_or = function(self) {

}

_b_.frozendict.tp_repr = function(self) {
    $B.builtins_repr_check(_b_.frozendict, arguments) // in brython_builtins.js
    return `frozendict(${dict_repr(self)})`
}

_b_.frozendict.tp_hash = function(self) {

}

_b_.frozendict.tp_iter = function(self) {

}

_b_.frozendict.tp_new = function(cls, args, kw) {
    var instance = $B.empty_dict()
    instance[$B.OB_TYPE] = cls
    dict_init(instance, args, kw)
    return instance
}

_b_.frozendict.mp_length = function(self) {

}

_b_.frozendict.mp_subscript = _b_.dict.mp_subscript

_b_.frozendict.sq_contains = _b_.dict.sq_contains

var frozendict_funcs = _b_.frozendict.tp_funcs = {}

frozendict_funcs.__class_getitem__ = $B.$class_getitem

frozendict_funcs.__getnewargs__ = function(self) {
    let d = dict.$factory(self)
    return $B.fast_tuple([d])
}

frozendict_funcs.__reversed__ = dict_funcs.__reversed__

frozendict_funcs.__sizeof__ = dict_funcs.__sizeof__

frozendict_funcs.copy = function(self) {
    // Return a shallow copy of the dictionary
    var $ = $B.args("copy", 1, {self: null}, arguments)
    var self = $.self,
        res = $B.empty_dict()
    res[$B.OB_TYPE] = _b_.frozendict

    if ($B.exact_type(self, _b_.frozendict)) {
        $copy_dict(res, self)
    }
    return res
}

frozendict_funcs.fromkeys = dict_funcs.values

frozendict_funcs.get = dict_funcs.get

frozendict_funcs.items = dict_funcs.items

frozendict_funcs.keys = dict_funcs.keys

frozendict_funcs.values = dict_funcs.values

_b_.frozendict.tp_methods = [
    "__sizeof__", "get", "keys", "items", "values", "copy", "__reversed__", 
    "__getnewargs__"]

_b_.frozendict.classmethods = ["fromkeys", "__class_getitem__"]

/* frozendict end */

$B.set_func_names(_b_.frozendict, 'builtins')


// Class for attribute __dict__ of classes
var mappingproxy = $B.mappingproxy

mappingproxy.$factory = function(obj) {
    var res
    if ($B.$isinstance(obj, dict)) {
        res = dict.$to_obj(obj)
    } else {
        res = obj
    }
    res.ob_type = mappingproxy
    res.mapping = obj
    res[VERSION] = 0
    return res
}

mappingproxy.$match_mapping_pattern = true // for pattern matching (PEP 634)

/* mappingproxy start */
$B.mappingproxy.tp_richcompare = function(self) {

}

$B.mappingproxy.nb_or = function(self) {

}

$B.mappingproxy.tp_repr = function(self) {
    return dict.tp_repr(self.mapping)
}

$B.mappingproxy.tp_hash = _b_.None

$B.mappingproxy.tp_str = function(self) {
    return $B.mappingproxy.tp_repr(self)
}

$B.mappingproxy.tp_iter = function(self) {
    return {
        ob_type: $B.dict_keyiterator,
        it: mappingproxy_iter_items(self),
        dict_obj: self.mapping
    }
}

$B.mappingproxy.tp_new = function(cls, args, kw) {
    kw = kw ?? $B.empty_dict()
    var nb_kwargs = $B.str_dict_length(kw)
    var nb_args = args.length + nb_kwargs
    var mapping
    if (nb_args == 0) {
        $B.RAISE(_b_.TypeError,
            "mappingproxy() missing required argument 'mapping' (pos 1)"
        )
    } else if (nb_args > 1) {
        $B.RAISE(_b_.TypeError,
            `mappingproxy() takes at most 1 argument (${nb_args} given)`
        )
    } else if (args.length == 0) {
        $B.check_expected_keywords('mappingproxy', ['mapping'], kw)
        if (nb_kwargs > 1) {
            $B.RAISE(_b_.TypeError,
                `mappingproxy() takes at most 1 keyword argument ` +
                `(${nb_kwargs} given)`
            )
        }
        mapping = $B.str_dict_get(kw, 'mapping')
    } else {
        mapping = args[0]
    }
    return {
        ob_type: cls,
        mapping
    }
}

$B.mappingproxy.nb_inplace_or = function(self) {

}

$B.mappingproxy.mp_length = function(self) {
    return Object.keys(self.mapping).length
}

$B.mappingproxy.mp_subscript = function(self, key) {
    if (self.mapping.hasOwnProperty(key)) {
        return self.mapping[key]
    }
    $B.RAISE(_b_.KeyError, key)
}

$B.mappingproxy.sq_contains = function(self, key) {
    return self.mapping.hasOwnProperty(key)
}

var mappingproxy_funcs = $B.mappingproxy.tp_funcs = {}

mappingproxy_funcs.__class_getitem__ = function(self) {

}

mappingproxy_funcs.__reversed__ = function(self) {

}

mappingproxy_funcs.copy = function(self) {
    var copy_func = $B.type_getattribute(_b_.dict, 'copy')
    return $B.mappingproxy.tp_new($B.mappingproxy, [copy_func(self.mapping)])
}

mappingproxy_funcs.get = function(self, key, _default) {
    if (self.mapping.hasOwnProperty(key)) {
        return self.mapping[key]
    }
    return _default ?? _b_.None
}

mappingproxy_funcs.items = function(self) {
    return _b_.dict.tp_funcs.items(self.mapping)
}

mappingproxy_funcs.keys = function(self) {
    return {
        ob_type: $B.dict_keyiterator,
        it: mappingproxy_iter_items(self),
        dict_obj: self.mapping
    }
}

mappingproxy_funcs.values = function(self) {
    return _b_.dict.tp_funcs.values(self.mapping)
}

$B.mappingproxy.functions_or_methods = ["__new__"]

$B.mappingproxy.tp_methods = ["get", "keys", "values", "items", "copy", "__reversed__"]

$B.mappingproxy.classmethods = ["__class_getitem__"]

/* mapping proxy end */

$B.set_func_names(mappingproxy, "builtins")

function* mappingproxy_iter_items(self){
    for (var key in self.mapping) {
        yield {key, value: self.mapping[key]}
    }
}

function jsobj2dict(x, exclude) {
    exclude = exclude || function() {return false}
    var d = $B.empty_dict()
    for (var attr in x) {
        if (attr.charAt(0) != "$" && ! exclude(attr)) {
            if (x[attr] === null) {
                dict.$setitem(d, attr, _b_.None)
            } else if (x[attr] === undefined) {
                continue
            } else {
                dict.$setitem(d, attr, $B.jsobj2pyobj(x[attr]))
            }
        }
    }
    return d
}


})(__BRYTHON__);

