;(function($B){

var _b_ = $B.builtins,
    object = _b_.object,
    getattr = $B.$getattr,
    isinstance = $B.$isinstance

function check_not_tuple(self, attr){
    if(self.__class__ === tuple){
        throw $B.attr_error(attr, self)
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
    __qualname__: 'list',
    __mro__: [object],
    $is_class: true,
    $native: true,
    $match_sequence_pattern: true, // for Pattern Matching (PEP 634)
    __dir__: object.__dir__
}



$B.addJS2PyWrapper(Array, function(jsobj) {
        // set it as non-enumerable, prevents issues when looping on it in JS.
        Object.defineProperty(jsobj, "$is_js_array", {value: true});
        return jsobj // $B.$list(jsobj.map(jsobj2pyobj))
});

$B.addPy2JSWrapper(list, function(pyobj) {
	
        // Python list : transform its elements
        return pyobj.map($B.pyobj2jsobj);
});

list.__add__ = function(self, other){
    if($B.get_class(self) !== $B.get_class(other)){
        var this_name = $B.class_name(self) // can be tuple
        var radd = $B.$getattr(other, '__radd__', null)
        if(radd === null){
            throw _b_.TypeError.$factory('can only concatenate ' +
                this_name + ' (not "' + $B.class_name(other) +
                '") to ' + this_name)
        }
        return _b_.NotImplemented
    }
    var res = self.slice(),
        is_js = other.$brython_class == "js" // list of JS objects
    for(const item of other){
        res.push(is_js ? $B.$JS2Py(item) : item)
    }
    res.__brython__ = true
    if(isinstance(self, tuple)){
        res = tuple.$factory(res)
    }
    return res
}

list.__bool__ = function(self){
    return list.__len__(self) > 0
}

list.__class_getitem__ = function(cls, item){
    // PEP 585
    if(! Array.isArray(item)){
        item = [item]
    }
    return $B.GenericAlias.$factory(cls, item)
}

list.__contains__ = function(self, item){
    var $ = $B.args("__contains__", 2, {self: null, item: null},
        ["self", "item"], arguments, {}, null, null),
        self = $.self,
        item = $.item
    for(var _item of self) {
        if($B.is_or_equals(_item, item)){
            return true
        }
    }
    return false
}

list.__delitem__ = function(self, arg){

    if(isinstance(arg, _b_.int)){
        var pos = arg
        if(arg < 0){pos = self.length + pos}
        if(pos >= 0 && pos < self.length){
            self.splice(pos, 1)
            return _b_.None
        }
        throw _b_.IndexError.$factory($B.class_name(self) +
            " index out of range")
    }
    if(isinstance(arg, _b_.slice)) {
        var step = arg.step
        if(step === _b_.None){step = 1}
        var start = arg.start
        if(start === _b_.None){start = step > 0 ? 0 : self.length}
        var stop = arg.stop
        if(stop === _b_.None){stop = step > 0 ? self.length : 0}
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
        return _b_.None
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__delitem__(self, _b_.int.$factory(arg))
       return _b_.None
    }

    throw _b_.TypeError.$factory($B.class_name(self) +
        " indices must be integer, not " + $B.class_name(arg))
}

list.__eq__ = function(self, other){
    var klass = isinstance(self, list) ? list : tuple
    if(isinstance(other, klass)){
       if(other.length == self.length){
            var i = self.length
            while(i--){
                if(! $B.is_or_equals(self[i], other[i])){
                    return false
                }
            }
            return true
       }
       return false
    }
    // not the same class
    return _b_.NotImplemented
}

list.__getitem__ = function(self, key){
    // var $ = $B.args("__getitem__",2,{self: null, key: null},
    //     ["self", "key"], arguments, {}, null, null),
    //     self = $.self,
    //     key = $.key
    $B.check_nb_args_no_kw("__getitem__", 2, arguments)
    return list.$getitem(self, key)
}

list.$getitem = function(self, key){
    var klass = (self.__class__ || $B.get_class(self))
    var factory = function(list_res){
        list_res.__class__ = klass
        return list_res
    }

    var int_key
    try{
      int_key = $B.PyNumber_Index(key)
    }catch(err){

    }

    if(int_key !== undefined){
        var items = self.valueOf(),
            pos = int_key
        if(int_key < 0){
            pos = items.length + pos
        }
        if(pos >= 0 && pos < items.length){
            return items[pos]
        }

        throw _b_.IndexError.$factory($B.class_name(self) +
            " index out of range")
    }
    if(key.__class__ === _b_.slice || isinstance(key, _b_.slice)){
        // Find integer values for start, stop and step
        if(key.start === _b_.None && key.stop === _b_.None &&
                key.step === _b_.None){
            return self.slice()
        }
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
            if(stop <= start){
                return factory(res)
            }
            for(var i = start; i < stop; i += step){
               res[pos++] = items[i]
            }
            return factory(res)
        }else{
            if(stop > start){
                return factory(res)
            }
            for(var i = start; i > stop; i += step){
               res[pos++] = items[i]
            }
            return factory(res)
        }
    }

    throw _b_.TypeError.$factory($B.class_name(self) +
        " indices must be integer, not " + $B.class_name(key))
}

list.__ge__ = function(self, other){
    // self >= other is the same as other <= self
    if(! $B.$isinstance(other, list)){
        return _b_.NotImplemented
    }
    var res = list.__le__(other, self)
    if(res === _b_.NotImplemented){
        return res
    }
    return res
}

list.__gt__ = function(self, other){
    // self > other is the same as other < self
    if(! $B.$isinstance(other, list)){
        return _b_.NotImplemented
    }
    var res = list.__lt__(other, self)
    if(res === _b_.NotImplemented){
        return res
    }
    return res
}

list.__hash__ = _b_.None

list.__iadd__ = function() {
    var $ = $B.args("__iadd__", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
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
    if(x == 0){
        list.clear($.self)
        return $.self
    }
    for(var i = 1; i < x; i++){
        for(j = 0; j < len; j++){
            $.self[pos++] = $.self[j]
        }
    }
    return $.self
}

list.__init__ = function(self, arg){
    var $ = $B.args('__init__', 1, {self: null}, ['self'], arguments, {},
            'args', null),
        self = $.self,
        args = $.args
    if(args.length > 1){
        throw _b_.TypeError.$factory('expected at most 1 argument, got ' +
            args.length)
    }
    var arg = args[0]
    var len_func = $B.$call($B.$getattr(self, "__len__")),
        pop_func = $B.$getattr(self, "pop", _b_.None)
    if(pop_func !== _b_.None){
        pop_func = $B.$call(pop_func)
        while(len_func()){pop_func()}
    }
    if(arg === undefined){
        return _b_.None
    }
    var arg = $B.$iter(arg),
        next_func = $B.$call($B.$getattr(arg, "__next__")),
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
    return _b_.None
}

var list_iterator = $B.make_iterator_class("list_iterator")
list_iterator.__reduce__ = list_iterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([list.$factory(self)]), 0])
}

list.__iter__ = function(self){
    return list_iterator.$factory(self)
}

list.__le__ = function(self, other){
    // True if all items in self are <= than in other,
    // or if all are equal and len(self) <= len(other)
    if(! isinstance(other, [list, _b_.tuple])){
        return _b_.NotImplemented
    }
    var i = 0
    // skip all items that compare equal
    while(i < self.length && i < other.length &&
            $B.is_or_equals(self[i], other[i])){
        i++
    }
    if(i == self.length){
        // [1] <= [1, 2] is True
        return self.length <= other.length
    }
    if(i == other.length){
        // [1, 2] <= [1] is false
        return false
    }
    // First different item: [1, x] <= [1, y] is x <= y
    return $B.rich_comp('__le__', self[i], other[i])
}

list.__len__ = function(self){
    return self.length
}

list.__lt__ = function(self, other){
    // True if all items in self are lesser than in other,
    // or if all are equal and len(self) < len(other)
    if(! isinstance(other, [list, _b_.tuple])){
        return _b_.NotImplemented
    }
    var i = 0
    // skip all items that compare equal
    while(i < self.length && i < other.length &&
            $B.is_or_equals(self[i], other[i])){
        i++
    }
    if(i == self.length){
        // [1] < [1, 2] is True
        return self.length < other.length
    }
    if(i == other.length){
        // [1, 2] < [1] is false
        return false
    }
    // First different item: [1, x] < [1, y] is x < y
    return $B.rich_comp('__lt__', self[i], other[i])
}

list.__mul__ = function(self, other){
    try{
        other = $B.PyNumber_Index(other)
    }catch(err){
        throw _b_.TypeError.$factory("can't multiply sequence by non-int " +
            `of type '${$B.class_name(other)}'`)
    }
    if(self.length == 0){
        return list.__new__(list)
    }
    if(typeof other == 'number'){
        if(other < 0){
            return list.__new__(list)
        }
        if(self.length > $B.max_array_size / other){
            throw _b_.OverflowError.$factory(`cannot fit ` +
                `'${$B.class_name(other)}' into an index-sized integer`)
        }
        var res = [],
            $temp = self.slice(),
            len = $temp.length
        for(var i = 0; i < other; i++){
            for(var j = 0; j < len; j++){
                res.push($temp[j])
            }
        }
        res.__class__ = self.__class__
        if(self.__brython__){
            res.__brython__ = self.__brython__
        }
        return res
    }else if($B.$isinstance(other, $B.long_int)){
        throw _b_.OverflowError.$factory(`cannot fit ` +
        `'${$B.class_name(other)}' into an index-sized integer`)
    }
}

list.__new__ = function(cls, ...args){
    if(cls === undefined){
        throw _b_.TypeError.$factory("list.__new__(): not enough arguments")
    }
    var res = []
    res.__class__ = cls
    res.__brython__ = true
    res.__dict__ = $B.empty_dict()
    return res
}

function __newobj__(){
    // __newobj__ is called with a generator as only argument
    var $ = $B.args('__newobj__', 0, {}, [], arguments, {}, 'args', null),
        args = $.args
    // args for list.__reduce_ex__ is just (klass,)
    // for tuple.__reduce_ex__ it is (klass, ...items)
    var res = args.slice(1)
    res.__class__ = args[0]
    return res
}

list.__reduce_ex__ = function(self){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__]),
        _b_.None,
        _b_.iter(self)])
}

list.__repr__ = function(self){
    $B.builtins_repr_check(list, arguments) // in brython_builtins.js
    return list_repr(self)
}

function list_repr(self){
    // shared between list and tuple
    if($B.repr.enter(self)){ // in py_utils.js
        return '[...]'
    }
    var _r = [],
        res

    for(var i = 0; i < self.length; i++){
        _r.push(_b_.repr(self[i]))
    }

    if($B.$isinstance(self, tuple)){
        if(self.length == 1){
            res = "(" + _r[0] + ",)"
        }else{
            res = "(" + _r.join(", ") + ")"
        }
    }else{
        res = "[" + _r.join(", ") + "]"
    }
    $B.repr.leave(self)
    return res
}

list.__rmul__ = function(self, other){
    return list.__mul__(self, other)
}

list.__setattr__ = function(self, attr, value){
    if(self.__class__ === list || self.__class__ === tuple){
        var cl_name = $B.class_name(self)
        if(list.hasOwnProperty(attr)){
            throw _b_.AttributeError.$factory("'" + cl_name +
                "' object attribute '" + attr + "' is read-only")
        }else{
            throw _b_.AttributeError.$factory(
                "'" + cl_name + " object has no attribute '" + attr + "'")
        }
    }
    // list subclass : use __dict__
    _b_.dict.$setitem(self.__dict__, attr, value)
    return _b_.None
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
        if(arg < 0){
            pos = self.length + pos
        }
        if(pos >= 0 && pos < self.length){
            self[pos] = value
        }else{
            throw _b_.IndexError.$factory("list index out of range")
        }
        return _b_.None
    }
    if(isinstance(arg, _b_.slice)){
        var s = _b_.slice.$conv_for_seq(arg, self.length)
        if(arg.step === null){
            $B.set_list_slice(self, s.start, s.stop, value)
        }else{
            $B.set_list_slice_step(self, s.start, s.stop, s.step, value)
        }
        return _b_.None
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__setitem__(self, _b_.int.$factory(arg), value)
       return _b_.None
    }

    throw _b_.TypeError.$factory("list indices must be integer, not " +
        $B.class_name(arg))
}

list.append = function(self, x){
    $B.check_nb_args_no_kw("append", 2, arguments)
    self[self.length] = x
    return _b_.None
}

list.clear = function(){
    var $ = $B.args("clear", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    while($.self.length){
        $.self.pop()
    }
    return _b_.None
}

list.copy = function(){
    var $ = $B.args("copy", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    var res = $.self.slice()
    res.__class__ = self.__class__
    res.__brython__ = true
    return res
}

list.count = function(){
    var $ = $B.args("count", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    var res = 0
    for(var _item of $.self){
        if($B.is_or_equals(_item, $.x)){
            res++
        }
    }
    return res
}

list.extend = function(){
    var $ = $B.args("extend", 2, {self: null, t: null}, ["self", "t"],
        arguments, {}, null, null)
    var other = list.$factory(_b_.iter($.t))
    for(var i = 0; i < other.length; i++){$.self.push(other[i])}
    return _b_.None
}

list.index = function(){
    var missing = {},
        $ = $B.args("index", 4, {self: null, x: null, start: null, stop: null},
            ["self", "x", "start" ,"stop"], arguments,
            {start: 0, stop: missing}, null, null),
        self = $.self,
        start = $.start,
        stop = $.stop
    var _eq = function(other){
        return $B.rich_comp("__eq__", $.x, other)
    }
    if(start.__class__ === $B.long_int){
        start = parseInt(start.value) * (start.pos ? 1 : -1)
    }
    if(start < 0){
        start = Math.max(0, start + self.length)
    }
    if(stop === missing){
        stop = self.length
    }else{
        if(stop.__class__ === $B.long_int){
            stop = parseInt(stop.value) * (stop.pos ? 1 : -1)
        }
        if(stop < 0){
            stop = Math.min(self.length, stop + self.length)
        }
        stop = Math.min(stop, self.length)
    }
    for(var i = start; i < stop; i++){
        if($B.rich_comp('__eq__', $.x, self[i])){
            return i
        }
    }
    throw _b_.ValueError.$factory(_b_.repr($.x) + " is not in " +
        $B.class_name(self))
}

list.insert = function(){
    var $ = $B.args("insert", 3, {self: null, i: null, item: null},
        ["self", "i", "item"], arguments, {}, null, null)
    $.self.splice($.i, 0, $.item)
    return _b_.None
}

list.pop = function(){
    var missing = {}
    var $ = $B.args("pop", 2, {self: null, pos: null}, ["self", "pos"],
        arguments, {pos: missing}, null, null),
        self = $.self,
        pos = $.pos
    check_not_tuple(self, "pop")
    if(pos === missing){
        pos = self.length - 1
    }
    pos = $B.$GetInt(pos)
    if(pos < 0){
        pos += self.length
    }
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
            return _b_.None
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
    return _b_.None
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
                if($B.$getattr(array[ix], "__le__")(piv)){
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
            if($B.$getattr(x, "__le__")(arg(piv))){
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
    var func = _b_.None,
        reverse = false,
        kw_args = $.kw

    for(var key in kw_args.$jsobj){
        if(key == "key"){
            func = kw_args.$jsobj[key]
        }else if(key == "reverse"){
            reverse = kw_args.$jsobj[key]
        }else{
            throw _b_.TypeError.$factory("'" + key +
                "' is an invalid keyword argument for this function")
        }
    }
    if(self.length == 0){
        return _b_.None
    }

    if(func !== _b_.None){
        func = $B.$call(func) // func can be an object with method __call__
    }

    self.$cl = $elts_class(self)
    var cmp = null;

    function basic_cmp(a, b) {
        return $B.rich_comp("__lt__", a, b) ? -1:
               $B.rich_comp('__eq__', a, b) ? 0 : 1
    }

    function reverse_cmp(a, b) {
        return basic_cmp(b, a)
    }

    if(func === _b_.None && self.$cl === _b_.str){
        if(reverse){
            cmp = function(b, a){return $B.$AlphabeticalCompare(a, b)}
        }else{
            cmp = function(a, b){return $B.$AlphabeticalCompare(a, b)}
        }
    }else if(func === _b_.None && self.$cl === _b_.int){
        if(reverse){
            cmp = function(b, a){return a - b}
        }else{
            cmp = function(a, b){return a - b}
        }
    }else{
        cmp = reverse ?
                function(t1, t2){
                    return basic_cmp(t2[0], t1[0])
                } :
                function(t1, t2){
                    return basic_cmp(t1[0], t2[0])
                }
        if(func === _b_.None){
            cmp = reverse ? reverse_cmp : basic_cmp
            self.sort(cmp)
        }else{
            var temp = [],
                saved = self.slice()
            for(var i=0, len=self.length; i < len; i++){
                temp.push([func(self[i]), i])
            }
            temp.sort(cmp)
            for(var i=0, len=temp.length; i < len; i++){
                self[i] = saved[temp[i][1]]
            }
        }
        return self.__brython__ ? _b_.None : self
    }
    $B.$TimSort(self, cmp)

    // Javascript libraries might use the return value
    return self.__brython__ ? _b_.None : self
}

// function used for list literals
$B.$list = function(t){
    t.__brython__ = true
    t.__class__ = _b_.list
    return t
}

// constructor common to list and tuple (class is passed as "this")
var factory = function(){
    var klass = this // list or tuple
    if(arguments.length == 0){
        return $B.$list([])
    }
    var $ = $B.args(klass.__name__, 1, {obj: null}, ["obj"],
        arguments, {}, null, null),
        obj = $.obj
    if(Array.isArray(obj)){ // most simple case
        obj = obj.slice() // list(t) is not t
        obj.__brython__ = true;
        if(obj.__class__ == tuple){
            var res = obj.slice()
            res.__class__ = list
            res.__brython__ = true
            return res
        }
        return obj
    }
    var res = Array.from($B.make_js_iterator(obj))
    res.__brython__ = true // false for Javascript arrays - used in sort()
    return res
}

list.$factory = function(){
    return factory.apply(list, arguments)
}

list.$unpack = function(obj){
    // Used for instances of ast.Starred, to generate a specific error message
    // if obj is not iterable
    try{
        return _b_.list.$factory(obj)
    }catch(err){
        try{
            var it = $B.$iter(obj),
                next_func = $B.$call($B.$getattr(it, "__next__"))
        }catch(err1){
            if($B.is_exc(err1, [_b_.TypeError])){
                throw _b_.TypeError.$factory(
                    `Value after * must be an iterable, not ${$B.class_name(obj)}`)
            }
            throw err1
        }
        throw err
    }
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
    __qualname__: 'tuple',
    $is_class: true,
    $native: true,
    $match_sequence_pattern: true, // for Pattern Matching (PEP 634)
}

$B.addPy2JSWrapper(tuple, function(pyobj) {
	
        // Python list : transform its elements
        return pyobj.map($B.pyobj2jsobj);
});

var tuple_iterator = $B.make_iterator_class("tuple_iterator")
tuple.__iter__ = function(self){
    return tuple_iterator.$factory(self)
}

tuple.$factory = function(){
    var obj = factory.apply(tuple, arguments)
    obj.__class__ = tuple
    return obj
}

$B.fast_tuple = function(array){
    array.__class__ = tuple
    array.__brython__ = true
    array.__dict__ = $B.empty_dict()
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
        case "pop":
        case "remove":
        case "reverse":
        case "sort":
            break
        default:
            if(tuple[attr] === undefined){
                if(typeof list[attr] == "function"){
                    tuple[attr] = (function(x){
                        return function(){
                            return list[x].apply(null, arguments)
                        }
                    })(attr)
                }
            }
    }
}

tuple.__class_getitem__ = function(cls, item){
    // PEP 585
    // Set as a classmethod at the end of this script, after $B.set_func_names()
    if(! Array.isArray(item)){
        item = [item]
    }
    return $B.GenericAlias.$factory(cls, item)
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

tuple.$getnewargs = function(self){
    return $B.fast_tuple([self])
}

tuple.__getnewargs__ = function(){
    return tuple.$getnewargs($B.single_arg('__getnewargs__', 'self', arguments))
}

tuple.__hash__ = function(self){
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
    return _b_.None
}

tuple.__new__ = function(cls, ...args){
    if(cls === undefined){
        throw _b_.TypeError.$factory("list.__new__(): not enough arguments")
    }
    var self = []
    self.__class__ = cls
    self.__brython__ = true
    self.__dict__ = $B.empty_dict()
    if(args.length == 0){
        return self
    }
    var arg = $B.$iter(args[0]),
        next_func = $B.$call($B.$getattr(arg, "__next__"))
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

tuple.__reduce_ex__ = function(self){
    return $B.fast_tuple([
        __newobj__,
        $B.fast_tuple([self.__class__].concat(self.slice())),
        _b_.None,
        _b_.None])
}

tuple.__repr__ = function(self){
    $B.builtins_repr_check(tuple, arguments) // in brython_builtins.js
    return list_repr(self)
}

// set method names
$B.set_func_names(tuple, "builtins")

_b_.list = list
_b_.tuple = tuple

// set object.__bases__ to an empty tuple
_b_.object.__bases__ = tuple.$factory()
_b_.type.__bases__ = $B.fast_tuple([_b_.object])


})(__BRYTHON__)
