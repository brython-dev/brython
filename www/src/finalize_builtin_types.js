(function($B){

var _b_ = $B.builtins


$B.set_class_attr = function(klass, attr, value, ob_type){
    if(ob_type){
        if(ob_type.$factory === undefined){
            console.log('no factory', ob_type)
        }
        if(value !== _b_.None){
            if(ob_type === $B.getset_descriptor){
                value = ob_type.$factory(klass, attr)
            }else{
                value = ob_type.$factory(value, klass)
            }
        }
    }
    klass.dict[attr] = value
}


$B.make_class_dict = function(klass, methods){
    console.log('make class dict', $B.get_name(klass))
    var test = klass.tp_name == 'mappingproxy'
    if(test){
        console.log('make class attrs of', klass)
    }
    klass.dict = Object.create(null)
    for(let attr in klass){
        if($B.wrapper_methods[attr]){
            // if klass.tp_iter is present, create entry klass.dict.__iter__
            $B.wrapper_methods[attr](klass)
        }
    }
    for(var cls_name in methods){
        var cls = $B[cls_name]
        for(var method of methods[cls_name]){
            if(klass[method]){
                $B.set_class_attr(klass, method, klass[method], cls)
            }else{
                // console.log('not implemented', method, 'for', klass.tp_name)
            }
        }
    }
}

$B.wrapper_methods = Object.create(null)
Object.assign($B.wrapper_methods,
    {
        tp_call: make_call,
        tp_getattro: make_getattribute,
        tp_hash: make_hash,
        tp_iter: make_iter,
        tp_iternext: make_next,
        tp_repr: make_repr,
        tp_str : make_str
    }
)

function make_call(cls){
    var call = cls.tp_call
    call.ml = {ml_name: '__call__'}
    cls.dict.__call__ = cls.tp_call
}

function make_getattribute(cls){
    var getattribute = cls.tp_getattro
    getattribute.ml = {ml_name: '__getattribute__'}
    cls.dict.__getattribute__ = cls.tp_getattro
}

function make_hash(cls){
    var hash = cls.tp_hash
    hash.ml = {ml_name: '__hash__'}
    cls.dict.__hash__ = cls.tp_hash
}

function make_iter(cls){
    var iter = cls.tp_iter
    iter.ml = {ml_name: '__iter__'}
    cls.dict.__iter__ = $B.getset_descriptor.$factory(
        cls,
        '__iter__',
        iter
    )
}

function make_next(cls){
    var next = function(obj){
        var res = cls.tp_iternext(obj).next()
        if(res.done){
            $B.RAISE(__BRYTHON__.builtins.StopIteration)
        }
        return res.value
    }
    next.ml = {ml_name: '__next__'}
    cls.dict.__next__ = next
}

function make_repr(cls){
    var repr = cls.tp_repr
    repr.ml = {ml_name: '__repr__'}
    cls.dict.__repr__ = $B.wrapper_descriptor.$factory(
        cls,
        '__repr__',
        repr
    )
}

function make_str(klass){
    var str = klass.tp_str
    str.ml = {ml_name: '__str__'}
    klass.dict.__str__ = str
}

console.log('_b_.type.ob_type 118', _b_.type.ob_type)

var builtin_types = $B.created_types // updated by $B.make_builtin_class

for(var cls of builtin_types){
    console.log(cls.tp_name, cls.ob_type)
    var test = cls === _b_.type
    if(cls.tp_getset){
        for(var getset of cls.tp_getset){
            var [name, get, set] = getset
            cls.dict[name] = $B.getset_descriptor.$factory(cls, name, get, set)
        }
    }
    if(test){
        console.log(_b_.type.ob_type === _b_.type)
    }
    for(var slot in $B.wrapper_methods){
        if(cls[slot]){
            if(cls.tp_name == 'wrapper_descriptor' && slot == 'tp_getattro'){
                console.log('set slot', cls, slot, cls[slot])
            }
            $B.wrapper_methods[slot](cls)
            if(test){
                console.log('after slot', slot, _b_.type.ob_type === _b_.type)
            }
        }
    }
}

console.log('_b_.type.ob_type', _b_.type.ob_type)

})(__BRYTHON__)