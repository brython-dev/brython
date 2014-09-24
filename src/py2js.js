// Python to Javascript translation engine

;(function($B){

var js,$pos,res,$op

var $operators = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift",
    "+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod","&=":"iand","|=":"ior","^=":"ixor",
    "+":"add","-":"sub","*":"mul",
    "/":"truediv","%":"mod","&":"and","|":"or","~":"invert",
    "^":"xor","<":"lt",">":"gt",
    "<=":"le",">=":"ge","==":"eq","!=":"ne",
    "or":"or","and":"and", "in":"in",
    "is":"is","not_in":"not_in","is_not":"is_not" // fake
}

var $oplist = []
for(var attr in $operators){$oplist.push(attr)}

// operators weight for precedence
var $op_order = [['or'],['and'],
    ['in','not_in'],
    ['<','<=','>','>=','!=','==','is','is_not'],
    ['|','^','&'],
    ['>>','<<'],
    ['+'],
    ['-'],
    ['*'],
    ['/','//','%'],
    ['unary_neg','unary_inv'],
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

var $augmented_assigns = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod",
    "&=":"iand","|=":"ior","^=":"ixor"
}

function $_SyntaxError(context,msg,indent){
    console.log('-- syntax error '+context+' '+msg)
    var ctx_node = context
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var module = tree_node.module
    var line_num = tree_node.line_num
    $B.line_info = [line_num,module]
    if(indent===undefined){
        if(msg.constructor===Array){$B.$SyntaxError(module,msg[0],$pos)}
        if(msg==="Triple string end not found"){
            // add an extra argument : used in interactive mode to
            // prompt for the rest of the triple-quoted string
            $B.$SyntaxError(module,'invalid syntax : triple string end not found',$pos)
        }
        $B.$SyntaxError(module,'invalid syntax',$pos)
    }else{throw $B.$IndentationError(module,msg,$pos)}
}

var $first_op_letter = [], $obj={}
for(var $op in $operators) $obj[$op.charAt(0)]=1
for(var $attr in $obj) $first_op_letter.push($attr)

//    if($first_op_letter.indexOf($op.charAt(0))==-1){
//        $first_op_letter.push($op.charAt(0))
//    }
//}

function $Node(type){
    //if(type===undefined){console.log('type undefined !')}
    this.type = type
    this.children=[]
    this.yield_atoms = []
    this.add = function(child){
        this.children.push(child)
        child.parent = this
        child.module = this.module
    }
    this.insert = function(pos,child){
        this.children.splice(pos,0,child)
        child.parent = this
        child.module = this.module
    }
    this.toString = function(){return "<object 'Node'>"} 
    this.show = function(indent){
        var res = ''
        if(this.type==='module'){
            for(var i=0;i<this.children.length;i++){
                res += this.children[i].show(indent)
            }
            return res
        }
            
        indent = indent || 0
        res += ' '.repeat(indent)
        //for(var i=0;i<indent;i++) res+=' '
        res += this.context
        if(this.children.length>0) res += '{'
        res +='\n'
        for(var i=0;i<this.children.length;i++){
           res += '['+i+'] '+this.children[i].show(indent+4)
        }
        if(this.children.length>0){
          res += ' '.repeat(indent)
          //for(var i=0;i<indent;i++) res+=' '
          res+='}\n'
        }
        return res
    }
    this.indent_str = function(indent){
        return ' '.repeat(indent)
        //var res = ''
        //for(var i=0;i<indent;i++) res+=' '
        //return res
    }

    this.to_js = function(indent){
        if(this.js!==undefined) return this.js

        this.res = []
        this.unbound = []
        if(this.type==='module'){
          for(var i=0;i<this.children.length;i++){
             this.res.push(this.children[i].to_js())
             this.children[i].js_index = this.res.length+0
          }
          this.js = this.res.join('')
          return this.js
        }
        indent = indent || 0
        var ctx_js = this.context.to_js()
        if(ctx_js){ // empty for "global x"
          this.res.push(this.indent_str(indent))
          this.res.push(ctx_js)
          this.js_index = this.res.length+0
          if(this.children.length>0) this.res.push('{')
          this.res.push('\n')
          for(var i=0;i<this.children.length;i++){
             this.res.push(this.children[i].to_js(indent+4))
             this.children[i].js_index = this.res.length+0
          }
          if(this.children.length>0){
             this.res.push(this.indent_str(indent))
             this.res.push('}\n')
          }
        }

        this.js = this.res.join('')
        return this.js
    }
    this.transform = function(rank){
        // Apply transformations to each node recursively
        
        if(this.yield_atoms.length>0){
            // If the node contains 'yield' atoms, we must split the node into
            // several nodes
            // The line 'a = yield X' is transformed into 3 lines :
            //     $yield_value0 = X
            //     yield $yield_value0
            //     $yield_value0 = <value sent to generator > or None
            //     a = $yield_value

            // remove original line
          this.parent.children.splice(rank,1)
          var offset = 0
          for(var i=0;i<this.yield_atoms.length;i++){

                // create a line to store the yield expression in a
                // temporary variable
                var temp_node = new $Node()
                var js = '$yield_value'+$loop_num
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
          return ctx_offset
        }
    }
    this.get_ctx = function(){return this.context}
    this.clone = function(){
        var res = new $Node(this.type)
        for(var attr in this){res[attr] = this[attr]}
        return res
    }
}

var $loop_id=0

function $AbstractExprCtx(context,with_commas){
    this.type = 'abstract_expr'
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(abstract_expr '+with_commas+') '+this.tree}
    this.to_js = function(){
        if(this.type==='list') return '['+$to_js(this.tree)+']'
        return $to_js(this.tree)
    }
}

function $AssertCtx(context){
    this.type = 'assert'
    this.toString = function(){return '(assert) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
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

function $AssignCtx(context, check_unbound){
    // context is the left operand of assignment
    // check_unbound is used to check unbound local variables
    // This check is done when the AssignCtx object is created, but must be
    // disabled if a new AssignCtx object is created afterwards by method
    // transform()
    
    check_unbound = check_unbound === undefined
    
    this.type = 'assign'
    // replace parent by this in parent tree
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.parent = context.parent
    this.tree = [context]
    
    if(context.type=='expr' && context.tree[0].type=='call'){
        $_SyntaxError(context,["can't assign to function call "])
    }
    
    // An assignment in a function creates a local variable. If it was
    // referenced before, replace the statement where it was defined by an
    // UnboundLocalError
    if(context.type=='list_or_tuple' || 
        (context.type=='expr' && context.tree[0].type=='list_or_tuple')){
        if(context.type=='expr'){context = context.tree[0]}
        for(var i=0;i<context.tree.length;i++){
            var assigned = context.tree[i].tree[0]
            if(assigned.type=='id' && check_unbound){
                var scope = $get_scope(this)
                if(scope.ntype=='def' || scope.ntype=='generator'){
                    $check_unbound(assigned,scope,assigned.value)
                }
            }else if(assigned.type=='call'){
                $_SyntaxError(context,["can't assign to function call"])
            }
        }
    }else if(context.type=='assign'){
        for(var i=0;i<context.tree.length;i++){
            var assigned = context.tree[i].tree[0]
            if(assigned.type=='id'){
                var scope = $get_scope(this)
                if(scope.ntype=='def' || scope.ntype=='generator'){
                    $check_unbound(assigned,scope,assigned.value)
                }
            }
        }
    }else{
        var assigned = context.tree[0]
        if(assigned && assigned.type=='id'){
            var scope = $get_scope(this)
            if(scope.ntype=='def' || scope.ntype=='generator'){
                $check_unbound(assigned,scope,assigned.value)
            }
        }
    }
    
    this.toString = function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}
    this.transform = function(node,rank){
        // rank is the rank of this line in node
        var left = this.tree[0]
        while(left.type==='assign'){ 
            // chained assignment : x=y=z
            // transform current node to "y=z"
            // and add a new node "x=y"
            var new_node = new $Node()
            var node_ctx = new $NodeCtx(new_node)
            node_ctx.tree = [left]
            node.parent.insert(rank+1,new_node)
            this.tree[0] = left.tree[1]
            left = this.tree[0]
        }
        var left_items = null
        switch(left.type) {
          case 'expr':
            //if(left.type==='expr' && left.tree.length>1){
            if(left.tree.length>1){
               left_items = left.tree
            //}else if(left.type==='expr' && 
            } else if (left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list'){
              left_items = left.tree[0].tree
            }else if(left.tree[0].type=='id'){
                // simple assign
                var name = left.tree[0].value
                scope = $get_scope(this)
                scope.bound = scope.bound || []
                if(scope.bound.indexOf(name)==-1){scope.bound.push(name)}
            }
            break
          case 'target_list':           
          case 'list_or_tuple':
            //}else if(left.type==='target_list'){
            //left_items = left.tree
            //}else if(left.type==='list_or_tuple'){
            left_items = left.tree
        }
        if(left_items===null) return
        
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
            var new_nodes = []
            // replace original line by dummy line : the next one might also
            // be a multiple assignment
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'void(0)')
            new_nodes.push(new_node)
            
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'var $temp'+$loop_num+'=[]')
            new_nodes.push(new_node)

            for(var i=0;i<right_items.length;i++){
                var js = '$temp'+$loop_num+'.push('+right_items[i].to_js()+')'
                var new_node = new $Node()
                new $NodeJSCtx(new_node,js)
                new_nodes.push(new_node)
            }
            for(var i=0;i<left_items.length;i++){
                var new_node = new $Node()
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                // assignment to left operand
                // set "check_unbound" to false
                var assign = new $AssignCtx(left_items[i], false) 
                assign.tree[1] = new $JSCode('$temp'+$loop_num+'['+i+']')
                new_nodes.push(new_node)
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

            var js = 'var $right'+$loop_num+'=getattr(iter('+right.to_js()+'),"__next__");'
            new $NodeJSCtx(new_node,js)
            var new_nodes = [new_node]
            
            var rlist_node = new $Node()
            js = 'var $rlist'+$loop_num+'=[];'
            js += 'while(1){try{$rlist'+$loop_num+'.push($right'
            js += $loop_num+'())}catch(err){__BRYTHON__.$pop_exc();break}};'
            new $NodeJSCtx(rlist_node, js)
            new_nodes.push(rlist_node)
            
            // If there is a packed tuple in the list of left items, store
            // its rank in the liste
            var packed = null
            for(var i=0;i<left_items.length;i++){
                var expr = left_items[i]
                if(expr.type=='expr' && expr.tree[0].type=='packed'){
                    packed = i
                    break
                }
            }
            
            // Test if there were enough values in the right part
            var check_node = new $Node()
            var min_length = left_items.length
            if(packed!==null){min_length--}
            js = 'if($rlist'+$loop_num+'.length<'+min_length+')'
            js += '{throw ValueError("need more than "+$rlist'+$loop_num
            js += '.length+" value" + ($rlist'+$loop_num+'.length>1 ?'
            js += ' "s" : "")+" to unpack")}'
            new $NodeJSCtx(check_node,js)
            new_nodes.push(check_node)

            // Test if there were enough variables in the left part
            if(packed==null){
                var check_node = new $Node()
                var min_length = left_items.length
                js = 'if($rlist'+$loop_num+'.length>'+min_length+')'
                js += '{throw ValueError("too many values to unpack '
                js += '(expected '+left_items.length+')")}'
                new $NodeJSCtx(check_node,js)
                new_nodes.push(check_node)
            }

            var j=0
            for(var i=0;i<left_items.length;i++){

                var new_node = new $Node()
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                var assign = new $AssignCtx(left_items[i], false) // assignment to left operand
                var js = '$rlist'+$loop_num
                if(packed==null || i<packed){
                    js += '['+i+']'
                }else if(i==packed){
                    js += '.slice('+i+',$rlist'+$loop_num+'.length-'
                    js += (left_items.length-i-1)+')'
                }else{
                    js += '[$rlist'+$loop_num+'.length-'+(left_items.length-i)+']'
                }
                assign.tree[1] = new $JSCode(js) // right part of the assignment
                new_nodes.push(new_node)
            }
            
            node.parent.children.splice(rank,1) // remove original line
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
            }
            $loop_num++
        }
    }
    this.to_js = function(){
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
          
          var node = $get_node(this)
          
          var res='', rvar=''
          if(right.type=='expr' && right.tree[0]!==undefined &&
             right.tree[0].type=='call' &&
             ('eval' == right.tree[0].func.value ||
              'exec' == right.tree[0].func.value)) {
             res += 'var $temp'+$loop_num+'='+right.to_js()+';\n'
             rvar = '$temp'+$loop_num
             $loop_num++
          }else if(right.type=='expr' && right.tree[0]!==undefined &&
              right.tree[0].type=='sub'){
             res += 'var $temp'+$loop_num+'='+right.to_js()+';\n'
             rvar = '$temp'+$loop_num
          }else{
             rvar = right.to_js()
          }
                
          if(left.type==='attribute'){ // assign to attribute
              left.func = 'setattr'
              res += left.to_js()
              left.func = 'getattr'
              res = res.substr(0,res.length-1) // remove trailing )
              return res + ','+rvar+');None;'
          }
          if(left.type==='sub'){ // assign to item
              if(Array.isArray){
                  // If browser supports Array.isArray, test if the subscripted
                  // object is an array, if all subscription are integers or 
                  // ids, and if the assigned item exists
                  // If so, use the Javascript syntax a[x] = y
                  // Else use __setitem__
                  function is_simple(elt){
                      return (elt.type=='expr' &&
                          ['int','id'].indexOf(elt.tree[0].type)>-1)
                  }
                  var exprs = []
                  if(left.tree.length==1){
                      var left_seq = left, args = [], ix = 0
                      while(left_seq.value.type=='sub' && left_seq.tree.length==1){
                          //left_seq.value.marked = true
                          if(is_simple(left_seq.tree[0])){
                              args.push('['+left_seq.tree[0].to_js()+']')
                          }else{
                              exprs.push('var $temp_ix'+$loop_num+'_'+ix+'='+left_seq.tree[0].to_js())
                              args.push('[$temp_ix'+$loop_num+'_'+ix+']')
                              left_seq.tree[0]={type:'id',
                                  to_js:(function(rank){
                                      return function(){return '$temp_ix'+$loop_num+'_'+rank}
                                      })(ix)
                              }
                              ix++
                          }
                          left_seq=left_seq.value
                      }
                      if(is_simple(left_seq.tree[0])){
                          args.unshift('['+left_seq.tree[0].to_js()+']')
                      }else{
                          exprs.push('var $temp_ix'+$loop_num+'_'+ix+'='+left_seq.tree[0].to_js())
                          args.unshift('[$temp_ix'+$loop_num+'_'+ix+']')
                          left_seq.tree[0]={type:'id',
                              to_js:(function(rank){
                                  return function(){return '$temp_ix'+$loop_num+'_'+rank}
                                  })(ix)
                          }
                          ix++
                      }
                      
                      //console.log('left seq '+left_seq+' value '+left_seq.value)
                      if (left_seq.value.type!=='id'){
                          var val = '$temp_ix'+$loop_num+'_'+ix
                          exprs.push('var '+val+'='+left_seq.value.to_js())
                      }else{
                          var val = left_seq.value.to_js()
                      }
                      res += exprs.join(';\n')+';\n'
                      
                      res += 'Array.isArray('+val+') && '
                      res += val+args.join('')+'!==undefined ? '
                      res += val+args.join('')+'='+rvar
                      res += ' : '

                    res += '__BRYTHON__.$setitem('+left.value.to_js()
                    res += ','+left.tree[0].to_js()+','+rvar+');None;'
                    return res
                }
            }
            
            left.func = 'setitem' // just for to_js()
            res += left.to_js()
            res = res.substr(0,res.length-1) // remove trailing )
            left.func = 'getitem' // restore default function
            return res + ','+rvar+');None;'
          }
        }
       
        var scope = $get_scope(this)

        if(scope.ntype==="module"){
          var res = 'var '+left.to_js()
          //if(scope.module!=='__main__'){res = 'var '+res}
          if(left.to_js().charAt(0)!='$'){
            res += '=$globals["'+left.to_js()+'"]'
          }
          return res + '='+right.to_js()+';None;'
        }
        if(scope.is_function){
          // assignment in a function : depends if variable is local
          // or global
          var _ljs=left.to_js()
          if(scope.globals && scope.globals.indexOf(left.value)>-1){
            return _ljs+'=$globals["'+_ljs+'"]='+right.to_js()
          }
          // local to scope : prepend 'var'
          var res = 'var '+_ljs+'=$locals["'+_ljs+'"]='
          return res + right.to_js()+';None;'
        }
        if(scope.ntype==='class'){
          // Left part is a "raw_js" in case of augmented assignements
          // in a class body
          if(left.type=="raw_js") return left.to_js()+'='+right.to_js()

          // assignment in a class : creates a class attribute
          left.is_left = true // used in to_js() for ids
          var attr = left.to_js()
          // Store the JS code in attribute 'in_class'
          // In the case of a chained assignment inside a class, eg
          //    class foo:
          //        a = b = 0
          // the assignment is split into "b = 0" then "a = b"
          // In the second assignment, the JS rendering of b must be
          // the same as in the first assignment, ie "$class.b"
          left.in_class = '$class.'+attr
          return '$class.'+attr+'='+right.to_js()
        }
    }
}

function $AttrCtx(context){
    this.type = 'attribute'
    this.value = context.tree[0]
    this.parent = context
    context.tree.pop()
    context.tree.push(this)
    this.tree = []
    this.func = 'getattr' // becomes setattr for an assignment 
    this.toString = function(){return '(attr) '+this.value+'.'+this.name}
    this.to_js = function(){
        return this.func+'('+this.value.to_js()+',"'+this.name+'")'
    }
}

function $AugmentedAssignCtx(context, op){
    this.type = 'augm_assign'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.op = op
    this.tree = [context]

    this.toString = function(){return '(augm assign) '+this.tree}

    this.transform = function(node,rank){
    
        var func = '__'+$operators[op]+'__'

        var offset=0, parent=node.parent
        
        // remove current node
        parent.children.splice(rank,1)
        
        var left_is_id = this.tree[0].type=='expr' && this.tree[0].tree[0].type=='id'
        var right_is_int = this.tree[1].type=='expr' && this.tree[1].tree[0].type=='int'
        
        var right = right_is_int ? this.tree[1].tree[0].value : '$temp'
        
        if(!right_is_int){
        
            // Create temporary variable
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'var $temp,$left')
            parent.insert(rank,new_node)
            offset++
        
            // replace current node by "$temp = <placeholder>"
            // at the end of $aumented_assign, control will be
            // passed to the <placeholder> expression
            var new_node = new $Node()
            var new_ctx = new $NodeCtx(new_node)
            var new_expr = new $ExprCtx(new_ctx,'js',false)
            // The id must be a "raw_js", otherwise if scope is a class, it would
            // create a class attribute "$class.$temp"
            var _id = new $RawJSCtx(new_expr,'$temp')
            var assign = new $AssignCtx(new_expr)
            assign.tree[1] = this.tree[1]
            _id.parent = assign
            parent.insert(rank+offset, new_node)
            offset++
        }
        /*
        if(this.tree[0].type=='expr' && this.tree[0].tree[0].type=="sub"){
            console.log('augm assign to '+this.tree[0].tree[0])
            var new_node = new $Node()
            var js = 'var $left = '+this.tree[0].tree[0].value.to_js()
            new $NodeJSCtx(new_node, js)
            parent.insert(rank+offset, new_node)
            this.tree[0].tree[0] = {type:'id',value:'$left',to_js:function(){return '$left'}}
            offset++
        }
        */

        var prefix = ''
    
        switch(op) {
          case '+=':
          case '-=':
          case '*=':
          case '/=':
            if(left_is_id){
              var scope = $get_scope(context)
              prefix='$locals'
              switch(scope.ntype) {
                case 'module':
                  prefix='$globals'
                  break
                case 'def':
                case 'generator':
                  if(scope.globals && scope.globals.indexOf(context.tree[0].value)>-1){
                    prefix = '$globals'
                  }
                  break;
                case 'class':
                  var new_node = new $Node()
                  new $NodeJSCtx(new_node,'$left='+context.to_js())
                  parent.insert(rank+offset, new_node)
                  offset++
              }
            }
        }
        
        // insert shortcut node if op is += and both args are numbers
        if(prefix){
            var left = context.tree[0].value
            var new_node = new $Node()
            js = right_is_int ? 'if(' : 'if(typeof $temp.valueOf()=="number" && '
            js += 'typeof '+left+'.valueOf()=="number"){'
            
            js += right_is_int ? '(' : '(typeof $temp=="number" && '
            js += 'typeof '+left+'=="number") ? '

            if(scope.ntype=='class'){js+='$left'}
            else{js += left}
            js += op+right
            
            js += ' : (typeof '+left+'=="number" ? '+left+op
            js += right_is_int ? right : right+'.valueOf()'
            js += ' : '+left + '.value ' +op
            js += right_is_int ? right : right+'.valueOf()'
            
            js += ');'+prefix+'["'+left+'"]='+left
            js += '}'
            
            new $NodeJSCtx(new_node,js)
            parent.insert(rank+offset,new_node)
            offset++

        }
        var aaops = {'+=':'add','-=':'sub','*=':'mul'}
        if(context.tree[0].type=='sub' && 
            ['+=','-=','*='].indexOf(op)>-1 && 
            context.tree[0].tree.length==1){
            var js1 = '__BRYTHON__.augm_item_'+aaops[op]+'('
            js1 += context.tree[0].value.to_js()
            js1 += ','+context.tree[0].tree[0].to_js()+','
            js1 += right+');None;'
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js1)
            parent.insert(rank+offset, new_node)
            offset++
            return
        }
        
        // insert node 'if(!hasattr(foo,"__iadd__"))
        var new_node = new $Node()
        var js = ''
        if(prefix){js += 'else '}
        js += 'if(!hasattr('+context.to_js()+',"'+func+'"))'
        new $NodeJSCtx(new_node,js)
        parent.insert(rank+offset,new_node)
        offset ++
    
        // create node for "foo = foo + bar"
        var aa1 = new $Node()
        var ctx1 = new $NodeCtx(aa1)
        var expr1 = new $ExprCtx(ctx1,'clone',false)
        expr1.tree = context.tree
        for(var i=0;i<expr1.tree.length;i++){
            expr1.tree[i].parent = expr1
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
    
        // create node for "foo.__iadd__(bar)    
        var aa3 = new $Node()
        var js3 = context.to_js()
        if(prefix){
            if(scope.ntype=='class'){js3='$left'}
            else{js3 += '='+prefix+'["'+context.tree[0].value+'"]'}
        }
        js3 += '=getattr('+context.to_js()
        js3 += ',"'+func+'")('+right+')'
        new $NodeJSCtx(aa3,js3)
        aa2.add(aa3)
        
        js = prefix+'["'+context.to_js()+'"]='+context.to_js

        return offset
    }

    this.to_js = function(){return ''
        if(this.tree[0].type=='expr' && this.tree[0].length==1
            && this.tree[0].tree[0].type=='id'){
            return this.tree[0].to_js()+op+this.tree[1].to_js()+';'
        }else{
            return this.tree[0].to_js()+op+this.tree[1].to_js()+';'
        }
    }
}

// used for causes when we should do things sync or 
// when we need to block (time.sleep) for instance
// NOTE:  this.tree needs to contain the rest of the Abstract Sytnax Tree
// for the whole program.  This will emulate blocking by putting all generated
// javascript code inside a setTimeout anonymous function
// Pierre, I need help figuring out how to "populate" this.tree.  any ideas?

// we can do this by creating a function that contains all the 
// rest of the js compiled code.  At run time, if the blocking function
// matches the hash, we know to block, else execute the function
// with block time = 0;

function $BlockingCtx(context) {
    console.log('blockingCtx', context)
    this.type = 'block'
    this.parent = context
    this.tree = []
    this.delay = 1000   // 1 second for now, will need to set this to some value

    var scope = $get_scope(this)
    // probably want to check for classes too?
    if(!scope.is_function){
      $_SyntaxError(context,["'blocking' non function"])
    }

    // change type of function to blocking_function
    var def = scope.context.tree[0]
    def.type = 'blocking_function'

    this.transform = function(node, rank) {
        console.log('blockingctx.transform')
        var setTimeout_node = new $Node()
        new $NodeJSCtx(setTimeout_node,'window.setTimeout(')

        var def_func_node = new $Node()
        new $NodeJSCtx(def_func_node,'function()')

        // actually we want the whole AST from this point in the application
        // to the end of the program
        // this block could occur somewhere buried deep in the program, so
        // we'll need to figure out how to do that.
        while (node.parent !== undefined) {
          node=node.parent
        }

        for(var i=0;i<node.children.length;i++) def_func_node.add(node.children[i])

        setTimeout_node.add(def_func_node)

        var setTimeout_node_end = new $Node()
        new $NodeJSCtx(setTimeout_node_end,')')

        node.add(setTimeout_node)
        node.add(setTimeout_node_end)

        this.transformed=true
    }
    this.to_js = function(){
       return 'window.setTimeout(function(){'+$to_js(this.tree)+'},'+this.delay+');'
    }
}

function $BodyCtx(context){
    // inline body for def, class, if, elif, else, try...
    // creates a new node, child of context node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var body_node = new $Node()
    tree_node.insert(0,body_node)
    return new $NodeCtx(body_node)
}

function $BreakCtx(context){
    // used for the keyword "break"
    // a flag is associated to the enclosing "for" or "while" loop
    // if the loop exits with a break, this flag is set to true
    // so that the "else" clause of the loop, if present, is executed
    
    this.type = 'break'
    this.toString = function(){return 'break '}
    this.parent = context
    context.tree.push(this)

    // get loop context
    var ctx_node = context
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var loop_node = tree_node.parent
    while(1){
        if(loop_node.type==='module'){
            // "break" is not inside a loop
            $_SyntaxError(context,'break outside of a loop')
        }else{
            var ctx = loop_node.context.tree[0]
            var _ctype=ctx.type
            if(_ctype==='for' || (_ctype==='condition' && ctx.token==='while')){
                this.loop_ctx = ctx
                ctx.has_break = true
                break
            }else if('def'==_ctype || 'generator'==_ctype || 'class'==_ctype){
                // "break" must not be inside a def or class, even if they are
                // enclosed in a loop
                $_SyntaxError(context,'break outside of a loop')
            }else{
                loop_node=loop_node.parent
            }//if
        }//if
    }//while

    this.to_js = function(){
        return 'var $no_break'+this.loop_ctx.loop_num+'=false;break'
    }
}

function $CallArgCtx(context){
    this.type = 'call_arg'
    this.toString = function(){return 'call_arg '+this.tree}
    this.parent = context
    this.start = $pos
    this.tree = []
    context.tree.push(this)
    this.expect='id'
    this.to_js = function(){return $to_js(this.tree)}
}

function $CallCtx(context){
    this.type = 'call'
    this.func = context.tree[0]
    if(this.func!==undefined){ // undefined for lambda
        this.func.parent = this
    }
    this.parent = context
    if(context.type!='class'){
        context.tree.pop()
        context.tree.push(this)
    }else{
        // class parameters
        context.args = this
    }
    this.tree = []
    this.start = $pos

    this.toString = function(){return '(call) '+this.func+'('+this.tree+')'}

    this.to_js = function(){
        if(this.tree.length>0){
            if(this.tree[this.tree.length-1].tree.length==0){
                // from "foo(x,)"
                this.tree.pop()
            }
        }
        if(this.func!==undefined) {
            switch(this.func.value) {
              case 'eval':
              case 'exec': 
                // get module
                var module = $get_module(this).module

                var arg = this.tree[0].to_js()
                var ns = ''
                var _name = module+',exec_'+Math.random().toString(36).substr(2,8)
                if(this.tree.length>1){
                   var arg2 = this.tree[1]
                   if(arg2.tree!==undefined&&arg2.tree.length>0){
                      arg2 = arg2.tree[0]
                   }
                   if(arg2.tree!==undefined&&arg2.tree.length>0){
                      arg2 = arg2.tree[0]
                   }
                   if(arg2.type==='call'){
                      if(arg2.func.value==='globals'){
                         // exec in globals
                         ns = 'globals'
                         _name = module
                      }
                   }else if(arg2.type==='id'){
                      ns = arg2.value
                      _name = ns
                   }
                }
                $B.$py_module_path[_name]=$B.$py_module_path[module]

                // replace by the result of an anonymous function with a try/except clause
                var _r = '(function(){try{'

                // if an argument namespace is passed, insert it
                if(ns!=='' && ns!=='globals'){
                   _r += '\n    var $globals = {}\n'
                   _r += '\n    for(var $i=0;$i<'+ns+'.$keys.length;$i++){\n'
                   _r += '      eval("var "+'+ns+'.$keys[$i]+"='
                   _r += '$globals['+ns+'.$keys[$i]]='+ns+'.$values[$i]")\n};\n'
                }

                // insert globals and locals in the function
                _r += '\n    for(var $attr in $globals){eval("var "+$attr+"=$globals[$attr]")};\n'
                _r += '\n    for(var $attr in $locals){eval("var "+$attr+"=$locals[$attr]")};\n'

                // execute the Python code and return its result
                // the namespace built inside the function will be in
                // __BRYTHON__.scope[_name].__dict__
                _r += '    var $arg = '+arg+',$jscode;\n'
                _r += '    if($arg.__class__===__BRYTHON__.$CodeObjectDict)'
                _r += '{$jscode=$arg.src}\n'
                _r += '    else{$jscode = __BRYTHON__.py2js($arg,"'+_name+'").to_js()};\n'
                _r += '    if(__BRYTHON__.debug>1){console.log($jscode)};\n'
                _r += '    try{var $res = eval($jscode)}'
                _r += '    catch(err){if(err.name=="SyntaxError")'
                _r += '{console.log("Javascript syntax error in\\n"+$jscode)};'
                _r += ';throw err}\n;'

                if(ns=='globals'){
                  // copy the execution namespace in module and global namespace
                  _r += ';for(var $attr in __BRYTHON__.vars["'+_name+'"])'
                  _r += '{$globals[$attr]=__BRYTHON__.vars["'+module+'"][$attr]='
                  _r += '__BRYTHON__.vars["'+_name+'"][$attr]};'
                }else if(ns !=''){
                  // use specified namespace
                  _r += ';for(var $attr in __BRYTHON__.vars["'+_name+'"])'
                  _r += '{__BRYTHON__.builtins.dict.$dict.__setitem__('+ns+',$attr,'
                  _r += '__BRYTHON__.vars["'+_name+'"][$attr])};'         
                }else{
                  // namespace not specified copy the execution namespace in module namespace
                  _r += ';for(var $attr in __BRYTHON__.vars["'+_name+'"]){'
                  // check that $attr is a valid identifier
                  _r += '\nif($attr.search(/[\.]/)>-1){continue}\n'
                  _r += 'eval("var "+$attr+"='
                  _r += '$globals[$attr]='
                  _r += '__BRYTHON__.vars[\\"'+module+'\\"][$attr]='
                  _r += '__BRYTHON__.vars[\\"'+_name+'\\"][$attr]")};'
                }
                _r += '\n    if($res===undefined){return None};return $res'
                _r += '\n}\ncatch(err){throw __BRYTHON__.exception(err)}'
                _r += '})()\n'
            
                // the names defined inside the anonymous function must be visible outside
                // so we add a node after current one
                var new_node = new $Node()
                var set_ns = ';for(var $attr in __BRYTHON__.vars["'+_name+'"]){\n'
                // check that $attr is a valid identifier
                set_ns += '    if($attr.search(/[\.]/)>-1){continue}\n    '
                set_ns += 'eval("var "+$attr+"=__BRYTHON__.vars[\\"'+_name
                set_ns += '\\"][$attr]")\n};\n'
                new $NodeJSCtx(new_node, set_ns)
                var node = $get_node(this)
                // get rank of current node
                for(var i=0;i<node.parent.children.length;i++){
                   if(node===node.parent.children[i]){break}
                }
                node.parent.insert(i+1,new_node)

                return _r
              case 'classmethod':
                return 'classmethod($class,'+$to_js(this.tree)+')'
              case 'locals':
                var scope = $get_scope(this),mod = $get_module(this)
                if(scope !== null && (scope.ntype==='def'||scope.ntype=='generator')){
                   return 'locals("'+scope.context.tree[0].id+'","'+mod.module+'")'
                }
                break
              case 'globals':
                var module = $get_module(this).module
                //while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
                //var module = ctx_node.node.module
                if(module===undefined) console.log('module undef for '+ctx_node)
                return 'globals("'+module+'")'
              case 'dir':
                if(this.tree.length==0){
                   // dir() : pass arguments (null,module name)
                   var mod=$get_module(this)
                   return 'dir(null,"'+mod.module+'")'                
                }
                break
              case '$$super':
                if(this.tree.length==0){
                   // super() called with no argument : if inside a class, add the
                   // class parent as first argument
                   var scope = $get_scope(this)
                   if(scope.ntype=='def' || scope.ntype=='generator'){
                      if(scope.parent && scope.parent.context.tree[0].type=='class'){
                         new $IdCtx(this,scope.parent.context.tree[0].name)
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
                        return $to_js(this.tree)
                      case '-':
                        return 'getattr('+$to_js(this.tree)+',"__neg__")()'
                      case '~':
                        return 'getattr('+$to_js(this.tree)+',"__invert__")()'
                   }//switch
                }//if
            }//switch

            //console.log(this.func)
            //console.log(this.func.to_js())
            if(this.tree.length>-1){
              if (__BRYTHON__.$blocking_function_names) {
                 var _func_name=this.func.to_js()
                 if (_func_name.indexOf(__BRYTHON__.$blocking_function_names) > -1) {
                    console.log("candidate blocking function.. ", _func_name)
                    // since this is a candidate blocking function
                    // we need to take the rest of the program and put
                    // it inside the body of a function. We will then
                    // replace the rest of the program with something like
                    // var _hash=__BRYTHON__.builtins.id(func)
                    // var _blocktime=0
                    // if (_hash.indexOf(__BRYTHON__.$blocking_functions) > -1) {
                    //   // we have a match!  this is a blocking function.
                    //   _blocktime=5000   // 5 seconds..
                    // }
                    // window.setTimeout(myblockingfunction, block_time)

                    // at run time we check to see if the function in the
                    // program matches the hash of the blocking function
                    // we block, else, we execute the call back function
                    // immediately. 

                 }
              }
              if(this.func.type=='id'){
                  var $simple = true
                  for(var i=0;i<this.tree.length;i++){
                      if(this.tree[i].type=='id'){continue}
                      if(this.tree[i].tree[0].type!='expr'){$simple=false;break}
                  }
                  if($simple){
                      var res = '('+this.func.to_js()+'.$is_func ? '
                      res += this.func.to_js()+' : '
                      res += 'getattr('+this.func.to_js()+',"__call__"))('
                      res += (this.tree.length>0 ? $to_js(this.tree) : '')
                      res += ')'
                  }else{
                      var res = '('+this.func.to_js()+'.$is_func ? '
                      res += this.func.to_js()+' : '
                      res += 'getattr('+this.func.to_js()+',"__call__"))('
                      res += (this.tree.length>0 ? $to_js(this.tree) : '')
                      res += ')'
                  }
              }else{
                  var res = 'getattr('+this.func.to_js()+',"__call__")('
                  res += (this.tree.length>0 ? $to_js(this.tree) : '')
                  res += ')'              
              }
              return res
            }

            return 'getattr('+this.func.to_js()+',"__call__")()'
        }
    }
}

function $ClassCtx(context){
    this.type = 'class'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.toString = function(){return '(class) '+this.name+' '+this.tree+' args '+this.args}
    this.transform = function(node,rank){
        
        // for an unknown reason, code like
        //
        // for base in foo:
        //    class Int:
        //        A=9
        //
        // generates the class declaration twice. To avoid this we use
        // a flag this.transformed
        if(this.transformed) return
        // doc string
        this.doc_string = $get_docstring(node)

        // insert "$class = new Object"
        var instance_decl = new $Node()
        var js = 'var $class={}'
        if($B.debug>0){js = 'var $class = {$def_line:__BRYTHON__.line_info}'}
        new $NodeJSCtx(instance_decl,js)
        node.insert(0,instance_decl)

        // return $class at the end of class definition
        var ret_obj = new $Node()
        new $NodeJSCtx(ret_obj,'return $class')
        node.insert(node.children.length,ret_obj) 
       
        // close function and run it
        var run_func = new $Node()
        new $NodeJSCtx(run_func,')()')
        node.parent.insert(rank+1,run_func)

        // add doc string
        rank++
        js = '$'+this.name+'.__doc__='+(this.doc_string || 'None')
        var ds_node = new $Node()
        new $NodeJSCtx(ds_node,js)
        node.parent.insert(rank+1,ds_node)       

        // add __code__ 
        rank++
        // end with None for interactive interpreter
        js = '$'+this.name+'.__code__={__class__:__BRYTHON__.$CodeDict};None;'
        var ds_node = new $Node()
        new $NodeJSCtx(ds_node,js)
        node.parent.insert(rank+1,ds_node)       

        // add attribute __module__
        rank++
        js = '$'+this.name+'.__module__="'+$get_module(this).module+'"'
        var mod_node = new $Node()
        new $NodeJSCtx(mod_node,js)
        node.parent.insert(rank+1,mod_node)  

        // class constructor
        var scope = $get_scope(this)
        js = 'var '+this.name
        if(!(scope.ntype==="module"||scope.ntype!=='class')){
            js += ' = $class.'+this.name
        }
        js += '=__BRYTHON__.$class_constructor("'+this.name+'",$'+this.name
        if(this.args!==undefined){ // class def has arguments
            var arg_tree = this.args.tree,args=[],kw=[]

                for(var i=0;i<arg_tree.length;i++){
                    var _tmp=arg_tree[i]
                    if(_tmp.tree[0].type=='kwarg'){kw.push(_tmp.tree[0])}
                    else{args.push(_tmp.to_js())}
                }
                js += ',tuple(['+args.join(',')+']),['
                // add the names - needed to raise exception if a value is undefined
                var _re=new RegExp('"','g')
                for(var i=0;i<args.length;i++){
                    js += '"'+args[i].replace(_re,'\\"')+'"'
                    if(i<args.length-1){js += ','}
                }
                js += ']'

                js+=',['
                for(var i=0;i<kw.length;i++){
                    var _tmp=kw[i]
                    js+='["'+_tmp.tree[0].value+'",'+_tmp.tree[1].to_js()+']'
                    if(i<kw.length-1){js+=','}
                }
                js+=']'

        }else{ // form "class foo:"
            js += ',tuple([]),[],[]'
        }
        js += ')'
        var cl_cons = new $Node()
        new $NodeJSCtx(cl_cons,js)
        node.parent.insert(rank+2,cl_cons)
        
        // if class is defined at module level, add to module namespace
        if(scope.ntype==='module'){
            js = '__BRYTHON__.vars["'+scope.module+'"]["'
            js += this.name+'"]='+this.name
            var w_decl = new $Node()
            new $NodeJSCtx(w_decl,js)
            node.parent.insert(rank+3,w_decl)
            rank++
        }
        // end by None for interactive interpreter
        var end_node = new $Node()
        new $NodeJSCtx(end_node,'None;')
        node.parent.insert(rank+3,end_node)
        
        // add to names bound in current scope
        scope.bound = scope.bound || []
        if(scope.bound.indexOf(this.name)==-1){scope.bound.push(this.name)}

        this.transformed = true
    }
    this.to_js = function(){return 'var $'+this.name+'=(function()'}
}

function $CompIfCtx(context){
    this.type = 'comp_if'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comp if) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ComprehensionCtx(context){
    this.type = 'comprehension'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comprehension) '+this.tree}
    this.to_js = function(){
        var _i = []  //intervals
        for(var j=0;j<this.tree.length;j++) _i.push(this.tree[j].start)
        return _i
    }
}

function $CompForCtx(context){
    this.type = 'comp_for'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    this.expect = 'in'
    context.tree.push(this)
    this.toString = function(){return '(comp for) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $CompIterableCtx(context){
    this.type = 'comp_iterable'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comp iter) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ConditionCtx(context,token){
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    if(token==='while'){this.loop_num=$loop_num;$loop_num++}
    context.tree.push(this)
    this.toString = function(){return this.token+' '+this.tree}
    this.transform = function(node,rank){
        if(this.token=="while"){
            var scope = $get_scope(this)
            if(scope.ntype=='BRgenerator'){
                this.parent.node.loop_start = this.loop_num
            }
            var new_node = new $Node()
            var js = 'var $no_break'+this.loop_num+'=$locals["$no_break'
            js += this.loop_num+'"]=true'
            new $NodeJSCtx(new_node,js)
            node.parent.insert(rank, new_node)
            // because a node was inserted, return 2 to avoid infinite loop
            return 2
        }
    }
    this.to_js = function(){
        var tok = this.token
        if(tok==='elif'){tok='else if'}
        // In a "while" loop, the flag "$no_break" is initially set to false.
        // If the loop exits with a "break" this flag will be set to "true",
        // so that an optional "else" clause will not be run.
        var res = tok+'(bool('
        if(tok=='while'){res += '$no_break'+this.loop_num+' && '}
        if(this.tree.length==1){
            res += $to_js(this.tree)+'))'
        }else{ // syntax "if cond : do_something" in the same line
            res += this.tree[0].to_js()+'))'
            if(this.tree[1].tree.length>0){
                res += '{'+this.tree[1].to_js()+'}'
            }
        }
        return res
    }
}

function $DecoratorCtx(context){
    this.type = 'decorator'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.toString = function(){return '(decorator) '+this.tree}
    this.transform = function(node,rank){
        var func_rank=rank+1,children=node.parent.children
        var decorators = [this.tree]
        while(1){
            if(func_rank>=children.length){$_SyntaxError(context)}
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
        //      def x(self):
        //          return self._x
        //      x = $vth93h6g(x)
        //    
        //      $h3upb5s8 = x.setter
        //      def x(self, value):
        //          self._x = value
        //      x = $h3upb5s8(x)
        //
        this.dec_ids = []
        for(var i=0;i<decorators.length;i++){
            this.dec_ids.push('$'+Math.random().toString(36).substr(2,8))
        }
        var obj = children[func_rank].context.tree[0]
        // add a line after decorated element
        var callable = children[func_rank].context
        var res = obj.name+'=',tail=''
        var scope = $get_scope(this)
        if(scope !==null && scope.ntype==='class'){
            res = '$class.'+obj.name+'='
        }
        var _blocking_flag=false;
        for(var i=0;i<decorators.length;i++){
            //if (decorators[i][0].tree[0].value == 'blocking') {
            //  _blocking_flag=true;
            //} else {
              var dec = this.dec_ids[i] //$to_js(decorators[i]);
              res += dec+'('
              if (decorators[i][0].tree[0].value == 'classmethod') {res+= '$class,'}
              tail +=')'
            //}
        }
        res += (scope.ntype ==='class' ? '$class.' : '')
        res += obj.name+tail
        /*
        $B.after_func = $B.after_func || []
        var rest_node = new $Node('module')
        var rest = children.slice(func_rank+1)
        for(var i=0;i<rest.length;i++){rest_node.add(rest[i])}
        $B.after_func[obj.id] = rest_node
        */

        if (_blocking_flag == true) {
           $B.$blocking_function_names=$B.$blocking_function_names || []
           $B.$blocking_function_names.push(obj.name)
           //res='// should block here...\n\n' + res
           console.log('blocking...', obj.name)
           // the statement below doesn't work..  can I get some help?
           // the code below is a 99% guess (just looking at other functions,
           // and trying to figure out what needs to happen here...
           //console.log('node.parent', node.parent)
           //node.parent.insert(0, new $BlockingCtx(node));
           //void(0);
           obj.$blocking = true
        }

        var decor_node = new $Node()
        new $NodeJSCtx(decor_node,res)
        node.parent.insert(func_rank+1,decor_node)
        this.decorators = decorators
    }
    this.to_js = function(){
        var res = ''
        for(var i=0;i<this.decorators.length;i++){
            res += 'var '+this.dec_ids[i]+'='+$to_js(this.decorators[i])+';'
        }
        return res
    }
}
function $DefCtx(context){
    this.type = 'def'
    this.name = null
    this.parent = context
    this.tree = []

    this.locals = []
    this.yields = [] // list of nodes with "yield"
    context.tree.push(this)

    // store id of enclosing functions
    this.enclosing = []
    var scope = this.scope = $get_scope(this)
    while(1){
        if(scope.is_function){
            this.enclosing.push(scope.context.tree[0].id)
            scope = $get_scope(scope.context.tree[0])
        }else{break}
    }

    this.set_name = function(name){
        this.name = name
        this.id = context.node.module+'-'+name+'-'
        this.id += Math.random().toString(36).substr(2,8)
        $B.vars[this.id] = {}
        // if function is defined inside another function, add the name
        // to local names
        this.scope.bound = this.scope.bound || []
        if(this.scope.bound.indexOf(name)==-1){this.scope.bound.push(name)}
        if(scope.is_function){
            if(scope.context.tree[0].locals.indexOf(name)==-1){
                scope.context.tree[0].locals.push(name)
            }
        }
    }
    
    this.toString = function(){return 'def '+this.name+'('+this.tree+')'}
    this.transform = function(node,rank){
        // already transformed ?defs
        if(this.transformed!==undefined) return
        // search doc string
        this.doc_string = $get_docstring(node)
        this.rank = rank // save rank if we must add generator declaration

        // list of names declared as "global"      
        var fglobs = this.parent.node.globals
        
        // block indentation
        var indent = node.indent+16
        var header = $ws(indent)
        
        // if function inside a class, the first argument represents
        // the instance
        var scope = $get_scope(this)
        var required = '', required_list=[]
        var defaults = [],defs=[],defs1=[]
        var after_star = []
        var other_args = null
        var other_kw = null
        this.args = []
        for(var i=0;i<this.tree[0].tree.length;i++){
            var arg = this.tree[0].tree[i]
            if(arg.type==='func_arg_id'){
                if(arg.tree.length===0){
                    if(other_args==null){
                        required+='"'+arg.name+'",'
                        required_list.push(arg.name)
                    }else{
                        after_star.push('"'+arg.name+'"')
                    }
                }else{
                    defaults.push('"'+arg.name+'"')
                    defs.push(arg.name+' = '+$to_js(arg.tree))
                    defs1.push(arg.name+':'+$to_js(arg.tree))
                }
            }else if(arg.type==='func_star_arg'&&arg.op==='*'){other_args='"'+arg.name+'"'}
            else if(arg.type==='func_star_arg'&&arg.op==='**'){other_kw='"'+arg.name+'"'}
            this.args.push(arg.name)
        }
        this.defs = defs
        if(required.length>0) required=required.substr(0,required.length-1)
        //if(defaults.length>0){defaults=defaults.substr(0,defaults.length-1)}

        var nodes=[], js

        // add lines of code to node children
        
        // insert global variables
        var mod_name = $get_module(this).module
        if(this.type=='def' && scope.ntype!='BRgenerator' && mod_name!=='__main__'){
            if(mod_name!=='__main__'){
                // $globals must be reset at each function execution : if it
                // is in an imported module A, the importing module might have
                // changed attributes of A
                var new_node = new $Node()
                var js = '$globals = __BRYTHON__.vars["'+mod_name+'"];' 
                new $NodeJSCtx(new_node,js)
                nodes.push(new_node)
            }
            
            if(fglobs===undefined){
                js = 'for(var $attr in $globals){eval("var "+$attr+"=$globals[$attr]")}'
            }else{
                // If the function has global variables, they must be evaluated
                // without "var"
                js = '\n'+header+'var $fglobs = ['
                for(var i=0;i<fglobs.length;i++){js+='"'+fglobs[i]+'",'}
                js += '];\n'+header
                js += 'for(var $attr in $globals){\n'+header
                js += '    if($fglobs.indexOf($attr)==-1)'
                js += '{eval("var "+$attr+"=$globals[$attr]")}'
                js += 'else{eval($attr+"=$globals[$attr]")}\n'+header+'}'
            }
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            nodes.push(new_node)
        }
        
        // declare object holding local variables
        if(this.type=='def'){
            // for functions, use the same namespace for all function calls
            js = 'var $locals = __BRYTHON__.vars["'+this.id+'"]=new Object();'
        }else{
            // for generators, a specific namespace will be created for each
            // call, ie for each iterator
            js = 'var $locals = __BRYTHON__.vars["'+this.id+'"];'
        }
        var new_node = new $Node()
        new_node.locals_def = true
        new $NodeJSCtx(new_node,js)
        nodes.push(new_node)

        // variable "$globals" might be needed in generators
        if(this.type=='BRgenerator'){
            js = 'var $globals = __BRYTHON__.vars["'+mod_name+'"]'
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            nodes.push(new_node)
        }
           
        // initialize default variables, if provided
        if(defs1.length>0){
            js = 'for(var $var in $defaults){eval("var "+$var+"=$locals[$var]=$defaults[$var]")}'
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            nodes.push(new_node)
        }

        for(var i=this.enclosing.length-1;i>=0;i--){
            var js = 'var $ns=__BRYTHON__.vars["'+this.enclosing[i]+'"]'
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            nodes.push(new_node)

            var js = 'for(var $var in $ns){$locals[$var]=$ns[$var]}'
            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            nodes.push(new_node)
        }

        var make_args_nodes = []
        var js = 'var $ns=__BRYTHON__.$MakeArgs("'+this.name+'",arguments,new Array('+required+'),'
        js += 'new Array('+defaults.join(',')+'),'+other_args+','+other_kw+
            ',new Array('+after_star.join(',')+'))'
        var new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        make_args_nodes.push(new_node)

        js = 'for(var $var in $ns){eval("var "+$var+"=$ns[$var]");'
        js += '$locals[$var]=$ns[$var]}'
        var new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        make_args_nodes.push(new_node)
        
        var only_positional = false
        if(defaults.length==0 && other_args===null && other_kw===null &&
            after_star.length==0){
            // If function only takes positional arguments, we can generate
            // a faster version of argument parsing than by calling function
            // $MakeArgs
            only_positional = true
            
            // Loop to test if all the arguments passed to the function
            // are "simple", ie not a keyword argument (x=0) or a packed
            // tuple (*x) or a packed dictionary (**x)
            
            if(__BRYTHON__.debug>0 || required_list.length>0){
                
                var js = 'var $simple=true;for(var i=0;i<arguments.length;i++)'
                js += '{if(arguments[i].$nat!=undefined){$simple=false;break}}'
                var new_node = new $Node()
                new $NodeJSCtx(new_node,js)
                nodes.push(new_node)
                
                var new_node = new $Node()
                new $NodeJSCtx(new_node,'if(!$simple)')
                nodes.push(new_node)
                
                // If at least one argument is not "simple", fall back to 
                // $MakeArgs()
                new_node.add(make_args_nodes[0])
                new_node.add(make_args_nodes[1])
            
                var else_node = new $Node()
                new $NodeJSCtx(else_node,'else')
                nodes.push(else_node)
            }
            
            if(__BRYTHON__.debug>0){
                // If all arguments are "simple" all there is to check is that
                // we got the right number of arguments

                js = 'if(arguments.length!='+required_list.length+')'
                var wrong_nb_node = new $Node()
                new $NodeJSCtx(wrong_nb_node,js)
                else_node.add(wrong_nb_node)
                
                if(required_list.length>0){
                    // Test if missing arguments
                    
                    js = 'if(arguments.length<'+required_list.length+')'
                    js += '{var $missing='+required_list.length+'-arguments.length;'
                    js += 'throw TypeError("'+this.name+'() missing "+$missing+'
                    js += '" positional argument"+($missing>1 ? "s" : "")+": "'
                    js += '+new Array('+required+').slice(arguments.length))}'
                    new_node = new $Node()
                    new $NodeJSCtx(new_node,js)
                    wrong_nb_node.add(new_node)
                
                    js = 'else if'
                }else{
                    js = 'if'
                }
    
                // Test if too many arguments
                js += '(arguments.length>'+required_list.length+')'
                js += '{throw TypeError("'+this.name+'() takes '+required_list.length
                js += ' positional argument'
                js += (required_list.length>1 ? "s" : "")
                js += ' but more were given")}'
                new_node = new $Node()
                new $NodeJSCtx(new_node,js)
                wrong_nb_node.add(new_node)
            }
            
            for(var i=0;i<required_list.length;i++){
                var arg = required_list[i]
                var new_node = new $Node()
                var js = 'var '+arg+'=$locals["'+arg+'"]=__BRYTHON__.$JS2Py(arguments['+i+'])'
                new $NodeJSCtx(new_node,js)
                else_node.add(new_node)
            }

        }else{

            nodes = nodes.concat(make_args_nodes)

        }

        for(var i=nodes.length-1;i>=0;i--) node.children.splice(0,0,nodes[i])

        var def_func_node = new $Node()
        new $NodeJSCtx(def_func_node,'return function()')

        for(var i=0;i<node.children.length;i++) def_func_node.add(node.children[i])

        var last_instr = node.children[node.children.length-1].context.tree[0]
        if(last_instr.type!=='return' && this.type!='BRgenerator'){
            new_node = new $Node()
            new $NodeJSCtx(new_node,'return None;')
            def_func_node.add(new_node)
        }

        node.children = []
        
        node.add(def_func_node)

        var ret_node = new $Node()
        var txt = ')('
        new $NodeJSCtx(ret_node,txt+')')
        node.parent.insert(rank+1,ret_node)
        
        var offset = 2
        
        // If function is a generator, add a line to build the generator
        // function, based on the original function
        if(this.type==='BRgenerator' && !this.declared){
          js = '__BRYTHON__.$BRgenerator('
          if(scope.ntype==='class') js += '$class.'
          js += '$'+this.name+',"'+this.id+'"'
          if(scope.ntype=='class') js += ',$class'
          js += ')'
          // store a reference to function node, will be used in yield
          $B.modules[this.id] = this
          var gen_node = new $Node()
          var ctx = new $NodeCtx(gen_node)
          var expr = new $ExprCtx(ctx,'id',false)
          var name_ctx = new $IdCtx(expr,this.name)
          var assign = new $AssignCtx(expr)
          var expr1 = new $ExprCtx(assign,'id',false)
          var js_ctx = new $NodeJSCtx(assign,js)
          expr1.tree.push(js_ctx)
          node.parent.insert(rank+offset,gen_node) 
          this.declared = true
          offset++
        }
        
        // add function name
        js = ''
        if(scope.ntype==='class') js = '$class.'
        js += this.name+'.__name__="'+this.name+'"'
        if(scope.is_function){
          // add to $locals
          js += ';$locals["'+this.name+'"]='+this.name
        }
        var name_decl = new $Node()
        new $NodeJSCtx(name_decl,js)
        node.parent.insert(rank+offset,name_decl)
        offset++

        // if function is defined at module level, add to module scope
        if(scope.ntype==='module'){
          js = '$globals["'+this.name+'"]='+this.name
          js += ';'+this.name+".$type='function';"+this.name+'.$is_func=true;'
          new_node = new $Node()
          new $NodeJSCtx(new_node,js)
          node.parent.insert(rank+offset,new_node)
          offset++
        }
        // add attribute __module__
        var module = $get_module(this)
        var prefix = scope.ntype=='class' ? '$class.' : ''
        
        js = prefix+this.name+'.__module__ = "'+module.module+'";'
        new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        node.parent.insert(rank+offset,new_node)
        offset++
        
        // if doc string, add it as attribute __doc__
        js = prefix+this.name+'.__doc__='+(this.doc_string || 'None')+';'
        new_node = new $Node()
        new $NodeJSCtx(new_node,js)
        node.parent.insert(rank+offset,new_node)
        offset++
        
        if(this.$blocking){
            console.log('blocking !!!')
            new_node = new $Node()
            new $NodeJSCtx(new_node,this.name+'.$blocking = true; // used in __call__')
            node.parent.insert(rank+offset,new_node)
            offset++
        }

        // add attribute __code__
        // end with None for interactive interpreter
        js = prefix+this.name+'.__code__={__class__:__BRYTHON__.$CodeDict};None;'
        new_node = new $Node()
        new $NodeJSCtx(new_node,js)

        // define default values
        var default_node = new $Node()
        var js = 'None'
        if(defs1.length>0){js = 'var $defaults = {'+defs1.join(',')+'}'}
        new $NodeJSCtx(default_node,js)
        node.insert(0,default_node)

        this.transformed = true
    }
    this.add_generator_declaration = function(){
        // if generator, add line 'foo = __BRYTHON__.$generator($foo)'
        var scope = $get_scope(this)
        var node = this.parent.node
        if(this.type==='generator' && !this.declared){
          var offset = 2
          if(this.decorators !== undefined) offset++
          js = '__BRYTHON__.$generator('
          if(scope.ntype==='class') js += '$class.'
          js += '$'+this.name+')'
          var gen_node = new $Node()
          var ctx = new $NodeCtx(gen_node)
          var expr = new $ExprCtx(ctx,'id',false)
          var name_ctx = new $IdCtx(expr,this.name)
          var assign = new $AssignCtx(expr)
          var expr1 = new $ExprCtx(assign,'id',false)
          var js_ctx = new $NodeJSCtx(assign,js)
          expr1.tree.push(js_ctx)
          node.parent.insert(this.rank+offset,gen_node) 
          this.declared = true
        }
    }

    this.to_js = function(){
        var scope = $get_scope(this)
        var name = this.name
        var res
        if(this.type==='generator'||this.type==='BRgenerator') name='$'+name
        if(scope.ntype==="module" || scope.ntype!=='class'){
            res = 'var '+name+'=(function('
        }else{
            res = '$class.'+name+'=(function('
        }
        //for(var i=0;i<this.env.length;i++){
        //    res+=this.env[i]
        //    if(i<this.env.length-1) res+=','
        //}
        //res += this.env.join(',')
        return res + ')'
    }
}

function $DelCtx(context){
    this.type = 'del'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.toString = function(){return 'del '+this.tree}
    this.to_js = function(){
        if(this.tree[0].type=='list_or_tuple'){
            var res = ''
            for(var i=0;i<this.tree[0].tree.length;i++){
                var subdel = new $DelCtx(context) // this adds an element to context.tree
                subdel.tree = [this.tree[0].tree[i]]
                res += subdel.to_js()+';'
                context.tree.pop() // remove the element from context.tree
            }
            this.tree = []
            return res
        }else{
            var expr = this.tree[0].tree[0]
            var scope = $get_scope(this)
            
            function del_name(scope,name){
                var js = 'delete '+name+';'
                // remove name from dictionaries
                if(scope.ntype==='module'){
                    js+='delete $globals["'+name+'"]'
                }else if(scope.is_function){
                    if(scope.globals && scope.globals.indexOf(name)>-1){
                        // global variable
                        js+='delete $globals["'+name+'"]'
                    }else{ // local variable
                        js+='delete $locals["'+name+'"]'
                    }
                }
                return js+';'
            }
            switch(expr.type) {
              case 'id':
                return del_name(scope,expr.to_js())
              case 'list_or_tuple':
                var res = ''
                for(var i=0;i<expr.tree.length;i++){
                    res += del_name(expr.tree[i].to_js())
                }
                return res
              case 'sub':
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
    // the real type (dist or set) is set inside $transition
    // as attribute 'real'
    this.type = 'dict_or_set'
    this.real = 'dict_or_set'
    this.expect = 'id'
    this.closed = false
    this.start = $pos
    this.toString = function(){
        switch(this.real) {
          case 'dict':
            return '(dict) {'+this.items+'}'
          case 'set':
            return '(set) {'+this.tree+'}'
        }
        return '(dict_or_set) {'+this.tree+'}'
    }
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){
        switch(this.real) {
          case 'dict':
            var res = '__BRYTHON__.$dict(['
            for(var i=0;i<this.items.length;i+=2){
                res+='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'
                if(i<this.items.length-2){res+=','}
            }
            return res+'])'+$to_js(this.tree)
          case 'set_comp':
            return 'set('+$to_js(this.items)+')'+$to_js(this.tree)
          case 'dict_comp':
            var key_items = this.items[0].expression[0].to_js()
            var value_items = this.items[0].expression[1].to_js()
            return '__BRYTHON__.$dict('+$to_js(this.items)+')'+$to_js(this.tree)
        }
        return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)
    }
}

function $DoubleStarArgCtx(context){
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '**'+this.tree}
    this.to_js = function(){return '{$nat:"pdict",arg:'+$to_js(this.tree)+'}'}
}

function $ExceptCtx(context){
    this.type = 'except'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.expect = 'id'
    this.toString = function(){return '(except) '}
    this.to_js = function(){
        // in method "transform" of $TryCtx instances, related
        // $ExceptCtx instances receive an attribute __name__
        if(this.tree.length===0) return 'else'
        if(this.tree.length===1 && this.tree[0].name==='Exception') return 'else if(1)'
        
        var res ='else if(__BRYTHON__.is_exc('+this.error_name+',['
        for(var i=0;i<this.tree.length;i++){
            res+=this.tree[i].to_js()
            if(i<this.tree.length-1) res+=','
        }
        return res + ']))'
    }
}

function $ExprCtx(context,name,with_commas){
    this.type = 'expr'
    this.name = name
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.expect = ',' // can be 'expr' or ','
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(expr '+with_commas+') '+this.tree}
    this.to_js = function(arg){
        if(this.type==='list') return '['+$to_js(this.tree)+']'
        if(this.tree.length===1) return this.tree[0].to_js(arg)
        return 'tuple('+$to_js(this.tree)+')'
    }
}

function $ExprNot(context){ // used for 'x not', only accepts 'in' as next token
    this.type = 'expr_not'
    this.toString = function(){return '(expr_not)'}
    this.parent = context
    this.tree = []
    context.tree.push(this)
}

function $FloatCtx(context,value){
    this.type = 'float'
    this.value = value
    this.toString = function(){return 'float '+this.value}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'float('+this.value+')'}
}

function $ForTarget(context){
    this.type = 'for_target'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return 'for_target'+' '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ForExpr(context){
    this.type = 'for'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.loop_num = $loop_num
    $loop_num++
    
    this.toString = function(){return '(for) '+this.tree}
    
    this.transform = function(node,rank){
        
        var scope = $get_scope(this)
        
        var target = this.tree[0]
        var iterable = this.tree[1]
        var num = this.loop_num

        var $range = false
        if(iterable.type=='expr' &&
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
        var new_nodes = []
        
        // save original children (loop body)
        var children = node.children

        var offset = 1
        
        if($range && scope.ntype!='BRgenerator'){
        
            if(this.has_break){
                // If there is a "break" in the loop, add a boolean
                // used if there is an "else" clause and in generators
                new_node = new $Node()
                var js = 'var $no_break'+num
                js += '=$globals["$no_break'+num+'"]=true'
                new $NodeJSCtx(new_node,js)
                new_nodes.push(new_node)
            }
            
            // Line to test if the callable "range" is the built-in "range"
            var test_range_node = new $Node()
            new $NodeJSCtx(test_range_node,'if(range===__BRYTHON__.builtins.range)')
            new_nodes.push(test_range_node)
            
            // build the block with the Javascript "for" loop
            var idt = target.to_js()
            if($range.tree.length==1){
                var start=0,stop=$range.tree[0].to_js()
            }else{
                var start=$range.tree[0].to_js(),stop=$range.tree[1].to_js()
            }
            var js = 'for(var '+idt+'='+start
            js += ';'+idt+'<('+stop+');'+idt+'++)'
            var for_node = new $Node()
            new $NodeJSCtx(for_node,js)

            // In the loop, set the global or local variable produced by iteration            
            var idt_node = new $Node()
            if(scope.ntype=='module'){js = '$globals'}
            else{js='$locals'}
            new $NodeJSCtx(idt_node,js+'["'+idt+'"]='+idt+';')
            for_node.add(idt_node)

            // Add the loop body            
            for(var i=0;i<children.length;i++){
                for_node.add(children[i].clone())
            }

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
                js = 'function $f'+num+'($globals'
                if(this.has_break){js += ',$no_break'+num}
                js += ')'
                new $NodeJSCtx(func_node,js)
                
                // the function is added to the test_range_node
                test_range_node.add(func_node)

                // Start the function body by importing all global names    
                var globals_node = new $Node()
                var js = 'for(var $var in $globals)'
                js += '{eval($var+"=$globals[$var]")}'
                new $NodeJSCtx(globals_node,js)
                func_node.add(globals_node)
                
                // Add the "for" loop
                func_node.add(for_node)
                
                // Add a line to return values from the function
                var ret_node = new $Node()
                if(this.has_break){
                    js = 'return [$globals, $no_break'+num+']'
                }else{
                    js = 'return [$globals]'            
                }
                new $NodeJSCtx(ret_node,js)
                func_node.add(ret_node)

                // Line to call the function        
                var end_func_node = new $Node()
                new $NodeJSCtx(end_func_node,
                    'var $res'+num+'=$f'+num+'($globals)')
                test_range_node.add(end_func_node)
                
                // Line to reset global variables : they may have been modified
                // in the loop
                var reset_globals = new $Node()
                js = 'for(var $g'+num+' in $res'+num+'[0])' 
                js += '{eval($g'+num+'+"=$res'+num+'[0][$g'+num+']")}'
                new $NodeJSCtx(reset_globals,js)
                test_range_node.add(reset_globals)

                if(this.has_break){
                    var no_break = new $Node()
                    new $NodeJSCtx(no_break,'$no_break'+num+'=$res'+num+'[1]')
                    test_range_node.add(no_break)
                }


            }else{
            
                // If the loop is already inside a function, don't
                // wrap it
                test_range_node.add(for_node)
            }

            // Add code in case the callable "range" is *not* the
            // built-in function
            var else_node = new $Node()
            new $NodeJSCtx(else_node,'else')
            new_nodes.push(else_node)
            

            // Add lines at module level, after the original "for" loop                    
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank+1,new_nodes[i])
            }
            this.test_range = true
            new_nodes = []

        }

        // Line to declare the function that produces the next item from
        // the iterable
        var new_node = new $Node()
        var js = 'var $next'+num+'=$locals["$next'+num+'"]'
        js += '=getattr(iter('+iterable.to_js()+'),"__next__")\n'
        
        new $NodeJSCtx(new_node,js)
        new_nodes.push(new_node)

        if(this.has_break){
            // If there is a "break" in the loop, add a boolean
            // used if there is an "else" clause and in generators
            new_node = new $Node()
            var js = 'var $no_break'+num
            js += '=$globals["$no_break'+num+'"]=true'
            new $NodeJSCtx(new_node,js)
            new_nodes.push(new_node)
        }

        var while_node = new $Node()
        if(this.has_break){js = 'while($no_break'+num+')'}
        else{js='while(true)'}
        new $NodeJSCtx(while_node,js)
        while_node.context.loop_num = num // used for "else" clauses
        if(scope.ntype=='BRgenerator'){
            // used in generators to signal a loop start
            while_node.loop_start = num
        }
        
        new_nodes.push(while_node)
        
        // save original node children (loop body)
        //console.log('remove '+node.context)
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
        var try_node = new $Node()
        new $NodeJSCtx(try_node,'try')
        while_node.add(try_node)

        var iter_node = new $Node()
        var context = new $NodeCtx(iter_node) // create ordinary node
        var target_expr = new $ExprCtx(context,'left',true)
        target_expr.tree = target.tree
        var assign = new $AssignCtx(target_expr) // assignment to left operand
        assign.tree[1] = new $JSCode('$next'+num+'()')
        try_node.add(iter_node)

        var catch_node = new $Node()

        var js = 'catch($err){if(__BRYTHON__.is_exc($err,[StopIteration]))'
        js += '{__BRYTHON__.$pop_exc();break}'
        js += 'else{throw($err)}}'        

        new $NodeJSCtx(catch_node,js)
        while_node.add(catch_node)
        
        // set new loop children
        for(var i=0;i<children.length;i++){
            while_node.add(children[i].clone())
        }
                    
        //console.log(node.parent.show())

        node.children = []
        return 0
        //while_node.transform()
        //node.parent.children[new_rank].children = children
        //$loop_num++
    }
    this.to_js = function(){
        var iterable = this.tree.pop()
        return 'for '+$to_js(this.tree)+' in '+iterable.to_js()
    }
}

function $FromCtx(context){
    this.type = 'from'
    this.parent = context
    this.module = ''
    this.names = []
    this.aliases = {}
    context.tree.push(this)
    this.expect = 'module'
    this.toString = function(){
        var res = '(from) '+this.module+' (import) '+this.names 
        return res + '(as)' + this.aliases
    }
    
    this.to_js = function(){
        var scope = $get_scope(this)
        var mod = $get_module(this).module
        if(mod.substr(0,13)==='__main__,exec'){mod='__main__'}
        var path = $B.$py_module_path[mod]
        var elts = path.split('/')
        elts.pop()
        path =elts.join('/')
        // temporarily add module path to __BRYTHON__.path
        var res = ''
        var indent = $get_node(this).indent
        //var head = ''
        //for(var i=0;i<indent;i++){head += ' '}
        var head= ' '.repeat(indent)

        if (this.module.charAt(0)=='.'){
            // intra-package reference : "from . import x" or 'from .X import Y'
            // get the name of current module
            var parent_module = $get_module(this).module
            var package = $B.imported[parent_module].__package__
            
            var nbdots = 1
            while(nbdots<this.module.length && 
                this.module.charAt(nbdots)=='.'){nbdots++}

            var p_elts = package.split('.')
            while(nbdots>1){p_elts.pop();nbdots--}
            package = p_elts.join('.')
                
            if(nbdots==this.module.length){
                // form 'from . import X' : search module package.X
                for(var i=0;i<this.names.length;i++){
                    var mod_name = this.names[i]
                    if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
                    var qname = package+'.'+mod_name
                    res += '__BRYTHON__.$import("'+qname+'","'+parent_module+'");'
                    var _sn=scope.ntype
                    if('def' == _sn || 'class' == _sn || 'module' == _sn) {
                    //if(['def','class','module'].indexOf(scope.ntype)>-1){
                        res += 'var '
                    }
                    var alias = this.aliases[this.names[i]]||this.names[i]
                    res += alias
                    if(scope.ntype == 'def'){
                        res += '=$locals["'+alias+'"]'
                    }else if(scope.ntype=='module'){
                        res += '=$globals["'+alias+'"]'
                    }
                    res += '=__BRYTHON__.imported["'+qname+'"];\n'
                }
            }else{
                var mod_name = this.module.substr(nbdots)
                if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
                var qname = package+'.'+mod_name
    
                res +='__BRYTHON__.$import("'+qname+'","'+parent_module+'");'
                res += 'var $mod=__BRYTHON__.imported["'+qname+'"];'
                
                if(this.names[0]=='*'){
                    res += head+'for(var $attr in $mod){\n'
                 res +="if($attr.substr(0,1)!=='_')\n"+head+"{var $x = 'var '+$attr+'"
                  if(scope.ntype==="module"){
                      res += '=__BRYTHON__.vars["'+scope.module+'"]["'+"'+$attr+'"+'"]'
                  }
                 res += '=$mod["'+"'+$attr+'"+'"]'+"'"+'\n'+head+'eval($x)}}'

                }else{
    
                    //this is longer, but should execute more efficiently
                    switch(scope.ntype) { 
                      case 'def':
                        for(var i=0; i<this.names.length; i++) {
                           var alias = this.aliases[this.names[i]]||this.names[i]
                           res+='var ' + alias + '=$locals["'+alias+'"]'
                           res += '=getattr($mod,"'+this.names[i]+'")\n'
                        }
                        break
                      case 'class':
                        for(var i=0; i<this.names.length; i++) {
                           var name=this.names[i]
                           var alias = this.aliases[name]|| name
                           res+='var ' + alias
                           res += '=getattr($mod,"'+ name +'")\n'
                        }
                        break
                      case 'module':
                        for(var i=0; i<this.names.length; i++) {
                           var name=this.names[i]
                           var alias = this.aliases[name]|| name
                           res+='var ' + alias + '=$globals["'+alias+'"]'
                           res += '=getattr($mod,"'+ name +'")\n'
                        }
                        break
                      default:
                        for(var i=0; i<this.names.length; i++) {
                           var name=this.names[i]
                           var alias = this.aliases[name]|| name
                           res += alias + '=getattr($mod,"'+ names +'")\n'
                        }
                    }
                }
            }
        }else{
           if(this.names[0]=='*'){
             res += '__BRYTHON__.$import("'+this.module+'","'+mod+'")\n'
             res += head+'var $mod=__BRYTHON__.imported["'+this.module+'"]\n'
             res += head+'for(var $attr in $mod){\n'
             res +="if($attr.substr(0,1)!=='_')\n"+head+"{var $x = 'var '+$attr+'"
              if(scope.ntype==="module"){
                  res += '=__BRYTHON__.vars["'+scope.module+'"]["'+"'+$attr+'"+'"]'
              }
             res += '=$mod["'+"'+$attr+'"+'"]'+"'"+'\n'+head+'eval($x)}}'
           }else{
             res += '__BRYTHON__.$import_from("'+this.module+'",['
             //for(var i=0;i<this.names.length;i++){
             //    res += '"'+this.names[i]+'",'
             //}
             res += '"' + this.names.join('","') + '"'
             res += '],"'+mod+'");\n'
             var _is_module=scope.ntype === 'module'
             for(var i=0;i<this.names.length;i++){
                var name=this.names[i]
                var alias = this.aliases[name]||name

                res += head+'try{var '+ alias
                //if(scope.ntype==="module"){
                if(_is_module) res += '=$globals["' + alias + '"]'

                res += '=getattr(__BRYTHON__.imported["'+this.module+'"],"'+name+'")}\n'
                res += 'catch($err'+$loop_num+'){if($err'+$loop_num+'.__class__'
                res += '===__BRYTHON__.builtins.AttributeError.$dict){$err'+$loop_num+'.__class__'
                res += '=__BRYTHON__.builtins.ImportError.$dict};throw $err'+$loop_num+'};'
             }
           }
        }
        return res + '\n'+head+'None;'
    }
}

function $FuncArgs(context){
    this.type = 'func_args'
    this.parent = context
    this.tree = []
    this.names = []
    context.tree.push(this)
    this.toString = function(){return 'func args '+this.tree}
    this.expect = 'id'
    this.has_default = false
    this.has_star_arg = false
    this.has_kw_arg = false
    this.to_js = function(){return $to_js(this.tree)}
}

function $FuncArgIdCtx(context,name){
    // id in function arguments
    // may be followed by = for default value
    this.type = 'func_arg_id'
    this.name = name
    this.parent = context
    this.parent.names.push(name)
    this.tree = []
    context.tree.push(this)
    // add to locals of function
    var ctx = context
    while(ctx.parent!==undefined){
        if(ctx.type==='def'){
            ctx.locals.push(name)
            break
        }
        ctx = ctx.parent
    }    
    this.toString = function(){return 'func arg id '+this.name +'='+this.tree}
    this.expect = '='
    this.to_js = function(){return this.name+$to_js(this.tree)}
}

function $FuncStarArgCtx(context,op){
    this.type = 'func_star_arg'
    this.op = op
    this.parent = context
    if(op=='*'){context.has_star_arg=true}
    else if(op=='**'){context.has_kw_arg=true}
    context.tree.push(this)
    this.set_name = function(name){
        this.name = name
        if(name=='$dummy'){return}
        // add to locals of function
        var ctx = context
        while(ctx.parent!==undefined){
            if(ctx.type==='def'){
                ctx.locals.push(name)
                break
            }
            ctx = ctx.parent
        }    
        
    }
    this.toString = function(){return '(func star arg '+this.op+') '+this.name}
}

function $GlobalCtx(context){
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.toString = function(){return 'global '+this.tree}
    this.scope = $get_scope(this)
    if(this.scope.globals===undefined) this.scope.globals=[]

    this.add = function(name){
        if(this.scope.globals.indexOf(name)==-1) this.scope.globals.push(name)
    }

    this.to_js = function(){return ''}
}

function $check_unbound(assigned,scope,varname){
    // check if the variable varname in context "assigned" was
    // referenced in the scope
    // If so, replace statement by UnboundLocalError
    if(scope.var2node && scope.var2node[varname]){
        if(scope.context.tree[0].locals.indexOf(varname)>-1) return

        for(var i=0;i<scope.var2node[varname].length;i++){
            var ctx = scope.var2node[varname][i]
            if(ctx==assigned){
                delete scope.var2node[varname]
                break
            }else{
                while(ctx.parent){ctx=ctx.parent}
                var ctx_node = ctx.node
                var pnode = ctx_node.parent
                for(var rank=0;rank<pnode.children.length;rank++){
                    if(pnode.children[rank]===ctx_node){break}
                }
                var new_node = new $Node()
                //console.log('unbound name: '+varname)
                //console.log('in node '+ctx+' module '+ctx_node.module)
                var js = 'throw UnboundLocalError("local variable '+"'"
                js += varname+"'"+' referenced before assignment")'
                
                // If the id is in a "elif", the exception must be in
                // a "else if" otherwise there is a Javascript syntax error
                if(ctx.tree[0].type=='condition' && 
                    ctx.tree[0].token=='elif'){
                    js = 'else if(1){'+js+'}'
                }
                new $NodeJSCtx(new_node,js)
                pnode.insert(rank,new_node)
            }
        }
    }
    if(scope.context.tree[0].locals.indexOf(varname)==-1){
        scope.context.tree[0].locals.push(varname)
    }
}

function $IdCtx(context,value){

    this.type = 'id'
    this.toString = function(){return '(id) '+this.value+':'+(this.tree||'')}
    this.value = value
    this.parent = context
    this.tree = []
    context.tree.push(this)
    if(context.parent.type==='call_arg') this.call_arg=true

    var ctx = context
    while(ctx.parent!==undefined){
        switch(ctx.type) {
          case 'list_or_tuple':
          case 'dict_or_set':
          case 'call_arg':
          case 'def':
          case 'lambda':
            //if(['list_or_tuple','dict_or_set','call_arg','def','lambda'].indexOf(ctx.type)>-1){
            if(ctx.vars===undefined){ctx.vars=[value]}
            else if(ctx.vars.indexOf(value)===-1){ctx.vars.push(value)}
            if(this.call_arg&&ctx.type==='lambda'){
                if(ctx.locals===undefined){ctx.locals=[value]}
                else{ctx.locals.push(value)}
            }
        }
        ctx = ctx.parent
    }

    var scope = $get_scope(this)
    if(scope.ntype=='def' || scope.ntype=='generator'){
        // if variable is declared inside a comprehension, don't add it to function
        // namespace
        var _ctx=this.parent
        while(_ctx){
            if(_ctx.type=='list_or_tuple' && _ctx.is_comp()) return
            _ctx = _ctx.parent
        }
        if(context.type=='target_list'){
            if(context.parent.type=='for'){
                // a "for" loop inside the function creates a local variable : 
                // check if it was not referenced before
                $check_unbound(this,scope,value)
            }else if(context.parent.type=='comp_for'){
                // Inside a comprehension
                // The variables of the same name in the returned elements before "for" 
                // are not referenced in the function block
                var comprehension = context.parent.parent.parent
                if(comprehension.parent && comprehension.parent.type=='call_arg'){
                    // for the form "func(x for x in iterable)"
                    comprehension = comprehension.parent
                }
                var remove = []
                if(scope.var2node && scope.var2node[value]){
                    for(var i=0;i<scope.var2node[value].length;i++){
                        var ctx = scope.var2node[value][i]
                        while(ctx.parent){
                            if(ctx===comprehension.parent){
                                remove.push(i)
                                break
                            }
                            ctx = ctx.parent
                        }
                    }
                }
                for(var i=remove.length-1;i>=0;i--){
                    scope.var2node[value].splice(i,1)
                }
            }
        }else if(context.type=='expr' && context.parent.type=='comp_if'){
            // form {x for x in foo if x>5} : don't put x in referenced names
            return
        }else if(context.type=='global'){
            if(scope.globals === undefined){
                scope.globals = [value]
            }else if(scope.globals.indexOf(value)==-1){
                scope.globals.push(value)
            }
        }else if(scope.globals===undefined || scope.globals.indexOf(value)==-1){
            // variable referenced in the function
            if(scope.var2node===undefined){
                scope.var2node = {}
                scope.var2node[value] = [this]
            }else if(scope.var2node[value]===undefined){
                scope.var2node[value] = [this]
            }else{
                scope.var2node[value].push(this)
            }
        }
    }
    
    this.to_js = function(arg){
        var val = this.value
        switch(val) {
          case 'print':
          case 'eval':
          case 'open':
            val = '$'+val
            break;
          case 'locals':
          case 'globals':
            if(this.parent.type==='call'){
                var scope = $get_scope(this)
                if(scope.ntype==="module"){new $StringCtx(this.parent,'"__main__"')}
                else{
                    var locals = scope.context.tree[0].locals
                    var res = '{'
                    for(var i=0;i<locals.length;i++){
                        res+="'"+locals[i]+"':"+locals[i]
                        if(i<locals.length-1) res+=','
                    }
                    new $StringCtx(this.parent,res+'}')
                }
            }
        }
        var scope = $get_scope(this)
        if(scope.ntype=='class' && this.in_class){
            // If the id is used in a chained assignment inside a class body,
            // this instance is referenced in several assign nodes
            // If it the left part of an assignment, an attribute 'in_class'
            // has been set in method $to_js of $AssignCtx
            return this.in_class
        }
        if(scope.ntype==='class' && !this.is_left){
            // ids used in a class body (not inside a method) are resolved
            // in a specific way :
            // - if the id is used as the left part of a keyword argument
            //   (eg the id "x" in "foo(x=8)") it is left as is
            // - if this is the left part of an assignement, it is left as is
            // - otherwise, if the id matches a class attribute, it is resolved 
            //   as this class attribute, else it is left as is
            // example :
            // =============
            // x = 0
            // class foo:
            //   y = 1
            //   z = [x,y]
            //   A = foo(u=8)
            // ==============
            // y and u will be left as they are
            // x will be replaced by :
            //     ($class["x"]!==undefined ? $class["x"] : x)
            // y will be replaced by :
            //     ($class["y"]!==undefined ? $class["y"] : y)
            // at run time, the test will fail for x and will succeed for y
            var parent=this.parent
            while(parent){parent=parent.parent}
            if(this.parent.type==='expr' && this.parent.parent.type=='call_arg'){
                // left part of a keyword argument
                if(this.parent.parent.tree[0].type=='kwarg'){
                    return val+$to_js(this.tree,'')
                }
            }
            return '($class["'+val+'"] !==undefined ? $class["'+val+'"] : '+val+')'
        }
        
        return val+$to_js(this.tree,'')
    }
}


function $ImaginaryCtx(context,value){
    this.type = 'imaginary'
    this.value = value
    this.toString = function(){return 'imaginary '+this.value}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'complex(0,'+this.value+')'}
}

function $ImportCtx(context){
    this.type = 'import'
    this.toString = function(){return 'import '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    
    this.transform = function(node, rank){
        // For "import X", set X in the list of names bound in current scope
        var scope = $get_scope(this)
        scope.bound = scope.bound || []
        for(var i=0;i<this.tree.length;i++){
            var name = this.tree[i].name
            var parts = name.split('.')
            if(parts.length==1){
                if(scope.bound.indexOf(name)==-1){scope.bound.push(name)}
            }
        }
    }
    
    this.to_js = function(){
        var scope = $get_scope(this)
        var mod = $get_module(this).module
        if(mod.substr(0,13)==='__main__,exec'){mod='__main__'}
        var path = $B.$py_module_path[mod]
        var elts = path.split('/')
        elts.pop()
        path =elts.join('/')
        var res = ''
        for(var i=0;i<this.tree.length;i++){
            res += '__BRYTHON__.$import('+this.tree[i].to_js()+',"'+mod+'");'
            var parts = this.tree[i].name.split('.')
            // $import returns an object
            // for "import a.b.c" this object has attributes
            // "a", "a.b" and "a.b.c", values are the matching modules
            for(var j=0;j<parts.length;j++){
                var key = parts.slice(0,j+1).join('.')
                var alias = key
                if(j==parts.length-1){alias = this.tree[i].alias}
                if(alias.search(/\./)==-1){res += 'var '}
                res += alias
                if(j==0){
                    if(scope.is_function){
                        res += '=$locals["'+alias+'"]'
                    }else if(scope.ntype==="module"){
                        res += '=$globals["'+alias+'"]'
                    }
                }
                res += '=__BRYTHON__.vars["'+key+'"];'
            }
        }
        // add None for interactive console
        return res + 'None;'
    }
}

function $ImportedModuleCtx(context,name){
    this.type = 'imported module'
    this.toString = function(){return ' (imported module) '+this.name}
    this.parent = context
    this.name = name
    this.alias = name
    context.tree.push(this)
    this.to_js = function(){return '"'+this.name+'"'}
}

function $IntCtx(context,value){
    this.type = 'int'
    this.value = value
    this.toString = function(){return 'int '+this.value}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return this.value}
}

function $JSCode(js){
    this.js = js
    this.toString = function(){return this.js}
    this.to_js = function(){return this.js}
}

function $KwArgCtx(context){
    this.type = 'kwarg'
    this.toString = function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}
    this.parent = context.parent
    this.tree = [context.tree[0]]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)

    // put id in list of kwargs
    // used to avoid passing the id as argument of a list comprehension
    var value = this.tree[0].value
    var ctx = context
    while(ctx.parent!==undefined){
        switch(ctx.type) {
          case 'list_or_tuple':
          case 'dict_or_set':
          case 'call_arg':
          case 'def':
          case 'lamdba':
            if(ctx.kwargs===undefined){ctx.kwargs=[value]}
            else if(ctx.kwargs.indexOf(value)===-1){ctx.kwargs.push(value)}
        }
        ctx = ctx.parent
    }

    // If the keyword argument occurs inside a function, remove the occurence
    // from referenced variables in the function
    var scope = $get_scope(this)
    if(scope.ntype=='def' || scope.ntype=='generator'){
        var ix = null,varname=context.tree[0].value
        //ui slider caused an issue in which scope.var2node[varname] is undefined
        // so lets check for that.
        if (scope.var2node[varname] !== undefined) {
           for(var i=0;i<scope.var2node[varname].length;i++){
             if(scope.var2node[varname][i]==context.tree[0]){
                ix = i
                break
             }
           }
           scope.var2node[varname].splice(ix,1)
        }
    }

    this.to_js = function(){
        var key = this.tree[0].to_js()
        if(key.substr(0,2)=='$$'){key=key.substr(2)}
        var res = '{$nat:"kw",name:"'+key+'",'
        res += 'value:'+$to_js(this.tree.slice(1,this.tree.length))+'}'
        return res
    }
}

function $LambdaCtx(context){
    this.type = 'lambda'
    this.toString = function(){return '(lambda) '+this.args_start+' '+this.body_start}
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.args_start = $pos+6
    this.vars = []
    this.locals = []
    this.to_js = function(){
        var module = $get_module(this).module
        var src = $B.$py_src[module]
        var qesc = new RegExp('"',"g") // to escape double quotes in arguments

        var args = src.substring(this.args_start,this.body_start).replace(qesc,'\\"')
        var body = src.substring(this.body_start+1,this.body_end).replace(qesc,'\\"')
        body = body.replace(/\n/g,' ')
        return '__BRYTHON__.$lambda("'+module+'",$globals,$locals,"'+args+'","'+body+'")'
    }
}

function $ListOrTupleCtx(context,real){
    // the real type (list or tuple) is set inside $transition
    // as attribute 'real'
    this.type = 'list_or_tuple'
    this.start = $pos
    this.real = real
    this.expect = 'id'
    this.closed = false
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
    this.parent = context
    this.tree = []
    context.tree.push(this)
    
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
        var module = $get_module(this).module
        return $B.$py_src[module]
    }
    this.to_js = function(){
        switch(this.real) {
          case 'list':
            return 'list(['+$to_js(this.tree)+'])'
          case 'list_comp':
          case 'gen_expr':
          case 'dict_or_set_comp':
            var src = this.get_src()
            var res = '__BRYTHON__.$mkdict($globals,$locals),'

            var qesc = new RegExp('"',"g") // to escape double quotes in arguments
            for(var i=1;i<this.intervals.length;i++){
                var txt = src.substring(this.intervals[i-1],this.intervals[i])
                var lines = txt.split('\n')
                res += '['
                for(var j=0;j<lines.length;j++){
                    var txt = lines[j]
                    // ignore empty lines
                    if(txt.replace(/ /g,'').length==0){continue}
                    txt = txt.replace(/\n/g,' ')
                    txt = txt.replace(/\\/g,'\\\\')
                    txt = txt.replace(qesc,'\\"')
                    res += '"'+txt+'",'
                }
                res += ']'
                if(i<this.intervals.length-1){res+=','}
            }

            if(this.real==='list_comp') return '__BRYTHON__.$list_comp('+res+')'
            if(this.real==='dict_or_set_comp'){
                if(this.expression.length===1) return '__BRYTHON__.$gen_expr('+res+')'
                return '__BRYTHON__.$dict_comp('+res+')'
            }
            return '__BRYTHON__.$gen_expr('+res+')'
          case 'tuple':
            if(this.tree.length===1 && this.has_comma===undefined) return this.tree[0].to_js()
            return 'tuple(['+$to_js(this.tree)+'])'
        }
    }
}

function $NodeCtx(node){
    this.node = node
    node.context = this
    this.tree = []
    this.type = 'node'
    this.toString = function(){return 'node '+this.tree}
    this.to_js = function(){
        if(this.tree.length>1){
            var new_node = new $Node()
            var ctx = new $NodeCtx(new_node)
            ctx.tree = [this.tree[1]]
            new_node.indent = node.indent+4
            this.tree.pop()
            node.add(new_node)
        }
        if(node.children.length==0){return $to_js(this.tree)+';'}
        return $to_js(this.tree)
    }
}

function $NodeJSCtx(node,js){ // used for raw JS code
    this.node = node
    node.context = this
    this.type = 'node_js'
    this.tree = [js]
    this.toString = function(){return 'js '+js}
    this.to_js = function(){return js}
}

function $NonlocalCtx(context){
    // for the moment keep this as alias for global 
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.toString = function(){return 'global '+this.tree}

    this.scope = $get_scope(this)
    if(this.scope.globals===undefined){this.scope.globals=[]}

    this.add = function(name){
        if(this.scope.globals.indexOf(name)==-1){this.scope.globals.push(name)}
    }

    this.to_js = function(){return ''}
}


function $NotCtx(context){
    this.type = 'not'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return 'not ('+this.tree+')'}
    this.to_js = function(){return '!bool('+$to_js(this.tree)+')'}
}

function $OpCtx(context,op){ // context is the left operand
    this.type = 'op'
    this.op = op
    this.toString = function(){return '(op '+this.op+') ['+this.tree+']'}
    this.parent = context.parent
    this.tree = [context]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.to_js = function(){
        var comps = {'==':'eq','!=':'ne','>=':'ge','<=':'le',
            '<':'lt','>':'gt'}
        if(comps[this.op]!==undefined){
            var method=comps[this.op]
            if(this.tree[0].type=='expr' && this.tree[1].type=='expr'){
                var t0=this.tree[0].tree[0],t1=this.tree[1].tree[0]
                if(t1.type=='int'){
                    if(t0.type=='int'){return t0.to_js()+this.op+t1.to_js()}
                    else if(t0.type=='str'){return 'false'}
                    else if(t0.type=='id'){
                        var res = 'typeof '+t0.to_js()+'=="number" ? '
                        res += t0.to_js()+this.op+t1.to_js()+' : '
                        res += 'getattr('+this.tree[0].to_js()
                        res += ',"__'+method+'__")('+this.tree[1].to_js()+')'
                        return res
                    }
                }
                else if(t1.type=='str'){
                    if(t0.type=='str'){return t0.to_js()+this.op+t1.to_js()}
                    else if(t0.type=='int'){return 'false'}
                    else if(t0.type=='id'){
                        var res = 'typeof '+t0.to_js()+'=="string" ? '
                        res += t0.to_js()+this.op+t1.to_js()+' : '
                        res += 'getattr('+this.tree[0].to_js()
                        res += ',"__'+method+'__")('+this.tree[1].to_js()+')'
                        return res
                    }
                }else if(t1.type=='id'){
                    if(t0.type=='str'||t0.type=='int'){return t0.to_js()+this.op+t1.to_js()}
                    else if(t0.type=='id'){
                        var res = 'typeof '+t0.to_js()+'!="object" && '
                        res += 'typeof '+t0.to_js()+'==typeof '+t1.to_js()
                        res += ' ? '+t0.to_js()+this.op+t1.to_js()+' : '
                        res += 'getattr('+this.tree[0].to_js()
                        res += ',"__'+method+'__")('+this.tree[1].to_js()+')'
                        return res
                    }
                }
            }
        }
        switch(this.op) {
          case 'and':
            var res ='__BRYTHON__.$test_expr(__BRYTHON__.$test_item('+this.tree[0].to_js()+')&&'
            return res + '__BRYTHON__.$test_item('+this.tree[1].to_js()+'))'
          case 'or':
            var res ='__BRYTHON__.$test_expr(__BRYTHON__.$test_item('+this.tree[0].to_js()+')||'
            return res + '__BRYTHON__.$test_item('+this.tree[1].to_js()+'))'
          case 'in':
            return '__BRYTHON__.$is_member('+$to_js(this.tree)+')'
          case 'not_in':
            return '!__BRYTHON__.$is_member('+$to_js(this.tree)+')'
          case 'unary_neg':
          case 'unary_inv':
            // For unary operators, the left operand is the unary sign(s)
            if(this.op=='unary_neg'){op='-'}else{op='~'}
            // for integers or float, replace their value using
            // Javascript operators
            if(this.tree[1].type=="expr"){
                var x = this.tree[1].tree[0]
                switch(x.type) {
                  case 'int':
                    //if(x.type=='int') 
                    return op+x.value
                  case 'float':
                    //if(x.type=='float') 
                    return 'float('+op+x.value+')'
                  case 'imaginary':
                    //if(x.type=='imaginary') 
                    return 'complex(0,'+op+x.value+')'
                }
            }
            if(op=='-') return 'getattr('+this.tree[1].to_js()+',"__neg__")()'
            return 'getattr('+this.tree[1].to_js()+',"__invert__")()'
          case 'is':
            return this.tree[0].to_js() + '===' + this.tree[1].to_js()
          case 'is_not':
            return this.tree[0].to_js() + '!==' + this.tree[1].to_js()
          case '*':
          case '+':
          case '-':
            var op = this.op
            var vars = []
            var has_float_lit = false
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
                    var _var = elt.tree[0].value
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

            var e0=this.tree[0],e1=this.tree[1]
            if(is_simple(this)){
                var v0 = this.tree[0].tree[0]
                var v1 = this.tree[1].tree[0]
                if(vars.length==0 && !has_float_lit){
                    // only integer literals
                    return this.simple_js()
                }else if(vars.length==0){
                    // numeric literals with at least one float
                    return 'new __BRYTHON__.$FloatClass('+this.simple_js()+')'
                }else{
                    // at least one variable
                    // Test if all variables are numbers
                    var tests = []
                    for(var i=0;i<vars.length;i++){
                        tests.push('typeof '+vars[i]+'.valueOf() == "number"')
                    }
                    var res = tests.join(' && ')+' ? '

                    // Test if all variables are integers
                    var tests = []
                    for(var i=0;i<vars.length;i++){
                        tests.push('typeof '+vars[i]+' == "number"')
                    }
                    res += '('+tests.join(' && ')+' ? '
                    
                    // If true, use basic formula
                    res += this.simple_js()
                    
                    // Else wrap simple formula in a float
                    res += ' : new __BRYTHON__.$FloatClass('+this.simple_js()+')'
                    
                    // Close integers test
                    res += ')'

                    // If at least one variable is not a number
                    res += ': getattr('+this.tree[0].to_js()+',"__'
                    res += $operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
                    
                }
            }else{
                var res = 'getattr('+e0.to_js()+',"__'
                res += $operators[this.op]+'__")'+'('+e1.to_js()+')'
            } 
            return res
          default:
            var res = 'getattr('+this.tree[0].to_js()+',"__'
            return res + $operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
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
            }else{return elt.tree[0].value}
        }
        return sjs(this.tree[0])+op+sjs(this.tree[1]) 
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
    this.toString = function(){return '(packed) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return $to_js(this.tree)}
}


function $PassCtx(context){
    this.type = 'pass'
    this.toString = function(){return '(pass)'}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'void(0)'}
}

function $RaiseCtx(context){
    this.type = 'raise'
    this.toString = function(){return ' (raise) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){
        if(this.tree.length===0) return '__BRYTHON__.$raise()'
        var exc = this.tree[0]
        if(exc.type==='id' ||
            (exc.type==='expr' && exc.tree[0].type==='id')){
            var value = exc.value
            if(exc.type=='expr'){value = exc.tree[0].value}
            var res = 'if(isinstance('+value+',type)){throw '+value+'()}'
            return res + 'else{throw '+value+'}'
        }
        // if raise had a 'from' clause, ignore it
        while(this.tree.length>1) this.tree.pop()
        return 'throw '+$to_js(this.tree)
    }
}

function $RawJSCtx(context,js){
    this.type = "raw_js"
    context.tree.push(this)
    this.parent = context
    this.toString = function(){return '(js) '+js}
    this.to_js = function(){return js}
}

function $ReturnCtx(context){ // subscription or slicing
    this.type = 'return'
    this.toString = function(){return 'return '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    
    // Check if return is inside a loop
    // In this case, the loop will not be included inside a function
    // for optimisation
    var node = $get_node(this)
    while(node.parent){
        if(node.parent.context && node.parent.context.tree[0].type=='for'){
            node.parent.context.tree[0].has_return = true
            break
        }
        node = node.parent
    }
    
    this.to_js = function(){
        if(this.tree.length==1 && this.tree[0].type=='abstract_expr'){
            // "return" must be transformed into "return None"
            this.tree.pop()
            new $IdCtx(new $ExprCtx(this,'rvalue',false),'None')
        }
        var scope = $get_scope(this)
        if(scope.ntype=='BRgenerator'){
            var res = 'return [__BRYTHON__.generator_return('
            return res + $to_js(this.tree)+')]'
        }
        return 'return '+$to_js(this.tree)
    }
}

function $SingleKwCtx(context,token){ // used for finally,else
    this.type = 'single_kw'
    this.token = token
    this.parent = context
    this.tree = []
    context.tree.push(this)

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
                (elt.type=='condition' && elt.token=='while')){
                elt.has_break = true
                this.loop_num = elt.loop_num
            }
        }
    }

    this.toString = function(){return this.token}
    
    this.to_js = function(){
        if(this.token==='finally') return this.token

        // For "else" we must check if the previous block was a loop
        // If so, check if the loop exited with a "break" to decide
        // if the block below "else" should be run
        if(this.loop_num!==undefined){return 'if($no_break'+this.loop_num+')'}
        return this.token
    }
}

function $StarArgCtx(context){
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(star arg) '+this.tree}
    this.to_js = function(){
        return '{$nat:"ptuple",arg:'+$to_js(this.tree)+'}'
    }
}

function $StringCtx(context,value){
    this.type = 'str'
    this.toString = function(){return 'string '+(this.tree||'')}
    this.parent = context
    this.tree = [value] // may be extended if consecutive strings eg 'a' 'b'
    this.raw = false
    context.tree.push(this)
    this.to_js = function(){
        var res = ''
        for(var i=0;i<this.tree.length;i++){
            var value=this.tree[i]
            if(value.charAt(0)!='b'){
                res += value.replace(/\n/g,'\\n\\\n')
            }else{
                res += 'bytes('
                res += value.substr(1).replace(/\n/g,'\\n\\\n')
                res += ',__BRYTHON__.charset)'
            }
            if(i<this.tree.length-1){res+='+'}
        }
        return res
    }
}

function $SubCtx(context){ // subscription or slicing
    this.type = 'sub'
    this.func = 'getitem' // set to 'setitem' if assignment
    this.toString = function(){return '(sub) (value) '+this.value+' (tree) '+this.tree}
    this.value = context.tree[0]
    context.tree.pop()
    context.tree.push(this)
    this.parent = context
    this.tree = []
    this.to_js = function(){
        // In assignment to subscriptions, eg a[x][y], a flag "marked" is set
        // to use the shorcut a[x] instead of the complete code with getattr
        if(this.marked){
            var val = this.value.to_js()
            var res = 'getattr('+val+',"__'+this.func+'__")('
            if(this.tree.length===1) return res+this.tree[0].to_js()+')'
    
            res += 'slice('
            for(var i=0;i<this.tree.length;i++){
                if(this.tree[i].type==='abstract_expr'){res+='null'}
                else{res+=this.tree[i].to_js()}
                if(i<this.tree.length-1){res+=','}
            }
            return res+'))'
        }else{
            var res = '', shortcut = false
            if(this.func=='getitem' && this.tree.length==1){
                res += '__BRYTHON__.$getitem('+this.value.to_js()+','
                res += this.tree[0].to_js()+')'
                return res
            }
            if(false && this.func!=='delitem' && Array.isArray && this.tree.length==1 && !this.in_sub){
                var expr = '', x = this
                shortcut = true
                while(x.value.type=='sub'){
                    expr += '['+x.tree[0].to_js()+']'
                    x.value.in_sub = true
                    x = x.value
                }
                var subs = x.value.to_js()+'['+x.tree[0].to_js()+']'
                res += '(Array.isArray('+x.value.to_js()+') && '
                res += subs+'!==undefined ?'
                res += subs+expr+ ' : '
                //console.log(res)
            }
            var val = this.value.to_js()
            //if(this.value.type=='id'){console.log(val+'['+this.tree[0].to_js()+']')}
            //else if(this.value.type=='sub'){console.log(''+this.value.value.to_js()+this.value.tree[0].to_js()+this.tree[0].to_js())}
            res += 'getattr('+val+',"__'+this.func+'__")('
            if(this.tree.length===1){
                res += this.tree[0].to_js()+')'
            }else{
                res += 'slice('
                for(var i=0;i<this.tree.length;i++){
                    if(this.tree[i].type==='abstract_expr'){res+='null'}
                    else{res+=this.tree[i].to_js()}
                    if(i<this.tree.length-1){res+=','}
                }
                res += '))'
            }
            return shortcut ? res+')' : res
        }
    }
}

function $TargetCtx(context,name){ // exception
    this.toString = function(){return ' (target) '+this.name}
    this.parent = context
    this.name = name
    this.alias = null
    context.tree.push(this)
    this.to_js = function(){return '["'+this.name+'","'+this.alias+'"]'}
}

function $TargetListCtx(context){
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.expect = 'id'
    context.tree.push(this)
    this.toString = function(){return '(target list) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $TernaryCtx(context){
    this.type = 'ternary'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    context.parent = this
    this.tree = [context]
    this.toString = function(){return '(ternary) '+this.tree}
    this.to_js = function(){
        // build namespace
        var env = '{"$globals":$globals,"$locals":$locals,'
        var ids = $get_ids(this)
        for(var i=0;i<ids.length;i++){
            env += '"'+ids[i]+'":'+ids[i]
            if(i<ids.length-1){env+=','}
        }
        env+='}'
        var qesc = new RegExp('"',"g") // to escape double quotes in arguments
        var args = '"'+this.tree[1].to_js().replace(qesc,'\\"')+'","' // condition
        args += escape(this.tree[0].to_js())+'","' // result if true
        args += escape(this.tree[2].to_js()) // result if false
        return '__BRYTHON__.$ternary('+env+','+args+'")'
    }
}

function $TryCtx(context){
    this.type = 'try'
    this.parent = context
    context.tree.push(this)
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
                //if(['except','finally','single_kw'].indexOf(next_ctx.type)===-1){
                $_SyntaxError(context,"missing clause after 'try' 2")
            }
        }
        var scope = $get_scope(this)
        
        // transform node into Javascript 'try' (necessary if
        // "try" inside a "for" loop)
        // add a boolean $failed, used to run the 'else' clause
        new $NodeJSCtx(node,'__BRYTHON__.$failed'+$loop_num+'=false;try')
        node.is_try = true // used in generators
        
        // insert new 'catch' clause
        var catch_node = new $Node()
        new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
        catch_node.is_catch = true
        node.parent.insert(rank+1,catch_node)

        // fake line to start the 'else if' clauses
        var new_node = new $Node()
        // set the boolean $failed to true
        new $NodeJSCtx(new_node,'__BRYTHON__.$failed'+$loop_num+'=true;if(false){void(0)}')
        catch_node.insert(0,new_node)
        
        var pos = rank+2
        var has_default = false // is there an "except:" ?
        var has_else = false // is there an "else" clause ?
        while(1){
            if(pos===node.parent.children.length){break}
            var ctx = node.parent.children[pos].context.tree[0]
            if(ctx.type==='except'){
                // move the except clauses below catch_node
                if(has_else){$_SyntaxError(context,"'except' or 'finally' after 'else'")}
                ctx.error_name = '$err'+$loop_num
                if(ctx.tree.length>0 && ctx.tree[0].alias!==null
                    && ctx.tree[0].alias!==undefined){
                    // syntax "except ErrorName as Alias"
                    var new_node = new $Node()
                    var alias = ctx.tree[0].alias
                    var js = 'var '+alias
                    if(scope.ntype=='def'||scope.ntype=='BRgenerator'){
                        js += ' = $locals["'+alias+'"]'
                    }else{
                        js += ' = $globals["'+alias+'"]'
                    }
                    js += '=__BRYTHON__.exception($err'+$loop_num+')'
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
                if(has_else){$_SyntaxError(context,"'finally' after 'else'")}
                pos++
            }else if(ctx.type==='single_kw' && ctx.token==='else'){
                if(has_else){$_SyntaxError(context,"more than one 'else'")}
                has_else = true
                var else_body = node.parent.children[pos]
                node.parent.children.splice(pos,1)
            }else{break}
        }
        if(!has_default){
            // if no default except: clause, add a line to throw the
            // exception if it was not caught
            var new_node = new $Node()
            new $NodeJSCtx(new_node,'else{throw $err'+$loop_num+'}')
            catch_node.insert(catch_node.children.length,new_node)
        }
        if(has_else){
            var else_node = new $Node()
            new $NodeJSCtx(else_node,'if(!__BRYTHON__.$failed'+$loop_num+')')
            for(var i=0;i<else_body.children.length;i++){
                else_node.add(else_body.children[i])
            }
            node.parent.insert(pos,else_node)
        }
        $loop_num++
    }
    this.to_js = function(){return 'try'}
}

function $UnaryCtx(context,op){
    this.type = 'unary'
    this.op = op
    this.toString = function(){return '(unary) '+this.op}
    this.parent = context
    context.tree.push(this)
    this.to_js = function(){return this.op}
}

function $WithCtx(context){
    this.type = 'with'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.expect = 'as'
    this.toString = function(){return '(with) '}
    this.set_alias = function(arg){
        var scope = $get_scope(this)
        this.tree[this.tree.length-1].alias = arg
        if(scope.ntype !== 'module'){
            // add to function local names
            scope.context.tree[0].locals.push(arg)
        }
    }
    this.transform = function(node,rank){
        if(this.transformed) return  // used if inside a for loop
        if(this.tree[0].alias===null){this.tree[0].alias = '$temp'}
        var new_node = new $Node()
        new $NodeJSCtx(new_node,'catch($err'+$loop_num+')')
        var fbody = new $Node()
        var js = 'if(!$ctx_manager_exit($err'+$loop_num+'.type,'
        js += '$err'+$loop_num+'.value,$err'+$loop_num+'.traceback))'
        js += '{throw $err'+$loop_num+'}'
        new $NodeJSCtx(fbody,js)
        new_node.add(fbody)
        node.parent.insert(rank+1,new_node)
        $loop_num++
        var new_node = new $Node()
        new $NodeJSCtx(new_node,'finally')
        var fbody = new $Node()
        new $NodeJSCtx(fbody,'$ctx_manager_exit(None,None,None)')
        new_node.add(fbody)
        node.parent.insert(rank+2,new_node)
        this.transformed = true
    }
    this.to_js = function(){
        var res = 'var $ctx_manager='+this.tree[0].to_js()
        var scope = $get_scope(this)
        res += '\nvar $ctx_manager_exit = getattr($ctx_manager,"__exit__")\n'
        if(this.tree[0].alias){
            var alias = this.tree[0].alias
            res += 'var '+alias+'='
            if(scope.ntype=='module'){res += '$globals["'}
            else{
                res += '$locals["'
                scope.context.tree[0].locals.push(alias)
            }
            res += alias + '"]='
        }
        return res + 'getattr($ctx_manager,"__enter__")()\ntry'
    }
}

function $YieldCtx(context){ 
    this.type = 'yield'
    this.toString = function(){return '(yield) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)

    // Syntax control : 'yield' can start a 'yield expression'
    switch(context.type) {
       case 'node':
          break;
       //if(context.type=='node'){}
    
       // or start a 'yield atom'
       // a 'yield atom' without enclosing "(" and ")" is only allowed as the
       // right-hand side of an assignment

       //else if(context.type=='assign' ||
       //    (context.type=='list_or_tuple' && context.real=="tuple")) {
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
          //}else{$_SyntaxError(context,'yield atom must be inside ()')}
          $_SyntaxError(context,'yield atom must be inside ()')
    }

    var scope = $get_scope(this)
    if(!scope.is_function){
        $_SyntaxError(context,["'yield' outside function"])
    }else if(scope.has_return_with_arguments){
        $_SyntaxError(context,["'return' with argument inside generator"])
    }
    
    // change type of function to BRgenerator
    var def = scope.context.tree[0]
    def.type = 'BRgenerator'

    // add to list of "yields" in function
    def.yields.push(this)
    
    this.toString = function(){return '(yield) '+(this.from ? '(from) ' : '')+this.tree}
    
    this.transform = function(node, rank){
        if(this.from===true){
        
            // replace "yield from X" by "for $temp in X: yield $temp"

            var new_node = new $Node()
            node.parent.children.splice(rank,1)
            node.parent.insert(rank, new_node)

            var for_ctx = new $ForExpr(new $NodeCtx(new_node))
            new $IdCtx(new $ExprCtx(for_ctx,'id',false),'$temp'+$loop_num)
            for_ctx.tree[1] = this.tree[0]
            this.tree[0].parent = for_ctx

            var yield_node = new $Node()
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
        var scope = $get_scope(this)
        var res = ''
        //if(scope.ntype==='BRgenerator'){
        //    scope = $get_scope(scope.context.tree[0])
        //    if(scope.ntype==='class'){res = '$class.'}
        //}
        if(this.from===undefined) return $to_js(this.tree) || 'None'

        // form "yield from <expr>" : <expr> is this.tree[0]

        //console.log('yield from expression '+this)
        var res = $to_js(this.tree)
        //console.log('code '+res)
        return res
    }
}


// used in loops
var $loop_num = 0
var $iter_num = 0 

function $add_line_num(node,rank){
    if(node.type==='module'){
        var i=0
        while(i<node.children.length){
            i += $add_line_num(node.children[i],i)
        }
    }else{
        var elt=node.context.tree[0],offset=1
        var flag = true
        // ignore lines added in transform()
        if(node.line_num===undefined){flag=false}
        if(node.module===undefined){
            var nd = node.parent
            while(nd){
                if(nd.module!==undefined){
                    node.module = nd.module
                    break
                }
                nd = nd.parent
            }
            if(node.module===undefined){
                console.log('module undef, node '+node.context);flag=false
            }
        }
        // don't add line num before try,finally,else,elif
        if(elt.type==='condition' && elt.token==='elif'){flag=false}
        else if(elt.type==='except'){flag=false}
        else if(elt.type==='single_kw'){flag=false}
        if(flag){
            // add a trailing None for interactive mode
            var js='__BRYTHON__.line_info=new Array('+node.line_num+',"'+node.module+'");None;'
            if(node.module===undefined) console.log('tiens, module undef !')

            var new_node = new $Node()
            new $NodeJSCtx(new_node,js)
            node.parent.insert(rank,new_node)
            offset = 2
        }
        var i=0
        while(i<node.children.length) i+=$add_line_num(node.children[i],i)

        return offset
    }
}

function $clear_ns(ctx){
    // Function called when it turns out that the list or tuple is a comprehension
    // If the list is in a function, the names defined in the display so far must 
    // be removed from the function namespace
    var scope = $get_scope(ctx)
    if(scope.is_function){
        if(scope.var2node){
            for(var name in scope.var2node){
                var remove = []
                for(var j=0;j<scope.var2node[name].length;j++){
                    var elt = scope.var2node[name][j].parent
                    while(elt.parent){
                        if(elt===ctx){remove.push(j);break}
                        elt=elt.parent
                    }
                }
                for(var k=remove.length-1;k>=0;k--){
                    scope.var2node[name].splice(remove[k],1)
                }
                //if(scope.var2node[name].length==0){scope.var2node[name]==undefined}

            }
        }
    }
}

function $get_docstring(node){
    var doc_string='""'
    if(node.children.length>0){
        var firstchild = node.children[0]
        if(firstchild.context.tree && firstchild.context.tree[0].type=='expr'){
            if(firstchild.context.tree[0].tree[0].type=='str')
            doc_string = firstchild.context.tree[0].tree[0].to_js()
        }
    }
    return doc_string
}

function $get_scope(context){
    // return the $Node indicating the scope of context
    // null for the script or a def $Node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var scope = null
    while(tree_node.parent && tree_node.parent.type!=='module'){
        var ntype = tree_node.parent.context.tree[0].type
        switch (ntype) {
          case 'def':
          case 'class':
          case 'generator':
          case 'BRgenerator':
            scope = tree_node.parent
            scope.ntype = ntype
            scope.elt = scope.context.tree[0]
            scope.is_function = ntype!='class'
            return scope
        }
        tree_node = tree_node.parent
    }
    scope = tree_node.parent || tree_node // module
    scope.ntype = "module"
    scope.elt = scope.module
    return scope
}

function $get_module(context){
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var scope = null
    while(tree_node.parent.type!=='module'){
        tree_node = tree_node.parent
    }
    scope = tree_node.parent // module
    scope.ntype = "module"
    return scope
}

function $get_node(context){
    var ctx = context
    while(ctx.parent){ctx=ctx.parent}
    return ctx.node
}

function $get_ids(ctx){
    if(ctx.type==='expr' &&
        ctx.tree[0].type==='list_or_tuple' &&
        ctx.tree[0].real==='list_comp'){return []}

    var res = []
    switch(ctx.type) {
      case 'id':
        res.push(ctx.value)
        break
      case 'attribute':
      case 'sub':
        var res1 = $get_ids(ctx.value)
        for(var i=0;i<res1.length;i++){
            if(res.indexOf(res1[i])===-1){res.push(res1[i])}
        }
        break
      case 'call':
        var res1 = $get_ids(ctx.func)
        for(var i=0;i<res1.length;i++){
            if(res.indexOf(res1[i])===-1){res.push(res1[i])}
        }
    }
    if(ctx.tree!==undefined){
        for(var i=0;i<ctx.tree.length;i++){
            var res1 = $get_ids(ctx.tree[i])
            for(var j=0;j<res1.length;j++){
                if(res.indexOf(res1[j])===-1) res.push(res1[j])
            }
        }
    }
    return res
}

function $ws(n){
    return ' '.repeat(n)
    //var res = ''
    //for(var i=0;i<n;i++){res += ' '}
    //return res
}

function $to_js_map(tree_element) {
   if (tree_element.to_js !== undefined) return tree_element.to_js()
   throw Error('no to_js() for '+tree_element)
}

function $to_js(tree,sep){
   if(sep===undefined){sep=','}

   return tree.map($to_js_map).join(sep)
    //var res = ''
    //for(var i=0;i<tree.length;i++){
    //    if(tree[i].to_js!==undefined){
    //        res += tree[i].to_js()
    //    }else{
    //        throw Error('no to_js() for '+tree[i])
    //    }
    //    if(i<tree.length-1){res+=sep}
    //}
    //return res
}

// expression starters 
var $expr_starters = ['id','imaginary','int','float','str','bytes','[','(','{','not','lambda']

function $arbo(ctx){
    while(ctx.parent!=undefined){ctx=ctx.parent}
    return ctx
}
function $transition(context,token){

    //console.log('context '+context+' token '+token)
    switch(context.type) {
      case 'abstract_expr':

        //if($expr_starters.indexOf(token)>-1 || token=='yield'){
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
            // ignore unary +
            switch(tg) {
              case '+':
                //if(tg=='+'){
                return context
              case '*':
                //if(tg=='*'){
                context.parent.tree.pop() // remove abstract expression
                var commas = context.with_commas
                context = context.parent
                return new $PackedCtx(new $ExprCtx(context,'expr',commas))
              case '-':
              case '~':
                //if('-~'.search(tg)>-1){ // unary -, bitwise ~
                // create a left argument for operator "unary"
                context.parent.tree.pop()
                var left = new $UnaryCtx(context.parent,tg)
                // create the operator "unary"
                if(tg=='-'){var op_expr = new $OpCtx(left,'unary_neg')}
                else{var op_expr = new $OpCtx(left,'unary_inv')}
                return new $AbstractExprCtx(op_expr,false)
            }
            $_SyntaxError(context,'token '+token+' after '+context)
          case '=':
            $_SyntaxError(context,token)
          case 'yield':
            return new $AbstractExprCtx(new $YieldCtx(context),false)
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
      case 'assert':
        if(token==='eol') return $transition(context.parent,token)
        $_SyntaxError(context,token)
      case 'assign':
        if(token==='eol'){
            if(context.tree[1].type=='abstract_expr'){
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return $transition(context.parent,'eol')
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'attribute':
        if(token==='id'){
            var name = arguments[2]
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
          case 'not':
          case 'lambda':
            if(context.has_dstar) $_SyntaxError(context,token)
            return $transition(new $CallArgCtx(context),token,arguments[2])
          case ')':
            context.end=$pos
            return context.parent
          case 'op':
            switch(arguments[2]) {
              case '-':
              case '~':
                return new $UnaryCtx(new $ExprCtx(context,'unary',false),arguments[2])
              case '+':
                return context
              case '*':
                context.has_star = true;
                return new $StarArgCtx(context)
              case '**':
                context.has_dstar = true
                return new $DoubleStarArgCtx(context)
            } //switch(arguments[2])
            throw Error('SyntaxError')
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
          case 'not':
          case 'lambda':
            //if($expr_starters.indexOf(token)>-1 && context.expect==='id'){
            if(context.expect === 'id') { 
               context.expect=','
               var expr = new $AbstractExprCtx(context,false)
               return $transition(expr,token,arguments[2])
            }
            break
          case '=':
            //}else if(token==='=' && context.expect===','){
            if (context.expect===',') {
               return new $ExprCtx(new $KwArgCtx(context),'kw_value',false)
            }
            break
          case 'for':
            //}else if(token==='for'){
            // comprehension
            $clear_ns(context) // if inside function
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
            //}else if(token==='op' && context.expect==='id'){
            if (context.expect === 'id') {
               var op = arguments[2]
               context.expect = ','
               switch(op) {
                  case '+':
                  case '-':
                    return $transition(new $AbstractExprCtx(context,false),token,op)
                  case '*':
                    //context.expect=','
                    return new $StarArgCtx(context)
                  case '**':
                    //context.expect=','
                    return new $DoubleStarArgCtx(context)
               }//switch
            }
            $_SyntaxError(context,'token '+token+' after '+context)
          case ')':
            //}else if(token===')'){
            if(context.tree.length>0){
                var son = context.tree[context.tree.length-1]
                if(son.type==='list_or_tuple'&&son.real==='gen_expr'){
                    son.intervals.push($pos)
                }
            }
            return $transition(context.parent,token)
          case ':':
            //if(token===':' && context.expect===',' && context.parent.parent.type==='lambda'){
            if (context.expect ===',' && context.parent.parent.type==='lambda') {
               return $transition(context.parent.parent,token)
            }
            break
          case ',':
            //if(token===','&& context.expect===','){
            if (context.expect===',') {
               return new $CallArgCtx(context.parent)
            }
        }// switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'class':
        switch(token) {
          case 'id':
          //if(token==='id' && context.expect==='id'){
            if (context.expect === 'id') {
               context.name = arguments[2]
               context.expect = '(:'
               return context
            }
            break
          case '(':
            //if(token==='(') 
            return new $CallCtx(context)
          case ':':
            //if(token===':') 
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
            //if(token==='if') 
            return new $AbstractExprCtx(new $CompIfCtx(context),false)
          case 'for':
            //if(token==='for') 
            return new $TargetListCtx(new $CompForCtx(context))
        }
        return $transition(context.parent,token,arguments[2])
      case 'condition':
        if(token===':') return $BodyCtx(context)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'decorator':
        if(token==='id' && context.tree.length===0){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }
        if(token==='eol') return $transition(context.parent,token)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'def':
        switch(token) {
          case 'id':
            //if(token==='id'){
            if(context.name) {
              $_SyntaxError(context,'token '+token+' after '+context)
            }
            context.set_name(arguments[2])
            return context
          case '(':
            //if(token==='(') {
            if(context.name===null){
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            context.has_args=true;
            return new $FuncArgs(context)
          case ':':
            //if(token===':' && context.has_args) return $BodyCtx(context)
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
                //if(token==='[') 
                return new $SubCtx(context.parent)
              case '(':
                //if(token==='(') 
                return new $CallArgCtx(new $CallCtx(context))
              case 'op':
                //if(token==='op'){
                return new $AbstractExprCtx(new $OpCtx(context,arguments[2]),false)
            }
            return $transition(context.parent,token,arguments[2])
        }else{
            if(context.expect===','){
                switch(token) {
                  case '}':
                    //if(context.real==='dict_or_set'&&context.tree.length===1){
                    //    // set with single element
                    //    context.real = 'set'
                    //}
                    //var _cr=context.real
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
                        //if ('set' == _cr || 'set_comp' == _cr || 'dict_comp' == _cr
                        //   || ('dict' == _cr && context.tree.length%2===0)) {
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
                    $clear_ns(context) // if defined inside a function
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
                  case 'not':
                  case 'lambda':
                    context.expect = ','
                    var expr = new $AbstractExprCtx(context,false)
                    return $transition(expr,token,arguments[2])
                  case 'op':
                    //var tg = arguments[2]
                    // ignore unary +
                    switch(arguments[2]) {
                      case '+':
                        //if(tg=='+'){return context}
                        return context
                      case '-':
                      case '~':
                        //if('-~'.search(tg)>-1){ // unary -, bitwise ~
                        // create a left argument for operator "unary"
                        context.expect = ','
                        var left = new $UnaryCtx(context,arguments[2])
                        // create the operator "unary"
                        if(arguments[2]=='-'){var op_expr = new $OpCtx(left,'unary_neg')}
                        else{var op_expr = new $OpCtx(left,'unary_inv')}
                        return new $AbstractExprCtx(op_expr,false)
                    }//switch
                    $_SyntaxError(context,'token '+token+' after '+context)
                } //switch
                $_SyntaxError(context,'token '+token+' after '+context)
            }
            return $transition(context.parent,token,arguments[2])
        }
        break
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
          case 'not':
          case 'lambda':
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case ',':
            return context.parent
          case ')':
            return $transition(context.parent,token)
          case ':':
            if (context.parent.parent.type==='lambda'){
              return $transition(context.parent.parent,token)
            }
        }
        $_SyntaxError(context,'token '+token+' after '+context)
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
               context.tree[0].alias = arguments[2]
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
          case '[':
          case '(':
          case '{':
          case 'not':
          case 'lamdba':
            //if($expr_starters.indexOf(token)>-1 && context.expect==='expr'){
            if(context.expect==='expr'){
              context.expect = ','
              return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
            }
        }
        switch(token) {
          case 'not':
            //if(token==='not'&&context.expect===','){
            if (context.expect === ',') return new $ExprNot(context)
            break
          case 'in':
            //if(token==='in'&&context.expect===','){
            if(context.expect===',') return $transition(context,'op','in')
            break
          case ',':
            //if(token===',' && context.expect===','){
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
            //if(token==='.') 
            return new $AttrCtx(context)
          case '[':
            //if(token==='[') 
            return new $AbstractExprCtx(new $SubCtx(context),true)
          case '(':
            //if(token==='(') 
            return new $CallCtx(context)
          case 'op':
            //if(token==='op'){
            // handle operator precedence
            var op_parent=context.parent,op=arguments[2]
            
            // conditional expressions have the lowest priority
            if(op_parent.type=='ternary' && op_parent.in_else){
                var new_op = new $OpCtx(op_parent,op)
                return new $AbstractExprCtx(new_op,false)
            }
            
            var op1 = context.parent,repl=null
            while(1){
                if(op1.type==='expr'){op1=op1.parent}
                else if(op1.type==='op'&&$op_weight[op1.op]>=$op_weight[op]){repl=op1;op1=op1.parent}
                else{break}
            }
            if(repl===null){
                if(op === 'and' || op === 'or'){
                    while(context.parent.type==='not'||
                        (context.parent.type==='expr'&&context.parent.parent.type==='not')){
                        // 'and' and 'or' have higher precedence than 'not'
                        context = context.parent
                        op_parent = context.parent
                    }
                }else{
                    while(1){
                        if(context.parent!==op1){
                            context = context.parent
                            op_parent = context.parent
                        }else{
                            break
                        }
                    }
                }
                context.parent.tree.pop()
                var expr = new $ExprCtx(op_parent,'operand',context.with_commas)
                expr.expect = ','
                context.parent = expr
                var new_op = new $OpCtx(context,op)
                return new $AbstractExprCtx(new_op,false)
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
                   //&& ['<','<=','==','!=','is','>=','>'].indexOf(repl.op)>-1
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
                       //&& ['<','<=','==','!=','is','>=','>'].indexOf(op)>-1){
                       // chained comparisons such as 1 <= 3 < 5
                       // replace by (c1 op1 c2) and (c2 op ...)
                       repl.parent.tree.pop()
                       var and_expr = new $OpCtx(repl,'and')
                       var c2 = repl.tree[1] // right operand of op1
                       // clone c2
                       var c2_clone = new Object()
                       for(var attr in c2){c2_clone[attr]=c2[attr]}
                       c2_clone.parent = and_expr
                       // add fake element to and_expr : it will be removed
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
            //if(token==='augm_assign' && context.expect===','){
            if(context.expect===','){
               return new $AbstractExprCtx(new $AugmentedAssignCtx(context,arguments[2]))
            }
            break
          case '=':
            //if(token==='=' && context.expect===','){
            if(context.expect===','){
               if(context.parent.type==="call_arg"){
                  return new $AbstractExprCtx(new $KwArgCtx(context),true)
               }
                
               while(context.parent!==undefined) context=context.parent
               context = context.tree[0]
               return new $AbstractExprCtx(new $AssignCtx(context),true)
            }
            break
          case 'if':
            //if(token==='if' && context.parent.type!=='comp_iterable'){ 
            if(context.parent.type!=='comp_iterable'){ 
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
            }
        }//switch
        return $transition(context.parent,token)
      case 'expr_not':
        if(token==='in'){ // expr not in : operator
            context.parent.tree.pop()
            return new $AbstractExprCtx(new $OpCtx(context.parent,'not_in'),false)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'for':  
        switch(token) {
          case 'in':
            //if(token==='in') 
            return new $AbstractExprCtx(new $ExprCtx(context,'target list', true),false)
          case ':':
            //if(token===':') 
            return $BodyCtx(context)
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'from':
        switch(token) {
          case 'id':
            //if(token==='id' && context.expect==='id'){
            if(context.expect==='id'){
              context.names.push(arguments[2])
              context.expect = ','
              return context
            } 
            if(context.expect==='alias'){
              context.aliases[context.names[context.names.length-1]]= arguments[2]
              context.expect=','
              return context
            }
          case '.':
            //if((token==='id'||token==='.') && context.expect==='module'){
            if(context.expect==='module'){
              if(token==='id'){context.module += arguments[2]}
              else{context.module += '.'}
              return context
            }
          case 'import':
            //if(token==='import' && context.expect==='module'){
            if(context.expect==='module'){
              context.expect = 'id'
              return context
            }
          case 'op':
            //if(token==='op' && arguments[2]==='*' 
            // && context.expect==='id' && context.names.length ===0){

            if(arguments[2]==='*' && context.expect==='id' 
              && context.names.length ===0){
               if($get_scope(context).ntype!=='module'){
                   $_SyntaxError(context,["import * only allowed at module level"])
               }
               context.names.push('*')
               context.expect = 'eol'
               return context
            }
          case ',':
            //if(token===',' && context.expect===','){
            if(context.expect===','){
              context.expect = 'id'
              return context
            }
          case 'eol':
            //if(token==='eol' && 
            //(context.expect ===',' || context.expect==='eol')){
            switch(context.expect) {
              case ',':
              case 'eol':
                //if (context.expect ===',' || context.expect==='eol'){
                return $transition(context.parent,token)
            }
          case 'as':
            //if (token==='as' && (context.expect ===',' || context.expect==='eol')){
            if (context.expect ===',' || context.expect==='eol'){
               context.expect='alias'
               return context
            }
          case '(':
            //if (token==='(' && context.expect === 'id') {
            if (context.expect === 'id') {
               context.expect='id'
               return context
            }
          case ')':
            //if (token===')' && context.expect === ',') {
            if (context.expect === ',') {
               context.expect='eol'
               return context
            }
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'func_arg_id':
        switch(token) {
          case '=':
          //if(token==='=' && 
            if (context.expect==='='){
               context.parent.has_default = true
               return new $AbstractExprCtx(context,false)
            }
            break
          case ',':
          case ')':
            //if(token===',' || token===')'){
            if(context.parent.has_default && context.tree.length==0){
                $pos -= context.name.length
                $_SyntaxError(context,['non-default argument follows default argument'])
            }else{
                return $transition(context.parent,token)
            }
        }
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'func_args':
        switch (token) {
           case 'id':
             //if(token==='id' && 
             if (context.expect==='id'){
                context.expect = ','
                if(context.names.indexOf(arguments[2])>-1){
                  $_SyntaxError(context,['duplicate argument '+arguments[2]+' in function definition'])
                }
             }
             return new $FuncArgIdCtx(context,arguments[2])
           case ',':
             //if(token===','){
             if(context.has_kw_arg) $_SyntaxError(context,'duplicate kw arg')
             if(context.expect===','){
                context.expect = 'id'
                return context
             }
             $_SyntaxError(context,'token '+token+' after '+context)
           case ')':
             //if(token===')') 
             return context.parent
           case 'op':
             //if(token==='op'){
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
            //if(token==='id' &&
            if (context.name===undefined){
               if(context.parent.names.indexOf(arguments[2])>-1){
                 $_SyntaxError(context,['duplicate argument '+arguments[2]+' in function definition'])
               }
            }
            context.set_name(arguments[2])
            context.parent.names.push(arguments[2])
            return context.parent
          case ',':
            //if(token==',' && 
            if (context.name===undefined){
               // anonymous star arg - found in configparser
               context.set_name('$dummy')
               context.parent.names.push('$dummy')
               return $transition(context.parent,token)
            }
            break
          case ')':
            //if(token==')'){
            // anonymous star arg - found in configparser
            context.set_name('$dummy')
            context.parent.names.push('$dummy')
            return $transition(context.parent,token)
        }// switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'global':
        switch(token) {
          case 'id':
            //if(token==='id' && 
            if (context.expect==='id'){
               new $IdCtx(context,arguments[2])
               context.add(arguments[2])
               context.expect=','
               return context
            }
            break
          case ',': 
            //if(token===',' && 
            if (context.expect===','){
               context.expect='id'
               return context
            }
            break
          case 'eol':
            //if(token==='eol' && 
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
            //if(token==='id' && 
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
               var mod_name=context.tree[context.tree.length-1].name;
               return context
            }
            break
          case '.':
            //}else if(token==='.' && 
            if (context.expect===','){
               context.expect = 'qual'
               return context
            }
            break
          case ',':
            //}else if(token===',' && 
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
            //}else if(token==='eol' && 
            if (context.expect===','){
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
            //if($expr_starters.indexOf(token)>-1){
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
            if(token==='[') return new $SubCtx(context.parent)
            if(token==='(') return new $CallCtx(context)
            return $transition(context.parent,token,arguments[2])
        }else{
            if(context.expect===','){
               switch(context.real) {
                  case 'tuple':
                  case 'gen_expr':
                    //if((context.real==='tuple'||context.real==='gen_expr')
                    if (token===')'){
                       context.closed = true
                       if(context.real==='gen_expr'){context.intervals.push($pos)}
                       return context.parent
                    }
                    break
                  case 'list':
                  case 'list_comp':
                    //}else if((context.real==='list'||context.real==='list_comp')
                    if (token===']'){
                       context.closed = true
                       if(context.real==='list_comp'){context.intervals.push($pos)}
                       return context
                    }
                    break
                  case 'dict_or_set_comp':
                    //}else if(context.real==='dict_or_set_comp' && 
                    if (token==='}'){
                       context.intervals.push($pos)
                       return $transition(context.parent,token)
                    }
                    break
               }

               switch(token) {
                 case ',':
                   //}else if(token===','){
                   if(context.real==='tuple'){context.has_comma=true}
                   context.expect = 'id'
                   return context
                 case 'for':
                   //}else if(token==='for'){
                   // comprehension
                   if(context.real==='list'){context.real = 'list_comp'}
                   else{context.real='gen_expr'}
                   // remove names already referenced in list from the function
                   // references
                   $clear_ns(context)
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
                   //if(context.real==='tuple' && 
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
                   //}else if(context.real==='gen_expr' && 
                   if (token===')'){
                      context.closed = true
                      return $transition(context.parent,token)
                   }
                   break
                 case 'list':
                   //}else if(context.real==='list'&& 
                   if (token===']'){
                      context.closed = true
                      return context
                   }
                   break
               }// switch

               switch(token) {
                 case '=':
                   //if(token=='=' && 
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
                 case ']':
                   break
                 case ',':
                   $_SyntaxError(context,'unexpected comma inside list')
                 default:
                   //}else if(token !==')'&&token!==']'&&token!==','){
                   context.expect = ','
                   var expr = new $AbstractExprCtx(context,false)
                   return $transition(expr,token,arguments[2])
               }//switch

            }else{return $transition(context.parent,token,arguments[2])}
        }
      case 'list_comp':
        switch(token) {
          case ']':
            //if(token===']') 
            return context.parent
          case 'in':
            //if(token==='in') 
            return new $ExprCtx(context,'iterable',true)
          case 'if':
            //if(token==='if') 
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
            //if($expr_starters.indexOf(token)>-1){
            var expr = new $AbstractExprCtx(context,true)
            return $transition(expr,token,arguments[2])
          case 'op':
            //if(token==="op" && arguments[2]=='*'){
            switch(arguments[2]) {
              //if (arguments[2]=='*' || '+-~'.search(arguments[2])>-1) {
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
          case 'break':
            return new $BreakCtx(context)
          case 'def':
            return new $DefCtx(context)
          case 'for':
            return new $TargetListCtx(new $ForExpr(context))
          case 'if':
          case 'elif':
          case 'while':
            return new $AbstractExprCtx(new $ConditionCtx(context,token),false)
          case 'else':
          case 'finally':
            return new $SingleKwCtx(context,token)
          case 'try':
            return new $TryCtx(context)
          case 'except':
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
            return new $RaiseCtx(context)
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
            //if(token==='in'){ // operator not_in
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
          case 'not':
          case 'lamdba':
            //if($expr_starters.indexOf(token)>-1){
            var expr = new $AbstractExprCtx(context,false)
            return $transition(expr,token,arguments[2])
          case 'op':
            //if(token=='op' && ['+','-','~'].indexOf(arguments[2])>-1){
            var a=arguments[2]
            if ('+' == a || '-' == a || '~' == a) {
              //if(token=='op' && ['+','-','~'].indexOf(arguments[2])>-1){
              var expr = new $AbstractExprCtx(context,false)
              return $transition(expr,token,arguments[2])
            }
        }//switch
        return $transition(context.parent,token)
      case 'op':
        if(context.op===undefined){
            $_SyntaxError(context,['context op undefined '+context])
        }
        if(context.op.substr(0,5)=='unary'){
            if(context.parent.type=='assign'){
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
          case 'not':
          case 'lamdba':
            //if($expr_starters.indexOf(token)>-1){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case 'op':
            //if(token==='op' && '+-~'.search(arguments[2])>-1){
            switch(arguments[2]) {
              case '+':
              case '-':
              case '~':
                //if('+-~'.search(arguments[2])>-1){
                return new $UnaryCtx(context,arguments[2])
            }//switch
        }// switch
        return $transition(context.parent,token)
      case 'packed':
        if(token==='id') new $IdCtx(context,arguments[2]);return context.parent
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'pass':
        if(token==='eol') return context.parent
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'raise':
        switch(token) {
          case 'id':
            //if(token==='id' && 
            if (context.tree.length===0){
               return new $IdCtx(new $ExprCtx(context,'exc',false),arguments[2])
            }
            break
          case 'from':       
            //if(token=='from' && 
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
        var no_args = context.tree[0].type=='abstract_expr'
        // if 'return' has an agument inside a generator, raise a SyntaxError
        if(!no_args){
            var scope = $get_scope(context)
            if(scope.ntype=='BRgenerator'){
                $_SyntaxError(context,["'return' with argument inside generator"])
            }
            // If the function is a generator but no 'yield' has been handled
            // yet, store the information that function has a return with 
            // arguments, to throw the SyntaxError when the 'yield' is handled
            scope.has_return_with_arguments = true
        }
        return $transition(context.parent,token)
      case 'single_kw':
        if(token===':') return $BodyCtx(context)
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'star_arg':
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
            //if($expr_starters.indexOf(token)>-1){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
          case ',':
            //if(token===',') 
            return $transition(context.parent,token)
          case ')':
            //if(token===')') 
            return $transition(context.parent,token)
          case ':':
            //if(token===':' && context.parent.parent.type==='lambda'){
            if(context.parent.parent.type==='lambda'){
              return $transition(context.parent.parent,token)
            }
        } //switch
        $_SyntaxError(context,'token '+token+' after '+context)
      case 'str':
        switch(token) {
          case '[':
            //if(token==='[') 
            return new $AbstractExprCtx(new $SubCtx(context.parent),false)
          case '(':
            //if(token==='(') 
            return new $CallCtx(context)
          case 'str':
            //if(token=='str'){
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
          case 'not':
          case 'lamdba':
            //if($expr_starters.indexOf(token)>-1){
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
            //if(token==='id' && context.expect==='id'){
            if(context.expect==='id'){
              context.expect = ','
              new $IdCtx(context,arguments[2])
              return context
            }
          case '(':
          case '[':
            //}else if((token==='('||token==='[')&&context.expect==='id'){
            if(context.expect==='id'){
              context.expect = ','
              return new $TargetListCtx(context)
            }
          case ')':
          case ']':
            //}else if((token===')'||token===']')&&context.expect===','){
            if(context.expect===',') return context.parent
          case ',':
            //}else if(token===',' && context.expect==','){
            if(context.expect==','){
              context.expect='id'
              return context
            }
        } //switch

        if(context.expect===',') return $transition(context.parent,token,arguments[2])
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
            //if(['int','float','imaginary'].indexOf(token)>-1){
            // replace by real value of integer or float
            // parent of context is a $ExprCtx
            // grand-parent is a $AbstractExprCtx
            // we remove the $ExprCtx and trigger a transition 
            // from the $AbstractExpCtx with an integer or float
            // of the correct value
            var expr = context.parent
            context.parent.parent.tree.pop()
            var value = arguments[2]
            if(context.op==='-'){value="-"+value}
            else if(context.op==='~'){value=~value}
            return $transition(context.parent.parent,token,value)
          case 'id':
            //}else if(token==='id'){
            // replace by x.__neg__(), x.__invert__ or x
            context.parent.parent.tree.pop()
            var expr = new $ExprCtx(context.parent.parent,'call',false)
            var expr1 = new $ExprCtx(expr,'id',false)
            new $IdCtx(expr1,arguments[2]) // create id
            if (context.op !== '+'){
               var repl = new $AttrCtx(expr)
               if(context.op==='-'){repl.name='__neg__'}
               else{repl.name='__invert__'}
               // method is called with no argument
               var call = new $CallCtx(expr)
               // new context is the expression above the id
               return expr1
            }
            return context.parent
          case 'op':
            //}else if(token==="op" && '+-'.search(arguments[2])>-1){
            //if('+-'.search(arguments[2])>-1){
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
            //if(token==='id' && context.expect==='id'){
            if(context.expect==='id'){
              new $TargetCtx(context,arguments[2])
              context.expect='as'
              return context
            }
            if(context.expect==='alias'){
               if(context.parenth!==undefined){context.expect = ','}
               else{context.expect=':'}
               context.set_alias(arguments[2])
               return context
            }
            break
          case 'as':
            //}else if(token==='as' && context.expect==='as'
            if(context.expect==='as'
               && context.has_alias===undefined  // only one alias allowed
               && context.tree.length===1){ // if aliased, must be the only exception
                context.expect = 'alias'
                context.has_alias = true
                return context
            }
            break
          case ':':
            //}else if(token===':' && ['id','as',':'].indexOf(context.expect)>-1){
            switch(context.expect) {
              case 'id':
              case 'as':
              case ':':
               //if (context.expect=='id' || context.expect=='as' || context.expect==':') {
               return $BodyCtx(context)
            }
            break
          case '(':
            //}else if(token==='(' && context.expect==='id' && context.tree.length===0){
            if(context.expect==='id' && context.tree.length===0){
               context.parenth = true
               return context
            }
            break
          case ')':
            //}else if(token===')' && [',','as'].indexOf(context.expect)>-1){
            if (context.expect == ',' || context.expect == 'as') {
               context.expect = ':'
               return context
            }
            break
          case ',':
            //}else if(token===',' && context.parenth!==undefined &&
            if(context.parenth!==undefined && context.has_alias === undefined &&
              (context.expect == ',' || context.expect == 'as')) {
                context.expect='id'
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

$B.forbidden = ['alert','case','catch','constructor','Date','delete',
    'default','document','Error','history','function','location','Math',
    'new','null','Number','RegExp','this','throw','var','super','window']

function $tokenize(src,module,parent){
    var delimiters = [["#","\n","comment"],['"""','"""',"triple_string"],
        ["'","'","string"],['"','"',"string"],
        ["r'","'","raw_string"],['r"','"',"raw_string"]]
    var br_open = {"(":0,"[":0,"{":0}
    var br_close = {")":"(","]":"[","}":"{"}
    var br_stack = ""
    var br_pos = new Array()
    var kwdict = ["class","return","break",
        "for","lambda","try","finally","raise","def","from",
        "nonlocal","while","del","global","with",
        "as","elif","else","if","yield","assert","import",
        "except","raise","in","not","pass","with",
        "bryield" // temporary implementation of yield
        //"False","None","True","continue",
        // "and',"or","is"
        ]
    var unsupported = []
    var $indented = ['class','def','for','condition','single_kw','try','except','with']
    // from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words

    var punctuation = {',':0,':':0} //,';':0}
    var int_pattern = new RegExp("^\\d+(j|J)?")
    var float_pattern1 = new RegExp("^\\d+\\.\\d*([eE][+-]?\\d+)?(j|J)?")
    var float_pattern2 = new RegExp("^\\d+([eE][+-]?\\d+)(j|J)?")
    var hex_pattern = new RegExp("^0[xX]([0-9a-fA-F]+)")
    var octal_pattern = new RegExp("^0[oO]([0-7]+)")
    var binary_pattern = new RegExp("^0[bB]([01]+)")
    var id_pattern = new RegExp("[\\$_a-zA-Z]\\w*")
    var qesc = new RegExp('"',"g") // escape double quotes
    var sqesc = new RegExp("'","g") // escape single quotes
    
    var context = null
    var root = new $Node('module')
    root.module = module
    root.parent = parent
    root.indent = -1
    var new_node = new $Node()
    var current = root
    var name = ""
    var _type = null
    var pos = 0
    indent = null

    var lnum = 1
    while(pos<src.length){
        var flag = false
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
                    while(indent%8>0){indent++}
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
                        $_SyntaxError(context,'unexpected indent1',pos)
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
                        $_SyntaxError(context,'unexpected indent2',pos)
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
            pos += end+1;continue
        }
        // string
        if(car=='"' || car=="'"){
            var raw = context.type == 'str' && context.raw,
                bytes = false ,
                end = null;
            if(name.length>0){
                switch(name.toLowerCase()) {
                  case 'r': // raw string
                    raw = true;name=''
                    break
                  case 'u':
                    // in string literals, '\U' and '\u' escapes in raw strings 
                    // are not treated specially.
                    name = ''
                    break
                  case 'b':
                    bytes = true;name=''
                    break
                  case 'rb':
                  case 'br':
                    bytes=true;raw=true;name=''
                    break
                }
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
                            zone+='\\' //src.charAt(end);
                            escaped=true;end+=1
                        }
                    }
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
                        if(bytes){
                            context = $transition(context,'str','b'+car+string+car)
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
        if(name==""){
            if($B.re_XID_Start.exec(car)){
                name=car // identifier start
                pos++;continue
            }
        } else {
            if($B.re_XID_Continue.exec(car)){
                name+=car
                pos++;continue
            } else{
                if(kwdict.indexOf(name)>-1){
                    $pos = pos-name.length
                    if(unsupported.indexOf(name)>-1){
                        $_SyntaxError(context,"Unsupported Python keyword '"+name+"'")                    
                    }
                    // if keyword is "not", see if it is followed by "in"
                    if(name=='not'){
                        var re = /^\s+in\s+/
                        var res = re.exec(src.substr(pos))
                        if(res!==null){
                            pos += res[0].length
                            context = $transition(context,'op','not_in')
                        }else{
                            context = $transition(context,name)
                        }
                    }else{
                        context = $transition(context,name)
                    }
                } else if($oplist.indexOf(name)>-1) { // and, or
                    $pos = pos-name.length
                    context = $transition(context,'op',name)
                } else {
                    if($B.forbidden.indexOf(name)>-1){name='$$'+name}
                    $pos = pos-name.length
                    context = $transition(context,'id',name)
                }
                name=""
                continue
            }
        }
        // point, ellipsis (...)
        if(car=="."){
            //if(pos<src.length-1 && '0123456789'.indexOf(src.charAt(pos+1))>-1){
            if(pos<src.length-1 && /^\d$/.test(src.charAt(pos+1))){
                // number starting with . : add a 0 before the point
                var j = pos+1
                while(j<src.length && src.charAt(j).search(/\d/)>-1){j++}
                context = $transition(context,'float','0'+src.substr(pos,j-pos))
                pos = j
                continue
            } 
            $pos = pos
            context = $transition(context,'.')
            pos++;continue
        }
        // octal, hexadecimal, binary
        if(car==="0"){
            var res = hex_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],16))
                pos += res[0].length
                continue
            }
            var res = octal_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],8))
                pos += res[0].length
                continue
            }
            var res = binary_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],2))
                pos += res[0].length
                continue
            }
            // literal like "077" is not valid in Python3
            if(src.charAt(pos+1).search(/\d/)>-1){
                $_SyntaxError(context,('invalid literal starting with 0'))
            }
        }
        // number
        if(car.search(/\d/)>-1){
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
                    }else{context = $transition(context,'int',res[0])}
                }
            }
            pos += res[0].length
            continue
        }
        // line end
        if(car=="\n"){
            lnum++
            if(br_stack.length>0){
                // implicit line joining inside brackets
                pos++;continue
            } else {
                if(current.context.tree.length>0){
                    $pos = pos
                    context = $transition(context,'eol')
                    indent=null
                    new_node = new $Node()
                }else{
                    new_node.line_num = lnum
                }
                pos++;continue
            }
        }
        if(car in br_open){
            br_stack += car
            br_pos[br_stack.length-1] = [context,pos]
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car in br_close){
            if(br_stack==""){
                $_SyntaxError(context,"Unexpected closing bracket")
            } else if(br_close[car]!=br_stack.charAt(br_stack.length-1)){
                $_SyntaxError(context,"Unbalanced bracket")
            } else {
                br_stack = br_stack.substr(0,br_stack.length-1)
                $pos = pos
                context = $transition(context,car)
                pos++;continue
            }
        }
        if(car=="="){
            if(src.charAt(pos+1)!="="){
                $pos = pos
                context = $transition(context,'=')
                pos++;continue
            } else {
                $pos = pos
                context = $transition(context,'op','==')
                pos+=2;continue
            }
        }
        if(car in punctuation){
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car===";"){ // next instruction
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
                if(_s=='\n' || _s=='#'){ends_line=true;break
                }else if(_s==' '){pos1++}
                else{break}
            }
            if(ends_line){pos++;continue}
            new_node = new $Node()
            new_node.indent = current.indent
            new_node.line_num = lnum
            new_node.module = module
            current.parent.add(new_node)
            current = new_node
            context = new $NodeCtx(new_node)
            pos++;continue
        }
        // operators
        if($first_op_letter.indexOf(car)>-1){
            // find longest match
            var op_match = ""
            for(var op_sign in $operators){
                if(op_sign==src.substr(pos,op_sign.length) 
                    && op_sign.length>op_match.length){
                    op_match=op_sign
                }
            }
            $pos = pos
            if(op_match.length>0){
                if(op_match in $augmented_assigns){
                    context = $transition(context,'augm_assign',op_match)
                }else{
                    context = $transition(context,'op',op_match)
                }
                pos += op_match.length
                continue
            }
        }
        if(car=='\\' && src.charAt(pos+1)=='\n'){
            lnum++;pos+=2;continue
        }
        if(car=='@'){
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car!=' '&&car!=='\t'){$pos=pos;$_SyntaxError(context,'unknown token ['+car+']')}
        pos += 1
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

$B.py2js = function(src,module,parent){
    // src = Python source (string)
    // module = module name (string)
    // parent = the name of the "calling" module, eg for a list comprehension (string)
    // Returns a tree structure representing the Python source code

    var t0 = new Date().getTime()
  
    // Normalise line ends and script end
    var src = src.replace(/\r\n/gm,'\n')
    var $n=0
    var _src=src.charAt(0)
    var _src_length=src.length
    while (_src_length>$n && (_src=="\n" || _src=="\r")){
        //src = src.substr(1)
        $n++
        _src=src.charAt($n)
    }
    src = src.substr($n)
    if(src.charAt(src.length-1)!="\n"){src+='\n'}

    if(module===undefined){module='__main__'}
    // Python built-in variable __name__
    var __name__ = module
    $B.vars[module]=$B.vars[module] || {}

    $B.$py_src[module]=src
    var root = $tokenize(src,module,parent)
    root.transform()
    // add variable $globals
    var js = 'var $B=__BRYTHON__\n'
    js += 'var __builtins__ = $B.builtins, _b_=$B.builtins\n'
    js += 'var $globals = $B.vars["'+module+'"]\nvar $locals = $globals\n'
    js += 'var $s=[];\n'
    js += 'for(var $b in _b_) $s.push(\'var \' + $b +\'=_b_["\'+$b+\'"]\');\n'
    js += 'eval($s.join(";"))'

    //js += 'for(var $py_builtin in __builtins__)'
    //js += '{eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}\n'
    var new_node = new $Node()
    new $NodeJSCtx(new_node,js)
    root.insert(0,new_node)
    // module doc string
    var ds_node = new $Node()
    new $NodeJSCtx(ds_node,'var __doc__=$globals["__doc__"]='+root.doc_string)
    root.insert(1,ds_node)
    // name
    var name_node = new $Node()
    var lib_module = module
    if(module.substr(0,9)=='__main__,'){lib_module='__main__'}
    new $NodeJSCtx(name_node,'var __name__=$globals["__name__"]="'+lib_module+'"')
    root.insert(2,name_node)
    // file
    var file_node = new $Node()
    new $NodeJSCtx(file_node,'var __file__=$globals["__file__"]="'+__BRYTHON__.$py_module_path[module]+'";')
    root.insert(3,file_node)
        
    if($B.debug>0){$add_line_num(root,null,module)}
    $B.modules[module] = root
    
    if($B.debug>=2){
        var t1 = new Date().getTime()
        console.log('module '+module+' translated in '+(t1 - t0)+' ms')
    }
    return root
}

function brython(options){
    var _b_=$B.builtins
    $B.$py_src = {}
    
    // Mapping between a module name and its path (url)
    $B.$py_module_path = {}
    
    // path_hook used in py_import.js
    $B.meta_path = []

    // Maps a module name to matching module object
    // A module can be the body of a script, or the body of a block inside a
    // script, such as in exec() or in a comprehension
    $B.modules = {}

    // Maps the name of imported modules to the module object
    $B.imported = {
        __main__:{__class__:$B.$ModuleDict,__name__:'__main__'}
    }

    // Options passed to brython(), with default values
    $B.$options= {}

    // Used to compute the hash value of some objects (see 
    // py_builtin_functions.js)
    $B.$py_next_hash = -Math.pow(2,53)

    // Callback functions indexed by their name
    // Used to print a traceback if an exception is raised when the function
    // is triggered by a DOM event
    $B.callbacks = {}

    // By default, only set debug level
    if(options===undefined) options={'debug':0}
    
    // If the argument provided to brython() is a number, it is the debug 
    // level
    if(typeof options==='number') options={'debug':options}
    $B.debug = options.debug
    // set built-in variable __debug__
    _b_.__debug__ = $B.debug>0

    // For imports, default mode is to search modules of the standard library
    // using a static mapping stored in stdlib_paths.js
    // This can be disabled by setting option "static_stdlib_import" to false
    if(options.static_stdlib_import===undefined){options.static_stdlib_import=true}
    $B.static_stdlib_import = options.static_stdlib_import

    // If options has an attribute "open", it will be used by the built-in
    // function open() - see py_builtin_functions.js
    if (options.open !== undefined) _b_.$open = options.open

    // Cross-origin resource sharing
    $B.$CORS=false 
    if (options.CORS !== undefined) $B.$CORS = options.CORS

    $B.$options=options

    // Stacks for exceptions and function calls, used for exception handling
    $B.exception_stack = []
    $B.call_stack = []
    
    // Maps a Python block (module, function, class) to a Javascript object
    // mapping the names defined in this block to their value
    $B.vars = {}

    // Option to run code on demand and not all the scripts defined in a page
    // The following lines are included to allow to run brython scripts in
    // the IPython notebook using a cell magic. Have a look at
    // https://github.com/kikocorreoso/brythonmagic for more info.
    if(options.ipy_id!==undefined){
       var $elts = [];
       for(var $i=0;$i<options.ipy_id.length;$i++){
          $elts.push(document.getElementById(options.ipy_id[$i]));
       }
     }else{
        var $elts=document.getElementsByTagName('script')
    }
    
    var $scripts = document.getElementsByTagName('script')
    
    // URL of the script where function brython() is called
    var $href = $B.script_path = window.location.href
    var $href_elts = $href.split('/')
    $href_elts.pop()
    
    // URL of the directory where the script stands
    var $script_dir = $B.script_dir = $href_elts.join('/')

    // List of URLs where imported modules should be searched
    $B.path = []
    // A list can be provided as attribute of options
    if (options.pythonpath!==undefined) $B.path = options.pythonpath

    // Allow user to specify the re module they want to use as a default
    // Valid values are 'pyre' for pythons re module and 
    // 'jsre' for brythons customized re module
    // Default is for brython to guess which to use by looking at 
    // complexity of the re pattern
    if (options.re_module !==undefined) {
       if (options.re_module == 'pyre' || options.re_module=='jsre') {
          $B.$options.re=options.re
       }
    }

    // Get path of brython.js or py2js.js or brython_dist.js to determine 
    // brython_path, the url of the directory where this script stands
    // It will be used for imports :
    // - the subfolder <brython_path>/libs is used for Javascript modules
    // - <brython_path>/Lib is used for Python modules in the standard library
    // - <brython_path>/Lib/site-packages is used for 3rd party modules
    //   or packages

    for(var $i=0;$i<$scripts.length;$i++){
        var $elt = $scripts[$i]
        var $br_scripts = ['brython.js','py2js.js','brython_dist.js']
        for(var $j=0;$j<$br_scripts.length;$j++){
            var $bs = $br_scripts[$j]
            if($elt.src && $elt.src.substr($elt.src.length-$bs.length)==$bs){
                if($elt.src.length===$bs.length ||
                    $elt.src.charAt($elt.src.length-$bs.length-1)=='/'){
                        var $path = $elt.src.substr(0,$elt.src.length-$bs.length)
                        $B.brython_path = $path
                        var subpaths = ['Lib','Lib/site-packages']
                        for(var j=0;j<subpaths.length;j++){
                            var subpath = $path+subpaths[j]
                            if (!($B.path.indexOf(subpath)> -1)) {
                               $B.path.push(subpath)
                            }
                        }
                        break
                }
            }
        }
    }

    // Current script directory inserted in path for imports
    if (!($B.path.indexOf($script_dir) > -1)) $B.path.push($script_dir)

    // Get all scripts with type = text/python or text/python3 and run them
    
    for(var $i=0;$i<$elts.length;$i++){
        var $elt = $elts[$i]
        if($elt.type=="text/python"||$elt.type==="text/python3"){
        
            // Get Python source code
            var $src = null
            if($elt.src){ 
                // format <script type="text/python" src="python_script.py">
                // get source code by an Ajax call
                if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
                    var $xmlhttp=new XMLHttpRequest();
                }else{// code for IE6, IE5
                    var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                $xmlhttp.onreadystatechange = function(){
                    var state = this.readyState
                    if(state===4){
                        $src = $xmlhttp.responseText
                    }
                }
                $xmlhttp.open('GET',$elt.src,false)
                $xmlhttp.send()
                if($xmlhttp.status != 200){
                    var msg = "can't open file '"+$elt.src
                    msg += "': No such file or directory"
                    console.log(msg)
                    return
                }
                $B.$py_module_path['__main__']=$elt.src
                var $src_elts = $elt.src.split('/')
                $src_elts.pop()
                var $src_path = $src_elts.join('/')
                if ($B.path.indexOf($src_path) == -1) {
                    // insert in first position : folder /Lib with built-in modules
                    // should be the last used when importing scripts
                    $B.path.splice(0,0,$src_path)
                }
            }else{
                // Get source code inside the script element
                var $src = ($elt.innerHTML || $elt.textContent)
                $B.$py_module_path['__main__'] = $href
            }

            try{
                // Conversion of Python source code to Javascript
                var $root = $B.py2js($src,'__main__')
                var $js = $root.to_js()
                if($B.debug>1) console.log($js)

                // Run resulting Javascript
                eval($js)

                var _mod = $globals
                _mod.__class__ = __BRYTHON__.$ModuleDict
                _mod.__name__ = '__main__'
                _mod.__file__ = __BRYTHON__.$py_module_path['__main__']
                $B.imported['__main__'] = _mod
            }catch($err){
                if($B.debug>1){
                    console.log('PY2JS '+$err)
                    for(var attr in $err){
                        console.log(attr+' : '+$err[attr])
                    }
                    console.log('line info '+__BRYTHON__.line_info)
                }
                                
                // If the error was not caught by the Python runtime, build an
                // instance of a Python exception
                if($err.py_error===undefined) $err=_b_.RuntimeError($err+'')

                // Print the error traceback on the standard error stream
                var $trace = $err.__name__+': '+$err.message+'\n'+$err.info
                _b_.getattr($B.stderr,'write')($trace)
                
                // Throw the error to stop execution
                throw $err
            }
        }
    }
}
$B.$operators = $operators
$B.$Node = $Node
$B.$NodeJSCtx = $NodeJSCtx

// in case the name 'brython' is used in a Javascript library,
// we can use __BRYTHON__.brython

$B.brython = brython
                              
})(__BRYTHON__)
var brython = __BRYTHON__.brython
