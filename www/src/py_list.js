;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict, $N = _b_.None

function $list(){
    // used for list displays
    // different from list : $list(1) is valid (matches [1])
    // but list(1) is invalid (integer 1 is not iterable)
    var args = [], pos=0
    for(var i=0, _len_i = arguments.length; i < _len_i;i++){args[pos++]=arguments[i]}
    return new $ListDict(args)
}

var $ListDict = {__class__:$B.$type,
    __name__:'list',
    $native:true,
    __dir__:$ObjectDict.__dir__}

$ListDict.__add__ = function(self,other){
    var res = self.valueOf().concat(other.valueOf())
    if(isinstance(self,tuple)) res = tuple(res)
    return res
}

$ListDict.__contains__ = function(self,item){
    var _eq = getattr(item, '__eq__')
    var i=self.length
    while(i--) {
        try{if(_eq(self[i])) return true
        }catch(err){}
    }
    return false
}

$ListDict.__delitem__ = function(self,arg){

    if(isinstance(arg,_b_.int)){
        var pos = arg
        if(arg<0) pos=self.length+pos
        if(pos>=0 && pos<self.length){
            self.splice(pos,1)
            return $N
        }
        throw _b_.IndexError('list index out of range')
    }
    if(isinstance(arg,_b_.slice)) {
        var start = arg.start;if(start===None){start=0}
        var stop = arg.stop;if(stop===None){stop=self.length}
        var step = arg.step || 1
        if(start<0) start=self.length+start
        if(stop<0) stop=self.length+stop
        var res = [],i=null, pos=0
        if(step>0){
            if(stop>start){
                for(var i=start;i<stop;i+=step){
                    if(self[i]!==undefined){res[pos++]=i}
                }
            }
        } else {
            if(stop<start){
                for(var i=start;i>stop;i+=step.value){
                    if(self[i]!==undefined){res[pos++]=i}
                }
                res.reverse() // must be in ascending order
            }
        }
        // delete items from left to right
        var i=res.length
        while(i--) {
           //for(var i=res.length-1;i>=0;i--){
           self.splice(res[i],1)
        }
        return $N
    } 

    if (hasattr(arg, '__int__') || hasattr(arg, '__index__')) {
       $ListDict.__delitem__(self, _b_.int(arg))
       return $N
    }

    throw _b_.TypeError('list indices must be integer, not '+_b_.str(arg.__class__))
}

$ListDict.__eq__ = function(self,other){
    // compare object "self" to class "list"
    if(other===undefined) return self===list

    if($B.get_class(other)===$B.get_class(self)){
       if(other.length==self.length){
            var i=self.length
            while(i--) {
               if(!getattr(self[i],'__eq__')(other[i])) return false
            }
            return true
       }
    }

    if (isinstance(other, [_b_.set, _b_.tuple, _b_.list])) {
       if (self.length != getattr(other, '__len__')()) return false

       var i=self.length
       while(i--) {
          if (!getattr(other, '__contains__')(self[i])) return false
       }
       return true
    }
    return false
}

$ListDict.__getitem__ = function(self,arg){

    if(isinstance(arg,_b_.int)){
        var items=self.valueOf()
        var pos = arg
        if(arg<0) pos=items.length+pos
        if(pos>=0 && pos<items.length) return items[pos]
        
        throw _b_.IndexError('list index out of range')
    }
    if (isinstance(arg,_b_.slice)) {
        /* Find the real values for start, stop and step */
        var step = arg.step===None ? 1 : arg.step
        if (step == 0) {
            throw Error('ValueError : slice step cannot be zero');
        }
        var length = self.length;
        var start, end;
        if (arg.start === None) {
            start = step<0 ? length-1 : 0;
        } else {
            start = arg.start;
            if (start < 0) start += length;
            if (start < 0) start = step<0 ? -1 : 0
            if (start >= length) start = step<0 ? length-1 : length;
        }
        if (arg.stop === None) {
            stop = step<0 ? -1 : length;
        } else {
            stop = arg.stop;
            if (stop < 0) stop += length
            if (stop < 0) stop = step<0 ? -1 : 0
            if (stop >= length) stop = step<0 ? length-1 : length;
        }
        /* Return the sliced list  */
        var res = [], i=null, items=self.valueOf(), pos=0
        if (step > 0) {
            if (stop <= start) return res;
            for(var i=start; i<stop; i+=step) {
               res[pos++]=items[i]
            }
            return res;
        } else {
            if (stop > start) return res;
            for(var i=start; i>stop; i+=step) {
               res[pos++]=items[i]
            }
            return res;
        }
    }

    if (hasattr(arg, '__int__') || hasattr(arg, '__index__')) {
       return $ListDict.__getitem__(self, _b_.int(arg))
    }

    throw _b_.TypeError('list indices must be integer, not '+arg.__class__.__name__)
}

$ListDict.__ge__ = function(self,other){
    if(!isinstance(other,[list, _b_.tuple])){
        throw _b_.TypeError("unorderable types: list() >= "+
            $B.get_class(other).__name__+'()')
    }
    var i=0
    while(i<self.length){
        if(i>=other.length) return true
        if(getattr(self[i],'__eq__')(other[i])){i++} 
        else return(getattr(self[i],"__ge__")(other[i]))
    }

    //if(other.length==self.length) return true
    // other starts like self, but is longer
    //return false
    return other.length == self.length
}

$ListDict.__gt__ = function(self,other){
    if(!isinstance(other,[list, _b_.tuple])){
        throw _b_.TypeError("unorderable types: list() > "+
            $B.get_class(other).__name__+'()')
    }
    var i=0
    while(i<self.length){
        if(i>=other.length) return true
        if(getattr(self[i],'__eq__')(other[i])){i++}
        else return(getattr(self[i],'__gt__')(other[i]))
    }
    // other starts like self, but is as long or longer
    return false
}

$ListDict.__hash__ = None

$ListDict.__iadd__ = function(self, other) {
    for (var i = 0; i < other.length; i++) {
        self.push(other[i])
    }
    return self
}

$ListDict.__init__ = function(self,arg){
    var len_func = getattr(self,'__len__'),pop_func=getattr(self,'pop')
    while(len_func()) pop_func()

    if(arg===undefined) return $N
    var arg = iter(arg)
    var next_func = getattr(arg,'__next__')
    var pos=self.length
    while(1){
        try{self[pos++]=next_func()}
        catch(err){
            if(err.__name__=='StopIteration'){break}
            else{throw err}
        }
    }
    return $N
}

var $list_iterator = $B.$iterator_class('list_iterator')
$ListDict.__iter__ = function(self){
    return $B.$iterator(self,$list_iterator)
}

$ListDict.__le__ = function(self,other){
    return !$ListDict.__gt__(self,other)
}

$ListDict.__len__ = function(self){return self.length}

$ListDict.__lt__ = function(self,other){
    return !$ListDict.__ge__(self,other)
}

$ListDict.__mro__ = [$ListDict,$ObjectDict]

$ListDict.__mul__ = function(self,other){
    if(isinstance(other,_b_.int)) {  //this should be faster..
       var res=[],
           $temp = self.slice(0,self.length), 
           len=$temp.length
       for(var i=0;i<other;i++){for(var j=0;j<len;j++){res.push($temp[j])}}
       return res
    }
    
    if (hasattr(other, '__int__') || hasattr(other, '__index__')) {
       return $ListDict.__mul__(self, _b_.int(other))
    }

    throw _b_.TypeError("can't multiply sequence by non-int of type '"+
            $B.get_class(other).__name__+"'")
}


$ListDict.__ne__ = function(self,other){return !$ListDict.__eq__(self,other)}

$ListDict.__repr__ = function(self){
    if(self===undefined) return "<class 'list'>"

    var _r=self.map(_b_.repr)

    if (self.__class__===$TupleDict){
        if(self.length==1){return '('+_r[0]+',)'}
        return '('+_r.join(', ')+')'
    }
    return '['+_r.join(', ')+']'
}

$ListDict.__setitem__ = function(self,arg,value){
    if(isinstance(arg,_b_.int)){
        var pos = arg
        if(arg<0) pos=self.length+pos
        if(pos>=0 && pos<self.length){self[pos]=value}
        else {throw _b_.IndexError('list index out of range')}
        return $N
    }
    if(isinstance(arg,slice)){
        var start = arg.start===None ? 0 : arg.start
        var stop = arg.stop===None ? self.length : arg.stop
        var step = arg.step===None ? 1 : arg.step
        if(start<0) start=self.length+start
        if(stop<0) stop=self.length+stop
        self.splice(start,stop-start)
        // copy items in a temporary JS array
        // otherwise, a[:0]=a fails
        var $temp
        if(Array.isArray(value)){$temp = Array.prototype.slice.call(value)}
        else if(hasattr(value,'__iter__')){$temp = list(value)}
        if($temp!==undefined){
            for(var i=$temp.length-1;i>=0;i--){
                self.splice(start,0,$temp[i])
            }
            return $N
        }

        throw _b_.TypeError("can only assign an iterable")
    }

    if (hasattr(arg, '__int__') || hasattr(arg, '__index__')) {
       $ListDict.__setitem__(self, _b_.int(arg), value)
       return $N
    }

    throw _b_.TypeError('list indices must be integer, not '+arg.__class__.__name__)
}

$ListDict.__str__ = $ListDict.__repr__

// add "reflected" methods
$B.make_rmethods($ListDict)

var _ops=['add', 'sub']

$ListDict.append = function(self,other){self[self.length]=other;return $N}

$ListDict.clear = function(self){ while(self.length){self.pop()};return $N}

$ListDict.copy = function(self){return self.slice(0,self.length)}

$ListDict.count = function(self,elt){
    var res = 0
    _eq=getattr(elt, '__eq__')
    var i=self.length
    while (i--) if (_eq(self[i])) res++
    return res
}

$ListDict.extend = function(self,other){
    if(arguments.length!=2){throw _b_.TypeError(
        "extend() takes exactly one argument ("+arguments.length+" given)")}
    other = iter(other)
    var pos=self.length
    while(1){
        try{self[pos++]=next(other)}
        catch(err){
            if(err.__name__=='StopIteration'){break}
            else{throw err}
        }
    }
    return $N
}

$ListDict.index = function(self,elt){
    var _eq = getattr(elt, '__eq__')
    for(var i=0, _len_i = self.length; i < _len_i;i++){
        if(_eq(self[i])) return i
    }
    throw _b_.ValueError(_b_.str(elt)+" is not in list")
}

$ListDict.insert = function(self,i,item){self.splice(i,0,item);return $N}

$ListDict.remove = function(self,elt){
    var _eq = getattr(elt, '__eq__')
    for(var i=0, _len_i = self.length; i < _len_i;i++){
        if(_eq(self[i])){
            self.splice(i,1)
            return $N
        }
    }
    throw _b_.ValueError(_b_.str(elt)+" is not in list")
}

$ListDict.pop = function(self,pos){
    if(pos===undefined){ // can't use self.pop() : too much recursion !
        return self.splice(self.length-1,1)[0]
    }
    if(arguments.length==2){
        if(isinstance(pos,_b_.int)){
            var res = self[pos]
            self.splice(pos,1)
            return res
        }
        throw _b_.TypeError(pos.__class__+" object cannot be interpreted as an integer")
    } 
    throw _b_.TypeError("pop() takes at most 1 argument ("+(arguments.length-1)+' given)')
}

$ListDict.reverse = function(self){
    var _len=self.length-1
    var i=parseInt(self.length/2)
    while (i--) {
        var buf = self[i]
        self[i] = self[_len-i]
        self[_len-i] = buf
    }
    return $N
}
    
// QuickSort implementation found at http://en.literateprograms.org/Quicksort_(JavaScript)
function $partition(arg,array,begin,end,pivot)
{
    var piv=array[pivot];
    array = swap(array, pivot, end-1);
    var store=begin;
    if(arg===null){
        if(array.$cl!==false){
            // Optimisation : if all elements have the same time, the 
            // comparison function __le__ can be computed once
            var le_func = _b_.getattr(array.$cl, '__le__')
            for(var ix=begin;ix<end-1;++ix) {
                if(le_func(array[ix],piv)) {
                    array = swap(array, store, ix);
                    ++store;
                }
            }
        }else{
            for(var ix=begin;ix<end-1;++ix) {
                if(getattr(array[ix],'__le__')(piv)) {
                    array = swap(array, store, ix);
                    ++store;
                }
            }
        }
    }else{
        for(var ix=begin;ix<end-1;++ix) {
            if(getattr(arg(array[ix]),'__le__')(arg(piv))) {
                array = swap(array, store, ix);
                ++store;
            }
        }
    }
    array = swap(array, end-1, store);
    return store;
}

function swap(_array,a,b){
    var tmp=_array[a];
    _array[a]=_array[b];
    _array[b]=tmp;
    return _array
}

function $qsort(arg,array, begin, end)
{
    if(end-1>begin) {
        var pivot=begin+Math.floor(Math.random()*(end-begin));
        pivot=$partition(arg,array, begin, end, pivot);
        $qsort(arg,array, begin, pivot);
        $qsort(arg,array, pivot+1, end);
    }
}

function $elts_class(self){
    // If all elements are of the same class, return it
    if(self.length==0){return null}
    var cl = $B.get_class(self[0]), i=self.length

    while (i--) {
    //for(var i=1, _len_i = self.length; i < _len_i;i++){
        if($B.get_class(self[i])!==cl) return false
    }
    return cl
}

$ListDict.sort = function(self){
    var func=null
    var reverse = false
    for(var i=1, _len_i = arguments.length; i < _len_i;i++){
        var arg = arguments[i]
        if(arg.$nat=='kw'){
            var kw_args = arg.kw
            for(var key in kw_args){
                if(key=='key'){func=getattr(kw_args[key],'__call__')}
                else if(key=='reverse'){reverse=kw_args[key]}
            }
        }
    }
    if(self.length==0) return
    self.$cl = $elts_class(self)
    if(func===null && self.$cl===_b_.str.$dict){self.sort()}
    else if(func===null && self.$cl===_b_.int.$dict){
        self.sort(function(a,b){return a-b})
    }
    else{$qsort(func,self,0,self.length)}
    if(reverse) $ListDict.reverse(self)
    // Javascript libraries might use the return value
    return (self.__brython__ ? $N : self)
}

$B.set_func_names($ListDict)

// constructor for built-in type 'list'
function list(obj){
    if(arguments.length===0) return []
    if(arguments.length>1){
        throw _b_.TypeError("list() takes at most 1 argument ("+arguments.length+" given)")
    }
    if(Array.isArray(obj)){ // most simple case
        obj = obj.slice() // list(t) is not t
        obj.__brython__ = true;
        if(obj.__class__==$TupleDict){
            var res = obj.slice()
            res.__class__ = $ListDict
            return res
        }
        return obj
    }
    var res = [], pos=0
    var arg = iter(obj)
    var next_func = getattr(arg,'__next__')
    while(1){
        try{res[pos++]=next_func()}
        catch(err){
            if(err.__name__!='StopIteration'){throw err}
            break
        }
    }
    res.__brython__ = true // false for Javascript arrays - used in sort()
    return res
}
list.__class__ = $B.$factory
list.$dict = $ListDict
$ListDict.$factory = list
list.$is_func = true

list.__module__='builtins'
list.__bases__=[]


// dictionary and factory for subclasses of list
var $ListSubclassDict = {
    __class__:$B.$type,
    __name__:'list'
}

// the methods in subclass apply the methods in $ListDict to the
// result of instance.valueOf(), which is a Javascript list
for(var $attr in $ListDict){
    if(typeof $ListDict[$attr]=='function'){
        $ListSubclassDict[$attr]=(function(attr){
            return function(){
                var args = []
                if(arguments.length>0){
                    var args = [arguments[0].valueOf()]
                    var pos=1
                    for(var i=1, _len_i = arguments.length; i < _len_i;i++){
                        args[pos++]=arguments[i]
                    }
                }
                return $ListDict[attr].apply(null,args)
            }
        })($attr)
    }
}
$ListSubclassDict.__init__ = function(self){
    var res = [], args=[res], pos=1
    for(var i=1;i<arguments.length;i++){args[pos++]=arguments[i]}
    $ListDict.__init__.apply(null, args)
    self.valueOf = function(){return res}
    return $N
}
$ListSubclassDict.__mro__ = [$ListSubclassDict,$ObjectDict]

// factory for list subclasses
$B.$ListSubclassFactory = {
    __class__:$B.$factory,
    $dict:$ListSubclassDict
}

// Tuples
function $tuple(arg){return arg} // used for parenthesed expressions

var $TupleDict = {__class__:$B.$type,__name__:'tuple',$native:true}

$TupleDict.__iter__ = function(self){
    return $B.$iterator(self,$tuple_iterator)
}

// other attributes are defined in py_list.js, once list is defined

var $tuple_iterator = $B.$iterator_class('tuple_iterator')

// type() is implemented in py_utils

function tuple(){
    var obj = list.apply(null,arguments)
    obj.__class__ = $TupleDict
    return obj
}
tuple.__class__ = $B.$factory
tuple.$dict = $TupleDict
tuple.$is_func = true

$TupleDict.$factory = tuple
$TupleDict.__new__ = $B.$__new__(tuple)

tuple.__module__='builtins'

// add tuple methods
for(var attr in $ListDict){
    switch(attr) {
      case '__delitem__':
      case '__setitem__':
      case 'append':
      case 'extend':
      case 'insert':
      case 'remove':
      case 'pop':
      case 'reverse':
      case 'sort':
        break
      default:   
        if($TupleDict[attr]===undefined){
            if(typeof $ListDict[attr]=='function'){
                $TupleDict[attr] = (function(x){
                    return function(){return $ListDict[x].apply(null, arguments)}
                })(attr)
            }else{
                $TupleDict[attr] = $ListDict[attr]
            }
        }
    }//switch
}

$TupleDict.__delitem__ = function(){
    throw _b_.TypeError("'tuple' object doesn't support item deletion")
}
$TupleDict.__setitem__ = function(){
    throw _b_.TypeError("'tuple' object does not support item assignment")
}

$TupleDict.__eq__ = function(self,other){
    // compare object "self" to class "list"
    if(other===undefined) return self===tuple
    return $ListDict.__eq__(self,other)
}

$TupleDict.__hash__ = function (self) {
  // http://nullege.com/codes/show/src%40p%40y%40pypy-HEAD%40pypy%40rlib%40test%40test_objectmodel.py/145/pypy.rlib.objectmodel._hash_float/python
  var x= 0x345678
  for(var i=0, _len_i = self.length; i < _len_i; i++) {
     var y=_b_.hash(self[i]);
     x=(1000003 * x) ^ y & 0xFFFFFFFF;
  }
  return x
}

$TupleDict.__mro__ = [$TupleDict,$ObjectDict]
$TupleDict.__name__ = 'tuple'

// set __repr__ and __str__
$B.set_func_names($TupleDict)

_b_.list = list
_b_.tuple = tuple

// set object.__bases__ to an empty tuple
_b_.object.$dict.__bases__ = tuple()

})(__BRYTHON__)
