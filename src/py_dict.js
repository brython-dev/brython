;(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}
var $ObjectDict = _b_.object.$dict

var $DICT_MINSIZE = 8

// dictionary
function $DictClass($keys,$values){
    this.iter = null
    this.__class__ = $DictDict
    $DictDict.clear(this)
    
    for (i = 0; i < $keys.length; ++i) {
        $DictDict.__setitem__($keys[i], $values[i])
    }
}

dummy = {}

// can either grow or shrink depending on actual used items
var $grow_dict = function(self) {
    new_size = $DICT_MINSIZE
    target_size = (self.$used < 50000? 2 : 4) * self.$used
    while (new_size < target_size) {
        new_size <<= 1
    }
    new_data = Array($DICT_MINSIZE)
    try {
        ig = new $item_generator(self)
        while(true) {
            itm = ig.next()
            bucket = $find_empty(itm[0], new_size, new_data)
            new_data[bucket] = itm
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err }
    }
    self.$data = new_data
    self.$fill = self.$used
    self.$size = new_size
}

var $lookup_key = function(self, key) {
    eq = _b_.getattr(key, "__eq__")
    size = self.$size
    data = self.$data
    bucket = Math.abs(hash(key) % size)
    val = data[bucket]
    while (val !== undefined) {
        if (val === dummy) {
            bucket = $next_probe(bucket, size)
        } else {
            k_val = val[0]  // [key, value]
            if (eq(k_val)) {
                return bucket
            } else {
                bucket = $next_probe(bucket, size)
            }
        }
        val = data[bucket]
    }
    self.$empty_bucket = bucket
    return undefined
}

var $find_empty = function(key, size, data) {
    bucket = Math.abs(hash(key) % size)
    val = data[bucket]
    while (val !== undefined) {
        bucket = $next_probe(bucket, size)
        val = data[bucket]
    }
    return bucket
}

var $next_probe = function(i, size) {
    return ((i * 5) + 1) % size
}

var $DictDict = {__class__:$B.$type,
    __name__ : 'dict',
    $native:true
}

var $key_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$key_iterator.prototype.length = function() { return this.d.$used }
$key_iterator.prototype.next = function() { return this.iter.next()[0] }

var $item_generator = function(d) {
    this.i = -1
    this.data = d.$data
    this.size = d.$size
    this.used = d.$used
}
$item_generator.prototype.next = function() {
    do {
        val = this.data[++this.i]
    } while ((val === undefined || val === dummy) && this.i < this.size)
    if (this.i < this.size) {
        return val
    }
    this.i--
    throw _b_.StopIteration("StopIteration")
}
$item_generator.prototype.as_list = function() {
    ret = []
    j = 0
    try {
        while(true) {
            ret[j++] = this.next()
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err }
    }
    return ret
}

var $item_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$item_iterator.prototype.length = function() { return this.d.$used }
$item_iterator.prototype.next = function() { return _b_.tuple(this.iter.next()) }

var $copy_dict = function(left, right) {
    gen = new $item_generator(right)
    try {
        while(true) {
            item = gen.next()
            $DictDict.__setitem__(left, item[0], item[1])
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err }
    }
}

$iterator_wrapper = function(items,klass){
    var res = {
        __class__:klass,
        __iter__:function(){return res},
        __len__:function(){return items.length()},
        __next__:function(){
            if (items.length() !== items.iter.used) {
                throw _b_.RuntimeError("dictionary changed size during iteration")
            }
            return items.next()
        },
        __repr__:function(){return "<"+klass.__name__+" object>"},
        counter:-1
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

var $dict_keysDict = $B.$iterator_class('dict_keys')

$DictDict.keys = function(self){
    return $iterator_wrapper(new $key_iterator(self),$dict_keysDict)
}

$DictDict.__bool__ = function (self) {
    return self.count > 0
}

$DictDict.__contains__ = function(self,item){
    return $lookup_key(self, item) !== undefined
}

$DictDict.__delitem__ = function(self,arg){
    
    bucket = $lookup_key(self, arg)
    if (bucket === undefined) throw KeyError(_b_.str(arg))
    self.$data[bucket] = dummy
    --self.used
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)) return False
    if(self.used !== other.used) return False
    for (key in $DictDict.keys(self)) {
        if (!($DictDict.__contains__(other, key))) {
            return False
        }
    }
    return True
}

$DictDict.__getitem__ = function(self,arg){
    bucket = $lookup_key(self, arg)
    if (bucket !== undefined) return self.$data[bucket][1]
    throw KeyError(_b_.str(arg))
}

$DictDict.__hash__ = function(self) {throw _b_.TypeError("unhashable type: 'dict'");}

$DictDict.__init__ = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    $DictDict.clear(self)
    if(args.length==0) return

    if(args.length===1){
        var obj = args[0]
        if(isinstance(obj,dict)){
            $copy_dict(self, obj)
            return
        }
        if(obj.__class__===$B.JSObject.$dict){
            // convert a JSObject into a Python dictionary
            for(var attr in obj.js){
                self.__setitem__(JSObject(attr), JSObject(obj.js[attr]))
            }
            return
        }
    }
    var $ns=$B.$MakeArgs('dict',args,[],[],'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    if(args.length>0){
        if (args.length > 1) throw _b_.TypeError("dict expected at most 1 arguments, got " + args.length)
        if(isinstance(args[0],dict)){
            $copy_dict(self, args[0])
            return
        }
            
        // format dict([(k1,v1),(k2,v2)...])
        var iterable = iter(args[0])
        while(1){
            try{
               var elt = next(iterable)
               key = getattr(elt,'__getitem__')(0)
               value = getattr(elt,'__getitem__')(1)
               $DictDict.__setitem__(self, key, value)
            }catch(err){
               if(err.__name__==='StopIteration'){$B.$pop_exc();break}
               throw err
            }
        }
        return
    }
    if(kw.$used>0){ // format dict(k1=v1,k2=v2...)
        for (k in kw.$data) {
            $DictDict.__setitem__(self, k, kw.$data[k])
        }
    }
}

var $dict_iterator = $B.$iterator_class('dict iterator')
$DictDict.__iter__ = function(self) {
    return $DictDict.keys(self)
}

$DictDict.__len__ = function(self) {return self.$used}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__next__ = function(self){
    if(self.$iter==null){
        self.$iter = new $item_generator(self.$data)
    }
    try {
        return self.$iter.next()
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err }
    }
}

$DictDict.__repr__ = function(self){
    if(self===undefined) return "<class 'dict'>"

    var res=[]
    items = new $item_generator(self).as_list()
    for(idx in items) {
        itm = items[idx]
        res.push(repr(itm[0])+':'+repr(itm[1]))
    }
    return '{'+ res.join(',') +'}'
}

$DictDict.__setitem__ = function(self,key,value){
    // if adding new item would invoke a grow...
    if (self.$fill + 1 > self.$size * 3 / 4) {
        $grow_dict(self)
    }
    bucket = $lookup_key(self, key)
    if (bucket === undefined) {
        bucket = self.$empty_bucket
        ++self.$fill
        ++self.$used
    }
    self.$data[bucket] = [key, value]
}

$DictDict.__str__ = $DictDict.__repr__

// add "reflected" methods
$B.make_rmethods($DictDict)

$DictDict.clear = function(self){
    // Remove all items from the dictionary.
    self.$data = Array($DICT_MINSIZE)
    self.$size = $DICT_MINSIZE
    self.$fill = 0
    self.$used = 0
}

$DictDict.copy = function(self){
    // Return a shallow copy of the dictionary
    var res = dict()
    $copy_dict(res, self)
    return res
}

$DictDict.get = function(self,key,_default){
    ret = $DictDict.__getitem__(self, key)
    if (ret !== undefined) {
        return ret
    }
    if(_default!==undefined) return _default
    return None
}

var $dict_itemsDict = $B.$iterator_class('dict_itemiterator')

$DictDict.items = function(self){
    return $iterator_wrapper(new $item_iterator(self), $dict_itemsDict)
}

$DictDict.fromkeys = function(keys,value){
    // class method
    if(value===undefined) value=_b_.None
    var res = dict()
    var keys_iter = _b_.iter(keys)
    while(1){
        try{
            var key = _b_.next(keys_iter)
            $DictDict.__setitem__(res,key,value)
        }catch(err){
            if($B.is_exc(err,[_b_.StopIteration])){
                $B.$pop_exc()
                return res
            }
            throw err
        }
    }
}

$DictDict.pop = function(self,key,_default){
    try{
        var res = $DictDict.__getitem__(self,key)
        $DictDict.__delitem__(self,key)
        return res
    }catch(err){
        $B.$pop_exc()
        if(err.__name__==='KeyError'){
            if(_default!==undefined) return _default
            throw err
        }
        throw err
    }
}

$DictDict.popitem = function(self){
    try{
        itm = new $item_iterator(self).next()
        $DictDict.__delitem__(self,itm[0])
        return _b_.tuple(itm)
    }catch(err) {
        if (err.__name__ == "StopIteration") {
            $B.$pop_exc()
            throw KeyError("'popitem(): dictionary is empty'")
        }
    }
}

$DictDict.setdefault = function(self,key,_default){
    try{return $DictDict.__getitem__(self,key)}
    catch(err){
        if(_default===undefined) _default=None
        $DictDict.__setitem__(self,key,_default)
        return _default
    }
}

$DictDict.update = function(self){
    var params = []
    for(var i=1;i<arguments.length;i++){params.push(arguments[i])}
    var $ns=$B.$MakeArgs('$DictDict.update',params,[],[],'args','kw')
    var args = $ns['args']
    if(args.length>0 && isinstance(args[0],dict)){
        var other = args[0]
        $copy_dict(self, other)
    }
    var kw = $ns['kw']
    $copy_dict(self, kw)
}

var $dict_valuesDict = $B.$iterator_class('dict_values')

$DictDict.values = function(self){
    return $B.$iterator(self.$values,$dict_valuesDict)
}

function dict(){
    var res = {__class__:$DictDict}
    // apply __init__ with arguments of dict()
    var args = [res]
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    $DictDict.__init__.apply(null,args)
    return res
}

$B.$dict = dict // used for dict literals : "x={}" is translated to "x=__BRYTHON__.$dict()",
             // not to "x=dict()"
             // otherwise this would fail :
             // def foo(dict=None):
             //     x = {}
             // because inside the function, 'dict' has beeen set to the 
             // value of argument 'dict'
dict.__class__ = $B.$factory
dict.$dict = $DictDict
$DictDict.$factory = dict
$DictDict.__new__ = $B.$__new__(dict)

_b_.dict = dict
})(__BRYTHON__)
