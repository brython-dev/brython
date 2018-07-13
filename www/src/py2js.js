// Python to Javascript translation engine

;(function($B){

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
var _window = self;
var isWebWorker = $B.isa_web_worker =
    ('undefined' !== typeof WorkerGlobalScope) &&
    ("function" === typeof importScripts) &&
    (navigator instanceof WorkerNavigator)

$B.parser = {}

/*
Utility functions
=================
*/

// Keys of an object
var keys = $B.keys = function(obj){
    var res = []
    for(var attr in obj){res.push(attr)}
    res.sort()
    return res
}

// Return a clone of an object
var clone = $B.clone = function(obj){
    var res = {}
    for(var attr in obj){res[attr] = obj[attr]}
    return res
}

// Last element in a list
$B.last = function(table){return table[table.length - 1]}

// Convert a list to an object indexed with list values
$B.list2obj = function(list, value){
    var res = {},
        i = list.length
    if(value === undefined){value = true}
    while(i-- > 0){res[list[i]] = value}
    return res
}

/*
Internal variables
==================
*/

// Mapping between operators and special Python method names
var $operators = {
    "//=": "ifloordiv", ">>=": "irshift", "<<=": "ilshift",
    "**=": "ipow", "**": "pow", "//": "floordiv", "<<": "lshift",
    ">>": "rshift", "+=": "iadd", "-=": "isub", "*=": "imul",
    "/=": "itruediv", "%=": "imod", "&=": "iand", "|=": "ior",
    "^=": "ixor", "+": "add", "-": "sub", "*": "mul", "/": "truediv",
    "%": "mod", "&": "and", "|": "or", "~": "invert", "^": "xor",
    "<": "lt", ">": "gt", "<=": "le", ">=": "ge", "==": "eq", "!=": "ne",
    "or": "or", "and": "and", "in": "in", "not": "not", "is": "is",
    "not_in": "not_in", "is_not": "is_not", // fake
    "@": "matmul", "@=": "imatmul" // PEP 465
}

// Mapping between augmented assignment operators and method names
var $augmented_assigns = $B.augmented_assigns = {
    "//=": "ifloordiv", ">>=": "irshift", "<<=": "ilshift", "**=": "ipow",
    "+=": "iadd","-=": "isub", "*=": "imul", "/=": "itruediv", "%=": "imod",
    "&=": "iand","|=": "ior","^=": "ixor", "@=": "imatmul"
}

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
    ['+'],
    ['-'],
    ['*', '@', '/', '//', '%'],
    ['unary_neg', 'unary_inv', 'unary_pos'],
    ['**']
]

var $op_weight = {},
    $weight = 1
$op_order.forEach(function(_tmp){
    _tmp.forEach(function(item){
        $op_weight[item] = $weight
    })
    $weight++
})

// Variable used to generate random names used in loops
var $loop_num = 0

var create_temp_name = $B.parser.create_temp_name = function(prefix) {
    var _prefix = prefix || '$temp'
    return _prefix + $loop_num ++;
}

/*
 * Replaces the node :param:`replace_what` ($Node) with :param:`replace_with`
 * in the ast tree (assumes replace_what is a child of its parent)
 */
var replace_node = $B.parser.replace_node = function(replace_what, replace_with){
    var parent = replace_what.parent
    var pos = get_rank_in_parent(replace_what)
    parent.children[pos] = replace_with
    replace_with.parent = parent
    // Save node bindings
    replace_with.bindings = replace_what.bindings
}

/*
 * Returns n such that :param:`node` is the n-th child of its parent node.
 */
var get_rank_in_parent = $B.parser.get_rank_in_parent = function(node) {
    return node.parent.children.indexOf(node)
}

// Adds a new block of javascript to :param:`parent` at position :param:`insert_at`.
// Position may also be '-1' in which case the node is added at the end. Other
// negative positions are not supported.
// Returns the created $Node.
var add_jscode = $B.parser.add_jscode = function(parent, insert_at, code) {
    var new_node = new $NodeJS(code)
    if (insert_at === -1)
        parent.add(new_node)
    else
        parent.insert(insert_at, new_node)
    return new_node
}

// Adds a new identifier node to :param:`parent` at position :param:`insert_at`.
// The identifier will be named :param:`name` and it will be assigned the value
// :param:`val`, which should be a node.
// Position may also be '-1' in which case the node is added at the end. Other
// negative positions are not supported.
// Returns the newly created $Node.
//
// Example:
//
// If one wants to add, e.g., the python statement
//
//    a = 10
//
// to a node, one could use the method as follows
//
//    add_identnode(node, -1, 'a', new $JSCode('10'))
//
//
var add_identnode = $B.parser.add_identnode = function(parent, insert_at, name, val) {
    var new_node = new $Node()
    new_node.parent = parent
    new_node.locals = parent.locals
    new_node.module = parent.module
    var new_ctx = new $NodeCtx(new_node)

    var expr_ctx = new $ExprCtx(new_ctx, 'id', true)
    var idctx = new $IdCtx(expr_ctx, name)
    var assign = new $AssignCtx(expr_ctx)

    if (insert_at === -1)
        parent.add(new_node)
    else
        parent.insert(insert_at, new_node)

    assign.tree[1] = val


    return new_node
}


// Returns the node owning this context (as a descendant)
var $get_closest_ancestor_node = $B.parser.$get_closest_ancestor_node = function(ctx) {
    while(ctx.parent)
        ctx = ctx.parent
    return ctx.node
}


/*
 * This helper function is used to convert `yield from` statements into
 * blocks of code using only `yield` (see PEP 808). When a yield from
 * is encountered, this function creates the python code (see variable replace_with)
 * parses it using the :function:`$tokenize` function inserting it at the current
 * position in the tree. Finally, the yield_ctx is replaced with a $YieldFromMarkerNode
 * which, when transformed, does the following:
 *
 *   1. stores the expression that is yielded from into the variable `_i`
 *      so that it can then be used in the replacement code
 *
 *   2. adds a node to store the value sent to the generator
 *      in the appropriate variable (i.e. if `x = yield from z`
 *      the variable `x` needs to hold the value sent to the generator).
 *
 * Note that since the function :function:`$add_yield_from_code` is called
 * during the parsing process when the `from` token is encountered, the expression
 * that is yielded from is not parsed yet so that we can't populate the variable `_i`
 * but must post-pone it to the transform method of $YieldFromMarkerNode.
 */
var $add_yield_from_code = $B.parser.$add_yield_from_code = function(yield_ctx) {
    var pnode = $get_closest_ancestor_node(yield_ctx)
    var generator = $get_scope(yield_ctx).context.tree[0]


    pnode.yield_atoms.splice(pnode.yield_atoms.indexOf(this),1)
    generator.yields.splice(generator.yields.indexOf(this), 1)

    /*
                  RESULT = yield from EXPR

        should be equivalent to

                  _i = iter(EXPR)
    */


    var INDENT = " ".repeat(pnode.indent)

    var replace_with =
        INDENT + "import sys"                                       + "\n" +
        INDENT + "try:"                                             + "\n" +
        INDENT + "    _y = next(_i)"                                + "\n" +
        INDENT + "except StopIteration as _e:"                      + "\n" +
        INDENT + "    _r = _e.value"                                + "\n" +
        INDENT + "else:"                                            + "\n" +
        INDENT + "    while 1:"                                     + "\n" +
        INDENT + "        try:"                                     + "\n" +
        INDENT + "            _s = yield _y"                        + "\n" +
        INDENT + "        except GeneratorExit as _e:"              + "\n" +
        INDENT + "            try:"                                 + "\n" +
        INDENT + "                _m = _i.close"                    + "\n" +
        INDENT + "            except AttributeError:"               + "\n" +
        INDENT + "                pass"                             + "\n" +
        INDENT + "            else:"                                + "\n" +
        INDENT + "                _m()"                             + "\n" +
        INDENT + "            raise _e"                             + "\n" +
        INDENT + "        except BaseException as _e:"              + "\n" +
        INDENT + "            _x = sys.exc_info()"                  + "\n" +
        INDENT + "            try:"                                 + "\n" +
        INDENT + "                _m = _i.throw"                    + "\n" +
        INDENT + "            except AttributeError:"               + "\n" +
        INDENT + "                raise _e"                         + "\n" +
        INDENT + "            else:"                                + "\n" +
        INDENT + "                try:"                             + "\n" +
        INDENT + "                    _y = _m(*_x)"                 + "\n" +
        INDENT + "                except StopIteration as _e:"      + "\n" +
        INDENT + "                    _r = _e.value"                + "\n" +
        INDENT + "                    break"                        + "\n" +
        INDENT + "        else:"                                    + "\n" +
        INDENT + "            try:"                                 + "\n" +
        INDENT + "                if _s is None:"                   + "\n" +
        INDENT + "                    _y = next(_i)"                + "\n" +
        INDENT + "                else:"                            + "\n" +
        INDENT + "                    _y = _i.send(_s)"             + "\n" +
        INDENT + "            except StopIteration as _e:"          + "\n" +
        INDENT + "                _r = _e.value"                    + "\n" +
        INDENT + "                break"                            + "\n";

    var repl = {
        _i : create_temp_name('__i'),
        _y : create_temp_name('__y'),
        _r : create_temp_name('__r'),
        _e : create_temp_name('__e'),
        _s : create_temp_name('__s'),
        _m : create_temp_name('__m'),
    }

    pnode.bindings = pnode.bindings || {}

    for(attr in repl){
        replace_with = replace_with.replace(new RegExp(attr, 'g'), repl[attr])
        // Add internal names to node bindings
        pnode.bindings[repl[attr]] = true
    }
    $tokenize(pnode, replace_with)

    var params = {
        iter_name: repl._i,
        result_var_name: repl._r,
        yield_expr: yield_ctx,
    }

    if (yield_ctx.parent.type === 'assign') {
        params.save_result = true
        params.assign_ctx = yield_ctx.parent
        params.save_result_rank = pnode.parent.children.length-pnode.parent.children.indexOf(pnode)
    }

    replace_node(pnode, new $YieldFromMarkerNode(params))

}


// Variable used for chained comparison
var chained_comp_num = 0

/*
Function called in case of SyntaxError
======================================
*/

var $_SyntaxError = $B.parser.$_SyntaxError = function (context,msg,indent){
    //console.log("syntax error", context, msg)
    var ctx_node = context
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
    var tree_node = ctx_node.node,
        root = tree_node
    while(root.parent !== undefined){root = root.parent}
    var module = tree_node.module
    var line_num = tree_node.line_num
    if(root.line_info){
        line_num = root.line_info
    }
    if(indent !== undefined){line_num++}
    if(indent === undefined){
        if(Array.isArray(msg)){$B.$SyntaxError(module, msg[0], $pos, line_num)}
        if(msg === "Triple string end not found"){
            // add an extra argument : used in interactive mode to
            // prompt for the rest of the triple-quoted string
            $B.$SyntaxError(module,
                'invalid syntax : triple string end not found',
                $pos, line_num, root)
        }
        $B.$SyntaxError(module, 'invalid syntax', $pos, line_num, root)
    }else{throw $B.$IndentationError(module, msg, $pos)}
}

/*
Class for Python abstract syntax tree
=====================================

An instance is created for the whole Python program as the root of the tree

For each instruction in the Python source code, an instance is created
as a child of the block where it stands : the root for instructions at
module level, or a function definition, a loop, a condition, etc.
*/

var $Node = $B.parser.$Node = function(type){
    this.type = type
    this.children = []
    this.yield_atoms = []

    this.add = function(child){
        // Insert as the last child
        this.children[this.children.length] = child
        child.parent = this
        child.module = this.module
    }

    this.insert = function(pos,child){
        // Insert child at position pos
        this.children.splice(pos, 0, child)
        child.parent = this
        child.module = this.module
    }

    this.toString = function(){return "<object 'Node'>"}

    this.show = function(indent){
        // For debugging purposes
        var res = ''
        if(this.type === 'module'){
            this.children.forEach(function(child){
                res += child.show(indent)
            })
            return res
        }

        indent = indent || 0
        res += ' '.repeat(indent)
        res += this.context
        if(this.children.length > 0){res += '{'}
        res +='\n'
        this.children.forEach(function(child){
           res += '[' + i + '] ' + child.show(indent + 4)
        })
        if(this.children.length > 0){
          res += ' '.repeat(indent)
          res += '}\n'
        }
        return res
    }

    this.to_js = function(indent){
        // Convert the node into a string with the translation in Javascript

        if(this.js !== undefined){return this.js}

        this.res = []
        this.unbound = []
        if(this.type === 'module'){
            this.children.forEach(function(child){
                this.res.push(child.to_js())
            }, this)
            this.js = this.res.join('')
            return this.js
        }
        indent = indent || 0
        var ctx_js = this.context.to_js()
        if(ctx_js){ // empty for "global x"
          this.res.push(' '.repeat(indent))
          this.res.push(ctx_js)
          if(this.children.length > 0){this.res.push('{')}
          this.res.push('\n')
          this.children.forEach(function(child){
              this.res.push(child.to_js(indent + 4))
          }, this)
          if(this.children.length > 0){
             this.res.push(' '.repeat(indent))
             this.res.push('}\n')
          }
        }
        this.js = this.res.join('')

        return this.js
    }

    this.transform = function(rank){
        // Apply transformations to each node recursively
        // Returns an offset : in case children were inserted by transform(),
        // we must jump to the next original node, skipping those that have
        // just been inserted

        if(this.yield_atoms.length > 0){
            // If the node contains 'yield' atoms, we must split the node into
            // several nodes
            // The line 'a = yield X' is transformed into 4 lines :
            //     $yield_value0 = X
            //     yield $yield_value0
            //     $yield_value0 = <value sent to generator > or None
            //     a = $yield_value0

            // remove original line
            this.parent.children.splice(rank, 1)
            var offset = 0
            this.yield_atoms.forEach(function(atom){
                // create a line to store the yield expression in a
                // temporary variable
                var temp_node = new $Node()
                var js = 'var $yield_value' + $loop_num
                js += ' = ' + (atom.to_js() || 'None')
                new $NodeJSCtx(temp_node, js)
                this.parent.insert(rank + offset, temp_node)

                // create a node to yield the yielded value
                var yield_node = new $Node()
                this.parent.insert(rank + offset + 1, yield_node)
                var yield_expr = new $YieldCtx(new $NodeCtx(yield_node))
                new $StringCtx(yield_expr, '$yield_value' + $loop_num)

                // create a node to set the yielded value to the last
                // value sent to the generator, if any
                var set_yield = new $Node()
                set_yield.is_set_yield_value = true

                // the JS code will be set in py_utils.$B.make_node
                js = $loop_num
                new $NodeJSCtx(set_yield, js)
                this.parent.insert(rank + offset + 2, set_yield)

                // in the original node, replace yield atom by None
                atom.to_js = (function(x){
                    return function(){return '$yield_value' + x}
                    })($loop_num)

                $loop_num++
                offset += 3
          }, this)
          // insert the original node after the yield nodes
          this.parent.insert(rank + offset, this)
          this.yield_atoms = []

          // Because new nodes were inserted in node parent, return the
          // offset for iteration on parent's children
          return offset + 1
        }

        if(this.type === 'module'){
            // module doc string
            this.doc_string = $get_docstring(this)
            var i = 0
            while(i < this.children.length){
                var offset = this.children[i].transform(i)
                if(offset === undefined){offset = 1}
                i += offset
            }
        }else{
            var elt = this.context.tree[0], ctx_offset
            if(elt.transform !== undefined){
                ctx_offset = elt.transform(this, rank)
            }
            var i = 0
            while(i < this.children.length){
                var offset = this.children[i].transform(i)
                if(offset === undefined){offset = 1}
                i += offset
            }
            if(ctx_offset === undefined){ctx_offset = 1}

            if(this.context && this.context.tree !== undefined &&
                    this.context.tree[0].type == "generator"){
                var def_node = this,
                    def_ctx = def_node.context.tree[0]
                var blocks = [],
                    node = def_node.parent_block,
                    is_comp = node.is_comp

                while(true){
                    var node_id = node.id.replace(/\./g, '_'),
                        block = '"$locals_' + node_id + '": '
                    if(is_comp){
                        block += '$B.clone($locals_' + node_id + ')'
                    }else{
                        block += '$locals_' + node_id
                    }
                    blocks.push(block)
                    node = node.parent_block
                    if(node === undefined || node.id == '__builtins__'){break}
                }
                blocks = '{' + blocks + '}'

                var parent = this.parent
                while(parent !== undefined && parent.id === undefined){
                    parent = parent.parent
                }

                var g = $B.$BRgenerator(def_ctx.name, blocks,
                    def_ctx.id, def_node),
                    block_id = parent.id.replace(/\./g, '_'),
                    name = def_ctx.decorated ? def_ctx.alias :
                        def_ctx.name + def_ctx.num,
                    res = 'var ' + def_ctx.name + def_ctx.num + ' = ' +
                        '$locals_' + block_id + '["' + def_ctx.name +
                        '"] = $B.genfunc("' +
                        def_ctx.name + '", ' + blocks + ',[' + g + '],' +
                        def_ctx.default_str + ')'
                var new_node = $NodeJS(res)
                new_node.bindings = this.bindings
                this.parent.children.splice(rank, 1)
                this.parent.insert(rank + offset - 1, new_node)
            }

            return ctx_offset
        }
    }

    this.clone = function(){
        var res = new $Node(this.type)
        for(var attr in this){res[attr] = this[attr]}
        return res
    }

}

var $YieldFromMarkerNode = $B.parser.$YieldFromMarkerNode = function(params) {
    $Node.apply(this, ['marker'])
    new $NodeCtx(this)
    this.params = params
    this.tree
    this.transform = function(rank) {
        add_identnode(this.parent, rank,
                params.iter_name,
                new $JSCode('$B.$iter(' + params.yield_expr.tree[0].to_js() + ')')
        )
        if (params.save_result) {
            var assign_ctx = params.assign_ctx
            assign_ctx.tree.pop()
            var expr_ctx = new $ExprCtx(assign_ctx, 'id', true)
            var idctx = new $IdCtx(expr_ctx, params.result_var_name)
            assign_ctx.tree[1] = expr_ctx
            var new_node = add_jscode(this.parent, params.save_result_rank+rank+1,
                assign_ctx.to_js()
            )
        }
        return 2
    }

}

var $MarkerNode = $B.parser.$MarkerNode = function(name) {
    $Node.apply(this, ['marker'])
    new $NodeCtx(this)
    this._name = name
    this.transform = function(rank){return 1}
    this.to_js = function(){return ''}
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
    context.tree[context.tree.length] = this

    this.toString = function(){
        return '(abstract_expr ' + with_commas + ') ' + this.tree
    }

    this.to_js = function(){
        this.js_processed = true
        if(this.type === 'list') return '[' + $to_js(this.tree) + ']'
        return $to_js(this.tree)
    }
}

var $AliasCtx = $B.parser.$AliasCtx = function(context){
    // Class for context manager alias
    this.type = 'ctx_manager_alias'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length - 1].alias = this
}

var $AnnotationCtx = $B.parser.$AnnotationCtx = function(context){
    // Class for annotations, eg "def f(x:int) -> list:"
    this.type = 'annotation'
    this.parent = context
    this.tree = []
    // annotation is stored in attribute "annotations" of parent, not "tree"
    context.annotation = this

    this.toString = function(){return '(annotation) ' + this.tree}

    this.to_js = function(){return $to_js(this.tree)}
}

var $AssertCtx = $B.parser.$AssertCtx = function(context){
    // Context for keyword "assert"
    this.type = 'assert'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(assert) ' + this.tree}

    this.transform = function(node, rank){
        if(this.tree[0].type == 'list_or_tuple'){
            // form "assert condition,message"
            var condition = this.tree[0].tree[0]
            var message = this.tree[0].tree[1]
        }else{
            var condition = this.tree[0]
            var message = null
        }
        // transform "assert cond" into "if not cond: throw AssertionError"
        var new_ctx = new $ConditionCtx(node.context, 'if')
        var not_ctx = new $NotCtx(new_ctx)
        not_ctx.tree = [condition]
        node.context = new_ctx
        var new_node = new $Node()
        var js = 'throw AssertionError.$factory("AssertionError")'
        if(message !== null){
            js = 'throw AssertionError.$factory(str.$factory(' +
                message.to_js() + '))'
        }
        new $NodeJSCtx(new_node, js)
        node.add(new_node)
    }
}

var $AssignCtx = $B.parser.$AssignCtx = function(context){
    /*
    Class for the assignment operator "="
    context is the left operand of assignment
    This check is done when the AssignCtx object is created, but must be
    disabled if a new AssignCtx object is created afterwards by method
    transform()
    */
    var ctx = context
    while(ctx){
        if(ctx.type == 'assert'){
            $_SyntaxError(context, 'invalid syntax - assign')
        }
        ctx = ctx.parent
    }

    this.type = 'assign'
    // replace parent by "this" in parent tree
    context.parent.tree.pop()
    context.parent.tree[context.parent.tree.length] = this

    this.parent = context.parent
    this.tree = [context]

    var scope = $get_scope(this)

    if(context.type == 'expr' && context.tree[0].type == 'call'){
          $_SyntaxError(context, ["can't assign to function call "])
    }else if(context.type == 'list_or_tuple' ||
        (context.type == 'expr' && context.tree[0].type == 'list_or_tuple')){
        if(context.type == 'expr'){context = context.tree[0]}
        // Bind all the ids in the list or tuple
        context.bind_ids(scope)
    }else if(context.type == 'assign'){
        context.tree.forEach(function(elt){
            var assigned = elt.tree[0]
            if(assigned.type == 'id'){
                $bind(assigned.value, scope, this)
            }
        }, this)
    }else{
        var assigned = context.tree[0]
        if(assigned && assigned.type == 'id'){
            if(noassign[assigned.value] === true){
                $_SyntaxError(context,["can't assign to keyword"])
            }
            // Attribute bound of an id indicates if it is being
            // bound, as it is the case in the left part of an assignment
            assigned.bound = true
            if(!$B._globals[scope.id] ||
                $B._globals[scope.id][assigned.value] === undefined){
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
                node.bound_before = $B.keys(scope.binding)
                $bind(assigned.value, scope, this)
            }else{
                // assignement to a variable defined as global : bind name at
                // module level (issue #690)
                var module = $get_module(context)
                $bind(assigned.value, module, this)
            }
        }else if(["str", "int", "float", "complex"].indexOf(assigned.type) > -1){
            $_SyntaxError(context, ["can't assign to literal"])
        }
    }

    this.guess_type = function(){
        return
    }

    this.toString = function(){
        return '(assign) ' + this.tree[0] + '=' + this.tree[1]
    }

    this.transform = function(node, rank){
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
            assigned.forEach(function(elt){
                var new_node = new $Node(),
                    node_ctx = new $NodeCtx(new_node)
                new_node.locals = node.locals
                new_node.line_num = node.line_num
                node.parent.insert(rank + 1,new_node)
                elt.parent = node_ctx
                var assign = new $AssignCtx(elt)
                new $RawJSCtx(assign, '$temp' + $loop_num)
            })
            $loop_num++
            return assigned.length - 1
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
                    if($B._globals && $B._globals[scope.id]
                        && $B._globals[scope.id][name]){
                    }else{
                        left.tree[0].bound = true
                    }
                }
                break
            case 'target_list':
            case 'list_or_tuple':
                left_items = left.tree
        }
        if(left_items === null){return}
        var right = this.tree[1]

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
            var new_nodes = [], pos = 0
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

            right_items.forEach(function(right_item){
                var js = $var + '[$pos++] = ' + right_item.to_js()
                var new_node = new $Node()
                new_node.line_num = node.line_num
                new $NodeJSCtx(new_node, js)
                new_nodes[pos++] = new_node
            })
            var this_node = $get_node(this)
            left_items.forEach(function(left_item){
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
            }, this)
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

            add_jscode(node.parent, rank++,
                'var ' + rname + ' = ' + '$B.$getattr($B.$iter(' + right.to_js() + '), "__next__");'
            ).line_num = node.line_num // set attribute line_num for debugging

            add_jscode(node.parent, rank++,
                'var '+rlname+'=[], $pos=0;'+
                'while(1){'+
                    'try{' +
                        rlname + '[$pos++] = ' + rname +'()' +
                    '}catch(err){'+
                       'break'+
                    '}'+
                '}'
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
            add_jscode(node.parent, rank++,
                'if(' + rlname + '.length<' + min_length + '){' +
                    'throw ValueError.$factory('+
                       '"need more than " +' + rlname + '.length + " value" + (' +
                        rlname + '.length > 1 ?' + ' "s" : "") + " to unpack"'+
                    ')'+
                '}'
            )

             // Test if there were enough variables in the left part
            if(packed == null){
                add_jscode(node.parent, rank++,
                    'if(' + rlname + '.length>' + min_length + '){' +
                        'throw ValueError.$factory(' +
                           '"too many values to unpack ' +
                           '(expected ' + left_items.length + ')"'+
                        ')'+
                    '}'
                )
            }


            left_items.forEach(function(left_item, i){

                var new_node = new $Node()
                new_node.id = scope.id
                new_node.line_num = node.line_num
                node.parent.insert(rank++, new_node)
                var context = new $NodeCtx(new_node) // create ordinary node
                left_item.parent = context
                var assign = new $AssignCtx(left_item, false) // assignment to left operand
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
    this.to_js = function(){
        this.js_processed = true
        if(this.parent.type == 'call'){// like in foo(x=0)
            return '{$nat:"kw",name:' + this.tree[0].to_js() +
                ',value:' + this.tree[1].to_js() + '}'
        }

        // assignment
        var left = this.tree[0]
        if(left.type == 'expr'){left = left.tree[0]}

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
              return res + ',' + rvar + ');None;'
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
                      temp + '.__class__){'
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
              res += '\n}else{'
              if(left.tree.length == 1){
                  res += '$B.$setitem(' + left.value.to_js() +
                      ',' + left.tree[0].to_js() + ',' + right_js + ')};None;'
              }else{
                  left.func = 'setitem' // just for to_js()
                  res += left.to_js()
                  res = res.substr(0, res.length - 1) // remove trailing )
                  left.func = 'getitem' // restore default function
                  res += ',' + right_js + ')};None;'
              }
              return res
            }
        }
        return left.to_js() + ' = ' + right.to_js()
    }
}

var $AsyncCtx = $B.parser.$AsyncCtx = function(context){
    // Class for async : def, while, for
    this.type = 'async'
    this.parent = context
    context.async = true
    this.toString = function(){return '(async)'}
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

    this.toString = function(){return '(attr) ' + this.value + '.' + this.name}

    this.to_js = function(){
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
                        return [js + ".__class__ && !" +
                            js + ".__class__.$has_setattr ? " + js + "." +
                            this.name + " = ", " : $B.$setattr(" + js +
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
}

var $AugmentedAssignCtx = $B.parser.$AugmentedAssignCtx = function(context, op){
    // Class for augmented assignments such as "+="
    this.type = 'augm_assign'
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
            if(noassign[name] === true){
                $_SyntaxError(context, ["can't assign to keyword"])
            }else if((scope.ntype == 'def' || scope.ntype == 'generator') &&
                    (scope.binding[name] === undefined)){
                if(scope.globals === undefined ||
                        scope.globals.indexOf(name) == -1){
                    // Augmented assign to a variable not yet defined in
                    // local scope : set attribute "unbound" to the id. If not
                    // defined in the rest of the block this will raise an
                    // UnboundLocalError
                    assigned.unbound = true
                }
            }
        }else if(['str', 'int', 'float', 'complex'].indexOf(assigned.type) > -1){
            $_SyntaxError(context, ["can't assign to literal"])
        }
    }

    // Store the names already bound
    $get_node(this).bound_before = $B.keys(scope.binding)

    this.module = scope.module

    this.toString = function(){return '(augm assign) ' + this.tree}

    this.transform = function(node, rank){

        var func = '__' + $operators[op] + '__',
            offset = 0,
            parent = node.parent,
            line_num = node.line_num,
            lnum_set = false

        // remove current node
        parent.children.splice(rank, 1)

        var left_is_id = (this.tree[0].type == 'expr' &&
            this.tree[0].tree[0].type == 'id')

        if(left_is_id){
            // Set attribute "augm_assign" of $IdCtx instance, so that
            // the id will not be resolved with $B.$check_undef()
            this.tree[0].tree[0].augm_assign = true

            // If left part is an id we must check that it is defined,
            // otherwise raise NameError
            // Example :
            //
            // if False:
            //     a = 0
            // a += 1

            // For performance reasons, this is only implemented in debug mode
            if($B.debug > 0){
                var check_node = $NodeJS('if(' + this.tree[0].to_js() +
                    ' === undefined){throw NameError.$factory("name \'' +
                    this.tree[0].tree[0].value + '\' is not defined")}')
                // Add attribute forced_line_num instead of line_num because
                // it would break on profile mode
                check_node.forced_line_num = node.line_num
                node.parent.insert(rank, check_node)
                offset++
            }
            var left_id = this.tree[0].tree[0].value,
                was_bound = this.scope.binding[left_id] !== undefined,
                left_id_unbound = this.tree[0].tree[0].unbound
        }

        var right_is_int = (this.tree[1].type == 'expr' &&
            this.tree[1].tree[0].type == 'int')

        var right = right_is_int ? this.tree[1].tree[0].to_js() : '$temp'

        if(!right_is_int){
            // Create temporary variable
            var new_node = new $Node()
            new_node.line_num = line_num
            lnum_set = true
            new $NodeJSCtx(new_node, 'var $temp,$left;')
            parent.insert(rank, new_node)
            offset++

            // replace current node by "$temp = <placeholder>"
            // at the end of $augmented_assign, control will be
            // passed to the <placeholder> expression
            var new_node = new $Node()
            new_node.id = this.scope.id
            var new_ctx = new $NodeCtx(new_node)
            var new_expr = new $ExprCtx(new_ctx, 'js', false)
            // The id must be a "raw_js", otherwise if scope is a class,
            // it would create a class attribute "$class.$temp"
            var _id = new $RawJSCtx(new_expr, '$temp')
            var assign = new $AssignCtx(new_expr)
            assign.tree[1] = this.tree[1]
            _id.parent = assign
            parent.insert(rank + offset, new_node)
            offset++
        }

        var prefix = '', in_class = false

        switch(op) {
            case '+=':
            case '-=':
            case '*=':
            case '/=':
                if(left_is_id){
                    var scope = this.scope,
                        global_ns = '$local_' + scope.module.replace(/\./g, '_')
                    switch(scope.ntype){
                        case 'module':
                            prefix = global_ns
                            break
                        case 'def':
                        case 'generator':
                            if(scope.globals &&
                                    scope.globals.indexOf(context.tree[0].value) > -1){
                                prefix = global_ns
                            }else{prefix = '$locals'}
                            break
                        case 'class':
                          var new_node = new $Node()
                          if(!lnum_set){
                              new_node.line_num = line_num
                              lnum_set = true
                          }
                          new $NodeJSCtx(new_node, 'var $left = ' +
                              context.to_js())
                          parent.insert(rank + offset, new_node)
                          in_class = true
                          offset++
                    }
                }
        }

        var left = context.tree[0].to_js()

        // Generate code to use Javascript operator if the object type is
        // str, int or float
        // If the left part is a name not defined in the souce code, which is
        // the case with "from A import *", the name is replaced by a
        // function call "$B.$search(name, globals_name)"
        // Since augmented assignement can't be applied to a function call
        // the shortcut will not be used in this case

        prefix = prefix && !context.tree[0].unknown_binding && !left_id_unbound
        var op1 = op.charAt(0)

        if(prefix){
            var left1 = in_class ? '$left' : left
            var new_node = new $Node()
            if(!lnum_set){new_node.line_num = line_num; lnum_set = true}
            js = right_is_int ? 'if(' : 'if(typeof $temp.valueOf() == "number" && '
            js += left1 + '.constructor === Number'

            // If both arguments are integers, we must check that the result
            // is a safe integer
            js += ' && Number.isSafeInteger(' + left + op1 + right + ')){' +
                (right_is_int ? '(' : '(typeof $temp == "number" && ') +
                'typeof ' + left1 + ' == "number") ? '

            js += left + op + right

            // result is a float
            js += ' : ' + left + ' = new Number(' + left + op1 +
                (right_is_int ? right : right + '.valueOf()') + ')}'

            new $NodeJSCtx(new_node, js)
            parent.insert(rank + offset, new_node)
            offset++

        }
        var aaops = {'+=': 'add', '-=': 'sub', '*=': 'mul'}
        if(context.tree[0].type == 'sub' &&
                ('+=' == op || '-=' == op || '*=' == op) &&
                context.tree[0].tree.length == 1){
            var js1 = '$B.augm_item_' + aaops[op] + '(' +
                context.tree[0].value.to_js() + ',' +
                context.tree[0].tree[0].to_js() + ',' + right + ');None;'
            var new_node = new $Node()
            if(!lnum_set){new_node.line_num = line_num; lnum_set = true}
            new $NodeJSCtx(new_node, js1)
            parent.insert(rank + offset, new_node)
            offset++
            return
        }

        // insert node 'if(!hasattr(x, "__iadd__"))
        var new_node = new $Node()
        if(!lnum_set){new_node.line_num = line_num; lnum_set = true}
        var js = ''
        if(prefix){js += 'else '}
        js += 'if(!hasattr(' + context.to_js() + ',"' + func + '"))'
        new $NodeJSCtx(new_node, js)
        parent.insert(rank + offset, new_node)
        offset++

        // create node for "x = x + y"
        var aa1 = new $Node()
        aa1.id = this.scope.id
        aa1.line_num = node.line_num
        new_node.add(aa1)
        var ctx1 = new $NodeCtx(aa1)
        var expr1 = new $ExprCtx(ctx1, 'clone', false)
        if(left_id_unbound){
            new $RawJSCtx(expr1, '$locals["' + left_id + '"]')
        }else{
            expr1.tree = context.tree
            expr1.tree.forEach(function(elt){
                elt.parent = expr1
            })
        }
        var assign1 = new $AssignCtx(expr1)
        var new_op = new $OpCtx(expr1, op.substr(0, op.length - 1))
        new_op.parent = assign1
        new $RawJSCtx(new_op, right)
        assign1.tree.push(new_op)
        expr1.parent.tree.pop()
        expr1.parent.tree.push(assign1)

        // create node for "else"
        var else_node = $NodeJS("else")
        parent.insert(rank + offset, else_node)

        // create node for "x = x.__iadd__(y)"
        var aa2 = new $Node()
        aa2.line_num = node.line_num
        else_node.add(aa2)

        var ctx2 = new $NodeCtx(aa2)
        var expr2 = new $ExprCtx(ctx2, 'clone', false)
        if(left_id_unbound){
            new $RawJSCtx(expr2, '$locals["' + left_id + '"]')
        }else{
            expr2.tree = context.tree
            expr2.tree.forEach(function(elt){
                elt.parent = expr2
            })
        }
        var assign2 = new $AssignCtx(expr2)
        assign2.tree.push($NodeJS('$B.$getattr(' + context.to_js() + ',"' +
            func + '")(' + right + ')'))
        expr2.parent.tree.pop()
        expr2.parent.tree.push(assign2)

        // Augmented assignment doesn't bind names ; if the variable name has
        // been bound in the code above (by a call to $AssignCtx), remove it
        if(left_is_id && !was_bound && !this.scope.blurred){
            this.scope.binding[left_id] = undefined
        }

        return offset
    }

    this.to_js = function(){return ''}
}

var $AwaitCtx = $B.parser.$AwaitCtx = function(context){
    // Class for "await"
    this.type = 'await'
    this.parent = context
    this.tree = []
    context.tree.push(this)

    this.to_js = function(){
        return $to_js(this.tree)
    }
}

var $BodyCtx = $B.parser.$BodyCtx = function(context){
    // inline body for def, class, if, elif, else, try...
    // creates a new node, child of context node
    var ctx_node = context.parent
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
    var tree_node = ctx_node.node
    var body_node = new $Node()
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

    this.toString = function(){return 'break '}

    this.to_js = function(){
        this.js_processed = true
        var scope = $get_scope(this)
        var res = ';$locals_' + scope.id.replace(/\./g, '_') +
            '["$no_break' + this.loop_ctx.loop_num + '"] = false'

        if(this.loop_ctx.type != 'asyncfor'){
            res += ';break'
        }else{
            res += ';throw StopIteration.$factory(' +
                this.loop_ctx.loop_num + ')'
        }
        return res
    }
}

var $CallArgCtx = $B.parser.$CallArgCtx = function(context){
    // Base class for arguments in a function call
    this.type = 'call_arg'
    this.parent = context
    this.start = $pos
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'

    this.toString = function(){return 'call_arg ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
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

    this.toString = function(){
        return '(call) ' + this.func + '(' + this.tree + ')'
    }

    if(this.func && this.func.type == "attribute" && this.func.name == "wait"
        && this.func.value.type == "id" && this.func.value.value == "time"){
        console.log('call', this.func)
        $get_node(this).blocking = {'type': 'wait', 'call': this}
    }

    if(this.func && this.func.value == 'input'){
        $get_node(this).blocking = {'type': 'input'}
    }

    this.to_js = function(){
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
                    return 'classmethod.$factory(' + $to_js(this.tree) + ')'
                case '$$super':
                    if(this.tree.length == 0){
                       // super() called with no argument : if inside a class,
                       // add the class parent as first argument
                       var scope = $get_scope(this)
                       if(scope.ntype == 'def' || scope.ntype == 'generator'){
                          var def_scope = $get_scope(scope.context.tree[0])
                          if(def_scope.ntype == 'class'){
                             new $IdCtx(this, def_scope.context.tree[0].name)
                          }
                       }
                    }
                    if(this.tree.length == 1){
                       // second argument omitted : add the instance
                       var scope = $get_scope(this)
                       if(scope.ntype == 'def' || scope.ntype == 'generator'){
                          var args = scope.context.tree[0].args
                          if(args.length > 0){
                             var missing_id = new $IdCtx(this, args[0])
                             missing_id.to_js = function(){
                                 return "[$locals['" + args[0] + "']]"
                             }
                          }
                       }
                    }
                    break
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

            this.tree.forEach(function(arg){
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
                            case 'star_arg':
                                star_args = true
                                positional.push([arg.tree[0].tree[0].to_js(),
                                    '*'])
                                break
                            case 'double_star_arg':
                                dstar_args.push(arg.tree[0].tree[0].to_js())
                                break
                            default:
                                positional.push([arg.to_js(), 's'])
                                break
                        }
                        break
                }
            })

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
                kw_args_str = '{$nat:"kw",kw:$B.extend("' + this.func.value +
                    '",' + kw_args_str + ',' + dstar_args.join(', ') + ')}'
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

            if(this.tree.length > -1){
                if(this.func.type == 'id'){
                    if(this.func.is_builtin){
                        // simplify code for built-in functions
                        var classes = ["complex", "bytes", "bytearray",
                            "object", "memoryview", "int", "float", "str",
                            "list", "tuple", "dict", "set", "frozenset",
                            "range", "slice", "zip", "bool", "type",
                            "classmethod", "staticmethod", "enumerate",
                            "reversed", "property", "$$super", "zip", "map",
                            "filter"]
                        if($B.builtin_funcs[this.func.value] !== undefined){
                            if(classes.indexOf(this.func.value) == -1){
                                return func_js + args_str
                            }else{
                                return func_js + ".$factory" + args_str
                            }
                        }
                    }
                    var res = default_res
                }else{
                    var res = default_res
                }
                return res
            }

            return default_res
        }
    }
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
    this.toString = function(){
        return '(class) ' + this.name + ' ' + this.tree + ' args ' + this.args
    }

    this.set_name = function(name){
        this.random = $B.UUID()
        this.name = name
        this.id = context.node.module + '_' + name + '_' + this.random
        this.binding = {}
        this.parent.node.id = this.id

        var parent_block = scope
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
        $bind(name, this.scope, this)
        //this.scope.binding[name] = this

        // if function is defined inside another function, add the name
        // to local names
        if(scope.is_function){
            if(scope.context.tree[0].locals.indexOf(name) == -1){
                scope.context.tree[0].locals.push(name)
            }
        }
    }

    this.transform = function(node, rank){

        // doc string
        this.doc_string = $get_docstring(node)

        var instance_decl = new $Node(),
            local_ns = '$locals_' + this.id.replace(/\./g, '_'),
            js = ';var ' + local_ns + ' = {$type: "class", __annotations__: _b_.dict.$factory()}, $locals = ' +
                local_ns + ', $local_name = "' + local_ns + '";'
        new $NodeJSCtx(instance_decl, js)
        node.insert(0, instance_decl)

        // Get id of global scope
        var global_scope = this.scope
        while(global_scope.parent_block.id !== '__builtins__'){
            global_scope = global_scope.parent_block
        }
        var global_ns = '$locals_' + global_scope.id.replace(/\./g, '_')

        var js = ';var $top_frame = [$local_name, $locals,' + '"' +
            global_scope.id + '", ' + global_ns +
            ']; $B.frames_stack.push($top_frame);'

        node.insert(1, $NodeJS(js))

        // exit frame
        node.add($NodeJS('$B.leave_frame()'))
        // return local namespace at the end of class definition
        var ret_obj = new $Node()
        new $NodeJSCtx(ret_obj, 'return ' + local_ns + ';')
        node.insert(node.children.length, ret_obj)

        // close function and run it
        var run_func = new $Node()
        new $NodeJSCtx(run_func, ')();')
        node.parent.insert(rank + 1, run_func)

        var module_name = '$locals_' +
            $get_module(this).module.replace(/\./g, '_') + '.__name__'

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

            arg_tree.forEach(function(_tmp){
                if(_tmp.tree[0].type == 'kwarg'){kw.push(_tmp.tree[0])}
                else{args.push(_tmp.to_js())}
            })
            js[pos++] = ',tuple.$factory([' + args.join(',') + ']),['
            // add the names - needed to raise exception if a value is undefined
            var _re = new RegExp('"', 'g'),
                _r = [],
                rpos = 0
            args.forEach(function(arg){
                _r[rpos++] = '"' + arg.replace(_re, '\\"') + '"'
            })
            js[pos++] = _r.join(',') + ']'

            _r = []
            rpos = 0
            kw.forEach(function(_tmp){
                _r[rpos++] = '["' + _tmp.tree[0].value + '",' +
                  _tmp.tree[1].to_js() + ']'
            })
            js[pos++] = ',[' + _r.join(',') + ']'

        }else{ // form "class foo:"
            js[pos++] = ',tuple.$factory([]),[],[]'
        }
        js[pos++] = ')'
        var cl_cons = new $Node()
        new $NodeJSCtx(cl_cons, js.join(''))
        rank++
        node.parent.insert(rank + 1, cl_cons)

        // add doc string
        rank++
        var ds_node = new $Node()
        js = name_ref + '.__doc__ = ' + (this.doc_string || 'None') + ';'
        new $NodeJSCtx(ds_node, js)
        node.parent.insert(rank + 1, ds_node)

        // if class is defined at module level, add to module namespace
        if(scope.ntype == 'module'){
            var w_decl = new $Node()
            new $NodeJSCtx(w_decl, '$locals["' + this.name + '"] = ' +
                this.name)
        }
        // end by None for interactive interpreter
        node.parent.insert(rank + 2, $NodeJS("None;"))

        this.transformed = true

    }
    this.to_js = function(){
        this.js_processed = true
        return 'var $' + this.name + '_' + this.random + ' = (function()'
    }
}

var $CompIfCtx = $B.parser.$CompIfCtx = function(context){
    // Class for keyword "if" inside a comprehension
    this.type = 'comp_if'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(comp if) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}

var $ComprehensionCtx = $B.parser.$ComprehensionCtx = function(context){
    // Class for comprehensions
    this.type = 'comprehension'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(comprehension) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        var intervals = []
        this.tree.forEach(function(elt){
            intervals.push(elt.start)
        })
        return intervals
    }
}

var $CompForCtx = $B.parser.$CompForCtx = function(context){
    // Class for keyword "for" in a comprehension
    this.type = 'comp_for'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    this.expect = 'in'
    context.tree[context.tree.length] = this

    this.toString = function(){return '(comp for) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}

var $CompIterableCtx = $B.parser.$CompIterableCtx = function(context){
    // Class for keyword "in" in a comprehension
    this.type = 'comp_iterable'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(comp iter) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}

var $ConditionCtx = $B.parser.$ConditionCtx = function(context,token){
    // Class for keywords "if", "elif", "while"
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    if(token == 'while'){this.loop_num = $loop_num++}
    context.tree[context.tree.length] = this

    this.toString = function(){return this.token + ' ' + this.tree}

    this.transform = function(node, rank){
        var scope = $get_scope(this)
        if(this.token == "while"){
            if(scope.ntype == "generator"){
                this.parent.node.loop_start = this.loop_num
            }
            node.parent.insert(rank,
                $NodeJS('$locals["$no_break' + this.loop_num + '"] = true'))
            // because a node was inserted, return 2 to avoid infinite loop
            return 2
        }
    }
    this.to_js = function(){
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
            res.push('$locals["$no_break' + this.loop_num + '"] && ')
        }else if(tok == 'else if'){
            var line_info = $get_node(this).line_num + ',' +
                $get_scope(this).id
            res.push('($locals.$line_info = "' + line_info + '") && ')
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
}

var $ContinueCtx = $B.parser.$ContinueCtx = function(context){
    // Class for keyword "continue"
    this.type = 'continue'
    this.parent = context
    $get_node(this).is_continue = true
    context.tree[context.tree.length] = this

    // set information related to the associated loop
    set_loop_context.apply(this, [context, 'continue'])

    this.toString = function(){return '(continue)'}

    this.to_js = function(){
        this.js_processed = true
        return 'continue'
    }
}

var $DebuggerCtx = $B.parser.$DebuggerCtx = function(context){
    // Class for debugger
    this.type = 'continue'
    this.parent = context
    context.tree[context.tree.length] = this

    this.toString = function(){return '(debugger)'}

    this.to_js = function(){
        this.js_processed = true
        return 'debugger'
    }
}

var $DecoratorCtx = $B.parser.$DecoratorCtx = function(context){
    // Class for decorators
    this.type = 'decorator'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []

    this.toString = function(){return '(decorator) ' + this.tree}

    this.transform = function(node, rank){
        var func_rank = rank + 1,
            children = node.parent.children,
            decorators = [this.tree]
        while(1){
            if(func_rank >= children.length){
                $_SyntaxError(context, ['decorator expects function'])
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
        decorators.forEach(function(){
            this.dec_ids.push('$id' + $B.UUID())
        }, this)

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
        if($B._globals[scope.id] && $B._globals[scope.id][obj.name]){
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
        //scope.binding[obj.name] = true

        node.parent.insert(func_rank + 1, $NodeJS(res))
        this.decorators = decorators
    }

    this.to_js = function(){
        this.js_processed = true
        var res = []
        this.decorators.forEach(function(decorator, i){
            res.push('var ' + this.dec_ids[i] + ' = ' +
                $to_js(decorator) + ';')
        }, this)
        return res.join('')
    }
}

var $DecoratorExprCtx = $B.parser.$DecoratorExprCtx = function(context){
    // Class for decorator expression. This can't be an arbitrary expression :
    // it must be a dotted name, possibly called with arbitrary arguments
    this.type = 'decorator_expression'
    this.parent = context
    context.tree[context.tree.length] = this
    this.names = []
    this.tree = []
    this.is_call = false

    this.toString = function(){return '(decorator expression)'}

    this.to_js = function(){
        this.js_processed = true

        var func = new $IdCtx(this, this.names[0])
        var obj = func.to_js()
        this.names.slice(1).forEach(function(name){
            obj = "_b_.getattr(" + obj + ", '" + name + "')"
        })

        if(this.tree.length > 1){
            // decorator is a call
            this.tree[0].func = {to_js: function(){return obj}}
            return this.tree[0].to_js()
        }


        return obj //res.join(".")
    }
}

var $DefCtx = $B.parser.$DefCtx = function(context){
    this.type = 'def'
    this.name = null
    this.parent = context
    this.tree = []
    this.async = context.async

    this.locals = []
    this.yields = [] // list of nodes with "yield"
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
          'def' != parent_block.context.tree[0].type &&
          'generator' != parent_block.context.tree[0].type){
        parent_block = parent_block.parent
    }

    this.parent.node.parent_block = parent_block

    // this.inside_function : set if the function is defined inside another
    // function
    var pb = parent_block
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

    this.set_name = function(name){
        try{
            name = $mangle(name, this.parent.tree[0])
        }catch(err){
            console.log(err)
            console.log('parent', this.parent)
            throw err
        }
        var id_ctx = new $IdCtx(this, name)
        this.name = name
        this.id = this.scope.id + '_' + name
        this.id = this.id.replace(/\./g, '_') // for modules inside packages
        this.id += '_' + $B.UUID()
        this.parent.node.id = this.id
        this.parent.node.module = this.module

        this.binding = {}

        if($B._globals[this.scope.id] !== undefined &&
                $B._globals[this.scope.id][name] !== undefined){
            // function name was declared global
            $bind(name, this.root, this)
        }else{
            $bind(name, this.scope, this)
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

    this.toString = function(){
        return 'def ' + this.name + '(' + this.tree + ')'
    }

    this.transform = function(node, rank){
        // already transformed ?
        if(this.transformed !== undefined){return}

        var scope = this.scope

        // search doc string
        this.doc_string = $get_docstring(node)
        this.rank = rank // save rank if we must add generator declaration

        // block indentation
        var indent = node.indent + 16

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
            defs1 = []
        this.argcount = 0
        this.kwonlyargcount = 0 // number of args after a star arg
        this.kwonlyargsdefaults = []
        this.otherdefaults = []
        this.varnames = {}
        this.args = []
        this.__defaults__ = []
        this.slots = []
        var slot_list = []
        var annotations = []
        if(this.annotation){
            annotations.push('"return":' + this.annotation.to_js())
        }

        var func_args = this.tree[1].tree
        func_args.forEach(function(arg){
            this.args.push(arg.name)
            this.varnames[arg.name] = true
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
                this.slots.push(arg.name + ':null')
                slot_list.push('"' + arg.name + '"')
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
                annotations.push(arg.name + ': ' + arg.annotation.to_js())
            }
        }, this)

        // Flags
        var flags = 67
        if(this.star_arg){flags |= 4}
        if(this.kw_arg){flags |= 8}
        if(this.type == 'generator'){flags |= 32}
        if(this.async){flags |= 128}

        // String to pass positional arguments
        var positional_str = [],
            positional_obj = [], pos = 0
        this.positional_list.forEach(function(elt){
            positional_str.push('"' + elt + '"')
            positional_obj.push(elt + ':null')
        }, this)
        positional_str = positional_str.join(',')
        positional_obj = '{' + positional_obj.join(',') + '}'

        // String to pass arguments with default values
        var dobj = []
        this.default_list.forEach(function(_default){
            dobj.push(_default + ':null')
        })
        dobj = '{' + dobj.join(',') + '}'

        var nodes = [], js

        // Get id of global scope
        var global_scope = scope
        while(global_scope.parent_block &&
                global_scope.parent_block.id !== '__builtins__'){
            global_scope = global_scope.parent_block
        }
        var global_ns = '$locals_' + global_scope.id.replace(/\./g, '_')

        var prefix = this.tree[0].to_js()
        if(this.decorated){prefix = this.alias}
        var name = this.name + this.num

        // Add lines of code to node children

        // Declare object holding local variables
        var local_ns = '$locals_' + this.id
        js = 'var ' + local_ns + ' = {}, ' + '$local_name = "' + this.id +
            '",$locals = ' + local_ns + ';'

        var new_node = new $Node()
        new_node.locals_def = true
        new_node.func_node = node
        new $NodeJSCtx(new_node, js)
        nodes.push(new_node)

        // Push id in frames stack
        var enter_frame_nodes = [
            $NodeJS('var $top_frame = [$local_name, $locals,' +
                '"' + global_scope.id + '", ' + global_ns + ', ' + name + ']'),
            $NodeJS('$B.frames_stack.push($top_frame)'),
            $NodeJS('var $stack_length = $B.frames_stack.length')
        ]
        if($B.profile > 1){
            if(this.scope.ntype == 'class'){
                fname = this.scope.context.tree[0].name + '.' + this.name
            }
            else{fname = this.name}
            if(pnode && pnode.id){
                fmod = pnode.id.slice(0, pnode.id.indexOf('_'))
            }else{
                fmod = ''
            }
            js = ";var _parent_line_info = {}; " +
                "if($B.frames_stack[$B.frames_stack.length - 1]){" +
                 " _parent_line_info = $B.frames_stack[" +
                 "$B.frames_stack.length-1][1].$line_info}else{" +
                 "_parent_line_info = " + global_ns + ".$line_info};" +
                 ";$B.$profile.call('" + fmod + "','" + fname + "'," +
                 node.line_num + ",_parent_line_info);"
            enter_frame_nodes.splice(0, 0, $NodeJS(js))
        }
        enter_frame_nodes.forEach(function(node){
            node.enter_frame = true
        })

        nodes = nodes.concat(enter_frame_nodes)
        this.env = []

        // Code in the worst case, uses $B.args in py_utils.js

        var make_args_nodes = []

        // If function is not a generator, $locals is the result of $B.args
        var js = this.type == 'def' ? local_ns + ' = $locals' : 'var $ns'

        js += ' = $B.args("' + this.name + '", ' +
            this.argcount + ', {' + this.slots.join(', ') + '}, ' +
            '[' + slot_list.join(', ') + '], arguments, '

        // Management of default values is complex... It uses a JS object
        // called $default, evaluated only once, with the appropriate keys
        // and values.
        //
        // A function like
        // def f(x=1):
        //     ...
        //
        // is implemented as
        //
        // $locals["f"] = (function($defaults){
        //     function f1(){
        //        ... function body, uses $default to parse arguments ...
        //     }
        //     f1.$infos = {
        //         ... function attributes ...
        //     }
        //     return f1
        // })({x: 1})  <-- default object is evaluated here
        //
        // $defaults could be set as an attribute of f1, and be referenced
        // inside the function body, but this slows down execution a lot

        if(defs1.length){js += '$defaults, '}
        else{js += '{}, '}
        js += this.other_args + ', ' + this.other_kw + ');'

        var new_node = new $Node()
        new $NodeJSCtx(new_node, js)
        make_args_nodes.push(new_node)

        if(this.type == 'generator'){
            // For generators, update $locals with the result of $B.args
            js ='for(var $var in $ns){$locals[$var] = $ns[$var]};'
            make_args_nodes.push($NodeJS(js))
        }

        var only_positional = false
        if(this.other_args === null && this.other_kw === null &&
                this.after_star.length == 0 && defaults.length == 0){
            // If function only takes positional arguments, we can generate
            // a faster version of argument parsing than by calling function
            // $B.args
            only_positional = true

            if($B.debug > 0 || this.positional_list.length > 0){

                // Test if all the arguments passed to the function
                // are positional, not keyword arguments
                // In calls, keyword arguments are passed as the last
                // argument, an object with attribute $nat set to "kw"

                nodes.push($NodeJS('var $len = arguments.length;'))

                var new_node = new $Node()
                var js = 'if($len > 0 && arguments[$len - 1].$nat !== undefined)'
                new $NodeJSCtx(new_node,js)
                nodes.push(new_node)

                // If at least one argument is not "simple", fall back to
                // $B.args()
                new_node.add(make_args_nodes[0])
                if(make_args_nodes.length > 1){new_node.add(make_args_nodes[1])}

                var else_node = new $Node()
                new $NodeJSCtx(else_node, 'else')
                nodes.push(else_node)

            }

            var pos_len = this.positional_list.length

            if($B.debug > 0){
                // If all arguments are "simple" all there is to check is that
                // we got the right number of arguments
                js = 'if($len !=' + pos_len + '){$B.wrong_nb_args("' +
                    this.name + '", $len, ' + pos_len
                if(positional_str.length > 0){
                    js += ', [' + positional_str + ']'
                }
                js += ')}'

                else_node.add($NodeJS(js))
            }

            if(this.positional_list.length > 0){
                if(this.type == 'generator'){
                    this.positional_list.forEach(function(arg){
                        else_node.add($NodeJS('$locals["' + arg + '"] = ' +
                            arg))
                    })
                }else{
                    var pargs = []
                    this.positional_list.forEach(function(arg){
                        pargs.push(arg + ':' + arg)
                    })
                    if($B.debug < 1){
                        js = 'if($len !=' + pos_len + '){$B.wrong_nb_args("' +
                            this.name + '", $len, ' + pos_len
                        if(positional_str.length > 0){
                            js += ', [' + positional_str + ']'
                        }
                        js += ')}'
                        else_node.add($NodeJS(js))
                    }
                    else_node.add($NodeJS(local_ns +
                        ' = $locals = {' + pargs.join(', ') + '}'))
                }
            }

        }else{
            nodes.push(make_args_nodes[0])
            if(make_args_nodes.length > 1){nodes.push(make_args_nodes[1])}
        }

        nodes.push(
          $NodeJS('$top_frame[1] = $locals;'))

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
            this.params = Object.keys(this.varnames).join(', ')
        }
        new $NodeJSCtx(def_func_node, '')
        def_func_node.is_def_func = true
        def_func_node.module = this.module

        // If the last instruction in the function is not a return,
        // add an explicit line "return None".
        var last_instr = node.children[node.children.length - 1].context.tree[0]
        if(last_instr.type != 'return' && this.type != 'generator'){
            // as always, leave frame before returning
            var js = '$B.leave_frame'
            if(this.id.substr(0,5) == '$exec'){
                js += '_exec'
            }
            node.add($NodeJS(js + '();return None'))
        }

        // Add the new function definition
        node.add(def_func_node)

        var offset = 1,
            indent = node.indent

        // Set attribute $is_func
        node.parent.insert(rank + offset++, $NodeJS(name + '.$is_func = true'))

        // Create attribute $infos for the function
        // Adding only one attribute is much faster than adding all the
        // keys/values in $infos
        node.parent.insert(rank + offset++, $NodeJS(name + '.$infos = {'))

        // Add attribute __name__
        var __name__ = this.name
        if(this.name.substr(0, 2) == "$$"){__name__ = __name__.substr(2)}
        if(__name__.substr(0, 15) == 'lambda_' + $B.lambda_magic){
            __name__ = "<lambda>"
        }
        js = '    __name__:"' + __name__ + '",'
        node.parent.insert(rank + offset++, $NodeJS(js))

        // Add attribute __qualname__
        var __qualname__ = __name__
        if(this.class_name){__qualname__ = this.class_name + '.' + __name__}
        js = '    __qualname__:"' + __qualname__ + '",'
        node.parent.insert(rank + offset++, $NodeJS(js))

        if(this.type != "generator"){
            // Add attribute __defaults__
            if(this.otherdefaults.length > 0){
                var def_names = []
                this.otherdefaults.forEach(function(_default){
                    def_names.push('$defaults.' + _default)
                })
                node.parent.insert(rank + offset++, $NodeJS('    __defaults__ : ' +
                    '_b_.tuple.$factory([' + def_names.join(', ') + ']),'))
            }else{
                node.parent.insert(rank + offset++, $NodeJS('    __defaults__ : ' +
                    '_b_.None,'))
            }

            // Add attribute __kwdefaults__ for default values of
            // keyword-only parameters
            if(this.kwonlyargsdefaults.lengh > 0){
                var def_names = []
                this.kwonlyargsdefaults.forEach(function(_default){
                    def_names.push('$defaults.' + _default)
                })
                node.parent.insert(rank + offset++, $NodeJS('    __kwdefaults__ : ' +
                    '_b_.tuple.$factory([' + def_names.join(', ') + ']),'))
            }else{
                node.parent.insert(rank + offset++, $NodeJS('    __kwdefaults__ : ' +
                    '_b_.None,'))
            }
        }

        // Add attribute __module__
        var root = $get_module(this)
        node.parent.insert(rank + offset++,
            $NodeJS('    __module__ : "' + root.module + '",'))

        // Add attribute __doc__
        node.parent.insert(rank + offset++,
            $NodeJS('    __doc__: ' + (this.doc_string || 'None') + ','))

        // Add attribute __annotations__
        node.parent.insert(rank + offset++,
            $NodeJS('    __annotations__: {' + annotations.join(',') + '},'))

        for(var attr in this.binding){this.varnames[attr] = true}
        var co_varnames = []
        for(var attr in this.varnames){co_varnames.push('"' + attr + '"')}

        // CODE_MARKER is a placeholder which will be replaced
        // by the javascript code of the function
        var CODE_MARKER = '___%%%-CODE-%%%___' + this.name + this.num;
        var h = '\n' + ' '.repeat(indent + 8)
        js = '    __code__:{' + h + '    co_argcount:' + this.argcount
        var h1 = ',' + h + ' '.repeat(4)
        var module = $get_module(this).module
        js += h1 + 'co_filename:$locals_' + module.replace(/\./g,'_') +
            '["__file__"]' +
            h1 + 'co_firstlineno:' + node.line_num +
            h1 + 'co_flags:' + flags +
            h1 + 'co_kwonlyargcount:' + this.kwonlyargcount +
            h1 + 'co_name: "' + this.name + '"' +
            h1 + 'co_nlocals: ' + co_varnames.length +
            h1 + 'co_varnames: [' + co_varnames.join(', ') + ']' +
            h + '}\n    };'

        // End with None for interactive interpreter
        js += 'None;'

        node.parent.insert(rank + offset++, $NodeJS(js))

        // Close anonymous function with defaults as argument
        this.default_str = '{' + defs1.join(', ') + '}'
        if(this.type == "def"){
            // Add a node to mark the end of the function
            node.parent.insert(rank + offset++, new $MarkerNode('func_end:'+CODE_MARKER))
            node.parent.insert(rank + offset++,
                $NodeJS('return ' + name + '})(' + this.default_str + ')'))
            if(this.async){
                node.parent.insert(rank + offset++,
                    $NodeJS(prefix + ' = $B.make_async(' + prefix + ')'))
            }
        }

        // wrap everything in a try/catch to be sure to exit from frame
        if(this.type == 'def'){
            var parent = node
            for(var pos = 0; pos < parent.children.length &&
                parent.children[pos] !== $B.last(enter_frame_nodes); pos++){}
            var try_node = $NodeJS('try'),
                children = parent.children.slice(pos + 1)
            parent.insert(pos + 1, try_node)
            children.forEach(function(child){
                if(child.is_def_func){
                    child.children.forEach(function(grand_child){
                        try_node.add(grand_child)
                    })
                }else{
                    try_node.add(child)
                }
            })
            parent.children.splice(pos + 2, parent.children.length)

            var except_node = $NodeJS('catch(err)')
            except_node.add($NodeJS('$B.leave_frame();throw err'))

            parent.add(except_node)
        }

        this.transformed = true

        return offset
    }

    this.to_js = function(func_name){
        this.js_processed = true

        func_name = func_name || this.tree[0].to_js()
        if(this.decorated){func_name = 'var ' + this.alias}

        return func_name + ' = (function ($defaults){function '+
            this.name + this.num + '(' + this.params + ')'
    }
}

var $DelCtx = $B.parser.$DelCtx = function(context){
    // Class for keyword "del"
    this.type = 'del'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []

    this.toString = function(){return 'del ' + this.tree}

    this.to_js = function(){
        this.js_processed = true

        if(this.tree[0].type == 'list_or_tuple'){
            // Syntax "del a, b, c"
            var res = []
            this.tree[0].tree.forEach(function(elt){
                var subdel = new $DelCtx(context) // this adds an element to context.tree
                subdel.tree = [elt]
                res.push(subdel.to_js())
                context.tree.pop() // remove the element from context.tree
            })
            this.tree = []
            return res.join(';')
        }else{
            var expr = this.tree[0].tree[0]

            switch(expr.type) {
                case 'id':
                    return 'delete ' + expr.to_js() + ';'
                case 'list_or_tuple':
                    var res = []
                    expr.tree.forEach(function(elt){
                      res.push('delete ' + elt.to_js())
                    })
                    return res.join(';')
                case 'sub':
                    // Delete an item in a list : "del a[x]"
                    expr.func = 'delitem'
                    js = expr.to_js()
                    expr.func = 'getitem'
                    return js
                case 'op':
                      $_SyntaxError(this, ["can't delete operator"])
                case 'call':
                    $_SyntaxError(this, ["can't delete function call"])
                case 'attribute':
                    return 'delattr(' + expr.value.to_js() + ',"' +
                        expr.name + '")'
                default:
                    $_SyntaxError(this, ["can't delete " + expr.type])
            }
        }
    }
}

var $DictOrSetCtx = $B.parser.$DictOrSetCtx = function(context){
    // Context for literal dictionaries or sets
    // Rhe real type (dist or set) is set inside $transition
    // as the attribute 'real'
    this.type = 'dict_or_set'
    this.real = 'dict_or_set'
    this.expect = 'id'
    this.closed = false
    this.start = $pos

    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){
        switch(this.real) {
            case 'dict':
                return '(dict) {' + this.items + '}'
            case 'set':
                return '(set) {' + this.tree + '}'
        }
        return '(dict_or_set) {' + this.tree + '}'
    }

    this.nb_dict_items = function(){
        var nb = 0
        this.tree.forEach(function(item){
            if(item.packed){nb += 2}
            else{nb++}
        })
        return nb
    }

    this.packed_indices = function(){
        var ixs = []
        this.items.forEach(function(t, i){
            if(t.type == "expr" && t.packed){
                ixs.push(i)
            }
        })
        return ixs
    }

    this.unpack_dict = function(packed){
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

    this.unpack_set = function(packed){
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


    this.to_js = function(){
        this.js_processed = true

        switch(this.real){
            case 'dict':
                var packed = this.packed_indices()
                if(packed.length > 0){
                    return 'dict.$factory(' + this.unpack_dict(packed) +
                        ')' + $to_js(this.tree)
                }
                var res = []
                for(var i = 0; i < this.items.length; i += 2){
                    res.push('[' + this.items[i].to_js() + ',' +
                      this.items[i + 1].to_js() + ']')
                }
                return 'dict.$factory([' + res.join(',') + '])' +
                    $to_js(this.tree)
            case 'set_comp':
                return 'set.$factory(' + $to_js(this.items) + ')' +
                    $to_js(this.tree)
            case 'dict_comp':
                return 'dict.$factory(' + $to_js(this.items) + ')' +
                    $to_js(this.tree)
        }
        var packed = this.packed_indices()
        if(packed.length > 0){
            return 'set.$factory(' + this.unpack_set(packed) + ')'
        }
        return 'set.$factory([' + $to_js(this.items) + '])' + $to_js(this.tree)
    }
}

var $DoubleStarArgCtx = $B.parser.$DoubleStarArgCtx = function(context){
    // Class for syntax "**kw" in a call
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '**' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return '{$nat:"pdict",arg:' + $to_js(this.tree) + '}'
    }
}

var $EllipsisCtx = $B.parser.$EllipsisCtx = function(context){
    // Class for "..."
    this.type = 'ellipsis'
    this.parent = context
    this.nbdots = 1
    context.tree[context.tree.length] = this

    this.toString = function(){return 'ellipsis'}

    this.to_js = function(){
        this.js_processed = true
        return '$B.builtins["Ellipsis"]'
    }
}

var $ExceptCtx = $B.parser.$ExceptCtx = function(context){
    // Class for keyword "except"
    this.type = 'except'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'id'
    this.scope = $get_scope(this)

    this.toString = function(){return '(except) '}

    this.set_alias = function(alias){
        this.tree[0].alias = $mangle(alias, this)
        $bind(alias, this.scope, this)
    }

    this.to_js = function(){
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
        this.tree.forEach(function(elt){
            res.push(elt.to_js())
        })
        var lnum = ''
        if($B.debug > 0){
            var module = $get_module(this)
            lnum = '($locals.$line_info = "' + $get_node(this).line_num +
                ',' + module.id + '") && '
        }
        return 'else if(' + lnum + '$B.is_exc(' + this.error_name +
            ',[' + res.join(',') + ']))'
    }
}

var $ExprCtx = $B.parser.$ExprCtx = function(context, name, with_commas){
    // Base class for expressions
    this.type = 'expr'
    this.name = name
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.expect = ',' // can be 'expr' or ','
    this.parent = context
    this.packed = context.packed
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){
        return '(expr ' + with_commas + ') ' + this.tree
    }

    this.to_js = function(arg){
        this.js_processed = true
        if(this.type == 'list'){return '[' + $to_js(this.tree) + ']'}
        if(this.tree.length == 1){return this.tree[0].to_js(arg)}
        return 'tuple.$factory([' + $to_js(this.tree) + '])'
    }
}

var $ExprNot = $B.parser.$ExprNot = function(context){
    // Class used temporarily for 'x not', only accepts 'in' as next token
    // Never remains in the final tree, so there is no need to define to_js()
    this.type = 'expr_not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(expr_not)'}

}

var $FloatCtx = $B.parser.$FloatCtx = function(context,value){
    // Class for literal floats
    this.type = 'float'
    this.value = value
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return 'float ' + this.value}

    this.to_js = function(){
        this.js_processed = true
        // number literal
        if(/^\d+$/.exec(this.value) ||
            /^\d+\.\d*$/.exec(this.value)){
                return '(new Number(' + this.value + '))'
        }

        return 'float.$factory(' + this.value + ')'
    }
}

var $ForExpr = $B.parser.$ForExpr = function(context){
    // Class for keyword "for" outside of comprehensions
    this.type = 'for'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.loop_num = $loop_num
    this.module = $get_scope(this).module
    $loop_num++

    this.toString = function(){return '(for) ' + this.tree}

    this.transform = function(node,rank){
        var scope = $get_scope(this),
            target = this.tree[0],
            target_is_1_tuple = target.tree.length == 1 && target.expect == 'id',
            iterable = this.tree[1],
            num = this.loop_num,
            local_ns = '$locals_' + scope.id.replace(/\./g, '_'),
            h = '\n' + ' '.repeat(node.indent + 4)

        // Because loops like "for x in range(...)" are very common and can be
        // optimised, check if the target is a call to the builtin function
        // "range"
        var $range = false
        if(target.tree.length == 1 &&
            target.expct != 'id' &&
            iterable.type == 'expr' &&
            iterable.tree[0].type == 'expr' &&
            iterable.tree[0].tree[0].type == 'call'){
            var call = iterable.tree[0].tree[0]
            if(call.func.type == 'id'){
                var func_name = call.func.value
                if(func_name == 'range' && call.tree.length < 3){
                    $range = call
                }
            }
        }

        // nodes that will be inserted at the position of the original "for" loop
        var new_nodes = [], pos = 0

        // save original children (loop body)
        var children = node.children

        var offset = 1

        if($range && scope.ntype != 'generator'){
            if(this.has_break){
                // If there is a "break" in the loop, add a boolean
                // used if there is an "else" clause and in generators
                new_node = new $Node()
                new $NodeJSCtx(new_node,
                    local_ns + '["$no_break' + num + '"] = true')
                new_nodes[pos++] = new_node
            }

            // Check that range is the built-in function
            var range_is_builtin = false
            if(!scope.blurred){
                var _scope = $get_scope(this),
                    found = []
                while(1){
                    if(_scope.binding["range"]){found.push(_scope.id)}
                    if(_scope.parent_block){_scope = _scope.parent_block}
                    else{break}
                }
                range_is_builtin = found.length == 1 &&
                    found[0] == "__builtins__"
            }

            // Line to test if the callable "range" is the built-in "range"
            var test_range_node = new $Node()
            if(range_is_builtin){
                new $NodeJSCtx(test_range_node, 'if(1)')
            }else{
                new $NodeJSCtx(test_range_node,
                    'if(' + call.func.to_js() + ' === $B.builtins.range)')
            }
            new_nodes[pos++] = test_range_node

            // Build the block with the Javascript "for" loop
            var idt = target.to_js()
            if($range.tree.length == 1){
                var start = 0,
                    stop = $range.tree[0].to_js()
            }else{
                var start = $range.tree[0].to_js(),
                    stop = $range.tree[1].to_js()
            }

            var js = 'var $stop_' + num + ' = $B.int_or_bool(' + stop + ');' +
                h + idt + ' = ' + start + ';' +
                h + '    var $next' + num + ' = ' + idt + ',' +
                h + '    $safe' + num + ' = typeof $next' + num +
                ' == "number" && typeof ' + '$stop_' + num + ' == "number";' +
                h + 'while(true)'
            var for_node = new $Node()
            new $NodeJSCtx(for_node, js)

            for_node.add($NodeJS('if($safe' + num + ' && $next' + num +
                '>= $stop_' + num + '){break}'))
            for_node.add($NodeJS('else if(!$safe' + num + ' && $B.ge($next' +
                num + ', $stop_' + num + ')){break}'))
            for_node.add($NodeJS(idt + ' = $next' + num))
            for_node.add($NodeJS('if($safe' + num + '){$next' + num +
                ' += 1}'))
            for_node.add($NodeJS('else{$next' + num + ' = $B.add($next' +
                num + ',1)}'))
            // Add the loop body
            children.forEach(function(child){
                for_node.add(child)
            })
            // Add a line to reset the line number
            for_node.add($NodeJS('$locals.$line_info = "' + node.line_num +
                ',' + scope.id + '"; None;'))

            // Check if current "for" loop is inside another "for" loop
            var in_loop = false
            if(scope.ntype == 'module'){
                var pnode = node.parent
                while(pnode){
                    if(pnode.for_wrapper){in_loop = true; break}
                    pnode = pnode.parent
                }
            }

            // If we are at module level, and if the "for" loop is not already
            // in a wrapper function, wrap it in a function to increase
            // performance
            if(scope.ntype == 'module' && !in_loop){
                var func_node = new $Node()
                func_node.for_wrapper = true
                js = 'function $f' + num + '('
                if(this.has_break){js += '$no_break' + num}
                js += ')'
                new $NodeJSCtx(func_node, js)

                // the function is added to the test_range_node
                test_range_node.add(func_node)

                // Add the "for" loop
                func_node.add(for_node)

                // Return break flag
                if(this.has_break){
                    func_node.add($NodeJS('return $no_break' + num))
                }

                // Line to call the function
                test_range_node.add($NodeJS('var $res' + num + ' = $f' + num +
                    '();'))

                if(this.has_break){
                    test_range_node.add($NodeJS('var $no_break' + num +
                        ' = $res' + num))
                }

            }else{

                // If the loop is already inside a function, don't
                // wrap it
                test_range_node.add(for_node)
            }
            if(range_is_builtin){
                node.parent.children.splice(rank, 1)
                var k = 0
                if(this.has_break){
                    node.parent.insert(rank, new_nodes[0])
                    k++
                }
                new_nodes[k].children.forEach(function(child){
                    node.parent.insert(rank + k, child)
                })
                node.parent.children[rank].line_num = node.line_num
                node.parent.children[rank].bindings = node.bindings
                node.children = []
                return 0
            }

            // Add code in case the callable "range" is *not* the
            // built-in function
            var else_node = $NodeJS("else")
            new_nodes[pos++] = else_node

            // Add lines at module level, after the original "for" loop
            for(var i = new_nodes.length - 1; i >= 0; i--){
                node.parent.insert(rank + 1, new_nodes[i])
            }

            this.test_range = true
            new_nodes = [], pos = 0
        }

        // Line to declare the function that produces the next item from
        // the iterable
        var new_node = new $Node()
        new_node.line_num = $get_node(this).line_num
        var it_js = iterable.to_js(),
            iterable_name = '$iter'+num,
            js = 'var ' + iterable_name + ' = ' + it_js + ';' +
                 '$locals["$next' + num + '"]' + ' = $B.$getattr($B.$iter(' +
                 iterable_name + '),"__next__")'
        new $NodeJSCtx(new_node,js)
        new_nodes[pos++] = new_node

        // Line to store the length of the iterator
        var js = 'if(isinstance(' + iterable_name + ', dict)){$locals.$len_func' +
            num + ' = $B.$getattr(' + iterable_name + ', "__len__"); $locals.$len' +
            num + ' = $locals.$len_func' + num + '()}else{$locals.$len' +
            num + ' = null}'
        new_nodes[pos++] = $NodeJS(js)

        if(this.has_break){
            // If there is a "break" in the loop, add a boolean
            // used if there is an "else" clause and in generators
            new_nodes[pos++] = $NodeJS(local_ns + '["$no_break' + num +
                '"] = true;')
        }

        var while_node = new $Node()

        if(this.has_break){
            js = 'while(' + local_ns + '["$no_break' + num + '"])'
        }else{js = 'while(1)'}

        new $NodeJSCtx(while_node,js)
        while_node.context.loop_num = num // used for "else" clauses
        while_node.context.type = 'for' // used in $add_line_num
        while_node.line_num = node.line_num
        if(scope.ntype == 'generator'){
            // used in generators to signal a loop start
            while_node.loop_start = num
        }

        new_nodes[pos++] = while_node

        node.parent.children.splice(rank, 1)
        if(this.test_range){
            for(var i = new_nodes.length - 1; i >= 0; i--){
                else_node.insert(0, new_nodes[i])
            }
        }else{
            for(var i = new_nodes.length - 1; i >= 0; i--){
                node.parent.insert(rank, new_nodes[i])
                offset += new_nodes.length
            }
        }

        // Add test of length change
        while_node.add($NodeJS('if($locals.$len' + num +
            '!==null && $locals.$len' + num + '!=$locals.$len_func' +
            num + '()){throw RuntimeError.$factory("dictionary' +
            ' changed size during iteration")}'))

        var try_node = $NodeJS("try")
        // Copy attribute "bindings" in try node, so that it is at the same
        // level in the code tree as the instructions that use the target
        // names
        try_node.bindings = node.bindings
        while_node.add(try_node)

        try_node.add($NodeJS("var ce = $B.current_exception"))

        var iter_node = new $Node()
        iter_node.id = this.module
        var context = new $NodeCtx(iter_node) // create ordinary node
        var target_expr = new $ExprCtx(context, 'left', true)
        if(target_is_1_tuple){
            // assign to a one-element tuple for "for x, in ..."
            var t = new $ListOrTupleCtx(target_expr)
            t.real = 'tuple'
            t.tree = target.tree
        }else{
            target_expr.tree = target.tree
        }
        var assign = new $AssignCtx(target_expr) // assignment to left operand
        assign.tree[1] = new $JSCode('$locals["$next' + num + '"]()')
        try_node.add(iter_node)

        while_node.add(
            $NodeJS('catch($err){if($B.is_exc($err, [StopIteration]))' +
                 '{$B.current_exception = ce;break;}else{throw($err)}}'))

        // set new loop children
        children.forEach(function(child){
            while_node.add(child)
        })

        node.children = []
        return 0
    }

    this.to_js = function(){
        this.js_processed = true
        var iterable = this.tree.pop()
        return 'for ' + $to_js(this.tree) + ' in ' + iterable.to_js()
    }
}

var $FromCtx = $B.parser.$FromCtx = function(context){
    // Class for keyword "from" for imports
    this.type = 'from'
    this.parent = context
    this.module = ''
    this.names = []
    this.aliases = {}
    context.tree[context.tree.length] = this
    this.expect = 'module'
    this.scope = $get_scope(this)

    this.add_name = function(name){
        this.names[this.names.length] = name
        if(name == '*'){this.scope.blurred = true}
    }

    this.bind_names = function(){
        // Called at the end of the 'from' statement
        // Binds the names or aliases in current scope
        var scope = $get_scope(this)
        this.names.forEach(function(name){
            name = this.aliases[name] || name
            $bind(name, scope, this)
        }, this)
    }

    this.toString = function(){
        return '(from) ' + this.module + ' (import) ' + this.names +
            '(as)' + this.aliases
    }

    this.to_js = function(){
        this.js_processed = true
        var scope = $get_scope(this),
            module = $get_module(this),
            mod = module.module,
            res = [],
            pos = 0,
            indent = $get_node(this).indent,
            head = ' '.repeat(indent)

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
                    console.log("throw system error", this.module, $package)
                    return 'throw SystemError.$factory("Parent module \'\' ' +
                        'not loaded, cannot perform relative import")'
                }else if($package == 'None'){
                    console.log('package is None !')
                }
                _mod = _mod.substr(1)
            }else{
                break
            }
        }
        if(_mod){packages.push(_mod)}
        this.module = packages.join('.')
        /*
        console.log("from", this.module, "import", this.names, $package, packages,
            module.module)
        */

        // FIXME : Replacement still needed ?
        var mod_name = this.module.replace(/\$/g, '')
        res[pos++] = '$B.$import("'
        res[pos++] = mod_name + '",["'
        res[pos++] = this.names.join('","') + '"], {'
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
            res[pos++] = '\n' + head + 'for(var $attr in $B.imported["' +
                mod_name + '"]){if($attr.charAt(0) !== "_")' +
                '{$locals[$attr] = $B.imported["' + mod_name + '"][$attr]}};'
        }else{
            this.names.forEach(function(name){
                module.imports[this.module + '.' + name] = true
                res[pos++] = '\n' + head + '$locals["' +
                (this.aliases[name] || name) + '"] = $B.imported["' +
                mod_name + '"]["' + name + '"];'
            }, this)
        }
        res[pos++] = '\n' + head + 'None;'

        return res.join('');
    }
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

    this.toString = function(){return 'func args ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}

var $FuncArgIdCtx = $B.parser.$FuncArgIdCtx = function(context,name){
    // id in function arguments
    // may be followed by = for default value
    this.type = 'func_arg_id'
    this.name = name
    this.parent = context

    if(context.has_star_arg){
        context.parent.after_star.push(name)
    }else{
        context.parent.positional_list.push(name)
    }
    // bind name to function scope
    var node = $get_node(this)
    if(node.binding[name]){
        $_SyntaxError(context,
            ["duplicate argument '" + name + "' in function definition"])
    }
    $bind(name, node, this)

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

    this.toString = function(){
        return 'func arg id ' + this.name + '=' + this.tree
    }

    this.to_js = function(){
        this.js_processed = true
        return this.name + $to_js(this.tree)
    }
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

    this.toString = function(){
        return '(func star arg ' + this.op + ') ' + this.name
    }

    this.set_name = function(name){
        this.name = name
        if(name == '$dummy'){return}

        // bind name to function scope
        if(this.node.binding[name]){
            $_SyntaxError(context,
                ["duplicate argument '" + name + "' in function definition"])
        }
        $bind(name, this.node, this)

        // add to locals of function
        var ctx = context
        while(ctx.parent !== undefined){
            if(ctx.type == 'def'){
                ctx.locals.push(name)
                break
            }
            ctx = ctx.parent
        }
        if(op == '*'){ctx.other_args = '"' + name + '"'}
        else{ctx.other_kw = '"' + name + '"'}
    }
}

var $GlobalCtx = $B.parser.$GlobalCtx = function(context){
    // Class for keyword "global"
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'
    this.scope = $get_scope(this)
    $B._globals[this.scope.id] = $B._globals[this.scope.id] || {}

    this.toString = function(){return 'global ' + this.tree}

    this.add = function(name){
        $B._globals[this.scope.id][name] = true
    }

    this.to_js = function(){
        this.js_processed = true
        return ''
    }
}

var $IdCtx = $B.parser.$IdCtx = function(context,value){
    // Class for identifiers (variable names)

    this.type = 'id'
    this.value = $mangle(value, context)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    var scope = this.scope = $get_scope(this)
    this.blurred_scope = this.scope.blurred
    this.env = clone(this.scope.binding)

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

    if(context.type == 'target_list' ||
            (context.type == 'expr' && context.parent.type == 'target_list')){
        // An id defined as a target in a "for" loop is bound
        $bind(value, scope, this)
        this.bound = true
    }

    if(scope.ntype == 'def' || scope.ntype == 'generator'){
        // if variable is declared inside a comprehension,
        // don't add it to function namespace
        var _ctx = this.parent
        while(_ctx){
            if(_ctx.type == 'list_or_tuple' && _ctx.is_comp()){
                this.in_comp = true
                return
            }
            _ctx = _ctx.parent
        }
        if(context.type == 'expr' && context.parent.type == 'comp_if'){
            // form {x for x in foo if x>5} : don't put x in referenced names
            return
        }else if(context.type == 'global'){
            if(scope.globals === undefined){
                scope.globals = [value]
            }else if(scope.globals.indexOf(value) == -1){
                scope.globals.push(value)
            }
        }
    }

    this.toString = function(){
        return '(id) ' + this.value + ':' + (this.tree || '')
    }

    this.firstBindingScopeId = function(){
        // Returns the id of the first scope where this.name is bound
        var scope = this.scope,
            found = [],
            nb = 0
        while(scope && nb++ < 20){
            if(scope.binding && scope.binding[this.value]){
                return scope.id
            }
            scope = scope.parent
        }
    }

    this.boundBefore = function(scope){
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
        var nb = 0,
            node = $get_node(this),
            found = false

        while(!found && node.parent && nb++ < 100){
            var pnode = node.parent
            if(pnode.bindings && pnode.bindings[this.value]){
                return true
            }
            for(var i = 0; i < pnode.children.length; i++){
                var child = pnode.children[i]
                if(child === node){break}
                if(child.bindings && child.bindings[this.value]){
                    return true
                }
            }
            if(pnode === scope){
                break
            }
            node = pnode
        }

        return found
    }

    this.to_js = function(arg){
        // Store the result in this.result
        // For generator expressions, to_js() is called in $make_node
        if(this.result !== undefined && this.scope.ntype == 'generator'){
            return this.result
        }

        this.js_processed = true
        var val = this.value

        var annotation = ""
        if(this.parent.type == "expr" && this.parent.parent.type == "node" &&
                this.parent.hasOwnProperty("annotation")){
            var js = this.parent.annotation.tree[0].to_js()
            annotation = "$locals.__annotations__.$string_dict['" + value + "'] = " +
                js +"; "
            if(this.parent.parent.tree[0] == this.parent){
                return annotation
            }
        }
        var is_local = this.scope.binding[val] !== undefined,
            this_node = $get_node(this),
            bound_before = this_node.bound_before

        this.nonlocal = this.scope.nonlocals &&
            this.scope.nonlocals[val] !== undefined

        // If name is bound in the scope, but not yet bound when this
        // instance of $IdCtx was created, it is resolved by a call to
        // $search or $local_search
        this.unbound = this.unbound || (is_local && !this.bound &&
            bound_before && bound_before.indexOf(val) == -1)

        if((!this.bound) && this.scope.context
                && this.scope.ntype == 'class' &&
                this.scope.context.tree[0].name == val){
            // Name of class referenced inside the class. Cf. issue #649
            return annotation + '$B.$search("' + val + '")'
        }

        if(this.unbound && !this.nonlocal){
            if(this.scope.ntype == 'def' || this.scope.ntype == 'generator'){
                return annotation + '$B.$local_search("' + val + '")'
            }else{
                return annotation + '$B.$search("' + val + '")'
            }
        }

        // Special cases
        if(val == '__BRYTHON__' || val == '$B'){return val}

        var innermost = $get_scope(this),
            scope = innermost,
            found = []

        var search_ids = ['"' + innermost.id + '"']
        // get global scope
        var gs = innermost

        while(true){
            if(gs.parent_block){
                if(gs.parent_block == $B.builtins_scope){break}
                else if(gs.parent_block.id === undefined){break}
                gs = gs.parent_block
            }
            search_ids.push('"' + gs.id + '"')
        }
        search_ids = "[" + search_ids.join(", ") + "]"

        if(this.nonlocal || this.bound){
            var bscope = this.firstBindingScopeId()
            // Might be undefined, for augmented assignments
            if(bscope !== undefined){
                return annotation + "$locals_" + bscope.replace(/\./g, "_") + '["' +
                    val + '"]'
            }
        }

        var global_ns = '$locals_' + gs.id.replace(/\./g, '_')

        // Build the list of scopes where the variable name is bound
        while(1){
            if($B._globals[scope.id] !== undefined &&
                $B._globals[scope.id][val] !== undefined){
                // Variable is declared as global. If the name is bound in the
                // global scope, use it ; if the name is being bound, bind it
                // in the global namespace.
                // Else return a call to a function that searches the name in
                // globals, and throws NameError if not found.
                if(gs.binding[val] !== undefined){
                    return annotation + global_ns + '["' + val + '"]'
                }else{
                    return annotation + '$B.$global_search("' + val + '", ' +
                        search_ids + ')'
                }
            }
            if(scope === innermost){
                // Handle the case when the same name is used at both sides
                // of an assignment and the right side is defined in an
                // upper scope, eg "range = range"
                if(bound_before){
                    if(bound_before.indexOf(val) > -1){found.push(scope)}
                    else if(scope.context &&
                            scope.context.tree[0].type == 'def' &&
                            scope.context.tree[0].env.indexOf(val) > -1){
                        found.push(scope)
                    }
                }else{
                    if(scope.binding[val]){
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
                        }
                    }
                }
            }else{
                if(scope.binding === undefined){
                    console.log("scope", scope, val, "no binding", innermost)
                }
                if(scope.binding[val]){
                    found.push(scope)
                }
            }
            if(scope.parent_block){scope = scope.parent_block}
            else{break}
        }
        this.found = found

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
                var locs = $get_node(this).locals || {},
                    nonlocs = innermost.nonlocals

                if(locs[val] === undefined &&
                        ((innermost.type != 'def' ||
                             innermost.type != 'generator') &&
                        innermost.ntype != 'class' &&
                        innermost.context.tree[0].args.indexOf(val) == -1) &&
                        (nonlocs === undefined || nonlocs[val] === undefined)){
                    this.result = '$B.$local_search("' + val + '")'
                    return annotation + this.result
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
                        return annotation + this.result
                    }else{
                        this.found = false
                        var res = ns0 + '["' + val + '"] !== undefined ? '
                        res += ns0 + '["' + val + '"] : '
                        this.result = "(" + res + ns1 + '["' + val + '"])'
                        return annotation + this.result
                    }
                }
            }

            var scope = found[0]
            this.found = scope.binding[val]

            var scope_ns = '$locals_' + scope.id.replace(/\./g, '_')

            if(scope.context === undefined){
                // name found at module level
                if(scope.id == '__builtins__'){
                    if(gs.blurred){
                        // If the program has "from <module> import *" we
                        // can't be sure by syntax analysis that the builtin
                        // name is not overridden
                        val = '(' + global_ns + '["' + val + '"] || ' + val + ')'
                    }else{
                        // Builtin name ; it might be redefined inside the
                        // script, eg to redefine open()
                        if(val !== '__builtins__'){
                            val = '$B.builtins.' + val
                        }
                        this.is_builtin = true
                    }
                }else if(scope.id == scope.module){
                    // Name found at module level
                    if(this.bound || this.augm_assign){
                        // If the id is in the left part of a binding or
                        // an augmented assign, eg "x = 0" or "x += 5"
                        val = scope_ns + '["' + val + '"]'
                    }else{
                        if(scope === innermost && this.env[val] === undefined){
                            var locs = this_node.locals || {}
                            if(locs[val] === undefined){
                                // Name is bound in scope, but after the
                                // current node.
                                // If it is a builtin name, use the builtin.
                                // Cf issue #311
                                if(found.length > 1 &&
                                        found[1].id == '__builtins__'){
                                    this.is_builtin = true
                                    this.result = '$B.builtins.' + val +
                                        $to_js(this.tree, '')
                                    return annotation + this.result
                                }
                            }
                            // Call a function to return the value if it is
                            // defined in locals or globals, or raise a
                            // NameError
                            this.result = '$B.$search("' + val + '")'
                            return annotation + this.result
                        }else{
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
                                val = '$B.$check_def("' + val + '",' +
                                    scope_ns + '["' + val + '"])'
                            }
                        }
                    }
                }else{
                    val = scope_ns + '["' + val + '"]'
                }
            }else if(scope === innermost){
                if($B._globals[scope.id] && $B._globals[scope.id][val]){
                    val = global_ns + '["' + val + '"]'
                }else if(!this.bound && !this.augm_assign){
                    // Search all the lines in the scope where the name is
                    // bound. If it is not "above" the current line when going
                    // up the code tree, use $check_def_local which will
                    // check at run time if the name is defined or not.
                    // Cf. issue #836
                    if(this.boundBefore()){
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
                if(scope.ntype == 'generator'){
                    // If the name is bound in a generator, we must search the
                    // value in the locals object for the currently executed
                    // function. It can be found as the second element of the
                    // frame stack at the same level up than the generator
                    // function.
                    var up = 0, // number of levels of the generator above innermost
                        sc = innermost
                    while(sc !== scope){up++; sc = sc.parent_block}
                    var scope_name = "$B.frames_stack[$B.frames_stack.length-1-" +
                        up + "][1]"
                    val = '$B.$check_def_free1("' + val + '", "' +
                        scope.id.replace(/\./g, "_") + '")'
                }else{
                    val = '$B.$check_def_free("' + val + '",' + scope_ns +
                        '["' + val + '"])'
                }
            }else{
                val = scope_ns + '["' + val + '"]'
            }
            this.result = val + $to_js(this.tree, '')
            return annotation + this.result
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
            return annotation + this.result
        }
    }
}

var $ImaginaryCtx = $B.parser.$ImaginaryCtx = function(context,value){
    // Class for the imaginary part of a complex number
    this.type = 'imaginary'
    this.value = value
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return 'imaginary ' + this.value}

    this.to_js = function(){
        this.js_processed = true
        return '$B.make_complex(0,' + this.value + ')'
    }
}

var $ImportCtx = $B.parser.$ImportCtx = function(context){
    // Class for keyword "import"
    this.type = 'import'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this
    this.expect = 'id'

    this.toString = function(){return 'import ' + this.tree}

    this.bind_names = function(){
        // For "import X", set X in the list of names bound in current scope
        var scope = $get_scope(this)
        this.tree.forEach(function(item){
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
        }, this)
    }

    this.to_js = function(){
        this.js_processed = true
        var scope = $get_scope(this),
            res = [],
            module = $get_module(this)
        this.tree.forEach(function(item){
            var mod_name = item.name,
                aliases = (item.name == item.alias)?
                    '{}' : ('{"' + mod_name + '" : "' +
                    item.alias + '"}'),
                localns = '$locals_' + scope.id.replace(/\./g, '_'),
                mod_elts = item.name.split(".")
            for(var i = 0; i < mod_elts.length; i++){
                module.imports[mod_elts.slice(0, i + 1).join(".")] = true
            }
            res.push('$B.$import("' + mod_name + '", [],' + aliases +
                ',' + localns + ', true);')
        })
        // add None for interactive console
        return res.join('') + 'None;'
    }
}

var $ImportedModuleCtx = $B.parser.$ImportedModuleCtx = function(context,name){
    this.type = 'imported module'
    this.parent = context
    this.name = name
    this.alias = name
    context.tree[context.tree.length] = this

    this.toString = function(){return ' (imported module) ' + this.name}

    this.to_js = function(){
        this.js_processed = true
        return '"' + this.name + '"'
    }
}

var $IntCtx = $B.parser.$IntCtx = function(context,value){
    // Class for literal integers
    // value is a 2-elt tuple [base, value_as_string] where
    // base is one of 16 (hex literal), 8 (octal), 2 (binary) or 10 (int)
    this.type = 'int'
    this.value = value
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return 'int ' + this.value}

    this.to_js = function(){
        this.js_processed = true
        var v = parseInt(value[1], value[0])
        if(v > $B.min_int && v < $B.max_int){return v}
        else{
            return '$B.long_int.$factory("' + value[1] + '", ' + value[0] + ')'
        }
    }
}

var $JSCode = $B.parser.$JSCode = function(js){
    this.js = js

    this.toString = function(){return this.js}

    this.to_js = function(){
        this.js_processed = true
        return this.js
    }
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

    this.toString = function(){
        return 'kwarg ' + this.tree[0] + '=' + this.tree[1]
    }

    this.to_js = function(){
        this.js_processed = true
        var key = this.tree[0].value
        if(key.substr(0,2) == '$$'){key = key.substr(2)}
        var res = '{$nat:"kw",name:"' + key + '",'
        return res + 'value:' +
            $to_js(this.tree.slice(1, this.tree.length)) + '}'
    }
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

    this.toString = function(){
        return '(lambda) ' + this.args_start + ' ' + this.body_start
    }

    this.to_js = function(){

        this.js_processed = true

        var node = $get_node(this),
            module = $get_module(this),
            src = $get_src(context),
            args = src.substring(this.args_start, this.body_start),
            body = src.substring(this.body_start + 1, this.body_end)
            body = body.replace(/\\\n/g, ' ') // cf issue 582

        body = body.replace(/\n/g, ' ')

        var scope = $get_scope(this)

        var rand = $B.UUID(),
            func_name = 'lambda_' + $B.lambda_magic + '_' + rand,
            py = 'def ' + func_name + '(' + args + '):\n'
        py += '    return ' + body

        var lambda_name = 'lambda' + rand,
            module_name = module.id.replace(/\./g, '_')

        var js = $B.py2js(py, module_name, lambda_name, scope,
            node.line_num).to_js()

        js = '(function(){\n' + js + '\nreturn $locals.' + func_name + '\n})()'

        $B.clear_ns(lambda_name)
        $B.$py_src[lambda_name] = null
        delete $B.$py_src[lambda_name]

        return js
    }

}

var $ListOrTupleCtx = $B.parser.$ListOrTupleCtx = function(context,real){
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

    this.toString = function(){
        switch(this.real) {
          case 'list':
            return '(list) [' + this.tree + ']'
          case 'list_comp':
          case 'gen_expr':
            return '(' + this.real + ') [' + this.intervals + '-' +
                this.tree + ']'
          default:
            return '(tuple) (' + this.tree + ')'
        }
    }

    this.is_comp = function(){
        switch(this.real) {
            case 'list_comp':
            case 'gen_expr':
            case 'dict_or_set_comp':
                return true
        }
        return false
    }

    this.get_src = function(){
        // Return the Python source code
        var src = $get_module(this).src
        // replace comments by whitespace, cf. issue #658
        var scope = $get_scope(this)
        if(scope.comments === undefined){return src}
        scope.comments.forEach(function(comment){
            var start = comment[0],
                len = comment[1]
            src = src.substr(0, start) + ' '.repeat(len + 1) +
                src.substr(start + len + 1)
        })
        return src
    }

    this.bind_ids = function(scope){
        // Used by $AssignCtx for assignments to a list or tuple
        // Binds all the "simple" ids (not the calls, subscriptions, etc.)
        this.tree.forEach(function(item){
            if(item.type == 'id'){
                $bind(item.value, scope, this)
                item.bound = true
            }else if(item.type == 'expr' && item.tree[0].type == "id"){
                $bind(item.tree[0].value, scope, this)
                item.tree[0].bound = true
            }else if(item.type == 'expr' && item.tree[0].type == "packed"){
                if(item.tree[0].tree[0].type == 'id'){
                    $bind(item.tree[0].tree[0].value, scope, this)
                    item.tree[0].tree[0].bound = true
                }
            }else if(item.type == 'list_or_tuple' ||
                    (item.type == "expr" &&
                        item.tree[0].type == 'list_or_tuple')){
                if(item.type == "expr"){item = item.tree[0]}
                item.bind_ids(scope)
            }
        }, this)
    }

    this.packed_indices = function(){
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

    this.unpack = function(packed){
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

    this.to_js = function(){
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
            case 'list_comp':
            case 'gen_expr':
            case 'dict_or_set_comp':
                var src = this.get_src()
                var res1 = [], items = []

                var qesc = new RegExp('"', "g") // to escape double quotes in arguments

                var comments = root.comments
                for(var i = 1; i < this.intervals.length; i++){
                    var start = this.intervals[i - 1],
                        end = this.intervals[i],
                        txt = src.substring(start, end)

                    comments.forEach(function(comment){
                        if(comment[0] > start && comment[0] < end){
                            // If there is a comment inside the interval,
                            // remove it. Cf issue #776
                            var pos = comment[0] - start
                            txt = txt.substr(0, pos) +
                                txt.substr(pos + comment[1] + 1)
                        }
                    })

                    items.push(txt)
                    var lines = txt.split('\n')
                    var res2 = []
                    lines.forEach(function(txt){
                        // ignore empty lines
                        if(txt.replace(/ /g, '').length != 0){
                            txt = txt.replace(/\n/g, ' ')
                            txt = txt.replace(/\\/g, '\\\\')
                            txt = txt.replace(qesc, '\\"')
                            res2.push('"' + txt + '"')
                        }
                    })
                    res1.push('[' + res2.join(',') + ']')
                }

                var line_num = $get_node(this).line_num

                switch(this.real) {
                    case 'list_comp':
                        var lc = $B.$list_comp(items), // defined in py_utils.js
                            py = lc[0],
                            ix = lc[1],
                            listcomp_name = 'lc' + ix,
                            save_pos = $pos
                        var root = $B.py2js({src:py, is_comp:true},
                            module_name, listcomp_name, scope, line_num)

                        $pos = save_pos

                        var js = root.to_js()

                        root = null
                        $B.clear_ns(listcomp_name)
                        delete $B.$py_src[listcomp_name]

                        js += 'return $locals_lc' + ix + '["x' + ix + '"]'
                        js = '(function(){' + js + '})()'
                        return js

                    case 'dict_or_set_comp':
                        if(this.expression.length == 1){
                            return $B.$gen_expr(module_name, scope, items, line_num)
                        }

                        return $B.$dict_comp(module_name, scope, items, line_num)

                }

                // Generator expression
                // Pass the module name and the current scope object
                // $B.$gen_expr is in py_utils.js
                return $B.$gen_expr(module_name, scope, items, line_num)

            case 'tuple':
                var packed = this.packed_indices()
                if(packed.length > 0){
                    return 'tuple.$factory(' + this.unpack(packed) + ')'
                }
                if(this.tree.length == 1 && this.has_comma === undefined){
                    return this.tree[0].to_js()
                }
                return 'tuple.$factory([' + $to_js(this.tree) + '])'
        }
    }
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

    this.toString = function(){return 'node ' + this.tree}

    this.to_js = function(){
        if(this.js !== undefined){return this.js}
        this.js_processed = true
        if(this.tree.length > 1){
            var new_node = new $Node()
            var ctx = new $NodeCtx(new_node)
            ctx.tree = [this.tree[1]]
            new_node.indent = node.indent + 4
            this.tree.pop()
            node.add(new_node)
        }
        if(node.children.length == 0){
            this.js = $to_js(this.tree) + ';'
        }else{
            this.js = $to_js(this.tree)
        }
        return this.js
    }
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

    this.toString = function(){return 'js ' + js}

    this.to_js = function(){
        this.js_processed = true
        return js
    }
}

var $NonlocalCtx = $B.parser.$NonlocalCtx = function(context){
    // Class for keyword "nonlocal"
    this.type = 'global'
    this.parent = context
    this.tree = []
    this.names = {}
    context.tree[context.tree.length] = this
    this.expect = 'id'

    this.scope = $get_scope(this)
    this.scope.nonlocals = this.scope.nonlocals || {}

    if(this.scope.context === undefined){
        $_SyntaxError(context,
            ["nonlocal declaration not allowed at module level"])
    }

    this.toString = function(){return 'global ' + this.tree}

    this.add = function(name){
        if(this.scope.binding[name] == "arg"){
            $_SyntaxError(context,
              ["name '" + name + "' is parameter and nonlocal"])
        }
        this.names[name] = [false, $pos]
        this.scope.nonlocals[name] = true
    }

    this.transform = function(node, rank){
        var pscope = this.scope.parent_block
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

    this.to_js = function(){
        this.js_processed = true
        return ''
    }
}


var $NotCtx = $B.parser.$NotCtx = function(context){
    // Class for keyword "not"
    this.type = 'not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return 'not (' + this.tree + ')'}

    this.to_js = function(){
        this.js_processed = true
        return '!$B.$bool(' + $to_js(this.tree) + ')'
    }
}

var $OpCtx = $B.parser.$OpCtx = function(context,op){
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

    this.toString = function(){
        return '(op ' + this.op + ') [' + this.tree + ']'
    }

    this.to_js = function(){
        this.js_processed = true
        var comps = {'==': 'eq','!=': 'ne','>=': 'ge','<=': 'le',
            '<': 'lt','>': 'gt'}
        if(comps[this.op] !== undefined){
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
                                return '$B.$TypeError("unorderable types: int() < str()")'
                            case 'id':
                                return 'typeof ' + js0 + ' == "number" ? ' +
                                    js0 + this.op + js1 + ' : $B.rich_comp("__' +
                                    method + '__",' + this.tree[0].to_js() +
                                    ',' + this.tree[1].to_js() + ')'
                        }

                      break;
                  case 'str':
                      switch(t0.type){
                          case 'str':
                              return js0 + this.op + js1
                          case 'int':
                              return '$B.$TypeError("unorderable types: str() < int()")'
                          case 'id':
                              return 'typeof ' + js0 + ' == "string" ? ' +
                                  js0 + this.op + js1 + ' : $B.rich_comp("__' +
                                  method + '__",' + this.tree[0].to_js() +
                                  ',' + this.tree[1].to_js() + ')'
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
                            return 'float.$factory(' + op + x.value + ')'
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
                return this.tree[0].to_js() + '!==' + this.tree[1].to_js()
            case '*':
            case '+':
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
                                case '+':
                                    return '$B.add(' + v0.to_js() + ',' +
                                        v1.to_js() + ')'
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
                        vars.forEach(function(_var){
                            // Test if all variables are numbers
                            tests.push('typeof ' + _var +
                                '.valueOf() == "number"')
                            // Test if all variables are integers
                            tests1.push('typeof ' + _var + ' == "number"')
                        })
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
                        res.push(': $B.$getattr(' + t0 + ',"__')
                        res.push($operators[this.op] + '__")(' + t1 + ')')
                        return '(' + res.join('') + ')'
                    }
                }
                if(comps[this.op] !== undefined){
                    return '$B.rich_comp("__' + $operators[this.op] + '__",' +
                        e0.to_js() + ',' + e1.to_js() + ')'
                }else{
                    return '$B.$getattr(' + e0.to_js() + ', "__' +
                        $operators[this.op] + '__")(' + e1.to_js() + ')'
                }
            default:
                if(comps[this.op] !== undefined){
                    return '$B.rich_comp("__' + $operators[this.op] + '__",' +
                        this.tree[0].to_js() + ',' + this.tree[1].to_js() + ')'
                }else{
                    return '$B.$getattr(' + this.tree[0].to_js() + ', "__' +
                        $operators[this.op] + '__")(' + this.tree[1].to_js() +
                        ')'
                }
        }
    }


    this.simple_js = function(){

        function sjs(elt){
            if(elt.type == 'op'){return elt.simple_js()}
            else if(elt.type == 'expr' && elt.tree[0].type == 'list_or_tuple'
                    && elt.tree[0].real == 'tuple'
                    && elt.tree[0].tree.length == 1
                    && elt.tree[0].tree[0].type == 'expr'){
                return '(' + elt.tree[0].tree[0].tree[0].simple_js() + ')'
            }else{return elt.tree[0].to_js()}
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
    context.tree[context.tree.length] = this

    this.toString = function(){return '(packed) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}


var $PassCtx = $B.parser.$PassCtx = function(context){
    // Class for keyword "pass"
    this.type = 'pass'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(pass)'}

    this.to_js = function(){
        this.js_processed = true
        return 'void(0)'
    }
}

var $RaiseCtx = $B.parser.$RaiseCtx = function(context){
    // Class for keyword "raise"
    this.type = 'raise'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return ' (raise) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        var res = ''
        if(this.tree.length == 0){return '$B.$raise()'}
        var exc_js = this.tree[0].to_js()
        return '$B.$raise(' + exc_js + ')'
    }
}

var $RawJSCtx = $B.parser.$RawJSCtx = function(context,js){
    this.type = "raw_js"
    context.tree[context.tree.length] = this
    this.parent = context

    this.toString = function(){return '(js) ' + js}

    this.to_js = function(){
        this.js_processed = true
        return js
    }
}

var $ReturnCtx = $B.parser.$ReturnCtx = function(context){
    // Class for keyword "return"
    this.type = 'return'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    // Check if return is inside a "for" loop
    // In this case, the loop will not be included inside a function
    // for optimisation
    var node = $get_node(this)
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

    this.toString = function(){return 'return ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        if(this.tree.length == 1 && this.tree[0].type == 'abstract_expr'){
            // "return" must be transformed into "return None"
            this.tree.pop()
            new $IdCtx(new $ExprCtx(this, 'rvalue', false), 'None')
        }
        var scope = $get_scope(this)
        if(scope.ntype == 'generator'){
            return 'return [$B.generator_return(' + $to_js(this.tree) + ')]'
        }
        // Returning from a function means leaving the execution frame
        // If the return is in a try block with a finally block, the frames
        // will be restored when entering "finally"
        var js = 'var $res = ' + $to_js(this.tree) + ';' + '$B.leave_frame'
        if(scope.id.substr(0, 6) == '$exec_'){js += '_exec'}
        return js + '();return $res'
    }
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
        var node = context.node
        var pnode = node.parent
        for(var rank = 0; rank < pnode.children.length; rank++){
            if(pnode.children[rank] === node){break}
        }
        var pctx = pnode.children[rank - 1].context
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

    this.toString = function(){return this.token}

    this.transform = function(node, rank){
        // If node is "finally" there might have been a "return" or a
        // "raise" in the matching "try". In this case the frames stack has
        // been popped from. We must add code to restore it, and to re-pop
        // when exiting the "finally" block
        if(this.token == 'finally'){
            var scope = $get_scope(this)
            if(scope.ntype != 'generator'){
                add_jscode(node, 0,
                    'var $exit;'+
                    'if($B.frames_stack.length<$stack_length){' +
                        '$exit = true;'+
                        '$B.frames_stack.push($top_frame)'+
                    '}'
                )

                var scope_id = scope.id.replace(/\./g, '_')
                var last_child = node.children[node.children.length - 1]

                // If the finally block ends with "return", don't add the
                // final line
                if(last_child.context.tree[0].type != "return"){
                    add_jscode(node, -1,
                        'if($exit){$B.leave_frame()}'
                    )
                }
            }
        }
    }

    this.to_js = function(){
        this.js_processed = true
        if(this.token == 'finally'){return this.token}

        // For "else" we must check if the previous block was a loop
        // If so, check if the loop exited with a "break" to decide
        // if the block below "else" should be run
        if(this.loop_num !== undefined){
            var scope = $get_scope(this)
            var res = 'if($locals_' + scope.id.replace(/\./g, '_')
            return res + '["$no_break' + this.loop_num + '"])'
        }
        return this.token
    }
}

var $SliceCtx = $B.parser.$SliceCtx = function(context){
    // Class for slices inside a subscription : t[1:2]
    this.type = 'slice'
    this.parent = context
    this.tree = context.tree.length > 0 ? [context.tree.pop()] : []
    context.tree.push(this)

    this.to_js = function(){
        for(var i = 0; i < this.tree.length; i++){
            if(this.tree[i].type == "abstract_expr"){
                this.tree[i].to_js = function(){return "None"}
            }
        }
        return "slice.$factory(" + $to_js(this.tree) + ")"
    }
}

var $StarArgCtx = $B.parser.$StarArgCtx = function(context){
    // Class for star args in calls, eg f(*args)
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    this.toString = function(){return '(star arg) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return '{$nat:"ptuple",arg:' + $to_js(this.tree) + '}'
    }
}

var $StringCtx = $B.parser.$StringCtx = function(context,value){
    // Class for literal strings
    this.type = 'str'
    this.parent = context
    this.tree = [value] // may be extended if consecutive strings eg 'a' 'b'
    context.tree[context.tree.length] = this
    this.raw = false

    this.toString = function(){return 'string ' + (this.tree || '')}

    this.to_js = function(){
        this.js_processed = true
        var res = '',
            type = null,
            scope = $get_scope(this)

        function fstring(parsed_fstring){
            // generate code for a f-string
            // parsed_fstring is an array, the result of $B.parse_fstring()
            // in py_string.js
            var elts = []
            for(var i = 0; i < parsed_fstring.length; i++){
                if(parsed_fstring[i].type == 'expression'){
                    var expr = parsed_fstring[i].expression
                    // search specifier
                    var pos = 0,
                        br_stack = [],
                        parts = [expr]

                    while(pos < expr.length){
                        var car = expr.charAt(pos)
                        if(car == ":" && br_stack.length == 0){
                            parts = [expr.substr(0, pos),
                                expr.substr(pos + 1)]
                            break
                        }else if("{[(".indexOf(car) > -1){
                            br_stack.push(car)
                        }else if(")]}".indexOf(car) > -1){
                            br_stack.pop()
                        }
                        pos++
                    }
                    expr = parts[0]
                    // We transform the source code of the expression using py2js.
                    // This gives us a node whose structure is always the same.
                    // The Javascript code matching the expression is the first
                    // child of the first "try" block in the node's children.
                    var save_pos = $pos,
                        temp_id = "temp" + $B.UUID()
                    var expr_node = $B.py2js(expr, scope.module, temp_id, scope)
                    expr_node.to_js()
                    delete $B.$py_src[temp_id]
                    $pos = save_pos
                    for(var j = 0; j < expr_node.children.length; j++){
                        var node = expr_node.children[j]
                        if(node.context.tree && node.context.tree.length == 1 &&
                                node.context.tree[0] == "try"){
                            // node is the first "try" node
                            for(var k = 0; k < node.children.length; k++){
                                // Ignore line num children if any
                                if(node.children[k].is_line_num){continue}
                                // This is the node with the translation of the
                                // f-string expression. It has the attribute js
                                // set to the Javascript translation
                                var expr1 = node.children[k].js
                                // Remove trailing newline and ;
                                while("\n;".indexOf(expr1.charAt(expr1.length - 1)) > -1){
                                    expr1 = expr1.substr(0, expr1.length - 1)
                                }
                                break
                            }
                            break
                        }
                    }
                    switch(parsed_fstring[i].conversion){
                        case "a":
                            expr1 = '$B.builtins.ascii(' + expr1 + ')'
                            break
                        case "r":
                            expr1 = '$B.builtins.repr(' + expr1 + ')'
                            break
                        case "s":
                            expr1 = '$B.builtins.str.$factory(' + expr1 + ')'
                            break
                    }

                    var fmt = parts[1]
                    if(fmt !== undefined){
                        // Format specifier can also contain expressions
                        var parsed_fmt = $B.parse_fstring(fmt)
                        if(parsed_fmt.length > 1){
                            fmt = fstring(parsed_fmt)
                        }else{
                            fmt = "'" + fmt + "'"
                        }
                        var res1 = "$B.builtins.str.format('{0:' + " +
                            fmt + " + '}', " + expr1 + ")"
                        elts.push(res1)
                    }else{
                        if(parsed_fstring[i].conversion === null){
                            expr1 = '$B.builtins.str.$factory(' + expr1 + ')'
                        }
                        elts.push(expr1)
                    }
                }else{
                    var re = new RegExp("'", "g")
                    elts.push("'" + parsed_fstring[i].replace(re, "\\'") + "'")
                }
            }
            return elts.join(' + ')
        }

        for(var i = 0; i < this.tree.length; i++){
            if(this.tree[i].type == "call"){
                // syntax like "hello"(*args, **kw) raises TypeError
                // cf issue 335
                var js = '(function(){throw TypeError.$factory("' + "'str'" +
                    ' object is not callable")}())'
                return js
            }else{
                var value = this.tree[i],
                    is_fstring = Array.isArray(value),
                    is_bytes = false

                if(!is_fstring){
                    is_bytes = value.charAt(0) == 'b'
                }

                if(type == null){
                    type = is_bytes
                    if(is_bytes){res += 'bytes.$factory('}
                }else if(type != is_bytes){
                    return '$B.$TypeError("can\'t concat bytes to str")'
                }
                if(!is_bytes){
                    if(is_fstring){
                        res += fstring(value)
                    }else{
                        res += value.replace(/\n/g,'\\n\\\n')
                    }
                }else{
                    res += value.substr(1).replace(/\n/g,'\\n\\\n')
                }
                if(i < this.tree.length - 1){res += '+'}
            }
        }
        if(is_bytes){res += ',"ISO-8859-1")'}
        return res
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

    this.toString = function(){
        return '(sub) (value) ' + this.value + ' (tree) ' + this.tree
    }

    this.to_js = function(){
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
            return '$B.$getitem(' + this.value.to_js() + ',' +
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
            this.tree.forEach(function(elt){
                if(elt.type == 'abstract_expr'){res1.push('None')}
                else{res1.push(elt.to_js())}
            })
            res += 'tuple.$factory([' + res1.join(',') + ']))'
        }
        return shortcut ? res + ')' : res
    }
}

var $TargetListCtx = $B.parser.$TargetListCtx = function(context){
    // Class for target of "for" in loops or comprehensions,
    // eg x in "for x in A"
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.expect = 'id'
    context.tree[context.tree.length] = this

    this.toString = function(){return '(target list) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        return $to_js(this.tree)
    }
}

var $TernaryCtx = $B.parser.$TernaryCtx = function(context){
    // Class for the ternary operator : "x if C else y"
    this.type = 'ternary'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    context.parent = this
    this.tree = [context]

    this.toString = function(){return '(ternary) ' + this.tree}

    this.to_js = function(){
        this.js_processed = true
        var res = '$B.$bool(' + this.tree[1].to_js() + ') ? ' // condition
        res += this.tree[0].to_js() + ' : '    // result if true
        return res + this.tree[2].to_js()      // result if false
    }
}

var $TryCtx = $B.parser.$TryCtx = function(context){
    // Class for the keyword "try"
    this.type = 'try'
    this.parent = context
    context.tree[context.tree.length] = this

    this.toString = function(){return '(try) '}

    this.transform = function(node, rank){
        if(node.parent.children.length == rank + 1){
            $_SyntaxError(context, "missing clause after 'try'")
        }else{
            var next_ctx = node.parent.children[rank + 1].context.tree[0]
            switch(next_ctx.type) {
                case 'except':
                case 'finally':
                case 'single_kw':
                    break
                default:
                    $_SyntaxError(context, "missing clause after 'try'")
            }
        }
        var scope = $get_scope(this)

        var error_name = create_temp_name('$err')
        var failed_name = create_temp_name('$failed')

        // Transform node into Javascript 'try' (necessary if
        // "try" inside a "for" loop)
        // Add a boolean $failed, used to run the 'else' clause
        var js = 'var '+failed_name + ' = false;\n' + ' '.repeat(node.indent + 8) + 'try'
        new $NodeJSCtx(node, js)
        node.is_try = true // used in generators
        node.has_return = this.has_return

        // Insert new 'catch' clause
        var catch_node = add_jscode(node.parent, rank + 1,
            'catch('+ error_name + ')'
        )
        catch_node.is_catch = true

        // Set the boolean $failed to true
        // Set attribute "pmframe" (post mortem frame) to $B in case an error
        // happens in a callback function ; in this case the frame would be
        // lost at the time the exception is handled by $B.exception
        add_jscode(catch_node, 0,
            'var '+ failed_name + ' = true;' +
            '$B.pmframe = $B.last($B.frames_stack);'+
            // Fake line to start the 'else if' clauses
            'if(0){}'
        )

        var pos = rank + 2
        var has_default = false // is there an "except:" ?
        var has_else = false // is there an "else" clause ?
        var has_finally = false
        while(1){
            if(pos == node.parent.children.length){break}
            var ctx = node.parent.children[pos].context.tree[0]
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
                    add_jscode(node.parent.children[pos], 0,
                        '$locals["' + alias + '"] = $B.exception(' + error_name + ')'
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
            else_body.children.forEach(function(elt){
                else_node.add(elt)
            })
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

    this.to_js = function(){
        this.js_processed = true
        return 'try'
    }

}

var $UnaryCtx = $B.parser.$UnaryCtx = function(context,op){
    // Class for unary operators : - and ~
    this.type = 'unary'
    this.op = op
    this.parent = context
    context.tree[context.tree.length] = this

    this.toString = function(){return '(unary) ' + this.op}

    this.to_js = function(){
        this.js_processed = true
        return this.op
    }
}

var $WithCtx = $B.parser.$WithCtx = function(context){
    // Class for keyword "with"
    this.type = 'with'
    this.parent = context
    context.tree[context.tree.length] = this
    this.tree = []
    this.expect = 'as'
    this.scope = $get_scope(this)

    this.toString = function(){return '(with) ' + this.tree}

    this.set_alias = function(arg){
        this.tree[this.tree.length - 1].alias = arg
        $bind(arg, this.scope, this)
        if(this.scope.ntype !== 'module'){
            // add to function local names
            this.scope.context.tree[0].locals.push(arg)
        }
    }

    this.transform = function(node,rank){

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
            suite.forEach(function(elt){
                new_node.add(elt)
            })
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

        node.is_try = true // for generators that use a context manager

        if(this.transformed){return}  // used if inside a for loop

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
            wc.tree = this.tree.slice(1)
            node.children.forEach(function(elt){
                nw.add(elt)
            })
            node.children = [nw]
            this.transformed = true

            return
        }

        // Used to create js identifiers:
        var num = this.num = $loop_num++
        var cm_name  = '$ctx_manager' + num,
            cme_name = '$ctx_manager_exit' + num,
            exc_name = '$exc' + num,
            err_name = '$err' + num,
            val_name = '$value' + num

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
        try_node.is_try = true
        new $NodeJSCtx(try_node, 'try')
        node.add(try_node)

        // if there is an alias, insert the value
        if(this.tree[0].alias){
            var alias = this.tree[0].alias.tree[0].tree[0].value
            add_jscode(try_node, -1,
                '$locals' + '["' + alias + '"] = ' + val_name
            )
        }

        // place block inside a try clause
        block.forEach(function(elt){try_node.add(elt)})

        var catch_node = new $Node()
        catch_node.is_catch = true // for generators
        new $NodeJSCtx(catch_node, 'catch(' + err_name + ')')

        add_jscode(catch_node, -1,
            exc_name + ' = false;' +
            err_name + ' = $B.exception(' + err_name + ')\n' + ' '.repeat(node.indent+4) +
                'if(!$B.$bool('+cme_name+'('+
                                    err_name + '.__class__,' +
                                    err_name + ','+
                                    '$B.$getattr('+err_name + ', "traceback")'+
                                ')'+
                            ')'+
                '){' +
                   'throw ' + err_name +
                '}'
        )
        node.add(catch_node)

        var finally_node = new $Node()
        new $NodeJSCtx(finally_node, 'finally')
        finally_node.context.type = 'single_kw'
        finally_node.context.token = 'finally'
        finally_node.context.in_ctx_manager = true
        finally_node.is_except = true
        finally_node.in_ctx_manager = true
        add_jscode(finally_node, -1,
            'if(' + exc_name + ')'+ cme_name+'(None,None,None);'
        )
        node.parent.insert(rank + 1, finally_node)

        this.transformed = true
    }

    this.to_js = function(){
        this.js_processed = true
        var indent = $get_node(this).indent,
            h = ' '.repeat(indent + 4),
            num = this.num
        var cm_name  = '$ctx_manager' + num,
            cme_name = '$ctx_manager_exit' + num,
            exc_name = '$exc' + num,
            val_name = '$value' + num
        return 'var ' + cm_name + ' = ' + this.tree[0].to_js() + '\n' +
               h + 'var ' + cme_name + ' = $B.$getattr('+cm_name+',"__exit__")\n' +
               h + 'var ' + val_name + ' = $B.$getattr('+cm_name+',"__enter__")()\n' +
               h + 'var ' + exc_name + ' = true\n'+
               h + 'try'
    }
}

var $YieldCtx = $B.parser.$YieldCtx = function(context, is_await){
    // Class for keyword "yield"
    // "await" is implemented as "yield from", for this case is_await is set
    this.type = 'yield'
    this.toString = function(){return '(yield) ' + this.tree}
    this.parent = context
    this.tree = []
    context.tree[context.tree.length] = this

    var in_lambda = false,
        parent = context
    while(parent){
        if(parent.type == "lambda"){
            in_lambda = true
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
            case 'tuple':
            case 'list_or_tuple':
                // mark the node as containing a yield atom
                $get_node(context).yield_atoms.push(this)
                break
           default:
                // else it is a SyntaxError
                $_SyntaxError(context, 'yield atom must be inside ()')
        }
    }

    var scope = this.scope = $get_scope(this)

    if(! scope.is_function && ! in_lambda){
        $_SyntaxError(context, ["'yield' outside function"])
    }

    // Change type of function to generator
    if(! in_lambda){
        var def = scope.context.tree[0]
        if(! is_await){
            def.type = 'generator'
        }
        // Add to list of "yields" in function
        def.yields.push(this)
    }

    this.toString = function(){
        return '(yield) ' + (this.from ? '(from) ' : '') + this.tree
    }

    this.transform = function(node, rank){
        add_jscode(node.parent, rank + 1,
            '// placeholder for generator sent value'
        ).set_yield_value = true
    }

    this.to_js = function(){
        this.js_processed = true
        if(this.from === undefined){return $to_js(this.tree) || 'None'}

        // form "yield from <expr>" : <expr> is this.tree[0]
        return $to_js(this.tree)
    }
}

var $add_profile = $B.parser.$add_profile = function(node,rank){
    if(node.type == 'module'){
        var i = 0
        while(i < node.children.length){
            i += $add_profile(node.children[i], i)
        }
    }else{
        var elt = node.context.tree[0],
            offset = 1,
            flag = true,
            pnode = node
        while(pnode.parent !== undefined){pnode = pnode.parent}
        var mod_id = pnode.id
        // ignore lines added in transform()
        if(node.line_num === undefined){flag = false}
        // Don't add line num before try,finally,else,elif
        // because it would throw a syntax error in Javascript
        if(elt.type == 'condition' && elt.token == 'elif'){flag = false}
        else if(elt.type == 'except'){flag = false}
        else if(elt.type == 'single_kw'){flag = false}
        if(flag){
            // add a trailing None for interactive mode
            var new_node = new $Node()
            new $NodeJSCtx(new_node,
                ';$B.$profile.count("' + mod_id + '",' + node.line_num + ');')
            node.parent.insert(rank, new_node)
            offset = 2
        }
        var i = 0
        while(i < node.children.length){
            i += $add_profile(node.children[i], i)
        }
        return offset
    }
}

var $add_line_num = $B.parser.$add_line_num = function(node,rank){
    if(node.type == 'module'){
        var i = 0
        while(i < node.children.length){
            i += $add_line_num(node.children[i], i)
        }
    }else if(node.type !== 'marker'){
        var elt = node.context.tree[0],
            offset = 1,
            flag = true,
            pnode = node
        while(pnode.parent !== undefined){pnode = pnode.parent}
        var mod_id = pnode.id
        // ignore lines added in transform()
        var line_num = node.line_num || node.forced_line_num
        if(line_num === undefined){flag = false}
        // Don't add line num before try,finally,else,elif
        // because it would throw a syntax error in Javascript
        if(elt.type == 'condition' && elt.token == 'elif'){flag = false}
        else if(elt.type == 'except'){flag = false}
        else if(elt.type == 'single_kw'){flag = false}
        if(flag){
            // add a trailing None for interactive mode
            var js = ';$locals.$line_info = "' + line_num + ',' +
                mod_id + '";'

            var new_node = new $Node()
            new_node.is_line_num = true // used in generators
            new $NodeJSCtx(new_node, js)
            node.parent.insert(rank, new_node)
            offset = 2
        }
        var i = 0
        while(i < node.children.length){
            i += $add_line_num(node.children[i], i)
        }
        // At the end of a "while" or "for" loop body, add a line to reset
        // line number to that of the "while" or "for" loop (cf issue #281)
        if((elt.type == 'condition' && elt.token == "while")
                || node.context.type == 'for'){
            if($B.last(node.children).context.tree[0].type != "return"){
                node.add($NodeJS('$locals.$line_info = "' + line_num +
                    ',' + mod_id + '";'))
            }
        }

        return offset
    }else{
        return 1
    }
}

$B.$add_line_num = $add_line_num

var $bind = $B.parser.$bind = function(name, scope, context){
    // Bind a name in scope
    if(scope.nonlocals && scope.nonlocals[name]){
        // name is declared nonlocal in the scope : don't bind
        return
    }

    if(scope.globals && scope.globals.indexOf(name) > -1){
        var module = $get_module(context)
        module.binding[name] = true
        return
    }

    var node = $get_node(context)
    // Add name to attribute "bindings" of node. Used in $IdCtx.boundBefore()
    node.bindings = node.bindings || {}
    node.bindings[name] = true

    if(scope.binding[name] === undefined){
        scope.binding[name] = true
    }
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

var $get_scope = $B.parser.$get_scope = function(context){
    // Return the instance of $Node indicating the scope of context
    // Return null for the root node
    var ctx_node = context.parent
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
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
    if(ctx_node.line_num===undefined){
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
    var ctx_node = context.parent
    while(ctx_node.type !== 'node'){ctx_node = ctx_node.parent}
    var tree_node = ctx_node.node
    if(tree_node.ntype == "module"){return tree_node}
    var scope = null
    while(tree_node.parent.type != 'module'){
        tree_node = tree_node.parent
    }
    var scope = tree_node.parent // module
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
    throw Error('no to_js() for ' + tree_element)
}

var $to_js = $B.parser.$to_js = function(tree,sep){
    if(sep === undefined){sep = ','}

    return tree.map($to_js_map).join(sep)
}

var $mangle = $B.parser.$mangle = function(name, context){
    // If name starts with __ and doesn't end with __, and if it is defined
    // in a class, "mangle" it, ie preprend _<classname>
    if(name.substr(0, 2) == "__" && name.substr(name.length - 2) !== "__"){
        var klass = null,
            scope = $get_scope(context)
        while(true){
            if(scope.ntype == "module"){return name}
            else if(scope.ntype == "class"){
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

var $transition = $B.parser.$transition = function(context, token, value){
    //console.log("context", context, "token", token, value)
    switch(context.type){
        case 'abstract_expr':

          var packed = context.packed

          switch(token) {
              case 'id':
              case 'imaginary':
              case 'int':
              case 'float':
              case 'str':
              case 'bytes':
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
          }

          switch(token) {
              case 'await':
                  return new $AwaitCtx(context)
              case 'id':
                  return new $IdCtx(new $ExprCtx(context, 'id', commas),
                      value)
              case 'str':
                  return new $StringCtx(new $ExprCtx(context, 'str', commas),
                      value)
              case 'bytes':
                  return new $StringCtx(new $ExprCtx(context, 'bytes', commas),
                      value)
              case 'int':
                  return new $IntCtx(new $ExprCtx(context, 'int', commas),
                      value)
              case 'float':
                  return new $FloatCtx(new $ExprCtx(context, 'float', commas),
                      value)
              case 'imaginary':
                  return new $ImaginaryCtx(
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
              case '.':
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
                          // create a left argument for operator "unary"
                          context.parent.tree.pop()
                          var left = new $UnaryCtx(context.parent, tg)
                          // create the operator "unary"
                          if(tg == '-'){
                              var op_expr = new $OpCtx(left,'unary_neg')
                          }else if(tg == '+'){
                              var op_expr = new $OpCtx(left, 'unary_pos')
                          }else{
                              var op_expr = new $OpCtx(left,'unary_inv')
                          }
                          return new $AbstractExprCtx(op_expr, false)
                      case 'not':
                          context.parent.tree.pop() // remove abstract expression
                          var commas = context.with_commas
                          context = context.parent
                          return new $NotCtx(
                              new $ExprCtx(context, 'not', commas))
                  }
                  $_SyntaxError(context, 'token ' + token + ' after ' +
                      context)
              case '=':
                  $_SyntaxError(context, token)
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
                      case 'call_arg':
                      case 'op':
                      case 'yield':
                          break
                      default:
                          $_SyntaxError(context, token)
                  }
          }
          return $transition(context.parent, token, value)

        case 'annotation':
            return $transition(context.parent, token)

        case 'assert':
            if(token == 'eol'){return $transition(context.parent, token)}
            $_SyntaxError(context, token)

        case 'assign':
            if(token == 'eol'){
                if(context.tree[1].type == 'abstract_expr'){
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
                }
                // If left is an id, update binding to the type of right operand
                context.guess_type()
                return $transition(context.parent, 'eol')
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'async':
            if(token == "def"){
                return $transition(context.parent, token, value)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'attribute':
            if(token === 'id'){
                var name = value
                if(noassign[name] === true){$_SyntaxError(context,
                    ["cannot assign to " + name])}
                name = $mangle(name, context)
                context.name = name
                return context.parent
            }
            $_SyntaxError(context,token)

        case 'augm_assign':
            if(token == 'eol'){
                if(context.tree[1].type == 'abstract_expr'){
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
                }
                return $transition(context.parent, 'eol')
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'await':
            return $transition(context.parent, token, value)

        case 'break':
            if(token == 'eol'){return $transition(context.parent, 'eol')}
            $_SyntaxError(context, token)

        case 'call':
            switch(token) {
                case ',':
                    if(context.expect == 'id'){$_SyntaxError(context, token)}
                    context.expect = 'id'
                    return context
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case '.':
                case 'not':
                case 'lambda':
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
            }

            return $transition(context.parent, token, value)

        case 'call_arg':
            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case '.':
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
                    var lst = new $ListOrTupleCtx(context, 'gen_expr')
                    lst.vars = context.vars // copy variables
                    lst.locals = context.locals
                    lst.intervals = [context.start]
                    context.tree.pop()
                    lst.expression = context.tree
                    context.tree = [lst]
                    lst.tree = []
                    var comp = new $ComprehensionCtx(lst)
                    return new $TargetListCtx(new $CompForCtx(comp))
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
                               return new $StarArgCtx(context)
                           case '**':
                               return new $DoubleStarArgCtx(context)
                       }
                    }
                    $_SyntaxError(context, 'token ' + token + ' after ' + context)
                case ')':
                    if(context.parent.kwargs &&
                            $B.last(context.parent.tree).tree[0] && // if call ends with ,)
                            ['kwarg', 'star_arg', 'double_star_arg'].
                                indexOf($B.last(context.parent.tree).tree[0].type) == -1){
                        $_SyntaxError(context,
                            ['non-keyword arg after keyword arg'])
                    }
                    if(context.tree.length > 0){
                        var son = context.tree[context.tree.length - 1]
                        if(son.type == 'list_or_tuple' &&
                                son.real == 'gen_expr'){
                            son.intervals.push($pos)
                        }
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
                                ['non-keyword arg after keyword arg'])
                        }
                        return $transition(context.parent, token, value)
                    }
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'class':
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
                    return $BodyCtx(context)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'comp_if':
            return $transition(context.parent, token, value)

        case 'comp_for':
            if(token == 'in' && context.expect == 'in'){
                context.expect = null
                return new $AbstractExprCtx(new $CompIterableCtx(context), true)
            }
            if(context.expect === null){
                // ids in context.tree[0] are local to the comprehension
                return $transition(context.parent, token, value)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'comp_iterable':
            return $transition(context.parent, token, value)

        case 'comprehension':
            switch(token) {
                case 'if':
                    return new $AbstractExprCtx(new $CompIfCtx(context), false)
                case 'for':
                    return new $TargetListCtx(new $CompForCtx(context))
            }
            return $transition(context.parent,token,value)

        case 'condition':
            if(token == ':'){return $BodyCtx(context)}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'continue':
            if(token == 'eol'){return context.parent}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'ctx_manager_alias':
            switch(token){
                case ',':
                case ':':
                    return $transition(context.parent, token, value)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'decorator':
            if(token == 'id' && context.tree.length == 0){
                return $transition(new $DecoratorExprCtx(context),
                    token, value)
            }
            if(token == 'eol') {
                return $transition(context.parent, token)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'decorator_expression':
            if(context.expects === undefined){
                if(token == "id"){
                    context.names.push(value)
                    context.expects = "."
                    return context
                }
                $_SyntaxError(context, 'token ' + token + ' after ' + context)
            }else if(context.is_call && token !== "eol"){
                $_SyntaxError(context, 'token ' + token + ' after ' + context)
            }else if(token == "id" && context.expects == "id"){
                context.names.push(value)
                context.expects = "."
                return context
            }else if(token == "." && context.expects == "."){
                context.expects = "id"
                return context
            }else if(token == "(" && context.expects == "."){
                if(! context.is_call){
                    context.is_call = true
                    return new $CallCtx(context)
                }
            }else if(token == 'eol') {
                return $transition(context.parent, token)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'def':
            switch(token) {
                case 'id':
                    if(context.name) {
                        $_SyntaxError(context, 'token ' + token + ' after ' + context)
                    }
                    context.set_name(value)
                    return context
                case '(':
                    if(context.name == null){
                        $_SyntaxError(context, 'token ' + token +
                            ' after ' + context)
                    }
                    context.has_args = true;
                    return new $FuncArgs(context)
                case 'annotation':
                    return new $AbstractExprCtx(new $AnnotationCtx(context), true)
                case ':':
                    if(context.has_args){return $BodyCtx(context)}
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'del':
            if(token == 'eol'){return $transition(context.parent, token)}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'dict_or_set':
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
                                case 'set_comp':
                                case 'dict_comp':
                                     context.items = context.tree
                                     context.tree = []
                                     context.closed = true
                                     return context
                                case 'dict':
                                    if(context.nb_dict_items() % 2 == 0){
                                        context.items = context.tree
                                        context.tree = []
                                        context.closed = true
                                        return context
                                    }
                              }
                              $_SyntaxError(context, 'token ' + token +
                                  ' after ' + context)
                        case ',':
                            if(context.real == 'dict_or_set'){context.real = 'set'}
                            if(context.real == 'dict' &&
                                    context.nb_dict_items() % 2){
                                $_SyntaxError(context, 'token ' + token +
                                    ' after ' + context)
                            }
                            context.expect = 'id'
                            return context
                        case ':':
                          if(context.real == 'dict_or_set'){context.real = 'dict'}
                          if(context.real == 'dict'){
                              context.expect = ','
                              return new $AbstractExprCtx(context,false)
                          }else{$_SyntaxError(context, 'token ' + token +
                              ' after ' + context)}
                        case 'for':

                            // comprehension
                            if(context.real == 'dict_or_set'){context.real = 'set_comp'}
                            else{context.real = 'dict_comp'}
                            var lst = new $ListOrTupleCtx(context, 'dict_or_set_comp')
                            lst.intervals = [context.start + 1]
                            lst.vars = context.vars
                            context.tree.pop()
                            lst.expression = context.tree
                            context.tree = [lst]
                            lst.tree = []
                            var comp = new $ComprehensionCtx(lst)
                            return new $TargetListCtx(new $CompForCtx(comp))
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
                }
                return $transition(context.parent, token, value)
            }

        case 'double_star_arg':
            switch(token){
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
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

        case 'ellipsis':
            if(token == '.'){context.nbdots++; return context}
            else{
                if(context.nbdots != 3){
                    $pos--
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
                }else{
                    return $transition(context.parent, token, value)
                }
            }

        case 'except':
            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case 'not':
                case 'lamdba':
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
                    }
          }
          $_SyntaxError(context, 'token ' + token + ' after ' + context.expect)

        case 'expr':
          switch(token) {
              case 'id':
              case 'imaginary':
              case 'int':
              case 'float':
              case 'str':
              case 'bytes':
              case 'lamdba':
                  $_SyntaxError(context, 'token ' + token + ' after ' +
                      context)
                  break
              case '[':
              case '(':
              case '{':
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
                  if(context.expect == ','){return new $ExprNot(context)}
                  break
              case 'in':
                  if(context.parent.type == 'target_list'){
                      // expr used for target list
                      return $transition(context.parent, token)
                  }
                  if(context.expect == ','){
                      return $transition(context, 'op', 'in')
                  }
                  break
              case ',':
                  if(context.expect == ','){
                      if(context.with_commas){
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
                  return $transition(context.parent,token)
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

                var op1 = context.parent,
                    repl = null
                while(1){
                    if(op1.type == 'expr'){op1 = op1.parent}
                    else if(op1.type == 'op' &&
                            $op_weight[op1.op] >= $op_weight[op] &&
                            !(op1.op == '**' && op == '**')){ // cf. issue #250
                        repl = op1
                        op1 = op1.parent
                    }else if(op1.type == "not" &&
                            $op_weight['not'] > $op_weight[op]){
                        repl = op1
                        op1 = op1.parent
                    }else{break}
                }
                if(repl === null){
                    while(1){
                        if(context.parent !== op1){
                            context = context.parent
                            op_parent = context.parent
                        }else{
                            break
                        }
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
                        while(repl.parent.type == 'not'||
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
                             // chained comparisons such as c1 <= c2 < c3
                             // replace by (c1 op1 c2) and (c2 op c3)

                             // save c2
                             var c2 = repl.tree[1], // right operand of op1
                                 c2js = c2.to_js()

                             // clone c2
                             var c2_clone = new Object()
                             for(var attr in c2){c2_clone[attr] = c2[attr]}

                             // The variable c2 must be evaluated only once ;
                             // we generate a temporary variable name to
                             // replace c2.to_js() and c2_clone.to_js()
                             var vname = "$c" + chained_comp_num
                             c2.to_js = function(){return vname}
                             c2_clone.to_js = function(){return vname}
                             chained_comp_num++

                             // If there are consecutive chained comparisons
                             // we must go up to the uppermost 'and' operator
                             while(repl.parent && repl.parent.type == 'op'){
                                 if($op_weight[repl.parent.op] <
                                         $op_weight[repl.op]){
                                     repl = repl.parent
                                 }else{break}
                             }
                             repl.parent.tree.pop()

                             // Create a new 'and' operator, with the left
                             // operand equal to c1 <= c2
                             var and_expr = new $OpCtx(repl, 'and')
                             // Set an attribute "wrap" to the $OpCtx instance.
                             // It will be used in an anomymous function where
                             // the temporary variable called vname will be
                             // set to the value of c2
                             and_expr.wrap = {'name': vname, 'js': c2js}

                             c2_clone.parent = and_expr
                             // For compatibility with the interface of $OpCtx,
                             // add a fake element to and_expr : it will be
                             // removed when new_op is created at the next
                             // line
                             and_expr.tree.push('xxx')
                             var new_op = new $OpCtx(c2_clone, op)
                             return new $AbstractExprCtx(new_op, false)
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
                if(context.expect == ','){
                     return new $AbstractExprCtx(
                         new $AugmentedAssignCtx(context, value), true)
                }
                break
            case ":": // slice
                // valid only if expr is parent is a subscription, or a tuple
                // inside a subscription, or a slice
                if(context.parent.type=="sub" ||
                        (context.parent.type == "list_or_tuple" &&
                        context.parent.parent.type == "sub")){
                    return new $AbstractExprCtx(new $SliceCtx(context.parent), false)
                }else if(context.parent.type == "slice"){
                    return $transition(context.parent, token, value)
                }else if(context.parent.type == "node"){
                    // Annotation
                    return new $AbstractExprCtx(new $AnnotationCtx(context), false)
                }
                break
            case '=':
               if(context.expect == ','){
                   if(context.parent.type == "call_arg"){
                       // issue 708
                       if(context.tree[0].type != 'id'){
                           $_SyntaxError(context,
                               ["keyword can't be an expression"])
                       }
                      return new $AbstractExprCtx(new $KwArgCtx(context), true)
                   }else if(context.parent.type == "annotation"){
                       return $transition(context.parent.parent, token,
                           value)
                   }else if(context.parent.type == "op"){
                        // issue 811
                        $_SyntaxError(context, ["can't assign to operator"])
                   }

                   while(context.parent !== undefined){
                       context = context.parent
                       if(context.type == 'condition'){
                           $_SyntaxError(context, 'token ' + token + ' after '
                               + context)
                       }
                   }
                   context = context.tree[0]
                   return new $AbstractExprCtx(new $AssignCtx(context), true)
                }
                break
            case 'if':
                var in_comp = false,
                    ctx = context.parent
                while(true){
                    if(ctx.type == 'comp_iterable'){in_comp = true; break}
                    else if(ctx.parent !== undefined){ctx = ctx.parent}
                    else{break}
                }
                if(in_comp){break}
                // Ternary operator : "expr1 if cond else expr2"
                // If the part before "if" is an operation, apply operator
                // precedence
                // Example : print(1+n if n else 0)
                var ctx = context
                while(ctx.parent && ctx.parent.type == 'op'){
                    ctx = ctx.parent
                    if(ctx.type == 'expr' &&
                            ctx.parent && ctx.parent.type == 'op'){
                        ctx = ctx.parent
                    }
                }
                return new $AbstractExprCtx(new $TernaryCtx(ctx), false)
            case 'eol':
                if(["dict_or_set", "list_or_tuple"].indexOf(context.parent.type) == -1){
                    var t = context.tree[0]
                    if(t.type == "packed" ||
                            (t.type == "call" && t.func.type == "packed")){
                        $_SyntaxError(context, ["can't use starred expression here"])
                    }
                }
          }
          return $transition(context.parent,token)

        case 'expr_not':
            if(token == 'in'){ // expr not in : operator
                context.parent.tree.pop()
                return new $AbstractExprCtx(
                    new $OpCtx(context.parent, 'not_in'), false)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'for':
            switch(token) {
                case 'in':
                    return new $AbstractExprCtx(
                        new $ExprCtx(context,'target list', true), false)
                case ':':
                    if(context.tree.length < 2){ // issue 638
                        $_SyntaxError(context, 'token ' + token + ' after ' +
                            context)
                    }
                    return $BodyCtx(context)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'from':
            switch(token) {
                case 'id':
                    if(context.expect == 'id'){
                        context.add_name(value)
                        context.expect = ','
                        return context
                    }
                    if(context.expect == 'alias'){
                        context.aliases[context.names[context.names.length - 1]] =
                            value
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

        case 'func_arg_id':
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
                    // annotation associated with a function parameter
                    if(context.has_default){ // issue 610
                        $_SyntaxError(context, 'token ' + token + ' after ' +
                            context)
                    }
                    return new $AbstractExprCtx(new $AnnotationCtx(context),
                        false)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'func_args':
            switch (token) {
                case 'id':
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
                    if(context.has_kw_arg){
                        $_SyntaxError(context,'duplicate kw arg')
                    }
                    if(context.expect == ','){
                        context.expect = 'id'
                        return context
                    }
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
                case ')':
                    return context.parent
                case 'op':
                    var op = value
                    context.expect = ','
                    if(op == '*'){
                        if(context.has_star_arg){
                            $_SyntaxError(context,'duplicate star arg')
                        }
                        return new $FuncStarArgCtx(context, '*')
                    }
                    if(op == '**'){return new $FuncStarArgCtx(context, '**')}
                    $_SyntaxError(context, 'token ' + op + ' after ' + context)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'func_star_arg':
            switch(token) {
                case 'id':
                    if(context.name === undefined){
                       if(context.parent.names.indexOf(value) > -1){
                         $_SyntaxError(context,
                             ['duplicate argument ' + value +
                                 ' in function definition'])
                       }
                    }
                    context.set_name(value)
                    context.parent.names.push(value)
                    return context
                case ',':
                case ')':
                    if(context.name === undefined){
                       // anonymous star arg - found in configparser
                       context.set_name('$dummy')
                       context.parent.names.push('$dummy')
                    }
                    return $transition(context.parent, token)
                case ':':
                    // annotation associated with a function parameter
                    if(context.name === undefined){
                        $_SyntaxError(context,
                            'annotation on an unnamed parameter')
                    }
                    return new $AbstractExprCtx(
                        new $AnnotationCtx(context), false)
            }// switch
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'global':
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
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'id':
            switch(token) {
                case '=':
                    if(context.parent.type == 'expr' &&
                            context.parent.parent !== undefined &&
                            context.parent.parent.type == 'call_arg'){
                        return new $AbstractExprCtx(
                            new $KwArgCtx(context.parent), false)
                    }
                    return $transition(context.parent, token, value)
                case 'op':
                    return $transition(context.parent, token, value)
                case 'id':
                case 'str':
                case 'int':
                case 'float':
                case 'imaginary':
                    if(context.value == "print"){
                        $_SyntaxError(context,
                            ["missing parenthesis in call to 'print'"])
                    }
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
            }
            if(context.value == "async"){
                // Until Python 3.7 async is not a keyword
                if(token == 'def'){
                    context.parent.parent.tree = []
                    var ctx = $transition(context.parent.parent,
                        token, value)
                    ctx.async = true
                    return ctx
                }
            }

            return $transition(context.parent, token, value)

        case 'import':
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

        case 'imaginary':
        case 'int':
        case 'float':
            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case 'not':
                case 'lamdba':
                    $_SyntaxError(context, 'token ' + token + ' after ' +
                        context)
            }
            return $transition(context.parent, token, value)

        case 'kwarg':
            if(token == ','){return new $CallArgCtx(context.parent.parent)}
            return $transition(context.parent, token)

        case 'lambda':
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
                return $transition(new $CallCtx(context), token, value)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'list_or_tuple':
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
                        case 'gen_expr':
                            if(token == ')'){
                               context.closed = true
                               if(context.real == 'gen_expr'){
                                   context.intervals.push($pos)
                               }
                               return context.parent
                            }
                            break
                        case 'list':
                        case 'list_comp':
                            if(token == ']'){
                                 context.closed = true
                                 if(context.real == 'list_comp'){
                                     context.intervals.push($pos)
                                 }
                                 return context
                            }
                            break
                        case 'dict_or_set_comp':
                            if(token == '}'){
                                 context.intervals.push($pos)
                                 return $transition(context.parent, token)
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
                                context.real = 'list_comp'
                            }
                            else{context.real = 'gen_expr'}
                            // remove names already referenced in list from
                            // the function references
                            context.intervals = [context.start + 1]
                            context.expression = context.tree
                            context.tree = [] // reset tree
                            var comp = new $ComprehensionCtx(context)
                            return new $TargetListCtx(new $CompForCtx(comp))
                    }
                    return $transition(context.parent,token,value)
                }else if(context.expect == 'id'){
                    switch(context.real) {
                        case 'tuple':
                            if(token == ')'){
                              context.closed = true
                              return context.parent
                            }
                            if(token == 'eol' && context.implicit === true){
                              context.closed = true
                              return $transition(context.parent, token)
                            }
                            break
                        case 'gen_expr':
                            if(token == ')'){
                              context.closed = true
                              return $transition(context.parent, token)
                            }
                            break
                        case 'list':
                            if(token == ']'){
                              context.closed = true
                              return context
                            }
                            break
                    }

                    switch(token) {
                        case '=':
                            if(context.real == 'tuple' &&
                                    context.implicit === true){
                                context.closed = true
                                context.parent.tree.pop()
                                var expr = new $ExprCtx(context.parent,
                                    'tuple', false)
                                expr.tree = [context]
                                context.parent = expr
                                return $transition(context.parent, token)
                            }
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
                        case ',':
                            $_SyntaxError(context,
                                'unexpected comma inside list')
                        default:
                            context.expect = ','
                            var expr = new $AbstractExprCtx(context, false)
                            return $transition(expr,token, value)
                    }

                }else{
                    return $transition(context.parent, token, value)
                }
            }

        case 'list_comp':
            switch(token){
                case ']':
                    return context.parent
                case 'in':
                    return new $ExprCtx(context, 'iterable', true)
                case 'if':
                    return new $ExprCtx(context, 'condition', true)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)

        case 'node':
            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case 'not':
                case 'lamdba':
                case '.':
                    var expr = new $AbstractExprCtx(context,true)
                    return $transition(expr,token,value)
                case 'op':
                    switch(value) {
                        case '*':
                        case '+':
                        case '-':
                        case '~':
                            var expr = new $AbstractExprCtx(context, true)
                            return $transition(expr, token, value)
                    }
                    break
                case 'async':
                    return new $AsyncCtx(context)
                case 'await':
                    //return new $AwaitCtx(context)
                    var yexpr = new $AbstractExprCtx(
                        new $YieldCtx(context, true), true)
                    return $transition(yexpr, "from")
                case 'class':
                    return new $ClassCtx(context)
                case 'continue':
                    return new $ContinueCtx(context)
                case '__debugger__':
                    return new $DebuggerCtx(context)
                case 'break':
                    return new $BreakCtx(context)
                case 'def':
                    return new $DefCtx(context)
                case 'for':
                    return new $TargetListCtx(new $ForExpr(context))
                case 'if':
                case 'while':
                    return new $AbstractExprCtx(
                        new $ConditionCtx(context, token), false)
                case 'elif':
                    var previous = $previous(context)
                    if(['condition'].indexOf(previous.type) == -1 ||
                            previous.token == 'while'){
                        $_SyntaxError(context, 'elif after ' + previous.type)
                    }
                    return new $AbstractExprCtx(
                        new $ConditionCtx(context, token), false)
                case 'else':
                    var previous = $previous(context)
                    if(['condition', 'except', 'for'].
                            indexOf(previous.type) == -1){
                        $_SyntaxError(context, 'else after ' + previous.type)
                    }
                    return new $SingleKwCtx(context,token)
                case 'finally':
                    var previous = $previous(context)
                    if(['try', 'except'].indexOf(previous.type) == -1 &&
                            (previous.type != 'single_kw' ||
                                previous.token != 'else')){
                        $_SyntaxError(context, 'finally after ' + previous.type)
                    }
                    return new $SingleKwCtx(context,token)
                case 'try':
                    return new $TryCtx(context)
                case 'except':
                    var previous = $previous(context)
                    if(['try', 'except'].indexOf(previous.type) == -1){
                        $_SyntaxError(context, 'except after ' + previous.type)
                    }
                    return new $ExceptCtx(context)
                case 'assert':
                    return new $AbstractExprCtx(
                        new $AssertCtx(context), 'assert', true)
                case 'from':
                    return new $FromCtx(context)
                case 'import':
                    return new $ImportCtx(context)
                case 'global':
                    return new $GlobalCtx(context)
                case 'nonlocal':
                    return new $NonlocalCtx(context)
                case 'lambda':
                    return new $LambdaCtx(context)
                case 'pass':
                    return new $PassCtx(context)
                case 'raise':
                    return new $AbstractExprCtx(new $RaiseCtx(context), true)
                case 'return':
                    return new $AbstractExprCtx(new $ReturnCtx(context),true)
                case 'with':
                    return new $AbstractExprCtx(new $WithCtx(context),false)
                case 'yield':
                    return new $AbstractExprCtx(new $YieldCtx(context),true)
                case 'del':
                    return new $AbstractExprCtx(new $DelCtx(context),true)
                case '@':
                    return new $DecoratorCtx(context)
                case 'eol':
                    if(context.tree.length == 0){ // might be the case after a :
                        context.node.parent.children.pop()
                        return context.node.parent.context
                    }
                    return context
            }
            console.log('syntax error', 'token', token, 'after', context)
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'not':
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
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case '.':
                case 'not':
                case 'lamdba':
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
        case 'op':
            if(context.op === undefined){
                $_SyntaxError(context,['context op undefined ' + context])
            }
            if(context.op.substr(0,5) == 'unary' && token != 'eol'){
                if(context.parent.type == 'assign' ||
                        context.parent.type == 'return'){
                    // create and return a tuple whose first element is context
                    context.parent.tree.pop()
                    var t = new $ListOrTupleCtx(context.parent, 'tuple')
                    t.tree.push(context)
                    context.parent = t
                    return t
                }
            }

            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case '.':
                case 'not':
                case 'lamdba':
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
        case 'packed':
            if(token == 'id'){
                new $IdCtx(context, value)
                context.parent.expect = ','
                return context.parent
            }else if(token=="["){
                context.parent.expect = ','
                return new $ListOrTupleCtx(context, value)
            }
            console.log("syntax error", context, token)
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'pass':
            if(token == 'eol'){return context.parent}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'raise':
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
                    return $transition(context.parent, token)
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'return':
            return $transition(context.parent,token)
        case 'single_kw':
            if(token == ':'){return $BodyCtx(context)}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'slice':
            if(token == ":"){
                return new $AbstractExprCtx(context, false)
            }
            return $transition(context.parent, token, value)
        case 'star_arg':
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
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case 'not':
                case 'lamdba':
                    return $transition(new $AbstractExprCtx(context, false),
                        token, value)
                case ',':
                    return $transition(context.parent, token)
                case ')':
                    return $transition(context.parent, token)
                case ':':
                    if(context.parent.parent.type == 'lambda'){
                      return $transition(context.parent.parent, token)
                    }
            }
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'str':
            switch(token) {
                case '[':
                    return new $AbstractExprCtx(new $SubCtx(context.parent),
                        false)
                case '(':
                    // Strings are not callable. We replace the string by a call
                    // to an object that will raise the correct exception
                    context.parent.tree[0] = context
                    return new $CallCtx(context.parent)
                case 'str':
                    context.tree.push(value)
                    return context
            }
            return $transition(context.parent, token, value)
        case 'sub':
            // subscription x[a] or slicing x[a:b:c]
            switch(token) {
                case 'id':
                case 'imaginary':
                case 'int':
                case 'float':
                case 'str':
                case 'bytes':
                case '[':
                case '(':
                case '{':
                case '.':
                case 'not':
                case 'lamdba':
                    var expr = new $AbstractExprCtx(context,false)
                    return $transition(expr, token, value)
                case ']':
                    return context.parent
                case ':':
                    return new $AbstractExprCtx(new $SliceCtx(context), false)
                case ',':
                    return new $AbstractExprCtx(context, false)
            }
            console.log('syntax error', context, token)
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'target_list':
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
                        return new $PackedCtx(context)
                    }
                case '(':
                case '[':
                    if(context.expect == 'id'){
                      context.expect = ','
                      return new $TargetListCtx(context)
                    }
                case ')':
                case ']':
                    if(context.expect == ','){return context.parent}
                case ',':
                    if(context.expect == ','){
                        context.expect = 'id'
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
        case 'ternary':
            if(token == 'else'){
                context.in_else = true
                return new $AbstractExprCtx(context, false)
            }
            return $transition(context.parent, token, value)
        case 'try':
            if(token == ':'){return $BodyCtx(context)}
            $_SyntaxError(context, 'token ' + token + ' after ' + context)
        case 'unary':
            switch(token) {
                case 'int':
                case 'float':
                case 'imaginary':
                    // replace by real value of integer or float
                    // parent of context is a $ExprCtx
                    // grand-parent is a $AbstractExprCtx
                    // we remove the $ExprCtx and trigger a transition
                    // from the $AbstractExpCtx with an integer or float
                    // of the correct value
                    var expr = context.parent
                    context.parent.parent.tree.pop()
                    if(context.op == '-'){value = "-" + value}
                    else if(context.op == '~'){value = ~value}
                    return $transition(context.parent.parent, token, value)
                case 'id':
                    // replace by x.__neg__(), x.__invert__ or x.__pos__
                    context.parent.parent.tree.pop()
                    var expr = new $ExprCtx(context.parent.parent, 'call',
                        false)
                    var expr1 = new $ExprCtx(expr, 'id', false)
                    new $IdCtx(expr1,value) // create id
                    var repl = new $AttrCtx(expr)
                    if(context.op == '+'){repl.name = '__pos__'}
                    else if(context.op == '-'){repl.name = '__neg__'}
                    else{repl.name = '__invert__'}
                    // new context is the expression above the id
                    return expr1
                case 'op':
                    if('+' == value || '-' == value){
                       if(context.op === value){context.op = '+'}
                       else{context.op = '-'}
                       return context
                    }
            }
            return $transition(context.parent, token, value)
        case 'with':
            switch(token) {
                case 'id':
                    if(context.expect == 'id'){
                        context.expect = 'as'
                        return $transition(
                            new $AbstractExprCtx(context, false), token,
                                value)
                    }
                    if(context.expect == 'alias'){
                        if(context.parenth !== undefined){
                            context.expect = ','
                        }
                        else{context.expect = ':'}
                        context.set_alias(value)
                        return context
                    }
                    break
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
        case 'yield':
            if(token == 'from'){ // form "yield from <expr>"
                if(context.tree[0].type != 'abstract_expr'){
                    // 'from' must follow 'yield' immediately
                    $_SyntaxError(context, "'from' must follow 'yield'")
                }

                context.from = true
                $add_yield_from_code(context)
                return context.tree[0]
            }
            return $transition(context.parent, token)
    }
}

// Names that can't be given to variable names or attributes
$B.forbidden = ["alert", "arguments", "case", "catch", "constructor", "Date",
    "delete", "default", "document", "enum", "eval", "extends", "Error",
    "history", "function", "length", "location", "Math", "new", "null",
    "Number", "RegExp", "super", "this","throw", "var", "window",
    "toLocaleString", "toString", "message"]
$B.aliased_names = $B.list2obj($B.forbidden)

var s_escaped = 'abfnrtvxuU"0123456789' + "'" + '\\',
    is_escaped = {}
for(var i = 0; i < s_escaped.length; i++){
    is_escaped[s_escaped.charAt(i)] = true
}


var $tokenize = $B.parser.$tokenize = function(root, src) {
    var br_close = {")": "(", "]": "[", "}": "{"},
        br_stack = "",
        br_pos = []
    var kwdict = [
        "class", "return", "break", "for", "lambda", "try", "finally",
        "raise", "def", "from", "nonlocal", "while", "del", "global",
        "with", "as", "elif", "else", "if", "yield", "assert", "import",
        "except", "raise", "in", "pass", "with", "continue", "__debugger__",
        "async", "await"
        ]
    var unsupported = []
    var $indented = [
        "class", "def", "for", "condition", "single_kw", "try", "except",
        "with"
    ]
    // from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words

    var int_pattern = new RegExp("^\\d[0-9_]*(j|J)?"),
        float_pattern1 = new RegExp("^\\d[0-9_]*\\.\\d*([eE][+-]?\\d+)?(j|J)?"),
        float_pattern2 = new RegExp("^\\d[0-9_]*([eE][+-]?\\d+)(j|J)?"),
        hex_pattern = new RegExp("^0[xX]([0-9a-fA-F_]+)"),
        octal_pattern = new RegExp("^0[oO]([0-7_]+)"),
        binary_pattern = new RegExp("^0[bB]([01_]+)")

    var context = null
    var new_node = new $Node(),
        current = root,
        name = "",
        _type = null,
        pos = 0,
        indent = null,
        string_modifier = false

    var module = root.module

    var lnum = 1
    while(pos < src.length){
        var car = src.charAt(pos)
        // build tree structure from indentation
        if(indent === null){
            var indent = 0
            while(pos < src.length){
                var _s = src.charAt(pos)
                if(_s == " "){indent++; pos++}
                else if(_s == "\t"){
                    // tab : fill until indent is multiple of 8
                    indent++; pos++
                    if(indent % 8 > 0){indent += 8 - indent % 8}
                }else{break}
            }
            // ignore empty lines
            var _s = src.charAt(pos)
            if(_s == '\n'){pos++; lnum++; indent = null; continue}
            else if(_s == '#'){ // comment
                var offset = src.substr(pos).search(/\n/)
                if(offset == -1){break}
                pos += offset + 1
                lnum++
                indent = null
                continue
            }
            new_node.indent = indent
            new_node.line_num = lnum
            new_node.module = module

            // attach new node to node with indentation immediately smaller
            if(indent > current.indent){
                // control that parent ended with ':'
                if(context !== null){
                    if($indented.indexOf(context.tree[0].type) == -1){
                        $pos = pos
                        $_SyntaxError(context, 'unexpected indent', pos)
                    }
                }
                // add a child to current node
                current.add(new_node)
            }else if(indent <= current.indent && context && context.tree[0] &&
                    $indented.indexOf(context.tree[0].type) > -1 &&
                    context.tree.length < 2){
                $pos = pos
                $_SyntaxError(context, 'expected an indented block',pos)
            }else{ // same or lower level
                while(indent !== current.indent){
                    current = current.parent
                    if(current === undefined || indent > current.indent){
                        $pos = pos
                        $_SyntaxError(context, 'unexpected indent', pos)
                    }
                }
                current.parent.add(new_node)
            }
            current = new_node
            context = new $NodeCtx(new_node)
            continue
        }
        // comment
        if(car == "#"){
            var end = src.substr(pos + 1).search('\n')
            if(end == -1){end = src.length - 1}
            // Keep track of comment positions
            root.comments.push([pos, end])
            pos += end + 1
            continue
        }
        // string
        if(car == '"' || car == "'"){
            var raw = context.type == 'str' && context.raw,
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
                        bytes = true; raw = true
                        break
                    case 'f':
                        fstring = true
                        sm_length = 1
                        break
                    case 'fr', 'rf':
                        fstring = true
                        sm_length = 2
                        raw = true
                        break
                }
                string_modifier = false
            }
            if(src.substr(pos, 3) == car + car + car){
                _type = "triple_string"
                end = pos + 3
            }else{
                _type = "string"
                end = pos + 1
            }
            var escaped = false,
                zone = car,
                found = false
            while(end < src.length){
                if(escaped){
                    zone += src.charAt(end)
                    if(raw && src.charAt(end) == '\\'){zone += '\\'}
                    escaped = false
                    end++
                }else if(src.charAt(end) == "\\"){
                    if(raw){
                        if(end < src.length - 1 &&
                                src.charAt(end + 1) == car){
                            zone += '\\\\' + car
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
                            lnum++
                        }else if(src.substr(end + 1, 2) == 'N{'){
                            // Unicode literal ?
                            var end_lit = end + 3,
                                re = new RegExp("[-A-Z0-9 ]+"),
                                search = re.exec(src.substr(end_lit))
                            if(search === null){
                                $_SyntaxError(context,"(unicode error) " +
                                    "malformed \\N character escape", pos)
                            }
                            var end_lit = end_lit + search[0].length
                            if(src.charAt(end_lit) != "}"){
                                $_SyntaxError(context, "(unicode error) " +
                                    "malformed \\N character escape", pos)
                            }
                            var description = search[0]
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
                                    description + "$", "m")
                                search = re.exec($B.unicodedb)
                                if(search === null){
                                    $_SyntaxError(context,"(unicode error) " +
                                        "unknown Unicode character name",pos)
                                }
                                if(search[1].length == 4){
                                    zone += "\\u" + search[1]
                                    end = end_lit + 1
                                }else{
                                    end++
                                }
                            }else{
                                end++
                            }
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
                }else if(src.charAt(end) == '\n' && _type != 'triple_string'){
                    // In a string with single quotes, line feed not following
                    // a backslash raises SyntaxError
                    $pos = end
                    $_SyntaxError(context, ["EOL while scanning string literal"])
                }else if(src.charAt(end) == car){
                    if(_type == "triple_string" &&
                            src.substr(end, 3) != car + car + car){
                        zone += src.charAt(end)
                        end++
                    }else{
                        found = true
                        // end of string
                        $pos = pos
                        // Escape quotes inside string, except if they are
                        // already escaped.
                        // In raw mode, always escape.
                        var $string = zone.substr(1), string = ''
                        for(var i = 0; i < $string.length; i++){
                            var $car = $string.charAt(i)
                            if($car == car &&
                                    (raw || (i == 0 ||
                                        $string.charAt(i - 1) != '\\'))){
                                string += '\\'
                            }
                            string += $car
                        }
                        if(fstring){
                            try{
                                var re = new RegExp("\\\\" + car, "g"),
                                    string_no_bs = string.replace(re, car)
                                var elts = $B.parse_fstring(string_no_bs) // in py_string.js
                            }catch(err){
                                $_SyntaxError(context, [err.toString()])
                            }
                        }

                        if(bytes){
                            context = $transition(context, 'str',
                                'b' + car + string + car)
                        }else if(fstring){
                            $pos -= sm_length
                            context = $transition(context, 'str', elts)
                            $pos += sm_length
                        }else{
                            context = $transition(context, 'str',
                                car + string + car)
                        }
                        context.raw = raw;
                        pos = end + 1
                        if(_type == "triple_string"){
                            pos = end + 3
                        }
                        break
                    }
                }else{
                    zone += src.charAt(end)
                    if(src.charAt(end) == '\n'){lnum++}
                    end++
                }
            }
            if(!found){
                if(_type === "triple_string"){
                    $_SyntaxError(context, "Triple string end not found")
                }else{
                    $_SyntaxError(context, "String end not found")
                }
            }
            continue
        }
        // identifier ?
        if(name == "" && car != '$'){
            // regexIdentifier is defined in brython_builtins.js. It is a
            // regular expression that matches all the valid Python
            // identifier names, including those in non-latin writings (cf
            // issue #358)
            if($B.regexIdentifier.exec(car)){
                name = car // identifier start
                var p0 = pos
                pos++
                while(pos < src.length &&
                        $B.regexIdentifier.exec(src.substring(p0, pos + 1))){
                    name += src.charAt(pos)
                    pos++
                }
            }
            if(name){
                if(kwdict.indexOf(name) > -1){
                    $pos = pos - name.length
                    if(unsupported.indexOf(name) > -1){
                        $_SyntaxError(context,
                            "Unsupported Python keyword '" + name + "'")
                    }
                    context = $transition(context, name)
                }else if(typeof $operators[name] == 'string'){
                    // Literal operators : "and", "or", "is", "not"
                    // The additional test is to exclude the name "constructor"
                    if(name == 'is'){
                        // if keyword is "is", see if it is followed by "not"
                        var re = /^\s+not\s+/
                        var res = re.exec(src.substr(pos))
                        if(res !== null){
                            pos += res[0].length
                            $pos = pos - name.length
                            context = $transition(context, 'op', 'is_not')
                        }else{
                            $pos = pos - name.length
                            context = $transition(context, 'op', name)
                        }
                    }else if(name == 'not'){
                        // if keyword is "not", see if it is followed by "in"
                        var re = /^\s+in\s+/
                        var res = re.exec(src.substr(pos))
                        if(res !== null){
                            pos += res[0].length
                            $pos = pos - name.length
                            context = $transition(context, 'op', 'not_in')
                        }else{
                            $pos = pos - name.length
                            context = $transition(context, name)
                        }
                    }else{
                        $pos = pos - name.length
                        context = $transition(context, 'op', name)
                    }
                }else if((src.charAt(pos) == '"' || src.charAt(pos) == "'")
                        && ['r', 'b', 'u', 'rb', 'br', 'f', 'fr', 'rf'].
                            indexOf(name.toLowerCase()) !== -1){
                    string_modifier = name.toLowerCase()
                    name = ""
                    continue
                }else{
                    if($B.forbidden.indexOf(name) > -1){name = '$$' + name}
                    $pos = pos - name.length
                    context = $transition(context, 'id', name)
                }
                name = ""
                continue
            }
        }

        function rmu(numeric_literal){
            // Remove underscores inside a numeric literal (PEP 515)
            return numeric_literal.replace(/_/g, "")
        }

        switch(car) {
            case ' ':
            case '\t':
                pos++
                break
            case '.':
                // point, ellipsis (...)
                if(pos < src.length - 1 && /^\d$/.test(src.charAt(pos + 1))){
                    // number starting with . : add a 0 before the point
                    var j = pos + 1
                    while(j < src.length &&
                        src.charAt(j).search(/\d|e|E/) > -1){j++}
                    context = $transition(context, 'float',
                        '0' + src.substr(pos, j - pos))
                    pos = j
                    break
                }
                $pos = pos
                context = $transition(context, '.')
                pos++
                break
            case '0':
              // octal, hexadecimal, binary
              var res = hex_pattern.exec(src.substr(pos))
              if(res){
                  context = $transition(context, 'int', [16, rmu(res[1])])
                  pos += res[0].length
                  break
              }
              var res = octal_pattern.exec(src.substr(pos))
              if(res){
                  context = $transition(context, 'int', [8, rmu(res[1])])
                  pos += res[0].length
                  break
              }
              var res = binary_pattern.exec(src.substr(pos))
              if(res){
                  context = $transition(context, 'int', [2, rmu(res[1])])
                  pos += res[0].length
                  break
              }
              // literal like "077" is not valid in Python3
              if(src.charAt(pos + 1).search(/\d/) > -1){
                  // literal like "000" is valid in Python3
                  if(parseInt(src.substr(pos)) === 0){
                      res = int_pattern.exec(src.substr(pos))
                      $pos = pos
                      context = $transition(context, 'int',
                          [10, rmu(res[0])])
                      pos += res[0].length
                      break
                  }else{$_SyntaxError(context,
                      'invalid literal starting with 0')}
              }
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                // digit
                var res = float_pattern1.exec(src.substr(pos))
                if(res){
                    $pos = pos
                    if(res[2] !== undefined){
                        context = $transition(context, 'imaginary',
                            rmu(res[0].substr(0,res[0].length - 1)))
                    }else{context = $transition(context, 'float', rmu(res[0]))}
                }else{
                    res = float_pattern2.exec(src.substr(pos))
                    if(res){
                        $pos = pos
                        if(res[2] !== undefined){
                            context = $transition(context, 'imaginary',
                                rmu(res[0].substr(0,res[0].length - 1)))
                        }else{context = $transition(context, 'float', rmu(res[0]))}
                    }else{
                        res = int_pattern.exec(src.substr(pos))
                        $pos = pos
                        if(res[1] !== undefined){
                            context = $transition(context, 'imaginary',
                                rmu(res[0].substr(0, res[0].length - 1)))
                        }else{
                            context = $transition(context, 'int',
                                [10, rmu(res[0])])
                         }
                    }
                }
                pos += res[0].length
                break
            case '\n':
                // line end
                lnum++
                if(br_stack.length > 0){
                    // implicit line joining inside brackets
                    pos++
                }else{
                    if(current.context.tree.length > 0){
                        $pos = pos
                        context = $transition(context, 'eol')
                        indent = null
                        new_node = new $Node()
                    }else{
                        new_node.line_num = lnum
                    }
                    pos++
                }
                break
            case '(':
            case '[':
            case '{':
                br_stack += car
                br_pos[br_stack.length - 1] = [context, pos]
                $pos = pos
                context = $transition(context, car)
                pos++
                break
            case ')':
            case ']':
            case '}':
                if(br_stack == ""){
                    $_SyntaxError(context, "Unexpected closing bracket")
                }else if(br_close[car] !=
                        br_stack.charAt(br_stack.length - 1)){
                    $_SyntaxError(context,"Unbalanced bracket")
                }else{
                    br_stack = br_stack.substr(0, br_stack.length - 1)
                    $pos = pos
                    context = $transition(context, car)
                    pos++
                }
                break
            case '=':
                if(src.charAt(pos + 1) != "="){
                    $pos = pos
                    context = $transition(context, '=')
                    pos++
                }else{
                    $pos = pos
                    context = $transition(context, 'op', '==')
                    pos += 2
                }
                break
            case ',':
            case ':':
                $pos = pos
                context = $transition(context, car)
                pos++
                break
            case ';':
                $transition(context, 'eol') // close previous instruction
                // create a new node, at the same level as current's parent
                if(current.context.tree.length == 0){
                    // consecutive ; are not allowed
                    $pos = pos
                    $_SyntaxError(context, 'invalid syntax')
                }
                // if ; ends the line, ignore it
                var pos1 = pos + 1
                var ends_line = false
                while(pos1 < src.length){
                    var _s = src.charAt(pos1)
                    if(_s == '\n' || _s == '#'){ends_line = true; break}
                    else if(_s == ' '){pos1++}
                    else{break}
                }
                if(ends_line){pos++; break}

                new_node = new $Node()
                new_node.indent = $get_node(context).indent
                new_node.line_num = lnum
                new_node.module = module
                $get_node(context).parent.add(new_node)
                current = new_node
                context = new $NodeCtx(new_node)
                pos++
                break
            case '/':
            case '%':
            case '&':
            case '>':
            case '<':
            case '-':
            case '+':
            case '*':
            case '@':
            case '/':
            case '^':
            case '=':
            case '|':
            case '~':
            case '!':
                // Operators

                // Special case for annotation syntax
                if(car == '-' && src.charAt(pos + 1) == '>'){
                    context = $transition(context, 'annotation')
                    pos += 2
                    continue
                }

                // Special case for @ : decorator if it's the first character
                // in the instruction
                if(car == '@' && context.type == "node"){
                    $pos = pos
                    context = $transition(context, car)
                    pos++
                    break
                }

                // find longest match
                var op_match = ""
                for(var op_sign in $operators){
                    if(op_sign == src.substr(pos, op_sign.length)
                            && op_sign.length > op_match.length){
                        op_match = op_sign
                    }
                }
                $pos = pos
                if(op_match.length > 0){
                    if(op_match in $augmented_assigns){
                        context = $transition(context, 'augm_assign', op_match)
                    }else{
                        context = $transition(context, 'op', op_match)
                    }
                    pos += op_match.length
                }else{
                    $_SyntaxError(context, 'invalid character: ' + car)
                }
                break
            case '\\':
                if(src.charAt(pos + 1) == '\n'){
                  lnum++
                  pos += 2
                  break
                }
            default:
                $pos = pos
                $_SyntaxError(context, 'unknown token [' + car + ']')
        }
    }

    if(br_stack.length != 0){
        var br_err = br_pos[0]
        $pos = br_err[1]
        $_SyntaxError(br_err[0],
            ["Unbalanced bracket " + br_stack.charAt(br_stack.length - 1)])
    }
    if(context !== null && context.tree[0] && $indented.indexOf(context.tree[0].type) > -1){
        $pos = pos - 1
        $_SyntaxError(context, 'expected an indented block', pos)
    }

}

var $create_root_node = $B.parser.$create_root_node = function(src, module,
        locals_id, parent_block, line_info){
    var root = new $Node('module')
    root.module = module
    root.id = locals_id
    root.binding = {
        __doc__: true,
        __name__: true,
        __file__: true,
        __package__: true,
        __annotations__: true
    }

    root.parent_block = parent_block
    root.line_info = line_info
    root.indent = -1
    root.comments = []
    root.imports = {}
    if(typeof src == "object"){
        root.is_comp = src.is_comp
        src = src.src
    }
    root.src = src
    return root
}

$B.py2js = function(src, module, locals_id, parent_scope, line_info){
    // src = Python source (string)
    // module = module name (string)
    // locals_id = the id of the block that will be created
    // parent_scope = the scope where the code is created
    // line_info = [line_num, parent_block_id] if debug mode is set
    //
    // Returns a tree structure representing the Python source code

    if(typeof module == "object"){
        var __package__ = module.__package__
        module = module.__name__
    }else{
        var __package__ = ""
    }

    parent_scope = parent_scope || $B.builtins_scope

    var t0 = new Date().getTime(),
        is_comp = false

    if(typeof src == 'object'){
        is_comp = src.is_comp
        src = src.src
    }

    // Normalise line ends and script end
    src = src.replace(/\r\n/gm, "\n")
    if(src.charAt(src.length - 1) != "\n"){src += "\n"}

    var locals_is_module = Array.isArray(locals_id)
    if(locals_is_module){
        locals_id = locals_id[0]
    }
    var internal = locals_id.charAt(0) == '$'

    var local_ns = '$locals_' + locals_id.replace(/\./g,'_')

    var global_ns = '$locals_' + module.replace(/\./g,'_')

    $B.$py_src[locals_id] = src
    var root = $create_root_node({src: src, is_comp: is_comp},
        module, locals_id, parent_scope, line_info)
    $tokenize(root, src)
    root.is_comp = is_comp
    root.transform()

    // Create internal variables
    var js = ['var $B = __BRYTHON__;\n'], pos = 1

    js[pos++] = 'var $bltns = __BRYTHON__.InjectBuiltins();eval($bltns);\n\n'

    js[pos] = 'var '
    if(locals_is_module){
        js[pos] += local_ns + ' = $locals_' + module + ', '
    }else if(!internal){
        js[pos] += local_ns + ' = $B.imported["' + locals_id + '"] || {}, '
    }
    js[pos] += '$locals = ' + local_ns + ';'

    var offset = 0

    root.insert(0, $NodeJS(js.join('')))
    offset++

    // set attribute $src of module object to Python source
    root.insert(offset++, $NodeJS(global_ns +
        ".$src = " + global_ns + ".$src || $B.$py_src['" +
        module +"']; delete $B.$py_src['" + module +
        "'];"))

    // module doc string
    root.insert(offset++,
        $NodeJS(local_ns + '["__doc__"] = ' + (root.doc_string || 'None') +
            ';'))

    // name
    root.insert(offset++,
        $NodeJS(local_ns + '["__name__"] = ' + local_ns +
            '["__name__"] || "' + locals_id + '";'))

    // package, if available
    root.insert(offset++,
        $NodeJS(local_ns + '["__package__"] = "' + __package__ +'"'))

    // annotations
    root.insert(offset++,
        $NodeJS('$locals.__annotations__ = _b_.dict.$factory()'))

    // file
    root.insert(offset++,
        $NodeJS(local_ns + '["__file__"] = "' + $B.$py_module_path[module] +
            '";None;\n'))

    // if line_info is provided, store it
    if(line_info !== undefined){
        root.insert(offset++,
            $NodeJS(local_ns + '.$line = "' + line_info + '";None;\n'))
    }

    // Code to create the execution frame and store it on the frames stack
    var enter_frame_pos = offset,
        js = 'var $top_frame = ["' + locals_id.replace(/\./g, '_') + '", ' +
            local_ns + ', "' + module.replace(/\./g, '_') + '", ' +
            global_ns + ']; $B.frames_stack.push($top_frame); ' +
            'var $stack_length = $B.frames_stack.length;'
    root.insert(offset++, $NodeJS(js))

    // Wrap code in a try/finally to make sure we leave the frame
    var try_node = new $NodeJS('try'),
        children = root.children.slice(enter_frame_pos + 1,
            root.children.length)
    root.insert(enter_frame_pos + 1, try_node)

    // Add module body to the "try" clause
    if(children.length == 0){children = [$NodeJS('')]} // in case the script is empty
    children.forEach(function(child){
        try_node.add(child)
    })
    // add node to exit frame in case no exception was raised
    try_node.add($NodeJS('$B.leave_frame()'))

    root.children.splice(enter_frame_pos + 2, root.children.length)

    var catch_node = new $NodeJS('catch(err)')
    catch_node.add($NodeJS('$B.leave_frame()'))
    catch_node.add($NodeJS('throw err'))

    root.add(catch_node)

    if($B.profile > 0){$add_profile(root, null, module)}
    if($B.debug > 0){
        $add_line_num(root, null, module)
    }

    var t1 = new Date().getTime()
    if($B.debug >= 2){
        if(module == locals_id){
            console.log('module ' + module + ' translated in ' +
                (t1 - t0) + ' ms')
        }
    }

    $B.compile_time += t1 - t0

    return root
}

var brython = $B.parser.brython = function(options){

    // meta_path used in py_import.js
    if($B.meta_path === undefined){
        $B.meta_path = []
    }

    // Options passed to brython(), with default values
    $B.$options = {}

    // By default, only set debug level
    if(options === undefined){options = {'debug': 0}}

    // If the argument provided to brython() is a number, it is the debug
    // level
    if(typeof options == 'number'){options = {'debug': options}}
    if(options.debug === undefined){options.debug = 0}
    $B.debug = options.debug
    // set built-in variable __debug__
    _b_.__debug__ = $B.debug > 0

    $B.compile_time = 0

    if(options.profile === undefined){options.profile = 0}
    $B.profile = options.profile

    // For imports, default mode is to search modules of the standard library
    // using a static mapping stored in stdlib_paths.js
    // This can be disabled by setting option "static_stdlib_import" to false
    if(options.static_stdlib_import === undefined){
        options.static_stdlib_import = true
    }
    $B.static_stdlib_import = options.static_stdlib_import

    // If options has an attribute "open", it will be used by the built-in
    // function open() - see py_builtin_functions.js
    if(options.open !== undefined){
        _b_.open = options.open
        console.log("DeprecationWarning: \'open\' option of \'brython\' "+
            "function will be deprecated in future versions of Brython.")
    }

    $B.$options = options

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
    // brython_dist.js has been loaded in the page. In this case we use the
    // Virtual File System (VFS)
    if($B.use_VFS){
        meta_path.push($B.$meta_path[0])
        path_hooks.push($B.$path_hooks[0])
    }

    if(options.static_stdlib_import !== false){
        // Add finder using static paths
        meta_path.push($B.$meta_path[1])
        // Remove /Lib and /libs in sys.path :
        // if we use the static list and the module
        // was not find in it, it's no use searching twice in the same place
        if($B.path.length > 3) {
            $B.path.shift()
            $B.path.shift()
        }
    }

    // Always use the defaut finder using sys.path
    meta_path.push($B.$meta_path[2])
    $B.meta_path = meta_path
    path_hooks.push($B.$path_hooks[1])
    $B.path_hooks = path_hooks

    // URL of the script where function brython() is called
    var $href = $B.script_path = _window.location.href,
        $href_elts = $href.split('/')
    $href_elts.pop()
    if(isWebWorker){$href_elts.pop()} // WebWorker script is in the web_workers subdirectory
    $B.curdir = $href_elts.join('/')

    // List of URLs where imported modules should be searched
    // A list can be provided as attribute of options
    if(options.pythonpath !== undefined){
        $B.path = options.pythonpath
        $B.$options.static_stdlib_import = false
    }

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
        options.python_paths.forEach(function(path){
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
            if(lang){_importlib.optimize_import_for_path(path, lang)}
        })
    }

    if(!isWebWorker){
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
            if(href.slice(-7).toLowerCase() == '.vfs.js' &&
                    (' ' + e.rel + ' ').indexOf(' prefetch ') != -1) {
                // Prefetch VFS file
                $B.path_importer_cache[href + '/'] =
                        $B.imported['_importlib'].VFSPathFinder.$factory(href)
            }
            var filetype = e.hreflang
            if(filetype){
                if(filetype.slice(0,2) == 'x-'){filetype = filetype.slice(2)}
                _importlib.optimize_import_for_path(e.href, filetype)
            }
        }
    }

    // Allow user to specify the re module they want to use as a default
    // Valid values are 'pyre' for pythons re module and
    // 'jsre' for brythons customized re module
    // Default is for brython to guess which to use by looking at
    // complexity of the re pattern
    if(options.re_module !== undefined){
       if(options.re_module == 'pyre' || options.re_module == 'jsre'){
          $B.$options.re = options.re
       }
       console.log("DeprecationWarning: \'re_module\' option of \'brython\' "+
           "function will be deprecated in future versions of Brython.")
    }

    if($B.$options.args){
        $B.__ARGV = $B.$options.args
    }else{
        $B.__ARGV = _b_.list.$factory([])
    }
    if(!isWebWorker){
        _run_scripts(options)
    }
}

var idb_cx

function idb_load(evt, module){
    // Callback function of a request to the indexedDB database with a module
    // name as key.
    // If the module is precompiled and its timestamp is the same as in
    // brython_stdlib, use the precompiled Javascript.
    // Otherwise, get the source code from brython_stdlib.js.

    var res = evt.target.result

    var timestamp = $B.timestamp

    if($B.VFS_timestamp && $B.VFS_timestamp > $B.timestamp){
        // A VFS created by python -m brython --modules has its own
        // timestamp. If it is after the one in brython.js, use it
        $B.timestamp = $B.VFS_timestamp
    }

    if(res === undefined || res.timestamp != $B.timestamp){
        // Not found or not with the same date as in brython_stdlib.js:
        // search in VFS
        if($B.VFS[module] !== undefined){
            var elts = $B.VFS[module],
                ext = elts[0],
                source = elts[1],
                is_package = elts.length == 4,
                __package__
            if(ext==".py"){
                // Store Javascript translation in indexedDB

                // Temporarily set $B.imported[module] for relative imports
                if(is_package){__package__ = module}
                else{
                    var parts = module.split(".")
                    parts.pop()
                    __package__ = parts.join(".")
                }
                $B.imported[module] = $B.module.$factory(module, "",
                    __package__)
                try{
                    var root = $B.py2js(source, module, module),
                        js = root.to_js()
                }catch(err){
                    handle_error(err)
                    throw err
                }
                // Delete temporary import
                delete $B.imported[module]

                var imports = elts[2]
                imports = imports.join(",")
                $B.tasks.splice(0, 0, [store_precompiled,
                    module, js, imports, is_package])
            }else{
                console.log('bizarre', module, ext)
            }
        }else{
            // Module not found : do nothing
        }
    }else{
        // Precompiled Javascript found in indexedDB database.
        if(res.is_package){
            $B.precompiled[module] = [res.content]
        }else{
            $B.precompiled[module] = res.content
        }
        if(res.imports.length > 0){
            // res.impots is a string with the modules imported by the current
            // modules, separated by commas
            var subimports = res.imports.split(",")
            for(var i = 0; i < subimports.length; i++){
                var subimport = subimports[i]
                if(subimport.startsWith(".")){
                    // Relative imports
                    var url_elts = module.split("."),
                        nb_dots = 0
                    while(subimport.startsWith(".")){
                        nb_dots++
                        subimport = subimport.substr(1)
                    }
                    var elts = url_elts.slice(0, nb_dots)
                    if(subimport){
                        elts = elts.concat([subimport])
                    }
                    subimport = elts.join(".")
                }
                if(!$B.imported.hasOwnProperty(subimport) &&
                        !$B.precompiled.hasOwnProperty(subimport)){
                    // If the code of the required module is not already
                    // loaded, add a task for this.
                    if($B.VFS.hasOwnProperty(subimport)){
                        var submodule = $B.VFS[subimport],
                            ext = submodule[0],
                            source = submodule[1]
                        if(submodule[0] == ".py"){
                            $B.tasks.splice(0, 0, [idb_get, subimport])
                        }else{
                            add_jsmodule(subimport, source)
                        }
                    }
                }
            }
        }
    }
    loop()
}

function store_precompiled(module, js, imports, is_package){
    // Sends a request to store the compiled Javascript for a module.
    var db = idb_cx.result,
        tx = db.transaction("modules", "readwrite"),
        store = tx.objectStore("modules"),
        cursor = store.openCursor(),
        data = {"name": module, "content": js,
            "imports": imports,
            "timestamp": __BRYTHON__.timestamp,
            "is_package": is_package},
        request = store.put(data)
    request.onsuccess = function(evt){
        // Restart the task "idb_get", knowing that this time it will use
        // the compiled version.
        $B.tasks.splice(0, 0, [idb_get, module])
        loop()
    }
}


function idb_get(module){
    // Sends a request to the indexedDB database for the module name.
    var db = idb_cx.result,
        tx = db.transaction("modules", "readonly")

    try{
        var store = tx.objectStore("modules")
            req = store.get(module)
        req.onsuccess = function(evt){idb_load(evt, module)}
    }catch(err){
        console.log('error', err)
    }
}

$B.idb_open = function(obj){
    idb_cx = indexedDB.open("brython_stdlib")
    idb_cx.onsuccess = function(){
        var db = idb_cx.result
        if(!db.objectStoreNames.contains("modules")){
            var version = db.version
            db.close()
            console.log('create object store', version)
            idb_cx = indexedDB.open("brython_stdlib", version+1)
            idb_cx.onupgradeneeded = function(){
                console.log("upgrade needed")
                var db = idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = loop
            }
            idb_cx.onversionchanged = function(){
                console.log("version changed")
            }
            idb_cx.onsuccess = function(){
                console.log("db opened", idb_cx)
                var db = idb_cx.result,
                    store = db.createObjectStore("modules", {"keyPath": "name"})
                store.onsuccess = loop
            }
        }else{
            console.log("using indexedDB for stdlib modules cache")
            loop()
        }
    }
    idb_cx.onupgradeneeded = function(){
        console.log("upgrade needed")
        var db = idb_cx.result,
            store = db.createObjectStore("modules", {"keyPath": "name"})
        store.onsuccess = loop
    }
    idb_cx.onerror = function(){
        console.log('erreur open')
    }
}

function ajax_load_script(script){
    var url = script.url,
        name = script.name
    var req = new XMLHttpRequest()
    req.open("GET", url + "?" + Date.now(), true)
    req.onreadystatechange = function(){
        if(this.readyState==4){
            if(this.status==200){
                var src = this.responseText
                try{
                    var root = $B.py2js(src, name, name),
                    js = root.to_js()
                    $B.tasks.splice(0, 0, ["execute",
                        {js: js, src: src, name: name, url: url}])
                    root = null
                }catch(err){
                    handle_error(err)
                }
            }else if(this.status==404){
                throw Error(url+" not found")
            }
            loop()
        }
    }
    req.send()
}

function add_jsmodule(module, source){
    // Use built-in Javascript module
    source += "\nvar $locals_" +
        module.replace(/\./g, "_") + " = $module"
    $B.precompiled[module] = source
}

var inImported = $B.inImported = function(module){
    if($B.imported.hasOwnProperty(module)){
        // already imported, do nothing
    }else if(__BRYTHON__.VFS && __BRYTHON__.VFS.hasOwnProperty(module)){
        var elts = __BRYTHON__.VFS[module]
        if(elts === undefined){console.log('bizarre', module)}
        var ext = elts[0],
            source = elts[1],
            is_package = elts.length == 4
        if(ext==".py"){
            $B.tasks.splice(0, 0, [idb_get, module])
        }else{
            add_jsmodule(module, source)
        }
    }else{
        console.log("bizarre", module)
    }
    loop()
}

var loop = $B.loop = function(){
    if($B.tasks.length==0){
        // No more task to process.
        if(idb_cx){idb_cx.result.close()}
        return
    }
    var task = $B.tasks.shift(),
        func = task[0],
        args = task.slice(1)

    if(func == "execute"){
        try{
            var script = task[1],
                src = script.src,
                name = script.name,
                url = script.url,
                js = script.js
            new Function(js)()
        }catch(err){
            if($B.debug > 1){
                console.log(err)
                for(var attr in err){
                   console.log(attr+' : ', err[attr])
                }
            }

            // If the error was not caught by the Python runtime, build an
            // instance of a Python exception
            if(err.$py_error === undefined){
                console.log('Javascript error', err)
                err = _b_.RuntimeError.$factory(err+'')
            }

            handle_error(err)
        }
        loop()
    }else{
        // Run function with arguments
        func.apply(null, args)
    }
}

$B.tasks = []
$B.has_indexedDB = window.indexedDB !== undefined

function handle_error(err){
    // Print the error traceback on the standard error stream
    if(err.__class__ !== undefined){
        var name = err.__class__.__name__,
            trace = _b_.getattr(err,'info')
        if(name=='SyntaxError' || name=='IndentationError'){
            var offset = err.args[3]
            trace += '\n    ' + ' '.repeat(offset) + '^' +
                '\n' + name+': '+err.args[0]
        }else{
            trace += '\n'+name+': ' + err.args
        }
    }else{
        console.log(err)
        trace = err + ""
    }
    try{
        _b_.getattr($B.stderr,'write')(trace)
    }catch(print_exc_err){
        console.log(trace)
    }
    // Throw the error to stop execution
    throw err
}

function required_stdlib_imports(imports, start){
    // Returns the list of modules from the standard library needed by
    // the modules in "imports"
    var nb_added = 0
    start = start || 0
    for(var i = start; i < imports.length; i++){
        var module = imports[i]
        if($B.imported.hasOwnProperty(module)){continue}
        var mod_obj = $B.VFS[module]
        if(mod_obj===undefined){console.log("undef", module)}
        if(mod_obj[0] == ".py"){
            var subimports = mod_obj[2] // list of modules needed by this mod
            subimports.forEach(function(subimport){
                if(!$B.imported.hasOwnProperty(subimport) &&
                        imports.indexOf(subimport) == -1){
                    if($B.VFS.hasOwnProperty(subimport)){
                        imports.push(subimport)
                        nb_added++
                    }
                }
            })
        }
    }
    if(nb_added){
        required_stdlib_imports(imports, imports.length - nb_added)
    }
    return imports
}

$B.run_script = function(src, name){
    $B.$py_module_path[name] = $B.script_path
    try{
        var root = $B.py2js(src, name, name),
            js = root.to_js(),
            script = {
                js: js,
                name: name,
                src: src,
                url: $B.script_path
            }
            if($B.debug > 1){$log(js)}
    }catch(err){
        handle_error(err)
    }
    if($B.hasOwnProperty("VFS") && $B.has_indexedDB){
        // Build the list of stdlib modules required by the
        // script
        var imports1 = Object.keys(root.imports).slice(),
            imports = imports1.filter(function(item){
                return $B.VFS.hasOwnProperty(item)})
        Object.keys(imports).forEach(function(name){
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
                    subimports.forEach(function(mod){
                        if(imports.indexOf(mod) == -1){
                            imports.push(mod)
                        }
                    })
                }
            }
        })
        // Add task to stack
        for(var j=0; j<imports.length;j++){
           $B.tasks.push([$B.inImported, imports[j]])
        }
        root = null
    }
    $B.tasks.push(["execute", script])
}

var $log = $B.$log = function(js){
    js.split("\n").forEach(function(line, i){
        console.log(i + 1, ":", line)
    })
}
var _run_scripts = $B.parser._run_scripts = function(options) {
    // Save initial Javascript namespace
    var kk = Object.keys(_window)

    // Option to run code on demand and not all the scripts defined in a page
    // The following lines are included to allow to run brython scripts in
    // the IPython/Jupyter notebook using a cell magic. Have a look at
    // https://github.com/kikocorreoso/brythonmagic for more info.
    if(options.ipy_id !== undefined){
        var $elts = []
        options.ipy_id.forEach(function(elt){
            $elts.push(document.getElementById(elt))
        })
    }else{
        var scripts = document.getElementsByTagName('script'),
            $elts = []
        // Freeze the list of scripts here ; other scripts can be inserted on
        // the fly by viruses
        for(var i = 0; i < scripts.length; i++){
            var script = scripts[i]
            if(script.type == "text/python" || script.type == "text/python3"){
                $elts.push(script)
            }
        }
    }

    // Get all scripts with type = text/python or text/python3 and run them

    var first_script = true, module_name
    if(options.ipy_id !== undefined){
        module_name = '__main__'
        var $src = "", js, root
        $B.$py_module_path[module_name] = $B.script_path
        $elts.forEach(function(elt){
            $src += (elt.innerHTML || elt.textContent)
        })
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
            var $trace = _b_.getattr($err,'info') + '\n' + $err.__name__ +
                ': ' + $err.args
            try{
                _b_.getattr($B.stderr, 'write')($trace)
            }catch(print_exc_err){
                console.log($trace)
            }
            // Throw the error to stop execution
            throw $err
        }
    }else{
        if($elts.length > 0){
            if($B.has_indexedDB && $B.hasOwnProperty("VFS")){
                $B.tasks.push([$B.idb_open])
            }
        }
        // Get all explicitely defined ids, to avoid overriding
        var defined_ids = {}
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
        var scripts = []
        for(var i = 0; i < $elts.length; i++){
            var elt = $elts[i]
            if(elt.type == "text/python" || elt.type == "text/python3"){
                // Set the module name, ie the value of the builtin variable
                // __name__.
                // If the <script> tag has an attribute "id", it is taken as
                // the module name.
                if(elt.id){module_name = elt.id}
                else{
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
                var $src = null
                if(elt.src){
                    // format <script type="text/python" src="python_script.py">
                    // get source code by an Ajax call
                    $B.tasks.push([ajax_load_script,
                        {name: module_name, url: elt.src}])
                }else{
                    // Get source code inside the script element
                    var src = (elt.innerHTML || elt.textContent)
                    // remove leading CR if any
                    src = src.replace(/^\n/, '')
                    $B.run_script(src, module_name)
                }
            }
        }
    }

    if(options.ipy_id === undefined){$B.loop()}

    /* Uncomment to check the names added in global Javascript namespace
    var kk1 = Object.keys(_window)
    for (var i  =0; i < kk1.length; i++){
        if(kk[i] === undefined){
            console.log(kk1[i])
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
