;(function($B){

// Implementation of generators
//
// The original generator function is transformed into another function
// that returns iterators
//
// For each iteration at rank r, a function F(r) is run and returns a
// 2-element list : [value, yield_node_id] where value is the yielded value
// and yield_node_id identifies the node in the function tree structure where
// the value was yielded
//
// For the first iteration, the function F(0) is built from the original
// generator function
//
// For the iteration r+1 it is built from the function F(r), taking into
// account yield_node_id :
// - if it is the same as in the previous iteration, F(r+1) = F(r)
// - else the new function is built to run the rest of the function after the
//   yielding node

var _b_ = $B.builtins
var bltns = $B.InjectBuiltins()
eval(bltns)

function rstrip(s, strip_chars) {
    var _chars = strip_chars || " \t\n";
    var nstrip = 0, len = s.length;
    while( nstrip < len && _chars.indexOf(s.charAt(len-1-nstrip)) > -1 ) nstrip ++;
    return s.substr(0, len-nstrip)
}

// Code to store/restore local namespace
//
// In generators, the namespace is stored in an attribute of the
// generator function until the iterator is exhausted, so that it
// can be restored in the next iteration
function jscode_namespace(iter_name, action, parent_id) {
    var _clean= '';
    if (action === 'store') {
        _clean = ' = {}'
    }
    var res = 'for(var attr in this.blocks){' +
              'eval("var " + attr + " = this.blocks[attr]")'+
           '};' +
           'var $locals_' + iter_name + ' = this.env' + _clean + ', '+
               '$local_name = "' + iter_name + '", ' +
               '$locals = $locals_' + iter_name + ';'
    if(parent_id){
        res += '$locals.$parent = $locals_' + parent_id.replace(/\./g, "_") +
            ';'
    }
    return res
}

function make_node(top_node, node){

    // Transforms a node from the original generator function into a node
    // for the modified function that will return iterators
    // top_node is the root node of the modified function

    if (node.type === "marker") return
    // cache context.to_js
    if(node.context.$genjs){
        var ctx_js = node.context.$genjs
    }else{
        var ctx_js = node.context.$genjs = node.context.to_js()
    }
    var is_cond = false, is_except = false,is_else = false, is_continue

    if(node.locals_def){
        var parent_id = node.func_node.parent_block.id
        if(node.func_node.ntype == "generator"){
            // If the function is a generator, transforms the node where local
            // namespace is reset
            var iter_name = top_node.iter_id
            ctx_js = jscode_namespace(iter_name, 'store', parent_id)
        }else{
            ctx_js += "$locals.$parent = $locals_" + parent_id + ";"
        }
    }

    // Mark some node types (try, except, finally, if, elif, else)
    // The attributes set will be used to build the function for the next
    // iteration

    if(node.is_catch){is_except = true; is_cond = true}
    if(node.is_except){is_except = true}
    if(node.context.type == "node"){
        var ctx = node.context.tree[0]
        var ctype = ctx.type

        switch(ctx.type) {
            case "except":
                is_except = true
                is_cond = true
                break
            case "single_kw":
                is_cond = true
                if(ctx.token == "else"){is_else = true}
                if(ctx.token == "finally"){is_except = true}
                break
            case "condition":
                if(ctx.token == "elif"){is_else = true; is_cond = true}
                if(ctx.token == "if"){is_cond = true}
        }
    }

    if(ctx_js){ // empty for "global x"

        var new_node = new $B.genNode(ctx_js)
        new_node.line_num = node.line_num

        if(ctype == "yield"){

            // Replace "yield value" by "return [value, node_id]"

            var yield_node_id = top_node.yields.length
            ctx_js = rstrip(ctx_js, ';')
            var res =  "return [" + ctx_js + ", " + yield_node_id + "]"
            new_node.data = res
            top_node.yields.push(new_node)

        }else if(node.is_set_yield_value){

            // After each yield, py2js inserts a no-op line as a placeholder
            // for values or exceptions sent to the iterator
            //
            // Here, this line is replaced by a test on the attribute
            // sent_value of __BRYTHON__.modules[iter_id]. This attribute is
            // set when methods send() or throw() of the generators are
            // invoked

            var yield_node_id = top_node.yields.length
            var js = "var sent_value = this.sent_value === undefined ? " +
                "None : this.sent_value;"

            // If method throw was called, raise the exception
            js += "if(sent_value.__class__ === $B.$GeneratorSendError)"+
                  "{throw sent_value.err}"

            // Else set the yielded value to sent_value
            js += "var $yield_value" + ctx_js + " = sent_value;"

            // Reset sent_value value to None for the next iteration
            js += "this.sent_value = None"
            new_node.data = js

        }else if(ctype == "break" || ctype == "continue"){

            // For a "break" or "continue", loop_num is a reference
            // to the loop that is broken or continued
            new_node["is_" + ctype] = true
            new_node.loop_num = node.context.tree[0].loop_ctx.loop_num

        }

        new_node.is_yield = (ctype == "yield" || ctype == "return")
        new_node.is_cond = is_cond
        new_node.is_except = is_except
        new_node.is_if = ctype == "condition" && ctx.token == "if"
        new_node.is_try = node.is_try
        new_node.is_else = is_else
        new_node.loop_start = node.loop_start
        new_node.is_set_yield_value = node.is_set_yield_value

        // Recursion
        for(var i = 0, len = node.children.length; i < len; i++){
            var nd = make_node(top_node, node.children[i])
            if(nd !== undefined){new_node.addChild(nd)}
        }
    }
    return new_node
}

$B.genNode = function(data, parent){
    this.data = data
    this.parent = parent
    this.children = []
    this.has_child = false
    if(parent === undefined){
        this.nodes = {}
        this.num = 0
    }

    this.addChild = function(child){
        if(child === undefined){console.log("child of " + this + " undefined")}
        this.children[this.children.length] = child
        this.has_child = true
        child.parent = this
        child.rank = this.children.length - 1
    }

    this.clone = function(){
        var res = new $B.genNode(this.data)
        res.has_child = this.has_child
        res.is_cond = this.is_cond
        res.is_except = this.is_except
        res.is_if = this.is_if
        res.is_try = this.is_try
        res.is_else = this.is_else
        res.loop_num = this.loop_num
        res.loop_start = this.loop_start
        res.is_yield = this.is_yield
        res.line_num = this.line_num
        return res
    }

    this.clone_tree = function(exit_node, head){

        // Return a clone of the tree starting at node
        // If one the descendant of node is the exit_node, replace the code
        // by "void(0)"

        var res = new $B.genNode(this.data)
        if(this.replaced && ! in_loop(this)){
            // cloning a node that was already replaced by "void(0)"
            console.log("already replaced", this)
            res.data = "void(0)"
        }
        if(this === exit_node && (this.parent.is_cond || ! in_loop(this))){
            // If we have to clone the exit node and its parent was
            // a condition, replace code by 'void(0)'
            if(! exit_node.replaced){ // replace only once
                console.log("replace by void(0)", this)
                res = new $B.genNode("void(0)")
            }else{
                res = new $B.genNode(exit_node.data)
            }
            exit_node.replaced = true
        }

        if(head && (this.is_break || this.is_continue)){
            var loop = in_loop(this)
            if(loop.has("yield")){
                res.data = ""
                if(this.is_break){
                    res.data += '$locals["$no_break' + this.loop_num +
                        '"] = false;'
                }
                res.data += 'var err = new Error("break"); ' +
                    "err.__class__ = $B.GeneratorBreak; throw err;"
                res.is_break = this.is_break
            }else{
                res.is_break = this.is_break
            }
        }
        res.is_continue = this.is_continue
        res.has_child = this.has_child
        res.is_cond = this.is_cond
        res.is_except = this.is_except
        res.is_try = this.is_try
        res.is_else = this.is_else
        res.loop_num = this.loop_num
        res.loop_start = this.loop_start
        res.no_break = true
        res.is_yield = this.is_yield
        res.line_num = this.line_num
        for(var i = 0, len = this.children.length; i < len; i++){
            res.addChild(this.children[i].clone_tree(exit_node, head))
            if(this.children[i].is_break){res.no_break = false}
        }
        return res
    }

    this.has = function(keyword){
        // keyword is "break" or "continue"
        // Checks if node is break, or one of its children has the keyword
        if(this["is_" + keyword]){return true}
        else{
            for(var i = 0, len = this.children.length; i < len; i++){
                if(this.children[i].has(keyword)){return true}
            }
        }
        return false
    }

    this.indent_src = function(indent){
        return " ".repeat(indent * indent)
    }

    this.src = function(indent){
        // Returns the indented Javascript source code starting at "this"
        indent = indent || 0
        var res = [this.indent_src(indent) + this.data], pos = 1
        if(this.has_child){res[pos++] = "{"}
        res[pos++] = "\n"
        for(var i = 0, len = this.children.length; i < len; i++){
            res[pos++] = this.children[i].src(indent + 1)
            // If child is a "yield" node, the Javascript code is a "return"
            // so it's no use adding following nodes (and it raises a
            // SyntaxError on Firefox)
            if(this.children[i].is_yield){break}
        }
        if(this.has_child){
            res[pos++] = "\n" + this.indent_src(indent) + "}\n"
        }
        return res.join("")
    }

    this.toString = function(){return "<Node " + this.data + ">"}

}


// Object used as the attribute "__class__" of an error thrown in case of a
// "break" inside a loop
$B.GeneratorBreak = $B.make_class("GeneratorBreak")

// Class for errors sent to an iterator by "throw"
$B.$GeneratorSendError = {}

// Class used for "return" inside a generator function
var $GeneratorReturn = {}
$B.generator_return = function(value){
    return {__class__: $GeneratorReturn, value: value}
}

function in_loop(node){

    // Tests if node is inside a "for" or "while" loop
    while(node){
        if(node.loop_start !== undefined){return node}
        node = node.parent
    }
    return false
}

function in_try(node){

    // Return the list of "try" clauses above the node

    var tries = [],
        pnode = node.parent,
        pos = 0
    while(pnode){
        if(pnode.is_try){tries[pos++] = pnode}
        pnode = pnode.parent
    }
    return tries
}

var $BRGeneratorDict = {
    __class__: _b_.type,
    $infos: {
        __name__: "generator",
        __module__: "builtins"
    },
    $is_class: true
}

$B.gen_counter = 0 // used to identify the function run for each next()

function remove_line_nums(node){
    // Remove line numbers introduced by $add_line_nums in py2js
    for(var i = 0; i < node.children.length; i++){
        if(node.children[i].is_line_num){
            node.children.splice(i, 1)
        }else{
            remove_line_nums(node.children[i])
        }
    }
}
$B.$BRgenerator = function(func_name, blocks, def_id, def_node){

    // Creates a function that will return an iterator
    // func_name : function name
    // blocks : the id of the surrounding code blocks
    // def_id : generator function identifier
    // def_node : instance of Node for the function

    var def_ctx = def_node.context.tree[0]

    var module = def_node.module, // module name
        iter_id = def_id

    // Create a tree structure based on the generator tree
    // iter_id is used in the node where the iterator resets local
    // namespace
    if($B.debug > 0){
        // add line nums for error reporting
        $B.$add_line_num(def_node, def_ctx.rank)
    }
    var func_root = new $B.genNode(def_ctx.to_js())
    // Once the Javascript code is generated, remove the nodes for line
    // numbers, they make the rest of the algorithm bug
    remove_line_nums(def_node.parent)

    func_root.module = module
    func_root.yields = []
    func_root.loop_ends = {}
    func_root.def_id = def_id
    func_root.iter_id = iter_id
    for(var i = 0, len = def_node.children.length; i < len; i++){
        var nd = make_node(func_root, def_node.children[i])
        if(nd === undefined){continue}
        func_root.addChild(nd)
    }

    var obj = {
        __class__ : $BRGeneratorDict,
        blocks: blocks,
        def_ctx: def_ctx,
        def_id: def_id,
        func_name: func_name,
        func_root: func_root,
        module: module,
        gi_running: false,
        iter_id: iter_id,
        id: iter_id,
        num: 0
    }

    var src = func_root.src(), //children[1].src(),
        raw_src = src.substr(src.search("function"))

    // For the first call, add defaults object as arguement
    raw_src += "return " + def_ctx.name + def_ctx.num + "}"

    var funcs = [raw_src]

    obj.parent_block = def_node

    for(var i = 0; i < func_root.yields.length; i++){
        funcs.push(make_next(obj, i))
    }

    return funcs
}

function make_next(self, yield_node_id){
    // Get node where yield was thrown
    var exit_node = self.func_root.yields[yield_node_id]

    // Attribute "replaced" is used to replace a node only once if it was
    // inside a loop
    exit_node.replaced = false

    // Before returning the yielded value, build the function for the next
    // iteration

    // Create root node of new function and add the initialisation
    // instructions

    var root = new $B.genNode(self.def_ctx.to_js())
    var fnode = self.func_root.clone()
    root.addChild(fnode)

    var parent_scope = self.func_root

    // restore namespaces
    var js = jscode_namespace(self.iter_id, 'restore')

    fnode.addChild(new $B.genNode(js))
    // add a node to enter the frame
    js = 'var $top_frame = ["' + self.iter_id + '",$locals,"' + self.module +
        '",$locals_' + self.module.replace(/\./g, '_') + '];' +
        '$B.frames_stack.push($top_frame); var $stack_length = ' +
        '$B.frames_stack.length;'
    fnode.addChild(new $B.genNode(js))

    // To build the new function, we must identify the rest of the function to
    // run after the exit node
    //
    // The exit node is in a block in the function tree structure. At each
    // step, the algorithm :
    // - builds the list "rest" of the children of exit_node parent after
    //   exit_node
    // - wraps the code of "rest" in the same try/except clauses as exit_node,
    //   if any
    // - goes up one block until it reaches the function root node

    while(1){

        // Compute the rest of the block to run after exit_node
        var exit_parent = exit_node.parent,
            rest = [],
            pos = 0,
            has_break,
            has_continue

        // "start" is the position where the rest of the block starts
        // By default it is the node of rank exit_node.rank + 1
        var start = exit_node.rank + 1

        if(exit_node.loop_start !== undefined){
            // If exit_node is a loop, run it again
            start = exit_node.rank
        }else if(exit_node.is_cond){
            // If exit_node is a condition, start after the elif/else clauses
            while(start < exit_parent.children.length &&
                    (exit_parent.children[start].is_except ||
                    exit_parent.children[start].is_else)){
                start++
            }
        }else if(exit_node.is_try || exit_node.is_except){
            // If exit_node is a try or except, start after the
            // except/else/finally clauses
            while(start < exit_parent.children.length &&
                    (exit_parent.children[start].is_except ||
                    exit_parent.children[start].is_else)){
                start++
            }
        }

        for(var i = start, len = exit_parent.children.length; i < len; i++){
            var clone = exit_parent.children[i].clone_tree(null, true)
            if(clone.has("continue")){
                has_continue = true;
            }
            rest[pos++] = clone
            if(clone.has("break")){
                has_break = true
            }
        }

        // add rest of block to new function
        if((has_break || has_continue) && rest.length > 0){
            // If the rest had a "break", this "break" is converted into
            // raising an exception with __class__ set to GeneratorBreak
            var rest_try = new $B.genNode("try")
            for(var i = 0, len = rest.length; i < len; i++){
                rest_try.addChild(rest[i])
            }
            var catch_test = "catch(err)" +
                "{if(err.__class__ !== $B.GeneratorBreak){throw err}}"
            catch_test = new $B.genNode(catch_test)
            rest = [rest_try, catch_test]
        }

        // Get list of "try" nodes above exit node
        var tries = in_try(exit_node)

        if(tries.length == 0){
            // Not in a "try" clause : run rest at function level
            for(var i = 0; i < rest.length; i++){fnode.addChild(rest[i])}
        }else{
            // Attach "rest" to successive "try" found, or to function body
            var tree = [], pos = 0
            for(var i = 0; i < tries.length; i++){
                var try_node = tries[i],
                    try_clone = try_node.clone()
                if(i == 0){
                    for(var j = 0; j < rest.length; j++){
                        try_clone.addChild(rest[j])
                    }
                }
                var children = [try_clone], cpos = 1

                for(var j = try_node.rank + 1;
                        j < try_node.parent.children.length; j++){
                    if(try_node.parent.children[j].is_except){
                        children[cpos++] =
                            try_node.parent.children[j].clone_tree(null, true)
                    }else{
                        break
                    }
                }
                tree[pos++] = children
            }
            var parent = fnode
            while(tree.length){
                children = tree.pop()
                children.forEach(function(child){parent.addChild(child)})
                parent = children[0]
            }
        }

        // Go up one block until we get to the function root node
        exit_node = exit_parent
        if(exit_node === self.func_root){break}
    }

    // return the code of the function for next iteration
    var src = root.children[0].src(),
        next_src = src.substr(src.search("function"))

    // function starts with "function($defaults){ function" : must remove
    // the first part
    next_src = next_src.substr(10)
    next_src = next_src.substr(next_src.search("function"))

    return next_src
}

var generator = {
    __class__: _b_.type,
    __mro__: [_b_.object],
    $infos: {
        __module__: "builtins",
        __name__: "generator"
    }
}

//fix me, need to investigate __enter__ and __exit__ and what they do
generator.__enter__ = function(self){console.log("generator.__enter__ called")}
generator.__exit__ = function(self){console.log("generator.__exit__ called")}

generator.__str__ = function(self){
    return "<generator object " + self.__name__ + ">"
}

generator.__iter__ = function(self){
    return self
}

generator.__next__ = function(self){
    if(self.$finished){throw _b_.StopIteration.$factory(_b_.None)}
    if(self.gi_running === true){
        throw ValueError.$factory("generator already executing")
    }
    self.gi_running = true
    if(self.next === undefined){
        self.$finished = true
        throw _b_.StopIteration.$factory(_b_.None)
    }

    try{
        var res = self.next.apply(self, self.args)
    }catch(err){
        /*
        var src = self.next + '',
            line_num = err.lineNumber,
            lines = src.split("\n")
        console.log(src)
        console.log(line_num, lines.length)
        console.log(lines[line_num - 1])
        console.log(err)
        */
        self.$finished = true
        throw err
    }finally{
        // The line "leave_frame" is not inserted in the function body for
        // generators, so we must call it here to pop from frames stack
        self.gi_running = false
        $B.leave_frame(self.iter_id)
    }

    // Brython replaces "yield x" by "return [x, next_rank]"
    // next_rank is the rank of the function to call after this yield

    if(res === undefined){throw _b_.StopIteration.$factory(_b_.None)}
    else if(res[0].__class__ === $GeneratorReturn){
        // The function may have ordinary "return" lines, in this case
        // the iteration stops
        self.$finished = true
        throw StopIteration.$factory(res[0].value)
    }

    self.next = self.nexts[res[1]]
    self.gi_running = false
    return res[0]
}

generator.close = function(self, value){
    self.sent_value = _b_.GeneratorExit.$factory()
    try{
        var res = generator.__next__(self)
        if(res !== _b_.None){
            throw _b_.RuntimeError.$factory("closed generator returned a value")
        }
    }catch(err){
        if($B.is_exc(err,[_b_.StopIteration, _b_.GeneratorExit])){
            return _b_.None
        }
        throw err
    }
}

generator.send = function(self, value){
    self.sent_value = value
    return generator.__next__(self)
}

generator.$$throw = function(self, type, value, traceback){
    var exc = type
    if(value !== undefined){exc = $B.$call(exc)(value)}
    if(traceback !== undefined){exc.$traceback = traceback}
    self.sent_value = {__class__: $B.$GeneratorSendError, err: exc}
    return generator.__next__(self)
}

generator.$factory = $B.genfunc = function(name, blocks, funcs, $defaults){
    // Transform a list of functions into a generator object, ie a function
    // that returns an iterator
    if(name.startsWith("__ge")){
        // Copy all names in surrounding scopes in namespace of generator
        // expression (issue #935)
        for(var block_id in blocks){
            if(block_id == "$locals_" + name){continue}
            for(var attr in blocks[block_id]){
                blocks["$locals_" + name][attr] = blocks[block_id][attr]
            }
        }
    }
    return function(){
        var iter_id = "$gen" + $B.gen_counter++,
            gfuncs = []

        gfuncs.push(funcs[0]($defaults))
        for(var i = 1; i < funcs.length; i++){
            gfuncs.push(funcs[i])
        }

        var res = {
            __class__: generator,
            __name__: name,
            args: Array.prototype.slice.call(arguments),
            blocks: blocks,
            env: {},
            name: name,
            nexts: gfuncs.slice(1),
            next: gfuncs[0],
            iter_id: iter_id,
            gi_running: false,
            $started: false,
            $defaults: $defaults
        }
        return res
    }
}

$B.set_func_names(generator, "builtins")

})(__BRYTHON__)
