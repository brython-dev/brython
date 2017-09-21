// Python to Javascript translation engine

;(function($B){

var js,$pos,res,$op
var _b_ = $B.builtins
var _window = self;
var isWebWorker = $B.isa_web_worker = ('undefined' !== typeof WorkerGlobalScope) && ("function" === typeof importScripts) && (navigator instanceof WorkerNavigator);


/*
Utility functions
=================
*/

// Keys of an object
var keys = $B.keys = function(obj){
    var res = [], pos=0
    for(var attr in obj){res[pos++]=attr}
    res.sort()
    return res
}

// Return a clone of an object
var clone = $B.clone = function(obj){
    var res = {}
    for(var attr in obj){res[attr]=obj[attr]}
    return res
}

// Last element in a list
$B.last = function(table){return table[table.length-1]}

// Convert a list to an object indexed with list values
$B.list2obj = function(list, value){
    var res = {}, i = list.length
    if(value===undefined){value=true}
    while(i-->0){res[list[i]]=value}
    return res
}

/*
Internal variables
==================
*/

// Mapping between operators and special Python method names
var $operators = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift",
    "+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod","&=":"iand","|=":"ior","^=":"ixor",
    "+":"add","-":"sub","*":"mul",
    "/":"truediv","%":"mod","&":"and","|":"or","~":"invert",
    "^":"xor","<":"lt",">":"gt",
    "<=":"le",">=":"ge","==":"eq","!=":"ne",
    "or":"or","and":"and", "in":"in", "not": "not",
    "is":"is","not_in":"not_in","is_not":"is_not" // fake
}

// Mapping between augmented assignment operators and method names
var $augmented_assigns = $B.augmented_assigns = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod",
    "&=":"iand","|=":"ior","^=":"ixor"
}

// Names that can't be assigned to
var noassign = $B.list2obj(['True','False','None','__debug__'])

// Operators weight for precedence
var $op_order = [['or'],['and'],['not'],
    ['in','not_in'],
    ['<','<=','>','>=','!=','==','is','is_not'],
    ['|'],
    ['^'],
    ['&'],
    ['>>','<<'],
    ['+'],
    ['-'],
    ['*','/','//','%'],
    ['unary_neg','unary_inv','unary_pos'],
    ['**']
]

var $op_weight={}
var $weight=1
for (var $i=0;$i<$op_order.length;$i++){
    var _tmp=$op_order[$i]
    for(var $j=0;$j<_tmp.length;$j++){
        $op_weight[_tmp[$j]]=$weight
    }
    $weight++
}

// Variable used to generate random names used in loops
var $loop_num = 0

// Variable used for chained comparison
var chained_comp_num = 0

/*
Function called in case of SyntaxError
======================================
*/

function $_SyntaxError(context,msg,indent){
    //console.log('syntax error, context '+context,' msg ',msg)
    var ctx_node = context
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node,
        root = tree_node
    while(root.parent!==undefined){root=root.parent}
    var module = tree_node.module
    var line_num = tree_node.line_num
    if(root.line_info){
        line_num = root.line_info
    }
    if(indent!==undefined){line_num++}
    if(indent===undefined){
        if(Array.isArray(msg)){$B.$SyntaxError(module,msg[0],$pos)}
        if(msg==="Triple string end not found"){
            // add an extra argument : used in interactive mode to
            // prompt for the rest of the triple-quoted string
            $B.$SyntaxError(module,'invalid syntax : triple string end not found',$pos, line_num, root)
        }
        $B.$SyntaxError(module,'invalid syntax',$pos, line_num, root)
    }else{throw $B.$IndentationError(module,msg,$pos)}
}

/*
Class for Python abstract syntax tree
=====================================

An instance is created for the whole Python program as the root of the tree

For each instruction in the Python source code, an instance is created
as a child of the block where it stands : the root for instructions at
module level, or a function definition, a loop, a condition, etc.
*/

function $Node(type){
    this.type = type
    this.children=[]
    this.yield_atoms = []

    this.add = function(child){
        // Insert as the last child
        this.children[this.children.length]=child
        child.parent = this
        child.module = this.module
    }

    this.insert = function(pos,child){
        // Insert child at position pos
        this.children.splice(pos,0,child)
        child.parent = this
        child.module = this.module
    }

    this.toString = function(){return "<object 'Node'>"}

    this.show = function(indent){
        // For debugging purposes
        var res = ''
        if(this.type==='module'){
            for(var i=0;i<this.children.length;i++){
                res += this.children[i].show(indent)
            }
            return res
        }

        indent = indent || 0
        res += ' '.repeat(indent)
        res += this.context
        if(this.children.length>0) res += '{'
        res +='\n'
        for(var i=0;i<this.children.length;i++){
           res += '['+i+'] '+this.children[i].show(indent+4)
        }
        if(this.children.length>0){
          res += ' '.repeat(indent)
          res+='}\n'
        }
        return res
    }

    this.to_js = function(indent){
        // Convert the node into a string with the translation in Javascript

        if(this.js!==undefined) return this.js

        this.res = []
        var pos=0
        this.unbound = []
        if(this.type==='module'){
          for(var i=0;i<this.children.length;i++){
             this.res[pos++]=this.children[i].to_js()
             this.children[i].js_index = pos //this.res.length+0
          }
          this.js = this.res.join('')
          return this.js
        }
        indent = indent || 0
        var ctx_js = this.context.to_js()
        if(ctx_js){ // empty for "global x"
          this.res[pos++]=' '.repeat(indent)
          this.res[pos++]=ctx_js
          this.js_index = pos //this.res.length+0
          if(this.children.length>0) this.res[pos++]='{'
          this.res[pos++]='\n'
          for(var i=0;i<this.children.length;i++){
             this.res[pos++]=this.children[i].to_js(indent+4)
             this.children[i].js_index = pos //this.res.length+0
          }
          if(this.children.length>0){
             this.res[pos++]=' '.repeat(indent)
             this.res[pos++]='}\n'
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

        if(this.yield_atoms.length>0){
            // If the node contains 'yield' atoms, we must split the node into
            // several nodes
            // The line 'a = yield X' is transformed into 4 lines :
            //     $yield_value0 = X
            //     yield $yield_value0
            //     $yield_value0 = <value sent to generator > or None
            //     a = $yield_value

            // remove original line
            this.parent.children.splice(rank,1)
            var offset = 0
            for(var i=0;i<this.yield_atoms.length;i++){

                var atom = this.yield_atoms[i]

                if(atom.from){
                    // for "yield from" use the transform method of YieldCtx
                    atom.transform(this, rank)
                    continue
                }else{

                    // create a line to store the yield expression in a
                    // temporary variable
                    var temp_node = new $Node()
                    var js = 'var $yield_value'+$loop_num
                    js += '='+(this.yield_atoms[i].to_js() || 'None')
                    new $NodeJSCtx(temp_node,js)
                    this.parent.insert(rank+offset, temp_node)

                    // create a node to yield the yielded value
                    var yield_node = new $Node()
                    this.parent.insert(rank+offset+1, yield_node)
                    var yield_expr = new $YieldCtx(new $NodeCtx(yield_node))
                    new $StringCtx(yield_expr,'$yield_value'+$loop_num)

                    // create a node to set the yielded value to the last
                    // value sent to the generator, if any
                    var set_yield = new $Node()
                    set_yield.is_set_yield_value=true

                    // the JS code will be set in py_utils.$B.make_node
                    js = $loop_num
                    new $NodeJSCtx(set_yield,js)
                    this.parent.insert(rank+offset+2, set_yield)

                    // in the original node, replace yield atom by None
                    this.yield_atoms[i].to_js = (function(x){
                        return function(){return '$yield_value'+x}
                        })($loop_num)

                    $loop_num++
                    offset += 3
                }
          }
          // insert the original node after the yield nodes
          this.parent.insert(rank+offset, this)
          this.yield_atoms = []

          // Because new nodes were inserted in node parent, return the
          // offset for iteration on parent's children
          return offset+1
        }

        if(this.type==='module'){
          // module doc string
          this.doc_string = $get_docstring(this)
          var i=0
          while(i<this.children.length){
             var offset = this.children[i].transform(i)
             if(offset===undefined){offset=1}
             i += offset
          }
        }else{
          var elt=this.context.tree[0], ctx_offset
          if(elt.transform !== undefined){
              ctx_offset = elt.transform(this,rank)
          }
          var i=0
          while(i<this.children.length){
              var offset = this.children[i].transform(i)
              if(offset===undefined){offset=1}
              i += offset
          }
          if(ctx_offset===undefined){ctx_offset=1}

            if(this.context && this.context.tree!==undefined &&
                this.context.tree[0].type=="generator"){
                    var def_node = this,
                        def_ctx = def_node.context.tree[0]
                    var blocks = [],
                        node = def_node.parent_block,
                        is_comp = node.is_comp

                    while(true){
                        var node_id = node.id.replace(/\./g, '_'),
                            block = '"$locals_'+node_id+'": '
                        if(is_comp){
                            block += '$B.clone($locals_'+node_id+')'
                        }else{
                            block += '$locals_'+node_id
                        }
                        blocks.push(block)
                        node = node.parent_block
                        if(node===undefined || node.id == '__builtins__'){break}
                    }
                    blocks = '{'+blocks+'}'

                    var parent = this.parent
                    while(parent!==undefined && parent.id===undefined){
                        parent = parent.parent
                    }

                    var g = $B.$BRgenerator(def_ctx.name, blocks,
                        def_ctx.id, def_node),
                        block_id = parent.id.replace(/\./g, '_'),
                        name = def_ctx.decorated ? def_ctx.alias :
                            def_ctx.name+def_ctx.num,
                        res = 'var '+def_ctx.name+def_ctx.num + ' = '+
                            '$locals_'+block_id+'["'+def_ctx.name+
                            '"] = $B.genfunc("'+
                            def_ctx.name+'", '+blocks+',['+g+'],'+
                            def_ctx.default_str+')'
                    this.parent.children.splice(rank, 1)
                    this.parent.insert(rank+offset-1,
                        $NodeJS(res))
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

For context that need transforming the Python instruction into several
Javascript instructions, a method transform(node, rank) is defined. It is
called by the method transform() on the root node (the top level instance of
$Node).

Most contexts have a method to_js() that return the Javascript code for
this context. It is called by the method to_js() of the root node.
*/

function $AbstractExprCtx(context,with_commas){
    this.type = 'abstract_expr'
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return '(abstract_expr '+with_commas+') '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        if(this.type==='list') return '['+$to_js(this.tree)+']'
        return $to_js(this.tree)
    }
}

function $AliasCtx(context){
    // Class for context manager alias
    this.type = 'ctx_manager_alias'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length-1].alias = this
}

function $AnnotationCtx(context){
    // Class for annotations, eg "def f(x:int) -> list:"
    this.type = 'annotation'
    this.parent = context
    this.tree = []
    // annotation is stored in attribute "annotations" of parent, not "tree"
    context.annotation = this
    this.toString = function(){return '(annotation) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $AssertCtx(context){
    // Context for keyword "assert"
    this.type = 'assert'
    this.toString = function(){return '(assert) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.transform = function(node,rank){
        if(this.tree[0].type==='list_or_tuple'){
            // form "assert condition,message"
            var condition = this.tree[0].tree[0]
            var message = this.tree[0].tree[1]
        }else{
            var condition = this.tree[0]
            var message = null
        }
        // transform "assert cond" into "if not cond: throw AssertionError"
        var new_ctx = new $ConditionCtx(node.context,'if')
        var not_ctx = new $NotCtx(new_ctx)
        not_ctx.tree = [condition]
        node.context = new_ctx
        var new_node = new $Node()
        var js = 'throw AssertionError("AssertionError")'
        if(message !== null){
            js = 'throw AssertionError(str('+message.to_js()+'))'
        }
        new $NodeJSCtx(new_node,js)
        node.add(new_node)
    }
}

function $AssignCtx(context){ //, check_unbound){
    /*
    Class for the assignment operator "="
    context is the left operand of assignment
    check_unbound is used to check unbound local variables
    This check is done when the AssignCtx object is created, but must be
    disabled if a new AssignCtx object is created afterwards by method
    transform()
    */
    var ctx = context
    while(ctx){
        if(ctx.type=='assert'){$_SyntaxError(context,'invalid syntax - assign')}
        ctx = ctx.parent
    }

    this.type = 'assign'
    // replace parent by "this" in parent tree
    context.parent.tree.pop()
    context.parent.tree[context.parent.tree.length]=this

    this.parent = context.parent
    this.tree = [context]

    var scope = $get_scope(this),
        level = $get_level(this)

    if(context.type=='expr' && context.tree[0].type=='call'){
          $_SyntaxError(context,["can't assign to function call "])
    }else if(context.type=='list_or_tuple' ||
        (context.type=='expr' && context.tree[0].type=='list_or_tuple')){
        if(context.type=='expr'){context = context.tree[0]}
        // Bind all the ids in the list or tuple
        for(var name in context.ids()){
            $bind(name, scope.id, level)
        }
    }else if(context.type=='assign'){
        for(var i=0;i<context.tree.length;i++){
            var assigned = context.tree[i].tree[0]
            if(assigned.type=='id'){
                $bind(assigned.value, scope.id, level)
            }
        }
    }else{
        var assigned = context.tree[0]
        if(assigned && assigned.type=='id'){
            if(noassign[assigned.value]===true){
                $_SyntaxError(context,["can't assign to keyword"])
            }
            // Attribute bound of an id indicates if it is being
            // bound, as it is the case in the left part of an assignment
            assigned.bound = true
            if(!$B._globals[scope.id] ||
                $B._globals[scope.id][assigned.value]===undefined){
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
                node.bound_before = $B.keys($B.bound[scope.id])
                $bind(assigned.value, scope.id, level)
            }
        }
    }//if

    this.guess_type = function(){
        return
    }

    this.toString = function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}

    this.transform = function(node,rank){
        // rank is the rank of this line in node
        var scope = $get_scope(this)

        var left = this.tree[0],
            right = this.tree[1],
            assigned = []

        while(left.type=='assign'){
            assigned.push(left.tree[1])
            left = left.tree[0]
        }
        if(assigned.length>0){
            assigned.push(left)

            // replace current node by '$tempXXX = <right>'
            var ctx = node.context
            ctx.tree = []
            var nleft = new $RawJSCtx(ctx, 'var $temp'+$loop_num)
            nleft.tree = ctx.tree
            nassign = new $AssignCtx(nleft)
            nassign.tree[1] = right

            // create nodes with target set to right, from left to right
            for(var i=0;i<assigned.length;i++){
                var new_node = new $Node(),
                    node_ctx = new $NodeCtx(new_node)
                new_node.locals = node.locals
                node.parent.insert(rank+1,new_node)
                assigned[i].parent = node_ctx
                var assign = new $AssignCtx(assigned[i])
                new $RawJSCtx(assign, '$temp'+$loop_num)
            }
            $loop_num++
            return assigned.length-1
        }

        var left_items = null
        switch(left.type) {
          case 'expr':
            if(left.tree.length>1){
               left_items = left.tree
            } else if (left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list'){
              left_items = left.tree[0].tree
            }else if(left.tree[0].type=='id'){
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
        if(left_items===null) {return}
        var right = this.tree[1]

        var right_items = null
        if(right.type==='list'||right.type==='tuple'||
            (right.type==='expr' && right.tree.length>1)){
                right_items = right.tree
        }
        if(right_items!==null){ // form x,y=a,b
            if(right_items.length>left_items.length){
                throw Error('ValueError : too many values to unpack (expected '+left_items.length+')')
            }else if(right_items.length<left_items.length){
                throw Error('ValueError : need more than '+right_items.length+' to unpack')
            }
            var new_nodes = [], pos=0
            // replace original line by dummy line : the next one might also
            // be a multiple assignment
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'void(0)')
            new_nodes[pos++]=new_node

            var $var='$temp'+$loop_num
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'var '+$var+'=[], $pos=0')
            new_nodes[pos++]=new_node

            for(var i=0;i<right_items.length;i++){
                var js = $var+'[$pos++]='+right_items[i].to_js()
                var new_node = new $Node()
                new $NodeJSCtx(new_node,js)
                new_nodes[pos++]=new_node
            }
            for(var i=0;i<left_items.length;i++){
                var new_node = new $Node(),
                    this_node = $get_node(this)
                new_node.id = this_node.module
                new_node.locals = this.node.locals
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                // assignment to left operand
                // set "check_unbound" to false
                var assign = new $AssignCtx(left_items[i], false)
                assign.tree[1] = new $JSCode($var+'['+i+']')
                new_nodes[pos++]=new_node
            }
            node.parent.children.splice(rank,1) // remove original line
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
            }
            $loop_num++
        }else{ // form x,y=a

            // evaluate right argument (it might be a function call)
            var new_node = new $Node()

            // set attribute line_num for debugging
            new_node.line_num = node.line_num

            var rname = '$right'+$loop_num

            var js = 'var '+rname+' = getattr'
            js += '($B.$iter('+right.to_js()+'),"__next__");'
            new $NodeJSCtx(new_node,js)

            var new_nodes = [new_node], pos=1

            var rlist_node = new $Node()
            var rlname='$rlist'+$loop_num
            js = 'var '+rlname+'=[], $pos=0;'+'while(1){try{'+rlname+
                '[$pos++] = '+rname+'()}catch(err){break}};'
            new $NodeJSCtx(rlist_node, js)
            new_nodes[pos++]=rlist_node

            // If there is a packed tuple in the list of left items, store
            // its rank in the list
            var packed = null
            for(var i=0;i<left_items.length;i++){
                var expr = left_items[i]
                if(expr.type=='packed' ||
                  (expr.type=='expr' && expr.tree[0].type=='packed')){
                    packed = i
                    break
                }
            }

            // Test if there were enough values in the right part
            var check_node = new $Node()
            var min_length = left_items.length
            if(packed!==null){min_length--}
            js = 'if('+rlname+'.length<'+min_length+')'+
                 '{throw ValueError("need more than "+'+rlname+
                 '.length+" value" + ('+rlname+'.length>1 ?'+
                 ' "s" : "")+" to unpack")}'
            new $NodeJSCtx(check_node,js)
            new_nodes[pos++]=check_node

            // Test if there were enough variables in the left part
            if(packed==null){
                var check_node = new $Node()
                var min_length = left_items.length
                js = 'if('+rlname+'.length>'+min_length+')'+
                     '{throw ValueError("too many values to unpack '+
                     '(expected '+left_items.length+')")}'
                new $NodeJSCtx(check_node,js)
                new_nodes[pos++]=check_node
            }

            for(var i=0;i<left_items.length;i++){

                var new_node = new $Node()
                new_node.id = scope.id
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                var assign = new $AssignCtx(left_items[i], false) // assignment to left operand
                var js = rlname
                if(packed==null || i<packed){
                    js += '['+i+']'
                }else if(i==packed){
                    js += '.slice('+i+','+rlname+'.length-'+
                          (left_items.length-i-1)+')'
                }else{
                    js += '['+rlname+'.length-'+(left_items.length-i)+']'
                }
                assign.tree[1] = new $JSCode(js) // right part of the assignment
                new_nodes[pos++]=new_node
            }

            node.parent.children.splice(rank,1) // remove original line
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
            }
            $loop_num++
        }
    }
    this.to_js = function(){
        this.js_processed=true
        if(this.parent.type==='call'){// like in foo(x=0)
            return '{$nat:"kw",name:'+this.tree[0].to_js()+',value:'+this.tree[1].to_js()+'}'
        }

        // assignment
        var left = this.tree[0]
        if(left.type==='expr') left=left.tree[0]

        var right = this.tree[1]
        if(left.type == 'attribute' || left.type== 'sub'){
          // In case of an assignment to an attribute or a subscript, we
          // use setattr() and setitem
          // If the right part is a call to exec or eval, it must be
          // evaluated and stored in a temporary variable, before
          // setting the attribute to this variable
          // This is because the code generated for exec() or eval()
          // can't be inserted as the third parameter of a function

          var right_js = right.to_js()

          var res='', rvar='', $var='$temp'+$loop_num
          if(right.type=='expr' && right.tree[0]!==undefined &&
             right.tree[0].type=='call' &&
             ('eval' == right.tree[0].func.value ||
              'exec' == right.tree[0].func.value)) {
             res += 'var '+$var+'='+right_js+';\n'
             rvar = $var
          }else if(right.type=='expr' && right.tree[0]!==undefined &&
              right.tree[0].type=='sub'){
             res += 'var '+$var+'='+right_js+';\n'
             rvar = $var
          }else{
             rvar = right_js
          }

          if(left.type==='attribute'){ // assign to attribute
              $loop_num++
              left.func = 'setattr'
              res += left.to_js()
              left.func = 'getattr'
              res = res.substr(0,res.length-1) // remove trailing )
              return res + ','+rvar+');None;'
          }
          if(left.type==='sub'){ // assign to item

              var seq = left.value.to_js(), temp='$temp'+$loop_num, type
              if(left.value.type=='id'){
                  type = $get_node(this).locals[left.value.value]
              }
              $loop_num++
              var res = 'var '+temp+'='+seq+'\n'
              if(type!=='list'){
                  res += 'if(Array.isArray('+temp+') && !'+temp+'.__class__){'
              }
              if(left.tree.length==1){
                  res += '$B.set_list_key('+temp+','+
                      (left.tree[0].to_js()+''||'null')+','+
                      right.to_js()+')'
              }else if(left.tree.length==2){
                  res += '$B.set_list_slice('+temp+','+
                      (left.tree[0].to_js()+''||'null')+','+
                      (left.tree[1].to_js()+''||'null')+','+
                      right.to_js()+')'
              }else if(left.tree.length==3){
                  res += '$B.set_list_slice_step('+temp+','+
                      (left.tree[0].to_js()+''||'null')+','+
                      (left.tree[1].to_js()+''||'null')+','+
                      (left.tree[2].to_js()+''||'null')+','+
                      right.to_js()+')'
              }
              if(type=='list'){return res}
              res += '\n}else{'
              if(left.tree.length==1){
                  res += '$B.$setitem('+left.value.to_js()
                    res += ','+left.tree[0].to_js()+','+right_js+')};None;'
              }else{
                  left.func = 'setitem' // just for to_js()
                  res += left.to_js()
                  res = res.substr(0,res.length-1) // remove trailing )
                  left.func = 'getitem' // restore default function
                  res += ','+right_js+')};None;'
              }
              return res
          }
        }
        return left.to_js()+'='+right.to_js()
    }
}

function $AttrCtx(context){
    // Class for object attributes (eg x in obj.x)
    this.type = 'attribute'
    this.value = context.tree[0]
    this.parent = context
    context.tree.pop()
    context.tree[context.tree.length]=this
    this.tree = []
    this.func = 'getattr' // becomes setattr for an assignment
    this.toString = function(){return '(attr) '+this.value+'.'+this.name}
    this.to_js = function(){
        this.js_processed=true
        return this.func+'('+this.value.to_js()+',"'+this.name+'")'
    }
}

function $AugmentedAssignCtx(context, op){
    // Class for augmented assignments such as "+="
    this.type = 'augm_assign'
    this.parent = context.parent
    context.parent.tree.pop()
    //context.parent.tree.push(this)
    context.parent.tree[context.parent.tree.length]=this
    this.op = op
    this.tree = [context]

    var scope = this.scope = $get_scope(this)

    if(context.type=='expr' && context.tree[0].type=='id'){
        var name = context.tree[0].value
        if(noassign[name]===true){
            $_SyntaxError(context,["can't assign to keyword"])
        }else if((scope.ntype=='def'||scope.ntype=='generator') &&
            $B.bound[scope.id][name]===undefined){
            if(scope.globals===undefined || scope.globals.indexOf(name)==-1){
            // Augmented assign to a variable not yet defined in
            // local scope : set attribute "unbound" to the id. If not defined
            // in the rest of the block this will raise an UnboundLocalError
                context.tree[0].unbound = true
            }
        }
    }

    // Store the names already bound
    $get_node(this).bound_before = $B.keys($B.bound[scope.id])

    this.module = scope.module

    this.toString = function(){return '(augm assign) '+this.tree}

    this.transform = function(node,rank){

        var func = '__'+$operators[op]+'__'

        var offset=0, parent=node.parent

        // remove current node
        var line_num = node.line_num, lnum_set = false
        parent.children.splice(rank,1)

        var left_is_id = (this.tree[0].type=='expr' &&
            this.tree[0].tree[0].type=='id')

        if(left_is_id){
            // Set attribute "augm_assign" of $IdCtx instance, so that
            // the id will not be resolved with $B.$check_undef()
            this.tree[0].tree[0].augm_assign = true

            // If left part is an id we must check that it is defined, otherwise
            // raise NameError
            // Example :
            //
            // if False:
            //     a = 0
            // a += 1

            // For performance reasons, this is only implemented in debug mode
            if($B.debug>0){
                var check_node = $NodeJS('if('+this.tree[0].to_js()+
                    '===undefined){throw NameError("name \''+
                    this.tree[0].tree[0].value+'\' is not defined")}')
                node.parent.insert(rank, check_node)
                offset++
            }
            var left_id = this.tree[0].tree[0].value,
                was_bound = $B.bound[this.scope.id][left_id]!==undefined,
                left_id_unbound = this.tree[0].tree[0].unbound
        }

        var right_is_int = (this.tree[1].type=='expr' &&
            this.tree[1].tree[0].type=='int')

        var right = right_is_int ? this.tree[1].tree[0].to_js() : '$temp'

        if(!right_is_int){
            // Create temporary variable
            var new_node = new $Node()
            new_node.line_num = line_num
            lnum_set = true
            new $NodeJSCtx(new_node,'var $temp,$left;')
            parent.insert(rank,new_node)
            offset++

            // replace current node by "$temp = <placeholder>"
            // at the end of $augmented_assign, control will be
            // passed to the <placeholder> expression
            var new_node = new $Node()
            new_node.id = this.scope.id
            var new_ctx = new $NodeCtx(new_node)
            var new_expr = new $ExprCtx(new_ctx,'js',false)
            // The id must be a "raw_js", otherwise if scope is a class,
            // it would create a class attribute "$class.$temp"
            var _id = new $RawJSCtx(new_expr,'$temp')
            var assign = new $AssignCtx(new_expr)
            assign.tree[1] = this.tree[1]
            _id.parent = assign
            parent.insert(rank+offset, new_node)
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
                  global_ns = '$local_'+scope.module.replace(/\./g,'_')
              switch(scope.ntype) {
                case 'module':
                  prefix = global_ns
                  break
                case 'def':
                case 'generator':
                  if(scope.globals && scope.globals.indexOf(context.tree[0].value)>-1){
                    prefix = global_ns
                  }else{prefix='$locals'}
                  break;
                case 'class':
                  var new_node = new $Node()
                  if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
                  new $NodeJSCtx(new_node,'var $left='+context.to_js())
                  parent.insert(rank+offset, new_node)
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
            if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
            js = right_is_int ? 'if(' : 'if(typeof $temp.valueOf()=="number" && '
            js += left1+'.constructor===Number'

            // If both arguments are integers, we must check that the result
            // is a safe integer
            js += '&& '+left+op1+right+'>$B.min_int && '+left+op1+right+
                '< $B.max_int){'
            js += right_is_int ? '(' : '(typeof $temp=="number" && '
            js += 'typeof '+left1+'=="number") ? '

            js += left+op+right

            js += ' : ('+left1+'.constructor===Number ? '
            // result is a float
            js += left+'=float('+left+op1
            js += right_is_int ? right : right+'.valueOf()'
            js += ') : '+left + op
            js += right_is_int ? right : right+'.valueOf()'

            js += ')}'

            new $NodeJSCtx(new_node,js)
            parent.insert(rank+offset,new_node)
            offset++

        }
        var aaops = {'+=':'add','-=':'sub','*=':'mul'}
        if(context.tree[0].type=='sub' &&
            ( '+=' == op || '-=' == op || '*=' == op) &&
            //['+=','-=','*='].indexOf(op)>-1 &&
            context.tree[0].tree.length==1){
            var js1 = '$B.augm_item_'+aaops[op]+'('
            js1 += context.tree[0].value.to_js()
            js1 += ','+context.tree[0].tree[0].to_js()+','
            js1 += right+');None;'
            var new_node = new $Node()
            if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
            new $NodeJSCtx(new_node,js1)
            parent.insert(rank+offset, new_node)
            offset++
            return
        }

        // insert node 'if(!hasattr(foo,"__iadd__"))
        var new_node = new $Node()
        if(!lnum_set){new_node.line_num=line_num;lnum_set=true}
        var js = ''
        if(prefix){js += 'else '}
        js += 'if(!hasattr('+context.to_js()+',"'+func+'"))'
        new $NodeJSCtx(new_node,js)
        parent.insert(rank+offset,new_node)
        offset ++

        // create node for "foo = foo + bar"

        var aa1 = new $Node()
        aa1.id = this.scope.id
        var ctx1 = new $NodeCtx(aa1)
        var expr1 = new $ExprCtx(ctx1,'clone',false)
        if(left_id_unbound){
            new $RawJSCtx(expr1, '$locals["'+left_id+'"]')
        }else{
            expr1.tree = context.tree
            for(var i=0;i<expr1.tree.length;i++){
                expr1.tree[i].parent = expr1
            }
        }
        var assign1 = new $AssignCtx(expr1)
        var new_op = new $OpCtx(expr1,op.substr(0,op.length-1))
        new_op.parent = assign1
        new $RawJSCtx(new_op,right)
        assign1.tree.push(new_op)
        expr1.parent.tree.pop()
        expr1.parent.tree.push(assign1)
        new_node.add(aa1)

        // create node for "else"
        var aa2 = new $Node()
        new $NodeJSCtx(aa2,'else')
        parent.insert(rank+offset,aa2)

        // create node for "foo.__iadd__(bar)"
        var aa3 = new $Node()
        var js3 = 'getattr('+context.to_js()+',"'+func+'")('+right+')'
        new $NodeJSCtx(aa3,js3)
        aa2.add(aa3)

        // Augmented assignment doesn't bind names ; if the variable name has
        // been bound in the code above (by a call to $AssignCtx), remove it
        if(left_is_id && !was_bound && !this.scope.blurred){
            $B.bound[this.scope.id][left_id] = undefined
        }

        return offset
    }

    this.to_js = function(){return ''}
}

function $BodyCtx(context){
    // inline body for def, class, if, elif, else, try...
    // creates a new node, child of context node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var body_node = new $Node()
    body_node.line_num = tree_node.line_num
    tree_node.insert(0,body_node)
    return new $NodeCtx(body_node)
}

function set_loop_context(context, kw){
    // For keywords "continue" and "break"
    // "this" is the instance of $BreakCtx or $ContinueCtx
    // We search the loop to "break" or "continue"
    // The attribute loop_ctx of "this" is set to the loop context
    // The attribute "has_break" or "has_continue" is set on the loop context
    var ctx_node = context
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var loop_node = tree_node.parent
    var break_flag=false
    while(1){
        if(loop_node.type==='module'){
            // "break" is not inside a loop
            $_SyntaxError(context,kw+' outside of a loop')
        }else{
            var ctx = loop_node.context.tree[0]

            if(ctx.type==='condition' && ctx.token==='while'){
                this.loop_ctx = ctx
                ctx['has_'+kw] = true
                break
            }

            switch(ctx.type) {
              case 'for':
                this.loop_ctx = ctx
                ctx['has_'+kw] = true
                break_flag=true
                break
              case 'def':
              case 'generator':
              case 'class':
                // "break" must not be inside a def or class, even if they are
                // enclosed in a loop
                $_SyntaxError(context,kw+' outside of a loop')
              default:
                loop_node=loop_node.parent
            }//switch
            if (break_flag) break
        }//if
    }//while
}

function $BreakCtx(context){
    // Used for the keyword "break"
    // A flag is associated to the enclosing "for" or "while" loop
    // If the loop exits with a break, this flag is set to true
    // so that the "else" clause of the loop, if present, is executed

    this.type = 'break'
    this.toString = function(){return 'break '}
    this.parent = context
    context.tree[context.tree.length]=this

    // set information related to the associated loop
    set_loop_context.apply(this, [context, 'break'])

    this.to_js = function(){
        this.js_processed=true
        var scope = $get_scope(this)
        var res = ';$locals_'+scope.id.replace(/\./g,'_')+
            '["$no_break'+this.loop_ctx.loop_num+'"]=false'

        if(this.loop_ctx.type!='asyncfor'){
            res += ';break'
        }else{
            res += ';throw StopIteration('+this.loop_ctx.loop_num+')'
        }
        return res
    }
}

function $CallArgCtx(context){
    // Base class for arguments in a function call
    this.type = 'call_arg'
    this.toString = function(){return 'call_arg '+this.tree}
    this.parent = context
    this.start = $pos
    this.tree = []
    context.tree[context.tree.length]=this
    this.expect='id'
    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $CallCtx(context){
    // Context of a call on a callable, ie what is inside the parenthesis
    // in "callable(...)"
    this.type = 'call'
    this.func = context.tree[0]
    if(this.func!==undefined){ // undefined for lambda
        this.func.parent = this
    }
    this.parent = context
    if(context.type!='class'){
        context.tree.pop()
        context.tree[context.tree.length]=this
    }else{
        // class parameters
        context.args = this
    }
    this.expect = 'id'
    this.tree = []
    this.start = $pos

    this.toString = function(){return '(call) '+this.func+'('+this.tree+')'}

    if(this.func && this.func.type=="attribute" && this.func.name=="wait"
        && this.func.value.type=="id" && this.func.value.value=="time"){
        console.log('call', this.func)
        $get_node(this).blocking = {'type': 'wait', 'call': this}
    }

    if(this.func && this.func.value=='input'){
        $get_node(this).blocking = {'type': 'input'}
    }

    this.to_js = function(){
        this.js_processed=true

        if(this.tree.length>0){
            if(this.tree[this.tree.length-1].tree.length==0){
                // from "foo(x,)"
                this.tree.pop()
            }
        }
        var func_js = this.func.to_js()

        if(this.func!==undefined) {
            switch(this.func.value) {
              case 'classmethod':
                return 'classmethod('+$to_js(this.tree)+')'
              case '$$super':
                if(this.tree.length==0){
                   // super() called with no argument : if inside a class, add the
                   // class parent as first argument
                   var scope = $get_scope(this)
                   if(scope.ntype=='def' || scope.ntype=='generator'){
                      var def_scope = $get_scope(scope.context.tree[0])
                      if(def_scope.ntype=='class'){
                         new $IdCtx(this,def_scope.context.tree[0].name)
                      }
                   }
                }
                if(this.tree.length==1){
                   // second argument omitted : add the instance
                   var scope = $get_scope(this)
                   if(scope.ntype=='def' || scope.ntype=='generator'){
                      var args = scope.context.tree[0].args
                      if(args.length>0){
                         new $IdCtx(this,args[0])
                      }
                   }
                }
                break
              default:
                if(this.func.type=='unary'){
                   // form " -(x+2) "
                   switch(this.func.op) {
                      case '+':
                        return 'getattr('+$to_js(this.tree)+',"__pos__")()'
                      case '-':
                        return 'getattr('+$to_js(this.tree)+',"__neg__")()'
                      case '~':
                        return 'getattr('+$to_js(this.tree)+',"__invert__")()'
                   }//switch
                }//if
            }//switch

            var _block=false
            if ($B.async_enabled) {
               var scope = $get_scope(this.func)
               if ($B.block[scope.id] === undefined) {
                  //console.log('block for ' + scope.id + ' is undefined')
               }
               else if ($B.block[scope.id][this.func.value]) _block=true
            }

            // build positional arguments list and keyword arguments object
            var positional = [],
                kw_args = [],
                star_args = false,
                dstar_args = []

            for(var i=0;i<this.tree.length;i++){
                var arg = this.tree[i], type
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
                        if(arg.tree[0]===undefined){console.log('bizarre', arg)}
                        else{type=arg.tree[0].type}
                        switch(type){
                            case 'expr':
                                positional.push([arg.to_js(), 's'])
                                break
                            case 'kwarg':
                                kw_args.push(arg.tree[0].tree[0].value+':'+arg.tree[0].tree[1].to_js())
                                break
                            case 'list_or_tuple':
                            case 'op':
                                positional.push([arg.to_js(), 's'])
                                break
                            case 'star_arg':
                                star_args = true
                                positional.push([arg.tree[0].tree[0].to_js(), '*'])
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
            }

            var args_str //= pos_args.join(', ')

            if(star_args){
                // If there are "star arguments", eg in f(*t, 1, 2, *(8,))
                // the argument is a list such as
                // list(t).concat([1, 2]).concat(list((8, )))
                // This argument will be passed as the argument "args" in a
                // call f.apply(null, args)
                var p = []
                for(var i=0, len=positional.length; i<len; i++){
                    arg = positional[i]
                    if(arg[1]=='*'){ // star argument
                        p.push('_b_.list('+arg[0]+')')
                    }else{
                        var elt = [positional[i][0]]
                        // list the following arguments until the end, or
                        // until the next star argument
                        i++
                        while(i<len && positional[i][1]=='s'){
                            elt.push(positional[i][0])
                            i++
                        }
                        i--
                        p.push('['+elt.join(',')+']')
                    }
                }
                args_str = p[0]
                for(var i=1;i<p.length;i++){
                    args_str += '.concat('+p[i]+')'
                }
            }else{
                for(var i=0, len=positional.length; i<len; i++){
                    positional[i] = positional[i][0]
                }
                args_str = positional.join(', ')
            }

            var kw_args_str = '{'+kw_args.join(', ')+'}'
            if(dstar_args.length){
                kw_args_str = '{$nat:"kw",kw:$B.extend("'+this.func.name+
                    '",'+kw_args_str + ',' + dstar_args.join(', ')+')}'
            }else if(kw_args_str!=='{}'){
                kw_args_str = '{$nat:"kw",kw:'+kw_args_str+'}'
            }else{
                kw_args_str = ''
            }

            if(star_args && kw_args_str){
                args_str += '.concat(['+kw_args_str+'])'
            }else{
                if(args_str && kw_args_str){args_str += ','+kw_args_str}
                else if(!args_str){args_str=kw_args_str}
            }

            if(star_args){
                    // If there are star args, we use an internal function
                    // $B.extend_list to produce the list of positional
                    // arguments. In this case the function must be called
                    // with apply
                    args_str = '.apply(null,'+args_str+')'
            }else{
                args_str = '('+args_str+')'
            }

            if(this.tree.length>-1){
              if(this.func.type=='id'){
                  if(this.func.is_builtin){
                      // simplify code for built-in functions
                      if($B.builtin_funcs[this.func.value]!==undefined){
                          return func_js+args_str
                      }
                  }else{
                      var bound_obj = this.func.found
                      if(bound_obj && (bound_obj.type=='class' ||
                        bound_obj.type=='def')){
                          return func_js+args_str
                      }
                  }
                  var res = 'getattr('+func_js+',"__call__")'+args_str
              }else{
                  var res = 'getattr('+func_js+',"__call__")'+args_str
              }
              return res
            }

            return 'getattr('+func_js+',"__call__")'+args_str
        }
    }
}

function $ClassCtx(context){
    // Class for keyword "class"
    this.type = 'class'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.expect = 'id'
    this.toString = function(){return '(class) '+this.name+' '+this.tree+' args '+this.args}
    var scope = this.scope = $get_scope(this)
    this.parent.node.parent_block = scope
    this.parent.node.bound = {} // will store the names bound in the function

    this.set_name = function(name){
        this.random = $B.UUID()
        this.name = name
        this.id = context.node.module+'_'+name+'_'+this.random
        $B.bound[this.id] = {}
        if ($B.async_enabled) $B.block[this.id] = {}
        $B.modules[this.id] = this.parent.node
        this.parent.node.id = this.id

        var parent_block = scope
        while(parent_block.context && parent_block.context.tree[0].type=='class'){
            parent_block = parent_block.parent
        }
        while(parent_block.context &&
             'def' !=parent_block.context.tree[0].type &&
             'generator' != parent_block.context.tree[0].type){
            parent_block = parent_block.parent
        }
        this.parent.node.parent_block = parent_block

        // bind name
        this.level = this.scope.level
        $B.bound[this.scope.id][name] = this

        // if function is defined inside another function, add the name
        // to local names
        if(scope.is_function){
            if(scope.context.tree[0].locals.indexOf(name)==-1){
                scope.context.tree[0].locals.push(name)
            }
        }
    }

    this.transform = function(node,rank){

        // doc string
        this.doc_string = $get_docstring(node)

        var instance_decl = new $Node()
        var local_ns = '$locals_'+this.id.replace(/\./g,'_')
        var js = ';var '+local_ns+'={$type:"class"}, $locals = '+local_ns+
            ', $local_name="'+local_ns+'";'
        new $NodeJSCtx(instance_decl,js)
        node.insert(0, instance_decl)

        // Get id of global scope
        var global_scope = this.scope
        while(global_scope.parent_block.id !== '__builtins__'){
            global_scope=global_scope.parent_block
        }
        var global_ns = '$locals_'+global_scope.id.replace(/\./g,'_')

        var js = ';var $top_frame = [$local_name, $locals,'+
            '"'+global_scope.id+'", '+global_ns+
            ']; $B.frames_stack.push($top_frame);'

        node.insert(1, $NodeJS(js))

        // exit frame
        node.add($NodeJS('$B.leave_frame()'))
        // return local namespace at the end of class definition
        var ret_obj = new $Node()
        new $NodeJSCtx(ret_obj,'return '+local_ns+';')
        node.insert(node.children.length,ret_obj)

        // close function and run it
        var run_func = new $Node()
        new $NodeJSCtx(run_func,')();')
        node.parent.insert(rank+1,run_func)

        // class constructor
        var scope = $get_scope(this)
        var name_ref = ';$locals_'+scope.id.replace(/\./g,'_')
        name_ref += '["'+this.name+'"]'

        var js = [name_ref +'=$B.$class_constructor("'+this.name], pos=1
        js[pos++]= '",$'+this.name+'_'+this.random
        if(this.args!==undefined){ // class def has arguments
            var arg_tree = this.args.tree,args=[],kw=[]

            for(var i=0;i<arg_tree.length;i++){
                var _tmp=arg_tree[i]
                if(_tmp.tree[0].type=='kwarg'){kw.push(_tmp.tree[0])}
                else{args.push(_tmp.to_js())}
            }
            js[pos++]=',tuple(['+args.join(',')+']),['
            // add the names - needed to raise exception if a value is undefined
            var _re=new RegExp('"','g')
            var _r=[], rpos=0
            for(var i=0;i<args.length;i++){
                _r[rpos++]='"'+args[i].replace(_re,'\\"')+'"'
            }
            js[pos++]= _r.join(',') + ']'

            _r=[], rpos=0
            for(var i=0;i<kw.length;i++){
                var _tmp=kw[i]
                _r[rpos++]='["'+_tmp.tree[0].value+'",'+_tmp.tree[1].to_js()+']'
            }
            js[pos++]= ',[' + _r.join(',') + ']'

        }else{ // form "class foo:"
            js[pos++]=',tuple([]),[],[]'
        }
        js[pos++]=')'
        var cl_cons = new $Node()
        new $NodeJSCtx(cl_cons,js.join(''))
        rank++
        node.parent.insert(rank+1,cl_cons)

        // add doc string
        rank++
        var ds_node = new $Node()
        js = name_ref+'.$dict.__doc__='
        if(this.name=='classXXX'){ // experimental
            js = name_ref+'.__doc__='
        }
        js += (this.doc_string || 'None')+';'
        new $NodeJSCtx(ds_node,js)
        node.parent.insert(rank+1,ds_node)

        // add attribute __module__
        rank++
        js = name_ref+'.$dict.__module__=$locals_'
        if(this.name=='classXXX'){ // experimental
            js = name_ref+'.__module__=$locals_'
        }

        js += $get_module(this).module.replace(/\./g, '_')+'.__name__'
        var mod_node = new $Node()
        new $NodeJSCtx(mod_node,js)
        node.parent.insert(rank+1,mod_node)

        // if class is defined at module level, add to module namespace
        if(scope.ntype==='module'){
            var w_decl = new $Node()
            new $NodeJSCtx(w_decl,'$locals["'+ this.name+'"]='+this.name)
        }
        // end by None for interactive interpreter
        var end_node = new $Node()
        new $NodeJSCtx(end_node,'None;')
        node.parent.insert(rank+2,end_node)

        this.transformed = true

    }
    this.to_js = function(){
        this.js_processed=true
        return 'var $'+this.name+'_'+this.random+'=(function()'
    }
}

function $CompIfCtx(context){
    // Class for keyword "if" inside a comprehension
    this.type = 'comp_if'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return '(comp if) '+this.tree}
    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $ComprehensionCtx(context){
    // Class for comprehensions
    this.type = 'comprehension'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return '(comprehension) '+this.tree}
    this.to_js = function(){
        this.js_processed=true
        var _i = [], pos=0  //intervals
        for(var j=0;j<this.tree.length;j++) _i[pos++]=this.tree[j].start
        return _i
    }
}

function $CompForCtx(context){
    // Class for keyword "for" in a comprehension
    this.type = 'comp_for'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    this.expect = 'in'
    context.tree[context.tree.length]=this
    this.toString = function(){return '(comp for) '+this.tree}
    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $CompIterableCtx(context){
    // Class for keyword "in" in a comprehension
    this.type = 'comp_iterable'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return '(comp iter) '+this.tree}
    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $ConditionCtx(context,token){
    // Class for keywords "if", "elif", "while"
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    if(token==='while'){this.loop_num=$loop_num++}
    context.tree[context.tree.length]=this
    this.toString = function(){return this.token+' '+this.tree}

    this.transform = function(node,rank){
        var scope = $get_scope(this)
        if(this.token=="while"){
            if(scope.ntype=='generator'){
                this.parent.node.loop_start = this.loop_num
            }
            var new_node = new $Node()
            var js = '$locals["$no_break'+this.loop_num+'"]=true'
            new $NodeJSCtx(new_node,js)
            node.parent.insert(rank, new_node)
            // because a node was inserted, return 2 to avoid infinite loop
            return 2
        }
    }
    this.to_js = function(){
        this.js_processed=true
        var tok = this.token
        if(tok==='elif'){
            tok='else if'
        }
        // In a "while" loop, the flag "$no_break" is initially set to false.
        // If the loop exits with a "break" this flag will be set to "true",
        // so that an optional "else" clause will not be run.
        var res = [tok+'($B.$bool(']
        if(tok=='while'){
            res.push('$locals["$no_break'+this.loop_num+'"] && ')
        }else if(tok=='else if'){
            var line_info = $get_node(this).line_num+','+$get_scope(this).id
            res.push('($locals.$line_info="'+line_info+'") && ')
        }
        if(this.tree.length==1){
            res.push($to_js(this.tree)+'))')
        }else{ // syntax "if cond : do_something" in the same line
            res.push(this.tree[0].to_js()+'))')
            if(this.tree[1].tree.length>0){
                res.push('{'+this.tree[1].to_js()+'}')
            }
        }
        return res.join('')
    }
}

function $ContinueCtx(context){
    // Class for keyword "continue"
    this.type = 'continue'
    this.parent = context
    $get_node(this).is_continue = true
    context.tree[context.tree.length]=this

    // set information related to the associated loop
    set_loop_context.apply(this, [context, 'continue'])

    this.toString = function(){return '(continue)'}

    this.to_js = function(){
        this.js_processed=true
        return 'continue'
    }
}

function $DebuggerCtx(context){
    // Class for keyword "continue"
    this.type = 'continue'
    this.parent = context
    context.tree[context.tree.length]=this

    this.toString = function(){return '(debugger)'}

    this.to_js = function(){
        this.js_processed=true
        return 'debugger'
    }
}

function $DecoratorCtx(context){
    // Class for decorators
    this.type = 'decorator'
    this.parent = context
    context.tree[context.tree.length]=this
    this.tree = []

    this.toString = function(){return '(decorator) '+this.tree}

    this.transform = function(node,rank){
        var func_rank=rank+1,children=node.parent.children
        var decorators = [this.tree]
        while(1){
            if(func_rank>=children.length){$_SyntaxError(context,['decorator expects function'])}
            else if(children[func_rank].context.type=='node_js'){func_rank++}
            else if(children[func_rank].context.tree[0].type==='decorator'){
                decorators.push(children[func_rank].context.tree[0].tree)
                children.splice(func_rank,1)
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
        var pos=0
        for(var i=0;i<decorators.length;i++){
            this.dec_ids[pos++]='$id'+ $B.UUID()
        }

        if ($B.async_enabled) {
          var _block_async_flag=false;
          for(var i=0;i<decorators.length;i++){
           try {
             // decorator name
             var name=decorators[i][0].tree[0].value
             if (name == "brython_block" || name == "brython_async") _block_async_flag=true
           } catch (err) {console.log(i); console.log(decorators[i][0])}
          }
        }

        var obj = children[func_rank].context.tree[0]
        if(obj.type=='def'){
            obj.decorated = true
            obj.alias = '$dec'+$B.UUID()
        }

        // add a line after decorated element
        var tail='',
            scope = $get_scope(this),
            ref = '$locals["'+obj.name+'"]',
            res = ref+'='

        for(var i=0;i<decorators.length;i++){
          //var dec = this.dec_ids[i]
          res += 'getattr('+this.dec_ids[i]+',"__call__")('
          tail +=')'
        }
        res += (obj.decorated ? obj.alias : ref)+tail+';'

        // If obj is a function or a class we must set $B.bound to 'true'
        // instead of "def" or "class" because the result might have an
        // attribute "__call__"
        $B.bound[scope.id][obj.name] = true

        var decor_node = new $Node()
        new $NodeJSCtx(decor_node,res)
        node.parent.insert(func_rank+1,decor_node)
        this.decorators = decorators

        // Pierre, I probably need some help here...
        // we can use brython_block and brython_async as decorators so we know
        // that we need to generate javascript up to this point in python code
        // and $append that javascript code to $B.execution_object.
        // if a delay is supplied (on brython_block only), use that value
        // as the delay value in the execution_object's setTimeout.

        // fix me...
        if ($B.async_enabled && _block_async_flag) {
           /*

        // this would be a good test to see if async (and blocking) works

        @brython_block
        def mytest():
            print("10")

        for _i in range(10):
            print(_i)

        mytest()

        for _i in range(11,20):
            print(_i)
           */

           if ($B.block[scope.id] === undefined) $B.block[scope.id]={}
           $B.block[scope.id][obj.name] = true
        }
    }

    this.to_js = function(){
        if ($B.async_enabled) {
           if (this.processing !== undefined) return ""
        }
        this.js_processed=true
        var res = [], pos=0
        for(var i=0;i<this.decorators.length;i++){
            res[pos++]='var '+this.dec_ids[i]+'='+$to_js(this.decorators[i])+';'
        }
        return res.join('')
    }
}

function $DefCtx(context){
    this.type = 'def'
    this.name = null
    this.parent = context
    this.tree = []

    this.locals = []
    this.yields = [] // list of nodes with "yield"
    context.tree[context.tree.length]=this

    // store id of enclosing functions
    this.enclosing = []
    var scope = this.scope = $get_scope(this)

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
    while(parent_block.context && parent_block.context.tree[0].type=='class'){
        parent_block = parent_block.parent
    }
    while(parent_block.context &&
          'def' !=parent_block.context.tree[0].type &&
          'generator' != parent_block.context.tree[0].type){
        parent_block = parent_block.parent
    }

    this.parent.node.parent_block = parent_block

    // this.inside_function : set if the function is defined inside another
    // function
    var pb = parent_block
    while(pb && pb.context){
        if(pb.context.tree[0].type=='def'){
            this.inside_function = true
            break
        }
        pb = pb.parent_block
    }

    this.module = scope.module

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
        var id_ctx = new $IdCtx(this,name)
        this.name = name
        this.id = this.scope.id+'_'+name
        this.id = this.id.replace(/\./g,'_') // for modules inside packages
        this.id += '_'+ $B.UUID()
        this.parent.node.id = this.id
        this.parent.node.module = this.module

        $B.modules[this.id] = this.parent.node
        $B.bound[this.id] = {}

        this.level = this.scope.level
        $B.bound[this.scope.id][name]=this

        // If function is defined inside another function, add the name
        // to local names
        id_ctx.bound = true
        if(scope.is_function){
            if(scope.context.tree[0].locals.indexOf(name)==-1){
                scope.context.tree[0].locals.push(name)
            }
        }
    }

    this.toString = function(){return 'def '+this.name+'('+this.tree+')'}

    this.transform = function(node,rank){
        // already transformed ?
        if(this.transformed!==undefined) return

        var scope = this.scope

        // this.inside_function : set if the function is defined inside
        // another function
        var pb = this.parent.node

        while(pb && pb.context){
            if(pb.context.tree[0].type=='def'){
                this.inside_function = true
                break
            }
            pb = pb.parent
        }

        // search doc string
        this.doc_string = $get_docstring(node)
        this.rank = rank // save rank if we must add generator declaration

        // block indentation
        var indent = node.indent+16

        // List of enclosing functions

        // For lambdas, test if the parent block is a function
        if(this.name.substr(0,15)=='lambda_'+$B.lambda_magic){
            var pblock = $B.modules[scope.id].parent_block
            if(pblock.context && pblock.context.tree[0].type=="def"){
                this.enclosing.push(pblock)
            }
        }
        var pnode = this.parent.node
        while(pnode.parent && pnode.parent.is_def_func){
            this.enclosing.push(pnode.parent.parent)
            pnode = pnode.parent.parent
        }

        var defaults = [],
            apos=0,
            dpos=0,
            defs1=[],
            dpos1=0
        this.argcount = 0
        this.kwonlyargcount = 0 // number of args after a star arg
        this.varnames = {}
        this.args = []
        this.__defaults__ = []
        this.slots = []
        var slot_list = []
        var annotations = []
        if(this.annotation){annotations.push('"return":'+this.annotation.to_js())}

        var func_args = this.tree[1].tree
        for(var i=0;i<func_args.length;i++){
            var arg = func_args[i]
            this.args[apos++]=arg.name
            this.varnames[arg.name]=true
            if(arg.type==='func_arg_id'){
                if(this.star_arg){this.kwonlyargcount++}
                else{this.argcount++}
                this.slots.push(arg.name+':null')
                slot_list.push('"'+arg.name+'"')
                if(arg.tree.length>0){
                    defaults[dpos++]='"'+arg.name+'"'
                    defs1[dpos1++]=arg.name+':'+$to_js(arg.tree)
                    this.__defaults__.push($to_js(arg.tree))
                }
            }else if(arg.type=='func_star_arg'){
                if(arg.op == '*'){this.star_arg = arg.name}
                else if(arg.op=='**'){this.kw_arg = arg.name}
            }
            if(arg.annotation){
                annotations.push(arg.name+': '+arg.annotation.to_js())
            }
        }

        // Flags
        var flags = 67
        if(this.star_arg){flags |= 4}
        if(this.kw_arg){ flags |= 8}
        if(this.type=='generator'){ flags |= 32}

        // String to pass positional arguments
        var positional_str=[], positional_obj=[], pos=0
        for(var i=0, _len=this.positional_list.length;i<_len;i++){
            positional_str[pos]='"'+this.positional_list[i]+'"'
            positional_obj[pos++]=this.positional_list[i]+':null'
        }
        positional_str = positional_str.join(',')
        positional_obj = '{'+positional_obj.join(',')+'}'

        // String to pass arguments with default values
        var dobj = [], pos=0
        for(var i=0;i<this.default_list.length;i++){
            dobj[pos++]=this.default_list[i]+':null'
        }
        dobj = '{'+dobj.join(',')+'}'

        var nodes=[], js

        // Get id of global scope
        var global_scope = scope
        while(global_scope.parent_block.id !== '__builtins__'){
            global_scope=global_scope.parent_block
        }
        var global_ns = '$locals_'+global_scope.id.replace(/\./g,'_')


        var prefix = this.tree[0].to_js()
        if(this.decorated){prefix=this.alias}
        var name = this.name+this.num


        // Add lines of code to node children

        // Declare object holding local variables
        var local_ns = '$locals_'+this.id
        js = 'var '+local_ns+'={}, '
        js += '$local_name="'+this.id+'",$locals='+local_ns+';'

        var new_node = new $Node()
        new_node.locals_def = true
        new $NodeJSCtx(new_node,js)
        nodes.push(new_node)

        // Push id in frames stack
        var enter_frame_node = new $Node(),
            js = ';var $top_frame = [$local_name, $locals,'+
                '"'+global_scope.id+'", '+global_ns+
                ']; $B.frames_stack.push($top_frame); var $stack_length = '+
                '$B.frames_stack.length;'
        if ($B.profile > 1) {
            if(this.scope.ntype=='class'){
                fname=this.scope.context.tree[0].name+'.'+this.name
            }
            else fname = this.name
            if (pnode && pnode.id) {
                fmod = pnode.id.slice(0,pnode.id.indexOf('_'))
            }
            else fmod='';
            js = ";var _parent_line_info={}; if($B.frames_stack[$B.frames_stack.length-1]){"+
                 " _parent_line_info=$B.frames_stack[$B.frames_stack.length-1][1].$line_info;"+
                 "} else _parent_line_info="+global_ns+".$line_info;"+
                 ";$B.$profile.call('"+fmod+"','"+fname+"',"+
                 node.line_num+",_parent_line_info)"+js;
        }
        enter_frame_node.enter_frame = true
        new $NodeJSCtx(enter_frame_node,js)
        nodes.push(enter_frame_node)

        this.env = []

        // Code in the worst case, uses $B.args in py_utils.js

        var make_args_nodes = []

        // If function is not a generator, $locals is the result of $B.args
        var js = this.type=='def' ? local_ns+' = $locals' : 'var $ns'

        js += ' = $B.args("'+this.name+'", '+
            this.argcount+', {'+this.slots.join(', ')+'}, '+
            '['+slot_list.join(', ')+'], arguments, '

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
        js += this.other_args+', '+this.other_kw+');'

        var new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        make_args_nodes.push(new_node)

        if(this.type=='generator'){
            // For generators, update $locals with the result of $B.args
            js ='for(var $var in $ns){$locals[$var]=$ns[$var]};'
            make_args_nodes.push($NodeJS(js))
        }

        var only_positional = false
        if(this.other_args===null && this.other_kw===null &&
            this.after_star.length==0
            && defaults.length==0){
            // If function only takes positional arguments, we can generate
            // a faster version of argument parsing than by calling function
            // $B.args
            only_positional = true

            if($B.debug>0 || this.positional_list.length>0){

                // Test if all the arguments passed to the function
                // are positional, not keyword arguments
                // In calls, keyword arguments are passed as the last
                // argument, an object with attribute $nat set to "kw"

                nodes.push($NodeJS('var $len = arguments.length;'))

                var new_node = new $Node()
                var js = 'if($len>0 && arguments[$len-1].$nat!==undefined)'
                new $NodeJSCtx(new_node,js)
                nodes.push(new_node)

                // If at least one argument is not "simple", fall back to
                // $B.args()
                new_node.add(make_args_nodes[0])
                if(make_args_nodes.length>1){new_node.add(make_args_nodes[1])}

                var else_node = new $Node()
                new $NodeJSCtx(else_node,'else')
                nodes.push(else_node)

            }

            var pos_len = this.positional_list.length

            if($B.debug>0){
                // If all arguments are "simple" all there is to check is that
                // we got the right number of arguments
                js = 'if($len!='+pos_len+'){$B.wrong_nb_args("'+this.name+
                    '", $len, '+pos_len
                if(positional_str.length>0){ js += ', ['+positional_str+']'}
                js += ')}'

                else_node.add($NodeJS(js))
            }

            if(this.positional_list.length>0){
                if(this.type=='generator'){
                    for(var i=0;i<this.positional_list.length;i++){
                        var arg = this.positional_list[i]
                        var new_node = new $Node()
                        var js = '$locals["'+arg+'"]='+arg
                        new $NodeJSCtx(new_node,js)
                        else_node.add(new_node)
                    }
                }else{
                    var pargs = []
                    for(var i=0;i<this.positional_list.length;i++){
                        var arg = this.positional_list[i]
                        pargs.push(arg+':'+arg)
                    }
                    if($B.debug < 1){
                        js = 'if($len!='+pos_len+'){$B.wrong_nb_args("'+this.name+
                            '", $len, '+pos_len
                        if(positional_str.length>0){ js += ', ['+positional_str+']'}
                        js += ')}'
                        else_node.add($NodeJS(js))
                    }
                    else_node.add($NodeJS(local_ns+'=$locals={'+pargs.join(', ')+'}'))
                }
            }

        }else{
            nodes.push(make_args_nodes[0])
            if(make_args_nodes.length>1){nodes.push(make_args_nodes[1])}
        }

        nodes.push($NodeJS('$B.frames_stack[$B.frames_stack.length-1][1] = $locals;'))

        // set __BRYTHON__.js_this to Javascript "this"
        // To use some JS libraries it may be necessary to know what "this"
        // is set to ; in Brython it is available as the result of function
        // __this__() in module javascript
        nodes.push($NodeJS('$B.js_this = this;'))

        // remove children of original node
        for(var i=nodes.length-1;i>=0;i--){
            node.children.splice(0, 0, nodes[i])
        }

        // Node that replaces the original "def" line
        var def_func_node = new $Node()
        this.params = ''
        if(only_positional){
            this.params = Object.keys(this.varnames).join(', ')
            new $NodeJSCtx(def_func_node,'')
        }else{
            new $NodeJSCtx(def_func_node,'')
        }
        def_func_node.is_def_func = true
        def_func_node.module = this.module

        // If the last instruction in the function is not a return,
        // add an explicit line "return None".
        var last_instr = node.children[node.children.length-1].context.tree[0]
        if(last_instr.type!=='return' && this.type!='generator'){
            // as always, leave frame before returning
            node.add($NodeJS('$B.leave_frame($local_name);return None'))
        }

        // Add the new function definition
        node.add(def_func_node)

        var offset = 1

        var indent = node.indent

        // Create attribute $infos for the function
        // Adding only one attribute is much faster than adding all the
        // keys/values in $infos
        node.parent.insert(rank+offset++, $NodeJS(name+'.$infos = {'))

        // Add attribute __name__
        js = '    __name__:"' + this.name + '",'
        //if(this.scope.ntype=='class'){js+=this.scope.context.tree[0].name+'.'}
        //js += this.name+'",'
        node.parent.insert(rank+offset++, $NodeJS(js))

        // Add attribute __defaults__
        var def_names = []
        for(var i=0; i<this.default_list.length;i++){
            def_names.push('"'+this.default_list[i]+'"')
        }
        node.parent.insert(rank+offset++, $NodeJS('    __defaults__ : ['+
            def_names.join(', ')+'],'))

        // Add attribute __module__
        var module = $get_module(this)
        js = '    __module__ : "'+module.module+'",'
        node.parent.insert(rank+offset++, $NodeJS(js))

        // Add attribute __doc__
        js = '    __doc__: '+(this.doc_string || 'None')+','
        node.parent.insert(rank+offset++, $NodeJS(js))

        // Add attribute __annotations__
        js = '    __annotations__: {'+annotations.join(',')+'},'
        node.parent.insert(rank+offset++, $NodeJS(js))


        for(var attr in $B.bound[this.id]){this.varnames[attr]=true}
        var co_varnames = []
        for(var attr in this.varnames){co_varnames.push('"'+attr+'"')}

        // Add attribute __code__
        var h = '\n'+' '.repeat(indent+8)
        js = '    __code__:{'+h+'    __class__:$B.$CodeDict'
        var h1 = ','+h+' '.repeat(4)
        js += h1+'co_argcount:'+this.argcount+
            h1+'co_filename:$locals_'+scope.module.replace(/\./g,'_')+'["__file__"]'+
            h1+'co_firstlineno:'+node.line_num+
            h1+'co_flags:'+flags+
            h1+'co_kwonlyargcount:'+this.kwonlyargcount+
            h1+'co_name: "'+this.name+'"'+
            h1+'co_nlocals: '+co_varnames.length+
            h1+'co_varnames: ['+co_varnames.join(', ')+']'+
            h+'}\n    };'

        // End with None for interactive interpreter
        js += 'None;'

        new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        node.parent.insert(rank+offset++, new_node)

        // Close anonymous function with defaults as argument
        this.default_str = '{'+defs1.join(', ')+'}'
        if(this.type=="def"){
            node.parent.insert(rank+offset++, $NodeJS('return '+name+'})('+
                this.default_str+')'))
        }

        // wrap everything in a try/catch to be sure to exit from frame
        if(this.type=='def'){
            var parent = node
            for(var pos=0;pos<parent.children.length &&
                parent.children[pos]!==enter_frame_node;pos++){}
            var try_node = $NodeJS('try'),
                children = parent.children.slice(pos+1)
            parent.insert(pos+1, try_node)
            for(var i=0;i<children.length;i++){
                if(children[i].is_def_func){
                    for(var j=0;j<children[i].children.length;j++){
                        try_node.add(children[i].children[j])
                    }
                }else{
                    try_node.add(children[i])
                }
            }
            parent.children.splice(pos+2,parent.children.length)

            var except_node = $NodeJS('catch(err)')
            except_node.add($NodeJS('$B.leave_frame($local_name);throw err'))

            parent.add(except_node)
        }

        this.transformed = true

        return offset
    }

    this.to_js = function(func_name){
        this.js_processed=true

        func_name = func_name || this.tree[0].to_js()
        if(this.decorated){func_name='var '+this.alias}

        func_name = func_name || this.tree[0].to_js() //
        if(this.decorated){func_name='var '+this.alias}
        //else{func_name = 'var '+this.name+' = '+func_name}
        return func_name+' = (function ($defaults){function '+
            this.name+this.num+'('+this.params+')'
    }
}

function $DelCtx(context){
    // Class for keyword "del"
    this.type = 'del'
    this.parent = context
    context.tree[context.tree.length]=this
    this.tree = []

    this.toString = function(){return 'del '+this.tree}

    this.to_js = function(){
        this.js_processed=true

        if(this.tree[0].type=='list_or_tuple'){
            // Syntax "del a, b, c"
            var res = [], pos=0
            for(var i=0;i<this.tree[0].tree.length;i++){
                var subdel = new $DelCtx(context) // this adds an element to context.tree
                subdel.tree = [this.tree[0].tree[i]]
                res[pos++]=subdel.to_js()
                context.tree.pop() // remove the element from context.tree
            }
            this.tree = []
            return res.join(';')
        }else{
            var expr = this.tree[0].tree[0]

            switch(expr.type) {
                case 'id':
                    return 'delete '+expr.to_js()+';'
                case 'list_or_tuple':
                    var res = [], pos=0
                    for(var i=0;i<expr.tree.length;i++){
                      res[pos++]='delete '+expr.tree[i].to_js()
                    }
                    return res.join(';')
                case 'sub':
                    // Delete an item in a list : "del a[x]"
                    expr.func = 'delitem'
                    js = expr.to_js()
                    expr.func = 'getitem'
                    return js
                case 'op':
                      $_SyntaxError(this,["can't delete operator"])
                case 'call':
                    $_SyntaxError(this,["can't delete function call"])
                case 'attribute':
                    return 'delattr('+expr.value.to_js()+',"'+expr.name+'")'
                default:
                    $_SyntaxError(this,["can't delete "+expr.type])
            }
        }
    }
}

function $DictOrSetCtx(context){
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
    context.tree[context.tree.length]=this

    this.toString = function(){
        switch(this.real) {
          case 'dict':
            return '(dict) {'+this.items+'}'
          case 'set':
            return '(set) {'+this.tree+'}'
        }
        return '(dict_or_set) {'+this.tree+'}'
    }

    this.to_js = function(){
        this.js_processed=true

        switch(this.real) {
          case 'dict':
            var res = [], pos=0
            for(var i=0;i<this.items.length;i+=2){
                res[pos++]='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'
            }
            return 'dict(['+res.join(',')+'])'+$to_js(this.tree)
          case 'set_comp':
            return 'set('+$to_js(this.items)+')'+$to_js(this.tree)
          case 'dict_comp':
            return 'dict('+$to_js(this.items)+')'+$to_js(this.tree)
        }
        return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)
    }
}

function $DoubleStarArgCtx(context){
    // Class for syntax "**kw" in a call
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return '**'+this.tree}
    this.to_js = function(){
        this.js_processed=true
        return '{$nat:"pdict",arg:'+$to_js(this.tree)+'}'
    }
}

function $EllipsisCtx(context){
    // Class for "..."
    this.type = 'ellipsis'
    this.parent = context
    this.nbdots = 1
    context.tree[context.tree.length]=this
    this.toString = function(){return 'ellipsis'}
    this.to_js = function(){
        this.js_processed=true
        return '$B.builtins["Ellipsis"]'
    }
}

function $ExceptCtx(context){
    // Class for keyword "except"
    this.type = 'except'
    this.parent = context
    context.tree[context.tree.length]=this
    this.tree = []
    this.expect = 'id'
    this.scope = $get_scope(this)

    this.toString = function(){return '(except) '}

    this.set_alias = function(alias){
        this.tree[0].alias = alias
        $B.bound[this.scope.id][alias] = {level: this.scope.level}
    }

    this.to_js = function(){
        // in method "transform" of $TryCtx instances, related
        // $ExceptCtx instances receive an attribute __name__

        this.js_processed=true

        switch(this.tree.length) {
           case 0:
             return 'else'
           case 1:
             if(this.tree[0].name==='Exception') return 'else if(1)'
        }

        var res=[], pos=0
        for(var i=0;i<this.tree.length;i++){
            res[pos++]=this.tree[i].to_js()
        }
        var lnum = ''
        if($B.debug>0){
            lnum = '($locals.$line_info="'+$get_node(this).line_num+','+
                this.scope.id+'") && '
        }
        return 'else if('+lnum+'$B.is_exc('+this.error_name+',['+res.join(',')+']))'
    }
}

function $ExprCtx(context,name,with_commas){
    // Base class for expressions
    this.type = 'expr'
    this.name = name
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.expect = ',' // can be 'expr' or ','
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return '(expr '+with_commas+') '+this.tree}

    this.to_js = function(arg){
        this.js_processed=true
        if(this.type==='list') return '['+$to_js(this.tree)+']'
        if(this.tree.length===1) return this.tree[0].to_js(arg)
        return 'tuple('+$to_js(this.tree)+')'
    }
}

function $ExprNot(context){
    // Class used temporarily for 'x not', only accepts 'in' as next token
    // Never remains in the final tree, so there is no need to define to_js()
    this.type = 'expr_not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return '(expr_not)'}

}

function $FloatCtx(context,value){
    // Class for literal floats
    this.type = 'float'
    this.value = value
    this.toString = function(){return 'float '+this.value}
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.to_js = function(){
        this.js_processed=true
        // number literal
        if(/^\d+$/.exec(this.value) ||
            /^\d+\.\d*$/.exec(this.value)){
                return '(new Number('+this.value+'))'
        }

        return 'float('+this.value+')'
    }
}

function $ForExpr(context){
    // Class for keyword "for" outside of comprehensions
    this.type = 'for'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.loop_num = $loop_num
    this.module = $get_scope(this).module
    $loop_num++

    this.toString = function(){return '(for) '+this.tree}

    this.transform = function(node,rank){
        var scope = $get_scope(this),
            target = this.tree[0],
            target_is_1_tuple = target.tree.length==1 && target.expect == 'id',
            iterable = this.tree[1],
            num = this.loop_num,
            local_ns = '$locals_'+scope.id.replace(/\./g,'_'),
            h = '\n'+' '.repeat(node.indent+4)

        // Because loops like "for x in range(...)" are very common and can be
        // optimised, check if the target is a call to the builtin function
        // "range"
        var $range = false
        if(target.tree.length==1 &&
            target.expct != 'id' &&
            iterable.type=='expr' &&
            iterable.tree[0].type=='expr' &&
            iterable.tree[0].tree[0].type=='call'){
            var call = iterable.tree[0].tree[0]
            if(call.func.type=='id'){
                var func_name = call.func.value
                if(func_name=='range' && call.tree.length<3){
                    $range = call
                }
            }
        }

        // nodes that will be inserted at the position of the original "for" loop
        var new_nodes = [], pos=0

        // save original children (loop body)
        var children = node.children

        var offset = 1

        if($range && scope.ntype!='generator'){
            if(this.has_break){
                // If there is a "break" in the loop, add a boolean
                // used if there is an "else" clause and in generators
                new_node = new $Node()
                new $NodeJSCtx(new_node,local_ns+'["$no_break'+num+'"]=true')
                new_nodes[pos++]=new_node
            }

            var range_is_builtin = false
            if(!scope.blurred){
                var _scope = $get_scope(this), found=[], fpos=0
                while(1){
                    if($B.bound[_scope.id]['range']){found[fpos++]=_scope.id}
                    if(_scope.parent_block){_scope=_scope.parent_block}
                    else{break}
                }
                range_is_builtin = found.length==1 && found[0]=="__builtins__"
                if(found==['__builtins__']){range_is_builtin = true}
            }

            // Line to test if the callable "range" is the built-in "range"
            var test_range_node = new $Node()
            if(range_is_builtin){
                new $NodeJSCtx(test_range_node,'if(1)')
            }else{
                new $NodeJSCtx(test_range_node,
                    'if('+call.func.to_js()+'===$B.builtins.range)')
            }
            new_nodes[pos++]=test_range_node

            // Build the block with the Javascript "for" loop
            var idt = target.to_js()
            if($range.tree.length==1){
                var start=0,stop=$range.tree[0].to_js()
            }else{
                var start=$range.tree[0].to_js(),stop=$range.tree[1].to_js()
            }
            var js = 'var $stop_'+num +'=$B.int_or_bool('+
                stop+');'+h+idt+'='+start+';'+h+
                '    var $next'+num+'= '+idt+','+h+
                '    $safe'+num+'= typeof $next'+num+'=="number" && typeof '+
                '$stop_'+num+'=="number";'+h+'while(true)'
            var for_node = new $Node()
            new $NodeJSCtx(for_node,js)

            for_node.add($NodeJS('if($safe'+num+' && $next'+num+'>= $stop_'+
                num+'){break}'))
            for_node.add($NodeJS('else if(!$safe'+num+
                ' && $B.ge($next'+num+', $stop_'+num+
                ')){break}'))
            for_node.add($NodeJS(idt+' = $next'+num))
            for_node.add($NodeJS('if($safe'+num+'){$next'+num+'+=1'+'}'))
            for_node.add($NodeJS('else{$next'+num+'=$B.add($next'+num+',1)}'))
            // Add the loop body
            for(var i=0;i<children.length;i++){
                for_node.add(children[i].clone())
            }
            // Add a line to reset the line number
            for_node.add($NodeJS('$locals.$line_info="'+node.line_num+','+
                scope.id+'"; None;'))

            // Check if current "for" loop is inside another "for" loop
            var in_loop=false
            if(scope.ntype=='module'){
                var pnode = node.parent
                while(pnode){
                    if(pnode.for_wrapper){in_loop=true;break}
                    pnode = pnode.parent
                }
            }

            // If we are at module level, and if the "for" loop is not already
            // in a wrapper function, wrap it in a function to increase
            // performance
            if(scope.ntype=='module' && !in_loop){
                var func_node = new $Node()
                func_node.for_wrapper = true
                js = 'function $f'+num+'('
                if(this.has_break){js += '$no_break'+num}
                js += ')'
                new $NodeJSCtx(func_node,js)

                // the function is added to the test_range_node
                test_range_node.add(func_node)

                // Add the "for" loop
                func_node.add(for_node)

                // Return break flag
                if(this.has_break){
                    new_node = new $Node()
                    new $NodeJSCtx(new_node,'return $no_break'+num)
                    func_node.add(new_node)
                }

                // Line to call the function
                var end_func_node = new $Node()
                new $NodeJSCtx(end_func_node,'var $res'+num+'=$f'+num+'();')
                test_range_node.add(end_func_node)

                if(this.has_break){
                    var no_break = new $Node()
                    new $NodeJSCtx(no_break,'var $no_break'+num+'=$res'+num)
                    test_range_node.add(no_break)
                }

            }else{

                // If the loop is already inside a function, don't
                // wrap it
                test_range_node.add(for_node)
            }
            if(range_is_builtin){
                node.parent.children.splice(rank,1)
                var k = 0
                if(this.has_break){
                    node.parent.insert(rank, new_nodes[0])
                    k++
                }
                for(var i=new_nodes[k].children.length-1;i>=0;i--){
                    node.parent.insert(rank+k, new_nodes[k].children[i])
                }
                node.parent.children[rank].line_num = node.line_num
                node.children = []
                return 0
            }

            // Add code in case the callable "range" is *not* the
            // built-in function
            var else_node = new $Node()
            new $NodeJSCtx(else_node,'else')
            new_nodes[pos++]=else_node


            // Add lines at module level, after the original "for" loop
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank+1,new_nodes[i])
            }

            this.test_range = true
            new_nodes = [], pos=0
        }

        // Line to declare the function that produces the next item from
        // the iterable
        var new_node = new $Node()
        new_node.line_num = $get_node(this).line_num
        var it_js = iterable.to_js()
        var js = '$locals["$next'+num+'"]'+'=getattr($B.$iter('+ it_js +
            '),"__next__")'
        new $NodeJSCtx(new_node,js)
        new_nodes[pos++]=new_node

        // Line to store the length of the iterator
        var js = 'if(isinstance('+it_js+', dict)){$locals.$len_func'+num+
            '=getattr('+it_js+',"__len__"); $locals.$len'+num+
            '=$locals.$len_func'+num+'()}else{$locals.$len'+num+'=null}'
        new_nodes[pos++] = $NodeJS(js)

        if(this.has_break){
            // If there is a "break" in the loop, add a boolean
            // used if there is an "else" clause and in generators
            new_node = new $Node()
            new $NodeJSCtx(new_node,local_ns+'["$no_break'+num+'"]=true;')
            new_nodes[pos++]=new_node
        }

        var while_node = new $Node()

        if(this.has_break){js = 'while('+local_ns+'["$no_break'+num+'"])'}
        else{js='while(1)'}

        new $NodeJSCtx(while_node,js)
        while_node.context.loop_num = num // used for "else" clauses
        while_node.context.type = 'for' // used in $add_line_num
        while_node.line_num = node.line_num
        if(scope.ntype=='generator'){
            // used in generators to signal a loop start
            while_node.loop_start = num
        }

        new_nodes[pos++]=while_node

        node.parent.children.splice(rank,1)
        if(this.test_range){
            for(var i=new_nodes.length-1;i>=0;i--){
                else_node.insert(0,new_nodes[i])
            }
        }else{
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
                offset += new_nodes.length
            }
        }

        // Add test of length change
        while_node.add($NodeJS('if($locals.$len'+num+'!==null && $locals.$len'+
            num+'!=$locals.$len_func'+num+'()){throw RuntimeError("dictionary'+
            ' changed size during iteration")}'))

        var try_node = new $Node()
        new $NodeJSCtx(try_node,'try')
        while_node.add(try_node)

        var iter_node = new $Node()
        // Parent of iter_node must be the same as current node, otherwise
        // targets are bound in global scope
        iter_node.parent = $get_node(this).parent
        iter_node.id = this.module
        var context = new $NodeCtx(iter_node) // create ordinary node
        var target_expr = new $ExprCtx(context,'left',true)
        if(target_is_1_tuple){
            // assign to a one-element tuple for "for x, in ..."
            var t = new $ListOrTupleCtx(target_expr)
            t.real = 'tuple'
            t.tree = target.tree
        }else{
            target_expr.tree = target.tree
        }
        var assign = new $AssignCtx(target_expr) // assignment to left operand
        assign.tree[1] = new $JSCode('$locals["$next'+num+'"]()')
        try_node.add(iter_node)

        var catch_node = new $Node()

        var js = 'catch($err){if($B.is_exc($err,[StopIteration]))'+
                 '{$B.clear_exc();break;}'
        js += 'else{throw($err)}}'

        new $NodeJSCtx(catch_node,js)
        while_node.add(catch_node)

        // set new loop children
        for(var i=0;i<children.length;i++){
            while_node.add(children[i].clone())
        }

        node.children = []
        return 0
    }

    this.to_js = function(){
        this.js_processed=true
        var iterable = this.tree.pop()
        return 'for '+$to_js(this.tree)+' in '+iterable.to_js()
    }
}

function $FromCtx(context){
    // Class for keyword "from" for imports
    this.type = 'from'
    this.parent = context
    this.module = ''
    this.names = []
    this.aliases = {}
    context.tree[context.tree.length]=this
    this.expect = 'module'
    this.scope = $get_scope(this)

    this.add_name = function(name){
        this.names[this.names.length]=name
        if(name=='*'){this.scope.blurred = true}
    }

    this.transform = function(node, rank){
        if(!this.blocking){
            // Experimental : for non blocking import, wrap code after the
            // "from" statement in a function
            var mod_name = this.module.replace(/\$/g,'')
            if(this.names[0]=='*'){
                node.add($NodeJS('for(var $attr in $B.imported["'+mod_name+
                    '"]){if($attr.charAt(0)!=="_"){$locals[$attr]=$B.imported["'+mod_name+'"][$attr]}};'))
            }else{
                for(var i=0;i<this.names.length;i++){
                    var name = this.names[i]
                    node.add($NodeJS('$locals["'+(this.aliases[name]||name)+
                        '"]=$B.imported["'+mod_name+'"]["'+name+'"]'))
                }
            }

            for(var i=rank+1;i<node.parent.children.length;i++){
                node.add(node.parent.children[i])
            }
            node.parent.children.splice(rank+1, node.parent.children.length)
            node.parent.add($NodeJS(')'))
        }
    }

    this.bind_names = function(){
        // Called at the end of the 'from' statement
        // Binds the names or aliases in current scope
        var scope = $get_scope(this)
        for(var i=0;i<this.names.length;i++){
            var name = this.aliases[this.names[i]] || this.names[i]
            $B.bound[scope.id][name] = {level: scope.level}
        }
    }

    this.toString = function(){
        return '(from) '+this.module+' (import) '+this.names+'(as)'+this.aliases
    }

    this.to_js = function(){
        this.js_processed=true
        var scope = $get_scope(this),
            mod = $get_module(this).module,
            res = [],
            pos = 0,
            indent = $get_node(this).indent,
            head= ' '.repeat(indent);

        var _mod = this.module.replace(/\$/g,''), package, packages=[]
        while(_mod.length>0){
            if(_mod.charAt(0)=='.'){
                if(package===undefined){
                    if($B.imported[mod]!==undefined){
                        package = $B.imported[mod].__package__
                    }
                }else{
                    package = $B.imported[package]
                }
                if(package===undefined){
                    return 'throw SystemError("Parent module \'\' not loaded,'+
                        ' cannot perform relative import")'
                }else if(package=='None'){
                    console.log('package is None !')
                }else{
                    packages.push(package)
                }
                _mod = _mod.substr(1)
            }else{
                break
            }
        }
        if(_mod){packages.push(_mod)}
        this.module = packages.join('.')

        // FIXME : Replacement still needed ?
        var mod_name = this.module.replace(/\$/g,'')
        if(this.blocking){
            res[pos++] = '$B.$import("';
            res[pos++] = mod_name+'",["';
            res[pos++] = this.names.join('","')+'"], {';
            var sep = '';
            for (var attr in this.aliases) {
                res[pos++] = sep + '"'+attr+'": "'+this.aliases[attr]+'"';
                sep = ',';
            }
            res[pos++] = '}, {}, true);';

            // Add names to local namespace
            if(this.names[0]=='*'){
                res[pos++] = '\n'+head+'for(var $attr in $B.imported["'+mod_name+
                    '"]){if($attr.charAt(0)!=="_"){'+
                    '$locals[$attr]=$B.imported["'+mod_name+'"][$attr]}};'
            }else{
                for(var i=0;i<this.names.length;i++){
                    var name = this.names[i]
                    res[pos++] = '\n'+head+'$locals["'+(this.aliases[name]||name)+
                        '"]=$B.imported["'+mod_name+'"]["'+name+'"];'
                }
            }
            res[pos++] = '\n'+head+'None;';

        }else{
            res[pos++] = '$B.$import_non_blocking("'+mod_name+'", function()'
        }

        if(this.names[0]=='*'){
            // Set attribute to indicate that the scope has a
            // 'from X import *' : this will make name resolution harder :-(
            scope.blurred = true
        }

        return res.join('');
    }
}

function $FuncArgs(context){
    // Class for arguments in a function definition
    this.type = 'func_args'
    this.parent = context
    this.tree = []
    this.names = []
    context.tree[context.tree.length]=this
    this.toString = function(){return 'func args '+this.tree}
    this.expect = 'id'
    this.has_default = false
    this.has_star_arg = false
    this.has_kw_arg = false
    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $FuncArgIdCtx(context,name){
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
    if($B.bound[node.id][name]){
        $_SyntaxError(context,["duplicate argument '"+name+"' in function definition"])
    }
    $B.bound[node.id][name] = {level:1} // we are sure the name is defined in function

    this.tree = []
    context.tree[context.tree.length]=this
    // add to locals of function
    var ctx = context
    while(ctx.parent!==undefined){
        if(ctx.type==='def'){
            ctx.locals.push(name)
            break
        }
        ctx = ctx.parent
    }

    this.expect = '='

    this.toString = function(){return 'func arg id '+this.name +'='+this.tree}

    this.to_js = function(){
        this.js_processed=true
        return this.name+$to_js(this.tree)
    }
}

function $FuncStarArgCtx(context,op){
    // Class for "star argument" in a function definition : f(*args)
    this.type = 'func_star_arg'
    this.op = op
    this.parent = context
    this.node = $get_node(this)

    context.has_star_arg= op == '*'
    context.has_kw_arg= op == '**'
    context.tree[context.tree.length]=this

    this.toString = function(){return '(func star arg '+this.op+') '+this.name}

    this.set_name = function(name){
        this.name = name
        if(name=='$dummy'){return}

        // bind name to function scope
        if($B.bound[this.node.id][name]){
            $_SyntaxError(context,["duplicate argument '"+name+"' in function definition"])
        }
        $B.bound[this.node.id][name] = {level:1}

        // add to locals of function
        var ctx = context
        while(ctx.parent!==undefined){
            if(ctx.type==='def'){
                ctx.locals.push(name)
                break
            }
            ctx = ctx.parent
        }
        if(op=='*'){ctx.other_args = '"'+name+'"'}
        else{ctx.other_kw = '"'+name+'"'}
    }
}

function $GlobalCtx(context){
    // Class for keyword "global"
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.expect = 'id'
    this.toString = function(){return 'global '+this.tree}
    this.scope = $get_scope(this)
    $B._globals[this.scope.id] = $B._globals[this.scope.id] || {}

    this.add = function(name){
        $B._globals[this.scope.id][name] = true
    }

    this.to_js = function(){
        this.js_processed=true
        return ''
    }
}

function $IdCtx(context,value){
    // Class for identifiers (variable names)

    this.type = 'id'
    this.toString = function(){return '(id) '+this.value+':'+(this.tree||'')}
    this.value = $mangle(value, context)
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    var scope = this.scope = $get_scope(this)
    this.blurred_scope = this.scope.blurred
    this.env = clone($B.bound[this.scope.id])

    if(context.parent.type==='call_arg') {
        this.call_arg=true
    }

    this.level = $get_level(this)

    var ctx = context
    while(ctx.parent!==undefined){
        switch(ctx.type) {
          case 'ctx_manager_alias':
              // an alias in "with ctx_manager as obj" is bound
              $B.bound[scope.id][value]={level: $get_level(this)}
              break
          case 'list_or_tuple':
          case 'dict_or_set':
          case 'call_arg':
          case 'def':
          case 'lambda':
            if(ctx.vars===undefined){ctx.vars=[value]}
            else if(ctx.vars.indexOf(value)===-1){ctx.vars.push(value)}
            if(this.call_arg&&ctx.type==='lambda'){
                if(ctx.locals===undefined){ctx.locals=[value]}
                else{ctx.locals.push(value)}
            }
        }
        ctx = ctx.parent
    }

    if(context.type=='packed'){
        // An id defined as "packed" (eg "a, *b = [1, 2, 3]") is bound
        $B.bound[scope.id][value]={level: $get_level(this)}
        this.bound = true
    }

    if(context.type=='target_list' ||
        (context.type=='expr' && context.parent.type=='target_list')){
        // An id defined as a target in a "for" loop is bound
        $B.bound[scope.id][value]={level: $get_level(this)}
        this.bound = true
    }


    if(scope.ntype=='def' || scope.ntype=='generator'){
        // if variable is declared inside a comprehension,
        // don't add it to function namespace
        var _ctx=this.parent
        while(_ctx){
            if(_ctx.type=='list_or_tuple' && _ctx.is_comp()){
                this.in_comp = true
                return
            }
            _ctx = _ctx.parent
        }
        if(context.type=='expr' && context.parent.type=='comp_if'){
            // form {x for x in foo if x>5} : don't put x in referenced names
            return
        }else if(context.type=='global'){
            if(scope.globals === undefined){
                scope.globals = [value]
            }else if(scope.globals.indexOf(value)==-1){
                scope.globals.push(value)
            }
        }
    }

    this.to_js = function(arg){

        // Store the result in this.result
        // For generator expressions, to_js() is called in $make_node and
        // $B.bound has been deleted

        if(this.result!==undefined && this.scope.ntype=='generator'){
            return this.result
        }

        this.js_processed=true
        var val = this.value

        var is_local = $B.bound[this.scope.id][val]!==undefined,
            this_node = $get_node(this),
            bound_before = this_node.bound_before

        if(this.scope.nonlocals && this.scope.nonlocals[val]!==undefined){
            this.nonlocal = true
        }

        // If name is bound in the scope, but not yet bound when this
        // instance of $IdCtx was created, it is resolved by a call to
        // $search or $local_search
        this.unbound = this.unbound || (is_local && !this.bound &&
            bound_before && bound_before.indexOf(val)==-1)

        if((!this.bound) && this.scope.context && this.scope.ntype=='class' &&
                this.scope.context.tree[0].name == val){
            // Name of class referenced inside the class. Cf. issue #649
            return '$B.$search("'+val+'")'
        }

        if(this.unbound && !this.nonlocal){
            if(this.scope.ntype=='def' || this.scope.ntype=='generator'){
                return '$B.$local_search("'+val+'")'
            }else{
                return '$B.$search("'+val+'")'
            }
        }

        // Special cases
        //if(val=='eval') val = '$eval'
        if(val=='__BRYTHON__' || val == '$B'){return val}

        var innermost = $get_scope(this),
            scope = innermost, found=[]

        // get global scope
        var gs = innermost
        while(gs.parent_block && gs.parent_block.id!=='__builtins__'){
            gs = gs.parent_block
        }
        var global_ns = '$locals_'+gs.id.replace(/\./g,'_')

        // Build the list of scopes where the variable name is bound
        while(1){
            if($B.bound[scope.id]===undefined){
                console.log('name '+val+' undef '+scope.id)
            }
            if($B._globals[scope.id]!==undefined &&
                $B._globals[scope.id][val]!==undefined){
                // Variable is declared as global. If the name is bound in the global
                // scope, use it ; if the name is being bound, bind it in the global namespace.
                // Else return a call to a function that searches the name in globals,
                // and throws NameError if not found
                if($B.bound[gs.id][val]!==undefined || this.bound){
                    this.result = global_ns+'["'+val+'"]'
                    return this.result
                }else{
                    this.result = '$B.$global_search("'+val+'")'
                    return this.result
                }
            }
            if(scope===innermost){
                // Handle the case when the same name is used at both sides
                // of an assignment and the right side is defined in an
                // upper scope, eg "range = range"
                var bound_before = this_node.bound_before

                if(bound_before && !this.bound){
                    if(bound_before.indexOf(val)>-1){found.push(scope)}
                    else if(scope.context &&
                        scope.context.tree[0].type=='def' &&
                        scope.context.tree[0].env.indexOf(val)>-1){
                         found.push(scope)
                    }
                }else{
                    if($B.bound[scope.id][val]){
                        // the name is bound somewhere in the local scope
                        if(!this.bound && this_node.locals[val]===undefined){
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
                //console.log(val, scope.id, Object.keys($B.bound))
                if($B.bound[scope.id] === undefined){
                    console.log('no bound', scope.id)
                }
                if($B.bound[scope.id][val]){found.push(scope)}
            }
            if(scope.parent_block){scope=scope.parent_block}
            else{break}
        }
        this.found = found
        if(this.nonlocal && found[0]===innermost){found.shift()}

        if(found.length>0){
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
            //         if i==1:
            //             return x   # x is local but not yet found by parser
            //         elif i==0:
            //             x = 'ok'

            if(!this.bound && found[0].context && found[0]===innermost
                && val.charAt(0)!='$'){
                var locs = $get_node(this).locals || {},
                    nonlocs = innermost.nonlocals

                if(locs[val]===undefined &&
                    ((innermost.type!='def' || innermost.type!='generator') &&
                        innermost.context.tree[0].args.indexOf(val)==-1) &&
                    (nonlocs===undefined || nonlocs[val]===undefined)){
                    this.result = '$B.$local_search("'+val+'")'
                    return this.result
                }
            }
            if(found.length>1 && found[0].context){

                if(found[0].context.tree[0].type=='class' && !this.bound){
                    var ns0='$locals_'+found[0].id.replace(/\./g,'_'),
                        ns1='$locals_'+found[1].id.replace(/\./g,'_'),
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
                        if(bound_before.indexOf(val)>-1){
                            this.found = $B.bound[found[0].id][val]
                            res = ns0
                        }else{
                            this.found = $B.bound[found[1].id][val]
                            res = ns1
                        }
                        this.result = res+'["'+val+'"]'
                        return this.result
                    }else{
                        this.found = false
                        var res = ns0 + '["'+val+'"]!==undefined ? '
                        res += ns0 + '["'+val+'"] : '
                        this.result = res + ns1 + '["'+val+'"]'
                        return this.result
                    }
                }
            }

            var scope = found[0]
            this.found = $B.bound[scope.id][val]
            var scope_ns = '$locals_'+scope.id.replace(/\./g,'_')

            if(scope.context===undefined){
                // name found at module level
                if(scope.id=='__builtins__'){
                    if(gs.blurred){
                        // If the program has "from <module> import *" we
                        // can't be sure by syntax analysis that the builtin
                        // name is not overridden
                        val = '('+global_ns+'["'+val+'"] || '+val+')'
                    }else{
                        // Builtin name ; it might be redefined inside the
                        // script, eg to redefine open()
                        if(val!=='__builtins__'){val = '$B.builtins.'+val}
                        this.is_builtin = true
                    }
                }else if(scope.id==scope.module){
                    // Name found at module level
                    if(this.bound || this.augm_assign){
                        // If the id is in the left part of a binding or
                        // an augmented assign, eg "x = 0" or "x += 5"
                        val = scope_ns+'["'+val+'"]'
                    }else{
                        if(scope===innermost && this.env[val]===undefined){
                            var locs = this_node.locals || {}
                            if(locs[val]===undefined){
                                // Name is bound in scope, but after the current node
                                // If it is a builtin name, use the builtin
                                // Cf issue #311
                                if(found.length>1 && found[1].id == '__builtins__'){
                                    this.is_builtin = true
                                    this.result = '$B.builtins.'+val+$to_js(this.tree,'')
                                    return this.result
                                }
                            }
                            // Call a function to return the value if it is defined
                            // in locals or globals, or throw a NameError
                            this.result = '$B.$search("'+val+'")'
                            return this.result
                        }else{
                            if(scope.level<=2){
                                // Name was bound in an instruction at indentation
                                // level 0 in the block : we are sure the name is
                                // defined in local scope
                                val = scope_ns+'["'+val+'"]'
                            }else{
                                // Else we must check if the name is actually
                                // defined, cf issue #362. This can be the case
                                // in code like :
                                //     if False:
                                //         x = 0
                                val = '$B.$check_def("'+val+'",'+scope_ns+'["'+val+'"])'
                            }
                        }
                    }
                }else{
                    val = scope_ns+'["'+val+'"]'
                }
            }else if(scope===innermost){
                if($B._globals[scope.id] && $B._globals[scope.id][val]){
                    val = global_ns+'["'+val+'"]'
                }else if(!this.bound && !this.augm_assign){
                    //if(scope.level<=3){
                        // Name is bound at indentation level 0 in the block :
                        // we are sure that it is defined in locals
                        //val = '$locals["'+val+'"]'
                    //}else{
                        // The name might not have actually been bound, eg in
                        //     def f():
                        //         if False:
                        //             x = 0
                        //         print(x)
                        var bind_level
                        if(this_node.locals && this_node.locals[val]){
                            bind_level = this_node.locals[val].level
                        }
                        if(bind_level!==undefined && bind_level<=this.level){
                            val = '$locals["'+val+'"]'
                        }else{
                            val = '$B.$check_def_local("'+val+'",$locals["'+val+'"])'
                        }
                    //}
                }else{
                    val = '$locals["'+val+'"]'
                }
            }else if(!this.bound && !this.augm_assign){
                // name was found between innermost and the global of builtins
                // namespace
                if(scope.ntype=='generator'){
                    // If the name is bound in a generator, we must search the value
                    // in the locals object for the currently executed function. It
                    // can be found as the second element of the frame stack at the
                    // same level up than the generator function
                    var up = 0, // number of levels of the generator above innermost
                        sc = innermost
                    while(sc!==scope){up++;sc=sc.parent_block}
                    var scope_name = "$B.frames_stack[$B.frames_stack.length-1-"+up+"][1]"
                    val = '$B.$check_def_free("'+val+'",'+scope_name+'["'+val+'"])'
                }else{
                    val = '$B.$check_def_free("'+val+'",'+scope_ns+'["'+val+'"])'
                }
            }else{
                val = scope_ns+'["'+val+'"]'
            }
            this.result = val+$to_js(this.tree,'')
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

            this.result = '$B.$global_search("'+val+'")'
            return this.result
        }
    }
}

function $ImaginaryCtx(context,value){
    // Class for the imaginary part of a complex number
    this.type = 'imaginary'
    this.value = value
    this.toString = function(){return 'imaginary '+this.value}
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.to_js = function(){
        this.js_processed=true
        return 'complex(0,'+this.value+')'
    }
}

function $ImportCtx(context){
    // Class for keyword "import"
    this.type = 'import'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.expect = 'id'

    this.toString = function(){return 'import '+this.tree}

    this.bind_names = function(){
        // For "import X", set X in the list of names bound in current scope
        var scope = $get_scope(this)
        for(var i=0;i<this.tree.length;i++){
            if(this.tree[i].name==this.tree[i].alias){
                var name = this.tree[i].name,
                    parts = name.split('.'),
                    bound = name
                if(parts.length>1){
                    bound = parts[0]
                }
            }else{
                bound = this.tree[i].alias
            }
            $B.bound[scope.id][bound] = {level: scope.level}
        }
    }

    this.to_js = function(){
        this.js_processed=true
        var scope = $get_scope(this),
            res = [],
            pos=0
        for(var i=0;i<this.tree.length;i++){
            var mod_name = this.tree[i].name,
                aliases = (this.tree[i].name == this.tree[i].alias)?
                    '{}' : ('{"' + mod_name + '" : "' +
                    this.tree[i].alias + '"}'),
                localns = '$locals_'+scope.id.replace(/\./g,'_');
            res[pos++] = '$B.$import("'+mod_name+'", [],'+aliases+',' +
                                   localns + ', true);'
        }
        // add None for interactive console
        return res.join('') + 'None;'
    }
}

function $ImportedModuleCtx(context,name){
    this.type = 'imported module'
    this.toString = function(){return ' (imported module) '+this.name}
    this.parent = context
    this.name = name
    this.alias = name
    context.tree[context.tree.length]=this
    this.to_js = function(){
        this.js_processed=true
        return '"'+this.name+'"'
    }
}

function $IntCtx(context,value){
    // Class for literal integers
    // value is a 2-elt tuple [base, value_as_string] where
    // base is one of 16 (hex literal), 8 (octal), 2 (binary) or 10 (int)
    this.type = 'int'
    this.value = value
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return 'int '+this.value}

    this.to_js = function(){
        this.js_processed=true
        var v = parseInt(value[1], value[0])
        if(v>$B.min_int && v<$B.max_int){return v}
        else{return '$B.LongInt("'+value[1]+'", '+value[0]+')'}
    }
}

function $JSCode(js){
    this.js = js
    this.toString = function(){return this.js}
    this.to_js = function(){
        this.js_processed=true
        return this.js
    }
}

function $KwArgCtx(context){
    // Class for keyword argument in a call
    this.type = 'kwarg'
    this.parent = context.parent
    this.tree = [context.tree[0]]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)

    // put id in list of kwargs
    // used to avoid passing the id as argument of a list comprehension
    var value = this.tree[0].value
    var ctx = context.parent.parent // type 'call'
    if(ctx.kwargs===undefined){ctx.kwargs=[value]}
    else if(ctx.kwargs.indexOf(value)===-1){ctx.kwargs.push(value)}
    else{$_SyntaxError(context,['keyword argument repeated'])}

    this.toString = function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}

    this.to_js = function(){
        this.js_processed=true
        var key = this.tree[0].value
        if(key.substr(0,2)=='$$'){key=key.substr(2)}
        var res = '{$nat:"kw",name:"'+key+'",'
        return res + 'value:'+$to_js(this.tree.slice(1,this.tree.length))+'}'
    }
}

function $LambdaCtx(context){
    // Class for keyword "lambda"
    this.type = 'lambda'
    this.parent = context
    context.tree[context.tree.length]=this
    this.tree = []
    this.args_start = $pos+6
    this.vars = []
    this.locals = []

    this.toString = function(){return '(lambda) '+this.args_start+' '+this.body_start}

    this.to_js = function(){

        this.js_processed=true

        var node = $get_node(this),
            module = $get_module(this),
            src = $B.$py_src[module.id],
            args = src.substring(this.args_start,this.body_start),
            body = src.substring(this.body_start+1,this.body_end)
            body = body.replace(/\\\n/g, ' ') // cf issue 582

        body = body.replace(/\n/g,' ')

        var scope = $get_scope(this)

        var rand = $B.UUID(),
            func_name = 'lambda_'+$B.lambda_magic+'_'+rand,
            py = 'def '+func_name+'('+args+'):\n'
        py += '    return '+body

        var lambda_name = 'lambda'+rand,
            module_name = module.id.replace(/\./g, '_'),
            scope_id = scope.id.replace(/\./g, '_')

        var js = $B.py2js(py, module_name, lambda_name, scope_id, node.line_num).to_js()

        js = '(function(){\n'+js+'\nreturn $locals.'+func_name+'\n})()'

        $B.clear_ns(lambda_name)
        delete $B.$py_src[lambda_name]

        return js
    }

}

function $ListOrTupleCtx(context,real){
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
    context.tree[context.tree.length]=this

    this.toString = function(){
        switch(this.real) {
          case 'list':
            return '(list) ['+this.tree+']'
          case 'list_comp':
          case 'gen_expr':
            return '('+this.real+') ['+this.intervals+'-'+this.tree+']'
          default:
            return '(tuple) ('+this.tree+')'
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
        var scope = $get_scope(this)
        var ident = scope.id
        while($B.$py_src[ident]===undefined && $B.modules[ident].parent_block){
            ident = $B.modules[ident].parent_block.id
        }
        // replace comments by whitespace, cf. issue #658
        var src = $B.$py_src[ident]
        if(scope.comments === undefined){return src}
        for(var i=0; i<scope.comments.length; i++){
            var start = scope.comments[i][0],
                len = scope.comments[i][1]
            src = src.substr(0, start) + ' '.repeat(len + 1) +
                src.substr(start + len + 1)
        }
        return src
    }

    this.ids = function(){
        // Return an object indexed by all "simple" variable names in the list
        // or tuple, ie not calls, subscriptions etc.
        var _ids = {}
        for(var i=0;i<this.tree.length;i++){
            var item = this.tree[i]
            if(item.type=='id'){_ids[item.value]=true}
            else if(item.type=='expr' && item.tree[0].type=="id"){
                _ids[item.tree[0].value]=true
            }else if(item.type=='list_or_tuple' ||
                (item.type=="expr" && item.tree[0].type=='list_or_tuple')){
                if(item.type=="expr"){item=item.tree[0]}
                for(var attr in item.ids()){_ids[attr]=true}
            }
        }
        return _ids
    }

    this.to_js = function(){
        this.js_processed=true
        var scope = $get_scope(this),
            sc = scope,
            scope_id = scope.id.replace(/\//g, '_'),
            env = [],
            pos=0
        while(sc && sc.id!=='__builtins__'){
            if(sc===scope){
                env[pos++]='["'+sc.id+'",$locals]'
            }else{
                env[pos++]='["'+sc.id+'",$locals_'+sc.id.replace(/\./g,'_')+']'
            }
            sc = sc.parent_block
        }
        var module_name = $get_module(this).module

        switch(this.real) {
          case 'list':
            return '$B.$list(['+$to_js(this.tree)+'])'
          case 'list_comp':
          case 'gen_expr':
          case 'dict_or_set_comp':
            var src = this.get_src()
            var res1 = [], items = []

            if(this.comments !== undefined){
                console.log('comments in comp', this.comments)
            }

            var qesc = new RegExp('"',"g") // to escape double quotes in arguments
            for(var i=1;i<this.intervals.length;i++){
                var txt = src.substring(this.intervals[i-1],this.intervals[i])
                items.push(txt)
                var lines = txt.split('\n')
                var res2=[], pos=0

                for(var j=0;j<lines.length;j++){
                    var txt = lines[j]
                    // ignore empty lines
                    if(txt.replace(/ /g,'').length==0){continue}
                    txt = txt.replace(/\n/g,' ')
                    txt = txt.replace(/\\/g,'\\\\')
                    txt = txt.replace(qesc,'\\"')
                    res2[pos++]='"'+txt+'"'
                }
                res1.push('['+res2.join(',')+']')
            }

            var line_num = $get_node(this).line_num

            switch(this.real) {
              case 'list_comp':
                var local_name = scope.id.replace(/\./g,'_')
                var lc = $B.$list_comp(items), // defined in py_utils.js
                    py = lc[0], ix=lc[1],
                    listcomp_name = 'lc'+ix,
                    local_name = scope.id.replace(/\./g,'_')
                var save_pos = $pos

                var root = $B.py2js({src:py, is_comp:true}, module_name,
                    listcomp_name, local_name, line_num)

                $pos = save_pos

                var js = root.to_js()

                root = null
                $B.clear_ns(listcomp_name)
                delete $B.$py_src[listcomp_name]

                js += 'return $locals_lc'+ix+'["x'+ix+'"]'
                js = '(function(){'+js+'})()'
                return js

              case 'dict_or_set_comp':
                if(this.expression.length===1){
                    return $B.$gen_expr(module_name, scope_id, items, line_num)
                }

                return $B.$dict_comp(module_name, scope_id, items, line_num)

            }

            // Generator expression
            // Pass the module name and the id of current block
            // $B.$gen_expr is in py_utils.js
            return $B.$gen_expr(module_name, scope_id, items, line_num)

          case 'tuple':
            if(this.tree.length===1 && this.has_comma===undefined){
                return this.tree[0].to_js()
            }
            return 'tuple(['+$to_js(this.tree)+'])'
        }
    }
}

function $NodeCtx(node){
    // Base class for the context in a node
    this.node = node
    node.context = this
    this.tree = []
    this.type = 'node'

    var scope = null
    var tree_node = node
    while(tree_node.parent && tree_node.parent.type!=='module'){
        var ntype = tree_node.parent.context.tree[0].type

        var _break_flag=false
        switch(ntype) {
          case 'def':
          case 'class':
          case 'generator':
            //if(['def', 'class', 'generator'].indexOf(ntype)>-1){
            scope = tree_node.parent
            _break_flag=true
        }
        if (_break_flag) break

        tree_node = tree_node.parent
    }
    if(scope==null){
        scope = tree_node.parent || tree_node // module
    }

    // When a new node is created, a copy of the names currently
    // bound in the scope is created. It is used in $IdCtx to detect
    // names that are referenced but not yet bound in the scope
    this.node.locals = clone($B.bound[scope.id])

    this.toString = function(){return 'node '+this.tree}

    this.to_js = function(){
        if(this.js!==undefined){return this.js}
        this.js_processed=true
        if(this.tree.length>1){
            var new_node = new $Node()
            var ctx = new $NodeCtx(new_node)
            ctx.tree = [this.tree[1]]
            new_node.indent = node.indent+4
            this.tree.pop()
            node.add(new_node)
        }
        if(node.children.length==0){
            this.js = $to_js(this.tree)+';'
        }else{
            this.js = $to_js(this.tree)
        }
        return this.js
    }
}

function $NodeJS(js){
    var node = new $Node()
    new $NodeJSCtx(node, js)
    return node
}

function $NodeJSCtx(node,js){
    // Class used for raw JS code
    this.node = node
    node.context = this
    this.type = 'node_js'
    this.tree = [js]
    this.toString = function(){return 'js '+js}
    this.to_js = function(){
        this.js_processed=true
        return js
    }
}

function $NonlocalCtx(context){
    // Class for keyword "nonlocal"
    this.type = 'global'
    this.parent = context
    this.tree = []
    this.names = {}
    context.tree[context.tree.length]=this
    this.expect = 'id'

    this.scope = $get_scope(this)
    this.scope.nonlocals = this.scope.nonlocals || {}

    if(this.scope.context===undefined){
        $_SyntaxError(context,["nonlocal declaration not allowed at module level"])
    }

    this.toString = function(){return 'global '+this.tree}

    this.add = function(name){
        if($B.bound[this.scope.id][name]=='arg'){
            $_SyntaxError(context,["name '"+name+"' is parameter and nonlocal"])
        }
        this.names[name] = [false, $pos]
        this.scope.nonlocals[name] = true
    }

    this.transform = function(node, rank){
        var pscope = this.scope.parent_block
        if(pscope.context===undefined){
            $_SyntaxError(context,["no binding for nonlocal '"+
                $B.last(Object.keys(this.names))+"' found"])
        }else{
            while(pscope!==undefined && pscope.context!==undefined){
                for(var name in this.names){
                    if($B.bound[pscope.id][name]!==undefined){
                        this.names[name] = [true]
                    }
                }
                pscope = pscope.parent_block
            }
            for(var name in this.names){
                if(!this.names[name][0]){
                    console.log('nonlocal error, context '+context)
                    // restore $pos to get the correct error line
                    $pos = this.names[name][1]
                    $_SyntaxError(context,["no binding for nonlocal '"+name+"' found"])
                }
            }
            //if(this.scope.globals.indexOf(name)==-1){this.scope.globals.push(name)}
        }
    }

    this.to_js = function(){
        this.js_processed=true
        return ''
    }
}


function $NotCtx(context){
    // Class for keyword "not"
    this.type = 'not'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return 'not ('+this.tree+')'}
    this.to_js = function(){
        this.js_processed=true
        return '!$B.$bool('+$to_js(this.tree)+')'
    }
}

function $OpCtx(context,op){
    // Class for operators ; context is the left operand
    this.type = 'op'
    this.op = op
    this.parent = context.parent
    this.tree = [context]
    this.scope = $get_scope(this)

    // Get type of left operand
    if(context.type=="expr"){
        if(['int','float','str'].indexOf(context.tree[0].type)>-1){
            this.left_type = context.tree[0].type
        }else if(context.tree[0].type=="id"){
            var binding = $B.bound[this.scope.id][context.tree[0].value]
            if(binding){this.left_type=binding.type}
        }
    }

    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)

    this.toString = function(){return '(op '+this.op+') ['+this.tree+']'}


    this.to_js = function(){
        this.js_processed=true
        var comps = {'==':'eq','!=':'ne','>=':'ge','<=':'le',
            '<':'lt','>':'gt'}
        if(comps[this.op]!==undefined){
            var method=comps[this.op]
            if(this.tree[0].type=='expr' && this.tree[1].type=='expr'){
                var t0=this.tree[0].tree[0],t1=this.tree[1].tree[0]
                switch(t1.type) {
                  case 'int':
                    switch (t0.type) {
                      case 'int':
                        if(t0.value>$B.min_int && t0.value<$B.max_int &&
                            t1.value>$B.min_int && t1.value<$B.max_int){
                                return t0.to_js()+this.op+t1.to_js()
                        }else{
                            return 'getattr('+this.tree[0].to_js()+',"__'+
                                method+'__")('+this.tree[1].to_js()+')'
                        }
                      case 'str':
                        return '$B.$TypeError("unorderable types: int() < str()")'
                      case 'id':
                        var res = 'typeof '+t0.to_js()+'=="number" ? '
                        res += t0.to_js()+this.op+t1.to_js()+' : '
                        res += 'getattr('+this.tree[0].to_js()
                        res += ',"__'+method+'__")('+this.tree[1].to_js()+')'
                        return res
                    }

                    break;
                  case 'str':
                    switch(t0.type) {
                      case 'str':
                        return t0.to_js()+this.op+t1.to_js()
                      case 'int':
                        return '$B.$TypeError("unorderable types: str() < int()")'
                      case 'id':
                        var res = 'typeof '+t0.to_js()+'=="string" ? '
                        res += t0.to_js()+this.op+t1.to_js()+' : '
                        res += 'getattr('+this.tree[0].to_js()
                        res += ',"__'+method+'__")('+this.tree[1].to_js()+')'
                        return res
                    }
                    break;
                  case 'id':
                    if(t0.type=='id'){
                        var res = 'typeof '+t0.to_js()+'!="object" && '+
                            'typeof '+t0.to_js()+'==typeof '+t1.to_js() +
                            ' ? '+t0.to_js()+this.op+t1.to_js()+' : ' +
                            '$B.rich_comp("__'+method+'__",' +
                            this.tree[0].to_js()+','+this.tree[1].to_js()+')'
                        return res
                    }
                    break;
                } //switch
            }
        }
        switch(this.op) {
          case 'and':
              var op0 = this.tree[0].to_js(),
                  op1 = this.tree[1].to_js()
              if(this.wrap!==undefined){
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
                  return '(function(){var '+this.wrap.name+'='+this.wrap.js+
                          ';return $B.$test_expr($B.$test_item('+
                          op0+') && $B.$test_item('+op1+'))})()'
              }else{
                return '$B.$test_expr($B.$test_item('+op0+')&&'+
                        '$B.$test_item('+op1+'))'
              }
          case 'or':
            var res ='$B.$test_expr($B.$test_item('+this.tree[0].to_js()+')||'
            return res + '$B.$test_item('+this.tree[1].to_js()+'))'
          case 'in':
            return '$B.$is_member('+$to_js(this.tree)+')'
          case 'not_in':
            return '!$B.$is_member('+$to_js(this.tree)+')'
          case 'unary_neg':
          case 'unary_pos':
          case 'unary_inv':
            // For unary operators, the left operand is the unary sign(s)
            var op, method
            if(this.op=='unary_neg'){op='-';method='__neg__'}
            else if(this.op=='unary_pos'){op='+';method='__pos__'}
            else{op='~';method='__invert__'}
            // for integers or float, replace their value using
            // Javascript operators
            if(this.tree[1].type=="expr"){
                var x = this.tree[1].tree[0]
                switch(x.type) {
                  case 'int':
                    var v = parseInt(x.value[1], x.value[0])
                    if(v>$B.min_int && v<$B.max_int){return op+v}
                    // for long integers, use __neg__ or __invert__
                    return 'getattr('+x.to_js()+', "'+method+'")()'
                  case 'float':
                    return 'float('+op+x.value+')'
                  case 'imaginary':
                    return 'complex(0,'+op+x.value+')'
                }
            }
            return 'getattr('+this.tree[1].to_js()+',"'+method+'")()'
          case 'is':
            return '$B.$is('+this.tree[0].to_js() + ', ' +
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
                if(elt.type=='expr' && elt.tree[0].type=='int'){return true}
                else if(elt.type=='expr' && elt.tree[0].type=='float'){
                    has_float_lit = true
                    return true
                }else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple'
                    && elt.tree[0].real=='tuple'
                    && elt.tree[0].tree.length==1
                    && elt.tree[0].tree[0].type=='expr'){
                    return is_simple(elt.tree[0].tree[0].tree[0])
                }else if (elt.type=='expr' && elt.tree[0].type=='id'){
                    var _var = elt.tree[0].to_js()
                    if(vars.indexOf(_var)==-1){vars.push(_var)}
                    return true
                }else if(elt.type=='op' && ['*','+','-'].indexOf(elt.op)>-1){
                    for(var i=0;i<elt.tree.length;i++){
                        if(!is_simple(elt.tree[i])){return false}
                    }
                    return true
                }
                return false
            }
            function get_type(ns, v){
                var t
                if(['int','float','str'].indexOf(v.type)>-1){
                    t = v.type
                }else if(v.type=='id' && ns[v.value]){
                    t = ns[v.value].type
                }
                return t
            }
            var e0=this.tree[0],e1=this.tree[1]
            if(is_simple(this)){
                var v0 = this.tree[0].tree[0]
                var v1 = this.tree[1].tree[0]
                if(vars.length==0 && !has_float_lit){
                    // only integer literals
                    return this.simple_js()
                }else if(vars.length==0){
                    // numeric literals with at least one float
                    return 'new Number('+this.simple_js()+')'
                }else{
                    // at least one variable
                    var ns = $B.bound[scope.id],
                        t0 = get_type(ns, v0),
                        t1 = get_type(ns, v1)
                    // Static analysis told us the type of both ids
                    if((t0=='float' && t1=='float') ||
                          (this.op=='+' && t0=='str' && t1=='str')){
                        this.result_type = t0
                        return v0.to_js()+this.op+v1.to_js()
                    }else if(['int','float'].indexOf(t0)>-1 &&
                             ['int','float'].indexOf(t1)>-1){
                        if(t0=='int' && t1=='int'){this.result_type='int'}
                        else{this.result_type='float'}
                        switch(this.op){
                            case '+':
                                return '$B.add('+v0.to_js()+','+v1.to_js()+')'
                            case '-':
                                return '$B.sub('+v0.to_js()+','+v1.to_js()+')'
                            case '*':
                                return '$B.mul('+v0.to_js()+','+v1.to_js()+')'
                        }
                    }

                    var tests = [], tests1=[], pos=0
                    for(var i=0;i<vars.length;i++){
                        // Test if all variables are numbers
                        tests[pos]='typeof '+vars[i]+'.valueOf() == "number"'
                        // Test if all variables are integers
                        tests1[pos++]='typeof '+vars[i]+' == "number"'
                    }
                    var res = [tests.join(' && ')+' ? '], pos=1

                    res[pos++]='('+tests1.join(' && ')+' ? '

                    // If true, use basic formula
                    res[pos++]=this.simple_js()

                    // Else wrap simple formula in a float
                    res[pos++]=' : new Number('+this.simple_js()+')'

                    // Close integers test
                    res[pos++]=')'
                   // If at least one variable is not a number

                    // For addition, test if both arguments are strings
                    if(this.op=='+'){
                        res[pos++]=' : (typeof '+this.tree[0].to_js()+'=="string"'
                        res[pos++]=' && typeof '+this.tree[1].to_js()
                        res[pos++]='=="string") ? '+this.tree[0].to_js()
                        res[pos++]='+'+this.tree[1].to_js()
                    }
                    res[pos++]= ': getattr('+this.tree[0].to_js()+',"__'
                    res[pos++]= $operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
                    //if(this.op=='+'){console.log(res)}
                    return '('+res.join('')+')'
                }
            }
            if(comps[this.op]!==undefined){
                return '$B.rich_comp("__'+$operators[this.op]+'__",'+e0.to_js()+
                    ','+e1.to_js()+')'
            }else{
                return 'getattr('+e0.to_js()+', "__'+$operators[this.op]+
                    '__")('+e1.to_js()+')'
            }
          default:
            if(comps[this.op]!==undefined){
                return '$B.rich_comp("__'+$operators[this.op]+'__",'+
                    this.tree[0].to_js()+','+this.tree[1].to_js()+')'
            }else{
                return 'getattr('+this.tree[0].to_js()+', "__'+
                    $operators[this.op]+'__")('+this.tree[1].to_js()+')'
            }
        }
    }


    this.simple_js = function(){

        function sjs(elt){
            if(elt.type=='op'){return elt.simple_js()}
            else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple'
                && elt.tree[0].real=='tuple'
                && elt.tree[0].tree.length==1
                && elt.tree[0].tree[0].type=='expr'){
                return '('+elt.tree[0].tree[0].tree[0].simple_js()+')'
            }else{return elt.tree[0].to_js()}
        }
        if(op=='+'){return '$B.add('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
        else if(op=='-'){return '$B.sub('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
        else if(op=='*'){return '$B.mul('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
        else if(op=='/'){return '$B.div('+sjs(this.tree[0])+','+sjs(this.tree[1])+')'}
        else{return sjs(this.tree[0])+op+sjs(this.tree[1])}
    }
}

function $PackedCtx(context){
    // used for packed tuples in expressions, eg
    //     a, *b, c = [1, 2, 3, 4}
    this.type = 'packed'
    if(context.parent.type=='list_or_tuple'){
        for(var i=0;i<context.parent.tree.length;i++){
            var child = context.parent.tree[i]
            if(child.type=='expr' && child.tree.length>0
              && child.tree[0].type=='packed'){
                $_SyntaxError(context,["two starred expressions in assignment"])
            }
        }
    }
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return '(packed) '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}


function $PassCtx(context){
    // Class for keyword "pass"
    this.type = 'pass'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return '(pass)'}

    this.to_js = function(){
        this.js_processed=true
        return 'void(0)'
    }
}

function $RaiseCtx(context){
    // Class for keyword "raise"
    this.type = 'raise'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    this.toString = function(){return ' (raise) '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        var res = ''
        if(this.tree.length===0){return '$B.$raise()'}
        var exc = this.tree[0], exc_js = exc.to_js()
        return '$B.$raise('+exc_js+')'
    }
}

function $RawJSCtx(context,js){
    this.type = "raw_js"
    context.tree[context.tree.length]=this
    this.parent = context
    this.toString = function(){return '(js) '+js}
    this.to_js = function(){
        this.js_processed=true
        return js
    }
}

function $ReturnCtx(context){
    // Class for keyword "return"
    this.type = 'return'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    // Check if return is inside a "for" loop
    // In this case, the loop will not be included inside a function
    // for optimisation
    var node = $get_node(this)
    while(node.parent){
        if(node.parent.context){
            var elt = node.parent.context.tree[0]
            if(elt.type=='for'){
                elt.has_return = true
                break
            }else if(elt.type=='try'){
                elt.has_return = true
            }else if(elt.type=='single_kw' && elt.token=='finally'){
                elt.has_return = true
            }
        }
        node = node.parent
    }

    this.toString = function(){return 'return '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        if(this.tree.length==1 && this.tree[0].type=='abstract_expr'){
            // "return" must be transformed into "return None"
            this.tree.pop()
            new $IdCtx(new $ExprCtx(this,'rvalue',false),'None')
        }
        var scope = $get_scope(this)
        if(scope.ntype=='generator'){
            return 'return [$B.generator_return(' + $to_js(this.tree)+')]'
        }
        // Returning from a function means leaving the execution frame
        // If the return is in a try block with a finally block, the frames
        // will be restored when entering "finally"
        return 'var $res = '+$to_js(this.tree)+';'+
            '$B.leave_frame($local_name);return $res'
    }
}

function $SingleKwCtx(context,token){
    // Class for keywords "finally", "else"
    this.type = 'single_kw'
    this.token = token
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    // If token is "else" inside a "for" loop, set the flag "has_break"
    // on the loop, to force the creation of a boolean "$no_break"
    if(token=="else"){
        var node = context.node
        var pnode = node.parent
        for(var rank=0;rank<pnode.children.length;rank++){
            if(pnode.children[rank]===node) break
        }
        var pctx = pnode.children[rank-1].context
        if(pctx.tree.length>0){
            var elt = pctx.tree[0]
            if(elt.type=='for' ||
                elt.type=='asyncfor' ||
                (elt.type=='condition' && elt.token=='while')){
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
        if(this.token=='finally'){
            var scope = $get_scope(this)
            if(scope.ntype!='generator'){
                var scope_id = scope.id.replace(/\./g, '_'),
                    js = 'var $exit;if($B.frames_stack.length<$stack_length)'+
                    '{$exit=true;$B.frames_stack.push($top_frame)}'
                node.insert(0, $NodeJS(js))
                node.add($NodeJS('if($exit){$B.leave_frame("'+scope_id+'")}'))
            }
        }
    }

    this.to_js = function(){
        this.js_processed=true
        if(this.token=='finally') return this.token

        // For "else" we must check if the previous block was a loop
        // If so, check if the loop exited with a "break" to decide
        // if the block below "else" should be run
        if(this.loop_num!==undefined){
            var scope = $get_scope(this)
            var res = 'if($locals_'+scope.id.replace(/\./g,'_')
            return res +'["$no_break'+this.loop_num+'"])'
        }
        return this.token
    }
}

function $StarArgCtx(context){
    // Class for star args in calls, eg f(*args)
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this
    this.toString = function(){return '(star arg) '+this.tree}
    this.to_js = function(){
        this.js_processed=true
        return '{$nat:"ptuple",arg:'+$to_js(this.tree)+'}'
    }
}

function $StringCtx(context,value){
    // Class for literal strings
    this.type = 'str'
    this.parent = context
    this.tree = [value] // may be extended if consecutive strings eg 'a' 'b'
    this.raw = false
    context.tree[context.tree.length]=this

    this.toString = function(){return 'string '+(this.tree||'')}

    this.to_js = function(){
        this.js_processed=true
        var res = '', type = null

        function fstring(parsed_fstring){
            // generate code for a f-string
            // parsed_fstring is an array, the result of $B.parse_fstring()
            // in py_string.js
            var elts = []
            for(var i=0; i<parsed_fstring.length;i++){
                if(parsed_fstring[i].type=='expression'){
                    var expr = parsed_fstring[i].expression,
                        parts = expr.split(':')
                    expr = parts[0]
                    expr = expr.replace('\n', '\\n')
                    var expr1 = "$B.builtins.$$eval('("+expr+")')"
                    switch(parsed_fstring[i].conversion){
                        case "a":
                            expr1 = '$B.builtins.ascii('+expr1+')'
                            break
                        case "r":
                            expr1 = '$B.builtins.repr('+expr1+')'
                            break
                        case "s":
                            expr1 = '$B.builtins.str('+expr1+')'
                            break
                    }

                    var fmt = parts[1]
                    if(fmt!==undefined){
                        // Format specifier can also contain expressions
                        var parsed_fmt = $B.parse_fstring(fmt)
                        if(parsed_fmt.length > 1){
                            fmt = fstring(parsed_fmt)
                        }else{
                            fmt = "'" + fmt + "'"
                        }
                        var res1 = "$B.builtins.str.$dict.format('{0:' + " +
                            fmt + " + '}', " + expr1 + ")"
                        elts.push(res1)
                    }else{
                        elts.push(expr1)
                    }
                }else{
                    elts.push("'"+parsed_fstring[i]+"'")
                }
            }
            return elts.join(' + ')
        }

        for(var i=0;i<this.tree.length;i++){
            if(this.tree[i].type=="call"){
                // syntax like "hello"(*args, **kw) raises TypeError
                // cf issue 335
                var js = '(function(){throw TypeError("'+"'str'"+
                    ' object is not callable")}())'
                return js
            }else{
                var value=this.tree[i],
                    is_fstring = Array.isArray(value),
                    is_bytes = false

                if(!is_fstring){
                    is_bytes = value.charAt(0)=='b'
                }

                if(type==null){
                    type=is_bytes
                    if(is_bytes){res+='bytes('}
                }else if(type!=is_bytes){
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
                if(i<this.tree.length-1){res+='+'}
            }
        }
        if(is_bytes){res += ',"ISO-8859-1")'}
        return res
    }
}

function $SubCtx(context){
    // Class for subscription or slicing, eg x in t[x]
    this.type = 'sub'
    this.func = 'getitem' // set to 'setitem' if assignment
    this.value = context.tree[0]
    context.tree.pop()
    context.tree[context.tree.length]=this
    this.parent = context
    this.tree = []

    this.toString = function(){
        return '(sub) (value) '+this.value+' (tree) '+this.tree
    }

    this.to_js = function(){
        this.js_processed=true
        if(this.func=='getitem' && this.value.type=='id'){
            var type = $get_node(this).locals[this.value.value],
                val = this.value.to_js()
            if(type=='list'||type=='tuple'){
                if(this.tree.length==1){
                    return '$B.list_key('+val+
                        ', '+this.tree[0].to_js()+')'
                }else if(this.tree.length==2){
                    return '$B.list_slice('+val+
                        ', '+(this.tree[0].to_js()||"null")+','+
                        (this.tree[1].to_js()||"null")+')'
                }else if(this.tree.length==3){
                    return '$B.list_slice_step('+val+
                        ', '+(this.tree[0].to_js()||"null")+','+
                        (this.tree[1].to_js()||"null")+','+
                        (this.tree[2].to_js()||"null")+')'
                }
            }
        }
        if(this.func=='getitem' && this.tree.length==1){
            return '$B.$getitem('+this.value.to_js()+',' + this.tree[0].to_js()+')'
        }
        var res='', shortcut = false
        if(this.func!=='delitem' && Array.isArray &&
            this.tree.length==1 && !this.in_sub){
            var expr = '', x = this
            shortcut = true
            while(x.value.type=='sub'){
                expr += '['+x.tree[0].to_js()+']'
                x.value.in_sub = true
                x = x.value
            }
            var subs = x.value.to_js()+'['+x.tree[0].to_js()+']'
            res += '((Array.isArray('+x.value.to_js()+') || '
            res += 'typeof '+x.value.to_js()+'=="string")'
            res += ' && '+subs+'!==undefined ?'
            res += subs+expr+ ' : '
        }
        var val = this.value.to_js()
        res += 'getattr('+val+',"__'+this.func+'__")('
        if(this.tree.length===1){
            res += this.tree[0].to_js()+')'
        }else{
            var res1=[], pos=0
            for(var i=0;i<this.tree.length;i++){
                if(this.tree[i].type==='abstract_expr'){res1[pos++]='None'}
                else{res1[pos++]=this.tree[i].to_js()}
            }
            res += 'slice(' + res1.join(',') + '))'
        }
        return shortcut ? res+')' : res
    }
}

function $TargetListCtx(context){
    // Class for target of "for" in loops or comprehensions,
    // eg x in "for x in A"
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.expect = 'id'
    context.tree[context.tree.length]=this

    this.toString = function(){return '(target list) '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        return $to_js(this.tree)
    }
}

function $TernaryCtx(context){
    // Class for the ternary operator : "x if C else y"
    this.type = 'ternary'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    context.parent = this
    this.tree = [context]

    this.toString = function(){return '(ternary) '+this.tree}

    this.to_js = function(){
        this.js_processed=true
        var res = '$B.$bool('+this.tree[1].to_js()+') ? ' // condition
        res += this.tree[0].to_js()+' : '    // result if true
        return res + this.tree[2].to_js()          // result if false
    }
}

function $TryCtx(context){
    // Class for the keyword "try"
    this.type = 'try'
    this.parent = context
    context.tree[context.tree.length]=this

    this.toString = function(){return '(try) '}

    this.transform = function(node,rank){
        if(node.parent.children.length===rank+1){
            $_SyntaxError(context,"missing clause after 'try' 1")
        }else{
            var next_ctx = node.parent.children[rank+1].context.tree[0]
            switch(next_ctx.type) {
              case 'except':
              case 'finally':
              case 'single_kw':
                break
              default:
                $_SyntaxError(context,"missing clause after 'try' 2")
            }
        }
        var scope = $get_scope(this)

        var $var='var $failed'+$loop_num

        // Transform node into Javascript 'try' (necessary if
        // "try" inside a "for" loop)
        // add a boolean $failed, used to run the 'else' clause
        var js = $var+'=false;\n'+' '.repeat(node.indent+8)+
            'try'
        new $NodeJSCtx(node, js)
        node.is_try = true // used in generators
        node.has_return = this.has_return

        // Insert new 'catch' clause
        var catch_node = new $Node()
        new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
        catch_node.is_catch = true
        node.parent.insert(rank+1,catch_node)

        // Fake line to start the 'else if' clauses
        var new_node = new $Node()
        // Set the boolean $failed to true
        // Set attribute "pmframe" (post mortem frame) to $B in case an error
        // happens in a callback function ; in this case the frame would be
        // lost at the time the exception is handled by $B.exception
        new $NodeJSCtx(new_node,$var+'=true;$B.pmframe=$B.last($B.frames_stack);if(0){}')
        catch_node.insert(0,new_node)

        var pos = rank+2
        var has_default = false // is there an "except:" ?
        var has_else = false // is there an "else" clause ?
        var has_finally = false
        while(1){
            if(pos===node.parent.children.length){break}
            var ctx = node.parent.children[pos].context.tree[0]
            if(ctx.type==='except'){
                // move the except clauses below catch_node
                if(has_else){$_SyntaxError(context,"'except' or 'finally' after 'else'")}
                if(has_finally){$_SyntaxError(context,"'except' after 'finally'")}
                ctx.error_name = '$err'+$loop_num
                if(ctx.tree.length>0 && ctx.tree[0].alias!==null
                    && ctx.tree[0].alias!==undefined){
                    // syntax "except ErrorName as Alias"
                    var new_node = new $Node()
                    var alias = ctx.tree[0].alias
                    var js = '$locals["'+alias+'"]'
                    js += '=$B.exception($err'+$loop_num+')'
                    new $NodeJSCtx(new_node,js)
                    node.parent.children[pos].insert(0,new_node)
                }
                catch_node.insert(catch_node.children.length,
                    node.parent.children[pos])
                if(ctx.tree.length===0){
                    if(has_default){$_SyntaxError(context,'more than one except: line')}
                    has_default=true
                }
                node.parent.children.splice(pos,1)
            }else if(ctx.type==='single_kw' && ctx.token==='finally'){
                has_finally = true
                var finally_node = node.parent.children[pos]
                pos++
            }else if(ctx.type==='single_kw' && ctx.token==='else'){
                if(has_else){$_SyntaxError(context,"more than one 'else'")}
                if(has_finally){$_SyntaxError(context,"'else' after 'finally'")}
                has_else = true
                var else_body = node.parent.children[pos]
                node.parent.children.splice(pos,1)
            }else{break}
        }
        if(!has_default){
            // If no default except clause, add a line to throw the
            // exception if it was not caught
            var new_node = new $Node(), ctx = new $NodeCtx(new_node)
            catch_node.insert(catch_node.children.length,new_node)
            new $SingleKwCtx(ctx, 'else')
            new_node.add($NodeJS('throw $err'+$loop_num))
        }
        if(has_else){
            var else_node = new $Node()
            else_node.module = scope.module
            new $NodeJSCtx(else_node,'if(!$failed'+$loop_num+')')
            for(var i=0;i<else_body.children.length;i++){
                else_node.add(else_body.children[i])
            }
            // If the try block has a "finally" node, the "else" node must
            // be put in it, because the "else" block must be executed
            // before finally - cf issue #500
            if(has_finally){
                finally_node.insert(0, else_node)
            }else{
                node.parent.insert(pos,else_node)
            }
            pos++
        }

        $loop_num++
    }

    this.to_js = function(){
        this.js_processed=true
        return 'try'
    }

}

function $UnaryCtx(context,op){
    // Class for unary operators : - and ~
    this.type = 'unary'
    this.op = op
    this.parent = context
    context.tree[context.tree.length]=this

    this.toString = function(){return '(unary) '+this.op}

    this.to_js = function(){
        this.js_processed=true
        return this.op
    }
}

function $WithCtx(context){
    // Class for keyword "with"
    this.type = 'with'
    this.parent = context
    context.tree[context.tree.length]=this
    this.tree = []
    this.expect = 'as'
    this.scope = $get_scope(this)

    this.toString = function(){return '(with) '+this.tree}

    this.set_alias = function(arg){
        console.log('set with alias', arg)
        this.tree[this.tree.length-1].alias = arg
        $B.bound[this.scope.id][arg] = {level: this.scope.level}
        if(this.scope.ntype !== 'module'){
            // add to function local names
            this.scope.context.tree[0].locals.push(arg)
        }
    }

    this.transform = function(node,rank){

        while(this.tree.length>1){
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
            for(var i=0;i<suite.length;i++){
                new_node.add(suite[i])
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

        node.is_try = true // for generators that use a context manager

        if(this.transformed) return  // used if inside a for loop

        // If there are several "with" clauses, create a new child
        // For instance :
        //     with x as x1, y as y1:
        //         ...
        // becomes
        //     with x as x1:
        //         with y as y1:
        //             ...

        if(this.tree.length>1){
            var nw = new $Node()
            var ctx = new $NodeCtx(nw)
            nw.parent = node
            nw.module = node.module
            nw.indent = node.indent+4
            var wc = new $WithCtx(ctx)
            wc.tree = this.tree.slice(1)
            for(var i=0;i<node.children.length;i++){
                nw.add(node.children[i])
            }
            node.children = [nw]
            this.transformed = true

            return
        }

        var num = this.num = $loop_num

        if(this.tree[0].alias===null){this.tree[0].alias = '$temp'}

        // Form "with (a,b,c) as (x,y,z)"

        if(this.tree[0].type=='expr' &&
            this.tree[0].tree[0].type=='list_or_tuple'){
            if(this.tree[1].type!='expr' ||
                this.tree[1].tree[0].type!='list_or_tuple'){
                    $_SyntaxError(context)
            }
            if(this.tree[0].tree[0].tree.length!=this.tree[1].tree[0].tree.length){
                $_SyntaxError(context,['wrong number of alias'])
            }
            // this.tree[1] is a list of alias for items in this.tree[0]
            var ids = this.tree[0].tree[0].tree
            var alias = this.tree[1].tree[0].tree
            this.tree.shift()
            this.tree.shift()
            for(var i=ids.length-1;i>=0;i--){
                ids[i].alias = alias[i].value
                this.tree.splice(0,0,ids[i])
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
            var js = '$locals'+'["'+alias+'"] = $value'+num
            var value_node = new $Node()
            new $NodeJSCtx(value_node, js)
            try_node.add(value_node)
        }

        // place block inside a try clause
        for(var i=0;i<block.length;i++){try_node.add(block[i])}

        var catch_node = new $Node()
        catch_node.is_catch = true // for generators
        new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')

        var fbody = new $Node(), indent=node.indent+4
        var js = '$exc'+num+' = false;$err'+$loop_num+'=$B.exception($err'+
            $loop_num+')\n'+' '.repeat(indent)+
            'if(!$B.$bool($ctx_manager_exit'+num+'($err'+$loop_num+
            '.__class__.$factory,'+'$err'+$loop_num+
            ',getattr($err'+$loop_num+',"traceback"))))'
        js += '{throw $err'+$loop_num+'}'
        new $NodeJSCtx(fbody,js)
        catch_node.add(fbody)
        node.add(catch_node)

        var finally_node = new $Node()
        new $NodeJSCtx(finally_node,'finally')
        finally_node.context.type = 'single_kw'
        finally_node.context.token = 'finally'
        finally_node.context.in_ctx_manager = true
        finally_node.is_except = true
        finally_node.in_ctx_manager = true
        var fbody = new $Node()
        new $NodeJSCtx(fbody,'if($exc'+num+'){$ctx_manager_exit'+num+
            '(None,None,None)}')
        finally_node.add(fbody)
        node.parent.insert(rank+1,finally_node)

        $loop_num++

        this.transformed = true
    }

    this.to_js = function(){
        this.js_processed=true
        var indent = $get_node(this).indent, h=' '.repeat(indent+4),
            num = this.num
        var res = 'var $ctx_manager'+num+' = '+this.tree[0].to_js()+
            '\n'+h+'var $ctx_manager_exit'+num+
            '= getattr($ctx_manager'+num+',"__exit__")\n'+
            h+'var $value'+num+' = getattr($ctx_manager'+num+
            ',"__enter__")()\n'
        res += h+'var $exc'+num+' = true\n'
        return res + h+'try'
    }
}

function $YieldCtx(context){
    // Class for keyword "yield"
    this.type = 'yield'
    this.toString = function(){return '(yield) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree[context.tree.length]=this

    // Syntax control : 'yield' can start a 'yield expression'
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
          var ctx = context
          while(ctx.parent) ctx=ctx.parent
          ctx.node.yield_atoms.push(this)
          break;
       default:
          // else it is a SyntaxError
          $_SyntaxError(context,'yield atom must be inside ()')
    }

    var scope = this.scope = $get_scope(this)
    if(!scope.is_function){
        $_SyntaxError(context,["'yield' outside function"])
    }else if(scope.has_return_with_arguments){
        $_SyntaxError(context,["'return' with argument inside generator"])
    }

    // Change type of function to generator
    var def = scope.context.tree[0]
    def.type = 'generator'

    // Add to list of "yields" in function
    def.yields.push(this)

    this.toString = function(){return '(yield) '+(this.from ? '(from) ' : '')+this.tree}

    this.transform = function(node, rank){

        if(this.from===true){

            // replace "yield from X" by "for $temp in X: yield $temp"

            var new_node = new $Node()
            new_node.locals = node.locals
            node.parent.children.splice(rank,1)
            node.parent.insert(rank, new_node)

            var for_ctx = new $ForExpr(new $NodeCtx(new_node))
            new $IdCtx(new $ExprCtx(for_ctx,'id',false),'$temp'+$loop_num)
            $B.bound[this.scope.id]['$temp'+$loop_num] = true
            for_ctx.tree[1] = this.tree[0]
            this.tree[0].parent = for_ctx

            var yield_node = new $Node()
            new_node.locals = node.locals
            new_node.add(yield_node)
            new $IdCtx(new $YieldCtx(new $NodeCtx(yield_node)),'$temp'+$loop_num)

            var ph_node = new $Node()
            new $NodeJSCtx(ph_node,'// placeholder for generator sent value')
            ph_node.set_yield_value = true
            new_node.add(ph_node)

            // apply "transform" to the newly created "for"
            for_ctx.transform(new_node, rank)

            $loop_num++

        }else{

            var new_node = new $Node()
            new $NodeJSCtx(new_node,'// placeholder for generator sent value')
            new_node.set_yield_value = true
            node.parent.insert(rank+1,new_node)
        }
    }

    this.to_js = function(){
        this.js_processed=true
        //var scope = $get_scope(this)
        //var res = ''
        if(this.from===undefined) return $to_js(this.tree) || 'None'

        // form "yield from <expr>" : <expr> is this.tree[0]

        return $to_js(this.tree)
    }
}

function $add_profile(node,rank){
    if(node.type==='module'){
        var i=0
        while(i<node.children.length){
            i += $add_profile(node.children[i],i)
        }
    }else{
        var elt=node.context.tree[0],offset=1
        var flag = true
        var pnode = node
        while(pnode.parent!==undefined){pnode=pnode.parent}
        var mod_id = pnode.id
        // ignore lines added in transform()
        if(node.line_num===undefined){flag=false}
        // Don't add line num before try,finally,else,elif
        // because it would throw a syntax error in Javascript
        if(elt.type==='condition' && elt.token==='elif'){flag=false}
        else if(elt.type==='except'){flag=false}
        else if(elt.type==='single_kw'){flag=false}
        if(flag){
            // add a trailing None for interactive mode
            var new_node = new $Node()
            new $NodeJSCtx(new_node,';$B.$profile.count("'+mod_id+'",'+node.line_num+');')
            node.parent.insert(rank,new_node)
            offset = 2
        }
        var i=0
        while(i<node.children.length) i+=$add_profile(node.children[i],i)

            return offset
    }
}

function $add_line_num(node,rank){
    if(node.type==='module'){
        var i=0
        while(i<node.children.length){
            i += $add_line_num(node.children[i],i)
        }
    }else{
        var elt=node.context.tree[0],offset=1
        var flag = true
        var pnode = node
        while(pnode.parent!==undefined){pnode=pnode.parent}
        var mod_id = pnode.id
        // ignore lines added in transform()
        if(node.line_num===undefined){flag=false}
        // Don't add line num before try,finally,else,elif
        // because it would throw a syntax error in Javascript
        if(elt.type==='condition' && elt.token==='elif'){flag=false}
        else if(elt.type==='except'){flag=false}
        else if(elt.type==='single_kw'){flag=false}
        if(flag){
            // add a trailing None for interactive mode
            var js=';$locals.$line_info="'+node.line_num+','+mod_id+'";'

            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            node.parent.insert(rank,new_node)
            offset = 2
        }
        var i=0
        while(i<node.children.length) i+=$add_line_num(node.children[i],i)

        // At the end of a "while" or "for" loop body, add a line to reset
        // line number to that of the "while" or "for" loop (cf issue #281)
        if((elt.type=='condition' && elt.token=="while")
            || node.context.type=='for'){
            node.add($NodeJS('$locals.$line_info="'+node.line_num+','+
                mod_id+'";'))
        }

        return offset
    }
}

function $bind(name, scope_id, level){
    // Bind a name in scope_id
    if($B.bound[scope_id][name]!==undefined){
        // If the name is already bound, use the smallest level
        if(level<$B.bound[scope_id][name].level){
            $B.bound[scope_id][name].level = level
        }
    }else{
        $B.bound[scope_id][name] = {level: level}
    }
}

function $previous(context){
    var previous = context.node.parent.children[context.node.parent.children.length-2]
    if(!previous || !previous.context){
        $_SyntaxError(context, 'keyword not following correct keyword')
    }
    return previous.context.tree[0]
}

function $get_docstring(node){
    var doc_string=''
    if(node.children.length>0){
        var firstchild = node.children[0]
        if(firstchild.context.tree && firstchild.context.tree[0].type=='expr'){
            var expr = firstchild.context.tree[0].tree[0]
            // Set as docstring if first child is a string, but not a f-string
            if(expr.type=='str' && !Array.isArray(expr.tree[0])){
                doc_string = firstchild.context.tree[0].tree[0].to_js()
            }
        }
    }
    return doc_string
}

function $get_scope(context){
    // Return the instance of $Node indicating the scope of context
    // Return null for the root node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node,
        scope = null,
        level = 1

    while(tree_node.parent && tree_node.parent.type!=='module'){
        var ntype = tree_node.parent.context.tree[0].type

        switch (ntype) {
          case 'def':
          case 'class':
          case 'generator':
            var scope = tree_node.parent
            scope.ntype = ntype
            scope.is_function = ntype!='class'
            scope.level = level
            return scope
        }
        tree_node = tree_node.parent
        level++
    }
    var scope = tree_node.parent || tree_node // module
    scope.ntype = "module"
    scope.level = level
    return scope
}

function $get_level(ctx){
    var nd = $get_node(ctx),
        level = 0
    while(nd.parent!==undefined){
        level++
        nd = nd.parent
    }
    return level
}

function $get_module(context){
    // Return the instance of $Node for the module where context
    // is defined
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var scope = null
    while(tree_node.parent.type!=='module'){
        tree_node = tree_node.parent
    }
    var scope = tree_node.parent // module
    scope.ntype = "module"
    return scope
}

function $get_node(context){
    var ctx = context
    while(ctx.parent){ctx=ctx.parent}
    return ctx.node
}

function $get_blocks(name, scope){
    var res = []
    while(true){
        if($B.bound[scope.id][name]!==undefined){res.push(scope.id)}
        if(scope.parent_block){
            if(scope.parent_block.id=='__builtins__'){
                if(scope.blurred){return false}
            }
        }else{break}
        scope = scope.parent_block
    }
    return res
}

function $to_js_map(tree_element) {
    if (tree_element.to_js !== undefined) return tree_element.to_js()
    throw Error('no to_js() for '+tree_element)
}

function $to_js(tree,sep){
    if(sep===undefined){sep=','}

    return tree.map($to_js_map).join(sep)
}

function $arbo(ctx){
    while(ctx.parent!=undefined){ctx=ctx.parent}
    return ctx
}

function $mangle(name, context){
    // If name starts with __ and doesn't end with __, and if it is defined
    // in a class, "mangle" it, ie preprend _<classname>
    if(name.substr(0, 2)=="__" && name.substr(name.length-2)!=="__"){
        var klass = null,
            scope = $get_scope(context)
        while(true){
            if(scope.ntype=="module"){return name}
            else if(scope.ntype=="class"){
                var class_name = scope.context.tree[0].name
                while(class_name.charAt(0)=='_'){class_name=class_name.substr(1)}
                return '_' + class_name + name
            }else{
                if(scope.parent && scope.parent.context){
                    scope = $get_scope(scope.context.tree[0])
                }else{return name}
            }
        }
    }else{return name}
}

// Function called in function $tokenise for each token found in the
// Python source code

function $transition(context,token){

    //console.log('context '+context+' token '+token, arguments[2])

    switch(context.type) {
      case 'abstract_expr':


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
        }

        switch(token) {
          case 'id':
            return new $IdCtx(new $ExprCtx(context,'id',commas),arguments[2])
          case 'str':
            return new $StringCtx(new $ExprCtx(context,'str',commas),arguments[2])
          case 'bytes':
            return new $StringCtx(new $ExprCtx(context,'bytes',commas),arguments[2])
          case 'int':
            return new $IntCtx(new $ExprCtx(context,'int',commas),arguments[2])
          case 'float':
            return new $FloatCtx(new $ExprCtx(context,'float',commas),arguments[2])
          case 'imaginary':
            return new $ImaginaryCtx(new $ExprCtx(context,'imaginary',commas),arguments[2])
          case '(':
            return new $ListOrTupleCtx(new $ExprCtx(context,'tuple',commas),'tuple')
          case '[':
            return new $ListOrTupleCtx(new $ExprCtx(context,'list',commas),'list')
          case '{':
            return new $DictOrSetCtx(new $ExprCtx(context,'dict_or_set',commas))
          case '.':
            return new $EllipsisCtx(new $ExprCtx(context,'ellipsis',commas))
          case 'not':
            if(context.type==='op'&&context.op==='is'){ // "is not"
                context.op = 'is_not'
                return context
            }
            return new $NotCtx(new $ExprCtx(context,'not',commas))
          case 'lambda':
            return new $LambdaCtx(new $ExprCtx(context,'lambda',commas))
          case 'op':
            var tg = arguments[2]
            switch(tg) {
              case '*':
                context.parent.tree.pop() // remove abstract expression
                var commas = context.with_commas
                context = context.parent
                return new $PackedCtx(new $ExprCtx(context,'expr',commas))
              case '-':
              case '~':
              case '+':
                // create a left argument for operator "unary"
                context.parent.tree.pop()
                var left = new $UnaryCtx(context.parent,tg)
                // create the operator "unary"
                if(tg=='-'){var op_expr = new $OpCtx(left,'unary_neg')}
                else if(tg=='+'){var op_expr = new $OpCtx(left,'unary_pos')}
                else{var op_expr = new $OpCtx(left,'unary_inv')}
                return new $AbstractExprCtx(op_expr,false)
              case 'not':
                context.parent.tree.pop() // remove abstract expression
                var commas = context.with_commas
                context = context.parent
                return new $NotCtx(new $ExprCtx(context,'not',commas))
            }
            $_SyntaxError(context,'token '+token+' after '+context)
          case '=':
            $_SyntaxError(context,token)
          case 'yield':
            return new $AbstractExprCtx(new $YieldCtx(context),true)
          case ':':
            return $transition(context.parent,token,arguments[2])
          case ')':
          case ',':
              switch(context.parent.type) {
                case 'list_or_tuple':
                case 'call_arg':
                case 'op':
                case 'yield':
                  break
                default:
                  $_SyntaxError(context,token)
              }// switch
        }// switch
        return $transition(context.parent,token,arguments[2])
      case 'annotation':
        return $transition(context.parent, token)
      case 'assert':
        if(token==='eol') return $transition(context.parent,token)
        $_SyntaxError(context,token)
      case 'assign':
        if(token==='eol'){
            if(context.tree[1].type=='abstract_expr'){
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            // If left is an id, update binding to the type of right operand
            context.guess_type()
            return $transition(context.parent,'eol')
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'attribute':
        if(token==='id'){
            var name = arguments[2]
            if(noassign[name]===true){$_SyntaxError(context,
                ["cannot assign to "+name])}
            name = $mangle(name, context)
            context.name=name
            return context.parent
        }
        $_SyntaxError(context,token)
      case 'augm_assign':
        if(token==='eol'){
            if(context.tree[1].type=='abstract_expr'){
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return $transition(context.parent,'eol')
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'break':
        if(token==='eol') return $transition(context.parent,'eol')
        $_SyntaxError(context,token)
      case 'call':
        switch(token) {
          case ',':
            if(context.expect=='id'){$_SyntaxError(context, token)}
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
            if(context.has_dstar) $_SyntaxError(context,token)
            context.expect = ','
            return $transition(new $CallArgCtx(context),token,arguments[2])
          case ')':
            context.end=$pos
            return context.parent
          case 'op':
            context.expect = ','
            switch(arguments[2]) {
              case '-':
              case '~':
              case '+':
                context.expect = ','
                return $transition(new $CallArgCtx(context),token,arguments[2])
              case '*':
                context.has_star = true;
                return new $StarArgCtx(context)
              case '**':
                context.has_dstar = true
                return new $DoubleStarArgCtx(context)
            } //switch(arguments[2])
            $_SyntaxError(context, token)
        } //switch (token)

        return $transition(context.parent,token,arguments[2])
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
            if(context.expect === 'id') {
               context.expect=','
               var expr = new $AbstractExprCtx(context,false)
               return $transition(expr,token,arguments[2])
            }
            break
          case '=':
            if (context.expect===',') {
               return new $ExprCtx(new $KwArgCtx(context),'kw_value',false)
            }
            break
          case 'for':
            // comprehension
            var lst = new $ListOrTupleCtx(context,'gen_expr')
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
            if (context.expect === 'id') {
               var op = arguments[2]
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
               }//switch
            }
            $_SyntaxError(context,'token '+token+' after '+context)
          case ')':
            if(context.parent.kwargs &&
              $B.last(context.parent.tree).tree[0] && // if call ends with ,)
              ['kwarg','star_arg','double_star_arg'].indexOf($B.last(context.parent.tree).tree[0].type)==-1){
                $_SyntaxError(context, ['non-keyword arg after keyword arg'])
            }
            if(context.tree.length>0){
                var son = context.tree[context.tree.length-1]
                if(son.type==='list_or_tuple'&&son.real==='gen_expr'){
                    son.intervals.push($pos)
                }
            }
            return $transition(context.parent,token)
          case ':':
            if (context.expect ===',' && context.parent.parent.type==='lambda') {
               return $transition(context.parent.parent,token)
            }
            break
          case ',':
            if (context.expect===',') {
              if(context.parent.kwargs &&
                ['kwarg','star_arg', 'double_star_arg'].indexOf($B.last(context.parent.tree).tree[0].type)==-1){
                    console.log('err2')
                  $_SyntaxError(context, ['non-keyword arg after keyword arg'])
              }
              //return new $CallArgCtx(context.parent)
              return $transition(context.parent, token, arguments[2])
            }
            console.log('context '+context+'token '+token+' expect '+context.expect)
        }// switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'class':
        switch(token) {
          case 'id':
            if (context.expect === 'id') {
               context.set_name(arguments[2])
               context.expect = '(:'
               return context
            }
            break
          case '(':
            return new $CallCtx(context)
          case ':':
            return $BodyCtx(context)
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'comp_if':
        return $transition(context.parent,token,arguments[2])
      case 'comp_for':
        if(token==='in' && context.expect==='in'){
            context.expect = null
            return new $AbstractExprCtx(new $CompIterableCtx(context),true)
        }
        if(context.expect===null){
            // ids in context.tree[0] are local to the comprehension
            return $transition(context.parent,token,arguments[2])
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'comp_iterable':
        return $transition(context.parent,token,arguments[2])
      case 'comprehension':
        switch(token) {
          case 'if':
            return new $AbstractExprCtx(new $CompIfCtx(context),false)
          case 'for':
            return new $TargetListCtx(new $CompForCtx(context))
        }
        return $transition(context.parent,token,arguments[2])
      case 'condition':
        if(token===':') return $BodyCtx(context)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'continue':
        if(token=='eol') return context.parent
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'ctx_manager_alias':
        switch(token){
          case ',':
          case ':':
            return $transition(context.parent, token, arguments[2])
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'decorator':
        if(token==='id' && context.tree.length===0){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }
        if(token==='eol') {
            return $transition(context.parent,token)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'def':
        switch(token) {
          case 'id':
            if(context.name) {
              $_SyntaxError(context,'token '+token+' after '+context)
            }
            context.set_name(arguments[2])
            return context
          case '(':
            if(context.name===null){
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            context.has_args=true;
            return new $FuncArgs(context)
          case 'annotation':
            return new $AbstractExprCtx(new $AnnotationCtx(context), true)
          case ':':
            if(context.has_args) return $BodyCtx(context)
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'del':
        if(token==='eol') return $transition(context.parent,token)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'dict_or_set':
        if(context.closed){
            switch(token) {
              case '[':
                return new $AbstractExprCtx(new $SubCtx(context.parent),false)
              case '(':
                return new $CallArgCtx(new $CallCtx(context))
            }
            return $transition(context.parent,token,arguments[2])
        }else{
            if(context.expect===','){
                switch(token) {
                  case '}':
                    switch(context.real) {
                      case 'dict_or_set':
                         if (context.tree.length !== 1) break
                         context.real='set'   // is this needed?
                      case 'set':
                      case 'set_comp':
                      case 'dict_comp':
                         context.items = context.tree
                         context.tree = []
                         context.closed = true
                         return context
                      case 'dict':
                        if (context.tree.length%2 === 0) {
                           context.items = context.tree
                           context.tree = []
                           context.closed = true
                           return context
                        }
                    }//switch
                    $_SyntaxError(context,'token '+token+' after '+context)
                  case ',':
                    if(context.real==='dict_or_set'){context.real='set'}
                    if(context.real==='dict' && context.tree.length%2){
                        $_SyntaxError(context,'token '+token+' after '+context)
                    }
                    context.expect = 'id'
                    return context
                  case ':':
                    if(context.real==='dict_or_set'){context.real='dict'}
                    if(context.real==='dict'){
                        context.expect=','
                        return new $AbstractExprCtx(context,false)
                    }else{$_SyntaxError(context,'token '+token+' after '+context)}
                  case 'for':
                    // comprehension
                    if(context.real==='dict_or_set'){context.real = 'set_comp'}
                    else{context.real='dict_comp'}
                    var lst = new $ListOrTupleCtx(context,'dict_or_set_comp')
                    lst.intervals = [context.start+1]
                    lst.vars = context.vars
                    context.tree.pop()
                    lst.expression = context.tree
                    context.tree = [lst]
                    lst.tree = []
                    var comp = new $ComprehensionCtx(lst)
                    return new $TargetListCtx(new $CompForCtx(comp))

                } //switch(token)
                $_SyntaxError(context,'token '+token+' after '+context)
            }else if(context.expect==='id'){
                switch(token) {
                  case '}':
                    if(context.tree.length==0){ // empty dict
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
                    var expr = new $AbstractExprCtx(context,false)
                    return $transition(expr,token,arguments[2])
                  case 'op':
                    switch(arguments[2]) {
                      case '+':
                        // ignore unary +
                        return context
                      case '-':
                      case '~':
                        // create a left argument for operator "unary"
                        context.expect = ','
                        var left = new $UnaryCtx(context,arguments[2])
                        // create the operator "unary"
                        if(arguments[2]=='-'){var op_expr = new $OpCtx(left,'unary_neg')}
                        else if(arguments[2]=='+'){var op_expr = new $OpCtx(left,'unary_pos')}
                        else{var op_expr = new $OpCtx(left,'unary_inv')}
                        return new $AbstractExprCtx(op_expr,false)
                    }//switch
                    $_SyntaxError(context,'token '+token+' after '+context)
                } //switch
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return $transition(context.parent,token,arguments[2])
        }
      case 'double_star_arg':
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
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case ',':
          case ')':
            return $transition(context.parent,token)
          case ':':
            if (context.parent.parent.type==='lambda'){
              return $transition(context.parent.parent,token)
            }
        }
        $_SyntaxError(context,'token '+token+' after '+context)

      case 'ellipsis':
          if(token=='.'){context.nbdots++;return context}
          else{
              if(context.nbdots!=3){
                  $pos--;$_SyntaxError(context,'token '+token+' after '+context)
              }else{
                  return $transition(context.parent, token, arguments[2])
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
            if (context.expect === 'id') {
               context.expect = 'as'
               return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
            }
          case 'as':
            // only one alias allowed
            if (context.expect === 'as' && context.has_alias===undefined){
               context.expect = 'alias'
               context.has_alias = true
               return context
            }
          case 'id':
            if (context.expect === 'alias') {
               context.expect=':'
               context.set_alias(arguments[2])
               return context
            }
            break
          case ':':
            var _ce=context.expect
            if (_ce == 'id' || _ce == 'as' || _ce == ':') {
               return $BodyCtx(context)
            }
            break
          case '(':
            if (context.expect === 'id' && context.tree.length ===0) {
               context.parenth = true
               return context
            }
            break
          case ')':
            if (context.expect == ',' || context.expect == 'as') {
               context.expect = 'as'
               return context
            }
          case ',':
            if (context.parenth!==undefined && context.has_alias === undefined &&
                (context.expect == 'as' || context.expect == ',')) {
                context.expect='id'
                return context
            }
        }// switch
        $_SyntaxError(context,'token '+token+' after '+context.expect)
      case 'expr':
        switch(token) {
          case 'id':
          case 'imaginary':
          case 'int':
          case 'float':
          case 'str':
          case 'bytes':
          case 'lamdba':
            $_SyntaxError(context,'token '+token+' after '+context)
            break
          case '[':
          case '(':
          case '{':
          case '.':
          case 'not':
            if(context.expect==='expr'){
              context.expect = ','
              return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
            }
        }
        switch(token) {
          case 'not':
            if (context.expect === ',') return new $ExprNot(context)
            break
          case 'in':
            if(context.parent.type=='target_list'){
                // expr used for target list
                return $transition(context.parent, token)
            }
            if(context.expect===',') return $transition(context,'op','in')
            break
          case ',':
            if(context.expect===','){
               if(context.with_commas){
                 // implicit tuple
                 context.parent.tree.pop()
                 var tuple = new $ListOrTupleCtx(context.parent,'tuple')
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
            return new $AbstractExprCtx(new $SubCtx(context),true)
          case '(':
            return new $CallCtx(context)
          case 'op':
            // handle operator precedence
            var op_parent=context.parent,op=arguments[2]

            // conditional expressions have the lowest priority
            if(op_parent.type=='ternary' && op_parent.in_else){
                var new_op = new $OpCtx(context,op)
                return new $AbstractExprCtx(new_op,false)
            }

            var op1 = context.parent,repl=null
            while(1){
                if(op1.type==='expr'){op1=op1.parent}
                else if(op1.type==='op'
                    &&$op_weight[op1.op]>=$op_weight[op]
                    && !(op1.op=='**' && op=='**') // cf. issue #250
                    ){
                        repl=op1;op1=op1.parent
                }else if(op1.type=="not" && $op_weight['not']>$op_weight[op]){
                    repl=op1;op1=op1.parent
                }else{break}
            }
            if(repl===null){
                while(1){
                    if(context.parent!==op1){
                        context = context.parent
                        op_parent = context.parent
                    }else{
                        break
                    }
                }
                context.parent.tree.pop()
                var expr = new $ExprCtx(op_parent,'operand',context.with_commas)
                expr.expect = ','
                context.parent = expr
                var new_op = new $OpCtx(context,op)
                return new $AbstractExprCtx(new_op,false)
            }else{
                // issue #371
                if(op === 'and' || op === 'or'){
                    while(repl.parent.type==='not'||
                        (repl.parent.type==='expr'&&repl.parent.parent.type==='not')){
                        // 'and' and 'or' have higher precedence than 'not'
                        repl = repl.parent
                        op_parent = repl.parent
                    }
                }
            }
            if(repl.type==='op') {
                var _flag=false
                switch(repl.op) {
                  case '<':
                  case '<=':
                  case '==':
                  case '!=':
                  case 'is':
                  case '>=':
                  case '>':
                   _flag=true
                }//switch
                if (_flag) {
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
                       for(var attr in c2){c2_clone[attr]=c2[attr]}

                       // The variable c2 must be evaluated only once ; we
                       // generate a temporary variable name to replace
                       // c2.to_js() and c2_clone.to_js()
                       var vname = "$c"+chained_comp_num
                       c2.to_js = function(){return vname}
                       c2_clone.to_js = function(){return vname}
                       chained_comp_num++

                       // If there are consecutive chained comparisons
                       // we must go up to the uppermost 'and' operator
                       while(repl.parent && repl.parent.type=='op'){
                           if($op_weight[repl.parent.op]<$op_weight[repl.op]){
                               repl = repl.parent
                           }else{break}
                       }
                       repl.parent.tree.pop()

                       // Create a new 'and' operator, with the left operand
                       // equal to c1 <= c2
                       var and_expr = new $OpCtx(repl,'and')
                       // Set an attribute "wrap" to the $OpCtx instance.
                       // It will be used in an anomymous function where the
                       // temporary variable called vname will be set to the
                       // value of c2
                       and_expr.wrap = {'name': vname, 'js': c2js}

                       c2_clone.parent = and_expr
                       // For compatibility with the interface of $OpCtx,
                       // add a fake element to and_expr : it will be removed
                       // when new_op is created at the next line
                       and_expr.tree.push('xxx')
                       var new_op = new $OpCtx(c2_clone,op)
                       return new $AbstractExprCtx(new_op,false)
                   }// switch
                }// if _flag
            }
            repl.parent.tree.pop()
            var expr = new $ExprCtx(repl.parent,'operand',false)
            expr.tree = [op1]
            repl.parent = expr
            var new_op = new $OpCtx(repl,op) // replace old operation
            return new $AbstractExprCtx(new_op,false)
          case 'augm_assign':
            if(context.expect===','){
               return new $AbstractExprCtx(new $AugmentedAssignCtx(context,arguments[2]),true)
            }
            break
          case '=':
           if(context.expect===','){
               if(context.parent.type==="call_arg"){
                  return new $AbstractExprCtx(new $KwArgCtx(context),true)
               }else if(context.parent.type=="annotation"){
                   return $transition(context.parent.parent, token, arguments[2])
               }

               while(context.parent!==undefined){
                   context=context.parent
                   if(context.type=='condition'){
                       $_SyntaxError(context,'token '+token+' after '+context)
                   }
               }
               context = context.tree[0]
               return new $AbstractExprCtx(new $AssignCtx(context),true)
            }
            break
          case 'if':
            var in_comp = false,
                ctx = context.parent
            while(true){
                if(ctx.type=='comp_iterable'){in_comp=true;break}
                else if(ctx.parent!==undefined){ctx = ctx.parent}
                else{break}
            }
            if(in_comp){break}
              // Ternary operator : "expr1 if cond else expr2"
              // If the part before "if" is an operation, apply operator
              // precedence
              // Example : print(1+n if n else 0)
              var ctx = context
              while(ctx.parent && ctx.parent.type=='op'){
                ctx=ctx.parent
                if(ctx.type=='expr' && ctx.parent && ctx.parent.type=='op'){
                    ctx=ctx.parent
                }
              }
              return new $AbstractExprCtx(new $TernaryCtx(ctx),false)
        }//switch
        return $transition(context.parent,token)
      case 'expr_not':
        if(token=='in'){ // expr not in : operator
            context.parent.tree.pop()
            return new $AbstractExprCtx(new $OpCtx(context.parent,'not_in'),false)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'for':
        switch(token) {
          case 'in':
            return new $AbstractExprCtx(new $ExprCtx(context,'target list', true),false)
          case ':':
            if(context.tree.length<2){ // issue 638
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return $BodyCtx(context)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'from':
        switch(token) {
          case 'id':
            if(context.expect=='id'){
              context.add_name(arguments[2])
              context.expect = ','
              return context
            }
            if(context.expect==='alias'){
              context.aliases[context.names[context.names.length-1]]= arguments[2]
              context.expect=','
              return context
            }
          case '.':
            if(context.expect=='module'){
              if(token=='id'){context.module += arguments[2]}
              else{context.module += '.'}
              return context
            }
          case 'import':
            context.blocking = token=='import'
            if(context.expect=='module'){
              context.expect = 'id'
              return context
            }
          case 'op':

            if(arguments[2]=='*' && context.expect=='id'
              && context.names.length ==0){
               if($get_scope(context).ntype!=='module'){
                   $_SyntaxError(context,["import * only allowed at module level"])
               }
               context.add_name('*')
               context.expect = 'eol'
               return context
            }
          case ',':
            if(context.expect==','){
              context.expect = 'id'
              return context
            }
          case 'eol':
            switch(context.expect) {
              case ',':
              case 'eol':
                context.bind_names()
                return $transition(context.parent,token)
              case 'id':
                $_SyntaxError(context,['trailing comma not allowed without surrounding parentheses'])
              default:
                $_SyntaxError(context,['invalid syntax'])
            }
          case 'as':
            if (context.expect ==',' || context.expect=='eol'){
               context.expect='alias'
               return context
            }
          case '(':
            if (context.expect == 'id') {
               context.expect='id'
               return context
            }
          case ')':
            if (context.expect == ',' || context.expect=='id') {
               context.expect='eol'
               return context
            }
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'func_arg_id':
        switch(token) {
          case '=':
            if (context.expect==='='){
               context.parent.has_default = true
               var def_ctx = context.parent.parent
               if(context.parent.has_star_arg){
                   def_ctx.default_list.push(def_ctx.after_star.pop())
               }else{
                   def_ctx.default_list.push(def_ctx.positional_list.pop())
               }
               return new $AbstractExprCtx(context,false)
            }
            break
          case ',':
          case ')':
            if(context.parent.has_default && context.tree.length==0 &&
                context.parent.has_star_arg===undefined){
                console.log('parent '+context.parent, context.parent)
                $pos -= context.name.length
                $_SyntaxError(context,['non-default argument follows default argument'])
            }else{
                return $transition(context.parent,token)
            }
          case ':':
            // annotation associated with a function parameter
            if(context.parent.has_default){ // issue 610
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return new $AbstractExprCtx(new $AnnotationCtx(context), false)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'func_args':
        switch (token) {
           case 'id':
             if (context.expect==='id'){
                context.expect = ','
                if(context.names.indexOf(arguments[2])>-1){
                  $_SyntaxError(context,['duplicate argument '+arguments[2]+' in function definition'])
                }
             }
             return new $FuncArgIdCtx(context,arguments[2])
           case ',':
             if(context.has_kw_arg) $_SyntaxError(context,'duplicate kw arg')
             if(context.expect===','){
                context.expect = 'id'
                return context
             }
             $_SyntaxError(context,'token '+token+' after '+context)
           case ')':
             return context.parent
           case 'op':
             var op = arguments[2]
             context.expect = ','
             if(op=='*'){
                if(context.has_star_arg){$_SyntaxError(context,'duplicate star arg')}
                return new $FuncStarArgCtx(context,'*')
             }
             if(op=='**') return new $FuncStarArgCtx(context,'**')
             $_SyntaxError(context,'token '+op+' after '+context)
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'func_star_arg':
        switch(token) {
          case 'id':
            if (context.name===undefined){
               if(context.parent.names.indexOf(arguments[2])>-1){
                 $_SyntaxError(context,['duplicate argument '+arguments[2]+' in function definition'])
               }
            }
            context.set_name(arguments[2])
            context.parent.names.push(arguments[2])
            return context //.parent
          case ',':
          case ')':
            if (context.name===undefined){
               // anonymous star arg - found in configparser
               context.set_name('$dummy')
               context.parent.names.push('$dummy')
            }
            return $transition(context.parent,token)
          case ':':
            // annotation associated with a function parameter
            if(context.name===undefined){
                $_SyntaxError(context, 'annotation on an unnamed parameter')
            }
            return new $AbstractExprCtx(new $AnnotationCtx(context), false)
        }// switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'global':
        switch(token) {
          case 'id':
            if (context.expect==='id'){
               new $IdCtx(context,arguments[2])
               context.add(arguments[2])
               context.expect=','
               return context
            }
            break
          case ',':
            if (context.expect===','){
               context.expect='id'
               return context
            }
            break
          case 'eol':
            if (context.expect===','){
               return $transition(context.parent,token)
            }
            break
        } // switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'id':
        switch(token) {
          case '=':
            if(context.parent.type==='expr' &&
                context.parent.parent !== undefined &&
                context.parent.parent.type ==='call_arg'){
                    return new $AbstractExprCtx(new $KwArgCtx(context.parent),false)
            }
            return $transition(context.parent,token,arguments[2])
          case 'op':
            return $transition(context.parent,token,arguments[2])
          case 'id':
          case 'str':
          case 'int':
          case 'float':
          case 'imaginary':
            $_SyntaxError(context,'token '+token+' after '+context)
        }

        return $transition(context.parent,token,arguments[2])
      case 'import':
        switch(token) {
          case 'id':
            if (context.expect==='id'){
               new $ImportedModuleCtx(context,arguments[2])
               context.expect=','
               return context
            }
            if (context.expect==='qual'){
               context.expect = ','
               context.tree[context.tree.length-1].name += '.'+arguments[2]
               context.tree[context.tree.length-1].alias += '.'+arguments[2]
               return context
            }
            if (context.expect==='alias'){
               context.expect = ','
               context.tree[context.tree.length-1].alias = arguments[2]
               return context
            }
            break
          case '.':
            if (context.expect===','){
               context.expect = 'qual'
               return context
            }
            break
          case ',':
            if (context.expect===','){
               context.expect = 'id'
               return context
            }
            break
          case 'as':
            //}else if(token==='as' &&
            if (context.expect===','){
               context.expect = 'alias'
               return context
            }
            break
          case 'eol':
            if (context.expect===','){
               context.bind_names()
               return $transition(context.parent,token)
            }
            break
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context)
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
            $_SyntaxError(context,'token '+token+' after '+context)
        }
        return $transition(context.parent,token,arguments[2])
      case 'kwarg':
        if(token===',') return new $CallArgCtx(context.parent.parent)
        return $transition(context.parent,token)
      case 'lambda':
        if(token===':' && context.args===undefined){
            context.args = context.tree
            context.tree = []
            context.body_start = $pos
            return new $AbstractExprCtx(context,false)
        }
        if(context.args!==undefined){ // returning from expression
            context.body_end = $pos
            return $transition(context.parent,token)
        }
        if(context.args===undefined){
            return $transition(new $CallCtx(context),token,arguments[2])
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'list_or_tuple':
        if(context.closed){
            if(token==='[') return new $AbstractExprCtx(new $SubCtx(context.parent),false)
            if(token==='(') return new $CallCtx(context)
            return $transition(context.parent,token,arguments[2])
        }else{
            if(context.expect===','){
               switch(context.real) {
                  case 'tuple':
                  case 'gen_expr':
                    if (token===')'){
                       context.closed = true
                       if(context.real==='gen_expr'){context.intervals.push($pos)}
                       return context.parent
                    }
                    break
                  case 'list':
                  case 'list_comp':
                    if (token===']'){
                       context.closed = true
                       if(context.real==='list_comp'){context.intervals.push($pos)}
                       return context
                    }
                    break
                  case 'dict_or_set_comp':
                    if (token==='}'){
                       context.intervals.push($pos)
                       return $transition(context.parent,token)
                    }
                    break
               }

               switch(token) {
                 case ',':
                   if(context.real==='tuple'){context.has_comma=true}
                   context.expect = 'id'
                   return context
                 case 'for':
                   // comprehension
                   if(context.real==='list'){context.real = 'list_comp'}
                   else{context.real='gen_expr'}
                   // remove names already referenced in list from the function
                   // references
                   context.intervals = [context.start+1]
                   context.expression = context.tree
                   context.tree = [] // reset tree
                   var comp = new $ComprehensionCtx(context)
                   return new $TargetListCtx(new $CompForCtx(comp))
               }//switch
               return $transition(context.parent,token,arguments[2])
            }else if(context.expect==='id'){
               switch(context.real) {
                 case 'tuple':
                   if (token===')'){
                      context.closed = true
                      return context.parent
                   }
                   if (token=='eol' && context.implicit===true){
                      context.closed = true
                      return $transition(context.parent,token)
                   }
                   break
                 case 'gen_expr':
                   if (token===')'){
                      context.closed = true
                      return $transition(context.parent,token)
                   }
                   break
                 case 'list':
                   if (token===']'){
                      context.closed = true
                      return context
                   }
                   break
               }// switch

               switch(token) {
                 case '=':
                   if (context.real=='tuple' && context.implicit===true){
                      context.closed = true
                      context.parent.tree.pop()
                      var expr=new $ExprCtx(context.parent,'tuple',false)
                      expr.tree=[context]
                      context.parent=expr
                      return $transition(context.parent,token)
                   }
                   break
                 case ')':
                   break
                 case ']':
                   if(context.real=='tuple' && context.implicit===true){
                       // Syntax like d[1,]=2
                       return $transition(context.parent, token, arguments[2])
                   }else{
                       break
                   }
                 case ',':
                   $_SyntaxError(context,'unexpected comma inside list')
                 default:
                   context.expect = ','
                   var expr = new $AbstractExprCtx(context,false)
                   return $transition(expr,token,arguments[2])
               }//switch

            }else{return $transition(context.parent,token,arguments[2])}
        }
      case 'list_comp':
        switch(token) {
          case ']':
            return context.parent
          case 'in':
            return new $ExprCtx(context,'iterable',true)
          case 'if':
            return new $ExprCtx(context,'condition',true)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
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
            return $transition(expr,token,arguments[2])
          case 'op':
            switch(arguments[2]) {
              case '*':
              case '+':
              case '-':
              case '~':
                var expr = new $AbstractExprCtx(context,true)
                return $transition(expr,token,arguments[2])
            }// switch
            break
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
            return new $AbstractExprCtx(new $ConditionCtx(context,token),false)
          case 'elif':
            var previous = $previous(context)
            if(['condition'].indexOf(previous.type)==-1 ||
                previous.token=='while'){
                $_SyntaxError(context, 'elif after '+previous.type)
            }
            return new $AbstractExprCtx(new $ConditionCtx(context,token),false)
          case 'else':
            var previous = $previous(context)
            if(['condition', 'except', 'for'].indexOf(previous.type)==-1){
                $_SyntaxError(context, 'else after '+previous.type)
            }
            return new $SingleKwCtx(context,token)
          case 'finally':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type)==-1 &&
                (previous.type!='single_kw' || previous.token!='else')){
                $_SyntaxError(context, 'finally after '+previous.type)
            }
            return new $SingleKwCtx(context,token)
          case 'try':
            return new $TryCtx(context)
          case 'except':
            var previous = $previous(context)
            if(['try', 'except'].indexOf(previous.type)==-1){
                $_SyntaxError(context, 'except after '+previous.type)
            }
            return new $ExceptCtx(context)
          case 'assert':
            return new $AbstractExprCtx(new $AssertCtx(context),'assert',true)
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
            if(context.tree.length===0){ // might be the case after a :
                context.node.parent.children.pop()
                return context.node.parent.context
            }
            return context
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'not':
        switch(token) {
          case 'in':
            // not is always in an expression : remove it
            context.parent.parent.tree.pop() // remove 'not'
            return new $ExprCtx(new $OpCtx(context.parent,'not_in'),'op',false)
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
            return $transition(expr,token,arguments[2])
          case 'op':
            var a=arguments[2]
            if ('+' == a || '-' == a || '~' == a) {
              var expr = new $AbstractExprCtx(context,false)
              return $transition(expr,token,arguments[2])
            }
        }//switch
        return $transition(context.parent,token)
      case 'op':
        if(context.op===undefined){
            $_SyntaxError(context,['context op undefined '+context])
        }
        if(context.op.substr(0,5)=='unary' && token != 'eol'){
            if(context.parent.type=='assign' || context.parent.type=='return'){
                // create and return a tuple whose first element is context
                context.parent.tree.pop()
                var t = new $ListOrTupleCtx(context.parent,'tuple')
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
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case 'op':
            switch(arguments[2]) {
              case '+':
              case '-':
              case '~':
                return new $UnaryCtx(context,arguments[2])
            }//switch
          default:
            if(context.tree[context.tree.length-1].type=='abstract_expr'){
              $_SyntaxError(context,'token '+token+' after '+context)
            }
        }// switch
        var t0=context.tree[0], t1=context.tree[1]
        if(t0.tree && t1.tree){
            t0 = t0.tree[0]
            t1 = t1.tree[0]
        }
        return $transition(context.parent,token)
      case 'packed':
        if(token==='id'){
            new $IdCtx(context,arguments[2])
            context.parent.expect = ','
            return context.parent
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'pass':
        if(token==='eol') return context.parent
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'raise':
        switch(token) {
          case 'id':
            if (context.tree.length===0){
               return new $IdCtx(new $ExprCtx(context,'exc',false),arguments[2])
            }
            break
          case 'from':
            if (context.tree.length>0){
               return new $AbstractExprCtx(context,false)
            }
            break
          case 'eol':
            //if(token==='eol')
            return $transition(context.parent,token)
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'return':
        return $transition(context.parent,token)
      case 'single_kw':
        if(token===':') return $BodyCtx(context)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'star_arg':
        switch(token) {
          case 'id':
            if(context.parent.type=="target_list"){
                context.tree.push(arguments[2])
                context.parent.expect = ','
                console.log('return parent', context.parent)
                return context.parent
            }
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
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
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case ',':
            return $transition(context.parent,token)
          case ')':
            return $transition(context.parent,token)
          case ':':
            if(context.parent.parent.type==='lambda'){
              return $transition(context.parent.parent,token)
            }
        } //switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'str':
        switch(token) {
          case '[':
            return new $AbstractExprCtx(new $SubCtx(context.parent),false)
          case '(':
            // Strings are not callable. We replace the string by a call to
            // an object that will raise the correct exception
            context.parent.tree[0] = context
            return new $CallCtx(context.parent)
          case 'str':
            context.tree.push(arguments[2])
            return context
        }//switch
        return $transition(context.parent,token,arguments[2])
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
            return $transition(expr,token,arguments[2])
          case ']':
            return context.parent
          case ':':
            if(context.tree.length==0){
                new $AbstractExprCtx(context,false)
            }
            return new $AbstractExprCtx(context,false)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'target_list':
        switch(token) {
          case 'id':
            if(context.expect==='id'){
              context.expect = ','
              return new $IdCtx(new $ExprCtx(context, 'target', false),arguments[2])
            }
          case 'op':
            if(context.expect=='id' && arguments[2]=='*'){
                // form "for a, *b in X"
                return new $PackedCtx(context)
            }
          case '(':
          case '[':
            if(context.expect==='id'){
              context.expect = ','
              return new $TargetListCtx(context)
            }
          case ')':
          case ']':
            if(context.expect===',') return context.parent
          case ',':
            if(context.expect==','){
              context.expect='id'
              return context
            }
        } //switch

        if(context.expect===',') {
            return $transition(context.parent,token,arguments[2])
        }else if(token=='in'){
            // Support syntax "for x, in ..."
            return $transition(context.parent,token,arguments[2])
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'ternary':
        if(token==='else'){
            context.in_else = true
            return new $AbstractExprCtx(context,false)
        }
        return $transition(context.parent,token,arguments[2])
      case 'try':
        if(token===':') return $BodyCtx(context)
        $_SyntaxError(context,'token '+token+' after '+context)
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
            console.log(token,arguments[2],'after',context)
            var expr = context.parent
            context.parent.parent.tree.pop()
            var value = arguments[2]
            if(context.op==='-'){value="-"+value}
            else if(context.op==='~'){value=~value}
            return $transition(context.parent.parent,token,value)
          case 'id':
            // replace by x.__neg__(), x.__invert__ or x.__pos__
            context.parent.parent.tree.pop()
            var expr = new $ExprCtx(context.parent.parent,'call',false)
            var expr1 = new $ExprCtx(expr,'id',false)
            new $IdCtx(expr1,arguments[2]) // create id
            var repl = new $AttrCtx(expr)
            if(context.op==='+'){repl.name='__pos__'}
            else if(context.op==='-'){repl.name='__neg__'}
            else{repl.name='__invert__'}
            // new context is the expression above the id
            return expr1
          case 'op':
            if ('+' == arguments[2] || '-' == arguments[2]) {
               var op = arguments[2]
               if(context.op===op){context.op='+'}else{context.op='-'}
               return context
            }
        } //switch
        return $transition(context.parent,token,arguments[2])
      case 'with':
        switch(token) {
          case 'id':
            if(context.expect==='id'){
              context.expect = 'as'
              return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
            }
            if(context.expect==='alias'){
               if(context.parenth!==undefined){context.expect = ','}
               else{context.expect=':'}
               context.set_alias(arguments[2])
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
            if(context.expect==='id' && context.tree.length===0){
               context.parenth = true
               return context
            }else if(context.expect=='alias'){
               context.expect = ':'
               return new $TargetListCtx(context,false)
            }
            break
          case ')':
            if (context.expect == ',' || context.expect == 'as') {
               context.expect = ':'
               return context
            }
            break
          case ',':
            if(context.parenth!==undefined && context.has_alias === undefined &&
              (context.expect == ',' || context.expect == 'as')) {
                context.expect='id'
                return context
            }else if(context.expect=='as'){
                context.expect = 'id'
                return context
            }else if(context.expect==':'){
                context.expect = 'id'
                return context
            }
            break
        }//switch
        $_SyntaxError(context,'token '+token+' after '+context.expect)
      case 'yield':
        if(token=='from'){ // form "yield from <expr>"
            if(context.tree[0].type!='abstract_expr'){
                // 'from' must follow immediately "from"
                $_SyntaxError(context,"'from' must follow 'yield'")
            }
            context.from = true
            context.tree = []
            return new $AbstractExprCtx(context, true)
        }
        return $transition(context.parent,token)
    } // switch(context.type)
}

$B.forbidden = ['alert', 'arguments', 'case', 'catch', 'constructor', 'Date',
    'delete', 'default', 'document', 'enum', 'eval', 'extends', 'Error',
    'history','function', 'length', 'location', 'Math', 'new', 'null',
    'Number', 'RegExp', 'super', 'this','throw', 'var', 'window',
    'toLocaleString', 'toString', 'message']
$B.aliased_names = {}
for(var i=0;i<$B.forbidden.length;i++){$B.aliased_names[$B.forbidden[i]]=true}

var s_escaped = 'abfnrtvxuU"0123456789'+"'"+'\\', is_escaped={}
for(var i=0;i<s_escaped.length;i++){is_escaped[s_escaped.charAt(i)]=true}

function $tokenize(src,module,locals_id,parent_block_id,line_info){
    var br_close = {")":"(","]":"[","}":"{"}
    var br_stack = ""
    var br_pos = []
    var kwdict = ["class", "return", "break", "for","lambda","try","finally",
        "raise", "def", "from", "nonlocal", "while", "del", "global", "with",
        "as", "elif", "else", "if", "yield", "assert", "import", "except",
        "raise","in", "pass","with","continue","__debugger__"
        ]
    var unsupported = []
    var $indented = ['class','def','for','condition','single_kw','try','except','with']
    // from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words

    var int_pattern = new RegExp("^\\d+(j|J)?"),
        float_pattern1 = new RegExp("^\\d+\\.\\d*([eE][+-]?\\d+)?(j|J)?"),
        float_pattern2 = new RegExp("^\\d+([eE][+-]?\\d+)(j|J)?"),
        hex_pattern = new RegExp("^0[xX]([0-9a-fA-F]+)"),
        octal_pattern = new RegExp("^0[oO]([0-7]+)"),
        binary_pattern = new RegExp("^0[bB]([01]+)")

    var context = null
    var root = new $Node('module')
    root.module = module
    root.id = locals_id
    $B.modules[root.id] = root

    if(locals_id==parent_block_id){
        root.parent_block = $B.modules[parent_block_id].parent_block || $B.modules['__builtins__']
    }else{
        root.parent_block = $B.modules[parent_block_id] || $B.modules['__builtins__']
    }
    root.line_info = line_info
    root.indent = -1
    root.comments = []
    if(locals_id!==module){$B.bound[locals_id] = {}}
    var new_node = new $Node(),
        current = root,
        name = "",
        _type = null,
        pos = 0,
        indent = null,
        string_modifier = false

    if(typeof src=="object"){
        root.is_comp = src.is_comp
        src = src.src
    }
    var lnum = 1
    while(pos<src.length){
        var car = src.charAt(pos)
        // build tree structure from indentation
        if(indent===null){
            var indent = 0
            while(pos<src.length){
                var _s=src.charAt(pos)
                if(_s==" "){indent++;pos++}
                else if(_s=="\t"){
                    // tab : fill until indent is multiple of 8
                    indent++;pos++
                    if(indent%8>0) indent+=8-indent%8
                }else{break}
            }
            // ignore empty lines
            var _s=src.charAt(pos)
            if(_s=='\n'){pos++;lnum++;indent=null;continue}
            else if(_s==='#'){ // comment
                var offset = src.substr(pos).search(/\n/)
                if(offset===-1){break}
                pos+=offset+1;lnum++;indent=null;continue
            }
            new_node.indent = indent
            new_node.line_num = lnum
            new_node.module = module
            // attach new node to node with indentation immediately smaller
            if(indent>current.indent){
                // control that parent ended with ':'
                if(context!==null){
                    if($indented.indexOf(context.tree[0].type)==-1){
                        $pos = pos
                        $_SyntaxError(context,'unexpected indent',pos)
                    }
                }
                // add a child to current node
                current.add(new_node)
            }else if(indent<=current.indent &&
                $indented.indexOf(context.tree[0].type)>-1 &&
                context.tree.length<2){
                    $pos = pos
                    $_SyntaxError(context,'expected an indented block',pos)
            }else{ // same or lower level
                while(indent!==current.indent){
                    current = current.parent
                    if(current===undefined || indent>current.indent){
                        $pos = pos
                        $_SyntaxError(context,'unexpected indent',pos)
                    }
                }
                current.parent.add(new_node)
            }
            current = new_node
            context = new $NodeCtx(new_node)
            continue
        }
        // comment
        if(car=="#"){
            var end = src.substr(pos+1).search('\n')
            if(end==-1){end=src.length-1}
            // Keep track of comment positions
            root.comments.push([pos, end])
            pos += end+1;continue
        }
        // string
        if(car=='"' || car=="'"){
            var raw = context.type == 'str' && context.raw,
                bytes = false,
                fstring = false,
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
                    bytes=true;raw=true
                    break
                  case 'f':
                    fstring = true
                    break
                  case 'fr', 'rf':
                    fstring = true
                    raw = true
                    break
                }
                string_modifier = false
            }
            if(src.substr(pos,3)==car+car+car){_type="triple_string";end=pos+3}
            else{_type="string";end=pos+1}
            var escaped = false
            var zone = car
            var found = false
            while(end<src.length){
                if(escaped){
                    zone+=src.charAt(end)
                    if(raw && src.charAt(end)=='\\'){zone+='\\'}
                    escaped=false;end+=1
                }else if(src.charAt(end)=="\\"){
                    if(raw){
                        if(end<src.length-1 && src.charAt(end+1)==car){
                            zone += '\\\\'+car
                            end += 2
                        }else{
                            zone += '\\\\'
                            end++
                        }
                        escaped = true
                    } else {
                        if(src.charAt(end+1)=='\n'){
                            // explicit line joining inside strings
                            end += 2
                            lnum++
                        } else {
                            if(end < src.length-1 &&
                                is_escaped[src.charAt(end+1)]==undefined){
                                    zone += '\\'
                            }
                            zone+='\\'
                            escaped=true;end+=1
                        }
                    }
                } else if(src.charAt(end)=='\n' && _type!='triple_string'){
                    // In a string with single quotes, line feed not following
                    // a backslash raises SyntaxError
                    $pos = end
                    $_SyntaxError(context, ["EOL while scanning string literal"])
                } else if(src.charAt(end)==car){
                    if(_type=="triple_string" && src.substr(end,3)!=car+car+car){
                        zone += src.charAt(end)
                        end++
                    } else {
                        found = true
                        // end of string
                        $pos = pos
                        // Escape quotes inside string, except if they are already escaped
                        // In raw mode, always escape
                        var $string = zone.substr(1),string=''
                        for(var i=0;i<$string.length;i++){
                            var $car = $string.charAt(i)
                            if($car==car &&
                                (raw || (i==0 || $string.charAt(i-1)!=='\\'))){
                                    string += '\\'
                            }
                            string += $car
                        }
                        if(fstring){
                            try{
                                var elts = $B.parse_fstring(string) // in py_string.js
                            }catch(err){
                                $_SyntaxError(context, [err.toString()])
                            }
                        }

                        if(bytes){
                            context = $transition(context,'str','b'+car+string+car)
                        }else if(fstring){
                            context = $transition(context,'str', elts)
                        }else{
                            context = $transition(context,'str',car+string+car)
                        }
                        context.raw = raw;
                        pos = end+1
                        if(_type=="triple_string"){pos = end+3}
                        break
                    }
                } else {
                    zone += src.charAt(end)
                    if(src.charAt(end)=='\n'){lnum++}
                    end++
                }
            }
            if(!found){
                if(_type==="triple_string"){
                    $_SyntaxError(context,"Triple string end not found")
                }else{
                    $_SyntaxError(context,"String end not found")
                }
            }
            continue
        }
        // identifier ?
        if(name=="" && car!='$'){
            // regexIdentifier is defined in brython_builtins.js. It is a regular
            // expression that matches all the valid Python identifier names,
            // including those in non-latin writings (cf issue #358)
            if($B.regexIdentifier.exec(car)){
                name=car // identifier start
                var p0=pos
                pos++
                while(pos<src.length && $B.regexIdentifier.exec(src.substring(p0, pos+1))){
                    name+=src.charAt(pos)
                    pos++
                }
            }
            if(name){
                //pos += name.length
                if(kwdict.indexOf(name)>-1){
                    $pos = pos-name.length
                    if(unsupported.indexOf(name)>-1){
                        $_SyntaxError(context,"Unsupported Python keyword '"+name+"'")
                    }
                    context = $transition(context,name)
                } else if(typeof $operators[name]=='string') {
                    // Literal operators : "and", "or", "is", "not"
                    // The additional test is to exclude the name "constructor"
                    if(name=='is'){
                        // if keyword is "is", see if it is followed by "not"
                        var re = /^\s+not\s+/
                        var res = re.exec(src.substr(pos))
                        if(res!==null){
                            pos += res[0].length
                            $pos = pos-name.length
                            context = $transition(context,'op','is_not')
                        }else{
                            $pos = pos-name.length
                            context = $transition(context,'op', name)
                        }
                    }else if(name=='not'){
                        // if keyword is "not", see if it is followed by "in"
                        var re = /^\s+in\s+/
                        var res = re.exec(src.substr(pos))
                        if(res!==null){
                            pos += res[0].length
                            $pos = pos-name.length
                            context = $transition(context,'op','not_in')
                        }else{
                            $pos = pos-name.length
                            context = $transition(context,name)
                        }
                    }else{
                        $pos = pos-name.length
                        context = $transition(context,'op',name)
                    }
                } else if((src.charAt(pos)=='"'||src.charAt(pos)=="'")
                    && ['r','b','u','rb','br', 'f', 'fr', 'rf'].indexOf(name.toLowerCase())!==-1){
                    string_modifier = name.toLowerCase()
                    name = ""
                    continue
                } else {
                    if($B.forbidden.indexOf(name)>-1){name='$$'+name}
                    $pos = pos-name.length
                    context = $transition(context,'id',name)
                }
                name=""
                continue
            }
        }

        switch(car) {
          case ' ':
          case '\t':
            pos++
            break
          case '.':
            // point, ellipsis (...)
            if(pos<src.length-1 && /^\d$/.test(src.charAt(pos+1))){
                // number starting with . : add a 0 before the point
                var j = pos+1
                while(j<src.length && src.charAt(j).search(/\d|e|E/)>-1){j++}
                context = $transition(context,'float','0'+src.substr(pos,j-pos))
                pos = j
                break
            }
            $pos = pos
            context = $transition(context,'.')
            pos++
            break
          case '0':
            // octal, hexadecimal, binary
            //if(car==="0"){
            var res = hex_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',[16,res[1]])
                pos += res[0].length
                break
            }
            var res = octal_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',[8,res[1]]) //parseInt(res[1],8))
                pos += res[0].length
                break
            }
            var res = binary_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',[2,res[1]]) //parseInt(res[1],2))
                pos += res[0].length
                break
            }
            // literal like "077" is not valid in Python3
            if(src.charAt(pos+1).search(/\d/)>-1){
                // literal like "000" is valid in Python3
                if(parseInt(src.substr(pos)) === 0){
                    res = int_pattern.exec(src.substr(pos))
                    $pos = pos
                    context = $transition(context,'int',[10,res[0]])
                    pos += res[0].length
                    break
                }else{$_SyntaxError(context,('invalid literal starting with 0'))}
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
                if(res[2]!==undefined){
                    context = $transition(context,'imaginary',
                        res[0].substr(0,res[0].length-1))
                }else{context = $transition(context,'float',res[0])}
            }else{
                res = float_pattern2.exec(src.substr(pos))
                if(res){
                    $pos =pos
                    if(res[2]!==undefined){
                        context = $transition(context,'imaginary',
                            res[0].substr(0,res[0].length-1))
                    }else{context = $transition(context,'float',res[0])}
                }else{
                    res = int_pattern.exec(src.substr(pos))
                    $pos = pos
                    if(res[1]!==undefined){
                        context = $transition(context,'imaginary',
                            res[0].substr(0,res[0].length-1))
                    }else{context = $transition(context,'int',[10,res[0]])}
                }
            }
            pos += res[0].length
            break
          case '\n':
            // line end
            lnum++
            if(br_stack.length>0){
                // implicit line joining inside brackets
                pos++;//continue
            } else {
                if(current.context.tree.length>0){
                    $pos = pos
                    context = $transition(context,'eol')
                    indent=null
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
            br_pos[br_stack.length-1] = [context,pos]
            $pos = pos
            context = $transition(context,car)
            pos++
            break
          case ')':
          case ']':
          case '}':
            if(br_stack==""){
                $_SyntaxError(context,"Unexpected closing bracket")
            } else if(br_close[car]!=br_stack.charAt(br_stack.length-1)){
                $_SyntaxError(context,"Unbalanced bracket")
            } else {
                br_stack = br_stack.substr(0,br_stack.length-1)
                $pos = pos
                context = $transition(context,car)
                pos++
            }
            break
          case '=':
            if(src.charAt(pos+1)!="="){
                $pos = pos
                context = $transition(context,'=')
                pos++; //continue
            } else {
                $pos = pos
                context = $transition(context,'op','==')
                pos+=2
            }
            break
          case ',':
          case ':':
            $pos = pos
            context = $transition(context,car)
            pos++
            break
          case ';':
            $transition(context,'eol') // close previous instruction
            // create a new node, at the same level as current's parent
            if(current.context.tree.length===0){
                // consecutive ; are not allowed
                $pos=pos
                $_SyntaxError(context,'invalid syntax')
            }
            // if ; ends the line, ignore it
            var pos1 = pos+1
            var ends_line = false
            while(pos1<src.length){
                var _s=src.charAt(pos1)
                if(_s=='\n' || _s=='#'){ends_line=true;break}
                else if(_s==' '){pos1++}
                else{break}
            }
            if(ends_line){pos++;break}

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
          case '/':
          case '^':
          case '=':
          case '|':
          case '~':
          case '!':
          //case 'i':
          //case 'n':
            // operators

            // special case for annotation syntax
            if(car=='-' && src.charAt(pos+1)=='>'){
                context = $transition(context,'annotation')
                pos += 2
                continue
            }
            // find longest match
            var op_match = ""
            for(var op_sign in $operators){
                if(op_sign==src.substr(pos,op_sign.length)
                    && op_sign.length>op_match.length){
                    op_match=op_sign
                }
            }
            //if(car=='!'){alert('op_match '+op_match)}
            $pos = pos
            if(op_match.length>0){
                if(op_match in $augmented_assigns){
                    context = $transition(context,'augm_assign',op_match)
                }else{
                    context = $transition(context,'op',op_match)
                }
                pos += op_match.length
            }else{
                $_SyntaxError(context,'invalid character: '+car)
            }
            break
          case '\\':
            if (src.charAt(pos+1)=='\n'){
              lnum++
              pos+=2
              break
            }
          case '@':
            $pos = pos
            context = $transition(context,car)
            pos++
            break
          default:
            $pos=pos;$_SyntaxError(context,'unknown token ['+car+']')
        } //switch
    }

    if(br_stack.length!=0){
        var br_err = br_pos[0]
        $pos = br_err[1]
        $_SyntaxError(br_err[0],["Unbalanced bracket "+br_stack.charAt(br_stack.length-1)])
    }
    if(context!==null && $indented.indexOf(context.tree[0].type)>-1){
        $pos = pos-1
        $_SyntaxError(context,'expected an indented block',pos)
    }

    return root
}

$B.py2js = function(src, module, locals_id, parent_block_id, line_info){
    // src = Python source (string)
    // module = module name (string)
    // locals_id = the id of the block that will be created
    // parent_block_id = the id of the block where the code is created
    // line_info = [line_num, parent_block_id] if debug mode is set
    // create_ns = boolean to create a namespace for locals_id (used in exec)
    //
    // Returns a tree structure representing the Python source code

    var t0 = new Date().getTime(),
        is_comp = false

    if(typeof src=='object'){
        is_comp = src.is_comp
        src = src.src
    }

    // Normalise line ends and script end
    src = src.replace(/\r\n/gm,'\n')
    if(src.charAt(src.length-1)!="\n"){src+='\n'}

    var locals_is_module = Array.isArray(locals_id)
    if(locals_is_module){
        locals_id = locals_id[0]
    }
    var internal = locals_id.charAt(0)=='$'

    var local_ns = '$locals_'+locals_id.replace(/\./g,'_')

    var global_ns = '$locals_'+module.replace(/\./g,'_')

    $B.bound[module] = $B.bound[module] || {}

    // Internal variables must be defined before tokenising, otherwise
    // references to these names would generate a NameError
    $B.bound[module]['__doc__'] = true
    $B.bound[module]['__name__'] = true
    $B.bound[module]['__file__'] = true

    $B.$py_src[locals_id] = $B.$py_src[locals_id] || src
    var root = $tokenize({src:src, is_comp:is_comp},
        module,locals_id,parent_block_id,line_info)
    root.is_comp = is_comp
    root.transform()

    // Create internal variables
    var js = ['var $B = __BRYTHON__;\n'], pos=1

    js[pos++]='eval(__BRYTHON__.InjectBuiltins());\n\n'

    js[pos] = 'var '
    if(locals_is_module){
        js[pos] += local_ns+'=$locals_'+module+', '
    }else if(!internal){
        js[pos] += local_ns+'=$B.imported["'+locals_id+'"] || {}, '
    }
    js[pos]+='$locals='+local_ns+';'

    var offset = 0

    root.insert(0, $NodeJS(js.join('')))
    offset++

    // module doc string
    var ds_node = new $Node()
    new $NodeJSCtx(ds_node, local_ns+'["__doc__"]='+(root.doc_string||'None')+';')
    root.insert(offset++,ds_node)
    // name
    var name_node = new $Node()
    new $NodeJSCtx(name_node,local_ns+'["__name__"]='+local_ns+'["__name__"] || "'+locals_id+'";')
    root.insert(offset++,name_node)
    // file
    var file_node = new $Node()
    new $NodeJSCtx(file_node,local_ns+'["__file__"]="'+$B.$py_module_path[module]+'";None;\n')
    root.insert(offset++,file_node)
    // if line_info is provided, store it
    if(line_info !== undefined){
        var line_node = new $Node()
        new $NodeJSCtx(line_node,local_ns+'.$line="'+line_info+'";None;\n')
        root.insert(offset++,line_node)
    }

    var enter_frame_pos = offset,
        js = 'var $top_frame = ["'+locals_id.replace(/\./g,'_')+'", '+
            local_ns+', "'+module.replace(/\./g,'_')+'", '+global_ns+
            ', "a"]; $B.frames_stack.push($top_frame); var $stack_length = '+
            '$B.frames_stack.length;'
    root.insert(offset++, $NodeJS(js))

    // Wrap code in a try/finally to make sure we leave the frame
    var try_node = new $NodeJS('try'),
        children = root.children.slice(enter_frame_pos+1, root.children.length)
    root.insert(enter_frame_pos+1, try_node)

    // Add module body to the "try" clause
    if(children.length==0){children=[$NodeJS('')]} // in case the script is empty
    for(var i=0;i<children.length;i++){
        try_node.add(children[i])
    }
    // add node to exit frame in case no exception was raised
    try_node.add($NodeJS('$B.leave_frame("'+locals_id+'")'))

    root.children.splice(enter_frame_pos+2, root.children.length)

    var catch_node = new $NodeJS('catch(err)')
    catch_node.add($NodeJS('$B.leave_frame("'+locals_id+'")'))
    catch_node.add($NodeJS('throw err'))

    root.add(catch_node)

    if($B.profile>0){$add_profile(root,null,module)}
    if($B.debug>0){$add_line_num(root,null,module)}

    var t1 = new Date().getTime()
    if($B.debug>=2){
        if(module == locals_id){
            console.log('module '+module+' translated in '+(t1 - t0)+' ms')
        }
    }

    $B.compile_time += t1-t0

    return root
}

function load_scripts(scripts, run_script, onerror){
    // Loads and runs the scripts in the order they are placed in the page
    // Script can be internal (code inside the <script></script> tag) or
    // external (<script src="external_script.py"></script>)

    if (run_script === undefined) {
      run_script = $B._run_script;
    }

    // Callback function when an external script is loaded
    function callback(ev, script){
        var ok = false,
            skip = false;
        if (ev !== null) {
            var req = ev.target
            if(req.readyState==4){
                if(req.status==200){
                    ok = true;
                    var script = {name:req.module_name,
                              url:req.responseURL,
                              src:req.responseText};
                }
            }
            else {
                // AJAX request with readyState !== 4 => NOP
                skip = true;
            }
        }
        else {
            // All data is supplied in script arg
            ok = true;
        }
        if (skip) { return; }
        if (ok) {
            try {
                run_script(script)
            }
            catch (e) {
                if (onerror === undefined) { throw e; }
                else { onerror(e); }
            }
            if(scripts.length>0){
                load_scripts(scripts)
            }
        }else{
            try {
                throw Error("cannot load script "+
                    req.module_name+' at '+req.responseURL+
                    ': error '+req.status)
            }
            catch (e) {
                if (onerror === undefined) { throw e; }
                else { onerror(e); }
            }
        }
    }

    var noajax = true
    // Loop for efficient usage of the calling stack (faster than recursion?)
    while(scripts.length>0 && noajax){
        var script = scripts.shift()
        if(script['src']===undefined){
            // External script : load it by an Ajax call
            noajax = false;
            var req = new XMLHttpRequest()
            req.onreadystatechange = callback
            req.module_name = script.name
            req.open('GET', script.url, true)
            req.send()
        }else{
            // Internal script : execute it
            callback(null, script)
            load_scripts(scripts)
        }
    }
}

$B._load_scripts = load_scripts;

function run_script(script){
    // script has attributes url, src, name

    $B.$py_module_path[script.name]=script.url
    var root, js

    try{
        // Conversion of Python source code to Javascript

        root = $B.py2js(script.src,script.name,script.name,'__builtins__')
        js = root.to_js()
        if($B.debug>1){console.log(js)}
        // Run resulting Javascript
        eval(js)
        //$B.imported[script.name] = $locals
    }catch($err){
        if($B.debug>1){
            console.log($err)
            for(var attr in $err){
               console.log(attr+' : ', $err[attr])
            }
        }

        // If the error was not caught by the Python runtime, build an
        // instance of a Python exception
        if($err.$py_error===undefined){
            console.log('Javascript error', $err)
            //console.log($js)
            //for(var attr in $err){console.log(attr+': '+$err[attr])}
            $err=_b_.RuntimeError($err+'')
        }

        // Print the error traceback on the standard error stream
        var name = $err.__name__
        var $trace = _b_.getattr($err,'info')
        if(name=='SyntaxError' || name=='IndentationError'){
            var offset = $err.args[3]
            $trace += '\n' + ' '.repeat(offset) + '^' +
                '\n' + name+': '+$err.args[0]

        }else{
            $trace += '\n'+name+': ' + $err.args
        }
        try{
            _b_.getattr($B.stderr,'write')($trace)
        }catch(print_exc_err){
            console.log($trace)
        }
        // Throw the error to stop execution
        throw $err
    }finally{
        root = null
        js = null
        $B.clear_ns(script.name)
    }
}

$B._run_script = run_script;

function brython(options){

    // meta_path used in py_import.js
    if ($B.meta_path === undefined) {
        $B.meta_path = []
    }

    // Options passed to brython(), with default values
    $B.$options = {}

    // By default, only set debug level
    if(options===undefined) options={'debug':0}

    // If the argument provided to brython() is a number, it is the debug
    // level
    if(typeof options==='number') options={'debug':options}
    if(options.debug === undefined) { options.debug = 0 }
    $B.debug = options.debug
    // set built-in variable __debug__
    _b_.__debug__ = $B.debug>0

    $B.compile_time = 0

    if(options.profile === undefined){ options.profile = 0}
    $B.profile = options.profile

    // For imports, default mode is to search modules of the standard library
    // using a static mapping stored in stdlib_paths.js
    // This can be disabled by setting option "static_stdlib_import" to false
    if(options.static_stdlib_import===undefined){options.static_stdlib_import=true}
    $B.static_stdlib_import = options.static_stdlib_import

    // If options has an attribute "open", it will be used by the built-in
    // function open() - see py_builtin_functions.js
    if (options.open !== undefined) {
        _b_.open = options.open;
        console.log("DeprecationWarning: \'open\' option of \'brython\' "+
            "function will be deprecated in future versions of Brython.");
    }

    $B.$options=options

    // Set $B.meta_path, the list of finders to use for imports
    //
    // The original list in $B.meta_path is made of 3 finders defined in
    // py_import.js :
    // - finder_VFS : in the Virtual File System : a Javascript object with
    //   source of the standard distribution
    // - finder_static_stlib : use the script stdlib_path.js to identify the
    //   packages and modules in the standard distribution
    // - finder_path : search module at different urls

    var meta_path = []
    var path_hooks = []

    // $B.use_VFS is set to true if the script brython_stdlib.js or
    // brython_dist.js has been loaded in the page. In this case we use the
    // Virtual File System (VFS)
    if($B.use_VFS){
        meta_path.push($B.$meta_path[0])
        path_hooks.push($B.$path_hooks[0])
    }

    if(options.static_stdlib_import!==false){
        // Add finder using static paths
        meta_path.push($B.$meta_path[1])
        // Remove /Lib and /libs in sys.path :
        // if we use the static list and the module
        // was not find in it, it's no use searching twice in the same place
        if($B.path.length>3) {
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
    if ( isWebWorker ) $href_elts.pop() // WebWorker script is in the web_workers subdirectory
    $B.curdir = $href_elts.join('/')

    // List of URLs where imported modules should be searched
    // A list can be provided as attribute of options
    if (options.pythonpath!==undefined){
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

    if (options.python_paths) {
        options.python_paths.forEach(function(path) {
            var lang, prefetch;
            if (typeof path !== "string") {
                lang = path.lang
                prefetch = path.prefetch
                path = path.path
            }
            $B.path.push(path)
            if (path.slice(-7).toLowerCase() == '.vfs.js' && (prefetch === undefined || prefetch === true)) $B.path_importer_cache[path+'/'] = $B.imported['_importlib'].VFSPathFinder(path)
            if (lang) _importlib.optimize_import_for_path(path, lang)
        })
    }

    if (! isWebWorker ) {
    // Get all links with rel=pythonpath and add them to sys.path
        var path_links = document.querySelectorAll('head link[rel~=pythonpath]'),
            _importlib = $B.modules['_importlib'];
        for (var i=0, e; e = path_links[i]; ++i) {
            var href = e.href;
            if ((' ' + e.rel + ' ').indexOf(' prepend ') != -1) {
                $B.path.unshift(href);  // support prepending to pythonpath
            } else {
                $B.path.push(href);
            }
            if (href.slice(-7).toLowerCase() == '.vfs.js' &&
                    (' ' + e.rel + ' ').indexOf(' prefetch ') != -1) {
                // Prefetch VFS file
                $B.path_importer_cache[href + '/'] =
                        $B.imported['_importlib'].VFSPathFinder(href)
            }
            var filetype = e.hreflang;
            if (filetype) {
                if (filetype.slice(0,2) == 'x-') filetype = filetype.slice(2);
                _importlib.optimize_import_for_path(e.href, filetype);
            }
        }
    }

    // Allow user to specify the re module they want to use as a default
    // Valid values are 'pyre' for pythons re module and
    // 'jsre' for brythons customized re module
    // Default is for brython to guess which to use by looking at
    // complexity of the re pattern
    if (options.re_module !==undefined) {
       if (options.re_module == 'pyre' || options.re_module=='jsre') {
          $B.$options.re=options.re
       }
       console.log("DeprecationWarning: \'re_module\' option of \'brython\' function will be deprecated in future versions of Brython.")
    }

    $B.scripts = []
    $B.js = {} // maps script name to JS conversion
    if ($B.$options.args) {
        $B.__ARGV = $B.$options.args
    } else {
        $B.__ARGV = _b_.list([])
    }
    if (!isWebWorker) {
        _run_scripts(options)
    }
}

function _run_scripts(options) {
    // Save initial Javascript namespace
    var kk = Object.keys(_window)


    // Option to run code on demand and not all the scripts defined in a page
    // The following lines are included to allow to run brython scripts in
    // the IPython/Jupyter notebook using a cell magic. Have a look at
    // https://github.com/kikocorreoso/brythonmagic for more info.
    if(options.ipy_id!==undefined){
        var $elts = [];
        for(var $i=0;$i<options.ipy_id.length;$i++){
            $elts.push(document.getElementById(options.ipy_id[$i]));
        }
        }else{
        var scripts=document.getElementsByTagName('script'),$elts=[]
        // Freeze the list of scripts here ; other scripts can be inserted on
        // the fly by viruses
        for(var i=0;i<scripts.length;i++){
            var script = scripts[i]
            if(script.type=="text/python" || script.type=="text/python3"){
                $elts.push(script)
            }
        }
    }

    // Get all scripts with type = text/python or text/python3 and run them

    var first_script = true, module_name;
    if(options.ipy_id!==undefined){
        module_name='__main__';
        var $src = "", js, root
        $B.$py_module_path[module_name] = $B.script_path;
        for(var $i=0;$i<$elts.length;$i++){
            var $elt = $elts[$i];
            $src += ($elt.innerHTML || $elt.textContent);
        }
        try{
            // Conversion of Python source code to Javascript

            root = $B.py2js($src,module_name,module_name,'__builtins__')
            js = root.to_js()
            if($B.debug>1) console.log(js)

            // Run resulting Javascript
            eval(js)

            $B.clear_ns(module_name)
            root = null
            js = null

        }catch($err){
            root = null
            js = null
            console.log($err)
            if($B.debug>1){
                console.log($err)
                for(var attr in $err){
                   console.log(attr+' : ', $err[attr])
                }
            }

            // If the error was not caught by the Python runtime, build an
            // instance of a Python exception
            if($err.$py_error===undefined){
                console.log('Javascript error', $err)
                //console.log($js)
                //for(var attr in $err){console.log(attr+': '+$err[attr])}
                $err=_b_.RuntimeError($err+'')
            }

            // Print the error traceback on the standard error stream
            var $trace = _b_.getattr($err,'info')+'\n'+$err.__name__+
                ': ' +$err.args
            try{
                _b_.getattr($B.stderr,'write')($trace)
            }catch(print_exc_err){
                console.log($trace)
            }
            // Throw the error to stop execution
            throw $err
        }
    }else{
        // Get all explicitely defined ids, to avoid overriding
        var defined_ids = {}
        for(var i=0;i<$elts.length;i++){
            var elt = $elts[i]
            if(elt.id){
                if(defined_ids[elt.id]){
                    throw Error("Brython error : Found 2 scripts with the same id '"+
                        elt.id+"'")
                }else{
                    defined_ids[elt.id] = true
                }
            }
        }
        var scripts = []
        for(var $i=0;$i<$elts.length;$i++){
            var $elt = $elts[$i]
            if($elt.type=="text/python"||$elt.type==="text/python3"){

                if($elt.id){module_name=$elt.id}
                else{
                    if(first_script){module_name='__main__'; first_script=false}
                    else{module_name = '__main__'+$B.UUID()}
                    while(defined_ids[module_name]!==undefined){
                        module_name = '__main__'+$B.UUID()
                    }
                }
                $B.scripts.push(module_name)

                // Get Python source code
                var $src = null
                if($elt.src){
                    // format <script type="text/python" src="python_script.py">
                    // get source code by an Ajax call
                    scripts.push({name:module_name, url:$elt.src})
                }else{
                    // Get source code inside the script element
                    var $src = ($elt.innerHTML || $elt.textContent)
                    // remove leading CR if any
                    $src = $src.replace(/^\n/, '')
                    $B.$py_module_path[module_name] = $B.script_path
                    scripts.push({name: module_name, src: $src, url: $B.script_path})
                }
            }
        }
    }

    /*
    load_ext(ext_scripts)
    for(var i=0;i<inner_scripts.length;i++){
        run_script(inner_scripts[i])
    }
    */

    if (options.ipy_id === undefined){$B._load_scripts(scripts)}

    /* Uncomment to check the names added in global Javascript namespace
    var kk1 = Object.keys(_window)
    for (var i=0; i < kk1.length; i++){
        if(kk[i]===undefined){
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
