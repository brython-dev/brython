;(function($B){

eval($B.InjectBuiltins())

var $ObjectDict = _b_.object.$dict,
    str_hash = _b_.str.$dict.__hash__,
    $N = _b_.None

// dictionary
function $DictClass($keys,$values){
    this.iter = null
    this.__class__ = $DictDict
    $DictDict.clear(this)

    var setitem=$DictDict.__setitem__
    var i=$keys.length
    while(i--) setitem($keys[i], $values[i])
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

    if(d.$jsobj){
        this.items = []
        for(var attr in d.$jsobj){
            if(attr.charAt(0)!='$'){this.items.push([attr,d.$jsobj[attr]])}
        }
        this.length=this.items.length;
        return
    }
    
    var items=[]
    var pos=0
    for (var k in d.$numeric_dict) {
        items[pos++]=[parseFloat(k), d.$numeric_dict[k]]
    }

    for (var k in d.$string_dict) {
        items[pos++]=[k, d.$string_dict[k]]
    }

    for (var k in d.$object_dict) {
        var i=d.$object_dict[k].length
        while(i--) items[pos++]=d.$object_dict[k][i]
    }

    this.items=items
    this.length=items.length
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
    var _l=new $item_generator(right).as_list()
    var si=$DictDict.__setitem__
    var i=_l.length
    while(i--) si(left, _l[i][0], _l[i][1])
}

$iterator_wrapper = function(items,klass){
    var res = {
        __class__:klass,
        __iter__:function(){items.iter.i=0; return res},
        __len__:function(){return items.length()},
        __next__:function(){
            //if (items.length() !== items.iter.used) {
            //    throw _b_.RuntimeError("dictionary changed size during iteration")
            //}
            return items.next()
            //return items[counter++]
        },
        //__repr__:function(){return "<"+klass.__name__+" object>"},
        __repr__:function(){return klass.__name__+'('+ new $item_generator(items).as_list().join(',') + ')'},
        //counter:0
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

    var _key=hash(item)
    if (self.$str_hash[_key]!==undefined &&
        _b_.getattr(item,'__eq__')(self.$str_hash[_key])){return true}
    if (self.$numeric_dict[_key]!==undefined &&
        _b_.getattr(item,'__eq__')(_key)){return true}
    if (self.$object_dict[_key] !== undefined) {
       var _eq = getattr(item, '__eq__')
       var i=self.$object_dict[_key].length
       while(i--) {
           if (_eq(self.$object_dict[_key][i][0])) return true
       }
    }
    return false
}

$DictDict.__delitem__ = function(self,arg){
    if(self.$jsobj){
        if(self.$jsobj[arg]===undefined){throw KeyError(arg)}
        delete self.$jsobj[arg]
        return $N
    }
    switch(typeof arg) {
      case 'string':
        if (self.$string_dict[arg] === undefined) throw KeyError(_b_.str(arg))
        delete self.$string_dict[arg]
        delete self.$str_hash[str_hash(arg)]
        return $N
      case 'number':
        if (self.$numeric_dict[arg] === undefined) throw KeyError(_b_.str(arg))
        delete self.$numeric_dict[arg]
        return $N
    }
    // go with defaults

    var _key=hash(arg)
    if (self.$object_dict[_key] !== undefined) {
       var _eq=getattr(arg, '__eq__')
       var i=self.$object_dict[_key].length
       while(i--) {
           if (_eq(self.$object_dict[_key][i][0])) {
              delete self.$object_dict[_key][i];
              break;
           }
       }
    }

    if(self.$jsobj) delete self.$jsobj[arg]
    return $N
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)) return false
    
    if ($DictDict.__len__(self) != $DictDict.__len__(other)){return false}

    var _l = new $item_generator(self).as_list()
    var i=_l.length
    while(i--) {
        var key=_l[i][0]
        if (!$DictDict.__contains__(other, key)) {return false}
        var v1=_l[i][1]
        var v2=$DictDict.__getitem__(other, key)
        if (!getattr(v1, '__eq__')(v2)) {return false}
    }

    return true
}

$DictDict.__getitem__ = function(self,arg){

    if(self.$jsobj){
        if(self.$jsobj[arg]===undefined){return None}
        return self.$jsobj[arg]
    }

    switch(typeof arg) {
      case 'string':
        if (self.$string_dict[arg] !== undefined) return self.$string_dict[arg]
        break
      case 'number':
        if (self.$numeric_dict[arg] !== undefined) return self.$numeric_dict[arg]
    }

    // since the key is more complex use 'default' method of getting item

    var _key=hash(arg)
    var sk = self.$str_hash[_key]
    if (sk!==undefined && _b_.getattr(arg,'__eq__')(sk)){
        return self.$string_dict[sk]
    }
    if (self.$numeric_dict[_key]!==undefined &&
        _b_.getattr(arg,'__eq__')(_key)){
         return self.$numeric_dict[_key]   
    }
    if (self.$object_dict[_key] !== undefined) {
       var _eq=getattr(arg, '__eq__')
       var i=self.$object_dict[_key].length
       while(i--) {
           if (_eq(self.$object_dict[_key][i][0])) {
              return self.$object_dict[_key][i][1]
           }
       }
    }

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
    var args = [], pos=0
    for(var i=1;i<arguments.length;i++){args[pos++]=arguments[i]}
    $DictDict.clear(self)

    switch(args.length) {
      case 0:
        return
      case 1:
        var obj = args[0]
        if(Array.isArray(obj)){
            var i = obj.length
            var si = $DictDict.__setitem__
            while(i-->0) si(self, obj[i-1][0], obj[i-1][1])
            return $N
        }else if(isinstance(obj,dict)){
            $copy_dict(self, obj)
            return $N
        }

        if(obj.__class__===$B.JSObject.$dict){
            // convert a JSObject into a Python dictionary
            var si = $DictDict.__setitem__
            for(var attr in obj.js) si(self,attr,obj.js[attr])

            // Attribute $jsobj is used to update the original JS object
            // when the dictionary is modified
            self.$jsobj = obj.js
            return $N
        }
    } //switch

    var $ns=$B.$MakeArgs1('dict',0,{},[],args,{},'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    
    if (args.length>0) {
        if(isinstance(args[0],dict)){
            $B.$copy_dict(self, args[0])
            return $N
        }

        // format dict([(k1,v1),(k2,v2)...])
        
        if(Array.isArray(args[0])){
            var src = args[0]
            var i = src.length -1
            var si=$DictDict.__setitem__
            while(i-->0) si(self, src[i-1][0], src[i-1][1])
        }else{
            var iterable = iter(args[0])
            while(1){
                try{
                   var elt = next(iterable)
                   var key = getattr(elt,'__getitem__')(0)
                   var value = getattr(elt,'__getitem__')(1)
                   $DictDict.__setitem__(self, key, value)
                }catch(err){
                   if(err.__name__==='StopIteration'){break}
                   throw err
                }
            }
        }
    }//if
    if($DictDict.__len__(kw) > 0) $copy_dict(self, kw)
    return $N
}

var $dict_iterator = $B.$iterator_class('dict iterator')
$DictDict.__iter__ = function(self) {
    return $DictDict.keys(self)
}

$DictDict.__len__ = function(self) {
    var _count=0
    
    if(self.$jsobj){
        for(var attr in self.$jsobj){if(attr.charAt(0)!='$'){_count++}}
        return _count
    }

    for (var k in self.$numeric_dict) _count++
    for (var k in self.$string_dict) _count++
    for (var k in self.$object_dict) _count+= self.$object_dict[k].length
 
    return _count
}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__next__ = function(self){
    if(self.$iter==null){
        self.$iter = new $item_generator(self)
    }
    try {
        return self.$iter.next()
    } catch (err) {
        if (err.__name__ !== "StopIteration") { throw err }
    }
}

$DictDict.__repr__ = function(self){
    if(self===undefined) return "<class 'dict'>"
    if(self.$jsobj){ // wrapper around Javascript object
        var res = []
        for(var attr in self.$jsobj){
            if(attr.charAt(0)=='$' || attr=='__class__'){continue}
            else{res.push("'"+attr+"': "+_b_.repr(self.$jsobj[attr]))}
        }
        return '{'+res.join(', ')+'}'
    }
    var _objs=[self]  // used to elimate recursion
    var res=[], pos=0
    var items = new $item_generator(self).as_list()
    for (var i=0; i < items.length; i++) {
        var itm = items[i]
        if (_objs.indexOf(itm[1]) > -1 && _b_.isinstance(itm[1], [_b_.dict,_b_.list,_b_.set, _b_.tuple])) {
           var value='?'+_b_.type(itm[1])
           if(isinstance(itm[1], dict)) value='{...}'
           res[pos++]=repr(itm[0])+': '+ value
        } else {
           if (_objs.indexOf(itm[1]) == -1) _objs.push(itm[1])
           res[pos++]=repr(itm[0])+': '+repr(itm[1])
        }
    }
    return '{'+ res.join(', ') +'}'
}

$DictDict.__setitem__ = function(self,key,value){

    if(self.$jsobj){self.$jsobj[key]=value;return}

    switch(typeof key) {
      case 'string':
        self.$string_dict[key]=value
        self.$str_hash[str_hash(key)]=key
        return $N
      case 'number':
        self.$numeric_dict[key]=value
        return $N
    }
    
    // if we got here the key is more complex, use default method

    var _key=hash(key)
    var _eq=getattr(key, '__eq__')

    if(self.$numeric_dict[_key]!==undefined && _eq(_key)){
        self.$numeric_dict[_key] = value
        return $N
    }
    var sk = self.$str_hash[_key]
    if(sk!==undefined && _eq(sk)){
        self.$string_dict[sk] = value
        return $N
    }

    
    if (self.$object_dict[_key] != undefined) {
       var i=self.$object_dict[_key].length
       while(i--) {
           if (_eq(self.$object_dict[_key][i][0])) {
              self.$object_dict[_key][i]=[key, value]
              return $N
           }
       }
       // if we got here this key is not in the object
       self.$object_dict[_key].push([key, value])
    } else {
       self.$object_dict[_key]=[[key, value]]
    }
    return $N
}

$DictDict.__str__ = $DictDict.__repr__

// add "reflected" methods
$B.make_rmethods($DictDict)

$DictDict.clear = function(self){
    // Remove all items from the dictionary.

    self.$numeric_dict={}
    self.$string_dict={}
    self.$str_hash={}
    self.$object_dict={}

    if(self.$jsobj) self.$jsobj={}
    return $N
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

    var _key=hash(key)
    if (self.$object_dict[_key] != undefined) {
       var _eq=getattr(key, '__eq__')
       var i=self.$object_dict[_key].length
       while(i--) {
           if (_eq(self.$object_dict[_key][i][0])) 
              return self.$object_dict[_key][i][1] 
       }
    }

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
    var params = [], pos=0
    for(var i=1;i<arguments.length;i++){params[pos++]=arguments[i]}
    var $ns=$B.$MakeArgs1('$DictDict.update',0,{},[],params,{},'args','kw')
    var args = $ns['args']
    if(args.length>0) {
      var o=args[0]
      if (isinstance(o,dict)){
         $copy_dict(self, o)
      } else if (hasattr(o, '__getitem__') && hasattr(o, 'keys')) {
         var _keys=_b_.list(getattr(o, 'keys')())
         var si=$DictDict.__setitem__
         var i=_keys.length
         while(i--) {
             //for (var i=0; i < _keys.length; i++) {
             var _value = getattr(o, '__getitem__')(_keys[i])
             si(self, _keys[i], _value)
         }
      }
    }
    var kw = $ns['kw']
    $copy_dict(self, kw)
    return $N
}

function dict(args, second){

    if(second===undefined && Array.isArray(args)){
        // Form "dict([[key1, value1], [key2,value2], ...])"
        var res = {__class__:$DictDict,
            $numeric_dict : {},
            $object_dict : {},
            $string_dict : {},
            $str_hash: {},
            length: 0
        }
        var i = -1, stop = args.length-1
        var si = $DictDict.__setitem__
        while(i++<stop){
            var item=args[i]
            switch(typeof item[0]) {
              case 'string':
                res.$string_dict[item[0]]=item[1]
                res.$str_hash[str_hash(item[0])]=item[0]
                break;
              case 'number':
                res.$numeric_dict[item[0]]=item[1]
                break
              default:
                si(res, item[0], item[1])
                break
            }
        }
        return res
    }

    // apply __init__ with arguments of dict()
    var res = {__class__:$DictDict}
    $DictDict.clear(res)
    var _args = [res], pos=1
    for(var i=0, _len_i = arguments.length; i < _len_i;i++){_args[pos++]=arguments[i]}
    $DictDict.__init__.apply(null,_args)
    return res
}

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


// Class for attribute __dict__ of classes
var mappingproxyDict = {
    __class__ : $B.$type,
    __name__ : "mappingproxy"
}
mappingproxyDict.__mro__ = [mappingproxyDict, _b_.object.$dict]

mappingproxyDict.__setitem__ = function(){
    throw _b_.TypeError("'mappingproxy' object does not support item assignment")
}


function mappingproxy(obj){
    var res = obj_dict(obj)
    res.__class__ = mappingproxyDict
    return res
}
mappingproxy.__class__ = $B.$factory
mappingproxy.$dict = mappingproxyDict
mappingproxyDict.$factory = mappingproxy
$B.mappingproxy = mappingproxy

$B.obj_dict = function(obj){
    var res = dict()
    res.$jsobj = obj
    return res
}

})(__BRYTHON__)
