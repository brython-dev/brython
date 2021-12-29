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

// Variable used to generate random names used in loops
var $loop_num = 0

// ast is in generated script py_ast.js
if($B.ast_classes){
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
            var child_ast = ast_or_obj(ctx)
            if(ast.expr.indexOf(child_ast.constructor) > -1){
                child_ast = new ast.Expr(child_ast)
            }
            body.push(child_ast)
        }
        return body
    }

    function ast_dump(tree, indent){
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

            //res += tree.map(x => ast_dump(x, indent + 1)).join(',\n')
            return res + ']'
        }else if(tree.$name){
            return tree.$name + '()'
        }else if(tree instanceof ast.MatchSingleton){
            return `MatchSingleton(value=${tree.value})`
        }else if(tree instanceof ast.Constant){

            var value = tree.value
            if(value === undefined){
                console.log('bizarre', tree)
            }
            // For imaginary numbers, value is an object with
            // attribute "imaginary" set
            if(value.imaginary){
                return `Constant(value=${_b_.repr(value.value)}j)`
            }
            return `Constant(value=${_b_.repr(tree.value)})`
        }
        var proto = Object.getPrototypeOf(tree).constructor
        var res = '  ' .repeat(indent) + proto.$name + '('
        if($B.ast_classes[proto.$name] === undefined){
            console.log('pas dans ast_classes', tree, proto, proto.$name)
        }
        var attr_names = $B.ast_classes[proto.$name].split(','),
            attrs = []
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
}

function ast_or_obj(obj){
    // temporary function used while all contexts don't have ast()
    // implemented
    if(obj.ast){
        return obj.ast()
    }else{
        console.log('no ast', obj.type || typeof obj, obj)
        show_line(obj)
        return obj
    }
}

var create_temp_name = $B.parser.create_temp_name = function(prefix) {
    var _prefix = prefix || '$temp'
    return _prefix + $loop_num ++
}

/*
 * Replaces the node :param:`replace_what` ($Node) with :param:`replace_with`
 * in the ast tree (assumes replace_what is a child of its parent)
 */
var replace_node = $B.parser.replace_node = function(replace_what, replace_with){
    var parent = replace_what.parent
    var pos = replace_what.parent.children.indexOf(replace_what)
    parent.children[pos] = replace_with
    replace_with.parent = parent
    // Save node bindings
    replace_with.bindings = replace_what.bindings
}

// Variable used for chained comparison
var chained_comp_num = 0

/*
Function called in case of SyntaxError
======================================
*/

var $_SyntaxError = $B.parser.$_SyntaxError = function(context, msg, indent){
    // console.log("syntax error", context, "msg", msg, "indent", indent, '$pos', $pos)
    var ctx_node = context
    while(ctx_node.type !== 'node'){
        ctx_node = ctx_node.parent
    }
    var tree_node = ctx_node.node,
        root = tree_node
    while(root.parent !== undefined){
        root = root.parent
    }
    var module = tree_node.module || $get_module(context).module,
        src = root.src,
        line_num = tree_node.line_num
    if(context.$pos !== undefined){
        $pos = context.$pos
    }
    if(src){
        line_num = src.substr(0, $pos).split("\n").length
    }
    if(root.line_info){
        line_num = root.line_info
    }
    if(indent === undefined){
        if(msg && Array.isArray(msg)){
            $B.$SyntaxError(module, msg[0], src, $pos, line_num, root)
        }
        if(msg === "Triple string end not found"){
            // add an extra argument : used in interactive mode to
            // prompt for the rest of the triple-quoted string
            $B.$SyntaxError(module,
                'invalid syntax : triple string end not found',
                src, $pos, line_num, root)
        }
        var message = 'invalid syntax'
        if(msg && ! (msg.startsWith("token "))){
            message += ' (' + msg + ')'
        }
        $B.$SyntaxError(module, message, src, $pos, line_num, root)
    }else if(typeof indent == 'number'){
        throw $B.$IndentationError(module, msg, src, $pos, line_num, root)
    }else{
        // indent is the node that expected indentation
        throw $B.$IndentationError(module, msg, src, $pos, line_num, root,
            indent)
    }
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
    function report(wrong_type){
        if(augmented){
            $_SyntaxError(context,
                [`'${wrong_type}' is an illegal expression ` +
                    'for augmented assignment'])
        }else{
            $_SyntaxError(context, [`cannot ${action} ${wrong_type}`])
        }
    }
    while(ctx){
        if(forbidden.indexOf(ctx.type) > -1){
            $_SyntaxError(context, 'assign to ' + ctx.type)
        }else if(ctx.type == "expr"){
            var assigned = ctx.tree[0]
            if(assigned.type == "op"){
                if($B.op2method.comparisons[ctx.tree[0].op] !== undefined){
                    report('comparison')
                }else{
                    report('operator')
                }
            }else if(assigned.type == 'call'){
                report('function call')
            }else if(assigned.type == 'id'){
                var name = assigned.value
                if(['None', 'True', 'False', '__debug__'].indexOf(name) > -1){
                    report(name)
                }
                if(noassign[name] === true){
                    report(keyword)
                }
            }else if(['str', 'int', 'float', 'complex'].indexOf(assigned.type) > -1){
                report('literal')
            }else if(assigned.type == "ellipsis"){
                report('Ellipsis')
            }else if(assigned.type == 'genexpr'){
                report('generator expression')
            }else if(assigned.type == 'packed'){
                check_assignment(assigned.tree[0], {action, once: true})
            }else if(assigned.type == 'named_expr'){
                report('named expression')
            }
        }else if(ctx.type == 'list_or_tuple'){
            for(var item of ctx.tree){
                check_assignment(item, {action, once: true})
            }
        }else if(ctx.type == 'ternary'){
            report('conditional expression')
        }else if(ctx.type == 'op'){
            report('operator')
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
Class for Python abstract syntax tree
=====================================

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
    for(var node of this.children){
        var t = node.context.tree[0]
        // Ignore except / elif / else / finally : they are attributes of
        // try / for / if nodes
        // decorator is attribute of the class / def node
        if(['single_kw', 'except', 'decorator'].indexOf(t.type) > -1 ||
                (t.type == 'condition' && t.token == 'elif')){
            continue
        }
        var node_ast = ast_or_obj(node.context.tree[0])
        if(ast.expr.indexOf(node_ast.constructor) > -1){
            node_ast = new ast.Expr(node_ast)
        }
        root_ast.body.push(node_ast)
    }
    return root_ast
}

$Node.prototype.get_indent = function(){
    var indent = 0,
        node = this
    while(node.parent){
        indent++
        node = node.parent
    }
    return indent
}

$Node.prototype.insert = function(pos, child){
    // Insert child at position pos
    this.children.splice(pos, 0, child)
    child.parent = this
    child.module = this.module
}

$Node.prototype.toString = function(){
    return "<object 'Node'>"
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

$Node.prototype.to_js = function(indent){
    // Convert the node into a string with the translation in Javascript

    if(this.js !== undefined){
        return this.js
    }

    this.res = []
    this.unbound = []
    if(this.type === 'module'){
        for(var child of this.children){
            this.res.push(child.to_js())
        }
        this.js = this.res.join('')
        return this.js
    }
    indent = indent || 0
    var ctx_js = this.context.to_js()
    if(ctx_js){ // empty for "global x"
        this.res.push(' '.repeat(indent))
        this.res.push(ctx_js)
        if(this.children.length > 0){
            this.res.push('{')
        }
        this.res.push('\n')
        for(var child of this.children){
            this.res.push(child.to_js(indent + 4))
        }
        if(this.children.length > 0){
            this.res.push(' '.repeat(indent))
            this.res.push('}\n')
        }
    }
    this.js = this.res.join('')

    return this.js
}

$Node.prototype.transform = function(rank){
    // Apply transformations to each node recursively
    // Returns an offset : in case children were inserted by transform(),
    // we must jump to the next original node, skipping those that have
    // just been inserted
    if(this.awaits && this.awaits.length > 0){
        // If node has an "await" statement which is not inside a
        // comprehension, insert a node to save execution stack, so that it
        // can be restored when the awaitable is completed
        this.parent.insert(rank,
            $NodeJS("var save_stack = $B.save_stack()"))
        if(! (this.context && this.context.tree.length > 0 &&
                this.context.tree[0].type == 'return')){
            // Add node to restore execution stack
            // This is already done in $ReturnCtx.to_js() before returning the
            // value
            this.parent.insert(rank + 2,
                $NodeJS("$B.restore_stack(save_stack, $locals)"))
        }
        delete this.awaits // avoid recursion
        return 1
    }

    if(this.has_yield && ! this.has_yield.transformed){
        /* replace "RESULT = yield EXPR" by

            var result = EXPR
            try{
                leave_frame()
                RESULT = yield result
            }catch(err){
                $B.frames_stack.push($top_frame)
                throw err
            }

        so that:
        - if the evaluation of EXPR raises an exception, it happens
          in the generator scope
        - if "yield result" doesn't raise an exception, the generator
          frame is remove from the stack
        - if "yield result" raises an exception thrown by generator.throw,
          the frame is restored
        */
        var parent = this.parent
        if(this.has_yield.from){
            var new_node = new $Node()
            var new_ctx = new $NodeCtx(new_node)
            var new_expr = new $ExprCtx(new_ctx, 'js', false)
            var _id = new $RawJSCtx(new_expr, `$locals.$expr${this.has_yield.from_num}`)
            var assign = new $AssignCtx(new_expr)
            var right = new $ExprCtx(assign)
            right.tree = this.has_yield.tree
            parent.insert(rank, new_node)

            var pnode = $get_node(this.has_yield)

            var n = this.has_yield.from_num

            var replace_with = `$B.$import("sys", [], {})
            var _i${n} = _b_.iter($locals.$expr${n}),
                _r${n}
            var $failed${n} = false
            try{
                var _y${n} = _b_.next(_i${n})
            }catch(_e){
                $B.set_exc(_e)
                $failed${n} = true
                $B.pmframe = $B.last($B.frames_stack)
                _e = $B.exception(_e)
                if(_e.__class__ === _b_.StopIteration){
                    var _r${n} = $B.$getattr(_e, "value")
                }else{
                    throw _e
                }
            }
            if(! $failed${n}){
                while(true){
                    var $failed1${n} = false
                    try{
                        $B.leave_frame({$locals})
                        var _s${n} = yield _y${n}
                        $B.frames_stack.push($top_frame)
                    }catch(_e){
                        if(_e.__class__ === _b_.GeneratorExit){
                            var $failed2${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "close")
                            }catch(_e1){
                                $failed2${n} = true
                                if(_e1.__class__ !== _b_.AttributeError){
                                    throw _e1
                                }
                            }
                            if(! $failed2${n}){
                                $B.$call(_m${n})()
                            }
                            throw _e
                        }else if($B.is_exc(_e, [_b_.BaseException])){
                            var _x = $B.$call($B.$getattr($locals.sys, "exc_info"))()
                            var $failed3${n} = false
                            try{
                                var _m${n} = $B.$getattr(_i${n}, "throw")
                            }catch(err){
                                $failed3${n} = true
                                if($B.is_exc(err, [_b_.AttributeError])){
                                    throw err
                                }
                            }
                            if(! $failed3${n}){
                                try{
                                    _y${n} = $B.$call(_m${n}).apply(null,
                                        _b_.list.$factory(_x${n}))
                                }catch(err){
                                    if($B.$is_exc(err, [_b_.StopIteration])){
                                        _r${n} = $B.$getattr(err, "value")
                                        break
                                    }
                                    throw err
                                }
                            }
                        }
                    }
                    if(! $failed1${n}){
                        try{
                            if(_s${n} === _b_.None){
                                _y${n} = _b_.next(_i${n})
                            }else{
                                _y${n} = $B.$call($B.$getattr(_i${n}, "send"))(_s${n})
                            }
                        }catch(err){
                            if($B.is_exc(err, [_b_.StopIteration])){
                                _r${n} = $B.$getattr(err, "value")
                                break
                            }
                            throw err
                        }
                    }
                }
            }`

            parent.insert(rank + 1, $NodeJS(replace_with))
            return 3
        }
        parent.children.splice(rank, 1)
        if(this.has_yield.tree.length === 0){
            new_node = $NodeJS("var result = _b_.None")
        }else{
            var new_node = new $Node()
            var new_ctx = new $NodeCtx(new_node)
            var new_expr = new $ExprCtx(new_ctx, 'js', false)
            var _id = new $RawJSCtx(new_expr, 'var result')
            var assign = new $AssignCtx(new_expr)
            assign.tree[1] = this.has_yield.tree[0]
            _id.parent = assign
        }
        new_node.line_num = this.line_num
        parent.insert(rank, new_node)
        var try_node = new $NodeJS("try")
        try_node.add($NodeJS("$B.leave_frame({$locals})"))
        try_node.add(this)

        parent.insert(rank + 1, try_node)
        this.has_yield.to_js = function(){
            return 'yield result'
        }
        // set attribute "transformed" to avoid recursion in loop below
        this.has_yield.transformed = true

        // Transform children of "try" node, including "this" node
        // because in code like
        //
        //     x, y = yield value
        //
        // the multiple assignment must be transformed
        var i = 0
        while(i < try_node.children.length){
            var offset = try_node.children[i].transform(i)
            if(offset === undefined){offset = 1}
            i += offset
        }

        var catch_node = $NodeJS(`catch(err${this.line_num})`)
        catch_node.add($NodeJS("$B.frames_stack.push($top_frame)"))
        catch_node.add($NodeJS(`throw err${this.line_num}`))
        parent.insert(rank + 2, catch_node)

        parent.insert(rank + 3,
            $NodeJS("$B.frames_stack.push($top_frame)"))
        return 2
    }

    if(this.type === 'module'){
        // module doc string
        this.__doc__ = $get_docstring(this)
        var i = 0
        while(i < this.children.length){
            var offset = this.children[i].transform(i)
            if(offset === undefined){
                offset = 1
            }
            i += offset
        }
    }else{
        var elt = this.context.tree[0], ctx_offset
        if(elt === undefined){
            console.log(this)
        }
        if(elt.transform !== undefined){
            ctx_offset = elt.transform(this, rank)
        }
        var i = 0
        while(i < this.children.length){
            var offset = this.children[i].transform(i)
            if(offset === undefined){
                offset = 1
            }
            i += offset
        }
        if(ctx_offset === undefined){
            ctx_offset = 1
        }

        return ctx_offset
    }
}

$Node.prototype.clone = function(){
    var res = new $Node(this.type)
    for(var attr in this){
        res[attr] = this[attr]
    }
    return res
}

$Node.prototype.clone_tree = function(){
    var res = new $Node(this.type)
    for(var attr in this){
        res[attr] = this[attr]
    }
    res.children = []
    for(var child of this.children){
        res.add(child.clone_tree())
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

For instance, if the first token is the keyword "assert", the new_context
is an instance of class $AssertCtx, in a state where it expects an
expression.

Most contexts have an attribute "tree", a list of the elements associated
with the keyword or the syntax element (eg the arguments in a function
definition).

For contexts that need transforming the Python instruction into several
Javascript instructions, a method transform(node, rank) is defined. It is
called by the method transform() on the root node (the top level instance of
$Node).

Most contexts have a method to_js() that return the Javascript code for
this context. It is called by the method to_js() of the root node.
*/

var $AbstractExprCtx = $B.parser.$AbstractExprCtx = function(context, with_commas){
    this.type = 'abstract_expr'
    // allow expression with comma-separated values, or a single value ?
    this.with_commas = with_commas
    this.parent = context
    this.tree = []
    context.tree.push(this)
}

$AbstractExprCtx.prototype.toString = function(){
    return '(abstract_expr ' + this.with_commas + ') ' + this.tree
}

$AbstractExprCtx.prototype.transition = function(token, value){
    var context = this
    var packed = context.packed,
        is_await = context.is_await

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
            var commas = context.with_commas
            context = context.parent
            context.packed = packed
            context.is_await = is_await
    }

    switch(token) {
        case 'await':
            return new $AbstractExprCtx(new $AwaitCtx(
                new $ExprCtx(context, 'await', false)), true)
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
            return new $DictOrSetCtx(
                new $ExprCtx(context, 'dict_or_set', commas))
        case 'ellipsis':
            return new $EllipsisCtx(
                new $ExprCtx(context, 'ellipsis', commas))
        case 'not':
            if(context.type == 'op' && context.op == 'is'){ // "is not"
                context.op = 'is_not'
                return context
            }
            return new $NotCtx(new $ExprCtx(context, 'not', commas))
        case 'lambda':
            return new $LambdaCtx(new $ExprCtx(context, 'lambda', commas))
        case 'op':
            var tg = value
            switch(tg) {
                case '*':
                    context.parent.tree.pop() // remove abstract expression
                    var commas = context.with_commas
                    context = context.parent
                    return new $PackedCtx(
                        new $ExprCtx(context, 'expr', commas))
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
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
        case 'in':
            if(context.parent.type == 'op' && context.parent.op == 'not'){
                context.parent.op = 'not_in'
                return context
            }
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
        case '=':
            if(context.parent.type == "yield"){
                $_SyntaxError(context,
                    ["assignment to yield expression not possible"])
            }
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
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
                case 'annotation':
                    $_SyntaxError(context, "empty annotation")
                default:
                    $_SyntaxError(context, token)
            }
            break
        case '.':
            $_SyntaxError(context, 'token ' + token)
    }
    return $transition(context.parent, token, value)
}

$AbstractExprCtx.prototype.to_js = function(){
    this.js_processed = true
    if(this.type === 'list'){
        return '[' + $to_js(this.tree) + ']'
    }
    return $to_js(this.tree)
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
        case ':':
            context.parent.set_alias(context.tree[0].tree[0])
            return $transition(context.parent, token, value)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

var $AnnotationCtx = $B.parser.$AnnotationCtx = function(context){
    // Class for annotations, eg "def f(x:int) -> list:"
    this.type = 'annotation'
    this.parent = context
    this.tree = []
    // annotation is stored in attribute "annotations" of parent, not "tree"
    context.annotation = this

    var scope = $get_scope(context)
    if(scope.binding.__annotations__ === undefined){
        // In an imported module, __annotations__ is not defined by default
        scope.binding.__annotations__ = true
        context.create_annotations = true
    }

    if(scope.ntype == "def" && context.tree && context.tree.length > 0 &&
            context.tree[0].type == "id"){
        var name = context.tree[0].value
        if(scope.globals && scope.globals.has(name) > -1){
            $_SyntaxError(context, ["annotated name '" + name +
                "' can't be global"])
        }
        scope.annotations = scope.annotations || new Set()
        scope.annotations.add(name)
        // If name was not inside a parenthesis, it is local in the scope
        if(! context.$in_parens){
            scope.binding = scope.binding || {}
            scope.binding[name] = true
        }
    }
}

$AnnotationCtx.prototype.toString = function(){
    return '(annotation) ' + this.tree
}

$AnnotationCtx.prototype.transition = function(token, value){
    var context = this
    if(token == "eol" && context.tree.length == 1 &&
            context.tree[0].tree.length == 0){
        $_SyntaxError(context, "empty annotation")
    }else if(token == ':' && context.parent.type != "def"){
        $_SyntaxError(context, "more than one annotation")
    }else if(token == "augm_assign"){
        $_SyntaxError(context, "augmented assign as annotation")
    }else if(token == "op"){
        $_SyntaxError(context, "operator as annotation")
    }
    return $transition(context.parent, token)
}

$AnnotationCtx.prototype.to_js = function(){
    if(this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'id'){
        return `"${this.tree[0].tree[0].value}"`
    }
    return $to_js(this.tree)
}

var $AssertCtx = $B.parser.$AssertCtx = function(context){
    // Context for keyword "assert"
    this.type = 'assert'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$AssertCtx.prototype.ast = function(){
    // Assert(expr test, expr? msg)
    var msg = this.tree[1]
    return new ast.Assert(ast_or_obj(this.tree[0]),
        msg === undefined ? msg : ast_or_obj(msg))
}

$AssertCtx.prototype.toString = function(){
    return '(assert) ' + this.tree
}

$AssertCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ","){
        if(this.tree.length > 1){
            $_SyntaxError(context, "too many commas after assert")
        }
        return new $AbstractExprCtx(this, false)
    }
    if(token == 'eol'){
        return $transition(context.parent, token)
    }
    $_SyntaxError(context, token)
}

$AssertCtx.prototype.transform = function(node, rank){
    if(this.tree.length > 1){
        // form "assert condition,message"
        var condition = this.tree[0]
        var message = this.tree[1]
    }else{
        var condition = this.tree[0]
        var message = null
    }
    if(this.tree[0].type == "expr" && this.tree[0].name == "tuple" &&
            this.tree[0].tree[0].tree.length > 1){
        var warning = _b_.SyntaxWarning.$factory(
            "assertion is always true, perhaps remove parentheses?")
        var module = $get_module(this)
        // set warning attributes filename, lineno, offset, line
        $B.$syntax_err_line(warning, module.filename, module.src,
            $pos, $get_node(this).line_num)
        // module _warning is in builtin_modules.js
        $B.imported._warnings.warn(warning)
    }
    // transform "assert cond" into "if not cond: throw AssertionError"
    var new_ctx = new $ConditionCtx(node.context, 'if')
    var not_ctx = new $NotCtx(new_ctx)
    not_ctx.tree = [condition]
    node.context = new_ctx

    var js = 'throw _b_.AssertionError.$factory()'
    if(message !== null){
        js = 'throw _b_.AssertionError.$factory(_b_.str.$factory(' +
            message.to_js() + '))'
    }
    node.add($NodeJS(js))
}

function make_assign(left, right, module){
    var node = new $Node()
    node.id = module
    var context = new $NodeCtx(node) // create ordinary node
    var expr = new $ExprCtx(context, 'left', true)
    expr.tree = left.tree
    var assign = new $AssignCtx(expr) // assignment to left operand
    assign.tree[1] = new $JSCode(right)
    return node
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
    if(context.type == "expr" && context.tree[0].type == "lambda"){
        $_SyntaxError(context, ["cannot assign to lambda"])
    }

    this.type = 'assign'

    // replace parent by "this" in parent tree
    context.parent.tree.pop()
    context.parent.tree.push(this)

    this.parent = context.parent
    this.tree = [context]

    var scope = $get_scope(this)

    if(context.type == 'list_or_tuple' ||
            (context.type == 'expr' && context.tree[0].type == 'list_or_tuple')){
        if(context.type == 'expr'){
            context = context.tree[0]
        }
        // Bind all the ids in the list or tuple
        context.bind_ids(scope)
    }else if(context.type == 'assign'){
        check_assignment(context.tree[1])
        for(var elt of context.tree){
            var assigned = elt.tree[0]
            if(assigned.type == 'id'){
                $bind(assigned.value, scope, this)
            }
        }
    }else{
        var assigned = context.tree[0]
        if(assigned && assigned.type == 'id'){
            var name = assigned.value
            // Attribute bound of an id indicates if it is being
            // bound, as it is the case in the left part of an assignment
            assigned.bound = true
            if(! scope.globals || ! scope.globals.has(assigned.value)){
                // A value is going to be assigned to a name
                // After assignment the name will be bound to the current
                // scope
                // We must keep track of the list of bound names before
                // this assignment, because in code like
                //
                //    range = range
                //
                // the right part of the assignement must be evaluated
                // first, and it is the builtin "range"
                var node = $get_node(this)
                node.bound_before = Object.keys(scope.binding)
                $bind(assigned.value, scope, this)
            }else{
                // assignement to a variable defined as global : bind name at
                // module level (issue #690)
                var module = $get_module(context)
                // Set attribute global_module to simplify IdCtx.to_js()
                assigned.global_module = module.module
                $bind(assigned.value, module, this)
            }
        }else if(assigned.type == "ellipsis"){
                $_SyntaxError(context, ['cannot assign to Ellipsis'])
        }else if(assigned.type == "unary"){
            $_SyntaxError(context, ["cannot assign to operator"])
        }else if(assigned.type == "packed"){
            if(assigned.tree[0].name == 'id'){
                var id = assigned.tree[0].tree[0].value
                if(['None', 'True', 'False', '__debug__'].indexOf(id) > -1){
                    $_SyntaxError(context,
                        ['cannot assign to ' + id])
                }
            }
            // If the packed item was in a tuple (eg "a, *b = X") the
            // assignment is valid; in this case the attribute in_tuple
            // is set
            if(assigned.parent.in_tuple === undefined){
                $_SyntaxError(context,
                    ["starred assignment target must be in a list or tuple"])
            }
        }
    }
}

$AssignCtx.prototype.ast = function(){
    var value = ast_or_obj(this.tree[1]),
        targets = [],
        target = this.tree[0]
    if(target.type == 'expr' && target.tree[0].type == 'list_or_tuple'){
        target = target.tree[0]
    }
    if(target.type == 'list_or_tuple'){
        target = ast_or_obj(target)
        for(var elt of target.elts){
            elt.ctx = new ast.Store()
            if(elt instanceof ast.Starred){
                elt.value.ctx = new ast.Store()
            }
        }
        target.ctx = new ast.Store()
        targets = [target]
    }else{
        while(target.type == 'assign'){
            targets.splice(0, 0, ast_or_obj(target.tree[1]))
            target = target.tree[0]
        }
        targets.splice(0, 0, ast_or_obj(target))
        for(var tg of targets){
            tg.ctx = new ast.Store()
            if(tg instanceof ast.Tuple){
                for(var elt of tg.elts){
                    elt.ctx = new ast.Store()
                }
            }
        }
    }
    value.ctx = new ast.Load()
    if(target.annotation){
        var res = new ast.AnnAssign(
            ast_or_obj(target.tree[0]),
            ast_or_obj(target.annotation.tree[0]),
            value,
            1)
        res.target.ctx = new ast.Store()
        return res
    }
    return new ast.Assign(targets, value)
}

$AssignCtx.prototype.guess_type = function(){
    return
}

$AssignCtx.prototype.toString = function(){
    return '(assign) ' + this.tree[0] + '=' + this.tree[1]
}

$AssignCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        if(context.tree[1].type == 'abstract_expr'){
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
        }
        // If left is an id, update binding to the type of right operand
        context.guess_type()
        return $transition(context.parent, 'eol')
    }
    console.log('token', token, 'after context', context)
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$AssignCtx.prototype.transform = function(node, rank){
    // rank is the rank of this line in node
    var scope = $get_scope(this)

    var left = this.tree[0],
        right = this.tree[1],
        assigned = []

    while(left.type == 'assign'){
        assigned.push(left.tree[1])
        left = left.tree[0]
    }

    if(assigned.length > 0){
        assigned.push(left)

        // replace current node by '$tempXXX = <right>'
        var ctx = node.context
        ctx.tree = []
        var nleft = new $RawJSCtx(ctx, 'var $temp' + $loop_num)
        nleft.tree = ctx.tree
        var nassign = new $AssignCtx(nleft)
        nassign.tree[1] = right

        // create nodes with target set to right, from left to right
        for(var elt of assigned){
            if(elt.type == "expr" && elt.tree[0].type == "list_or_tuple" &&
                    elt.tree[0].real == "tuple" &&
                    elt.tree[0].tree.length == 1){
                // issue 1363
                elt = elt.tree[0].tree[0]
            }
            var new_node = new $Node(),
                node_ctx = new $NodeCtx(new_node)
            new_node.locals = node.locals
            new_node.line_num = node.line_num
            node.parent.insert(rank + 1,new_node)
            elt.parent = node_ctx
            var assign = new $AssignCtx(elt)
            new $RawJSCtx(assign, '$temp' + $loop_num)
        }
        $loop_num++
        this.tree[0] = left
        return
    }

    var left_items = null
    switch(left.type){
        case 'expr':
            if(left.tree.length > 1){
                left_items = left.tree
            }else if(left.tree[0].type == 'list_or_tuple' ||
                    left.tree[0].type == 'target_list'){
                left_items = left.tree[0].tree
            }else if(left.tree[0].type == 'id'){
                // simple assign : set attribute "bound" for name resolution
                var name = left.tree[0].value
                // check if name in globals
                if(scope.globals && scope.globals.has(name)){
                }else{
                    left.tree[0].bound = true
                }
            }
            break
        case 'target_list':
        case 'list_or_tuple':
            left_items = left.tree
    }

    var right = this.tree[1]
    if(left_items === null){
        if(left.tree[0].bound){
            if(right.type == "expr" && right.name == "int"){
                node.bindings = node.bindings || {}
                node.bindings[left.tree[0].value] = "int"
            }
        }
        return
    }

    var right_items = null
    if(right.type == 'list' || right.type == 'tuple'||
            (right.type == 'expr' && right.tree.length > 1)){
        right_items = right.tree
    }

    if(right_items !== null){ // form x, y = a, b
        if(right_items.length > left_items.length){
            throw Error('ValueError : too many values to unpack (expected ' +
                left_items.length + ')')
        }else if(right_items.length < left_items.length){
            throw Error('ValueError : need more than ' +
                right_items.length + ' to unpack')
        }
        var new_nodes = [],
            pos = 0
        // replace original line by dummy line : the next one might also
        // be a multiple assignment
        var new_node = new $Node()
        new_node.line_num = node.line_num
        new $NodeJSCtx(new_node,'void(0)')
        new_nodes[pos++] = new_node

        var $var = '$temp' + $loop_num
        var new_node = new $Node()
        new_node.line_num = node.line_num
        new $NodeJSCtx(new_node, 'var ' + $var + ' = [], $pos = 0')
        new_nodes[pos++] = new_node

        for(var right_item of right_items){
            var js = $var + '[$pos++] = ' + right_item.to_js()
            var new_node = new $Node()
            new_node.line_num = node.line_num
            new $NodeJSCtx(new_node, js)
            new_nodes[pos++] = new_node
        }
        var this_node = $get_node(this)
        for(var left_item of left_items){
            var new_node = new $Node()
            new_node.id = this_node.module
            new_node.locals = this_node.locals
            new_node.line_num = node.line_num
            var context = new $NodeCtx(new_node) // create ordinary node
            left_item.parent = context
            // assignment to left operand
            // set "check_unbound" to false
            var assign = new $AssignCtx(left_item, false)
            assign.tree[1] = new $JSCode($var + '[' + i + ']')
            new_nodes[pos++] = new_node
        }
        node.parent.children.splice(rank,1) // remove original line
        for(var i = new_nodes.length - 1; i >= 0; i--){
            node.parent.insert(rank, new_nodes[i])
        }
        $loop_num++
    }else{ // form x, y = a

        node.parent.children.splice(rank, 1) // remove original line

        // evaluate right argument (it might be a function call)
        var rname = create_temp_name('$right')
        var rlname = create_temp_name('$rlist');

        var new_node = $NodeJS('var ' + rname + ' = ' +
                '$B.$getattr($B.$iter(' + right.to_js() +
                '), "__next__");')

        new_node.line_num = node.line_num // set attribute line_num for debugging
        node.parent.insert(rank++, new_node)

        node.parent.insert(rank++,
            $NodeJS('var '+rlname+'=[], $pos=0;'+
            'while(1){\n'+
                'try{\n' +
                    rlname + '[$pos++] = ' + rname +'()' +
                '}catch(err){\n'+
                   'break'+
                '}'+
            '}')
        )

        // If there is a packed tuple in the list of left items, store
        // its rank in the list
        var packed = null
        var min_length = left_items.length
        for(var i = 0; i < left_items.length; i++){
            var expr = left_items[i]
            if(expr.type == 'packed' ||
                    (expr.type == 'expr' && expr.tree[0].type == 'packed')){
                packed = i
                min_length--
                break
            }
        }

        // Test if there were enough values in the right part
        node.parent.insert(rank++,
            $NodeJS('if(' + rlname + '.length<' + min_length + '){\n' +
                'throw _b_.ValueError.$factory('+
                   '"need more than " +' + rlname +
                   '.length + " value" + (' + rlname +
                   '.length > 1 ?' + ' "s" : "") + " to unpack")}'
           )
        )

         // Test if there were enough variables in the left part
        if(packed == null){
            node.parent.insert(rank++,
                $NodeJS('if(' + rlname + '.length>' + min_length + '){\n' +
                    'throw _b_.ValueError.$factory(' +
                       '"too many values to unpack ' +
                       '(expected ' + left_items.length + ')"'+
                    ')'+
                '}')
            )
        }


        left_items.forEach(function(left_item, i){

            var new_node = new $Node()
            new_node.id = scope.id
            new_node.line_num = node.line_num
            node.parent.insert(rank++, new_node)
            var context = new $NodeCtx(new_node) // create ordinary node
            left_item.parent = context
            left_item.in_tuple = true
            // assignment to left operand
            var assign = new $AssignCtx(left_item, false)
            var js = rlname
            if(packed == null || i < packed){
                js += '[' + i + ']'
            }else if(i == packed){
                js += '.slice(' + i + ',' + rlname + '.length-' +
                      (left_items.length - i - 1) + ')'
            }else{
                js += '[' + rlname + '.length-' + (left_items.length - i) + ']'
            }
            assign.tree[1] = new $JSCode(js) // right part of the assignment
        })

        $loop_num++
    }
}

$AssignCtx.prototype.to_js = function(){
    this.js_processed = true
    if(this.parent.type == 'call'){ // like in foo(x=0)
        return '{$nat:"kw",name:' + this.tree[0].to_js() +
            ',value:' + this.tree[1].to_js() + '}'
    }

    // assignment
    var left = this.tree[0]
    while(left.type == 'expr'){left = left.tree[0]}

    var right = this.tree[1]
    if(left.type == 'attribute' || left.type == 'sub'){
        // In case of an assignment to an attribute or a subscript, we
        // use setattr() and setitem
        // If the right part is a call to exec or eval, it must be
        // evaluated and stored in a temporary variable, before
        // setting the attribute to this variable
        // This is because the code generated for exec() or eval()
        // can't be inserted as the third parameter of a function

        var right_js = right.to_js()

        var res = '', rvar = '', $var = '$temp' + $loop_num
        if(right.type == 'expr' && right.tree[0] !== undefined &&
                right.tree[0].type == 'call' &&
                ('eval' == right.tree[0].func.value ||
                'exec' == right.tree[0].func.value)) {
            res += 'var ' + $var + ' = ' + right_js + ';\n'
            rvar = $var
        }else if(right.type == 'expr' && right.tree[0] !== undefined &&
                right.tree[0].type == 'sub'){
            res += 'var ' + $var + ' = ' + right_js + ';\n'
            rvar = $var
        }else{
            rvar = right_js
        }

        if(left.type == 'attribute'){ // assign to attribute
          $loop_num++
          left.func = 'setattr'
          var left_to_js = left.to_js()
          left.func = 'getattr'
          if(left.assign_self){
            return res + left_to_js[0] + rvar + left_to_js[1] + rvar + ')'
          }
          res += left_to_js
          res = res.substr(0, res.length - 1) // remove trailing )
          return res + ',' + rvar + ');_b_.None;'
        }
        if(left.type == 'sub'){ // assign to item

          var seq = left.value.to_js(),
              temp = '$temp' + $loop_num,
              type
          if(left.value.type == 'id'){
              type = $get_node(this).locals[left.value.value]
          }
          $loop_num++
          var res = 'var ' + temp + ' = ' + seq + '\n'
          if(type !== 'list'){
              res += 'if(Array.isArray(' + temp + ') && !' +
                  temp + '.__class__){\n'
          }
          if(left.tree.length == 1){
              res += '$B.set_list_key(' + temp + ',' +
                  (left.tree[0].to_js() + '' || 'null') + ',' +
                  right.to_js() + ')'
          }else if(left.tree.length == 2){
              res += '$B.set_list_slice(' + temp + ',' +
                  (left.tree[0].to_js() + '' || 'null') + ',' +
                  (left.tree[1].to_js() + '' || 'null') + ',' +
                  right.to_js() + ')'
          }else if(left.tree.length == 3){
              res += '$B.set_list_slice_step(' + temp + ',' +
                  (left.tree[0].to_js() + '' || 'null') + ',' +
                  (left.tree[1].to_js() + '' || 'null') + ',' +
                  (left.tree[2].to_js() + '' || 'null') + ',' +
                  right.to_js() + ')'
          }
          if(type == 'list'){return res}
          res += '\n}else{\n'
          if(left.tree.length == 1){
              res += '$B.$setitem(' + left.value.to_js() +
                  ',' + left.tree[0].to_js() + ',' + right_js + ')};_b_.None;'
          }else{
              left.func = 'setitem' // just for to_js()
              res += left.to_js()
              res = res.substr(0, res.length - 1) // remove trailing )
              left.func = 'getitem' // restore default function
              res += ',' + right_js + ')};_b_.None;'
          }
          return res
        }
    }
    return left.to_js() + ' = ' + right.to_js()
}

var $AsyncCtx = $B.parser.$AsyncCtx = function(context){
    // Class for async : def, while, for
    this.type = 'async'
    this.parent = context
    context.async = true

}

$AsyncCtx.prototype.toString = function(){return '(async)'}

$AsyncCtx.prototype.transition = function(token, value){
    var context = this
    if(token == "def"){
        return $transition(context.parent, token, value)
    }else if(token == "for" || token == "with"){
        var ntype = $get_scope(context).ntype
        if(ntype !== "def" && ntype != "generator"){
            $_SyntaxError(context, ["'async " + token +
                "' outside async function"])
        }
        var ctx = $transition(context.parent, token, value)
        ctx.parent.async = true // set attr "async" of for/with context
        return ctx
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

var $AttrCtx = $B.parser.$AttrCtx = function(context){
    // Class for object attributes (eg x in obj.x)
    this.type = 'attribute'
    this.value = context.tree[0]
    this.parent = context
    context.tree.pop()
    context.tree[context.tree.length] = this
    this.tree = []
    this.func = 'getattr' // becomes setattr for an assignment
}

$AttrCtx.prototype.ast = function(){
    // ast.Attribute(value, attr, ctx)
    var value = ast_or_obj(this.value),
        attr = this.unmangled_name,
        ctx = new ast.Load()
    if(this.func == 'setattr'){
        ctx = new ast.Store()
    }else if(this.func == 'delattr'){
        ctx = new ast.Delete()
    }
    return new ast.Attribute(value, attr, ctx)
}

$AttrCtx.prototype.toString = function(){return '(attr) ' + this.value + '.' + this.name}

$AttrCtx.prototype.transition = function(token, value){
    var context = this
    if(token === 'id'){
        var name = value
        if(name == '__debug__'){
            $_SyntaxError(context, ['cannot assign to __debug__'])
        }else if(noassign[name] === true){
            $_SyntaxError(context, `'${name}' cannot be an attribute`)
        }
        context.unmangled_name = name
        name = $mangle(name, context)
        context.name = name
        return context.parent
    }
    $_SyntaxError(context,token)
}

$AttrCtx.prototype.to_js = function(){
    this.js_processed = true
    var js = this.value.to_js()
    if(this.func == "setattr" && this.value.type == "id"){
        var scope = $get_scope(this),
            parent = scope.parent
        if(scope.ntype == "def"){
            if(parent.ntype == "class"){
                var params = scope.context.tree[0].positional_list
                if(this.value.value == params[0] && parent.context &&
                        parent.context.tree[0].args === undefined){
                    // set attr to instance of a class without a parent
                    this.assign_self = true
                    return [js + ".__class__ && " + js + ".__dict__ && !" +
                        js + ".__class__.$has_setattr && ! " + js +
                        ".$is_class ? _b_.dict.$setitem(" + js +
                        ".__dict__, '" + this.name +
                        "', ", ") : $B.$setattr(" + js +
                        ', "' + this.name + '", ']
                }
            }
        }

    }
    if(this.func == 'setattr'){
        // For setattr, use $B.$setattr which doesn't use $B.args to parse
        // the arguments
        return '$B.$setattr(' + js + ',"' + this.name + '")'
    }else{
        return '$B.$getattr(' + js + ',"' + this.name + '")'
    }
}

var $AugmentedAssignCtx = $B.parser.$AugmentedAssignCtx = function(context, op){
    // Class for augmented assignments such as "+="

    check_assignment(context, {augmented: true})

    this.type = 'augm_assign'
    this.context = context
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree[context.parent.tree.length] = this
    this.op = op
    this.tree = [context]

    var scope = this.scope = $get_scope(this)

    if(context.type == 'expr'){
        var assigned = context.tree[0]
        if(assigned.type == 'id'){
            var name = assigned.value
            if((scope.ntype == 'def' || scope.ntype == 'generator') &&
                    (! scope.binding.hasOwnProperty(name))){
                if(scope.globals === undefined ||
                        ! scope.globals.has(name)){
                    // Augmented assign to a variable not yet defined in
                    // local scope : set attribute "unbound" to the id. If not
                    // defined in the rest of the block this will raise an
                    // UnboundLocalError
                    assigned.unbound = true
                }
            }
        }
    }

    // Store the names already bound
    $get_node(this).bound_before = Object.keys(scope.binding)

    this.module = scope.module

}

$AugmentedAssignCtx.prototype.ast = function(){
    // AugAssign(expr target, operator op, expr value)
    var target = ast_or_obj(this.tree[0]),
        value = ast_or_obj(this.tree[1])
    target.ctx = new ast.Store()
    value.ctx = new ast.Load()
    var op = this.op.substr(0, this.op.length -1),
        ast_type_class = op2ast_class[op],
        ast_class = ast_type_class[1]

    return new ast.AugAssign(target, new ast_class(), value)
}

$AugmentedAssignCtx.prototype.toString = function(){
    return '(augm assign) ' + this.tree
}

$AugmentedAssignCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        if(context.tree[1].type == 'abstract_expr'){
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
        }
        return $transition(context.parent, 'eol')
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$AugmentedAssignCtx.prototype.to_js = function(){

    var target = this.tree[0].tree[0]
    if(target.type == 'id'){
        var left_bound_to_int =
            this.tree[0].tree[0].bindingType(this.scope) == "int"
        var target_scope = find_scope(target.value, $get_scope(this)),
            scope_ref
        if(target_scope === undefined){
            // name is not referenced
            scope_ref = '$locals'
        }else{
            scope_ref = '$locals_' + target_scope.id.replace(/\./g, '_')
        }
        target.augm_assign = true
        var right = this.tree[1].tree[0]
        if(right.type == 'int'){
            var right_value = parseInt(right.value[1], right.value[0])
            if(right_value < $B.max_int && right_value > $B.min_int){
                var left_bound_to_int =
                    this.tree[0].tree[0].bindingType(this.scope) == "int"
                if(left_bound_to_int && this.op !== '//='){
                    // shortcut if right value is an integer and left is an id
                    // that was last bound to an integer (determined by source
                    // code analysis)
                    var op1 = this.op.substr(0, this.op.length - 1),
                        tg_js = target.to_js()
                    return `${scope_ref}['${target.value}'] = ` +
                        `(typeof ${tg_js} == "number" && $B.is_safe_int(`+
                        `$locals.$result = ${tg_js} ${op1} ${right.to_js()}` +
                        `)) ? $locals.$result : $B.augm_assign(${tg_js}, ` +
                        `'${this.op}', ${right.to_js()})`
                }
            }
        }
        var right = this.tree[1].to_js()
        return `${scope_ref}['${target.value}'] = ` +
            `$B.augm_assign(${target.to_js()}, '${this.op}', ` +
            right + ')'
    }else if(target.type == 'sub'){
        return `$B.$setitem(($locals.$tg = ${target.value.to_js()}), ` +
            `($locals.$key = ${target.tree[0].to_js()}), $B.augm_assign($B.$getitem(` +
            `$locals.$tg, $locals.$key), '${this.op}', ${this.tree[1].to_js()}))`
    }else if(target.type == 'attribute'){
        return `$B.$setattr(($locals.$tg = ${target.value.to_js()}), ` +
            `'${target.name}', $B.augm_assign($B.$getattr(` +
            `$locals.$tg, '${target.name}'), '${this.op}', ${this.tree[1].to_js()}))`
    }
    return ''
}


var $AwaitCtx = $B.parser.$AwaitCtx = function(context){
    // Class for "await"
    this.type = 'await'
    this.parent = context
    this.tree = []
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
    return new ast.Await(ast_or_obj(this.tree[0]))
}

$AwaitCtx.prototype.transition = function(token, value){
    var context = this
    context.parent.is_await = true
    return $transition(context.parent, token, value)
}

$AwaitCtx.prototype.to_js = function(){
    return `await $B.promise(${$to_js(this.tree)})`
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

var set_loop_context = $B.parser.set_loop_context = function(context, kw){
    // For keywords "continue" and "break"
    // "this" is the instance of $BreakCtx or $ContinueCtx
    // We search the loop to "break" or "continue"
    // The attribute loop_ctx of "this" is set to the loop context
    // The attribute "has_break" or "has_continue" is set on the loop context
    var ctx_node = context
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
    var tree_node = ctx_node.node
    var loop_node = tree_node.parent
    var break_flag = false
    while(1){
        if(loop_node.type == 'module'){
            // "break" is not inside a loop
            $_SyntaxError(context, kw + ' outside of a loop')
        }else{
            var ctx = loop_node.context.tree[0]

            if(ctx.type == 'condition' && ctx.token == 'while'){
                this.loop_ctx = ctx
                ctx['has_' + kw] = true
                break
            }

            switch(ctx.type){
                case 'for':
                    this.loop_ctx = ctx
                    ctx['has_' + kw] = true
                    break_flag = true
                    break
                case 'def':
                case 'generator':
                case 'class':
                    // "break" must not be inside a def or class, even if they
                    // are enclosed in a loop
                    $_SyntaxError(context, kw + ' outside of a loop')
                default:
                    loop_node = loop_node.parent
            }
            if(break_flag){break}
        }
    }
}

var $BreakCtx = $B.parser.$BreakCtx = function(context){
    // Used for the keyword "break"
    // A flag is associated to the enclosing "for" or "while" loop
    // If the loop exits with a break, this flag is set to true
    // so that the "else" clause of the loop, if present, is executed

    this.type = 'break'

    this.parent = context
    context.tree[context.tree.length] = this
    // set information related to the associated loop
    set_loop_context.apply(this, [context, 'break'])
}

$BreakCtx.prototype.ast = function(){
    return new ast.Break()
}

$BreakCtx.prototype.toString = function(){return 'break '}

$BreakCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        return $transition(context.parent, 'eol')
    }
    $_SyntaxError(context, token)
}

$BreakCtx.prototype.to_js = function(){
    this.js_processed = true
    var res = ';$no_break' + this.loop_ctx.loop_num + ' = false'

    if(this.loop_ctx.type != 'asyncfor'){
        res += ';break'
    }else{
        res += ';throw _b_.StopIteration.$factory(' +
            this.loop_ctx.loop_num + ')'
    }
    return res
}

var $CallArgCtx = $B.parser.$CallArgCtx = function(context){
    // Base class for arguments in a function call
    this.type = 'call_arg'
    this.parent = context
    this.start = $pos
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
}

$CallArgCtx.prototype.toString = function(){
    return 'call_arg ' + this.tree
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
            // comprehension
            if(this.parent.tree.length > 1){
                $_SyntaxError(context,
                    "non-parenthesized generator expression")
            }
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
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case ')':
            if(context.parent.kwargs &&
                    $B.last(context.parent.tree).tree[0] && // if call ends with ,)
                    ['kwarg', 'star_arg', 'double_star_arg'].
                        indexOf($B.last(context.parent.tree).tree[0].type) == -1){
                $_SyntaxError(context,
                    ['non-keyword argument after keyword argument'])
            }
            return $transition(context.parent,token)
        case ':':
            if(context.expect == ',' &&
                    context.parent.parent.type == 'lambda') {
                return $transition(context.parent.parent, token)
            }
            break
        case ',':
            if(context.expect == ','){
                if(context.parent.kwargs &&
                        ['kwarg','star_arg', 'double_star_arg'].
                            indexOf($B.last(context.parent.tree).tree[0].type) == -1){
                    $_SyntaxError(context,
                        ['non-keyword argument after keyword argument'])
                }
                return $transition(context.parent, token, value)
            }
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$CallArgCtx.prototype.to_js = function(){
    this.js_processed = true
    return $to_js(this.tree)
}

var $CallCtx = $B.parser.$CallCtx = function(context){
    // Context of a call on a callable, ie what is inside the parenthesis
    // in "callable(...)"
    this.type = 'call'
    this.func = context.tree[0]
    if(this.func !== undefined){ // undefined for lambda
        this.func.parent = this
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

    if(this.func && this.func.type == "attribute" && this.func.name == "wait"
        && this.func.value.type == "id" && this.func.value.value == "time"){
        console.log('call', this.func)
        $get_node(this).blocking = {'type': 'wait', 'call': this}
    }

    if(this.func && this.func.value == 'input'){
        $get_node(this).blocking = {'type': 'input'}
    }

}

$CallCtx.prototype.ast = function(){
    var res = new ast.Call(ast_or_obj(this.func), [], [])
    for(var call_arg of this.tree){
        if(call_arg.type == 'double_star_arg'){
            var value = ast_or_obj(call_arg.tree[0].tree[0]),
                keyword = new ast.keyword(_b_.None, value)
            delete keyword.arg
            res.keywords.push(keyword)
        }else if(call_arg.type == 'star_arg'){
            var starred = new ast.Starred(ast_or_obj(call_arg.tree[0]))
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
                res.keywords.push(new ast.keyword(item.tree[0].value,
                    ast_or_obj(item.tree[1])))
            }else{
                res.args.push(ast_or_obj(item))
            }
        }
    }
    return res
}

$CallCtx.prototype.toString = function(){
    return '(call) ' + this.func + '(' + this.tree + ')'
}

$CallCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case ',':
            if(context.expect == 'id'){$_SyntaxError(context, token)}
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
            $_SyntaxError(context, token)
        case 'yield':
            $_SyntaxError(context, token)
    }

    return $transition(context.parent, token, value)
}

$CallCtx.prototype.to_js = function(){
    this.js_processed = true

    if(this.tree.length > 0){
        if(this.tree[this.tree.length - 1].tree.length == 0){
            // from "foo(x,)"
            this.tree.pop()
        }
    }
    var func_js = this.func.to_js()
    if(this.func !== undefined) {
        switch(this.func.value) {
            case 'classmethod':
                return '_b_.classmethod.$factory(' + $to_js(this.tree) + ')'
            default:
                if(this.func.type == 'unary'){
                   // form " -(x + 2) "
                   var res = '$B.$getattr(' + $to_js(this.tree)
                   switch(this.func.op) {
                      case '+':
                        return res + ',"__pos__")()'
                      case '-':
                        return res + ',"__neg__")()'
                      case '~':
                        return res + ',"__invert__")()'
                   }
                }
        }

        var _block = false

        // build positional arguments list and keyword arguments object
        var positional = [],
            kw_args = [],
            star_args = false,
            dstar_args = []

        for(var arg of this.tree){
            var type
            switch(arg.type){
                case 'star_arg':
                    star_args = true
                    positional.push([arg.tree[0].tree[0].to_js(), '*'])
                    break
                case 'double_star_arg':
                    dstar_args.push(arg.tree[0].tree[0].to_js())
                    break
                case 'id':
                    positional.push([arg.to_js(), 's'])
                    break
                default:
                    type = arg.tree[0].type
                    switch(type){
                        case 'expr':
                            positional.push([arg.to_js(), 's'])
                            break
                        case 'kwarg':
                            kw_args.push(arg.tree[0].tree[0].value +
                                ':' + arg.tree[0].tree[1].to_js())
                            break
                        case 'list_or_tuple':
                        case 'op':
                            positional.push([arg.to_js(), 's'])
                            break
                        default:
                            positional.push([arg.to_js(), 's'])
                            break
                    }
                    break
            }
        }

        var args_str

        if(star_args){
            // If there are "star arguments", eg in f(*t, 1, 2, *(8,))
            // the argument is a list such as
            // list(t).concat([1, 2]).concat(list((8, )))
            // This argument will be passed as the argument "args" in a
            // call f.apply(null, args)
            var p = []
            for(var i = 0, len = positional.length; i < len; i++){
                arg = positional[i]
                if(arg[1] == '*'){ // star argument
                    p.push('_b_.list.$factory(' + arg[0] + ')')
                }else{
                    var elt = [positional[i][0]]
                    // list the following arguments until the end, or
                    // until the next star argument
                    i++
                    while(i < len && positional[i][1] == 's'){
                        elt.push(positional[i][0])
                        i++
                    }
                    i--
                    p.push('[' + elt.join(',') + ']')
                }
            }
            args_str = p[0]
            for(var i = 1; i < p.length; i++){
                args_str += '.concat(' + p[i] + ')'
            }
        }else{
            for(var i = 0, len = positional.length; i < len; i++){
                positional[i] = positional[i][0]
            }
            args_str = positional.join(', ')
        }

        var kw_args_str = '{' + kw_args.join(', ') + '}'
        if(dstar_args.length){
            kw_args_str = '{$nat:"kw",kw:[' + kw_args_str + ',' +
                dstar_args.join(', ') + ']}'
        }else if(kw_args_str != '{}'){
            kw_args_str = '{$nat:"kw",kw:' + kw_args_str + '}'
        }else{
            kw_args_str = ''
        }

        if(star_args && kw_args_str){
            args_str += '.concat([' + kw_args_str + '])'
        }else{
            if(args_str && kw_args_str){args_str += ',' + kw_args_str}
            else if(!args_str){args_str = kw_args_str}
        }

        if(star_args){
            // If there are star args, we use an internal function
            // $B.extend_list to produce the list of positional
            // arguments. In this case the function must be called
            // with apply
            args_str = '.apply(null,' + args_str + ')'
        }else{
            args_str = '(' + args_str + ')'
        }

        var default_res = "$B.$call(" + func_js + ")" + args_str

        if(this.tree.length > -1 && this.func.type == 'id' &&
                this.func.is_builtin){
            // simplify code for built-in functions and classes
            var classes = ["complex", "bytes", "bytearray",
                "object", "memoryview", "int", "float", "str",
                "list", "tuple", "dict", "set", "frozenset",
                "range", "slice", "zip", "bool", "type",
                "classmethod", "staticmethod", "enumerate",
                "reversed", "property", "$$super", "zip", "map",
                "filter"]
            if($B.builtin_funcs[this.func.value] !== undefined){
                if(classes.indexOf(this.func.value) == -1){
                    // built-in function
                    return func_js + args_str
                }else{
                    // built-in class
                    return func_js + ".$factory" + args_str
                }
            }
        }

        return default_res
    }
}

var $CaseCtx = $B.parser.$CaseCtx = function(node_ctx){
    // node already has an expression with the id "match"
    this.type = "case"
    node_ctx.tree = [this]
    this.parent = node_ctx
    this.tree = []
    this.expect = 'as'
}

$CaseCtx.prototype.ast = function(){
    // ast.match_case(pattern, guard, body)
    // pattern : the match pattern that the subject will be matched against
    // guard : an expression that will be evaluated if the pattern matches the subject
    return new ast.match_case(ast_or_obj(this.tree[0]),
        this.has_guard ? ast_or_obj(this.tree[1].tree[0]) : undefined,
        ast_body(this.parent))
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
            $_SyntaxError(context, ['expected :'])
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
            $_SyntaxError(context, ['expected :'])
    }
}

$CaseCtx.prototype.to_js = function(){
    var node = $get_node(this),
        rank = node.parent.children.indexOf(node),
        prefix = rank == 0 ? 'if' : 'else if'
    // since statement is "if", $add_line_num doesn't insert a node with the
    // line number
    if(this.has_guard){
        // Guard is added as the final condition. The code is derived from the
        // one generated by guard.to_js(), which has the form "if(...)", by
        // removing the leading "if(" and the trailing ")"
        var guard = this.tree.pop(),
            guard_js = guard.to_js().substr(3), // remove leading "if("
            guard_js = guard_js.substr(0, guard_js.length - 1) // trailing ")"
    }
    return prefix + '(($locals.$line_info="' + node.line_num + ',' +
        node.module + '") && $B.pattern_match(subject, ' + $to_js(this.tree) +
        (this.alias ? `, {as: "${this.alias.value}"}` : '') + ')' +
        (this.has_guard ? ' && ' + guard_js : '') + ')'

}

var $ClassCtx = $B.parser.$ClassCtx = function(context){
    // Class for keyword "class"
    this.type = 'class'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'

    var scope = this.scope = $get_scope(this)
    this.parent.node.parent_block = scope
    this.parent.node.bound = {} // will store the names bound in the function
    // stores names bound in the class scope
    this.parent.node.binding = {
        __annotations__: true
    }
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
                    ast_or_obj(arg.tree[0].tree[1])))
            }else{
                bases.push(ast_or_obj(arg.tree[0]))
            }
        }
    }
    return new ast.ClassDef(this.name, bases, keywords,
                            ast_body(this.parent), decorators)
}

$ClassCtx.prototype.toString = function(){
    return '(class) ' + this.name + ' ' + this.tree + ' args ' + this.args
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
            return new $CallCtx(context)
        case ':':
            if(this.args){
                for(var arg of this.args.tree){
                    var param = arg.tree[0]
                    if((param.type == 'expr' && param.name == 'id') ||
                            param.type == "kwarg"){
                        continue
                    }
                    $_SyntaxError(context, 'invalid class parameter')
                }
            }
            return $BodyCtx(context)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$ClassCtx.prototype.set_name = function(name){
    var context = this.parent
    this.random = $B.UUID()
    this.name = name
    this.id = context.node.module + '_' + name + '_' + this.random
    this.binding = {}
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

    // bind name
    $bind(name, scope, this)

    // if function is defined inside another function, add the name
    // to local names
    if(scope.is_function){
        if(scope.context.tree[0].locals.indexOf(name) == -1){
            scope.context.tree[0].locals.push(name)
        }
    }
}

$ClassCtx.prototype.transform = function(node, rank){
    // doc string
    this.doc_string = $get_docstring(node)
    this.module = $get_module(this).module.replace(/\./g, '_')

    var indent = '\n' + ' '.repeat(node.indent + 12),
        instance_decl = new $Node(),
        local_ns = '$locals_' + this.id.replace(/\./g, '_'),
        js = 'var ' + local_ns + ' = {' +
             '__annotations__: $B.empty_dict()}, ' +
             indent + '$locals = ' + local_ns

    new $NodeJSCtx(instance_decl, js)
    node.insert(0, instance_decl)

    // Get id of global scope
    var global_scope = this.scope
    while(global_scope.parent_block.id !== '__builtins__'){
        global_scope = global_scope.parent_block
    }
    var global_ns = '$locals_' + global_scope.id.replace(/\./g, '_')

    var js = ' '.repeat(node.indent + 4) +
             '$locals.$name = "' + this.name + '"' + indent +
             '$locals.$qualname = "' + this.qualname + '"' + indent +
             '$locals.$is_class = true; ' + indent +
             '$locals.$line_info = "' + node.line_num + ',' +
             this.module + '";' + indent +
             'var $top_frame = ["' + local_ns +'", $locals,' + '"' +
             global_scope.id + '", ' + global_ns + ']' +
             indent + '$locals.$f_trace = $B.enter_frame($top_frame);' +
             indent + 'if($locals.$f_trace !== _b_.None){\n' +
             '$locals.$f_trace = $B.trace_line()}'
    node.insert(1, $NodeJS(js))

    // exit frame
    node.add($NodeJS('if($locals.$f_trace !== _b_.None){\n' +
        '$B.trace_return(_b_.None)}'))
    node.add($NodeJS('$B.leave_frame({$locals})'))
    // return local namespace at the end of class definition
    var ret_obj = new $Node()
    new $NodeJSCtx(ret_obj, 'return ' + local_ns + ';')
    node.insert(node.children.length, ret_obj)

    // close function and run it
    var run_func = new $Node()
    new $NodeJSCtx(run_func, ')();')
    node.parent.insert(rank + 1, run_func)

    var module_name = '$locals_' + this.module + '.__name__'

    rank++
    node.parent.insert(rank + 1,
        $NodeJS('$' + this.name + '_' + this.random + ".__module__ = " +
            module_name))

    // class constructor
    var scope = $get_scope(this)
    var name_ref = ';$locals_' + scope.id.replace(/\./g, '_')
    name_ref += '["' + this.name + '"]'

    var js = [name_ref + ' = $B.$class_constructor("' + this.name],
        pos = 1
    js[pos++] = '", $' + this.name + '_' + this.random
    if(this.args !== undefined){ // class def has arguments
        var arg_tree = this.args.tree,
            args = [],
            kw = []

        for(var _tmp of arg_tree){
            if(_tmp.tree[0].type == 'kwarg'){kw.push(_tmp.tree[0])}
            else{args.push(_tmp.to_js())}
        }
        js[pos++] = ', _b_.tuple.$factory([' + args.join(',') + ']),['
        // add the names - needed to raise exception if a value is undefined
        var _re = new RegExp('"', 'g'),
            _r = [],
            rpos = 0
        for(var arg of args){
            _r[rpos++] = '"' + arg.replace(_re, '\\"') + '"'
        }
        js[pos++] = _r.join(',') + ']'

        _r = []
        rpos = 0
        for(var _tmp of kw){
            _r[rpos++] = '["' + _tmp.tree[0].value + '",' +
              _tmp.tree[1].to_js() + ']'
        }
        js[pos++] = ',[' + _r.join(',') + ']'

    }else{ // form "class foo:"
        js[pos++] = ', _b_.tuple.$factory([]),[],[]'
    }
    js[pos++] = ')'
    var cl_cons = new $Node()
    new $NodeJSCtx(cl_cons, js.join(''))
    rank++
    node.parent.insert(rank + 1, cl_cons)

    // add doc string
    rank++
    var ds_node = new $Node()
    js = name_ref + '.__doc__ = ' + (this.doc_string || '_b_.None') + ';'
    new $NodeJSCtx(ds_node, js)
    node.parent.insert(rank + 1, ds_node)

    // if class is defined at module level, add to module namespace
    if(scope.ntype == 'module'){
        var w_decl = new $Node()
        new $NodeJSCtx(w_decl, '$locals["' + this.name + '"] = ' +
            this.name)
    }
    // end by None for interactive interpreter
    node.parent.insert(rank + 2, $NodeJS("_b_.None;"))

    this.transformed = true

}

$ClassCtx.prototype.to_js = function(){
    this.js_processed = true
    return 'var $' + this.name + '_' + this.random + ' = (function()'
}

var Comprehension = {
    admin_infos: function(comp){
        var id = comp.id,
            node = $get_node(comp)
        return `var $locals_${id} = {},
            $locals = $locals_${id}
        $locals.$line_info = '${node.line_num},${node.module}'\n` +
        Comprehension.code(comp) +
        `var $top_frame = ["${id}", $locals_${id}, "${comp.module}", $locals_${comp.module_ref}]
        $locals.$f_trace = $B.enter_frame($top_frame)
        `
    },
    code: function(comp){
        var node = $get_node(comp),
            varnames = Object.keys(comp.varnames || {}).map(x => `'${x}'`).join(', ')
        return `$locals.$comp_code = {
            co_argcount: 1,
            co_firstlineno:${node.line_num},
            co_name: "<${comp.type}>",
            co_flags: ${comp.type == 'genexpr' ? 115 : 83},
            co_freevars: $B.fast_tuple([]),
            co_kwonlyargcount: 0,
            co_posonlyargount: 0,
            co_varnames: $B.fast_tuple(['.0', ${varnames}])
        }
        $locals['.0'] = expr\n`
    },
    generators: function(comp){
        // Return a list of comprehensions
        // ast.comprehension(target, iter, ifs, is_async)
        var comprehensions = []
        for(item of comp){
            if(item.type == 'for'){
                comprehensions.push(
                    new ast.comprehension(
                        ast_or_obj(item.tree[0]),
                        ast_or_obj(item.tree[1]),
                        [],
                        item.is_async ? 1 : 0
                    )
                )
            }else{
                $B.last(comprehensions).ifs.push(ast_or_obj(item.tree[0]))
            }
        }
        return comprehensions
    },
    make_comp: function(comp, context){
        comp.comprehension = true
        comp.parent = context.parent
        comp.binding = {}
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
    },
    get_awaits: function(ctx, awaits){
        // Return the list of Await below context "ctx"
        awaits = awaits || []
        if(ctx.type == 'await'){
            awaits.push(ctx)
        }else if(ctx.tree){
            for(var item of ctx.tree){
                Comprehension.get_awaits(item, awaits)
            }
        }
        return awaits
    },
    has_await: function(ctx){
        //
        var node = $get_node(ctx),
            awaits = Comprehension.get_awaits(ctx)
        for(var aw of awaits){
            var ix = node.awaits.indexOf(aw)
            if(ix > -1){
                node.awaits.splice(ix, 1)
            }
        }
        return awaits.length > 0
    }
}

var $ConditionCtx = $B.parser.$ConditionCtx = function(context,token){
    // Class for keywords "if", "elif", "while"
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    this.node = $get_node(this)
    this.scope = $get_scope(this)
    if(token == 'while'){
        this.loop_num = $loop_num++
    }
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
    var res = new ast[types[this.token]](ast_or_obj(this.tree[0]))
    if(this.orelse){
        if(this.orelse.token == 'elif'){
            res.orelse = [ast_or_obj(this.orelse)]
        }else{
            res.orelse = ast_or_obj(this.orelse)
        }
    }else{
        res.orelse = []
    }
    res.body = ast_body(this)
    return res
}

$ConditionCtx.prototype.toString = function(){
    return this.token + ' ' + this.tree
}

$ConditionCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){
        if(context.tree[0].type == "abstract_expr" &&
                context.tree[0].tree.length == 0){ // issue #965
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        }
        return $BodyCtx(context)
    }else if(this.in_comp && this.token == 'if'){
        // [x for x in A if cond1 if cond2]
        if(token == ']'){
            return $transition(context.parent, token, value)
        }else if(token == 'if'){
            var if_exp = new $ConditionCtx(context.parent, 'if')
            if_exp.in_comp = true
            return new $AbstractExprCtx(if_exp, false)
        }else if(')]}'.indexOf(token) > -1){
            return $transition(this.parent, token, value)
        }
    }
    $_SyntaxError(context, ["expected ':'"])
}

$ConditionCtx.prototype.transform = function(node, rank){
    var scope = $get_scope(this)
    if(this.token == "while"){
        node.parent.insert(rank,
            $NodeJS('var $no_break' + this.loop_num + ' = true'))
        // Add a line to reset the line number, except if the last
        // instruction in the loop is a return, because the next
        // line would never be reached
        var module = $get_module(this).module
        if($B.last(node.children).context.tree[0].type != "return"){
            var js = '$locals.$line_info = "' + node.line_num +
                ',' + module + '";if($locals.$f_trace !== _b_.None){\n' +
                '$B.trace_line()};_b_.None;'
            node.add($NodeJS(js))
        }
        // because a node was inserted, return 2 to avoid infinite loop
        return 2
    }
}

$ConditionCtx.prototype.to_js = function(){
    this.js_processed = true
    var tok = this.token
    if(tok == 'elif'){
        tok = 'else if'
    }
    // In a "while" loop, the flag "$no_break" is initially set to false.
    // If the loop exits with a "break" this flag will be set to "true",
    // so that an optional "else" clause will not be run.
    var res = [tok + '($B.$bool(']
    if(tok == 'while'){
        res.push('$no_break' + this.loop_num + ' && ')
    }else if(tok == 'else if'){
        var line_info = $get_node(this).line_num + ',' +
            $get_scope(this).id
        res.push('($B.set_line("' + line_info + '")) && ')
    }
    if(this.tree.length == 1){
        res.push($to_js(this.tree) + '))')
    }else{ // syntax "if cond : do_something" in the same line
        res.push(this.tree[0].to_js() + '))')
        if(this.tree[1].tree.length > 0){
            res.push('{' + this.tree[1].to_js() + '}')
        }
    }
    return res.join('')
}

var $ContinueCtx = $B.parser.$ContinueCtx = function(context){
    // Class for keyword "continue"
    this.type = 'continue'
    this.parent = context
    $get_node(this).is_continue = true
    context.tree[context.tree.length] = this

    // set information related to the associated loop
    set_loop_context.apply(this, [context, 'continue'])
}

$ContinueCtx.prototype.ast = function(){
    return new ast.Continue()
}

$ContinueCtx.prototype.toString = function(){
    return '(continue)'
}

$ContinueCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){return context.parent}
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$ContinueCtx.prototype.to_js = function(){
    this.js_processed = true
    var js = 'continue'
    if(this.loop_ctx.has_break){
        /* Set $no_break for the loop to True, for code like
            count = 0
            while count < 2:
                count += 1
                try:
                    break
                finally:
                    continue
        */
        js = `$locals["$no_break${this.loop_ctx.loop_num}"] = true;${js}`
    }
    return js
}

var $DebuggerCtx = $B.parser.$DebuggerCtx = function(context){
    // Class for debugger
    this.type = 'continue'
    this.parent = context
    context.tree[context.tree.length] = this
}

$DebuggerCtx.prototype.toString = function(){
    return '(debugger)'
}

$DebuggerCtx.prototype.transition = function(token, value){
    var context = this
}

$DebuggerCtx.prototype.to_js = function(){
    this.js_processed = true
    return 'debugger'
}

var $DecoratorCtx = $B.parser.$DecoratorCtx = function(context){
    // Class for decorators
    this.type = 'decorator'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
}

$DecoratorCtx.prototype.toString = function(){
    return '(decorator) ' + this.tree
}

$DecoratorCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'id' && context.tree.length == 0){
        return $transition(new $AbstractExprCtx(context, false),
            token, value)
    }
    if(token == 'eol') {
        return $transition(context.parent, token)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$DecoratorCtx.prototype.transform = function(node, rank){
    var func_rank = rank + 1,
        children = node.parent.children,
        decorators = [this.tree]
    while(1){
        if(func_rank >= children.length){
            $_SyntaxError(node.context, ['decorator expects function'])
        }
        else if(children[func_rank].context.type == 'node_js'){
            func_rank++
        }else if(children[func_rank].context.tree[0].type ==
                'decorator'){
            decorators.push(children[func_rank].context.tree[0].tree)
            children.splice(func_rank, 1)
        }else{break}
    }
    // Associate a random variable name to each decorator
    // In a code such as
    // class Cl(object):
    //      def __init__(self):
    //          self._x = None
    //
    //      @property
    //      def x(self):
    //          return self._x
    //
    //      @x.setter
    //      def x(self, value):
    //          self._x = value
    //
    // we can't replace the decorated methods by something like
    //
    //      def x(self):
    //          return self._x
    //      x = property(x)      # [1]
    //
    //      def x(self,value):   # [2]
    //          self._x = value
    //      x = x.setter(x)      # [3]
    //
    // because when we want to use x.setter in [3], x is no longer the one
    // defined in [1] : it has been reset by the function declaration in [2]
    // The technique used here is to replace these lines by :
    //
    //      $vth93h6g = property # random variable name
    //      def $dec001(self):   # another random name
    //          return self._x
    //      x = $vth93h6g($dec001)
    //
    //      $h3upb5s8 = x.setter
    //      def $dec002(self, value):
    //          self._x = value
    //      x = $h3upb5s8($dec002)
    //
    this.dec_ids = []
    var pos = 0
    for(var _ of decorators){
        this.dec_ids.push('$id' + $B.UUID())
    }

    var obj = children[func_rank].context.tree[0]
    if(obj.type == 'def'){
        obj.decorated = true
        obj.alias = '$dec' + $B.UUID()
    }

    // add a line after decorated element
    var tail = '',
        scope = $get_scope(this),
        ref = '$locals["'
    // reference of the original function, may have been declared global
    if(scope.globals && scope.globals.has(obj.name)){
        var module = $get_module(this)
        ref = '$locals_' + module.id + '["'
    }
    ref += obj.name + '"]'
    var res = ref + ' = '

    decorators.forEach(function(elt, i){
        res += '$B.$call(' + this.dec_ids[i] + ')('
        tail +=')'
    }, this)
    res += (obj.decorated ? obj.alias : ref) + tail + ';'

    // If obj is a function or a class we must set binding to 'true'
    // instead of "def" or "class" because the result might have an
    // attribute "__call__"
    $bind(obj.name, scope, this)

    node.parent.insert(func_rank + 1, $NodeJS(res))
    this.decorators = decorators
}

$DecoratorCtx.prototype.to_js = function(){
    this.js_processed = true
    var res = []
    this.decorators.forEach(function(decorator, i){
        res.push('var ' + this.dec_ids[i] + ' = ' +
            $to_js(decorator) + ';')
    }, this)
    return res.join('')
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
            decorators.splice(0, 0, ast_or_obj(deco))
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

    this.locals = []
    context.tree[context.tree.length] = this

    // store id of enclosing functions
    this.enclosing = []
    var scope = this.scope = $get_scope(this)
    if(scope.context && scope.context.tree[0].type == "class"){
        this.class_name = scope.context.tree[0].name
    }
    // initialize object for names bound in the function
    context.node.binding = {}

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

    // num used if several functions have the same name
    this.num = $loop_num
    $loop_num++

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

    args = ast_or_obj(func_args)
    if(this.async){
        res = new ast.AsyncFunctionDef(this.name, args, [], decorators)
    }else{
        res = new ast.FunctionDef(this.name, args, [], decorators)
    }
    if(this.annotation){
        res.returns = ast_or_obj(this.annotation.tree[0])
    }
    res.body = ast_body(this.parent)
    return res
}

$DefCtx.prototype.set_name = function(name){
    /*
    try{
        name = $mangle(name, this.parent.tree[0])
    }catch(err){
        console.log(err)
        console.log('parent', this.parent)
        throw err
    }
    */
    if(["None", "True", "False"].indexOf(name) > -1){
        $_SyntaxError(this, 'invalid function name')
    }
    var id_ctx = new $IdCtx(this, name)
    this.name = name
    this.id = this.scope.id + '_' + name
    this.id = this.id.replace(/\./g, '_') // for modules inside packages
    this.id += '_' + $B.UUID()
    this.parent.node.id = this.id
    this.parent.node.module = this.module

    this.binding = {}

    var scope = this.scope

    if(scope.globals !== undefined &&
            scope.globals.has(name)){
        // function name was declared global
        $bind(name, this.root, this)
    }else{
        $bind(name, scope, this)
    }

    // If function is defined inside another function, add the name
    // to local names
    id_ctx.bound = true
    if(scope.is_function){
        if(scope.context.tree[0].locals.indexOf(name) == -1){
            scope.context.tree[0].locals.push(name)
        }
    }
}

$DefCtx.prototype.toString = function(){
    return 'def ' + this.name + '(' + this.tree + ')'
}

$DefCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.name) {
                $_SyntaxError(context, 'token ' + token + ' after ' + context)
            }
            context.set_name(value)
            return context
        case '(':
            if(context.name == null){
                $_SyntaxError(context,
                    "missing name in function definition")
            }
            context.has_args = true;
            return new $FuncArgs(context)
        case 'annotation':
            return new $AbstractExprCtx(new $AnnotationCtx(context), true)
        case ':':
            if(context.has_args){
                return $BodyCtx(context)
            }else{
                $_SyntaxError(context, "missing function parameters")
            }
        case 'eol':
            if(context.has_args){
                $_SyntaxError(context, "missing colon")
            }
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$DefCtx.prototype.transform = function(node, rank){
    if(this.is_comp){
        $get_node(this).is_comp = true
    }
    // already transformed ?
    if(this.transformed !== undefined){return}

    var scope = this.scope

    // search doc string
    this.doc_string = $get_docstring(node)
    this.rank = rank // save rank if we must add generator declaration

    // block indentation
    var indent = node.indent + 12

    // List of enclosing functions

    // For lambdas, test if the parent block is a function
    if(this.name.substr(0, 15) == 'lambda_' + $B.lambda_magic){
        var pblock = scope.parent_block
        if(pblock.context && pblock.context.tree[0].type == "def"){
            this.enclosing.push(pblock)
        }
    }
    var pnode = this.parent.node
    while(pnode.parent && pnode.parent.is_def_func){
        this.enclosing.push(pnode.parent.parent)
        pnode = pnode.parent.parent
    }

    var defaults = [],
        defs1 = [],
        has_end_pos = false
    this.argcount = 0
    this.kwonlyargcount = 0 // number of args after a star arg
    this.kwonlyargsdefaults = []
    this.otherdefaults = []
    this.varnames = {}
    this.args = []
    this.__defaults__ = []
    this.slots = []
    var slot_list = [],
        slot_init = [],
        annotations = []
    if(this.annotation){
        annotations.push('"return":' + this.annotation.to_js())
    }

    this.func_name = this.tree[0].to_js()
    var func_name1 = this.func_name
    if(this.decorated){
        this.func_name = 'var ' + this.alias
        func_name1 = this.alias
    }

    var func_args = this.tree[1].tree
    for(var arg of func_args){
        if(arg.type == 'end_positional'){
            this.args.push("/")
            slot_list.push('"/"')
            has_end_pos = true
        }else{
            this.args.push(arg.name)
            this.varnames[arg.name] = true
        }
        if(arg.type == 'func_arg_id'){
            if(this.star_arg){
                this.kwonlyargcount++
                if(arg.has_default){
                    this.kwonlyargsdefaults.push(arg.name)
                }
            }
            else{
                this.argcount++
                if(arg.has_default){
                    this.otherdefaults.push(arg.name)
                }
            }
            this.slots.push('"' + arg.name + '":null')
            slot_list.push('"' + arg.name + '"')
            slot_init.push('"' + arg.name + '": _' + arg.name)
            if(arg.tree.length > 0){
                defaults.push('"' + arg.name + '"')
                defs1.push(arg.name + ':' + $to_js(arg.tree))
                this.__defaults__.push($to_js(arg.tree))
            }
        }else if(arg.type == 'func_star_arg'){
            if(arg.op == '*'){this.star_arg = arg.name}
            else if(arg.op == '**'){this.kw_arg = arg.name}
        }
        if(arg.annotation){
            var name = $mangle(arg.name, this)
            annotations.push(name + ': ' + arg.annotation.to_js())
        }
    }

    slot_init = '{' + slot_init.join(", ") + '}'

    // Flags
    var flags = 67
    if(this.star_arg){flags |= 4}
    if(this.kw_arg){flags |= 8}
    if(this.type == 'generator'){flags |= 32}
    if(this.async){flags |= 128}

    var nodes = [], js

    // Get id of global scope
    var global_scope = scope
    while(global_scope.parent_block &&
            global_scope.parent_block.id !== '__builtins__'){
        global_scope = global_scope.parent_block
    }
    var global_ns = '$locals_' + global_scope.id.replace(/\./g, '_')

    var name = this.name + this.num

    // Add lines of code to node children

    // Declare object holding local variables
    var local_ns = '$locals_' + this.id,
        h = '\n' + ' '.repeat(indent)
    js = 'var ' + local_ns + ' = {},' +
        h + '$locals = ' + local_ns + ';'

    var new_node = new $Node()
    new_node.locals_def = true
    new_node.func_node = node
    new $NodeJSCtx(new_node, js)
    nodes.push(new_node)

    // Push id in frames stack
    var enter_frame_nodes = [
        $NodeJS('$locals.$line_info = "' + node.line_num + ',' +
            this.module + '"'),
        $NodeJS(`var $top_frame = ["${this.id}", $locals,` +
            '"' + global_scope.id + '", ' + global_ns + ', ' +
            (this.is_comp ? this.name : name) + ']'),
        $NodeJS('$locals.$f_trace = $B.enter_frame($top_frame)'),
        $NodeJS('var $stack_length = $B.frames_stack.length;')
    ]

    if(this.type == "generator"){
        enter_frame_nodes.push($NodeJS("$locals.$is_generator = true"))
    }

    if(this.async){
        enter_frame_nodes.splice(1, 0,
            $NodeJS(`$locals.$async = "${this.id}"`))
    }

    for(var _node of enter_frame_nodes){
        _node.enter_frame = true
    }

    if(this.is_comp){
        nodes.push($NodeJS("var $defaults = {}"))
    }

    this.env = []

    // Code in the worst case, uses $B.args in py_utils.js

    var make_args_nodes = []

    var js = local_ns + ' = $locals = $B.args("' + this.name + '", ' +
        this.argcount + ', {' + this.slots.join(', ') + '}, ' +
        '[' + slot_list.join(', ') + '], arguments, $defaults, ' +
        this.other_args + ', ' + this.other_kw + ');'

    var new_node = new $Node()
    new $NodeJSCtx(new_node, js)
    make_args_nodes.push(new_node)

    var only_positional = false
    if(this.other_args === null && this.other_kw === null &&
            this.after_star.length == 0 && !has_end_pos){
        // If function only takes positional arguments, we can generate
        // a faster version of argument parsing than by calling function
        // $B.args
        only_positional = true

        // Number of arguments received
        nodes.push($NodeJS('var $len = arguments.length;'))

        // Test if all the arguments passed to the function
        // are positional, not keyword arguments
        // In calls, keyword arguments are passed as the last
        // argument, an object with attribute $nat set to "kw"
        var new_node = new $Node()
        var js = 'var last_arg;if($len > 0 && ((last_arg = ' +
            'arguments[$len - 1]) !== undefined) && last_arg.$nat ' +
            '!== undefined)'
        new $NodeJSCtx(new_node,js)
        nodes.push(new_node)

        // If at least one argument is not "simple", fall back to
        // $B.args()
        for(var item of make_args_nodes){
            new_node.add(item)
        }

        var else_node = new $Node()
        new $NodeJSCtx(else_node, 'else')
        nodes.push(else_node)

        var pos_len = this.slots.length

        // Exact number of arguments received
        var test_node = $NodeJS('if($len == ' + pos_len + ')')
        else_node.add(test_node)

        test_node.add($NodeJS(local_ns + ' = $locals = $B.conv_undef(' +
            slot_init + ')'))

        // Too many arguments
        else_node.add($NodeJS('else if($len > ' + pos_len +
            '){\n$B.wrong_nb_args("' + this.name + '", $len, ' +
            pos_len + ', [' + slot_list + '])}'))

        if(pos_len > 0){
            // Not enough arguments
            else_node.add($NodeJS('else if($len + Object.keys($defaults).length < ' +
                pos_len + '){\n$B.wrong_nb_args("' + this.name +
                '", $len, ' + pos_len + ', [' + slot_list + '])}'))

            // Replace missing arguments with default values
            var subelse_node = $NodeJS("else")
            else_node.add(subelse_node)

            subelse_node.add($NodeJS(local_ns + ' = $locals = ' +
                '$B.conv_undef(' + slot_init + ')'))
            subelse_node.add($NodeJS("var defparams = [" + slot_list + "]"))
            subelse_node.add($NodeJS("for(var i = $len; i < defparams.length" +
                "; i++){\n$locals[defparams[i]] = $defaults[defparams[i]]}"))
        }
    }else{
        nodes.push(make_args_nodes[0])
        if(make_args_nodes.length > 1){nodes.push(make_args_nodes[1])}
    }

    nodes = nodes.concat(enter_frame_nodes)

    // Handle name __class__ in methods (PEP 3135 and issue #1068)
    var is_method = scope.ntype == "class"
    if(is_method){
        var scope_ref = '$locals_' + scope.parent_block.id.replace(/\./g, '_'),
            class_ref = scope.context.tree[0].qualname
        // bind name __class__ in method
        var had_class = this.parent.node.binding["__class__"] // already bound ?
        this.parent.node.binding["__class__"] = true
        // set its value to the class where the method is defined
        nodes.push($NodeJS('$locals.__class__ = $B.get_method_class(' +
            scope_ref + ', "' + class_ref + '")'))
    }

    // set __BRYTHON__.js_this to Javascript "this"
    // To use some JS libraries it may be necessary to know what "this"
    // is set to ; in Brython it is available as the result of function
    // this() in module javascript
    nodes.push($NodeJS('$B.js_this = this;'))

    // remove children of original node
    for(var i = nodes.length - 1; i >= 0; i--){
        node.children.splice(0, 0, nodes[i])
    }

    // Node that replaces the original "def" line
    var def_func_node = new $Node()
    this.params = ''
    if(only_positional){
        this.params = Object.keys(this.varnames).map(x => '_' + x).join(', ')
    }
    new $NodeJSCtx(def_func_node, '')
    def_func_node.is_def_func = true
    def_func_node.module = this.module

    // If the last instruction in the function is not a return,
    // add an explicit line "return None".
    var last_node = node.children[node.children.length - 1],
        indent = last_node.get_indent(),
        last_instr = last_node.context.tree[0]
    if(last_instr.type != 'return'){
        // as always, leave frame before returning
        js = 'if($locals.$f_trace !== _b_.None){\n$B.trace_return(_b_.None)}\n' +
            '    '.repeat(indent + 1)
        js += '$B.leave_frame'
        if(this.id.substr(0,5) == '$exec'){
            js += '_exec'
        }
        js += '({$locals});return _b_.None'
        node.add($NodeJS(js))
    }

    // Get "free variables" (referenced in function but not bound inside
    // it)
    var free_vars = []
    if(this.parent.node.referenced){
        for(var attr in this.parent.node.referenced){
            if(! this.parent.node.binding.hasOwnProperty(attr)){
                free_vars.push('"' + attr + '"')
            }
        }
    }
    if(this.parent.node.nonlocals){
        for(var key of this.parent.node.nonlocals){
            var attr = '"' + key + '"'
            if(free_vars.indexOf(attr) == -1){
                free_vars.push(attr)
            }
        }
    }

    // Add the new function definition
    node.add(def_func_node)

    var offset = 1,
        indent = node.indent

    if(! this.is_comp){
        // Set attribute $is_func
        node.parent.insert(rank + offset++, $NodeJS(name + '.$is_func = true'))

        if(this.$has_yield_in_cm){
            node.parent.insert(rank + offset++,
                $NodeJS(name + '.$has_yield_in_cm = true'))
        }

        // Create attribute $infos for the function
        // Adding only one attribute is much faster than adding all the
        // keys/values in $infos
        node.parent.insert(rank + offset++, $NodeJS(name + '.$infos = {'))

        // Add attribute __name__
        var __name__ = this.name
        if(__name__.substr(0, 15) == 'lambda_' + $B.lambda_magic){
            __name__ = "<lambda>"
        }
        js = '    __name__:"' + __name__ + '",'
        node.parent.insert(rank + offset++, $NodeJS(js))

        // Add attribute __qualname__
        var __qualname__ = __name__
        if(this.class_name){
            __qualname__ = this.class_name + '.' + __name__
        }
        js = '    __qualname__:"' + __qualname__ + '",'
        node.parent.insert(rank + offset++, $NodeJS(js))

        // Add attribute __defaults__
        if(this.otherdefaults.length > 0){
            var def_names = []
            for(var _default of this.otherdefaults){
                def_names.push('$defaults.' + _default)
            }
            node.parent.insert(rank + offset++, $NodeJS('    __defaults__ : ' +
                '$B.fast_tuple([' + def_names.join(', ') + ']),'))
        }else{
            node.parent.insert(rank + offset++, $NodeJS('    __defaults__ : ' +
                '_b_.None,'))
        }

        // Add attribute __kwdefaults__ for default values of
        // keyword-only parameters
        if(this.kwonlyargsdefaults.lengh > 0){
            var def_names = []
            for(var _default of this.kwonlyargsdefaults){
                def_names.push('$defaults.' + _default)
            }
            node.parent.insert(rank + offset++, $NodeJS('    __kwdefaults__ : ' +
                '$B.fast_tuple([' + def_names.join(', ') + ']),'))
        }else{
            node.parent.insert(rank + offset++, $NodeJS('    __kwdefaults__ : ' +
                '_b_.None,'))
        }

        // Add attribute __annotations__
        node.parent.insert(rank + offset++,
            $NodeJS('    __annotations__: {' + annotations.join(',') + '},'))

        // Add attribute __dict__
        node.parent.insert(rank + offset++,
            $NodeJS('    __dict__: $B.empty_dict(),'))

        // Add attribute __doc__
        node.parent.insert(rank + offset++,
            $NodeJS('    __doc__: ' + (this.doc_string || '_b_.None') + ','))

        // Add attribute __module__
        var root = $get_module(this)
        node.parent.insert(rank + offset++,
            $NodeJS('    __module__ : "' + root.module + '",'))

        for(var attr in this.parent.node.binding){
            // for attribute __class__, if function is a method and name
            // __class__ was not explicitely bound, had_class is false and
            // __class__ was added to binding only to be available inside the
            // function. Don't add is to varnames
            if(attr == "__class__" && is_method && ! had_class){
                continue
            }
            this.varnames[attr] = true
        }
        var co_varnames = []
        for(var attr in this.varnames){
            co_varnames.push('"' + attr + '"')
        }

        // CODE_MARKER is a placeholder which will be replaced
        // by the javascript code of the function
        var CODE_MARKER = '___%%%-CODE-%%%___' + this.name + this.num;
        var h = '\n' + ' '.repeat(indent + 8)
        js = '    __code__:{' + h + '    co_argcount:' + this.argcount
        var h1 = ',' + h + ' '.repeat(4)
        var module = $get_module(this).module
        var co_name = this.name
        if(co_name.startsWith("lambda_" + $B.lambda_magic)){
            co_name = '<lambda>'
        }
        js += h1 + 'co_filename:$locals_' + module.replace(/\./g,'_') +
            '["__file__"] || "<string>"' +
            h1 + 'co_firstlineno:' + node.line_num +
            h1 + 'co_flags:' + flags +
            h1 + 'co_freevars: [' + free_vars + ']' +
            h1 + 'co_kwonlyargcount:' + this.kwonlyargcount +
            h1 + 'co_name: "' + co_name + '"' +
            h1 + 'co_nlocals: ' + co_varnames.length +
            h1 + 'co_posonlyargcount: ' + (this.pos_only || 0) +
            h1 + 'co_varnames: $B.fast_tuple([' + co_varnames.join(', ') + '])' +
            h + '}\n' + ' '.repeat(indent + 4) +'};'

        // End with None for interactive interpreter
        js += '_b_.None;'

        node.parent.insert(rank + offset++, $NodeJS(js))
    }

    // Close anonymous function with defaults as argument
    this.default_str = '{' + defs1.join(', ') + '}'
    if(! this.is_comp){
        var name1 = name
        if(this.type == "generator"){
            name1 = `$B.generator.$factory(${name})`
        }
        var res = 'return ' + name1
        if(this.async){
            if(this.type == "generator"){
                res = `return $B.async_generator.$factory(${name})`
            }else{
                res = 'return $B.make_async(' + name1 + ')'
            }
        }
        node.parent.insert(rank + offset++,
            $NodeJS(res + '}'))

        node.parent.insert(rank + offset++, $NodeJS(
            this.func_name + " = " + this.name + '$' + this.num +
            '(' + this.default_str + ')'))

        node.parent.insert(rank + offset++, $NodeJS(
            func_name1 + ".$set_defaults = function(value){\nreturn " +
            func_name1 + " = " + this.name + "$" + this.num +
            "(value)}"))

        if(this.$has_yield_in_cm){
            node.parent.insert(rank + offset++,
                $NodeJS(`${func_name1}.$has_yield_in_cm = true`))
        }

    }

    // wrap everything in a try/catch to be sure to exit from frame
    var parent = node
    for(var pos = 0; pos < parent.children.length &&
        parent.children[pos] !== $B.last(enter_frame_nodes); pos++){}
    var try_node = $NodeJS('try'),
        children = parent.children.slice(pos + 1)
    parent.insert(pos + 1, try_node)
    for(var child of children){
        if(child.is_def_func){
            for(var grand_child of child.children){
                try_node.add(grand_child)
            }
        }else{
            try_node.add(child)
        }
    }
    parent.children.splice(pos + 2, parent.children.length)

    var except_node = $NodeJS('catch(err)')
    except_node.add($NodeJS('$B.set_exc(err)'))
    except_node.add($NodeJS('if((! err.$in_trace_func) && $locals.$f_trace !== _b_.None){\n' +
        '$locals.$f_trace = $B.trace_exception()}'))
    except_node.add($NodeJS('$B.leave_frame({$locals});throw err'))

    parent.add(except_node)

    this.transformed = true

    return offset
}


$DefCtx.prototype.to_js = function(func_name){
    this.js_processed = true

    if(this.is_comp){
        return "var " + this.name + " = " +
            (this.async ? ' async ' : '') +
            "function* (_expr)"
    }

    func_name = func_name || this.tree[0].to_js()
    if(this.decorated){func_name = 'var ' + this.alias}

    return "var " + this.name + '$' + this.num +
        ' = function($defaults){\n' +
        (this.async ? 'async ' : '') + 'function'+
        (this.type == 'generator' ? "* " : " ") +
        this.name + this.num + '(' + this.params + ')'
}

var $DelCtx = $B.parser.$DelCtx = function(context){
    // Class for keyword "del"
    this.type = 'del'
    this.parent = context
    context.tree.push(this)
    this.tree = []
}

$DelCtx.prototype.ast = function(){
    var targets
    if(this.tree[0].type == 'list_or_tuple'){
        // Syntax "del a, b, c"
        targets = this.tree[0].tree.map(ast_or_obj)
    }else if(this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'list_or_tuple'){
        // del(x[0]) is the same as del x[0], cf.issue #923
        targets = ast_or_obj(this.tree[0].tree[0])
        targets.ctx = new ast.Del()
        for(var elt of targets.elts){
            elt.ctx = new ast.Del()
        }
        return new ast.Delete([targets])
    }else{
        targets = [ast_or_obj(this.tree[0].tree[0])]
    }
    for(var target of targets){
        target.ctx = new ast.Del()
    }
    return new ast.Delete(targets)
}

$DelCtx.prototype.toString = function(){
    return 'del ' + this.tree
}

$DelCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){
        check_assignment(this.tree[0], {action: 'delete'})
        return $transition(context.parent, token)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$DelCtx.prototype.to_js = function(){
    this.js_processed = true

    var context = this.parent

    if(this.tree[0].type == 'list_or_tuple'){
        // Syntax "del a, b, c"
        var res = []
        for(var elt of this.tree[0].tree){
            var subdel = new $DelCtx(context) // this adds an element to context.tree
            subdel.tree = [elt]
            res.push(subdel.to_js())
            context.tree.pop() // remove the element from context.tree
        }
        this.tree = []
        return res.join(';')
    }else if(this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'list_or_tuple'){
        // del(x[0]) is the same as del x[0], cf.issue #923
        this.tree[0] = this.tree[0].tree[0]
        return this.to_js()
    }else{
        var expr = this.tree[0].tree[0]

        switch(expr.type) {
            case 'id':
                // cf issue #923
                var scope = $get_scope(this),
                    is_global = false
                if((scope.ntype == "def" || scope.ntype == "generator") &&
                        scope.globals && scope.globals.has(expr.value)){
                    // Delete from global namespace
                    scope = scope.parent
                    while(scope.parent &&
                            scope.parent.id !== "__builtins__"){
                        scope = scope.parent
                    }
                    is_global = true
                }
                var res = '$B.$delete("' + expr.value + '"' +
                    (is_global ? ', "global"' : '') + ');'
                // Delete from scope to force the use of $search or
                // $global_search in name resolution, even if del is never
                // called.
                delete scope.binding[expr.value]
                return res
            case 'list_or_tuple':
                var res = []
                for(var elt of expr.tree){
                  res.push('delete ' + elt.to_js())
                }
                return res.join(';')
            case 'sub':
                // Delete an item in a list : "del a[x]"
                expr.func = 'delitem'
                js = expr.to_js()
                expr.func = 'getitem'
                return js
            case 'attribute':
                return '_b_.delattr(' + expr.value.to_js() + ',"' +
                    expr.name + '")'
            default:
                $_SyntaxError(this, ["cannot delete " + expr.type])
        }
    }
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
    this.comprehension = true
    this.parent = context.parent
    this.key = context.tree[0]
    this.value = context.tree[1]
    this.key.parent = this
    this.value.parent = this
    this.tree = []
    this.binding = {}
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
    return new ast.DictComp(
        ast_or_obj(this.key),
        ast_or_obj(this.value),
        Comprehension.generators(this.tree)
    )
}

DictCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == '}'){
        this.has_await = Comprehension.has_await(this)
        return this.parent
    }
    $_SyntaxError(context, 'token ' + token + 'after list comp')
}

DictCompCtx.prototype.to_js = function(){
    var node = $get_node(this),
        indent = node.get_indent()

    var id = this.id,
        first_for = this.tree[0],
        outmost_expr = first_for.tree[1].to_js()
    first_for.comp_body = true
    first_for.iterable_is_outermost = true
    var module_id = this.module.replace(/\./g, '_')

    var js = `(${this.has_await ? 'async ' : ''}function(expr){` +
            Comprehension.admin_infos(this) +
            `\nvar $result_${id} = $B.empty_dict()\n`

    js += first_for.to_js(indent)
    var nb = -1
    for(var i = 1; i < this.tree.length; i++){
        nb++
        var stmt = this.tree[i]
        if(stmt.type == 'for'){
            stmt.comp_body = true
            js += '\n' + stmt.to_js(indent + nb)
        }else if(stmt.type == 'condition' && stmt.token == 'if'){
            js += '\n' + ' '.repeat(12 + 4 * nb) + stmt.to_js() + '{'
        }
    }

    var expr_has_await = Comprehension.has_await(this.value)

    js +=  '\n' + ' '.repeat(16 + 4 * nb) +
            (expr_has_await ? 'var save_stack = $B.save_stack();\n' : '') +
            `try{\n  _b_.dict.$setitem($result_${id}, ${this.key.to_js()}, ` +
            `${this.value.to_js()})\n}catch(err){\n` +
            (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '') +
            `$B.leave_frame($locals)\n` +
            `  throw err\n}` +
            (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '')

    for(var i = 0; i < this.tree.length; i++){
        js += '\n' + ' '.repeat(12 + 4 * nb--) + '}'
    }
    js += `\n$B.leave_frame({$locals, value: _b_.None})`
    js += `\nreturn $result_${id}`
    js += `\n}\n)(${outmost_expr})`
    return js
}

var $DictOrSetCtx = $B.parser.$DictOrSetCtx = function(context){
    // Context for literal dictionaries or sets
    // The real type (dist or set) is set inside $transition
    // as the attribute 'real'
    this.type = 'dict_or_set'
    this.real = 'dict_or_set'
    this.expect = 'id'
    this.closed = false
    this.start = $pos

    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$DictOrSetCtx.prototype.ast = function(){
    // Dict(expr* keys, expr* values) | Set(expr* elts)
    if(this.real == 'dict'){
        var keys = [],
            values = []
        for(var i = 0, len = this.items.length; i < len; i++){
            if(this.items[i].packed){
                keys.push(_b_.None)
                values.push(ast_or_obj(this.items[i]))
            }else{
                keys.push(ast_or_obj(this.items[i]))
                values.push(ast_or_obj(this.items[i + 1]))
                i++
            }
        }
        return new ast.Dict(keys, values)
    }else if(this.real == 'set'){
        return new ast.Set(this.items.map(ast_or_obj))
    }
    return this
}
$DictOrSetCtx.prototype.toString = function(){
    switch(this.real) {
        case 'dict':
            return '(dict) {' + this.items + '}'
        case 'set':
            return '(set) {' + this.tree + '}'
    }
    return '(dict_or_set) {' + this.tree + '}'
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
        return $transition(context.parent,token,value)
    }else{
        if(context.expect == ','){
            switch(token) {
                case '}':
                    switch(context.real) {
                        case 'dict_or_set':
                             if(context.tree.length != 1){break}
                             context.real = 'set'   // is this needed?
                        case 'set':
                             context.items = context.tree
                             context.tree = []
                             context.closed = true
                             return context
                        case 'dict':
                            if($B.last(this.tree).type == 'abstract_expr'){
                                $_SyntaxError(context,
                                    ["expression expected after dictionary key and ':'"])
                            }else if(context.nb_dict_items() % 2 != 0){
                                $_SyntaxError(context,
                                    ["':' expected after dictionary key"])
                            }
                            context.items = context.tree
                            context.tree = []
                            context.closed = true
                            return context
                      }
                      $_SyntaxError(context, 'token ' + token +
                          ' after ' + context)
                case ',':
                    if(context.real == 'dict_or_set'){
                        context.real = 'set'
                    }
                    if(context.real == 'dict' &&
                            context.nb_dict_items() % 2){
                        $_SyntaxError(context,
                            ["':' expected after dictionary key"])
                    }
                    context.expect = 'id'
                    return context
                case ':':
                  if(context.real == 'dict_or_set'){
                      context.real = 'dict'
                  }
                  if(context.real == 'dict'){
                      context.expect = 'value'
                      context.value_pos = $pos
                      return context
                  }else{
                      $_SyntaxError(context, 'token ' + token +
                      ' after ' + context)
                  }
                case 'for':
                    // comprehension
                    if(context.real == "set" && context.tree.length > 1){
                        context.$pos = context.tree[0].$pos
                        $_SyntaxError(context, ["did you forget " +
                            "parentheses around the comprehension target?"])
                    }
                    if(context.real == 'dict_or_set'){
                        return new $TargetListCtx(new $ForExpr(
                            new SetCompCtx(this)))
                    }else{
                        return new $TargetListCtx(new $ForExpr(
                            new DictCompCtx(this)))
                    }
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        }else if(context.expect == 'id'){
            switch(token) {
                case '}':
                    if(context.tree.length == 0){ // empty dict
                        context.items = []
                        context.real = 'dict'
                    }else{ // trailing comma, eg {'a':1,'b':2,}
                        context.items = context.tree
                    }
                    context.tree = []
                    context.closed = true
                    return context
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
                    context.expect = ','
                    var expr = new $AbstractExprCtx(context, false)
                    return $transition(expr, token, value)
                case 'op':
                    switch(value) {
                        case '*':
                        case '**':
                            context.expect = ","
                            var expr = new $AbstractExprCtx(context, false)
                            expr.packed = value.length // 1 for x, 2 for **
                            if(context.real == "dict_or_set"){
                                context.real = value == "*" ? "set" :
                                    "dict"
                            }else if(
                                    (context.real == "set" && value == "**") ||
                                    (context.real == "dict" && value == "*")){
                                $_SyntaxError(context, 'token ' + token +
                                    ' after ' + context)
                            }
                            return expr
                        case '+':
                            // ignore unary +
                            return context
                        case '-':
                        case '~':
                            // create a left argument for operator "unary"
                            context.expect = ','
                            var left = new $UnaryCtx(context, value)
                            // create the operator "unary"
                            if(value == '-'){
                                var op_expr = new $OpCtx(left, 'unary_neg')
                            }else if(value == '+'){
                                var op_expr = new $OpCtx(left, 'unary_pos')
                            }else{
                                var op_expr = new $OpCtx(left, 'unary_inv')
                            }
                            return new $AbstractExprCtx(op_expr,false)
                    }
                    $_SyntaxError(context, 'token ' + token +
                        ' after ' + context)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        }else if(context.expect == 'value'){
            try{
                context.expect = ','
                return $transition(new $AbstractExprCtx(context, false),
                    token, value)
            }catch(err){
                context.$pos = context.value_pos
                $_SyntaxError(context, ["expression expected after " +
                    "dictionary key and ':'"])
            }
        }
        return $transition(context.parent, token, value)
    }
}

$DictOrSetCtx.prototype.nb_dict_items = function(){
    var nb = 0
    for(var item of this.tree){
        if(item.packed){
            nb += 2
        }else{
            nb++
        }
    }
    return nb
}

$DictOrSetCtx.prototype.packed_indices = function(){
    var ixs = []
    this.items.forEach(function(t, i){
        if(t.type == "expr" && t.packed){
            ixs.push(i)
        }
    })
    return ixs
}

$DictOrSetCtx.prototype.unpack_dict = function(packed){
    var js = "",
        res,
        first,
        i = 0,
        item,
        elts = []
    while(i < this.items.length){
        item = this.items[i]
        first = i == 0
        if(item.type == "expr" && item.packed){
            res = "_b_.list.$factory(_b_.dict.items(" + item.to_js() + "))"
            i++
        }else{
            if(this.items[i + 1] === undefined){
                console.log('stack', $B.frames_stack.slice(),
                    'this.items', this.items, 'i', i)
            }
            res = "[[" + item.to_js() + "," +
                this.items[i + 1].to_js() + "]]"
            i += 2
        }
        if(! first){
            res = ".concat(" + res + ")"
        }
        js += res
    }
    return js
}

$DictOrSetCtx.prototype.unpack_set = function(packed){
    var js = "", res
    this.items.forEach(function(t, i){
        if(packed.indexOf(i) > -1){
            res = "_b_.list.$factory(" + t.to_js() +")"
        }else{
            res = "[" + t.to_js() + "]"
        }
        if(i > 0){res = ".concat(" + res + ")"}
        js += res
    })
    return js
}

$DictOrSetCtx.prototype.to_js = function(){
    this.js_processed = true

    var packed = this.packed_indices()

    if(this.real == 'dict'){
        if(packed.length > 0){
            return '_b_.dict.$factory(' + this.unpack_dict(packed) +
                ')' + $to_js(this.tree)
        }
        var res = []
        for(var i = 0; i < this.items.length; i += 2){
            res.push('[' + this.items[i].to_js() + ',' +
              this.items[i + 1].to_js() + ']')
        }
        return '_b_.dict.$factory([' + res.join(',') + '])' +
            $to_js(this.tree)
    }else if(packed.length > 0){
        return '_b_.set.$factory(' + this.unpack_set(packed) + ')'
    }
    return '_b_.set.$factory([' + $to_js(this.items) + '])' + $to_js(this.tree)
}

var $DoubleStarArgCtx = $B.parser.$DoubleStarArgCtx = function(context){
    // Class for syntax "**kw" in a call
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$DoubleStarArgCtx.prototype.toString = function(){
    return '**' + this.tree
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$DoubleStarArgCtx.prototype.to_js = function(){
    this.js_processed = true
    return '{$nat:"pdict",arg:' + $to_js(this.tree) + '}'
}

var $EllipsisCtx = $B.parser.$EllipsisCtx = function(context){
    // Class for "..."
    this.type = 'ellipsis'
    this.parent = context
    this.start = $pos
    context.tree[context.tree.length] = this
}

$EllipsisCtx.prototype.ast = function(){
    return new ast.Constant({type: 'ellipsis'})
}

$EllipsisCtx.prototype.toString = function(){
    return 'ellipsis'
}

$EllipsisCtx.prototype.transition = function(token, value){
    var context = this
    return $transition(context.parent, token, value)
}

$EllipsisCtx.prototype.to_js = function(){
    this.js_processed = true
    return '$B.builtins["Ellipsis"]'
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$EndOfPositionalCtx.prototype.to_js = function(){
    return "/"
}

var $ExceptCtx = $B.parser.$ExceptCtx = function(context){
    // Class for keyword "except"
    this.type = 'except'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'id'
    this.scope = $get_scope(this)
}

$ExceptCtx.prototype.ast = function(){
    // ast.ExceptHandler(type, name, body)
    return new ast.ExceptHandler(
        this.tree.length == 1 ? ast_or_obj(this.tree[0]) : undefined,
        this.has_alias ? this.tree[0].alias : undefined,
        ast_body(this.parent)
    )
}

$ExceptCtx.prototype.toString = function(){return '(except) '}

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
                $_SyntaxError(context,
                    ["multiple exception types must be parenthesized"])
            }
    }
    console.log('error', context, token)
    $_SyntaxError(context, 'token ' + token + ' after ' + context.expect)
}

$ExceptCtx.prototype.set_alias = function(alias){
    this.tree[0].alias = $mangle(alias, this)
    $bind(alias, this.scope, this)
}

$ExceptCtx.prototype.transform = function(node, rank){
    // Add a no-op instruction just to have a line with the "except" node
    // line num, for trace functions
    var linenum_node = $NodeJS("void(0)")
    linenum_node.line_num = node.line_num
    node.insert(0, linenum_node)
    // Add instruction to delete current exception, except if the last
    // instruction in the except block is a return (to avoid the
    // message "unreachable code after return statement")
    var last_child = $B.last(node.children)
    if(last_child.context.tree && last_child.context.tree[0] &&
            last_child.context.tree[0].type == "return"){}
    else{
        node.add($NodeJS("$B.del_exc()"))
    }
}

$ExceptCtx.prototype.to_js = function(){
    // in method "transform" of $TryCtx instances, related
    // $ExceptCtx instances receive an attribute __name__

    this.js_processed = true

    switch(this.tree.length) {
        case 0:
            return 'else'
        case 1:
            if(this.tree[0].name == 'Exception'){return 'else if(1)'}
    }

    var res = []
    for(var elt of this.tree){
        res.push(elt.to_js())
    }
    var lnum = ''
    if($B.debug > 0){
        var module = $get_module(this)
        lnum = '($locals.$line_info = "' + $get_node(this).line_num +
            ',' + module.id + '") && '
    }
    return 'else if(' + lnum + '$B.is_exc(' + this.error_name +
        ',[' + res.join(',') + ']))'
}

var $ExprCtx = $B.parser.$ExprCtx = function(context, name, with_commas){
    // Base class for expressions
    this.type = 'expr'
    this.name = name
    this.$pos = $pos
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
    var res = ast_or_obj(this.tree[0])
    if(this.packed){
        // return new ast.Starred(res)
    }else if(this.annotation){
        res = new ast.AnnAssign(
            res,
            ast_or_obj(this.annotation.tree[0]),
            undefined,
            1)
        return res
    }
    return res
}

$ExprCtx.prototype.toString = function(){
    return '(expr ' + this.with_commas + ') ' + this.tree
}

$ExprCtx.prototype.transition = function(token, value){
    var context = this
    if(python_keywords.indexOf(token) > -1 &&
            ['as', 'else', 'if', 'for', 'from', 'in'].indexOf(token) == -1){
        context.$pos = $pos
        $_SyntaxError(context, `'${token}' after expression`)
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
            if(context.parent.type == 'dict_or_set' &&
                    context.parent.expect == ','){
                $_SyntaxError(context,
                    ["invalid syntax. Perhaps you forgot a comma?"])
            }
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
            break
        case '{':
            // Special case : "print {...}" must raise a SyntaxError
            // with "Missing parenthesis"...
            if(context.tree[0].type != "id" ||
                    ["print", "exec"].indexOf(context.tree[0].value) == -1){
                $_SyntaxError(context, 'token ' + token + ' after ' +
                    context)
            }
            return new $DictOrSetCtx(context)
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
                if(context.with_commas ||
                        ["assign", "return"].indexOf(context.parent.type) > -1){
                    if($parent_match(context, {type: "yield", "from": true})){
                        $_SyntaxError(context, "no implicit tuple for yield from")
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
          return new $AbstractExprCtx(new $SubCtx(context), true)
      case '(':
          return new $CallCtx(context)
      case 'op':
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

              while(context.parent !== op1){
                  context = context.parent
                  op_parent = context.parent
              }
              context.parent.tree.pop()
              var expr = new $ExprCtx(op_parent, 'operand',
                  context.with_commas)
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
          var expr = new $ExprCtx(repl.parent,'operand',false)
          expr.tree = [op1]
          repl.parent = expr
          var new_op = new $OpCtx(repl,op) // replace old operation
          return new $AbstractExprCtx(new_op,false)
      case 'augm_assign':
          var parent = context
          while(parent){
              if(parent.type == "assign" || parent.type == "augm_assign"){
                  $_SyntaxError(context,
                      "augmented assignment inside assignment")
              }else if(parent.type == "op"){
                  $_SyntaxError(context, ["cannot assign to operator"])
              }else if(parent.type == "list_or_tuple"){
                  $_SyntaxError(context, [`'${parent.real}' is an illegal` +
                      " expression for augmented assignment"])
              }else if(['list', 'tuple'].indexOf(parent.name) > -1){
                  $_SyntaxError(context, [`'${parent.name}' is an illegal` +
                      " expression for augmented assignment"])
              }else if(['dict_or_set'].indexOf(parent.name) > -1){
                  $_SyntaxError(context, [`'${parent.tree[0].real } display'` +
                      " is an illegal expression for augmented assignment"])
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
              $_SyntaxError(context, "invalid target for annotation")
          }
          break
      case '=':
          function has_parent(ctx, type){
              // Tests if one of ctx parents is of specified type
              while(ctx.parent){
                  if(ctx.parent.type == type){return ctx.parent}
                  ctx = ctx.parent
              }
              return false
          }
          var annotation
         if(context.expect == ','){
             if(context.parent.type == "call_arg"){
                 // issue 708
                 if(context.tree[0].type != "id"){
                     $_SyntaxError(context, ['expression cannot contain' +
                         ' assignment, perhaps you meant "=="?'])
                 }
                 return new $AbstractExprCtx(new $KwArgCtx(context), true)
             }else if(annotation = has_parent(context, "annotation")){
                 return $transition(annotation, token, value)
             }else if(context.parent.type == "op"){
                  // issue 811
                  $_SyntaxError(context, ["cannot assign to operator"])
             }else if(context.parent.type == "not"){
                  // issue 1496
                  $_SyntaxError(context, ["cannot assign to operator"])
             }else if(context.parent.type == "with"){
                  $_SyntaxError(context, ["expected :"])
             }else if(context.parent.type == "list_or_tuple"){
                 // issue 973
                 for(var i = 0; i < context.parent.tree.length; i++){
                     var item = context.parent.tree[i]
                     if(item.type == "expr" && item.name == "operand"){
                         $_SyntaxError(context, ["cannot assign to operator"])
                     }
                 }
             }else if(context.parent.type == "expr" &&
                     context.parent.name == "iterator"){
                 $_SyntaxError(context, ['expected :'])
             }else if(context.parent.type == "lambda"){
                 if(context.parent.parent.parent.type != "node"){
                     $_SyntaxError(context, ['expression cannot contain' +
                         ' assignment, perhaps you meant "=="?'])
                 }
             }else if(context.parent.type == 'target_list'){
                 $_SyntaxError(context, "assign to target in iteration")
             }
             while(context.parent !== undefined){
                 context = context.parent
                 if(context.type == "condition"){
                     $_SyntaxError(context, ["invalid syntax. Maybe you" +
                         " meant '==' or ':=' instead of '='?"])
                 }else if(context.type == "augm_assign"){
                     $_SyntaxError(context,
                         "assignment inside augmented assignment")
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
              $_SyntaxError(context, ':= invalid, parent ' + ptype)
          }else if(ptype == "func_arg_id" &&
                  context.parent.tree.length > 0){
              // def foo(answer = p := 42):
              $_SyntaxError(context, ':= invalid, parent ' + ptype)
          }else if(ptype == "call_arg" &&
                  context.parent.parent.type == "call" &&
                  context.parent.parent.parent.type == "lambda"){
              // lambda x := 1
              $_SyntaxError(context,
                  ':= invalid inside function arguments' )
          }
          if(context.tree.length == 1 && context.tree[0].type == "id"){
              var scope = $get_scope(context),
                  name = context.tree[0].value
              if(['None', 'True', 'False'].indexOf(name) > -1){
                  $_SyntaxError(context,
                      [`cannot use assignment expressions with ${name}`])
              }else if(name == '__debug__'){
                  $_SyntaxError(context, ['cannot assign to __debug__'])
              }
              while(scope.comprehension){
                  scope = scope.parent_block
              }
              context.tree[0].binding_scope = $bind(name, scope, context)
              return new $AbstractExprCtx(new NamedExprCtx(context), false)
          }
          $_SyntaxError(context, 'token ' + token + ' after ' + context)
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
          return new $AbstractExprCtx(new $TernaryCtx(ctx), true)

      case 'eol':
          // Special case for print and exec
          if(context.tree.length == 2 &&
                  context.tree[0].type == "id" &&
                  ["print", "exec"].indexOf(context.tree[0].value) > -1){
              $_SyntaxError(context, ["Missing parentheses in call " +
                  "to '" + context.tree[0].value + "'."])
          }
          if(["dict_or_set", "list_or_tuple", "str"].indexOf(context.parent.type) == -1){
              var t = context.tree[0]
              if(t.type == "packed"){
                  $pos = t.pos
                  $_SyntaxError(context, ["can't use starred expression here"])
              }else if(t.type == "call" && t.func.type == "packed"){
                  $pos = t.func.pos
                  $_SyntaxError(context, ["can't use starred expression here"])
              }
          }
    }
    return $transition(context.parent,token)
}

$ExprCtx.prototype.to_js = function(arg){
    var res
    this.js_processed = true
    if(this.type == 'list'){
        res = '[' + $to_js(this.tree) + ']'
    }else if(this.tree.length == 1){
        if(this.tree[0].to_js === undefined){
            console.log('pas de to_js', this)
        }
        res = this.tree[0].to_js(arg)
    }else{
        res = '_b_.tuple.$factory([' + $to_js(this.tree) + '])'
    }
    if(this.is_await){
        res = "await ($B.promise(" + res + "))"
    }
    if(this.name == "call"){ // case for unary
        res += '()'
    }
    return res
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$ExprNot.prototype.toString = function(){
    return '(expr_not)'
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
    context.tree.push(this)
    this.loop_num = $loop_num
    this.scope = $get_scope(this)
    if(this.scope.is_comp){
        //console.log("for in comp", this)
    }
    this.module = this.scope.module
    $loop_num++
}

$ForExpr.prototype.ast = function(){
    // ast.For(target, iter, body, orelse, type_comment)
    var target = ast_or_obj(this.tree[0]),
        iter = ast_or_obj(this.tree[1]),
        orelse = this.orelse ? ast_or_obj(this.orelse) : [],
        type_comment,
        body = ast_body(this.parent)
    return new ast.For(target, iter, body, orelse, type_comment)
}

$ForExpr.prototype.toString = function(){
    return '(for) ' + this.tree
}

$ForExpr.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'in':
            // bind single ids in target list
            var targets = context.tree[0].tree
            for(var target_expr of context.tree[0].tree){
                check_assignment(target_expr.tree[0])
                if(target_expr.tree[0].type == 'id'){
                    var id = target_expr.tree[0]
                    $bind(id.value, this.scope, id)
                }
            }
            if(context.tree[0].tree.length == 0){
                // issue 1293 : "for in range(n)"
                $_SyntaxError(context, "missing target between 'for' and 'in'")
            }
            return new $AbstractExprCtx(
                new $ExprCtx(context, 'iterator', true), false)
        case ':':
            if(context.tree.length < 2 // issue 638
                    || context.tree[1].tree[0].type == "abstract_expr"){
                $_SyntaxError(context, 'token ' + token + ' after ' +
                    context)
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
                if_ctx.in_comp = true
                return new $AbstractExprCtx(if_ctx, false)

        }
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

function tg_to_js(target, iterable, unpack){
    // Create the code to assign the targets to values resulting from
    // iteration on an iterable
    //
    // If the target has a single element (Name, Subscript, Attribute)
    // the generated code is element = next_${id}
    //
    // If the target is a List or Tuple: the value is expected to be iterable.
    // Create an object that reads all the values and supports methods
    // .read_one() and .read_rest() and call this function again with the
    // argument "unpacked" set to true
    if(target.type == 'simple'){
        var item = target.item
        var assign,
            assign_to = unpack
                            ? target.starred
                                ? `${iterable}.read_rest()`
                                : `${iterable}.read_one()`
                            : target.starred
                                ? `$B.read_rest(${iterable})`
                                : iterable

        switch(item.type){
            case 'id':
                assign = `${item.to_js()} = ${assign_to}`
                break
            case 'sub':
                assign = '$B.$setitem(' + item.value.to_js() +
                    ', ' + item.tree[0].to_js() + ', ' + assign_to + ')'
                break
            case 'attribute':
                assign = '$B.$setattr(' + item.value.to_js() +
                    ', "' + item.name + '", ' + assign_to + ')'
                break
            case 'packed':
                assign = item.tree[0].to_js() +
                    (unpacked ? ' = $next_${id}.read_rest()' :
                        ' = $B.rest_iter($next_${id})')
                break
            default:
                console.log('-- unexpected target type', item.type,
                    item)
                break
        }
        if(assign){
            return assign + '\n'
        }
    }else{
        var new_id = $B.UUID(),
            nb_targets = target.items.length,
            has_starred = !! $B.last(target.items).starred
        var nxt = unpack ? `${iterable}.read_one()` : iterable

        var js = `try{\n var $next_${new_id} = $B.unpacker(${nxt}, ` +
                 `${nb_targets}, ${has_starred})\n}` +
                 `catch(err){\n console.log("erreur");$B.leave_frame($locals); throw err\n}\n`
        for(var item of target.items){
            js += tg_to_js(item, `$next_${new_id}`, true)
        }
    }
    return js + '\n'
}

function make_target(target){
    // Create an ast-like structure for assignement target, initially based on
    // a $TargetListCtx.
    // Nodes have an attribute 'type': 'simple' or 'tuple'
    // 'simple' nodes have an attribute 'item': the context of the target item
    // (Name, Attribute, Subscript, Starred)
    // 'tuple' nodes have an attribute 'items': a list of target nodes
    if(target.type == 'expr'){
        return make_target(target.tree[0])
    }else if(target.tree === undefined || target.tree.length == 0){
        var res = {type: 'simple', item: target}
    }else if(target.tree.length > 1 || target.implicit_tuple){
        var res = {type: 'tuple', items: target.tree.map(make_target)}
    }else if(target.tree[0].type == 'list_or_tuple'){
        var res = {type: 'tuple', items: target.tree[0].tree.map(make_target)}
    }else{
        var item = target.tree[0]
        if(item.type == 'expr'){
            item = item.tree[0]
        }
        var res = {type: 'simple', item}
        if(target.packed){
            res = make_target(target.tree[0])
            res.starred = true
       }else if(target.tree[0].type == 'packed'){
            res = make_target(target.tree[0].tree[0])
            res.starred = true
        }
    }
    return res
}

$ForExpr.prototype.to_js = function(indent){
    this.js_processed = true

    var node = $get_node(this),
        indent = indent || node.get_indent(),
        targets = this.tree[0].tree,
        iterable = this.tree[1],
        id = $B.UUID()

    if(node.module === undefined){
        var module_id = $get_module(this).module
    }else{
        var module_id = node.module
    }
    module_id = module_id.replace(/\./g, '_')

    var target = make_target(this.tree[0])

    var assignment = tg_to_js(target, `$next_${id}`)

    var it = this.iterable_is_outermost ? 'expr' : iterable.to_js(),
        iteration = this.comp_body ? '' :
            `var $no_break${this.loop_num} = true\n`

    if(this.async){
        iteration += `var $iter_${id} = ${it}\n` +
            `var $type_${id} = _b_.type.$factory($iter_${id})\n` +
            `$iter_${id} = $B.$call($B.$getattr($type_${id}, "__aiter__"))($iter_${id})\n` +
            `var $next_func_${id} = $B.$call(` +
            `$B.$getattr($type_${id}, '__anext__'))\n` +
            `while(true){\n`+
            `  try{\n`+
            `    var $next_${id} = await $B.promise($next_func_${id}($iter_${id}))\n` +
            `  }catch(err){\n`+
            `    if($B.is_exc(err, [_b_.StopAsyncIteration])){\nbreak}\n` +
            `    else{\n$B.leave_frame({$locals, value: _b_.None});throw err}\n`+
            `  }\n`
    }else{
        iteration += `var $next_func_${id} = $B.next_of(${it})\n` +
                `while(true){\n`+
                `  try{\n`+
                `    var $next_${id} = $next_func_${id}()\n` +
                `  }catch(err){\n`+
                `    if($B.is_exc(err, [_b_.StopIteration])){\nbreak}\n` +
                `    else{\n$B.leave_frame({$locals, value: _b_.None});throw err}\n`+
                `  }\n`
    }
    var body = ''
    if(! this.comp_body){
        // If not in a comprehension, add JS translation of node children
        for(var child of node.children){
            body += '\n' + child.to_js()
        }
        // add line info of 'for' loop
        body += `;$locals.$line_info = "${node.line_num},${module_id}";` +
                'if($locals.$f_trace !== _b_.None){$B.trace_line()};_b_.None;'
        body += '\n}\n'

        // remove children to avoid processing in $Node.prototype.to_js()
        node.children = []
    }
    return (iteration + assignment + body).split('\n').
            map(x => '    '.repeat(indent) + x).join('\n')

}

var $FromCtx = $B.parser.$FromCtx = function(context){
    // Class for keyword "from" for imports
    this.type = 'from'
    this.parent = context
    this.module = ''
    this.names = []
    context.tree[context.tree.length] = this
    this.expect = 'module'
    this.scope = $get_scope(this)
}

$FromCtx.prototype.ast = function(){
    // ast.ImportFrom(module, names, level)
    var module = this.module,
        level = 0
    while(module.length > 0 && module.startsWith('.')){
        level++
        module = module.substr(1)
    }
    var res = {
        module: module || undefined,
        names: [],
        level
    }
    for(var name of this.names){
        if(Array.isArray(name)){
            res.names.push(new ast.alias(name[0], name[1]))
        }else{
            res.names.push(new ast.alias(name))
        }
    }
    return new ast.ImportFrom(res.module, res.names, res.level)
}

$FromCtx.prototype.add_name = function(name){
    this.names[this.names.length] = name
    if(name == '*'){this.scope.blurred = true}
}

$FromCtx.prototype.bind_names = function(){
    // Called at the end of the 'from' statement
    // Binds the names or aliases in current scope
    var scope = $get_scope(this)
    for(var name of this.names){
        if(Array.isArray(name)){
            name = name[1]
        }
        $bind(name, scope, this)
    }
}

$FromCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
                context.add_name(value)
                context.expect = ','
                return context
            }
            if(context.expect == 'alias'){
                context.names[context.names.length - 1] =
                    [$B.last(context.names), value]
                context.expect = ','
                return context
            }
        case '.':
          if(context.expect == 'module'){
              if(token == 'id'){context.module += value}
              else{context.module += '.'}
              return context
          }
        case 'import':
            if(context.names.length > 0){ // issue 1850
                $_SyntaxError(context,
                    ["only one 'import' allowed after 'from'"])
            }
            if(context.expect == 'module'){
                context.expect = 'id'
                return context
            }
        case 'op':
            if(value == '*' && context.expect == 'id'
                    && context.names.length == 0){
               if($get_scope(context).ntype !== 'module'){
                   $_SyntaxError(context,
                       ["import * only allowed at module level"])
               }
               context.add_name('*')
               context.expect = 'eol'
               return context
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
                    context.bind_names()
                    return $transition(context.parent, token)
                case 'id':
                    $_SyntaxError(context,
                        ['trailing comma not allowed without ' +
                            'surrounding parentheses'])
                default:
                    $_SyntaxError(context, ['invalid syntax'])
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)

}

$FromCtx.prototype.toString = function(){
    return '(from) ' + this.module + ' (import) ' + this.names
}

$FromCtx.prototype.to_js = function(){
    this.js_processed = true
    var scope = $get_scope(this),
        module = $get_module(this),
        mod = module.module,
        res = [],
        pos = 0,
        indent = $get_node(this).indent,
        head = ' '.repeat(indent)
    if(mod.startsWith("$exec")){
        var frame = $B.last($B.frames_stack)[1]
        if(frame.module && frame.module.__name__){
            mod = frame.module.__name__
        }
    }
    var mod_elts = this.module.split(".")
    for(var i = 0; i < mod_elts.length; i++){
        module.imports[mod_elts.slice(0, i + 1).join(".")] = true
    }
    var _mod = this.module.replace(/\$/g, ''),
        $package,
        packages = []
    while(_mod.length > 0){
        if(_mod.charAt(0) == '.'){
            if($package === undefined){
                if($B.imported[mod] !== undefined){
                    $package = $B.imported[mod].__package__
                    packages = $package.split('.')
                }
            }else{
                $package = $B.imported[$package]
                packages.pop()
            }
            if($package === undefined){
                return 'throw _b_.SystemError.$factory("Parent module \'\' ' +
                    'not loaded, cannot perform relative import")'
            }else if($package === 'None'){
                console.log('package is None !')
            }
            _mod = _mod.substr(1)
        }else{
            break
        }
    }
    if(_mod){packages.push(_mod)}
    this.module = packages.join('.')

    // FIXME : Replacement still needed ?
    var mod_name = this.module.replace(/\$/g, '')
    res[pos++] = 'var module = $B.$import("'
    res[pos++] = mod_name + '",["'
    var names = []
    for(var i = 0, len = this.names.length; i < len; i++){
        if(Array.isArray(this.names[i])){
            names.push(this.names[i][0])
        }else{
            names.push(this.names[i])
        }
    }
    res[pos++] = names.join('","') + '"], {'
    var sep = ''
    for (var attr in this.aliases) {
        res[pos++] = sep + '"' + attr + '": "' + this.aliases[attr] + '"'
        sep = ','
    }
    res[pos++] = '}, {}, true);'

    // Add names to local namespace
    if(this.names[0] == '*'){
        // Set attribute to indicate that the scope has a
        // 'from X import *' : this will make name resolution harder :-(
        scope.blurred = true
        res[pos++] = '\n' + head + '$B.import_all($locals, module);'
    }else{
        for(var name of this.names){
            var alias = name
            if(Array.isArray(name)){
                alias = name[1]
                name = name[0]
            }
            module.imports[this.module + '.' + name] = true
            res[pos++] = '\n' + head + '$locals["' +
                alias + '"] = $B.$getattr($B.imported["' +
                mod_name + '"], "' + name + '");'
        }
    }
    res[pos++] = '\n' + head + '_b_.None;'

    return res.join('');
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
            }else if(arg.op == '**'){
                args.kwarg = new ast.arg(arg.name)
            }
        }else{
            default_value = false
            if(arg.has_default){
                default_value = ast_or_obj(arg.tree[0])
            }
            var argument = new ast.arg(arg.name)
            if(arg.annotation){
                argument.annotation = ast_or_obj(arg.annotation.tree[0])
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
    return new ast.arguments(args.posonlyargs, args.args, args.vararg,
        args.kwonlyargs, args.kw_defaults, args.kwarg, args.defaults)
}

$FuncArgs.prototype.toString = function(){
    return 'func args ' + this.tree
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
            if(context.names.indexOf('*') > -1){
                // non-default arg after default arg is allowed for
                // keyword-only parameters, eg arg "z" in "f(x, *, y=1, z)"
                return
            }
            $_SyntaxError(context,
                ['non-default argument follows default argument'])
        }
        if(last.has_default){
            context.has_default = true
        }
    }

    switch (token) {
        case 'id':
            if(context.has_kw_arg){
                $_SyntaxError(context, 'duplicate keyword argument')
            }
            if(context.expect == 'id'){
                context.expect = ','
                if(context.names.indexOf(value) > -1){
                  $_SyntaxError(context,
                      ['duplicate argument ' + value +
                          ' in function definition'])
                }
            }
            return new $FuncArgIdCtx(context, value)
        case ',':
            if(context.expect == ','){
                check()
                context.expect = 'id'
                return context
            }
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
        case ')':
            check()
            var last = $B.last(context.tree)
            if(last && last.type == "func_star_arg"){
                if(last.name == "*"){
                    if(context.op == '*'){
                        // Form "def f(x, *)" is invalid
                        $_SyntaxError(context,
                            ['named arguments must follow bare *'])
                    }else{
                        $_SyntaxError(context, 'invalid syntax')
                    }
                }
            }
            return context.parent
        case 'op':
            if(context.has_kw_arg){
                $_SyntaxError(context, 'duplicate keyword argument')
            }
            var op = value
            context.expect = ','
            if(op == '*'){
                if(context.has_star_arg){
                    $_SyntaxError(context,'duplicate star argument')
                }
                return new $FuncStarArgCtx(context, '*')
            }else if(op == '**'){
                return new $FuncStarArgCtx(context, '**')
            }else if(op == '/'){ // PEP 570
                if(context.has_end_positional){
                    $_SyntaxError(context,
                        ['duplicate / in function parameters'])
                }else if(context.has_star_arg){
                    $_SyntaxError(context,
                        ['/ after * in function parameters'])
                }
                return new $EndOfPositionalCtx(context)
            }
            $_SyntaxError(context, 'token ' + op + ' after ' + context)
        case ':':
            if(context.parent.type == "lambda"){
                return $transition(context.parent, token)
            }
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$FuncArgs.prototype.to_js = function(){
    this.js_processed = true
    return $to_js(this.tree)
}

var $FuncArgIdCtx = $B.parser.$FuncArgIdCtx = function(context, name){
    // id in function arguments
    // may be followed by = for default value
    this.type = 'func_arg_id'
    if(["None", "True", "False"].indexOf(name) > -1){
        $_SyntaxError(context, 'invalid name')
    }

    this.name = name
    this.parent = context

    if(context.has_star_arg){
        context.parent.after_star.push(name)
    }else{
        context.parent.positional_list.push(name)
    }
    // bind name to function scope
    if(context.parent.type != "lambda"){
        var node = $get_node(this)
        if(node.binding.hasOwnProperty(name)){
            $_SyntaxError(context,
                ["duplicate argument '" + name + "' in function definition"])
        }
        $bind(name, node, this)
    }
    this.tree = []
    context.tree[context.tree.length] = this
    // add to locals of function
    var ctx = context
    while(ctx.parent !== undefined){
        if(ctx.type == 'def'){
            ctx.locals.push(name)
            break
        }
        ctx = ctx.parent
    }

    this.expect = '='
}

$FuncArgIdCtx.prototype.toString = function(){
    return 'func arg id ' + this.name + '=' + this.tree
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
                $_SyntaxError(context,
                    ['non-default argument follows default argument'])
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
                $_SyntaxError(context, 'token ' + token + ' after ' +
                    context)
            }
            return new $AbstractExprCtx(new $AnnotationCtx(context),
                false)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$FuncArgIdCtx.prototype.to_js = function(){
    this.js_processed = true
    return this.name + $to_js(this.tree)
}

var $FuncStarArgCtx = $B.parser.$FuncStarArgCtx = function(context,op){
    // Class for "star argument" in a function definition : f(*args)
    this.type = 'func_star_arg'
    this.op = op
    this.parent = context
    this.node = $get_node(this)

    context.has_star_arg = op == '*'
    context.has_kw_arg = op == '**'
    context.tree[context.tree.length] = this
}

$FuncStarArgCtx.prototype.toString = function(){
    return '(func star arg ' + this.op + ') ' + this.name
}

$FuncStarArgCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.name === undefined){
               if(context.parent.names.indexOf(value) > -1){
                 $_SyntaxError(context,
                     ['duplicate argument ' + value +
                         ' in function definition'])
               }
            }
            if(["None", "True", "False"].indexOf(value) > -1){
                $_SyntaxError(context, 'invalid name')
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
                return $transition(context.parent.parent, ":")
            }
            // annotation associated with a function parameter
            if(context.name === undefined){
                $_SyntaxError(context,
                    'annotation on an unnamed parameter')
            }
            return new $AbstractExprCtx(
                new $AnnotationCtx(context), false)
    }// switch
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$FuncStarArgCtx.prototype.set_name = function(name){
    this.name = name

    // bind name to function scope
    if(this.parent.parent.type != "lambda"){
        if(this.node.binding.hasOwnProperty(name)){
            $_SyntaxError(context,
                ["duplicate argument '" + name + "' in function definition"])
        }
        $bind(name, this.node, this)
    }

    // add to locals of function
    var ctx = this.parent
    while(ctx.parent !== undefined){
        if(ctx.type == 'def'){
            ctx.locals.push(name)
            break
        }
        ctx = ctx.parent
    }
    if(this.op == '*'){ctx.other_args = '"' + name + '"'}
    else{ctx.other_kw = '"' + name + '"'}
}

var GeneratorExpCtx = function(context){
    // create a List Comprehension
    // context is a $ListOrTupleCtx
    this.type = 'genexpr'
    this.tree = [context.tree[0]]
    this.tree[0].parent = this
    Comprehension.make_comp(this, context)
}

GeneratorExpCtx.prototype.ast = function(){
    // ast.GeneratorExp(elt, generators)
    // elt is the part evaluated for each item
    // generators is a list of comprehensions
    return new ast.GeneratorExp(
        ast_or_obj(this.tree[0]),
        Comprehension.generators(this.tree.slice(1))
    )
}

GeneratorExpCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ')'){
        this.has_await = Comprehension.has_await(this)
        if(this.parent.type == 'call'){
            return this.parent.parent
        }
        return this.parent
    }
    $_SyntaxError(context, 'token ' + token + 'after gen expr')
}

GeneratorExpCtx.prototype.to_js = function(){
    var node = $get_node(this),
        indent = node.get_indent()

    var id = this.id,
        expr = this.tree[0],
        first_for = this.tree[1]
        outmost_expr = first_for.tree[1].to_js()
    first_for.comp_body = true
    first_for.iterable_is_outermost = true
    var module_id = this.module.replace(/\./g, '_')
    var js = `(${this.has_await ? 'async ' : ''}function(expr){
        var $locals_${id} = {},
            $locals = $locals_${id}
        $locals.$line_info = '${node.line_num},${node.module}'\n` +
        Comprehension.code(this) +
        `
        var $top_frame = ["${id}", $locals_${id}, "${this.module}", $locals_${module_id}]
        $locals.$f_trace = $B.enter_frame($top_frame)
        ` +

        `var ${id} = ${this.has_await ? 'async ' : ''}function*(expr){
          var $top_frame = ["${id}", $locals_${id}, "${this.module}", $locals_${module_id}]
          $locals.$f_trace = $B.enter_frame($top_frame)
        `

    js += first_for.to_js(indent)

    var nb = -1
    for(var i = 2; i < this.tree.length; i++){
        nb++
        var stmt = this.tree[i]
        if(stmt.type == 'for'){
            stmt.comp_body = true
            js += '\n' + stmt.to_js(indent + nb)
        }else if(stmt.type == 'condition' && stmt.token == 'if'){
            js += '\n' + ' '.repeat(12 + 4 * nb) + stmt.to_js() + '{'
        }
    }

    var expr_has_await = Comprehension.has_await(expr)

    js +=  '\n' + ' '.repeat(16 + 4 * nb) +
            (expr_has_await ? 'var save_stack = $B.save_stack();\n' : '') +
            `try{
                var result = ${expr.to_js()}
             }catch(err){
             ` +
            (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '') +
            `
                 $B.leave_frame($locals)
                 throw err
             }
             ` +
             (expr_has_await ? '\n$B.restore_stack(save_stack, $locals);' : '') +
             `
             try{
                $B.leave_frame($locals)
                yield result
                $B.frames_stack.push($top_frame)
             }catch(err1){
                $B.frames_stack.push($top_frame)
                throw err1
             }`

    for(var i = 1; i < this.tree.length; i++){
        js += '\n' + ' '.repeat(12 + 4 * nb--) + '}'
    }
    js += `
            $B.leave_frame($locals)
        }
           $B.leave_frame($locals)
           return $B.generator.$factory(${id})(expr)
          }
          )(${outmost_expr})`
    return js
}

var $GlobalCtx = $B.parser.$GlobalCtx = function(context){
    // Class for keyword "global"
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'
    this.scope = $get_scope(this)
    this.scope.globals = this.scope.globals || new Set()
    this.module = $get_module(this)
    while(this.module.module != this.module.id){
        this.module = this.module.parent_block
    }
    this.module.binding = this.module.binding || {}
    this.$pos = $pos
}

$GlobalCtx.prototype.ast = function(){
    // Global(identifier* names)
    return new ast.Global(this.tree.map(item => item.value))
}

$GlobalCtx.prototype.toString = function(){
    return 'global ' + this.tree
}

function check_global_nonlocal(context, value, type){
    var scope = context.scope
    if(type == 'nonlocal' && scope.globals && scope.globals.has(value)){
        $_SyntaxError(context,
         [`name '${value}' is nonlocal and global`])
    }
    if(type == 'global' && scope.nonlocals && scope.nonlocals.has(value)){
        $_SyntaxError(context,
         [`name '${value}' is nonlocal and global`])
    }

    if(['def', 'generator'].indexOf(scope.ntype) > -1){
        var params = scope.context.tree[0]
        if(params.locals && params.locals.indexOf(value) > -1){
            $_SyntaxError(context,
             [`name '${value}' is parameter and ${type}`])
        }
        if(scope.binding[value]){
            console.log('scope ntype', scope)
            $_SyntaxError(context,
             [`name '${value}' is assigned to before ${type} declaration`])
        }
        if(scope.referenced && scope.referenced[value]){
            $_SyntaxError(context,
             [`name '${value}' is used prior to ${type} declaration`])
        }
    }
}

$GlobalCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
               check_global_nonlocal(context, value, 'global')
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$GlobalCtx.prototype.add = function(name){
    if(this.scope.annotations && this.scope.annotations.has(name)){
        $_SyntaxError(this, ["annotated name '" + name +
            "' can't be global"])
    }
    if(this.scope.type == "module"){
        // "global x" at module level does nothing
        return
    }
    if(this.scope.binding && this.scope.binding[name]){
        console.log('error globals, scope', this.scope)
        $pos = this.$pos - 1
        $_SyntaxError(this, [`name '${name}' is parameter and global`])
    }
    this.scope.globals.add(name)
    // Remove bindings between scope and module
    var mod = this.scope.parent_block
    if(this.module.module.startsWith("$exec")){
        while(mod && mod.parent_block !== this.module){
            // Set attribute _globals for intermediate scopes
            mod._globals = mod._globals || new Map()
            mod._globals.set(name, this.module.id)
            // Delete possibly existing binding below module level
            delete mod.binding[name]
            mod = mod.parent_block
        }
    }
    this.module.binding[name] = true
}

$GlobalCtx.prototype.to_js = function(){
    this.js_processed = true
    return ''
}

var $IdCtx = $B.parser.$IdCtx = function(context, value){
    // Class for identifiers (variable names)
    this.type = 'id'
    this.value = value // $mangle(value, context)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    var scope = this.scope = $get_scope(this)

    this.blurred_scope = this.scope.blurred
    this.env = clone(this.scope.binding)

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

    var ctx = context
    while(ctx.parent !== undefined){
        switch(ctx.type) {
          case 'ctx_manager_alias':
              // an alias in "with ctx_manager as obj" is bound
              $bind(value, scope, this)
              break
          case 'list_or_tuple':
          case 'dict_or_set':
          case 'call_arg':
          case 'def':
          case 'lambda':
            if(ctx.vars === undefined){ctx.vars = [value]}
            else if(ctx.vars.indexOf(value) == -1){ctx.vars.push(value)}
            if(this.call_arg&&ctx.type == 'lambda'){
                if(ctx.locals === undefined){ctx.locals = [value]}
                else{ctx.locals.push(value)}
            }
        }
        ctx = ctx.parent
    }

    var target_list = $parent_match(context, {type: 'target_list'})
    if(target_list){
        // An id defined as a target in a "for" loop is bound in the scope,
        // but *not* in the node bindings, because if the iterable is empty
        // the name has no value (cf. issue 1233)
        this.no_bindings = true
        this.bound = true
    }

    if(["def", "generator"].indexOf(scope.ntype) > -1){
        // if variable is declared inside a comprehension,
        // don't add it to function namespace
        var _ctx = this.parent
        while(_ctx){
            if(_ctx.comprehension){
                this.in_comp = true
                break
            }
            _ctx = _ctx.parent
        }
        if(context.type == 'expr' && context.parent.type == 'comp_if'){
            // form {x for x in foo if x>5} : don't put x in referenced names

        }else if(context.type == 'global'){
            if(scope.globals === undefined){
                scope.globals = new Set([value])
            }else{
                scope.globals.add(value)
            }
        }
    }
}

$IdCtx.prototype.ast = function(){
    if(['True', 'False', 'None'].indexOf(this.value) > -1){
        return new ast.Constant(_b_[this.value])
    }
    return new ast.Name(this.value,
        this.bound ? new ast.Store() : new ast.Load())
}

$IdCtx.prototype.toString = function(){
    return '(id) ' + this.value + ':' + (this.tree || '')
}

$IdCtx.prototype.transition = function(token, value){
    var context = this
    if(context.value == 'case' && context.parent.parent.type == "node"){
        // case at the beginning of a line : if the line ends with a colon
        // (:), it is the "soft keyword" `case` for pattern matching
        var start = context.parent.$pos,
            src = $get_module(this).src
        try{
            var flag = line_ends_with_comma(src.substr(start))
        }catch(err){
            $pos = start + err.offset
            $_SyntaxError(context, [err.message])
        }
        if(flag){
            var node = $get_node(context),
                parent = node.parent
            if((! node.parent) || !(node.parent.is_match)){
                $_SyntaxError(context, '"case" not inside "match"')
            }else{
                if(node.parent.irrefutable){
                    // "match" statement already has an irrefutable pattern
                    var name = node.parent.irrefutable,
                        msg = name == '_' ? 'wildcard' :
                            `name capture '${name}'`
                    $_SyntaxError(context,
                        [`${msg} makes remaining patterns unreachable`])
                }
            }
            return $transition(new $PatternCtx(
                new $CaseCtx(context.parent.parent)),
                    token, value)
        }
    }else if(context.value == 'match' && context.parent.parent.type == "node"){
        // same for match
        var start = context.parent.$pos,
            src = $get_module(this).src,
            flag = line_ends_with_comma(src.substr(start))
        if(flag){
            return $transition(new $AbstractExprCtx(
                new $MatchCtx(context.parent.parent), true),
                token, value)
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
                $_SyntaxError(context,
                    ["missing parenthesis in call to '" +
                    context.value + "'"])
            }
            $_SyntaxError(context, 'token ' + token + ' after ' +
                context)
    }
    if(this.parent.parent.type == "packed"){
        if(['.', '[', '('].indexOf(token) == -1){
            return this.parent.parent.transition(token, value)
        }
    }
    return $transition(context.parent, token, value)
}

$IdCtx.prototype.firstBindingScopeId = function(){
    // Returns the id of the first scope where this.name is bound
    var scope = this.scope,
        found = [],
        nb = 0
    while(scope){
        if(scope.globals && scope.globals.has(this.value)){
            return $get_module(this).id
        }
        if(scope.binding && scope.binding[this.value]){
            return scope.id
        }
        scope = scope.parent
    }
}

$IdCtx.prototype.boundBefore = function(scope){
    // Returns true if we are sure that the id is bound in the scope,
    // because there is at least one binding when going up the code tree.
    // This is used to avoid checking that the name exists at run time.
    // Example:
    //
    // def f():
    //     if some_condition():
    //         x = 9
    //     print(x)
    //
    // For the second "x", this.boundBefore() will return false because
    // the binding "x = 9" is not in the lines found when going up the
    // code tree. It will be translated to $local_search("x"), which will
    // check at run time if the name "x" exists and if not, raise an
    // UnboundLocalError.
    function test(node, name){
        if(node.bindings && node.bindings[name]){
            // Exclude function arguments, which are in node.bindings
            // if the node is a function definition
            // cf. issue #1688
            var ctx = node.context.tree[0]
            if(['def', 'generator'].indexOf(ctx.type) > -1 &&
                    ctx.locals.indexOf(name) > -1){
                return false
            }
            return true
        }
    }

    var node = $get_node(this),
        found = false
    var $test = this.value == "wxc"
    if($test){
        console.log(this.value, "bound before")
        console.log("node", node)
        console.log('scope', scope)
    }

    if((scope.ntype == "def" || scope.ntype == "generator") &&
            scope.context.tree[0].args.indexOf(this.value) > -1){
        return true
    }

    while(!found && node.parent){
        var pnode = node.parent
        if(test(pnode, this.value)){
            if($test){console.log("bound in", pnode)}
            return pnode.bindings[this.value]
        }
        for(var i = 0; i < pnode.children.length; i++){
            var child = pnode.children[i]
            if(child === node){break}
            if(test(child, this.value)){
                if($test){console.log("bound in child", child)}
                return child.bindings[this.value]
            }
        }
        if(pnode === scope){
            break
        }
        node = pnode
    }

    return found
}

$IdCtx.prototype.bindingType = function(scope){
    // If a binding explicitely sets the type of a variable (eg "x = 1")
    // the next references can use this type if there is no block
    // inbetween.
    // For code like:
    //
    //     x = 1
    //     x += 2
    //
    // for the id "x" in the second line, this.bindingType will return
    // "int".
    //
    // A block might reset the type, like in
    //
    //     x = 1
    //     if True:
    //         x = "a"
    //     x += 2
    //
    // For the id "x" in the last line, this.bindingType will just return
    // "true"
    var nb = 0,
        node = $get_node(this),
        found = false,
        unknown,
        ix

    while(!found && node.parent && nb++ < 100){
        var pnode = node.parent
        if(pnode.bindings && pnode.bindings[this.value]){
            return pnode.bindings[this.value]
        }
        for(var i = 0; i < pnode.children.length; i++){
            var child = pnode.children[i]
            if(child === node){break}
            if(child.bindings && child.bindings[this.value]){
                found = child.bindings[this.value]
                ix = i
            }
        }
        if(found){
            for(var j = ix + 1; j < pnode.children.length; j++){
                child = pnode.children[j]
                if(child.children.length > 0){
                    unknown = true
                    break
                }else if(child === node){
                    break
                }
            }
            return found || unknown
        }
        if(pnode === scope){
            break
        }
        node = pnode
    }

    return found
}

$IdCtx.prototype.to_js = function(arg){
    // Store the result in this.result
    // For generator expressions, to_js() is called in $make_node

    var innermost = $get_scope(this),
        scope = innermost,
        found = []

    if(this.result !== undefined && scope.ntype == 'generator'){
        return this.result
    }

    var val = $mangle(this.value, this)

    var $test = false // val == "ixq" //&& innermost.type == "listcomp"
    if($test){
        console.log("ENTER IdCtx.py2js line", $get_node(this).line_num,
            "\nthis", this, '\nscope', scope)
    }

    // Special cases
    if(val == '__BRYTHON__' || val == '$B'){
        return val
    }
    if(val.startsWith("comp_result_" + $B.lambda_magic)){
        if(this.bound){
            return "var " + val
        }
        return val
    }

    this.js_processed = true

    if(scope._globals && scope._globals.has(val)){
        this.global_module = scope._globals.get(val)
    }
    if(this.global_module){
        if(this.bound){
            return '$locals_' + this.global_module.replace(/\./g, "_") +
                '["' + val + '"]'
        }else{
            return '$B.$check_def_global("' + val + '", $locals_' +
                this.global_module.replace(/\./g, "_") + ')'
        }
    }

    var is_local = scope.binding[val] !== undefined,
        this_node = $get_node(this),
        bound_before = scope.comprehension ? [] : this_node.bound_before

    if($test){
        console.log('scope', this.scope, '\nbound before', bound_before, '\nthis', this)
    }
    this.nonlocal = scope.nonlocals && scope.nonlocals.has(val)

    // If name is bound in the scope, but not yet bound when this
    // instance of $IdCtx was created, it is resolved by a call to
    // $search or $local_search
    this.unbound = this.unbound || (is_local && !this.bound &&
        bound_before && bound_before.indexOf(val) == -1)

    if((!this.bound) && scope.context
            && scope.ntype == 'class' &&
            scope.context.tree[0].name == val){
        // Name of class referenced inside the class. Cf. issue #649
        return '$B.$search("' + val + '")'
    }

    if(this.unbound && ! this.nonlocal){
        if(scope.ntype == 'def' || scope.ntype == 'generator' ||
                scope.comprehension){
            return `$B.$local_search('${val}')`
        }else{
            return '$B.$search("' + val + '")'
        }
    }

    if($test){
        console.log("innermost", innermost)
    }
    var search_ids = ['"' + innermost.id + '"']
    // get global scope
    var gs = innermost

    while(true){
        if($test){
            console.log(val, gs.id, gs, search_ids)
            alert()
        }
        if(gs.parent_block){
            if(gs.parent_block == $B.builtins_scope){
                break
            }else if(gs.parent_block.id === undefined){
                break
            }
            gs = gs.parent_block
        }
        if(innermost.ntype != "class" || gs.parent_block === $B.builtins_scope){
            search_ids.push('"' + gs.id + '"')
        }
    }
    search_ids = "[" + search_ids.join(", ") + "]"

    if(innermost.globals && innermost.globals.has(val)){
        search_ids = ['"' + gs.id + '"']
        innermost = gs
    }

    if($test){
        console.log("search ids", search_ids)
    }

    if(this.nonlocal || this.bound){
        var bscope = this.firstBindingScopeId()
        if($test){console.log("binding", bscope)}
        // Might be undefined, for augmented assignments or if the name
        // has been deleted before (by del)
        if(bscope !== undefined){
            return "$locals_" + bscope.replace(/\./g, "_") + '["' +
                val + '"]'
        }else if(this.bound){
            return "$locals_" + innermost.id.replace(/\./g, "_") +
                '["' + val + '"]'
        }
    }

    var global_ns = '$locals_' + gs.id.replace(/\./g, '_')

    // Build the list of scopes where the variable name is bound
    while(1){
        if(scope.globals !== undefined && scope.globals.has(val)){
            if($test){
                console.log("in globals of", scope.id, 'globals', gs)
            }
            // Variable is declared as global. If the name is bound in the
            // global scope, use it ; if the name is being bound, bind it
            // in the global namespace.
            // Else return a call to a function that searches the name in
            // globals, and throws NameError if not found.
            if(this.boundBefore(gs)){
                if($test){console.log("bound before in gs", gs, global_ns)}
                return global_ns + '["' + val + '"]'
            }else{
                if($test){console.log("use global search", this)}
                if(this.augm_assign){
                    return global_ns + '["' + val + '"]'
                }else{
                    return '$B.$check_def("' + val + '", ' + global_ns +
                        '["' + val + '"])'
                }
            }
        }
        if($test){
            console.log("scope", scope.id, scope, "\ninnermost", innermost,
                "\nscope is innermost", scope === innermost,
                "\nbound_before", bound_before,
                "\nfound", found.slice())
        }
        if(scope === innermost){
            // Handle the case when the same name is used at both sides
            // of an assignment and the right side is defined in an
            // upper scope, eg "range = range"
            if(bound_before && bound_before.length > 0){
                if(bound_before.indexOf(val) > -1){
                    if($test){
                        console.log('add innermost because of bound_before',
                            scope)
                    }
                    found.push(scope)
                }else if(scope.context &&
                        scope.context.tree[0].type == 'def' &&
                        scope.context.tree[0].env.indexOf(val) > -1){
                    found.push(scope)
                }
            }else{
                if(scope.binding[val]){
                    if($test){
                        console.log(val, 'in bindings of', scope.id,
                            this_node.locals[val])
                    }

                    // the name is bound somewhere in the local scope
                    if(this_node.locals[val] === undefined){
                        // the name is referenced (not bound) but it was
                        // not bound before the current statement
                        if(!scope.is_comp &&
                                (!scope.parent_block ||
                                    !scope.parent_block.is_comp)){
                            // put scope in found, except if the scope is
                            // a comprehension or generator expression
                            found.push(scope)
                        }
                    }else{
                        found.push(scope)
                        break
                    }
                    if($test){console.log(val, "found in", scope.id)}
                }
            }
        }else{
            if(scope.binding === undefined){
                console.log("scope", scope, val, "no binding", innermost)
            }
            if(innermost.binding[val] && innermost.ntype == "class"){
                // If the name is bound in a class definition, it can be
                // resolved only in the class, or in the global namespace
                // Cf. issue #1596
                if(scope.binding[val] &&
                        (! scope.parent_block ||
                         scope.parent_block.id == "__builtins__")){
                    found.push(scope)
                    console.l                }
            }else if(scope.binding[val]){
                found.push(scope)
            }
        }
        if(scope.parent_block){
            scope = scope.parent_block
        }else{
            break
        }
    }
    this.found = found
    if($test){
        console.log(val, "found", found)
        for(var item of found){
            console.log(item.id)
        }
    }

    if(this.nonlocal && found[0] === innermost){found.shift()}

    if(found.length > 0){
        // If name is not in the left part of an assignment,
        // and it is bound in the current block but not yet bound when the
        // line is parsed,
        // and it is not declared as nonlocal,
        // and it is not an internal variable starting with "$",
        // return the execution of function $B.$local_search(val) in
        // py_utils.js that searches the name in the local namespace
        // and raises UnboundLocalError if it is undefined

        // The id may be valid in code like :

        // def f():
        //     for i in range(2):
        //         if i == 1:
        //             return x   # x is local but not yet found by parser
        //         elif i == 0:
        //             x = 'ok'

        if(found[0].context && found[0] === innermost
                && val.charAt(0) != '$'){
            var locs = this_node.locals || {},
                nonlocs = innermost.nonlocals
            try{
                if(locs[val] === undefined &&
                        ! this.augm_assign &&
                        ((innermost.type != 'def' ||
                             innermost.type != 'generator') &&
                        innermost.ntype != 'class' &&
                        innermost.context.tree[0].args &&
                        innermost.context.tree[0].args.indexOf(val) == -1) &&
                        (nonlocs === undefined || nonlocs[val] === undefined)){
                    if($test){
                        console.log("$local search", val, "found", found,
                        "innermost", innermost, "this", this)
                    }
                    this.result = '$B.$local_search("' + val + '")'
                    return this.result
                }
            }catch(err){
                console.log("error", val, innermost)
                throw err
            }
        }
        if(found.length > 1 && found[0].context){
            if(found[0].context.tree[0].type == 'class'){
                var ns0 = '$locals_' + found[0].id.replace(/\./g, '_'),
                    ns1 = '$locals_' + found[1].id.replace(/\./g, '_'),
                    res

                // If the id is referenced in a class body, and an id of
                // the same name is bound in an upper scope, we must check
                // if it has already been bound in the class, else we use
                // the upper scope
                // This happens in code like
                //
                //    x = 0
                //    class A:
                //        print(x)    # should print 0
                //        def x(self):
                //            pass
                //        print(x)    # should print '<function x>'
                //
                if(bound_before){
                    if(bound_before.indexOf(val) > -1){
                        this.found = found[0].binding[val]
                        res = ns0
                    }else{
                        this.found = found[1].binding[val]
                        res = ns1
                    }
                    this.result = res + '["' + val + '"]'
                    return this.result
                }else{
                    this.found = false
                    var res = ns0 + '["' + val + '"] !== undefined ? '
                    res += ns0 + '["' + val + '"] : '
                    this.result = "(" + res + ns1 + '["' + val + '"])'
                    return this.result
                }
            }
        }

        var scope = found[0]
        if($test){
            console.log(val, 'in scope', scope)
        }
        this.found = scope.binding[val]

        var scope_ns = '$locals_' + scope.id.replace(/\./g, '_')

        if(scope.context === undefined && ! scope.comprehension){
            if($test){console.log("module level", scope.id, scope.module)}
            // name found at module level
            if(scope.id == '__builtins__'){
                if(gs.blurred){
                    // If the program has "from <module> import *" we
                    // can't be sure by syntax analysis that the builtin
                    // name is not overridden
                    val = '(' + global_ns + '["' + val + '"] || _b_.' + val + ')'
                }else{
                    // Builtin name ; it might be redefined inside the
                    // script, eg to redefine open()
                    //if(val !== '__builtins__'){
                        val = '_b_.' + val
                    //}
                    this.is_builtin = true
                }
            }else{
                // Name found at module level
                if($test){console.log("name found at module level")}
                if(this.bound || this.augm_assign){
                    // If the id is in the left part of a binding or
                    // an augmented assign, eg "x = 0" or "x += 5"
                    val = scope_ns + '["' + val + '"]'
                }else{
                    if(scope === innermost && this.env[val] === undefined){
                        // Call a function to return the value if it is
                        // defined in locals or globals, or raise a
                        // NameError
                        this.result = '$B.$search("' + val + '")'
                        return this.result
                    }else{
                        if($test){
                            console.log("boudn before ?", scope, this.boundBefore(scope))
                        }
                        if(this.boundBefore(scope)){
                            // We are sure that the name is defined in the
                            // scope
                            val = scope_ns + '["' + val + '"]'
                        }else{
                            // Else we must check if the name is actually
                            // defined, cf issue #362. This can be the case
                            // in code like :
                            //     if False:
                            //         x = 0
                            if($test){console.log("use check def", scope)}
                            val = '$B.$check_def("' + val + '",' +
                                scope_ns + '["' + val + '"])'
                        }
                    }
                }
            }
        }else if(scope === innermost){
            if($test){console.log("scope is innermost", scope.id)}
            if(scope.globals && scope.globals.has(val)){
                val = global_ns + '["' + val + '"]'
            }else if(!this.bound && !this.augm_assign){
                // Search all the lines in the scope where the name is
                // bound. If it is not "above" the current line when going
                // up the code tree, use $check_def_local which will
                // check at run time if the name is defined or not.
                // Cf. issue #836
                if(this.boundBefore(scope)){
                    val = '$locals["' + val + '"]'
                }else{
                    val = '$B.$check_def_local("' + val + '",$locals["' +
                        val + '"])'
                }
            }else{
                val = '$locals["' + val + '"]'
            }
        }else if(!this.augm_assign){
            // name was found between innermost and the global of builtins
            // namespace
            val = '$B.$check_def_free("' + val + '",' + scope_ns +
                '["' + val + '"])'
        }else{
            val = scope_ns + '["' + val + '"]'
        }
        this.result = val + $to_js(this.tree, '')
        return this.result
    }else{
        // Name was not found in bound names
        // It may have been introduced in the globals namespace by an exec,
        // or by "from A import *"

        // First set attribute "unknown_binding", used to avoid using
        // augmented assignement operators in this case
        this.unknown_binding = true

        // If the name exists at run time in the global namespace, use it,
        // else raise a NameError
        // Function $search is defined in py_utils.js

        this.result = '$B.$global_search("' + val + '", ' + search_ids + ')'
        return this.result
    }
}

var $ImportCtx = $B.parser.$ImportCtx = function(context){
    // Class for keyword "import"
    this.type = 'import'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'
}

$ImportCtx.prototype.ast = function(){
    //ast.Import(names)
    var names = []
    for(var item of this.tree){
        var alias = new ast.alias(item.name)
        if(item.alias != item.name){
            alias.asname = item.alias
        }
        names.push(alias)
    }
    return new ast.Import(names)
}

$ImportCtx.prototype.toString = function(){
    return 'import ' + this.tree
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
               context.bind_names()
               return $transition(context.parent, token)
            }
            break
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$ImportCtx.prototype.bind_names = function(){
    // For "import X", set X in the list of names bound in current scope
    var scope = $get_scope(this)
    for(var item of this.tree){
        if(item.name == item.alias){
            var name = item.name,
                parts = name.split('.'),
                bound = name
            if(parts.length>1){
                bound = parts[0]
            }
        }else{
            bound = item.alias
        }
        $bind(bound, scope, this)
    }
}

$ImportCtx.prototype.to_js = function(){
    this.js_processed = true
    var scope = $get_scope(this),
        res = [],
        module = $get_module(this)
    for(var item of this.tree){
        var mod_name = item.name,
            aliases = (item.name == item.alias)?
                '{}' : ('{"' + mod_name + '" : "' +
                item.alias + '"}'),
            localns = '$locals_' + scope.id.replace(/\./g, '_'),
            mod_elts = item.name.split(".")
        for(var i = 0; i < mod_elts.length; i++){
            module.imports[mod_elts.slice(0, i + 1).join(".")] = true
        }
        var js = '$B.$import("' + mod_name + '", [],' + aliases +
            ',' + localns + ', true);'
        res.push(js)
    }
    // add None for interactive console
    return res.join('') + '_b_.None;'
}

var $ImportedModuleCtx = $B.parser.$ImportedModuleCtx = function(context,name){
    this.type = 'imported module'
    this.parent = context
    this.name = name
    this.alias = name
    context.tree[context.tree.length] = this
}

$ImportedModuleCtx.prototype.toString = function(){
    return ' (imported module) ' + this.name
}

$ImportedModuleCtx.prototype.transition = function(token, value){
    var context = this
}

$ImportedModuleCtx.prototype.to_js = function(){
    this.js_processed = true
    return '"' + this.name + '"'
}

var JoinedStrCtx = $B.parser.JoinedStrCtx = function(context, values){
    // Class for f-strings. values is an Array with strings or expressions
    this.type = 'JoinedStr'
    this.parent = context
    this.tree = []
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
            var src = value.expression,
                save_pos = $pos,
                root = $create_root_node({src},
                    this.scope.module, this.scope.id,
                    this.scope.parent_block, line_num)

            // expression has access to local scope
            root.binding = $B.clone(this.scope.binding)

            try{
                dispatch_tokens(root, src)
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
                $B.last(res.values).value += eval(item.value)
            }else{
                res.values.push(new ast.Constant(eval(item.value)))
            }
            state = 'string'
        }else{
            var conv_num = {a: 97, r: 114, s: 115},
                format = item.elt.format
            format = format === undefined ? format : ast_or_obj(format)
                value = new ast.FormattedValue(
                    ast_or_obj(item),
                    conv_num[item.elt.conversion] || -1,
                    format)
            var format = item.format
            if(format !== undefined){
                value.format = item.format.ast()
            }
            res.values.push(value)
            state = 'formatted_value'
        }
    }
    return new ast.JoinedStr(res.values)
}

JoinedStrCtx.prototype.toString = function(){
    return 'f-string ' + (this.tree || '')
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
                    typeof $B.last(context.tree) == "string"){
                context.tree[context.tree.length - 1] =
                    $B.last(context.tree) + eval(value)
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

JoinedStrCtx.prototype.to_js = function(){
    this.js_processed = true
    var res = '',
        elts = []
    for(var value of this.tree){
        if(value instanceof $StringCtx){
            elts.push(value.to_js())
        }else{
            // elt is an expression
            var elt = value.elt,
                js = value.to_js()
            // search specifier
            var pos = 0,
                br_stack = []

            switch(elt.conversion){
                case "a":
                    js = '_b_.ascii(' + js + ')'
                    break
                case "r":
                    js = '_b_.repr(' + js + ')'
                    break
                case "s":
                    js = '_b_.str.$factory(' + js + ')'
                    break
            }

            var fmt = elt.format
            if(fmt !== undefined){
                js = "_b_.str.format('{0:' + " +
                        fmt.to_js() + " + '}', " + js + ")"
            }else{
                if(elt.conversion === null){
                    js = '_b_.str.$factory(' + js + ')'
                }
            }
            elts.push(js)
        }
    }
    return "$B.String(" + (elts.join(' + ') || "''") + ")"
}

var $JSCode = $B.parser.$JSCode = function(js){
    this.js = js
}

$JSCode.prototype.toString = function(){return this.js}

$JSCode.prototype.transition = function(token, value){
    var context = this
}

$JSCode.prototype.to_js = function(){
    this.js_processed = true
    return this.js
}

var $KwArgCtx = $B.parser.$KwArgCtx = function(context){
    // Class for keyword argument in a call
    this.type = 'kwarg'
    this.parent = context.parent
    this.tree = [context.tree[0]]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)

    // set attribute "has_kw" of $CallCtx instance to true
    context.parent.parent.has_kw = true

    // put id in list of kwargs
    // used to avoid passing the id as argument of a list comprehension
    var value = this.tree[0].value
    var ctx = context.parent.parent // type 'call'
    if(ctx.kwargs === undefined){ctx.kwargs = [value]}
    else if(ctx.kwargs.indexOf(value) == -1){ctx.kwargs.push(value)}
    else{$_SyntaxError(context, ['keyword argument repeated'])}
}

$KwArgCtx.prototype.toString = function(){
    return 'kwarg ' + this.tree[0] + '=' + this.tree[1]
}

$KwArgCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ','){return new $CallArgCtx(context.parent.parent)}
    return $transition(context.parent, token)
}

$KwArgCtx.prototype.to_js = function(){
    this.js_processed = true
    var key = this.tree[0].value
    var res = '{$nat:"kw",name:"' + key + '",'
    return res + 'value:' +
        $to_js(this.tree.slice(1, this.tree.length)) + '}'
}

var $LambdaCtx = $B.parser.$LambdaCtx = function(context){
    // Class for keyword "lambda"
    this.type = 'lambda'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.args_start = $pos + 6
    this.vars = []
    this.locals = []

    // initialize object for names bound in the function
    this.node = $get_node(this)
    // this.node.binding = {}

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
    return new ast.Lambda(args, ast_or_obj(this.tree[0]))
}

$LambdaCtx.prototype.toString = function(){
    return '(lambda) ' + this.args_start + ' ' + this.body_start
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
    if(context.args === undefined && token != "("){
        return $transition(new $FuncArgs(context), token, value)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$LambdaCtx.prototype.to_js = function(){

    this.js_processed = true

    var context = this.parent,
        node = this.node,
        module = $get_module(this),
        src = $get_src(context),
        args = src.substring(this.args_start, this.body_start),
        body = src.substring(this.body_start + 1, this.body_end)
        body = body.replace(/\\\n/g, ' ') // cf issue 582

    var scope = $get_scope(this)

    var rand = $B.UUID(),
        func_name = 'lambda_' + $B.lambda_magic + '_' + rand,
        py = 'def ' + func_name + '(' + args + '):\n'
    py += '    return (' + body + '\n)'

    var lambda_name = 'lambda' + rand,
        module_name = module.id.replace(/\./g, '_')

    var root = $B.py2js(py, module_name, lambda_name, scope, node.line_num)
    var js = root.to_js()

    var params = `$locals_${lambda_name}`,
        args = "{}"
    if(module.is_comp){
        // If the lambda function is inside a comprehension, the $locals
        // for the comprehension must be passed because it is used in the
        // code for the lambda function
        params += `, $locals_${module.id.replace(/\./g, '_')}`
        // The locals object for the comprehension may be undefined
        args += `, typeof $locals_${module.id.replace(/\./g, '_')} `+
            ` === "undefined" ? {} : $locals_${module.id.replace(/\./g, '_')}`
    }
    js = `(function(${params}){\n` + js +
        `\nreturn $locals.${func_name}})(${args})`

    $B.clear_ns(lambda_name)
    $B.$py_src[lambda_name] = null
    delete $B.$py_src[lambda_name]

    return js
}


var ListCompCtx = function(context){
    // create a List Comprehension
    // context is a $ListOrTupleCtx
    this.type = 'listcomp'
    this.tree = [context.tree[0]]
    this.tree[0].parent = this
    Comprehension.make_comp(this, context)
}

ListCompCtx.prototype.ast = function(){
    // ast.ListComp(elt, generators)
    // elt is the part evaluated for each item
    // generators is a list of comprehensions
    return new ast.ListComp(
        ast_or_obj(this.tree[0]),
        Comprehension.generators(this.tree.slice(1))
    )
}

ListCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ']'){
        this.has_await = Comprehension.has_await(this)
        return this.parent
    }
    $_SyntaxError(context, 'token ' + token + 'after list comp')
}

ListCompCtx.prototype.to_js = function(){

    var node = $get_node(this),
        indent = node.get_indent()

    var id = this.id,
        expr = this.tree[0],
        first_for = this.tree[1],
        outmost_expr = first_for.tree[1].to_js()
    first_for.comp_body = true
    first_for.iterable_is_outermost = true

    var js = `(${this.has_await ? 'async ' : ''}function(expr){` +
        Comprehension.admin_infos(this) +
        `var $result_${id} = []\n`

    js += first_for.to_js(indent)
    var nb = -1
    for(var i = 2; i < this.tree.length; i++){
        nb++
        var stmt = this.tree[i]
        if(stmt.type == 'for'){
            stmt.comp_body = true
            js += '\n' + stmt.to_js(indent + nb)
        }else if(stmt.type == 'condition' && stmt.token == 'if'){
            js += '\n' + ' '.repeat(12 + 4 * nb) + stmt.to_js() + '{'
        }
    }

    var expr_has_await = Comprehension.has_await(expr)

    js +=  '\n' + ' '.repeat(16 + 4 * nb) +
            (expr_has_await ? 'var save_stack = $B.save_stack();\n' : '') +
            `try{\n` +
            ` $result_${id}.push(${expr.to_js()})\n` +
            `}catch(err){\n` +
            (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '') +
            `$B.leave_frame($locals); throw err\n}` +
            (expr_has_await ? '\n$B.restore_stack(save_stack, $locals);' : '')


    for(var i = 1; i < this.tree.length; i++){
        js += '\n' + ' '.repeat(12 + 4 * nb--) + '}'
    }
    js += `\n$B.leave_frame({$locals, value: _b_.None})`
    js += `\nreturn $result_${id}`
    js += `\n}\n)(${outmost_expr})`
    return js
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
    context.tree[context.tree.length] = this
}

$ListOrTupleCtx.prototype.ast = function(){
    var elts = this.tree.map(ast_or_obj)
    if(this.real == 'list'){
        return new ast.List(elts, new ast.Load())
    }else if(this.real == 'tuple'){
        return new ast.Tuple(elts, new ast.Load())
    }else{
        console.log('list_or_tuple ast, real', this.real)
        return this
    }
}

$ListOrTupleCtx.prototype.toString = function(){
    switch(this.real) {
      case 'list':
        return '(list) [' + this.tree + ']'
      default:
        return '(tuple) (' + this.tree + ')'
    }
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
                        var close = true
                        if(context.tree.length == 1){
                            // make single element replace tuple as child of
                            // context.parent.parent
                            var grandparent = context.parent.parent
                            // remove expr tuple
                            grandparent.tree.pop()
                            grandparent.tree.push(context.tree[0])
                            context.tree[0].parent = grandparent
                            return context.tree[0]
                        }
                        if(context.packed ||
                                (context.type == 'list_or_tuple' &&
                                 context.tree.length == 1 &&
                                 context.tree[0].type == 'expr' &&
                                 context.tree[0].tree[0].type == 'packed')){
                             // syntax "(*x)"
                            $_SyntaxError(context,
                                ["cannot use starred expression here"])
                        }
                        if(close){
                            context.close()
                        }
                        if(context.parent.type == "packed"){
                            return context.parent.parent
                        }
                        return context.parent
                    }
                    break
                case 'list':
                    if(token == ']'){
                         context.close()
                         if(context.parent.type == "packed"){
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
                            $_SyntaxError(context, ["did you forget " +
                                "parentheses around the comprehension target?"])
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
                    $_SyntaxError(context,
                        'unexpected = inside list')
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
                    $_SyntaxError(context, 'unexpected "if" inside list')
                case ',':
                    $_SyntaxError(context,
                        'unexpected comma inside list')
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
                    $_SyntaxError(context, 'unexpected operator: ' + value)
                default:
                    $_SyntaxError(context, 'token ' + token)
            }

        }else{
            return $transition(context.parent, token, value)
        }
    }
}

$ListOrTupleCtx.prototype.close = function(){
    this.closed = true
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

$ListOrTupleCtx.prototype.get_src = function(){
    // Return the Python source code
    var src = $get_module(this).src
    // replace comments by whitespace, cf. issue #658
    var scope = $get_scope(this)
    if(scope.comments === undefined){return src}
    for(var comment of scope.comments){
        var start = comment[0],
            len = comment[1]
        src = src.substr(0, start) + ' '.repeat(len + 1) +
            src.substr(start + len + 1)
    }
    return src
}

$ListOrTupleCtx.prototype.bind_ids = function(scope){
    // Used by $AssignCtx for assignments to a list or tuple
    // Binds all the "simple" ids (not the calls, subscriptions, etc.)
    for(var item of this.tree){
        if(item.type == 'id'){
            $bind(item.value, scope, this)
            item.bound = true
        }else if(item.type == 'expr' && item.tree[0].type == "id"){
            $bind(item.tree[0].value, scope, this)
            item.tree[0].bound = true
        }else if(item.type == 'expr' && item.tree[0].type == "packed"){
            var ctx = item.tree[0].tree[0]
            if(ctx.type == 'expr' && ctx.tree[0].type == 'id'){
                $bind(ctx.tree[0].value, scope, this)
                ctx.tree[0].bound = true
            }
        }else if(item.type == 'list_or_tuple' ||
                (item.type == "expr" &&
                    item.tree[0].type == 'list_or_tuple')){
            if(item.type == "expr"){item = item.tree[0]}
            item.bind_ids(scope)
        }
    }
}

$ListOrTupleCtx.prototype.packed_indices = function(){
    var ixs = []
    for(var i = 0; i < this.tree.length; i++){
        var t = this.tree[i]
        if(t.type == "expr"){
            t = t.tree[0]
            if(t.type == "packed" ||
                    (t.type == "call" && t.func.type == "packed")){
                ixs.push(i)
            }
        }
    }
    return ixs
}

$ListOrTupleCtx.prototype.unpack = function(packed){
    var js = "", res
    for(var i = 0; i < this.tree.length; i++){
        if(packed.indexOf(i) > -1){
            res = "_b_.list.$factory(" + this.tree[i].to_js() +")"
        }else{
            res = "[" + this.tree[i].to_js() + "]"
        }
        if(i > 0){res = ".concat(" + res + ")"}
        js += res
    }
    return js
}

$ListOrTupleCtx.prototype.to_js = function(){
    this.js_processed = true
    var scope = $get_scope(this),
        sc = scope,
        scope_id = scope.id.replace(/\//g, '_'),
        pos = 0
    var root = $get_module(this),
        module_name = root.module

    switch(this.real) {
        case 'list':
            var packed = this.packed_indices()
            if(packed.length > 0){
                return '$B.$list(' + this.unpack(packed) + ')'
            }
            return '$B.$list([' + $to_js(this.tree) + '])'

        case 'tuple':
            var packed = this.packed_indices()
            if(packed.length > 0){
                return '$B.fast_tuple(' + this.unpack(packed) + ')'
            }
            if(this.tree.length == 1 && this.has_comma === undefined){
                return this.tree[0].to_js()
            }
            return '$B.fast_tuple([' + $to_js(this.tree) + '])'
    }
}

var $MatchCtx = $B.parser.$MatchCtx = function(node_ctx){
    // node already has an expression with the id "match"
    this.type = "match"
    node_ctx.tree = [this]
    node_ctx.node.is_match = true
    this.parent = node_ctx
    this.tree = []
    this.expect = 'as'
}

$MatchCtx.prototype.ast = function(){
    // ast.Match(subject, cases)
    // subject holds the subject of the match
    // cases contains an iterable of match_case nodes with the different cases
    var res = new ast.Match(ast_or_obj(this.tree[0]), ast_body(this.parent))
    res.$line_num = $get_node(this).line_num
    return res
}

$MatchCtx.prototype.transition = function(token, value){
    var context = this
    switch(token){
        case 'as':
            return new $AbstractExprCtx(new $AliasCtx(context))
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
    }
}

$MatchCtx.prototype.to_js = function(){
    return 'var subject = ' + $to_js(this.tree) + ';if(true)'
}

var NamedExprCtx = function(context){
    // context is an expression where context.tree[0] is an id
    this.type = 'named_expr'
    this.target = context.tree[0]
    this.target.scope_ref = this.target.binding_scope.id.replace(/\./g, '_')
    context.tree.pop()
    context.tree.push(this)
    this.parent = context
    this.target.parent = this
    this.tree = []
}

NamedExprCtx.prototype.ast = function(){
    var res = new ast.NamedExpr(ast_or_obj(this.target),
        ast_or_obj(this.tree[0]))
    res.target.ctx = new ast.Store()
    return res
}

NamedExprCtx.prototype.transition = function(token, value){
    return $transition(this.parent, token, value)
}

NamedExprCtx.prototype.to_js = function(){
    return `($locals_${this.target.scope_ref}.${this.target.value} ` +
        `= ${this.tree[0].to_js()})`
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

    // When a new node is created, a copy of the names currently
    // bound in the scope is created. It is used in $IdCtx to detect
    // names that are referenced but not yet bound in the scope
    this.node.locals = clone(scope.binding)
    this.scope = scope
}

$NodeCtx.prototype.toString = function(){
    return 'node ' + this.tree
}

$NodeCtx.prototype.transition = function(token, value){
    var context = this
    if(this.node.parent && this.node.parent.context){
        var pctx = this.node.parent.context
        if(pctx.tree && pctx.tree.length == 1 &&
                pctx.tree[0].type == "match"){
            if(token != 'eol' && (token !== 'id' || value !== 'case')){
                context.$pos = $pos
                $_SyntaxError(context,
                    'line does not start with "case"')
            }
        }
    }
    if(this.tree.length == 0 && this.node.parent){
        var rank = this.node.parent.children.indexOf(this.node)
        if(rank > 0){
            var previous = this.node.parent.children[rank - 1]
            if(previous.context.tree[0].type == 'try' &&
                    ['except', 'finally'].indexOf(token) == -1){
                $_SyntaxError(context, ["expected 'except' or 'finally' block"])
            }
        }
    }
    switch(token) {
        case ',':
            if(context.tree && context.tree.length == 0){
                $_SyntaxError(context,
                    'token ' + token + ' after ' + context)
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
            return new $AbstractExprCtx(new $AwaitCtx(context), true)
        case 'break':
            return new $BreakCtx(context)
        case 'class':
            return new $ClassCtx(context)
        case 'continue':
            return new $ContinueCtx(context)
        case '__debugger__':
            return new $DebuggerCtx(context)
        case 'def':
            return new $DefCtx(context)
        case 'del':
            return new $AbstractExprCtx(new $DelCtx(context),true)
        case 'elif':
            try{
                var previous = $previous(context)
            }catch(err){
                $_SyntaxError(context, "'elif' does not follow 'if'")
            }
            if(['condition'].indexOf(previous.type) == -1 ||
                    previous.token == 'while'){
                $_SyntaxError(context, 'elif after ' + previous.type)
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
                $_SyntaxError(context, 'else after ' + previous.type)
            }
            return new $SingleKwCtx(context,token)
        case 'except':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type) == -1){
                $_SyntaxError(context, 'except after ' + previous.type)
            }
            return new $ExceptCtx(context)
        case 'finally':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type) == -1 &&
                    (previous.type != 'single_kw' ||
                        previous.token != 'else')){
                $_SyntaxError(context, 'finally after ' + previous.type)
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
                    return new $AbstractExprCtx(
                        new $UnaryCtx(
                            new $ExprCtx(context, 'unary', true), value), false)
                case '@':
                    return new $DecoratorCtx(context)
            }
            break
        case 'pass':
            return new $PassCtx(context)
        case 'raise':
            return new $AbstractExprCtx(new $RaiseCtx(context), true)
        case 'return':
            return new $AbstractExprCtx(new $ReturnCtx(context),true)
        case 'try':
            return new $TryCtx(context)
        case 'with':
            return new $AbstractExprCtx(new $WithCtx(context),false)
        case 'yield':
            return new $AbstractExprCtx(new $YieldCtx(context),true)
        case 'eol':
            if(context.tree.length == 0){ // might be the case after a :
                context.node.parent.children.pop()
                return context.node.parent.context
            }
            return context
    }
    console.log('token', token, value)
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$NodeCtx.prototype.to_js = function(){
    if(this.js !== undefined){return this.js}
    this.js_processed = true
    this.js = ""
    if(this.tree[0]){
        var is_not_def = ["def", "generator"].indexOf(this.scope.ntype) == -1
        if(this.tree[0].annotation){
            // Node is annotation
            if(is_not_def){
                if(this.tree[0].type == "expr" &&
                        ! this.tree[0].$in_parens &&
                        this.tree[0].tree[0].type == "id"){
                    var js = ""
                    if(this.create_annotations){
                        js += "$locals.__annotations__ = $B.empty_dict();"
                    }
                    return js + "_b_.dict.$setitem($locals.__annotations__, '" +
                        this.tree[0].tree[0].value + "', " +
                        this.tree[0].annotation.to_js() + ");"
                }else if(this.tree[0].type == "def" ||
                        this.tree[0].type == "generator"){
                    // Evaluate annotation
                    this.js = this.tree[0].annotation.to_js() + ";"
                }else{
                    // Don't evaluate
                    this.js = ""
                }
            }else if(["def", "generator"].indexOf(this.tree[0].type) == -1){
                // Avoid evaluation
                this.tree = []
            }
        }else if(this.tree[0].type == "assign" &&
                ! this.tree[0].tree[0].$in_parens &&
                this.tree[0].tree[0].annotation){
            // Left side of assignment is annoted
            var left = this.tree[0].tree[0],
                right = this.tree[0].tree[1]
            // Evaluate value first
            if(this.create_annotations){
                this.js += "$locals.__annotations__ = $B.empty_dict();"
            }
            this.js += "var $value = " + right.to_js() + ";"
            this.tree[0].tree.splice(1, 1)
            new $RawJSCtx(this.tree[0], "$value")
            if(left.tree[0] && left.tree[0].type == "id" && is_not_def){
                this.js += "_b_.dict.$setitem($locals.__annotations__, '" +
                    left.tree[0].value + "', " +
                    left.annotation.to_js() + ");"
            }else{
                // Evaluate annotation
                this.js +=  $to_js(this.tree) + ";"
                if(is_not_def){
                    this.js += left.annotation.to_js()
                }
                return this.js
            }
        }
    }
    if(this.node.children.length == 0){
        this.js += $to_js(this.tree) + ';'
    }else{
        this.js += $to_js(this.tree)
    }
    return this.js
}

var $NodeJS = $B.parser.$NodeJS = function(js){
    var node = new $Node()
    new $NodeJSCtx(node, js)
    return node
}

var $NodeJSCtx = $B.parser.$NodeJSCtx = function(node,js){
    // Class used for raw JS code
    this.node = node
    node.context = this
    this.type = 'node_js'
    this.tree = [js]
}

$NodeJSCtx.prototype.toString = function(){
    return 'js ' + js
}

$NodeJSCtx.prototype.to_js = function(){
    this.js_processed = true
    return this.tree[0]
}

var $NonlocalCtx = $B.parser.$NonlocalCtx = function(context){
    // Class for keyword "nonlocal"
    this.type = 'nonlocal'
    this.parent = context
    this.tree = []
    this.names = {}
    context.tree[context.tree.length] = this
    this.expect = 'id'

    this.scope = $get_scope(this)
    this.scope.nonlocals = this.scope.nonlocals || new Set()

    if(this.scope.context === undefined){
        $_SyntaxError(context,
            ["nonlocal declaration not allowed at module level"])
    }
}

$NonlocalCtx.prototype.toString = function(){
    return 'nonlocal ' + this.tree
}

$NonlocalCtx.prototype.ast = function(){
    // Nonlocal(identifier* names)
    return new ast.Nonlocal(this.tree.map(item => item.value))
}

$NonlocalCtx.prototype.add = function(name){
    if(this.scope.binding[name] == "arg"){
        $_SyntaxError(context,
          ["name '" + name + "' is parameter and nonlocal"])
    }
    this.names[name] = [false, $pos]
    this.scope.nonlocals.add(name)
}

$NonlocalCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
               check_global_nonlocal(context, value, 'nonlocal')
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$NonlocalCtx.prototype.transform = function(node, rank){
    var context = this.parent,
        pscope = this.scope.parent_block
    if(pscope.context === undefined){
        $_SyntaxError(context,["no binding for nonlocal '" +
            $B.last(Object.keys(this.names)) + "' found"])
    }else{
        while(pscope !== undefined && pscope.context !== undefined){
            for(var name in this.names){
                if(pscope.binding[name] !== undefined){
                    this.names[name] = [true]
                }
            }
            pscope = pscope.parent_block
        }
        for(var name in this.names){
            if(!this.names[name][0]){
                console.log('nonlocal error, context ' + context)
                // restore $pos to get the correct error line
                $pos = this.names[name][1]
                $_SyntaxError(context, ["no binding for nonlocal '" +
                    name + "' found"])
            }
        }
    }
}

$NonlocalCtx.prototype.to_js = function(){
    this.js_processed = true
    return ''
}

var $NotCtx = $B.parser.$NotCtx = function(context){
    // Class for keyword "not"
    this.type = 'not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$NotCtx.prototype.ast = function(){
    return new ast.UnaryOp(new ast.Not(), ast_or_obj(this.tree[0]))
}

$NotCtx.prototype.toString = function(){
    return 'not (' + this.tree + ')'
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

$NotCtx.prototype.to_js = function(){
    this.js_processed = true
    return '!$B.$bool(' + $to_js(this.tree) + ')'
}

var $NumberCtx = $B.parser.$NumberCtx = function(type, context, value){
    // Class for literal integers, floats and imaginary numbers
    // For integers, value is a 2-elt tuple [base, value_as_string] where
    // base is one of 16 (hex literal), 8 (octal), 2 (binary) or 10 (int)

    this.type = type
    this.value = value
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$NumberCtx.prototype.ast = function(){
    return new ast.Constant({type: this.type, value: this.value})
}

$NumberCtx.prototype.toString = function(){
    return this.type + ' ' + this.value
}

$NumberCtx.prototype.transition = function(token, value){
    var context = this
    return $transition(context.parent, token, value)
}

$NumberCtx.prototype.to_js = function(){
    this.js_processed = true
    var type = this.type,
        value = this.value
    if(type == 'int'){
        var v = parseInt(value[1], value[0])
        if(v > $B.min_int && v < $B.max_int){
            return v
        }else{
            var v = $B.long_int.$factory(value[1], value[0])
            return '$B.fast_long_int("' + v.value + '", ' + v.pos + ')'
        }
    }else if(type == "float"){
        // number literal
        if(/^\d+$/.exec(value) || /^\d+\.\d*$/.exec(value)){
            return '(new Number(' + this.value + '))'
        }
        return '_b_.float.$factory(' + value + ')'
    }else if(type == "imaginary"){
        return '$B.make_complex(0,' + value + ')'
    }
}

var $OpCtx = $B.parser.$OpCtx = function(context, op){
    // Class for operators ; context is the left operand
    this.type = 'op'
    this.op = op
    this.parent = context.parent
    this.tree = [context]
    this.scope = $get_scope(this)

    // Get type of left operand
    if(context.type == "expr"){
        if(['int', 'float', 'str'].indexOf(context.tree[0].type) > -1){
            this.left_type = context.tree[0].type
        }else if(context.tree[0].type == "id"){
            var binding = this.scope.binding[context.tree[0].value]
            if(binding){this.left_type = binding.type}
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
        ast_class = ast_type_class[1]

    if(op_type === ast.Compare){
        var left = ast_or_obj(this.tree[0]),
            ops = [new ast_class()]
        if(this.ops){
            for(var op of this.ops.slice(1)){
                ops.push(new op2ast_class[op][1]())
            }
            return new ast.Compare(left, ops,
                this.tree.slice(1).map(ast_or_obj))
        }else{
            return new ast.Compare(left, ops,
                [ast_or_obj(this.tree[1])])
        }
    }
    if(op_type === ast.UnaryOp){
        return new op_type(new ast_class(), ast_or_obj(this.tree[1]))
    }
    if(op_type === ast.BoolOp){
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
        return new op_type(new ast_class(), values.map(ast_or_obj))
    }
    return new op_type(
        ast_or_obj(this.tree[0]), new ast_class(), ast_or_obj(this.tree[1]))
}

$OpCtx.prototype.toString = function(){
    return '(op ' + this.op + ') [' + this.tree + ']'
}

$OpCtx.prototype.transition = function(token, value){
    var context = this
    if(context.op === undefined){
        $_SyntaxError(context,['context op undefined ' + context])
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
                $_SyntaxError(context, 'token ' + token + ' after ' +
                    context)
            }
    }
    return $transition(context.parent, token)
}

$OpCtx.prototype.to_js = function(){
    this.js_processed = true
    var comps = {'==': 'eq','!=': 'ne','>=': 'ge','<=': 'le',
        '<': 'lt','>': 'gt'}

    if(comps[this.op] !== undefined){
        if(this.ops){
            var i = 0,
                tests = []
            for(var op of this.ops){
                var method = comps[op]
                tests.push(`$B.rich_comp('__${method}__', ` +
                    `${i == 0 ? this.tree[i].to_js(): '$locals.$op'}, ` +
                    `$locals.$op = ${this.tree[i + 1].to_js()})`)
                i++
            }
            return tests.join(' && ')
        }
        var method = comps[this.op]
        if(this.tree[0].type == 'expr' && this.tree[1].type == 'expr'){
            var t0 = this.tree[0].tree[0],
                t1 = this.tree[1].tree[0],
                js0 = t0.to_js(),
                js1 = t1.to_js()
            switch(t1.type) {
                case 'int':
                    switch (t0.type) {
                        case 'int':
                            if(Number.isSafeInteger(t0.value) &&
                                Number.isSafeInteger(t1.value)){
                                    return js0 + this.op + js1
                            }else{
                                return '$B.$getattr(' +
                                    this.tree[0].to_js() + ',"__' +
                                    method + '__")(' +
                                    this.tree[1].to_js() + ')'
                            }
                        case 'str':
                            switch(this.op){
                                case "==":
                                    return "false"
                                case "!=":
                                    return "true"
                                default:
                                    return '$B.$TypeError("unorderable types: '+
                                        " int() " + this.op + ' str()")'
                            }
                        case 'id':
                            return '(typeof ' + js0 + ' == "number" ? ' +
                                js0 + this.op + js1 + ' : $B.rich_comp("__' +
                                method + '__",' + this.tree[0].to_js() +
                                ',' + this.tree[1].to_js() + '))'
                    }

                  break;
              case 'str':
                  switch(t0.type){
                      case 'str':
                          // use .valueOf() in case the string has
                          // surrogate pair: in Javascript,
                          // "new String('a') == new String('a')" is false...
                          return js0 + '.valueOf() ' + this.op + js1 + '.valueOf()'
                      case 'int':
                          switch(this.op){
                              case "==":
                                  return "false"
                              case "!=":
                                  return "true"
                              default:
                                  return '$B.$TypeError("unorderable types: '+
                                      ' str() ' + this.op + ' int()")'
                          }
                      case 'id':
                          return '(typeof ' + js0 + ' == "string" ? ' +
                              js0 + this.op + js1 + ' : $B.rich_comp("__' +
                              method + '__",' + this.tree[0].to_js() +
                              ',' + this.tree[1].to_js() + '))'
                  }
                  break;
              case 'id':
                  if(t0.type == 'id'){
                      return 'typeof ' + js0 + '!="object" && typeof ' +
                          js0 + '!="function" && typeof ' + js0 +
                          ' == typeof ' + js1 + ' ? ' + js0 + this.op + js1 +
                          ' : $B.rich_comp("__' + method + '__",' +
                          this.tree[0].to_js() + ',' + this.tree[1].to_js() +
                          ')'
                  }
                  break
            }
        }
    }
    switch(this.op) {
        case 'and':
            var op0 = this.tree[0].to_js(),
                op1 = this.tree[1].to_js()
            if(this.wrap !== undefined){
                // attribute "wrap" is set if this is a chained comparison,
                // like expr0 < expr1 < expr2
                // In this case, it is transformed into
                //     (expr0 < expr1) && (expr1 < expr2)
                // expr1 may be a function call, so it must be evaluated
                // only once. We wrap the result in an anonymous function
                // of the form
                //     function(){
                //         var temp = expr1;
                //         return (expr0<temp && temp<expr2)
                //     }
                // The name of the temporary variable is stored in
                // this.wrap.name ; expr1.to_js() is stored in this.wrap.js
                // They are initialized in
                return '(function(){var ' + this.wrap.name + ' = ' +
                    this.wrap.js + ';return $B.$test_expr($B.$test_item(' +
                    op0 + ') && $B.$test_item(' + op1 + '))})()'
            }else{
                return '$B.$test_expr($B.$test_item(' + op0 + ')&&' +
                    '$B.$test_item(' + op1 + '))'
            }
        case 'or':
            var res = '$B.$test_expr($B.$test_item(' +
                this.tree[0].to_js() + ')||'
            return res + '$B.$test_item(' + this.tree[1].to_js() + '))'
        case 'in':
            return '$B.$is_member(' + $to_js(this.tree) + ')'
        case 'not_in':
            return '!$B.$is_member(' + $to_js(this.tree) + ')'
        case 'unary_neg':
        case 'unary_pos':
        case 'unary_inv':
            // For unary operators, the left operand is the unary sign(s)
            var op, method
            if(this.op == 'unary_neg'){op = '-'; method = '__neg__'}
            else if(this.op == 'unary_pos'){op = '+'; method = '__pos__'}
            else{op = '~';method = '__invert__'}
            // for integers or float, replace their value using
            // Javascript operators
            if(this.tree[1].type == "expr"){
                var x = this.tree[1].tree[0]
                switch(x.type) {
                    case 'int':
                        var v = parseInt(x.value[1], x.value[0])
                        if(Number.isSafeInteger(v)){return op + v}
                        // for long integers, use __neg__ or __invert__
                        return '$B.$getattr(' + x.to_js() +', "' +
                          method + '")()'
                    case 'float':
                        return '_b_.float.$factory(' + op + x.value + ')'
                    case 'imaginary':
                        return '$B.make_complex(0,' + op + x.value + ')'
                }
            }
            return '$B.$getattr(' + this.tree[1].to_js() + ',"' +
                method + '")()'
        case 'is':
            return '$B.$is(' + this.tree[0].to_js() + ', ' +
                this.tree[1].to_js() + ')'
        case 'is_not':
            return '! $B.$is(' + this.tree[0].to_js() + ', ' +
                this.tree[1].to_js() + ')'
        case '+':
            return '$B.add(' + this.tree[0].to_js() + ', ' +
                this.tree[1].to_js() + ')'
        case '*':
        case '-':
            var op = this.op,
                vars = [],
                has_float_lit = false,
                scope = $get_scope(this)
            function is_simple(elt){
                if(elt.type == 'expr' && elt.tree[0].type == 'int'){
                    return true
                }else if(elt.type == 'expr' &&
                        elt.tree[0].type == 'float'){
                    has_float_lit = true
                    return true
                }else if(elt.type == 'expr' &&
                        elt.tree[0].type == 'list_or_tuple' &&
                        elt.tree[0].real == 'tuple' &&
                        elt.tree[0].tree.length == 1 &&
                        elt.tree[0].tree[0].type == 'expr'){
                    return is_simple(elt.tree[0].tree[0].tree[0])
                }else if(elt.type == 'expr' && elt.tree[0].type == 'id'){
                    var _var = elt.tree[0].to_js()
                    if(vars.indexOf(_var) == -1){vars.push(_var)}
                    return true
                }else if(elt.type == 'op' &&
                        ['*', '+', '-'].indexOf(elt.op) > -1){
                    for(var i = 0; i < elt.tree.length; i++){
                        if(!is_simple(elt.tree[i])){return false}
                    }
                    return true
                }
                return false
            }
            function get_type(ns, v){
                var t
                if(['int', 'float', 'str'].indexOf(v.type) > -1){
                    t = v.type
                }else if(v.type == 'id' && ns[v.value]){
                    t = ns[v.value].type
                }
                return t
            }
            var e0 = this.tree[0],
                e1 = this.tree[1]
            if(is_simple(this)){
                var v0 = this.tree[0].tree[0],
                    v1 = this.tree[1].tree[0]
                if(vars.length == 0 && !has_float_lit){
                    // only integer literals
                    return this.simple_js()
                }else if(vars.length == 0){
                    // numeric literals with at least one float
                    return 'new Number(' + this.simple_js() + ')'
                }else{
                    // at least one variable
                    var ns = scope.binding,
                        t0 = get_type(ns, v0),
                        t1 = get_type(ns, v1)
                    // Static analysis told us the type of both ids
                    if((t0 == 'float' && t1 == 'float') ||
                          (this.op == '+' && t0 == 'str' && t1 == 'str')){
                        this.result_type = t0
                        return v0.to_js() + this.op + v1.to_js()
                    }else if(['int', 'float'].indexOf(t0) > -1 &&
                             ['int', 'float'].indexOf(t1) > -1){
                        if(t0 == 'int' && t1 == 'int'){
                            this.result_type = 'int'
                        }else{this.result_type = 'float'}
                        switch(this.op){
                            case '-':
                                return '$B.sub(' + v0.to_js() + ',' +
                                    v1.to_js() + ')'
                            case '*':
                                return '$B.mul(' + v0.to_js() + ',' +
                                    v1.to_js() + ')'
                        }
                    }

                    var tests = [],
                        tests1 = [], pos = 0
                    for(var _var of vars){
                        // Test if all variables are numbers
                        tests.push(_var + '.valueOf && typeof ' + _var +
                            '.valueOf() == "number"')
                        // Test if all variables are integers
                        tests1.push('typeof ' + _var + ' == "number"')
                    }
                    var res = [tests.join(' && ') + ' ? ']

                    res.push('(' + tests1.join(' && ') + ' ? ')

                    // If true, use basic formula
                    res.push(this.simple_js())

                    // Else wrap simple formula in a float
                    res.push(' : new Number(' + this.simple_js() + ')')

                    // Close integers test
                    res.push(')')
                    // If at least one variable is not a number

                    // For addition, test if both arguments are strings
                    var t0 = this.tree[0].to_js(),
                        t1 = this.tree[1].to_js()
                    if(this.op == '+'){
                        res.push(' : (typeof ' + t0 +
                            ' == "string" && typeof ' + t1 +
                            ' == "string") ? ' + t0 + '+' + t1)
                    }
                    res.push(': $B.rich_op("' + $operators[this.op] + '",' +
                        t0 + ',' + t1 + ')')
                    return '(' + res.join('') + ')'
                }
            }
            if(comps[this.op] !== undefined){
                return '$B.rich_comp("__' + $operators[this.op] + '__",' +
                    e0.to_js() + ',' + e1.to_js() + ')'
            }else{
                return '$B.rich_op("' + $operators[this.op] + '", ' +
                    e0.to_js() + ', ' + e1.to_js() + ')'
            }
        default:
            if(comps[this.op] !== undefined){
                return '$B.rich_comp("__' + $operators[this.op] + '__",' +
                    this.tree[0].to_js() + ',' + this.tree[1].to_js() + ')'
            }else{
                return '$B.rich_op("' + $operators[this.op] + '", ' +
                    this.tree[0].to_js() + ', ' + this.tree[1].to_js() +
                    ')'
            }
    }
}

$OpCtx.prototype.simple_js = function(){
    var op = this.op
    function sjs(elt){
        if(elt.type == 'op'){
            return elt.simple_js()
        }else if(elt.type == 'expr' && elt.tree[0].type == 'list_or_tuple'
                && elt.tree[0].real == 'tuple'
                && elt.tree[0].tree.length == 1
                && elt.tree[0].tree[0].type == 'expr'){
            return '(' + elt.tree[0].tree[0].tree[0].simple_js() + ')'
        }else{
            return elt.tree[0].to_js()
        }
    }
    if(op == '+'){
        return '$B.add(' + sjs(this.tree[0]) + ',' +
            sjs(this.tree[1]) + ')'
    }else if(op == '-'){
        return '$B.sub(' + sjs(this.tree[0]) + ',' +
            sjs(this.tree[1]) + ')'
    }else if(op == '*'){
        return '$B.mul(' + sjs(this.tree[0]) + ',' +
            sjs(this.tree[1]) + ')'
    }else if(op == '/'){
        return '$B.div(' + sjs(this.tree[0]) + ',' +
            sjs(this.tree[1]) + ')'
    }else{
        return sjs(this.tree[0]) + op + sjs(this.tree[1])
    }
}

var $PackedCtx = $B.parser.$PackedCtx = function(context){
    // used for packed tuples in expressions, eg
    //     a, *b, c = [1, 2, 3, 4]
    this.type = 'packed'
    if(context.parent.type == 'list_or_tuple' &&
            context.parent.parent.type == "node"){
        // SyntaxError for a, *b, *c = ...
        for(var i = 0; i < context.parent.tree.length; i++){
            var child = context.parent.tree[i]
            if(child.type == 'expr' && child.tree.length > 0
                    && child.tree[0].type == 'packed'){
                $_SyntaxError(context,
                    ["two starred expressions in assignment"])
            }
        }
    }
    this.parent = context
    this.tree = []
    this.pos = $pos - 1 // for SyntaxError reporting
    context.tree[context.tree.length] = this
}

$PackedCtx.prototype.ast = function(){
    return new ast.Starred(ast_or_obj(this.tree[0]), new ast.Load())
}

$PackedCtx.prototype.toString = function(){
    return '(packed) ' + this.tree
}

$PackedCtx.prototype.transition = function(token, value){
    var context = this
    if(context.tree.length > 0 && token == "["){
        // Apply subscription to packed element (issue #1139)
        return $transition(context.tree[0], token, value)
    }
    switch(token){
        case 'id':
            var expr = new $AbstractExprCtx(context, false)
            expr.packed = true
            context.parent.expect = ','
            var id = $transition(expr, token, value)
            return id
        case "[":
            context.parent.expect = ','
            return new $ListOrTupleCtx(context, "list")
        case "(":
            context.parent.expect = ','
            return new $ListOrTupleCtx(context, "tuple")
        case 'str':
            context.parent.expect = ","
            return new $StringCtx(context, value)
        case 'JoinedStr':
            context.parent.expect = ","
            return new JoinedStrCtx(context, value)
        case "]":
            return $transition(context.parent, token, value)
        case "{":
            context.parent.expect = ','
            return new $DictOrSetCtx(context)
        case 'op':
            switch(value){
                case '+':
                case '-':
                case '~':
                    context.parent.expect = ','
                    return new $UnaryCtx(context, value)
                default:
                    $_SyntaxError(context, ["can't use starred expression here"])
            }
    }
    return context.parent.transition(token, context)
}

$PackedCtx.prototype.to_js = function(){
    this.js_processed = true
    return $to_js(this.tree)
}


var $PassCtx = $B.parser.$PassCtx = function(context){
    // Class for keyword "pass"
    this.type = 'pass'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$PassCtx.prototype.ast = function(){
    return new ast.Pass()
}

$PassCtx.prototype.toString = function(){
    return '(pass)'
}

$PassCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol'){return context.parent}
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$PassCtx.prototype.to_js = function(){
    this.js_processed = true
    return 'void(0)'
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
                            $_SyntaxError(context)
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
                    $_SyntaxError(context, ["patterns may only match " +
                        "literals and attribute lookups"])
            }
            break
        case 'starred_id':
            if(token == 'id'){
                var capture = new $PatternCaptureCtx(context, value)
                capture.starred = true
                return capture
            }
            $_SyntaxError(context, 'expected id after *')
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
                    $_SyntaxError(context)
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
                $_SyntaxError(context, ["alias cannot be _"])
            }
            if(context.bindings().indexOf(value) > -1){
                $_SyntaxError(context,
                    [`multiple assignments to name '${value}' in pattern`])
            }
            context.alias = value
            return context.parent
        }else{
            $_SyntaxError(context, 'bad alias')
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
    this.expect = '.'
    this.$pos = $pos
}

$PatternCaptureCtx.prototype.ast = function(){
  try{
    if(this.tree.length > 1){
        var pattern = new ast.Name(this.tree[0].value, new ast.Load())
        for(var i = 1; i < this.tree.length; i += 2){
            pattern = new ast.Attribute(pattern, this.tree[i], new ast.Load())
        }
        return new ast.MatchValue(pattern)
    }else{
        var pattern = this.tree[0]
        if(typeof pattern == 'string'){
            pattern = pattern.value
        }else if(pattern.type == 'group_pattern'){
            pattern = pattern.ast()
        }else{
            console.log('bizarre', pattern)

            pattern = $NumberCtx.prototype.ast.bind(this)()
        }
        if(pattern == '_'){
            pattern = undefined
        }
    }
    if(this.alias){
        return new ast.MatchAs(
            new ast.MatchAs(undefined, pattern),
            this.alias)
    }
    return new ast.MatchAs(undefined, pattern)
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
                if(context.tree.length == 1){
                    // create an $IdCtx to resolve the name correctly
                    new $IdCtx(context, context.tree.pop())
                }else{
                    context.tree.push('.')
                }
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
                context.expect = '.'
                return context
            }

    }
    return $transition(context.parent, token, value)
}

$PatternCaptureCtx.prototype.to_js = function(){
    var js
    if(this.tree.length == 1){
        js = '{capture'
        if(this.starred == true){
            js += '_starred'
        }
        js += `: '${this.tree[0]}'`
    }else{
        js = this.tree[0].to_js()
        for(var i = 1, len = this.tree.length; i < len; i += 2){
            js = '$B.$getattr(' + js + ', "' + this.tree[i] + '")'
        }
        js = `{value: ${js}`
    }
    if(this.alias){
        js += `, alias: '${this.alias}'`
    }
    return js + '}'
}

$PatternClassCtx = function(context){
    this.type = "class_pattern"
    this.tree = []
    this.parent = context.parent
    // create an id for class name
    this.class_id = new $IdCtx(context, context.tree[0])
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
    var cls = new ast.Name(this.class_id.value),
        patterns = [],
        kwd_attrs = [],
        kwd_patterns = []
    for(var item of this.tree){
        if(item.is_keyword){
            kwd_attrs.push(item.tree[0])
            kwd_patterns.push(ast_or_obj(item.tree[1]))
        }else{
            try{
                patterns.push(ast_or_obj(item))
            }catch(err){
                console.log('error in class pattern item')
                show_line(this)
                throw err
              }
        }
    }
    return new ast.MatchClass(cls, patterns, kwd_attrs, kwd_patterns)
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
                $_SyntaxError(context,
                        'positional argument after keyword')
            }
            if(last.is_keyword){
                if(context.keywords.indexOf(last.tree[0]) > -1){
                    $_SyntaxError(context,
                        [`keyword argument repeated: ${last.tree[0]}`])
                }
                context.keywords.push(last.tree[0])
                bound = last.tree[1].bindings()
            }else{
                bound = last.bindings()
            }
            for(var b of bound){
                if(context.bound_names.indexOf(b) > -1){
                    $_SyntaxError(context, ['multiple assignments ' +
                        `to name '${b}' in pattern`])
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
                            $_SyntaxError(context,
                                ['attribute name repeated in class pattern: ' +
                                 current.tree[0]])
                        }
                        current.is_keyword = true
                        return new $PatternCtx(current)
                    }
                    $_SyntaxError(this, '= after non-capture')
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
                    $_SyntaxError(this)
            }
        case 'as':
        case 'alias':
            return as_pattern(context, token, value)
    }
    return $transition(context.parent, token, value)

}

$PatternClassCtx.prototype.to_js = function(){
    var i = 0,
        args = [],
        kwargs = []
    var klass = this.class_id.to_js()
    for(var i = 0, len = this.attrs.length; i < len; i += 2){
        klass = '$B.$getattr(' + klass + ', "' + this.attrs[i] + '")'
    }
    i = 0
    for(var item of this.tree){
        if(item instanceof $PatternCaptureCtx && item.tree.length > 1){
            kwargs.push(item.tree[0] + ': ' + item.tree[1].to_js())
        }else{
            args.push(item.to_js())
        }
    }
    var js = '{class: ' + klass + ', args: [' + args.join(', ') + '], ' +
        'keywords: {' + kwargs.join(', ') + '}'
    if(this.alias){
        js += `, alias: "${this.alias}"`
    }
    return js + '}'
}

var $PatternGroupCtx = function(context){
    // Class for group patterns, delimited by (), in a "case" statement
    this.type = "group_pattern"
    this.parent = context
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
    if(this.tree.length == 1){
        return ast_or_obj(this.tree[0])
    }else{
        return $PatternSequenceCtx.prototype.ast.bind(this)()
    }
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
                context.is_tuple = true
                return context
            }else if(token == 'op' && value == '|'){
                var opctx = new $PatternOrCtx(context.parent)
                opctx.parenthese = true
                return new $PatternCtx(opctx)
            }else if(this.token === undefined){
                return $transition(context.parent, token, value)
            }
            $_SyntaxError(context)
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
    console.log('error', this, token, value)
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$PatternGroupCtx.prototype.to_js = function(){
    if(this.is_tuple){
        var js = '{sequence: [' + $to_js(this.tree) + ']'
    }else{
        var js = '{group: [' + $to_js(this.tree) + ']'
    }
    if(this.alias){
        js += `, alias: "${this.alias}"`
    }
    return js + '}'
}

var $PatternLiteralCtx = function(context, token, value, sign){
    // Class for literal patterns in a "case" statement
    // context is a $PatternCtx
    this.type = "literal_pattern"
    this.parent = context.parent
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
            $_SyntaxError(this, ["patterns cannot include f-strings"])
        }else{
            this.tree = [{type: token, value, sign}]
        }
        this.expect = 'op'
    }
}

$PatternLiteralCtx.prototype.ast = function(){
  try{
    var first = this.tree[0],
        result
    if(first.type == 'str'){
        result = new ast.MatchValue(new ast.Constant(first.value))
    }else if(first.type == 'id'){
        result = new ast.MatchSingleton(first.value)
    }else{
        var num = $NumberCtx.prototype.ast.bind(first)(),
            res = new ast.MatchValue(num)
        if(this.tree.length == 1){
            result = res
        }else{
            var num2 = $NumberCtx.prototype.ast.bind(this.tree[2])()
            result = new ast.BinOp(res,
                this.tree[1] == '+' ? ast.Add : ast.Sub,
                num2)
        }
    }
    if(this.tree.length == 2){
        // value = complex number
        result = new ast.MatchValue(new ast.BinOp(
            ast_or_obj(this.tree[0]),
            context.num_sign == '+' ? ast.Add : ast.Sub,
            ast_or_obj(this.tree[1])))
    }
    if(this.alias){
        return new ast.MatchAs(result, this.alias)
    }
    return result
  }catch(err){
      console.log('error pattern literal ast', this)
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
                        $_SyntaxError(context,
                            ['patterns cannot include operators'])
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
                    $_SyntaxError(context)
            }

        case 'imaginary':
            switch(token){
                case 'imaginary':
                    context.tree.push({type: token, value, sign: context.num_sign})
                    return context.parent
                default:
                    $_SyntaxError(context, 'expected imaginary')

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

$PatternLiteralCtx.prototype.to_js = function(){
    function int_to_num(item){
        var v = parseInt(item.value[1], item.value[0])
        return item.sign == '-' ? -v : v
    }
    var res = '',
        first = this.tree[0],
        num_value
    if(first instanceof $StringCtx){
        res = first.to_js()
    }else{
        switch(first.type){
            case 'id':
                res = '_b_.' + first.value
                num_value = first.value == 'True' ? 1 : 0
                break
            case 'str':
                res = first.value
                break
            case 'int':
                res = int_to_num(first)
                break
            case 'float':
                res = (first.sign == '-' ? '-' : '') + first.value
                break
            case 'imaginary':
                res += '$B.make_complex(0, ' +
                    (first.sign == '-' ? '-' : '') + first.value + ')'
                if(first.value == 0){
                    num_value = 0
                }
                break
        }
    }
    if(this.tree.length > 1){
        res = '$B.make_complex(' + res + ',' +
            (this.tree[1] == '-' ? '-' : '') +
            this.tree[2].value + ')'
    }
    this.js_value = res
    this.num_value = num_value === undefined ? res : num_value
    var js = '{literal: ' + res
    if(this.alias){
        js += `, alias: '${this.alias}'`
    }
    return js + '}'
}

var $PatternMappingCtx = function(context){
    // Class for sequence patterns in a "case" statement
    this.type = "mapping_pattern"
    this.parent = context
    context.tree.pop()
    this.tree = []
    context.tree.push(this)
    this.expect = 'key_value_pattern'
    // store duplicate literal keys
    this.duplicate_keys = []
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
        keys.push(ast_or_obj(item.tree[0]))
        patterns.push(ast_or_obj(item.tree[1]))
    }
    var res = new ast.MatchMapping(keys, patterns)
    if(this.double_star){
        res.rest = this.double_star.tree[0]
    }
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
                $_SyntaxError(context,
                    ["can't use starred name here (consider moving to end)"])
            }
            if(last.tree[0].type == 'value_pattern'){
                bindings = last.tree[2].bindings()
            }else{
                bindings = last.tree[1].bindings()
            }
            for(var binding of bindings){
                if(context.bound_names.indexOf(binding) > -1){
                    $_SyntaxError(context,
                        [`multiple assignments to name '${binding}'` +
                         ' in pattern'])
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
                        $_SyntaxError(context,
                            ["can't use starred name here (consider moving to end)"])
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
                $_SyntaxError(context, ["mapping pattern keys may only " +
                    "match literals and attribute lookups"])
            }
            if(lit_or_val instanceof $PatternLiteralCtx){
                context.tree.pop() // remove PatternCtx
                // check duplicates
                for(var kv of context.tree){
                    if(kv instanceof $PatternKeyValueCtx){
                        var key = kv.tree[0]
                        if(key instanceof $PatternLiteralCtx){
                            var old_lit = key.tree[0],
                                new_lit = lit_or_val.tree[0]
                            key.to_js()
                            lit_or_val.to_js()
                            key_value = key.num_value
                            lit_or_val_value = lit_or_val.num_value
                            if(key_value == lit_or_val_value){
                                $_SyntaxError(context,
                                    ["duplicate literal key " +
                                    lit_or_val_value])
                            }
                        }
                    }
                }
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
                console.log('lit_or_val', lit_or_val)
                $_SyntaxError(context, 'expected key or **')
            }
        case 'capture_pattern':
            var p = new $PatternCtx(context)
            var capture = $transition(p, token, value)
            if(capture instanceof $PatternCaptureCtx){
                if(context.double_star){
                    context.$pos = capture.$pos
                    $_SyntaxError(context,
                     ["only one double star pattern is accepted"])
                }
                if(value == '_'){
                    $_SyntaxError(context, '**_ is not valid')
                }
                if(context.bound_names.indexOf(value) > -1){
                    $_SyntaxError(context, ['duplicate binding: ' + value])
                }
                context.bound_names.push(value)
                capture.double_star = true
                context.double_star = capture
                context.expect = ','
                return context
            }else{
                $_SyntaxError(this, 'expected identifier')
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
            $_SyntaxError(context, 'token ' + token + 'after context ' +context)
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
            $_SyntaxError(context, 'token ' + token + 'after ' + context)
    }
    return $transition(context.parent, token, value)
}

$PatternMappingCtx.prototype.to_js = function(){
    var js = '{mapping: [' + $to_js(this.tree) + ']'
    if(this.rest){
        js += ", rest: '" + this.rest.tree[0] + "'"
    }
    return js + '}'
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
                    this.expect = ','
                    return new $PatternCtx(this)
                default:
                console.log('keyvalue', context, 'expected :, got', token, value)
                    $_SyntaxError(context, 'expected :')
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
            $_SyntaxError(context, 'expected , or }')
    }
    return $transition(context.parent, token, value)
}

$PatternKeyValueCtx.prototype.to_js = function(){
    var key,
        value
    if(this.tree[0].type == 'value_pattern'){
        // second item in this.tree is an id
        key = this.tree[1].to_js()
        for(var i = 2, len = this.tree[0].tree.length; i < len; i += 2){
            key = '$B.$getattr(' + key + ', "' + this.tree[0].tree[i] + '")'
        }
        key = '{value: ' + key + '}'
        value = this.tree[2].to_js()
    }else{
        key = this.tree[0].to_js()
        value = this.tree[1].to_js()
    }
    return '[' + key + ',' + value + ']'
}

var $PatternOrCtx = function(context){
    // Class for "or patterns" in a "case" statement
    // context already has a pattern as its first child
    this.type = "or_pattern"
    this.parent = context
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
    return new ast.MatchOr(this.tree.map(ast_or_obj))
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
                    $_SyntaxError(this,
                        ["alternative patterns bind different names"])
                }
            }
            for(var item of subbindings){
                if(names.indexOf(item) == -1){
                    $_SyntaxError(this,
                        ["alternative patterns bind different names"])
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
        $_SyntaxError(this,
            [`${msg} makes remaining patterns unreachable`])
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
                $_SyntaxError(context, 'no as pattern inside or pattern')
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


$PatternOrCtx.prototype.to_js = function(){
    var res = '{or : [' + $to_js(this.tree) + ']'
    if(this.alias){
        res += `, alias: '${this.alias}'`
    }
    return res + '}'
}

var $PatternSequenceCtx = function(context, token){
    // Class for sequence patterns in a "case" statement
    this.type = "sequence_pattern"
    this.parent = context
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
    return new ast.MatchSequence(this.tree.map(ast_or_obj))
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
                    $_SyntaxError(context, ["multiple assignments to name '" +
                        b + "' in pattern"])
                }
            }
            if(last.starred){
                if(context.has_star){
                    $_SyntaxError(context,
                        ['multiple starred names in sequence pattern'])
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
                        $_SyntaxError(context,
                            ['multiple starred names in sequence pattern'])
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
        $_SyntaxError(context)
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
        $_SyntaxError(context, 'expected alias')
    }else if(context.expect == 'id'){
        context.expect = ','
        return $transition(new $PatternCtx(context), token, value)
    }
}

$PatternSequenceCtx.prototype.to_js = function(){
    var js = '{sequence: [' + $to_js(this.tree) + ']'
    if(this.alias){
        js += `, alias: '${this.alias}'`
    }
    return js + '}'
}


var $RaiseCtx = $B.parser.$RaiseCtx = function(context){
    // Class for keyword "raise"
    this.type = 'raise'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.scope_type = $get_scope(this).ntype
}

$RaiseCtx.prototype.ast = function(){
    // ast.Raise(exc, cause)
    // cause is the optional part in "raise exc from cause"
    return new ast.Raise(...this.tree.map(ast_or_obj))
}

$RaiseCtx.prototype.toString = function(){
    return ' (raise) ' + this.tree
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$RaiseCtx.prototype.to_js = function(){
    this.js_processed = true
    var exc = this.tree.length == 0 ? '' : this.tree[0].to_js()
    return '$B.$raise(' + exc + ')'
}

var $RawJSCtx = $B.parser.$RawJSCtx = function(context, js){
    this.type = "raw_js"
    context.tree[context.tree.length] = this
    this.parent = context
    this.js = js
}

$RawJSCtx.prototype.toString = function(){
    return '(js) ' + this.js
}

$RawJSCtx.prototype.transition = function(token, value){
    var context = this
}

$RawJSCtx.prototype.to_js = function(){
    this.js_processed = true
    return this.js
}

var $ReturnCtx = $B.parser.$ReturnCtx = function(context){
    // Class for keyword "return"
    this.type = 'return'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    // Check if inside a function
    this.scope = $get_scope(this)
    if(["def", "generator"].indexOf(this.scope.ntype) == -1){
        $_SyntaxError(context, ["'return' outside function"])
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
        res.value = ast_or_obj(this.tree[0])
    }
    return res
}

$ReturnCtx.prototype.toString = function(){
    return 'return ' + this.tree
}

$ReturnCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'eol' && this.tree.length == 1 &&
             this.tree[0].type == 'abstract_expr'){
        // "return" must be transformed into "return None"
        this.tree.pop()
    }
    return $transition(context.parent, token)
}

$ReturnCtx.prototype.to_js = function(){
    this.js_processed = true
    var expr = this.tree.length == 0 ? '_b_.None' : $to_js(this.tree)
    var scope = this.scope
    if(scope.ntype == 'generator'){
        return 'var $res = ' + expr + '; $B.leave_frame({$locals});' +
            'return $B.generator_return($res)'
    }

    // Returning from a function means leaving the execution frame
    // If the return is in a try block with a finally block, the frames
    // will be restored when entering "finally"
    var indent = '    '.repeat(this.node.indent - 1)
    var js = 'var $res = ' + expr + ';\n' + indent +
    'if($locals.$f_trace !== _b_.None){\n$B.trace_return($res)}\n' + indent +
    '$B.leave_frame'
    if(scope.id.substr(0, 6) == '$exec_'){
        js += '_exec'
    }
    js += '({$locals});\n'
    if(this.is_await){
        js += indent + '$B.restore_stack(save_stack, $locals)\n'
    }
    js += indent + 'return $res'
    return js
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
    return new ast.SetComp(
        ast_or_obj(this.tree[0]),
        Comprehension.generators(this.tree.slice(1))
    )
}

SetCompCtx.prototype.transition = function(token, value){
    var context = this
    if(token == '}'){
        this.has_await = Comprehension.has_await(this)
        return this.parent
    }
    $_SyntaxError(context, 'token ' + token + 'after list comp')
}

SetCompCtx.prototype.to_js = function(){
    var node = $get_node(this),
        indent = node.get_indent()

    var id = this.id,
        expr = this.tree[0],
        first_for = this.tree[1],
        outmost_expr = first_for.tree[1].to_js()
    first_for.comp_body = true
    first_for.iterable_is_outermost = true
    var module_id = this.module.replace(/\./g, '_')

    var js = `(${this.has_await ? 'async ' : ''}function(expr){` +
            Comprehension.admin_infos(this) +
            `\nvar $result_${id} = _b_.set.$factory()\n`

    js += first_for.to_js(indent)
    var nb = -1
    for(var i = 2; i < this.tree.length; i++){
        nb++
        var stmt = this.tree[i]
        if(stmt.type == 'for'){
            stmt.comp_body = true
            js += '\n' + stmt.to_js(indent + nb)
        }else if(stmt.type == 'condition' && stmt.token == 'if'){
            js += '\n' + ' '.repeat(12 + 4 * nb) + stmt.to_js() + '{'
        }
    }

    var expr_has_await = Comprehension.has_await(expr)

    js +=  '\n' + ' '.repeat(16 + 4 * nb) +
            (expr_has_await ? 'var save_stack = $B.save_stack();\n' : '') +
            `try{\n_b_.set.add($result_${id}, ${expr.to_js()})\n` +
            `}catch(err){\n` +
            (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '') +
            `$B.leave_frame($locals); throw err\n` +
            '\n}' + (expr_has_await ? '$B.restore_stack(save_stack, $locals);' : '')

    for(var i = 1; i < this.tree.length; i++){
        js += '\n' + ' '.repeat(12 + 4 * nb--) + '}'
    }
    js += `\n$B.leave_frame({$locals, value: _b_.None})`
    js += `\nreturn $result_${id}`
    js += `\n}\n)(${outmost_expr})`
    return js
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
                this.loop_num = elt.loop_num
            }
        }
    }
}

$SingleKwCtx.prototype.ast = function(){
    return ast_body(this.parent)
}

$SingleKwCtx.prototype.toString = function(){
    return this.token
}

$SingleKwCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){return $BodyCtx(context)}
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$SingleKwCtx.prototype.transform = function(node, rank){
    // If node is "finally" there might have been a "return" or a
    // "raise" in the matching "try". In this case the frames stack has
    // been popped from. We must add code to restore it, and to re-pop
    // when exiting the "finally" block
    if(this.token == 'finally'){
        var scope = $get_scope(this)
        node.insert(0,
            $NodeJS('var $exit;'+
            'if($B.frames_stack.length < $stack_length){\n' +
                '$exit = true;'+
                '$B.frames_stack.push($top_frame)'+
            '}')
        )

        var scope_id = scope.id.replace(/\./g, '_')
        var last_child = node.children[node.children.length - 1]

        // If the finally block ends with "return", don't add the
        // final line
        if(last_child.context.tree[0].type != "return"){
            node.add($NodeJS('if($exit){\n$B.leave_frame({$locals})}'))
        }
    }
}

$SingleKwCtx.prototype.to_js = function(){
    this.js_processed = true
    if(this.token == 'finally'){return this.token}

    // For "else" we must check if the previous block was a loop
    // If so, check if the loop exited with a "break" to decide
    // if the block below "else" should be run
    if(this.loop_num !== undefined){
        return 'if($no_break' + this.loop_num + ')'
    }
    return this.token
}

var $SliceCtx = $B.parser.$SliceCtx = function(context){
    // Class for slices inside a subscription : t[1:2]
    this.type = 'slice'
    this.parent = context
    this.tree = context.tree.length > 0 ? [context.tree.pop()] : []
    context.tree.push(this)
}

$SliceCtx.prototype.ast = function(){
    var slice = new ast.Slice()
    var attrs = ['lower', 'upper', 'step']
    for(var i = 0; i < this.tree.length; i++){
        var item = this.tree[i]
        if(item.type !== 'abstract_expr'){
            slice[attrs[i]] = ast_or_obj(item)
        }
    }
    return slice
}

$SliceCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ":"){
        return new $AbstractExprCtx(context, false)
    }
    return $transition(context.parent, token, value)
}

$SliceCtx.prototype.to_js = function(){
    for(var i = 0; i < this.tree.length; i++){
        if(this.tree[i].type == "abstract_expr"){
            this.tree[i].to_js = function(){return "_b_.None"}
        }
    }
    return "_b_.slice.$factory(" + $to_js(this.tree) + ")"
}

var $StarArgCtx = $B.parser.$StarArgCtx = function(context){
    // Class for star args in calls, eg f(*args)
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
}

$StarArgCtx.prototype.toString = function(){
    return '(star arg) ' + this.tree
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
                $_SyntaxError(context, "unnamed star argument")
            }
            return $transition(context.parent, token)
        case ':':
            if(context.parent.parent.type == 'lambda'){
              return $transition(context.parent.parent, token)
            }
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$StarArgCtx.prototype.to_js = function(){
    this.js_processed = true
    return '{$nat:"ptuple",arg:' + $to_js(this.tree) + '}'
}

var $StringCtx = $B.parser.$StringCtx = function(context, value){
    // Class for literal strings
    // value is the string with quotes, eg 'a', "b\"c" etc.
    this.type = 'str'
    this.parent = context

    function prepare(value){
        value = value.replace(/\n/g,'\\n\\\n')
        value = value.replace(/\r/g,'\\r\\\r')
        return value
    }

    this.is_bytes = value.charAt(0) == 'b'
    if(! this.is_bytes){
        this.value = prepare(value)
    }else{
        this.value = prepare(value.substr(1))
    }
    context.tree.push(this)
    this.tree = [this.value]
    this.raw = false
    this.$pos = $pos
}

$StringCtx.prototype.ast = function(){
    var value
    if(! this.is_bytes){
        try{
            value =  eval(this.value)
        }catch(err){
            console.log('error str ast', this.value)
            throw err
        }
    }else{
        value = _b_.bytes.$new(_b_.bytes, eval(this.value), 'ISO-8859-1')
    }
    return new ast.Constant(value)
}

$StringCtx.prototype.toString = function(){
    return 'string ' + (this.value || '')
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
                $_SyntaxError(context,
                    ["cannot mix bytes and nonbytes literals"])
            }
            context.value += ' + ' + (this.is_bytes ? value.substr(1) : value)
            return context
        case 'JoinedStr':
            // replace by a new JoinedStr where the first value is this
            context.parent.tree.pop()
            var joined_str = new JoinedStrCtx(context.parent, value)
            if(typeof joined_str.tree[0] == "string"){
                joined_str.tree[0] = eval(this.value) + joined_str.tree[0]
            }else{
                joined_str.tree.splice(0, 0, this)
            }
            return joined_str
    }
    return $transition(context.parent, token, value)
}

$StringCtx.prototype.to_js = function(){
    this.js_processed = true
    if(! this.is_bytes){
        return "$B.String(" + this.value + ")"
    }else{
        return '_b_.bytes.$new(_b_.bytes, ' + this.value + ", 'ISO-8859-1')"
    }
}

var $SubCtx = $B.parser.$SubCtx = function(context){
    // Class for subscription or slicing, eg x in t[x]
    this.type = 'sub'
    this.func = 'getitem' // set to 'setitem' if assignment
    this.value = context.tree[0]
    context.tree.pop()
    context.tree[context.tree.length] = this
    this.parent = context
    this.tree = []
}

$SubCtx.prototype.ast = function(){
    var slice = ast_or_obj(this.tree[0])
    return new ast.Subscript(ast_or_obj(this.value), slice, new ast.Load())
}

$SubCtx.prototype.toString = function(){
    return '(sub) (value) ' + this.value + ' (tree) ' + this.tree
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
            if(context.parent.packed){
                return context.parent //.tree[0]
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$SubCtx.prototype.to_js = function(){
    this.js_processed = true
    if(this.func == 'getitem' && this.value.type == 'id'){
        var type = $get_node(this).locals[this.value.value],
            val = this.value.to_js()
        if(type == 'list' || type == 'tuple'){
            if(this.tree.length == 1){
                return '$B.list_key(' + val +
                    ', ' + this.tree[0].to_js() + ')'
            }else if(this.tree.length == 2){
                return '$B.list_slice(' + val +
                    ', ' + (this.tree[0].to_js() || "null") + ',' +
                    (this.tree[1].to_js() || "null") + ')'
            }else if(this.tree.length == 3){
                return '$B.list_slice_step(' + val +
                    ', ' + (this.tree[0].to_js() || "null") + ',' +
                    (this.tree[1].to_js() || "null") + ',' +
                    (this.tree[2].to_js() || "null") + ')'
            }
        }
    }
    if(this.func == 'getitem' && this.tree.length == 1){
        if(this.tree[0].type == "slice"){
            return `$B.getitem_slice(${this.value.to_js()}, ` +
                `${this.tree[0].to_js()})`
        }
        return '$B.$getitem(' + this.value.to_js() + ',' +
            this.tree[0].to_js() + ')'
    }
    if(this.func == 'delitem' && this.tree.length == 1){
        if(this.tree[0].type == "slice"){
            return `$B.delitem_slice(${this.value.to_js()}, ` +
                `${this.tree[0].to_js()})`
        }
        return '$B.$delitem(' + this.value.to_js() + ',' +
            this.tree[0].to_js() + ')'
    }
    var res = '',
        shortcut = false
    if(this.func !== 'delitem' &&
            this.tree.length == 1 && !this.in_sub){
        var expr = '', x = this
        shortcut = true
        while(x.value.type == 'sub'){
            expr += '[' + x.tree[0].to_js() + ']'
            x.value.in_sub = true
            x = x.value
        }
        var subs = x.value.to_js() + '[' + x.tree[0].to_js() + ']' +
            '((Array.isArray(' + x.value.to_js() + ') || typeof ' +
            x.value.to_js() + ' == "string") && ' + subs +
            ' !== undefined ?' + subs + expr + ' : '
    }
    var val = this.value.to_js()
    res += '$B.$getattr(' + val + ',"__' + this.func + '__")('
    if(this.tree.length == 1){
        res += this.tree[0].to_js() + ')'
    }else{
        var res1 = []
        for(var elt of this.tree){
            if(elt.type == 'abstract_expr'){res1.push('_b_.None')}
            else{res1.push(elt.to_js())}
        }
        res += '_b_.tuple.$factory([' + res1.join(',') + ']))'
    }
    return shortcut ? res + ')' : res
}

var $TargetListCtx = $B.parser.$TargetListCtx = function(context){
    // Class for target of "for" in loops or comprehensions,
    // eg x in "for target_list in A"
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.expect = 'id'
    this.nb_packed = 0
    context.tree[context.tree.length] = this
}

$TargetListCtx.prototype.ast = function(){
    if(this.tree.length == 1){
        var item = ast_or_obj(this.tree[0])
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
            item = ast_or_obj(item)
            if(item.hasOwnProperty('ctx')){
                item.ctx = new ast.Store()
            }
            items.push(item)
        }
        return new ast.Tuple(items, new ast.Store())
    }
}

$TargetListCtx.prototype.toString = function(){
    return '(target list) ' + this.tree
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
                return new $PackedCtx(context)
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
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$TargetListCtx.prototype.to_js = function(){
    this.js_processed = true
    return $to_js(this.tree)
}

var $TernaryCtx = $B.parser.$TernaryCtx = function(context){
    // Class for the ternary operator : "x if C else y"
    // "context" represents the expression "x"
    // Replace it by an expression holding the ternary
    this.type = 'ternary'
    context.parent.tree.pop()
    var expr = new $ExprCtx(context.parent, 'ternary', false)
    expr.tree.push(this)
    this.parent = expr
    this.tree = [context]
    context.parent = this
}

$TernaryCtx.prototype.ast = function(){
    // ast.IfExp(test, body, orelse)
    return new ast.IfExp(ast_or_obj(this.tree[1]), ast_or_obj(this.tree[0]),
        ast_or_obj(this.tree[2]))
}

$TernaryCtx.prototype.toString = function(){
    return '(ternary) ' + this.tree
}

$TernaryCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'else'){
        context.in_else = true
        return new $AbstractExprCtx(context, false)
    }else if(! context.in_else){
        $_SyntaxError(context, 'token ' + token + ' after ' + context)
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

$TernaryCtx.prototype.to_js = function(){
    this.js_processed = true
    var res = '$B.$bool(' + this.tree[1].to_js() + ') ? ' // condition
    res += this.tree[0].to_js() + ' : '    // result if true
    return res + this.tree[2].to_js()      // result if false
}

var $TryCtx = $B.parser.$TryCtx = function(context){
    // Class for the keyword "try"
    this.type = 'try'
    this.parent = context
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
            res.handlers.push(ast_or_obj(t))
        }else if(type == 'else'){
            res.orelse = ast_body(child.context)
        }else if(type == 'finally'){
            res.finalbody = ast_body(child.context)
        }else{
            break
        }
    }
    return new ast.Try(res.body, res.handlers, res.orelse, res.finalbody)
}

$TryCtx.prototype.toString = function(){
    return '(try) '
}

$TryCtx.prototype.transition = function(token, value){
    var context = this
    if(token == ':'){
        return $BodyCtx(context)
    }
    $_SyntaxError(context, 'token ' + token + ' after ' + context)
}

$TryCtx.prototype.transform = function(node, rank){
    if(node.parent.children.length == rank + 1){
        $_SyntaxError(node.context, ["unexpected EOF while parsing"])
    }
    var scope = $get_scope(this)

    var error_name = create_temp_name('$err')

    // Add a boolean $failed, used to run the 'else' clause. Set as an
    // attribute of $locals for the case when code is inside a
    // generator (cf. issue #1146)
    var failed_name = "$locals." + create_temp_name('$failed')

    // Transform node into Javascript 'try' (necessary if
    // "try" inside a "for" loop)

    var js = failed_name + ' = false;\n' +
        ' '.repeat(node.indent + 4) + 'try'
    new $NodeJSCtx(node, js)
    node.has_return = this.has_return

    // Insert new 'catch' clause
    var catch_node = $NodeJS('catch('+ error_name + ')')
    node.parent.insert(rank + 1, catch_node)

    // Store exception as the attribute $current_exception of $locals
    catch_node.add($NodeJS("$B.set_exc(" + error_name + ")"))
    // Trace exception if needed
    catch_node.add($NodeJS("if($locals.$f_trace !== _b_.None)" +
        "{\n$locals.$f_trace = $B.trace_exception()}"))

    // Set the boolean $failed to true
    // Set attribute "pmframe" (post mortem frame) to $B in case an error
    // happens in a callback function ; in this case the frame would be
    // lost at the time the exception is handled by $B.exception
    catch_node.add(
        $NodeJS(failed_name + ' = true;' +
        '$B.pmframe = $B.last($B.frames_stack);'+
        // Fake line to start the 'else if' clauses
        'if(false){\n}')
    )

    var pos = rank + 2,
        has_default = false, // is there an "except:" ?
        has_else = false, // is there an "else" clause ?
        has_finally = false
    while(1){
        if(pos == node.parent.children.length){break}
        var ctx = node.parent.children[pos].context.tree[0]
        if(ctx === undefined){
            // This is the case for "marker" nodes in yield from
            break
        }
        if(ctx.type == 'except'){
            // move the except clauses below catch_node
            if(has_else){
                $_SyntaxError(context,"'except' or 'finally' after 'else'")
            }
            if(has_finally){
                $_SyntaxError(context,"'except' after 'finally'")
            }
            ctx.error_name = error_name
            if(ctx.tree.length > 0 && ctx.tree[0].alias !== null
                    && ctx.tree[0].alias !== undefined){
                // syntax "except ErrorName as Alias"
                var alias = ctx.tree[0].alias
                node.parent.children[pos].insert(0,
                    $NodeJS('$locals["' + alias + '"] = $B.exception(' +
                        error_name + ')')
                )
            }
            catch_node.insert(catch_node.children.length,
                node.parent.children[pos])
            if(ctx.tree.length == 0){
                if(has_default){
                    $_SyntaxError(context,'more than one except: line')
                }
                has_default = true
            }
            node.parent.children.splice(pos, 1)
        }else if(ctx.type == 'single_kw' && ctx.token == 'finally'){
            has_finally = true
            var finally_node = node.parent.children[pos]
            pos++
        }else if(ctx.type == 'single_kw' && ctx.token == 'else'){
            if(has_else){
                $_SyntaxError(context,"more than one 'else'")
            }
            if(has_finally){
                $_SyntaxError(context,"'else' after 'finally'")
            }
            has_else = true
            var else_body = node.parent.children[pos]
            node.parent.children.splice(pos, 1)
        }else{break}
    }
    if(!has_default){
        // If no default except clause, add a line to throw the
        // exception if it was not caught
        var new_node = new $Node(),
            ctx = new $NodeCtx(new_node)
        catch_node.insert(catch_node.children.length, new_node)
        new $SingleKwCtx(ctx, 'else')
        new_node.add($NodeJS('throw '+ error_name))
    }
    if(has_else){
        var else_node = new $Node()
        else_node.module = scope.module
        new $NodeJSCtx(else_node, 'if(!'+failed_name+ ')')
        for(var elt of else_body.children){
            else_node.add(elt)
        }
        // If the try block has a "finally" node, the "else" node must
        // be put in it, because the "else" block must be executed
        // before finally - cf issue #500
        if(has_finally){
            finally_node.insert(0, else_node)
        }else{
            node.parent.insert(pos, else_node)
        }
        pos++
    }

    $loop_num++
}

$TryCtx.prototype.to_js = function(){
    this.js_processed = true
    return 'try'
}

var $UnaryCtx = $B.parser.$UnaryCtx = function(context, op){
    // Class for unary operators : - and ~
    this.type = 'unary'
    this.op = op
    this.parent = context
    this.tree = []
    context.tree.push(this)
}

$UnaryCtx.prototype.ast = function(){
    var op = {'+': ast.UAdd, '-': ast.USub, '~': ast.Invert}[this.op]
    return new ast.UnaryOp(new op(), ast_or_obj(this.tree[0]))
}

$UnaryCtx.prototype.toString = function(){
    return '(unary) ' + this.op
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
            if(context.parent.type == "packed"){
                $_SyntaxError(context,
                    ["can't use starred expression here"])
            }
            var res = new $NumberCtx(token, context, value)
            console.log('new number after unary', res)
            alert()
            return res
        case 'id':
            return $transition(new $AbstractExprCtx(context, false),
                token, value)
    }
    if(this.tree.length == 0 || this.tree[0].type == 'abstract_expr'){
        $_SyntaxError(context, 'token ' + token + 'after context' + context)
    }
    return $transition(context.parent, token, value)
}

$UnaryCtx.prototype.to_js = function(){
    this.js_processed = true
    var operand = this.tree[0].tree[0]
    switch(operand.type){
        case 'float':
            return '_b_.float.$factory(' + this.op + operand.value +')'
        case 'int':
            var value = eval(operand.to_js())
            if(value.__class__ != $B.long_int){
                return eval(this.op + value)
            }
    }
    var method = {'-': '__neg__', '+': '__pos__', '~': '__invert__'}[this.op]
    return '$B.$call($B.$getattr(' + operand.to_js() + ', "' +
        method + '"))()'
}

var $WithCtx = $B.parser.$WithCtx = function(context){
    // Class for keyword "with"
    this.type = 'with'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'as'
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
    for(var item of this.tree){
        withitem = new ast.withitem(ast_or_obj(item.tree[0]))
        if(item.alias){
            withitem.optional_vars = ast_or_obj(item.alias.tree[0])
            withitem.optional_vars.ctx = new ast.Store()
        }
        withitems.push(withitem)
    }
    var klass = this.async ? ast.AsyncWith : ast.With
    return new klass(withitems, ast_body(this.parent))
}

$WithCtx.prototype.toString = function(){
    return '(with) ' + this.tree
}

$WithCtx.prototype.transition = function(token, value){
    var context = this
    switch(token) {
        case 'id':
            if(context.expect == 'id'){
                context.expect = 'as'
                return $transition(
                    new $AbstractExprCtx(context, false), token,
                        value)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'as':
            return new $AbstractExprCtx(new $AliasCtx(context))
        case ':':
            switch(context.expect) {
                case 'id':
                case 'as':
                case ':':
                    return $BodyCtx(context)
            }
            break
        case '(':
            if(context.expect == 'id' && context.tree.length == 0){
                context.parenth = true
                return context
            }else if(context.expect == 'alias'){
               context.expect = ':'
               return new $TargetListCtx(context, false)
            }
            break
        case ')':
            if(context.expect == ',' || context.expect == 'as') {
               context.expect = ':'
               return context
            }
            break
        case ',':
            if(context.parenth !== undefined &&
                    context.has_alias === undefined &&
                    (context.expect == ',' || context.expect == 'as')){
                context.expect = 'id'
                return context
            }else if(context.expect == 'as'){
                context.expect = 'id'
                return context
            }else if(context.expect == ':'){
                context.expect = 'id'
                return context
            }
            break
    }
    $_SyntaxError(context, 'token ' + token + ' after ' +
        context.expect)
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
    for(var i = 0, len = ids.length; i < len; i++){
        var id_ctx = ids[i]
        $bind(id_ctx.value, this.scope, this)
        id_ctx.bound = true
        if(this.scope.ntype !== 'module'){
            // add to function local names
            this.scope.context.tree[0].locals.push(id_ctx.value)
        }
    }
}

$WithCtx.prototype.transform = function(node, rank){
    while(this.tree.length > 1){
        /*
        with A() as a, B() as b:
            suite

        is equivalent to

        with A() as a:
            with B() as b:
                suite
        */

        var suite = node.children,
            item = this.tree.pop(),
            new_node = new $Node(),
            ctx = new $NodeCtx(new_node),
            with_ctx = new $WithCtx(ctx)
        item.parent = with_ctx
        with_ctx.tree = [item]
        with_ctx.async = this.async
        for(var elt of suite){
            new_node.add(elt)
        }
        node.children = [new_node]
    }

    /* PEP 243 says that

    with EXPR as VAR:
        BLOCK

       is transformed into


    mgr = (EXPR)
    exit = type(mgr).__exit__  # Not calling it yet
    value = type(mgr).__enter__(mgr)
    exc = True
    try:
        try:
            VAR = value  # Only if "as VAR" is present
            BLOCK
        except:
            # The exceptional case is handled here
            exc = False
            if not exit(mgr, *sys.exc_info()):
                raise
            # The exception is swallowed if exit() returns true
    finally:
        # The normal and non-local-goto cases are handled here
        if exc:
            exit(mgr, None, None, None)

    */

    if(this.transformed){return}  // used if inside a for loop

    this.prefix = ""

    // If there are several "with" clauses, create a new child
    // For instance :
    //     with x as x1, y as y1:
    //         ...
    // becomes
    //     with x as x1:
    //         with y as y1:
    //             ...

    if(this.tree.length > 1){
        var nw = new $Node(),
            ctx = new $NodeCtx(nw)
        nw.parent = node
        nw.module = node.module
        nw.indent = node.indent + 4
        var wc = new $WithCtx(ctx)
        wc.async = this.async
        wc.tree = this.tree.slice(1)
        for(var elt of node.children){
            nw.add(elt)
        }
        node.children = [nw]
        this.transformed = true

        return
    }

    if(this.async){
        return this.transform_async(node, rank)
    }

    var top_try_node = $NodeJS("try")
    node.parent.insert(rank + 1, top_try_node)

    // Used to create js identifiers:
    var num = this.num = $loop_num++

    top_try_node.ctx_manager_num = num

    this.cm_name  = this.prefix + '$ctx_manager' + num
    this.cmexit_name = this.prefix + '$ctx_manager_exit' + num
    this.exc_name = this.prefix + '$exc' + num
    this.err_name = '$err' + num
    this.val_name = '$value' + num
    this.yield_name = this.prefix + '$yield' + num

    if(this.tree[0].alias === null){this.tree[0].alias = '$temp'}

    // Form "with (a,b,c) as (x,y,z)"

    if(this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'list_or_tuple'){
        if(this.tree[1].type != 'expr' ||
            this.tree[1].tree[0].type != 'list_or_tuple'){
                $_SyntaxError(context)
        }
        if(this.tree[0].tree[0].tree.length !=
                this.tree[1].tree[0].tree.length){
            $_SyntaxError(context, ['wrong number of alias'])
        }
        // this.tree[1] is a list of alias for items in this.tree[0]
        var ids = this.tree[0].tree[0].tree,
            alias = this.tree[1].tree[0].tree
        this.tree.shift()
        this.tree.shift()
        for(var i = ids.length - 1; i >= 0; i--){
            ids[i].alias = alias[i].value
            this.tree.splice(0, 0, ids[i])
        }
    }

    var block = node.children // the block of code to run

    node.children = []

    var try_node = new $Node()
    new $NodeJSCtx(try_node, 'try')
    top_try_node.add(try_node)

    // if there is an alias, simulate VAR = value
    // VAR can be anything valid at the left of the equal sign
    // cf. issue #1608
    if(this.tree[0].alias){
        var new_node = new $Node(),
            ctx = new $NodeCtx(new_node)
        try_node.add(new_node)
        this.tree[0].alias.tree[0].parent = ctx
        var assign = new $AssignCtx(this.tree[0].alias.tree[0])
        assign.tree.push(new $RawJSCtx(ctx, this.val_name))
    }

    // place block inside a try clause
    for(var elt of block){
        try_node.add(elt)
    }

    var catch_node = new $Node()
    new $NodeJSCtx(catch_node, 'catch(' + this.err_name + ')')

    var js = this.exc_name + ' = false;' + this.err_name +
            ' = $B.exception(' + this.err_name + ', true)\n' +
            ' '.repeat(node.indent + 4) +
            'var $b = ' + this.cmexit_name + '(' +
            this.err_name + '.__class__,' +
            this.err_name + ','+
            '$B.$getattr(' + this.err_name + ', "__traceback__"));'
    js += '\nif(!$B.$bool($b)){\nthrow ' + this.err_name + '}'
    catch_node.add($NodeJS(js))
    top_try_node.add(catch_node)

    var finally_node = new $Node()
    new $NodeJSCtx(finally_node, 'finally')
    finally_node.context.type = 'single_kw'
    finally_node.context.token = 'finally'
    finally_node.context.in_ctx_manager = true
    finally_node.is_except = true
    finally_node.in_ctx_manager = true
    var js = 'if(' + this.exc_name
    js += '){\n' + this.cmexit_name + '(_b_.None, _b_.None, _b_.None);'
    if(this.scope.ntype == "generator"){
        js += 'delete ' + this.cmexit_name
    }
    js += '};'
    finally_node.add($NodeJS(js))
    node.parent.insert(rank + 2, finally_node)

    this.transformed = true
}

$WithCtx.prototype.transform_async = function(node, rank){
    /*
    PEP 492 says that

        async with EXPR as VAR:
            BLOCK

    is semantically equivalent to:

        mgr = (EXPR)
        aexit = type(mgr).__aexit__
        aenter = type(mgr).__aenter__(mgr)

        VAR = await aenter
        try:
            BLOCK
        except:
            if not await aexit(mgr, *sys.exc_info()):
                raise
        else:
            await aexit(mgr, None, None, None)
    */

    var scope = $get_scope(this),
        expr = this.tree[0],
        alias = this.tree[0].alias

    var new_nodes = []
    var num = this.num = $loop_num++

    this.cm_name  = '$ctx_manager' + num,
    this.cmexit_name = '$ctx_manager_exit' + num
    this.exc_name = '$exc' + num
    var cmtype_name = '$ctx_mgr_type' + num,
        cmenter_name = '$ctx_manager_enter' + num,
        err_name = '$err' + num

    // Line mgr = (EXPR)
    var js = 'var ' + this.cm_name + ' = $locals.' + this.cm_name + ' = ' +
        expr.to_js() +','
    new_nodes.push($NodeJS(js))

    // aexit = type(mgr).__aexit__
    new_nodes.push($NodeJS('    ' + cmtype_name +
        ' = _b_.type.$factory(' + this.cm_name + '),'))
    new_nodes.push($NodeJS('    ' + this.cmexit_name +
        ' = $B.$call($B.$getattr(' + cmtype_name + ', "__aexit__")),'))

    // aenter = type(mgr).__aenter__(mgr)
    new_nodes.push($NodeJS('    ' + cmenter_name +
        ' = $B.$call($B.$getattr(' + cmtype_name + ', "__aenter__"))' +
        '(' + this.cm_name + '),'))

    new_nodes.push($NodeJS("    " + this.exc_name + " = false"))

    // VAR = await aenter
    js = ""

    if(alias){
        if(alias.tree[0].tree[0].type != "list_or_tuple"){
            var js = alias.tree[0].to_js() + ' = ' +
                'await ($B.promise(' + cmenter_name + '))'
            new_nodes.push($NodeJS(js))
        }else{
            // Form "with manager as(x, y)"
            var new_node = new $Node(),
                ctx = new $NodeCtx(new_node),
                expr = new $ExprCtx(ctx, "left", false)
            expr.tree.push(alias.tree[0].tree[0])
            alias.tree[0].tree[0].parent = expr
            var assign = new $AssignCtx(expr)

            new $RawJSCtx(assign, 'await ($B.promise(' +
                cmenter_name + '))')

            new_nodes.push(new_node)
        }
    }else{
        new_nodes.push($NodeJS('await ($B.promise(' + cmenter_name + '))'))
    }

    // try:
    //     BLOCK
    var try_node = new $NodeJS('try')
    for(var child of node.children){
        try_node.add(child)
    }
    new_nodes.push(try_node)

    // except:
    var catch_node = new $NodeJS('catch(err)')
    new_nodes.push(catch_node)

    //     if not await aexit(mgr, $sys.exc_info())
    catch_node.add($NodeJS(this.exc_name + ' = true'))
    catch_node.add($NodeJS('var ' + err_name +
        ' = $B.imported["_sys"].exc_info()'))
    var if_node = $NodeJS('if(! await ($B.promise(' +
        this.cmexit_name + '(' + this.cm_name + ', ' + err_name + '[0], ' +
        err_name + '[1], ' + err_name + '[2]))))')
    catch_node.add(if_node)
    //         raise
    if_node.add($NodeJS('$B.$raise()'))

    // else:
    var else_node = $NodeJS('if(! ' + this.exc_name +')')
    new_nodes.push(else_node)
    //     await aexit(mgr, None, None, None)
    else_node.add($NodeJS('await ($B.promise(' + this.cmexit_name + '(' +
        this.cm_name +', _b_.None, _b_.None, _b_.None)))'))

    // Remove original node
    node.parent.children.splice(rank, 1)

    for(var i = new_nodes.length - 1; i >= 0; i--){
        node.parent.insert(rank, new_nodes[i])
    }
    node.children = []
    return 0

}

$WithCtx.prototype.to_js = function(){
    this.js_processed = true
    var indent = $get_node(this).indent,
        h = ' '.repeat(indent),
        num = this.num
    var head = this.prefix == "" ? "var " : this.prefix,
        cm_name  = '$ctx_manager' + num,
        cme_name = head + '$ctx_manager_exit' + num,
        exc_name = head + '$exc' + num,
        val_name = '$value' + num
    return 'var ' + cm_name + ' = $locals.' + cm_name + ' = ' +
           this.tree[0].to_js() + '\n' +
           h + cme_name + ' = $B.$getattr('+cm_name+',"__exit__")\n' +
           h + 'var ' + val_name + ' = $B.$getattr('+cm_name+',"__enter__")()\n' +
           h + exc_name + ' = true\n'
}

var $YieldCtx = $B.parser.$YieldCtx = function(context, is_await){
    // Class for keyword "yield"
    this.type = 'yield'
    this.parent = context
    this.tree = []
    this.is_await = is_await
    context.tree[context.tree.length] = this

    if(context.type == "list_or_tuple" && context.tree.length > 1){
        $_SyntaxError(context, "non-parenthesized yield")
    }

    if($parent_match(context, {type: "annotation"})){
        $_SyntaxError(context,
            ["'yield' outside function"])
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
            $_SyntaxError(context, ["'yield' inside list comprehension"])
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
                break;

            // or start a 'yield atom'
            // a 'yield atom' without enclosing "(" and ")" is only allowed as the
            // right-hand side of an assignment

            case 'assign':
            case 'list_or_tuple':
                // mark the node as containing a yield atom
                //$get_node(context).yield_atoms.push(this)
                break
           default:
                // else it is a SyntaxError
                $_SyntaxError(context, 'yield atom must be inside ()')
        }
    }

}

$YieldCtx.prototype.ast = function(){
    // ast.Yield(value)
    // ast.YieldFrom(value)
    if(this.from){
        return new ast.YieldFrom(ast_or_obj(this.tree[0]))
    }
    if(this.tree.length == 1){
        return new ast.Yield(ast_or_obj(this.tree[0]))
    }else{
        return new ast.Yield()
    }
}

$YieldCtx.prototype.toString = function(){
    return '(yield) ' + (this.from ? '(from) ' : '') + this.tree
}

$YieldCtx.prototype.transition = function(token, value){
    var context = this
    if(token == 'from'){ // form "yield from <expr>"
        if(context.tree[0].type != 'abstract_expr'){
            // 'from' must follow 'yield' immediately
            $_SyntaxError(context, "'from' must follow 'yield'")
        }

        context.from = true
        context.from_num = $B.UUID()
        return context.tree[0]
    }else{
        remove_abstract_expr(context.tree)
    }
    return $transition(context.parent, token)
}

$YieldCtx.prototype.transform = function(node, rank){
    // If inside a context manager, mark frame
    var parent = node.parent
    while(parent){
        if(parent.ctx_manager_num !== undefined){
            node.parent.insert(rank + 1,
                $NodeJS("$top_frame[1].$has_yield_in_cm = true"))
            break
        }
        parent = parent.parent
    }
}

$YieldCtx.prototype.to_js = function(){
    if(this.from){
        return `_r${this.from_num}`
    }else{
        return "yield " + $to_js(this.tree)
    }
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
    if(! in_func){
        $_SyntaxError(this.parent, ["'yield' outside function"])
    }else{
        var def = func_scope.context.tree[0]
        if(! this.is_await){
            def.type = 'generator'
        }
    }
}

var $add_line_num = $B.parser.$add_line_num = function(node, rank, line_info){
    if(node.type == 'module'){
        var i = 0
        while(i < node.children.length){
            i += $add_line_num(node.children[i], i, line_info)
        }
    }else if(node.type !== 'marker'){
        var elt = node.context.tree[0],
            offset = 1,
            flag = true,
            pnode = node,
            _line_info
        while(pnode.parent !== undefined){
            pnode = pnode.parent
        }
        var mod_id = node.module || pnode.id
        // ignore lines added in transform()
        var line_num = node.line_num
        if(line_num === undefined){
            flag = false
        }
        // Don't add line num before try,finally,else,elif
        // because it would throw a syntax error in Javascript
        if((elt.type == 'condition' && elt.token == 'elif') ||
                elt.type == 'except' ||
                elt.type == 'single_kw' ||
                elt.type == 'case'){
            flag = false
        }
        if(flag){

            _line_info = line_info === undefined ? line_num + ',' + mod_id :
                line_info
            var js = ';$locals.$line_info = "' + _line_info +
                '";if($locals.$f_trace !== _b_.None){$B.trace_line()};' +
                '_b_.None;'
            var new_node = new $Node()
            new_node.is_line_num = true // used in generators
            new $NodeJSCtx(new_node, js)
            node.parent.insert(rank, new_node)
            offset = 2
        }
        var i = 0
        while(i < node.children.length){
            i += $add_line_num(node.children[i], i, line_info)
        }
        return offset
    }else{
        return 1
    }
}

function find_scope(name, scope){
    // find the scope of a name referenced or bound in "scope"
    if(scope.binding[name]){
        return scope
    }else if(scope.globals && scope.globals.has(name)){
        return $get_module(scope.context)
    }else if(scope.nonlocals && scope.nonlocals.has(name)){
        // check that one of the upper scopes has name
        var parent_block = scope.parent_block
        while(parent_block){
            if(parent_block.binding[name]){
                return parent_block
            }
            parent_block = parent_block.parent_block
        }
    }
}

var $bind = $B.parser.$bind = function(name, scope, context){
    // Bind a name in scope:
    // - add the name in the attribute "binding" of the scope
    // - add it to the attribute "bindings" of the node, except if no_bindings
    //   is set, which is the case for "for x in A" : if A is empty the name
    //   has no value (issue #1233)
    name = $mangle(name, context)
    if(scope.nonlocals && scope.nonlocals.has(name)){
        // name is declared nonlocal in the scope : don't bind
        var parent_block = scope.parent_block
        while(parent_block){
            if(parent_block.binding[name]){
                return parent_block
            }
            parent_block = parent_block.parent_block
        }
        return
    }

    if(scope.globals && scope.globals.has(name)){
        var module = $get_module(context)
        module.binding[name] = true
        return module
    }

    if(! context.no_bindings){
        var node = $get_node(context)
        // Add name to attribute "bindings" of node. Used in $IdCtx.boundBefore()
        node.bindings = node.bindings || {}
        node.bindings[name] = true
    }

    scope.binding = scope.binding || {}
    if(! scope.binding.hasOwnProperty(name)){
        scope.binding[name] = true
    }
    scope.varnames = scope.varnames || {}
    if(scope.varnames[name] === undefined){
        scope.varnames[name] = true
    }
    return scope
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
        $_SyntaxError(context, 'keyword not following correct keyword')
    }
    return previous.context.tree[0]
}

var $get_docstring = $B.parser.$get_docstring = function(node){
    var doc_string = ''
    if(node.children.length > 0){
        var firstchild = node.children[0]
        if(firstchild.context.tree && firstchild.context.tree.length > 0 &&
                firstchild.context.tree[0].type == 'expr'){
            var expr = firstchild.context.tree[0].tree[0]
            // Set as docstring if first child is a string, but not a f-string
            if(expr.type == 'str' && !Array.isArray(expr.tree[0])){
                doc_string = firstchild.context.tree[0].tree[0].to_js()
            }
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

var $get_line_num = $B.parser.$get_line_num = function(context){
    var ctx_node = $get_node(context),
        line_num = ctx_node.line_num
    if(ctx_node.line_num === undefined){
        ctx_node = ctx_node.parent
        while(ctx_node && ctx_node.line_num === undefined){
            ctx_node = ctx_node.parent
        }
        if(ctx_node && ctx_node.line_num){
            line_num = ctx_node.line_num
        }
    }
    return line_num
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

var $get_src = $B.parser.$get_src = function(context){
    // Get the source code of context module
    var node = $get_node(context)
    while(node.parent !== undefined){node = node.parent}
    return node.src
}

var $get_node = $B.parser.$get_node = function(context){
    var ctx = context
    while(ctx.parent){
        ctx = ctx.parent
    }
    return ctx.node
}

var $to_js_map = $B.parser.$to_js_map = function(tree_element) {
    if(tree_element.to_js !== undefined){return tree_element.to_js()}
    console.log('no to_js', tree_element)
    throw Error('no to_js() for ' + tree_element)
}

var $to_js = $B.parser.$to_js = function(tree, sep){
    if(sep === undefined){sep = ','}
    try{
        return tree.map($to_js_map).join(sep)
    }catch(err){
        console.log('error', err, '\ntree', tree)
        throw err
    }
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
        console.log("context", context, "token", token, value, '$pos', $pos)
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

function line_ends_with_comma(src){
    // used to check if 'match' or 'case' are the "soft keywords" for pattern
    // matching, or ordinary ids
    var expect = ':',
        braces = []
    for(token of $B.tokenizer(src)){
        if(expect == ':'){
            if(token.type == 'OP' && token.string == ':' && braces.length == 0){
                expect = 'eol'
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
                return false
            }
        }else{
            return token.type == 'NEWLINE'
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
            return {type: 'imaginary', value: n.substr(0, n.length - 1)}
        }else{
            return {type: 'float', value: n}
        }
        pos = j
    }else if(n.startsWith('0') && n != '0'){
        // octal, hexadecimal, binary
        var num = test_num(n),
            base
        if(num.imaginary){
            return {type: 'imaginary', value: num.value}
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
           return {
               type: num.imaginary ? 'imaginary' : 'float',
               value: num.value
           }
        }else{
            return {
               type: num.imaginary ? 'imaginary' : 'int',
               value: num.imaginary ? num.value : [10, num.value]
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
                $pos = string_start + seq_end + 2
                $_SyntaxError(context,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\xXX escape"])
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "u":
            var mo = /^[0-9A-F]{0,4}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 4){
                seq_end = antislash_pos + mo[0].length + 1
                $pos = string_start + seq_end + 2
                $_SyntaxError(context,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape"])
            }else{
                return [String.fromCharCode(parseInt(mo[0], 16)), 2 + mo[0].length]
            }
        case "U":
            var mo = /^[0-9A-F]{0,8}/i.exec(text.substr(antislash_pos + 2))
            if(mo[0].length != 8){
                seq_end = antislash_pos + mo[0].length + 1
                $pos = string_start + seq_end + 2
                $_SyntaxError(context,
                     ["(unicode error) 'unicodeescape' codec can't decode " +
                     `bytes in position ${antislash_pos}-${seq_end}: truncated ` +
                     "\\uXXXX escape"])
            }else{
                var value = parseInt(mo[0], 16)
                if(value > 0x10FFFF){
                    $_SyntaxError('invalid unicode escape ' + mo[0])
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
                        $_SyntaxError(context,"(unicode error) " +
                            "malformed \\N character escape", pos)
                    }
                    var end_lit = end_lit + search[0].length
                    if(src.charAt(end_lit) != "}"){
                        $_SyntaxError(context, "(unicode error) " +
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
                            $_SyntaxError(context, "(unicode error) " +
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
            console.log(pos, end, src.substring(pos, end))
            $_SyntaxError(context, ["EOL while scanning string literal"])
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
            $_SyntaxError(context, [err.message])
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

function handle_errortoken(context, token){
    if(token.string == "'" || token.string == '"'){
        $_SyntaxError(context, ['unterminated string literal ' +
            `(detected at line ${token.start[0]})`])
    }
    $_SyntaxError(context, 'invalid token ' + token[1] + _b_.ord(token[1]))
}

var python_keywords = [
    "class", "return", "break", "for", "lambda", "try", "finally",
    "raise", "def", "from", "nonlocal", "while", "del", "global",
    "with", "as", "elif", "else", "if", "yield", "assert", "import",
    "except", "raise", "in", "pass", "with", "continue", "__debugger__",
    "async", "await"
]

var dispatch_tokens = $B.parser.dispatch_tokens = function(root, src){
    var tokenizer = $B.tokenizer(src)
    var braces_close = {")": "(", "]": "[", "}": "{"},
        braces_open = "([{",
        braces_stack = []

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
            var token = tokenizer.next()
        }catch(err){
            context = context || new $NodeCtx(node)
            if(err.type == 'IndentationError'){
                $pos = line2pos[err.line_num]
                $_SyntaxError(context, err.message, 1)
            }else if(err instanceof SyntaxError){
                if(braces_stack.length > 0){
                    var last_brace = $B.last(braces_stack),
                        start = last_brace.start
                    context.$pos = line2pos[start[0]] + start[1]
                    $_SyntaxError(context, [`'${last_brace.string}' was ` +
                       'never closed'])
                }
                $_SyntaxError(context, err.message)
            }
            throw err
        }
        if(token.done){
            throw Error('token done without ENDMARKER.')
        }
        token = token.value
        if(token[2] === undefined){
            console.log('token incomplet', token, 'module', module, root)
            console.log('src', src)
        }
        if(token.start === undefined){
            console.log('no start', token)
        }
        lnum = token.start[0]
        $pos = line2pos[lnum] + token.start[1]
        //console.log(token, 'lnum', lnum)
        //console.log('context', context)
        if(expect_indent &&
                ['INDENT', 'COMMENT', 'NL'].indexOf(token.type) == -1){
            context = context || new $NodeCtx(node)
            $_SyntaxError(context, "expected an indented block", expect_indent)
        }

        switch(token.type){
            case 'ENDMARKER':
                // Check that all "yield"s are in a function
                if(root.yields_func_check){
                    var save_pos = $pos
                    for(const _yield of root.yields_func_check){
                        $pos = _yield[1]
                        _yield[0].check_in_function()
                    }
                    $pos = save_pos
                }
                if(indent != 0){
                    $_SyntaxError(node.context, 'expected an indented block',
                        1)
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
                    handle_errortoken(context, token)
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
                        $_SyntaxError(context,
                            "Unsupported Python keyword '" + name + "'")
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
                    }else if(braces_close[op]){
                        if(braces_stack.length == 0){
                            $_SyntaxError(context, "unmatched '" + op + "'")
                        }else{
                            var last_brace = $B.last(braces_stack)
                            if(last_brace.string == braces_close[op]){
                                braces_stack.pop()
                            }else{
                                $_SyntaxError(context,
                                    [`closing parenthesis '${op}' does not ` +
                                    `match opening parenthesis '` +
                                    `${last_brace.string}'`])
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
                        $_SyntaxError(context, 'statement cannot start with ;')
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
                    $_SyntaxError(context, [err.message])
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
                node.parent.children.pop()
                // Attach new_node to new "current"
                node.parent.parent.add(node)
                continue
            case 'INDENT':
                // The last node was added after a NEWLINE set the context
                // to "null". It was attached to the current parent. Detach
                // it
                indent++
                // node.parent.children.pop()
                // Check that it supports indentation
                if(! expect_indent){
                    context = context || new $NodeCtx(node)
                    $_SyntaxError(context, 'unexpected indent', $pos)
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
    root.binding = {
        __doc__: true,
        __name__: true,
        __file__: true,
        __package__: true
    }

    root.parent_block = parent_block
    root.line_num = line_num
    root.indent = -1
    root.comments = []
    root.imports = {}
    if(typeof src == "object"){
        root.is_comp = src.is_comp
        root.filename = src.filename
        if(src.has_annotations){
            root.binding.__annotations__ = true
        }
        src = src.src
    }
    root.src = src
    return root
}

$B.py2js = function(src, module, locals_id, parent_scope, line_num){
    // src = Python source (string)
    // module = module name (string)
    // locals_id = the id of the block that will be created
    // parent_scope = the scope where the code is created
    // line_info = [line_num, parent_block_id] if debug mode is set
    //
    // Returns a tree structure representing the Python source code
    $pos = 0

    if(typeof module == "object"){
        var __package__ = module.__package__
        module = module.__name__
    }else{
        var __package__ = ""
    }

    parent_scope = parent_scope || $B.builtins_scope

    var t0 = new Date().getTime(),
        has_annotations = true, // determine if __annotations__ is created
        line_info, // set for generator expression
        ix, // used for generator expressions
        filename
    if(typeof src == 'object'){
        var has_annotations = src.has_annotations,
            line_info = src.line_info,
            ix = src.ix,
            filename = src.filename
        if(line_info !== undefined){
            line_num = parseInt(line_info.split(",")[0])
        }
        src = src.src
    }else if(line_num !== undefined){
        line_info = `${line_num},${module}`
    }else{
        line_num = 1
    }
    // Normalize line ends
    src = src.replace(/\r\n/gm, "\n")
    // Remove trailing \, cf issue 970
    // but don't hide syntax error if ends with \\, cf issue 1210
    if(src.endsWith("\\") && !src.endsWith("\\\\")){
        src = src.substr(0, src.length - 1)
    }
    // Normalise script end
    if(src.charAt(src.length - 1) != "\n"){src += "\n"}

    var locals_is_module = Array.isArray(locals_id)
    if(locals_is_module){
        locals_id = locals_id[0]
    }
    var local_ns = '$locals_' + locals_id.replace(/\./g,'_'),
        global_ns = '$locals_' + module.replace(/\./g,'_'),
        root = $create_root_node(
            {src: src, has_annotations: has_annotations,
                filename: filename},
            module, locals_id, parent_scope, line_num)

    dispatch_tokens(root, src)
    if($B.produce_ast){
        var ast = ast_dump(root.ast())
        if($B.produce_ast == 2){
            console.log(ast)
        }
    }
    if(ix != undefined){
        root.ix = ix
    }
    root.transform()

    // Create internal variables
    var js = 'var $B = __BRYTHON__,\n' +
             '    _b_ = __BRYTHON__.builtins,\n' +
             '    $locals = ' + local_ns +';\n'

    var offset = 0

    root.insert(0, $NodeJS(js))
    offset++

    // package, if available
    root.insert(offset++,
        $NodeJS(local_ns + '.__package__ = "' + __package__ +'"'))

    // annotations
    if(root.binding.__annotations__){
        root.insert(offset++,
            $NodeJS('$locals.__annotations__ = $B.empty_dict()'))
    }

    // Code to create the execution frame and store it on the frames stack
    var enter_frame_pos = offset,
        js = 'var $top_frame = ["' + locals_id.replace(/\./g, '_') + '", ' +
            local_ns + ', "' + module.replace(/\./g, '_') + '", ' +
            global_ns + ']\n$locals.$f_trace = $B.enter_frame($top_frame)\n' +
            'var $stack_length = $B.frames_stack.length;'

    root.insert(offset++, $NodeJS(js))

    // Wrap code in a try/finally to make sure we leave the frame
    var try_node = new $NodeJS('try'),
        children = root.children.slice(enter_frame_pos + 1,
            root.children.length)
    root.insert(enter_frame_pos + 1, try_node)

    // Add module body to the "try" clause
    if(children.length == 0){
        children = [$NodeJS('')] // in case the script is empty
    }
    for(var child of children){
        try_node.add(child)
    }
    // add node to exit frame in case no exception was raised
    try_node.add($NodeJS('$B.leave_frame({$locals, value: _b_.None})'))

    root.children.splice(enter_frame_pos + 2, root.children.length)

    var catch_node = $NodeJS('catch(err)')
    catch_node.add($NodeJS('$B.leave_frame({$locals, value: _b_.None})'))
    catch_node.add($NodeJS('throw err'))

    root.add(catch_node)

    // Add line numbers for debugging
    $add_line_num(root, null, line_info)

    var t1 = new Date().getTime()
    if($B.debug > 2){
        if(module == locals_id){
            console.log('module ' + module + ' translated in ' +
                (t1 - t0) + ' ms')
        }
    }

    $B.compile_time += t1 - t0
    return root
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
    var $href = $B.script_path = _window.location.href,
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
}

// Reserved for future use : execute Python scripts as soon as they are
// inserted in the page, instead of waiting for page load.
// options are passed as attributes of the <script> tag, eg
// <script type="text/python" debug=2>
if(! $B.isWebWorker){
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
    $B.parse_options(options)
    if(!($B.isWebWorker || $B.isNode)){
        observer.disconnect()
        _run_scripts(options)
    }
}

$B.run_script = function(src, name, url, run_loop){
    // run_loop is set to true if run_script is added to tasks in
    // ajax_load_script
    try{
        var root = $B.py2js(src, name, name),
            js = root.to_js(),
            script = {
                __doc__: root.__doc__,
                js: js,
                __name__: name,
                $src: src,
                __file__: url
            }
            $B.file_cache[script.__file__] = src
            if($B.debug > 1){
                console.log($B.format_indent(js, 0))
            }
    }catch(err){
        $B.handle_error(err) // in loaders.js
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
var _run_scripts = $B.parser._run_scripts = function(options){
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

            root = $B.py2js($src, module_name, module_name)
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
                        {name: module_name, url: elt.src}])
                }else{
                    // Get source code inside the script element
                    src = (elt.innerHTML || elt.textContent)
                    src = unindent(src) // remove global indentation
                    // remove leading CR if any
                    src = src.replace(/^\n/, '')
                    $B.tasks.push([$B.run_script, src, module_name,
                        $B.script_path + "#" + module_name, true])
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

$B.$operators = $operators
$B.$Node = $Node
$B.$NodeJSCtx = $NodeJSCtx

// in case the name 'brython' is used in a Javascript library,
// we can use $B.brython

$B.brython = brython

})(__BRYTHON__)

var brython = __BRYTHON__.brython

if (__BRYTHON__.isNode) {
    global.__BRYTHON__ = __BRYTHON__
    module.exports = { __BRYTHON__ }
}

