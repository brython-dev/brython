"use strict";
(function($B){

var _b_ = $B.builtins,
    None = _b_.None,
    range = _b_.range

range.$match_sequence_pattern = true, // for Pattern Matching (PEP 634)
range.$is_sequence = true
range.$not_basetype = true  // range cannot be a base class

function range_eq(self, other){
    if($B.$isinstance(other, range)){
        var len = range.mp_length(self)
        if(! $B.rich_comp('__eq__', len, range.mp_length(other))){
            return false
        }
        if(len == 0){
            return true
        }
        if(! $B.rich_comp('__eq__', self.start, other.start)){
            return false
        }
        if(len == 1){
            return true
        }
        return $B.rich_comp('__eq__', self.step, other.step)
    }
    return false
}

function compute_item(r, i){
    var len = range.mp_length(r)
    if(len == 0){
        return r.start
    }else if(i > len){
        return r.stop
    }
    return $B.rich_op('__add__', r.start, $B.rich_op('__mul__', r.step, i))
}

/* range_iterator start */
$B.range_iterator.tp_iter = function(self){
    return self
}

$B.range_iterator.tp_iternext = function*(self){
    if(self.safe){
        if(self.stop > self.start){
            while(self.it < self.stop){
                yield self.it
                self.it += self.step
            }
        }else{
            while(self.it > self.stop){
                yield self.it
                self.it += self.step
            }
        }
    }else{
        if(self.stop > self.start){
            while(self.it < self.stop){
                yield _b_.int.$int_or_long(self.it)
                self.it += self.step
            }
        }else{
            while(self.it > self.stop){
                yield _b_.int.$int_or_long(self.it)
                self.it += self.step
            }
        }
    }        
}

var range_iterator_funcs = $B.range_iterator.tp_funcs = {}

range_iterator_funcs.__length_hint__ = function(self){

}

range_iterator_funcs.__reduce__ = function(self){

}

range_iterator_funcs.__setstate__ = function(self){

}

$B.range_iterator.tp_methods = ["__length_hint__", "__reduce__", "__setstate__"]

/* range_iterator end */

$B.set_func_names($B.range_iterator, "builtins")


/* range start */
_b_.range.tp_richcompare = function(self, other, op){
    if(! $B.$isinstance(other, _b_.range)){
        return _b_.NotImplemented
    }
    var res
    switch(op){
        case '__eq__':
            res = range_eq(self, other)
            break
        case '__ne__':
            res = ! range_eq(self, other)
            break
        default:
            res = _b_.NotImplemented
            break
    }
    return res
}

_b_.range.tp_repr = function(self){
    $B.builtins_repr_check(range, arguments) // in brython_builtins.js
    var res = "range(" + _b_.str.$factory(self.start) + ", " +
        _b_.str.$factory(self.stop)
    if(self.step != 1){
        res += ", " + _b_.str.$factory(self.step)
    }
    return res + ")"
}

_b_.range.tp_hash = function(self){
    var len = range.mp_length(self)
    if(len == 0){
        return _b_.hash(_b_.tuple.$factory([0, None, None]))
    }
    if(len == 1){
        return _b_.hash(_b_.tuple.$factory([1, self.start, None]))
    }
    return _b_.hash(_b_.tuple.$factory([len, self.start, self.step]))
}

_b_.range.tp_iter = function(self){
    var start, stop, step
    if(self.$safe){
        start = self.start
        stop = self.stop
        step = self.step
    }else{
        start = _b_.int.$to_bigint(self.start)
        stop = _b_.int.$to_bigint(self.stop)
        step = _b_.int.$to_bigint(self.step)
    }

    return {
        ob_type: $B.range_iterator,
        start,
        stop,
        step,
        safe: self.$safe
    }
}

_b_.range.tp_new = function(self){
    var $ = $B.args("range", 4, {cls: null, start: null, stop: null, step: null},
        ["cls", "start", "stop", "step"],
        arguments, {start: null, stop: null, step: null}, null, null),
        start = $.start,
        stop = $.stop,
        step = $.step,
        safe
    if(stop === null && step === null){
        if(start == null){
            $B.RAISE(_b_.TypeError, "range expected 1 arguments, got 0")
        }
        stop = $B.PyNumber_Index(start)
        safe = typeof stop === "number"
        return{
            ob_type: range,
            start: 0,
            stop: stop,
            step: 1,
            $is_range: true,
            $safe: safe
        }
    }
    if(step === null){
        step = 1
    }
    start = $B.PyNumber_Index(start)
    stop = $B.PyNumber_Index(stop)
    step = $B.PyNumber_Index(step)
    if(step == 0){
        $B.RAISE(_b_.ValueError, "range arg 3 must not be zero")
    }
    safe = (typeof start == "number" && typeof stop == "number" &&
        typeof step == "number")
    return {
        ob_type: cls,
        start: start,
        stop: stop,
        step: step,
        $is_range: true,
        $safe: safe
    }
}

_b_.range.nb_bool = function(self){
    return self.start != self.end
}

_b_.range.mp_length = function(self){
    var len,
        start = _b_.int.$to_bigint(self.start),
        stop = _b_.int.$to_bigint(self.stop),
        step = _b_.int.$to_bigint(self.step)
    if(self.step > 0){
        if(self.start >= self.stop){
            return 0
        }
        // len is 1+(self.stop-self.start-1)/self.step
        len = 1n + (stop - start - 1n) / step
    }else{
        if(self.stop >= self.start){
            return 0
        }
        len = 1n + (start - stop - 1n) / - step
    }
    return _b_.int.$int_or_long(len)
}

_b_.range.mp_subscript = function(self, rank){
    if($B.$isinstance(rank, _b_.slice)){
        var norm = _b_.slice.$conv_for_seq(rank, range.__len__(self)),
            substep = $B.rich_op('__mul__', self.step, norm.step),
            substart = compute_item(self, norm.start),
            substop = compute_item(self, norm.stop)
        return range.$factory(substart, substop, substep)
    }
    try{
        rank = $B.PyNumber_Index(rank)
    }catch(err){
        $B.RAISE(_b_.TypeError, "range indices must be integers " +
            `or slices, not ${$B.class_name(rank)}`)
    }
    if($B.rich_comp('__gt__', 0, rank)){
        rank = $B.rich_op('__add__', rank, range.__len__(self))
    }
    var res = $B.rich_op('__add__', self.start, $B.rich_op('__mul__', rank, self.step))
    if(($B.rich_comp('__gt__', self.step, 0) &&
            ($B.rich_comp('__ge__', res, self.stop) ||
             $B.rich_comp('__gt__', self.start, res))) ||
            ($B.rich_comp('__gt__', 0, self.step) &&
                ($B.rich_comp('__ge__', self.stop, res) ||
                $B.rich_comp('__gt__', res, self.start)))){
            $B.RAISE(_b_.IndexError, "range object index out of range")
    }
    return res
}

_b_.range.sq_contains = function(self, other){
    if(range.mp_length(self) == 0){
        return false
    }
    try{
        other = $B.int_or_bool(other)
    }catch(err){
        // If other is not an integer, test if it is equal to
        // one of the items in range
        try{
            range.tp_funcs.index(self, other)
            return true
        }catch(err){
            return false
        }
    }
    var start = _b_.int.$to_bigint(self.start),
        stop = _b_.int.$to_bigint(self.stop),
        step = _b_.int.$to_bigint(self.step)
    other = _b_.int.$to_bigint(other)

    var sub = other - start,
        fl = sub / step,
        res = step * fl
    if(res == sub){
        if(stop > start){
            return other >= start && stop > other
        }else{
            return start >= other && other > stop
        }
    }else{
        return false
    }
}

var range_funcs = _b_.range.tp_funcs = {}

range_funcs.__reduce__ = function(self){

}

range_funcs.__reversed__ = function(self){
    var n = $B.rich_op('__sub__', range.mp_length(self), 1)
    return range.$factory($B.rich_op('__add__', self.start, $B.rich_op('__mul__', n, self.step)),
        $B.rich_op('__sub__', self.start, self.step),
        $B.rich_op('__mul__', -1, self.step))
}

range_funcs.count = function(self, ob){
    if($B.$isinstance(ob, [_b_.int, _b_.float, _b_.bool])){
        return _b_.int.$factory(range.sq_contains(self, ob))
    }else{
        var comp = function(other){return $B.rich_comp("__eq__", ob, other)},
            it = range.tp_iter(self),
            _next = RangeIterator.tp_iternext,
            nb = 0
        while(true){
            try{
                if(comp(_next(it))){
                    nb++
                }
            }catch(err){
                if($B.$isinstance(err, _b_.StopIteration)){
                    return nb
                }
                throw err
            }
        }
    }
}

range_funcs.index = function(self){
    var $ = $B.args("index", 2, {self: null, other: null}, ["self", "other"],
        arguments, {}, null, null),
        self = $.self,
        other = $.other
    try{
        other = $B.int_or_bool(other)
    }catch(err){
        var comp = function(x){
                return $B.rich_comp("__eq__", other, x)
            },
            it = range.tp_iter(self),
            _next = RangeIterator.tp_iternext,
            nb = 0
        while(true){
            try{
                if(comp(_next(it))){
                    return nb
                }
                nb++
            }catch(err){
                if($B.$isinstance(err, _b_.StopIteration)){
                    $B.RAISE(_b_.ValueError, _b_.str.$factory(other) +
                        " not in range")
                }
                throw err
            }
        }
    }
    var sub = $B.rich_op('__sub__', other, self.start),
        fl = $B.rich_op('__floordiv__', sub, self.step),
        res = $B.rich_op('__mul__', self.step, fl)
    if($B.rich_comp('__eq__', res, sub)){
        if(($B.rich_comp('__gt__', self.stop, self.start) &&
                $B.rich_comp('__ge__', other, self.start) &&
                $B.rich_comp('__gt__', self.stop, other)) ||
                ($B.rich_comp('__ge__', self.start, self.stop) &&
                $B.rich_comp('__ge__', self.start, other)
                && $B.rich_comp('__gt__', other, self.stop))){
            return fl
        }else{$B.RAISE(_b_.ValueError, _b_.str.$factory(other) +
            ' not in range')}
    }else{
        $B.RAISE(_b_.ValueError, _b_.str.$factory(other) +
            " not in range")
    }
}

range_funcs.start = function(self){
    return self.start
}

range_funcs.step = function(self){
    return self.step
}

range_funcs.stop = function(self){
    return self.stop
}

_b_.range.tp_methods = ["__reversed__", "__reduce__", "count", "index"]

_b_.range.tp_members = ["start", "stop", "step"]

/* range end */

$B.set_func_names(range, "builtins")

// slice
var slice = _b_.slice

slice.$not_basetype = true // slice cannot be a base class

slice.__eq__ = function(self, other){
    var conv1 = conv_slice(self),
        conv2 = conv_slice(other)
    return conv1[0] == conv2[0] &&
        conv1[1] == conv2[1] &&
        conv1[2] == conv2[2]
}

slice.tp_repr = function(self){
    $B.builtins_repr_check(slice, arguments) // in brython_builtins.js
    return "slice(" + _b_.str.$factory(self.start) + ", " +
        _b_.str.$factory(self.stop) + ", " + _b_.str.$factory(self.step) + ")"
}

slice.tp_setattro = function(self, attr){
    $B.RAISE_ATTRIBUTE_ERROR("readonly attribute", self, attr)
}

function conv_slice(self){
    var attrs = ["start", "stop", "step"],
        res = []
    for(var i = 0; i < attrs.length; i++){
        var val = self[attrs[i]]
        if(val === _b_.None){
            res.push(val)
        }else{
            try{
                res.push($B.$call(_b_.int, val))
            }catch(err){
                $B.RAISE(_b_.TypeError, "slice indices must be " +
                    "integers or None or have an __index__ method")
            }
        }
    }
    return res
}

slice.$conv_for_seq = function(self, len){
    // Internal method, uses the integer len to set
    // start, stop, step to integers
    var step = self.step === None ? 1 : $B.PyNumber_Index(self.step),
        step_is_neg = $B.rich_comp('__gt__', 0, step),
        len_1 = $B.rich_op('__sub__', len, 1)
    if(step == 0){
        $B.RAISE(_b_.ValueError, 'slice step cannot be zero')
    }
    var start,
        stop
    if(self.start === None){
        start = step_is_neg ? len_1 : 0
    }else{
        start = $B.$call(_b_.int, self.start)
        if($B.rich_comp('__gt__', 0, start)){
            start = $B.rich_op('__add__', start, len)
            if($B.rich_comp('__gt__', 0, start)){
                start = 0
            }
        }
        if($B.rich_comp('__ge__', start, len)){
            start = step < 0 ? len_1 : len
        }
    }
    if(self.stop === None){
        stop = step_is_neg ? -1 : len
    }else{
        stop = $B.PyNumber_Index(self.stop)
        if($B.rich_comp('__gt__', 0, stop)){
            stop = $B.rich_op('__add__', stop, len)
        }
        if($B.rich_comp('__ge__', stop, len)){
            stop = step_is_neg ? len_1 : len
        }
    }
    return {start: start, stop: stop, step: step}
}

slice.start = function(self){return self.start}
slice.step = function(self){return self.step}
slice.stop = function(self){return self.stop}

slice.indices = function(self){
    // This method takes a single integer argument length and computes
    // information about the slice that the slice object would describe if
    // applied to a sequence of length items. It returns a tuple of three
    // integers; respectively these are the start and stop indices and the
    // step or stride length of the slice. Missing or out-of-bounds indices
    // are handled in a manner consistent with regular slices.
    var $ = $B.args("indices", 2, {self: null, length: null},
            ["self", "length"], arguments, {}, null, null)
    var len = $B.PyNumber_Index($.length)
    if(len < 0){
        $B.RAISE(_b_.ValueError, "length should not be negative")
    }
    var _step = (self.step == _b_.None)? 1 : self.step,
        _start,
        _stop
    if(_step < 0){
        _start = self.start
        _stop = self.stop
        _start = (_start == _b_.None)? len - 1 :
            (_start < 0)? _b_.max(-1, _start + len) : _b_.min(len - 1, self.start)
        _stop = (self.stop == _b_.None)? -1 :
            (_stop < 0)? _b_.max(-1, _stop + len) : _b_.min(len - 1, self.stop)
    }else{
        _start = (self.start == _b_.None) ? 0 : _b_.min(len, self.start)
        _stop = (self.stop == _b_.None)? len :_b_.min(len, self.stop)
        if(_start < 0){
            _start = _b_.max(0, _start + len)
        }
        if(_stop < 0){
            _stop = _b_.max(0, _stop + len)
        }
    }
    return _b_.tuple.$factory([_start, _stop, _step])
}

slice.$factory = function(){
    var $ = $B.args("slice", 3, {start: null, stop: null, step: null},
        ["start", "stop", "step"], arguments,{stop: null, step: null},
        null, null)
    return slice.$fast_slice($.start, $.stop, $.step)
}

slice.$fast_slice = function(start, stop, step){
    if(stop === null && step === null){
        stop = start
        start = _b_.None
        step = _b_.None
    }else{
        step = step === null ? _b_.None : step
    }

    var res = {
        ob_type: slice,
        start: start,
        stop: stop,
        step: step
    }
    conv_slice(res) // to check types
    return res
}

$B.set_func_names(slice, "builtins")

})(__BRYTHON__);
