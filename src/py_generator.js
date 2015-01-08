;(function($B){

var _b_=$B.builtins

$B.make_node = function(top_node, node){
    var ctx_js = node.context.to_js()
    var is_cond = false, is_except = false,is_else=false
    
    if(node.locals_def){
        // the node where local namespace is reset
        ctx_js = 'var $locals = $B.vars["'+top_node.iter_id+'"], '
        ctx_js += '$locals_id = "'+top_node.iter_id+'";'
    }
    
    if(node.is_catch){is_except=true;is_cond=true}
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
            var rank = top_node.yields.length
            while(ctx_js.charAt(ctx_js.length-1)==';'){
                ctx_js = ctx_js.substr(0,ctx_js.length-1)
            }
            var res =  'return ['+ctx_js+', '+rank+']'
            new_node.data = res
            top_node.yields.push(new_node)
        
        }else if(node.is_set_yield_value){
            var js = '$sent'+ctx_js+'=__BRYTHON__.modules["'
            js += top_node.iter_id+'"].sent_value || None;'
            js += 'if($sent'+ctx_js+'.__class__===__BRYTHON__.$GeneratorSendError)'
            js += '{throw $sent'+ctx_js+'.err};'
            js += '$yield_value'+ctx_js+'=$sent'+ctx_js+';'
            js += '__BRYTHON__.modules["'+top_node.iter_id+'"].sent_value=None'
            new_node.data = js
        }else if(ctype=='break'){
            new_node.is_break = true
            // For a "break", loop_num is a reference to the loop that is
            // broken
            new_node.loop_num = node.context.tree[0].loop_ctx.loop_num
        }
        new_node.is_cond = is_cond
        new_node.is_except = is_except
        new_node.is_if = ctype=='condition' && ctx.token=="if"
        new_node.is_try = node.is_try
        new_node.is_else = is_else
        new_node.loop_start = node.loop_start
        new_node.is_set_yield_value = node.is_set_yield_value

        for(var i=0, _len_i = node.children.length; i < _len_i;i++){
            new_node.addChild($B.make_node(top_node, node.children[i]))
        }
    }
    return new_node
}

$B.genNode = function(data, parent){
    _indent = 4
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
        this.children.push(child)
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
            res.data += 'err.__class__=__BRYTHON__.GeneratorBreak;throw err;'
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
        res = this.indent_src(indent)+this.data
        if(this.has_child) res += '{'
        res += '\n'
        for(var i=0, _len_i = this.children.length; i < _len_i;i++){
            res += this.children[i].src(indent+1)
        }
        if(this.has_child) res+='\n'+this.indent_src(indent)+'}\n'
        return res
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
$B.generator_return = function(){return {__class__:$GeneratorReturn}}

function in_loop(node){

    // Tests if node is inside a "for" or "while" loop

    while(node){
        if(node.loop_start!==undefined) return node
        node = node.parent
    }
    return false
}

var $BRGeneratorDict = {__class__:$B.$type,__name__:'generator'}

$BRGeneratorDict.__iter__ = function(self){return self}

//fix me, need to investigate __enter__ and __exit__ and what they do
$BRGeneratorDict.__enter__ = function(self){console.log("generator.__enter__ called")}
$BRGeneratorDict.__exit__ = function(self){console.log("generator.__exit__ called")}

function clear_ns(iter_id){
    delete $B.vars[iter_id]
    delete $B.modules[iter_id]
    delete $B.bound[iter_id]
}

$BRGeneratorDict.__next__ = function(self){

    var _b_ = $B.builtins
    var $s=[]
    for(var $b in _b_) $s.push('var ' + $b +'=_b_["'+$b+'"]')
    eval($s.join(';'))

    // Inject global variables in local namespace
    for(var $attr in $B.vars[self.module]){
        try{eval("var "+$attr+"=$B.vars[self.module][$attr]")}
        catch(err){console.log('err for '+$attr)}
    }
    // If generator is a method, we need the $class object
    var $class = eval(self.$class)

    if(self.func_root.scope.context===undefined){
        var $globals = __BRYTHON__.vars[self.func_root.scope.id]
    }
    
    var scope_id = self.func_root.scope.id
    
    var first_iter = self._next===undefined
    
    if(first_iter){

        // First iteration : run generator function to initialise the iterator
        
        var src = self.func_root.src()+'\n)()'

        try{eval(src)}
        catch(err){
            console.log("cant eval\n"+src+'\n'+err)
            clear_ns(self.iter_id)
            throw err
        }
        
        self._next = __BRYTHON__.$generators[self.iter_id]
        
    }

    // Increment the iteration counter
    self.num++

    // Cannot resume a generator already running
    if(self.gi_running){
        throw _b_.ValueError("ValueError: generator already executing")
    }
    
    self.gi_running = true
    
    //if(self.num<6){console.log('run _next of '+self.iter_id+'\n'+self._next)}
    
    // Call the function _next to yield a value
    try{
        var res = self._next.apply(null, self.args)

    }catch(err){
        self._next = function(){
            var _err = StopIteration('after exception')
            _err.caught = true
            throw _err
        }
        clear_ns(self.iter_id)
        throw err
    }finally{
        self.gi_running = false
    }

    if(res[0].__class__==$GeneratorReturn){
        // The function may have ordinary "return" lines, in this case
        // the iteration stops
        self._next = function(){throw StopIteration("after generator return")}
        clear_ns(self.iter_id)
        throw StopIteration('')
    }

    // In the _next function, a "yield" returns a 2-element tuple, the
    // yielded value and a reference to the node where the function exited
    
    var yielded_value=res[0], yield_rank=res[1]
    
    // If the generator exits at the same place as in the previous iteration,
    // we don't have to build a new function, so just return the yielded value
    if(yield_rank==self.yield_rank) return yielded_value
    
    self.yield_rank = yield_rank
    
    // Get node where yield was thrown
    var exit_node = self.func_root.yields[yield_rank]
    
    // Attribute "replaced" is used to replace a node only once if it was
    // inside a loop
    exit_node.replaced = false

    // Before returning the yielded value, build the function for the next 
    // iteration
    
    // Create root node of new function and add the initialisation 
    // instructions
    
    var root = new $B.genNode(self.def_ctx.to_js('__BRYTHON__.generators["'+self.iter_id+'"]'))
    root.addChild(self.func_root.children[0].clone())
    fnode = self.func_root.children[1].clone()
    root.addChild(fnode)
    func_node = self.func_root.children[1]
    
    // restore $globals and $locals
    var js = 'var $globals = __BRYTHON__.vars["'+self.func_root.module+'"]'
    fnode.addChild(new $B.genNode(js))

    var js = 'var $locals_id = "'+self.iter_id+'", $locals = __BRYTHON__.vars[$locals_id]'
    fnode.addChild(new $B.genNode(js))

    // Parent of exit node    
    var pnode = exit_node.parent
    var exit_in_if = pnode.is_if || pnode.is_else
    
    // Rest of the block after exit_node
    var rest = []
    var no_break = true
    for(var i=exit_node.rank+1, _len_i = pnode.children.length; i < _len_i;i++){
        var clone = pnode.children[i].clone_tree(null,true)
        rest.push(clone)
        if(clone.has_break()){no_break=false}
    }
    
    // If exit_node was in an arborescence of "try" clauses, the "rest" must
    // run in the same arborescence
    var prest = exit_node.parent
    while(prest!==func_node){
        if(prest.is_except){
            var catch_node = prest
            if(prest.parent.is_except){catch_node=prest.parent}
            var rank = catch_node.rank
            while(rank<catch_node.parent.children.length && 
                catch_node.parent.children[rank].is_except){rank++}
            for(var i=rank, _len_i = catch_node.parent.children.length; i < _len_i;i++){
                rest.push(catch_node.parent.children[i].clone_tree(null,true))
            }
            prest = catch_node
        }
        else if(prest.is_try){
            var rest2 = prest.clone()
            for(var i=0, _len_i = rest.length; i < _len_i;i++){rest2.addChild(rest[i])}
            rest = [rest2]
            for(var i=prest.rank+1, _len_i = prest.parent.children.length; i < _len_i;i++){
                rest.push(prest.parent.children[i].clone_tree(null,true))
            }
            // We are adding the content of pnode. To avoid adding it a second time
            // if we are in a loop, pnode goes up one level
            pnode = pnode.parent
        }
        prest = prest.parent
    }
    
    // add rest of block to new function
    if(no_break){
        for(var i=0, _len_i = rest.length; i < _len_i;i++){fnode.addChild(rest[i])}
    }else{
        // If the rest had a "break", this "break" is converted into raising
        // an exception with __class__ set to GeneratorBreak
        var rest_try = new $B.genNode('try')
        for(var i=0, _len_i = rest.length; i < _len_i;i++){rest_try.addChild(rest[i])}
        fnode.addChild(rest_try)
        var catch_test = 'catch(err)'
        catch_test += '{if(err.__class__!==__BRYTHON__.GeneratorBreak)'
        catch_test += '{throw err}}'
        fnode.addChild(new $B.genNode(catch_test))
    }
    
    // If 'rest' has a break, we must exit the innermost loop
    if(!no_break){
        var loop = in_loop(pnode)
        if(loop){pnode=loop}
    }
    
    // While the parent of exit_node is in a loop, add it, only keeping the
    // part that starts at exit node

    while(pnode!==func_node && in_loop(pnode)){
        var rank = pnode.rank

        // block must start by "try", not "except"
        while(pnode.parent.children[rank].is_except){rank--}

        if(pnode.is_if){
            // If exit_node was in a "if", start after the last if/elif/else
            rank++
            exit_node.replaced = true
            while(rank<pnode.parent.children.length 
                && pnode.parent.children[rank].is_else){rank++}
        }else if(pnode.is_else){
            exit_node.replaced = true
            // If exit_node was in a "if", start after the last if/elif/else
            while(rank<pnode.parent.children.length 
                && pnode.parent.children[rank].is_else){rank++}
        }        

        for(var i=rank, _len_i = pnode.parent.children.length; i < _len_i;i++){
            var g = pnode.parent.children[i].clone_tree(exit_node,true)
            fnode.addChild(g)
        }
        pnode = pnode.parent
        
    }
    
    // if exit_node was in a loop, or if pnode is an "if" or "else", 
    // add the rest of the block after pnode
    while(pnode!==func_node && 
        (in_loop(exit_node) || pnode.is_if || pnode.is_else)){
        var rank = pnode.rank+1
        while(rank < pnode.parent.children.length){
            var next_node = pnode.parent.children[rank]
            if(next_node.is_else){rank++}
            break
        }
    
        for(var i=rank, _len_i = pnode.parent.children.length; i < _len_i;i++){
            fnode.addChild(pnode.parent.children[i].clone_tree())
        }
        pnode = pnode.parent
    }

    var js = 'var err=StopIteration("inserted S.I. '+self.func_name+'");'
    js += 'err.caught=true;throw err'
    fnode.addChild(new $B.genNode(js))

    // Set self._next to the code of the function for next iteration

    self.next_root = root
    var next_src = root.src()+'\n)()'
    try{eval(next_src)}
    catch(err){console.log('error '+err+'\n'+next_src)}
    
    //self._next = eval(self.func_name)
    self._next = __BRYTHON__.generators[self.iter_id]
        
    // Return the yielded value
    return yielded_value

}

$BRGeneratorDict.__mro__ = [$BRGeneratorDict,_b_.object.$dict]

$BRGeneratorDict.__repr__ = $BRGeneratorDict.__str__ = function(self){
    return '<generator '+self.func_name+' '+self.iter_id+'>'
}

$BRGeneratorDict.close = function(self, value){
    self.sent_value = _b_.GeneratorExit()
    try{
        var res = $BRGeneratorDict.__next__(self)
        if(res!==_b_.None){
            throw _b_.RuntimeError("closed generator returned a value")
        }
    }catch(err){
        if($B.is_exc(err,[_b_.StopIteration,_b_.GeneratorExit])) return _b_.None
        throw err
    }
}

$BRGeneratorDict.send = function(self, value){
    self.sent_value = value
    return $BRGeneratorDict.__next__(self)
}

$BRGeneratorDict.$$throw = function(self, value){
    if(_b_.isinstance(value,_b_.type)) value=value()
    self.sent_value = {__class__:$B.$GeneratorSendError,err:value}
    return $BRGeneratorDict.__next__(self)
}

$B.$BRgenerator = function(scope_id, func_name, def_id, $class){

    var def_node = $B.modules[def_id]
    var def_ctx = def_node.context.tree[0]
    var counter = 0 // used to identify the function run for each next()
    
    var func = __BRYTHON__.vars[scope_id][func_name]
    __BRYTHON__.generators = __BRYTHON__.generators || {}

    var module = def_node.module

    var res = function(){
        var args = []
        for(var i=0, _len_i = arguments.length; i < _len_i;i++){args.push(arguments[i])}

        // create an id for the iterator
        var iter_id = def_id+'-'+counter
        counter++
        
        // initialise its namespace
        $B.vars[iter_id] = {}
        
        // Names bound in generator are also bound in iterator
        $B.bound[iter_id] = {}
        for(var attr in $B.bound[def_id]){$B.bound[iter_id][attr] = true}

        // Create a tree structure based on the generator tree
        // iter_id is used in the node where the iterator resets local
        // namespace
        __BRYTHON__.$generators = __BRYTHON__.$generators || {}
        var func_root = new $B.genNode(def_ctx.to_js('__BRYTHON__.$generators["'+iter_id+'"]'))
        func_root.scope = __BRYTHON__.modules[scope_id]
        func_root.module = module
        func_root.yields = []
        func_root.loop_ends = {}
        func_root.def_id = def_id
        func_root.iter_id = iter_id
        for(var i=0, _len_i = def_node.children.length; i < _len_i;i++){
            func_root.addChild($B.make_node(func_root, def_node.children[i]))
        }
        var func_node = func_root.children[1].children[0]
        func_root.children[1].addChild(new $B.genNode('var err=StopIteration("");err.caught=true;throw err'))
        
        var obj = {
            __class__ : $BRGeneratorDict,
            args:args,
            $class:$class,
            def_id:def_id,
            def_ctx:def_ctx,
            def_node:def_node,
            func:func,
            func_name:func_name,
            func_root:func_root,
            module:module,
            func_node:func_node,
            next_root:func_root,
            gi_running:false,
            iter_id:iter_id,
            id:iter_id,
            num:0
        }
        
        $B.modules[iter_id] = obj
        obj.parent_block = def_node.parent_block
        return obj
    }
    res.__call__ = function(){console.log('call generator');return res.apply(null,arguments)}
    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}
$B.$BRgenerator.__repr__ = function(){return "<class 'generator'>"}
$B.$BRgenerator.__str__ = function(){return "<class 'generator'>"}
$B.$BRgenerator.__class__ = $B.$type

})(__BRYTHON__)
