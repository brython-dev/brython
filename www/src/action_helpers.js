// Adapted from CPython Parser/action_helpers.c
(function($B){
"use strict";

var _b_ = $B.builtins,
    NULL = undefined,
    DOT = '.',
    ELLIPSIS = '...'

// TARGETS_TYPE
const STAR_TARGETS = 1,
      DEL_TARGETS = 2,
      FOR_TARGETS = 3

function make_string_for_ast_value(value){
    value = value.replace(/\n/g,'\\n\\\n')
    value = value.replace(/\r/g,'\\r\\\r')
    if(value[0] == "'"){
        var unquoted = value.substr(1, value.length - 2)
        return unquoted
    }
    // prepare value so that "'" + value + "'" is the correct string
    if(value.indexOf("'") > -1){
        var s = '',
            escaped = false
        for(var char of value){
            if(char == '\\'){
                if(escaped){
                    s += '\\\\'
                }
                escaped = !escaped
            }else{
                if(char == "'" && ! escaped){
                    // escape unescaped single quotes
                    s += '\\'
                }else if(escaped){
                    s += '\\'
                }
                s += char
                escaped = false
            }
        }
        value = s
    }
    return value.substr(1, value.length - 2)
}

var escapeseq = {
    a: '\a',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t',
    v: '\v',
    '"': '"',
    "'": "'"
}

function encode_bytestring(s){
    var s1 = ''
    var escape = false
    for(var char of s){
        if(char == '\\'){
            if(escape){
                s1 += char
            }
            escape = ! escape
        }else if(escape){
            var repl = escapeseq[char]
            s1 += repl ?? char
            escape = false
        }else{
            s1 += char
        }
    }
    s = s1
    var t = []
    for(var i = 0, len = s1.length; i < len; i++){
        var cp = s1.codePointAt(i)
        if(cp > 255){
            throw Error()
        }
        t.push(cp)
    }
    return t
}

function EXTRA_EXPR(head, tail){
    return {
            lineno: head.lineno,
            col_offset: head.col_offset,
            end_lineno: tail.end_lineno,
            end_col_offset: tail.end_col_offset
            }
}

function set_list(list, other){
    for(var item of other){
        list.push(item)
    }
}

var positions = ['lineno', 'col_offset', 'end_lineno', 'end_col_offset']

function set_position_from_list(ast_obj, EXTRA){
    for(var i = 0; i < 4; i++){
        ast_obj[positions[i]] = EXTRA[i]
    }
}

function set_position_from_token(ast_obj, token){
    ast_obj.lineno = token.lineno
    ast_obj.col_offset = token.col_offset
    ast_obj.end_lineno = token.end_lineno
    ast_obj.end_col_offset = token.end_col_offset
}

function set_position_from_obj(ast_obj, obj){
    for(var position of positions){
        ast_obj[position] = obj[position]
    }
}

function _get_names(p, names_with_defaults){
    var seq = []
    for (var pair of names_with_defaults) {
        seq.push(pair.arg)
    }
    return seq
}

function _get_defaults(p, names_with_defaults){
    var seq = []
    for (var pair of names_with_defaults){
        seq.push(pair.value)
    }
    return seq
}

function _make_posonlyargs(p,
                  slash_without_default,
                  slash_with_default,
                  posonlyargs) {
    if (slash_without_default != NULL) {
        set_list(posonlyargs, slash_without_default)
    }else if (slash_with_default != NULL) {
        var slash_with_default_names =
                _get_names(p, slash_with_default.names_with_defaults);
        if (!slash_with_default_names) {
            return -1;
        }
        set_list(posonlyargs, $B._PyPegen.join_sequences(
                p,
                slash_with_default.plain_names,
                slash_with_default_names))
    }
    return posonlyargs == NULL ? -1 : 0;
}

function _make_posargs(p,
              plain_names,
              names_with_default,
              posargs) {
    if (plain_names != NULL && names_with_default != NULL) {
        var names_with_default_names = _get_names(p, names_with_default);
        if (!names_with_default_names) {
            return -1;
        }
        var seqs = $B._PyPegen.join_sequences(
                p, plain_names,  names_with_default_names)
        set_list(posargs, seqs);
    }else if (plain_names == NULL && names_with_default != NULL) {
        set_list(posargs, _get_names(p, names_with_default))
    }
    else if (plain_names != NULL && names_with_default == NULL) {
        set_list(posargs, plain_names)
    }
    return posargs == NULL ? -1 : 0;
}

function _make_posdefaults(p,
                  slash_with_default,
                  names_with_default,
                  posdefaults) {
    if (slash_with_default != NULL && names_with_default != NULL) {
        var slash_with_default_values =
                _get_defaults(p, slash_with_default.names_with_defaults);
        if (!slash_with_default_values) {
            return -1;
        }
        var names_with_default_values = _get_defaults(p, names_with_default);
        if (!names_with_default_values) {
            return -1;
        }
        set_list(posdefaults, $B._PyPegen.join_sequences(
                p,
                slash_with_default_values,
                names_with_default_values))
    }else if (slash_with_default == NULL && names_with_default != NULL) {
        set_list(posdefaults, _get_defaults(p, names_with_default))
    }
    else if (slash_with_default != NULL && names_with_default == NULL) {
        set_list(posdefaults,
             _get_defaults(p, slash_with_default.names_with_defaults))
    }
    return posdefaults == NULL ? -1 : 0;
}

function _make_kwargs(p, star_etc,
             kwonlyargs,
             kwdefaults) {
    if (star_etc != NULL && star_etc.kwonlyargs != NULL) {
        set_list(kwonlyargs, _get_names(p, star_etc.kwonlyargs))
    }else {
        set_list(kwonlyargs, [])
    }

    if (kwonlyargs == NULL) {
        return -1;
    }

    if (star_etc != NULL && star_etc.kwonlyargs != NULL) {
        set_list(kwdefaults, _get_defaults(p, star_etc.kwonlyargs))
    }
    else {
        set_list(kwdefaults, [])
    }

    if (kwdefaults == NULL) {
        return -1;
    }

    return 0;
}

function _seq_number_of_starred_exprs(seq){
    var n = 0
    for(var k of seq){
        if(! k.is_keyword){
            n++;
        }
    }
    return n
}

$B._PyPegen = {}

$B._PyPegen.PyErr_Occurred = function(){
    // called in gen_parse.js
    // errors should be raised in this JS code so return false
    return false
}

$B._PyPegen.constant_from_string = function(p, token){
    var prepared = $B.prepare_string(p, token) // in string_parser.js
    var is_bytes = prepared.value.startsWith('b')
    if(! is_bytes){
        var value = make_string_for_ast_value(prepared.value)
    }else{
        var value = prepared.value.substr(2, prepared.value.length - 3)
        try{
            value = _b_.bytes.$factory(encode_bytestring(value))
        }catch(err){
            $B._PyPegen.raise_error_known_location(p,
                _b_.SyntaxError,
                token.lineno, token.col_offset,
                token.end_lineno, token.end_col_offset,
                'bytes can only contain ASCII literal characters')
        }
    }
    var ast_obj = new $B.ast.Constant(value)
    set_position_from_token(ast_obj, token)
    return ast_obj
}

$B._PyPegen.constant_from_token = function(p, t){
    var ast_obj = new $B.ast.Constant(t.string)
    set_position_from_token(ast_obj, t)
    return ast_obj
}

$B._PyPegen.decoded_constant_from_token = function(p, t){
    var ast_obj = new $B.ast.Constant(t.string)
    set_position_from_token(ast_obj, t)
    return ast_obj
}

function is_whitespace(char){
    return ' \n\r\t\f'.includes(char)
}

function _get_interpolation_conversion(p, debug, conversion, format){
    if(conversion != NULL){
        var conversion_expr = conversion.result
        return conversion_expr.id
    }else if(debug && !format){
        /* If no conversion is specified, use !r for debug expressions */
        return 'r'
    }
    return -1;
}

function _strip_interpolation_expr(exprstr){
    var len = exprstr.length

    for (var c of exprstr){
        if(is_whitespace(c) || c == '=') {
            len--
        }else{
            break
        }
    }
    return exprstr.substr(0, len)
}

$B._PyPegen.interpolation = function(p, expression,
    debug, conversion, format,  closing_brace,
    position, arena){

    var lineno = position.lineno,
        col_offset = position.col_offset,
        end_lineno = position.end_lineno,
        end_col_offset = position.end_col_offset
    var conversion_val = _get_interpolation_conversion(p, debug, conversion, format);

    /* Find the non whitespace token after the "=" */
    var debug_end_line, debug_end_offset;
    var debug_metadata;
    var exprstr;

    if(conversion){
        debug_end_line = conversion.result.lineno
        debug_end_offset = conversion.result.col_offset;
        debug_metadata = exprstr = conversion.metadata;
    }else if(format){
        debug_end_line = format.result.lineno;
        debug_end_offset = format.result.col_offset + 1;
        debug_metadata = exprstr = format.metadata;
    }else{
        debug_end_line = end_lineno;
        debug_end_offset = end_col_offset;
        debug_metadata = exprstr = closing_brace.metadata;
    }

    //assert(exprstr != NULL);
    var final_exprstr = _strip_interpolation_expr(exprstr);
    if (final_exprstr){
        p.arena.a_objects.push(final_exprstr)
    }

    var interpolation = $B._PyAST.Interpolation(
        expression, final_exprstr, conversion_val, format ? format.result : NULL)

    set_position_from_obj(interpolation, position)

    if (!debug) {
        return interpolation;
    }

    var debug_text = $B._PyAST.Constant(debug_metadata)
    set_position_from_list(debug_text,
        [lineno, col_offset + 1, debug_end_line, debug_end_offset - 1])

    var values = [debug_text, interpolation]
    var ast_obj = $B._PyAST.JoinedStr(values)
    set_position_from_list(ast_obj,
        [lineno, col_offset, debug_end_line, debug_end_offset])
    console.log('JoinedStr', ast_obj)
    return ast_obj
}

$B._PyPegen.formatted_value = function(p,
        expression, debug,  conversion, format, closing_brace,
        arena){
    var conversion_val = -1
    if(conversion){
        var conversion_expr = conversion.result,
            first = conversion_expr.id
        if(first.length > 1 || ! 'sra'.includes(first)){
            $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(conversion_expr,
                `f-string: invalid conversion character {first}: ` +
                "expected 's', 'r', or 'a'")
        }
        var conversion_val = first.charCodeAt(0)
    }
    var formatted_value = new $B.ast.FormattedValue(expression,
        conversion_val,
        format === undefined ? format : format.result)
    set_position_from_obj(formatted_value, arena)
    if(debug){
        var debug_end_line,
            debug_end_offset,
            debug_metadata
        if(conversion){
            debug_end_line = conversion.result.lineno
            debug_end_offset = conversion.result.col_offset
            debug_metadata = conversion.metadata
        }else if(format){
            debug_end_line = format.result.lineno
            debug_end_offset = format.result.col_offset + 1
            debug_metadata = format.metadata
        }else{
            debug_end_line = p.end_lineno
            debug_end_offset = p.end_col_offset
            debug_metadata = closing_brace.metadata
        }
        var debug = new $B.ast.Constant(debug_metadata)
        debug.lineno = p.lineno
        debug.col_offset = p.col_offset + 1
        debug.end_lineno = debug_end_line
        debug.end_col_offset = debug_end_offset
        var joined_str = new $B.ast.JoinedStr([debug, formatted_value])
        set_position_from_obj(joined_str, arena)
        return joined_str
    }
    return formatted_value
}

$B._PyPegen.decode_fstring_part = function(p, is_raw, constant, token){

    var bstr = constant.value

    var len;
    if(bstr == "{{" || bstr == "}}"){
        len = 1
    }else{
        len = bstr.length
    }

    is_raw = is_raw || ! bstr.includes('\\')
    var str = bstr // $B._PyPegen.decode_string(p, is_raw, bstr, len, token);
    if (str == NULL) {
        _Pypegen_raise_decode_error(p);
        return NULL;
    }
    p.arena.a_objects.push(str)
    return $B._PyAST.Constant(str, NULL,
        constant.lineno, constant.col_offset,
        constant.end_lineno, constant.end_col_offset, p.arena);
}

function _get_resized_exprs(p, a, raw_expressions, b, string_kind){
    var n_items = raw_expressions.length
    var total_items = n_items
    for(var item of raw_expressions){
        if (item instanceof $B.ast.JoinedStr){
            total_items += item.values.length - 1;
        }
    }

    var quote_str = a.bytes
    if (quote_str == NULL) {
        return NULL;
    }
    var is_raw = quote_str.includes('r') || quote_str.includes('R')

    var seq = []

    var index = 0;
    for (var i = 0; i < n_items; i++) {
        var item = raw_expressions[i]

        // This should correspond to a JoinedStr node of two elements
        // created _PyPegen_formatted_value. This situation can only be the result of
        // a (f|t)-string debug expression where the first element is a constant with the text and the second
        // a formatted value with the expression.
        if (item instanceof $B.ast.JoinedStr) {
            var values = item.values
            if (values.length != 2) {
                PyErr_Format(PyExc_SystemError,
                             string_kind == TSTRING
                             ? "unexpected TemplateStr node without debug data in t-string at line %d"
                             : "unexpected JoinedStr node without debug data in f-string at line %d",
                             item.lineno);
                return NULL;
            }

            var first = values[0]
            //assert(first->kind == Constant_kind);
            seq[index++] = first

            var second = values[1]
            // assert((string_kind == TSTRING && second->kind == Interpolation_kind) || second->kind == FormattedValue_kind);
            seq[index++] = second

            continue;
        }

        if(item instanceof $B.ast.Constant){
            item = $B._PyPegen.decode_fstring_part(p, is_raw, item, b);
            if (item == NULL) {
                return NULL;
            }

            /* Tokenizer emits string parts even when the underlying string
            might become an empty value (e.g. FSTRING_MIDDLE with the value \\n)
            so we need to check for them and simplify it here. */
            if(item.value.length == 0) {
                continue;
            }
        }
        seq[index++] = item
    }
    var resized_exprs
    if (index != total_items) {
        resized_exprs = _Py_asdl_expr_seq_new(index, p.arena);
        if (resized_exprs == NULL) {
            return NULL;
        }
        for(var i = 0; i < index; i++) {
            resized_exprs[i] = seq[i]
        }
    }else{
        resized_exprs = seq;
    }
    return resized_exprs;
}

$B._PyPegen.template_str = function(p, a, raw_expressions, b){
    var resized_exprs = _get_resized_exprs(p, a, raw_expressions, b, 'TSTRING')
    var ast_obj = new $B.ast.TemplateStr(resized_exprs)
    set_position_from_list(ast_obj,
        [a.lineno, a.col_offset, b.end_lineno, b.end_col_offset])
    return ast_obj
}

$B._PyPegen.joined_str = function(p, a, items, c){
    var ast_obj = new $B.ast.JoinedStr(items)
    ast_obj.lineno = a.lineno
    ast_obj.col_offset = a.col_offset
    ast_obj.end_lineno = c.end_lineno
    ast_obj.end_col_offset = c.end_col_offset
    return ast_obj
}

$B._PyPegen.setup_full_format_spec = function(p, colon, spec, arena){
    var ast_obj = new $B.ast.JoinedStr(spec)
    set_position_from_obj(ast_obj, arena)
    return result_token_with_metadata(p, ast_obj, colon.metadata)
}

function result_token_with_metadata(p, result, metadata){
    return {result, metadata}
}

$B._PyPegen.check_fstring_conversion = function(p, conv_token, conv){
    if(conv_token.lineno != conv.lineno ||
            conv_token.end_col_offset != conv.col_offset){
        $B._PyPegen.raise_error_known_location(p, _b_.SyntaxError,
            conv.lineno, conv.col_offset, conv.end_lineno, conv.end_col_offset,
            "f-string: conversion type must come right after the exclamanation mark"
        )
    }
    return result_token_with_metadata(p, conv, conv_token.metadata)
}

$B._PyPegen.seq_count_dots = function(seq){
    if(seq === undefined){
        return 0
    }
    var number_of_dots = 0;
    for(var token of seq){
        if(token.num_type == $B.py_tokens.DOT){
            number_of_dots += token.string.length
        }else if(token.num_type == $B.py_tokens.ELLIPSIS){
            number_of_dots += 3
        }
    }

    return number_of_dots;
}

/* Creates a new asdl_seq* with the identifiers of all the names in seq */
$B._PyPegen.map_names_to_ids = function(p, seq){
    return seq.map(e => e.id)
}

$B._PyPegen.alias_for_star = function(p, lineno, col_offset, end_lineno,
                        end_col_offset, arena) {
    var str = "*"
    return $B._PyAST.alias(str, NULL, lineno, col_offset, end_lineno, end_col_offset, arena);
}

/* Constructs a CmpopExprPair */
$B._PyPegen.cmpop_expr_pair = function(p, cmpop, expr){
    return {cmpop, expr}
}

$B._PyPegen.get_cmpops = function(p, seq){
    var new_seq = []
    for (var pair of seq) {
        new_seq.push(pair.cmpop)
    }
    return new_seq
}

$B._PyPegen.get_exprs = function(p, seq){
    var new_seq = []
    for (var pair of seq) {
        new_seq.push(pair.expr)
    }
    return new_seq
}

/* Creates an asdl_seq* where all the elements have been changed to have ctx as context */
function _set_seq_context(p, seq, ctx){
    var new_seq = []
    for (var e of seq) {
        new_seq.push($B._PyPegen.set_expr_context(p, e, ctx))
    }
    return new_seq
}

function _set_name_context(p, e, ctx){
    return $B._PyAST.Name(e.id, ctx, EXTRA_EXPR(e, e))
}

function _set_tuple_context(p, e, ctx){
    return $B._PyAST.Tuple(
            _set_seq_context(p, e.elts, ctx),
            ctx,
            EXTRA_EXPR(e, e));
}

function _set_list_context(p, e, ctx){
    return $B._PyAST.List(
            _set_seq_context(p, e.elts, ctx),
            ctx,
            EXTRA_EXPR(e, e));
}

function _set_subscript_context(p, e, ctx){
    return $B._PyAST.Subscript(e.value, e.slice,
                            ctx, EXTRA_EXPR(e, e));
}

function _set_attribute_context(p, e, ctx){
    return $B._PyAST.Attribute(e.value, e.attr,
                            ctx, EXTRA_EXPR(e, e));
}

function _set_starred_context(p, e, ctx){
    return $B._PyAST.Starred($B._PyPegen.set_expr_context(p, e.value, ctx),
                          ctx, EXTRA_EXPR(e, e));
}

/* Creates an `expr_ty` equivalent to `expr` but with `ctx` as context */
$B._PyPegen.set_expr_context = function(p, expr, ctx){
    var _new = NULL;
    switch (expr.constructor) {
        case $B.ast.Name:
            _new = _set_name_context(p, expr, ctx);
            break;
        case $B.ast.Tuple:
            _new = _set_tuple_context(p, expr, ctx);
            break;
        case $B.ast.List:
            _new = _set_list_context(p, expr, ctx);
            break;
        case $B.ast.Subscript:
            _new = _set_subscript_context(p, expr, ctx);
            break;
        case $B.ast.Attribute:
            _new = _set_attribute_context(p, expr, ctx);
            break;
        case $B.ast.Starred:
            _new = _set_starred_context(p, expr, ctx);
            break;
        default:
            _new = expr;
    }
    return _new;
}

/* Constructs a KeyValuePair that is used when parsing a dict's key value pairs */
$B._PyPegen.key_value_pair = function(p, key, value){
    return {key, value}
}

$B._PyPegen.get_expr_name = function(e){
    switch(e.constructor.$name){
        case 'Attribute':
        case 'Subscript':
        case 'Starred':
        case 'Name':
        case 'List':
        case 'Tuple':
        case 'Lambda':
            return e.constructor.$name.toLowerCase()
        case 'Call':
            return "function call"
        case 'BoolOp':
        case 'BinOp':
        case 'UnaryOp':
            return "expression"
        case 'GeneratorExp':
            return "generator expression";
        case 'Yield':
        case 'YieldFrom':
            return "yield expression";
        case 'Await':
            return "await expression";
        case 'ListComp':
            return "list comprehension";
        case 'SetComp':
            return "set comprehension";
        case 'DictComp':
            return "dict comprehension";
        case 'Dict':
            return "dict literal";
        case 'Set':
            return "set display";
        case 'JoinedStr':
        case 'FormattedValue':
            return "f-string expression";
        case 'Constant':
            var value = e.value
            if (value === _b_.None) {
                return "None";
            }
            if (value === false) {
                return "False";
            }
            if (value === true) {
                return "True";
            }
            if (value === _b_.Ellipsis) {
                return "ellipsis";
            }
            return "literal";
        case 'Compare':
            return "comparison";
        case 'IfExp':
            return "conditional expression";
        case 'NamedExpr':
            return "named expression";
        default:
            /*
            PyErr_Format(PyExc_SystemError,
                         "unexpected expression in assignment %d (line %d)",
                         e.kind, e.lineno);
            */
            return NULL;
    }
}

/* Extracts all keys from an asdl_seq* of KeyValuePair*'s */
$B._PyPegen.get_keys = function(p, seq){
    return seq === undefined ? [] : seq.map(pair => pair.key)
}

/* Extracts all values from an asdl_seq* of KeyValuePair*'s */
$B._PyPegen.get_values = function(p, seq){
    return seq === undefined ? [] : seq.map(pair => pair.value)
}

/* Constructs a KeyPatternPair that is used when parsing mapping & class patterns */
$B._PyPegen.key_pattern_pair = function(p, key, pattern){
    return {key, pattern}
}

/* Extracts all keys from an asdl_seq* of KeyPatternPair*'s */
$B._PyPegen.get_pattern_keys = function(p, seq){
    return seq === undefined ? [] : seq.map(x => x.key)
}

/* Extracts all patterns from an asdl_seq* of KeyPatternPair*'s */
$B._PyPegen.get_patterns = function(p, seq){
    return seq === undefined ? [] : seq.map(x => x.pattern)
}

$B._PyPegen.check_legacy_stmt = function(p, name){
    return ["print", "exec"].includes(name)
}

$B._PyPegen.dummy_name = function(p){
    var cache = NULL;

    if (cache != NULL) {
        return cache;
    }

    var id = "dummy" + Math.random().toString(36).substr(2),
        ast_obj = new $B.ast.Name(id, new $B.ast.Load())
    set_position_from_list(ast_obj, [1, 0, 1, 0])
    return ast_obj
}

$B._PyPegen.add_type_comment_to_arg = function(p, a, tc){
    if (tc == NULL) {
        return a
    }
    var bytes = _b_.bytes.$factory(tc),
        tco = $B._PyPegen.new_type_comment(p, bytes);
    var ast_obj = $B._PyAST.arg(a.arg, a.annotation, tco,
                      a.lineno, a.col_offset, a.end_lineno, a.end_col_offset,
                      p.arena);
    console.log('arg with type comment', ast_obj)
    return ast_obj
}

/* Checks if the NOTEQUAL token is valid given the current parser flags
0 indicates success and nonzero indicates failure (an exception may be set) */
$B._PyPegen.check_barry_as_flufl = function(p, t){
    return false
}

$B._PyPegen.empty_arguments = function(p){
    return $B._PyAST.arguments([], [], NULL, [], [], NULL, [], p.arena)
}

/* Encapsulates the value of an operator_ty into an AugOperator struct */
$B._PyPegen.augoperator = function(p, kind){
    return {kind}
}

/* Construct a FunctionDef equivalent to function_def, but with decorators */
$B._PyPegen.function_def_decorators = function(p, decorators, function_def){
    var constr = function_def instanceof $B.ast.AsyncFunctionDef ?
                     $B.ast.AsyncFunctionDef : $B.ast.FunctionDef
    var ast_obj = new constr(
        function_def.name, function_def.args,
        function_def.body, decorators, function_def.returns,
        function_def.type_comment,
        function_def.type_params)
    for(var position of positions){
        ast_obj[position] = function_def[position]
    }
    return ast_obj
}

/* Construct a ClassDef equivalent to class_def, but with decorators */
$B._PyPegen.class_def_decorators = function(p, decorators, class_def){
    var ast_obj = $B._PyAST.ClassDef(
        class_def.name, class_def.bases,
        class_def.keywords, class_def.body, decorators,
        class_def.type_params)
    set_position_from_obj(ast_obj, class_def)
    return ast_obj
}

/* Construct a KeywordOrStarred */
$B._PyPegen.keyword_or_starred = function(p, element, is_keyword){
    return {
        element,
        is_keyword
    }
}

$B._PyPegen.make_arguments = function(p, slash_without_default,
                        slash_with_default, plain_names,
                        names_with_default, star_etc){
    /* Constructs an arguments_ty object out of all the parsed constructs in the parameters rule */
    var posonlyargs = []
    if (_make_posonlyargs(p, slash_without_default, slash_with_default, posonlyargs) == -1) {
        return NULL;
    }

    var posargs = []
    if (_make_posargs(p, plain_names, names_with_default, posargs) == -1) {
        return NULL;
    }

    var posdefaults = []
    if (_make_posdefaults(p,slash_with_default, names_with_default, posdefaults) == -1) {
        return NULL;
    }

    var vararg = NULL;
    if (star_etc != NULL && star_etc.vararg != NULL) {
        vararg = star_etc.vararg;
    }

    var kwonlyargs = [],
        kwdefaults = [];
    if (_make_kwargs(p, star_etc, kwonlyargs, kwdefaults) == -1) {
        return NULL;
    }

    var kwarg = NULL;
    if (star_etc != NULL && star_etc.kwarg != NULL) {
        kwarg = star_etc.kwarg;
    }

    var ast_obj = $B._PyAST.arguments(posonlyargs, posargs, vararg, kwonlyargs,
                            kwdefaults, kwarg, posdefaults, p.arena)
    if(ast_obj.posonlyargs === undefined){
        console.log('pas de posonlyargs', ast_bj)
        alert()
    }
    return ast_obj
}

$B._PyPegen.name_default_pair = function(p, arg, value, tc){
    return {
        arg: $B._PyPegen.add_type_comment_to_arg(p, arg, tc),
        value: value
    }
}

$B._PyPegen.raise_error = function(p, errtype, errmsg){
    if(p.fill == 0){
        var va = [errmsg]
        $B._PyPegen.raise_error_known_location(p, errtype, 0, 0, 0, -1, errmsg, va);
        return NULL
    }

    var t = p.known_err_token != NULL ? p.known_err_token : p.tokens[p.fill - 1];
    var va = errmsg
    $B._PyPegen.raise_error_known_location(p, errtype,
        t.lineno, t.col_offset, t.end_lineno, t.end_col_offset, errmsg, va);
}

$B._PyPegen.raise_error_known_location = function(p, errtype,
        lineno, col_offset, end_lineno, end_col_offset, errmsg, va){
    var exc = errtype.$factory(errmsg)
    exc.filename = p.filename
    if(p.known_err_token){
        var token = p.known_err_token
        exc.lineno = token.lineno
        exc.offset = token.col_offset + 1
        exc.end_lineno = token.end_lineno
        exc.end_offset = token.end_col_offset
        exc.text = token.line
    }else{
        exc.lineno = lineno
        exc.offset = col_offset + 1
        exc.end_lineno = end_lineno
        exc.end_offset = end_col_offset + 1
        var src = $B.file_cache[p.filename]
        if(src !== undefined){
            var lines = src.split('\n'),
                line = lines[exc.lineno - 1]
            exc.text = line + '\n'
        }else{
            exc.text = _b_.None
        }
    }
    exc.args[1] = $B.fast_tuple([p.filename, exc.lineno, exc.offset, exc.text,
        exc.end_lineno, exc.end_offset])
    throw exc
}

$B._PyPegen.seq_delete_starred_exprs = function(p, kwargs){
    var len = kwargs.length,
        new_len = len - _seq_number_of_starred_exprs(kwargs)
    if (new_len == 0) {
        return NULL;
    }
    var new_seq = []

    for (var k of kwargs){
        if (k.is_keyword) {
            new_seq.push(k.element)
        }
    }
    return new_seq
}

$B._PyPegen.seq_extract_starred_exprs = function(p, kwargs){
    var new_len = _seq_number_of_starred_exprs(kwargs);
    if (new_len == 0) {
        return NULL;
    }
    var new_seq = []

    var idx = 0;
    for (var k of kwargs) {
        if (! k.is_keyword) {
            new_seq[idx++] = k.element
        }
    }
    return new_seq
}

/* Constructs a SlashWithDefault */
$B._PyPegen.slash_with_default = function(p, plain_names, names_with_defaults){
    return {plain_names, names_with_defaults}
}

$B._PyPegen.star_etc = function(p, vararg, kwonlyargs, kwarg){
    return {vararg, kwonlyargs, kwarg}
}

$B._PyPegen.collect_call_seqs = function(p, a, b,
                     lineno, col_offset, end_lineno,
                     end_col_offset, arena) {
    var args_len = a.length,
        total_len = args_len;

    if (b == NULL) {
        return $B._PyAST.Call($B._PyPegen.dummy_name(p), a, [], lineno, col_offset,
                        end_lineno, end_col_offset, arena);
    }

    var starreds = $B._PyPegen.seq_extract_starred_exprs(p, b),
        keywords = $B._PyPegen.seq_delete_starred_exprs(p, b);

    if (starreds) {
        total_len += starreds.length
    }

    var args = []


    for (var i = 0; i < args_len; i++) {
        args[i] = a[i]
    }
    for (; i < total_len; i++) {
        args[i] = starreds[i - args_len]
    }

    return $B._PyAST.Call($B._PyPegen.dummy_name(p), args, keywords, lineno,
                       col_offset, end_lineno, end_col_offset, arena);
}

$B._PyPegen.join_sequences = function(p, a, b){
    return a.concat(b)
}

function make_conversion_code(conv){
    switch(conv){
        case null:
            return -1
        case 'a':
            return 97
        case 'r':
            return 114
        case 's':
            return 115
    }
}

function make_formatted_value(p, fmt_values){
    // format is a sequence of strings and instances of fstring_expression
    if(! fmt_values){
        return
    }
    var seq = []
    for(var item of fmt_values){
        if(typeof item == 'string'){
            var fmt_ast = new $B.ast.Constant(item)
            set_position_from_obj(fmt_ast, p.arena)
        }else{
            var src = item.expression.trimStart() // ignore leading whitespace
            var _ast = new $B.Parser(src, p.filename, 'eval').parse()
            var raw_value = _ast.body
            var fmt_ast = new $B.ast.FormattedValue(raw_value,
                make_conversion_code(item.conversion),
                make_formatted_value(p, item.fmt))
            set_position_from_obj(fmt_ast, _ast)
        }
        seq.push(fmt_ast)
    }
    var ast_obj = new $B.ast.JoinedStr(seq)
    set_position_from_obj(ast_obj, p.arena)
    return ast_obj
}

function _build_concatenated_str(p, strings){
    var len = strings.length

    var n_flattened_elements = 0;
    for(var elem of strings){
        if(elem instanceof $B.ast.JoinedStr ||
                elem instanceof $B.ast.TemplateStr){
            n_flattened_elements += elem.values.length
        }else{
            n_flattened_elements++
        }
    }
    var flattened = []

    /* build flattened list */
    var current_pos = 0;
    for(var elem of strings){
        if(elem instanceof $B.ast.JoinedStr ||
                elem instanceof $B.ast.TemplateStr){
            for(var subvalue of elem.values){
                flattened[current_pos++] = subvalue
            }
        }else{
            flattened[current_pos++] = elem
        }
    }

    /* calculate folded element count */
    var n_elements = 0
    var prev_is_constant = 0
    for(var elem of flattened){
        /* The concatenation of a FormattedValue and an empty Constant should
           lead to the FormattedValue itself. Thus, we will not take any empty
           constants into account, just as in `_PyPegen_joined_str` */
        if(elem instanceof $B.ast.Constant &&
                typeof elem.value == 'string' &&
                elem.value.length == 0){
            continue
        }
        if (!prev_is_constant || ! (elem instanceof $B.ast.Constant)){
            n_elements++;
        }
        prev_is_constant = elem instanceof $B.ast.Constant
    }

    var values = []

    /* build folded list */
    current_pos = 0;
    for(var i = 0, len = flattened.length; i < len; i++){
        var elem = flattened[i]
        /* if the current elem and the following are constants,
           fold them and all consequent constants */
        if(elem instanceof $B.ast.Constant) {
            if (i + 1 < n_flattened_elements &&
                    flattened[i + 1] instanceof $B.ast.Constant){
                var first_elem = elem;

                /* When a string is getting concatenated, the kind of the string
                   is determined by the first string in the concatenation
                   sequence.

                   u"abc" "def" -> u"abcdef"
                   "abc" u"abc" ->  "abcabc" */
                var kind = elem.__class__

                var concat_str = ''
                var last_elem = elem;
                var j
                for(j = i; j < n_flattened_elements; j++) {
                    var current_elem = flattened[j]
                    if(current_elem instanceof $B.ast.Constant){
                        concat_str += current_elem.value
                        last_elem = current_elem;
                    }else{
                        break;
                    }
                }
                i = j - 1
                p.arena.a_objects.push(concat_str)
                elem = new $B.ast.Constant(concat_str, kind)
                set_position_from_list(elem,
                    [first_elem.lineno, first_elem.col_offset,
                     last_elem.end_lineno, last_elem.end_col_offset]);
            }

            /* Drop all empty contanst strings */
            if(elem.value.length == 0){
                continue
            }
        }

        values[current_pos++] = elem
    }

    return values
}


function _build_concatenated_template_str(p, strings){
    var values = _build_concatenated_str(p, strings)
    var ast_obj = new $B.ast.TemplateStr(values)
    var last = strings[strings.length - 1]
    set_position_from_list(ast_obj,
        [strings[0].lineno, strings[0].col_offset,
         last.end_lineno,last.end_col_offset])
    return ast_obj
}

function _build_concatenated_joined_str(p, strings){
    var values = _build_concatenated_str(p, strings)
    var ast_obj = new $B.ast.JoinedStr(values)
    var last = strings[strings.length - 1]
    set_position_from_list(ast_obj,
        [strings[0].lineno, strings[0].col_offset,
         last.end_lineno,last.end_col_offset])
    return ast_obj
}

$B._PyPegen.concatenate_strings = function(p, strings){
    var res = '',
        first = strings[0],
        last = $B.last(strings),
        type

    var state = NULL,
        value,
        values = []

    function error(message){
        var a = {lineno: first.start[0],
                 col_offset: first.start[1],
                 end_lineno : last.end[0],
                 end_col_offset: last.end[1]
                }
        $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, message)
    }

    function set_position_from_list(ast_obj, items){
        var first = items[0],
            last = items[items.length - 1]
        ast_obj.lineno = first.lineno
        ast_obj.col_offset = first.col_offset
        ast_obj.end_lineno = last.end_lineno
        ast_obj.end_col_offset = last.end_col_offset
    }

    function escape_single_quotes(token){
        for(var fs_item of token.values){
            if(fs_item instanceof $B.ast.Constant){
                // escape single quotes not already escaped
                var parts = fs_item.value.split('\\\'')
                parts = parts.map(x => x.replace(new RegExp("'", "g"), "\\'"))
                fs_item.value = parts.join('\\\'')
                fs_item.value = fs_item.value.replace(/\n/g, '\\n')
                                             .replace(/\r/g, '\\r')
            }
        }
    }

    // make a single list with all the strings
    var items = [],
        has_fstring = false,
        has_tstring = false,
        state
    for(var string of strings){
        if(string instanceof $B.ast.JoinedStr){ // fstring
            has_fstring = true
            if(state == 'bytestring'){
                error('cannot mix bytes and nonbytes literals')
            }
            escape_single_quotes(string)
            state = 'string'
        }else if(string instanceof $B.ast.TemplateStr){ // tstring
            has_tstring = true
            if(state == 'bytestring'){
                error('cannot mix bytes and nonbytes literals')
            }
            escape_single_quotes(string)
            state = 'string'
        }else{
            items.push(string)
            var is_bytes = string.value.__class__ === _b_.bytes
            if((is_bytes && state == 'string') ||
                    (state == 'bytestring' && ! is_bytes)){
                error('cannot mix bytes and nonbytes literals')
            }
            state = is_bytes ? 'bytestring' : 'string'
        }
    }

    if(state == 'bytestring'){
        // only bytestrings
        var bytes = []
        for(var item of items){
            bytes = bytes.concat(item.value.source)
        }
        value = _b_.bytes.$factory(bytes)
        var ast_obj = new $B.ast.Constant(value)
        set_position_from_list(ast_obj, items)
        return ast_obj
    }

    // group consecutive strings
    function group_consec_strings(items){
        if(items.length == 1){
            return items[0]
        }
        var values = items.map(x => x.value)
        let ast_obj = new $B.ast.Constant(values.join(''))
        set_position_from_list(ast_obj, items)
        return ast_obj
    }

    var items1 = [],
        consec_strs = [],
        item_type = null
    for(var i = 0, len = items.length; i < len; i++){
        item = items[i]
        if(item_type === null){
            item_type = Object.getPrototypeOf(item)
        }
        if(item instanceof $B.ast.Constant){
            consec_strs.push(item)
        }else{
            if(consec_strs.length > 0){
                items1.push(group_consec_strings(consec_strs))
            }
            consec_strs = []
            items1.push(item)
        }
    }
    if(consec_strs.length > 0){
        items1.push(group_consec_strings(consec_strs))
    }

    if(! has_fstring && ! has_tstring){
        return items1[0]
    }

    if(has_tstring){
        return _build_concatenated_template_str(p, strings)
    }

    return _build_concatenated_joined_str(p, strings)
}

$B._PyPegen.concatenate_tstrings = $B._PyPegen.concatenate_strings

$B._PyPegen.checked_future_import = function(p, module,
        names, level, lineno, col_offset, end_lineno, end_col_offset,
        arena){
    if(level == 0 && module == "__future__"){
        for(var i = 0; i < names.length; i++){
            var alias = names[i]
            if(alias.name == "barry_as_FLUFL"){
                p.flags |= PyPARSE_BARRY_AS_BDFL;
            }
        }
    }
    return $B._PyAST.ImportFrom(module, names, level, lineno, col_offset, end_lineno, end_col_offset, arena);
}

$B._PyPegen.register_stmts = function(p, stmts){
    if(! p.call_invalid_rules){
        return stmts
    }
    var len = stmts.length
    if (len == 0) {
        return stmts
    }
    var last_stmt = stmts[len - 1]
    p.last_stmt_location.lineno = last_stmt.lineno
    p.last_stmt_location.col_offset = last_stmt.col_offset
    p.last_stmt_location.end_lineno = last_stmt.end_lineno
    p.last_stmt_location.end_col_offset = last_stmt.end_col_offset
    return stmts
}

$B._PyPegen.ensure_imaginary = function(p, exp){
    if (! (exp instanceof $B.ast.Constant) ||
            exp.value.__class__ != _b_.complex) {
        $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(exp,
            "imaginary number required in complex literal");
        return NULL
    }
    return exp
}

$B._PyPegen.ensure_real = function(p, exp){
    if (! (exp instanceof $B.ast.Constant) || exp.value.type == 'imaginary') {
       $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(
            exp,
            "real number required in complex literal");
        return NULL
    }
    return exp
}

$B._PyPegen.set_expr_context = function(p, a, ctx){
    a.ctx = ctx
    return a
}

$B._PyPegen.singleton_seq = function(p, a){
    return [a]
}

/* Creates a copy of seq and prepends a to it */
$B._PyPegen.seq_insert_in_front = function(p, a, seq){
    return seq ? [a].concat(seq) : [a]
}

$B._PyPegen.seq_flatten = function(p, seqs){
    var res = []
    for(var seq of seqs){
        for(var item of seq){
            res.push(item)
        }
    }
    return res
}

/* Creates a new name of the form <first_name>.<second_name> */
$B._PyPegen.join_names_with_dot = function(p, first_name, second_name){
    var str = first_name.id + '.' + second_name.id
    return $B._PyAST.Name(str, new $B.ast.Load(),
        EXTRA_EXPR(first_name, second_name))
}

$B._PyPegen.make_module = function(p, a){
    return new $B.ast.Module(a)
}

$B._PyPegen.new_type_comment = function(p, s){
    if(s.length === 0){
        return NULL
    }
    return s
}

$B._PyPegen.get_last_comprehension_item = function(comprehension) {
    if (comprehension.ifs == NULL || comprehension.ifs.length == 0) {
        return comprehension.iter;
    }
    return $B.last(comprehension.ifs);
}

$B._PyPegen.arguments_parsing_error = function(p, e){
    var kwarg_unpacking = 0;
    for (let keyword of e.keywords){
        if (! keyword.arg) {
            kwarg_unpacking = 1;
        }
    }

    var msg = NULL;
    if (kwarg_unpacking) {
        msg = "positional argument follows keyword argument unpacking";
    } else {
        msg = "positional argument follows keyword argument";
    }

    return $B.helper_functions.RAISE_SYNTAX_ERROR(p, msg);
}

$B._PyPegen.nonparen_genexp_in_call = function(p, args, comprehensions){
    /* The rule that calls this function is 'args for_if_clauses'.
       For the input f(L, x for x in y), L and x are in args and
       the for is parsed as a for_if_clause. We have to check if
       len <= 1, so that input like dict((a, b) for a, b in x)
       gets successfully parsed and then we pass the last
       argument (x in the above example) as the location of the
       error */
    var len = args.args.length
    if (len <= 1) {
        return NULL;
    }

    var last_comprehension = $B.last(comprehensions);

    return $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(p,
        args.args[len - 1],
        $B._PyPegen.get_last_comprehension_item(last_comprehension),
        "Generator expression must be parenthesized"
    );
}

$B._PyPegen.get_invalid_target = function(e, targets_type){
    if (e == NULL) {
        return NULL;
    }

    function VISIT_CONTAINER(CONTAINER, TYPE){
        for (var elt of CONTAINER.elts) {
            var child = $B._PyPegen.get_invalid_target(elt, targets_type);
            if (child != NULL) {
                return child;
            }
        }
    }

    // We only need to visit List and Tuple nodes recursively as those
    // are the only ones that can contain valid names in targets when
    // they are parsed as expressions. Any other kind of expression
    // that is a container (like Sets or Dicts) is directly invalid and
    // we don't need to visit it recursively.

    switch (e.constructor) {
        case $B.ast.List:
        case $B.ast.Tuple:
            return VISIT_CONTAINER(e, e.constructor);
        case $B.ast.Starred:
            if (targets_type == DEL_TARGETS) {
                return e;
            }
            return $B._PyPegen.get_invalid_target(e.value, targets_type);
        case $B.ast.Compare:
            // This is needed, because the `a in b` in `for a in b` gets parsed
            // as a comparison, and so we need to search the left side of the comparison
            // for invalid targets.
            if (targets_type == FOR_TARGETS) {
                var cmpop = e.ops[0]
                if (cmpop instanceof $B.ast.In) {
                    return $B._PyPegen.get_invalid_target(e.left, targets_type);
                }
                return NULL;
            }
            return e;
        case $B.ast.Name:
        case $B.ast.Subscript:
        case $B.ast.Attribute:
            return NULL;
        default:
            return e;
    }
}

})(__BRYTHON__);