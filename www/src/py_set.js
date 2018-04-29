;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    $N = _b_.None

// set

// Create an object of the same type as obj
function create_type(obj){
    return $B.get_class(obj).$factory()
}

// Create a clone of the object : same type, same items
// Can't use general $B.clone because both objects would reference the same
// array $items
function clone(obj){
    var res = create_type(obj)
    res.$items = obj.$items.slice()
    return res
}

var set = {
    __class__: _b_.type,
    __module__: "builtins",
    __name__: "set",
    $is_class: true,
    $native: true
}

set.__add__ = function(self,other){
    throw _b_.TypeError.$factory(
        "unsupported operand type(s) for +: 'set' and " + typeof other)
}

set.__and__ = function(self, other, accept_iter){
    $test(accept_iter, other)
    var res = create_type(self)
    for(var i = 0, len = self.$items.length; i < len; i++){
        if(_b_.getattr(other, "__contains__")(self.$items[i])){
            set.add(res,self.$items[i])
        }
    }
    return res
}

set.__contains__ = function(self,item){
    if(self.$num && (typeof item == "number")){
        if(isNaN(item)){ // special case for NaN
            for(var i = self.$items.length-1; i >= 0; i--){
                if(isNaN(self.$items[i])){return true}
            }
            return false
        }else{
            return self.$items.indexOf(item) > -1
        }
    }
    if(self.$str && (typeof item == "string")){
        return self.$items.indexOf(item) > -1
    }
    if(! _b_.isinstance(item, set)){
        _b_.hash(item) // raises TypeError if item is not hashable
        // If item is a set, "item in self" is True if item compares equal to
        // one of the set items
    }
    for(var i = 0, len = self.$items.length; i < len;i++){
        if($B.rich_comp("__eq__", self.$items[i], item)){return true}
    }
    return false

}

set.__eq__ = function(self, other){
    // compare class set
    if(other === undefined){return self === set}

    if(_b_.isinstance(other, _b_.set)){
      if(other.$items.length == self.$items.length){
        for(var i = 0, len = self.$items.length; i < len; i++){
           if(set.__contains__(self, other.$items[i]) === false){return false}
        }
        return true
      }
      return false
    }

    if(_b_.isinstance(other, [_b_.list])){
      if(_b_.len(other) != self.$items.length){return false}

      for(var i = 0, len = _b_.len(other); i < len; i++){
         var _value = _b_.getattr(other, "__getitem__")(i)
         if(set.__contains__(self, _value) === false){return false}
      }
      return true
    }

    if(_b_.hasattr(other, "__iter__")) { // is an iterator
      if(_b_.len(other) != self.$items.length){return false}

      var _it = $B.$iter(other)

      while(1){
         try{
           var e = _b_.next(_it)
           if(!set.__contains__(self, e)){return false}
         }catch(err){
           if(err.__class__ === _b_.StopIteration){break}
           throw err
         }
      }
      return true
    }
    return false
}

set.__format__ = function(self, format_string){
    return set.__str__(self)
}

set.__ge__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        return ! set.__lt__(self, other)
    }else{
        return _b_.object.__ge__(self, other)
    }
}

set.__gt__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        return ! set.__le__(self, other)
    }else{
        return _b_.object.__gt__(self, other)
    }
}

set.__init__ = function(self){
    var $ = $B.args("__init__", 2, {self:null, iterable:null},
        ["self", "iterable"], arguments, {iterable:[]}, null,null),
        self = $.self,
        iterable = $.iterable

    if(_b_.isinstance(iterable, [set, frozenset])){
        self.$items = iterable.$items.slice()
        return $N
    }
    var it = $B.$iter(iterable),
        obj = {$items: [], $str: true, $num: true}
    while(1){
        try{
            var item = _b_.next(it)
            set.add(obj, item)
        }catch(err){
            if(_b_.isinstance(err, _b_.StopIteration)){break}
            throw err
        }
    }
    self.$items = obj.$items
    return $N
}

var $set_iterator = $B.$iterator_class("set iterator")
set.__iter__ = function(self){
    var it = $B.$iterator(self.$items, $set_iterator),
        len = self.$items.length,
        nxt = it.__next__
    it.__next__ = function(){
        if(it.__len__() != len){
            throw _b_.RuntimeError.$factory("size changed during iteration")
        }
        return nxt()
    }
    return it
}

set.__le__ = function(self, other){
    if(_b_.isinstance(other, [set, frozenset])){
        var cfunc = _b_.getattr(other,"__contains__")
        for(var i = 0, len = self.$items.length; i < len; i++){
            if(! cfunc(self.$items[i])){return false}
        }
        return true
    }else{
        return _b_.object.__le__(self, other)
    }
}

set.__len__ = function(self){return self.$items.length}

set.__lt__ = function(self,other){
    if(_b_.isinstance(other, [set, frozenset])){
        return set.__le__(self,other) &&
            set.__len__(self)<_b_.getattr(other,"__len__")()
    }else{
        return _b_.object["__lt__"](self, other) // try other > self
    }
}

set.__mro__ = [_b_.object]

set.__ne__ = function(self,other){return ! set.__eq__(self, other)}

set.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory("set.__new__(): not enough arguments")
    }
    return {
        __class__: cls,
        $str: true,
        $num: true,
        $items: []
        }
}

set.__or__ = function(self, other, accept_iter){
    //$test(accept_iter, other)  <===  is this needed?  causes some dict unittests to fail
    var res = clone(self),
        func = _b_.getattr($B.$iter(other), "__next__")
    while(1){
        try{set.add(res, func())}
        catch(err){
            if(_b_.isinstance(err, _b_.StopIteration)){break}
            throw err
        }
    }
    res.__class__ = self.__class__
    return res
}

set.__str__ = set.__repr__ = function(self){
    var frozen = self.$real === "frozen"
    self.$cycle = self.$cycle === undefined ? 0 : self.$cycle + 1
    if(self.$items.length === 0){
        if(frozen) {return "frozenset()"}
        return "set()"
    }
    var klass_name = $B.get_class(self).__name__,
        head = klass_name + "({",
        tail = "})"
    if(head == "set({"){head = "{"; tail = "}"}
    var res = []
    if(self.$cycle){
        self.$cycle--
        return klass_name + "(...)"
    }
    for(var i = 0, len = self.$items.length; i < len; i++){
        var r = _b_.repr(self.$items[i])
        if(r === self || r === self.$items[i]){res.push("{...}")}
        else{res.push(r)}
    }
    res = res.join(", ")
    self.$cycle--
    return head + res + tail
}

set.__sub__ = function(self, other, accept_iter){
    // Return a new set with elements in the set that are not in the others
    $test(accept_iter, other, "-")
    var res = create_type(self),
        cfunc = _b_.getattr(other, "__contains__")
    for(var i = 0, len = self.$items.length; i < len; i++){
        if(! cfunc(self.$items[i])){
            res.$items.push(self.$items[i])
        }
    }
    return res
}

set.__xor__ = function(self, other, accept_iter){
    // Return a new set with elements in either the set or other but not both
    $test(accept_iter, other, "^")
    var res = create_type(self),
        cfunc = _b_.getattr(other, "__contains__")
    for(var i = 0, len = self.$items.length; i < len; i++){
        if(! cfunc(self.$items[i])){
            set.add(res,self.$items[i])
        }
    }
    for(var i = 0, len = other.$items.length; i < len; i++){
        if(! set.__contains__(self, other.$items[i])){
            set.add(res, other.$items[i])
        }
    }
    return res
}

function $test(accept_iter, other, op){
    if(accept_iter === undefined &&
            ! _b_.isinstance(other, [set, frozenset])){
        throw _b_.TypeError.$factory("unsupported operand type(s) for " + op +
            ": 'set' and '" + $B.get_class(other).__name__ + "'")
    }
}

// add "reflected" methods
$B.make_rmethods(set)

set.add = function(){
    var $ = $B.args("add", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null),
        self = $.self,
        item = $.item
    _b_.hash(item)
    if(self.$str && !(typeof item == 'string')){self.$str = false}
    if(self.$num && !(typeof item == 'number')){self.$num = false}
    if(self.$num || self.$str){
        var ix = self.$items.indexOf(item)
        if(ix == -1){self.$items.push(item)}
        else{
            // issue 543 : for some Javascript implementations,
            // [''].indexOf(0) is 0, not -1, so {''}.add(0) is {''}
            if(item !== self.$items[ix]){self.$items.push(item)}
        }
        return $N
    }
    var cfunc = function(other){return $B.rich_comp("__eq__", item, other)}
    for(var i = 0, len = self.$items.length; i < len; i++){
        if(cfunc(self.$items[i])) {return $N}
    }
    self.$items.push(item)
    return $N
}

set.clear = function(){
    var $ = $B.args("clear", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    $.self.$items = []
    return $N
}

set.copy = function(){
    var $ = $B.args("copy", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    if(_b_.isinstance($.self, frozenset)){return $.self}
    var res = set.$factory() // copy returns an instance of set, even for subclasses
    for(var i = 0, len = $.self.$items.length; i < len; i++){
        res.$items[i] = $.self.$items[i]
    }
    return res
}

set.difference_update = function(self){
    var $ = $B.args("difference_update", 1, {self: null}, ["self"],
        arguments, {}, "args", null)
    for(var i = 0; i < $.args.length; i++){
        var s = set.$factory($.args[i]),
            _next = _b_.getattr($B.$iter(s), "__next__"),
            item
        while (true){
            try{
               item = _next()
               var _type = typeof item

               if(_type == "string" || _type == "number") {
                   var _index = self.$items.indexOf(item)
                   if(_index > -1){self.$items.splice(_index, 1)}
               }else{
                   for(var j = 0; j < self.$items.length; j++){
                       if($B.rich_comp("__eq__", self.$items[j], item)){
                         self.$items.splice(j, 1)
                       }
                   }
               }
           }catch(err){
               if(_b_.isinstance(err, _b_.StopIteration)){break}
               throw err
           }
        }
    }
    return $N
}

set.discard = function(){
    var $ = $B.args("discard", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null)
    try{set.remove($.self, $.item)}
    catch(err){
        if(!_b_.isinstance(err, [_b_.KeyError, _b_.LookupError])){throw err}
    }
    return $N
}

set.intersection_update = function(){
    // Update the set, keeping only elements found in it and all others.
    var $ = $B.args("intersection_update", 1, {self: null}, ["self"],
        arguments, {}, "args", null),
        self = $.self
    for(var i = 0; i < $.args.length; i++){
        var remove = [],
            s = set.$factory($.args[i])
        for(var j = 0; j < self.$items.length; j++){
            var _item = self.$items[j],
                _type = typeof _item
            if(_type == "string" || _type == "number") {
                if(s.$items.indexOf(_item) == -1){remove.push(j)}
            }else{
              var found = false
              for(var k = 0; ! found && k < s.$items.length; k++){
                if($B.rich_comp("__eq__", s.$items[k], _item)){found = true}
              }
              if(! found){remove.push(j)}
           }
       }
       remove.sort(function(x, y){return x - y}).reverse()
       for(var j = 0; j < remove.length; j++){
           self.$items.splice(remove[j], 1)
       }
    }
    return $N
}

set.isdisjoint = function(){
    var $ = $B.args("is_disjoint", 2,
        {self: null, other: null}, ["self", "other"],
        arguments, {}, null, null)
    for(var i = 0, len = $.self.$items.length; i < len; i++){
        if(_b_.getattr($.other, "__contains__")($.self.$items[i])){
            return false
        }
    }
    return true
}

set.pop = function(self){
    if(self.$items.length === 0){
        throw _b_.KeyError.$factory('pop from an empty set')
    }
    return self.$items.pop()
}

set.remove = function(self, item){
    // If item is a set, search if a frozenset in self compares equal to item
    var $ = $B.args("remove", 2, {self: null, item: null}, ["self", "item"],
        arguments, {}, null, null),
        self = $.self,
        item = $.item
    if(! _b_.isinstance(item, set)){_b_.hash(item)}
    if(typeof item == "string" || typeof item == "number"){
       var _i = self.$items.indexOf(item)
       if(_i == -1){throw _b_.KeyError.$factory(item)}
       self.$items.splice(_i, 1)
       return $N
    }
    for(var i = 0, len = self.$items.length; i < len; i++){
        if($B.rich_comp("__eq__", self.$items[i], item)){
            self.$items.splice(i, 1)
            return $N
        }
    }
    throw _b_.KeyError.$factory(item)
}

set.symmetric_difference_update = function(self, s){
    // Update the set, keeping only elements found in either set, but not in both.
    var $ = $B.args("symmetric_difference_update", 2,
        {self: null, s: null}, ["self", "s"], arguments, {}, null, null),
        self = $.self,
        s = $.s

    var _next = _b_.getattr($B.$iter(s), "__next__"),
        item,
        remove = [],
        add = []
    while(true){
        try{
           item = _next()
           var _type = typeof item

           if(_type == "string" || _type == "number") {
              var _index = self.$items.indexOf(item)
              if(_index > -1){remove.push(_index)}else{add.push(item)}
           }else{
              var found = false
              for(var j = 0; ! found && j < self.$items.length; j++){
                  if($B.rich_comp("__eq__", self.$items[j], item)){
                      remove.push(j)
                      found = true
                  }
              }
              if(! found){add.push(item)}
           }
       }catch(err){
           if(_b_.isinstance(err, _b_.StopIteration)){break}
           throw err
       }
    }
    remove.sort(function(x, y){return x - y}).reverse()
    for(var i = 0; i < remove.length; i++){
        if(remove[i] != remove[i - 1]){self.$items.splice(remove[i], 1)}
    }
    for(var i = 0; i < add.length; i++){set.add(self, add[i])}
    return $N
}

set.update = function(self){
    // Update the set, adding elements from all others.
    var $ = $B.args("update", 1, {self: null}, ["self"],
        arguments, {}, "args", null)
    for(var i = 0; i < $.args.length; i++){
        var other = set.$factory($.args[i])
        for(var j = 0, _len = other.$items.length; j < _len; j++) {
            set.add(self, other.$items[j])
        }
    }
    return $N
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
    if($.args.length == 0){return set.copy($.self)}

    var res = clone($.self)
    for(var i = 0; i < $.args.length; i++){
        res = set.__sub__(res, set.$factory($.args[i]))
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
        func = _b_.getattr($.other, "__contains__")
    for(var i = 0, len = $.self.$items.length; i < len; i++){
        if(! func($.self.$items[i])){return false}
    }
    return true
}

set.issuperset = function(){
    var $ = $B.args("issuperset", 2, {self: null, other: null},
        ["self", "other"], arguments, {}, "args", null)
    var func = _b_.getattr($.self, "__contains__"),
        it = $B.$iter($.other)
    while(true){
        try{
            var item = _b_.next(it)
            if(! func(item)){return false}
        }catch(err){
            if(_b_.isinstance(err, _b_.StopIteration)){return true}
            throw err
        }
    }
    return true
}

function $accept_only_set(f, op) {
    return function(self, other, accept_iter) {
        $test(accept_iter, other, op)
        f(self, other)
        return self
    }
}

set.__iand__ = $accept_only_set(set.intersection_update, "&=")
set.__isub__ = $accept_only_set(set.difference_update, "-=")
set.__ixor__ = $accept_only_set(set.symmetric_difference_update, "^=")
set.__ior__ = $accept_only_set(set.update, "|=")

set.$factory = function(){
    // Instances of set have attributes $str and $num
    // $str is true if all the elements in the set are string, $num if
    // all the elements are integers
    // They are used to speed up operations on sets
    var res = {__class__: set, $str: true, $num: true, $items: []}
    // apply __init__ with arguments of set()
    var args = [res].concat(Array.prototype.slice.call(arguments))
    set.__init__(res, ...arguments)
    return res
}

$B.set_func_names(set, "builtins")

var frozenset = {
    __class__: _b_.type,
    __module__: "builtins",
    __mro__: [object],
    __name__: "frozenset",
    $is_class: true,
    $native: true
}

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

   if(self.__hashvalue__ !== undefined){return self.__hashvalue__}

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
    // doesn't do anything
    return $N
}

frozenset.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory(
            "frozenset.__new__(): not enough arguments")
    }
    return {
        __class__: cls,
        $str: true,
        $num: true,
        $items: []
        }
}

// Singleton for empty frozensets
var singleton_id = Math.floor(Math.random() * Math.pow(2, 40))
function empty_frozenset(){
    return {
        __class__: frozenset,
        $items: [],
        $id: singleton_id
    }
}

frozenset.$factory = function(){
    var $ = $B.args("frozenset", 1, {iterable: null}, ["iterable"],
        arguments, {iterable: null}, null, null)
    if($.iterable === null){return empty_frozenset()}
    else if($.iterable.__class__ == frozenset){return $.iterable}

    var res = set.$factory($.iterable)
    if(res.$items.length == 0){return empty_frozenset()}
    res.__class__ = frozenset
    return res
}

$B.set_func_names(frozenset, "builtins")

_b_.set = set
_b_.frozenset = frozenset

})(__BRYTHON__)
