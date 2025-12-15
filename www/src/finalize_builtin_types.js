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
        mp_length: make_mapping_len,
        nb_add: make_add,
        sq_length: make_seq_length,
        tp_call: make_call,
        tp_getattro: make_getattribute,
        tp_hash: make_hash,
        tp_init: make_init,
        tp_iter: make_iter,
        tp_iternext: make_next,
        tp_new: make_new,
        tp_repr: make_repr,
        tp_str : make_str,
        tp_richcompare: make_richcompare
    }
)

function make_add(cls){
    var add = cls.nb_add
    add.ml = {ml_name: '__add__'}
    cls.dict.__add__ = $B.wrapper_descriptor.$factory(
        cls,
        '__add__',
        add
    )
    var radd = (x, y) => add(y, x)
    radd.ml = {ml_name: '__radd__'}
    cls.dict.__radd__ = $B.wrapper_descriptor.$factory(
        cls,
        '__radd__',
        radd
    )
}

function make_call(cls){
    var call = cls.tp_call
    call.ml = {ml_name: '__call__'}
    cls.dict.__call__ = $B.wrapper_descriptor.$factory(
        cls,
        '__call__',
        call
    )
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

function make_init(cls){
    var init = cls.tp_init
    init.ml = {ml_name: '__init__'}
    cls.dict.__init__ = $B.wrapper_descriptor.$factory(
        cls,
        '__init__',
        init
    )
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

function make_mapping_len(cls){
    var len = cls.mp_length
    len.ml = {ml_name: '__len__'}
    cls.dict.__len__ = $B.wrapper_descriptor.$factory(
        cls,
        '__len__',
        len
    )
}

function make_new(cls){
    cls.dict.__new__ = cls.tp_new
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

function make_richcompare(cls){
    var comp = cls.tp_richcompare
    var eq = (a, b) => comp(a, b) == 0
    var ne = (a, b) => comp(a, b) != 0
    var le = (a, b) => comp(a, b) <= 0
    var lt = (a, b) => comp(a, b) < 0
    var ge = (a, b) => comp(a, b) >= 0
    var gt = (a, b) => comp(a, b) > 0
    cls.dict.__eq__ = $B.wrapper_descriptor.$factory(
        cls,
        '__eq__',
        eq
    )
    cls.dict.__ne__ = $B.wrapper_descriptor.$factory(
        cls,
        '__ne__',
        ne
    )
    cls.dict.__le__ = $B.wrapper_descriptor.$factory(
        cls,
        '__le__',
        le
    )
    cls.dict.__lt__ = $B.wrapper_descriptor.$factory(
        cls,
        '__lt__',
        lt
    )
    cls.dict.__ge__ = $B.wrapper_descriptor.$factory(
        cls,
        '__ge__',
        ge
    )
    cls.dict.__gt__ = $B.wrapper_descriptor.$factory(
        cls,
        '__gt__',
        gt
    )
}

function make_seq_length(cls){
    var len = cls.sq_length
    cls.dict.__len__ = $B.wrapper_descriptor.$factory(
        cls,
        '__len__',
        len
    )
}

function make_str(klass){
    var str = klass.tp_str
    str.ml = {ml_name: '__str__'}
    klass.dict.__str__ = str
}

console.log('create types', $B.created_types)

for(var ns of [_b_, $B.created_types]){
    for(var name in ns){
        if(ns[name].ob_type !== _b_.type){
            continue
        }
        var cls = ns[name]
        if(cls.tp_getset){
            for(var getset of cls.tp_getset){
                var [name, get, set] = getset
                cls.dict[name] = $B.getset_descriptor.$factory(cls, name, get, set)
            }
        }
        if(cls.tp_methods){
            for(var method of cls.tp_methods){
                var [name, get] = method
                cls.dict[name] = $B.method_descriptor.$factory(cls, name, get)
            }
        }
        for(var slot in $B.wrapper_methods){
            if(cls[slot]){
                $B.wrapper_methods[slot](cls)
            }
        }
    }
}


console.log($B.get_class([1, 'a']))
})(__BRYTHON__)