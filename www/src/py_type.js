"use strict";
(function($B){

var _b_ = $B.builtins

const TPFLAGS = {
    DEFAULT: 0,
    STATIC_BUILTIN: 1 << 1,
    MANAGED_WEAKREF: 1 << 3,
    MANAGED_DICT: 1 << 4,
    SEQUENCE: 1 << 5,
    MAPPING: 1 << 6,
    DISALLOW_INSTANTIATION: 1 << 7,
    IMMUTABLETYPE: 1 << 8,
    HEAPTYPE: 1 << 9,
    BASETYPE: 1 << 10,
    HAVE_VECTORCALL: 1 << 11,
    READY: 1 << 12,
    READYING: 1 << 13,
    HAVE_GC: 1 << 14,
    METHOD_DESCRIPTOR: 1 << 17,
    VALID_VERSION_TAG:  1 << 19,
    IS_ABSTRACT: 1 << 20,
    MATCH_SELF: 1 << 22,
    LONG_SUBCLASS: 1 << 24,
    LIST_SUBCLASS: 1 << 25,
    TUPLE_SUBCLASS: 1 << 26,
    BYTES_SUBCLASS: 1 << 27,
    UNICODE_SUBCLASS: 1 << 28,
    DICT_SUBCLASS: 1 << 29,
    BASE_EXC_SUBCLASS: 1 << 30,
    TYPE_SUBCLASS: 1 << 31,
    HAVE_FINALIZE: 1 << 0,
    HAVE_VERSION_TAG: 1 << 18
}

// generic code for class constructor
$B.$class_constructor = function(class_name, dict, metaclass, resolved_bases,
        bases, extra_kwargs){
    var test = false // class_name == 'Meta'
    if(test){
        console.log('class constructor', class_name, 'dict', dict)
        console.log('metaclass', metaclass)
    }
    if(metaclass.tp_mro === undefined){
        console.log('no mro in metaclass', metaclass)
    }

    // bool is not a valid base
    for(var base of bases){
        if(base.__flags__ !== undefined &&
                 ! (base.__flags__ & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${base.__qualname__}' is not an acceptable base type`)
        }
    }

    delete extra_kwargs.metaclass

    // A class that overrides __eq__() and does not define __hash__()
    // will have its __hash__() implicitly set to None
    if(dict.__eq__ !== undefined &&
            dict.__hash__ === undefined){
        dict.__hash__ = _b_.None
    }

    // Check if class has __slots__
    var slots = dict.__slots__
    if(slots !== undefined){
        if(typeof slots == "string"){
            slots = [slots]
        }else{
            for(let item of $B.make_js_iterator(slots)){
                if(typeof item != 'string'){
                    $B.RAISE(_b_.TypeError, '__slots__ items must be ' +
                        `strings, not '${$B.class_name(item)}'`)
                }
            }
        }
        dict.__slots__ = slots
    }

    set_type_new(dict)

    // Apply method __new__ of metaclass to create the class object
    var meta_new = $B.search_slot(metaclass, 'tp_new')
    if(test){
        console.log('metaclass', metaclass, 'meta_new', meta_new)
    }
    try{
        var kls = $B.$call(meta_new, metaclass, class_name, resolved_bases, dict,
                       $B.dict_from_jsobj(extra_kwargs))
    }catch(err){
        console.log('error in meta_new', meta_new)
        throw err
    }
    kls.$subclasses = []
    kls.$is_class = true

    //$B.make_annotate_class(kls, annotate, frame)

    if($B.get_class(kls) === metaclass){
        // Initialize the class object by a call to metaclass __init__
        var meta_init = _b_.type.tp_getattro(metaclass, "__init__")
        try{
            $B.$call(meta_init, kls, class_name, resolved_bases, dict,
                      {$kw: [extra_kwargs]})
        }catch(err){
            if(class_name == 'SupportsInt'){
                console.log('err for', class_name)
                console.log(err)
                console.log(err.stack)
            }
            throw err
        }
    }

    // Set new class as subclass of its parents
    for(let i = 0; i < bases.length; i++){
        bases[i].$subclasses  = bases[i].$subclasses || []
        bases[i].$subclasses.push(kls)
    }

    return kls
}

function set_type_new(dict){
    // If dict has key __new__, make sure it's a staticmethod
    var new_func = $B.str_dict_get(dict, '__new__', $B.NULL)
    if(new_func !== $B.NULL){
        if($B.get_class(new_func) === $B.function){
            $B.str_dict_set(dict, '__new__', _b_.staticmethod.$factory(new_func))
        }
    }
}

function current_module(){
    if($B.frame_obj === null){
        return '<unknown>'
    }
    return $B.frame_obj.frame[2]
}

$B.get_metaclass = function(class_name, bases, kw_meta){
    // If a keyword argument "metaclass=kw_meta" is passed, kw_meta is set
    var metaclass
    if(kw_meta === undefined && bases.length == 0){
        return _b_.type
    }else if(kw_meta){
        if(! $B.$isinstance(kw_meta, _b_.type)){
            return kw_meta
        }
        metaclass = kw_meta
    }
    if(bases && bases.length > 0){
        if($B.get_class(bases[0]) === $B.JSObj){ //undefined && bases[0].ob_type === undefined){
            // Might inherit a Javascript constructor
            if(typeof bases[0] == "function"){
                if(bases.length != 1){
                    $B.RAISE(_b_.TypeError, "A Brython class " +
                        "can inherit at most 1 Javascript constructor")
                }
                $B.set_func_names(bases[0], current_module())
                return $B.JSMeta
            }else{
                $B.RAISE(_b_.TypeError, "Argument of " + class_name +
                    " is not a class (type '" + $B.class_name(bases[0]) +
                    "')")
            }
        }
        for(var base of bases){
            var mc = $B.get_class(base)
            if(metaclass === undefined){
                metaclass = mc
            }else if(mc === metaclass || _b_.issubclass(metaclass, mc)){
                // same metaclass or a subclass, do nothing
            }else if(_b_.issubclass(mc, metaclass)){
                metaclass = mc
            }else if(metaclass.tp_bases &&
                    metaclass.tp_bases.indexOf(mc) == -1){
                $B.RAISE(_b_.TypeError, "metaclass conflict: the " +
                    "metaclass of a derived class must be a (non-" +
                    "strict) subclass of the metaclasses of all its bases")
            }
        }
    }else{
        metaclass = metaclass || _b_.type
    }

    return metaclass
}

/* Determine the most derived metatype. */
function calculate_metaclass(metatype, bases){
    /* Determine the proper metatype to deal with this,
       and check for metatype conflicts while we're at it.
       Note that if some other metatype wins to contract,
       it's possible that its instances are not types. */
    var winner = metatype
    for(let tmp of bases){
        var tmptype = $B.get_class(tmp)
        if(_b_.issubclass(winner, tmptype)){
            continue;
        }
        if(_b_.issubclass(tmptype, winner)){
            winner = tmptype
            continue
        }
        $B.RAISE(_b_.TypeError,
            "metaclass conflict: the metaclass of a derived class must be " +
            "a (non-strict) subclass of the metaclasses of all its bases"
        )
    }
    return winner
}

function shape_differs(t1, t2){
    return (
        t1.tp_basicsize != t2.tp_basicsize ||
        t1.tp_itemsize != t2.tp_itemsize
    )
}

function solid_base(type){
    var base
    if(type.tp_base){
        base = solid_base(type.tp_base)
    }else{
        base = _b_.object
    }
    if(shape_differs(type, base)){
        return type
    }else{
        return base
    }
}

/* Calculate the best base amongst multiple base classes.
   This is the first one that's on the path to the "solid base". */
function best_base(bases){
    var n = bases.length
    var base,
        winner,
        candidate
    for(let base_i of bases) {
        if(! $B.is_type(base_i)){
            $B.RAISE(_b_.TypeError, "bases must be types")
        }

        if(base_i.__flags__ !== undefined &&
                 ! (base_i.__flags__ & TPFLAGS.BASETYPE)){
            $B.RAISE(_b_.TypeError,
                `type '${base.__name__}' is not an acceptable base type`)
        }
        candidate = solid_base(base_i);
        if(winner == undefined){
            winner = candidate
            base = base_i
        }else if(_b_.issubclass(winner, candidate)){
            // ignore
        }else if(_b_.issubclass(candidate, winner)){
            winner = candidate
            base = base_i
        }else {
            $B.RAISE(_b_.TypeError,
                "multiple bases have instance lay-out conflict")
        }
    }
    return base
}

function type_new_visit_slots(ctx){
    for(let name of ctx.slots){
        if(! _b_.str.tp_funcs.isidentifier(name)){
            return -1;
        }
        if(name == '__dict__'){
            if(! ctx.may_add_dict || ctx.add_dict != 0){
                $B.RAISE(_b_.TypeError,
                    "__dict__ slot disallowed: we already got one"
                )
            }
            ctx.add_dict++
        }
        if(name == '__weakref__'){
            if(! ctx.may_add_weak || ctx.add_weak != 0) {
                $B.RAISE(_b_.TypeError,
                    "__weakref__ slot disallowed: we already got one"
                )
            }
            ctx.add_weak++;
        }
    }
}

function type_new_slots_impl(ctx, dict){
    /* Are slots allowed? */
    if(ctx.nslot > 0 && ctx.base.tp_itemsize != 0){
        $B.RAISE(_b_.TypeError,
            "nonempty __slots__ not supported " +
            `for subtype of '${ctx.base.tp_name}'"`
        )
    }
    type_new_visit_slots(ctx)

    var new_slots = type_new_copy_slots(ctx, dict)

    ctx.slots = new_slots
    ctx.nslot = new_slots.length

    /* Secondary bases may provide weakrefs or dict */
    type_new_slots_bases(ctx)
}


function type_new_slots(ctx, dict){
    // Check for a __slots__ sequence variable in dict, and count it
    ctx.add_dict = 0
    ctx.add_weak = 0
    console.log('type_new_slots, ctx', ctx, '\n    base', ctx.base)
    ctx.may_add_dict = (ctx.base.tp_dictoffset == 0)
    ctx.may_add_weak = (ctx.base.tp_weaklistoffset == 0
                         && ctx.base.tp_itemsize == 0)

    if(! ctx.hasOwnProperty('slots')){
        if(ctx.may_add_dict){
            ctx.add_dict++
        }
        if (ctx.may_add_weak) {
            ctx.add_weak++
        }
    }else{
        /* Have slots */
        console.log('has slots', ctx)
        type_new_slots_impl(ctx, dict)
    }
}

function type_new_get_slots(ctx, dict){
    var slots = $B.str_dict_get(dict, '__slots__', $B.NULL)
    if(slots === $B.NULL){
        ctx.nslot = 0
        return
    }

    // Make it into a tuple
    var new_slots;
    if($B.exact_type(slots, _b_.str)){
        new_slots = $B.fast_tuple([slots])
    }else{
        new_slots = $B.fast_tuple(slots)
    }
    ctx.slots = new_slots
    ctx.nslot = new_slots.length
}

function type_new_alloc(ctx){
    // Allocate the type object
    var type = {
        ob_type: ctx.metatype,
        tp_name: ctx.name,
        tp_base: ctx.base,
        tp_bases: ctx.bases
    }
    type.flags = TPFLAGS.DEFAULT | TPFLAGS.HEAPTYPE |
                   TPFLAGS.BASETYPE | TPFLAGS.HAVE_GC
    return type
}

/* Set __module__ in the dict */
function type_new_set_module(dict){
    var r = $B.str_dict_get(dict, '__module__', $B.NULL)
    if(r !== $B.NULL){
        return
    }

    var module = $B.frame_obj.frame[2]
    $B.str_dict_set(dict, '__module__', module)
}

function type_new_set_doc(type, dict){
    var doc = $B.str_dict_get(dict, '__doc__', $B.NULL)
    if(doc === $B.NULL || ! $B.exact_type(doc, _b_.str)){
        // ignore non-string __doc__
        return
    }
    type.tp_doc = doc
}

function type_new_staticmethod(dict, attr){
    var func = $B.str_dict_get(dict, attr, $B.NULL)
    if(func === $B.NULL || ! $B.exact_type(func, $B.function)){
        return
    }
    var static_func = _b_.staticmethod.$factory(func)
    $B.str_dict_set(dict, attr, static_func)
}

function type_new_classmethod(dict, attr){
    var func = $B.str_dict_get(dict, attr, $B.NULL)
    if(func === $B.NULL || ! $B.exact_type(func, $B.function)){
        return
    }
    var method = _b_.classmethod.$factory(func)
    $B.str_dict_set(dict, attr, method)
}

function type_new_set_slots(ctx, type){
    if(type.tp_weaklistoffset && type.tp_dictoffset){
        type.tp_getset = subtype_getsets_full;
    }else if(type.tp_weaklistoffset && ! typ.tp_dictoffset){
        type.tp_getset = subtype_getsets_weakref_only
    }else if(! type.tp_weaklistoffset && type.tp_dictoffset) {
        type.tp_getset = subtype_getsets_dict_only
    }else{
        type.tp_getset = []
    }

    /* Special case some slots */
    if (type.tp_dictoffset != 0 || ctx.nslot > 0) {
        var base = ctx.base;
        if(! base.hasOwnProperty('tp_getattr') &&
                ! base.hasOwnProperty('tp_getattro')){
            type.tp_getattro = _b_.object.tp_getattro
        }
        if(! base.hasOwnProperty('tp_setattr') &&
                ! base.hasOwnProperty('tp_setattro')){
            type.tp_setattro = _b_.object.tp_setattro
        }
    }
}

/* store type in class' cell if one is supplied */
function type_new_set_classcell(type, dict){
    var cell = $B.str_dict_get(dict, '__classcell__', $B.NULL)
    if(cell === $B.NULL){
        return
    }

    /* At least one method requires a reference to its defining class */
    if (! $B.exact_type(cell, $B.cell)){
        $B.RAISE(_b_.TypeError,
            `__classcell__ must be a nonlocal cell, not ${$B.class_name(cell)}`
        )
    }

    cell.ob_ref = type
    $B.str_dict_del(dict, '__classcell__')
}

function type_new_set_classdictcell(dict){
    var cell = $B.str_dict_get(dict, '__classdictcell__', $B.NULL)
    if(cell === $B.NULL){
        return 0
    }
    /* At least one method requires a reference to the dict of its defining class */
    if(! $B.exact_type(cell, $B.cell)){
        $B.RAISE(_b_.TypeError,
            `__classdictcell__ must be a nonlocal cell, not ${$B.class_name(cell)}`)
    }

    cell.ob_ref = dict
    $B.str_dict_del(dict, '__classdictcell__')
}

function type_new_set_attrs(ctx, type){
    console.log('type', type, 'ctx', ctx)
    type.tp_name = ctx.name

    var dict = type.dict
    type_new_set_module(dict)
    type_new_set_doc(type, dict)

    /* Special-case __new__: if it's a plain function,
       make it a static function */
    type_new_staticmethod(dict, '__new__')

    /* Special-case __init_subclass__ and __class_getitem__:
       if they are plain functions, make them classmethods */
    type_new_classmethod(dict, '__init_subclass__')
    type_new_classmethod(dict, '__class_getitem__')

    // type_new_descriptors(ctx, type)

    type_new_set_slots(ctx, type)

    type_new_set_classcell(type, dict)
    type_new_set_classdictcell(dict)
}

function type_new_init(ctx){
    var dict = _b_.dict.tp_funcs.copy(ctx.orig_dict)
    console.log('dict', dict)
    type_new_get_slots(ctx, dict)
    type_new_slots(ctx, dict)
    let type = type_new_alloc(ctx)
    type.dict = dict
    return type
}

function type_new_get_bases(ctx, type){
    var nbases = ctx.bases.length
    if(nbases == 0){
        // Adjust for empty tuple bases
        ctx.base = _b_.object
        ctx.bases = $B.fast_tuple([_b_.object])
        return 0
    }
    for(let base of ctx.bases){
        if($B.is_type(base)){
            continue
        }
        var rc = $B.search_in_mro(base, '__mro_entries__', $B.NULL);
        if(rc === $B.NULL){
            return -1
        }
        if(rc){
            $B.RAISE(_b_.TypeError,
                "type() doesn't support MRO entry resolution; " +
                "use types.new_class()"
            )
        }
    }

    // Search the bases for the proper metatype to deal with this
    var winner = calculate_metaclass(ctx.metatype, ctx.bases)

    if(winner !== ctx.metatype){
        var winner_new_func = $B.search_own_slot(winner, 'tp_new', $B.NULL)
        var type_new_func = $B.search_own_slot(type, 'tp_new', $B.NULL)
        if(winner_new_func !== type_new_func){
            /* Pass it to the winner */
            type = winner_new_func(winner, ...ctx.args, $B.dict2kwarg(ctx.kwds))
            return {type}
        }
        ctx.metatype = winner
    }

    /* Calculate best base, and check that all bases are type objects */
    ctx.base = best_base(ctx.bases)
    return 0
}

function type_set_flags(tp, flags){
    tp.tp_flags = flags
}

function type_add_flags(tp, flag){
    type_set_flags(tp, tp.tp_flags | flag)
}

function type_clear_flags(tp, flag){
    type_set_flags(tp, tp.tp_flags & ~flag)
}

function start_readying(type){
    if(type.tp_flags & TPFLAGS.STATIC_BUILTIN) {
        return;
    }
    type_add_flags(type, TPFLAGS.READYING)
}

function type_ready_pre_checks(type){
    if(! type.hasOwnProperty('tp_name')){
        $B.RAISE(_b_.SystemError,
                     "Type does not define the tp_name field."
        )
    }
}

function _PyType_IsReady(type){
    return type.hasOwnProperty('dict')
}

function type_ready_set_base(type){
    /* Initialize tp_base (defaults to BaseObject unless that's us) */
    var base = type.tp_base
    if(base === undefined && type != _b_.object){
        base = _b_.object
        type.tp_base = base
    }
    /* Initialize the base class */
    if(base && ! _PyType_IsReady(base)){
        PyType_Ready(base)
    }
}

function type_ready_set_type(type){
    var base = type.tp_base
    if($B.is_type(type) && base) {
        type.ob_type = base
    }
}

function type_ready_set_bases(type, initial){
    if(type.tp_flags & TPFLAGS.STATIC_BUILTIN) {
        if(! initial){
            return
        }
    }
    if(! type.hasOwnProperty('tp_bases')){
        var base = type.tp_base;
        if(! type.hasOwnProperty('tp_base')){
            bases = $B.fast_tuple()
        }else{
            bases = $B.fast_tuple([base])
        }
        type.tp_bases = bases
    }
}

function type_ready_mro(type, initial){
    if(! type.hasOwnProperty('tp_mro')){
        type.tp_mro = $B.make_mro(type)
    }
}

function type_ready_set_new(type, initial){
    var test = type.tp_name == 'Meta'
    var base = type.tp_base
    if(test){
        console.log('type_ready_set_new', type.tp_name, 'base', type.tp_base,
            '\n    currently tp_new', type.tp_new)
    }
    var local_new = $B.search_own_slot(type, 'tp_new', $B.NULL)
    if(test){
        console.log('local_new', local_new)
    }
    if(local_new !== $B.NULL){
        return
    }
    if(local_new === $B.NULL
        && base === _b_.object
        && ! (type.tp_flags & TPFLAGS.HEAPTYPE)){
        if(initial){
            type_add_flags(type, TPFLAGS.DISALLOW_INSTANTIATION);
        }
    }
    if(! (type.tp_flags & TPFLAGS.DISALLOW_INSTANTIATION)){
        if(type.tp_new) {
            if(initial || base === undefined || type.tp_new != base.tp_new) {
                // If "__new__" key does not exists in the type dictionary,
                // set it to tp_new_wrapper().
                add_tp_new_wrapper(type)
            }
        }else{
            if (initial) {
                // tp_new is NULL: inherit tp_new from base
                type.tp_new = base.tp_new
            }
        }
    }else{
        // Py_TPFLAGS_DISALLOW_INSTANTIATION sets tp_new to NULL
        if(initial){
            delete type.tp_new
        }
    }
    if(test){
        console.log('end of type_ready_set_new', type.tp_name, type.tp_new)
    }
}

function check_num_args(ob, n){
    if(! $B.exact_type(ob, _b_.tuple)){
        console.log('check num args', ob, n)
        console.log(Error('trace').stack)
        $B.RAISE(_b_.SystemError,
            "PyArg_UnpackTuple() argument list is not a tuple");
    }
    if(n != ob.length){
        $B.RAISE(_b_.TypeError,
            `expected ${n} argument{n == 1 ? "" : "s"}, got ${ob.length}`
        )
    }
}

var NULL = $B.NULL

function TPSLOT(name, slot, FUNCTION, wrapper){
    return {name, slot, FUNCTION, wrapper, name_strobj: name}
}
function FLSLOT(name, slot, FUNCTION, wrapper, flags){
    return {name, slot, FUNCTION, wrapper, flags, name_strobj: Nname}
}
function ETSLOT(name, slot, FUNCTION, wrapper){
    return {name, slot, FUNCTION, wrapper, name_strobj:name}
}
function BUFSLOT(NAME, SLOT, FUNCTION, WRAPPER){
    return ETSLOT(NAME, `as_buffer.${SLOT}`, FUNCTION, WRAPPER)
}
function AMSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_async.${SLOT}`, FUNCTION, WRAPPER, DOC)
}
function SQSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_sequence.${SLOT}`, FUNCTION, WRAPPER, DOC)
}
function MPSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_mapping.${SLOT}`, FUNCTION, WRAPPER, DOC)
}
function NBSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, WRAPPER, DOC)
}
function UNSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, WRAPPER)
}
function IBSLOT(NAME, SLOT, FUNCTION, WRAPPER, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, WRAPPER)
}
function BINSLOT(NAME, SLOT, FUNCTION, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, wrap_binaryfunc_l)
}
function RBINSLOT(NAME, SLOT, FUNCTION, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, wrap_binaryfunc_r)
}
function BINSLOTNOTINFIX(NAME, SLOT, FUNCTION, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, wrap_binaryfunc_l)
}
function RBINSLOTNOTINFIX(NAME, SLOT, FUNCTION, DOC){
    return ETSLOT(NAME, `as_number.${SLOT}`, FUNCTION, wrap_binaryfunc_r)
}

function call_method(self, attr, ...args){
    /*
    var unbound = lookup_method(self, attr);
    if (unbound >= 0) {
        PyObject *meth = PyStackRef_AsPyObjectBorrow(cref.ref);
        if (unbound) {
            res = _PyObject_Call_Prepend(tstate, meth, self, args, kwds);
        }
        else {
            res = _PyObject_Call(tstate, meth, args, kwds);
        }
    }
    return res;
    */
    return $B.$call($B.$getattr(self, attr), ...args)
}

function wrap_call(self, args, wrapped, kwds){
    return wrapped(self, args, kwds);
}

function slot_tp_call(self, ...args){
    return call_method(self, '__call__', ...args)
}

function slot_tp_hash(self){
    var hash_method = $B.$getattr(self, '__hash__', $B.NULL)
    if(hash_method === $B.NULL || hash_method === _b_.None){
        return PyObject_HashNotImplemented(self);
    }
    if(! $B.exact_type(res, _b_.int)){
        $B.RAISE(_b_.TypeError,
            "__hash__ method should return an integer")
    }
    if(h == -1){
        h = -2;
    }
    return h
}

function slot_tp_repr(self){
    var repr_method = $B.$getattr(self, '__repr__', $B.NULL)
    if(res !== $B.NULL){
        return repr_method()
    }
    return `<${$B.class_name(self)} object>`
}

function wrap_unaryfunc(self, args, wrapped){
    console.log('wrap unaryfunc', self, args, wrapped)
    check_num_args(args, 0)
    return wrapped(self)
}

function wrap_hashfunc(self, args, wrapped){
    check_num_args(args, 0)
    return wrapped(self)
}

var slotdefs = [
    TPSLOT('__getattribute__', 'tp_getattr', NULL, NULL),
    TPSLOT('__getattr__', 'tp_getattr', NULL, NULL),
    TPSLOT('__setattr__', 'tp_setattr', NULL, NULL),
    TPSLOT('__delattr__', 'tp_setattr', NULL, NULL),
    TPSLOT('__repr__', 'tp_repr', slot_tp_repr, wrap_unaryfunc),
    TPSLOT('__hash__', 'tp_hash', slot_tp_hash, wrap_hashfunc),
    /*
    FLSLOT('__call__', 'tp_call', slot_tp_call, wrap_call, PyWrapperFlag_KEYWORDS),
    TPSLOT('__str__', 'tp_str', slot_tp_str, wrap_unaryfunc),
    TPSLOT('__getattribute__', 'tp_getattro', _Py_slot_tp_getattr_hook, wrap_binaryfunc),
    TPSLOT('__getattr__', 'tp_getattro', _Py_slot_tp_getattr_hook, NULL),
    TPSLOT('__setattr__', 'tp_setattro', slot_tp_setattro, wrap_setattr),
    TPSLOT('__delattr__', 'tp_setattro', slot_tp_setattro, wrap_delattr),
    TPSLOT('__lt__', 'tp_richcompare', slot_tp_richcompare, richcmp_lt),
    TPSLOT('__le__', 'tp_richcompare', slot_tp_richcompare, richcmp_le),
    TPSLOT('__eq__', 'tp_richcompare', slot_tp_richcompare, richcmp_eq),
    TPSLOT('__ne__', 'tp_richcompare', slot_tp_richcompare, richcmp_ne),
    TPSLOT('__gt__', 'tp_richcompare', slot_tp_richcompare, richcmp_gt),
    TPSLOT('__ge__', 'tp_richcompare', slot_tp_richcompare, richcmp_ge),
    TPSLOT('__iter__', 'tp_iter', slot_tp_iter, wrap_unaryfunc),
    TPSLOT('__next__', 'tp_iternext', slot_tp_iternext, wrap_next),
    TPSLOT('__get__', 'tp_descr_get', slot_tp_descr_get, wrap_descr_get),
    TPSLOT('__set__', 'tp_descr_set', slot_tp_descr_set, wrap_descr_set),
    TPSLOT('__delete__', 'tp_descr_set', slot_tp_descr_set, wrap_descr_delete),
    FLSLOT('__init__', 'tp_init', slot_tp_init, wrap_init, PyWrapperFlag_KEYWORDS),
    TPSLOT('__new__', 'tp_new', slot_tp_new, NULL),
    TPSLOT('__del__', 'tp_finalize', slot_tp_finalize, wrap_del),
    BUFSLOT('__buffer__', 'bf_getbuffer', slot_bf_getbuffer, wrap_buffer),
    BUFSLOT('__release_buffer__', 'bf_releasebuffer', slot_bf_releasebuffer, wrap_releasebuffer),
    AMSLOT('__await__', 'am_await', slot_am_await, wrap_unaryfunc),
    AMSLOT('__aiter__', 'am_aiter', slot_am_aiter, wrap_unaryfunc),
    AMSLOT('__anext__', 'am_anext', slot_am_anext, wrap_unaryfunc),
    BINSLOT('__add__', 'nb_add', slot_nb_add),
    RBINSLOT('__radd__', 'nb_add', slot_nb_add),
    BINSLOT('__sub__', 'nb_subtract', slot_nb_subtract),
    RBINSLOT('__rsub__', 'nb_subtract', slot_nb_subtract),
    BINSLOT('__mul__', 'nb_multiply', slot_nb_multiply),
    RBINSLOT('__rmul__', 'nb_multiply', slot_nb_multiply),
    BINSLOT('__mod__', 'nb_remainder', slot_nb_remainder),
    RBINSLOT('__rmod__', 'nb_remainder', slot_nb_remainder),
    BINSLOTNOTINFIX('__divmod__', 'nb_divmod', slot_nb_divmod),
    RBINSLOTNOTINFIX('__rdivmod__', 'nb_divmod', slot_nb_divmod),
    NBSLOT('__pow__', 'nb_power', slot_nb_power, wrap_ternaryfunc),
    NBSLOT('__rpow__', 'nb_power', slot_nb_power, wrap_ternaryfunc_r),
    UNSLOT('__neg__', 'nb_negative', slot_nb_negative, wrap_unaryfunc),
    UNSLOT('__pos__', 'nb_positive', slot_nb_positive, wrap_unaryfunc),
    UNSLOT('__abs__', 'nb_absolute', slot_nb_absolute, wrap_unaryfunc),
    UNSLOT('__bool__', 'nb_bool', slot_nb_bool, wrap_inquirypred),
    UNSLOT('__invert__', 'nb_invert', slot_nb_invert, wrap_unaryfunc),
    BINSLOT('__lshift__', 'nb_lshift', slot_nb_lshift),
    RBINSLOT('__rlshift__', 'nb_lshift', slot_nb_lshift),
    BINSLOT('__rshift__', 'nb_rshift', slot_nb_rshift),
    RBINSLOT('__rrshift__', 'nb_rshift', slot_nb_rshift),
    BINSLOT('__and__', 'nb_and', slot_nb_and),
    RBINSLOT('__rand__', 'nb_and', slot_nb_and),
    BINSLOT('__xor__', 'nb_xor', slot_nb_xor),
    RBINSLOT('__rxor__', 'nb_xor', slot_nb_xor),
    BINSLOT('__or__', 'nb_or', slot_nb_or),
    RBINSLOT('__ror__', 'nb_or', slot_nb_or),
    UNSLOT('__int__', 'nb_int', slot_nb_int, wrap_unaryfunc),
    UNSLOT('__float__', 'nb_float', slot_nb_float, wrap_unaryfunc),
    IBSLOT('__iadd__', 'nb_inplace_add', slot_nb_inplace_add, wrap_binaryfunc),
    IBSLOT('__isub__', 'nb_inplace_subtract', slot_nb_inplace_subtract, wrap_binaryfunc),
    IBSLOT('__imul__', 'nb_inplace_multiply', slot_nb_inplace_multiply, wrap_binaryfunc),
    IBSLOT('__imod__', 'nb_inplace_remainder', slot_nb_inplace_remainder, wrap_binaryfunc),
    IBSLOT('__ipow__', 'nb_inplace_power', slot_nb_inplace_power, wrap_ternaryfunc),
    IBSLOT('__ilshift__', 'nb_inplace_lshift', slot_nb_inplace_lshift, wrap_binaryfunc),
    IBSLOT('__irshift__', 'nb_inplace_rshift', slot_nb_inplace_rshift, wrap_binaryfunc),
    IBSLOT('__iand__', 'nb_inplace_and', slot_nb_inplace_and, wrap_binaryfunc),
    IBSLOT('__ixor__', 'nb_inplace_xor', slot_nb_inplace_xor, wrap_binaryfunc),
    IBSLOT('__ior__', 'nb_inplace_or', slot_nb_inplace_or, wrap_binaryfunc),
    BINSLOT('__floordiv__', 'nb_floor_divide', slot_nb_floor_divide),
    RBINSLOT('__rfloordiv__', 'nb_floor_divide', slot_nb_floor_divide),
    BINSLOT('__truediv__', 'nb_true_divide', slot_nb_true_divide),
    RBINSLOT('__rtruediv__', 'nb_true_divide', slot_nb_true_divide),
    IBSLOT('__ifloordiv__', 'nb_inplace_floor_divide', slot_nb_inplace_floor_divide, wrap_binaryfunc),
    IBSLOT('__itruediv__', 'nb_inplace_true_divide', slot_nb_inplace_true_divide, wrap_binaryfunc),
    NBSLOT('__index__', 'nb_index', slot_nb_index, wrap_unaryfunc),
    BINSLOT('__matmul__', 'nb_matrix_multiply', slot_nb_matrix_multiply),
    RBINSLOT('__rmatmul__', 'nb_matrix_multiply', slot_nb_matrix_multiply),
    IBSLOT('__imatmul__', 'nb_inplace_matrix_multiply', slot_nb_inplace_matrix_multiply, wrap_binaryfunc),
    MPSLOT('__len__', 'mp_length', slot_mp_length, wrap_lenfunc),
    MPSLOT('__getitem__', 'mp_subscript', slot_mp_subscript, wrap_binaryfunc),
    MPSLOT('__setitem__', 'mp_ass_subscript', slot_mp_ass_subscript, wrap_objobjargproc),
    MPSLOT('__delitem__', 'mp_ass_subscript', slot_mp_ass_subscript, wrap_delitem),
    SQSLOT('__len__', 'sq_length', slot_sq_length, wrap_lenfunc),
    SQSLOT('__add__', 'sq_concat', NULL, wrap_binaryfunc),
    SQSLOT('__mul__', 'sq_repeat', NULL, wrap_indexargfunc),
    SQSLOT('__rmul__', 'sq_repeat', NULL, wrap_indexargfunc),
    SQSLOT('__getitem__', 'sq_item', slot_sq_item, wrap_sq_item),
    SQSLOT('__setitem__', 'sq_ass_item', slot_sq_ass_item, wrap_sq_setitem),
    SQSLOT('__delitem__', 'sq_ass_item', slot_sq_ass_item, wrap_sq_delitem),
    SQSLOT('__contains__', 'sq_contains', slot_sq_contains, wrap_objobjproc),
    SQSLOT('__iadd__', 'sq_inplace_concat', NULL, wrap_binaryfunc),
    SQSLOT('__imul__', 'sq_inplace_repeat', NULL, wrap_indexargfunc)
    */
]

function slot_inherited(type, slotdef, slot){
    var slot_base = type.tp_base[slotdef.name]
    if(slot_base === undefined || slot != slot_base){
        return 0
    }

    /* Some slots are inherited in pairs. */
    if(slot === type.tp_hash){
        return type.tp_richcompare === type.tp_base.tp_richcompare
    }else if(slot === type.tp_richcompare){
        return type.tp_hash === type.tp_base.tp_hash
    }
    return 1;
}

function add_operators(type){
    var dict = type.dict

    for(var p of slotdefs){
        if (p.wrapper == NULL){
            continue
        }
        var ptr = p.slot
        /* Also ignore when the type slot has been inherited. */
        if (type.tp_flags & TPFLAGS.STATIC_BUILTIN
            && type.tp_base != NULL
            && slot_inherited(type, p, ptr)){
            continue
        }
        var r = $B.str_dict_get(dict, p.name_strobj, $B.NULL)
        if(r !== $B.NULL){
            continue
        }
        if(false){ // ptr == PyObject_HashNotImplemented) {
            /* Classes may prevent the inheritance of the tp_hash
               slot by storing PyObject_HashNotImplemented in it. Make it
               visible as a None value for the __hash__ attribute. */
            $B.str_dict_set(dict, p.name_strobj, _b_.None)
        }else{
            console.log('create wrapper descr', type, p)
            var descr = $B.wrapper_descriptor.$factory(type, p.name, p.wrapper)
            if(descr == NULL){
                return -1;
            }
            $B.str_dict_set(dict, p.name_strobj, descr)
        }
    }
}

function type_ready_fill_dict(type){
    /* Add type-specific descriptors to tp_dict */
    //add_operators(type)
    /*
    type_add_methods(type)
    type_add_members(type)
    type_add_getset(type)
    type_dict_set_doc(type)
    */
}

function type_ready(type, initial){
    start_readying(type)

    type_ready_pre_checks(type)

    if(! type.hasOwnProperty('dict')){
        type.dict = $B.empty_dict()
    }
    type_ready_set_base(type)
    type_ready_set_type(type)
    type_ready_set_bases(type, initial)
    type_ready_mro(type, initial)
    type_ready_set_new(type, initial)
    type_ready_fill_dict(type)

    console.log('end of type_ready', type)

    return // XXX
    if(initial){
        type_ready_inherit(type)
        type_ready_preheader(type)
    }
    type_ready_set_hash(type)
    type_ready_add_subclasses(type)
    if(initial){
        type_ready_managed_dict(type)
        type_ready_post_checks(type)
    }
    /* All done -- set the ready flag */
    if(initial){
        type_add_flags(type, TPFLAGS.READY)
    }else{
        assert(type.tp_flags & TPFLAGS.READY)
    }
    stop_readying(type)
}

function PyType_Ready(dict){
    console.log('PyType_Ready')
    if(! (type.tp_flags & TPFLAGS.READY)){
        var res = type_ready(type, 1)
    }
}

function fixup_slot_dispatchers(type){
    console.log('fixup slot dispatchers')
    /*
    for(let p = slotdefs; p->name; ) {
        p = update_one_slot(type, p);
    }
    */
}

function type_new_set_names(type){
    var dict = type.dict
    var names_to_set = _b_.dict.tp_funcs.copy(dict)

    for(var item of _b_.dict.$iter_items(names_to_set)){
        var key = item.key,
            value = item.value
        var set_name = $B.$getattr(value, '__set_name__', $B.NULL)
        if(set_name === $B.NULL){
            continue
        }
        try{
            $B.$call(set_name, type, key)
        }catch(err){
            $B.RAISE(_b_.Exception,
                `Error calling __set_name__ on '${$B.class_name(value)}' ` +
                `instance ${key} in '${type.tp_name}'`
            )
        }
    }
}

function type_new_impl(ctx){
    var type = type_new_init(ctx)
    type_new_set_attrs(ctx, type)
    /* Initialize the rest */
    PyType_Ready(type)
    // Put the proper slots in place
    fixup_slot_dispatchers(type)

    if(! $B.hasOnlyStringKeys(type.dict)){
        $B.warn(_b_.RuntimeWarning,
            `non-string key in the __dict__ of class ${type.tp_name}`)
    }
    type_new_set_names(type)
    type_new_init_subclass(type, ctx.kwds)
    return type

}

function type_new_init_subclass(type, kwds){
    console.log('type init subclass', type, kwds)
    var args = [type, type]
    var _super = $B.$call(_b_.super, ...args)

    var func = $B.$getattr(_super, '__init_subclass__')

    var result = $B.$call(func, {$kw: [_b_.dict.$to_obj(kwds)]})
}

function set_attr_if_absent(dict, attr, value){
    try{
        $B.$getitem(dict, attr)
    }catch(err){
        $B.$setitem(dict, attr, value)
    }
}

$B.make_class_namespace = function(metaclass, class_name, qualname,
                                   orig_bases, bases){
    // Use __prepare__ (PEP 3115)
    var prepare = $B.$getattr(metaclass, "__prepare__", $B.NULL)
    if(prepare === $B.NULL){
        $B.RAISE(_b_.TypeError, 'metaclass has no __prepare__')
    }
    var class_dict = $B.$call(prepare, class_name, bases) // dict or dict-like
    if(! $B.$isinstance(class_dict, _b_.dict)){
        $B.RAISE(_b_.TypeError,
            `${$B.get_name(metaclass)}.__prepare__() must return a mapping, ` +
            `not ${$B.class_name(class_dict)}`)
    }
    if(orig_bases !== bases){
        class_dict.__orig_bases__ = orig_bases
    }
    if(! class_dict.$all_str){
        $B.warn(_b_.RuntimeWarning,
            `non-string key in the __dict__ of class ${class_name}`)
    }
    return class_dict
}


$B.resolve_mro_entries = function(bases){
    // Replace non-class bases that have a __mro_entries__ (PEP 560)
    var new_bases = [],
        has_mro_entries = false
    for(var base of bases){
        if(! $B.$isinstance(base, _b_.type)){
            var mro_entries = $B.$getattr(base, "__mro_entries__",
                _b_.None)
            if(mro_entries !== _b_.None){
                has_mro_entries = true
                var entries = _b_.list.$factory(mro_entries(bases))
                new_bases = new_bases.concat(entries)
            }else{
                new_bases.push(base)
            }
        }else{
            new_bases.push(base)
        }
    }
    return has_mro_entries ? new_bases : bases
}

function object_get_dict(obj){
    if($B.is_type(obj)){
        return $B.mappingproxy.tp_new($B.mappingproxy, obj.dict)
    }
    return obj.dict
}

function object_set_dict(obj, value){
    obj.dict = value
}

var type = _b_.type // defined in py_object.js

type.$factory = function(){
    var missing = {},
        $ = $B.args('type', 3, {kls: null, bases: null, cl_dict: null},
            ['kls', 'bases', 'cl_dict'], arguments,
            {bases: missing, cl_dict: missing}, null, 'kw'),
        kls = $.kls,
        bases = $.bases,
        cl_dict = $.cl_dict,
        kw = $.kw

    var kwarg = {}
    for(var item of _b_.dict.$iter_items(kw)){
        kwarg[item.key] = item.value
    }
    var kwargs = {$kw: [kwarg]}
    if(cl_dict === missing){
        if(bases !== missing){
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
        var res = $B.get_class(kls)
        if(res === $B.long_int){
            return _b_.int
        }
        return res
    }else{
        var module = $B.frame_obj.frame[2],
            resolved_bases = $B.resolve_mro_entries(bases),
            metaclass = $B.get_metaclass(kls, module, resolved_bases)
        return type.__call__(metaclass, kls, resolved_bases, cl_dict, kwargs)
    }
}

//classmethod() (built in class)
var classmethod = _b_.classmethod

classmethod.$factory = function(func){
    $B.check_nb_args_no_kw('classmethod', 1, arguments)
    return {
        ob_type: classmethod,
        func
    }
}



/* classmethod start */
_b_.classmethod.tp_repr = function(self){
    return `<classmethod(${_b_.repr(self.func)})>`
}

_b_.classmethod.tp_descr_get = function(){
    // adapted from
    // https://docs.python.org/3/howto/descriptor.html#class-methods
    var $ = $B.args('classmethod', 3, {self: null, obj: null, cls: null},
                    ['self', 'obj', 'cls'], arguments, {cls: _b_.None},
                    null, null),
        self = $.self,
        obj = $.obj,
        cls = $.cls
    if(cls === _b_.None || cls === undefined){
        cls = $B.get_class(obj)
    }
    var func_class = $B.get_class(self.func),
        candidates = [func_class].concat($B.get_mro(func_class))
    for(var candidate of candidates){
        if(candidate === $B.function){
            break
        }
        if(candidate.__get__){
            return candidate.__get__(self.func, cls, cls)
        }
    }
    try{
        return $B.method.$factory(self.func, cls)
    }catch(err){
        console.log('error, self', self, self.func, 'cls', cls)
        throw err
    }
}

_b_.classmethod.tp_init = function(self, func){
    self.func = func
}

_b_.classmethod.tp_new = function(cls){
    return {
        ob_type: cls,
        func : _b_.None
    }
}

var classmethod_funcs = _b_.classmethod.tp_funcs = {}

classmethod_funcs.__annotate___get = function(self){

}

classmethod_funcs.__annotate___set = function(self){

}

classmethod_funcs.__annotations___get = function(self){

}

classmethod_funcs.__annotations___set = function(self){

}

classmethod_funcs.__class_getitem__ = $B.$class_getitem

classmethod_funcs.__func__ = function(self){
    return self.func
}

classmethod_funcs.__isabstractmethod___get = function(self){

}

classmethod_funcs.__isabstractmethod___set = function(self){

}

classmethod_funcs.__wrapped__ = function(self){
    return self.func
}

_b_.classmethod.classmethods = ["__class_getitem__"]

_b_.classmethod.tp_members = ["__func__", "__wrapped__"]

_b_.classmethod.tp_getset = ["__isabstractmethod__", "__annotations__", "__annotate__"]

/* classmethod end */

$B.set_func_names(classmethod, "builtins")


// staticmethod() built in function
var staticmethod = _b_.staticmethod
staticmethod.$factory = function(func){
    return {
        ob_type: staticmethod,
        func
    }
}

/* staticmethod start */
_b_.staticmethod.tp_repr = function(self){
    return `<staticmethod(${_b_.repr(self.func)})>`
}

_b_.staticmethod.tp_call = function(self, ...args){
    return self.func(...args)
}

_b_.staticmethod.tp_descr_get = function(self){
    return self.func
}

_b_.staticmethod.tp_init = function(self, func){
    self.func = func
}

_b_.staticmethod.tp_new = function(self){
    return {
        ob_type: _b_.staticmethod,
        func: _b_.None
    }
}

var staticmethod_funcs = _b_.staticmethod.tp_funcs = {}

staticmethod_funcs.__annotate___get = function(self){

}

staticmethod_funcs.__annotate___set = function(self){

}

staticmethod_funcs.__annotations___get = function(self){

}

staticmethod_funcs.__annotations___set = function(self){

}

staticmethod_funcs.__class_getitem__ = function(self){

}

staticmethod_funcs.__dict___get = function(self){

}

staticmethod_funcs.__dict___set = function(self){

}

staticmethod_funcs.__func__ = function(self){
    return self.func
}

staticmethod_funcs.__isabstractmethod___get = function(self){

}

staticmethod_funcs.__isabstractmethod___set = function(self){

}

staticmethod_funcs.__wrapped__ = function(self){
    return self.func
}

_b_.staticmethod.classmethods = ["__class_getitem__"]

_b_.staticmethod.tp_members = ["__func__", "__wrapped__"]

_b_.staticmethod.tp_getset = ["__isabstractmethod__", "__dict__", "__annotations__", "__annotate__"]

/* staticmethod end */

$B.set_func_names(staticmethod, "builtins")

type.$call = function(klass, new_func, init_func){
    // return factory function for classes with __init__ method
    return function(){
        // create an instance with __new__
        var instance = new_func.bind(null, klass).apply(null, arguments)
        if($B.$isinstance(instance, klass)){
            // call __init__ with the same parameters
            init_func.bind(null, instance).apply(null, arguments)
        }
        return instance
    }
}

type.$call_no_new_init = function(klass, init_func){
    // return factory function for classes without explicit __new__ method
    // and explicit __init__
    return function(){
        var instance = _b_.object.$no_new_init(klass)
        // call __init__ with the same parameters
        init_func(instance, ...arguments)
        return instance
    }
}

type.$call_no_init = function(klass, new_func){
    // return factory function for classes without __init__
    return new_func.bind(null, klass)
}



$B.$class_getitem = function(kls, origin, args){
    return $B.GenericAlias.$factory(kls, origin, args)
}

$B.merge_class_dict = function(dict, klass){
    var classdict,
        bases

    /* Merge in the type's dict (if any). */
    classdict = $B.$getattr(klass, '__dict__', null)
    if(classdict !== null){
        $B.$call($B.type_getattribute(_b_.dict, 'update'), dict, classdict)
    }else{
        return
    }
    /* Recursively merge in the base types' (if any) dicts. */
    bases = klass.tp_bases
    if(bases === undefined){
        return
    }
    for(var base of bases){
        $B.merge_class_dict(dict, base)
    }
}

$B.set_class_attr = function(cls_dict, attr, value){
    cls_dict.$strings[attr] = value
}

/*
type.__format__ = function(klass){
    // For classes, format spec is ignored, return str(klass)
    return _b_.str.$factory(klass)
}
*/

var NULL = {NULL:true}

var counter = 0

$B.slot2dunder = {
    tp_init: '__init__',
    tp_iter: '__iter__',
    tp_new: '__new__',
    tp_repr: '__repr__',
    tp_descr_get: '__get__'
}

$B.dunder2slot = {}
for(var key in $B.slot2dunder){
    $B.dunder2slot[$B.slot2dunder[key]] = key
}

$B.search_own_slot = function(cls, slot, _default){
    var dunder = $B.slot2dunder[slot]
    if(cls.hasOwnProperty(slot)){
        return cls[slot]
    }
    if(dunder){
        var v = $B.str_dict_get(cls.dict, dunder, $B.NULL)
        if(v !== $B.NULL){
            if(v.ob_type.tp_descr_get){
                v = v.ob_type.tp_descr_get(v, cls)
            }
            return v
        }
    }
    return _default
}

$B.search_slot = function(cls, slot, _default){
    var dunder = $B.slot2dunder[slot]
    for(var klass of cls.tp_mro){
        if(klass.hasOwnProperty(slot)){
            return klass[slot]
        }
        if(dunder){
            var v = $B.search_slot(klass, dunder, $B.NULL)
            if(v !== $B.NULL){
                if(typeof v !== 'function'){
                    var v_type = $B.get_class(v)
                    var getter = $B.search_slot(v_type, 'tp_descr_get', $B.NULL)
                    if(getter){
                        v = getter(v, cls)
                    }
                }
                return v
            }
        }
    }
    return _default
}

$B.type_getattribute = function(klass, attr, _default){
    var test = false // attr == '__class_getitem__'
    if(test){
        console.log('type getattribute', attr, klass)

    }
    var meta = $B.get_class(klass)
    var getattro = $B.search_slot(meta, 'tp_getattro', $B.NULL)
    if(getattro === $B.NULL){
        return $B.NULL
    }
    return getattro(klass, attr)
}


// __name__ is a data descriptor
type.tp_name = 'type'

type.__qualname__ = 'type'

type.__ror__ = function(){
    var len = arguments.length
    if(len != 1){
        $B.RAISE(_b_.TypeError, `expected 1 argument, got ${len}`)
    }
    return _b_.NotImplemented
}

function update_subclasses(kls, name, alias, value){
    // recursively propagate kls[alias] = value to subclasses of kls that
    // don't define kls[name]
    // For instance, set kls.$tp_setattr for subclasses that don't define
    // __setattr__
    for(var subclass of kls.$subclasses){
        if(! subclass.hasOwnProperty(name)){
            subclass[alias] = value
            update_subclasses(subclass, name, alias, value)
        }
    }
}

type.$mro = $B.make_mro

function type_mro(cls){
    return $B.$list(type.$mro(cls))
}



$B.set_func_names(type, "builtins")

function type___subclasses__(klass){

}

function type___subclasscheck__(cls, subclass){
    // Is subclass a subclass of self ?
    if(subclass.tp_bases === undefined){
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(cls) > -1
}
function type___dir__(klass){
    var dict = $B.empty_dict()
    $B.merge_class_dict(dict, klass)
    return _b_.sorted(dict)
}
function type___sizeof__(klass){
 $B.RAISE(_b_.NotImplementedError)
}

/* type start */
_b_.type.tp_setattro = function(kls, attr, value){
    var $test = false // kls.tp_name == 'A'
    if($test){
        console.log('set attr', attr, 'of class', kls, 'to', value)
        console.log('kls.dict', Object.entries(kls.dict.$strings))
    }
    var in_mro = $B.search_in_mro($B.get_class(kls), attr, $B.NULL)
    if(in_mro !== $B.NULL){
        if($test){
            console.log('use type.dict', type.dict[attr])
        }
        var in_mro_type = $B.get_class(in_mro)
        var setter = $B.search_slot(in_mro_type, 'tp_descr_set', $B.NULL)
        if(setter !== $B.NULL){
            return setter(in_mro, kls, value)
        }
    }
    if(kls.__flags__ && TPFLAGS.IMMUTABLETYPE){
        $B.RAISE(_b_.TypeError,
            `cannot set '${attr}' attribute of immutable type '` +
                kls.tp_name + "'")
    }
    if(value === $B.NULL){
        var current = $B.str_dict_get(kls.dict, attr, $B.NULL)
        if(current === $B.NULL){
            throw $B.attr_error(attr, kls)
        }
        delete kls.dict.$strings[attr]
    }else{
        $B.str_dict_set(kls.dict, attr, value)
    }
    return _b_.None
    /*
    kls[attr] = value

    var mp = kls.dict
    // mapping proxy is read-only, set key/value without using __setitem__
    mp[attr] = value

    switch(attr){
        case '__init__':
        case '__new__':
            // redefine the function that creates instances of the class
            kls.$factory = $B.$instance_creator(kls)
            break
        case "__bases__XXX":
            // redefine mro
            kls.__mro__ = _b_.type.mro(kls)
            break
        case '__setattr__':
            var initial_value = kls.$tp_setattr
            kls.$tp_setattr = value
            update_subclasses(kls, '__setattr__', '$tp_setattr', value)
            break
    }
    if($test){console.log("after setattr", kls)}
    return _b_.None
    */
}

_b_.type.nb_or = function(){
    var $ = $B.args('__or__', 2, {cls: null, other: null},  ['cls', 'other'],
                arguments, {}, null, null),
        cls = $.cls,
        other = $.other
    if(other !== _b_.None && ! $B.$isinstance(other,
            [type, $B.GenericAlias, $B.UnionType])){
        return _b_.NotImplemented
    }
    return $B.UnionType.$factory([cls, other])
}

_b_.type.tp_repr = function(kls){
    // $B.builtins_repr_check(type, arguments) // in brython_builtins.js
    var name = $B.get_name(kls)
    var module = $B.str_dict_get(kls.dict, '__module__', $B.NULL)
    var qualname = module === $B.NULL ? name : module + "." + name
    return "<class '" + qualname + "'>"
}

_b_.type.tp_call = function(){
    var $ = $B.args('__call__', 1, {cls: null}, ['cls'], arguments, {}, 'args', 'kw'),
        cls = $.cls,
        args = $.args,
        kw = $.kw,
        kw_len = _b_.dict.mp_length(kw)

    console.log('call type.tp_call, cls', cls, 'args', args, 'kw', kw)

    var test = cls.tp_name === 'KeyError' // args !== undefined && Array.isArray(args) && args[0] === 'flags'
    if(test){
        console.log('type.tp_call', cls, args)
        console.log(Error('trace').stack)
    }
    if(cls === _b_.type){
        if($.args.length == 1 && kw_len == 0){
            // one argument: return type of argument
            return $B.get_class(args[0])
        }
        if(args.length !== 1 && args.length !== 3){
            console.log(Error('trace').stack)
            console.log('args', args)
            $B.RAISE(_b_.TypeError, 'type() takes 1 or 3 arguments')
        }
    }
    var new_func = $B.search_slot(cls, "tp_new")
    if(test){
        console.log('new_func', new_func)
    }
    console.log('in tp_call, kw', $.kw, 'args', $.args)
    console.log('call new_func', new_func)
    // create an instance with __new__
    var instance = new_func(cls, ...args, $B.dict2kwarg(kw)), //arguments),
        instance_class = $B.get_class(instance)
    if(test){
        console.log('instance of type', instance)
    }
    if(instance_class === cls){
        // call __init__ with the same parameters
        var init_func = $B.search_slot(cls, 'tp_init', $B.NULL)
        if(init_func !== $B.NULL && init_func !== _b_.object.tp_init){
            // object.__init__ is not called in this case (it would raise an
            // exception if there are parameters).
            try{
                if(kw_len > 0){
                    var kwarg = {$kw: [kw.$strings]} // {$kw:[{x: 1}, locals.kw]}
                    init_func.call(null, instance, ...$.args, kwarg)
                }else{
                    init_func.call(null, instance, ...$.args)
                }
            }catch(err){
                console.log('error in init of', cls)
                console.log('frame obj', $B.frame_obj)
                throw err
            }
        }
    }
    return instance
}

_b_.type.tp_getattro = function(obj, name){
    var test = false // name == '__mro__'
    if(test){
        console.log('class_getattr', obj, name)
        console.log('frame obj', $B.frame_obj)
    }
    var klass = $B.get_class(obj)
    var in_mro = $B.search_in_mro(klass, name, NULL)
    // print('in mro', in_mro, type(in_mro), in_mro is null)
        if(test){
            console.log('attr', name, 'of class', klass)
            console.log('in mro', in_mro)
        }
    var getter = NULL
    if(in_mro !== NULL){
        var in_mro_class = $B.get_class(in_mro)
        if(test){
            console.log('in_mro class', in_mro_class)
        }
        var getter = $B.search_slot(in_mro_class, 'tp_descr_get', NULL)
        if(test){
            console.log('getter', getter)
        }
        if(getter !== NULL){
            if($B.search_slot(in_mro_class, 'tp_descr_set', NULL) !== NULL){
                if(test){
                    console.log('data descriptor', name)
                    console.log('__set__', $B.search_slot(in_mro_class, 'tp_descr_set', NULL))
                }
                var res = getter(in_mro, obj, klass)     // data descriptor
                if(test){
                    console.log('result of getter', res)
                }
                return res
            }else{
                if(test){
                    console.log('non-data descriptor', name)
                }
            }
        }
    }
    if(test){
        console.log('search attribute', name, 'in mro', obj)
   }
    var attribute = $B.search_in_mro(obj, name, NULL)
    if(attribute !== NULL){
        if(test){
            console.log('attribute', attribute)
            console.log('class', $B.get_class(attribute))
        }
        var local_get = $B.search_slot($B.get_class(attribute), 'tp_descr_get', NULL)
        if(test){
            console.log('local_get', local_get)
        }
        if(local_get !== NULL){
            var res = local_get(attribute, _b_.None, obj)
            if(test){
                console.log('result of local_get', res)
            }
            return res
        }
        return attribute
    }
    if(getter !== NULL){
        if(typeof getter !== 'function'){
            console.log('getter', getter)
            console.log(Error().stack)
        }
        return getter(in_mro, obj)  // non-data descriptor
    }
    if(in_mro !== NULL){
        return in_mro
    }
    return $B.NULL
}

_b_.type.tp_init = function(self){
    if(arguments.length == 0){
        $B.RAISE(_b_.TypeError, "descriptor '__init__' of 'type' " +
            "object needs an argument")
    }
}

_b_.type.tp_new = function(metatype, name, bases, cl_dict, extra_kwargs){
    // Return a new type object. This is essentially a dynamic form of the
    // class statement. The name string is the class name and becomes the
    // __name__ attribute; the bases tuple itemizes the base classes and
    // becomes the __bases__ attribute; and the dict dictionary is the
    // namespace containing definitions for class body and becomes the
    // __dict__ attribute
    // arguments passed as keywords in class definition
    var $ = $B.args('__new__', 1, {metatype: null}, ['metatype'], arguments,
                {}, 'args', 'kwds')
    var args = $.args,
        kwds = $.kwds
    var test = false // name == 'EnumCheck'
    if(test){
        console.log('type.tp_new', name, 'metatype', metatype,
            'extrakw', extra_kwargs)
    }
    extra_kwargs = kwds

    // Create the class dictionary
    var module = $B.str_dict_get(cl_dict, '__module__', $B.frame_obj.frame[2])
    $B.set_class_attr(cl_dict, '__module__', module)
    var qualname = $B.str_dict_get(cl_dict, '__qualname__', name)

    var [name, bases, orig_dict] = args

    var ctx = {
        metatype,
        args,
        kwds,
        orig_dict,
        name,
        bases
    }
    // PyObject *type = NULL;
    var res = type_new_get_bases(ctx, type)
    if(test){
        console.log('result of type_new_get_bases', res)
    }
    if(res < 0){
        assert(PyErr_Occurred());
        return NULL;
    }
    if(res == 1){
        return type
    }
    if(res instanceof Object){
        return type
    }
    //type = type_new_impl(ctx)

    /*
    if(meta === _b_.type){
        var resolved_bases = $B.resolve_mro_entries(bases)
        meta = $B.get_metaclass(name, resolved_bases)
        if(test){
            console.log('metaclass from bases', meta)
        }
    }

    var meta_new = $B.search_slot(meta, 'tp_new', $B.NULL)
    if(meta_new === $B.NULL){
        $B.RAISE(_b_.TypeError, `no __new__ for metaclass ${name}`)
    }
    if(meta_new !== _b_.type.tp_new){
        console.log('meta_new', meta_new)
        throw Error('trace')
        return meta_new.apply(null, arguments)
    }
    */
    var class_obj = {
        ob_type: ctx.metatype,
        tp_bases : ctx.bases,
        __module__: module,
        tp_name: name,
        dict: cl_dict,
        $is_class: true
    }

    let slots = $B.str_dict_get(cl_dict, '__slots__', $B.NULL)
    if(slots !== $B.NULL){
        for(let key of $B.make_js_iterator(slots)){
            $B.str_dict_set(cl_dict, key,
                $B.member_descriptor.$factory(key, class_obj))
        }
    }

    $B.str_dict_set(class_obj.dict, '__dict__',
            $B.getset_descriptor.$factory(
            class_obj,
            '__dict__',
            [object_get_dict, object_set_dict]
        )
    )

    class_obj.tp_mro = type_mro(class_obj)

    // set class attributes
    for(var item of _b_.dict.$iter_items(cl_dict)){
        var key = item.key,
            v = item.value
        if(test){
            console.log('check __set_name__ for', key, v)
        }
        if(['__module__', '__class__', '__name__', '__qualname__'].includes(key)){
            continue
        }
        if(key.startsWith('$')){
            continue
        }
        if(v === undefined){
            continue
        }

        // cf PEP 487 and issue #1178
        var set_name = $B.type_getattribute($B.get_class(v), "__set_name__")
        if(set_name !== $B.NULL){
            $B.$call(set_name, v, class_obj, key)
        }
        if(typeof v == "function"){
            if(v.$function_infos === undefined){
                // internal functions have $infos
                if(v.$infos){
                    v.$infos.__qualname__ = name + '.' + v.$infos.__name__
                }
            }else{
                v.$function_infos[$B.func_attrs.method_class] = class_obj
                v.$function_infos[$B.func_attrs.__qualname__] = name + '.' +
                    v.$function_infos[$B.func_attrs.__name__]
            }
        }
    }

    var sup = $B.$call(_b_.super, class_obj, class_obj)
    var init_subclass = _b_.super.tp_getattro(sup, "__init_subclass__")
    if(test){
        console.log('call init subclass with extra_kwargs', extra_kwargs)
    }
    try{
        $B.dict2kwarg(extra_kwargs)
    }catch(err){
        console.log('error for extra_kwargs', extra_kwargs)
        console.log('tp new', name)
        console.log(err)
        throw err
    }
    $B.$call(init_subclass, $B.dict2kwarg(extra_kwargs))
    return class_obj
}

var type_funcs = _b_.type.tp_funcs = {}

type_funcs.__abstractmethods___get = function(cls){
    if(cls !== type) {
        var res = type.dict.__abstractmethods__
        if(res !== undefined){
            return res
        }
    }
    throw attr_error('__abstractmethods__', cls)
}

type_funcs.__abstractmethods___set = function(cls, value){
    $B.RAISE(_b_.NotImplementedError)
}

type_funcs.__annotate___get = function(self){

}

type_funcs.__annotate___set = function(self){

}

type_funcs.__annotations___get = function(self){

}

type_funcs.__annotations___set = function(self){

}

type_funcs.__base__ = function(self){

}

type_funcs.__bases___get = function(self){

}

type_funcs.__bases___set = function(self){

}

type_funcs.__basicsize__ = function(self){

}

type_funcs.__dict___get = function(cls){
    return {
        ob_type: $B.mappingproxy,
        mapping: cls.dict
    }
}

type_funcs.__dict___set = function(self){

}

type_funcs.__dictoffset__ = function(self){

}

type_funcs.__dir__ = function(klass){
    var dict = $B.empty_dict()
    $B.merge_class_dict(dict, klass)
    return _b_.list.$factory(dict)
}

type_funcs.__doc___get = function(cls){
    console.log('get doc')
    return cls.__doc__
}

type_funcs.__doc___set = function(cls, value){
    cls.__doc__ = value
}

type_funcs.__flags__ = function(self){

}

type_funcs.__instancecheck__ = function(cls, instance){
    var kl = $B.get_class(instance)
    var mro = $B.get_mro(kl)
    for(var klass of mro){
        if(klass === cls){
            return true
        }
    }
    return false
}

type_funcs.__itemsize__ = function(self){

}

type_funcs.__module___get = function(self){

}

type_funcs.__module___set = function(self){

}

type_funcs.__mro___get = function(self){
    return $B.fast_tuple($B.get_mro(self))
}

type_funcs.__mro___set = function(self){

}

type_funcs.__name___get = function(cls){
    return $B.get_name(cls)
}

type_funcs.__name___set = function(cls,value){
    console.log('set name of class', cls, value)
    cls.tp_name = value
}

type_funcs.__prepare__ = function(cls){
    return $B.empty_dict()
}

type_funcs.__qualname___get = function(cls){
    return $B.get_name(cls)
}

type_funcs.__qualname___set = function(cls, value){
    cls.tp_name = value
}

type_funcs.__sizeof__ = function(self){

}

type_funcs.__subclasscheck__ = function(self, subclass){
    // Is subclass a subclass of self ?
    var klass = self
    if(subclass.tp_bases === undefined){
        return self === _b_.object
    }
    return subclass.tp_bases.indexOf(klass) > -1
}

type_funcs.__subclasses__ = function(self){

}

type_funcs.__text_signature___get = function(self){

}

type_funcs.__text_signature___set = function(self){

}

type_funcs.__type_params___get = function(self){

}

type_funcs.__type_params___set = function(self){

}

type_funcs.__weakrefoffset__ = function(self){

}

type_funcs.mro = function(self){

}

_b_.type.tp_methods = ["mro", "__subclasses__", "__instancecheck__", "__subclasscheck__", "__dir__", "__sizeof__"]

_b_.type.classmethods = ["__prepare__"]

_b_.type.tp_members = ["__basicsize__", "__itemsize__", "__flags__", "__weakrefoffset__", "__base__", "__dictoffset__"]

_b_.type.tp_getset = ["__name__", "__qualname__", "__bases__", "__mro__", "__module__", "__abstractmethods__", "__dict__", "__doc__", "__text_signature__", "__annotations__", "__annotate__", "__type_params__"]

/* type end */


// property (built in function)
var property = _b_.property
property.$factory = function(fget, fset, fdel, doc){
    var res = {
        ob_type: property
    }
    property.tp_init(res, fget, fset, fdel, doc)
    return res
}

property.tp_init = function(){
    var $ = $B.args('__init__', 5,
                {self: null, fget: null, fset: null, fdel: null, doc: null},
                ['self', 'fget', 'fset', 'fdel', 'doc'], arguments,
                {fget: _b_.None, fset: _b_.None, fdel: _b_.None, doc: _b_.None},
                null, null),
        self = $.self,
        fget = $.fget,
        fset = $.fset,
        fdel = $.fdel,
        doc = $.doc
    self.__doc__ = doc
    if($B.$getattr && doc === _b_.None){
        self.__doc__ = $B.$getattr(fget, '__doc__', doc)
    }
    self.$type = fget.$type
    self.fget = fget
    self.fset = fset
    self.fdel = fdel
    self.$is_property = true

    if(fget && fget.$attrs){
        for(var key in fget.$attrs){
            self[key] = fget.$attrs[key]
        }
    }

    self.__delete__ = fdel;

    self.getter = function(fget){
        return property.$factory(fget, self.fset, self.fdel, self.__doc__)
    }
    self.setter = function(fset){
        return property.$factory(self.fget, fset, self.fdel, self.__doc__)
    }
    self.deleter = function(fdel){
        return property.$factory(self.fget, self.fset, fdel, self.__doc__)
    }
}

property.__get__ = function(self, kls){
    if(self.fget === undefined){
        $B.RAISE_ATTRIBUTE_ERROR("unreadable attribute", self, '__get__')
    }
    return $B.$call(self.fget, kls)
}

property.tp_new = function(cls){
    return {
        ob_type: cls
    }
}

property.__set__ = function(self, obj, value){
    if(self.fset === undefined){
        var name = self.fget.$function_infos[$B.func_attrs.__name__]
        var msg = `property '${name}' of '${$B.class_name(obj)}' object ` +
                  'has no setter'
        $B.RAISE_ATTRIBUTE_ERROR(msg, self, '__set__')
    }
    $B.$call(self.fset, obj, value)
}

$B.set_func_names(property, "builtins")

$B.$instance_creator = function(klass){
    var test = false // klass.__name__ == 'SimpleNamespace'
    if(test){
        console.log('instance creator of', klass)
    }
    // return the function to initalise a class instance
    if(klass.prototype && klass.prototype.constructor == klass){
        // JS constructor
        return function(){
            return new klass(...arguments)
        }
    }

    // The class may not be instanciable if it has at least one abstract method
    if(klass.__abstractmethods__ && $B.$bool(klass.__abstractmethods__)){
        return function(){
            var ams = Array.from($B.make_js_iterator(klass.__abstractmethods__))
            ams.sort()
            var quoted_methods = ams.map(m => "'" + m + "'").join(', ')
            var method_word = ams.length > 1 ? 'methods' : 'method'
            $B.RAISE(_b_.TypeError,
                "Can't instantiate abstract class " + klass.__name__ +
                " without an implementation for abstract " + method_word + " " +
                quoted_methods)
        }
    }
    var metaclass = $B.get_class(klass),
        call_func,
        factory
    if(metaclass === _b_.type){
        var new_func = type.tp_getattro(klass, '__new__'),
            init_func = type.tp_getattro(klass, '__init__')
        if(init_func === _b_.object.__init__){
            if(new_func === _b_.object.__new__){
                factory = _b_.object.$new(klass)
            }else{
                factory = new_func.bind(null, klass)
            }
        }else if(new_func === _b_.object.__new__){
            factory = type.$call_no_new_init(klass, init_func)
        }else{
            factory = type.$call(klass, new_func, init_func)
        }
        if(test){
            console.log('factory', factory)
        }
    }else{
        call_func = _b_.type.tp_getattro(metaclass, "__call__")
        if(call_func.$is_class){
            factory = call_func
        }else{
            factory = call_func.bind(null, klass)
        }
    }
    factory.ob_type = $B.function
    factory.$infos = {
        __name__: klass.__name__,
        __module__: klass.__module__
    }
    return factory
}




$B.make_iterator_class = function(name, reverse){
    // Builds a class to iterate over items

    var klass = {
        ob_type: _b_.type,
        __mro__: [_b_.object],
        __name__: name,
        __qualname__: name,

        $factory: function(items){
            return {
                ob_type: klass,
                dict: $B.empty_dict(),
                counter: reverse ? items.length : -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
        },
        $is_class: true,
        $iterator_class: true,

        tp_iter: function(self){
            self.counter =
                self.counter === undefined
                    ? reverse
                        ? self.items.length
                        : - 1
                    : self.counter
            self.len = self.items.length
            return self
        },

        __len__: function(self){
            return self.items.length
        },

        tp_iternext: function(self){
            if(typeof self.test_change == "function"){
                var message = self.test_change()
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                if(message){
                    $B.RAISE(_b_.RuntimeError, message)
                }
            }

            if(reverse){
                self.counter--
                if(self.counter >= 0){
                    var item = self.items[self.counter]
                    if(self.items.$is_js_array){
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            }else{
                self.counter++
                if(self.counter < self.items.length){
                    var item = self.items[self.counter]
                    if(self.items.$is_js_array){
                        // iteration on Javascript lists produces Python objects
                        // cf. issue #1388
                        item = $B.jsobj2pyobj(item)
                    }
                    return item
                }
            }
            $B.RAISE(_b_.StopIteration, "StopIteration")
        },

        __reduce_ex__: function(self){
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}


// PEP 585
$B.GenericAlias = $B.make_builtin_class("GenericAlias")

$B.GenericAlias.$factory = function(origin_class, items){
    var res = {
        ob_type: $B.GenericAlias,
        origin_class,
        items
    }
    return res
}

$B.GenericAlias.__args__ = self => $B.fast_tuple(self.items)

$B.GenericAlias.__call__ = function(self, ...args){
    return self.origin_class.$factory.apply(null, args)
}

$B.GenericAlias.__eq__ = function(self, other){
    if(! $B.$isinstance(other, $B.GenericAlias)){
        return false
    }
    return $B.rich_comp("__eq__", self.origin_class, other.origin_class) &&
        $B.rich_comp("__eq__", self.items, other.items)
}

$B.GenericAlias.__getitem__ = function(self, item){
    $B.RAISE(_b_.TypeError, "descriptor '__getitem__' for '" +
        self.origin_class.__name__ +"' objects doesn't apply to a '" +
        $B.class_name(item) +"' object")
}

$B.GenericAlias.__mro_entries__ = function(self){
    return $B.fast_tuple([self.origin_class])
}

$B.GenericAlias.tp_new = function(origin_class, items){
    var res = {
        ob_type: $B.GenericAlias,
        origin_class,
        items,
        $is_class: true
    }
    return res
}

$B.GenericAlias.__or__ = function(){
    var $ = $B.args('__or__', 2, {self: null, other: null}, ['self', 'other'],
                    arguments, {}, null, null)
    return $B.UnionType.$factory([$.self, $.other])
}

$B.GenericAlias.__origin__ = self => self.origin_class

// In PEP 585 : "a lazily computed tuple (possibly empty) of unique
// type variables found in __args__", but what are "unique type
// variables" ?
$B.GenericAlias.__parameters__ = self => $B.fast_tuple([])

$B.GenericAlias.tp_repr = function(self){
    var items = Array.isArray(self.items) ? self.items : [self.items]
    var reprs = []
    for(var item of items){
        if(item === _b_.Ellipsis){
            reprs.push('...')
        }else{
            if($B.is_type(item)){
                reprs.push($B.get_name(item))
            }else{
                reprs.push(_b_.repr(item))
            }
        }
    }
    var iv = $B.$getattr(self.origin_class, '__infer_variance__', true)
    var prefix = iv ? '' : '~'
    return prefix + $B.$getattr(self.origin_class, '__qualname__') + '[' +
        reprs.join(", ") + ']'
}

$B.GenericAlias.__type_params__ = self => $B.$getattr(self.origin_class, '__type_params__')

$B.set_func_names($B.GenericAlias, "types")

$B.UnionType = $B.make_builtin_class("UnionType")

$B.UnionType.$factory = function(items){
    return {
        ob_type: $B.UnionType,
        items
    }
}

var UnionType_funcs = $B.UnionType.tp_funcs = {}

UnionType_funcs.__args__ = function(self){
    return $B.fast_tuple(self.items)
}

$B.UnionType.__class_getitem__ = function(cls, items){
    if($B.$isinstance(items, _b_.tuple)){
        return $B.UnionType.$factory(items)
    }else{
        return items
    }
}

$B.UnionType.__eq__ = function(self, other){
    if(! $B.$isinstance(other, $B.UnionType)){
        return _b_.NotImplemented
    }
    return _b_.list.__eq__(self.items, other.items)
}

$B.UnionType.__or__ = function(self, other){
    var items = self.items.slice()
    if(! items.includes(other)){
        items.push(other)
    }
    return $B.UnionType.$factory(items)
}

UnionType_funcs.__parameters___get = function(self){
    return $B.fast_tuple([]) // XXX
}

$B.UnionType.tp_repr = function(self){
    var t = []
    for(var item of self.items){
        if(item.$is_class){
            var s = item.__name__
            if(item.__module__ !== "builtins"){
                s = item.__module__ + '.' + s
            }
            t.push(s)
        }else{
            t.push(_b_.repr(item))
        }
    }
    return t.join(' | ')
}

$B.UnionType.tp_members = ['__args__']

$B.UnionType.tp_getset = ['__parameters__']

$B.set_func_names($B.UnionType, "types")


$B.make_annotate_func = function(dict, annotations, class_frame){
    if(annotations === undefined){
        dict.__annotate_func__ = _b_.None
        return
    }
    var __annotate_func__ = annotations
    dict.__annotate_func__ = __annotate_func__
    $B.set_function_infos(__annotate_func__,
        {
            __defaults__: _b_.None,
            __kwdefaults__: _b_.None,
            __name__: '__annotate__',
            __module__: class_frame[2],
            __qualname__: class_frame[0] + '.__annotate__'
        }
    )
}

$B.postpone_annotations = function(obj, file){
    // create property __annotations__ for a module with
    // "from __future__ import annotations
    var module_frame = $B.frame_obj.frame
    obj.$annotations = {}
    Object.defineProperty(obj, '__annotations__',
        {
            configurable: true,
            get(){
                if(obj.$set_annotations){
                    return obj.$set_annotations
                }
                var res = $B.empty_dict()
                for(var key in obj.$annotations){
                    _b_.dict.$setitem(res, key, obj.$annotations[key][1]())
                }
                return res
            },
            set(value){
                obj.$set_annotations = value
            }
        }
    )
}

$B.make_module_annotate = function(locals){
    Object.defineProperty(locals, '__annotations__',
        {
            get() {
                if(locals.$set_annotations){
                    return locals.$set_annotations
                }
                if(locals.__annotate__){
                    return locals.__annotate__(1)
                }
                return locals.__annotate_func__(1)
            },
            set(value){
                locals.$set_annotations = value
            }
        }
    )
    Object.defineProperty(locals, '__annotate__',
        {
            get() {
                if(locals.$annotate){
                    return locals.$annotate
                }
                return locals.__annotate_func__
            },
            set(value){
                locals.$annotate = value
            }
        }
    )
    locals.__annotate_func__ = function(format){
        switch(format){
            case 1:
                var ann_dict = $B.empty_dict()
                for(var key in locals.$annotations){
                    var item = locals.$annotations[key]
                    //frame.$lineno = item[0]
                    $B.$setitem(ann_dict, key, item[1]())
                }
                return ann_dict
            default:
                $B.RAISE(_b_.NotImplementedError, )
        }
    }
    $B.add_function_infos(locals, '__annotate_func__')

    $B.set_function_attr(locals.__annotate_func__, '__name__', '__annotate__')
    $B.set_function_attr(locals.__annotate_func__, '__qualname__', '__annotate__')
}


})(__BRYTHON__);
