(function($B) {

var _b_ = $B.builtins

function wrap(dunder, nb_args) {
    return function(cls, attr) {
        if (nb_args !== undefined) {
            var func = function() {
                var $ = $B.args(dunder, nb_args, {obj: null}, arguments,
                            null, 'args', 'kw')
                var obj = $.obj,
                    args = $.args,
                    kw = $.kw
                if (_b_.len(kw) > 0) {
                    $B.RAISE(_b_.TypeError,
                        `wrapper '${dunder}' takes no keyword argument`
                    )
                }
                if (args.length > nb_args - 1) {
                    var plural = nb_args == 1 ? '' : 's'
                    $B.RAISE(_b_.TypeError,
                        `expected ${nb_args - 1} argument${plural}, got ${args.length}`
                    )
                }
                return cls[attr](obj)
            }
        } else {
            var func = cls[attr]
        }
        if (func === undefined) {
            console.log('no attr', attr, 'for cls', cls)
        }
        if (func !== _b_.None) {
            func.ml = {ml_name: dunder}
        }
        $B.set_to_dict(cls, dunder, $B.wrapper_descriptor.$factory(
            cls,
            dunder,
            func
        ))
    }
}

function wrap_with_reflected(dunder, rdunder) {
    return function(cls, attr) {
        var func = cls[attr]
        $B.set_to_dict(cls, dunder, $B.wrapper_descriptor.$factory(
            cls,
            dunder,
            func
        ))
        $B.set_to_dict(cls, rdunder, $B.wrapper_descriptor.$factory(
            cls,
            rdunder,
            (self, other) => func(other, self)
        ))
    }
}

function wrap_with_same_reflected(dunder, rdunder) {
    return function(cls, attr) {
        var func = cls[attr]
        $B.set_to_dict(cls, dunder, $B.wrapper_descriptor.$factory(
            cls,
            dunder,
            func
        ))
        $B.set_to_dict(cls, rdunder, $B.wrapper_descriptor.$factory(
            cls,
            rdunder,
            func
        ))
    }
}

$B.wrapper_methods = Object.create(null)
Object.assign($B.wrapper_methods,
    {
        am_aiter: wrap('__aiter__'),
        am_anext: wrap('__anext__'),
        bf_getbuffer: wrap('__buffer__'),
        bf_releasebuffer: wrap('__release_buffer__'),
        mp_length: wrap('__len__'),
        mp_subscript: wrap('__getitem__'),
        mp_ass_subscript: make_setitem_delitem,
        nb_absolute: wrap('__abs__'),
        nb_add: wrap_with_reflected('__add__', '__radd__'),
        nb_and: wrap_with_reflected('__and__', '__rand__'),
        nb_bool: wrap('__bool__'),
        nb_divmod: wrap_with_reflected('__divmod__', '__rdivmod__'),
        nb_floor_divide: wrap_with_reflected('__floordiv__', '__rfloordiv__'),
        nb_float: wrap('__float__'),
        nb_index: wrap('__index__'),
        nb_lshift: wrap_with_reflected('__lshift__', '__rlshift__'),
        nb_inplace_add : wrap('__iadd__'),
        nb_inplace_and : wrap('__iand__'),
        nb_inplace_floor_divide : wrap('__ifloordiv__'),
        nb_inplace_lshift : wrap('__ilshift__'),
        nb_inplace_matrix_multiply : wrap('__imatmul__'),
        nb_inplace_multiply : wrap('__imul__'),
        nb_inplace_or : wrap('__ior__'),
        nb_inplace_remainder : wrap('__imod__'),
        nb_inplace_power : wrap('__ipow__'),
        nb_inplace_subtract : wrap('__isub__'),
        nb_inplace_true_divide : wrap('__itruediv__'),
        nb_inplace_rshift : wrap('__irshift__'),
        nb_inplace_xor : wrap('__ixor__'),
        nb_int : wrap('__int__'),
        nb_invert: wrap('__invert__'),
        nb_matrix_multiply: wrap_with_reflected('__matmul__', '__rmatmul__'),
        nb_multiply: wrap_with_reflected('__mul__', '__rmul__'),
        nb_negative: wrap('__neg__'),
        nb_or: wrap_with_reflected('__or__', '__ror__'),
        nb_positive: wrap('__pos__'),
        nb_power: wrap_with_reflected('__pow__', '__rpow__'),
        nb_remainder: wrap_with_reflected('__mod__', '__rmod__'),
        nb_subtract: wrap_with_reflected('__sub__', '__rsub__'),
        nb_rshift: wrap_with_reflected('__rshift__', '__rrshift__'),
        nb_true_divide: wrap_with_reflected('__truediv__', '__rtruediv__'),
        nb_xor: wrap_with_reflected('__xor__', '__rxor__'),
        sq_ass_item: make_setitem_delitem,
        sq_concat: wrap('__add__'),
        sq_contains: wrap('__contains__'),
        sq_length: wrap('__len__'),
        sq_repeat: wrap_with_same_reflected('__mul__', '__rmul__'),
        tp_call: wrap('__call__'),
        tp_descr_get: wrap('__get__'),
        tp_descr_set: make_set_del,
        tp_doc: make_doc,
        tp_getattro: make_getattribute,
        tp_finalize: wrap('__del__'),
        tp_hash: wrap('__hash__'),
        tp_init: wrap('__init__'),
        tp_iter: wrap('__iter__'),
        tp_iternext: make_next,
        tp_new: make_new,
        tp_repr: wrap('__repr__', 1),
        tp_str : wrap('__str__', 1),
        tp_setattro: make_setattr_delattr,
        tp_richcompare: make_richcompare
    }
)

function make_doc(cls) {
    var in_dict = $B.get_from_dict(cls, '__doc__', $B.NULL)
    if (in_dict === $B.NULL) {
        $B.set_to_dict(cls, '__doc__', cls.tp_doc)
    }
}

function make_getattribute(cls) {
    var getattribute = cls.tp_getattro
    var ga_func = function(self, attr) {
        var res = getattribute(self, attr)
        if (res === $B.NULL) {
            throw $B.attr_error(attr, self)
        }
        return res
    }
    $B.set_to_dict(cls, '__getattribute__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__getattribute__',
            ga_func
        )
    )
}

function make_new(cls) {
    function new_func() {
        var $ = $B.args('__new__', 1, {cls: null}, arguments, null, 'args',
                    'kw')
        return cls.tp_new($.cls, $.args, $.kw)
    }
    new_func.ob_type = $B.builtin_function_or_method
    new_func.m_self = cls
    new_func.ml = {ml_name: '__new__'}
    $B.set_function_infos(new_func,
        {
            __name__: '__new__',
            __qualname__: '__new__'
        }
    )
    cls.tp_new.$is_slot = true
    $B.set_to_dict(cls, '__new__', new_func)
}

function make_next(cls) {
    var next_func = function(obj) {
        var itn = cls.tp_iternext(obj)
        var res = itn.next()
        if (res.done) {
            $B.RAISE(_b_.StopIteration, res.value)
        }
        return res.value
    }
    next_func.ob_type = $B.function
    var descr = $B.wrapper_descriptor.$factory(
        cls,
        '__next__',
        next_func
    )

    $B.set_to_dict(cls, '__next__', next_func)
}

function make_set_del(cls) {
    var set_func = cls.tp_descr_set
    $B.set_to_dict(cls, '__set__', $B.wrapper_descriptor.$factory(
        cls,
        '__set__',
        set_func
    ))
    $B.set_to_dict(cls, '__delete__', $B.wrapper_descriptor.$factory(
        cls,
        '__set__',
        (self, attr) => set_func(self, attr, $B.NULL)
    ))
}

function make_setitem_delitem(cls) {
    var setitem = cls.sq_ass_item ?? cls.mp_ass_subscript
    var setitem_func = function() {
        var $ = $B.args("__setitem__", 3,
                    {self: null, key: null, value: null}, arguments)
        return setitem($.self, $.key, $.value)
    }
    $B.set_to_dict(cls, '__setitem__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__setitem__',
            setitem_func
        )
    )
    var delitem_func = function() {
        var $ = $B.args("__detitem__", 2, {self: null, key: null}, arguments)
        return setitem($.self, $.key, $B.NULL)
    }
    $B.set_to_dict(cls, '__delitem__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__delitem__',
            delitem_func
        )
    )
}

function make_setattr_delattr(cls) {
    var setattro = cls.tp_setattro
    $B.set_to_dict(cls, '__setattr__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__setattr__',
            setattro
        )
    )
    $B.set_to_dict(cls, '__delattr__',
        $B.wrapper_descriptor.$factory(
            cls,
            '__delattr__',
            function(obj, attr) {
                setattro(obj, attr, $B.NULL)
            }
        )
    )
}

function make_richcompare(cls) {
    var comp = cls.tp_richcompare
    for (var op of ['__eq__', '__ne__', '__lt__', '__le__', '__ge__', '__gt__']) {
        var func = (function(_op) {
            return function(self, other) {
                return comp(self, other, _op)
            }
        })(op)
        $B.set_to_dict(cls, op,
            $B.wrapper_descriptor.$factory(
                cls,
                op,
                func
            )
        )
    }
}

$B.finalize_type = function(cls) {
    cls.tp_mro = $B.make_mro(cls)
    $B.set_dict(cls, $B.get_dict(cls) ?? $B.empty_dict())
    cls.tp_subclasses = []
    for (var base of cls.tp_bases) {
        base.tp_subclasses.push(cls)
    }
    var parts = cls.tp_name.split('.')
    var module = parts.length == 1 ? 'builtins' :
        parts.slice(0, parts.length - 1).join('.')
    if ($B.get_from_dict(cls, '__module__', $B.NULL) === $B.NULL) {
        $B.set_to_dict(cls, '__module__', module)
    }

    if (cls.tp_getset) {
        for (var descr of cls.tp_getset) {
            var getset = [
                cls.tp_funcs[descr + '_get'], // getter
                cls.tp_funcs[descr + '_set'] // setter
            ]
            $B.set_to_dict(cls, descr,
                $B.getset_descriptor.$factory(cls, descr, getset))
        }
    }
    if (cls.tp_methods) {
        for (var descr of cls.tp_methods) {
            var method = cls.tp_funcs[descr]
            if (method === undefined) {
                console.log('no method', cls, cls.tp_funcs, descr)
                alert()
            }
            method.ob_type = $B.builtin_method
            $B.set_to_dict(cls, descr, {
                ob_type: $B.method_descriptor,
                method,
                d_name: descr,
                d_type: cls
            })
            method.self = $B.get_from_dict(cls, descr)
        }
    }
    if (cls.tp_members) {
        for (var descr of cls.tp_members) {
            var [name, type, attr, flags] = descr
            $B.set_to_dict(cls, name,
                {
                    ob_type: $B.member_descriptor,
                    d_member: {name, type, attr, flags},
                    d_name: name,
                    d_type: cls
                }
            )
        }
    }
    if (cls.classmethods) {
        for (var descr of cls.classmethods) {
            $B.set_to_dict(cls, descr, {
                ob_type: $B.classmethod_descriptor,
                d_name: descr,
                d_type: cls,
                d_method: cls.tp_funcs[descr]
            })
        }
    }
    if (cls.staticmethods) {
        for (var descr of cls.staticmethods) {
            $B.set_to_dict(cls, descr,
                _b_.staticmethod.$factory(cls.tp_funcs[descr]))
        }
    }

    for (var slot in $B.wrapper_methods) {
        if (cls[slot]) {
            $B.wrapper_methods[slot](cls, slot)
        }else if(['tp_descr_get', 'tp_descr_set', 'tp_iter', 'tp_call',
                'tp_new', 'tp_init', 'tp_setattro'].includes(slot)){
            cls[slot] = $B.NULL
            if (cls.tp_mro) {
                for (var kls of cls.tp_mro.slice(1)) {
                    if (Object.hasOwn(cls, slot)) {
                        cls[slot] = kls[slot]
                        break
                    }
                }
            }
        }
    }

    $B.make_getattr(cls)
}


for (var ns of [$B.builtin_types, $B.created_types]) {
    for (var name in ns) {
        var cls = ns[name]
        $B.finalize_type(cls)
    }
}


// builtin functions
// UnicodeEncodeError/UnicodeDecodeError expose encoding/object/start/end/
// reason, derived from the constructor arguments (done here, after every
// type and getset_descriptor exists)
for (const ucls of [_b_.UnicodeEncodeError, _b_.UnicodeDecodeError]) {
    const attrs = ["encoding", "object", "start", "end", "reason"]
    for (let pos = 0; pos < attrs.length; pos++) {
        const name = attrs[pos],
              rank = pos
        $B.set_to_dict(ucls, name, $B.getset_descriptor.$factory(ucls, name,
            [function(self){
                const a = self.args
                return (a && a.length === 5) ? a[rank] : _b_.None
            }, _b_.None]))
    }
}

for (var builtin_func of $B.builtin_funcs) {
    if (_b_[builtin_func]) {
        _b_[builtin_func].ob_type = $B.builtin_function_or_method
        _b_[builtin_func].m_module = 'builtins'
        _b_[builtin_func].$function_infos = ['builtins', builtin_func, builtin_func]
    } else {
        console.log('missing builtin function', builtin_func)
    }
}

})(__BRYTHON__)