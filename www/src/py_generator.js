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

var _b_=$B.builtins
eval($B.InjectBuiltins())


function make_node(top_node, node){

    // Transforms a node from the original generator function into a node
    // for the modified function that will return iterators
    // top_node is the root node of the modified function

    // cache context.to_js
    if(node.context.$genjs){
        var ctx_js = node.context.$genjs
    }else{
        var ctx_js = node.context.$genjs = node.context.to_js()
    }
    var is_cond = false, is_except = false,is_else=false
    
    if(node.locals_def){
        // Transforms the node where local namespace is reset
        // In generators, the namespace is stored in an attribute of the
        // object __BRYTHON__ until the iterator is exhausted, so that it
        // can be restored in the next iteration
        var iter_name = top_node.iter_id
        ctx_js = 'for(var attr in this.blocks){eval("var "+attr+"=this.blocks[attr]");};'+
            'var $locals_'+iter_name+' = this.env = {}'+
            ', $local_name = "'+iter_name+
            '", $locals = $locals_'+iter_name+';'
    }

    // Mark some node types (try, except, finally, if, elif, else)
    // The attributes set will be used to build the function for the next 
    // iteration

    if(node.is_catch){is_except=true;is_cond=true}
    if(node.is_except){is_except=true}
    if(node.context.type=='node'){
        var ctx = node.context.tree[0]
        var ctype = ctx.type
    
        switch(ctx.type) {
          case 'except':
            is_except=true
            is_cond=true
            break
          case 'single_kw':
            is_cond=true
            if (ctx.token == 'else') is_else=true
            if (ctx.token == 'finally') is_except=true
            break
          case 'condition':
            if (ctx.token == 'elif') {is_else=true; is_cond=true}
            if (ctx.token == 'if') is_cond=true
        }//switch
    }

    if(ctx_js){ // empty for "global x"

        var new_node = new $B.genNode(ctx_js)

        if(ctype=='yield'){

            // Replace "yield value" by "return [value, node_id]"

            var yield_node_id = top_node.yields.length
            while(ctx_js.charAt(ctx_js.length-1)==';'){
                ctx_js = ctx_js.substr(0,ctx_js.length-1)
            }
            var res =  'return ['+ctx_js+', '+yield_node_id+']'
            new_node.data = res
            top_node.yields.push(new_node)
        
        }else if(node.is_set_yield_value){

            // After each yield, py2js inserts a no-op line as a placeholder
            // for values or exceptions sent to the iterator
            //
            // Here, this line is replaced by a test on the attribute 
            // sent_value of __BRYTHON__.modules[iter_id]. This attribute is
            // set when methods send() or throw() of the generators are
            // inovked

            var yield_node_id = top_node.yields.length
            var js = 'var sent_value = this.sent_value || None;'
            
            // If method throw was called, raise the exception
            js += 'if(sent_value.__class__===$B.$GeneratorSendError)'+
                  '{throw sent_value.err}'

            // Else set the yielded value to sent_value
            js += 'var $yield_value'+ctx_js+'=sent_value;'
            
            // Reset sent_value value to None for the next iteration
            js += 'this.sent_value=None'
            new_node.data = js

        }else if(ctype=='break'){

            // For a "break", loop_num is a reference to the loop that is
            // broken

            new_node.is_break = true
            new_node.loop_num = node.context.tree[0].loop_ctx.loop_num

        }

        new_node.is_yield = (ctype=='yield'||ctype=='return')
        new_node.is_cond = is_cond
        new_node.is_except = is_except
        new_node.is_if = ctype=='condition' && ctx.token=="if"
        new_node.is_try = node.is_try
        new_node.is_else = is_else
        new_node.loop_start = node.loop_start
        new_node.is_set_yield_value = node.is_set_yield_value

        // Recursion
        for(var i=0, _len_i = node.children.length; i < _len_i;i++){
            new_node.addChild(make_node(top_node, node.children[i]))
        }
    }
    return new_node
}

$B.genNode = function(data, parent){
    this.data = data
    this.parent = parent
    this.children = []
    this.has_child = false
    if(parent===undefined){
        this.nodes = {}
        this.num = 0
    }

    this.addChild = function(child){
        if(child===undefined){console.log('child of '+this+' undefined')}
        this.children[this.children.length]=child
        this.has_child = true
        child.parent = this
        child.rank = this.children.length-1
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
        return res
    }

    this.clone_tree = function(exit_node, head){

        // Return a clone of the tree starting at node
        // If one the descendant of node is the exit_node, replace the code
        // by "void(0)"

        var res = new $B.genNode(this.data)
        if(this.replaced && !in_loop(this)){
            // cloning a node that was already replaced by 'void(0)'
            res.data = 'void(0)'
        }
        if(this===exit_node && (this.parent.is_cond || !in_loop(this))){
            // If we have to clone the exit node and its parent was
            // a condition, replace code by 'void(0)'
            if(!exit_node.replaced){ // replace only once
                res = new $B.genNode('void(0)')
            }else{
                res = new $B.genNode(exit_node.data)
            }
            exit_node.replaced = true
        }

        if(head && this.is_break){
            res.data = '$locals["$no_break'+this.loop_num+'"]=false;'
            res.data += 'var err = new Error("break");'
            res.data += 'err.__class__=$B.GeneratorBreak;throw err;'
            res.is_break = true
        }
        res.has_child = this.has_child
        res.is_cond = this.is_cond
        res.is_except = this.is_except
        res.is_try = this.is_try
        res.is_else = this.is_else
        res.loop_num = this.loop_num
        res.loop_start = this.loop_start
        res.no_break = true
        res.is_yield = this.is_yield
        for(var i=0, _len_i = this.children.length; i < _len_i;i++){
            res.addChild(this.children[i].clone_tree(exit_node, head))
            if(this.children[i].is_break){res.no_break=false}
        }
        return res
    }
    
    this.has_break = function(){
        if(this.is_break){return true}
        else{
            for(var i=0, _len_i = this.children.length; i < _len_i;i++){
                if(this.children[i].has_break()){return true}
            }
        }
        return false
    }
    
    this.indent_src = function(indent){
        return ' '.repeat(indent*indent)
    }

    this.src = function(indent){

        // Returns the indented Javascript source code starting at "this"

        indent = indent || 0
        var res = [this.indent_src(indent)+this.data], pos=1
        if(this.has_child) res[pos++]='{'
        res[pos++]='\n'
        for(var i=0, _len_i = this.children.length; i < _len_i;i++){
            res[pos++]=this.children[i].src(indent+1)
            // If child is a "yield" node, the Javascript code is a "return"
            // so it's no use adding followin nodes (and it raises a
            // SyntaxError on Firefox)
            if(this.children[i].is_yield){break}
        }
        if(this.has_child) res[pos++]='\n'+this.indent_src(indent)+'}\n'
        return res.join('')
    }
    
    this.toString = function(){return '<Node '+this.data+'>'}
    
}


// Object used as the attribute "__class__" of an error thrown in case of a
// "break" inside a loop
$B.GeneratorBreak = {}

// Class for errors sent to an iterator by "throw"
$B.$GeneratorSendError = {}

// Class used for "return" inside a generator function
var $GeneratorReturn = {}
$B.generator_return = function(value){
    return {__class__:$GeneratorReturn, value:value}
}

function in_loop(node){

    // Tests if node is inside a "for" or "while" loop

    while(node){
        if(node.loop_start!==undefined) return node
        node = node.parent
    }
    return false
}

function in_try(node){

    // Return the list of "try" clauses above the node

    var tries = [], pnode=node.parent, pos=0
    while(pnode){
        if(pnode.is_try){tries[pos++]=pnode}
        pnode = pnode.parent
    }
    return tries
}

var $BRGeneratorDict = {__class__:$B.$type,__name__:'generator'}

$B.gen_counter = 0 // used to identify the function run for each next()

$B.$BRgenerator2 = function(func_name, blocks, def_id, def_node){

    // Creates a function that will return an iterator
    // func_name : function name
    // def_id : generator function identifier
    // def_node : instance of Node for the function
    
    var def_ctx = def_node.context.tree[0]
    
    var module = def_node.module, // module name
        iter_id = def_id

    // Create a tree structure based on the generator tree
    // iter_id is used in the node where the iterator resets local
    // namespace
    var func_root = new $B.genNode(def_ctx.to_js())
    func_root.module = module
    func_root.yields = []
    func_root.loop_ends = {}
    func_root.def_id = def_id
    func_root.iter_id = iter_id
    for(var i=0, _len_i = def_node.children.length; i < _len_i;i++){
        func_root.addChild(make_node(func_root, def_node.children[i]))
    }
    var func_node = func_root.children[1].children[0]
    
    var obj = {
        __class__ : $BRGeneratorDict,
        blocks: blocks,
        def_ctx:def_ctx,
        def_id:def_id,
        func_name:func_name,
        func_root:func_root,
        module:module,
        gi_running:false,
        iter_id:iter_id,
        id:iter_id,
        num:0
    }
    
    var src = func_root.children[1].src(),
        raw_src = src.substr(src.search('function'))
    
    var first_line = func_root.children[0].src()
    var def_pos = first_line.search(/\$defaults/)
    if(def_pos>-1){
        var $default = first_line.substr(def_pos)
        // remove trailing ";"
        $default = $default.substr(0, $default.length-2)
        // replace string $default by the object
        raw_src = raw_src.replace(/\$defaults/g, $default)
    }
    
    var funcs = ['"'+escape(raw_src)+'"']
    
    //$B.modules[iter_id] = obj
    obj.parent_block = def_node.parent_block

    for(var i=0; i<func_root.yields.length;i++){
        funcs.push('"'+escape(make_next(obj, i))+'"')
    }
    
    delete $B.modules[iter_id]
    delete $B.bound[iter_id]

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
    root.addChild(self.func_root.children[0].clone())
    var fnode = self.func_root.children[1].clone()
    root.addChild(fnode)
    var func_node = self.func_root.children[1]
    
    // restore namespaces
    var js =  'for(var attr in this.blocks){eval("var "+attr+"=this.blocks[attr]");};'+
        'var $locals_'+self.iter_id+' = this.env, $locals = $locals_'+
            self.iter_id+', $local_name="'+self.iter_id+'";'
        
    fnode.addChild(new $B.genNode(js))
    // add a node to enter the frame
    fnode.addChild(new $B.genNode('$B.enter_frame(["'+self.iter_id+
        '",$locals,"'+self.module+'",$locals_'+self.module+']);'))

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

        var exit_parent = exit_node.parent
        var rest = [], pos=0
        var has_break = false
        
        // "start" is the position where the rest of the block starts
        // By default it is the node of rank exit_node.rank+1
        var start = exit_node.rank+1

        if(exit_node.loop_start!==undefined){
            // If exit_node is a loop, run it again
            start = exit_node.rank
        }else if(exit_node.is_cond){
            // If exit_node is a condition, start after the elif/else clauses
            while(start<exit_parent.children.length &&
                (exit_parent.children[start].is_except || 
                    exit_parent.children[start].is_else)){start++}
        }else if(exit_node.is_try || exit_node.is_except){
            // If exit_node is a try or except, start after the 
            // except/else/finally clauses
            while(start<exit_parent.children.length &&
                (exit_parent.children[start].is_except || 
                    exit_parent.children[start].is_else)){start++}
        }

        for(var i=start, _len_i = exit_parent.children.length; i < _len_i;i++){
            var clone = exit_parent.children[i].clone_tree(null,true)
            rest[pos++]=clone
            if(clone.has_break()){has_break=true}
        }

        // add rest of block to new function
        if(has_break){
            // If the rest had a "break", this "break" is converted into raising
            // an exception with __class__ set to GeneratorBreak
            var rest_try = new $B.genNode('try')
            for(var i=0, _len_i = rest.length; i < _len_i;i++){rest_try.addChild(rest[i])}
            var catch_test = 'catch(err)'
            catch_test += '{if(err.__class__!==$B.GeneratorBreak)'
            catch_test += '{throw err}}'
            catch_test = new $B.genNode(catch_test)
            rest = [rest_try, catch_test]
        }
        
        // Get list of "try" nodes above exit node
        var tries = in_try(exit_node)
        
        if(tries.length==0){
            // Not in a "try" clause : run rest at function level
            for(var i=0;i<rest.length;i++){fnode.addChild(rest[i])}
        }else{
            // Attach "rest" to successive "try" found, or to function body
            var tree = [], pos=0
            for(var i=0;i<tries.length;i++){
                var try_node = tries[i], try_clone = try_node.clone()
                if(i==0){
                    for(var j=0;j<rest.length;j++){try_clone.addChild(rest[j])}
                }
                var children = [try_clone], cpos=1

                for(var j=try_node.rank+1;j<try_node.parent.children.length;j++){
                    if(try_node.parent.children[j].is_except){
                        children[cpos++]=try_node.parent.children[j].clone_tree(null,true)
                    }else{
                        break
                    }
                }
                tree[pos++]=children
            }
            var parent = fnode
            while(tree.length){
                children = tree.pop()
                for(var i=0;i<children.length;i++){parent.addChild(children[i])}
                parent = children[0]
            }
        }

        // Go up one block until we get to the function root node
        exit_node = exit_parent
        if(exit_node===self.func_root){break}
    }
     
    // return the code of the function for next iteration
    var src = root.children[1].src(),
        next_src = src.substr(src.search('function'))
    return next_src
}

var $gen_it = {
    __class__: $B.$type,
    __name__: "generator"
}

$gen_it.__mro__ = [_b_.object.$dict]

//fix me, need to investigate __enter__ and __exit__ and what they do
$gen_it.__enter__ = function(self){console.log("generator.__enter__ called")}
$gen_it.__exit__ = function(self){console.log("generator.__exit__ called")}

$gen_it.__iter__ = function(self){
    return self
}

$gen_it.__next__ = function(self){
    if(self.$finished){throw _b_.StopIteration()}
    if(self.gi_running==true){
        throw ValueError("generator already executing")
    }
    self.gi_running = true
    if(self.next===undefined){
        self.$finished = true
        throw _b_.StopIteration()
    }
    
    try{
        var res = self.next.apply(self, self.args)
    }catch(err){
        /*
        console.log('error in __next__ of', self.name)
        console.log(self.next+'')
        console.log(err)
        */
        self.$finished=true
        throw err
    }finally{
        // The line "leave_frame" is not inserted in the function body for
        // generators, so we must call it here to pop from frames stack
        self.gi_running = false
        $B.leave_frame(self.iter_id)
    }

    if(res===undefined){throw _b_.StopIteration()}
    else if(res[0].__class__==$GeneratorReturn){
        // The function may have ordinary "return" lines, in this case
        // the iteration stops
        self.$finished = true
        throw StopIteration(res[0].value)
    }

    self.next = self.nexts[res[1]]
    self.gi_running = false
    return res[0]
}

$gen_it.close = function(self, value){
    self.sent_value = _b_.GeneratorExit()
    try{
        var res = $gen_it.__next__(self)
        if(res!==_b_.None){
            throw _b_.RuntimeError("closed generator returned a value")
        }
    }catch(err){
        if($B.is_exc(err,[_b_.StopIteration,_b_.GeneratorExit])){
            return _b_.None
        }
        throw err
    }
}

$gen_it.send = function(self, value){
    self.sent_value = value
    return $gen_it.__next__(self)
}

$gen_it.$$throw = function(self, value){
    if(_b_.isinstance(value,_b_.type)) value=value()
    self.sent_value = {__class__:$B.$GeneratorSendError,err:value}
    return $gen_it.__next__(self)
}

$B.genfunc = function(name, blocks, funcs){
    // Transform a list of functions into a generator object, ie a function
    // that returns an iterator
    return function(){
        var iter_id = '$gen'+$B.gen_counter++,
            gfuncs = []
        for(var i=0; i<funcs.length;i++){
            try{
                eval('var f='+unescape(funcs[i]))
            }catch(err){
                console.log(err)
                console.log(funcs[i]+'')
                throw err
            }
            gfuncs.push(f)
        }
        
        var res = {
            __class__: $gen_it,
            args: Array.prototype.slice.call(arguments),
            blocks: blocks,
            env: {},
            name: name,
            nexts: gfuncs.slice(1),
            next: gfuncs[0],
            iter_id: iter_id,
            gi_running: false,
            $started: false
        }
        return res
    }
}
$B.genfunc.__class__ = $B.$factory
$B.genfunc.$dict = $gen_it
$gen_it.$factory = $B.genfunc


})(__BRYTHON__)
