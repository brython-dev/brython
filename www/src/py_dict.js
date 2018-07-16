;(function($B){

var bltns = $B.InjectBuiltins()
eval(bltns)

var object = _b_.object,
    str_hash = _b_.str.__hash__,
    $N = _b_.None

// dictionary
function $DictClass($keys,$values){
    this.iter = null
    this.__class__ = dict
    dict.clear(this)

    var setitem = dict.__setitem__,
        i = $keys.length
    while(i--){setitem($keys[i], $values[i])}
}

var dict = {
    __class__: _b_.type,
    __module__: "builtins",
    __mro__: [object],
    __name__ : "dict",
    $is_class: true,
    $native: true
}

var $key_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$key_iterator.prototype.length = function(){return this.iter.items.length}
$key_iterator.prototype.next = function(){return this.iter.next()[0]}

var $value_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$value_iterator.prototype.length = function(){return this.iter.items.length}
$value_iterator.prototype.next = function(){return this.iter.next()[1]}

var $item_generator = function(d) {

    this.i = 0

    if(d.$jsobj){
        this.items = []
        for(var attr in d.$jsobj){
            if(attr.charAt(0) != "$"){
                var val = d.$jsobj[attr]
                if(val === undefined){val = _b_.NotImplemented}
                else if(val === null){val = $N}
                this.items.push([attr, val])
            }
        }
        return
    }

    var items = []
    for(var k in d.$numeric_dict){
        items.push([parseFloat(k), d.$numeric_dict[k]])
    }

    for(var k in d.$string_dict){items.push([k, d.$string_dict[k]])}

    for(var k in d.$object_dict){items.push(d.$object_dict[k])}

    this.items = items
}

$item_generator.prototype.next = function() {
    if(this.i < this.items.length){
       return this.items[this.i++]
    }
    throw _b_.StopIteration.$factory("StopIteration")
}
$item_generator.prototype.as_list = function() {
    return this.items
}

var $item_iterator = function(d) {
    this.d = d
    this.current = 0
    this.iter = new $item_generator(d)
}
$item_iterator.prototype.length = function(){return this.iter.items.length}
$item_iterator.prototype.next = function(){
    return _b_.tuple.$factory(this.iter.next())
}

var $copy_dict = function(left, right){
    var _l = new $item_generator(right).as_list(),
        si = dict.__setitem__,
        i = _l.length
    while(i--){si(left, _l[i][0], _l[i][1])}
}

function toSet(items){
    // Build a set from the iteration on items
    var res = []
    while(true){
        try{res.push(items.next())}
        catch(err){break}
    }
    return _b_.set.$factory(res)
}

var $iterator_wrapper = function(items, klass){
    var res = {
        __class__: klass,
        __eq__: function(other){
            // compare set of items to other
            return $B.rich_comp("__eq__", toSet(items), other)
        },
        __iter__: function(){items.iter.i = 0; return res},
        __len__: function(){return items.length()},
        __next__: function(){
            return items.next()
        },
        __repr__:function(){
            var s = []
            for(var i = 0, len = items.length(); i < len; i++){
                s.push(_b_.repr(items.next()))
            }
            return klass.__name__ + "(["+ s.join(",") + "])"
        },
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

dict.__bool__ = function () {
    var $ = $B.args("__bool__", 1, {self: null}, ["self"],
        arguments, {}, null, null)
    return dict.__len__($.self) > 0
}

dict.__contains__ = function(){

    var $ = $B.args("__contains__", 2, {self: null, item: null},
        ["self", "item"], arguments, {}, null, null),
        self = $.self,
        item = $.item

    if(self.$jsobj){return self.$jsobj[item] !== undefined}

    switch(typeof item) {
        case "string":
            return self.$string_dict[item] !== undefined
        case "number":
            return self.$numeric_dict[item] !== undefined
    }

    var _key = hash(item)
    if(self.$str_hash[_key] !== undefined &&
        $B.rich_comp("__eq__", item, self.$str_hash[_key])){return true}
    if(self.$numeric_dict[_key] !== undefined &&
        $B.rich_comp("__eq__", item, _key)){return true}
    if(self.$object_dict[_key] !== undefined){
        // If the key is an object, its hash must be in the dict keys but the
        // key itself must compare equal to the key associated with the hash
        // For instance :
        //
        //     class X:
        //         def __hash__(self): return hash('u')
        //
        //     a = {'u': 'a', X(): 'b'}
        //     assert set(a.values()) == {'a', 'b'}
        //     assert not X() in a
        return $B.rich_comp("__eq__", item, self.$object_dict[_key][0])
    }
    return false
}

dict.__delitem__ = function(){

    var $ = $B.args("__eq__", 2, {self: null, arg: null},
        ["self", "arg"], arguments, {}, null, null),
        self = $.self,
        arg = $.arg

    if(self.$jsobj){
        if(self.$jsobj[arg] === undefined){throw KeyError.$factory(arg)}
        delete self.$jsobj[arg]
        return $N
    }
    switch(typeof arg){
        case "string":
            if(self.$string_dict[arg] === undefined){
                throw KeyError.$factory(_b_.str.$factory(arg))
            }
            delete self.$string_dict[arg]
            delete self.$str_hash[str_hash(arg)]
            return $N
        case "number":
            if(self.$numeric_dict[arg] === undefined){
                throw KeyError.$factory(_b_.str.$factory(arg))
            }
            delete self.$numeric_dict[arg]
            return $N
    }
    // go with defaults

    var _key = hash(arg)

    if(self.$object_dict[_key] !== undefined){
        delete self.$object_dict[_key]
    }

    if(self.$jsobj){delete self.$jsobj[arg]}
    return $N
}

dict.__eq__ = function(){
    var $ = $B.args("__eq__", 2, {self: null, other: null},
        ["self", "other"], arguments, {}, null, null),
        self = $.self,
        other = $.other

    if(! isinstance(other, dict)){return false}

    if(self.$jsobj){self = jsobj2dict(self.$jsobj)}
    if(other.$jsobj){other = jsobj2dict(other.$jsobj)}

    if(dict.__len__(self) != dict.__len__(other)){return false}

    if((self.$numeric_dict.length != other.$numeric_dict.length) ||
            (self.$string_dict.length != other.$string_dict.length) ||
            (self.$object_dict.length != other.$object_dict.length)){
        return false
    }
    for(var k in self.$numeric_dict){
        if(!$B.rich_comp("__eq__", other.$numeric_dict[k],
                self.$numeric_dict[k])){
            return false
        }
    }
    for(var k in self.$string_dict){
        if(!$B.rich_comp("__eq__", other.$string_dict[k],
                self.$string_dict[k])){
            return false
        }
    }
    for(var k in self.$object_dict){
        if(!$B.rich_comp("__eq__", other.$object_dict[k][1],
                self.$object_dict[k][1])){
            return false
        }
    }

    return true

}

dict.__getitem__ = function(){
    var $ = $B.args("__getitem__", 2, {self: null, arg: null},
        ["self", "arg"], arguments, {}, null, null),
        self = $.self,
        arg = $.arg

    if(self.$jsobj){
        if(!self.$jsobj.hasOwnProperty(arg)){
            throw _b_.KeyError.$factory(str.$factory(arg))
        }else if(self.$jsobj[arg] === undefined){
            return _b_.NotImplemented
        }else if(self.$jsobj[arg] === null){return $N}
        return self.$jsobj[arg]
    }


    switch(typeof arg){
        case "string":
            if(self.$string_dict[arg] !== undefined){
                return self.$string_dict[arg]
            }
            break
        case "number":
            if(self.$numeric_dict[arg] !== undefined){
                return self.$numeric_dict[arg]
            }
    }

    // since the key is more complex use 'default' method of getting item

    var _key = _b_.hash(arg),
        _eq = function(other){return $B.rich_comp("__eq__", arg, other)}

    var sk = self.$str_hash[_key]
    if(sk !== undefined && _eq(sk)){
        return self.$string_dict[sk]
    }
    if(self.$numeric_dict[_key] !== undefined && _eq(_key)){
         return self.$numeric_dict[_key]
    }


    var obj_ref = self.$object_dict[_key]
    if(obj_ref !== undefined){
        // An object with the same hash is already stored
        // Lookup should fail if equality raises an exception
        _eq(self.$object_dict[_key][0])
        return self.$object_dict[_key][1]
    }
    if(self.__class__ !== dict){
        try{
            var missing_method = getattr(self.__class__, "__missing__")
            return missing_method(self, arg)
        }catch(err){}
    }
    throw KeyError.$factory(_b_.str.$factory(arg))
}

dict.__hash__ = None

dict.__init__ = function(self){
    var args = []
    for(var i = 1; i < arguments.length; i++){args.push(arguments[i])}

    switch(args.length){
        case 0:
            return
        case 1:
            var obj = args[0]
            if(Array.isArray(obj)){
                var i = obj.length,
                    si = dict.__setitem__
                while(i-- > 0){si(self, obj[i - 1][0], obj[i - 1][1])}
                return $N
            }else if(obj.$nat === undefined && isinstance(obj, dict)){
                $copy_dict(self, obj)
                return $N
            }

            if(obj.__class__ === $B.JSObject){
                // convert a JSObject into a Python dictionary

                // Attribute $jsobj is used to update the original JS object
                // when the dictionary is modified
                self.$jsobj = obj.js
                return $N
            }
    }

    var $ns = $B.args("dict", 0, {}, [], args, {}, "args", "kw"),
        args = $ns["args"],
        kw = $ns["kw"]

    if(args.length > 0){
        if(isinstance(args[0], dict)){
            $B.$copy_dict(self, args[0])
            return $N
        }

        // format dict([(k1,v1),(k2,v2)...])

        if(Array.isArray(args[0])){
            var src = args[0],
                i = src.length - 1,
                si = dict.__setitem__
            while(i-- > 0){si(self, src[i - 1][0], src[i - 1][1])}
        }else{
            var iterable = $B.$iter(args[0]),
                ce = $B.current_exception
            while(1){
                try{
                   var elt = next(iterable),
                       key = getattr(elt, "__getitem__")(0),
                       value = getattr(elt,"__getitem__")(1)
                   dict.__setitem__(self, key, value)
                }catch(err){
                   if(err.__class__ === _b_.StopIteration){
                       $B.current_exception = ce
                       break
                   }
                   throw err
                }
            }
        }
    }
    if(dict.__len__(kw) > 0){$copy_dict(self, kw)}
    return $N
}

var $dict_iterator = $B.$iterator_class("dict iterator")
dict.__iter__ = function(self) {
    return dict.keys(self)
}

dict.__len__ = function(self) {
    var _count = 0

    if(self.$jsobj){
        for(var attr in self.$jsobj){if(attr.charAt(0) != "$"){_count++}}
        return _count
    }

    for(var k in self.$numeric_dict){_count++}
    for(var k in self.$string_dict){_count++}
    for(var k in self.$object_dict){_count += self.$object_dict[k].length}

    return _count
}

dict.__ne__ = function(self, other){return ! dict.__eq__(self, other)}

dict.__new__ = function(cls){
    if(cls === undefined){
        throw _b_.TypeError.$factory("int.__new__(): not enough arguments")
    }
    return {
        __class__: cls,
        $numeric_dict : {},
        $object_dict : {},
        $string_dict : {},
        $str_hash: {}
    }
}

dict.__next__ = function(self){
    if(self.$iter == null){
        self.$iter = new $item_generator(self)
    }
    try{
        return self.$iter.next()
    }catch (err){
        if(err.__name__ !== "StopIteration"){throw err}
    }
}

dict.__repr__ = function(self){
    if(self.$jsobj){ // wrapper around Javascript object
        return dict.__repr__(jsobj2dict(self.$jsobj))
    }
    var res = [],
        items = new $item_generator(self).as_list()
    items.forEach(function(item){
        if((!self.$jsobj && item[1] === self) ||
                (self.$jsobj && item[1] === self.$jsobj)){
            res.push(repr(item[0]) + ": {...}")
        }else{
            try{
                res.push(repr(item[0]) + ": " + repr(item[1]))
            }catch(err){
                res.push(repr(item[0]) + ": <unprintable object>")
            }
        }
    })
    return "{" + res.join(", ") + "}"
}

dict.__setitem__ = function(self, key, value){

    var $ = $B.args("__setitem__", 3, {self: null, key: null, value: null},
        ["self", "key", "value"], arguments, {}, null, null)
    return dict.$setitem($.self, $.key, $.value)
}

dict.$setitem = function(self, key, value){
    if(self.$jsobj){
        if(self.$jsobj.__class__ === _b_.type){
            self.$jsobj[key] = $B.pyobj2jsobj(value)
            if(key == "__init__" || key == "__new__"){
                // If class attribute __init__ or __new__ are reset,
                // the factory function has to change
                self.$jsobj.$factory = $B.$instance_creator(self.$jsobj)
            }
        }else{
            self.$jsobj[key] = $B.pyobj2jsobj(value)
        }
        return $N
    }

    switch(typeof key){
        case "string":
            self.$string_dict[key] = value
            self.$str_hash[str_hash(key)] = key
            return $N
        case "number":
            self.$numeric_dict[key] = value
            return $N
    }

    // if we got here the key is more complex, use default method

    var _key = hash(key),
        _eq = function(other){return $B.rich_comp("__eq__", key, other)}

    if(self.$numeric_dict[_key] !== undefined && _eq(_key)){
        self.$numeric_dict[_key] = value
        return $N
    }
    var sk = self.$str_hash[_key]
    if(sk !== undefined && _eq(sk)){
        self.$string_dict[sk] = value
        return $N
    }

    var obj_ref = self.$object_dict[_key]
    if(obj_ref !== undefined){
        // An object with the same hash is already stored
        // Lookup should fail if equality raises an exception
        _eq(self.$object_dict[_key][0])
    }
    self.$object_dict[_key] = [key, value]
    return $N
}

dict.__str__ = dict.__repr__

// add "reflected" methods
$B.make_rmethods(dict)

dict.clear = function(){
    // Remove all items from the dictionary.
    var $ = $B.args("clear", 1, {self: null}, ["self"], arguments, {},
        null, null),
        self = $.self

    self.$numeric_dict = {}
    self.$string_dict = {}
    self.$str_hash = {}
    self.$object_dict = {}

    if(self.$jsobj){
        for(var attr in self.$jsobj){
            if(attr.charAt(0) !== "$" && attr !== "__class__"){
                delete self.$jsobj[attr]
            }
        }
    }
    return $N
}

dict.copy = function(self){
    // Return a shallow copy of the dictionary
    var $ = $B.args("copy", 1, {self: null},["self"], arguments,{},
        null, null),
        self = $.self,
        res = _b_.dict.$factory()
    $copy_dict(res, self)
    return res
}

dict.fromkeys = function(){

    var $ = $B.args("fromkeys", 3, {cls: null, keys: null, value: null},
        ["cls", "keys", "value"], arguments, {value: _b_.None}, null, null),
        keys = $.keys,
        value = $.value

    // class method
    var klass = $.cls,
        res = $B.$call(klass)(),
        keys_iter = $B.$iter(keys),
        ce = $B.current_exception

    while(1){
        try{
            var key = _b_.next(keys_iter)
            if(klass === dict){dict.__setitem__(res, key, value)}
            else{_b_.getattr(res, "__setitem__")(key, value)}
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration])){
                $B.current_exception = ce
                return res
            }
            throw err
        }
    }
}

dict.get = function(){
    var $ = $B.args("get", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: $N}, null, null)

    try{return dict.__getitem__($.self, $.key)}
    catch(err){
        if(_b_.isinstance(err, _b_.KeyError)){return $._default}
        else{throw err}
    }
}

var $dict_itemsDict = $B.$iterator_class("dict_items")

dict.items = function(self){
    if(arguments.length > 1){
       var _len = arguments.length - 1,
           _msg = "items() takes no arguments (" + _len + " given)"
       throw _b_.TypeError.$factory(_msg)
    }
    return $iterator_wrapper(new $item_iterator(self), $dict_itemsDict)
}

var $dict_keysDict = $B.$iterator_class("dict_keys")

dict.keys = function(self){
    if(arguments.length > 1){
       var _len = arguments.length - 1,
           _msg = "keys() takes no arguments (" + _len + " given)"
       throw _b_.TypeError.$factory(_msg)
    }
    return $iterator_wrapper(new $key_iterator(self), $dict_keysDict)
}

dict.pop = function(){

    var $ = $B.args("pop", 3, {self: null, key: null, _default: null},
        ["self", "key", "_default"], arguments, {_default: $N}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default

    try{
        var res = dict.__getitem__(self, key)
        dict.__delitem__(self, key)
        return res
    }catch(err){
        if(err.__class__ === _b_.KeyError){
            if(_default !== undefined){return _default}
            throw err
        }
        throw err
    }
}

dict.popitem = function(self){
    var ce = $B.current_exception
    try{
        var itm = new $item_iterator(self).next()
        dict.__delitem__(self, itm[0])
        return _b_.tuple.$factory(itm)
    }catch(err) {
        if (err.__class__ == _b_.StopIteration) {
            $B.current_exception = ce
            throw KeyError.$factory("'popitem(): dictionary is empty'")
        }
    }
}

dict.setdefault = function(){

    var $ = $B.args("setdefault", 3, {self: null, key: null, _default: null},
            ["self", "key", "_default"], arguments, {_default: $N}, null, null),
        self = $.self,
        key = $.key,
        _default = $._default

    try{return dict.__getitem__(self, key)}
    catch(err){
        if(_default === undefined){_default = $N}
        dict.__setitem__(self, key, _default)
        return _default
    }
}

dict.update = function(self){

    var $ = $B.args("update", 1, {"self": null}, ["self"], arguments,
            {}, "args", "kw"),
        self = $.self,
        args = $.args,
        kw = $.kw

    if(args.length > 0){
        var o = args[0]
        if(isinstance(o, dict)){
           if(o.$jsobj){o = jsobj2dict(o)}
           $copy_dict(self, o)
        }else if(hasattr(o, "__getitem__") && hasattr(o, "keys")){
           var _keys = _b_.list.$factory(getattr(o, "keys")()),
               si = dict.__setitem__,
               i = _keys.length
           while(i--){
               var _value = getattr(o, "__getitem__")(_keys[i])
               si(self, _keys[i], _value)
           }
        }
    }
    $copy_dict(self, kw)
    return $N
}

var $dict_valuesDict = $B.$iterator_class("dict_values")

dict.values = function(self){
    if(arguments.length > 1){
       var _len = arguments.length - 1,
           _msg = "values() takes no arguments (" + _len + " given)"
       throw _b_.TypeError.$factory(_msg)
    }
    return $iterator_wrapper(new $value_iterator(self), $dict_valuesDict)
}

dict.$factory = function(args, second){

    var res = {__class__: dict,
        $numeric_dict : {},
        $object_dict : {},
        $string_dict : {},
        $str_hash: {}
    }

    if(args === undefined){return res}

    if(second === undefined){
        if(Array.isArray(args)){
            // Form "dict([[key1, value1], [key2,value2], ...])"
            var i = -1,
                stop = args.length - 1,
                si = dict.__setitem__
            while(i++ < stop){
                var item = args[i]
                switch(typeof item[0]) {
                    case 'string':
                        res.$string_dict[item[0]] = item[1]
                        res.$str_hash[str_hash(item[0])] = item[0]
                        break
                    case 'number':
                        res.$numeric_dict[item[0]] = item[1]
                        break
                    default:
                        si(res, item[0], item[1])
                        break
                }
            }
            return res
        }else if(args.$nat == "kw"){
            // Form dict(k1=v1, k2=v2...)
            var kw = args["kw"]
            for(var attr in kw){
                switch(typeof attr){
                    case "string":
                        res.$string_dict[attr] = kw[attr]
                        res.$str_hash[str_hash(attr)] = attr
                        break
                    case "number":
                        res.$numeric_dict[attr] = kw[attr]
                        break
                    default:
                        si(res, attr, kw[attr])
                        break
                }
            }
            return res
        }else if(args.$jsobj){
            res.$jsobj = {}
            for(var attr in args.$jsobj){res.$jsobj[attr] = args.$jsobj[attr]}
            return res
        }
    }

    // apply __init__ with arguments of dict()
    dict.__init__(res, ...arguments)
    return res
}

_b_.dict = dict

$B.set_func_names(dict, "builtins")

// This must be done after set_func_names, otherwise dict.fromkeys doesn't
// have the attribute $infos
dict.fromkeys = _b_.classmethod.$factory(dict.fromkeys)

// following are used for faster access elsewhere
$B.$dict_iterator = function(d){return new $item_generator(d)}
$B.$dict_length = dict.__len__
$B.$dict_getitem = dict.__getitem__
$B.$dict_get = dict.get
$B.$dict_set = dict.__setitem__
$B.$dict_contains = dict.__contains__
$B.$dict_items = function(d) { return new $item_generator(d).as_list() }
$B.$copy_dict = $copy_dict  // copy from right to left
$B.$dict_get_copy = dict.copy  // return a shallow copy


// Class for attribute __dict__ of classes
var mappingproxy = $B.make_class("mappingproxy",
    function(obj){
        var res = obj_dict(obj)
        res.__class__ = mappingproxy
        return res
    }
)

mappingproxy.__setitem__ = function(){
    throw _b_.TypeError.$factory("'mappingproxy' object does not support " +
        "item assignment")
}

$B.set_func_names(mappingproxy, "builtins")

function jsobj2dict(x){
    var d = dict.$factory()
    for(var attr in x){
        if(attr.charAt(0) != "$" && attr !== "__class__"){
            if(x[attr] === undefined){
                continue
            }else if(x[attr].$jsobj === x){
                d.$string_dict[attr] = d
            }else{
                d.$string_dict[attr] = x[attr]
            }
        }
    }
    return d
}
$B.obj_dict = function(obj){
    var klass = $B.get_class(obj)
    if(klass !== undefined && klass.$native){
        throw _b_.AttributeError.$factory(klass.__name__ +
            " has no attribute '__dict__'")}
    var res = dict.$factory()
    res.$jsobj = obj
    return res
}

})(__BRYTHON__)
