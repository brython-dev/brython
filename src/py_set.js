;(function($B){

var _ = $B.builtins

// set

var $SetDict = {
    __class__:$B.$type,
    __dir__:_.object.$dict.__dir__,
    __name__:'set',
    $native:true
}

$SetDict.__add__ = function(self,other){
    return set(self.$items.concat(other.$items))
}

$SetDict.__and__ = function(self, other, accept_iter){
    $test(accept_iter, other)
    var res = set()
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(_.getattr(other,'__contains__')(self.$items[i])){
            $SetDict.add(res,self.$items[i])
        }
    }
    return res
}

$SetDict.__contains__ = function(self,item){
    if(self.$num && (typeof item=='number')){return self.$items.indexOf(item)>-1}
    if(self.$str && (typeof item=='string')){return self.$items.indexOf(item)>-1}
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        try{if(_.getattr(self.$items[i],'__eq__')(item)) return true
        }catch(err){void(0)}
    }
    return false
}

$SetDict.__eq__ = function(self,other){
    // compare class set
    if(other===undefined) return self===set
    
    if(_.isinstance(other,set)){
      if(other.$items.length==self.$items.length){
        for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
           if($SetDict.__contains__(self,other.$items[i])===false) return false
        }
        return true
      }
    }
    return false
}

$SetDict.__ge__ = function(self,other){return !$SetDict.__lt__(self,other)}

// special method to speed up "for" loops
$SetDict.__getitems__ = function(self){return self.$items}

$SetDict.__gt__ = function(self, other, accept_iter){
    $test(accept_iter, other)
    return !$SetDict.__le__(self, other)
}

$SetDict.__hash__ = function(self) {
    if (self === undefined) {
       return $SetDict.__hashvalue__ || $B.$py_next_hash--
    }
    throw _.TypeError("unhashable type: 'set'");
}

$SetDict.__init__ = function(self){
    var args = []
    for(var i=1, _len_i = arguments.length; i < _len_i;i++){
        args.push(arguments[i])
    }
    if(args.length==0) return
    if(args.length==1){    // must be an iterable
        var arg=args[0]
        if(_.isinstance(arg,set)){
            self.$items = arg.$items
            return
        }
        try{
            var iterable = _.iter(arg)
            var obj = {$items:[],$str:true,$num:true}
            while(1){
                try{$SetDict.add(obj,_.next(iterable))}
                catch(err){
                    if(err.__name__=='StopIteration'){$B.$pop_exc();break}
                    throw err
                }
            }
            self.$items = obj.$items
            //console.log('set init, str '+obj.$str+' num '+obj.$num)
        }catch(err){
            console.log(''+err)
            throw _.TypeError("'"+arg.__class__.__name__+"' object is not iterable")
        }
    } else {
        throw _.TypeError("set expected at most 1 argument, got "+args.length)
    }
}

var $set_iterator = $B.$iterator_class('set iterator')
$SetDict.__iter__ = function(self){
    return $B.$iterator(self.$items,$set_iterator)
}

$SetDict.__le__ = function(self,other,accept_iter){
    $test(accept_iter, other)
    var cfunc = _.getattr(other,'__contains__')
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(!cfunc(self.$items[i])) return false
    }
    return true
}

$SetDict.__len__ = function(self){return self.$items.length}

$SetDict.__lt__ = function(self,other){
    return ($SetDict.__le__(self,other) &&
        $SetDict.__len__(self)<_.getattr(other,'__len__')())
}

$SetDict.__mro__ = [$SetDict,_.object.$dict]

$SetDict.__ne__ = function(self,other){return !$SetDict.__eq__(self,other)}

$SetDict.__or__ = function(self,other,accept_iter){
    $test(accept_iter, other)
    var res = $SetDict.copy(self)
    var func = _.getattr(_.iter(other),'__next__')
    while(true){
        try{$SetDict.add(res, func())}
        catch(err){
            if(_.isinstance(err, _.StopIteration)){$B.$pop_exc();break}
            throw err
        }
    }
    return res
}

$SetDict.__str__ = $SetDict.toString = $SetDict.__repr__ = function(self){
    if(self===undefined) return "<class 'set'>"
    var head='',tail=''
    frozen = self.$real === 'frozen'
    if(self.$items.length===0){
        if(frozen) return 'frozenset()'
        return 'set()'
    }
    if(self.__class__===$SetDict && frozen){
        head = 'frozenset('
        tail = ')'
    }else if(self.__class__!==$SetDict){ // subclasses
        head = self.__class__.__name__+'('
        tail = ')'
    }
    var res = "{"
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        res += _.repr(self.$items[i])
        if(i<self.$items.length-1){res += ','}
    }
    res += '}'
    return head+res+tail
}

$SetDict.__sub__ = function(self, other, accept_iter){
    // Return a new set with elements in the set that are not in the others
    $test(accept_iter, other)
    var res = set()
    var cfunc = _.getattr(other,'__contains__')
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(!cfunc(self.$items[i])){
            res.$items.push(self.$items[i])
        }
    }
    return res
}

$SetDict.__xor__ = function(self, other, accept_iter){
    // Return a new set with elements in either the set or other but not both
    $test(accept_iter, other)
    var res = set()
    var cfunc = _.getattr(other,'__contains__')
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(!cfunc(self.$items[i])){
            $SetDict.add(res,self.$items[i])
        }
    }
    for(var i=0, _len_i = other.$items.length; i < _len_i;i++){
        if(!$SetDict.__contains__(self,other.$items[i])){
            $SetDict.add(res,other.$items[i])
        }
    }
    return res
}

function $test(accept_iter, other){
    if(accept_iter===undefined && !_.isinstance(other,[set, frozenset])){
        throw TypeError("unsupported operand type(s) for |: 'set' and '"+
            $B.get_class(other).__name__+"'")
    }
}

// add "reflected" methods
$B.make_rmethods($SetDict)

$SetDict.add = function(self,item){
    if(self.$str && !(typeof item=='string')){self.$str=false}
    if(self.$num && !(typeof item=='number')){self.$num=false}
    if(self.$num||self.$str){
        if(self.$items.indexOf(item)==-1){self.$items.push(item)}
        return
    }
    var cfunc = _.getattr(item,'__eq__')
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        try{if(cfunc(self.$items[i])) return}
        catch(err){void(0)} // if equality test throws exception
    }
    self.$items.push(item)
}

$SetDict.clear = function(self){self.$items = []}

$SetDict.copy = function(self){
    var res = set() // copy returns an instance of set, even for subclasses
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++) res.$items[i]=self.$items[i]
    return res
}

$SetDict.discard = function(self,item){
    try{$SetDict.remove(self,item)}
    catch(err){if(err.__name__!=='KeyError'){throw err}}
}

$SetDict.isdisjoint = function(self,other){
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(_.getattr(other,'__contains__')(self.$items[i])) return false
    }
    return true
}

$SetDict.pop = function(self){
    if(self.$items.length===0) throw _.KeyError('pop from an empty set')
    return self.$items.pop()
}

$SetDict.remove = function(self,item){
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        if(_.getattr(self.$items[i],'__eq__')(item)){
            self.$items.splice(i,1)
            return _.None
        }
    }
    throw _.KeyError(item)
}

$SetDict.update = function(self,other){
    if (other === undefined || other.$items === undefined) return

    for(var i=0, _len_i = other.$items.length; i < _len_i; i++) {
        $SetDict.add(self,other.$items[i])
    }
}

/*
The non-operator versions of union(), intersection(), difference(), and 
symmetric_difference(), issubset(), and issuperset() methods will accept any 
iterable as an argument. In contrast, their operator based counterparts 
require their arguments to be sets. This precludes error-prone constructions 
like set('abc') & 'cbs' in favor of the more readable 
set('abc').intersection('cbs').
*/
$SetDict.symmetric_difference = function(self, other){
    return $SetDict.__xor__(self, other, 1)
}
$SetDict.difference = function(self, other){
    $SetDict.__sub__(self, other, 1)
}
$SetDict.intersection = function(self, other){
    return $SetDict.__and__(self, other, 1)
}
$SetDict.issubset = function(self, other){
    return $SetDict.__le__(self, other, 1)
}
$SetDict.issuperset = function(self, other){
    return $SetDict.__ge__(self, other, 1)
}
$SetDict.union = function(self, other){
    return $SetDict.__or__(self, other, 1)
}

function set(){
    // Instances of set have attributes $str and $num
    // $str is true if all the elements in the set are string, $num if
    // all the elements are integers
    // They are used to speed up operations on sets
    var res = {__class__:$SetDict,$str:true,$num:true,$items:[]}
    // apply __init__ with arguments of set()
    var args = [res].concat(Array.prototype.slice.call(arguments))
    $SetDict.__init__.apply(null,args)
    return res
}
set.__class__ = $B.$factory
set.$dict = $SetDict
$SetDict.$factory = set
$SetDict.__new__ = $B.$__new__(set)

$B.set_func_names($SetDict)

var $FrozensetDict = {__class__:$B.$type,__name__:'frozenset'}

$FrozensetDict.__mro__ = [$FrozensetDict,_.object.$dict]

$FrozensetDict.__str__=$FrozensetDict.toString=$FrozensetDict.__repr__ = function(self){
    if(self===undefined) return "<class 'frozenset'>"
    if(self.$items.length===0) return 'frozenset()'
    var res = "{"
    for(var i=0, _len_i = self.$items.length; i < _len_i;i++){
        res += _.repr(self.$items[i])
        if(i<self.$items.length-1){res += ','}
    }
    res += '}'
    return 'frozenset('+res+')'
}

for(var attr in $SetDict){
    switch(attr) {
      case 'add':
      case 'clear':
      case 'discard':
      case 'pop':
      case 'remove':
      case 'update':
        break
      default:
        if($FrozensetDict[attr] ==undefined){
            if(typeof $SetDict[attr]=='function'){
                $FrozensetDict[attr] = (function(x){
                    return function(){return $SetDict[x].apply(null, arguments)}
                })(attr)
            }else{
                $FrozensetDict[attr] = $SetDict[attr]
            }
        }
    }
}

// hash is allowed on frozensets
$FrozensetDict.__hash__ = function(self) {
   if (self === undefined) {
      return $FrozensetDict.__hashvalue__ || $B.$py_next_hash--  // for hash of string type (not instance of string)
   }

   //taken from python repo /Objects/setobject.c

   if (self.__hashvalue__ !== undefined) return self.__hashvalue__

   var _hash=1927868237
   _hash *=self.$items.length   

   for (var i=0, _len_i = self.$items.length; i < _len_i; i++) {
      var _h=hash(self.$items[i])
      _hash ^= ((_h ^ 89869747) ^ (_h << 16)) * 3644798167
   }

   _hash *= 69069 + 907133923

   if (_hash == -1) _hash = 590923713

   return self.__hashvalue__ = _hash
}

function frozenset(){
    var res = set.apply(null,arguments)
    res.__class__ = $FrozensetDict
    return res
}
frozenset.__class__ = $B.$factory
frozenset.$dict = $FrozensetDict
$FrozensetDict.__new__ = $B.$__new__(frozenset)
$FrozensetDict.$factory = frozenset

$B.set_func_names($FrozensetDict)

_.set = set
_.frozenset = frozenset

})(__BRYTHON__)
