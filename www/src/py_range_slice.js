// range
;(function($B){

var _b_ = $B.builtins,
    None = _b_.None,
    $RangeDict = {__class__:$B.$type,
        __dir__:_b_.object.$dict.__dir__,
        __name__:'range',
        $native:true,
        descriptors:{start:true,step:true,stop:true}
    }

$RangeDict.__contains__ = function(self,other){
    if($RangeDict.__len__(self)==0){return false}
    try{other = $B.int_or_bool(other)}
    catch(err){
        // If other is not an integer, test if it is equal to
        // one of the items in range
        try{$RangeDict.index(self, other); return true}
        catch(err){return false}
    }
    
    var sub = $B.sub(other, self.start),
        fl = $B.floordiv(sub, self.step),
        res = $B.mul(self.step, fl)
    if($B.eq(res, sub)){
        if($B.gt(self.stop, self.start)){
            return $B.ge(other, self.start) && $B.gt(self.stop, other)
        }else{
            return $B.ge(self.start, other) && $B.gt(other, self.stop)
        }
    }else{
        return false
    }
}

$RangeDict.__delattr__ = function(self, attr, value){
    throw _b_.AttributeError('readonly attribute')
}

$RangeDict.__eq__ = function(self, other){
    if(_b_.isinstance(other, range)){
        var len = $RangeDict.__len__(self)
        if(!$B.eq(len,$RangeDict.__len__(other))){return false}
        if(len==0){return true}
        if(!$B.eq(self.start,other.start)){return false}
        if(len==1){return true}
        return $B.eq(self.step, other.step)
    }
    return false
}

function compute_item(r, i){
    var len = $RangeDict.__len__(r)
    if(len==0){return r.start}
    else if(i>len){return r.stop}
    return $B.add(r.start, $B.mul(r.step, i))
}

$RangeDict.__getitem__ = function(self,rank){
    if(_b_.isinstance(rank, _b_.slice)){
        var norm = _b_.slice.$dict.$conv_for_seq(rank, $RangeDict.__len__(self)),
            substep = $B.mul(self.step, norm.step),
            substart = compute_item(self, norm.start),
            substop = compute_item(self, norm.stop)
        return range(substart, substop, substep)
    }
    if(typeof rank != "number") {
      rank=$B.$GetInt(rank)
    }
    if($B.gt(0, rank)){rank = $B.add(rank, $RangeDict.__len__(self))}
    var res = $B.add(self.start, $B.mul(rank, self.step))
    if(($B.gt(self.step,0) && ($B.ge(res, self.stop) || $B.gt(self.start, res))) ||
        ($B.gt(0, self.step) && ($B.ge(self.stop, res) || $B.gt(res, self.start)))){
            throw _b_.IndexError('range object index out of range')
    }
    return res   
}

$RangeDict.__hash__ = function(self){
    var len = $RangeDict.__len__(self)
    if(len==0){return _b_.hash(_b_.tuple([0, None, None]))}
    if(len==1){return _b_.hash(_b_.tuple([1, self.start, None]))}
    return _b_.hash(_b_.tuple([len, self.start, self.step]))
}

var $RangeIterator = function(obj){
    return {__class__:$RangeIterator.$dict, obj: obj}
}
$RangeIterator.__class__ = $B.$factory
$RangeIterator.$dict = {
    __class__: $B.$type,
    __name__: 'range_iterator',
    $factory: $RangeIterator,
    
    __iter__: function(self){return self},
    
    __next__: function(self){return _b_.next(self.obj)}
}
$RangeIterator.$dict.__mro__ = [_b_.object.$dict]

$RangeDict.__iter__ = function(self){
    var res = {
        __class__ : $RangeDict,
        start:self.start,
        stop:self.stop,
        step:self.step
    }
    if(self.$safe){
        res.$counter = self.start-self.step
    }else{
        res.$counter = $B.sub(self.start, self.step)
    }
    return $RangeIterator(res)
}

$RangeDict.__len__ = function(self){
    var len
    if($B.gt(self.step,0)){
        if($B.ge(self.start, self.stop)){return 0}
        // len is 1+(self.stop-self.start-1)/self.step
        var n = $B.sub(self.stop, $B.add(1, self.start)),
            q = $B.floordiv(n, self.step)
        len = $B.add(1, q)
    }else{
        if($B.ge(self.stop, self.start)){return 0}
        var n = $B.sub(self.start, $B.add(1, self.stop)),
            q = $B.floordiv(n, $B.mul(-1, self.step))
        len = $B.add(1, q)
    }
    //if($B.gt(len, $B.maxsise)){throw _b_.OverflowError("range len too big")}
    if($B.maxsize===undefined){
        $B.maxsize = $B.LongInt.$dict.__pow__($B.LongInt(2), 63)
        $B.maxsize = $B.LongInt.$dict.__sub__($B.maxsize, 1)
    }
    return len
}

$RangeDict.__next__ = function(self){
    if(self.$safe){
        self.$counter += self.step
        if((self.step>0 && self.$counter >= self.stop)
            || (self.step<0 && self.$counter <= self.stop)){
                throw _b_.StopIteration('')
        }
    }else{
        self.$counter = $B.add(self.$counter, self.step)
        if(($B.gt(self.step,0) && $B.ge(self.$counter, self.stop))
            || ($B.gt(0, self.step) && $B.ge(self.stop, self.$counter))){
                throw _b_.StopIteration('')
        }
    }
    return self.$counter
}

$RangeDict.__mro__ = [_b_.object.$dict]

$RangeDict.__reversed__ = function(self){
    var n = $B.sub($RangeDict.__len__(self), 1)
    return range($B.add(self.start, $B.mul(n, self.step)),
        $B.sub(self.start,self.step),
        $B.mul(-1,self.step))
}

$RangeDict.__repr__ = $RangeDict.__str__ = function(self){
    var res = 'range('+_b_.str(self.start)+', '+_b_.str(self.stop)
    if(self.step!=1) res += ', '+_b_.str(self.step)
    return res+')'
}

$RangeDict.__setattr__ = function(self, attr, value){
    throw _b_.AttributeError('readonly attribute')
}

//$RangeDict.descriptors = {
    //start: function(self){return self.start},
    //step: function(self){return self.step},
    //stop: function(self){return self.stop}
//}
$RangeDict.start = function(self){return self.start}
$RangeDict.step = function(self){return self.step},
$RangeDict.stop = function(self){return self.stop}

$RangeDict.count = function(self, ob){
    if(_b_.isinstance(ob, [_b_.int, _b_.float, _b_.bool])){
        return _b_.int($RangeDict.__contains__(self, ob))
    }else{
        var comp = _b_.getattr(ob, '__eq__'),
            it = $RangeDict.__iter__(self)
            _next = $RangeIterator.$dict.__next__,
            nb = 0
        while(true){
            try{
                if(comp(_next(it))){nb++}
            }catch(err){
                if(_b_.isinstance(err, _b_.StopIteration)){
                    return nb
                }
                throw err
            }
        }
    }
}

$RangeDict.index = function(self, other){
    var $ = $B.args('index', 2, {self:null, other:null},['self','other'],
        arguments,{},null,null),
        self=$.self, other=$.other
    try{
        other = $B.int_or_bool(other)
    }catch(err){
        var comp = _b_.getattr(other, '__eq__'),
            it = $RangeDict.__iter__(self),
            _next = $RangeIterator.$dict.__next__,
            nb = 0
        while(true){
            try{
                if(comp(_next(it))){return nb}
                nb++
            }catch(err){
                if(_b_.isinstance(err, _b_.StopIteration)){
                    throw _b_.ValueError(_b_.str(other)+' not in range')
                }
                throw err
            }
        }
    }
    var sub = $B.sub(other, self.start),
        fl = $B.floordiv(sub, self.step),
        res = $B.mul(self.step, fl)
    if($B.eq(res, sub)){
        if(($B.gt(self.stop, self.start) && $B.ge(other, self.start) 
            && $B.gt(self.stop, other)) ||
            ($B.ge(self.start, self.stop) && $B.ge(self.start, other) 
            && $B.gt(other, self.stop))){
                return fl
        }else{throw _b_.ValueError(_b_.str(other)+' not in range')}
    }else{
        throw _b_.ValueError(_b_.str(other)+' not in range')            
    }
}

function range(){
    var $=$B.args('range',3,{start:null,stop:null,step:null},
        ['start','stop','step'],arguments,{stop:null,step:null},null,null),
        start=$.start,stop=$.stop,step=$.step,safe
    if(stop===null && step===null){
        stop = $B.PyNumber_Index(start)
        safe = typeof stop==="number"
        return{__class__:$RangeDict,
            start: 0,
            stop: stop,
            step: 1,
            $is_range: true,
            $safe: safe
        }
    }
    if(step===null){step=1}
    start = $B.PyNumber_Index(start)
    stop = $B.PyNumber_Index(stop)
    step = $B.PyNumber_Index(step)
    if(step==0){throw _b_.ValueError("range() arg 3 must not be zero")}
    safe = (typeof start=='number' && typeof stop=='number' &&
        typeof step=='number')
    return {__class__: $RangeDict,
        start: start,
        stop: stop,
        step: step,
        $is_range: true,
        $safe: safe
    }
}
range.__class__ = $B.$factory
range.$dict = $RangeDict
$RangeDict.$factory = range
range.$is_func = true

// slice
// slice
var $SliceDict = {__class__:$B.$type, 
    __name__:'slice', 
    $native:true,
    descriptors:{start:true,step:true,stop:true}
}

$SliceDict.__mro__ = [_b_.object.$dict]

$SliceDict.__repr__ = $SliceDict.__str__ = function(self){
        return 'slice('+_b_.str(self.start)+','+
            _b_.str(self.stop)+','+_b_.str(self.step)+')'
    }

$SliceDict.__setattr__ = function(self, attr, value){
    throw _b_.AttributeError('readonly attribute')
}

$SliceDict.$conv = function(self, len){
    // Internal method, uses the integer len to set
    // start, stop, step to integers
    return {start: self.start === _b_.None ? 0 : self.start,
        stop: self.stop === _b_.None ? len : self.stop,
        step: self.step === _b_.None ? 1 : self.step
    }
}

$SliceDict.$conv_for_seq = function(self, len){
    // Internal method, uses the integer len to set
    // start, stop, step to integers
    var step = self.step===None ? 1 : $B.PyNumber_Index(self.step),
        step_is_neg = $B.gt(0, step),
        len_1 = $B.sub(len, 1)
    if (step == 0) {
        throw _b_.ValueError('slice step cannot be zero');
    }
    var start
    if (self.start === None) {
        start = step_is_neg ? len_1 : 0;
    } else {
        start = $B.PyNumber_Index(self.start);
        if ($B.gt(0, start)) start = $B.add(start, len);
        if ($B.gt(0, start)) start = step<0 ? -1 : 0
        if ($B.ge(start, len)) start = step<0 ? len_1 : len;
    }
    if (self.stop === None) {
        stop = step_is_neg ? -1 : len;
    } else {
        stop = $B.PyNumber_Index(self.stop);
        if ($B.gt(0, stop)) stop += len
        if ($B.gt(0, stop)) stop = step<0 ? -1 : 0
        if ($B.ge(stop, len)) stop = step_is_neg ? len_1 : len;
    }
    return {start: start, stop: stop, step: step}
}

//$SliceDict.descriptors = {
    //start: function(self){return self.start},
    //step: function(self){return self.step},
    //stop: function(self){return self.stop}
//}
$SliceDict.start = function(self){return self.start}
$SliceDict.step = function(self){return self.step}
$SliceDict.stop = function(self){return self.stop}

$SliceDict.indices = function (self, length) {
  var len=$B.$GetInt(length)
  if (len < 0) _b_.ValueError('length should not be negative')
  if (self.step > 0) {
     var _len = _b_.min(len, self.stop)
     return _b_.tuple([self.start, _len, self.step])
  } else if (self.step == _b_.None) {
     var _len = _b_.min(len, self.stop)
     var _start = self.start
     if (_start == _b_.None) _start = 0
     return _b_.tuple([_start, _len, 1])
  }
  _b_.NotImplementedError("Error! negative step indices not implemented yet")
}

function slice(){
    var $=$B.args('slice',3,{start:null, stop:null, step:null},
        ['start', 'stop', 'step'],arguments,{stop:null, step:null},
        null,null),
        start, stop, step

    if($.stop===null && $.step===null){
        start = _b_.None
        stop = $.start
        step = _b_.None
    }else{
        start = $.start
        stop = $.stop
        step = $.step === null ? _b_.None : $.step
    }

    var res = {
        __class__ : $SliceDict,
        start:start,
        stop:stop,
        step:step
    }
    return res
}
slice.__class__ = $B.$factory
slice.$dict = $SliceDict
$SliceDict.$factory = slice
slice.$is_func = true

_b_.range = range
_b_.slice = slice

})(__BRYTHON__)
