;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict

var $DICT_MINSIZE = 8

// dictionary
function $DictClass($keys,$values){
    this.iter = null
    this.__class__ = $DictDict
    $DictDict.clear(this)
    
    for (var i = 0; i < $keys.length; ++i) {
        $DictDict.__setitem__($keys[i], $values[i])
    }
}

dummy = {}

// can either grow or shrink depending on actual used items
var $grow_dict = function(self) {
    var new_size = $DICT_MINSIZE
    var target_size = (self.$used < 50000? 2 : 4) * self.$used
    while (new_size < target_size) {
        new_size <<= 1
    }
    var new_data = Array($DICT_MINSIZE)
    try {
        var ig = new $item_generator(self)
        while(1) {
            var itm = ig.next()
            var bucket = $find_empty(itm[0], new_size, new_data)
            new_data[bucket] = itm
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err } else { $B.$pop_exc() }
    }
    self.$data = new_data
    self.$fill = self.$used
    self.$size = new_size
}

var $lookup_key = function(self, key) {
    eq = _b_.getattr(key, "__eq__")
    size = self.$size
    data = self.$data
    bucket = Math.abs(_b_.hash(key) % size)
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
    $native:true,
    __dir__:$ObjectDict.__dir__
}

var $key_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$key_iterator.prototype.length = function() { return this.iter.length }
$key_iterator.prototype.next = function() { return this.iter.next()[0] }

var $value_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$value_iterator.prototype.length = function() { return this.iter.length }
$value_iterator.prototype.next = function() { return this.iter.next()[1] }

var $item_generator = function(d) {
    this.i = 0
    this.data = d.$data
    this.size = d.$size
    this.used = d.$used
    this.length=0

    this.items=[]
    for (var k in d.$numeric_dict) {
       this.items.push([parseFloat(k), d.$numeric_dict[k]])
    }

    for (var k in d.$string_dict) {
       this.items.push([k, d.$string_dict[k]])
    }

    for (var i=0; i < this.data.length; i++) {
        var _v=this.data[i]
        if (_v === undefined || _v === dummy) continue
        this.items.push(_v)
    }
    this.length=this.items.length
}
$item_generator.prototype.next = function() {
    if (this.i < this.items.length) {
       return this.items[this.i++]
    }
    throw _b_.StopIteration("StopIteration")
}
$item_generator.prototype.as_list = function() {
    return this.items
}

var $item_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$item_iterator.prototype.length = function() {return this.iter.items.length }
$item_iterator.prototype.next = function() { return _b_.tuple(this.iter.next()) }

var $copy_dict = function(left, right) {
    var gen = new $item_generator(right)
    try {
        while(1) {
            var item = gen.next()
            $DictDict.__setitem__(left, item[0], item[1])
        }
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err } else { $B.$pop_exc() }
    }
}

$iterator_wrapper = function(items,klass){
    var res = {
        __class__:klass,
        __iter__:function(){return res},
        __len__:function(){return items.length()},
        __next__:function(){
            //if (items.length() !== items.iter.used) {
            //    throw _b_.RuntimeError("dictionary changed size during iteration")
            //}
            return items.next()
        },
        //__repr__:function(){return "<"+klass.__name__+" object>"},
        counter:-1
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

var $dict_keysDict = $B.$iterator_class('dict_keys')

$DictDict.keys = function(self){
    if (arguments.length > 1) {
       var _len=arguments.length - 1
       var _msg="keys() takes no arguments ("+_len+" given)"
       throw _b_.TypeError(_msg)
    }
    return $iterator_wrapper(new $key_iterator(self),$dict_keysDict)
}

var $dict_valuesDict = $B.$iterator_class('dict_values')

$DictDict.values = function(self){
    if (arguments.length > 1) {
       var _len=arguments.length - 1
       var _msg="values() takes no arguments ("+_len+" given)"
       throw _b_.TypeError(_msg)
    }
    return $iterator_wrapper(new $value_iterator(self), $dict_valuesDict)
}

$DictDict.__bool__ = function (self) {return $DictDict.__len__(self) > 0}

$DictDict.__contains__ = function(self,item){
    if(self.$jsobj) return self.$jsobj[item]!==undefined
    switch(typeof item) {
      case 'string':
        return self.$string_dict[item] !==undefined
      case 'number':
        return self.$numeric_dict[item] !==undefined
    }
    return $lookup_key(self, item) !== undefined
}

$DictDict.__delitem__ = function(self,arg){
    switch(typeof arg) {
      case 'string':
        if (self.$string_dict[arg] === undefined) throw KeyError(_b_.str(arg))
        delete self.$string_dict[arg]
        if (self.$jsobj) delete self.$jsobj[arg]
        return
      case 'number':
        if (self.$numeric_dict[arg] === undefined) throw KeyError(_b_.str(arg))
        delete self.$numeric_dict[arg]
        if (self.$jsobj) delete self.$jsobj[arg]
        return
    }
    // go with defaults

    var bucket = $lookup_key(self, arg)
    if (bucket === undefined) throw KeyError(_b_.str(arg))
    self.$data[bucket] = dummy
    --self.$used

    if(self.$jsobj) delete self.$jsobj[arg]
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)) return false

    if ($DictDict.__len__(self) != $DictDict.__len__(other)) return false

    var gen = new $item_generator(self)
    var keys1=[]
    try {
        while(1) keys1.push(gen.next()[0])
    } catch (err) {

    }

    for (var i=0; i < keys1.length; i++) {
        var key=keys1[i]
        if (!$DictDict.__contains__(other, key)) return false
        var v1=$DictDict.__getitem__(self, key)
        var v2=$DictDict.__getitem__(other, key)
        if (!getattr(v1, '__eq__')(v2)) return false
    }

    return true
}

$DictDict.__getitem__ = function(self,arg){
    if(self.$jsobj && self.$jsobj[arg] !== undefined) return self.$jsobj[arg]

    switch(typeof arg) {
      case 'string':
        if (self.$string_dict[arg] !== undefined) return self.$string_dict[arg]
        break
      case 'number':
        if (self.$numeric_dict[arg] !== undefined) return self.$numeric_dict[arg]
    }
    // since the key is more complex use 'default' method of getting item

    var bucket = $lookup_key(self, arg)
    if (bucket !== undefined) return self.$data[bucket][1]

    if(hasattr(self, '__missing__')) return getattr(self, '__missing__')(arg)

    throw KeyError(_b_.str(arg))
}

$DictDict.__hash__ = function(self) {
    if (self === undefined) {
       return $DictDict.__hashvalue__ || $B.$py_next_hash--  // for hash of dict type (not instance of dict)
    }
    throw _b_.TypeError("unhashable type: 'dict'");
}

$DictDict.__init__ = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    $DictDict.clear(self)
    switch(args.length) {
      case 0:
        return
      case 1:
        var obj = args[0]
        if(isinstance(obj,dict)){
            $copy_dict(self, obj)
            return
        }

        if(obj.__class__===$B.JSObject.$dict){
            // convert a JSObject into a Python dictionary
            var res = new $DictClass([],[])
            for(var attr in obj.js){
                $DictDict.__setitem__(res,attr,obj.js[attr])
            }

            self.$jsobj = obj.js
            return
        }
    } //switch

    var $ns=$B.$MakeArgs('dict',args,[],[],'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    
    if (args.length>0) {
        if(isinstance(args[0],dict)){
            $B.$copy_dict(self, args[0])
            return
        }

        // format dict([(k1,v1),(k2,v2)...])
        var iterable = iter(args[0])
        while(1){
            try{
               var elt = next(iterable)
               var key = getattr(elt,'__getitem__')(0)
               var value = getattr(elt,'__getitem__')(1)
               $DictDict.__setitem__(self, key, value)
            }catch(err){
               if(err.__name__==='StopIteration'){$B.$pop_exc();break}
               throw err
            }
        }
    }//if
    //if(kw.$used>0){ // format dict(k1=v1,k2=v2...)
    if($DictDict.__len__(kw) > 0) $copy_dict(self, kw)
}

var $dict_iterator = $B.$iterator_class('dict iterator')
$DictDict.__iter__ = function(self) {
    return $DictDict.keys(self)
}

$DictDict.__len__ = function(self) {
   var _num_len=0, _str_len=0

   for (var k in self.$numeric_dict) _num_len++
   for (var k in self.$string_dict) _str_len++
 
   return self.$used + _num_len + _str_len
}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__next__ = function(self){
    if(self.$iter==null){
        self.$iter = new $item_generator(self) //.$data)
    }
    try {
        return self.$iter.next()
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err } else { $B.$pop_exc() }
    }
}

$DictDict.__repr__ = function(self){
    if(self===undefined) return "<class 'dict'>"
    var res=[]
    var items = new $item_generator(self).as_list()
    for(var idx in items) {
        var itm = items[idx]
        res.push(repr(itm[0])+': '+repr(itm[1]))
    }
    return '{'+ res.join(', ') +'}'
}

$DictDict.__setitem__ = function(self,key,value){
    switch(typeof key) {
      case 'string':
        self.$string_dict[key]=value
        if(self.$jsobj) self.$jsobj[key]=value
        return
      case 'number':
        self.$numeric_dict[key]=value
        if(self.$jsobj) self.$jsobj[key]=value
        return
    }

    // if we got here the key is more complex, use default method

    // if adding new item would invoke a grow...
    if (self.$fill + 1 > self.$size * 3 / 4) {
        $grow_dict(self)
    }

    var bucket = $lookup_key(self, key)
    if (bucket === undefined) {
        bucket = self.$empty_bucket
        ++self.$fill
        ++self.$used
    }
    self.$data[bucket] = [key, value]

    if(self.$jsobj) self.$jsobj[key]=value
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

    self.$numeric_dict={}
    self.$string_dict={}

    if(self.$jsobj) self.$jsobj={}
}

$DictDict.copy = function(self){
    // Return a shallow copy of the dictionary
    var res = _b_.dict()
    $copy_dict(res, self)
    return res
}

$DictDict.get = function(self, key, _default){
    if (_default === undefined) _default=None
    switch(typeof key) {
      case 'string':
        return self.$string_dict[key] || _default
      case 'number':
        return self.$numeric_dict[key] || _default
    }

    var bucket = $lookup_key(self, key)
    if(bucket !== undefined) return self.$data[bucket][1]
    if(_default!==undefined) return _default
    return None
}

var $dict_itemsDict = $B.$iterator_class('dict_items')

$DictDict.items = function(self){
    if (arguments.length > 1) {
       var _len=arguments.length - 1
       var _msg="items() takes no arguments ("+_len+" given)"
       throw _b_.TypeError(_msg)
    }
    return $iterator_wrapper(new $item_iterator(self), $dict_itemsDict)
}

$DictDict.fromkeys = function(keys,value){
    // class method
    if(value===undefined) value=None
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
        var itm = new $item_iterator(self).next()
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

function dict(){
    var res = {__class__:$DictDict}
    // apply __init__ with arguments of dict()
    var args = [res]
    for(var i=0, _len_i = arguments.length; i < _len_i;i++){args.push(arguments[i])}
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

// following are used for faster access elsewhere
$B.$dict_iterator = function(d) { return new $item_generator(d) }
$B.$dict_length = $DictDict.__len__
$B.$dict_getitem = $DictDict.__getitem__
$B.$dict_get = $DictDict.get
$B.$dict_set = $DictDict.__setitem__
$B.$dict_contains = $DictDict.__contains__
$B.$dict_items = function(d) { return new $item_generator(d).as_list() }
$B.$copy_dict = $copy_dict  // copy from right to left
$B.$dict_get_copy = $DictDict.copy  // return a shallow copy

// Class used for attribute __dict__ of objects


$ObjDictDict = {__class__:$B.$type,__name__:'obj_dict'}
$ObjDictDict.__mro__ = [$ObjDictDict, $DictDict, $ObjectDict]

$ObjDictDict.__delitem__ = function(self, key){
    $DictDict.__delitem__(self, key)
    delete self.$obj[key]
}

$ObjDictDict.__setitem__ = function(self, key, value){
    $DictDict.__setitem__(self, key, value)
    self.$obj[key] = value
}

$ObjDictDict.clear = function(self){
    $DictDict.clear(self)
    for(var key in self.$obj){delete self.$obj[key]}
}

$ObjDictDict.pop = function(self, key, _default){
    $DictDict.pop(self, key, _default)
    delete self.$obj[key]
    return key
}

$ObjDictDict.popitem = function(self){
    var res = $DictDict.popitem(self) // tuple
    var key = res[0]
    delete self.$obj[key]
    return res
}

$ObjDictDict.update = function(self, other){
    $DictDict.update(self, other)
    for(var key in other) self.$obj[key]=other[key]
}

function obj_dict(obj){
    // not sure what res should be?
    var res = {__class__:$ObjDictDict,$obj:obj}
    $DictDict.clear(res)
    for(var attr in obj){
        if(attr.charAt(0)!='$'){
           //this causes my browser to freeze..
           $DictDict.__setitem__(res, attr, obj[attr])
        }
    }
    return res
}
obj_dict.$dict = $ObjDictDict
obj_dict.__class__ = $B.$factory
$ObjDictDict.$factory = obj_dict

$B.obj_dict = obj_dict

})(__BRYTHON__)
