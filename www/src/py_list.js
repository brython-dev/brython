"use strict";
(function($B){

var _b_ = $B.builtins,
    isinstance = $B.$isinstance

function check_not_tuple(self, attr){
    if($B.exact_type(self, tuple)){
        throw $B.attr_error(attr, self)
    }
}

var list = _b_.list
Object.assign(list,
{
    tp_basicsize: 40,
    tp_itersize: 0,
    tp_flags: 37770530,
    tp_weakrefoffset: 0,
    tp_base: _b_.object,
    tp_dictoffset: 0,
    tp_doc: `Built-in mutable sequence.

If no argument is given, the constructor creates a new empty list.
The argument must be an iterable if specified.`,
    tp_bases: [_b_.object],
})

list.$match_sequence_pattern = true // for Pattern Matching (PEP 634)
list.$is_sequence = true

list.nb_add = function(self, other){
    if($B.get_class(self) !== $B.get_class(other)){
        var this_name = $B.class_name(self) // can be tuple
        var radd = $B.$getattr(other, '__radd__', null)
        if(radd === null){
            $B.RAISE(_b_.TypeError, 'can only concatenate ' +
                this_name + ' (not "' + $B.class_name(other) +
                '") to ' + this_name)
        }
        return _b_.NotImplemented
    }
    var res = self.slice()
    for(const item of other){
        res.push(item)
    }
    if(isinstance(self, tuple)){
        return tuple.$factory(res)
    }else{
        return $B.$list(res)
    }
}

list.__bool__ = function(self){
    return list.__len__(self) > 0
}

list.__class_getitem__ = $B.$class_getitem

list.__contains__ = function(){
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
        let pos = arg
        if(arg < 0){
            pos = self.length + pos
        }
        if(pos >= 0 && pos < self.length){
            self.splice(pos, 1)
            return _b_.None
        }
        $B.RAISE(_b_.IndexError, $B.class_name(self) +
            " index out of range")
    }
    if(isinstance(arg, _b_.slice)) {
        var step = arg.step
        if(step === _b_.None){
            step = 1
        }
        var start = arg.start
        if(start === _b_.None){
            start = step > 0 ? 0 : self.length
        }
        var stop = arg.stop
        if(stop === _b_.None){
            stop = step > 0 ? self.length : 0
        }
        if(start < 0){
            start = self.length + start
        }
        if(stop < 0){
            stop = self.length + stop
        }
        let res = [],
            pos = 0
        if(step > 0){
            if(stop > start){
                for(let i = start; i < stop; i += step){
                    if(self[i] !== undefined){
                        res[pos++] = i
                    }
                }
            }
        }else{
            if(stop < start){
                for(let i = start; i > stop; i += step){
                    if(self[i] !== undefined){
                        res[pos++] = i
                    }
                }
                res.reverse() // must be in ascending order
            }
        }
        // delete items from left to right
        let i = res.length
        while(i--){
           self.splice(res[i], 1)
        }
        return _b_.None
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__delitem__(self, _b_.int.$factory(arg))
       return _b_.None
    }

    $B.RAISE(_b_.TypeError, $B.class_name(self) +
        " indices must be integer, not " + $B.class_name(arg))
}

list.__eq__ = function(self, other){
    if(other[$B.PYOBJ]){
        other = other[$B.PYOBJ]
    }
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
    var klass = $B.get_class(self)
    var factory = function(list_res){
        list_res.ob_type = klass
        return list_res
    }

    var int_key
    try{
        int_key = $B.PyNumber_Index(key)
    }catch(err){
        // ignore
    }

    if(int_key !== undefined){
        let items = self.valueOf(),
            pos = int_key
        if(int_key < 0){
            pos = items.length + pos
        }
        if(pos >= 0 && pos < items.length){
            return items[pos]
        }

        $B.RAISE(_b_.IndexError, $B.class_name(self) +
            " index out of range")
    }
    if($B.$isinstance(key, _b_.slice)){
        return _b_.list.$getitem_slice(self, key)
    }

    $B.RAISE(_b_.TypeError, $B.class_name(self) +
        " indices must be integer, not " + $B.class_name(key))
}

list.$getitem_slice = function(self, key){
    var klass = $B.get_class(self)
    // Find integer values for start, stop and step
    if(key.start === _b_.None && key.stop === _b_.None &&
            key.step === _b_.None){
        let res = self.slice()
        res.ob_type = klass
        return res
    }
    let s = _b_.slice.$conv_for_seq(key, self.length)
    // Return the sliced list
    let res = [],
        items = self.valueOf(),
        pos = 0,
        start = s.start,
        stop = s.stop,
        step = s.step
    res.ob_type = klass
    if(step > 0){
        if(stop <= start){
            return res
        }
        for(let i = start; i < stop; i += step){
           res[pos++] = items[i]
        }
        return res
    }else{
        if(stop > start){
            return res
        }
        for(let i = start; i > stop; i += step){
           res[pos++] = items[i]
        }
        return res
    }
}

list.__ge__ = function(self, other){
    // self >= other is the same as other <= self
    if(! isinstance(other, list)){
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
    if(! isinstance(other, list)){
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
    var x = list.$factory($.x)
    for(var i = 0; i < x.length; i++){
        $.self.push(x[i])
    }
    return $.self
}

list.__imul__ = function() {
    var $ = $B.args("__imul__", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null),
        len = $.self.length,
        pos = len
    try{
        var x = $B.PyNumber_Index($.x)
    }catch(err){
        $B.RAISE(_b_.TypeError, `can't multiply sequence by non-int` +
            ` of type '${$B.class_name($.x)}'`)
    }
    if(x == 0){
        list.clear($.self)
        return $.self
    }
    for(var i = 1; i < x; i++){
        for(var j = 0; j < len; j++){
            $.self[pos++] = $.self[j]
        }
    }
    return $.self
}

list.tp_init = function(){
    var $ = $B.args('__init__', 1, {self: null}, ['self'], arguments, {},
            'args', 'kw'),
        self = $.self,
        args = $.args,
        kw = $.kw
    if(args.length > 1){
        $B.RAISE(_b_.TypeError, 'expected at most 1 argument, got ' +
            args.length)
    }
    if(_b_.dict.__len__(kw) > 0){
        $B.RAISE(_b_.TypeError, 'list() takes no keyword arguments')
    }
    while(self.length > 0){
        self.pop()
    }
    var arg = args[0]
    if(arg === undefined){
        return _b_.None
    }
    var pos = 0
    for(var item of $B.make_js_iterator(arg)){
        self[pos++] = item
    }
    return _b_.None
}

var list_iterator = $B.make_builtin_class("list_iterator")

list_iterator.tp_iternext = function*(self){
    for(var value of self.it){
        yield value
    }
}

list_iterator.__reduce__ = list_iterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([list.$factory(self)]), 0])
}

list.tp_iter = function(self){
    return {
        ob_type: list_iterator,
        it: self[Symbol.iterator]()
    }
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

list.sq_length = function(self){
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
    if($B.$isinstance(other, [_b_.float, _b_.complex])){
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(other) +
                "' object cannot be interpreted as an integer")
    }
    if(self.length == 0){
        return list.__new__(list)
    }
    try{
        other = $B.PyNumber_Index(other)
    }catch(err){
        return _b_.NotImplemented
    }
    if(typeof other == 'number'){
        if(other < 0){
            return list.__new__(list)
        }
        if(self.length > $B.max_array_size / other){
            $B.RAISE(_b_.OverflowError, `cannot fit ` +
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
        res.ob_type = $B.get_class(self)
        return res
    }else if(isinstance(other, $B.long_int)){
        $B.RAISE(_b_.OverflowError, `cannot fit ` +
        `'${$B.class_name(other)}' into an index-sized integer`)
    }else{
        return _b_.NotImplemented
    }
}

list.tp_new = function(cls){
    // ignores other arguments than the first
    if(cls === undefined){
        $B.RAISE(_b_.TypeError, "list.__new__(): not enough arguments")
    }
    var res = []
    res.ob_type = cls
    if(cls !== list){
        res.dict = $B.empty_dict()
    }
    return res
}

list.tp_repr = function(self){
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

    if(isinstance(self, tuple)){
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

var list_reverseiterator = $B.make_iterator_class("list_reverseiterator", true)

list_reverseiterator.__reduce__ = list_reverseiterator.__reduce_ex__ = function(self){
    return $B.fast_tuple([_b_.iter, $B.fast_tuple([list.$factory(self)]), 0])
}

list.__reversed__ = function(self){
    return list_reverseiterator.$factory(self)
}

list.__rmul__ = function(self, other){
    return list.__mul__(self, other)
}

list.__setitem__ = function(){
    var $ = $B.args("__setitem__", 3, {self: null, key: null, value: null},
        ["self", "key", "value"], arguments, {}, null, null),
        self = $.self,
        arg = $.key,
        value = $.value
    list.$setitem(self, arg, value)
}


// Set list key or slice
function set_list_slice(obj, start, stop, value){
    var res = _b_.list.$factory(value)
    obj.splice.apply(obj,[start, stop - start].concat(res))
}

function set_list_slice_step(obj, start, stop, step, value){
    if(step == 1){
        return set_list_slice(obj, start, stop, value)
    }

    if(step == 0){
        $B.RAISE(_b_.ValueError, "slice step cannot be zero")
    }

    var repl = _b_.list.$factory(value),
        j = 0,
        test,
        nb = 0
    if(step > 0){
        test = function(i){
            return i < stop
        }
    }else{
        test = function(i){
            return i > stop
        }
    }

    // Test if number of values in the specified slice is equal to the
    // length of the replacement sequence
    for(var i = start; test(i); i += step){
        nb++
    }
    if(nb != repl.length){
        $B.RAISE(_b_.ValueError,
            "attempt to assign sequence of size " + repl.length +
            " to extended slice of size " + nb)
    }

    for(var i = start; test(i); i += step){
        obj[i] = repl[j]
        j++
    }
}

list.$setitem = function(self, arg, value){
    // Used internally to avoid using $B.args
    if(typeof arg == "number" || isinstance(arg, _b_.int)){
        var pos = $B.PyNumber_Index(arg)
        if(arg < 0){
            pos = self.length + pos
        }
        if(pos >= 0 && pos < self.length){
            self[pos] = value
        }else{
            $B.RAISE(_b_.IndexError, "list assignment index out of range")
        }
        return _b_.None
    }
    if(isinstance(arg, _b_.slice)){
        var s = _b_.slice.$conv_for_seq(arg, self.length)
        if(arg.step === null){
            set_list_slice(self, s.start, s.stop, value)
        }else{
            set_list_slice_step(self, s.start, s.stop, s.step, value)
        }
        return _b_.None
    }

    if(_b_.hasattr(arg, "__int__") || _b_.hasattr(arg, "__index__")){
       list.__setitem__(self, _b_.int.$factory(arg), value)
       return _b_.None
    }

    $B.RAISE(_b_.TypeError, "list indices must be integer, not " +
        $B.class_name(arg))
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

// function used for list literals
$B.$list = function(t){
    t.ob_type = _b_.list
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
    if(Array.isArray(obj) && obj.ob_type){ // most simple case
        obj = obj.slice() // list(t) is not t
        obj.ob_type = klass
        return obj
    }
    let res = Array.from($B.make_js_iterator(obj))
    res.ob_type = klass
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
            var it = $B.$iter(obj)
            $B.$call($B.$getattr(it, "__next__"))
        }catch(err1){
            if($B.is_exc(err1, [_b_.TypeError])){
                $B.RAISE(_b_.TypeError,
                    `Value after * must be an iterable, not ${$B.class_name(obj)}`)
            }
            throw err1
        }
        throw err
    }
}

$B.set_func_names(list, "builtins")

function list_subscript(self){
    $B.RAISE(_b_.NotImplementedError)
}

function list___reversed__(self){
    $B.RAISE(_b_.NotImplementedError)
}

function list___sizeof__(self){
    $B.RAISE(_b_.NotImplementedError)
}

function list_clear(self){
    var $ = $B.args("clear", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    while($.self.length){
        $.self.pop()
    }
    return _b_.None
}

function list_copy(self){
    var $ = $B.args("copy", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    var res = $.self.slice()
    res.ob_type = $B.get_class($.self)
    return res
}

function list_append(self, x){
    $B.check_nb_args_no_kw("append", 2, arguments)
    if(self[$B.PYOBJ]){
        self[$B.PYOBJ].push(x)
        self.push($B.pyobj2jsobj(x))
    }else if(self.$is_js_array){
        self.push($B.pyobj2jsobj(x))
    }else{
        self[self.length] = x
    }
    return _b_.None
}

function list_insert(){
    var $ = $B.args("insert", 3, {self: null, i: null, item: null},
        ["self", "i", "item"], arguments, {}, null, null)
    if(self.$is_js_array){
        $.self.splice($.i, 0, $B.pyobj2jsobj($.item))
    }else{
        $.self.splice($.i, 0, $.item)
    }
    return _b_.None
}

function list_extend(){
    var $ = $B.args("extend", 2, {self: null, t: null}, ["self", "t"],
        arguments, {}, null, null)
    if(self.$is_js_array){
        for(var item of $B.make_js_iterator($.t)){
            $.self[$.self.length] = $B.pyobj2jsobj(item)
        }
    }else{
        for(var item of $B.make_js_iterator($.t)){
            $.self[$.self.length] = item
        }
    }
    return _b_.None
}

function list_pop(self){
    var missing = {}
    var $ = $B.args("pop", 2, {self: null, pos: null}, ["self", "pos"],
        arguments, {pos: missing}, null, null),
        self = $.self,
        pos = $.pos
    check_not_tuple(self, "pop")
    if(pos === missing){
        pos = self.length - 1
    }
    pos = $B.PyNumber_Index(pos)
    if(pos < 0){
        pos += self.length
    }
    var res = self[pos]
    if(res === undefined){
        $B.RAISE(_b_.IndexError, "pop index out of range")
    }
    self.splice(pos, 1)
    return res
}

function list_remove(){
    var $ = $B.args("remove", 2, {self: null, x: null}, ["self", "x"],
        arguments, {}, null, null)
    for(var i = 0, len = $.self.length; i < len; i++){
        if($B.rich_comp("__eq__", $.self[i], $.x)){
            $.self.splice(i, 1)
            return _b_.None
        }
    }
    $B.RAISE(_b_.ValueError, _b_.str.$factory($.x) + " is not in list")
}

function list_index(){
    var missing = {},
        $ = $B.args("index", 4, {self: null, x: null, start: null, stop: null},
            ["self", "x", "start" ,"stop"], arguments,
            {start: 0, stop: missing}, null, null),
        self = $.self,
        start = $.start,
        stop = $.stop
    if($B.exact_type(start, $B.long_int)){
        start = parseInt(start.value) * (start.pos ? 1 : -1)
    }
    if(start < 0){
        start = Math.max(0, start + self.length)
    }
    if(stop === missing){
        stop = self.length
    }else{
        if($B.exact_type(stop, $B.long_int)){
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
    $B.RAISE(_b_.ValueError, _b_.repr($.x) + " is not in " +
        $B.class_name(self))
}

function list_count(self){
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

function list_reverse(self){
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

function list_sort(self){
    var $ = $B.args("sort", 1, {self: null}, ["self"],
        arguments, {}, null, "kw")

    check_not_tuple(self, "sort")
    var func = _b_.None,
        reverse = false

    for(var item of _b_.dict.$iter_items($.kw)){
        if(item.key == "key"){
            func = item.value
        }else if(item.key == "reverse"){
            reverse = item.value
        }else{
            $B.RAISE(_b_.TypeError, "'" + item.key +
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
            for(let i = 0, len = self.length; i < len; i++){
                temp.push([func(self[i]), i])
            }
            temp.sort(cmp)
            for(let i = 0, len = temp.length; i < len; i++){
                self[i] = saved[temp[i][1]]
            }
        }
        return self.$is_js_array ? self : _b_.None
    }
    $B.$TimSort(self, cmp)

    // Javascript libraries might use the return value
    return self.$is_js_array ? self : _b_.None
}

list.tp_methods = [
    ["__getitem__", list_subscript, $B.METH_O | $B.METH_COEXIST],
    ["__reversed__", list___reversed__, $B.METH_NOARGS],
    ["__sizeof__", list___sizeof__, $B.METH_NOARGS],
    ["clear", list_clear, $B.METH_NOARGS],
    ["copy", list_copy, $B.METH_NOARGS],
    ["append", list_append, $B.METH_O],
    ["insert", list_insert, $B.METH_FASTCALL],
    ["extend", list_extend, $B.METH_O],
    ["pop", list_pop, $B.METH_FASTCALL],
    ["remove", list_remove, $B.METH_O],
    ["index", list_index, $B.METH_FASTCALL],
    ["count", list_count, $B.METH_O],
    ["reverse", list_reverse, $B.METH_NOARGS],
    ["sort", list_sort, $B.METH_FASTCALL | $B.METH_KEYWORDS],
    ["__class_getitem__", $B.$class_getitem, $B.METH_O | $B.METH_CLASS]
]

// Tuples
var tuple = _b_.tuple
tuple.$match_sequence_pattern = true
tuple.$is_sequence = true

var tuple_iterator = $B.make_iterator_class("tuple_iterator")
tuple.tp_iter = function(self){
    console.log('tyuple iter', self)
    return {
        ob_type: tuple_iterator,
        it: self[Symbol.iterator]()
    }
}

tuple_iterator.tp_iternext = function*(self){
    for(var value of self.it){
        yield value
    }
}

tuple.$factory = function(){
    var obj = factory.apply(tuple, arguments)
    obj.ob_type = tuple
    return obj
}

$B.fast_tuple = function(array){
    array.ob_type = tuple
    return array
}

// add tuple methods
for(let attr in list){
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

tuple.__class_getitem__ = $B.$class_getitem

tuple.__eq__ = function(self, other){
    // compare object "self" to class "list"
    if(other === undefined){return self === tuple}
    return list.__eq__(self, other)
}

function c_mul(a, b){
    var s = ((parseInt(a) * b) & 0xFFFFFFFF).toString(16)
    return parseInt(s.substr(0, s.length - 1), 16)
}

tuple.$getnewargs = function(self){
    return $B.fast_tuple([$B.fast_tuple(self.slice())])
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

tuple.tp_init = function(){
    // Tuple initialization is done in __new__
    return _b_.None
}

tuple.tp_new = function(){
    if(arguments.length === undefined){
        $B.RAISE(_b_.TypeError, "tuple.__new__(): not enough arguments")
    }
    var $ = $B.args('__new__', 1, {cls: null}, ['cls'], arguments,
                    {}, 'args', 'kw'),
        cls = $.cls,
        args = $.args,
        kw = $.kw
    var self = []
    self.ob_type = cls
    if(cls !== tuple){
        self.dict = $B.empty_dict()
    }
    if(args.length > 0){
        if(args.length == 1){
            for(var item of $B.make_js_iterator(args[0])){
                self.push(item)
            }
        }else{
            $B.RAISE(_b_.TypeError, 'tuple expected at most 1 ' +
                `argument, got ${args.length}`)
        }
    }
    if(cls === tuple && _b_.dict.__len__(kw) > 0){
        $B.RAISE(_b_.TypeError, 'tuple() takes no keyword arguments')
    }
    return self
}

tuple.tp_repr = function(self){
    $B.builtins_repr_check(tuple, arguments) // in brython_builtins.js
    return list_repr(self)
}

// set method names
$B.set_func_names(tuple, "builtins")

})(__BRYTHON__);
