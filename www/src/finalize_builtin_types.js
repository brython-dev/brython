(function($B){

var _b_ = $B.builtins

/*
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
*/

function wrap(dunder){
    return function(cls, attr){
        var func = cls[attr]
        if(func === undefined){
            console.log('no attr', attr, 'for cls', cls)
        }
        if(func !== _b_.None){
            func.ml = {ml_name: dunder}
        }
        $B.str_dict_set(cls.dict, dunder, $B.wrapper_descriptor.$factory(
            cls,
            dunder,
            func
        ))
    }
}

function wrap_with_reflected(dunder, rdunder){
    return function(cls, attr){
        var func = cls[attr]
        $B.str_dict_set(cls.dict, dunder, $B.wrapper_descriptor.$factory(
            cls,
            dunder,
            func
        ))
        $B.str_dict_set(cls.dict, rdunder, $B.wrapper_descriptor.$factory(
            cls,
            rdunder,
            (a, b) => func(b, a)
        ))
    }
}

$B.wrapper_methods = Object.create(null)
Object.assign($B.wrapper_methods,
    {
        mp_length: wrap('__len__'),
        mp_subscript: wrap('__getitem__'),
        mp_ass_subscript: make_setitem_delitem,
        nb_absolute: wrap('__abs__'),
        nb_add: wrap_with_reflected('__add__', '__radd__'),
        nb_and: wrap_with_reflected('__and__', '__rand__'),
        nb_divmod: wrap_with_reflected('__divmod__', '__rdivmod__'),
        nb_floor_divide: wrap('__floordiv__'),
        nb_index: wrap('__index__'),
        nb_lshift: wrap_with_reflected('__lshift__', '__rlshift__'),
        nb_inplace_add: wrap('__iadd__'),
        nb_inplace_multiply: wrap('__imul__'),
        nb_matrix_multiply: wrap_with_reflected('__matmul__', '__rmatmul__'),
        nb_multiply: wrap_with_reflected('__mul__', '__rmul__'),
        nb_or: wrap_with_reflected('__or__', '__ror__'),
        nb_power: wrap_with_reflected('__pow__', '__rpow__'),
        nb_remainder: wrap_with_reflected('__mod__', '__rmod__'),
        nb_subtract: wrap_with_reflected('__sub__', '__rsub__'),
        nb_rshift: wrap_with_reflected('__rshift__', '__rrshift__'),
        nb_true_divide: wrap('__truediv__'),
        nb_xor: wrap_with_reflected('__xor__', '__rxor__'),
        sq_ass_item: make_setitem_delitem,
        sq_concat: wrap('__add__'),
        sq_contains: wrap('__contains__'),
        sq_length: wrap('__len__'),
        tp_call: wrap('__call__'),
        tp_descr_get: wrap('__get__'),
        tp_getattro: make_getattribute,
        tp_finalize: wrap('__del__'),
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

function make_getattribute(cls){
    var getattribute = cls.tp_getattro
    var ga_func = function(self, attr){
        var res = getattribute(self, attr)
        if(res === $B.NULL){
            throw $B.attr_error(attr, self)
        }
        return res
    }
    $B.str_dict_set(cls.dict, '__getattribute__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__getattribute__',
            ga_func
        )
    )
}

function make_new(cls){
    cls.tp_new.ob_type = $B.builtin_function_or_method
    $B.str_dict_set(cls.dict, '__new__', cls.tp_new)
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
    $B.str_dict_set(cls.dict, '__next__', next)
}

function make_setitem_delitem(cls){
    var setitem = cls.sq_ass_item ?? cls.mp_ass_subscript
    $B.str_dict_set(cls.dict, '__setitem__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__setitem__',
            setitem
        )
    )
    $B.str_dict_set(cls.dict, '__delitem__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__delitem__',
            (a) => setitem(a, $B.NULL)
        )
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
    $B.str_dict_set(cls.dict, '__eq__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__eq__',
            eq
        )
    )
    $B.str_dict_set(cls.dict, '__ne__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__ne__',
            ne
        )
    )
    $B.str_dict_set(cls.dict, '__le__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__le__',
            le
        )
    )
    $B.str_dict_set(cls.dict, '__lt__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__lt__',
            lt
        )
    )
    $B.str_dict_set(cls.dict, '__ge__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__ge__',
            ge
        )
    )
    $B.str_dict_set(cls.dict, '__gt__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__gt__',
            gt
        )
    )
}

$B.finalize_type = function(cls){
    if(cls.tp_name == 'JSArray_iterator'){
        console.log('finalize', cls)
    }

    cls.tp_mro = $B.make_mro(cls)
    cls.dict = $B.empty_dict()
    if(cls.tp_funcs){
        if(cls.tp_getset){
            for(var descr of cls.tp_getset){
                var getset = [
                    cls.tp_funcs[descr + '_get'], // getter
                    cls.tp_funcs[descr + '_set'] // setter
                ]
                $B.str_dict_set(cls.dict, descr,
                    $B.getset_descriptor.$factory(cls, descr, getset))
            }
        }
        if(cls.tp_methods){
            for(var descr of cls.tp_methods){
                var method = cls.tp_funcs[descr]
                if(method === undefined){
                    console.log('no method', cls, cls.tp_funcs, descr)
                    alert()
                }
                method.ob_type = $B.builtin_method
                $B.str_dict_set(cls.dict, descr, {
                    ob_type: $B.method_descriptor,
                    method,
                    ml: {ml_name: descr},
                    cls
                })
                method.self = $B.str_dict_get(cls.dict, descr)
            }
        }
        if(cls.tp_members){
            for(var descr of cls.tp_members){
                var member = {
                    ob_type: $B.method_descriptor,
                    method: cls.tp_funcs[descr],
                    ml: {ml_name: descr},
                    cls
                }
                $B.str_dict_set(cls.dict, descr, {
                    ob_type: $B.member_descriptor,
                    d_member: member,
                    d_type: cls,
                    d_name: descr
                })
            }
        }
        if(cls.classmethods){
            for(var descr of cls.classmethods){
                $B.str_dict_set(cls.dict, descr, {
                    ob_type: $B.classmethod_descriptor,
                    d_name: descr,
                    d_type: cls,
                    d_method: cls.tp_funcs[descr]
                })
            }
        }
        if(cls.staticmethods){
            for(var descr of cls.staticmethods){
                $B.str_dict_set(cls.dict, descr,
                    _b_.staticmethod.$factory(cls.tp_funcs[descr]))
            }
        }
    }
    for(var slot in $B.wrapper_methods){
        if(cls[slot]){
            $B.wrapper_methods[slot](cls, slot)
        }
    }
    /*
    if(cls.tp_getset){
        for(var getset of cls.tp_getset){
            var [name, get, set] = getset
            cls.dict[name] = $B.getset_descriptor.$factory(cls, name, [get, set])
        }
    }
    if(cls.tp_methods){
        for(var method of cls.tp_methods){
            cls.dict[name] = {
                ob_type: $B.method_descriptor,
                method,
                ml: {ml_name: name},
                cls
            }
            method.ob_type = $B.builtin_method
            method.self = cls.dict[name]
        }
    }
    for(var slot in $B.wrapper_methods){
        if(cls[slot]){
            $B.wrapper_methods[slot](cls, slot)
        }
    }
    */
}

console.log('created types', $B.created_types)

for(var ns of [$B.builtin_types, $B.created_types]){
    for(var name in ns){
        if(ns[name].ob_type !== _b_.type){
            continue
        }
        var cls = ns[name]
        $B.finalize_type(cls)
    }
}


// builtin functions
for(var builtin_func of $B.builtin_funcs){
    if(_b_[builtin_func]){
        _b_[builtin_func].ob_type = $B.builtin_function_or_method
    }else{
        console.log('missing builtin function', builtin_func)
    }
}

})(__BRYTHON__)