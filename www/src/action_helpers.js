// Adapted from CPython Parser/action_helpers.c
(function($B){

var _b_ = $B.builtins,
    NULL = undefined

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
    ast_obj.lineno = token.start[0]
    ast_obj.col_offset = token.start[1]
    ast_obj.end_lineno = token.end[0]
    ast_obj.end_col_offset = token.end[1]
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
        slash_with_default_names =
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
        names_with_default_names = _get_names(p, names_with_default);
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

$B._PyPegen.seq_count_dots = function(seq){
    if(seq === undefined){
        return 0
    }
    var number_of_dots = 0;
    for (var current_expr of seq) {
        switch (current_expr.type) {
            case ELLIPSIS:
                number_of_dots += 3;
                break;
            case DOT:
                number_of_dots += 1;
                break;
            default:
                Py_UNREACHABLE();
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

/* Extracts all keys from an asdl_seq* of KeyValuePair*'s */
$B._PyPegen.get_keys = function(p, seq){
    return seq === undefined ? [] : seq.map(pair => pair.key)
}

/* Extracts all values from an asdl_seq* of KeyValuePair*'s */
$B._PyPegen.get_values = function(p, seq){
    return seq === undefined ? [] : seq.map(pair => pair.value)
}

$B._PyPegen.check_legacy_stmt = function(p, name) {
    return ["print", "exec"].indexOf(name) > -1
}

$B._PyPegen.dummy_name = function(p){
    var cache = NULL;

    if (cache != NULL) {
        return cache;
    }

    var id = "",
        ast_obj = new $B.ast.Name(id, new $B.ast.Load())
    set_position_from_list(ast_obj, [1, 0, 1, 0])
    return cache;
}

$B._PyPegen.add_type_comment_to_arg = function(p, a, tc){
    if (tc == NULL) {
        return a
    }
    var bytes = _b_.bytes.$factory(tc),
        tco = $B._PyPegen.new_type_comment(p, bytes);
    return $B._PyAST.arg(a.arg, a.annotation, tco,
                      a.lineno, a.col_offset, a.end_lineno, a.end_col_offset,
                      parena);
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
        function_def.type_comment)
    for(var position of positions){
        ast_obj[position] = function_def[position]
    }
    return ast_obj
}

/* Construct a ClassDef equivalent to class_def, but with decorators */
$B._PyPegen.class_def_decorators = function(p, decorators, class_def){
    return $B._PyAST.ClassDef(
        class_def.name, class_def.bases,
        class_def.keywords, class_def.body, decorators,
        class_def.lineno, class_def.col_offset, class_def.end_lineno,
        class_def.end_col_offset, p.arena)
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

    return $B._PyAST.arguments(posonlyargs, posargs, vararg, kwonlyargs,
                            kwdefaults, kwarg, posdefaults, p.arena);
}

$B._PyPegen.name_default_pair = function(p, arg, value, tc){
    return {
        arg: $B._PyPegen.add_type_comment_to_arg(p, arg, tc),
        value: value
    }
}

$B._PyPegen.raise_error_known_location = function(errtype,
        lineno, col_offset, end_lineno, end_col_offset, errmsg, va){
    var exc = errtype.$factory(errmsg)
    exc.lineno = lineno
    exc.offset = col_offset
    exc.end_lineno = end_lineno
    exc.end_offset = end_col_offset
    var lines = $B.parser_state.src.split('\n'),
        line = lines[exc.lineno - 1]
    exc.text = line
    exc.args[1] = ['filename', lineno, col_offset, line]
    $B.handle_error(exc)
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

$B._PyPegen.concatenate_strings = function(p, strings){
    // strings is a list of tokens
    var res = '',
        first = strings[0],
        last = $B.last(strings)

    var state = {
        last_str: NULL,
        fmode: 0,
        expr_list: []
    }

    for(var token of strings){
        var s = $B.prepare_string(token.string),
            values = s.value
        if(Array.isArray(values)){
            // fstring
            var jstr_values = []
            for(var value of values){
                if(typeof value == "string"){
                    value = value.replace(/\n/g,'\\n\\\n')
                    value = value.replace(/\r/g,'\\r\\\r')
                    try{
                        var str_ast = new $B.ast.Constant(value)
                        set_position_from_token(str_ast, token)
                        jstr_values.push(str_ast)
                    }catch(err){
                        console.log('error eval string', value)
                        throw err
                    }
                }else{
                    if(value.format !== undefined){
                        value.format = new $B.ast.JoinedStr(value.format)
                    }
                    var src = value.expression.trimStart() // ignore leading whitespace
                    var tokens = []
                    for(var token of __BRYTHON__.tokenizer(src)){
                      if(['COMMENT', 'NL', 'ENCODING', 'TYPE_COMMENT'].indexOf(token[0]) == -1){
                        tokens.push(token)
                      }
                    }
                    var _ast = new __BRYTHON__.Parser(src).feed(tokens)
                    // _ast is a Module with a single Expr in attribute body
                    _ast = _ast.body[0].value
                    jstr_values.push(_ast)
                }
            }
            var ast_obj = new $B.ast.JoinedStr(jstr_values)
        }else{
            value = values.replace(/\n/g,'\\n\\\n')
            value = value.replace(/\r/g,'\\r\\\r')
            try{
                res += eval(value)
            }catch(err){
                console.log('error eval string', s)
                throw err
            }
            var ast_obj = new $B.ast.Constant(res)
        }
    }
    ast_obj.lineno = first.start[0]
    ast_obj.col_offset = first.start[1]
    ast_obj.end_lineno = last.end[0]
    ast_obj.end_col_offset = last.end[1]
    return ast_obj
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
    var res = new $B.ast.Module(a)
    return res
}

})(__BRYTHON__)