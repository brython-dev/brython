;(function($B){

var _b_ = $B.builtins
var $s=[]
for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
//for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}
var $ObjectDict = _b_.object.$dict

// dictionary
function $DictClass($keys,$values){
    // JS dict objects are indexed by strings, not by arbitrary objects
    // so we must use 2 arrays, one for keys and one for values
    this.iter = null
    this.__class__ = $DictDict
    this.$data = Object.create(null)
    for (i = 0; i < keys.length; ++i) {
        this.$data[$keys[i]] = $values[i]
    }
    this.$keys = function() {
        return Object.keys(this.$data)
    }
}

var $DictDict = {__class__:$B.$type,
    __name__ : 'dict',
    $native:true
}

$DictDict.__bool__ = function (self) {
    for (k in self.$data) {
        return true;
    }
    return false;
}

$DictDict.__contains__ = function(self,item){
    if(self.$jsobj) return self.$jsobj[item]!==undefined
    return self.$data[item] !== undefined
}

$DictDict.__delitem__ = function(self,arg){
    // search if arg is in the keys
    if(self.$jsobj) delete self.$jsobj[arg]
    delete self.$data[arg]
    throw KeyError(_b_.str(arg))
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)) return False
    if(Object.keys(other.$data).length != Object.keys(self.$data).length) return False
    for (k in my_keys) {
        if (!getattr(other.$data[k],'__eq__')(self.$data[k])) {
            return False
        }
    }
    return True
}

$DictDict.__getitem__ = function(self,arg){
    result = self.$data[arg]
    if (result !== undefined) return result
    throw KeyError(_b_.str(arg))
}

$DictDict.__hash__ = function(self) {throw _b_.TypeError("unhashable type: 'dict'");}

$DictDict.__init__ = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    self.$data = Object.create(null)
    if(args.length==0) return

    if(args.length===1){
        var obj = args[0]
        if(isinstance(obj,dict)){
            // need to make a copy
            for (k in obj.$data) {
                self.$data[k] = obj.$data[k]
            }
            return
        }
        if(obj.__class__===$B.JSObject.$dict){
            // convert a JSObject into a Python dictionary
            for(var attr in obj.js){
                self.$data[attr] = obj.js[attr]
            }
            return
        }
    }
    var $ns=$B.$MakeArgs('dict',args,[],[],'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    if(args.length>0){ 
        if(isinstance(args[0],dict)){
            for (k in args[0].$data) {
                self.$data[k] = args[0].$data[k]
            }
            return
        }
            
        // format dict([(k1,v1),(k2,v2)...])
        var iterable = iter(args[0])
        while(1){
            try{
               var elt = next(iterable)
               key = getattr(elt,'__getitem__')(0)
               value = getattr(elt,'__getitem__')(1)
               self.$data[key]= value
            }catch(err){
               if(err.__name__==='StopIteration'){$B.$pop_exc();break}
               throw err
            }
        }
        return
    }
    if(Object.keys(kw.$data).length>0){ // format dict(k1=v1,k2=v2...)
        for (k in kw.$data) {
            self.$data[k] = kw.$data[k]
        }
    }
}

var $dict_iterator = $B.$iterator_class('dict iterator')
$DictDict.__iter__ = function(self){
    return $B.$iterator(Object.keys(self.$data),$dict_iterator)
}

$DictDict.__len__ = function(self) {return Object.keys(self.$data).length}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__next__ = function(self){
    if(self.iter==null){self.iter==0}
    if(self.iter<Object.keys(self.$data).length){
        self.iter++
        return Object.keys(self.$data)[self.iter-1]
    } else {
        self.iter = null
        throw _b_.StopIteration()
    }
}

$DictDict.__repr__ = function(self){
    if(self===undefined) return "<class 'dict'>"

    var res=[]
    for(k in self.$data) {
        res.push(repr(k)+':'+repr(self.$data[k]))
    }
    return '{'+ res.join(',') +'}'
}

$DictDict.__setitem__ = function(self,key,value){
    self.$data[key] = value
}

$DictDict.__str__ = $DictDict.__repr__

// add "reflected" methods
$B.make_rmethods($DictDict)

$DictDict.clear = function(self){
    // Remove all items from the dictionary.
    self.$data = Object.create(null)
}

$DictDict.copy = function(self){
    // Return a shallow copy of the dictionary
    var res = dict()
    for(k in self) {
        ret[k] = self[k]
    }
    return res
}

$DictDict.get = function(self,key,_default){
    ret = self.$data[key]
    if (ret !== undefined) {
        return ret
    }
    if(_default!==undefined) return _default
    return None
}

var $dict_itemsDict = $B.$iterator_class('dict_itemiterator')

$DictDict.items = function(self){
    var items = []
    for (k in self.$data) {
        items.push(_b_.tuple([k,self.$data[k]]))
    }
    return $B.$iterator(items,$dict_itemsDict)
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

var $dict_keysDict = $B.$iterator_class('dict_keys')

$DictDict.keys = function(self){
    return $B.$iterator(Object.keys(self.$data),$dict_keysDict)
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
    for (k in $self.data) {
        return _b_.tuple([k, self.pop(k)])
    }
    throw KeyError("'popitem(): dictionary is empty'")
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
        for(k in Object.keys(other.$data)) {
            $DictDict.__setitem__(self,k,other.$data[k])
        }
    }
    var kw = $ns['kw']
    for(k in kw.$data) {
        $DictDict.__setitem__(self,k,kw.$data[k])
    }
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
