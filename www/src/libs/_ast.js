var $module = (function($B){

var _b_ = $B.builtins,
    ast = $B.ast, // created in py2js
    mod = {}
mod.PyCF_ONLY_AST = $B.PyCF_ONLY_AST
mod.AST = $B.AST // in builtin_modules.js
$B.create_python_ast_classes() // in py_ast.js
for(var klass in ast){
    mod[klass] = $B.python_ast_classes[klass]
}

var Load = 'Load',
    Store = 'Store',
    Del = 'Del'

// Note: the ensure_literal_* functions are only used to validate a restricted
//       set of non-recursive literals that have already been checked with
//       validate_expr, so they don't accept the validator state
function ensure_literal_number(exp, allow_real, allow_imaginary){
    if(exp.__class__ !== mod.Constant){
        return false
    }
    var value = exp.value
    if(allow_real && _b_.isinstance(value, [_b_.int, _b_.float])){
        return true
    }
    if(allow_imaginary && _b_.isinstance(value, _b_.complex)){
        return true
    }
    return false
}

function ensure_literal_negative(exp, allow_real, allow_imaginary){
    if(exp.__class__ !== mod.UnaryOp){
        return false
    }
    // Must be negation ...
    if(exp.op !== mod.USub) {
        return false
    }
    // ... of a constant ...
    var operand = exp.operand
    if(operand.__class__ !== mod.Constant){
        return false
    }
    // ... number
    return ensure_literal_number(operand, allow_real, allow_imaginary)
}

function ensure_literal_complex(exp){
    if(exp.__class__ !== mod.BinOp){
        return false
    }
    var left = exp.left,
        right = exp.right;
    // Ensure op is addition or subtraction
    if(exp.op !== mod.Add && exp.op !== mod.Sub){
        return false
    }
    // Check LHS is a real number (potentially signed)
    switch(left.__class__){
        case mod.Constant:
            if(!ensure_literal_number(left, true, false)){
                return false
            }
            break;
        case mod.UnaryOp:
            if(!ensure_literal_negative(left, true, false)){
                return false
            }
            break;
        default:
            return false
    }
    // Check RHS is an imaginary number (no separate sign allowed)
    switch(right.__class__){
        case mod.Constant:
            if(!ensure_literal_number(right, false, true)){
                return false
            }
            break;
        default:
            return false
    }
    return true
}

function validate_arguments(args){
    validate_args(args.posonlyargs)
    validate_args(args.args)
    if(args.vararg && args.vararg.annotation){
        validate_expr(args.vararg.annotation, Load)
    }
    validate_args(args.kwonlyargs)
    if(args.kwarg && args.kwarg.annotation){
        validate_expr(args.kwarg.annotation, Load)
    }
    if(args.defaults.length > args.posonlyargs.length + args.args.length){
        throw _b_.ValueError.$factory(
            "more positional defaults than args on arguments")
    }
    if(args.kw_defaults.length != args.kwonlyargs.length){
        throw _b_.ValueError.$factory(
            "length of kwonlyargs is not the same as " +
            "kw_defaults on arguments")
    }
    validate_exprs(args.defaults, Load, 0)
    validate_exprs(args.kw_defaults, Load, 1)
}

function validate_pattern(p, star_ok){
    var ret = -1
    switch(p.__class__) {
        case mod.MatchValue:
            validate_pattern_match_value(p.value)
            break;
        case mod.MatchSingleton:
            if([_b_.None, _b_.True, _b_.False].indexOf(p.value) == -1){
                throw _b_.ValueError(
                    "MatchSingleton can only contain True, False and None")
            }
            break;
        case mod.MatchSequence:
            validate_patterns(p.patterns, 1);
            break;
        case mod.MatchMapping:
            if(p.keys.length != p.patterns.length){
                throw _b_.ValueError.$factory(
                    "MatchMapping doesn't have the same number of keys as patterns");
            }
            if(p.rest){
                validate_capture(p.rest)
            }

            var keys = p.keys;
            for(var key of keys){
                if(key.__class__ === mod.Constant) {
                    var literal = key.value;
                    if([_b_.None, _b_.True, _b_.False].indexOf(literal) > -1){
                        /* validate_pattern_match_value will ensure the key
                           doesn't contain True, False and None but it is
                           syntactically valid, so we will pass those on in
                           a special case. */
                        continue;
                    }
                }
                validate_pattern_match_value(key)
            }
            validate_patterns(p.patterns, 0);
            break;
        case mod.MatchClass:
            if(p.kwd_attrs.length != p.kwd_patterns.length){
                throw _b_.ValueError.$factory(
                    "MatchClass doesn't have the same number of " +
                    "keyword attributes as patterns")
            }
            validate_expr(p.cls, Load)
            var cls = p.cls;
            while(true){
                if(cls.__class__ === mod.Name){
                    break
                }else if(cls.__class__ === mod.Attribute) {
                    cls = cls.value;
                    continue;
                }else {
                    throw _b_.ValueError.$factory(
                        "MatchClass cls field can only contain Name " +
                        "or Attribute nodes.")
                }
            }

            for(var identifier of p.kwd_attrs){
                validate_name(identifier)
            }

            validate_patterns(p.patterns, 0)
            validate_patterns(p.kwd_patterns, 0);
            break;
        case mod.MatchStar:
            if (!star_ok) {
                throw _b_.ValueError.$factory("can't use MatchStar here")
            }
            if(p.name === undefined){
                validate_capture(p.name)
            }
            break;
        case mod.MatchAs:
            if(p.name){
                validate_capture(p.name)
            }
            if(p.pattern == undefined){
                ret = 1;
            }else if(p.name == undefined){
                throw _b_.ValueError.$factory(
                    "MatchAs must specify a target name if a pattern is given")
            }else{
                validate_pattern(p.pattern, 0);
            }
            break;
        case mod.MatchOr:
            if(p.patterns.length < 2){
                throw _b_.ValueError.$factory(
                    "MatchOr requires at least 2 patterns")
            }
            validate_patterns(p.patterns, 0)
            break;
    // No default case, so the compiler will emit a warning if new pattern
    // kinds are added without being handled here
    }
    if(ret < 0){
        throw _b_.SystemError.$factory("unexpected pattern")
    }
    return true
}

function validate_patterns(patterns, star_ok){
    for(var pattern of patterns){
        validate_pattern(pattern, star_ok)
    }
    return true
}

function validate_pattern_match_value(exp){
    validate_expr(exp, Load)
    switch (exp.__class__){
        case mod.Constant:
            /* Ellipsis and immutable sequences are not allowed.
               For True, False and None, MatchSingleton() should
               be used */
            validate_expr(exp, Load)
            var literal = exp.value
            if(_b_.isinstance(literal, [_b_.int, _b_.float, _b_.bytes,
                    _b_.complex, _b_.str])){
                return true
            }
            throw _b_.ValueError.$factory(
                "unexpected constant inside of a literal pattern")
        case mod.Attribute:
            // Constants and attribute lookups are always permitted
            return true
        case mod.UnaryOp:
            // Negated numbers are permitted (whether real or imaginary)
            // Compiler will complain if AST folding doesn't create a constant
            if(ensure_literal_negative(exp, true, true)){
                return true
            }
            break;
        case mod.BinOp:
            // Complex literals are permitted
            // Compiler will complain if AST folding doesn't create a constant
            if(ensure_literal_complex(exp)){
                return true
            }
            break;
        case mod.JoinedStr:
            // Handled in the later stages
            return 1;
        default:
            break;
    }
    throw _b_.ValueError.$factory(
        "patterns may only match literals and attribute lookups")
}

function validate_capture(name){
    if(name == "_"){
        throw _b_.ValueError.$factory("can't capture name '_' in patterns")
    }
    validate_name(name)
}

function validate_name(name){
    var forbidden = ["None", "True", "False"]
    if(forbidden.indexOf(name) > -1){
        throw _b_.ValueError.$factory(`identifier field can't represent` +
            ` '${name}' constant", forbidden[i]`)
    }
    return true
}

function validate_comprehension(gens){
    if(gens.length == 0) {
        throw _b_.ValueError.$factory("comprehension with no generators")
    }
    for(var comp of gens){
        validate_expr(comp.target, Store)
        validate_expr(comp.iter, Load)
        validate_exprs(comp.ifs, Load, 0)
    }
    return true
}

function validate_keywords(keywords){
    for(var keyword of keywords){
        validate_expr(keyword.value, Load)
    }
    return true
}

function validate_args(args){
    for(var arg of args){
        if(arg.annotation){
            validate_expr(arg.annotation, Load)
        }
    }
    return true
}

function validate_nonempty_seq(seq, what, owner){
    if(seq.length > 0){
        return true
    }
    throw _b_.ValueError.$factory(`empty ${what} on ${owner}`)
}

function validate_assignlist(targets, ctx){
    validate_nonempty_seq(targets, "targets", ctx == Del ? "Delete" : "Assign")
    validate_exprs(targets, ctx, 0)
}

function validate_body(body, owner){
    validate_nonempty_seq(body, "body", owner)
    validate_stmts(body)
}

function validate_exprs(exprs, ctx, null_ok){
    for(var expr of exprs){
        if(expr !== _b_.None){
            validate_expr(expr, ctx)
        }else if(!null_ok){
            throw _b_.ValueError.$factory(
                            "None disallowed in expression list")
        }

    }
    return true
}

function validate_expr(exp, ctx){
    var check_ctx = 1,
        actual_ctx;

    /* First check expression context. */
    switch (exp.__class__) {
    case mod.Name:
        validate_name(exp.id)
        actual_ctx = exp.ctx
        break;
    case mod.Attribute:
    case mod.Subscript:
    case mod.Starred:
    case mod.List:
    case mod.Tuple:
        actual_ctx = exp.ctx;
        break
    default:
        if(ctx != Load){
            throw _b_.ValueError.$factory("expression which can't be " +
                `assigned to in ${ctx} context`)
        }
        check_ctx = 0;
        /* set actual_ctx to prevent gcc warning */
        actual_ctx = 0;
    }
    actual_ctx = actual_ctx === 0 ? actual_ctx :
                 actual_ctx.__class__.__name__
    if(check_ctx && actual_ctx != ctx){
        throw _b_.ValueError.$factory(`expression must have ` +
            `${ctx} context but has ${actual_ctx} instead`)
    }

    /* Now validate expression. */
    switch (exp.__class__) {
    case mod.BoolOp:
        if(exp.values.length < 2){
            throw _b_.ValueError.$factory("BoolOp with less than 2 values")
        }
        validate_exprs(exp.values, Load, 0);
        break;
    case mod.BinOp:
        validate_expr(exp.left, Load)
        validate_expr(exp.right, Load)
        break;
    case mod.UnaryOp:
        validate_expr(exp.operand, Load);
        break;
    case mod.Lambda:
        validate_arguments(exp.args)
        validate_expr(exp.body, Load);
        break;
    case mod.IfExp:
        validate_expr(exp.test, Load)
        validate_expr(exp.body, Load)
        validate_expr(exp.orelse, Load)
        break;
    case mod.Dict:
        if(exp.keys.length != exp.values.length){
            throw _b_.ValueError.$factory(
                "Dict doesn't have the same number of keys as values");
        }
        /* null_ok=1 for keys expressions to allow dict unpacking to work in
           dict literals, i.e. ``{**{a:b}}`` */
        validate_exprs(exp.keys, Load, 1)
        validate_exprs(exp.values, Load, 0);
        break;
    case mod.Set:
        validate_exprs(exp.elts, Load, 0);
        break;
    case mod.ListComp:
    case mod.SetComp:
    case mod.GeneratorExp:
        validate_comprehension(exp.generators)
        validate_expr(exp.elt, Load)
        break;
    case mod.DictComp:
        validate_comprehension(exp.generators)
        validate_expr(exp.key, Load)
        validate_expr(exp.value, Load)
        break;
    case mod.Yield:
        if(exp.value){
            validate_expr(exp.value, Load)
        }
        break;
    case mod.YieldFrom:
        validate_expr(exp.value, Load)
        break;
    case mod.Await:
        validate_expr(exp.value, Load)
        break;
    case mod.Compare:
        if(exp.comparators.length == 0){
            throw _b_.ValueError.$factory("Compare with no comparators")
        }
        if(exp.comparators.length != exp.ops){
            throw _b_.ValueError.$factory("Compare has a different number " +
                            "of comparators and operands")
        }
        validate_exprs(exp.comparators, Load, 0)
        validate_expr(exp.left, Load)
        break;
    case mod.Call:
        validate_expr(exp.func, Load)
        validate_exprs(exp.args, Load, 0)
        validate_keywords(exp.keywords)
        break;
    case mod.Constant:
        validate_constant(exp.value)
        break;
    case mod.JoinedStr:
        validate_exprs(exp.values, Load, 0)
        break;
    case mod.FormattedValue:
        validate_expr(exp.value, Load)
        if (exp.format_spec) {
            validate_expr(exp.format_spec, Load)
            break;
        }
        break;
    case mod.Attribute:
        validate_expr(exp.value, Load)
        break;
    case mod.Subscript:
        validate_expr(exp.slice, Load)
        validate_expr(exp.value, Load)
        break;
    case mod.Starred:
        validate_expr(exp.value, ctx)
        break;
    case mod.Slice:
        if(exp.lower){
            validate_expr(exp.lower, Load)
        }
        if(exp.upper){
            validate_expr(exp.upper, Load)
        }
        if(exp.step){
            validate_expr(exp.step, Load)
        }
        break;
    case mod.List:
        validate_exprs(exp.elts, ctx, 0)
        break;
    case mod.Tuple:
        validate_exprs(exp.elts, ctx, 0)
        break;
    case mod.NamedExpr:
        validate_expr(exp.value, Load)
        break;
    /* This last case doesn't have any checking. */
    case mod.Name:
        ret = 1;
        break;
    // No default case mod.so compiler emits warning for unhandled cases
    }
    return true
}

function validate_constant(value){
    if (value == _b_.None || value == _b_.Ellipsis){
        return true
    }
    if(_b_.isinstance(value,
            [_b_.int, _b_.float, _b_.complex, _b_.bool, _b_.bytes, _b_.str])){
        return true
    }

    if(_b_.isinstance(value, [_b_.tuple, _b_.frozenset])){
        var it = _b_.iter(value)
        while(true){
            try{
                var item = _b_.next(it)
                validate_constant(item)
            }catch(err){
                if($B.is_exc(err, [_b_.StopIteration])){
                    return true
                }
                throw err
            }
        }
    }
}

function validate_stmts(seq){
    for(var stmt of seq) {
        if(stmt !== _b_.None){
            validate_stmt(stmt)
        }else{
            throw _b_.ValueError.$factory("None disallowed in statement list");
        }
    }
}

function validate_stmt(stmt){
    switch (stmt.__class__) {
    case mod.FunctionDef:
        validate_body(stmt.body, "FunctionDef")
        validate_arguments(stmt.args)
        validate_exprs(stmt.decorator_list, Load, 0)
        if(stmt.returns){
             validate_expr(stmt.returns, Load)
        }
        break;
    case mod.ClassDef:
        validate_body(stmt.body, "ClassDef")
        validate_exprs(stmt.bases, Load, 0)
        validate_keywords(stmt.keywords)
        validate_exprs(stmtdecorator_list, Load, 0)
        break;
    case mod.Return:
        if(stmt.value){
            validate_expr(stmt.value, Load)
        }
        break;
    case mod.Delete:
        validate_assignlist(stmt.targets, Del);
        break;
    case mod.Assign:
        validate_assignlist(stmt.targets, Store)
        validate_expr(stmt.value, Load)
        break;
    case mod.AugAssign:
        validate_expr(stmt.target, Store) &&
            validate_expr(stmt.value, Load);
        break;
    case mod.AnnAssign:
        if(stmt.target.__class__ != mod.Name && stmt.simple){
            throw _b_.TypeError.$factory(
                "AnnAssign with simple non-Name target")
        }
        validate_expr(stmt.target, Store)
        if(stmt.value){
            validate_expr(stmt.value, Load)
            validate_expr(stmt.annotation, Load);
        }
        break;
    case mod.For:
        validate_expr(stmt.target, Store)
        validate_expr(stmt.iter, Load)
        validate_body(stmt.body, "For")
        validate_stmts(stmt.orelse)
        break;
    case mod.AsyncFor:
        validate_expr(stmt.target, Store)
        validate_expr(stmt.iter, Load)
        validate_body(stmt.body, "AsyncFor")
        validate_stmts(stmt.orelse)
        break;
    case mod.While:
        validate_expr(stmt.test, Load)
        validate_body(stmt.body, "While")
        validate_stmts(stmt.orelse)
        break;
    case mod.If:
        validate_expr(stmt.test, Load)
        validate_body(stmt.body, "If")
        validate_stmts(stmt.orelse)
        break;
    case mod.With:
        validate_nonempty_seq(stmt.items, "items", "With")
        for (var item of stmt.items){
            validate_expr(item.context_expr, Load) &&
                (! item.optional_vars || validate_expr(item.optional_vars, Store))
        }
        validate_body(stmt.body, "With");
        break;
    case mod.AsyncWith:
        validate_nonempty_seq(stmt.items, "items", "AsyncWith")
        for(var item of stmt.items){
            validate_expr(item.context_expr, Load)
            if(item.optional_vars){
                validate_expr(item.optional_vars, Store)
            }
        }
        validate_body(stmt.body, "AsyncWith");
        break;
    case mod.Match:
        validate_expr(stmt.subject, Load)
        validate_nonempty_seq(stmt.cases, "cases", "Match")
        for(var m of stmt.cases){
            validate_pattern(m.pattern, 0)
            if(m.guard){
                validate_expr(m.guard, Load)
            }
            validate_body(m.body, "match_case")
        }
        break;
    case mod.Raise:
        if(stmt.exc){
            validate_expr(stmt.exc, Load)
            if(stmt.cause){
                validate_expr(stmt.cause, Load)
            }
            break;
        }
        if(stmt.cause) {
            throw _b_.ValueError.$factory("Raise with cause but no exception");
        }
        break;
    case mod.Try:
        validate_body(stmt.body, "Try")
        if(stmt.handlers.length == 0 + stmt.finalbody.length == 0){
            throw _b_.ValueError.$factor(
                "Try has neither except handlers nor finalbody");
        }
        if(stmt.handlers.length == 0 && stmt.orelse.length > 0){
            throw _b_.ValueError.$factory(
                "Try has orelse but no except handlers");
        }
        for(var handler of stmt.handlers){
            if(handler.type){
                validate_expr(handler.type, Load)
                validate_body(handler.body, "ExceptHandler")
            }
        }
        if(stmt.finalbody.length > 0){
            validate_stmts(stmt.finalbody)
        }
        if(stmt.orelse.length > 0){
            validate_stmts(stmt.orelse)
        }
        break;
    case mod.TryStar:
        validate_body(stmt.body, "TryStar")
        if(stmt.handlers.length + stmt.finalbody.length == 0){
            throw _b_.ValueError.$factory(
                "TryStar has neither except handlers nor finalbody");
        }
        if(stmt.handlers.length == 0 && stmt.orelse.length > 0){
            throw _b_.ValueError.$factory(
                "TryStar has orelse but no except handlers");
        }
        for(var handler of stm.handlers){
            if(handler.type){
                validate_expr(handler.type, Load)
                validate_body(handler.body, "ExceptHandler")
            }
        }
        if(stmt.finalbody.length > 0){
            validate_stmts(stmt.finalbody)
        }
        if(stmt.orelse.length > 0){
            validate_stmts(stmt.orelse)
        }
        break;
    case mod.Assert:
        validate_expr(stmt.test, Load)
        if(stmt.msg){
            validate_expr(stmt.msg, Load)
        }
        break;
    case mod.Import:
        validate_nonempty_seq(stmt.names, "names", "Import");
        break;
    case mod.ImportFrom:
        if(stmt.level < 0) {
            throw _b_.ValueError.$factory("Negative ImportFrom level")
        }
        validate_nonempty_seq(stmt.names, "names", "ImportFrom");
        break;
    case mod.Global:
        validate_nonempty_seq(stmt.names, "names", "Global");
        break;
    case mod.Nonlocal:
        validate_nonempty_seq(stmt.names, "names", "Nonlocal");
        break;
    case mod.Expr:
        validate_expr(stmt.value, Load);
        break;
    case mod.AsyncFunctionDef:
        validate_body(stmt.body, "AsyncFunctionDef")
        validate_arguments(stmt.args)
        validate_exprs(stmt.decorator_list, Load, 0)
        if(stmt.returns){
            validate_expr(stmt.returns, Load)
        }
        break;
    case mod.Pass:
    case mod.Break:
    case mod.Continue:
        break;
    // No default case so compiler emits warning for unhandled cases
    }
}


mod._validate = function(ast_obj){
    switch (ast_obj.__class__) {
        case mod.Module:
            validate_stmts(ast_obj.body);
            break;
        case mod.Interactive:
            validate_stmts(ast_obj.body);
            break;
        case mod.Expression:
            validate_expr(ast_obj.body, Load);
            break;
        case mod.FunctionType:
            validate_exprs(ast_obj.argtypes, Load, 0) &&
                  validate_expr(ast_obj.returns, Load);
            break;
        // No default case so compiler emits warning for unhandled cases
    }
}
return mod

}
)(__BRYTHON__)
