// Python to Javascript translation engine

;(function($B){

$B.produce_ast = false

Number.isInteger = Number.isInteger || function(value) {
  return typeof value === 'number' &&
    isFinite(value) &&
    Math.floor(value) === value
};

Number.isSafeInteger = Number.isSafeInteger || function (value) {
   return Number.isInteger(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
};

var js,$pos,res,$op
var _b_ = $B.builtins
var _window
if ($B.isNode){
    _window={ location: {
        href:'',
        origin: '',
        pathname: ''} }
} else {
    _window=self
}
$B.parser = {}

/*
Utility functions
=================
*/

// Return a clone of an object
var clone = $B.clone = function(obj){
    var res = {}
    for(var attr in obj){
        res[attr] = obj[attr]
    }
    return res
}

// Last element in a list
$B.last = function(table){
    if(table === undefined){
        console.log($B.frames_stack.slice())
    }
    return table[table.length - 1]
}

// Convert a list to an object indexed with list values
$B.list2obj = function(list, value){
    var res = {},
        i = list.length
    if(value === undefined){
        value = true
    }
    while(i-- > 0){
        res[list[i]] = value
    }
    return res
}

/*
Internal variables
==================
*/

// Mapping between operators and special Python method names
$B.op2method = {
    operations: {
        "**": "pow", "//": "floordiv", "<<": "lshift", ">>": "rshift",
        "+": "add", "-": "sub", "*": "mul", "/": "truediv", "%": "mod",
        "@": "matmul" // PEP 465
    },
    augmented_assigns: {
        "//=": "ifloordiv", ">>=": "irshift", "<<=": "ilshift", "**=": "ipow",
        "+=": "iadd","-=": "isub", "*=": "imul", "/=": "itruediv",
        "%=": "imod", "&=": "iand","|=": "ior","^=": "ixor", "@=": "imatmul"
    },
    binary: {
        "&": "and", "|": "or", "~": "invert", "^": "xor"
    },
    comparisons: {
        "<": "lt", ">": "gt", "<=": "le", ">=": "ge", "==": "eq", "!=": "ne"
    },
    boolean: {
        "or": "or", "and": "and", "in": "in", "not": "not", "is": "is"
    },
    subset: function(){
        var res = {},
            keys = []
        if(arguments[0] == "all"){
            keys = Object.keys($B.op2method)
            keys.splice(keys.indexOf("subset"), 1)
        }else{
            for(var arg of arguments){
                keys.push(arg)
            }
        }
        for(var key of keys){
            var ops = $B.op2method[key]
            if(ops === undefined){
                throw Error(key)
            }
            for(var attr in ops){
                res[attr] = ops[attr]
            }
        }
        return res
    }
}

var $operators = $B.op2method.subset("all")

$B.method_to_op = {}
for(var category in $B.op2method){
    for(var op in $B.op2method[category]){
        var method = `__${$B.op2method[category][op]}__`
        $B.method_to_op[method] = op
    }
}

// Mapping between augmented assignment operators and method names
var $augmented_assigns = $B.augmented_assigns = $B.op2method.augmented_assigns

// Names that can't be assigned to
var noassign = $B.list2obj(['True', 'False', 'None', '__debug__'])

// Operators weight for precedence
var $op_order = [['or'], ['and'], ['not'],
    ['in','not_in'],
    ['<', '<=', '>', '>=', '!=', '==', 'is', 'is_not'],
    ['|'],
    ['^'],
    ['&'],
    ['>>', '<<'],
    ['+', '-'],
    ['*', '@', '/', '//', '%'],
    ['unary_neg', 'unary_inv', 'unary_pos'],
    ['**']
]

var $op_weight = {},
    $weight = 1
for(var _tmp of $op_order){
    for(var item of _tmp){
        $op_weight[item] = $weight
    }
    $weight++
}

// $B.ast is in generated script py_ast.js
var ast = $B.ast,
    op2ast_class = $B.op2ast_class

function ast_body(block_ctx){
    // return the attribute body of nodes with a block (def, class etc.)
    var body = []
    for(var child of block_ctx.node.children){
        var ctx = child.context.tree[0]
        if(['single_kw', 'except', 'decorator'].indexOf(ctx.type) > -1 ||
            (ctx.type == 'condition' && ctx.token == 'elif')){
            continue
        }
        var child_ast = ctx.ast()
        if(ast.expr.indexOf(child_ast.constructor) > -1){
            child_ast = new ast.Expr(child_ast)
            copy_position(child_ast, child_ast.value)
        }
        body.push(child_ast)
    }
    return body
}

var ast_dump = $B.ast_dump = function(tree, indent){
    indent = indent || 0
    if(tree === _b_.None){
        // happens in dictionary keys for **kw
        return 'None'
    }else if(typeof tree == 'string'){
        return `'${tree}'`
    }else if(typeof tree == 'number'){
        return tree + ''
    }else if(tree.imaginary){
        return tree.value + 'j'
    }else if(Array.isArray(tree)){
        if(tree.length == 0){
            return '[]'
        }
        res = '[\n'
        var items = []
        for(var x of tree){
            try{
                items.push(ast_dump(x, indent + 1))
            }catch(err){
                console.log('error', tree)
                console.log('for item', x)
                throw err
            }
        }
        res += items.join(',\n')
        return res + ']'
    }else if(tree.$name){
        return tree.$name + '()'
    }else if(tree instanceof ast.MatchSingleton){
        return `MatchSingleton(value=${$B.AST.$convert(tree.value)})`
    }else if(tree instanceof ast.Constant){
        var value = tree.value
        // For imaginary numbers, value is an object with
        // attribute "imaginary" set
        if(value.imaginary){
            return `Constant(value=${_b_.repr(value.value)}j)`
        }
        return `Constant(value=${$B.AST.$convert(value)})`
    }
    var proto = Object.getPrototypeOf(tree).constructor
    var res = '  ' .repeat(indent) + proto.$name + '('
    if($B.ast_classes[proto.$name] === undefined){
        console.log('no ast class', proto)
    }
    var attr_names = $B.ast_classes[proto.$name].split(','),
        attrs = []
    // remove trailing * in attribute names
    attr_names = attr_names.map(x => (x.endsWith('*') || x.endsWith('?')) ?
                                     x.substr(0, x.length - 1) : x)
    if([ast.Name].indexOf(proto) > -1){
        for(var attr of attr_names){
            if(tree[attr] !== undefined){
                attrs.push(`${attr}=${ast_dump(tree[attr])}`)
            }
        }
        return res + attrs.join(', ') + ')'
    }
    for(var attr of attr_names){
        if(tree[attr] !== undefined){
            var value = tree[attr]
            attrs.push(attr + '=' +
                ast_dump(tree[attr], indent + 1).trimStart())
        }
    }
    if(attrs.length > 0){
        res += '\n'
        res += attrs.map(x => '  '.repeat(indent + 1) + x).join(',\n')
    }
    res  += ')'
    return res
}

// Get options set by "from __future__ import XXX"
var CO_FUTURE_ANNOTATIONS = 0x1000000

function get_line(filename, lineno){
    var src = $B.file_cache[filename],
        line = _b_.None
    if(src !== undefined){
        var lines = src.split('\n')
        line = lines[lineno - 1]
    }
    return line
}

// Adapted from Python/future.c
var VALID_FUTURES = ["nested_scopes",
                    "generators",
                    "division",
                    "absolute_import",
                    "with_statement",
                    "print_function",
                    "unicode_literals",
                    "barry_as_FLUFL",
                    "generator_stop",
                    "annotations"]

$B.future_features = function(mod, filename){
    var features = 0
    var i = 0;
    if(mod.body[0] instanceof $B.ast.Expr){
        if(mod.body[0].value instanceof $B.ast.Constant &&
                typeof mod.body[0].value.value == "string"){
            // docstring
            i++
        }
    }
    while(i < mod.body.length){
        var child = mod.body[i]
        if(child instanceof $B.ast.ImportFrom && child.module == '__future__'){
            // check names, update features
            for(var alias of child.names){
                var name = alias.name
                if(name == "braces"){
                    raise_error_known_location(_b_.SyntaxError, filename,
                        alias.lineno, alias.col_offset,
                        alias.end_lineno, alias.end_col_offset,
                        get_line(filename, child.lineno),
                        "not a chance")
                }else if(name == "annotations"){
                    features |= CO_FUTURE_ANNOTATIONS
                }else if(VALID_FUTURES.indexOf(name) == -1){
                    raise_error_known_location(_b_.SyntaxError, filename,
                        alias.lineno, alias.col_offset,
                        alias.end_lineno, alias.end_col_offset,
                        get_line(filename, child.lineno),
                        `future feature ${name} is not defined`)
                }
            }
            i++
        }else{
            break
        }
    }
    return {features}
}

// Functions used to set position attributes to AST nodes
function set_position(ast_obj, position, end_position){
    ast_obj.lineno = position.start[0]
    ast_obj.col_offset = position.start[1]
    position = end_position || position
    ast_obj.end_lineno = position.end[0]
    ast_obj.end_col_offset = position.end[1]
}

function copy_position(target, origin){
    target.lineno = origin.lineno
    target.col_offset = origin.col_offset
    target.end_lineno = origin.end_lineno
    target.end_col_offset = origin.end_col_offset
}

/*
Function called in case of SyntaxError or IndentationError
==========================================================
*/
function first_position(context){
    var ctx = context
    while(ctx.tree && ctx.tree.length > 0){
        ctx = ctx.tree[0]
    }
    return ctx.position
}

function last_position(context){
    var ctx = context
    while(ctx.tree && ctx.tree.length > 0){
        ctx = $B.last(ctx.tree)
        if(ctx.end_position){
            return ctx.end_position
        }
    }
    return ctx.end_position || ctx.position
}

function raise_error_known_location(type, filename, lineno, col_offset,
        end_lineno, end_col_offset, line, message){
    var exc = type.$factory(message)
    exc.filename = filename
    exc.lineno = lineno
    exc.offset = col_offset + 1
    exc.end_lineno = end_lineno
    exc.end_offset = end_col_offset + 1
    exc.text = line
    exc.args[1] = $B.fast_tuple([filename, exc.lineno, exc.offset, exc.text,
                   exc.end_lineno, exc.end_offset])
    exc.$stack = $B.frames_stack.slice()
    throw exc
}

function raise_syntax_error_known_range(context, a, b, msg){
    // a and b are the first and last tokens for the exception
    raise_error_known_location(_b_.SyntaxError, $get_module(context).filename,
        a.start[0], a.start[1], b.end[0], b.end[1], a.line, msg)
}

function raise_error(errtype, context, msg, token){
    var filename = $get_module(context).filename
    token = token || $token.value
    msg = msg || 'invalid syntax'
    if(msg.startsWith('(')){
        msg = 'invalid syntax ' + msg
    }
    msg = msg.trim()
    raise_error_known_location(errtype, filename,
        token.start[0], token.start[1], token.end[0], token.end[1], token.line, msg)
}

function raise_syntax_error(context, msg, token){
    raise_error(_b_.SyntaxError, context, msg, token)
}

function raise_indentation_error(context, msg, indented_node){
    // IndentationError
    if(indented_node){
        // indent is the node that expected an indentation
        var type = indented_node.context.tree[0].type,
            token = indented_node.context.tree[0].token,
            lineno = indented_node.line_num
        switch(type){
            case 'class':
                type = 'class definition'
                break
            case 'condition':
                type = `'${token}' statement`
                break
            case 'def':
                type = 'function definition'
                break
            case 'case':
            case 'except':
            case 'for':
            case 'match':
            case 'try':
            case 'while':
            case 'with':
                type = `'${type}' statement`
                break
            case 'single_kw':
                type = `'${token}' statement`
                break
        }
        msg += ` after ${type} on line ${lineno}`
    }
    raise_error(_b_.IndentationError, context, msg)
}

/*
Function that checks that a context is not inside another incompatible
context. Used for (augmented) assignements */
function check_assignment(context, kwargs){
    // kwargs, if provided, is a Javascript object that can have these
    // attributes:
    //  .once : if set, only check the context; otherwise, also check
    //      the context's parents
    //  .delete: if set, the context checked is not an assignment but
    //      a "del"; adapt error message

    function in_left_side(context, assign_type){
        var ctx = context
        while(ctx){
            if(ctx.parent && ctx.parent.type == assign_type &&
                    ctx === ctx.parent.tree[0]){
                return true
            }
            ctx = ctx.parent
        }
    }

    var once,
        action = 'assign to',
        augmented = false
    if(kwargs){
        once = kwargs.once
        action = kwargs.action || action
        augmented = kwargs.augmented === undefined ? false : kwargs.augmented
    }
    var ctx = context,
        forbidden = ['assert', 'import', 'raise', 'return', 'decorator',
            'comprehension', 'await']
    if(action != 'delete'){
        // "del x = ..." is invalid
        forbidden.push('del')
    }

    function report(wrong_type, a, b){
        a = a || context.position
        b = b || $token.value
        if(augmented){
            raise_syntax_error_known_range(
                context, a, b,
                `'${wrong_type}' is an illegal expression ` +
                    'for augmented assignment')
        }else{
            var msg = wrong_type
            if(Array.isArray(msg)){
                // eg assignment to None
                msg = msg[0]
            }else if($token.value.string == '=' && $token.value.type == 'OP'){
                if($parent_match(context, {type: 'augm_assign'})){
                    // "x += 1, y = 2"
                    raise_syntax_error(context)
                }
                if(! $parent_match(context, {type: 'list_or_tuple'})){
                    msg += " here. Maybe you meant '==' instead of '='?"
                }
            }
            raise_syntax_error_known_range(
                context,
                a, b,
                `cannot ${action} ${msg}`)
        }
    }

    if(context.type == 'expr'){
        var upper_expr = context
        var ctx = context
        while(ctx.parent){
            if(ctx.parent.type == 'expr'){
                upper_expr = ctx.parent
            }
            ctx = ctx.parent
        }
        // context = upper_expr
    }

    // no assign in left side of augmented assignment
    if(in_left_side(context, 'augm_assign')){
        raise_syntax_error(context)
    }

    if(context.type == 'target_list'){
        for(var target of context.tree){
            check_assignment(target, {action: 'assign to'})
        }
        return
    }
    ctx = context
    while(ctx){
        if(forbidden.indexOf(ctx.type) > -1){
            raise_syntax_error(context,
                `(assign to ${ctx.type})`)
        }else if(ctx.type == "expr"){
            if($parent_match(ctx, {type: 'annotation'})){
                return true
            }
            if(ctx.parent.type == 'yield'){
                raise_syntax_error_known_range(ctx, ctx.parent.position,
                   last_position(ctx),
                   "assignment to yield expression not possible")
            }

            var assigned = ctx.tree[0]
            if(assigned.type == "op"){
                if($B.op2method.comparisons[ctx.tree[0].op] !== undefined){
                    if($parent_match(ctx, {type: 'target_list'})){
                        // "for i < (): pass"
                        raise_syntax_error(context)
                    }
                    report('comparison', assigned.tree[0].position,
                        last_position(assigned))
                }else{
                    report('expression', assigned.tree[0].position,
                        last_position(assigned))
                }
            }else if(assigned.type == 'attribute' &&
                    $parent_match(ctx, {type: 'condition'})){
                report('attribute', ctx.position, last_position(context))
            }else if(assigned.type == 'sub' &&
                    $parent_match(ctx, {type: 'condition'})){
                report('subscript', ctx.position, last_position(context))
            }else if(assigned.type == 'unary'){
                report('expression', assigned.position, last_position(assigned))
            }else if(assigned.type == 'call'){
                report('function call', assigned.position, assigned.end_position)
            }else if(assigned.type == 'id'){
                var name = assigned.value
                if(['None', 'True', 'False', '__debug__'].indexOf(name) > -1){
                    // argument as Array to avoid adding "Maybe you meant =="
                    if(name == '__debug__' && augmented){
                        // special case (or inconsistency ?)
                        $token.value = assigned.position
                        raise_syntax_error(assigned,
                            'cannot assign to __debug__')
                    }
                    report([name])
                }
                if(noassign[name] === true){
                    report(keyword)
                }
            }else if(['str', 'int', 'float', 'complex'].indexOf(assigned.type) > -1){
                if(ctx.parent.type != 'op'){
                    report('literal')
                }
            }else if(assigned.type == "ellipsis"){
                report('ellipsis')
            }else if(assigned.type == 'genexpr'){
                report(['generator expression'])
            }else if(assigned.type == 'starred'){
                if(action == 'delete'){
                    report('starred', assigned.position, last_position(assigned))
                }
                check_assignment(assigned.tree[0], {action, once: true})
            }else if(assigned.type == 'named_expr'){
                if(! assigned.parenthesized){
                    report('named expression')
                }else if(ctx.parent.type == 'node'){
                    raise_syntax_error_known_range(
                        context,
                        assigned.target.position,
                        last_position(assigned),
                        "cannot assign to named expression here. " +
                            "Maybe you meant '==' instead of '='?")
                }else if(action == 'delete'){
                    report('named expression', assigned.position,
                        last_position(assigned))
                }
            }else if(assigned.type == 'list_or_tuple'){
                for(var item of ctx.tree){
                    check_assignment(item, {action, once: true})
                }
            }else if(assigned.type == 'dict_or_set'){
                if(assigned.closed){
                    report(assigned.real == 'set' ? 'set display' : 'dict literal',
                        ctx.position,
                        last_position(assigned))
                }
            }else if(assigned.type == 'lambda'){
                report('lambda')
            }else if(assigned.type == 'ternary'){
                report(['conditional expression'])
            }else if(assigned.type == 'JoinedStr'){
                report('f-string expression',
                    assigned.position,
                    last_position(assigned))
            }
        }else if(ctx.type == 'list_or_tuple'){
            for(var item of ctx.tree){
                check_assignment(item, {action, once: true})
            }
        }else if(ctx.type == 'ternary'){
            report(['conditional expression'],
                   ctx.position, last_position(context))
        }else if(ctx.type == 'op'){
            var a = ctx.tree[0].position,
                last = $B.last(ctx.tree).tree[0],
                b = last.end_position || last.position
            if($B.op2method.comparisons[ctx.op] !== undefined){
                if($parent_match(context, {type: 'target_list'})){
                    // "for i < (): pass"
                    raise_syntax_error(context)
                }
                report('comparison', a, b)
            }else{
                report('expression', a, b)
            }
        }else if(ctx.type == 'yield'){
            report('yield expression')
        }else if(ctx.comprehension){
            break
        }
        if(once){
            break
        }
        ctx = ctx.parent
    }
}

function remove_abstract_expr(tree){
    if(tree.length > 0 && $B.last(tree).type == 'abstract_expr'){
        tree.pop()
    }
}

$B.format_indent = function(js, indent){
    // Indent JS code based on curly braces ({ and })
    var indentation = '  ',
        lines = js.split('\n'),
        level = indent,
        res = '',
        last_is_closing_brace = false,
        last_is_backslash = false,
        last_is_var_and_comma = false
    for(var i = 0, len = lines.length; i < len; i++){
        var line = lines[i],
            add_closing_brace = false,
            add_spaces = true
        if(last_is_backslash){
            add_spaces = false
        }else if(last_is_var_and_comma){
            line = '    ' + line.trim()
        }else{
            line = line.trim()
        }
        if(add_spaces && last_is_closing_brace &&
                (line.startsWith('else') ||
                 line.startsWith('catch') ||
                 line.startsWith('finally'))){
            res = res.substr(0, res.length - 1)
            add_spaces = false
        }
        last_is_closing_brace = line.endsWith('}')
        if(line.startsWith('}')){
            level--
        }else if(line.endsWith('}')){
            line = line.substr(0, line.length - 1)
            add_closing_brace = true
        }
        if(level < 0){
            if($B.debug > 2){
                console.log('wrong js indent')
                console.log(res)
            }
            level = 0
        }
        try{
            res += (add_spaces ? indentation.repeat(level) : '') + line + '\n'
        }catch(err){
            console.log(res)
            throw err
        }
        if(line.endsWith('{')){
            level++
        }else if(add_closing_brace){
            level--
            if(level < 0){
                level = 0
            }
            try{
                res += indentation.repeat(level) + '}\n'
            }catch(err){
                console.log(res)
                throw err
            }
        }
        last_is_backslash = line.endsWith('\\')
        last_is_var_and_comma = line.endsWith(',') &&
            (line.startsWith('var ') || last_is_var_and_comma)
    }
    return res
}


function show_line(ctx){
    // for debugging
    var lnum = $get_node(ctx).line_num,
        src = $get_module(ctx).src
    console.log('this', ctx, '\nline', lnum, src.split('\n')[lnum - 1])
}

/*
Class for syntax tree
=====================

An instance is created for the whole Python program as the root of the tree.

For each instruction in the Python source code, an instance is created
as a child of the block where it stands : the root for instructions at
module level, or a function definition, a loop, a condition, etc.
*/

var $Node = $B.parser.$Node = function(type){
    this.type = type
    this.children = []
}

$Node.prototype.add = function(child){
    // Insert as the last child
    this.children[this.children.length] = child
    child.parent = this
    child.module = this.module
}

$Node.prototype.ast = function(){
    var root_ast = new ast.Module([], [])
    root_ast.lineno = this.line_num
    for(var node of this.children){
        var t = node.context.tree[0]
        // Ignore except / elif / else / finally : they are attributes of
        // try / for / if nodes
        // decorator is attribute of the class / def node
        if(['single_kw', 'except', 'decorator'].indexOf(t.type) > -1 ||
                (t.type == 'condition' && t.token == 'elif')){
            continue
        }
        var node_ast = node.context.tree[0].ast()
        if(ast.expr.indexOf(node_ast.constructor) > -1){
            node_ast = new ast.Expr(node_ast)
            copy_position(node_ast, node_ast.value)
        }
        root_ast.body.push(node_ast)
    }

    if(this.mode == 'eval'){
        if(root_ast.body.length > 1 ||
                ! (root_ast.body[0] instanceof $B.ast.Expr)){
            raise_syntax_error(this.children[0].context,
                'eval() argument must be an expression')
        }
        root_ast = new $B.ast.Expression(root_ast.body[0].value)
        copy_position(root_ast, root_ast.body)
    }
    return root_ast
}

$Node.prototype.insert = function(pos, child){
    // Insert child at position pos
    this.children.splice(pos, 0, child)
    child.parent = this
    child.module = this.module
}

$Node.prototype.show = function(indent){
    // For debugging purposes
    var res = ''
    if(this.type === 'module'){
        for(var child of this.children){
            res += child.show(indent)
        }
        return res
    }

    indent = indent || 0
    res += ' '.repeat(indent)
    res += this.context
    if(this.children.length > 0){
        res += '{'
    }
    res +='\n'
    for(var child of this.children){
       res += child.show(indent + 4)
    }
    if(this.children.length > 0){
      res += ' '.repeat(indent)
      res += '}\n'
    }
    return res
}


/*
Context classes
===============

In the parser, for each token found in the source code, a
new context is created by a call like :

    new_context = $transition(current_context, token_type, token_value)

For each new instruction, an instance of $Node is created ; it receives an
attribute "context" which is an initial, empty context.

For instance, if the first token is the keyword "assert", the new context
is an instance of class $AssertCtx, in a state where it expects an
expression.

Most contexts have an attribute "tree", a list of the elements associated
with the keyword or the syntax element (eg the arguments in a function
definition).

Context have a method .transition(token, value) called by the tokens
dispatcher. It handles the next token in the token stream, raises errors if
the token is invalid.

Most contexts have a method ast() that returns the AST node for this context.
It is called by the method ast() of the root node.
*/

var $AbstractExprCtx = $B.parser.$AbstractExprCtx = function(context, with_commas){
    this.type = 'abstract_expr'
    // allow expression with comma-separated values, or a single value ?
    this.with_commas = with_commas
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree.push(this)
}

$AbstractExprCtx.prototype.transition = function(token, value){
    var context = this
    var packed = context.packed,
        is_await = context.is_await,
        position = context.position

    switch(token) {
        case 'await':
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case 'ellipsis':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
        case 'yield':
            context.parent.tree.pop() // remove abstract expression
            var commas = context.with_commas,
                star_position
            if(context.packed){
                star_position = context.star_position
            }
            context = context.parent
            context.packed = packed
            context.is_await = is_await
            if(context.position === undefined){
                context.position = $token.value
            }
            if(star_position){
                context.star_position = star_position
            }
    }

    switch(token) {
        case 'await':
            return new $AbstractExprCtx(new $AwaitCtx(
                new $ExprCtx(context, 'await', false)), false)
        case 'id':
            return new $IdCtx(new $ExprCtx(context, 'id', commas),
                value)
        case 'str':
            return new $StringCtx(new $ExprCtx(context, 'str', commas),
                value)
        case 'JoinedStr':
            return new JoinedStrCtx(new $ExprCtx(context, 'str', commas),
                value)
        case 'bytes':
            return new $StringCtx(new $ExprCtx(context, 'bytes', commas),
                value)
        case 'int':
            return new $NumberCtx('int',
                new $ExprCtx(context, 'int', commas), value)
        case 'float':
            return new $NumberCtx('float',
                new $ExprCtx(context, 'float', commas), value)
        case 'imaginary':
            return new $NumberCtx('imaginary',
                new $ExprCtx(context, 'imaginary', commas), value)
        case '(':
            return new $ListOrTupleCtx(
                new $ExprCtx(context, 'tuple', commas), 'tuple')
        case '[':
            return new $ListOrTupleCtx(
                new $ExprCtx(context, 'list', commas), 'list')
        case '{':
            return new $AbstractExprCtx(
                new $DictOrSetCtx(
                    new $ExprCtx(context, 'dict_or_set', commas)), false)
        case 'ellipsis':
            return new $EllipsisCtx(
                new $ExprCtx(context, 'ellipsis', commas))
        case 'not':
            if(context.type == 'op' && context.op == 'is'){ // "is not"
                context.op = 'is_not'
                return context
            }
            return new $AbstractExprCtx(
                new $NotCtx(new $ExprCtx(context, 'not', commas)), false)
        case 'lambda':
            return new $LambdaCtx(new $ExprCtx(context, 'lambda', commas))
        case 'op':
            var tg = value
            switch(tg) {
                case '*':
                    context.parent.tree.pop() // remove abstract expression
                    var commas = context.with_commas
                    context = context.parent
                    context.position = $token.value
                    return new $AbstractExprCtx(
                        new $StarredCtx(
                            new $ExprCtx(context, 'expr', commas)),
                        false)
                case '**':
                    context.parent.tree.pop() // remove abstract expression
                    var commas = context.with_commas
                    context = context.parent
                    context.position = $token.value
                    return new $AbstractExprCtx(
                        new KwdCtx(
                            new $ExprCtx(context, 'expr', commas)),
                        false)
                case '-':
                case '~':
                case '+':
                    // unary op
                    context.parent.tree.pop() // remove abstract expr
                    return new $AbstractExprCtx(
                        new $UnaryCtx(
                            new $ExprCtx(context.parent, 'unary', false),
                            tg),
                        false
                    )
                case 'not':
                    context.parent.tree.pop() // remove abstract expression
                    var commas = context.with_commas
                    context = context.parent
                    return new $NotCtx(
                        new $ExprCtx(context, 'not', commas))
                case '...':
                    return new $EllipsisCtx(new $ExprCtx(context, 'ellipsis', commas))
            }
            raise_syntax_error(context)
        case 'in':
            if(context.parent.type == 'op' && context.parent.op == 'not'){
                context.parent.op = 'not_in'
                return context
            }
            raise_syntax_error(context)
        case '=':
            if(context.parent.type == "yield"){
                raise_syntax_error(context,
                    "assignment to yield expression not possible",
                    context.parent.position,)
            }
            raise_syntax_error(context)
        case 'yield':
            return new $AbstractExprCtx(new $YieldCtx(context), true)
        case ':':
            if(context.parent.type == "sub" ||
                    (context.parent.type == "list_or_tuple" &&
                    context.parent.parent.type == "sub")){
                return new $AbstractExprCtx(new $SliceCtx(context.parent), false)
            }
            return $transition(context.parent, token, value)
        case ')':
        case ',':
            switch(context.parent.type) {
                case 'list_or_tuple':
                case 'slice':
                case 'call_arg':
                case 'op':
                case 'yield':
                    break
                case 'match':
                    if(token == ','){
                        // implicit tuple
                        context.parent.tree.pop()
                        var tuple = new $ListOrTupleCtx(context.parent,
                            'tuple')
                        tuple.implicit = true
                        tuple.has_comma = true
                        tuple.tree = [context]
                        context.parent = tuple
                        return tuple
                    }
                    break
                default:
                    raise_syntax_error(context)

            }
            break
        case '.':
        case 'assert':
        case 'break':
        case 'class':
        case 'continue':
        case 'def':
        case 'except':
        case 'for':
        case 'while':
        case 'in':
        case 'return':
        case 'try':
            raise_syntax_error(context)
            break
    }
    return $transition(context.parent, token, value)
}

var $AliasCtx = $B.parser.$AliasCtx = function(context){
    // Class for context manager alias
    this.type = 'ctx_manager_alias'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length - 1].alias = this
}

$AliasCtx.prototype.transition = function(token, value){
    var context = this
    switch(token){
        case ',':
        case ')':
        case ':':
            check_assignment(context.tree[0])
            context.parent.set_alias(context.tree[0].tree[0])
            return $transition(context.parent, token, value)
        case 'eol':
            $token.value = last_position(context)
            raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

var $AnnotationCtx = $B.parser.$AnnotationCtx = function(context){
    // Class for annotations, eg "def f(x:int) -> list:"
    this.type = 'annotation'
    this.parent = context
    this.tree = []
    // get annotation string in source code for postponed evaluation
    this.src = $get_module(this).src
    var rest = this.src.substr($pos)
    if(rest.startsWith(':')){
        this.start = $pos + 1
    }else if(rest.startsWith('->')){
        this.start = $pos + 2
    }
    this.string = ''
    // annotation is stored in attribute "annotations" of parent, not "tree"
    context.annotation = this

    var scope = $get_scope(context)

    if(scope.ntype == "def" && context.tree && context.tree.length > 0 &&
            context.tree[0].type == "id"){
        var name = context.tree[0].value
        scope.annotations = scope.annotations || new Set()
        scope.annotations.add(name)
    }
}

$AnnotationCtx.prototype.transition = function(token, value){
    var context = this
    this.string = this.src.substring(this.start, $pos)
    if(token == "eol" && context.tree.length == 1 &&
            context.tree[0].tree.length == 0){
        raise_syntax_error(context)
    }else if(token == ':' && context.parent.type != "def"){
        raise_syntax_error(context, "more than one annotation")
    }else if(token == "augm_assign"){
        raise_syntax_error(context, "augmented assign as annotation")
    }else if(token == "op"){
        raise_syntax_error(context, "operator as annotation")
    }
    return $transition(context.parent, token)
}

var $AssertCtx = $B.parser.$AssertCtx = function(context){
    // Context for keyword "assert"
    this.type = 'assert'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$AssertCtx.prototype.ast = function(){
    // Assert(expr test, expr? msg)
    var msg = this.tree[1],
        ast_obj = new ast.Assert(this.tree[0].ast(),
            msg === undefined ? msg : msg.ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$AssertCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ","){
        if(this.tree.length > 1){
            raise_syntax_error(context,
                '(too many commas after assert)')
        }
        return new $AbstractExprCtx(this, false)
    }
    if(token == 'eol'){
        if(this.tree.length == 1 &&
                this.tree[0].type == 'expr' &&
                this.tree[0].tree[0].type == 'list_or_tuple'){
            $B.warn(_b_.SyntaxWarning,
                    "assertion is always true, perhaps remove parentheses?",
                    $get_module(context).filename,
                    $token.value)
        }
        return $transition(context.parent, token)
    }
    raise_syntax_error(context)
}

var $AssignCtx = $B.parser.$AssignCtx = function(context, expression){
    /*
    Class for the assignment operator "="
    context is the left operand of assignment
    This check is done when the AssignCtx object is created, but must be
    disabled if a new AssignCtx object is created afterwards by method
    transform()
    */
    check_assignment(context)

    this.type = 'assign'
    this.position = $token.value

    // replace parent by "this" in parent tree
    context.parent.tree.pop()
    context.parent.tree.push(this)

    this.parent = context.parent
    this.tree = [context]

    var scope = $get_scope(this)

    if(context.type == 'assign'){
        check_assignment(context.tree[1])
    }else{
        var assigned = context.tree[0]
        if(assigned.type == "ellipsis"){
            raise_syntax_error(context, 'cannot assign to Ellipsis')
        }else if(assigned.type == 'unary'){
            raise_syntax_error(context, 'cannot assign to operator')
        }else if(assigned.type == 'starred'){
            if(assigned.tree[0].name == 'id'){
                var id = assigned.tree[0].tree[0].value
                if(['None', 'True', 'False', '__debug__'].indexOf(id) > -1){
                    raise_syntax_error(context, 'cannot assign to ' + id)
                }
            }
            // If the packed item was in a tuple (eg "a, *b = X") the
            // assignment is valid; in this case the attribute in_tuple
            // is set
            if(assigned.parent.in_tuple === undefined){
                raise_syntax_error(context,
                    "starred assignment target must be in a list or tuple")
            }
        }
    }
}

function set_ctx_to_store(obj){
    if(Array.isArray(obj)){
        for(var item of obj){
            set_ctx_to_store(item)
        }
    }else if(obj instanceof ast.List ||
            obj instanceof ast.Tuple){
        for(var item of obj.elts){
            set_ctx_to_store(item)
        }
    }else if(obj instanceof ast.Starred){
        obj.value.ctx = new ast.Store()
    }else if(obj === undefined){
        // ignore
    }else if(obj.ctx){
        obj.ctx = new ast.Store()
    }else{
        console.log('bizarre', obj, obj.constructor.$name)
    }
}

$AssignCtx.prototype.ast = function(){
    var value = this.tree[1].ast(),
        targets = [],
        target = this.tree[0]
    if(target.type == 'expr' && target.tree[0].type == 'list_or_tuple'){
        target = target.tree[0]
    }
    if(target.type == 'list_or_tuple'){
        target = target.ast()
        target.ctx = new ast.Store()
        targets = [target]
    }else{
        while(target.type == 'assign'){
            targets.splice(0, 0, target.tree[1].ast())
            target = target.tree[0]
        }
        targets.splice(0, 0, target.ast())
    }
    value.ctx = new ast.Load()
    var lineno = $get_node(this).line_num
    if(target.annotation){
        var ast_obj = new ast.AnnAssign(
            target.tree[0].ast(),
            target.annotation.tree[0].ast(),
            value,
            target.$was_parenthesized ? 0 : 1)
        // set position of annotation to get annotation string
        // in ast_to_js.js
        set_position(ast_obj.annotation, target.annotation.position,
            last_position(target.annotation))
        ast_obj.target.ctx = new ast.Store()
    }else{
        var ast_obj = new ast.Assign(targets, value)
    }
    set_position(ast_obj, this.position)
    set_ctx_to_store(ast_obj.targets)
    return ast_obj
}

$AssignCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        if(context.tree[1].type == 'abstract_expr'){
            raise_syntax_error(context)
        }
        return $transition(context.parent, 'eol')
    }
    raise_syntax_error(context)
}

var $AsyncCtx = $B.parser.$AsyncCtx = function(context){
    // Class for async : def, while, for
    this.type = 'async'
    this.parent = context
    context.async = true
    this.position = context.position = $token.value
}

$AsyncCtx.prototype.transition = function(token, value){
    var context = this
    if(token == "def"){
        return $transition(context.parent, token, value)
    }else if(token == "with"){
        var ctx = $transition(context.parent, token, value)
        ctx.async = context // set attr "async" of with context
        return ctx
    }else if(token == "for"){
        var ctx = $transition(context.parent, token, value)
        ctx.parent.async = context // set attr "async" of for context
        return ctx
    }
    raise_syntax_error(context)
}

var $AttrCtx = $B.parser.$AttrCtx = function(context){
    // Class for object attributes (eg x in obj.x)
    this.type = 'attribute'
    this.value = context.tree[0]
    this.parent = context
    this.position = $token.value
    context.tree.pop()
    context.tree[context.tree.length] = this
    this.tree = []
    this.func = 'getattr' // becomes setattr for an assignment
}

$AttrCtx.prototype.ast = function(){
    // ast.Attribute(value, attr, ctx)
    var value = this.value.ast(),
        attr = this.unmangled_name,
        ctx = new ast.Load()
    if(this.func == 'setattr'){
        ctx = new ast.Store()
    }else if(this.func == 'delattr'){
        ctx = new ast.Delete()
    }
    var ast_obj = new ast.Attribute(value, attr, ctx)
    set_position(ast_obj, this.position, this.end_position)
    return ast_obj
}

$AttrCtx.prototype.transition = function(token, value){
    var context = this
    if(token === 'id'){
        var name = value
        if(name == '__debug__'){
            raise_syntax_error(context, 'cannot assign to __debug__')
        }else if(noassign[name] === true){
            raise_syntax_error(context)
        }
        context.unmangled_name = name
        context.position = $token.value
        context.end_position = $token.value
        name = $mangle(name, context)
        context.name = name
        return context.parent
    }
    raise_syntax_error(context)
}

var $AugmentedAssignCtx = $B.parser.$AugmentedAssignCtx = function(context, op){
    // Class for augmented assignments such as "+="

    check_assignment(context, {augmented: true})

    this.type = 'augm_assign'
    this.context = context
    this.parent = context.parent
    this.position = $token.value
    context.parent.tree.pop()
    context.parent.tree[context.parent.tree.length] = this
    this.op = op
    this.tree = [context]

    var scope = this.scope = $get_scope(this)
    this.module = scope.module
}

$AugmentedAssignCtx.prototype.ast = function(){
    // AugAssign(expr target, operator op, expr value)
    var target = this.tree[0].ast(),
        value = this.tree[1].ast()
    target.ctx = new ast.Store()
    value.ctx = new ast.Load()
    var op = this.op.substr(0, this.op.length -1),
        ast_type_class = op2ast_class[op],
        ast_class = ast_type_class[1]

    var ast_obj = new ast.AugAssign(target, new ast_class(), value)
    set_position(ast_obj, this.position)
    return ast_obj
}

$AugmentedAssignCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        if(context.tree[1].type == 'abstract_expr'){
            raise_syntax_error(context)
        }
        return $transition(context.parent, 'eol')
    }
    raise_syntax_error(context)
}

var $AwaitCtx = $B.parser.$AwaitCtx = function(context){
    // Class for "await"
    this.type = 'await'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree.push(this)

    var p = context
    while(p){
        if(p.type == "list_or_tuple"){
            p.is_await = true
        }
        p = p.parent
    }
    var node = $get_node(this)
    node.awaits = node.awaits || []
    node.awaits.push(this)
}

$AwaitCtx.prototype.ast = function(){
    // Await(expr value)
    var ast_obj = new ast.Await(this.tree[0].ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$AwaitCtx.prototype.transition = function(token, value){
    var context = this
    context.parent.is_await = true
    return $transition(context.parent, token, value)
}

var $BodyCtx = $B.parser.$BodyCtx = function(context){
    // inline body for def, class, if, elif, else, try...
    // creates a new node, child of context node
    var ctx_node = context.parent
    while(ctx_node.type !== 'node'){
        ctx_node = ctx_node.parent
    }
    var tree_node = ctx_node.node
    var body_node = new $Node()
    body_node.is_body_node = true
    body_node.line_num = tree_node.line_num
    tree_node.insert(0, body_node)
    return new $NodeCtx(body_node)
}

var $BreakCtx = $B.parser.$BreakCtx = function(context){
    // Used for the keyword "break"
    // A flag is associated to the enclosing "for" or "while" loop
    // If the loop exits with a break, this flag is set to true
    // so that the "else" clause of the loop, if present, is executed

    this.type = 'break'
    this.position = $token.value

    this.parent = context
    context.tree[context.tree.length] = this
}

$BreakCtx.prototype.ast = function(){
    var ast_obj = new ast.Break()
    set_position(ast_obj, this.position)
    return ast_obj
}

$BreakCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        return $transition(context.parent, 'eol')
    }
    raise_syntax_error(context)
}

var $CallArgCtx = $B.parser.$CallArgCtx = function(context){
    // Base class for arguments in a function call
    this.type = 'call_arg'
    this.parent = context
    this.start = $pos
    this.tree = []
    this.position = $token.value
    context.tree.push(this)
    this.expect = 'id'
}

$CallArgCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'await':
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'ellipsis':
        case 'not':
        case 'lambda':
            if(context.expect == 'id'){
                this.position = $token.value
                context.expect = ','
                var expr = new $AbstractExprCtx(context, false)
                return $transition(expr, token, value)
            }
            break
        case '=':
            if(context.expect == ','){
                return new $ExprCtx(new $KwArgCtx(context), 'kw_value',
                    false)
            }
            break
        case 'for':
            return new $TargetListCtx(new $ForExpr(new GeneratorExpCtx(context)))
        case 'op':
            if(context.expect == 'id'){
               var op = value
               context.expect = ','
               switch(op) {
                   case '+':
                   case '-':
                   case '~':
                       return $transition(new $AbstractExprCtx(context,false),token,op)
                   case '*':
                       context.parent.tree.pop()
                       return new $StarArgCtx(context.parent)
                   case '**':
                       context.parent.tree.pop()
                       return new $DoubleStarArgCtx(context.parent)
               }
            }
            raise_syntax_error(context)
        case ')':
            return $transition(context.parent,token)
        case ':':
            if(context.expect == ',' &&
                    context.parent.parent.type == 'lambda') {
                return $transition(context.parent.parent, token)
            }
            break
        case ',':
            if(context.expect == ','){
                return $transition(context.parent, token, value)
            }
    }
    raise_syntax_error(context)
}

var $CallCtx = $B.parser.$CallCtx = function(context){
    // Context of a call on a callable, ie what is inside the parenthesis
    // in "callable(...)"
    this.position = $token.value
    this.type = 'call'
    this.func = context.tree[0]
    if(this.func !== undefined){ // undefined for lambda
        this.func.parent = this
        this.parenth_position = this.position
        this.position = this.func.position
    }
    this.parent = context
    if(context.type != 'class'){
        context.tree.pop()
        context.tree[context.tree.length] = this
    }else{
        // class parameters
        context.args = this
    }
    this.expect = 'id'
    this.tree = []
    this.start = $pos
}

$CallCtx.prototype.ast = function(){
    var res = new ast.Call(this.func.ast(), [], []),
        keywords = new Set()
    for(var call_arg of this.tree){
        if(call_arg.type == 'double_star_arg'){
            var value = call_arg.tree[0].tree[0].ast(),
                keyword = new ast.keyword(_b_.None, value)
            delete keyword.arg
            res.keywords.push(keyword)
        }else if(call_arg.type == 'star_arg'){
            if(res.keywords.length > 0){
                if(! res.keywords[0].arg){
                    raise_syntax_error(this,
                        'iterable argument unpacking follows keyword argument unpacking')
                }
            }
            var starred = new ast.Starred(call_arg.tree[0].ast())
            set_position(starred, call_arg.position)
            starred.ctx = new ast.Load()
            res.args.push(starred)
        }else if(call_arg.type == 'genexpr'){
            res.args.push(call_arg.ast())
        }else{
            var item = call_arg.tree[0]
            if(item === undefined){
                // case when call ends with ",)"
                continue
            }
            if(item.type == 'kwarg'){
                var key = item.tree[0].value
                if(key == '__debug__'){
                    raise_syntax_error_known_range(this,
                        this.position,
                        this.end_position,
                        "cannot assign to __debug__")
                }else if(['True', 'False', 'None'].indexOf(key) > -1){
                    raise_syntax_error_known_range(this,
                        item.position,
                        item.equal_sign_position,
                        'expression cannot contain assignment, perhaps you meant "=="?')
                }
                if(keywords.has(key)){
                    raise_syntax_error_known_range(item,
                        item.position,
                        last_position(item),
                        `keyword argument repeated: ${key}`)
                }
                keywords.add(key)
                var keyword = new ast.keyword(item.tree[0].value,
                    item.tree[1].ast())
                set_position(keyword, item.position)
                res.keywords.push(keyword)
            }else{
                if(res.keywords.length > 0){
                    if(res.keywords[0].arg){
                        raise_syntax_error_known_range(this,
                            item.position,
                            last_position(item),
                            'positional argument follows keyword argument')
                    }else{
                        raise_syntax_error_known_range(this,
                            item.position,
                            last_position(item),
                            'positional argument follows keyword argument unpacking')
                    }
                }
                res.args.push(item.ast())
            }
        }
    }
    set_position(res, this.position, this.end_position)
    return res
}

$CallCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case ',':
            if(context.expect == 'id'){
                raise_syntax_error(context)
            }
            context.expect = 'id'
            return context
        case 'await':
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
        case 'ellipsis':
            context.expect = ','
            return $transition(new $CallArgCtx(context), token,
                value)
        case ')':
            context.end = $pos
            context.end_position = $token.value
            return context.parent
        case 'op':
            context.expect = ','
            switch(value) {
                case '-':
                case '~':
                case '+':
                    context.expect = ','
                    return $transition(new $CallArgCtx(context), token,
                        value)
                case '*':
                    context.has_star = true
                    return new $StarArgCtx(context)
                case '**':
                    context.has_dstar = true
                    return new $DoubleStarArgCtx(context)
            }
            raise_syntax_error(context)
        case 'yield':
            raise_syntax_error(context)
    }

    return $transition(context.parent, token, value)
}

var $CaseCtx = $B.parser.$CaseCtx = function(node_ctx){
    // node already has an expression with the id "match"
    this.type = "case"
    this.position = $token.value
    node_ctx.tree = [this]
    this.parent = node_ctx
    this.tree = []
    this.expect = 'as'
}

$CaseCtx.prototype.ast = function(){
    // ast.match_case(pattern, guard, body)
    // pattern : the match pattern that the subject will be matched against
    // guard : an expression that will be evaluated if the pattern matches the subject
    var ast_obj = new ast.match_case(this.tree[0].ast(),
        this.has_guard ? this.tree[1].tree[0].ast() : undefined,
        ast_body(this.parent))
    set_position(ast_obj, this.position)
    return ast_obj
}

$CaseCtx.prototype.set_alias = function(name){
    this.alias = name
}

$CaseCtx.prototype.transition = function(token, value){
    var context = this
    switch(token){
        case 'as':
            context.expect = ':'
            return new $AbstractExprCtx(new $AliasCtx(context))
        case ':':
            // check if case is 'irrefutable' (cf. PEP 634)
            function is_irrefutable(pattern){
                var cause
                if(pattern.type == "capture_pattern"){
                    return pattern.tree[0]
                }else if(pattern.type == "or_pattern"){
                    for(var subpattern of pattern.tree){
                        if(cause = is_irrefutable(subpattern)){
                            return cause
                        }
                    }
                }else if(pattern.type == "sequence_pattern" &&
                        pattern.token == '(' &&
                        pattern.tree.length == 1 &&
                        (cause = is_irrefutable(pattern.tree[0]))){
                    return cause
                }
                return false
            }
            var cause
            if(cause = is_irrefutable(this.tree[0])){
                // mark match node as having already an irrefutable pattern,
                // so that remaining patterns raise a SyntaxError
                $get_node(context).parent.irrefutable = cause
            }
            switch(context.expect) {
                case 'id':
                case 'as':
                case ':':
                    var last = $B.last(context.tree)
                    if(last && last.type == 'sequence_pattern'){
                        remove_empty_pattern(last)
                    }
                    return $BodyCtx(context)
            }
            break
        case 'op':
            if(value == '|'){
                return new $PatternCtx(new $PatternOrCtx(context))
            }
            raise_syntax_error(context, 'expected :')
        case ',':
            if(context.expect == ':' || context.expect == 'as'){
                return new $PatternCtx(new $PatternSequenceCtx(context))
            }
        case 'if':
            // guard
            context.has_guard = true
            return new $AbstractExprCtx(new $ConditionCtx(context, token),
                false)
        default:
            raise_syntax_error(context, 'expected :')
    }
}

var $ClassCtx = $B.parser.$ClassCtx = function(context){
    // Class for keyword "class"
    this.type = 'class'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
    this.expect = 'id'

    var scope = this.scope = $get_scope(this)
    this.parent.node.parent_block = scope
    this.parent.node.bound = {} // will store the names bound in the function
}

$ClassCtx.prototype.ast = function(){
    // ClassDef(identifier name, expr* bases, keyword* keywords,
    //         stmt* body, expr* decorator_list)
    var decorators = get_decorators(this.parent.node),
        bases = [],
        keywords = []
    if(this.args){
        for(var arg of this.args.tree){
            if(arg.tree[0].type == 'kwarg'){
                keywords.push(new ast.keyword(arg.tree[0].tree[0].value,
                    arg.tree[0].tree[1].ast()))
            }else{
                bases.push(arg.tree[0].ast())
            }
        }
    }
    var ast_obj = new ast.ClassDef(this.name, bases, keywords,
                            ast_body(this.parent), decorators)
    set_position(ast_obj, this.position)
    return ast_obj
}

$ClassCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
                 context.set_name(value)
                 context.expect = '(:'
                 return context
            }
            break
        case '(':
            if(context.name === undefined){
                raise_syntax_error(context, 'missing class name')
            }
            context.parenthesis_position = $token.value
            return new $CallCtx(context)
        case ':':
            if(this.args){
                for(var arg of this.args.tree){
                    var param = arg.tree[0]
                    if(arg.type != 'call_arg'){
                        $token.value = context.parenthesis_position
                        raise_syntax_error(context, "expected ':'")
                    }
                    if((param.type == 'expr' && param.name == 'id') ||
                            param.type == "kwarg"){
                        continue
                    }
                    $token.value = arg.position
                    raise_syntax_error(arg, 'invalid class parameter')
                }
            }
            return $BodyCtx(context)
        case 'eol':
            raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

$ClassCtx.prototype.set_name = function(name){
    var context = this.parent
    this.random = $B.UUID()
    this.name = name
    this.id = context.node.module + '_' + name + '_' + this.random
    this.parent.node.id = this.id

    var scope = this.scope,
        parent_block = scope

    // Set attribute "qualname", which includes possible parent classes
    var block = scope,
        parent_classes = []
    while(block.ntype == "class"){
        parent_classes.splice(0, 0, block.context.tree[0].name)
        block = block.parent
    }
    this.qualname = parent_classes.concat([name]).join(".")

    while(parent_block.context &&
            parent_block.context.tree[0].type == 'class'){
        parent_block = parent_block.parent
    }
    while(parent_block.context &&
           'def' != parent_block.context.tree[0].type &&
           'generator' != parent_block.context.tree[0].type){
        parent_block = parent_block.parent
    }
    this.parent.node.parent_block = parent_block

}

var Comprehension = {
    generators: function(comp){
        // Return a list of comprehensions
        // ast.comprehension(target, iter, ifs, is_async)
        var comprehensions = []
        for(item of comp){
            if(item.type == 'for'){
                comprehensions.push(
                    new ast.comprehension(
                        item.tree[0].ast(),
                        item.tree[1].ast(),
                        [],
                        item.is_async ? 1 : 0
                    )
                )
            }else{
                $B.last(comprehensions).ifs.push(item.tree[0].ast())
            }
        }
        return comprehensions
    },
    make_comp: function(comp, context){
        if(context.tree[0].type == 'yield'){
            var comp_type = comp.type == 'listcomp' ? 'list comprehension' :
                            comp.type == 'dictcomp' ? 'dict comprehension' :
                            comp.type == 'setcomp' ? 'set comprehension' :
                            comp.type == 'genexpr' ? 'generator expression' : ''
            var a = context.tree[0]
            //raise_syntax_error_known_range(context, a.position, last_position(a),
            //                                `'yield' inside ${comp_type}`)
        }
        comp.comprehension = true
        comp.position = $token.value
        comp.parent = context.parent
        comp.id = comp.type + $B.UUID()
        var scope = $get_scope(context)
        comp.parent_block = scope
        while(scope){
            if(scope.context && scope.context.tree &&
                    scope.context.tree.length > 0 &&
                    scope.context.tree[0].async){
                comp.async = true
                break
            }
            scope = scope.parent_block
        }
        comp.module = $get_module(context).module
        comp.module_ref = comp.module.replace(/\./g, '_')
        context.parent.tree[context.parent.tree.length - 1] = comp
        Comprehension.set_parent_block(context.tree[0], comp)
    },
    set_parent_block: function(ctx, parent_block){
        if(ctx.tree){
            for(var item of ctx.tree){
                if(item.comprehension){
                    item.parent_block = parent_block
                }
                Comprehension.set_parent_block(item, parent_block)
            }
        }
    }
}

var $ConditionCtx = $B.parser.$ConditionCtx = function(context,token){
    // Class for keywords "if", "elif", "while"
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    this.position = $token.value
    this.node = $get_node(this)
    this.scope = $get_scope(this)
    if(token == 'elif'){
        // in the AST, this is the attribute 'orelse' of the previous "if"
        // or "elif"
        var rank = this.node.parent.children.indexOf(this.node),
            previous = this.node.parent.children[rank - 1]
        previous.context.tree[0].orelse = this
    }
    context.tree.push(this)
}

$ConditionCtx.prototype.ast = function(){
    // While(expr test, stmt* body, stmt* orelse) |
    // If(expr test, stmt* body, stmt* orelse)
    var types = {'if': 'If', 'while': 'While', 'elif': 'If'}
    var res = new ast[types[this.token]](this.tree[0].ast())
    if(this.orelse){
        if(this.orelse.token == 'elif'){
            res.orelse = [this.orelse.ast()]
        }else{
            res.orelse = this.orelse.ast()
        }
    }else{
        res.orelse = []
    }
    res.body = ast_body(this)
    set_position(res, this.position)
    return res
}

$ConditionCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){
        if(context.tree[0].type == "abstract_expr" &&
                context.tree[0].tree.length == 0){ // issue #965
            raise_syntax_error(context)
        }
        return $BodyCtx(context)
    }else if(context.in_comp && context.token == 'if'){
        // [x for x in A if cond1 if cond2]
        if(token == ']'){
            return $transition(context.parent, token, value)
        }else if(token == 'if'){
            var if_exp = new $ConditionCtx(context.parent, 'if')
            if_exp.in_comp = context.in_comp
            return new $AbstractExprCtx(if_exp, false)
        }else if(')]}'.indexOf(token) > -1){
            return $transition(this.parent, token, value)
        }else if(context.in_comp && token == 'for'){
            return new $TargetListCtx(new $ForExpr(context.parent))
        }
        if(token == ',' && $parent_match(context, {type: 'call'})){
            raise_syntax_error_known_range(context,
                context.in_comp.position,
                last_position(context),
                'Generator expression must be parenthesized')
        }
    }
    raise_syntax_error(context, "expected ':'")
}

var $ContinueCtx = $B.parser.$ContinueCtx = function(context){
    // Class for keyword "continue"
    this.type = 'continue'
    this.parent = context
    this.position = $token.value
    $get_node(this).is_continue = true
    context.tree[context.tree.length] = this
}

$ContinueCtx.prototype.ast = function(){
    var ast_obj = new ast.Continue()
    set_position(ast_obj, this.position)
    return ast_obj
}

$ContinueCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){return context.parent}
    raise_syntax_error(context)
}

var $DecoratorCtx = $B.parser.$DecoratorCtx = function(context){
    // Class for decorators
    this.type = 'decorator'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.position = $token.value
}

$DecoratorCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol') {
        return $transition(context.parent, token)
    }
    raise_syntax_error(context)
}

function get_decorators(node){
    var decorators = []
    var parent_node = node.parent
    var rank = parent_node.children.indexOf(node)
    while(true){
        rank--
        if(rank < 0){
            break
        }else if(parent_node.children[rank].context.tree[0].type ==
                'decorator'){
            var deco = parent_node.children[rank].context.tree[0].tree[0]
            decorators.splice(0, 0, deco.ast())
        }else{
            break
        }
    }
    return decorators
}

var $DefCtx = $B.parser.$DefCtx = function(context){
    this.type = 'def'
    this.name = null
    this.parent = context
    this.tree = []
    this.async = context.async
    if(this.async){
        this.position = context.position
    }else{
        this.position = $token.value
    }

    context.tree[context.tree.length] = this

    // store id of enclosing functions
    this.enclosing = []
    var scope = this.scope = $get_scope(this)
    if(scope.context && scope.context.tree[0].type == "class"){
        this.class_name = scope.context.tree[0].name
    }

    // For functions inside classes, the parent scope is not the class body
    // but the block where the class is defined
    //
    // Example
    //
    // a = 9
    // class A:
    //     a = 7
    //     def f(self):
    //         print(a)
    //
    // A().f()    # must print 9, not 7

    var parent_block = scope
    while(parent_block.context &&
            parent_block.context.tree[0].type == 'class'){
        parent_block = parent_block.parent
    }
    while(parent_block.context &&
          'def' != parent_block.context.tree[0].type){
        parent_block = parent_block.parent
    }

    this.parent.node.parent_block = parent_block

    // this.inside_function : set if the function is defined inside another
    // function
    var pb = parent_block
    this.is_comp = pb.is_comp
    while(pb && pb.context){
        if(pb.context.tree[0].type == 'def'){
            this.inside_function = true
            break
        }
        pb = pb.parent_block
    }

    this.module = scope.module
    this.root = $get_module(this)

    // Arrays for arguments
    this.positional_list = []
    this.default_list = []
    this.other_args = null
    this.other_kw = null
    this.after_star = []
}

$DefCtx.prototype.ast = function(){
    var args = {
            posonlyargs: [],
            args: [],
            kwonlyargs: [],
            kw_defaults: [],
            defaults: []
        },
        decorators = get_decorators(this.parent.node),
        func_args = this.tree[1],
        state = 'arg',
        default_value,
        res

    args = func_args.ast()
    if(this.async){
        res = new ast.AsyncFunctionDef(this.name, args, [], decorators)
    }else{
        res = new ast.FunctionDef(this.name, args, [], decorators)
    }
    if(this.annotation){
        res.returns = this.annotation.tree[0].ast()
    }
    res.body = ast_body(this.parent)
    set_position(res, this.position)
    return res
}

$DefCtx.prototype.set_name = function(name){
    if(["None", "True", "False"].indexOf(name) > -1){
        raise_syntax_error(this) // invalid function name
    }
    var id_ctx = new $IdCtx(this, name)
    this.name = name
    this.id = this.scope.id + '_' + name
    this.id = this.id.replace(/\./g, '_') // for modules inside packages
    this.id += '_' + $B.UUID()
    this.parent.node.id = this.id
    this.parent.node.module = this.module
}

$DefCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.name) {
                raise_syntax_error(context)
            }
            context.set_name(value)
            return context
        case '(':
            if(context.name == null){
                raise_syntax_error(context,
                    "missing name in function definition")
            }
            context.has_args = true;
            return new $FuncArgs(context)
        case ')':
            return context
        case 'annotation':
            return new $AbstractExprCtx(new $AnnotationCtx(context), true)
        case ':':
            if(context.has_args){
                return $BodyCtx(context)
            }else{
                raise_syntax_error(context, "missing function parameters")
            }
        case 'eol':
            if(context.has_args){
                raise_syntax_error(context, "expected ':'")
            }
    }
    raise_syntax_error(context)
}

var $DelCtx = $B.parser.$DelCtx = function(context){
    // Class for keyword "del"
    this.type = 'del'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.position = $token.value
}

$DelCtx.prototype.ast = function(){
    var targets
    if(this.tree[0].type == 'list_or_tuple'){
        // Syntax "del a, b, c"
        targets = this.tree[0].tree.map(x => x.ast())
    }else if(this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'list_or_tuple'){
        // del(x[0]) is the same as del x[0], cf.issue #923
        targets = this.tree[0].tree[0].ast()
        targets.ctx = new ast.Del()
        for(var elt of targets.elts){
            elt.ctx = new ast.Del()
        }
        var ast_obj = new ast.Delete([targets])
        set_position(ast_obj, this.position)
        return ast_obj
    }else{
        targets = [this.tree[0].tree[0].ast()]
    }
    for(var target of targets){
        target.ctx = new ast.Del()
    }
    var ast_obj = new ast.Delete(targets)
    set_position(ast_obj, this.position)
    return ast_obj
}

$DelCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        check_assignment(this.tree[0], {action: 'delete'})
        return $transition(context.parent, token)
    }
    raise_syntax_error(context)
}

var DictCompCtx = function(context){
    // create a List Comprehension
    // context is a $DictOrSetCtx
    if(context.tree[0].type == 'expr' &&
            context.tree[0].tree[0].comprehension){
        // If the DictComp expression is a comprehension, reset its parent
        // block to this
        var comp = context.tree[0].tree[0]
        comp.parent_block = this
    }
    this.type = 'dictcomp'
    this.position = $token.value
    this.comprehension = true
    this.parent = context.parent
    this.key = context.tree[0]
    this.value = context.tree[1]
    this.key.parent = this
    this.value.parent = this
    this.tree = []
    this.id = 'dictcomp' + $B.UUID()
    this.parent_block = $get_scope(context)
    this.module = $get_module(context).module
    context.parent.tree[context.parent.tree.length - 1] = this
    this.type = 'dictcomp'
    Comprehension.make_comp(this, context)
}

DictCompCtx.prototype.ast = function(){
    // ast.DictComp(key, value, generators)
    // key, value is the part evaluated for each item
    // generators is a list of comprehensions
    if(this.value.ast === undefined){
        console.log('dict comp ast, no value.ast', this)
    }
    var ast_obj = new ast.DictComp(
                    this.key.ast(),
                    this.value.ast(),
                    Comprehension.generators(this.tree)
                    )
    set_position(ast_obj, this.position)
    return ast_obj
}

DictCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == '}'){
        return this.parent
    }
    raise_syntax_error(context)
}

var $DictOrSetCtx = $B.parser.$DictOrSetCtx = function(context){
    // Context for literal dictionaries or sets
    // The real type (dist or set) is set inside $transition
    // as the attribute 'real'
    this.type = 'dict_or_set'
    this.real = 'dict_or_set'
    this.expect = ','
    this.closed = false
    this.start = $pos
    this.position = $token.value

    this.nb_items = 0

    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$DictOrSetCtx.prototype.ast = function(){
    // Dict(expr* keys, expr* values) | Set(expr* elts)
    var ast_obj
    if(this.real == 'dict'){
        var keys = [],
            values = []
        var t0 = Date.now()
        for(var i = 0, len = this.items.length; i < len; i++){
            if(this.items[i].type == 'expr' &&
                    this.items[i].tree[0].type == 'kwd'){
                keys.push(_b_.None)
                values.push(this.items[i].tree[0].tree[0].ast())
            }else{
                keys.push(this.items[i].ast())
                values.push(this.items[i + 1].ast())
                i++
            }
        }
        ast_obj = new ast.Dict(keys, values)
    }else if(this.real == 'set'){
        var items = []
        for(var item of this.items){
            if(item.packed){
                var starred = new ast.Starred(item.ast(),
                                              new ast.Load())
                set_position(starred, item.position)
                items.push(starred)
            }else{
                items.push(item.ast())
            }
        }
        ast_obj = new ast.Set(items)
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$DictOrSetCtx.prototype.transition = function(token, value){
    var context = this
    if(context.closed){
        switch(token) {
          case '[':
            return new $AbstractExprCtx(new $SubCtx(context.parent),false)
          case '(':
            return new $CallArgCtx(new $CallCtx(context.parent))
        }
        return $transition(context.parent, token, value)
    }else{
        if(context.expect == ','){
            function check_last(){
                var last = $B.last(context.tree),
                    err_msg
                if(last && last.wrong_assignment){
                    // {x=1}
                    err_msg = "invalid syntax. Maybe you meant '==' or ':=' instead of '='?"
                }else if(context.real == 'dict' && last.type == 'expr' &&
                        last.tree[0].type == 'starred'){
                    // {x: *12}
                    err_msg = 'cannot use a starred expression in a dictionary value'
                }else if(context.real == 'set' && last.tree[0].type == 'kwd'){
                    $token.value = last.position
                    raise_syntax_error(context)
                }
                if(err_msg){
                    raise_syntax_error_known_range(context,
                        last.position,
                        last_position(last),
                        err_msg)
                }
            }
            switch(token) {
                case '}':
                    var last = $B.last(context.tree)
                    if(last.type == "expr" && last.tree[0].type == "kwd"){
                        context.nb_items += 2
                    }else if(last.type == "abstract_expr"){
                        context.tree.pop()
                    }else{
                        context.nb_items++
                    }
                    check_last()
                    context.end_position = $token.value
                    switch(context.real) {
                        case 'dict_or_set':
                            // for "{}" or {1}
                            context.real = context.tree.length == 0 ?
                                'dict' : 'set'
                        case 'set':
                            context.items = context.tree
                            context.tree = []
                            context.closed = true
                            return context
                        case 'dict':
                            if($B.last(context.tree).type == 'abstract_expr'){
                                raise_syntax_error(context,
                                    "expression expected after dictionary key and ':'")
                            }else{
                                if(context.nb_items % 2 != 0){
                                    raise_syntax_error(context,
                                        "':' expected after dictionary key")
                                }
                            }
                            context.items = context.tree
                            context.tree = []
                            context.closed = true
                            return context
                      }
                      raise_syntax_error(context)
                case ',':
                    check_last()
                    var last = $B.last(context.tree)
                    if(last.type == "expr" && last.tree[0].type == "kwd"){
                        context.nb_items += 2
                    }else{
                        context.nb_items++
                    }
                    if(context.real == 'dict_or_set'){
                        var last = context.tree[0]
                        context.real = (last.type == 'expr' &&
                            last.tree[0].type == 'kwd') ? 'dict' : 'set'
                    }
                    if(context.real == 'dict' && context.nb_items % 2){
                        raise_syntax_error(context,
                            "':' expected after dictionary key")
                    }
                    return new $AbstractExprCtx(context, false)
                case ':':
                    if(context.real == 'dict_or_set'){
                        context.real = 'dict'
                    }
                    if(context.real == 'dict'){
                        context.expect = 'value'
                        this.nb_items++
                        context.value_pos = $token.value
                        return context
                    }else{
                        raise_syntax_error(context)
                    }
                case 'for':
                    // comprehension
                    if(context.real == "set" && context.tree.length > 1){
                        $token.value = context.tree[0].position
                        raise_syntax_error(context, "did you forget " +
                            "parentheses around the comprehension target?")
                    }
                    var expr = context.tree[0],
                        err_msg
                    if(expr.type == 'expr'){
                        if(expr.tree[0].type == 'kwd'){
                            err_msg = 'dict unpacking cannot be used in dict comprehension'
                        }else if(expr.tree[0].type == 'starred'){
                            err_msg = 'iterable unpacking cannot be used in comprehension'
                        }
                        if(err_msg){
                            raise_syntax_error_known_range(context,
                                expr.position,
                                last_position(expr),
                                err_msg)
                        }
                    }
                    if(context.real == 'dict_or_set'){
                        return new $TargetListCtx(new $ForExpr(
                            new SetCompCtx(this)))
                    }else{
                        return new $TargetListCtx(new $ForExpr(
                            new DictCompCtx(this)))
                    }
            }
            raise_syntax_error(context)
        }else if(context.expect == 'value'){
            if(python_keywords.indexOf(token) > -1){
                var ae = new $AbstractExprCtx(context, false)
                try{
                    $transition(ae, token, value)
                    context.tree.pop()
                }catch(err){
                    raise_syntax_error(context)
                }
            }
            try{
                context.expect = ','
                return $transition(new $AbstractExprCtx(context, false),
                    token, value)
            }catch(err){
                $token.value = context.value_pos
                raise_syntax_error(context, "expression expected after " +
                    "dictionary key and ':'")
            }
        }
        return $transition(context.parent, token, value)
    }
}

var $DoubleStarArgCtx = $B.parser.$DoubleStarArgCtx = function(context){
    // Class for syntax "**kw" in a call
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$DoubleStarArgCtx.prototype.transition = function(token, value){
    var context = this
    switch(token){
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
        case ',':
        case ')':
            return $transition(context.parent, token)
        case ':':
            if(context.parent.parent.type == 'lambda'){
              return $transition(context.parent.parent, token)
            }
    }
    raise_syntax_error(context)
}

var $EllipsisCtx = $B.parser.$EllipsisCtx = function(context){
    // Class for "..."
    this.type = 'ellipsis'
    this.parent = context
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$EllipsisCtx.prototype.ast = function(){
    var ast_obj = new ast.Constant({type: 'ellipsis'})
    set_position(ast_obj, this.position)
    return ast_obj
}

$EllipsisCtx.prototype.transition = function(token, value){
    var context = this
    return $transition(context.parent, token, value)
}

var $EndOfPositionalCtx = $B.parser.$EndOfConditionalCtx = function(context){
    // Indicates the end of positional arguments in a function definition
    // PEP 570
    this.type = "end_positional"
    this.parent = context
    context.has_end_positional = true
    context.parent.pos_only = context.tree.length
    context.tree.push(this)
}

$EndOfPositionalCtx.prototype.transition = function(token, value){
    var context = this
    if(token == "," || token == ")"){
        return $transition(context.parent, token, value)
    }
    raise_syntax_error(context)
}

var $ExceptCtx = $B.parser.$ExceptCtx = function(context){
    // Class for keyword "except"
    this.type = 'except'
    this.position = $token.value
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'id'
    this.scope = $get_scope(this)
}

$ExceptCtx.prototype.ast = function(){
    // ast.ExceptHandler(type, name, body)
    var ast_obj = new ast.ExceptHandler(
        this.tree.length == 1 ? this.tree[0].ast() : undefined,
        this.has_alias ? this.tree[0].alias : undefined,
        ast_body(this.parent)
    )
    set_position(ast_obj, this.position)
    return ast_obj
}

$ExceptCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case 'not':
        case 'lambda':
            if(context.expect == 'id'){
               context.expect = 'as'
               return $transition(new $AbstractExprCtx(context, false),
                   token, value)
            }
        case 'as':
            // only one alias allowed
            if(context.expect == 'as' &&
                    context.has_alias === undefined){
                context.expect = 'alias'
                context.has_alias = true
                return context
            }
        case 'id':
            if(context.expect == 'alias'){
                context.expect = ':'
                context.set_alias(value)
                return context
            }
            break
        case ':':
            var _ce = context.expect
            if(_ce == 'id' || _ce == 'as' || _ce == ':'){
                return $BodyCtx(context)
            }
            break
        case '(':
            if(context.expect == 'id' && context.tree.length == 0){
                context.parenth = true
                return context
            }
            break
        case ')':
            if(context.expect == ',' || context.expect == 'as'){
                context.expect = 'as'
                return context
            }
        case ',':
            if(context.parenth !== undefined &&
                    context.has_alias === undefined &&
                    (context.expect == 'as' || context.expect == ',')){
                context.expect = 'id'
                return context
            }else if(context.parenth === undefined){
                raise_syntax_error(context,
                    "multiple exception types must be parenthesized")
            }
        case 'eol':
            raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

$ExceptCtx.prototype.set_alias = function(alias){
    this.tree[0].alias = $mangle(alias, this)
}

var $ExprCtx = $B.parser.$ExprCtx = function(context, name, with_commas){
    // Base class for expressions
    this.type = 'expr'
    this.name = name
    this.$pos = $pos
    this.position = $token.value //context.position
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.expect = ',' // can be 'expr' or ','
    this.parent = context
    if(context.packed){
        this.packed = context.packed
    }
    this.tree = []
    context.tree[context.tree.length] = this
}

$ExprCtx.prototype.ast = function(){
    var res = this.tree[0].ast()
    if(this.packed){
        // return new ast.Starred(res)
    }else if(this.annotation){
        res = new ast.AnnAssign(
            res,
            this.annotation.tree[0].ast(),
            undefined,
            this.$was_parenthesized ? 0 : 1)
        set_position(res, this.position)
    }
    return res
}

$ExprCtx.prototype.transition = function(token, value){
    var context = this
    if(python_keywords.indexOf(token) > -1 &&
            ['as', 'else', 'if', 'for', 'from', 'in'].indexOf(token) == -1){
        context.$pos = $pos
        raise_syntax_error(context)
    }
    if(context.parent.expect == 'star_target'){
        if(['pass', 'in', 'not', 'op', 'augm_assign', '=', ':=', 'if', 'eol'].
            indexOf(token) > -1){
            return $transition(context.parent, token, value)
        }
    }
    switch(token) {
        case 'bytes':
        case 'float':
        case 'id':
        case 'imaginary':
        case 'int':
        case 'lambda':
        case 'pass':
        case 'str':
        case 'JoinedStr':
            var msg = 'invalid syntax. Perhaps you forgot a comma?'
            raise_syntax_error_known_range(context,
                this.position, $token.value, msg)
            break
        case '{':
            // Special case : "print {...}" must raise a SyntaxError
            // with "Missing parenthesis"...
            if(context.tree[0].type != "id" ||
                    ["print", "exec"].indexOf(context.tree[0].value) == -1){
                raise_syntax_error(context)
            }
            return new $AbstractExprCtx(new $DictOrSetCtx(context), false)
        case '[':
        case '(':
        case '.':
        case 'not':
            if(context.expect == 'expr'){
                context.expect = ','
                return $transition(new $AbstractExprCtx(context, false),
                    token, value)
            }
    }
    switch(token) {
        case 'not':
            if(context.expect == ','){
                return new $ExprNot(context)
            }
            break
        case 'in':
            if(context.parent.type == 'target_list'){
                // expr used for target list
                return $transition(context.parent, token)
            }
            if(context.expect == ','){
                return $transition(context, 'op', 'in')
            }
        case ',':
            if(context.expect == ','){
                if(context.parent.type == 'assign'){
                    var assigned = context.parent.tree[0]
                    if(assigned.type == 'expr' && assigned.tree[0].type == 'id'){
                        if(context.name == 'unary' || context.name == 'operand'){
                            var a = context.parent.tree[0].position,
                                b = last_position(context)
                            raise_syntax_error_known_range(
                                context,
                                a, b, "invalid syntax. " +
                                    "Maybe you meant '==' or ':=' instead of '='?")
                        }
                    }
                }
                if(context.name == 'iterator' &&
                        context.parent.parent.type != 'node'){
                    // case "(x for x in expr, y)" : we must detect that the
                    // expression is the iterator of a generator expression
                    var for_expr = context.parent.parent
                    raise_syntax_error_known_range(context,
                        first_position(for_expr), last_position(for_expr),
                        'Generator expression must be parenthesized')
                }
                if(context.with_commas ||
                        ["assign", "return"].indexOf(context.parent.type) > -1){
                    if($parent_match(context, {type: "yield", "from": true})){
                        raise_syntax_error(context, "no implicit tuple for yield from")
                    }
                     // implicit tuple
                     context.parent.tree.pop()
                     var tuple = new $ListOrTupleCtx(context.parent,
                         'tuple')
                     tuple.implicit = true
                     tuple.has_comma = true
                     tuple.tree = [context]
                     context.parent = tuple
                     return tuple
                 }
            }
            return $transition(context.parent, token)
        case '.':
            return new $AttrCtx(context)
      case '[':
          if(context.tree[0].type == 'id'){
              // ids in "for" targets have attribute "bound" set
              // remove it if target is a subscript
              delete context.tree[0].bound
          }
          return new $AbstractExprCtx(new $SubCtx(context), true)
      case '(':
          return new $CallCtx(context)
      case 'op':
          if(context.parent.type == 'withitem' && context.parent.tree.length == 2){
              raise_syntax_error(context, "expected ':'")
          }
          // handle operator precedence ; fasten seat belt ;-)
          var op_parent = context.parent,
              op = value

          // conditional expressions have the lowest priority
          if(op_parent.type == 'ternary' && op_parent.in_else){
              var new_op = new $OpCtx(context, op)
              return new $AbstractExprCtx(new_op, false)
          }

          // Climb up the tree until we find an operation op1.
          // If it has a lower precedence than the new token op, replace it by
          // an operation with op, whose left side is the operation op1.
          var op1 = context.parent,
              repl = null
          while(1){
              if(op1.type == 'unary' && op !== '**'){
                  repl = op1
                  op1 = op1.parent
              }else if(op1.type == 'expr'){
                  op1 = op1.parent
              }else if(op1.type == 'op' &&
                      $op_weight[op1.op] >= $op_weight[op] &&
                      ! (op1.op == '**' && op == '**')){ // cf. issue #250
                  repl = op1
                  op1 = op1.parent
              }else if(op1.type == "not" &&
                      $op_weight['not'] > $op_weight[op]){
                  repl = op1
                  op1 = op1.parent
              }else{
                  break
              }
          }

          if(repl === null){
              if(op1.type == 'op'){
                  // current expr is inside an operation with lower precedence
                  // than op, eg (+ a b) with op == '*'
                  // Replace this expression by (+ a (* b ?))
                  var right = op1.tree.pop(),
                      expr = new $ExprCtx(op1, 'operand', context.with_commas)
                  expr.tree.push(right)
                  right.parent = expr
                  var new_op = new $OpCtx(expr, op)
                  return new $AbstractExprCtx(new_op, false)
              }
              var position = context.position

              while(context.parent !== op1){
                  context = context.parent
                  op_parent = context.parent
              }
              context.parent.tree.pop()
              var expr = new $ExprCtx(op_parent, 'operand',
                  context.with_commas)
              expr.position = position
              expr.expect = ','
              context.parent = expr
              var new_op = new $OpCtx(context, op)
              return new $AbstractExprCtx(new_op, false)
          }else{
              // issue #371
              if(op === 'and' || op === 'or'){
                  while(repl.parent.type == 'not' ||
                          (repl.parent.type == 'expr' &&
                          repl.parent.parent.type == 'not')){
                      // 'and' and 'or' have higher precedence than 'not'
                      repl = repl.parent
                      op_parent = repl.parent
                  }
              }
          }
          if(repl.type == 'op'){
              var _flag = false
              switch(repl.op){
                  case '<':
                  case '<=':
                  case '==':
                  case '!=':
                  case 'is':
                  case '>=':
                  case '>':
                     _flag = true
              }
              if(_flag) {
                  switch(op) {
                      case '<':
                      case '<=':
                      case '==':
                      case '!=':
                      case 'is':
                      case '>=':
                      case '>':
                      case 'in':
                      case 'not_in':
                       // chained comparisons such as c1 <= c2 < c3
                       repl.ops = repl.ops || [repl.op]
                       repl.ops.push(op)
                       return new $AbstractExprCtx(repl, false)
                 }
              }
          }
          repl.parent.tree.pop()
          var expr = new $ExprCtx(repl.parent, 'operand', false)
          expr.tree = [op1]
          expr.position = op1.position
          repl.parent = expr
          var new_op = new $OpCtx(repl,op) // replace old operation
          return new $AbstractExprCtx(new_op,false)
      case 'augm_assign':
          check_assignment(context, {augmented: true})
          var parent = context
          while(parent){
              if(parent.type == "assign" || parent.type == "augm_assign"){
                  raise_syntax_error(context,
                      "augmented assignment inside assignment")
              }else if(parent.type == "op"){
                  raise_syntax_error(context, "cannot assign to operator")
              }else if(parent.type == "list_or_tuple"){
                  raise_syntax_error(context, `'${parent.real}' is an illegal` +
                      " expression for augmented assignment")
              }else if(['list', 'tuple'].indexOf(parent.name) > -1){
                  raise_syntax_error(context, `'${parent.name}' is an illegal` +
                      " expression for augmented assignment")
              }else if(['dict_or_set'].indexOf(parent.name) > -1){
                  raise_syntax_error(context, `'${parent.tree[0].real } display'` +
                      " is an illegal expression for augmented assignment")
              }
              parent = parent.parent
          }
          if(context.expect == ','){
               return new $AbstractExprCtx(
                   new $AugmentedAssignCtx(context, value), true)
          }
          return $transition(context.parent, token, value)
      case ":": // slice or annotation
          // slice only if expr parent is a subscription, or a tuple
          // inside a subscription, or a slice
          if(context.parent.type == "sub" ||
                  (context.parent.type == "list_or_tuple" &&
                  context.parent.parent.type == "sub")){
              return new $AbstractExprCtx(new $SliceCtx(context.parent), false)
          }else if(context.parent.type == "slice"){
              return $transition(context.parent, token, value)
          }else if(context.parent.type == "node"){
              // annotation
              if(context.tree.length == 1){
                  var child = context.tree[0]
                  check_assignment(child)
                  if(["id", "sub", "attribute"].indexOf(child.type) > -1){
                      return new $AbstractExprCtx(new $AnnotationCtx(context), false)
                  }else if(child.real == "tuple" && child.expect == "," &&
                           child.tree.length == 1){
                      return new $AbstractExprCtx(new $AnnotationCtx(child.tree[0]), false)
                  }
              }
              var type = context.tree[0].real
              raise_syntax_error_known_range(context,
                  context.position,
                  last_position(context),
                  `only single target (not ${type}) can be annotated`)
          }
          break
      case '=':

          var call_arg = $parent_match(context, {type: 'call_arg'})
          // Special case for '=' inside a call
          try{
              check_assignment(context)
          }catch(err){
              if(call_arg){
                  var ctx = context
                  while(ctx.parent !== call_arg){
                      ctx = ctx.parent
                  }
                  raise_syntax_error_known_range(ctx,
                      ctx.position,
                      $token.value,
                      'expression cannot contain assignment, perhaps you meant "=="?')
              }else{
                  throw err
              }
          }
          var annotation
          if(context.expect == ','){
              if(context.parent.type == "call_arg"){
                 // issue 708
                 if(context.tree[0].type != "id"){
                      raise_syntax_error_known_range(context,
                          context.position,
                          $token.value,
                          'expression cannot contain assignment, perhaps you meant "=="?')
                 }
                 return new $AbstractExprCtx(new $KwArgCtx(context), true)
              }else if(annotation = $parent_match(context, {type: "annotation"})){
                  return $transition(annotation, token, value)
              }else if(context.parent.type == "op"){
                   // issue 811
                   raise_syntax_error(context, "cannot assign to operator")
              }else if(context.parent.type == "not"){
                   // issue 1496
                   raise_syntax_error(context, "cannot assign to operator")
              }else if(context.parent.type == "with"){
                   raise_syntax_error(context, "expected :")
              }else if(context.parent.type == 'dict_or_set'){
                   if(context.parent.expect == ','){
                       // We could raise a SyntaxError here, but CPython waits
                       // until the right part of the assignment is finished
                       context.wrong_assignment = true
                       return $transition(context, ':=')
                   }
              }else if(context.parent.type == "list_or_tuple"){
                   // issue 973
                   for(var i = 0; i < context.parent.tree.length; i++){
                       var item = context.parent.tree[i]
                       try{
                           check_assignment(item, {once: true})
                       }catch(err){
                           console.log(context)
                           raise_syntax_error(context, "invalid syntax. " +
                               "Maybe you meant '==' or ':=' instead of '='?")
                       }
                       if(item.type == "expr" && item.name == "operand"){
                           raise_syntax_error(context, "cannot assign to operator")
                       }
                   }
                   // issue 1875
                   if(context.parent.real == 'list' ||
                           (context.parent.real == 'tuple' &&
                            ! context.parent.implicit)){
                       raise_syntax_error(context, "invalid syntax. " +
                           "Maybe you meant '==' or ':=' instead of '='?")
                   }
              }else if(context.parent.type == "expr" &&
                      context.parent.name == "iterator"){
                  raise_syntax_error(context, 'expected :')
              }else if(context.parent.type == "lambda"){
                  if(context.parent.parent.parent.type != "node"){
                      raise_syntax_error(context, 'expression cannot contain' +
                          ' assignment, perhaps you meant "=="?')
                  }
              }else if(context.parent.type == 'target_list'){
                  raise_syntax_error(context, "(assign to target in iteration)")
              }
              while(context.parent !== undefined){
                  context = context.parent
                  if(context.type == "condition"){
                      raise_syntax_error(context, "invalid syntax. Maybe you" +
                          " meant '==' or ':=' instead of '='?")
                  }else if(context.type == "augm_assign"){
                      raise_syntax_error(context,
                         "(assignment inside augmented assignment)")
                  }
              }
              context = context.tree[0]
              return new $AbstractExprCtx(new $AssignCtx(context), true)
          }
          break
      case ':=':
          // PEP 572 : assignment expression
          var ptype = context.parent.type
          if(["node", "assign", "kwarg", "annotation"].
                  indexOf(ptype) > -1){
              raise_syntax_error(context,
                  '(:= invalid, parent ' + ptype + ')')
          }else if(ptype == "func_arg_id" &&
                  context.parent.tree.length > 0){
              // def foo(answer = p := 42):
              raise_syntax_error(context,
                  '(:= invalid, parent ' + ptype + ')')
          }else if(ptype == "call_arg" &&
                  context.parent.parent.type == "call" &&
                  context.parent.parent.parent.type == "lambda"){
              // lambda x := 1
              raise_syntax_error(context,
                  '(:= invalid inside function arguments)' )
          }
          if(context.tree.length == 1 && context.tree[0].type == "id"){
              var scope = $get_scope(context),
                  name = context.tree[0].value
              if(['None', 'True', 'False'].indexOf(name) > -1){
                  raise_syntax_error(context,
                      `cannot use assignment expressions with ${name}`)
              }else if(name == '__debug__'){
                  raise_syntax_error(context, 'cannot assign to __debug__')
              }
              while(scope.comprehension){
                  scope = scope.parent_block
              }
              return new $AbstractExprCtx(new NamedExprCtx(context), false)
          }
          raise_syntax_error(context)
      case 'if':
          var in_comp = false,
              ctx = context.parent
          while(ctx){
              if(ctx.comprehension){
                  in_comp = true
                  break
              }else if(ctx.type == "list_or_tuple"){
                  // In parenthised expression, eg the second "if" in
                  // flds=[f for f in fields if (x if y is None else z)]
                  break
              }else if(ctx.type == 'comp_for'){
                  break
              }else if(ctx.type == 'comp_if'){
                  // [x for x in A if condition if ...]
                  in_comp = true
                  break
              }else if(ctx.type == 'call_arg' || ctx.type == 'sub'){
                  // f(x if ...)
                  // f[x if ...]
                  break
              }else if(ctx.type == 'expr'){
                  if(ctx.parent.type == 'comp_iterable'){
                      // [x for x in a + b if ...]
                      in_comp = true
                      break
                  }
              }
              ctx = ctx.parent
          }
          if(in_comp){
              break
          }
          // Ternary operator : "expr1 if cond else expr2"
          // If the part before "if" is an operation, apply operator
          // precedence
          // Example : print(1+n if n else 0)
          var ctx = context
          while(ctx.parent &&
                  (ctx.parent.type == 'op' ||
                   ctx.parent.type == 'not' ||
                   ctx.parent.type == 'unary' ||
                   (ctx.parent.type == "expr" && ctx.parent.name == "operand"))){
              ctx = ctx.parent
          }
          return new $AbstractExprCtx(new $TernaryCtx(ctx), false)

      case 'eol':
          // Special case for print and exec
          if(context.tree.length == 2 &&
                  context.tree[0].type == "id" &&
                  ["print", "exec"].indexOf(context.tree[0].value) > -1){
              var func = context.tree[0].value
              raise_syntax_error_known_range(context,
                  context.position,
                  $token.value,
                  "Missing parentheses in call " +
                  `to '${func}'. Did you mean ${func}(...)?`)
          }
          if(["dict_or_set", "list_or_tuple", "str"].indexOf(context.parent.type) == -1){
              var t = context.tree[0]
              if(t.type == "starred"){
                  $token.value = t.position
                  if($parent_match(context, {type: 'del'})){
                      raise_syntax_error(context, 'cannot delete starred')
                  }
                  raise_syntax_error_known_range(context,
                      t.position,
                      last_position(t),
                      "can't use starred expression here")
              }else if(t.type == "call" && t.func.type == "starred"){
                  $token.value = t.func.position
                  raise_syntax_error(context,
                      "can't use starred expression here")
              }
          }
    }
    return $transition(context.parent,token)
}

var $ExprNot = $B.parser.$ExprNot = function(context){
    // Class used temporarily for 'x not', only accepts 'in' as next token
    // Never remains in the final tree, so there is no need to define to_js()
    this.type = 'expr_not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$ExprNot.prototype.transition = function(token, value){
    var context = this
    if(token == 'in'){ // expr not in : operator
        context.parent.tree.pop()
        // Apply operator precedence to the expression above this instance
        // eg "a + b not in ?" becomes "(a + b) not in ?")
        var op1 = context.parent
        while(op1.type !== 'expr'){
            op1 = op1.parent
        }
        return op1.transition('op', 'not_in')
    }
    raise_syntax_error(context)
}

var $ForExpr = $B.parser.$ForExpr = function(context){
    // Class for keyword "for"
    if(context.node && context.node.parent.is_comp){
        // first "for" inside a comprehension
        context.node.parent.first_for = this
    }
    this.type = 'for'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree.push(this)
    this.scope = $get_scope(this)
    this.module = this.scope.module
}

$ForExpr.prototype.ast = function(){
    // ast.For(target, iter, body, orelse, type_comment)
    var target = this.tree[0].ast(),
        iter = this.tree[1].ast(),
        orelse = this.orelse ? this.orelse.ast() : [],
        type_comment,
        body = ast_body(this.parent)
    set_ctx_to_store(target)
    var klass = this.async ? ast.AsyncFor : ast.For
    var ast_obj = new klass(target, iter, body, orelse, type_comment)
    set_position(ast_obj,
        this.async ? this.async.position : this.position,
        last_position(this))
    return ast_obj
}

$ForExpr.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'in':
            if(context.tree[0].tree.length == 0){
                // issue 1293 : "for in range(n)"
                raise_syntax_error(context,
                    "(missing target between 'for' and 'in')")
            }
            check_assignment(context.tree[0])
            return new $AbstractExprCtx(
                new $ExprCtx(context, 'iterator', true), false)
        case ':':
            check_assignment(context.tree[0])
            if(context.tree.length < 2 // issue 638
                    || context.tree[1].tree[0].type == "abstract_expr"){
                raise_syntax_error(context)
            }
            return $BodyCtx(context)
    }
    if(this.parent.comprehension){
        switch(token){
            case ']':
                if(this.parent.type == 'listcomp'){
                    return $transition(this.parent, token, value)
                }
                break
            case ')':
                if(this.parent.type == 'genexpr'){
                    return $transition(this.parent, token, value)
                }
                break
            case '}':
                if(this.parent.type == 'dictcomp' ||
                        this.parent.type == 'setcomp'){
                    return $transition(this.parent, token, value)
                }
                break
            case 'for':
                return new $TargetListCtx(new $ForExpr(this.parent))
            case 'if':
                var if_ctx = new $ConditionCtx(this.parent, 'if')
                if_ctx.in_comp = this.parent
                return new $AbstractExprCtx(if_ctx, false)

        }
    }
    if(token == 'eol'){
        $token.value = last_position(context)
        if(context.tree.length == 2){
            raise_syntax_error(context, "expected ':'")
        }
    }
    raise_syntax_error(context)
}

var $FromCtx = $B.parser.$FromCtx = function(context){
    // Class for keyword "from" for imports
    this.type = 'from'
    this.parent = context
    this.module = ''
    this.names = []
    this.names_position = []
    this.position = $token.value

    context.tree[context.tree.length] = this
    this.expect = 'module'
    this.scope = $get_scope(this)
}

$FromCtx.prototype.ast = function(){
    // ast.ImportFrom(module, names, level)
    var module = this.module,
        level = 0,
        alias
    while(module.length > 0 && module.startsWith('.')){
        level++
        module = module.substr(1)
    }
    var res = {
        module: module || undefined,
        names: [],
        level
    }
    for(var i=0, len=this.names.length; i < len; i++){
        var name = this.names[i],
            position = this.names_position[i]
        if(Array.isArray(name)){
            alias = new ast.alias(name[0], name[1])
        }else{
            alias = new ast.alias(name)
        }
        set_position(alias, position)
        res.names.push(alias)
    }
    var ast_obj = new ast.ImportFrom(res.module, res.names, res.level)
    set_position(ast_obj, this.position)
    return ast_obj
}

$FromCtx.prototype.add_name = function(name){
    this.names.push(name)
    this.names_position.push($token.value)
    if(name == '*'){
        this.scope.blurred = true
    }
    this.end_position = $token.value
}

$FromCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'module'){
                context.module += value
                return context
            }else if(context.expect == 'id'){
                context.add_name(value)
                context.expect = ','
                return context
            }else if(context.expect == 'alias'){
                context.names[context.names.length - 1] =
                    [$B.last(context.names), value]
                context.expect = ','
                return context
            }
            break
        case '.':
          if(context.expect == 'module'){
              if(token == 'id'){context.module += value}
              else{context.module += '.'}
              return context
          }
          break
        case 'ellipsis':
          if(context.expect == 'module'){
              context.module += '...'
              return context
          }
          break
        case 'import':
            if(context.names.length > 0){ // issue 1850
                raise_syntax_error(context,
                    "only one 'import' allowed after 'from'")
            }
            if(context.expect == 'module'){
                context.expect = 'id'
                return context
            }
        case 'op':
            if(value == '*' && context.expect == 'id'
                    && context.names.length == 0){
               if($get_scope(context).ntype !== 'module'){
                   raise_syntax_error(context,
                       "import * only allowed at module level")
               }
               context.add_name('*')
               context.expect = 'eol'
               return context
            }else{
                raise_syntax_error(context)
            }
        case ',':
            if(context.expect == ','){
                context.expect = 'id'
                return context
            }
        case 'eol':
            switch(context.expect) {
                case ',':
                case 'eol':
                    return $transition(context.parent, token)
                case 'id':
                    raise_syntax_error(context,
                        'trailing comma not allowed without ' +
                            'surrounding parentheses')
                default:
                    raise_syntax_error(context)
            }
        case 'as':
          if(context.expect == ',' || context.expect == 'eol'){
             context.expect = 'alias'
             return context
          }
        case '(':

            if(context.expect == 'id'){
                context.expect = 'id'
                return context
            }
        case ')':
          if(context.expect == ',' || context.expect == 'id'){
             context.expect = 'eol'
             return context
          }
    }
    raise_syntax_error(context)

}

var $FuncArgs = $B.parser.$FuncArgs = function(context){
    // Class for arguments in a function definition
    this.type = 'func_args'
    this.parent = context
    this.tree = []
    this.names = []
    context.tree[context.tree.length] = this

    this.expect = 'id'
    this.has_default = false
    this.has_star_arg = false
    this.has_kw_arg = false
}

$FuncArgs.prototype.ast = function(){
    var args = {
            posonlyargs: [],
            args: [],
            kwonlyargs: [],
            kw_defaults: [],
            defaults: []
        },
        state = 'arg',
        default_value
    for(var arg of this.tree){
        if(arg.type == 'end_positional'){
            args.posonlyargs = args.args
            args.args = []
        }else if(arg.type == 'func_star_arg'){
            state = 'kwonly'
            if(arg.op == '*' && arg.name != '*'){
                args.vararg = new ast.arg(arg.name)
                if(arg.annotation){
                    args.vararg.annotation = arg.annotation.tree[0].ast()
                }
                set_position(args.vararg, arg.position)
            }else if(arg.op == '**'){
                args.kwarg = new ast.arg(arg.name)
                if(arg.annotation){
                    args.kwarg.annotation = arg.annotation.tree[0].ast()
                }
                set_position(args.kwarg, arg.position)
            }
        }else{
            default_value = false
            if(arg.has_default){
                default_value = arg.tree[0].ast()
            }
            var argument = new ast.arg(arg.name)
            set_position(argument, arg.position,
                last_position(arg))
            if(arg.annotation){
                argument.annotation = arg.annotation.tree[0].ast()
            }
            if(state == 'kwonly'){
                args.kwonlyargs.push(argument)
                if(default_value){
                    args.kw_defaults.push(default_value)
                }else{
                    args.kw_defaults.push(_b_.None)
                }
            }else{
                args.args.push(argument)
                if(default_value){
                    args.defaults.push(default_value)
                }
            }
        }
    }
    // ast.arguments(posonlyargs, args, vararg, kwonlyargs, kw_defaults, kwarg, defaults)
    var res = new ast.arguments(args.posonlyargs, args.args, args.vararg,
        args.kwonlyargs, args.kw_defaults, args.kwarg, args.defaults)
    return res
}

$FuncArgs.prototype.transition = function(token, value){
    var context = this
    function check(){
        if(context.tree.length == 0){
            return
        }
        var last = $B.last(context.tree)
        if(context.has_default && ! last.has_default){
            if(last.type == 'func_star_arg' ||
                    last.type == 'end_positional'){
                return
            }
            if(context.has_star_arg){
                // non-default arg after default arg is allowed for
                // keyword-only parameters, eg arg "z" in "f(x, *, y=1, z)"
                return
            }
            raise_syntax_error(context,
                'non-default argument follows default argument')
        }
        if(last.has_default){
            context.has_default = true
        }
    }

    function check_last(){
        var last = $B.last(context.tree)
        if(last && last.type == "func_star_arg"){
            if(last.name == "*"){
                // Form "def f(x, *)" is invalid
                raise_syntax_error(context,
                    'named arguments must follow bare *')

            }
        }
    }

    switch (token) {
        case 'id':
            if(context.has_kw_arg){
                raise_syntax_error(context, 'duplicate keyword argument')
            }
            if(context.expect == 'id'){
                context.expect = ','
                if(context.names.indexOf(value) > -1){
                  raise_syntax_error(context,
                      'duplicate argument ' + value +
                          ' in function definition')
                }
            }
            return new $FuncArgIdCtx(context, value)
        case ',':
            if(context.expect == ','){
                check()
                context.expect = 'id'
                return context
            }
            raise_syntax_error(context)
        case ')':
            check()
            check_last()
            return $transition(context.parent, token, value)
        case 'op':
            if(context.has_kw_arg){
                raise_syntax_error(context, "(unpacking after '**' argument)")
            }
            var op = value
            context.expect = ','
            if(op == '*'){
                if(context.has_star_arg){
                    raise_syntax_error(context, "(only one '*' argument allowed)")
                }
                return new $FuncStarArgCtx(context, '*')
            }else if(op == '**'){
                return new $FuncStarArgCtx(context, '**')
            }else if(op == '/'){ // PEP 570
                if(context.has_end_positional){
                    raise_syntax_error(context, '/ may appear only once')
                }else if(context.has_star_arg){
                    raise_syntax_error(context, '/ must be ahead of *')
                }
                return new $EndOfPositionalCtx(context)
            }
            raise_syntax_error(context)
        case ':':
            if(context.parent.type == "lambda"){
                return $transition(context.parent, token)
            }
    }
    raise_syntax_error(context)
}

var $FuncArgIdCtx = $B.parser.$FuncArgIdCtx = function(context, name){
    // id in function arguments
    // may be followed by = for default value
    this.type = 'func_arg_id'
    if(["None", "True", "False"].indexOf(name) > -1){
        raise_syntax_error(context) // invalid argument name
    }
    if(name == '__debug__'){
        raise_syntax_error(context, 'cannot assign to __debug__')
    }

    this.name = name
    this.parent = context
    this.position = $token.value

    if(context.has_star_arg){
        context.parent.after_star.push(name)
    }else{
        context.parent.positional_list.push(name)
    }
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = '='
}

$FuncArgIdCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case '=':
            if(context.expect == '='){
               context.has_default = true
               var def_ctx = context.parent.parent
               if(context.parent.has_star_arg){
                   def_ctx.default_list.push(def_ctx.after_star.pop())
               }else{
                   def_ctx.default_list.push(def_ctx.positional_list.pop())
               }
               return new $AbstractExprCtx(context, false)
            }
            break
        case ',':
        case ')':
            if(context.parent.has_default && context.tree.length == 0 &&
                    context.parent.has_star_arg === undefined){
                $pos -= context.name.length
                raise_syntax_error(context,
                    'non-default argument follows default argument')
            }else{
                return $transition(context.parent, token)
            }
        case ':':
            if(context.parent.parent.type == "lambda"){
                // end of parameters
                return $transition(context.parent.parent, ":")
            }
            // annotation associated with a function parameter
            if(context.has_default){ // issue 610
                raise_syntax_error(context)
            }
            return new $AbstractExprCtx(new $AnnotationCtx(context),
                false)
    }
    raise_syntax_error(context)
}

var $FuncStarArgCtx = $B.parser.$FuncStarArgCtx = function(context,op){
    // Class for "star argument" in a function definition : f(*args)
    this.type = 'func_star_arg'
    this.op = op
    this.parent = context
    this.node = $get_node(this)
    this.position = $token.value

    context.has_star_arg = op == '*'
    context.has_kw_arg = op == '**'
    context.tree[context.tree.length] = this
}

$FuncStarArgCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.name === undefined){
               if(context.parent.names.indexOf(value) > -1){
                 raise_syntax_error(context,
                     'duplicate argument ' + value +
                         ' in function definition')
               }
            }
            if(["None", "True", "False"].indexOf(value) > -1){
                raise_syntax_error(context) // invalid starred argument name
            }
            context.set_name(value)
            context.parent.names.push(value)
            return context
        case ',':
        case ')':
            if(context.name === undefined){
               // anonymous star arg - found in configparser
               context.set_name('*')
               context.parent.names.push('*')
            }
            return $transition(context.parent, token)
        case ':':
            if(context.parent.parent.type == "lambda"){
                // end of parameters
                if(context.name === undefined){
                    raise_syntax_error(context,
                        'named arguments must follow bare *')
                }
                return $transition(context.parent.parent, ":")
            }
            // annotation associated with a function parameter
            if(context.name === undefined){
                raise_syntax_error(context,
                    '(annotation on an unnamed parameter)')
            }
            return new $AbstractExprCtx(
                new $AnnotationCtx(context), false)
    }
    raise_syntax_error(context)
}

$FuncStarArgCtx.prototype.set_name = function(name){
    if(name == '__debug__'){
        raise_syntax_error_known_range(this,
            this.position,
            $token.value,
            'cannot assign to __debug__')
    }
    this.name = name

    var ctx = this.parent
    while(ctx.parent !== undefined){
        if(ctx.type == 'def'){
            break
        }
        ctx = ctx.parent
    }
    if(this.op == '*'){
        ctx.other_args = '"' + name + '"'
    }else{
        ctx.other_kw = '"' + name + '"'
    }
}

var GeneratorExpCtx = function(context){
    // create a List Comprehension
    // context is a $ListOrTupleCtx
    this.type = 'genexpr'
    this.tree = [context.tree[0]]
    this.tree[0].parent = this
    this.position = context.position
    Comprehension.make_comp(this, context)
}

GeneratorExpCtx.prototype.ast = function(){
    // ast.GeneratorExp(elt, generators)
    // elt is the part evaluated for each item
    // generators is a list of comprehensions
    var res = new ast.GeneratorExp(
        this.tree[0].ast(),
        Comprehension.generators(this.tree.slice(1))
    )
    set_position(res, this.position)
    return res
}

GeneratorExpCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ')'){
        if(this.parent.type == 'call'){
            // If the call had a previous argument, raise syntax error
            if(context.parent.tree.length > 1){
                raise_syntax_error_known_range(context,
                    first_position(context),
                    last_position(context),
                    'Generator expression must be parenthesized')
            }
            return this.parent.parent
        }
        return this.parent
    }
    raise_syntax_error(context)
}
var $GlobalCtx = $B.parser.$GlobalCtx = function(context){
    // Class for keyword "global"
    this.type = 'global'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
    this.expect = 'id'
    this.scope = $get_scope(this)
    this.module = $get_module(this)
    if(this.module.module !== '<module>'){ // used by eval1
        while(this.module.module != this.module.id){
            this.module = this.module.parent_block
        }
    }
    this.$pos = $pos
}

$GlobalCtx.prototype.ast = function(){
    // Global(identifier* names)
    var ast_obj = new ast.Global(this.tree.map(item => item.value))
    set_position(ast_obj, this.position)
    return ast_obj
}

$GlobalCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
               new $IdCtx(context, value)
               context.add(value)
               context.expect = ','
               return context
            }
            break
        case ',':
            if(context.expect == ','){
               context.expect = 'id'
               return context
            }
            break
        case 'eol':
            if(context.expect == ','){
               return $transition(context.parent, token)
            }
            break
    }
    raise_syntax_error(context)
}

$GlobalCtx.prototype.add = function(name){
    if(this.scope.type == "module"){
        // "global x" at module level does nothing
        return
    }
    // Remove bindings between scope and module
    var mod = this.scope.parent_block
    if(this.module.module.startsWith("$exec")){
        while(mod && mod.parent_block !== this.module){
            // Set attribute _globals for intermediate scopes
            mod._globals = mod._globals || new Map()
            mod._globals.set(name, this.module.id)
            // Delete possibly existing binding below module level
            mod = mod.parent_block
        }
    }
}

var $IdCtx = $B.parser.$IdCtx = function(context, value){
    // Class for identifiers (variable names)
    this.type = 'id'
    this.value = value // $mangle(value, context)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.position = $token.value

    var scope = this.scope = $get_scope(this)

    this.blurred_scope = this.scope.blurred

    // Store variables referenced in scope
    if(["def", "generator"].indexOf(scope.ntype) > -1){
        if((! (context instanceof $GlobalCtx)) &&
                ! (context instanceof $NonlocalCtx)){
            scope.referenced = scope.referenced || {}
            if(! $B.builtins[this.value]){
                scope.referenced[this.value] = true
            }
        }
    }
    if(context.parent.type == 'call_arg') {
        this.call_arg = true
    }

}

$IdCtx.prototype.ast = function(){
    var ast_obj
    if(['True', 'False', 'None'].indexOf(this.value) > -1){
        ast_obj = new ast.Constant(_b_[this.value])
    }else{
        ast_obj = new ast.Name(this.value,
            this.bound ? new ast.Store() : new ast.Load())
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$IdCtx.prototype.transition = function(token, value){
    var context = this
    if(context.value == 'case' && context.parent.parent.type == "node"){
        // case at the beginning of a line : if the line ends with a colon
        // (:), it is the "soft keyword" `case` for pattern matching
        var start = context.parent.$pos,
            src = $get_module(this).src,
            line = get_first_line(src.substr(start)),
            node = $get_node(context)
        if(line === true || line.text.endsWith(':')){
            var parent = node.parent
            if((! node.parent) || !(node.parent.is_match)){
                raise_syntax_error(context, "('case' not inside 'match')")
            }else{
                if(node.parent.irrefutable){
                    // "match" statement already has an irrefutable pattern
                    var name = node.parent.irrefutable,
                        msg = name == '_' ? 'wildcard' :
                            `name capture '${name}'`
                    raise_syntax_error(context,
                        `${msg} makes remaining patterns unreachable`)
                }
            }
            return $transition(new $PatternCtx(
                new $CaseCtx(context.parent.parent)),
                    token, value)
        }else if(node.parent && node.parent.is_match){
            // "case" starts a line whose parent is a match statement. The
            // line does not end with a ':'
            $token.value = line.newline_token
            raise_syntax_error(context, "expected ':'")
        }
    }else if(context.value == 'match' && context.parent.parent.type == "node"){
        // same for match
        var start = context.parent.$pos,
            root = $get_module(this),
            src = root.src
        var line = get_first_line(src.substr(start))
        if(line === true || line.text.endsWith(':')){
            return $transition(new $AbstractExprCtx(
                new $MatchCtx(context.parent.parent), true),
                token, value)
        }else{
            // The line starting with "match" does not end with ':'. Check
            // if line is ok without a trailing ':'
            try{
                $B.py2js({src: line.text.substr(5), filename: '<string>'},
                    'fake', 'fake', $B.builtins_scope)
                // no syntax error
            }catch(err){
                // If not, check if line would have been a valid match
                // statement if it had ended with ':'

                // Build a fake match block with a valid "case" block
                var fake_match = line.text + ':\n case _:\n  pass',
                    misses_colon = false
                try{
                    $B.py2js({src: fake_match, filename: '<string>'},
                        'fake', 'fake', $B.builtins_scope)
                    // no syntax error with ':'
                    misses_colon = true
                }catch(err){
                    // not a match statement
                }
                if(misses_colon){
                    $token.value = line.newline_token
                    raise_syntax_error(context, "expected ':'")
                }
            }
        }
    }
    switch(token) {
        case '=':
            if(context.parent.type == 'expr' &&
                    context.parent.parent !== undefined &&
                    context.parent.parent.type == 'call_arg'){
                return new $AbstractExprCtx(
                    new $KwArgCtx(context.parent), false)
            }
            return $transition(context.parent, token, value)
        case '.':
            // If followed by ".", the id cannot be bound
            delete this.bound
            return $transition(context.parent, token, value)
        case 'op':
            return $transition(context.parent, token, value)
        case 'id':
        case 'str':
        case 'JoinedStr':
        case 'int':
        case 'float':
        case 'imaginary':
            if(["print", "exec"].indexOf(context.value) > -1 ){
                var f = context.value,
                    msg = `Missing parentheses in call to '${f}'.` +
                    ` Did you mean ${f}(...)?`
            }else{
                var msg = 'invalid syntax. Perhaps you forgot a comma?'
            }
            var call_arg = $parent_match(context, {type: 'call_arg'})
            raise_syntax_error_known_range(context,
                this.position, $token.value, msg)

    }
    if(this.parent.parent.type == "starred"){
        if(['.', '[', '('].indexOf(token) == -1){
            return this.parent.parent.transition(token, value)
        }
    }
    return $transition(context.parent, token, value)
}

var $ImportCtx = $B.parser.$ImportCtx = function(context){
    // Class for keyword "import"
    this.type = 'import'
    this.parent = context
    this.tree = []
    this.position = $token.value

    context.tree[context.tree.length] = this
    this.expect = 'id'
}

$ImportCtx.prototype.ast = function(){
    //ast.Import(names)
    var names = []
    for(var item of this.tree){
        // check if item.name is a valid identifier
        var alias = new ast.alias(item.name)
        if(item.alias != item.name){
            alias.asname = item.alias
        }
        names.push(alias)
    }
    var ast_obj = new ast.Import(names)
    set_position(ast_obj, this.position)
    return ast_obj
}

$ImportCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
               new $ImportedModuleCtx(context, value)
               context.expect = ','
               return context
            }
            if(context.expect == 'qual'){
               context.expect = ','
               context.tree[context.tree.length - 1].name +=
                   '.' + value
               context.tree[context.tree.length - 1].alias +=
                   '.' + value
               return context
            }
            if(context.expect == 'alias'){
               context.expect = ','
               context.tree[context.tree.length - 1].alias =
                   value
               return context
            }
            break
        case '.':
            if(context.expect == ','){
                context.expect = 'qual'
                return context
            }
            break
        case ',':
            if(context.expect == ','){
               context.expect = 'id'
               return context
            }
            break
        case 'as':
            if(context.expect == ','){
               context.expect = 'alias'
               return context
            }
            break
        case 'eol':
            if(context.expect == ','){
               return $transition(context.parent, token)
            }
            break
    }
    raise_syntax_error(context)
}

var $ImportedModuleCtx = $B.parser.$ImportedModuleCtx = function(context,name){
    this.type = 'imported module'
    this.parent = context
    this.name = name
    this.alias = name
    context.tree[context.tree.length] = this
}

$ImportedModuleCtx.prototype.transition = function(token, value){
    var context = this
}

var JoinedStrCtx = $B.parser.JoinedStrCtx = function(context, values){
    // Class for f-strings. values is an Array with strings or expressions
    this.type = 'JoinedStr'
    this.parent = context
    this.tree = []
    this.position = $token.value
    this.scope = $get_scope(context)
    var line_num = $get_node(context).line_num
    for(var value of values){
        if(typeof value == "string"){
            new $StringCtx(this, "'" +
                value.replace(new RegExp("'", "g"), "\\" + "'") + "'")
        }else{
            if(value.format !== undefined){
                value.format = new JoinedStrCtx(this, value.format)
                this.tree.pop()
            }
            var src = value.expression.trimStart(), // ignore leading whitespace
                save_pos = $pos,
                root = $create_root_node(src,
                    this.scope.module, this.scope.id,
                    this.scope.parent_block, line_num)

            try{
                dispatch_tokens(root)
            }catch(err){
                err.args[1][1] += line_num - 1
                var line_start = save_pos,
                    source = $get_module(this).src
                while(line_start-- > 0 && source[line_start] != '\n'){}
                err.args[1][2] += value.start + save_pos - line_start
                err.lineno += line_num - 1
                err.args[1][3] = $get_module(this).src.split('\n')[line_num - 1]
                throw err
            }

            $pos = save_pos
            var expr = root.children[0].context.tree[0]
            this.tree.push(expr)
            expr.parent = this
            expr.elt = value
        }
    }
    context.tree.push(this)
    this.raw = false
    this.$pos = $pos
}

JoinedStrCtx.prototype.ast = function(){
    var res = {
        type: 'JoinedStr',
        values: []
    }
    var state
    for(var item of this.tree){
        if(item instanceof $StringCtx){
            if(state == 'string'){
                // eg in "'ab' f'c{x}'"
                $B.last(res.values).value += ' + ' + item.value
            }else{
                var item_ast = new ast.Constant(item.value)
                set_position(item_ast, item.position)
                res.values.push(item_ast)
            }
            state = 'string'
        }else{
            var conv_num = {a: 97, r: 114, s: 115},
                format = item.elt.format
            format = format === undefined ? format : format.ast()
            var value = new ast.FormattedValue(
                    item.ast(),
                    conv_num[item.elt.conversion] || -1,
                    format)
                set_position(value, this.position)
            var format = item.format
            if(format !== undefined){
                value.format = item.format.ast()
            }
            res.values.push(value)
            state = 'formatted_value'
        }
    }
    var ast_obj = new ast.JoinedStr(res.values)
    set_position(ast_obj, this.position)
    return ast_obj
}

JoinedStrCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case '[':
            return new $AbstractExprCtx(new $SubCtx(context.parent),
                false)
        case '(':
            // Strings are not callable. We replace the string by a
            // call to an object that will raise the correct exception
            context.parent.tree[0] = context
            return new $CallCtx(context.parent)
        case 'str':
            if(context.tree.length > 0 &&
                    $B.last(context.tree).type == "str"){
                context.tree[context.tree.length - 1].value +=
                    ' + ' + value
            }else{
                new $StringCtx(this, value)
            }
            return context
        case 'JoinedStr':
            // create new JoinedStr
            var joined_expr = new JoinedStrCtx(context.parent, value)
            context.parent.tree.pop()
            if(context.tree.length > 0 &&
                    $B.last(context.tree) instanceof $StringCtx &&
                    joined_expr.tree[0] instanceof $StringCtx){
                // merge last string in context and first in value
                $B.last(context.tree).value += ' + ' + joined_expr.tree[0].value
                context.tree = context.tree.concat(joined_expr.tree.slice(1))
            }else{
                context.tree = context.tree.concat(joined_expr.tree)
            }
            return context
    }
    return $transition(context.parent, token, value)
}
var $JSCode = $B.parser.$JSCode = function(js){
    this.js = js
}

$JSCode.prototype.transition = function(token, value){
    var context = this
}

var KwdCtx = $B.parser.KwdCtx = function(context){
    // used for **expr
    this.type = 'kwd'
    this.position = context.position
    this.parent = context
    this.tree = []
    context.tree.push(this)
}

KwdCtx.prototype.ast = function(){
    var ast_obj = new $B.ast.keyword(this.tree[0].ast(), new ast.Load())
    set_position(ast_obj, this.position)
    return ast_obj
}

KwdCtx.prototype.transition = function(token, value){
    var context = this
    return $transition(context.parent, token, value)
}

var $KwArgCtx = $B.parser.$KwArgCtx = function(context){
    // Class for keyword argument in a call
    this.type = 'kwarg'
    this.parent = context.parent
    this.position = first_position(context)
    this.equal_sign_position = $token.value
    this.tree = [context.tree[0]]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)

    // set attribute "has_kw" of $CallCtx instance to true
    context.parent.parent.has_kw = true
}

$KwArgCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ','){
        return new $CallArgCtx(context.parent.parent)
    }else if(token == 'for'){
        // generator expression is invalid
        raise_syntax_error_known_range(context,
            context.position,
            context.equal_sign_position,
            "invalid syntax. " +
            "Maybe you meant '==' or ':=' instead of '='?")
    }
    return $transition(context.parent, token)
}

var $LambdaCtx = $B.parser.$LambdaCtx = function(context){
    // Class for keyword "lambda"
    this.type = 'lambda'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.position = $token.value
    this.args_start = $pos + 6

    // initialize object for names bound in the function
    this.node = $get_node(this)

    // Arrays for arguments
    this.positional_list = []
    this.default_list = []
    this.other_args = null
    this.other_kw = null
    this.after_star = []
}

$LambdaCtx.prototype.ast = function(){
    // ast.Lambda(args, body)
    var args
    if(this.args.length == 0){
        args = new ast.arguments([], [], undefined, [], [], undefined, [])
    }else{
        args = this.args[0].ast()
    }
    var ast_obj = new ast.Lambda(args, this.tree[0].ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$LambdaCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':' && context.args === undefined){
        context.args = context.tree
        context.tree = []
        context.body_start = $pos
        return new $AbstractExprCtx(context, false)
    }
    if(context.args !== undefined){ // returning from expression
        context.body_end = $pos
        return $transition(context.parent, token)
    }
    if(context.args === undefined){
        if(token == '('){
            raise_syntax_error(context,
                'Lambda expression parameters cannot be parenthesized')
        }else{
            return $transition(new $FuncArgs(context), token, value)
        }
    }
    raise_syntax_error(context)
}

var ListCompCtx = function(context){
    // create a List Comprehension
    // context is a $ListOrTupleCtx
    this.type = 'listcomp'
    this.tree = [context.tree[0]]
    this.tree[0].parent = this
    this.position = $token.value
    Comprehension.make_comp(this, context)
}

ListCompCtx.prototype.ast = function(){
    // ast.ListComp(elt, generators)
    // elt is the part evaluated for each item
    // generators is a list of comprehensions
    var res = new ast.ListComp(
            this.tree[0].ast(),
            Comprehension.generators(this.tree.slice(1)))
    set_position(res, this.position)
    return res
}

ListCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ']'){
        return this.parent
    }
    raise_syntax_error(context)
}

var $ListOrTupleCtx = $B.parser.$ListOrTupleCtx = function(context, real){
    // Class for literal lists or tuples
    // The real type (list or tuple) is set inside $transition
    // as attribute 'real'
    this.type = 'list_or_tuple'
    this.start = $pos
    this.real = real
    this.expect = 'id'
    this.closed = false
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$ListOrTupleCtx.prototype.ast = function(){
    var elts = this.tree.map(x => x.ast()),
        ast_obj
    if(this.real == 'list'){
        ast_obj = new ast.List(elts, new ast.Load())
    }else if(this.real == 'tuple'){
        ast_obj = new ast.Tuple(elts, new ast.Load())
    }
    set_position(ast_obj, this.position, this.end_position)
    return ast_obj
}

$ListOrTupleCtx.prototype.transition = function(token, value){
    var context = this
    if(context.closed){
        if(token == '['){
            return new $AbstractExprCtx(
                new $SubCtx(context.parent),false)
        }
        if(token == '('){return new $CallCtx(context.parent)}
        return $transition(context.parent, token, value)
    }else{
        if(context.expect == ','){
            switch(context.real){
                case 'tuple':
                    if(token == ')'){
                        if(context.implicit){
                            return $transition(context.parent, token, value)
                        }
                        var close = true
                        context.end_position = $token.value
                        if(context.tree.length == 1){
                            if($parent_match(context, {type: 'del'}) &&
                                    context.tree[0].type == 'expr' &&
                                    context.tree[0].tree[0].type == 'starred'){
                                raise_syntax_error_known_range(context,
                                    context.tree[0].tree[0].position,
                                    last_position(context.tree[0]),
                                    'cannot use starred expression here')
                            }
                            // make single element replace tuple as child of
                            // context.parent.parent
                            var grandparent = context.parent.parent
                            // remove expr tuple
                            grandparent.tree.pop()
                            grandparent.tree.push(context.tree[0])
                            // note that the expression was inside ()
                            // used in annotation, to sort "(a): int" from
                            // "a: int"
                            context.tree[0].$was_parenthesized = true
                            context.tree[0].parent = grandparent
                            return context.tree[0]
                        }
                        if(context.packed ||
                                (context.type == 'list_or_tuple' &&
                                 context.tree.length == 1 &&
                                 context.tree[0].type == 'expr' &&
                                 context.tree[0].tree[0].type == 'starred')){
                            // syntax "(*x)"
                            raise_syntax_error(context,
                                "cannot use starred expression here")
                        }
                        if(close){
                            context.close()
                        }
                        if(context.parent.type == "starred"){
                            return context.parent.parent
                        }
                        return context.parent
                    }
                    break
                case 'list':
                    if(token == ']'){
                         context.close()
                         if(context.parent.type == "starred"){
                             if(context.parent.tree.length > 0){
                                 return context.parent.tree[0]
                             }else{
                                 return context.parent.parent
                             }
                         }
                         return context.parent
                    }
                    break
            }

            switch(token) {
                case ',':
                    if(context.real == 'tuple'){
                        context.has_comma = true
                    }
                    context.expect = 'id'
                    return context
                case 'for':
                    // comprehension
                    if(context.real == 'list'){
                        if(this.tree.length > 1){
                            // eg [x, y for x in A for y in B]
                            raise_syntax_error(context, "did you forget " +
                                "parentheses around the comprehension target?")
                        }
                        return new $TargetListCtx(new $ForExpr(
                            new ListCompCtx(context)))
                    }
                    else{
                        return new $TargetListCtx(new $ForExpr(
                            new GeneratorExpCtx(context)))
                    }
            }
            return $transition(context.parent,token,value)
        }else if(context.expect == 'id'){
            switch(context.real) {
                case 'tuple':
                    if(token == ')'){
                        context.close()
                        return context.parent
                    }
                    if(token == 'eol' &&
                            context.implicit === true){
                      context.close()
                      return $transition(context.parent, token)
                    }
                    break
                case 'list':
                    if(token == ']'){
                      context.close()
                      return context
                    }
                    break
            }

            switch(token) {
                case '=':
                    if(context.real == 'tuple' &&
                            context.implicit === true){
                        context.close()
                        context.parent.tree.pop()
                        var expr = new $ExprCtx(context.parent,
                            'tuple', false)
                        expr.tree = [context]
                        context.parent = expr
                        return $transition(context.parent, token)
                    }
                    raise_syntax_error(context, "(unexpected '=' inside list)")
                    break
                case ')':
                    break
                case ']':
                    if(context.real == 'tuple' &&
                            context.implicit === true){
                        // Syntax like d[1,] = 2
                        return $transition(context.parent, token,
                            value)
                    }else{
                        break
                    }
                    raise_syntax_error(context, '(unexpected "if" inside list)')
                case ',':
                    raise_syntax_error(context, '(unexpected comma inside list)')
                case 'str':
                case 'JoinedStr':
                case 'int':
                case 'float':
                case 'imaginary':
                case 'ellipsis':
                case 'lambda':
                case 'yield':
                case 'id':
                case '(':
                case '[':
                case '{':
                case 'await':
                case 'not':
                case ':':
                    context.expect = ','
                    var expr = new $AbstractExprCtx(context, false)
                    return $transition(expr, token, value)
                case 'op':
                    if('+-~*'.indexOf(value) > -1 || value == '**'){
                        context.expect = ','
                        var expr = new $AbstractExprCtx(context, false)
                        return $transition(expr, token, value)
                    }
                    raise_syntax_error(context,
                        `(unexpected operator: ${value})`)
                default:
                    raise_syntax_error(context)
            }

        }else{
            return $transition(context.parent, token, value)
        }
    }
}

$ListOrTupleCtx.prototype.close = function(){
    this.closed = true
    this.end_position = $token.value
    this.src = $get_module(this).src
    for(var i = 0, len = this.tree.length; i < len; i++){
        // Replace parenthesized expressions inside list or tuple
        // by the expression itself, eg (x, (y)) by (x, y).
        // Cf. issue 1333
        var elt = this.tree[i]
        if(elt.type == "expr" &&
                elt.tree[0].type == "list_or_tuple" &&
                elt.tree[0].real == "tuple" &&
                elt.tree[0].tree.length == 1 &&
                elt.tree[0].expect == ","){
            this.tree[i] = elt.tree[0].tree[0]
            this.tree[i].parent = this
        }
    }
}

var $MatchCtx = $B.parser.$MatchCtx = function(node_ctx){
    // node already has an expression with the id "match"
    this.type = "match"
    this.position = $token.value
    node_ctx.tree = [this]
    node_ctx.node.is_match = true
    this.parent = node_ctx
    this.tree = []
    this.expect = 'as'
    this.token_position = $get_module(this).token_reader.position
}

$MatchCtx.prototype.ast = function(){
    // ast.Match(subject, cases)
    // subject holds the subject of the match
    // cases contains an iterable of match_case nodes with the different cases
    var res = new ast.Match(this.tree[0].ast(), ast_body(this.parent))
    set_position(res, this.position)
    res.$line_num = $get_node(this).line_num
    return res
}

$MatchCtx.prototype.transition = function(token, value){
    var context = this
    switch(token){
        case ':':
            if(this.tree[0].type == 'list_or_tuple'){
                remove_abstract_expr(this.tree[0].tree)
            }
            switch(context.expect) {
                case 'id':
                case 'as':
                case ':':
                    return $BodyCtx(context)
            }
            break
        case 'eol':
            raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

var NamedExprCtx = function(context){
    // context is an expression where context.tree[0] is an id
    this.type = 'named_expr'
    this.position = context.position
    this.target = context.tree[0]
    context.tree.pop()
    context.tree.push(this)
    this.parent = context
    this.target.parent = this
    this.tree = []
    this.$pos = $pos
    if(context.parent.type == 'list_or_tuple' &&
            context.parent.real == 'tuple'){
        // used to check assignments
        this.parenthesized = true
    }
}

NamedExprCtx.prototype.ast = function(){
    var res = new ast.NamedExpr(this.target.ast(),
                                this.tree[0].ast())
    res.target.ctx = new ast.Store()
    set_position(res, this.position)
    return res
}

NamedExprCtx.prototype.transition = function(token, value){
    return $transition(this.parent, token, value)
}

var $NodeCtx = $B.parser.$NodeCtx = function(node){
    // Base class for the context in a node
    this.node = node
    node.context = this
    this.tree = []
    this.type = 'node'

    var scope = null
    var tree_node = node
    while(tree_node.parent && tree_node.parent.type != 'module'){
        var ntype = tree_node.parent.context.tree[0].type,
            _break_flag = false
        switch(ntype){
            case 'def':
            case 'class':
            case 'generator':
                scope = tree_node.parent
                _break_flag = true
        }
        if(_break_flag){break}

        tree_node = tree_node.parent
    }
    if(scope === null){
        scope = tree_node.parent || tree_node // module
    }

    this.scope = scope
}

$NodeCtx.prototype.transition = function(token, value){
    var context = this
    if(this.node.parent && this.node.parent.context){
        var pctx = this.node.parent.context
        if(pctx.tree && pctx.tree.length == 1 &&
                pctx.tree[0].type == "match"){
            if(token != 'eol' && (token !== 'id' || value !== 'case')){
                context.$pos = $pos
                raise_syntax_error(context) // 'line does not start with "case"'
            }
        }
    }
    if(this.tree.length == 0 && this.node.parent){
        var rank = this.node.parent.children.indexOf(this.node)
        if(rank > 0){
            var previous = this.node.parent.children[rank - 1]
            if(previous.context.tree[0].type == 'try' &&
                    ['except', 'finally'].indexOf(token) == -1){
                raise_syntax_error(context,
                    "expected 'except' or 'finally' block")
            }
        }
    }
    switch(token) {
        case ',':
            if(context.tree && context.tree.length == 0){
                raise_syntax_error(context)
            }
            // Implicit tuple
            var first = context.tree[0]
            context.tree = []
            var implicit_tuple = new $ListOrTupleCtx(context)
            implicit_tuple.real = "tuple"
            implicit_tuple.implicit = 0
            implicit_tuple.tree.push(first)
            first.parent = implicit_tuple
            return implicit_tuple
        case '[':
        case '(':
        case '{':
        case '.':
        case 'bytes':
        case 'float':
        case 'id':
        case 'imaginary':
        case 'int':
        case 'str':
        case 'JoinedStr':
        case 'not':
        case 'lambda':
            var expr = new $AbstractExprCtx(context,true)
            return $transition(expr,token,value)
        case 'assert':
            return new $AbstractExprCtx(
                new $AssertCtx(context), false, true)
        case 'async':
            return new $AsyncCtx(context)
        case 'await':
            return new $AbstractExprCtx(new $AwaitCtx(context), false)
        case 'break':
            return new $BreakCtx(context)
        case 'class':
            return new $ClassCtx(context)
        case 'continue':
            return new $ContinueCtx(context)
        case 'def':
            return new $DefCtx(context)
        case 'del':
            return new $AbstractExprCtx(new $DelCtx(context),true)
        case 'elif':
            try{
                var previous = $previous(context)
            }catch(err){
                raise_syntax_error(context, "('elif' does not follow 'if')")
            }
            if(['condition'].indexOf(previous.type) == -1 ||
                    previous.token == 'while'){
                raise_syntax_error(context, `(elif after ${previous.type})`)
            }
            return new $AbstractExprCtx(
                new $ConditionCtx(context, token), false)
        case 'ellipsis':
            var expr = new $AbstractExprCtx(context, true)
            return $transition(expr, token, value)
        case 'else':
            var previous = $previous(context)
            if(['condition', 'except', 'for'].
                    indexOf(previous.type) == -1){
                raise_syntax_error(context, `(else after ${previous.type})`)
            }
            return new $SingleKwCtx(context,token)
        case 'except':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type) == -1){
                raise_syntax_error(context, `(except after ${previous.type})`)
            }
            return new $ExceptCtx(context)
        case 'finally':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type) == -1 &&
                    (previous.type != 'single_kw' ||
                        previous.token != 'else')){
                raise_syntax_error(context, `finally after ${previous.type})`)
            }
            return new $SingleKwCtx(context,token)
        case 'for':
            return new $TargetListCtx(new $ForExpr(context))
        case 'from':
            return new $FromCtx(context)
        case 'global':
            return new $GlobalCtx(context)
        case 'if':
        case 'while':
            return new $AbstractExprCtx(
                new $ConditionCtx(context, token), false)
        case 'import':
            return new $ImportCtx(context)
        case 'lambda':
            return new $LambdaCtx(context)
        case 'nonlocal':
            return new $NonlocalCtx(context)
        case 'op':
            switch(value) {
                case '*':
                    var expr = new $AbstractExprCtx(context, true)
                    return $transition(expr, token, value)
                case '+':
                case '-':
                case '~':
                    context.position = $token.value
                    var expr = new $ExprCtx(context, 'unary', true)
                    return new $AbstractExprCtx(
                        new $UnaryCtx(expr, value), false)
                case '@':
                    return new $AbstractExprCtx(new $DecoratorCtx(context), false)
            }
            break
        case 'pass':
            return new $PassCtx(context)
        case 'raise':
            return new $AbstractExprCtx(new $RaiseCtx(context), false)
        case 'return':
            return new $AbstractExprCtx(new $ReturnCtx(context),true)
        case 'try':
            return new $TryCtx(context)
        case 'with':
            return new $WithCtx(context)
        case 'yield':
            return new $AbstractExprCtx(new $YieldCtx(context),true)
        case 'eol':
            if(context.tree.length == 0){ // might be the case after a :
                context.node.parent.children.pop()
                return context.node.parent.context
            }
            return context
    }
    raise_syntax_error(context)
}

var $NonlocalCtx = $B.parser.$NonlocalCtx = function(context){
    // Class for keyword "nonlocal"
    this.type = 'nonlocal'
    this.parent = context
    this.tree = []
    this.position = $token.value
    this.names = {}
    context.tree[context.tree.length] = this
    this.expect = 'id'

    this.scope = $get_scope(this)
    this.scope.nonlocals = this.scope.nonlocals || new Set()

}

$NonlocalCtx.prototype.ast = function(){
    // Nonlocal(identifier* names)
    var ast_obj = new ast.Nonlocal(this.tree.map(item => item.value))
    set_position(ast_obj, this.position)
    return ast_obj
}

$NonlocalCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
               new $IdCtx(context, value)
               this.names[value] = [false, $pos]
               context.expect = ','
               return context
            }
            break
        case ',':
            if(context.expect == ','){
               context.expect = 'id'
               return context
            }
            break
        case 'eol':
            if(context.expect == ','){
               return $transition(context.parent, token)
            }
            break
    }
    raise_syntax_error(context)
}

var $NotCtx = $B.parser.$NotCtx = function(context){
    // Class for keyword "not"
    this.type = 'not'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$NotCtx.prototype.ast = function(){
    var ast_obj = new ast.UnaryOp(new ast.Not(), this.tree[0].ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$NotCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'in':
            // not is always in an expression : remove it
            context.parent.parent.tree.pop() // remove 'not'
            return new $ExprCtx(new $OpCtx(context.parent, 'not_in'),
                'op', false)
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
            var expr = new $AbstractExprCtx(context, false)
            return $transition(expr, token, value)
        case 'op':
          var a = value
          if('+' == a || '-' == a || '~' == a){
            var expr = new $AbstractExprCtx(context, false)
            return $transition(expr, token, value)
          }
    }
    return $transition(context.parent, token)
}

var $NumberCtx = $B.parser.$NumberCtx = function(type, context, value){
    // Class for literal integers, floats and imaginary numbers
    // For integers, value is a 2-elt tuple [base, value_as_string] where
    // base is one of 16 (hex literal), 8 (octal), 2 (binary) or 10 (int)

    this.type = type
    this.value = value
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$NumberCtx.prototype.ast = function(){
    var ast_obj = new ast.Constant({type: this.type, value: this.value})
    if(this.type == 'int'){
        var value = parseInt(this.value[1], this.value[0])
        if(! Number.isSafeInteger(value)){
            value = _b_.int.$factory(this.value[1], this.value[0])
        }
        ast_obj.value = value
    }else if(this.type == 'float'){
        ast_obj.value = new Number(this.value)
    }else if(this.type == 'imaginary'){
        var imag = {
            type: this.value.type,
            value: this.value.value,
            position: this.position
        }
        var imag_value = $NumberCtx.prototype.ast.bind(imag)().value
        ast_obj.value = $B.make_complex(0, +imag_value)
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$NumberCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'id' && value == '_'){
        raise_syntax_error(context, 'invalid decimal literal')
    }
    return $transition(context.parent, token, value)
}

var $OpCtx = $B.parser.$OpCtx = function(context, op){
    // Class for operators ; context is the left operand
    this.type = 'op'
    this.op = op
    this.parent = context.parent
    this.position = $token.value
    this.tree = [context]
    this.scope = $get_scope(this)

    // Get type of left operand
    if(context.type == "expr"){
        if(['int', 'float', 'str'].indexOf(context.tree[0].type) > -1){
            this.left_type = context.tree[0].type
        }
    }

    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)
}

$OpCtx.prototype.ast = function(){
    //console.log('op ast', this)
    var ast_type_class = op2ast_class[this.op],
        op_type = ast_type_class[0],
        ast_class = ast_type_class[1],
        ast_obj

    if(op_type === ast.Compare){
        var left = this.tree[0].ast(),
            ops = [new ast_class()]
        if(this.ops){
            for(var op of this.ops.slice(1)){
                ops.push(new op2ast_class[op][1]())
            }
            ast_obj = new ast.Compare(left, ops,
                this.tree.slice(1).map(x => x.ast()))
        }else{
            ast_obj = new ast.Compare(left, ops,
                [this.tree[1].ast()])
        }
    }else if(op_type === ast.UnaryOp){
        ast_obj = new op_type(new ast_class(), this.tree[1].ast())
    }else if(op_type === ast.BoolOp){
        // Consecutive operations with the same operator, such as a or b or c,
        // are collapsed into one node with several values
        var values = [this.tree[1]],
            main_op = this.op,
            ctx = this
        while(ctx.tree[0].type == 'op' && ctx.tree[0].op == main_op){
            values.splice(0, 0, ctx.tree[0].tree[1])
            ctx = ctx.tree[0]
        }
        values.splice(0, 0, ctx.tree[0])
        ast_obj = new op_type(new ast_class(), values.map(x => x.ast()))
    }else{
        ast_obj = new op_type(
            this.tree[0].ast(), new ast_class(), this.tree[1].ast())
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

function is_literal(expr){
    return expr.type == 'expr' &&
        ['int', 'str', 'float', 'imaginary'].indexOf(expr.tree[0].type) > -1
}

$OpCtx.prototype.transition = function(token, value){
    var context = this
    if(context.op === undefined){
        console.log('context has no op', context)
        raise_syntax_error(context)
    }
    if((context.op == 'is' || context.op == 'is_not')
            && context.tree.length > 1){
        for(var operand of context.tree){
            if(is_literal(operand)){
                var head = context.op == 'is' ? 'is' : 'is not'
                $B.warn(_b_.SyntaxWarning,
                        `"${head}" with a literal. Did you mean "=="?"`,
                        $get_module(context).filename,
                        $token.value)
                break
            }
        }
    }

    switch(token) {
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
        case 'op':
            switch(value){
                case '+':
                case '-':
                case '~':
                    return new $UnaryCtx(context, value)
            }
        default:
            if(context.tree[context.tree.length - 1].type ==
                    'abstract_expr'){
                raise_syntax_error(context)
            }
    }
    return $transition(context.parent, token)
}

var $PassCtx = $B.parser.$PassCtx = function(context){
    // Class for keyword "pass"
    this.type = 'pass'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$PassCtx.prototype.ast = function(){
    var ast_obj = new ast.Pass()
    set_position(ast_obj, this.position)
    return ast_obj
}

$PassCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        return context.parent
    }
    raise_syntax_error(context)
}

var $PatternCtx = $B.parser.$PatternCtx = function(context){
    // Class for patterns in a "case" statement
    this.type = "pattern"
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
}

$PatternCtx.prototype.transition = function(token, value){
    var context = this
    switch(context.expect){
        case 'id':
            switch(token){
                case 'str':
                case 'int':
                case 'float':
                case 'imaginary':
                    context.expect = ','
                    return new $PatternLiteralCtx(context, token, value)
                case 'op':
                    switch(value){
                        case '-':
                        case '+':
                            context.expect = ','
                            return new $PatternLiteralCtx(context,
                                {sign: value})
                        case '*':
                            context.expect = 'starred_id'
                            return context
                        default:
                            raise_syntax_error(context)
                    }
                case 'id':
                    context.expect = ','
                    if(['None', 'True', 'False'].indexOf(value) > -1){
                        return new $PatternLiteralCtx(context, token, value)
                    }else{
                        return new $PatternCaptureCtx(context, value)
                    }
                    break
                case '[':
                    return new $PatternCtx(
                        new $PatternSequenceCtx(context.parent, token))
                case '(':
                    return new $PatternCtx(
                        new $PatternGroupCtx(context.parent, token))
                case '{':
                    return new $PatternMappingCtx(context.parent, token)
                case 'JoinedStr':
                    raise_syntax_error(context, "patterns may only match " +
                        "literals and attribute lookups")
            }
            break
        case 'starred_id':
            if(token == 'id'){
                var capture = new $PatternCaptureCtx(context, value)
                capture.starred = true
                return capture
            }
            raise_syntax_error(context, "(expected id after '*')")
        case 'number':
            // if pattern starts with unary - or +
            switch(token){
                case 'int':
                case 'float':
                case 'imaginary':
                    context.expect = ','
                    return new $PatternLiteralCtx(context, token,
                        value, context.sign)
                default:
                    raise_syntax_error(context)
            }
        case ',':
            switch(token){
                case ',':
                    if(context.parent instanceof $PatternSequenceCtx){
                        return new $PatternCtx(context.parent)
                    }
                    return new $PatternCtx(
                        new $PatternSequenceCtx(context.parent))
                case ':':
                    return $BodyCtx(context)
            }
    }
    return context.parent.transition(token, value)
}

function as_pattern(context, token, value){
    // common to all patterns
    if(context.expect == 'as'){
        if(token == 'as'){
            context.expect = 'alias'
            return context
        }else{
            return $transition(context.parent, token, value)
        }
    }else if(context.expect == 'alias'){
        if(token == 'id'){
            if(value == '_'){
                raise_syntax_error(context, "cannot use '_' as a target")
            }
            if(context.bindings().indexOf(value) > -1){
                raise_syntax_error(context,
                    `multiple assignments to name '${value}' in pattern`)
            }
            context.alias = value
            return context.parent
        }else{
            raise_syntax_error(context, 'invalid pattern target')
        }
    }
}


var $PatternCaptureCtx = function(context, value){
    // Class for capture patterns in a "case" statement
    // context is a $PatternCtx
    this.type = "capture_pattern"
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.tree = [value]
    this.position = $token.value
    this.positions = [this.position]
    this.expect = '.'
    this.$pos = $pos
}

$PatternCaptureCtx.prototype.ast = function(){
    var ast_obj
    try{
        if(this.tree.length > 1){
            var pattern = new ast.Name(this.tree[0], new ast.Load())
            set_position(pattern, this.position)
            for(var i = 1; i < this.tree.length; i++){
                pattern = new ast.Attribute(pattern, this.tree[i], new ast.Load())
                copy_position(pattern, pattern.value)
            }
            pattern = new ast.MatchValue(pattern)
            copy_position(pattern, pattern.value)
        }else if(this.starred){
            var v = this.tree[0]
            if(v == '_'){
                ast_obj = new ast.MatchStar()
            }else{
                ast_obj = new ast.MatchStar(v)
            }
            set_position(ast_obj, this.position)
        }else{
            var pattern = this.tree[0]
            if(typeof pattern == 'string'){
                // pattern is the string
            }else if(pattern.type == 'group_pattern'){
                pattern = pattern.ast()
            }else{
                console.log('bizarre', pattern)
                pattern = $NumberCtx.prototype.ast.bind(this)()
            }
            if(pattern == '_'){
                pattern = new ast.MatchAs()
                set_position(pattern, this.position)
            }
        }
        if(this.alias){
            if(typeof pattern == "string"){
                pattern = new ast.MatchAs(undefined, pattern)
                set_position(pattern, this.position)
            }
            ast_obj = new ast.MatchAs(pattern, this.alias)
        }else if(this.tree.length > 1 || pattern instanceof ast.MatchAs){
            ast_obj = pattern
        }else if(typeof pattern == 'string'){
            ast_obj = new ast.MatchAs(undefined, pattern)
        }else if(! this.starred){
            ast_obj = new ast.MatchAs(undefined, pattern)
        }
        set_position(ast_obj, this.position)
        return ast_obj
    }catch(err){
        console.log('error capture ast')
        show_line(this)
        throw err
    }
}

$PatternCaptureCtx.prototype.bindings = function(){
    var bindings = this.tree[0] == '_' ? [] : this.tree.slice()
    if(this.alias){
        bindings.push(this.alias)
    }
    return bindings
}

$PatternCaptureCtx.prototype.transition = function(token, value){
    var context = this
    switch(context.expect){
        case '.':
            if(token == '.'){
                context.type = "value_pattern"
                context.expect = 'id'
                return context
            }else if(token == '('){
                // open class pattern
                return new $PatternCtx(new $PatternClassCtx(context))
            }else if(context.parent instanceof $PatternMappingCtx){
                return context.parent.transition(token, value)
            }else{
                context.expect = 'as'
                return context.transition(token, value)
            }
        case 'as':
        case 'alias':
            var res = as_pattern(context, token, value)
            return res
        case 'id':
            if(token == 'id'){
                context.tree.push(value)
                context.positions.push($token.value)
                context.expect = '.'
                return context
            }

    }
    return $transition(context.parent, token, value)
}

$PatternClassCtx = function(context){
    this.type = "class_pattern"
    this.tree = []
    this.parent = context.parent
    this.position = $token.value
    // create an id for class name
    this.class_id = context.tree.slice()
    this.positions = context.positions
    // remove this instance of $dCtx from tree
    context.tree.pop()
    // get possible attributes of id
    this.attrs = context.tree.slice(2)
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.expect = ','
    this.keywords = []
    this.positionals = []
    this.bound_names = []
}

$PatternClassCtx.prototype.ast = function(){
    // ast.MatchClass(cls, patterns, kwd_attrs, kwd_patterns)
    // `cls` is an expression giving the nominal class to be matched
    // `patterns` is a sequence of pattern nodes to be matched against the
    //   class defined sequence of pattern matching attributes
    // `kwd_attrs` is a sequence of additional attributes to be matched
    // `kwd_patterns` are the corresponding patterns
    if(this.class_id.length == 1){
        var cls = new ast.Name(this.class_id[0])
    }else{
        // attribute, eg "case ast.Expr(expr)": class_id is
        // ['ast', '.', 'Expr']
        var cls
        for(var i = 0, len = this.class_id.length; i < len - 1; i++){
            var value = new ast.Name(this.class_id[i], new ast.Load())
            set_position(value, this.positions[i])
            if(i == 0){
                cls = new ast.Attribute(value, this.class_id[i + 1])
            }else{
                cls = new ast.Attribute(cls, this.class_id[i + 1])
            }
            set_position(cls, this.positions[i])
        }
    }
    set_position(cls, this.position)
    cls.ctx = new ast.Load()
    var patterns = [],
        kwd_attrs = [],
        kwd_patterns = []
    for(var item of this.tree){
        if(item.is_keyword){
            kwd_attrs.push(item.tree[0])
            kwd_patterns.push(item.tree[1].ast())
        }else{
            try{
                patterns.push(item.ast())
            }catch(err){
                console.log('error in class pattern item')
                show_line(this)
                throw err
              }
        }
    }
    var ast_obj = new ast.MatchClass(cls, patterns, kwd_attrs, kwd_patterns)
    set_position(ast_obj, this.position)
    if(this.alias){
        ast_obj = new ast.MatchAs(ast_obj, this.alias)
        set_position(ast_obj, this.position)
    }
    return ast_obj
}

$PatternClassCtx.prototype.bindings = function(){
    var bindings = this.bound_names
    if(this.alias){
        bindings.push(this.alias)
    }
    return bindings
}

$PatternClassCtx.prototype.transition = function(token, value){
    var context = this

    function check_last_arg(){
        var last = $B.last(context.tree),
            bound
        if(last instanceof $PatternCaptureCtx){
            if(! last.is_keyword &&
                    context.keywords.length > 0){
                $token.value = last.position
                raise_syntax_error(context,
                        'positional patterns follow keyword patterns')
            }
            if(last.is_keyword){
                if(context.keywords.indexOf(last.tree[0]) > -1){
                    raise_syntax_error(context,
                        `keyword argument repeated: ${last.tree[0]}`)
                }
                context.keywords.push(last.tree[0])
                bound = last.tree[1].bindings()
            }else{
                bound = last.bindings()
            }
            for(var b of bound){
                if(context.bound_names.indexOf(b) > -1){
                    raise_syntax_error(context, 'multiple assignments ' +
                        `to name '${b}' in pattern`)
                }
            }
            context.bound_names = context.bound_names.concat(bound)
        }
    }

    switch(this.expect){
        case ',':
            switch(token){
                case '=':
                    // check that current argument is a capture
                    var current = $B.last(this.tree)
                    if(current instanceof $PatternCaptureCtx){
                        // check duplicate
                        if(this.keywords.indexOf(current.tree[0]) > -1){
                            raise_syntax_error(context,
                                'attribute name repeated in class pattern: ' +
                                 current.tree[0])
                        }
                        current.is_keyword = true
                        return new $PatternCtx(current)
                    }
                    raise_syntax_error(this, "'=' after non-capture")
                case ',':
                    check_last_arg()
                    return new $PatternCtx(this)
                case ')':
                    check_last_arg()
                    if($B.last(this.tree).tree.length == 0){
                        this.tree.pop()
                    }
                    context.expect = 'as'
                    return context
                default:
                    raise_syntax_error(context)
            }
        case 'as':
        case 'alias':
            return as_pattern(context, token, value)
    }
    return $transition(context.parent, token, value)

}

var $PatternGroupCtx = function(context){
    // Class for group patterns, delimited by (), in a "case" statement
    this.type = "group_pattern"
    this.parent = context
    this.position = $token.value
    this.tree = []
    var first_pattern = context.tree.pop()
    this.expect = ',|'
    context.tree.push(this)
}

function remove_empty_pattern(context){
    var last = $B.last(context.tree)
    if(last && last instanceof $PatternCtx &&
            last.tree.length == 0){
        context.tree.pop()
    }
}

$PatternGroupCtx.prototype.ast = function(){
    var ast_obj
    if(this.tree.length == 1 && ! this.has_comma){
        ast_obj = this.tree[0].ast()
    }else{
        ast_obj = $PatternSequenceCtx.prototype.ast.bind(this)()
    }
    if(this.alias){
        ast_obj = new ast.MatchAs(ast_obj, this.alias)
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$PatternGroupCtx.prototype.bindings = function(){
    var bindings = []
    for(var item of this.tree){
        bindings = bindings.concat(item.bindings())
    }
    if(this.alias){
        bindings.push(this.alias)
    }
    return bindings
}

$PatternGroupCtx.prototype.transition = function(token, value){
    var context = this
    switch(context.expect){
        case ',|':
            if(token == ")"){
                // close group
                remove_empty_pattern(context)
                context.expect = 'as'
                return context
            }else if(token == ','){
                context.expect = 'id'
                context.has_comma = true
                return context
            }else if(token == 'op' && value == '|'){
                var opctx = new $PatternOrCtx(context.parent)
                opctx.parenthese = true
                return new $PatternCtx(opctx)
            }else if(this.token === undefined){
                return $transition(context.parent, token, value)
            }
            raise_syntax_error(context)
        case 'as':
        case 'alias':
            return as_pattern(context, token, value)
        case 'id':
            if(token == ')'){
                // case (x,)
                remove_empty_pattern(context)
                context.expect ='as'
                return context
            }
            context.expect = ',|'
            return $transition(new $PatternCtx(context), token, value)
    }
    raise_syntax_error(context)
}

var $PatternLiteralCtx = function(context, token, value, sign){
    // Class for literal patterns in a "case" statement
    // context is a $PatternCtx
    this.type = "literal_pattern"
    this.parent = context.parent
    this.position = $token.value
    context.parent.tree.pop()
    context.parent.tree.push(this)
    if(token.sign){
        this.tree = [{sign: token.sign}]
        this.expect = 'number'
    }else{
        if(token == 'str'){
            this.tree = []
            new $StringCtx(this, value)
        }else if(token == 'JoinedStr'){
            raise_syntax_error(this, "patterns cannot include f-strings")
        }else{
            this.tree = [{type: token, value, sign}]
        }
        this.expect = 'op'
    }
}

$PatternLiteralCtx.prototype.ast = function(){
    var lineno = $get_node(this).line_num
    try{
        var first = this.tree[0],
            result
        if(first.type == 'str'){
            var v = $StringCtx.prototype.ast.bind(first)()
            result = new ast.MatchValue(v)
        }else if(first.type == 'id'){
            result = new ast.MatchSingleton(_b_[first.value])
        }else{
            first.position = this.position
            var num = $NumberCtx.prototype.ast.bind(first)(),
                res = new ast.MatchValue(num)
            if(first.sign && first.sign != '+'){
                var op = {'+': ast.UAdd, '-': ast.USub, '~': ast.Invert}[first.sign]
                var unary_op = new ast.UnaryOp(new op(), res.value)
                set_position(unary_op, this.position)
                res = new ast.MatchValue(unary_op)
                set_position(res, this.position)
            }
            if(this.tree.length == 1){
                result = res
            }else{
                this.tree[2].position = this.position
                var num2 = $NumberCtx.prototype.ast.bind(this.tree[2])(),
                    binop = new ast.BinOp(res.value,
                        this.tree[1] == '+' ? new ast.Add() : new ast.Sub(),
                        num2)
                set_position(binop, this.position)
                result = new ast.MatchValue(binop)
            }
        }
        set_position(result, this.position)
        if(this.tree.length == 2){
            // value = complex number
            result = new ast.MatchValue(new ast.BinOp(
                this.tree[0].ast(),
                context.num_sign == '+' ? ast.Add : ast.Sub,
                this.tree[1].ast()))
        }
        if(this.alias){
            result = new ast.MatchAs(result, this.alias)
        }
        set_position(result, this.position)
        return result
    }catch(err){
      show_line(this)
      throw err
    }
}

$PatternLiteralCtx.prototype.bindings = function(){
    if(this.alias){
        return [this.alias]
    }
    return []
}

$PatternLiteralCtx.prototype.transition = function(token, value){
    var context = this
    switch(context.expect){
        case 'op':
            if(token == "op"){
                switch(value){
                    case '+':
                    case '-':
                        if(['int', 'float'].indexOf(context.tree[0].type) > -1){
                            context.expect = 'imaginary'
                            this.tree.push(value)
                            context.num_sign = value
                            return context
                        }
                        raise_syntax_error(context,
                            'patterns cannot include operators')
                    default:
                        return $transition(context.parent, token, value)
                }
            }
            break
        case 'number':
            switch(token){
                case 'int':
                case 'float':
                case 'imaginary':
                    var last = $B.last(context.tree)
                    if(this.tree.token === undefined){
                        // if pattern starts with unary - or +
                        last.type = token
                        last.value = value
                        context.expect = 'op'
                        return context
                    }
                default:
                    raise_syntax_error(context)
            }

        case 'imaginary':
            switch(token){
                case 'imaginary':
                    context.tree.push({type: token, value, sign: context.num_sign})
                    return context.parent
                default:
                    raise_syntax_error(context, '(expected imaginary)')

            }
        case 'as':
        case 'alias':
            return as_pattern(context, token, value)
    }
    if(token == 'as' && context.tree.length == 1){
        context.expect = 'as'
        return context.transition(token, value)
    }
    return $transition(context.parent, token, value)
}

var $PatternMappingCtx = function(context){
    // Class for sequence patterns in a "case" statement
    this.type = "mapping_pattern"
    this.parent = context
    this.position = $token.value
    context.tree.pop()
    this.tree = []
    context.tree.push(this)
    this.expect = 'key_value_pattern'
    // store literal key values to detect duplicates
    this.literal_keys = []
    this.bound_names = []
}

$PatternMappingCtx.prototype.ast = function(){
    // ast.MatchMapping(keys, patterns, rest)
    // `keys` : sequence of expression nodes
    // `patterns` : corresponding sequence of pattern nodes
    // `rest` : optional name to capture the remaining mapping elements
    var keys = [],
        patterns = []
    for(var item of this.tree){
        keys.push(item.tree[0].ast().value)
        if(item.tree[0] instanceof $PatternLiteralCtx){
            patterns.push(item.tree[1].ast())
        }else{
            patterns.push(item.tree[2].ast())
        }
    }
    var res = new ast.MatchMapping(keys, patterns)
    if(this.double_star){
        res.rest = this.double_star.tree[0]
    }
    set_position(res, this.position)
    return res
}

$PatternMappingCtx.prototype.bindings = function(){
    var bindings = []
    for(var item of this.tree){
        bindings = bindings.concat(item.bindings())
    }
    if(this.rest){
        bindings = bindings.concat(this.rest.bindings())
    }
    if(this.alias){
        bindings.push(this.alias)
    }
    return bindings
}

$PatternMappingCtx.prototype.transition = function(token, value){
    var context = this
    function check_duplicate_names(){
        var last = $B.last(context.tree),
            bindings
        if(last instanceof $PatternKeyValueCtx){
            if(context.double_star){
                // key-value after double star is not allowed
                context.$pos = context.double_star.$pos
                raise_syntax_error(context,
                    "can't use starred name here (consider moving to end)")
            }
            if(last.tree[0].type == 'value_pattern'){
                bindings = last.tree[2].bindings()
            }else{
                bindings = last.tree[1].bindings()
            }
            for(var binding of bindings){
                if(context.bound_names.indexOf(binding) > -1){
                    raise_syntax_error(context,
                        `multiple assignments to name '${binding}'` +
                         ' in pattern')
                }
            }
            context.bound_names = context.bound_names.concat(bindings)
        }
    }
    switch(context.expect){
        case 'key_value_pattern':
            if(token == '}' || token == ','){
                // If there are only literal values, raise SyntaxError if
                // there are duplicate keys
                check_duplicate_names()
                if(context.double_star){
                    var ix = context.tree.indexOf(context.double_star)
                    if(ix != context.tree.length - 1){
                        context.$pos = context.double_star.$pos
                        raise_syntax_error(context,
                            "can't use starred name here (consider moving to end)")
                    }
                    context.rest = context.tree.pop()
                }
                return token == ',' ? context : context.parent
            }
            if(token == 'op' && value == '**'){
                context.expect = 'capture_pattern'
                return context
            }
            var p = new $PatternCtx(context)
            try{
                var lit_or_val = p.transition(token, value)
            }catch(err){
                raise_syntax_error(context, "mapping pattern keys may only " +
                    "match literals and attribute lookups")
            }
            if(context.double_star){
                // eg "case {**rest, x: y}"
                raise_syntax_error(context)
            }
            if(lit_or_val instanceof $PatternLiteralCtx){
                context.tree.pop() // remove PatternCtx
                new $PatternKeyValueCtx(context, lit_or_val)
                return lit_or_val
            }else if(lit_or_val instanceof $PatternCaptureCtx){
                context.has_value_pattern_keys = true
                // expect a dotted name (value pattern)
                context.tree.pop()
                new $PatternKeyValueCtx(context, lit_or_val)
                context.expect = '.'
                return this
            }else{
                raise_syntax_error(context, '(expected key or **)')
            }
        case 'capture_pattern':
            var p = new $PatternCtx(context)
            var capture = $transition(p, token, value)
            if(capture instanceof $PatternCaptureCtx){
                if(context.double_star){
                    context.$pos = capture.$pos
                    raise_syntax_error(context,
                        "only one double star pattern is accepted")
                }
                if(value == '_'){
                    raise_syntax_error(context) // , "('**_' is not valid)")
                }
                if(context.bound_names.indexOf(value) > -1){
                    raise_syntax_error(context, 'duplicate binding: ' + value)
                }
                context.bound_names.push(value)
                capture.double_star = true
                context.double_star = capture
                context.expect = ','
                return context
            }else{
                raise_syntax_error(context, '(expected identifier)')
            }
        case ',':
            // after a **rest item
            if(token == ','){
                context.expect = 'key_value_pattern'
                return context
            }else if(token == '}'){
                context.expect = 'key_value_pattern'
                return context.transition(token, value)
            }
            raise_syntax_error(context)
        case '.':
            // value pattern
            if(context.tree.length > 0){
                var last = $B.last(context.tree)
                if(last instanceof $PatternKeyValueCtx){
                    // create an id with the first name in value pattern
                    new $IdCtx(last, last.tree[0].tree[0])
                    context.expect = 'key_value_pattern'
                    return $transition(last.tree[0], token, value)
                }
            }
            raise_syntax_error(context)
    }
    return $transition(context.parent, token, value)
}

var $PatternKeyValueCtx = function(context, literal_or_value){
    this.type = "pattern_key_value"
    this.parent = context
    this.tree = [literal_or_value]
    literal_or_value.parent = this
    this.expect = ':'
    context.tree.push(this)
}

$PatternKeyValueCtx.prototype.bindings = $PatternMappingCtx.prototype.bindings

$PatternKeyValueCtx.prototype.transition = function(token, value){
    var context = this
    switch(context.expect){
        case ':':
            switch(token){
                case ':':
                    // check duplicate literal keys
                    var key_obj = this.tree[0]
                    if(key_obj instanceof $PatternLiteralCtx){
                        var key = $B.AST.$convert(key_obj.tree[0])
                        // check if present in this.literal_keys
                        if(_b_.list.__contains__(this.parent.literal_keys, key)){
                            $pos--
                            raise_syntax_error(context, `mapping pattern checks ` +
                                `duplicate key (${_b_.repr(key)})`)
                        }
                        this.parent.literal_keys.push(key)
                    }
                    this.expect = ','
                    return new $PatternCtx(this)
                default:
                    raise_syntax_error(context, '(expected :)')
            }
        case ',':
            switch(token){
                case '}':
                    return $transition(context.parent, token, value)
                case ',':
                    context.parent.expect = 'key_value_pattern'
                    return $transition(context.parent, token, value)
                case 'op':
                    if(value == '|'){
                        // value is an alternative
                        return new $PatternCtx(new $PatternOrCtx(context))
                    }
            }
            raise_syntax_error(context, "(expected ',' or '}')")
    }
    return $transition(context.parent, token, value)
}

var $PatternOrCtx = function(context){
    // Class for "or patterns" in a "case" statement
    // context already has a pattern as its first child
    this.type = "or_pattern"
    this.parent = context
    this.position = $token.value
    var first_pattern = context.tree.pop()
    if(first_pattern instanceof $PatternGroupCtx &&
            first_pattern.expect != 'as'){
        // eg "case (a, ...)"
        first_pattern = first_pattern.tree[0]
    }
    this.tree = [first_pattern]
    first_pattern.parent = this
    this.expect = '|'
    context.tree.push(this)
    this.check_reachable()
}

$PatternOrCtx.prototype.ast = function(){
    // ast.MatchOr(patterns)
    var ast_obj = new ast.MatchOr(this.tree.map(x => x.ast()))
    set_position(ast_obj, this.position)
    if(this.alias){
        ast_obj = new ast.MatchAs(ast_obj, this.alias)
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$PatternOrCtx.prototype.bindings = function(){
    var names
    for(var subpattern of this.tree){
        if(subpattern.bindings === undefined){
            console.log('no binding', subpattern)
        }
        var subbindings = subpattern.bindings()
        if(names === undefined){
            names = subbindings
        }else{
            for(var item of names){
                if(subbindings.indexOf(item) == -1){
                    raise_syntax_error(this,
                        "alternative patterns bind different names")
                }
            }
            for(var item of subbindings){
                if(names.indexOf(item) == -1){
                    raise_syntax_error(this,
                        "alternative patterns bind different names")
                }
            }
        }
    }
    if(this.alias){
        return names.concat(this.alias)
    }
    return names
}

$PatternOrCtx.prototype.check_reachable = function(){
    // Called before accepting a new alternative. If the last one is a
    // capture or wildcard, raise SyntaxError
    var item = $B.last(this.tree)
    var capture
    if(item.type == 'capture_pattern'){
        capture = item.tree[0]
    }else if(item.type == 'group_pattern' && item.tree.length == 1 &&
        item.tree[0].type == 'capture_pattern'){
            capture = item.tree[0].tree[0]
    }else if(item instanceof $PatternOrCtx){
        item.check_reachable()
    }
    if(capture){
        var msg = capture == '_' ? 'wildcard' :
            `name capture '${capture}'`
        raise_syntax_error(this,
            `${msg} makes remaining patterns unreachable`)
    }
}

$PatternOrCtx.prototype.transition = function(token, value){
    function set_alias(){
        // If last item has an alias, it is the alias of the whole "or pattern"
        var last = $B.last(context.tree)
        if(last.alias){
            context.alias = last.alias
            delete last.alias
        }
    }

    var context = this

    if(['as', 'alias'].indexOf(context.expect) > -1){
        return as_pattern(context, token, value)
    }
    if(token == 'op' && value == "|"){
        // items cannot be aliased
        for(var item of context.tree){
            if(item.alias){
                raise_syntax_error(context, '(no as pattern inside or pattern)')
            }
        }
        context.check_reachable()
        return new $PatternCtx(context)
    }else if(token == ')' && context.parenthese){
        set_alias()
        context.bindings()
        delete context.parenthese
        context.expect = 'as'
        return context
    }
    set_alias()
    context.bindings()
    return $transition(context.parent, token, value)
}

var $PatternSequenceCtx = function(context, token){
    // Class for sequence patterns in a "case" statement
    this.type = "sequence_pattern"
    this.parent = context
    this.position = $token.value
    this.tree = []
    this.bound_names = []
    var first_pattern = context.tree.pop()
    if(token === undefined){
        // implicit sequence : form "case x, y:"
        // context.parent already has a pattern
        this.bound_names = first_pattern.bindings()
        this.tree = [first_pattern]
        if(first_pattern.starred){
            this.has_star = true
        }
        first_pattern.parent = this
    }else{
        // explicit sequence with token '[' or '('
        this.token = token
    }
    this.expect = ','
    context.tree.push(this)
}

$PatternSequenceCtx.prototype.ast = function(){
    var ast_obj = new ast.MatchSequence(this.tree.map(x => x.ast()))
    set_position(ast_obj, this.position)
    if(this.alias){
        ast_obj = new ast.MatchAs(ast_obj, this.alias)
        set_position(ast_obj, this.position)
    }
    return ast_obj
}

$PatternSequenceCtx.prototype.bindings = $PatternMappingCtx.prototype.bindings

$PatternSequenceCtx.prototype.transition = function(token, value){
    function check_duplicate_names(){
        var last = $B.last(context.tree)
        if(! (last instanceof $PatternCtx)){
            // check duplicate bindings
            var last_bindings = last.bindings()
            for(var b of last_bindings){
                if(context.bound_names.indexOf(b) > -1){
                    raise_syntax_error(context, "multiple assignments to" +
                        ` name '${b}' in pattern`)
                }
            }
            if(last.starred){
                if(context.has_star){
                    raise_syntax_error(context,
                        'multiple starred names in sequence pattern')
                }
                context.has_star = true
            }
            context.bound_names = context.bound_names.concat(last_bindings)
        }
    }

    var context = this
    if(context.expect == ','){
        if((context.token == '[' && token == ']') ||
                (context.token == '(' && token == ")")){
            // check if there are more than 1 starred subpattern
            var nb_starred = 0
            for(var item of context.tree){
                if(item instanceof $PatternCaptureCtx && item.starred){
                    nb_starred++
                    if(nb_starred > 1){
                        raise_syntax_error(context,
                            'multiple starred names in sequence pattern')
                    }
                }
            }
            context.expect = 'as'
            check_duplicate_names()
            remove_empty_pattern(context)
            return context
        }else if(token == ','){
            check_duplicate_names()
            context.expect = 'id'
            return context
        }else if(token == 'op' && value == '|'){
            // alternative on last element
            remove_empty_pattern(context)
            return new $PatternCtx(new $PatternOrCtx(context))
        }else if(this.token === undefined){
            // implicit tuple
            check_duplicate_names()
            return $transition(context.parent, token, value)
        }
        raise_syntax_error(context)
    }else if(context.expect == 'as'){
        if(token == 'as'){
            this.expect = 'alias'
            return context
        }
        return $transition(context.parent, token, value)
    }else if(context.expect == 'alias'){
        if(token =  'id'){
            context.alias = value
            return context.parent
        }
        raise_syntax_error(context, 'expected alias')
    }else if(context.expect == 'id'){
        context.expect = ','
        return $transition(new $PatternCtx(context), token, value)
    }
}

var $RaiseCtx = $B.parser.$RaiseCtx = function(context){
    // Class for keyword "raise"
    this.type = 'raise'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
    this.scope_type = $get_scope(this).ntype

}

$RaiseCtx.prototype.ast = function(){
    // ast.Raise(exc, cause)
    // cause is the optional part in "raise exc from cause"
    var ast_obj = new ast.Raise(...this.tree.map(x => x.ast()))
    set_position(ast_obj, this.position)
    return ast_obj
}

$RaiseCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.tree.length == 0){
               return new $IdCtx(new $ExprCtx(context, 'exc', false),
                   value)
            }
            break
        case 'from':
            if(context.tree.length > 0){
                return new $AbstractExprCtx(context, false)
            }
            break
        case 'eol':
            remove_abstract_expr(this.tree)
            return $transition(context.parent, token)
    }
    raise_syntax_error(context)
}

var $ReturnCtx = $B.parser.$ReturnCtx = function(context){
    // Class for keyword "return"
    this.type = 'return'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this

    // Check if inside a function
    this.scope = $get_scope(this)
    if(["def", "generator"].indexOf(this.scope.ntype) == -1){
        raise_syntax_error(context, "'return' outside function")
    }

    // Check if return is inside a "for" loop
    // In this case, the loop will not be included inside a function
    // for optimisation
    var node = this.node = $get_node(this)
    while(node.parent){
        if(node.parent.context){
            var elt = node.parent.context.tree[0]
            if(elt.type == 'for'){
                elt.has_return = true
                break
            }else if(elt.type == 'try'){
                elt.has_return = true
            }else if(elt.type == 'single_kw' && elt.token == 'finally'){
                elt.has_return = true
            }
        }
        node = node.parent
    }
}

$ReturnCtx.prototype.ast = function(){
    var res = new ast.Return()
    if(this.tree.length > 0){
        res.value = this.tree[0].ast()
    }
    set_position(res, this.position)
    return res
}

$ReturnCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol' && this.tree.length == 1 &&
             this.tree[0].type == 'abstract_expr'){
        // "return" must be transformed into "return None"
        this.tree.pop()
    }
    return $transition(new $AbstractExprCtx(context.parent, false),
        token, value)
}

var SetCompCtx = function(context){
    // create a Set Comprehension
    // context is a $DictOrSetCtx
    this.type = 'setcomp'
    this.tree = [context.tree[0]]
    this.tree[0].parent = this
    Comprehension.make_comp(this, context)
}

SetCompCtx.prototype.ast = function(){
    // ast.SetComp(elt, generators)
    // elt is the part evaluated for each item
    // generators is a list of comprehensions
    var ast_obj = new ast.SetComp(
        this.tree[0].ast(),
        Comprehension.generators(this.tree.slice(1))
    )
    set_position(ast_obj, this.position)
    return ast_obj
}

SetCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == '}'){
        return this.parent
    }
    raise_syntax_error(context)
}

var $SingleKwCtx = $B.parser.$SingleKwCtx = function(context,token){
    // Class for keywords "finally", "else"
    this.type = 'single_kw'
    this.token = token
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    // If token is "else" inside a "for" loop, set the flag "has_break"
    // on the loop, to force the creation of a boolean "$no_break"
    if(token == "else"){
        var node = context.node,
            rank = node.parent.children.indexOf(node),
            pctx = node.parent.children[rank - 1].context
        pctx.tree[0].orelse = this
        if(pctx.tree.length > 0){
            var elt = pctx.tree[0]
            if(elt.type == 'for' ||
                    elt.type == 'asyncfor' ||
                    (elt.type == 'condition' && elt.token == 'while')){
                elt.has_break = true
                elt.else_node = $get_node(this)
            }
        }
    }
}

$SingleKwCtx.prototype.ast = function(){
    return ast_body(this.parent)
}

$SingleKwCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){
        return $BodyCtx(context)
    }else if(token == 'eol'){
        raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

var $SliceCtx = $B.parser.$SliceCtx = function(context){
    // Class for slices inside a subscription : t[1:2]
    this.type = 'slice'
    this.parent = context
    this.position = $token.value
    this.tree = context.tree.length > 0 ? [context.tree.pop()] : []
    context.tree.push(this)
}

$SliceCtx.prototype.ast = function(){
    var slice = new ast.Slice()
    var attrs = ['lower', 'upper', 'step']
    for(var i = 0; i < this.tree.length; i++){
        var item = this.tree[i]
        if(item.type !== 'abstract_expr'){
            slice[attrs[i]] = item.ast()
        }
    }
    set_position(slice, this.position)
    return slice
}

$SliceCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ":"){
        return new $AbstractExprCtx(context, false)
    }
    return $transition(context.parent, token, value)
}

var $StarArgCtx = $B.parser.$StarArgCtx = function(context){
    // Class for star args in calls, eg f(*args)
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$StarArgCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.parent.type == "target_list"){
                context.tree.push(value)
                context.parent.expect = ','
                return context.parent
            }
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case 'not':
        case 'lambda':
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
        case ',':
        case ')':
            if(context.tree.length == 0){
                raise_syntax_error(context, "(unnamed star argument)")
            }
            return $transition(context.parent, token)
        case ':':
            if(context.parent.parent.type == 'lambda'){
              return $transition(context.parent.parent, token)
            }
    }
    raise_syntax_error(context)
}

var $StarredCtx = $B.parser.$StarredCtx = function(context){
    // used for packed tuples in expressions, eg
    //     a, *b, c = [1, 2, 3, 4]
    // and for targets in "for" loops
    //    for a, *b in t: pass
    this.type = 'starred'
    this.position = context.position
    if(context.parent.type == 'list_or_tuple' &&
            context.parent.parent.type == "node"){
        // SyntaxError for a, *b, *c = ...
        for(var i = 0; i < context.parent.tree.length; i++){
            var child = context.parent.tree[i]
            if(child.type == 'expr' && child.tree.length > 0
                    && child.tree[0].type == 'starred'){
                raise_syntax_error(context,
                    "two starred expressions in assignment")
            }
        }
    }
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$StarredCtx.prototype.ast = function(){
    var ast_obj = new ast.Starred(this.tree[0].ast(), new ast.Load())
    set_position(ast_obj, this.position)
    return ast_obj
}

$StarredCtx.prototype.transition = function(token, value){
    var context = this
    return $transition(context.parent, token, value)
}

var $StringCtx = $B.parser.$StringCtx = function(context, value){
    // Class for literal strings
    // value is the string with quotes, eg 'a', "b\"c" etc.
    this.type = 'str'
    this.parent = context
    this.position = this.end_position = $token.value

    function prepare(value){
        value = value.replace(/\n/g,'\\n\\\n')
        value = value.replace(/\r/g,'\\r\\\r')
        return value
    }

    this.is_bytes = value.charAt(0) == 'b'
    if(! this.is_bytes){
        this.value = value // prepare(value)
    }else{
        this.value = prepare(value.substr(1))
    }
    context.tree.push(this)
    this.tree = [this.value]
    this.raw = false
    this.$pos = $pos
}

$StringCtx.prototype.ast = function(){
    var value = this.value
    if(this.is_bytes){
        value = _b_.bytes.$new(_b_.bytes, eval(this.value), 'ISO-8859-1')
    }
    var ast_obj = new ast.Constant(value)
    set_position(ast_obj, this.position)
    return ast_obj
}

$StringCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case '[':
            return new $AbstractExprCtx(new $SubCtx(context.parent),
                false)
        case '(':
            // Strings are not callable. We replace the string by a
            // call to an object that will raise the correct exception
            context.parent.tree[0] = context
            return new $CallCtx(context.parent)
        case 'str':
            if((this.is_bytes && ! value.startsWith('b')) ||
                    (! this.is_bytes && value.startsWith('b'))){
                context.$pos = $pos
                raise_syntax_error(context,
                    "cannot mix bytes and nonbytes literals")
            }
            context.value += ' + ' + (this.is_bytes ? value.substr(1) : value)
            return context
        case 'JoinedStr':
            // replace by a new JoinedStr where the first value is this
            context.parent.tree.pop()
            var joined_str = new JoinedStrCtx(context.parent, value)
            if(typeof joined_str.tree[0].value == "string"){
                joined_str.tree[0].value = this.value + ' + ' + joined_str.tree[0].value
            }else{
                joined_str.tree.splice(0, 0, this)
            }
            return joined_str
    }
    return $transition(context.parent, token, value)
}

var $SubCtx = $B.parser.$SubCtx = function(context){
    // Class for subscription or slicing, eg x in t[x]
    this.type = 'sub'
    this.func = 'getitem' // set to 'setitem' if assignment
    this.value = context.tree[0]
    this.position = $token.value // this.value.position
    context.tree.pop()
    context.tree[context.tree.length] = this
    this.parent = context
    this.tree = []
}

$SubCtx.prototype.ast = function(){
    var slice
    if(this.tree.length > 1){
        var slice_items = this.tree.map(x => x.ast())
        slice = new ast.Tuple(slice_items)
        set_position(slice, this.position, this.end_position)
    }else{
        slice = this.tree[0].ast()
    }
    slice.ctx = new ast.Load()
    var value = this.value.ast()
    if(value.ctx){
        value.ctx = new ast.Load()
    }
    var ast_obj = new ast.Subscript(value, slice, new ast.Load())
    ast_obj.lineno = value.lineno
    ast_obj.col_offset = value.col_offset
    ast_obj.end_lineno = slice.end_lineno
    ast_obj.end_col_offset = slice.end_col_offset
    return ast_obj
}

$SubCtx.prototype.transition = function(token, value){
    var context = this
    // subscription x[a] or slicing x[a:b:c]
    switch(token) {
        case 'id':
        case 'imaginary':
        case 'int':
        case 'float':
        case 'str':
        case 'JoinedStr':
        case 'bytes':
        case '[':
        case '(':
        case '{':
        case '.':
        case 'not':
        case 'lambda':
            var expr = new $AbstractExprCtx(context,false)
            return $transition(expr, token, value)
        case ']':
            context.end_position = $token.value
            if(context.parent.packed){
                return context.parent
            }
            if(context.tree[0].tree.length > 0){
                return context.parent
            }
            break
        case ':':
            return new $AbstractExprCtx(new $SliceCtx(context), false)
        case ',':
            return new $AbstractExprCtx(context, false)
    }
    raise_syntax_error(context)
}

var $TargetListCtx = $B.parser.$TargetListCtx = function(context){
    // Class for target of "for" in loops or comprehensions,
    // eg x in "for target_list in A"
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.position = $token.value
    this.expect = 'id'
    this.nb_packed = 0
    context.tree[context.tree.length] = this
}

$TargetListCtx.prototype.ast = function(){
    if(this.tree.length == 1 && ! this.implicit_tuple){
        var item = this.tree[0].ast()
        item.ctx = new ast.Store()
        if(item instanceof ast.Tuple){
            for(var target of item.elts){
                target.ctx = new ast.Store()
            }
        }
        return item
    }else{
        var items = []
        for(var item of this.tree){
            item = item.ast()
            if(item.hasOwnProperty('ctx')){
                item.ctx = new ast.Store()
            }
            items.push(item)
        }
        var ast_obj = new ast.Tuple(items, new ast.Store())
        set_position(ast_obj, this.position)
        return ast_obj
    }
}

$TargetListCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
                context.expect = ','
                return new $IdCtx(
                    new $ExprCtx(context, 'target', false),
                        value)
            }
        case 'op':
            if(context.expect == 'id' && value == '*'){
                // form "for a, *b in X"
                this.nb_packed++
                context.expect = ','
                return new $AbstractExprCtx(
                    new $StarredCtx(context), false)
            }
        case '(':
        case '[':
            if(context.expect == 'id'){
              context.expect = ','
              return new $ListOrTupleCtx(context,
                  token == '(' ? 'tuple' : 'list')
            }
        case ')':
        case ']':
            if(context.expect == ','){
                return context.parent
            }
        case ',':
            if(context.expect == ','){
                context.expect = 'id'
                context.implicit_tuple = true
                return context
            }
    }

    if(context.expect == ',') {
        return $transition(context.parent, token, value)
    }else if(token == 'in'){
        // Support syntax "for x, in ..."
        return $transition(context.parent, token, value)
    }
    console.log('unexpected token for target list', token, value)
    console.log(context)
    raise_syntax_error(context)
}

var $TernaryCtx = $B.parser.$TernaryCtx = function(context){
    // Class for the ternary operator : "x if C else y"
    // "context" represents the expression "x"
    // Replace it by an expression holding the ternary
    this.type = 'ternary'
    this.position = context.position
    context.parent.tree.pop()
    var expr = new $ExprCtx(context.parent, 'ternary', false)
    expr.tree.push(this)
    this.parent = expr
    this.tree = [context]
    context.parent = this
}

$TernaryCtx.prototype.ast = function(){
    // ast.IfExp(test, body, orelse)
    var ast_obj = new ast.IfExp(this.tree[1].ast(),
                                this.tree[0].ast(),
                                this.tree[2].ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$TernaryCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'else'){
        context.in_else = true
        return new $AbstractExprCtx(context, false)
    }else if(! context.in_else){
        if(token == ':'){
            raise_syntax_error(context)
        }
        raise_syntax_error_known_range(context,
            context.position,
            last_position(context),
            "expected 'else' after 'if' expression")
    }else if(token == ","){
        // eg x = a if b else c, 2, 3
        if(["assign", "augm_assign", "node", "return"].
            indexOf(context.parent.type) > -1){
            context.parent.tree.pop()
            var t = new $ListOrTupleCtx(context.parent, 'tuple')
            t.implicit = true
            t.tree[0] = context
            context.parent = t
            t.expect = "id"
            return t
        }
    }
    return $transition(context.parent, token, value)
}

var $TryCtx = $B.parser.$TryCtx = function(context){
    // Class for the keyword "try"
    this.type = 'try'
    this.parent = context
    this.position = $token.value
    context.tree[context.tree.length] = this
}

$TryCtx.prototype.ast = function(){
    // Try(stmt* body, excepthandler* handlers, stmt* orelse, stmt* finalbody)
    var node = this.parent.node,
        res = {
            body: ast_body(this.parent),
            handlers: [],
            orelse: [],
            finalbody: []
        }
    var rank = node.parent.children.indexOf(node)
    for(var child of node.parent.children.slice(rank + 1)){
        var t = child.context.tree[0],
            type = t.type
        if(type == 'single_kw'){
            type = t.token
        }
        if(type == 'except'){
            res.handlers.push(t.ast())
        }else if(type == 'else'){
            res.orelse = ast_body(child.context)
        }else if(type == 'finally'){
            res.finalbody = ast_body(child.context)
        }else{
            break
        }
    }
    if(res.handlers.length == 0 &&
            res.finalbody.length == 0){
        raise_syntax_error(this, "expected 'except' or 'finally' block")
    }
    var res = new ast.Try(res.body, res.handlers, res.orelse, res.finalbody)
    set_position(res, this.position)
    return res
}

$TryCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){
        return $BodyCtx(context)
    }
    raise_syntax_error(context, "expected ':'")
}

var $UnaryCtx = $B.parser.$UnaryCtx = function(context, op){
    // Class for unary operators : - and ~
    this.type = 'unary'
    this.op = op
    this.parent = context
    this.tree = []
    this.position = $token.value
    context.tree.push(this)
}

$UnaryCtx.prototype.ast = function(){
    var op = {'+': ast.UAdd, '-': ast.USub, '~': ast.Invert}[this.op],
        ast_obj = new ast.UnaryOp(new op(), this.tree[0].ast())
    set_position(ast_obj, this.position)
    return ast_obj
}

$UnaryCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'op':
            if('+' == value || '-' == value){
               if(context.op === value){
                   context.op = '+'
               }else{
                   context.op = '-'
               }
               return context
            }
        case 'int':
        case 'float':
        case 'imaginary':
            if(context.parent.type == "starred"){
                raise_syntax_error(context,
                    "can't use starred expression here")
            }
            var res = new $NumberCtx(token, context, value)
            return res
        case 'id':
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
    }
    if(this.tree.length == 0 || this.tree[0].type == 'abstract_expr'){
        raise_syntax_error(context)
    }
    return $transition(context.parent, token, value)
}

var $WithCtx = $B.parser.$WithCtx = function(context){
    // Class for keyword "with"
    this.type = 'with'
    this.parent = context
    this.position = $token.value
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'expr'
    this.scope = $get_scope(this)
}

$WithCtx.prototype.ast = function(){
    // With(withitem* items, stmt* body, string? type_comment)
    // items is a list of withitem nodes representing the context managers
    // ast.withitem(context_expr, optional_vars)
    // context_expr is the context manager, often a Call node.
    // optional_vars is a Name, Tuple or List for the "as foo part", or None
    var withitems = [],
        withitem
    for(var withitem of this.tree){
        withitems.push(withitem.ast())
    }
    var klass = this.async ? ast.AsyncWith : ast.With
    var ast_obj = new klass(withitems, ast_body(this.parent))
    set_position(ast_obj,
        this.async ? this.async.position : this.position,
        last_position(this))
    return ast_obj
}

$WithCtx.prototype.transition = function(token, value){
    var context = this
    function check_last(){
        var last = $B.last(context.tree)
        if(last.tree.length > 1){
            var alias = last.tree[1]
            if(alias.tree.length == 0){
                raise_syntax_error(context, "expected ':'")
            }
            check_assignment(alias)
        }
    }
    switch(token) {
        case '(':
        case '[':
            if(this.expect == 'expr' && this.tree.length == 0){
                // start a parenthesized list of managers
                context.parenth = token
                return context
            }else{
                raise_syntax_error(context)
            }
            break
        case 'id':
            if(context.expect == 'expr'){
                // start withitem
                context.expect = ','
                return $transition(
                    new $AbstractExprCtx(new withitem(context), false), token,
                        value)
            }
            raise_syntax_error(context)
        case ':':
            if((! context.parenth) || context.parenth == 'implicit'){
                check_last()
            }
            return $BodyCtx(context)
        case ')':
        case ']':
            if(context.parenth == opening[token]){
                if(context.expect == ',' || context.expect == 'expr') {
                    check_last()
                    context.expect = ':'
                    return context
                }
            }
            break
        case ',':
            if(context.expect == ','){
                if(! context.parenth){
                    context.parenth = 'implicit'
                }
                check_last()
                context.expect = 'expr'
                return context
            }
            break
        case 'eol':
            raise_syntax_error(context, "expected ':'")
    }
    raise_syntax_error(context)
}

$WithCtx.prototype.set_alias = function(ctx){
    var ids = []
    if(ctx.type == "id"){
        ids = [ctx]
    }else if(ctx.type == "list_or_tuple"){
        // Form "with manager as (x, y)"
        for(var expr of ctx.tree){
            if(expr.type == "expr" && expr.tree[0].type == "id"){
                ids.push(expr.tree[0])
            }
        }
    }
}

var withitem = function(context){
    this.type = 'withitem'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.expect = 'as'
    this.position = $token.value
}

withitem.prototype.ast = function(){
    var ast_obj = new ast.withitem(this.tree[0].ast())
    if(this.tree[1]){
        ast_obj.optional_vars = this.tree[1].tree[0].ast()
        if(ast_obj.optional_vars.elts){
            for(var elt of ast_obj.optional_vars.elts){
                elt.ctx = new ast.Store()
            }
        }else{
            ast_obj.optional_vars.ctx = new ast.Store()
        }
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

withitem.prototype.transition = function(token, value){
    var context = this
    if(token == 'as' && context.expect == 'as'){
        context.expect = 'star_target'
        return new $AbstractExprCtx(context, false)
    }else{
        return $transition(context.parent, token, value)
    }
    raise_syntax_error(context, "expected ':'")
}

var $YieldCtx = $B.parser.$YieldCtx = function(context, is_await){
    // Class for keyword "yield"
    this.type = 'yield'
    this.parent = context
    this.tree = []
    this.is_await = is_await
    this.position = $token.value
    context.tree[context.tree.length] = this

    if(context.type == "list_or_tuple" && context.tree.length > 1){
        raise_syntax_error(context, "(non-parenthesized yield)")
    }

    if($parent_match(context, {type: "annotation"})){
        raise_syntax_error(context, "'yield' outside function")
    }

    // Store "this" in the attribute "yields" of the list_or_tuple
    // above; this is used to raise SyntaxError if there is a "yield"
    // in a comprehension expression
    var parent = this
    while(true){
        var list_or_tuple = $parent_match(parent, {type: "list_or_tuple"})
        if(list_or_tuple){
            list_or_tuple.yields = list_or_tuple.yields || []
            list_or_tuple.yields.push([this, $pos])
            parent = list_or_tuple
        }else{
            break
        }
    }

    // Same for set_or_dict
    var parent = this
    while(true){
        var set_or_dict = $parent_match(parent, {type: "dict_or_set"})
        if(set_or_dict){
            set_or_dict.yields = set_or_dict.yields || []
            set_or_dict.yields.push([this, $pos])
            parent = set_or_dict
        }else{
            break
        }
    }

    /* Strangely, the control that the "yield" is inside a function is done
       after parsing the whole program.
       For instance, the code

           {(yield 1)}
           a b c

       raises

            a b c
              ^
        SyntaxError: invalid syntax

       and not the arguably more expected

             {(yield 1)}
              ^
        SyntaxError: 'yield' outside function

       The "yield" is stored in attribute "yields_func_check" of the root node
    */

    var root = $get_module(this)

    root.yields_func_check = root.yields_func_check || []
    root.yields_func_check.push([this, $pos])

    var scope = this.scope = $get_scope(this, true),
        node = $get_node(this)

    node.has_yield = this

    // yield inside a comprehension ?
    var in_comp = $parent_match(this, {type: "comprehension"})
    if($get_scope(this).id.startsWith("lc" + $B.lambda_magic)){
        delete node.has_yield
    }

    if(in_comp){
        var outermost_expr = in_comp.tree[0].tree[1]
        // In a comprehension, "yield" is only allowed in the outermost
        // expression
        var parent = context
        while(parent){
            if(parent === outermost_expr){
                break
            }
            parent = parent.parent
        }
        if(! parent){
            raise_syntax_error(context, "'yield' inside list comprehension")
        }
    }

    var in_lambda = false,
        parent = context
    while(parent){
        if(parent.type == "lambda"){
            in_lambda = true
            this.in_lambda = true
            break
        }
        parent = parent.parent
    }

    var parent = node.parent
    while(parent){
        if(parent.context && parent.context.tree.length > 0 &&
                parent.context.tree[0].type == "with"){
            scope.context.tree[0].$has_yield_in_cm = true
            break
        }
        parent = parent.parent
    }

    // Syntax control : 'yield' can start a 'yield expression'
    if(! in_lambda){
        switch(context.type) {
            case 'node':
            case 'assign':
            case 'list_or_tuple':
                break
            default:
                // else it is a SyntaxError
                raise_syntax_error(context, '(non-parenthesized yield)')
        }
    }

}

$YieldCtx.prototype.ast = function(){
    // ast.Yield(value)
    // ast.YieldFrom(value)
    var ast_obj
    if(this.from){
        ast_obj = new ast.YieldFrom(this.tree[0].ast())
    }else if(this.tree.length == 1){
        ast_obj = new ast.Yield(this.tree[0].ast())
    }else{
        ast_obj = new ast.Yield()
    }
    set_position(ast_obj, this.position)
    return ast_obj
}

$YieldCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'from'){ // form "yield from <expr>"
        if(context.tree[0].type != 'abstract_expr'){
            // 'from' must follow 'yield' immediately
            raise_syntax_error(context, "('from' must follow 'yield')")
        }

        context.from = true
        context.from_num = $B.UUID()
        return context.tree[0]
    }else{
        remove_abstract_expr(context.tree)
        if(context.from && context.tree.length == 0){
            raise_syntax_error(context)
        }
    }
    return $transition(context.parent, token)
}

$YieldCtx.prototype.check_in_function = function(){
    if(this.in_lambda){
        return
    }
    var scope = $get_scope(this),
        in_func = scope.is_function,
        func_scope = scope
    if(! in_func && scope.comprehension){
        var parent = scope.parent_block
        while(parent.comprehension){
            parent = parent_block
        }
        in_func = parent.is_function
        func_scope = parent
    }
    if(in_func){
        var def = func_scope.context.tree[0]
        if(! this.is_await){
            def.type = 'generator'
        }
    }
}

function $parent_match(ctx, obj){
    // If any of context's parents has the same properties as obj,
    // return this parent; else return false
    var flag
    while(ctx.parent){
        flag = true
        for(var attr in obj){
            if(ctx.parent[attr] != obj[attr]){
                flag = false
                break
            }
        }
        if(flag){
            return ctx.parent
        }
        ctx = ctx.parent
    }
    return false
}

var $previous = $B.parser.$previous = function(context){
    var previous = context.node.parent.children[
            context.node.parent.children.length - 2]
    if(!previous || !previous.context){
        raise_syntax_error(context, '(keyword not following correct keyword)')
    }
    return previous.context.tree[0]
}

var $get_docstring = $B.parser.$get_docstring = function(node){
    var doc_string = _b_.None
    if(node.body.length > 0){
        var firstchild = node.body[0]
        if(firstchild instanceof $B.ast.Constant &&
                typeof firstchild.value == 'string'){
            doc_string = eval(firstchild.value)
        }
    }
    return doc_string
}

var $get_scope = $B.parser.$get_scope = function(context, flag){
    // Return the instance of $Node indicating the scope of context
    // Return null for the root node
    var ctx_node = context.parent
    while(true){
        if(ctx_node.type === 'node'){
            break
        }else if(ctx_node.comprehension){
            return ctx_node
        }
        ctx_node = ctx_node.parent
    }
    var tree_node = ctx_node.node,
        scope = null
    while(tree_node.parent && tree_node.parent.type !== 'module'){
        var ntype = tree_node.parent.context.tree[0].type

        switch (ntype) {
            case 'def':
            case 'class':
            case 'generator':
                var scope = tree_node.parent
                scope.ntype = ntype
                scope.is_function = ntype != 'class'
                return scope
        }
        tree_node = tree_node.parent
    }
    var scope = tree_node.parent || tree_node // module
    scope.ntype = "module"
    return scope
}

var $get_module = $B.parser.$get_module = function(context){
    // Return the instance of $Node for the module where context
    // is defined
    var ctx_node = context instanceof $NodeCtx ? context : context.parent
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
    var tree_node = ctx_node.node
    if(tree_node.ntype == "module"){
        return tree_node
    }
    var scope = null
    while(tree_node.parent.type != 'module'){
        tree_node = tree_node.parent
    }
    scope = tree_node.parent // module
    scope.ntype = "module"
    return scope
}

var $get_node = $B.parser.$get_node = function(context){
    var ctx = context
    while(ctx.parent){
        ctx = ctx.parent
    }
    return ctx.node
}

var $mangle = $B.parser.$mangle = function(name, context){
    // If name starts with __ and doesn't end with __, and if it is defined
    // in a class, "mangle" it, ie preprend _<classname>
    if(name.substr(0, 2) == "__" && name.substr(name.length - 2) !== "__"){
        var klass = null,
            scope = $get_scope(context)
        while(true){
            if(scope.ntype == "module"){
                return name
            }else if(scope.ntype == "class"){
                var class_name = scope.context.tree[0].name
                while(class_name.charAt(0) == '_'){
                    class_name = class_name.substr(1)
                }
                return '_' + class_name + name
            }else{
                if(scope.parent && scope.parent.context){
                    scope = $get_scope(scope.context.tree[0])
                }else{return name}
            }
        }
    }else{return name}
}

// Function called in function $tokenize for each token found in the
// Python source code

$B.nb_debug_lines = 0

var $transition = $B.parser.$transition = function(context, token, value){
    if($B.nb_debug_lines > 100){
        alert('too many debug lines')
        $B.nb_debug_lines = 0
    }
    if($B.track_transitions){
        console.log("context", context, "token", token, value) // , '\n  pos', $token.value)
        $B.nb_debug_lines++
    }
    return context.transition(token, value)
}

$B.forbidden = []
$B.aliased_names = Object.create(null)

var s_escaped = 'abfnrtvxuU"0123456789' + "'" + '\\',
    is_escaped = {}
for(var i = 0; i < s_escaped.length; i++){
    is_escaped[s_escaped.charAt(i)] = true
}

function SurrogatePair(value){
    // value is a code point between 0x10000 and 0x10FFFF
    // attribute "str" is a Javascript string of 2 characters
    value =  value - 0x10000
    return String.fromCharCode(0xD800 | (value >> 10)) +
        String.fromCharCode(0xDC00 | (value & 0x3FF))
}

function test_num(num_lit){
    var len = num_lit.length,
        pos = 0,
        char,
        elt = null,
        subtypes = {b: 'binary', o: 'octal', x: 'hexadecimal'},
        digits_re = /[_\d]/

    function error(message){
        throw SyntaxError(message)
    }
    function check(elt){
      if(elt.value.length == 0){
        var t = subtypes[elt.subtype] || 'decimal'
        error("invalid " + t + " literal")
      }else if(elt.value[elt.value.length - 1].match(/[\-+_]/)){
        var t = subtypes[elt.subtype] || 'decimal'
        error("invalid " + t + " literal")
      }else{
        // remove underscores
        elt.value = elt.value.replace(/_/g, "")
        // set length
        elt.length = pos
        return elt
      }
    }

    while(pos < len){
      var char = num_lit[pos]
      if(char.match(digits_re)){
        if(elt === null){
            elt = {value: char}
        }else{
            if(char == '_' && elt.value.match(/[._+\-]$/)){
                // consecutive underscores
                error('consecutive _ at ' + pos)
            }else if(char == '_' && elt.subtype == 'float' &&
                    elt.value.match(/e$/i)){
                // consecutive underscores
                error('syntax error')
            }else if(elt.subtype == 'b' && !(char.match(/[01_]/))){
              error(`invalid digit '${char}' in binary literal`)
            }else if(elt.subtype == 'o' && !(char.match(/[0-7_]/))){
              error(`invalid digit '${char}' in octal literal`)
            }else if(elt.subtype === undefined && elt.value.startsWith("0") &&
                !char.match(/[0_]/)){
              error("leading zeros in decimal integer literals are not" +
                " permitted; use an 0o prefix for octal integers")
            }
            elt.value += char
        }
        pos++
      }else if(char.match(/[oxb]/i)){
        if(elt.value == "0"){
          elt.subtype = char.toLowerCase()
          if(elt.subtype == "x"){
              digits_re = /[_\da-fA-F]/
          }
          elt.value = ''
          pos++
        }else{
          error("invalid char " + char)
        }
      }else if(char == '.'){
        if(elt === null){
          error("invalid char in " + num_lit + " pos " + pos + ": " + char)
        }else if(elt.subtype === undefined){
          elt.subtype = "float"
          if(elt.value.endsWith('_')){
            error("invalid decimal literal")
          }
          elt.value = elt.value.replace(/_/g, "") + char
          pos++
        }else{
          return check(elt)
        }
      }else if(char.match(/e/i)){
        if(num_lit[pos + 1] === undefined){
          error("nothing after e")
        }else if(elt && subtypes[elt.subtype] !== undefined){
          // 0b01e5 is invalid
          error("syntax error")
        }else if(elt && elt.value.endsWith('_')){
            // 1_e2 is invalid
            error("syntax error")
        }else if(num_lit[pos + 1].match(/[+\-0-9_]/)){
          if(elt && elt.value){
            if(elt.exp){
              elt.length = pos
              return elt
            }
            elt.subtype = 'float'
            elt.value += char
            elt.exp = true
            pos++
          }else{
            error("unexpected e")
          }
        }else{
          return check(elt)
        }
      }else if(char.match(/[\+\-]/i)){
          if(elt === null){
            elt = {value: char}
            pos++
          }else if(elt.value.search(/e$/i) > -1){
            elt.value += char
            pos++
          }else{
            return check(elt)
          }
      }else if(char.match(/j/i)){
          if(elt && (! elt.subtype || elt.subtype == "float")){
            elt.imaginary = true
            check(elt)
            elt.length++ // for "j"
            return elt
          }else{
            error("invalid syntax")
          }
      }else{
        break
      }
    }
    return check(elt)
}

var opening = {')': '(', '}': '{', ']': '['}

function get_first_line(src){
    // used to check if 'match' or 'case' are the "soft keywords" for pattern
    // matching, or ordinary ids
    var braces = [],
        token_reader = new $B.TokenReader(src)
    while(true){
        var token = token_reader.read()
        if(! token){
            return {line: src}
        }
        if(token.type == 'OP' && token.string == ':' && braces.length == 0){
            return true
        }else if(token.type == 'OP'){
            if('([{'.indexOf(token.string) > -1){
                braces.push(token)
            }else if(')]}'.indexOf(token.string) > -1){
                if(braces.length == 0){
                    var err = SyntaxError(
                        `unmatched '${token.string}'`)
                    err.offset = token.start[1]
                    throw err
                }else if($B.last(braces).string != opening[token.string]){
                    var err = SyntaxError("closing parenthesis " +
                        `'${token.string}' does not match opening ` +
                        `parenthesis '${$B.last(braces).string}'`)
                    err.offset = token.start[1]
                    throw err
                }else{
                    braces.pop()
                }
            }
        }else if(token.type == 'NEWLINE'){
            var end = token.end,
                lines = src.split('\n'),
                match_lines = lines.slice(0, end[0] - 1)
            match_lines.push(lines[end[0] - 1].substr(0, end[1]))
            return {text: match_lines.join('\n'), newline_token: token}
        }
    }
    return false
}

function prepare_number(n){
    // n is a numeric literal
    // return an object {type: <int | float | imaginary>, value}
    n = n.replace(/_/g, "")
    if(n.startsWith('.')){
        if(n.endsWith("j")){
            return {type: 'imaginary',
                value: prepare_number(n.substr(0, n.length - 1))}
        }else{
            return {type: 'float', value: n}
        }
        pos = j
    }else if(n.startsWith('0') && n != '0'){
        // octal, hexadecimal, binary
        var num = test_num(n),
            base
        if(num.imaginary){
            return {type: 'imaginary', value: prepare_number(num.value)}
        }
        if(num.subtype == 'float'){
            return {type: num.subtype, value: num.value}
        }
        if(num.subtype === undefined){
            base = 10
        }else{
            base = {'b': 2, 'o': 8, 'x': 16}[num.subtype]
        }
        if(base !== undefined){
            return{type: 'int', value: [base, num.value]}
        }
    }else{
        var num = test_num(n)
        if(num.subtype == "float"){
            if(num.imaginary){
                return {
                    type: 'imaginary',
                    value: prepare_number(num.value)
                }
            }else{
               return {
                   type: 'float',
                   value: num.value
               }
           }
        }else{
            if(num.imaginary){
                return {
                    type: 'imaginary',
                    value: prepare_number(num.value)
                }
            }else{
                return {
                   type: 'int',
                   value: [10, num.value]
               }
           }
       }
    }
}

function test_escape(context, text, string_start, antislash_pos){
    // Test if the escape sequence starting at position "antislah_pos" in text
    // is is valid
    // $pos is set at the position before the string quote in original string
    // string_start is the position of the first character after the quote
    // text is the content of the string between quotes
    // antislash_pos is the position of \ inside text
    var seq_end,
        mo
    // 1 to 3 octal digits = Unicode char
    mo = /^[0-7]{1,3}/.exec(text.substr(antislash_pos + 1))
    if(mo){
        return [String.fromCharCode(parseInt(mo[0], 8)), 1 + mo[0].length]
    }
    switch(text[antislash_pos + 1]){
        case "x":
            var mo = /^[0-9A-F]{0,2}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 2){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                // $pos = string_start + seq_end + 2
                raise_syntax_error(context,
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\xXX escape")
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "u":
            var mo = /^[0-9A-F]{0,4}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 4){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                raise_syntax_error(context,
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape")
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "U":
            var mo = /^[0-9A-F]{0,8}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 8){
                seq_end = antislash_pos + mo[0].length + 1
                $token.value.start[1] = seq_end
                raise_syntax_error(context,
                     "(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape")
            }else{
                var value = parseInt(mo[0], 16)
                if(value > 0x10FFFF){
                    raise_syntax_error(context, 'invalid unicode escape ' + mo[0])
                }else if(value >= 0x10000){
                    return [SurrogatePair(value), 2 + mo[0].length]
                }else{
                    return [String.fromCharCode(value), 2 + mo[0].length]
                }
            }
    }
}

function prepare_string(context, s, position){
    var len = s.length,
        pos = 0,
        string_modifier,
        _type = "string"

    while(pos < len){
        if(s[pos] == '"' || s[pos] == "'"){
            quote = s[pos]
            string_modifier = s.substr(0, pos)
            if(s.substr(pos, 3) == quote.repeat(3)){
                _type = "triple_string"
                inner = s.substring(pos + 3, s.length - 3)
            }else{
                inner = s.substring(pos + quote.length,
                    len - quote.length)
            }
            break
        }
        pos++
    }
    var result = {quote}
    var mods = {r: 'raw', f: 'fstring', b: 'bytes'}
    for(var mod of string_modifier){
        result[mods[mod]] = true
    }

    var raw = context.type == 'str' && context.raw,
        string_start = $pos + pos + 1,
        bytes = false,
        fstring = false,
        sm_length, // length of string modifier
        end = null;
    if(string_modifier){
        switch(string_modifier) {
            case 'r': // raw string
                raw = true
                break
            case 'u':
                // in string literals, '\U' and '\u' escapes in raw strings
                // are not treated specially.
                break
            case 'b':
                bytes = true
                break
            case 'rb':
            case 'br':
                bytes = true
                raw = true
                break
            case 'f':
                fstring = true
                sm_length = 1
                break
            case 'fr':
            case 'rf':
                fstring = true
                sm_length = 2
                raw = true
                break
        }
        string_modifier = false
    }

    var escaped = false,
        zone = '',
        end = 0,
        src = inner
    while(end < src.length){
        if(escaped){
            if(src.charAt(end) == "a" && ! raw){
                zone = zone.substr(0, zone.length - 1) + "\u0007"
            }else{
                zone += src.charAt(end)
                if(raw && src.charAt(end) == '\\'){
                    zone += '\\'
                }
            }
            escaped = false
            end++
        }else if(src.charAt(end) == "\\"){
            if(raw){
                if(end < src.length - 1 &&
                        src.charAt(end + 1) == quote){
                    zone += '\\\\' + quote
                    end += 2
                }else{
                    zone += '\\\\'
                    end++
                }
                escaped = true
            }else{
                if(src.charAt(end + 1) == '\n'){
                    // explicit line joining inside strings
                    end += 2
                }else if(src.substr(end + 1, 2) == 'N{'){
                    // Unicode literal ?
                    var end_lit = end + 3,
                        re = new RegExp("[-a-zA-Z0-9 ]+"),
                        search = re.exec(src.substr(end_lit))
                    if(search === null){
                        raise_syntax_error(context," (unicode error) " +
                            "malformed \\N character escape", pos)
                    }
                    var end_lit = end_lit + search[0].length
                    if(src.charAt(end_lit) != "}"){
                        raise_syntax_error(context, " (unicode error) " +
                            "malformed \\N character escape")
                    }
                    var description = search[0].toUpperCase()
                    // Load unicode table if not already loaded
                    if($B.unicodedb === undefined){
                        var xhr = new XMLHttpRequest
                        xhr.open("GET",
                            $B.brython_path + "unicode.txt", false)
                        xhr.onreadystatechange = function(){
                            if(this.readyState == 4){
                                if(this.status == 200){
                                    $B.unicodedb = this.responseText
                                }else{
                                    console.log("Warning - could not " +
                                        "load unicode.txt")
                                }
                            }
                        }
                        xhr.send()
                    }
                    if($B.unicodedb !== undefined){
                        var re = new RegExp("^([0-9A-F]+);" +
                            description + ";.*$", "m")
                        search = re.exec($B.unicodedb)
                        if(search === null){
                            raise_syntax_error(context, " (unicode error) " +
                                "unknown Unicode character name")
                        }
                        var cp = "0x" + search[1] // code point
                        zone += String.fromCodePoint(eval(cp))
                        end = end_lit + 1
                    }else{
                        end++
                    }
                }else{
                    var esc = test_escape(context, src, string_start,
                                          end)
                    if(esc){
                        if(esc[0] == '\\'){
                            zone += '\\\\'
                        }else{
                            zone += esc[0]
                        }
                        end += esc[1]
                    }else{
                        if(end < src.length - 1 &&
                            is_escaped[src.charAt(end + 1)] === undefined){
                                zone += '\\'
                        }
                        zone += '\\'
                        escaped = true
                        end++
                    }
                }
            }
        }else if(src.charAt(end) == '\n' && _type != 'triple_string'){
            // In a string with single quotes, line feed not following
            // a backslash raises SyntaxError
            raise_syntax_error(context, "EOL while scanning string literal")
        }else{
            zone += src.charAt(end)
            end++
        }
    }
    var $string = zone,
        string = ''

    // Escape quotes inside string, except if they are
    // already escaped.
    // In raw mode, always escape.
    for(var i = 0; i < $string.length; i++){
        var $car = $string.charAt(i)
        if($car == quote){
            if(raw || (i == 0 ||
                    $string.charAt(i - 1) != '\\')){
                string += '\\'
            }else if(_type == "triple_string"){
                // Unescaped quotes in triple string are allowed
                var j = i - 1
                while($string.charAt(j) == '\\'){
                    j--
                }
                if((i - j - 1) % 2 == 0){
                    string += '\\'
                }
            }
        }
        string += $car
    }

    if(fstring){
        try{
            var re = new RegExp("\\\\" + quote, "g"),
                string_no_bs = string.replace(re, quote)
            var elts = $B.parse_fstring(string_no_bs) // in py_string.js
        }catch(err){
            if(err.position){
                $pos += err.position
            }
            raise_syntax_error(context, err.message)
        }
    }

    if(bytes){
        result.value = 'b' + quote + string + quote
    }else if(fstring){
        result.value = elts
    }else{
        result.value = quote + string + quote
    }
    context.raw = raw;
    return result
}

function unindent(src){
    // Brython supports scripts that don't start at column 0
    // Return unindented source, or raise SyntaxError if a line starts at a
    // column lesser than the first line.
    var lines = src.split('\n'),
        line,
        global_indent,
        indent,
        unindented_lines = []

    for(var line_num = 0, len = lines.length; line_num < len; line_num++){
        line = lines[line_num]
        indent = line.match(/^\s*/)[0]
        if(indent != line){ // non whitespace-only line
            if(global_indent === undefined){
                // The indentation of the first non-whitespace line sets the
                // "global indentation" for the whole script.
                if(indent.length == 0){
                    // Return source code unchanged if no global indentation
                    return src
                }
                global_indent = indent
                var start = global_indent.length
                unindented_lines.push(line.substr(start))
            }else if(line.startsWith(global_indent)){
                unindented_lines.push(line.substr(start))
            }else{
                throw SyntaxError("first line starts at " +
                   `column ${start}, line ${line_num} at column ` +
                   line.match(/\s*/).length + '\n    ' + line)
            }
        }else{
            unindented_lines.push('')
        }
    }
    return unindented_lines.join('\n')
}

function handle_errortoken(context, token, token_reader){
    if(token.string == "'" || token.string == '"'){
        raise_syntax_error(context, 'unterminated string literal ' +
            `(detected at line ${token.start[0]})`)
    }else if(token.string == '\\'){
        var nxt = token_reader.read()
        if((! nxt) || nxt.type == 'NEWLINE'){
            raise_syntax_error(context, 'unexpected EOF while parsing')
        }else{
            raise_syntax_error_known_range(context,
                nxt, nxt,
                'unexpected character after line continuation character')
        }
    }else if(' `$'.indexOf(token.string) == -1){
        var u = token.string.codePointAt(0).toString(16).toUpperCase()
        u = 'U+' + '0'.repeat(4 - u.length) + u
        raise_syntax_error(context,
            `invalid character '${token.string}' (${u})`)
    }
    raise_syntax_error(context)
}

const braces_opener = {")": "(", "]": "[", "}": "{"},
      braces_open = "([{",
      braces_closer = {'(': ')', '{': '}', '[': ']'}

function check_brace_is_closed(brace, reader){
    // check if the brace is closed
    var save_reader_pos = reader.position,
        closer = braces_closer[brace],
        nb_braces = 1
    while(true){
        var tk = reader.read()
        if(tk.type == 'OP' && tk.string == brace){
            nb_braces += 1
        }else if(tk.type == 'OP' && tk.string == closer){
            nb_braces -= 1
            if(nb_braces == 0){
                // reset reader to the position after the brace
                reader.seek(save_reader_pos)
                break
            }
        }
    }
}

var python_keywords = [
    "class", "return", "break", "for", "lambda", "try", "finally", "raise",
    "def", "from", "nonlocal", "while", "del", "global", "with", "as", "elif",
    "else", "if", "yield", "assert", "import", "except", "raise", "in",
    "pass", "with", "continue", "async", "await"
]

var $token = {}

var dispatch_tokens = $B.parser.dispatch_tokens = function(root){
    var src = root.src
    root.token_reader = new $B.TokenReader(src)
    var braces_stack = []

    var unsupported = []
    var $indented = [
        "class", "def", "for", "condition", "single_kw", "try", "except",
        "with",
        "match", "case" // PEP 622 (pattern matching)
    ]

    var module = root.module

    var lnum = root.line_num === undefined ? 1 : root.line_num

    var node = new $Node()
    node.line_num = lnum
    root.add(node)
    var context = null,
        expect_indent = false,
        indent = 0

    // line2pos maps line numbers to position of first character in line
    var line2pos = {0: 0, 1: 0},
        line_num = 1
    for(var pos = 0, len = src.length; pos < len; pos++){
        if(src[pos] == '\n'){
            line_num++
            line2pos[line_num] = pos + 1
        }
    }

    while(true){
        try{
            var token = root.token_reader.read()
        }catch(err){
            context = context || new $NodeCtx(node)
            if(err.type == 'IndentationError'){
                $pos = line2pos[err.line_num]
                raise_indentation_error(context, err.message)
            }else if(err instanceof SyntaxError){
                if(braces_stack.length > 0){
                    var last_brace = $B.last(braces_stack),
                        start = last_brace.start
                    $token.value = last_brace
                    raise_syntax_error(context, `'${last_brace.string}'` +
                       ' was never closed')
                }
                var err_msg = err.message
                if(err_msg == 'EOF in multi-line statement'){
                    err_msg = 'unexpected EOF while parsing'
                }
                if(err.lineno){
                    raise_error_known_location(_b_.SyntaxError,
                        root.filename, err.lineno, err.col_offset,
                        err.end_lineno, err.end_col_offset, err.line,
                        err.message)
                }else{
                    raise_syntax_error(context, err_msg)
                }
            }
            throw err
        }
        if(! token){
            throw Error('token done without ENDMARKER.')
        }
        $token.value = token
        if(token[2] === undefined){
            console.log('token incomplet', token, 'module', module, root)
            console.log('src', src)
        }
        if(token.start === undefined){
            console.log('no start', token)
        }
        lnum = token.start[0]
        $pos = line2pos[lnum] + token.start[1]
        // console.log('token', token, 'lnum', lnum, 'node', node)
        //console.log('context', context)
        if(expect_indent &&
                ['INDENT', 'COMMENT', 'NL'].indexOf(token.type) == -1){
            context = context || new $NodeCtx(node)
            raise_indentation_error(context, "expected an indented block",
                expect_indent)
        }

        switch(token.type){
            case 'ENDMARKER':
                // Check that all "yield"s are in a function
                if(root.yields_func_check){
                    var save_pos = $pos
                    for(const _yield of root.yields_func_check){
                        $token.value = _yield[0].position
                        _yield[0].check_in_function()
                    }
                    $pos = save_pos
                }
                if(indent != 0){
                    raise_indentation_error(node.context,
                        'expected an indented block')
                }
                if(node.context === undefined || node.context.tree.length == 0){
                    node.parent.children.pop()
                }
                return
            case 'ENCODING':
            case 'TYPE_COMMENT':
                continue
            case 'NL':
                if((! node.context) || node.context.tree.length == 0){
                    node.line_num++
                }
                continue
            case 'COMMENT':
                var end = line2pos[token.end[0]] + token.end[1]
                root.comments.push([$pos, end - $pos])
                continue
            case 'ERRORTOKEN':
                context = context || new $NodeCtx(node)
                if(token.string != ' '){
                    handle_errortoken(context, token, root.token_reader)
                }
                continue
        }
        // create context if needed
        switch(token[0]){
            case 'NAME':
            case 'NUMBER':
            case 'OP':
            case 'STRING':
                context = context || new $NodeCtx(node)
        }

        switch(token[0]){
            case 'NAME':
                var name = token[1]
                if(python_keywords.indexOf(name) > -1){
                    if(unsupported.indexOf(name) > -1){
                        raise_syntax_error(context,
                            "(Unsupported Python keyword '" + name + "')")
                    }
                    context = $transition(context, name)
                }else if(name == 'not'){
                    context = $transition(context, 'not')
                }else if(typeof $operators[name] == 'string'){
                    // Literal operators : "and", "or", "is"
                    context = $transition(context, 'op', name)
                }else{
                    context = $transition(context, 'id', name)
                }
                continue
            case 'OP':
                var op = token[1]
                if((op.length == 1 && '()[]{}.,='.indexOf(op) > -1) ||
                        [':='].indexOf(op) > -1){
                    if(braces_open.indexOf(op) > -1){
                        braces_stack.push(token)
                        // check that opening brace is closed later, this
                        // takes precedence over syntax errors that might
                        // occur before the closing brace
                        try{
                            check_brace_is_closed(op, root.token_reader)
                        }catch(err){
                            if(err.message == 'EOF in multi-line statement'){
                                raise_syntax_error(context,
                                    `'${op}' was never closed`)
                            }else{
                                raise_error_known_location(_b_.SyntaxError,
                                    root.filename, err.lineno, err.col_offset,
                                    err.end_lineno, err.end_col_offset, err.line,
                                    err.message)
                            }
                        }
                    }else if(braces_opener[op]){
                        if(braces_stack.length == 0){
                            raise_syntax_error(context, "(unmatched '" + op + "')")
                        }else{
                            var last_brace = $B.last(braces_stack)
                            if(last_brace.string == braces_opener[op]){
                                braces_stack.pop()
                            }else{
                                raise_syntax_error(context,
                                    `closing parenthesis '${op}' does not ` +
                                    `match opening parenthesis '` +
                                    `${last_brace.string}'`)
                           }
                       }
                    }
                    context = $transition(context, token[1])
                }else if(op == ':'){
                    context = $transition(context, ':')
                    if(context.node && context.node.is_body_node){
                        node = context.node
                    }
                }else if(op == '...'){
                    context = $transition(context, 'ellipsis')
                }else if(op == '->'){
                    context = $transition(context, 'annotation')
                }else if(op == ';'){
                    if(context.type == 'node' && context.tree.length == 0){
                        raise_syntax_error(context,
                            '(statement cannot start with ;)')
                    }
                    // same as NEWLINE
                    $transition(context, 'eol')
                    var new_node = new $Node()
                    new_node.line_num = token[2][0] + 1
                    context = new $NodeCtx(new_node)
                    node.parent.add(new_node)
                    node = new_node
                }else if($augmented_assigns[op]){
                    context = $transition(context, 'augm_assign', op)
                }else{
                    context = $transition(context, 'op', op)
                }
                continue
            case 'STRING':
                var prepared = prepare_string(context, token[1], token[2])
                if(prepared.value instanceof Array){
                    context = $transition(context, 'JoinedStr', prepared.value)
                }else{
                    context = $transition(context, 'str', prepared.value)
                }
                continue
            case 'NUMBER':
                try{
                    var prepared = prepare_number(token[1])
                }catch(err){
                    raise_syntax_error(context, err.message)
                }
                context = $transition(context, prepared.type, prepared.value)
                continue
            case 'NEWLINE':
                if(context && context.node && context.node.is_body_node){
                    expect_indent = context.node.parent
                }
                context = context || new $NodeCtx(node)
                $transition(context, 'eol')
                // Create a new node
                var new_node = new $Node()
                new_node.line_num = token[2][0] + 1
                if(node.parent.children.length > 0 &&
                        node.parent.children[0].is_body_node){
                    node.parent.parent.add(new_node)
                }else{
                    node.parent.add(new_node)
                }
                context = new $NodeCtx(new_node)
                node = new_node
                continue
            case 'DEDENT':
                // The last node was added after a NEWLINE. It was attached
                // to the current node's parent.
                // Detach it
                indent--
                if(! indent_continuation){
                    node.parent.children.pop()
                    // Attach new_node to new "current"
                    node.parent.parent.add(node)
                    // redefine context to set locals to bindings of node scope
                    context = new $NodeCtx(node)
                }
                continue
            case 'INDENT':
                indent++
                var indent_continuation =  false
                // Check that it supports indentation
                if(! expect_indent){
                    if(token.line.trim() == '\\'){
                        // Strange special case
                        // See test_syntax.py/test_empty_line_after_linecont
                        indent_continuation = true
                    }else{
                        context = context || new $NodeCtx(node)
                        raise_indentation_error(context, 'unexpected indent')
                    }
                }
                expect_indent = false
                continue
        }
    }
}

var $create_root_node = $B.parser.$create_root_node = function(src, module,
        locals_id, parent_block, line_num){
    var root = new $Node('module')
    root.module = module
    root.id = locals_id
    root.parent_block = parent_block
    root.line_num = line_num
    root.indent = -1
    root.comments = []
    root.imports = {}

    if(typeof src == "object"){
        root.is_comp = src.is_comp
        root.filename = src.filename
        src = src.src
    }

    // Normalize line ends
    src = src.replace(/\r\n/gm, "\n")
    root.src = src
    return root
}

$B.py2js = function(src, module, locals_id, parent_scope){
    // src = Python source (string or object)
    // module = module name (string)
    // locals_id = the id of the block that will be created
    // parent_scope = the scope where the code is created
    //
    // Returns the Javascript code

    $pos = 0

    if(typeof module == "object"){
        var __package__ = module.__package__
        module = module.__name__
    }else{
        var __package__ = ""
    }

    parent_scope = parent_scope || $B.builtins_scope

    var t0 = Date.now(),
        ix, // used for generator expressions
        filename,
        imported
    if(typeof src == 'object'){
        var ix = src.ix,
            filename = src.filename,
            imported = src.imported
        src = src.src
    }
    var locals_is_module = Array.isArray(locals_id)
    if(locals_is_module){
        locals_id = locals_id[0]
    }

    if($B.parser_to_ast){
        var _ast = new $B.Parser(src, filename).parse('file')
    }else{
        var root = $create_root_node({src, filename},
                                     module, locals_id, parent_scope)
        dispatch_tokens(root)
        var _ast = root.ast()
    }
    var future = $B.future_features(_ast, filename)
    var symtable = $B._PySymtable_Build(_ast, filename, future)
    var js_obj = $B.js_from_root({ast: _ast,
                                  symtable,
                                  filename,
                                  imported})
    var js_from_ast = js_obj.js
    return {
        _ast,
        imports: js_obj.imports,
        to_js: function(){return js_from_ast}
    }
}

$B.set_import_paths = function(){
    // Set $B.meta_path, the list of finders to use for imports
    //
    // The original list in $B.meta_path is made of 3 finders defined in
    // py_import.js :
    // - finder_VFS : in the Virtual File System : a Javascript object with
    //   source of the standard distribution
    // - finder_static_stlib : use the script stdlib_path.js to identify the
    //   packages and modules in the standard distribution
    // - finder_path : search module at different urls

    var meta_path = [],
        path_hooks = []

    // $B.use_VFS is set to true if the script brython_stdlib.js or
    // brython_modules.js has been loaded in the page. In this case we use the
    // Virtual File System (VFS)
    if($B.use_VFS){
        meta_path.push($B.finders.VFS)
    }

    if($B.$options.static_stdlib_import !== false && $B.protocol != "file"){
        // Add finder using static paths
        meta_path.push($B.finders.stdlib_static)
        // Remove /Lib and /libs in sys.path :
        // if we use the static list and the module
        // was not find in it, it's no use searching twice in the same place
        if($B.path.length > 3) {
            $B.path.shift()
            $B.path.shift()
        }
    }

    // Use the defaut finder using sys.path if protocol is not file://
    if($B.protocol !== "file"){
        meta_path.push($B.finders.path)
        path_hooks.push($B.url_hook)
    }

    // Finder using CPython modules
    if($B.$options.cpython_import){
        if($B.$options.cpython_import == "replace"){
            $B.path.pop()
        }
        meta_path.push($B.finders.CPython)
    }

    $B.meta_path = meta_path
    $B.path_hooks = path_hooks
}

$B.parse_options = function(options){
    // By default, only set debug level
    if(options === undefined){
        options = {debug: 1}
    }else if(typeof options == 'number'){
        options = {debug: options}
    }else if(typeof options !== 'object'){
        console.warn('ignoring invalid argument passed to brython():',
            options)
        options = {debug: 1}
    }

    // If the argument provided to brython() is a number, it is the debug
    // level

    if(options.debug === undefined){options.debug = 1}
    $B.debug = options.debug

    // set built-in variable __debug__
    _b_.__debug__ = $B.debug > 0

    $B.compile_time = 0

    if(options.profile === undefined){options.profile = 0}
    $B.profile = options.profile

    // If a VFS is present, Brython normally stores a precompiled version
    // in an indexedDB database. Setting options.indexedDB to false disables
    // this feature (cf issue #927)
    if(options.indexedDB === undefined){options.indexedDB = true}

    // For imports, default mode is to search modules of the standard library
    // using a static mapping stored in stdlib_paths.js
    // This can be disabled by setting option "static_stdlib_import" to false
    if(options.static_stdlib_import === undefined){
        options.static_stdlib_import = true
    }
    $B.static_stdlib_import = options.static_stdlib_import

    $B.$options = options

    $B.set_import_paths()

    // URL of the script where function brython() is called
    // Remove part after # (cf. issue #2035)
    var $href = $B.script_path = _window.location.href.split('#')[0],
        $href_elts = $href.split('/')
    $href_elts.pop()
    if($B.isWebWorker || $B.isNode){$href_elts.pop()} // WebWorker script is in the web_workers subdirectory
    $B.curdir = $href_elts.join('/')

    // List of URLs where imported modules should be searched
    // A list can be provided as attribute of options
    if(options.pythonpath !== undefined){
        $B.path = options.pythonpath
        $B.$options.static_stdlib_import = false
    }

    // Default extension used in imports (cf. issue #1748)
    options.python_extension = options.python_extension || '.py'

    // Or it can be provided as a list of strings or path objects
    // where a path object has at least a path attribute and, optionally,
    // a prefetch attribute and/or a lang attribute
    // This corresponds to a python path specified via the link element
    //
    //    <link rel="prefetch" href=path hreflang=lang />
    //
    // where the prefetch attribute should be present & true if prefetching is required
    // otherwise it should be present and false

    if(options.python_paths){
        for(var path of options.python_paths){
            var lang, prefetch
            if(typeof path !== "string"){
                lang = path.lang
                prefetch = path.prefetch
                path = path.path
            }
            $B.path.push(path)
            if(path.slice(-7).toLowerCase() == '.vfs.js' &&
                    (prefetch === undefined || prefetch === true)){
                $B.path_importer_cache[path + '/'] =
                    $B.imported['_importlib'].VFSPathFinder(path)
            }
            if(lang){
                _importlib.optimize_import_for_path(path, lang)
            }
        }
    }

    if(!($B.isWebWorker || $B.isNode)){
        // Get all links with rel=pythonpath and add them to sys.path
        var path_links = document.querySelectorAll('head link[rel~=pythonpath]'),
            _importlib = $B.imported['_importlib']
        for(var i = 0, e; e = path_links[i]; ++i) {
            var href = e.href;
            if((' ' + e.rel + ' ').indexOf(' prepend ') != -1) {
                $B.path.unshift(href);  // support prepending to pythonpath
            }else{
                $B.path.push(href);
            }
            var filetype = e.hreflang
            if(filetype){
                if(filetype.slice(0,2) == 'x-'){filetype = filetype.slice(2)}
                _importlib.optimize_import_for_path(e.href, filetype)
            }
        }
    }

    if($B.$options.args){
        $B.__ARGV = $B.$options.args
    }else{
        $B.__ARGV = _b_.list.$factory([])
    }

    $B.options_parsed = true
    return options
}

// Reserved for future use : execute Python scripts as soon as they are
// inserted in the page, instead of waiting for page load.
// options are passed as attributes of the <script> tag, eg
// <script type="text/python" debug=2>
if(!($B.isWebWorker || $B.isNode)){
    var observer = new MutationObserver(function(mutations){
      for (var i=0; i < mutations.length; i++){
        for (var j=0; j < mutations[i].addedNodes.length; j++){
          checkPythonScripts(mutations[i].addedNodes[j]);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
}

function checkPythonScripts(addedNode) {
   if(addedNode.tagName == 'SCRIPT' && addedNode.type == "text/python"){
       var options = {}
       for(var attr of addedNode.attributes){
           if(attr.nodeName == "type"){
               continue
           }else if(attr.nodeName == 'debug'){
               options[attr.nodeName] = parseInt(attr.nodeValue)
           }else{
               options[attr.nodeName]  = attr.nodeValue
           }
       }
       // process script here...
   }
}

var brython = $B.parser.brython = function(options){
    options = $B.parse_options(options)
    if(!($B.isWebWorker || $B.isNode)){
        observer.disconnect()
    }else{
        return
    }
    if(options === undefined){
        options = {}
    }
    // Save initial Javascript namespace
    var kk = Object.keys(_window)

    // Id sets to scripts
    var defined_ids = {},
        $elts = [],
        webworkers = []

    // Option to run code on demand and not all the scripts defined in a page
    // The following lines are included to allow to run brython scripts in
    // the IPython/Jupyter notebook using a cell magic. Have a look at
    // https://github.com/kikocorreoso/brythonmagic for more info.
    var ids = options.ids || options.ipy_id
    if(ids !== undefined){
        if(!Array.isArray(ids)){
            throw _b_.ValueError.$factory("ids is not a list")
        }
        var scripts = []
        for(var id of options.ids){
            var elt = document.getElementById(id)
            if(elt === null){
                throw _b_.KeyError.$factory(`no script with id '${id}'`)
            }
            if(elt.tagName !== "SCRIPT"){
                throw _b_.KeyError.$factory(`element ${id} is not a script`)
            }
            scripts.push(elt)
        }
    }else{
        var scripts = document.getElementsByTagName('script')
    }
    // Freeze the list of scripts here ; other scripts can be inserted on
    // the fly by viruses
    for(var i = 0; i < scripts.length; i++){
        var script = scripts[i]
        if(script.type == "text/python" || script.type == "text/python3"){
            if(script.className == "webworker"){
                if(script.id === undefined){
                    throw _b_.AttributeError.$factory(
                        "webworker script has no attribute 'id'")
                }
                webworkers.push(script)
            }else{
                $elts.push(script)
            }
        }
    }

    // Get all scripts with type = text/python or text/python3 and run them
    var first_script = true, module_name
    if(options.ipy_id !== undefined){
        module_name = '__main__'
        var $src = "", js, root
        for(var elt of $elts){
            $src += (elt.innerHTML || elt.textContent)
        }
        try{
            // Conversion of Python source code to Javascript
            var root = $B.py2js($src, module_name, module_name)
            js = root.to_js()
            if($B.debug > 1){
                $log(js)
            }

            // Run resulting Javascript
            eval(js)

            $B.clear_ns(module_name)
            root = null
            js = null

        }catch($err){
            root = null
            js = null
            console.log($err)
            if($B.debug > 1){
                console.log($err)
                for(var attr in $err){
                   console.log(attr + ' : ', $err[attr])
                }
            }

            // If the error was not caught by the Python runtime, build an
            // instance of a Python exception
            if($err.$py_error === undefined){
                console.log('Javascript error', $err)
                $err = _b_.RuntimeError.$factory($err + '')
            }

            // Print the error traceback on the standard error stream
            var $trace = $B.$getattr($err, 'info') + '\n' + $err.__name__ +
                ': ' + $err.args
            try{
                $B.$getattr($B.stderr, 'write')($trace)
            }catch(print_exc_err){
                console.log($trace)
            }
            // Throw the error to stop execution
            throw $err
        }
    }else{
        if($elts.length > 0){
            if(options.indexedDB && $B.has_indexedDB &&
                    $B.hasOwnProperty("VFS")){
                $B.tasks.push([$B.idb_open])
            }
        }
        // Get all explicitely defined ids, to avoid overriding
        for(var i = 0; i < $elts.length; i++){
            var elt = $elts[i]
            if(elt.id){
                if(defined_ids[elt.id]){
                    throw Error("Brython error : Found 2 scripts with the " +
                      "same id '" + elt.id + "'")
                }else{
                    defined_ids[elt.id] = true
                }
            }
        }

        var src
        for(var i = 0, len = webworkers.length; i < len; i++){
            var worker = webworkers[i]
            if(worker.src){
                // format <script type="text/python" src="python_script.py">
                // get source code by an Ajax call
                $B.tasks.push([$B.ajax_load_script,
                    {name: worker.id, url: worker.src, is_ww: true}])
            }else{
                // Get source code inside the script element
                src = (worker.innerHTML || worker.textContent)
                src = unindent(src) // remove global indentation
                // remove leading CR if any
                src = src.replace(/^\n/, '')
                $B.webworkers[worker.id] = src
                var filename = $B.script_path + "#" + worker.id
                $B.url2name[filename] = worker.id
                $B.file_cache[filename] = src
            }
        }

        for(var i = 0; i < $elts.length; i++){
            var elt = $elts[i]
            if(elt.type == "text/python" || elt.type == "text/python3"){
                // Set the module name, ie the value of the builtin variable
                // __name__.
                // If the <script> tag has an attribute "id", it is taken as
                // the module name.
                if(elt.id){
                    module_name = elt.id
                }else{
                    // If no explicit name is given, the module name is
                    // "__main__" for the first script, and "__main__" + a
                    // random value for the next ones.
                    if(first_script){
                        module_name = '__main__'
                        first_script = false
                    }else{
                        module_name = '__main__' + $B.UUID()
                    }
                    while(defined_ids[module_name] !== undefined){
                        module_name = '__main__' + $B.UUID()
                    }
                }

                // Get Python source code
                if(elt.src){
                    // format <script type="text/python" src="python_script.py">
                    // get source code by an Ajax call
                    $B.tasks.push([$B.ajax_load_script,
                        {name: module_name, url: elt.src, id: elt.id}])
                }else{
                    // Get source code inside the script element
                    src = (elt.innerHTML || elt.textContent)
                    src = unindent(src) // remove global indentation
                    // remove leading CR if any
                    src = src.replace(/^\n/, '')
                    // remove trailing \n
                    if(src.endsWith('\n')){
                        src = src.substr(0, src.length - 1)
                    }
                    var filename = $B.script_path + "#" + module_name
                    // store source code
                    $B.file_cache[filename] = src
                    $B.url2name[filename] = module_name
                    $B.tasks.push([$B.run_script, src, module_name,
                                   filename, true])
                }
            }
        }
    }

    if(options.ipy_id === undefined){
        $B.loop()
    }

    /* Uncomment to check the names added in global Javascript namespace
    var kk1 = Object.keys(_window)
    for (var i = 0; i < kk1.length; i++){
        if(kk[i] === undefined){
            console.log("leaking", kk1[i])
        }
    }
    */
}

$B.run_script = function(src, name, url, run_loop){
    // run_loop is set to true if run_script is added to tasks in
    // ajax_load_script
    $B.file_cache[url] = src
    $B.url2name[url] = name
    try{
        var root = $B.py2js({src: src, filename: url}, name, name),
            js = root.to_js(),
            script = {
                __doc__: $get_docstring(root._ast),
                js: js,
                __name__: name,
                __file__: url
            }
        if($B.debug > 1){
            console.log($B.format_indent(js, 0))
        }
    }catch(err){
        return $B.handle_error(err) // in loaders.js
    }
    if($B.hasOwnProperty("VFS") && $B.has_indexedDB){
        // Build the list of stdlib modules required by the
        // script
        var imports1 = Object.keys(root.imports).slice(),
            imports = imports1.filter(function(item){
                return $B.VFS.hasOwnProperty(item)})
        for(var name of Object.keys(imports)){
            if($B.VFS.hasOwnProperty(name)){
                var submodule = $B.VFS[name],
                    type = submodule[0]
                if(type==".py"){
                    var src = submodule[1],
                        subimports = submodule[2],
                        is_package = submodule.length == 4
                    // "subimports" is the list of stdlib modules
                    // directly imported by the module.
                    if(type==".py"){
                        // Add stdlib modules recursively imported
                        required_stdlib_imports(subimports)
                    }
                    for(var mod of subimports){
                        if(imports.indexOf(mod) == -1){
                            imports.push(mod)
                        }
                    }
                }
            }
        }
        // Add task to stack
        for(var j = 0; j < imports.length; j++){
            $B.tasks.push([$B.inImported, imports[j]])
        }
        root = null
    }
    $B.tasks.push(["execute", script])
    if(run_loop){
        $B.loop()
    }
}

var $log = $B.$log = function(js){
    js.split("\n").forEach(function(line, i){
        console.log(i + 1, ":", line)
    })
}

$B.$operators = $operators
$B.$Node = $Node

// in case the name 'brython' is used in a Javascript library,
// we can use $B.brython
$B.brython = brython

})(__BRYTHON__)

var brython = __BRYTHON__.brython

if (__BRYTHON__.isNode) {
    global.__BRYTHON__ = __BRYTHON__
    module.exports = { __BRYTHON__ }
}
