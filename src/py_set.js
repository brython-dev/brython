;(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))

// set

var $SetDict = {
    __class__:$B.$type,
    __name__:'set',
    $native:true
}

$SetDict.__add__ = function(self,other){
    return set(self.$items.concat(other.$items))
}

$SetDict.__and__ = function(self,other){
    var res = set()
    for(var i=0;i<self.$items.length;i++){
        if(getattr(other,'__contains__')(self.$items[i])){
            $SetDict.add(res,self.$items[i])
        }
    }
    return res
}

$SetDict.__contains__ = function(self,item){
    if(self.$num && (typeof item=='number')){return self.$items.indexOf(item)>-1}
    if(self.$str && (typeof item=='string')){return self.$items.indexOf(item)>-1}
    for(var i=0;i<self.$items.length;i++){
        try{if(getattr(self.$items[i],'__eq__')(item)) return true
        }catch(err){void(0)}
    }
    return false
}

$SetDict.__eq__ = function(self,other){
    // compare class set
    if(other===undefined) return self===set
    
    if(isinstance(other,set)){
      if(other.$items.length==self.$items.length){
        for(var i=0;i<self.$items.length;i++){
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

$SetDict.__gt__ = function(self,other){return !$SetDict.__le__(self,other)}

$SetDict.__hash__ = function(self) {throw _b_.TypeError("unhashable type: 'set'");}

$SetDict.__init__ = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    self.$items = []
    if(args.length==0) return
    if(args.length==1){    // must be an iterable
        var arg=args[0]
        if(isinstance(arg,set)){
            self.$items = arg.$items
            return
        }
        try{
            var iterable = iter(arg)
            var obj = {$items:[],$str:true,$num:true}
            while(1){
                try{$SetDict.add(obj,next(iterable))}
                catch(err){
                    if(err.__name__=='StopIteration'){$B.$pop_exc();break}
                    throw err
                }
            }
            self.$items = obj.$items
            //console.log('set init, str '+obj.$str+' num '+obj.$num)
        }catch(err){
            console.log(''+err)
            throw _b_.TypeError("'"+arg.__class__.__name__+"' object is not iterable")
        }
    } else {
        throw _b_.TypeError("set expected at most 1 argument, got "+args.length)
    }
}

var $set_iterator = $B.$iterator_class('set iterator')
$SetDict.__iter__ = function(self){
    return $B.$iterator(self.$items,$set_iterator)
}

$SetDict.__le__ = function(self,other){
    var cfunc = getattr(other,'__contains__')
    for(var i=0;i<self.$items.length;i++){
        if(!cfunc(self.$items[i])) return false
    }
    return true
}

$SetDict.__len__ = function(self){return self.$items.length}

$SetDict.__lt__ = function(self,other){
    return $SetDict.__le__(self,other)&&$SetDict.__len__(self)<getattr(other,'__len__')()
}

$SetDict.__mro__ = [$SetDict,_b_.object.$dict]

$SetDict.__ne__ = function(self,other){return !$SetDict.__eq__(self,other)}

$SetDict.__or__ = function(self,other){
    var res = $SetDict.copy(self)
    for(var i=0;i<other.$items.length;i++) $SetDict.add(res,other.$items[i])
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
    for(var i=0;i<self.$items.length;i++){
        res += repr(self.$items[i])
        if(i<self.$items.length-1){res += ','}
    }
    res += '}'
    return head+res+tail
}

$SetDict.__sub__ = function(self,other){
    // Return a new set with elements in the set that are not in the others
    var res = set()
    var cfunc = getattr(other,'__contains__')
    for(var i=0;i<self.$items.length;i++){
        if(!cfunc(self.$items[i])){
            res.$items.push(self.$items[i])
        }
    }
    return res
}

$SetDict.__xor__ = function(self,other){
    // Return a new set with elements in either the set or other but not both
    var res = set()
    var cfunc = getattr(other,'__contains__')
    for(var i=0;i<self.$items.length;i++){
        if(!cfunc(self.$items[i])){
            $SetDict.add(res,self.$items[i])
        }
    }
    for(var i=0;i<other.$items.length;i++){
        if(!$SetDict.__contains__(self,other.$items[i])){
            $SetDict.add(res,other.$items[i])
        }
    }
    return res
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
    var cfunc = getattr(item,'__eq__')
    for(var i=0;i<self.$items.length;i++){
        try{if(cfunc(self.$items[i])) return}
        catch(err){void(0)} // if equality test throws exception
    }
    self.$items.push(item)
}

$SetDict.clear = function(self){self.$items = []}

$SetDict.copy = function(self){
    var res = set() // copy returns an instance of set, even for subclasses
    for(var i=0;i<self.$items.length;i++) res.$items[i]=self.$items[i]
    return res
}

$SetDict.discard = function(self,item){
    try{$SetDict.remove(self,item)}
    catch(err){if(err.__name__!=='KeyError'){throw err}}
}

$SetDict.isdisjoint = function(self,other){
    for(var i=0;i<self.$items.length;i++){
        if(getattr(other,'__contains__')(self.$items[i])) return false
    }
    return true
}

$SetDict.pop = function(self){
    if(self.$items.length===0) throw _b_.KeyError('pop from an empty set')
    return self.$items.pop()
}

$SetDict.remove = function(self,item){
    for(var i=0;i<self.$items.length;i++){
        if(getattr(self.$items[i],'__eq__')(item)){
            self.$items.splice(i,1)
            return _b_.None
        }
    }
    throw _b_.KeyError(item)
}

$SetDict.update = function(self,other){
    if (other === undefined || other.$items === undefined) return

    for(var i=0; i<other.$items.length; i++) {
        $SetDict.add(self,other.$items[i])
    }
}

$SetDict.symmetric_difference = $SetDict.__xor__
$SetDict.difference = $SetDict.__sub__
$SetDict.intersection = $SetDict.__and__
$SetDict.issubset = $SetDict.__le__
$SetDict.issuperset = $SetDict.__ge__
$SetDict.union = $SetDict.__or__

function set(){
    // Instances of set have attributes $str and $num
    // $str is true if all the elements in the set are string, $num if
    // all the elements are integers
    // They are used to speed up operations on sets
    var res = {__class__:$SetDict,$str:true,$num:true}
    // apply __init__ with arguments of set()
    var args = [res]
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    $SetDict.__init__.apply(null,args)
    return res
}
set.__class__ = $B.$factory
set.$dict = $SetDict
$SetDict.$factory = set
$SetDict.__new__ = $B.$__new__(set)

var $FrozensetDict = {__class__:$B.$type,__name__:'frozenset'}

$FrozensetDict.__mro__ = [$FrozensetDict,object.$dict]

$FrozensetDict.__str__=$FrozensetDict.toString=$FrozensetDict.__repr__ = function(self){
    if(self===undefined) return "<class 'frozenset'>"
    if(self.$items.length===0) return 'frozenset()'
    var res = "{"
    for(var i=0;i<self.$items.length;i++){
        res += repr(self.$items[i])
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
        if($FrozensetDict[attr] ==undefined) $FrozensetDict[attr] = $SetDict[attr]
    }
}

// hash is allowed on frozensets
$FrozensetDict.__hash__ = function(self) {
   //taken from python repo /Objects/setobject.c

   if (self.__hashvalue__ !== undefined) return self.__hashvalue__

   var _hash=1927868237
   _hash *=self.$items.length   

   for (var i=0; i < self.$items.length; i++) {
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

_b_.set = set
_b_.frozenset = frozenset

})(__BRYTHON__)
