// brython.js brython.info
// version [3, 3, 0, 'alpha', 0]
// implementation [3, 0, 1, 'alpha', 0]
// version compiled from commented, indented source files at github.com/brython-dev/brython
var __BRYTHON__=__BRYTHON__ ||{}
;(function($B){
var scripts=document.getElementsByTagName('script')
var this_url=scripts[scripts.length-1].src
var elts=this_url.split('/')
elts.pop()
var $path=$B.brython_path=elts.join('/')+'/'
var $href=$B.script_path=window.location.href
var $href_elts=$href.split('/')
$href_elts.pop()
var $script_dir=$B.script_dir=$href_elts.join('/')
$B.path=[$path+'Lib',$script_dir,$path+'Lib/site-packages']
$B.bound={}
$B.modules={}
$B.imported={__main__:{__class__:$B.$ModuleDict,__name__:'__main__'}}
$B.vars={}
$B.globals={}
$B.exec_stack=[]
$B.builtins={__repr__:function(){return "<module 'builtins>'"},__str__:function(){return "<module 'builtins'>"},}
$B.builtin_funcs={}
$B.__getattr__=function(attr){return this[attr]}
$B.__setattr__=function(attr,value){
if(['debug'].indexOf(attr)>-1){$B[attr]=value}
else{throw $B.builtins.AttributeError('__BRYTHON__ object has no attribute '+attr)}}
$B.language=window.navigator.userLanguage ||window.navigator.language
$B.charset=document.characterSet ||document.inputEncoding ||"utf-8"
$B.date=function(){if(arguments.length===0)return $B.JSObject(new Date())
if(arguments.length===1)return $B.JSObject(new Date(arguments[0]))
if(arguments.length===7)return $B.JSObject(new Date(arguments[0],arguments[1]-1,arguments[2],arguments[3],arguments[4],arguments[5],arguments[6]))
}
$B.has_local_storage=typeof(Storage)!=="undefined"
if($B.has_local_storage){
$B.local_storage=localStorage
$B.session_storage=sessionStorage
}
$B._indexedDB=window.indexedDB ||window.webkitIndexedDB ||window.mozIndexedDB ||window.msIndexedDB
$B.IDBTransaction=window.IDBTransaction ||window.webkitIDBTransaction
$B.IDBKeyRange=window.IDBKeyRange ||window.webkitIDBKeyRange
$B.has_indexedDB=typeof($B._indexedDB)!=="undefined"
if($B.has_indexedDB){$B.indexedDB=function(){return $B.JSObject($B._indexedDB)}}
$B.re=function(pattern,flags){return $B.JSObject(new RegExp(pattern,flags))}
$B.has_json=typeof(JSON)!=="undefined"
$B.has_websocket=(function(){try{var x=window.WebSocket;return x!==undefined}
catch(err){return false}})
})(__BRYTHON__)
__BRYTHON__.implementation=[3,0,1,'alpha',0]
__BRYTHON__.__MAGIC__="3.0.1"
__BRYTHON__.version_info=[3,3,0,'alpha',0]
__BRYTHON__.builtin_module_names=["posix","__random","_ajax","_browser","_html","_io","_jsre","_multiprocessing","_os","_posixsubprocess","_svg","_sys","_timer","_websocket","builtins","dis","hashlib","javascript","json","marshal","math","modulefinder","time","_codecs","_collections","_csv","_dummy_thread","_functools","_imp","_io","_markupbase","_random","_socket","_sre","_string","_struct","_sysconfigdata","_testcapi","_thread","_warnings","_weakref"]
__BRYTHON__.re_XID_Start=/[a-zA-Z_\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u01BA\u01BB\u01BC-\u01BF\u01C0-\u01C3\u01C4-\u0241\u0250-\u02AF\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EE\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03F5\u03F7-\u0481\u048A-\u04CE\u04D0-\u04F9\u0500-\u050F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0621-\u063A\u0640\u0641-\u064A\u066E-\u066F\u0671-\u06D3\u06D5\u06E5-\u06E6\u06EE-\u06EF\u06FA-\u06FC\u06FF]/
__BRYTHON__.re_XID_Continue=/[a-zA-Z_\u0030-\u0039\u0041-\u005A\u005F\u0061-\u007A\u00AA\u00B5\u00B7\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u01BA\u01BB\u01BC-\u01BF\u01C0-\u01C3\u01C4-\u0241\u0250-\u02AF\u02B0-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EE\u0300-\u036F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03CE\u03D0-\u03F5\u03F7-\u0481\u0483-\u0486\u048A-\u04CE\u04D0-\u04F9\u0500-\u050F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05B9\u05BB-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u0615\u0621-\u063A\u0640\u0641-\u064A\u064B-\u065E\u0660-\u0669\u066E-\u066F\u0670\u0671-\u06D3\u06D5\u06D6-\u06DC\u06DF-\u06E4\u06E5-\u06E6\u06E7-\u06E8\u06EA-\u06ED\u06EE-\u06EF\u06F0-\u06F9\u06FA-\u06FC\u06FF]/

;(function($B){var js,$pos,res,$op
var $operators={"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift","**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv","%=":"imod","&=":"iand","|=":"ior","^=":"ixor","+":"add","-":"sub","*":"mul","/":"truediv","%":"mod","&":"and","|":"or","~":"invert","^":"xor","<":"lt",">":"gt","<=":"le",">=":"ge","==":"eq","!=":"ne","or":"or","and":"and","in":"in","is":"is","not_in":"not_in","is_not":"is_not" 
}
var $oplist=[]
for(var attr in $operators){$oplist.push(attr)}
var $op_order=[['or'],['and'],['in','not_in'],['<','<=','>','>=','!=','==','is','is_not'],['|','^','&'],['>>','<<'],['+'],['-'],['*'],['/','//','%'],['unary_neg','unary_inv'],['**']
]
var $op_weight={}
var $weight=1
for(var $i=0;$i<$op_order.length;$i++){var _tmp=$op_order[$i]
for(var $j=0;$j<_tmp.length;$j++){$op_weight[_tmp[$j]]=$weight
}
$weight++
}
var $augmented_assigns={"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift","**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv","%=":"imod","&=":"iand","|=":"ior","^=":"ixor"
}
var keys=$B.keys=function(obj){var res=[]
for(var attr in obj){res.push(attr)}
res.sort()
return res
}
function clone(obj){var res=new Object()
for(var attr in obj){res[attr]=obj[attr]}
return res
}
function $_SyntaxError(C,msg,indent){var ctx_node=C
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var module=tree_node.module
var line_num=tree_node.line_num
$B.line_info=[line_num,module]
if(indent===undefined){if(msg.constructor===Array){$B.$SyntaxError(module,msg[0],$pos)}
if(msg==="Triple string end not found"){
$B.$SyntaxError(module,'invalid syntax : triple string end not found',$pos)
}
$B.$SyntaxError(module,'invalid syntax',$pos)
}else{throw $B.$IndentationError(module,msg,$pos)}}
var $first_op_letter=[],$obj={}
for(var $op in $operators)$obj[$op.charAt(0)]=1
for(var $attr in $obj)$first_op_letter.push($attr)
function $Node(type){this.type=type
this.children=[]
this.yield_atoms=[]
this.add=function(child){this.children.push(child)
child.parent=this
child.module=this.module
}
this.insert=function(pos,child){this.children.splice(pos,0,child)
child.parent=this
child.module=this.module
}
this.toString=function(){return "<object 'Node'>"}
this.show=function(indent){var res=''
if(this.type==='module'){for(var i=0;i<this.children.length;i++){res +=this.children[i].show(indent)
}
return res
}
indent=indent ||0
res +=' '.repeat(indent)
res +=this.C
if(this.children.length>0)res +='{'
res +='\n'
for(var i=0;i<this.children.length;i++){res +='['+i+'] '+this.children[i].show(indent+4)
}
if(this.children.length>0){res +=' '.repeat(indent)
res+='}\n'
}
return res
}
this.indent_str=function(indent){return ' '.repeat(indent)
}
this.to_js=function(indent){if(this.js!==undefined)return this.js
this.res=[]
this.unbound=[]
if(this.type==='module'){for(var i=0;i<this.children.length;i++){this.res.push(this.children[i].to_js())
this.children[i].js_index=this.res.length+0
}
this.js=this.res.join('')
return this.js
}
indent=indent ||0
var ctx_js=this.C.to_js()
if(ctx_js){
this.res.push(this.indent_str(indent))
this.res.push(ctx_js)
this.js_index=this.res.length+0
if(this.children.length>0)this.res.push('{')
this.res.push('\n')
for(var i=0;i<this.children.length;i++){this.res.push(this.children[i].to_js(indent+4))
this.children[i].js_index=this.res.length+0
}
if(this.children.length>0){this.res.push(this.indent_str(indent))
this.res.push('}\n')
}}
this.js=this.res.join('')
return this.js
}
this.transform=function(rank){
if(this.yield_atoms.length>0){
this.parent.children.splice(rank,1)
var offset=0
for(var i=0;i<this.yield_atoms.length;i++){
var temp_node=new $Node()
var js='$yield_value'+$loop_num
js +='='+(this.yield_atoms[i].to_js()||'None')
new $NodeJSCtx(temp_node,js)
this.parent.insert(rank+offset,temp_node)
var yield_node=new $Node()
this.parent.insert(rank+offset+1,yield_node)
var yield_expr=new $YieldCtx(new $NodeCtx(yield_node))
new $StringCtx(yield_expr,'$yield_value'+$loop_num)
var set_yield=new $Node()
set_yield.is_set_yield_value=true
js=$loop_num
new $NodeJSCtx(set_yield,js)
this.parent.insert(rank+offset+2,set_yield)
this.yield_atoms[i].to_js=(function(x){return function(){return '$yield_value'+x}})($loop_num)
$loop_num++
offset +=3
}
this.parent.insert(rank+offset,this)
this.yield_atoms=[]
return offset+1
}
if(this.type==='module'){
this.doc_string=$get_docstring(this)
var i=0
while(i<this.children.length){var offset=this.children[i].transform(i)
if(offset===undefined){offset=1}
i +=offset
}}else{var elt=this.C.tree[0],ctx_offset
if(elt.transform !==undefined){ctx_offset=elt.transform(this,rank)
}
var i=0
while(i<this.children.length){var offset=this.children[i].transform(i)
if(offset===undefined){offset=1}
i +=offset
}
if(ctx_offset===undefined){ctx_offset=1}
return ctx_offset
}}
this.get_ctx=function(){return this.C}
this.clone=function(){var res=new $Node(this.type)
for(var attr in this){res[attr]=this[attr]}
return res
}}
var $loop_id=0
function $AbstractExprCtx(C,with_commas){this.type='abstract_expr'
this.with_commas=with_commas
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(abstract_expr '+with_commas+') '+this.tree}
this.to_js=function(){if(this.type==='list')return '['+$to_js(this.tree)+']'
return $to_js(this.tree)
}}
function $AssertCtx(C){this.type='assert'
this.toString=function(){return '(assert) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.transform=function(node,rank){if(this.tree[0].type==='list_or_tuple'){
var condition=this.tree[0].tree[0]
var message=this.tree[0].tree[1]
}else{var condition=this.tree[0]
var message=null
}
var new_ctx=new $ConditionCtx(node.C,'if')
var not_ctx=new $NotCtx(new_ctx)
not_ctx.tree=[condition]
node.C=new_ctx
var new_node=new $Node()
var js='throw AssertionError("AssertionError")'
if(message !==null){js='throw AssertionError(str('+message.to_js()+'))'
}
new $NodeJSCtx(new_node,js)
node.add(new_node)
}}
function $AssignCtx(C,check_unbound){
check_unbound=check_unbound===undefined
this.type='assign'
C.parent.tree.pop()
C.parent.tree.push(this)
this.parent=C.parent
this.tree=[C]
var scope=$get_scope(this)
if(C.type=='expr' && C.tree[0].type=='call'){$_SyntaxError(C,["can't assign to function call "])
}
if(C.type=='list_or_tuple' ||
(C.type=='expr' && C.tree[0].type=='list_or_tuple')){if(C.type=='expr'){C=C.tree[0]}
for(var i=0;i<C.tree.length;i++){var assigned=C.tree[i].tree[0]
if(assigned.type=='id' && check_unbound){$B.bound[scope.id][assigned.value]=true
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){$check_unbound(assigned,scope,assigned.value)
}}else if(assigned.type=='call'){$_SyntaxError(C,["can't assign to function call"])
}}}else if(C.type=='assign'){for(var i=0;i<C.tree.length;i++){var assigned=C.tree[i].tree[0]
if(assigned.type=='id'){if(scope.ntype=='def' ||scope.ntype=='generator'){$check_unbound(assigned,scope,assigned.value)
}
$B.bound[scope.id][assigned.value]=true
}}}else{var assigned=C.tree[0]
if(assigned && assigned.type=='id'){if(!$B.globals[scope.id]||$B.globals[scope.id][assigned.value]===undefined){
var node=$get_node(this)
node.bound_before=$B.keys($B.bound[scope.id])
$B.bound[scope.id][assigned.value]=true
assigned.bound=true
if(assigned.value=='xw'){console.log(assigned+' bound '+C)}}
if(scope.ntype=='def' ||scope.ntype=='generator'){$check_unbound(assigned,scope,assigned.value)
}}}
this.toString=function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}
this.transform=function(node,rank){
var scope=$get_scope(this)
var left=this.tree[0]
while(left.type==='assign'){
var new_node=new $Node()
var node_ctx=new $NodeCtx(new_node)
node_ctx.tree=[left]
node.parent.insert(rank+1,new_node)
this.tree[0]=left.tree[1]
left=this.tree[0]
}
var left_items=null
switch(left.type){case 'expr':
if(left.tree.length>1){left_items=left.tree
}else if(left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list'){left_items=left.tree[0].tree
}else if(left.tree[0].type=='id'){
var name=left.tree[0].value
if($B.globals && $B.globals[scope.id]
&& $B.globals[scope.id][name]){void(0)
}else{left.tree[0].bound=true
}}
break
case 'target_list': 
case 'list_or_tuple':
left_items=left.tree
}
if(left_items===null){return}
var right=this.tree[1]
var right_items=null
if(right.type==='list'||right.type==='tuple'||
(right.type==='expr' && right.tree.length>1)){right_items=right.tree
}
if(right_items!==null){
if(right_items.length>left_items.length){throw Error('ValueError : too many values to unpack (expected '+left_items.length+')')
}else if(right_items.length<left_items.length){throw Error('ValueError : need more than '+right_items.length+' to unpack')
}
var new_nodes=[]
var new_node=new $Node()
new $NodeJSCtx(new_node,'void(0)')
new_nodes.push(new_node)
var new_node=new $Node()
new $NodeJSCtx(new_node,'var $temp'+$loop_num+'=[]')
new_nodes.push(new_node)
for(var i=0;i<right_items.length;i++){var js='$temp'+$loop_num+'.push('+right_items[i].to_js()+')'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
}
for(var i=0;i<left_items.length;i++){var new_node=new $Node()
new_node.id=$get_node(this).module
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i],false)
assign.tree[1]=new $JSCode('$temp'+$loop_num+'['+i+']')
new_nodes.push(new_node)
}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])
}
$loop_num++
}else{
var new_node=new $Node()
new_node.line_num=node.line_num
var js='var $right'+$loop_num+'=getattr'
js +='(iter('+right.to_js()+'),"__next__");'
new $NodeJSCtx(new_node,js)
var new_nodes=[new_node]
var rlist_node=new $Node()
js='var $rlist'+$loop_num+'=[];'
js +='while(1){try{$rlist'+$loop_num+'.push($right'
js +=$loop_num+'())}catch(err){$B.$pop_exc();break}};'
new $NodeJSCtx(rlist_node,js)
new_nodes.push(rlist_node)
var packed=null
for(var i=0;i<left_items.length;i++){var expr=left_items[i]
if(expr.type=='expr' && expr.tree[0].type=='packed'){packed=i
break
}}
var check_node=new $Node()
var min_length=left_items.length
if(packed!==null){min_length--}
js='if($rlist'+$loop_num+'.length<'+min_length+')'
js +='{throw ValueError("need more than "+$rlist'+$loop_num
js +='.length+" value" + ($rlist'+$loop_num+'.length>1 ?'
js +=' "s" : "")+" to unpack")}'
new $NodeJSCtx(check_node,js)
new_nodes.push(check_node)
if(packed==null){var check_node=new $Node()
var min_length=left_items.length
js='if($rlist'+$loop_num+'.length>'+min_length+')'
js +='{throw ValueError("too many values to unpack '
js +='(expected '+left_items.length+')")}'
new $NodeJSCtx(check_node,js)
new_nodes.push(check_node)
}
var j=0
for(var i=0;i<left_items.length;i++){var new_node=new $Node()
new_node.id=scope.id
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i],false)
var js='$rlist'+$loop_num
if(packed==null ||i<packed){js +='['+i+']'
}else if(i==packed){js +='.slice('+i+',$rlist'+$loop_num+'.length-'
js +=(left_items.length-i-1)+')'
}else{js +='[$rlist'+$loop_num+'.length-'+(left_items.length-i)+']'
}
assign.tree[1]=new $JSCode(js)
new_nodes.push(new_node)
}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])
}
$loop_num++
}}
this.to_js=function(){if(this.parent.type==='call'){
return '{$nat:"kw",name:'+this.tree[0].to_js()+',value:'+this.tree[1].to_js()+'}'
}
var left=this.tree[0]
if(left.type==='expr')left=left.tree[0]
var right=this.tree[1]
if(left.type=='attribute' ||left.type=='sub'){
var node=$get_node(this)
var res='',rvar=''
if(right.type=='expr' && right.tree[0]!==undefined &&
right.tree[0].type=='call' &&
('eval'==right.tree[0].func.value ||
'exec'==right.tree[0].func.value)){res +='var $temp'+$loop_num+'='+right.to_js()+';\n'
rvar='$temp'+$loop_num
$loop_num++
}else if(right.type=='expr' && right.tree[0]!==undefined &&
right.tree[0].type=='sub'){res +='var $temp'+$loop_num+'='+right.to_js()+';\n'
rvar='$temp'+$loop_num
}else{rvar=right.to_js()
}
if(left.type==='attribute'){
left.func='setattr'
res +=left.to_js()
left.func='getattr'
res=res.substr(0,res.length-1)
return res + ','+rvar+');None;'
}
if(left.type==='sub'){
if(Array.isArray){
function is_simple(elt){return(elt.type=='expr' &&
['int','id'].indexOf(elt.tree[0].type)>-1)
}
var exprs=[]
if(left.tree.length==1){var left_seq=left,args=[],ix=0
while(left_seq.value.type=='sub' && left_seq.tree.length==1){if(is_simple(left_seq.tree[0])){args.push('['+left_seq.tree[0].to_js()+']')
}else{exprs.push('var $temp_ix'+$loop_num+'_'+ix+'='+left_seq.tree[0].to_js())
args.push('[$temp_ix'+$loop_num+'_'+ix+']')
left_seq.tree[0]={type:'id',to_js:(function(rank){return function(){return '$temp_ix'+$loop_num+'_'+rank}})(ix)
}
ix++
}
left_seq=left_seq.value
}
if(is_simple(left_seq.tree[0])){args.unshift('['+left_seq.tree[0].to_js()+']')
}else{exprs.push('var $temp_ix'+$loop_num+'_'+ix+'='+left_seq.tree[0].to_js())
args.unshift('[$temp_ix'+$loop_num+'_'+ix+']')
ix++
}
if(left_seq.value.type!=='id'){var val='$temp_ix'+$loop_num+'_'+ix
exprs.push('var '+val+'='+left_seq.value.to_js())
}else{var val=left_seq.value.to_js()
}
res +=exprs.join(';\n')+';\n'
res +='Array.isArray('+val+') && '
res +=val+args.join('')+'!==undefined ? '
res +=val+args.join('')+'='+rvar
res +=' : '
res +='$B.$setitem('+left.value.to_js()
res +=','+left.tree[0].to_js()+','+rvar+');None;'
return res
}}
left.func='setitem' 
res +=left.to_js()
res=res.substr(0,res.length-1)
left.func='getitem' 
return res + ','+rvar+');None;'
}}
return left.to_js()+'='+right.to_js()
}}
function $AttrCtx(C){this.type='attribute'
this.value=C.tree[0]
this.parent=C
C.tree.pop()
C.tree.push(this)
this.tree=[]
this.func='getattr' 
this.toString=function(){return '(attr) '+this.value+'.'+this.name}
this.to_js=function(){return this.func+'('+this.value.to_js()+',"'+this.name+'")'
}}
function $AugmentedAssignCtx(C,op){this.type='augm_assign'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
this.op=op
this.tree=[C]
var scope=$get_scope(this)
$get_node(this).bound_before=$B.keys($B.bound[scope.id])
this.module=scope.module
this.toString=function(){return '(augm assign) '+this.tree}
this.transform=function(node,rank){var func='__'+$operators[op]+'__'
var offset=0,parent=node.parent
parent.children.splice(rank,1)
var left_is_id=this.tree[0].type=='expr' && this.tree[0].tree[0].type=='id'
var right_is_int=this.tree[1].type=='expr' && this.tree[1].tree[0].type=='int'
var right=right_is_int ? this.tree[1].tree[0].value : '$temp'
if(!right_is_int){
var new_node=new $Node()
new $NodeJSCtx(new_node,'var $temp,$left')
parent.insert(rank,new_node)
offset++
var new_node=new $Node()
new_node.id=this.module
var new_ctx=new $NodeCtx(new_node)
var new_expr=new $ExprCtx(new_ctx,'js',false)
var _id=new $RawJSCtx(new_expr,'$temp')
var assign=new $AssignCtx(new_expr)
assign.tree[1]=this.tree[1]
_id.parent=assign
parent.insert(rank+offset,new_node)
offset++
}
var prefix='',in_class=false
switch(op){case '+=':
case '-=':
case '*=':
case '/=':
if(left_is_id){var scope=$get_scope(C)
prefix='$locals'
switch(scope.ntype){case 'module':
prefix='$globals'
break
case 'def':
case 'generator':
if(scope.globals && scope.globals.indexOf(C.tree[0].value)>-1){prefix='$globals'
}
break
case 'class':
var new_node=new $Node()
new $NodeJSCtx(new_node,'var $left='+C.to_js())
parent.insert(rank+offset,new_node)
in_class=true
offset++
}}}
var left=C.tree[0].to_js()
prefix=prefix && !C.tree[0].unknown_binding
if(prefix){var left1=in_class ? '$left' : left
var new_node=new $Node()
js=right_is_int ? 'if(' : 'if(typeof $temp.valueOf()=="number" && '
js +='typeof '+left1+'.valueOf()=="number"){'
js +=right_is_int ? '(' : '(typeof $temp=="number" && '
js +='typeof '+left1+'=="number") ? '
js +=left+op+right
js +=' : (typeof '+left1+'=="number" ? '+left+op
js +=right_is_int ? right : right+'.valueOf()'
js +=' : '+left + '.value ' +op
js +=right_is_int ? right : right+'.valueOf()'
js +=');' 
js +='}'
new $NodeJSCtx(new_node,js)
parent.insert(rank+offset,new_node)
offset++
}
var aaops={'+=':'add','-=':'sub','*=':'mul'}
if(C.tree[0].type=='sub' && 
['+=','-=','*='].indexOf(op)>-1 && 
C.tree[0].tree.length==1){var js1='$B.augm_item_'+aaops[op]+'('
js1 +=C.tree[0].value.to_js()
js1 +=','+C.tree[0].tree[0].to_js()+','
js1 +=right+');None;'
var new_node=new $Node()
new $NodeJSCtx(new_node,js1)
parent.insert(rank+offset,new_node)
offset++
return
}
var new_node=new $Node()
var js=''
if(prefix){js +='else '}
js +='if(!hasattr('+C.to_js()+',"'+func+'"))'
new $NodeJSCtx(new_node,js)
parent.insert(rank+offset,new_node)
offset ++
var aa1=new $Node()
aa1.id=this.module
var ctx1=new $NodeCtx(aa1)
var expr1=new $ExprCtx(ctx1,'clone',false)
expr1.tree=C.tree
for(var i=0;i<expr1.tree.length;i++){expr1.tree[i].parent=expr1
}
var assign1=new $AssignCtx(expr1)
var new_op=new $OpCtx(expr1,op.substr(0,op.length-1))
new_op.parent=assign1
new $RawJSCtx(new_op,right)
assign1.tree.push(new_op)
expr1.parent.tree.pop()
expr1.parent.tree.push(assign1)
new_node.add(aa1)
var aa2=new $Node()
new $NodeJSCtx(aa2,'else')
parent.insert(rank+offset,aa2)
var aa3=new $Node()
var js3=C.to_js()
if(prefix){if(scope.ntype=='class'){js3='$left'}
else{js3 +='='+prefix+'["'+C.tree[0].value+'"]'}}
js3 +='=getattr('+C.to_js()
js3 +=',"'+func+'")('+right+')'
new $NodeJSCtx(aa3,js3)
aa2.add(aa3)
return offset
}
this.to_js=function(){return ''
if(this.tree[0].type=='expr' && this.tree[0].length==1
&& this.tree[0].tree[0].type=='id'){return this.tree[0].to_js()+op+this.tree[1].to_js()+';'
}else{return this.tree[0].to_js()+op+this.tree[1].to_js()+';'
}}}
function $BlockingCtx(C){console.log('blockingCtx',C)
this.type='block'
this.parent=C
this.tree=[]
this.delay=1000 
var scope=$get_scope(this)
if(!scope.is_function){$_SyntaxError(C,["'blocking' non function"])
}
var def=scope.C.tree[0]
def.type='blocking_function'
this.transform=function(node,rank){console.log('blockingctx.transform')
var setTimeout_node=new $Node()
new $NodeJSCtx(setTimeout_node,'window.setTimeout(')
var def_func_node=new $Node()
new $NodeJSCtx(def_func_node,'function()')
while(node.parent !==undefined){node=node.parent
}
for(var i=0;i<node.children.length;i++)def_func_node.add(node.children[i])
setTimeout_node.add(def_func_node)
var setTimeout_node_end=new $Node()
new $NodeJSCtx(setTimeout_node_end,')')
node.add(setTimeout_node)
node.add(setTimeout_node_end)
this.transformed=true
}
this.to_js=function(){return 'window.setTimeout(function(){'+$to_js(this.tree)+'},'+this.delay+');'
}}
function $BodyCtx(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var body_node=new $Node()
tree_node.insert(0,body_node)
return new $NodeCtx(body_node)
}
function $BreakCtx(C){
this.type='break'
this.toString=function(){return 'break '}
this.parent=C
C.tree.push(this)
var ctx_node=C
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var loop_node=tree_node.parent
while(1){if(loop_node.type==='module'){
$_SyntaxError(C,'break outside of a loop')
}else{var ctx=loop_node.C.tree[0]
var _ctype=ctx.type
if(_ctype==='for' ||(_ctype==='condition' && ctx.token==='while')){this.loop_ctx=ctx
ctx.has_break=true
break
}else if('def'==_ctype ||'generator'==_ctype ||'class'==_ctype){
$_SyntaxError(C,'break outside of a loop')
}else{loop_node=loop_node.parent
}
}
}
this.to_js=function(){return '$locals["$no_break'+this.loop_ctx.loop_num+'"]=false;break'
}}
function $CallArgCtx(C){this.type='call_arg'
this.toString=function(){return 'call_arg '+this.tree}
this.parent=C
this.start=$pos
this.tree=[]
C.tree.push(this)
this.expect='id'
this.to_js=function(){return $to_js(this.tree)}}
function $CallCtx(C){this.type='call'
this.func=C.tree[0]
if(this.func!==undefined){
this.func.parent=this
}
this.parent=C
if(C.type!='class'){C.tree.pop()
C.tree.push(this)
}else{
C.args=this
}
this.expect='id'
this.tree=[]
this.start=$pos
this.toString=function(){return '(call) '+this.func+'('+this.tree+')'}
this.to_js=function(){if(this.tree.length>0){if(this.tree[this.tree.length-1].tree.length==0){
this.tree.pop()
}}
var func_js=this.func.to_js()
if(this.func!==undefined){switch(this.func.value){case 'classmethod':
return 'classmethod('+$to_js(this.tree)+')'
case 'locals':
var scope=$get_scope(this),mod=$get_module(this)
if(scope !==null &&(scope.ntype==='def'||scope.ntype=='generator')){return 'locals("'+scope.C.tree[0].id+'","'+mod.module+'")'
}
break
case 'globals':
var module=$get_module(this).module
if(module===undefined)console.log('module undef for '+ctx_node)
return 'globals("'+module+'")'
case 'dir':
if(this.tree.length==0){
var mod=$get_module(this)
return 'dir(null,"'+mod.module+'")' 
}
break
case '$$super':
if(this.tree.length==0){
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){if(scope.parent && scope.parent.C.tree[0].type=='class'){new $IdCtx(this,scope.parent.C.tree[0].name)
}}}
if(this.tree.length==1){
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){var args=scope.C.tree[0].args
if(args.length>0){new $IdCtx(this,args[0])
}}}
break
default:
if(this.func.type=='unary'){
switch(this.func.op){case '+':
return $to_js(this.tree)
case '-':
return 'getattr('+$to_js(this.tree)+',"__neg__")()'
case '~':
return 'getattr('+$to_js(this.tree)+',"__invert__")()'
}
}
}
if(this.tree.length>-1){if($B.$blocking_function_names){var _func_name=func_js
if(_func_name.indexOf($B.$blocking_function_names)> -1){console.log("candidate blocking function.. ",_func_name)
}}
if(this.func.type=='id'){var scope=$get_scope(this)
if(this.func.is_builtin){
if($B.builtin_funcs[this.func.value]!==undefined){var res=func_js + '('
res +=(this.tree.length>0 ? $to_js(this.tree): '')
return res + ')'
}}else if($B.bound[scope.id][this.func.value]=='class'){
var res=func_js + '('
res +=(this.tree.length>0 ? $to_js(this.tree): '')
return res + ')'
}
var res='('+func_js+'.$is_func ? '
res +=func_js+' : '
res +='getattr('+func_js+',"__call__"))('
res +=(this.tree.length>0 ? $to_js(this.tree): '')
res +=')'
}else{var res='getattr('+func_js+',"__call__")('
res +=(this.tree.length>0 ? $to_js(this.tree): '')
res +=')'
}
return res
}
return 'getattr('+func_js+',"__call__")()'
}}}
function $ClassCtx(C){this.type='class'
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.toString=function(){return '(class) '+this.name+' '+this.tree+' args '+this.args}
var scope=this.scope=$get_scope(this)
this.parent.node.parent_block=scope
this.parent.node.bound={}
this.set_name=function(name){this.random=Math.random().toString(36).substr(2,8)
this.name=name
this.id=C.node.module+'-'+name
this.id +='-'+this.random
$B.bound[this.id]={}
$B.modules[this.id]=this.parent.node
this.parent.node.id=this.id
var parent_block=scope
while(parent_block.C && parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent
}
while(parent_block.C &&['def','BRgenerator'].indexOf(parent_block.C.tree[0].type)==-1){parent_block=parent_block.parent
}
this.parent.node.parent_block=parent_block
$B.vars[this.id]={}
$B.bound[this.scope.id][name]='class'
if(scope.is_function){if(scope.C.tree[0].locals.indexOf(name)==-1){scope.C.tree[0].locals.push(name)
}}}
this.transform=function(node,rank){
if(this.transformed)return
this.doc_string=$get_docstring(node)
var instance_decl=new $Node()
var js='var $locals = $B.vars["'+this.id+'"]='
if($B.debug>0){js +='{$def_line:$B.line_info}'}
else{js +='{}'}
new $NodeJSCtx(instance_decl,js)
node.insert(0,instance_decl)
var ret_obj=new $Node()
new $NodeJSCtx(ret_obj,'return $B.vars["'+this.id+'"];')
node.insert(node.children.length,ret_obj)
var run_func=new $Node()
new $NodeJSCtx(run_func,')()')
node.parent.insert(rank+1,run_func)
var prefix='$B.vars["'+this.id+'"]'
rank++
js=prefix+'.__doc__='+(this.doc_string ||'None')
var ds_node=new $Node()
new $NodeJSCtx(ds_node,js)
node.parent.insert(rank+1,ds_node)
rank++
js=prefix+'.__code__={__class__:$B.$CodeDict};None;'
var ds_node=new $Node()
new $NodeJSCtx(ds_node,js)
node.parent.insert(rank+1,ds_node)
rank++
js=prefix+'.__module__="'+$get_module(this).module+'"'
var mod_node=new $Node()
new $NodeJSCtx(mod_node,js)
node.parent.insert(rank+1,mod_node)
var scope=$get_scope(this)
js='$B.vars["'+scope.id+'"]["'+this.name+'"]'
js +='=$B.$class_constructor("'+this.name+'",$'+this.name+'_'+this.random
if(this.args!==undefined){
var arg_tree=this.args.tree,args=[],kw=[]
for(var i=0;i<arg_tree.length;i++){var _tmp=arg_tree[i]
if(_tmp.tree[0].type=='kwarg'){kw.push(_tmp.tree[0])}
else{args.push(_tmp.to_js())}}
js +=',tuple(['+args.join(',')+']),['
var _re=new RegExp('"','g')
for(var i=0;i<args.length;i++){js +='"'+args[i].replace(_re,'\\"')+'"'
if(i<args.length-1){js +=','}}
js +=']'
js+=',['
for(var i=0;i<kw.length;i++){var _tmp=kw[i]
js+='["'+_tmp.tree[0].value+'",'+_tmp.tree[1].to_js()+']'
if(i<kw.length-1){js+=','}}
js+=']'
}else{
js +=',tuple([]),[],[]'
}
js +=')'
var cl_cons=new $Node()
new $NodeJSCtx(cl_cons,js)
node.parent.insert(rank+2,cl_cons)
if(scope.ntype==='module'){js='$B.vars["'+scope.module+'"]["'
js +=this.name+'"]='+this.name
var w_decl=new $Node()
new $NodeJSCtx(w_decl,js)
}
var end_node=new $Node()
new $NodeJSCtx(end_node,'None;')
node.parent.insert(rank+3,end_node)
this.transformed=true
}
this.to_js=function(){return 'var $'+this.name+'_'+this.random+'=(function()'}}
function $CompIfCtx(C){this.type='comp_if'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comp if) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}}
function $ComprehensionCtx(C){this.type='comprehension'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comprehension) '+this.tree}
this.to_js=function(){var _i=[]
for(var j=0;j<this.tree.length;j++)_i.push(this.tree[j].start)
return _i
}}
function $CompForCtx(C){this.type='comp_for'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
this.expect='in'
C.tree.push(this)
this.toString=function(){return '(comp for) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}}
function $CompIterableCtx(C){this.type='comp_iterable'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comp iter) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}}
function $ConditionCtx(C,token){this.type='condition'
this.token=token
this.parent=C
this.tree=[]
if(token==='while'){this.loop_num=$loop_num;$loop_num++}
C.tree.push(this)
this.toString=function(){return this.token+' '+this.tree}
this.transform=function(node,rank){if(this.token=="while"){var scope=$get_scope(this)
if(scope.ntype=='BRgenerator'){this.parent.node.loop_start=this.loop_num
}
var new_node=new $Node()
var js='$locals["$no_break'
js +=this.loop_num+'"]=true'
new $NodeJSCtx(new_node,js)
node.parent.insert(rank,new_node)
return 2
}}
this.to_js=function(){var tok=this.token
if(tok==='elif'){tok='else if'}
var res=tok+'(bool('
if(tok=='while'){res +='$locals["$no_break'+this.loop_num+'"] && '}
if(this.tree.length==1){res +=$to_js(this.tree)+'))'
}else{
res +=this.tree[0].to_js()+'))'
if(this.tree[1].tree.length>0){res +='{'+this.tree[1].to_js()+'}'
}}
return res
}}
function $ContinueCtx(C){this.type='continue'
this.parent=C
C.tree.push(this)
this.toString=function(){return '(continue)'}
this.to_js=function(){return 'continue'}}
function $DecoratorCtx(C){this.type='decorator'
this.parent=C
C.tree.push(this)
this.tree=[]
this.toString=function(){return '(decorator) '+this.tree}
this.transform=function(node,rank){var func_rank=rank+1,children=node.parent.children
var decorators=[this.tree]
while(1){if(func_rank>=children.length){$_SyntaxError(C)}
else if(children[func_rank].C.tree[0].type==='decorator'){decorators.push(children[func_rank].C.tree[0].tree)
children.splice(func_rank,1)
}else{break}}
this.dec_ids=[]
for(var i=0;i<decorators.length;i++){this.dec_ids.push('$'+Math.random().toString(36).substr(2,8))
}
var obj=children[func_rank].C.tree[0]
var callable=children[func_rank].C
var res=obj.name+'=',tail=''
var scope=$get_scope(this)
var ref='$locals["'+obj.name+'"]'
res=ref+'='
var _blocking_flag=false
for(var i=0;i<decorators.length;i++){var dec=this.dec_ids[i]
res +=dec+'('
tail +=')'
}
res +=ref+tail
$B.bound[scope.id][obj.name]=true
if(_blocking_flag==true){$B.$blocking_function_names=$B.$blocking_function_names ||[]
$B.$blocking_function_names.push(obj.name)
console.log('blocking...',obj.name)
obj.$blocking=true
}
var decor_node=new $Node()
new $NodeJSCtx(decor_node,res)
node.parent.insert(func_rank+1,decor_node)
this.decorators=decorators
}
this.to_js=function(){var res=''
for(var i=0;i<this.decorators.length;i++){res +='var '+this.dec_ids[i]+'='+$to_js(this.decorators[i])+';'
}
return res
}}
function $DefCtx(C){this.type='def'
this.name=null
this.parent=C
this.tree=[]
this.locals=[]
this.yields=[]
C.tree.push(this)
this.enclosing=[]
var scope=this.scope=$get_scope(this)
var parent_block=scope
while(parent_block.C && parent_block.C.tree[0].type=='class'){parent_block=parent_block.parent
}
while(parent_block.C &&['def','BRgenerator'].indexOf(parent_block.C.tree[0].type)==-1){parent_block=parent_block.parent
}
this.parent.node.parent_block=parent_block
this.module=scope.module
this.set_name=function(name){var id_ctx=new $IdCtx(this,name)
this.name=name
this.id=this.scope.id+'-'+name
this.id +='-'+Math.random().toString(36).substr(2,8)
this.parent.node.id=this.id
$B.modules[this.id]=this.parent.node
$B.bound[this.id]={}
$B.vars[this.id]=$B.vars[this.id]||{}
$B.bound[this.scope.id][name]='def'
id_ctx.bound=true
if(scope.is_function){if(scope.C.tree[0].locals.indexOf(name)==-1){scope.C.tree[0].locals.push(name)
}}
var thisnode=this.parent.node
while(thisnode.parent_block){thisnode=thisnode.parent_block
}
var pblock=parent_block,pblocks=[pblock.id]
while(true){if(pblock.parent_block && pblock.parent_block.id!='__builtins__'){pblocks.push(pblock.parent_block.id)
pblock=pblock.parent_block
}else{break}}
var env={}
for(var i=pblocks.length;i>=0;i--){for(var attr in $B.bound[pblocks[i]]){env[attr]=pblocks[i]}}
delete env[name]
this.env=env
}
this.toString=function(){return 'def '+this.name+'('+this.tree+')'}
this.transform=function(node,rank){
if(this.transformed!==undefined)return
var scope=$get_scope(this)
this.doc_string=$get_docstring(node)
this.rank=rank 
var fglobs=this.parent.node.globals
var indent=node.indent+16
var header=$ws(indent)
if(this.name.substr(0,15)=='lambda_'+$B.lambda_magic){var pblock=$B.modules[scope.id].parent_block
if(pblock.C && pblock.C.tree[0].type=="def"){this.enclosing.push(pblock)
}}
var pnode=this.parent.node
while(pnode.parent && pnode.parent.is_def_func){this.enclosing.push(pnode.parent.parent)
pnode=pnode.parent.parent
}
var required='',required_list=[]
var defaults=[],defs=[],def_list=[],defs1=[]
var after_star=[]
var other_args=null
var other_kw=null
this.args=[]
var func_args=this.tree[1].tree
for(var i=0;i<func_args.length;i++){var arg=func_args[i]
if(arg.type==='func_arg_id'){if(arg.tree.length===0){if(other_args==null){required+='"'+arg.name+'",'
required_list.push(arg.name)
}else{after_star.push('"'+arg.name+'"')
}}else{defaults.push('"'+arg.name+'"')
def_list.push(arg.name)
defs.push(arg.name+' = '+$to_js(arg.tree))
defs1.push(arg.name+':'+$to_js(arg.tree))
}}else if(arg.type==='func_star_arg'&&arg.op==='*'){other_args='"'+arg.name+'"'}
else if(arg.type==='func_star_arg'&&arg.op==='**'){other_kw='"'+arg.name+'"'}
this.args.push(arg.name)
}
this.defs=defs
if(required.length>0)required=required.substr(0,required.length-1)
var robj=[]
for(var i=0;i<required_list.length;i++){robj.push(required_list[i]+':null')
}
robj='{'+robj.join(',')+'}'
var dobj=[]
for(var i=0;i<def_list.length;i++){dobj.push(def_list[i]+':null')
}
dobj='{'+dobj.join(',')+'}'
var nodes=[],js
var global_scope=scope
while(global_scope.parent_block.id !=='__builtins__'){global_scope=global_scope.parent_block
if(global_scope===undefined){console.log('global scope undef!!!'+this.name)}
if(global_scope.parent_block===undefined){console.log('parent undef pour '+global_scope.id)}}
var mod_name=global_scope.id
var new_node=new $Node()
var js='var $globals = $B.vars["'+mod_name+'"];' 
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
js='var $locals_id="'+this.id+'";'
if(this.type=='def'){
js +='var $locals = $B.vars[$locals_id]=new Object();'
}else{
js +='var $locals = $B.vars[$locals_id];'
}
var new_node=new $Node()
new_node.locals_def=true
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
if(defs1.length>0){js='for(var $var in $defaults){$locals[$var]=$defaults[$var]}'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
}
var passed_alias={},passed_ix=0
this.env=[]
if(this.type=='def'){var enclosing=[],passed=[]
for(var i=this.enclosing.length-1;i>=0;i--){var func=this.enclosing[i]
for(var attr in $B.bound[func.id]){if(attr!==this.name){if(func===scope && $B.bound[func.id][attr]!='arg'){continue
}
passed.push('$var'+passed_ix)
passed_alias[attr]='$var'+passed_ix
passed_ix++
enclosing.push('$B.vars["'+func.id+'"]["'+attr+'"]')
}}
for(var attr in $B.bound[func.id]){if(attr!=this.name &&($B.globals[this.id]===undefined ||
$B.globals[this.id][attr]===undefined)){if(func===scope && $B.bound[func.id][attr]!='arg'){continue
}
$B.bound[this.id][attr]=true
this.env.push(attr)
}}}
for(var i=this.enclosing.length-1;i>=0;i--){var func=this.enclosing[i]
for(var attr in $B.bound[func.id]){if(attr!==this.name &&($B.globals[this.id]===undefined ||
$B.globals[this.id][attr]===undefined)){if(func===scope && $B.bound[func.id][attr]!='arg'){continue
}
new_node=new $Node()
var js='if('+passed_alias[attr]+'!==undefined)'
js +='{$locals["'+attr+'"] = '+passed_alias[attr]+'};'
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
}}}}
this.passed_ix=passed_ix
var make_args_nodes=[]
var js='var $ns=$B.$MakeArgs1("'+this.name+'",arguments,'
js +=robj+',['+required+'],'+dobj+','
js +='['+defaults.join(',')+'],'+other_args+','+other_kw+
',['+after_star.join(',')+'])'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
make_args_nodes.push(new_node)
js='for(var $var in $ns){$locals[$var]=$ns[$var]}'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
make_args_nodes.push(new_node)
var only_positional=false
if(defaults.length==0 && other_args===null && other_kw===null &&
after_star.length==0){
only_positional=true
if($B.debug>0 ||required_list.length>0){var js='var $simple=true, $i=arguments.length;'
js +='while($i-- > 0)'
js +='{if(arguments[$i].$nat!=undefined){$simple=false;break}}'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
nodes.push(new_node)
var new_node=new $Node()
new $NodeJSCtx(new_node,'if(!$simple)')
nodes.push(new_node)
new_node.add(make_args_nodes[0])
new_node.add(make_args_nodes[1])
var else_node=new $Node()
new $NodeJSCtx(else_node,'else')
nodes.push(else_node)
}
if($B.debug>0){
js='if(arguments.length!='+required_list.length+')'
var wrong_nb_node=new $Node()
new $NodeJSCtx(wrong_nb_node,js)
else_node.add(wrong_nb_node)
if(required_list.length>0){
js='if(arguments.length<'+required_list.length+')'
js +='{var $missing='+required_list.length+'-arguments.length;'
js +='throw TypeError("'+this.name+'() missing "+$missing+'
js +='" positional argument"+($missing>1 ? "s" : "")+": "'
js +='+new Array('+required+').slice(arguments.length))}'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
wrong_nb_node.add(new_node)
js='else if'
}else{js='if'
}
js +='(arguments.length>'+required_list.length+')'
js +='{throw TypeError("'+this.name+'() takes '+required_list.length
js +=' positional argument'
js +=(required_list.length>1 ? "s" : "")
js +=' but more were given")}'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
wrong_nb_node.add(new_node)
}
for(var i=0;i<required_list.length;i++){var arg=required_list[i]
var new_node=new $Node()
var js='$locals["'+arg+'"]=$B.$JS2Py(arguments['+i+'])'
new $NodeJSCtx(new_node,js)
else_node.add(new_node)
}}else{nodes=nodes.concat(make_args_nodes)
}
for(var i=nodes.length-1;i>=0;i--)node.children.splice(0,0,nodes[i])
var def_func_node=new $Node()
new $NodeJSCtx(def_func_node,'return function()')
def_func_node.is_def_func=true
for(var i=0;i<node.children.length;i++)def_func_node.add(node.children[i])
var last_instr=node.children[node.children.length-1].C.tree[0]
if(last_instr.type!=='return' && this.type!='BRgenerator'){new_node=new $Node()
new $NodeJSCtx(new_node,'return None;')
def_func_node.add(new_node)
}
node.children=[]
node.add(def_func_node)
var ret_node=new $Node()
var txt=')('
if(this.type=='def'){txt+=enclosing.join(',')}
new $NodeJSCtx(ret_node,txt+')')
node.parent.insert(rank+1,ret_node)
var offset=2
if(this.type==='BRgenerator' && !this.declared){js='$B.$BRgenerator('
var scope_lib='$B.vars["'+scope.id+'"]'
if(scope.C===undefined){scope_lib='$globals'}
js +='"'+scope.id+'","'+this.name+'"'
js +=',"'+this.id+'"'
if(scope.ntype=='class')js +=',$B.vars["'+scope.id+'"]'
js +=')'
var gen_node=new $Node()
gen_node.id=this.module
var ctx=new $NodeCtx(gen_node)
var expr=new $ExprCtx(ctx,'id',false)
var name_ctx=new $IdCtx(expr,this.name)
var assign=new $AssignCtx(expr)
var expr1=new $ExprCtx(assign,'id',false)
var js_ctx=new $NodeJSCtx(assign,js)
expr1.tree.push(js_ctx)
node.parent.insert(rank+offset,gen_node)
this.declared=true
offset++
}
var prefix='$B.vars["'+scope.id+'"]["'+this.name+'"]'
if(scope.C===undefined){prefix='$globals["'+this.name+'"]'}
else if(scope.ntype=='def' ||scope.ntype=='BRgenerator'){prefix='$locals["'+this.name+'"]'
}
prefix=this.tree[0].to_js()
js=prefix+'.__name__="'+this.name+'"'
var name_decl=new $Node()
new $NodeJSCtx(name_decl,js)
node.parent.insert(rank+offset,name_decl)
offset++
var module=$get_module(this)
js=prefix+'.__module__ = "'+module.module+'";'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
offset++
js=prefix+'.__doc__='+(this.doc_string ||'None')+';None;'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
offset++
if(this.$blocking){console.log('blocking !!!')
new_node=new $Node()
new $NodeJSCtx(new_node,this.name+'.$blocking = true; // used in __call__')
node.parent.insert(rank+offset,new_node)
offset++
}
js=prefix+'.__code__={__class__:$B.$CodeDict};None;'
new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank+offset,new_node)
var default_node=new $Node()
var js='None'
if(defs1.length>0){js='var $defaults = {'+defs1.join(',')+'}'}
new $NodeJSCtx(default_node,js)
node.insert(0,default_node)
this.transformed=true
}
this.to_js=function(func_name){if(func_name!==undefined){return func_name+'=(function()'
}else{var scope=$get_scope(this)
var res=this.tree[0].to_js()+'=(function('
if(this.type=='def'){var args=[]
for(var i=0;i<this.passed_ix;i++){args.push('$var'+i)}
res +=args.join(',')
}
res +=')'
return res
var name=this.name
var res='$B.vars["'+scope.id+'"]'
if(scope.C===undefined){res='$globals'}
else if(scope.ntype=='def'||scope.ntype=='BRgenerator'){res='$locals'
}
res +='["'+name+'"]'
}
return res+'=(function()'
}}
function $DelCtx(C){this.type='del'
this.parent=C
C.tree.push(this)
this.tree=[]
this.toString=function(){return 'del '+this.tree}
this.to_js=function(){if(this.tree[0].type=='list_or_tuple'){var res=''
for(var i=0;i<this.tree[0].tree.length;i++){var subdel=new $DelCtx(C)
subdel.tree=[this.tree[0].tree[i]]
res +=subdel.to_js()+';'
C.tree.pop()
}
this.tree=[]
return res
}else{var expr=this.tree[0].tree[0]
var scope=$get_scope(this)
switch(expr.type){case 'id':
return 'delete '+expr.to_js()+';'
case 'list_or_tuple':
var res=''
for(var i=0;i<expr.tree.length;i++){res +='delete '+expr.tree[i].to_js()+';'
}
return res
case 'sub':
expr.func='delitem'
js=expr.to_js()
expr.func='getitem'
return js
case 'op':
$_SyntaxError(this,["can't delete operator"])
case 'call':
$_SyntaxError(this,["can't delete function call"])
case 'attribute':
return 'delattr('+expr.value.to_js()+',"'+expr.name+'")'
default:
$_SyntaxError(this,["can't delete "+expr.type])
}}}}
function $DictOrSetCtx(C){
this.type='dict_or_set'
this.real='dict_or_set'
this.expect='id'
this.closed=false
this.start=$pos
this.toString=function(){switch(this.real){case 'dict':
return '(dict) {'+this.items+'}'
case 'set':
return '(set) {'+this.tree+'}'
}
return '(dict_or_set) {'+this.tree+'}'
}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){switch(this.real){case 'dict':
var res='$B.$dict(['
for(var i=0;i<this.items.length;i+=2){res+='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'
if(i<this.items.length-2){res+=','}}
return res+'])'+$to_js(this.tree)
case 'set_comp':
return 'set('+$to_js(this.items)+')'+$to_js(this.tree)
case 'dict_comp':
var key_items=this.items[0].expression[0].to_js()
var value_items=this.items[0].expression[1].to_js()
return '$B.$dict('+$to_js(this.items)+')'+$to_js(this.tree)
}
return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)
}}
function $DoubleStarArgCtx(C){this.type='double_star_arg'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '**'+this.tree}
this.to_js=function(){return '{$nat:"pdict",arg:'+$to_js(this.tree)+'}'}}
function $ExceptCtx(C){this.type='except'
this.parent=C
C.tree.push(this)
this.tree=[]
this.expect='id'
this.toString=function(){return '(except) '}
this.set_alias=function(alias){this.tree[0].alias=alias
$B.bound[$get_scope(this).id][alias]=true
}
this.to_js=function(){
if(this.tree.length===0)return 'else'
if(this.tree.length===1 && this.tree[0].name==='Exception')return 'else if(1)'
var res='else if($B.is_exc('+this.error_name+',['
for(var i=0;i<this.tree.length;i++){res+=this.tree[i].to_js()
if(i<this.tree.length-1)res+=','
}
return res + ']))'
}}
function $ExprCtx(C,name,with_commas){this.type='expr'
this.name=name
this.with_commas=with_commas
this.expect=',' 
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(expr '+with_commas+') '+this.tree}
this.to_js=function(arg){if(this.type==='list')return '['+$to_js(this.tree)+']'
if(this.tree.length===1)return this.tree[0].to_js(arg)
return 'tuple('+$to_js(this.tree)+')'
}}
function $ExprNot(C){
this.type='expr_not'
this.toString=function(){return '(expr_not)'}
this.parent=C
this.tree=[]
C.tree.push(this)
}
function $FloatCtx(C,value){this.type='float'
this.value=value
this.toString=function(){return 'float '+this.value}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'float('+this.value+')'}}
function $ForExpr(C){this.type='for'
this.parent=C
this.tree=[]
C.tree.push(this)
this.loop_num=$loop_num
this.module=$get_scope(this).module
$loop_num++
this.toString=function(){return '(for) '+this.tree}
this.transform=function(node,rank){var scope=$get_scope(this)
var mod_name=scope.module
var target=this.tree[0]
var iterable=this.tree[1]
var num=this.loop_num
var $range=false
if(target.tree.length==1 &&
iterable.type=='expr' &&
iterable.tree[0].type=='expr' &&
iterable.tree[0].tree[0].type=='call'){var call=iterable.tree[0].tree[0]
if(call.func.type=='id'){var func_name=call.func.value
if(func_name=='range' && call.tree.length<3){$range=call
}}}
var new_nodes=[]
var children=node.children
var offset=1
if($range && scope.ntype!='BRgenerator'){if(this.has_break){
new_node=new $Node()
var js='$locals["$no_break'+num+'"]=true'
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
}
var range_is_builtin=false
if(!scope.blurred){var _scope=$get_scope(this),found=[]
while(true){if($B.bound[_scope.id]['range']){found.push(_scope.id)}
if(_scope.parent_block){_scope=_scope.parent_block}
else{break}}
range_is_builtin=found.length==1 && found[0]=="__builtins__"
if(found==['__builtins__']){range_is_builtin=true}}
var test_range_node=new $Node()
if(range_is_builtin){new $NodeJSCtx(test_range_node,'if(true)')
}else{new $NodeJSCtx(test_range_node,'if('+call.func.to_js()+'===$B.builtins.range)')
}
new_nodes.push(test_range_node)
var idt=target.to_js()
if($range.tree.length==1){var start=0,stop=$range.tree[0].to_js()
}else{var start=$range.tree[0].to_js(),stop=$range.tree[1].to_js()
}
var js=idt+'=('+start+')-1;while('+idt+'++ < ('+stop+')-1)'
var for_node=new $Node()
new $NodeJSCtx(for_node,js)
for(var i=0;i<children.length;i++){for_node.add(children[i].clone())
}
var in_loop=false
if(scope.ntype=='module'){var pnode=node.parent
while(pnode){if(pnode.for_wrapper){in_loop=true;break}
pnode=pnode.parent
}}
if(scope.ntype=='module' && !in_loop){var func_node=new $Node()
func_node.for_wrapper=true
js='function $f'+num+'('
if(this.has_break){js +='$no_break'+num}
js +=')'
new $NodeJSCtx(func_node,js)
test_range_node.add(func_node)
func_node.add(for_node)
if(this.has_break){new_node=new $Node()
new $NodeJSCtx(new_node,'return $no_break'+num)
func_node.add(new_node)
}
var end_func_node=new $Node()
new $NodeJSCtx(end_func_node,'var $res'+num+'=$f'+num+'($globals);')
test_range_node.add(end_func_node)
if(this.has_break){var no_break=new $Node()
new $NodeJSCtx(no_break,'$no_break'+num+'=$res'+num)
test_range_node.add(no_break)
}}else{
test_range_node.add(for_node)
}
if(range_is_builtin){node.parent.children.splice(rank,1)
var k=0
if(this.has_break){node.parent.insert(rank,new_nodes[0])
k++
}
for(var i=new_nodes[k].children.length-1;i>=0;i--){node.parent.insert(rank+k,new_nodes[k].children[i])
}
node.children=[]
return 0
}
var else_node=new $Node()
new $NodeJSCtx(else_node,'else')
new_nodes.push(else_node)
for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank+1,new_nodes[i])
}
this.test_range=true
new_nodes=[]
}
var new_node=new $Node()
var js='$locals["$next'+num+'"]'
js +='=getattr(iter('+iterable.to_js()+'),"__next__");\n'
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
if(this.has_break){
new_node=new $Node()
var js='$locals["$no_break'+num+'"]=true'
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
}
var while_node=new $Node()
if(this.has_break){js='while($locals["$no_break'+num+'"])'}
else{js='while(true)'}
new $NodeJSCtx(while_node,js)
while_node.C.loop_num=num 
if(scope.ntype=='BRgenerator'){
while_node.loop_start=num
}
new_nodes.push(while_node)
node.parent.children.splice(rank,1)
if(this.test_range){for(var i=new_nodes.length-1;i>=0;i--){else_node.insert(0,new_nodes[i])
}}else{for(var i=new_nodes.length-1;i>=0;i--){node.parent.insert(rank,new_nodes[i])
offset +=new_nodes.length
}}
var try_node=new $Node()
new $NodeJSCtx(try_node,'try')
while_node.add(try_node)
var iter_node=new $Node()
iter_node.parent=$get_node(this).parent
iter_node.id=this.module
var C=new $NodeCtx(iter_node)
var target_expr=new $ExprCtx(C,'left',true)
target_expr.tree=target.tree
var assign=new $AssignCtx(target_expr)
assign.tree[1]=new $JSCode('$locals["$next'+num+'"]()')
try_node.add(iter_node)
var catch_node=new $Node()
var js='catch($err){if($B.is_exc($err,[StopIteration]))'
js +='{$B.$pop_exc();'
js +='delete $locals["$next'+num+'"];break}'
js +='else{throw($err)}}' 
new $NodeJSCtx(catch_node,js)
while_node.add(catch_node)
for(var i=0;i<children.length;i++){while_node.add(children[i].clone())
}
node.children=[]
return 0
}
this.to_js=function(){var iterable=this.tree.pop()
return 'for '+$to_js(this.tree)+' in '+iterable.to_js()
}}
function $FromCtx(C){this.type='from'
this.parent=C
this.module=''
this.names=[]
this.aliases={}
C.tree.push(this)
this.expect='module'
this.scope=$get_scope(this)
this.add_name=function(name){this.names.push(name)
if(name=='*'){this.scope.blurred=true}}
this.bind_names=function(){
var scope=$get_scope(this)
for(var i=0;i<this.names.length;i++){var name=this.aliases[i]||this.names[i]
$B.bound[scope.id][name]=true
}}
this.toString=function(){var res='(from) '+this.module+' (import) '+this.names 
return res + '(as)' + this.aliases
}
this.to_js=function(){var scope=$get_scope(this)
var mod=$get_module(this).module
if(mod.substr(0,13)==='__main__,exec'){mod='__main__'}
var path=$B.$py_module_path[mod]
var elts=path.split('/')
elts.pop()
path=elts.join('/')
var res=''
var indent=$get_node(this).indent
var head=' '.repeat(indent)
if(this.module.charAt(0)=='.'){
var parent_module=$get_module(this).module
var package=$B.imported[parent_module].__package__
var nbdots=1
while(nbdots<this.module.length && 
this.module.charAt(nbdots)=='.'){nbdots++}
var p_elts=package.split('.')
while(nbdots>1){p_elts.pop();nbdots--}
package=p_elts.join('.')
if(nbdots==this.module.length){
for(var i=0;i<this.names.length;i++){var mod_name=this.names[i]
if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
var qname=package+'.'+mod_name
res +='$B.$import("'+qname+'","'+parent_module+'");'
var _sn=scope.ntype
if('def'==_sn ||'class'==_sn ||'module'==_sn){res +='var '
}
var alias=this.aliases[this.names[i]]||this.names[i]
res +=alias
if(scope.ntype=='def'){res +='=$locals["'+alias+'"]'
}else if(scope.ntype=='module'){res +='=$globals["'+alias+'"]'
}
res +='=$B.imported["'+qname+'"];\n'
}}else{var mod_name=this.module.substr(nbdots)
if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
var qname=package+'.'+mod_name
res +='$B.$import("'+qname+'","'+parent_module+'");'
res +='var $mod=$B.imported["'+qname+'"];'
if(this.names[0]=='*'){res +=head+'for(var $attr in $mod){\n'
res +="if($attr.substr(0,1)!=='_')\n"+head+"{var $x = 'var '+$attr+'"
if(scope.ntype==="module"){res +='=$B.vars["'+scope.module+'"]["'+"'+$attr+'"+'"]'
}
res +='=$mod["'+"'+$attr+'"+'"]'+"'"+'\n'+head+'eval($x)}}'
console.log(scope.id+' blurred')
scope.blurred=true
}else{
switch(scope.ntype){case 'def':
for(var i=0;i<this.names.length;i++){var alias=this.aliases[this.names[i]]||this.names[i]
res+='$locals["'+alias+'"]'
res +='=getattr($mod,"'+this.names[i]+'")\n'
}
break
case 'class':
for(var i=0;i<this.names.length;i++){var name=this.names[i]
var alias=this.aliases[name]||name
res+='$locals["' + alias+'"]'
res +='=getattr($mod,"'+ name +'")\n'
}
break
case 'module':
for(var i=0;i<this.names.length;i++){var name=this.names[i]
var alias=this.aliases[name]||name
res+='$globals["'+alias+'"]'
res +='=getattr($mod,"'+ name +'")\n'
}
break
default:
for(var i=0;i<this.names.length;i++){var name=this.names[i]
var alias=this.aliases[name]||name
res +='$locals["'+alias +'"]=getattr($mod,"'+ names +'")\n'
}}}}}else{if(this.names[0]=='*'){res +='$B.$import("'+this.module+'","'+mod+'")\n'
res +=head+'var $mod=$B.imported["'+this.module+'"]\n'
res +=head+'for(var $attr in $mod){\n'
res +="if($attr.substr(0,1)!=='_'){\n"+head 
res +='$B.vars["'+scope.module+'"][$attr]'
res +='=$mod[$attr]\n'+head+'}}'
scope.blurred=true
}else{res +='$B.$import_from("'+this.module+'",['
res +='"' + this.names.join('","')+ '"'
res +='],"'+mod+'");\n'
var _is_module=scope.ntype==='module'
for(var i=0;i<this.names.length;i++){var name=this.names[i]
var alias=this.aliases[name]||name
res +=head+'try{$locals["'+ alias+'"]'
res +='=getattr($B.imported["'+this.module+'"],"'+name+'")}\n'
res +='catch($err'+$loop_num+'){if($err'+$loop_num+'.__class__'
res +='===AttributeError.$dict){$err'+$loop_num+'.__class__'
res +='=ImportError.$dict};throw $err'+$loop_num+'};'
}}}
return res + '\n'+head+'None;'
}}
function $FuncArgs(C){this.type='func_args'
this.parent=C
this.tree=[]
this.names=[]
C.tree.push(this)
this.toString=function(){return 'func args '+this.tree}
this.expect='id'
this.has_default=false
this.has_star_arg=false
this.has_kw_arg=false
this.to_js=function(){return $to_js(this.tree)}}
function $FuncArgIdCtx(C,name){
this.type='func_arg_id'
this.name=name
this.parent=C
var node=$get_node(this)
if($B.bound[node.id][name]){$_SyntaxError(C,["duplicate argument '"+name+"' in function definition"])
}
$B.bound[node.id][name]='arg'
this.tree=[]
C.tree.push(this)
var ctx=C
while(ctx.parent!==undefined){if(ctx.type==='def'){ctx.locals.push(name)
break
}
ctx=ctx.parent
}
this.toString=function(){return 'func arg id '+this.name +'='+this.tree}
this.expect='='
this.to_js=function(){return this.name+$to_js(this.tree)}}
function $FuncStarArgCtx(C,op){this.type='func_star_arg'
this.op=op
this.parent=C
this.node=$get_node(this)
if(op=='*'){C.has_star_arg=true}
else if(op=='**'){C.has_kw_arg=true}
C.tree.push(this)
this.set_name=function(name){this.name=name
if(name=='$dummy'){return}
if($B.bound[this.node.id][name]){$_SyntaxError(C,["duplicate argument '"+name+"' in function definition"])
}
$B.bound[this.node.id][name]='arg'
var ctx=C
while(ctx.parent!==undefined){if(ctx.type==='def'){ctx.locals.push(name)
break
}
ctx=ctx.parent
}}
this.toString=function(){return '(func star arg '+this.op+') '+this.name}}
function $GlobalCtx(C){this.type='global'
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.toString=function(){return 'global '+this.tree}
this.scope=$get_scope(this)
$B.globals=$B.globals ||{}
$B.globals[this.scope.id]=$B.globals[this.scope.id]||{}
this.add=function(name){$B.globals[this.scope.id][name]=true
}
this.to_js=function(){return ''}}
function $check_unbound(assigned,scope,varname){
if(scope.var2node && scope.var2node[varname]){if(scope.C.tree[0].locals.indexOf(varname)>-1)return
for(var i=0;i<scope.var2node[varname].length;i++){var ctx=scope.var2node[varname][i]
if(ctx==assigned){delete scope.var2node[varname]
break
}else{while(ctx.parent){ctx=ctx.parent}
var ctx_node=ctx.node
var pnode=ctx_node.parent
for(var rank=0;rank<pnode.children.length;rank++){if(pnode.children[rank]===ctx_node){break}}
var new_node=new $Node()
var js='throw UnboundLocalError("local variable '+"'"
js +=varname+"'"+' referenced before assignment")'
if(ctx.tree[0].type=='condition' && 
ctx.tree[0].token=='elif'){js='else if(1){'+js+'}'
}
new $NodeJSCtx(new_node,js)
pnode.insert(rank,new_node)
}}}
if(scope.C.tree[0].locals.indexOf(varname)==-1){scope.C.tree[0].locals.push(varname)
}}
function $IdCtx(C,value){this.type='id'
this.toString=function(){return '(id) '+this.value+':'+(this.tree||'')}
this.value=value
this.parent=C
this.tree=[]
C.tree.push(this)
if(C.parent.type==='call_arg')this.call_arg=true
this.scope=$get_scope(this)
this.blurred_scope=this.scope.blurred
this.env=clone($B.bound[this.scope.id])
var ctx=C
while(ctx.parent!==undefined){switch(ctx.type){case 'list_or_tuple':
case 'dict_or_set':
case 'call_arg':
case 'def':
case 'lambda':
if(ctx.vars===undefined){ctx.vars=[value]}
else if(ctx.vars.indexOf(value)===-1){ctx.vars.push(value)}
if(this.call_arg&&ctx.type==='lambda'){if(ctx.locals===undefined){ctx.locals=[value]}
else{ctx.locals.push(value)}}}
ctx=ctx.parent
}
var scope=$get_scope(this)
if(C.type=='target_list'){
$B.bound[scope.id][value]=true
this.bound=true
}
if(scope.ntype=='def' ||scope.ntype=='generator'){
var _ctx=this.parent
while(_ctx){if(_ctx.type=='list_or_tuple' && _ctx.is_comp())return
_ctx=_ctx.parent
}
if(C.type=='target_list'){if(C.parent.type=='for'){
$check_unbound(this,scope,value)
}else if(C.parent.type=='comp_for'){
var comprehension=C.parent.parent.parent
if(comprehension.parent && comprehension.parent.type=='call_arg'){
comprehension=comprehension.parent
}
var remove=[]
if(scope.var2node && scope.var2node[value]){for(var i=0;i<scope.var2node[value].length;i++){var ctx=scope.var2node[value][i]
while(ctx.parent){if(ctx===comprehension.parent){remove.push(i)
break
}
ctx=ctx.parent
}}}
for(var i=remove.length-1;i>=0;i--){scope.var2node[value].splice(i,1)
}}}else if(C.type=='expr' && C.parent.type=='comp_if'){
return
}else if(C.type=='global'){if(scope.globals===undefined){scope.globals=[value]
}else if(scope.globals.indexOf(value)==-1){scope.globals.push(value)
}}else if(scope.globals===undefined ||scope.globals.indexOf(value)==-1){
if(scope.var2node===undefined){scope.var2node={}
scope.var2node[value]=[this]
}else if(scope.var2node[value]===undefined){scope.var2node[value]=[this]
}else{scope.var2node[value].push(this)
}}}
this.to_js=function(arg){var val=this.value
switch(val){case 'eval':
val='$'+val
break
case 'locals':
case 'globals':
if(this.parent.type==='call'){var scope=$get_scope(this)
if(scope.ntype==="module"){new $StringCtx(this.parent,'"__main__"')}
else{var locals=scope.C.tree[0].locals
var res='{'
for(var i=0;i<locals.length;i++){res+="'"+locals[i]+"':"+locals[i]
if(i<locals.length-1)res+=','
}
new $StringCtx(this.parent,res+'}')
}}}
if(val=='__BRYTHON__' ||val=='$B'){return val}
var innermost=$get_scope(this)
var scope=innermost,found=[],module=scope.module
var gs=innermost
while(gs.parent_block && gs.parent_block.id!=='__builtins__'){gs=gs.parent_block
}
while(true){if($B.bound[scope.id]===undefined){console.log('name '+val+' undef '+scope.id)}
if($B.globals[scope.id]!==undefined &&
$B.globals[scope.id][val]!==undefined){found=[gs]
break
}
if(scope===innermost){
var bound_before=$get_node(this).bound_before
if(bound_before && !this.bound){if(bound_before.indexOf(val)>-1){found.push(scope)}
else if(scope.C &&
scope.C.tree[0].type=='def' &&
scope.C.tree[0].env.indexOf(val)>-1){found.push(scope)
}}else{if($B.bound[scope.id][val]){found.push(scope)}}}else{if($B.bound[scope.id][val]){found.push(scope)}}
if(scope.parent_block){scope=scope.parent_block}
else{break}}
if(found.length>0){if(found.length>1 && found[0].C){if(found[0].C.tree[0].type=='class' && !this.bound){var bound_before=$get_node(this).bound_before,res
if(bound_before){if(bound_before.indexOf(val)>-1){res='$B.vars["'+found[0].id+'"]'
}else{res='$B.vars["'+found[1].id+'"]'
}
return res+'["'+val+'"]'
}else{
var res='$B.vars["'+found[0].id+'"]'
res +='["'+val+'"]!==undefined ? '
res +='$B.vars["'+found[0].id+'"]'
res +='["'+val+'"] : '
res +='$B.vars["'+found[1].id+'"]'
res +='["'+val+'"]'
return res
}}}
scope=found[0]
if(scope.C===undefined){if(scope.id=='__builtins__'){if(gs.blurred){var val1='($B.vars["'+gs.id+'"]["'+val+'"]'
val1 +='|| $B.builtins["'+val+'"])'
val=val1
}else{val='$B.builtins["'+val+'"]'
this.is_builtin=true
}}else if(scope.id==scope.module){if(!this.bound && scope===innermost && this.env[val]===undefined){return '$B.$NameError("'+val+'")'
}
val='$globals["'+val+'"]'
}
else if(scope===innermost){val='$locals["'+val+'"]'}
else{val='$B.vars["'+scope.id+'"]["'+val+'"]'}}else if(scope===innermost){if($B.globals[scope.id]&& $B.globals[scope.id][val]){val='$globals["'+val+'"]'}
else{val='$locals["'+val+'"]'}}else{val='$B.vars["'+scope.id+'"]["'+val+'"]'
}
var res=val+$to_js(this.tree,'')
return res
}else{
this.unknown_binding=true
return '$B.$search("'+val+'","'+gs.id+'")'
}}}
function $ImaginaryCtx(C,value){this.type='imaginary'
this.value=value
this.toString=function(){return 'imaginary '+this.value}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'complex(0,'+this.value+')'}}
function $ImportCtx(C){this.type='import'
this.toString=function(){return 'import '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.bind_names=function(){
var scope=$get_scope(this)
for(var i=0;i<this.tree.length;i++){if(this.tree[i].name==this.tree[i].alias){var name=this.tree[i].name
var parts=name.split('.')
if(parts.length==1){$B.bound[scope.id][name]=true}}else{$B.bound[scope.id][this.tree[i].alias]=true
}}}
this.to_js=function(){var scope=$get_scope(this)
var mod=$get_module(this).module
if(mod.substr(0,13)==='__main__,exec'){mod='__main__'}
var path=$B.$py_module_path[mod]
var elts=path.split('/')
elts.pop()
path=elts.join('/')
var res=''
for(var i=0;i<this.tree.length;i++){res +='$B.$import('+this.tree[i].to_js()+',"'+mod+'");'
if(this.tree[i].name==this.tree[i].alias){var parts=this.tree[i].name.split('.')
for(var j=0;j<parts.length;j++){var key=parts.slice(0,j+1).join('.')
var alias=key
if(j==parts.length-1){alias=this.tree[i].alias ||alias}
if(alias.search(/\./)==-1){res +='var '}
res +=alias
if(j==0){if(scope.is_function){res +='=$locals["'+alias+'"]'
}else if(scope.ntype==="module"){res +='=$globals["'+alias+'"]'
}}
res +='=$B.vars["'+key+'"];'
}}else{res +='$locals["'+this.tree[i].alias
res +='"]=$B.vars["'+this.tree[i].name+'"];'
}}
return res + 'None;'
}}
function $ImportedModuleCtx(C,name){this.type='imported module'
this.toString=function(){return ' (imported module) '+this.name}
this.parent=C
this.name=name
this.alias=name
C.tree.push(this)
this.to_js=function(){return '"'+this.name+'"'}}
function $IntCtx(C,value){this.type='int'
this.value=value
this.toString=function(){return 'int '+this.value}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return this.value}}
function $JSCode(js){this.js=js
this.toString=function(){return this.js}
this.to_js=function(){return this.js}}
function $KwArgCtx(C){this.type='kwarg'
this.toString=function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}
this.parent=C.parent
this.tree=[C.tree[0]]
C.parent.tree.pop()
C.parent.tree.push(this)
var value=this.tree[0].value
var ctx=C
while(ctx.parent!==undefined){switch(ctx.type){case 'list_or_tuple':
case 'dict_or_set':
case 'call_arg':
case 'def':
case 'lamdba':
if(ctx.kwargs===undefined){ctx.kwargs=[value]}
else if(ctx.kwargs.indexOf(value)===-1){ctx.kwargs.push(value)}}
ctx=ctx.parent
}
var scope=$get_scope(this)
if(scope.ntype=='def' ||scope.ntype=='generator'){var ix=null,varname=C.tree[0].value
if(scope.var2node[varname]!==undefined){for(var i=0;i<scope.var2node[varname].length;i++){if(scope.var2node[varname][i]==C.tree[0]){ix=i
break
}}
scope.var2node[varname].splice(ix,1)
}}
this.to_js=function(){var key=this.tree[0].value
if(key.substr(0,2)=='$$'){key=key.substr(2)}
var res='{$nat:"kw",name:"'+key+'",'
res +='value:'+$to_js(this.tree.slice(1,this.tree.length))+'}'
return res
}}
function $LambdaCtx(C){this.type='lambda'
this.toString=function(){return '(lambda) '+this.args_start+' '+this.body_start}
this.parent=C
C.tree.push(this)
this.tree=[]
this.args_start=$pos+6
this.vars=[]
this.locals=[]
this.to_js=function(){var module=$get_module(this).module
var scope=$get_scope(this)
var src=$B.$py_src[module]
var qesc=new RegExp('"',"g")
var args=src.substring(this.args_start,this.body_start).replace(qesc,'\\"')
var body=src.substring(this.body_start+1,this.body_end).replace(qesc,'\\"')
body=body.replace(/\n/g,' ')
var res='$B.$lambda($locals,"'+scope.module+'","'
res +=scope.id+'","'+args+'","'+body+'")'
return res
}}
function $ListOrTupleCtx(C,real){
this.type='list_or_tuple'
this.start=$pos
this.real=real
this.expect='id'
this.closed=false
this.toString=function(){switch(this.real){case 'list':
return '(list) ['+this.tree+']'
case 'list_comp':
case 'gen_expr':
return '('+this.real+') ['+this.intervals+'-'+this.tree+']'
default: 
return '(tuple) ('+this.tree+')'
}}
this.parent=C
this.tree=[]
C.tree.push(this)
this.is_comp=function(){switch(this.real){case 'list_comp':
case 'gen_expr':
case 'dict_or_set_comp':
return true
}
return false
}
this.get_src=function(){
var scope=$get_scope(this)
var ident=scope.id
while($B.$py_src[ident]===undefined && $B.modules[ident].parent_block){ident=$B.modules[ident].parent_block.id
}
if($B.$py_src[ident]===undefined){
return $B.$py_src[scope.module]
}
return $B.$py_src[ident]
}
this.to_js=function(){var scope=$get_scope(this)
switch(this.real){case 'list':
return 'list(['+$to_js(this.tree)+'])'
case 'list_comp':
case 'gen_expr':
case 'dict_or_set_comp':
var src=this.get_src()
var res1='$B.$mkdict($globals,$locals)'
var res2=''
var qesc=new RegExp('"',"g")
for(var i=1;i<this.intervals.length;i++){var txt=src.substring(this.intervals[i-1],this.intervals[i])
var lines=txt.split('\n')
res2 +='['
for(var j=0;j<lines.length;j++){var txt=lines[j]
if(txt.replace(/ /g,'').length==0){continue}
txt=txt.replace(/\n/g,' ')
txt=txt.replace(/\\/g,'\\\\')
txt=txt.replace(qesc,'\\"')
res2 +='"'+txt+'",'
}
res2 +=']'
if(i<this.intervals.length-1){res2+=','}}
if(this.real==='list_comp'){res1='"'+scope.id+'"'
var res='$B.$list_comp("'+scope.module+'",'
res +='$locals_id,'+res2+')'
return res
}
if(this.real==='dict_or_set_comp'){res1='"'+scope.id+'"'
var res=res1+','+res2
if(this.expression.length===1){var res='$B.$gen_expr("'+scope.module+'",'
res +='$locals_id,'+res2+')'
return res
}
var res='$B.$dict_comp("'+scope.module+'",'
res +='$locals_id,'+res2+')'
return res
}
return '$B.$gen_expr("'+scope.module+'",'+'$locals_id,'+res2+')'
case 'tuple':
if(this.tree.length===1 && this.has_comma===undefined)return this.tree[0].to_js()
return 'tuple(['+$to_js(this.tree)+'])'
}}}
function $NodeCtx(node){this.node=node
node.C=this
this.tree=[]
this.type='node'
var scope=null
var tree_node=node
while(tree_node.parent && tree_node.parent.type!=='module'){var ntype=tree_node.parent.C.tree[0].type
if(['def','class','BRgenerator'].indexOf(ntype)>-1){scope=tree_node.parent
break
}
tree_node=tree_node.parent
}
if(scope==null){scope=tree_node.parent ||tree_node 
}
this.toString=function(){return 'node '+this.tree}
this.to_js=function(){if(this.tree.length>1){var new_node=new $Node()
var ctx=new $NodeCtx(new_node)
ctx.tree=[this.tree[1]]
new_node.indent=node.indent+4
this.tree.pop()
node.add(new_node)
}
if(node.children.length==0){return $to_js(this.tree)+';'}
return $to_js(this.tree)
}}
function $NodeJSCtx(node,js){
this.node=node
node.C=this
this.type='node_js'
this.tree=[js]
this.toString=function(){return 'js '+js}
this.to_js=function(){return js}}
function $NonlocalCtx(C){
this.type='global'
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.toString=function(){return 'global '+this.tree}
this.scope=$get_scope(this)
if(this.scope.C===undefined){$_SyntaxError(C,["nonlocal declaration not allowed at module level"])
}
this.add=function(name){if($B.bound[this.scope.id][name]=='arg'){$_SyntaxError(C,["name '"+name+"' is parameter and nonlocal"])
}
var pscope=this.scope.parent_block
if(pscope.C===undefined){$_SyntaxError(C,["no binding for nonlocal '"+name+"' found"])
}else if($B.bound[pscope.id][name]===undefined){$_SyntaxError(C,["no binding for nonlocal '"+name+"' found"])
}
if(this.scope.globals.indexOf(name)==-1){this.scope.globals.push(name)}}
this.to_js=function(){return ''}}
function $NotCtx(C){this.type='not'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return 'not ('+this.tree+')'}
this.to_js=function(){return '!bool('+$to_js(this.tree)+')'}}
function $OpCtx(C,op){
this.type='op'
this.op=op
this.toString=function(){return '(op '+this.op+') ['+this.tree+']'}
this.parent=C.parent
this.tree=[C]
C.parent.tree.pop()
C.parent.tree.push(this)
this.to_js=function(){var comps={'==':'eq','!=':'ne','>=':'ge','<=':'le','<':'lt','>':'gt'}
if(comps[this.op]!==undefined){var method=comps[this.op]
if(this.tree[0].type=='expr' && this.tree[1].type=='expr'){var t0=this.tree[0].tree[0],t1=this.tree[1].tree[0]
switch(t1.type){case 'int':
switch(t0.type){case 'int':
return t0.to_js()+this.op+t1.to_js()
case 'str':
return '$B.$TypeError("unorderable types: int() < str()")'
case 'id':
var res='typeof '+t0.to_js()+'=="number" ? '
res +=t0.to_js()+this.op+t1.to_js()+' : '
res +='getattr('+this.tree[0].to_js()
res +=',"__'+method+'__")('+this.tree[1].to_js()+')'
return res
}
break
case 'str':
switch(t0.type){case 'str':
return t0.to_js()+this.op+t1.to_js()
case 'int':
return '$B.$TypeError("unorderable types: str() < int()")'
case 'id':
var res='typeof '+t0.to_js()+'=="string" ? '
res +=t0.to_js()+this.op+t1.to_js()+' : '
res +='getattr('+this.tree[0].to_js()
res +=',"__'+method+'__")('+this.tree[1].to_js()+')'
return res
}
break
case 'id':
if(t0.type=='id'){var res='typeof '+t0.to_js()+'!="object" && '
res +='typeof '+t0.to_js()+'==typeof '+t1.to_js()
res +=' ? '+t0.to_js()+this.op+t1.to_js()+' : '
res +='getattr('+this.tree[0].to_js()
res +=',"__'+method+'__")('+this.tree[1].to_js()+')'
return res
}
break
}
}}
switch(this.op){case 'and':
var res='$B.$test_expr($B.$test_item('+this.tree[0].to_js()+')&&'
return res + '$B.$test_item('+this.tree[1].to_js()+'))'
case 'or':
var res='$B.$test_expr($B.$test_item('+this.tree[0].to_js()+')||'
return res + '$B.$test_item('+this.tree[1].to_js()+'))'
case 'in':
return '$B.$is_member('+$to_js(this.tree)+')'
case 'not_in':
return '!$B.$is_member('+$to_js(this.tree)+')'
case 'unary_neg':
case 'unary_inv':
if(this.op=='unary_neg'){op='-'}else{op='~'}
if(this.tree[1].type=="expr"){var x=this.tree[1].tree[0]
switch(x.type){case 'int':
return op+x.value
case 'float':
return 'float('+op+x.value+')'
case 'imaginary':
return 'complex(0,'+op+x.value+')'
}}
if(op=='-')return 'getattr('+this.tree[1].to_js()+',"__neg__")()'
return 'getattr('+this.tree[1].to_js()+',"__invert__")()'
case 'is':
return this.tree[0].to_js()+ '===' + this.tree[1].to_js()
case 'is_not':
return this.tree[0].to_js()+ '!==' + this.tree[1].to_js()
case '*':
case '+':
case '-':
var op=this.op
var vars=[]
var has_float_lit=false
function is_simple(elt){if(elt.type=='expr' && elt.tree[0].type=='int'){return true}
else if(elt.type=='expr' && elt.tree[0].type=='float'){has_float_lit=true
return true
}else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple' 
&& elt.tree[0].real=='tuple'
&& elt.tree[0].tree.length==1 
&& elt.tree[0].tree[0].type=='expr'){return is_simple(elt.tree[0].tree[0].tree[0])
}else if(elt.type=='expr' && elt.tree[0].type=='id'){var _var=elt.tree[0].to_js()
if(vars.indexOf(_var)==-1){vars.push(_var)}
return true
}else if(elt.type=='op' &&['*','+','-'].indexOf(elt.op)>-1){for(var i=0;i<elt.tree.length;i++){if(!is_simple(elt.tree[i])){return false}}
return true
}
return false
}
var e0=this.tree[0],e1=this.tree[1]
if(is_simple(this)){var v0=this.tree[0].tree[0]
var v1=this.tree[1].tree[0]
if(vars.length==0 && !has_float_lit){
return this.simple_js()
}else if(vars.length==0){
return 'new $B.$FloatClass('+this.simple_js()+')'
}else{
var tests=[]
for(var i=0;i<vars.length;i++){tests.push('typeof '+vars[i]+'.valueOf() == "number"')
}
var res=tests.join(' && ')+' ? '
var tests=[]
for(var i=0;i<vars.length;i++){tests.push('typeof '+vars[i]+' == "number"')
}
res +='('+tests.join(' && ')+' ? '
res +=this.simple_js()
res +=' : new $B.$FloatClass('+this.simple_js()+')'
res +=')'
res +=': getattr('+this.tree[0].to_js()+',"__'
res +=$operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
}}else{var res='getattr('+e0.to_js()+',"__'
res +=$operators[this.op]+'__")'+'('+e1.to_js()+')'
}
return res
default:
var res='getattr('+this.tree[0].to_js()+',"__'
return res + $operators[this.op]+'__")'+'('+this.tree[1].to_js()+')'
}}
this.simple_js=function(){function sjs(elt){if(elt.type=='op'){return elt.simple_js()}
else if(elt.type=='expr' && elt.tree[0].type=='list_or_tuple' 
&& elt.tree[0].real=='tuple'
&& elt.tree[0].tree.length==1 
&& elt.tree[0].tree[0].type=='expr'){return '('+elt.tree[0].tree[0].tree[0].simple_js()+')'
}else{return elt.tree[0].to_js()}}
return sjs(this.tree[0])+op+sjs(this.tree[1])
}}
function $PackedCtx(C){
this.type='packed'
if(C.parent.type=='list_or_tuple'){for(var i=0;i<C.parent.tree.length;i++){var child=C.parent.tree[i]
if(child.type=='expr' && child.tree.length>0 
&& child.tree[0].type=='packed'){$_SyntaxError(C,["two starred expressions in assignment"])
}}}
this.toString=function(){return '(packed) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return $to_js(this.tree)}}
function $PassCtx(C){this.type='pass'
this.toString=function(){return '(pass)'}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'void(0)'}}
function $RaiseCtx(C){this.type='raise'
this.toString=function(){return ' (raise) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){if(this.tree.length===0)return '$B.$raise()'
var exc=this.tree[0]
if(exc.type==='id' ||
(exc.type==='expr' && exc.tree[0].type==='id')){var value=exc.value
if(exc.type=='expr'){value=exc.tree[0].value}
var res='if(isinstance('+exc.to_js()+',type)){throw '+exc.to_js()+'()}'
return res + 'else{throw '+exc.to_js()+'}'
}
while(this.tree.length>1)this.tree.pop()
return 'throw '+$to_js(this.tree)
}}
function $RawJSCtx(C,js){this.type="raw_js"
C.tree.push(this)
this.parent=C
this.toString=function(){return '(js) '+js}
this.to_js=function(){return js}}
function $ReturnCtx(C){
this.type='return'
this.toString=function(){return 'return '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
var node=$get_node(this)
while(node.parent){if(node.parent.C && node.parent.C.tree[0].type=='for'){node.parent.C.tree[0].has_return=true
break
}
node=node.parent
}
this.to_js=function(){if(this.tree.length==1 && this.tree[0].type=='abstract_expr'){
this.tree.pop()
new $IdCtx(new $ExprCtx(this,'rvalue',false),'None')
}
var scope=$get_scope(this)
if(scope.ntype=='BRgenerator'){var res='return [$B.generator_return('
return res + $to_js(this.tree)+')]'
}
return 'return '+$to_js(this.tree)
}}
function $SingleKwCtx(C,token){
this.type='single_kw'
this.token=token
this.parent=C
this.tree=[]
C.tree.push(this)
if(token=="else"){var node=C.node
var pnode=node.parent
for(var rank=0;rank<pnode.children.length;rank++){if(pnode.children[rank]===node)break
}
var pctx=pnode.children[rank-1].C
if(pctx.tree.length>0){var elt=pctx.tree[0]
if(elt.type=='for' ||
(elt.type=='condition' && elt.token=='while')){elt.has_break=true
this.loop_num=elt.loop_num
}}}
this.toString=function(){return this.token}
this.to_js=function(){if(this.token=='finally')return this.token
if(this.loop_num!==undefined){return 'if($locals["$no_break'+this.loop_num+'"])'}
return this.token
}}
function $StarArgCtx(C){this.type='star_arg'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(star arg) '+this.tree}
this.to_js=function(){return '{$nat:"ptuple",arg:'+$to_js(this.tree)+'}'
}}
function $StringCtx(C,value){this.type='str'
this.toString=function(){return 'string '+(this.tree||'')}
this.parent=C
this.tree=[value]
this.raw=false
C.tree.push(this)
this.to_js=function(){var res='',type=null
for(var i=0;i<this.tree.length;i++){var value=this.tree[i]
is_bytes=value.charAt(0)=='b'
if(type==null){type=is_bytes
if(is_bytes){res+='bytes('}}else if(type!=is_bytes){return '__BRYTHON__.$TypeError("can\'t concat bytes to str")'
}
if(!is_bytes){res +=value.replace(/\n/g,'\\n\\\n')
}else{res +=value.substr(1).replace(/\n/g,'\\n\\\n')
}
if(i<this.tree.length-1){res+='+'}}
if(is_bytes){res +=',$B.charset)'}
return res
}}
function $SubCtx(C){
this.type='sub'
this.func='getitem' 
this.toString=function(){return '(sub) (value) '+this.value+' (tree) '+this.tree}
this.value=C.tree[0]
C.tree.pop()
C.tree.push(this)
this.parent=C
this.tree=[]
this.to_js=function(){
if(this.marked){var val=this.value.to_js()
var res='getattr('+val+',"__'+this.func+'__")('
if(this.tree.length===1)return res+this.tree[0].to_js()+')'
res +='slice('
for(var i=0;i<this.tree.length;i++){if(this.tree[i].type==='abstract_expr'){res+='null'}
else{res+=this.tree[i].to_js()}
if(i<this.tree.length-1){res+=','}}
return res+'))'
}else{var res='',shortcut=false
if(this.func=='getitem' && this.tree.length==1){res +='$B.$getitem('+this.value.to_js()+','
res +=this.tree[0].to_js()+')'
return res
}
if(false && this.func!=='delitem' && Array.isArray && this.tree.length==1 && !this.in_sub){var expr='',x=this
shortcut=true
while(x.value.type=='sub'){expr +='['+x.tree[0].to_js()+']'
x.value.in_sub=true
x=x.value
}
var subs=x.value.to_js()+'['+x.tree[0].to_js()+']'
res +='(Array.isArray('+x.value.to_js()+') && '
res +=subs+'!==undefined ?'
res +=subs+expr+ ' : '
}
var val=this.value.to_js()
res +='getattr('+val+',"__'+this.func+'__")('
if(this.tree.length===1){res +=this.tree[0].to_js()+')'
}else{res +='slice('
for(var i=0;i<this.tree.length;i++){if(this.tree[i].type==='abstract_expr'){res+='null'}
else{res+=this.tree[i].to_js()}
if(i<this.tree.length-1){res+=','}}
res +='))'
}
return shortcut ? res+')' : res
}}}
function $TargetCtx(C,name){
this.toString=function(){return ' (target) '+this.name}
this.parent=C
this.name=name
this.alias=null
C.tree.push(this)
this.to_js=function(){return '["'+this.name+'","'+this.alias+'"]'}}
function $TargetListCtx(C){this.type='target_list'
this.parent=C
this.tree=[]
this.expect='id'
C.tree.push(this)
this.toString=function(){return '(target list) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}}
function $TernaryCtx(C){this.type='ternary'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
C.parent=this
this.tree=[C]
this.toString=function(){return '(ternary) '+this.tree}
this.to_js=function(){var res='bool('+this.tree[1].to_js()+') ? ' 
res +=this.tree[0].to_js()+' : ' 
res +=this.tree[2].to_js()
return res
}}
function $TryCtx(C){this.type='try'
this.parent=C
C.tree.push(this)
this.toString=function(){return '(try) '}
this.transform=function(node,rank){if(node.parent.children.length===rank+1){$_SyntaxError(C,"missing clause after 'try' 1")
}else{var next_ctx=node.parent.children[rank+1].C.tree[0]
switch(next_ctx.type){case 'except':
case 'finally':
case 'single_kw':
break
default:
$_SyntaxError(C,"missing clause after 'try' 2")
}}
var scope=$get_scope(this)
new $NodeJSCtx(node,'$B.$failed'+$loop_num+'=false;try')
node.is_try=true 
var catch_node=new $Node()
new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
catch_node.is_catch=true
node.parent.insert(rank+1,catch_node)
var new_node=new $Node()
new $NodeJSCtx(new_node,'$B.$failed'+$loop_num+'=true;if(false){void(0)}')
catch_node.insert(0,new_node)
var pos=rank+2
var has_default=false 
var has_else=false 
while(1){if(pos===node.parent.children.length){break}
var ctx=node.parent.children[pos].C.tree[0]
if(ctx.type==='except'){
if(has_else){$_SyntaxError(C,"'except' or 'finally' after 'else'")}
ctx.error_name='$err'+$loop_num
if(ctx.tree.length>0 && ctx.tree[0].alias!==null
&& ctx.tree[0].alias!==undefined){
var new_node=new $Node()
var alias=ctx.tree[0].alias
var js='var '+alias
if(scope.ntype=='def'||scope.ntype=='BRgenerator'){js +=' = $locals["'+alias+'"]'
}else{js +=' = $globals["'+alias+'"]'
}
js +='=$B.exception($err'+$loop_num+')'
new $NodeJSCtx(new_node,js)
node.parent.children[pos].insert(0,new_node)
}
catch_node.insert(catch_node.children.length,node.parent.children[pos])
if(ctx.tree.length===0){if(has_default){$_SyntaxError(C,'more than one except: line')}
has_default=true
}
node.parent.children.splice(pos,1)
}else if(ctx.type==='single_kw' && ctx.token==='finally'){if(has_else){$_SyntaxError(C,"'finally' after 'else'")}
pos++
}else if(ctx.type==='single_kw' && ctx.token==='else'){if(has_else){$_SyntaxError(C,"more than one 'else'")}
has_else=true
var else_body=node.parent.children[pos]
node.parent.children.splice(pos,1)
}else{break}}
if(!has_default){
var new_node=new $Node()
new $NodeJSCtx(new_node,'else{throw $err'+$loop_num+'}')
catch_node.insert(catch_node.children.length,new_node)
}
if(has_else){var else_node=new $Node()
new $NodeJSCtx(else_node,'if(!$B.$failed'+$loop_num+')')
for(var i=0;i<else_body.children.length;i++){else_node.add(else_body.children[i])
}
node.parent.insert(pos,else_node)
}
$loop_num++
}
this.to_js=function(){return 'try'}}
function $UnaryCtx(C,op){this.type='unary'
this.op=op
this.toString=function(){return '(unary) '+this.op}
this.parent=C
C.tree.push(this)
this.to_js=function(){return this.op}}
function $WithCtx(C){this.type='with'
this.parent=C
C.tree.push(this)
this.tree=[]
this.expect='as'
this.toString=function(){return '(with) '+this.tree}
this.set_alias=function(arg){var scope=$get_scope(this)
this.tree[this.tree.length-1].alias=arg
if(scope.ntype !=='module'){
scope.C.tree[0].locals.push(arg)
}}
this.transform=function(node,rank){if(this.transformed)return 
if(this.tree[0].alias===null){this.tree[0].alias='$temp'}
if(this.tree[0].type=='expr' && 
this.tree[0].tree[0].type=='list_or_tuple'){if(this.tree[1].type!='expr' ||
this.tree[1].tree[0].type!='list_or_tuple'){$_SyntaxError(C)
}
if(this.tree[0].tree[0].tree.length!=this.tree[1].tree[0].tree.length){$_SyntaxError(C,['wrong number of alias'])
}
var ids=this.tree[0].tree[0].tree
var alias=this.tree[1].tree[0].tree
this.tree.shift()
this.tree.shift()
for(var i=ids.length-1;i>=0;i--){ids[i].alias=alias[i].value
this.tree.splice(0,0,ids[i])
}}
var new_node=new $Node()
new $NodeJSCtx(new_node,'catch($err'+$loop_num+')')
var fbody=new $Node()
var js='if(!$ctx_manager_exit($err'+$loop_num+'.type,'
js +='$err'+$loop_num+'.value,$err'+$loop_num+'.traceback))'
js +='{throw $err'+$loop_num+'}'
new $NodeJSCtx(fbody,js)
new_node.add(fbody)
node.parent.insert(rank+1,new_node)
$loop_num++
var new_node=new $Node()
new $NodeJSCtx(new_node,'finally')
var fbody=new $Node()
new $NodeJSCtx(fbody,'$ctx_manager_exit(None,None,None)')
new_node.add(fbody)
node.parent.insert(rank+2,new_node)
if(this.tree.length>1){var nw=new $Node()
var ctx=new $NodeCtx(nw)
nw.parent=node
var wc=new $WithCtx(ctx)
wc.tree=this.tree.slice(1)
for(var i=0;i<node.children.length;i++){nw.add(node.children[i])
}
node.children=[nw]
}
this.transformed=true
}
this.to_js=function(){var res='var $ctx_manager='+this.tree[0].to_js()
var scope=$get_scope(this)
res +='\nvar $ctx_manager_exit = getattr($ctx_manager,"__exit__")\n'
if(this.tree[0].alias){var alias=this.tree[0].alias
res +='var '+alias+'='
if(scope.ntype=='module'){res +='$globals["'}
else{res +='$locals["'
scope.C.tree[0].locals.push(alias)
}
res +=alias + '"]='
}
return res + 'getattr($ctx_manager,"__enter__")()\ntry'
}}
function $YieldCtx(C){this.type='yield'
this.toString=function(){return '(yield) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
switch(C.type){case 'node':
break
case 'assign':
case 'tuple':
case 'list_or_tuple': 
var ctx=C
while(ctx.parent)ctx=ctx.parent
ctx.node.yield_atoms.push(this)
break
default:
$_SyntaxError(C,'yield atom must be inside ()')
}
var scope=$get_scope(this)
if(!scope.is_function){$_SyntaxError(C,["'yield' outside function"])
}else if(scope.has_return_with_arguments){$_SyntaxError(C,["'return' with argument inside generator"])
}
var def=scope.C.tree[0]
def.type='BRgenerator'
def.yields.push(this)
this.toString=function(){return '(yield) '+(this.from ? '(from) ' : '')+this.tree}
this.transform=function(node,rank){if(this.from===true){
var new_node=new $Node()
node.parent.children.splice(rank,1)
node.parent.insert(rank,new_node)
var for_ctx=new $ForExpr(new $NodeCtx(new_node))
new $IdCtx(new $ExprCtx(for_ctx,'id',false),'$temp'+$loop_num)
for_ctx.tree[1]=this.tree[0]
this.tree[0].parent=for_ctx
var yield_node=new $Node()
new_node.add(yield_node)
new $IdCtx(new $YieldCtx(new $NodeCtx(yield_node)),'$temp'+$loop_num)
var ph_node=new $Node()
new $NodeJSCtx(ph_node,'// placeholder for generator sent value')
ph_node.set_yield_value=true
new_node.add(ph_node)
for_ctx.transform(new_node,rank)
$loop_num++
}else{var new_node=new $Node()
new $NodeJSCtx(new_node,'// placeholder for generator sent value')
new_node.set_yield_value=true
node.parent.insert(rank+1,new_node)
}}
this.to_js=function(){var scope=$get_scope(this)
var res=''
if(this.from===undefined)return $to_js(this.tree)||'None'
var res=$to_js(this.tree)
return res
}}
var $loop_num=0
var $iter_num=0 
function $add_line_num(node,rank){if(node.type==='module'){var i=0
while(i<node.children.length){i +=$add_line_num(node.children[i],i)
}}else{var elt=node.C.tree[0],offset=1
var flag=true
var pnode=node
while(pnode.parent!==undefined){pnode=pnode.parent}
var mod_id=pnode.id
if(node.line_num===undefined){flag=false}
if(node.module===undefined){var nd=node.parent
while(nd){if(nd.module!==undefined){node.module=nd.module
break
}
nd=nd.parent
}
if(node.module===undefined){console.log('module undef, node '+node.C);flag=false
}}
if(elt.type==='condition' && elt.token==='elif'){flag=false}
else if(elt.type==='except'){flag=false}
else if(elt.type==='single_kw'){flag=false}
if(flag){
var js='$B.line_info=new Array('+node.line_num+',"'+mod_id+'");None;'
if(node.module===undefined)console.log('tiens, module undef !')
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
node.parent.insert(rank,new_node)
offset=2
}
var i=0
while(i<node.children.length)i+=$add_line_num(node.children[i],i)
return offset
}}
function $clear_ns(ctx){
var scope=$get_scope(ctx)
if(scope.is_function){if(scope.var2node){for(var name in scope.var2node){var remove=[]
for(var j=0;j<scope.var2node[name].length;j++){var elt=scope.var2node[name][j].parent
while(elt.parent){if(elt===ctx){remove.push(j);break}
elt=elt.parent
}}
for(var k=remove.length-1;k>=0;k--){scope.var2node[name].splice(remove[k],1)
}
}}}}
function $get_docstring(node){var doc_string='""'
if(node.children.length>0){var firstchild=node.children[0]
if(firstchild.C.tree && firstchild.C.tree[0].type=='expr'){if(firstchild.C.tree[0].tree[0].type=='str')
doc_string=firstchild.C.tree[0].tree[0].to_js()
}}
return doc_string
}
function $get_scope(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var scope=null
while(tree_node.parent && tree_node.parent.type!=='module'){var ntype=tree_node.parent.C.tree[0].type
switch(ntype){case 'def':
case 'class':
case 'generator':
case 'BRgenerator':
scope=tree_node.parent
scope.ntype=ntype
scope.elt=scope.C.tree[0]
scope.is_function=ntype!='class'
return scope
}
tree_node=tree_node.parent
}
scope=tree_node.parent ||tree_node 
scope.ntype="module"
scope.elt=scope.module
return scope
}
function $get_module(C){var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var scope=null
while(tree_node.parent.type!=='module'){tree_node=tree_node.parent
}
scope=tree_node.parent 
scope.ntype="module"
return scope
}
function $get_node(C){var ctx=C
while(ctx.parent){ctx=ctx.parent}
return ctx.node
}
function $get_ids(ctx){if(ctx.type==='expr' &&
ctx.tree[0].type==='list_or_tuple' &&
ctx.tree[0].real==='list_comp'){return[]}
var res=[]
switch(ctx.type){case 'id':
res.push(ctx.value)
break
case 'attribute':
case 'sub':
var res1=$get_ids(ctx.value)
for(var i=0;i<res1.length;i++){if(res.indexOf(res1[i])===-1){res.push(res1[i])}}
break
case 'call':
var res1=$get_ids(ctx.func)
for(var i=0;i<res1.length;i++){if(res.indexOf(res1[i])===-1){res.push(res1[i])}}}
if(ctx.tree!==undefined){for(var i=0;i<ctx.tree.length;i++){var res1=$get_ids(ctx.tree[i])
for(var j=0;j<res1.length;j++){if(res.indexOf(res1[j])===-1)res.push(res1[j])
}}}
return res
}
function $ws(n){return ' '.repeat(n)
}
function $to_js_map(tree_element){if(tree_element.to_js !==undefined)return tree_element.to_js()
throw Error('no to_js() for '+tree_element)
}
function $to_js(tree,sep){if(sep===undefined){sep=','}
return tree.map($to_js_map).join(sep)
}
var $expr_starters=['id','imaginary','int','float','str','bytes','[','(','{','not','lambda']
function $arbo(ctx){while(ctx.parent!=undefined){ctx=ctx.parent}
return ctx
}
function $transition(C,token){
switch(C.type){case 'abstract_expr':
switch(token){case 'id':
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
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
}
switch(token){case 'id': 
return new $IdCtx(new $ExprCtx(C,'id',commas),arguments[2])
case 'str':
return new $StringCtx(new $ExprCtx(C,'str',commas),arguments[2])
case 'bytes':
return new $StringCtx(new $ExprCtx(C,'bytes',commas),arguments[2])
case 'int':
return new $IntCtx(new $ExprCtx(C,'int',commas),arguments[2])
case 'float':
return new $FloatCtx(new $ExprCtx(C,'float',commas),arguments[2])
case 'imaginary':
return new $ImaginaryCtx(new $ExprCtx(C,'imaginary',commas),arguments[2])
case '(':
return new $ListOrTupleCtx(new $ExprCtx(C,'tuple',commas),'tuple')
case '[':
return new $ListOrTupleCtx(new $ExprCtx(C,'list',commas),'list')
case '{':
return new $DictOrSetCtx(new $ExprCtx(C,'dict_or_set',commas))
case 'not':
if(C.type==='op'&&C.op==='is'){
C.op='is_not'
return C
}
return new $NotCtx(new $ExprCtx(C,'not',commas))
case 'lambda':
return new $LambdaCtx(new $ExprCtx(C,'lambda',commas))
case 'op':
var tg=arguments[2]
switch(tg){case '+':
return C
case '*':
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
return new $PackedCtx(new $ExprCtx(C,'expr',commas))
case '-':
case '~':
C.parent.tree.pop()
var left=new $UnaryCtx(C.parent,tg)
if(tg=='-'){var op_expr=new $OpCtx(left,'unary_neg')}
else{var op_expr=new $OpCtx(left,'unary_inv')}
return new $AbstractExprCtx(op_expr,false)
}
$_SyntaxError(C,'token '+token+' after '+C)
case '=':
$_SyntaxError(C,token)
case 'yield':
return new $AbstractExprCtx(new $YieldCtx(C),false)
case ':':
return $transition(C.parent,token,arguments[2])
case ')':
case ',':
switch(C.parent.type){case 'list_or_tuple':
case 'call_arg':
case 'op':
case 'yield':
break
default:
$_SyntaxError(C,token)
}
}
return $transition(C.parent,token,arguments[2])
case 'assert':
if(token==='eol')return $transition(C.parent,token)
$_SyntaxError(C,token)
case 'assign':
if(token==='eol'){if(C.tree[1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)
}
return $transition(C.parent,'eol')
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'attribute':
if(token==='id'){var name=arguments[2]
C.name=name
return C.parent
}
$_SyntaxError(C,token)
case 'augm_assign':
if(token==='eol'){if(C.tree[1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)
}
return $transition(C.parent,'eol')
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'break':
if(token==='eol')return $transition(C.parent,'eol')
$_SyntaxError(C,token)
case 'call':
switch(token){case ',':
if(C.expect=='id'){$_SyntaxError(C,token)}
return C
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
if(C.has_dstar)$_SyntaxError(C,token)
C.expect=','
return $transition(new $CallArgCtx(C),token,arguments[2])
case ')':
C.end=$pos
return C.parent
case 'op':
C.expect=','
switch(arguments[2]){case '-':
case '~':
return new $UnaryCtx(new $ExprCtx(C,'unary',false),arguments[2])
case '+':
return C
case '*':
C.has_star=true
return new $StarArgCtx(C)
case '**':
C.has_dstar=true
return new $DoubleStarArgCtx(C)
}
throw Error('SyntaxError')
}
return $transition(C.parent,token,arguments[2])
case 'call_arg':
switch(token){case 'id':
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
if(C.expect==='id'){C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}
break
case '=':
if(C.expect===','){return new $ExprCtx(new $KwArgCtx(C),'kw_value',false)
}
break
case 'for':
$clear_ns(C)
var lst=new $ListOrTupleCtx(C,'gen_expr')
lst.vars=C.vars 
lst.locals=C.locals
lst.intervals=[C.start]
C.tree.pop()
lst.expression=C.tree
C.tree=[lst]
lst.tree=[]
var comp=new $ComprehensionCtx(lst)
return new $TargetListCtx(new $CompForCtx(comp))
case 'op':
if(C.expect==='id'){var op=arguments[2]
C.expect=','
switch(op){case '+':
case '-':
return $transition(new $AbstractExprCtx(C,false),token,op)
case '*':
return new $StarArgCtx(C)
case '**':
return new $DoubleStarArgCtx(C)
}
}
$_SyntaxError(C,'token '+token+' after '+C)
case ')':
if(C.tree.length>0){var son=C.tree[C.tree.length-1]
if(son.type==='list_or_tuple'&&son.real==='gen_expr'){son.intervals.push($pos)
}}
return $transition(C.parent,token)
case ':':
if(C.expect===',' && C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)
}
break
case ',':
if(C.expect===','){return new $CallArgCtx(C.parent)
}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'class':
switch(token){case 'id':
if(C.expect==='id'){C.set_name(arguments[2])
C.expect='(:'
return C
}
break
case '(':
return new $CallCtx(C)
case ':':
return $BodyCtx(C)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'comp_if':
return $transition(C.parent,token,arguments[2])
case 'comp_for':
if(token==='in' && C.expect==='in'){C.expect=null
return new $AbstractExprCtx(new $CompIterableCtx(C),true)
}
if(C.expect===null){
return $transition(C.parent,token,arguments[2])
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'comp_iterable':
return $transition(C.parent,token,arguments[2])
case 'comprehension':
switch(token){case 'if':
return new $AbstractExprCtx(new $CompIfCtx(C),false)
case 'for':
return new $TargetListCtx(new $CompForCtx(C))
}
return $transition(C.parent,token,arguments[2])
case 'condition':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'continue':
if(token=='eol')return C.parent
$_SyntaxError(C,'token '+token+' after '+C)
case 'decorator':
if(token==='id' && C.tree.length===0){return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}
if(token==='eol')return $transition(C.parent,token)
$_SyntaxError(C,'token '+token+' after '+C)
case 'def':
switch(token){case 'id':
if(C.name){$_SyntaxError(C,'token '+token+' after '+C)
}
C.set_name(arguments[2])
return C
case '(':
if(C.name===null){$_SyntaxError(C,'token '+token+' after '+C)
}
C.has_args=true
return new $FuncArgs(C)
case ':':
if(C.has_args)return $BodyCtx(C)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'del':
if(token==='eol')return $transition(C.parent,token)
$_SyntaxError(C,'token '+token+' after '+C)
case 'dict_or_set':
if(C.closed){switch(token){case '[':
return new $SubCtx(C.parent)
case '(':
return new $CallArgCtx(new $CallCtx(C))
case 'op':
return new $AbstractExprCtx(new $OpCtx(C,arguments[2]),false)
}
return $transition(C.parent,token,arguments[2])
}else{if(C.expect===','){switch(token){case '}':
switch(C.real){case 'dict_or_set':
if(C.tree.length !==1)break
C.real='set' 
case 'set':
case 'set_comp':
case 'dict_comp':
C.items=C.tree
C.tree=[]
C.closed=true
return C
case 'dict':
if(C.tree.length%2===0){C.items=C.tree
C.tree=[]
C.closed=true
return C
}}
$_SyntaxError(C,'token '+token+' after '+C)
case ',':
if(C.real==='dict_or_set'){C.real='set'}
if(C.real==='dict' && C.tree.length%2){$_SyntaxError(C,'token '+token+' after '+C)
}
C.expect='id'
return C
case ':':
if(C.real==='dict_or_set'){C.real='dict'}
if(C.real==='dict'){C.expect=','
return new $AbstractExprCtx(C,false)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
case 'for':
$clear_ns(C)
if(C.real==='dict_or_set'){C.real='set_comp'}
else{C.real='dict_comp'}
var lst=new $ListOrTupleCtx(C,'dict_or_set_comp')
lst.intervals=[C.start+1]
lst.vars=C.vars
C.tree.pop()
lst.expression=C.tree
C.tree=[lst]
lst.tree=[]
var comp=new $ComprehensionCtx(lst)
return new $TargetListCtx(new $CompForCtx(comp))
}
$_SyntaxError(C,'token '+token+' after '+C)
}else if(C.expect==='id'){switch(token){case '}':
if(C.tree.length==0){
C.items=[]
C.real='dict'
}else{
C.items=C.tree
}
C.tree=[]
C.closed=true
return C
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
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
case 'op':
switch(arguments[2]){case '+':
return C
case '-':
case '~':
C.expect=','
var left=new $UnaryCtx(C,arguments[2])
if(arguments[2]=='-'){var op_expr=new $OpCtx(left,'unary_neg')}
else{var op_expr=new $OpCtx(left,'unary_inv')}
return new $AbstractExprCtx(op_expr,false)
}
$_SyntaxError(C,'token '+token+' after '+C)
}
$_SyntaxError(C,'token '+token+' after '+C)
}
return $transition(C.parent,token,arguments[2])
}
break
case 'double_star_arg':
switch(token){case 'id':
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
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
case ',':
return C.parent
case ')':
return $transition(C.parent,token)
case ':':
if(C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)
}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'except':
switch(token){case 'id':
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
if(C.expect==='id'){C.expect='as'
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}
case 'as':
if(C.expect==='as' && C.has_alias===undefined){C.expect='alias'
C.has_alias=true
return C
}
case 'id':
if(C.expect==='alias'){C.expect=':'
C.set_alias(arguments[2])
return C
}
break
case ':':
var _ce=C.expect
if(_ce=='id' ||_ce=='as' ||_ce==':'){return $BodyCtx(C)
}
break
case '(':
if(C.expect==='id' && C.tree.length===0){C.parenth=true
return C
}
break
case ')':
if(C.expect==',' ||C.expect=='as'){C.expect='as'
return C
}
case ',':
if(C.parenth!==undefined && C.has_alias===undefined &&
(C.expect=='as' ||C.expect==',')){C.expect='id'
return C
}}
$_SyntaxError(C,'token '+token+' after '+C.expect)
case 'expr':
switch(token){case 'id':
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
if(C.expect==='expr'){C.expect=','
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}}
switch(token){case 'not':
if(C.expect===',')return new $ExprNot(C)
break
case 'in':
if(C.expect===',')return $transition(C,'op','in')
break
case ',':
if(C.expect===','){if(C.with_commas){
C.parent.tree.pop()
var tuple=new $ListOrTupleCtx(C.parent,'tuple')
tuple.implicit=true
tuple.has_comma=true
tuple.tree=[C]
C.parent=tuple
return tuple
}}
return $transition(C.parent,token)
case '.':
return new $AttrCtx(C)
case '[':
return new $AbstractExprCtx(new $SubCtx(C),true)
case '(':
return new $CallCtx(C)
case 'op':
var op_parent=C.parent,op=arguments[2]
if(op_parent.type=='ternary' && op_parent.in_else){var new_op=new $OpCtx(C,op)
return new $AbstractExprCtx(new_op,false)
}
var op1=C.parent,repl=null
while(1){if(op1.type==='expr'){op1=op1.parent}
else if(op1.type==='op'&&$op_weight[op1.op]>=$op_weight[op]){repl=op1;op1=op1.parent}
else{break}}
if(repl===null){if(op==='and' ||op==='or'){while(C.parent.type==='not'||
(C.parent.type==='expr'&&C.parent.parent.type==='not')){
C=C.parent
op_parent=C.parent
}}else{while(1){if(C.parent!==op1){C=C.parent
op_parent=C.parent
}else{break
}}}
C.parent.tree.pop()
var expr=new $ExprCtx(op_parent,'operand',C.with_commas)
expr.expect=','
C.parent=expr
var new_op=new $OpCtx(C,op)
return new $AbstractExprCtx(new_op,false)
}
if(repl.type==='op'){var _flag=false
switch(repl.op){case '<':
case '<=':
case '==':
case '!=':
case 'is':
case '>=':
case '>':
_flag=true
}
if(_flag){switch(op){case '<':
case '<=':
case '==':
case '!=':
case 'is':
case '>=':
case '>':
var c2=repl.tree[1]
var c2_clone=new Object()
for(var attr in c2){c2_clone[attr]=c2[attr]}
while(repl.parent && repl.parent.type=='op'){if($op_weight[repl.parent.op]<$op_weight[repl.op]){repl=repl.parent
}else{break}}
repl.parent.tree.pop()
var and_expr=new $OpCtx(repl,'and')
c2_clone.parent=and_expr
and_expr.tree.push('xxx')
var new_op=new $OpCtx(c2_clone,op)
return new $AbstractExprCtx(new_op,false)
}
}
}
repl.parent.tree.pop()
var expr=new $ExprCtx(repl.parent,'operand',false)
expr.tree=[op1]
repl.parent=expr
var new_op=new $OpCtx(repl,op)
return new $AbstractExprCtx(new_op,false)
case 'augm_assign':
if(C.expect===','){return new $AbstractExprCtx(new $AugmentedAssignCtx(C,arguments[2]))
}
break
case '=':
if(C.expect===','){if(C.parent.type==="call_arg"){return new $AbstractExprCtx(new $KwArgCtx(C),true)
}
while(C.parent!==undefined)C=C.parent
C=C.tree[0]
return new $AbstractExprCtx(new $AssignCtx(C),true)
}
break
case 'if':
if(C.parent.type!=='comp_iterable'){
var ctx=C
while(ctx.parent && ctx.parent.type=='op'){ctx=ctx.parent
if(ctx.type=='expr' && ctx.parent && ctx.parent.type=='op'){ctx=ctx.parent
}}
return new $AbstractExprCtx(new $TernaryCtx(ctx),false)
}}
return $transition(C.parent,token)
case 'expr_not':
if(token==='in'){
C.parent.tree.pop()
return new $AbstractExprCtx(new $OpCtx(C.parent,'not_in'),false)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'for': 
switch(token){case 'in':
return new $AbstractExprCtx(new $ExprCtx(C,'target list',true),false)
case ':':
return $BodyCtx(C)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'from':
switch(token){case 'id':
if(C.expect==='id'){C.add_name(arguments[2])
C.expect=','
return C
}
if(C.expect==='alias'){C.aliases[C.names[C.names.length-1]]=arguments[2]
C.expect=','
return C
}
case '.':
if(C.expect==='module'){if(token==='id'){C.module +=arguments[2]}
else{C.module +='.'}
return C
}
case 'import':
if(C.expect==='module'){C.expect='id'
return C
}
case 'op':
if(arguments[2]==='*' && C.expect==='id' 
&& C.names.length===0){if($get_scope(C).ntype!=='module'){$_SyntaxError(C,["import * only allowed at module level"])
}
C.add_name('*')
C.expect='eol'
return C
}
case ',':
if(C.expect===','){C.expect='id'
return C
}
case 'eol':
switch(C.expect){case ',':
case 'eol':
C.bind_names()
return $transition(C.parent,token)
}
case 'as':
if(C.expect===',' ||C.expect==='eol'){C.expect='alias'
return C
}
case '(':
if(C.expect==='id'){C.expect='id'
return C
}
case ')':
if(C.expect===','){C.expect='eol'
return C
}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_arg_id':
switch(token){case '=':
if(C.expect==='='){C.parent.has_default=true
return new $AbstractExprCtx(C,false)
}
break
case ',':
case ')':
if(C.parent.has_default && C.tree.length==0){$pos -=C.name.length
$_SyntaxError(C,['non-default argument follows default argument'])
}else{return $transition(C.parent,token)
}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_args':
switch(token){case 'id':
if(C.expect==='id'){C.expect=','
if(C.names.indexOf(arguments[2])>-1){$_SyntaxError(C,['duplicate argument '+arguments[2]+' in function definition'])
}}
return new $FuncArgIdCtx(C,arguments[2])
case ',':
if(C.has_kw_arg)$_SyntaxError(C,'duplicate kw arg')
if(C.expect===','){C.expect='id'
return C
}
$_SyntaxError(C,'token '+token+' after '+C)
case ')':
return C.parent
case 'op':
var op=arguments[2]
C.expect=','
if(op=='*'){if(C.has_star_arg){$_SyntaxError(C,'duplicate star arg')}
return new $FuncStarArgCtx(C,'*')
}
if(op=='**')return new $FuncStarArgCtx(C,'**')
$_SyntaxError(C,'token '+op+' after '+C)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'func_star_arg':
switch(token){case 'id':
if(C.name===undefined){if(C.parent.names.indexOf(arguments[2])>-1){$_SyntaxError(C,['duplicate argument '+arguments[2]+' in function definition'])
}}
C.set_name(arguments[2])
C.parent.names.push(arguments[2])
return C.parent
case ',':
if(C.name===undefined){
C.set_name('$dummy')
C.parent.names.push('$dummy')
return $transition(C.parent,token)
}
break
case ')':
C.set_name('$dummy')
C.parent.names.push('$dummy')
return $transition(C.parent,token)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'global':
switch(token){case 'id':
if(C.expect==='id'){new $IdCtx(C,arguments[2])
C.add(arguments[2])
C.expect=','
return C
}
break
case ',': 
if(C.expect===','){C.expect='id'
return C
}
break
case 'eol':
if(C.expect===','){return $transition(C.parent,token)
}
break
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'id':
switch(token){case '=':
if(C.parent.type==='expr' &&
C.parent.parent !==undefined &&
C.parent.parent.type==='call_arg'){return new $AbstractExprCtx(new $KwArgCtx(C.parent),false)
}
return $transition(C.parent,token,arguments[2])
case 'op':
return $transition(C.parent,token,arguments[2])
case 'id':
case 'str':
case 'int':
case 'float':
case 'imaginary':
$_SyntaxError(C,'token '+token+' after '+C)
}
return $transition(C.parent,token,arguments[2])
case 'import':
switch(token){case 'id':
if(C.expect==='id'){new $ImportedModuleCtx(C,arguments[2])
C.expect=','
return C
}
if(C.expect==='qual'){C.expect=','
C.tree[C.tree.length-1].name +='.'+arguments[2]
C.tree[C.tree.length-1].alias +='.'+arguments[2]
return C
}
if(C.expect==='alias'){C.expect=','
C.tree[C.tree.length-1].alias=arguments[2]
return C
}
break
case '.':
if(C.expect===','){C.expect='qual'
return C
}
break
case ',':
if(C.expect===','){C.expect='id'
return C
}
break
case 'as':
if(C.expect===','){C.expect='alias'
return C
}
break
case 'eol':
if(C.expect===','){C.bind_names()
return $transition(C.parent,token)
}
break
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'imaginary':
case 'int':
case 'float':
switch(token){case 'id':
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
$_SyntaxError(C,'token '+token+' after '+C)
}
return $transition(C.parent,token,arguments[2])
case 'kwarg':
if(token===',')return new $CallArgCtx(C.parent.parent)
return $transition(C.parent,token)
case 'lambda':
if(token===':' && C.args===undefined){C.args=C.tree
C.tree=[]
C.body_start=$pos
return new $AbstractExprCtx(C,false)
}
if(C.args!==undefined){
C.body_end=$pos
return $transition(C.parent,token)
}
if(C.args===undefined){return $transition(new $CallCtx(C),token,arguments[2])
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'list_or_tuple':
if(C.closed){if(token==='[')return new $SubCtx(C.parent)
if(token==='(')return new $CallCtx(C)
return $transition(C.parent,token,arguments[2])
}else{if(C.expect===','){switch(C.real){case 'tuple':
case 'gen_expr':
if(token===')'){C.closed=true
if(C.real==='gen_expr'){C.intervals.push($pos)}
return C.parent
}
break
case 'list':
case 'list_comp':
if(token===']'){C.closed=true
if(C.real==='list_comp'){C.intervals.push($pos)}
return C
}
break
case 'dict_or_set_comp':
if(token==='}'){C.intervals.push($pos)
return $transition(C.parent,token)
}
break
}
switch(token){case ',':
if(C.real==='tuple'){C.has_comma=true}
C.expect='id'
return C
case 'for':
if(C.real==='list'){C.real='list_comp'}
else{C.real='gen_expr'}
$clear_ns(C)
C.intervals=[C.start+1]
C.expression=C.tree
C.tree=[]
var comp=new $ComprehensionCtx(C)
return new $TargetListCtx(new $CompForCtx(comp))
}
return $transition(C.parent,token,arguments[2])
}else if(C.expect==='id'){switch(C.real){case 'tuple':
if(token===')'){C.closed=true
return C.parent
}
if(token=='eol' && C.implicit===true){C.closed=true
return $transition(C.parent,token)
}
break
case 'gen_expr':
if(token===')'){C.closed=true
return $transition(C.parent,token)
}
break
case 'list':
if(token===']'){C.closed=true
return C
}
break
}
switch(token){case '=':
if(C.real=='tuple' && C.implicit===true){C.closed=true
C.parent.tree.pop()
var expr=new $ExprCtx(C.parent,'tuple',false)
expr.tree=[C]
C.parent=expr
return $transition(C.parent,token)
}
break
case ')':
case ']':
break
case ',':
$_SyntaxError(C,'unexpected comma inside list')
default:
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}
}else{return $transition(C.parent,token,arguments[2])}}
case 'list_comp':
switch(token){case ']':
return C.parent
case 'in':
return new $ExprCtx(C,'iterable',true)
case 'if':
return new $ExprCtx(C,'condition',true)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'node':
switch(token){case 'id':
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
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])
case 'op':
switch(arguments[2]){
case '*':
case '+':
case '-':
case '~':
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])
}
break
case 'class':
return new $ClassCtx(C)
case 'continue':
return new $ContinueCtx(C)
case 'break':
return new $BreakCtx(C)
case 'def':
return new $DefCtx(C)
case 'for':
return new $TargetListCtx(new $ForExpr(C))
case 'if':
case 'elif':
case 'while':
return new $AbstractExprCtx(new $ConditionCtx(C,token),false)
case 'else':
case 'finally':
return new $SingleKwCtx(C,token)
case 'try':
return new $TryCtx(C)
case 'except':
return new $ExceptCtx(C)
case 'assert':
return new $AbstractExprCtx(new $AssertCtx(C),'assert',true)
case 'from':
return new $FromCtx(C)
case 'import':
return new $ImportCtx(C)
case 'global':
return new $GlobalCtx(C)
case 'nonlocal':
return new $NonlocalCtx(C)
case 'lambda':
return new $LambdaCtx(C)
case 'pass':
return new $PassCtx(C)
case 'raise':
return new $RaiseCtx(C)
case 'return':
return new $AbstractExprCtx(new $ReturnCtx(C),true)
case 'with':
return new $AbstractExprCtx(new $WithCtx(C),false)
case 'yield':
return new $AbstractExprCtx(new $YieldCtx(C),true)
case 'del':
return new $AbstractExprCtx(new $DelCtx(C),true)
case '@':
return new $DecoratorCtx(C)
case 'eol':
if(C.tree.length===0){
C.node.parent.children.pop()
return C.node.parent.C
}
return C
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'not':
switch(token){case 'in':
C.parent.parent.tree.pop()
return new $ExprCtx(new $OpCtx(C.parent,'not_in'),'op',false)
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
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
case 'op':
var a=arguments[2]
if('+'==a ||'-'==a ||'~'==a){
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}}
return $transition(C.parent,token)
case 'op':
if(C.op===undefined){$_SyntaxError(C,['C op undefined '+C])
}
if(C.op.substr(0,5)=='unary'){if(C.parent.type=='assign' ||C.parent.type=='return'){
C.parent.tree.pop()
var t=new $ListOrTupleCtx(C.parent,'tuple')
t.tree.push(C)
C.parent=t
return t
}}
switch(token){case 'id':
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
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
case 'op':
switch(arguments[2]){case '+':
case '-':
case '~':
return new $UnaryCtx(C,arguments[2])
}
default:
if(C.tree[C.tree.length-1].type=='abstract_expr'){$_SyntaxError(C,'token '+token+' after '+C)
}}
return $transition(C.parent,token)
case 'packed':
if(token==='id')new $IdCtx(C,arguments[2]);return C.parent
$_SyntaxError(C,'token '+token+' after '+C)
case 'pass':
if(token==='eol')return C.parent
$_SyntaxError(C,'token '+token+' after '+C)
case 'raise':
switch(token){case 'id':
if(C.tree.length===0){return new $IdCtx(new $ExprCtx(C,'exc',false),arguments[2])
}
break
case 'from': 
if(C.tree.length>0){return new $AbstractExprCtx(C,false)
}
break
case 'eol':
return $transition(C.parent,token)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'return':
var no_args=C.tree[0].type=='abstract_expr'
if(!no_args){var scope=$get_scope(C)
if(scope.ntype=='BRgenerator'){$_SyntaxError(C,["'return' with argument inside generator"])
}
scope.has_return_with_arguments=true
}
return $transition(C.parent,token)
case 'single_kw':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'star_arg':
switch(token){case 'id':
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
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
case ',':
return $transition(C.parent,token)
case ')':
return $transition(C.parent,token)
case ':':
if(C.parent.parent.type==='lambda'){return $transition(C.parent.parent,token)
}}
$_SyntaxError(C,'token '+token+' after '+C)
case 'str':
switch(token){case '[':
return new $AbstractExprCtx(new $SubCtx(C.parent),false)
case '(':
return new $CallCtx(C)
case 'str':
C.tree.push(arguments[2])
return C
}
return $transition(C.parent,token,arguments[2])
case 'sub':
switch(token){case 'id':
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
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
case ']':
return C.parent
case ':':
if(C.tree.length==0){new $AbstractExprCtx(C,false)
}
return new $AbstractExprCtx(C,false)
}
$_SyntaxError(C,'token '+token+' after '+C)
case 'target_list':
switch(token){case 'id':
if(C.expect==='id'){C.expect=','
new $IdCtx(C,arguments[2])
return C
}
case '(':
case '[':
if(C.expect==='id'){C.expect=','
return new $TargetListCtx(C)
}
case ')':
case ']':
if(C.expect===',')return C.parent
case ',':
if(C.expect==','){C.expect='id'
return C
}}
if(C.expect===',')return $transition(C.parent,token,arguments[2])
$_SyntaxError(C,'token '+token+' after '+C)
case 'ternary':
if(token==='else'){C.in_else=true
return new $AbstractExprCtx(C,false)
}
return $transition(C.parent,token,arguments[2])
case 'try':
if(token===':')return $BodyCtx(C)
$_SyntaxError(C,'token '+token+' after '+C)
case 'unary':
switch(token){case 'int':
case 'float':
case 'imaginary':
var expr=C.parent
C.parent.parent.tree.pop()
var value=arguments[2]
if(C.op==='-'){value="-"+value}
else if(C.op==='~'){value=~value}
return $transition(C.parent.parent,token,value)
case 'id':
C.parent.parent.tree.pop()
var expr=new $ExprCtx(C.parent.parent,'call',false)
var expr1=new $ExprCtx(expr,'id',false)
new $IdCtx(expr1,arguments[2])
if(C.op !=='+'){var repl=new $AttrCtx(expr)
if(C.op==='-'){repl.name='__neg__'}
else{repl.name='__invert__'}
var call=new $CallCtx(expr)
return expr1
}
return C.parent
case 'op':
if('+'==arguments[2]||'-'==arguments[2]){var op=arguments[2]
if(C.op===op){C.op='+'}else{C.op='-'}
return C
}}
return $transition(C.parent,token,arguments[2])
case 'with':
switch(token){case 'id':
if(C.expect==='id'){C.expect='as'
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}
if(C.expect==='alias'){if(C.parenth!==undefined){C.expect=','}
else{C.expect=':'}
C.set_alias(arguments[2])
return C
}
break
case 'as':
if(C.expect==='as'){
C.expect='alias'
C.has_alias=true
return C
}
break
case ':':
switch(C.expect){case 'id':
case 'as':
case ':':
return $BodyCtx(C)
}
break
case '(':
if(C.expect==='id' && C.tree.length===0){C.parenth=true
return C
}else if(C.expect=='alias'){C.expect=':'
return $transition(new $AbstractExprCtx(C,false),token)
}
break
case ')':
if(C.expect==',' ||C.expect=='as'){C.expect=':'
return C
}
break
case ',':
if(C.parenth!==undefined && C.has_alias===undefined &&
(C.expect==',' ||C.expect=='as')){C.expect='id'
return C
}else if(C.expect==':'){C.expect='id'
return C
}
break
}
$_SyntaxError(C,'token '+token+' after '+C.expect)
case 'yield':
if(token=='from'){
if(C.tree[0].type!='abstract_expr'){
$_SyntaxError(C,"'from' must follow 'yield'")
}
C.from=true
C.tree=[]
return new $AbstractExprCtx(C,true)
}
return $transition(C.parent,token)
}
}
$B.forbidden=['super','case','catch','constructor','Date','delete','default','Error','history','function','location','Math','new','null','Number','RegExp','this','var']
function $tokenize(src,module,locals_id,parent_block_id,line_info){var delimiters=[["#","\n","comment"],['"""','"""',"triple_string"],["'","'","string"],['"','"',"string"],["r'","'","raw_string"],['r"','"',"raw_string"]]
var br_open={"(":0,"[":0,"{":0}
var br_close={")":"(","]":"[","}":"{"}
var br_stack=""
var br_pos=new Array()
var kwdict=["class","return","break","for","lambda","try","finally","raise","def","from","nonlocal","while","del","global","with","as","elif","else","if","yield","assert","import","except","raise","in","not","pass","with","continue"
]
var unsupported=[]
var $indented=['class','def','for','condition','single_kw','try','except','with']
var punctuation={',':0,':':0}
var int_pattern=new RegExp("^\\d+(j|J)?")
var float_pattern1=new RegExp("^\\d+\\.\\d*([eE][+-]?\\d+)?(j|J)?")
var float_pattern2=new RegExp("^\\d+([eE][+-]?\\d+)(j|J)?")
var hex_pattern=new RegExp("^0[xX]([0-9a-fA-F]+)")
var octal_pattern=new RegExp("^0[oO]([0-7]+)")
var binary_pattern=new RegExp("^0[bB]([01]+)")
var id_pattern=new RegExp("[\\$_a-zA-Z]\\w*")
var qesc=new RegExp('"',"g")
var sqesc=new RegExp("'","g")
var C=null
var root=new $Node('module')
root.module=module
root.id=locals_id
$B.modules[root.id]=root
root.parent_block=$B.modules[parent_block_id]
root.line_info=line_info
root.indent=-1
if(locals_id!==module){$B.bound[locals_id]={}}
var new_node=new $Node()
var current=root
var name=""
var _type=null
var pos=0
indent=null
var lnum=1
while(pos<src.length){var flag=false
var car=src.charAt(pos)
if(indent===null){var indent=0
while(pos<src.length){var _s=src.charAt(pos)
if(_s==" "){indent++;pos++}
else if(_s=="\t"){
indent++;pos++
while(indent%8>0){indent++}}else{break}}
var _s=src.charAt(pos)
if(_s=='\n'){pos++;lnum++;indent=null;continue}
else if(_s==='#'){
var offset=src.substr(pos).search(/\n/)
if(offset===-1){break}
pos+=offset+1;lnum++;indent=null;continue
}
new_node.indent=indent
new_node.line_num=lnum
new_node.module=module
if(indent>current.indent){
if(C!==null){if($indented.indexOf(C.tree[0].type)==-1){$pos=pos
$_SyntaxError(C,'unexpected indent1',pos)
}}
current.add(new_node)
}else if(indent<=current.indent &&
$indented.indexOf(C.tree[0].type)>-1 &&
C.tree.length<2){$pos=pos
$_SyntaxError(C,'expected an indented block',pos)
}else{
while(indent!==current.indent){current=current.parent
if(current===undefined ||indent>current.indent){$pos=pos
$_SyntaxError(C,'unexpected indent2',pos)
}}
current.parent.add(new_node)
}
current=new_node
C=new $NodeCtx(new_node)
continue
}
if(car=="#"){var end=src.substr(pos+1).search('\n')
if(end==-1){end=src.length-1}
pos +=end+1;continue
}
if(car=='"' ||car=="'"){var raw=C.type=='str' && C.raw,bytes=false ,end=null
if(name.length>0){switch(name.toLowerCase()){case 'r': 
raw=true;name=''
break
case 'u':
name=''
break
case 'b':
bytes=true;name=''
break
case 'rb':
case 'br':
bytes=true;raw=true;name=''
break
}}
if(src.substr(pos,3)==car+car+car){_type="triple_string";end=pos+3}
else{_type="string";end=pos+1}
var escaped=false
var zone=car
var found=false
while(end<src.length){if(escaped){zone+=src.charAt(end)
if(raw && src.charAt(end)=='\\'){zone+='\\'}
escaped=false;end+=1
}else if(src.charAt(end)=="\\"){if(raw){if(end<src.length-1 && src.charAt(end+1)==car){zone +='\\\\'+car
end +=2
}else{zone +='\\\\'
end++
}
escaped=true
}else{
if(src.charAt(end+1)=='\n'){
end +=2
lnum++
}else{
zone+='\\' 
escaped=true;end+=1
}}}else if(src.charAt(end)==car){if(_type=="triple_string" && src.substr(end,3)!=car+car+car){zone +=src.charAt(end)
end++
}else{
found=true
$pos=pos
var $string=zone.substr(1),string=''
for(var i=0;i<$string.length;i++){var $car=$string.charAt(i)
if($car==car &&
(raw ||(i==0 ||$string.charAt(i-1)!=='\\'))){string +='\\'
}
string +=$car
}
if(bytes){C=$transition(C,'str','b'+car+string+car)
}else{C=$transition(C,'str',car+string+car)
}
C.raw=raw
pos=end+1
if(_type=="triple_string"){pos=end+3}
break
}}else{
zone +=src.charAt(end)
if(src.charAt(end)=='\n'){lnum++}
end++
}}
if(!found){if(_type==="triple_string"){$_SyntaxError(C,"Triple string end not found")
}else{$_SyntaxError(C,"String end not found")
}}
continue
}
if(name==""){if($B.re_XID_Start.exec(car)){name=car 
pos++;continue
}}else{
if($B.re_XID_Continue.exec(car)){name+=car
pos++;continue
}else{if(kwdict.indexOf(name)>-1){$pos=pos-name.length
if(unsupported.indexOf(name)>-1){$_SyntaxError(C,"Unsupported Python keyword '"+name+"'")
}
if(name=='not'){var re=/^\s+in\s+/
var res=re.exec(src.substr(pos))
if(res!==null){pos +=res[0].length
C=$transition(C,'op','not_in')
}else{C=$transition(C,name)
}}else{C=$transition(C,name)
}}else if($oplist.indexOf(name)>-1){
$pos=pos-name.length
C=$transition(C,'op',name)
}else{
if($B.forbidden.indexOf(name)>-1){name='$$'+name}
$pos=pos-name.length
C=$transition(C,'id',name)
}
name=""
continue
}}
if(car=="."){if(pos<src.length-1 && /^\d$/.test(src.charAt(pos+1))){
var j=pos+1
while(j<src.length && src.charAt(j).search(/\d/)>-1){j++}
C=$transition(C,'float','0'+src.substr(pos,j-pos))
pos=j
continue
}
$pos=pos
C=$transition(C,'.')
pos++;continue
}
if(car==="0"){var res=hex_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',parseInt(res[1],16))
pos +=res[0].length
continue
}
var res=octal_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',parseInt(res[1],8))
pos +=res[0].length
continue
}
var res=binary_pattern.exec(src.substr(pos))
if(res){C=$transition(C,'int',parseInt(res[1],2))
pos +=res[0].length
continue
}
if(src.charAt(pos+1).search(/\d/)>-1){$_SyntaxError(C,('invalid literal starting with 0'))
}}
if(car.search(/\d/)>-1){
var res=float_pattern1.exec(src.substr(pos))
if(res){$pos=pos
if(res[2]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))
}else{C=$transition(C,'float',res[0])}}else{res=float_pattern2.exec(src.substr(pos))
if(res){$pos=pos
if(res[2]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))
}else{C=$transition(C,'float',res[0])}}else{res=int_pattern.exec(src.substr(pos))
$pos=pos
if(res[1]!==undefined){C=$transition(C,'imaginary',res[0].substr(0,res[0].length-1))
}else{C=$transition(C,'int',res[0])}}}
pos +=res[0].length
continue
}
if(car=="\n"){lnum++
if(br_stack.length>0){
pos++;continue
}else{
if(current.C.tree.length>0){$pos=pos
C=$transition(C,'eol')
indent=null
new_node=new $Node()
}else{new_node.line_num=lnum
}
pos++;continue
}}
if(car in br_open){br_stack +=car
br_pos[br_stack.length-1]=[C,pos]
$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car in br_close){if(br_stack==""){$_SyntaxError(C,"Unexpected closing bracket")
}else if(br_close[car]!=br_stack.charAt(br_stack.length-1)){$_SyntaxError(C,"Unbalanced bracket")
}else{
br_stack=br_stack.substr(0,br_stack.length-1)
$pos=pos
C=$transition(C,car)
pos++;continue
}}
if(car=="="){if(src.charAt(pos+1)!="="){$pos=pos
C=$transition(C,'=')
pos++;continue
}else{
$pos=pos
C=$transition(C,'op','==')
pos+=2;continue
}}
if(car in punctuation){$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car===";"){
$transition(C,'eol')
if(current.C.tree.length===0){
$pos=pos
$_SyntaxError(C,'invalid syntax')
}
var pos1=pos+1
var ends_line=false
while(pos1<src.length){var _s=src.charAt(pos1)
if(_s=='\n' ||_s=='#'){ends_line=true;break
}else if(_s==' '){pos1++}
else{break}}
if(ends_line){pos++;continue}
new_node=new $Node()
new_node.indent=current.indent
new_node.line_num=lnum
new_node.module=module
current.parent.add(new_node)
current=new_node
C=new $NodeCtx(new_node)
pos++;continue
}
if($first_op_letter.indexOf(car)>-1){
var op_match=""
for(var op_sign in $operators){if(op_sign==src.substr(pos,op_sign.length)
&& op_sign.length>op_match.length){op_match=op_sign
}}
$pos=pos
if(op_match.length>0){if(op_match in $augmented_assigns){C=$transition(C,'augm_assign',op_match)
}else{C=$transition(C,'op',op_match)
}
pos +=op_match.length
continue
}}
if(car=='\\' && src.charAt(pos+1)=='\n'){lnum++;pos+=2;continue
}
if(car=='@'){$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car!=' '&&car!=='\t'){$pos=pos;$_SyntaxError(C,'unknown token ['+car+']')}
pos +=1
}
if(br_stack.length!=0){var br_err=br_pos[0]
$pos=br_err[1]
$_SyntaxError(br_err[0],["Unbalanced bracket "+br_stack.charAt(br_stack.length-1)])
}
if(C!==null && $indented.indexOf(C.tree[0].type)>-1){$pos=pos-1
$_SyntaxError(C,'expected an indented block',pos)
}
return root
}
$B.py2js=function(src,module,locals_id,parent_block_id,line_info){
var t0=new Date().getTime()
var src=src.replace(/\r\n/gm,'\n')
var $n=0
var _src=src.charAt(0)
var _src_length=src.length
while(_src_length>$n &&(_src=="\n" ||_src=="\r")){$n++
_src=src.charAt($n)
}
src=src.substr($n)
if(src.charAt(src.length-1)!="\n"){src+='\n'}
if(module===undefined){module='__main__'}
if(locals_id===undefined){locals_id=module}
$B.vars[module]=$B.vars[module]||{}
$B.bound[module]=$B.bound[module]||{}
$B.vars[locals_id]=$B.vars[locals_id]||{}
$B.bound[module]['__doc__']=true
$B.bound[module]['__name__']=true
$B.bound[module]['__file__']=true
$B.$py_src[locals_id]=src
var root=$tokenize(src,module,locals_id,parent_block_id,line_info)
root.transform()
var js='var $B=__BRYTHON__\n'
js +='var __builtins__ = _b_ = $B.builtins\n'
js +='var $globals = $B.vars["'+module+'"];\n'
js +='var $locals_id = "'+locals_id+'";\n'
js +='var $locals = $B.vars["'+locals_id+'"];\n'
js +='var $s=[];\n'
js +='for(var $b in _b_) $s.push(\'var \' + $b +\'=_b_["\'+$b+\'"]\');\n'
js +='eval($s.join(";"))\n'
var new_node=new $Node()
new $NodeJSCtx(new_node,js)
root.insert(0,new_node)
var ds_node=new $Node()
new $NodeJSCtx(ds_node,'$locals["__doc__"]='+root.doc_string)
root.insert(1,ds_node)
var name_node=new $Node()
var lib_module=module
if(module.substr(0,9)=='__main__,'){lib_module='__main__'}
new $NodeJSCtx(name_node,'$locals["__name__"]="'+locals_id+'"')
root.insert(2,name_node)
var file_node=new $Node()
new $NodeJSCtx(file_node,'$locals["__file__"]="'+$B.$py_module_path[module]+'";None;\n')
root.insert(3,file_node)
if($B.debug>0){$add_line_num(root,null,module)}
if($B.debug>=2){var t1=new Date().getTime()
console.log('module '+module+' translated in '+(t1 - t0)+' ms')
}
return root
}
function brython(options){var _b_=$B.builtins
$B.$py_src={}
$B.$py_module_path={}
$B.meta_path=[]
$B.$options={}
$B.$py_next_hash=-Math.pow(2,53)
$B.lambda_magic=Math.random().toString(36).substr(2,8)
$B.callbacks={}
if(options===undefined)options={'debug':0}
if(typeof options==='number')options={'debug':options}
$B.debug=options.debug
_b_.__debug__=$B.debug>0
if(options.static_stdlib_import===undefined){options.static_stdlib_import=true}
$B.static_stdlib_import=options.static_stdlib_import
if(options.open !==undefined)_b_.open=options.open
$B.$CORS=false 
if(options.CORS !==undefined)$B.$CORS=options.CORS
$B.$options=options
$B.exception_stack=[]
$B.call_stack=[]
if(options.ipy_id!==undefined){var $elts=[]
for(var $i=0;$i<options.ipy_id.length;$i++){$elts.push(document.getElementById(options.ipy_id[$i]))
}}else{var $elts=document.getElementsByTagName('script')
}
var $href=$B.script_path=window.location.href
var $href_elts=$href.split('/')
$href_elts.pop()
if(options.pythonpath!==undefined)$B.path=options.pythonpath
if(options.re_module !==undefined){if(options.re_module=='pyre' ||options.re_module=='jsre'){$B.$options.re=options.re
}}
for(var $i=0;$i<$elts.length;$i++){var $elt=$elts[$i]
if($elt.type=="text/python"||$elt.type==="text/python3"){
var $src=null
if($elt.src){
if(window.XMLHttpRequest){
var $xmlhttp=new XMLHttpRequest()
}else{
var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
}
$xmlhttp.onreadystatechange=function(){var state=this.readyState
if(state===4){$src=$xmlhttp.responseText
}}
$xmlhttp.open('GET',$elt.src,false)
$xmlhttp.send()
if($xmlhttp.status !=200){var msg="can't open file '"+$elt.src
msg +="': No such file or directory"
console.log(msg)
return
}
$B.$py_module_path['__main__']=$elt.src
var $src_elts=$elt.src.split('/')
$src_elts.pop()
var $src_path=$src_elts.join('/')
if($B.path.indexOf($src_path)==-1){
$B.path.splice(0,0,$src_path)
}}else{
var $src=($elt.innerHTML ||$elt.textContent)
$B.$py_module_path['__main__']=$href
}
try{
var $root=$B.py2js($src,'__main__','__main__','__builtins__')
var $js=$root.to_js()
if($B.debug>1)console.log($js)
eval($js)
var _mod=$globals
_mod.__class__=$B.$ModuleDict
_mod.__name__='__main__'
_mod.__file__=$B.$py_module_path['__main__']
$B.imported['__main__']=_mod
}catch($err){if($B.debug>1){console.log('PY2JS '+$err)
for(var attr in $err){console.log(attr+' : '+$err[attr])
}
console.log('line info '+$B.line_info)
}
if($err.py_error===undefined)$err=_b_.RuntimeError($err+'')
var $trace=$err.__name__+': '+$err.message+'\n'+$err.info
_b_.getattr($B.stderr,'write')($trace)
throw $err
}}}}
$B.$operators=$operators
$B.$Node=$Node
$B.$NodeJSCtx=$NodeJSCtx
$B.brython=brython
})(__BRYTHON__)
var brython=__BRYTHON__.brython

__BRYTHON__.$__new__=function(factory){return function(cls){if(cls===undefined){throw __BRYTHON__.builtins.TypeError(factory.$dict.__name__+'.__new__(): not enough arguments')
}
var res=factory.apply(null,[])
res.__class__=cls.$dict
var init_func=null
try{init_func=__BRYTHON__.builtins.getattr(res,'__init__')}
catch(err){__BRYTHON__.$pop_exc()}
if(init_func!==null){var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
init_func.apply(null,args)
res.__initialized__=true
}
return res
}}
__BRYTHON__.builtins.object=(function($B){var _b_=$B.builtins
var $ObjectDict={
__name__:'object',$native:true
}
var $ObjectNI=function(name,op){return function(other){throw _b_.TypeError('unorderable types: object() '+op+
' '+ _b_.str($B.get_class(other).__name__)+'()')
}}
var opnames=['add','sub','mul','truediv','floordiv','mod','pow','lshift','rshift','and','xor','or']
var opsigns=['+','-','*','/','//','%','**','<<','>>','&','^','|']
$ObjectDict.__delattr__=function(self,attr){delete self[attr]}
$ObjectDict.__dir__=function(self){var res=[]
var objects=[self]
var mro=self.__class__.__mro__
for(var i=0,_len_i=mro.length;i < _len_i;i++){objects.push(mro[i])
}
for(var i=0,_len_i=objects.length;i < _len_i;i++){for(var attr in objects[i]){
if(attr.charAt(0)=='$' && attr.charAt(1)!='$'){
continue
}
res.push(attr)
}}
res=_b_.list(_b_.set(res))
_b_.list.$dict.sort(res)
return res
}
$ObjectDict.__eq__=function(self,other){
return self===other
}
$ObjectDict.__ge__=$ObjectNI('__ge__','>=')
$ObjectDict.__getattribute__=function(obj,attr){var klass=$B.get_class(obj)
if(attr==='__class__'){return klass.$factory
}
var res=obj[attr],args=[]
if(res===undefined){
var mro=klass.__mro__
for(var i=0,_len_i=mro.length;i < _len_i;i++){var v=mro[i][attr]
if(v!==undefined){res=v
break
}}}else{if(res.__set__===undefined){
return res
}}
if(res!==undefined){var get_func=res.__get__
if(get_func===undefined &&(typeof res=='object')){var __get__=_b_.getattr(res,'__get__',null)
if(__get__ &&(typeof __get__=='function')){get_func=function(x,y){return __get__.apply(x,[y,klass])}}}
if(get_func===undefined &&(typeof res=='function')){get_func=function(x){return x}}
if(get_func!==undefined){
res.__name__=attr
if(attr=='__new__'){res.$type='staticmethod'}
var res1=get_func.apply(null,[res,obj,klass])
if(typeof res1=='function'){
if(res1.__class__===$B.$factory)return res
var __self__,__func__=res,__repr__,__str__
switch(res.$type){case undefined:
case 'function':
args=[obj]
__self__=obj
__func__=res1
__repr__=__str__=function(){var x='<bound method '+attr
x +=" of '"+klass.__name__+"' object>"
return x
}
break
case 'instancemethod':
return res
case 'classmethod':
args=[klass]
__self__=klass
__func__=res1
__repr__=__str__=function(){var x='<bound method type'+'.'+attr
x +=' of '+klass.__name__+'>'
return x
}
break
case 'staticmethod':
args=[]
__repr__=__str__=function(){return '<function '+klass.__name__+'.'+attr+'>'
}}
var method=(function(initial_args){return function(){
var local_args=initial_args.slice()
for(var i=0,_len_i=arguments.length;i < _len_i;i++){local_args.push(arguments[i])
}
var x=res.apply(obj,local_args)
if(x===undefined)return _b_.None
return x
}})(args)
method.__class__=$B.$InstanceMethodDict
method.__eq__=function(other){return other.$res===res
}
method.__func__=__func__
method.__repr__=__repr__
method.__self__=__self__
method.__str__=__str__
method.__code__={'__class__' : $B.CodeDict}
method.__doc__=res.__doc__ ||''
method.$type='instancemethod'
method.$res=res
return method
}else{
return res1
}}
return res
}else{
var _ga=obj['__getattr__']
if(_ga===undefined){var mro=klass.__mro__
if(mro===undefined){console.log('in getattr mro undefined for '+obj)}
for(var i=0,_len_i=mro.length;i < _len_i;i++){var v=mro[i]['__getattr__']
if(v!==undefined){_ga=v
break
}}}
if(_ga!==undefined){try{return _ga(obj,attr)}
catch(err){void(0)}}
if(attr.substr(0,2)=='__' && attr.substr(attr.length-2)=='__'){var attr1=attr.substr(2,attr.length-4)
var rank=opnames.indexOf(attr1)
if(rank > -1){var rop='__r'+opnames[rank]+'__' 
return function(){try{
if($B.$get_class(arguments[0])===klass){throw Error('')}
return _b_.getattr(arguments[0],rop)(obj)
}catch(err){var msg="unsupported operand types for "+opsigns[rank]+": '"
msg +=klass.__name__+"' and '"+arguments[0].__class__.__name__+"'"
throw _b_.TypeError(msg)
}}}}
}}
$ObjectDict.__gt__=$ObjectNI('__gt__','>')
$ObjectDict.__hash__=function(self){$B.$py_next_hash+=1;
return $B.$py_next_hash
}
$ObjectDict.__init__=function(){}
$ObjectDict.__le__=$ObjectNI('__le__','<=')
$ObjectDict.__lt__=$ObjectNI('__lt__','<')
$ObjectDict.__mro__=[$ObjectDict]
$ObjectDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('object.__new__(): not enough arguments')}
var obj=new Object()
obj.__class__=cls.$dict
return obj
}
$ObjectDict.__ne__=function(self,other){return self!==other}
$ObjectDict.__or__=function(self,other){if(_b_.bool(self))return self
return other
}
$ObjectDict.__repr__=function(self){if(self===object ||self===undefined)return "<class 'object'>"
if(self.__class__===$B.$type)return "<class '"+self.__class__.__name__+"'>"
return "<"+self.__class__.__name__+" object>"
}
$ObjectDict.__setattr__=function(self,attr,val){if(val===undefined){
throw _b_.TypeError("can't set attributes of built-in/extension type 'object'")
}else if(self.__class__===$ObjectDict){
if($ObjectDict[attr]===undefined){throw _b_.AttributeError("'object' object has no attribute '"+attr+"'")
}else{throw _b_.AttributeError("'object' object attribute '"+attr+"' is read-only")
}}
self[attr]=val
}
$ObjectDict.__setattr__.__str__=function(){return 'method object.setattr'}
$ObjectDict.__str__=$ObjectDict.__repr__
function object(){return{__class__:$ObjectDict}}
object.$dict=$ObjectDict
$ObjectDict.$factory=object
object.__repr__=object.__str__=function(){return "<class 'object'>"}
return object
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
$B.$class_constructor=function(class_name,class_obj,parents,parents_names,kwargs){var cl_dict=_b_.dict(),bases=null
for(var attr in class_obj){_b_.dict.$dict.__setitem__(cl_dict,attr,class_obj[attr])
}
if(parents!==undefined){for(var i=0;i<parents.length;i++){if(parents[i]===undefined){
$B.line_info=class_obj.$def_line
throw _b_.NameError("name '"+parents_names[i]+"' is not defined")
}}}
bases=parents
if(bases.indexOf(_b_.object)==-1){bases=bases.concat(_b_.tuple([_b_.object]))
}
var metaclass=_b_.type
for(var i=0;i<kwargs.length;i++){var key=kwargs[i][0],val=kwargs[i][1]
if(key=='metaclass'){metaclass=val}}
if(metaclass===_b_.type){
for(var i=0;i<parents.length;i++){if(parents[i].$dict.__class__!==$B.$type){metaclass=parents[i].__class__.$factory
break
}}}
if(metaclass===_b_.type)return _b_.type(class_name,bases,cl_dict)
var factory=function(){return $instance_creator($B.class_dict).apply(null,arguments)
}
var new_func=_b_.getattr(metaclass,'__new__')
var factory=_b_.getattr(metaclass,'__new__').apply(null,[factory,class_name,bases,cl_dict])
_b_.getattr(metaclass,'__init__').apply(null,[factory,class_name,bases,cl_dict])
for(var member in metaclass.$dict){if(typeof metaclass.$dict[member]=='function' && member !='__new__'){metaclass.$dict[member].$type='classmethod'
}}
factory.__class__={__class__:$B.$type,$factory:metaclass,is_class:true,__code__:{'__class__': $B.CodeDict},__mro__:metaclass.$dict.__mro__
}
factory.$dict.__class__=metaclass.$dict
factory.$is_func=true
return factory
}
_b_.type=function(name,bases,cl_dict){
if(arguments.length==1){return $B.get_class(name).$factory}
var class_dict=$B.class_dict=new Object()
class_dict.__class__=$B.$type
class_dict.__name__=name.replace('$$','')
class_dict.__bases__=bases
class_dict.__dict__=cl_dict
for(var i=0;i<cl_dict.$keys.length;i++){var attr=cl_dict.$keys[i],val=cl_dict.$values[i]
class_dict[attr]=val
}
var seqs=[]
for(var i=0;i<bases.length;i++){
if(bases[i]===_b_.str)bases[i]=$B.$StringSubclassFactory
var bmro=[]
var _tmp=bases[i].$dict.__mro__
for(var k=0;k<_tmp.length;k++){bmro.push(_tmp[k])
}
seqs.push(bmro)
}
for(var i=0;i<bases.length;i++)seqs.push(bases[i].$dict)
var mro=[]
while(1){var non_empty=[]
for(var i=0;i<seqs.length;i++){if(seqs[i].length>0)non_empty.push(seqs[i])
}
if(non_empty.length==0)break
for(var i=0;i<non_empty.length;i++){var seq=non_empty[i],candidate=seq[0],not_head=[]
for(var j=0;j<non_empty.length;j++){var s=non_empty[j]
if(s.slice(1).indexOf(candidate)>-1){not_head.push(s)}}
if(not_head.length>0){candidate=null}
else{break}}
if(candidate===null){throw _b_.TypeError("inconsistent hierarchy, no C3 MRO is possible")
}
mro.push(candidate)
for(var i=0;i<seqs.length;i++){var seq=seqs[i]
if(seq[0]===candidate){
seqs[i].shift()
}}}
class_dict.__mro__=[class_dict].concat(mro)
var creator=$instance_creator(class_dict)
var factory=function(){return creator.apply(null,arguments)}
factory.__class__=$B.$factory
factory.$dict=class_dict
factory.$is_func=true 
factory.__eq__=function(other){return other===factory.__class__}
class_dict.$factory=factory
return factory
}
$B.$type={$factory: _b_.type,__init__ : function(self,name,bases,dct){},__name__:'type',__new__ : function(self,name,bases,dct){return _b_.type(name,bases,dct)
},__str__ : function(){return "<class 'type'>"}}
$B.$type.__class__=$B.$type
$B.$type.__mro__=[$B.$type,_b_.object.$dict]
_b_.type.$dict=$B.$type
$B.$factory={__class__:$B.$type,$factory:_b_.type,is_class:true
}
$B.$factory.__mro__=[$B.$factory,$B.$type]
_b_.object.$dict.__class__=$B.$type
_b_.object.__class__=$B.$factory
$B.$type.__getattribute__=function(klass,attr){
switch(attr){case '__call__':
return $instance_creator(klass)
case '__eq__':
return function(other){return klass.$factory===other}
case '__ne__':
return function(other){return klass.$factory!==other}
case '__repr__':
return function(){return "<class '"+klass.__name__+"'>"}
case '__str__':
return function(){return "<class '"+klass.__name__+"'>"}
case '__class__':
return klass.__class__.$factory
case '__doc__':
return klass.__doc__
case '__setattr__':
if(klass['__setattr__']!==undefined)return klass['__setattr__']
return function(key,value){if(typeof value=='function'){klass[key]=value 
}else{klass[key]=value
}}
case '__delattr__':
if(klass['__delattr__']!==undefined)return klass['__delattr__']
return function(key){delete klass[key]}}
var res=klass[attr],is_class=true
if(res===undefined){
var mro=klass.__mro__
if(mro===undefined){console.log('mro undefined for class '+klass+' name '+klass.__name__)}
for(var i=0;i<mro.length;i++){var v=mro[i][attr]
if(v!==undefined){res=v
break
}}
if(res===undefined){
var cl_mro=klass.__class__.__mro__
if(cl_mro!==undefined){for(var i=0;i<cl_mro.length;i++){var v=cl_mro[i][attr]
if(v!==undefined){res=v
break
}}}}}
if(res!==undefined){
if(res.__class__===$B.$PropertyDict)return res
var get_func=res.__get__
if(get_func===undefined &&(typeof res=='function')){get_func=function(x){return x}}
if(get_func===undefined)return res
if(attr=='__new__'){res.$type='staticmethod'}
var res1=get_func.apply(null,[res,$B.builtins.None,klass])
var args
if(typeof res1=='function'){res.__name__=attr
var __self__,__func__=res1,__repr__,__str__
switch(res.$type){case undefined:
case 'function':
case 'instancemethod':
args=[]
__repr__=__str__=function(){return '<unbound method '+klass.__name__+'.'+attr+'>'
}
break
case 'classmethod':
args=[klass.$factory]
__self__=klass
__repr__=__str__=function(){var x='<bound method '+klass.__name__+'.'+attr
x +=' of '+klass.__name__+'>'
return x
}
break
case 'staticmethod':
args=[]
__repr__=__str__=function(){return '<function '+klass.__name__+'.'+attr+'>'
}
break
}
var method=(function(initial_args){return function(){
var local_args=initial_args.slice()
for(var i=0;i < arguments.length;i++){local_args.push(arguments[i])
}
return res.apply(null,local_args)
}})(args)
method.__class__={__class__:$B.$type,__name__:'method',__mro__:[$B.builtins.object.$dict]
}
method.__eq__=function(other){return other.__func__===__func__
}
method.__func__=__func__
method.__repr__=__repr__
method.__self__=__self__
method.__str__=__str__
method.__code__={'__class__': $B.CodeDict}
method.__doc__=res.__doc__ ||''
method.im_class=klass
return method
}}}
function $instance_creator(klass){
var new_func=null
try{new_func=_b_.getattr(klass,'__new__')}
catch(err){$B.$pop_exc()}
var init_func=null
try{init_func=_b_.getattr(klass,'__init__')}
catch(err){$B.$pop_exc()}
if(klass.__bases__.length==1 && klass.__new__==undefined &&
init_func!==null){
if(klass.__setattr__===undefined){return function(){var obj={__class__:klass,$simple_setattr:true}
init_func.apply(null,[obj].concat(Array.prototype.slice.call(arguments)))
return obj
}}else{return function(){var obj={__class__:klass}
init_func.apply(null,[obj].concat(Array.prototype.slice.call(arguments)))
return obj
}}}
return function(){var obj
var _args=Array.prototype.slice.call(arguments)
if(klass.__bases__.length==1 && klass.__new__==undefined){obj={__class__:klass}}else{if(new_func!==null){obj=new_func.apply(null,[klass.$factory].concat(_args))
}}
if(!obj.__initialized__){if(init_func!==null){init_func.apply(null,[obj].concat(_args))
}}
return obj
}}
function $MethodFactory(){}
$MethodFactory.__name__='method'
$MethodFactory.__class__=$B.$factory
$MethodFactory.__repr__=$MethodFactory.__str__=function(){return 'method'}
$B.$MethodDict={__class__:$B.$type,__name__:'method',__mro__:[_b_.object.$dict],$factory:$MethodFactory
}
$MethodFactory.$dict=$B.$MethodDict
$B.$InstanceMethodDict={__class__:$B.$type,__name__:'instancemethod',__mro__:[_b_.object.$dict],$factory:$MethodFactory
}})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
$B.$MakeArgs=function($fname,$args,$required,$defaults,$other_args,$other_kw,$after_star){
var $ns={},$arg
var $robj={}
for(var i=0;i<$required.length;i++){$robj[$required[i]]=null}
var $dobj={}
for(var i=0;i<$defaults.length;i++){$dobj[$defaults[i]]=null}
if($other_args !=null){$ns[$other_args]=[]}
if($other_kw !=null){var $dict_keys=[],$dict_values=[]}
var upargs=[]
for(var i=0,_len_i=$args.length;i < _len_i;i++){$arg=$args[i]
if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
else if($arg===null){upargs.push(null)}
else{
switch($arg.$nat){case 'ptuple':
var _arg=$arg.arg
for(var j=0,_len_j=_arg.length;j < _len_j;j++)upargs.push(_arg[j])
break
case 'pdict':
var _arg=$arg.arg
for(var j=0,_len_j=_arg.$keys.length;j < _len_j;j++){upargs.push({$nat:"kw",name:_arg.$keys[j],value:_arg.$values[j]})
}
break
default:
upargs.push($arg)
}
}
}
var nbreqset=0 
for(var $i=0,_len_$i=upargs.length;$i < _len_$i;$i++){var $arg=upargs[$i]
var $PyVar=$B.$JS2Py($arg)
if($arg && $arg.$nat=='kw'){
$PyVar=$arg.value
if($ns[$arg.name]!==undefined){throw _b_.TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
}else if($robj[$arg.name]===null){$ns[$arg.name]=$PyVar
nbreqset++
}else if($other_args!==null && $after_star!==undefined &&
$after_star.indexOf($arg.name)>-1){var ix=$after_star.indexOf($arg.name)
$ns[$after_star[ix]]=$PyVar
}else if($dobj[$arg.name]===null){$ns[$arg.name]=$PyVar
var pos_def=$defaults.indexOf($arg.name)
$defaults.splice(pos_def,1)
delete $dobj[$arg.name]
}else if($other_kw!=null){$dict_keys.push($arg.name)
$dict_values.push($PyVar)
}else{
throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
}}else{
if($i<$required.length){$ns[$required[$i]]=$PyVar
nbreqset++
}else if($other_args!==null){$ns[$other_args].push($PyVar)
}else if($i<$required.length+$defaults.length){$ns[$defaults[$i-$required.length]]=$PyVar
}else{
console.log(''+$B.line_info)
msg=$fname+"() takes "+$required.length+' positional argument'
msg +=$required.length==1 ? '' : 's'
msg +=' but more were given'
throw _b_.TypeError(msg)
}}}
if(nbreqset!==$required.length){
var missing=[]
for(var i=0,_len_i=$required.length;i < _len_i;i++){if($ns[$required[i]]===undefined){missing.push($required[i])}}
if(missing.length==1){throw _b_.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
}else if(missing.length>1){var msg=$fname+" missing "+missing.length+" positional arguments: "
for(var i=0,_len_i=missing.length-1;i < _len_i;i++){msg +="'"+missing[i]+"', "}
msg +="and '"+missing.pop()+"'"
throw _b_.TypeError(msg)
}}
if($other_kw!=null){$ns[$other_kw]=_b_.dict()
$ns[$other_kw].$keys=$dict_keys
$ns[$other_kw].$values=$dict_values
}
if($other_args!=null){$ns[$other_args]=_b_.tuple($ns[$other_args])}
return $ns
}
$B.$MakeArgs1=function($fname,$args,$robj,$required,$dobj,$defaults,$other_args,$other_kw,$after_star){
var $ns={},$arg
if($other_args !=null){$ns[$other_args]=[]}
if($other_kw !=null){var $dict_keys=[],$dict_values=[]}
var upargs=[]
for(var i=0,_len_i=$args.length;i < _len_i;i++){$arg=$args[i]
if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
else if($arg===null){upargs.push(null)}
else{
switch($arg.$nat){case 'ptuple':
var _arg=$arg.arg
for(var j=0,_len_j=_arg.length;j < _len_j;j++)upargs.push(_arg[j])
break
case 'pdict':
var _arg=$arg.arg
for(var j=0,_len_j=_arg.$keys.length;j < _len_j;j++){upargs.push({$nat:"kw",name:_arg.$keys[j],value:_arg.$values[j]})
}
break
default:
upargs.push($arg)
}
}
}
var nbreqset=0 
for(var $i=0,_len_$i=upargs.length;$i < _len_$i;$i++){var $arg=upargs[$i]
var $PyVar=$B.$JS2Py($arg)
if($arg && $arg.$nat=='kw'){
$PyVar=$arg.value
if($ns[$arg.name]!==undefined){throw _b_.TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
}else if($robj[$arg.name]===null){$ns[$arg.name]=$PyVar
nbreqset++
}else if($other_args!==null && $after_star!==undefined &&
$after_star.indexOf($arg.name)>-1){var ix=$after_star.indexOf($arg.name)
$ns[$after_star[ix]]=$PyVar
}else if($dobj[$arg.name]===null){$ns[$arg.name]=$PyVar
var pos_def=$defaults.indexOf($arg.name)
$defaults.splice(pos_def,1)
delete $dobj[$arg.name]
}else if($other_kw!=null){$dict_keys.push($arg.name)
$dict_values.push($PyVar)
}else{
throw _b_.TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
}}else{
if($i<$required.length){$ns[$required[$i]]=$PyVar
nbreqset++
}else if($other_args!==null){$ns[$other_args].push($PyVar)
}else if($i<$required.length+$defaults.length){$ns[$defaults[$i-$required.length]]=$PyVar
}else{
console.log(''+$B.line_info)
msg=$fname+"() takes "+$required.length+' positional argument'
msg +=$required.length==1 ? '' : 's'
msg +=' but more were given'
throw _b_.TypeError(msg)
}}}
if(nbreqset!==$required.length){
var missing=[]
for(var i=0,_len_i=$required.length;i < _len_i;i++){if($ns[$required[i]]===undefined){missing.push($required[i])}}
if(missing.length==1){throw _b_.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
}else if(missing.length>1){var msg=$fname+" missing "+missing.length+" positional arguments: "
for(var i=0,_len_i=missing.length-1;i < _len_i;i++){msg +="'"+missing[i]+"', "}
msg +="and '"+missing.pop()+"'"
throw _b_.TypeError(msg)
}}
if($other_kw!=null){$ns[$other_kw]=_b_.dict()
$ns[$other_kw].$keys=$dict_keys
$ns[$other_kw].$values=$dict_values
}
if($other_args!=null){$ns[$other_args]=_b_.tuple($ns[$other_args])}
return $ns
}
$B.get_class=function(obj){
if(obj===null){return $B.$NoneDict}
var klass=obj.__class__
if(klass===undefined){switch(typeof obj){case 'number':
obj.__class__=_b_.int.$dict
return _b_.int.$dict
case 'string':
obj.__class__=_b_.str.$dict
return _b_.str.$dict
case 'boolean':
obj.__class__=$B.$BoolDict
return $B.$BoolDict
case 'function':
obj.__class__=$B.$FunctionDict
return $B.$FunctionDict
case 'object':
if(obj.constructor===Array){obj.__class__=_b_.list.$dict
return _b_.list.$dict
}}}
return klass
}
$B.$mkdict=function(glob,loc){var res={}
for(var arg in glob)res[arg]=glob[arg]
for(var arg in loc)res[arg]=loc[arg]
return res
}
$B.$list_comp=function(module_name,parent_block_id){var $ix=Math.random().toString(36).substr(2,8)
var $py='def func'+$ix+"():\n"
$py +="    x"+$ix+"=[]\n"
var indent=4
for(var $i=3,_len_$i=arguments.length;$i < _len_$i;$i++){$py +=' '.repeat(indent)
$py +=arguments[$i]+':\n'
indent +=4
}
$py +=' '.repeat(indent)
$py +='x'+$ix+'.append('+arguments[2].join('\n')+')\n'
$py +="    return x"+$ix+"\n"
$py +="res"+$ix+"=func"+$ix+"()"
var $mod_name='lc'+$ix
var $root=$B.py2js($py,module_name,$mod_name,parent_block_id,$B.line_info)
$root.caller=$B.line_info
var $js=$root.to_js()
try{eval($js)}
catch(err){throw $B.exception(err)}
return $B.vars['lc'+$ix]['res'+$ix]
}
$B.$gen_expr=function(){
var module_name=arguments[0]
var parent_block_id=arguments[1]
var $ix=Math.random().toString(36).substr(2,8)
var $res='res'+$ix
var $py=$res+"=[]\n"
var indent=0
for(var $i=3,_len_$i=arguments.length;$i < _len_$i;$i++){for(var $j=0;$j<indent;$j++)$py +=' '
$py +=arguments[$i].join(' ')+':\n'
indent +=4
}
for(var $j=0;$j<indent;$j++)$py +=' '
$py +=$res+'.append('+arguments[2].join('\n')+')'
var $mod_name='ge'+$ix
$B.vars[$mod_name]={}
var $root=$B.py2js($py,module_name,$mod_name,parent_block_id,$B.line_info)
var $js=$root.to_js()
eval($js)
var $res1=$B.vars["ge"+$ix]["res"+$ix]
var $GenExprDict={__class__:$B.$type,__name__:'generator',toString:function(){return '(generator)'}}
$GenExprDict.__mro__=[$GenExprDict,_b_.object.$dict]
$GenExprDict.__iter__=function(self){return self}
$GenExprDict.__next__=function(self){self.$counter +=1
if(self.$counter==self.value.length){throw _b_.StopIteration('')
}
return self.value[self.$counter]
}
$GenExprDict.__str__=function(self){if(self===undefined)return "<class 'generator'>"
return '<generator object <genexpr>>'
}
$GenExprDict.$factory=$GenExprDict
var $res2={value:$res1,__class__:$GenExprDict,$counter:-1}
$res2.toString=function(){return 'ge object'}
return $res2
}
$B.$dict_comp=function(module_name,parent_block_id){
var $ix=Math.random().toString(36).substr(2,8)
var $res='res'+$ix
var $py=$res+"={}\n"
var indent=0
for(var $i=3,_len_$i=arguments.length;$i < _len_$i;$i++){for(var $j=0;$j<indent;$j++)$py +=' '
$py +=arguments[$i]+':\n'
indent +=4
}
for(var $j=0;$j<indent;$j++)$py +=' '
$py +=$res+'.update({'+arguments[2].join('\n')+'})'
var locals_id='dc'+$ix
var $root=$B.py2js($py,module_name,locals_id,parent_block_id)
$root.caller=$B.line_info
var $js=$root.to_js()
eval($js)
return $B.vars[locals_id][$res]
}
$B.$lambda=function(locals,$mod,parent_block_id,$args,$body){var rand=Math.random().toString(36).substr(2,8)
var $res='lambda_'+$B.lambda_magic+'_'+rand
var local_id='lambda'+rand
var $py='def '+$res+'('+$args+'):\n'
$py +='    return '+$body
$B.vars[local_id]=$B.vars[local_id]||{}
for(var $attr in locals){$B.vars[local_id][$attr]=locals[$attr]
}
var $js=$B.py2js($py,$mod,local_id,parent_block_id).to_js()
eval($js)
var $res=$B.vars[local_id][$res]
$res.__module__=$mod
$res.__name__='<lambda>'
return $res
}
$B.$search=function(name,globals_id){var res=$B.vars[globals_id][name]
return res !==undefined ? res : $B.$NameError(name)
}
$B.$JS2Py=function(src){if(typeof src==='number'){if(src%1===0)return src
return _b_.float(src)
}
if(src===null||src===undefined)return _b_.None
var klass=$B.get_class(src)
if(klass!==undefined){if(klass===_b_.list.$dict){for(var i=0,_len_i=src.length;i< _len_i;i++)src[i]=$B.$JS2Py(src[i])
}
return src
}
if(typeof src=="object"){if($B.$isNode(src))return $B.$DOMNode(src)
if($B.$isEvent(src))return $B.DOMEvent(src)
if(src.constructor===Array||$B.$isNodeList(src)){var res=[]
for(var i=0,_len_i=src.length;i < _len_i;i++)res.push($B.$JS2Py(src[i]))
return res
}}
return $B.JSObject(src)
}
$B.$getitem=function(obj,item){if(Array.isArray(obj)&& typeof item=='number' && obj[item]!==undefined){return item >=0 ? obj[item]: obj[obj.length+item]
}
return _b_.getattr(obj,'__getitem__')(item)
}
$B.$setitem=function(obj,item,value){if(Array.isArray(obj)&& typeof item=='number'){if(item<0){item+=obj.length}
if(obj[item]===undefined){throw _b_.IndexError("list assignment index out of range")}
obj[item]=value
return
}
_b_.getattr(obj,'__setitem__')(item,value)
}
$B.augm_item_add=function(obj,item,incr){if(Array.isArray(obj)&& typeof item=="number" &&
obj[item]!==undefined){obj[item]+=incr
return
}
var ga=_b_.getattr
try{var augm_func=ga(ga(obj,'__getitem__')(item),'__iadd__')
console.log('has augmfunc')
}catch(err){ga(obj,'__setitem__')(item,ga(ga(obj,'__getitem__')(item),'__add__')(incr))
return
}
augm_func(value)
}
var augm_item_src=''+$B.augm_item_add
var augm_ops=[['-=','sub'],['*=','mul']]
for(var i=0,_len_i=augm_ops.length;i < _len_i;i++){var augm_code=augm_item_src.replace(/add/g,augm_ops[i][1])
augm_code=augm_code.replace(/\+=/g,augm_ops[i][0])
eval('$B.augm_item_'+augm_ops[i][1]+'='+augm_code)
}
$B.$raise=function(){
var es=$B.exception_stack
if(es.length>0)throw es[es.length-1]
throw Error('Exception')
}
$B.$syntax_err_line=function(module,pos){
var pos2line={}
var lnum=1
var src=$B.$py_src[module]
var line_pos={1:0}
for(var i=0,_len_i=src.length;i < _len_i;i++){pos2line[i]=lnum
if(src.charAt(i)=='\n'){lnum+=1;line_pos[lnum]=i}}
var line_num=pos2line[pos]
var lines=src.split('\n')
var lib_module=module
if(lib_module.substr(0,13)==='__main__,exec')lib_module='__main__'
var line=lines[line_num-1]
var lpos=pos-line_pos[line_num]
while(line && line.charAt(0)==' '){line=line.substr(1)
lpos--
}
info='\n    ' 
for(var i=0;i<lpos;i++)info+=' '
info +='^'
return info
}
$B.$SyntaxError=function(module,msg,pos){var exc=_b_.SyntaxError(msg)
exc.info +=$B.$syntax_err_line(module,pos)
throw exc
}
$B.$IndentationError=function(module,msg,pos){var exc=_b_.IndentationError(msg)
exc.info +=$B.$syntax_err_line(module,pos)
throw exc
}
$B.$pop_exc=function(){$B.exception_stack.pop()}
$B.$test_item=function(expr){
$B.$test_result=expr
return _b_.bool(expr)
}
$B.$test_expr=function(){
return $B.$test_result
}
$B.$is_member=function(item,_set){
var f,_iter
try{f=_b_.getattr(_set,"__contains__")}
catch(err){$B.$pop_exc()}
if(f)return f(item)
try{_iter=_b_.iter(_set)}
catch(err){$B.$pop_exc()}
if(_iter){while(1){try{var elt=_b_.next(_iter)
if(_b_.getattr(elt,"__eq__")(item))return true
}catch(err){if(err.__name__=="StopIteration"){$B.$pop_exc()
return false
}
throw err
}}}
try{f=_b_.getattr(_set,"__getitem__")}
catch(err){$B.$pop_exc()
throw _b_.TypeError("'"+$B.get_class(_set).__name__+"' object is not iterable")
}
if(f){var i=-1
while(1){i++
try{var elt=f(i)
if(_b_.getattr(elt,"__eq__")(item))return true
}catch(err){if(err.__name__=='IndexError')return false
throw err
}}}}
var $io={__class__:$B.$type,__name__:'io'}
$io.__mro__=[$io,_b_.object.$dict]
$B.stderr={__class__:$io,write:function(data){console.log(data)},flush:function(){}}
$B.stderr_buff='' 
$B.stdout={__class__:$io,write: function(data){console.log(data)},flush:function(){}}
$B.stdin={__class__:$io,
read: function(size){return ''}}
function pyobject2jsobject(obj){if(_b_.isinstance(obj,_b_.dict)){var temp={__class__ :'dict'}
for(var i=0,_len_i=obj.$keys.length;i < _len_i;i++)temp[obj.$keys[i]]=obj.$values[i]
return temp
}
return obj
}
function jsobject2pyobject(obj){if(obj===undefined)return _b_.None
if(obj.__class__==='dict'){var d=_b_.dict()
for(var attr in obj){if(attr !=='__class__')d.__setitem__(attr,obj[attr])
}
return d
}
return obj
}
if(window.IDBObjectStore !==undefined){window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
window.IDBObjectStore.prototype.put=function(obj,key){var myobj=pyobject2jsobject(obj)
return window.IDBObjectStore.prototype._put.apply(this,[myobj,key])
}
window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
window.IDBObjectStore.prototype.add=function(obj,key){var myobj=pyobject2jsobject(obj)
return window.IDBObjectStore.prototype._add.apply(this,[myobj,key])
}}
if(window.IDBRequest !==undefined){window.IDBRequest.prototype.pyresult=function(){return jsobject2pyobject(this.result)
}}
$B.set_line=function(line_num,module_name){$B.line_info=[line_num,module_name]
return _b_.None
}
$B.$iterator=function(items,klass){var res={__class__:klass,__iter__:function(){return res},__len__:function(){return items.length},__next__:function(){res.counter++
if(res.counter<items.length)return items[res.counter]
throw _b_.StopIteration("StopIteration")
},__repr__:function(){return "<"+klass.__name__+" object>"},counter:-1
}
res.__str__=res.toString=res.__repr__
return res
}
$B.$iterator_class=function(name){var res={__class__:$B.$type,__name__:name
}
res.__str__=res.toString=res.__repr__
res.__mro__=[res,_b_.object.$dict]
res.$factory={__class__:$B.$factory,$dict:res}
return res
}
$B.$CodeDict={__class__:$B.$type,__name__:'code'}
$B.$CodeDict.__mro__=[$B.$CodeDict,_b_.object.$dict]
function $err(op,klass,other){var msg="unsupported operand type(s) for "+op
msg +=": '"+klass.__name__+"' and '"+$B.get_class(other).__name__+"'"
throw _b_.TypeError(msg)
}
var ropnames=['add','sub','mul','truediv','floordiv','mod','pow','lshift','rshift','and','xor','or']
var ropsigns=['+','-','*','/','//','%','**','<<','>>','&','^','|']
$B.make_rmethods=function(klass){for(var j=0,_len_j=ropnames.length;j < _len_j;j++){if(klass['__'+ropnames[j]+'__']===undefined){
klass['__'+ropnames[j]+'__']=(function(name,sign){return function(self,other){try{return _b_.getattr(other,'__r'+name+'__')(self)}
catch(err){$err(sign,klass,other)}}})(ropnames[j],ropsigns[j])
}}}})(__BRYTHON__)
if(!Array.indexOf){Array.prototype.indexOf=function(obj){for(var i=0,_len_i=this.length;i < _len_i;i++)if(this[i]==obj)return i
return -1
}}
if(!String.prototype.repeat){String.prototype.repeat=function(count){if(count < 1)return ''
var result='',pattern=this.valueOf()
while(count > 1){if(count & 1)result +=pattern
count >>=1,pattern +=pattern
}
return result + pattern
}
}
;(function($B){var _b_=$B.builtins
$B.make_node=function(top_node,node){var ctx_js=node.C.to_js()
var is_cond=false,is_except=false,is_else=false
if(node.locals_def){
ctx_js='var $locals = $B.vars["'+top_node.iter_id+'"], '
ctx_js +='$locals_id = "'+top_node.iter_id+'";'
}
if(node.is_catch){is_except=true;is_cond=true}
if(node.C.type=='node'){var ctx=node.C.tree[0]
var ctype=ctx.type
if((ctype=='condition' &&['if','elif'].indexOf(ctx.token)>-1)||
ctype=='except' ||ctype=='single_kw'){is_cond=true
}
if(ctype=='condition' && ctx.token=='elif'){is_else=true}
if(ctype=='single_kw' && ctx.token=='else'){is_else=true}
if(ctype=='except'||
(ctype=='single_kw'&&ctx.token=="finally")){is_except=true}}
if(ctx_js){
var new_node=new $B.genNode(ctx_js)
if(ctype=='yield'){var rank=top_node.yields.length
while(ctx_js.charAt(ctx_js.length-1)==';'){ctx_js=ctx_js.substr(0,ctx_js.length-1)
}
var res='return ['+ctx_js+', '+rank+']'
new_node.data=res
top_node.yields.push(new_node)
}else if(node.is_set_yield_value){var js='$sent'+ctx_js+'=__BRYTHON__.modules["'
js +=top_node.iter_id+'"].sent_value || None;'
js +='if($sent'+ctx_js+'.__class__===__BRYTHON__.$GeneratorSendError)'
js +='{throw $sent'+ctx_js+'.err};'
js +='$yield_value'+ctx_js+'=$sent'+ctx_js+';'
js +='__BRYTHON__.modules["'+top_node.iter_id+'"].sent_value=None'
new_node.data=js
}else if(ctype=='break'){new_node.is_break=true
new_node.loop_num=node.C.tree[0].loop_ctx.loop_num
}
new_node.is_cond=is_cond
new_node.is_except=is_except
new_node.is_if=ctype=='condition' && ctx.token=="if"
new_node.is_try=node.is_try
new_node.is_else=is_else
new_node.loop_start=node.loop_start
new_node.is_set_yield_value=node.is_set_yield_value
for(var i=0,_len_i=node.children.length;i < _len_i;i++){new_node.addChild($B.make_node(top_node,node.children[i]))
}}
return new_node
}
$B.genNode=function(data,parent){_indent=4
this.data=data
this.parent=parent
this.children=[]
this.has_child=false
if(parent===undefined){this.nodes={}
this.num=0
}
this.addChild=function(child){if(child===undefined){console.log('child of '+this+' undefined')}
this.children.push(child)
this.has_child=true
child.parent=this
child.rank=this.children.length-1
}
this.clone=function(){var res=new $B.genNode(this.data)
res.has_child=this.has_child
res.is_cond=this.is_cond
res.is_except=this.is_except
res.is_if=this.is_if
res.is_try=this.is_try
res.is_else=this.is_else
res.loop_num=this.loop_num
res.loop_start=this.loop_start
return res
}
this.clone_tree=function(exit_node,head){
var res=new $B.genNode(this.data)
if(this.replaced && !in_loop(this)){
res.data='void(0)'
}
if(this===exit_node &&(this.parent.is_cond ||!in_loop(this))){
if(!exit_node.replaced){
res=new $B.genNode('void(0)')
}else{res=new $B.genNode(exit_node.data)
}
exit_node.replaced=true
}
if(head && this.is_break){res.data='$locals["$no_break'+this.loop_num+'"]=false;'
res.data +='var err = new Error("break");'
res.data +='err.__class__=__BRYTHON__.GeneratorBreak;throw err;'
res.is_break=true
}
res.has_child=this.has_child
res.is_cond=this.is_cond
res.is_except=this.is_except
res.is_try=this.is_try
res.is_else=this.is_else
res.loop_num=this.loop_num
res.loop_start=this.loop_start
res.no_break=true
for(var i=0,_len_i=this.children.length;i < _len_i;i++){res.addChild(this.children[i].clone_tree(exit_node,head))
if(this.children[i].is_break){res.no_break=false}}
return res
}
this.has_break=function(){if(this.is_break){return true}
else{for(var i=0,_len_i=this.children.length;i < _len_i;i++){if(this.children[i].has_break()){return true}}}
return false
}
this.indent_src=function(indent){var res=''
for(var i=0;i<indent*_indent;i++)res+=' '
return res
}
this.src=function(indent){
indent=indent ||0
res=this.indent_src(indent)+this.data
if(this.has_child)res +='{'
res +='\n'
for(var i=0,_len_i=this.children.length;i < _len_i;i++){res +=this.children[i].src(indent+1)
}
if(this.has_child)res+='\n'+this.indent_src(indent)+'}\n'
return res
}
this.toString=function(){return '<Node '+this.data+'>'}}
$B.GeneratorBreak={}
$B.$GeneratorSendError={}
var $GeneratorReturn={}
$B.generator_return=function(){return{__class__:$GeneratorReturn}}
function in_loop(node){
while(node){if(node.loop_start!==undefined)return node
node=node.parent
}
return false
}
var $BRGeneratorDict={__class__:$B.$type,__name__:'generator'}
$BRGeneratorDict.__iter__=function(self){return self}
$BRGeneratorDict.__enter__=function(self){console.log("generator.__enter__ called")}
$BRGeneratorDict.__exit__=function(self){console.log("generator.__exit__ called")}
function clear_ns(iter_id){delete $B.vars[iter_id]
delete $B.modules[iter_id]
delete $B.bound[iter_id]
}
$BRGeneratorDict.__next__=function(self){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
for(var $attr in $B.vars[self.module]){try{eval("var "+$attr+"=$B.vars[self.module][$attr]")}
catch(err){console.log('err for '+$attr)}}
var $class=eval(self.$class)
if(self.func_root.scope.C===undefined){var $globals=__BRYTHON__.vars[self.func_root.scope.id]
}
var scope_id=self.func_root.scope.id
var first_iter=self._next===undefined
if(first_iter){
var src=self.func_root.src()+'\n)()'
try{eval(src)}
catch(err){console.log("cant eval\n"+src+'\n'+err)
clear_ns(self.iter_id)
throw err
}
self._next=__BRYTHON__.$generators[self.iter_id]
}
self.num++
if(self.gi_running){throw _b_.ValueError("ValueError: generator already executing")
}
self.gi_running=true
try{var res=self._next.apply(null,self.args)
}catch(err){self._next=function(){var _err=StopIteration('after exception')
_err.caught=true
throw _err
}
clear_ns(self.iter_id)
throw err
}finally{self.gi_running=false
}
if(res[0].__class__==$GeneratorReturn){
self._next=function(){throw StopIteration("after generator return")}
clear_ns(self.iter_id)
throw StopIteration('')
}
var yielded_value=res[0],yield_rank=res[1]
if(yield_rank==self.yield_rank)return yielded_value
self.yield_rank=yield_rank
var exit_node=self.func_root.yields[yield_rank]
exit_node.replaced=false
var root=new $B.genNode(self.def_ctx.to_js('__BRYTHON__.generators["'+self.iter_id+'"]'))
root.addChild(self.func_root.children[0].clone())
fnode=self.func_root.children[1].clone()
root.addChild(fnode)
func_node=self.func_root.children[1]
var js='var $globals = __BRYTHON__.vars["'+self.func_root.module+'"]'
fnode.addChild(new $B.genNode(js))
var js='var $locals_id = "'+self.iter_id+'", $locals = __BRYTHON__.vars[$locals_id]'
fnode.addChild(new $B.genNode(js))
var pnode=exit_node.parent
var exit_in_if=pnode.is_if ||pnode.is_else
var rest=[]
var no_break=true
for(var i=exit_node.rank+1,_len_i=pnode.children.length;i < _len_i;i++){var clone=pnode.children[i].clone_tree(null,true)
rest.push(clone)
if(clone.has_break()){no_break=false}}
var prest=exit_node.parent
while(prest!==func_node){if(prest.is_except){var catch_node=prest
if(prest.parent.is_except){catch_node=prest.parent}
var rank=catch_node.rank
while(rank<catch_node.parent.children.length && 
catch_node.parent.children[rank].is_except){rank++}
for(var i=rank,_len_i=catch_node.parent.children.length;i < _len_i;i++){rest.push(catch_node.parent.children[i].clone_tree(null,true))
}
prest=catch_node
}
else if(prest.is_try){var rest2=prest.clone()
for(var i=0,_len_i=rest.length;i < _len_i;i++){rest2.addChild(rest[i])}
rest=[rest2]
for(var i=prest.rank+1,_len_i=prest.parent.children.length;i < _len_i;i++){rest.push(prest.parent.children[i].clone_tree(null,true))
}
pnode=pnode.parent
}
prest=prest.parent
}
if(no_break){for(var i=0,_len_i=rest.length;i < _len_i;i++){fnode.addChild(rest[i])}}else{
var rest_try=new $B.genNode('try')
for(var i=0,_len_i=rest.length;i < _len_i;i++){rest_try.addChild(rest[i])}
fnode.addChild(rest_try)
var catch_test='catch(err)'
catch_test +='{if(err.__class__!==__BRYTHON__.GeneratorBreak)'
catch_test +='{throw err}}'
fnode.addChild(new $B.genNode(catch_test))
}
if(!no_break){var loop=in_loop(pnode)
if(loop){pnode=loop}}
while(pnode!==func_node && in_loop(pnode)){var rank=pnode.rank
while(pnode.parent.children[rank].is_except){rank--}
if(pnode.is_if){
rank++
exit_node.replaced=true
while(rank<pnode.parent.children.length 
&& pnode.parent.children[rank].is_else){rank++}}else if(pnode.is_else){exit_node.replaced=true
while(rank<pnode.parent.children.length 
&& pnode.parent.children[rank].is_else){rank++}}
for(var i=rank,_len_i=pnode.parent.children.length;i < _len_i;i++){var g=pnode.parent.children[i].clone_tree(exit_node,true)
fnode.addChild(g)
}
pnode=pnode.parent
}
while(pnode!==func_node && 
(in_loop(exit_node)||pnode.is_if ||pnode.is_else)){var rank=pnode.rank+1
while(rank < pnode.parent.children.length){var next_node=pnode.parent.children[rank]
if(next_node.is_else){rank++}
break
}
for(var i=rank,_len_i=pnode.parent.children.length;i < _len_i;i++){fnode.addChild(pnode.parent.children[i].clone_tree())
}
pnode=pnode.parent
}
var js='var err=StopIteration("inserted S.I. '+self.func_name+'");'
js +='err.caught=true;throw err'
fnode.addChild(new $B.genNode(js))
self.next_root=root
var next_src=root.src()+'\n)()'
try{eval(next_src)}
catch(err){console.log('error '+err+'\n'+next_src)}
self._next=__BRYTHON__.generators[self.iter_id]
return yielded_value
}
$BRGeneratorDict.__mro__=[$BRGeneratorDict,_b_.object.$dict]
$BRGeneratorDict.__repr__=$BRGeneratorDict.__str__=function(self){return '<generator '+self.func_name+' '+self.iter_id+'>'
}
$BRGeneratorDict.close=function(self,value){self.sent_value=_b_.GeneratorExit()
try{var res=$BRGeneratorDict.__next__(self)
if(res!==_b_.None){throw _b_.RuntimeError("closed generator returned a value")
}}catch(err){if($B.is_exc(err,[_b_.StopIteration,_b_.GeneratorExit]))return _b_.None
throw err
}}
$BRGeneratorDict.send=function(self,value){self.sent_value=value
return $BRGeneratorDict.__next__(self)
}
$BRGeneratorDict.throw=function(self,value){if(_b_.isinstance(value,_b_.type))value=value()
self.sent_value={__class__:$B.$GeneratorSendError,err:value}
return $BRGeneratorDict.__next__(self)
}
$B.$BRgenerator=function(scope_id,func_name,def_id,$class){var def_node=$B.modules[def_id]
var def_ctx=def_node.C.tree[0]
var counter=0 
var func=__BRYTHON__.vars[scope_id][func_name]
__BRYTHON__.generators=__BRYTHON__.generators ||{}
var module=def_node.module
var res=function(){var args=[]
for(var i=0,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
var iter_id=def_id+'-'+counter
counter++
$B.vars[iter_id]={}
$B.bound[iter_id]={}
for(var attr in $B.bound[def_id]){$B.bound[iter_id][attr]=true}
__BRYTHON__.$generators=__BRYTHON__.$generators ||{}
var func_root=new $B.genNode(def_ctx.to_js('__BRYTHON__.$generators["'+iter_id+'"]'))
func_root.scope=__BRYTHON__.modules[scope_id]
func_root.module=module
func_root.yields=[]
func_root.loop_ends={}
func_root.def_id=def_id
func_root.iter_id=iter_id
for(var i=0,_len_i=def_node.children.length;i < _len_i;i++){func_root.addChild($B.make_node(func_root,def_node.children[i]))
}
var func_node=func_root.children[1].children[0]
func_root.children[1].addChild(new $B.genNode('var err=StopIteration("");err.caught=true;throw err'))
var obj={__class__ : $BRGeneratorDict,args:args,$class:$class,def_id:def_id,def_ctx:def_ctx,def_node:def_node,func:func,func_name:func_name,func_root:func_root,module:module,func_node:func_node,next_root:func_root,gi_running:false,iter_id:iter_id,id:iter_id,num:0
}
$B.modules[iter_id]=obj
obj.parent_block=def_node.parent_block
return obj
}
res.__call__=function(){console.log('call generator');return res.apply(null,arguments)}
res.__repr__=function(){return "<function "+func.__name__+">"}
return res
}
$B.$BRgenerator.__repr__=function(){return "<class 'generator'>"}
$B.$BRgenerator.__str__=function(){return "<class 'generator'>"}
$B.$BRgenerator.__class__=$B.$type
})(__BRYTHON__)

;(function($B){var _b_=$B.builtins
_b_.__debug__=false
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
$B.$comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
function abs(obj){if(isinstance(obj,_b_.int))return _b_.int(Math.abs(obj))
if(isinstance(obj,_b_.float))return _b_.float(Math.abs(obj.value))
if(hasattr(obj,'__abs__'))return getattr(obj,'__abs__')()
throw _b_.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")
}
abs.__doc__='abs(number) -> number\n\nReturn the absolute value of the argument.'
abs.__code__={}
abs.__code__.co_argcount=1
abs.__code__.co_consts=[]
abs.__code__.co_varnames=['number']
function _alert(src){alert(_b_.str(src))}
function all(obj){var iterable=iter(obj)
while(1){try{var elt=next(iterable)
if(!bool(elt))return false
}catch(err){return true}}}
all.__doc__='all(iterable) -> bool\n\nReturn True if bool(x) is True for all values x in the iterable.\nIf the iterable is empty, return True.'
all.__code__={}
all.__code__.co_argcount=1
all.__code__.co_consts=[]
all.__code__.co_varnames=['obj']
function any(obj){var iterable=iter(obj)
while(1){try{var elt=next(iterable)
if(bool(elt))return true
}catch(err){return false}}}
any.__doc__='any(iterable) -> bool\n\nReturn True if bool(x) is True for any x in the iterable.\nIf the iterable is empty, return False.'
any.__code__={}
any.__code__.co_argcount=1
any.__code__.co_consts=[]
any.__code__.co_varnames=['obj']
function ascii(obj){
function padWithLeadingZeros(string,pad){return new Array(pad+1-string.length).join("0")+ string
}
function charEscape(charCode){if(charCode>255)return "\\u"+padWithLeadingZeros(charCode.toString(16),4)
return "\\x" + padWithLeadingZeros(charCode.toString(16),2)
}
return obj.split("").map(function(char){var charCode=char.charCodeAt(0)
return charCode > 127 ? charEscape(charCode): char
})
.join("")
}
ascii.__doc__='ascii(object) -> string\n\nAs repr(), return a string containing a printable representation of an\nobject, but escape the non-ASCII characters in the string returned by\nrepr() using \\x, \\u or \\U escapes.  This generates a string similar\nto that returned by repr() in Python 2.'
ascii.__code__={}
ascii.__code__.co_argcount=1
ascii.__code__.co_consts=[]
ascii.__code__.co_varnames=['obj']
function $builtin_base_convert_helper(obj,base){var value
if(isinstance(obj,_b_.int)){value=obj
}else if(obj.__index__ !==undefined){value=obj.__index__()
}
if(value===undefined){
throw _b_.TypeError('Error, argument must be an integer or contains an __index__ function')
return
}
var prefix=""
switch(base){case 2:
prefix='0b';break
case 8:
prefix='0o';break
case 16:
prefix='0x';break
default:
console.log('invalid base:' + base)
}
if(value >=0)return prefix + value.toString(base)
return '-' + prefix +(-value).toString(base)
}
function bin(obj){return $builtin_base_convert_helper(obj,2)}
bin.__doc__="bin(number) -> string\n\nReturn the binary representation of an integer.\n\n   >>> bin(2796202)\n   '0b1010101010101010101010'\n"
bin.__code__={}
bin.__code__.co_argcount=1
bin.__code__.co_consts=[]
bin.__code__.co_varnames=['obj']
var blocking=_b_.blocking=function(func){
$B.$blocking_functions=$B.$blocking_functions ||[]
$B.$blocking_functions.push(_b_.id(func))
console.log('blocking funcs '+$B.$blocking_functions)
func.$blocking=true
return func
}
function bool(obj){
if(obj===null ||obj===undefined )return false
switch(typeof obj){case 'boolean':
return obj
case 'number':
case 'string':
if(obj)return true
return false
default:
try{return getattr(obj,'__bool__')()}
catch(err){$B.$pop_exc()
try{return getattr(obj,'__len__')()>0}
catch(err){$B.$pop_exc();return true}}}
}
bool.__class__=$B.$type
bool.__mro__=[bool,object]
bool.__name__='bool'
bool.__repr__=bool.__str__=function(){return "<class 'bool'>"}
bool.toString=bool.__str__
bool.__hash__=function(){if(this.valueOf())return 1
return 0
}
bool.__doc__='bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
bool.__code__={}
bool.__code__.co_argcount=1
bool.__code__.co_consts=[]
bool.__code__.co_varnames=['x']
function callable(obj){return hasattr(obj,'__call__')}
callable.__doc__='callable(object) -> bool\n\nReturn whether the object is callable (i.e., some kind of function).\nNote that classes are callable, as are instances of classes with a\n__call__() method.'
callable.__code__={}
callable.__code__.co_argcount=1
callable.__code__.co_consts=[]
callable.__code__.co_varnames=['obj']
function chr(i){if(i < 0 ||i > 1114111)Exception('ValueError','Outside valid range')
return String.fromCharCode(i)
}
chr.__doc__='chr(i) -> Unicode character\n\nReturn a Unicode string of one character with ordinal i; 0 <= i <= 0x10ffff.'
chr.__code__={}
chr.__code__.co_argcount=1
chr.__code__.co_consts=[]
chr.__code__.co_varnames=['i']
var $ClassmethodDict={__class__:$B.$type,__name__:'classmethod'}
$ClassmethodDict.__mro__=[$ClassmethodDict,$ObjectDict]
function classmethod(func){func.$type='classmethod'
return func
}
classmethod.__class__=$B.$factory
classmethod.$dict=$ClassmethodDict
$ClassmethodDict.$factory=classmethod
function $class(obj,info){this.obj=obj
this.__name__=info
this.__class__=$B.$type
this.__mro__=[this,$ObjectDict]
}
$B.$CodeObjectDict={__class__:$B.$type,__name__:'code',__repr__:function(self){return '<code object '+self.name+', file '+self.filename+'>'},}
$B.$CodeObjectDict.__str__=$B.$CodeObjectDict.__repr__
$B.$CodeObjectDict.__mro__=[$B.$CodeObjectDict,$ObjectDict]
function compile(source,filename,mode){
var $ns=$B.$MakeArgs('compile',arguments,['source','filename','mode'],[],'args','kw')
return{__class__:$B.$CodeObjectDict,src:$B.py2js(source).to_js(),name:source.__name__ ||'<module>',filename:filename}}
compile.__class__=$B.factory
$B.$CodeObjectDict.$factory=compile
compile.$dict=$B.$CodeObjectDict
compile.__doc__="compile(source, filename, mode[, flags[, dont_inherit]]) -> code object\n\nCompile the source (a Python module, statement or expression)\ninto a code object that can be executed by exec() or eval().\nThe filename will be used for run-time error messages.\nThe mode must be 'exec' to compile a module, 'single' to compile a\nsingle (interactive) statement, or 'eval' to compile an expression.\nThe flags argument, if present, controls which future statements influence\nthe compilation of the code.\nThe dont_inherit argument, if non-zero, stops the compilation inheriting\nthe effects of any future statements in effect in the code calling\ncompile; if absent or zero these statements do influence the compilation,\nin addition to any features explicitly specified."
compile.__code__={}
compile.__code__.co_argcount=3
compile.__code__.co_consts=[]
compile.__code__.co_varnames=['source','filename','mode']
var __debug__=$B.debug>0
function delattr(obj,attr){
var klass=$B.get_class(obj)
var res=obj[attr]
if(res===undefined){var mro=klass.__mro__
for(var i=0;i<mro.length;i++){var res=mro[i][attr]
if(res!==undefined){break}}}
if(res!==undefined && res.__delete__!==undefined){return res.__delete__(res,obj,attr)
}
getattr(obj,'__delattr__')(attr)
}
delattr.__doc__="delattr(object, name)\n\nDelete a named attribute on an object; delattr(x, 'y') is equivalent to\n``del x.y''."
delattr.__code__={}
delattr.__code__.co_argcount=2
delattr.__code__.co_consts=[]
delattr.__code__.co_varnames=['object','name']
function dir(obj){if(obj===null){
var mod_name=arguments[1]
var res=[],$globals=$B.vars[mod_name]
for(var attr in $globals){if(attr.charAt(0)=='$' && attr.charAt(1)!='$'){
continue
}
res.push(attr)
}
_b_.list.$dict.sort(res)
return res
}
if(isinstance(obj,$B.JSObject))obj=obj.js
if($B.get_class(obj).is_class){obj=obj.$dict}
else{
try{
var res=getattr(obj,'__dir__')()
res=_b_.list(res)
res.sort()
return res
}catch(err){$B.$pop_exc()}}
var res=[]
for(var attr in obj){if(attr.charAt(0)!=='$' && attr!=='__class__'){res.push(attr)
}}
res.sort()
return res
}
dir.__doc__="dir([object]) -> list of strings\n\nIf called without an argument, return the names in the current scope.\nElse, return an alphabetized list of names comprising (some of) the attributes\nof the given object, and of attributes reachable from it.\nIf the object supplies a method named __dir__, it will be used; otherwise\nthe default dir() logic is used and returns:\n  for a module object: the module's attributes.\n  for a class object:  its attributes, and recursively the attributes\n    of its bases.\n  for any other object: its attributes, its class's attributes, and\n    recursively the attributes of its class's base classes."
dir.__code__={}
dir.__code__.co_argcount=1
dir.__code__.co_consts=[]
dir.__code__.co_varnames=['obj']
function divmod(x,y){var klass=$B.get_class(x)
return[klass.__floordiv__(x,y),klass.__mod__(x,y)]
}
divmod.__doc__='divmod(x, y) -> (div, mod)\n\nReturn the tuple ((x-x%y)/y, x%y).  Invariant: div*y + mod == x.'
divmod.__code__={}
divmod.__code__.co_argcount=2
divmod.__code__.co_consts=[]
divmod.__code__.co_varnames=['x','y']
var $EnumerateDict={__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__=[$EnumerateDict,$ObjectDict]
function enumerate(){var _start=0
var $ns=$B.$MakeArgs("enumerate",arguments,["iterable"],["start"],null,null)
var _iter=iter($ns["iterable"])
var _start=$ns["start"]||_start
var res={__class__:$EnumerateDict,__getattr__:function(attr){return res[attr]},__iter__:function(){return res},__name__:'enumerate iterator',__next__:function(){res.counter++
return _b_.tuple([res.counter,next(_iter)])
},__repr__:function(){return "<enumerate object>"},__str__:function(){return "<enumerate object>"},counter:_start-1
}
for(var attr in res){if(typeof res[attr]==='function' && attr!=="__class__"){res[attr].__str__=(function(x){return function(){return "<method wrapper '"+x+"' of enumerate object>"}})(attr)
}}
return res
}
enumerate.__class__=$B.$factory
enumerate.$dict=$EnumerateDict
$EnumerateDict.$factory=enumerate
enumerate.__doc__='enumerate(iterable[, start]) -> iterator for index, value of iterable\n\nReturn an enumerate object.  iterable must be another object that supports\niteration.  The enumerate object yields pairs containing a count (from\nstart, which defaults to zero) and a value yielded by the iterable argument.\nenumerate is useful for obtaining an indexed list:\n    (0, seq[0]), (1, seq[1]), (2, seq[2]), ...'
enumerate.__code__={}
enumerate.__code__.co_argcount=2
enumerate.__code__.co_consts=[]
enumerate.__code__.co_varnames=['iterable']
function $eval(src,_globals,locals){var is_exec=arguments[3]=='exec'
if($B.exec_stack.length==0){$B.exec_stack=['__main__']}
var env=$B.exec_stack[$B.exec_stack.length-1]
if(is_exec && _globals===undefined){var mod_name=env
}else{var mod_name='exec-'+Math.random().toString(36).substr(2,8)
$B.$py_module_path[mod_name]=$B.$py_module_path['__main__']
$B.vars[mod_name]={}
$B.bound[mod_name]={}
if(_globals!==undefined){for(var i=0;i<_globals.$keys.length;i++){$B.vars[mod_name][_globals.$keys[i]]=_globals.$values[i]
$B.bound[mod_name][_globals.$keys[i]]=true
}}else{for(var attr in $B.vars[env]){$B.vars[mod_name][attr]=$B.vars[env][attr]
$B.bound[mod_name][attr]=true
}}}
$B.exec_stack.push(mod_name)
try{var root=$B.py2js(src,mod_name,mod_name,'__builtins__')
if(!is_exec){var instr=root.children[root.children.length-1]
var type=instr.C.tree[0].type
if(!('expr'==type ||'list_or_tuple'==type)){
$B.line_info=[1,mod_name]
throw SyntaxError("eval() argument must be an expression")
}}
var js=root.to_js()
var res=eval(js)
if(_globals!==undefined){var set_func=getattr(_globals,'__setitem__')
for(var attr in $B.vars[mod_name]){if(attr=='__name__'||attr=='__doc__'||attr=='__file__')continue
set_func(attr,$B.vars[mod_name][attr])
}}
return res
}finally{$B.exec_stack.pop()
}}
$eval.$is_func=true
function exec(src,globals,locals){return $eval(src,globals,locals,'exec')||_b_.None
}
exec.$is_func=true
var $FilterDict={__class__:$B.$type,__name__:'filter'}
$FilterDict.__iter__=function(self){return self}
$FilterDict.__repr__=$FilterDict.__str__=function(){return "<filter object>"},$FilterDict.__mro__=[$FilterDict,$ObjectDict]
function filter(){if(arguments.length!=2){throw _b_.TypeError(
"filter expected 2 arguments, got "+arguments.length)}
var func=arguments[0],iterable=iter(arguments[1])
if(func===_b_.None)func=bool
var __next__=function(){while(true){try{
var _item=next(iterable)
if(func(_item)){return _item}}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();throw _b_.StopIteration('')}
else{throw err}}}}
return{
__class__: $FilterDict,__next__: __next__
}}
filter.__doc__='filter(function or None, iterable) --> filter object\n\nReturn an iterator yielding those items of iterable for which function(item)\nis true. If function is None, return the items that are true.'
filter.__code__={}
filter.__code__.co_argcount=2
filter.__code__.co_consts=[]
filter.__code__.co_varnames=['f','iterable']
function format(value,format_spec){if(hasattr(value,'__format__'))return getattr(value,'__format__')(format_spec)
throw _b_.NotImplementedError("__format__ is not implemented for object '" + _b_.str(value)+ "'")
}
format.__doc__='format(value[, format_spec]) -> string\n\nReturns value.__format__(format_spec)\nformat_spec defaults to ""'
format.__code__={}
format.__code__.co_argcount=2
format.__code__.co_consts=[]
format.__code__.co_varnames=['f','iterable']
function getattr(obj,attr,_default){var klass=$B.get_class(obj)
if(klass===undefined){
if(obj[attr]!==undefined)return obj[attr]
if(_default!==undefined)return _default
throw _b_.AttributeError('object has no attribute '+attr)
}
if(attr=='__class__')return klass.$factory
if(attr==='__dict__'){return $B.obj_dict(obj)
}
if(attr==='__call__' &&(typeof obj=='function')){if(obj.$blocking){console.log('calling blocking function '+obj.__name__)
}
if($B.debug>0){return function(){$B.call_stack.push($B.line_info)
try{var res=obj.apply(null,arguments)
if(res===undefined)return _b_.None
return res
}catch(err){throw err}
finally{$B.call_stack.pop()}}}
return function(){var res=obj.apply(null,arguments)
if(res===undefined)return _b_.None
return res
}}else if(attr=='__call__' && klass===$B.JSObject.$dict &&
typeof obj.js=='function'){return function(){var res=obj.js.apply(null,arguments)
if(res===undefined)return _b_.None
return $B.JSObject(res)
}}
if(attr=='__code__' &&(typeof obj=='function')){var res={__class__:$B.$CodeObjectDict,src:obj,name:obj.__name__ ||'<module>'
}
if(obj.__code__ !==undefined){for(var attr in obj.__code__)res[attr]=obj.__code__[attr]
}
if($B.vars[obj.__module__]!==undefined){res.filename=$B.vars[obj.__module__].__file__
}
return res
}
if(typeof obj=='function'){if(attr !==undefined && obj[attr]!==undefined){if(attr=='__module__'){
return obj[attr]
}}}
if(klass.$native){if(klass[attr]===undefined){if(_default===undefined)throw _b_.AttributeError(klass.__name__+" object has no attribute '"+attr+"'")
return _default
}
if(typeof klass[attr]=='function'){
if(attr=='__new__')return klass[attr].apply(null,arguments)
var method=function(){var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return klass[attr].apply(null,args)
}
method.__name__='method '+attr+' of built-in '+klass.__name__
return method
}
return klass[attr]
}
var is_class=klass.is_class,mro,attr_func
if(is_class){attr_func=$B.$type.__getattribute__
if(obj.$dict===undefined){console.log('obj '+obj+' $dict undefined')}
obj=obj.$dict
}else{var mro=klass.__mro__
if(mro===undefined){console.log('in getattr '+attr+' mro undefined for '+obj+' dir '+dir(obj)+' class '+obj.__class__)
for(var _attr in obj){console.log('obj attr '+_attr+' : '+obj[_attr])
}
console.log('obj class '+dir(klass)+' str '+klass)
}
for(var i=0;i<mro.length;i++){attr_func=mro[i]['__getattribute__']
if(attr_func!==undefined)break
}}
if(typeof attr_func!=='function'){console.log(attr+' is not a function '+attr_func)
}
try{var res=attr_func(obj,attr)}
catch(err){$B.$pop_exc()
if(_default!==undefined)return _default
throw err
}
if(res!==undefined)return res
if(_default !==undefined)return _default
var cname=klass.__name__
if(is_class)cname=obj.__name__
throw _b_.AttributeError("'"+cname+"' object has no attribute '"+attr+"'")
}
getattr.__doc__="getattr(object, name[, default]) -> value\n\nGet a named attribute from an object; getattr(x, 'y') is equivalent to x.y.\nWhen a default argument is given, it is returned when the attribute doesn't\nexist; without it, an exception is raised in that case."
getattr.__code__={}
getattr.__code__.co_argcount=1
getattr.__code__.co_consts=[]
getattr.__code__.co_varnames=['value']
function globals(module){
var res=_b_.dict()
var scope=$B.vars[module]
for(var name in scope){res.$keys.push(name);res.$values.push(scope[name])}
return res
}
globals.__doc__="globals() -> dictionary\n\nReturn the dictionary containing the current scope's global variables."
globals.__code__={}
globals.__code__.co_argcount=0
globals.__code__.co_consts=[]
globals.__code__.co_varnames=[]
function hasattr(obj,attr){try{getattr(obj,attr);return true}
catch(err){$B.$pop_exc();return false}}
hasattr.__doc__='hasattr(object, name) -> bool\n\nReturn whether the object has an attribute with the given name.\n(This is done by calling getattr(object, name) and catching AttributeError.)'
hasattr.__code__={}
hasattr.__code__.co_argcount=2
hasattr.__code__.co_consts=[]
hasattr.__code__.co_varnames=['object','name']
function hash(obj){if(obj.__hashvalue__ !==undefined)return obj.__hashvalue__
if(isinstance(obj,_b_.int))return obj.valueOf()
if(isinstance(obj,bool))return _b_.int(obj)
if(obj.__hash__ !==undefined){return obj.__hashvalue__=obj.__hash__()
}
if(hasattr(obj,'__hash__')){return obj.__hashvalue__=getattr(obj,'__hash__')()
}
throw _b_.AttributeError(
"'"+_b_.str(obj.__class__)+"' object has no attribute '__hash__'")
}
hash.__doc__='hash(object) -> integer\n\nReturn a hash value for the object.  Two objects with the same value have\nthe same hash value.  The reverse is not necessarily true, but likely.'
hash.__code__={}
hash.__code__.co_argcount=1
hash.__code__.co_consts=[]
hash.__code__.co_varnames=['object']
function help(obj){if(obj===undefined)obj='help'
if(typeof obj=='string' && _b_[obj]!==undefined){var _doc=_b_[obj].__doc__
if(_doc !==undefined && _doc !=''){getattr($print,'__call__')(_doc)
return
}}
if(typeof obj=='string'){$B.$import("pydoc")
var pydoc=$B.vars["pydoc"]
getattr(getattr(pydoc,"help"),"__call__")(obj)
return
}
try{return getattr(obj,'__doc__')}
catch(err){console.log('help err '+err);return ''}}
help.__doc__="Define the builtin 'help'.\n    This is a wrapper around pydoc.help (with a twist).\n\n    "
help.__code__={}
help.__code__.co_argcount=1
help.__code__.co_consts=[]
help.__code__.co_varnames=['object']
function hex(x){return $builtin_base_convert_helper(x,16)}
hex.__doc__="hex(number) -> string\n\nReturn the hexadecimal representation of an integer.\n\n   >>> hex(3735928559)\n   '0xdeadbeef'\n"
hex.__code__={}
hex.__code__.co_argcount=1
hex.__code__.co_consts=[]
hex.__code__.co_varnames=['object']
function id(obj){if(obj.__hashvalue__ !==undefined)return obj.__hashvalue__
if(typeof obj=='string')return getattr(_b_.str(obj),'__hash__')()
if(obj.__hash__===undefined ||isinstance(obj,[_b_.set,_b_.list,_b_.dict])){return obj.__hashvalue__=$B.$py_next_hash++
}
if(obj.__hash__ !==undefined)return obj.__hash__()
return null
}
id.__doc__="id(object) -> integer\n\nReturn the identity of an object.  This is guaranteed to be unique among\nsimultaneously existing objects.  (Hint: it's the object's memory address.)"
id.__code__={}
id.__code__.co_argcount=1
id.__code__.co_consts=[]
id.__code__.co_varnames=['object']
function __import__(mod_name){try{$B.$import(mod_name)}
catch(err){$B.imported[mod_name]=undefined}
if($B.imported[mod_name]===undefined)throw _b_.ImportError(mod_name)
return $B.imported[mod_name]
}
__import__.__doc__="__import__(name, globals=None, locals=None, fromlist=(), level=0) -> module\n\nImport a module. Because this function is meant for use by the Python\ninterpreter and not for general use it is better to use\nimportlib.import_module() to programmatically import a module.\n\nThe globals argument is only used to determine the C;\nthey are not modified.  The locals argument is unused.  The fromlist\nshould be a list of names to emulate ``from name import ...'', or an\nempty list to emulate ``import name''.\nWhen importing a module from a package, note that __import__('A.B', ...)\nreturns package A when fromlist is empty, but its submodule B when\nfromlist is not empty.  Level is used to determine whether to perform \nabsolute or relative imports. 0 is absolute while a positive number\nis the number of parent directories to search relative to the current module."
__import__.__code__={}
__import__.__code__.co_argcount=5
__import__.__code__.co_consts=[]
__import__.__code__.co_varnames=['name','globals','locals','fromlist','level']
function input(src){return prompt(src)}
input.__doc__='input([prompt]) -> string\n\nRead a string from standard input.  The trailing newline is stripped.\nIf the user hits EOF (Unix: Ctl-D, Windows: Ctl-Z+Return), raise EOFError.\nOn Unix, GNU readline is used if enabled.  The prompt string, if given,\nis printed without a trailing newline before reading.'
input.__code__={}
input.__code__.co_argcount=1
input.__code__.co_consts=[]
input.__code__.co_varnames=['prompt']
function isinstance(obj,arg){if(obj===null)return arg===None
if(obj===undefined)return false
if(arg.constructor===Array){for(var i=0;i<arg.length;i++){if(isinstance(obj,arg[i]))return true
}
return false
}
var klass=$B.get_class(obj)
if(klass===undefined){switch(arg){case _b_.int:
return((typeof obj)=="number"||obj.constructor===Number)&&(obj.valueOf()%1===0)
case _b_.float:
return((typeof obj=="number" && obj.valueOf()%1!==0))||
(klass===_b_.float.$dict)
case _b_.str:
return(typeof obj=="string"||klass===_b_.str.$dict)
case _b_.list:
return(obj.constructor===Array)
}}
if(klass!==undefined){
if(klass.__mro__===undefined){console.log('mro undef for '+klass+' '+klass.__name___+' '+dir(klass)+'\n arg '+arg)}
if(arg.$dict===undefined){return false}
var _name=arg.$dict.__name__
for(var i=0;i<klass.__mro__.length;i++){
if(klass.__mro__[i].__name__==_name)return true
}
return false
}
return obj.constructor===arg
}
isinstance.__doc__="isinstance(object, class-or-type-or-tuple) -> bool\n\nReturn whether an object is an instance of a class or of a subclass thereof.\nWith a type as second argument, return whether that is the object's type.\nThe form using a tuple, isinstance(x, (A, B, ...)), is a shortcut for\nisinstance(x, A) or isinstance(x, B) or ... (etc.)."
isinstance.__code__={}
isinstance.__code__.co_argcount=2
isinstance.__code__.co_consts=[]
isinstance.__code__.co_varnames=['object','type']
function issubclass(klass,classinfo){if(arguments.length!==2){throw _b_.TypeError("issubclass expected 2 arguments, got "+arguments.length)
}
if(!klass.__class__ ||!klass.__class__.is_class){throw _b_.TypeError("issubclass() arg 1 must be a class")
}
if(isinstance(classinfo,_b_.tuple)){for(var i=0;i<classinfo.length;i++){if(issubclass(klass,classinfo[i]))return true
}
return false
}
if(classinfo.__class__.is_class){return klass.$dict.__mro__.indexOf(classinfo.$dict)>-1 
}
throw _b_.TypeError("issubclass() arg 2 must be a class or tuple of classes")
}
issubclass.__doc__='issubclass(C, B) -> bool\n\nReturn whether class C is a subclass (i.e., a derived class) of class B.\nWhen using a tuple as the second argument issubclass(X, (A, B, ...)),\nis a shortcut for issubclass(X, A) or issubclass(X, B) or ... (etc.).'
issubclass.__code__={}
issubclass.__code__.co_argcount=2
issubclass.__code__.co_consts=[]
issubclass.__code__.co_varnames=['C','D']
function iter(obj){try{return getattr(obj,'__iter__')()}
catch(err){$B.$pop_exc()
throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")
}}
iter.__doc__='iter(iterable) -> iterator\niter(callable, sentinel) -> iterator\n\nGet an iterator from an object.  In the first form, the argument must\nsupply its own iterator, or be a sequence.\nIn the second form, the callable is called until it returns the sentinel.'
iter.__code__={}
iter.__code__.co_argcount=1
iter.__code__.co_consts=[]
iter.__code__.co_varnames=['i']
function len(obj){try{return getattr(obj,'__len__')()}
catch(err){throw _b_.TypeError("object of type '"+$B.get_class(obj).__name__+"' has no len()")
}}
len.__doc__='len(module, object)\n\nReturn the number of items of a sequence or mapping.'
len.__code__={}
len.__code__.co_argcount=2
len.__code__.co_consts=[]
len.__code__.co_varnames=['module','object']
function locals(obj_id,module){
if($B.vars[obj_id]===undefined)return globals(module)
var res=_b_.dict()
var scope=$B.vars[obj_id]
for(var name in scope){_b_.dict.$dict.__setitem__(res,name,scope[name])
}
return res
}
locals.__doc__="locals() -> dictionary\n\nUpdate and return a dictionary containing the current scope's local variables."
locals.__code__={}
locals.__code__.co_argcount=0
locals.__code__.co_consts=[]
locals.__code__.co_varnames=[]
var $MapDict={__class__:$B.$type,__name__:'map'}
$MapDict.__mro__=[$MapDict,$ObjectDict]
$MapDict.__iter__=function(self){return self}
function map(){var func=getattr(arguments[0],'__call__')
var iter_args=[]
for(var i=1;i<arguments.length;i++){iter_args.push(iter(arguments[i]))}
var __next__=function(){var args=[]
for(var i=0;i<iter_args.length;i++){try{var x=next(iter_args[i])
args.push(x)
}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();throw _b_.StopIteration('')
}else{throw err}}}
return func.apply(null,args)
}
var obj={__class__:$MapDict,__repr__:function(){return "<map object>"},__str__:function(){return "<map object>"},__next__: __next__
}
return obj
}
map.__doc__='map(func, *iterables) --> map object\n\nMake an iterator that computes the function using arguments from\neach of the iterables.  Stops when the shortest iterable is exhausted.'
map.__code__={}
map.__code__.co_argcount=1
map.__code__.co_consts=[]
map.__code__.co_varnames=['func']
function $extreme(args,op){
var $op_name='min'
if(op==='__gt__')$op_name="max"
if(args.length==0){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
var last_arg=args[args.length-1]
var second_to_last_arg=args[args.length-2]
var last_i=args.length-1
var has_key=false
var has_default=false
var func=false
if(last_arg.$nat=='kw'){if(last_arg.name==='key'){var func=last_arg.value
has_key=true
last_i--
}else if(last_arg.name==='default'){var default_value=last_arg.value
has_default=true
last_i--
}else{throw _b_.TypeError("'"+last_arg.name+"' is an invalid keyword argument for this function")}}else{var func=function(x){return x}}
if(second_to_last_arg && second_to_last_arg.$nat=='kw'){if(second_to_last_arg.name==='key'){if(has_key){throw _b_.SyntaxError("Keyword argument repeated")}
var func=second_to_last_arg.value
has_key=true
last_i--
}else if(second_to_last_arg.name==='default'){if(has_default){throw _b_.SyntaxError("Keyword argument repeated")}
var default_value=second_to_last_arg.value
has_default=true
last_i--
}else{throw _b_.TypeError("'"+second_to_last_arg.name+"' is an invalid keyword argument for this function")}}else{if(!func){var func=function(x){return x}}}
if((has_key && has_default && args.length==3)||
(!has_key && has_default && args.length==2)||
(has_key && !has_default && args.length==2)||
(!has_key && !has_default && args.length==1)){var arg=args[0]
if(arg.length < 1 && has_default){return default_value
}
if(arg.length < 1 && !has_default){throw _b_.ValueError($op_name+"() arg is an empty sequence")
}
var $iter=iter(arg)
var res=null
while(true){try{var x=next($iter)
if(res===null ||bool(getattr(func(x),op)(func(res)))){res=x}}catch(err){if(err.__name__=="StopIteration"){return res}
throw err
}}}else if((has_key && has_default && args.length>3)||
(!has_key && has_default && args.length>2)){throw _b_.TypeError("Cannot specify a default for "+$op_name+"() with multiple positional arguments")
}else{
if(last_i < 1){throw _b_.TypeError($op_name+" expected 1 arguments, got 0")}
var res=null
for(var i=0;i<=last_i;i++){var x=args[i]
if(res===null ||bool(getattr(func(x),op)(func(res)))){res=x}}
return res
}}
function max(){var args=[]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return $extreme(args,'__gt__')
}
max.__doc__='max(iterable[, key=func]) -> value\nmax(a, b, c, ...[, key=func]) -> value\n\nWith a single iterable argument, return its largest item.\nWith two or more arguments, return the largest argument.'
max.__code__={}
max.__code__.co_argcount=1
max.__code__.co_consts=[]
max.__code__.co_varnames=['iterable']
function memoryview(obj){throw NotImplementedError('memoryview is not implemented')
}
function min(){var args=[]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return $extreme(args,'__lt__')
}
min.__doc__='min(iterable[, key=func]) -> value\nmin(a, b, c, ...[, key=func]) -> value\n\nWith a single iterable argument, return its smallest item.\nWith two or more arguments, return the smallest argument.'
min.__code__={}
min.__code__.co_argcount=1
min.__code__.co_consts=[]
min.__code__.co_varnames=['iterable']
function next(obj){var ga=getattr(obj,'__next__')
if(ga!==undefined)return ga()
throw _b_.TypeError("'"+$B.get_class(obj).__name__+"' object is not an iterator")
}
next.__doc__='next(iterator[, default])\n\nReturn the next item from the iterator. If default is given and the iterator\nis exhausted, it is returned instead of raising StopIteration.'
next.__code__={}
next.__code__.co_argcount=1
next.__code__.co_consts=[]
next.__code__.co_varnames=['iterable']
var $NotImplementedDict={__class__:$B.$type,__name__:'NotImplementedType'}
$NotImplementedDict.__mro__=[$NotImplementedDict,$ObjectDict]
$NotImplementedDict.__repr__=$NotImplementedDict.__str__=function(){return 'NotImplemented'}
var NotImplemented={__class__ : $NotImplementedDict,}
function $not(obj){return !bool(obj)}
function oct(x){return $builtin_base_convert_helper(x,8)}
oct.__doc__="oct(number) -> string\n\nReturn the octal representation of an integer.\n\n   >>> oct(342391)\n   '0o1234567'\n"
oct.__code__={}
oct.__code__.co_argcount=1
oct.__code__.co_consts=[]
oct.__code__.co_varnames=['number']
function ord(c){
return c.charCodeAt(0)
}
ord.__doc__='ord(c) -> integer\n\nReturn the integer ordinal of a one-character string.'
ord.__code__={}
ord.__code__.co_argcount=1
ord.__code__.co_consts=[]
ord.__code__.co_varnames=['number']
function pow(){var $ns=$B.$MakeArgs('pow',arguments,[],[],'args','kw')
var args=$ns['args']
if(args.length<2){throw _b_.TypeError(
"pow expected at least 2 arguments, got "+args.length)
}
if(args.length>3){throw _b_.TypeError(
"pow expected at most 3 arguments, got "+args.length)
}
if(args.length===2){var x=args[0]
var y=args[1]
var a,b
if(isinstance(x,_b_.float)){a=x.value
}else if(isinstance(x,_b_.int)){a=x
}else{throw _b_.TypeError("unsupported operand type(s) for ** or pow()")
}
if(isinstance(y,_b_.float)){b=y.value
}else if(isinstance(y,_b_.int)){b=y
}else{
throw _b_.TypeError("unsupported operand type(s) for ** or pow()")
}
return Math.pow(a,b)
}
if(args.length===3){var x=args[0]
var y=args[1]
var z=args[2]
var _err="pow() 3rd argument not allowed unless all arguments are integers"
if(!isinstance(x,_b_.int))throw _b_.TypeError(_err)
if(!isinstance(y,_b_.int))throw _b_.TypeError(_err)
if(!isinstance(z,_b_.int))throw _b_.TypeError(_err)
return Math.pow(x,y)%z
}}
pow.__doc__='pow(x, y[, z]) -> number\n\nWith two arguments, equivalent to x**y.  With three arguments,\nequivalent to (x**y) % z, but may be more efficient (e.g. for ints).'
pow.__code__={}
pow.__code__.co_argcount=2
pow.__code__.co_consts=[]
pow.__code__.co_varnames=['x','y']
function $print(){var end='\n',sep=' ',file=$B.stdout
var $ns=$B.$MakeArgs('print',arguments,[],['end','sep','file'],'args',null)
for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
getattr(file,'write')(args.map(_b_.str).join(sep)+end)
}
$print.__name__='print'
function $prompt(text,fill){return prompt(text,fill ||'')}
var $PropertyDict={__class__ : $B.$type,__name__ : 'property',__repr__ : function(){return "<property object>"},__str__ : function(){return "<property object>"},toString : function(){return "property"}}
$PropertyDict.__mro__=[$PropertyDict,$ObjectDict]
$B.$PropertyDict=$PropertyDict
function property(fget,fset,fdel,doc){var p={__class__ : $PropertyDict,__doc__ : doc ||"",$type:fget.$type,fget:fget,fset:fset,fdel:fdel,toString:function(){return '<property>'}}
p.__get__=function(self,obj,objtype){if(obj===undefined)return self
if(self.fget===undefined)throw _b_.AttributeError("unreadable attribute")
return getattr(self.fget,'__call__')(obj)
}
if(fset!==undefined){p.__set__=function(self,obj,value){if(self.fset===undefined)throw _b_.AttributeError("can't set attribute")
getattr(self.fset,'__call__')(obj,value)
}}
p.__delete__=fdel
p.getter=function(fget){return property(fget,p.fset,p.fdel,p.__doc__)}
p.setter=function(fset){return property(p.fget,fset,p.fdel,p.__doc__)}
p.deleter=function(fdel){return property(p.fget,p.fset,fdel,p.__doc__)}
return p
}
property.__class__=$B.$factory
property.$dict=$PropertyDict
property.__doc__='property(fget=None, fset=None, fdel=None, doc=None) -> property attribute\n\nfget is a function to be used for getting an attribute value, and likewise\nfset is a function for setting, and fdel a function for del\'ing, an\nattribute.  Typical use is to define a managed attribute x:\n\nclass C(object):\n    def getx(self): return self._x\n    def setx(self, value): self._x = value\n    def delx(self): del self._x\n    x = property(getx, setx, delx, "I\'m the \'x\' property.")\n\nDecorators make defining new properties or modifying existing ones easy:\n\nclass C(object):\n    @property\n    def x(self):\n        "I am the \'x\' property."\n        return self._x\n    @x.setter\n    def x(self, value):\n        self._x = value\n    @x.deleter\n    def x(self):\n        del self._x\n'
property.__code__={}
property.__code__.co_argcount=4
property.__code__.co_consts=[]
property.__code__.co_varnames=['fget','fset','fdel','doc']
var $RangeDict={__class__:$B.$type,__name__:'range',$native:true}
$RangeDict.__contains__=function(self,other){var x=iter(self)
while(1){try{var y=$RangeDict.__next__(x)
if(getattr(y,'__eq__')(other)){return true}}catch(err){return false}}
return false
}
$RangeDict.__getitem__=function(self,rank){var t0=new Date().getTime()
var res=self.start + rank*self.step
if((self.step>0 && res >=self.stop)||
(self.step<0 && res < self.stop)){throw _b_.IndexError('range object index out of range')
}
return res 
}
$RangeDict.__getitems__=function(self){var t=[],rank=0
while(1){var res=self.start + rank*self.step
if((self.step>0 && res >=self.stop)||
(self.step<0 && res < self.stop)){break
}
t.push(res)
rank++
}
return t
}
$RangeDict.__iter__=function(self){return{
__class__ : $RangeDict,start:self.start,stop:self.stop,step:self.step,$counter:self.start-self.step
}}
$RangeDict.__len__=function(self){if(self.step>0)return 1+_b_.int((self.stop-1-self.start)/self.step)
return 1+_b_.int((self.start-1-self.stop)/-self.step)
}
$RangeDict.__next__=function(self){self.$counter +=self.step
if((self.step>0 && self.$counter >=self.stop)
||(self.step<0 && self.$counter <=self.stop)){throw _b_.StopIteration('')
}
return self.$counter
}
$RangeDict.__mro__=[$RangeDict,$ObjectDict]
$RangeDict.__reversed__=function(self){return range(self.stop-1,self.start-1,-self.step)
}
$RangeDict.__repr__=$RangeDict.__str__=function(self){var res='range('+self.start+', '+self.stop
if(self.step!=1)res +=', '+self.step
return res+')'
}
function range(){var $ns=$B.$MakeArgs('range',arguments,[],[],'args',null)
var args=$ns['args']
if(args.length>3){throw _b_.TypeError(
"range expected at most 3 arguments, got "+args.length)
}
var start=0
var stop=0
var step=1
if(args.length==1){stop=args[0]}
else if(args.length>=2){start=args[0]
stop=args[1]
}
if(args.length>=3)step=args[2]
if(step==0){throw ValueError("range() arg 3 must not be zero")}
var res={__class__ : $RangeDict,start:start,stop:stop,step:step,$is_range:true
}
res.__repr__=res.__str__=function(){return 'range('+start+','+stop+(args.length>=3 ? ','+step : '')+')'
}
return res
}
range.__class__=$B.$factory
range.$dict=$RangeDict
$RangeDict.$factory=range
range.__doc__='range(stop) -> range object\nrange(start, stop[, step]) -> range object\n\nReturn a virtual sequence of numbers from start to stop by step.'
range.__code__={}
range.__code__.co_argcount=1
range.__code__.co_consts=[]
range.__code__.co_varnames=['stop']
function repr(obj){var func=getattr(obj,'__repr__')
if(func!==undefined)return func()
throw _b_.AttributeError("object has no attribute __repr__")
}
repr.__doc__='repr(object) -> string\n\nReturn the canonical string representation of the object.\nFor most object types, eval(repr(object)) == object.'
repr.__code__={}
repr.__code__.co_argcount=1
repr.__code__.co_consts=[]
repr.__code__.co_varnames=['object']
var $ReversedDict={__class__:$B.$type,__name__:'reversed'}
$ReversedDict.__mro__=[$ReversedDict,$ObjectDict]
$ReversedDict.__iter__=function(self){return self}
$ReversedDict.__next__=function(self){self.$counter--
if(self.$counter<0)throw _b_.StopIteration('')
return self.getter(self.$counter)
}
function reversed(seq){
try{return getattr(seq,'__reversed__')()}
catch(err){if(err.__name__=='AttributeError'){$B.$pop_exc()}
else{throw err}}
try{var res={__class__:$ReversedDict,$counter : getattr(seq,'__len__')(),getter:getattr(seq,'__getitem__')
}
return res
}catch(err){throw _b_.TypeError("argument to reversed() must be a sequence")
}}
reversed.__class__=$B.$factory
reversed.$dict=$ReversedDict
$ReversedDict.$factory=reversed
reversed.__doc__='reversed(sequence) -> reverse iterator over values of the sequence\n\nReturn a reverse iterator'
reversed.__code__={}
reversed.__code__.co_argcount=1
reversed.__code__.co_consts=[]
reversed.__code__.co_varnames=['sequence']
function round(arg,n){if(!isinstance(arg,[_b_.int,_b_.float])){throw _b_.TypeError("type "+arg.__class__+" doesn't define __round__ method")
}
if(isinstance(arg,_b_.float)&&(arg.value===Infinity ||arg.value===-Infinity)){throw _b_.OverflowError("cannot convert float infinity to integer")
}
if(n===undefined)return _b_.int(Math.round(arg))
if(!isinstance(n,_b_.int)){throw _b_.TypeError(
"'"+n.__class__+"' object cannot be interpreted as an integer")}
var mult=Math.pow(10,n)
return _b_.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult)
}
round.__doc__='round(number[, ndigits]) -> number\n\nRound a number to a given precision in decimal digits (default 0 digits).\nThis returns an int when called with one argument, otherwise the\nsame type as the number. ndigits may be negative.'
round.__code__={}
round.__code__.co_argcount=1
round.__code__.co_consts=[]
round.__code__.co_varnames=['number']
function setattr(obj,attr,value){if(!isinstance(attr,_b_.str)){throw _b_.TypeError("setattr(): attribute name must be string")
}
switch(attr){case 'alert':
case 'case':
case 'catch':
case 'constructor':
case 'Date':
case 'delete':
case 'default':
case 'document':
case 'Error':
case 'history':
case 'function':
case 'location':
case 'Math':
case 'new':
case 'Number':
case 'RegExp':
case 'this':
case 'throw':
case 'var':
case 'super':
case 'window':
attr='$$'+attr
}
var res=obj[attr]
if(res===undefined){var mro=$B.get_class(obj).__mro__
for(var i=0;i<mro.length;i++){res=mro[i][attr]
if(res!==undefined)break
}}
if(res!==undefined){
if(res.__set__!==undefined)return res.__set__(res,obj,value)
var __set__=getattr(res,'__set__',null)
if(__set__ &&(typeof __set__=='function')){return __set__.apply(res,[obj,value])}}
if(obj.$simple_setattr){obj[attr]=value;return}
try{var f=getattr(obj,'__setattr__')}
catch(err){$B.$pop_exc()
obj[attr]=value
return
}
f(attr,value)
}
setattr.__doc__="setattr(object, name, value)\n\nSet a named attribute on an object; setattr(x, 'y', v) is equivalent to\n``x.y = v''."
setattr.__code__={}
setattr.__code__.co_argcount=3
setattr.__code__.co_consts=[]
setattr.__code__.co_varnames=['object','name','value']
var $SliceDict={__class__:$B.$type,__name__:'slice'}
$SliceDict.__mro__=[$SliceDict,$ObjectDict]
function slice(){var $ns=$B.$MakeArgs('slice',arguments,[],[],'args',null)
var args=$ns['args']
if(args.length>3){throw _b_.TypeError(
"slice expected at most 3 arguments, got "+args.length)
}else if(args.length==0){throw _b_.TypeError('slice expected at least 1 arguments, got 0')
}
var start=0,stop=0,step=1
if(args.length==1){start=None;stop=args[0];step=None}
else if(args.length>=2){start=args[0]
stop=args[1]
}
if(args.length>=3)step=args[2]
if(step==0)throw ValueError("slice step must not be zero")
var res={__class__ : $SliceDict,start:start,stop:stop,step:step
}
res.__repr__=res.__str__=function(){return 'slice('+start+','+stop+','+step+')'
}
return res
}
slice.__class__=$B.$factory
slice.$dict=$SliceDict
$SliceDict.$factory=slice
slice.__doc__='slice(stop)\nslice(start, stop[, step])\n\nCreate a slice object.  This is used for extended slicing (e.g. a[0:10:2]).'
slice.__code__={}
slice.__code__.co_argcount=3
slice.__code__.co_consts=[]
slice.__code__.co_varnames=['start','stop','step']
function sorted(){var $ns=$B.$MakeArgs('sorted',arguments,['iterable'],[],null,'kw')
if($ns['iterable']===undefined)throw _b_.TypeError("sorted expected 1 positional argument, got 0")
var iterable=$ns['iterable']
var key=_b_.dict.$dict.get($ns['kw'],'key',None)
var reverse=_b_.dict.$dict.get($ns['kw'],'reverse',false)
var obj=_b_.list(iterable)
var args=[obj]
if(key !==None)args.push({$nat:'kw',name:'key',value:key})
if(reverse)args.push({$nat:'kw',name:'reverse',value:true})
_b_.list.$dict.sort.apply(null,args)
return obj
}
sorted.__doc__='sorted(iterable, key=None, reverse=False) --> new sorted list'
sorted.__code__={}
sorted.__code__.co_argcount=3
sorted.__code__.co_consts=[]
sorted.__code__.co_varnames=['iterable','key','reverse']
var $StaticmethodDict={__class__:$B.$type,__name__:'staticmethod'}
$StaticmethodDict.__mro__=[$StaticmethodDict,$ObjectDict]
function staticmethod(func){func.$type='staticmethod'
return func
}
staticmethod.__class__=$B.$factory
staticmethod.$dict=$StaticmethodDict
$StaticmethodDict.$factory=staticmethod
staticmethod.__doc__='staticmethod(function) -> method\n\nConvert a function to be a static method.\n\nA static method does not receive an implicit first argument.\nTo declare a static method, use this idiom:\n\n     class C:\n     def f(arg1, arg2, ...): ...\n     f = staticmethod(f)\n\nIt can be called either on the class (e.g. C.f()) or on an instance\n(e.g. C().f()).  The instance is ignored except for its class.\n\nStatic methods in Python are similar to those found in Java or C++.\nFor a more advanced concept, see the classmethod builtin.'
staticmethod.__code__={}
staticmethod.__code__.co_argcount=1
staticmethod.__code__.co_consts=[]
staticmethod.__code__.co_varnames=['function']
function sum(iterable,start){if(start===undefined)start=0
var res=start
var iterable=iter(iterable)
while(1){try{var _item=next(iterable)
res=getattr(res,'__add__')(_item)
}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();break}
else{throw err}}}
return res
}
sum.__doc__="sum(iterable[, start]) -> value\n\nReturn the sum of an iterable of numbers (NOT strings) plus the value\nof parameter 'start' (which defaults to 0).  When the iterable is\nempty, return start."
sum.__code__={}
sum.__code__.co_argcount=2
sum.__code__.co_consts=[]
sum.__code__.co_varnames=['iterable','start']
var $SuperDict={__class__:$B.$type,__name__:'super'}
$SuperDict.__getattribute__=function(self,attr){var mro=self.__thisclass__.$dict.__mro__,res
for(var i=1;i<mro.length;i++){
res=mro[i][attr]
if(res!==undefined){
if(self.__self_class__!==None){var _args=[self.__self_class__]
if(attr=='__new__'){_args=[]}
var method=(function(initial_args){return function(){
var local_args=initial_args.slice()
for(var i=0;i<arguments.length;i++){local_args.push(arguments[i])
}
var x=res.apply(null,local_args)
if(x===undefined)return None
return x
}})(_args)
method.__class__={__class__:$B.$type,__name__:'method',__mro__:[$ObjectDict]
}
method.__func__=res
method.__self__=self
return method
}
return res
}}
throw _b_.AttributeError("object 'super' has no attribute '"+attr+"'")
}
$SuperDict.__mro__=[$SuperDict,$ObjectDict]
$SuperDict.__repr__=$SuperDict.__str__=function(self){return "<object 'super'>"}
function $$super(_type1,_type2){return{__class__:$SuperDict,__thisclass__:_type1,__self_class__:(_type2 ||None)
}}
$$super.$dict=$SuperDict
$$super.__class__=$B.$factory
$SuperDict.$factory=$$super
$$super.$is_func=true
var $Reader={__class__:$B.$type,__name__:'reader'}
$Reader.__enter__=function(self){return self}
$Reader.__exit__=function(self){return false}
$Reader.__iter__=function(self){return iter(self.$lines)}
$Reader.__len__=function(self){return self.lines.length}
$Reader.__mro__=[$Reader,$ObjectDict]
$Reader.close=function(self){self.closed=true}
$Reader.read=function(self,nb){if(self.closed===true)throw _b_.ValueError('I/O operation on closed file')
if(nb===undefined)return self.$content
self.$counter+=nb
return self.$content.substr(self.$counter-nb,nb)
}
$Reader.readable=function(self){return true}
$Reader.readline=function(self,limit){if(res.closed===true)throw _b_.ValueError('I/O operation on closed file')
var line=''
if(limit===undefined||limit===-1)limit=null
while(1){if(self.$counter>=self.$content.length-1)break
var car=self.$content.charAt(self.$counter)
if(car=='\n'){self.$counter++;return line}
line +=car
if(limit!==null && line.length>=limit)return line
self.$counter++
}}
$Reader.readlines=function(self,hint){if(self.closed===true)throw _b_.ValueError('I/O operation on closed file')
var x=self.$content.substr(self.$counter).split('\n')
if(hint && hint!==-1){var y=[],size=0
while(1){var z=x.shift()
y.push(z)
size +=z.length
if(size>hint ||x.length==0)return y
}}else{return x}}
$Reader.seek=function(self,offset,whence){if(self.closed===True)throw _b_.ValueError('I/O operation on closed file')
if(whence===undefined)whence=0
if(whence===0){self.$counter=offset}
else if(whence===1){self.$counter +=offset}
else if(whence===2){self.$counter=self.$content.length+offset}}
$Reader.seekable=function(self){return true}
$Reader.tell=function(self){return self.$counter}
$Reader.writable=function(self){return false}
var $BufferedReader={__class__:$B.$type,__name__:'_io.BufferedReader'}
$BufferedReader.__mro__=[$BufferedReader,$Reader,$ObjectDict]
var $TextIOWrapper={__class__:$B.$type,__name__:'_io.TextIOWrapper'}
$TextIOWrapper.__mro__=[$TextIOWrapper,$Reader,$ObjectDict]
function $url_open(){
var mode='r',encoding='utf-8'
var $ns=$B.$MakeArgs('open',arguments,['file'],['mode','encoding'],'args','kw')
for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
if(args.length>0)var mode=args[0]
if(args.length>1)var encoding=args[1]
if(isinstance(file,$B.JSObject))return new $OpenFile(file.js,mode,encoding)
if(isinstance(file,_b_.str)){
if(window.XMLHttpRequest){
var req=new XMLHttpRequest()
}else{
var req=new ActiveXObject("Microsoft.XMLHTTP")
}
req.onreadystatechange=function(){var status=req.status
if(status===404){$res=_b_.IOError('File not found')
}else if(status!==200){$res=_b_.IOError('Could not open file '+file+' : status '+status)
}else{$res=req.responseText
}}
var fake_qs='?foo='+Math.random().toString(36).substr(2,8)
req.open('GET',file+fake_qs,false)
var is_binary=mode.search('b')>-1
if(is_binary){req.overrideMimeType('text/plain; charset=iso-8859-1')
}
req.send()
if($res.constructor===Error)throw $res
var lines=$res.split('\n')
var res={$content:$res,$counter:0,$lines:lines,closed:False,encoding:encoding,mode:mode,name:file
}
res.__class__=is_binary ? $BufferedReader : $TextIOWrapper
return res
}}
var $ZipDict={__class__:$B.$type,__name__:'zip'}
var $zip_iterator=$B.$iterator_class('zip_iterator')
$ZipDict.__iter__=function(self){return $B.$iterator(self.items,$zip_iterator)
}
$ZipDict.__mro__=[$ZipDict,$ObjectDict]
function zip(){var res={__class__:$ZipDict,items:[]}
if(arguments.length==0)return res
var $ns=$B.$MakeArgs('zip',arguments,[],[],'args','kw')
var _args=$ns['args']
var args=[]
for(var i=0;i<_args.length;i++){args.push(iter(_args[i]))}
var kw=$ns['kw']
var rank=0,items=[]
while(1){var line=[],flag=true
for(var i=0;i<args.length;i++){try{var x=next(args[i])
line.push(x)
}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();flag=false;break}
else{throw err}}}
if(!flag)break
items.push(_b_.tuple(line))
rank++
}
res.items=items
return res
}
zip.__class__=$B.$factory
zip.$dict=$ZipDict
$ZipDict.$factory=zip
zip.__doc__='zip(iter1 [,iter2 [...]]) --> zip object\n\nReturn a zip object whose .__next__() method returns a tuple where\nthe i-th element comes from the i-th iterable argument.  The .__next__()\nmethod continues until the shortest iterable in the argument sequence\nis exhausted and then it raises StopIteration.'
zip.__code__={}
zip.__code__.co_argcount=1
zip.__code__.co_consts=[]
zip.__code__.co_varnames=['iter1']
var $BoolDict=$B.$BoolDict={__class__:$B.$type,__name__:'bool',__repr__ : function(){return "<class 'bool'>"},__str__ : function(){return "<class 'bool'>"},toString : function(){return "<class 'bool'>"},$native:true
}
$BoolDict.__mro__=[$BoolDict,$ObjectDict]
bool.__class__=$B.$factory
bool.$dict=$BoolDict
$BoolDict.$factory=bool
bool.__doc__='bool(x) -> bool\n\nReturns True when the argument x is true, False otherwise.\nThe builtins True and False are the only two instances of the class bool.\nThe class bool is a subclass of the class int, and cannot be subclassed.'
bool.__code__={}
bool.__code__.co_argcount=1
bool.__code__.co_consts=[]
bool.__code__.co_varnames=['x']
$BoolDict.__add__=function(self,other){if(self.valueOf())return other + 1
return other
}
var True=true
var False=false
$BoolDict.__eq__=function(self,other){if(self.valueOf())return !!other
return !other
}
$BoolDict.__ne__=function(self,other){if(self.valueOf())return !other
return !!other
}
$BoolDict.__ge__=function(self,other){return _b_.int.$dict.__ge__($BoolDict.__hash__(self),other)
}
$BoolDict.__gt__=function(self,other){return _b_.int.$dict.__gt__($BoolDict.__hash__(self),other)
}
$BoolDict.__hash__=function(self){if(self.valueOf())return 1
return 0
}
$BoolDict.__le__=function(self,other){return !$BoolDict.__gt__(self,other)}
$BoolDict.__lt__=function(self,other){return !$BoolDict.__ge__(self,other)}
$BoolDict.__mul__=function(self,other){if(self.valueOf())return other
return 0
}
$BoolDict.__repr__=$BoolDict.__str__=function(self){if(self.valueOf())return "True"
return "False"
}
$BoolDict.__sub__=function(self,other){if(self.valueOf())return 1-other
return -other
}
var $EllipsisDict={__class__:$B.$type,__name__:'Ellipsis',}
$EllipsisDict.__mro__=[$ObjectDict]
$EllipsisDict.$factory=$EllipsisDict
var Ellipsis={__bool__ : function(){return False},__class__ : $EllipsisDict,__repr__ : function(){return 'Ellipsis'},__str__ : function(){return 'Ellipsis'},toString : function(){return 'Ellipsis'}}
for(var $key in $B.$comps){
switch($B.$comps[$key]){case 'ge':
case 'gt':
case 'le':
case 'lt':
Ellipsis['__'+$B.$comps[$key]+'__']=(function(k){return function(other){throw _b_.TypeError("unorderable types: ellipsis() "+k+" "+
$B.get_class(other).__name__)}})($key)
}}
for(var $func in Ellipsis){if(typeof Ellipsis[$func]==='function'){Ellipsis[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+" of Ellipsis object>"}})($func)
}}
var $NoneDict={__class__:$B.$type,__name__:'NoneType',}
$NoneDict.__mro__=[$NoneDict,$ObjectDict]
$NoneDict.$factory=$NoneDict
var None={__bool__ : function(){return False},__class__ : $NoneDict,__hash__ : function(){return 0},__repr__ : function(){return 'None'},__str__ : function(){return 'None'},toString : function(){return 'None'}}
for(var $key in $B.$comps){
switch($key){case 'ge':
case 'gt':
case 'le':
case 'lt':
None['__'+$B.$comps[$key]+'__']=(function(k){return function(other){throw _b_.TypeError("unorderable types: NoneType() "+k+" "+
$B.get_class(other).__name__)}})($key)
}}
for(var $func in None){if(typeof None[$func]==='function'){None[$func].__str__=(function(f){return function(){return "<method-wrapper "+f+" of NoneType object>"}})($func)
}}
var $FunctionCodeDict={__class__:$B.$type,__name__:'function code'}
$FunctionCodeDict.__mro__=[$FunctionCodeDict,$ObjectDict]
var $FunctionGlobalsDict={__class:$B.$type,__name__:'function globals'}
$FunctionGlobalsDict.__mro__=[$FunctionGlobalsDict,$ObjectDict]
var $FunctionDict=$B.$FunctionDict={__class__:$B.$type,__code__:{__class__:$FunctionCodeDict,__name__:'function code'},__globals__:{__class__:$FunctionGlobalsDict,__name__:'function globals'},__name__:'function'
}
$FunctionDict.__repr__=$FunctionDict.__str__=function(self){return '<function '+self.__name__+'>'}
$FunctionDict.__mro__=[$FunctionDict,$ObjectDict]
var $Function=function(){}
$FunctionDict.$factory=$Function
$Function.$dict=$FunctionDict
var $BaseExceptionDict={__class__:$B.$type,__name__:'BaseException'}
$BaseExceptionDict.__init__=function(self){self.args=[arguments[1]]
}
$BaseExceptionDict.__repr__=function(self){if(self.message===None){return $B.get_class(self).__name__+'()'}
return self.message
}
$BaseExceptionDict.__str__=$BaseExceptionDict.__repr__
$BaseExceptionDict.__mro__=[$BaseExceptionDict,$ObjectDict]
$BaseExceptionDict.__new__=function(cls){var err=_b_.BaseException()
err.__name__=cls.$dict.__name__
err.__class__=cls.$dict
return err
}
var $TracebackDict={__class__:$B.$type,__name__:'traceback',__mro__:[$ObjectDict]
}
var $FrameDict={__class__:$B.$type,__name__:'frame',__mro__:[$ObjectDict]
}
var BaseException=function(msg,js_exc){var err=Error()
err.info='Traceback (most recent call last):'
if(msg===undefined)msg='BaseException'
var tb=null
if($B.debug && !msg.info){if(js_exc!==undefined){for(var attr in js_exc){if(attr==='message')continue
try{err.info +='\n    '+attr+' : '+js_exc[attr]}
catch(_err){void(0)}}
err.info+='\n' 
}
var last_info,tb=null
for(var i=0;i<$B.call_stack.length;i++){var call_info=$B.call_stack[i]
var lib_module=call_info[1]
var caller=$B.modules[lib_module].line_info
if(caller!==undefined){call_info=caller
lib_module=caller[1]
}
if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
var lines=$B.$py_src[call_info[1]].split('\n')
err.info +='\n  module '+lib_module+' line '+call_info[0]
var line=lines[call_info[0]-1]
while(line && line.charAt(0)==' '){line=line.substr(1)}
err.info +='\n    '+line
last_info=call_info
if(i==0){tb={__class__:$TracebackDict,tb_frame:{__class__:$FrameDict},tb_lineno:call_info[0],tb_lasti:line,tb_next: None 
}}}
var err_info=$B.line_info
if(err_info!==undefined){while(1){var mod=$B.modules[err_info[1]]
if(mod===undefined)break
var caller=mod.line_info
if(caller===undefined)break
err_info=caller
}}
if(err_info!==undefined && err_info!==last_info){var module=err_info[1]
var line_num=err_info[0]
try{var lines=$B.$py_src[module].split('\n')
}catch(err){console.log('--module '+module);throw err}
var lib_module=module
if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
err.info +="\n  module "+lib_module+" line "+line_num
var line=lines[line_num-1]
while(line && line.charAt(0)==' '){line=line.substr(1)}
err.info +='\n    '+line
tb={__class__:$TracebackDict,tb_frame:{__class__:$FrameDict},tb_lineno:line_num,tb_lasti:line,tb_next: None 
}}}else{
tb={__class__:$TracebackDict,tb_frame:{__class__:$FrameDict},tb_lineno:-1,tb_lasti:'',tb_next: None 
}}
err.message=msg
err.args=msg
err.__name__='BaseException'
err.__class__=$BaseExceptionDict
err.py_error=true
err.type='BaseException'
err.value=msg
err.traceback=tb
$B.exception_stack.push(err)
return err
}
BaseException.__name__='BaseException'
BaseException.__class__=$B.$factory
BaseException.$dict=$BaseExceptionDict
_b_.BaseException=BaseException
$B.exception=function(js_exc){
if($B.debug>0 && js_exc.caught===undefined){console.log('$B.exception ',js_exc)
for(var attr in js_exc){console.log(attr,js_exc[attr])}
console.log('line info '+ $B.line_info)
console.log(js_exc.info)
}
if(!js_exc.py_error){if($B.debug>0 && js_exc.info===undefined){
if($B.line_info!==undefined){var mod_name=$B.line_info[1]
var module=$B.modules[mod_name]
if(module){if(module.caller!==undefined){
$B.line_info=module.caller
var mod_name=$B.line_info[1]
}
var lib_module=mod_name
if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
var line_num=$B.line_info[0]
if($B.$py_src[mod_name]===undefined){console.log('pas de py_src pour '+mod_name)
}
var lines=$B.$py_src[mod_name].split('\n')
js_exc.message +="\n  module '"+lib_module+"' line "+line_num
js_exc.message +='\n'+lines[line_num-1]
js_exc.info_in_msg=true
}}else{console.log('error '+js_exc)
}}
var exc=Error()
exc.__name__=js_exc.__name__ ||js_exc.name
exc.__class__=_b_.Exception.$dict
if(js_exc.name=='ReferenceError'){exc.__name__='NameError'
exc.__class__=_b_.NameError.$dict
js_exc.message=js_exc.message.replace('$$','')
console.log('name error '+js_exc)
}
exc.message=js_exc.message ||'<'+js_exc+'>'
exc.info=''
exc.traceback={__class__:$TracebackDict,tb_frame:{__class__:$FrameDict},tb_lineno:-1,tb_lasti:'',tb_next: None 
}}else{var exc=js_exc
}
$B.exception_stack.push(exc)
return exc
}
$B.is_exc=function(exc,exc_list){
if(exc.__class__===undefined)exc=$B.exception(exc)
var exc_class=exc.__class__.$factory
for(var i=0;i<exc_list.length;i++){if(issubclass(exc_class,exc_list[i]))return true
}
return false
}
$B.builtins_block={id:'__builtins__',module:'__builtins__'}
$B.modules['__builtins__']=$B.builtins_block
$B.bound['__builtins__']={'__BRYTHON__':true,'$eval':true,'$open': true}
$B.bound['__builtins__']['BaseException']=true
$B.vars['__builtins__']={}
_b_.__BRYTHON__=__BRYTHON__
function $make_exc(names,parent){
var _str=[]
for(var i=0;i<names.length;i++){var name=names[i]
$B.bound['__builtins__'][name]=true
var $exc=(BaseException+'').replace(/BaseException/g,name)
_str.push('var $'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}')
_str.push('$'+name+'Dict.__mro__=[$'+name+'Dict].concat(parent.$dict.__mro__)')
_str.push('_b_.'+name+'='+$exc)
_str.push('_b_.'+name+'.__repr__ = function(){return "<class '+"'"+name+"'"+'>"}')
_str.push('_b_.'+name+'.__str__ = function(){return "<class '+"'"+name+"'"+'>"}')
_str.push('_b_.'+name+'.__class__=$B.$factory')
_str.push('$'+name+'Dict.$factory=_b_.'+name)
_str.push('_b_.'+name+'.$dict=$'+name+'Dict')
}
eval(_str.join(';'))
}
$make_exc(['SystemExit','KeyboardInterrupt','GeneratorExit','Exception'],BaseException)
$make_exc(['StopIteration','ArithmeticError','AssertionError','AttributeError','BufferError','EOFError','ImportError','LookupError','MemoryError','NameError','OSError','ReferenceError','RuntimeError','SyntaxError','SystemError','TypeError','ValueError','Warning'],_b_.Exception)
$make_exc(['FloatingPointError','OverflowError','ZeroDivisionError'],_b_.ArithmeticError)
$make_exc(['IndexError','KeyError'],_b_.LookupError)
$make_exc(['UnboundLocalError'],_b_.NameError)
$make_exc(['BlockingIOError','ChildProcessError','ConnectionError','FileExistsError','FileNotFoundError','InterruptedError','IsADirectoryError','NotADirectoryError','PermissionError','ProcessLookupError','TimeoutError'],_b_.OSError)
$make_exc(['BrokenPipeError','ConnectionAbortedError','ConnectionRefusedError','ConnectionResetError'],_b_.ConnectionError)
$make_exc(['NotImplementedError'],_b_.RuntimeError)
$make_exc(['IndentationError'],_b_.SyntaxError)
$make_exc(['TabError'],_b_.IndentationError)
$make_exc(['UnicodeError'],_b_.ValueError)
$make_exc(['UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError'],_b_.UnicodeError)
$make_exc(['DeprecationWarning','PendingDeprecationWarning','RuntimeWarning','SyntaxWarning','UserWarning','FutureWarning','ImportWarning','UnicodeWarning','BytesWarning','ResourceWarning'],_b_.Warning)
$make_exc(['EnvironmentError','IOError','VMSError','WindowsError'],_b_.OSError)
$B.$NameError=function(name){
throw _b_.NameError(name)
}
$B.$TypeError=function(msg){throw _b_.TypeError(msg)
}
var builtin_funcs=['abs','all','any','ascii','bin','bool','bytearray','bytes','callable','chr','classmethod','compile','complex','delattr','dict','dir','divmod','enumerate','exec','exit','filter','float','format','frozenset','getattr','globals','hasattr','hash','help','hex','id','input','int','isinstance','issubclass','iter','len','list','locals','map','max','memoryview','min','next','object','oct','open','ord','pow','print','property','quit','range','repr','reversed','round','set','setattr','slice','sorted','staticmethod','str','sum','super','tuple','type','vars','zip']
for(var i=0;i<builtin_funcs.length;i++){$B.builtin_funcs[builtin_funcs[i]]=true
}
var other_builtins=['Ellipsis','False','None','True','_','__build_class__','__debug__','__doc__','__import__','__name__','__package__','copyright','credits','license','NotImplemented']
var builtin_names=builtin_funcs.concat(other_builtins)
for(var i=0;i<builtin_names.length;i++){var name=builtin_names[i]
var name1=name
if(name=='open'){name1='$url_open'}
if(name=='super'){name='$$super'}
$B.bound['__builtins__'][name]=true
try{_b_[name]=eval(name1)
$B.vars['__builtins__'][name]=_b_[name]
if(typeof _b_[name]=='function'){if(_b_[name].__repr__===undefined){_b_[name].__repr__=_b_[name].__str__=(function(x){return function(){return '<built-in function '+x+'>'}})(name)
}
_b_[name].__module__='builtins'
_b_[name].__name__=name
var _c=_b_[name].__code__
_c=_c ||{}
_c.co_filename='builtins'
_c.co_code='' + _b_[name]
_c.co_flags=0
_c.co_name=name
_c.co_names=_c.co_names ||[]
_c.co_nlocals=_c.co_nlocals ||0
_c.co_comments=_c.co_comments ||''
_c.co_kwonlyargcount=_c.co_kwonlyargcount ||0
_b_[name].__code__=_c
_b_[name].__defaults__=_b_[name].__defaults__ ||[]
_b_[name].__kwdefaults__=_b_[name].__kwdefaults__ ||{}
_b_[name].__annotations__=_b_[name].__annotations__ ||{}}
_b_[name].__doc__=_b_[name].__doc__ ||''
}
catch(err){}}
$B._alert=_alert
_b_['$eval']=$eval
_b_['open']=$url_open
_b_['print']=$print
_b_['$$super']=$$super
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $ObjectDict=_b_.object.$dict
var isinstance=_b_.isinstance,getattr=_b_.getattr,None=_b_.None
var from_unicode={},to_unicode={}
var $BytearrayDict={__class__:$B.$type,__name__:'bytearray'}
var mutable_methods=['__delitem__','clear','copy','count','index','pop','remove','reverse','sort']
for(var i=0,_len_i=mutable_methods.length;i < _len_i;i++){var method=mutable_methods[i]
$BytearrayDict[method]=(function(m){return function(self){var args=[self.source]
for(var i=1,_len_i=arguments.length;i < _len_i;i++)args.push(arguments[i])
return _b_.list.$dict[m].apply(null,args)
}})(method)
}
var $bytearray_iterator=$B.$iterator_class('bytearray_iterator')
$BytearrayDict.__iter__=function(self){return $B.$iterator(self.source,$bytearray_iterator)
}
$BytearrayDict.__mro__=[$BytearrayDict,$ObjectDict]
$BytearrayDict.__repr__=$BytearrayDict.__str__=function(self){return 'bytearray('+$BytesDict.__repr__(self)+")"
}
$BytearrayDict.__setitem__=function(self,arg,value){if(isinstance(arg,_b_.int)){if(!isinstance(value,_b_.int)){throw _b_.TypeError('an integer is required')
}else if(value>255){throw _b_.ValueError("byte must be in range(0, 256)")
}
var pos=arg
if(arg<0)pos=self.source.length+pos
if(pos>=0 && pos<self.source.length){self.source[pos]=value}
else{throw _b_.IndexError('list index out of range')}}else if(isinstance(arg,_b_.slice)){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.source.length : arg.stop
var step=arg.step===None ? 1 : arg.step
if(start<0)start=self.source.length+start
if(stop<0)stop=self.source.length+stop
self.source.splice(start,stop-start)
if(hasattr(value,'__iter__')){var $temp=list(value)
for(var i=$temp.length-1;i>=0;i--){if(!isinstance($temp[i],_b_.int)){throw _b_.TypeError('an integer is required')
}else if($temp[i]>255){throw ValueError("byte must be in range(0, 256)")
}
self.source.splice(start,0,$temp[i])
}}else{throw _b_.TypeError("can only assign an iterable")
}}else{
throw _b_.TypeError('list indices must be integer, not '+$B.get_class(arg).__name__)
}}
$BytearrayDict.append=function(self,b){if(arguments.length!=2){throw _b_.TypeError(
"append takes exactly one argument ("+(arguments.length-1)+" given)")
}
if(!isinstance(b,_b_.int))throw _b_.TypeError("an integer is required")
if(b>255)throw ValueError("byte must be in range(0, 256)")
self.source.push(b)
}
$BytearrayDict.insert=function(self,pos,b){if(arguments.length!=3){throw _b_.TypeError(
"insert takes exactly 2 arguments ("+(arguments.length-1)+" given)")
}
if(!isinstance(b,_b_.int))throw _b_.TypeError("an integer is required")
if(b>255)throw ValueError("byte must be in range(0, 256)")
_b_.list.$dict.insert(self.source,pos,b)
}
function bytearray(source,encoding,errors){var _bytes=bytes(source,encoding,errors)
var obj={__class__:$BytearrayDict}
$BytearrayDict.__init__(obj,source,encoding,errors)
return obj
}
bytearray.__class__=$B.$factory
bytearray.$dict=$BytearrayDict
$BytearrayDict.$factory=bytearray
bytearray.__doc__='bytearray(iterable_of_ints) -> bytearray\nbytearray(string, encoding[, errors]) -> bytearray\nbytearray(bytes_or_buffer) -> mutable copy of bytes_or_buffer\nbytearray(int) -> bytes array of size given by the parameter initialized with null bytes\nbytearray() -> empty bytes array\n\nConstruct an mutable bytearray object from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - a bytes or a buffer object\n  - any object implementing the buffer API.\n  - an integer'
bytearray.__code__={}
bytearray.__code__.co_argcount=1
bytearray.__code__.co_consts=[]
bytearray.__code__.co_varnames=['i']
var $BytesDict={__class__ : $B.$type,__name__ : 'bytes'}
$BytesDict.__add__=function(self,other){if(!isinstance(other,bytes)){throw _b_.TypeError("can't concat bytes to " + _b_.str(other))
}
self.source=self.source.concat(other.source)
return self
}
var $bytes_iterator=$B.$iterator_class('bytes_iterator')
$BytesDict.__iter__=function(self){return $B.$iterator(self.source,$bytes_iterator)
}
$BytesDict.__eq__=function(self,other){return getattr(self.source,'__eq__')(other.source)
}
$BytesDict.__ge__=function(self,other){return _b_.list.$dict.__ge__(self.source,other.source)
}
$BytesDict.__getitem__=function(self,arg){var i
if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.source.length+pos
if(pos>=0 && pos<self.source.length)return self.source[pos]
throw _b_.IndexError('index out of range')
}else if(isinstance(arg,_b_.slice)){var step=arg.step===None ? 1 : arg.step
if(step>0){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? getattr(self.source,'__len__')(): arg.stop
}else{var start=arg.start===None ? 
getattr(self.source,'__len__')()-1 : arg.start
var stop=arg.stop===None ? 0 : arg.stop
}
if(start<0)start=self.source.length+start
if(stop<0)stop=self.source.length+stop
var res=[],i=null
if(step>0){if(stop<=start)return ''
for(i=start;i<stop;i+=step)res.push(self.source[i])
}else{
if(stop>=start)return ''
for(i=start;i>=stop;i+=step)res.push(self.source[i])
}
return bytes(res)
}else if(isinstance(arg,bool)){return self.source.__getitem__(_b_.int(arg))
}}
$BytesDict.__gt__=function(self,other){return _b_.list.$dict.__gt__(self.source,other.source)
}
$BytesDict.__init__=function(self,source,encoding,errors){var int_list=[]
if(source===undefined){
}else if(isinstance(source,_b_.int)){for(var i=0;i<source;i++)int_list.push(0)
}else{if(isinstance(source,_b_.str)){if(encoding===undefined)
throw _b_.TypeError("string argument without an encoding")
int_list=encode(source,encoding)
}else{
int_list=_b_.list(source)
}}
self.source=int_list
self.encoding=encoding
self.errors=errors
}
$BytesDict.__le__=function(self,other){return _b_.list.$dict.__le__(self.source,other.source)
}
$BytesDict.__len__=function(self){return self.source.length}
$BytesDict.__lt__=function(self,other){return _b_.list.$dict.__lt__(self.source,other.source)
}
$BytesDict.__mro__=[$BytesDict,$ObjectDict]
$BytesDict.__ne__=function(self,other){return !$BytesDict.__eq__(self,other)}
$BytesDict.__repr__=$BytesDict.__str__=function(self){var res="b'"
for(var i=0,_len_i=self.source.length;i < _len_i;i++){var s=self.source[i]
if(s<32 ||s>=128){var hx=s.toString(16)
hx=(hx.length==1 ? '0' : '')+ hx
res +='\\x'+hx
}else{res +=String.fromCharCode(s)
}}
return res+"'"
}
$BytesDict.__reduce_ex__=function(self){return $BytesDict.__repr__(self)}
$BytesDict.decode=function(self,encoding,errors){if(encoding===undefined)encoding='utf-8'
if(errors===undefined)errors='strict'
switch(errors){case 'strict':
case 'ignore':
case 'replace':
case 'surrogateescape':
case 'xmlcharrefreplace':
case 'backslashreplace':
return decode(self.source,encoding,errors)
default:
}}
$BytesDict.maketrans=function(from,to){var _t=[]
for(var i=0;i < 256;i++)_t[i]=i
for(var i=0,_len_i=from.source.length;i < _len_i;i++){var _ndx=from.source[i]
_t[_ndx]=to.source[i]
}
return bytes(_t)
}
function _strip(self,cars,lr){if(cars===undefined){cars=[]
var ws='\r\n \t'
for(var i=0,_len_i=ws.length;i < _len_i;i++){cars.push(ws.charCodeAt(i))}}else if(isinstance(cars,bytes)){cars=cars.source
}else{throw _b_.TypeError("Type str doesn't support the buffer API")
}
if(lr=='l'){for(var i=0,_len_i=self.source.length;i < _len_i;i++){if(cars.indexOf(self.source[i])==-1)break
}
return bytes(self.source.slice(i))
}
for(var i=self.source.length-1;i>=0;i--){if(cars.indexOf(self.source[i])==-1)break
}
return bytes(self.source.slice(0,i+1))
}
$BytesDict.lstrip=function(self,cars){return _strip(self,cars,'l')}
$BytesDict.rstrip=function(self,cars){return _strip(self,cars,'r')}
$BytesDict.strip=function(self,cars){var res=$BytesDict.lstrip(self,cars)
return $BytesDict.rstrip(res,cars)
}
$BytesDict.translate=function(self,table,_delete){if(_delete===undefined){_delete=[]}
else if(isinstance(_delete,bytes)){_delete=_delete.source}
else{throw _b_.TypeError("Type "+$B.get_class(_delete).__name+" doesn't support the buffer API")
}
var res=[]
if(isinstance(table,bytes)&& table.source.length==256){for(var i=0,_len_i=self.source.length;i < _len_i;i++){if(_delete.indexOf(self.source[i])>-1)continue
res.push(table.source[self.source[i]])
}}
return bytes(res)
}
$BytesDict.upper=function(self){var _res=[]
for(var i=0,_len_i=self.source.length;i < _len_i;i++)_res.push(self.source[i].toUpperCase())
return bytes(_res)
}
function $UnicodeEncodeError(encoding,position){throw _b_.UnicodeEncodeError("'"+encoding+
"' codec can't encode character in position "+position)
}
function $UnicodeDecodeError(encoding,position){throw _b_.UnicodeDecodeError("'"+encoding+
"' codec can't decode bytes in position "+position)
}
function _hex(int){return int.toString(16)}
function _int(hex){return parseInt(hex,16)}
function load_decoder(enc){
if(to_unicode[enc]===undefined){load_encoder(enc)
to_unicode[enc]={}
for(var attr in from_unicode[enc]){to_unicode[enc][from_unicode[enc][attr]]=attr
}}}
function load_encoder(enc){
if(from_unicode[enc]===undefined){var url=$B.brython_path
if(url.charAt(url.length-1)=='/'){url=url.substr(0,url.length-1)}
url +='/encodings/'+enc+'.js'
var f=_b_.open(url)
eval(f.$content)
}}
function decode(b,encoding,errors){var s=''
switch(encoding.toLowerCase()){case 'utf-8':
case 'utf8':
var i=0,cp
var _int_800=_int('800'),_int_c2=_int('c2'),_int_1000=_int('1000')
var _int_e0=_int('e0'),_int_e1=_int('e1'),_int_e3=_int('e3')
var _int_a0=_int('a0'),_int_80=_int('80'),_int_2000=_int('2000')
while(i<b.length){if(b[i]<=127){s +=String.fromCharCode(b[i])
i +=1
}else if(b[i]<_int_e0){if(i<b.length-1){cp=b[i+1]+ 64*(b[i]-_int_c2)
s +=String.fromCharCode(cp)
i +=2
}else{$UnicodeDecodeError(encoding,i)}}else if(b[i]==_int_e0){if(i<b.length-2){var zone=b[i+1]-_int_a0
cp=b[i+2]-_int_80+_int_800+64*zone
s +=String.fromCharCode(cp)
i +=3
}else{$UnicodeDecodeError(encoding,i)}}else if(b[i]<_int_e3){if(i<b.length-2){var zone=b[i+1]-_int_80
cp=b[i+2]-_int_80+_int_1000+64*zone
s +=String.fromCharCode(cp)
i +=3
}else{$UnicodeDecodeError(encoding,i)}}else{if(i<b.length-2){var zone1=b[i]-_int_e1-1
var zone=b[i+1]-_int_80+64*zone1
cp=b[i+2]-_int_80+_int_2000+64*zone
s +=String.fromCharCode(cp)
i +=3
}else{if(errors=='surrogateescape'){s+='\\udc' + _hex(b[i])
i+=1
}else{
$UnicodeDecodeError(encoding,i)
}}}}
break
case 'latin-1':
case 'iso-8859-1':
case 'windows-1252':
for(var i=0,_len_i=b.length;i < _len_i;i++)s +=String.fromCharCode(b[i])
break
case 'cp1250': 
case 'windows-1250': 
load_decoder('cp1250')
for(var i=0,_len_i=b.length;i < _len_i;i++){var u=to_unicode['cp1250'][b[i]]
if(u!==undefined){s+=String.fromCharCode(u)}
else{s +=String.fromCharCode(b[i])}}
break
case 'ascii':
for(var i=0,_len_i=b.length;i < _len_i;i++){var cp=b[i]
if(cp<=127){s +=String.fromCharCode(cp)}
else{var msg="'ascii' codec can't decode byte 0x"+cp.toString(16)
msg +=" in position "+i+": ordinal not in range(128)"
throw _b_.UnicodeDecodeError(msg)
}}
break
default:
throw _b_.LookupError("unknown encoding: "+encoding)
}
return s
}
function encode(s,encoding){var t=[]
switch(encoding.toLowerCase()){case 'utf-8':
case 'utf8':
var _int_800=_int('800'),_int_c2=_int('c2'),_int_1000=_int('1000')
var _int_e0=_int('e0'),_int_e1=_int('e1'),_int_a0=_int('a0'),_int_80=_int('80')
var _int_2000=_int('2000'),_int_D000=_int('D000')
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=127){t.push(cp)
}else if(cp<_int_800){var zone=Math.floor((cp-128)/64)
t.push(_int_c2+zone)
t.push(cp -64*zone)
}else if(cp<_int_1000){var zone=Math.floor((cp-_int_800)/64)
t.push(_int_e0)
t.push(_int_a0+zone)
t.push(_int_80 + cp - _int_800 - 64 * zone)
}else if(cp<_int_2000){var zone=Math.floor((cp-_int_1000)/64)
t.push(_int_e1+Math.floor((cp-_int_1000)/_int_1000))
t.push(_int_80+zone)
t.push(_int_80 + cp - _int_1000 -64*zone)
}else if(cp<_int_D000){var zone=Math.floor((cp-_int_2000)/64)
var zone1=Math.floor((cp-_int_2000)/_int_1000)
t.push(_int_e1+Math.floor((cp-_int_1000)/_int_1000))
t.push(_int_80+zone-zone1*64)
t.push(_int_80 + cp - _int_2000 - 64 * zone)
}}
break
case 'latin-1': 
case 'iso-8859-1': 
case 'windows-1252': 
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=255){t.push(cp)}
else{$UnicodeEncodeError(encoding,i)}}
break
case 'cp1250':
case 'windows-1250':
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=255){t.push(cp)}
else{
load_encoder('cp1250')
var res=from_unicode['cp1250'][cp]
if(res!==undefined){t.push(res)}
else{$UnicodeEncodeError(encoding,i)}}}
break
case 'ascii':
for(var i=0,_len_i=s.length;i < _len_i;i++){var cp=s.charCodeAt(i)
if(cp<=127){t.push(cp)}
else{$UnicodeEncodeError(encoding,i)}}
break
default:
throw _b_.LookupError("unknown encoding: "+ encoding.toLowerCase())
}
return t
}
function bytes(source,encoding,errors){
var obj={__class__:$BytesDict}
$BytesDict.__init__(obj,source,encoding,errors)
return obj
}
bytes.__class__=$B.$factory
bytes.$dict=$BytesDict
$BytesDict.$factory=bytes
bytes.__doc__='bytes(iterable_of_ints) -> bytes\nbytes(string, encoding[, errors]) -> bytes\nbytes(bytes_or_buffer) -> immutable copy of bytes_or_buffer\nbytes(int) -> bytes object of size given by the parameter initialized with null bytes\nbytes() -> empty bytes object\n\nConstruct an immutable array of bytes from:\n  - an iterable yielding integers in range(256)\n  - a text string encoded using the specified encoding\n  - any object implementing the buffer API.\n  - an integer'
bytes.__code__={}
bytes.__code__.co_argcount=1
bytes.__code__.co_consts=[]
bytes.__code__.co_varnames=['i']
for(var $attr in $BytesDict){if($BytearrayDict[$attr]===undefined){$BytearrayDict[$attr]=(function(attr){return function(){return $BytesDict[attr].apply(null,arguments)}})($attr)
}}
_b_.bytes=bytes
_b_.bytearray=bytearray
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
var $LocationDict={__class__:$B.$type,__name__:'Location'}
$LocationDict.__mro__=[$LocationDict,$ObjectDict]
function $Location(){
var obj={}
for(var x in window.location){if(typeof window.location[x]==='function'){obj[x]=(function(f){return function(){return f.apply(window.location,arguments)
}})(window.location[x])
}else{obj[x]=window.location[x]
}}
if(obj['replace']===undefined){
obj['replace']=function(url){window.location=url}}
obj.__class__=$LocationDict
obj.toString=function(){return window.location.toString()}
obj.__repr__=obj.__str__=obj.toString
return obj
}
$LocationDict.$factory=$Location
$Location.$dict=$LocationDict
var $JSConstructorDict={__class__:$B.$type,__name__:'JSConstructor'}
$JSConstructorDict.__call__=function(self){
var args=[null]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(pyobj2jsobj(arguments[i]))
}
var factory=self.func.bind.apply(self.func,args)
var res=new factory()
return $B.$JS2Py(res)
}
$JSConstructorDict.__mro__=[$JSConstructorDict,$ObjectDict]
function JSConstructor(obj){
return{
__class__:$JSConstructorDict,func:obj.js_func
}}
JSConstructor.__class__=$B.$factory
JSConstructor.$dict=$JSConstructorDict
$JSConstructorDict.$factory=JSConstructor
var jsobj2pyobj=$B.jsobj2pyobj=function(jsobj){switch(jsobj){case true:
case false:
return jsobj
case null:
return _b_.None
}
if(typeof jsobj==='object'){if('length' in jsobj)return _b_.list(jsobj)
var d=_b_.dict()
for(var $a in jsobj)_b_.dict.$dict.__setitem__(d,$a,jsobj[$a])
return d
}
if(typeof jsobj==='number'){if(jsobj.toString().indexOf('.')==-1)return _b_.int(jsobj)
return _b_.float(jsobj)
}
return $B.JSObject(jsobj)
}
var pyobj2jsobj=$B.pyobj2jsobj=function(pyobj){
if(pyobj===true ||pyobj===false)return pyobj
if(pyobj===_b_.None)return null
var klass=$B.get_class(pyobj)
if(klass===$JSObjectDict ||klass===$JSConstructorDict){
return pyobj.js
}else if(klass.__mro__.indexOf($B.DOMNode)>-1){
return pyobj.elt
}else if([_b_.list.$dict,_b_.tuple.$dict].indexOf(klass)>-1){
var res=[]
for(var i=0,_len_i=pyobj.length;i < _len_i;i++){res.push(pyobj2jsobj(pyobj[i]))}
return res
}else if(klass===_b_.dict.$dict){
var jsobj={}
for(var j=0,_len_j=pyobj.$keys.length;j < _len_j;j++){jsobj[pyobj.$keys[j]]=pyobj2jsobj(pyobj.$values[j])
}
return jsobj
}else if(klass===$B.builtins.float.$dict){
return pyobj.value
}else{
return pyobj
}}
var $JSObjectDict={__class__:$B.$type,__name__:'JSObject',toString:function(){return '(JSObject)'}}
$JSObjectDict.__bool__=function(self){return(new Boolean(self.js)).valueOf()
}
$JSObjectDict.__getattribute__=function(obj,attr){if(attr.substr(0,2)=='$$')attr=attr.substr(2)
if(obj.js===null)return $ObjectDict.__getattribute__(None,attr)
if(attr==='__class__')return $JSObjectDict
if(attr=="bind" && obj.js[attr]===undefined &&
obj.js['addEventListener']!==undefined){attr='addEventListener'}
var js_attr=obj.js[attr]
if(obj.js_func && obj.js_func[attr]!==undefined){js_attr=obj.js_func[attr]
}
if(js_attr !==undefined){if(typeof js_attr=='function'){
var res=function(){var args=[],arg
for(var i=0,_len_i=arguments.length;i < _len_i;i++){args.push(pyobj2jsobj(arguments[i]))
}
if(attr==='replace' && obj.js===location){location.replace(args[0])
return
}
var res=js_attr.apply(obj.js,args)
if(typeof res=='object')return JSObject(res)
if(res===undefined)return None
return $B.$JS2Py(res)
}
res.__repr__=function(){return '<function '+attr+'>'}
res.__str__=function(){return '<function '+attr+'>'}
return{__class__:$JSObjectDict,js:res,js_func:js_attr}}else{return $B.$JS2Py(obj.js[attr])
}}else if(obj.js===window && attr==='$$location'){
return $Location()
}
var res
var mro=[$JSObjectDict,$ObjectDict]
for(var i=0,_len_i=mro.length;i < _len_i;i++){var v=mro[i][attr]
if(v!==undefined){res=v
break
}}
if(res!==undefined){if(typeof res==='function'){
return function(){var args=[obj],arg
for(var i=0,_len_i=arguments.length;i < _len_i;i++){arg=arguments[i]
if(arg &&(arg.__class__===$JSObjectDict ||arg.__class__===$JSConstructorDict)){args.push(arg.js)
}else{args.push(arg)
}}
return res.apply(obj,args)
}}
return $B.$JS2Py(res)
}else{
throw _b_.AttributeError("no attribute "+attr+' for '+this)
}}
$JSObjectDict.__getitem__=function(self,rank){try{return getattr(self.js,'__getitem__')(rank)}
catch(err){if(self.js[rank]!==undefined)return JSObject(self.js[rank])
throw _b_.AttributeError(self+' has no attribute __getitem__')
}}
var $JSObject_iterator=$B.$iterator_class('JS object iterator')
$JSObjectDict.__iter__=function(self){return $B.$iterator(self.js,$JSObject_iterator)
}
$JSObjectDict.__len__=function(self){try{return getattr(self.js,'__len__')()}
catch(err){console.log('err in JSObject.__len__ : '+err)
throw _b_.AttributeError(this+' has no attribute __len__')
}}
$JSObjectDict.__mro__=[$JSObjectDict,$ObjectDict]
$JSObjectDict.__repr__=function(self){return "<JSObject wraps "+self.js.toString()+">"}
$JSObjectDict.__setattr__=function(self,attr,value){if(isinstance(value,JSObject)){self.js[attr]=value.js
}else{self.js[attr]=value
}}
$JSObjectDict.__setitem__=$JSObjectDict.__setattr__
$JSObjectDict.__str__=$JSObjectDict.__repr__
function JSObject(obj){
if(obj===null){return _b_.None}
if(typeof obj=='function'){return{__class__:$JSObjectDict,js:obj}}
var klass=$B.get_class(obj)
if(klass===_b_.list.$dict){
if(obj.__brython__)return obj
return{__class__:$JSObjectDict,js:obj}}
if(klass!==undefined)return obj
if(klass==$JSObjectDict)return obj
return{__class__:$JSObjectDict,js:obj}
}
JSObject.__class__=$B.$factory
JSObject.$dict=$JSObjectDict
$JSObjectDict.$factory=JSObject
$B.JSObject=JSObject
$B.JSConstructor=JSConstructor
})(__BRYTHON__)
;(function($B){$B.stdlib={}
var js=['__random','_ajax','_browser','_html','_io','_jsre','_multiprocessing','_os','_posixsubprocess','_svg','_sys','_timer','_websocket','aes','builtins','dis','hashlib','hmac-md5','hmac-ripemd160','hmac-sha1','hmac-sha224','hmac-sha256','hmac-sha3','hmac-sha384','hmac-sha512','javascript','json','marshal','math','md5','modulefinder','pbkdf2','rabbit','rabbit-legacy','rc4','ripemd160','sha1','sha224','sha256','sha3','sha384','sha512','time','tripledes']
for(var i=0;i<js.length;i++)$B.stdlib[js[i]]=['js']
var pylist=['VFS_import','_abcoll','_codecs','_collections','_csv','_dummy_thread','_functools','_imp','_io','_markupbase','_random','_socket','_sre','_string','_strptime','_struct','_sysconfigdata','_testcapi','_thread','_threading_local','_warnings','_weakref','_weakrefset','abc','antigravity','atexit','base64','binascii','bisect','browser.ajax','browser.html','browser.indexed_db','browser.local_storage','browser.markdown','browser.object_storage','browser.session_storage','browser.svg','browser.timer','browser.websocket','calendar','codecs','collections.abc','colorsys','configparser','Clib','copy','copyreg','csv','datetime','decimal','difflib','encodings.aliases','encodings.utf_8','errno','external_import','fnmatch','formatter','fractions','functools','gc','genericpath','getopt','heapq','html.entities','html.parser','http.cookies','imp','importlib._bootstrap','importlib.abc','importlib.machinery','importlib.util','inspect','io','itertools','keyword','linecache','locale','logging.config','logging.handlers','markdown2','multiprocessing.dummy.connection','multiprocessing.pool','multiprocessing.process','multiprocessing.util','numbers','operator','optparse','os','pickle','platform','posix','posixpath','pprint','pwd','pydoc','pydoc_data.topics','pyre','queue','random','re','reprlib','select','shutil','signal','site','site-packages.highlight','site-packages.test_sp','site-packages.turtle','socket','sre_compile','sre_constants','sre_parse','stat','string','struct','subprocess','sys','sysconfig','tarfile','tempfile','test.pystone','test.re_tests','test.regrtest','test.support','test.test_int','test.test_re','textwrap','this','threading','token','tokenize','traceback','types','ui.dialog','ui.progressbar','ui.slider','ui.widget','unittest.__main__','unittest.case','unittest.loader','unittest.main','unittest.mock','unittest.result','unittest.runner','unittest.signals','unittest.suite','unittest.test._test_warnings','unittest.test.dummy','unittest.test.support','unittest.test.test_assertions','unittest.test.test_break','unittest.test.test_case','unittest.test.test_discovery','unittest.test.test_functiontestcase','unittest.test.test_loader','unittest.test.test_program','unittest.test.test_result','unittest.test.test_runner','unittest.test.test_setups','unittest.test.test_skipping','unittest.test.test_suite','unittest.test.testmock.support','unittest.test.testmock.testcallable','unittest.test.testmock.testhelpers','unittest.test.testmock.testmagicmethods','unittest.test.testmock.testmock','unittest.test.testmock.testpatch','unittest.test.testmock.testsentinel','unittest.test.testmock.testwith','unittest.util','urllib.parse','urllib.request','warnings','weakref','webbrowser','xml.dom.NodeFilter','xml.dom.domreg','xml.dom.expatbuilder','xml.dom.minicompat','xml.dom.minidom','xml.dom.pulldom','xml.dom.xmlbuilder','xml.etree.ElementInclude','xml.etree.ElementPath','xml.etree.ElementTree','xml.etree.cElementTree','xml.parsers.expat','xml.sax._exceptions','xml.sax.expatreader','xml.sax.handler','xml.sax.saxutils','xml.sax.xmlreader','zipfile']
for(var i=0;i<pylist.length;i++)$B.stdlib[pylist[i]]=['py']
var pkglist=['browser','collections','encodings','html','http','importlib','logging','multiprocessing','multiprocessing.dummy','pydoc_data','test','ui','unittest','unittest.test','unittest.test.testmock','urllib','xml','xml.dom','xml.etree','xml.parsers','xml.sax']
for(var i=0;i<pkglist.length;i++)$B.stdlib[pkglist[i]]=['py',true]
})(__BRYTHON__)

;(function($B){var _b_=$B.builtins
$B.$ModuleDict={__class__ : $B.$type,__name__ : 'module',toString : function(){return '<class *module*>'}}
$B.$ModuleDict.__repr__=function(self){return '<module '+self.__name__+'>'}
$B.$ModuleDict.__setattr__=function(self,attr,value){self[attr]=value
$B.vars[self.__name__][attr]=value
}
$B.$ModuleDict.__str__=function(self){return '<module '+self.__name__+'>'}
$B.$ModuleDict.__mro__=[$B.$ModuleDict,_b_.object.$dict]
function module(){}
module.__class__=$B.$factory
module.$dict=$B.$ModuleDict
$B.$ModuleDict.$factory=module
function $importer(){
var $xmlhttp=new XMLHttpRequest()
if($B.$CORS && "withCredentials" in $xmlhttp){
}else if($B.$CORS && typeof window.XDomainRequest !="undefined"){
$xmlhttp=new window.XDomainRequest()
}else if(window.XMLHttpRequest){
}else{
$xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
}
var fake_qs
switch($B.$options.cache){case 'version':
fake_qs="?v="+$B.version_info[2]
break
case 'browser':
fake_qs=''
break
default:
fake_qs="?v="+Math.random().toString(36).substr(2,8)
}
var timer=setTimeout(function(){$xmlhttp.abort()
throw _b_.ImportError("No module named '"+module+"'")},5000)
return[$xmlhttp,fake_qs,timer]
}
function $download_module(module,url){var imp=$importer()
var $xmlhttp=imp[0],fake_qs=imp[1],timer=imp[2],res=null
$xmlhttp.open('GET',url+fake_qs,false)
if($B.$CORS){$xmlhttp.onload=function(){if($xmlhttp.status==200 ||$xmlhttp.status==0){res=$xmlhttp.responseText
}else{
res=_b_.FileNotFoundError("No module named '"+module+"'")
}}
$xmlhttp.onerror=function(){res=_b_.FileNotFoundError("No module named '"+module+"'")
}}else{
$xmlhttp.onreadystatechange=function(){if($xmlhttp.readyState==4){window.clearTimeout(timer)
if($xmlhttp.status==200 ||$xmlhttp.status==0){res=$xmlhttp.responseText}
else{
console.log('Error '+$xmlhttp.status+' means that Python module '+module+' was not found at url '+url)
res=_b_.FileNotFoundError("No module named '"+module+"'")
}}}}
if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
$xmlhttp.send()
if(res==null)throw _b_.FileNotFoundError("No module named '"+module+"' (res is null)")
if(res.constructor===Error){throw res}
return res
}
$B.$download_module=$download_module
function import_js(module,path){try{var module_contents=$download_module(module.name,path)}
catch(err){return null}
run_js(module,path,module_contents)
return true
}
function run_js(module,path,module_contents){eval(module_contents)
try{$module}
catch(err){throw _b_.ImportError("name '$module' is not defined in module")
}
$B.vars[module.name]=$module
$module.__class__=$B.$ModuleDict
$module.__name__=module.name
$module.__repr__=function(){return "<module '"+module.name+"' from "+path+" >"}
$module.__str__=function(){if(module.name=='builtins')return "<module '"+module.name+"' (built-in)>"
return "<module '"+module.name+"' from "+path+" >"
}
$module.toString=function(){return "<module '"+module.name+"' from "+path+" >"}
if(module.name !='builtins'){
$module.__file__=path
}
$B.imported[module.name]=$B.modules[module.name]=$module
return true
}
function show_ns(){var kk=Object.keys(window)
for(var i=0,_len_i=kk.length;i < _len_i;i++){console.log(kk[i])
if(kk[i].charAt(0)=='$'){console.log(eval(kk[i]))}}
console.log('---')
}
function import_py(module,path,package){
try{var module_contents=$download_module(module.name,path)
}catch(err){return null
}
$B.imported[module.name].$package=module.is_package
if(path.substr(path.length-12)=='/__init__.py'){$B.imported[module.name].__package__=module.name
}else if(package!==undefined){$B.imported[module.name].__package__=package
}else{var mod_elts=module.name.split('.')
mod_elts.pop()
$B.imported[module.name].__package__=mod_elts.join('.')
}
return run_py(module,path,module_contents)
}
$B.run_py=run_py=function(module,path,module_contents){var $Node=$B.$Node,$NodeJSCtx=$B.$NodeJSCtx
$B.$py_module_path[module.name]=path
var root=$B.py2js(module_contents,module.name,module.name,'__builtins__')
var body=root.children
root.children=[]
var mod_node=new $Node('expression')
new $NodeJSCtx(mod_node,'var $module=(function()')
root.insert(0,mod_node)
for(var i=0,_len_i=body.length;i < _len_i;i++){mod_node.add(body[i])}
var ret_node=new $Node('expression')
new $NodeJSCtx(ret_node,'return $globals')
mod_node.add(ret_node)
var ex_node=new $Node('expression')
new $NodeJSCtx(ex_node,')(__BRYTHON__)')
root.add(ex_node)
try{var js=root.to_js()
if($B.$options.debug==10 && module.name=='_thread'){console.log('code for module '+module.name)
console.log(js)
}
eval(js)
}catch(err){console.log(err+' for module '+module.name)
console.log('message: '+err.message)
console.log('filename: '+err.fileName)
console.log('linenum: '+err.lineNumber)
if($B.debug>0){console.log('line info '+ $B.line_info)}
throw err
}
try{
var mod=$B.imported[module.name]
for(var attr in $B.vars[module.name]){mod[attr]=$B.vars[module.name][attr]
}
mod.__class__=$B.$ModuleDict
mod.__repr__=function(){return "<module '"+module.name+"' from "+path+" >"}
mod.__str__=function(){return "<module '"+module.name+"' from "+path+" >"}
mod.toString=function(){return "module "+module.name}
mod.__file__=path
mod.__initializing__=false
mod.$package=module.is_package
$B.imported[module.name]=$B.modules[module.name]=$B.vars[module.name]=mod
return true
}catch(err){console.log(''+err+' '+' for module '+module.name)
for(var attr in err)console.log(attr+' '+err[attr])
if($B.debug>0){console.log('line info '+__BRYTHON__.line_info)}
throw err
}}
function import_from_VFS(mod_name){var stored=$B.VFS[mod_name]
if(stored!==undefined){var ext=stored[0]
var module_contents=stored[1]
var is_package=stored[2]
var path='py_VFS'
var module={name:mod_name,__class__:$B.$ModuleDict,is_package:is_package}
if(is_package){var package=mod_name}
else{var elts=mod_name.split('.')
elts.pop()
var package=elts.join('.')
}
$B.modules[mod_name].$package=is_package
$B.modules[mod_name].__package__=package
if(ext=='.js'){run_js(module,path,module_contents)}
else{run_py(module,path,module_contents)}
return true
}
return null
}
function import_from_stdlib_static(mod_name,origin,package){var address=$B.stdlib[mod_name]
if(address!==undefined){var ext=address[0]
var is_package=address[1]!==undefined
var path=$B.brython_path
if(ext=='py'){path+='Lib/'}
else{path+='libs/'}
path +=mod_name.replace(/\./g,'/')
if(is_package){path+='/__init__.py'}
else if(ext=='py'){path+='.py'}
else{path+='.js'}
if(ext=='py'){return import_py({name:mod_name,__class__:$B.$ModuleDict,is_package:is_package},path,package)
}else{return import_js({name:mod_name,__class__:$B.$ModuleDict},path)
}}
return null
}
function import_from_stdlib(mod_name,origin,package){var module={name:mod_name,__class__:$B.$ModuleDict}
var js_path=$B.brython_path+'libs/'+mod_name+'.js'
var js_mod=import_js(module,js_path)
if(js_mod!==null)return true
mod_path=mod_name.replace(/\./g,'/')
var py_paths=[$B.brython_path+'Lib/'+mod_path+'.py',$B.brython_path+'Lib/'+mod_path+'/__init__.py']
for(var i=0,_len_i=py_paths.length;i < _len_i;i++){var py_mod=import_py(module,py_paths[i],package)
if(py_mod!==null)return true
}
return null
}
function import_from_site_packages(mod_name,origin,package){var module={name:mod_name}
mod_path=mod_name.replace(/\./g,'/')
var py_paths=[$B.brython_path+'Lib/site-packages/'+mod_path+'.py',$B.brython_path+'Lib/site-packages/'+mod_path+'/__init__.py']
for(var i=0,_len_i=py_paths.length;i < _len_i;i++){var py_mod=import_py(module,py_paths[i],package)
if(py_mod!==null){
if(py_paths[i].substr(py_paths[i].length-12)=='/__init__.py'){
$B.imported[mod_name].$package=true
py_mod.__package__=mod_name 
}
return py_mod
}}
return null
}
function import_from_caller_folder(mod_name,origin,package){var module={name:mod_name}
var origin_path=$B.$py_module_path[origin]
var origin_dir_elts=origin_path.split('/')
origin_dir_elts.pop()
origin_dir=origin_dir_elts.join('/')
mod_elts=mod_name.split('.')
origin_elts=origin.split('.')
while(mod_elts[0]==origin_elts[0]){mod_elts.shift();origin_elts.shift()}
mod_path=mod_elts.join('/')
var py_paths=[origin_dir+'/'+mod_path+'.py',origin_dir+'/'+mod_path+'/__init__.py']
for(var i=0,_len_i=$B.path.length;i < _len_i;i++){if($B.path[i].substring(0,4)=='http')continue
var _path=origin_dir+'/'+ $B.path[i]+'/' 
py_paths.push(_path+ mod_path + ".py")
py_paths.push(_path+ mod_path + "/__init__.py")
}
for(var i=0,_len_i=py_paths.length;i < _len_i;i++){
var py_mod=import_py(module,py_paths[i],package)
if(py_mod!==null)return py_mod
}
return null 
}
$B.$import=function(mod_name,origin){
var parts=mod_name.split('.')
var norm_parts=[]
for(var i=0,_len_i=parts.length;i < _len_i;i++){norm_parts.push(parts[i].substr(0,2)=='$$' ? parts[i].substr(2): parts[i])
}
mod_name=norm_parts.join('.')
if($B.imported[origin]===undefined){var package=''}
else{var package=$B.imported[origin].__package__}
if($B.$options.debug==10){console.log('$import '+mod_name+' origin '+origin)
console.log('use VFS ? '+$B.use_VFS)
console.log('use static stdlib paths ? '+$B.static_stdlib_import)
}
if($B.imported[mod_name]!==undefined){return}
var mod,funcs=[]
if($B.use_VFS){funcs=[import_from_VFS]
}else if($B.static_stdlib_import){funcs=[import_from_stdlib_static]
}else{funcs=[import_from_stdlib]
}
if($B.$options['custom_import_funcs']!==undefined){funcs=funcs.concat($B.$options['custom_import_funcs'])
}
funcs=funcs.concat([import_from_site_packages,import_from_caller_folder])
var mod_elts=mod_name.split('.')
for(var i=0,_len_i=mod_elts.length;i < _len_i;i++){
var elt_name=mod_elts.slice(0,i+1).join('.')
if($B.modules[elt_name]!==undefined)continue 
$B.modules[elt_name]=$B.imported[elt_name]={__class__:$B.$ModuleDict,toString:function(){return '<module '+elt_name+'>'}}
var flag=false
for(var j=0,_len_j=funcs.length;j < _len_j;j++){var res=funcs[j](elt_name,origin,package)
if(res!==null){flag=true
if(i>0){var pmod=mod_elts.slice(0,i).join('.')
$B.modules[pmod][mod_elts[i]]=$B.modules[elt_name]
}
break
}}
if(!flag){
$B.modules[elt_name]=undefined
$B.imported[elt_name]=undefined
throw _b_.ImportError("cannot import "+elt_name)
}}}
$B.$import_from=function(mod_name,names,origin){
if($B.$options.debug==10){
}
if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
var mod=$B.imported[mod_name]
if(mod===undefined){$B.$import(mod_name,origin)
mod=$B.imported[mod_name]
}
for(var i=0,_len_i=names.length;i < _len_i;i++){if(mod[names[i]]===undefined){if(mod.$package){var sub_mod=mod_name+'.'+names[i]
$B.$import(sub_mod,origin)
mod[names[i]]=$B.modules[sub_mod]
}else{throw _b_.ImportError("cannot import name "+names[i])
}}}
return mod
}})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
for(var $py_builtin in _b_){eval("var "+$py_builtin+"=_b_[$py_builtin]")}
var $ObjectDict=_b_.object.$dict
function $err(op,other){var msg="unsupported operand type(s) for "+op
msg +=": 'float' and '"+$.get_class(other).__name__+"'"
throw _b_.TypeError(msg)
}
var $FloatDict={__class__:$B.$type,__name__:'float',$native:true}
$FloatDict.as_integer_ratio=function(self){if(Math.round(self.value)==self.value)return _b_.tuple([_b_.int(self.value),_b_.int(1)])
var _temp=self.value
var i=10
while(!(Math.round(_temp/i)==_temp/i))i*=10
return _b_.tuple([_b_.int(_temp*i),_b_.int(i)])
}
$FloatDict.__bool__=function(self){return _b_.bool(self.value)}
$FloatDict.__class__=$B.$type
$FloatDict.__eq__=function(self,other){
if(other===undefined)return self===float
if(isinstance(other,_b_.int))return self.value==other
if(isinstance(other,float)){
return self.value==other.value
}
if(isinstance(other,_b_.complex)){if(other.imag !=0)return false
return self.value==other.value
}
return self.value===other
}
$FloatDict.__floordiv__=function(self,other){if(isinstance(other,_b_.int)){if(other===0)throw ZeroDivisionError('division by zero')
return float(Math.floor(self.value/other))
}
if(isinstance(other,float)){if(!other.value)throw ZeroDivisionError('division by zero')
return float(Math.floor(self.value/other.value))
}
if(hasattr(other,'__rfloordiv__')){return getattr(other,'__rfloordiv__')(self)
}
$err('//',other)
}
$FloatDict.fromhex=function(arg){
if(!isinstance(arg,_b_.str)){throw _b_.ValueError('argument must be a string')
}
var value=arg.trim()
switch(value.toLowerCase()){case '+inf':
case 'inf':
case '+infinity':
case 'infinity':
return new $FloatClass(Infinity)
case '-inf':
case '-infinity':
return new $FloatClass(-Infinity)
case '+nan':
case 'nan':
return new $FloatClass(Number.NaN)
case '-nan':
return new $FloatClass(-Number.NaN)
case '':
throw _b_.ValueError('count not convert string to float')
}
var _m=/^(\d*\.?\d*)$/.exec(value)
if(_m !==null)return new $FloatClass(parseFloat(_m[1]))
var _m=/^(\+|-)?(0x)?([0-9A-F]+\.?)?(\.[0-9A-F]+)?(p(\+|-)?\d+)?$/i.exec(value)
if(_m==null)throw _b_.ValueError('invalid hexadecimal floating-point string')
var _sign=_m[1]
var _int=parseInt(_m[3]||'0',16)
var _fraction=_m[4]||'.0'
var _exponent=_m[5]||'p0'
if(_sign=='-'){_sign=-1}else{_sign=1}
var _sum=_int
for(var i=1,_len_i=_fraction.length;i < _len_i;i++)_sum+=parseInt(_fraction.charAt(i),16)/Math.pow(16,i)
return float(_sign * _sum * Math.pow(2,parseInt(_exponent.substring(1))))
}
$FloatDict.__getformat__=function(arg){if(arg=='double' ||arg=='float')return 'IEEE, little-endian'
throw _b_.ValueError("__getformat__() argument 1 must be 'double' or 'float'")
}
$FloatDict.__getitem__=function(){throw _b_.TypeError("'float' object is not subscriptable")
}
$FloatDict.__format__=function(self,format_spec){
if(format_spec=='')format_spec='f'
if(format_spec=='.4')format_spec='.4G'
return _b_.str.$dict.__mod__('%'+format_spec,self)
}
$FloatDict.__hash__=function(self){var _v=self.value
if(_v===Infinity)return 314159
if(_v===-Infinity)return -271828
if(isNaN(_v))return 0
var r=_b_.$frexp(_v)
r[0]*=Math.pow(2,31)
var hipart=_b_.int(r[0])
r[0]=(r[0]- hipart)* Math.pow(2,31)
var x=hipart + _b_.int(r[0])+(r[1]<< 15)
return x & 0xFFFFFFFF
}
_b_.$isninf=function(x){var x1=x
if(x.value !==undefined && isinstance(x,float))x1=x.value
return x1==-Infinity ||x1==Number.NEGATIVE_INFINITY
}
_b_.$isinf=function(x){var x1=x
if(x.value !==undefined && isinstance(x,float))x1=x.value
return x1==Infinity ||x1==-Infinity ||x1==Number.POSITIVE_INFINITY ||x1==Number.NEGATIVE_INFINITY
}
_b_.$fabs=function(x){return x>0?float(x):float(-x)}
_b_.$frexp=function(x){var x1=x
if(x.value !==undefined && isinstance(x,float))x1=x.value
if(isNaN(x1)||_b_.$isinf(x1)){return[x1,-1]}
if(x1==0)return[0,0]
var sign=1,ex=0,man=x1
if(man < 0.){sign=-sign
man=-man
}
while(man < 0.5){man *=2.0
ex--
}
while(man >=1.0){man *=0.5
ex++
}
man *=sign
return[man ,ex]
}
_b_.$ldexp=function(x,i){if(_b_.$isninf(x))return float('-inf')
if(_b_.$isinf(x))return float('inf')
var y=x
if(x.value !==undefined && isinstance(x,float))y=x.value
if(y==0)return y
var j=i
if(i.value !==undefined && isinstance(i,float))j=i.value
return y * Math.pow(2,j)
}
$FloatDict.hex=function(self){
var DBL_MANT_DIG=53 
var TOHEX_NBITS=DBL_MANT_DIG + 3 -(DBL_MANT_DIG+2)%4
switch(self.value){case Infinity:
case -Infinity:
case Number.NaN:
case -Number.NaN:
return self
case -0:
return '-0x0.0p0'
case 0:
return '0x0.0p0'
}
var _a=_b_.$frexp(_b_.$fabs(self.value))
var _m=_a[0],_e=_a[1]
var _shift=1 - Math.max(-1021 - _e,0)
_m=_b_.$ldexp(_m,_shift)
_e -=_shift
var _int2hex='0123456789ABCDEF'.split('')
var _s=_int2hex[Math.floor(_m)]
_s+='.'
_m -=Math.floor(_m)
for(var i=0;i <(TOHEX_NBITS-1)/4;i++){_m*=16.0
_s+=_int2hex[Math.floor(_m)]
_m-=Math.floor(_m)
}
var _esign='+'
if(_e < 0){_esign='-'
_e=-_e
}
if(self.value < 0)return "-0x" + _s + 'p' + _esign + _e
return "0x" + _s + 'p' + _esign + _e
}
$FloatDict.__init__=function(self,value){self.value=value}
$FloatDict.is_integer=function(self){return _b_.int(self.value)==self.value}
$FloatDict.__mod__=function(self,other){
if(isinstance(other,_b_.int))return float((self.value%other+other)%other)
if(isinstance(other,float)){return float(((self.value%other.value)+other.value)%other.value)
}
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1
return float((self.value%bool_value+bool_value)%bool_value)
}
if(hasattr(other,'__rmod__'))return getattr(other,'__rmod__')(self)
$err('%',other)
}
$FloatDict.__mro__=[$FloatDict,$ObjectDict]
$FloatDict.__mul__=function(self,other){if(isinstance(other,_b_.int))return float(self.value*other)
if(isinstance(other,float))return float(self.value*other.value)
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1
return float(self.value*bool_value)
}
if(isinstance(other,_b_.complex)){return _b_.complex(self.value*other.real,self.value*other.imag)
}
if(hasattr(other,'__rmul__'))return getattr(other,'__rmul__')(self)
$err('*',other)
}
$FloatDict.__ne__=function(self,other){return !$FloatDict.__eq__(self,other)}
$FloatDict.__neg__=function(self,other){return float(-self.value)}
$FloatDict.__pow__=function(self,other){if(isinstance(other,_b_.int))return float(Math.pow(self,other))
if(isinstance(other,float))return float(Math.pow(self.value,other.value))
if(hasattr(other,'__rpow__'))return getattr(other,'__rpow__')(self)
$err("** or pow()",other)
}
$FloatDict.__repr__=$FloatDict.__str__=function(self){if(self===float)return "<class 'float'>"
if(self.value==Infinity)return 'inf'
if(self.value==-Infinity)return '-inf'
if(isNaN(self.value))return 'nan'
var res=self.value+'' 
if(res.indexOf('.')==-1)res+='.0'
return _b_.str(res)
}
$FloatDict.__truediv__=function(self,other){if(isinstance(other,_b_.int)){if(other===0)throw ZeroDivisionError('division by zero')
return float(self.value/other)
}
if(isinstance(other,float)){if(!other.value)throw ZeroDivisionError('division by zero')
return float(self.value/other.value)
}
if(isinstance(other,_b_.complex)){var cmod=other.real*other.real+other.imag*other.imag
if(cmod==0)throw ZeroDivisionError('division by zero')
return _b_.complex(float(self.value*other.real/cmod),float(-self.value*other.imag/cmod))
}
if(hasattr(other,'__rtruediv__'))return getattr(other,'__rtruediv__')(self)
$err('/',other)
}
var $op_func=function(self,other){if(isinstance(other,_b_.int))return float(self.value-other)
if(isinstance(other,float))return float(self.value-other.value)
if(isinstance(other,_b_.bool)){var bool_value=0;
if(other.valueOf())bool_value=1
return float(self.value-bool_value)
}
if(isinstance(other,_b_.complex)){return _b_.complex(self.value - other.real,-other.imag)
}
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
$err('-',other)
}
$op_func +='' 
var $ops={'+':'add','-':'sub'}
for(var $op in $ops){var $opf=$op_func.replace(/-/gm,$op)
$opf=$opf.replace(/__rsub__/gm,'__r'+$ops[$op]+'__')
eval('$FloatDict.__'+$ops[$op]+'__ = '+$opf)
}
var $comp_func=function(self,other){if(isinstance(other,_b_.int))return self.value > other.valueOf()
if(isinstance(other,float))return self.value > other.value
throw _b_.TypeError(
"unorderable types: "+self.__class__.__name__+'() > '+$B.get_class(other).__name__+"()")
}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){eval("$FloatDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
$B.make_rmethods($FloatDict)
var $notimplemented=function(self,other){throw _b_.TypeError(
"unsupported operand types for OPERATOR: '"+self.__class__.__name__+
"' and '"+$B.get_class(other).__name__+"'")
}
$notimplemented +='' 
for(var $op in $B.$operators){
switch($op){case '+=':
case '-=':
case '*=':
case '/=':
case '%=':
break
default:
var $opfunc='__'+$B.$operators[$op]+'__'
if($FloatDict[$opfunc]===undefined){eval('$FloatDict.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
}}
}
function $FloatClass(value){this.value=value
this.__class__=$FloatDict
this.toString=function(){return this.value}
this.valueOf=function(){return this.value}}
var float=function(value){switch(value){
case undefined:
return new $FloatClass(0.0)
case Number.MAX_VALUE:
return new $FloatClass(Infinity)
case -Number.MAX_VALUE:
return new $FloatClass(-Infinity)
}
if(typeof value=="number"){
return new $FloatClass(eval(value))
}
if(isinstance(value,float))return value
if(isinstance(value,_b_.bytes)){return new $FloatClass(parseFloat(getattr(value,'decode')('latin-1')))
}
if(typeof value=='string'){value=value.trim()
switch(value.toLowerCase()){case '+inf':
case 'inf':
case '+infinity':
case 'infinity':
return new $FloatClass(Infinity)
case '-inf':
case '-infinity':
return new $FloatClass(-Infinity)
case '+nan':
case 'nan':
return new $FloatClass(Number.NaN)
case '-nan':
return new $FloatClass(-Number.NaN)
case '':
throw _b_.ValueError('count not convert string to float')
default:
if(isFinite(value))return new $FloatClass(eval(value))
}}
throw _b_.ValueError("Could not convert to float(): '"+_b_.str(value)+"'")
}
float.__class__=$B.$factory
float.$dict=$FloatDict
$FloatDict.$factory=float
$FloatDict.__new__=$B.$__new__(float)
$B.$FloatClass=$FloatClass
_b_.float=float
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
function $err(op,other){var msg="unsupported operand type(s) for "+op
msg +=": 'int' and '"+$B.get_class(other).__name__+"'"
throw _b_.TypeError(msg)
}
var $IntDict={__class__:$B.$type,__name__:'int',toString:function(){return '$IntDict'},$native:true
}
$IntDict.from_bytes=function(x,byteorder){var len=x.source.length
if(byteorder=='little'){var num=x.source[len - 1]
if(num >=128)num=num - 256
for(var i=(len - 2);i >=0;i--){num=256 * num + x.source[i]
}
return num
}
if(byteorder==='big'){var num=x.source[0]
if(num >=128)num=num - 256
for(var i=1;i < len;i++){num=256 * num + x.source[i]
}
if(num < 0)return -num 
return num
}
throw _b_.ValueError("byteorder must be either 'little' or 'big'")
}
$IntDict.to_bytes=function(length,byteorder,star){
throw _b_.NotImplementedError("int.to_bytes is not implemented yet")
}
$IntDict.__bool__=function(self){return new Boolean(self.valueOf())}
$IntDict.__class__=$B.$type
$IntDict.__eq__=function(self,other){
if(other===undefined)return self===int
if(isinstance(other,int))return self.valueOf()==other.valueOf()
if(isinstance(other,_b_.float))return self.valueOf()==other.value
if(isinstance(other,_b_.complex)){if(other.imag !=0)return False
return self.valueOf()==other.real
}
return self.valueOf()===other
}
$IntDict.__format__=function(self,format_spec){if(format_spec=='')format_spec='d'
return _b_.str.$dict.__mod__('%'+format_spec,self)
}
$IntDict.__floordiv__=function(self,other){if(isinstance(other,int)){if(other==0)throw ZeroDivisionError('division by zero')
return Math.floor(self/other)
}
if(isinstance(other,_b_.float)){if(!other.value)throw ZeroDivisionError('division by zero')
return _b_.float(Math.floor(self/other.value))
}
if(hasattr(other,'__rfloordiv__')){return getattr(other,'__rfloordiv__')(self)
}
$err("//",other)
}
$IntDict.__getitem__=function(){throw _b_.TypeError("'int' object is not subscriptable")
}
$IntDict.__hash__=function(self){return self.valueOf()}
$IntDict.__index__=function(self){return self}
$IntDict.__init__=function(self,value){if(value===undefined){value=0}
self.toString=function(){return value}
}
$IntDict.__int__=function(self){return self}
$IntDict.__invert__=function(self){return ~self}
$IntDict.__mod__=function(self,other){
if(isinstance(other,_b_.tuple)&& other.length==1)other=other[0]
if(isinstance(other,int))return(self%other+other)%other
if(isinstance(other,_b_.float))return((self%other)+other)%other
if(isinstance(other,bool)){var bool_value=0;
if(other.valueOf())bool_value=1
return(self%bool_value+bool_value)%bool_value
}
if(hasattr(other,'__rmod__'))return getattr(other,'__rmod__')(self)
$err('%',other)
}
$IntDict.__mro__=[$IntDict,$ObjectDict]
$IntDict.__mul__=function(self,other){var val=self.valueOf()
if(isinstance(other,int))return self*other
if(isinstance(other,_b_.float))return _b_.float(self*other.value)
if(isinstance(other,_b_.bool)){var bool_value=0
if(other.valueOf())bool_value=1
return self*bool_value
}
if(isinstance(other,_b_.complex)){return _b_.complex(self.valueOf()*other.real,self.valueOf()*other.imag)
}
if(typeof other==="string"){var res=''
for(var i=0;i<val;i++)res+=other
return res
}
if(isinstance(other,[_b_.list,_b_.tuple])){var res=[]
var $temp=other.slice(0,other.length)
for(var i=0;i<val;i++)res=res.concat($temp)
if(isinstance(other,_b_.tuple))res=_b_.tuple(res)
return res
}
if(hasattr(other,'__rmul__'))return getattr(other,'__rmul__')(self)
$err("*",other)
}
$IntDict.__name__='int'
$IntDict.__ne__=function(self,other){return !$IntDict.__eq__(self,other)}
$IntDict.__neg__=function(self){return -self}
$IntDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('int.__new__(): not enough arguments')}
return{__class__:cls.$dict}}
$IntDict.__pow__=function(self,other){if(isinstance(other,int)){if(other.valueOf()>=0)return int(Math.pow(self.valueOf(),other.valueOf()))
return Math.pow(self.valueOf(),other.valueOf())
}
if(isinstance(other,_b_.float)){return _b_.float(Math.pow(self.valueOf(),other.valueOf()))
}
if(hasattr(other,'__rpow__'))return getattr(other,'__rpow__')(self)
$err("**",other)
}
$IntDict.__repr__=function(self){if(self===int)return "<class 'int'>"
return self.toString()
}
$IntDict.__setattr__=function(self,attr,value){if(self.__class__===$IntDict){throw _b_.AttributeError("'int' object has no attribute "+attr+"'")
}
self[attr]=value
}
$IntDict.__str__=$IntDict.__repr__
$IntDict.__truediv__=function(self,other){if(isinstance(other,int)){if(other==0)throw ZeroDivisionError('division by zero')
return _b_.float(self/other)
}
if(isinstance(other,_b_.float)){if(!other.value)throw ZeroDivisionError('division by zero')
return _b_.float(self/other.value)
}
if(isinstance(other,_b_.complex)){var cmod=other.real*other.real+other.imag*other.imag
if(cmod==0)throw ZeroDivisionError('division by zero')
return _b_.complex(self*other.real/cmod,-self*other.imag/cmod)
}
if(hasattr(other,'__rtruediv__'))return getattr(other,'__rtruediv__')(self)
$err("/",other)
}
$IntDict.bit_length=function(self){s=bin(self)
s=getattr(s,'lstrip')('-0b')
return s.length 
}
var $op_func=function(self,other){if(isinstance(other,int))return self-other
if(isinstance(other,_b_.bool))return self-other
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
$err("-",other)
}
$op_func +='' 
var $ops={'&':'and','|':'or','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){var opf=$op_func.replace(/-/gm,$op)
opf=opf.replace(new RegExp('sub','gm'),$ops[$op])
eval('$IntDict.__'+$ops[$op]+'__ = '+opf)
}
var $op_func=function(self,other){if(isinstance(other,int)){var res=self.valueOf()-other.valueOf()
if(isinstance(res,int))return res
return _b_.float(res)
}
if(isinstance(other,_b_.float)){return _b_.float(self.valueOf()-other.value)
}
if(isinstance(other,_b_.complex)){return _b_.complex(self-other.real,-other.imag)
}
if(isinstance(other,_b_.bool)){var bool_value=0
if(other.valueOf())bool_value=1
return self.valueOf()-bool_value
}
if(isinstance(other,_b_.complex)){return _b_.complex(self.valueOf()- other.real,other.imag)
}
if(hasattr(other,'__rsub__'))return getattr(other,'__rsub__')(self)
throw $err('-',other)
}
$op_func +='' 
var $ops={'+':'add','-':'sub'}
for(var $op in $ops){var opf=$op_func.replace(/-/gm,$op)
opf=opf.replace(new RegExp('sub','gm'),$ops[$op])
eval('$IntDict.__'+$ops[$op]+'__ = '+opf)
}
var $comp_func=function(self,other){if(isinstance(other,int))return self.valueOf()> other.valueOf()
if(isinstance(other,_b_.float))return self.valueOf()> other.value
if(isinstance(other,_b_.bool)){return self.valueOf()> _b_.bool.$dict.__hash__(other)
}
throw _b_.TypeError(
"unorderable types: int() > "+$B.get_class(other).__name__+"()")
}
$comp_func +='' 
for(var $op in $B.$comps){eval("$IntDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
$B.make_rmethods($IntDict)
var $valid_digits=function(base){var digits=''
if(base===0)return '0'
if(base < 10){for(var i=0;i < base;i++)digits+=String.fromCharCode(i+48)
return digits
}
var digits='0123456789'
for(var i=10;i < base;i++)digits+=String.fromCharCode(i+55)
return digits
}
var int=function(){var $ns=$B.$MakeArgs('int',arguments,[],[],'args','kw')
var value=$ns['args'][0]
var base=$ns['args'][1]
if(value===undefined)value=_b_.dict.$dict.get($ns['kw'],'x',0)
if(base===undefined)base=_b_.dict.$dict.get($ns['kw'],'base',10)
if(value===0)return Number(0)
if(value===true)return Number(1)
if(value===false)return Number(0)
if(!isinstance(base,_b_.int)){if(hasattr(base,'__int__')){base=Number(getattr(base,'__int__')())
}else if(hasattr(base,'__index__')){base=Number(getattr(base,'__index__')())}}
if(!(base >=2 && base <=36)){if(base !=0)throw _b_.ValueError("invalid base")
}
if(typeof value=="number")return parseInt(Number(value),base)
if(isinstance(value,_b_.str))value=value.valueOf()
if(typeof value=="string"){value=value.trim()
if(value.length==2 && base==0 &&(value=='0b' ||value=='0o' ||value=='0x')){throw _b_.ValueError('invalid value')
}
if(value.length >2){var _pre=value.substr(0,2).toUpperCase()
if(base==0){if(_pre=='0B')base=2
if(_pre=='0O')base=8
if(_pre=='0X')base=16
}
if(_pre=='0B' ||_pre=='0O' ||_pre=='0X'){value=value.substr(2)
}}
var _digits=$valid_digits(base)
var _re=new RegExp('^[+-]?['+_digits+']+$','i')
if(!_re.test(value)){throw _b_.ValueError(
"Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
}
if(base <=10 && !isFinite(value)){throw _b_.ValueError(
"Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
}
return Number(parseInt(value,base))
}
if(isinstance(value,_b_.float))return Number(parseInt(value.value,base))
if(isinstance(value,[_b_.bytes,_b_.bytearray]))return Number(parseInt(getattr(value,'decode')('latin-1'),base))
if(hasattr(value,'__int__'))return Number(getattr(value,'__int__')())
if(hasattr(value,'__trunc__'))return Number(getattr(value,'__trunc__')())
throw _b_.ValueError(
"Invalid literal for int() with base "+base +": '"+_b_.str(value)+"'")
}
int.$dict=$IntDict
int.__class__=$B.$factory
$IntDict.$factory=int
_b_.int=int
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
function $UnsupportedOpType(op,class1,class2){throw _b_.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}
var $ComplexDict={__class__:$B.$type,__name__:'complex',toString:function(){return '$ComplexDict'},$native:true
}
$ComplexDict.__abs__=function(self,other){return complex(abs(self.real),abs(self.imag))}
$ComplexDict.__bool__=function(self){return new Boolean(self.real ||self.imag)}
$ComplexDict.__class__=$B.$type
$ComplexDict.__eq__=function(self,other){if(isinstance(other,complex))return self.real==other.real && self.imag==other.imag
if(isinstance(other,_b_.int)){if(self.imag !=0)return False
return self.real==other.valueOf()
}
if(isinstance(other,_b_.float)){if(self.imag !=0)return False
return self.real==other.value
}
$UnsupportedOpType("==","complex",$B.get_class(other))
}
$ComplexDict.__floordiv__=function(self,other){$UnsupportedOpType("//","complex",$B.get_class(other))
}
$ComplexDict.__hash__=function(self){return hash(self)}
$ComplexDict.__init__=function(self,real,imag){self.toString=function(){return '('+real+'+'+imag+'j)'}}
$ComplexDict.__invert__=function(self){return ~self}
$ComplexDict.__mod__=function(self,other){throw _b_.TypeError("TypeError: can't mod complex numbers.")
}
$ComplexDict.__mro__=[$ComplexDict,$ObjectDict]
$ComplexDict.__mul__=function(self,other){if(isinstance(other,complex))
return complex(self.real*other.real-self.imag*other.imag,self.imag*other.real + self.real*other.imag)
if(isinstance(other,_b_.int))
return complex(self.real*other.valueOf(),self.imag*other.valueOf())
if(isinstance(other,_b_.float))
return complex(self.real*other.value,self.imag*other.value)
if(isinstance(other,_b_.bool)){if(other.valueOf())return self
return complex(0)
}
$UnsupportedOpType("*",complex,other)
}
$ComplexDict.__name__='complex'
$ComplexDict.__ne__=function(self,other){return !$ComplexDict.__eq__(self,other)}
$ComplexDict.__neg__=function(self){return complex(-self.real,-self.imag)}
$ComplexDict.__new__=function(cls){if(cls===undefined)throw _b_.TypeError('complex.__new__(): not enough arguments')
return{__class__:cls.$dict}}
$ComplexDict.__pow__=function(self,other){$UnsupportedOpType("**",complex,$B.get_class(other))
}
$ComplexDict.__str__=$ComplexDict.__repr__=function(self){if(self.real==0)return self.imag+'j'
if(self.imag>=0)return '('+self.real+'+'+self.imag+'j)'
return '('+self.real+'-'+(-self.imag)+'j)'
}
$ComplexDict.__sqrt__=function(self){if(self.imag==0)return complex(Math.sqrt(self.real))
var r=self.real,i=self.imag
var _sqrt=Math.sqrt(r*r+i*i)
var _a=Math.sqrt((r + sqrt)/2)
var _b=Number.sign(i)* Math.sqrt((-r + sqrt)/2)
return complex(_a,_b)
}
$ComplexDict.__truediv__=function(self,other){if(isinstance(other,complex)){if(other.real==0 && other.imag==0){throw ZeroDivisionError('division by zero')
}
var _num=self.real*other.real + self.imag*other.imag
var _div=other.real*other.real + other.imag*other.imag
var _num2=self.imag*other.real - self.real*other.imag
return complex(_num/_div,_num2/_div)
}
if(isinstance(other,_b_.int)){if(!other.valueOf())throw ZeroDivisionError('division by zero')
return $ComplexDict.__truediv__(self,complex(other.valueOf()))
}
if(isinstance(other,_b_.float)){if(!other.value)throw ZeroDivisionError('division by zero')
return $ComplexDict.__truediv__(self,complex(other.value))
}
$UnsupportedOpType("//","complex",other.__class__)
}
var $op_func=function(self,other){throw _b_.TypeError("TypeError: unsupported operand type(s) for -: 'complex' and '" + 
$B.get_class(other).__name__+"'")
}
$op_func +='' 
var $ops={'&':'and','|':'ior','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}
$ComplexDict.__ior__=$ComplexDict.__or__
var $op_func=function(self,other){if(isinstance(other,complex))return complex(self.real-other.real,self.imag-other.imag)
if(isinstance(other,_b_.int))return complex(self.real-other.valueOf(),self.imag)
if(isinstance(other,_b_.float))return complex(self.real - other.value,self.imag)
if(isinstance(other,_b_.bool)){var bool_value=0
if(other.valueOf())bool_value=1
return complex(self.real - bool_value,self.imag)
}
throw _b_.TypeError("unsupported operand type(s) for -: "+self.__repr__()+
" and '"+$B.get_class(other).__name__+"'")
}
$op_func +='' 
var $ops={'+':'add','-':'sub'}
for(var $op in $ops){eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}
var $comp_func=function(self,other){throw _b_.TypeError("TypeError: unorderable types: complex() > " + 
$B.get_class(other).__name__ + "()")
}
$comp_func +='' 
for(var $op in $B.$comps){eval("$ComplexDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
$B.make_rmethods($ComplexDict)
var complex=function(real,imag){var res={__class__:$ComplexDict,real:real ||0,imag:imag ||0
}
res.__repr__=res.__str__=function(){if(real==0)return imag + 'j'
return '('+real+'+'+imag+'j)'
}
return res
}
complex.$dict=$ComplexDict
complex.__class__=$B.$factory
$ComplexDict.$factory=complex
_b_.complex=complex
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
function $DictClass($keys,$values){
this.iter=null
this.__class__=$DictDict
this.$keys=$keys 
this.$values=$values 
}
var $DictDict={__class__:$B.$type,__name__ : 'dict',$native:true
}
$DictDict.__bool__=function(self){return self.$keys.length>0}
$DictDict.__contains__=function(self,item){if(self.$jsobj)return self.$jsobj[item]!==undefined
return _b_.list.$dict.__contains__(self.$keys,item)
}
$DictDict.__delitem__=function(self,arg){
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){if(getattr(arg,'__eq__')(self.$keys[i])){self.$keys.splice(i,1)
self.$values.splice(i,1)
if(self.$jsobj)delete self.$jsobj[arg]
return
}}
throw KeyError(_b_.str(arg))
}
$DictDict.__eq__=function(self,other){if(other===undefined){
return self===dict
}
if(!isinstance(other,dict))return False
if(other.$keys.length!==self.$keys.length)return False
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){var key=self.$keys[i]
for(var j=0,_len_j=other.$keys.length;j < _len_j;j++){try{if(getattr(other.$keys[j],'__eq__')(key)){if(!getattr(other.$values[j],'__eq__')(self.$values[i])){return False
}}}catch(err){$B.$pop_exc()}}}
return True
}
$DictDict.__getitem__=function(self,arg){
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){if(getattr(arg,'__eq__')(self.$keys[i]))return self.$values[i]
}
throw KeyError(_b_.str(arg))
}
$DictDict.__hash__=function(self){throw _b_.TypeError("unhashable type: 'dict'");}
$DictDict.__init__=function(self){var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
self.$keys=[]
self.$values=[]
if(args.length==0)return
if(args.length===1){var obj=args[0]
if(isinstance(obj,dict)){self.$keys=obj.$keys
self.$values=obj.$values
return
}
if(obj.__class__===$B.JSObject.$dict){
var res=new $DictClass([],[])
for(var attr in obj.js){$DictDict.__setitem__(res,attr,obj.js[attr])
}
self.$keys=res.$keys
self.$values=res.$values
self.$jsobj=obj.js 
return
}}
var $ns=$B.$MakeArgs('dict',args,[],[],'args','kw')
var args=$ns['args']
var kw=$ns['kw']
if(args.length>0){if(isinstance(args[0],dict)){self.$keys=args[0].$keys
self.$values=args[0].$values
return
}
var iterable=iter(args[0])
while(1){try{var elt=next(iterable)
self.$keys.push(getattr(elt,'__getitem__')(0))
self.$values.push(getattr(elt,'__getitem__')(1))
}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();break}
throw err
}}
return
}
if(kw.$keys.length>0){
self.$keys=kw.$keys
self.$values=kw.$values
}}
var $dict_iterator=$B.$iterator_class('dict iterator')
$DictDict.__iter__=function(self){return $B.$iterator(self.$keys,$dict_iterator)
}
$DictDict.__len__=function(self){return self.$keys.length}
$DictDict.__mro__=[$DictDict,$ObjectDict]
$DictDict.__ne__=function(self,other){return !$DictDict.__eq__(self,other)}
$DictDict.__next__=function(self){if(self.iter==null){self.iter==0}
if(self.iter<self.$keys.length){self.iter++
return self.$keys[self.iter-1]
}else{
self.iter=null
throw _b_.StopIteration()
}}
$DictDict.__repr__=function(self){if(self===undefined)return "<class 'dict'>"
var res=[]
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){res.push(repr(self.$keys[i])+':'+repr(self.$values[i]))
}
return '{'+ res.join(',')+'}'
}
$DictDict.__setitem__=function(self,key,value){for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){try{if(getattr(key,'__eq__')(self.$keys[i])){
self.$values[i]=value
return
}}catch(err){
$B.$pop_exc()
}}
self.$keys.push(key)
self.$values.push(value)
if(self.$jsobj)self.$jsobj[key]=value
}
$DictDict.__str__=$DictDict.__repr__
$B.make_rmethods($DictDict)
$DictDict.clear=function(self){
self.$keys=[]
self.$values=[]
if(self.$jsobj)self.$jsobj={}}
$DictDict.copy=function(self){
var res=dict()
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){res.$keys.push(self.$keys[i])
res.$values.push(self.$values[i])
}
return res
}
$DictDict.get=function(self,key,_default){try{return $DictDict.__getitem__(self,key)}
catch(err){$B.$pop_exc()
if(_default!==undefined)return _default
return None
}}
var $dict_itemsDict=$B.$iterator_class('dict_itemiterator')
$DictDict.items=function(self){var items=[]
for(var i=0,_len_i=self.$keys.length;i < _len_i;i++){items.push(_b_.tuple([self.$keys[i],self.$values[i]]))
}
return $B.$iterator(items,$dict_itemsDict)
}
$DictDict.fromkeys=function(keys,value){
if(value===undefined)value=_b_.None
var res=dict()
var keys_iter=_b_.iter(keys)
while(1){try{var key=_b_.next(keys_iter)
$DictDict.__setitem__(res,key,value)
}catch(err){if($B.is_exc(err,[_b_.StopIteration])){$B.$pop_exc()
return res
}
throw err
}}}
var $dict_keysDict=$B.$iterator_class('dict_keys')
$DictDict.keys=function(self){return $B.$iterator(self.$keys,$dict_keysDict)
}
$DictDict.pop=function(self,key,_default){try{var res=$DictDict.__getitem__(self,key)
$DictDict.__delitem__(self,key)
return res
}catch(err){$B.$pop_exc()
if(err.__name__==='KeyError'){if(_default!==undefined)return _default
throw err
}
throw err
}}
$DictDict.popitem=function(self){if(self.$keys.length===0)throw KeyError("'popitem(): dictionary is empty'")
return _b_.tuple([self.$keys.pop(),self.$values.pop()])
}
$DictDict.setdefault=function(self,key,_default){try{return $DictDict.__getitem__(self,key)}
catch(err){if(_default===undefined)_default=None
$DictDict.__setitem__(self,key,_default)
return _default
}}
$DictDict.update=function(self){var params=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){params.push(arguments[i])}
var $ns=$B.$MakeArgs('$DictDict.update',params,[],[],'args','kw')
var args=$ns['args']
if(args.length>0 && isinstance(args[0],dict)){var other=args[0]
for(var i=0,_len_i=other.$keys.length;i < _len_i;i++){$DictDict.__setitem__(self,other.$keys[i],other.$values[i])
}}
var kw=$ns['kw']
var keys=kw.$keys
for(var i=0,_len_i=keys.length;i < _len_i;i++){$DictDict.__setitem__(self,keys[i],kw.$values(keys[i]))
}}
var $dict_valuesDict=$B.$iterator_class('dict_values')
$DictDict.values=function(self){return $B.$iterator(self.$values,$dict_valuesDict)
}
function dict(){var res={__class__:$DictDict}
var args=[res]
for(var i=0,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
$DictDict.__init__.apply(null,args)
return res
}
$B.$dict=dict 
dict.__class__=$B.$factory
dict.$dict=$DictDict
$DictDict.$factory=dict
$DictDict.__new__=$B.$__new__(dict)
_b_.dict=dict
$ObjDictDict={__class__:$B.$type,__name__:'obj_dict'}
$ObjDictDict.__mro__=[$ObjDictDict,$DictDict,$ObjectDict]
$ObjDictDict.__delitem__=function(self,key){$DictDict.__delitem__(self,key)
delete self.$obj[key]
}
$ObjDictDict.__setitem__=function(self,key,value){$DictDict.__setitem__(self,key,value)
self.$obj[key]=value
}
$ObjDictDict.clear=function(self){$DictDict.clear(self)
for(var key in self.$obj){delete self.$obj[key]}}
$ObjDictDict.pop=function(self,key,_default){$DictDict.pop(self,key,_default)
delete self.$obj[key]
return key
}
$ObjDictDict.popitem=function(self){var res=$DictDict.popitem(self)
var key=res[0]
delete self.$obj[key]
return res
}
$ObjDictDict.update=function(self,other){$DictDict.update(self,other)
for(var i=0;i<other.$keys.length;i++){self.$obj[other.$keys[i]]=other.$values[i]
}}
function obj_dict(obj){var res={__class__:$ObjDictDict,$obj:obj,$keys:[],$values:[]}
for(var attr in obj){if(attr.charAt(0)!='$'){res.$keys.push(attr)
res.$values.push(obj[attr])
}}
return res
}
obj_dict.$dict=$ObjDictDict
obj_dict.__class__=$B.$factory
$ObjDictDict.$factory=obj_dict
$B.obj_dict=obj_dict
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
function $list(){
var args=new Array()
for(var i=0,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
return new $ListDict(args)
}
var $ListDict={__class__:$B.$type,__name__:'list',$native:true}
$ListDict.__add__=function(self,other){var res=self.valueOf().concat(other.valueOf())
if(isinstance(self,tuple))res=tuple(res)
return res
}
$ListDict.__contains__=function(self,item){for(var i=0,_len_i=self.length;i < _len_i;i++){try{if(getattr(self[i],'__eq__')(item)){return true}}catch(err){$B.$pop_exc();void(0)}}
return false
}
$ListDict.__delitem__=function(self,arg){if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.length+pos
if(pos>=0 && pos<self.length){self.splice(pos,1)
return
}
throw _b_.IndexError('list index out of range')
}
if(isinstance(arg,_b_.slice)){var start=arg.start;if(start===None){start=0}
var stop=arg.stop;if(stop===None){stop=self.length}
var step=arg.step ||1
if(start<0)start=self.length+start
if(stop<0)stop=self.length+stop
var res=[],i=null
if(step>0){if(stop>start){for(var i=start;i<stop;i+=step){if(self[i]!==undefined){res.push(i)}}}}else{
if(stop<start){for(var i=start;i>stop;i+=step.value){if(self[i]!==undefined){res.push(i)}}
res.reverse()
}}
for(var i=res.length-1;i>=0;i--){self.splice(res[i],1)
}
return
}
throw _b_.TypeError('list indices must be integer, not '+_b_.str(arg.__class__))
}
$ListDict.__eq__=function(self,other){
if(other===undefined)return self===list
if($B.get_class(other)===$B.get_class(self)){if(other.length==self.length){for(var i=0,_len_i=self.length;i < _len_i;i++){if(!getattr(self[i],'__eq__')(other[i]))return False
}
return True
}}
return False
}
$ListDict.__getitem__=function(self,arg){if(isinstance(arg,_b_.int)){var items=self.valueOf()
var pos=arg
if(arg<0)pos=items.length+pos
if(pos>=0 && pos<items.length)return items[pos]
throw _b_.IndexError('list index out of range')
}
if(isinstance(arg,_b_.slice)){
var step=arg.step===None ? 1 : arg.step
if(step==0){throw Error('ValueError : slice step cannot be zero')
}
var length=self.length
var start,end
if(arg.start===None){start=step<0 ? length-1 : 0
}else{
start=arg.start
if(start < 0)start +=length
if(start < 0)start=step<0 ? -1 : 0
if(start >=length)start=step<0 ? length-1 : length
}
if(arg.stop===None){stop=step<0 ? -1 : length
}else{
stop=arg.stop
if(stop < 0)stop +=length
if(stop < 0)stop=step<0 ? -1 : 0
if(stop >=length)stop=step<0 ? length-1 : length
}
var res=[],i=null,items=self.valueOf()
if(step > 0){if(stop <=start)return res
for(var i=start;i<stop;i+=step){res.push(items[i])
}
return res
}else{
if(stop > start)return res
for(var i=start;i>stop;i+=step){res.push(items[i])
}
return res
}}
if(isinstance(arg,_b_.bool)){return $ListDict.__getitem__(self,_b_.int(arg))
}
throw _b_.TypeError('list indices must be integer, not '+arg.__class__.__name__)
}
$ListDict.__getitems__=function(self){return self}
$ListDict.__ge__=function(self,other){console.log('__ge__')
if(!isinstance(other,[list,_b_.tuple])){throw _b_.TypeError("unorderable types: list() >= "+
$B.get_class(other).__name__+'()')
}
var i=0
while(i<self.length){if(i>=other.length)return true
if(getattr(self[i],'__eq__')(other[i])){i++}
else return(getattr(self[i],"__ge__")(other[i]))
}
if(other.length==self.length)return true
return false
}
$ListDict.__gt__=function(self,other){if(!isinstance(other,[list,_b_.tuple])){throw _b_.TypeError("unorderable types: list() > "+
$B.get_class(other).__name__+'()')
}
var i=0
while(i<self.length){if(i>=other.length)return true
if(getattr(self[i],'__eq__')(other[i])){i++}
else return(getattr(self[i],'__gt__')(other[i]))
}
return false 
}
$ListDict.__hash__=function(){throw _b_.TypeError("unhashable type: 'list'")}
$ListDict.__init__=function(self,arg){var len_func=getattr(self,'__len__'),pop_func=getattr(self,'pop')
while(len_func())pop_func()
if(arg===undefined)return
var arg=iter(arg)
var next_func=getattr(arg,'__next__')
while(1){try{self.push(next_func())}
catch(err){if(err.__name__=='StopIteration'){$B.$pop_exc();break}
else{throw err}}}}
var $list_iterator=$B.$iterator_class('list_iterator')
$ListDict.__iter__=function(self){return $B.$iterator(self,$list_iterator)
}
$ListDict.__le__=function(self,other){return !$ListDict.__gt__(self,other)
}
$ListDict.__len__=function(self){return self.length}
$ListDict.__lt__=function(self,other){return !$ListDict.__ge__(self,other)
}
$ListDict.__mro__=[$ListDict,$ObjectDict]
$ListDict.__mul__=function(self,other){if(isinstance(other,_b_.int))return getattr(other,'__mul__')(self)
throw _b_.TypeError("can't multiply sequence by non-int of type '"+
$B.get_class(other).__name__+"'")
}
$ListDict.__ne__=function(self,other){return !$ListDict.__eq__(self,other)}
$ListDict.__new__=$B.$__new__(list)
$ListDict.__repr__=function(self){if(self===undefined)return "<class 'list'>"
var items=self.valueOf()
var res='['
if(self.__class__===$TupleDict){res='('}
for(var i=0,_len_i=self.length;i < _len_i;i++){var x=self[i]
try{res+=getattr(x,'__repr__')()}
catch(err){console.log('no __repr__');res +=x.toString()}
if(i<self.length-1){res +=', '}}
if(self.__class__===$TupleDict){if(self.length==1){res+=','}
return res+')'
}
return res+']'
}
$ListDict.__setitem__=function(self,arg,value){if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos=self.length+pos
if(pos>=0 && pos<self.length){self[pos]=value}
else{throw _b_.IndexError('list index out of range')}
return 
}
if(isinstance(arg,slice)){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.length : arg.stop
var step=arg.step===None ? 1 : arg.step
if(start<0)start=self.length+start
if(stop<0)stop=self.length+stop
self.splice(start,stop-start)
if(hasattr(value,'__iter__')){var $temp=list(value)
for(var i=$temp.length-1;i>=0;i--){self.splice(start,0,$temp[i])
}
return
}
throw _b_.TypeError("can only assign an iterable")
}
throw _b_.TypeError('list indices must be integer, not '+arg.__class__.__name__)
}
$ListDict.__str__=$ListDict.__repr__
$B.make_rmethods($ListDict)
$ListDict.append=function(self,other){self.push(other)}
$ListDict.clear=function(self){while(self.length)self.pop()}
$ListDict.copy=function(self){var res=[]
for(var i=0,_len_i=self.length;i < _len_i;i++)res.push(self[i])
return res
}
$ListDict.count=function(self,elt){var res=0
for(var i=0,_len_i=self.length;i < _len_i;i++){if(getattr(self[i],'__eq__')(elt)){res++}}
return res
}
$ListDict.extend=function(self,other){if(arguments.length!=2){throw _b_.TypeError(
"extend() takes exactly one argument ("+arguments.length+" given)")}
other=iter(other)
while(1){try{self.push(next(other))}
catch(err){if(err.__name__=='StopIteration'){$B.$pop_exc();break}
else{throw err}}}}
$ListDict.index=function(self,elt){for(var i=0,_len_i=self.length;i < _len_i;i++){if(getattr(self[i],'__eq__')(elt))return i
}
throw _b_.ValueError(_b_.str(elt)+" is not in list")
}
$ListDict.insert=function(self,i,item){self.splice(i,0,item)}
$ListDict.remove=function(self,elt){for(var i=0,_len_i=self.length;i < _len_i;i++){if(getattr(self[i],'__eq__')(elt)){self.splice(i,1)
return
}}
throw _b_.ValueError(_b_.str(elt)+" is not in list")
}
$ListDict.pop=function(self,pos){if(pos===undefined){
var res=self[self.length-1]
self.splice(self.length-1,1)
return res
}
if(arguments.length==2){if(isinstance(pos,_b_.int)){var res=self[pos]
self.splice(pos,1)
return res
}
throw _b_.TypeError(pos.__class__+" object cannot be interpreted as an integer")
}
throw _b_.TypeError("pop() takes at most 1 argument ("+(arguments.length-1)+' given)')
}
$ListDict.reverse=function(self){for(var i=0,_len_i=parseInt(self.length/2);i < _len_i;i++){var buf=self[i]
self[i]=self[self.length-i-1]
self[self.length-i-1]=buf
}}
function $partition(arg,array,begin,end,pivot)
{var piv=array[pivot]
array=swap(array,pivot,end-1)
var store=begin
if(arg===null){if(array.$cl!==false){
var le_func=array.$cl.__le__
for(var ix=begin;ix<end-1;++ix){if(le_func(array[ix],piv)){array=swap(array,store,ix)
++store
}}}else{for(var ix=begin;ix<end-1;++ix){if(getattr(array[ix],'__le__')(piv)){array=swap(array,store,ix)
++store
}}}}else{for(var ix=begin;ix<end-1;++ix){if(getattr(arg(array[ix]),'__le__')(arg(piv))){array=swap(array,store,ix)
++store
}}}
array=swap(array,end-1,store)
return store
}
function swap(_array,a,b){var tmp=_array[a]
_array[a]=_array[b]
_array[b]=tmp
return _array
}
function $qsort(arg,array,begin,end)
{if(end-1>begin){var pivot=begin+Math.floor(Math.random()*(end-begin))
pivot=$partition(arg,array,begin,end,pivot)
$qsort(arg,array,begin,pivot)
$qsort(arg,array,pivot+1,end)
}}
function $elts_class(self){
if(self.length==0){return null}
var cl=$B.get_class(self[0])
for(var i=1,_len_i=self.length;i < _len_i;i++){if($B.get_class(self[i])!==cl){return false}}
return cl
}
$ListDict.sort=function(self){var func=null
var reverse=false
for(var i=1,_len_i=arguments.length;i < _len_i;i++){var arg=arguments[i]
if(arg.$nat=='kw'){if(arg.name==='key'){func=getattr(arg.value,'__call__')}
else if(arg.name==='reverse'){reverse=arg.value}}}
if(self.length==0)return
self.$cl=$elts_class(self)
if(func===null && self.$cl===_b_.str.$dict){self.sort()}
else if(func===null && self.$cl===_b_.int.$dict){self.sort(function(a,b){return a-b})
}
else{$qsort(func,self,0,self.length)}
if(reverse)$ListDict.reverse(self)
if(!self.__brython__)return self
}
$ListDict.toString=function(){return '$ListDict'}
$ListDict.__dict__=dict()
for(var $attr in list){$ListDict.__dict__.$keys.push($attr)
$ListDict.__dict__.$values.push(list[$attr])
}
function list(){if(arguments.length===0)return[]
if(arguments.length>1){throw _b_.TypeError("list() takes at most 1 argument ("+arguments.length+" given)")
}
var res=[]
var arg=iter(arguments[0])
var next_func=getattr(arg,'__next__')
while(1){try{res.push(next_func())}
catch(err){if(err.__name__=='StopIteration'){$B.$pop_exc()
}else{throw err 
}
break
}}
res.__brython__=true 
return res
}
list.__class__=$B.$factory
list.$dict=$ListDict
$ListDict.$factory=list
list.$is_func=true
list.__module__='builtins'
list.__bases__=[]
function $tuple(arg){return arg}
var $TupleDict={__class__:$B.$type,__name__:'tuple',$native:true}
$TupleDict.__iter__=function(self){return $B.$iterator(self,$tuple_iterator)
}
$TupleDict.toString=function(){return '$TupleDict'}
var $tuple_iterator=$B.$iterator_class('tuple_iterator')
function tuple(){var obj=list.apply(null,arguments)
obj.__class__=$TupleDict
obj.__hash__=function(){
var x=0x345678
for(var i=0,_len_i=args.length;i < _len_i;i++){var y=args[i].__hash__()
x=(1000003 * x)^ y & 0xFFFFFFFF
}
return x
}
return obj
}
tuple.__class__=$B.$factory
tuple.$dict=$TupleDict
tuple.$is_func=true
$TupleDict.$factory=tuple
$TupleDict.__new__=$B.$__new__(tuple)
tuple.__module__='builtins'
for(var attr in $ListDict){switch(attr){case '__delitem__':
case '__setitem__':
case 'append':
case 'extend':
case 'insert':
case 'remove':
case 'pop':
case 'reverse':
case 'sort':
break
default: 
if($TupleDict[attr]===undefined)$TupleDict[attr]=$ListDict[attr]
}
}
$TupleDict.__delitem__=function(){throw _b_.TypeError("'tuple' object doesn't support item deletion")
}
$TupleDict.__setitem__=function(){throw _b_.TypeError("'tuple' object does not support item assignment")
}
$TupleDict.__eq__=function(self,other){
if(other===undefined)return self===tuple
return $ListDict.__eq__(self,other)
}
$TupleDict.__mro__=[$TupleDict,$ObjectDict]
$TupleDict.__name__='tuple'
_b_.list=list
_b_.tuple=tuple
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=object.$dict
var $StringDict={__class__:$B.$type,__name__:'str',$native:true
}
$StringDict.__add__=function(self,other){if(!(typeof other==="string")){try{return getattr(other,'__radd__')(self)}
catch(err){throw _b_.TypeError(
"Can't convert "+$B.get_class(other).__name__+" to str implicitely")}}
return self+other
}
$StringDict.__contains__=function(self,item){if(!(typeof item==="string")){throw _b_.TypeError(
"'in <string>' requires string as left operand, not "+item.__class__)}
var nbcar=item.length
if(nbcar==0)return true 
if(self.length==0)return nbcar==0
for(var i=0,_len_i=self.length;i < _len_i;i++){if(self.substr(i,nbcar)==item)return true
}
return false
}
$StringDict.__delitem__=function(){throw _b_.TypeError("'str' object doesn't support item deletion")
}
$StringDict.__eq__=function(self,other){if(other===undefined){
return self===str
}
return other===self.valueOf()
}
$StringDict.__format__=function(self,arg){var _fs=$FormattableString(self.valueOf())
var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
return _fs.strformat(arg)
}
$StringDict.__getitem__=function(self,arg){if(isinstance(arg,_b_.int)){var pos=arg
if(arg<0)pos+=self.length
if(pos>=0 && pos<self.length)return self.charAt(pos)
throw _b_.IndexError('string index out of range')
}
if(isinstance(arg,slice)){var step=arg.step===None ? 1 : arg.step
if(step>0){var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? getattr(self,'__len__')(): arg.stop
}else{var start=arg.start===None ? getattr(self,'__len__')()-1 : arg.start
var stop=arg.stop===None ? 0 : arg.stop
}
if(start<0)start+=self.length
if(stop<0)stop+=self.length
var res='',i=null
if(step>0){if(stop<=start)return ''
for(var i=start;i<stop;i+=step)res +=self.charAt(i)
}else{
if(stop>=start)return ''
for(var i=start;i>=stop;i+=step)res +=self.charAt(i)
}
return res
}
if(isinstance(arg,bool))return self.__getitem__(_b_.int(arg))
}
$StringDict.__getitems__=function(self){return self.split('')}
$StringDict.__hash__=function(self){
var hash=1
for(var i=0,_len_i=self.length;i < _len_i;i++){hash=(101*hash + self.charCodeAt(i))& 0xFFFFFFFF
}
return hash
}
$StringDict.__init__=function(self,arg){self.valueOf=function(){return arg}
self.toString=function(){return arg}}
var $str_iterator=$B.$iterator_class('str_iterator')
$StringDict.__iter__=function(self){var items=self.split('')
return $B.$iterator(items,$str_iterator)
}
$StringDict.__len__=function(self){return self.length}
var $legacy_format=$StringDict.__mod__=function(self,args){
var ph=[]
function format(s){if(s===undefined)console.log('format:',s)
var conv_flags='([#\\+\\- 0]*)'
var re=new RegExp('\\%(\\(.+?\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*(.){1}')
var res=re.exec(s)
this.is_format=true
if(!res){this.is_format=false;return}
this.src=res[0]
if(res[1]){this.mapping_key=str(res[1].substr(1,res[1].length-2))}
else{this.mapping_key=null}
this.flag=res[2]
this.min_width=res[3]
this.precision=res[4]
this.length_modifier=res[5]
this.type=res[6]
this._number_check=function(s){if(!isinstance(s,[_b_.int,_b_.float])){if(s.__class__ !==undefined){throw _b_.TypeError("%"+this.type+" format: a number is required, not " + str(s.__class__))
}else if(typeof(s)==='string'){throw _b_.TypeError("%"+this.type+" format: a number is required, not str")
}else{
throw _b_.TypeError("%"+this.type+" format: a number is required, not 'unknown type'")
}}}
this.toString=function(){var res='type '+this.type+' key '+this.mapping_key+' min width '+this.min_width
return res + ' precision '+this.precision
}
this.format=function(src){if(this.mapping_key!==null){if(!isinstance(src,_b_.dict)){throw _b_.TypeError("format requires a mapping")}
src=getattr(src,'__getitem__')(this.mapping_key)
}
if(this.flag.indexOf("#")> -1){var flag_hash=true}
if(this.flag.indexOf("+")> -1){var flag_plus=true}
if(this.flag.indexOf("-")> -1){var flag_minus=true}
if(this.flag.indexOf("0")> -1){var flag_zero=true}
if(this.flag.indexOf(" ")> -1){var flag_space=true}
switch(this.type){case 's':
var res=str(src)
if(this.precision){return res.substr(0,parseInt(this.precision.substr(1)))}
return res
case 'r':
var res=repr(src)
if(this.precision){return res.substr(0,parseInt(this.precision.substr(1)))}
return res
case 'a':
var res=ascii(src)
if(this.precision){return res.substr(0,parseInt(this.precision.substr(1)))}
return res
case 'n': 
case 'g':
case 'G':
if(!isinstance(src,[_b_.int,_b_.float])){throw _b_.TypeError("a float is required")}
var prec=-4
if(this.precision){prec=parseInt(this.precision.substr(1))}
var res=parseFloat(src)
switch(res){case Infinity:
if(this.flag==='+' ||this.flag==='+#')return '+inf'
if(this.flag===' ' ||this.flag===' #')return ' inf'
return 'inf'
case -Infinity:
return '-inf'
}
if(isNaN(res)){if(this.flag==='+' ||this.flag==='+#')return '+nan'
if(this.flag===' ' ||this.flag===' #')return ' nan'
return 'nan'
}
res=res.toExponential()
var elts=res.split('e')
if((this.precision && eval(elts[1])>prec)||
(!this.precision && eval(elts[1])<-4)){this.type==='g' ? this.type='e' : this.type='E'
var prec=6
if(this.precision){prec=parseInt(this.precision.substr(1))-1}
var res=parseFloat(src).toExponential(prec)
var elts=res.split('e')
var res=elts[0]+this.type+elts[1].charAt(0)
if(elts[1].length===2){res +='0'}
return res+elts[1].substr(1)
}else{var prec=2
if(this.flag=='#'){if(this.precision===undefined){this.precision='.5' 
}else{
prec=parseInt(this.precision.substr(1))-1
var elts=str(src).split('.')
this.precision='.'+(prec-elts[0].length)
}}else{
}
this.type="f"
var _v=this.format(src)
if(this.flag==='#')return _v
return _v.replace(new RegExp("[\.0]+$"),"")
}
case 'e':
case 'E':
this._number_check(src)
var prec=6
if(this.precision){prec=parseInt(this.precision.substr(1))}
var res=parseFloat(src)
switch(res){case Infinity:
switch(this.flag){case ' ':
case ' #':
return ' inf'
case '+':
case '+#':
return '+inf'
default:
return 'inf'
}
case -Infinity:
return '-inf'
}
if(isNaN(res)){switch(this.flag){case ' ':
case ' #':
return ' nan'
case '+':
case '+#':
return '+nan'
default:
return 'nan'
}}
res=res.toExponential(prec)
var elts=res.split('e')
var res=elts[0]+this.type+elts[1].charAt(0)
if(elts[1].length===2){res +='0'}
return res+elts[1].substr(1)
case 'x':
case 'X':
this._number_check(src)
var num=src
res=src.toString(16)
var pad=' '
if(this.flag===' '){res=' '+res}
else if(this.flag==='+' && num>=0){pad='+';res='+'+res}
if(this.precision){var width=this.precision.substr(1)
if(this.flag==='#'){pad="0"}
while(res.length<width){res=pad+res}}
if(this.flag==='#'){if(this.type==='x'){res='0x'+res}
else{res='0X'+res}}
return res
case 'i':
case 'u':
case 'd':
this._number_check(src)
var num=parseInt(src)
num=num.toPrecision()
res=num+''
var len_num=res.length
if(this.precision){var prec=parseInt(this.precision.substr(1))
}else{var prec=0
}
if(this.min_width){var min_width=parseInt(this.min_width)
}else{var min_width=0
}
var width=Math.max(len_num,prec,min_width)
var pad=' '
if(len_num===width){if(flag_plus && num>=0){res='+'+res}}else{if(flag_minus){if(!flag_plus && !flag_space){res=res+pad.repeat(width-len_num)
}
if(flag_plus){res='+'+res+pad.repeat(width-len_num-1)
}
if(!flag_plus && flag_space){res=pad+res+pad.repeat(width-len_num-1)
}}else if(flag_plus && !flag_zero){res=pad.repeat(width-len_num-1)+'+'+res
}else if(flag_plus && flag_zero){if(num.substr(0,1)==='-'){res='-'+'0'.repeat(width-len_num)+res.substr(1)
}else{res='+'+'0'.repeat(width-len_num-1)+res
}}else if(!flag_plus && !flag_space && flag_zero){res='0'.repeat(width-len_num)+res
}else if(!flag_plus && !flag_zero && !flag_space && !flag_minus){if(prec>0 && prec > len_num){res=pad.repeat(width-(prec-len_num)-1)+'0'.repeat(prec-len_num)+res
}else{res=pad.repeat(width-len_num)+res
}}else if(flag_space && flag_zero){res=pad+'0'.repeat(width-len_num-1)+res
}}
return res
case 'f':
case 'F':
this._number_check(src)
var num=parseFloat(src)
if(num==Infinity){res='inf'}
else if(num==-Infinity){res='-inf'}
else if(isNaN(num)){res='nan'}
else{res=num}
if(this.precision===undefined)this.precision=".6" 
if(this.precision && typeof res==='number'){res=res.toFixed(parseInt(this.precision.substr(1)))
}
switch(this.flag){case ' ':
case ' #':
if(num>=0 ||res=='nan' ||res=='inf')res=' '+res
break
case '+':
case '+#':
if(num>=0 ||res=='nan' ||res=='inf')res='+'+res
break
}
if(this.min_width){var pad=' '
if(this.flag==='0'){pad="0"}
while(res.length<parseInt(this.min_width)){res=pad+res}}
return res
case 'c':
if(isinstance(src,str)&& str.length==1)return src
if(isinstance(src,_b_.int)&& src>0 && src<256)return String.fromCharCode(src)
_b_.TypeError('%c requires _b_.int or char')
case 'o':
var res=src.toString(8)
if(this.flag==='#')return '0o' + res
return res
case 'b':
var res=src.toString(2)
if(this.flag==='#')return '0b' + res
return res
default:
var _msg="unsupported format character '" + this.type
_msg+="' (0x" + this.type.charCodeAt(0).toString(16)+ ") at index "
_msg+=(self.valueOf().indexOf('%' + this.type)+1)
console.log(_msg)
throw _b_.ValueError(_msg)
}
}}
var elts=[]
var pos=0,start=0,nb_repl=0,is_mapping=null
var val=self.valueOf()
while(pos<val.length){if(val===undefined)console.log(val)
if(val.charAt(pos)=='%'){var f=new format(val.substr(pos))
if(f.is_format){if(f.type!=="%"){elts.push(val.substring(start,pos))
elts.push(f)
start=pos+f.src.length
pos=start
nb_repl++
if(is_mapping===null){is_mapping=f.mapping_key!==null}
else if(is_mapping!==(f.mapping_key!==null)){
console.log(f+' not mapping')
throw _b_.TypeError('format required a mapping')
}}else{
pos++;pos++
}}else{pos++}}else{pos++}}
if(elts.length==0){throw _b_.TypeError('not all arguments converted during string formatting')
}
elts.push(val.substr(start))
if(!isinstance(args,_b_.tuple)){if(args.__class__==_b_.dict.$dict && is_mapping){
for(var i=1,_len_i=elts.length;i < _len_i;i+=2){elts[i]=elts[i].format(args)
}}
else if(nb_repl>1){throw _b_.TypeError('not enough arguments for format string')}
else{elts[1]=elts[1].format(args)}}else{if(nb_repl==args.length){for(var i=0,_len_i=args.length;i < _len_i;i++){var fmt=elts[1+2*i]
elts[1+2*i]=fmt.format(args[i])
}}else if(nb_repl<args.length){throw _b_.TypeError(
"not all arguments converted during string formatting")
}else{throw _b_.TypeError('not enough arguments for format string')}}
var res=''
for(var i=0,_len_i=elts.length;i < _len_i;i++){res+=elts[i]}
return res.replace(/%%/g,'%')
}
$StringDict.__mro__=[$StringDict,$ObjectDict]
$StringDict.__mul__=function(self,other){if(!isinstance(other,_b_.int)){throw _b_.TypeError(
"Can't multiply sequence by non-int of type '"+
$B.get_class(other).__name__+"'")}
$res=''
for(var i=0;i<other;i++){$res+=self.valueOf()}
return $res
}
$StringDict.__ne__=function(self,other){return other!==self.valueOf()}
$StringDict.__repr__=function(self){if(self===undefined){return "<class 'str'>"}
var qesc=new RegExp("'","g")
var res=self.replace(/\n/g,'\\\\n')
res="'"+res.replace(qesc,"\\'")+"'"
return res
}
$StringDict.__setattr__=function(self,attr,value){setattr(self,attr,value)}
$StringDict.__setitem__=function(self,attr,value){throw _b_.TypeError("'str' object does not support item assignment")
}
$StringDict.__str__=function(self){if(self===undefined)return "<class 'str'>"
return self.toString()
}
$StringDict.toString=function(){return 'string!'}
var $comp_func=function(self,other){if(typeof other !=="string"){throw _b_.TypeError(
"unorderable types: 'str' > "+$B.get_class(other).__name__+"()")}
return self > other
}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){eval("$StringDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
$B.make_rmethods($StringDict)
var $notimplemented=function(self,other){throw NotImplementedError("OPERATOR not implemented for class str")
}
$StringDict.capitalize=function(self){if(self.length==0)return ''
return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()
}
$StringDict.casefold=function(self){throw _b_.NotImplementedError("function casefold not implemented yet")
}
$StringDict.center=function(self,width,fillchar){if(fillchar===undefined){fillchar=' '}else{fillchar=fillchar}
if(width<=self.length)return self
var pad=parseInt((width-self.length)/2)
var res=Array(pad+1).join(fillchar)
res +=self + res
if(res.length<width){res +=fillchar}
return res
}
$StringDict.count=function(self,elt){if(!(typeof elt==="string")){throw _b_.TypeError(
"Can't convert '"+elt.__class__.__name__+"' object to str implicitly")}
var n=0,pos=0
while(1){pos=self.indexOf(elt,pos)
if(pos>=0){n++;pos+=elt.length}else break
}
return n
}
$StringDict.encode=function(self,encoding){if(encoding===undefined)encoding='utf-8'
return bytes(self,encoding)
}
$StringDict.endswith=function(self){
var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
var start=null,end=null
var $ns=$B.$MakeArgs("$StringDict.endswith",args,['suffix'],['start','end'],null,null)
var suffixes=$ns['suffix']
if(!isinstance(suffixes,_b_.tuple)){suffixes=[suffixes]}
start=$ns['start']||start
end=$ns['end']||self.length-1
var s=self.substr(start,end+1)
for(var i=0,_len_i=suffixes.length;i < _len_i;i++){suffix=suffixes[i]
if(suffix.length<=s.length &&
s.substr(s.length-suffix.length)==suffix)return true
}
return false
}
$StringDict.expandtabs=function(self,tabsize){tabsize=tabsize ||8
var _str=''
for(var i=0;i < tabsize;i++)_str+=' ' 
return self.valueOf().replace(/\t/g,_str)
}
$StringDict.find=function(self){
var start=0,end=self.length
var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],['start','end'],null,null)
for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
if(!isinstance(sub,str)){throw _b_.TypeError(
"Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
if(!isinstance(start,_b_.int)||!isinstance(end,_b_.int)){throw _b_.TypeError(
"slice indices must be integers or None or have an __index__ method")}
var s=self.substring(start,end)
var esc_sub=''
for(var i=0,_len_i=sub.length;i < _len_i;i++){switch(sub.charAt(i)){case '[':
case '.':
case '*':
case '+':
case '?':
case '|':
case '(':
case ')':
case '$':
case '^':
esc_sub +='\\'
}
esc_sub +=sub.charAt(i)
}
var res=s.search(esc_sub)
if(res==-1)return -1
return start+res
}
var $FormattableString=function(format_string){
this.format_string=format_string
this._prepare=function(){
var match=arguments[0]
var p1='' + arguments[2]
if(match=='%')return '%%'
if(match.substring(0,1)==match.substring(match.length-1)){
return match.substring(0,Math.floor(match.length/2))
}
if(p1.charAt(0)=='{' && p1.charAt(match.length-1)=='}'){p1=match.substring(1,p1.length-1)
}
var _repl
if(match.length >=2){_repl=''
}else{
_repl=match.substring(1)
}
var _i=p1.indexOf(':')
var _out
if(_i > -1){_out=[p1.slice(0,_i),p1.slice(_i+1)]
}else{_out=[p1]}
var _field=_out[0]||''
var _format_spec=_out[1]||''
_out=_field.split('!')
var _literal=_out[0]||''
var _sep=_field.indexOf('!')> -1?'!': undefined 
var _conv=_out[1]
if(_sep && _conv===undefined){throw _b_.ValueError("end of format while looking for conversion specifier")
}
if(_conv !==undefined && _conv.length > 1){throw _b_.ValueError("expected ':' after format specifier")
}
if(_conv !==undefined && 'rsa'.indexOf(_conv)==-1){throw _b_.ValueError("Unknown conversion specifier " + _conv)
}
_name_parts=this.field_part.apply(null,[_literal])
var _start=_literal.charAt(0)
var _name=''
if(_start=='' ||_start=='.' ||_start=='['){
if(this._index===undefined){throw _b_.ValueError("cannot switch from manual field specification to automatic field numbering")
}
_name=self._index.toString()
this._index+=1
if(! _literal ){_name_parts.shift()
}}else{
_name=_name_parts.shift()[1]
if(this._index !==undefined && !isNaN(_name)){
if(this._index){throw _b_.ValueError("cannot switch from automatic field " +
"numbering to manual field specification")
this._index=undefined
}}}
var _empty_attribute=false
var _k
for(var i=0,_len_i=_name_parts.length;i < _len_i;i++){_k=_name_parts[i][0]
var _v=_name_parts[i][1]
var _tail=_name_parts[i][2]
if(_v===''){_empty_attribute=true}
if(_tail !==''){throw _b_.ValueError("Only '.' or '[' may follow ']' " +
"in format field specifier")
}}
if(_name_parts && _k=='[' && ! 
_literal.charAt(_literal.length)==']'){throw _b_.ValueError("Missing ']' in format string")
}
if(_empty_attribute){throw _b_.ValueError("Empty attribute in format string")
}
var _rv=''
if(_format_spec.indexOf('{')!=-1){_format_spec=_format_spec.replace(this.format_sub_re,this._prepare)
_rv=[_name_parts,_conv,_format_spec]
if(this._nested[_name]===undefined){this._nested[_name]=[]
this._nested_array.push(_name)
}
this._nested[_name].push(_rv)
}else{
_rv=[_name_parts,_conv,_format_spec]
if(this._kwords[_name]===undefined){this._kwords[_name]=[]
this._kwords_array.push(_name)
}
this._kwords[_name].push(_rv)
}
return '%(' + id(_rv)+ ')s'
}
this.format=function(){
var $ns=$B.$MakeArgs('format',arguments,[],[],'args','kwargs')
var args=$ns['args']
var kwargs=$ns['kwargs']
if(args.length>0){for(var i=0,_len_i=args.length;i < _len_i;i++){
getattr(kwargs,'__setitem__')(str(i),args[i])
}}
var _want_bytes=isinstance(this._string,str)
var _params=_b_.dict()
for(var i=0,_len_i=this._kwords_array.length;i < _len_i;i++){var _name=this._kwords_array[i]
var _items=this._kwords[_name]
var _var=getattr(kwargs,'__getitem__')(_name)
var _value
if(hasattr(_var,'value')){
_value=getattr(_var,'value')
}else{
_value=_var
}
for(var j=0,_len_j=_items.length;j < _len_j;j++){var _parts=_items[j][0]
var _conv=_items[j][1]
var _spec=_items[j][2]
var _f=this.format_field.apply(null,[_value,_parts,_conv,_spec,_want_bytes])
getattr(_params,'__setitem__')(id(_items[j]).toString(),_f)
}}
for(var i=0,_len_i=this._nested_array.length;i < _len_i;i++){var _name=this._nested_array[i]
var _items=this._nested[i]
var _var=getattr(kwargs,'__getitem__')(_name)
var _value
if(hasattr(_var,'value')){_value=getattr(getattr(kwargs,'__getitem__')(_name),'value')
}else{
_value=_var
}
for(var j=0,_len_j=_items.length;j < _len_j;j++){var _parts=_items[j][0]
var _conv=_items[j][1]
var _spec=_items[j][2]
_spec=$legacy_format(_spec,_params)
var _f=this.format_field.apply(null,[_value,_parts,_conv,_spec,_want_bytes])
getattr(_params,'__setitem__')(id(_items[j]).toString(),_f)
}}
return $legacy_format(this._string,_params)
}
this.format_field=function(value,parts,conv,spec,want_bytes){
if(want_bytes===undefined)want_bytes=false
for(var i=0,_len_i=parts.length;i < _len_i;i++){var _k=parts[i][0]
var _part=parts[i][1]
if(_k){if(!isNaN(_part)){value=value[parseInt(_part)]
}else{
value=getattr(value,_part)
}}else{
value=value[_part]
}}
if(conv){
value=$legacy_format((conv=='r')&& '%r' ||'%s',value)
}
value=this.strformat(value,spec)
if(want_bytes){
return value.toString()
}
return value
}
this.strformat=function(value,format_spec){
if(format_spec===undefined)format_spec=''
if(!isinstance(value,[str,_b_.int])&& hasattr(value,'__format__')){return getattr(value,'__format__')(format_spec)
}
var _m=this.format_spec_re.test(format_spec)
if(!_m)throw _b_.ValueError('Invalid conversion specification')
var _match=this.format_spec_re.exec(format_spec)
var _align=_match[1]
var _sign=_match[2]
var _prefix=_match[3]
var _width=_match[4]
var _comma=_match[5]
var _precision=_match[6]
var _conversion=_match[7]
var _is_float=isinstance(value,_b_.float)
var _is_integer=isinstance(value,_b_.int)
var _is_numeric=_is_float ||_is_integer
if(_prefix !='' && ! _is_numeric){if(_is_numeric){throw _b_.ValueError('Alternate form (#) not allowed in float format specifier')
}else{
throw _b_.ValueError('Alternate form (#) not allowed in string format specification')
}}
if(_is_numeric && _conversion=='n'){_conversion=_is_integer && 'd' ||'g'
}else{
if(_sign){if(! _is_numeric){throw _b_.ValueError('Sign not allowed in string format specification')
}
if(_conversion=='c'){throw("Sign not allowed with integer format specifier 'c'")
}}}
if(_comma !==''){value +=''
var x=value.split('.')
var x1=x[0]
var x2=x.length > 1 ? '.' + x[1]: ''
var rgx=/(\d+)(\d{3})/
while(rgx.test(x1)){x1=x1.replace(rgx,'$1' + ',' + '$2')
}
value=x1+x2 
}
var _rv
if(_conversion !='' &&((_is_numeric && _conversion=='s')||
(! _is_integer && 'coxX'.indexOf(_conversion)!=-1))){console.log(_conversion)
throw _b_.ValueError('Fix me')
}
if(_conversion=='c')_conversion='s'
_rv='%' + _prefix + _precision +(_conversion ||'s')
_rv=$legacy_format(_rv,value)
if(_sign !='-' && value >=0)_rv=_sign + _rv
var _zero=false
if(_width){
_zero=_width.charAt(0)=='0'
_width=parseInt(_width)
}else{
_width=0
}
if(_width <=_rv.length){if(! _is_float &&(_align=='=' ||(_zero && ! _align))){throw _b_.ValueError("'=' alignment not allowed in string format specifier")
}
return _rv
}
_fill=_align.substr(0,_align.length-1)
_align=_align.substr(_align.length-1)
if(! _fill){_fill=_zero && '0' ||' '}
if(_align=='^'){_rv=getattr(_rv,'center')(_width,_fill)
}else if(_align=='=' ||(_zero && ! _align)){if(! _is_numeric){throw _b_.ValueError("'=' alignment not allowed in string format specifier")
}
if(_value < 0 ||_sign !='-'){_rv=_rv.substring(0,1)+ getattr(_rv.substring(1),'rjust')(_width - 1,_fill)
}else{
_rv=getattr(_rv,'rjust')(_width,_fill)
}}else if((_align=='>' ||_align=='=')||(_is_numeric && ! _aligned)){_rv=getattr(_rv,'rjust')(_width,_fill)
}else if(_align=='<'){_rv=getattr(_rv,'ljust')(_width,_fill)
}else{
throw _b_.ValueError("'" + _align + "' alignment not valid")
}
return _rv
}
this.field_part=function(literal){
if(literal.length==0)return[['','','']]
var _matches=[]
var _pos=0
var _start='',_middle='',_end=''
var arg_name=''
if(literal===undefined)console.log(literal)
var _lit=literal.charAt(_pos)
while(_pos < literal.length &&
_lit !=='[' && _lit !=='.'){
arg_name +=_lit
_pos++
_lit=literal.charAt(_pos)
}
if(arg_name !='')_matches.push(['',arg_name,''])
var attribute_name=''
var element_index=''
while(_pos < literal.length){var car=literal.charAt(_pos)
if(car=='['){
_start=_middle=_end=''
_pos++
car=literal.charAt(_pos)
while(_pos < literal.length && car !==']'){_middle +=car
_pos++
car=literal.charAt(_pos)
}
_pos++
if(car==']'){while(_pos < literal.length){_end+=literal.charAt(_pos)
_pos++
}}
_matches.push([_start,_middle,_end])
}else if(car=='.'){
_middle=''
_pos++
car=literal.charAt(_pos)
while(_pos < literal.length &&
car !=='[' && 
car !=='.'){
_middle +=car
_pos++
car=literal.charAt(_pos)
}
_matches.push(['.',_middle,''])
}}
return _matches
}
this.format_str_re=new RegExp(
'(%)' +
'|((?!{)(?:{{)+' +
'|(?:}})+(?!})' +
'|{(?:[^{](?:[^{}]+|{[^{}]*})*)?})','g'
)
this.format_sub_re=new RegExp('({[^{}]*})')
this.format_spec_re=new RegExp(
'((?:[^{}]?[<>=^])?)' + 
'([\\-\\+ ]?)' + 
'(#?)' + '(\\d*)' + '(,?)' + 
'((?:\.\\d+)?)' + 
'(.?)$' 
)
this._index=0
this._kwords={}
this._kwords_array=[]
this._nested={}
this._nested_array=[]
this._string=format_string.replace(this.format_str_re,this._prepare)
return this
}
$StringDict.format=function(self){var _fs=$FormattableString(self.valueOf())
var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
return _fs.format.apply(null,args)
}
$StringDict.format_map=function(self){throw NotImplementedError("function format_map not implemented yet")
}
$StringDict.index=function(self){
var res=$StringDict.find.apply(self,arguments)
if(res===-1)throw _b_.ValueError("substring not found")
return res
}
$StringDict.isalnum=function(self){return /^[a-z0-9]+$/i.test(self)}
$StringDict.isalpha=function(self){return /^[a-z]+$/i.test(self)}
$StringDict.isdecimal=function(self){
return /^[0-9]+$/.test(self)
}
$StringDict.isdigit=function(self){return /^[0-9]+$/.test(self)}
$StringDict.isidentifier=function(self){
switch(self){case 'False':
case 'None':
case 'True':
case 'and':
case 'as':
case 'assert':
case 'break':
case 'class':
case 'continue':
case 'def':
case 'del':
case 'elif':
case 'else':
case 'except':
case 'finally':
case 'for':
case 'from':
case 'global':
case 'if':
case 'import':
case 'in':
case 'is':
case 'lambda':
case 'nonlocal':
case 'not':
case 'or':
case 'pass':
case 'raise':
case 'return':
case 'try':
case 'while':
case 'with':
case 'yield':
return true
}
return /^[a-z][0-9a-z_]+$/i.test(self)
}
$StringDict.islower=function(self){return /^[a-z]+$/.test(self)}
$StringDict.isnumeric=function(self){return /^[0-9]+$/.test(self)}
$StringDict.isprintable=function(self){return !/[^ -~]/.test(self)}
$StringDict.isspace=function(self){return /^\s+$/i.test(self)}
$StringDict.istitle=function(self){return /^([A-Z][a-z]+)(\s[A-Z][a-z]+)$/i.test(self)}
$StringDict.isupper=function(self){return /^[A-Z]+$/.test(self)}
$StringDict.join=function(self,obj){var iterable=iter(obj)
var res='',count=0
while(1){try{var obj2=next(iterable)
if(!isinstance(obj2,str)){throw _b_.TypeError(
"sequence item "+count+": expected str instance, "+$B.get_class(obj2).__name__+" found")}
res +=obj2+self
count++
}catch(err){if(err.__name__==='StopIteration'){$B.$pop_exc();break}
else{throw err}}}
if(count==0)return ''
return res.substr(0,res.length-self.length)
}
$StringDict.ljust=function(self,width,fillchar){if(width <=self.length)return self
if(fillchar===undefined)fillchar=' '
return self + Array(width - self.length + 1).join(fillchar)
}
$StringDict.lower=function(self){return self.toLowerCase()}
$StringDict.lstrip=function(self,x){var pattern=null
if(x==undefined){pattern="\\s*"}
else{pattern="["+x+"]*"}
var sp=new RegExp("^"+pattern)
return self.replace(sp,"")
}
$StringDict.maketrans=function(from,to){var _t=[]
for(var i=0;i < 256;i++)_t[i]=String.fromCharCode(i)
for(var i=0,_len_i=from.source.length;i < _len_i;i++){var _ndx=from.source[i].charCodeAt(0)
_t[_ndx]=to.source[i]
}
var _d=$B.$dict()
var _kpush=_d.$keys.push
var _vpush=_d.$values.push
for(var i=0;i < 256;i++){_kpush(i)
_vpush(_t[i])
}
return _d
}
$StringDict.partition=function(self,sep){if(sep===undefined){throw Error("sep argument is required")
return
}
var i=self.indexOf(sep)
if(i==-1)return _b_.tuple([self,'',''])
return _b_.tuple([self.substring(0,i),sep,self.substring(i+sep.length)])
}
function $re_escape(str)
{var specials="[.*+?|()$^"
for(var i=0,_len_i=specials.length;i < _len_i;i++){var re=new RegExp('\\'+specials.charAt(i),'g')
str=str.replace(re,"\\"+specials.charAt(i))
}
return str
}
$StringDict.replace=function(self,old,_new,count){
if(count===undefined){count=-1
}else{
if(!isinstance(count,[_b_.int,_b_.float])){throw _b_.TypeError("'" + str(count.__class__)+ "' object cannot be interpreted as an integer")
}else if(isinstance(count,_b_.float)){throw _b_.TypeError("integer argument expected, got float")
}}
var res=self.valueOf()
var pos=-1
if(count < 0)count=res.length
while(count > 0){pos=res.indexOf(old,pos)
if(pos < 0)
break
res=res.substr(0,pos)+ _new + res.substr(pos + old.length)
pos=pos + _new.length
count--
}
return res
}
$StringDict.rfind=function(self){
var start=0,end=self.length
var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],['start','end'],null,null)
for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
if(!isinstance(sub,str)){throw _b_.TypeError(
"Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
if(!isinstance(start,_b_.int)||!isinstance(end,_b_.int)){throw _b_.TypeError(
"slice indices must be integers or None or have an __index__ method")}
var s=self.substring(start,end)
var reversed='',rsub=''
for(var i=s.length-1;i>=0;i--){reversed +=s.charAt(i)}
for(var i=sub.length-1;i>=0;i--){rsub +=sub.charAt(i)}
var res=reversed.search($re_escape(rsub))
if(res==-1)return -1
return start+s.length-1-res-sub.length+1
}
$StringDict.rindex=function(){
var res=$StringDict.rfind.apply(this,arguments)
if(res==-1){throw _b_.ValueError("substring not found")}
return res
}
$StringDict.rjust=function(self){var fillchar=' '
var $ns=$B.$MakeArgs("$StringDict.rjust",arguments,['self','width'],['fillchar'],null,null)
for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
if(width <=self.length)return self
return Array(width - self.length + 1).join(fillchar)+ self
}
$StringDict.rpartition=function(self,sep){if(sep===undefined){throw Error("sep argument is required")
return
}
var pos=self.length-sep.length
while(1){if(self.substr(pos,sep.length)==sep){return _b_.tuple([self.substr(0,pos),sep,self.substr(pos+sep.length)])
}else{pos--
if(pos<0){return _b_.tuple(['','',self])}}}}
$StringDict.rsplit=function(self){var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
var $ns=$B.$MakeArgs("$StringDict.rsplit",args,[],[],'args','kw')
var sep=None,maxsplit=-1
if($ns['args'].length>=1){sep=$ns['args'][0]}
if($ns['args'].length==2){maxsplit=$ns['args'][1]}
maxsplit=_b_.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)
var array=$StringDict.split(self)
var array=$StringDict.split(self,sep)
if(array.length <=maxsplit ||maxsplit==-1)return array
var s=[]
s=array.splice(array.length - maxsplit,array.length)
s.splice(0,0,array.join(sep))
return s
}
$StringDict.rstrip=function(self,x){if(x==undefined){var pattern="\\s*"}
else{var pattern="["+x+"]*"}
sp=new RegExp(pattern+'$')
return str(self.replace(sp,""))
}
$StringDict.split=function(self){var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])}
var $ns=$B.$MakeArgs("$StringDict.split",args,[],[],'args','kw')
var sep=None,maxsplit=-1
if($ns['args'].length>=1){sep=$ns['args'][0]}
if($ns['args'].length==2){maxsplit=$ns['args'][1]}
maxsplit=_b_.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)
if(sep=='')throw _b_.ValueError('empty separator')
if(sep===None){var res=[]
var pos=0
while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
if(pos===self.length-1){return[]}
var name=''
while(1){if(self.charAt(pos).search(/\s/)===-1){if(name===''){name=self.charAt(pos)}
else{name+=self.charAt(pos)}}else{if(name!==''){res.push(name)
if(maxsplit!==-1&&res.length===maxsplit+1){res.pop()
res.push(name+self.substr(pos))
return res
}
name=''
}}
pos++
if(pos>self.length-1){if(name){res.push(name)}
break
}}
return res
}else{
var esc_sep=''
for(var i=0,_len_i=sep.length;i < _len_i;i++){switch(sep.charAt(i)){case '*':
case '.':
case '[':
case ']':
case '(':
case ')':
case '|':
case '$':
case '^':
esc_sep +='\\'
}
esc_sep +=sep.charAt(i)
}
var re=new RegExp(esc_sep)
if(maxsplit==-1){
return self.valueOf().split(re,maxsplit)
}
var l=self.valueOf().split(re,-1)
var a=l.slice(0,maxsplit)
var b=l.slice(maxsplit,l.length)
if(b.length > 0)a.push(b.join(sep))
return a
}}
$StringDict.splitlines=function(self){return $StringDict.split(self,'\n')}
$StringDict.startswith=function(self){
var $ns=$B.$MakeArgs("$StringDict.startswith",arguments,['self','prefix'],['start','end'],null,null)
var prefixes=$ns['prefix']
if(!isinstance(prefixes,_b_.tuple)){prefixes=[prefixes]}
var start=$ns['start']||0
var end=$ns['end']||self.length-1
var s=self.substr(start,end+1)
for(var i=0,_len_i=prefixes.length;i < _len_i;i++){if(s.indexOf(prefixes[i])==0)return true
}
return false
}
$StringDict.strip=function(self,x){if(x==undefined){x="\\s"}
return $StringDict.rstrip($StringDict.lstrip(self,x),x)
}
$StringDict.swapcase=function(self){
return self.replace(/([a-z])|([A-Z])/g,function($0,$1,$2)
{return($1)? $0.toUpperCase(): $0.toLowerCase()
})
}
$StringDict.title=function(self){
return self.replace(/\w\S*/g,function(txt){return txt.charAt(0).toUpperCase()+ txt.substr(1).toLowerCase();})
}
$StringDict.translate=function(self,table){var res=''
if(isinstance(table,_b_.dict)){for(var i=0,_len_i=self.length;i < _len_i;i++){var repl=_b_.dict.$dict.get(table,self.charCodeAt(i),-1)
if(repl==-1){res +=self.charAt(i)}
else if(repl!==None){res +=repl}}}
return res
}
$StringDict.upper=function(self){return self.toUpperCase()}
$StringDict.zfill=function(self,width){if(width===undefined ||width <=self.length ||!self.isnumeric()){return self
}
return Array(width - self.length +1).join('0')
}
function str(arg){if(arg===undefined)return ''
try{
var f=getattr(arg,'__str__')
return f()
}
catch(err){$B.$pop_exc()
try{
var f=getattr(arg,'__repr__')
return getattr(f,'__call__')()
}catch(err){$B.$pop_exc()
console.log(err+'\ndefault to toString '+arg);return arg.toString()
}}}
str.__class__=$B.$factory
str.$dict=$StringDict
$StringDict.$factory=str
$StringDict.__new__=function(cls){if(cls===undefined){throw _b_.TypeError('str.__new__(): not enough arguments')
}
return{__class__:cls.$dict}}
var $StringSubclassDict={__class__:$B.$type,__name__:'str'
}
for(var $attr in $StringDict){if(typeof $StringDict[$attr]=='function'){$StringSubclassDict[$attr]=(function(attr){return function(){var args=[]
if(arguments.length>0){var args=[arguments[0].valueOf()]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])
}}
return $StringDict[attr].apply(null,args)
}})($attr)
}}
$StringSubclassDict.__mro__=[$StringSubclassDict,$ObjectDict]
$B.$StringSubclassFactory={__class__:$B.$factory,$dict:$StringSubclassDict
}
_b_.str=str
})(__BRYTHON__)
;(function($B){var _=$B.builtins
var $SetDict={__class__:$B.$type,__name__:'set',$native:true
}
$SetDict.__add__=function(self,other){return set(self.$items.concat(other.$items))
}
$SetDict.__and__=function(self,other,accept_iter){$test(accept_iter,other)
var res=set()
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(other,'__contains__')(self.$items[i])){$SetDict.add(res,self.$items[i])
}}
return res
}
$SetDict.__contains__=function(self,item){if(self.$num &&(typeof item=='number')){return self.$items.indexOf(item)>-1}
if(self.$str &&(typeof item=='string')){return self.$items.indexOf(item)>-1}
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){try{if(_.getattr(self.$items[i],'__eq__')(item))return true
}catch(err){void(0)}}
return false
}
$SetDict.__eq__=function(self,other){
if(other===undefined)return self===set
if(_.isinstance(other,set)){if(other.$items.length==self.$items.length){for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if($SetDict.__contains__(self,other.$items[i])===false)return false
}
return true
}}
return false
}
$SetDict.__ge__=function(self,other){return !$SetDict.__lt__(self,other)}
$SetDict.__getitems__=function(self){return self.$items}
$SetDict.__gt__=function(self,other,accept_iter){$test(accept_iter,other)
return !$SetDict.__le__(self,other)
}
$SetDict.__hash__=function(self){throw _.TypeError("unhashable type: 'set'")
}
$SetDict.__init__=function(self){var args=[]
for(var i=1,_len_i=arguments.length;i < _len_i;i++){args.push(arguments[i])
}
self.$items=[]
if(args.length==0)return
if(args.length==1){
var arg=args[0]
if(_.isinstance(arg,set)){self.$items=arg.$items
return
}
try{var iterable=_.iter(arg)
var obj={$items:[],$str:true,$num:true}
while(1){try{$SetDict.add(obj,_.next(iterable))}
catch(err){if(err.__name__=='StopIteration'){$B.$pop_exc();break}
throw err
}}
self.$items=obj.$items
}catch(err){console.log(''+err)
throw _.TypeError("'"+arg.__class__.__name__+"' object is not iterable")
}}else{
throw _.TypeError("set expected at most 1 argument, got "+args.length)
}}
var $set_iterator=$B.$iterator_class('set iterator')
$SetDict.__iter__=function(self){return $B.$iterator(self.$items,$set_iterator)
}
$SetDict.__le__=function(self,other,accept_iter){$test(accept_iter,other)
var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i]))return false
}
return true
}
$SetDict.__len__=function(self){return self.$items.length}
$SetDict.__lt__=function(self,other){return($SetDict.__le__(self,other)&&
$SetDict.__len__(self)<_.getattr(other,'__len__')())
}
$SetDict.__mro__=[$SetDict,_.object.$dict]
$SetDict.__ne__=function(self,other){return !$SetDict.__eq__(self,other)}
$SetDict.__or__=function(self,other,accept_iter){$test(accept_iter,other)
var res=$SetDict.copy(self)
var func=_.getattr(_.iter(other),'__next__')
while(true){try{$SetDict.add(res,func())}
catch(err){if(_.isinstance(err,_.StopIteration)){$B.$pop_exc();break}
throw err
}}
return res
}
$SetDict.__str__=$SetDict.toString=$SetDict.__repr__=function(self){if(self===undefined)return "<class 'set'>"
var head='',tail=''
frozen=self.$real==='frozen'
if(self.$items.length===0){if(frozen)return 'frozenset()'
return 'set()'
}
if(self.__class__===$SetDict && frozen){head='frozenset('
tail=')'
}else if(self.__class__!==$SetDict){
head=self.__class__.__name__+'('
tail=')'
}
var res="{"
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){res +=_.repr(self.$items[i])
if(i<self.$items.length-1){res +=','}}
res +='}'
return head+res+tail
}
$SetDict.__sub__=function(self,other,accept_iter){
$test(accept_iter,other)
var res=set()
var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i])){res.$items.push(self.$items[i])
}}
return res
}
$SetDict.__xor__=function(self,other,accept_iter){
$test(accept_iter,other)
var res=set()
var cfunc=_.getattr(other,'__contains__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(!cfunc(self.$items[i])){$SetDict.add(res,self.$items[i])
}}
for(var i=0,_len_i=other.$items.length;i < _len_i;i++){if(!$SetDict.__contains__(self,other.$items[i])){$SetDict.add(res,other.$items[i])
}}
return res
}
function $test(accept_iter,other){if(accept_iter===undefined && !_.isinstance(other,[set,frozenset])){throw TypeError("unsupported operand type(s) for |: 'set' and '"+
$B.get_class(other).__name__+"'")
}}
$B.make_rmethods($SetDict)
$SetDict.add=function(self,item){if(self.$str && !(typeof item=='string')){self.$str=false}
if(self.$num && !(typeof item=='number')){self.$num=false}
if(self.$num||self.$str){if(self.$items.indexOf(item)==-1){self.$items.push(item)}
return
}
var cfunc=_.getattr(item,'__eq__')
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){try{if(cfunc(self.$items[i]))return}
catch(err){void(0)}
}
self.$items.push(item)
}
$SetDict.clear=function(self){self.$items=[]}
$SetDict.copy=function(self){var res=set()
for(var i=0,_len_i=self.$items.length;i < _len_i;i++)res.$items[i]=self.$items[i]
return res
}
$SetDict.discard=function(self,item){try{$SetDict.remove(self,item)}
catch(err){if(err.__name__!=='KeyError'){throw err}}}
$SetDict.isdisjoint=function(self,other){for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(other,'__contains__')(self.$items[i]))return false
}
return true
}
$SetDict.pop=function(self){if(self.$items.length===0)throw _.KeyError('pop from an empty set')
return self.$items.pop()
}
$SetDict.remove=function(self,item){for(var i=0,_len_i=self.$items.length;i < _len_i;i++){if(_.getattr(self.$items[i],'__eq__')(item)){self.$items.splice(i,1)
return _.None
}}
throw _.KeyError(item)
}
$SetDict.update=function(self,other){if(other===undefined ||other.$items===undefined)return
for(var i=0,_len_i=other.$items.length;i < _len_i;i++){$SetDict.add(self,other.$items[i])
}}
$SetDict.symmetric_difference=function(self,other){return $SetDict.__xor__(self,other,1)
}
$SetDict.difference=function(self,other){$SetDict.__sub__(self,other,1)
}
$SetDict.intersection=function(self,other){return $SetDict.__and__(self,other,1)
}
$SetDict.issubset=function(self,other){return $SetDict.__le__(self,other,1)
}
$SetDict.issuperset=function(self,other){return $SetDict.__ge__(self,other,1)
}
$SetDict.union=function(self,other){return $SetDict.__or__(self,other,1)
}
function set(){
var res={__class__:$SetDict,$str:true,$num:true}
var args=[res].concat(Array.prototype.slice.call(arguments))
$SetDict.__init__.apply(null,args)
return res
}
set.__class__=$B.$factory
set.$dict=$SetDict
$SetDict.$factory=set
$SetDict.__new__=$B.$__new__(set)
var $FrozensetDict={__class__:$B.$type,__name__:'frozenset'}
$FrozensetDict.__mro__=[$FrozensetDict,_.object.$dict]
$FrozensetDict.__str__=$FrozensetDict.toString=$FrozensetDict.__repr__=function(self){if(self===undefined)return "<class 'frozenset'>"
if(self.$items.length===0)return 'frozenset()'
var res="{"
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){res +=_.repr(self.$items[i])
if(i<self.$items.length-1){res +=','}}
res +='}'
return 'frozenset('+res+')'
}
for(var attr in $SetDict){switch(attr){case 'add':
case 'clear':
case 'discard':
case 'pop':
case 'remove':
case 'update':
break
default:
if($FrozensetDict[attr]==undefined)$FrozensetDict[attr]=$SetDict[attr]
}}
$FrozensetDict.__hash__=function(self){
if(self.__hashvalue__ !==undefined)return self.__hashvalue__
var _hash=1927868237
_hash *=self.$items.length 
for(var i=0,_len_i=self.$items.length;i < _len_i;i++){var _h=hash(self.$items[i])
_hash ^=((_h ^ 89869747)^(_h << 16))* 3644798167
}
_hash *=69069 + 907133923
if(_hash==-1)_hash=590923713
return self.__hashvalue__=_hash
}
function frozenset(){var res=set.apply(null,arguments)
res.__class__=$FrozensetDict
return res
}
frozenset.__class__=$B.$factory
frozenset.$dict=$FrozensetDict
$FrozensetDict.__new__=$B.$__new__(frozenset)
$FrozensetDict.$factory=frozenset
_.set=set
_.frozenset=frozenset
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
var $s=[]
for(var $b in _b_)$s.push('var ' + $b +'=_b_["'+$b+'"]')
eval($s.join(';'))
var $ObjectDict=_b_.object.$dict
var JSObject=$B.JSObject
$B.events=_b_.dict()
function $getMouseOffset(target,ev){ev=ev ||window.event
var docPos=$getPosition(target)
var mousePos=$mouseCoords(ev)
return{x:mousePos.x - docPos.x,y:mousePos.y - docPos.y}
}
function $getPosition(e){var left=0
var top=0
var width=e.width ||e.offsetWidth
var height=e.height ||e.offsetHeight
while(e.offsetParent){left +=e.offsetLeft
top +=e.offsetTop
e=e.offsetParent
}
left +=e.offsetLeft
top +=e.offsetTop
return{left:left,top:top,width:width,height:height}
}
function $mouseCoords(ev){var posx=0
var posy=0
if(!ev)var ev=window.event
if(ev.pageX ||ev.pageY){posx=ev.pageX
posy=ev.pageY
}else if(ev.clientX ||ev.clientY){posx=ev.clientX + document.body.scrollLeft
+ document.documentElement.scrollLeft
posy=ev.clientY + document.body.scrollTop
+ document.documentElement.scrollTop
}
var res=object()
res.x=_b_.int(posx)
res.y=_b_.int(posy)
res.__getattr__=function(attr){return this[attr]}
res.__class__="MouseCoords"
return res
}
var $DOMNodeAttrs=['nodeName','nodeValue','nodeType','parentNode','childNodes','firstChild','lastChild','previousSibling','nextSibling','attributes','ownerDocument']
$B.$isNode=function(obj){for(var i=0;i<$DOMNodeAttrs.length;i++){if(obj[$DOMNodeAttrs[i]]===undefined)return false
}
return true
}
$B.$isNodeList=function(nodes){
try{var result=Object.prototype.toString.call(nodes)
var re=new RegExp("^\\[object (HTMLCollection|NodeList|Object)\\]$")
return(typeof nodes==='object'
&& re.exec(result)!==null
&& nodes.hasOwnProperty('length')
&&(nodes.length==0 ||(typeof nodes[0]==="object" && nodes[0].nodeType > 0))
)
}catch(err){return false
}}
var $DOMEventAttrs_W3C=['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE','type','target','currentTarget','eventPhase','bubbles','cancelable','timeStamp','stopPropagation','preventDefault','initEvent']
var $DOMEventAttrs_IE=['altKey','altLeft','button','cancelBubble','clientX','clientY','contentOverflow','ctrlKey','ctrlLeft','data','dataFld','dataTransfer','fromElement','keyCode','nextPage','offsetX','offsetY','origin','propertyName','reason','recordset','repeat','screenX','screenY','shiftKey','shiftLeft','source','srcElement','srcFilter','srcUrn','toElement','type','url','wheelDelta','x','y']
$B.$isEvent=function(obj){flag=true
for(var i=0;i<$DOMEventAttrs_W3C.length;i++){if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}}
if(flag)return true
for(var i=0;i<$DOMEventAttrs_IE.length;i++){if(obj[$DOMEventAttrs_IE[i]]===undefined)return false
}
return true
}
var $NodeTypes={1:"ELEMENT",2:"ATTRIBUTE",3:"TEXT",4:"CDATA_SECTION",5:"ENTITY_REFERENCE",6:"ENTITY",7:"PROCESSING_INSTRUCTION",8:"COMMENT",9:"DOCUMENT",10:"DOCUMENT_TYPE",11:"DOCUMENT_FRAGMENT",12:"NOTATION"
}
var $DOMEventDict={__class__:$B.$type,__name__:'DOMEvent'}
$DOMEventDict.__mro__=[$DOMEventDict,$ObjectDict]
$DOMEventDict.__getattribute__=function(self,attr){if(attr=="x")return $mouseCoords(self).x
if(attr=="y")return $mouseCoords(self).y
if(attr=="data"){if(self.dataTransfer!==undefined)return $Clipboard(self.dataTransfer)
return self['data']
}
if(attr=="target"){if(self.target===undefined)return $DOMNode(self.srcElement)
return $DOMNode(self.target)
}
if(attr=="char")return String.fromCharCode(self.which)
var res=self[attr]
if(res!==undefined){if(typeof res=='function'){return function(){return res.apply(self,arguments)}}
return $B.$JS2Py(res)
}
throw _b_.AttributeError("object DOMEvent has no attribute '"+attr+"'")
}
var $DOMEvent=$B.DOMEvent=function(ev){ev.__class__=$DOMEventDict
if(ev.preventDefault===undefined){ev.preventDefault=function(){ev.returnValue=false}}
if(ev.stopPropagation===undefined){ev.stopPropagation=function(){ev.cancelBubble=true}}
ev.__repr__=function(){return '<DOMEvent object>'}
ev.__str__=function(){return '<DOMEvent object>'}
ev.toString=ev.__str__
return ev
}
$DOMEvent.__class__=$B.$factory
$DOMEvent.$dict=$DOMEventDict
$DOMEventDict.$factory=$DOMEvent
var $ClipboardDict={__class__:$B.$type,__name__:'Clipboard'}
$ClipboardDict.__getitem__=function(self,name){return self.data.getData(name)}
$ClipboardDict.__mro__=[$ClipboardDict,$ObjectDict]
$ClipboardDict.__setitem__=function(self,name,value){self.data.setData(name,value)}
function $Clipboard(data){
return{
data : data,__class__ : $ClipboardDict,}}
function $EventsList(elt,evt,arg){
this.elt=elt
this.evt=evt
if(isintance(arg,list)){this.callbacks=arg}
else{this.callbacks=[arg]}
this.remove=function(callback){var found=false
for(var i=0;i<this.callbacks.length;i++){if(this.callbacks[i]===callback){found=true
this.callback.splice(i,1)
this.elt.removeEventListener(this.evt,callback,false)
break
}}
if(!found){throw KeyError("not found")}}}
function $OpenFile(file,mode,encoding){this.reader=new FileReader()
if(mode==='r'){this.reader.readAsText(file,encoding)}
else if(mode==='rb'){this.reader.readAsBinaryString(file)}
this.file=file
this.__class__=dom.FileReader
this.__getattr__=function(attr){if(this['get_'+attr]!==undefined)return this['get_'+attr]
return this.reader[attr]
}
this.__setattr__=(function(obj){return function(attr,value){if(attr.substr(0,2)=='on'){
if(window.addEventListener){var callback=function(ev){return value($DOMEvent(ev))}
obj.addEventListener(attr.substr(2),callback)
}else if(window.attachEvent){var callback=function(ev){return value($DOMEvent(window.event))}
obj.attachEvent(attr,callback)
}}else if('set_'+attr in obj){return obj['set_'+attr](value)}
else if(attr in obj){obj[attr]=value}
else{setattr(obj,attr,value)}}})(this.reader)
}
var dom={File : function(){},FileReader : function(){}}
dom.File.__class__=$B.$type
dom.File.__str__=function(){return "<class 'File'>"}
dom.FileReader.__class__=$B.$type
dom.FileReader.__str__=function(){return "<class 'FileReader'>"}
function $Options(parent){return{
__class__:$OptionsDict,parent:parent
}}
var $OptionsDict={__class__:$B.$type,__name__:'Options'}
$OptionsDict.__delitem__=function(self,arg){self.parent.options.remove(arg.elt)
}
$OptionsDict.__getitem__=function(self,key){return $DOMNode(self.parent.options[key])
}
$OptionsDict.__len__=function(self){return self.parent.options.length}
$OptionsDict.__mro__=[$OptionsDict,$ObjectDict]
$OptionsDict.__setattr__=function(self,attr,value){self.parent.options[attr]=value
}
$OptionsDict.__setitem__=function(self,attr,value){self.parent.options[attr]=$B.$JS2Py(value)
}
$OptionsDict.__str__=function(self){return "<object Options wraps "+self.parent.options+">"
}
$OptionsDict.append=function(self,element){self.parent.options.add(element.elt)
}
$OptionsDict.insert=function(self,index,element){if(index===undefined){self.parent.options.add(element.elt)}
else{self.parent.options.add(element.elt,index)}}
$OptionsDict.item=function(self,index){return self.parent.options.item(index)
}
$OptionsDict.namedItem=function(self,name){return self.parent.options.namedItem(name)
}
$OptionsDict.remove=function(self,arg){self.parent.options.remove(arg.elt)}
var $StyleDict={__class__:$B.$type,__name__:'CSSProperty'}
$StyleDict.__mro__=[$StyleDict,$ObjectDict]
$StyleDict.__getattr__=function(self,attr){return $ObjectDict.__getattribute__(self.js,attr)
}
$StyleDict.__setattr__=function(self,attr,value){if(attr.toLowerCase()==='float'){self.js.cssFloat=value
self.js.styleFloat=value
}else{switch(attr){case 'top':
case 'left':
case 'height':
case 'width':
case 'borderWidth':
if(isinstance(value,_b_.int))value=value+'px'
}
self.js[attr]=value
}}
function $Style(style){
return{__class__:$StyleDict,js:style}}
$Style.__class__=$B.$factory
$Style.$dict=$StyleDict
$StyleDict.$factory=$Style
function DOMNode(){}
DOMNode.__class__=$B.$type
DOMNode.__mro__=[DOMNode,_b_.object.$dict]
DOMNode.__name__='DOMNode'
DOMNode.$dict=DOMNode 
DOMNode.$factory=DOMNode
function $DOMNode(elt){
var res={}
res.$dict={}
res.elt=elt 
if(elt['$brython_id']===undefined||elt.nodeType===9){
elt.$brython_id=Math.random().toString(36).substr(2,8)
res.__repr__=res.__str__=res.toString=function(){var res="<DOMNode object type '"
return res+$NodeTypes[elt.nodeType]+"' name '"+elt.nodeName+"'>"
}}
res.__class__=DOMNode
return res
}
DOMNode.__add__=function(self,other){
var res=$TagSum()
res.children=[self]
if(isinstance(other,$TagSum)){for(var $i=0;$i<other.children.length;$i++){res.children.push(other.children[$i])}}else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.list,_b_.dict,_b_.set,_b_.tuple])){res.children.push($DOMNode(document.createTextNode(_b_.str(other))))
}else{res.children.push(other)}
return res
}
DOMNode.__bool__=function(self){return true}
DOMNode.__class__=$B.$type
DOMNode.__contains__=function(self,key){try{self.__getitem__(key);return True}
catch(err){return False}}
DOMNode.__del__=function(self){
if(!self.elt.parentNode){throw _b_.ValueError("can't delete "+str(elt))
}
self.elt.parentNode.removeChild(self.elt)
}
DOMNode.__delitem__=function(self,key){if(self.elt.nodeType===9){
var res=self.elt.getElementById(key)
if(res){res.parentNode.removeChild(res)}
else{throw KeyError(key)}}else{
self.elt.removeChild(self.elt.childNodes[key])
}}
DOMNode.__eq__=function(self,other){return self.elt==other.elt
}
DOMNode.__getattribute__=function(self,attr){switch(attr){case 'class_name':
case 'children':
case 'html':
case 'id':
case 'left':
case 'parent':
case 'query':
case 'text':
case 'top':
case 'value':
case 'height':
case 'width':
return DOMNode[attr](self)
case 'clear':
case 'remove':
return function(){DOMNode[attr](self,arguments[0])}
case 'headers':
if(self.elt.nodeType==9){
var req=new XMLHttpRequest()
req.open('GET',document.location,false)
req.send(null)
var headers=req.getAllResponseHeaders()
headers=headers.split('\r\n')
var res=_b_.dict()
for(var i=0;i<headers.length;i++){var header=headers[i]
if(header.strip().length==0){continue}
var pos=header.search(':')
res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())
}
return res
}
break
case '$$location':
attr='location'
break
}
if(self.elt.getAttribute!==undefined){res=self.elt.getAttribute(attr)
if(res!==undefined&&res!==null&&self.elt[attr]===undefined){
return res
}}
if(self.elt[attr]!==undefined){res=self.elt[attr]
if(typeof res==="function"){var func=(function(f,elt){return function(){var args=[]
for(var i=0;i<arguments.length;i++){var arg=arguments[i]
if(isinstance(arg,JSObject)){args.push(arg.js)
}else if(isinstance(arg,DOMNode)){args.push(arg.elt)
}else if(arg===_b_.None){args.push(null)
}else{args.push(arg)
}}
var result=f.apply(elt,args)
return $B.$JS2Py(result)
}})(res,self.elt)
func.__name__=attr
return func
}
if(attr=='options')return $Options(self.elt)
if(attr=='style')return $Style(self.elt[attr])
return $B.$JS2Py(self.elt[attr])
}
return $ObjectDict.__getattribute__(self,attr)
}
DOMNode.__getitem__=function(self,key){if(self.elt.nodeType===9){
if(typeof key==="string"){var res=self.elt.getElementById(key)
if(res)return $DOMNode(res)
throw KeyError(key)
}else{try{var elts=self.elt.getElementsByTagName(key.$dict.__name__),res=[]
for(var $i=0;$i<elts.length;$i++)res.push($DOMNode(elts[$i]))
return res
}catch(err){throw KeyError(str(key))
}}}else{return $DOMNode(self.elt.childNodes[key])
}}
DOMNode.__iter__=function(self){
self.$counter=-1
return self
}
DOMNode.__le__=function(self,other){
var elt=self.elt
if(self.elt.nodeType===9){elt=self.elt.body}
if(isinstance(other,$TagSum)){var $i=0
for($i=0;$i<other.children.length;$i++){elt.appendChild(other.children[$i].elt)
}}else if(typeof other==="string" ||typeof other==="number"){var $txt=document.createTextNode(other.toString())
elt.appendChild($txt)
}else{
elt.appendChild(other.elt)
}}
DOMNode.__len__=function(self){return self.elt.childNodes.length}
DOMNode.__mul__=function(self,other){if(isinstance(other,_b_.int)&& other.valueOf()>0){var res=$TagSum()
for(var i=0;i<other.valueOf();i++){var clone=DOMNode.clone(self)()
res.children.push(clone)
}
return res
}
throw _b_.ValueError("can't multiply "+self.__class__+"by "+other)
}
DOMNode.__ne__=function(self,other){return !DOMNode.__eq__(self,other)}
DOMNode.__next__=function(self){self.$counter++
if(self.$counter<self.elt.childNodes.length){return $DOMNode(self.elt.childNodes[self.$counter])
}
throw _b_.StopIteration('StopIteration')
}
DOMNode.__radd__=function(self,other){
var res=$TagSum()
var txt=$DOMNode(document.createTextNode(other))
res.children=[txt,self]
return res
}
DOMNode.__str__=DOMNode.__repr__=function(self){if(self===undefined)return "<class 'DOMNode'>"
var res="<DOMNode object type '"
return res+$NodeTypes[self.elt.nodeType]+"' name '"+self.elt.nodeName+"'>"
}
DOMNode.__setattr__=function(self,attr,value){if(attr.substr(0,2)=='on'){
if(!_b_.bool(value)){
DOMNode.unbind(self,attr.substr(2))
}else{
DOMNode.bind(self,attr.substr(2),value)
}}else{if(DOMNode['set_'+attr]!==undefined){return DOMNode['set_'+attr](self,value)
}
var attr1=attr.replace('_','-').toLowerCase()
if(self.elt[attr1]!==undefined){self.elt[attr1]=value;return}
var res=self.elt.getAttribute(attr1)
if(res!==undefined&&res!==null){self.elt.setAttribute(attr1,value)}
else{self.elt[attr]=value
}}}
DOMNode.__setitem__=function(self,key,value){self.elt.childNodes[key]=value}
DOMNode.bind=function(self,event){
var _id
if(self.elt.nodeType===9){_id=0}
else{_id=self.elt.$brython_id}
var ix=$B.events.$keys.indexOf(_id)
if(ix===-1){$B.events.$keys.push(_id)
$B.events.$values.push(dict())
ix=$B.events.$keys.length-1
}
var ix_event=$B.events.$values[ix].$keys.indexOf(event)
if(ix_event==-1){$B.events.$values[ix].$keys.push(event)
$B.events.$values[ix].$values.push([])
ix_event=$B.events.$values[ix].$values.length-1
}
for(var i=2;i<arguments.length;i++){var func=arguments[i]
var callback=(function(f){return function(ev){try{return f($DOMEvent(ev))
}catch(err){getattr(__BRYTHON__.stderr,"write")(err.__name__+': '+err.message+'\n'+err.info)
}}}
)(func)
if(window.addEventListener){self.elt.addEventListener(event,callback,false)
}else if(window.attachEvent){self.elt.attachEvent("on"+event,callback)
}
$B.events.$values[ix].$values[ix_event].push([func,callback])
}}
DOMNode.children=function(self){var res=[]
for(var i=0;i<self.elt.childNodes.length;i++){res.push($DOMNode(self.elt.childNodes[i]))
}
return res
}
DOMNode.clear=function(self){
var elt=self.elt
if(elt.nodeType==9){elt=elt.body}
for(var i=elt.childNodes.length-1;i>=0;i--){elt.removeChild(elt.childNodes[i])
}}
DOMNode.Class=function(self){if(self.elt.className !==undefined)return self.elt.className
return None
}
DOMNode.class_name=function(self){return DOMNode.Class(self)}
DOMNode.clone=function(self){res=$DOMNode(self.elt.cloneNode(true))
res.elt.$brython_id=Math.random().toString(36).substr(2,8)
var ix_elt=$B.events.$keys.indexOf(self.elt.$brython_id)
if(ix_elt!=-1){var events=$B.events.$values[ix_elt]
for(var i=0;i<events.$keys.length;i++){var event=events.$keys[i]
for(var j=0;j<events.$values[i].length;j++){DOMNode.bind(res,event,events.$values[i][j][0])
}}}
return res
}
DOMNode.focus=function(self){return(function(obj){return function(){
setTimeout(function(){obj.focus();},10)
}})(self.elt)
}
DOMNode.get=function(self){
var obj=self.elt
var args=[]
for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
var $ns=$B.$MakeArgs('get',args,[],[],null,'kw')
var $dict={}
for(var i=0;i<$ns['kw'].$keys.length;i++){$dict[$ns['kw'].$keys[i]]=$ns['kw'].$values[i]
}
if($dict['name']!==undefined){if(obj.getElementsByName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by name")
}
var res=[]
var node_list=document.getElementsByName($dict['name'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res.push($DOMNode(node_list[i]))
}
if($dict['tag']!==undefined){if(obj.getElementsByTagName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by tag name")
}
var res=[]
var node_list=document.getElementsByTagName($dict['tag'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res.push($DOMNode(node_list[i]))
}
if($dict['classname']!==undefined){if(obj.getElementsByClassName===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by class name")
}
var res=[]
var node_list=document.getElementsByClassName($dict['classname'])
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)res.push($DOMNode(node_list[i]))
}
if($dict['id']!==undefined){if(obj.getElementById===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by id")
}
var id_res=obj.getElementById($dict['id'])
if(!id_res)return[]
return[$DOMNode(id_res)]
}
if($dict['selector']!==undefined){if(obj.querySelectorAll===undefined){throw _b_.TypeError("DOMNode object doesn't support selection by selector")
}
var node_list=obj.querySelectorAll($dict['selector'])
var sel_res=[]
if(node_list.length===0)return[]
for(var i=0;i<node_list.length;i++)sel_res.push($DOMNode(node_list[i]))
if(res===undefined)return sel_res
var to_delete=[]
for(var i=0;i<res.length;i++){var elt=res[i]
flag=false
for(var j=0;j<sel_res.length;j++){if(elt.__eq__(sel_res[j])){flag=true;break}}
if(!flag){to_delete.push(i)}}
for(var i=to_delete.length-1;i>=0;i--)res.splice(to_delete[i],1)
}
return res
}
DOMNode.getContext=function(self){
if(!('getContext' in self.elt)){throw _b_.AttributeError("object has no attribute 'getContext'")
}
var obj=self.elt
return function(ctx){return JSObject(obj.getContext(ctx))}}
DOMNode.getSelectionRange=function(self){
if(self.elt['getSelectionRange']!==undefined){return self.elt.getSelectionRange.apply(null,arguments)
}}
DOMNode.height=function(self){return _b_.int($getPosition(self.elt)["height"])
}
DOMNode.html=function(self){return self.elt.innerHTML}
DOMNode.left=function(self){return _b_.int($getPosition(self.elt)["left"])
}
DOMNode.id=function(self){if(self.elt.id !==undefined)return self.elt.id
return None
}
DOMNode.options=function(self){
return new $OptionsClass(self.elt)
}
DOMNode.parent=function(self){if(self.elt.parentElement)return $DOMNode(self.elt.parentElement)
return None
}
DOMNode.remove=function(self,child){
var elt=self.elt,flag=false,ch_elt=child.elt
if(self.elt.nodeType==9){elt=self.elt.body}
while(ch_elt.parentElement){if(ch_elt.parentElement===elt){elt.removeChild(ch_elt)
flag=true
break
}else{ch_elt=ch_elt.parentElement}}
if(!flag){throw _b_.ValueError('element '+child+' is not inside '+self)}}
DOMNode.top=function(self){return _b_.int($getPosition(self.elt)["top"])
}
DOMNode.reset=function(self){
return function(){self.elt.reset()}}
DOMNode.style=function(self){
self.elt.style.float=self.elt.style.cssFloat ||self.style.styleFloat
return $B.JSObject(self.elt.style)
}
DOMNode.setSelectionRange=function(self){
if(this['setSelectionRange']!==undefined){return(function(obj){return function(){return obj.setSelectionRange.apply(obj,arguments)
}})(this)
}else if(this['createTextRange']!==undefined){return(function(obj){return function(start_pos,end_pos){if(end_pos==undefined){end_pos=start_pos}
var range=obj.createTextRange()
range.collapse(true)
range.moveEnd('character',start_pos)
range.moveStart('character',end_pos)
range.select()
}})(this)
}}
DOMNode.set_class_name=function(self,arg){self.elt.setAttribute('class',arg)
}
DOMNode.set_html=function(self,value){self.elt.innerHTML=str(value)
}
DOMNode.set_style=function(self,style){
if(!_b_.isinstance(style,_b_.dict)){throw TypeError('style must be dict, not '+$B.get_class(style).__name__)
}
for(var i=0;i<style.$keys.length;i++){var key=style.$keys[i],value=style.$values[i]
if(key.toLowerCase()==='float'){self.elt.style.cssFloat=value
self.elt.style.styleFloat=value
}else{switch(key){case 'top':
case 'left':
case 'width':
case 'borderWidth':
if(isinstance(value,_b_.int)){value=value+'px'}}
self.elt.style[key]=value
}}}
DOMNode.set_text=function(self,value){self.elt.innerText=str(value)
self.elt.textContent=str(value)
}
DOMNode.set_value=function(self,value){self.elt.value=str(value)}
DOMNode.submit=function(self){
return function(){self.elt.submit()}}
DOMNode.text=function(self){return self.elt.innerText ||self.elt.textContent}
DOMNode.toString=function(self){if(self===undefined)return 'DOMNode'
return self.elt.nodeName
}
DOMNode.trigger=function(self,etype){
if(self.elt.fireEvent){self.elt.fireEvent('on' + etype)
}else{
var evObj=document.createEvent('Events')
evObj.initEvent(etype,true,false)
self.elt.dispatchEvent(evObj)
}}
DOMNode.unbind=function(self,event){
var _id
if(self.elt.nodeType==9){_id=0}else{_id=self.elt.$brython_id}
var ix_elt=$B.events.$keys.indexOf(_id)
if(ix_elt==-1)return
var ix_event=$B.events.$values[ix_elt].$keys.indexOf(event)
if(ix_event==-1)return
var events=$B.events.$values[ix_elt].$values[ix_event]
if(arguments.length===2){for(var i=0;i<events.length;i++){var callback=events[i][1]
if(window.removeEventListener){self.elt.removeEventListener(event,callback,false)
}else if(window.detachEvent){self.elt.detachEvent(event,callback,false)
}}
$B.events.$values[ix_elt][ix_event]=[]
return
}
for(var i=2;i<arguments.length;i++){var func=arguments[i],flag=false
for(var j=0;j<events.length;j++){if(getattr(func,'__eq__')(events[j][0])){var callback=events[j][1]
if(window.removeEventListener){self.elt.removeEventListener(event,callback,false)
}else if(window.detachEvent){self.elt.detachEvent(event,callback,false)
}
events.splice(j,1)
$B.events.$values[ix_elt][ix_event]=events
flag=true
break
}}
if(!flag){throw KeyError('missing callback for event '+event)}}}
DOMNode.value=function(self){return self.elt.value}
DOMNode.width=function(self){return _b_.int($getPosition(self.elt)["width"])
}
var $QueryDict={__class__:$B.$type,__name__:'query'}
$QueryDict.__contains__=function(self,key){return self._keys.indexOf(key)>-1
}
$QueryDict.__getitem__=function(self,key){
var result=self._values[key]
if(result===undefined)throw KeyError(key)
if(result.length==1)return result[0]
return result
}
var $QueryDict_iterator=$B.$iterator_class('query string iterator')
$QueryDict.__iter__=function(self){return $B.$iterator(self._keys,$QueryDict_iterator)
}
$QueryDict.__mro__=[$QueryDict,$ObjectDict]
$QueryDict.getfirst=function(self,key,_default){
var result=self._values[key]
if(result===undefined){if(_default===undefined)return None
return _default
}
return result[0]
}
$QueryDict.getlist=function(self,key){
var result=self._values[key]
if(result===undefined)return[]
return result
}
$QueryDict.getvalue=function(self,key,_default){try{return self.__getitem__(key)}
catch(err){$B.$pop_exc()
if(_default===undefined)return None
return _default
}}
$QueryDict.keys=function(self){return self._keys}
DOMNode.query=function(self){var res={__class__:$QueryDict,_keys :[],_values :{}}
var qs=location.search.substr(1).split('&')
for(var i=0;i<qs.length;i++){var pos=qs[i].search('=')
var elts=[qs[i].substr(0,pos),qs[i].substr(pos+1)]
var key=decodeURIComponent(elts[0])
var value=decodeURIComponent(elts[1])
if(res._keys.indexOf(key)>-1){res._values[key].push(value)}
else{res._keys.push(key)
res._values[key]=[value]
}}
return res
}
var $TagSumDict={__class__ : $B.$type,__name__:'TagSum'}
$TagSumDict.appendChild=function(self,child){self.children.push(child)
}
$TagSumDict.__add__=function(self,other){if($B.get_class(other)===$TagSumDict){self.children=self.children.concat(other.children)
}else if(isinstance(other,[_b_.str,_b_.int,_b_.float,_b_.dict,_b_.set,_b_.list])){self.children=self.children.concat($DOMNode(document.createTextNode(other)))
}else{self.children.push(other)}
return self
}
$TagSumDict.__mro__=[$TagSumDict,$ObjectDict]
$TagSumDict.__radd__=function(self,other){var res=$TagSum()
res.children=self.children.concat($DOMNode(document.createTextNode(other)))
return res
}
$TagSumDict.__repr__=function(self){var res='<object TagSum> '
for(var i=0;i<self.children.length;i++){res+=self.children[i]
if(self.children[i].toString()=='[object Text]'){res +=' ['+self.children[i].textContent+']\n'}}
return res
}
$TagSumDict.__str__=$TagSumDict.toString=$TagSumDict.__repr__
$TagSumDict.clone=function(self){var res=$TagSum(),$i=0
for($i=0;$i<self.children.length;$i++){res.children.push(self.children[$i].cloneNode(true))
}
return res
}
function $TagSum(){return{__class__:$TagSumDict,children:[],toString:function(){return '(TagSum)'}}}
$TagSum.__class__=$B.$factory
$TagSum.$dict=$TagSumDict
$B.$TagSum=$TagSum 
var $toDOM=function(content){if(isinstance(content,DOMNode))return content
if(isinstance(content,str)){var _dom=document.createElement('div')
_dom.innerHTML=content
return _dom
}
throw Error('Invalid argument' + content)
}
DOMNode.prototype.addClass=function(classname){var _c=this.__getattr__('class')
if(_c===undefined){this.__setattr__('class',classname)
return this
}
this.__setattr__('class',_c + " " + classname)
return this
}
DOMNode.prototype.after=function(content){var _content=$toDOM(content)
if(this.nextSibling !==null){this.parentElement.insertBefore(_content,this.nextSibling)
return this
}
this.parentElement.appendChild(_content)
return this
}
DOMNode.after=function(self,content){var _con
if(isinstance(content,DOMNode)){_con=content.elt
}else{
_con=$toDOM(content)
_con=_con.childNodes[0]
}
if(self.elt.nextSibling !==null){self.elt.parentElement.insertBefore(_con,self.elt.nextSibling)
}else{
self.elt.parentElement.appendChild(_con)
}
return self
}
DOMNode.prototype.append=function(content){var _content=$toDOM(content)
this.appendChild(_content)
return this
}
DOMNode.append=function(self,content){if(isinstance(content,DOMNode)){self.elt.appendChild(content.elt)
}else{
var _content=$toDOM(content)
self.elt.appendChild(_content.childNodes[0])
}
return self
}
DOMNode.prototype.before=function(content){var _content=$toDOM(content)
this.parentElement.insertBefore(_content,this)
return this
}
DOMNode.before=function(self,content){var _con
if(isinstance(content,DOMNode)){_con=content.elt
}else{
_con=$toDOM(content)
_con=_con.childNodes[0]
}
self.elt.parentElement.insertBefore(_con,self.elt)
return self
}
DOMNode.prototype.closest=function(selector){var traverse=function(node,ancestors){if(node===_doc)return None
for(var i=0;i<ancestors.length;i++){if(node===ancestors[i]){return ancestors[i]
}}
return traverse(this.parentElement,ancestors)
}
if(isinstance(selector,str)){var _elements=_doc.get(selector=selector)
return traverse(this,_elements);
}
return traverse(this,selector)
}
DOMNode.prototype.css=function(property,value){if(value !==undefined){this.set_style({property:value})
return this 
}
if(isinstance(property,dict)){
this.set_style(property)
return this
}
if(this.style[property]===undefined){return None}
return this.style[property]
}
DOMNode.prototype.empty=function(){for(var i=0;i <=this.childNodes.length;i++){this.removeChild(this.childNodes[i])
}}
DOMNode.prototype.hasClass=function(name){var _c=this.__getattr__('class')
if(_c===undefined)return false
if(_c.indexOf(name)> -1)return true
return false
}
DOMNode.prototype.prepend=function(content){var _content=$toDOM(content)
this.insertBefore(_content,this.firstChild)
}
DOMNode.prototype.removeAttr=function(name){this.__setattr__(name,undefined)
}
DOMNode.prototype.removeClass=function(name){var _c=this.__getattr__('class')
if(_c===undefined)return
if(_c===name){this.__setattr__('class',undefined)
return
}
_index=_c.indexOf(name)
if(_index==-1)return
var _class_string=_c
if(_index==0){
_class_string=_c.substring(name.length)
}else if(_index==_c.length - name.length){
_class_string=_c.substring(0,_index)
}else{
_class_string=_c.replace(' '+name+' ','')
}
this.__setattr('class',_class_string)
}
var $WinDict={__class__:$B.$type,__name__:'window'}
$WinDict.__getattribute__=function(self,attr){if(window[attr]!==undefined){return JSObject(window[attr])}
throw _b_.AttributeError("'window' object has no attribute '"+attr+"'")
}
$WinDict.__setattr__=function(self,attr,value){console.log('set attr '+attr+' of window ')
window[attr]=value
console.log(window[attr])
}
$WinDict.__mro__=[$WinDict,$ObjectDict]
var win=JSObject(window)
win.get_postMessage=function(msg,targetOrigin){if(isinstance(msg,dict)){var temp={__class__:'dict'}
for(var i=0;i<msg.__len__();i++)temp[msg.$keys[i]]=msg.$values[i]
msg=temp
}
return window.postMessage(msg,targetOrigin)
}
$B.DOMNode=DOMNode
$B.$DOMNode=$DOMNode
$B.win=win
})(__BRYTHON__)
;(function($B){var _b_=$B.builtins
function import_hooks(mod_name,origin,package){var module={name:mod_name,__class__:$B.$ModuleDict}
$B.$import('sys','__main__')
var $globals=$B.vars['__main__']
var sys=$globals['sys']
var _meta_path=_b_.getattr(sys,'meta_path')
var _path=_b_.getattr(sys,'path')
for(var i=0,_len_i=_meta_path.length;i < _len_i;i++){var _mp=_meta_path[i]
for(var j=0,_len_j=_path.length;j < _len_j;j++){try{
var _finder=_b_.getattr(_mp,'__call__')(mod_name,_path[j])
var _loader=_b_.getattr(_b_.getattr(_finder,'find_module'),'__call__')()
}catch(e){if(e.__name__=='ImportError'){
continue
}else{
throw e
}}
if(_loader==_b_.None)continue 
return _b_.getattr(_b_.getattr(_loader,'load_module'),'__call__')(mod_name)
}
}
return null
}
window.import_hooks=import_hooks
})(__BRYTHON__)
