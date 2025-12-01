"use strict";
(function($B){

var _b_ = $B.builtins,
    $N = _b_.None

function make_new_set(type){
    var res = {
        __class__: type,
        $store: Object.create(null),
        $version: 0,
        $used: 0
    }
    res[Symbol.iterator] = function*(){
        var version = res.$version
        for(var item of set_iter(res)){
            yield item
            if(res.$version != version){
                $B.RAISE(_b_.RuntimeError,
                    'Set changed size during iteration')
            }
        }
    }

    return res
}

function make_new_set_base_type(so){
    return $B.$isinstance(so, set) ?
               set.$factory() :
               frozenset.$factory()
}

function set_add(so, item, hash){
    hash = hash ?? $B.$hash(item)
    var stored = so.$store[hash]
    if(stored && set_contains(so, item, hash)){
        return
    }else{
        stored = so.$store[hash] = []
        stored[stored.length] = item
        so.$used++
        so.$version++
    }
}

function set_contains(so, key, hash){
    return !! set_lookkey(so, key, hash)
}

// Create a copy of the object : same type, same items
function set_copy(obj){
    var res = make_new_set_base_type(obj) // set or frozenset
    for(var hash in obj.$store){
        res.$store[hash] = obj.$store[hash].slice()
    }
    res.$used = obj.$used
    return res
}

var set = $B.make_class('set')
set.$native = true

function set_copy_and_difference(so, other){
    var result = set_copy(so)
    set_difference_update(result, other)
    return result
}

function set_difference(so, other){
    var other_size,
        other_is_dict

    if($B.$isinstance(other, [set, frozenset])){
        other_size = set.__len__(other)
    }else if($B.$isinstance(other, _b_.dict)){
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

    var result = make_new_set()

    if(other_is_dict){
        for(let entry of set_iter_with_hash(so)){
            if(! _b_.dict.$lookup_by_key(other, entry.item, entry.hash).found){
                set_add(result, entry.item, entry.hash)
            }
        }
        return result
    }

    /* Iterate over so, checking for common elements in other. */
    for(let entry of set_iter_with_hash(so)){
        if(! set_contains(other, entry.item, entry.hash)){
            set_add(result, entry.item, entry.hash)
        }
    }

    result.__class__ = so.__class__
    return result
}

function set_difference_update(so, other){
    if(so === other){
        return set.clear(so);
    }
    if($B.$isinstance(other, [set, frozenset])){
        for(let entry of set_iter_with_hash(other)){
            set_discard_entry(so, entry.item, entry.hash)
        }
    }else if($B.$isinstance(other, _b_.dict)){
        for(let entry of _b_.dict.$iter_items(other)){
            set_discard_entry(so, entry.key, entry.hash)
        }
    }else{
        var iterator = $B.make_js_iterator(other)
        for(let key of iterator){
            set_discard_key(so, key)
        }
    }
}

const DISCARD_NOTFOUND = 0

function set_discard_entry(so, key, hash){
    var entry = set_lookkey(so, key, hash)
    if(! entry){
        return DISCARD_NOTFOUND
    }
    if(so.$store[entry.hash] !== undefined){
        // set_lookkey might have removed the entry...
        set_remove(so, entry.hash, entry.index)
    }
}

function set_discard_key(so, key){
    return set_discard_entry(so, key);
}

function* set_iter(so){
    var ordered_keys = Object.keys(so.$store).sort()
    for(var hash of ordered_keys){
        if(so.$store[hash] !== undefined){
            for(var item of so.$store[hash]){
                yield item
            }
        }
    }
}


function* set_iter_with_hash(so){
    for(var hash in so.$store){
        if(so.$store[hash] !== undefined){
            for(var item of so.$store[hash]){
                yield {item, hash}
            }
        }
    }
}

function set_remove(so, hash, index){
    so.$store[hash].splice(index, 1)
    if(so.$store[hash].length == 0){
        delete so.$store[hash]
    }
    so.$used--
}

function set_intersection(so, other){
    // set of items present in self and in other
    if(so === other){
        return set_copy(so)
    }
    var result = make_new_set_base_type(so)

    if($B.$isinstance(other, [set, frozenset])){
        if(other.$used > so.$used){
            var tmp = so
            so = other
            other = tmp
        }
        for(let entry of set_iter_with_hash(other)){
            if(set_contains(so, entry.item, entry.hash)){
                set_add(result, entry.item, entry.hash)
            }
        }
    }else if($B.$isinstance(other, _b_.dict)){
        for(let entry of _b_.dict.$iter_items(other)){
            if(set_contains(so, entry.key, entry.hash)){
                set_add(result, entry.key, entry.hash)
            }
        }
    }else{
        let iterator = $B.make_js_iterator(other)

        for(var other_item of iterator){
            var test = set_contains(so, other_item)
            if(test){
                set_add(result, other_item)
            }
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
    // Returns false if key not found in set so, else returns
    // {hash, index} where index is such that so[hash][index] == key
    if(hash === undefined){
        try{
            hash = $B.$hash(key)
        }catch(err){
            if($B.$isinstance(key, set)){
                hash = $B.$hash(frozenset.$factory(key))
            }else{
                if(err.args && err.args[0]){
                    err.args[0] = `cannot use '${$B.class_name(key)}' as ` +
                        `a set element (${err.args[0]})`
                }
                throw err
            }
        }
    }
    var items = so.$store[hash]
    if(items === undefined){
        return false
    }
    for(var index = 0, len = so.$store[hash].length; index < len; index++){
        if($B.is_or_equals(key, items[index])){
            return {hash, index}
        }
    }
    return false
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
    if(so == other){
        return set.clear(so)
    }
    if($B.$isinstance(other, _b_.dict)){
        for(let entry of _b_.dict.$iter_items(other)){
            let rv = set_discard_entry(so, entry.key, entry.hash)
            if(rv == DISCARD_NOTFOUND){
                set_add(so, entry.key, entry.hash)
            }
        }
    }else if($B.$isinstance(other, [set, frozenset])){
        for(let entry of set_iter_with_hash(other)){
            let rv = set_discard_entry(so, entry.item, entry.hash)
            if(rv == DISCARD_NOTFOUND){
                set_add(so, entry.item, entry.hash)
            }
        }
    }else{
        return set_symmetric_difference_update(so, set.$factory(other))
    }
    return _b_.None
}

set.__and__ = function(self, other){
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    return set_intersection(self, other)
}

set.__class_getitem__ = $B.$class_getitem

set.__contains__ = function(self, item){
    return set_contains(self, item)
}

set.__eq__ = function(self, other){
    if($B.$isinstance(other, [_b_.set, _b_.frozenset])){
      if(self.$used != other.$used){
          return false
      }
      for(var hash in self.$store){
          if(other.$store[hash] === undefined){
              return false
          }
          var in_self = self.$store[hash],
              in_other = other.$store[hash]
          if(in_self === undefined || in_other === undefined){
              // might have been removed by $B.is_or_equals()
              return false
          }
          if(in_self.length != in_other.length){
              return false
          }
          if(in_self.length == 1){
              if(! $B.is_or_equals(in_self[0], in_other[0])){
                  return false
              }
          }else{
              in_self = in_self.slice()
              in_other = in_other.slice()
              for(var self_item of in_self){
                  var found = false
                  for(var i = 0, len = in_other.length; i < len; i++){
                      if($B.is_or_equals(self_item, in_other[i])){
                          in_other.splice(i, 1)
                          found = true
                          break
                      }
                  }
                  if(! found){
                      return false
                  }
              }
          }
      }
      return true
    }
    return _b_.NotImplemented
}

set.__format__ = function(self){
    return set.__repr__(self)
}

set.__ge__ = function(self, other){
    if($B.$isinstance(other, [set, frozenset])){
        return set.__le__(other, self)
    }
    return _b_.NotImplemented
}

set.__gt__ = function(self, other){
    if($B.$isinstance(other, [set, frozenset])){
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

var set_iterator = $B.make_class('set_iterator',
    function(so){
        return {
            __class__: set_iterator,
            so,
            it: set_iter(so),
            version: so.$version
        }
    }
)

set_iterator.__iter__ = function(self){
    return self
}

set_iterator.__length_hint__ = function(self){
    return self.so.$used
}

set_iterator.__next__ = function(self){
    var res = self.it.next()
    if(res.done){
        $B.RAISE(_b_.StopIteration, )
    }
    if(self.so.$version != self.version){
        $B.RAISE(_b_.RuntimeError, "Set changed size during iteration")
    }
    return res.value
}

set_iterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter,
                          $B.fast_tuple([set_make_items(self.so)])])
}

$B.set_func_names(set_iterator, 'builtins')

set.__iter__ = function(self){
    return set_iterator.$factory(self)
}

function set_make_items(so){
    // make so.$items
    var items = []
    for(var hash in so.$store){
        items = items.concat(so.$store[hash])
    }
    return $B.$list(items)
}

set.__le__ = function(self, other){
    // Test whether every element in the set is in other.
    if($B.$isinstance(other, [set, frozenset])){
        return set.issubset(self, other)
    }
    return _b_.NotImplemented
}

set.__len__ = function(self){
    return self.$used
}

set.__lt__ = function(self, other){
    if($B.$isinstance(other, [set, frozenset])){
        return set.__le__(self, other) &&
            set.__len__(self) < set.__len__(other)
    }else{
        return _b_.NotImplemented
    }
}

set.__mro__ = [_b_.object]

set.__new__ = function(cls, iterable){
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "set.__new__(): not enough arguments")
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

set.__or__ = function(self, other){
    if($B.$isinstance(other, [set, frozenset])){
        return set.union(self, other)
    }
    return _b_.NotImplemented
}

set.__rand__ = function(self, other){
    // Used when other.__and__(self) is NotImplemented
    return set.__and__(self, other)
}

set.__reduce__ = function(self){
    return $B.fast_tuple([self.__class__,
                         $B.fast_tuple([set_make_items(self)]),
                         _b_.None])
}

set.__reduce_ex__ = function(self){
    return set.__reduce__(self)
}

set.__repr__ = function(self){
    $B.builtins_repr_check(set, arguments) // in brython_builtins.js
    return set_repr(self)
}

function set_repr(self){
    // shared between set and frozenset
    var klass_name = $B.class_name(self)
    if(self.$used === 0){
        return klass_name + "()"
    }
    var head = klass_name + "({",
        tail = "})"
    if(head == "set({"){head = "{"; tail = "}"}
    var res = []
    if($B.repr.enter(self)){
        return klass_name + "(...)"
    }
    for(var item of set_iter(self)){
        var r = _b_.repr(item)
        if(r === self || r === item){res.push("{...}")}
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

set.__sub__ = function(self, other){
    // Return a new set with elements in the set that are not in the others
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    return set_difference(self, other)
}

set.__xor__ = function(self, other){
    // Return a new set with elements in either the set or other but not both
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    var res = make_new_set()
    for(let entry of set_iter_with_hash(self)){
        if(! set_contains(other, entry.item, entry.hash)){
            set_add(res, entry.item, entry.hash)
        }
    }
    for(let entry of set_iter_with_hash(other)){
        if(! set_contains(self, entry.item, entry.hash)){
            set_add(res, entry.item, entry.hash)
        }
    }
    res.__class__ = self.__class__
    return res
}

// add "reflected" methods
$B.make_rmethods(set)

set.add = function(self, item){
    $B.check_nb_args_no_kw('set.add', 2, arguments)
    set_add(self, item)
    return _b_.None
}

set.clear = function(self){
    $B.check_nb_args_no_kw('set.clear', 1, arguments)
    self.$used = 0
    self.$store = Object.create(null)
    self.$version++
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

set.discard = function(self, item){
    $B.check_nb_args_no_kw('set.discard', 2, arguments)
    var result = set_discard_entry(self, item)
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

set.isdisjoint = function(self, other){
    /* Return True if the set has no elements in common with other. Sets are
    disjoint if and only if their intersection is the empty set. */
    $B.check_nb_args_no_kw('set.isdisjoint', 2, arguments)
    var intersection = set_intersection(self, other)
    return intersection.$used == 0
}

set.pop = function(self){
    if(arguments.length > 1){
        $B.RAISE(_b_.TypeError, `set.pop() takes no arguments` +
            ` (${arguments.length - 1} given)`)
    }
    for(var hash in self.$store){
        break
    }
    if(hash === undefined){
        $B.RAISE(_b_.KeyError, 'pop from an empty set')
    }
    var item
    item = self.$store[hash].pop()
    if(self.$store[hash].length == 0){
        delete self.$store[hash]
    }
    self.$used--
    self.$version++
    return item
}

set.remove = function(self, item){
    // If item is a set, search if a frozenset in self compares equal to item
    $B.check_nb_args_no_kw('set.remove', 2, arguments)
    var result = set_discard_entry(self, item)
    if(result == DISCARD_NOTFOUND){
        $B.RAISE(_b_.KeyError, item)
    }
    self.$version++
    return _b_.None
}

set.symmetric_difference_update = function(self, s){
    // Update the set, keeping only elements found in either set, but not in both.
    $B.check_nb_args_no_kw('set.symmetric_difference_update', 2, arguments)
    return set_symmetric_difference_update(self, s)
}

set.update = function(self){
    // Update the set, adding elements from all others.
    var $ = $B.args("update", 1, {self: null}, ["self"],
        arguments, {}, "args", null)
    for(var iterable of $.args){
        if(Array.isArray(iterable)){
            for(let i = 0; i < iterable.length; i++){
                set_add(self, iterable[i])
            }
        }else if($B.$isinstance(iterable, [set, frozenset])){
            for(let entry of set_iter_with_hash(iterable)){
                set_add(self, entry.item, entry.hash)
            }
        }else if($B.$isinstance(iterable, _b_.dict)){
            for(let entry of _b_.dict.$iter_items(iterable)){
                set_add(self, entry.key, entry.hash)
            }
        }else{
            console.log('set update from iterable', iterable)
            var iterator = $B.make_js_iterator(iterable)
            for(let item of iterator){
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
        if($B.$isinstance(arg, [set, frozenset])){
            for(var entry of set_iter_with_hash(arg)){
                set_discard_entry(res, entry.item, entry.hash)
            }
        }else{
            var other = set.$factory(arg)
            res = set.difference(res, other)
        }
    }
    return res
}

set.intersection = function(){
    var $ = $B.args("difference", 1, {self: null},
        ["self"], arguments, {}, "args", null)
    if($.args.length == 0){
        return set.copy($.self)
    }
    return set_intersection_multi($.self, $.args)
}

set.symmetric_difference = function(self, other){
    // Return a new set with elements in either the set or other but not both
    $B.check_nb_args_no_kw('set.symmetric_difference', 2, arguments)
    var res = set_copy(self)
    set_symmetric_difference_update(res, other)
    return res
}

set.union = function(){
    var $ = $B.args("union", 1, {self: null},
        ["self"], arguments, {}, "args", null)

    let res = set_copy($.self)
    if($.args.length == 0){
        return res
    }

    for(let arg of $.args){
        if($B.$isinstance(arg, [set, frozenset])){
            for(let entry of set_iter_with_hash(arg)){
                set_add(res, entry.item, entry.hash)
            }
        }else if(arg.__class__ === _b_.dict){
            // dict.$iter_items_hash produces [key, value, hash]
            for(let entry of _b_.dict.$iter_items(arg)){
                set_add(res, entry.key, entry.hash)
            }
        }else{
            let other = set.$factory(arg)
            res = set.union(res, other)
        }
    }
    return res
}

set.issubset = function(self, other){
    // Test whether every element in the set is in other.
    $B.check_nb_args_no_kw('set.issubset', 2, arguments)
    if($B.$isinstance(other, [set, frozenset])){
        if(set.__len__(self) > set.__len__(other)){
            return false
        }
        for(let entry of set_iter_with_hash(self)){
            if(! set_lookkey(other, entry.item, entry.hash)){
                return false
            }
        }
        return true
    }else if($B.$isinstance(other, _b_.dict)){
        for(let entry of _b_.dict.$iter_items(self)){
            if(! set_lookkey(other, entry.key, entry.hash)){
                return false
            }
        }
        return true
    }else{
        var member_func = $B.member_func(other)
        for(let entry of set_iter_with_hash(self)){
            if(! member_func(entry.item)){
                return false
            }
        }
        return true
    }
}

set.issuperset = function(self, other){
    // Test whether every element in other is in the set.
    $B.check_nb_args_no_kw('set.issuperset', 2, arguments)
    if($B.$isinstance(other, [set, frozenset])){
        return set.issubset(other, self)
    }else{
        return set.issubset(set.$factory(other), self)
    }
}

set.__iand__ = function(self, other){
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.intersection_update(self, other)
    return self
}

set.__isub__ = function(self, other){
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set_difference_update(self, other)
    return self
}

set.__ixor__ = function(self, other){
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.symmetric_difference_update(self, other)
    return self
}

set.__ior__ = function(self, other){
    if(! $B.$isinstance(other, [set, frozenset])){
        return _b_.NotImplemented
    }
    set.update(self, other)
    return self
}

set.$literal = function(items){
    let res = make_new_set(set)
    for(let item of items){
        if(item.constant){
            set_add(res, item.constant[0], item.constant[1])
        }else if(item.starred){
            for(let _item of $B.make_js_iterator(item.starred)){
                set_add(res, _item)
            }
        }else{
            set_add(res, item.item)
        }
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
                      return function(){
                          return set[x].apply(null, arguments)
                      }
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

   var _hash = 1927868237
   _hash *= self.$used

   for(var entry of set_iter_with_hash(self)) {
      var _h = entry.hash
      _hash ^= ((_h ^ 89869747) ^ (_h << 16)) * 3644798167
   }

   _hash = _hash * 69069 + 907133923

   if(_hash == -1){
       _hash = 590923713
   }

   return self.__hashvalue__ = _hash
}

frozenset.__init__ = function(){
    // does nothing, initialization is done in __new__
    return _b_.None
}

frozenset.__new__ = function(cls, iterable){
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "frozenset.__new__(): not enough arguments")
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

frozenset.$factory = function(){
    var args = [frozenset].concat(Array.from(arguments)),
        self = frozenset.__new__.apply(null, args)
    frozenset.__init__(self, ...arguments)
    return self
}

$B.set_func_names(frozenset, "builtins")

_b_.set = set
_b_.frozenset = frozenset

})(__BRYTHON__);


