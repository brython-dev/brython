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

function wrap(dunder){
    return function(cls, attr){
        var func = cls[attr]
        if(func === undefined){
            console.log('no attr', attr, 'for cls', cls)
        }
        if(func !== _b_.None){
            func.ml = {ml_name: dunder}
        }
        cls.dict[dunder] = func
    }
}

$B.wrapper_methods = Object.create(null)
Object.assign($B.wrapper_methods,
    {
        mp_length: wrap('__len__'),
        mp_subscript: wrap('__getitem__'),
        nb_absolute: wrap('__abs__'),
        nb_add: make_add,
        sq_length: wrap('__len__'),
        tp_call: wrap('__call__'),
        tp_descr_get: wrap('__get__'),
        tp_getattro: wrap('__getattribute__'),
        tp_hash: wrap('__hash__'),
        tp_init: wrap('__init__'),
        tp_iter: wrap('__iter__'),
        tp_iternext: make_next,
        tp_new: make_new,
        tp_repr: wrap('__repr__'),
        tp_str : wrap('__str__'),
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

function make_new(cls){
    cls.dict.__new__ = cls.tp_new
}

function make_next(cls){
    var next = function(obj){
        var itn = cls.tp_iternext(obj)
        var res = itn.next()
        if(res.done){
            $B.RAISE(__BRYTHON__.builtins.StopIteration)
        }
        return res.value
    }
    next.ml = {ml_name: '__next__'}
    cls.dict.__next__ = next
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

$B.finalize_type = function(cls){
    if(cls.tp_funcs){
        if(cls.tp_getset){
            for(var descr of cls.tp_getset){
                var getset = [
                    cls.tp_funcs[descr + '_get'], // getter
                    cls.tp_funcs[descr + '_set'] // setter
                ]
                cls.dict[descr] = $B.getset_descriptor.$factory(cls, descr, getset)
            }
        }
        if(cls.tp_methods){
            for(var descr of cls.tp_methods){
                var method = cls.tp_funcs[descr]
                if(method === undefined){
                    console.log('no method', cls, cls.tp_funcs, descr)
                    alert()
                }
                cls.dict[descr] = $B.method_descriptor.$factory(cls, descr, method)
            }
        }
        if(cls.tp_members){
            for(var descr of cls.tp_members){
                var member = cls.tp_funcs[descr]
                cls.dict[descr] = $B.member_descriptor.$factory(cls, descr, member)
            }
        }
        if(cls.classmethods){
            for(var descr of cls.classmethods){
                if(! ['__new__', '__class_getitem__'].includes(descr)){
                    cls.dict[descr] = _b_.classmethod.$factory(cls.tp_funcs[descr])
                }
            }
        }
        for(var slot in $B.wrapper_methods){
            if(cls[slot]){
                $B.wrapper_methods[slot](cls, slot)
            }
        }
        return
    }
    if(cls.tp_getset){
        for(var getset of cls.tp_getset){
            var [name, get, set] = getset
            cls.dict[name] = $B.getset_descriptor.$factory(cls, name, [get, set])
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
            $B.wrapper_methods[slot](cls, slot)
        }
    }
}

for(var ns of [$B.builtin_types, $B.created_types]){
    for(var name in ns){
        if(ns[name].ob_type !== _b_.type){
            continue
        }
        var cls = ns[name]
        $B.finalize_type(cls)
    }
}

})(__BRYTHON__)