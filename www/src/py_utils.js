"use strict";
;(function($B){

var _b_ = $B.builtins,
    _window = globalThis,
    isWebWorker = ('undefined' !== typeof WorkerGlobalScope) &&
            ("function" === typeof importScripts) &&
            (navigator instanceof WorkerNavigator)

function missing_required_kwonly(fname, args){
    var plural = args.length == 1 ? '' : 's',
        arg_list
    args = args.map(x => `'${x}'`)
    if(args.length == 1){
        arg_list = args[0]
    }else if(args.length == 2){
        arg_list = args[0] + ' and ' + args[1]
    }else{
        arg_list = args.slice(0, args.length - 1).join(', ') + ', and ' +
            args[args.length - 1]
    }
    $B.RAISE(_b_.TypeError, fname + '() ' +
        `missing ${args.length} required keyword-only argument${plural}: ` +
        arg_list)
}

function missing_required_pos(fname, args){
    var plural = args.length == 1 ? '' : 's',
        arg_list
    args = args.map(x => `'${x}'`)
    if(args.length == 1){
        arg_list = args[0]
    }else if(args.length == 2){
        arg_list = args[0] + ' and ' + args[1]
    }else{
        arg_list = args.slice(0, args.length - 1).join(', ') + ', and ' +
            args[args.length - 1]
    }
    $B.RAISE(_b_.TypeError, fname + '() ' +
        `missing ${args.length} required positional argument${plural}: ` +
        arg_list)
}

function multiple_values(fname, arg){
    $B.RAISE(_b_.TypeError, fname + '() ' +
        `got multiple values for argument '${arg}'`)
}

function pos_only_passed_as_keyword(fname, arg){
    return $B.EXC(_b_.TypeError, fname +
        `() got some positional-only arguments passed as keyword arguments:` +
        ` '${arg}'`)
}

function too_many_pos_args(fname, kwarg, arg_names, nb_kwonly, defaults, args, slots){
    var nb_pos = args.length,
        last = $B.last(args)
    if(last !== null && last !== undefined && last.$kw){
        // Unexpected keyword args take precedence
        if(! kwarg){
            var kw = $B.parse_kwargs(last.$kw, fname)
            for(var k in kw){
                if(! slots.hasOwnProperty(k)){
                    var suggestion = $B.offer_suggestions_for_unexpected_keyword_error(arg_names, k)
                    throw unexpected_keyword(fname, k, suggestion)
                }
            }
        }
        nb_pos--
    }
    var nb_def = defaults.length
    var expected = arg_names.length - nb_kwonly,
        plural = expected == 1 ? '' : 's'
    if(nb_def){
        expected = `from ${expected - nb_def} to ${expected}`
        plural = 's'
    }
    var verb = nb_pos == 1 ? 'was' : 'were'
    return $B.EXC(_b_.TypeError, fname + '() takes ' +
        `${expected} positional argument${plural} but ${nb_pos} ${verb} given`)
}

function unexpected_keyword(fname, k, suggestion){
    var msg = `${fname}() got an unexpected keyword argument '${k}'`
    if(suggestion !== _b_.None){
        msg += `. Did you mean: '${suggestion}'?`
    }
    return $B.EXC(_b_.TypeError, msg)
}

var empty = {}


// Original args0 used to construct error message when raising an exception.
function args0(f, args){

    // Called by user-defined functions / methods
    var arg_names = f.$infos.arg_names,
        code = f.$infos.__code__,
        slots = {}
    for(var arg_name of arg_names){
        slots[arg_name] = empty
    }

    return $B.parse_args(
        args, f.$infos.__name__, code.co_argcount, slots,
        arg_names, f.$infos.__defaults__, f.$infos.__kwdefaults__,
        f.$infos.vararg, f.$infos.kwarg,
        code.co_posonlyargcount, code.co_kwonlyargcount)
}

// My new implementation of argument parsing.
// Should be faster and can still be improved by precomputing values and changing how it is called (see comments).
// Some conditions can be removed if functions had different functions to parse their arguments depending on their parameters (see comments).
// Currently, I let the original args0 function handle the construction of the exception when I detect an error.
// Notation :
// - params = in the function declaration.
// - args   = in the function call.
function args0_NEW(fct, args) {

    // Last argument should either be "null" or named arguments "[{}, ...]".
    // This enables to remove the strange "{$kw:[{}, ...]}" structure.
    // Below a way to convert the currently passed arguments to the format I use.
    // If you don't want to change it, I can modify the code to remove the costly convertion.
    /**/
    //const args = _args; // should remove this line...
    const LAST_ARGS = args[args.length-1];
    const HAS_KW = LAST_ARGS !== undefined && LAST_ARGS !== null && LAST_ARGS.$kw !== undefined;
    let ARGS_POS_COUNT = args.length,
        ARGS_NAMED = null;

    if(HAS_KW){
        --ARGS_POS_COUNT
        ARGS_NAMED = LAST_ARGS.$kw
    }

    const result = {}

    // using const should enable the browser to perform some optimisation.
    const $INFOS = fct.$infos,
          $CODE  = $INFOS.__code__,

          PARAMS_NAMES        = $INFOS.arg_names,
          PARAMS_POS_COUNT    = $CODE.co_argcount,
          PARAMS_NAMED_COUNT  = $CODE.co_kwonlyargcount,

          PARAMS_VARARGS_NAME = $INFOS.vararg,
          PARAMS_KWARGS_NAME  = $INFOS.kwarg,

          PARAMS_POS_DEFAULTS = $INFOS.__defaults__,
          PARAMS_POS_DEFAULTS_COUNT = PARAMS_POS_DEFAULTS.length,

          PARAMS_POS_DEFAULTS_OFFSET= PARAMS_POS_COUNT - PARAMS_POS_DEFAULTS_COUNT

    // process positional arguments => positional parameters...
    const min = Math.min(ARGS_POS_COUNT, PARAMS_POS_COUNT)

    let offset = 0
    for(; offset < min; ++offset){
        result[PARAMS_NAMES[offset]] = args[offset]
    }
    // process positional arguments => vargargs parameters...
    if( PARAMS_VARARGS_NAME !== null ){
        // can be speed up if arguments is an array in the first place
        // TODO: opti, better way to construct tuple from subarray ?
        result[PARAMS_VARARGS_NAME] = $B.fast_tuple(
            Array.prototype.slice.call(args, PARAMS_POS_COUNT, ARGS_POS_COUNT ) );
        // maybe there is a faster way to build a tuple from a subset of an array.
    }else if( ARGS_POS_COUNT > PARAMS_POS_COUNT){
        args0(fct, args)
        throw new Error('Too much positional arguments given (args0 should have raised an error) !')
    }

    // if no named arguments has been given...
    if(ARGS_NAMED === null){

        // Handle default positional parameters...
        if(offset < PARAMS_POS_DEFAULTS_OFFSET){
            args0(fct, args)
            throw new Error('Not enough positional arguments given (args0 should have raised an error) !')
        }

        for(let i = offset - PARAMS_POS_DEFAULTS_OFFSET;
                i < PARAMS_POS_DEFAULTS_COUNT;
                ++i){
            result[PARAMS_NAMES[offset++]] = PARAMS_POS_DEFAULTS[i]
        }
        // Handle kwargs parameters...
        if(PARAMS_KWARGS_NAME !== null){
            result[PARAMS_KWARGS_NAME] = $B.empty_dict()
        }
        // Shortcut : no named parameters.
        if( PARAMS_NAMED_COUNT === 0 ){
            return result
        }

        // Handle defaults value for named parameters.
        // Optimize: precompute the number of named parameters with a default value, or just a boolean ?

        const kwargs_defaults_values = fct.$kwdefaults_values;
        const nb_named_defaults = kwargs_defaults_values.length;

        if(nb_named_defaults < PARAMS_NAMED_COUNT){
            args0(fct, args)
            throw new Error('Named argument expected (args0 should have raised an error) !')
        }

        for(let i = 0; i < nb_named_defaults; ++i){
            result[PARAMS_NAMES[offset++]] = kwargs_defaults_values[i]
        }

        return result
    }

    const kwargs_defaults = fct.$kwdefaults;

    // Construct the list of default values...
    // Optimize : I'd need an object containing ALL default values instead of
    // having to build one...
    // If not done, I can work on it to remove the construction of this object
    // (which cost a little).
    // Note: I should exclude posonly default parameters... (we don't need
    // them as remaining positional only parameters'd be consumed next)

    // Consume remaining positional only parameters (no positional arguments
    // given, so expect default value).
    const PARAMS_POSONLY_COUNT = $CODE.co_posonlyargcount;

    if(offset < PARAMS_POSONLY_COUNT){
        if(offset < PARAMS_POS_DEFAULTS_OFFSET){
            args0(fct, args)
            throw new Error('Not enough positional parameters given (args0 should have raised an error) !')
        }

        const max = PARAMS_POS_DEFAULTS_COUNT -
                        (PARAMS_POS_COUNT - PARAMS_POSONLY_COUNT)

        // default parameters
        for(let i = offset - PARAMS_POS_DEFAULTS_OFFSET;
                i < max;
                ++i){
            result[PARAMS_NAMES[offset++]] = PARAMS_POS_DEFAULTS[i]
        }
    }

    // No **kwargs parameter (i.e. unknown name = error).
    if(PARAMS_KWARGS_NAME === null){
        let nb_named_args = 0;

        let kargs = ARGS_NAMED[0];

        for(let argname in kargs) {
        result[ argname ] = kargs[argname]
        ++nb_named_args
    }

        for(let id = 1, len = ARGS_NAMED.length; id < len; ++id){

            kargs = ARGS_NAMED[id];
            for(let argname of $B.make_js_iterator($B.$getattr(kargs.__class__, "keys")(kargs)) ) {

                if( typeof argname !== "string") {
            $B.args0_old(fct, args);
            throw new Error('Non string key passed in **kargs');
        }

                result[ argname ] = $B.$getitem(kargs, argname);
                ++nb_named_args
            }
        }

        let found = 0
        let ioffset = offset
        for( ; ioffset < PARAMS_POS_DEFAULTS_OFFSET; ++ioffset) {
            const key = PARAMS_NAMES[ioffset]
            if( key in result ){ // maybe could be speed up using "!(key in result)"
                continue
            }
            args0(fct, args)
            throw new Error('Missing a named arguments (args0 should have raised an error) !')
        }
        for( ; ioffset < PARAMS_POS_COUNT; ++ioffset){
            const key = PARAMS_NAMES[ioffset]
            if(key in result){
                continue
            }
            result[key] = PARAMS_POS_DEFAULTS[ioffset - PARAMS_POS_DEFAULTS_OFFSET]
            ++found
        }
        for( ; ioffset < PARAMS_NAMES.length; ++ioffset){
            const key = PARAMS_NAMES[ioffset]
            if( key in result ){
                continue
            }
            if(! kwargs_defaults.has(key) ){
                args0(fct, args)
                throw new Error('Missing a named arguments (args0 should have raised an error) !');
            }

            result[key] = kwargs_defaults.get(key)
            ++found
        }

        // PARAMS_NAMES.length - offset = the number of expected named arguments.
        // found + nb_named_args = the number of given named arguments + the
        // number of named arguments we found a default value for.
        // If they aren't equal, we either gave several times the same
        // argument or gave an inexisting name.
        if(found + nb_named_args !== PARAMS_NAMES.length - offset){
            args0(fct, args)
            throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !')
        }

        return result
    }

    // With **kwargs parameter (i.e. unknown name = put in extra).
    const extra = {};
    const HAS_PARAMS = fct.$hasParams;

    // we count the number of arguments given to normal named parameters and the number given to **kwargs.
    let nb_named_args = 0
    let nb_extra_args = 0

        let kargs = ARGS_NAMED[0];
    for(let argname in kargs) {

        if( HAS_PARAMS.has(argname) ) {
            result[ argname ] = kargs[argname]
            ++nb_named_args
        }else{
                extra[ argname ] = kargs[argname]
                ++nb_extra_args
        }
    }

    for(let id = 1, len = ARGS_NAMED.length; id < len; ++id){

            kargs = ARGS_NAMED[id];
        for(let argname of $B.make_js_iterator( $B.$getattr(kargs.__class__, "keys")(kargs) ) ) {

            if( typeof argname !== "string") {
            $B.args0_old(fct, args);
            throw new Error('Non string key passed in **kargs');
        }

        if( HAS_PARAMS.has(argname) ){
            result[ argname ] = $B.$getitem(kargs, argname);
            ++nb_named_args
        }else{
                extra[ argname ] = $B.$getitem(kargs, argname);
                ++nb_extra_args
        }
        }
    }

    // Same as "No **kwargs parameter".
    // Checks default values...
    // What is quicker ? An object or 1 array of name (with indexOf) and 1 array of values ?
    let found = 0
    let ioffset = offset
    for( ; ioffset < PARAMS_POS_DEFAULTS_OFFSET; ++ioffset){
        const key = PARAMS_NAMES[ioffset]
        if(key in result){ // maybe could be speed up using "!(key in result)"
            continue
        }
        args0(fct, args)
        throw new Error('Missing a named arguments (args0 should have raised an error) !')
    }
    for( ; ioffset < PARAMS_POS_COUNT; ++ioffset){
        const key = PARAMS_NAMES[ioffset]
        if(key in result){
            continue
        }
        result[key] = PARAMS_POS_DEFAULTS[ioffset - PARAMS_POS_DEFAULTS_OFFSET]
        ++found
    }
    for( ; ioffset < PARAMS_NAMES.length; ++ioffset){
        const key = PARAMS_NAMES[ioffset]
        if( key in result ){
            continue
        }
        if(! kwargs_defaults.has(key) ){
            args0(fct, args)
            throw new Error('Missing a named arguments (args0 should have raised an error) !')
        }
        result[key] = kwargs_defaults.get(key)
        ++found
    }

    // Same as "No **kwargs parameter".
    // PARAMS_NAMES.length - offset = the number of expected named arguments.
    // found + nb_named_args = the number of given named arguments + the
    // number of named arguments we found a default value for.
    // If they aren't equal, we either gave several times the same argument or
    // gave an inexisting name.

    if(found + nb_named_args !== PARAMS_NAMES.length - offset){
        args0(fct, args)
        throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !')
    }

    // verify if the number of extra arguments (**kargs) found matches the
    // numbers of elements in extra.
    // if not, it means that the same name has been given several times.
    if(Object.keys(extra).length !== nb_extra_args){
        args0(fct, args)
        throw new Error('Duplicate name given to **kargs parameter (args0 should have raised an error) !')
    }

    result[PARAMS_KWARGS_NAME] = _b_.dict.$from_js(extra)

    return result
}


$B.args0_old = args0;
$B.args0 = args0_NEW;

$B.args = function(fname, argcount, slots, var_names, args, $dobj,
                   vararg, kwarg, nb_posonly){
    // Called by built-in functions / methods
    var nb_posonly = nb_posonly || 0,
        nb_kwonly = var_names.length - argcount,
        defaults  = [],
        kwdefaults = {$jsobj: {}}
    for(var i = 0, len = var_names.length; i < len; i++){
        var var_name = var_names[i]
        if($dobj.hasOwnProperty(var_name)){
            if(i < argcount){
                defaults.push($dobj[var_name])
            }else{
                kwdefaults.$jsobj[var_name] = $dobj[var_name]
            }
        }
    }
    for(var k in slots){
        slots[k] = empty
    }
    return $B.parse_args(args, fname, argcount, slots, var_names, defaults,
                    kwdefaults, vararg, kwarg, nb_posonly, nb_kwonly)
}

$B.single_arg = function(fname, arg, args){
    var slots = {}
    slots[arg] = null
    var $ = $B.args(fname, 1, slots, [arg], args, {}, null, null)
    return $[arg]
}

$B.parse_args = function(args, fname, argcount, slots, arg_names, defaults,
                    kwdefaults, vararg, kwarg, nb_posonly, nb_kwonly){
    // Algorithm to parse the arguments ("args") for the function with the
    // specified name, argcount etc.
    // "slots" is a JS object initialized with keys = function named
    // parameters, values set to the object `empty` (argument values could be
    // Javascript `undefined` or `null`)
    // Returns "slots" filled with the arguments passed to the function +
    // tuple if vararg is set + dict if kwarg is set
    var nb_passed = args.length,
        nb_passed_pos = nb_passed, // nb_passed - 1 if there are keyword args
        nb_expected = arg_names.length,
        nb_pos_or_kw = nb_expected - nb_kwonly,
        posonly_set = {},
        nb_def = defaults.length,
        varargs = [],
        extra_kw = {},
        kw

    // Handle arguments passed to the function
    for(var i = 0; i < nb_passed; i++){
        var arg = args[i]
        if(arg && arg.__class__ === $B.generator){
            slots.$has_generators = true
        }
        if(arg && arg.$kw){
            // function was called with keyword arguments
            nb_passed_pos--
            kw = $B.parse_kwargs(arg.$kw, fname)
        }else{
            var arg_name = arg_names[i]
            if(arg_name !== undefined){
                if(i >= nb_pos_or_kw){
                    if(vararg){
                        varargs.push(arg)
                    }else{
                        throw too_many_pos_args(
                            fname, kwarg, arg_names, nb_kwonly, defaults,
                            args, slots)
                    }
                }else{
                    if(i < nb_posonly){
                        posonly_set[arg_name] = true
                    }
                    slots[arg_name] = arg
                }
            }else if(vararg){
                varargs.push(arg)
            }else{
                throw too_many_pos_args(
                    fname, kwarg, arg_names, nb_kwonly, defaults, args, slots)
            }
        }
    }

    // Remaining expected positional or keyword parameters: are they passed in
    // keywords, or do they have a default value ?
    for(var j = nb_passed_pos; j < nb_pos_or_kw; j++){
        var arg_name = arg_names[j]
        if(kw && kw.hasOwnProperty(arg_name)){
            // value passed in keywords
            if(j < nb_posonly){
                // positional-only argument name is found in keyword args; it
                // might have a default value; in this case, (A) if there is a
                // **kwargs, the keyword arg is put in kwargs (B) otherwise an
                // exception is raised.
                //
                // Example :
                //     def f(x='a', /, **kwargs):
                //         assert x == 'a'
                //         assert kwargs['x'] == 'b'
                //
                //     f(x='b')
                //
                // Case (B) is handled here, case (A) later in the code, after
                // looking for a default value
                if(! kwarg){
                    throw pos_only_passed_as_keyword(fname, arg_name)
                }
            }else{
                slots[arg_name] = kw[arg_name]
                kw[arg_name] = empty
            }
        }
        if(slots[arg_name] === empty){
            // search in defaults
            var def_value = defaults[j - (nb_pos_or_kw - nb_def)]
            if(def_value !== undefined){
                slots[arg_name] = def_value
                if(j < nb_posonly){
                    // Cf. comment above, case (A)
                    if(kw && kw.hasOwnProperty(arg_name) && kwarg){
                        extra_kw[arg_name] = kw[arg_name]
                        kw[arg_name] = empty
                    }
                }
            }else{
                var missing_pos = arg_names.slice(j, nb_pos_or_kw - nb_def)
                throw missing_required_pos(fname, missing_pos)
            }
        }
    }

    // expected kw-only parameters
    var missing_kwonly = []
    for(var i = nb_pos_or_kw; i < nb_expected; i++){
        var arg_name = arg_names[i]
        if(kw && kw.hasOwnProperty(arg_name)){
            slots[arg_name] = kw[arg_name]
            kw[arg_name] = empty
        }else{
            var kw_def = _b_.dict.$get_string(kwdefaults, arg_name)
            if(kw_def !== _b_.dict.$missing){
                slots[arg_name] = kw_def
            }else{
                missing_kwonly.push(arg_name)
            }
        }
    }

    if(missing_kwonly.length > 0){
        throw missing_required_kwonly(fname, missing_kwonly)
    }

    if(! kwarg){
        for(var k in kw){
            if(! slots.hasOwnProperty(k)){
                var suggestion = $B.offer_suggestions_for_unexpected_keyword_error(
                    arg_names, k)
                throw unexpected_keyword(fname, k, suggestion)
            }
        }
    }

    // keyword arguments not handled in previous steps
    for(var k in kw){
        if(kw[k] === empty){
            continue
        }
        if(! slots.hasOwnProperty(k)){
            if(kwarg){
                extra_kw[k] = kw[k]
            }
        }else if(slots[k] !== empty){
            if(posonly_set[k] && kwarg){
                // a keyword arg has the same name as a posonly arg and
                // function has **kwarg: put key/value in kwarg
                // Cf. issue 2167
                extra_kw[k] = kw[k]
            }else{
                throw multiple_values(fname, k)
            }
        }else{
            slots[k] = kw[k]
        }
    }

    if(kwarg){
        slots[kwarg] = _b_.dict.$from_js(extra_kw)
    }
    if(vararg){
        slots[vararg] = $B.fast_tuple(varargs)
    }

    return slots
}



$B.parse_kwargs = function(kw_args, fname){
    var kwa = kw_args[0]
    for(var i = 1, len = kw_args.length; i < len; i++){
        var kw_arg = kw_args[i],
            key,
            value
        if(kw_arg.__class__ === _b_.dict){
            for(var entry of _b_.dict.$iter_items(kw_arg)){
                key = entry.key
                if(typeof key !== 'string'){
                    $B.RAISE(_b_.TypeError, fname +
                        "() keywords must be strings")
                }else if(kwa[key] !== undefined){
                    $B.RAISE(_b_.TypeError, fname +
                        "() got multiple values for argument '" +
                        key + "'")
                }else{
                    kwa[key] = entry.value
                }
            }
        }else{
            // For arguments passed as **kw, kw is just expected to have keys()
            // and __getitem__()
            var cls = $B.get_class(kw_arg)
            try{
                var keys_method = $B.$call1($B.$getattr(cls, 'keys'))
            }catch(err){
                $B.RAISE(_b_.TypeError, `${fname} argument ` +
                    `after ** must be a mapping, not ${$B.class_name(kw_arg)}`)
            }
            var keys_iter = $B.make_js_iterator(keys_method(kw_arg)),
                getitem
            for(var k of keys_iter){
                if(typeof k !== "string"){
                    $B.RAISE(_b_.TypeError, fname +
                        "() keywords must be strings")
                }
                if(kwa[k] !== undefined){
                    $B.RAISE(_b_.TypeError, fname +
                        "() got multiple values for argument '" +
                        k + "'")
                }
                if(! getitem){
                    try{
                        getitem = $B.$getattr(cls, '__getitem__')
                    }catch(err){
                        $B.RAISE(_b_.TypeError,
                            `'${$B.class_name(kw_arg)}' object is not subscriptable`)
                    }
                }
                kwa[k] = getitem(kw_arg, k)
            }
        }
    }
    return kwa
}

$B.check_nb_args = function(name, expected, args){
    // Check the number of arguments
    var len = args.length,
        last = args[len - 1]
    if(last && last.$kw){
        var kw = last.$kw
        if(kw[1]){
            if(_b_.len(kw[1]) == 0){
                len--
            }
        }
    }
    if(len != expected){
        if(expected == 0){
            $B.RAISE(_b_.TypeError, name + "() takes no argument" +
                " (" + len + " given)")
        }else{
            $B.RAISE(_b_.TypeError, name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + len + " given)")
        }
    }
}

$B.check_no_kw = function(name, x, y){
    // Throw error if one of x, y is a keyword argument
    if((x.$kw && x.$kw[0] && Object.keys(x.$kw[0]).length > 0) ||
            (y !== undefined && y.$kw)){
        $B.RAISE(_b_.TypeError, name + "() takes no keyword arguments")}
}

$B.check_nb_args_no_kw = function(name, expected, args){
    // Check the number of arguments and absence of keyword args
    var len = args.length,
        last = args[len - 1]
    if(last && last.$kw){
        if(last.$kw.length == 2 && Object.keys(last.$kw[0]).length == 0){
            len--
        }else{
            $B.RAISE(_b_.TypeError, name + "() takes no keyword arguments")
        }
    }
    if(len != expected){
        if(expected == 0){
            $B.RAISE(_b_.TypeError, name + "() takes no argument" +
                " (" + len + " given)")
        }else{
            $B.RAISE(_b_.TypeError, name + "() takes exactly " +
                expected + " argument" + (expected < 2 ? '' : 's') +
                " (" + len + " given)")
        }
    }
}

$B.check_annotate_format = function(format){
    if(! $B.$isinstance(format, _b_.int)){
        $B.RAISE(_b_.TypeError, '__annotate__ argument should be ' +
            `int, not ${$B.class_name(format)}`)
    }
    if(format != 1 && format != 2){
        $B.RAISE(_b_.NotImplementedError, '')
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
    var klass = obj.__class__ || obj.$tp_class
    if(klass === undefined){
        switch(typeof obj){
            case "number":
                if(Number.isInteger(obj)){
                    return _b_.int
                }
                break
            case "string":
                return _b_.str
            case "boolean":
                return _b_.bool
            case "function":
                if(! obj.$js_func){
                    // not a Javascript function or constructor
                    return $B.function
                }
            case "object":
                if(Array.isArray(obj)){
                    return $B.js_array
                }else if(obj instanceof $B.str_dict){
                    return _b_.dict
                }else if(typeof Node !== "undefined" // undefined in Web Workers
                        && obj instanceof Node){
                    if(obj.tagName){
                        return $B.imported['browser.html'][obj.tagName] ||
                                   $B.DOMNode
                    }
                    return $B.DOMNode
                }else if(obj instanceof Event){
                    return $B.DOMEvent
                }
                break
        }
    }
    if(klass === undefined){
        return $B.get_jsobj_class(obj)
    }
    return klass
}

$B.class_name = function(obj){
    var klass = $B.get_class(obj)
    if(klass === $B.JSObj){
        return 'Javascript ' + obj.constructor.name
    }else{
        return klass.__name__
    }
}

$B.unpack_mapping = function(func, obj){
    var items = []
    if($B.$isinstance(obj, _b_.dict)){
        for(var item of _b_.dict.$iter_items(obj)){
            if(! $B.$isinstance(item.key, _b_.str)){
                $B.RAISE(_b_.TypeError, 'keywords must be strings')
            }
            items.push(item)
        }
        return items
    }
    var klass = $B.get_class(obj)
    var getitem = $B.$getattr(klass, '__getitem__', null)
    if(getitem === null){
        $B.RAISE(_b_.TypeError, `'${$B.class_name(obj)}' object ` +
            'is not subscriptable')
    }
    getitem = $B.$call(getitem)
    var key_func = $B.$getattr(klass, 'keys', null)
    if(key_func === null){
        var f = `${func.$infos.__module__}.${func.$infos.__name__}`
        $B.RAISE(_b_.TypeError, `${f}() argument after **` +
            ` must be a mapping, not ${$B.class_name(obj)}`)
    }
    var keys = $B.$call($B.$getattr(klass, 'keys'))(obj)
    for(var key of $B.make_js_iterator(keys)){
        if(! $B.$isinstance(key, _b_.str)){
            $B.RAISE(_b_.TypeError, 'keywords must be strings')
        }
        items.push({key, value: getitem(obj, key)})
    }
    return items
}

$B.make_js_iterator = function(iterator, frame, lineno){
    // return a Javascript iterator usable in a loop
    // "for(item of $B.make_js_iterator(...)){"
    var set_lineno = $B.set_lineno
    if(frame === undefined){
        if(! $B.frame_obj){
            set_lineno = function(){
                // does nothing
            }
        }else{
            frame = $B.frame_obj.frame
            lineno = frame.$lineno
        }
    }
    if(iterator.__class__ === _b_.range){
        var obj = {ix: iterator.start}
        if(iterator.step > 0){
            return {
                [Symbol.iterator](){
                    return this
                },
                next(){
                    set_lineno(frame, lineno)
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
                    set_lineno(frame, lineno)
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

    if(iterator[Symbol.iterator] && ! iterator.$is_js_array){
        var it = iterator[Symbol.iterator]()
        return {
            [Symbol.iterator](){
                return this
            },
            next(){
                set_lineno(frame, lineno)
                return it.next()
            }
        }
    }
    // next_func is initialized as undefined; set_lineno() must be called
    // before it is initialized from the iterator
    var next_func = $B.$getattr(_b_.iter(iterator), '__next__', null)
    if(next_func !== null){
        next_func = $B.$call(next_func)
        return {
            [Symbol.iterator](){
                return this
            },
            next(){
                set_lineno(frame, lineno)
                try{
                    var value = next_func()
                    return {done: false, value}
                }catch(err){
                    if($B.is_exc(err, [_b_.StopIteration])){
                        return {done: true, value: null}
                    }
                    if(iterator.$inum){
                        $B.set_inum(iterator.$inum)
                    }
                    throw err
                }
            }
        }
    }
}

$B.unpacker = function(obj, nb_targets, has_starred){
    // Used in unpacking target of a "for" loop if it is a tuple or list
    // For "[a, b] = t", nb_targets is 2, has_starred is false
    // For "[a, *b, c]", nb_targets is 1 (a), has_starred is true (*b),
    // nb_after_starred is 1 (c)
    var inum_rank = 3
    if(has_starred){
        var nb_after_starred = arguments[3]
        inum_rank++
    }
    var inum = arguments[inum_rank]
    var t = _b_.list.$factory(obj),
        right_length = t.length,
        left_length = nb_targets + (has_starred ? nb_after_starred - 1 : 0)

    if((! has_starred && (right_length < nb_targets)) ||
            (has_starred && (right_length < nb_targets - 1))){
        $B.set_inum(inum)
        var exc = $B.EXC(_b_.ValueError, `not enough values to unpack ` +
            `(expected ${has_starred ? ' at least ' : ''} ` +
            `${left_length}, got ${right_length})`)
        throw exc
    }
    if((! has_starred) && right_length > left_length){
        var exc = $B.EXC(_b_.ValueError, "too many values to unpack " +
            `(expected ${left_length}, got ${right_length})`)
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
        return $B.$list(res)
    }
    return t
}

$B.set_lineno = function(frame, lineno, type){
    frame.$lineno = lineno
    if(frame.$f_trace !== _b_.None){
        $B.trace_line()
    }
    if(type){
        frame[type] = frame[type] || {}
        frame[type][lineno] = true
    }
    return true
}

$B.get_method_class = function(method, ns, qualname, refs){
    // Used to set the cell __class__ in a method. ns is the namespace
    // and qualname is the qualified name of the class
    // Generally, for qualname = "A.B", the result is just ns.A.B
    // In some cases, ns.A might not yet be defined (cf. issue #1740).
    // In this case, a fake class is returned with the same qualname.
    var klass = ns
    if(method.$function_infos && method.$function_infos[$B.func_attrs.method_class]){
        return method.$function_infos[$B.func_attrs.method_class]
    }
    for(var ref of refs){
        if(klass[ref] === undefined){
            return $B.make_class(qualname)
        }
        klass = klass[ref]
    }
    return klass
}


// warning
$B.warn = function(klass, message, filename, token){
    var warning = $B.EXC(klass, message)
    warning.filename = filename
    if(klass === _b_.SyntaxWarning){
        warning.lineno = token.lineno
        warning.offset = token.col_offset
        warning.end_lineno = token.end_lineno
        warning.end_offset = token.end_coloffset
        warning.text = token.line
        warning.args[1] = $B.fast_tuple([filename,
                                         warning.lineno, warning.offset,
                                         warning.text,
                                         warning.end_lineno,
                                         warning.end_offset])
    }
    $B.imported._warnings.warn(warning)
}

// assert
$B.assert = function(test, msg, inum){
    if(! $B.$bool(test)){
        var exc = $B.EXC(_b_.AssertionError, msg)
        $B.set_inum(inum)
        throw exc
    }
}

// get item
function index_error(obj){
    var type = typeof obj == "string" ? "string" : "list"
    return $B.EXC(_b_.IndexError, type + " index out of range")
}

$B.$getitem = function(obj, item, inum){
    try{
        return $B.$getitem1(obj, item)
    }catch(err){
        $B.set_inum(inum)
        throw err
    }
}

$B.$getitem1 = function(obj, item){
    var is_list = Array.isArray(obj) && obj.__class__ === _b_.list,
        is_dict = obj.__class__ === _b_.dict && ! obj.$jsobj
    if(typeof item == "number"){
        if(is_list || typeof obj == "string"){
            item = item >=0 ? item : obj.length + item
            if(obj[item] !== undefined){
                return obj[item]
            }else{
                throw index_error(obj)
            }
        }
    }else if(item.valueOf && typeof item.valueOf() == "string" && is_dict){
        return _b_.dict.$getitem(obj, item)
    }

    // PEP 560
    if(obj.$is_class){
        if(! Array.isArray(item)){
            item = $B.fast_tuple([item])
        }
        if(obj === _b_.type){
            return $B.$class_getitem(obj, item)
        }
        var class_gi = $B.$getattr(obj, "__class_getitem__", _b_.None)
        if(class_gi !== _b_.None){
            return $B.$call(class_gi)(item)
        }else if(obj.__class__){
            class_gi = $B.$getattr(obj.__class__, "__getitem__", _b_.None)
            if(class_gi !== _b_.None){
                return class_gi(obj, item)
            }else{
                $B.RAISE(_b_.TypeError, "type '" +
                    $B.$getattr(obj, '__qualname__') +
                    "' is not subscriptable")
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

    var exc = $B.EXC(_b_.TypeError, "'" + $B.class_name(obj) +
        "' object is not subscriptable")
    throw exc
}

$B.getitem_slice = function(obj, slice){
    var res
    if(Array.isArray(obj) && obj.__class__ === _b_.list){
        return _b_.list.$getitem(obj, slice)
    }else if(typeof obj == "string"){
        return _b_.str.__getitem__(obj, slice)
    }
    return $B.$getattr($B.get_class(obj), "__getitem__")(obj, slice)
}

$B.$getattr_pep657 = function(obj, attr, inum){
    try{
        return $B.$getattr(obj, attr)
    }catch(err){
        $B.set_inum(inum)
        throw err
    }
}

$B.$setitem = function(obj, item, value, inum){
    if(Array.isArray(obj) && obj.__class__ === undefined &&
            ! obj.$is_js_array &&
            typeof item == "number" &&
            ! $B.$isinstance(obj, _b_.tuple)){
        if(item < 0){
            item += obj.length
        }
        if(obj[item] === undefined){
            $B.set_inum(inum)
            $B.RAISE(_b_.IndexError, "list assignment index out of range")
        }
        obj[item] = value
        return
    }else if(obj.__class__ === _b_.dict){
        _b_.dict.$setitem(obj, item, value)
        return
    }else if(obj.__class__ === _b_.list){
        try{
            return _b_.list.$setitem(obj, item, value)
        }catch(err){
            if($B.is_exc(err, [_b_.IndexError])){
                $B.set_inum(inum)
            }
            throw err
        }
    }
    var si = $B.$getattr(obj.__class__ || $B.get_class(obj), "__setitem__",
        null)
    if(si === null || typeof si != 'function'){
        $B.set_inum(inum)
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(obj) +
            "' object does not support item assignment")
    }
    return si(obj, item, value)
}

$B.set_inum = function(inum){
    if(inum !== undefined && $B.frame_obj){
        $B.frame_obj.frame.inum = inum
    }
}

// item deletion
$B.$delitem = function(obj, item, inum){
    if(Array.isArray(obj) && obj.__class__ === _b_.list &&
            typeof item == "number" &&
            !$B.$isinstance(obj, _b_.tuple)){
        if(item < 0){
            item += obj.length
        }
        if(obj[item] === undefined){
            $B.set_inum(inum)
            $B.RAISE(_b_.IndexError, "list deletion index out of range")
        }
        obj.splice(item, 1)
        return
    }else if(obj.__class__ === _b_.dict){
        if(obj.$is_namespace){
            // Deleting a name from a namespace should trigger a NameError in
            // the next references to the name. Cf issue #2423.
            Object.defineProperty(obj.$jsobj, item,
                {
                    get(){
                        throw $B.name_error(item)
                    },
                    set(value){
                        // resetting a value in the namespace: redefine the
                        // property
                        Object.defineProperty(obj.$jsobj, item, {value})
                        return _b_.None
                    }
                }
            )
        }else{
            try{
                _b_.dict.__delitem__(obj, item)
            }catch(err){
                if(err.__class__ === _b_.KeyError){
                    $B.set_inum(inum)
                }
                throw err
            }
        }
        return
    }else if(obj.__class__ === _b_.list){
        try{
            return _b_.list.__delitem__(obj, item)
        }catch(err){
            if(err.__class__ === _b_.IndexError){
                $B.set_inum(inum)
            }
            throw err
        }
    }
    var di = $B.search_in_mro($B.get_class(obj), "__delitem__")
    if(di === undefined){
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(obj) +
            "' object doesn't support item deletion")
    }
    return di(obj, item)
}


$B.delete_for_reassign = function(name, namespace){
    // same as $B.$delete, but doesn't raise an exception if the name has been
    // previously removed from the namespace by an explicit "del"
    if(namespace.$is_namespace){
        return $B.$delitem(namespace, name)
    }
    if(namespace.hasOwnProperty && namespace.hasOwnProperty(name)){
        try{
            var value = namespace[name]
        }catch(err){
            // name might have already been remove from the namespace by an
            // explicit del (eg del globals()[name]) and name has become an
            // accessor whose 'get' method raises a NameError
            return
        }
        var klass = $B.get_class(value)
        if($B.$isinstance(value, $B.DOMNode)){
            // don't call __del__ for this case because it would remove the
            // element from its parent...
        }else{
            var del_method = $B.search_in_mro(klass, '__del__')
            if(del_method){
                $B.$call(del_method)(value)
            }
        }
    }
    delete namespace[name]
}


function num_result_type(x, y){
    var is_int,
        is_float,
        x_num,
        y_num
    if(typeof x == "number"){
        x_num = x
        if(typeof y == "number"){
            is_int = true
            y_num = y
        }else if(y.__class__ === _b_.float){
            is_float = true
            y_num = y.value
        }
    }else if(x.__class__ === _b_.float){
        x_num = x.value
        if(typeof y == "number"){
            y_num = y
            is_float = true
        }else if(y.__class__ === _b_.float){
            is_float = true
            y_num = y.value
        }
    }
    return {is_int, is_float, x: x_num, y: y_num}
}

$B.augm_assign = function(left, op, right){
    var res_type = num_result_type(left, right)
    if(res_type.is_int || res_type.is_float){
        var z
        switch(op){
            case '+=':
                z = res_type.x + res_type.y
                break
            case '-=':
                z = res_type.x - res_type.y
                break
            case '*=':
                z = res_type.x * res_type.y
                break
            case '/=':
                return $B.fast_float(res_type.x / res_type.y)
        }
        if(z){
            if(res_type.is_int && Number.isSafeInteger(z)){
                return z
            }else if(res_type.res_is_float){
                return $B.fast_float(z)
            }
        }
    }else if(op == '*='){
        if(typeof left == "number" && typeof right == "string"){
            return left <= 0 ? '' : right.repeat(left)
        }else if(typeof left == "string" && typeof right == "number"){
            return right <= 0 ? '' : left.repeat(right)
        }
    }else if(op == '+='){
        if(typeof left == "string" && typeof right == "string"){
            return left + right
        }
    }
    // augmented assignment
    var op1 = op.substr(0, op.length - 1),
        method = $B.op2method.augmented_assigns[op],
        augm_func = $B.$getattr(left, '__' + method + '__', null)
    if(augm_func !== null){
        var res = $B.$call(augm_func)(right)
        if(res === _b_.NotImplemented){
            $B.RAISE(_b_.TypeError, `unsupported operand type(s)` +
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

$B.$is = function(a, b){
    // Used for Python "is". In most cases it's the same as Javascript ===,
    // Cf. issue 669
    if((a === undefined || a === $B.Undefined) &&
            (b === undefined || b === $B.Undefined)){
        return true
    }
    if(a === null){
        return b === null
    }
    if(b === null){
        return a === null
    }
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
    return a === b
}

$B.is_or_equals = function(x, y){
    // used to test membership in lists, sets, dicts
    return $B.$is(x, y) || $B.rich_comp('__eq__', x, y)
}

$B.member_func = function(obj){
    var klass = $B.get_class(obj),
        contains = $B.$getattr(klass, "__contains__", null)
    // use __contains__ if defined
    if(contains !== null){
        contains = $B.$call(contains)
        return contains.bind(null, obj)
    }
    try{
        // use iteration if possible
        var iterator = $B.make_js_iterator(obj)
        return function(key){
            try{
                for(var item of iterator){
                    if($B.is_or_equals(key, item)){
                        return true
                    }
                }
                return false
            }catch(err){
                return false
            }
        }
    }catch(err){
        // use __getitem__ if defined
        var getitem = $B.$getattr(klass, '__getitem__', null)
        if(getitem !== null){
            return function(key){
                var i = -1
                while(true){
                    i++
                    try{
                        var item = getitem(obj, i)
                        if($B.is_or_equals(key, item)){
                            return true
                        }
                    }catch(err){
                        if($B.$is_exc(err, [_b_.StopIteration])){
                            return false
                        }
                        throw err
                    }
                }
            }
        }else{
            $B.RAISE(_b_.TypeError, 'argument of type ' +
                `'${$B.class_name(obj)}' is not iterable`)
        }
    }
}

$B.$is_member = function(item, _set){
    return $B.member_func(_set)(item)
}

$B.$call = function(callable, inum){
    try{
        callable = $B.$call1(callable)
    }catch(err){
        $B.set_inum(inum)
        throw err
    }

    return function(){
        try{
            return callable.apply(null, arguments)
        }catch(exc){
            $B.set_inum(inum)
            throw exc
        }
    }

    return callable
}

$B.$call1 = function(callable){
    if(callable.__class__ === $B.method){
        return callable
    }else if(callable.__class__ === _b_.staticmethod){
        return callable.__func__
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
        if(callable.$function_infos){
            var flags = callable.$function_infos[$B.func_attrs.flags]
            if(flags & $B.COMPILER_FLAGS.GENERATOR){
                // Mark frame as having generators. Used in leave_frame for
                // generators inside context managers
                $B.frame_obj.frame.$has_generators = true
            }
            if(flags & $B.COMPILER_FLAGS.COROUTINE){
                if($B.frame_obj !== null){
                    var frame = $B.frame_obj.frame
                    frame.$async = callable
                }
            }
        }
        return callable
    }
    /*
    var getter = $B.$getattr($B.get_class(callable), '__get__', null)
    if(getter !== null){
        console.log('>>>>>>>>>>>>>> callable with getter')
        callable = getter(callable, $B.get_class(callable))
    }
    */
    try{
        return $B.$getattr(callable, "__call__")
    }catch(err){
        $B.RAISE(_b_.TypeError, "'" + $B.class_name(callable) +
            "' object is not callable")
    }
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
// the variable $B.py_UUID is defined in brython_builtins.js
// It is a random number, reset at each Brython run
$B.UUID = function(){
    return $B.$py_UUID++
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
            if(!$B.$isinstance(res, expected_class[methods[i]])){
                $B.RAISE(_b_.TypeError, methods[i] + "returned non-" +
                    expected_class[methods[i]].__name__ +
                    "(type " + $B.get_class(res) +")")
            }
            return {result: res, method: methods[i]}
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
            if($B.$isinstance(item, _b_.int)){
                // int subclass
                return item.$brython_value
            }
            var method = $B.$getattr(item, "__index__", _b_.None)
            if(method !== _b_.None){
                method = typeof method == "function" ?
                            method : $B.$getattr(method, "__call__")
                return $B.int_or_bool(method())
            }else{
                $B.RAISE(_b_.TypeError, "'" + $B.class_name(item) +
                    "' object cannot be interpreted as an integer")
            }
        default:
            $B.RAISE(_b_.TypeError, "'" + $B.class_name(item) +
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
            if(v.__class__ === $B.long_int){
                return v
            }else{
                $B.RAISE(_b_.TypeError, "'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
            }
        default:
            $B.RAISE(_b_.TypeError, "'" + $B.class_name(v) +
                "' object cannot be interpreted as an integer")
    }
}

$B.enter_frame = function(frame, __file__, lineno){
    // Enter execution frame
    var count = $B.frame_obj === null ? 0 : $B.frame_obj.count
    if(count > $B.recursion_limit){
        var exc = $B.EXC(_b_.RecursionError, "maximum recursion depth exceeded")
        $B.set_exc(exc, frame)
        throw exc
    }
    frame.__class__ = $B.frame
    frame.__file__ = __file__
    frame.$lineno = lineno
    frame.$f_trace = _b_.None
    frame.$has_generators = !! frame[1].$has_generators
    $B.frame_obj = {
        prev: $B.frame_obj,
        frame,
        count: count + 1
    }
    if($B.tracefunc !== _b_.None){
        if(frame[4] === $B.tracefunc ||
                ($B.tracefunc.$infos && frame[4] &&
                 frame[4] === $B.tracefunc.$infos.__func__)){
            // to avoid recursion, don't run the trace function inside itself
            $B.tracefunc.$frame_id = frame[0]
            frame.$f_trace = _b_.None
            return
        }else{
            // also to avoid recursion, don't run the trace function in the
            // frame "below" it (ie in functions that the trace function
            // calls)
            var frame_obj = $B.frame_obj
            while(frame_obj !== null){
                if(frame_obj.frame[0] == $B.tracefunc.$frame_id){
                    frame.$f_trace = _b_.None
                    return
                }
                frame_obj = frame_obj.prev
            }
            try{
                var res = $B.tracefunc(frame, 'call', _b_.None)
                var frame_obj = $B.frame_obj
                while(frame_obj !== null){
                    if(frame_obj.frame[4] == res){
                        return _b_.None
                    }
                    frame_obj = frame_obj.prev
                }
                frame.$f_trace = res
                return
            }catch(err){
                $B.set_exc(err, frame)
                $B.frame_obj = $B.frame_obj.prev
                err.$in_trace_func = true
                throw err
            }
        }
    }
}

$B.trace_exception = function(){
    var frame = $B.frame_obj.frame
    if(frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = frame.$f_trace,
        exc = frame[1].$current_exception
    return trace_func(frame, 'exception', $B.fast_tuple([
        exc.__class__, exc, $B.traceback.$factory(exc)]))
}

$B.trace_line = function(){
    var frame = $B.frame_obj.frame
    if(frame[0] == $B.tracefunc.$current_frame_id){
        return _b_.None
    }
    var trace_func = frame.$f_trace
    if(trace_func === undefined){
        console.log('trace line, frame', frame)
    }
    return trace_func(frame, 'line', _b_.None)
}

$B.trace_return = function(value){
    var frame = $B.frame_obj.frame,
        trace_func = frame.$f_trace
    if(frame[0] == $B.tracefunc.$current_frame_id){
        // don't call trace func when returning from the frame where
        // sys.settrace was called
        return _b_.None
    }
    trace_func(frame, 'return', value)
}

$B.leave_frame = function(arg){
    // Leave execution frame
    if($B.frame_obj === null){
        return
    }

    // When leaving a module, arg is set as an object of the form
    // {$locals, value: _b_.None}
    if(arg && arg.value !== undefined && $B.tracefunc !== _b_.None){
        if($B.frame_obj.frame.$f_trace === undefined){
            $B.frame_obj.frame.$f_trace = $B.tracefunc
        }
        if($B.frame_obj.frame.$f_trace !== _b_.None){
            $B.trace_return(arg.value)
        }
    }
    if($B.frame_obj === undefined){
        throw Error('no frame_obj')
    }
    var frame = $B.frame_obj.frame
    if(frame.$coroutine){
        if(! frame.$coroutine.$sent){
            var cname = frame.$coroutine.$func.$function_infos[$B.func_attrs.name]
            var message = $B.EXC(_b_.RuntimeWarning,
                `coroutine '${cname}' was never awaited`)
            message.lineno = frame.$coroutine.$lineno
            $B.imported._warnings.warn(message)
        }
    }
    $B.frame_obj = $B.frame_obj.prev
    // For generators in locals, if their execution frame has context
    // managers, close them. In standard Python this happens when the
    // generator is garbage-collected.
    // Frames that are liable to have generators are marked with attribute
    // $has_generators
    if(frame.$has_generators){
        for(var key in frame[1]){
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
    if(frame[1].$current_exception){
        delete frame[1].$current_exception
    }
    return _b_.None
}

$B.trace_return_and_leave = function(frame, return_value){
    if(frame.$f_trace !== _b_.None){
        $B.trace_return(return_value)
    }
    $B.leave_frame()
    return return_value
}

$B.push_frame = function(frame){
    var count = $B.frame_obj === null ? 0 : $B.frame_obj.count
    return {
        prev: $B.frame_obj,
        frame,
        count: count + 1
    }
}

var reversed_op = {"__lt__": "__gt__", "__le__":"__ge__",
    "__gt__": "__lt__", "__ge__": "__le__"}
var method2comp = {"__lt__": "<", "__le__": "<=", "__gt__": ">",
    "__ge__": ">="}

$B.rich_comp = function(op, x, y){
    if(x === undefined){
        console.log(Error().stack)
        $B.RAISE(_b_.RuntimeError, 'error in rich comp')
    }
    var x1 = x !== null && x.valueOf ? x.valueOf() : x,
        y1 = y !== null && y.valueOf ? y.valueOf() : y
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

    if(x !== null && (x.$is_class || x.$factory)) {
        if(op == "__eq__"){
            return (x === y)
        }else if(op == "__ne__"){
            return !(x === y)
        }else{
            $B.RAISE(_b_.TypeError, "'" + method2comp[op] +
                "' not supported between instances of '" + $B.class_name(x) +
                "' and '" + $B.class_name(y) + "'")
        }
    }
    var rev_op = reversed_op[op] || op,
        y_rev_func
    if(x !== null && x.__class__ && y !== null && y.__class__){
        // cf issue #600 and
        // https://docs.python.org/3/reference/datamodel.html :
        // "If the operands are of different types, and right operand's type
        // is a direct or indirect subclass of the left operand's type, the
        // reflected method of the right operand has priority, otherwise the
        // left operand's method has priority."
        if(y.__class__.__mro__.indexOf(x.__class__) > -1){
            y_rev_func = $B.$getattr(y, rev_op)
            res = $B.$call(y_rev_func)(x)
            if(res !== _b_.NotImplemented){
                return res
            }
        }
    }

    var in_mro = $B.search_in_mro($B.get_class(x), op)
    if(in_mro === undefined){
        $B.RAISE(_b_TypeError, `no attribute ${op}`)
    }
    var getter = $B.search_in_mro($B.get_class(in_mro), '__get__')
    if(getter){
        res = getter(in_mro, x, $B.get_class(x))(y)
    }else{
        if(typeof in_mro !== 'function'){
            var call_in_mro = $B.search_in_mro($B.get_class(in_mro), '__call__')
            if(call_in_mro){
                res = call_in_mro(in_mro, y)
            }else{
                $B.RAISE(_b_.TypeError, `not callable {op}`)
            }
        }else{
            res = in_mro(x, y)
        }
    }
    if(res !== _b_.NotImplemented){
        return res
    }
    if(y_rev_func === undefined){
        // If y_rev_func is defined, it was called above, so don't try
        // a second time
        y_rev_func = $B.$call($B.$getattr($B.get_class(y), rev_op))
        res = y_rev_func(y, x)
        if(res !== _b_.NotImplemented ){
            return res
        }
    }

    // If both operands return NotImplemented, return False if the operand is
    // __eq__, True if it is __ne__, raise TypeError otherwise
    if(op == "__eq__"){
        return _b_.False
    }else if(op == "__ne__"){
        return _b_.True
    }

    $B.RAISE(_b_.TypeError, "'" + method2comp[op] +
        "' not supported between instances of '" + $B.class_name(x) +
        "' and '" + $B.class_name(y) + "'")
}

var opname2opsign = {__sub__: "-", __xor__: "^", __mul__: "*",
    __and__: '&', __or__: '|'}

$B.get_position_from_inum = function(inum){
    // Get position from pseudo instruction number
    if($B.frame_obj !== null){
        var frame = $B.frame_obj.frame
        if(frame.positions){
            return frame.positions[Math.floor(inum / 2)]
        }
    }
}

$B.rich_op = function(op, x, y, inum){
    try{
        return $B.rich_op1(op, x, y)
    }catch(exc){
        $B.set_inum(inum)
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
                    $B.RAISE(_b_.ZeroDivisionError, "division by zero")
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
                $B.RAISE(_b_.TypeError, "unsupported operand type(s) " +
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
    if(op == '__mul__'){
        if(x_class.$is_sequence && $B.$isinstance(y, [_b_.float, _b_.complex])){
            $B.RAISE(_b_.TypeError, "can't multiply sequence by " +
                `non-int of type '${$B.class_name(y)}'`)
        }
        if(y_class.$is_sequence && $B.$isinstance(x, [_b_.float, _b_.complex])){
            $B.RAISE(_b_.TypeError, "can't multiply sequence by " +
                `non-int of type '${$B.class_name(x)}'`)
        }
    }
    var res
    var fail
    try{
        res = $B.call_with_mro(x, op, y)
        if(res === _b_.NotImplemented){
            fail = true
        }
    }catch(err){
        if(! $B.is_exc(err, [_b_.AttributeError])){
            throw err
        }
        fail = true
    }
    if(! fail){
        return res
    }
    fail = false
    try{
        res = $B.call_with_mro(y, rop, x)
        if(res === _b_.NotImplemented){
            fail = true
        }
    }catch(err){
        if(! $B.is_exc(err, [_b_.AttributeError])){
            throw err
        }
        fail = true
    }
    if(! fail){
        return res
    }
    $B.RAISE(_b_.TypeError,
        `unsupported operand type(s) for ${$B.method_to_op[op]}:` +
        ` '${$B.class_name(x)}' and '${$B.class_name(y)}'`)
}

$B.is_none = function(o){
    return o === undefined || o === null || o == _b_.None
}

// used to detect recursion in repr() / str() of lists and dicts
var repr_stack = new Set()

$B.repr = {
    enter: function(obj){
        var obj_id = _b_.id(obj)
        if(repr_stack.has(obj_id)){
            return true
        }else{
            repr_stack.add(obj_id)
            if(repr_stack.size > $B.recursion_limit){
                repr_stack.clear()
                $B.RAISE(_b_.RecursionError, "maximum recursion depth " +
                    "exceeded while getting the repr of an object")
            }
        }
    },
    leave: function(obj){
        repr_stack.delete(_b_.id(obj))
    }
}

})(__BRYTHON__);

