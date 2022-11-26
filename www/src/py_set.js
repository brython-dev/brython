;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    $N = _b_.None

// set

// Create an object of the same type as obj
function create_type(obj){
    return $B.get_class(obj).$factory()
}

function make_new_set(type){
    return {
        __class__: type,
        $store: {},
        $version: 0,
        $used: 0
        }
}
function make_new_set_base_type(so){
    return _b_.isinstance(so, set) ?
               set.$factory() :
               frozenset.$factory()
}

function set_hash(item){
    if(typeof item == 'string'){
        return 's' + item
    }else if(typeof item == 'number'){
        return 'n' + item
    }else if(typeof item == 'boolean'){
        return 'b' + item
    }else if(item.__class__ === _b_.float){
        return 'n' + item.value
    }else{
        return 'o' + (item.__hashvalue__ || _b_.hash(item))
    }
}

function set_add(so, item){
    var hash = set_hash(item)
    if(set_contains(so, item, hash)){
        return
    }
    so.$used++
    if(hash[0] == 'o'){
        if(so.$store[hash]){
            so.$store[hash].push(item)
        }else{
            so.$store[hash] = [item]
        }
    }else{
        so.$store[set_hash(item)] = item
    }
}

function set_contains(so, key, hash){
    return !! set_lookkey(so, key, hash)
}

// Create a copy of the object : same type, same items
// Can't use general $B.clone because both objects would reference the same
// array $items
function set_copy(obj){
    var res = make_new_set_base_type(obj) // set or frozenset
    res.$store = $B.clone(obj.$store)
    res.$used = obj.$used
    return res
}

function set_copy_from(so, other){
    so.$store = $B.clone(other.$store)
    so.$used = other.$used
}

var set = $B.make_class('set')
set.$native = true

function set_copy_and_difference(so, other){
    var result = set_copy(so)
    set_difference_update(result, other)
    return result
}

function set_difference(so, other){
    var key,
        hash,
        entry,
        pos = 0,
        other_size,
        rv,
        other_is_dict

    if(_b_.isinstance(other, [set, frozenset])){
        other_size = set.__len__(other)
    }else if(_b_.isinstance(other, _b_.dict)){
        other_size = _b_.dict.__len__(other)
        other_is_dict = true
    }else{
        return set_copy_and_difference(so, other)
    }

    /* If len(so) much more than len(other), it's more efficient to simply copy
     * so and then iterate other looking for common elements. */
    if (set.__len__(so) >> 2 > other_size) {
        return set_copy_and_difference(so, other);
    }

    var klass = so.__class__,
        result = $B.$call(klass)()

    if(other_is_dict){
        while(true){
            var next = set_next(so, pos)
            if(! next){
                break
            };
            [pos, key] = next
            try{
                rv = _b_.dict.$getitem(other, key)
            }catch(err){
                if($.is_exc(err, [_b_.KeyError])){
                    set_add(result, key)
                }else{
                    throw err
                }
            }
        }
        return result
    }

    /* Iterate over so, checking for common elements in other. */
    while(true){
        var next = set_next(so, pos)
        if(! next){
            break
        };
        [pos, key] = next
        rv = set_contains(other, key)
        if(!rv){
            set_add(result, key)
        }
    }
    return result;
}


function set_difference_update(so, other){
    if (so === other){
        return set.clear(so);
    }
    if(_b_.isinstance(other, [set, frozenset])){
        var entry,
            pos = 0;
        while(true){
            var next = set_next(other, pos),
                other_item
            if(! next){
                break
            };
            [pos, other_item] = next
            set_discard_key(so, other_item)
        }
    }else{
        var frame = $B.last($B.frames_stack)
        var iterator = $B.next_of1(other, frame, frame.$lineno)
        for(var key of iterator){
            set_discard_key(so, key)
        }
    }
}

const DISCARD_NOTFOUND = 0,
      DISCARD_FOUND = 1

function set_discard_entry(so, key){
    var entry = set_lookkey(so, key)
    if(entry === null){
        return DISCARD_NOTFOUND
    }
    if(entry.hash[0] == 'o'){
        if(so.$store[entry.hash] !== undefined){
            so.$store[entry.hash].splice(entry.hash_index, 1)
            if(so.$store[entry.hash].length == 0){
                delete so.$store[entry.hash]
            }
        }
    }else{
        delete so.$store[entry.hash]
    }
    so.$used--
}

function set_discard_key(so, key){
    return set_discard_entry(so, key);
}

function set_intersection(self, other){
    if(self === other){
        return set_copy(self)
    }
    var result = make_new_set_base_type(self),
        iterator
    if(_b_.isinstance(other, [set, frozenset])){
        if(set.__len__(other) > set.__len__(self)){
            // swap self and other
            var temp = other,
                other = self,
                self = temp
        }
        iterator = make_iter(other)
    }else{
        var frame = $B.last($B.frames_stack),
            lineno = frame.$lineno
        iterator = $B.next_of1(other, frame, lineno)
    }
    for(var other_item of iterator){
        var test = set_contains(self, other_item)
        if(test){
            set_add(result, other_item)
        }
    }
    return result
}

function set_intersection_multi(so, args){
    var result = set_copy(so)

    if(args.length == 0){
        return result
    }

    for(var other of args){
        result = set_intersection(result, other)
    }
    return result;
}

function set_lookkey(so, key, hash){
    if(hash === undefined){
        if(key.__class__ === set ||
                (key.__class__ && key.__class__.__mro__ &&
                 key.__class__.__mro__.indexOf(set) > -1)){
            // search sets as frozensets
            hash = 'o' + frozenset.__hash__(key)
        }else{
            hash = set_hash(key)
        }
    }
    if(hash[0] == 'o'){
        if(so.$store[hash] === undefined){
            return null
        }
        var hash_index = -1
        for(var obj of so.$store[hash]){
            hash_index++
            if(obj === key || $B.rich_comp('__eq__', obj, key)){
                return {hash, hash_index}
            }
        }
        return null
    }else{
        return so.$store[hash] === undefined ? null : {hash}
    }
}

function set_swap_bodies(a, b){
    var temp = set_copy(a)
    set.clear(a)
    a.$used = b.$used
    a.$store = b.$store
    b.$used = temp.$used
    b.$store = temp.$store
}

function set_symmetric_difference_update(so, other){
    var otherset,
        key,
        pos = 0,
        hash,
        entry,
        rv

    if(so == other){
        return set.clear(so)
    }
    var iterator
    if(_b_.isinstance(other, _b_.dict)){
        iterator = _b_.dict.$make_iter(other)
    }else if(_b_.isinstance(other, [set, frozenset])){
        iterator = make_iter(other)
    }else{
        iterator = make_iter(set.$factory(other))
    }
    for(var key of iterator){
        rv = set_discard_entry(so, key)
        if(rv == DISCARD_NOTFOUND){
            set_add(so, key)
        }
    }
    return _b_.None
}

set.__and__ = function(self, other, accept_iter){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    return set_intersection(self, other)
}

set.__class_getitem__ = function(cls, item){
    // PEP 585
    // Set as a classmethod at the end of this script, after $B.set_func_names()
    if(! Array.isArray(item)){
        item = [item]
    }
    return $B.GenericAlias.$factory(cls, item)
}

set.__contains__ = function(self, item){
    return set_contains(self, item)
}

set.__eq__ = function(self, other){
    if(_b_.isinstance(other, [_b_.set, _b_.frozenset])){
      set_make_items(self)
      set_make_items(other)
      if(other.$items.length == self.$items.length){
        var self_version = self.$version,
            other_version = other.$version
        for(var i = 0, len = self.$items.length; i < len; i++){
           if(set_contains(self, other.$items[i]) === false){
               return false
           }
           if(self.$version !== self_version ||
                   other.$version !== other_version){
               throw _b_.RuntimeError.$factory(
                   'set changed size during iteration')
           }
        }
        return true
      }
      return false
    }
    return _b_.NotImplemented
}

set.__format__ = function(self, format_string){
    return set.__str__(self)
}

set.__ge__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        return set.__le__(other, self)
    }
    return _b_.NotImplemented
}

set.__gt__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        return set.__lt__(other, self)
    }
    return _b_.NotImplemented
}

set.__hash__ = _b_.None

set.__init__ = function(self, iterable){
    if(iterable === undefined){
        return _b_.None
    }
    $B.check_nb_args_no_kw('set', 2, arguments)
    if(Object.keys(self.$store).length > 0){
        set.clear(self)
    }
    set.update(self, iterable)
    return _b_.None
}

var set_iterator = $B.make_iterator_class("set iterator")

set_iterator.__length_hint__ = function(self){
    return self.len
}

set.__iter__ = function(self){
    // Sort items by hash
    set_make_items(self)
    self.$items.sort(function(x, y){
        var hx = _b_.hash(x),
            hy = _b_.hash(y)
        return hx == hy ? 0 :
               hx < hy ? -1 : 1
    })
    var res = set_iterator.$factory(self.$items),
        version = self.$version
    res.test_change = function(){
        if(self.$version !== undefined && self.$version !== version){
            return "Set changed size during iteration"
        }
        return false
    }
    return res
}

function check_version(s, version){
    if(s.$version != version){
        throw _b_.RuntimeError.$factory(
            'Set changed size during iteration')
    }
}

function make_iter(obj){
    let version = obj.$version,
        pos = 0
    set_make_items(obj)

    const iterator = {
        *[Symbol.iterator](){
            while(pos < obj.$items.length){
                var result = obj.$items[pos]
                pos++
                yield result
                check_version(obj, version)
            }
        }
    }
    return iterator
}

function set_make_items(so){
    // make so.$items
    so.$items = []
    for(var hash in so.$store){
        if(hash[0] == 'o'){
            so.$items = so.$items.concat(so.$store[hash])
        }else{
            so.$items.push(so.$store[hash])
        }
    }
}

function set_next(so, pos){
    if(pos == 0){
        set_make_items(so)
    }
    var result = so.$items[pos]
    if(result === undefined){
        return 0
    }
    return [pos + 1, result]
}

function make_hash_iter(obj, hash){
    let version = obj.$version,
        hashes = obj.$hashes[hash],
        len = hashes.length,
        i = 0

    const iterator = {
        *[Symbol.iterator](){
            while(i < len){
                var result = hashes[i]
                i++
                yield result
                check_version(obj, version)
            }
        }
    }
    return iterator
}

set.__le__ = function(self, other){
    // Test whether every element in the set is in other.
    if(_b_.isinstance(other, [set, frozenset])){
        for(var item of make_iter(self)){
            if(! set_contains(other, item)){
                return false
            }
        }
        return true
    }else{
        return _b_.NotImplemented
    }
}

set.__len__ = function(self){
    return self.$used //$items.length
}

set.__lt__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        return set.__le__(self, other) &&
            set.__len__(self) < _b_.getattr(other, "__len__")()
    }else{
        return _b_.NotImplemented
    }
}

set.__mro__ = [_b_.object]

set.__new__ = function(cls, iterable){
    if(cls === undefined){
        throw _b_.TypeError.$factory("set.__new__(): not enough arguments")
    }
    var self = make_new_set(cls)
    if(iterable === undefined){
        return self
    }
    if(cls === set){
        $B.check_nb_args_no_kw('__new__', 2, arguments)
    }
    return self
}

set.__or__ = function(self, other, accept_iter){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    var res = set_copy(self),
        pos = 0
    while(true){
        var next = set_next(other, pos)
        if(! next){
            break
        };
        [pos, other_item] = next
        set_add(res, other_item)
    }
    return res
}

set.__rand__ = function(self, other){
    // Used when other.__and__(self) is NotImplemented
    return set.__and__(self, other)
}

set.__reduce__ = function(self){
    set_make_items(self)
    return $B.fast_tuple([self.__class__,
                         $B.fast_tuple([self.$items]),
                         _b_.None])
}

set.__reduce_ex__ = function(self, protocol){
    return set.__reduce__(self)
}

set.__repr__ = function(self){
    $B.builtins_repr_check(set, arguments) // in brython_builtins.js
    return set_repr(self)
}

function set_repr(self){
    // shared between set and frozenset
    klass_name = $B.class_name(self)
    set_make_items(self)
    if(self.$items.length === 0){
        return klass_name + "()"
    }
    var head = klass_name + "({",
        tail = "})"
    if(head == "set({"){head = "{"; tail = "}"}
    var res = []
    if($B.repr.enter(self)){
        return klass_name + "(...)"
    }
    // try ordering; sets that compare equal have the same repr(), ie with
    // items in the same order
    try{
        self.$items.sort(function(x, y){
            var hx = _b_.hash(x),
                hy = _b_.hash(y)
            return hx > hy ? 1 :
                   hx == hy ? 0 :
                   - 1
            }
        )
    }catch(err){
        // ignore
        console.log('erreur', err.message)
    }
    for(var i = 0, len = self.$items.length; i < len; i++){
        var r = _b_.repr(self.$items[i])
        if(r === self || r === self.$items[i]){res.push("{...}")}
        else{res.push(r)}
    }
    res = res.join(", ")
    $B.repr.leave(self)
    return head + res + tail
}

set.__ror__ = function(self, other){
    // Used when other.__or__(self) is NotImplemented
    return set.__or__(self, other)
}

set.__rsub__ = function(self, other){
    // Used when other.__sub__(self) is NotImplemented
    return set.__sub__(self, other)
}

set.__rxor__ = function(self, other){
    // Used when other.__xor__(self) is NotImplemented
    return set.__xor__(self, other)
}

set.__sub__ = function(self, other, accept_iter){
    // Return a new set with elements in the set that are not in the others
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    return set_difference(self, other)
}

set.__xor__ = function(self, other, accept_iter){
    // Return a new set with elements in either the set or other but not both
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    var res = create_type(self)
    for(var item of make_iter(self)){
        if(! set_contains(other, item)){
            set_add(res, item)
        }
    }
    for(var other_item of make_iter(other)){
        if(! set_contains(self, other_item)){
            set_add(res, other_item)
        }
    }
    return res
}

// add "reflected" methods
$B.make_rmethods(set)

set.add = function(){
    var $ = $B.args("add", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null),
        self = $.self,
        item = $.item
    set_add(self, item)
    self.$version++
    return _b_.None
}

set.clear = function(){
    var $ = $B.args("clear", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    $.self.$used = 0
    $.self.$store = {}
    $.self.$version++
    return $N
}

set.copy = function(self){
    $B.check_nb_args_no_kw('copy', 1, arguments)
    return set_copy(self)
}

set.difference_update = function(self){
    var $ = $B.args("difference_update", 1, {self: null}, ["self"],
            arguments, {}, "args", null)
    for(var arg of $.args){
        set_difference_update(self, arg)
    }
    self.$version++
    return _b_.None
}

set.discard = function(){
    var $ = $B.args("discard", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null)
    var result = set_discard_entry($.self, $.item)
    if(result != DISCARD_NOTFOUND){
        self.$version++
    }
    return _b_.None
}

set.intersection_update = function(){
    // Update the set, keeping only elements found in it and all others.
    var $ = $B.args("intersection_update", 1, {self: null}, ["self"],
        arguments, {}, "args", null),
        self = $.self,
        args = $.args
    var temp = set_intersection_multi(self, args)
    set_swap_bodies(self, temp)
    self.$version++
    return _b_.None
}

set.isdisjoint = function(){
    var $ = $B.args("isdisjoint", 2,
            {self: null, other: null}, ["self", "other"],
            arguments, {}, null, null),
        self = $.self,
        other = $.other
    if(self === other){
        return set.__len__(self) == 0
    }
    var iterator
    if(_b_.isinstance(other, [set, frozenset])){
        if(set.__len__(other) > set.__len__(self)){
            // swap self and other
            var temp = other,
                other = self,
                self = temp
        }
        iterator = make_iter(other)
    }else{
        var frame = $B.last($B.frames_stack),
            lineno = frame.$lineno
        iterator = $B.next_of1(other, frame, lineno)
    }
    for(var item of iterator){
        if(set_contains(self, item)){
            return false
        }
    }
    return true
}

set.pop = function(self){
    for(var hash in self.$store){
    }
    if(hash === undefined){
        throw _b_.KeyError.$factory('pop from an empty set')
    }
    var item
    if(hash[0] == 'o'){
        item = self.$store[hash].pop()
    }else{
        item = self.$store[hash]
        delete self.$store[hash]
    }
    self.$used--
    self.$version++
    return item
}

set.remove = function(self, item){
    // If item is a set, search if a frozenset in self compares equal to item
    var $ = $B.args("remove", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null),
        self = $.self,
        item = $.item
    var result = set_discard_entry(self, item)
    if(result == DISCARD_NOTFOUND){
        throw _b_.KeyError.$factory(item)
    }
    self.$version++
    return _b_.None
}

set.symmetric_difference_update = function(self, s){
    // Update the set, keeping only elements found in either set, but not in both.
    var $ = $B.args("symmetric_difference_update", 2,
        {self: null, s: null}, ["self", "s"], arguments, {}, null, null),
        self = $.self,
        s = $.s
    return set_symmetric_difference_update(self, s)
}

set.update = function(self){
    // Update the set, adding elements from all others.
    var $ = $B.args("update", 1, {self: null}, ["self"],
        arguments, {}, "args", null)
    for(var iterable of $.args){
        if(Array.isArray(iterable)){
            for(var i = 0; i < iterable.length; i++){
                set_add(self, iterable[i])
            }
        }else if(_b_.isinstance(iterable, [set, frozenset])){
            var pos = 0
            while(true){
                var next = set_next(iterable, pos)
                if(! next){
                    break
                };
                [pos, other_item] = next
                set_add(self, other_item)
            }
        }else{
            var frame = $B.last($B.frames_stack),
                iterator = $B.next_of1(iterable, frame, frame.$lineno)
            for(var item of iterator){
                set_add(self, item)
            }
        }
    }
    self.$version++
    return _b_.None
}

/*
The non-operator versions of union(), intersection(), difference(), and
symmetric_difference(), issubset(), and issuperset() methods will accept any
iterable as an argument. In contrast, their operator based counterparts
require their arguments to be sets. This precludes error-prone constructions
like set('abc') & 'cbs' in favor of the more readable
set('abc').intersection('cbs').
*/

set.difference = function(){
    var $ = $B.args("difference", 1, {self: null},
        ["self"], arguments, {}, "args", null)
    if($.args.length == 0){
        return set.copy($.self)
    }

    var res = set_copy($.self)
    for(var arg of $.args){
        var other = set.$factory(arg)
        res = set.__sub__(res, other)
    }
    return res
}

var fc = set.difference + "" // source code
eval("set.intersection = "+
    fc.replace(/difference/g, "intersection").replace("__sub__", "__and__"))
eval("set.symmetric_difference = " +
    fc.replace(/difference/g, "symmetric_difference").replace("__sub__",
        "__xor__"))
eval("set.union = " +
    fc.replace(/difference/g, "union").replace("__sub__", "__or__"))

set.issubset = function(){
    var $ = $B.args("issubset", 2, {self: null, other: null},
            ["self", "other"], arguments, {}, "args", null),
        self = $.self,
        other = $.other
    if(! _b_.isinstance(other, [set, frozenset])){
        var temp = set_intersection(self, other)
        return set.__len__(temp) == set.__len__(self)
    }
    if(set.__len__(self) > set.__len__(other)){
        return false
    }
    var pos = 0,
        next,
        rv
    while(true){
        next = set_next(self, pos)
        if(! next){
            break
        };
        [pos, key] = next
        rv = set_contains(other, key)
        if(! rv){
            return false
        }
    }
    return true
}

set.issuperset = function(){
    var $ = $B.args("issuperset", 2, {self: null, other: null},
            ["self", "other"], arguments, {}, "args", null),
        self = $.self,
        other = $.other
    if(_b_.isinstance(other, [set, frozenset])){
        return set.issubset(other, self)
    }
    var frame = $B.last($B.frames_stack)
    for(var item of $B.next_of1(other, frame, frame.$lineno)){
        if(! set_contains(self, item)){
            return false
        }
    }
    return true
}

set.__iand__ = function(self, other){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.intersection_update(self, other)
    return self
}

set.__isub__ = function(self, other){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set_difference_update(self, other)
    return self
}

set.__ixor__ = function(self, other){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.symmetric_difference_update(self, other)
    return self
}

set.__ior__ = function(self, other){
    if(! _b_.isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.update(self, other)
    return self
}

set.$literal = function(items){
    var res = make_new_set(set)
    for(var item of items){
        set_add(res, item)
    }
    return res
}

set.$factory = function(){
    var args = [set].concat(Array.from(arguments)),
        self = set.__new__.apply(null, args)
    set.__init__(self, ...arguments)
    return self
}

$B.set_func_names(set, "builtins")

set.__class_getitem__ = _b_.classmethod.$factory(set.__class_getitem__)

var frozenset = $B.make_class('frozenset')
frozenset.$native = true

for(var attr in set){
    switch(attr) {
      case "add":
      case "clear":
      case "discard":
      case "pop":
      case "remove":
      case "update":
          break
      default:
          if(frozenset[attr] == undefined){
              if(typeof set[attr] == "function"){
                  frozenset[attr] = (function(x){
                      return function(){return set[x].apply(null, arguments)}
                  })(attr)
              }else{
                  frozenset[attr] = set[attr]
              }
          }
    }
}

// hash is allowed on frozensets
frozenset.__hash__ = function(self) {
   if(self === undefined){
      return frozenset.__hashvalue__ || $B.$py_next_hash--  // for hash of string type (not instance of string)
   }

   //taken from python repo /Objects/setobject.c
   if(self.__hashvalue__ !== undefined){
       return self.__hashvalue__
   }

   set_make_items(self)

   var _hash = 1927868237
   _hash *= self.$items.length

   for (var i = 0, len = self.$items.length; i < len; i++) {
      var _h = _b_.hash(self.$items[i])
      _hash ^= ((_h ^ 89869747) ^ (_h << 16)) * 3644798167
   }

   _hash = _hash * 69069 + 907133923

   if(_hash == -1){_hash = 590923713}

   return self.__hashvalue__ = _hash
}

frozenset.__init__ = function(){
    // does nothing, initialization is done in __new__
    return _b_.None
}

frozenset.__new__ = function(cls, iterable){
    if(cls === undefined){
        throw _b_.TypeError.$factory("frozenset.__new__(): not enough arguments")
    }
    var self = make_new_set(cls)

    if(iterable === undefined){
        return self
    }

    $B.check_nb_args_no_kw('__new__', 2, arguments)

    if(cls === frozenset && iterable.__class__ === frozenset){
        return iterable
    }

    // unlike set.__new__, frozenset.__new__ initializes from iterable
    set.update(self, iterable)
    return self
}

frozenset.__repr__ = function(self){
    $B.builtins_repr_check(frozenset, arguments) // in brython_builtins.js
    return set_repr(self)
}

frozenset.copy = function(self){
    if(self.__class__ === frozenset){
        return self
    }
    return set_copy(self)
}

// Singleton for empty frozensets
var singleton_id = Math.floor(Math.random() * Math.pow(2, 40))

function empty_frozenset(){
    var res = frozenset.__new__(frozenset)
    res.$id = singleton_id
    return res
}

frozenset.$factory = function(){
    var args = [frozenset].concat(Array.from(arguments)),
        self = frozenset.__new__.apply(null, args)
    frozenset.__init__(self, ...arguments)
    return self
}

$B.set_func_names(frozenset, "builtins")

_b_.set = set
_b_.frozenset = frozenset

})(__BRYTHON__)


