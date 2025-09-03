"use strict";
(function($B){

var _b_ = $B.builtins

// add attributes to native Function
var FunctionCode = $B.make_class("function code")

var FunctionGlobals = $B.make_class("function globals")

$B.function = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    __name__: 'function',
    __qualname__: 'function',
    $is_class: true
}


$B.function.__dict__ = {}

$B.function.__dict__.__annotations__ = $B.getset_descriptor.$factory(
    $B.function,
    '__annotations__',
    function(kls, f){
        $B.check_infos(f)
        return f.__annotations__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(! $B.$isinstance(value, _b_.dict)){
            throw _b_.TypeError.$factory(
                '__annotations__ must be set to a dict object')
        }
        f.__annotations__ = value
    }
)

$B.function.__dict__.__builtins__ = $B.getset_descriptor.$factory(
    $B.function,
    '__builtins__',
    function(kls, f){
        $B.check_infos(f)
        if(f.$infos && f.$infos.__globals__){
            return _b_.dict.$getitem(self.$infos.__globals__, '__builtins__')
        }
        return $B.obj_dict(_b_)
    }
    ,
    function(){
        throw _b_.AttributeError.$factory('readonly attribute')
    }
)

$B.function.__dict__.__closure__ = $B.getset_descriptor.$factory(
    $B.function,
    '__closure__',
    function(kls, f){
        var free_vars = f.$function_infos[$B.func_attrs.free_vars]
        if(free_vars === undefined || free_vars.length == 0){
            return _b_.None
        }
        var cells = []
        for(var i = 0; i < free_vars.length; i++){
            try{
                cells.push($B.cell.$factory($B.$check_def_free(free_vars[i])))
            }catch(err){
                // empty cell
                cells.push($B.cell.$factory(_b_.None))
            }
        }
        return $B.fast_tuple(cells)
    }
    ,
    function(){
        throw _b_.AttributeError.$factory('readonly attribute')
    }
)

$B.function.__dict__.__code__ = $B.getset_descriptor.$factory(
    $B.function,
    '__code__',
    function(kls, f){
        $B.check_infos(f)
        var res = {__class__: _b_.code}
        for(var _attr in f.$infos.__code__){
            res[_attr] = f.$infos.__code__[_attr]
        }
        res.name = f.$infos.__name__
        res.filename = f.$infos.__code__.co_filename
        res.co_code = f + "" // Javascript source code
        return res
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(! $B.$isinstance(value, _b_.code)){
            throw _b_.TypeError.$factory(
                '__code__ must be set to a code object')
        }
        f.$infos.__code__ = value
    }
)

$B.function.__dict__.__defaults__ = $B.getset_descriptor.$factory(
    $B.function,
    '__defaults__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__defaults__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(value === _b_.None){
            value = []
        }else if(! $B.$isinstance(value, _b_.tuple)){
            throw _b_.TypeError.$factory(
                "__defaults__ must be set to a tuple object")
        }
        f.$infos.__defaults__ = value
        f.$function_infos[$B.func_attrs.__defaults__] = value
        // Make a new version of arguments parser
        $B.make_args_parser(f)
    }
)

$B.function.__delattr__ = function(self, attr){
    if(attr == "__dict__"){
        throw _b_.TypeError.$factory("can't delete function __dict__")
    }
}

$B.function.__dict__.__doc__ = $B.getset_descriptor.$factory(
    $B.function,
    '__doc__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__doc__
    },
    function(kls, f, value){
        $B.check_infos(f)
        f.$infos.__doc__ = value
    }
)

$B.function.__dict__.__module__ = $B.getset_descriptor.$factory(
    $B.function,
    '__module__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__module__
    },
    function(kls, f, value){
        $B.check_infos(f)
        f.$infos.__module__ = value
    }
)

$B.function.__dict__.__name__ = $B.getset_descriptor.$factory(
    $B.function,
    '__name__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__name__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(! $B.$isinstance(value, _b_.str)){
            throw _b_.TypeError.$factory(
                '__name__ must be set to a string object')
        }
        f.$infos.__name__ = value
    }
)

$B.function.__dict__.__qualname__ = $B.getset_descriptor.$factory(
    $B.function,
    '__qualname__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__qualname__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(! $B.$isinstance(value, _b_.str)){
            throw _b_.TypeError.$factory(
                '__qualname__ must be set to a string object')
        }
        f.$infos.__qualname__ = value
    }
)

$B.function.__dict__.__type_params__ = $B.getset_descriptor.$factory(
    $B.function,
    '__type_params__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__type_params__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(! $B.$isinstance(value, _b_.tuple)){
            throw _b_.TypeError.$factory(
                'TypeError: __type_params__ must be set to a tuple')
        }
        f.$infos.__type_params__ = value
    }
)

$B.function.__dir__ = function(self){
    if(self.$function_infos && ! self.$infos){
        $B.make_function_infos(self, ...self.$function_infos)
    }
    var infos = self.$infos.__dict__ || {},
        attrs = self.$attrs || {}

    return $B.$list(Object.keys(infos).
               concat(Object.keys(attrs)).
               concat(Object.keys($B.function)).
               filter(x => !x.startsWith('$'))).
               sort()
}

$B.function.__get__ = function(self, obj){
    // adapted from
    // https://docs.python.org/3/howto/descriptor.html#functions-and-methods
    if(obj === _b_.None){
        return self
    }
    return $B.method.$factory(self, obj)
}

$B.function.__dict__.__globals__ = $B.getset_descriptor.$factory(
    $B.function,
    '__globals__',
    function(kls, f){
        $B.check_infos(f)
        return $B.obj_dict($B.imported[f.$infos.__module__])
    }
    ,
    function(){
        throw _b_.AttributeError.$factory('readonly attribute')
    }
)

$B.function.__dict__.__kwdefaults__ = $B.getset_descriptor.$factory(
    $B.function,
    '__kwdefaults__',
    function(kls, f){
        $B.check_infos(f)
        return f.$infos.__kwdefaults__
    },
    function(kls, f, value){
        $B.check_infos(f)
        if(value == _b_.None){
            value = $B.empty_dict()
        }else if(! $B.$isinstance(value, _b_.dict)){
            throw _b_.TypeError.$factory(
                '__kwdefaults__ must be set to a dict object')
        }
        f.$infos.__kwdefaults__ = value
        var kwd = {}
        for(var item of _b_.dict.$iter_items(value)){
            kwd[item.key] = item.value
        }
        f.$function_infos[$B.func_attrs.__kwdefaults__] = kwd
        // Make a new version of arguments parser
        $B.make_args_parser(f)
    }
)

$B.function.__repr__ = function(self){
    if(self.$function_infos){
        return `<function ${self.$function_infos[$B.func_attrs.__qualname__]}>`
    }else if(self.$infos === undefined){
        return '<function ' + self.name + '>'
    }else{
        return '<function ' + self.$infos.__qualname__ + '>'
    }
}

$B.function.__mro__ = [_b_.object]

$B.function.__setattr__ = function(self, attr, value){
    if(self.$infos === undefined){
        $B.make_function_infos(self, ...self.$function_infos)
    }
    var klass_attr = $B.function[attr]
    if(klass_attr !== undefined && klass_attr.__class__ &&
            klass_attr.__class__.__get__ &&
            klass_attr.__set__){
        return klass_attr.__class__.__set__(klass_attr, self, value)
    }
    try{
        klass_attr = _b_.dict.$getitem($B.function.__dict__, attr)
    }catch(err){
        klass_attr = null
    }
    if(klass_attr && klass_attr.__class__.__get__ &&
            klass_attr.__class__.__set__){
        return klass_attr.__class__.__set__(klass_attr, self, value)
    }
    if(! self.__dict__){
        self.__dict__ = $B.empty_dict()
    }
    _b_.dict.$setitem(self.__dict__, attr, value)
}

$B.check_infos = function(f){
    if(! f.$infos){
        if(f.$function_infos){
            $B.make_function_infos(f, ...f.$function_infos)
        }else{
            console.log('no $infos, no $function_infos')
        }
    }
}

$B.make_function_infos = function(f, __module__, co_name, co_qualname,
        co_filename, __defaults__, __kwdefaults__, __doc__, arg_names,
        vararg, kwarg,
        co_argcount, co_firstlineno,
        co_flags, co_freevars, co_kwonlyargcount,
        co_posonlyargcount, co_varnames,
        annotations, type_params
        ){
    f.$is_func = true
    f.$args_parser = $B.make_args_parser_and_parse
    if(co_flags & $B.COMPILER_FLAGS.COROUTINE){
        f.$is_async = true
    }
    __defaults__ = __defaults__ === _b_.None ? [] : __defaults__
    __defaults__.__class__ = _b_.tuple
    __kwdefaults__ = __kwdefaults__ === _b_.None ? _b_.None :
        _b_.dict.$from_js(__kwdefaults__)
    f.$infos = {__module__,
        __defaults__, __kwdefaults__, __doc__, arg_names,
        vararg, kwarg}
    f.$infos.__name__ = co_name
    f.$infos.__qualname__ = co_qualname
    type_params = type_params ?? []
    type_params.__class__ = _b_.tuple
    f.$infos.__type_params__ = type_params
    co_freevars = co_freevars ?? []
    co_freevars.__class__ = _b_.tuple
    annotations = annotations ?? []
    f.__annotations__ = _b_.dict.$from_array(annotations)
    co_varnames = co_varnames ?? []
    co_varnames.__class__ = _b_.tuple
    f.$infos.__code__ = {co_argcount, co_filename, co_firstlineno,
        co_flags, co_freevars, co_kwonlyargcount, co_name,
        co_nlocals: co_varnames.length,
        co_posonlyargcount, co_qualname, co_varnames,
        co_positions: {}}
    f.$infos.__dict__ = $B.empty_dict()
}

$B.make_args_parser_and_parse = function make_args_parser_and_parse(fct, args){
    return $B.make_args_parser(fct)(fct, args);
}

$B.make_args_parser = function(f){
    if((! f.$infos) && f.$function_infos){
        $B.make_function_infos(f, ...f.$function_infos)
    }
    if(f.$infos === undefined || f.$infos.__code__ === undefined){
        console.log('f', f)
        throw _b_.AttributeError.$factory(`cannot set defauts to ${_b_.str.$factory(f)}`);
    }
    const varnames = f.$infos.__code__.co_varnames,
          value = f.$infos.__defaults__,
          offset   = f.$infos.__code__.co_argcount - value.length,
          $kwdefaults = new Map()

    var nb_kw_defaults = f.$infos.__kwdefaults__ === _b_.None ? 0 :
                         _b_.dict.__len__(f.$infos.__kwdefaults__)
    if(f.$infos.__kwdefaults__ !== _b_.None){
        const kwdef = f.$infos.__kwdefaults__
        for(let kw of $B.make_js_iterator(kwdef)){
            $kwdefaults.set(kw, $B.$getitem(kwdef, kw))
        }
    }
    f.$kwdefaults = $kwdefaults
    f.$kwdefaults_values = [...$kwdefaults.values()]

    f.$hasParams = new Set()

    var nb_args = f.$infos.__code__.co_argcount +
                  f.$infos.__code__.co_kwonlyargcount +
                  (f.$infos.kwargs ? 1 : 0)
    for(let i = 0 ; i < nb_args; ++i){
        f.$hasParams.add(varnames[i])
    }

    const $INFOS = f.$infos,
          $CODE  = $INFOS.__code__,
          DEFAULTS = $B.getArgs0.DEFAULTS

    const PARAMS_NAMED_COUNT  = $CODE.co_kwonlyargcount,
          PARAMS_NAMED_DEFAULTS_COUNT = nb_kw_defaults
    let named_defaults = DEFAULTS.NONE;
    if(PARAMS_NAMED_DEFAULTS_COUNT > 0){
        named_defaults = PARAMS_NAMED_DEFAULTS_COUNT >= PARAMS_NAMED_COUNT ?
                         DEFAULTS.ALL : DEFAULTS.SOME
    }
    const PARAMS_POSONLY_COUNT = $CODE.co_posonlyargcount
    const PARAMS_POS_COUNT = $CODE.co_argcount - PARAMS_POSONLY_COUNT

    let pos_defaults = DEFAULTS.NONE
    if(PARAMS_POS_COUNT !== 0 && value.length > 0){
        pos_defaults = value.length >= PARAMS_POS_COUNT ? DEFAULTS.ALL :
                       DEFAULTS.SOME;
    }
    let posonly_defaults = DEFAULTS.NONE
    if(value.length > PARAMS_POS_COUNT){
        posonly_defaults = value.length >= $CODE.co_argcount ? DEFAULTS.ALL :
                           DEFAULTS.SOME;
    }

    f.$args_parser = f.$infos.args_parser = $B.getArgs0(
        PARAMS_POSONLY_COUNT !== 0,
        posonly_defaults,
        PARAMS_POS_COUNT !== 0,
        pos_defaults,
        $INFOS.vararg !== null,
        PARAMS_NAMED_COUNT !== 0,
        named_defaults,
        $INFOS.kwarg !== null
    )

    return f.$args_parser
}

$B.function.$factory = function(){}

$B.set_func_names($B.function, "builtins")

// Code for function arguments parsing
// mostly written by Denis Migdal

const args0_fcts = $B.args_parsers = [];

function getArgs0(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs) {

    const IDX =      hasPosOnly
            | posOnlyDefaults    << 1
            | hasPos        << 3
            | posDefaults        << 4
            | hasVargars        << 6
            | hasNamedOnly        << 7
            | namedOnlyDefaults    << 8
            | hasKWargs        << 10;

    const args0 = args0_fcts[IDX];

    if(args0 !== undefined)
        return args0;

    const fct = args0_fcts[IDX] = generate_args0(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs);

    fct.id = IDX;

    return fct;
}

$B.getArgs0 = getArgs0;

const DEFAULTS = getArgs0.DEFAULTS = {
    NONE: 0,
    SOME: 1,
    ALL : 3
}


// deno run generator.js
// hasPos / posDefaults are pos parameters excluding posOnly parameters.
function generate_args0(...args) {
    return new Function('fct', 'args',  generate_args0_str(...args) );
}


function generate_args0_str(hasPosOnly, posOnlyDefaults, hasPos, posDefaults, hasVargars, hasNamedOnly, namedOnlyDefaults, hasKWargs) {

    let fct =
//`function args0_NEW(fct, args) {
`
    const LAST_ARGS = args[args.length-1];
    const HAS_KW = LAST_ARGS !== undefined && LAST_ARGS !== null && LAST_ARGS.$kw !== undefined;

    let ARGS_POS_COUNT        = args.length;
    let ARGS_NAMED            = null;

    if( HAS_KW ) {
        --ARGS_POS_COUNT;
        ARGS_NAMED = LAST_ARGS.$kw;
    }


    const result = {};

    // using const should enable the browser to perform some optimisation.
    const $INFOS = fct.$infos;
    const $CODE  = $INFOS.__code__;
`;

    if( hasPos || hasPosOnly || hasNamedOnly )
        fct += `
    const PARAMS_NAMES        = $INFOS.arg_names;
`;

    let PARAMS_POS_COUNT = "0";
    if( hasPos || hasPosOnly ) {
        PARAMS_POS_COUNT = "PARAMS_POS_COUNT";
        fct += `
    const PARAMS_POS_COUNT    = $CODE.co_argcount;
`;
    }

    let PARAMS_POS_DEFAULTS_OFFSET = PARAMS_POS_COUNT;
    let PARAMS_POS_DEFAULTS_COUNT = "0";

    if( posOnlyDefaults !== DEFAULTS.NONE || posDefaults !== DEFAULTS.NONE ) {

        PARAMS_POS_DEFAULTS_OFFSET = "PARAMS_POS_DEFAULTS_OFFSET";
        PARAMS_POS_DEFAULTS_COUNT  = "PARAMS_POS_DEFAULTS_COUNT";

        fct += `
    const PARAMS_POS_DEFAULTS = $INFOS.__defaults__;
    const PARAMS_POS_DEFAULTS_COUNT = PARAMS_POS_DEFAULTS.length;

    const PARAMS_POS_DEFAULTS_OFFSET= ${PARAMS_POS_COUNT} - PARAMS_POS_DEFAULTS_COUNT;

`;
    }

    fct += `
    let offset = 0;
`;

    if( hasVargars ) {
        fct +=
`
    result[$INFOS.vararg] = $B.fast_tuple( Array.prototype.slice.call(args, ${PARAMS_POS_COUNT}, ARGS_POS_COUNT ) ); //TODO: opti, better way to construct tuple from subarray ?
`

        if( hasPosOnly || hasPos ) {

            fct +=
`
    const min = Math.min( ARGS_POS_COUNT, ${PARAMS_POS_COUNT} );
    for( ; offset < min ; ++offset)
        result[ PARAMS_NAMES[offset] ] = args[offset];
`
        }
    } else {
        fct +=
`
    if( ARGS_POS_COUNT > ${PARAMS_POS_COUNT} ) {
        $B.args0_old(fct, args);
        throw new Error('Too much positional arguments given (args0 should have raised an error) !');
    }
`
        if( hasPosOnly || hasPos ) {

            fct +=
`
    for( ; offset < ARGS_POS_COUNT ; ++offset)
        result[ PARAMS_NAMES[offset] ] = args[offset];
`
        }
    }



    // verify if it truly has no kw arguments.
    if( ! hasPos && ! hasNamedOnly && ! hasKWargs ) {
        fct += `
    if( HAS_KW === true ) {

        for(let argname in ARGS_NAMED[0] ) {
            $B.args0_old(fct, args);
            throw new Error('No named arguments expected !!!');
        }

        for(let id = 1; id < ARGS_NAMED.length; ++id ) {

            const kargs = ARGS_NAMED[id];
            for(let argname of $B.unpack_mapping( fct, kargs) ) { //TODO: not optimal
                $B.args0_old(fct, args);
                throw new Error('No named arguments expected !!!');
            }
        }
    }
`;
    } else {
        fct += `
    if( HAS_KW === false ) {
    `;
    }

    if( hasPos || hasPosOnly ) {

        if( posOnlyDefaults !== DEFAULTS.ALL && posDefaults !== DEFAULTS.ALL ) {

            fct += `
        if( offset < ${PARAMS_POS_DEFAULTS_OFFSET} ) {
            $B.args0_old(fct, args);
            throw new Error('Not enough positional arguments given (args0 should have raised an error) !');
        }
`
        }

        if( posOnlyDefaults !== DEFAULTS.NONE || posDefaults !== DEFAULTS.NONE) {
            fct += `
        for(let i = offset - PARAMS_POS_DEFAULTS_OFFSET;
            i < PARAMS_POS_DEFAULTS_COUNT;
            ++i)
            result[ PARAMS_NAMES[offset++] ] = PARAMS_POS_DEFAULTS[i];`
        }
    }

    if( hasKWargs ) {
        fct += `
        result[$INFOS.kwarg] = __BRYTHON__.empty_dict();`
    }

    if( hasNamedOnly && namedOnlyDefaults !== DEFAULTS.ALL) {
        fct += `
        $B.args0_old(fct, args);
        throw new Error('Named argument expected (args0 should have raised an error) !');
`
    } else if( namedOnlyDefaults !== DEFAULTS.NONE ) {
        fct += `
        const kwargs_defaults_values = fct.$kwdefaults_values;

        for(let i = 0; i < kwargs_defaults_values.length; ++i )
                result[ PARAMS_NAMES[offset++] ] = kwargs_defaults_values[i];
`
    }

    fct += `
        return result;
`

    // verify if it truly has no kw arguments.
    if( ! hasPos && ! hasNamedOnly && ! hasKWargs ) {
        return fct;
    } else {
        fct += `
    }
`;
    }

    if( namedOnlyDefaults !== DEFAULTS.NONE) {
        fct += `
    const kwargs_defaults = fct.$kwdefaults;
`
    }

    if( hasPosOnly ) {

        fct += `
    const PARAMS_POSONLY_COUNT         = $CODE.co_posonlyargcount;

    if( offset < PARAMS_POSONLY_COUNT ) {

        `;
        if( posOnlyDefaults !== DEFAULTS.SOME) {
            fct += `
        if( offset < ${PARAMS_POS_DEFAULTS_OFFSET} ) {
            $B.args0_old(fct, args);
            throw new Error('Not enough positional parameters given (args0 should have raised an error) !');
        }
`
        }
        if( posOnlyDefaults === DEFAULTS.NONE) {
            fct += `
        $B.args0_old(fct, args);
        throw new Error('Not enough positional parameters given (args0 should have raised an error) !');
`;
        }

        fct += `
        const max = ${PARAMS_POS_DEFAULTS_COUNT} - (${PARAMS_POS_COUNT} - PARAMS_POSONLY_COUNT);

        // default parameters
        for(let i = offset - ${PARAMS_POS_DEFAULTS_OFFSET};
                i < max;
                ++i)
            result[ PARAMS_NAMES[offset++] ] = PARAMS_POS_DEFAULTS[i];
    }
`
    }

    if( hasKWargs) {

        fct += `
    const extra = {};

    let nb_extra_args = 0;
`

        if(hasPos || hasNamedOnly ) {
            fct += `
    const HAS_PARAMS = fct.$hasParams;
`;
        }
    }

    fct += `

    let nb_named_args = 0;


    const kargs = ARGS_NAMED[0];

    for(let argname in kargs) {
        `;

        if( ! hasKWargs ) {
            fct += `
        result[ argname ] = kargs[argname];
        ++nb_named_args;
`;
        }

        if( hasKWargs ) {
            if( ! hasNamedOnly && ! hasPos ) {
                fct += `
        extra[ argname ] = kargs[argname];
        ++nb_extra_args;
`
            } else {
                fct += `
        if( HAS_PARAMS.has(argname) ) {
            result[ argname ] = kargs[argname];
            ++nb_named_args;
        } else {
            extra[ argname ] = kargs[argname];
            ++nb_extra_args;
        }
`
            }
        }

        fct += `
    }

    for(let id = 1; id < ARGS_NAMED.length; ++id ) {

        const kargs = ARGS_NAMED[id];

        for(let item of $B.unpack_mapping(fct, kargs) ) {
            let argname = item.key
            if( typeof argname !== "string") {
                $B.args0_old(fct, args);
                throw new Error('Non string key passed in **kargs');
            }
            `;

            if( ! hasKWargs ) {
                fct += `
            result[ argname ] = item.value;
            ++nb_named_args;
`;
            }

            if( hasKWargs ) {
                if( ! hasNamedOnly && ! hasPos ) {

                    fct += `
            extra[ argname ] = $B.$getitem(kargs, argname);
            ++nb_extra_args;
`
                } else {
                    fct += `
            if( HAS_PARAMS.has(argname) ) {
                result[ argname ] = $B.$getitem(kargs, argname);
                ++nb_named_args;
            } else {
                extra[ argname ] = $B.$getitem(kargs, argname);
                ++nb_extra_args;
            }
`
                }
            }

            fct += `
        }
    }
`

    fct += `
    let found = 0;
    let ioffset = offset;
`;

    if(    (hasPosOnly || hasPos)
        && (! hasPosOnly || posOnlyDefaults !== DEFAULTS.ALL)
        && (! hasPos     || posDefaults !== DEFAULTS.ALL) ) {
        fct += `
    for( ; ioffset < ${PARAMS_POS_DEFAULTS_OFFSET}; ++ioffset) {

        const key = PARAMS_NAMES[ioffset];
        if( key in result ) // maybe could be speed up using "!(key in result)"
            continue;

        $B.args0_old(fct, args);
        throw new Error('Missing a named arguments (args0 should have raised an error) !');
    }
`
    }
    if( (hasPosOnly && posOnlyDefaults !== DEFAULTS.NONE) || (hasPos && posDefaults !== DEFAULTS.NONE) ) {
        fct += `
    for( ; ioffset < PARAMS_POS_COUNT; ++ioffset) {

        const key = PARAMS_NAMES[ioffset];
        if( key in result )
            continue;

        result[key] = PARAMS_POS_DEFAULTS[ioffset - ${PARAMS_POS_DEFAULTS_OFFSET}];
    ++found;
    }
`
    }

    if( hasNamedOnly ) {

        fct += `
        for( ; ioffset < PARAMS_NAMES.length; ++ioffset) {

            const key = PARAMS_NAMES[ioffset];
            if( key in result )
                continue;
`
        if( namedOnlyDefaults === DEFAULTS.SOME) {
            fct += `
            if( ! kwargs_defaults.has(key) ) {
                $B.args0_old(fct, args);

                throw new Error('Missing a named arguments (args0 should have raised an error) !');
            }
`
        }
        if( namedOnlyDefaults === DEFAULTS.NONE ) {
            fct += `
            $B.args0_old(fct, args);

            throw new Error('Missing a named arguments (args0 should have raised an error) !');
`
        }

        if( namedOnlyDefaults !== DEFAULTS.NONE) {
            fct += `

            result[key] = kwargs_defaults.get(key);
            ++found;
`;
        }

        fct += `
        }
`;
    }

    if( hasNamedOnly || hasPos )
        fct += `
        if( found + nb_named_args !== PARAMS_NAMES.length - offset) {
            $B.args0_old(fct, args);
            throw new Error('Inexistant or duplicate named arguments (args0 should have raised an error) !');
        }
`;

    if( hasKWargs ) {
        fct += `
    if( Object.keys(extra).length !== nb_extra_args ) {
        $B.args0_old(fct, args);
        throw new Error('Duplicate name given to **kargs parameter (args0 should have raised an error) !');
    }
    result[$INFOS.kwarg] = __BRYTHON__.builtins.dict.$from_js(extra);
`
    }

    fct += `
    return result
    `;

    //fct += `}`;
    return fct;
}

function missing_names(missing){
    var len = missing.length
    var plural = len == 1 ? '' : 's'
    var report
    switch(len){
        case 1:
            report = `${missing[0]}`
            break
        case 2:
            report = `${missing[0]} and ${missing[1]}`
            break
        default:
            report = `${missing.slice(0, len - 1).join(', ')}, and ` +
                `${missing[len - 1]}`
            break
    }
    return report
}

function add_to_kwargs(kw_dict, key, value){
    kw_dict.$strings[key] = value
}

$B.args_parser = function(f, args){
    if(! f.$arguments_parser){
        f.$arguments_parser = make_arguments_parser(f)
    }
    return f.$arguments_parser(f, args)
}

$B.has_kw = function(args){
    var last_arg = args[args.length - 1]
    return last_arg && last_arg.$kw
}

var empty = {}

function make_arguments_parser(f){
    /*
    var parse_debug = 0
    if(parse_debug){
        for(var attr in $B.func_attrs){
            console.log(attr, f.$function_infos[$B.func_attrs[attr]])
        }
    }
    */

    var infos = f.$function_infos
    var name = infos[$B.func_attrs.__name__]
    var arg_names = infos[$B.func_attrs.arg_names]
    var positional_length = infos[$B.func_attrs.positional_length]
    var kwonly_length = infos[$B.func_attrs.kwonlyargs_length]
    var vararg = infos[$B.func_attrs.args_vararg]
    var kwarg = infos[$B.func_attrs.args_kwarg]
    var defaults = infos[$B.func_attrs.__defaults__]
    var posonly_length = infos[$B.func_attrs.posonlyargs_length]
    var kwonly_defs = [$B.func_attrs.__kwdefaults__]

    var nb_formal = positional_length + kwonly_length

    var def_obj = {}
    if(defaults !== _b_.None){
        var start_defs = positional_length - defaults.length
        for(var i = start_defs; i < positional_length; i++){
            def_obj[arg_names[i]] = defaults[i - start_defs]
        }
    }
    if(kwonly_defs !== _b_.None){
        for(var key in kwonly_defs){
            def_obj[key] = kwonly_defs[key]
        }
    }

    var parser = function(f, args){

        function add_key(key, value){
            var index = arg_names.indexOf(key)
            if(index == -1){
                if(kwarg){
                    add_to_kwargs(locals[kwarg], key, value)
                    return
                }else{
                    throw _b_.TypeError.$factory(name +
                        `() got an unexpected keyword argument '${key}'`)
                }
            }
            if(locals.hasOwnProperty(key)){
                if(kwarg && index < posonly_length){
                    _b_.dict.$setitem_string(locals[kwarg], key, value)
                    return
                }
                throw _b_.TypeError.$factory(name +
                    `() got multiple values for argument '${key}'`)
            }
            if(index < posonly_length){
                if(defaults === _b_.None ||
                        index <= positional_length - defaults.length){
                    // no default value for key as positional
                    if(kwarg){
                        _b_.dict.$setitem_string(locals[kwarg], key, value)
                    }else{
                        posonly_as_keywords.push(key)
                    }
                }
            }else{
                locals[key] = value
                filled_pos++
            }
        }

        var too_many_pos = 0
        var posonly_as_keywords = []

        const locals = {}
        var filled_pos = 0
        var vargs


        if(kwarg !== null){
            locals[kwarg] = $B.empty_dict()
        }

        const args_length = args.length
        const last_arg = args[args_length - 1]
        const has_kw = last_arg && last_arg.$kw

        const nb_pos = has_kw ? args_length - 1 : args_length

        if(vararg !== null){
            locals[vararg] = vargs = []
        }

        if(nb_pos <= positional_length){
            for(let iarg = 0; iarg < nb_pos; iarg++){
                locals[arg_names[iarg]] = args[iarg]
            }
            filled_pos = nb_pos
        }else{
            for(let iarg = 0; iarg < positional_length; iarg++){
                locals[arg_names[iarg]] = args[iarg]
            }
            filled_pos = positional_length
            if(vararg !== null){
                for(let j = positional_length; j < nb_pos; j++){
                    vargs[vargs.length] = args[j]
                }
            }else{
                too_many_pos = nb_pos - positional_length
            }
        }

        if(has_kw){
            var elt = last_arg
            for(let key in elt.$kw[0]){
                add_key(key, elt.$kw[0][key])
            }
            for(let i = 1; i< elt.$kw.length; i++){
                if(elt.$kw[i].__class__ === _b_.dict){
                    for(let item of _b_.dict.$iter_items(elt.$kw[i])){
                        add_key(item.key, item.value)
                    }
                }else{
                    let klass = $B.get_class(elt.$kw[i])
                    let keys_method = $B.$getattr(klass, 'keys', null)
                    let getitem = $B.$getattr(klass, '__getitem__', null)
                    if(keys_method === null || getitem === null){
                        throw _b_.TypeError.$factory(
                            `${name} argument after ** must be a mapping, ` +
                            `not ${$B.class_name(elt.$kw[i])}`)
                    }
                    for(let key of $B.make_js_iterator(keys_method(elt.$kw[i]))){
                        add_key(key, getitem(elt.$kw[i], key))
                    }
                }
            }
        }

        if(vararg !== null){
            locals[vararg] = $B.fast_tuple(locals[vararg])
        }

        if(nb_formal == 0){
            // form f(*args, **kw): ...
            return locals
        }

        if(too_many_pos > 0){
            var plural = positional_length == 1 ? '' : 's'
            var nb = positional_length + too_many_pos
            var report = positional_length
            if(defaults.length){
                var nb_min = positional_length - defaults.length
                report = `from ${nb_min} to ${positional_length}`
                plural = 's'
            }
            throw _b_.TypeError.$factory(
                `${name}() takes ${report} positional argument` +
                `${plural} but ${nb} were given`)
        }

        if(posonly_as_keywords.length > 0){
            throw _b_.TypeError.$factory(
                `${name}() got some positional-only arguments passed as keyword ` +
                `arguments: '${posonly_as_keywords.join(', ')}'`)
        }

        // use default values
        if(filled_pos < nb_formal){
            for(let key in def_obj){
                if(! locals.hasOwnProperty(key)){
                    locals[key] = def_obj[key]
                    filled_pos++
                }
            }

            if(filled_pos < nb_formal){
                // Report error
                var missing_positional = []
                var missing_kwonly = []
                for(let i = 0; i < nb_formal; i++){
                    let arg_name = arg_names[i]
                    if(! locals.hasOwnProperty(arg_name)){
                        if(i < positional_length){
                            missing_positional.push(`'${arg_name}'`)
                        }else{
                            missing_kwonly.push(`'${arg_name}'`)
                        }
                    }
                }
                var missing
                var missing_type
                var report
                if(missing_positional.length){
                    missing = missing_positional
                    missing_type = 'positional'
                }else{
                    missing = missing_kwonly
                    missing_type = 'keyword-only'
                }
                var report = missing_names(missing)
                var nb_missing = missing.length
                var plural = nb_missing == 1 ? '' : 's'
                throw _b_.TypeError.$factory(name +
                    `() missing ${nb_missing} required ${missing_type} ` +
                    `argument${plural}: ${report}`)
            }
        }

        return locals
    }

    return parser
}


})(__BRYTHON__);