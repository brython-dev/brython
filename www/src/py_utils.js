;(function($B){

var _b_ = $B.builtins,
    _window = self,
    isWebWorker = ('undefined' !== typeof WorkerGlobalScope) &&
            ("function" === typeof importScripts) &&
            (navigator instanceof WorkerNavigator)

$B.args = function(fname, argcount, slots, var_names, args, $dobj,
    extra_pos_args, extra_kw_args){
    // builds a namespace from the arguments provided in $args
    // in a function defined as
    //     foo(x, y, z=1, *args, u, v, **kw)
    // the parameters are
    //     fname = "f"
    //     argcount = 3 (for x, y , z)
    //     slots = {x:null, y:null, z:null, u:null, v:null}
    //     var_names = ['x', 'y', 'z', 'u', 'v']
    //     $dobj = {'z':1}
    //     extra_pos_args = 'args'
    //     extra_kw_args = 'kw'
    //     kwonlyargcount = 2
    if(fname.startsWith("lambda_" + $B.lambda_magic)){
        fname = "<lambda>"
    }
    var has_kw_args = false,
        nb_pos = args.length,
        filled = 0,
        extra_kw,
        only_positional

    // If the function definition indicates the end of positional arguments,
    // store the position and remove "/" from variable names
    var end_positional = var_names.indexOf("/")
    if(end_positional != -1){
        var_names.splice(end_positional, 1)
        only_positional = var_names.slice(0, end_positional)
    }

    // If the function call had keywords arguments, they are in the last
    // element of $args
    if(nb_pos > 0 && args[nb_pos - 1] && args[nb_pos - 1].$nat){
        nb_pos--
        if(Object.keys(args[nb_pos].kw).length > 0){
            has_kw_args = true
            var kw_args = args[nb_pos].kw
            if(Array.isArray(kw_args)){
                var kwa = kw_args[0]
                for(var i = 1, len = kw_args.length; i < len; i++){
                    var kw_arg = kw_args[i]
                    if(kw_arg.__class__ === _b_.dict){
                        for(var k in kw_arg.$numeric_dict){
                            throw _b_.TypeError.$factory(fname +
                                "() keywords must be strings")
                        }
                        for(var k in kw_arg.$object_dict){
                            throw _b_.TypeError.$factory(fname +
                                "() keywords must be strings")
                        }
                        for(var k in kw_arg.$string_dict){
                            if(kwa[k] !== undefined){
                                throw _b_.TypeError.$factory(fname +
                                    "() got multiple values for argument '" +
                                    k + "'")
                            }
                            kwa[k] = kw_arg.$string_dict[k][0]
                        }
                    }else{
                        var it = _b_.iter(kw_arg),
                            getitem = $B.$getattr(kw_arg, '__getitem__')
                        while(true){
                            try{
                                var k = _b_.next(it)
                                if(typeof k !== "string"){
                                    throw _b_.TypeError.$factory(fname +
                                        "() keywords must be strings")
                                }
                                if(kwa[k] !== undefined){
                                    throw _b_.TypeError.$factory(fname +
                                        "() got multiple values for argument '" +
                                        k + "'")
                                }
                                kwa[k] = getitem(k)
                            }catch(err){
                                if($B.is_exc(err, [_b_.StopIteration])){
                                    break
                                }
                                throw err
                            }
                        }
                    }
                }
                kw_args = kwa
                var nb_kw_args = Object.keys(kw_args).length
                if(nb_kw_args == 0){
                    has_kw_args = false
                }else if(! extra_kw_args){
                    for(var k in kwa){
                        if(slots[k] === undefined){
                            throw _b_.TypeError.$factory(
                                `${fname}() got an unexpected keyword argument '${k}'`)
                        }
                    }
                }
            }
        }
    }

    if(extra_pos_args){
        slots[extra_pos_args] = []
        slots[extra_pos_args].__class__ = _b_.tuple
    }

    if(extra_kw_args){
        // Build a dict object faster than with _b_.dict()
        extra_kw = $B.empty_dict()
    }

    if(nb_pos > argcount){
        // More positional arguments than formal parameters
        if(extra_pos_args === null || extra_pos_args == "*"){
            // No parameter to store extra positional arguments :
            // thow an exception
            // count required positional arguments that take default values
            var min_argcount = argcount
            for(var i = 0; i < argcount; i++){
                if($dobj[var_names[i]] !== undefined){
                    min_argcount--
                }
            }
            var kw_msg = ''
            if(has_kw_args){
                var kw_msg = `(and ${nb_kw_args} keyword-only argument` +
                             (nb_kw_args != 1 ? 's' : '') + ')'
            }
            msg = fname + "() takes " +
                  (min_argcount == argcount ? argcount :
                      `from ${min_argcount} to ${argcount}`) + " positional argument" +
                  (min_argcount != argcount || argcount != 1 ? "s" : "") +
                  ` but ${nb_pos}` +
                  (has_kw_args ? ` positional arguments` + kw_msg : "") +
                  (nb_pos == 1 ? ' was' : ' were') + ' given'
            throw _b_.TypeError.$factory(msg)
        }else{
            // Store extra positional arguments
            for(var i = argcount; i < nb_pos; i++){
                slots[extra_pos_args].push(args[i])
            }
            // For the next step of the algorithm, only use the arguments
            // before these extra arguments
            nb_pos = argcount
        }
    }

    // Fill slots with positional (non-extra) arguments
    for(var i = 0; i < nb_pos; i++){
        slots[var_names[i]] = args[i]
        filled++
    }

    if(filled == argcount && argcount === var_names.length &&
            ! has_kw_args){
        if(extra_kw_args){
            slots[extra_kw_args] = extra_kw
        }
        return slots
    }

    // Then fill slots with keyword arguments, if any
    if(has_kw_args){
        for(var key in kw_args){
            var value = kw_args[key]
            if(slots[key] === undefined){
                // The name of the keyword argument doesn't match any of the
                // formal parameters
                if(extra_kw_args){
                    // If there is a place to store extra keyword arguments
                    extra_kw.$string_dict[key] = [value, extra_kw.$order++]
                }else{
                    throw _b_.TypeError.$factory(fname +
                        "() got an unexpected keyword argument '" + key + "'")
                }
            }else if(slots.hasOwnProperty(key) && slots[key] !== null){
                // The slot is already filled
                if(key == extra_pos_args){
                    throw _b_.TypeError.$factory(
                        `${fname}() got an unexpected ` +
                        `keyword argument '${key}'`)
                }
                throw _b_.TypeError.$factory(fname +
                    "() got multiple values for argument '" + key + "'")
            }else if(only_positional && only_positional.indexOf(key) > -1){
                throw _b_.TypeError.$factory(`${fname}() got some ` +
                    `positional-only arguments passed as keyword ` +
                    `arguments: '${key}'`)
            }else{
                // Fill the slot with the key/value pair
                slots[key] = value
            }
        }
    }

    // If there are unfilled slots, see if there are default values
    var missing = []
    for(var attr in slots){
        if(slots[attr] === null){
            if($dobj[attr] !== undefined){
                slots[attr] = $dobj[attr]
            }else{
                missing.push(attr)
            }
        }
    }

    if(missing.length > 0){
        if(missing.length == 1){
            var arg_type = 'positional'
            if(var_names.indexOf(missing[0]) >= argcount){
                arg_type = 'required keyword-only'
            }
            throw _b_.TypeError.$factory(fname +
                ` missing 1 ${arg_type} argument: '${missing[0]}'`)
        }else{
            var missing_positional = missing.filter(arg =>
                    var_names.indexOf(arg) < argcount),
                missing_kwonly = missing.filter(arg =>
                    var_names.indexOf(arg) >= argcount)

            function format_missing(m, type){
                var msg = m.length +
                       ` required ${type} argument` +
                       (m.length > 1 ? 's' : '')
                m = m.map(x => `'${x}'`)
                if(m.length > 1){
                    m[m.length - 1] = ' and ' + m[m.length - 1]
                    for(var i = 0; i < m.length - 2; i++){
                        m[i] = m[i] + ', '
                    }
                }
                return msg + ': ' + m.join('')
            }

            var msg = fname + " missing "
            if(missing_positional.length > 0){
                msg += format_missing(missing_positional, 'positional')
            }else{
                msg += format_missing(missing_kwonly, 'keyword-only')
            }
            throw _b_.TypeError.$factory(msg)
        }

    }

    if(extra_kw_args){
        slots[extra_kw_args] = extra_kw
    }

    return slots
}

$B.wrong_nb_args = function(name, received, expected, positional){
    if(received < expected){
        var missing = expected - received
        throw _b_.TypeError.$factory(name + "() missing " + missing +
            " positional argument" + (missing > 1 ? "s" : "") + ": " +
            positional.slice(received))
    }else{
        throw _b_.TypeError.$factory(name + "() takes " + expected +
            " positional argument" + (expected > 1 ? "s" : "") +
            " but more were given")
    }
}

$B.get_class = function(obj){
    // generally we get the attribute __class__ of an object by obj.__class__
    // but Javascript builtins used by Brython (functions, numbers, strings...)
    // don't have this attribute so we must return it

    if(obj === null){
        return $B.imported.javascript.NullType // in builtin_modules.js
    }
    if(obj === undefined){
        return $B.imported.javascript.UndefinedType // idem
    }
    var klass = obj.__class__
    if(klass === undefined){
        switch(typeof obj) {
            case "number":
                return Number.isInteger(obj) ? _b_.int : undefined
            case "string":
                return _b_.str
            case "boolean":
                return _b_.bool
            case "function":
                // Functions defined in Brython have an attribute $infos
                if(obj.$is_js_func){
                    // Javascript function or constructor
                    return $B.JSObj
                }
                obj.__class__ = $B.Function
                return $B.Function
            case "object":
                if(Array.isArray(obj)){
                    if(Object.getPrototypeOf(obj) === Array.prototype){
                        obj.__class__ = _b_.list
                        return _b_.list
                    }
                }else if(typeof Node !== "undefined" // undefined in Web Workers
                        && obj instanceof Node){
                    if(obj.tagName){
                        return $B.imported['browser.html'][obj.tagName] ||
                                   $B.DOMNode
                    }
                    return $B.DOMNode
                }
                break
        }
    }
    if(klass === undefined){
        return $B.JSObj
    }
    return klass
}

$B.class_name = function(obj){
    var klass = $B.get_class(obj)
    if(klass === $B.JSObj){
        return 'Javascript ' + obj.constructor.name
    }else{
        return klass.$infos.__name__
    }
}

$B.next_of = function(iterator){
    // return the function that produces the next item in an iterator
    if(iterator.__class__ === _b_.range){
        var obj = {ix: iterator.start}
        if(iterator.step > 0){
            return function(){
                if(obj.ix >= iterator.stop){
                    throw _b_.StopIteration.$factory('')
                }
                var res = obj.ix
                obj.ix += iterator.step
                return res
            }
        }else{
            return function(){
                if(obj.ix <= iterator.stop){
                    throw _b_.StopIteration.$factory('')
                }
                var res = obj.ix
                obj.ix += iterator.step
                return res
            }
        }
    }
    if(iterator[Symbol.iterator]){
        var it = iterator[Symbol.iterator](),
            obj = {ix: 0},
            items = Array.from(it),
            len = items.length
        return function(){
            if(obj.ix == len){
                throw _b_.StopIteration.$factory('')
            }
            var res = items[obj.ix]
            obj.ix++
            return res
        }
    }
    if(iterator.$builtin_iterator){
        if(iterator.$next_func === undefined){
            iterator.$next_func = $B.$call($B.$getattr(_b_.iter(iterator), '__next__'))
        }
        return iterator.$next_func
    }
    return $B.$call($B.$getattr(_b_.iter(iterator), '__next__'))
}

$B.next_of1 = function(iterator, frame, lineno){
    // return a Javascript iterator usable in a loop
    // "for(item of $B.next_of1(...)){"
    if(iterator.__class__ === _b_.range){
        var obj = {ix: iterator.start}
        if(iterator.step > 0){
            return {
                [Symbol.iterator](){
                    return this
                },
                next(){
                    $B.set_lineno(frame, lineno)
                    if(obj.ix >= iterator.stop){
                        return {done: true, value: null}
                    }
                    var value = obj.ix
                    obj.ix += iterator.step
                    return {done: false, value}
                }
            }
        }else{
            return {
                [Symbol.iterator](){
                    return this
                },
                next(){
                    $B.set_lineno(frame, lineno)
                    if(obj.ix <= iterator.stop){
                        return {done: true, value: null}
                    }
                    var value = obj.ix
                    obj.ix += iterator.step
                    return {done: false, value}
                }
            }
        }
    }
    if(iterator[Symbol.iterator]){
        var it = iterator[Symbol.iterator]()
        return {
            [Symbol.iterator](){
                return this
            },
            next(){
                $B.set_lineno(frame, lineno)
                return it.next()
            }
        }
    }
    // next_func is initialized as undefined; set_lineno() must be called
    // before it is initialized from the iterator
    var next_func = $B.$call($B.$getattr(_b_.iter(iterator),
                    '__next__'))
    return {
        [Symbol.iterator](){
            return this
        },
        next(){
            $B.set_lineno(frame, lineno)
            try{
                var value = next_func()
                return {done: false, value}
            }catch(err){
                if($B.is_exc(err, [_b_.StopIteration])){
                    return {done: true, value: null}
                }
                throw err
            }
        }
    }
}

$B.unpacker = function(obj, nb_targets, has_starred){
    // Used in unpacking target of a "for" loop if it is a tuple or list
    // For "[a, b] = t", nb_targets is 2, has_starred is false
    // For "[a, *b, c]", nb_targets is 1 (a), has_starred is true (*b),
    // nb_after_starred is 1 (c)
    var position,
        position_rank = 3
    if(has_starred){
        var nb_after_starred = arguments[3]
        position_rank++
    }
    if($B.pep657){
        position = arguments[position_rank]
    }
    var t = _b_.list.$factory(obj),
        right_length = t.length,
        left_length = nb_targets + (has_starred ? nb_after_starred - 1 : 0)

    if(right_length < left_length){
        var exc = _b_.ValueError.$factory(`not enough values to unpack ` +
            `(expected ${left_length}, got ${right_length})`)
        if(position){
            $B.set_exception_offsets(exc, position)
        }
        throw exc
    }
    if((! has_starred) && right_length > left_length){
        var exc = _b_.ValueError.$factory("too many values to unpack " +
            `(expected ${left_length})`)
        if(position){
            $B.set_exception_offsets(exc, position)
        }
        throw exc
    }
    t.index = -1
    t.read_one = function(){
        t.index++
        return t[t.index]
    }
    t.read_rest = function(){
        // For the starred item: read the correct number of items in the
        // right-hand side iterator
        t.index++
        var res = t.slice(t.index, t.length - nb_after_starred)
        t.index = t.length - nb_after_starred - 1
        return res
    }
    return t
}

$B.rest_iter = function(next_func){
    // Read the rest of an iterable
    // Used in assignment to a starred item
    var res = []
    while(true){
        try{
            res.push(next_func())
        }catch(err){
            if($B.is_exc(err, [_b_.StopIteration])){
                return $B.fast_tuple(res)
            }
            throw err
        }
    }
}

$B.set_lineno = function(frame, lineno){
    frame.$lineno = lineno
    if(frame[1].$f_trace !== _b_.None){
        $B.trace_line()
    }
    return true
}

$B.handle_annotation = function(annotation_string){
    // Evaluate the annotation string or not, depending on whether postponed
    // evaluation is set (PEP 463)
    if($B.imported.__future__ &&
            $B.frames_stack.length > 0 &&
            $B.last($B.frames_stack)[3].annotations ===
                $B.imported.__future__.annotations){
        // don't evaluate
        return annotation_string
    }else{
        console.log('eval annotation', annotation_string)
        return _b_.eval(annotation_string)
    }
}

$B.copy_namespace = function(){
    var ns = {}
    for(const frame of $B.frames_stack){
        for(const kv of [frame[1], frame[3]]){
            for(var key in kv){
                if(! key.startsWith('$')){
                    ns[key] = kv[key]
                }
            }
        }
    }
    return ns
}

$B.clear_ns = function(name){
    // Remove name from __BRYTHON__.modules, and all the keys that start with name
    if(name.startsWith("__ge")){console.log("clear ns", name)}
    var len = name.length
    $B.$py_src[name] = null
    delete $B.$py_src[name]

    var alt_name = name.replace(/\./g, "_")
    if(alt_name != name){$B.clear_ns(alt_name)}
}

$B.get_method_class = function(ns, qualname){
    // Used to set the cell __class__ in a method. ns is the namespace
    // and qualname is the qualified name of the class
    // Generally, for qualname = "A.B", the result is just ns.A.B
    // In some cases, ns.A might not yet be defined (cf. issue #1740).
    // In this case, a fake class is returned with the same qualname.
    var refs = qualname.split('.'),
        klass = ns
    while(refs.length > 0){
        var ref = refs.shift()
        if(klass[ref] === undefined){
            var fake_class = $B.make_class(qualname)
            return fake_class
        }
        klass = klass[ref]
    }
    return klass
}

// transform native JS types into Brython types
$B.$JS2Py = function(src){
    if(typeof src === "number"){
        if(src % 1 === 0){return src}
        return _b_.float.$factory(src)
    }
    if(src === null || src === undefined){return _b_.None}
    if(Array.isArray(src) &&
            Object.getPrototypeOf(src) === Array.prototype){
        src.$brython_class = "js" // used in make_iterator_class
    }
    return src
}

// warning
$B.warn = function(klass, message, filename, token){
    var warning = klass.$factory(message)
    if(klass === _b_.SyntaxWarning){
        warning.filename = filename
        warning.lineno = token.start[0]
        warning.offset = token.start[1]
        warning.end_lineno = token.end[0]
        warning.end_offset = token.end[1]
        warning.text = token.line
        warning.args[1] = $B.fast_tuple([filename,
                                         warning.lineno, warning.offset,
                                         warning.text,
                                         warning.end_lineno,
                                         warning.end_offset])
    }
    $B.imported._warnings.warn(warning)
}

// get item
function index_error(obj){
    var type = typeof obj == "string" ? "string" : "list"
    throw _b_.IndexError.$factory(type + " index out of range")
}

$B.$getitem = function(obj, item, position){
    var is_list = Array.isArray(obj) && obj.__class__ === _b_.list,
        is_dict = obj.__class__ === _b_.dict && ! obj.$jsobj
    if(typeof item == "number"){
        if(is_list || typeof obj == "string"){
            item = item >=0 ? item : obj.length + item
            if(obj[item] !== undefined){
                return obj[item]
            }else{
                index_error(obj)
            }
        }else if(is_dict){
            if(obj.$numeric_dict[item] !== undefined){
                return obj.$numeric_dict[item][0]
            }
        }
    }else if(item.valueOf && typeof item.valueOf() == "string" && is_dict){
        var res = obj.$string_dict[item]
        if(res !== undefined){
            return res[0]
        }
        throw _b_.KeyError.$factory(item)
    }

    // PEP 560
    if(obj.$is_class){
        var class_gi = $B.$getattr(obj, "__class_getitem__", _b_.None)
        if(class_gi !== _b_.None){
            return $B.$call(class_gi)(item)
        }else if(obj.__class__){
            class_gi = $B.$getattr(obj.__class__, "__getitem__", _b_.None)
            if(class_gi !== _b_.None){
                return class_gi(obj, item)
            }else{
                throw _b_.TypeError.$factory("'" +
                    $B.class_name(obj.__class__) +
                    "' object is not subscriptable")
            }
        }
    }

    if(is_list){
        return _b_.list.$getitem(obj, item)
    }
    if(is_dict){
        return _b_.dict.$getitem(obj, item)
    }

    var gi = $B.$getattr(obj.__class__ || $B.get_class(obj),
        "__getitem__", _b_.None)
    if(gi !== _b_.None){
        return gi(obj, item)
    }

    var exc = _b_.TypeError.$factory("'" + $B.class_name(obj) +
        "' object is not subscriptable")
    if(position){
        $B.set_exception_offsets(exc, position)
    }
    throw exc
}

$B.getitem_slice = function(obj, slice){
    var res
    if(Array.isArray(obj) && obj.__class__ === _b_.list){
        if(slice.start === _b_.None && slice.stop === _b_.None){
            if(slice.step === _b_.None || slice.step == 1){
                res = obj.slice()
            }else if(slice.step == -1){
                res = obj.slice().reverse()
            }
        }else if(slice.step === _b_.None){
            if(slice.start === _b_.None){
                slice.start = 0
            }
            if(slice.stop === _b_.None){
                slice.stop = obj.length
            }
            if(typeof slice.start == "number" &&
                    typeof slice.stop == "number"){
                if(slice.start < 0){
                    slice.start += obj.length
                }
                if(slice.stop < 0){
                    slice.stop += obj.length
                }
                res = obj.slice(slice.start, slice.stop)
            }
        }
        if(res){
            res.__class__ = obj.__class__ // can be tuple
            res.__brython__ = true
            return res
        }else{
            return _b_.list.$getitem(obj, slice)
        }
    }else if(typeof obj == "string"){
        if(slice.start === _b_.None && slice.stop === _b_.None){
            if(slice.step === _b_.None || slice.step == 1){
                res = obj
            }else if(slice.step == -1){
                res = obj.split("").reverse().join("");
            }
        }else if(slice.step === _b_.None){
            if(slice.start === _b_.None){
                slice.start = 0
            }
            if(slice.stop === _b_.None){
                slice.stop = obj.length
            }
            if(typeof slice.start == "number" &&
                    typeof slice.stop == "number"){
                if(slice.start < 0){
                    slice.start += obj.length
                }
                if(slice.stop < 0){
                    slice.stop += obj.length
                }
                res = obj.substring(slice.start, slice.stop)
            }
        }
        if(res !== undefined){
            return res
        }else{
            return _b_.str.__getitem__(obj, slice)
        }
    }
    return $B.$getattr(obj, "__getitem__")(slice)
}

$B.$getattr_pep657 = function(obj, attr, position){
    try{
        return $B.$getattr(obj, attr)
    }catch(err){
        $B.set_exception_offsets(err, position)
        throw err
    }
}

// Set list key or slice
$B.set_list_slice = function(obj, start, stop, value){
    if(start === null){
        start = 0
    }else{
        start = $B.$GetInt(start)
        if(start < 0){start = Math.max(0, start + obj.length)}
    }
    if(stop === null){
        stop = obj.length
    }
    stop = $B.$GetInt(stop)
    if(stop < 0){
        stop = Math.max(0, stop + obj.length)
    }
    var res = _b_.list.$factory(value)
    obj.splice.apply(obj,[start, stop - start].concat(res))
}

$B.set_list_slice_step = function(obj, start, stop, step, value){
    if(step === null || step == 1){
        return $B.set_list_slice(obj, start, stop, value)
    }

    if(step == 0){throw _b_.ValueError.$factory("slice step cannot be zero")}
    step = $B.$GetInt(step)

    if(start === null){
        start = step > 0 ? 0 : obj.length - 1
    }else{
        start = $B.$GetInt(start)
    }

    if(stop === null){
        stop = step > 0 ? obj.length : -1
    }else{
        stop = $B.$GetInt(stop)
    }

    var repl = _b_.list.$factory(value),
        j = 0,
        test,
        nb = 0
    if(step > 0){test = function(i){return i < stop}}
    else{test = function(i){return i > stop}}

    // Test if number of values in the specified slice is equal to the
    // length of the replacement sequence
    for(var i = start; test(i); i += step){nb++}
    if(nb != repl.length){
        throw _b_.ValueError.$factory(
            "attempt to assign sequence of size " + repl.length +
            " to extended slice of size " + nb)
    }

    for(var i = start; test(i); i += step){
        obj[i] = repl[j]
        j++
    }
}

$B.$setitem = function(obj, item, value){
    if(Array.isArray(obj) && obj.__class__ === undefined &&
            typeof item == "number" &&
            !_b_.isinstance(obj, _b_.tuple)){
        if(item < 0){item += obj.length}
        if(obj[item] === undefined){
            throw _b_.IndexError.$factory("list assignment index out of range")
        }
        obj[item] = value
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.$setitem(obj, item, value)
        return
    }else if(obj.__class__ === _b_.list){
        return _b_.list.$setitem(obj, item, value)
    }
    var si = $B.$getattr(obj.__class__ || $B.get_class(obj), "__setitem__",
        null)
    if(si === null){
        throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
            "' object does not support item assignment")
    }
    return si(obj, item, value)
}

// item deletion
$B.$delitem = function(obj, item){
    if(Array.isArray(obj) && obj.__class__ === _b_.list &&
            typeof item == "number" &&
            !_b_.isinstance(obj, _b_.tuple)){
        if(item < 0){item += obj.length}
        if(obj[item] === undefined){
            throw _b_.IndexError.$factory("list deletion index out of range")
        }
        obj.splice(item, 1)
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.__delitem__(obj, item)
        return
    }else if(obj.__class__ === _b_.list){
        return _b_.list.__delitem__(obj, item)
    }
    var di = $B.$getattr(obj.__class__ || $B.get_class(obj), "__delitem__",
        null)
    if(di === null){
        throw _b_.TypeError.$factory("'" + $B.class_name(obj) +
            "' object doesn't support item deletion")
    }
    return di(obj, item)
}

$B.augm_assign = function(left, op, right){
    // augmented assignment
    var op1 = op.substr(0, op.length - 1),
        method = $B.op2method.augmented_assigns[op],
        augm_func = $B.$getattr(left, '__' + method + '__', null)
    if(augm_func !== null){
        var res = $B.$call(augm_func)(right)
        if(res === _b_.NotImplemented){
            throw _b_.TypeError.$factory(`unsupported operand type(s)` +
                ` for ${op}: '${$B.class_name(left)}' ` +
                `and '${$B.class_name(right)}'`)
        }
        return res
    }else{
        var method1 = $B.op2method.operations[op1]
        if(method1 === undefined){
            method1 = $B.op2method.binary[op1]
        }
        return $B.rich_op(`__${method1}__`, left, right)
    }
}

$B.extend = function(fname, arg){
    // Called if a function call has **kw arguments
    // arg is a dictionary with the keyword arguments entered with the
    // syntax key = value
    // The next arguments of $B.extend are the mappings to unpack
    for(var i = 2; i < arguments.length; i++){
        var mapping = arguments[i]
        var it = _b_.iter(mapping),
            getter = $B.$getattr(mapping, "__getitem__")
        while (true){
            try{
                var key = _b_.next(it)
                if(typeof key !== "string"){
                    throw _b_.TypeError.$factory(fname +
                        "() keywords must be strings")
                }
                if(arg[key] !== undefined){
                    throw _b_.TypeError.$factory(fname +
                        "() got multiple values for argument '" + key + "'")
                }
                arg[key] = getter(key)
            }catch(err){
                if(_b_.isinstance(err, [_b_.StopIteration])){
                    break
                }
                throw err
            }
        }
    }
    return arg
}

$B.$is = function(a, b){
    // Used for Python "is". In most cases it's the same as Javascript ===,
    // Cf. issue 669
    if(a.__class__ === _b_.float && b.__class__ === _b_.float){
        if(isNaN(a.value) && isNaN(b.value)){
            return true
        }
        return a.value == b.value
    }
    if((a === _b_.int && b == $B.long_int) ||
            (a === $B.long_int && b === _b_.int)){
        return true
    }
    if((a === undefined || a === $B.Undefined) &&
            (b === undefined || b === $B.Undefined)){
        return true
    }
    return a === b
}

$B.is_or_equals = function(x, y){
    // used to test membership in lists, sets, dicts
    return $B.$is(x, y) || $B.rich_comp('__eq__', x, y)
}

$B.$is_member = function(item, _set){
    // used for "item in _set"
    var f, _iter, method

    // Use __contains__ if defined *on the class* (implicit invocation of
    // special methods don't use object __dict__)
    try{
        method = $B.$getattr(_set.__class__ || $B.get_class(_set),
            "__contains__")

    }
    catch(err){}

    if(method){
        return $B.$call(method)(_set, item)
    }

    // use __iter__ if defined
    try{_iter = _b_.iter(_set)}
    catch(err){}
    if(_iter){
        while(1){
            try{
                var elt = _b_.next(_iter)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                return false
            }
        }
    }

    // use __getitem__ if defined
    try{f = $B.$getattr(_set, "__getitem__")}
    catch(err){
        throw _b_.TypeError.$factory("'" + $B.class_name(_set) +
            "' object is not iterable")
    }
    if(f){
        var i = -1
        while(1){
            i++
            try{
                var elt = f(i)
                if($B.rich_comp("__eq__", elt, item)){return true}
            }catch(err){
                if(err.__class__ === _b_.IndexError){return false}
                throw err
            }
        }
    }
}

$B.$call = function(callable, position){
    if(callable.__class__ === $B.method){
        return callable
    }else if(callable.$factory){
        return callable.$factory
    }else if(callable.$is_class){
        // Use metaclass __call__, cache result in callable.$factory
        return callable.$factory = $B.$instance_creator(callable)
    }else if(callable.$is_js_class){
        // JS class uses "new"
        return callable.$factory = function(){
            return new callable(...arguments)
        }
    }else if(callable.$in_js_module){
        // attribute $in_js_module is set for functions in modules written
        // in Javascript, in py_import.js
        return function(){
            var res = callable(...arguments)
            return res === undefined ? _b_.None : res
        }
    }else if(callable.$is_func || typeof callable == "function"){
        if(position){
            return function(){
                try{
                    return callable.apply(null, arguments)
                }catch(exc){
                    $B.set_exception_offsets(exc, position)
                    throw exc
                }
            }
        }
        return callable
    }
    try{
        return $B.$getattr(callable, "__call__")
    }catch(err){
        throw _b_.TypeError.$factory("'" + $B.class_name(callable) +
            "' object is not callable")
    }
}

// Default standard output and error
// Can be reset by sys.stdout or sys.stderr
var $io = $B.$io = $B.make_class("io",
    function(out){
        return {
            __class__: $io,
            out,
            encoding: 'utf-8'
        }
    }
)

$io.flush = function(self){
    if(self.buf){
        console[self.out](self.buf.join(''))
        self.buf = []
    }
}

$io.write = function(self, msg){
    // Default to printing to browser console
    if(self.buf === undefined){
        self.buf = []
    }
    if(typeof msg != "string"){
        throw _b_.TypeError.$factory("write() argument must be str, not " +
            $B.class_name(msg))
    }
    self.buf.push(msg)
    return _b_.None
}

if(console.error !== undefined){
    $B.stderr = $io.$factory("error")
}else{
    $B.stderr = $io.$factory("log")
}
$B.stdout = $io.$factory("log")

$B.stdin = {
    __class__: $io,
    __original__: true,
    closed: false,
    len: 1,
    pos: 0,
    read: function (){
        return ""
    },
    readline: function(){
        return ""
    }
}

$B.make_iterator_class = function(name){
    // Builds a class to iterate over items

    var klass = {
        __class__: _b_.type,
        __mro__: [_b_.object],
        $factory: function(items){
            return {
                __class__: klass,
                __dict__: $B.empty_dict(),
                counter: -1,
                items: items,
                len: items.length,
                $builtin_iterator: true
            }
        },
        $infos:{
            __name__: name
        },
        $is_class: true,
        $iterator_class: true,

        __iter__: function(self){
            self.counter = self.counter === undefined ? -1 : self.counter
            self.len = self.items.length
            return self
        },

        __len__: function(self){
            return self.items.length
        },

        __next__: function(self){
            if(typeof self.test_change == "function" && self.test_change()){
                // Used in dictionaries : test if the current dictionary
                // attribute "$version" is the same as when the iterator was
                // created. If not, items have been added to or removed from
                // the dictionary
                throw _b_.RuntimeError.$factory(
                    "dictionary changed size during iteration")
            }

            self.counter++
            if(self.counter < self.items.length){
                var item = self.items[self.counter]
                if(self.items.$brython_class == "js"){
                    // iteration on Javascript lists produces Python objects
                    // cf. issue #1388
                    item = $B.$JS2Py(item)
                }
                return item
            }
            delete self.items.$next_func // set by $B.next_of()
            throw _b_.StopIteration.$factory("StopIteration")
        },

        __reduce_ex__: function(self, protocol){
            return $B.fast_tuple([_b_.iter, _b_.tuple.$factory([self.items])])
        }
    }

    $B.set_func_names(klass, "builtins")
    return klass
}

function $err(op, klass, other){
    var msg = "unsupported operand type(s) for " + op + ": '" +
        klass.$infos.__name__ + "' and '" + $B.class_name(other) + "'"
    throw _b_.TypeError.$factory(msg)
}

// Code to add support of "reflected" methods to built-in types
// If a type doesn't support __add__, try method __radd__ of operand

var r_opnames = ["add", "sub", "mul", "truediv", "floordiv", "mod", "pow",
    "lshift", "rshift", "and", "xor", "or"]
var ropsigns = ["+", "-", "*", "/", "//", "%", "**", "<<", ">>", "&", "^",
     "|"]

$B.make_rmethods = function(klass){
    for(var r_opname of r_opnames){
        if(klass["__r" + r_opname + "__"] === undefined &&
                klass['__' + r_opname + '__']){
            klass["__r" + r_opname + "__"] = (function(name){
                return function(self, other){
                    return klass["__" + name + "__"](other, self)
                }
            })(r_opname)
        }
    }
}

// UUID is a function to produce a unique id.
// the variable $B.py_UUID is defined in py2js.js (in the brython function)
$B.UUID = function(){return $B.$py_UUID++}

$B.$GetInt = function(value) {
  // convert value to an integer
  if(typeof value == "number" || value.constructor === Number){return value}
  else if(typeof value === "boolean"){return value ? 1 : 0}
  else if(_b_.isinstance(value, _b_.int)){return value}
  else if(_b_.isinstance(value, _b_.float)){return value.valueOf()}
  if(! value.$is_class){
      try{var v = $B.$getattr(value, "__int__")(); return v}catch(e){}
      try{var v = $B.$getattr(value, "__index__")(); return v}catch(e){}
  }
  throw _b_.TypeError.$factory("'" + $B.class_name(value) +
      "' object cannot be interpreted as an integer")
}


$B.to_num = function(obj, methods){
    // If object's class defines one of the methods, return the result
    // of method(obj), else return null
    var expected_class = {
        "__complex__": _b_.complex,
        "__float__": _b_.float,
        "__index__": _b_.int,
        "__int__": _b_.int
    }
    var klass = obj.__class__ || $B.get_class(obj)
    for(var i = 0; i < methods.length; i++) {
        var missing = {},
            method = $B.$getattr(klass, methods[i], missing)
        if(method !== missing){
            var res = method(obj)
            if(!_b_.isinstance(res, expected_class[methods[i]])){
                console.log(res, methods[i], expected_class[methods[i]])
                throw _b_.TypeError.$factory(methods[i] + "returned non-" +
                    expected_class[methods[i]].$infos.__name__ +
                    "(type " + $B.get_class(res) +")")
            }
            return res
        }
    }
    return null
}


$B.PyNumber_Index = function(item){
    switch(typeof item){
        case "boolean":
            return item ? 1 : 0
        case "number":
            return item
        case "object":
            if(item.__class__ === $B.long_int){
                return item
            }
            if(_b_.isinstance(item, _b_.int)){
                // int subclass
                return item.$brython_value
            }
            var method = $B.$getattr(item, "__index__", _b_.None)
            if(method !== _b_.None){
                method = typeof method == "function" ?
                            method : $B.$getattr(method, "__call__")
                return $B.int_or_bool(method())
            }else{
                throw _b_.TypeError.$factory("'" + $B.class_name(item) +
                    "' object cannot be interpreted as an integer")
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.class_name(item) +
                "' object cannot be interpreted as an integer")
    }
}

$B.int_or_bool = function(v){
    switch(typeof v){
        case "boolean":
            return v ? 1 : 0
        case "number":
            return v
        case "object":
            if(v.__class__ === $B.long_int){return v}
            else{
                throw _b_.TypeError.$factory("'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
            }
        default:
            throw _b_.TypeError.$factory("'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
    }
}

$B.enter_frame = function(frame){
    // Enter execution frame : save on top of frames stack
    if($B.frames_stack.length > 1000){
        var exc = _b_.RecursionError.$factory("maximum recursion depth exceeded")
        $B.set_exc(exc)
        throw exc
    }
    frame.__class__ = $B.frame
    $B.frames_stack.push(frame)
    if($B.tracefunc && $B.tracefunc !== _b_.None){
        if(frame[4] === $B.tracefunc ||
                ($B.tracefunc.$infos && frame[4] &&
                 frame[4] === $B.tracefunc.$infos.__func__)){
            // to avoid recursion, don't run the trace function inside itself
            $B.tracefunc.$frame_id = frame[0]
            return _b_.None
        }else{
            // also to avoid recursion, don't run the trace function in the
            // frame "below" it (ie in functions that the trace function
            // calls)
            for(var i = $B.frames_stack.length - 1; i >= 0; i--){
                if($B.frames_stack[i][0] == $B.tracefunc.$frame_id){
                    return _b_.None
                }
            }
            try{
                return $B.tracefunc($B.last($B.frames_stack), 'call', _b_.None)
            }catch(err){
                $B.set_exc(err)
                $B.frames_stack.pop()
                err.$in_trace_func = true
                throw err
            }
        }
    }else{
        $B.tracefunc = _b_.None
    }
    return _b_.None
}

$B.trace_exception = function(){
    var frame = $B.last($B.frames_stack)
    if(frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = frame[1].$f_trace,
        exc = frame[1].$current_exception,
        frame_obj = $B.last($B.frames_stack)
    return trace_func(frame_obj, 'exception', $B.fast_tuple([
        exc.__class__, exc, $B.traceback.$factory(exc)]))
}

$B.trace_line = function(){
    var frame = $B.last($B.frames_stack)
    if(frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = frame[1].$f_trace,
        frame_obj = $B.last($B.frames_stack)
    return trace_func(frame_obj, 'line', _b_.None)
}

$B.trace_return = function(value){
    var frame = $B.last($B.frames_stack),
        trace_func = frame[1].$f_trace,
        frame_obj = $B.last($B.frames_stack)
    if(frame[0] == $B.tracefunc.$current_frame_id){
        // don't call trace func when returning from the frame where
        // sys.settrace was called
        return _b_.None
    }
    trace_func(frame_obj, 'return', value)
}

$B.leave_frame = function(arg){
    // Leave execution frame
    if($B.frames_stack.length == 0){
        //console.log("empty stack");
        return
    }

    // When leaving a module, arg is set as an object of the form
    // {$locals, value: _b_.None}
    if(arg && arg.value !== undefined && $B.tracefunc){
        if($B.last($B.frames_stack)[1].$f_trace === undefined){
            $B.last($B.frames_stack)[1].$f_trace = $B.tracefunc
        }
        if($B.last($B.frames_stack)[1].$f_trace !== _b_.None){
            $B.trace_return(arg.value)
        }
    }
    var frame = $B.frames_stack.pop()
    // For generators in locals, if their execution frame has context
    // managers, close them. In standard Python this happens when the
    // generator is garbage-collected.
    for(var key in frame[1]){
        if(! key.startsWith('$')){
            if(frame[1][key] && frame[1][key].__class__ === $B.generator){
                var gen = frame[1][key]
                if(gen.$frame === undefined){
                    continue
                }
                var ctx_managers = gen.$frame[1].$context_managers
                if(ctx_managers){
                    for(var cm of ctx_managers){
                        $B.$call($B.$getattr(cm, '__exit__'))(
                            _b_.None, _b_.None, _b_.None)
                    }
                }
            }
        }
    }
    frame[1].$current_exception = undefined
    return _b_.None
}

var min_int = Math.pow(-2, 53),
    max_int = Math.pow(2, 53) - 1

$B.is_safe_int = function(arg){
    return typeof arg == "number" &&
           Number.isSafeInteger(arg)
}

$B.add = function(x, y){
    return $B.rich_op('__add__', x, y)
}

$B.mul = function(x, y){
    return $B.rich_op('__mul__', x, y)
}

$B.sub = function(x, y){
    return $B.rich_op('__sub__', x, y)
}

$B.eq = function(x, y){
    if(Number.isSafeInteger(x) && Number.isSafeInteger(y)){
        return x == y
    }
    return $B.long_int.__eq__($B.long_int.$factory(x), $B.long_int.$factory(y))
}

$B.floordiv = function(x, y){
    var z = x / y
    if(Number.isSafeInteger(x) &&
            Number.isSafeInteger(y) &&
            Number.isSafeInteger(z)){
        return Math.floor(z)
    }else{
        return $B.long_int.__floordiv__($B.long_int.$factory(x),
            $B.long_int.$factory(y))
    }
}

// greater or equal
$B.ge = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x >= y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__ge__(x, y)}
}
$B.gt = function(x, y){
    if(typeof x == "number" && typeof y == "number"){return x > y}
    // a safe int is >= to a long int if the long int is negative
    else if(typeof x == "number" && typeof y != "number"){return ! y.pos}
    else if(typeof x != "number" && typeof y == "number"){
        return x.pos === true
    }else{return $B.long_int.__gt__(x, y)}
}

var reversed_op = {"__lt__": "__gt__", "__le__":"__ge__",
    "__gt__": "__lt__", "__ge__": "__le__"}
var method2comp = {"__lt__": "<", "__le__": "<=", "__gt__": ">",
    "__ge__": ">="}

$B.rich_comp = function(op, x, y){
    if(x === undefined){
        throw _b_.RuntimeError.$factory('error in rich comp')
    }
    var x1 = x.valueOf ? x.valueOf() : x,
        y1 = y.valueOf ? y.valueOf() : y
    if(typeof x1 == "number" && typeof y1 == "number" &&
            x.__class__ === undefined && y.__class__ === undefined){
        switch(op){
            case "__eq__":
                return x1 == y1
            case "__ne__":
                return x1 != y1
            case "__le__":
                return x1 <= y1
            case "__lt__":
                return x1 < y1
            case "__ge__":
                return x1 >= y1
            case "__gt__":
                return x1 > y1
        }
    }
    var res

    if(x.$is_class || x.$factory) {
        if(op == "__eq__"){
            return (x === y)
        }else if(op == "__ne__"){
            return !(x === y)
        }else{
            throw _b_.TypeError.$factory("'" + method2comp[op] +
                "' not supported between instances of '" + $B.class_name(x) +
                "' and '" + $B.class_name(y) + "'")
        }
    }

    var x_class_op = $B.$call($B.$getattr(x.__class__ || $B.get_class(x), op)),
        rev_op = reversed_op[op] || op
    if(x.__class__ && y.__class__){
        // cf issue #600 and
        // https://docs.python.org/3/reference/datamodel.html :
        // "If the operands are of different types, and right operand's type
        // is a direct or indirect subclass of the left operand's type, the
        // reflected method of the right operand has priority, otherwise the
        // left operand's method has priority."
        if(y.__class__.__mro__.indexOf(x.__class__) > -1){
            var rev_func = $B.$getattr(y, rev_op)
            res = $B.$call($B.$getattr(y, rev_op))(x)
            if(res !== _b_.NotImplemented){
                return res
            }
        }
    }

    res = x_class_op(x, y)
    if(res !== _b_.NotImplemented){
        return res
    }
    var y_class_op = $B.$call($B.$getattr(y.__class__ || $B.get_class(y),
        rev_op))
    res = y_class_op(y, x)
    if(res !== _b_.NotImplemented ){
        return res
    }

    // If both operands return NotImplemented, return False if the operand is
    // __eq__, True if it is __ne__, raise TypeError otherwise
    if(op == "__eq__"){
        return _b_.False
    }else if(op == "__ne__"){
        return _b_.True
    }

    throw _b_.TypeError.$factory("'" + method2comp[op] +
        "' not supported between instances of '" + $B.class_name(x) +
        "' and '" + $B.class_name(y) + "'")
}

var opname2opsign = {__sub__: "-", __xor__: "^", __mul__: "*"}

$B.rich_op = function(op, x, y, position){
    try{
        return $B.rich_op1(op, x, y)
    }catch(exc){
        if(position){
            $B.set_exception_offsets(exc, position)
        }
        throw exc
    }
}

$B.rich_op1 = function(op, x, y){
    // shortcuts
    var res_is_int,
        res_is_float,
        x_num,
        y_num
    if(typeof x == "number"){
        x_num = x
        if(typeof y == "number"){
            res_is_int = true
            y_num = y
        }else if(y.__class__ === _b_.float){
            res_is_float = true
            y_num = y.value
        }
    }else if(x.__class__ === _b_.float){
        x_num = x.value
        if(typeof y == "number"){
            y_num = y
            res_is_float = true
        }else if(y.__class__ === _b_.float){
            res_is_float = true
            y_num = y.value
        }
    }
    if(res_is_int || res_is_float){
        var z
        switch(op){
            case "__add__":
                z = x_num + y_num
                break
            case "__sub__":
                z = x_num - y_num
                break
            case "__mul__":
                z = x_num * y_num
                break
            case '__pow__':
                if(res_is_int && y_num >= 0){
                    return _b_.int.$int_or_long(BigInt(x_num) ** BigInt(y_num))
                }
                break
            case "__truediv__":
                if(y_num == 0){
                    throw _b_.ZeroDivisionError.$factory("division by zero")
                }
                // always returns a float
                z = x_num / y_num
                return {__class__: _b_.float, value: z}
        }
        if(z){
            if(res_is_int && Number.isSafeInteger(z)){
                return z
            }else if(res_is_float){
                return {__class__: _b_.float, value: z}
            }
        }
    }else if(typeof x == "string" && typeof y == "string" && op == "__add__"){
        return x + y
    }

    var x_class = x.__class__ || $B.get_class(x),
        y_class = y.__class__ || $B.get_class(y),
        rop = '__r' + op.substr(2),
        method
    if(x_class === y_class){
        // For objects of the same type, don't try the reversed operator
        if(x_class === _b_.int){
            return _b_.int[op](x, y)
        }else if(x_class === _b_.bool){
            return (_b_.bool[op] || _b_.int[op])
                (x, y)
        }
        try{
            method = $B.$call($B.$getattr(x_class, op))
        }catch(err){
            if(err.__class__ === _b_.AttributeError){
                var kl_name = $B.class_name(x)
                throw _b_.TypeError.$factory("unsupported operand type(s) " +
                    "for " + opname2opsign[op] + ": '" + kl_name + "' and '" +
                    kl_name + "'")
            }
            throw err
        }
        return method(x, y)
    }

    if(_b_.issubclass(y_class, x_class)){
        // issue #1686
        var reflected_left = $B.$getattr(x_class, rop, false),
            reflected_right = $B.$getattr(y_class, rop, false)
        if(reflected_right && reflected_left &&
                reflected_right !== reflected_left){
            return reflected_right(y, x)
        }
    }
    var res
    try{
        // Test if object has attribute op. If so, it is not used in the
        // operation, but the attribute op of its class, if is exits
        // This prevents a + b to succeed if the instance a has __add__
        // but its class has no __add__
        // It also prevents a | b to succeed if getattr(a, op) fails
        // although getattr(type(a), op) succeeds, which is the case for
        // [1] | 'a' : getattr(list, '__or__') succeeds because type.__or__ is
        // defined, but hasattr([1], '__or__') is False
        var attr = $B.$getattr(x, op)
        method = $B.$getattr(x_class, op)
    }catch(err){
        if(err.__class__ !== _b_.AttributeError){
            throw err
        }
        res = $B.$call($B.$getattr(y, rop))(x)
        if(res !== _b_.NotImplemented){
            return res
        }
        throw _b_.TypeError.$factory(
            `unsupported operand type(s) for ${$B.method_to_op[op]}:` +
            ` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)
    }
    res = method(x, y)
    if(res === _b_.NotImplemented){
        try{
            var reflected = $B.$getattr(y, rop),
                method = $B.$getattr(y_class, rop)
        }catch(err){
            if(err.__class__ !== _b_.AttributeError){
                throw err
            }
            throw _b_.TypeError.$factory(
                `unsupported operand type(s) for ${$B.method_to_op[op]}:` +
                ` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)
        }
        res = method(y, x)
        if(res === _b_.NotImplemented){
            throw _b_.TypeError.$factory(
                `unsupported operand type(s) for ${$B.method_to_op[op]}:` +
                ` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)
        }
        return res
    }else{
        return res
    }
}

$B.is_none = function(o){
    return o === undefined || o === null || o == _b_.None
}

// used to detect recursion in repr() / str() of lists and dicts
var repr_stack = new Set()

$B.repr = {
    enter: function(obj){
        if(repr_stack.has(obj)){
            return true
        }else{
            repr_stack.add(obj)
            if(repr_stack.size > $B.recursion_limit){
                throw _b_.RecursionError.$factory("maximum recursion depth " +
                    "exceeded while getting the repr of an object")
            }
        }
    },
    leave: function(obj){
        repr_stack.delete(obj)
    }
}

})(__BRYTHON__)
