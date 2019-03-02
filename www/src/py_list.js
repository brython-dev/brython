;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    getattr = $B.$getattr,
    isinstance = _b_.isinstance,
    $N = _b_.None

function check_not_tuple(self, attr){
    if(self.__class__ === tuple){
        throw _b_.AttributeError.$factory(
            "'tuple' object has no attribute '" + attr +"'")
    }
}

function $list(){
    // used for list displays
    // different from list : $list(1) is valid (matches [1])
    // but list(1) is invalid (integer 1 is not iterable)
    return list.$factory.apply(null, arguments)
}

var list = {
    __class__: _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "builtins",
        __name__: "list"
    },
    $is_class: true,
    $native: true,
    __dir__: object.__dir__
}

list.__add__ = function(self, other){
    if($B.get_class(self) !== $B.get_class(other)){
        var radd = getattr(other, "__radd__", _b_.NotImplemented)
        if(radd !== _b_.NotImplemented){return radd(self)}
        throw _b_.TypeError.$factory('can only concatenate list (not "' +
            $B.class_name(other) + '") to list')
    }
    var res = self.valueOf().concat(other.valueOf())
    res.__brython__ = true
    if(isinstance(self, tuple)){res = tuple.$factory(res)}
    return res
}

list.__contains__ = function(self,item){
    var $ = $B.args("__contains__", 2, {self: null, item: null},
        ["self", "item"], arguments, {}, null, null),
        self = $.self,
        item = $.item
    var _eq = function(other){return $B.rich_comp("__eq__", item, other)}
    var i = 0
    while(i < self.length) {
        if(_eq(self[i])){return true}
        i++
    }
    return false
}

list.__delitem__ = function(self, arg){

    if(isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0){pos = self.length + pos}
        if(pos >= 0 && pos < self.length){
            self.splice(pos, 1)
            return $N
        }
        throw _b_.IndexError.$factory("list index out of range")
    }
    if(isinstance(arg, _b_.slice)) {
        var step = arg.step
        if(step === $N){step = 1}
        var start = arg.start
        if(start === $N){start = step > 0 ? 0 : self.length}
        var stop = arg.stop
        if(stop === $N){stop = step > 0 ? self.length : 0}
        if(start < 0){start = self.length + start}
        if(stop < 0){stop = self.length + stop}
        var res = [],
            i = null,
            pos = 0
        if(step > 0){
            if(stop > start){
                for(var i = start; i < stop; i += step){
                    if(self[i] !== undefined){res[pos++] = i}
                }
            }
        }else{
            if(stop < start){
                for(var i = start; i > stop; i += step){
                    if(self[i] !== undefined){res[pos++] = i}
                }
                res.reverse() // must be in ascending order
            }
        }
        // delete items from left to right
        var i = res.length
        while(i--){
           self.splice(res[i], 1)
        }
        return $N
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__delitem__(self, _b_.int.$factory(arg))
       return $N
    }

    throw _b_.TypeError.$factory("list indices must be integer, not " +
        _b_.str.$factory(arg.__class__))
}

list.__eq__ = function(self, other){
    if(isinstance(self, list)){var klass = list}else{var klass = tuple}
    if(isinstance(other, klass)){
       if(other.length == self.length){
            var i = self.length
            while(i--){
                if(! $B.rich_comp("__eq__", self[i], other[i])){return false}
            }
            return true
       }
    }
    return _b_.NotImplemented
}

list.__getitem__ = function(self, arg){
    var $ = $B.args("__getitem__",2,{self: null, key: null},
        ["self", "key"], arguments, {}, null, null),
        self = $.self,
        key = $.key

    var factory = $B.get_class(self).$factory

    if(isinstance(key, _b_.int)){
        var items = self.valueOf(),
            pos = key
        if(key < 0){pos = items.length + pos}
        if(pos >= 0 && pos < items.length){return items[pos]}

        throw _b_.IndexError.$factory("list index out of range")
    }
    if(isinstance(key, _b_.slice)){
        // Find integer values for start, stop and step
        var s = _b_.slice.$conv_for_seq(key, self.length)
        // Return the sliced list
        var res = [],
            i = null,
            items = self.valueOf(),
            pos = 0,
            start = s.start,
            stop = s.stop,
            step = s.step
        if(step > 0){
            if(stop <= start){return factory(res)}
            for(var i = start; i < stop; i += step) {
               res[pos++] = items[i]
            }
            return factory(res)
        }else{
            if(stop > start){return factory(res)}
            for(var i = start; i > stop; i += step) {
               res[pos++] = items[i]
            }
            return factory(res)
        }
    }

    if(_b_.hasattr(key, "__int__") || _b_.hasattr(key, "__index__")){
       return list.__getitem__(self, _b_.int.$factory(key))
    }

    throw _b_.TypeError.$factory("list indices must be integer, not " +
        $B.class_name(key))
}

list.__ge__ = function(self, other){
    if(! isinstance(other, [list, _b_.tuple])){
        return _b_.NotImplemented
    }
    var i = 0
    while(i < self.length){
        if(i >= other.length){return true}
        if($B.rich_comp("__eq__", self[i], other[i])){i++}
        else{
            res = getattr(self[i], "__ge__")(other[i])
            if(res === _b_.NotImplemented){
                throw _b_.TypeError.$factory("unorderable types: " +
                    $B.class_name(self[i])  + "() >= " +
                    $B.class_name(other[i]) + "()")
            }else{return res}
        }
    }

    return other.length == self.length
}

list.__gt__ = function(self, other){
    if(! isinstance(other, [list, _b_.tuple])){
        return _b_.NotImplemented
    }
    var i = 0
    while(i < self.length){
        if(i >= other.length){return true}
        if($B.rich_comp("__eq__", self[i], other[i])){i++}
        else{
            res = getattr(self[i], "__gt__")(other[i])
            if(res === _b_.NotImplemented){
                throw _b_.TypeError.$factory("unorderable types: " +
                    $B.class_name(self[i]) + "() > " +
                    $B.class_name(other[i]) + "()")
            }else return res
        }
    }
    // other starts like self, but is as long or longer
    return false
}

list.__hash__ = $N

list.__iadd__ = function() {
    var $ = $B.args("__iadd__", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    var radd = getattr($.x, "__radd__", _b_.NotImplemented)
    if(radd !== _b_.NotImplemented){return radd($.self)}
    var x = list.$factory($B.$iter($.x))
    for(var i = 0; i < x.length; i++){
        $.self.push(x[i])
    }
    return $.self
}

list.__imul__ = function() {
    var $ = $B.args("__imul__", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null),
        x = $B.$GetInt($.x),
        len = $.self.length,
        pos = len
    if(x == 0){list.clear($.self); return $.self}
    for(var i = 1; i < x; i++){
        for(j = 0; j < len; j++){
            $.self[pos++] = $.self[j]
        }
    }
    return $.self
}

list.__init__ = function(self, arg){
    var len_func = $B.$call(getattr(self, "__len__")),
        pop_func = getattr(self, "pop", $N)
    if(pop_func !== $N){
        pop_func = $B.$call(pop_func)
        while(len_func()){pop_func()}
    }
    if(arg === undefined){return $N}
    var arg = $B.$iter(arg),
        next_func = $B.$call(getattr(arg, "__next__")),
        pos = len_func()
    while(1){
        try{
            var res = next_func()
            self[pos++] = res
        }catch(err){
            if(err.__class__ === _b_.StopIteration){
                break
            }
            else{throw err}
        }
    }
    return $N
}

var $list_iterator = $B.$iterator_class("list_iterator")
$list_iterator.__reduce__ = $list_iterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([list.$factory(self)]), 0])
}

list.__iter__ = function(self){
    return $B.$iterator(self, $list_iterator)
}

list.__le__ = function(self, other){
    var res = list.__ge__(self, other)
    if(res === _b_.NotImplemented){return res}
    return ! res
}

list.__len__ = function(self){
    return self.length
}

list.__lt__ = function(self, other){
    if(! isinstance(other, [list, _b_.tuple])){
        return _b_.NotImplemented
    }
    var i = 0
    while(i < self.length){
        if(i >= other.length){return true}
        if($B.rich_comp("__eq__", self[i], other[i])){
            i++
        }else{
            res = getattr(self[i], "__lt__")(other[i])
            if(res === _b_.NotImplemented){
                throw _b_.TypeError.$factory("unorderable types: " +
                    $B.class_name(self[i])  + "() >= " +
                    $B.class_name(other[i]) + "()")
            }else{return res}
        }
    }
    // If all items are equal, return True if other is longer
    // Cf. issue #941
    return other.length > self.length
}

list.__mul__ = function(self, other){
    if(isinstance(other, _b_.int)) {  //this should be faster..
       var res = [],
           $temp = self.slice(),
           len = $temp.length
       for(var i = 0; i < other; i++){
           for(var j = 0; j < len; j++){res.push($temp[j])}
       }
       res.__class__ = self.__class__
       return res
    }

    if(_b_.hasattr(other, "__int__") || _b_.hasattr(other, "__index__")){
       return list.__mul__(self, _b_.int.$factory(other))
    }

    var rmul = $B.$getattr(other, "__rmul__", _b_.NotImplemented)
    if(rmul !== _b_.NotImplemented){
        return rmul(self)
    }

    throw _b_.TypeError.$factory(
        "can't multiply sequence by non-int of type '" +
        $B.class_name(other) + "'")
}

list.__new__ = function(cls, ...args){
    if(cls === undefined){
        throw _b_.TypeError.$factory("list.__new__(): not enough arguments")
    }
    var res = []
    res.__class__ = cls
    res.__brython__ = true
    res.__dict__ = _b_.dict.$factory()
    return res
}


list.__repr__ = function(self){
    if(self === undefined){return "<class 'list'>"}

    var _r = []
    for(var i = 0; i < self.length; i++){
        if(self[i] === self){_r.push('[...]')}
        else{_r.push(_b_.repr(self[i]))}
    }

    if(self.__class__ === tuple){
        if(self.length == 1){return "(" + _r[0] + ",)"}
        return "(" + _r.join(", ") + ")"
    }
    return "[" + _r.join(", ") + "]"
}

list.__setattr__ = function(self, attr, value){
    if(self.__class__ === list){
        if(list.hasOwnProperty(attr)){
            throw _b_.AttributeError.$factory("'list' object attribute '" +
                attr + "' is read-only")
        }else{
            throw _b_.AttributeError.$factory(
                "'list' object has no attribute '" + attr + "'")
        }
    }
    // list subclass : use __dict__
    self.__dict__.$string_dict[attr] = value
    return $N
}

list.__setitem__ = function(){
    var $ = $B.args("__setitem__", 3, {self: null, key: null, value: null},
        ["self", "key", "value"], arguments, {}, null, null),
        self = $.self,
        arg = $.key,
        value = $.value
    list.$setitem(self, arg, value)
}

list.$setitem = function(self, arg, value){
    // Used internally to avoid using $B.args
    if(typeof arg == "number" || isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0) {pos = self.length + pos}
        if(pos >= 0 && pos < self.length){self[pos] = value}
        else {throw _b_.IndexError.$factory("list index out of range")}
        return $N
    }
    if(isinstance(arg, _b_.slice)){
        var s = _b_.slice.$conv_for_seq(arg, self.length)
        if(arg.step === null){$B.set_list_slice(self, s.start, s.stop, value)}
        else{$B.set_list_slice_step(self, s.start, s.stop, s.step, value)}
        return $N
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__setitem__(self, _b_.int.$factory(arg), value)
       return $N
    }

    throw _b_.TypeError.$factory("list indices must be integer, not " +
        $B.class_name(arg))
}

// there is no list.__str__

// add "reflected" methods
$B.make_rmethods(list)

var _ops = ["add", "sub"]

list.append = function(){
    var $ = $B.args("append", 2 ,{self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    $.self[$.self.length] = $.x
    return $N
}

list.clear = function(){
    var $ = $B.args("clear", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    while($.self.length){$.self.pop()}
    return $N
}

list.copy = function(){
    var $ = $B.args("copy", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    return $.self.slice()
}

list.count = function(){
    var $ = $B.args("count", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    var res = 0,
        _eq = function(other){return $B.rich_comp("__eq__", $.x, other)},
        i = $.self.length
    while(i--){if(_eq($.self[i])){res++}}
    return res
}

list.extend = function(){
    var $ = $B.args("extend", 2, {self: null, t: null}, ["self", "t"],
        arguments, {}, null, null)
    var other = list.$factory($B.$iter($.t))
    for(var i = 0; i < other.length; i++){$.self.push(other[i])}
    return $N
}

list.index = function(){
    var $ = $B.args("index", 4, {self: null, x: null, start: null, stop: null},
        ["self", "x", "start" ,"stop"], arguments,
        {start: null, stop: null}, null, null),
        self = $.self,
        start = $.start,
        stop = $.stop
    var _eq = function(other){return $B.rich_comp("__eq__", $.x, other)}
    if(start === null){start = 0}
    else{
        if(start.__class__ === $B.long_int){
            start = parseInt(start.value) * (start.pos ? 1 : -1)
        }
        if(start < 0){start = Math.max(0, start + self.length)}
    }
    if(stop === null){stop = self.length}
    else{
        if(stop.__class__ === $B.long_int){
            stop = parseInt(stop.value) * (stop.pos ? 1 : -1)
        }
        if(stop < 0){stop = Math.min(self.length, stop + self.length)}
    }
    for(var i = start; i < stop; i++){
        if(_eq(self[i])){return i}
    }
    throw _b_.ValueError.$factory(_b_.str.$factory($.x) + " is not in list")
}

list.insert = function(){
    var $ = $B.args("insert", 3, {self: null, i: null, item: null},
        ["self", "i", "item"], arguments, {}, null, null)
    $.self.splice($.i,0,$.item)
    return $N
}

list.pop = function(){
    var missing = {}
    var $ = $B.args("pop", 2, {self: null, pos: null}, ["self", "pos"],
        arguments, {pos: missing}, null, null),
        self = $.self,
        pos = $.pos
    check_not_tuple(self, "pop")
    if(pos === missing){pos = self.length - 1}
    pos = $B.$GetInt(pos)
    if(pos < 0){pos += self.length}
    var res = self[pos]
    if(res === undefined){
        throw _b_.IndexError.$factory("pop index out of range")
    }
    self.splice(pos, 1)
    return res
}

list.remove = function(){
    var $ = $B.args("remove", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    for(var i = 0, len = $.self.length; i < len; i++){
        if($B.rich_comp("__eq__", $.self[i], $.x)){
            $.self.splice(i, 1)
            return $N
        }
    }
    throw _b_.ValueError.$factory(_b_.str.$factory($.x) + " is not in list")
}

list.reverse = function(self){
    var $ = $B.args("reverse", 1, {self: null}, ["self"],
        arguments, {}, null, null),
        _len = $.self.length - 1,
        i = parseInt($.self.length / 2)
    while(i--){
        var buf = $.self[i]
        $.self[i] = $.self[_len - i]
        $.self[_len - i] = buf
    }
    return $N
}

// QuickSort implementation found at http://en.literateprograms.org/Quicksort_(JavaScript)
function $partition(arg, array, begin, end, pivot)
{
    var piv = array[pivot]
    array = swap(array, pivot, end - 1)
    var store = begin
    if(arg === null){
        if(array.$cl !== false){
            // Optimisation : if all elements have the same type, the
            // comparison function __le__ can be computed once
            var le_func = _b_.getattr(array.$cl, "__le__")
            for(var ix = begin; ix < end - 1; ++ix) {
                if(le_func(array[ix], piv)) {
                    array = swap(array, store, ix);
                    ++store
                }
            }
        }else{
            for(var ix = begin; ix < end - 1; ++ix) {
                if(getattr(array[ix], "__le__")(piv)){
                    array = swap(array, store, ix)
                    ++store
                }
            }
        }
    }else{
        var len = array.length
        for(var ix = begin; ix < end - 1; ++ix){
            var x = arg(array[ix])
            // If the comparison function changes the array size, raise
            // ValueError
            if(array.length !== len){
                throw _b_.ValueError.$factory("list modified during sort")
            }
            if(getattr(x, "__le__")(arg(piv))){
                array = swap(array, store, ix)
                ++store
            }
        }
    }
    array = swap(array, end - 1, store)
    return store
}

function swap(_array, a, b){
    var tmp = _array[a]
    _array[a] = _array[b]
    _array[b] = tmp
    return _array
}

function $qsort(arg, array, begin, end){
    if(end - 1 > begin) {
        var pivot = begin + Math.floor(Math.random() * (end - begin))

        pivot = $partition(arg, array, begin, end, pivot)
        $qsort(arg, array, begin, pivot)
        $qsort(arg, array, pivot + 1, end)
    }
}

function $elts_class(self){
    // If all elements are of the same class, return it
    if(self.length == 0){return null}
    var cl = $B.get_class(self[0]),
        i = self.length

    while(i--){
        if($B.get_class(self[i]) !== cl){return false}
    }
    return cl
}

list.sort = function(self){
    var $ = $B.args("sort", 1, {self: null}, ["self"],
        arguments, {}, null, "kw")

    check_not_tuple(self, "sort")
    var func = $N,
        reverse = false,
        kw_args = $.kw,
        keys = _b_.list.$factory(_b_.dict.$$keys(kw_args))

    for(var i = 0; i < keys.length; i++){
        if(keys[i] == "key"){func = kw_args.$string_dict[keys[i]]}
        else if(keys[i] == "reverse"){reverse = kw_args.$string_dict[keys[i]]}
        else{throw _b_.TypeError.$factory("'" + keys[i] +
            "' is an invalid keyword argument for this function")}
    }
    if(self.length == 0){return}

    if(func !== $N){
        func = $B.$call(func) // func can be an object with method __call__
    }

    self.$cl = $elts_class(self)
    var cmp = null;
    if(func === $N && self.$cl === _b_.str){
        if(reverse){
            cmp = function(b, a){return $B.$AlphabeticalCompare(a, b)}
        }else{
            cmp = function(a, b){return $B.$AlphabeticalCompare(a, b)}
        }
    }else if(func === $N && self.$cl === _b_.int){
        if(reverse){
            cmp = function(b, a){return a - b}
        }else{
            cmp = function(a, b){return a - b}
        }
    }else{
        if(func === $N){
            if(reverse){
                cmp = function(b, a) {
                    res = getattr(a, "__le__")(b)
                    if(res === _b_.NotImplemented){
                        throw _b_.TypeError.$factory("unorderable types: " +
                            $B.class_name(b) + "() <=" +
                            $B.class_name(a) + "()")
                    }
                    if(res){
                        if(a == b){return 0}
                        return -1
                    }
                    return 1
                }
            }else{
                cmp = function(a, b){
                    res = getattr(a, "__le__")(b)
                    if(res === _b_.NotImplemented){
                        throw _b_.TypeError.$factory("unorderable types: " +
                            $B.class_name(a) + "() <=" +
                            $B.class_name(b) + "()")
                    }
                    if(res){
                        if(a == b){return 0}
                        return -1
                    }
                    return 1
                }
            }
        }else{
            if(reverse){
                cmp = function(b, a) {
                    var _a = func(a),
                        _b = func(b)
                    res = getattr(_a, "__le__")(_b)
                    if(res === _b_.NotImplemented){
                        throw _b_.TypeError.$factory("unorderable types: " +
                            $B.class_name(b) + "() <=" +
                            $B.class_name(a) + "()")
                    }
                    if(res){
                        if(_a == _b){return 0}
                        return -1
                    }
                    return 1
                }
            }else{
                cmp = function(a, b){
                    var _a = func(a),
                        _b = func(b)
                    res = $B.$getattr(_a, "__lt__")(_b)
                    if(res === _b_.NotImplemented){
                        throw _b_.TypeError.$factory("unorderable types: " +
                            $B.class_name(a) + "() <=" +
                            $B.class_name(b) + "()")
                    }
                    if(res){
                        if(_a == _b){return 0}
                        return -1
                    }
                    return 1
                }
            }

        }
    }
    $B.$TimSort(self, cmp)

    // Javascript libraries might use the return value
    return (self.__brython__ ? $N : self)
}

// function used for list literals
$B.$list = function(t){
    t.__brython__ = true
    return t
}

// constructor for built-in type 'list'
list.$factory = function(){
    if(arguments.length == 0){return []}
    var $ = $B.args("list", 1, {obj: null}, ["obj"],
        arguments, {}, null, null),
        obj = $.obj

    if(Array.isArray(obj)){ // most simple case
        obj = obj.slice() // list(t) is not t
        obj.__brython__ = true;
        if(obj.__class__ == tuple){
            var res = obj.slice()
            res.__class__ = list
            return res
        }
        return obj
    }
    var res = [],
        pos = 0,
        arg = $B.$iter(obj),
        next_func = $B.$call(getattr(arg, "__next__"))

    while(1){
        try{res[pos++] = next_func()}
        catch(err){
            if(!isinstance(err, _b_.StopIteration)){throw err}
            break
        }
    }
    res.__brython__ = true // false for Javascript arrays - used in sort()
    return res
}

$B.set_func_names(list, "builtins")

// Wrapper around Javascript arrays
var JSArray = $B.JSArray = $B.make_class("JSArray",
    function(array){
        return {
            __class__: JSArray,
            js: array
        }
    }
)

JSArray.__repr__ = JSArray.__str__ = function(){
    return "<JSArray object>"
}

// Add list methods to JSArray
function make_args(args){
    var res = [args[0].js]
    for(var i = 1, len = args.length; i < len; i++){
        res.push(args[i])
    }
    return res
}

for(var attr in list){
    if($B.JSArray[attr] !== undefined){continue}
    if(typeof list[attr] == "function"){
        $B.JSArray[attr] = (function(fname){
            return function(){
                return $B.$JS2Py(list[fname].apply(null,
                    make_args(arguments)))
            }
        })(attr)
    }
}

$B.set_func_names($B.JSArray, "builtins")

// Tuples
function $tuple(arg){return arg} // used for parenthesed expressions

var tuple = {
    __class__: _b_.type,
    __mro__: [object],
    $infos: {
        __module__: "builtins",
        __name__: "tuple"
    },
    $is_class: true,
    $native: true
}

tuple.__iter__ = function(self){
    return $B.$iterator(self, $tuple_iterator)
}

// other attributes are defined in py_list.js, once list is defined

var $tuple_iterator = $B.$iterator_class("tuple_iterator")

// type() is implemented in py_utils

tuple.$factory = function(){
    var obj = list.$factory(...arguments)
    obj.__class__ = tuple
    return obj
}

$B.fast_tuple = function(array){
    array.__class__ = tuple
    array.__brython__ = true
    array.__dict__ = _b_.dict.$factory()
    return array
}
// add tuple methods
for(var attr in list){
    switch(attr) {
        case "__delitem__":
        case "__iadd__":
        case "__imul__":
        case "__setitem__":
        case "append":
        case "extend":
        case "insert":
        case "remove":
        case "reverse":
            break
        default:
            if(tuple[attr] === undefined){
                if(typeof list[attr] == "function"){
                    tuple[attr] = (function(x){
                        return function(){
                            return list[x].apply(null, arguments)
                        }
                    })(attr)
                }else{
                    //tuple[attr] = list[attr]
                }
            }
    }
}

tuple.__eq__ = function(self, other){
    // compare object "self" to class "list"
    if(other === undefined){return self === tuple}
    return list.__eq__(self, other)
}

function c_mul(a, b){
    s = ((parseInt(a) * b) & 0xFFFFFFFF).toString(16)
    return parseInt(s.substr(0, s.length - 1), 16)
}

tuple.__hash__ = function (self) {
  // http://nullege.com/codes/show/src%40p%40y%40pypy-HEAD%40pypy%40rlib%40test%40test_objectmodel.py/145/pypy.rlib.objectmodel._hash_float/python
  var x = 0x3456789
  for(var i = 0, len = self.length; i < len; i++){
     var y = _b_.hash(self[i])
     x = c_mul(1000003, x) ^ y & 0xFFFFFFFF
  }
  return x
}

tuple.__init__ = function(){
    // Tuple initialization is done in __new__
    return $N
}

tuple.__new__ = function(cls, ...args){
    if(cls === undefined){
        throw _b_.TypeError.$factory("list.__new__(): not enough arguments")
    }
    var self = []
    self.__class__ = cls
    self.__brython__ = true
    self.__dict__ = _b_.dict.$factory()
    var arg = $B.$iter(args[0]),
        next_func = $B.$call(getattr(arg, "__next__"))
    while(1){
        try{
            var item = next_func()
            self.push(item)
        }
        catch(err){
            if(err.__class__ === _b_.StopIteration){
                break
            }
            else{throw err}
        }
    }
    return self
}
// set method names
$B.set_func_names(tuple, "builtins")

_b_.list = list
_b_.tuple = tuple

// set object.__bases__ to an empty tuple
_b_.object.__bases__ = tuple.$factory()

})(__BRYTHON__)
